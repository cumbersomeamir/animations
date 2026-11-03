// Tensorblue 30s round 02 · episode 01 — "Why a photo looks blurry when you zoom in"
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards +
// simple isometric stage + blue wipes. Story objects: one raster "photo" (a real pixel grid
// rendered in code) and the official Tensorblue logo, drawn from its own SVG path data.
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword,
  pill, isoP, isoBox, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- cues -----------------------------------------------------------------------------
const T = {
  blurry1: VW('L1', 'blurry'), zoom1: VW('L1', 'zoom'),
  raster: VW('L2', 'raster'), fixed: VW('L2', 'fixed'), grid: VW('L2', 'grid'), squares: VW('L2', 'squares'), pixels: VW('L2', 'pixels'),
  zoom3: VW('L3', 'zoom'), bigger: VW('L3', 'bigger'), edges: VW('L3', 'edges'), steps: VW('L3', 'steps'),
  smooth: VW('L4', 'smooth'), blocks: VW('L4', 'blocks'), blurry4: VW('L4', 'blurry'),
  vector: VW('L5', 'vector'), logo: VW('L5', 'logo'), points: VW('L5', 'points'), curves: VW('L5', 'curves'),
  redrawn: VW('L5', 'redrawn'), sharply: VW('L5', 'sharply'), any: VW('L5', 'any'), size: VW('L5', 'size'),
  zooming: VW('L6', 'zooming'), detail: VW('L6', 'detail'), captured: VW('L6', 'captured'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.4, VL('L2').t1 + 0.15, VL('L4').t1 + 0.17, VL('L5').t1 + 0.18, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top (as in the accepted episode)
T.chime = VL('L6').t1 + 0.15;
export const CUES = { ...T, scenes: SC };

// ---- the raster "photo": a real 140 x 170 pixel image rendered once ------------------------
// (an illustrative blue-hour landscape in the brand palette; smooth shapes rasterised, plus grain)
const PW = 140, PH = 170;
const photo = (() => {
  const cv = createCanvas(PW, PH); const g = cv.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, PH * 0.62);
  sky.addColorStop(0, '#0A152C'); sky.addColorStop(0.55, '#2757A6'); sky.addColorStop(1, '#8FB2E8');
  g.fillStyle = sky; g.fillRect(0, 0, PW, PH);
  // moon
  g.fillStyle = '#F4F8FF'; g.beginPath(); g.arc(98, 44, 15, 0, Math.PI * 2); g.fill();
  // far ridge
  g.fillStyle = '#3B6FC4';
  g.beginPath(); g.moveTo(0, 104); g.lineTo(22, 86); g.lineTo(44, 98); g.lineTo(70, 72); g.lineTo(96, 92); g.lineTo(118, 80); g.lineTo(140, 94); g.lineTo(140, 170); g.lineTo(0, 170); g.closePath(); g.fill();
  // near ridge (the diagonal edge used for the "steps")
  g.fillStyle = '#0C1834';
  g.beginPath(); g.moveTo(0, 128); g.lineTo(46, 96); g.lineTo(80, 118); g.lineTo(140, 108); g.lineTo(140, 170); g.lineTo(0, 170); g.closePath(); g.fill();
  // lake with moon reflection
  g.fillStyle = '#1C3C78'; g.fillRect(0, 140, PW, 30);
  g.fillStyle = 'rgba(244,248,255,0.55)'; for (let i = 0; i < 6; i++) g.fillRect(88 + (i % 2) * 3, 144 + i * 4, 18 - i * 2, 1.5);
  // stars
  g.fillStyle = '#FFFFFF'; for (const [x, y] of [[18, 20], [40, 34], [64, 14], [120, 18], [28, 58], [130, 52]]) g.fillRect(x, y, 1, 1);
  // sensor-like grain so it behaves like a photo
  const id = g.getImageData(0, 0, PW, PH); const d = id.data; let s = 1234567;
  for (let i = 0; i < d.length; i += 4) { s = (s * 1103515245 + 12345) & 0x7fffffff; const v = ((s / 0x7fffffff) - 0.5) * 10; d[i] += v; d[i + 1] += v; d[i + 2] += v; }
  g.putImageData(id, 0, 0);
  return cv;
})();
// draw a source rect of the photo into a destination rect; smooth = what most apps do when enlarging
function photoView(ctx, sx, sy, sw, sh, dx, dy, dw, dh, smooth) {
  ctx.save(); ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  ctx.imageSmoothingEnabled = smooth; ctx.imageSmoothingQuality = 'high';
  ctx.globalAlpha = S.alpha;
  ctx.drawImage(photo, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}
// a tactile photo frame (white print border on a pale card shadow)
function frame(ctx, x, y, w, h, alpha = 1) {
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  shadow(ctx, x + w / 2 + 8, y + h + 16, w * 0.52, 26, 0.65);
  ctx.fillStyle = C.blueDeep; rr(ctx, x, y + 8, w, h, 30); ctx.fill();
  ctx.fillStyle = C.white; rr(ctx, x, y, w, h, 30); ctx.fill();
  ctx.restore();
}

// ---- the official logo, drawn from tensorblue-logo.svg's own geometry (viewBox 0 0 200 260) ----
const DROP = [[100, 20], [100, 20, 170, 110, 170, 175], [170, 219, 138, 250, 100, 250], [62, 250, 30, 219, 30, 175], [30, 110, 100, 20, 100, 20]];
function dropPath(ctx) { ctx.beginPath(); ctx.moveTo(...DROP[0]); for (let i = 1; i < DROP.length; i++) ctx.bezierCurveTo(...DROP[i]); ctx.closePath(); }
// logo at centre (cx, cy) with drop height h (drop spans y 20..250 = 230 units)
function logoVector(ctx, cx, cy, h, o = {}) {
  const { alpha = 1 } = o; if (alpha <= 0 || h <= 0) return;
  const s = h / 230;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-100, -135);
  dropPath(ctx); ctx.fillStyle = C.logo; ctx.fill();
  ctx.save(); dropPath(ctx); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (const y of [110, 145, 180, 215]) { ctx.moveTo(20, y); ctx.lineTo(180, y); }
  for (const x of [65, 100, 135]) { ctx.moveTo(x, 10); ctx.lineTo(x, 260); }
  ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  for (const y of [145, 180, 215]) for (const x of [65, 100, 135]) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
// the vector's own data: anchor points and curve handles (shown, not animated)
function logoAnchors(ctx, cx, cy, h, kp, kc) {
  const s = h / 230, P = (x, y) => [cx + (x - 100) * s, cy + (y - 135) * s];
  ctx.save();
  if (kc > 0) {
    ctx.globalAlpha = S.alpha * kc; ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.fillStyle = C.white;
    for (const [ax, ay, hx, hy] of [[170, 175, 170, 110], [170, 175, 170, 219], [100, 250, 138, 250], [100, 250, 62, 250], [30, 175, 30, 219], [30, 175, 30, 110]]) {
      const a = P(ax, ay), b = P(lerp(ax, hx, ease(kc)), lerp(ay, hy, ease(kc)));
      ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.beginPath(); ctx.arc(b[0], b[1], 8, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (kp > 0) {
    ctx.globalAlpha = S.alpha;
    [[100, 20], [170, 175], [100, 250], [30, 175]].forEach(([x, y], i) => {
      const k = back(clamp(kp * 4 - i)); if (k <= 0) return;
      const p = P(x, y), r = 13 * k;
      ctx.fillStyle = C.white; ctx.fillRect(p[0] - r - 3, p[1] - r - 3, 2 * r + 6, 2 * r + 6);
      ctx.fillStyle = C.blue; ctx.fillRect(p[0] - r, p[1] - r, 2 * r, 2 * r);
    });
  }
  ctx.restore();
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['Why does a photo get blurry', 'when you zoom in?'] },
  { t0: VL('L2').t0, lines: ["It's usually a raster image:"] },
  { t0: VW('L2', 'a', 2), lines: ['a fixed grid of tiny coloured', 'squares called pixels.'] },
  { t0: VL('L3').t0, lines: ['Zoom in, and each pixel', 'just gets bigger,'] },
  { t0: VW('L3', 'so'), lines: ['so edges turn into steps.'] },
  { t0: VL('L4').t0, lines: ['Many apps smooth those blocks,', 'which looks blurry.'] },
  { t0: VL('L5').t0, lines: ['A vector logo stores shapes', 'as points and curves,'] },
  { t0: VW('L5', 'so'), lines: ["so it's redrawn sharply", 'at any size.'] },
  { t0: VL('L6').t0, lines: ["Zooming can't add detail", 'a photo never captured.'], tEnd: VL('L6').t1 + 0.9 },
  { t0: VL('L7').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.6 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 880;
const CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}
function kpair(ctx, a, b, y, size, t, ta, tb, o = {}) {
  // two-tone kinetic line: `a` white + `b` blue, centred
  const font = o.font || 'IDXB', w1 = textW(ctx, a, size, font, -1), w2 = textW(ctx, b, size, font, -1), x0 = 540 - (w1 + w2) / 2;
  kword(ctx, a, x0, y, size, t, ta, { align: 'left', font, t1: o.t1 });
  kword(ctx, b, x0 + w1, y, size, t, tb, { align: 'left', font, color: C.blue, t1: o.t1 });
}

// ---- scenes ------------------------------------------------------------------------------
const STAGE_TOP = 540;
const ZC = [84, 36]; // zoom target (photo pixel coords): the moon's lower-left edge against the sky

// S1 hook: the photo at 100%, then a zoom that ends blurry
function s1(ctx, t) {
  const fx = 230, fy = 580, fw = 620, fh = 800, ix = fx + 30, iy = fy + 30, iw = 560, ih = 680;
  frame(ctx, fx, fy, fw, fh);
  const z = ease(ev(t, 0.85, 1.5)); // 1x -> 8x
  const zoom = Math.exp(lerp(Math.log(1), Math.log(8), z));
  const sw = PW / zoom, sh = PH / zoom;
  const cx = lerp(PW / 2, ZC[0] + 4, z), cy = lerp(PH / 2, ZC[1] + 5, z);
  photoView(ctx, cx - sw / 2, cy - sh / 2, sw, sh, ix, iy, iw, ih, true);
  pill(ctx, fx + fw - 110, fy + fh - 45, `${Math.round(zoom * 100)}%`, { size: 34, fill: C.ink, color: C.white });
  text(ctx, 'photo.jpg', fx + 40, fy + fh - 32, { size: 34, font: 'InterB', color: C.ink, align: 'left' });
  kpair(ctx, 'Why so ', 'blurry?', 1470, 84, t, T.blurry1 - 0.05, T.blurry1 + 0.1);
}

// S2 the truth: a raster is a fixed grid of coloured squares
// pick a visibly blended pixel on the moon's edge (row 9 of the view) so its single colour shows
const EDGE_PX = (() => { const g = photo.getContext('2d'); for (let c = 0; c < 23; c++) { const d = g.getImageData(80 + c, 41, 1, 1).data; const l = (d[0] + d[1] + d[2]) / 765; if (l > 0.45 && l < 0.7) return [c, 9]; } return [3, 9]; })();
const G2 = { x: 170, y: 600, w: 740, h: 544, sx: 80, sy: 32, px: 32 };
function s2(ctx, t) {
  const { x, y, w, h, sx, sy, px } = G2;
  frame(ctx, x - 22, y - 22, w + 44, h + 44);
  const crisp = ev(t, T.raster - 0.05, 0.25);
  // blurry -> real pixels (smoothing off shows the squares that were always there)
  photoView(ctx, sx, sy, w / px, h / px, x, y, w, h, true);
  if (crisp > 0) { S.alpha = crisp; photoView(ctx, sx, sy, w / px, h / px, x, y, w, h, false); S.alpha = 1; }
  // the grid itself, drawn once on "fixed grid"
  const gk = ev(t, T.fixed - 0.05, 0.5);
  if (gk > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = 'rgba(3,6,16,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let gx = 0; gx <= w; gx += px) { const yy = y + h * ease(gk); ctx.moveTo(x + gx, y); ctx.lineTo(x + gx, yy); }
    for (let gy = 0; gy <= h; gy += px) { const xx = x + w * ease(gk); ctx.moveTo(x, y + gy); ctx.lineTo(xx, y + gy); }
    ctx.stroke(); ctx.restore();
  }
  // spec chip: the grid size is fixed
  if (t >= T.fixed - 0.1) pill(ctx, x + w / 2, y + h + 66, 'photo.jpg  ·  140 × 170 pixels', { size: 32, fill: C.pale, alpha: ev(t, T.fixed - 0.1, 0.25) });
  // one pixel lifts out: one square, one colour
  const lk = ev(t, T.squares - 0.1, 0.45);
  if (lk > 0) {
    const [pxX, pxY] = EDGE_PX; // a blended pixel on the moon's edge
    const ox = x + pxX * px, oy = y + pxY * px;
    ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.strokeRect(ox - 3, oy - 3, px + 6, px + 6); ctx.restore();
    const d = photo.getContext('2d').getImageData(sx + pxX, sy + pxY, 1, 1).data;
    const col = `rgb(${d[0]},${d[1]},${d[2]})`;
    const k = easeOut(lk), tx = lerp(ox, 200, k), ty = lerp(oy, 1270, k), ts = lerp(px, 130, k);
    shadow(ctx, tx + ts / 2, ty + ts + 14, ts * 0.5, 14, 0.6);
    ctx.save(); ctx.fillStyle = C.white; rr(ctx, tx - 10, ty - 10, ts + 20, ts + 20, 18); ctx.fill(); ctx.fillStyle = col; ctx.fillRect(tx, ty, ts, ts); ctx.restore();
    if (lk >= 1) { pill(ctx, 590, 1335, '1 pixel = 1 colour', { size: 40, fill: C.blue, color: C.white, alpha: ev(t, T.squares + 0.35, 0.2) }); }
  }
}

// S3/S4 zoom: edges turn into steps -> apps smooth them -> blurry
const L3 = { x: 100, y: 640, w: 330, h: 450 };          // 100% view
const R3 = { x: 460, y: 640, w: 500 - 10, h: 450 };      // 800% view
const RS = { sx: 18, sy: 104, px: 32 };                  // near-ridge diagonal region (photo coords)
function s3(ctx, t) {
  const a = easeOut(ev(t, SC[2], 0.35));
  S.alpha = a;
  // 100% view with the zoom box
  frame(ctx, L3.x - 14, L3.y - 14, L3.w + 28, L3.h + 28);
  photoView(ctx, 10, 60, L3.w / 4, L3.h / 4, L3.x, L3.y, L3.w, L3.h, true);
  const bx = L3.x + (RS.sx - 10) * 4, by = L3.y + (RS.sy - 60) * 4, bw = (R3.w / RS.px) * 4, bh = (R3.h / RS.px) * 4;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.blue; ctx.lineWidth = 5; ctx.strokeRect(bx, by, bw, bh); ctx.restore();
  pill(ctx, L3.x + L3.w / 2, L3.y - 40, '100%', { size: 32, fill: C.pale });
  // 800% view: blocky first, then smoothed (blurry)
  const zin = back(ev(t, SC[2] + 0.05, 0.45)); // the 800% panel pops out of the zoom box, already filled
  ctx.save(); ctx.translate(R3.x, R3.y + R3.h / 2); ctx.scale(lerp(0.2, 1, zin), lerp(0.2, 1, zin)); ctx.translate(-R3.x, -(R3.y + R3.h / 2));
  frame(ctx, R3.x - 14, R3.y - 14, R3.w + 28, R3.h + 28);
  const sm = ev(t, T.smooth - 0.05, 0.45);
  photoView(ctx, RS.sx, RS.sy, R3.w / RS.px, R3.h / RS.px, R3.x, R3.y, R3.w, R3.h, false);
  if (sm > 0) { S.alpha = a * sm; photoView(ctx, RS.sx, RS.sy, R3.w / RS.px, R3.h / RS.px, R3.x, R3.y, R3.w, R3.h, true); S.alpha = a; }
  ctx.restore();
  pill(ctx, R3.x + R3.w / 2, R3.y - 40, sm > 0.5 ? '800% · smoothed' : '800% · pixels', { size: 32, fill: sm > 0.5 ? C.pale : C.blue, color: sm > 0.5 ? C.ink : C.white });
  S.alpha = 1;
  // the steps: outline the pixel staircase along the near ridge (fades when smoothed)
  const st = ev(t, T.steps - 0.15, 0.45) * (1 - sm);
  if (st > 0) {
    const pts = []; const cols = Math.floor(R3.w / RS.px);
    for (let i = 0; i <= cols; i++) {
      const xs = RS.sx + i + 0.5; // ridge y at this column (near ridge: from (0,128)->(46,96) then (46,96)->(80,118))
      const ry = xs <= 46 ? 128 - (xs * 32 / 46) : 96 + (xs - 46) * 22 / 34;
      const yy = R3.y + (Math.ceil(ry) - RS.sy) * RS.px;
      pts.push([R3.x + i * RS.px, yy], [R3.x + (i + 1) * RS.px, yy]);
    }
    const n = Math.max(2, Math.floor(pts.length * ease(st)));
    ctx.save(); ctx.beginPath(); ctx.rect(R3.x, R3.y, R3.w, R3.h); ctx.clip();
    ctx.strokeStyle = C.white; ctx.lineWidth = 7; ctx.lineJoin = 'miter'; ctx.globalAlpha = st;
    ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < n; i++) ctx.lineTo(...pts[i]); ctx.stroke(); ctx.restore();
  }
  // kinetic: steps -> blurry
  kpair(ctx, 'edges become ', 'steps', 1300, 76, t, T.edges - 0.05, T.steps - 0.05, { t1: T.smooth - 0.1 });
  kpair(ctx, 'smoothed = ', 'blurry', 1300, 76, t, T.smooth + 0.15, T.blurry4 - 0.05);
}

// S4 vector: points + curves, redrawn sharply at any size (isometric stage)
const O5 = { x: 419, y: 980, u: 70 };
function s4(ctx, t) {
  const t0 = SC[3];
  const toStage = ease(ev(t, T.redrawn - 0.3, 0.6));
  // the stage slab rises in when the logo is redrawn at other sizes
  const sr = easeOut(ev(t, T.redrawn - 0.3, 0.5));
  if (sr > 0) { ctx.save(); ctx.translate(0, (1 - sr) * 120); S.alpha = sr; isoBox(ctx, O5, 0, 0, -0.45, 7, 3, 0.45, { top: C.slab, left: C.slabSide, right: '#091428', edge: 'rgba(183,199,223,0.35)' }); ctx.restore(); S.alpha = 1; }
  const foot = (x) => isoP(O5, x, 1.5, 0);
  // smaller copies redrawn on the stage: every size crisp
  const sizes = [[...foot(0.9), 120, T.any - 0.05], [...foot(3.2), 190, T.sharply - 0.1]];
  for (const [x, yb, hh, tt] of sizes) {
    const k = back(ev(t, tt, 0.35)); if (k <= 0) continue;
    const w = hh * 0.82 * k, h2 = hh * k;
    shadow(ctx, x, yb + 4, w * 0.55, 10, 0.6);
    ctx.save(); ctx.fillStyle = C.blueDeep; rr(ctx, x - w / 2, yb - h2 + 6, w, h2, 20 * k); ctx.fill(); ctx.fillStyle = C.pale; rr(ctx, x - w / 2, yb - h2, w, h2, 20 * k); ctx.fill(); ctx.restore();
    logoVector(ctx, x, yb - h2 / 2, h2 * 0.72);
  }
  // big card with logo.svg and its points/curves
  const ca = easeOut(ev(t, t0, 0.4));
  const cw = lerp(500, 216, toStage), chh = lerp(600, 260, toStage);
  const fL = foot(6.0), cx = lerp(540, fL[0], toStage), cy = lerp(890, fL[1] - chh / 2, toStage);
  S.alpha = ca;
  shadow(ctx, cx, cy + chh / 2 + 14, cw * 0.5, 18, 0.6);
  ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = C.blueDeep; rr(ctx, cx - cw / 2, cy - chh / 2 + 8, cw, chh, 34); ctx.fill();
  ctx.fillStyle = C.pale; rr(ctx, cx - cw / 2, cy - chh / 2, cw, chh, 34); ctx.fill(); ctx.restore();
  const lh = chh * 0.7;
  logoVector(ctx, cx, cy, lh);
  logoAnchors(ctx, cx, cy, lh, ev(t, T.points - 0.1, 0.5) * (1 - toStage), ev(t, T.curves - 0.05, 0.4) * (1 - toStage));
  pill(ctx, cx, cy - chh / 2 - 34, 'logo.svg', { size: 32, fill: C.ink, color: C.white, alpha: ca * (1 - toStage) });
  S.alpha = 1;
  kpair(ctx, 'points + ', 'curves', 1340, 80, t, T.points - 0.1, T.curves - 0.05, { t1: T.redrawn - 0.3 });
  kpair(ctx, 'redrawn at ', 'any size', 680, 76, t, T.redrawn - 0.05, T.any - 0.05);
}

// S5 before/after at the same zoom: photo pixels vs vector outline + the takeaway
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.35));
  const L = { x: 100, y: 640, w: 410, h: 470 }, R = { x: 560, y: 640, w: 410 - 20, h: 470 };
  S.alpha = a;
  frame(ctx, L.x - 14, L.y - 14, L.w + 28, L.h + 28);
  photoView(ctx, ZC[0] - 3, ZC[1] + 2, L.w / 32, L.h / 32, L.x, L.y, L.w, L.h, false);
  frame(ctx, R.x - 14, R.y - 14, R.w + 28, R.h + 28);
  ctx.save(); ctx.beginPath(); ctx.rect(R.x, R.y, R.w, R.h); ctx.clip();
  ctx.fillStyle = C.pale; ctx.fillRect(R.x, R.y, R.w, R.h);
  logoVector(ctx, R.x + R.w / 2 - 49 * 10, R.y + R.h / 2 - 94 * 10, 2300); // ~10x: the drop's lower-right curve crosses the panel, still sharp
  ctx.restore();
  pill(ctx, L.x + L.w / 2, L.y - 40, 'photo.jpg · 800%', { size: 30, fill: C.pale });
  pill(ctx, R.x + R.w / 2, R.y - 40, 'logo.svg · 800%', { size: 30, fill: C.blue, color: C.white });
  text(ctx, 'fixed pixels', L.x + L.w / 2, L.y + L.h + 70, { size: 40, font: 'IDB', color: C.gray, alpha: ev(t, t0 + 0.3, 0.3) });
  text(ctx, 'redrawn', R.x + R.w / 2, R.y + R.h + 70, { size: 40, font: 'IDB', color: C.blue, alpha: ev(t, t0 + 0.45, 0.3) });
  S.alpha = 1;
  kpair(ctx, "Zoom can't add ", 'detail', 1390, 76, t, T.zooming, T.detail - 0.05);
  // the practical rule, on the chime (Adobe: vector format is better for logos)
  const tk = back(ev(t, T.chime - 0.05, 0.35));
  if (tk > 0) { ctx.save(); ctx.translate(540, 1480 - 34); ctx.scale(tk, tk); ctx.translate(-540, -(1480 - 34)); pill(ctx, 540, 1446, 'Tip: keep logos as vectors (SVG)', { size: 36, fill: C.pale }); ctx.restore(); }
}

// S6 CTA — the accepted end card, unchanged
function s6(ctx, t) {
  const t0 = SC[5];
  const lk = back(ev(t, t0 + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
  const size = 128, w1 = textW(ctx, 'Tensor', size, 'IDXB', -2), w2 = textW(ctx, 'blue', size, 'IDXB', -2);
  const x0 = 540 - (w1 + w2) / 2;
  kword(ctx, 'Tensor', x0, 1160, size, t, T.tb - 0.1, { align: 'left' });
  kword(ctx, 'blue', x0 + w1, 1160, size, t, T.tb - 0.02, { align: 'left', color: C.blue });
  kword(ctx, 'software explained simply', 540, 1250, 50, t, T.tb + 0.5, { font: 'IDB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1370); ctx.scale(fk, fk); ctx.translate(-540, -1370);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 150, 1370 - 50, 300, 100, 50); ctx.fill();
    text(ctx, 'Follow', 540, 1388, { size: 50, font: 'IDXB' });
    ctx.restore();
  }
}
const SCENES = [s1, s2, s3, s4, s5, s6];

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.85, 'slide'); add(T.blurry1 - 0.05, 'type'); add(T.blurry1 + 0.1, 'type', { lo: true });
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.raster - 0.05, 'clack', { soft: true }); add(T.fixed - 0.05, 'carve'); add(T.squares - 0.1, 'clack'); add(T.squares + 0.35, 'blip', { hi: true }); add(T.pixels - 0.05, 'type', { lo: true });
  add(T.zoom3, 'slide', { soft: true }); add(T.edges - 0.05, 'type'); add(T.steps - 0.15, 'carve');
  add(T.smooth - 0.05, 'slide', { soft: true }); add(T.blurry4 - 0.05, 'type', { lo: true });
  add(SC[3] + 0.05, 'clack'); add(T.points - 0.1, 'carve'); add(T.curves - 0.05, 'blip');
  add(T.redrawn - 0.3, 'slide'); add(T.sharply - 0.1, 'blip', { lo: true }); add(T.any - 0.05, 'blip', { hi: true }); add(T.any - 0.05, 'type', { soft: true });
  add(SC[4] + 0.05, 'clack', { soft: true }); add(T.zooming, 'type'); add(T.detail - 0.05, 'type', { lo: true });
  add(T.chime, 'chime');
  add(SC[5] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame -------------------------------------------------------------------------------
const bg = makeBackground();
function sceneIndex(t) { let i = 0; while (i + 1 < SCENES.length && t >= SC[i + 1]) i++; return i; }
function drawScene(ctx, i, t) { ctx.save(); S.alpha = 1; SCENES[i](ctx, t); ctx.restore(); S.alpha = 1; }
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const i = sceneIndex(t);
  let wipe = null;
  for (let j = 1; j < SCENES.length; j++) { const k = (t - (SC[j] - WIPE / 2)) / WIPE; if (k >= 0 && k < 1) wipe = { j, k }; }
  if (!wipe) drawScene(ctx, i, t);
  else {
    const { j, k } = wipe; const dir = WDIR[j]; const e = ease(k); const band = 220;
    if (dir === 2) {
      const edge = lerp(H + band, STAGE_TOP - band, e);
      ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
    } else {
      const edge = dir === 1 ? lerp(-band, W, e) : lerp(W, -band, e);
      const oldR = dir === 1 ? [edge + band, W] : [0, edge];
      const newR = dir === 1 ? [0, edge] : [edge + band, W];
      ctx.save(); ctx.beginPath(); ctx.rect(oldR[0], STAGE_TOP, Math.max(0, oldR[1] - oldR[0]), H); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(newR[0], STAGE_TOP, Math.max(0, newR[1] - newR[0]), H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(edge, STAGE_TOP, band, H);
    }
  }
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}
