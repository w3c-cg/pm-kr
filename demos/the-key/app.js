// BSD-2-Clause
import * as THREE from 'three';
import { PROCEDURES } from './procedures/catalogue.js';
import { loadTextures } from './textures.js';
import { createWorld, LOBBY_Z } from './world.js';
import { createStory, KEYS, STATIONS } from './story.js';
import { bindInput } from './input.js';
import { connectXR } from './xr.js';

const $ = selector => document.querySelector(selector);
const setText = (element, value) => { if (element.textContent !== value) element.textContent = value; };
const movement = new THREE.Vector3();
const direction = new THREE.Vector3();
const body = new THREE.Vector3();

function locate(state, view, position, heading) {
  view.getWorldDirection(heading);
  heading.y = 0;
  heading.normalize();
  let closest = 2.6;
  let target = null;
  for (const station of STATIONS) {
    if (station.room !== state.room || (station.id === 'member' && !state.keys.has('account'))) continue;
    const offsetX = station.x - position.x;
    const offsetZ = station.z + (state.room === 'lobby' ? LOBBY_Z : 0) - position.z;
    const distance = Math.hypot(offsetX, offsetZ);
    if (distance >= closest || offsetX * heading.x + offsetZ * heading.z < distance * .57) continue;
    target = station;
    closest = distance;
  }
  return target;
}

function placeCursor(state, rig, afterStation = null) {
  const roomZ = state.room === 'lobby' ? LOBBY_Z : 0;
  const x = afterStation?.x ?? 0;
  const z = afterStation ? afterStation.z + 2 : 5.55;
  rig.position.set(x, 0, roomZ + Math.min(z, state.room === 'lobby' ? 4.1 : 6.9));
  rig.rotation.y = 0;
}

function obstacles(state, x, z) {
  const localZ = z - (state.room === 'lobby' ? LOBBY_Z : 0);
  if (state.room === 'lobby') return Math.abs(x) > 4.32 || localZ < -4.08 || localZ > 5.36;
  if (Math.abs(x) > 7.52 || localZ < -5.59 || localZ > 7.37) return true;
  return (Math.abs(x - 4.5) < 1.27 && Math.abs(localZ - .35) < .63) ||
    (Math.abs(x + 4.5) < .93 && Math.abs(localZ - .35) < .83) ||
    (Math.abs(x + 4.85) < .91 && Math.abs(localZ + 3.05) < .64);
}

function buildInventory(story) {
  const panel = $('#inventory');
  return KEYS.map(key => {
    const button = document.createElement('button');
    button.className = 'key';
    button.type = 'button';
    button.dataset.key = key.id;
    button.style.setProperty('--key-color', 'var(--' + key.color + ')');
    const name = document.createElement('span');
    name.className = 'key-name';
    name.textContent = key.name;
    const kind = document.createElement('span');
    kind.className = 'key-kind';
    kind.textContent = key.kind;
    button.append(name, kind);
    button.addEventListener('click', () => story.select(key.id));
    panel.append(button);
    return [key, button];
  });
}

function setupGuide(qr) {
  const guide = $('#guide');
  const toggle = $('#guide-toggle');
  toggle.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    toggle.setAttribute('aria-expanded', String(!guide.hidden));
    if (!guide.hidden) guide.focus();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !guide.hidden) { toggle.click(); toggle.focus(); }
  });

  const link = $('#address');
  link.href = qr.url;
  link.addEventListener('click', event => {
    if (link.origin === location.origin && link.pathname === location.pathname) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    location.hash = link.hash;
  });
}

export async function start() {
  const viewport = $('#viewport');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    throw new Error('This browser could not create a WebGL 2 context.');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.21;
  viewport.append(renderer.domElement);

  const qrResponse = await fetch(new URL('models/qr.json', import.meta.url));
  if (!qrResponse.ok) throw new Error('The lobby address plate could not be loaded.');
  const qrBytes = await qrResponse.arrayBuffer();
  const qr = JSON.parse(new TextDecoder().decode(qrBytes));
  const textures = await loadTextures(PROCEDURES);
  const scene = new THREE.Scene();
  const world = await createWorld(textures, qr, scene);
  const procedureBytes = [...textures.values()].reduce((total, data) => total + data.bytes, 0);
  const sizes = new Intl.NumberFormat('en');
  $('#sizes').textContent = `${sizes.format(procedureBytes)} bytes of procedures · ${sizes.format(world.shapeBytes + qrBytes.byteLength)} bytes of shapes`;
  $('#engine').textContent = 'WebAssembly draws each texture. WebGL 2 draws the hall.';
  setupGuide(qr);

  const story = createStory(location.hash === '#lobby');
  const { state } = story;
  const rig = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(64, 1, .075, 60);
  camera.position.y = 1.65;
  camera.rotation.x = .045;
  scene.add(rig);
  rig.add(camera);
  const carry = world.carriedKeys(camera);
  const xrPrompt = world.xrPrompt(camera);
  placeCursor(state, rig);
  let lastHallStation = null;
  const buttons = buildInventory(story);

  function resize() {
    const { clientWidth: w, clientHeight: h } = viewport;
    if (renderer.xr.isPresenting) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  resize();

  window.addEventListener('hashchange', () => {
    if (location.hash !== '#lobby') return;
    state.room = 'lobby';
    state.outcome = 'address';
    state.notice = 'You arrived at the public lobby address.';
    placeCursor(state, rig);
  });
  function currentTarget() {
    const view = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
    view.getWorldPosition(body);
    return locate(state, view, body, direction);
  }

  function use() {
    const target = currentTarget();
    if (!target) return;
    const room = story.activate(target, performance.now());
    if (room === 'lobby') {
      lastHallStation = target;
      placeCursor(state, rig);
    }
    if (room === 'hall') {
      if (location.hash === '#lobby') history.replaceState(null, '', location.pathname + location.search);
      placeCursor(state, rig, lastHallStation);
    }
  }
  $('#use').addEventListener('click', use);
  connectXR(renderer, camera, { use, nextKey: story.nextKey, resize });
  const sampleInput = bindInput(renderer.domElement, { use, select: story.select, nextKey: story.nextKey });

  let contextLost = false;
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; });
  const notice = $('#notice');
  const targetText = $('#target');
  const useButton = $('#use');
  const locationText = $('#location');
  const mandateLimit = $('#mandate-limit');
  let previous = performance.now();
  function frame(now) {
    const dt = Math.min(Math.max(0, now - previous) / 1000, .22);
    previous = now;
    const input = sampleInput(renderer.xr.getSession());
    rig.rotation.y -= input.turn * dt * 1.7 + input.dx * .0034;
    if (!renderer.xr.isPresenting) {
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - input.tilt * dt * 1.4 - input.dy * .0034, -.8, .8);
    }
    movement.set(input.strafe, 0, -input.forward);
    const walkingYaw = renderer.xr.isPresenting
      ? Math.atan2(-direction.x, -direction.z) : rig.rotation.y;
    const steps = Math.max(1, Math.ceil(dt / .05));
    movement.clampLength(0, 1).applyAxisAngle(THREE.Object3D.DEFAULT_UP, walkingYaw).multiplyScalar(dt * 3.35 / steps);
    for (let step = 0; step < steps; step++) {
      if (!obstacles(state, rig.position.x + movement.x, rig.position.z)) rig.position.x += movement.x;
      if (!obstacles(state, rig.position.x, rig.position.z + movement.z)) rig.position.z += movement.z;
    }
    world.update(state, now / 1000);
    carry(state, now / 1000);

    const target = currentTarget();
    xrPrompt(renderer.xr.isPresenting, target, state);
    setText(targetText, target?.label || 'Walk up to a station');
    targetText.dataset.station = target?.id || '';
    useButton.disabled = !target;
    setText(locationText, state.room === 'hall' ? 'HEADQUARTERS HALL' : 'PUBLIC LOBBY');
    notice.dataset.outcome = contextLost ? 'error' : state.outcome;
    setText(notice, contextLost ? 'The browser lost its WebGL drawing context. Waiting for it to recover.' : state.notice);
    const seconds = Math.max(0, Math.ceil(((state.mandate?.expires || 0) - now) / 1000));
    setText(mandateLimit, !state.mandate ? '' : state.mandate.spent ? 'Relay · used' :
      seconds > 0 ? `Relay · ${seconds}s` : 'Relay · expired');
    for (const [key, button] of buttons) {
      button.disabled = !state.keys.has(key.id);
      const selected = String(key.id === state.selected);
      if (button.getAttribute('aria-pressed') !== selected) button.setAttribute('aria-pressed', selected);
    }
    if (!contextLost) renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);
  return { renderer, scene, camera, rig, story, textures };
}
