// Quad (version 1): the WGSL twin of quad.zig. Bindings: 1 the output, 2 to 5 the four procedures (top left, top
// right, bottom left, bottom right), each already drawn on its own canvas of the output's side and margin.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read> in1: array<vec2<u32>>;
@group(0) @binding(4) var<storage, read> in2: array<vec2<u32>>;
@group(0) @binding(5) var<storage, read> in3: array<vec2<u32>>;

fn ownQ(t: f32, b: f32, seam: i32) -> f32 {
    if (seam == 0 || b <= 0.0) { return 1.0; }
    let f = t - floor(t);
    if (f < b) { return 0.5 + 0.5 * ss(0.0, 1.0, f / b); }
    if (1.0 - f < b) { return 0.5 + 0.5 * ss(0.0, 1.0, (1.0 - f) / b); }
    return 1.0;
}
fn sideQ(t: f32) -> u32 { return u32(wrapi(i32(floor(t)), 2)); }

fn px(q: u32, k: u32) -> vec4<f32> {
    if (q == 0u) { return unpack(in0[k]); }
    if (q == 1u) { return unpack(in1[k]); }
    if (q == 2u) { return unpack(in2[k]); }
    return unpack(in3[k]);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let k = id.y * u.w + id.x;
    let seam = wi(1u);
    let b = 2.0 * wf(2u);
    let ty = 2.0 * cv(id.y);
    let oy = ownQ(ty, b, seam);
    var wy = vec2<f32>(oy, 1.0 - oy);
    if (sideQ(ty) == 1u) { wy = vec2<f32>(1.0 - oy, oy); }
    let tx = 2.0 * cu(id.x);
    let ox = ownQ(tx, b, seam);
    var wx = vec2<f32>(ox, 1.0 - ox);
    if (sideQ(tx) == 1u) { wx = vec2<f32>(1.0 - ox, ox); }
    var o = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    if (seam == 3) {
        let sx = tx - 0.5;
        let sy = ty - 0.5;
        let ax = ss(0.0, 1.0, sx - floor(sx));
        let ay = ss(0.0, 1.0, sy - floor(sy));
        let cx0 = sideQ(sx);
        let cy0 = sideQ(sy);
        var mu = vec3<f32>(0.0, 0.0, 0.0);
        for (var q = 0u; q < 4u; q++) {
            let fxw = select(ax, 1.0 - ax, q % 2u == cx0);
            let fyw = select(ay, 1.0 - ay, q / 2u == cy0);
            mu += (fxw * fyw) * rgbOf(word(3u + q));
        }
        var d = vec3<f32>(0.0, 0.0, 0.0);
        for (var q = 0u; q < 4u; q++) {
            let wq = wy[q / 2u] * wx[q % 2u];
            if (wq == 0.0) { continue; }
            let p = px(q, k);
            d += wq * (p.xyz - rgbOf(word(3u + q)));
            o.w += wq * p.w;
        }
        o = vec4<f32>(d + mu, o.w);
    } else if (seam == 2) {
        var s2 = 0.0;
        for (var q = 0u; q < 4u; q++) { let wq = wy[q / 2u] * wx[q % 2u]; s2 += wq * wq; }
        let inv = 1.0 / sqrt(s2);
        var mu = vec3<f32>(0.0, 0.0, 0.0);
        var d = vec3<f32>(0.0, 0.0, 0.0);
        for (var q = 0u; q < 4u; q++) {
            let wq = wy[q / 2u] * wx[q % 2u];
            if (wq == 0.0) { continue; }
            let p = px(q, k);
            let mq = rgbOf(word(3u + q));
            mu += wq * mq;
            d += wq * (p.xyz - mq);
            o.w += wq * p.w;
        }
        o = vec4<f32>(mu + d * inv, o.w);
    } else {
        for (var q = 0u; q < 4u; q++) {
            let wq = wy[q / 2u] * wx[q % 2u];
            if (wq == 0.0) { continue; }
            o += wq * px(q, k);
        }
    }
    outp[k] = pack(o);
}
