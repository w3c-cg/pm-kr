// BSD-2-Clause. Camera feed service (its own origin). It draws its picture in its own process and sends each frame
// to the world as a transferred ImageBitmap. It sees people only if the person allows it.
import { serviceAddresses } from './addresses.mjs';

const worldOriginReady = serviceAddresses(location).then(addresses => new URL(addresses.world).origin);
const PROTOCOL = 'key-world-service/1';
let port = null, level = 'shallow', people = [], allowed = false, peer = null, frame = 0, plainPixels = false;
const canvas = new OffscreenCanvas(320, 180);
const g = canvas.getContext('2d');
function scene() {
  if (!port) return;
  if (level !== 'dense') {
    port.postMessage({ type: 'scene', level: 'shallow', nodes: [{ id: 'sign', kind: 'marker', at: [0, .05, 0], color: '#e06050', title: 'CAMERA' }] });
    return;
  }
  port.postMessage({ type: 'scene', level: 'dense', nodes: [
    { id: 'cam1', kind: 'feed', at: [0, 1.45, 0], size: [1.12, .63] },
    { id: 'info', kind: 'panel', at: [0, .78, 0], size: [1.12, .42], color: '#e06050', title: 'Camera feed · ' + location.hostname,
      lines: [allowed ? 'Tracking ' + people.length + ' people (allowed)' : 'People tracking not allowed', peer ? 'Sharing with ' + peer.name : 'Not linked'] }
  ] });
}
function draw() {
  frame++;
  g.fillStyle = '#0b1410'; g.fillRect(0, 0, 320, 180);
  g.strokeStyle = '#2f6f4f'; g.lineWidth = 1;
  for (let x = 0; x <= 320; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 180); g.stroke(); }
  for (let y = 0; y <= 180; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(320, y); g.stroke(); }
  g.strokeStyle = '#7fe0a0'; g.lineWidth = 2; g.strokeRect(160 - 8.1 * 10, 90 - 7.8 * 10.5, 16.2 * 10, 15.6 * 10.5);
  for (const p of people) {
    g.fillStyle = p.state === 'served' || p.state === 'queue' ? '#f0c060' : '#80ffb0';
    g.beginPath(); g.arc(160 + p.x * 10, 90 + p.z * 10.5, 4, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#d0ffd8'; g.font = '14px monospace';
  g.fillText('CAM 1 · HALL · ' + String(frame).padStart(5, '0'), 8, 172);
  if (!allowed) { g.fillStyle = '#ffb0a0'; g.fillText('PEOPLE TRACKING NOT ALLOWED', 50, 20); }
  if (port && level === 'dense') {
    if (plainPixels) {
      // The world said it could not receive ImageBitmaps: the same picture as RGBA bytes in a transferred ArrayBuffer.
      const pixels = g.getImageData(0, 0, 320, 180).data.buffer;
      port.postMessage({ type: 'frame', id: 'cam1', width: 320, height: 180, pixels }, [pixels]);
    } else {
      const bitmap = canvas.transferToImageBitmap();
      port.postMessage({ type: 'frame', id: 'cam1', bitmap }, [bitmap]);
    }
  }
}
setInterval(draw, 250);
window.addEventListener('message', async event => {
  if (event.source !== window.parent || event.origin !== await worldOriginReady || event.data?.type !== 'connect' || event.data.protocol !== PROTOCOL || !event.ports[0]) return;
  port = event.ports[0];
  port.onmessage = ({ data, ports }) => {
    if (data.type === 'proximity') { level = data.level; scene(); }
    if (data.type === 'messageerror') plainPixels = true;
    if (data.type === 'people') {
      const was = allowed;
      allowed = true; people = data.list;
      if (peer) peer.postMessage({ type: 'people', list: people });
      if (!was) scene();
    }
    if (data.type === 'peer' && ports[0]) { peer = ports[0]; peer.name = data.name; scene(); }
  };
  port.postMessage({ type: 'announce', title: 'Camera feed', footprint: [1.2, 1.8, .3], wants: ['proximity', 'people'], dense: new URL('./feed.json', location.href).href });
  scene();
});
