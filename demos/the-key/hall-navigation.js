// BSD-2-Clause
const RADIUS = .30;
const CORNER_GAP = .025;
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function intersects(a, b, box) {
  let enter = 0, leave = 1;
  for (const [axis, low, high] of [[0, box.minX, box.maxX], [1, box.minZ, box.maxZ]]) {
    const delta = b[axis] - a[axis];
    if (Math.abs(delta) < 1e-8) {
      if (a[axis] < low || a[axis] > high) return false;
      continue;
    }
    const t0 = (low - a[axis]) / delta, t1 = (high - a[axis]) / delta;
    enter = Math.max(enter, Math.min(t0, t1));
    leave = Math.min(leave, Math.max(t0, t1));
    if (enter > leave) return false;
  }
  return true;
}

/** A visibility graph of the corners of the hall's clearance rectangles. */
export function navigation({ bounds, obstacles }) {
  const boxes = obstacles.map(o => ({
    minX: o.minX - RADIUS, maxX: o.maxX + RADIUS, minZ: o.minZ - RADIUS, maxZ: o.maxZ + RADIUS
  }));
  function clear(a, b = a) {
    return [a, b].every(([x, z]) => x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ)
      && !boxes.some(box => intersects(a, b, box));
  }
  const corners = boxes.flatMap(box => [
    [box.minX - CORNER_GAP, box.minZ - CORNER_GAP], [box.maxX + CORNER_GAP, box.minZ - CORNER_GAP],
    [box.minX - CORNER_GAP, box.maxZ + CORNER_GAP], [box.maxX + CORNER_GAP, box.maxZ + CORNER_GAP]
  ]).filter(point => clear(point));
  const links = corners.map((a, i) => corners.map((b, j) => i !== j && clear(a, b) ? distance(a, b) : Infinity));

  function route(start, goal) {
    if (clear(start, goal)) return [goal];
    if (!clear(goal)) return [];
    const costs = corners.map(a => clear(start, a) ? distance(start, a) : Infinity);
    const parents = costs.map(() => -1);
    const visited = new Set();
    let end = -1, best = Infinity;
    while (visited.size < corners.length) {
      const next = costs.reduce((pick, cost, i) =>
        !visited.has(i) && cost < (pick < 0 ? best : costs[pick]) ? i : pick, -1);
      if (next < 0) break;
      visited.add(next);
      if (clear(corners[next], goal) && costs[next] + distance(corners[next], goal) < best) {
        end = next;
        best = costs[next] + distance(corners[next], goal);
      }
      links[next].forEach((length, i) => {
        if (costs[next] + length < costs[i]) {
          costs[i] = costs[next] + length;
          parents[i] = next;
        }
      });
    }
    if (end < 0) return [];
    const path = [goal];
    for (let i = end; i >= 0; i = parents[i]) path.push(corners[i]);
    return path.reverse();
  }
  return { clear, route };
}
