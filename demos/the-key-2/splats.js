// BSD-2-Clause. Skinned Gaussian splats on Dave Raggett's binary format, drawn by WebGL 2 inside the world.
// The maths follows his player (https://www.w3.org/2026/11/animation/): disk splats with
// Σ = σu²(I − nnᵀ) + σn²nnᵀ, linear blend skinning Σ' = L Σ Lᵀ, the projected covariance
// Σ2D = J W Σ' Wᵀ Jᵀ + 0.3 px², a quad of radius 3√λmax and back-to-front alpha blending.
// His WebGPU player computes skinning and the sort on the GPU; this route skins in the vertex
// shader and sorts on the processor, so the splats share the world's depth buffer, its two
// WebXR eyes and every browser with WebGL 2.
import * as THREE from 'three';

const WIDTH = 2048;
const REGION = { other: 0, top: 1, bottom: 2, head: 3, hands: 4, feet: 5 };

function region(name) {
  const bone = name.replace(/^.*_dancing_/, '');
  if (/head|neck|jaw|eye|mouth|brow/.test(bone)) return REGION.head;
  if (/hand|thumb|index|middle|ring|pinky|lowerarm/.test(bone)) return REGION.hands;
  if (/foot|ball/.test(bone)) return REGION.feet;
  if (/upperleg|lowerleg|hip/.test(bone)) return REGION.bottom;
  if (/spine|shoulder|upperarm|clavicle/.test(bone)) return REGION.top;
  return REGION.other;
}

/** Upload one figure's splats into textures shared by every person drawn from it. */
export function figureTextures(file) {
  const N = file.count;
  const rows = Math.ceil(N / WIDTH);
  const pos = new Float32Array(WIDTH * rows * 4);
  const attr = new Uint32Array(WIDTH * rows * 4);
  const regions = file.skeleton.bones.map(bone => region(bone.name));
  const dominant = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const bones = file.boneIndex[i];
    const weights = file.boneWeight[i];
    let best = 0;
    for (let k = 1; k < 4; k++) if (((weights >>> (8 * k)) & 255) > ((weights >>> (8 * best)) & 255)) best = k;
    const bone = (bones >>> (8 * best)) & 255;
    dominant[i] = bone;
    pos.set([file.position[i * 3], file.position[i * 3 + 1], file.position[i * 3 + 2], regions[bone]], i * 4);
    attr.set([file.normal[i], file.color[i], bones, weights], i * 4);
  }
  const posTex = new THREE.DataTexture(pos, WIDTH, rows, THREE.RGBAFormat, THREE.FloatType);
  posTex.needsUpdate = true;
  const attrTex = new THREE.DataTexture(attr, WIDTH, rows, THREE.RGBAIntegerFormat, THREE.UnsignedIntType);
  attrTex.internalFormat = 'RGBA32UI';
  attrTex.needsUpdate = true;
  // A fixed shuffle, so a smaller level of detail is a prefix of a larger one (and repeats).
  const order = new Uint32Array(N);
  for (let i = 0; i < N; i++) order[i] = i;
  let seed = 0x9e3779b9;
  for (let i = N - 1; i > 0; i--) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const j = (seed >>> 0) % (i + 1);
    const t = order[i]; order[i] = order[j]; order[j] = t;
  }
  return { file, posTex, attrTex, dominant, order, count: N };
}

const vertexShader = /* glsl */`
precision highp float;
precision highp int;
precision highp usampler2D;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D posTex;
uniform usampler2D attrTex;
uniform sampler2D skinTex;
uniform float sigmaU;
uniform float sigmaN;
uniform float sigmaScale;
uniform float figureScale;
uniform vec2 viewport;
uniform vec3 tintTop;
uniform vec3 tintBottom;
uniform float tintAmount;
uniform int style;
uniform sampler2D skinPattern;
uniform float light;
in vec3 position;
in float splatIndex;
out vec4 vColor;
out vec2 vOffset;

mat4 skin(uint b) {
  int x = int(b) * 4;
  return mat4(texelFetch(skinTex, ivec2(x, 0), 0), texelFetch(skinTex, ivec2(x + 1, 0), 0),
              texelFetch(skinTex, ivec2(x + 2, 0), 0), texelFetch(skinTex, ivec2(x + 3, 0), 0));
}
vec3 octNormal(uint p) {
  vec2 e = vec2(float(int(p << 16) >> 16), float(int(p) >> 16)) / 32767.0;
  e = max(e, vec2(-1.0));
  vec3 n = vec3(e, 1.0 - abs(e.x) - abs(e.y));
  if (n.z < 0.0) n.xy = (1.0 - abs(n.yx)) * vec2(n.x >= 0.0 ? 1.0 : -1.0, n.y >= 0.0 ? 1.0 : -1.0);
  return normalize(n);
}
vec3 srgbToLinear(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }
vec3 linearToSrgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

void main() {
  int i = int(splatIndex + 0.5);
  ivec2 t = ivec2(i % ${WIDTH}, i / ${WIDTH});
  vec4 p = texelFetch(posTex, t, 0);
  uvec4 a = texelFetch(attrTex, t, 0);
  uvec4 b = (uvec4(a.z) >> uvec4(0u, 8u, 16u, 24u)) & 255u;
  vec4 w = vec4((uvec4(a.w) >> uvec4(0u, 8u, 16u, 24u)) & 255u) / 255.0;
  mat4 A = w.x * skin(b.x) + w.y * skin(b.y) + w.z * skin(b.z) + w.w * skin(b.w);
  mat4 MA = modelMatrix * A;
  vec3 center = (MA * vec4(p.xyz, 1.0)).xyz;
  mat3 L = mat3(MA);
  vec3 n = octNormal(a.x);
  vec3 ln = L * n;
  float su = sigmaU * sigmaScale;
  float sn = sigmaN * sigmaScale;
  mat3 cov = su * su * (L * transpose(L)) + (sn * sn - su * su) * outerProduct(ln, ln);

  vec4 view = viewMatrix * vec4(center, 1.0);
  mat3 W = mat3(viewMatrix);
  float z = view.z;
  float fx = projectionMatrix[0][0] * viewport.x * 0.5;
  float fy = projectionMatrix[1][1] * viewport.y * 0.5;
  mat3 J = mat3(fx / -z, 0.0, 0.0,  0.0, fy / -z, 0.0,  fx * view.x / (z * z), fy * view.y / (z * z), 0.0);
  mat3 c = J * W * cov * transpose(W) * transpose(J);
  float c00 = c[0][0] + 0.3, c01 = c[0][1], c11 = c[1][1] + 0.3;
  float mid = 0.5 * (c00 + c11);
  float rad = length(vec2(0.5 * (c00 - c11), c01));
  float l1 = mid + rad, l2 = max(mid - rad, 0.1);
  vec2 v1 = abs(c01) > 1e-6 ? normalize(vec2(c01, l1 - c00)) : (c00 >= c11 ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  vec2 v2 = vec2(-v1.y, v1.x);
  vec2 offset = position.x * 3.0 * sqrt(l1) * v1 + position.y * 3.0 * sqrt(l2) * v2;
  vec4 clip = projectionMatrix * view;
  clip.xy += offset / (0.5 * viewport) * clip.w;
  gl_Position = (z < -0.02) ? clip : vec4(0.0, 0.0, 2.0, 1.0);
  vOffset = position.xy * 3.0;

  uint rgba = a.y;
  vec3 color = vec3(float(rgba & 255u), float((rgba >> 8u) & 255u), float((rgba >> 16u) & 255u)) / 255.0;
  float opacity = float((rgba >> 24u) & 255u) / 255.0;
  vec3 lin = srgbToLinear(color);
  int part = int(p.w + 0.5);
  if (style == 1) {
    // Mica: the procedural metal skin, mapped in three planes from the figure's own bind space.
    vec3 q = p.xyz * figureScale * 3.2;
    vec3 bw = abs(normalize(n)) + 0.001;
    bw /= bw.x + bw.y + bw.z;
    // The texture is sRGB, so sampling already returns linear values. The procedure's plates and seams give the
    // variation; the figure's own shading (its luminance) keeps the face and folds readable.
    vec3 metal = texture(skinPattern, q.yz).rgb * bw.x + texture(skinPattern, q.xz).rgb * bw.y + texture(skinPattern, q.xy).rgb * bw.z;
    float plate = clamp(dot(metal, vec3(0.2126, 0.7152, 0.0722)) * 9.0, 0.0, 1.4);
    float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
    lin = vec3(0.42, 0.50, 0.62) * (0.35 + 0.75 * plate) * (0.65 + 0.9 * lum);
    if (part == 3 && p.y * figureScale > 0.0) lin = mix(lin, vec3(0.25, 0.9, 1.0), 0.35);
  } else if (tintAmount > 0.0 && (part == 1 || part == 2 || part == 5)) {
    vec3 tint = part == 1 ? tintTop : tintBottom;
    float lum = dot(lin, vec3(0.2126, 0.7152, 0.0722));
    lin = mix(lin, srgbToLinear(tint) * (0.35 + 1.6 * lum), tintAmount);
  }
  vec3 wn = normalize(ln);
  float shade = 0.72 + 0.28 * abs(wn.y) + 0.18 * max(dot(wn, normalize(vec3(0.4, 0.8, 0.5))), 0.0);
  vColor = vec4(linearToSrgb(clamp(lin * shade * light, 0.0, 1.0)), opacity);
}`;

const fragmentShader = /* glsl */`
precision highp float;
in vec4 vColor;
in vec2 vOffset;
out vec4 fragColor;
uniform float alphaScale;
void main() {
  float r2 = dot(vOffset, vOffset);
  if (r2 > 9.0) discard;
  float alpha = min(0.99, vColor.a * alphaScale * exp(-0.5 * r2));
  if (alpha < 1.0 / 255.0) discard;
  fragColor = vec4(vColor.rgb, alpha);
}`;

/**
 * One drawn person: a skin texture, a sorted index buffer and a mesh in the scene.
 * levels: splat counts by distance, each a prefix of the figure's fixed shuffle.
 */
export function createSplatPerson(figure, { style = 0, tintTop, tintBottom, tintAmount = 0, pattern = null, light = 0.86 } = {}) {
  const B = figure.file.skeleton.bones.length;
  const skin = new Float32Array(B * 16);
  const skinTex = new THREE.DataTexture(skin, B * 4, 1, THREE.RGBAFormat, THREE.FloatType);
  skinTex.needsUpdate = true;
  const geometry = new THREE.InstancedBufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  const indices = new Float32Array(figure.count);
  const indexAttribute = new THREE.InstancedBufferAttribute(indices, 1);
  indexAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('splatIndex', indexAttribute);
  geometry.instanceCount = 0;
  const modelMat = figure.file.modelMat;
  const figureScale = Math.hypot(modelMat[0], modelMat[1], modelMat[2]);
  const material = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: true,
    uniforms: {
      posTex: { value: figure.posTex }, attrTex: { value: figure.attrTex }, skinTex: { value: skinTex },
      sigmaU: { value: figure.file.sigmaU }, sigmaN: { value: figure.file.sigmaN }, sigmaScale: { value: 1 },
      figureScale: { value: figureScale }, viewport: { value: new THREE.Vector2(1, 1) },
      tintTop: { value: new THREE.Color(tintTop || '#888888') }, tintBottom: { value: new THREE.Color(tintBottom || '#444444') },
      tintAmount: { value: tintAmount }, style: { value: style }, skinPattern: { value: pattern }, light: { value: light },
      alphaScale: { value: 1 }
    }
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.name = 'splat-person';
  const viewportSize = new THREE.Vector4();
  mesh.onBeforeRender = renderer => {
    renderer.getCurrentViewport(viewportSize);
    material.uniforms.viewport.value.set(viewportSize.z, viewportSize.w);
    material.uniformsNeedUpdate = true;
  };

  const depth = new Float32Array(figure.count);
  const keys = new Uint16Array(figure.count);
  const counts = new Uint32Array(65536);
  const centre = new THREE.Vector3();
  const world = new THREE.Matrix4();
  /**
   * Upload this frame's skin matrices and sort the chosen level of detail back to front
   * from the eye position (one sort serves both eyes of a pair).
   */
  function update(skinMatrices, eye, level) {
    skin.set(skinMatrices);
    skinTex.needsUpdate = true;
    const count = Math.min(level, figure.count);
    material.uniforms.sigmaScale.value = Math.sqrt(figure.count / count);
    mesh.updateMatrixWorld();
    world.copy(mesh.matrixWorld);
    const e = world.elements;
    const P = figure.file.position;
    let min = Infinity;
    let max = -Infinity;
    for (let n = 0; n < count; n++) {
      const i = figure.order[n];
      const o = figure.dominant[i] * 16;
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      const fx = skin[o] * x + skin[o + 4] * y + skin[o + 8] * z + skin[o + 12];
      const fy = skin[o + 1] * x + skin[o + 5] * y + skin[o + 9] * z + skin[o + 13];
      const fz = skin[o + 2] * x + skin[o + 6] * y + skin[o + 10] * z + skin[o + 14];
      const wx = e[0] * fx + e[4] * fy + e[8] * fz + e[12] - eye.x;
      const wy = e[1] * fx + e[5] * fy + e[9] * fz + e[13] - eye.y;
      const wz = e[2] * fx + e[6] * fy + e[10] * fz + e[14] - eye.z;
      const d = wx * wx + wy * wy + wz * wz;
      depth[n] = d;
      if (d < min) min = d;
      if (d > max) max = d;
    }
    const span = 65535 / Math.max(max - min, 1e-9);
    counts.fill(0);
    for (let n = 0; n < count; n++) {
      const k = 65535 - Math.floor((depth[n] - min) * span);
      keys[n] = k;
      counts[k]++;
    }
    for (let k = 1; k < 65536; k++) counts[k] += counts[k - 1];
    for (let n = count - 1; n >= 0; n--) indices[--counts[keys[n]]] = figure.order[n];
    indexAttribute.needsUpdate = true;
    indexAttribute.clearUpdateRanges();
    indexAttribute.addUpdateRange(0, count);
    geometry.instanceCount = count;
    centre.setFromMatrixPosition(world);
    return centre;
  }
  return { mesh, material, update, skin };
}
