#!/bin/bash
# Runs the measurement matrix headless on one adapter. Usage:
#   run-matrix.sh <image> <icd-json> <outdir-suffix> [extra docker args, e.g. --device nvidia.com/gpu=0]
# Results: evidence/runs/<suffix>/*.json and matrix.log
set -eu
IMAGE="$1"; ICD="$2"; SUFFIX="$3"; shift 3
EXTRA=("$@")   # the extra docker arguments; inside run() "$@" would be the function's own arguments
L="$(cd "$(dirname "$0")/.." && pwd)"   # this folder
OUT="$L/evidence/runs/$SUFFIX"
mkdir -p "$OUT"
LOG="$OUT/matrix.log"
: > "$LOG"
run() {
  name="$1"; shift
  start=$(date -u +%FT%TZ)
  docker run --rm --network none --ulimit core=0 --cpus 4 --user 1000:1000 \
    -e HOME=/tmp -e DENO_DIR=/tmp/deno -e VK_ICD_FILENAMES="$ICD" "${EXTRA[@]}" \
    -v "$L":"$L" -w "$L" "$IMAGE" \
    deno run --allow-read --allow-write run.js --quiet --out "$OUT/$name.json" --label "$SUFFIX/$name" \
    $ARGS >> "$LOG" 2>&1 || echo "FAILED $name" >> "$LOG"
  echo "$start .. $(date -u +%FT%TZ) $name" >> "$OUT/timing.txt"
}
SEEDS=10
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear --evict decay --arms baseline,control,contrastive,both,ctrl-nomem,ctrl-scrambled,ctrl-randomneg"; run A-markov-b18-decay
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear --evict fifo --arms baseline,control,contrastive,both"; run B-markov-b18-fifo
ARGS="--seeds $SEEDS --task markov --beta 8 --fusion logratio --kinds flat_linear --evict decay --arms baseline,control,contrastive,both,ctrl-randomneg"; run C-markov-b8-decay
ARGS="--seeds $SEEDS --task uniform --beta 18 --fusion logratio --kinds flat_linear --evict decay --arms baseline,control,contrastive,both,ctrl-nomem,ctrl-scrambled,ctrl-randomneg"; run D-uniform-b18-decay
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear,recursive_inverted,anti_swiglu_gate,anti_tanh_flat,multi_slab_parallel --evict decay --arms contrastive,both"; run E-kinds-markov-b18
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion diff,mass --kinds flat_linear --evict decay --arms contrastive,both"; run F-decisors-markov-b18
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear --lambda 0.5,2 --evict decay --arms contrastive,both"; run G-lambda-markov-b18
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear --negwrite always --evict decay --arms contrastive,both"; run H-negwrite-always-markov-b18
ARGS="--seeds $SEEDS --task markov --beta 18 --fusion logratio --kinds flat_linear --negunlearn off --evict decay --arms contrastive,both"; run I-nounlearn-markov-b18
echo "MATRIX DONE $(date -u +%FT%TZ)" >> "$LOG"
