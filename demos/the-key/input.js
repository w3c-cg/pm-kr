// BSD-2-Clause. One set of actions (walk, look, Action, the inventory, choosing in it), bound per device:
// keyboard and mouse, touch (touch.js), a standard gamepad and an immersive session's controllers.
const movementKeys = new Map([
  ['KeyW', 'forward'], ['ArrowUp', 'forward'], ['KeyS', 'back'], ['ArrowDown', 'back'],
  ['KeyA', 'left'], ['KeyD', 'right'], ['ArrowLeft', 'turnLeft'], ['ArrowRight', 'turnRight']
]);
const inputKeys = ['visitor', 'account', 'mandate'];
const axis = value => Math.abs(value || 0) > .17 ? value : 0;
const pressed = (pad, index) => Boolean(pad.buttons[index]?.pressed);
const TAP = 9;

/**
 * handlers: action(), select(id), cycleKey(step, source), and wheel (wheel.js): isOpen, toggle(source),
 * close(), step(n), take(), point(x, y), hover(x, y), tap(x, y, source); stick(): the touch stick.
 */
export function bindInput(canvas, { action, select, cycleKey, wheel, stick }) {
  const keyboard = new Set();
  const padButtons = new Map();
  const xrButtons = new Map();
  const gamepadStatus = document.querySelector('#gamepad-status');
  let gamepadAvailable = typeof navigator.getGamepads === 'function';
  if (!gamepadAvailable) gamepadStatus.textContent = 'This browser does not expose the Gamepad API.';
  let drag = null;
  let dx = 0;
  let dy = 0;
  window.addEventListener('keydown', event => {
    if (event.target instanceof Element && event.target.closest('#guide, input, textarea, select')) return;
    if (movementKeys.has(event.code)) {
      keyboard.add(event.code);
      event.preventDefault();
    }
    if (event.repeat) return;
    if (wheel.isOpen) {
      if (event.code === 'KeyQ') wheel.step(-1);
      if (event.code === 'KeyE') wheel.step(1);
      if (event.code === 'KeyF' || event.code === 'Enter') { event.preventDefault(); wheel.take(); }
      if (event.code === 'KeyI' || event.code === 'Escape') wheel.close();
      return;
    }
    if (event.code === 'KeyI') { wheel.toggle('pointer'); return; }
    if (event.code === 'KeyQ') cycleKey(-1, 'keys');
    if (event.code === 'KeyE') cycleKey(1, 'keys');
    if (event.code === 'KeyF') action();
    const index = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code);
    if (index >= 0) select(inputKeys[index]);
  });
  window.addEventListener('keyup', event => keyboard.delete(event.code));
  window.addEventListener('blur', () => { keyboard.clear(); drag = null; });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    canvas.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
  });
  canvas.addEventListener('pointermove', event => {
    if (wheel.isOpen && event.pointerType === 'mouse') wheel.hover(event.clientX, event.clientY);
    if (event.pointerId !== drag?.id) return;
    dx += event.clientX - drag.x;
    dy += event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener('pointerup', event => {
    if (event.pointerId !== drag?.id) return;
    const still = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < TAP;
    if (still && wheel.isOpen) wheel.tap(event.clientX, event.clientY, event.pointerType === 'mouse' ? 'pointer' : 'touch');
  });
  canvas.addEventListener('lostpointercapture', event => {
    if (event.pointerId === drag?.id) drag = null;
  });
  canvas.addEventListener('wheel', event => {
    if (!wheel.isOpen) return;
    event.preventDefault();
    wheel.step(Math.sign(event.deltaY));
  }, { passive: false });

  function edge(store, id, buttons) {
    const before = store.get(id) || [];
    store.set(id, buttons);
    return buttons.map((on, i) => on && !before[i]);
  }

  function sample(xrSession) {
    const ways = new Set(Array.from(keyboard, key => movementKeys.get(key)));
    const touch = stick();
    let strafe = Number(ways.has('right')) - Number(ways.has('left')) + touch.strafe;
    let forward = Number(ways.has('forward')) - Number(ways.has('back')) + touch.forward;
    let turn = Number(ways.has('turnRight')) - Number(ways.has('turnLeft'));
    let tilt = 0;
    let pads = [];
    if (gamepadAvailable) {
      try { pads = Array.from(navigator.getGamepads()).filter(pad => pad?.mapping === 'standard'); }
      catch (error) {
        gamepadAvailable = false;
        gamepadStatus.textContent = 'Gamepad input is unavailable. ' + error.message;
      }
    }
    for (const pad of pads) {
      // Standard mapping: 0 A, 1 B, 3 Y, 4 left bumper, 5 right bumper.
      const [a, b, y, left, right] = edge(padButtons, pad.index, [0, 1, 3, 4, 5].map(i => pressed(pad, i)));
      if (wheel.isOpen) {
        wheel.point(pad.axes[0] || 0, pad.axes[1] || 0);
        if (left) wheel.step(-1);
        if (right) wheel.step(1);
        if (a) wheel.take();
        if (b || y) wheel.close();
        continue;
      }
      strafe += axis(pad.axes[0]);
      forward -= axis(pad.axes[1]);
      turn += axis(pad.axes[2]);
      tilt += axis(pad.axes[3]);
      if (y) wheel.toggle('gamepad');
      if (a) action();
      if (left) cycleKey(-1, 'gamepad');
      if (right) cycleKey(1, 'gamepad');
    }
    for (const index of padButtons.keys()) {
      if (pads.every(pad => pad.index !== index)) padButtons.delete(index);
    }
    for (const source of xrSession?.inputSources || []) {
      const gamepad = source.gamepad;
      if (!gamepad) continue;
      // xr-standard mapping: 4 and 5 are the face buttons (A and B, or X and Y); the upper one opens the inventory.
      const [, upper] = edge(xrButtons, source, [4, 5].map(i => pressed(gamepad, i)));
      if (upper) wheel.toggle('controller');
      const x = axis(gamepad.axes.at(-2));
      const y = axis(gamepad.axes.at(-1));
      if (wheel.isOpen) continue;
      if (source.handedness === 'right') turn += x;
      else { strafe += x; forward -= y; }
    }
    const result = { strafe, forward, turn, tilt, dx, dy };
    dx = 0;
    dy = 0;
    return result;
  }

  return sample;
}
