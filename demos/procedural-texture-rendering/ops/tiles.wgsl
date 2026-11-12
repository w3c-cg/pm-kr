// Tiles (versions 1 to 3): the WGSL twin of tiles.zig. Bindings: 1 the output.
@group(0) @binding(1) var<storage, read_write> outp: array<vec2<u32>>;

fn len2(x: f32, y: f32) -> f32 { return sqrt(x * x + y * y); }
fn roundBox(px: f32, py: f32, bx: f32, by: f32, r: f32) -> f32 {
    let qx = abs(px) - bx + r;
    let qy = abs(py) - by + r;
    return len2(max(qx, 0.0), max(qy, 0.0)) + min(max(qx, qy), 0.0) - r;
}
fn rhombus(px: f32, py: f32, bx: f32, by: f32) -> f32 {
    let qx = abs(px);
    let qy = abs(py);
    let ndot = bx * (bx - 2.0 * qx) - by * (by - 2.0 * qy);
    let h = min(1.0, max(-1.0, ndot / (bx * bx + by * by)));
    let d = len2(qx - 0.5 * bx * (1.0 - h), qy - 0.5 * by * (1.0 + h));
    let s = qx * by + qy * bx - bx * by;
    return select(d, -d, s < 0.0);
}
fn ffloor(x: f32) -> f32 { return floor(x); }

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if (id.x >= u.w || id.y >= u.h) { return; }
    let ver = word(0u);
    let lay = wi(1u);
    let nx = wi(2u);
    let ny = wi(3u);
    let bond = wf(4u);
    let joint = wf(5u);
    let bevel = wf(6u);
    let round_ = wf(7u);
    let jit = wf(8u);
    let vary = wf(9u);
    let seed = word(10u);
    let warp = wf(11u);
    let wfc = wi(12u);
    let floor_ = wf(13u);
    let size = wf(14u);
    let phx = wf(15u);
    let phy = wf(16u);
    var chip = 0.0; var ccells = 1; var grain = 0.0; var gcells = 1; var goct = 1u; var stain = 0.0; var scells = 1;
    if (ver >= 2u) {
        chip = wf(17u); ccells = wi(18u); grain = wf(19u); gcells = wi(20u); goct = word(21u); stain = wf(22u); scells = wi(23u);
    }
    var hollow = 0.0; var sox = 0.5; var soy = 0.5; var inner = 0.33;
    if (ver >= 3u) { hollow = wf(24u); sox = wf(25u); soy = wf(26u); inner = wf(27u); }
    let fnx = f32(nx);
    let fny = f32(ny);
    let cw = 1.0 / fnx;
    let ch = 1.0 / fny;
    let m = min(cw, ch);
    let jw = joint * m;
    let bw = bevel * m;
    let rr = round_ * m;
    let p = warped(cu(id.x), cv(id.y), warp, wfc, seed ^ 0x7a11u);
    let X = p.x * fnx - phx;
    let Y = p.y * fny - phy;
    var sd = 1.0;
    var cid = 0u;
    var parity = 0.0;
    var insert = false;
    if (lay <= 2) {
        let row = i32(floor(Y));
        var Xs = X;
        if (lay == 1) { Xs = X - bond * f32(row); }
        let col = i32(floor(Xs));
        let fx = Xs - floor(Xs);
        let fy = Y - floor(Y);
        cid = hash3(wrapi(col, nx), wrapi(row, ny), seed);
        parity = f32(((col + row) % 2 + 2) % 2);
        let jx = jit * m * (rnd01(hash(cid ^ 0x11u)) - 0.5);
        let jy = jit * m * (rnd01(hash(cid ^ 0x22u)) - 0.5);
        let sh = jit * m * rnd01(hash(cid ^ 0x33u));
        sd = roundBox((fx - 0.5) * cw - jx, (fy - 0.5) * ch - jy, 0.5 * (cw - jw) - sh, 0.5 * (ch - jw) - sh, rr);
    } else if (lay == 3) {
        let r0 = i32(floor(Y));
        var d1 = 1e9;
        var d2 = 1e9;
        for (var dr = -1; dr <= 2; dr++) {
            let r = r0 + dr;
            let off = select(0.0, 0.5, ((r % 2) + 2) % 2 == 1);
            let k0 = i32(floor(X - off));
            for (var dk = -1; dk <= 2; dk++) {
                let k = k0 + dk;
                let ex = (f32(k) + off + 0.5 - X) * cw;
                let ey = (f32(r) + 0.5 - Y) * ch;
                let d = len2(ex, ey);
                if (d < d1) { d2 = d1; d1 = d; cid = hash3(wrapi(k, nx), wrapi(r, ny), seed); } else if (d < d2) { d2 = d; }
            }
        }
        sd = -(0.5 * (d2 - d1)) + 0.5 * jw + jit * m * rnd01(hash(cid ^ 0x33u));
    } else if (lay == 4) {
        let col = i32(floor(X));
        let row = i32(floor(Y));
        cid = hash3(wrapi(col, nx), wrapi(row, ny), seed);
        let lx = (X - floor(X) - 0.5) * cw;
        let ly = (Y - floor(Y) - 0.5) * ch;
        let s = select(-1.0, 1.0, ((col + row) % 2 + 2) % 2 == 0);
        let ax = 0.70710678 * (lx + s * ly);
        let ay = 0.70710678 * (ly - s * lx);
        let half = 0.5 * size * len2(cw, ch);
        sd = rhombus(ax, ay, half, half * round_) + 0.5 * jw;
    } else if (lay == 5) {
        let col = i32(floor(X));
        let row = i32(floor(Y));
        cid = hash3(wrapi(col, nx), wrapi(row, ny), seed);
        let lx = (X - floor(X) - 0.5) * cw;
        let ly = (Y - floor(Y) - 0.5) * ch;
        sd = len2(lx, ly) - 0.5 * size * m * (1.0 - jit * rnd01(hash(cid ^ 0x33u)));
    } else if (lay == 6 || lay == 8) {
        let col = i32(floor(X));
        let row = i32(floor(Y));
        let fx = X - floor(X);
        let fy = Y - floor(Y);
        let ccol = select(col + 1, col, fx < 0.5);
        let crow = select(row + 1, row, fy < 0.5);
        let qx = select(fx - 1.0, fx, fx < 0.5) * cw;
        let qy = select(fy - 1.0, fy, fy < 0.5) * ch;
        var dins: f32;
        if (lay == 6) { dins = 0.70710678 * (abs(qx) + abs(qy) - 0.5 * size * m); } else { dins = max(abs(qx), abs(qy)) - 0.5 * size * m; }
        let tile = roundBox((fx - 0.5) * cw, (fy - 0.5) * ch, 0.5 * (cw - jw), 0.5 * (ch - jw), rr);
        let tile_cut = max(tile, -(dins - jw));
        if (dins < tile_cut) {
            sd = dins;
            insert = true;
            cid = hash3(wrapi(ccol, nx), wrapi(crow, ny), seed ^ 0x5151u);
        } else {
            sd = tile_cut;
            cid = hash3(wrapi(col, nx), wrapi(row, ny), seed);
        }
    } else if (lay == 9) {
        let col = i32(floor(X));
        let row = i32(floor(Y));
        let half = 0.5 * size * len2(cw, ch);
        var best = 1e9;
        for (var dr = -1; dr <= 1; dr++) {
            for (var dk = -1; dk <= 1; dk++) {
                for (var sdi = 0u; sdi < 2u; sdi++) {
                    let s = select(-1.0, 1.0, sdi == 0u);
                    let ox = select(0.5 + sox, 0.5, sdi == 0u);
                    let oy = select(0.5 + soy, 0.5, sdi == 0u);
                    let lx = (X - (f32(col + dk) + ox)) * cw;
                    let ly = (Y - (f32(row + dr) + oy)) * ch;
                    let ax = 0.70710678 * (lx + s * ly);
                    let ay = 0.70710678 * (ly - s * lx);
                    let d = rhombus(ax, ay, half, half * round_) + 0.5 * jw;
                    if (d < best) { best = d; cid = hash3(wrapi(col + dk, nx), wrapi(row + dr, ny), seed ^ (sdi * 0x2b7eu)); }
                }
            }
        }
        sd = best;
    } else if (lay == 10) {
        let col = i32(floor(X));
        let row = i32(floor(Y));
        let fx = X - floor(X);
        let fy = Y - floor(Y);
        let ccol = select(col + 1, col, fx < 0.5);
        let crow = select(row + 1, row, fy < 0.5);
        let qx = select(fx - 1.0, fx, fx < 0.5) * cw;
        let qy = select(fy - 1.0, fy, fy < 0.5) * ch;
        let dins = max(abs(qx), abs(qy)) - 0.5 * size * m;
        let tile = roundBox((fx - 0.5) * cw, (fy - 0.5) * ch, 0.5 * (cw - jw), 0.5 * (ch - jw), rr);
        let lx = abs((fx - 0.5) * cw);
        let ly = abs((fy - 0.5) * ch);
        let a = 0.5 * inner * m;
        let mx = max(lx, ly);
        var part = 0u;
        var dint = 0.0;
        if (mx <= a) {
            dint = a - mx;
        } else {
            dint = min(mx - a, 0.70710678 * abs(lx - ly));
            if (ly >= lx) { part = select(2u, 1u, fy < 0.5); } else { part = select(4u, 3u, fx < 0.5); }
        }
        let piece = max(tile, -(dint - 0.5 * jw));
        let tile_cut = max(piece, -(dins - jw));
        if (dins < tile_cut) {
            sd = dins;
            insert = true;
            cid = hash3(wrapi(ccol, nx), wrapi(crow, ny), seed ^ 0x5151u);
        } else {
            sd = tile_cut;
            cid = hash3(wrapi(col, nx), wrapi(row, ny), seed ^ (part * 0x9e37u));
        }
    } else {
        let row = i32(floor(Y));
        let rh = hash3(0, wrapi(row, ny), seed ^ 0x4242u);
        let Xs = X - 8.0 * rnd01(rh);
        let k0 = i32(floor(Xs));
        var lo = k0;
        var hi = k0 + 1;
        var n = 0;
        while (n < 8 && rnd01(hash3(wrapi(lo, nx), wrapi(row, ny), seed ^ 0x9191u)) >= size) { n++; lo -= 1; }
        n = 0;
        while (n < 8 && rnd01(hash3(wrapi(hi, nx), wrapi(row, ny), seed ^ 0x9191u)) >= size) { n++; hi += 1; }
        let span = f32(hi - lo);
        let fx = (Xs - f32(lo)) / span;
        let fy = Y - floor(Y);
        cid = hash3(wrapi(lo, nx), wrapi(row, ny), seed);
        let sh = jit * m * rnd01(hash(cid ^ 0x33u));
        sd = roundBox((fx - 0.5) * cw * span, (fy - 0.5) * ch, 0.5 * (cw * span - jw) - sh, 0.5 * (ch - jw) - sh, rr);
    }
    if (chip > 0.0 && !insert) {
        let cn = fbm(p.x, p.y, ccells, ccells, 3u, 0.5, seed ^ 0xc41bu, 0u);
        sd += chip * m * clamp01(2.0 * cn);
    }
    let r = rnd01(hash(cid ^ 0x1b873593u));
    var cellv: f32;
    if (lay == 2) { cellv = 0.25 + 0.5 * parity + 0.25 * vary * (r - 0.5); } else { cellv = 0.5 + vary * (r - 0.5); }
    var h = ss(0.0, bw, -sd);
    if (ver >= 4u) { h = ss(-0.5 * pxs(), max(bw, 0.5 * pxs()), -sd); }
    var face = select(floor_ + (0.85 - floor_) * clamp01(cellv), 1.0, insert);
    var rough = 0.0;
    if (!insert && (grain > 0.0 || stain > 0.0)) {
        let ox = rnd01(hash(cid ^ 0x6a09e667u));
        let oy = rnd01(hash(cid ^ 0xbb67ae85u));
        if (grain > 0.0) {
            rough = fbm(p.x + ox, p.y + oy, gcells, gcells, goct, 0.6, seed ^ 0x9a11u, 0u);
            face += grain * (0.85 - floor_) * rough;
        }
        if (stain > 0.0) { face += stain * (0.85 - floor_) * fbm(p.x + oy, p.y + ox, scells, scells, 3u, 0.5, seed ^ 0x5a17u, 0u); }
        face = min(0.9, max(floor_, face));
    }
    let g = h * face;
    var hh = h;
    if (insert) { hh = 0.6 * h; } else if (grain > 0.0) { hh = clamp01(h * (1.0 + 0.3 * grain * rough)); }
    if (hollow > 0.0 && !insert) {
        let hj = 0.5 * hollow;
        if (sd >= 0.0) {
            let t = clamp01(1.0 - sd / max(1e-6, 0.5 * jw));
            hh = hj * t * t;
        } else { hh = hj + (1.0 - hj) * hh; }
    }
    outp[id.y * u.w + id.x] = pack(vec4<f32>(g, g, g, hh));
}
