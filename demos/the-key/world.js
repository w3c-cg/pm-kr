// BSD-2-Clause
import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { lettering } from './letters.js';
import { ROOMS, STATIONS } from './story.js';

const MODEL_NAMES = [
  'visitor', 'account', 'mandate', 'door', 'portal', 'qr-plate', 'cargo',
  'bulkhead', 'ribbed-wall', 'deck-panel', 'pillar', 'reception-module', 'lobby-exhibit',
  'lab-module', 'beacon', 'mica'
];

async function fetchModel(name, loader) {
  const url = new URL(`models/${name}.glb`, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Model ${name} returned HTTP ${response.status}.`);
  const bytes = await response.arrayBuffer();
  const { scene } = await loader.parseAsync(bytes, new URL('models/', import.meta.url).href);
  return [name, { scene, bytes: bytes.byteLength }];
}

export async function createWorld(textures, qr, scene) {
  const material = {};
  const glow = {};
  for (const [name, { texture }] of textures) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    material[name] = new THREE.MeshLambertMaterial({ name, map: texture });
    glow[name] = new THREE.MeshBasicMaterial({ name, map: texture });
  }
  const loader = new GLTFLoader();
  const assets = new Map(await Promise.all(MODEL_NAMES.map(name => fetchModel(name, loader))));
  for (const [name, { scene: model }] of assets) {
    model.traverse(object => {
      if (!object.isMesh) return;
      const procedure = object.material.name;
      if (!material[procedure] || !object.geometry.attributes.uv) {
        throw new Error(`Model ${name} needs surface coordinates and a known procedure (${procedure}).`);
      }
      object.material = material[procedure];
    });
  }

  const hall = new THREE.Group();
  const lobby = new THREE.Group();
  const lab = new THREE.Group();
  lobby.position.z = ROOMS.lobby.z;
  lab.position.z = ROOMS.lab.z;
  scene.add(hall, lobby, lab);
  scene.background = new THREE.Color('#101822');
  scene.fog = new THREE.Fog('#14262c', 14, 40);
  scene.add(new THREE.HemisphereLight('#dae7ff', '#ac6948', 2.15));
  const overhead = new THREE.DirectionalLight('#f4dabd', 1.55);
  overhead.position.set(3, 6, 5);
  scene.add(overhead);

  const makeGroup = (parent, x, y, z) => {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    parent.add(group);
    return group;
  };
  const object = (parent, geometry, material, x, y, z) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  function box(parent, w, h, d, x, y, z, surface, lit = true) {
    return object(parent, new THREE.BoxGeometry(w, h, d), (lit ? material : glow)[surface], x, y, z);
  }
  const clone = (parent, name, x, y, z) => {
    const model = assets.get(name).scene.clone(true);
    model.position.set(x, y, z);
    parent.add(model);
    return model;
  };
  function sign(parent, text, x, y, z, size, color = 'white') {
    const group = makeGroup(parent, x, y, z);
    box(group, text.length * size * 6 + .25, size * 7 + .16, .05, 0, 0, 0, 'ink');
    const textMesh = lettering(text, glow[color], size);
    textMesh.position.z = .045;
    group.add(textMesh);
    return group;
  }
  function light(parent, x, y, z, color, strength) {
    const lamp = new THREE.PointLight(color, strength, 7);
    lamp.position.set(x, y, z);
    parent.add(lamp);
  }
  function installSet(room, name, poses, finish = null) {
    const model = assets.get(name).scene;
    model.updateMatrixWorld(true);
    const socket = new THREE.Object3D();
    const matrix = new THREE.Matrix4();
    model.traverse(part => {
      if (!part.isMesh) return;
      const batch = new THREE.InstancedMesh(part.geometry, finish || part.material, poses.length);
      poses.forEach(([x, h, z, yaw, sx, sy, sz, pitch = 0], i) => {
        socket.position.set(x, h, z);
        socket.rotation.set(pitch, yaw, 0, 'YXZ');
        socket.scale.set(sx, sy, sz);
        socket.updateMatrix();
        batch.setMatrixAt(i, matrix.multiplyMatrices(socket.matrix, part.matrixWorld));
      });
      room.add(batch);
    });
  }
  function corridor(room, width, depth, height, wallTrim) {
    const floor = [];
    const ceiling = [];
    const walls = [];
    const beams = [];
    const lx = Math.ceil(width / 4);
    const lz = Math.ceil(depth / 4);
    const dx = width / lx;
    const dz = depth / lz;
    for (let x = 0; x < lx; x++) {
      const px = (x + .5) * dx - width/2;
      for (let z = 0; z < lz; z++) {
        const pz = (z + .5) * dz - depth/2;
        floor.push([px, -.012, pz, 0, dx/4, 1, dz/4]);
        ceiling.push([px, height, pz, 0, dx/4, 1, dz/4, Math.PI]);
      }
      walls.push([px, 0, -depth/2, Math.PI, dx/4, height/4.25, .60]);
      walls.push([px, 0, depth/2, 0, dx/4, height/4.25, .60]);
    }
    for (let z = 0; z < lz; z++) {
      const pz = (z + .5) * dz - depth/2;
      for (const side of [-1, 1]) {
        walls.push([side * width/2, 0, pz, side * Math.PI/2, dz/4, height/4.25, .55]);
        beams.push([side * (width/2 - .12), 0, pz + dz/2, 0, .43, height/4.23, .61]);
      }
    }
    installSet(room, 'deck-panel', floor);
    installSet(room, 'deck-panel', ceiling, material.ceiling);
    for (const z of [-depth/3, 0, depth/3]) {
      box(room, width - .28, .16, .39, 0, height - .08, z, 'trim');
      box(room, width * .72, .025, .09, 0, height - .17, z, 'white', false);
    }
    installSet(room, wallTrim, walls);
    installSet(room, 'pillar', beams);
  }
  corridor(hall, 16.25, 15.6, 4.9, 'bulkhead');
  corridor(lobby, 9.6, 11.6, 4.3, 'ribbed-wall');
  corridor(lab, 9.6, 11.6, 4.3, 'bulkhead');

  const field = new THREE.Shape();
  field.moveTo(-.93, 0);
  field.lineTo(.93, 0);
  field.lineTo(.93, 2.4);
  field.lineTo(.62, 2.8);
  field.lineTo(-.62, 2.8);
  field.lineTo(-.93, 2.4);
  field.closePath();

  function gate(parent, station, title, color, open = true) {
    const group = makeGroup(parent, station.x, 0, station.z);
    group.rotation.y = station.yaw || 0;
    clone(group, 'portal', 0, 0, 0);
    if (open) {
      object(group, new THREE.ShapeGeometry(field), glow.field, 0, .03, -.12);
      const symbol = object(group, new THREE.RingGeometry(.35, .39, 6), glow[color], 0, 1.61, -.087);
      symbol.rotation.z = Math.PI/6;
      box(group, .22, .047, .022, 0, 1.61, -.08, color, false);
    } else {
      object(group, new THREE.ShapeGeometry(field), glow.field, 0, .03, -.16);
      group.userData.door = clone(group, 'door', 0, 0, .04);
    }
    box(group, 2.78, .036, .63, 0, .018, .3, 'trim');
    box(group, 2.55, .025, .063, 0, .042, .56, color, false);
    sign(group, title, 0, 3.43, .03, .027, color);
    if (station.id === 'public') light(group, 0, 1.58, 1.12, '#70e4de', 18);
    return group;
  }

  const stations = Object.fromEntries(STATIONS.map(station => [station.id, station]));
  gate(hall, stations.public, 'PUBLIC LOBBY', 'amber');
  const doors = {
    false: gate(hall, stations.false, 'ARCHIVE DOOR', 'signal', false),
    vault: gate(hall, stations.vault, 'VAULT', 'signal', false),
    server: gate(hall, stations.server, 'SERVER ROOM', 'violet', false),
    office: gate(hall, stations.office, 'STUDIO OFFICE', 'teal', false)
  };
  const kiosk = makeGroup(hall, stations.kiosk.x, 0, stations.kiosk.z);
  box(kiosk, .5, 1.25, .34, 0, .625, 0, 'slate');
  const kioskFace = box(kiosk, .42, .3, .03, 0, 1.12, .18, 'white', false);
  kioskFace.rotation.x = -.35;
  sign(kiosk, 'IDENTITY', 0, 1.55, .05, .018, 'white');
  const member = gate(hall, stations.member, 'MEMBERS ENTRY', 'teal');
  member.visible = false;
  gate(lobby, stations.return, 'RETURN TO HALL', 'teal');
  gate(lab, stations['lab-return'], 'RETURN TO HALL', 'violet');

  sign(hall, 'MORROWGLASS STUDIO', 0, 4.43, -7.02, .053, 'white');
  const reception = makeGroup(hall, stations.desk.x, 0, stations.desk.z);
  const console = clone(reception, 'reception-module', 0, 0, 0);
  console.scale.set(.9, 1.09, .38);
  sign(reception, 'ACCOUNT DESK', 0, .72, .49, .024, 'teal');
  const face = box(reception, .55, .28, .05, 0, 1.24, .11, 'teal', false);
  face.rotation.x = -.3;
  const accountKey = clone(reception, 'account', .63, 1.45, .06);

  const helper = makeGroup(hall, stations.helper.x, 0, stations.helper.z);
  const mica = clone(helper, 'mica', 0, .02, 0);
  mica.scale.setScalar(.83);
  mica.name = 'mica';
  sign(helper, 'MICA', 0, 2.12, .09, .028, 'violet');
  const hatch = makeGroup(hall, stations.hatch.x, 0, stations.hatch.z);
  box(hatch, 1.38, 1.36, .78, 0, .68, 0, 'slate');
  box(hatch, 1.17, .75, .1, 0, .79, .41, 'trim');
  const hatchLeaf = box(hatch, .99, .53, .06, 0, .79, .473, 'divider');
  box(hatch, .12, .035, .045, 0, .82, .518, 'violet', false);
  sign(hatch, 'PARCEL HATCH', 0, 1.64, .20, .031, 'violet');
  const parcel = clone(hatch, 'cargo', 0, 1.37, .05);
  parcel.scale.setScalar(.52);
  parcel.visible = false;

  const plaque = makeGroup(hall, stations.qr.x, 1.67, stations.qr.z);
  plaque.rotation.y = Math.PI/2;
  clone(plaque, 'qr-plate', 0, 0, 0);
  const qrWidth = 1.24;
  const cell = qrWidth / qr.rows.length;
  box(plaque, qrWidth, qrWidth, .013, 0, 0, .102, 'white', false);
  const bits = qr.rows.reduce((sum, row) => sum + [...row].filter(bit => bit === '1').length, 0);
  const modules = new THREE.InstancedMesh(new THREE.PlaneGeometry(cell, cell), glow.ink, bits);
  const point = new THREE.Object3D();
  let bitIndex = 0;
  qr.rows.forEach((row, y) => [...row].forEach((bit, x) => {
    if (bit !== '1') return;
    point.position.set((x + .5) * cell - qrWidth/2, qrWidth/2 - (y + .5) * cell, .110);
    point.updateMatrix();
    modules.setMatrixAt(bitIndex++, point.matrix);
  }));
  plaque.add(modules);
  sign(plaque, 'LOBBY ADDRESS', 0, .92, .04, .021, 'white');

  sign(lobby, 'PUBLIC LOBBY', 0, 3.92, -4.40, .032, 'teal');
  sign(lab, 'MEMBERS LAB', 0, 3.92, -4.40, .032, 'violet');
  for (const x of [-3.05, 3.05]) {
    const exhibit = clone(lobby, 'lobby-exhibit', x, 0, -1.76);
    exhibit.rotation.y = x < 0 ? .35 : -.35;
    const bench = clone(lab, 'lab-module', x, 0, -.85);
    bench.rotation.y = x < 0 ? Math.PI/2 : -Math.PI/2;
    const beacon = clone(lab, 'beacon', x, 0, 2.7);
    beacon.scale.setScalar(.85);
  }
  for (const x of [-6.78, 6.78]) {
    clone(hall, 'beacon', x, 0, 2.96);
    const cargo = clone(hall, 'cargo', x, 0, 5.15);
    cargo.scale.setScalar(1.4);
  }

  function xrPrompt(parent) {
    const display = makeGroup(parent, -.57, -1.11, -12.35);
    display.name = 'immersive-interface';
    display.visible = false;
    const surface = name => {
      const copy = glow[name].clone();
      copy.depthTest = false;
      copy.depthWrite = false;
      return copy;
    };
    const finishes = Object.fromEntries(['ink', 'white', 'amber', 'teal', 'violet', 'signal'].map(name => [name, surface(name)]));
    const backing = object(display, new THREE.PlaneGeometry(3.37, 1.5), finishes.ink, 0, 0, 0);
    backing.renderOrder = 3;
    let last = '';
    const lines = [];
    function wrap(message) {
      const paragraphs = [];
      for (const word of message.split(' ')) {
        const index = paragraphs.length - 1;
        if (index >= 0 && paragraphs[index].length + word.length < 38) paragraphs[index] += ' ' + word;
        else paragraphs.push(word);
      }
      return paragraphs;
    }
    return (active, station, notice, key) => {
      display.visible = active;
      if (!active) return;
      const next = JSON.stringify([station, notice, key.name]);
      if (next === last) return;
      last = next;
      for (const line of lines.splice(0)) {
        line.children[0].dispose();
        line.removeFromParent();
      }
      const content = [station, 'Action / F / Trigger', 'Selected: ' + key.name, ...wrap(notice)];
      backing.scale.y = (content.length * .22 + .09) / 1.5;
      display.userData.text = content;
      content.forEach((text, index) => {
        const line = lettering(text, finishes[index === 2 && finishes[key.color] ? key.color : 'white'], .014);
        line.position.set(0, (content.length - 1) * .11 - index * .22, .006);
        line.children[0].renderOrder = 4;
        lines.push(line);
        display.add(line);
      });
    };
  }

  function update(state, time) {
    hall.visible = state.room === 'hall';
    lobby.visible = state.room === 'lobby';
    lab.visible = state.room === 'lab';
    member.visible = state.keys.has('account');
    accountKey.visible = !member.visible;
    accountKey.rotation.y = time * .9;
    mica.rotation.y = Math.sin(time * 1.7) * .10;
    hatchLeaf.position.y = state.parcel ? .98 : .79;
    parcel.visible = state.parcel;
    for (const [id, group] of Object.entries(doors)) {
      const door = group.userData.door;
      const target = state.opened.has(id) ? 2.75 : 0;
      door.position.y += (target - door.position.y) * .08;
    }
    textures.get('field').texture.offset.y = (time * .10) % 1;
  }

  /** A small copy of a key's model for the hand (the three original key models; others are drawn by the inventory). */
  function keyModel(id) {
    return assets.has(id) ? assets.get(id).scene.clone(true) : null;
  }

  return {
    update, xrPrompt, keyModel, hall, lobby, lab, mica, doors,
    shapeBytes: [...assets.values()].reduce((sum, asset) => sum + asset.bytes, 0)
  };
}
