// BSD-2-Clause
import * as THREE from 'three';
import { proceduresFor } from './procedures/catalogue.js';
import { loadTextures } from './textures.js';
import { createWorld } from './world.js';
import { createStory, ROOMS, STATIONS } from './story.js';
import { bindInput } from './input.js';
import { connectXR, addControllers } from './xr.js';
import { createPeople } from './people.js';
import { createInventory } from './inventory.js';
import { worldAddresses } from './addresses.mjs';
import { createMechanisms } from './mechanisms.js';
import { createServiceHost } from './services.js';
import { createTablet, ROUTES } from './tablet.js';
import { fitCamera, pixelRatio, createLayout } from './view.js';
import { createWheel } from './wheel.js';
import { bindTouch } from './touch.js';

const $ = selector => document.querySelector(selector);
const setText = (element, value) => { if (element && element.textContent !== value) element.textContent = value; };
const movement = new THREE.Vector3();
const direction = new THREE.Vector3();
const body = new THREE.Vector3();
const params = new URLSearchParams(location.search);

function locate(state, view, position, heading) {
  view.getWorldDirection(heading);
  heading.y = 0;
  heading.normalize();
  let closest = 2.6;
  let target = null;
  for (const station of STATIONS) {
    if (station.room !== state.room || (station.id === 'member' && !state.keys.has('account'))) continue;
    const offsetX = station.x - position.x;
    const offsetZ = station.z + ROOMS[state.room].z - position.z;
    const distance = Math.hypot(offsetX, offsetZ);
    if (distance >= closest || offsetX * heading.x + offsetZ * heading.z < distance * .57) continue;
    target = station;
    closest = distance;
  }
  return target;
}

function placeCursor(state, rig, afterStation = null) {
  const roomZ = ROOMS[state.room].z;
  const x = afterStation?.x ?? 0;
  const z = afterStation ? afterStation.z + 2 : 5.55;
  rig.position.set(x, 0, roomZ + Math.min(z, state.room === 'hall' ? 6.9 : 4.1));
  rig.rotation.y = 0;
}

function obstacles(state, x, z) {
  const localZ = z - ROOMS[state.room].z;
  if (state.room !== 'hall') return Math.abs(x) > 4.32 || localZ < -4.08 || localZ > 5.36;
  if (Math.abs(x) > 7.52 || localZ < -5.59 || localZ > 7.37) return true;
  return (Math.abs(x - 4.5) < 1.27 && Math.abs(localZ - .35) < .63) ||
    (Math.abs(x + 3.2) < .80 && Math.abs(localZ + 4.68) < .65) ||
    (Math.abs(x + 4.85) < .91 && Math.abs(localZ + 3.05) < .64) ||
    (Math.abs(x + 1.75) < .45 && Math.abs(localZ + 5.35) < .35);
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

// Where the role presets put each service (hall coordinates).
const ROLE_SPOTS = { map: [-1.8, .6], catalogue: [1.6, -1.0], camera: [-.6, -1.6], pay: [2.4, 1.2] };
const ROLES = {
  technician: { label: 'Technician: floor map and parts catalogue', cards: ['map', 'catalogue'] },
  salesperson: { label: 'Salesperson: floor map, catalogue and pay portal', cards: ['map', 'catalogue', 'pay'] },
  guard: { label: 'Security guard: floor map and camera feed with people tracking', cards: ['map', 'camera'] }
};

export async function start() {
  const addresses = await worldAddresses(location);
  const viewport = $('#viewport');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    throw new Error('This browser could not create a WebGL 2 context.');
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.21;
  viewport.append(renderer.domElement);

  const qrResponse = await fetch(new URL('models/qr.json', import.meta.url));
  if (!qrResponse.ok) throw new Error('The lobby address plate could not be loaded.');
  const qrBytes = await qrResponse.arrayBuffer();
  const qr = JSON.parse(new TextDecoder().decode(qrBytes));
  const textures = await loadTextures(proceduresFor(addresses.mode), addresses.mode);
  const scene = new THREE.Scene();
  const world = await createWorld(textures, qr, scene);
  const procedureBytes = [...textures.values()].reduce((total, data) => total + data.bytes, 0);
  const sizes = new Intl.NumberFormat('en');
  const size = bytes => `${sizes.format(bytes / (bytes >= 1e6 ? 1e6 : 1e3))} ${bytes >= 1e6 ? 'MB' : 'kB'} (${sizes.format(bytes)} bytes)`;
  $('#sizes').textContent = `Procedures ${size(procedureBytes)} · Shapes ${size(world.shapeBytes + qrBytes.byteLength)}`;
  $('#engine').textContent = 'WebAssembly draws each texture. WebGL 2 draws the hall and its people.';
  setupGuide(qr);
  const servicesToggle = $('#services-toggle');
  servicesToggle.addEventListener('click', () => {
    $('#services-panel').hidden = !$('#services-panel').hidden;
    servicesToggle.setAttribute('aria-expanded', String(!$('#services-panel').hidden));
  });

  const notes = [];
  const say = text => { notes.push({ at: Date.now(), text }); if (notes.length > 60) notes.shift(); story.tell('notice', text); };
  const story = createStory(location.hash === '#lobby');
  const { state } = story;
  const rig = new THREE.Group();
  const camera = new THREE.PerspectiveCamera(64, 1, .075, 60);
  camera.position.y = 1.65;
  camera.rotation.x = .045;
  scene.add(rig);
  rig.add(camera);
  const xrPrompt = world.xrPrompt(camera);
  placeCursor(state, rig);
  let lastHallStation = null;

  const peopleNote = $('#people-status');
  const people = params.get('people') === '0' ? null : await createPeople(scene, world.hall, {
    seed: Number(params.get('seed') || 949), count: addresses.mode === 'public' ? 6 : Number(params.get('crowd') || 6),
    layout: world.crowdLayout, pattern: textures.get('bulkhead').texture, say: text => setText(peopleNote, text)
  });
  if (people) {
    world.mica.visible = false;
    const details = people.figures ? 'Each has its own MakeHuman model, animated with 100STYLE motion.' :
      `${people.manifest.figureCredit}. Motion: ${people.manifest.clipCredit}.`;
    setText(peopleNote, `${people.crowd.agents.length} people and Mica as Gaussian splats. ${details}`);
  }
  const mechanisms = createMechanisms(addresses);
  $('#service-address').placeholder = addresses.services.pay;
  if (addresses.mode === 'public') {
    $('#test-member').href = addresses.members;
    $('#test-member').textContent = 'Member certificate details';
    $('#test-member').hidden = false;
  }
  const inventory = createInventory({ story, camera, world, panel: $('#inventory'), addresses, say });
  const services = createServiceHost({ scene, hall: world.hall, origins: mechanisms.origins, say, people });
  const serviceDepthNote = $('#service-depth-status');
  const serviceDepthMessage = 'This session has no shared screen plane for service drawings. They are available in 2D.';
  scene.onBeforeRender = () => {
    if (renderer.xr.isPresenting) tablet.frame();
    wheel.beforeRender();
    services.projection.update(renderer);
    const unavailable = renderer.xr.isPresenting && services.placed.size && services.projection.unavailable;
    setText(serviceDepthNote, unavailable ? serviceDepthMessage : '');
  };
  const tablet = createTablet({ camera, scene, renderer, say, viewport, origins: mechanisms.origins, params });
  const wheel = createWheel({ scene, camera, renderer, viewport, inventory,
    choose: id => inventory.select(id), use: () => action() });
  // The inventory as the input sees it: it does not open over the tablet's full screen.
  const menu = {
    get isOpen() { return wheel.isOpen; },
    toggle: source => { if (!tablet.state.full) wheel.toggle(renderer.xr.isPresenting && source === 'pointer' ? 'keys' : source); },
    close: wheel.close, step: wheel.step, take: wheel.take, point: wheel.point, hover: wheel.hover, tap: wheel.tap, ray: wheel.ray
  };
  // Q and E outside the wheel still change the item in hand at once; the wheel shows it for a moment.
  function cycleKey(step, source = 'keys') {
    inventory.cycle(step);
    if (!wheel.isOpen && !tablet.state.full) wheel.open(source, true);
  }
  const play = $('#play');
  const layout = createLayout(play);
  const view = { focal: 0, ratio: 1, css: [0, 0] };

  function resize() {
    const { clientWidth: w, clientHeight: h } = viewport;
    if (renderer.xr.isPresenting) return;
    view.ratio = pixelRatio(w, h);
    renderer.setPixelRatio(view.ratio);
    renderer.setSize(w, h, false);
    view.focal = fitCamera(camera, w, h);
    view.css = [w, h];
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
    camera.getWorldPosition(body);
    return locate(state, camera, body, direction);
  }
  function personPosition() {
    const p = new THREE.Vector3();
    (renderer.xr.isPresenting ? renderer.xr.getCamera() : camera).getWorldPosition(p);
    return p;
  }

  function doorOpened(id) {
    const station = STATIONS.find(s => s.id === id);
    if (station && people) people.openDoor(id, station.x, station.z);
  }

  async function runMechanism(name) {
    const result = await mechanisms.run(name);
    story.tell(result.outcome, result.notice);
    if (result.grantKey) { state.keys.add(result.grantKey); inventory.select(result.grantKey); }
    if (result.door) { state.opened.add(result.door); doorOpened(result.door); }
  }

  const raycaster = new THREE.Raycaster();
  function placeCard(card, at) {
    const person = personPosition();
    let position;
    if (at) position = new THREE.Vector3(at[0], 0, at[1]);
    else {
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();
      position = person.clone().addScaledVector(direction, 2.2);
      position.y = 0;
      position.x = THREE.MathUtils.clamp(position.x, -7, 7);
      position.z = THREE.MathUtils.clamp(position.z, -5, 6.5);
    }
    const yaw = Math.atan2(person.x - position.x, person.z - position.z);
    const service = services.place(card, position, at ? Math.atan2(-position.x, 5.55 - position.z) : yaw);
    if (!service) return;
    say(`${card.name} placed: ${service.host} runs in its own frame and draws through the world.`);
    return service;
  }

  function action() {
    if (wheel.isOpen) { wheel.take(); return; }
    if (tablet.state.full) {
      if (!tablet.state.input) tablet.unbind();
      return;
    }
    const item = inventory.selected();
    if (item.type === 'tablet') {
      if (!tablet.state.held) tablet.hold();
      else tablet.bind();
      return;
    }
    if (item.type === 'card') {
      if (renderer.xr.isPresenting && services.projection.unavailable) {
        say(serviceDepthMessage);
        return;
      }
      raycaster.setFromCamera(new THREE.Vector2(0, 0), renderer.xr.isPresenting ? renderer.xr.getCamera() : camera);
      const anchors = [...services.placed.values()].map(s => s.content);
      const hit = raycaster.intersectObjects(anchors, true)[0];
      if (hit && hit.distance < 4 && services.select(hit.object)) return;
      placeCard(item);
      return;
    }
    const target = currentTarget();
    if (!target) return;
    const room = story.activate(target, performance.now());
    if (room?.mechanism) { runMechanism(room.mechanism); return; }
    if (target.id === 'qr' && !renderer.xr.isPresenting) {
      rig.position.set(target.x + 2.15, 0, target.z);
      rig.rotation.y = Math.PI / 2;
      camera.rotation.x = .01;
    }
    if (room === 'lobby' || room === 'lab') {
      doorOpened(room === 'lobby' ? 'public' : 'member');
      lastHallStation = target;
      placeCursor(state, rig);
    }
    if (room === 'hall') {
      if (location.hash === '#lobby') history.replaceState(null, '', location.pathname + location.search);
      placeCursor(state, rig, lastHallStation);
    }
  }
  $('#action').addEventListener('click', action);
  const pointers = addControllers(renderer, rig);
  connectXR(renderer, camera, { action, cycleKey, resize, pointers, wheel: menu });
  const touch = bindTouch({ action, inventory: menu });
  const sampleInput = bindInput(renderer.domElement, { action, select: inventory.select, cycleKey, wheel: menu, stick: touch.sample });
  window.addEventListener('keydown', event => {
    if (event.repeat || event.target instanceof Element && event.target.closest('input, textarea, select, #guide')) return;
    if (!tablet.state.held || tablet.state.full) return;
    if (event.code === 'KeyR') tablet.nextRoute();
    if (event.code === 'KeyT') tablet.nextSize();
    if (event.code === 'KeyX') tablet.stow();
  });

  // Pointer on the tablet: forwarded to the desktop window (route "desktop").
  const pointerNdc = new THREE.Vector2();
  function tabletPoint(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (tablet.state.full) {
      const scale = tablet.lastFullScale || { x: 1, y: 1 };
      const u = ((event.clientX - rect.left) / rect.width * 2 - 1) / scale.x * .5 + .5;
      const v = ((event.clientY - rect.top) / rect.height * 2 - 1) / scale.y * .5 + .5;
      return u >= 0 && u <= 1 && v >= 0 && v <= 1 ? [u, v] : null;
    }
    pointerNdc.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObject(tablet.screen)[0];
    return hit?.uv ? [hit.uv.x, 1 - hit.uv.y] : null;
  }
  for (const type of ['pointerdown', 'pointerup']) {
    renderer.domElement.addEventListener(type, event => {
      if (!tablet.state.held || tablet.state.route !== 'desktop') return;
      const uv = tabletPoint(event);
      if (uv) tablet.pointer(uv[0], uv[1], type === 'pointerdown' ? 'mousedown' : 'mouseup', event.button);
    });
  }

  // Panels: tablet routes and sizes, services, roles.
  const routeList = $('#tablet-routes');
  for (const [id, route] of Object.entries(ROUTES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.route = id;
    button.textContent = route.label;
    button.addEventListener('click', () => { if (!tablet.state.held) tablet.hold(); tablet.setRoute(id); });
    routeList.append(button);
  }
  $('#tablet-size').addEventListener('change', event => tablet.setSize(event.target.value));
  $('#tablet-stow').addEventListener('click', () => tablet.stow());
  function compose(role) {
    for (const id of ROLES[role].cards) {
      let card = inventory.cards.find(c => c.id === id);
      if (!card && id === 'pay') {
        const kept = inventory.selected().id;
        const added = inventory.addCard(addresses.services.pay, 'Pay portal');
        inventory.select(kept);
        card = inventory.cards.find(c => c.id === added);
      }
      if (card) placeCard(card, ROLE_SPOTS[id]);
    }
    if (role === 'guard') {
      services.grant('camera', 'people');
      let tries = 0;
      const linkWhenReady = () => {
        if (services.links.some(([a, b]) => a === 'camera' && b === 'map')) return;
        if (services.link('camera', 'map')) say('You linked the camera feed to the floor map: they now talk through a port you gave them.');
        else if (++tries < 40) setTimeout(linkWhenReady, 250);
        else say('The camera feed and the floor map could not be linked: one of them never connected.');
      };
      linkWhenReady();
    }
    say(ROLES[role].label + ': composed by you from three origins.');
  }
  for (const [id, role] of Object.entries(ROLES)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.role = id;
    button.textContent = role.label;
    button.addEventListener('click', () => compose(id));
    $('#roles').append(button);
  }
  $('#add-service').addEventListener('submit', event => {
    event.preventDefault();
    const id = inventory.addCard($('#service-address').value.trim());
    if (id) say('Service card added to your inventory. Select it and press Action to place it.');
  });
  const serviceList = $('#service-list');
  function renderServices() {
    const report = services.report();
    const html = report.map(s => `${s.id}|${s.state}|${s.level}|${s.granted}|${s.wants}`).join(';');
    if (serviceList.dataset.render === html) return;
    serviceList.dataset.render = html;
    serviceList.replaceChildren(...report.map(s => {
      const row = document.createElement('li');
      row.textContent = `${s.origin.replace('https://', '')} · ${s.state} · ${s.level}`;
      for (const want of s.wants.filter(w => w === 'person' || w === 'people')) {
        const button = document.createElement('button');
        button.type = 'button';
        const on = s.granted.includes(want);
        button.textContent = (on ? 'Stop sharing ' : 'Allow ') + (want === 'person' ? 'where I am' : 'people positions');
        button.addEventListener('click', () => services.grant(s.id, want, !on));
        row.append(' ', button);
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => services.remove(s.id));
      row.append(' ', remove);
      return row;
    }));
  }

  // Deterministic proof poses: ?simTime=SECONDS fast-forwards the crowd, ?freeze=1 holds it.
  if (people && params.get('simTime')) {
    people.fastForward(Number(params.get('simTime')), { x: rig.position.x, z: rig.position.z });
  }
  if (people && params.get('freeze') === '1') people.freeze();
  for (const role of (params.get('compose') || '').split(',').filter(r => r in ROLES)) compose(role);

  let contextLost = false;
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { contextLost = false; });
  const notice = $('#notice');
  const targetText = $('#target');
  const reticle = $('#reticle');
  const actionButton = $('#action');
  const touchAction = $('#touch-action');
  let frames = 0;
  const locationText = $('#location');
  const mandateLimit = $('#mandate-limit');
  let previous = performance.now();
  const timing = [];
  function frame(now) {
    const dt = Math.min(Math.max(0, now - previous) / 1000, .22);
    previous = now;
    const immersive = renderer.xr.isPresenting;
    const full = tablet.state.full;
    const input = sampleInput(renderer.xr.getSession());
    frames++;
    // While the inventory is open the person stands still: the pointer, the stick or the ray choose in it.
    if (wheel.isOpen) Object.assign(input, { strafe: 0, forward: 0, turn: 0, tilt: 0, dx: 0, dy: 0 });
    if (wheel.isOpen && immersive) for (const pointer of pointers.rays()) wheel.ray(pointer.origin, pointer.direction);
    if (!full) {
      rig.rotation.y -= input.turn * dt * 1.7 + input.dx * .0034;
      if (!immersive) {
        camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - input.tilt * dt * 1.4 - input.dy * .0034, -.8, .8);
      }
      movement.set(input.strafe, 0, -input.forward);
      const walkingYaw = immersive ? Math.atan2(-direction.x, -direction.z) : rig.rotation.y;
      const steps = Math.max(1, Math.ceil(dt / .05));
      movement.clampLength(0, 1).applyAxisAngle(THREE.Object3D.DEFAULT_UP, walkingYaw).multiplyScalar(dt * 3.35 / steps);
      for (let step = 0; step < steps; step++) {
        if (!obstacles(state, rig.position.x + movement.x, rig.position.z)) rig.position.x += movement.x;
        if (!obstacles(state, rig.position.x, rig.position.z + movement.z)) rig.position.z += movement.z;
      }
    }
    world.update(state, now / 1000);
    const person = personPosition();
    const inHall = state.room === 'hall';
    if (full && immersive) { world.hall.visible = world.lobby.visible = world.lab.visible = false; }
    const started = performance.now();
    people?.update(dt, { x: person.x, z: person.z }, camera, renderer, inHall && !(full && immersive),
      services.browseStops());
    timing.push(performance.now() - started);
    if (timing.length > 120) timing.shift();
    services.update(person, inHall && !(full && immersive));
    if (!immersive) tablet.frame();
    const target = full ? null : currentTarget();
    const inspectingAddress = target?.id === 'qr';
    inventory.frame(immersive, inspectingAddress || full);
    wheel.frame(now);
    reticle.hidden = inspectingAddress || full || wheel.visible;
    play.toggleAttribute('data-reading-address', inspectingAddress);
    play.toggleAttribute('data-full-screen', full);
    const item = inventory.selected();
    const station = full ? 'Memory Tablet · full screen' : target?.label || 'Walk up to a station';
    const message = contextLost ? 'The browser lost its WebGL drawing context. Waiting for it to recover.' : state.notice;
    xrPrompt(immersive && !wheel.visible, station, serviceDepthNote.textContent || message, item);
    setText(targetText, station);
    targetText.dataset.station = target?.id || '';
    actionButton.disabled = !(target || item.type !== 'key' || full || wheel.isOpen);
    touchAction.disabled = actionButton.disabled;
    play.dataset.outcome = state.outcome;
    play.toggleAttribute('data-inventory-open', wheel.isOpen);
    setText(locationText, ROOMS[state.room].label.toUpperCase());
    notice.dataset.outcome = contextLost ? 'error' : state.outcome;
    setText(notice, message);
    setText($('#item-name'), item.name);
    setText($('#item-kind'), item.kind);
    setText($('#item-mechanism'), item.mechanism);
    const seconds = Math.max(0, Math.ceil(((state.mandate?.expires || 0) - now) / 1000));
    setText(mandateLimit, !state.mandate ? '' : state.mandate.spent ? 'Relay · used' :
      seconds > 0 ? `Relay · ${seconds}s` : 'Relay · expired');
    $('#tablet-panel').hidden = !tablet.state.held;
    setText($('#tablet-status'), tablet.state.status);
    for (const button of routeList.children) button.setAttribute('aria-pressed', String(button.dataset.route === tablet.state.route));
    renderServices();
    if (contextLost) return;
    const { clientWidth: w, clientHeight: h } = viewport;
    if (full && !immersive) tablet.lastFullScale = tablet.renderFull(w, h);
    else renderer.render(scene, camera);
    tablet.renderOverlay(scene, camera, w, h);
  }
  renderer.setAnimationLoop(frame);
  const proof = {
    renderer, scene, camera, rig, story, textures, world, people, inventory, services, tablet, mechanisms, notes, action, compose, timing, stations: STATIONS,
    wheel, layout, view, pointers, get frames() { return frames; },
    setPose(x, z, yaw = 0, pitch = .02) { rig.position.set(x, 0, z); rig.rotation.y = yaw; camera.rotation.x = pitch; },
    // For captures: stop the loop after drawing one more frame (a still), and start it again.
    still() { return new Promise(resolve => { renderer.setAnimationLoop(now => { frame(now); renderer.setAnimationLoop(null); resolve(); }); }); },
    resume() { previous = performance.now(); renderer.setAnimationLoop(frame); },
    report: () => ({
      room: state.room, outcome: state.outcome, notice: state.notice, keys: [...state.keys], selected: inventory.selected().id,
      opened: [...state.opened], tablet: tablet.report(), services: services.report(), people: people?.snapshot() || null,
      mechanisms: mechanisms.log, immersive: renderer.xr.isPresenting, wheel: wheel.report(), layout: layout.layout,
      view: { ...view, fov: camera.fov, aspect: camera.aspect, buffer: [renderer.domElement.width, renderer.domElement.height] }
    })
  };
  return proof;
}
