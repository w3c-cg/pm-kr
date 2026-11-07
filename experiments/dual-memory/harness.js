// Dual memory with a contrastive negative memory, as WebGPU compute shaders.
//
// The task, the DSL notation and the two metrics (1-shot acquisition, forgetting
// resistance) follow Dave Raggett's dual-memory demo (W3C Cognitive AI,
// https://www.w3.org/Data/cogai/dual-memory/). The code here is our own.
// The negative memory and the three-dispatch pattern (positive, negative,
// fusion) follow Daniel Campos Ramos's W- contrastive formulation.
//
// Everything runs on the GPU: the symbol stream, the state, both memories,
// the writes and the metrics. Nothing is read back until a run ends.
// The same module runs in a page (index.html) and headless in Deno (run.js).

export const V = 16;        // symbols
export const D = 32;        // state size
export const KMAX = 64;     // exposures the metrics buffer can hold
export const TRACE_EVERY = 100;

export const NEG_KINDS = ["flat_linear", "recursive_inverted", "anti_swiglu_gate", "anti_tanh_flat", "multi_slab_parallel"];
// The decisor that fuses the positive evidence m+ and the negative evidence m- for each symbol:
//   diff:     s+ - lambda * pen               (normalized votes; collapses where right and wrong are balanced)
//   mass:     m+ - lambda * m-                 (raw vote masses)
//   logratio: log(m+ + eps) - lambda * log(m- + negPrior)   (an energy difference; neutral where right and wrong balance,
//             and the prior count negPrior keeps "nothing known" below "known right as often as wrong")
export const FUSIONS = ["diff", "mass", "logratio"];
// When a negative (context, hard alternative) is written:
//   gated:  only at steps where the positive consolidation gate fires too (surprise > theta): both memories see the same events
//   always: at every step the hinge margin is unmet (in a balanced stochastic context this writes a negative on every visit and poisons it)
export const NEG_WRITES = ["gated", "always"];

// flags
export const F_MEM = 1, F_CONTRASTIVE = 2, F_CONTROL = 4, F_SCRAMBLED = 8, F_RANDOMNEG = 16, F_EVICT_DECAY = 32, F_NEG_UNLEARN = 64, F_TUNER = 128, F_ABSTAIN = 256;

export const defaultConfig = {
  seed: 1,
  task: "markov",          // "uniform": i.i.d. background as Dave's generator.js does; "markov": the Markov background his intro describes; "cycle": a deterministic permutation, one successor per symbol
  negKind: "flat_linear",
  fusion: "logratio",
  negWrite: "gated",
  negUnlearn: true,        // the hinge's other half: a negative that votes for the truth at this context is removed (E(correct) goes down)
  unlearnMin: 0.5,         // only a negative whose retrieval weight here is at least this fraction of an exact match is removed (near-exact context)
  memory: true,
  contrastive: false,
  control: false,
  tuner: false,            // the open live tuner: a write-rate controller on theta and a branch-comparison controller on lambda, per step on the GPU
  tuneBudget: 0.08,        // target writes per step
  tuneRate: 0.01,          // EMA rate of the tuner's signals
  tuneStep: 0.02,          // nudge per step on theta (absolute) and lambda (relative)
  lambdaMax: 2.0,
  abstain: false,          // Chow's reject rule: answer only when the best probability reaches abstainMin, otherwise say "not sure"
  abstainMin: 0.35,        // Chow's threshold; 0.5 abstained on 98% of steps in the Markov task, whose two likely successors sit at 0.45
  scrambled: false,
  randomNeg: false,
  evict: "decay",          // "decay" uses the DSL's decay as slot strength; "fifo" is a ring
  Cp: 2048,                // positive memory slots (the key carries two symbols of context; the first-order ambient alone needs about 16*16*2 slots)
  Cn: 6144,                // negative memory slots, 3x the positive
  cadence: 500,            // pattern injected every 500 steps, as in generator.js
  Kacq: 8,                 // exposures with the pattern
  Kgap: 4,                 // exposures of background only (forgetting gap)
  Kprobe: 4,               // exposures with the pattern again
  beta: 18.0,              // retrieval sharpness, Dave's beta
  betaNeg: 0,              // sharpness of the negative read; 0 means the same beta (a sharper negative read cuts neighbour leakage)
  lambda: 1.0,             // weight of the negative term in the fusion
  gamma: 4.0,              // scale inside the bounded negative kinds
  theta: 1.0,              // fixed surprise threshold, Dave's threshold
  kappa: 1.0,              // adaptive threshold: theta = mean + kappa * sd
  alpha: 0.3,              // state carry: h = alpha*h + (1-alpha)*E[s]
  decay: 0.01,             // slot strength decay per step, Dave's decay
  eps: 1e-3,
  emaRate: 0.02,
  margin: 1.0,             // negative write hinge margin, in log-mass units: write (context, hard) until log m-(hard) exceeds log m-(truth) by this
  negPrior: 1.0,           // prior count in the negative energy of the logratio decisor
  pattern: [3, 7, 12, 5],  // Dave's rare pattern
  confuser: [8, 7, 12, 9], // a second pattern sharing the middle of the target: at the target's context the positive memory's best wrong alternative becomes a stable fact
  confuserCount: 0,        // injections of the confuser per cycle, spread between the target's injections (0 = none)
  markovLikely: 0.45,      // two likely successors per symbol in the markov task
};

export function stepsOf(cfg) {
  return (cfg.Kacq + cfg.Kgap + cfg.Kprobe) * cfg.cadence;
}

// Host-side PRNG shared by page and Deno so a seed gives the same E and Markov rows everywhere.
export function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function seededRng(seed, salt) {
  const r = sfc32(0x9E3779B9 ^ seed, 0x243F6A88 ^ salt, 0xB7E15162 ^ (seed * 7919), 0x6A09E667 ^ (salt * 104729));
  for (let i = 0; i < 12; i++) r();
  return r;
}

export function makeEmbedding(seed) {
  const r = seededRng(seed, 11);
  const E = new Float32Array(V * D);
  for (let s = 0; s < V; s++) {
    let n = 0;
    for (let d = 0; d < D; d++) {
      // Box-Muller
      const u1 = Math.max(r(), 1e-12), u2 = r();
      const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      E[s * D + d] = g; n += g * g;
    }
    n = Math.sqrt(n);
    for (let d = 0; d < D; d++) E[s * D + d] /= n;
  }
  return E;
}

// Cumulative transition rows for the markov task. Pattern transitions are never among the likely ones.
export function makeMarkovRows(seed, cfg) {
  const r = seededRng(seed, 23);
  const rows = new Float32Array(V * V);
  const forbidden = new Map();
  for (const pat of [cfg.pattern, ...(cfg.confuserCount > 0 ? [cfg.confuser] : [])]) {
    for (let i = 0; i + 1 < pat.length; i++) forbidden.set(pat[i], (forbidden.get(pat[i]) || new Set()).add(pat[i + 1]));
  }
  if (cfg.task === "cycle") {
    // a deterministic permutation: every symbol has exactly one successor, never a pattern transition, and the cycle visits every symbol
    let perm = null;
    for (let tries = 0; tries < 10000 && !perm; tries++) {
      const cand = range(0, V);
      for (let i = V - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
      let ok = true;
      for (let i = 0; i < V; i++) { const s = cand[i], c = cand[(i + 1) % V]; if (c === s || forbidden.get(s)?.has(c)) ok = false; }
      if (ok) { perm = new Array(V); for (let i = 0; i < V; i++) perm[cand[i]] = cand[(i + 1) % V]; }
    }
    if (!perm) throw new Error("no permutation avoids the pattern transitions");
    for (let s = 0; s < V; s++) for (let c = 0; c < V; c++) rows[s * V + c] = c >= perm[s] ? 1.0 : 0.0;
    return rows;
  }
  for (let s = 0; s < V; s++) {
    const likely = new Set();
    while (likely.size < 2) {
      const c = Math.floor(r() * V);
      if (c === s) continue;
      if (forbidden.get(s)?.has(c)) continue;
      likely.add(c);
    }
    const rest = (1 - 2 * cfg.markovLikely) / (V - 2);
    let acc = 0;
    for (let c = 0; c < V; c++) {
      acc += likely.has(c) ? cfg.markovLikely : rest;
      rows[s * V + c] = acc;
    }
    rows[s * V + V - 1] = 1.0;
  }
  return rows;
}

export function makeRandomNegatives(seed, cfg) {
  const r = seededRng(seed, 37);
  const keys = new Float32Array(cfg.Cn * D);
  const vals = new Uint32Array(cfg.Cn);
  for (let i = 0; i < cfg.Cn; i++) {
    let n = 0;
    for (let d = 0; d < D; d++) { const g = r() * 2 - 1; keys[i * D + d] = g; n += g * g; }
    n = Math.sqrt(n) || 1;
    for (let d = 0; d < D; d++) keys[i * D + d] /= n;
    vals[i] = Math.floor(r() * V);
  }
  return { keys, vals };
}

export const WGSL = /* wgsl */ `
struct U {
  seed: u32, V: u32, D: u32, Cp: u32,
  Cn: u32, cadence: u32, Kacq: u32, Kgap: u32,
  Kprobe: u32, negKind: u32, flags: u32, task: u32,
  beta: f32, lambda: f32, gamma: f32, theta: f32,
  kappa: f32, alpha: f32, decay: f32, eps: f32,
  pat0: u32, pat1: u32, pat2: u32, pat3: u32,
  emaRate: f32, margin: f32, fusion: u32, negWrite: u32,
  negPrior: f32, unlearnMin: f32, betaNeg: f32, pad4: f32,
  conf0: u32, conf1: u32, conf2: u32, conf3: u32,
  confuserCount: u32, pad5: u32, pad6: u32, pad7: u32,
  tuneBudget: f32, tuneRate: f32, tuneStep: f32, lambdaMax: f32,
  abstainMin: f32, pad8: f32, pad9: f32, pad10: f32,
};

const VV: u32 = ${V}u;
const DD: u32 = ${D}u;
const WG: u32 = 128u;
const INVALID: u32 = 0xFFFFFFFFu;

const F_MEM: u32 = 1u;
const F_CONTRASTIVE: u32 = 2u;
const F_CONTROL: u32 = 4u;
const F_SCRAMBLED: u32 = 8u;
const F_RANDOMNEG: u32 = 16u;
const F_EVICT_DECAY: u32 = 32u;
const F_NEG_UNLEARN: u32 = 64u;
const F_TUNER: u32 = 128u;
const F_ABSTAIN: u32 = 256u;

// float state layout
const SF_H: u32 = 0u;            // D
const SF_Q: u32 = ${D}u;         // D
const SF_QPREV: u32 = ${2 * D}u; // D
const SF_SP: u32 = ${3 * D}u;    // V  positive evidence
const SF_PEN: u32 = ${3 * D + V}u; // V negative penalty
const SF_SCAL: u32 = ${3 * D + 2 * V}u;
const SF_POSTOTAL: u32 = SF_SCAL + 0u;
const SF_NEGTOTAL: u32 = SF_SCAL + 1u;
const SF_MU: u32 = SF_SCAL + 2u;
const SF_VAR: u32 = SF_SCAL + 3u;
const SF_EMABG: u32 = SF_SCAL + 4u;
const SF_EMAPAT: u32 = SF_SCAL + 5u;
const SF_LASTSURPRISE: u32 = SF_SCAL + 6u;
const SF_LASTTHETA: u32 = SF_SCAL + 7u;
const SF_WRATE: u32 = SF_SCAL + 8u;      // EMA of positive writes per step
const SF_FUSEDOK: u32 = SF_SCAL + 9u;    // EMA of fused-decision correctness
const SF_POSOK: u32 = SF_SCAL + 10u;     // EMA of positive-read-alone correctness
const SF_TTHETA: u32 = SF_SCAL + 11u;    // tuned theta
const SF_TLAMBDA: u32 = SF_SCAL + 12u;   // tuned lambda
const SF_SIZE: u32 = SF_SCAL + 16u;

// int state layout
const SI_STEP: u32 = 0u;
const SI_SYM: u32 = 1u;        // current symbol s_t
const SI_PTRP: u32 = 2u;
const SI_PTRN: u32 = 3u;
const SI_SLAB0: u32 = 4u;
const SI_SLAB1: u32 = 5u;
const SI_SLAB2: u32 = 6u;
const SI_WRITESP: u32 = 7u;
const SI_WRITESN: u32 = 8u;
const SI_PREVGUESS: u32 = 9u;
const SI_AMBHITS: u32 = 10u;
const SI_AMBN: u32 = 11u;
const SI_LASTGUESS: u32 = 12u;
const SI_LASTNEXT: u32 = 13u;
const SI_UNLEARNED: u32 = 14u;
const SI_CONFWRONG: u32 = 15u;   // confident and wrong (p(guess) >= abstainMin)
const SI_CONFRIGHT: u32 = 16u;
const SI_ABSTAINED: u32 = 17u;
const SI_WHYNOT_N: u32 = 18u;    // times a ruled-out alternative was named
const SI_WHYNOT_OK: u32 = 19u;   // and it was indeed not the truth
const SI_METRICS: u32 = 32u;   // hits[KMAX*4] then n[KMAX*4]
const KMAXC: u32 = ${KMAX}u;

@group(0) @binding(0) var<uniform> U_: U;
@group(0) @binding(1) var<storage, read> CONST: array<f32>;        // E (V*D) then markov rows (V*V)
@group(0) @binding(2) var<storage, read_write> MEMF: array<f32>;   // KP (Cp*D) | SP (Cp) | KN (Cn*D) | SN (Cn)
@group(0) @binding(3) var<storage, read_write> MEMU: array<u32>;   // VP (Cp) | VN (Cn)
@group(0) @binding(4) var<storage, read_write> F: array<f32>;
@group(0) @binding(5) var<storage, read_write> I: array<u32>;
@group(0) @binding(6) var<storage, read_write> TR: array<f32>;     // traces, 4 per checkpoint

var<workgroup> pv: array<f32, ${128 * V}>;   // partial votes, also the scratch for the recursive read's dimension sums
var<workgroup> pmin: array<f32, 128>;
var<workgroup> pidx: array<u32, 128>;
var<workgroup> q1: array<f32, ${D}>;

fn hash3(a: u32, b: u32, c: u32) -> u32 {
  // parentheses: WGSL forbids mixing arithmetic and bitwise operators without them (Tint rejects, naga accepted); C precedence kept
  var h: u32 = (a * 0x9E3779B1u) ^ ((b + 0x7F4A7C15u) * 0x85EBCA77u) ^ ((c + 0x165667B1u) * 0xC2B2AE3Du);
  h ^= h >> 15u; h *= 0x2C1B3C6Du; h ^= h >> 12u; h *= 0x297A2D39u; h ^= h >> 15u;
  return h;
}
fn rnd01(a: u32, b: u32, c: u32) -> f32 {
  return f32(hash3(a, b, c) >> 8u) / 16777216.0;
}
fn kOf(t: u32) -> u32 { return t / U_.cadence; }
fn posOf(t: u32) -> u32 { return t % U_.cadence; }
fn injecting(k: u32) -> bool { return k < U_.Kacq || k >= U_.Kacq + U_.Kgap; }
fn isPatternStep(t: u32) -> bool { return injecting(kOf(t)) && posOf(t) < 4u; }
// the confuser is injected confuserCount times per cycle, spread between the target's injections
fn confuserSlot(t: u32) -> i32 {
  if (U_.confuserCount == 0u || !injecting(kOf(t))) { return -1; }
  let pos = posOf(t);
  for (var j: u32 = 1u; j <= U_.confuserCount; j = j + 1u) {
    let start = (j * U_.cadence) / (U_.confuserCount + 1u);
    if (pos >= start && pos < start + 4u) { return i32(pos - start); }
  }
  return -1;
}
fn isConfuserStep(t: u32) -> bool { return confuserSlot(t) >= 0; }
fn confSym(p: u32) -> u32 {
  if (p == 0u) { return U_.conf0; } else if (p == 1u) { return U_.conf1; } else if (p == 2u) { return U_.conf2; }
  return U_.conf3;
}
fn patSym(k: u32, p: u32) -> u32 {
  if ((U_.flags & F_SCRAMBLED) != 0u) { return hash3(U_.seed, k + 1000u, p + 100u) % VV; }
  if (p == 0u) { return U_.pat0; } else if (p == 1u) { return U_.pat1; } else if (p == 2u) { return U_.pat2; }
  return U_.pat3;
}
// the symbol at step t+1, given the symbol at step t
fn nextSym(t: u32, cur: u32) -> u32 {
  let t1 = t + 1u;
  if (isPatternStep(t1)) { return patSym(kOf(t1), posOf(t1)); }
  let cs = confuserSlot(t1);
  if (cs >= 0) { return confSym(u32(cs)); }
  if (U_.task == 0u) { return hash3(U_.seed, t1, 7u) % VV; }
  let u = rnd01(U_.seed, t1, 7u);
  let base = VV * DD + cur * VV;
  for (var c: u32 = 0u; c < VV; c = c + 1u) {
    if (u < CONST[base + c]) { return c; }
  }
  return VV - 1u;
}
fn firstSym() -> u32 {
  if (isPatternStep(0u)) { return patSym(0u, 0u); }
  return hash3(U_.seed, 0u, 7u) % VV;
}

fn keyDot(kb: u32, slot: u32, qb: u32) -> f32 {
  var s: f32 = 0.0;
  let base = kb + slot * DD;
  for (var d: u32 = 0u; d < DD; d = d + 1u) { s = s + MEMF[base + d] * F[qb + d]; }
  return s;
}
fn keyDotQ1(kb: u32, slot: u32) -> f32 {
  var s: f32 = 0.0;
  let base = kb + slot * DD;
  for (var d: u32 = 0u; d < DD; d = d + 1u) { s = s + MEMF[base + d] * q1[d]; }
  return s;
}

fn spBase() -> u32 { return U_.Cp * DD; }
fn knBase() -> u32 { return U_.Cp * DD + U_.Cp; }
fn snBase() -> u32 { return U_.Cp * DD + U_.Cp + U_.Cn * DD; }

// vote over a memory region [slot0, slot0+count) with keys at kb, values at vb; writes normalized votes to F[outBase..+V]
// and the total weight to F[totalIdx]. Uses pv as scratch. Strength at sb gets the retrieval weight added.
fn voteRegion(lid: u32, kb: u32, vb: u32, sb: u32, slot0: u32, count: u32, outBase: u32, totalIdx: u32, useQ1: bool, beta: f32) {
  var mine: array<f32, ${V}>;
  for (var v: u32 = 0u; v < VV; v = v + 1u) { mine[v] = 0.0; }
  for (var i: u32 = lid; i < count; i = i + WG) {
    let slot = slot0 + i;
    let val = MEMU[vb + slot];
    if (val != INVALID) {
      var dt: f32;
      if (useQ1) { dt = keyDotQ1(kb, slot); } else { dt = keyDot(kb, slot, SF_Q); }
      let w = exp(beta * (dt - 1.0));
      mine[val] = mine[val] + w;
      MEMF[sb + slot] = min(MEMF[sb + slot] + w, 4.0);
    }
  }
  for (var v: u32 = 0u; v < VV; v = v + 1u) { pv[lid * VV + v] = mine[v]; }
  workgroupBarrier();
  if (lid < VV) {
    var s: f32 = 0.0;
    for (var j: u32 = 0u; j < WG; j = j + 1u) { s = s + pv[j * VV + lid]; }
    F[outBase + lid] = s;
  }
  workgroupBarrier();
  if (lid == 0u) {
    var tot: f32 = 0.0;
    for (var v: u32 = 0u; v < VV; v = v + 1u) { tot = tot + F[outBase + v]; }
    F[totalIdx] = tot;
    if (tot > 0.0) { for (var v: u32 = 0u; v < VV; v = v + 1u) { F[outBase + v] = F[outBase + v] / tot; } }
  }
  workgroupBarrier();
}

// Dispatch 1: state update and the positive memory read (W+).
@compute @workgroup_size(128)
fn pos_pass(@builtin(local_invocation_id) l: vec3<u32>) {
  let lid = l.x;
  if (lid == 0u) {
    let step = I[SI_STEP];
    var cur: u32;
    if (step == 0u) { cur = firstSym(); I[SI_SYM] = cur; } else { cur = I[SI_SYM]; }
    var n: f32 = 0.0;
    for (var d: u32 = 0u; d < DD; d = d + 1u) {
      F[SF_QPREV + d] = F[SF_Q + d];
      let h = U_.alpha * F[SF_H + d] + (1.0 - U_.alpha) * CONST[cur * DD + d];
      F[SF_H + d] = h;
      n = n + h * h;
    }
    n = sqrt(n);
    for (var d: u32 = 0u; d < DD; d = d + 1u) {
      if (n > 1e-9) { F[SF_Q + d] = F[SF_H + d] / n; } else { F[SF_Q + d] = 0.0; }
    }
  }
  workgroupBarrier();
  if ((U_.flags & F_MEM) != 0u) {
    voteRegion(lid, 0u, 0u, spBase(), 0u, U_.Cp, SF_SP, SF_POSTOTAL, false, U_.beta);
  } else if (lid < VV) {
    F[SF_SP + lid] = 0.0;
    if (lid == 0u) { F[SF_POSTOTAL] = 0.0; }
  }
}

fn sigmoid(x: f32) -> f32 { return 1.0 / (1.0 + exp(-x)); }

// Dispatch 2: the negative memory read (W-), in one of the five formulations.
@compute @workgroup_size(128)
fn neg_pass(@builtin(local_invocation_id) l: vec3<u32>) {
  let lid = l.x;
  if ((U_.flags & F_CONTRASTIVE) == 0u || (U_.flags & F_MEM) == 0u) {
    if (lid < VV) { F[SF_PEN + lid] = 0.0; }
    if (lid == 0u) { F[SF_NEGTOTAL] = 0.0; }
    return;
  }
  let kb = knBase();
  let vb = U_.Cp;
  let sb = snBase();
  let kind = U_.negKind;
  var bn: f32 = U_.betaNeg;
  if (bn <= 0.0) { bn = U_.beta; }
  if (kind == 4u) {
    // multi_slab_parallel: three slabs read separately, the penalty is their mean
    let slabN = U_.Cn / 3u;
    var acc: array<f32, ${V}>;
    for (var v: u32 = 0u; v < VV; v = v + 1u) { acc[v] = 0.0; }
    for (var s: u32 = 0u; s < 3u; s = s + 1u) {
      voteRegion(lid, kb, vb, sb, s * slabN, slabN, SF_PEN, SF_NEGTOTAL, false, bn);
      if (lid == 0u) { for (var v: u32 = 0u; v < VV; v = v + 1u) { acc[v] = acc[v] + F[SF_PEN + v] / 3.0; } }
      workgroupBarrier();
    }
    if (lid == 0u) { for (var v: u32 = 0u; v < VV; v = v + 1u) { F[SF_PEN + v] = acc[v]; } }
    return;
  }
  if (kind == 1u) {
    // recursive_inverted: one Hopfield fixed-point step pulls the query toward the stored negatives
    // (q1 = normalize(sum_i w_i k_i)), then the read happens from q1. The positive read stays one step.
    // The dimension sums go through pv in two halves of 16 dimensions (workgroup memory is 16 KB).
    for (var half: u32 = 0u; half < 2u; half = half + 1u) {
      var acc16: array<f32, 16>;
      for (var j: u32 = 0u; j < 16u; j = j + 1u) { acc16[j] = 0.0; }
      for (var i: u32 = lid; i < U_.Cn; i = i + WG) {
        if (MEMU[vb + i] != INVALID) {
          let w = exp(bn * (keyDot(kb, i, SF_Q) - 1.0));
          for (var j: u32 = 0u; j < 16u; j = j + 1u) { acc16[j] = acc16[j] + w * MEMF[kb + i * DD + half * 16u + j]; }
        }
      }
      for (var j: u32 = 0u; j < 16u; j = j + 1u) { pv[lid * 16u + j] = acc16[j]; }
      workgroupBarrier();
      if (lid < 16u) {
        var s: f32 = 0.0;
        for (var t: u32 = 0u; t < WG; t = t + 1u) { s = s + pv[t * 16u + lid]; }
        q1[half * 16u + lid] = s;
      }
      workgroupBarrier();
    }
    if (lid == 0u) {
      var n: f32 = 0.0;
      for (var d: u32 = 0u; d < DD; d = d + 1u) { n = n + q1[d] * q1[d]; }
      n = sqrt(n);
      for (var d: u32 = 0u; d < DD; d = d + 1u) { if (n > 1e-9) { q1[d] = q1[d] / n; } else { q1[d] = F[SF_Q + d]; } }
    }
    workgroupBarrier();
    voteRegion(lid, kb, vb, sb, 0u, U_.Cn, SF_PEN, SF_NEGTOTAL, true, bn);
    return;
  }
  // flat_linear, anti_swiglu_gate, anti_tanh_flat share one read; the last two shape it
  voteRegion(lid, kb, vb, sb, 0u, U_.Cn, SF_PEN, SF_NEGTOTAL, false, bn);
  if (lid < VV) {
    let s = F[SF_PEN + lid];
    if (kind == 2u) {
      // anti_swiglu_gate: the gate input is negated before SiLU; pen = -silu(-gamma*s)
      let z = -U_.gamma * s;
      F[SF_PEN + lid] = -(z * sigmoid(z));
    } else if (kind == 3u) {
      // anti_tanh_flat: bounded penalty
      F[SF_PEN + lid] = tanh(U_.gamma * s);
    }
  }
}

fn writeSlot(kb: u32, vb: u32, sb: u32, slot: u32, val: u32) {
  for (var d: u32 = 0u; d < DD; d = d + 1u) { MEMF[kb + slot * DD + d] = F[SF_Q + d]; }
  MEMU[vb + slot] = val;
  MEMF[sb + slot] = 1.0;
}
fn writeSlotQPrev(kb: u32, vb: u32, sb: u32, slot: u32, val: u32) {
  for (var d: u32 = 0u; d < DD; d = d + 1u) { MEMF[kb + slot * DD + d] = F[SF_QPREV + d]; }
  MEMU[vb + slot] = val;
  MEMF[sb + slot] = 1.0;
}

// argmin strength over a region, result in pmin[0]/pidx[0] after the call (all threads must call)
fn argminRegion(lid: u32, sb: u32, slot0: u32, count: u32) {
  var best: f32 = 1e30;
  var bi: u32 = slot0;
  for (var i: u32 = lid; i < count; i = i + WG) {
    let s = MEMF[sb + slot0 + i];
    if (s < best) { best = s; bi = slot0 + i; }
  }
  pmin[lid] = best; pidx[lid] = bi;
  workgroupBarrier();
  if (lid == 0u) {
    var b: f32 = pmin[0]; var j: u32 = pidx[0];
    for (var t: u32 = 1u; t < WG; t = t + 1u) { if (pmin[t] < b) { b = pmin[t]; j = pidx[t]; } }
    pmin[0] = b; pidx[0] = j;
  }
  workgroupBarrier();
}

// Dispatch 3: fusion, prediction, metrics, gates and writes.
@compute @workgroup_size(128)
fn fuse_pass(@builtin(local_invocation_id) l: vec3<u32>) {
  let lid = l.x;
  let decayOn = (U_.flags & F_EVICT_DECAY) != 0u;
  // strength decay (all slots, in parallel)
  if (decayOn) {
    for (var i: u32 = lid; i < U_.Cp; i = i + WG) { MEMF[spBase() + i] = MEMF[spBase() + i] * (1.0 - U_.decay); }
    for (var i: u32 = lid; i < U_.Cn; i = i + WG) { MEMF[snBase() + i] = MEMF[snBase() + i] * (1.0 - U_.decay); }
  }
  workgroupBarrier();
  // eviction candidates
  var slotP: u32 = 0u;
  var slotN: u32 = 0u;
  var slotS0: u32 = 0u; var slotS1: u32 = 0u; var slotS2: u32 = 0u;
  let slabN = U_.Cn / 3u;
  if (decayOn) {
    argminRegion(lid, spBase(), 0u, U_.Cp); slotP = pidx[0];
    if (U_.negKind == 4u) {
      argminRegion(lid, snBase(), 0u, slabN); slotS0 = pidx[0];
      argminRegion(lid, snBase(), slabN, slabN); slotS1 = pidx[0];
      argminRegion(lid, snBase(), 2u * slabN, slabN); slotS2 = pidx[0];
    } else {
      argminRegion(lid, snBase(), 0u, U_.Cn); slotN = pidx[0];
    }
  } else {
    slotP = I[SI_PTRP]; slotN = I[SI_PTRN];
    slotS0 = I[SI_SLAB0]; slotS1 = slabN + I[SI_SLAB1]; slotS2 = 2u * slabN + I[SI_SLAB2];
  }

  let step = I[SI_STEP];
  let cur = I[SI_SYM];
  let nxt = nextSym(step, cur);
  let memOn = (U_.flags & F_MEM) != 0u;
  let contrastive = (U_.flags & F_CONTRASTIVE) != 0u && memOn;
  let control = (U_.flags & F_CONTROL) != 0u;
  let randomNeg = (U_.flags & F_RANDOMNEG) != 0u;
  let unlearn = (U_.flags & F_NEG_UNLEARN) != 0u && contrastive && !randomNeg;
  let tuner = (U_.flags & F_TUNER) != 0u;

  // the hinge's other half: find the negative slot that votes for the truth and matches this context best
  var unlearnSlot: u32 = INVALID;
  if (unlearn) {
    var best: f32 = -2.0;
    var bi: u32 = INVALID;
    for (var i: u32 = lid; i < U_.Cn; i = i + WG) {
      if (MEMU[U_.Cp + i] == nxt) {
        let dt = keyDot(knBase(), i, SF_Q);
        if (dt > best) { best = dt; bi = i; }
      }
    }
    pmin[lid] = best; pidx[lid] = bi;
    workgroupBarrier();
    if (lid == 0u) {
      var b: f32 = pmin[0]; var j: u32 = pidx[0];
      for (var t: u32 = 1u; t < WG; t = t + 1u) { if (pmin[t] > b) { b = pmin[t]; j = pidx[t]; } }
      // only a negative written at a near-exact context is removed: a neighbour context must not erase it
      var bnu: f32 = U_.betaNeg;
      if (bnu <= 0.0) { bnu = U_.beta; }
      if (j != INVALID && exp(bnu * (b - 1.0)) >= U_.unlearnMin) { unlearnSlot = j; }
    }
  }
  if (lid != 0u) { return; }

  // fusion: the decisor combines the positive evidence for v and the negative evidence against v
  var logits: array<f32, ${V}>;
  var guess: u32 = 0u;
  var bestL: f32 = -1e30;
  var hard: u32 = INVALID;      // W+'s best alternative that is not the truth (the hard negative)
  var hardSp: f32 = 0.0;
  var posGuess: u32 = 0u;       // the positive read alone, for the tuner's branch comparison
  var posBest: f32 = -1.0;
  let posTot = F[SF_POSTOTAL];
  let negTot = F[SF_NEGTOTAL];
  // the tuner's lambda (initialised from the uniform on step 0)
  var lambda = U_.lambda;
  if (tuner) { if (step == 0u) { F[SF_TLAMBDA] = U_.lambda; F[SF_TTHETA] = U_.theta; } lambda = F[SF_TLAMBDA]; }
  for (var v: u32 = 0u; v < VV; v = v + 1u) {
    let sp = F[SF_SP + v];
    var pen: f32 = 0.0;
    if (contrastive) { pen = F[SF_PEN + v]; }
    let mp = sp * posTot;
    let mn = pen * negTot;
    var sc: f32;
    if (U_.fusion == 0u) { sc = sp - lambda * pen; }
    else if (U_.fusion == 1u) { sc = mp - lambda * mn; }
    else { sc = log(mp + U_.eps) - lambda * log(mn + U_.negPrior); }
    logits[v] = sc;
    if (sc > bestL) { bestL = sc; guess = v; }
    if (sp > posBest) { posBest = sp; posGuess = v; }
    if (v != nxt && sp > hardSp) { hardSp = sp; hard = v; }
  }
  var pTrue: f32;
  if (U_.fusion == 2u) {
    var z: f32 = 0.0;
    for (var v: u32 = 0u; v < VV; v = v + 1u) { z = z + exp(logits[v] - bestL); }
    pTrue = exp(logits[nxt] - bestL) / z;
  } else {
    var psum: f32 = 0.0;
    for (var v: u32 = 0u; v < VV; v = v + 1u) { psum = psum + max(logits[v], 0.0) + U_.eps; }
    pTrue = (max(logits[nxt], 0.0) + U_.eps) / psum;
  }
  let surprise = -log(max(pTrue, 1e-12));
  // the probability of the decision itself, for the user-facing counters and Chow's rule
  var pGuess: f32;
  if (U_.fusion == 2u) { var z2: f32 = 0.0; for (var v: u32 = 0u; v < VV; v = v + 1u) { z2 = z2 + exp(logits[v] - bestL); } pGuess = 1.0 / z2; }
  else { var ps2: f32 = 0.0; for (var v: u32 = 0u; v < VV; v = v + 1u) { ps2 = ps2 + max(logits[v], 0.0) + U_.eps; } pGuess = (max(bestL, 0.0) + U_.eps) / ps2; }
  let confident = pGuess >= U_.abstainMin;
  let abstainOn = (U_.flags & F_ABSTAIN) != 0u;
  if (abstainOn && !confident) { I[SI_ABSTAINED] = I[SI_ABSTAINED] + 1u; guess = INVALID; }
  if (confident) { if (guess == nxt) { I[SI_CONFRIGHT] = I[SI_CONFRIGHT] + 1u; } else { I[SI_CONFWRONG] = I[SI_CONFWRONG] + 1u; } }
  // the "why not" output: the alternative the negative memory rules out most strongly among the positively supported ones
  if (contrastive) {
    var wn: u32 = INVALID; var wnBest: f32 = 0.0;
    for (var v: u32 = 0u; v < VV; v = v + 1u) { let mn2 = F[SF_PEN + v] * negTot; if (F[SF_SP + v] > 0.0 && mn2 > wnBest) { wnBest = mn2; wn = v; } }
    if (wn != INVALID) { I[SI_WHYNOT_N] = I[SI_WHYNOT_N] + 1u; if (wn != nxt) { I[SI_WHYNOT_OK] = I[SI_WHYNOT_OK] + 1u; } }
  }
  // the hinge: a negative is written while the negative memory does not yet separate the hard alternative from the truth by the margin
  var marginGap: f32 = 0.0;
  if (hard != INVALID) { marginGap = log(F[SF_PEN + hard] * negTot + U_.eps) - log(F[SF_PEN + nxt] * negTot + U_.eps); }

  // metrics: predictions about the pattern's continuation, by exposure and position
  let k = kOf(step);
  let pos = posOf(step);
  let patNow = isPatternStep(step) && pos < 3u;   // predicting positions 1..3 of the pattern
  if (patNow && k < KMAXC) {
    let p = pos + 1u;
    if (guess == nxt) { I[SI_METRICS + k * 4u + p] = I[SI_METRICS + k * 4u + p] + 1u; }
    I[SI_METRICS + KMAXC * 4u + k * 4u + p] = I[SI_METRICS + KMAXC * 4u + k * 4u + p] + 1u;
    F[SF_EMAPAT] = (1.0 - U_.emaRate) * F[SF_EMAPAT] + U_.emaRate * surprise;
  } else if (!isPatternStep(step + 1u) && !isConfuserStep(step) && !isConfuserStep(step + 1u)) {
    if (guess == nxt) { I[SI_AMBHITS] = I[SI_AMBHITS] + 1u; }
    I[SI_AMBN] = I[SI_AMBN] + 1u;
    F[SF_EMABG] = (1.0 - U_.emaRate) * F[SF_EMABG] + U_.emaRate * surprise;
  }

  // controller: running mean and variance of the surprise; actuator: the threshold
  var theta = U_.theta;
  if (tuner) { theta = F[SF_TTHETA]; }
  if (control) {
    let mu0 = F[SF_MU];
    let mu = (1.0 - U_.emaRate) * mu0 + U_.emaRate * surprise;
    let dv = surprise - mu0;
    let vr = (1.0 - U_.emaRate) * F[SF_VAR] + U_.emaRate * dv * dv;
    F[SF_MU] = mu; F[SF_VAR] = vr;
    if (step > 50u) { theta = mu + U_.kappa * sqrt(max(vr, 0.0)); }
  }
  F[SF_LASTSURPRISE] = surprise;
  F[SF_LASTTHETA] = theta;
  // the open live tuner, per step: signals are EMAs; reactions compare them to targets; actuators nudge theta and lambda
  if (tuner) {
    let tr = U_.tuneRate;
    var wrote: f32 = 0.0;
    if (memOn && surprise > theta) { wrote = 1.0; }
    F[SF_WRATE] = (1.0 - tr) * F[SF_WRATE] + tr * wrote;
    var fok: f32 = 0.0; if (guess == nxt) { fok = 1.0; }
    var pok: f32 = 0.0; if (posGuess == nxt) { pok = 1.0; }
    F[SF_FUSEDOK] = (1.0 - tr) * F[SF_FUSEDOK] + tr * fok;
    F[SF_POSOK] = (1.0 - tr) * F[SF_POSOK] + tr * pok;
    if (step > 100u) {
      // write-rate controller: more writes than the budget raise the gate, fewer lower it, within [0.2, 6]
      if (F[SF_WRATE] > U_.tuneBudget) { F[SF_TTHETA] = min(F[SF_TTHETA] + U_.tuneStep, 6.0); }
      else { F[SF_TTHETA] = max(F[SF_TTHETA] - U_.tuneStep, 0.2); }
      // branch controller: when the fused decision does worse than the positive read alone, the negative weight shrinks; when better, it grows to lambdaMax
      if (contrastive) {
        if (F[SF_FUSEDOK] + 0.01 < F[SF_POSOK]) { F[SF_TLAMBDA] = max(F[SF_TLAMBDA] * (1.0 - U_.tuneStep), 0.0); }
        else if (F[SF_FUSEDOK] > F[SF_POSOK] + 0.01) { F[SF_TLAMBDA] = min(F[SF_TLAMBDA] * (1.0 + U_.tuneStep), U_.lambdaMax); }
      }
    }
  }

  // positive write: consolidate the surprising pair (context, truth)
  if (memOn && surprise > theta) {
    writeSlot(0u, 0u, spBase(), slotP, nxt);
    I[SI_PTRP] = (I[SI_PTRP] + 1u) % U_.Cp;
    I[SI_WRITESP] = I[SI_WRITESP] + 1u;
  }
  // unlearning: the truth is not wrong here, so its matching negative goes
  if (unlearnSlot != INVALID) {
    MEMU[U_.Cp + unlearnSlot] = INVALID;
    MEMF[snBase() + unlearnSlot] = 0.0;
    I[SI_UNLEARNED] = I[SI_UNLEARNED] + 1u;
  }
  // negative write: the hard alternative is wrong here, unless the negative memory already says so by the margin;
  // with negWrite = gated it happens only at steps where the positive gate fired too
  let negGateOpen = (U_.negWrite == 1u) || (surprise > theta);
  if (contrastive && !randomNeg && hard != INVALID && hardSp > 0.0 && negGateOpen) {
    let kb = knBase(); let vb = U_.Cp; let sb = snBase();
    if (U_.negKind == 4u) {
      // slab 0: the model's wrong guess; slab 1: W+'s best wrong alternative; slab 2: the wrong guess keyed by the previous context
      if (guess != nxt) {
        writeSlot(kb, vb, sb, slotS0, guess);
        I[SI_SLAB0] = (I[SI_SLAB0] + 1u) % slabN;
        writeSlotQPrev(kb, vb, sb, slotS2, guess);
        I[SI_SLAB2] = (I[SI_SLAB2] + 1u) % slabN;
        I[SI_WRITESN] = I[SI_WRITESN] + 2u;
      }
      if (marginGap < U_.margin) {
        writeSlot(kb, vb, sb, slotS1, hard);
        I[SI_SLAB1] = (I[SI_SLAB1] + 1u) % slabN;
        I[SI_WRITESN] = I[SI_WRITESN] + 1u;
      }
    } else if (marginGap < U_.margin) {
      writeSlot(kb, vb, sb, slotN, hard);
      I[SI_PTRN] = (I[SI_PTRN] + 1u) % U_.Cn;
      I[SI_WRITESN] = I[SI_WRITESN] + 1u;
    }
  }

  // traces
  if (step % ${TRACE_EVERY}u == 0u) {
    let c = step / ${TRACE_EVERY}u;
    TR[c * 4u + 0u] = F[SF_EMABG];
    TR[c * 4u + 1u] = f32(I[SI_WRITESP]);
    TR[c * 4u + 2u] = f32(I[SI_WRITESN]);
    TR[c * 4u + 3u] = theta;
  }
  I[SI_PREVGUESS] = guess;
  I[SI_LASTGUESS] = guess;
  I[SI_LASTNEXT] = nxt;
  I[SI_SYM] = nxt;
  I[SI_STEP] = step + 1u;
}
`;

export function flagsOf(cfg) {
  let f = 0;
  if (cfg.memory) f |= F_MEM;
  if (cfg.contrastive) f |= F_CONTRASTIVE;
  if (cfg.control) f |= F_CONTROL;
  if (cfg.scrambled) f |= F_SCRAMBLED;
  if (cfg.randomNeg) f |= F_RANDOMNEG;
  if (cfg.evict === "decay") f |= F_EVICT_DECAY;
  if (cfg.negUnlearn) f |= F_NEG_UNLEARN;
  if (cfg.tuner) f |= F_TUNER;
  if (cfg.abstain) f |= F_ABSTAIN;
  return f;
}

export const UNIFORM_BYTES = 192;

export function packUniform(cfg) {
  const buf = new ArrayBuffer(UNIFORM_BYTES);
  const u = new Uint32Array(buf), f = new Float32Array(buf);
  u[0] = cfg.seed >>> 0; u[1] = V; u[2] = D; u[3] = cfg.Cp;
  u[4] = cfg.Cn; u[5] = cfg.cadence; u[6] = cfg.Kacq; u[7] = cfg.Kgap;
  u[8] = cfg.Kprobe; u[9] = NEG_KINDS.indexOf(cfg.negKind); u[10] = flagsOf(cfg); u[11] = cfg.task === "uniform" ? 0 : 1;   // cycle samples like markov from one-hot rows
  f[12] = cfg.beta; f[13] = cfg.lambda; f[14] = cfg.gamma; f[15] = cfg.theta;
  f[16] = cfg.kappa; f[17] = cfg.alpha; f[18] = cfg.decay; f[19] = cfg.eps;
  u[20] = cfg.pattern[0]; u[21] = cfg.pattern[1]; u[22] = cfg.pattern[2]; u[23] = cfg.pattern[3];
  f[24] = cfg.emaRate; f[25] = cfg.margin; u[26] = Math.max(0, FUSIONS.indexOf(cfg.fusion)); u[27] = Math.max(0, NEG_WRITES.indexOf(cfg.negWrite));
  f[28] = cfg.negPrior; f[29] = cfg.unlearnMin; f[30] = cfg.betaNeg; f[31] = 0;
  u[32] = cfg.confuser[0]; u[33] = cfg.confuser[1]; u[34] = cfg.confuser[2]; u[35] = cfg.confuser[3];
  u[36] = cfg.confuserCount; u[37] = 0; u[38] = 0; u[39] = 0;
  f[40] = cfg.tuneBudget; f[41] = cfg.tuneRate; f[42] = cfg.tuneStep; f[43] = cfg.lambdaMax;
  f[44] = cfg.abstainMin; f[45] = 0; f[46] = 0; f[47] = 0;
  return buf;
}

// Builds the pipelines once per device; reuse across runs.
export async function createEngine(device) {
  const module = device.createShaderModule({ code: WGSL });
  const info = await module.getCompilationInfo();
  const errors = info.messages.filter(m => m.type === "error");
  if (errors.length) throw new Error("WGSL: " + errors.map(m => `${m.lineNum}:${m.linePos} ${m.message}`).join("\n"));
  const entries = [];
  entries.push({ binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } });
  entries.push({ binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } });
  for (let b = 2; b <= 6; b++) entries.push({ binding: b, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } });
  const bgl = device.createBindGroupLayout({ entries });
  const layout = device.createPipelineLayout({ bindGroupLayouts: [bgl] });
  const mk = (entryPoint) => device.createComputePipeline({ layout, compute: { module, entryPoint } });
  return { device, bgl, pos: mk("pos_pass"), neg: mk("neg_pass"), fuse: mk("fuse_pass"), wgslBytes: WGSL.length };
}

export async function runExperiment(engine, cfgIn, opts = {}) {
  const cfg = { ...defaultConfig, ...cfgIn };
  if (cfg.Cn % 3 !== 0) throw new Error("Cn must be a multiple of 3");
  const device = engine.device;
  const steps = stepsOf(cfg);
  const K = cfg.Kacq + cfg.Kgap + cfg.Kprobe;
  if (K > KMAX) throw new Error(`exposures ${K} exceed KMAX ${KMAX}`);
  const batch = opts.batch ?? 500;

  const mkBuf = (size, usage) => device.createBuffer({ size: Math.max(16, Math.ceil(size / 16) * 16), usage });
  const uBuf = mkBuf(UNIFORM_BYTES, GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST);
  const constData = new Float32Array(V * D + V * V);
  constData.set(makeEmbedding(cfg.seed), 0);
  constData.set(makeMarkovRows(cfg.seed, cfg), V * D);
  const constBuf = mkBuf(constData.byteLength, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
  const memfLen = cfg.Cp * D + cfg.Cp + cfg.Cn * D + cfg.Cn;
  const memf = new Float32Array(memfLen);
  const memu = new Uint32Array(cfg.Cp + cfg.Cn).fill(0xFFFFFFFF);
  if (cfg.randomNeg) {
    const rn = makeRandomNegatives(cfg.seed, cfg);
    memf.set(rn.keys, cfg.Cp * D + cfg.Cp);
    memf.fill(1.0, cfg.Cp * D + cfg.Cp + cfg.Cn * D);
    memu.set(rn.vals, cfg.Cp);
  }
  const memfBuf = mkBuf(memf.byteLength, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
  const memuBuf = mkBuf(memu.byteLength, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST);
  const fLen = 3 * D + 2 * V + 16;
  const fBuf = mkBuf(fLen * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
  const iLen = 32 + KMAX * 8;
  const iBuf = mkBuf(iLen * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
  const trLen = (Math.floor(steps / TRACE_EVERY) + 1) * 4;
  const trBuf = mkBuf(trLen * 4, GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC);
  const readBuf = mkBuf((fLen + iLen + trLen) * 4, GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST);

  device.queue.writeBuffer(uBuf, 0, packUniform(cfg));
  device.queue.writeBuffer(constBuf, 0, constData);
  device.queue.writeBuffer(memfBuf, 0, memf);
  device.queue.writeBuffer(memuBuf, 0, memu);
  device.queue.writeBuffer(fBuf, 0, new Float32Array(fLen));
  device.queue.writeBuffer(iBuf, 0, new Uint32Array(iLen));
  device.queue.writeBuffer(trBuf, 0, new Float32Array(trLen));

  const bindGroup = device.createBindGroup({
    layout: engine.bgl,
    entries: [
      { binding: 0, resource: { buffer: uBuf } },
      { binding: 1, resource: { buffer: constBuf } },
      { binding: 2, resource: { buffer: memfBuf } },
      { binding: 3, resource: { buffer: memuBuf } },
      { binding: 4, resource: { buffer: fBuf } },
      { binding: 5, resource: { buffer: iBuf } },
      { binding: 6, resource: { buffer: trBuf } },
    ],
  });

  const t0 = (globalThis.performance ?? Date).now();
  let done = 0;
  while (done < steps) {
    const n = Math.min(batch, steps - done);
    const enc = device.createCommandEncoder();
    const pass = enc.beginComputePass();
    pass.setBindGroup(0, bindGroup);
    for (let s = 0; s < n; s++) {
      pass.setPipeline(engine.pos); pass.dispatchWorkgroups(1);
      pass.setPipeline(engine.neg); pass.dispatchWorkgroups(1);
      pass.setPipeline(engine.fuse); pass.dispatchWorkgroups(1);
    }
    pass.end();
    device.queue.submit([enc.finish()]);
    done += n;
    if (opts.onProgress) { await device.queue.onSubmittedWorkDone(); opts.onProgress(done, steps); }
  }
  const enc = device.createCommandEncoder();
  enc.copyBufferToBuffer(fBuf, 0, readBuf, 0, fLen * 4);
  enc.copyBufferToBuffer(iBuf, 0, readBuf, fLen * 4, iLen * 4);
  enc.copyBufferToBuffer(trBuf, 0, readBuf, (fLen + iLen) * 4, trLen * 4);
  device.queue.submit([enc.finish()]);
  await readBuf.mapAsync(GPUMapMode.READ);
  const raw = readBuf.getMappedRange().slice(0);
  readBuf.unmap();
  const elapsedMs = (globalThis.performance ?? Date).now() - t0;

  const fArr = new Float32Array(raw, 0, fLen);
  const iArr = new Uint32Array(raw, fLen * 4, iLen);
  const trArr = new Float32Array(raw, (fLen + iLen) * 4, trLen);
  const hits = [], ns = [];
  for (let k = 0; k < K; k++) {
    hits.push([iArr[32 + k * 4 + 1], iArr[32 + k * 4 + 2], iArr[32 + k * 4 + 3]]);
    ns.push([iArr[32 + KMAX * 4 + k * 4 + 1], iArr[32 + KMAX * 4 + k * 4 + 2], iArr[32 + KMAX * 4 + k * 4 + 3]]);
  }
  for (const b of [uBuf, constBuf, memfBuf, memuBuf, fBuf, iBuf, trBuf, readBuf]) b.destroy();

  const acc = (k) => hits[k].map((h, p) => ns[k][p] ? h / ns[k][p] : NaN);
  const curve = [];
  for (let k = 0; k < K; k++) curve.push({ k, injected: k < cfg.Kacq || k >= cfg.Kacq + cfg.Kgap, acc: acc(k) });
  const mean23 = (a) => (a[1] + a[2]) / 2;
  const kLast = cfg.Kacq - 1, kProbe = cfg.Kacq + cfg.Kgap;
  const accLast = mean23(acc(kLast)), accProbe = mean23(acc(kProbe));
  return {
    cfg, steps, elapsedMs, stepsPerSec: steps / (elapsedMs / 1000),
    oneShot: acc(1),                // accuracy at the second exposure, per position 1..3
    oneShot23: mean23(acc(1)),
    acq27: avg(range(2, cfg.Kacq).map(k => mean23(acc(k)))),
    frs: accLast > 0 ? accProbe / accLast : NaN,
    accLast, accProbe,
    ambientAcc: iArr[11] ? iArr[10] / iArr[11] : NaN,
    writesP: iArr[7], writesN: iArr[8], unlearned: iArr[14],
    confWrongPer1000: 1000 * iArr[15] / steps, confRightPer1000: 1000 * iArr[16] / steps, abstainedPer1000: 1000 * iArr[17] / steps,
    whyNotPrecision: iArr[18] ? iArr[19] / iArr[18] : NaN, whyNotPer1000: 1000 * iArr[18] / steps,
    emaBg: fArr[3 * D + 2 * V + 4], emaPat: fArr[3 * D + 2 * V + 5],
    tunedTheta: fArr[3 * D + 2 * V + 11], tunedLambda: fArr[3 * D + 2 * V + 12], writeRate: fArr[3 * D + 2 * V + 8],
    curve, trace: Array.from(trArr),
    finalStep: iArr[0],
  };
}

export function avg(a) { const b = a.filter(x => Number.isFinite(x)); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN; }
export function sd(a) { const b = a.filter(x => Number.isFinite(x)); if (b.length < 2) return NaN; const m = avg(b); return Math.sqrt(b.reduce((s, x) => s + (x - m) * (x - m), 0) / (b.length - 1)); }
export function range(a, b) { const r = []; for (let i = a; i < b; i++) r.push(i); return r; }

// The 2x2 and the three negative controls.
export const ARMS = {
  baseline: { memory: true, contrastive: false, control: false },
  control: { memory: true, contrastive: false, control: true },
  contrastive: { memory: true, contrastive: true, control: false },
  both: { memory: true, contrastive: true, control: true },
  "ctrl-nomem": { memory: false, contrastive: false, control: false },
  "ctrl-scrambled": { memory: true, contrastive: true, control: true, scrambled: true },
  "ctrl-randomneg": { memory: true, contrastive: true, control: false, randomNeg: true },
  // the open live tuner's own 2x2: tuner x contrastive, with the fixed gate as the start value
  tuner: { memory: true, contrastive: false, control: false, tuner: true },
  "tuner-contrastive": { memory: true, contrastive: true, control: false, tuner: true },
};

export async function getDevice() {
  if (!globalThis.navigator?.gpu) throw new Error("WebGPU is not available here");
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("No WebGPU adapter");
  const device = await adapter.requestDevice();
  return { adapter, device, info: adapter.info ? { vendor: adapter.info.vendor, architecture: adapter.info.architecture, device: adapter.info.device, description: adapter.info.description } : {} };
}
