// BSD-2-Clause. The inventory, as in a game: items (keys, service cards, the tablet) chosen in a menu that
// floats in the world (wheel.js); Q and E move the selection, F is Action. The world, not the key, is the
// centre of the view.
import * as THREE from 'three';
import { KEYS, DEFAULT_CARDS } from './story.js';
import { localMemberNotice, memberDoorURL } from './mechanisms.js';

const COLORS = { amber: '#e8a23a', teal: '#3fc4b8', violet: '#9a7cff', white: '#e9eef2', signal: '#e05a48' };
const STORE = 'key-world-cards';

/** Draw an item's icon: each kind of key has its own form, like real keys. */
function icon(item, size = 96) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  const c = COLORS[item.color] || '#cccccc';
  g.translate(size / 2, size / 2);
  g.scale(size / 96, size / 96);
  g.lineWidth = 5; g.strokeStyle = c; g.fillStyle = c;
  const keyShape = (teeth) => {
    g.beginPath(); g.arc(-22, 0, 14, 0, Math.PI * 2); g.stroke();
    g.fillRect(-8, -4, 44, 8);
    teeth.forEach(([x, h]) => g.fillRect(x, 4, 6, h));
  };
  switch (item.shape) {
    case 'visitor': keyShape([[14, 9], [26, 6]]); break;
    case 'account': keyShape([[10, 12], [20, 6], [30, 10]]); break;
    case 'mandate': keyShape([[16, 8]]); g.setLineDash([4, 4]); g.strokeRect(-40, -26, 80, 52); break;
    case 'tag': keyShape([[12, 8], [24, 8]]); g.beginPath(); g.moveTo(-34, 14); g.lineTo(-16, 34); g.lineTo(-40, 40); g.closePath(); g.fill(); break;
    case 'badge':
      g.strokeRect(-26, -34, 52, 68); g.beginPath(); g.arc(0, -8, 11, 0, Math.PI * 2); g.fill();
      g.fillRect(-16, 10, 32, 6); g.fillRect(-12, 22, 24, 4); break;
    case 'fob':
      g.fillStyle = '#2c3e50'; g.fillRect(-16, -34, 32, 50); g.fillStyle = '#c0c8d0'; g.fillRect(-10, 16, 20, 20);
      g.fillStyle = c; g.beginPath(); g.arc(0, -12, 9, 0, Math.PI * 2); g.fill(); break;
    case 'finger':
      for (let r = 6; r <= 30; r += 6) { g.beginPath(); g.ellipse(0, 4, r * .75, r, 0, Math.PI * 1.05, Math.PI * 2.0); g.stroke(); } break;
    case 'certificate':
      g.strokeRect(-34, -24, 68, 48); g.fillRect(-26, -14, 40, 4); g.fillRect(-26, -4, 30, 4);
      g.beginPath(); g.arc(20, 14, 10, 0, Math.PI * 2); g.fill(); break;
    case 'card':
      g.strokeRect(-36, -24, 72, 48); g.fillRect(-36, -24, 72, 12);
      g.fillStyle = '#e9eef2'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center';
      g.fillText(item.name.slice(0, 11).toUpperCase(), 0, 10); g.fillText((item.origin ? new URL(item.origin).hostname.slice(0, 11) : ''), 0, 24); break;
    case 'tablet':
      g.fillStyle = '#1d242b'; g.fillRect(-36, -24, 72, 48); g.fillStyle = '#9fd8ff'; g.fillRect(-31, -19, 62, 38); break;
  }
  return canvas;
}

function loadCards(addresses) {
  const defaults = DEFAULT_CARDS.map(card => ({ ...card, origin: addresses.services[card.id] }));
  const current = new Map(defaults.map(card => [card.id, card]));
  try {
    const stored = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (Array.isArray(stored) && stored.every(card => card && typeof card.origin === 'string')) return stored.map(card => current.get(card.id) || card);
  } catch {}
  return defaults;
}
function saveCards(cards) {
  try { localStorage.setItem(STORE, JSON.stringify(cards)); } catch {}
}

export function createInventory({ story, camera, world, panel, addresses, say }) {
  const cards = loadCards(addresses);
  const tablet = { id: 'tablet', name: 'Memory Tablet', kind: 'Knowledge3D tablet', color: 'white', shape: 'tablet', type: 'tablet',
    mechanism: 'A thing you hold, with the old internet inside it (Knowledge3D Memory Tablet).' };
  let selectedId = 'visitor';
  const icons = new Map();
  const iconFor = (item, size = 96) => {
    const key = item.id + '@' + size;
    if (!icons.has(key)) icons.set(key, icon(item, size));
    return icons.get(key);
  };

  function items() {
    const keys = KEYS.filter(key => story.state.keys.has(key.id)).map(key => ({ ...key, type: 'key',
      mechanism: key.id === 'tls' && !memberDoorURL(addresses) ? localMemberNotice : key.mechanism }));
    return [...keys, tablet, ...cards.map(card => ({ ...card, type: 'card', shape: 'card', kind: 'Service card · ' + card.origin,
      mechanism: 'A service from ' + card.origin + ', run in its own sandboxed frame. Action places it in the world.' }))];
  }
  function selected() {
    const list = items();
    return list.find(item => item.id === selectedId) || list[0];
  }
  function select(id) {
    if (!items().some(item => item.id === id)) return;
    selectedId = id;
    if (story.state.keys.has(id)) story.select(id);
  }
  function cycle(step) {
    const list = items();
    const index = list.findIndex(item => item.id === selectedId);
    select(list[(index + step + list.length) % list.length].id);
  }
  function addCard(address, name) {
    let url;
    try { url = new URL(address.includes('://') ? address : 'https://' + address); } catch { return null; }
    if (url.protocol !== 'https:') { say('A service address must be https.'); return null; }
    if (url.origin === addresses.worldOrigin || url.origin === location.origin) {
      say('A service must be on a different origin from this world.');
      return null;
    }
    url.hash = url.search = '';
    if (!url.pathname.endsWith('/')) url.pathname += '/';
    const id = 'svc-' + (url.host + url.pathname.replace(/\/$/, '')).replace(/[^a-z0-9]/gi, '-');
    if (!cards.some(card => card.id === id)) cards.push({ id, name: name || url.hostname, origin: url.href, color: 'violet' });
    saveCards(cards);
    select(id);
    return id;
  }
  function removeCard(id) {
    const index = cards.findIndex(card => card.id === id);
    if (index >= 0) { cards.splice(index, 1); saveCards(cards); }
  }

  // The items as a list of buttons kept off screen: the wheel shows them, and this list carries the same
  // choice to screen readers and keyboard focus.
  const buttons = new Map();
  function renderList() {
    const list = items();
    for (const [id, button] of buttons) if (!list.some(item => item.id === id)) { button.remove(); buttons.delete(id); }
    list.forEach((item, index) => {
      let button = buttons.get(item.id);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.dataset.item = item.id;
        button.addEventListener('click', () => select(item.id));
        buttons.set(item.id, button);
      }
      if (panel.children[index] !== button) panel.insertBefore(button, panel.children[index] || null);
      const label = `${item.name}: ${item.kind}. ${item.mechanism}`;
      if (button.textContent !== label) button.textContent = label;
      const on = String(item.id === selected().id);
      if (button.getAttribute('aria-pressed') !== on) button.setAttribute('aria-pressed', on);
    });
  }

  // The item in hand: small, low on the right, never the centre of the view.
  const hand = new THREE.Group();
  hand.name = 'item-in-hand';
  hand.position.set(.34, -.27, -.66);
  camera.add(hand);
  const handModels = new Map();
  function handModel(item) {
    if (handModels.has(item.id)) return handModels.get(item.id);
    let model = world.keyModel(item.id);
    if (model) { model.scale.setScalar(.085); model.rotation.set(.3, -.5, .25); }
    else {
      const texture = new THREE.CanvasTexture(iconFor(item));
      texture.colorSpace = THREE.SRGBColorSpace;
      model = new THREE.Mesh(new THREE.PlaneGeometry(.06, .06), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthTest: false }));
      model.renderOrder = 5;
    }
    model.traverse(part => { if (part.isMesh) part.renderOrder = 5; });
    handModels.set(item.id, model);
    return model;
  }

  // Low on the right, inside the view whatever its shape.
  function placeHand() {
    const halfHeight = Math.tan(camera.fov * Math.PI / 360) * .66;
    hand.position.set(halfHeight * camera.aspect * .46, -halfHeight * .655, -.66);
  }

  function frame(immersive, hidden) {
    renderList();
    const item = selected();
    for (const model of handModels.values()) model.removeFromParent();
    if (!hidden && item.type !== 'tablet') hand.add(handModel(item));
    hand.visible = !immersive && !hidden;
    if (!immersive) placeHand();
  }

  return { items, selected, select, cycle, addCard, removeCard, cards, tablet, frame, iconFor };
}
