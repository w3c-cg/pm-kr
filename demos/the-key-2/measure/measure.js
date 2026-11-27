// BSD-2-Clause. Measured rows for two statements made in the workshop thread (2026-11-26):
// images "are not subject to cross origin checks" for drawing into a 3D canvas, and postMessage
// "is limited. You can pass strings and data". Each row names the clause it is checked against.
import { worldAddresses } from '../addresses.mjs';

const addresses = await worldAddresses(location);
const catalogue = addresses.services.catalogue;
const camera = addresses.services.camera;
const rows = [];
window.measureRows = rows;
document.querySelector('#agent').textContent = navigator.userAgent;

const SPEC = {
  webgl: 'WebGL 1.0 and 2.0, texImage2D and “Origin Restrictions”: a picture whose origin differs throws SECURITY_ERR',
  canvas: 'HTML, canvas “origin-clean” flag; toDataURL throws SecurityError when it is false',
  webgpu: 'WebGPU §3.9 Origin Restrictions: “WebGPU disallows uploading an image source if it is not origin-clean”',
  cors: 'Fetch, CORS check: no Access-Control-Allow-Origin means a network error for a CORS request',
  transfer: 'HTML §2.7 structured serialization with transfer: ArrayBuffer, ImageBitmap, MessagePort and OffscreenCanvas are transferable',
  clone: 'HTML §2.7 StructuredSerialize: Map, Date, Blob and typed arrays are cloneable; functions throw DataCloneError',
  windowProxy: 'HTML, cross-origin objects (WindowProxy and Location): reading a cross-origin document throws SecurityError',
  sandbox: 'HTML iframe sandbox: without allow-top-navigation a frame cannot navigate the top-level page'
};

function row(id, spec, expected, actual, note = '') {
  const pass = JSON.stringify(expected) === JSON.stringify(actual);
  rows.push({ id, spec, expected, actual, pass, note });
  const tr = document.createElement('tr');
  for (const text of [id, spec, JSON.stringify(expected), JSON.stringify(actual) + (note ? ' — ' + note : '')]) {
    const td = document.createElement('td'); td.textContent = text; tr.append(td);
  }
  const verdict = document.createElement('td');
  verdict.textContent = pass ? 'agrees' : 'differs';
  verdict.className = pass ? 'pass' : 'fail';
  tr.append(verdict);
  document.querySelector('#rows').append(tr);
}

const timeout = (ms, what) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout: ' + what)), ms));
function image(url, cors) {
  return Promise.race([new Promise(resolve => {
    const img = new Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ img, loaded: true });
    img.onerror = () => resolve({ img, loaded: false });
    img.src = url;
  }), timeout(10000, url)]);
}

function webgl(source) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 4;
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) return { result: 'no WebGL' };
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  } catch (error) {
    return { result: error.name };
  }
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const pixel = new Uint8Array(4);
  gl.readPixels(2, 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return { result: 'uploaded', pixel: Array.from(pixel) };
}

function canvas2d(img) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 8;
  const g = canvas.getContext('2d');
  g.drawImage(img, 0, 0, 8, 8);
  try { canvas.toDataURL(); return 'readable'; } catch (error) { return error.name; }
}

let gpu = null;
async function webgpu(bitmap) {
  if (!navigator.gpu) return { result: 'no navigator.gpu' };
  if (!gpu) {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { result: 'no adapter' };
    gpu = await adapter.requestDevice();
  }
  const texture = gpu.createTexture({ size: [64, 64], format: 'rgba8unorm', usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
  try {
    gpu.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [64, 64]);
  } catch (error) {
    return { result: error.name };
  }
  const buffer = gpu.createBuffer({ size: 256 * 64, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const encoder = gpu.createCommandEncoder();
  encoder.copyTextureToBuffer({ texture }, { buffer, bytesPerRow: 256 }, [64, 64]);
  gpu.queue.submit([encoder.finish()]);
  await buffer.mapAsync(GPUMapMode.READ);
  const pixel = Array.from(new Uint8Array(buffer.getMappedRange(256 * 2 + 8, 4)));
  buffer.unmap();
  return { result: 'uploaded', pixel };
}

function frame(src) {
  return Promise.race([new Promise(resolve => {
    const f = document.createElement('iframe');
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    f.onload = () => resolve(f);
    f.src = src;
    document.querySelector('#frames').append(f);
  }), timeout(10000, src)]);
}
let sequence = 0;
function ask(target, origin, payload, transfer = [], ms = 8000) {
  const id = ++sequence;
  return Promise.race([new Promise(resolve => {
    const listen = event => {
      if (event.origin === origin && event.data?.id === -1) { window.removeEventListener('message', listen); resolve(event.data.received); return; }
      if (event.origin !== origin || event.data?.id !== id) return;
      window.removeEventListener('message', listen);
      resolve(event.data.received);
    };
    window.addEventListener('message', listen);
    target.postMessage({ id, payload }, origin, transfer);
  }), timeout(ms, 'echo ' + id)]);
}

async function run() {
  const probe = new URL('assets/probe.png', catalogue).href;
  const withoutCors = addresses.mode === 'test' ? new URL('nocors/assets/probe.png', catalogue).href : probe;
  const red = [200, 40, 90, 255];

  // Pictures: page display, 2D canvas, WebGL, WebGPU; without and with CORS.
  const plain = await image(withoutCors, false);
  row('A1 a cross-origin picture loaded without requesting CORS is shown in the page', 'HTML img: no CORS needed to display', true, plain.loaded && plain.img.naturalWidth === 64);
  row('A2 the same picture drawn into a 2D canvas, then read', SPEC.canvas, 'SecurityError', canvas2d(plain.img));
  row('A3 the same picture uploaded to WebGL (texImage2D)', SPEC.webgl, { result: 'SecurityError' }, webgl(plain.img));
  if (addresses.mode === 'test') {
    const askedNoHeader = await image(withoutCors, true);
    row('A4 crossOrigin="anonymous" from a server that sends no Access-Control-Allow-Origin', SPEC.cors, false, askedNoHeader.loaded);
  } else {
    row('A4 response without Access-Control-Allow-Origin', SPEC.cors, 'rig only', 'rig only', 'GitHub Pages supplies Access-Control-Allow-Origin for the figure.');
  }
  const granted = await image(probe, true);
  row('A5 crossOrigin="anonymous" from a server that sends Access-Control-Allow-Origin', SPEC.cors, true, granted.loaded);
  row('A6 the CORS picture uploaded to WebGL, texel read back', SPEC.webgl, { result: 'uploaded', pixel: red }, webgl(granted.img));
  let gpuState = 'unknown';
  try {
    const dirty = await webgpu(await createImageBitmap(plain.img));
    gpuState = dirty.result;
    if (dirty.result.startsWith('no ')) {
      row('A7 WebGPU copyExternalImageToTexture, picture without CORS', SPEC.webgpu, { result: 'SecurityError' }, dirty, 'WebGPU is not available in this browser as configured');
    } else {
      row('A7 WebGPU copyExternalImageToTexture, picture without CORS', SPEC.webgpu, { result: 'SecurityError' }, dirty);
      row('A8 WebGPU copyExternalImageToTexture, CORS picture, texel read back', SPEC.webgpu, { result: 'uploaded', pixel: red }, await webgpu(await createImageBitmap(granted.img)));
    }
  } catch (error) {
    row('A7 WebGPU copyExternalImageToTexture, picture without CORS', SPEC.webgpu, { result: 'SecurityError' }, { result: 'error ' + error.message });
  }

  // Messages to a frame of another origin.
  const echoOrigin = new URL(camera).origin;
  const echo = await frame(new URL('echo.html', camera).href);
  const buffer = new ArrayBuffer(1 << 20);
  new Uint8Array(buffer).forEach((_, i, a) => { a[i] = i % 251; });
  let expectedSum = 0;
  for (const b of new Uint8Array(buffer)) expectedSum = (expectedSum + b) % 65521;
  const bufferReply = ask(echo.contentWindow, echoOrigin, buffer, [buffer]);
  row('B1 a 1 MiB ArrayBuffer is transferred: the sender’s copy is detached', SPEC.transfer, 0, buffer.byteLength);
  row('B2 the other origin received the whole buffer', SPEC.transfer, { type: 'ArrayBuffer', byteLength: 1 << 20, sum: expectedSum }, await bufferReply);
  const bitmap = await createImageBitmap(granted.img);
  const bitmapReply = ask(echo.contentWindow, echoOrigin, bitmap, [bitmap]);
  row('B3 an ImageBitmap is transferred: the sender’s bitmap is detached', SPEC.transfer, 0, bitmap.width);
  row('B4 the other origin drew the bitmap and read its pixel', SPEC.transfer, { type: 'ImageBitmap', width: 64, height: 64, pixel: red }, await bitmapReply);
  const channel = new MessageChannel();
  const viaPort = new Promise(resolve => { channel.port1.onmessage = event => resolve(event.data.via); });
  const portReply = await ask(echo.contentWindow, echoOrigin, channel.port2, [channel.port2]);
  row('B5 a MessagePort is transferred and the other origin answers through it', SPEC.transfer, ['MessagePort', 'transferred MessagePort'], [portReply.type, await Promise.race([viaPort, timeout(5000, 'port')])]);
  const cloned = await Promise.all([
    ask(echo.contentWindow, echoOrigin, new Map([['a', 1], ['b', 2]])),
    ask(echo.contentWindow, echoOrigin, new Date('2026-11-26T12:00:00Z')),
    ask(echo.contentWindow, echoOrigin, new Blob(['key-world'])),
    ask(echo.contentWindow, echoOrigin, new Float32Array(16))
  ]);
  row('B7 structured clones: Map, Date, Blob, Float32Array', SPEC.clone,
    [{ type: 'Map', size: 2 }, { type: 'Date', iso: '2026-11-26T12:00:00.000Z' }, { type: 'Blob', size: 9, text: 'key-world' }, { type: 'Float32Array', length: 16 }], cloned);
  let functionClone;
  try { echo.contentWindow.postMessage({ id: 0, payload: () => 1 }, echoOrigin); functionClone = 'sent'; } catch (error) { functionClone = error.name; }
  row('B8 a function cannot be posted (code does not travel, data does)', SPEC.clone, 'DataCloneError', functionClone);

  // A service frame tries to read what is not its own.
  const probeOrigin = new URL(catalogue).origin;
  const probeFrame = await frame(new URL('probe.html', catalogue).href);
  const before = location.href;
  const probeResults = await Promise.race([new Promise(resolve => {
    window.addEventListener('message', function listen(event) {
      if (event.origin !== probeOrigin || event.data?.kind !== 'probe-result') return;
      window.removeEventListener('message', listen);
      resolve(event.data.results);
    });
    probeFrame.contentWindow.postMessage({ kind: 'probe', otherIndex: 0 }, probeOrigin);
  }), timeout(8000, 'probe')]);
  const outcome = name => probeResults.find(r => r.name === name)?.outcome;
  row('C1 a service frame reads the world page', SPEC.windowProxy, 'SecurityError', outcome('read the world page'));
  row('C2 a service frame reads another service’s frame', SPEC.windowProxy, 'SecurityError', outcome('read the camera service frame'));
  row('C3 a service frame reads the world page’s storage', SPEC.windowProxy, 'SecurityError', outcome('read the world page storage'));
  row('C4 a service frame fetches another origin without CORS', SPEC.cors, 'TypeError', outcome('fetch another origin without CORS'));
  await new Promise(resolve => setTimeout(resolve, 800));
  row('C5 a sandboxed service frame tries to navigate the world page away', SPEC.sandbox, before, location.href, 'frame saw: ' + outcome('navigate the world page'));
  // Rows B6 and B6b run last: Chromium (full binary, site isolation) ends the process of a frame that draws into an OffscreenCanvas
  // transferred from another site, a few milliseconds after it has answered, and that process also holds every other frame of that site.
  const lent = document.querySelector('#lent');
  const b6Expected = { type: 'OffscreenCanvas', width: 360, height: 64 };
  if (lent.transferControlToOffscreen) {
    const offscreen = lent.transferControlToOffscreen();
    row('B6 an OffscreenCanvas of this page is transferred and drawn by the other origin', SPEC.transfer, b6Expected, await ask(echo.contentWindow, echoOrigin, offscreen, [offscreen]));
    await new Promise(resolve => setTimeout(resolve, 1500));
    const alive = await ask(echo.contentWindow, echoOrigin, 'still there?', [], 3000).then(() => 'answers', () => 'no answer');
    row('B6b the frame that drew into the transferred canvas still answers', SPEC.transfer, 'answers', alive,
      alive === 'answers' ? '' : 'the browser ended that frame’s process after it had answered (the page and the frames of other sites go on)');
  } else {
    row('B6 an OffscreenCanvas of this page is transferred and drawn by the other origin', SPEC.transfer, b6Expected, 'no transferControlToOffscreen');
  }
  document.title = 'DONE ' + rows.filter(r => r.pass).length + '/' + rows.length + ' webgpu:' + gpuState;
}
run().catch(error => { row('run', '', 'completed', 'error: ' + error.message); document.title = 'DONE with error'; });
