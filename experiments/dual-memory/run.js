// Headless runner (Deno) for the same harness the page uses.
//
//   deno run --allow-read --allow-write run.js --arms baseline,control,contrastive,both --seeds 10 --task markov --beta 18 --out results.json
//   deno run --allow-read --allow-net run.js serve 8080      (serves this folder for a browser run)
//
// Every run is one seed, one arm, one task, one beta, one negative kind, one lambda.

import { ARMS, FUSIONS, NEG_KINDS, NEG_WRITES, WGSL, avg, createEngine, defaultConfig, getDevice, runExperiment, sd } from "./harness.js";

function parseArgs(argv) {
  const o = { seeds: 10, seedStart: 1, arms: "baseline,control,contrastive,both,ctrl-nomem,ctrl-scrambled,ctrl-randomneg", task: "markov", beta: "18", kinds: "flat_linear", lambda: "1", fusion: "logratio", negwrite: "gated", negunlearn: true, betaneg: "0", confuser: 0, unlearnmin: 0.5, evict: "decay", out: "", batch: 500, quiet: false, label: "" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--seeds") o.seeds = Number(next());
    else if (a === "--seed-start") o.seedStart = Number(next());
    else if (a === "--arms") o.arms = next();
    else if (a === "--task") o.task = next();
    else if (a === "--beta") o.beta = next();
    else if (a === "--kinds") o.kinds = next();
    else if (a === "--lambda") o.lambda = next();
    else if (a === "--fusion") o.fusion = next();
    else if (a === "--negwrite") o.negwrite = next();
    else if (a === "--negunlearn") o.negunlearn = next() !== "off";
    else if (a === "--betaneg") o.betaneg = next();
    else if (a === "--confuser") o.confuser = Number(next());
    else if (a === "--unlearnmin") o.unlearnmin = Number(next());
    else if (a === "--evict") o.evict = next();
    else if (a === "--out") o.out = next();
    else if (a === "--batch") o.batch = Number(next());
    else if (a === "--label") o.label = next();
    else if (a === "--set") { const [k, v] = next().split("="); o.extra = o.extra || {}; o.extra[k] = v === "true" ? true : v === "false" ? false : isNaN(Number(v)) ? v : Number(v); }
    else if (a === "--quiet") o.quiet = true;
    else throw new Error("unknown argument " + a);
  }
  return o;
}

async function sha256Hex(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function fmt(x, w = 6, p = 3) { return Number.isFinite(x) ? x.toFixed(p).padStart(w) : "   nan".padStart(w); }
function pct(x) { return Number.isFinite(x) ? (100 * x).toFixed(1).padStart(5) : "  nan"; }

function summarize(runs) {
  const groups = new Map();
  for (const r of runs) {
    const key = JSON.stringify([r.task, r.beta, r.negKind, r.lambda, r.fusion, r.negWrite, r.evict, r.arm]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const rows = [];
  for (const [key, rs] of groups) {
    const [task, beta, negKind, lambda, fusion, negWrite, evict, arm] = JSON.parse(key);
    const g = (f) => rs.map(f);
    rows.push({
      task, beta, negKind, lambda, fusion, negWrite, evict, arm, n: rs.length,
      oneShot1: avg(g(r => r.oneShot[0])), oneShot2: avg(g(r => r.oneShot[1])), oneShot3: avg(g(r => r.oneShot[2])),
      oneShot23: avg(g(r => r.oneShot23)), oneShot23sd: sd(g(r => r.oneShot23)),
      acq27: avg(g(r => r.acq27)), acq27sd: sd(g(r => r.acq27)),
      frs: avg(g(r => r.frs)), frssd: sd(g(r => r.frs)), frsN: g(r => r.frs).filter(Number.isFinite).length,
      accLast: avg(g(r => r.accLast)), accProbe: avg(g(r => r.accProbe)),
      ambientAcc: avg(g(r => r.ambientAcc)), emaBg: avg(g(r => r.emaBg)),
      writesP: avg(g(r => r.writesP)), writesN: avg(g(r => r.writesN)),
      stepsPerSec: avg(g(r => r.stepsPerSec)),
    });
  }
  return rows;
}

function printSummary(rows) {
  console.log("\ntask    beta kind                lambda fusion   negw   evict arm              n  1shot p1  p2    p3   | 1shot(p2,3) sd    | acq k2-7 sd    | FRS   sd    (n) | last  probe | amb.acc surpr | writes+  writes-  | steps/s");
  for (const r of rows) {
    console.log(`${r.task.padEnd(7)} ${String(r.beta).padStart(4)} ${r.negKind.padEnd(19)} ${String(r.lambda).padStart(6)} ${r.fusion.padEnd(8)} ${r.negWrite.padEnd(6)} ${r.evict.padEnd(5)} ${r.arm.padEnd(16)} ${String(r.n).padStart(2)}  ${pct(r.oneShot1)} ${pct(r.oneShot2)} ${pct(r.oneShot3)} | ${pct(r.oneShot23)} ${fmt(r.oneShot23sd, 5)}   | ${pct(r.acq27)} ${fmt(r.acq27sd, 5)}  | ${fmt(r.frs, 5, 2)} ${fmt(r.frssd, 5, 2)} (${String(r.frsN).padStart(2)}) | ${pct(r.accLast)} ${pct(r.accProbe)} | ${pct(r.ambientAcc)}   ${fmt(r.emaBg, 5, 2)} | ${fmt(r.writesP, 7, 0)}  ${fmt(r.writesN, 7, 0)}  | ${fmt(r.stepsPerSec, 7, 0)}`);
  }
}

function printSynergy(rows) {
  const by = new Map();
  for (const r of rows) {
    const key = JSON.stringify([r.task, r.beta, r.negKind, r.lambda, r.fusion, r.negWrite, r.evict]);
    if (!by.has(key)) by.set(key, {});
    by.get(key)[r.arm] = r;
  }
  for (const [key, arms] of by) {
    if (!(arms.baseline && arms.control && arms.contrastive && arms.both)) continue;
    const [task, beta, negKind, lambda, fusion, negWrite, evict] = JSON.parse(key);
    console.log(`\n2x2 on ${task} beta=${beta} kind=${negKind} lambda=${lambda} fusion=${fusion} negwrite=${negWrite} evict=${evict}`);
    for (const m of ["oneShot23", "acq27", "frs"]) {
      const b = arms.baseline[m], c = arms.control[m] - b, k = arms.contrastive[m] - b, both = arms.both[m] - b;
      console.log(`  ${m.padEnd(10)} baseline ${fmt(b, 6)}  control ${fmt(c, 7)}  contrastive ${fmt(k, 7)}  both ${fmt(both, 7)}  sum of singles ${fmt(c + k, 7)}  synergy ${fmt(both - (c + k), 7)}`);
    }
  }
}

async function serve(port) {
  const root = new URL(".", import.meta.url).pathname;
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".md": "text/markdown; charset=utf-8" };
  Deno.serve({ port, hostname: "0.0.0.0" }, async (req) => {
    let p = new URL(req.url).pathname;
    if (p === "/") p = "/index.html";
    if (p.includes("..")) return new Response("no", { status: 400 });
    try {
      const data = await Deno.readFile(root + p);
      const ext = p.slice(p.lastIndexOf("."));
      return new Response(data, { headers: { "content-type": types[ext] ?? "application/octet-stream" } });
    } catch { return new Response("not found", { status: 404 }); }
  });
}

if (Deno.args[0] === "serve") {
  await serve(Number(Deno.args[1] ?? 8080));
} else {
  const o = parseArgs(Deno.args);
  const { adapter, device, info } = await getDevice();
  const engine = await createEngine(device);
  const wgslSha = await sha256Hex(WGSL);
  const arms = o.arms.split(",").filter(Boolean);
  const tasks = o.task.split(",").filter(Boolean);
  const betas = o.beta.split(",").map(Number);
  const kinds = o.kinds.split(",").filter(Boolean);
  const lambdas = o.lambda.split(",").map(Number);
  const fusions = o.fusion.split(",").filter(Boolean);
  const betaNegs = o.betaneg.split(",").map(Number);
  for (const f of fusions) if (!FUSIONS.includes(f)) throw new Error("unknown fusion " + f);
  if (!NEG_WRITES.includes(o.negwrite)) throw new Error("unknown negwrite " + o.negwrite);
  for (const k of kinds) if (!NEG_KINDS.includes(k)) throw new Error("unknown kind " + k);
  for (const a of arms) if (!ARMS[a]) throw new Error("unknown arm " + a);
  const runs = [];
  const started = new Date().toISOString();
  console.log(`# ${started} deno ${Deno.version.deno} adapter=${JSON.stringify(info)} wgsl sha256=${wgslSha.slice(0, 16)} label=${o.label}`);
  console.log(`# limits: maxComputeWorkgroupStorageSize=${device.limits.maxComputeWorkgroupStorageSize} maxStorageBuffersPerShaderStage=${device.limits.maxStorageBuffersPerShaderStage}`);
  for (const task of tasks) for (const beta of betas) for (const negKind of kinds) for (const lambda of lambdas) for (const fusion of fusions) for (const betaNeg of betaNegs) for (const arm of arms) {
    for (let s = 0; s < o.seeds; s++) {
      const seed = o.seedStart + s;
      const cfg = { ...defaultConfig, ...ARMS[arm], task, beta, negKind, lambda, fusion, negWrite: o.negwrite, negUnlearn: o.negunlearn, betaNeg, confuserCount: o.confuser, unlearnMin: o.unlearnmin, evict: o.evict, seed, ...(o.extra || {}) };
      const r = await runExperiment(engine, cfg, { batch: o.batch });
      const row = { task, beta, negKind, lambda, fusion, negWrite: (o.negunlearn ? o.negwrite : o.negwrite + "-nounlearn") + (betaNeg > 0 ? "-bn" + betaNeg : "") + (o.confuser > 0 ? "-conf" + o.confuser : "") + (o.unlearnmin !== 0.5 ? "-um" + o.unlearnmin : ""), evict: o.evict, arm, seed, unlearned: r.unlearned, betaNeg, confuserCount: o.confuser, unlearnMin: o.unlearnmin, tunedTheta: r.tunedTheta, tunedLambda: r.tunedLambda, writeRate: r.writeRate, confWrongPer1000: r.confWrongPer1000, confRightPer1000: r.confRightPer1000, abstainedPer1000: r.abstainedPer1000, whyNotPrecision: r.whyNotPrecision, whyNotPer1000: r.whyNotPer1000, abstain: !!(o.extra && o.extra.abstain), oneShot: r.oneShot, oneShot23: r.oneShot23, acq27: r.acq27, frs: r.frs, accLast: r.accLast, accProbe: r.accProbe, ambientAcc: r.ambientAcc, writesP: r.writesP, writesN: r.writesN, emaBg: r.emaBg, emaPat: r.emaPat, stepsPerSec: r.stepsPerSec, steps: r.steps, finalStep: r.finalStep, curve: r.curve.map(c => c.acc), trace: r.trace };
      runs.push(row);
      if (!o.quiet) console.log(`${task} b=${beta} ${negKind} l=${lambda} ${fusion} ${arm.padEnd(16)} seed=${String(seed).padStart(2)} 1shot=[${r.oneShot.map(pct).join(",")}] acq2-7=${pct(r.acq27)} frs=${fmt(r.frs, 5, 2)} amb=${pct(r.ambientAcc)} surpr=${fmt(r.emaBg, 5, 2)} w+=${r.writesP} w-=${r.writesN} unl=${r.unlearned} ${fmt(r.stepsPerSec, 6, 0)} steps/s`);
    }
  }
  const rows = summarize(runs);
  printSummary(rows);
  printSynergy(rows);
  if (o.out) {
    await Deno.writeTextFile(o.out, JSON.stringify({ started, finished: new Date().toISOString(), deno: Deno.version.deno, adapter: info, wgslSha256: wgslSha, args: o, summary: rows, runs }, null, 1));
    console.log(`# wrote ${o.out} (${runs.length} runs)`);
  }
  device.destroy?.();
}
