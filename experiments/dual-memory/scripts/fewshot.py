#!/usr/bin/env python3
"""The few-shot view: exposures to acquisition for every arm on every background, from the existing JSON.

usage: python3 -I fewshot.py <compare dir> <fair dir> > harness/fewshot.md
Exposures to acquisition = the first exposure (1-based) at which both pattern positions whose context carries the pattern
were predicted right, within the 8 exposures of the acquisition phase; 16 means never within those 8. Means over 10 seeds.
Chance for one position is 1/16, so a chance learner almost never reaches it.
"""
import json
import math
import sys
from pathlib import Path

ARM_LABEL = {
    "baseline": "Dave, DSL threshold 1.0 (fixed)",
    "control": "Dave, adaptive threshold θ (his intro; realised as mean + one sd)",
    "tuner": "open live tuner (Daniel)",
    "contrastive": "W- on the fixed 1.0",
    "both": "Dave adaptive θ + W-",
    "tuner-contrastive": "tuner + W-",
    "ctrl-nomem": "control: no memory",
    "ctrl-scrambled": "control: scrambled pattern",
    "ctrl-randomneg": "control: random negatives",
}
TASK_LABEL = {
    "markov": "Markov background (his intro)",
    "uniform": "uniform background (his generator)",
    "fairK1": "deterministic cycle + confuser, same read for both memories",
    "fairK2": "deterministic cycle + confuser, sharper negative read",
    "fairK3": "Markov + confuser, sharper negative read",
    "fairK4": "deterministic cycle + confuser, soft positive read (beta 8), sharper negative read",
}


def exposures(r, kacq=8):
    for k, acc in enumerate(r["curve"][:kacq]):
        if acc[1] == 1 and acc[2] == 1:
            return k + 1
    return 16


def mean(xs):
    return sum(xs) / len(xs) if xs else float("nan")


def load_plain(compare_dir):
    rows = {}
    for f in sorted(Path(compare_dir).glob("*-plain.json")):
        task = f.stem.replace("-plain", "")
        data = json.loads(f.read_text())
        for r in data["runs"]:
            if r.get("abstain"):
                continue
            rows.setdefault(task, {}).setdefault(r["arm"], []).append(exposures(r))
    # the W- fixed-gate arm comes from the kinds blocks (flat_linear) and from the fair blocks
    for f in sorted(Path(compare_dir).glob("*-kinds.json")):
        task = f.stem.replace("-kinds", "")
        data = json.loads(f.read_text())
        for r in data["runs"]:
            if r["negKind"] == "flat_linear":
                rows.setdefault(task, {}).setdefault("contrastive", []).append(exposures(r))
    return rows


def load_fair(fair_dir):
    rows = {}
    names = {"K1-cycle-conf3-a03-b18": "fairK1", "K2-cycle-conf3-a05-b18-bn54": "fairK2", "K3-markov-conf3-a05-b18-bn54": "fairK3", "K4-cycle-conf3-a05-b8-bn54": "fairK4"}
    for f in sorted(Path(fair_dir).glob("*.json")):
        task = names.get(f.stem)
        if not task:
            continue
        data = json.loads(f.read_text())
        for r in data["runs"]:
            if r["arm"] == "contrastive":
                rows.setdefault(task, {}).setdefault("contrastive", []).append(exposures(r))
    return rows


def main(compare_dir, fair_dir):
    rows = load_plain(compare_dir)
    for task, arms in load_fair(fair_dir).items():
        for arm, xs in arms.items():
            rows.setdefault(task, {}).setdefault(arm, []).extend(xs)
    arms = ["baseline", "control", "tuner", "contrastive", "both", "tuner-contrastive", "ctrl-nomem", "ctrl-scrambled", "ctrl-randomneg"]
    print("## Few-shot view: how many showings until it holds")
    print()
    print("Exposures to acquisition: the first exposure, counted from 1, at which both pattern positions whose context carries the pattern were predicted right, within the 8 exposures of the acquisition phase; 16 means never within those 8. Means over 10 seeds, the same seeds for every arm, from the runs in the tables above. A learner at chance (1 in 16 per position) almost never reaches it, which is what the three controls show. One showing is the minimum: the first exposure can only be stored, the second is the first that can be predicted, so 2.0 is a true one-shot learner.")
    print()
    print("| background | " + " | ".join(ARM_LABEL[a] for a in arms) + " |")
    print("|---|" + "---|" * len(arms))
    for task in ["markov", "uniform", "fairK1", "fairK2", "fairK3", "fairK4"]:
        if task not in rows:
            continue
        cells = []
        for a in arms:
            xs = rows[task].get(a)
            cells.append(f"{mean(xs):.1f}" if xs else "-")
        print(f"| {TASK_LABEL.get(task, task)} | " + " | ".join(cells) + " |")
    print()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
