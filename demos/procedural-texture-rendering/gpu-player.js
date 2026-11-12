// The WebGPU procedure player of the scene tester (ORDER 508, milestone 3). Its drawing code is milestone 2e's page
// (src/web/app.js: every modern operator by its WGSL twin, Quad, Grid and Stack), changed in one way: every operator
// is its own submission, so a heavy procedure is drawn in bounded pieces (a tile of the picture, one operator, one
// pass), and every submission is timed and counted for the texture it belongs to (ORDER 525: one WebGPU job over 2 s is
// cut by amdgpu's watchdog on old GPUs). Our code, BSD 2-clause.

const f32 = Math.fround;
const bitsToF = (w) => { const b = new DataView(new ArrayBuffer(4)); b.setUint32(0, w >>> 0, true); return b.getFloat32(0, true); };
export const MODERN = { Noise: 'noise', Cells: 'cells', Tiles: 'tiles', Ramp: 'ramp', Layer: 'layer', Shade: 'shade', Scatter: 'scatter', Wear: 'wear', Tint: 'tint', Quad: 'quad', Grid: 'grid', Stack: 'stack' };
// the highest version word each operator draws (src/ops/NAME.zig, the version row of each parameter table)
export const VERSIONS = { Noise: 1, Cells: 2, Tiles: 4, Ramp: 1, Layer: 2, Shade: 2, Scatter: 2, Wear: 1, Tint: 1, Quad: 1, Grid: 1, Stack: 1 };

export function parse(text) {
  const nodes = [];
  const index = new Map();
  let root = -1;
  for (const raw of text.split('\n')) {
    const t = raw.trim().split(/\s+/);
    if (!t[0] || t[0].startsWith('#')) continue;
    if (t[0] === 'out') { root = index.get(t[1]); continue; }
    const nd = { id: t[0], op: t[1], ins: [], words: [], strs: [], line: raw.trim() };
    if (t[2] !== '-') for (const n of t[2].split(',')) {
      if (!index.has(n)) throw new Error(`${t[0]}: input ${n} is not defined above it`);
      nd.ins.push(index.get(n));
    }
    for (const w of t.slice(3)) { if (w.startsWith('s=')) nd.strs.push(w); else nd.words.push(parseInt(w, 16) >>> 0); }
    index.set(t[0], nodes.length);
    nodes.push(nd);
  }
  if (root === undefined || root < 0) throw new Error('no out line');
  return { nodes, root };
}

// what this player cannot draw: [] when it can draw everything
export function unknownParts(g) {
  const out = [];
  for (const nd of g.nodes) {
    if (!MODERN[nd.op]) out.push(`${nd.op} (not one of the modern operators this player draws)`);
    else if (!(nd.words[0] >= 1 && nd.words[0] <= VERSIONS[nd.op])) out.push(`${nd.op} version ${nd.words[0]} (this player knows 1 to ${VERSIONS[nd.op]})`);
  }
  return out;
}

function marginOf(nd) {
  if (nd.op === 'Shade') return nd.words[0] >= 2 ? f32(Math.max(f32(1e-9), bitsToF(nd.words[7]))) : f32(1e-9);
  if (nd.op === 'Wear') return f32(bitsToF(nd.words[1] === 2 ? nd.words[3] : nd.words[2]));
  return 0;
}
function canvasFor(g, side, win, mForced) {
  let reach = f32(0);
  let any = false;
  for (let i = 0; i <= g.root; i++) {
    const nd = g.nodes[i];
    if (!MODERN[nd.op]) continue;
    const r = marginOf(nd);
    if (r > 0) any = true;
    reach = f32(reach + r);
  }
  const pxs = f32(f32(win.s) / f32(side));
  let m = any ? Math.ceil(f32(reach / pxs)) + 2 : 0;
  m = (m + 1) & ~1;
  if (mForced !== undefined) m = mForced;
  return { w: side + 2 * m, h: side + 2 * m, m, wx: win.x, wy: win.y, ws: win.s, side };
}
function needed(g) {
  const need = new Array(g.nodes.length).fill(false);
  need[g.root] = true;
  for (let i = g.root; i >= 0; i--) if (need[i]) for (const k of g.nodes[i].ins) need[k] = true;
  return need;
}
function quadPart(g, r) {
  const keep = new Set();
  const visit = (i) => { if (keep.has(i)) return; keep.add(i); for (const j of g.nodes[i].ins) visit(j); };
  visit(r);
  const order = [...keep].sort((a, b) => a - b);
  const map = new Map(order.map((i, k) => [i, k]));
  const nodes = order.map((i) => ({ ...g.nodes[i], ins: g.nodes[i].ins.map((j) => map.get(j)) }));
  return { nodes, root: map.get(r) };
}

export class GpuPlayer {
  constructor(device, opsUrl = 'ops/') {
    this.device = device;
    this.opsUrl = opsUrl;
    this.pipes = new Map();
    this.owner = '';                 // the texture the running job belongs to
    this.piece = '';                 // and which piece of it
    this.submissions = [];           // { owner, piece, t (ms since page start), ms }
    this.longest = { ms: 0, owner: '', piece: '' };
    this.onSubmit = null;
    this.cancelled = null;          // (owner) => true when that texture's procedure is no longer wanted
    // the GPU's own time of each compute pass, where the browser offers timestamps (WebGPU 'timestamp-query')
    this.ts = device.features.has('timestamp-query');
    if (this.ts) {
      this.qs = device.createQuerySet({ type: 'timestamp', count: 2 });
      this.qres = device.createBuffer({ size: 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
      this.qread = device.createBuffer({ size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    }
  }

  // a compute pass, with its beginning and end stamped on the GPU when the browser can
  beginPass(enc) {
    return enc.beginComputePass(this.ts ? { timestampWrites: { querySet: this.qs, beginningOfPassWriteIndex: 0, endOfPassWriteIndex: 1 } } : {});
  }

  // one submission: refused when its texture no longer wants the procedure (the job stops at the next operator);
  // timed by the wall clock (submit to done) and, for a pass, by the GPU's own stamps
  async submit(enc, stamped = true) {
    if (this.cancelled && this.cancelled(this.owner)) throw new Error('cancelled');
    if (this.ts && stamped) {
      enc.resolveQuerySet(this.qs, 0, 2, this.qres, 0);
      enc.copyBufferToBuffer(this.qres, 0, this.qread, 0, 16);
    }
    const t0 = performance.now();
    const cb = enc.finish();
    this.device.queue.submit([cb]);
    await this.device.queue.onSubmittedWorkDone();
    const ms = performance.now() - t0;
    let gpuMs = null;
    if (this.ts && stamped) {
      await this.qread.mapAsync(GPUMapMode.READ);
      const q = new BigUint64Array(this.qread.getMappedRange().slice(0));
      this.qread.unmap();
      gpuMs = q[1] >= q[0] ? Number(q[1] - q[0]) / 1e6 : null;
    }
    const rec = { owner: this.owner, piece: this.piece, t: t0, ms, gpuMs };
    this.submissions.push(rec);
    // the longest by the GPU's own time where the browser stamps passes, else from submit to done
    if (this.ts ? gpuMs != null && (this.longest.gpuMs == null || gpuMs > this.longest.gpuMs) : ms > this.longest.ms) this.longest = rec;
    if (!this.longestWall || ms > this.longestWall.ms) this.longestWall = rec;
    if (this.onSubmit) this.onSubmit(rec);
    return ms;
  }

  pipeline(op) {
    if (!this.pipes.has(op)) this.pipes.set(op, this.compile(op));
    return this.pipes.get(op);
  }

  async compile(op) {
    const common = await (await fetch(this.opsUrl + 'common.wgsl')).text();
    const src = common + '\n' + (await (await fetch(`${this.opsUrl}${MODERN[op]}.wgsl`)).text());
    const module = this.device.createShaderModule({ code: src });
    const info = await module.getCompilationInfo();
    for (const m of info.messages) if (m.type === 'error') throw new Error(`${op}.wgsl ${m.lineNum}:${m.linePos} ${m.message}`);
    return this.device.createComputePipelineAsync({ layout: 'auto', compute: { module, entryPoint: 'main' } });
  }

  uniform(cv, nd, nin, pass, sw, sh, lod) {
    const b = new ArrayBuffer(48 + 128);
    const v = new DataView(b);
    v.setUint32(0, cv.w, true); v.setUint32(4, cv.h, true); v.setUint32(8, cv.m, true); v.setUint32(12, lod, true);
    v.setFloat32(16, cv.wx, true); v.setFloat32(20, cv.wy, true); v.setFloat32(24, cv.ws, true); v.setUint32(28, nin, true);
    v.setUint32(32, sw, true); v.setUint32(36, sh, true); v.setUint32(40, pass, true); v.setUint32(44, nd.words.length, true);
    nd.words.forEach((w, i) => v.setUint32(48 + 4 * i, w, true));
    const buf = this.device.createBuffer({ size: b.byteLength, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(buf, 0, b);
    return buf;
  }

  // one procedure on a canvas of side pixels showing window win; every needed operator is its own submission
  async drawGpu(g, side, win, mForced, lod = 99) {
    const d = this.device;
    if (g.nodes[g.root].op === 'Quad') return this.drawQuadGpu(g, side, win, lod);
    if (g.nodes[g.root].op === 'Grid') return this.drawGridGpu(g, side, win, lod);
    if (g.nodes[g.root].op === 'Stack') return this.drawStackGpu(g, side, win, lod);
    for (let i = 0; i < g.root; i++) if (['Quad', 'Grid', 'Stack'].includes(g.nodes[i].op)) throw new Error(`a ${g.nodes[i].op} is the procedure's last operator`);
    const cv = canvasFor(g, side, win, mForced);
    const need = needed(g);
    const readers = new Array(g.nodes.length).fill(0);
    for (let i = 0; i <= g.root; i++) if (need[i]) for (const k of g.nodes[i].ins) readers[k]++;
    const bufs = new Array(g.nodes.length).fill(null);
    const size = cv.w * cv.h * 8;
    const pool = [];
    const dummy = d.createBuffer({ size: 16, usage: GPUBufferUsage.STORAGE });
    let ms = 0;
    for (let i = 0; i <= g.root; i++) {
      if (!need[i]) continue;
      const nd = g.nodes[i];
      if (!MODERN[nd.op]) throw new Error(`${nd.op} is a werkkzeug3 operator: this player draws modern operators only`);
      const p = await this.pipeline(nd.op);
      const out = pool.pop() || d.createBuffer({ size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
      bufs[i] = out;
      const ins = nd.ins.map((k) => bufs[k]);
      let wtmp = null;
      if (nd.op === 'Wear') wtmp = d.createBuffer({ size: cv.w * cv.h * 4, usage: GPUBufferUsage.STORAGE });
      if (nd.op === 'Scatter' && nd.ins.length >= 2) throw new Error('a Scatter with a seed\'s stamp needs the WebAssembly player');
      const entries = (ub) => {
        const e = [{ binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: out } }];
        if (nd.op === 'Scatter') {
          e.push({ binding: 2, resource: { buffer: bufs[nd.ins[0]] } });
          e.push({ binding: 3, resource: { buffer: dummy } });
        } else if (nd.op === 'Wear') {
          e.push({ binding: 2, resource: { buffer: ins[0] } });
          e.push({ binding: 3, resource: { buffer: nd.ins.length >= 2 ? ins[1] : ins[0] } });
          e.push({ binding: 4, resource: { buffer: wtmp } });
        } else {
          ins.forEach((b, k) => e.push({ binding: 2 + k, resource: { buffer: b } }));
          if (nd.op === 'Shade' && ins.length === 1) e.push({ binding: 3, resource: { buffer: ins[0] } });
        }
        return e;
      };
      const passes = nd.op === 'Wear' ? 2 : 1;
      for (let ps = 0; ps < passes; ps++) {
        const ub = this.uniform(cv, nd, nd.ins.length, ps, 0, 0, lod);
        const enc = d.createCommandEncoder();
        const cp = this.beginPass(enc);
        cp.setPipeline(p);
        cp.setBindGroup(0, d.createBindGroup({ layout: p.getBindGroupLayout(0), entries: entries(ub) }));
        cp.dispatchWorkgroups(Math.ceil(cv.w / 8), Math.ceil(cv.h / 8));
        cp.end();
        ms += await this.submit(enc);
        ub.destroy();
      }
      if (wtmp) wtmp.destroy();
      for (const k of nd.ins) if (--readers[k] === 0 && bufs[k]) { pool.push(bufs[k]); bufs[k] = null; }
    }
    dummy.destroy();
    for (const b of pool) b.destroy();
    return { buf: bufs[g.root], cv, ms };
  }

  async drawQuadGpu(g, side, win, lod) {
    const d = this.device;
    const rt = g.nodes[g.root];
    if (rt.ins.length !== 4) throw new Error(`Quad takes four procedures, the graph gives ${rt.ins.length}`);
    const subs = rt.ins.map((k) => quadPart(g, k));
    const local = { x: 0, y: 0, s: f32(2 * win.s) };
    let m = 0;
    for (const sg of subs) m = Math.max(m, canvasFor(sg, side, local).m);
    const parts = [];
    let ms = 0;
    for (let q = 0; q < 4; q++) {
      const r = await this.drawGpu(subs[q], side, { x: f32(f32(2 * win.x) - (q % 2)), y: f32(f32(2 * win.y) - (q >> 1)), s: f32(2 * win.s) }, m, lod);
      parts.push(r.buf);
      ms += r.ms;
    }
    const cv = { w: side + 2 * m, h: side + 2 * m, m, wx: win.x, wy: win.y, ws: win.s, side };
    const p = await this.pipeline('Quad');
    const out = d.createBuffer({ size: cv.w * cv.h * 8, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const ub = this.uniform(cv, rt, 4, 0, 0, 0, lod);
    const entries = [{ binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: out } }];
    parts.forEach((b, k) => entries.push({ binding: 2 + k, resource: { buffer: b } }));
    const enc = d.createCommandEncoder();
    const cp = this.beginPass(enc);
    cp.setPipeline(p);
    cp.setBindGroup(0, d.createBindGroup({ layout: p.getBindGroupLayout(0), entries }));
    cp.dispatchWorkgroups(Math.ceil(cv.w / 8), Math.ceil(cv.h / 8));
    cp.end();
    ms += await this.submit(enc);
    ub.destroy();
    for (const b of parts) b.destroy();
    return { buf: out, cv, ms };
  }

  async drawGridGpu(g, side, win, lod) {
    const d = this.device;
    const rt = g.nodes[g.root];
    const cols = rt.words[1], rows = rt.words[2], nt = cols * rows;
    if (rt.ins.length !== nt) throw new Error(`Grid of ${cols} by ${rows} takes ${nt} procedures, the graph gives ${rt.ins.length}`);
    const sc = f32(Math.min(cols, rows));
    const subs = rt.ins.map((k) => quadPart(g, k));
    for (const sg of subs) for (const nd of sg.nodes) if (['Quad', 'Grid', 'Stack'].includes(nd.op)) throw new Error(`a Grid's procedures hold a ${nd.op}`);
    const local = { x: 0, y: 0, s: f32(sc * win.s) };
    let m = 0;
    for (const sg of subs) m = Math.max(m, canvasFor(sg, side, local).m);
    const cv = { w: side + 2 * m, h: side + 2 * m, m, wx: win.x, wy: win.y, ws: win.s, side };
    const p = await this.pipeline('Grid');
    const out = d.createBuffer({ size: cv.w * cv.h * 8, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const acc = d.createBuffer({ size: cv.w * cv.h * 16, usage: GPUBufferUsage.STORAGE });
    let ms = 0;
    let first = null;
    for (let q = 0; q <= nt; q++) {
      let part = null;
      if (q < nt) {
        const col = q % cols, row = Math.floor(q / cols);
        const wx = f32(sc * f32(f32(win.x) - f32(col / cols)));
        const wy = f32(sc * f32(f32(win.y) - f32(row / rows)));
        const r = await this.drawGpu(subs[q], side, { x: wx, y: wy, s: f32(sc * win.s) }, m, lod);
        part = r.buf;
        ms += r.ms;
        if (q === 0) first = part;
      }
      const ub = this.uniform(cv, rt, nt, q, 0, 0, lod);
      const enc = d.createCommandEncoder();
      const cp = this.beginPass(enc);
      cp.setPipeline(p);
      cp.setBindGroup(0, d.createBindGroup({ layout: p.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: out } },
        { binding: 2, resource: { buffer: part || first } }, { binding: 3, resource: { buffer: acc } }] }));
      cp.dispatchWorkgroups(Math.ceil(cv.w / 8), Math.ceil(cv.h / 8));
      cp.end();
      ms += await this.submit(enc);
      ub.destroy();
      if (part && q > 0) part.destroy();
    }
    first.destroy();
    acc.destroy();
    return { buf: out, cv, ms };
  }

  async drawStackGpu(g, side, win, lod) {
    const d = this.device;
    const rt = g.nodes[g.root];
    const n = rt.ins.length;
    if (n < 2 || n > 4) throw new Error(`a Stack lays two to four procedures, the graph gives ${n}`);
    const subs = rt.ins.map((k) => quadPart(g, k));
    const cv = { w: side, h: side, m: 0, wx: win.x, wy: win.y, ws: win.s, side };
    const p = await this.pipeline('Stack');
    const out = d.createBuffer({ size: side * side * 8, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const acc = d.createBuffer({ size: side * side * 16, usage: GPUBufferUsage.STORAGE });
    let ms = 0;
    let first = null;
    for (let l = 0; l <= n; l++) {
      let lay = null;
      if (l < n) {
        if (subs[l].nodes[subs[l].root].op === 'Stack') throw new Error('a Stack\'s procedure is another Stack');
        const r = await this.drawGpu(subs[l], side, win, undefined, lod);
        ms += r.ms;
        lay = d.createBuffer({ size: side * side * 8, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
        const ce = d.createCommandEncoder();
        for (let j = 0; j < side; j++) ce.copyBufferToBuffer(r.buf, ((j + r.cv.m) * r.cv.w + r.cv.m) * 8, lay, j * side * 8, side * 8);
        ms += await this.submit(ce, false);
        r.buf.destroy();
        if (l === 0) first = lay;
      }
      const ub = this.uniform(cv, rt, n, l, 0, 0, lod);
      const enc = d.createCommandEncoder();
      const cp = this.beginPass(enc);
      cp.setPipeline(p);
      cp.setBindGroup(0, d.createBindGroup({ layout: p.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: ub } }, { binding: 1, resource: { buffer: out } },
        { binding: 2, resource: { buffer: lay || first } }, { binding: 3, resource: { buffer: acc } }] }));
      cp.dispatchWorkgroups(Math.ceil(side / 8), Math.ceil(side / 8));
      cp.end();
      ms += await this.submit(enc);
      ub.destroy();
      if (lay && l > 0) lay.destroy();
    }
    first.destroy();
    acc.destroy();
    return { buf: out, cv, ms };
  }

  // the drawing as 8-bit RGB, side by side pixels (the procedure's 15-bit colours shifted by 7, as p2p writes them)
  async drawRgb(g, side, win) {
    const res = await this.drawGpu(g, side, win);
    const { buf, cv } = res;
    const d = this.device;
    const rb = d.createBuffer({ size: cv.w * cv.h * 8, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = d.createCommandEncoder();
    enc.copyBufferToBuffer(buf, 0, rb, 0, cv.w * cv.h * 8);
    await this.submit(enc, false);
    await rb.mapAsync(GPUMapMode.READ);
    const px = new Uint32Array(rb.getMappedRange().slice(0));
    rb.unmap();
    rb.destroy();
    buf.destroy();
    const s = cv.side;
    const rgb = new Uint8Array(s * s * 3);
    for (let j = 0; j < s; j++) for (let i = 0; i < s; i++) {
      const k = (j + cv.m) * cv.w + i + cv.m;
      const lo = px[2 * k], hi = px[2 * k + 1];
      const o = 3 * (j * s + i);
      rgb[o] = Math.min(255, (hi & 0xffff) >> 7);
      rgb[o + 1] = Math.min(255, (lo >>> 16) >> 7);
      rgb[o + 2] = Math.min(255, (lo & 0xffff) >> 7);
    }
    return rgb;
  }
}
