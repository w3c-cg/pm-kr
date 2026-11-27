// BSD-2-Clause. Floor map service (its own origin). It knows the site's plan and, when the person allows it,
// where the person is; when linked to a camera service by the person, it also draws the people the camera reports.
import { serviceAddresses } from './addresses.mjs';

const worldOriginReady = serviceAddresses(location).then(addresses => new URL(addresses.world).origin);
const PROTOCOL = 'key-world-service/1';
const plan = {
  outline: [[-8.1, -7.8], [8.1, -7.8], [8.1, 7.8], [-8.1, 7.8], [-8.1, -7.8]],
  places: [['Public lobby', 0, -5.9], ['Archive', -5.05, -5.9], ['Members', 5.05, -5.9], ['Desk', 4.5, .35],
    ['Vault', 7.85, -4.0], ['Server room', 7.85, -1.55], ['Office', -7.85, .9], ['Mica', -3.2, -4.68]]
};
const S = 0.075, Y = 1.02;
let port = null, level = 'shallow', person = null, crowd = [], peer = null;
const to = ([x, z]) => [x * S, z * S];
function send() {
  if (!port) return;
  if (level !== 'dense') {
    port.postMessage({ type: 'scene', level: 'shallow', nodes: [{ id: 'sign', kind: 'marker', at: [0, .05, 0], color: '#4fc9c0', title: 'FLOOR MAP' }] });
    return;
  }
  const nodes = [
    { id: 'outline', kind: 'path', y: Y, points: plan.outline.map(to), color: '#4fc9c0' },
    { id: 'title', kind: 'panel', at: [0, 1.55, -.75], size: [1.1, .55], color: '#4fc9c0', title: 'Floor map · hall',
      lines: ['from ' + location.hostname, person ? 'You are at ' + person.x.toFixed(1) + ', ' + person.z.toFixed(1) : 'Allow “where I am” to see yourself', crowd.length ? crowd.length + ' people from the camera' : (peer ? 'Linked to ' + peer : 'Not linked to a camera')] },
    ...plan.places.map(([name, x, z], i) => ({ id: 'p' + i, kind: 'marker', at: [x * S, Y, z * S], color: '#f0c060', title: name.toUpperCase() }))
  ];
  if (person) nodes.push({ id: 'you', kind: 'marker', at: [person.x * S, Y + .02, person.z * S], color: '#ff5050', title: 'YOU' });
  crowd.forEach((p, i) => nodes.push({ id: 'c' + i, kind: 'marker', at: [p.x * S, Y + .01, p.z * S], color: '#80a0ff' }));
  port.postMessage({ type: 'scene', level: 'dense', nodes });
}
window.addEventListener('message', async event => {
  if (event.source !== window.parent || event.origin !== await worldOriginReady || event.data?.type !== 'connect' || event.data.protocol !== PROTOCOL || !event.ports[0]) return;
  port = event.ports[0];
  port.onmessage = ({ data, ports }) => {
    if (data.type === 'proximity') { level = data.level; send(); }
    if (data.type === 'person' && data.site) { person = data.site; if (level === 'dense') send(); }
    if (data.type === 'peer' && ports[0]) {
      peer = data.name;
      ports[0].onmessage = ({ data: message }) => { if (message.type === 'people') { crowd = message.list; if (level === 'dense') send(); } };
      send();
    }
  };
  port.postMessage({ type: 'announce', title: 'Floor map', footprint: [1.3, 1.6, 1.3], wants: ['proximity', 'person'], dense: new URL('./plan.json', location.href).href });
  send();
});
