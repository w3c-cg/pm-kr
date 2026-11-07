#!/usr/bin/env python3
"""The side-by-side table: Dave's DSL threshold and his adaptive threshold against Daniel's negative memory and live tuner, same seeds.

usage: python3 -I compare.py <runs dir> [<runs dir> ...]
Columns: 1-shot (p2,p3), acq k2-7, FRS, ambient, exposures to acquisition (first exposure with p2 and p3 right; 16 = never),
confident mistakes per 1000 steps, abstentions per 1000, why-not precision (chance 15/16 = 93.75%).
"""
import json
import math
import sys
from pathlib import Path


def load(dirs):
    rows = []
    for d in dirs:
        for f in sorted(Path(d).glob("*.json")):
            if "MISLABELLED" in f.name:
                continue
            data = json.loads(f.read_text())
            for r in data["runs"]:
                r["block"] = f.stem
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
    return "nan" if (x is None or (isinstance(x, float) and math.isnan(x))) else f"{100 * x:.0f}"


def f2(x):
    return "nan" if (x is None or (isinstance(x, float) and math.isnan(x))) else f"{x:.2f}"


def exposures_to_acq(r, kacq=8):
    for k, acc in enumerate(r["curve"][:kacq]):
        if acc[1] == 1 and acc[2] == 1:
            return k + 1
    return 16


def label(r):
    a = r["arm"]
    if a == "contrastive":
        a = f"W- {r['negKind']}"
    elif a == "both":
        a = "Dave adaptive θ + W- flat"
    elif a == "control":
        a = "Dave, adaptive threshold θ (his intro; realised as mean + one sd)"
    elif a == "tuner":
        a = "open live tuner (Daniel)"
    elif a == "tuner-contrastive":
        a = "tuner + W- flat"
    elif a == "baseline":
        a = "Dave, DSL threshold 1.0 (fixed)"
    elif a == "ctrl-nomem":
        a = "control: no memory"
    elif a == "ctrl-scrambled":
        a = "control: scrambled pattern"
    elif a == "ctrl-randomneg":
        a = "control: random negatives"
    if r.get("abstain"):
        a += " + abstain"
    return a


def task_label(r):
    t = r["task"]
    if r.get("confuserCount", 0):
        t += f" + confuser x{r['confuserCount']}"
    bn = r.get("betaNeg", 0)
    if bn:
        t += f", beta_neg {bn}"
    return t


def main(dirs):
    rows = load(dirs)
    groups = {}
    for r in rows:
        key = (r["block"].split("-")[0], task_label(r), label(r))
        groups.setdefault(key, []).append(r)
    print("| block | task | arm | n | 1-shot (p2,p3) | acq k2-7 +- sd | FRS (n) | ambient | exposures to acq | confident mistakes /1000 | abstentions /1000 | why-not precision (chance 94) |")
    print("|---|---|---|---|---|---|---|---|---|---|---|---|")
    order = {"Dave, DSL threshold 1.0 (fixed)": 0, "Dave, adaptive threshold θ (his intro; realised as mean + one sd)": 1, "open live tuner (Daniel)": 2}
    for key, rs in sorted(groups.items(), key=lambda kv: (kv[0][0], kv[0][1], order.get(kv[0][2], 5), kv[0][2])):
        frs = [r["frs"] for r in rs if isinstance(r["frs"], (int, float)) and not math.isnan(r["frs"])]
        cw = mean([r.get("confWrongPer1000", float("nan")) for r in rs])
        ab = mean([r.get("abstainedPer1000", float("nan")) for r in rs])
        wn = mean([r.get("whyNotPrecision", float("nan")) for r in rs])
        print(f"| {key[0]} | {key[1]} | {key[2]} | {len(rs)} | {pct(mean([r['oneShot23'] for r in rs]))} | {pct(mean([r['acq27'] for r in rs]))} +- {pct(sd([r['acq27'] for r in rs]))} | "
              f"{f2(mean(frs))} ({len(frs)}) | {pct(mean([r['ambientAcc'] for r in rs]))} | {mean([exposures_to_acq(r) for r in rs]):.1f} | "
              f"{'nan' if math.isnan(cw) else f'{cw:.1f}'} | {'nan' if math.isnan(ab) else f'{ab:.0f}'} | {pct(wn) if not math.isnan(wn) else '-'} |")


if __name__ == "__main__":
    main(sys.argv[1:])
