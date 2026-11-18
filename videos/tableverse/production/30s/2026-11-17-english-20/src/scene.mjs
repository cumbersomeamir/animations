// "More Boxes, More Cookies?" (4 × 6 = 8 × 3 = 24) — Pop-up Counting Storybook, depth edition (english-20).
// Entertainment first: a sneaky mouse saws every cookie box in half hoping for more cookies; the count proves the same 24.
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
import { drawMouse, mousePaw } from './mouse.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}


// ------------------------------------------------------------------ layout (world px)
const CX = 500; // caption centre (captions live in x 100–900)
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 560; // hinge line of the top flip card
const CARD_CX = 540;
// four long cookie boxes on four shelves; each box = two halves of three cookies joined at a dashed "cut here" seam
const BX = 540; // box column centre
const RIMS = [700, 885, 1070, 1255];
const FRONT_H = 84;
const PITCH = 104; // cookie spacing
const HW = 3 * PITCH + 24; // half-box width (336)
const CK = 108; // drawn cookie size
const SPREAD_GAP = 140; // gap between the halves once the boxes are apart
const COUNTER_Y = 1474; // the shop counter the mouse stands on
const MOUSE_S = 2.0; // on the counter (nearest layer)
const MOUSE_S_SHELF = 1.6; // behind a shelf box (further back)
const MOUSE_START = [930, COUNTER_Y]; // right end of the counter, clear of the boxes
const MOUSE_MID = [BX, COUNTER_Y]; // between the two columns once the boxes are apart
const BAKER = { x: 250, y: 1690, s: 0.74 };
const SAW_REST = [800, 1446]; // where the saw lies on the counter after the job

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


// ------------------------------------------------------------------ textures: box halves, shelves, saw, counter
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
let COOKIE = null;
function cookieImg() {
  if (COOKIE) return COOKIE;
  const c = createCanvas(100, 100), x = c.getContext('2d');
  x.drawImage(starCookieSprite().img, 6, 4);
  COOKIE = c;
  return c;
}
const HALF = {}; // side -1 = left half, +1 = right half; {back, front} canvases, 20 px pad
function halfTex(side) {
  if (HALF[side]) return HALF[side];
  const w = HW + 40, back = createCanvas(w, 70), front = createCanvas(w, FRONT_H + 40);
  // outer end rounded, inner (seam) end straight: the two halves sit flush as one long box
  const outerL = side < 0;
  // rounded on the outer end only; the seam end is square so the halves sit flush as one long box
  const rr = (x0, y0, ww, hh, r) => {
    const pts = [];
    const arc = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    if (outerL) { pts.push([x0 + ww, y0], [x0 + ww, y0 + hh]); arc(x0 + r, y0 + hh - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI); }
    else { pts.push([x0, y0]); arc(x0 + ww - r, y0 + r, -Math.PI / 2); arc(x0 + ww - r, y0 + hh - r, 0); pts.push([x0, y0 + hh]); }
    return pts;
  };
  let x = back.getContext('2d');
  piece(x, cutPoly(rr(20, 16, HW, 50, 12), 3301 + side, 0.6, 12), C.kraftDk, { margin: 0, grainA: 0.12 });
  x.fillStyle = 'rgba(60,30,10,0.25)'; x.fillRect(26, 50, HW - 12, 14);
  x = front.getContext('2d');
  const fp = cutPoly(rr(20, 20, HW, FRONT_H, 14), 3311 + side, 0.8, 12);
  piece(x, fp, C.kraft, { margin: 0, grainA: 0.14 });
  x.save(); pathFrom(x, fp); x.clip();
  x.fillStyle = C.violet; x.fillRect(0, 34, w, 16);
  x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(0, 36, w, 4);
  x.restore();
  // white cut margin on the outer edges only (the seam edge stays flush)
  x.strokeStyle = '#FFFDF8'; x.lineWidth = 3; x.beginPath();
  if (outerL) { x.moveTo(20 + HW, 20); x.lineTo(32, 20); x.quadraticCurveTo(20, 20, 20, 32); x.lineTo(20, 20 + FRONT_H - 12); x.quadraticCurveTo(20, 20 + FRONT_H, 32, 20 + FRONT_H); x.lineTo(20 + HW, 20 + FRONT_H); }
  else { x.moveTo(20, 20); x.lineTo(8 + HW, 20); x.quadraticCurveTo(20 + HW, 20, 20 + HW, 32); x.lineTo(20 + HW, 8 + FRONT_H); x.quadraticCurveTo(20 + HW, 20 + FRONT_H, 8 + HW, 20 + FRONT_H); x.lineTo(20, 20 + FRONT_H); }
  x.stroke();
  HALF[side] = { back, front };
  return HALF[side];
}
function drawShelf(ctx, y) {
  withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(110, y, 860, 20, 8), 2210 + y, 0.8, 14), C.kraftLt, { margin: 3, grainA: 0.12 });
  noShadow(ctx);
  // brass split pins hold the shelf to the page
  splitPin(ctx, 130, y + 10, 5); splitPin(ctx, 950, y + 10, 5);
}
function drawCounter(ctx) {
  withShadow(ctx, 10, 0.3);
  piece(ctx, cutPoly(roundRectPts(60, COUNTER_Y - 4, 960, 30, 10), 2299, 0.8, 14), C.kraftLt, { margin: 3, grainA: 0.12 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(57,12,214,0.85)'; ctx.fillRect(66, COUNTER_Y + 12, 948, 8);
}
function drawAwning(ctx, f) {
  // scalloped paper awning: the page is a cookie shop
  const y = BOOK.y + 4, n = 12, w = BOOK.w / n;
  for (let i = 0; i < n; i++) {
    const x0 = BOOK.x + i * w;
    ctx.save(); withShadow(ctx, 4, 0.18);
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.lineTo(x0 + w, y + 18); ctx.arc(x0 + w / 2, y + 18, w / 2, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = i % 2 ? C.cream : C.lilac; ctx.fill();
    ctx.restore();
  }
}
/**
 * Cut-paper hand saw. Grip at (gx, gy); ang = rotation of the blade direction from "pointing down" (canvas rotate).
 * The blade points along local +y; teeth on the local -x edge.
 */
function drawSaw(ctx, gx, gy, ang, s = 1, shine = 0) {
  ctx.save(); ctx.translate(gx, gy); ctx.rotate(ang); ctx.scale(s, s);
  withShadow(ctx, 6, 0.3);
  // blade
  const L = 236;
  const blade = [[-26, 10], [16, 10], [16, L], [-14, L]];
  const teeth = [];
  for (let y = L; y > 14; y -= 9) teeth.push([-14 - (12 * (L - y)) / L - 6, y - 4.5], [-14 - (12 * (L - y)) / L, y - 9]);
  const pts = [[16, 10], [16, L], [-14, L], ...teeth, [-26, 10]];
  const g = ctx.createLinearGradient(-30, 0, 20, 0);
  g.addColorStop(0, '#C9CCE0'); g.addColorStop(0.5, '#F4F5FB'); g.addColorStop(1, '#B4B8D2');
  piece(ctx, pts, g, { margin: 2.5, grainA: 0.03, edge: 'rgba(42,22,80,0.45)' });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(6, 20, 4, L - 40);
  void blade;
  // handle (closed grip with a finger hole), orange paper with brass pins
  withShadow(ctx, 5, 0.3);
  const hp = cutPoly(roundRectPts(-34, -44, 62, 64, 20), 3401, 0.8, 10);
  piece(ctx, hp, C.orange, { margin: 2.5, grainA: 0.08 });
  noShadow(ctx);
  ctx.beginPath(); ctx.ellipse(-3, -14, 12, 16, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(42,22,80,0.85)'; ctx.fill();
  splitPin(ctx, -18, 10, 4); splitPin(ctx, 10, 10, 4);
  if (shine > 0.01) sparkle(ctx, 6, 120, 30 * shine, 'rgba(255,255,255,0.95)');
  ctx.restore();
}
const sawAng = (dx, dy) => Math.atan2(-dx, dy);

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
  // motivated moves: follow the saw down the shelves, lean in for the question, punch in on the mouse's "take"
  const keys = [[0, 1.0, BX, 960], [T.TIPTOE[0], 1.0, BX, 960], [T.TIPTOE[0] + 30, 1.06, 900, 1400], [T.TIPTOE[1] + 10, 1.06, 900, 1400], [T.SAW_UP[0], 1.0, BX, 960], [212, 1.0, BX, 960]];
  for (let k = 0; k < 4; k++) { const z = k === 3 ? 1.09 : 1.12; keys.push([T.landAt(k), z, BX, RIMS[k]], [T.splitAt(k), z, BX, RIMS[k]]); }
  keys.push([T.JUMP_DOWN[1] + 8, 1.0, BX, 960], [T.PAUSE[0], 1.0, BX, 960], [T.PAUSE[1], 1.045, BX, 1000], [T.COUNTS[0], 1.0, BX, 960],
    [T.TAKE - 2, 1.0, BX, 960], [T.TAKE + 8, 1.06, BX, 1450], [T.SIT_UP[0] - 30, 1.06, BX, 1450], [T.SIT_UP[0], 1.0, BX, 960]);
  let z = keys[0][1], cx = keys[0][2], cy = keys[0][3];
  for (let i = 1; i < keys.length; i++) {
    const [f0, z0, x0, y0] = keys[i - 1], [f1, z1, x1, y1] = keys[i];
    if (f >= f0) { const u = E.inOutCubic(prog(f0, f1, f)); z = lerp(z0, z1, u); cx = lerp(x0, x1, u); cy = lerp(y0, y1, u); }
  }
  return { z, cx, cy };
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}
// ---- boxes: gap between the two halves of box k (0 = one long box)
function gapAt(k, f) {
  const sp = T.splitAt(k);
  if (f < sp) return 0;
  let g = 14 * E.outBack(prog(sp, sp + 8, f));
  g = lerp(g, SPREAD_GAP, E.inOutCubic(prog(T.SPREAD[0] + 3 * k, T.SPREAD[1] + 3 * k, f)));
  g *= 1 - E.inOutCubic(prog(T.JOIN[0] + 2 * k, T.JOIN[1] + 2 * k, f));
  g = lerp(g, SPREAD_GAP, E.inOutCubic(prog(T.APART[0] + 2 * k, T.APART[1] + 2 * k, f)));
  return g;
}
const halfCX = (k, side, f) => BX + side * (HW / 2 + gapAt(k, f) / 2);
const cutProg = (k, f) => prog(T.landAt(k) + 1, T.splitAt(k), f);
const countIdx = (k, side) => 2 * k + (side > 0 ? 1 : 0);
function countedN(f) { let n = 0; for (const c of T.COUNTS) if (f >= c) n++; return n; }

function mouseState(f) {
  const m = { x: MOUSE_START[0], y: MOUSE_START[1], s: MOUSE_S, hop: 0, arm: 85, arm2: 40, tail: Math.sin(f * 0.22) * 14, ears: Math.sin(f * 0.3) * 6, eyes: 'sly', mouth: 'grin', squash: 1, flip: true, layer: 'front' };
  const saw = { on: true, gx: 0, gy: 0, ang: Math.PI + 0.4, shine: 0, s: 1.25 };
  const grip = () => { const p = mousePaw(m, 1); saw.gx = p[0]; saw.gy = p[1]; };
  const hopTo = (p0, p1, u, h) => { const e = E.inOutSine(u); m.x = lerp(p0[0], p1[0], e); m.y = lerp(p0[1], p1[1], e); m.hop = h * Math.sin(Math.PI * u); m.squash = u < 0.15 ? 1.08 : 1; };
  const sawSpot = (k) => [BX + 62, RIMS[k] + 10]; // feet hidden behind the box front
  // ---- 0–214: sneaky plan at the right end of the counter, then "Out comes the saw!"
  if (f < T.LEAP[0]) {
    m.arm2 = 60 + 25 * Math.sin(f * 0.25); // rubbing the other paw
    m.hop = 3 * Math.abs(Math.sin(f * 0.11));
    if (f >= T.SAW_UP[0]) {
      const c = prog(T.SAW_UP[0], T.SAW_UP[1], f), up = E.outBack(prog(T.SAW_UP[1], T.SAW_UP[2], f));
      m.squash = 1 - 0.14 * Math.sin(Math.PI * c) * (1 - up); m.arm = lerp(85, 175, up); m.arm2 = lerp(60, 170, up); m.hop = 18 * up;
      m.eyes = up > 0.5 ? 'wide' : 'sly'; m.mouth = up > 0.5 ? 'open' : 'grin'; m.earsUp = up * 0.6;
      saw.shine = pulse(f, T.SAW_UP[2] - 2, 14);
    }
    if (f < T.SAW_UP[0]) saw.shine = pulse(f, T.TAP - 2, 14); else if (f >= T.TIPTOE[0] && f < T.TIPTOE[1]) {
      // "This sneaky mouse thinks so!": tiptoe steps on the spot, a tap on the saw, a cheeky wink
      const ph = (f - T.TIPTOE[0]) / 9;
      m.hop = 10 * Math.abs(Math.sin(Math.PI * ph)); m.squash = 1 + 0.05 * Math.cos(2 * Math.PI * ph);
      m.tail = 30 * Math.sin(Math.PI * ph); m.arm2 = 120;
      if (Math.abs(f - T.TAP) < 6) { m.eyes = 'wink'; m.arm2 = 150; }
    } else if (f > 100 && f % 70 < 10) m.eyes = 'wink';
    grip(); saw.ang = Math.PI + 0.4 - 0.25 * prog(T.SAW_UP[1], T.SAW_UP[2], f);
    return { m, saw };
  }
  // ---- the big leap and the four cuts (top box to bottom box)
  m.eyes = 'open'; m.mouth = 'grin'; m.arm = 160; m.arm2 = 150;
  for (let k = 0; k < 4; k++) {
    const land = T.landAt(k), from = k === 0 ? MOUSE_START : sawSpot(k - 1), start = k === 0 ? T.LEAP[0] : T.splitAt(k - 1);
    if (f < land) {
      const u = prog(start, land, f);
      hopTo(from, sawSpot(k), u, k === 0 ? 120 : 130);
      if (k === 0) { m.s = lerp(MOUSE_S, MOUSE_S_SHELF, u); saw.s = lerp(1.25, 1, u); } else { m.s = MOUSE_S_SHELF; saw.s = 1; }
      m.layer = u < 0.5 ? (k === 0 ? 'front' : k - 1) : k;
      m.eyes = 'happy'; m.mouth = 'open'; m.arm = 175; m.arm2 = 175;
      grip(); saw.ang = Math.PI + 0.25 * Math.sin(Math.PI * u);
      return { m, saw };
    }
    if (f <= T.splitAt(k) + 1) {
      [m.x, m.y] = sawSpot(k); m.layer = k; m.s = MOUSE_S_SHELF; saw.s = 1;
      const st = Math.sin((f - land) * (Math.PI / 2)); // one saw stroke every 4 frames
      m.arm = 150 + 8 * st; m.arm2 = 132 + 8 * st; m.squash = 1 + 0.04 * st;
      m.eyes = 'wide'; m.mouth = (f - land) % 4 < 2 ? 'gasp' : 'grin';
      grip();
      const c = cutProg(k, f), px = BX, py = RIMS[k] + c * FRONT_H;
      saw.ang = sawAng(px - saw.gx, py - saw.gy);
      const ax = -Math.sin(saw.ang), ay = Math.cos(saw.ang);
      saw.gx += ax * 10 * st; saw.gy += ay * 10 * st;
      saw.cutting = k;
      return { m, saw };
    }
  }
  // ---- jump down between the columns; the saw is tossed onto the counter
  if (f < T.JUMP_DOWN[1]) {
    const u = prog(T.JUMP_DOWN[0], T.JUMP_DOWN[1], f);
    hopTo(sawSpot(3), MOUSE_MID, u, 90); m.layer = u < 0.5 ? 3 : 'front'; m.s = lerp(MOUSE_S_SHELF, MOUSE_S, u); saw.s = lerp(1, 1.25, u);
    m.eyes = 'happy'; m.mouth = 'open'; m.arm = 175; m.arm2 = 175;
    grip(); saw.ang = Math.PI + 0.6 * u;
    return { m, saw };
  }
  [m.x, m.y] = MOUSE_MID; m.flip = false;
  // saw lies on the counter (slides into place)
  const toss = E.outCubic(prog(T.JUMP_DOWN[1], T.JUMP_DOWN[1] + 10, f));
  saw.s = 1.25; saw.gx = lerp(MOUSE_MID[0] + 50, SAW_REST[0], toss); saw.gy = lerp(MOUSE_MID[1] - 110, SAW_REST[1], toss); saw.ang = lerp(Math.PI + 0.6, -Math.PI / 2, toss); saw.cutting = null;
  if (f < T.PAUSE[0]) {
    // "Eight boxes!" victory jump, then "More cookies?" sneaky paw-rub
    const v = pulse(f, 320, 24);
    m.hop = 34 * v; m.arm = lerp(30, 170, v); m.arm2 = lerp(30, 170, v); m.eyes = v > 0.2 ? 'happy' : 'sly'; m.mouth = v > 0.2 ? 'open' : 'grin';
    if (f >= 346) { m.arm = 70 + 20 * Math.sin(f * 0.9); m.arm2 = 70 - 20 * Math.sin(f * 0.9); m.eyes = 'sly'; m.mouth = 'grin'; }
    m.squash = f < T.JUMP_DOWN[1] + 6 ? 0.9 : 1;
    return { m, saw };
  }
  if (f < T.COUNTS[0]) {
    // drumroll: greedy paw-rub and lean-in; "Let's count in threes!" points up
    m.arm = 70 + 20 * Math.sin(f * 1.1); m.arm2 = 70 - 20 * Math.sin(f * 1.1); m.eyes = 'wide'; m.mouth = 'grin';
    m.squash = 1 + 0.04 * Math.sin(f * 0.6);
    if (f >= T.PAUSE[1]) { m.arm = 165; m.arm2 = 30; m.eyes = 'happy'; m.mouth = 'open'; }
    return { m, saw };
  }
  if (f < T.TAKE) {
    // counting: a little hop and an arm pump on every number, getting more excited
    const k = Math.max(0, countedN(f) - 1), c = pulse(f, T.COUNTS[k], 12);
    m.hop = (8 + 2 * k) * c; m.arm = k % 2 ? 165 : 110; m.arm2 = k % 2 ? 110 : 165; m.eyes = 'happy'; m.mouth = c > 0.3 ? 'open' : 'grin';
    return { m, saw };
  }
  if (f < T.SIT_UP[1]) {
    // the take: eyes pop, jaw drops, ears shoot up -> dizzy spin -> topples over
    const t = f - T.TAKE;
    m.eyes = 'wide'; m.mouth = 'gasp'; m.earsUp = E.outBack(clamp(t / 6)); m.arm = 120; m.arm2 = 120;
    m.hop = 46 * Math.sin(Math.PI * clamp(t / 14));
    if (f >= T.TAKE + 18) {
      m.eyes = 'dizzy'; m.dizzyT = f * 0.5; m.earsUp = 0.3; m.arm = 60; m.arm2 = 60;
      m.rot = 14 * Math.sin((f - T.TAKE) * 0.7) * prog(T.TAKE + 18, T.FLOP[0], f);
    }
    if (f >= T.FLOP[0]) {
      const fl = E.outBounce(prog(T.FLOP[0], T.FLOP[1], f));
      const up = E.inOutCubic(prog(T.SIT_UP[0], T.SIT_UP[1], f));
      m.rot = -90 * fl * (1 - up); m.y = MOUSE_MID[1] - 40 * Math.sin(D2R * Math.abs(m.rot)); m.mouth = 'open'; m.tail = 40; m.arm = 20; m.arm2 = 20;
      if (up > 0.5) { m.eyes = 'open'; m.mouth = 'smile'; m.earsUp = 0; }
    }
    return { m, saw };
  }
  // shrug, laugh, wink
  const sh = pulse(f, T.SIT_UP[1] + 4, 26);
  m.arm = lerp(30, 95, sh); m.arm2 = lerp(30, 95, sh); m.hop = 8 * sh; m.eyes = 'open'; m.mouth = 'smile';
  if (f >= T.SIT_UP[1] + 30) { m.eyes = 'happy'; m.mouth = 'open'; m.squash = 1 + 0.05 * Math.sin(f * 1.3); m.arm = 40; m.arm2 = 40; }
  if (f >= T.WINK - 4) { m.eyes = 'wink'; m.mouth = 'grin'; m.squash = 1; m.arm = 150; m.arm2 = 30; }
  return { m, saw };
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  // shocked while the mouse saws
  const sur = prog(T.LEAP[0], T.LEAP[0] + 8, f) * (1 - prog(T.JUMP_DOWN[1], T.JUMP_DOWN[1] + 14, f));
  if (sur > 0) { st.aL = lerp(14, 150, sur); st.aR = lerp(14, 150, sur); st.fL = st.fR = lerp(10, 40, sur); st.mouth = 'open'; st.eyes = 'open'; st.head = 5 * Math.sin(f * 0.5) * sur; }
  // laughs at the mouse's take
  const lg = prog(T.TAKE + 10, T.TAKE + 20, f) * (1 - prog(T.SIT_UP[1], T.SIT_UP[1] + 10, f));
  if (lg > 0) { st.eyes = 'happy'; st.mouth = 'open'; st.head = 6 * Math.sin(f * 0.9) * lg; st.hop = 6 * Math.abs(Math.sin(f * 0.45)) * lg; st.aL = lerp(14, 40, lg); st.aR = lerp(14, 100, lg); st.fR = 80 * lg; }
  for (const g of [T.CARD_GLOW, T.ALL_GLOW]) { const c = pulse(f, g, 18); if (c > 0) { st.aL = lerp(st.aL, 155, c); st.aR = lerp(st.aR, 155, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
const FACE = {
  0: [[['4 × 6 = ', 'ink'], ['24', 'purple']], 74],
  1: [[['8 × 3 = ', 'ink'], ['?', 'purple']], 74],
  3: [[['8 × 3 = ', 'ink'], ['24', 'purple']], 74],
  4: [[['8 × 3 = ', 'ink'], ['4 × 6', 'purple']], 72],
};
function cardState(f) {
  let face = 0, theta = 0;
  for (const [f0, fi] of T.CARD_FLIPS) {
    const u = prog(f0, f0 + 14, f);
    if (u >= 0.5) face = fi;
    if (u > 0 && u < 1) theta = -(Math.PI / 2) * Math.sin(Math.PI * u);
  }
  // while counting, the card shows only the running total (one number at a time)
  let count = 0, bump = 0;
  if (face === 1 && f >= T.COUNTS[0]) { count = 3 * countedN(f); bump = pulse(f, T.COUNTS[countedN(f) - 1], 10); }
  return { face, theta, count, bump };
}
function drawCard(ctx, f) {
  const cs = cardState(f);
  if (Math.cos(cs.theta) <= 0.03) return;
  let tex;
  if (cs.count) {
    tex = cardTex(`count${cs.count}`, 560, 100, (x) => eqText(x, [[String(cs.count), C.purple]], 280, 53, 80), '#FFF6C9');
  } else {
    const [faceParts, size] = FACE[cs.face];
    tex = cardTex(`card${cs.face}`, 560, 100, (x) => eqText(x, faceParts.map(([t, col]) => [t, C[col]]), 280, 53, size), cs.face >= 3 ? '#FFF6C9' : C.cream);
  }
  const sc = 1 + 0.12 * cs.bump;
  const warm = 0.32 * (pulse(f, T.CARD_GLOW, 22) + pulse(f, 605, 22) + pulse(f, 703, 22) + 0.6 * cs.bump);
  drawPlane(ctx, tex, { x: CARD_CX - 280 * sc, w: 560 * sc, hingeY: SLOT_Y, h: 100 * sc, theta: cs.theta, dir: -1, shadow: 0.7, warm });
  scoreLine(ctx, CARD_CX - 260, SLOT_Y + 2, CARD_CX + 260, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
}
function halfGlow(k, side, f) {
  const i = countIdx(k, side);
  let g = pulse(f, T.COUNTS[i], 18) + pulse(f, T.PAIRS[0] + k * T.PAIRS[1], 16) + pulse(f, T.ALL_GLOW, 24) + 0.8 * pulse(f, T.BOX_BOUNCE[0] + k * T.BOX_BOUNCE[1], 14);
  return g;
}
function drawRow(ctx, k, f, mouseHere, sawHere) {
  const rim = RIMS[k];
  drawShelf(ctx, rim + FRONT_H - 6);
  const bounce = pulse(f, T.BOX_BOUNCE[0] + k * T.BOX_BOUNCE[1], 12) * 16;
  const halves = [-1, 1].map((side) => {
    const hop = bounce + 14 * pulse(f, T.COUNTS[countIdx(k, side)], 12);
    return { side, cx: halfCX(k, side, f), y: rim - hop, glow: halfGlow(k, side, f) };
  });
  // glows + back walls
  for (const h of halves) {
    if (h.glow > 0.01) {
      const g = ctx.createRadialGradient(h.cx, h.y - 10, 20, h.cx, h.y - 10, 240);
      g.addColorStop(0, `rgba(255,224,130,${0.55 * Math.min(1, h.glow)})`); g.addColorStop(1, 'rgba(255,224,130,0)');
      ctx.fillStyle = g; ctx.fillRect(h.cx - 240, h.y - 200, 480, 380);
    }
    withShadow(ctx, 5, 0.22);
    ctx.drawImage(halfTex(h.side).back, h.cx - HW / 2 - 20, h.y - 56);
    noShadow(ctx);
  }
  if (mouseHere) mouseHere();
  // the cookies: three per half, always fully drawn
  for (const h of halves) {
    for (let i = -1; i <= 1; i++) {
      ctx.save(); withShadow(ctx, 4, 0.3);
      ctx.drawImage(cookieImg(), h.cx + i * PITCH - CK / 2, h.y - CK + 10, CK, CK);
      ctx.restore();
    }
  }
  // fronts, then the seam: dashed "cut here" line before the cut, a growing slit while sawing
  for (const h of halves) { withShadow(ctx, 6, 0.3); ctx.drawImage(halfTex(h.side).front, h.cx - HW / 2 - 20, h.y - 4 - 20); noShadow(ctx); }
  const c = cutProg(k, f), sp = T.splitAt(k);
  if (f < sp) {
    scoreLine(ctx, BX, halves[0].y + 2, BX, halves[0].y + FRONT_H - 8, 'rgba(42,22,80,0.55)', 3);
    if (c > 0) {
      ctx.fillStyle = 'rgba(30,12,50,0.9)'; ctx.fillRect(BX - 3, halves[0].y - 4, 6, (FRONT_H) * c);
      // sawdust
      const r = rng(900 + k * 31 + f);
      for (let i = 0; i < 7; i++) {
        const a = r() * Math.PI, sp2 = 4 + r() * 10, t = r();
        ctx.fillStyle = i % 2 ? '#E7C38E' : '#F3E3C3';
        ctx.beginPath(); ctx.arc(BX + Math.cos(a) * sp2 * 4 * t * (r() < 0.5 ? -1 : 1), halves[0].y - 4 + FRONT_H * c + 20 * t * t, 3 + r() * 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  // sawdust puff on the split
  const pu = prog(sp, sp + 16, f);
  if (pu > 0 && pu < 1) {
    const r = rng(77 + k);
    for (let i = 0; i < 14; i++) {
      const a = r() * Math.PI * 2, d = 20 + r() * 70;
      ctx.globalAlpha = 1 - pu;
      ctx.fillStyle = i % 2 ? '#E7C38E' : '#FFF3D6';
      ctx.beginPath(); ctx.arc(BX + Math.cos(a) * d * E.outCubic(pu), rim + 40 + Math.sin(a) * d * 0.6 * E.outCubic(pu) + 30 * pu * pu, 4 + r() * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  if (sawHere) sawHere();
}
function drawStage(ctx, f) {
  drawAwning(ctx, f);
  const { m, saw } = mouseState(f);
  const drawM = () => {
    if (!m.flip) return drawMouse(ctx, m);
    ctx.save(); ctx.translate(m.x, 0); ctx.scale(-1, 1); ctx.translate(-m.x, 0); drawMouse(ctx, { ...m, x: m.x }); ctx.restore();
  };
  const drawS = () => drawSaw(ctx, saw.gx, saw.gy, saw.ang, saw.s, saw.shine);
  drawCounter(ctx);
  // the saw lies on the counter behind the mouse once the job is done
  const sawOnCounter = f >= T.JUMP_DOWN[1];
  if (sawOnCounter) drawS();
  for (let k = 0; k < 4; k++) {
    const here = m.layer === k;
    drawRow(ctx, k, f, here ? drawM : null, here && !sawOnCounter ? drawS : null);
  }
  if (m.layer === 'front') { drawM(); if (!sawOnCounter) drawS(); }
  // the flip card is mounted in front of the shelves so the mouse behind the top box never hides it
  drawCard(ctx, f);
  // dizzy rings orbiting the toppled mouse (cyan paper dots: nothing that looks like a cookie)
  if (f >= T.TAKE + 18 && f < T.SIT_UP[0] + 6) {
    const hx = m.rot < -30 ? m.x - 120 : m.x, hy = m.rot < -30 ? m.y - 40 : m.y - 200 - m.hop;
    for (let i = 0; i < 3; i++) {
      const a = f * 0.25 + (i * Math.PI * 2) / 3;
      ctx.beginPath(); ctx.arc(hx + Math.cos(a) * 52, hy - 20 + Math.sin(a) * 16, 8, 0, Math.PI * 2);
      ctx.fillStyle = i === 1 ? C.lilac : C.cyan; ctx.fill(); ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 2.5; ctx.stroke();
    }
  }
  // wink glint
  const wg = pulse(f, T.WINK, 14);
  if (wg > 0) sparkle(ctx, m.x + 34, m.y - 190, 26 * wg, 'rgba(255,255,255,0.95)');
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
  line('MORE BOXES,', 58, C.deep);
  line('MORE COOKIES?', 140, C.purple);
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
