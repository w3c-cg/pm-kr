// BSD-2-Clause. Pay portal service (its own origin). Test values only; no payment is made anywhere.
import { serviceAddresses } from './addresses.mjs';

const worldOriginReady = serviceAddresses(location).then(addresses => new URL(addresses.world).origin);
const PROTOCOL = 'key-world-service/1';
let port = null, level = 'shallow', basket = [], paid = null;
function send() {
  if (!port) return;
  if (level !== 'dense') {
    port.postMessage({ type: 'scene', level: 'shallow', nodes: [{ id: 'sign', kind: 'marker', at: [0, .05, 0], color: '#b08cff', title: 'PAY PORTAL' }] });
    return;
  }
  port.postMessage({ type: 'scene', level: 'dense', nodes: [
    { id: 'pay', kind: 'panel', at: [0, 1.35, 0], size: [1.2, .8], color: '#b08cff', title: 'Pay portal · ' + location.hostname,
      lines: ['Test values only: no money moves.', ...(basket.length ? basket.map(b => b.item + ' · ' + b.price) : ['Basket empty']), paid ? 'Paid (test): ' + paid : 'Point here and press Action to pay'] }
  ] });
}
window.addEventListener('message', async event => {
  if (event.source !== window.parent || event.origin !== await worldOriginReady || event.data?.type !== 'connect' || event.data.protocol !== PROTOCOL || !event.ports[0]) return;
  port = event.ports[0];
  port.onmessage = ({ data, ports }) => {
    if (data.type === 'proximity') { level = data.level; send(); }
    if (data.type === 'select') { paid = basket.length ? basket.length + ' item(s), test reference ' + Math.random().toString(36).slice(2, 8).toUpperCase() : null; send(); }
    if (data.type === 'peer' && ports[0]) ports[0].onmessage = ({ data: m }) => { if (m.type === 'basket') { basket.push(m); send(); } };
  };
  port.postMessage({ type: 'announce', title: 'Pay portal', footprint: [1.2, 1.8, .3], wants: ['proximity', 'select'], dense: new URL('./portal.json', location.href).href });
  send();
});
