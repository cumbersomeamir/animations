// Simplified lockstitch cutaway (S2-S4). Side cross-section: needle from above, two cloth plies,
// needle plate, rotary hook carrying the needle-thread loop around the bobbin case, take-up lever.
// Geometry is deliberately simplified (labelled on screen) but topologically faithful:
// needle thread loop -> carried around the bobbin case -> pulled up -> interlocks with bobbin
// thread at mid-thickness of the material.
import { createCanvas } from '@napi-rs/canvas';
import { P, paintFill, rrect, thread, star4, makeWeave, makeBrushLayer, softShadow } from './paint.mjs';
import { rgba, lerp, clamp, smooth, invLerp, TAU } from './core.mjs';

export const M = {
  C: [540, 1185], Rcase: 150, Rring: 205, Rloop: 178, Rbob: 96,
  clothTop: 640, clothMid: 685, clothBot: 730, plateBot: 762,
  holeX: 540, stitch: 140, L: [540, 686],
  leverPivot: [110, 432], leverLen: 190, casingY: [286, 346],
  needleTDC: 452, needleBDC: 1050,
};
const X_EXIT_ANG = (35 * Math.PI) / 180;
export const bobbinExit = () => [M.C[0] + M.Rcase * Math.sin(X_EXIT_ANG), M.C[1] - M.Rcase * Math.cos(X_EXIT_ANG)];
const onCircle = (c, r, a) => [c[0] + r * Math.sin(a), c[1] - r * Math.cos(a)];

let cache = null;
export function initMechanism(grain) {
  const bg = createCanvas(1080, 1920);
  const c = bg.getContext('2d');
  // above-cloth air
  const g = c.createLinearGradient(0, 0, 0, 640);
  g.addColorStop(0, P.g900); g.addColorStop(1, P.g700);
  c.fillStyle = g; c.fillRect(0, 0, 1080, 650);
  const lg = c.createRadialGradient(140, 160, 10, 140, 160, 700);
  lg.addColorStop(0, rgba(P.goldLight, 0.22)); lg.addColorStop(1, rgba(P.gold, 0));
  c.fillStyle = lg; c.fillRect(0, 0, 1080, 650);
  // machine cavity
  const cg = c.createRadialGradient(540, 1180, 60, 540, 1180, 640);
  cg.addColorStop(0, '#0B3A30'); cg.addColorStop(1, P.g950);
  c.fillStyle = cg; c.fillRect(0, 760, 1080, 1160);
  c.drawImage(makeBrushLayer(1080, 1920, 77, [P.g600, P.g950, P.g800], 1500, [40, 180], [8, 30], [0.03, 0.08]), 0, 0);
  // cut faces of the machine bed (cream, hatched) framing the cavity
  const hatch = (x, y, w, h) => {
    c.save();
    c.fillStyle = P.cream2; c.fillRect(x, y, w, h);
    c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = rgba(P.cream4, 0.9); c.lineWidth = 3;
    for (let k = -h; k < w + h; k += 18) { c.beginPath(); c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); c.stroke(); }
    c.restore();
    c.strokeStyle = P.ink; c.lineWidth = 5; c.strokeRect(x, y, w, h);
  };
  hatch(-10, 762, 250, 46); hatch(840, 762, 250, 46);
  hatch(-10, 808, 86, 640); hatch(1004, 808, 86, 640);
  hatch(-10, 1448, 1100, 30);
  // below the casing: table / dark
  c.fillStyle = P.g900; c.fillRect(0, 1478, 1080, 442);
  c.drawImage(makeBrushLayer(1080, 442, 91, ['#1C6B55', P.g950], 400, [200, 500], [3, 8], [0.08, 0.18], 0.02), 0, 1478);
  cache = { bg, weave: makeWeave(64, P.cloth, 9), weave2: makeWeave(64, P.clothDark, 12), grain };
}

// ---------- needle-thread loop geometry ----------
function resampleArc(c, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(onCircle(c, r, lerp(a0, a1, i / n)));
  return pts;
}

// returns {front:[pts], back:[pts]|null}
function loopGeometry(s, ya) {
  const L = [533, ya], R = [547, ya];
  if (s.loop === 'form') {
    const d = s.loopForm;
    return { front: [L, [516 - 50 * d, ya - 4 - 10 * d], [494 - 74 * d, ya + 26 * d + 6], [510 - 40 * d, ya + 62 * d + 10], [536 - 6 * d, ya + 34 * d + 10], [541, ya + 8], R], back: null, tip: [494 - 74 * d, ya + 26 * d + 6] };
  }
  if (s.loop === 'carry') {
    const th = s.theta;
    const top = M.C[1] - M.Rloop;
    const B = onCircle(M.C, M.Rloop + 10, th);
    const arc = resampleArc(M.C, M.Rloop, 0.08, Math.max(0.09, th - 0.05), Math.max(2, Math.ceil(th * 10)));
    const front = [R, [552, lerp(ya, top, 0.6)], ...arc, B];
    // back limb: from L to B (behind the case)
    const back = [L, [526, lerp(ya, top, 0.6)], [lerp(526, B[0], 0.5), lerp(top, B[1], 0.5) - (th < Math.PI ? 0 : 30)], B];
    return { front, back, B };
  }
  if (s.loop === 'lasso') {
    const u = smooth(s.lassoU);
    const cc = [lerp(M.C[0], M.L[0], u), lerp(M.C[1], M.L[1] + 6, u)];
    const r = lerp(M.Rloop, 15, u);
    const ring = resampleArc(cc, r, -0.12 * (1 - u) + 0.05, TAU - 0.05 - 0.12 * (1 - u), 48);
    const front = [[526, ya], [527, Math.min(ya + 10, cc[1] - r)], ...ring.reverse(), [553, Math.min(ya + 10, cc[1] - r)], [554, ya]];
    return { front, back: null };
  }
  if (s.loop === 'locked') {
    return { front: lockPaths(M.holeX - s.shift).gold, back: null, locked: true };
  }
  // plain pass through the eye; if the eye is above the cloth, thread just crosses the hole on top
  if (ya <= M.clothTop + 1) return { front: [[526, M.clothTop - 3], [540, M.clothTop - 2], [554, M.clothTop - 2]], back: null };
  return { front: [L, [540, ya + 7], R], back: null };
}

export function lockPaths(x) {
  const m = M.clothMid, top = M.clothTop, bot = M.clothBot;
  const gold = [[x - 15, top - 3], [x - 14, m - 6], [x - 13, m + 10], [x - 7, m + 19], [x, m + 21], [x + 7, m + 19], [x + 13, m + 10], [x + 14, m - 6], [x + 15, top - 3]];
  const cream = [[x - 34, bot - 5], [x - 12, bot - 9], [x - 6, m + 14], [x - 5, m - 6], [x - 3, m - 14], [x, m - 16], [x + 3, m - 14], [x + 5, m - 6], [x + 6, m + 14], [x + 12, bot - 9], [x + 34, bot - 5]];
  const creamOver = [[x + 5, m + 8], [x + 6, m + 16], [x + 7, m + 28]];
  return { gold, cream, creamOver };
}
export function lockAt(ctx, x, w = 8) {
  // bobbin thread ∩ passes through the needle-thread U at mid-thickness (interlaced)
  const L = lockPaths(x);
  thread(ctx, L.cream, { color: P.bobbin, edge: P.ink, w, twist: false });
  thread(ctx, L.gold, { color: P.gold, edge: P.ink, w, twist: false });
  thread(ctx, L.creamOver, { color: P.bobbin, edge: P.ink, w, twist: false, smooth: false });
}

function clothAndStitches(ctx, s) {
  const { weave, weave2 } = cache;
  const sh = s.shift;
  ctx.save();
  // plies
  ctx.fillStyle = P.cloth; ctx.fillRect(-20, M.clothTop, 1120, M.clothMid - M.clothTop);
  ctx.fillStyle = P.clothDark; ctx.fillRect(-20, M.clothMid, 1120, M.clothBot - M.clothMid);
  ctx.save(); ctx.translate(-sh, 0);
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = ctx.createPattern(weave, 'repeat'); ctx.fillRect(-20 + sh, M.clothTop, 1120, M.clothMid - M.clothTop);
  ctx.fillStyle = ctx.createPattern(weave2, 'repeat'); ctx.fillRect(-20 + sh, M.clothMid, 1120, M.clothBot - M.clothMid);
  ctx.globalAlpha = 1;
  ctx.restore();
  // fibre fuzz on edges
  ctx.strokeStyle = rgba(P.g300, 0.5); ctx.lineWidth = 2;
  for (let x = -20 - (sh % 14); x < 1100; x += 14) {
    ctx.beginPath(); ctx.moveTo(x, M.clothTop); ctx.lineTo(x + 4, M.clothTop - 5); ctx.stroke();
  }
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-20, M.clothTop); ctx.lineTo(1100, M.clothTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-20, M.clothBot); ctx.lineTo(1100, M.clothBot); ctx.stroke();
  ctx.strokeStyle = rgba(P.ink, 0.55); ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-20, M.clothMid); ctx.lineTo(1100, M.clothMid); ctx.stroke();
  ctx.restore();
}

function needleShape(ctx, tipY) {
  ctx.save();
  ctx.beginPath(); ctx.rect(-50, M.casingY[1] - 6, 1200, 2400); ctx.clip();
  const r = needleShapeInner(ctx, tipY);
  ctx.restore();
  return r;
}
function needleShapeInner(ctx, tipY) {
  const x = M.holeX;
  const clampY = tipY - 330;
  // needle bar + clamp
  ctx.fillStyle = P.metal; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.fillRect(x - 22, clampY - 600, 44, 600); ctx.strokeRect(x - 22, clampY - 600, 44, 600);
  ctx.fillStyle = rgba('#FFFFFF', 0.35); ctx.fillRect(x - 16, clampY - 600, 8, 600);
  paintFill(ctx, (c) => { rrect(c, x - 34, clampY - 40, 68, 52, 8); }, { base: P.metal, bounds: [x - 34, clampY - 40, 68, 52], light: '#FFFFFF', dark: P.metalDark, stroke: P.ink, strokeW: 4 });
  // shank + blade
  ctx.beginPath();
  ctx.moveTo(x - 13, clampY + 12); ctx.lineTo(x + 13, clampY + 12);
  ctx.lineTo(x + 13, clampY + 70); ctx.lineTo(x + 8, clampY + 96);
  ctx.lineTo(x + 8, tipY - 64); ctx.quadraticCurveTo(x + 7, tipY - 18, x, tipY);
  ctx.quadraticCurveTo(x - 7, tipY - 18, x - 8, tipY - 64);
  ctx.lineTo(x - 8, clampY + 96); ctx.lineTo(x - 13, clampY + 70); ctx.closePath();
  const ng = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
  ng.addColorStop(0, P.metalDark); ng.addColorStop(0.35, P.metalLight); ng.addColorStop(1, P.metal);
  ctx.fillStyle = ng; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();
  // eye
  ctx.fillStyle = P.g950; rrect(ctx, x - 3, tipY - 48, 6, 24, 3); ctx.fill();
  return { eye: [x, tipY - 36], guide: [x + 16, clampY - 70] };
}

function hookAndBobbin(ctx, s, backLoop) {
  const { C, Rcase, Rring, Rbob } = M;
  const th = s.theta;
  // hook body (dark basket)
  ctx.fillStyle = '#0D2A24'; ctx.beginPath(); ctx.arc(C[0], C[1], Rring + 14, 0, TAU); ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.stroke();
  if (backLoop) thread(ctx, backLoop, { color: P.goldDeep, edge: rgba(P.ink, 0.8), w: 7, twist: false, alpha: 0.85, hi: 'rgba(255,255,255,0.1)' });
  // hook ring
  ctx.lineWidth = 30; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(C[0], C[1], Rring, 0, TAU); ctx.stroke();
  ctx.lineWidth = 24; ctx.strokeStyle = P.metal; ctx.beginPath(); ctx.arc(C[0], C[1], Rring, 0, TAU); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFFFFF', 0.45); ctx.beginPath(); ctx.arc(C[0], C[1], Rring - 6, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  // rotating grooves show spin direction
  ctx.strokeStyle = P.metalDark; ctx.lineWidth = 4;
  for (let k = 0; k < 10; k++) {
    const a = th + (k * TAU) / 10 + 0.3;
    const p1 = onCircle(C, Rring - 10, a), p2 = onCircle(C, Rring + 10, a);
    ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
  }
  // bobbin case
  paintFill(ctx, (c) => { c.beginPath(); c.arc(C[0], C[1], Rcase, 0, TAU); }, { base: P.metal, bounds: [C[0] - Rcase, C[1] - Rcase, Rcase * 2, Rcase * 2], light: '#FFFFFF', lightA: 0.6, dark: P.metalDeep, darkA: 0.6, tex: cache.grain, texA: 0.25, stroke: P.ink, strokeW: 5 });
  ctx.strokeStyle = rgba(P.metalDeep, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(C[0], C[1], Rcase - 18, 0, TAU); ctx.stroke();
  // tension spring on case where bobbin thread exits
  const X = bobbinExit();
  ctx.save(); ctx.translate(X[0], X[1]); ctx.rotate(X_EXIT_ANG);
  ctx.fillStyle = P.metalDark; ctx.strokeStyle = P.ink; ctx.lineWidth = 3; rrect(ctx, -34, -2, 30, 16, 5); ctx.fill(); ctx.stroke();
  ctx.restore();
  // bobbin (cream thread wound)
  paintFill(ctx, (c) => { c.beginPath(); c.arc(C[0], C[1], Rbob, 0, TAU); }, { base: P.bobbin, bounds: [C[0] - Rbob, C[1] - Rbob, Rbob * 2, Rbob * 2], light: '#FFFFFF', dark: P.bobbinShade, darkA: 0.8, stroke: P.ink, strokeW: 4 });
  ctx.strokeStyle = rgba(P.cream4, 0.85); ctx.lineWidth = 2;
  const bspin = s.bobbinSpin ?? 0;
  for (let r = 34; r < Rbob - 4; r += 7) { ctx.beginPath(); ctx.arc(C[0], C[1], r, bspin + r * 0.05, bspin + r * 0.05 + 5.4); ctx.stroke(); }
  ctx.fillStyle = P.metalLight; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.arc(C[0], C[1], 26, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.g950; ctx.beginPath(); ctx.arc(C[0], C[1], 9, 0, TAU); ctx.fill();
}

function beak(ctx, th) {
  // pointed spur on the hook ring at angle th, pointing in direction of rotation (clockwise)
  const { C, Rring } = M;
  const p = onCircle(C, Rring - 4, th);
  ctx.save();
  ctx.translate(p[0], p[1]); ctx.rotate(th);
  // local: x = tangent (clockwise), y = radial outward is -y
  ctx.beginPath();
  ctx.moveTo(-60, -14); ctx.quadraticCurveTo(-10, -20, 52, 4); ctx.quadraticCurveTo(0, 10, -60, 16); ctx.closePath();
  const g = ctx.createLinearGradient(-60, 0, 52, 0); g.addColorStop(0, P.metal); g.addColorStop(1, P.metalLight);
  ctx.fillStyle = g; ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.fill(); ctx.stroke();
  ctx.restore();
}

function lever(ctx, a) {
  const pv = M.leverPivot;
  const e = [pv[0] + Math.cos(a) * M.leverLen, pv[1] + Math.sin(a) * M.leverLen];
  // head casing (cream cut face)
  paintFill(ctx, (c) => { rrect(c, -40, M.casingY[1] - 24, 150, pv[1] - M.casingY[1] + 90, 20); }, { base: P.cream2, bounds: [-40, M.casingY[1] - 24, 150, pv[1] - M.casingY[1] + 90], light: P.cream, dark: P.cream4, darkA: 0.6, tex: cache.grain, texA: 0.3, stroke: P.ink, strokeW: 5 });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pv[0], pv[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
  ctx.strokeStyle = P.metal; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(pv[0], pv[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
  ctx.fillStyle = P.metal; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(pv[0], pv[1], 22, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(e[0], e[1], 15, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.g950; ctx.beginPath(); ctx.arc(e[0], e[1], 6, 0, TAU); ctx.fill();
  return e;
}

export function drawMechanismWorld(ctx, s) {
  const { bg } = cache;
  ctx.drawImage(bg, 0, 0);
  const tipY = s.tipY;
  const eyeY = tipY - 36;
  const ya = clamp(eyeY, M.clothTop, 1200);
  const geo = loopGeometry(s, ya);
  hookAndBobbin(ctx, s, geo.back);
  // needle plate (fixed)
  ctx.fillStyle = P.metal; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.fillRect(-20, M.clothBot, 538, M.plateBot - M.clothBot); ctx.strokeRect(-20, M.clothBot, 538, M.plateBot - M.clothBot);
  ctx.fillRect(562, M.clothBot, 540, M.plateBot - M.clothBot); ctx.strokeRect(562, M.clothBot, 540, M.plateBot - M.clothBot);
  ctx.fillStyle = rgba('#FFFFFF', 0.4); ctx.fillRect(-20, M.clothBot + 4, 538, 5); ctx.fillRect(562, M.clothBot + 4, 540, 5);
  // feed dog teeth peeking (fixed)
  ctx.fillStyle = P.metalDark;
  for (const fx of [420, 470, 610, 660]) { ctx.beginPath(); ctx.moveTo(fx - 14, M.plateBot); ctx.lineTo(fx, M.clothBot + 8); ctx.lineTo(fx + 14, M.plateBot); ctx.fill(); }

  clothAndStitches(ctx, s);
  // ---- bobbin thread (cream) ----
  const X = bobbinExit();
  const sh = s.shift;
  const lockedNow = s.loop === 'locked';
  let V = [548, M.clothBot - 5];
  if (s.loop === 'lasso') V = [lerp(548, 541, smooth(invLerp(0.72, 1, s.lassoU))), lerp(M.clothBot - 5, M.clothMid - 14, smooth(invLerp(0.72, 1, s.lassoU)))];
  const prevXs = [];
  for (let k = 1; k <= 6; k++) prevXs.push(M.holeX - k * M.stitch - sh);
  // bottom run (cream) from far left to current
  const bottomRun = [[-60, M.clothBot + 3]];
  prevXs.slice().reverse().forEach(() => {});
  if (lockedNow) {
    thread(ctx, [[-60, M.clothBot - 5], [M.holeX - sh - 34, M.clothBot - 5]], { color: P.bobbin, edge: P.ink, w: 8, twist: false, smooth: false });
    // from new lock down to plate hole then to bobbin
    thread(ctx, [[M.holeX - sh + 34, M.clothBot - 5], [M.holeX - sh + 44, M.clothBot - 2], [548, M.plateBot + 4], [lerp(548, X[0], 0.5), lerp(M.plateBot, X[1], 0.5)], X], { color: P.bobbin, edge: P.ink, w: 8, flow: s.flowB ?? 0 });
  } else {
    thread(ctx, [[-60, M.clothBot - 5], [V[0] - 40, M.clothBot - 5], [V[0] - 12, M.clothBot - 7], V, [552, M.clothBot - 2], [548, M.plateBot + 4], [lerp(548, X[0], 0.5), lerp(M.plateBot, X[1], 0.5)], X], { color: P.bobbin, edge: P.ink, w: 8, flow: s.flowB ?? 0 });
  }
  // gold top run (previous stitches) from far left to hole
  const goldEndX = lockedNow ? M.holeX - sh - 15 : 526;
  thread(ctx, [[-60, M.clothTop - 3], [goldEndX, M.clothTop - 3]], { color: P.gold, edge: P.ink, w: 8, twist: false, smooth: false });
  // gold runs between previous locks are on the top surface; cream runs on the bottom (drawn above)
  for (const px of prevXs) if (px > -40 && px < 1100) lockAt(ctx, px);
  if (lockedNow) lockAt(ctx, M.holeX - sh);

  // presser foot (fixed)
  paintFill(ctx, (c) => { c.beginPath(); c.moveTo(452, M.clothTop - 2); c.lineTo(440, M.clothTop - 16); c.quadraticCurveTo(446, M.clothTop - 30, 470, M.clothTop - 30); c.lineTo(626, M.clothTop - 30); c.lineTo(630, M.clothTop - 2); c.closePath(); }, { base: P.metal, bounds: [440, 600, 190, 40], light: '#FFFFFF', dark: P.metalDark, stroke: P.ink, strokeW: 4 });
  ctx.fillStyle = P.g950; ctx.fillRect(530, M.clothTop - 30, 20, 28);
  ctx.fillStyle = P.metal; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.fillRect(596, M.casingY[1] - 4, 26, M.clothTop - 26 - M.casingY[1]); ctx.strokeRect(596, M.casingY[1] - 4, 26, M.clothTop - 26 - M.casingY[1]);

  // needle
  const nd = needleShape(ctx, tipY);
  // machine head casing (cut face) hides needle bar top
  const [cy0, cy1] = M.casingY;
  ctx.save();
  ctx.fillStyle = P.cream2; ctx.beginPath(); rrect(ctx, -30, cy0, 760, cy1 - cy0, 22); ctx.fill();
  ctx.clip();
  ctx.strokeStyle = rgba(P.cream4, 0.9); ctx.lineWidth = 3;
  for (let k = -80; k < 800; k += 18) { ctx.beginPath(); ctx.moveTo(k, cy1); ctx.lineTo(k + 60, cy0); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.beginPath(); rrect(ctx, -30, cy0, 760, cy1 - cy0, 22); ctx.stroke();
  // fixed thread guide eyelet under casing
  const fg = [470, cy1 + 10];
  ctx.fillStyle = P.metal; ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fg[0], fg[1], 9, 0, TAU); ctx.fill(); ctx.stroke();
  // lever + supply thread
  const le = lever(ctx, s.leverA);
  const g2 = [548, Math.max(cy1 + 12, nd.guide[1] + 70)];
  const supply = [[-40, cy1 + 30], le, fg, g2];
  if (eyeY > M.clothTop) supply.push([548, eyeY - 6], [544, eyeY]);
  else supply.push([548, eyeY - 6], [544, eyeY], [550, eyeY + 10], [554, M.clothTop - 2]);
  thread(ctx, supply, { color: P.gold, edge: P.ink, w: 8, flow: s.flowG ?? 0 });
  // stitch limb from current hole along needle down to anchor when eye below cloth
  if (!lockedNow && ya > M.clothTop) thread(ctx, [[526, M.clothTop - 3], [530, M.clothTop + 30], [533, ya]], { color: P.gold, edge: P.ink, w: 8, flow: s.flowG ?? 0, smooth: false });
  if (!lockedNow && ya > M.clothTop && eyeY > M.clothTop) thread(ctx, [[547, ya - 30], [547, ya]], { color: P.gold, edge: P.ink, w: 8, flow: s.flowG ?? 0, smooth: false });
  if (!lockedNow && ya <= M.clothTop + 1) {
    thread(ctx, [[526, M.clothTop - 3], [526, M.clothTop + 6]], { color: P.gold, edge: P.ink, w: 8, twist: false, smooth: false });
  }
  // loop front
  if (!lockedNow) thread(ctx, geo.front, { color: P.gold, edge: P.ink, w: 8, flow: s.flowG ?? 0 });
  // beak in front of the loop
  beak(ctx, s.theta);
  return { eye: nd.eye, lever: le, B: geo.B, ya };
}

// magnifier lens showing the lock enlarged
export function drawLens(ctx, s, center, r, handleTo, alpha, mag = 2.3) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  // handle
  const ang = Math.atan2(handleTo[1] - center[1], handleTo[0] - center[0]);
  const hs = [center[0] + Math.cos(ang) * r, center[1] + Math.sin(ang) * r];
  ctx.strokeStyle = P.ink; ctx.lineWidth = 26; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hs[0], hs[1]); ctx.lineTo(handleTo[0], handleTo[1]); ctx.stroke();
  ctx.strokeStyle = P.goldDeep; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(hs[0], hs[1]); ctx.lineTo(handleTo[0], handleTo[1]); ctx.stroke();
  softShadow(ctx, center[0] + 10, center[1] + 14, r + 20, r + 20, 0.4);
  ctx.save();
  ctx.beginPath(); ctx.arc(center[0], center[1], r, 0, TAU); ctx.clip();
  ctx.fillStyle = P.g900; ctx.fillRect(center[0] - r, center[1] - r, 2 * r, 2 * r);
  const L = [M.holeX - s.shift, M.L[1]];
  ctx.translate(center[0], center[1]); ctx.scale(mag, mag); ctx.translate(-L[0], -L[1]);
  clothAndStitches(ctx, s);
  thread(ctx, [[L[0] - 120, M.clothTop - 3], [L[0] - 15, M.clothTop - 3]], { color: P.gold, edge: P.ink, w: 8, twist: false, smooth: false });
  thread(ctx, [[L[0] - 120, M.clothBot - 5], [L[0] - 34, M.clothBot - 5]], { color: P.bobbin, edge: P.ink, w: 8, twist: false, smooth: false });
  thread(ctx, [[L[0] + 34, M.clothBot - 5], [L[0] + 44, M.clothBot - 2], [L[0] + 52, M.clothBot + 40]], { color: P.bobbin, edge: P.ink, w: 8, twist: false });
  thread(ctx, [[L[0] + 15, M.clothTop - 3], [L[0] + 15, M.clothTop - 60]], { color: P.gold, edge: P.ink, w: 8, twist: false });
  lockAt(ctx, L[0]);
  // sparkle at lock
  ctx.fillStyle = P.goldLight; star4(ctx, L[0] + 26, L[1] - 18, 9 * (s.sparkle ?? 1)); ctx.fill();
  ctx.restore();
  // rim
  ctx.lineWidth = 16; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(center[0], center[1], r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 10; ctx.strokeStyle = P.gold; ctx.beginPath(); ctx.arc(center[0], center[1], r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = rgba('#FFFFFF', 0.35); ctx.beginPath(); ctx.arc(center[0], center[1], r - 14, 3.6, 4.6); ctx.stroke();
  ctx.restore();
}
