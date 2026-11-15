// "The Robot That Packs in Tens" (4 × 30 = 12 tens = 120) — Pop-up Counting Storybook, depth edition (english-17).
// Every hinge is drawn with real perspective (strip-projected planes), the background has depth of field,
// camera moves are motivated and parallaxed, and planes are lit by a warm key light from the top-right (lamp + window).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow, scoreLine, splitPin,
  sparkle, label, measure, chocCookieSprite, cookieSliceSprite,
} from './craft.mjs';
import { drawRobot } from './robot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout (world px)
const CX = 500; // composition centre (captions live in x 100–900)
const TRAY = { x: 170, y: 616, w: 700, h: 508 }; // 4 rows; each row = 2 lines of 15 cookies (30)
const ROWS = 4;
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 590; // hinge line of the top flip card
const CARD_CX = TRAY.x + TRAY.w / 2;
const ROBOT = { x: 250, y: 1668, s: 1.25 };
const CRATE = { x: 572, y: 1196, w: 296, h: 244 };
const TUBE = { w: 214, h: 60 };
const cookiePos = (r, col, line) => [212 + col * 44, 662 + r * 124 + line * 42];
const tubeHome = (t) => [300 + 220 * (t % 3), 683 + Math.floor(t / 3) * 124];
const crateSlot = (k) => [CRATE.x + 83 + (k % 2) * 130, CRATE.y + 58 + Math.floor(k / 2) * 37];
const CRATE_SC = 0.55;

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
  // shelves with bread loaves, jars, rolling pins (no cookies: counted objects stay on the tray only)
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

// ------------------------------------------------------------------ textures: tray, tubes, crate
const TEX = {};
function texCanvas(key, w, h) {
  if (!TEX[key]) TEX[key] = createCanvas(w, h);
  const c = TEX[key];
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, w, h);
  return c;
}
function pulse(f, f0, len = 18) {
  const t = f - f0;
  return t >= 0 && t < len ? Math.sin((Math.PI * t) / len) : 0;
}
let TRAYTEX = null;
function trayTex() {
  if (TRAYTEX) return TRAYTEX;
  const c = createCanvas(TRAY.w, TRAY.h), x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(2, 2, TRAY.w - 4, TRAY.h - 4, 30), 950, 1.2, 14), C.violet, { grainA: 0.1 });
  const g = x.createLinearGradient(0, 0, 0, TRAY.h);
  g.addColorStop(0, '#FFF7EC'); g.addColorStop(1, '#F2E6D4');
  piece(x, cutPoly(roundRectPts(13, 13, TRAY.w - 26, TRAY.h - 26, 22), 951, 1.0, 14), g, { grainA: 0.1 });
  TRAYTEX = c;
  return c;
}
// ten slices sit fully between the two end caps (caps cover |x| > 95 only), so all ten are always countable
const SLICE_X = (i) => -78.75 + i * 17.5;
let TUBEBACK = null, TUBEFRONT = null;
function tubeLayers() {
  if (TUBEBACK) return;
  const pad = 10, w = TUBE.w + pad * 2, h = TUBE.h + pad * 2;
  TUBEBACK = createCanvas(w, h); TUBEFRONT = createCanvas(w, h);
  let x = TUBEBACK.getContext('2d');
  const body = cutPoly(roundRectPts(pad + 10, pad, TUBE.w - 20, TUBE.h, 28), 1901, 0.5, 12);
  pathFrom(x, body); x.fillStyle = 'rgba(214,196,255,0.30)'; x.fill();
  x = TUBEFRONT.getContext('2d');
  x.save(); pathFrom(x, body); x.clip();
  x.fillStyle = 'rgba(255,255,255,0.32)'; x.fillRect(pad + 14, pad + 6, TUBE.w - 28, 9);
  x.fillStyle = 'rgba(255,255,255,0.14)'; x.fillRect(pad + 14, pad + TUBE.h - 14, TUBE.w - 28, 5);
  x.restore();
  pathFrom(x, body); x.lineJoin = 'round';
  x.lineWidth = 9; x.strokeStyle = '#FFFDF8'; x.stroke();
  x.lineWidth = 4.5; x.strokeStyle = C.violet; x.stroke();
  for (const ex of [pad, pad + TUBE.w - 12]) {
    x.save(); withShadow(x, 3, 0.25);
    piece(x, cutPoly(roundRectPts(ex, pad - 5, 12, TUBE.h + 10, 6), 1902 + ex, 0.4, 8), C.purple, { margin: 2.5, grainA: 0.05 });
    x.restore();
  }
}
function drawTube(ctx, cx, cy, sc, n, glow = 0) {
  tubeLayers();
  const pad = 10, sl = cookieSliceSprite();
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
    g.addColorStop(0, `rgba(255,214,120,${0.55 * glow})`); g.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = g; ctx.fillRect(-150, -90, 300, 180);
  }
  withShadow(ctx, 5, 0.22);
  ctx.drawImage(TUBEBACK, -TUBE.w / 2 - pad, -TUBE.h / 2 - pad);
  noShadow(ctx);
  for (let i = 0; i < n; i++) ctx.drawImage(sl.img, SLICE_X(i) - 10, -26);
  ctx.drawImage(TUBEFRONT, -TUBE.w / 2 - pad, -TUBE.h / 2 - pad);
  ctx.restore();
}
let CRATETEX = null;
function crateTex() {
  if (CRATETEX) return CRATETEX;
  const c = createCanvas(CRATE.w, CRATE.h), x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(3, 3, CRATE.w - 6, CRATE.h - 6, 18), 1910, 1.0, 12), C.kraft, { margin: 3, grainA: 0.14 });
  piece(x, cutPoly(roundRectPts(16, 22, CRATE.w - 32, CRATE.h - 40, 12), 1911, 0.7, 12), '#F6E3BE', { grainA: 0.1, edge: 'rgba(120,70,20,0.3)' });
  x.fillStyle = 'rgba(120,70,20,0.18)'; x.fillRect(16, 22, CRATE.w - 32, 8);
  TEX.crate = c; CRATETEX = c;
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
    [0, 1.0, CX, 960], [364, 1.0, CX, 960], [398, 1.035, 520, 900], [440, 1.035, 520, 900], [470, 1.0, CX, 960], // lean-in during the question
    [600, 1.0, CX, 960], [612, 1.03, 520, 800], [636, 1.03, 520, 800], [660, 1.0, CX, 960], // the answer card
  ]);
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}
// ---- packing: tube t (0..11, row-major) takes the 2 × 5 block of ten cookies under it
const HOP = 8;
const depart = (t, k) => T.PACK_AT(t) + 3 + k * 0.9;
function cookieOf(t, k) {
  const r = Math.floor(t / 3), b = t % 3;
  return cookiePos(r, 5 * b + Math.floor(k / 2), k % 2);
}
function tubeState(t, f) {
  const s = T.PACK_AT(t);
  if (f < s) return null;
  let n = 0;
  for (let k = 0; k < 10; k++) if (f >= depart(t, k) + HOP) n++;
  const [hx, hy] = tubeHome(t);
  let x = hx, y = hy, sc = E.outBack(prog(s, s + 6, f)), where = 'home';
  if (t < 10) {
    const l0 = T.TO_CRATE[0] + t * T.TO_CRATE[1], l1 = l0 + T.TO_CRATE[2];
    const b0 = T.BACK[0] + t * T.BACK[1], b1 = b0 + T.BACK[2];
    const [cx, cy] = crateSlot(t);
    const fly = (ax, ay, bx, by, s0, s1, u) => { const e = E.inOutCubic(u); x = lerp(ax, bx, e); y = lerp(ay, by, e) - 90 * Math.sin(Math.PI * u); sc = lerp(s0, s1, e); where = 'fly'; };
    if (f >= l0 && f < l1) fly(hx, hy, cx, cy, 1, CRATE_SC, prog(l0, l1, f));
    else if (f >= l1 && f < b0) { x = cx; y = cy; sc = CRATE_SC; where = 'crate'; }
    else if (f >= b0 && f < b1) fly(cx, cy, hx, hy, CRATE_SC, 1, prog(b0, b1, f));
  }
  const glow = (t < 3 ? pulse(f, T.ROW1_GLOW, 24) : 0) + (t >= 10 ? pulse(f, T.TWENTY, 34) : 0) + pulse(f, T.ALL_GLOW, 26) + 0.6 * pulse(f, s + T.PACK_LEN - 1, 12);
  return { x, y, sc, n, where, glow };
}
function crateAmount(f) {
  return E.outBack(prog(T.CRATE_UP[0], T.CRATE_UP[1], f)) * (1 - E.inCubic(prog(T.CRATE_DOWN[0], T.CRATE_DOWN[1], f)));
}
function countIndex(f) { return Math.min(14, 2 + Math.floor(f / T.COUNT_HOP)); } // hook: the robot counts one by one (frame 0 = "3")

function robotState(f) {
  const st = { x: ROBOT.x, y: ROBOT.y, s: ROBOT.s, tilt: 0, bob: 0, wheel: 0, armL: 20, armR: 20, elbL: 10, elbR: 10, face: 'happy', look: 0, bulb: 0, sweat: 0, steam: 0, headTilt: 0, t: f };
  const aim = (tx, ty) => { const shx = st.x + 70 * st.s, shy = st.y - st.bob - 168 * st.s; let d = Math.atan2(tx - shx, ty - shy) / D2R; if (d < 0) d += 360; return clamp(d, 0, 155); };
  const cheer = (c) => { if (c > 0) { st.armL = lerp(st.armL, 150, c); st.armR = lerp(st.armR, 150, c); st.elbL = st.elbR = 0; st.bob = Math.max(st.bob, 14 * c); st.face = 'happy'; } };
  if (f < 104) {
    // overwhelmed: counting one cookie at a time
    st.face = 'dizzy'; st.sweat = 1 - prog(96, 110, f); st.steam = 1 - prog(92, 106, f);
    st.tilt = 3 * Math.sin(f * 0.9); st.headTilt = 4 * Math.sin(f * 0.45);
    const [cx, cy] = cookiePos(0, countIndex(f), 0);
    st.armR = aim(cx, cy); st.elbR = 0; st.armL = 40 + 10 * Math.sin(f * 0.5); st.elbL = 60;
  } else if (f < 156) {
    // light bulb: pack them in tens
    st.face = 'idea'; st.sweat = 1 - prog(96, 110, f);
    st.bulb = prog(T.IDEA - 4, T.IDEA + 4, f) * (1 - prog(148, 160, f)) * (0.82 + 0.18 * Math.sin(f * 0.6));
    st.armL = lerp(40, 152, E.outBack(prog(T.IDEA - 2, T.IDEA + 8, f))); st.elbL = 0;
    st.bob = 12 * pulse(f, T.IDEA, 16);
  } else if (f < T.FAST[0]) {
    st.face = 'happy';
    const t = f < T.PACK_AT(1) ? 0 : f < T.PACK_AT(2) ? 1 : 2;
    const [tx, ty] = tubeHome(t); st.armR = aim(tx, ty); st.elbR = 0;
    for (let k = 0; k < 3; k++) st.bob = Math.max(st.bob, 8 * pulse(f, T.PACK_AT(k) + T.PACK_LEN - 1, 10));
    if (f >= 244 && f < 282) st.headTilt = 6 * Math.sin((f - 244) * 0.33);
  } else if (f < 362) {
    // top speed: zooms left and right under the tray, arms pumping
    const env = Math.sin(Math.PI * prog(T.FAST[0], T.FAST[1] + 6, f));
    st.x = ROBOT.x + 70 * Math.sin((f - T.FAST[0]) * 0.22) * env;
    st.face = 'happy'; st.armR = 105 + 45 * Math.sin(f * 0.6) * env; st.armL = 105 - 45 * Math.sin(f * 0.6) * env; st.elbL = st.elbR = 20;
    st.tilt = -7 * Math.cos((f - T.FAST[0]) * 0.22) * env; st.bob = 5 * Math.abs(Math.sin(f * 0.6)) * env;
  } else if (f < T.TAGS[0]) {
    // the question: thinks, scratches its head
    const u = E.inOutSine(prog(362, 380, f));
    st.face = 'think'; st.armL = lerp(20, 140, u); st.elbL = lerp(10, 80, u) + 8 * Math.sin(f * 0.8) * u; st.headTilt = 8 * u;
  } else if (f < 490) {
    st.face = 'open'; st.look = 1;
    const t = clamp(Math.floor((f - T.TAGS[0]) / T.TAGS[1]), 0, 11);
    const [tx, ty] = tubeHome(t); st.armR = aim(tx, ty); st.elbR = 0;
  } else if (f < 520) {
    st.face = 'happy'; cheer(pulse(f, 490, 28));
  } else if (f < 646) {
    st.face = f < T.HUNDRED ? 'open' : 'happy'; st.look = 1;
    st.armR = aim(CRATE.x + 150, CRATE.y + 110); st.elbR = 0;
    cheer(pulse(f, T.HUNDRED, 20)); cheer(pulse(f, 612, 24));
  } else if (f < T.DANCE[0]) {
    st.face = 'happy';
    st.armR = aim(CARD_CX, 540); st.elbR = 0;
    if (f >= 676 && f < 700) st.headTilt = 6 * Math.sin((f - 676) * 0.4);
  } else {
    const d = Math.sin(Math.PI * prog(T.DANCE[0], T.DANCE[1], f));
    st.face = 'happy';
    st.tilt = 8 * Math.sin((f - T.DANCE[0]) * 0.35) * d; st.x = ROBOT.x + 22 * Math.sin((f - T.DANCE[0]) * 0.175) * d;
    st.armL = 20 + (75 + 55 * Math.sin(f * 0.35)) * d; st.armR = 20 + (75 - 55 * Math.sin(f * 0.35)) * d; st.elbL = st.elbR = 30 * d;
    st.bob = 10 * Math.abs(Math.sin(f * 0.35)) * d;
    if (f >= 836) { const w = prog(836, 846, f); st.armR = lerp(20, 148, w); st.elbR = lerp(10, 22 + 28 * Math.sin(f * 0.45), w); }
  }
  // CTA: rolls to the left so the end card's wordmark and badge stay clear
  const m = E.inOutCubic(prog(798, 826, f));
  if (m > 0) st.x = lerp(st.x, 150, m);
  st.wheel = (st.x - ROBOT.x) / (28 * st.s);
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
const CARD_FACES = [
  [['4 × 30 = ', 'ink'], ['?', 'purple']],
  [['4 × 30 = ', 'ink'], ['120', 'purple']],
  [['4 × 3 = ', 'ink'], ['12', 'violet']],
  [['4 × 30 = ', 'ink'], ['120', 'purple']],
];
function cardState(f) {
  let face = 0, theta = 0;
  for (const [f0, fi] of T.CARD_FLIPS) {
    const u = prog(f0, f0 + 14, f);
    if (u >= 0.5) face = fi;
    if (u > 0 && u < 1) theta = -(Math.PI / 2) * Math.sin(Math.PI * u);
  }
  return { face, theta };
}
function sticker(ctx, x, y, r, text, size, sc, fill = C.yellow) {
  if (sc <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
  withShadow(ctx, 4, 0.3);
  piece(ctx, cutCircle(0, 0, r, r, 970 + text.length * 3 + Math.round(x), 0.5, 26), fill, { margin: 3, grainA: 0.04 });
  noShadow(ctx); label(ctx, text, 0, 1, size, { fill: C.deep });
  ctx.restore();
}
function drawStage(ctx, f) {
  // ---- top flip card
  const cs = cardState(f);
  if (Math.cos(cs.theta) > 0.03) {
    const parts = CARD_FACES[cs.face].map(([t, col]) => [t, C[col]]);
    const tex = cardTex(`card${cs.face}`, 560, 100, (x) => eqText(x, parts, 280, 53, 74), cs.face >= 1 ? '#FFF6C9' : C.cream);
    drawPlane(ctx, tex, { x: CARD_CX - 280, w: 560, hingeY: SLOT_Y, h: 100, theta: cs.theta, dir: -1, shadow: 0.7, warm: 0.32 * (pulse(f, 612, 22) + pulse(f, 677, 22) + pulse(f, 738, 22)) });
    scoreLine(ctx, CARD_CX - 260, SLOT_Y + 2, CARD_CX + 260, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
  }
  // ---- tray
  ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(40,16,60,0.30)';
  ctx.fillRect(TRAY.x + 14, TRAY.y + 22, TRAY.w, TRAY.h - 30); ctx.restore();
  ctx.drawImage(trayTex(), TRAY.x, TRAY.y);
  // ---- loose cookies (not yet hopped)
  const ck = chocCookieSprite();
  for (let t = 0; t < 12; t++) for (let k = 0; k < 10; k++) {
    if (f >= depart(t, k)) continue;
    const [px, py] = cookieOf(t, k);
    ctx.drawImage(ck.img, px - 24, py - 24);
  }
  // ---- tubes at home
  const ts = [];
  for (let t = 0; t < 12; t++) ts.push(tubeState(t, f));
  for (let t = 0; t < 12; t++) if (ts[t] && ts[t].where === 'home') drawTube(ctx, ts[t].x, ts[t].y, ts[t].sc, ts[t].n, ts[t].glow);
  // ---- hundred crate (pops up on a hinge at its bottom edge)
  const ca = crateAmount(f);
  if (ca > 0.02) {
    drawPlane(ctx, crateTex(), { x: CRATE.x, w: CRATE.w, hingeY: CRATE.y + CRATE.h, h: CRATE.h, theta: (Math.PI / 2) * (1 - Math.min(1, ca)), dir: -1, shadow: 0.5, warm: 0.12 * pulse(f, T.HUNDRED, 24) });
    if (ca > 0.97) for (let t = 0; t < 10; t++) if (ts[t] && ts[t].where === 'crate') drawTube(ctx, ts[t].x, ts[t].y, ts[t].sc, ts[t].n, ts[t].glow + 0.7 * pulse(f, T.HUNDRED, 24));
  }
  // ---- counting tags 1..12 (follow their tubes)
  for (let t = 0; t < 12; t++) {
    const s = ts[t]; if (!s) continue;
    const sc = E.outBack(clamp((f - (T.TAGS[0] + t * T.TAGS[1])) / 8)) * (1 - prog(T.TAGS_OUT, T.TAGS_OUT + 8, f));
    sticker(ctx, s.x + 92 * s.sc, s.y - 30 * s.sc, 26, String(t + 1), 32, sc);
  }
  // ---- "100" on the crate, "20" beside the last two tubes
  const out = 1 - prog(T.BACK[0] - 6, T.BACK[0] + 2, f);
  sticker(ctx, CRATE.x + 6, CRATE.y + 18, 44, '100', 36, E.outBack(clamp((f - T.HUNDRED) / 8)) * out * (ca > 0.9 ? 1 : 0));
  sticker(ctx, 890, tubeHome(11)[1], 34, '20', 34, E.outBack(clamp((f - T.TWENTY) / 8)) * out);
  // ---- cookies in flight (top view squashing to their edge as they drop into the tube)
  for (let t = 0; t < 12; t++) for (let k = 0; k < 10; k++) {
    const d = depart(t, k), u = prog(d, d + HOP, f);
    if (f < d || u >= 1) continue;
    const [ax, ay] = cookieOf(t, k), [hx, hy] = tubeHome(t);
    const bx = hx + SLICE_X(k), by = hy;
    const e = E.inOutSine(u);
    ctx.save(); ctx.translate(lerp(ax, bx, e), lerp(ay, by, e) - 46 * Math.sin(Math.PI * u)); ctx.scale(lerp(1, 0.42, e), 1);
    withShadow(ctx, 8, 0.25); ctx.drawImage(ck.img, -24, -24); ctx.restore();
  }
  // ---- tubes in flight (on top)
  for (let t = 0; t < 12; t++) if (ts[t] && ts[t].where === 'fly') drawTube(ctx, ts[t].x, ts[t].y, ts[t].sc, ts[t].n, ts[t].glow);
  // ---- hook: the robot's counting ring hops one cookie at a time
  const ringA = 1 - prog(96, 104, f);
  if (ringA > 0) {
    const i = countIndex(f), [rx, ry] = cookiePos(0, i, 0);
    const hop = E.outBack(clamp((f % T.COUNT_HOP) / 4 + (f < T.COUNT_HOP ? 1 : 0)));
    ctx.save(); ctx.globalAlpha = ringA;
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(rx, ry, 25, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.orange; ctx.lineWidth = 5.5; ctx.stroke();
    sticker(ctx, rx + 24, ry - 40, 22, String(i + 1), 28, hop, '#FFFDF8');
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame-0 headline (hook words, folds away)
function drawHeadline(ctx, f) {
  if (f >= T.HEADLINE_OUT[1]) return;
  const th = (Math.PI / 2) * E.inCubic(prog(T.HEADLINE_OUT[0], T.HEADLINE_OUT[1], f));
  const tex = texCanvas('headline', 820, 196);
  const x = tex.getContext('2d');
  piece(x, cutPoly(roundRectPts(6, 6, 808, 184, 32), 1501, 1.4, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
  x.fillStyle = C.violet; x.fillRect(26, 20, 8, 156);
  const line = (t, y, col) => { x.save(); x.font = `700 84px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#FFFFFF'; x.strokeText(t, 420, y); x.fillStyle = col; x.fillText(t, 420, y); x.restore(); };
  line('TOO MANY', 58, C.deep);
  line('TO COUNT?', 140, C.purple);
  drawPlane(ctx, tex, { x: CX - 410, w: 820, hingeY: 210, h: 196, theta: th, dir: 1, F: 2200, shadow: 0.8, shade: 0.3 * Math.sin(th) });
}

function drawLamp(ctx, f) {
  // hanging paper lamp, top-right (beside the window): motivates the warm key light
  const lx = 990, sw = Math.sin(f * 0.05) * 0.04;
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
    const contIn = prev && prev[2] === a && lines[0].startsWith(prev[0][0]);
    const contOut = next && next[1] === b && next[0][0].startsWith(lines[0]);
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
  drawRobot(ctx, robotState(f));
  ctx.restore();

  // closest layer
  ctx.save(); applyCam(ctx, cam, 1.25); ctx.drawImage(foreground(), 0, 0); ctx.restore();

  // warm key light from the top-right + vignette
  const lg = ctx.createRadialGradient(780, 520, 80, 640, 900, 1250);
  lg.addColorStop(0, 'rgba(255,240,205,0.16)'); lg.addColorStop(0.6, 'rgba(255,240,205,0)'); lg.addColorStop(1, 'rgba(50,20,70,0.28)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  drawCaptions(ctx, f);
  drawHeadline(ctx, f);
  applyGrain(ctx, 0, 0, W, H, 0.03, 'overlay');
}

// ------------------------------------------------------------------ thumbnail = frame 0 (the hook image)
export function drawThumbnail(ctx) {
  drawFrame(ctx, 0);
}
