// BSD-2-Clause. Keep service drawings on the flat WebXR screen plane.
import { Matrix4, Vector3 } from 'three';

export function createServiceProjection() {
  const mode = { value: 0 };
  const plane = { value: 0 };
  const view = { value: new Matrix4() };
  const world = { value: new Matrix4() };
  const leftPosition = new Vector3();
  const rightPosition = new Vector3();
  const offset = new Vector3();

  function update(renderer) {
    mode.value = 0;
    if (!renderer.xr.isPresenting) return;
    // A shared zero-disparity plane exists for the flat device's parallel eyes.
    mode.value = -1;
    const cameras = renderer.xr.getCamera().cameras;
    if (cameras.length !== 2) return;
    const [left, right] = cameras;
    const l = left.projectionMatrix.elements;
    const r = right.projectionMatrix.elements;
    const close = (a, b) => Math.abs(a - b) < 1e-6;
    if (![3, 7, 15].every(i => close(l[i], 0)) || !close(l[11], -1) ||
        !l.every((x, i) => i === 8 || close(x, r[i])) ||
        !left.matrixWorld.elements.slice(0, 12).every((x, i) => close(x, right.matrixWorld.elements[i])) ||
        !close(left.viewport.z, right.viewport.z) || !close(left.viewport.w, right.viewport.w)) return;
    leftPosition.setFromMatrixPosition(left.matrixWorld);
    rightPosition.setFromMatrixPosition(right.matrixWorld);
    offset.copy(rightPosition).applyMatrix4(left.matrixWorldInverse);
    const distance = l[0] * offset.x / (l[8] - r[8]);
    if (!close(offset.y, 0) || !close(offset.z, 0) || !Number.isFinite(distance) || distance <= 0) return;

    world.value.copy(left.matrixWorld).setPosition(leftPosition.lerp(rightPosition, .5));
    view.value.copy(world.value).invert();
    plane.value = distance;
    mode.value = 1;
  }

  function apply(object) {
    object.traverse(drawable => {
      const material = drawable.material;
      if (!material) return;
      material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, { serviceMode: mode, servicePlane: plane, serviceView: view, serviceWorld: world });
        shader.vertexShader = `
          uniform float serviceMode, servicePlane;
          uniform mat4 serviceView, serviceWorld;
        ` + shader.vertexShader.replace('#include <project_vertex>', `
          #include <project_vertex>
          if (serviceMode < 0.0) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          } else if (serviceMode > 0.0) {
            // Follow the midpoint view's rays to the plane. Keep the original
            // depth and perspective interpolation for room occlusion and textures.
            vec3 point = (serviceView * modelMatrix * vec4(transformed, 1.0)).xyz;
            vec4 screen = projectionMatrix * viewMatrix * serviceWorld *
              vec4(point.xy, point.z, -point.z / servicePlane);
            // Parallel eyes share clip W with the original point. Use the
            // homogeneous XY directly so primitives can cross the near plane.
            gl_Position.xy = screen.xy;
          }
        `);
      };
    });
  }

  function snapshot() {
    return {
      mode: mode.value, plane: mode.value === 1 ? plane.value : null,
      view: view.value.toArray(), world: world.value.toArray()
    };
  }
  return { update, apply, snapshot, get unavailable() { return mode.value < 0; } };
}
