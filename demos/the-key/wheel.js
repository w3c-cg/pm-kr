// BSD-2-Clause. The inventory as a menu in the world: a selection wheel that floats in front of the person.
// It is an object of the scene, so the world's cameras draw it (one per eye in a stereo session) at its
// own depth: in an immersive session with a shared screen plane its items sit on that plane and its
// backing a little behind it, inside the person's limits; in 2D it floats a metre in front of the eyes.
import * as THREE from 'three';

const COLORS = { amber: '#e8a23a', teal: '#3fc4b8', violet: '#9a7cff', white: '#e9eef2', signal: '#e05a48' };
// What the person can use to choose, by the device that opened the wheel.
export const HINTS = {
  pointer: 'Click an item, or Q and E, then F. I or Esc closes.',
  touch: 'Tap an item to take it, or Use to act with it. Tap outside to close.',
  gamepad: 'Left stick points, A takes the item, B closes.',
  controller: 'Point the ray at an item and pull the trigger. B or Y closes.',
  keys: 'Q and E move, F takes the item, I or Esc closes.'
};
const RING = .7;
const HUB = .43;
const BACK_DEPTH = .15;   // the backing stands this share of the wheel's distance behind the items
const PEEK_MS = 1400;

/**
 * The distance of the plane where the two eyes see no disparity, when the session's eyes are parallel and
 * only shifted sideways (a flat stereo display): fx * baseline / (left offset - right offset), in metres.
 * A headset's mirrored frusta give a negative value: no shared screen plane, so null.
 */
export function sharedScreenPlane(eyes) {
  if (eyes.length !== 2) return null;
  const [left, right] = eyes;
  const offset = new THREE.Vector3().setFromMatrixPosition(right.matrixWorld).applyMatrix4(left.matrixWorldInverse);
  const l = left.projectionMatrix.elements;
  const r = right.projectionMatrix.elements;
  const distance = l[0] * offset.x / (l[8] - r[8]);
  return Number.isFinite(distance) && distance > 0 && Math.abs(offset.y) < 1e-6 && Math.abs(offset.z) < 1e-6 ? distance : null;
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
function wrap(g, text, width) {
  const lines = [];
  for (const word of String(text || '').split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && g.measureText(lines[last] + ' ' + word).width <= width) lines[last] += ' ' + word;
    else lines.push(word);
  }
  return lines;
}
// Drawn over the world (no depth test) but writing its depth, so a browser that places its screen plane from
// the depth buffer (the Stereo Browser's camera for a 2D page) counts the menu where it is.
function surface(texture, opacity = 1) {
  return new THREE.MeshBasicMaterial({ map: texture || null, transparent: true, opacity, depthTest: false, depthWrite: true, toneMapped: false });
}

export function createWheel({ scene, camera, renderer, viewport, inventory, choose, use }) {
  const group = new THREE.Group();
  group.name = 'inventory-wheel';
  group.visible = false;
  scene.add(group);
  const face = new THREE.Group();
  face.name = 'wheel-items';
  const back = new THREE.Group();
  back.name = 'wheel-backing';
  group.add(back, face);

  const backing = new THREE.Mesh(new THREE.CircleGeometry(1.04, 72), surface(null, .82));
  backing.material.color.set('#0b161d');
  backing.renderOrder = 10;
  const rim = new THREE.Mesh(new THREE.RingGeometry(1.03, 1.06, 96), surface(null, .9));
  rim.material.color.set('#3fc4b8');
  rim.renderOrder = 10;
  back.add(backing, rim);

  const hubTexture = canvasTexture(512, 512, () => {});
  const hub = new THREE.Mesh(new THREE.CircleGeometry(HUB, 64), surface(hubTexture));
  hub.renderOrder = 13;
  hub.name = 'wheel-hub';
  const plateTexture = canvasTexture(1024, 264, () => {});
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1 * 264 / 1024), surface(plateTexture));
  plate.position.set(0, -1.34, 0);
  plate.renderOrder = 13;
  face.add(hub, plate);

  const tiles = new Map();
  const hits = [];
  const state = { open: false, peek: false, source: 'pointer', highlighted: null, mode: '2d', plane: null, distance: 1, radius: .3, signature: '', drawn: '' };
  let peekUntil = 0;
  let placed = false;

  function items() { return inventory.items(); }
  function layout() {
    const list = items();
    const signature = list.map(item => item.id).join('|');
    if (signature === state.signature) return list;
    state.signature = signature;
    for (const tile of tiles.values()) tile.removeFromParent();
    tiles.clear();
    hits.length = 0;
    const size = Math.min(.3, 2 * Math.PI * RING / list.length * .7);
    list.forEach((item, index) => {
      const angle = Math.PI / 2 - index * 2 * Math.PI / list.length;
      const tile = new THREE.Group();
      tile.name = 'wheel-item-' + item.id;
      tile.position.set(Math.cos(angle) * RING, Math.sin(angle) * RING, 0);
      const ground = new THREE.Mesh(new THREE.CircleGeometry(size * .62, 40), surface(null, .95));
      ground.renderOrder = 11;
      const ring = new THREE.Mesh(new THREE.RingGeometry(size * .6, size * .68, 48), surface(null));
      ring.renderOrder = 12;
      const picture = new THREE.CanvasTexture(inventory.iconFor(item, 160));
      picture.colorSpace = THREE.SRGBColorSpace;
      const icon = new THREE.Mesh(new THREE.PlaneGeometry(size * .86, size * .86), surface(picture));
      icon.renderOrder = 12;
      const hit = new THREE.Mesh(new THREE.CircleGeometry(size * .7, 24), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.item = item.id;
      tile.add(ground, ring, icon, hit);
      tile.userData = { item: item.id, ground, ring, size };
      face.add(tile);
      tiles.set(item.id, tile);
      hits.push(hit);
    });
    const hubHit = new THREE.Mesh(new THREE.CircleGeometry(HUB, 32), new THREE.MeshBasicMaterial({ visible: false }));
    hubHit.userData.use = true;
    hub.clear();
    hub.add(hubHit);
    hits.push(hubHit);
    if (!list.some(item => item.id === state.highlighted)) state.highlighted = inventory.selected().id;
    state.drawn = '';
    return list;
  }

  function draw(list) {
    const item = list.find(entry => entry.id === state.highlighted) || list[0];
    const equipped = inventory.selected().id;
    const key = [item.id, equipped, state.source, state.peek, item.mechanism].join('|');
    if (key === state.drawn) return;
    state.drawn = key;
    for (const [id, tile] of tiles) {
      const on = id === item.id;
      const colour = COLORS[list.find(entry => entry.id === id)?.color] || '#cccccc';
      tile.userData.ground.material.color.set(on ? '#23343b' : '#0d1820');
      tile.userData.ring.material.color.set(on ? '#ffbd72' : id === equipped ? colour : '#3c5560');
      tile.scale.setScalar(on ? 1.16 : 1);
    }
    const g = hubTexture.image.getContext('2d');
    g.clearRect(0, 0, 512, 512);
    g.fillStyle = '#0d1820f0';
    g.beginPath(); g.arc(256, 256, 252, 0, Math.PI * 2); g.fill();
    g.lineWidth = 6; g.strokeStyle = COLORS[item.color] || '#e9eef2'; g.stroke();
    g.textAlign = 'center';
    g.fillStyle = '#f0f4ef';
    g.font = '600 52px system-ui, sans-serif';
    const name = wrap(g, item.name, 400).slice(0, 2);
    name.forEach((line, i) => g.fillText(line, 256, 178 + i * 56));
    g.fillStyle = '#afc1c1';
    g.font = '30px system-ui, sans-serif';
    g.fillText(item.kind?.length > 30 ? item.kind.slice(0, 29) + '…' : item.kind || '', 256, 186 + name.length * 56);
    if (item.scope) g.fillText(item.scope, 256, 226 + name.length * 56);
    if (item.id === equipped) {
      g.fillStyle = '#85e3d2';
      g.font = '600 26px ui-monospace, monospace';
      g.fillText('IN HAND', 256, 120);
    }
    if (!state.peek) {
      g.fillStyle = '#ffbd72';
      g.beginPath(); g.roundRect(176, 392, 160, 54, 12); g.fill();
      g.fillStyle = '#2a1c10';
      g.font = '700 30px system-ui, sans-serif';
      g.fillText('USE', 256, 430);
    }
    hubTexture.needsUpdate = true;
    const p = plateTexture.image.getContext('2d');
    p.clearRect(0, 0, 1024, 264);
    p.fillStyle = '#0d1820f2';
    p.beginPath(); p.roundRect(4, 4, 1016, 256, 18); p.fill();
    p.fillStyle = '#f0f4ef';
    p.font = '31px system-ui, sans-serif';
    p.textAlign = 'left';
    wrap(p, item.mechanism, 960).slice(0, 4).forEach((line, i) => p.fillText(line, 32, 52 + i * 40));
    p.fillStyle = '#9ff0e0';
    p.font = '600 29px system-ui, sans-serif';
    p.fillText(state.peek ? 'Now in hand. I opens the inventory.' : HINTS[state.source] || HINTS.pointer, 32, 238);
    plateTexture.needsUpdate = true;
  }

  const position = new THREE.Vector3();
  const other = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  /** Put the wheel in front of the viewer, in the scene, from the view that draws it now. */
  function place() {
    let distance;
    let radius;
    if (renderer.xr.isPresenting) {
      const eyes = renderer.xr.getCamera().cameras;
      if (!eyes.length) return false;
      eyes[0].matrixWorld.decompose(position, quaternion, scale);
      if (eyes[1]) position.lerp(other.setFromMatrixPosition(eyes[1].matrixWorld), .5);
      const p = eyes[0].projectionMatrix.elements;
      state.plane = sharedScreenPlane(eyes);
      state.mode = state.plane ? 'xr-plane' : 'xr-free';
      distance = state.plane || 1.3;
      radius = .62 * distance / Math.max(p[0], p[5]);
    } else {
      camera.updateWorldMatrix(true, false);
      camera.matrixWorld.decompose(position, quaternion, scale);
      const { clientWidth: w, clientHeight: h } = viewport;
      const focal = camera.projectionMatrix.elements[5] * Math.max(h, 1) / 2;
      state.mode = '2d';
      state.plane = null;
      distance = 1;
      // Fit the wheel and its plate below it inside the smaller side of the view.
      radius = .34 * Math.min(w, h) / focal * distance;
    }
    forward.set(0, 0, -1).applyQuaternion(quaternion);
    group.position.copy(position).addScaledVector(forward, distance);
    if (state.mode === '2d') group.position.addScaledVector(other.set(0, 1, 0).applyQuaternion(quaternion), radius * .2);
    group.quaternion.copy(quaternion);
    face.scale.setScalar(radius);
    // The backing stands behind the items and keeps its angular size.
    back.position.set(0, 0, -BACK_DEPTH * distance);
    back.scale.setScalar(radius * (1 + BACK_DEPTH));
    state.distance = distance;
    state.radius = radius;
    group.updateWorldMatrix(true, true);
    return true;
  }

  function open(source = 'pointer', peek = false) {
    // A fresh opening, or a glimpse turned into the menu, is placed again from the current view.
    if (!state.open || (state.peek && !peek)) placed = false;
    if (!state.open || peek) state.highlighted = inventory.selected().id;
    state.source = source;
    state.peek = peek;
    peekUntil = peek ? performance.now() + PEEK_MS : 0;
    state.open = true;
    state.drawn = '';
    group.visible = true;
  }
  function close() {
    state.open = false;
    state.peek = false;
    group.visible = false;
  }
  function toggle(source) {
    if (state.open && !state.peek) close();
    else open(source);
  }
  function step(direction) {
    const list = layout();
    const index = Math.max(0, list.findIndex(item => item.id === state.highlighted));
    state.highlighted = list[(index + direction + list.length) % list.length].id;
  }
  function take(id = state.highlighted) {
    if (!id) return;
    choose(id);
    close();
  }
  function useNow(id = state.highlighted) {
    if (!id) return;
    choose(id);
    close();
    use(id);
  }
  /** A direction from a stick (x right, y down): highlight the item that way. */
  function point(x, y) {
    if (Math.hypot(x, y) < .55) return;
    const list = layout();
    const turn = (Math.PI / 2 - Math.atan2(-y, x) + 2 * Math.PI) % (2 * Math.PI);
    state.highlighted = list[Math.round(turn / (2 * Math.PI / list.length)) % list.length].id;
  }

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick() {
    const hit = raycaster.intersectObjects(hits, false)[0];
    return hit ? hit.object.userData : null;
  }
  function viewCamera() {
    return renderer.xr.isPresenting ? renderer.xr.getCamera().cameras[0] || camera : camera;
  }
  function fromScreen(clientX, clientY) {
    const box = renderer.domElement.getBoundingClientRect();
    ndc.set((clientX - box.left) / box.width * 2 - 1, -((clientY - box.top) / box.height) * 2 + 1);
    raycaster.setFromCamera(ndc, viewCamera());
    return pick();
  }
  function hover(clientX, clientY) {
    if (!state.open || state.peek) return;
    const target = fromScreen(clientX, clientY);
    if (target?.item) state.highlighted = target.item;
  }
  /** A click or tap: on an item takes it, on the hub uses it, elsewhere closes the wheel. */
  function tap(clientX, clientY, source) {
    if (!state.open) return false;
    if (source) state.source = source;
    const target = fromScreen(clientX, clientY);
    if (target?.item) take(target.item);
    else if (target?.use) useNow();
    else close();
    return true;
  }
  /** A controller's ray: highlight what it points at; with select, take or use it. */
  function ray(origin, direction, select = false) {
    if (!state.open || state.peek) return null;
    raycaster.set(origin, direction);
    const target = pick();
    if (target?.item) state.highlighted = target.item;
    if (select) {
      state.source = 'controller';
      if (target?.item) take(target.item);
      else if (target?.use) useNow();
    }
    return target;
  }

  function frame(now = performance.now()) {
    if (state.peek && now > peekUntil) close();
    group.visible = state.open;
    if (!state.open) return;
    const list = layout();
    draw(list);
    // In 2D the wheel follows the view (the person stands still while it is open); in an immersive
    // session it stays where it opened, placed in the render hook from the current eyes.
    if (!renderer.xr.isPresenting) placed = place();
  }
  /** Called from the scene's render hook, after the browser's eyes are current. */
  function beforeRender() {
    if (!state.open || !renderer.xr.isPresenting) return;
    if (!placed) placed = place();
    else group.updateWorldMatrix(true, true);
  }

  const world = new THREE.Vector3();
  function report() {
    const list = items();
    const box = renderer.domElement.getBoundingClientRect();
    const screen = object => {
      object.getWorldPosition(world);
      const p = world.clone().project(camera);
      return [box.left + (p.x + 1) / 2 * box.width, box.top + (1 - p.y) / 2 * box.height];
    };
    return {
      open: state.open, peek: state.peek, source: state.source, mode: state.mode, plane: state.plane,
      distance: state.distance, radius: state.radius, highlighted: state.highlighted, equipped: inventory.selected().id,
      items: list.map(item => item.id),
      tiles: [...tiles].map(([id, tile]) => ({ id, world: tile.getWorldPosition(new THREE.Vector3()).toArray(), screen: screen(tile) })),
      hub: { world: hub.getWorldPosition(new THREE.Vector3()).toArray(), screen: screen(hub) },
      backing: back.localToWorld(new THREE.Vector3(0, -.78, 0)).toArray()
    };
  }

  return {
    group, open, close, toggle, step, take, use: useNow, point, hover, tap, ray, frame, beforeRender, report,
    get isOpen() { return state.open && !state.peek; }, get visible() { return state.open; }, state
  };
}
