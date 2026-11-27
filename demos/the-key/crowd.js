// BSD-2-Clause
import { navigation } from './hall-navigation.js';

export const STEP = 1 / 30;
export const STUCK_SECONDS = .75;
const PERSONAL_SPACE = .56;
const DIRECTIONS = [0, .45, -.45, .9, -.9, 1.5, -1.5, 2.25, -2.25, Math.PI];
const WALK_STOPS = [
  [0, -4.4], [-5.05, -4.4], [5.05, -4.4], [-6.2, -2.3], [-1.8, 1.2], [2.2, 2.4],
  [0, 4.6], [-4.1, 4.3], [5.4, 4.1], [-2.6, -1.6], [2.6, -2.0], [-5.6, .8]
];
const PROFILES = [
  { tasks: ['desk', 'pause', 'talk'], pace: .96, rest: 1.6 },
  { tasks: ['browse', 'look', 'pause'], pace: 1.24, rest: .8 },
  { tasks: ['look', 'talk', 'browse'], pace: 1.16, rest: 1.1 },
  { tasks: ['pause', 'browse', 'talk'], pace: .90, rest: 2.1 },
  { tasks: ['desk', 'look', 'pause'], pace: 1.04, rest: 2.5 },
  { tasks: ['talk', 'browse', 'look'], pace: 1.11, rest: 1.3 }
];

export const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const at = who => Array.isArray(who) ? who : [who.x, who.z];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angleTo = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);

export function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One fixed simulation step for a hall with the world's installed ground footprints. */
export function createCrowd(seed, count, layout) {
  const rand = random(seed);
  const nav = navigation(layout);
  const choose = options => options[Math.floor(rand() * options.length)];
  const stops = WALK_STOPS.filter(point => nav.clear(point));
  const agents = [], queue = [], events = [];
  let time = 0, door = null;
  for (let i = 0; i < count; i++) {
    const b = layout.bounds;
    let point;
    do {
      point = [b.minX + .6 + rand() * (b.maxX - b.minX - 1.2), b.minZ + .6 + rand() * (b.maxZ - b.minZ - 1.2)];
    } while (!nav.clear(point) || agents.some(a => distance(at(a), point) < .9));
    const profile = PROFILES[i % PROFILES.length];
    agents.push({
      id: i, x: point[0], z: point[1], yaw: rand() * 2 * Math.PI, speed: 0,
      cruise: profile.pace + rand() * .18, profile, state: 'idle', timer: rand() * 3,
      route: [], goal: null, queueSlot: -1, blockedFor: 0, arrival: 'pause', look: null,
      taskIndex: 0, walkTime: rand() * 30, idleTime: rand() * 6, walkWeight: 0
    });
  }

  function enter(a, state, timer = 0, look = null) {
    a.state = state;
    a.timer = timer;
    a.look = look;
    if (state !== 'idle' && state !== 'walk' && state !== 'queue') events.push({ time, agent: a.id, what: state });
  }

  function go(a, goal, arrival) {
    a.goal = goal;
    a.route = nav.route(at(a), goal);
    a.arrival = arrival;
    a.blockedFor = 0;
  }

  function release(a) {
    const slot = queue.indexOf(a);
    if (slot >= 0) queue.splice(slot, 1);
    a.queueSlot = -1;
  }

  function task(a, serviceStops) {
    const kind = a.profile.tasks[a.taskIndex % a.profile.tasks.length];
    a.taskIndex++;
    if (kind === 'desk' && queue.length < layout.queue.length) {
      queue.push(a);
      enter(a, 'queue');
      go(a, layout.queue[queue.length - 1], 'served');
      a.queueSlot = queue.length - 1;
      return;
    }
    if (kind === 'talk') {
      const partner = agents.find(b => b !== a && b.state === 'idle' &&
        distance(at(a), at(b)) < 2.8 && nav.clear(at(a), at(b)));
      if (partner) {
        const duration = 2.5 + rand() * 2;
        enter(a, 'talk', duration, at(partner));
        enter(partner, 'talk', duration + .2 + rand() * .6, at(a));
        return;
      }
    }
    const displays = serviceStops.filter(stop => nav.clear(stop.point));
    const placed = kind === 'browse' && displays.length ? choose(displays) : null;
    const goal = placed?.point ?? (kind === 'browse' ? choose(layout.displays.filter(point => nav.clear(point))) : null);
    a.view = placed?.view ?? (goal ? [goal[0], goal[1] - 1] : null);
    go(a, goal ?? choose(stops), kind === 'talk' || kind === 'desk' ? 'pause' : kind);
    enter(a, 'walk');
  }

  function steer(a, target, person) {
    const from = at(a);
    const angle = angleTo(from, target);
    const step = Math.min(a.cruise * STEP, distance(from, target));
    const nearby = agents.filter(other => other !== a && distance(from, at(other)) < 1.5).map(at);
    if (person && distance(from, at(person)) < 1.5) nearby.push(at(person));
    let best = null, quality = -Infinity;
    for (const turn of DIRECTIONS) {
      const dx = Math.sin(angle + turn), dz = Math.cos(angle + turn);
      const next = [from[0] + dx * step, from[1] + dz * step];
      if (!nav.clear(from, next) || nearby.some(p => distance(next, p) < Math.min(PERSONAL_SPACE, distance(from, p)))) continue;
      const ahead = [from[0] + dx * .52, from[1] + dz * .52];
      const penalty = nearby.reduce((sum, p) => sum + Math.max(0, .87 - distance(ahead, p)), 0);
      const score = Math.cos(turn) - 2.1 * penalty;
      if (score > quality) { best = next; quality = score; }
    }
    return best;
  }

  function step(person, serviceStops = []) {
    time += STEP;
    if (queue[0]?.state === 'served' && queue[0].timer <= 0) {
      const leaving = queue[0];
      release(leaving);
      go(leaving, choose(stops), 'pause');
      enter(leaving, 'walk');
    }
    queue.forEach((a, slot) => {
      if (slot !== a.queueSlot) {
        a.queueSlot = slot;
        go(a, layout.queue[slot], 'served');
      }
    });
    for (const a of agents) {
      a.timer -= STEP;
      const from = at(a), personPoint = person ? at(person) : null;
      const toPerson = personPoint ? distance(from, personPoint) : Infinity;
      const react = door && time - door.time < 2.4 && distance(from, door.point) < 11;
      if (a.state !== 'served' && (react || toPerson < (a.state === 'attend' ? 2.9 : 2.3))) {
        const state = react ? 'react' : 'attend';
        if (a.state !== state) {
          if (a.state !== 'attend' && a.state !== 'react') a.resume = a.state;
          enter(a, state);
        }
        a.look = react ? door.point : personPoint;
      } else if (a.state === 'react' || a.state === 'attend') {
        enter(a, a.resume === 'walk' || a.resume === 'queue' ? a.resume : 'idle', a.profile.rest);
      }
      if (['pause', 'talk', 'browse', 'look'].includes(a.state) && a.timer <= 0) enter(a, 'idle');
      if (a.state === 'idle' && a.timer <= 0) task(a, serviceStops);

      let face = a.look ? angleTo(from, a.look) : null;
      if (a.state === 'served') face = Math.PI;
      if (a.state === 'look') face += .38 * Math.sin(time * 1.9 + a.id);
      if (a.state === 'walk' || a.state === 'queue') {
        const end = distance(from, a.goal);
        if (end < (a.state === 'queue' ? .15 : .19)) {
          if (a.state === 'walk') {
            const look = a.arrival === 'look' ? [a.x + rand() - .5, a.z + rand() - .5] : a.view;
            enter(a, a.arrival, a.profile.rest + rand() * 2.1, look);
          } else if (a.queueSlot === 0) enter(a, 'served', 6);
          else face = Math.PI;
          a.blockedFor = 0;
        } else {
          while (a.route.length > 1 && nav.clear(from, a.route[1])) a.route.shift();
          if (!a.route.length || !nav.clear(from, a.route[0])) a.route = nav.route(from, a.goal);
          const target = a.route[0];
          const next = target && steer(a, target, person);
          if (next) {
            a.x = next[0];
            a.z = next[1];
            face = angleTo(from, next);
          }
          const progress = next ? distance(from, target) - distance(next, target) : 0;
          a.blockedFor = progress >= STEP * .12 ? 0 : a.blockedFor + STEP;
          if (a.blockedFor + STEP >= STUCK_SECONDS) {
            events.push({ time, agent: a.id, what: 'unstuck' });
            release(a);
            go(a, choose(stops), 'pause');
            enter(a, 'walk');
          }
        }
      }
      const speed = distance(at(a), from) / STEP;
      a.speed += (speed - a.speed) * .2;
      if (face !== null) a.yaw += wrap(face - a.yaw) * Math.min(1, STEP * 4.5);
      a.walkWeight += ((speed > .2 ? 1 : 0) - a.walkWeight) * Math.min(1, STEP / .35);
    }
    if (events.length > 200) events.splice(0, events.length - 200);
  }

  return {
    agents, queue, events, layout, navigation: nav,
    get time() { return time; },
    step,
    openDoor(id, x, z) { door = { point: [x, z], time }; events.push({ time, what: 'door', door: id }); }
  };
}
