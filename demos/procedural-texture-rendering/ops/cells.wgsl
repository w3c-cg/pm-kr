// Cells (versions 1 and 2): the WGSL twin of cells.zig. Bindings: 1 the output.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let ver = word(0u);
    let kind = wi(1u);
    let nx = wi(2u);
    let ny = wi(3u);
    let jit = wf(4u);
    let width0 = wf(5u);
    let warp = wf(6u);
    let wfc = wi(7u);
    let seed = word(8u);
    let vary = wf(9u);
    var wvar = 0.0;
    var wcl = 1;
    if (ver >= 2u) { wvar = wf(10u); wcl = wi(11u); }
    let fnx = f32(nx);
    let fny = f32(ny);
    let sx = sqrt(fnx * fny) / fnx;
    let sy = sqrt(fnx * fny) / fny;
    let p = warped(cu(id.x), cv(id.y), warp, wfc, seed ^ 0x2c1bu);
    let X = p.x * fnx;
    let Y = p.y * fny;
    let cx = i32(floor(X));
    let cy = i32(floor(Y));
    var d1 = 1e9;
    var d2 = 1e9;
    var id1 = 0u;
    for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
            let gx = cx + dx;
            let gy = cy + dy;
            let h = hash3(wrapi(gx, nx), wrapi(gy, ny), seed);
            let ox = 0.5 + jit * (rnd01(h) - 0.5);
            let oy = 0.5 + jit * (rnd01(hash(h ^ 0x68e31da4u)) - 0.5);
            let ex = (f32(gx) + ox - X) * sx;
            let ey = (f32(gy) + oy - Y) * sy;
            let d = sqrt(ex * ex + ey * ey);
            if (d < d1) { d2 = d1; d1 = d; id1 = h; } else if (d < d2) { d2 = d; }
        }
    }
    let cellv = rnd01(hash(id1 ^ 0x1b873593u));
    let shade = 1.0 - vary + vary * cellv;
    var width = width0;
    if (wvar > 0.0) { width = width0 * max(0.05, 1.0 + wvar * fbmAll(p.x, p.y, wcl, wcl, 3u, 0.5, seed ^ 0x3c3cu)); }
    var g: f32;
    if (kind == 0) {
        g = ss(0.0, width, d2 - d1);
    } else if (kind == 1) {
        let gap = ss(0.0, width, d2 - d1);
        let dome = 1.0 - clamp01(d1 * d1);
        g = shade * gap * (0.35 + 0.65 * dome);
    } else {
        g = shade;
    }
    outp[id.y * u.w + id.x] = pack(vec4<f32>(g, g, g, g));
}
