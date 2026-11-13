// Procedural Texture Rendering, the scene tester (ORDER 508 milestone 3, made a static page by ORDER 537): a glTF
// scene whose textures each name a procedure beside their picture, loaded in the order Daniel set (every procedure
// first; drawing starts at once from them; the pictures download beside it over several connections; each procedure
// blends into its picture as it arrives; then it is no longer computed), through a link simulated in the page and
// set in one panel after Macromedia's Simulate Download (Flash) and download-time estimate (Dreamweaver).
// The local server's link (tools/serve.py) stays as the other way to run it: link=server in the address.
// Our code, BSD 2-clause.
import { t, setLanguage, pickLanguage, language, languageTag, LANGS } from './strings.js';
import { GpuPlayer, parse, unknownParts } from './gpu-player.js';
import { GlScene, M } from './gl-scene.js';
import { PageLink } from './link.js';
import { Presentation } from './presentation.js';

const EXT = 'KHR_texture_procedural_rendering';   // the proposal's draft identifier (extension/KHR_texture_procedural_rendering)
const FORMAT_VERSION = 1;                         // the extension object's version word this player knows
const KNOWN = { p2p: [1] };                       // procedure languages and version words this player knows
const Q = new URLSearchParams(location.search);
const presets = () => [   // id, label, bits per second (0: no limit); kbit/s = 1000 bit/s
  ['d144', num(14.4, 1) + ' kbit/s ' + t('presetDialup'), 14400], ['d288', num(28.8, 1) + ' kbit/s ' + t('presetDialup'), 28800],
  ['d336', num(33.6, 1) + ' kbit/s ' + t('presetDialup'), 33600], ['d56', '56 kbit/s ' + t('presetDialup'), 56000],
  ['isdn', '128 kbit/s ' + t('presetIsdn'), 128000], ['dsl15', num(1.5, 1) + ' Mbit/s ' + t('presetDsl'), 1.5e6],
  ['dsl8', '8 Mbit/s ' + t('presetDsl'), 8e6], ['g4', '20 Mbit/s ' + t('presetMobile'), 20e6],
  ['cable', '50 Mbit/s ' + t('presetCable'), 50e6], ['fibre300', '300 Mbit/s ' + t('presetFibre'), 300e6],
  ['fibre1g', '1 Gbit/s ' + t('presetFibre'), 1e9], ['none', t(S.link === 'server' ? 'presetNoneServer' : 'presetNone'), 0], ['custom', t('custom'), -1]];
const RATES = { d144: 14400, d288: 28800, d336: 33600, d56: 56000, isdn: 128000, dsl15: 1.5e6, dsl8: 8e6, g4: 20e6, cable: 50e6, fibre300: 300e6, fibre1g: 1e9, none: 0, custom: -1 };
const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const stored = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const S = {
  speed: Q.get('speed') in RATES ? Q.get('speed') : 'd56',
  kbps: +(Q.get('kbps') || 56) > 0 ? +(Q.get('kbps') || 56) : 56,
  conns: Math.max(1, Math.min(6, +(Q.get('conns') || 6))),
  limit: Q.get('limit') === 'pictures' ? 'pictures' : 'everything',
  blend: Q.get('blend') === 'cross' ? 'cross' : 'coarse',
  blendSec: Math.max(0.1, +(Q.get('blendsec') || 2)),
  player: ['webgpu', 'wasm'].includes(Q.get('player')) ? Q.get('player') : 'auto',
  link: Q.get('link') === 'server' ? 'server' : 'page',
  detailed: Q.get('detailed') !== '0',
  detailsOpen: Q.get('details') === '1',
  motion: Q.has('motion') ? Q.get('motion') !== '0' : !reducedMotion,
  lang: pickLanguage([Q.get('lang'), stored('ptr-lang'), ...(navigator.languages || [navigator.language])]),
  proof: Q.get('proof') === '1',
  nostop: Q.get('nostop') === '1',
  tag: Q.get('tag') || 'run',
  scene: Q.get('scene') || 'scene/scene.gltf',
  full: +(Q.get('full') || 2048),
  tile: +(Q.get('tile') || 512),
  first: +(Q.get('first') || 256),
  fps: +(Q.get('fps') || 0),          // 0: every display frame; proofs draw fewer to spare the shared GPU
};
// Settings waiting for the next run stay separate from the active loader's settings.
const pending = Object.fromEntries(['speed','kbps','conns','limit','blend','blendSec','link'].map((key) => [key,S[key]]));
const presentation = new Presentation(S, pending, replay);
function replay(focus = 'restart') {
  if (pending.speed === 'custom' && !(+pending.kbps > 0)) { document.getElementById('kbps').focus(); return; }
  if (!(+pending.blendSec >= 0.1)) { document.getElementById('blendsec').reportValidity(); document.getElementById('blendsec').focus(); return; }
  const q = new URLSearchParams(location.search);
  for (const [key,value] of Object.entries(pending)) q.set(key === 'blendSec' ? 'blendsec' : key, String(value));
  q.set('lang', S.lang); q.set('detailed', S.detailed ? '1' : '0'); q.set('motion', S.motion ? '1' : '0');
  q.set('details', S.detailsOpen ? '1' : '0');
  try { sessionStorage.setItem('ptr-replay-focus', focus); } catch (e) { /* focus restoration is optional */ }
  location.search = q.toString();
}
const bitsPerSecond = () => { const r = RATES[S.speed]; return r == null ? 56000 : r < 0 ? S.kbps * 1000 : r; };
const now = () => performance.now();
// numbers as the page's language writes them (6.26 in English, 6,26 in Polish); the units are the same everywhere
const num = (x, d) => { try { return x.toLocaleString(languageTag(), { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: false }); } catch (e) { return x.toFixed(d); } };
const fmtBytes = (b) => b >= 1e6 ? num(b / 1e6, 2) + ' MB' : b >= 1e3 ? num(b / 1e3, 1) + ' KB' : b + ' B';
const fmtTime = (s) => !isFinite(s) ? '-' : s < 1 ? num(s * 1000, 0) + ' ms' : s < 90 ? num(s, 1) + ' s' : s < 5400 ? num(s / 60, 1) + ' min' : num(s / 3600, 2) + ' h';
const fmtRate = (bps) => bps >= 1e6 ? num(bps / 1e6, 2) + ' Mbit/s' : num(bps / 1e3, 1) + ' kbit/s';

const R = {          // what the run measured
  tag: S.tag, settings: { ...S, bitsPerSecond: bitsPerSecond() }, ua: navigator.userAgent,
  player: null, playerNote: null, adapter: null, firstFrame: null, firstAny: null, allIn: null, settled: null, playerOff: null,
  messages: [], comps: [], textures: [], rate: [], submissions: 0, longest: null, wasm: { calls: 0, ms: 0, ready: null },
};
let scene = null, gpu = null, worker = null, gltf = null, scriptMod = null, xr = null;
let serverThere = false;
const comps = R.comps, texs = R.textures;
// a message is kept as its key and values, so it follows the language; kind 'problem' or 'info'
const INFO = new Set(['msgSoundBlocked', 'msgNoTimestamps', 'msgNoStop', 'msgSoftwareAdapter', 'msgOwnSpeed', 'msgHidden', 'msgScriptNotRun']);
const say = (key, ...args) => {
  if (R.messages.some((m) => m.key === key && JSON.stringify(m.args) === JSON.stringify(args))) return;
  R.messages.push({ t: now(), key, args, kind: INFO.has(key) ? 'info' : 'problem' });
  render();
};

// ------------------------------------------------------------------ the link: simulated in the page, or the local server's
const pageLink = new PageLink();
async function setRate() {
  const bps = bitsPerSecond();
  if (S.link === 'server') await fetch('link', { method: 'POST', body: JSON.stringify({ rate: bps / 8 }) });
  else pageLink.setRate(bps / 8);
}
// is a link server answering beside this page? Asked only where one can be: on this machine, or when the address asks
async function findServer() {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (S.link !== 'server' && !local) return false;
  try {
    const r = await fetch('link', { cache: 'no-store' });
    if (!r.ok) return false;
    const j = await r.json();
    return typeof j.rate === 'number';
  } catch (e) { return false; }
}

class Loader {
  constructor(n) { this.n = n; this.active = 0; this.queue = []; }
  get(comp) {
    return new Promise((resolve, reject) => { this.queue.push({ comp, resolve, reject }); this.pump(); });
  }
  pump() { while (this.active < this.n && this.queue.length) this.run(this.queue.shift()); }
  async run(job) {
    const c = job.comp;
    this.active++;
    c.state = 'loading';
    c.tStart = now();
    try {
      const server = S.link === 'server';
      const r = await fetch(c.url + (server && c.limited ? '?link=1' : ''), server ? { cache: 'no-store' } : {});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      // the size the scene gave stands; else the host's, when it sends the file as it is (a compressed transfer's
      // length is not the file's)
      if (!c.size && !r.headers.get('Content-Encoding')) c.size = +r.headers.get('Content-Length') || 0;
      const reader = r.body.getReader();
      const parts = [];
      const take = (value) => {
        parts.push(value);
        c.received += value.length;
        if (c.limited) R.rate.push([now(), value.length]);
      };
      if (!server && c.limited) await pageLink.send(reader, take, c.name);
      else for (;;) { const { done, value } = await reader.read(); if (done) break; take(value); }
      const buf = new Uint8Array(c.received);
      let o = 0;
      for (const p of parts) { buf.set(p, o); o += p.length; }
      c.size = c.received;
      c.state = 'done';
      c.tEnd = now();
      job.resolve(buf.buffer);
    } catch (e) {
      c.state = 'failed';
      c.error = String(e.message || e);
      c.tEnd = now();
      job.reject(e);
    } finally {
      this.active--;
      this.pump();
    }
  }
}

function comp(name, kind, url, size, limited) {
  const c = { name, kind, url, size: size || 0, received: 0, state: 'waiting', tStart: null, tEnd: null, error: null, limited };
  comps.push(c);
  return c;
}

// ------------------------------------------------------------------ the procedure players
async function startPlayer() {
  if (S.player !== 'wasm' && navigator.gpu) {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (adapter) {
      const info = adapter.info || {};
      R.adapter = { vendor: info.vendor, architecture: info.architecture, device: info.device, description: info.description };
      const features = adapter.features.has('timestamp-query') ? ['timestamp-query'] : [];
      const device = await adapter.requestDevice({ requiredFeatures: features, requiredLimits: { maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxBufferSize: adapter.limits.maxBufferSize } });
      device.lost.then((i) => { if (!R.playerOff) say('msgProcedureFailed', 'WebGPU', 'device lost: ' + i.message); });
      gpu = new GpuPlayer(device, 'ops/');
      // a texture whose picture is in gets no more GPU work: the job running for it stops at its next operator
      gpu.cancelled = (owner) => { const tx = texs.find((x) => x.name === owner); return !S.nostop && !!tx && tx.times.picArrived != null; };
      if (!gpu.ts) say('msgNoTimestamps');
      gpu.onSubmit = (rec) => {
        R.submissions++;
        const tx = texs.find((x) => x.name === rec.owner);
        if (tx) { tx.subs++; tx.lastWork = rec.t + rec.ms; if (tx.times.stop != null && rec.t >= tx.times.stop) tx.subsAfterStop++; if (tx.times.picArrived != null && rec.t >= tx.times.picArrived) tx.subsAfterPicture++; }
        R.longest = { ...gpu.longest };
        R.longestWall = { ...gpu.longestWall };
        if (rec.gpuMs != null) R.gpuTimed = (R.gpuTimed || 0) + 1;
      };
      R.player = 'webgpu';
      R.playerNote = ['playerWebgpu', [info.vendor, info.architecture, info.description].filter(Boolean).join(' ')];
      if (info.architecture === 'swiftshader' || adapter.isFallbackAdapter) say('msgSoftwareAdapter', info.architecture || 'fallback');
      return;
    }
  }
  R.player = 'wasm';
  R.playerNote = S.player === 'wasm' ? ['playerWasmChosen'] : ['playerWasmNoWebgpu', navigator.gpu ? 'no adapter' : 'navigator.gpu is missing'];
  worker = new Worker('wasm-worker.js', { type: 'module' });
  await new Promise((resolve, reject) => {
    worker.onmessage = (ev) => { if (ev.data.kind === 'ready') { R.wasm.ready = ev.data.ms; R.wasm.bytes = ev.data.bytes; resolve(); } else reject(new Error(ev.data.error)); };
    worker.onerror = (e) => reject(new Error(e.message || 'the WebAssembly worker did not start'));
    worker.postMessage({ kind: 'init', url: 'player/ptr-player.wasm' });
  });
  let next = 1;
  const waiting = new Map();
  worker.onmessage = (ev) => {
    const m = ev.data;
    const w = waiting.get(m.id);
    if (!w) return;
    waiting.delete(m.id);
    if (m.kind === 'piece') w.resolve(m); else w.reject(new Error(m.error));
  };
  worker.piece = (script, exp, win) => new Promise((resolve, reject) => {
    const id = next++;
    waiting.set(id, { resolve, reject });
    worker.postMessage({ kind: 'piece', id, script, exp, win });
  });
}

// one piece of a texture's procedure as RGB: side pixels through window win
async function drawPiece(tx, eye, side, win, label) {
  const g = eye ? tx.gRight : tx.g;
  const text = eye ? tx.textRight : tx.text;
  const t0 = now();
  let rgb;
  if (gpu) {
    gpu.owner = tx.name;
    gpu.piece = label;
    rgb = await gpu.drawRgb(g, side, win);
  } else {
    const m = await worker.piece(text, Math.round(Math.log2(side)), win);
    R.wasm.calls++;
    R.wasm.ms += m.ms;
    tx.wasm++;
    tx.lastWork = now();
    if (tx.times.stop != null && t0 >= tx.times.stop) tx.wasmAfterStop++;
    if (tx.times.picArrived != null && t0 >= tx.times.picArrived) tx.subsAfterPicture++;
    const ms = m.ms;
    if (!R.longest || ms > R.longest.ms) R.longest = { owner: tx.name, piece: label, ms, t: t0, cpu: true };
    rgb = m.rgb;
  }
  tx.cpuMs += now() - t0;
  return rgb;
}

// the jobs: every texture's whole drawing at S.first pixels first, then its full-size tiles; a texture whose picture
// is in gets no more work (unless the negative control nostop=1 asks to keep drawing)
const jobs = [];
let jobsRunning = false;
async function runJobs() {
  if (jobsRunning) return;
  jobsRunning = true;
  while (jobs.length) {
    const j = jobs.shift();
    const tx = j.tx;
    if (!S.nostop && tx.times.picArrived != null) continue;
    if (tx.failed) continue;
    try {
      if (j.kind === 'whole') {
        const rgb = await drawPiece(tx, j.eye, S.first, { x: 0, y: 0, s: 1 }, 'whole at ' + S.first);
        if (tx.mode === 'procedure' || tx.mode === 'none') {
          scene.setProcedureWhole(tx.i, j.eye, S.first, rgb);
          if (j.eye === tx.eyes - 1 && tx.times.procFirst == null) { tx.times.procFirst = now(); tx.mode = 'procedure'; }
        }
      } else {
        const n = S.full / S.tile;
        const rgb = await drawPiece(tx, j.eye, S.tile, { x: j.x / n, y: j.y / n, s: 1 / n }, `tile ${j.x},${j.y} of ${n}x${n}`);
        if (tx.mode === 'procedure') scene.setProcedureTile(tx.i, j.eye, S.full, j.x * S.tile, j.y * S.tile, S.tile, rgb);
        tx.tiles++;
        if (tx.tiles === n * n * tx.eyes && tx.times.procFull == null) tx.times.procFull = now();
        if (S.nostop && tx.times.stop != null) jobs.push({ ...j });    // the negative control: never stops
      }
    } catch (e) {
      if (e.message === 'cancelled') { tx.cancelledJobs = (tx.cancelledJobs || 0) + 1; }
      else { tx.failed = true; say('msgProcedureFailed', tx.name, String(e.message || e)); }
    }
    await new Promise((r) => setTimeout(r, 0));
  }
  jobsRunning = false;
  maybeSettled();
}

// ------------------------------------------------------------------ the scene
async function main() {
  const askedLang = S.lang;
  try { await setLanguage(S.lang); } catch (e) { S.lang = 'en'; say('msgLanguageFailed', (LANGS.find((x) => x[0] === askedLang) || [askedLang, askedLang])[1], 'English'); }
  setupLanguage();
  applyPageStrings();
  presentation.strings();
  renderPanel();
  try { const focus = sessionStorage.getItem('ptr-replay-focus'); if (focus) { document.getElementById(focus)?.focus({preventScroll:true}); sessionStorage.removeItem('ptr-replay-focus'); } } catch (e) { /* no stored focus */ }
  serverThere = await findServer();
  if (S.link === 'server' && !serverThere) { say('msgNoServerLink'); renderPanel(); if (S.proof) finishProof(); return; }
  if (serverThere) renderPanel();
  try { scene = new GlScene(document.getElementById('scene')); } catch (e) { say('msgNoWebgl'); if (S.proof) finishProof(); return; }
  presentation.attach(scene);
  if (S.nostop) say('msgNoStop');
  if (S.link === 'server') await fetch('link/reset', { method: 'POST' });
  else pageLink.reset();
  await setRate();
  const loader = new Loader(S.conns);
  // The scene's address is outside input (the address bar): only a scene of this page's own site is loaded, and a
  // scene's script is run only when the scene lies in this page's own folder, so a link to this page cannot make it
  // run someone else's code.
  const base = new URL(S.scene, location.href);
  if (base.origin !== location.origin) { say('msgSceneElsewhere', base.origin); if (S.proof) finishProof(); return; }
  const ownScene = base.href.startsWith(new URL('.', location.href).href);
  const rel = (u) => new URL(u, base).href;
  const everything = S.limit === 'everything';
  const desc = comp(base.pathname.split('/').pop(), 'description', base.href, 0, everything);
  desc.described = true;
  const playerReady = startPlayer();
  try {
    gltf = JSON.parse(new TextDecoder().decode(await loader.get(desc)));
  } catch (e) { say('msgSceneFailed', String(e.message || e)); if (S.proof) finishProof(); return; }
  scene.initTextures(gltf.textures.length);
  // the extension's root object; a scene that names its procedures another way, or with a version word this player
  // does not know, is drawn from its pictures alone, and the panel says so
  let root = (gltf.extensions || {})[EXT];
  if (!root) {
    const other = Object.keys(gltf.extensions || {}).find((k) => gltf.extensions[k] && Array.isArray(gltf.extensions[k].procedures));
    if (other) say('msgOtherExtension', other, EXT);
  } else if (root.version !== FORMAT_VERSION) {
    say('msgFormatVersion', EXT, String(root.version), String(FORMAT_VERSION));
    root = null;
  }
  const usable = !!root;
  if (!root) root = { procedures: [] };
  const sized = (o) => (o.extras && o.extras.byteLength) || o.byteLength || 0;
  // the scene's components, named as the scene names them
  const procComps = root.procedures.map((p) => comp(p.name || p.uri, 'procedure', rel(p.uri), p.byteLength, everything));
  const modelComps = gltf.buffers.map((b) => comp(b.name || b.uri, 'model', rel(b.uri), b.byteLength, everything));
  const sceneScripts = (gltf.extras || {}).scripts || [];
  if (sceneScripts.length && !ownScene) say('msgScriptNotRun');
  const scripts = (ownScene ? sceneScripts : []).map((s) => comp(s.name || s.url, 'script', rel(s.url), s.byteLength, everything));
  const audio = (((gltf.extensions || {}).KHR_audio_emitter || {}).audio || []).filter((a) => a.uri).map((a) => comp(a.name || a.uri, 'sound', rel(a.uri), sized(a), everything));
  const picComps = gltf.images.map((im) => comp(im.name || im.uri, 'picture', rel(im.uri), sized(im), true));
  // sizes the description does not give: asked of the host (HEAD, no body), as Dreamweaver reads the files' sizes
  await Promise.all(comps.filter((c) => !c.size).map(async (c) => {
    try {
      const r = await fetch(c.url, { method: 'HEAD' });
      if (r.ok && !r.headers.get('Content-Encoding')) c.size = +r.headers.get('Content-Length') || 0;
    } catch (e) { /* the size stays unknown until the file is in; the panel says so */ }
  }));
  // the textures
  gltf.textures.forEach((tex, i) => {
    const ext = usable ? (tex.extensions || {})[EXT] : null;
    const views = ext && ext.views;
    const right = views ? views.find((v) => v.eye === 'right') : null;
    texs.push({ i, name: tex.name || 'texture ' + i, ext: !!ext, proc: ext ? ext.procedure : null, procRight: right ? right.procedure : null,
      pic: tex.source, picRight: right ? right.source : null, eyes: right ? 2 : 1, mode: 'none', tiles: 0,
      subs: 0, subsAfterStop: 0, subsAfterPicture: 0, wasm: 0, wasmAfterStop: 0, cpuMs: 0, lastWork: null, failed: false,
      times: { procArrived: null, procFirst: null, procFull: null, picQueued: null, picStart: null, picArrived: null, blendStart: null, blendEnd: null, stop: null } });
  });
  render();
  try { await playerReady; } catch (e) { say('msgProcedureFailed', 'WebAssembly', String(e.message || e)); for (const tx of texs) tx.failed = true; }
  // (1) every procedure first
  const procText = await Promise.all(procComps.map((c) => loader.get(c).then((b) => new TextDecoder().decode(b), () => null)));
  for (const tx of texs) {
    if (!tx.ext || tx.failed) continue;
    const p = root.procedures[tx.proc];
    tx.times.procArrived = procComps[tx.proc].tEnd;
    const known = KNOWN[p.language] && KNOWN[p.language].includes(p.version);
    let bad = !known ? `${p.language} version ${p.version}` : null;
    if (!bad && procText[tx.proc] == null) bad = 'not loaded';
    if (!bad) {
      try {
        tx.text = procText[tx.proc];
        tx.g = parse(tx.text);
        if (tx.eyes === 2) { tx.textRight = procText[tx.procRight]; tx.gRight = parse(tx.textRight); }
        const u = unknownParts(tx.g); if (u.length) bad = u.join(', ');
      } catch (e) { bad = e.message; }
    }
    if (bad) { tx.failed = true; say('msgUnknownVersion', tx.name, bad); continue; }
    for (let e = 0; e < tx.eyes; e++) jobs.push({ tx, eye: e, kind: 'whole' });
  }
  // the models next (the drawing needs them), while the WGSL operators these procedures use are compiled side by side
  const modelsIn = Promise.all(modelComps.map((c) => loader.get(c)));
  if (gpu) await Promise.all([...new Set(texs.filter((x) => x.g).flatMap((x) => [...x.g.nodes, ...(x.gRight ? x.gRight.nodes : [])].map((n) => n.op)))].map((op) => gpu.pipeline(op)));
  runJobs();       // (2) drawing starts at once from the procedures
  const bufs = await modelsIn;
  const map = new Map(gltf.buffers.map((b, i) => [b.uri, bufs[i]]));
  scene.load(gltf, map);
  for (const tx of texs) if (!tx.ext) tx.mode = 'none';
  requestAnimationFrame(frame);
  // full-size tiles, texture by texture
  const n = S.full / S.tile;
  for (const tx of texs) if (tx.ext && !tx.failed) for (let e = 0; e < tx.eyes; e++) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) jobs.push({ tx, eye: e, kind: 'tile', x, y });
  runJobs();
  // (3) the pictures beside the drawing, over S.conns connections; the script first, the sound last
  scripts.forEach((c) => loader.get(c).then(async (b) => {
    const url = URL.createObjectURL(new Blob([b], { type: 'text/javascript' }));
    scriptMod = await import(url);
  }, () => {}));
  for (const tx of texs) {
    for (let e = 0; e < tx.eyes; e++) {
      const ii = e ? tx.picRight : tx.pic;
      if (ii == null) continue;
      const c = picComps[ii];
      if (e === 0) { tx.times.picQueued = now(); tx.picComp = c; }
      loader.get(c).then(async (buf) => {
        const bmp = await createImageBitmap(new Blob([buf], { type: gltf.images[ii].mimeType || 'image/jpeg' }), { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
        scene.setPicture(tx.i, e, bmp);
        bmp.close();
        tx.picsIn = (tx.picsIn || 0) + 1;
        if (R.allIn == null && picComps.every((p) => p.state === 'done' || p.state === 'failed')) allPicturesIn(picComps);
        if (tx.picsIn === tx.eyes) {
          tx.times.picStart = c.tStart;
          tx.times.picArrived = c.tEnd;
          // (4) the procedure blends into its picture
          tx.times.blendStart = now();
          tx.mode = tx.failed || tx.times.procFirst == null ? 'picture' : 'blend';
          if (tx.mode === 'picture') finishTexture(tx);
        }
      }, (err) => { say('msgPictureFailed', tx.name, String(err.message || err)); tx.picFailed = true; maybeSettled(); });
    }
  }
  audio.forEach((c) => loader.get(c).then(async (b) => {
    try { const ac = new AudioContext(); await ac.decodeAudioData(b.slice(0)); c.decoded = true; ac.close(); } catch (e) { c.decodeError = String(e); }
    say('msgSoundBlocked');
  }, () => {}));
}

// every picture is in: what the page-side link has to say about the run
function allPicturesIn(picC) {
  R.allIn = Math.max(...picC.map((c) => c.tEnd || 0));
  if (S.link !== 'page') return;
  const bps = bitsPerSecond(), mr = measuredRate(0);
  const hidden = pageLink.hiddenSeconds();
  if (hidden > 1) say('msgHidden', fmtTime(hidden));
  else if (bps > 0 && mr && mr < 0.9 * bps) say('msgOwnSpeed', fmtRate(mr), fmtRate(bps));
}

// (5) the blend has ended: the procedure is no longer computed nor sampled
function finishTexture(tx) {
  tx.times.blendEnd = tx.times.blendEnd || now();
  tx.mode = 'picture';
  tx.times.stop = now();
  if (!S.nostop) scene.releaseProcedure(tx.i);
  else if (tx.ext && !tx.failed) {
    // the negative control: the procedure is drawn again and again after its picture is in
    const n = S.full / S.tile;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) jobs.push({ tx, eye: 0, kind: 'tile', x, y });
    runJobs();
  }
  maybeSettled();
}

function maybeSettled() {
  if (R.settled != null) return;
  const picC = comps.filter((c) => c.kind === 'picture');
  if (R.allIn == null && picC.length && picC.every((c) => c.state === 'done' || c.state === 'failed')) allPicturesIn(picC);
  const allTex = texs.every((tx) => tx.mode === 'picture' || tx.picFailed || (!tx.ext && tx.mode !== 'blend'));
  if (!allTex || (jobsRunning && !S.nostop)) return;
  if (!S.nostop && R.playerOff == null) {
    // nothing is left for the procedure player: it is shut down
    if (gpu) { gpu.device.destroy(); }
    if (worker) worker.terminate();
    R.playerOff = now();
  }
  // the run has settled when every texture shows its picture (or its picture failed): a texture without a
  // procedure needs no player, but its picture may still be on its way
  if (!texs.every((tx) => tx.mode === 'picture' || tx.picFailed || tx.pic == null)) return;
  R.settled = now();
  if (S.proof) setTimeout(finishProof, S.nostop ? 20000 : 3000);    // the negative control is watched longer
}

let frames = 0, motionClock = 0, lastFrameT = null;
function frame() {
  const tNow = now();
  for (const tx of texs) {
    if (tx.mode !== 'blend') continue;
    const k = (tNow - tx.times.blendStart) / (S.blendSec * 1000);
    if (k >= 1) { scene.textures[tx.i].mode = 3; finishTexture(tx); continue; }
    scene.textures[tx.i].mode = S.blend === 'cross' ? 1 : 2;
    scene.textures[tx.i].t = k;
  }
  for (const tx of texs) if (tx.mode === 'picture') scene.textures[tx.i].mode = 3;
  const ready = texs.every((tx) => !tx.ext || tx.failed || tx.times.procFirst != null || tx.mode === 'picture');
  if (!xr) {
    // the camera's own clock: it runs only while camera motion is on (the blends above never wait for it)
    if (S.motion && lastFrameT != null) motionClock += tNow - lastFrameT;
    lastFrameT = tNow;
    if (scriptMod && scriptMod.update) scriptMod.update(scene, motionClock / 1000);
    scene.frame2d();
    frames++;
    if (R.firstAny == null) R.firstAny = tNow;
    if (ready && R.firstFrame == null) {
      R.firstFrame = tNow;
      document.getElementById('first').hidden = false;
      render();
    }
    if (S.fps > 0) setTimeout(() => requestAnimationFrame(frame), 1000 / S.fps); else requestAnimationFrame(frame);
  }
}

// ------------------------------------------------------------------ WebXR: one view per eye from the session
async function setupXr(btn, line) {
  if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-vr').catch(() => false))) { ui.xrState = 'no3d'; line.textContent = t('no3d'); btn.hidden = true; return; }
  btn.hidden = false;
  btn.onclick = async () => {
    if (!scene) return;
    const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local'] });
    const gl = scene.gl;
    await gl.makeXRCompatible();
    const layer = new XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer: layer });
    const local = await session.requestReferenceSpace('local');
    // the reference space's origin at the scene's camera: poses in it are then poses in the scene
    const w = scene.cameraPose().world;
    const inv = M.invertRigid(w);
    const q = matToQuat(inv);
    const ref = local.getOffsetReferenceSpace(new XRRigidTransform({ x: inv[12], y: inv[13], z: inv[14] }, { x: q[0], y: q[1], z: q[2], w: q[3] }));
    xr = session;
    ui.xrState = 'in3d';
    ui.xrLine.textContent = t('in3d');
    const loop = (time, fr) => {
      session.requestAnimationFrame(loop);
      for (const tx of texs) if (tx.mode === 'blend' && (performance.now() - tx.times.blendStart) / (S.blendSec * 1000) >= 1) { scene.textures[tx.i].mode = 3; finishTexture(tx); }
      scene.frameXr(fr, ref, layer);
    };
    session.requestAnimationFrame(loop);
    session.addEventListener('end', () => { xr = null; ui.xrState = ''; ui.xrLine.textContent = ''; lastFrameT = null; requestAnimationFrame(frame); });
  };
}
function matToQuat(m) {
  const tr = m[0] + m[5] + m[10];
  let x, y, z, w;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; w = 0.25 * s; x = (m[6] - m[9]) / s; y = (m[8] - m[2]) / s; z = (m[1] - m[4]) / s; }
  else if (m[0] > m[5] && m[0] > m[10]) { const s = Math.sqrt(1 + m[0] - m[5] - m[10]) * 2; w = (m[6] - m[9]) / s; x = 0.25 * s; y = (m[4] + m[1]) / s; z = (m[8] + m[2]) / s; }
  else if (m[5] > m[10]) { const s = Math.sqrt(1 + m[5] - m[0] - m[10]) * 2; w = (m[8] - m[2]) / s; x = (m[4] + m[1]) / s; y = 0.25 * s; z = (m[9] + m[6]) / s; }
  else { const s = Math.sqrt(1 + m[10] - m[0] - m[5]) * 2; w = (m[1] - m[4]) / s; x = (m[8] + m[2]) / s; y = (m[9] + m[6]) / s; z = 0.25 * s; }
  return [x, y, z, w];
}

// ------------------------------------------------------------------ the page's own text and its language
const PAGE_TEXT = { skip: 'skip', 'h-title': 'hTitle', 'h-lead': 'hLead', 'h-next': 'hNext', 'h-status': 'hStatus', 'l-lang': 'language',
  'h-scene': 'hScene', 'h-about': 'hAbout', 'a-how-h': 'aHowH', 'a-sim-h': 'aSimH', 'a-sim': 'aSim', 'a-who-h': 'aWhoH', 'a-who': 'aWho',
  'a-fmt-h': 'aFmtH', 'a-fmt': 'aFmt', 'a-fmt-link': 'aFmtLink', 'a-3d-h': 'a3dH', 'a-3d': 'a3d', 'a-credits-h': 'aCreditsH',
  'a-credits': 'aCredits', 'a-credits-link': 'aCreditsLink', 'a-licence-link': 'aLicenceLink', 'a-run-h': 'aRunH', 'a-run': 'aRun' };
function applyPageStrings() {
  document.documentElement.lang = languageTag();
  document.title = t('docTitle');
  for (const [id, key] of Object.entries(PAGE_TEXT)) { const e = document.getElementById(id); if (e) e.textContent = t(key); }
  const how = document.getElementById('a-how');
  if (how) [...how.children].forEach((li, i) => { li.textContent = t('aHow' + (i + 1)); });
}
function setupLanguage() {
  const sel = document.getElementById('lang');
  sel.textContent = '';
  for (const [code, name, tag] of LANGS) {
    const o = el('option', { value: code, textContent: name, selected: code === language() });
    o.lang = tag;
    sel.append(o);
  }
  sel.onchange = async () => {
    const asked = sel.value;
    try { await setLanguage(asked); } catch (e) { sel.value = language(); say('msgLanguageFailed', (LANGS.find((x) => x[0] === asked) || [asked, asked])[1], (LANGS.find((x) => x[0] === language()) || LANGS[0])[1]); return; }
    S.lang = language();
    try { localStorage.setItem('ptr-lang', S.lang); } catch (e) { /* a browser that keeps nothing: the choice lasts for this visit */ }
    const q = new URLSearchParams(location.search);
    q.set('lang', S.lang);
    history.replaceState(null, '', location.pathname + '?' + q.toString());
    applyPageStrings();
    presentation.strings();
    renderPanel();
    render();
  };
}

// ------------------------------------------------------------------ the panel
const el = (tag, attrs = {}, ...kids) => { const e = document.createElement(tag); Object.assign(e, attrs); for (const k of kids) e.append(k); return e; };
const setText = (e, s) => { if (e.textContent !== s) e.textContent = s; };
const setAttr = (e, k, v) => { if (e.getAttribute(k) !== String(v)) e.setAttribute(k, v); };
// A table keeps its meaning for assistive technology when a narrow window lays its rows out as blocks: the roles
// are stated (a browser drops them from a table whose display is changed), and each cell carries its column's name
// for the block layout.
function tableRoles(table, name) {
  table.setAttribute('role', 'table');
  if (name) table.setAttribute('aria-label', name);
  for (const g of table.querySelectorAll('thead, tbody')) g.setAttribute('role', 'rowgroup');
  for (const r of table.querySelectorAll('tr')) rowRoles(r);
}
function rowRoles(tr, labels) {
  tr.setAttribute('role', 'row');
  [...tr.children].forEach((c, i) => {
    c.setAttribute('role', c.tagName === 'TD' ? 'cell' : c.scope === 'row' ? 'rowheader' : 'columnheader');
    if (labels && labels[i]) c.dataset.label = labels[i];
  });
}
// a bar that fills: its value is also said in words (role progressbar with a value text)
function makeBar(id) {
  const fill = el('i'), text = el('b');
  const bar = el('div', { className: 'bar' }, fill, text);
  if (id) bar.id = id;
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  return { bar, fill, text };
}
function setBar(b, frac, text, cls, label) {
  const pct = Math.max(0, Math.min(100, 100 * frac));
  const w = pct.toFixed(1) + '%';
  if (b.fill.style.width !== w) b.fill.style.width = w;
  const cn = 'bar' + (cls ? ' ' + cls : '');
  if (b.bar.className !== cn) b.bar.className = cn;
  setAttr(b.bar, 'aria-valuenow', pct.toFixed(0));
  setAttr(b.bar, 'aria-valuetext', text);
  if (label) setAttr(b.bar, 'aria-label', label);
  if (b.text) setText(b.text, text);
}

let ui = {};
function renderPanel() {
  const p = document.getElementById('panel');
  const hadFocus = document.activeElement && p.contains(document.activeElement) ? document.activeElement.id : null;
  p.textContent = '';
  ui = { xrState: ui.xrState || '', detailRows: [], tlRows: [] };
  ui.head = el('p', { className: 'headline' });
  ui.head.setAttribute('role', 'status');
  ui.linkNote = el('p', { className: 'note', textContent: t(S.link === 'server' ? 'linkServer' : 'linkPage') });
  p.append(el('h2', { id: 'panel-title', textContent: t('panel') }), ui.head, el('p', { className: 'note', textContent: t('panelNote') }), ui.linkNote);
  const lab = (text, id) => { const l = el('label', { textContent: text }); l.htmlFor = id; return l; };
  const row = (label, id, ...k) => el('div', { className: 'row' }, lab(label, id), ...k);
  // the link: a choice only where a link server answers beside the page
  let linkSel = null;
  if (serverThere) {
    linkSel = el('select', { id: 'link' }, el('option', { value: 'page', textContent: t('linkChoicePage'), selected: pending.link === 'page' }), el('option', { value: 'server', textContent: t('linkChoiceServer'), selected: pending.link === 'server' }));
    p.append(row(t('linkChoice'), 'link', linkSel));
  }
  const sel = el('select', { id: 'speed' });
  for (const [id, label] of presets()) sel.append(el('option', { value: id, textContent: label, selected: id === pending.speed }));
  const kb = el('input', { id: 'kbps', type: 'number', min: 0.1, step: 0.1, value: pending.kbps, hidden: pending.speed !== 'custom' });
  kb.setAttribute('aria-label', t('customLabel'));
  const kbErr = el('div', { className: 'field-error', id: 'kbps-error', hidden: true });
  kbErr.setAttribute('role', 'alert');
  kb.setAttribute('aria-describedby', 'kbps-error');
  sel.onchange = async () => {
    S.speed = pending.speed = sel.value;
    kb.hidden = S.speed !== 'custom';
    R.settings.bitsPerSecond = bitsPerSecond();
    presentation.speedChoices();
    await setRate();
    render();
  };
  kb.oninput = () => {
    pending.kbps = kb.value;
    const valid = +kb.value > 0;
    kbErr.hidden = valid;
    kbErr.textContent = valid ? '' : t('customBad', fmtRate(bitsPerSecond()));
    if (valid) kb.removeAttribute('aria-invalid'); else kb.setAttribute('aria-invalid','true');
  };
  kb.onchange = async () => {
    kb.oninput();
    if (!(+kb.value > 0)) return;
    S.kbps = +kb.value;
    R.settings.bitsPerSecond = bitsPerSecond();
    await setRate();
    render();
  };
  const conns = el('select', { id: 'conns' });
  for (let i = 1; i <= 6; i++) conns.append(el('option', { value: i, textContent: String(i), selected: i === +pending.conns }));
  const lim = el('select', { id: 'limit' }, el('option', { value: 'pictures', textContent: t('limitPictures'), selected: pending.limit === 'pictures' }), el('option', { value: 'everything', textContent: t('limitEverything'), selected: pending.limit === 'everything' }));
  const bl = el('select', { id: 'blend' }, el('option', { value: 'coarse', textContent: t('blendCoarse'), selected: pending.blend === 'coarse' }), el('option', { value: 'cross', textContent: t('blendCross'), selected: pending.blend === 'cross' }));
  const bs = el('input', { id: 'blendsec', type: 'number', min: 0.1, step: 0.1, value: pending.blendSec });
  const det = el('input', { id: 'detailed', type: 'checkbox', checked: S.detailed });
  det.onchange = () => { S.detailed = det.checked; render(); };
  const mot = el('input', { id: 'motion', type: 'checkbox', checked: S.motion });
  mot.onchange = () => { S.motion = mot.checked; };
  for (const [input, key] of [[conns,'conns'],[lim,'limit'],[bl,'blend'],[bs,'blendSec'],[linkSel,'link']]) {
    if (!input) continue;
    const note = el('span', { id: input.id + '-pending', className:'pending', hidden: true });
    note.setAttribute('role','status');
    input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), note.id].filter(Boolean).join(' '));
    input._pendingNote = note;
    input.oninput = input.onchange = () => { pending[key] = input.value; presentation.pendingNotes(); };
  }
  const check = (input, text) => { const l = el('label', { className: 'check' }, input, ' ' + text); return l; };
  p.append(row(t('speed'), 'speed', sel, kb, kbErr), row(t('connections'), 'conns', conns), row(t('limitTo'), 'limit', lim), row(t('blend'), 'blend', bl), row(t('blendSeconds'), 'blendsec', bs),
    el('div', { className: 'row' }, check(det, t('detailed')), check(mot, t('motion'))));
  for (const input of [sel,kb,conns,lim,bl,bs,linkSel]) if (input?._pendingNote) input.parentElement.append(input._pendingNote);
  presentation.pendingNotes();
  if (!(+pending.kbps > 0)) kb.onchange();
  if (reducedMotion) p.append(el('p', { className: 'note', textContent: t('motionReduced') }));
  // sizes and times
  ui.sumRows = [];
  const sumBody = el('tbody');
  for (let i = 0; i < 5; i++) {
    const th = el('th'), a = el('td', { className: 'num' }), b = el('td', { className: 'num' });
    th.scope = 'row';
    sumBody.append(el('tr', {}, th, a, b));
    ui.sumRows.push([th, a, b]);
  }
  const sumHead = el('tr');
  for (const k of ['summaryPart', 'size', 'summaryTime']) { const h = el('th', { textContent: t(k), className: 'sr' }); h.scope = 'col'; sumHead.append(h); }
  ui.summary = el('table', { id: 'summary' }, el('thead', {}, sumHead), sumBody);
  tableRoles(ui.summary, t('summary'));
  ui.stream = makeBar('stream');
  ui.stream.text = null;
  ui.stream.bar.removeChild(ui.stream.bar.lastChild);
  ui.streamText = el('p', { className: 'note' });
  // the timeline: a chart, and the same times as a table
  ui.timeline = el('canvas', { id: 'timeline' });
  ui.timeline.setAttribute('role', 'img');
  ui.timeline.setAttribute('aria-label', t('timelineAlt'));
  const legend = el('div', { className: 'legend' });
  for (const [k, c] of [['legendProcedure', 'proc'], ['legendDownload', 'down'], ['legendBlend', 'blend'], ['legendPicture', 'pic'], ['legendTick', 'tick']]) legend.append(el('span', {}, el('i', { className: c }), t(k)));
  const tlHead = el('tr');
  for (const k of ['tlTexture', 'tlProcedure', 'tlDownload', 'tlBlend', 'tlStopped', 'tlLastWork']) { const h = el('th', { textContent: t(k) }); h.scope = 'col'; tlHead.append(h); }
  ui.tlBody = el('tbody');
  ui.tlTable = el('table', { id: 'timeline-table' }, el('thead', {}, tlHead), ui.tlBody);
  tableRoles(ui.tlTable, t('timelineTable'));
  ui.tlDetails = el('details', { id: 'timeline-details' }, el('summary', { textContent: t('timelineTable') }), ui.tlTable);
  ui.player = el('div');
  ui.msgs = document.getElementById('msgs');
  ui.msgs.setAttribute('role', 'status');
  ui.xrBtn = el('button', { id: 'enter3d', type: 'button', textContent: t('enter3d'), hidden: true });
  ui.xrLine = el('p', { className: 'note', textContent: ui.xrState ? t(ui.xrState) : '' });
  // the detailed view: one row for every scene component
  const dHead = el('tr');
  for (const k of ['component', 'kind', 'size', 'state']) { const h = el('th', { textContent: t(k) }); h.scope = 'col'; dHead.append(h); }
  ui.detailBody = el('tbody');
  ui.detail = el('table', { id: 'detail' }, el('thead', {}, dHead), ui.detailBody);
  tableRoles(ui.detail, t('component'));
  p.append(el('h3', { textContent: t('summary') }), ui.summary, el('h3', { textContent: t('simulated') }), ui.stream.bar, ui.streamText,
    el('h3', { textContent: t('timeline') }), legend, ui.timeline, ui.tlDetails, el('h3', { textContent: t('player') }), ui.player,
    el('div', { className: 'row' }, ui.xrBtn), ui.xrLine, ui.detailHead = el('h3', { textContent: t('component') }), ui.detail);
  setupXr(ui.xrBtn, ui.xrLine);
  if (hadFocus && document.getElementById(hadFocus)) document.getElementById(hadFocus).focus();
  presentation.revealAddressTarget();
  render();
}

function measuredRate(windowMs) {
  const r = R.rate;
  if (r.length < 2) return null;
  const tEnd = r[r.length - 1][0];
  let bytes = 0, k = r.length - 1;
  if (windowMs) {
    while (k > 0 && r[k - 1][0] >= tEnd - windowMs) { bytes += r[k][1]; k--; }
    const span = tEnd - r[k][0];
    return span > 0 ? bytes * 8 / (span / 1000) : null;
  }
  for (let i = 1; i < r.length; i++) bytes += r[i][1];
  const span = tEnd - r[0][0];
  return span > 0 ? bytes * 8 / (span / 1000) : null;
}

const KIND_KEY = { description: 'kindDescription', procedure: 'kindProcedure', model: 'kindModel', picture: 'kindPicture', script: 'kindScript', sound: 'kindSound' };
const compName = (c) => c.described ? `${c.name} (${t('kindDescription')})` : c.name;

function render() {
  if (!ui.summary) return;
  const bps = bitsPerSecond();
  const time = (b) => bps > 0 ? fmtTime(b * 8 / bps) : '-';
  const sum = (k) => comps.filter((c) => k(c)).reduce((a, c) => a + c.size, 0);
  const proc = sum((c) => c.kind === 'procedure'), pic = sum((c) => c.kind === 'picture');
  const other = sum((c) => c.kind !== 'procedure' && c.kind !== 'picture');
  const nP = comps.filter((c) => c.kind === 'procedure').length, nI = comps.filter((c) => c.kind === 'picture').length;
  const limited = (b, kind) => S.limit === 'everything' || kind === 'picture' ? time(b) : t('noLimit');
  const firstBytes = S.limit === 'everything' ? sum((c) => c.kind !== 'picture' && c.kind !== 'script' && c.kind !== 'sound') : 0;
  const usable = (() => {
    const est = S.limit === 'everything' ? (bps > 0 ? time(firstBytes) : t('noLimit')) : t(R.firstFrame != null ? 'notLimitedShort' : 'notLimited');
    return R.firstFrame != null ? t('usableBoth', est, fmtTime(R.firstFrame / 1000)) : est;
  })();
  const rows = [[t('procedures') + ` (${nP})`, fmtBytes(proc), limited(proc, 'procedure')],
    [t('pictures') + ` (${nI})`, fmtBytes(pic), limited(pic, 'picture')],
    [t('otherParts'), fmtBytes(other), limited(other, 'other')],
    [t('total'), fmtBytes(proc + pic + other), S.limit === 'everything' ? time(proc + pic + other) : time(pic)],
    [t('usableAfter'), '', usable]];
  rows.forEach((r, i) => r.forEach((s, k) => setText(ui.sumRows[i][k], s)));
  setText(ui.head, R.firstFrame != null ? t('headline', fmtTime(R.firstFrame / 1000), fmtBytes(proc), fmtBytes(pic), bps > 0 ? time(pic) : t('noLimit'))
    : t('headlineWait', fmtBytes(proc), fmtBytes(pic), bps > 0 ? time(pic) : t('noLimit')));
  if (R.firstFrame != null) setText(document.getElementById('first'), t('firstFrame', fmtTime(R.firstFrame / 1000)));
  const lim = comps.filter((c) => c.limited);
  const got = lim.reduce((a, c) => a + c.received, 0), all = lim.reduce((a, c) => a + Math.max(c.size, c.received), 0) || 1;
  const el0 = now() / 1000;
  const mr = measuredRate(R.allIn ? 0 : 3000);
  const left = bps > 0 ? (all - got) * 8 / bps : 0;
  const streamText = [fmtBytes(got) + ' / ' + fmtBytes(all), R.allIn ? t('done', fmtTime(R.allIn / 1000)) : t('elapsed', fmtTime(el0)) + ', ' + t('remaining', fmtTime(left)),
    mr ? t('measured', fmtRate(mr), bps > 0 ? fmtRate(bps) : t('noLimit')) : ''].filter(Boolean).join(' · ');
  setBar(ui.stream, got / all, streamText, got >= all && lim.length ? 'done' : '', t('simulated'));
  setText(ui.streamText, streamText);
  ui.detail.hidden = ui.detailHead.hidden = !S.detailed;
  if (S.detailed) {
    comps.forEach((c, i) => {
      let r = ui.detailRows[i];
      if (!r) {
        const name = el('td'), kind = el('td'), size = el('td', { className: 'num' }), b = makeBar();
        const tr = el('tr', {}, name, kind, size, el('td', {}, b.bar));
        rowRoles(tr, [null, t('kind'), t('size'), null]);
        ui.detailBody.append(tr);
        r = ui.detailRows[i] = { name, kind, size, b };
      }
      const frac = c.size ? Math.min(1, c.received / c.size) : (c.state === 'done' ? 1 : 0);
      const st = c.state === 'done' ? t('arrived', fmtTime(c.tEnd / 1000)) : c.state === 'failed' ? t('failed', c.error)
        : c.state === 'loading' ? (c.size ? t('loading') + ' ' + num(100 * frac, 0) + ' %' : t('loading') + ' ' + fmtBytes(c.received)) : t('waiting');
      setText(r.name, compName(c));
      setText(r.kind, t(KIND_KEY[c.kind]));
      setText(r.size, c.size ? fmtBytes(c.size) : t('unknownSize'));
      setBar(r.b, frac, st, c.state === 'done' ? 'done' : c.state === 'failed' ? 'bad' : c.kind === 'procedure' ? 'proc' : '', compName(c));
    });
  }
  drawTimeline();
  renderTimelineTable();
  const lines = [R.playerNote ? t(...R.playerNote) : ''];
  if (R.longest) {
    const gms = R.longest.gpuMs != null;
    lines.push(t(R.player === 'wasm' ? 'longestPiece' : gms ? 'longest' : 'longestWall') + ': ' + t('longestValue', num(gms ? R.longest.gpuMs : R.longest.ms, gms ? 2 : 1), R.longest.owner, R.longest.piece));
    if (gms && R.longestWall) lines.push(t('longestWall') + ': ' + t('longestValue', num(R.longestWall.ms, 1), R.longestWall.owner, R.longestWall.piece));
  }
  if (R.player === 'webgpu') lines.push(t('submissions', R.submissions, texs.reduce((a, x) => a + x.subsAfterStop, 0)));
  if (R.player === 'wasm') lines.push(t('wasmCalls', R.wasm.calls, texs.reduce((a, x) => a + x.wasmAfterStop, 0)));
  if (R.playerOff) lines.push(t('playerOff'));
  syncLines(ui.player, lines.filter(Boolean).map((s) => ({ text: s, cls: '' })));
  syncLines(ui.msgs, R.messages.map((m) => ({ text: (m.kind === 'problem' ? t('problem') + ' ' : '') + t(m.key, ...m.args), cls: m.kind })));
  syncLines(document.getElementById('problems'), R.messages.filter((m) => m.kind === 'problem').map((m) => ({ text: t('problem') + ' ' + t(m.key,...m.args), cls:'problem' })));
  // the words for what the 3D view shows
  const nTex = texs.length, nPic = texs.filter((x) => x.mode === 'picture').length;
  presentation.render(R, texs, fmtBytes, fmtTime);
  setText(document.getElementById('scene-text'), t('sceneText') + ' ' + (presentation.comparisonText || (nTex ? t('sceneState', nPic, nTex) : t('sceneStateWait'))));
}

// keep a list of lines in step with what is to be shown, touching only what changed (a live region says only changes)
function syncLines(box, lines) {
  while (box.children.length > lines.length) box.lastChild.remove();
  lines.forEach((l, i) => {
    let d = box.children[i];
    if (!d) { d = el('div'); box.append(d); }
    setText(d, l.text);
    if (d.className !== l.cls) d.className = l.cls;
  });
}

function renderTimelineTable() {
  const sec = (x) => fmtTime(x / 1000);
  texs.forEach((tx, i) => {
    let r = ui.tlRows[i];
    if (!r) {
      const th = el('th'); th.scope = 'row';
      const cells = [0, 1, 2, 3, 4].map(() => el('td'));
      const tr = el('tr', {}, th, ...cells);
      rowRoles(tr, [null, t('tlProcedure'), t('tlDownload'), t('tlBlend'), t('tlStopped'), t('tlLastWork')]);
      ui.tlBody.append(tr);
      r = ui.tlRows[i] = [th, ...cells];
    }
    const T = tx.times, pc = tx.picComp;
    const span = (a, b) => a == null ? t('tlNotYet') : b == null ? t('tlFrom', sec(a)) : t('tlFromTo', sec(a), sec(b));
    const vals = [tx.name,
      T.procFirst == null ? (!tx.ext || tx.failed ? '-' : T.blendStart != null ? t('pictureFirst') : t('tlNotYet')) : span(T.procFirst, T.blendStart),
      pc && pc.tStart != null ? span(pc.tStart, pc.tEnd) : t('tlNotYet'),
      T.blendStart != null && T.procFirst != null ? span(T.blendStart, T.stop) : (T.stop != null ? '-' : t('tlNotYet')),
      T.stop != null ? sec(T.stop) : t('tlNotYet'),
      tx.lastWork != null ? sec(tx.lastWork) : t('tlNotYet')];
    vals.forEach((s, k) => setText(r[k], s));
  });
}

function drawTimeline() {
  const c = ui.timeline;
  const w = c.clientWidth || 430, rowH = 20, h = 18 + rowH * Math.max(1, texs.length);
  c.style.height = h + 'px';
  if (c.width !== Math.round(w * devicePixelRatio) || c.height !== Math.round(h * devicePixelRatio)) { c.width = Math.round(w * devicePixelRatio); c.height = Math.round(h * devicePixelRatio); }
  const g = c.getContext('2d');
  g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue(n).trim();
  g.clearRect(0, 0, w, h);
  const x0 = Math.min(118, Math.round(w * 0.34)), end = Math.max(now(), 1000), sx = (w - x0 - 4) / end;
  const X = (tm) => x0 + tm * sx;
  g.font = '12px system-ui, sans-serif'; g.fillStyle = col('--muted');
  for (let q = 0; q <= 4; q++) {
    const tx0 = x0 + (w - x0 - 4) * q / 4;
    g.fillRect(tx0, 13, 1, 3);
    const label = q ? fmtTime(end * q / 4000) : '0';
    g.fillText(label, Math.min(tx0 - (q ? g.measureText(label).width / 2 : 0), w - g.measureText(label).width), 11);
  }
  texs.forEach((tx, k) => {
    const y = 18 + k * rowH;
    g.fillStyle = col('--fg');
    let name = tx.name;
    while (name.length > 3 && g.measureText(name).width > x0 - 6) name = name.slice(0, -2) + '…';
    g.fillText(name, 0, y + 13);
    const T = tx.times;
    const seg = (a, b) => a == null ? null : [X(a), Math.max(1, X(b == null ? now() : b) - X(a))];
    // drawn from its procedure: a filled bar
    const sp = seg(T.procFirst, T.blendStart);
    if (sp) { g.fillStyle = col('--proc'); g.fillRect(sp[0], y + 3, sp[1], rowH - 9); }
    // its picture downloading: a thin line under the bar
    const pc = tx.picComp;
    if (pc && pc.tStart != null) { g.fillStyle = col('--down'); g.fillRect(X(pc.tStart), y + rowH - 5, Math.max(1, X(pc.tEnd == null ? now() : pc.tEnd) - X(pc.tStart)), 3); }
    // the blend: upright stripes (a shape as well as a colour)
    const sb = seg(T.blendStart, T.stop);
    if (sb && T.procFirst != null) {
      g.fillStyle = col('--blend');
      for (let x = sb[0]; x < sb[0] + sb[1]; x += 5) g.fillRect(x, y + 3, Math.min(3, sb[0] + sb[1] - x), rowH - 9);
      g.strokeStyle = col('--blend'); g.lineWidth = 1; g.strokeRect(sb[0] + 0.5, y + 3.5, Math.max(1, sb[1] - 1), rowH - 10);
    }
    // the picture alone, its procedure stopped: an outlined bar
    const ss = seg(T.stop, null);
    if (ss) { g.strokeStyle = col('--pic'); g.lineWidth = 2; g.strokeRect(ss[0] + 1, y + 4, Math.max(1, ss[1] - 2), rowH - 11); }
    if (tx.lastWork != null) { g.fillStyle = col('--fg'); g.fillRect(X(tx.lastWork), y + 1, 2, rowH - 4); }
    if (tx.failed || tx.picFailed) { g.fillStyle = col('--bad'); g.fillText('!', w - 10, y + 13); }
    if (T.procFirst == null && T.blendStart != null && tx.ext && !tx.failed) {
      // the words on a ground of their own, so the lines of the chart do not run through them
      const label = t('pictureFirst'), lw = g.measureText(label).width;
      const lx = Math.min(X(T.blendStart) + 6, w - lw - 8);
      g.fillStyle = col('--panel'); g.fillRect(lx - 3, y + 1, lw + 6, rowH - 3);
      g.fillStyle = col('--muted'); g.fillText(label, lx, y + 13);
    }
  });
}
setInterval(render, 250);

// ------------------------------------------------------------------ proofs: the state and the results, read by the driver
window.testerState = () => ({
  t: now(), firstFrame: R.firstFrame, allIn: R.allIn, settled: R.settled, playerOff: R.playerOff, player: R.player, link: S.link,
  comps: comps.map((c) => ({ name: c.name, kind: c.kind, state: c.state, received: c.received, size: c.size })),
  textures: texs.map((x) => ({ name: x.name, mode: x.mode, failed: x.failed, tiles: x.tiles, subs: x.subs, times: x.times })),
  messages: R.messages.map((m) => t(m.key, ...m.args)),
  comparison: { ready:presentation.ready, holding:presentation.holding, method:presentation.method, saved:presentation.saved.size },
  jobs: jobs.length, jobsRunning, submissions: R.submissions, motion: S.motion, motionClock, lang: language(),
});
window.testerResult = null;
function finishProof() {
  R.end = now();
  R.measuredWhole = measuredRate(0);
  R.frames = frames;
  R.messageTexts = R.messages.map((m) => t(m.key, ...m.args));
  if (gpu) R.submissionLog = gpu.submissions.map((s) => [s.owner, s.piece, +s.t.toFixed(2), +s.ms.toFixed(3), s.gpuMs == null ? null : +s.gpuMs.toFixed(4)]);
  if (S.link === 'page') { R.linkLog = pageLink.log; R.linkArrived = pageLink.arrived; R.hiddenSeconds = pageLink.hiddenSeconds(); }
  window.testerResult = JSON.stringify(R, (k, v) => (k === 'picComp' || k === 'g' || k === 'gRight' || k === 'text' || k === 'textRight' ? undefined : v));
}

main().catch((e) => { say('msgProcedureFailed', 'tester', String(e.stack || e)); if (S.proof) finishProof(); });
