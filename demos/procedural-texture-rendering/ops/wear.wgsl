// Wear (version 1): the WGSL twin of wear.zig, in two passes. Pass 0 sums the source along each row over the radius
// (the source: the second input's grey as a 15-bit whole number, or the material's height), into tmp; pass 1 sums
// those down the column and draws (cavity, edges, grow), or runs the drips from the source upward. The sums are whole
// numbers held in floats (exact to 2^24 along a row); the native code divides exact 64-bit sums, so far down a large
// radius the two can differ in the last digits, which the eye does not see.
// Bindings: 1 the output, 2 the material, 3 the source (the material again when the graph gives none), 4 tmp.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read> in1: array<vec2<u32>>;
@group(0) @binding(4) var<storage, read_write> tmp: array<f32>;

fn src(i: u32) -> f32 {
    if (u.nin >= 2u) { return floor(greyOf(in1[i]) * 32767.0 + 0.5); }
    return f32(in0[i].y >> 16u);
}
fn clampi(x: i32, n: u32) -> u32 { return u32(min(i32(n) - 1, max(0, x))); }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let kind = wi(1u);
    let radius = wf(2u);
    let lng = wf(3u);
    let lo = wf(4u);
    let hi = wf(5u);
    let amt = wf(6u);
    let col = rgbOf(word(7u));
    let ncells = wi(8u);
    let namt = wf(9u);
    let seed = word(10u);
    let gain = wf(11u);
    let W = u.w;
    let H = u.h;
    let i = id.x;
    let j = id.y;
    let k = j * W + i;
    let p = pxs();
    if (u.pas == 0u) {
        if (kind == 2) { return; }
        let r = i32(floor(radius / p + 0.5));
        var s = 0.0;
        for (var d = -r; d <= r; d++) { s += src(j * W + clampi(i32(i) + d, W)); }
        tmp[k] = s;
        return;
    }
    var t: f32;
    if (kind == 2) {
        let L = u32(floor(lng / p + 0.5));
        var best = 0.0;
        for (var kk = 0u; kk <= L && kk <= j; kk++) {
            let sv = src((j - kk) * W + i) / 32767.0;
            let f = sv * (1.0 - f32(kk) / f32(L + 1u));
            if (f > best) { best = f; }
        }
        let colf = 1.0 + namt * gnoise(cu(i) * f32(ncells), 0.5, ncells, 1, seed);
        t = best * colf * gain;
    } else {
        let r = i32(floor(radius / p + 0.5));
        var s = 0.0;
        for (var d = -r; d <= r; d++) { s += tmp[clampi(i32(j) + d, H) * W + i]; }
        let n = f32((2 * r + 1) * (2 * r + 1));
        let b = s / n;
        let sv = src(k);
        let nz = namt * fbm(cu(i), cv(j), ncells, ncells, 3u, 0.5, seed, 0u);
        if (kind == 0) { t = (b - sv) / 32767.0 * gain + nz; }
        else if (kind == 1) { t = (sv - b) / 32767.0 * gain + nz; }
        else { t = b / 32767.0 * gain + nz; }
    }
    let m = ss(lo, hi, t) * amt;
    let o = unpack(in0[k]);
    outp[k] = pack(vec4<f32>(lerp(o.x, col.x, m), lerp(o.y, col.y, m), lerp(o.z, col.z, m), o.w));
}
