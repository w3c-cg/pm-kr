// BSD-2-Clause
export async function connectXR(renderer, camera, { use, nextKey, resize }) {
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
  let position;
  let orientation;
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
    position = camera.position.clone();
    orientation = camera.quaternion.clone();
    try {
      session = await navigator.xr.requestSession('immersive-vr', { requiredFeatures: ['local-floor'] });
      session.addEventListener('select', use);
      session.addEventListener('squeeze', nextKey);
      session.addEventListener('end', () => {
        session = null;
        camera.position.copy(position);
        camera.quaternion.copy(orientation);
        requestAnimationFrame(resize);
        button.textContent = 'Enter 3D';
        say('2D', 'The immersive WebXR session ended.');
      }, { once: true });
      await renderer.xr.setSession(session);
      button.textContent = 'Exit 3D';
      say('WebXR', 'The browser is presenting the scene in immersive WebXR.');
    } catch (error) {
      if (session) await session.end().catch(() => {});
      say('2D · WebXR could not start', 'The browser could not start immersive WebXR. ' + error.message);
    } finally {
      button.disabled = false;
    }
  });
}
