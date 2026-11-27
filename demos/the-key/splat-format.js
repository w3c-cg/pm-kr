// SPDX-License-Identifier: BSD-2-Clause
// Reader for Dave Raggett's little-endian SPLT and ANIM v1 formats.
import { Matrix4, Quaternion, Vector3 } from 'three';

class Binary {
  constructor(buffer, kind) {
    this.view = new DataView(buffer);
    this.offset = 4;
    if (new TextDecoder().decode(new Uint8Array(buffer, 0, 4)) !== kind || this.value('Uint32') !== 1) {
      throw new Error(`Expected a ${kind} version 1 file.`);
    }
  }

  value(type) {
    const n = Number(type.match(/\d+/)[0]) / 8;
    const value = this.view['get' + type](this.offset, true);
    this.offset += n;
    return value;
  }

  array(Type, size) {
    const offset = this.offset;
    this.offset += size * Type.BYTES_PER_ELEMENT;
    return new Type(this.view.buffer, offset, size);
  }

  align() {
    this.offset = Math.ceil(this.offset / 4) * 4;
  }

  names(size) {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const names = Array.from({ length: size }, () => decoder.decode(this.array(Uint8Array, this.value('Uint16'))));
    this.align();
    return names;
  }

  finish() {
    if (this.offset !== this.view.byteLength) throw new Error('Unexpected bytes after the last record.');
  }
}

export function decodeSplatFile(buffer) {
  const reader = new Binary(buffer, 'SPLT');
  const count = reader.value('Uint32');
  const length = reader.value('Uint32');
  if (!count || !length || length > 256) throw new Error('Invalid splat or bone count.');
  const sigmaU = reader.value('Float32');
  const sigmaN = reader.value('Float32');
  const modelMat = reader.array(Float32Array, 16);
  const bones = Array.from({ length }, () => ({
    parent: reader.value('Int32'),
    restPos: reader.array(Float32Array, 3),
    restQuat: reader.array(Float32Array, 4),
    restScale: reader.array(Float32Array, 3),
    boneInverse: new Matrix4().fromArray(reader.array(Float32Array, 16)),
    rootParentWorld: new Matrix4().fromArray(reader.array(Float32Array, 16))
  }));
  reader.names(length).forEach((name, i) => { bones[i].name = name; });
  const data = {
    count, sigmaU, sigmaN, modelMat, skeleton: { bones },
    position: reader.array(Float32Array, count * 3),
    normal: reader.array(Uint32Array, count),
    color: reader.array(Uint32Array, count),
    boneIndex: reader.array(Uint32Array, count),
    boneWeight: reader.array(Uint32Array, count)
  };
  reader.finish();
  return data;
}

export function decodeAnimFile(buffer) {
  const reader = new Binary(buffer, 'ANIM');
  const length = reader.value('Uint32');
  const frames = reader.value('Uint32');
  const duration = reader.value('Float32');
  if (frames < 2 || !(duration > 0) || !length || length > 256) throw new Error('Invalid animation header.');
  const tracks = [
    { key: 'quat', size: 4, Type: Int16Array, count: reader.value('Uint32') },
    { key: 'pos', size: 3, Type: Float32Array, count: reader.value('Uint32') },
    { key: 'scale', size: 3, Type: Float32Array, count: reader.value('Uint32') }
  ];
  const names = reader.names(length);
  for (const track of tracks) {
    track.names = Array.from(reader.array(Uint16Array, track.count), id => names[id]);
  }
  reader.align();
  for (const track of tracks) track.data = reader.array(track.Type, track.count * track.size * frames);
  reader.finish();
  return { frames, duration, tracks };
}

export function createPose(skeleton) {
  const count = skeleton.bones.length;
  const pose = { quat: new Float32Array(count * 4), pos: new Float32Array(count * 3), scale: new Float32Array(count * 3) };
  resetPose(skeleton, pose);
  return pose;
}

export function resetPose(skeleton, pose) {
  skeleton.bones.forEach((bone, id) => {
    pose.quat.set(bone.restQuat, id * 4);
    pose.pos.set(bone.restPos, id * 3);
    pose.scale.set(bone.restScale, id * 3);
  });
}

export function bindClip(clip, skeleton) {
  const indices = new Map(skeleton.bones.map((bone, id) => [bone.name, id]));
  return clip.tracks.map(track => track.names.map(name => indices.get(name) ?? -1));
}

const a = new Quaternion();
const b = new Quaternion();

export function sampleClip(clip, bindings, time, pose) {
  const current = (time % clip.duration) / clip.duration * (clip.frames - 1);
  const frame = Math.min(clip.frames - 2, Math.floor(current));
  const mix = current - frame;
  clip.tracks.forEach(({ key, size, count, data }, index) => {
    const dest = pose[key];
    bindings[index].forEach((bone, channel) => {
      if (bone < 0) return;
      const start = (count * frame + channel) * size;
      const end = start + count * size;
      if (key === 'quat') {
        a.fromArray(data, start).normalize();
        b.fromArray(data, end).normalize();
        a.slerp(b, mix).toArray(dest, bone * size);
      } else {
        for (let i = 0; i < size; i++) dest[bone * size + i] = data[start + i] + (data[end + i] - data[start + i]) * mix;
      }
    });
  });
}

export function mixPose(dest, next, amount) {
  for (const key of ['pos', 'scale']) {
    for (let i = 0; i < dest[key].length; i++) dest[key][i] += (next[key][i] - dest[key][i]) * amount;
  }
  for (let i = 0; i < dest.quat.length; i += 4) {
    a.fromArray(dest.quat, i).slerp(b.fromArray(next.quat, i), amount).toArray(dest.quat, i);
  }
}

export function createSkinScratch(count) {
  return {
    world: new Float32Array(count * 16), transforms: Array.from({ length: count }, () => new Matrix4()),
    completed: new Uint8Array(count), display: new Matrix4(), skin: new Matrix4(),
    position: new Vector3(), scale: new Vector3(), rotation: new Quaternion()
  };
}

export function computeSkinMatrices(file, pose, out, scratch) {
  const bones = file.skeleton.bones;
  scratch.completed.fill(0);
  scratch.display.fromArray(file.modelMat);
  function transform(id) {
    if (scratch.completed[id]) return scratch.transforms[id];
    const bone = bones[id];
    const parent = bone.parent < 0 ? bone.rootParentWorld : transform(bone.parent);
    const matrix = scratch.transforms[id].compose(
      scratch.position.fromArray(pose.pos, id * 3),
      scratch.rotation.fromArray(pose.quat, id * 4),
      scratch.scale.fromArray(pose.scale, id * 3)
    ).premultiply(parent);
    matrix.toArray(scratch.world, id * 16);
    scratch.skin.multiplyMatrices(scratch.display, matrix).multiply(bone.boneInverse).toArray(out, id * 16);
    scratch.completed[id] = 1;
    return matrix;
  }
  bones.forEach((_, id) => transform(id));
}
