// Tint (version 1): the WGSL twin of tint.zig. Bindings: 1 the output, 2 the input.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;

fn tent(d_in: f32, s: f32) -> f32 {
    var d = d_in - floor(d_in + 0.5);
    d = abs(d);
    return clamp01(1.0 - d / s);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let k = id.y * u.w + id.x;
    let x = wf(1u);
    let y = wf(2u);
    let s = wf(3u);
    let gb = wf(4u);
    let gs = wf(5u);
    let cx = x + 0.5 * s;
    let cy = y + 0.5 * s;
    let o = unpack(in0[k]);
    let wt = tent(cv(id.y) - cy, s) * tent(cu(id.x) - cx, s);
    if (wt == 0.0) { outp[k] = pack(o); return; }
    let b = 1.0 + gb * wt;
    let sa = 1.0 + gs * wt;
    let m = (o.x + o.y + o.z) / 3.0;
    outp[k] = pack(vec4<f32>((m + (o.x - m) * sa) * b, (m + (o.y - m) * sa) * b, (m + (o.z - m) * sa) * b, o.w));
}
