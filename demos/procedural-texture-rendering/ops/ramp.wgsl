// Ramp (version 1): the WGSL twin of ramp.zig. Bindings: 1 the output, 2 the field.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let i = id.y * u.w + id.x;
    let n = word(1u);
    let src = in0[i];
    let g = greyOf(src);
    let a = f32(src.y >> 16u) / 32767.0;
    var rgb = rgbOf(word(3u));
    let last = wf(2u + 2u * (n - 1u));
    if (g >= last) {
        rgb = rgbOf(word(3u + 2u * (n - 1u)));
    } else if (g > wf(2u)) {
        var k = 1u;
        while (k < n && g > wf(2u + 2u * k)) { k++; }
        let p0 = wf(2u + 2u * (k - 1u));
        let span = wf(2u + 2u * k) - p0;
        var t = 1.0;
        if (span > 0.0) { t = (g - p0) / span; }
        let c0 = rgbOf(word(3u + 2u * (k - 1u)));
        let c1 = rgbOf(word(3u + 2u * k));
        rgb = vec3<f32>(lerp(c0.x, c1.x, t), lerp(c0.y, c1.y, t), lerp(c0.z, c1.z, t));
    }
    outp[i] = pack(vec4<f32>(rgb, a));
}
