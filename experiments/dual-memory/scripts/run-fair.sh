#!/bin/bash
# The fair test for the negative memory: a confuser pattern sharing the middle of the target, and a deterministic background. RTX 3060.
# IMAGE: a container image with Deno 2.9.8, mesa-vulkan-drivers (lavapipe) and, for an NVIDIA GPU through CDI, libglvnd0, libegl1, libgl1, libx11-6 and libxext6.
set -eu
L="$(cd "$(dirname "$0")/.." && pwd)"   # this folder
OUT="$L/evidence/runs/fair"; mkdir -p "$OUT"
run() { name="$1"; shift; start=$(date -u +%FT%TZ)
  docker run --rm --network none --ulimit core=0 --cpus 4 --user 1000:1000 -e HOME=/tmp -e DENO_DIR=/tmp/deno \
    -e VK_ICD_FILENAMES=/etc/vulkan/icd.d/nvidia_icd.json --device nvidia.com/gpu=0 -v "$L":"$L" -w "$L" "${IMAGE:-deno-vulkan}" \
    deno run --allow-read --allow-write run.js --quiet --out "$OUT/$name.json" --label "fair/$name" --seeds 10 "$@" >> "$OUT/matrix.log" 2>&1 || echo "FAILED $name" >> "$OUT/matrix.log"
  echo "$start .. $(date -u +%FT%TZ) $name" >> "$OUT/timing.txt"; }
ALL=baseline,control,contrastive,both,ctrl-nomem,ctrl-scrambled,ctrl-randomneg
run K1-cycle-conf3-a03-b18        --task cycle  --confuser 3 --beta 18 --arms $ALL
run K2-cycle-conf3-a05-b18-bn54   --task cycle  --confuser 3 --beta 18 --betaneg 54 --set alpha=0.5 --arms $ALL
run K3-markov-conf3-a05-b18-bn54  --task markov --confuser 3 --beta 18 --betaneg 54 --set alpha=0.5 --arms $ALL
run K4-cycle-conf3-a05-b8-bn54    --task cycle  --confuser 3 --beta 8  --betaneg 54 --set alpha=0.5 --arms baseline,control,contrastive,both
run K5-cycle-noconf-a05-b18       --task cycle  --confuser 0 --beta 18 --set alpha=0.5 --arms baseline,control,contrastive,both
run K6-cycle-conf3-a05-b18-bn18   --task cycle  --confuser 3 --beta 18 --set alpha=0.5 --arms contrastive,both
run K7-cycle-conf3-a05-b18-bn54-um095 --task cycle --confuser 3 --beta 18 --betaneg 54 --unlearnmin 0.95 --set alpha=0.5 --arms contrastive,both
echo "FAIR DONE $(date -u +%FT%TZ)" >> "$OUT/matrix.log"
