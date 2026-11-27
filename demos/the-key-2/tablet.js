// BSD-2-Clause. Knowledge3D's Memory Tablet in the world: "Not a 2D UI overlay. It's a THING you hold
// in 3D space" (MEMORY_TABLET_SPECIFICATION.md 3.1), sized 8", 12" or wall-sized, with the old internet
// inside it through three routes the person chooses. Full screen binds a view of the tablet with no
// navigation (as an X3D 4 Viewpoint carrying its own NavigationInfo) and unbinding returns to the world.
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from './vendor/renderers/CSS3DRenderer.js';

const INCH = .0254;
const SIZES = {
  '8in': { label: '8-inch tablet', width: 8 * INCH * 16 / Math.hypot(16, 10) },
  '12in': { label: '12-inch tablet', width: 12 * INCH * 16 / Math.hypot(16, 10) },
  wall: { label: 'Wall-sized projection', width: 2.4 }
};
export const ROUTES = {
  none: { label: 'No content', limit: '' },
  capture: { label: 'A window or tab you choose (Screen Capture)', limit: 'Picture only: the Screen Capture API carries no clicks or keys back.' },
  desktop: { label: 'A desktop window with input (VNC)', limit: 'Needs a desktop gateway offered by the system; clicks and keys go back to that window.' },
  overlay: { label: 'A page placed over the 3D view (positioned overlay)', limit: '2D view only: an immersive WebXR session cannot show page elements, and the overlay is drawn over the scene, never behind people.' }
};
const ASPECT = 10 / 16;

/** Where the browser's two eyes see no disparity, from its own eye matrices (metres; null if not a pair). */
export function zeroParallaxDistance(renderer) {
  const cameras = renderer.xr.getCamera().cameras;
  if (cameras.length !== 2) return null;
  const [l, r] = cameras;
  const separation = l.matrixWorld.elements.slice(12, 15).reduce((sum, v, i) => sum + (v - r.matrixWorld.elements[12 + i]) ** 2, 0) ** .5;
  const skew = r.projectionMatrix.elements[8] - l.projectionMatrix.elements[8];
  if (!separation || !skew) return null;
  return Math.abs(l.projectionMatrix.elements[0] * separation / skew);
}

function placeholder(title, lines) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 640;
  const g = canvas.getContext('2d');
  g.fillStyle = '#0d1820'; g.fillRect(0, 0, 1024, 640);
  g.fillStyle = '#9fd8ff'; g.font = 'bold 54px sans-serif'; g.fillText(title, 48, 110);
  g.fillStyle = '#dfe8ee'; g.font = '34px sans-serif';
  lines.forEach((line, i) => g.fillText(line, 48, 190 + i * 52));
  return canvas;
}

export function createTablet({ camera, scene, renderer, say, viewport, origins, params }) {
  const group = new THREE.Group();
  group.name = 'memory-tablet';
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, ASPECT, .045), new THREE.MeshLambertMaterial({ color: '#1d242b' }));
  body.position.z = -.024;
  const placeholderTexture = new THREE.CanvasTexture(placeholder('Memory Tablet', ['Choose a route in the Tablet panel', 'or press R to change it.']));
  placeholderTexture.colorSpace = THREE.SRGBColorSpace;
  const screenMaterial = new THREE.MeshBasicMaterial({ map: placeholderTexture, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.94, .94 * ASPECT), screenMaterial);
  screen.name = 'tablet-screen';
  group.add(body, screen);
  group.visible = false;

  const state = { held: false, size: params.get('tablet') in SIZES ? params.get('tablet') : '8in', route: 'none', status: '', full: false, input: false };
  let texture = placeholderTexture;
  let video = null;
  let stream = null;
  let rfb = null;
  let rfbCanvas = null;
  let overlay = null;
  let css = null;
  const routeStatus = {};

  function setTexture(next) {
    texture = next;
    screenMaterial.map = next;
    screenMaterial.needsUpdate = true;
    fullMaterial.map = next;
    fullMaterial.needsUpdate = true;
  }
  function tell(text) { state.status = text; routeStatus[state.route] = text; say(text); }

  function place() {
    const size = SIZES[state.size];
    group.scale.setScalar(size.width);
    group.removeFromParent();
    if (state.size === 'wall') {
      const position = new THREE.Vector3();
      const direction = new THREE.Vector3();
      camera.getWorldPosition(position);
      camera.getWorldDirection(direction);
      direction.y = 0;
      direction.normalize();
      group.position.copy(position).addScaledVector(direction, 2.7);
      group.position.y = 1.75;
      group.lookAt(position.x, 1.75, position.z);
      scene.add(group);
    } else {
      group.position.set(.035, -.165, -.43);
      group.rotation.set(-.42, 0, 0);
      camera.add(group);
    }
  }

  async function stopRoute() {
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    video?.remove();
    video = null;
    rfb?.disconnect();
    rfb = null;
    rfbCanvas = null;
    document.querySelector('#tablet-desktop')?.replaceChildren();
    overlay?.removeFromParent();
    overlay = null;
    document.querySelector('#tablet-overlay-full')?.replaceChildren();
    setTexture(placeholderTexture);
  }

  async function capture() {
    if (!navigator.mediaDevices?.getDisplayMedia) return tell('This browser offers no Screen Capture API (getDisplayMedia).');
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: false, selfBrowserSurface: 'exclude' });
    } catch (error) {
      return tell(`No window was shared (${error.name}: ${error.message}). On a desktop without a picker portal the browser cannot offer one.`);
    }
    video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.srcObject = stream;
    video.style.cssText = 'position:fixed;left:-20000px;top:0;width:320px';
    document.body.append(video);
    await video.play();
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    setTexture(videoTexture);
    const settings = stream.getVideoTracks()[0].getSettings();
    stream.getVideoTracks()[0].addEventListener('ended', () => tell('The shared window was closed or the sharing stopped.'));
    tell(`Showing a shared ${settings.displaySurface || 'surface'} at ${settings.width}×${settings.height}. ${ROUTES.capture.limit}`);
  }

  async function desktop() {
    const url = params.get('desktop') || (origins.present ? origins.desktop : '');
    if (!url) return tell('This system offers no desktop window to this page: no desktop gateway address is set (add ?desktop=wss://…).');
    let RFB;
    try { ({ default: RFB } = await import('./vendor/novnc/core/rfb.js')); }
    catch (error) { return tell('The VNC client could not load: ' + error.message); }
    const holder = document.querySelector('#tablet-desktop');
    holder.replaceChildren();
    const target = document.createElement('div');
    holder.append(target);
    const password = params.get('desktopPassword') || document.querySelector('#desktop-password')?.value || '';
    tell('Connecting to the desktop gateway at ' + new URL(url).host + '…');
    await new Promise(resolve => {
      const timer = setTimeout(() => { tell(`This system offers no desktop window to this page: nothing answered at ${new URL(url).host} within 8 seconds.`); resolve(); }, 8000);
      try {
        rfb = new RFB(target, url, { credentials: { password } });
      } catch (error) {
        clearTimeout(timer); tell('The desktop gateway address was refused: ' + error.message); resolve(); return;
      }
      rfb.scaleViewport = false;
      rfb.addEventListener('connect', () => {
        clearTimeout(timer);
        rfbCanvas = target.querySelector('canvas');
        const canvasTexture = new THREE.CanvasTexture(rfbCanvas);
        canvasTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(canvasTexture);
        state.input = true;
        tell(`Showing a desktop window from ${new URL(url).host} (${rfbCanvas.width}×${rfbCanvas.height}); clicks and keys are forwarded to it.`);
        resolve();
      });
      rfb.addEventListener('credentialsrequired', () => { clearTimeout(timer); tell('The desktop asks for a password: type it in the Tablet panel and choose the route again.'); resolve(); });
      rfb.addEventListener('disconnect', event => {
        clearTimeout(timer);
        state.input = false;
        if (state.route === 'desktop') tell(event.detail?.clean ? 'The desktop window was closed.' : `This system offers no desktop window to this page: the gateway at ${new URL(url).host} did not connect.`);
        resolve();
      });
    });
  }

  function overlayRoute() {
    if (!css) {
      css = new CSS3DRenderer();
      css.domElement.id = 'tablet-overlay';
      viewport.append(css.domElement);
    }
    const page = params.get('overlay') || origins.intranet;
    const frame = document.createElement('iframe');
    frame.src = page;
    frame.title = 'Positioned overlay: ' + page;
    frame.style.cssText = 'width:1024px;height:640px;border:0;background:#fff';
    overlay = new CSS3DObject(frame);
    overlay.name = 'tablet-overlay-object';
    tell(`Placing ${new URL(page).host} over the tablet. ${ROUTES.overlay.limit}`);
  }

  async function setRoute(route) {
    if (!(route in ROUTES)) return;
    await stopRoute();
    state.route = route;
    state.input = false;
    if (route === 'capture') await capture();
    if (route === 'desktop') await desktop();
    if (route === 'overlay') overlayRoute();
    if (route === 'none') tell('The tablet shows nothing.');
  }

  // Full screen: a bound view of the screen alone, no navigation. In 2D an orthographic camera fills the
  // viewport; in WebXR a head-locked plane fills the browser's own field of view at one metre.
  const fullScene = new THREE.Scene();
  fullScene.background = new THREE.Color('#000000');
  const fullCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  const fullMaterial = new THREE.MeshBasicMaterial({ map: placeholderTexture, toneMapped: false, depthTest: false, depthWrite: false });
  const fullQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fullMaterial);
  fullScene.add(fullQuad);
  const xrQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fullMaterial);
  xrQuad.renderOrder = 10;
  xrQuad.visible = false;
  camera.add(xrQuad);
  const bound = [];

  function bind() {
    if (!state.held) return false;
    bound.push({ name: 'tablet', navigation: 'NONE' });
    state.full = true;
    if (state.route === 'overlay' && overlay && !renderer.xr.isPresenting) {
      // A flat frame of the same page fills the view. (three.js removes a CSS3DObject's element from the
      // page when the object leaves the scene, so the tilted overlay's own frame cannot be moved here.)
      const flat = document.createElement('iframe');
      flat.src = overlay.element.src;
      flat.title = overlay.element.title + ' (full screen)';
      flat.style.cssText = 'width:100%;height:100%;border:0;background:#fff';
      // Keys typed into the page belong to that page (its origin), so the world cannot hear Escape or Action
      // there: a button outside the frame brings the person back.
      const back = document.createElement('button');
      back.type = 'button';
      back.id = 'tablet-return';
      back.textContent = 'Back to the world';
      back.addEventListener('click', () => unbind());
      document.querySelector('#tablet-overlay-full').replaceChildren(flat, back);
    }
    say('Full screen: ' + (state.input ? 'Escape returns to the world (keys go to the desktop window).' : 'Action or Escape returns to the world.'));
    return true;
  }
  function unbind() {
    if (!state.full) return false;
    bound.pop();
    state.full = false;
    xrQuad.visible = false;
    document.querySelector('#tablet-overlay-full')?.replaceChildren();
    say('Back in the world at the same place.');
    return true;
  }

  function frame() {
    if (texture.isCanvasTexture && texture !== placeholderTexture) texture.needsUpdate = true;
    const xr = renderer.xr.isPresenting;
    const plane = xr ? zeroParallaxDistance(renderer) : null;
    if (state.held && state.size !== 'wall') {
      // In an immersive session the held tablet keeps its size and sits at the browser's own zero-parallax plane,
      // low on the right inside the browser's field of view, so its depth is the screen's within the person's limits.
      // In 2D it is held low in the hand.
      if (xr && plane) {
        const p = renderer.xr.getCamera().cameras[0].projectionMatrix.elements;
        group.position.set(.5 * plane / p[0], -.45 * plane / p[5], -plane);
        group.rotation.set(0, 0, 0);
        group.scale.setScalar(SIZES[state.size].width);
      } else {
        group.position.set(.035, -.165, -.43);
        group.rotation.set(-.42, 0, 0);
        group.scale.setScalar(SIZES[state.size].width);
      }
    }
    if (overlay) {
      const show = !xr && state.held && !state.full;
      if (show && !overlay.parent) screen.add(overlay);
      if (!show && overlay.parent) overlay.removeFromParent();
      overlay.scale.setScalar(.94 / 1024);
    }
    if (state.full && xr) {
      const eye = renderer.xr.getCamera().cameras[0];
      const p = eye.projectionMatrix.elements;
      const d = plane || 1;
      const w = 2 * d / p[0], h = 2 * d / p[5];
      const contentAspect = (texture.image?.width || 16) / (texture.image?.height || 10);
      const fit = Math.min(w, h * contentAspect);
      xrQuad.scale.set(fit, fit / contentAspect, 1);
      xrQuad.position.set(0, 0, -d);
      xrQuad.visible = true;
    } else {
      xrQuad.visible = false;
    }
    // The main renderer has already traversed the scene when its before-render
    // hook supplies the current XR eyes. Refresh the two tablet subtrees here.
    if (xr) {
      group.updateWorldMatrix(true, true);
      xrQuad.updateWorldMatrix(true, true);
    }
  }

  /** Render the 2D full screen (letterboxed to the content's own shape). */
  function renderFull(width, height) {
    const contentAspect = (texture.image?.videoWidth || texture.image?.width || 16) / (texture.image?.videoHeight || texture.image?.height || 10);
    const viewAspect = width / Math.max(height, 1);
    fullQuad.scale.set(contentAspect > viewAspect ? 1 : contentAspect / viewAspect, contentAspect > viewAspect ? viewAspect / contentAspect : 1, 1);
    renderer.render(fullScene, fullCamera);
    return fullQuad.scale;
  }
  function renderOverlay(sceneForCss, view, width, height) {
    if (!css || renderer.xr.isPresenting) return;
    css.setSize(width, height);
    css.domElement.hidden = !(overlay?.parent);
    if (overlay?.parent) css.render(sceneForCss, view);
  }

  // Input to the desktop window: a point on the screen (u, v from the top left) and keys.
  function pointer(u, v, type, button = 0) {
    if (state.route !== 'desktop' || !rfbCanvas) return false;
    const rect = rfbCanvas.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, clientX: rect.left + u * rect.width, clientY: rect.top + v * rect.height, button, buttons: type === 'mouseup' ? 0 : 1 };
    rfbCanvas.dispatchEvent(new MouseEvent('mousemove', { ...init, buttons: 0 }));
    rfbCanvas.dispatchEvent(new MouseEvent(type, init));
    return true;
  }
  let keyTools = null;
  window.addEventListener('keydown', event => handleKey(event, true), { capture: true });
  window.addEventListener('keyup', event => handleKey(event, false), { capture: true });
  function handleKey(event, down) {
    if (!state.full) return;
    if (event.key === 'Escape') { if (down) unbind(); event.preventDefault(); event.stopImmediatePropagation(); return; }
    if (!(state.input && rfb)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const send = tools => rfb?.sendKey(tools.getKeysym(event), tools.getKeycode(event), down);
    if (keyTools) send(keyTools);
    else import('./vendor/novnc/core/input/util.js').then(tools => { keyTools = tools; send(tools); });
  }

  return {
    group, screen, state, routes: ROUTES, sizes: SIZES, routeStatus,
    hold() { state.held = true; group.visible = true; place(); say(`You hold the ${SIZES[state.size].label}. Action: full screen. R: route. T: size.`); },
    stow() { unbind(); state.held = false; group.visible = false; group.removeFromParent(); say('The tablet is back in your inventory.'); },
    setSize(size) { if (size in SIZES) { state.size = size; if (state.held) place(); } },
    nextSize() { const keys = Object.keys(SIZES); this.setSize(keys[(keys.indexOf(state.size) + 1) % keys.length]); say(SIZES[state.size].label); },
    setRoute, nextRoute() { const keys = Object.keys(ROUTES); return setRoute(keys[(keys.indexOf(state.route) + 1) % keys.length]); },
    bind, unbind, bound, frame, renderFull, renderOverlay, pointer,
    report: () => ({ ...state, sizeMetres: +(SIZES[state.size].width).toFixed(4), bound: bound.slice(), routeStatus: { ...routeStatus }, plane: renderer.xr.isPresenting ? zeroParallaxDistance(renderer) : null,
      texture: { width: texture.image?.videoWidth || texture.image?.width || 0, height: texture.image?.videoHeight || texture.image?.height || 0 } })
  };
}
