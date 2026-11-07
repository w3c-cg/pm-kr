#!/bin/bash
# The side-by-side comparison: Dave's DSL threshold and his adaptive threshold against Daniel's negative memory and live tuner, same seeds, RTX 3060, counters on every arm.
# IMAGE: a container image with Deno 2.9.8, mesa-vulkan-drivers (lavapipe) and, for an NVIDIA GPU through CDI, libglvnd0, libegl1, libgl1, libx11-6 and libxext6.
set -eu
L="$(cd "$(dirname "$0")/.." && pwd)"   # this folder
OUT="$L/evidence/runs/compare"; mkdir -p "$OUT"
run() { name="$1"; shift; [ -s "$OUT/$name.json" ] && { echo "skip $name (exists)" >> "$OUT/matrix.log"; return; }; start=$(date -u +%FT%TZ)
  docker run --rm --network none --ulimit core=0 --cpus 4 --user 1000:1000 -e HOME=/tmp -e DENO_DIR=/tmp/deno \
    -e VK_ICD_FILENAMES=/etc/vulkan/icd.d/nvidia_icd.json --device nvidia.com/gpu=0 -v "$L":"$L" -w "$L" "${IMAGE:-deno-vulkan}" \
    deno run --allow-read --allow-write run.js --quiet --out "$OUT/$name.json" --label "compare/$name" --seeds 10 "$@" >> "$OUT/matrix.log" 2>&1 || echo "FAILED $name" >> "$OUT/matrix.log"
  echo "$start .. $(date -u +%FT%TZ) $name" >> "$OUT/timing.txt"; }
PLAIN=baseline,control,tuner,both,tuner-contrastive,ctrl-nomem,ctrl-scrambled,ctrl-randomneg
KINDS=flat_linear,recursive_inverted,anti_swiglu_gate,anti_tanh_flat,multi_slab_parallel
for T in "markov --task markov" "uniform --task uniform" "fairK1 --task cycle --confuser 3" "fairK2 --task cycle --confuser 3 --betaneg 54 --set alpha=0.5" "fairK3 --task markov --confuser 3 --betaneg 54 --set alpha=0.5" "fairK4 --task cycle --confuser 3 --beta 8 --betaneg 54 --set alpha=0.5"; do
  set -- $T; name=$1; shift
  run "$name-plain"   "$@" --kinds flat_linear --arms $PLAIN
  run "$name-abstain" "$@" --kinds flat_linear --set abstain=true --arms baseline,both,tuner-contrastive
done
run "markov-kinds"  --task markov  --kinds $KINDS --arms contrastive
run "uniform-kinds" --task uniform --kinds $KINDS --arms contrastive
echo "COMPARE DONE $(date -u +%FT%TZ)" >> "$OUT/matrix.log"
