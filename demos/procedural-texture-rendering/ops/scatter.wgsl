// Scatter (versions 1 and 2): the WGSL twin of scatter.zig. Bindings: 1 the output, 2 the base, 3 the stamp (a seed's
// picture of sw by sh pixels; when the graph gives none, u.nin is 1 and a one-pixel stand-in is bound and not read).
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;
@group(0) @binding(3) var<storage, read> stamp: array<vec2<u32>>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let ver = word(0u);
    let nx = wi(1u);
    let ny = wi(2u);
    let dens = wf(3u);
    let size = wf(4u);
    let svar = wf(5u);
    let turn = wf(6u);
    let jit = wf(7u);
    let col = rgbOf(word(8u));
    let cvar = wf(9u);
    let seed = word(10u);
    let hgt = wf(11u);
    let soft = wf(12u);
    let aspect = wf(13u);
    let opac = wf(14u);
    let phx = wf(15u);
    let phy = wf(16u);
    var ccl = 1; var clu = 0.0; var rough = 0.0; var rcl = 1.0; var core = 0.0;
    if (ver >= 2u) { ccl = wi(17u); clu = wf(18u); rough = wf(19u); rcl = f32(wi(20u)); core = wf(21u); }
    let fnx = f32(nx);
    let fny = f32(ny);
    let cw = 1.0 / fnx;
    let ch = 1.0 / fny;
    let m = min(cw, ch);
    let rmax = size * m * (1.0 + svar) * max(1.0, aspect) * (1.0 + rough);
    let reach = i32(ceil(rmax / m + jit * 0.5 + max(abs(phx), abs(phy))));
    let has_stamp = u.nin >= 2u;
    let vv = cv(id.y);
    let Y = vv * fny - phy;
    let cy = i32(floor(Y));
    let uu = cu(id.x);
    let X = uu * fnx - phx;
    let cx = i32(floor(X));
    let k = id.y * u.w + id.x;
    var o = unpack(in0[k]);
    for (var dy = -reach; dy <= reach; dy++) {
        for (var dx = -reach; dx <= reach; dx++) {
            let gx = cx + dx;
            let gy = cy + dy;
            let h = hash3(wrapi(gx, nx), wrapi(gy, ny), seed);
            var dl = dens;
            if (clu > 0.0) {
                let cuu = (f32(wrapi(gx, nx)) + 0.5) / fnx;
                let cvv = (f32(wrapi(gy, ny)) + 0.5) / fny;
                let f = fbmAll(cuu, cvv, ccl, ccl, 3u, 0.5, seed ^ 0xc105u);
                dl = dens * lerp(1.0, clamp01(0.5 + 2.5 * f), clu);
            }
            if (rnd01(h) >= dl) { continue; }
            let h2 = hash(h ^ 0x2545f491u);
            let h3 = hash(h2 ^ 0x9e3779b9u);
            let h4 = hash(h3 ^ 0x85ebca6bu);
            let h5 = hash(h4 ^ 0xc2b2ae35u);
            let px = (f32(gx) + 0.5 + phx + jit * (rnd01(h2) - 0.5)) * cw;
            let py = (f32(gy) + 0.5 + phy + jit * (rnd01(h3) - 0.5)) * ch;
            let r = size * m * (1.0 + svar * (2.0 * rnd01(h4) - 1.0));
            let sc = sincosTurns(turn * (2.0 * rnd01(h5) - 1.0));
            let ex = uu - px;
            let ey = vv - py;
            let qx = (ex * sc.y + ey * sc.x) / r;
            let qy = (-ex * sc.x + ey * sc.y) / (r * aspect);
            var cov = 0.0;
            var dd_core = 0.0;
            if (has_stamp) {
                let sx = (0.5 + 0.5 * qx) * f32(u.sw) - 0.5;
                let sy = (0.5 + 0.5 * qy) * f32(u.sh) - 0.5;
                if (sx > -1.0 && sy > -1.0 && sx < f32(u.sw) && sy < f32(u.sh)) {
                    let x0 = floor(sx);
                    let y0 = floor(sy);
                    let fx = sx - x0;
                    let fy = sy - y0;
                    let ix = i32(x0);
                    let iy = i32(y0);
                    var acc = 0.0;
                    for (var bb = 0; bb < 2; bb++) {
                        for (var aa = 0; aa < 2; aa++) {
                            let xx = ix + aa;
                            let yy = iy + bb;
                            let wgt = select(fx, 1.0 - fx, aa == 0) * select(fy, 1.0 - fy, bb == 0);
                            if (xx >= 0 && yy >= 0 && xx < i32(u.sw) && yy < i32(u.sh)) {
                                acc += wgt * greyOf(stamp[u32(yy) * u.sw + u32(xx)]);
                            }
                        }
                    }
                    cov = acc;
                }
            } else {
                var dd = sqrt(qx * qx + qy * qy);
                if (rough > 0.0 && dd < 1.0 + rough) {
                    let o1 = 64.0 * rnd01(hash(h5 ^ 0x3c6ef372u));
                    let o2 = 64.0 * rnd01(hash(h5 ^ 0xa54ff53au));
                    let n1 = gnoise(qx * rcl + o1, qy * rcl + o2, 4096, 4096, seed ^ 0x51f1u);
                    let n2 = gnoise(2.0 * qx * rcl + o2, 2.0 * qy * rcl + o1, 4096, 4096, seed ^ 0x1f83u);
                    dd = dd / max(0.2, 1.0 + rough * (0.67 * n1 + 0.33 * n2));
                }
                cov = 1.0 - ss(1.0 - soft, 1.0, dd);
                if (core != 0.0 && cov > 0.0) { dd_core = clamp01(1.0 - dd); }
            }
            if (cov <= 0.0) { continue; }
            let a = cov * opac;
            var shade = 1.0 + cvar * (2.0 * rnd01(hash(h5 ^ 0x27d4eb2fu)) - 1.0);
            if (core != 0.0) { shade *= 1.0 + core * dd_core; }
            o.x = lerp(o.x, clamp01(col.x * shade), a);
            o.y = lerp(o.y, clamp01(col.y * shade), a);
            o.z = lerp(o.z, clamp01(col.z * shade), a);
            o.w = clamp01(o.w + hgt * cov);
        }
    }
    outp[k] = pack(o);
}
