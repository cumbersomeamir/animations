// engine.js — Aarambh 15s painted test. Original implementation of the painted-animation skill's grammar
// (pure-function-of-t frames, p5.brush wash + boiling ink, glow, irises, brush wipes, paper + grain),
// written for a 1080×1920 portrait canvas. Inspired by the documented API of ClaudeAnimationBase (MIT); no code executed from it.

const W = 1080, H = 1920, FPS = 30, DUR = 15;
const BPM = 100, BEAT = 60 / BPM, OFF = 0.5;   // beats at 0.5 + 0.6k
const BOIL = 10;                               // ink re-boils 10×/s (every 3 frames at 30 fps)
const TAU = Math.PI * 2;

// Palette: accents sampled from assets/icon.png (#05483A green, #FCF6EE cream, #F0B344 gold); the rest supports them.
const PAL = {
  paper: '#F3EADA', cream: '#FCF6EE', creamDk: '#EADFC9',
  green: '#05483A', greenDk: '#032F26', greenMid: '#2E6A55', sage: '#8DB096', mist: '#CFE0CF',
  gold: '#F0B344', goldDk: '#C98B2A', goldLt: '#F7D58C',
  ink: '#1D2925', inkSoft: '#3F524B',
  clay: '#B8703F', clayDk: '#8C5130', clayLt: '#D89A66', earth: '#D8BE93', earthDk: '#BFA176',
  skin: '#C68B5E', skinDk: '#9A6440', hair: '#2A2420', rose: '#D47766',
  dusk: '#123F35', duskDk: '#0A2C25', duskLt: '#2C5C4E', lamp: '#F6C766', drop: '#8DBBC4',
};

// ---------- pure helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const frac = x => x - Math.floor(x);
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeIn = x => Math.pow(clamp(x), 3);
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const bpOf = t => (t - OFF) / BEAT;
const pulse = (t, k = 6) => t < OFF ? 0 : Math.exp(-frac(bpOf(t)) * k);
const spring = (t, t0, k = 6, w = 18) => t < t0 ? 0 : Math.exp(-k * (t - t0)) * Math.sin(w * (t - t0));
const arcPt = (p0, p1, h, k) => [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k) - h * 4 * k * (1 - k)];
const onTwos = t => Math.floor(t * 15 + 1e-6) / 15;   // 15 drawings/s at 30 fps
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb, e2] = keys[i], k = (e2 || e)((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
const shakeXY = (t, amt) => { const f = Math.floor(t * 30); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };

// ---------- boil: deterministic wobble that changes BOIL times a second ----------
let BOILN = 0, T = 0;
const boilSeed = key => { let h = 2166136261; for (const c of String(key) + '|' + BOILN) h = Math.imul(h ^ c.charCodeAt(0), 16777619); randomSeed(h >>> 0); };
const jit = a => (random() * 2 - 1) * a;

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)], [x + w + jit(j) * .5, y + h / 2],
    [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5], [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) {
  const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p;
}
function ellRot(cx, cy, rx, ry, rot, n = 28, j = 0) {
  const p = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s + jit(j), cy + x * s + y * c + jit(j)]); }
  return p;
}
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], n = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  return p;
}
// The icon's star: four points with concave sides.
function starPts(cx, cy, r, inner = .3, n = 4, rot = -Math.PI / 2) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = rot + i * TAU / n, b = a + Math.PI / n;
    p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    p.push([cx + Math.cos(b) * r * inner, cy + Math.sin(b) * r * inner]);
  }
  return through([...p, p[0]], 4).slice(0, -1);
}
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
function ribbon(P, w0, w1 = w0) {
  const Cv = through(P), n = Cv.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = Cv[Math.max(0, i - 1)], b = Cv[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / Math.max(1, n - 1)) / 2;
    L.push([Cv[i][0] - dy / d * w, Cv[i][1] + dx / d * w]); R.push([Cv[i][0] + dy / d * w, Cv[i][1] - dx / d * w]);
  }
  return L.concat(R.reverse());
}
function heartPts(cx, cy, r) {
  const p = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); p.push([cx + x * r / 17, cy - y * r / 17]); } return p;
}
const okPts = P => P.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));

// ---------- paint (every shape drawn around its own centre: p5.brush drops strokes far from the origin when zoomed) ----------
function centred(pts, draw) {
  if (!pts.length || !okPts(pts)) return;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  push(); translate(cx, cy); draw(pts.map(([x, y]) => [x - cx, y - cy])); pop();
}
function paint(pts, o = {}) { centred(pts, P => paintAt(P, o)); }
function paintAt(pts, o) {
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(o.wash, o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(o.fill, o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', o.hatch.c || PAL.ink, o.hatch.w || 1); } else brush.noHatch();
    brush.noStroke();
    if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); }
    else brush.polygon(pts);
  }
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', o.ink || PAL.ink, o.sw ?? 1);
    brush.beginShape(o.curv || 0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) {
  centred(pts, P => { brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, col, sw); brush.spline(P, curv); });
}

// p5.brush defers its layers; a tiny off-screen fill forces everything so far to land before raw p5 draws (glow, images).
function flushBrush() {
  push(); resetMatrix(); translate(-W / 2, -H / 2);
  brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill('#000000', 1); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-50, -50], [-40, -50], [-40, -40]]); brush.noFill(); pop();
}
// Additive light (the one non-pigment mark), so gold on green stays gold.
let glowTex = null;
function glow(x, y, r, col = PAL.lamp, a = 1) {
  if (a <= 0 || r < 1) return;
  flushBrush();
  const c = color(col), rr = r * (1 + jit(.03));
  push(); blendMode(ADD); tint(red(c), green(c), blue(c), 150 * clamp(a)); image(glowTex, x - rr, y - rr, 2 * rr, 2 * rr); noTint(); blendMode(BLEND); pop();
}
function makeGlowTex() {
  const g = createGraphics(256, 256); g.pixelDensity(1); const c = g.drawingContext, gr = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  [[0, 1], [.18, .8], [.45, .32], [.75, .08], [1, 0]].forEach(([s, a]) => gr.addColorStop(s, `rgba(255,255,255,${a})`));
  c.fillStyle = gr; c.fillRect(0, 0, 256, 256); return g;
}
// A raw image (the verified app icon) composited between paint layers.
function placeImage(img, x, y, w, h, rot = 0) {
  flushBrush();
  push(); translate(x, y); rotate(rot); imageMode(CENTER); image(img, 0, 0, w, h); imageMode(CORNER); pop();
}

// ---------- camera ----------
let CAM = null, LAST_CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = LAST_CAM = { cx, cy, zoom, rot }; }
function camEnd() { pop(); CAM = null; }
function toScreen(x, y, cam = CAM) {
  if (!cam) return [x, y];
  const c = Math.cos(cam.rot), s = Math.sin(cam.rot), dx = (x - cam.cx) * cam.zoom, dy = (y - cam.cy) * cam.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- full-frame transitions (screen space) ----------
function irisShape(pts, col = PAL.green, far = 5000) {
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  const out = p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; return [cx + dx / d * far, cy + dy / d * far]; };
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], ex = (b[0] - a[0]) * .06, ey = (b[1] - a[1]) * .06;
    const a2 = [a[0] - ex, a[1] - ey], b2 = [b[0] + ex, b[1] + ey];
    paint([a2, b2, out(b2), out(a2)], { wash: col, washOp: 255, ink: null });
  }
}
function iris(cx, cy, r, col = PAL.green) { if (r < 4) paint(rectPts(-80, -80, W + 160, H + 160), { wash: col, ink: null }); else irisShape(ellPts(cx, cy, r, r, 40), col); }
// Fat painted strokes sweep across (p 0→.5 covers), then drag off (p .5→1). Cut under full cover at p = .5.
function brushWipe(p, cols = [PAL.green, PAL.greenMid], acc = PAL.gold) {
  if (p <= 0 || p >= 1) return;
  const n = 7, bh = (H + 500) / n + 50;
  push(); translate(W / 2, H / 2); rotate(-.16); translate(-W / 2, -H / 2);
  for (let i = 0; i < n; i++) {
    boilSeed('wipe' + i);
    const y0 = -260 + i * (H + 500) / n, d = [0, .12, .05, .17, .08, .14, .03][i];
    const q = p < .5 ? easeOut(clamp((p * 2 - d) / (1 - d))) : ease(clamp(((p - .5) * 2 - d) / (1 - d)));
    const x0 = p < .5 ? -320 : lerp(-320, W + 420, q), x1 = p < .5 ? lerp(-320, W + 420, q) : W + 420;
    if (x1 - x0 < 30) continue;
    const pts = [], rag = k => 40 + 50 * hash(i * 31 + k) + jit(10);
    for (let k = 0; k <= 8; k++) pts.push([lerp(x0, x1, k / 8), y0 + Math.sin(k * .9 + i) * 16 + jit(5)]);
    for (let k = 1; k < 9; k++) pts.push([x1 + rag(k) - 40, y0 + bh * k / 9]);
    for (let k = 8; k >= 0; k--) pts.push([lerp(x0, x1, k / 8), y0 + bh + Math.sin(k * .8 + i * 2) * 16 + jit(5)]);
    if (p >= .5) for (let k = 8; k > 0; k--) pts.push([x0 - rag(k + 20) + 40, y0 + bh * k / 9]);
    const c1 = cols[i % 2], c2 = cols[(i + 1) % 2];
    paint(pts, { wash: c1, washOp: 255, fill: c2, fillOp: 60, bleed: .05, tex: .8, border: .6, ink: null,
      hatch: i % 3 === 1 ? { d: 46, a: 0, o: { rand: .6, gradient: .5 }, b: 'charcoal', c: acc, w: .9 } : undefined });
  }
  pop();
}

// ---------- lettering (only where the request asks: captions + end card). Composited under the grain. ----------
let LETTERS = [];
function letter(txt, x, y, size, col, o = {}) {
  if (CAM && !o.screen) { [x, y] = toScreen(x, y); size *= CAM.zoom; }
  LETTERS.push({ txt, x, y, size, col, ...o });
}
function drawLetters(c) {
  for (const L of LETTERS) {
    const k = L.pop != null ? backOut(L.pop) : 1; if (k <= .01) continue;
    c.save(); c.translate(L.x, L.y); c.rotate(L.rot || 0); c.scale(k, k); c.globalAlpha = clamp(L.alpha ?? 1);
    c.font = `700 ${L.size}px Kalam, "Comic Sans MS", cursive`; c.textAlign = L.align || 'center'; c.textBaseline = 'middle';
    if (L.shadow !== false) { c.fillStyle = 'rgba(29,41,37,.35)'; c.fillText(L.txt, L.size * .03, L.size * .05); }
    c.fillStyle = L.col; c.fillText(L.txt, 0, 0);
    c.restore();
  }
}

// ---------- paper + grain ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
let paperG = null, grainC = null, outC = null, outX = null;
function makePaper() {
  const g = createGraphics(W, H); g.pixelDensity(1); const c = g.drawingContext, rnd = lcg(23);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 420, gr = c.createRadialGradient(x, y, 0, x, y, r), a = .045 * rnd(); gr.addColorStop(0, `rgba(150,120,80,${a})`); gr.addColorStop(1, 'rgba(150,120,80,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 1500; i++) { const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 26, a = rnd() * TAU; c.strokeStyle = `rgba(105,88,60,${.03 + rnd() * .05})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lcg(9);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .55 ? rnd() * rnd() * 30 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H * .48, W * .55, W / 2, H / 2, H * .72); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(110,90,60,.30)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}

// ---------- brushes ----------
function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 235, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 230, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}

// ---------- shots ----------
const SHOTS = [];
function shots(list) { SHOTS.push(...list); SHOTS.sort((a, b) => a[0] - b[0]); }
function drawWorld(t) {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++;
  const t0 = SHOTS[i][0], end = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : DUR;
  SHOTS[i][1](t, t - t0, end - t0);
  CAM = null;
}

// ---------- frame loop + render hooks ----------
let ICON = null;
async function setup() {
  createCanvas(W, H, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(5); defineBrushes();
  paperG = makePaper(); grainC = makeGrain(); glowTex = makeGlowTex();
  ICON = await loadImage('assets/icon.png');
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  await document.fonts.load('700 80px Kalam');
  window.ready = true;
}
function draw() {
  if (!window.ready) return;
  LETTERS = []; CAM = LAST_CAM = null;
  push(); translate(-W / 2, -H / 2);
  BOILN = Math.floor(T * BOIL + 1e-6); boilSeed('frame'); noiseSeed(77);
  image(paperG, 0, 0);
  drawWorld(T);
  pop();
}
function composite() {
  const c = outX;
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.drawImage(drawingContext.canvas, 0, 0, W, H);
  drawLetters(c);
  c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0);
  c.globalCompositeOperation = 'source-over';
}
window.renderAt = async (t, type = 'image/jpeg', q = .94) => { T = t; await redraw(); composite(); return outC.toDataURL(type, q); };
window.renderSheet = async (times, cols = 4, w = 270, crop = null) => {
  const [, , cw, ch] = crop || [0, 0, W, H], h = Math.round(w * ch / cw), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); T = times[i]; await redraw(); composite(); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h, [cx, cy] = crop || [0, 0];
    c.drawImage(outC, cx, cy, cw, ch, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.65)'; c.fillRect(x, y, 74, 22); c.fillStyle = '#fff'; c.font = '14px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 5, y + 16);
  }
  return { url: sc.toDataURL('image/jpeg', .9), ms };
};
