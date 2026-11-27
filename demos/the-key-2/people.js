// BSD-2-Clause. People in the hall: Gaussian splat figures on Dave Raggett's format, animated with
// 100STYLE motion and deterministic programmed behaviour.
import * as THREE from 'three';
import {
  decodeSplatFile, decodeAnimFile, createPose, resetPose, bindClip, sampleClip, mixPose,
  computeSkinMatrices, createSkinScratch
} from './splat-format.js';
import { figureTextures, createSplatPerson } from './splats.js';

import { createCrowd, STEP, wrap } from './crowd.js';
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
function qrot(q, v) {
  const [x, y, z, w] = q;
  const tx = 2 * (y * v[2] - z * v[1]), ty = 2 * (z * v[0] - x * v[2]), tz = 2 * (x * v[1] - y * v[0]);
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx];
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = v => { const l = Math.hypot(...v) || 1; return v.map(x => x / l); };
async function fetchBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url.pathname || url}: HTTP ${response.status}`);
  return response.arrayBuffer();
}

/** The figure and its clips, with what the behaviour needs to hold a clip in place and turn it. */
async function loadFigure(base, manifest) {
  const file = decodeSplatFile(await fetchBuffer(new URL(manifest.figure, base)));
  const skeleton = file.skeleton;
  const root = Math.max(0, skeleton.bones.findIndex(bone => bone.parent < 0));
  const M = file.modelMat;
  const up = norm([M[1], M[5], M[9]]);
  const rest = skeleton.bones[root].restQuat;
  const axis = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    .map(a => [a, Math.abs(dot(norm(qrot(rest, a)), up))]).sort((p, q) => p[1] - q[1])[0][0];
  const e1 = norm(cross(up, Math.abs(up[0]) < .9 ? [1, 0, 0] : [0, 0, 1]));
  const e2 = cross(up, e1);
  const heading = q => { const v = qrot(q, axis); return Math.atan2(dot(v, e2), dot(v, e1)); };
  const restHeading = heading(rest);
  const restPos = skeleton.bones[root].restPos;
  const clips = Object.fromEntries(await Promise.all(Object.entries(manifest.clips).map(async ([name, path]) => {
    const clip = decodeAnimFile(await fetchBuffer(new URL(path, base)));
    return [name, { clip, map: bindClip(clip, skeleton), name }];
  })));
  const figure = { file, root, up, heading, restHeading, restPos, clips, textures: figureTextures(file) };
  // Natural walking speed of each clip, from the hips' horizontal travel in the display frame.
  const pose = createPose(skeleton);
  const scratch = createSkinScratch(skeleton.bones.length);
  const skin = new Float32Array(skeleton.bones.length * 16);
  for (const entry of Object.values(clips)) {
    const { clip, map } = entry;
    let length = 0;
    let last = null;
    const samples = Math.min(1200, Math.ceil(clip.duration * 10));
    for (let s = 0; s <= samples; s++) {
      resetPose(skeleton, pose);
      sampleClip(clip, map, s / samples * clip.duration * .999, pose);
      computeSkinMatrices(file, pose, skin, scratch);
      const w = scratch.world, o = root * 16;
      const x = M[0] * w[o + 12] + M[4] * w[o + 13] + M[8] * w[o + 14];
      const z = M[2] * w[o + 12] + M[6] * w[o + 13] + M[10] * w[o + 14];
      if (last) length += Math.hypot(x - last[0], z - last[1]);
      last = [x, z];
    }
    entry.speed = length / clip.duration;
  }
  return figure;
}

/** Pose a figure from a clip held in place, its heading turned back to the rest heading. */
function poseFromClip(figure, pose, entry, time) {
  const { file, root, up, heading, restHeading, restPos } = figure;
  resetPose(file.skeleton, pose);
  sampleClip(entry.clip, entry.map, time, pose);
  const o = root * 4;
  const q = Array.from(pose.quat.subarray(o, o + 4));
  const turn = restHeading - heading(q);
  const s = Math.sin(turn / 2);
  const adjust = [up[0] * s, up[1] * s, up[2] * s, Math.cos(turn / 2)];
  pose.quat.set(qmul(adjust, q), o);
  const b = root * 3;
  const p = [pose.pos[b], pose.pos[b + 1], pose.pos[b + 2]];
  const height = dot(p, up) - dot(restPos, up);
  pose.pos.set([restPos[0] + up[0] * height, restPos[1] + up[1] * height, restPos[2] + up[2] * height], b);
}

const LEGACY_STYLES = [
  { walk: 'Neutral_FW', idle: 'Neutral_ID', top: '#2d6f9e', bottom: '#2b2f3a', scale: 1.0 },
  { walk: 'Proud_FW', idle: 'Akimbo_ID', top: '#b24a3b', bottom: '#3c3a33', scale: .96 },
  { walk: 'OnPhoneLeft_FW', idle: 'Neutral_ID', top: '#d9b44a', bottom: '#2f3d52', scale: 1.03 },
  { walk: 'HandsInPockets_FW', idle: 'HandsInPockets_ID', top: '#3c8a5e', bottom: '#5a4a3a', scale: .98 },
  { walk: 'Elated_FW', idle: 'Proud_ID', top: '#7a4fa0', bottom: '#30343c', scale: 1.01 },
  { walk: 'Neutral_FW', idle: 'Akimbo_ID', top: '#c9c9c4', bottom: '#2a3548', scale: .94 }
];

/**
 * The people of the hall. Loads the figure from people/index.json; if the figure file is not
 * present it says so and the hall plays without people (the reason is shown, never hidden).
 */
export async function createPeople(scene, hall, { seed = 949, count = 6, layout, pattern = null, say }) {
  const base = new URL('people/', import.meta.url);
  let manifest;
  try {
    const response = await fetch(new URL('index.json', base));
    if (!response.ok) throw new Error(`people/index.json returned HTTP ${response.status}`);
    manifest = await response.json();
  } catch (error) {
    say('No people: ' + error.message);
    return null;
  }
  let figures, micaFigure;
  try {
    if (manifest.figures) {
      if (manifest.figures.length !== 6 || !manifest.mica ||
          new Set([...manifest.figures, manifest.mica].map(entry => entry.figure)).size !== 7) {
        throw new Error('Expected six different people and a separate model for Mica.');
      }
      [micaFigure, ...figures] = await Promise.all([manifest.mica, ...manifest.figures].map(async entry => ({
        ...await loadFigure(base, entry), id: entry.id, height: entry.height
      })));
    } else {
      // The licensed local review fixture uses a single figure with nine motions.
      micaFigure = await loadFigure(base, manifest);
    }
  } catch (error) {
    say(`The people could not be loaded: ${error.message}. ${manifest.obtain || ''}`);
    return null;
  }
  function poseState(figure) {
    const skeleton = figure.file.skeleton;
    const count = skeleton.bones.length;
    return { figure, pose: createPose(skeleton), skin: new Float32Array(count * 16), scratch: createSkinScratch(count) };
  }
  const crowd = createCrowd(seed, count, layout);
  const drawn = crowd.agents.map((agent, index) => {
    const figure = figures ? figures[index % figures.length] : micaFigure;
    const style = LEGACY_STYLES[index % LEGACY_STYLES.length];
    const person = createSplatPerson(figure.textures, { tintTop: style.top, tintBottom: style.bottom, tintAmount: figures ? 0 : .78 });
    if (!figures) person.mesh.scale.setScalar(style.scale);
    person.mesh.name = figure.id || 'hall-person';
    hall.add(person.mesh);
    return {
      ...poseState(figure), agent, person, walk: figure.clips.walk || figure.clips[style.walk],
      idle: figure.clips.idle || figure.clips[style.idle], other: createPose(figure.file.skeleton)
    };
  });
  const mica = {
    ...poseState(micaFigure), person: createSplatPerson(micaFigure.textures, { style: 1, pattern, light: 1 }),
    clip: micaFigure.clips.idle || micaFigure.clips.Proud_ID, yaw: 0, home: [-3.2, -4.68], time: 0
  };
  mica.person.mesh.name = 'mica-splats';
  mica.person.mesh.position.set(mica.home[0], .02, mica.home[1]);
  if (!figures) mica.person.mesh.scale.setScalar(1.02);
  hall.add(mica.person.mesh);

  const eye = new THREE.Vector3();
  let accumulated = 0;
  let frozen = false;
  function simulate(seconds, person, serviceStops) {
    accumulated += seconds;
    while (accumulated >= STEP) {
      accumulated -= STEP;
      crowd.step(person, serviceStops);
      for (const entry of drawn) {
        const a = entry.agent;
        a.walkTime += STEP * (a.speed / Math.max(entry.walk.speed, .3));
        a.idleTime += STEP;
      }
      mica.time += STEP;
      if (person) {
        const d = Math.hypot(person.x - mica.home[0], person.z - mica.home[1]);
        const face = d < 3.2 ? Math.atan2(person.x - mica.home[0], person.z - mica.home[1]) : 0;
        mica.yaw += wrap(face - mica.yaw) * Math.min(1, STEP * 3);
      }
    }
  }
  function draw(camera, renderer, visible) {
    for (const entry of drawn) entry.person.mesh.visible = visible;
    mica.person.mesh.visible = visible;
    if (!visible) return;
    const view = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
    view.getWorldPosition(eye);
    for (const entry of drawn) {
      const a = entry.agent;
      const { figure } = entry;
      poseFromClip(figure, entry.pose, entry.idle, a.idleTime);
      if (a.walkWeight > .01) {
        poseFromClip(figure, entry.other, entry.walk, a.walkTime);
        mixPose(entry.pose, entry.other, a.walkWeight);
      }
      computeSkinMatrices(figure.file, entry.pose, entry.skin, entry.scratch);
      entry.person.mesh.position.set(a.x, 0, a.z);
      entry.person.mesh.rotation.y = a.yaw;
      const distance = eye.distanceTo(entry.person.mesh.getWorldPosition(new THREE.Vector3()));
      entry.person.update(entry.skin, eye, distance < 4 ? 60000 : distance < 8 ? 30000 : 15000);
    }
    poseFromClip(mica.figure, mica.pose, mica.clip, mica.time);
    computeSkinMatrices(mica.figure.file, mica.pose, mica.skin, mica.scratch);
    mica.person.mesh.rotation.y = mica.yaw;
    mica.person.update(mica.skin, eye, 60000);
  }
  return {
    crowd, figure: figures?.[0] || micaFigure, figures, manifest, mica,
    meshes: [...drawn.map(entry => entry.person.mesh), mica.person.mesh],
    update(seconds, person, camera, renderer, visible, serviceStops) {
      if (!frozen) simulate(seconds, person, serviceStops);
      draw(camera, renderer, visible);
    },
    fastForward(seconds, person, serviceStops) { simulate(seconds, person, serviceStops); },
    freeze(value = true) { frozen = value; },
    openDoor: crowd.openDoor,
    snapshot: () => ({
      time: crowd.time,
      agents: crowd.agents.map(a => ({ id: a.id, x: +a.x.toFixed(3), z: +a.z.toFixed(3), yaw: +a.yaw.toFixed(3), state: a.state, slot: a.queueSlot })),
      queue: crowd.queue.map(a => a.id), events: crowd.events.slice(-40)
    })
  };
}
