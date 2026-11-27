// BSD-2-Clause
import * as THREE from 'three';

/** Controllers of an immersive session: a visible ray each, kept with the person's rig. */
export function addControllers(renderer, rig) {
  const controllers = [0, 1].map(index => {
    const controller = renderer.xr.getController(index);
    const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -4)]),
      new THREE.LineBasicMaterial({ color: '#85e3d2', transparent: true, opacity: .85, depthTest: false, depthWrite: false }));
    ray.renderOrder = 30;
    ray.visible = false;
    controller.add(ray);
    controller.userData.ray = ray;
    controller.addEventListener('connected', event => {
      controller.userData.source = event.data;
      ray.visible = event.data.targetRayMode === 'tracked-pointer';
    });
    controller.addEventListener('disconnected', () => { controller.userData.source = null; ray.visible = false; });
    rig.add(controller);
    return controller;
  });
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const rotation = new THREE.Matrix4();
  /** Each pointing controller's ray in world space. */
  function rays() {
    return controllers.filter(c => c.userData.source?.targetRayMode === 'tracked-pointer').map(controller => {
      controller.updateWorldMatrix(true, false);
      origin.setFromMatrixPosition(controller.matrixWorld);
      direction.set(0, 0, -1).applyMatrix4(rotation.extractRotation(controller.matrixWorld)).normalize();
      return { source: controller.userData.source, origin: origin.clone(), direction: direction.clone() };
    });
  }
  return { controllers, rays };
}

export async function connectXR(renderer, camera, { action, cycleKey, resize, pointers, wheel }) {
  const button = document.querySelector('#xr');
  const status = document.querySelector('#xr-status');
  const mode = document.querySelector('#display-mode');
  function say(label, reason) {
    mode.textContent = label;
    status.textContent = reason;
  }

  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');
  if (!window.isSecureContext) {
    say('2D · WebXR unavailable', 'WebXR needs a secure origin. Serve this demo over HTTPS or localhost.');
    return;
  }
  if (!navigator.xr) {
    say('2D · WebXR unavailable', 'This browser does not expose the WebXR Device API.');
    return;
  }
  try {
    if (!await navigator.xr.isSessionSupported('immersive-vr')) {
      say('2D · WebXR unavailable', 'The browser reports no immersive WebXR display or headset.');
      return;
    }
  } catch (error) {
    say('2D · WebXR unavailable', 'The browser could not check for a WebXR display. ' + error.message);
    return;
  }

  let session;
  let desktopCamera;
  button.hidden = false;
  say('2D', 'The browser can open an immersive WebXR session.');
  button.addEventListener('click', async () => {
    button.disabled = true;
    if (session) {
      try { await session.end(); }
      catch (error) { say('WebXR', 'The browser could not end the session. ' + error.message); }
      finally { button.disabled = false; }
      return;
    }
    desktopCamera = {
      position: camera.position.clone(), quaternion: camera.quaternion.clone(),
      fov: camera.fov, near: camera.near, far: camera.far, zoom: camera.zoom
    };
    try {
      session = await navigator.xr.requestSession('immersive-vr', { requiredFeatures: ['local-floor'] });
      session.addEventListener('select', event => {
        // With the inventory open, Trigger takes the item the controller's ray points at.
        if (!wheel.isOpen) { action(); return; }
        const pointer = pointers.rays().find(entry => entry.source === event.inputSource);
        if (pointer) wheel.ray(pointer.origin, pointer.direction, true);
        else wheel.take();
      });
      session.addEventListener('squeeze', event => {
        const step = event.inputSource.handedness === 'left' ? -1 : 1;
        if (wheel.isOpen) wheel.step(step);
        else cycleKey(step, 'controller');
      });
      session.addEventListener('end', () => {
        session = null;
        const { position, quaternion, ...optics } = desktopCamera;
        camera.position.copy(position);
        camera.quaternion.copy(quaternion);
        Object.assign(camera, optics);
        requestAnimationFrame(resize);
        button.textContent = 'Enter 3D';
        say('2D', 'The immersive WebXR session ended.');
      }, { once: true });
      await renderer.xr.setSession(session);
      button.textContent = 'Exit 3D';
      say('WebXR', 'The browser is presenting the scene in immersive WebXR.');
    } catch (error) {
      if (session) await session.end().catch(() => {});
      const reason = error.name === 'NotSupportedError'
        ? 'The browser declined immersive WebXR with the required local-floor reference space.'
        : 'The browser could not start immersive WebXR with local-floor.';
      say('2D · WebXR could not start', reason + ' ' + error.message);
    } finally {
      button.disabled = false;
    }
  });
}
