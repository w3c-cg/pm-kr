// The WGSL twin of common.zig (ORDER 508, milestone 2c; our code, BSD 2-clause like Farbrausch's tree).
// Every operator's shader is this file followed by its own (noise.wgsl, cells.wgsl, ...). A picture is werkkzeug's:
// per pixel four 15-bit channels in two words, (blue | green << 16, red | alpha << 16), as the native bitmap holds them,
// so every operator quantises its output to 15 bits exactly where the native one does. Places, hashes, noises and the
// polynomial sine are the same arithmetic; a GPU may fuse a multiply and an add or round a division differently, so
// the drawings are judged by eye against the native ones (Daniel: "this is not a dataset, but a graphics thing").

struct U {
    w: u32, h: u32, m: u32, maxoct: u32,      // the canvas: its side with the margin, the margin, the level of detail
    wx: f32, wy: f32, ws: f32, nin: u32,      // the window of the whole picture its inner pixels show; inputs given
    sw: u32, sh: u32, pas: u32, nw: u32,      // a Scatter's stamp size; which pass of a two-pass operator; words
    words: array<vec4<u32>, 8>,               // the operator's parameter words, as the script stores them
};

@group(0) @binding(0) var<uniform> u: U;

fn word(k: u32) -> u32 { return u.words[k / 4u][k % 4u]; }
fn wf(k: u32) -> f32 { return bitcast<f32>(word(k)); }
fn wi(k: u32) -> i32 { return bitcast<i32>(word(k)); }

fn inner() -> f32 { return f32(u.w - 2u * u.m); }
fn pxs() -> f32 { return u.ws / inner(); }
fn cu(i: u32) -> f32 { return u.wx + (f32(i) - f32(u.m) + 0.5) * pxs(); }
fn cv(j: u32) -> f32 { return u.wy + (f32(j) - f32(u.m) + 0.5) * pxs(); }

fn clamp01(x: f32) -> f32 { return min(1.0, max(0.0, x)); }
fn lerp(a: f32, b: f32, t: f32) -> f32 { return a + (b - a) * t; }
fn ss(a: f32, b: f32, x: f32) -> f32 {
    if (b <= a) { return select(0.0, 1.0, x >= a); }
    let t = clamp01((x - a) / (b - a));
    return t * t * (3.0 - 2.0 * t);
}
fn q15(x: f32) -> u32 { return u32(floor(clamp01(x) * 32767.0 + 0.5)); }

// a pixel's colour (red, green, blue, alpha; 0 to 1) from its two words, and back
fn unpack(p: vec2<u32>) -> vec4<f32> {
    return vec4<f32>(f32(p.y & 0xffffu), f32(p.x >> 16u), f32(p.x & 0xffffu), f32(p.y >> 16u)) / 32767.0;
}
fn pack(c: vec4<f32>) -> vec2<u32> {
    return vec2<u32>(q15(c.z) | (q15(c.y) << 16u), q15(c.x) | (q15(c.w) << 16u));
}
// the grey a field operator reads: the mean of red, green and blue, from the 15-bit values
fn greyOf(p: vec2<u32>) -> f32 {
    return (f32(p.x & 0xffffu) + f32(p.x >> 16u) + f32(p.y & 0xffffu)) / (3.0 * 32767.0);
}

// lowbias32 (Chris Wellons, public domain); u32 products wrap in WGSL as in Zig's *%
fn hash(x: u32) -> u32 {
    var h = x;
    h ^= h >> 16u;
    h *= 0x7feb352du;
    h ^= h >> 15u;
    h *= 0x846ca68bu;
    h ^= h >> 16u;
    return h;
}
fn hash3(a: i32, b: i32, s: u32) -> u32 {
    return hash((bitcast<u32>(a) * 0x8da6b343u) ^ hash((bitcast<u32>(b) * 0xd8163841u) ^ hash(s + 0x9e3779b9u)));
}
fn rnd01(h: u32) -> f32 { return f32(h >> 8u) * (1.0 / 16777216.0); }
fn wrapi(i: i32, n: i32) -> i32 { return ((i % n) + n) % n; }

const GR = array<vec2<f32>, 16>(
    vec2<f32>(1.0, 0.0), vec2<f32>(0.92387953, 0.38268343), vec2<f32>(0.70710678, 0.70710678), vec2<f32>(0.38268343, 0.92387953),
    vec2<f32>(0.0, 1.0), vec2<f32>(-0.38268343, 0.92387953), vec2<f32>(-0.70710678, 0.70710678), vec2<f32>(-0.92387953, 0.38268343),
    vec2<f32>(-1.0, 0.0), vec2<f32>(-0.92387953, -0.38268343), vec2<f32>(-0.70710678, -0.70710678), vec2<f32>(-0.38268343, -0.92387953),
    vec2<f32>(0.0, -1.0), vec2<f32>(0.38268343, -0.92387953), vec2<f32>(0.70710678, -0.70710678), vec2<f32>(0.92387953, -0.38268343));

fn fade(t: f32) -> f32 { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

fn gnoise(x: f32, y: f32, px: i32, py: i32, seed: u32) -> f32 {
    let x0 = floor(x);
    let y0 = floor(y);
    let ix = i32(x0);
    let iy = i32(y0);
    let dx = x - x0;
    let dy = y - y0;
    let a0 = wrapi(ix, px);
    let a1 = wrapi(ix + 1, px);
    let b0 = wrapi(iy, py);
    let b1 = wrapi(iy + 1, py);
    let g00 = GR[hash3(a0, b0, seed) & 15u];
    let g10 = GR[hash3(a1, b0, seed) & 15u];
    let g01 = GR[hash3(a0, b1, seed) & 15u];
    let g11 = GR[hash3(a1, b1, seed) & 15u];
    let n00 = g00.x * dx + g00.y * dy;
    let n10 = g10.x * (dx - 1.0) + g10.y * dy;
    let n01 = g01.x * dx + g01.y * (dy - 1.0);
    let n11 = g11.x * (dx - 1.0) + g11.y * (dy - 1.0);
    let uu = fade(dx);
    let vv = fade(dy);
    return 1.41421356 * lerp(lerp(n00, n10, uu), lerp(n01, n11, uu), vv);
}

// kind 0 fbm, 1 ridged, 2 billowed; octaves under two pixels of the canvas, or past its level of detail, left out
fn fbm(uu: f32, vv: f32, fx: i32, fy: i32, oct: u32, gain: f32, seed: u32, kind: u32) -> f32 {
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    let p = pxs();
    for (var k = 0u; k < oct; k++) {
        let mm = 1 << min(k, 20u);
        let cx = fx * mm;
        let cy = fy * mm;
        norm += amp;
        let cell = 1.0 / f32(max(cx, cy));
        if (k < u.maxoct && cell >= 2.0 * p) {
            var n = gnoise(uu * f32(cx), vv * f32(cy), cx, cy, seed + k * 1013u);
            if (kind == 1u) { let r = 1.0 - abs(n); n = r * r; } else if (kind == 2u) { n = abs(n); }
            sum += amp * n;
        } else if (kind != 0u) {
            sum += amp * select(0.3, 0.55, kind == 1u);
        }
        amp *= gain;
    }
    return sum / norm;
}

fn fbmAll(uu: f32, vv: f32, fx: i32, fy: i32, oct: u32, gain: f32, seed: u32) -> f32 {
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    for (var k = 0u; k < oct; k++) {
        let mm = 1 << min(k, 20u);
        let cx = fx * mm;
        let cy = fy * mm;
        norm += amp;
        sum += amp * gnoise(uu * f32(cx), vv * f32(cy), cx, cy, seed + k * 1013u);
        amp *= gain;
    }
    return sum / norm;
}

fn warped(uu: f32, vv: f32, amount: f32, wfc: i32, seed: u32) -> vec2<f32> {
    if (amount == 0.0) { return vec2<f32>(uu, vv); }
    let a = fbm(uu, vv, wfc, wfc, 3u, 0.5, seed ^ 0x51a7u, 0u);
    let b = fbm(uu, vv, wfc, wfc, 3u, 0.5, seed ^ 0x9e37u, 0u);
    return vec2<f32>(uu + amount * a, vv + amount * b);
}

// sine and cosine of an angle in turns by the same polynomial as common.zig
fn sincosTurns(t_in: f32) -> vec2<f32> {
    let t = t_in - floor(t_in + 0.5);
    let x = t * 6.28318531;
    var y = x;
    var flip = false;
    if (y > 1.57079633) { y = 3.14159265 - y; flip = true; } else if (y < -1.57079633) { y = -3.14159265 - y; flip = true; }
    let y2 = y * y;
    let s = y * (1.0 - y2 / 6.0 * (1.0 - y2 / 20.0 * (1.0 - y2 / 42.0 * (1.0 - y2 / 72.0 * (1.0 - y2 / 110.0)))));
    var c = 1.0 - y2 / 2.0 * (1.0 - y2 / 12.0 * (1.0 - y2 / 30.0 * (1.0 - y2 / 56.0 * (1.0 - y2 / 90.0))));
    if (flip) { c = -c; }
    return vec2<f32>(s, c);
}

fn rgbOf(word_: u32) -> vec3<f32> {
    return vec3<f32>(f32((word_ >> 16u) & 0xffu), f32((word_ >> 8u) & 0xffu), f32(word_ & 0xffu)) / 255.0;
}
