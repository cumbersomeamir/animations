// "Seven or Zero?" (7 × 1 = 7, 7 × 0 = 0) — Pop-up Counting Storybook, depth edition (english-19).
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
  sparkle, label, measure, starCookieSprite,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';
import { drawMouse } from './mouse.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout (world px)
const CX = 500; // composition centre (captions live in x 100–900)
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 590; // hinge line of the top flip card
const CARD_CX = 500;
// seven open gift boxes in reading order (top row 4, bottom row 3); [centre x, rim y]
const BOXES = [[197, 790], [399, 790], [601, 790], [803, 790], [298, 1100], [500, 1100], [702, 1100]];
const BOX = { w: 172, h: 100 };
const PATH = [0, 1, 2, 3, 6, 5, 4]; // the mouse's route: along the top row, then back along the bottom row
const SHELVES = [890, 1200];
const MOUSE_S = 1.25;
const MOUSE_HOME = [152, 1492]; // the mouse hole at the bottom of the page
const BAKER = { x: 640, y: 1668, s: 0.74 };
const rimSpot = (j) => [BOXES[j][0] + 84, BOXES[j][1] + 4]; // where the mouse stands, just right of box j's cookie

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
  // shelves with bread loaves, jars, rolling pins (no cookies: counted objects stay in the boxes only)
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

// ------------------------------------------------------------------ textures: boxes, shelves, bitten cookies
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
const BITES = [[[78, 22, 14], [88, 36, 12], [68, 12, 11]], [[18, 42, 14], [12, 58, 12], [26, 28, 11]]];
const COOKIES = {};
function cookieImg(stage) {
  // stage 0 = whole, 1 = one bite, 2 = two bites (stage 3 = eaten, never drawn)
  if (COOKIES[stage]) return COOKIES[stage];
  const c = createCanvas(100, 100), x = c.getContext('2d');
  x.drawImage(starCookieSprite().img, 6, 4);
  x.globalCompositeOperation = 'destination-out';
  for (let s = 0; s < stage; s++) for (const [bx, by, r] of BITES[s]) { x.beginPath(); x.arc(bx, by, r, 0, Math.PI * 2); x.fill(); }
  COOKIES[stage] = c;
  return c;
}
let BOXBACK = null, BOXFRONT = null;
function boxLayers() {
  if (BOXBACK) return;
  BOXBACK = createCanvas(200, 60); BOXFRONT = createCanvas(200, 180);
  let x = BOXBACK.getContext('2d');
  piece(x, cutPoly([[14, 52], [26, 14], [174, 14], [186, 52]], 2201, 0.6, 10), C.kraftDk, { margin: 3, grainA: 0.12 });
  x.fillStyle = 'rgba(60,30,10,0.25)'; x.fillRect(22, 40, 156, 12);
  x = BOXFRONT.getContext('2d');
  const front = cutPoly(roundRectPts(14, 4, BOX.w, BOX.h, 14), 2202, 0.8, 12);
  piece(x, front, C.kraft, { margin: 3, grainA: 0.14 });
  x.save(); pathFrom(x, front); x.clip();
  x.fillStyle = C.violet; x.fillRect(0, 16, 200, 16);
  x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(0, 18, 200, 4);
  x.restore();
}
function drawMouseHole(ctx) {
  // a cut-paper mouse hole in the skirting at the bottom-left of the page
  const [hx, hy] = MOUSE_HOME;
  withShadow(ctx, 4, 0.2);
  ctx.beginPath(); ctx.moveTo(hx - 74, hy + 6); ctx.lineTo(hx - 74, hy - 70); ctx.arc(hx, hy - 70, 74, Math.PI, 0); ctx.lineTo(hx + 74, hy + 6); ctx.closePath();
  ctx.fillStyle = C.kraft; ctx.fill();
  noShadow(ctx);
  ctx.beginPath(); ctx.moveTo(hx - 60, hy + 6); ctx.lineTo(hx - 60, hy - 70); ctx.arc(hx, hy - 70, 60, Math.PI, 0); ctx.lineTo(hx + 60, hy + 6); ctx.closePath();
  const g = ctx.createLinearGradient(0, hy - 130, 0, hy); g.addColorStop(0, '#1B0E3A'); g.addColorStop(1, '#2A1650');
  ctx.fillStyle = g; ctx.fill();
}
function drawShelf(ctx, y) {
  withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(84, y - 2, 832, 22, 8), 2210 + y, 0.8, 14), C.kraftLt, { margin: 3, grainA: 0.12 });
  noShadow(ctx);
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
    [0, 1.0, CX, 960], [446, 1.0, CX, 960], [476, 1.035, CX, 900], [516, 1.035, CX, 900], [530, 1.03, CX, 800], [570, 1.03, CX, 800], [596, 1.0, CX, 960],
  ]);
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}
// ---- the mouse's visits: visit k lands on box PATH[k]
const landAt = (k) => T.CHOMP[0] + k * T.CHOMP[1];
const visitOf = (j) => PATH.indexOf(j);
function cookieStage(j, f) {
  const a = landAt(visitOf(j));
  return f < a + 2 ? 0 : f < a + 5 ? 1 : f < a + 8 ? 2 : 3;
}
const eatenAt = (j) => landAt(visitOf(j)) + 9;
function eatenCount(f) { let n = 0; for (let k = 0; k < 7; k++) if (f >= landAt(k) + 8) n++; return n; }

function mouseState(f) {
  const ears = Math.sin(f * 0.3) * 6, tail = Math.sin(f * 0.22) * 14;
  const m = { x: MOUSE_HOME[0], y: MOUSE_HOME[1], s: MOUSE_S, hop: 0, arm: 30, arm2: 30, tail, ears, eyes: 'open', squash: 1, belly: 1 + 0.06 * eatenCount(f), mouth: 'smile' };
  const hopTo = (p0, p1, u) => { const e = E.inOutCubic(u); m.x = lerp(p0[0], p1[0], e); m.y = lerp(p0[1], p1[1], e); m.hop = (40 + 0.12 * Math.abs(p1[1] - p0[1])) * Math.sin(Math.PI * u); m.arm = m.arm2 = 120; m.tail = 30; };
  const firstHop = 14; // the big leap out of the mouse hole takes a little longer
  if (f < landAt(0) - firstHop) {
    // hungry: eyes on the cookies, licking its lips, rubbing its tummy
    m.arm = 140 + 10 * Math.sin(f * 0.2); m.arm2 = 40 + 20 * Math.sin(f * 0.3);
    if (f < 30 || (f % 46) < 8) m.mouth = 'open';
    m.hop = 4 * Math.abs(Math.sin(f * 0.12));
    if (f > 100 && f < 136) m.eyes = 'happy';
    return m;
  }
  for (let k = 0; k < 7; k++) {
    const a = landAt(k), prev = k === 0 ? MOUSE_HOME : rimSpot(PATH[k - 1]);
    if (f < a) { hopTo(prev, rimSpot(PATH[k]), prog(a - (k === 0 ? firstHop : T.HOP), a, f)); m.flip = true; return m; }
    if (f < a + 9) {
      [m.x, m.y] = rimSpot(PATH[k]);
      // mirrored (m.flip): the tail swings away from the cookie and the reaching paw faces it
      m.flip = true; m.arm = 100; m.arm2 = 50; m.tail = -10; m.mouth = (f - a) % 3 < 2 ? 'open' : 'smile'; m.eyes = 'happy';
      m.squash = 1 - 0.05 * Math.sin((f - a) * 1.1);
      return m;
    }
  }
  if (f < T.HOME_AT) { hopTo(rimSpot(PATH[6]), MOUSE_HOME, prog(T.HOME_AT - T.HOP, T.HOME_AT, f)); m.flip = true; return m; }
  // full and happy at home; dozes off for the takeaway
  m.eyes = 'happy'; m.arm = 30; m.arm2 = 20 + 15 * Math.sin(f * 0.15);
  if (f >= T.NAP[0] - 30) { m.eyes = 'sleep'; m.arm = 15; m.arm2 = 15; m.squash = 1 + 0.03 * Math.sin(f * 0.12); m.ears = 0; m.tail = 4 * Math.sin(f * 0.08); }
  return m;
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  // surprised while the mouse chomps
  const sur = prog(landAt(0) - 10, landAt(0) + 4, f) * (1 - prog(T.HOME_AT, T.HOME_AT + 16, f));
  if (sur > 0) { st.aL = lerp(14, 120, sur); st.aR = lerp(14, 120, sur); st.fL = st.fR = lerp(10, 40, sur); st.mouth = 'open'; st.eyes = 'open'; st.head = 4 * Math.sin(f * 0.5) * sur; }
  for (const g of [218, 520]) { const c = pulse(f, g, 18); if (c > 0) { st.aL = lerp(st.aL, 155, c); st.aR = lerp(st.aR, 155, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  if (f >= T.NAP[0] && f < 810) { st.eyes = 'happy'; st.mouth = 'smile'; st.aR = lerp(14, 60, prog(T.NAP[0], T.NAP[0] + 10, f)); st.head = 5 * Math.sin(f * 0.2); }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
const CARD_FACES = [
  [[['7 × 0 = ', 'ink'], ['?', 'purple']], 74],
  [[['7 × 1 = ', 'ink'], ['7', 'purple']], 74],
  [[['7 × 0 = ', 'ink'], ['0', 'purple']], 74],
  [[['any × 0 = ', 'ink'], ['0', 'purple']], 68],
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
function drawBox(ctx, j, f) {
  boxLayers();
  const [bx, rim] = BOXES[j];
  const glow = pulse(f, T.ZEROS[0] + j * T.ZEROS[1], 16) + pulse(f, 650, 26);
  withShadow(ctx, 5, 0.25);
  ctx.drawImage(BOXBACK, bx - 100, rim - 52);
  noShadow(ctx);
  // the cookie (bitten away by the mouse) and its crumbs falling into the box
  const st = cookieStage(j, f);
  if (st < 3) { ctx.save(); withShadow(ctx, 4, 0.3); ctx.drawImage(cookieImg(st), bx - 65, rim - 103, 130, 130); ctx.restore(); }
  const a = landAt(visitOf(j));
  for (let i = 0; i < 6; i++) {
    const t0 = a + 2 + (i % 3) * 3, u = prog(t0, t0 + 10, f);
    if (u <= 0 || u >= 1) continue;
    ctx.fillStyle = i % 2 ? '#E9A64F' : '#C97F2E';
    ctx.beginPath(); ctx.arc(bx - 30 + i * 12, rim - 40 + 56 * u * u, 4, 0, Math.PI * 2); ctx.fill();
  }
  // front panel with the "how many in this box" badge: 1, then 0 once eaten
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(bx, rim + 30, 10, bx, rim + 30, 130);
    g.addColorStop(0, `rgba(255,224,130,${0.5 * glow})`); g.addColorStop(1, 'rgba(255,224,130,0)');
    ctx.fillStyle = g; ctx.fillRect(bx - 130, rim - 60, 260, 260);
  }
  // takeaway proof: the front flaps fold down on their hinges in a wave to show every box is empty, then close
  const openU = E.outBack(prog(T.FLAPS_OPEN[0] + j * T.FLAPS_OPEN[1], T.FLAPS_OPEN[0] + j * T.FLAPS_OPEN[1] + 12, f)) * (1 - E.inOutCubic(prog(T.FLAPS_CLOSE[0] + j * T.FLAPS_CLOSE[1], T.FLAPS_CLOSE[0] + j * T.FLAPS_CLOSE[1] + 12, f)));
  const th = 1.15 * openU, hinge = rim + 106;
  if (th > 0.01) {
    // the empty inside of the box
    const g = ctx.createLinearGradient(0, rim, 0, hinge);
    g.addColorStop(0, '#6E4420'); g.addColorStop(1, '#9A6A38');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx - 80, rim, 160, 104, 10); ctx.fill();
    ctx.fillStyle = `rgba(255,224,130,${0.25 * pulse(f, 650, 26)})`; ctx.fill();
    drawPlane(ctx, BOXFRONT, { x: bx - 100, w: 200, hingeY: hinge, h: 110, theta: th, dir: -1, F: 1400, sy: 0, sh: 110, shadow: 0.45, shade: 0.18 * Math.sin(th) });
  } else {
    withShadow(ctx, 6, 0.3);
    ctx.drawImage(BOXFRONT, bx - 100, rim - 4);
    noShadow(ctx);
  }
  const eaten = f >= eatenAt(j);
  const pop = eaten ? E.outBack(clamp((f - eatenAt(j)) / 8)) : E.outBack(clamp((f - (T.ONES[0] + j * T.ONES[1])) / 8));
  const bump = 1 + 0.25 * pulse(f, T.ZEROS[0] + j * T.ZEROS[1], 14);
  // the badge rides on the flap (foreshortened with it)
  const by = hinge - (hinge - (rim + 62)) * Math.cos(th);
  ctx.save(); ctx.translate(bx, by); ctx.scale(1, Math.max(0.05, Math.cos(th))); ctx.translate(-bx, -by);
  sticker(ctx, bx, by, 31, eaten ? '0' : '1', 44, pop * bump, eaten ? '#FFFDF8' : C.yellow);
  ctx.restore();
}
function drawStage(ctx, f) {
  // ---- top flip card
  const cs = cardState(f);
  if (Math.cos(cs.theta) > 0.03) {
    const [faceParts, size] = CARD_FACES[cs.face];
    const parts = faceParts.map(([t, col]) => [t, C[col]]);
    const tex = cardTex(`card${cs.face}`, 560, 100, (x) => eqText(x, parts, 280, 53, size), cs.face >= 1 ? '#FFF6C9' : C.cream);
    drawPlane(ctx, tex, { x: CARD_CX - 280, w: 560, hingeY: SLOT_Y, h: 100, theta: cs.theta, dir: -1, shadow: 0.7, warm: 0.32 * (pulse(f, 218, 22) + pulse(f, 521, 22) + pulse(f, 678, 22)) });
    scoreLine(ctx, CARD_CX - 260, SLOT_Y + 2, CARD_CX + 260, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
  }
  // ---- two shelves of boxes (the mouse is drawn with the row it stands on, so boxes in front can overlap it)
  const m = mouseState(f);
  const mouseRow = m.y - m.hop < 960 ? 0 : 1;
  drawMouseHole(ctx);
  drawShelf(ctx, SHELVES[0]);
  for (let j = 0; j < 4; j++) drawBox(ctx, j, f);
  const mouse = () => { if (!m.flip) return drawMouse(ctx, m); ctx.save(); ctx.translate(m.x, 0); ctx.scale(-1, 1); ctx.translate(-m.x, 0); drawMouse(ctx, m); ctx.restore(); };
  if (mouseRow === 0) mouse();
  drawShelf(ctx, SHELVES[1]);
  for (let j = 4; j < 7; j++) drawBox(ctx, j, f);
  if (mouseRow === 1) mouse();
  // ---- nap: little paper "z"s float up from the full mouse
  if (f >= T.NAP[0] - 20 && f < 812) {
    for (let i = 0; i < 3; i++) {
      const u = ((f - (T.NAP[0] - 20) + i * 18) % 54) / 54;
      ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u);
      label(ctx, 'z', MOUSE_HOME[0] + 40 + 30 * u + i * 6, MOUSE_HOME[1] - 175 - 70 * u, 30 + 10 * i, { fill: C.violet });
      ctx.restore();
    }
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
  line('SEVEN', 58, C.deep);
  line('OR ZERO?', 140, C.purple);
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
  drawBaker(ctx, bakerState(f));
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
