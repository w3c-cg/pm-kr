// The courtyard's script: turns the node "orbit" (the camera's parent) slowly left and right about the
// courtyard's centre, 25 degrees each way in 24 seconds. The tester calls update(scene, seconds) every frame.
// CC0 1.0.
export function update(scene, t) {
  const n = scene.nodeByName('orbit');
  if (!n) return;
  const a = (25 * Math.PI / 180) * Math.sin(2 * Math.PI * t / 24);
  n.rotation = [0, Math.sin(a / 2), 0, Math.cos(a / 2)];
}
