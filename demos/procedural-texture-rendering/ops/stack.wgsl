// Stack (version 1): the WGSL twin of stack.zig. One pass per procedure (u.pas = the layer, the bottom one 0), each
// laying its layer (binding 2, drawn on a canvas of the output's side with no margin) over the 32-bit picture below
// it (binding 3) with its own amount and mask; a last pass (u.pas = u.nin) quantises to the output (binding 1).
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> layer: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read_write> acc: array<vec4<f32>>;

fn thrS(lo: f32, hi: f32, x: f32) -> f32 {
    if (lo > hi) { return 1.0 - ss(hi, lo, x); }
    return ss(lo, hi, x);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let k = id.y * u.w + id.x;
    let l = u.pas;
    if (l == 0u) { acc[k] = unpack(layer[k]); return; }
    if (l < u.nin) {
        let t = unpack(layer[k]);
        let b = 1u + 4u * (l - 1u);
        let mode = wi(b);
        let lo = wf(b + 2u);
        let hi = wf(b + 3u);
        let g = (t.x + t.y + t.z) / 3.0;
        var f = 1.0;
        if (mode == 1) { f = thrS(lo, hi, t.w); }
        else if (mode == 2) { f = 1.0 - thrS(lo, hi, g); }
        else if (mode == 3) { f = thrS(lo, hi, g); }
        let m = f * wf(b + 1u);
        let o = acc[k];
        acc[k] = vec4<f32>(lerp(o.x, t.x, m), lerp(o.y, t.y, m), lerp(o.z, t.z, m), lerp(o.w, t.w, m));
        return;
    }
    outp[k] = pack(acc[k]);
}
