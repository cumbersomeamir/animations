// "How Far Around?" (a square rooftop: one side is 8 hops, all four sides are the same, so the way around — the
// perimeter — is 4 × 8 = 32 hops) — Pop-up Counting Storybook (english-24). Entertainment first: a little star hops
// one side of a square roof high above an enchanted vertical city, flops at the corner, learns the sides are equal
// (the measured side swings round onto the other three), then cartwheels a speed lap. Beat-synced cuts; sharp close-ups.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import { drawStar } from './star.mjs';
import { drawMouse, mousePaw } from './mouse.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow, scoreLine, splitPin,
  sparkle, label, measure, starCookieSprite,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}


// ------------------------------------------------------------------ layout (world px)
const CX = 500; // caption centre (captions live in x 100–900)
const CAP_Y = 372; // caption centre: the upper band y ≈ 280–460
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const RES = 2; // cached page texture at 2× so the close-ups stay sharp
const SQ = { x0: 230, x1: 850, y0: 640, y1: 1260 }; // the square rooftop (one side = 8 hops)
const SIDE = SQ.x1 - SQ.x0, STEP = SIDE / 8;
const MID = [(SQ.x0 + SQ.x1) / 2, (SQ.y0 + SQ.y1) / 2];
const STAR_R = 58;
const MOUSE_AT = [130, 900]; // on a little balcony of the left tower, clear of the star's corner
const BAKER = { x: 250, y: 1690, s: 0.74 };

// ------------------------------------------------------------------ helpers
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
function cardTex(key, w, h, draw, fill = C.cream, border = C.violet) {
  const c = texCanvas(key, w, h);
  const x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(3, 3, w - 6, h - 6, 26), key.length * 7, 1.1, 14), border, { grainA: 0.06 });
  piece(x, cutPoly(roundRectPts(10, 10, w - 20, h - 20, 20), key.length * 7 + 1, 0.9, 14), fill, { grainA: 0.06 });
  draw(x);
  return c;
}
function eqText(x, parts, cx, cy, size) {
  x.save();
  x.font = `700 ${size}px ${FONT}`;
  const ws = parts.map(([t]) => x.measureText(t).width);
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  x.textBaseline = 'middle';
  parts.forEach(([t, col], i) => { x.fillStyle = col; x.fillText(t, px, cy); px += ws[i]; });
  x.restore();
}
/** point on the square's edge after i hops (clockwise from the top-left corner), i may be fractional */
function pathPt(i) {
  const n = ((i % 32) + 32) % 32, side = Math.floor(n / 8), t = (n - side * 8) / 8;
  if (side === 0) return [SQ.x0 + SIDE * t, SQ.y0];
  if (side === 1) return [SQ.x1, SQ.y0 + SIDE * t];
  if (side === 2) return [SQ.x1 - SIDE * t, SQ.y1];
  return [SQ.x0, SQ.y1 - SIDE * t];
}

// ------------------------------------------------------------------ states
function starState(f) {
  const s = { x: pathPt(0)[0], y: SQ.y0, size: STAR_R, eyes: 'open', mouth: 'smile', armWave: 0, look: [1, 0], rot: 0, hop: 0 };
  if (f < T.HOPS[0]) {
    // shading its eyes, peering along the long edge; a little bounce of excitement
    s.armWave = 35 + 6 * Math.sin(f * 0.3); s.look = [1, -0.2]; s.mouth = f < 40 ? 'o' : 'grin'; s.hop = 4 * Math.abs(Math.sin(f * 0.14));
    if (f >= T.FLAG_UP[0]) { s.eyes = 'wide'; s.armWave = 0; s.squashY = 0.92; }
    return s;
  }
  const hopEnd = T.HOPS[0] + T.HOPS[1] * 8;
  if (f < hopEnd) {
    const k = Math.floor((f - T.HOPS[0]) / T.HOPS[1]), u = ((f - T.HOPS[0]) % T.HOPS[1]) / T.HOPS[1];
    const a = pathPt(k), b = pathPt(k + 1);
    s.x = lerp(a[0], b[0], u); s.y = a[1]; s.hop = 55 * Math.sin(Math.PI * u);
    s.squashY = u < 0.15 || u > 0.9 ? 0.85 : 1.06; s.squashX = 2 - s.squashY;
    s.eyes = 'happy'; s.mouth = 'open'; s.armWave = 25 * Math.sin(u * Math.PI);
    return s;
  }
  const corner = pathPt(8);
  [s.x, s.y] = corner;
  if (f < T.FLOP[0]) { s.eyes = 'open'; s.mouth = 'puff'; s.squashY = 1 + 0.06 * Math.sin(f * 0.8); s.look = [0, 1]; return s; }
  if (f < T.VO.v04) {
    // flops flat, tired; peeks at the long way round
    const u = E.outBounce(prog(T.FLOP[0], T.FLOP[1], f));
    s.rot = 90 * u; s.y = corner[1] + 8 * u; s.eyes = 'tired'; s.mouth = 'puff'; s.cheeks = 1;
    if (f >= T.PULLBACK[0]) { s.eyes = 'open'; s.look = [-0.6, 1]; s.mouth = 'o'; }
    return s;
  }
  if (f < T.LAP[0]) {
    // "No! It's a square": springs up and watches the side swing round
    const u = E.outBack(prog(T.VO.v04, T.VO.v04 + 10, f));
    s.rot = 90 * (1 - u); s.hop = 20 * pulse(f, T.VO.v04, 14); s.eyes = 'wide'; s.mouth = 'o';
    const k = T.COPIES.filter((c) => f >= c - 14).length;
    const tgt = [[SQ.x1 + 60, MID[1]], [MID[0], SQ.y1 + 60], [SQ.x0 - 60, MID[1]]][Math.max(0, k - 1)];
    s.look = [(tgt[0] - s.x) / 300, (tgt[1] - s.y) / 300];
    if (f >= T.TICKS) { s.eyes = 'happy'; s.mouth = 'grin'; s.armWave = 30 * Math.sin(f * 0.5); }
    return s;
  }
  if (f < T.LAP[1]) {
    // speed lap, cartwheeling: a whole lap from this corner and back
    const u = prog(T.LAP[0], T.LAP[1], f);
    const p = pathPt(8 + 32 * u);
    s.x = p[0]; s.y = p[1]; s.rot = 720 * u; s.eyes = 'happy'; s.mouth = 'grin'; s.speed = true; s.u = u;
    return s;
  }
  // finished: victory bounce, then watches the light run round; winks before the page turns
  s.eyes = 'happy'; s.mouth = 'grin'; s.armWave = 40 * pulse(f, T.FINISH, 30); s.hop = 26 * pulse(f, T.FINISH, 16);
  if (f >= T.AROUND[0] && f < T.AROUND[1]) { const p = pathPt(32 * prog(T.AROUND[0], T.AROUND[1] - 40, f)); s.eyes = 'open'; s.look = [(p[0] - s.x) / 300, (p[1] - s.y) / 300]; s.mouth = 'smile'; }
  if (f >= T.WINK - 3) { s.eyes = 'wink'; s.mouth = 'grin'; }
  s.shine = pulse(f, T.WINK, 14);
  return s;
}

function mouseState(f) {
  const m = { x: MOUSE_AT[0], y: MOUSE_AT[1], s: 1.1, hop: 0, arm: 40, arm2: 20, tail: Math.sin(f * 0.22) * 14, ears: Math.sin(f * 0.3) * 6, eyes: 'open', mouth: 'smile', flip: false, flagUp: 0 };
  const up = Math.max(prog(T.FLAG_UP[0], T.FLAG_UP[0] + 10, f) * (1 - prog(T.HOPS[0] + 20, T.HOPS[0] + 30, f)), pulse(f, T.FINISH, 40) > 0 ? 1 : 0);
  m.flagUp = up; m.arm = lerp(40, 165, up);
  if (up > 0.5) { m.eyes = 'happy'; m.mouth = 'open'; m.hop = 8 * Math.abs(Math.sin(f * 0.4)); }
  if (f >= T.FLOP[0] && f < T.VO.v04) { m.eyes = 'wide'; m.mouth = 'o'; }
  if (f >= T.LAP[0] && f < T.LAP[1]) { m.eyes = 'wide'; m.mouth = 'gasp'; m.earsUp = 0.7; }
  return m;
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  if (camera(f).z > 1.3) st.rise = 0; // the pop-up baker lies folded flat during the close shots
  for (const g of [T.FINISH, T.SIGN[0] + 8]) { const c = pulse(f, g, 18); if (c > 0) { st.aL = lerp(st.aL, 155, c); st.aR = lerp(st.aR, 155, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ camera: one shot per beat-synced cut (the hop shot tracks the star)
function camera(f) {
  const s = T.SHOTS.find((sh) => f >= sh.from && f < sh.to) || T.SHOTS[T.SHOTS.length - 1];
  const u = E.inOutSine(prog(s.from, s.to, f));
  const cam = { z: lerp(s.z[0], s.z[1], u), fx: lerp(s.f[0][0], s.f[1][0], u), fy: lerp(s.f[0][1], s.f[1][1], u) };
  if (s.track) cam.fx = clamp(starState(f).x + 60, 340, 760);
  return cam;
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  const fx = 540 + (cam.fx - 540) * factor, fy = 960 + (cam.fy - 960) * factor;
  ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-fx, -fy);
}

// ------------------------------------------------------------------ stage pieces
function tower(ctx, x, y, w, h, col, roofCol, seed, f) {
  withShadow(ctx, 8, 0.28);
  piece(ctx, cutPoly(roundRectPts(x, y, w, h, 10), seed, 0.8, 14), col, { margin: 3, grainA: 0.08 });
  piece(ctx, cutPoly([[x - 12, y + 6], [x + w / 2, y - w * 0.55], [x + w + 12, y + 6]], seed + 1, 0.8, 10), roofCol, { margin: 3, grainA: 0.06 });
  noShadow(ctx);
  const r = rng(seed);
  for (let yy = y + 40; yy < y + h - 40; yy += 70) for (let xx = x + 26; xx < x + w - 30; xx += 56) {
    const lit = r() > 0.35;
    ctx.fillStyle = lit ? `rgba(255,226,150,${0.75 + 0.2 * Math.sin(f * 0.05 + xx + yy)})` : 'rgba(42,22,80,0.5)';
    ctx.beginPath(); ctx.roundRect(xx, yy, 30, 40, 12); ctx.fill();
  }
}
function drawCity(ctx, f) {
  // near towers on both sides of the page and the central tower under the roof (with a tiny glass lift)
  tower(ctx, 40, 760, 170, 760, '#9B6BF2', C.orange, 9901, f);
  tower(ctx, 880, 820, 160, 700, '#7C4DF2', C.yellow, 9905, f);
  withShadow(ctx, 8, 0.28);
  piece(ctx, cutPoly(roundRectPts(SQ.x0 + 40, SQ.y1 - 10, SIDE - 80, BOOK.bot - SQ.y1 + 10, 8), 9910, 0.8, 14), '#B48CF7', { margin: 3, grainA: 0.08 });
  noShadow(ctx);
  for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(255,226,150,0.85)'; ctx.beginPath(); ctx.roundRect(SQ.x0 + 80 + k * 90, SQ.y1 + 60, 44, 56, 14); ctx.fill(); }
  // the tiny lift riding up and down the central tower's face
  const ly = SQ.y1 + 150 + 60 * Math.sin(f * 0.04);
  ctx.strokeStyle = C.brass; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(MID[0], SQ.y1); ctx.lineTo(MID[0], ly); ctx.stroke();
  ctx.save(); withShadow(ctx, 5, 0.3); ctx.fillStyle = 'rgba(200,245,255,0.9)'; ctx.beginPath(); ctx.roundRect(MID[0] - 30, ly, 60, 70, 12); ctx.fill(); ctx.restore();
  ctx.lineWidth = 3; ctx.strokeStyle = C.violet; ctx.stroke();
  // balloons bobbing
  for (const [bx, by, col, ph] of [[640, 530, C.orange, 0], [965, 700, C.purple, 2]]) {
    const yy = by + 12 * Math.sin(f * 0.05 + ph);
    ctx.save(); withShadow(ctx, 6, 0.25);
    ctx.beginPath(); ctx.ellipse(bx, yy, 34, 42, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(bx - 10, yy - 12, 8, 14, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 14, yy + 38); ctx.lineTo(bx - 10, yy + 62); ctx.moveTo(bx + 14, yy + 38); ctx.lineTo(bx + 10, yy + 62); ctx.stroke();
    ctx.fillStyle = C.kraft; ctx.fillRect(bx - 12, yy + 62, 24, 18);
  }
}
let ROOF = null;
function roofArt() {
  // the square roof garden (static): parapet, lilac/cream tiles, flowerbeds, a little pond; hop stones on the edge
  if (ROOF) return ROOF;
  const pad = 40, w = SIDE + 2 * pad;
  const c = createCanvas(w * RES, w * RES), x = c.getContext('2d'); x.scale(RES, RES);
  x.save(); withShadow(x, 12, 0.3);
  piece(x, cutPoly(roundRectPts(pad - 16, pad - 16, SIDE + 32, SIDE + 32, 10), 9920, 0.8, 16), C.kraftLt, { margin: 3, grainA: 0.1 });
  x.restore();
  x.fillStyle = '#F7EEFF'; x.fillRect(pad, pad, SIDE, SIDE);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { x.fillStyle = 'rgba(209,152,250,0.28)'; x.fillRect(pad + i * STEP, pad + j * STEP, STEP, STEP); }
  // garden: pond + flowerbeds + pompom trees (kept clear of the middle where the sign rises)
  x.fillStyle = 'rgba(6,242,249,0.55)'; x.beginPath(); x.ellipse(pad + SIDE * 0.24, pad + SIDE * 0.76, 70, 40, 0, 0, Math.PI * 2); x.fill();
  const r = rng(77);
  for (const [cx, cy] of [[0.78, 0.24], [0.22, 0.26], [0.78, 0.78]]) {
    x.fillStyle = '#C9A2FB'; x.beginPath(); x.arc(pad + SIDE * cx, pad + SIDE * cy, 44, 0, Math.PI * 2); x.fill();
    for (let k = 0; k < 7; k++) { x.fillStyle = k % 2 ? C.orange : C.yellow; x.beginPath(); x.arc(pad + SIDE * cx + (r() - 0.5) * 60, pad + SIDE * cy + (r() - 0.5) * 60, 7, 0, Math.PI * 2); x.fill(); }
  }
  applyGrain(x, pad, pad, SIDE, SIDE, 0.08);
  // hop stones: 32 marks around the edge (one per hop)
  for (let i = 0; i < 32; i++) {
    const p = pathPt(i);
    x.beginPath(); x.arc(p[0] - SQ.x0 + pad, p[1] - SQ.y0 + pad, 9, 0, Math.PI * 2); x.fillStyle = '#FFFDF8'; x.fill(); x.lineWidth = 3; x.strokeStyle = C.violet; x.stroke();
  }
  ROOF = { c, pad, w };
  return ROOF;
}
/** the measured side: a yellow band with 8 hop arcs, drawn for the top side and rotated about the square's centre */
function drawRibbon(ctx, deg, alpha, glow = 0) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.translate(MID[0], MID[1]); ctx.rotate(deg * D2R); ctx.translate(-MID[0], -MID[1]);
  ctx.lineCap = 'round';
  ctx.lineWidth = 16 + 6 * glow; ctx.strokeStyle = 'rgba(255,253,248,0.95)'; ctx.beginPath(); ctx.moveTo(SQ.x0, SQ.y0); ctx.lineTo(SQ.x1, SQ.y0); ctx.stroke();
  ctx.lineWidth = 9 + 4 * glow; ctx.strokeStyle = glow > 0.3 ? '#FFE95A' : C.yellow; ctx.stroke();
  ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = C.orange;
  for (let k = 0; k < 8; k++) { const xa = SQ.x0 + k * STEP, xb = xa + STEP; ctx.beginPath(); ctx.moveTo(xa, SQ.y0 - 6); ctx.quadraticCurveTo((xa + xb) / 2, SQ.y0 - 56, xb, SQ.y0 - 6); ctx.stroke(); }
  ctx.setLineDash([]);
  ctx.restore();
}
function drawTick(ctx, deg, s) {
  if (s <= 0.01) return;
  ctx.save(); ctx.translate(MID[0], MID[1]); ctx.rotate(deg * D2R); ctx.translate(-MID[0], -MID[1]);
  ctx.lineCap = 'round';
  for (const dx of [-9, 9]) { ctx.lineWidth = 11; ctx.strokeStyle = '#FFFDF8'; ctx.beginPath(); ctx.moveTo(MID[0] + dx, SQ.y0 - 20 * s); ctx.lineTo(MID[0] + dx, SQ.y0 + 20 * s); ctx.stroke(); ctx.lineWidth = 6; ctx.strokeStyle = C.violet; ctx.stroke(); }
  ctx.restore();
}
function drawFlag(ctx, m) {
  const p = mousePaw(m, 1);
  const ang = -Math.PI / 2 - 0.25 + 0.3 * Math.sin(T_FRAME * 0.5) * m.flagUp - 0.6 * (1 - m.flagUp);
  const tx = p[0] + Math.cos(ang) * 110, ty = p[1] + Math.sin(ang) * 110;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.save(); ctx.translate(tx, ty); ctx.rotate(ang + Math.PI / 2); withShadow(ctx, 4, 0.25);
  const fw = 64, fh = 42; ctx.fillStyle = '#FFFDF8'; ctx.fillRect(0, -fw, fh, fw); noShadow(ctx);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) { ctx.fillStyle = C.violet; ctx.fillRect(j * fh / 3, -fw + i * fw / 4, fh / 3, fw / 4); }
  ctx.restore();
}
let T_FRAME = 0;
function drawSign(ctx, f) {
  if (f < T.SIGN[0]) return;
  const u = E.outBack(prog(T.SIGN[0], T.SIGN[1], f));
  const theta = -(Math.PI / 2) * (1 - u);
  if (Math.cos(theta) < 0.03) return;
  const tex = cardTex('sign', 360, 100, (x) => eqText(x, [['4 × 8 = ', C.ink], ['32', C.purple]], 180, 53, 70), '#FFF6C9');
  drawPlane(ctx, tex, { x: MID[0] - 180, w: 360, hingeY: MID[1] + 50, h: 100, theta, dir: -1, F: 1600, shadow: 0.8, warm: 0.3 * pulse(f, T.SIGN[1], 20) });
}
function drawStage(ctx, f) {
  T_FRAME = f;
  drawCity(ctx, f);
  const roof = roofArt();
  ctx.drawImage(roof.c, SQ.x0 - roof.pad, SQ.y0 - roof.pad, roof.w, roof.w);
  // hop arcs drawn so far on the first side
  const hopEnd = T.HOPS[0] + T.HOPS[1] * 8;
  const done = f < T.HOPS[0] ? 0 : Math.min(8, Math.floor((f - T.HOPS[0]) / T.HOPS[1]));
  if (f < hopEnd + 4) {
    ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = C.orange; ctx.lineCap = 'round';
    for (let k = 0; k < done; k++) { const xa = SQ.x0 + k * STEP, xb = xa + STEP; ctx.beginPath(); ctx.moveTo(xa, SQ.y0 - 6); ctx.quadraticCurveTo((xa + xb) / 2, SQ.y0 - 56, xb, SQ.y0 - 6); ctx.stroke(); }
    ctx.setLineDash([]);
  }
  // the measured side (top) glows from "One side is eight hops"; copies swing round onto the other sides
  const lapSide = (k) => (f >= T.LAP[0] ? clamp((f - (T.LAP[0] + 24 * k)) / 24) : 0); // right, bottom, left, top in the lap
  const sideGlow = (deg) => {
    const k = ((deg / 90) + 3) % 4; // lap order from the top-right corner: right(90) 0, bottom(180) 1, left(270) 2, top(0) 3
    let g = lapSide(k) >= 1 ? 0.6 : 0;
    g += pulse(f, T.TICKS, 22) * 0.8 + pulse(f, T.SIDE_PULSE[(deg / 90) % 4], 14);
    return g;
  };
  if (f >= hopEnd) drawRibbon(ctx, 0, clamp((f - hopEnd) / 6), sideGlow(0) + pulse(f, T.VO.v02 + 10, 20));
  for (let k = 1; k <= 3; k++) {
    const c = T.COPIES[k - 1];
    if (f < c - 14) continue;
    const u = E.outBack(prog(c - 14, c, f));
    drawRibbon(ctx, 90 * (k - 1) + 90 * u, 1, f >= c ? sideGlow(90 * k) : 0.4);
  }
  for (let k = 0; k < 4; k++) { const c = k === 0 ? T.COPIES[0] : T.COPIES[k - 1]; if (f >= c) drawTick(ctx, 90 * k, E.outBack(prog(c, c + 8, f)) * (1 + 0.3 * pulse(f, T.TICKS, 18))); }
  // the perimeter light: a glowing dot running all the way round
  if (f >= T.AROUND[0] && f < T.AROUND[1]) {
    const u = prog(T.AROUND[0], T.AROUND[1] - 40, f);
    for (let tr = 0; tr < 10; tr++) { const p = pathPt(32 * Math.max(0, u - tr * 0.012)); ctx.beginPath(); ctx.arc(p[0], p[1], 16 - tr, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,245,160,${0.9 - tr * 0.08})`; ctx.fill(); }
  }
  drawSign(ctx, f);
  // the mouse starter with its chequered flag
  const m = mouseState(f);
  withShadow(ctx, 6, 0.25); piece(ctx, cutPoly(roundRectPts(50, MOUSE_AT[1] - 4, 180, 22, 8), 9930, 0.6, 12), C.kraftLt, { margin: 3, grainA: 0.1 }); noShadow(ctx);
  drawMouse(ctx, m); drawFlag(ctx, m);
  // the star (+ afterimages and speed lines on the lap)
  const s = starState(f);
  if (s.speed) for (let g = 3; g >= 1; g--) { const p = pathPt(8 + 32 * Math.max(0, s.u - g * 0.03)); ctx.save(); ctx.globalAlpha = 0.18 * (4 - g); drawStar(ctx, { ...s, x: p[0], y: p[1], rot: s.rot - g * 30 }); ctx.restore(); }
  drawStar(ctx, s);
  // tired puffs at the corner
  if (f >= T.FLOP[0] && f < T.VO.v04) for (let i = 0; i < 2; i++) { const u = ((f + i * 12) % 24) / 24; ctx.save(); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.9; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(s.x - 70 - 30 * u, s.y - 40 - 30 * u, 10 + 10 * u, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // confetti at the finish
  const cf = prog(T.FINISH, T.FINISH + 40, f);
  if (cf > 0 && cf < 1) { const r = rng(5); for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, sp = 120 + r() * 200; ctx.fillStyle = [C.orange, C.yellow, C.cyan, C.purple, C.lilac][i % 5]; ctx.save(); ctx.translate(s.x + Math.cos(a) * sp * cf, s.y - 80 + Math.sin(a) * sp * cf + 200 * cf * cf); ctx.rotate(i + f * 0.3); ctx.globalAlpha = 1 - cf; ctx.fillRect(-6, -4, 12, 8); ctx.restore(); } }
}

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
  // the upright backdrop page: an enchanted vertical city by day — cyan-to-lilac sky, a paper sun, layers of distant
  // towers (lilac silhouettes with lit windows), little bridges, birds (2× texture for the close-ups)
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W * RES, (BOOK.bot + 4) * RES), x = c.getContext('2d'); x.scale(RES, RES);
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#B9F1F4'); g.addColorStop(0.5, '#E3D6FF'); g.addColorStop(1, '#F7D9F0');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  x.save(); withShadow(x, 8, 0.2); piece(x, cutCircle(900, 560, 56, 56, 9951, 1.0, 40), C.yellow, { margin: 3, grainA: 0.05 }); x.restore();
  const r = rng(95);
  // distant towers in two layers
  for (const [layer, col, top, n] of [[0, 'rgba(180,150,240,0.55)', 700, 9], [1, 'rgba(150,115,230,0.7)', 820, 8]]) {
    for (let k = 0; k < n; k++) {
      const w = 70 + r() * 60, xx = BOOK.x + (k + 0.5) * (BOOK.w / n) - w / 2 + (r() - 0.5) * 30, yy = top + r() * 160;
      x.fillStyle = col; x.beginPath(); x.roundRect(xx, yy, w, BOOK.bot - yy, 8); x.fill();
      x.beginPath(); x.moveTo(xx - 6, yy + 4); x.lineTo(xx + w / 2, yy - w * 0.5); x.lineTo(xx + w + 6, yy + 4); x.closePath(); x.fill();
      for (let yy2 = yy + 30; yy2 < BOOK.bot - 20; yy2 += 50) for (let xx2 = xx + 14; xx2 < xx + w - 18; xx2 += 30) if (r() > 0.5) { x.fillStyle = `rgba(255,236,170,${0.35 + 0.2 * layer})`; x.fillRect(xx2, yy2, 12, 18); x.fillStyle = col; }
    }
  }
  // birds
  x.strokeStyle = 'rgba(42,22,80,0.5)'; x.lineWidth = 3; x.lineCap = 'round';
  for (const [bx, by] of [[300, 520], [340, 545], [700, 600]]) { x.beginPath(); x.moveTo(bx - 12, by); x.quadraticCurveTo(bx - 6, by - 8, bx, by); x.quadraticCurveTo(bx + 6, by - 8, bx + 12, by); x.stroke(); }
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
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



// ------------------------------------------------------------------ frame-0 headline (hook words, folds away)
function drawHeadline(ctx, f) {
  if (f >= T.HEADLINE_OUT[1]) return;
  const th = (Math.PI / 2) * E.inCubic(prog(T.HEADLINE_OUT[0], T.HEADLINE_OUT[1], f));
  const tex = texCanvas('headline', 820, 196);
  const x = tex.getContext('2d');
  piece(x, cutPoly(roundRectPts(6, 6, 808, 184, 32), 1501, 1.4, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
  x.fillStyle = C.violet; x.fillRect(26, 20, 8, 156);
  const line = (t, y, col) => { x.save(); x.font = `700 84px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#FFFFFF'; x.strokeText(t, 420, y); x.fillStyle = col; x.fillText(t, 420, y); x.restore(); };
  line('HOW FAR', 58, C.deep);
  line('AROUND?', 140, C.purple);
  drawPlane(ctx, tex, { x: CX - 410, w: 820, hingeY: 278, h: 196, theta: th, dir: 1, F: 2200, shadow: 0.8, shade: 0.3 * Math.sin(th) });
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
    ctx.translate(CX, CAP_Y);
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
  // out-of-focus tower tips and a balloon at the bottom corners (closest depth layer)
  if (FG) return FG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.filter = 'blur(9px)';
  const spire = (bx, by, w, col, roof) => { x.fillStyle = col; x.fillRect(bx - w / 2, by, w, H - by + 40); x.fillStyle = roof; x.beginPath(); x.moveTo(bx - w / 2 - 10, by + 4); x.lineTo(bx, by - w * 0.7); x.lineTo(bx + w / 2 + 10, by + 4); x.closePath(); x.fill(); };
  spire(40, 1720, 150, 'rgba(124,77,242,0.95)', 'rgba(248,111,3,0.95)'); spire(1050, 1700, 170, 'rgba(155,107,242,0.95)', 'rgba(249,227,14,0.95)');
  x.fillStyle = 'rgba(145,31,249,0.85)'; x.beginPath(); x.ellipse(170, 1910, 70, 80, 0, 0, Math.PI * 2); x.fill();
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
    if (!turning) { ctx.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4); drawStage(ctx, f); }
    else {
      b.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4);
      drawStage(b, f);
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
