// Shade (versions 1 and 2): the WGSL twin of shade.zig: the slope from one pixel each way, clamped at the canvas's edge;
// version 2 steps toward the light for the cast shadow, as the native one does.
// Bindings: 1 the output, 2 the material.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> in0: array<vec2<u32>>;
// the relief the light reads: the second input where given (version 2), else the first (the page binds it twice)
@group(0) @binding(3) var<storage, read> in1: array<vec2<u32>>;

fn alphaAt(i: u32, j: u32) -> f32 {
    if (word(0u) >= 2u && u.nin >= 2u) { return f32(in1[j * u.w + i].y >> 16u); }
    return f32(in0[j * u.w + i].y >> 16u);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    var lx = wf(1u);
    var ly = wf(2u);
    var lz = wf(3u);
    let depth = wf(4u);
    let k = wf(5u);
    let ln = sqrt(lx * lx + ly * ly + lz * lz);
    lx /= ln;
    ly /= ln;
    lz /= ln;
    let i = id.x;
    let j = id.y;
    let im = select(i, i - 1u, i > 0u);
    let ip = select(i, i + 1u, i + 1u < u.w);
    let jm = select(j, j - 1u, j > 0u);
    let jp = select(j, j + 1u, j + 1u < u.h);
    let stp = 2.0 * pxs();
    let hx = (alphaAt(ip, j) - alphaAt(im, j)) / 32767.0;
    let hy = (alphaAt(i, jp) - alphaAt(i, jm)) / 32767.0;
    let nx = -depth * hx / stp;
    let ny = -depth * hy / stp;
    let nn = sqrt(nx * nx + ny * ny + 1.0);
    let lam = max(0.0, (nx * lx + ny * ly + lz) / nn) / lz;
    var s = 1.0 + k * (lam - 1.0);
    if (word(0u) >= 2u) {
        let shk = wf(6u);
        let shl = wf(7u);
        let shn = wi(8u);
        let lxy = sqrt(lx * lx + ly * ly);
        if (shk > 0.0 && shl > 0.0 && depth > 0.0 && lxy > 1e-6) {
            let dx = lx / lxy;
            let dy = ly / lxy;
            let h0 = alphaAt(i, j) / 32767.0;
            var occ = 0.0;
            for (var st = 1; st <= shn; st++) {
                let dist = shl * f32(st) / f32(shn);
                let pxd = dist / pxs();
                let si = min(f32(u.w - 1u), max(0.0, floor(f32(i) + dx * pxd + 0.5)));
                let sj = min(f32(u.h - 1u), max(0.0, floor(f32(j) + dy * pxd + 0.5)));
                let hs = alphaAt(u32(si), u32(sj)) / 32767.0;
                let ray = h0 + dist / shl;
                occ = max(occ, clamp01((hs - ray) * 20.0));
            }
            s *= 1.0 - shk * occ;
        }
    }
    let col = unpack(in0[j * u.w + i]);
    outp[j * u.w + i] = pack(vec4<f32>(col.x * s, col.y * s, col.z * s, col.w));
}
