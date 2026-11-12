// Layer (versions 1 and 2): the WGSL twin of layer.zig. Bindings: 1 the output, 2 the base, 3 the top, 4 the mask.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read> in1: array<vec2<u32>>;
@group(0) @binding(4) var<storage, read> in2: array<vec2<u32>>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let i = id.y * u.w + id.x;
    let ver = word(0u);
    let mode = wi(1u);
    let lo = wf(2u);
    let hi = wf(3u);
    let amt = wf(4u);
    let hm = wi(5u);
    let hk = wf(6u);
    let b = unpack(in0[i]);
    let t = unpack(in1[i]);
    let gm = greyOf(in2[i]);
    var m: f32;
    if (ver >= 2u && lo > hi) { m = (1.0 - ss(hi, lo, gm)) * amt; } else { m = ss(lo, hi, gm) * amt; }
    var o: vec4<f32>;
    for (var q = 0; q < 3; q++) {
        var v: f32;
        if (mode == 0) { v = lerp(b[q], t[q], m); }
        else if (mode == 1) { v = b[q] * lerp(1.0, t[q], m); }
        else if (mode == 2) { v = b[q] + t[q] * m; }
        else { v = b[q] + (t[q] - 0.5) * 2.0 * m; }
        o[q] = v;
    }
    if (hm == 0) { o.w = b.w; }
    else if (hm == 1) { o.w = lerp(b.w, t.w, m); }
    else if (hm == 2) { o.w = b.w + hk * t.w * m; }
    else if (hm == 3) { o.w = b.w - hk * t.w * m; }
    else { o.w = b.w * lerp(1.0, t.w, hk * m); }
    outp[i] = pack(o);
}
