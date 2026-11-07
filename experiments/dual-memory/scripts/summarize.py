#!/usr/bin/env python3
"""Aggregate the harness result blocks into markdown tables for the report.

usage: python3 -I summarize.py <runs dir> [<second runs dir for a cross-adapter check>]
"""
import json
import math
import sys
from pathlib import Path


def load(d):
    rows = []
    for f in sorted(Path(d).glob("*.json")):
        data = json.loads(f.read_text())
        for r in data["runs"]:
            r["block"] = f.stem
            r["adapter"] = (data.get("adapter") or {}).get("description", "?")
            rows.append(r)
    return rows


def mean(xs):
    xs = [x for x in xs if isinstance(x, (int, float)) and not (isinstance(x, float) and math.isnan(x))]
    return sum(xs) / len(xs) if xs else float("nan")


def sd(xs):
    xs = [x for x in xs if isinstance(x, (int, float)) and not (isinstance(x, float) and math.isnan(x))]
    if len(xs) < 2:
        return float("nan")
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def pct(x):
    return "nan" if (x is None or (isinstance(x, float) and math.isnan(x))) else f"{100 * x:.1f}"


def f2(x):
    return "nan" if (x is None or (isinstance(x, float) and math.isnan(x))) else f"{x:.2f}"


def key(r):
    return (r["block"], r["task"], r["beta"], r["negKind"], r["lambda"], r["fusion"], r["negWrite"], r["evict"], r["arm"])


def group(rows):
    g = {}
    for r in rows:
        g.setdefault(key(r), []).append(r)
    return g


def table(rows, title):
    print(f"\n### {title}\n")
    print("| block | task | beta | kind | lambda | decisor | neg write | evict | arm | n | 1-shot p1 | p2 | p3 | 1-shot (p2,p3) +- sd | acq k2-7 +- sd | FRS +- sd (n) | ambient | surprise | writes+ | writes- | steps/s |")
    print("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    for k, rs in sorted(group(rows).items()):
        block, task, beta, kind, lam, fusion, negw, evict, arm = k
        frs = [r["frs"] for r in rs if isinstance(r["frs"], (int, float)) and not math.isnan(r["frs"])]
        print(f"| {block} | {task} | {beta} | {kind} | {lam} | {fusion} | {negw} | {evict} | {arm} | {len(rs)} | "
              f"{pct(mean([r['oneShot'][0] for r in rs]))} | {pct(mean([r['oneShot'][1] for r in rs]))} | {pct(mean([r['oneShot'][2] for r in rs]))} | "
              f"{pct(mean([r['oneShot23'] for r in rs]))} +- {pct(sd([r['oneShot23'] for r in rs]))} | "
              f"{pct(mean([r['acq27'] for r in rs]))} +- {pct(sd([r['acq27'] for r in rs]))} | "
              f"{f2(mean(frs))} +- {f2(sd(frs))} ({len(frs)}) | {pct(mean([r['ambientAcc'] for r in rs]))} | {f2(mean([r['emaBg'] for r in rs]))} | "
              f"{mean([r['writesP'] for r in rs]):.0f} | {mean([r['writesN'] for r in rs]):.0f} | {mean([r['stepsPerSec'] for r in rs]):.0f} |")


def two_by_two(rows):
    print("\n### 2x2 (differences from the baseline, in points of accuracy; FRS as a ratio)\n")
    print("| block | task | beta | kind | lambda | decisor | neg write | evict | metric | baseline | control | contrastive | both | sum of singles | synergy |")
    print("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
    by = {}
    for k, rs in group(rows).items():
        by.setdefault(k[:-1], {})[k[-1]] = rs
    for k, arms in sorted(by.items()):
        if not all(a in arms for a in ("baseline", "control", "contrastive", "both")):
            continue
        for metric, fmt, scale in (("oneShot23", pct, 1), ("acq27", pct, 1), ("frs", f2, 1)):
            m = {a: mean([r[metric] for r in arms[a]]) for a in ("baseline", "control", "contrastive", "both")}
            b = m["baseline"]
            c, kk, both = m["control"] - b, m["contrastive"] - b, m["both"] - b
            print(f"| {' | '.join(str(x) for x in k)} | {metric} | {fmt(b)} | {fmt(c)} | {fmt(kk)} | {fmt(both)} | {fmt(c + kk)} | {fmt(both - c - kk)} |")


def cross(a, b, na, nb):
    print(f"\n### Cross-adapter check: {na} against {nb}, same seed, same arm\n")
    ia = {(r["block"], r["task"], r["beta"], r["negKind"], r["lambda"], r["fusion"], r["negWrite"], r["evict"], r["arm"], r["seed"]): r for r in a}
    ib = {(r["block"], r["task"], r["beta"], r["negKind"], r["lambda"], r["fusion"], r["negWrite"], r["evict"], r["arm"], r["seed"]): r for r in b}
    common = sorted(set(ia) & set(ib))
    same_hits = sum(1 for k in common if ia[k]["oneShot"] == ib[k]["oneShot"] and ia[k]["curve"] == ib[k]["curve"])
    same_writes = sum(1 for k in common if ia[k]["writesP"] == ib[k]["writesP"] and ia[k]["writesN"] == ib[k]["writesN"])
    d_acq = [abs(ia[k]["acq27"] - ib[k]["acq27"]) for k in common]
    d_amb = [abs(ia[k]["ambientAcc"] - ib[k]["ambientAcc"]) for k in common]
    print(f"- runs in common: {len(common)}")
    print(f"- identical acquisition curves (every exposure, every position): {same_hits} of {len(common)}")
    print(f"- identical write counts: {same_writes} of {len(common)}")
    print(f"- mean absolute difference, acq k2-7: {pct(mean(d_acq))} points; ambient accuracy: {pct(mean(d_amb))} points; largest acq difference: {pct(max(d_acq) if d_acq else float('nan'))}")
    speed_a = mean([ia[k]["stepsPerSec"] for k in common]); speed_b = mean([ib[k]["stepsPerSec"] for k in common])
    print(f"- mean steps/s: {na} {speed_a:.0f}, {nb} {speed_b:.0f}")


if __name__ == "__main__":
    a = load(sys.argv[1])
    table(a, f"All arms, {Path(sys.argv[1]).name} ({len(a)} runs)")
    two_by_two(a)
    if len(sys.argv) > 2:
        b = load(sys.argv[2])
        table(b, f"All arms, {Path(sys.argv[2]).name} ({len(b)} runs)")
        two_by_two(b)
        cross(a, b, Path(sys.argv[1]).name, Path(sys.argv[2]).name)
