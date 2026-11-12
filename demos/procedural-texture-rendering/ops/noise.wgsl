// Noise (versions 1): the WGSL twin of noise.zig. Bindings: 1 the output.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let kind = word(1u);
    let fx = wi(2u);
    let fy = wi(3u);
    let oct = word(4u);
    let gain = wf(5u);
    let warp = wf(6u);
    let wfc = wi(7u);
    let seed = word(8u);
    let con = wf(9u);
    let p = warped(cu(id.x), cv(id.y), warp, wfc, seed);
    let n = fbm(p.x, p.y, fx, fy, oct, gain, seed, kind);
    var g: f32;
    if (kind == 0u) { g = clamp01(0.5 + 0.5 * con * n); } else { g = clamp01(0.5 + con * (n - 0.5)); }
    outp[id.y * u.w + id.x] = pack(vec4<f32>(g, g, g, g));
}
