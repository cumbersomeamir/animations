// "The Octopus's Square Picnic" (4 × 4 = 16 is a square number) — Pop-up Counting Storybook, depth edition (english-21).
// Entertainment first: a mischievous octopus tips its picnic baskets into a mess, tidies the oranges row by row with its
// eight arms and measures four across, four down: a perfect square.
// Every hinge is drawn with real perspective (strip-projected planes), the background has depth of field,
// camera moves are motivated and parallaxed, and planes are lit by a warm key light from the top-right (lamp + window).
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, quadBezier, D2R } from './util.mjs';
import { armRoot, idleArm, bezArm, reachArm, mixArm, drawOctopusArms, drawOctopusBody } from './octopus.mjs';
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
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const SLOT_Y = 560; // hinge line of the top flip card
const CARD_CX = 540;
const SX = [378, 486, 594, 702], SY = [712, 820, 928, 1036]; // the 4 × 4 square of oranges
const OR = 92; // drawn orange size
const BLANKET = { x: 222, y: 650, w: 636, h: 500, check: 53 };
const BASKETS = [[205, 760], [415, 740], [665, 740], [875, 760]]; // rim centres at frame 0
const BSC = 0.84; // basket scale (oranges inside are drawn at the same scale)
// messy piles on the sand after the tip (left strip + bottom-left, right strip + bottom-right); every orange visible
const MESS_L = [[168, 720], [160, 860], [172, 1000], [158, 1135], [250, 1250], [360, 1225], [215, 1370], [330, 1355]];
const MESS_R = [[912, 760], [920, 895], [905, 1040], [922, 1160], [830, 1245], [720, 1230], [865, 1375], [750, 1360]];
const OCTO = { x: 540, y: 1410, s: 1.12 };
const BAKER = { x: 250, y: 1690, s: 0.74 };
const SQ = { x0: SX[0] - 62, y0: SY[0] - 62, x1: SX[3] + 62, y1: SY[3] + 62 };

// orange i: basket b = i >> 2, slot-in-basket j = i & 3
const MESS = (() => {
  const m = [];
  for (let i = 0; i < 16; i++) { const b = i >> 2, j = i & 3; m.push(b === 0 ? MESS_L[j] : b === 1 ? MESS_L[4 + j] : b === 2 ? MESS_R[4 + j] : MESS_R[j]); }
  return m;
})();
// which orange goes to which square slot: row r takes the next two from each side, left ones to the left columns
const TARGET = (() => {
  const t = new Array(16);
  const L = (k) => (k < 4 ? k : 4 + (k - 4)); // index into MESS_L -> orange
  const findOrange = (pos) => MESS.findIndex((p) => p === pos);
  for (let r = 0; r < 4; r++) {
    const l0 = MESS_L[2 * r], l1 = MESS_L[2 * r + 1], r0 = MESS_R[2 * r], r1 = MESS_R[2 * r + 1];
    void L;
    t[findOrange(l0)] = [r, 0]; t[findOrange(l1)] = [r, 1]; t[findOrange(r1)] = [r, 2]; t[findOrange(r0)] = [r, 3];
  }
  return t;
})();
// arms carrying row r: even rows use the outer arms, odd rows the inner arms (column order left -> right)
const ROW_ARMS = [[0, 1, 6, 7], [2, 3, 4, 5], [0, 1, 6, 7], [2, 3, 4, 5]];
const HOLD_ARMS = [0, 2, 5, 7]; // frame 0: arms holding baskets 0..3

// ------------------------------------------------------------------ textures
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
let ORANGE = null;
function orangeImg() {
  if (ORANGE) return ORANGE;
  const c = createCanvas(110, 110), x = c.getContext('2d');
  const cx = 55, cy = 58;
  const g = x.createRadialGradient(cx - 14, cy - 16, 4, cx, cy, 48);
  g.addColorStop(0, '#FFC06A'); g.addColorStop(0.5, '#FF8A1E'); g.addColorStop(1, '#D95A00');
  x.save(); withShadow(x, 4, 0.25);
  piece(x, cutCircle(cx, cy, 44, 43, 5101, 0.8, 40), g, { margin: 3, grainA: 0.1 });
  x.restore();
  const r = rng(51);
  for (let k = 0; k < 26; k++) { const a = r() * Math.PI * 2, d = r() * 36; x.beginPath(); x.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.4, 0, Math.PI * 2); x.fillStyle = 'rgba(190,80,0,0.35)'; x.fill(); }
  x.beginPath(); x.ellipse(cx - 16, cy - 18, 11, 6, -0.6, 0, Math.PI * 2); x.fillStyle = 'rgba(255,255,255,0.55)'; x.fill();
  // stem + leaf
  x.beginPath(); x.arc(cx + 2, cy - 40, 3.5, 0, Math.PI * 2); x.fillStyle = '#6B4A1E'; x.fill();
  x.save(); x.translate(cx + 6, cy - 42); x.rotate(-0.5);
  piece(x, [[0, 0], [14, -10], [30, -8], [20, 4], [6, 6]], C.leaf, { margin: 2, grainA: 0.05 });
  x.restore();
  ORANGE = c;
  return c;
}
function drawOrange(ctx, x, y, rot = 0, sc = 1, glow = 0, ring = 0) {
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(x, y, 10, x, y, 80);
    g.addColorStop(0, `rgba(255,236,150,${0.75 * Math.min(1, glow)})`); g.addColorStop(1, 'rgba(255,236,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 80, 0, Math.PI * 2); ctx.fill();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const s = (OR / 92) * sc * (1 + 0.12 * Math.min(1, glow)); ctx.scale(s, s);
  ctx.drawImage(orangeImg(), -55, -58);
  ctx.restore();
  if (ring > 0.01) {
    // measured: a bright ring that stays on while the arm measures the side
    ctx.save(); ctx.globalAlpha = Math.min(1, ring);
    ctx.beginPath(); ctx.arc(x, y + 2, 53, 0, Math.PI * 2);
    ctx.lineWidth = 11; ctx.strokeStyle = '#FFFDF8'; ctx.stroke();
    ctx.lineWidth = 6; ctx.strokeStyle = C.yellow; ctx.stroke();
    ctx.restore();
  }
}
let BLANKETART = null;
function blanketArt() {
  if (BLANKETART) return BLANKETART;
  const { w, h, check } = BLANKET;
  const c = createCanvas(w + 20, h + 20), x = c.getContext('2d');
  const pts = cutPoly(roundRectPts(10, 10, w, h, 18), 5201, 1.0, 14);
  x.save(); withShadow(x, 8, 0.22); piece(x, pts, C.cream, { margin: 3, grainA: 0.06 }); x.restore();
  x.save(); pathFrom(x, pts); x.clip();
  // gingham: translucent lilac bands both ways (darker where they cross)
  for (let k = 0; k * check < w + check; k += 2) { x.fillStyle = 'rgba(209,152,250,0.45)'; x.fillRect(10 + k * check, 0, check, h + 20); }
  for (let k = 0; k * check < h + check; k += 2) { x.fillStyle = 'rgba(209,152,250,0.45)'; x.fillRect(0, 10 + k * check, w + 20, check); }
  applyGrain(x, 0, 0, w + 20, h + 20, 0.08);
  x.restore();
  BLANKETART = c;
  return c;
}
function basketParts() {
  // back (handle + inside) and front (woven body), drawn around the rim centre (0, 0)
  if (TEX.basketBack) return;
  const bk = createCanvas(240, 260), fr = createCanvas(240, 140);
  let x = bk.getContext('2d');
  x.translate(120, 150);
  x.lineCap = 'round'; x.strokeStyle = C.kraftDk; x.lineWidth = 14; x.beginPath(); x.moveTo(-74, 0); x.bezierCurveTo(-74, -150, 74, -150, 74, 0); x.stroke();
  x.strokeStyle = C.kraftLt; x.lineWidth = 6; x.stroke();
  piece(x, cutPoly([[-92, -6], [92, -6], [86, 10], [-86, 10]], 5301, 0.6, 12), '#8A5A24', { margin: 0, grainA: 0.1 });
  x = fr.getContext('2d');
  x.translate(120, 10);
  const body = cutPoly([[-98, 0], [98, 0], [82, 92], [-82, 92]], 5302, 0.8, 12);
  piece(x, body, C.kraft, { margin: 3, grainA: 0.14 });
  x.save(); pathFrom(x, body); x.clip();
  x.strokeStyle = 'rgba(120,70,20,0.45)'; x.lineWidth = 2.2;
  for (let yy = 16; yy < 92; yy += 16) { x.beginPath(); x.moveTo(-100, yy); x.lineTo(100, yy); x.stroke(); }
  for (let xx = -90; xx <= 90; xx += 18) { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx * 0.85, 92); x.stroke(); }
  x.fillStyle = C.violet; x.fillRect(-100, 0, 200, 14);
  x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(-100, 2, 200, 3);
  x.restore();
  TEX.basketBack = bk; TEX.basketFront = fr;
}
const BASKET_SLOTS = [[-44, -14], [44, -14], [-24, -72], [24, -72]]; // oranges in a basket (front pair, back pair raised)
function drawBasket(ctx, cx, cy, rot, inside, sc = 1, hatOnly = false) {
  basketParts();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  if (!hatOnly) { withShadow(ctx, 6, 0.25); ctx.drawImage(TEX.basketBack, -120, -150); noShadow(ctx); }
  // back pair first, then front pair
  for (const j of [2, 3, 0, 1]) if (inside && inside[j]) { const [ox, oy] = BASKET_SLOTS[j]; drawOrange(ctx, ox, oy, 0, 1, inside[j].glow || 0); }
  withShadow(ctx, 6, 0.28); ctx.drawImage(TEX.basketFront, -120, -10); noShadow(ctx);
  ctx.restore();
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
  const keys = [[0, 1.0, 540, 960], [40, 1.0, 540, 960], [80, 1.04, 540, 900], [118, 1.04, 540, 900], [150, 1.0, 540, 960],
    [T.PAUSE[0], 1.0, 540, 960], [T.PAUSE[1], 1.04, 540, 880], [T.DOWN[1] + 20, 1.04, 540, 880], [T.COUNTS[0], 1.0, 540, 960],
    [614, 1.0, 540, 960], [640, 1.05, 540, 880], [700, 1.05, 540, 880], [T.DANCE[0], 1.0, 540, 960]];
  let z = keys[0][1], cx = keys[0][2], cy = keys[0][3];
  for (let i = 1; i < keys.length; i++) {
    const [f0, z0, x0, y0] = keys[i - 1], [f1, z1, x1, y1] = keys[i];
    if (f >= f0) { const u = E.inOutCubic(prog(f0, f1, f)); z = lerp(z0, z1, u); cx = lerp(x0, x1, u); cy = lerp(y0, y1, u); }
  }
  // comic camera bump when the basket bonks the octopus
  const b = f - T.HAT_DROP[1];
  const shake = b >= 0 && b < 12 ? 9 * Math.exp(-b / 4) * Math.sin(b * 2.4) : 0;
  return { z, cx, cy, shake };
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  ctx.translate(cam.cx + cam.shake * factor, cam.cy);
  ctx.scale(z, z);
  ctx.translate(-cam.cx, -cam.cy);
}

const slotXY = (r, c) => [SX[c], SY[r]];
/** orange i: where it is and how it looks at frame f */
function orangeState(i, f) {
  const b = i >> 2, j = i & 3;
  const t0 = T.LAUNCH + 2 * (i % 4) + b;
  const [r, c] = TARGET[i];
  const R0 = T.ROWS[r];
  const st = { x: 0, y: 0, rot: 0, inBasket: false, glow: 0 };
  if (f < t0) { st.inBasket = true; return st; }
  const M = MESS[i];
  if (f < R0) {
    const u = prog(t0, t0 + T.FLIGHT, f);
    const start = basketWorld(b, f, j);
    const side = M[0] < 540 ? 1 : -1;
    const B = [clamp(M[0] + side * 150, BLANKET.x + 60, BLANKET.x + BLANKET.w - 60), clamp(M[1] - 60, BLANKET.y + 60, BLANKET.y + BLANKET.h - 40)];
    if (u < 0.5) { const v = u / 0.5; st.x = lerp(start[0], B[0], v); st.y = lerp(start[1], B[1], v) - 120 * Math.sin(Math.PI * v); }
    else { const v = E.outQuad((u - 0.5) / 0.5); st.x = lerp(B[0], M[0], v); st.y = lerp(B[1], M[1], v) - 40 * Math.sin(Math.PI * v); }
    st.rot = (f - t0) * 0.35 * side * (1 - E.outCubic(u)) + i;
    if (u >= 1) { st.x = M[0]; st.y = M[1]; st.rot = i + T.FLIGHT * 0.35 * side * 0.3; }
    return st;
  }
  const v = prog(R0, R0 + T.CARRY, f), e = E.inOutCubic(v);
  const S = slotXY(r, c);
  st.x = lerp(M[0], S[0], e); st.y = lerp(M[1], S[1], e) - 60 * Math.sin(Math.PI * v);
  st.rot = lerp(i + T.FLIGHT * 0.1, 0, e);
  st.carry = v > 0 && v < 1;
  // glows: measured (top row / right column), counted by rows, square-number pulses
  if (f >= R0 + T.CARRY) {
    st.glow = pulse(f, R0 + T.CARRY, 10) * 0.6 + pulse(f, T.COUNTS[r], 18) + 0.55 * (pulse(f, T.SQUARE_PULSE[0], 24) + pulse(f, T.SQUARE_PULSE[2], 24));
    const tip = measureTips(f);
    // measured oranges light up as the arm tip passes and stay lit until the square outline appears
    const keep = 1 - prog(T.OUTLINE, T.OUTLINE + 10, f);
    if (r === 0 && tip.across) { st.glow += Math.max(0, 1 - Math.abs(tip.across[0] - S[0]) / 70); if (tip.across[0] >= S[0] - 10) st.ring = Math.max(st.ring || 0, keep); }
    if (c === 3 && tip.down) { st.glow += Math.max(0, 1 - Math.abs(tip.down[1] - S[1]) / 70); if (tip.down[1] >= S[1] - 10) st.ring = Math.max(st.ring || 0, keep); }
  }
  return st;
}
function basketMotion(b, f) {
  // [cx, cy, rot] of basket b
  let [x, y] = BASKETS[b], rot = 0;
  y -= 20 * pulse(f, T.BASKET_BOUNCE[0] + b * T.BASKET_BOUNCE[1], 12);
  y -= 6 * Math.sin(f * 0.15 + b); // held up, bobbing
  const side = b < 2 ? -1 : 1;
  rot = side * 2.45 * E.inOutCubic(prog(T.TIP[0], T.TIP[1], f));
  if (f >= T.TIP[1]) {
    if (b === 1) {
      // flies up and lands upside-down on the octopus's head
      const u = prog(T.TIP[1] + 2, T.HAT_DROP[1], f), hp = hatPos(f);
      x = lerp(BASKETS[1][0], hp[0], E.inOutSine(u)); y = lerp(BASKETS[1][1], hp[1], u) - 260 * Math.sin(Math.PI * u);
      rot = lerp(-2.45, -3 * Math.PI, u); // one spin, then upside-down: it becomes a hat
      return [x, y, rot, u >= 1, u];
    }
    // the other baskets are flung off the page
    const u = prog(T.TIP[1], T.TIP[1] + 18, f);
    x += side * 700 * E.inQuad(u) + (b === 0 ? -100 : 0) * u; y -= 300 * Math.sin(Math.PI * 0.6 * u) - 200 * u * u; rot += side * 6 * u;
  }
  return [x, y, rot, false];
}
function basketWorld(b, f, j) {
  const [x, y, rot] = basketMotion(b, Math.min(f, T.LAUNCH + 2 * j + b));
  const [ox, oy] = BASKET_SLOTS[j].map((v) => v * BSC);
  return [x + ox * Math.cos(rot) - oy * Math.sin(rot), y + ox * Math.sin(rot) + oy * Math.cos(rot)];
}
function octoState(f) {
  const o = { x: OCTO.x, y: OCTO.y, s: OCTO.s, eyes: 'sly', mouth: 'grin', look: [0, -0.8], squash: 1 + 0.02 * Math.sin(f * 0.2), hop: 0 };
  if (f >= T.BASKET_BOUNCE[0] && f < T.TIP[0]) { o.eyes = 'happy'; o.mouth = 'open'; }
  if (f >= T.TIP[0] - 4 && f < T.HAT_DROP[1]) { o.eyes = 'wide'; o.mouth = 'o'; o.look = [0, -1]; }
  if (f >= T.HAT_DROP[1] && f < T.HAT_DROP[1] + 20) { o.eyes = 'dizzy'; o.dizzyT = f * 0.6; o.mouth = 'o'; o.squash = 1 - 0.12 * Math.exp(-(f - T.HAT_DROP[1]) / 5); }
  if (f >= T.HAT_DROP[1] + 20 && f < 266) { o.eyes = 'happy'; o.mouth = 'grin'; }
  if (f >= 266 && f < 352) {
    const r = clamp(Math.floor((f - T.ROWS[0] + 6) / 16), 0, 3);
    o.eyes = 'open'; o.mouth = 'grin'; o.look = [((f >> 3) % 2 ? -0.6 : 0.6), -0.4 - 0.15 * r];
  }
  if (f >= 352 && f < T.PAUSE[0]) { o.eyes = 'happy'; o.mouth = 'open'; }
  if (f >= T.PAUSE[0] && f < 444) { o.eyes = 'open'; o.mouth = 'o'; o.look = [0.5, -1]; }
  if (f >= 444 && f < 532) {
    const t = measureTips(f);
    o.eyes = 'open'; o.mouth = 'grin';
    if (t.across) o.look = [(t.across[0] - 540) / 260, -1]; else if (t.down) o.look = [0.9, (t.down[1] - 1000) / 300];
    if (f >= T.OUTLINE) { o.eyes = 'wide'; o.mouth = 'open'; }
  }
  if (f >= 532 && f < 614) { o.eyes = 'happy'; o.mouth = 'open'; const k = T.COUNTS.filter((c) => f >= c).length - 1; o.hop = 10 * pulse(f, T.COUNTS[Math.max(0, k)], 12); }
  if (f >= 614 && f < T.DANCE[0]) { o.eyes = f >= 664 && f < 690 ? 'wide' : 'happy'; o.mouth = 'open'; }
  if (f >= T.DANCE[0]) { o.eyes = 'happy'; o.mouth = 'open'; o.hop = 12 * Math.abs(Math.sin((f - T.DANCE[0]) * 0.39)); o.squash = 1 + 0.06 * Math.sin((f - T.DANCE[0]) * 0.78); if (f >= T.WINK - 3) { o.eyes = 'wink'; o.mouth = 'grin'; } }
  o.y -= o.hop;
  return o;
}
function hatPos(f) {
  // the rim of the upside-down basket sits on the top of the head
  const o = { y: OCTO.y, hop: 0, squash: 1 };
  const st = f >= T.HAT_DROP[1] ? octoState(f) : { y: OCTO.y, squash: 1 };
  const top = st.y - (92 + 100) * OCTO.s * (st.squash ?? 1);
  void o;
  return [OCTO.x, top + 6];
}
function idlePose(i, f, o) {
  const root = armRoot(o, i);
  const left = i < 4, k = left ? 3 - i : i - 4;
  const a0 = left ? Math.PI - 0.02 - k * 0.12 : 0.02 + k * 0.12;
  const curl = (left ? 1 : -1) * 1.1; // tips curl upward, staying on the sand
  return idleArm(root, a0, 170 + 10 * (k % 2), curl, f * 0.12 + i * 1.3, 0.3);
}
function wavePose(i, f, o, amp = 1) {
  // excited "jazz hands": arms up beside the head
  const root = armRoot(o, i);
  const left = i < 4, k = left ? 3 - i : i - 4;
  // arms up beside the head, swinging in a travelling wave (the square dance)
  // out sideways from under the head, then curling up beside it ("jazz hands"), swinging in a travelling wave
  const sw = 0.28 * amp * Math.sin(f * 0.39 + i * 0.9);
  const a0 = left ? -Math.PI + 0.12 + k * 0.06 + sw : -0.12 - k * 0.06 + sw;
  return idleArm(root, a0, 190 + 12 * k, (left ? 1 : -1) * (0.62 + 0.1 * Math.sin(f * 0.39 + i)), f * 0.35 + i, 0.25 * amp);
}
function measureTips(f) {
  const t = {};
  if (f >= T.ACROSS[0] - 8 && f < T.DOWN[1] + 24) {
    const u = prog(T.ACROSS[0], T.ACROSS[1], f);
    t.across = [lerp(300, 760, u), 630];
    t.acrossW = prog(T.ACROSS[0] - 8, T.ACROSS[0], f) * (1 - prog(T.DOWN[1] + 12, T.DOWN[1] + 24, f));
  }
  if (f >= T.DOWN[0] - 8 && f < T.DOWN[1] + 24) {
    const u = prog(T.DOWN[0], T.DOWN[1], f);
    t.down = [790, lerp(660, 1080, u)];
    t.downW = prog(T.DOWN[0] - 8, T.DOWN[0], f) * (1 - prog(T.DOWN[1] + 12, T.DOWN[1] + 24, f));
  }
  return t;
}
function octoArms(f, o, oranges) {
  const arms = [];
  for (let i = 0; i < 8; i++) {
    let pts = f >= T.DANCE[0] ? wavePose(i, f, o, 1.2) : idlePose(i, f, o);
    const root = armRoot(o, i);
    const left = i < 4;
    // frame 0 – tip: four arms hold the baskets up, the others wave
    const hb = HOLD_ARMS.indexOf(i);
    if (f < T.TIP[1] + 8) {
      if (hb >= 0) {
        const [bx, by, rot] = basketMotion(hb, f);
        const handle = [bx + 110 * BSC * Math.sin(rot), by - 110 * BSC * Math.cos(rot)];
        const hold = reachArm(root, handle, (left ? -1 : 1) * 60);
        pts = f < T.TIP[1] ? hold : mixArm(hold, pts, prog(T.TIP[1], T.TIP[1] + 8, f));
      } else if (f < T.TIP[0]) pts = mixArm(wavePose(i, f, o), pts, 0.15);
    }
    // tidy: four arms per row reach the oranges, carry them to the row, let go
    for (let r = 0; r < 4; r++) {
      const ci = ROW_ARMS[r].indexOf(i);
      if (ci < 0) continue;
      const R0 = T.ROWS[r];
      if (f < R0 - 8 || f > R0 + T.CARRY + 10) continue;
      const oi = TARGET.findIndex((tg) => tg[0] === r && tg[1] === ci);
      const os = oranges[oi];
      const reach = reachArm(root, [os.x, os.y + 20], (left ? -1 : 1) * 70);
      const w = prog(R0 - 8, R0, f) * (1 - prog(R0 + T.CARRY, R0 + T.CARRY + 10, f));
      pts = mixArm(pts, reach, E.inOutSine(w));
    }
    // measuring arms: arm 1 along the top row, arm 6 down the right-hand column
    const mt = measureTips(f);
    if (i === 1 && mt.across) {
      const tip = mt.across;
      const a = bezArm(root, [200, 1150], [250, 600], tip); // up the left side, then along the top
      pts = mixArm(pts, a, E.inOutSine(mt.acrossW));
    }
    if (i === 6 && mt.down) {
      const tip = mt.down;
      const a = bezArm(root, [890, 1250], [790, tip[1] - 140], tip);
      pts = mixArm(pts, a, E.inOutSine(mt.downW));
    }
    // pause: one arm scratches under the basket hat
    if (i === 3 && f >= T.PAUSE[0] - 6 && f < 446) {
      const w = prog(T.PAUSE[0] - 6, T.PAUSE[0] + 4, f) * (1 - prog(436, 446, f));
      const sc = reachArm(root, [OCTO.x - 100 + 10 * Math.sin(f * 1.2), o.y - 235], -120);
      pts = mixArm(pts, sc, E.inOutSine(w));
    }
    // payoff: two arms present the square (top corners)
    if ((i === 0 || i === 7) && f >= 640 && f < T.DANCE[0] + 6) {
      const w = prog(640, 652, f) * (1 - prog(T.DANCE[0] - 6, T.DANCE[0] + 6, f));
      const corner = i === 0 ? [SQ.x0 - 10, SQ.y0 + 30] : [SQ.x1 + 10, SQ.y0 + 30];
      pts = mixArm(pts, bezArm(root, [i === 0 ? 150 : 930, 1250], [corner[0] + (i === 0 ? -40 : 40), corner[1] + 200], corner), E.inOutSine(w));
    }
    arms.push({ pts });
  }
  return arms;
}

function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  const lg = prog(T.HAT_DROP[1], T.HAT_DROP[1] + 8, f) * (1 - prog(270, 282, f));
  if (lg > 0) { st.eyes = 'happy'; st.mouth = 'open'; st.head = 6 * Math.sin(f * 0.9) * lg; st.hop = 6 * Math.abs(Math.sin(f * 0.45)) * lg; st.aR = lerp(14, 100, lg); st.fR = 80 * lg; }
  for (const g of [T.OUTLINE, 632]) { const c = pulse(f, g, 18); if (c > 0) { st.aL = lerp(st.aL, 155, c); st.aR = lerp(st.aR, 155, c); st.hop = 10 * c; st.eyes = 'happy'; st.mouth = 'open'; } }
  if (f >= T.DANCE[0] && f < 810) { st.eyes = 'happy'; st.mouth = 'open'; st.hop = 6 * Math.abs(Math.sin(f * 0.39)); st.aL = 60 + 40 * Math.sin(f * 0.39); st.aR = 60 - 40 * Math.sin(f * 0.39); }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage (everything mounted on the backdrop page)
const FACE = {
  0: [[['4 × 4 = ', 'ink'], ['?', 'purple']], 74],
  3: [[['4 × 4 = ', 'ink'], ['16', 'purple']], 74],
};
function cardState(f) {
  let face = 0, theta = 0;
  for (const [f0, fi] of T.CARD_FLIPS) {
    const u = prog(f0, f0 + 14, f);
    if (u >= 0.5) face = fi;
    if (u > 0 && u < 1) theta = -(Math.PI / 2) * Math.sin(Math.PI * u);
  }
  return { face, theta };
}
function drawCard(ctx, f) {
  const cs = cardState(f);
  if (Math.cos(cs.theta) <= 0.03) return;
  const [faceParts, size] = FACE[cs.face];
  const tex = cardTex(`card${cs.face}`, 560, 100, (x) => eqText(x, faceParts.map(([t, col]) => [t, C[col]]), 280, 53, size), cs.face >= 3 ? '#FFF6C9' : C.cream);
  const warm = 0.32 * (pulse(f, 631, 22) + pulse(f, T.SQUARE_PULSE[0], 22));
  drawPlane(ctx, tex, { x: CARD_CX - 280, w: 560, hingeY: SLOT_Y, h: 100, theta: cs.theta, dir: -1, shadow: 0.7, warm });
  scoreLine(ctx, CARD_CX - 260, SLOT_Y + 2, CARD_CX + 260, SLOT_Y + 2, 'rgba(42,22,80,0.35)', 2);
}
function drawSquareOutline(ctx, f) {
  if (f < T.OUTLINE) return;
  const s = E.outBack(prog(T.OUTLINE, T.OUTLINE + 12, f));
  const glow = pulse(f, T.SQUARE_PULSE[0], 24) + pulse(f, T.SQUARE_PULSE[1], 24) + pulse(f, T.SQUARE_PULSE[2], 24) + pulse(f, T.OUTLINE, 18);
  const cx = (SQ.x0 + SQ.x1) / 2, cy = (SQ.y0 + SQ.y1) / 2, hw = ((SQ.x1 - SQ.x0) / 2) * (0.85 + 0.15 * s), hh = ((SQ.y1 - SQ.y0) / 2) * (0.85 + 0.15 * s);
  ctx.save();
  ctx.globalAlpha = clamp(s * 1.2);
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(cx - hw, cy - hh, 2 * hw, 2 * hh, 26);
  ctx.lineWidth = 14; ctx.strokeStyle = `rgba(255,253,248,${0.8 + 0.2 * Math.min(1, glow)})`; ctx.stroke();
  ctx.setLineDash([26, 16]); ctx.lineDashOffset = -f * 1.5;
  ctx.lineWidth = 7; ctx.strokeStyle = glow > 0.3 ? C.purple : C.violet; ctx.stroke();
  ctx.setLineDash([]);
  // brass pins at the corners
  for (const [px, py] of [[cx - hw, cy - hh], [cx + hw, cy - hh], [cx + hw, cy + hh], [cx - hw, cy + hh]]) splitPin(ctx, px, py, 7);
  ctx.restore();
}
function drawStage(ctx, f) {
  ctx.drawImage(blanketArt(), BLANKET.x - 10, BLANKET.y - 10);
  const oranges = [];
  for (let i = 0; i < 16; i++) oranges.push(orangeState(i, f));
  const o = octoState(f);
  o.arms = octoArms(f, o, oranges);
  drawOctopusArms(ctx, o);
  drawOctopusBody(ctx, o);
  // the basket hat (basket 1 after it lands)
  const [hx, hy, hrot, landed] = f >= T.TIP[1] ? basketMotion(1, f) : [0, 0, 0, false];
  if (landed) {
    const hp = hatPos(f), wob = 0.08 * Math.sin(f * 0.5) * (f >= T.DANCE[0] ? 2 : 0.5) + 0.25 * Math.exp(-(f - T.HAT_DROP[1]) / 6) * Math.sin((f - T.HAT_DROP[1]) * 1.5);
    drawBasket(ctx, hp[0], hp[1] - 4, Math.PI + wob, null, 0.95, true);
  }
  // baskets in the air / held (with the oranges still inside)
  for (let b = 0; b < 4; b++) {
    if (b === 1 && landed) continue;
    const [bx, by, rot, , hu] = basketMotion(b, f);
    if (bx < -300 || bx > 1400) continue;
    if (b === 1 && hu > 0.75) { drawBasket(ctx, bx, by, rot, null, 0.95, true); continue; }
    const inside = [0, 1, 2, 3].map((j) => (oranges[b * 4 + j].inBasket ? { glow: 0.8 * pulse(f, T.BASKET_BOUNCE[0] + b * T.BASKET_BOUNCE[1], 14) } : null));
    drawBasket(ctx, bx, by, rot, inside, BSC);
  }
  void hx; void hy; void hrot;
  // loose oranges: resting first, moving ones on top
  const order = [...oranges.keys()].filter((i) => !oranges[i].inBasket).sort((a, b) => (oranges[a].carry ? 1 : 0) - (oranges[b].carry ? 1 : 0));
  for (const i of order) { const s = oranges[i]; drawOrange(ctx, s.x, s.y, s.rot, 1, s.glow, s.ring || 0); }
  drawSquareOutline(ctx, f);
  drawCard(ctx, f);
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
  // the upright backdrop page: a paper seaside — sky, sun, clouds, layered waves, sand (the blanket sits on the sand)
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W, BOOK.bot + 4), x = c.getContext('2d');
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, 700);
  g.addColorStop(0, '#D9F3FF'); g.addColorStop(1, '#F2FBFF');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, 260);
  // paper sun (left) and clouds
  withShadow(x, 6, 0.18);
  piece(x, cutCircle(150, 540, 52, 52, 905, 1.0, 40), C.yellow, { margin: 3, grainA: 0.05 });
  for (const [cx, cy, s] of [[880, 600, 1], [300, 640, 0.7]]) {
    piece(x, cutPoly(roundRectPts(cx - 70 * s, cy - 22 * s, 140 * s, 44 * s, 22 * s), 906 + cx, 0.8, 10), '#FFFFFF', { margin: 0, grainA: 0.03 });
    piece(x, cutCircle(cx - 10 * s, cy - 24 * s, 30 * s, 26 * s, 907 + cx, 0.6, 24), '#FFFFFF', { margin: 0, grainA: 0.03 });
  }
  noShadow(x);
  // layered paper waves (sea band)
  const waves = [[668, '#9FE7F5'], [690, '#5ED3EA'], [712, '#36BEDF']];
  waves.forEach(([wy, col], k) => {
    x.save(); withShadow(x, 4, 0.15);
    x.beginPath(); x.moveTo(BOOK.x, wy + 40);
    for (let px = BOOK.x; px <= BOOK.x + BOOK.w + 40; px += 40) x.quadraticCurveTo(px + 20, wy - 14 + k * 3, px + 40, wy);
    x.lineTo(BOOK.x + BOOK.w, wy + 60); x.lineTo(BOOK.x, wy + 60); x.closePath(); x.fillStyle = col; x.fill();
    x.restore();
  });
  // sand
  const sg = x.createLinearGradient(0, 730, 0, BOOK.bot);
  sg.addColorStop(0, '#F8E3B4'); sg.addColorStop(1, '#EFCF92');
  x.save(); withShadow(x, 6, 0.15);
  x.beginPath(); x.moveTo(BOOK.x, 740); for (let px = BOOK.x; px <= BOOK.x + BOOK.w + 60; px += 60) x.quadraticCurveTo(px + 30, 728, px + 60, 740);
  x.lineTo(BOOK.x + BOOK.w, BOOK.bot); x.lineTo(BOOK.x, BOOK.bot); x.closePath(); x.fillStyle = sg; x.fill();
  x.restore();
  const r = rng(77);
  for (let k = 0; k < 160; k++) { x.fillStyle = 'rgba(180,130,60,0.18)'; x.beginPath(); x.arc(BOOK.x + r() * BOOK.w, 760 + r() * (BOOK.bot - 760), 2 + r() * 2, 0, Math.PI * 2); x.fill(); }
  // two paper shells (decor; nothing round and orange)
  for (const [sx, sy, rot] of [[80, 1180, -0.3], [1000, 1290, 0.4]]) {
    x.save(); x.translate(sx, sy); x.rotate(rot); withShadow(x, 3, 0.2);
    x.beginPath(); x.moveTo(0, 18); x.lineTo(-20, -6); x.quadraticCurveTo(0, -26, 20, -6); x.closePath(); x.fillStyle = C.lilac; x.fill(); noShadow(x);
    x.strokeStyle = 'rgba(57,12,214,0.4)'; x.lineWidth = 1.5; for (const a of [-0.6, 0, 0.6]) { x.beginPath(); x.moveTo(0, 16); x.lineTo(Math.sin(a) * 20, -12); x.stroke(); }
    x.restore();
  }
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



// ------------------------------------------------------------------ frame-0 headline (hook words, folds away)
function drawHeadline(ctx, f) {
  if (f >= T.HEADLINE_OUT[1]) return;
  const th = (Math.PI / 2) * E.inCubic(prog(T.HEADLINE_OUT[0], T.HEADLINE_OUT[1], f));
  const tex = texCanvas('headline', 820, 196);
  const x = tex.getContext('2d');
  piece(x, cutPoly(roundRectPts(6, 6, 808, 184, 32), 1501, 1.4, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
  x.fillStyle = C.violet; x.fillRect(26, 20, 8, 156);
  const line = (t, y, col) => { x.save(); x.font = `700 84px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#FFFFFF'; x.strokeText(t, 420, y); x.fillStyle = col; x.fillText(t, 420, y); x.restore(); };
  line('A SQUARE', 58, C.deep);
  line('OF ORANGES?', 140, C.purple);
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
