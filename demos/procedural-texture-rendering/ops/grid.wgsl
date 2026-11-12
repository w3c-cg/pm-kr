// Grid (version 1): the WGSL twin of grid.zig. WebGPU lets a shader stage bind eight storage buffers by default, and
// a Grid has up to sixteen procedures, so the page runs one pass per tile (u.pas = the tile), each adding that tile's
// share into a picture of 32-bit sums (binding 3), in the native loop's order; a last pass (u.pas = the tile count)
// adds the means' field (smooth) or scales (keep) and quantises to the output (binding 1). Binding 2 is the tile's
// procedure, drawn on its own canvas of the output's side and margin.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> tile: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read_write> acc: array<vec4<f32>>;

// along one direction of n tiles: the tile t lies in and its weight, the neighbour across the nearer border and its
fn ownG(t: f32, b: f32, seam: i32, n: i32) -> vec4<f32> {
    let k = i32(floor(t));
    let f = t - floor(t);
    var own = 1.0;
    var nb = wrapi(k, n);
    if (seam != 0 && b > 0.0) {
        if (f < b) { own = 0.5 + 0.5 * ss(0.0, 1.0, f / b); nb = wrapi(k - 1, n); }
        else if (1.0 - f < b) { own = 0.5 + 0.5 * ss(0.0, 1.0, (1.0 - f) / b); nb = wrapi(k + 1, n); }
    }
    return vec4<f32>(f32(wrapi(k, n)), own, f32(nb), 1.0 - own);
}
// the weight of tile index c along one direction
fn wOf(g: vec4<f32>, c: i32) -> f32 {
    var w = 0.0;
    if (i32(g.x) == c) { w += g.y; }
    if (i32(g.z) == c) { w += g.w; }
    return w;
}
// the smooth seam's field: the two tile centres around t and the weight of the second
fn centG(t: f32, n: i32) -> vec4<f32> {
    let s = t - 0.5;
    let a = ss(0.0, 1.0, s - floor(s));
    let k = i32(floor(s));
    return vec4<f32>(f32(wrapi(k, n)), 1.0 - a, f32(wrapi(k + 1, n)), a);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let k = id.y * u.w + id.x;
    let cols = wi(1u);
    let rows = wi(2u);
    let seam = wi(3u);
    let band = wf(4u);
    let nt = cols * rows;
    let ty = f32(rows) * cv(id.y);
    let tx = f32(cols) * cu(id.x);
    let gy = ownG(ty, f32(rows) * band, seam, rows);
    let gx = ownG(tx, f32(cols) * band, seam, cols);
    let q = i32(u.pas);
    if (q < nt) {
        var a = acc[k];
        if (q == 0) { a = vec4<f32>(0.0, 0.0, 0.0, 0.0); }
        let wq = wOf(gy, q / cols) * wOf(gx, q % cols);
        if (wq != 0.0) {
            let p = unpack(tile[k]);
            if (seam == 3 || seam == 2) {
                let mq = rgbOf(word(5u + u32(q)));
                a = vec4<f32>(a.xyz + wq * (p.xyz - mq), a.w + wq * p.w);
            } else {
                a = a + wq * p;
            }
        }
        acc[k] = a;
        return;
    }
    var o = acc[k];
    if (seam == 3) {
        let my = centG(ty, rows);
        let mx = centG(tx, cols);
        var mu = vec3<f32>(0.0, 0.0, 0.0);
        for (var t = 0; t < nt; t++) {
            let mw = wOf(my, t / cols) * wOf(mx, t % cols);
            if (mw == 0.0) { continue; }
            mu += mw * rgbOf(word(5u + u32(t)));
        }
        o = vec4<f32>(o.xyz + mu, o.w);
    } else if (seam == 2) {
        var s2 = 0.0;
        var mu = vec3<f32>(0.0, 0.0, 0.0);
        for (var t = 0; t < nt; t++) {
            let wq = wOf(gy, t / cols) * wOf(gx, t % cols);
            s2 += wq * wq;
            if (wq == 0.0) { continue; }
            mu += wq * rgbOf(word(5u + u32(t)));
        }
        o = vec4<f32>(mu + o.xyz * (1.0 / sqrt(s2)), o.w);
    }
    outp[k] = pack(o);
}
