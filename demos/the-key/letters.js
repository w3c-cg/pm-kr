// BSD-2-Clause. Raised panel lettering, made from geometry.
import { Group, InstancedMesh, Object3D, PlaneGeometry } from 'three';

const glyphs = {
  A: '0e11111f111111', B: '1e11111e11111e', C: '0f10101010100f', D: '1e11111111111e',
  E: '1f10101e10101f', F: '1f10101e101010', G: '0f10101311110f', H: '1111111f111111',
  I: '1f04040404041f', J: '0101010111110e', K: '11121418141211', L: '1010101010101f',
  M: '111b1515111111', N: '11191513111111', O: '0e11111111110e', P: '1e11111e101010',
  Q: '0e11111115120d', R: '1e11111e141211', S: '0f10100e01011e', T: '1f040404040404',
  U: '1111111111110e', V: '11111111110a04', W: '11111115151b11', X: '11110a040a1111',
  Y: '11110a04040404', Z: '1f01020408101f', ' ': '00000000000000',
  "/": '01020404081010', "-": '0000001f000000', ":": '00040000040000', ",": '000000000c0408', '?': '0e110102040004',
  '0': '0e11131519110e', '1': '040c040404040e', '2': '0e11010204081f', '3': '1e01010601011e',
  '4': '02060a121f0202', '5': '1f10101e01011e', '6': '0e10101e11110e', '7': '1f010204080808',
  '8': '0e11110e11110e', '9': '0e11110f01010e', '.': '00000000000c0c', "'": '04040800000000'
};
const dot = new PlaneGeometry(.89, .89);

export function lettering(text, material, size) {
  const group = new Group();
  const positions = [];
  for (const [index, character] of [...text.toUpperCase().replace(/[‘’]/g, "'")].entries()) {
    const glyph = glyphs[character] || glyphs[' '];
    for (let y = 0; y < 7; y++) {
      const row = parseInt(glyph.slice(y * 2, y * 2 + 2), 16);
      for (let x = 0; x < 5; x++) {
        if (row & (16 >> x)) positions.push([(index - (text.length - 1) / 2) * 6 + x - 2, 3 - y]);
      }
    }
  }
  const mesh = new InstancedMesh(dot, material, positions.length);
  const instance = new Object3D();
  positions.forEach(([x, y], i) => {
    instance.position.set(x, y, 0);
    instance.updateMatrix();
    mesh.setMatrixAt(i, instance.matrix);
  });
  group.add(mesh);
  group.scale.setScalar(size);
  return group;
}
