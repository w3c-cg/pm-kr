// Page controls and comparison of the saved drawing with the photograph.
// No procedure is evaluated for comparison. Our code, BSD 2-clause.
import { t } from './strings.js';

const byId = (id) => document.getElementById(id);
const text = (id, value) => { const e = byId(id); if (e && e.textContent !== value) e.textContent = value; };

export class Presentation {
  constructor(settings, pending, replay) {
    this.settings = settings;
    this.pending = pending;
    this.saved = new Map();
    this.holding = false;
    this.method = new URLSearchParams(location.search).get('compare') === 'split' ? 'split' : 'hold';
    this.split = 50;
    const details = byId('measurements');
    details.open = settings.detailsOpen;
    details.addEventListener('toggle', () => {
      settings.detailsOpen = details.open;
      this.address('details', details.open ? '1' : '0');
    });
    byId('restart').onclick = () => replay();
    byId('quick-speed').onchange = (ev) => { pending.speed = ev.target.value; replay('quick-speed'); };
    byId('compare-method').onchange = (ev) => {
      this.method = ev.target.value;
      this.hold(false);
      this.address('compare', this.method);
      this.compareControls();
    };
    byId('split-position').oninput = (ev) => { this.split = +ev.target.value; byId('split-divider').style.left = this.split + '%'; };
    const hold = byId('compare-hold');
    hold.onpointerdown = (ev) => { if (ev.button === 0) { hold.setPointerCapture(ev.pointerId); this.hold(true); } };
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur']) hold.addEventListener(event, () => this.hold(false));
    hold.onkeydown = (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); this.hold(true); } };
    hold.onkeyup = (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); this.hold(false); } };
    window.addEventListener('blur', () => this.hold(false));
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.hold(false); });
    window.addEventListener('hashchange', () => { this.handledHash = null; this.revealAddressTarget(); });
  }

  revealAddressTarget() {
    if (!location.hash || this.handledHash === location.hash) return;
    let target;
    try { target = byId(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
    if (!target) return;
    this.handledHash = location.hash;
    const details = byId('measurements');
    if (details.contains(target)) { details.open = true; requestAnimationFrame(() => target.scrollIntoView()); }
  }

  address(key, value) {
    const q = new URLSearchParams(location.search);
    q.set(key, value);
    history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
  }

  hold(value) {
    this.holding = value && !byId('compare-hold').disabled;
    byId('compare-hold').setAttribute('aria-pressed', String(this.holding));
    byId('view').dataset.comparison = this.holding ? 'hold' : this.method;
  }

  compareControls() {
    byId('compare-hold').hidden = this.method !== 'hold';
    byId('split-control').hidden = this.method !== 'split';
    byId('split-labels').hidden = this.method !== 'split' || !this.ready;
    byId('split-divider').hidden = this.method !== 'split' || !this.ready;
    byId('compare-method').value = this.method;
    byId('view').dataset.comparison = this.method;
  }

  strings() {
    for (const [id, key] of Object.entries({
      'quick-label':'speed', 'quick-hint':'quickHint', restart:'restart', 'details-label':'detailsTitle',
      'h-seeing':'seeingTitle', 'step-recipe':'stepRecipe', 'step-draw':'stepDraw', 'step-photo':'stepPhoto',
      'why-now':'whyNow', 'compare-label':'compareLabel', 'compare-hold':'holdLabel',
      'split-position-label':'splitPosition', 'split-computed':'computedLabel', 'split-photo':'photoLabel',
      'compare-note':'compareNote', 'surfaces-title':'surfacesTitle',
    })) text(id, t(key));
    this.speedChoices();
    const method = byId('compare-method');
    method.textContent = '';
    method.add(new Option(t('holdChoice'), 'hold'));
    method.add(new Option(t('splitChoice'), 'split'));
    this.compareControls();
    this.pendingNotes();
  }

  speedChoices() {
    const quick = byId('quick-speed');
    quick.textContent = '';
    for (const [value, key] of [['d144','quick144'],['d56','quick56'],['dsl8','quickDsl'],['none','quickNone']]) {
      quick.add(new Option(t(key), value, false, value === this.settings.speed));
    }
    if (![...quick.options].some((o) => o.value === this.settings.speed)) quick.add(new Option(t('quickOther'), this.settings.speed, true, true));
  }

  pendingNotes() {
    for (const [id, key] of [['conns','conns'],['limit','limit'],['blend','blend'],['blendsec','blendSec'],['link','link']]) {
      const note = byId(id + '-pending');
      if (!note) continue;
      note.textContent = t('pendingSetting');
      note.hidden = String(this.pending[key]) === String(this.settings[key]);
    }
  }

  attach(scene) {
    // Keep the existing GL drawing, detach it from normal materials, and let the
    // existing release path run. The unmodified renderer samples photographs normally.
    const release = scene.releaseProcedure.bind(scene);
    scene.releaseProcedure = (ti) => {
      const eyes = scene.textures[ti].eyes;
      this.saved.set(ti, eyes.map((e) => ({ proc:e.proc, procSide:e.procSide })));
      for (const e of eyes) { e.proc = null; e.procSide = 0; }
      release(ti);
    };
    const draw = scene.drawAll.bind(scene);
    scene.drawAll = (view, projection, eye) => {
      if (!this.ready || (!this.holding && this.method !== 'split')) return draw(view, projection, eye);
      const computed = () => {
        const original = scene.textures.map((tx) => ({ mode:tx.mode, eyes:tx.eyes.map((e) => ({ proc:e.proc, procSide:e.procSide })) }));
        try {
          scene.textures.forEach((tx, i) => {
            const cache = this.saved.get(i);
            if (cache && cache.some((e) => e.proc)) { tx.mode = 0; tx.eyes.forEach((e, j) => Object.assign(e, cache[j])); }
          });
          draw(view, projection, eye);
        } finally {
          scene.textures.forEach((tx, i) => { tx.mode = original[i].mode; tx.eyes.forEach((e,j) => Object.assign(e, original[i].eyes[j])); });
        }
      };
      if (this.holding) return computed();
      const gl = scene.gl, vp = gl.getParameter(gl.VIEWPORT), box = gl.getParameter(gl.SCISSOR_BOX), was = gl.isEnabled(gl.SCISSOR_TEST);
      const cut = Math.round(vp[2] * this.split / 100);
      try {
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(vp[0], vp[1], cut, vp[3]);
        computed();
        gl.scissor(vp[0] + cut, vp[1], vp[2] - cut, vp[3]);
        draw(view, projection, eye);
      } finally {
        gl.scissor(...box);
        if (!was) gl.disable(gl.SCISSOR_TEST);
      }
    };
  }

  render(run, textures, bytes, time) {
    const proc = run.comps.filter((c) => c.kind === 'procedure').reduce((a,c) => a+c.size, 0);
    const pic = run.comps.filter((c) => c.kind === 'picture').reduce((a,c) => a+c.size, 0);
    const shown = textures.filter((tx) => tx.mode === 'picture').length, total = textures.length;
    const done = total > 0 && shown === total;
    const comparison = this.ready && (this.holding || this.method === 'split');
    const line = comparison ? t(this.holding ? 'stateHold' : 'stateSplit') : run.firstFrame == null ? t('stateLoading', bytes(proc)) : done
      ? t('stateDone', shown, bytes(pic), time(run.allIn / 1000), bytes(proc))
      : shown ? t('stateProgress', shown, total, bytes(proc)) : t('stateComputed', bytes(proc));
    text('scene-state', line);
    this.comparisonText = comparison ? line : null;
    const list = byId('surface-states');
    textures.forEach((tx, i) => {
      let li = list.children[i];
      if (!li) { li = document.createElement('li'); list.append(li); }
      const state = comparison ? (this.holding ? t('computedLabel') : t('computedLabel') + ' / ' + t('photoLabel')) : tx.picFailed || tx.failed ? t('surfaceProblem') : tx.mode === 'picture' ? t('photoLabel') : tx.mode === 'blend' ? t('blendLabel') : tx.times.procFirst != null ? t('computedLabel') : t('loading');
      const value = tx.name + ': ' + state;
      if (li.textContent !== value) li.textContent = value;
      li.dataset.state = comparison ? (this.holding ? 'procedure' : 'both') : tx.mode;
    });
    this.ready = done && run.playerOff != null && textures.every((tx) => this.saved.get(tx.i)?.slice(0, tx.eyes).every((e) => e.proc));
    byId('comparison').hidden = !done;
    byId('compare-hold').disabled = !this.ready;
    byId('compare-method').disabled = !this.ready;
    byId('split-position').disabled = !this.ready;
    text('compare-note', t(this.ready ? 'compareNote' : 'compareUnavailable'));
    text('compare-error', t('compareUnavailable'));
    byId('compare-error').hidden = !done || this.ready || run.playerOff == null;
    this.compareControls();
  }
}
