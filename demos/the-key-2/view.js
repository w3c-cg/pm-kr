// BSD-2-Clause. The view: the scene fills what the browser gives it and the world keeps its scale.
//
// The camera's focal length is fixed in CSS pixels for the device (from the long side of its screen),
// so a thing at a given distance keeps its size on the glass whatever the window does: a wider window
// shows more of the world to the sides, a taller one more above and below, and the address bar
// coming and going, a rotation or a resized window never zoom, stretch or squeeze the world.

/** Half the horizontal field of view across the long side of the device's screen. */
export const REFERENCE_HALF_FIELD = 48 * Math.PI / 180;
/** Pixels drawn per frame at most: a 1920x1080 frame. Above it the browser scales the picture uniformly. */
export const PIXEL_BUDGET = 1920 * 1080;

export function focalLength(width, height, screen = window.screen) {
  const long = Math.max(screen?.width || 0, screen?.height || 0, width, height);
  return long / 2 / Math.tan(REFERENCE_HALF_FIELD);
}

export function pixelRatio(width, height, ratio = window.devicePixelRatio || 1) {
  const fit = Math.sqrt(PIXEL_BUDGET / Math.max(1, width * height));
  return Math.min(ratio, Math.max(1, fit));
}

/** Set a perspective camera for a viewport of width x height CSS pixels; returns the focal length used. */
export function fitCamera(camera, width, height) {
  const focal = focalLength(width, height);
  camera.fov = 2 * Math.atan(Math.max(height, 1) / 2 / focal) * 180 / Math.PI;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  return focal;
}

/**
 * The layout follows the input the device offers, never the browser's name.
 *  - touch-landscape: a touch-first device held sideways: game controls over the scene, the text out of the way.
 *  - touch-portrait: a touch-first device held upright: the text as on a desktop, with touch controls.
 *  - pointer-touch: a mouse-first device that has been touched: the text stays, touch controls appear beside it.
 *  - pointer: mouse and keyboard.
 */
export function createLayout(play, onChange = () => {}) {
  const coarse = matchMedia('(pointer: coarse)');
  const landscape = matchMedia('(orientation: landscape)');
  let touched = false;
  let current = '';
  function apply() {
    const layout = coarse.matches ? (landscape.matches ? 'touch-landscape' : 'touch-portrait') : touched ? 'pointer-touch' : 'pointer';
    if (layout === current) return;
    current = layout;
    play.dataset.layout = layout;
    onChange(layout);
  }
  window.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' && !touched) { touched = true; apply(); }
  }, { capture: true, passive: true });
  coarse.addEventListener('change', apply);
  landscape.addEventListener('change', apply);
  window.addEventListener('resize', apply);
  apply();
  return {
    get layout() { return current; },
    get touch() { return current !== 'pointer'; },
    get textHidden() { return current === 'touch-landscape'; }
  };
}
