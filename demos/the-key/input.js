// BSD-2-Clause
const movementKeys = new Map([
  ['KeyW', 'forward'], ['ArrowUp', 'forward'], ['KeyS', 'back'], ['ArrowDown', 'back'],
  ['KeyA', 'left'], ['KeyD', 'right'], ['ArrowLeft', 'turnLeft'], ['ArrowRight', 'turnRight']
]);
const inputKeys = ['visitor', 'account', 'mandate'];
const axis = value => Math.abs(value || 0) > .17 ? value : 0;
const pressed = (pad, index) => Boolean(pad.buttons[index]?.pressed);

export function bindInput(canvas, { use, select, nextKey }) {
  const keyboard = new Set();
  const touch = new Set();
  const padButtons = new Map();
  const gamepadStatus = document.querySelector('#gamepad-status');
  let gamepadAvailable = typeof navigator.getGamepads === 'function';
  if (!gamepadAvailable) gamepadStatus.textContent = 'This browser does not expose the Gamepad API.';
  let drag = null;
  let dx = 0;
  let dy = 0;
  window.addEventListener('keydown', event => {
    if (event.target instanceof Element && event.target.closest('#guide')) return;
    if (movementKeys.has(event.code)) {
      keyboard.add(event.code);
      event.preventDefault();
    }
    if (event.repeat) return;
    if (event.code === 'KeyE') use();
    const index = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code);
    if (index >= 0) select(inputKeys[index]);
  });
  window.addEventListener('keyup', event => keyboard.delete(event.code));
  window.addEventListener('blur', () => { keyboard.clear(); touch.clear(); drag = null; });
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    canvas.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    dx += event.clientX - drag.x;
    dy += event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
  });
  canvas.addEventListener('lostpointercapture', event => {
    if (event.pointerId === drag?.id) drag = null;
  });
  for (const button of document.querySelectorAll('[data-move]')) {
    button.addEventListener('pointerdown', event => {
      button.setPointerCapture(event.pointerId);
      touch.add(button.dataset.move);
    });
    button.addEventListener('lostpointercapture', () => touch.delete(button.dataset.move));
  }

  function sample(xrSession) {
    const ways = new Set([...Array.from(keyboard, key => movementKeys.get(key)), ...touch]);
    let strafe = Number(ways.has('right')) - Number(ways.has('left'));
    let forward = Number(ways.has('forward')) - Number(ways.has('back'));
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
      strafe += axis(pad.axes[0]);
      forward -= axis(pad.axes[1]);
      turn += axis(pad.axes[2]);
      tilt += axis(pad.axes[3]);
      const before = padButtons.get(pad.index) || [];
      if (pressed(pad, 0) && !before[0]) use();
      if (pressed(pad, 5) && !before[1]) nextKey();
      padButtons.set(pad.index, [pressed(pad, 0), pressed(pad, 5)]);
    }
    for (const index of padButtons.keys()) {
      if (pads.every(pad => pad.index !== index)) padButtons.delete(index);
    }
    for (const source of xrSession?.inputSources || []) {
      const axes = source.gamepad?.axes;
      if (!axes) continue;
      const x = axis(axes.at(-2));
      const y = axis(axes.at(-1));
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
