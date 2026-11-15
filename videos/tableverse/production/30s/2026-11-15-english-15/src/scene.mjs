// "Two Equal Groups" (6 × 8 = 24 + 24 = 48) — Pop-up Counting Storybook, depth edition (english-15).
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
  sparkle, label, measure, donutSprite,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout (world px)
const CX = 500; // composition centre (captions live in x 100–900)
const TRAY = { x: 128, y: 600, w: 744, padL: 40, padT: 24, cw: 86, ch: 100, padB: 22 };
TRAY.h = TRAY.padT + 6 * TRAY.ch + TRAY.padB; // 646 -> bottom 1246
const HINGE_Y = TRAY.y + TRAY.padT + 3 * TRAY.ch; // 924, between row 3 and row 4 (the two equal groups)
const UP_H = HINGE_Y - TRAY.y; // 324
const LO_H = TRAY.y + TRAY.h - HINGE_Y; // 322
const GAP = 110; // split distance between the two groups
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 590; // hinge line of the top flip card
const TAB_X = 108;
const BAKER = { x: 56, y: 1594, s: 0.86 };

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
  // shelves with bread loaves, jars, rolling pins (no donuts: counted objects stay on the sheet only)
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

// ------------------------------------------------------------------ sheet textures (per frame)
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
  // donut board: violet rim, lilac-cream card
  if (TRAYBASE) return TRAYBASE;
  const c = createCanvas(TRAY.w, TRAY.h), x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(2, 2, TRAY.w - 4, TRAY.h - 4, 30), 950, 1.2, 14), C.violet, { grainA: 0.1 });
  const g = x.createLinearGradient(0, 0, 0, TRAY.h);
  g.addColorStop(0, '#FFF7EC'); g.addColorStop(1, '#F4E6F6');
  piece(x, cutPoly(roundRectPts(13, 13, TRAY.w - 26, TRAY.h - 26, 22), 951, 1.0, 14), g, { grainA: 0.1 });
  // soft row dividers (printed)
  x.strokeStyle = 'rgba(57,12,214,0.08)'; x.lineWidth = 2;
  for (let r = 1; r < 6; r++) { if (r === 3) continue; const y = TRAY.padT + r * TRAY.ch; x.beginPath(); x.moveTo(TRAY.padL, y); x.lineTo(TRAY.w - 18, y); x.stroke(); }
  TRAYBASE = c;
  return c;
}
function pulse(f, f0, len = 18) {
  const t = f - f0;
  return t >= 0 && t < len ? Math.sin((Math.PI * t) / len) : 0;
}
/** render rows [r0, r1) of the sheet into a texture whose top is tray-local y0 */
function trayTex(key, r0, r1, y0, h, f, glow) {
  const c = texCanvas(key, TRAY.w, h);
  const x = c.getContext('2d');
  x.drawImage(trayBase(), 0, y0, TRAY.w, h, 0, 0, TRAY.w, h);
  const mac = donutSprite();
  for (let r = r0; r < r1; r++) {
    const py = TRAY.padT + TRAY.ch / 2 + r * TRAY.ch - y0;
    for (let cc = 0; cc < 8; cc++) {
      const px = TRAY.padL + TRAY.cw / 2 + cc * TRAY.cw;
      x.save(); x.translate(px, py); withShadow(x, 4, 0.3);
      x.drawImage(mac.img, -46, -46);
      x.restore();
      if (r === 0) {
        const ns = E.outBack(clamp((f - (T.COL_NUMS[0] + cc * T.COL_NUMS[1])) / 8)) * (1 - prog(T.COL_NUMS_OUT, T.COL_NUMS_OUT + 8, f));
        if (ns > 0.01) {
          x.save(); x.translate(px + 30, py - 30); x.scale(ns, ns);
          withShadow(x, 3, 0.3);
          piece(x, cutCircle(0, 0, 16, 16, 940 + cc, 0.4, 20), C.cyan, { margin: 2, grainA: 0.03 });
          noShadow(x); label(x, String(cc + 1), 0, 1, 22, { fill: C.deep });
          x.restore();
        }
      }
    }
    const ts = E.outBack(clamp((f - (T.ROW_TAGS[0] + r * T.ROW_TAGS[1])) / 8)) * (1 - prog(T.ROW_TAGS_OUT, T.ROW_TAGS_OUT + 8, f));
    if (ts > 0.01) {
      x.save(); x.translate(TRAY.padL / 2 + 1, py); x.scale(ts, ts);
      withShadow(x, 3, 0.3);
      piece(x, cutCircle(0, 0, 17, 17, 960 + r, 0.5, 22), C.yellow, { margin: 2.5, grainA: 0.04 });
      noShadow(x); label(x, String(r + 1), 0, 1, 23, { fill: C.deep });
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
export function splitAmount(f) {
  // 1 = the two groups apart on their hinge strip, 0 = one sheet. Frame 0 starts split (hook image).
  const close1 = E.inOutCubic(prog(T.CLOSE1[0], T.CLOSE1[1], f));
  const open = E.outBack(prog(T.SPLIT[0], T.SPLIT[1], f));
  const close2 = E.inOutCubic(prog(T.CLOSE2[0], T.CLOSE2[1], f));
  return f < T.SPLIT[0] ? 1 - close1 : open * (1 - close2);
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
    [0, 1.0, CX, 960], [146, 1.0, CX, 960],
    [226, 1.0, CX, 960], [306, 1.035, CX, 1000], [340, 1.035, CX, 1000], [380, 1.0, CX, 960], // lean-in during the noticing pause
    [590, 1.0, CX, 960], [620, 1.03, CX, 760], [650, 1.03, CX, 760], [680, 1.0, CX, 960], // the answer card
  ]);
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}

function bakerState(f) {
  // frame 0: already standing, smiling (no pop-in: the first frame is the finished hook image)
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'open' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed';
  const shoulder = [st.x + 38 * st.s, st.y - 138 * st.s];
  const toward = (tx, ty) => Math.atan2(tx - shoulder[0], ty - shoulder[1]) / D2R;
  const handle = [TAB_X, 1440 + 40 * clamp(splitAmount(f))];
  const reach = (p) => { st.aR = lerp(st.aR, toward(handle[0], handle[1]), p); st.fR = lerp(st.fR, -20, p); st.lean = 5 * p; };
  if (f < 78) {
    // holds the pull-tab (the sheet is split) and pushes it up as the halves close
    reach(1 - E.inOutCubic(prog(70, 92, f)));
    st.eyes = f < 60 ? 'happy' : st.eyes; st.mouth = f < 60 ? 'open' : 'smile';
  } else if (f < 146) {
    st.eyes = 'open'; st.mouth = 'smile';
    for (let r = 0; r < 6; r++) { const t = f - (T.ROW_TAGS[0] + r * T.ROW_TAGS[1]); if (t >= 0 && t < 4) st.head = -3; }
  } else if (f < 226) {
    st.eyes = 'open'; st.mouth = 'smile';
    reach(E.inOutCubic(prog(158, 168, f)));
  } else if (f < 340) {
    // thinking during the question + pause
    st.eyes = 'open'; st.mouth = 'smile';
    reach(1 - prog(226, 236, f));
    const p = prog(232, 242, f);
    st.aL = lerp(14, 30, p); st.fL = lerp(10, -120, p); st.head = 8 * p;
    if (f >= T.MATCH) { st.eyes = 'happy'; st.mouth = 'open'; st.hop = 8 * pulse(f, T.MATCH, 12); }
  } else if (f < 590) {
    st.eyes = 'open'; st.mouth = 'smile';
    for (const g of [T.GLOW_TOP, T.GLOW_BOT, T.GLOW_BOTH]) { const c = pulse(f, g, 14); if (c > 0) { st.aL = lerp(14, 160, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  } else if (f < 806) {
    st.eyes = 'open'; st.mouth = 'smile';
    const p = prog(594, 604, f) * (1 - prog(648, 656, f));
    st.aR = lerp(14, toward(CX - 140, SLOT_Y - 50), p); st.fR = lerp(10, 0, p); st.head = -8 * p;
    const c1 = pulse(f, T.FIND_THREE, 16); if (c1 > 0) { st.aR = lerp(st.aR, 120, c1); }
    const c2 = pulse(f, T.DOUBLE_IT, 26); if (c2 > 0) { st.aL = lerp(14, 160, c2); st.aR = lerp(st.aR, 160, c2); st.hop = 12 * c2; st.eyes = 'happy'; st.mouth = 'open'; }
    if (f > 740) st.eyes = 'happy';
  } else {
    const w = prog(832, 840, f);
    st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = f > 836 ? 'open' : 'smile';
    st.hop = 12 * pulse(f, 828, 14);
  }
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
const CARD_FACES = [
  [['6 × 8 = ', 'ink'], ['?', 'purple']],
  [['24', 'violet'], [' + ', 'ink'], ['24', 'orange'], [' = ', 'ink'], ['48', 'purple']],
  [['6 × 8 = ', 'ink'], ['48', 'purple']],
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
function halfFlap(ctx, key, text, hingeY, k, theta, glow) {
  if (Math.cos(theta) <= 0.03) return;
  const tex = cardTex(key, 420, 84, (x) => eqText(x, text, 210, 45, 60), C.cream);
  drawPlane(ctx, tex, { x: CX - 210 * k, w: 420 * k, hingeY, h: 84 * k, theta, dir: 1, shadow: 0.7, warm: 0.32 * glow });
}
function drawStage(ctx, f) {
  const sp = splitAmount(f);
  // ---- top flip card
  const cs = cardState(f);
  if (Math.cos(cs.theta) > 0.03) {
    const parts = CARD_FACES[cs.face].map(([t, col]) => [t, C[col]]);
    const tex = cardTex(`card${cs.face}`, 560, 100, (x) => eqText(x, parts, 280, 53, 74), cs.face === 2 ? '#FFF6C9' : C.cream);
    drawPlane(ctx, tex, { x: CX - 280, w: 560, hingeY: SLOT_Y, h: 100, theta: cs.theta, dir: -1, shadow: 0.7, warm: 0.3 * pulse(f, T.GLOW_CARD, 20) + 0.25 * pulse(f, T.GLOW_BOTH, 20) });
    scoreLine(ctx, CX - 260, SLOT_Y + 2, CX + 260, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
  }
  // ---- the sheet: top group (rows 1–3) fixed, bottom group (rows 4–6) on a hinge strip
  const both = pulse(f, T.GLOW_BOTH, 22) + pulse(f, T.DOUBLE_IT, 26) + 0.6 * (f < 40 ? 0.5 + 0.5 * Math.sin(f * 0.15) : 0);
  const gUp = pulse(f, T.GLOW_TOP, 22) + pulse(f, T.FIND_THREE, 20) + both;
  const gLo = pulse(f, T.GLOW_BOT, 22) + both;
  ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(40,16,60,0.30)';
  ctx.fillRect(TRAY.x + 14, TRAY.y + 22, TRAY.w, UP_H - 10); ctx.restore();
  ctx.drawImage(trayTex('up', 0, 3, 0, UP_H, f, clamp(gUp)), TRAY.x, TRAY.y);
  const gap = GAP * clamp(sp);
  if (gap > 1) {
    const yA = HINGE_Y, yB = HINGE_Y + gap, ym = (yA + yB) / 2;
    ctx.save();
    ctx.fillStyle = '#F3E2C4'; ctx.fillRect(TRAY.x + 22, yA, TRAY.w - 44, ym - yA);
    ctx.fillStyle = '#D9C29C'; ctx.fillRect(TRAY.x + 22, ym, TRAY.w - 44, yB - ym);
    ctx.fillStyle = 'rgba(40,16,60,0.35)'; ctx.fillRect(TRAY.x + 22, yA, TRAY.w - 44, 5);
    scoreLine(ctx, TRAY.x + 28, ym, TRAY.x + TRAY.w - 28, ym, 'rgba(80,50,20,0.45)', 2);
    ctx.restore();
  }
  const lo = drawPlane(ctx, trayTex('lo', 3, 6, UP_H, LO_H, f, clamp(gLo)), {
    x: TRAY.x, w: TRAY.w, hingeY: HINGE_Y + gap, h: LO_H, theta: 9 * D2R * sp, dir: 1, shadow: 0.4 + 0.6 * sp, warm: 0.06 * sp,
  });
  // hinge pins (visible from the start; glint when the split is explained)
  const pinGap = gap > 1 ? [HINGE_Y, HINGE_Y + gap] : [HINGE_Y];
  if (gap <= 1) scoreLine(ctx, TRAY.x + 18, HINGE_Y, TRAY.x + TRAY.w - 18, HINGE_Y, 'rgba(42,22,80,0.6)', 3);
  for (const px of [TRAY.x + 10, TRAY.x + TRAY.w - 10]) for (const py of pinGap) splitPin(ctx, px, py, 11);
  const gl = pulse(f, T.HINGE_SHOW, 18);
  if (gl > 0) { sparkle(ctx, TRAY.x + 10, HINGE_Y, 26 * gl, C.yellow); sparkle(ctx, TRAY.x + TRAY.w - 10, HINGE_Y, 26 * gl, C.yellow); }
  drawTabAndPins(ctx, f, gap);
  // ---- ghost outline of the top group slides down and fits the bottom group exactly
  if (f >= T.GHOST[0] && f < T.MATCH + 40) {
    const u = E.inOutCubic(prog(T.GHOST[0], T.GHOST[1], f));
    const fade = 1 - prog(T.MATCH + 22, T.MATCH + 40, f);
    const yTop = lerp(TRAY.y + TRAY.padT - 6, HINGE_Y + gap + 4, u);
    const hh = 3 * TRAY.ch + 6;
    ctx.save(); ctx.globalAlpha = fade;
    pathFrom(ctx, roundRectPts(TRAY.x + TRAY.padL - 8, yTop, TRAY.w - TRAY.padL - 10, hh * (u > 0.98 ? lo.k : 1), 22));
    ctx.setLineDash([16, 10]); ctx.lineWidth = 7; ctx.strokeStyle = C.violet; ctx.stroke();
    if (f >= T.MATCH) { ctx.globalAlpha = fade * pulse(f, T.MATCH, 24); ctx.setLineDash([]); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(249,227,14,0.6)'; ctx.stroke(); }
    ctx.restore();
  }
  // ---- "3 × 8 = 24" on each group: flaps hanging from the top group (into the gap) and from the bottom group
  const flapTh = (f0) => (f < f0 ? Math.PI / 2 : (Math.PI / 2) * (1 - E.outBack(prog(f0, f0 + 14, f)))) + (Math.PI / 2) * E.inCubic(prog(T.CLOSE2[0] - 12, T.CLOSE2[0], f));
  const txt = [['3 × 8 = ', C.ink], ['24', C.violet]];
  const txt2 = [['3 × 8 = ', C.ink], ['24', C.orange]];
  halfFlap(ctx, 'flapTop', txt, HINGE_Y + 3, 1, Math.min(Math.PI / 2, flapTh(T.FLAP_TOP)), pulse(f, T.GLOW_TOP, 20) + pulse(f, T.FIND_THREE, 20) + pulse(f, T.DOUBLE_IT, 26));
  halfFlap(ctx, 'flapBot', txt2, lo.y + 4, lo.k, Math.min(Math.PI / 2, flapTh(T.FLAP_BOT)), pulse(f, T.GLOW_BOT, 20) + pulse(f, T.DOUBLE_IT, 26));
  // "× 2" stamp on "double it"
  const d2 = E.outBack(prog(T.DOUBLE_IT, T.DOUBLE_IT + 10, f)) * (1 - prog(T.CLOSE2[0] - 10, T.CLOSE2[0], f));
  if (d2 > 0.01) {
    // sits in the gap, right of the top flap, inside the caption-safe width (x < 900)
    ctx.save(); ctx.translate(796, HINGE_Y + gap / 2); ctx.scale(d2, d2); ctx.rotate(-8 * D2R);
    withShadow(ctx, 6, 0.35);
    piece(ctx, cutCircle(0, 0, 50, 50, 1401, 0.8, 28), C.yellow, { margin: 3, grainA: 0.05 });
    noShadow(ctx); label(ctx, '× 2', 0, 3, 46, { fill: C.deep });
    ctx.restore();
  }
}

function drawTabAndPins(ctx, f, gap) {
  // pull tab in its slot (left of the sheet), linked to the bottom group's hinge
  const hy = 1440 + 40 * clamp(splitAmount(f));
  ctx.save(); withShadow(ctx, 5, 0.3);
  piece(ctx, cutPoly([[TAB_X - 7, HINGE_Y + gap + 4], [TAB_X + 7, HINGE_Y + gap + 4], [TAB_X + 7, hy], [TAB_X - 7, hy]], 990, 0.5, 12), C.kraftLt, { margin: 1.5, grainA: 0.05 });
  piece(ctx, cutPoly(roundRectPts(TAB_X - 18, hy - 6, 36, 54, 13), 991, 0.6, 10), C.orange, { margin: 2.5, grainA: 0.05 });
  ctx.restore();
  splitPin(ctx, TAB_X, hy + 10, 5);
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
  line('SPLIT IT.', 58, C.deep);
  line('SOLVE IT.', 140, C.purple);
  drawPlane(ctx, tex, { x: CX - 410, w: 820, hingeY: 210, h: 196, theta: th, dir: 1, F: 2200, shadow: 0.8, shade: 0.3 * Math.sin(th) });
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
  drawHeadline(ctx, f);
  applyGrain(ctx, 0, 0, W, H, 0.03, 'overlay');
}

// ------------------------------------------------------------------ thumbnail = frame 0 (the hook image)
export function drawThumbnail(ctx) {
  drawFrame(ctx, 0);
}
