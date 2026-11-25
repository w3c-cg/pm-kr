// BSD-2-Clause
export async function connectXR(renderer, camera, { action, cycleKey, resize }) {
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
      session.addEventListener('select', action);
      session.addEventListener('squeeze', event => cycleKey(event.inputSource.handedness === 'left' ? -1 : 1));
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
