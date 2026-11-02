// NutriAI 10 s style test, S02 Copperplate Engraving (original code; art direction only from the public STYLE.md).
// Dark leaf-green plate, pale "ink" burin lines that swell/taper and follow the mango's form; contour hatching grows,
// radial flesh fibres, then a transparent mango wash; a double-ruled magnifier roundel uncovers the two USDA facts.
// Stop motion: 150 unique frames at 15 fps, each held twice -> 300 frames at 30 fps.
// Usage: node render.mjs [--still f1,f2]   (f = 30 fps frame index)
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const here = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.resolve(here, '../../../../source/package.json'));
const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const FONTS = path.resolve(here, '../../../../source/fonts');
GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-Black.otf'), 'NDisplay');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-SemiBold.otf'), 'NText');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Bold.otf'), 'NText');
const icon = await loadImage(path.resolve(here, '../../../../assets/icon.png'));

const W = 1080, H = 1920, FPS = 30, N = 300;
const PAPER = '#0E1611', INK = '#E8E2CC', LEAF = '#5AB626', LIME = '#A6E955', MIST = '#EDF6E5';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (f, a, b) => clamp((f - a) / (b - a));
const eo = (t) => 1 - Math.pow(1 - t, 3);
function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---- mango cross-section geometry (plate space; centre CX,CY) ----
const CX = 540, CY = 1050, RX = 330, RY = 235;
// kidney outline radius as a function of angle; k<1 gives inset contours that follow the form
function outline(th, k = 1) {
  const bulge = 1 + 0.10 * Math.cos(th - 0.6) - 0.06 * Math.cos(2 * th + 0.3) + 0.05 * Math.sin(3 * th);
  const x = Math.cos(th) * RX * bulge * k, y = Math.sin(th) * RY * bulge * k;
  return [CX + x + (1 - k) * 18, CY + y - 0.10 * (x * x) / RX * k + (1 - k) * 10];
}
// tone 0..1 from upper-left light ("pillow" shading on the section) -> line families switch on by threshold
function tone(x, y) {
  const dx = (x - CX) / RX, dy = (y - CY) / RY;
  const r = Math.hypot(dx, dy);
  return clamp(0.15 + 0.55 * (dx * 0.55 + dy * 0.75) * 0.9 + 0.5 * Math.pow(r, 3));
}
// swelling/tapering burin stroke along a polyline (style: w*(0.2+0.8*sin(pi u)^0.7), tapered ends)
function burin(g, pts, w, col, reveal = 1, jit = null) {
  const n = pts.length;
  const m = Math.max(2, Math.floor(n * reveal));
  g.strokeStyle = col;
  g.lineCap = 'round';
  for (let i = 1; i < m; i++) {
    const u = i / (n - 1);
    const sw = 0.2 + 0.8 * Math.pow(Math.sin(Math.PI * u), 0.7);
    const t = tone(pts[i][0], pts[i][1]);
    g.lineWidth = Math.max(0.35, w * sw * (0.55 + 0.9 * t));
    g.beginPath();
    const a = pts[i - 1], b = pts[i];
    const jx = jit ? (jit() - 0.5) * 0.6 : 0, jy = jit ? (jit() - 0.5) * 0.6 : 0;
    g.moveTo(a[0] + jx, a[1] + jy);
    g.lineTo(b[0] + jx, b[1] + jy);
    g.stroke();
  }
}
function polyOutline(k, t0 = 0, t1 = Math.PI * 2, n = 220) {
  const p = [];
  for (let i = 0; i <= n; i++) p.push(outline(t0 + (t1 - t0) * (i / n), k));
  return p;
}
const SEED = { cx: CX + 20, cy: CY + 5, rx: 150, ry: 62, rot: -0.12 };
function inSeed(x, y) {
  const c = Math.cos(-SEED.rot), s = Math.sin(-SEED.rot);
  const dx = (x - SEED.cx) * c - (y - SEED.cy) * s, dy = (x - SEED.cx) * s + (y - SEED.cy) * c;
  return (dx * dx) / (SEED.rx * SEED.rx) + (dy * dy) / (SEED.ry * SEED.ry) < 1;
}

// pre-generate line families (deterministic)
const CONTOURS = [];   // family 1: form-following contours (flesh)
for (let k = 0.94; k > 0.18; k -= 0.028) {
  const p = polyOutline(k, 0, Math.PI * 2, 260).filter(([x, y]) => !inSeed(x, y));
  // split where the seed interrupts
  const runs = []; let cur = [];
  for (const q of polyOutline(k, 0, Math.PI * 2, 260)) { if (inSeed(q[0], q[1])) { if (cur.length > 3) runs.push(cur); cur = []; } else cur.push(q); }
  if (cur.length > 3) runs.push(cur);
  CONTOURS.push({ k, runs });
}
const FIBRES = [];     // family 2: radial flesh fibres from the seed outward, only in darker tone
{
  const r = rng(7);
  for (let i = 0; i < 150; i++) {
    const th = (i / 150) * Math.PI * 2 + r() * 0.02;
    const pts = [];
    for (let s = 0; s <= 40; s++) {
      const k = 0.3 + 0.62 * (s / 40);
      const [x, y] = outline(th + Math.sin(s * 0.2 + i) * 0.015, k);
      if (!inSeed(x, y) && tone(x, y) > 0.45) pts.push([x, y]);
    }
    if (pts.length > 5) FIBRES.push(pts);
  }
}
const SEEDLINES = [];  // family 3: tight parallel hatching inside the seed (darkest)
for (let y = SEED.cy - SEED.ry; y <= SEED.cy + SEED.ry; y += 6) {
  const pts = [];
  for (let x = SEED.cx - SEED.rx; x <= SEED.cx + SEED.rx; x += 5) if (inSeed(x, y + (x - SEED.cx) * Math.tan(SEED.rot))) pts.push([x, y + (x - SEED.cx) * Math.tan(SEED.rot)]);
  if (pts.length > 3) SEEDLINES.push(pts);
}

// paper grain (fixed in plate space so it drifts with the camera)
const grain = createCanvas(W, H);
{
  const g = grain.getContext('2d'); const img = g.createImageData(W, H); const r = rng(3);
  for (let i = 0; i < img.data.length; i += 4) { const v = r(); img.data[i] = img.data[i + 1] = img.data[i + 2] = v > 0.5 ? 220 : 0; img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * 14); }
  g.putImageData(img, 0, 0);
}
// mango wash (transparent watercolour region, laid after the print)
function wash(g, a) {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = 0.62 * a;
  const grd = g.createRadialGradient(CX - 120, CY - 90, 30, CX, CY, RX * 1.1);
  grd.addColorStop(0, '#E9A21E');
  grd.addColorStop(0.6, '#C9710F');
  grd.addColorStop(1, '#7A3A08');
  g.fillStyle = grd;
  g.beginPath();
  polyOutline(0.965 + 0.02 * a, 0, Math.PI * 2, 200).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fill();
  g.restore();
}

function textC(g, s, x, y, font, col, align = 'center', track = 0) {
  g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'alphabetic';
  if (track) g.letterSpacing = `${track}px`;
  g.fillText(s, x, y);
  g.letterSpacing = '0px';
}

// ---- frame ----
const canvas = createCanvas(W, H);
const g = canvas.getContext('2d');
export function draw(f30) {
  const f = Math.floor(f30 / 2) * 2;            // stop motion: hold each drawing for 2 frames
  const jit = rng(1000 + f);                      // line "boil" between drawings
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  // one camera drift: slow push-in + rise over the plate
  const d = f / N;
  const s = 1 + 0.06 * d;
  g.translate(CX, CY); g.scale(s, s); g.translate(-CX, -CY - 14 * d);
  g.drawImage(grain, 0, 0);
  // plate mark + ruled border
  g.strokeStyle = 'rgba(232,226,204,0.55)'; g.lineWidth = 2.2; g.strokeRect(96, 560, 888, 1050);
  g.strokeStyle = 'rgba(232,226,204,0.25)'; g.lineWidth = 0.8; g.strokeRect(106, 570, 868, 1030);
  g.strokeStyle = 'rgba(90,182,38,0.35)'; g.lineWidth = 6; g.strokeRect(84, 548, 912, 1074);
  textC(g, 'PLATE I', 540, 620, '700 22px NText', 'rgba(232,226,204,0.85)', 'center', 8);
  textC(g, 'MANGO · RAW FLESH · 100 g', 540, 660, '700 30px NText', INK, 'center', 6);

  // colour arrives as an event: transparent mango wash laid UNDER the ink (ink stays on top)
  wash(g, eo(seg(f, 62, 84)));
  // beat 1 (0-3.3 s): outline cut, contours grow inward, fibres, seed
  const oc = seg(f, 0, 20);
  burin(g, polyOutline(1, -0.4, -0.4 + Math.PI * 2, 300), 3.4, INK, oc, jit);
  const kc = seg(f, 10, 64);
  CONTOURS.forEach((c, i) => {
    const r = clamp(kc * CONTOURS.length - i);
    if (r <= 0) return;
    for (const run of c.runs) burin(g, run, 1.6, 'rgba(232,226,204,0.9)', r, jit);
  });
  const fr = seg(f, 40, 76);
  FIBRES.forEach((p, i) => { const r = clamp(fr * 1.6 - (i % 10) * 0.06); if (r > 0) burin(g, p, 1.1, 'rgba(232,226,204,0.7)', r, jit); });
  const sr = seg(f, 30, 60);
  if (sr > 0) {
    g.save(); g.translate(SEED.cx, SEED.cy); g.rotate(SEED.rot);
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.ellipse(0, 0, SEED.rx, SEED.ry, 0, 0, Math.PI * 2 * sr); g.stroke(); g.restore();
    SEEDLINES.forEach((p, i) => { const r = clamp(sr * 1.8 - i * 0.04); if (r > 0) burin(g, p, 1.3, 'rgba(232,226,204,0.85)', r, jit); });
  }
  // skin band: short perpendicular ticks just inside the outline (darker side only)
  const sk = seg(f, 24, 56);
  for (let i = 0; i < 260 * sk; i++) {
    const th = (i / 260) * Math.PI * 2 - 0.4;
    const [x1, y1] = outline(th, 1), [x2, y2] = outline(th, 0.955);
    if (tone(x1, y1) < 0.35) continue;
    g.strokeStyle = INK; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }

  // beat 2 (3.3-6 s): edible-portion note + leaders
  const ln = seg(f, 40, 60);
  if (ln > 0) {
    g.save(); g.globalAlpha = ln;
    g.strokeStyle = 'rgba(232,226,204,0.85)'; g.lineWidth = 1; g.setLineDash([2, 5]);
    g.beginPath(); g.moveTo(CX - 230, CY + 60); g.lineTo(220, 1420); g.stroke();
    g.beginPath(); g.moveTo(SEED.cx + 60, SEED.cy + 30); g.lineTo(820, 1420); g.stroke(); g.setLineDash([]);
    g.fillStyle = INK; for (const [x, y] of [[CX - 230, CY + 60], [SEED.cx + 60, SEED.cy + 30]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    textC(g, 'FIG. 1  FLESH', 220, 1452, '700 24px NText', INK, 'center', 3);
    textC(g, 'counted: 100 g', 220, 1486, '600 24px NText', LIME, 'center');
    textC(g, 'FIG. 2  SEED + SKIN', 820, 1452, '700 24px NText', INK, 'center', 3);
    textC(g, 'not counted', 820, 1486, '600 24px NText', 'rgba(232,226,204,0.7)', 'center');
    g.restore();
  }

  // beat 3 (5.5-10 s): magnifier roundel glides in and uncovers the two values
  const mg = seg(f, 70, 92);
  if (mg > 0) {
    const mx = 540 + (1 - eo(mg)) * 520 + Math.sin(f * 0.05) * 6, my = 1060 + (1 - eo(mg)) * -60;
    const R = 205;
    g.save();
    g.beginPath(); g.arc(mx, my, R, 0, Math.PI * 2); g.clip();
    g.fillStyle = 'rgba(8,13,10,0.92)'; g.fillRect(mx - R, my - R, 2 * R, 2 * R);
    // ruled-machine ground inside the roundel (fine horizontal lines)
    g.strokeStyle = 'rgba(90,182,38,0.28)'; g.lineWidth = 1;
    for (let y = my - R; y < my + R; y += 7) { g.beginPath(); g.moveTo(mx - R, y); g.lineTo(mx + R, y); g.stroke(); }
    const v1 = seg(f, 90, 100), v2 = seg(f, 136, 146);
    g.globalAlpha = 1;
    if (v1 > 0) { g.save(); g.globalAlpha = v1; textC(g, '60 kcal', mx, my - 18, '900 92px NDisplay', LIME); g.restore(); }
    if (v2 > 0) { g.save(); g.globalAlpha = v2; textC(g, '≈ 36 mg', mx, my + 70, '900 60px NDisplay', '#FFC23A'); textC(g, 'VITAMIN C', mx, my + 112, '700 26px NText', INK, 'center', 6); g.restore(); }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(mx, my, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.arc(mx, my, R + 10, 0, Math.PI * 2); g.stroke();
    // handle
    g.strokeStyle = LEAF; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(mx + R * 0.72, my + R * 0.72); g.lineTo(mx + R * 1.12, my + R * 1.12); g.stroke();
  }
  // ---- screen-fixed layer: captions (upper centre), source + signature ----
  g.setTransform(1, 0, 0, 1, 0, 0);
  const c1 = seg(f, 14, 24), c2 = seg(f, 90, 100);
  if (c1 > 0) { g.save(); g.globalAlpha = c1; textC(g, '100 g raw mango flesh', 540, 380, '900 68px NDisplay', MIST); g.restore(); }
  if (c2 > 0) { g.save(); g.globalAlpha = c2; textC(g, '60 kcal · ≈36 mg vitamin C', 540, 448, '900 56px NDisplay', LIME); g.restore(); }
  const so = seg(f, 100, 118);
  if (so > 0) {
    g.save(); g.globalAlpha = so;
    textC(g, 'Per 100 g edible portion (raw, no skin or seed) · USDA FoodData Central FDC 169910', 540, 1676, '600 22px NText', 'rgba(232,226,204,0.8)');
    textC(g, 'Illustrative engraving; values from the cited record', 540, 1708, '600 20px NText', 'rgba(232,226,204,0.6)');
    g.drawImage(icon, 846, 1738, 30, 30);
    textC(g, 'NutriAI', 884, 1762, '700 24px NText', 'rgba(237,246,229,0.85)', 'left');
    g.restore();
  }
}

const args = process.argv.slice(2);
const si = args.indexOf('--still');
fs.mkdirSync(path.join(here, 'build'), { recursive: true });
if (si >= 0) {
  for (const s of args[si + 1].split(',')) { draw(Number(s)); fs.writeFileSync(path.join(here, 'build', `f${s.padStart(3, '0')}.png`), await canvas.encode('png')); }
} else {
  const out = path.join(here, 'build', 'video-noaudio.mp4');
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) {
    if (f % 2 === 0) draw(f);
    if (!ff.stdin.write(canvas.data())) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('done', out);
}
