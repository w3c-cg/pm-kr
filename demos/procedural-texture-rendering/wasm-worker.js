// The WebAssembly procedure player of Procedural Texture Rendering, in a worker so the page stays live: the modern
// operators only (player/ptr-player.wasm, about 85 KB, no imports; its source is player/ptr_player.zig in the
// repository). One piece (a procedure at a size through a window) per message. The page sends no more work for a
// texture once its picture is in, and ends this worker when the last procedure has stopped. Our code, BSD 2-clause.
let wasm = null;

self.onmessage = async (ev) => {
  const m = ev.data;
  try {
    if (m.kind === 'init') {
      const t0 = performance.now();
      const r = await fetch(m.url);
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for the WebAssembly player');
      // from the bytes, not from the stream: any static host will do, whatever type it gives a .wasm file
      const bytes = await r.arrayBuffer();
      const { instance } = await WebAssembly.instantiate(bytes, {});
      wasm = instance.exports;
      if (wasm._initialize) wasm._initialize();
      if (wasm.ptr_version() !== 1) throw new Error('the WebAssembly player has interface version ' + wasm.ptr_version() + ', this page knows 1');
      self.postMessage({ kind: 'ready', ms: performance.now() - t0, bytes: bytes.byteLength });
      return;
    }
    // a piece: side = 2^exp pixels, through window (x, y, s)
    const text = new TextEncoder().encode(m.script);
    const side = 2 ** m.exp;
    const win = m.win || { x: 0, y: 0, s: 1 };
    const p = wasm.ptr_alloc(text.length);
    if (!p) throw new Error('no memory for the procedure');
    new Uint8Array(wasm.memory.buffer, p, text.length).set(text);
    const t0 = performance.now();
    const out = wasm.ptr_render(p, text.length, side, win.x, win.y, win.s);
    const ms = performance.now() - t0;
    wasm.ptr_free(p, text.length);
    if (!out) throw new Error(new TextDecoder().decode(new Uint8Array(wasm.memory.buffer, wasm.ptr_error(), wasm.ptr_error_len())) || 'the procedure does not draw');
    const rgb = new Uint8Array(wasm.memory.buffer, out, side * side * 3).slice();
    wasm.ptr_free(out, side * side * 3);
    self.postMessage({ kind: 'piece', id: m.id, rgb, w: side, h: side, ms }, [rgb.buffer]);
  } catch (e) {
    self.postMessage({ kind: 'error', id: m.id, error: String(e && e.message || e) });
  }
};
