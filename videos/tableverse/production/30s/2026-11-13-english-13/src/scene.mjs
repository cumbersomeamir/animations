// "The Missing Row Trick" — Pop-up Counting Storybook, depth edition.
// Every hinge is drawn with real perspective (strip-projected planes), the background has depth of field,
// camera moves are motivated and parallaxed, and planes are lit by a warm key light from the top-left.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow, scoreLine, splitPin,
  sparkle, label, measure, cupcakeSprite,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout (world px)
const CX = 500; // composition centre (captions live in x 100–900)
const TRAY = { x: 148, y: 575, w: 704, padL: 46, padT: 30, cw: 104, ch: 100, padB: 25 };
TRAY.h = TRAY.padT + 7 * TRAY.ch + TRAY.padB; // 755 -> bottom 1330
const HINGE_Y = TRAY.y + TRAY.padT + 5 * TRAY.ch; // 1105, between row 5 and row 6
const UP_H = HINGE_Y - TRAY.y; // 530
const LO_H = TRAY.y + TRAY.h - HINGE_Y; // 225
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 566; // hinge line for the top label flap
const TAB_X = 134;
const BAKER = { x: 78, y: 1594, s: 0.92 };
const cupX = (c) => TRAY.x + TRAY.padL + TRAY.cw / 2 + c * TRAY.cw;
const cupY = (r) => TRAY.y + TRAY.padT + TRAY.ch / 2 + r * TRAY.ch;

// ------------------------------------------------------------------ perspective hinge renderer
/**
 * Draw `tex` as a rigid card hinged on a horizontal line at hingeY.
 * dir +1: card hangs below the hinge; dir -1: card stands above it. theta: rotation toward the viewer (rad).
 * Pinhole projection about (x + w/2, hingeY) with focal length F. Returns the far edge {y, k}.
 */
function drawPlane(ctx, tex, o) {
  const { x, w, hingeY, h, theta, dir = 1, F = 1500, n = 64, shade = 0, warm = 0, shadow = 0, sx = 0, sy = 0 } = o;
  const sw = o.sw ?? tex.width, sh = o.sh ?? tex.height;
  const cx = x + w / 2;
  const c = Math.cos(theta), s = Math.sin(theta);
  const proj = (d) => { const k = F / (F - d * s); return [hingeY + dir * d * c * k, k]; };
  const far = proj(h);
  if (Math.abs(far[0] - hingeY) < 0.5 && Math.abs(c) < 0.02) return { y: far[0], k: far[1] };
  const quad = [[cx - w / 2, hingeY], [cx + w / 2, hingeY], [cx + (w * far[1]) / 2, far[0]], [cx - (w * far[1]) / 2, far[0]]];
  if (shadow > 0) {
    ctx.save();
    ctx.filter = `blur(${Math.round(10 + shadow * 10)}px)`;
    ctx.fillStyle = `rgba(40,16,60,${0.32 * shadow})`;
    ctx.beginPath();
    quad.forEach((p, i) => (i ? ctx.lineTo(p[0] + 10 * shadow, p[1] + 18 * shadow) : ctx.moveTo(p[0] + 10 * shadow, p[1] + 18 * shadow)));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  let prev = proj(0);
  for (let i = 0; i < n; i++) {
    const p1 = proj((h * (i + 1)) / n);
    const km = (prev[1] + p1[1]) / 2;
    const ww = w * km;
    const srcH = sh / n;
    const srcY = dir > 0 ? sy + srcH * i : sy + sh - srcH * (i + 1);
    const top = Math.min(prev[0], p1[0]);
    const hh = Math.abs(p1[0] - prev[0]);
    if (hh > 0.05) ctx.drawImage(tex, sx, srcY, sw, srcH, cx - ww / 2, top - 0.3, ww, hh + 0.8);
    prev = p1;
  }
  if (shade > 0 || warm > 0) {
    ctx.save();
    ctx.beginPath(); quad.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
    ctx.clip();
    if (shade > 0) { ctx.fillStyle = `rgba(30,12,50,${shade})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    if (warm > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,214,120,${warm})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    ctx.restore();
  }
  return { y: far[0], k: far[1] };
}

// ------------------------------------------------------------------ cached layers
let BG = null;
function background() {
  // blurred bakery interior behind the book (depth of field); oversize for parallax
  if (BG) return BG;
  const bw = 1300, bh = 2140;
  const c = createCanvas(bw, bh), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, bh);
  g.addColorStop(0, '#F7E3EE'); g.addColorStop(0.5, '#EED7F2'); g.addColorStop(1, '#D9B98F');
  x.fillStyle = g; x.fillRect(0, 0, bw, bh);
  const r = rng(13);
  x.filter = 'blur(14px)';
  // window light
  x.fillStyle = 'rgba(255,250,235,0.9)'; x.fillRect(820, 260, 360, 520);
  x.fillStyle = 'rgba(200,170,230,0.7)'; x.fillRect(990, 260, 18, 520); x.fillRect(820, 510, 360, 16);
  // shelves with bread loaves, jars, rolling pins (no cupcakes: counted objects stay on the tray only)
  for (const sy of [700, 1080]) {
    x.fillStyle = '#B98A56'; x.fillRect(0, sy, 760, 26);
    for (let k = 0; k < 6; k++) {
      const px = 40 + k * 120 + r() * 30;
      if (k % 3 === 0) { x.fillStyle = '#D79A55'; x.beginPath(); x.ellipse(px, sy - 34, 52, 34, 0, Math.PI, 0); x.fill(); }
      else if (k % 3 === 1) { x.fillStyle = 'rgba(185,150,240,0.85)'; x.fillRect(px - 26, sy - 90, 52, 90); x.fillStyle = '#7E5BD8'; x.fillRect(px - 28, sy - 100, 56, 16); }
      else { x.fillStyle = '#E8C08A'; x.fillRect(px - 60, sy - 26, 120, 22); }
    }
  }
  // warm string-light bokeh
  for (let k = 0; k < 16; k++) {
    const px = 40 + k * 80 + r() * 20, py = 120 + Math.sin(k * 0.8) * 40 + r() * 30;
    const rg = x.createRadialGradient(px, py, 0, px, py, 46);
    rg.addColorStop(0, 'rgba(255,214,140,0.95)'); rg.addColorStop(1, 'rgba(255,214,140,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(px, py, 46, 0, Math.PI * 2); x.fill();
  }
  x.filter = 'none';
  // tabletop
  const t = x.createLinearGradient(0, 1540, 0, bh);
  t.addColorStop(0, '#E9C79A'); t.addColorStop(1, '#D3A673');
  x.fillStyle = t; x.fillRect(0, 1560, bw, bh - 1560);
  applyGrain(x, 0, 0, bw, bh, 0.05);
  BG = c;
  return c;
}

let BOOKART = null;
function bookArt() {
  // backdrop page print + page stack; floor page with perspective checker (static)
  if (BOOKART) return BOOKART;
  const c = createCanvas(W, H), x = c.getContext('2d');
  // page stack + violet boards
  x.save(); withShadow(x, 24, 0.3);
  x.fillStyle = C.violet; x.fillRect(BOOK.x - 14, BAR_Y + 10, BOOK.w + 28, BOOK.bot - BAR_Y);
  x.restore();
  for (let k = 3; k >= 1; k--) { x.fillStyle = k % 2 ? '#EFE3CF' : '#FFF8EC'; x.fillRect(BOOK.x - 3 * k, BOOK.y + 2, BOOK.w + 6 * k, BOOK.bot - BOOK.y + k); }
  // floor page (perspective)
  const fq = [[BOOK.x, BOOK.bot], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x + BOOK.w + 90, H + 40], [BOOK.x - 90, H + 40]];
  x.save(); withShadow(x, 18, 0.25);
  pathFrom(x, fq.map((p, i) => [p[0] + (i < 2 ? 0 : (i === 2 ? 12 : -12)), p[1]])); x.fillStyle = C.violet; x.fill();
  x.restore();
  pathFrom(x, fq); x.fillStyle = C.cream; x.fill();
  x.save(); pathFrom(x, fq); x.clip();
  const vx = CX, vy = BOOK.bot - 1500;
  const rows = [];
  for (let k = 0; k <= 6; k++) rows.push(BOOK.bot + (H + 40 - BOOK.bot) * Math.pow(k / 6, 1.3));
  for (let k = 0; k < 6; k++) for (let q = -10; q < 10; q++) {
    if ((q + k) % 2 === 0) continue;
    const pts = [[q, rows[k]], [q + 1, rows[k]], [q + 1, rows[k + 1]], [q, rows[k + 1]]].map(([qq, yy]) => {
      const xb = CX + qq * 130; const u = (yy - vy) / (H + 40 - vy); return [vx + (xb - vx) * u, yy];
    });
    pathFrom(x, pts); x.fillStyle = 'rgba(209,152,250,0.26)'; x.fill();
  }
  const gg = x.createLinearGradient(0, BOOK.bot, 0, BOOK.bot + 60);
  gg.addColorStop(0, 'rgba(60,30,80,0.35)'); gg.addColorStop(1, 'rgba(60,30,80,0)');
  x.fillStyle = gg; x.fillRect(0, BOOK.bot, W, 60);
  applyGrain(x, 0, BOOK.bot, W, H - BOOK.bot, 0.08);
  x.restore();
  BOOKART = c;
  return c;
}

let PAGEPRINT = null;
function pagePrint() {
  // the upright backdrop page (cream with soft violet print); drawn inside the flippable page buffer
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W, BOOK.bot + 4), x = c.getContext('2d');
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#FFF5E6'); g.addColorStop(1, '#F6E6CC');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  const r = rng(77);
  for (let k = 0; k < 120; k++) { x.fillStyle = 'rgba(57,12,214,0.07)'; x.beginPath(); x.arc(BOOK.x + r() * BOOK.w, BOOK.y + r() * (BOOK.bot - BOOK.y), 4, 0, Math.PI * 2); x.fill(); }
  // pull-tab slot track on the page, left of the tray
  scoreLine(x, TAB_X, HINGE_Y + 6, TAB_X, 1488, 'rgba(42,22,80,0.35)', 3);
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.07);
  x.restore();
  PAGEPRINT = c;
  return c;
}

let CTAPAGE = null;
function ctaPageArt() {
  if (CTAPAGE) return CTAPAGE;
  const c = createCanvas(W, BOOK.bot + 4), x = c.getContext('2d');
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 901, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#24107E'); g.addColorStop(1, C.deep);
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  const r = rng(41);
  for (let k = 0; k < 70; k++) sparkle(x, BOOK.x + r() * BOOK.w, BOOK.y + r() * (BOOK.bot - BOOK.y), 4 + r() * 9, k % 4 ? 'rgba(209,152,250,0.45)' : 'rgba(249,227,14,0.7)');
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
  x.restore();
  CTAPAGE = c;
  return c;
}

// ------------------------------------------------------------------ tray textures (per frame)
const TEX = {};
function texCanvas(key, w, h) {
  if (!TEX[key]) TEX[key] = createCanvas(w, h);
  const c = TEX[key];
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, w, h);
  return c;
}
let TRAYBASE = null;
function trayBase() {
  if (TRAYBASE) return TRAYBASE;
  const c = createCanvas(TRAY.w, TRAY.h), x = c.getContext('2d');
  const outline = cutPoly(roundRectPts(2, 2, TRAY.w - 4, TRAY.h - 4, 34), 950, 1.2, 14);
  piece(x, outline, C.violet, { grainA: 0.1 });
  const inner = cutPoly(roundRectPts(14, 14, TRAY.w - 28, TRAY.h - 28, 26), 951, 1.0, 14);
  const g = x.createLinearGradient(0, 0, 0, TRAY.h);
  g.addColorStop(0, '#EFCB92'); g.addColorStop(1, C.kraft);
  piece(x, inner, g, { grainA: 0.14 });
  // cupcake wells
  for (let r = 0; r < 7; r++) for (let cc = 0; cc < 6; cc++) {
    const px = TRAY.padL + TRAY.cw / 2 + cc * TRAY.cw, py = TRAY.padT + TRAY.ch / 2 + r * TRAY.ch;
    x.fillStyle = 'rgba(120,70,20,0.22)';
    x.beginPath(); x.ellipse(px, py + 34, 42, 12, 0, 0, Math.PI * 2); x.fill();
  }
  TRAYBASE = c;
  return c;
}

function rowLit(r, f) {
  if (r > 4) return 0;
  const a = prog(T.ROW_LIGHT(r), T.ROW_LIGHT(r) + 6, f);
  return a * (1 - prog(T.UNFOLD[1], T.UNFOLD[1] + 10, f));
}
function pulse(f, f0, len = 18) {
  const t = f - f0;
  return t >= 0 && t < len ? Math.sin((Math.PI * t) / len) : 0;
}
/** render rows [r0, r1) of the tray into a texture whose top is tray-local y0 */
function trayTex(key, r0, r1, y0, h, f, glow) {
  const c = texCanvas(key, TRAY.w, h);
  const x = c.getContext('2d');
  x.drawImage(trayBase(), 0, y0, TRAY.w, h, 0, 0, TRAY.w, h);
  const cup = cupcakeSprite();
  for (let r = r0; r < r1; r++) {
    const py = TRAY.padT + TRAY.ch / 2 + r * TRAY.ch - y0;
    const lit = rowLit(r, f);
    if (lit > 0) {
      x.save(); x.globalAlpha = lit;
      pathFrom(x, roundRectPts(TRAY.padL - 6, py - 48, TRAY.w - TRAY.padL - 16, 96, 24));
      x.fillStyle = 'rgba(249,227,14,0.42)'; x.fill();
      x.lineWidth = 5; x.strokeStyle = 'rgba(248,111,3,0.85)'; x.stroke();
      x.restore();
    }
    const pop = E.outBack(clamp((f - T.ROW_POP(r)) / 9));
    for (let cc = 0; cc < 6; cc++) {
      const px = TRAY.padL + TRAY.cw / 2 + cc * TRAY.cw;
      if (pop <= 0.01) continue;
      x.save();
      x.translate(px, py + 30);
      x.scale(pop, pop);
      withShadow(x, 5, 0.3);
      x.drawImage(cup.img, -58, -88);
      x.restore();
    }
    // row tags 1..7 (scene 3)
    const ts = E.outBack(clamp((f - (T.ROW_TAGS[0] + r * 5)) / 8)) * (1 - prog(T.ROW_TAGS_OUT, T.ROW_TAGS_OUT + 8, f));
    if (ts > 0.01) {
      x.save(); x.translate(TRAY.padL / 2 + 1, py); x.scale(ts, ts);
      withShadow(x, 3, 0.3);
      piece(x, cutCircle(0, 0, 20, 20, 960 + r, 0.5, 22), C.yellow, { margin: 2.5, grainA: 0.04 });
      noShadow(x);
      label(x, String(r + 1), 0, 1, 27, { fill: C.deep });
      x.restore();
    }
  }
  if (glow > 0) {
    x.save(); x.globalCompositeOperation = 'source-atop';
    x.fillStyle = `rgba(255,226,120,${0.38 * glow})`; x.fillRect(0, 0, TRAY.w, h);
    x.restore();
  }
  return c;
}

// ------------------------------------------------------------------ label textures
function cardTex(key, w, h, draw, fill = C.cream, border = C.violet) {
  const c = texCanvas(key, w, h);
  const x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(3, 3, w - 6, h - 6, 26), key.length * 7, 1.1, 14), border, { grainA: 0.06 });
  piece(x, cutPoly(roundRectPts(10, 10, w - 20, h - 20, 20), key.length * 7 + 1, 0.9, 14), fill, { grainA: 0.06 });
  draw(x);
  return c;
}
/** equation with the result coloured: parts = [[text, colour], ...] centred */
function eqText(x, parts, cx, cy, size) {
  x.save();
  x.font = `700 ${size}px ${FONT}`;
  const ws = parts.map(([t]) => x.measureText(t).width);
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  x.textBaseline = 'middle';
  parts.forEach(([t, col], i) => { x.fillStyle = col; x.fillText(t, px, cy); px += ws[i]; });
  x.restore();
}

// ------------------------------------------------------------------ states
export function foldAmount(f) {
  // 0 flat, 1 folded (panel forward + apart)
  let a = E.outBack(prog(T.FOLD[0], T.FOLD[1], f)) * (1 - E.inOutCubic(prog(T.UNFOLD[0], T.UNFOLD[1], f)));
  a += 0.45 * E.inOutCubic(prog(T.TAKEAWAY_OPEN[0], T.TAKEAWAY_OPEN[1], f)) * (1 - E.inOutCubic(prog(T.TAKEAWAY_CLOSE[0], T.TAKEAWAY_CLOSE[1], f)));
  return a;
}
function camera(f) {
  const k = (keys) => {
    let z = keys[0][1], cx = keys[0][2], cy = keys[0][3];
    for (let i = 1; i < keys.length; i++) {
      const [f0, z0, x0, y0] = keys[i - 1], [f1, z1, x1, y1] = keys[i];
      if (f >= f0) { const u = E.inOutCubic(prog(f0, f1, f)); z = lerp(z0, z1, u); cx = lerp(x0, x1, u); cy = lerp(y0, y1, u); }
    }
    return { z, cx, cy };
  };
  return k([
    [0, 1.1, CX, 900], [32, 1.0, CX, 960],
    [62, 1.0, CX, 960], [96, 1.08, CX, 1105], [112, 1.08, CX, 1105], [140, 1.0, CX, 960],
    [186, 1.0, CX, 960], [262, 1.035, CX, 900], [296, 1.035, CX, 900], // slow lean-in during the child's pause
    [330, 1.05, CX, 1150], [508, 1.05, CX, 1150], [540, 1.0, CX, 960],
    [616, 1.0, CX, 960], [646, 1.04, CX, 760], [690, 1.04, CX, 760], [722, 1.0, CX, 960],
  ]);
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: E.outBack(prog(6, 18, f)), lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'open', mouth: 'smile' };
  if (f % 80 < 3) st.eyes = 'closed';
  const shoulder = [st.x + 38 * st.s, st.y - 138 * st.s];
  const toward = (tx, ty) => Math.atan2(tx - shoulder[0], ty - shoulder[1]) / D2R;
  const fa = foldAmount(f);
  const handle = [TAB_X, 1420 + 44 * clamp(fa)];
  if (f < 60) {
    const w = prog(18, 26, f) * (1 - prog(52, 60, f));
    st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 24 * Math.sin(f * 0.45), w);
  } else if (f < 118) {
    const p = prog(64, 74, f) * (1 - prog(108, 116, f));
    st.aR = lerp(14, toward(TRAY.x + 40, HINGE_Y), p); st.fR = lerp(10, 0, p); st.head = -6 * p;
  } else if (f < 186) {
    st.head = -4; st.eyes = f % 80 < 3 ? 'closed' : 'open';
  } else if (f < 294) {
    // thinking pose during the question + quiet pause; nods as rows light
    const p = prog(188, 198, f);
    st.aL = lerp(14, 30, p); st.fL = lerp(10, -120, p); st.head = 8 * p;
    for (let r = 0; r < 5; r++) { const t = f - T.ROW_LIGHT(r); if (t >= 0 && t < 6) st.head = 8 - 6 * Math.sin((Math.PI * t) / 6); }
    if (f >= T.ROW_LIGHT(4) + 4) { st.eyes = 'happy'; st.mouth = 'open'; }
  } else if (f < 352) {
    // reach for the tab handle and pull it down
    const p = E.inOutCubic(prog(294, 302, f));
    st.aR = lerp(14, toward(handle[0], handle[1]), p); st.fR = lerp(10, -20, p); st.lean = 6 * p;
  } else if (f < 508) {
    st.aR = toward(handle[0], handle[1]); st.fR = -20;
    for (const g of [T.GLOW_UPPER, T.GLOW_LOWER]) { const c = pulse(f, g, 14); if (c > 0) { st.aL = lerp(14, 160, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  } else if (f < 616) {
    const p = E.inOutCubic(prog(508, 516, f)) * (1 - prog(548, 556, f));
    st.aR = lerp(14, toward(handle[0], handle[1]), p); st.fR = lerp(10, -20, p);
    const c = pulse(f, T.GLOW_ALL, 16); if (c > 0) { st.aL = lerp(14, 160, c); st.aR = lerp(st.aR, 160, c); st.hop = 14 * c; st.eyes = 'happy'; st.mouth = 'open'; }
  } else if (f < 800) {
    const p = prog(620, 630, f) * (1 - prog(684, 692, f));
    st.aR = lerp(14, toward(CX - 120, 520), p); st.fR = lerp(10, 0, p); st.head = -8 * p;
    const c = pulse(f, T.TAG_FLIP[1], 16); if (c > 0) { st.hop = 12 * c; st.eyes = 'happy'; st.mouth = 'open'; st.aL = lerp(14, 150, c); }
    if (f > 700) { st.eyes = 'happy'; }
  } else {
    const w = prog(826, 834, f);
    st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = f > 830 ? 'open' : 'smile';
    st.hop = 12 * pulse(f, 822, 14);
  }
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
function tagTex(f) {
  const flip = prog(T.TAG_FLIP[0], T.TAG_FLIP[1], f);
  const showAnswer = flip >= 0.5;
  return cardTex('tag', 440, 112, (x) => {
    eqText(x, [['7 × 6 = ', C.ink]], 160, 58, 66);
    // the answer box is its own little hinged flap
    const bx = 300, by = 18, bw = 118, bh = 78;
    const sy = Math.abs(Math.cos(flip * Math.PI)) || 0.02;
    x.save(); x.translate(0, by + bh / 2); x.scale(1, Math.max(0.03, sy)); x.translate(0, -(by + bh / 2));
    piece(x, cutPoly(roundRectPts(bx, by, bw, bh, 18), 970, 0.8, 10), showAnswer ? C.yellow : '#FFFFFF', { grainA: 0.04, edge: 'rgba(57,12,214,0.5)' });
    label(x, showAnswer ? '42' : '?', bx + bw / 2, by + bh / 2 + 3, 62, { fill: showAnswer ? C.deep : C.purple });
    x.restore();
  });
}
function tagTheta(f) {
  // folded up behind the bar = -90°, hanging = 0
  if (f < T.TAG_OUT[0]) return -Math.PI / 2 * (1 - E.outBack(prog(T.TAG_IN[0], T.TAG_IN[1], f)));
  if (f < T.TAG_BACK[0]) return -Math.PI / 2 * E.inCubic(prog(T.TAG_OUT[0], T.TAG_OUT[1], f));
  return -Math.PI / 2 * (1 - E.outBack(prog(T.TAG_BACK[0], T.TAG_BACK[1], f)));
}

function drawStage(ctx, f) {
  const fa = foldAmount(f);
  // ---- question tag hanging from the bar (top slot)
  const tth = tagTheta(f);
  if (Math.cos(tth) > 0.03) {
    const swing = Math.sin(f * 0.18) * 0.03 * Math.exp(-((f - (f < 300 ? 0 : T.TAG_BACK[0])) / 40));
    ctx.save();
    ctx.translate(CX, BAR_Y + 30); ctx.rotate(swing); ctx.translate(-CX, -(BAR_Y + 30));
    ctx.strokeStyle = 'rgba(42,22,80,0.6)'; ctx.lineWidth = 2.5;
    const tb = BAR_Y + 30 + 18 * Math.cos(tth);
    ctx.beginPath(); ctx.moveTo(CX - 120, BAR_Y + 30); ctx.lineTo(CX - 120, tb); ctx.moveTo(CX + 120, BAR_Y + 30); ctx.lineTo(CX + 120, tb); ctx.stroke();
    const glow = pulse(f, T.TAG_FLIP[1], 20);
    drawPlane(ctx, tagTex(f), { x: CX - 220, w: 440, hingeY: tb, h: 112, theta: tth, dir: 1, shadow: 0.6, warm: 0.25 * glow, shade: 0.25 * Math.max(0, -Math.sin(tth)) });
    ctx.restore();
  }
  // ---- "6" across the top (scene 3)
  const six = E.outBack(prog(T.COL_SIX[0], T.COL_SIX[0] + 10, f)) * (1 - prog(T.ROW_TAGS_OUT, T.ROW_TAGS_OUT + 8, f));
  if (six > 0.01) {
    const y = TRAY.y - 14;
    ctx.save(); ctx.globalAlpha *= clamp(six);
    ctx.strokeStyle = C.violet; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const x0 = cupX(0) - 40, x1 = cupX(5) + 40;
    ctx.beginPath(); ctx.moveTo(x0, y + 8); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 8); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate((x0 + x1) / 2, y - 26); ctx.scale(six, six);
    withShadow(ctx, 4, 0.3);
    piece(ctx, cutCircle(0, 0, 30, 30, 980, 0.6, 24), C.yellow, { margin: 3, grainA: 0.04 });
    noShadow(ctx); label(ctx, '6', 0, 2, 40, { fill: C.deep });
    ctx.restore();
  }
  // ---- top label flap: 5 × 6 = 30
  const topTh = f < T.LABEL_TOP ? -Math.PI / 2 : f < T.CHIP[0] ? -Math.PI / 2 * (1 - E.outBack(prog(T.LABEL_TOP, T.LABEL_TOP + 14, f))) : -Math.PI / 2 * E.inCubic(prog(T.CHIP[0], T.CHIP[0] + 14, f));
  if (Math.cos(topTh) > 0.03) {
    const tex = cardTex('top', 540, 104, (x) => eqText(x, [['5 × 6 = ', C.ink], ['30', C.purple]], 270, 55, 72));
    drawPlane(ctx, tex, { x: CX - 270, w: 540, hingeY: SLOT_Y, h: 104, theta: topTh, dir: -1, shadow: 0.7, warm: 0.3 * pulse(f, T.GLOW_UPPER, 20) });
    scoreLine(ctx, CX - 250, SLOT_Y + 2, CX + 250, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
  }
  // ---- tray: upper panel (rows 1–5) flat, lower panel (rows 6–7) hinged forward and apart
  const gUp = pulse(f, T.GLOW_UPPER, 22) + pulse(f, T.GLOW_ALL, 22);
  const gLo = pulse(f, T.GLOW_LOWER, 22) + pulse(f, T.GLOW_ALL, 22);
  const gap = 78 * fa;
  const theta = 34 * D2R * fa;
  // contact shadow of the whole tray on the page (only once it stands upright)
  if (f >= T.TRAY_RISE[1] + 10) {
    ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(40,16,60,0.30)';
    ctx.fillRect(TRAY.x + 14, TRAY.y + 22, TRAY.w, UP_H); ctx.restore();
  }
  const upTex = trayTex('up', 0, 5, 0, UP_H, f, clamp(gUp));
  if (f < T.TRAY_RISE[1] + 10) {
    // opening: the whole tray springs up from lying back on its base hinge (perspective), then settles
    const full = texCanvas('full', TRAY.w, TRAY.h);
    const fx = full.getContext('2d');
    fx.drawImage(upTex, 0, 0);
    fx.drawImage(trayTex('lo', 5, 7, UP_H, LO_H, f, 0), 0, UP_H);
    const th = -(70 * D2R) * (1 - E.outBack(prog(T.TRAY_RISE[0], T.TRAY_RISE[1], f)));
    drawPlane(ctx, full, { x: TRAY.x, w: TRAY.w, hingeY: TRAY.y + TRAY.h, h: TRAY.h, theta: th, dir: -1, F: 1700, shade: 0.35 * Math.max(0, -Math.sin(th)), warm: 0.18 * pulse(f, 4, 20) });
    drawTabAndPins(ctx, f, 0);
    return;
  }
  ctx.drawImage(upTex, TRAY.x, TRAY.y);
  // focus: dim the panel that is not being talked about
  const focusLo = prog(T.LOWER_FOCUS, T.LOWER_FOCUS + 8, f) * (1 - prog(T.UNFOLD[0], T.UNFOLD[0] + 8, f));
  if (focusLo > 0) { ctx.save(); ctx.globalAlpha = 0.22 * focusLo; ctx.fillStyle = '#2A1650'; pathFrom(ctx, roundRectPts(TRAY.x + 4, TRAY.y + 4, TRAY.w - 8, UP_H - 4, 30)); ctx.fill(); ctx.restore(); }
  // accordion hinge strip in the gap
  if (gap > 1) {
    const yA = HINGE_Y, yB = HINGE_Y + gap, ym = (yA + yB) / 2;
    ctx.save();
    ctx.fillStyle = '#F3E2C4'; ctx.fillRect(TRAY.x + 24, yA, TRAY.w - 48, ym - yA);
    ctx.fillStyle = '#D9C29C'; ctx.fillRect(TRAY.x + 24, ym, TRAY.w - 48, yB - ym);
    ctx.fillStyle = 'rgba(40,16,60,0.35)'; ctx.fillRect(TRAY.x + 24, yA, TRAY.w - 48, 6);
    scoreLine(ctx, TRAY.x + 30, ym, TRAY.x + TRAY.w - 30, ym, 'rgba(80,50,20,0.45)', 2);
    ctx.restore();
  }
  const loTex = trayTex('lo', 5, 7, UP_H, LO_H, f, clamp(gLo));
  const lo = drawPlane(ctx, loTex, {
    x: TRAY.x, w: TRAY.w, hingeY: HINGE_Y + gap, h: LO_H, theta, dir: 1, shadow: 0.4 + 0.8 * fa,
    shade: 0.10 * fa, warm: 0.10 * fa,
  });
  // the score line + brass pins of the hinge
  const draw = prog(T.HINGE_DRAW[0], T.HINGE_DRAW[1], f);
  if (draw > 0) {
    const x1 = TRAY.x + 20 + (TRAY.w - 40) * draw;
    if (gap < 2) {
      ctx.save(); ctx.globalAlpha = 0.55 * pulse(f, T.HINGE_DRAW[0], T.HINGE_DRAW[1] - T.HINGE_DRAW[0] + 24);
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(TRAY.x + 20, HINGE_Y); ctx.lineTo(x1, HINGE_Y); ctx.stroke(); ctx.restore();
      scoreLine(ctx, TRAY.x + 20, HINGE_Y, x1, HINGE_Y, 'rgba(42,22,80,0.85)', 5);
    }
    if (draw < 1) sparkle(ctx, x1, HINGE_Y, 22, '#FFFFFF');
    const pinS = E.outBack(prog(T.HINGE_DRAW[0], T.HINGE_DRAW[0] + 8, f));
    for (const px of [TRAY.x + 10, TRAY.x + TRAY.w - 10]) {
      for (const py of gap > 1 ? [HINGE_Y, HINGE_Y + gap] : [HINGE_Y]) splitPin(ctx, px, py, 12 * pinS);
    }
    const gl = pulse(f, T.HINGE_DRAW[1], 16);
    if (gl > 0) { sparkle(ctx, TRAY.x + 10, HINGE_Y, 26 * gl, C.yellow); sparkle(ctx, TRAY.x + TRAY.w - 10, HINGE_Y, 26 * gl, C.yellow); }
  }
  drawTabAndPins(ctx, f, gap);
  // ---- bottom label flap hanging from the lower panel
  const loBottom = lo.y;
  const bTh = (() => {
    if (f < T.LABEL_BOTTOM) return Math.PI / 2;
    let th = (Math.PI / 2) * (1 - E.outBack(prog(T.LABEL_BOTTOM, T.LABEL_BOTTOM + 14, f)));
    for (const [a, b] of [T.FLAP_FLIP, T.FLAP_FLIP2]) { const u = prog(a, b, f); if (u > 0 && u < 1) th = (Math.PI / 2) * Math.sin(Math.PI * u); }
    return th;
  })();
  if (Math.cos(bTh) > 0.03) {
    const face = f < (T.FLAP_FLIP[0] + T.FLAP_FLIP[1]) / 2 ? 0 : f < (T.FLAP_FLIP2[0] + T.FLAP_FLIP2[1]) / 2 ? 1 : 2;
    const tex = cardTex(`bot${face}`, 540, 100, (x) => {
      if (face === 0) eqText(x, [['2 × 6 = ', C.ink], ['12', C.orange]], 270, 53, 70);
      else if (face === 1) eqText(x, [['30', C.purple], [' + ', C.ink], ['12', C.orange], [' = ', C.ink], ['42', C.violet]], 270, 53, 70);
      else eqText(x, [['5 × 6', C.purple], [' + ', C.ink], ['2 × 6', C.orange]], 270, 53, 68);
    }, face === 1 ? '#FFF6C9' : C.cream);
    drawPlane(ctx, tex, { x: CX - 270 * lo.k, w: 540 * lo.k, hingeY: loBottom + 4, h: 100 * lo.k, theta: bTh, dir: 1, shadow: 0.7, warm: 0.3 * (pulse(f, T.GLOW_LOWER, 20) + pulse(f, T.GLOW_ALL, 20)) });
  }
  // ---- "30" chip travelling from the top flap to the bottom flap
  if (f >= T.CHIP[0] && f < T.CHIP[1] + 2) {
    const u = E.inOutSine(clamp((f - T.CHIP[0]) / (T.CHIP[1] - T.CHIP[0])));
    // route: left along the slot above the tray, down the left margin, then right into the lower flap,
    // so the chip never passes over a counted cupcake (tray spans x 148-852, rows y 605-1305)
    const R = [[CX + 152, 514], [90, 514], [90, loBottom + 54], [CX - 170, loBottom + 54]];
    const segs = R.slice(1).map((q, i) => Math.hypot(q[0] - R[i][0], q[1] - R[i][1]));
    const total = segs.reduce((a2, b2) => a2 + b2, 0);
    const at = (t) => { let d = t * total; for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const k = clamp(d / segs[i]); return [lerp(R[i][0], R[i + 1][0], k), lerp(R[i][1], R[i + 1][1], k)]; } d -= segs[i]; } return R[3]; };
    ctx.save(); ctx.fillStyle = 'rgba(57,12,214,0.35)';
    for (let k = 0; k <= 40; k++) { if (k / 40 > u) break; const q = at(k / 40); ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    const [qx, qy] = at(u);
    ctx.save(); ctx.translate(qx, qy); withShadow(ctx, 14, 0.35);
    piece(ctx, cutCircle(0, 0, 48, 48, 995, 0.8, 26), C.yellow, { margin: 3, grainA: 0.04 });
    noShadow(ctx); label(ctx, '30', 0, 3, 50, { fill: C.purple });
    ctx.restore();
  }
}

function drawTabAndPins(ctx, f, gap) {
  // pull tab in its slot (left of the tray), attached to the lower panel
  const hy = 1420 + 44 * clamp(foldAmount(f));
  ctx.save(); withShadow(ctx, 5, 0.3);
  piece(ctx, cutPoly([[TAB_X - 7, HINGE_Y + gap + 4], [TAB_X + 7, HINGE_Y + gap + 4], [TAB_X + 7, hy], [TAB_X - 7, hy]], 990, 0.5, 12), C.kraftLt, { margin: 1.5, grainA: 0.05 });
  piece(ctx, cutPoly(roundRectPts(TAB_X - 20, hy - 6, 40, 58, 14), 991, 0.6, 10), C.orange, { margin: 2.5, grainA: 0.05 });
  ctx.restore();
  splitPin(ctx, TAB_X, hy + 10, 5);
}

function drawLamp(ctx, f) {
  // hanging paper lamp, top-left: motivates the warm key light
  const lx = 92, sw = Math.sin(f * 0.05) * 0.04;
  ctx.save(); ctx.translate(lx, BAR_Y + 38); ctx.rotate(sw);
  ctx.strokeStyle = 'rgba(42,22,80,0.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 64); ctx.stroke();
  const g = ctx.createRadialGradient(0, 120, 4, 0, 120, 120);
  g.addColorStop(0, 'rgba(255,224,140,0.55)'); g.addColorStop(1, 'rgba(255,224,140,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 120, 120, 0, Math.PI * 2); ctx.fill();
  withShadow(ctx, 6, 0.25);
  piece(ctx, cutPoly([[-46, 112], [46, 112], [26, 64], [-26, 64]], 1201, 0.8, 8), C.orange, { margin: 2.5, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,240,180,0.95)'; ctx.beginPath(); ctx.arc(0, 118, 11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

let FLOORPROPS = null;
function floorProps() {
  // pop-up rolling pin + flour sack on the floor page, bottom-right (decor, not counted objects)
  if (FLOORPROPS) return FLOORPROPS;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.save(); withShadow(x, 10, 0.3);
  piece(x, cutPoly([[790, 1720], [930, 1720], [950, 1590], [900, 1560], [820, 1560], [770, 1590]], 1301, 1.4, 12), '#F3E3C3', { margin: 3, grainA: 0.12 });
  x.restore();
  x.fillStyle = C.violet; x.fillRect(776, 1626, 168, 26);
  x.fillStyle = 'rgba(255,255,255,0.8)'; for (const [px, py] of [[835, 1580], [870, 1574], [852, 1592]]) { x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.fill(); }
  x.save(); withShadow(x, 8, 0.3); x.translate(640, 1760); x.rotate(-0.12);
  piece(x, cutPoly(roundRectPts(-120, -20, 240, 40, 20), 1302, 0.8, 12), '#E7C38E', { margin: 2.5, grainA: 0.12 });
  piece(x, cutPoly(roundRectPts(-170, -10, 52, 20, 10), 1303, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  piece(x, cutPoly(roundRectPts(118, -10, 52, 20, 10), 1304, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  x.restore();
  FLOORPROPS = c;
  return c;
}

function drawCTA(ctx, f) {
  ctx.drawImage(ctaPageArt(), 0, 0);
  const s = E.outBack(prog(T.CTA_POP, T.CTA_POP + 14, f));
  const cx = CX, cy = 840, sz = 330;
  if (s > 0.01) {
    // icon card on a V-fold: rises from the page on its base hinge
    const tex = texCanvas('icon', sz + 24, sz + 24);
    const x = tex.getContext('2d');
    piece(x, cutPoly(roundRectPts(2, 2, sz + 20, sz + 20, 78), 12, 1, 14), '#FFFFFF', { grainA: 0.03 });
    x.save(); pathFrom(x, roundRectPts(12, 12, sz, sz, 70)); x.clip(); x.drawImage(ICON, 12, 12, sz, sz); x.restore();
    drawPlane(ctx, tex, { x: cx - (sz + 24) / 2, w: sz + 24, hingeY: cy + sz / 2 + 12, h: sz + 24, theta: -(Math.PI / 2) * (1 - s), dir: -1, shadow: 0.9 });
  }
  const word = 'TableVerse', size = 122;
  ctx.save(); ctx.font = `700 ${size}px ${FONT}`;
  const ws = [...word].map((ch) => ctx.measureText(ch).width);
  ctx.restore();
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  [...word].forEach((ch, i) => {
    const t = f - (T.CTA_POP + 8 + i * 2);
    const sc = t < 0 ? 0 : E.outBack(clamp(t / 8));
    if (sc > 0) {
      ctx.save(); ctx.translate(px + ws[i] / 2, 1130); ctx.scale(sc, sc);
      ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#FFFDF8'; ctx.strokeText(ch, 0, 0);
      const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, C.yellow); g.addColorStop(1, C.orange);
      ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    px += ws[i];
  });
  const ps = E.outBack(prog(T.CTA_POP + 26, T.CTA_POP + 36, f));
  if (ps > 0.01) {
    ctx.save(); ctx.translate(cx, 1255); ctx.scale(ps, ps);
    withShadow(ctx, 8, 0.4, '5,0,30');
    piece(ctx, cutPoly(roundRectPts(-210, -38, 420, 76, 38), 13, 0.9, 12), C.cream, { margin: 3, grainA: 0.05 });
    noShadow(ctx); label(ctx, 'on Google Play', 0, 2, 48, { fill: C.deep });
    ctx.restore();
  }
}

function drawHingeBar(ctx) {
  ctx.save(); withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(BOOK.x - 20, BAR_Y, BOOK.w + 40, 40, 14), 500, 1, 16), C.violet, { grainA: 0.1 });
  ctx.restore();
  for (let k = 0; k < 8; k++) {
    const rx = BOOK.x + 70 + k * ((BOOK.w - 140) / 7);
    ctx.lineWidth = 7; ctx.strokeStyle = C.brassDk; ctx.beginPath(); ctx.ellipse(rx, BAR_Y + 34, 9, 20, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#F2CB61'; ctx.stroke();
  }
}

function drawCaptions(ctx, f) {
  for (let ci = 0; ci < T.CAPTIONS.length; ci++) {
    const [lines, a, b] = T.CAPTIONS[ci];
    if (f < a || f >= b) continue;
    // a caption that continues the previous one (same first line, back-to-back) updates without re-popping
    const prev = T.CAPTIONS[ci - 1], next = T.CAPTIONS[ci + 1];
    const contIn = prev && prev[2] === a && prev[0][0] === lines[0];
    const contOut = next && next[1] === b && next[0][0] === lines[0];
    const pin = contIn ? 1 : E.outBack(clamp((f - a) / 7));
    const aIn = contIn ? 1 : clamp((f - a) / 4), aOut = contOut || b >= T.FRAMES ? 1 : 1 - clamp((f - (b - 5)) / 5);
    const size = 54, lh = 64;
    const wmax = Math.max(...lines.map((l) => measure(ctx, l, size)));
    const bw = Math.min(800, wmax + 64), bh = lines.length * lh + 28;
    ctx.save();
    ctx.globalAlpha *= aIn * aOut;
    ctx.translate(CX, 318);
    ctx.scale(0.93 + 0.07 * pin, 0.93 + 0.07 * pin);
    withShadow(ctx, 8, 0.25);
    piece(ctx, cutPoly(roundRectPts(-bw / 2, -bh / 2, bw, bh, 22), 700 + ci, 1.1, 16), '#FFFDF8', { grainA: 0.05, edge: 'rgba(57,12,214,0.35)' });
    noShadow(ctx);
    ctx.fillStyle = C.violet; ctx.fillRect(-bw / 2 + 16, -bh / 2 + 8, 6, bh - 16);
    lines.forEach((ln, k) => label(ctx, ln, 6, (k - (lines.length - 1) / 2) * lh + 3, size, { fill: C.ink }));
    ctx.restore();
  }
}

function drawBunting(ctx, f) {
  const cols = [C.violet, C.cream, C.purple, C.lilac, C.orange, C.cream, C.violet, C.yellow, C.purple, C.lilac, C.cream];
  const sway = Math.sin(f * 0.05) * 5;
  const yAt = (x) => 70 + 60 * (1 - Math.pow((x - 540) / 600, 2)) + sway * Math.sin((x / 1080) * Math.PI);
  ctx.strokeStyle = 'rgba(42,22,80,0.4)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); for (let x = -20; x <= 1100; x += 20) (x === -20 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x))); ctx.stroke();
  for (let k = 0; k < 11; k++) {
    const x0 = 20 + k * 96, x1 = x0 + 70, y0 = yAt(x0), y1 = yAt(x1);
    ctx.save(); withShadow(ctx, 5, 0.18);
    piece(ctx, cutPoly([[x0, y0], [x1, y1], [(x0 + x1) / 2 + Math.sin(f * 0.08 + k) * 4, (y0 + y1) / 2 + 64]], 600 + k, 0.8, 9), cols[k], { margin: 2, grainA: 0.06 });
    ctx.restore();
  }
}

let FG = null;
function foreground() {
  // out-of-focus paper leaves at the bottom corners (closest depth layer)
  if (FG) return FG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.filter = 'blur(7px)';
  const leaf = (px, py, r, a, col) => { x.save(); x.translate(px, py); x.rotate(a); x.beginPath(); x.ellipse(0, 0, r, r * 0.42, 0, 0, Math.PI * 2); x.fillStyle = col; x.fill(); x.restore(); };
  leaf(-10, 1830, 150, -0.5, 'rgba(57,12,214,0.85)'); leaf(90, 1900, 130, 0.3, 'rgba(145,31,249,0.8)');
  leaf(1100, 1820, 160, 0.6, 'rgba(209,152,250,0.85)'); leaf(980, 1920, 120, -0.2, 'rgba(57,12,214,0.75)');
  x.filter = 'none';
  FG = c;
  return c;
}

// ------------------------------------------------------------------ main
let PAGEBUF = null;
export function drawFrame(ctx, f) {
  if (!PAGEBUF) PAGEBUF = createCanvas(W, BOOK.bot + 4);
  const cam = camera(f);
  // background (blurred, slow parallax)
  ctx.save(); applyCam(ctx, cam, 0.35); ctx.drawImage(background(), -110, -110); ctx.restore();
  ctx.save(); applyCam(ctx, cam, 0.6); drawBunting(ctx, f); ctx.restore();

  // book (boards, stack, floor) + pages
  ctx.save(); applyCam(ctx, cam, 1.0);
  ctx.drawImage(bookArt(), 0, 0);
  const turning = f >= T.PAGE_TURN[0];
  if (turning) drawCTA(ctx, f);
  if (f < T.PAGE_TURN[1]) {
    const b = PAGEBUF.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, W, BOOK.bot + 4);
    b.drawImage(pagePrint(), 0, 0);
    drawStage(b, f);
    if (!turning) ctx.drawImage(PAGEBUF, 0, 0);
    else {
      const p = E.inOutSine(prog(T.PAGE_TURN[0], T.PAGE_TURN[1], f));
      const th = p * 89.5 * D2R;
      drawPlane(ctx, PAGEBUF, { x: 0, w: W, hingeY: BOOK.y, h: BOOK.bot - BOOK.y + 4, theta: th, dir: 1, F: 4000, n: 120, sy: BOOK.y, sh: BOOK.bot - BOOK.y + 4, shadow: 0.8, shade: 0.35 * p, warm: 0.15 * p });
    }
  }
  drawHingeBar(ctx);
  drawLamp(ctx, f);
  ctx.drawImage(floorProps(), 0, 0);
  drawBaker(ctx, bakerState(f));
  ctx.restore();

  // closest layer
  ctx.save(); applyCam(ctx, cam, 1.25); ctx.drawImage(foreground(), 0, 0); ctx.restore();

  // warm key light from the top-left + vignette
  const lg = ctx.createRadialGradient(300, 520, 80, 420, 900, 1250);
  lg.addColorStop(0, 'rgba(255,240,205,0.16)'); lg.addColorStop(0.6, 'rgba(255,240,205,0)'); lg.addColorStop(1, 'rgba(50,20,70,0.28)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  drawCaptions(ctx, f);
  applyGrain(ctx, 0, 0, W, H, 0.03, 'overlay');
}

// ------------------------------------------------------------------ thumbnail (separate vertical image)
export function drawThumbnail(ctx) {
  const f = 400; // tray folded, both flaps visible
  ctx.drawImage(background(), -110, -110);
  ctx.drawImage(bookArt(), 0, 0);
  const b = createCanvas(W, BOOK.bot + 4).getContext('2d');
  b.drawImage(pagePrint(), 0, 0);
  drawStage(b, 470);
  ctx.drawImage(b.canvas, 0, 0);
  drawHingeBar(ctx);
  drawBaker(ctx, { ...bakerState(470), eyes: 'happy', mouth: 'open' });
  ctx.drawImage(foreground(), 0, 0);
  // big hook words: "7 × 6?" and "SPLIT IT!"
  const big = (text, y, size, fill, rot) => {
    ctx.save(); ctx.translate(CX, y); ctx.rotate(rot * D2R);
    ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(text).width;
    withShadow(ctx, 14, 0.35);
    piece(ctx, cutPoly(roundRectPts(-w / 2 - 40, -size * 0.62, w + 80, size * 1.24, 36), 77 + size, 1.4, 16), '#FFFDF8', { grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
    noShadow(ctx);
    ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = '#FFFFFF'; ctx.strokeText(text, 0, 4);
    ctx.fillStyle = fill; ctx.fillText(text, 0, 4);
    ctx.restore();
  };
  big('7 × 6?', 250, 190, C.deep, -2);
  big('SPLIT IT!', 1690, 150, C.purple, 2);
  const lg = ctx.createRadialGradient(300, 520, 80, 420, 900, 1250);
  lg.addColorStop(0, 'rgba(255,240,205,0.14)'); lg.addColorStop(1, 'rgba(50,20,70,0.25)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
}
