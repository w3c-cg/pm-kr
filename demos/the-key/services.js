// BSD-2-Clause. Services composed by the person, each from its own origin.
// The world page never runs a service's code: each service runs in its own sandboxed cross-origin
// frame (its own process where the browser isolates sites), talks to the world only through a
// MessagePort with the small declarative format below, and its pictures come with CORS.
//
// key-world-service/1
//   world → service  {type:'connect', protocol, world, anchor}            (with a MessagePort)
//   service → world  {type:'announce', title, footprint:[w,h,d], wants:[...], dense:URL}
//                    {type:'scene', level:'shallow'|'dense', nodes:[node...]}
//                    {type:'frame', id, bitmap}                            (ImageBitmap, transferred)
//   world → service  {type:'proximity', level, distance}  {type:'select', node}
//                    {type:'person', x, z}  {type:'people', list}          (only when granted)
//                    {type:'peer', name}                                    (with a MessagePort, when the person links two services)
//   node: {id, kind:'panel'|'image'|'marker'|'path'|'feed', at:[x,y,z], size:[w,h], yaw, color, title, lines, url, points}
import * as THREE from 'three';
import { createServiceProjection } from './service-depth.js';

export const PROTOCOL = 'key-world-service/1';
const DENSE_IN = 5.5;
const DENSE_OUT = 6.5;
const WANTS = new Set(['proximity', 'select', 'person', 'people']);

function textCanvas(title, lines, color, width = 512, height = 320) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  g.fillStyle = 'rgba(12, 20, 28, 0.92)';
  g.fillRect(0, 0, width, height);
  g.strokeStyle = color;
  g.lineWidth = 6;
  g.strokeRect(3, 3, width - 6, height - 6);
  g.fillStyle = color;
  g.font = 'bold 34px sans-serif';
  g.fillText(String(title || '').slice(0, 40), 22, 50);
  g.fillStyle = '#e8eef2';
  g.font = '25px sans-serif';
  (lines || []).slice(0, 9).forEach((line, i) => g.fillText(String(line).slice(0, 44), 22, 96 + i * 30));
  return canvas;
}

function makeLabel(text, color) {
  const texture = new THREE.CanvasTexture(textCanvas(text, [], color, 512, 72));
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .17), new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
  return mesh;
}

/** The world side: creates frames, holds ports, draws declared nodes. */
export function createServiceHost({ scene, hall, origins, say, people }) {
  const placed = new Map();
  const projection = createServiceProjection();
  const frameHolder = document.createElement('div');
  frameHolder.id = 'service-frames';
  frameHolder.setAttribute('aria-hidden', 'true');
  document.body.append(frameHolder);
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const links = [];

  function nodeObject(service, node) {
    const at = node.at || [0, 1.2, 0];
    const color = /^#[0-9a-f]{6}$/i.test(node.color || '') ? node.color : '#7fd6d0';
    let object;
    if (node.kind === 'panel') {
      const [w, h] = node.size || [1.2, .75];
      const texture = new THREE.CanvasTexture(textCanvas(node.title, node.lines, color));
      texture.colorSpace = THREE.SRGBColorSpace;
      object = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    } else if (node.kind === 'image') {
      const [w, h] = node.size || [.6, .6];
      const material = new THREE.MeshBasicMaterial({ color: '#334', side: THREE.DoubleSide });
      object = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      let url;
      try { url = new URL(node.url, service.origin); } catch { url = null; }
      if (url && url.protocol === 'https:') {
        loader.load(url.href, texture => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.map = texture;
          material.color.set('#ffffff');
          material.needsUpdate = true;
          service.pictures.push({ url: url.href, cors: true });
        }, undefined, () => {
          service.pictures.push({ url: url.href, cors: false });
          service.notes.push('A picture from ' + url.origin + ' came without CORS permission, so the world cannot draw it.');
          material.map = new THREE.CanvasTexture(textCanvas('No CORS permission', [url.pathname], '#e0a040', 256, 160));
          material.color.set('#ffffff');
          material.needsUpdate = true;
        });
      }
    } else if (node.kind === 'marker') {
      object = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .04, 18), new THREE.MeshBasicMaterial({ color }));
      if (node.title) { const label = makeLabel(node.title, color); label.position.y = .22; label.scale.setScalar(.5); object.add(label); }
    } else if (node.kind === 'path') {
      const points = (node.points || []).slice(0, 200).map(([x, z]) => new THREE.Vector3(x, node.y ?? .02, z));
      object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color }));
    } else if (node.kind === 'feed') {
      const [w, h] = node.size || [.96, .54];
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 180;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      object = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
      service.feeds.set(node.id, { canvas, texture });
    } else {
      service.notes.push('Unknown node kind ' + String(node.kind).slice(0, 20) + ' was not drawn.');
      return null;
    }
    // Node positions are relative to the anchor; the world (not the service) owns the frame of reference.
    object.position.set(+at[0] || 0, +at[1] || 0, +at[2] || 0);
    object.rotation.y = +node.yaw || 0;
    object.userData.node = node.id;
    return object;
  }

  function draw(service, level, nodes) {
    service.content.clear();
    service.feeds.clear();
    for (const node of nodes.slice(0, 64)) {
      const object = nodeObject(service, node);
      if (object) {
        projection.apply(object);
        service.content.add(object);
      }
    }
    service.level = level;
  }

  function onMessage(service, data) {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'announce') {
      service.title = String(data.title || service.origin).slice(0, 40);
      service.wants = (data.wants || []).filter(w => WANTS.has(w));
      service.dense = String(data.dense || '');
      service.label.material.map.dispose();
      service.label.material.map = new THREE.CanvasTexture(textCanvas(service.title, [], service.color, 512, 72));
      service.label.material.map.colorSpace = THREE.SRGBColorSpace;
      service.state = 'connected';
      if (service.wants.includes('people') && !service.granted.has('people')) {
        service.pending = 'people';
        say(`${service.title} (${service.host}) asks to see where people are in this hall. Allow it in the Services panel.`);
      }
      return;
    }
    if (data.type === 'scene' && Array.isArray(data.nodes)) {
      service.messages++;
      const wantDense = service.level === 'dense' || service.level === 'dense-wanted';
      if ((data.level === 'dense') !== wantDense) return;
      draw(service, data.level === 'dense' ? 'dense' : 'shallow', data.nodes);
      return;
    }
    if (data.type === 'frame' && data.pixels instanceof ArrayBuffer) {
      service.frames++;
      const feed = service.feeds.get(data.id);
      if (feed && data.width * data.height * 4 === data.pixels.byteLength) {
        feed.canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data.pixels), data.width, data.height), 0, 0);
        feed.texture.needsUpdate = true;
      }
      return;
    }
    if (data.type === 'frame' && data.bitmap instanceof ImageBitmap) {
      service.frames++;
      const feed = service.feeds.get(data.id);
      if (feed) {
        feed.canvas.getContext('2d').drawImage(data.bitmap, 0, 0, feed.canvas.width, feed.canvas.height);
        feed.texture.needsUpdate = true;
      }
      data.bitmap.close();
    }
  }

  function place(card, position, yaw) {
    let service = placed.get(card.id);
    if (!service) {
      const address = new URL(card.origin);
      const { origin, hostname: host } = address;
      if (origin === location.origin) {
        say('A service must be on a different origin from this world.');
        return null;
      }
      const anchor = new THREE.Group();
      anchor.name = 'service-' + card.id;
      const shell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.7, 1.6, .7)),
        new THREE.LineBasicMaterial({ color: '#9fd8ff', transparent: true, opacity: .75 }));
      shell.position.y = .8;
      const label = makeLabel(card.name + ' · ' + host, '#9fd8ff');
      label.position.y = 1.85;
      const content = new THREE.Group();
      anchor.add(shell, label, content);
      projection.apply(anchor);
      hall.add(anchor);
      const frame = document.createElement('iframe');
      frame.title = card.name + ' service from ' + host;
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      frame.setAttribute('referrerpolicy', 'no-referrer');
      frame.src = new URL('service.html', address).href;
      service = {
        id: card.id, card, origin, host, anchor, shell, label, content, frame, title: card.name, color: '#9fd8ff',
        state: 'loading', level: 'none', wants: [], granted: new Set(), pending: null, port: null, notes: [],
        pictures: [], feeds: new Map(), messages: 0, frames: 0, dense: ''
      };
      placed.set(card.id, service);
      frame.addEventListener('load', () => {
        const channel = new MessageChannel();
        service.port = channel.port1;
        channel.port1.onmessage = event => onMessage(service, event.data);
        channel.port1.onmessageerror = () => {
          // HTML: a message this realm cannot deserialize. Tell the person and the service, never stay silent.
          service.messageErrors = (service.messageErrors || 0) + 1;
          if (service.messageErrors === 1) {
            say(`${service.title}: this browser could not receive a message from ${service.host} (messageerror); its frames are sent again as plain pixels.`);
            service.port.postMessage({ type: 'messageerror' });
          }
        };
        channel.port1.start();
        frame.contentWindow.postMessage({ type: 'connect', protocol: PROTOCOL, world: origins.worldOrigin }, origin, [channel.port2]);
        service.state = 'offered';
      });
      frame.addEventListener('error', () => { service.state = 'unreachable'; });
      frameHolder.append(frame);
      setTimeout(() => {
        if (service.state === 'offered' || service.state === 'loading') {
          service.state = 'unreachable';
          say(`${card.name}: ${host} did not answer in the ${PROTOCOL} format. Nothing of it is drawn.`);
        }
      }, 9000);
    }
    service.anchor.position.copy(position);
    service.anchor.rotation.y = yaw;
    return service;
  }

  function remove(id) {
    const service = placed.get(id);
    if (!service) return;
    service.port?.close();
    service.frame.remove();
    service.anchor.removeFromParent();
    placed.delete(id);
  }

  function grant(id, what, allow = true) {
    const service = placed.get(id);
    if (!service) return false;
    if (allow) service.granted.add(what); else service.granted.delete(what);
    if (service.pending === what) service.pending = null;
    return true;
  }

  /** Let two services talk directly: the person's choice, carried by a MessagePort to each. */
  function link(a, b) {
    const first = placed.get(a), second = placed.get(b);
    if (!first?.port || !second?.port) return false;
    const channel = new MessageChannel();
    first.port.postMessage({ type: 'peer', name: second.title, origin: second.origin }, [channel.port1]);
    second.port.postMessage({ type: 'peer', name: first.title, origin: first.origin }, [channel.port2]);
    links.push([a, b]);
    return true;
  }

  const local = new THREE.Vector3();
  let tick = 0;
  function update(person, visible) {
    tick++;
    for (const service of placed.values()) {
      service.anchor.visible = visible;
      if (!service.port || service.state !== 'connected') continue;
      local.copy(person).sub(service.anchor.position);
      const distance = Math.hypot(local.x, local.z);
      const near = service.level === 'dense' || service.level === 'dense-wanted' ? distance < DENSE_OUT : distance < DENSE_IN;
      const level = near ? 'dense' : 'shallow';
      const current = service.level === 'dense-wanted' ? 'dense' : service.level;
      if (level !== current) {
        if (level === 'dense') service.level = 'dense-wanted';
        else { service.level = 'shallow'; service.content.clear(); service.feeds.clear(); }
        service.port.postMessage({ type: 'proximity', level, distance: +distance.toFixed(2) });
      }
      service.shell.visible = service.level !== 'dense';
      if (tick % 6 === 0) {
        const anchorYaw = service.anchor.rotation.y;
        const c = Math.cos(-anchorYaw), s = Math.sin(-anchorYaw);
        if (service.wants.includes('person') && service.granted.has('person')) {
          service.port.postMessage({
            type: 'person', x: +(local.x * c + local.z * s).toFixed(2), z: +(-local.x * s + local.z * c).toFixed(2),
            site: { x: +person.x.toFixed(2), z: +person.z.toFixed(2) }
          });
        }
        if (service.wants.includes('people') && service.granted.has('people') && people) {
          const list = people.crowd.agents.map(a => ({ id: a.id, x: +(a.x).toFixed(2), z: +(a.z).toFixed(2), state: a.state }));
          service.port.postMessage({ type: 'people', list });
        }
      }
    }
  }

  function select(object) {
    for (const service of placed.values()) {
      let o = object;
      while (o && o !== service.anchor) {
        if (o.userData.node && service.port) { service.port.postMessage({ type: 'select', node: o.userData.node }); return service; }
        o = o.parent;
      }
    }
    return null;
  }

  function report() {
    return [...placed.values()].map(s => ({
      id: s.id, origin: s.origin, state: s.state, level: s.level === 'dense-wanted' ? 'dense' : s.level, wants: s.wants,
      granted: [...s.granted], messages: s.messages, frames: s.frames, nodes: s.content.children.length,
      messageErrors: s.messageErrors || 0, pictures: s.pictures, notes: s.notes.slice(-4), position: s.anchor.position.toArray().map(v => +v.toFixed(2))
    }));
  }

  return { place, remove, grant, link, update, select, report, placed, links, projection };
}
