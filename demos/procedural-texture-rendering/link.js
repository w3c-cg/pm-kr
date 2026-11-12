// The link simulated in the page (ORDER 537): the same rule as the local server's Link (tools/serve.py), run in the
// browser, so the tester needs no server of its own.
//
// What is real and what is simulated: every file is downloaded by the browser at the visitor's own speed; its bytes
// are held here and handed to the loader at the chosen rate, as Macromedia Flash's Simulate Download did with a file
// it already had. The page says so.
//
// The rule (serve.py's): one link of a set rate in bytes per second, shared by every limited download; a chunk is
// the rate over 50, at least 32 bytes and at most 65,536; each chunk takes the next free slot of chunk / rate seconds
// and is handed over when its slot has passed; the downloads take their turns chunk by chunk, so N downloads share
// the rate; a slot may begin up to 0.1 s in the past (five chunks' time where chunks are capped), so a sender that
// wakes late makes the time up, as a token bucket that deep does; idle time longer than that is lost, as on a real
// line. Every chunk handed over is recorded, so the rate the panel shows can be checked against this record.
//
// One dispatcher serves the downloads in turn. (The server has a thread for each connection and they take turns at
// its lock; a page has one thread, and a loop for each download would let the first one to wake after a pause take
// every slot the pause left behind.)
//
// Where it differs from the server's link, by construction:
// - a slot is taken only for bytes that have really arrived: when the visitor's own connection is slower than the
//   chosen speed, the link runs at the visitor's speed (and its record shows it);
// - a browser slows the timers of a hidden tab (to once a second, later once a minute); while the tab is hidden the
//   time lost is made up at the next wake, so the average rate holds and the bytes come in lumps.
// Our code, BSD 2-clause.

const now = () => performance.now() / 1000;      // seconds, monotonic

// a macrotask without the 4 ms clamp of nested timers
const yielder = new MessageChannel();
const yieldQueue = [];
yielder.port1.onmessage = () => { const r = yieldQueue.shift(); if (r) r(); };
const yieldNow = () => new Promise((r) => { yieldQueue.push(r); yielder.port2.postMessage(0); });
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

export class PageLink {
  static BURST = 0.1;          // seconds a slot may begin in the past
  static HIDDEN_BURST = 75;    // the same while the tab is hidden: a hidden page wakes once a second, later once a minute

  constructor() {
    this.rate = 0;             // bytes per second; 0: no limit
    this.freeAt = 0;
    this.t0 = now();
    this.log = [];             // [seconds since reset, bytes, name]: every chunk handed to the loader
    this.arrived = [];         // [seconds since reset, bytes, name]: every chunk the browser really received
    this.conns = [];           // the downloads on the link, in the order they take their turns
    this.next = 0;             // whose turn it is
    this.running = false;
    this.hiddenS = 0;          // seconds this page was hidden since reset
    this.hiddenAt = typeof document !== 'undefined' && document.hidden ? now() : null;
    this.shownAt = -1e9;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.hiddenAt = now();
        else { if (this.hiddenAt != null) this.hiddenS += now() - this.hiddenAt; this.hiddenAt = null; this.shownAt = now(); }
      });
    }
  }

  setRate(bytesPerSecond) { this.rate = bytesPerSecond; this.freeAt = now(); }
  reset() { this.log = []; this.arrived = []; this.t0 = now(); this.freeAt = this.t0; this.hiddenS = 0; if (this.hiddenAt != null) this.hiddenAt = this.t0; }
  chunk() { const r = this.rate; return r <= 0 ? 65536 : Math.max(32, Math.min(65536, Math.floor(r / 50))); }
  hiddenSeconds() { return this.hiddenS + (this.hiddenAt != null ? now() - this.hiddenAt : 0); }
  waiting() { return this.conns.reduce((a, c) => a + c.buffered, 0); }

  // how far in the past a slot may begin now
  burst() {
    const normal = Math.min(PageLink.BURST, 5 * this.chunk() / this.rate);
    const hidden = this.hiddenAt != null || now() - this.shownAt < 1.5;
    return hidden ? PageLink.HIDDEN_BURST : normal;
  }

  // Hand the bytes of one response body to onChunk(Uint8Array) at the link's rate, in turn with the other downloads.
  // Resolves when the body has ended and every byte has been handed over; rejects if the download fails.
  send(reader, onChunk, name) {
    return new Promise((resolve, reject) => {
      const c = { queue: [], head: 0, buffered: 0, ended: false, failure: null, onChunk, name, resolve, reject };
      this.conns.push(c);
      (async () => {
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value || !value.length) continue;
            // the link was idle (nothing waiting anywhere): its clock starts from this arrival, whatever the tab's state
            if (this.waiting() === 0 && this.rate > 0) this.freeAt = Math.max(this.freeAt, now() - Math.min(PageLink.BURST, 5 * this.chunk() / this.rate));
            c.queue.push(value);
            c.buffered += value.length;
            this.arrived.push([+(now() - this.t0).toFixed(4), value.length, name]);
            this.run();
          }
        } catch (e) { c.failure = e; }
        c.ended = true;
        if (c.buffered === 0) this.finish(c);
        else this.run();
      })();
    });
  }

  finish(c) {
    const i = this.conns.indexOf(c);
    if (i < 0) return;
    this.conns.splice(i, 1);
    if (i < this.next) this.next--;
    if (c.failure) c.reject(c.failure); else c.resolve();
  }

  // the dispatcher: the next download with bytes waiting takes the next slot
  async run() {
    if (this.running) return;
    this.running = true;
    let lastYield = now();
    for (;;) {
      let c = null;
      const n0 = this.conns.length;
      for (let k = 0; k < n0; k++) {
        const x = this.conns[(this.next + k) % n0];
        if (x.buffered > 0) { c = x; this.next = (this.next + k + 1) % n0; break; }
      }
      if (!c) break;
      let n, due;
      const t = now();
      if (this.rate > 0) {
        n = Math.min(this.chunk(), c.buffered);
        const start = Math.max(t - this.burst(), this.freeAt);
        this.freeAt = start + n / this.rate;
        due = this.freeAt;
      } else {
        n = Math.min(65536, c.buffered);
        due = t;
      }
      const wait = due - now();
      if (wait > 0.0005) { await sleep(wait); lastYield = now(); }
      else if (now() - lastYield > 0.008) { await yieldNow(); lastYield = now(); }
      // n bytes off the front of this download's queue
      let out;
      const first = c.queue[0];
      if (first.length - c.head >= n) {
        out = first.subarray(c.head, c.head + n);
        c.head += n;
        if (c.head === first.length) { c.queue.shift(); c.head = 0; }
      } else {
        out = new Uint8Array(n);
        let o = 0;
        while (o < n) {
          const q = c.queue[0];
          const k = Math.min(n - o, q.length - c.head);
          out.set(q.subarray(c.head, c.head + k), o);
          o += k; c.head += k;
          if (c.head === q.length) { c.queue.shift(); c.head = 0; }
        }
      }
      c.buffered -= n;
      this.log.push([+(now() - this.t0).toFixed(4), n, c.name]);
      try { c.onChunk(out); } catch (e) { c.failure = c.failure || e; }
      if (c.buffered === 0 && c.ended) this.finish(c);
    }
    this.running = false;
  }
}
