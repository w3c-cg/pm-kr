// BSD-2-Clause
import * as THREE from 'three';
import { GLTFLoader } from './vendor/loaders/GLTFLoader.js';
import { lettering } from './letters.js';
import { KEYS, STATIONS } from './story.js';

export const LOBBY_Z = -26;
const MODEL_NAMES = ['visitor', 'account', 'mandate', 'door', 'portal', 'qr-plate', 'cargo'];

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
    material[name] = new THREE.MeshStandardMaterial({ name, map: texture, roughness: .62 });
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
  lobby.position.z = LOBBY_Z;
  scene.add(hall, lobby);
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
    textMesh.position.z = .027;
    group.add(textMesh);
    return group;
  }
  function light(parent, x, y, z, color, strength) {
    const lamp = new THREE.PointLight(color, strength, 7);
    lamp.position.set(x, y, z);
    parent.add(lamp);
  }
  function corridor(room, width, depth, y) {
    box(room, width, .2, depth, 0, -.11, 0, 'floor');
    box(room, width, .2, depth, 0, y, 0, 'slate');
    box(room, width, y, .22, 0, y/2, -depth/2, 'slate');
    box(room, width, y, .22, 0, y/2, depth/2, 'slate');
    for (const side of [-1, 1]) {
      box(room, .22, y, depth, side * width/2, y/2, 0, 'slate');
      box(room, .3, .23, depth, side * (width/2 - .07), .16, 0, 'trim');
      box(room, .12, .05, depth, side * (width/2 - .2), 2.68, 0, 'teal', false);
      box(room, .045, .008, depth, side * 1.38, .004, 0, 'amber', false);
    }
    for (let z = -depth/2 + 1; z < depth/2; z += 3.2) {
      box(room, width, .21, .24, 0, y - .18, z, 'trim');
      box(room, width * .74, .042, .12, 0, y - .31, z + .28, 'white', false);
      for (const side of [-1, 1]) {
        box(room, .32, y - .2, .29, side * (width/2 - .19), y/2, z, 'trim');
      }
    }
  }
  corridor(hall, 16.1, 15.7, 4.9);
  corridor(lobby, 9.4, 11.6, 4.3);
  for (let x = -7.35; x < 8; x += 1.05) {
    box(hall, .71, .27, .24, x, 4.38, -7.64, 'trim');
    box(hall, .53, .044, .025, x, 4.41, -7.49, 'teal', false);
  }

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
    clone(group, 'portal', 0, 0, 0);
    if (open) {
      object(group, new THREE.ShapeGeometry(field), glow.field, 0, .03, -.12);
      const symbol = object(group, new THREE.RingGeometry(.35, .39, 6), glow[color], 0, 1.61, -.087);
      symbol.rotation.z = Math.PI/6;
      box(group, .22, .047, .022, 0, 1.61, -.08, color, false);
    } else {
      clone(group, 'door', 0, 0, .04);
    }
    box(group, 2.78, .036, .63, 0, .018, .3, 'trim');
    box(group, 2.55, .025, .063, 0, .042, .56, color, false);
    sign(group, title, 0, 3.43, .03, .027, color);
    if (station.id === 'public') light(group, 0, 1.58, 1.12, '#70e4de', 18);
    return group;
  }

  const stations = Object.fromEntries(STATIONS.map(station => [station.id, station]));
  gate(hall, stations.public, 'PUBLIC LOBBY', 'amber');
  gate(hall, stations.false, 'ARCHIVE DOOR', 'signal', false);
  const member = gate(hall, stations.member, 'MEMBERS ENTRY', 'teal');
  member.visible = false;
  gate(lobby, stations.return, 'RETURN TO HALL', 'teal');

  sign(hall, 'MORROWGLASS STUDIO', 0, 4.60, -7.36, .040, 'white');
  const reception = makeGroup(hall, stations.desk.x, 0, stations.desk.z);
  box(reception, 2.12, 1.04, .75, 0, .52, 0, 'slate');
  box(reception, 2.28, .1, .85, 0, 1.07, 0, 'trim');
  box(reception, 1.94, .035, .022, 0, 1, .394, 'teal', false);
  sign(reception, 'ACCOUNT DESK', 0, .69, .405, .023, 'teal');
  const terminal = box(reception, .53, .35, .06, 0, 1.31, -.15, 'trim');
  terminal.rotation.x = -.24;
  const face = box(reception, .45, .27, .02, 0, 1.32, -.11, 'teal', false);
  face.rotation.x = -.24;
  const accountKey = clone(reception, 'account', .63, 1.45, .06);

  const helper = makeGroup(hall, stations.helper.x, 0, stations.helper.z);
  object(helper, new THREE.CylinderGeometry(.64, .76, .21, 14), material.trim, 0, .1, 0);
  const mica = makeGroup(helper, 0, .15, 0);
  object(mica, new THREE.CapsuleGeometry(.3, .39, 3, 10), material.slate, 0, .65, 0);
  object(mica, new THREE.SphereGeometry(.28, 14, 10), material.trim, 0, 1.18, 0);
  box(mica, .38, .17, .12, 0, 1.2, .24, 'ink');
  for (const x of [-.089, .089]) {
    box(mica, .052, .043, .015, x, 1.21, .307, 'violet', false);
    object(mica, new THREE.CapsuleGeometry(.074, .24, 2, 8), material.trim, x * 3.9, .66, 0);
  }
  sign(helper, 'MICA', 0, 1.94, .04, .028, 'violet');
  const hatch = makeGroup(hall, stations.hatch.x, 0, stations.hatch.z);
  box(hatch, 1.38, 1.36, .78, 0, .68, 0, 'slate');
  box(hatch, 1.17, .75, .1, 0, .79, .41, 'trim');
  const hatchLeaf = box(hatch, .99, .53, .06, 0, .79, .473, 'divider');
  box(hatch, .12, .035, .045, 0, .82, .518, 'violet', false);
  sign(hatch, 'PARCEL HATCH', 0, 1.6, .15, .021, 'violet');
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

  box(lobby, 8.6, .3, 1.3, 0, .15, -4.95, 'trim');
  for (const x of [-3.12, 3.12]) {
    object(lobby, new THREE.CylinderGeometry(.66, .8, .18, 12), material.trim, x, .09, -2.13);
    const exhibit = object(lobby, new THREE.IcosahedronGeometry(.48, 1), material.teal, x, 1.1, -2.13);
    exhibit.rotation.z = .24;
    const cargo = clone(lobby, 'cargo', x, 0, 2.5);
    cargo.rotation.y = x < 0 ? .24 : -.35;
  }
  for (const x of [-6.82, 6.82]) clone(hall, 'cargo', x, 0, 3.34);

  function carriedKeys(parent) {
    const ring = makeGroup(parent, .41, -.36, -.85);
    ring.rotation.z = -.13;
    const assembly = object(ring, new THREE.TorusGeometry(.085, .009, 6, 22), material.trim, 0, .084, 0);
    assembly.rotation.y = -.21;
    const keyModels = KEYS.map((key, i) => {
      const model = clone(ring, key.id, -.081 + i * .081, -.035, i * -.016);
      model.scale.setScalar(.39);
      model.rotation.z = .22 - i * .18;
      return [key.id, model];
    });
    return (state, time, inspectingAddress) => {
      ring.visible = !inspectingAddress;
      for (const [id, model] of keyModels) {
        model.visible = state.keys.has(id);
        model.position.y = id === state.selected ? -.035 : -.075;
      }
      ring.rotation.z = -.13 + Math.sin(time * 3) * .022;
    };
  }

  function xrPrompt(parent) {
    const display = makeGroup(parent, 0, -.23, -1.08);
    display.visible = false;
    box(display, .85, .137, .02, 0, 0, 0, 'ink', false);
    let last = '';
    let firstLine;
    let secondLine;
    const outcomes = {
      arrival: 'VISITOR KEY RECEIVED', account: 'ACCOUNT KEY RECEIVED', lent: 'RELAY LENT FOR 30 SECONDS',
      delivered: 'PARCEL DELIVERED', expired: 'RELAY EXPIRED', spent: 'RELAY ALREADY USED',
      'wrong-door': 'KEY ISSUED FOR A DIFFERENT DOOR', 'wrong-key': 'THIS KEY HAS A DIFFERENT SCOPE',
      address: 'PUBLIC LOBBY ADDRESS'
    };
    return (active, target, state) => {
      display.visible = active;
      if (!active) return;
      const primary = target ? 'TRIGGER  ' + target.label : 'WALK UP TO A STATION';
      const selected = KEYS.find(key => key.id === state.selected);
      const secondary = selected.name + '  ' + (outcomes[state.outcome] || state.room);
      const next = primary + secondary;
      if (next === last) return;
      last = next;
      for (const line of [firstLine, secondLine]) {
        if (!line) continue;
        line.children[0].dispose();
        line.removeFromParent();
      }
      firstLine = lettering(primary, glow.white, .0045);
      firstLine.position.set(0, .026, .012);
      secondLine = lettering(secondary, glow[selected.color], .0032);
      secondLine.position.set(0, -.026, .012);
      display.add(firstLine, secondLine);
    };
  }

  function update(state, time) {
    hall.visible = state.room === 'hall';
    lobby.visible = state.room === 'lobby';
    member.visible = state.keys.has('account');
    accountKey.visible = !member.visible;
    accountKey.rotation.y = time * .9;
    mica.position.y = .15 + Math.sin(time * 2.4) * .035;
    hatchLeaf.position.y = state.parcel ? .98 : .79;
    parcel.visible = state.parcel;
    textures.get('field').texture.offset.y = (time * .10) % 1;
  }

  return {
    update, carriedKeys, xrPrompt,
    shapeBytes: [...assets.values()].reduce((sum, asset) => sum + asset.bytes, 0)
  };
}
