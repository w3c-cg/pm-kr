// BSD-2-Clause. Touch controls bound to the same actions as the keys: walk (the stick),
// look (drag anywhere on the scene), Action and the inventory (buttons).
const DEAD_ZONE = .12;

export function bindTouch({ action, inventory }) {
  const stick = document.querySelector('#touch-stick');
  const knob = stick.querySelector('span');
  const value = { x: 0, y: 0 };
  let finger = null;

  function follow(event) {
    const box = stick.getBoundingClientRect();
    const radius = box.width / 2 || 1;
    let x = (event.clientX - box.left - radius) / radius;
    let y = (event.clientY - box.top - radius) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    const live = Math.min(length, 1) > DEAD_ZONE;
    value.x = live ? x : 0;
    value.y = live ? y : 0;
    knob.style.transform = `translate(${(x * radius * .58).toFixed(1)}px, ${(y * radius * .58).toFixed(1)}px)`;
  }
  function release(event) {
    if (event.pointerId !== finger) return;
    finger = null;
    value.x = value.y = 0;
    knob.style.transform = '';
    stick.removeAttribute('data-active');
  }
  stick.addEventListener('pointerdown', event => {
    if (finger !== null) return;
    finger = event.pointerId;
    stick.setPointerCapture(event.pointerId);
    stick.dataset.active = '';
    follow(event);
    event.preventDefault();
  });
  stick.addEventListener('pointermove', event => { if (event.pointerId === finger) follow(event); });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(type, release);
  window.addEventListener('blur', () => release({ pointerId: finger }));

  document.querySelector('#touch-action').addEventListener('click', () => action());
  for (const button of document.querySelectorAll('[data-inventory-toggle]')) {
    button.addEventListener('click', () => inventory.toggle(button.dataset.inventoryToggle || 'touch'));
  }

  return {
    /** The stick as walking: strafe to the right and forward, each from -1 to 1. */
    sample: () => ({ strafe: value.x, forward: -value.y }),
    get held() { return finger !== null; }
  };
}
