// The scene tester's renderer (ORDER 508, milestone 3): WebGL 2, the glTF 2.0 the courtyard uses (nodes with
// translation, rotation, scale or matrix; one primitive per mesh with POSITION, NORMAL, TEXCOORD_0 and indices; a
// baseColorTexture per material; a perspective camera; one directional light of KHR_lights_punctual). Each texture
// holds the procedure's drawing and, once it has arrived, the picture; the material blends the one into the other and
// then samples the picture alone. In a WebXR session each eye is drawn with the view the session gives (its own
// projection and pose: parallel axes as the session sets them, never turned in by this page). Our code, BSD 2-clause.

const M = {
  ident() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
    return o;
  },
  trs(t = [0, 0, 0], q = [0, 0, 0, 1], s = [1, 1, 1]) {
    const [x, y, z, w] = q;
    const m = new Float32Array(16);
    m[0] = (1 - 2 * (y * y + z * z)) * s[0]; m[1] = 2 * (x * y + z * w) * s[0]; m[2] = 2 * (x * z - y * w) * s[0];
    m[4] = 2 * (x * y - z * w) * s[1]; m[5] = (1 - 2 * (x * x + z * z)) * s[1]; m[6] = 2 * (y * z + x * w) * s[1];
    m[8] = 2 * (x * z + y * w) * s[2]; m[9] = 2 * (y * z - x * w) * s[2]; m[10] = (1 - 2 * (x * x + y * y)) * s[2];
    m[12] = t[0]; m[13] = t[1]; m[14] = t[2]; m[15] = 1;
    return m;
  },
  invertRigid(m) {   // rotation and translation only (the camera's world matrix)
    const o = new Float32Array(16);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[c * 4 + r] = m[r * 4 + c];
    for (let r = 0; r < 3; r++) o[12 + r] = -(o[r] * m[12] + o[4 + r] * m[13] + o[8 + r] * m[14]);
    o[15] = 1;
    return o;
  },
  perspective(yfov, aspect, near, far) {
    const f = 1 / Math.tan(yfov / 2), m = new Float32Array(16);
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) / (near - far); m[11] = -1; m[14] = 2 * far * near / (near - far);
    return m;
  },
};

const VS = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; layout(location=2) in vec2 aT;
uniform mat4 uModel, uView, uProj;
out vec3 vN; out vec2 vT;
void main() { vN = mat3(uModel) * aN; vT = aT; gl_Position = uProj * uView * uModel * vec4(aP, 1.0); }`;

// uMode: 0 the procedure, 1 cross-fade, 2 coarse first then detail, 3 the picture, 4 nothing drawn yet (grey)
const FS = `#version 300 es
precision highp float;
in vec3 vN; in vec2 vT;
uniform sampler2D uProc, uPic;
uniform int uMode; uniform float uT, uCoarse;
uniform vec3 uLight, uLightColor; uniform float uAmbient;
out vec4 o;
vec3 colour() {
  if (uMode == 4) return vec3(0.5);
  if (uMode == 3) return texture(uPic, vT).rgb;
  vec3 P = texture(uProc, vT).rgb;
  if (uMode == 0) return P;
  vec3 I = texture(uPic, vT).rgb;
  if (uMode == 1) return mix(P, I, uT);
  // coarse first: the picture's coarse levels (uCoarse mip levels above the screen's) replace the procedure's, then
  // the picture's detail replaces the procedure's detail, the mixed detail kept at its contrast (two unrelated detail
  // fields mixed half and half keep 0.71 of it: divided by the square root of the weights' squares, as Heitz and
  // Neyret's variance-preserving blend does); at uT = 0 this is the procedure, at uT = 1 the picture, exactly
  vec3 Pl = texture(uProc, vT, uCoarse).rgb, Il = texture(uPic, vT, uCoarse).rgb;
  float a = smoothstep(0.0, 0.6, uT), b = smoothstep(0.25, 1.0, uT);
  float k = inversesqrt((1.0 - b) * (1.0 - b) + b * b);
  return mix(Pl, Il, a) + ((P - Pl) * (1.0 - b) + (I - Il) * b) * k;
}
void main() {
  vec3 n = normalize(vN);
  float d = max(dot(n, -uLight), 0.0);
  o = vec4(colour() * (uAmbient + d * uLightColor * 0.8), 1.0);
}`;

export class GlScene {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true, xrCompatible: true });
    if (!gl) throw new Error('no WebGL 2');
    this.gl = gl;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    this.prog = p;
    this.u = {};
    for (const n of ['uModel', 'uView', 'uProj', 'uProc', 'uPic', 'uMode', 'uT', 'uCoarse', 'uLight', 'uLightColor', 'uAmbient']) this.u[n] = gl.getUniformLocation(p, n);
    this.textures = [];       // per glTF texture: { eyes: [ {proc, procSide, pic}, {..} ], mode, t }
    this.coarse = 4.0;
    this.light = [0.4, -0.8, -0.45];
    this.lightColor = [1, 1, 1];
    this.blank = this.makeTex(1, new Uint8Array([128, 128, 128]));
  }

  makeTex(side, rgb) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, side, side, 0, gl.RGB, gl.UNSIGNED_BYTE, rgb);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return t;
  }

  // the parsed glTF and its buffers (Map uri -> ArrayBuffer)
  load(gltf, buffers) {
    const gl = this.gl;
    this.gltf = gltf;
    const bufOf = (bi) => buffers.get(gltf.buffers[bi].uri);
    this.meshes = gltf.meshes.map((m) => {
      const pr = m.primitives[0];
      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const attr = (acc, loc, n) => {
        const a = gltf.accessors[acc], bv = gltf.bufferViews[a.bufferView];
        const b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(bufOf(bv.buffer), (bv.byteOffset || 0) + (a.byteOffset || 0), bv.byteLength), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, n, gl.FLOAT, false, bv.byteStride || 0, 0);
      };
      attr(pr.attributes.POSITION, 0, 3);
      attr(pr.attributes.NORMAL, 1, 3);
      attr(pr.attributes.TEXCOORD_0, 2, 2);
      const ia = gltf.accessors[pr.indices], ibv = gltf.bufferViews[ia.bufferView];
      const ib = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(bufOf(ibv.buffer), (ibv.byteOffset || 0) + (ia.byteOffset || 0), ibv.byteLength), gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { vao, count: ia.count, type: ia.componentType, material: pr.material };
    });
    this.nodes = gltf.nodes.map((n) => ({ ...n, translation: n.translation || [0, 0, 0], rotation: n.rotation || [0, 0, 0, 1], scale: n.scale || [1, 1, 1] }));
    this.parent = new Array(this.nodes.length).fill(-1);
    this.nodes.forEach((n, i) => (n.children || []).forEach((c) => { this.parent[c] = i; }));
    this.initTextures(gltf.textures.length);
    const sun = this.nodes.findIndex((n) => n.extensions && n.extensions.KHR_lights_punctual);
    if (sun >= 0) {
      const w = this.world(sun);
      const l = Math.hypot(w[8], w[9], w[10]);
      this.light = [-w[8] / l, -w[9] / l, -w[10] / l];     // a directional light shines down its node's -Z (KHR_lights_punctual)
      const li = gltf.extensions.KHR_lights_punctual.lights[this.nodes[sun].extensions.KHR_lights_punctual.light];
      const k = Math.min(1, (li.intensity || 1) / 2.5);
      this.lightColor = (li.color || [1, 1, 1]).map((c) => c * k);
    }
    this.camera = this.nodes.findIndex((n) => n.camera !== undefined);
  }

  initTextures(n) {
    while (this.textures.length < n) this.textures.push({ eyes: [{ proc: null, procSide: 0, pic: null }, { proc: null, procSide: 0, pic: null }], mode: 4, t: 0 });
  }

  nodeByName(name) { return this.nodes.find((n) => n.name === name); }

  world(i) {
    const n = this.nodes[i];
    const local = n.matrix ? new Float32Array(n.matrix) : M.trs(n.translation, n.rotation, n.scale);
    return this.parent[i] >= 0 ? M.mul(this.world(this.parent[i]), local) : local;
  }

  // the procedure's first drawing (side pixels, the whole texture) for an eye
  setProcedureWhole(ti, eye, side, rgb) {
    const gl = this.gl;
    const e = this.textures[ti].eyes[eye];
    if (e.proc) gl.deleteTexture(e.proc);
    e.proc = this.makeTex(side, rgb);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    e.procSide = side;
    if (this.textures[ti].mode === 4) this.textures[ti].mode = 0;
  }

  // one tile of the full-size drawing: the full-size texture is made on the first tile from the whole drawing, scaled
  // once by the GPU, and each tile then replaces its part
  setProcedureTile(ti, eye, full, x, y, side, rgb) {
    const gl = this.gl;
    const e = this.textures[ti].eyes[eye];
    if (e.procSide !== full) {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      const levels = Math.floor(Math.log2(full)) + 1;
      gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGB8, full, full);
      if (e.proc) {
        const fr = gl.createFramebuffer(), fd = gl.createFramebuffer();
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fr);
        gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, e.proc, 0);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fd);
        gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        gl.blitFramebuffer(0, 0, e.procSide, e.procSide, 0, 0, full, full, gl.COLOR_BUFFER_BIT, gl.LINEAR);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        gl.deleteFramebuffer(fr);
        gl.deleteFramebuffer(fd);
        gl.deleteTexture(e.proc);
      }
      e.proc = t;
      e.procSide = full;
    }
    gl.bindTexture(gl.TEXTURE_2D, e.proc);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, side, side, gl.RGB, gl.UNSIGNED_BYTE, rgb);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if (this.textures[ti].mode === 4) this.textures[ti].mode = 0;
  }

  setPicture(ti, eye, bitmap) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB8, gl.RGB, gl.UNSIGNED_BYTE, bitmap);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    this.textures[ti].eyes[eye].pic = t;
  }

  // the procedure's drawing is no longer needed: its texture goes (the material samples the picture alone)
  releaseProcedure(ti) {
    const gl = this.gl;
    for (const e of this.textures[ti].eyes) if (e.proc) { gl.deleteTexture(e.proc); e.proc = null; e.procSide = 0; }
  }

  drawAll(view, proj, eye) {
    const gl = this.gl;
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.u.uView, false, view);
    gl.uniformMatrix4fv(this.u.uProj, false, proj);
    gl.uniform3fv(this.u.uLight, this.light);
    gl.uniform3fv(this.u.uLightColor, this.lightColor);
    gl.uniform1f(this.u.uAmbient, this.unlit ? 1.0 : 0.42);
    if (this.unlit) gl.uniform3fv(this.u.uLightColor, [0, 0, 0]);
    gl.uniform1f(this.u.uCoarse, this.coarse);
    gl.uniform1i(this.u.uProc, 0);
    gl.uniform1i(this.u.uPic, 1);
    this.nodes.forEach((n, i) => {
      if (n.mesh === undefined) return;
      const mesh = this.meshes[n.mesh];
      const mat = this.gltf.materials[mesh.material];
      const ti = mat.pbrMetallicRoughness.baseColorTexture.index;
      const tx = this.textures[ti];
      const e = tx.eyes[eye].proc || tx.eyes[eye].pic ? tx.eyes[eye] : tx.eyes[0];
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, e.proc || this.blank);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, e.pic || this.blank);
      gl.uniform1i(this.u.uMode, tx.mode);
      gl.uniform1f(this.u.uT, tx.t);
      gl.uniformMatrix4fv(this.u.uModel, false, this.world(i));
      gl.bindVertexArray(mesh.vao);
      gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
    });
    gl.bindVertexArray(null);
  }

  begin(fb, vp) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(vp[0], vp[1], vp[2], vp[3]);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }

  // the 2D page: the scene's own camera
  frame2d() {
    const gl = this.gl;
    const c = this.canvas;
    const w = Math.round(c.clientWidth * devicePixelRatio), h = Math.round(c.clientHeight * devicePixelRatio);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.begin(null, [0, 0, w, h]);
    gl.clearColor(0.62, 0.70, 0.78, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const cam = this.gltf.cameras[this.nodes[this.camera].camera].perspective;
    const view = M.invertRigid(this.world(this.camera));
    // a viewport narrower than the camera's aspect ratio keeps the authored width in view (the vertical angle grows)
    let yfov = cam.yfov;
    if (cam.aspectRatio && w / h < cam.aspectRatio) yfov = 2 * Math.atan(Math.tan(cam.yfov / 2) * cam.aspectRatio / (w / h));
    this.drawAll(view, M.perspective(yfov, w / h, cam.znear, cam.zfar || 100), 0);
  }

  // the camera's pose in the scene, for a WebXR reference space placed there
  cameraPose() {
    const w = this.world(this.camera);
    return { position: [w[12], w[13], w[14]], world: w };
  }

  // one WebXR frame: each view with its own projection and pose
  frameXr(frame, refSpace, layer) {
    const pose = frame.getViewerPose(refSpace);
    if (!pose) return;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
    gl.clearColor(0.62, 0.70, 0.78, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const view of pose.views) {
      const vp = layer.getViewport(view);
      this.begin(layer.framebuffer, [vp.x, vp.y, vp.width, vp.height]);
      this.drawAll(view.transform.inverse.matrix, view.projectionMatrix, view.eye === 'right' ? 1 : 0);
    }
  }
}

export { M };
