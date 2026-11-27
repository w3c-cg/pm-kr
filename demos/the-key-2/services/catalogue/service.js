// BSD-2-Clause. Catalogue service (its own origin). Its pictures are served with CORS, so the world may draw them.
import { serviceAddresses } from './addresses.mjs';

const worldOriginReady = serviceAddresses(location).then(addresses => new URL(addresses.world).origin);
const PROTOCOL = 'key-world-service/1';
const items = [
  { id: 'fob', name: 'Security key, USB', price: '24.00 TEST', picture: './assets/fob.svg' },
  { id: 'headset', name: 'Headset strap', price: '39.00 TEST', picture: './assets/headset.svg' },
  { id: 'tablet', name: 'Memory tablet case', price: '18.50 TEST', picture: './assets/tablet.svg' }
];
let port = null, level = 'shallow', chosen = null, peer = null;
function send() {
  if (!port) return;
  if (level !== 'dense') {
    port.postMessage({ type: 'scene', level: 'shallow', nodes: [{ id: 'sign', kind: 'marker', at: [0, .05, 0], color: '#e8b04a', title: 'CATALOGUE' }] });
    return;
  }
  const nodes = items.map((item, i) => ({ id: item.id, kind: 'image', url: new URL(item.picture, location.href).href, at: [(i - 1) * .62, 1.05, 0], size: [.5, .5] }));
  nodes.push({ id: 'list', kind: 'panel', at: [0, 1.75, 0], size: [1.6, .7], color: '#e8b04a', title: 'Catalogue · ' + location.hostname,
    lines: [...items.map(item => item.name + ' · ' + item.price), chosen ? 'Chosen: ' + chosen.name : 'Point at a picture and press Action', peer ? 'Linked to ' + peer : 'Prices are test values'] });
  port.postMessage({ type: 'scene', level: 'dense', nodes });
}
window.addEventListener('message', async event => {
  if (event.source !== window.parent || event.origin !== await worldOriginReady || event.data?.type !== 'connect' || event.data.protocol !== PROTOCOL || !event.ports[0]) return;
  port = event.ports[0];
  port.onmessage = ({ data, ports }) => {
    if (data.type === 'proximity') { level = data.level; send(); }
    if (data.type === 'select') {
      chosen = items.find(item => item.id === data.node) || chosen;
      if (chosen && peer) peer.postMessage({ type: 'basket', item: chosen.name, price: chosen.price });
      send();
    }
    if (data.type === 'peer' && ports[0]) { peer = ports[0]; peer.name = data.name; send(); }
  };
  port.postMessage({ type: 'announce', title: 'Catalogue', footprint: [1.8, 2.1, .4], wants: ['proximity', 'select'], dense: new URL('./items.json', location.href).href });
  send();
});
