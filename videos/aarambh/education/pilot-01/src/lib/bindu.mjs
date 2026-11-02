// Bindu — original recurring performer for Aarambh education lessons.
// Reusable 2D rig: drawBindu(ctx, pose). Local units: feet at (0,0), height ~410 at s=1.
// Silhouette keys: round head, hair bun pierced by a gold pencil, gold 4-point star bindi,
// deep-green kurta-apron with cream piping, cream tape-measure sash, mitten hands, gold juttis.
import { P, paintFill, star4, softShadow } from './paint.mjs';
import { ik2, rgba, clamp, lerp } from './core.mjs';

export const RIG = {
  hip: [0, -66], shoulderB: [-40, -196], shoulderF: [40, -196],
  upper: 64, fore: 60, handR: 18,
  hipB: [-22, -62], hipF: [22, -62], thigh: 36, shin: 34,
  headC: [0, -292], headRx: 86, headRy: 80,
};

export const DEFAULT_POSE = {
  x: 0, y: 0, s: 1, flip: 1, lean: 0, squash: 1, alpha: 1,
  headTilt: 0, headTurn: 0, bodyBob: 0,
  handB: [-62, -110], handF: [62, -110], bendB: -1, bendF: 1,
  footB: [-24, 0], footF: [24, 0],
  eyes: 'open', pupil: [0, 0], browB: 0, browF: 0, mouth: 'smile', mouthOpen: 0,
  blink: 0, shadow: true, propF: null, propB: null, sweat: 0, pencilAngle: 0,
};

// world -> local (inverse of transform used in drawBindu, ignoring squash)
export function toLocal(pose, wp) {
  const p = { ...DEFAULT_POSE, ...pose };
  let x = (wp[0] - p.x) / p.s, y = (wp[1] - p.y) / p.s;
  x *= p.flip;
  const c = Math.cos(-p.lean), s = Math.sin(-p.lean);
  // lean rotation is about the feet; undo it
  const rx = x * c - y * s, ry = x * s + y * c;
  return [rx, ry];
}

function limb(ctx, a, b, c, w, colA, colB, ink) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = ink; ctx.lineWidth = w + 7;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
  ctx.strokeStyle = colB; ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
  ctx.strokeStyle = colA; ctx.lineWidth = w + 2;
  ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
}

function hand(ctx, h, el, color, ink, r) {
  const ang = Math.atan2(h[1] - el[1], h[0] - el[0]);
  ctx.save();
  ctx.translate(h[0], h[1]); ctx.rotate(ang);
  ctx.fillStyle = color; ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.ellipse(2, 0, r * 1.05, r * 0.92, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // thumb nub
  ctx.beginPath(); ctx.ellipse(-2, -r * 0.8, r * 0.38, r * 0.3, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function leg(ctx, hipP, foot, flipFoot, ink) {
  const { elbow: knee } = ik2(hipP, foot, RIG.thigh, RIG.shin, -1);
  limb(ctx, hipP, knee, foot, 26, P.cream2, P.cream2, ink);
  // jutti (curled-toe shoe)
  ctx.save();
  ctx.translate(foot[0], foot[1]);
  ctx.scale(flipFoot, 1);
  ctx.fillStyle = P.goldDeep; ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-16, 0);
  ctx.quadraticCurveTo(-18, -16, 2, -16);
  ctx.quadraticCurveTo(22, -15, 30, -4);
  ctx.quadraticCurveTo(38, -10, 36, -16); // curled toe
  ctx.quadraticCurveTo(42, -4, 30, 2);
  ctx.lineTo(-16, 2);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(6, -10, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function body(ctx, p, grain) {
  const path = (c) => {
    c.beginPath();
    c.moveTo(-50, -206);
    c.quadraticCurveTo(0, -216, 50, -206);
    c.quadraticCurveTo(66, -150, 72, -52);
    c.quadraticCurveTo(0, -36, -72, -52);
    c.quadraticCurveTo(-66, -150, -50, -206);
    c.closePath();
  };
  paintFill(ctx, path, { base: P.g600, bounds: [-74, -216, 148, 180], light: P.g300, lightA: 0.35, dark: P.g900, darkA: 0.5, tex: grain, texA: 0.35, stroke: P.ink, strokeW: 4.5 });
  // hem piping
  ctx.save();
  ctx.strokeStyle = P.cream; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-68, -60); ctx.quadraticCurveTo(0, -45, 68, -60); ctx.stroke();
  // placket
  ctx.beginPath(); ctx.moveTo(0, -208); ctx.lineTo(0, -150); ctx.stroke();
  ctx.fillStyle = P.gold;
  for (const yy of [-190, -170]) { ctx.beginPath(); ctx.arc(0, yy, 4.2, 0, Math.PI * 2); ctx.fill(); }
  // apron pocket with tiny pencil stub
  ctx.strokeStyle = P.cream; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(-34, -112); ctx.lineTo(-34, -84); ctx.quadraticCurveTo(-18, -78, -2, -84); ctx.lineTo(-2, -112); ctx.stroke();
  // tape-measure sash (cream band with ticks), right shoulder to left hip
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(30, -210); ctx.lineTo(52, -200); ctx.lineTo(-52, -66); ctx.lineTo(-72, -78); ctx.closePath();
  ctx.fillStyle = P.cream2; ctx.fill();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.clip();
  ctx.strokeStyle = rgba(P.ink, 0.75); ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    const t = i / 15, x = lerp(41, -62, t), y = lerp(-205, -72, t);
    const L = i % 4 === 0 ? 12 : 7;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 0.79 * L, y - 0.61 * L); ctx.stroke();
  }
  ctx.restore();
  // brass tape end tab
  ctx.fillStyle = P.gold; ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.rect(-74, -84, 20, 16); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function head(ctx, p, grain) {
  const [hx, hy] = RIG.headC;
  const turn = clamp(p.headTurn, -1, 1);
  ctx.save();
  ctx.translate(hx, hy + 70); ctx.rotate(p.headTilt); ctx.translate(-hx, -hy - 70);
  // bun + pencil (behind head)
  const bx = hx - 26 - turn * 22, by = hy - 74;
  ctx.save();
  ctx.translate(bx, by); ctx.rotate(-0.55 + p.pencilAngle);
  // pencil
  ctx.fillStyle = P.gold; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.rect(-66, -8, 104, 16); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.goldDeep; ctx.fillRect(-66, 2, 104, 6);
  ctx.fillStyle = P.cream2; // sharpened wood
  ctx.beginPath(); ctx.moveTo(38, -8); ctx.lineTo(60, 0); ctx.lineTo(38, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.moveTo(53, -3); ctx.lineTo(61, 0); ctx.lineTo(53, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = P.cream3; ctx.beginPath(); ctx.rect(-74, -8, 9, 16); ctx.fill(); ctx.stroke(); // ferrule
  ctx.restore();
  ctx.fillStyle = P.hair; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(bx, by, 33, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = rgba('#5a4636', 0.8); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(bx, by, 20, 0.6, 2.6); ctx.stroke();
  // pencil front segment over bun
  ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.55 + p.pencilAngle);
  ctx.fillStyle = P.gold; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.rect(-14, -8, 26, 16); ctx.fill(); ctx.stroke();
  ctx.restore();
  // ears
  ctx.fillStyle = P.skinDark; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
  for (const sx of [-1, 1]) {
    const ex = hx + sx * (RIG.headRx - 6) - turn * 10;
    ctx.beginPath(); ctx.ellipse(ex, hy + 6, 14, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // face
  const facePath = (c) => { c.beginPath(); c.ellipse(hx, hy, RIG.headRx, RIG.headRy, 0, 0, Math.PI * 2); };
  paintFill(ctx, facePath, { base: P.skin, bounds: [hx - 86, hy - 80, 172, 160], light: P.skinLight, lightA: 0.7, dark: P.skinDark, darkA: 0.45, tex: grain, texA: 0.3, stroke: P.ink, strokeW: 4.5 });
  // hair cap with swoop fringe
  ctx.save();
  facePath(ctx); ctx.clip();
  ctx.fillStyle = P.hair;
  ctx.beginPath();
  ctx.moveTo(hx - 100, hy - 6);
  ctx.quadraticCurveTo(hx - 92, hy - 96, hx + 4, hy - 92);
  ctx.quadraticCurveTo(hx + 96, hy - 90, hx + 98, hy - 4);
  ctx.quadraticCurveTo(hx + 72, hy - 44, hx + 30 + turn * 10, hy - 46);
  ctx.quadraticCurveTo(hx - 10 + turn * 14, hy - 30, hx - 42 + turn * 10, hy - 50);
  ctx.quadraticCurveTo(hx - 80, hy - 40, hx - 100, hy - 6);
  ctx.fill();
  ctx.strokeStyle = rgba('#5a4636', 0.6); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(hx - 50, hy - 76); ctx.quadraticCurveTo(hx - 10, hy - 88, hx + 40, hy - 70); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4.5; facePath(ctx); ctx.stroke();

  const fx = hx + turn * 20;
  // cheeks
  ctx.fillStyle = rgba(P.blush, 0.35);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + sx * 50, hy + 22, 15, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  // bindi star
  ctx.fillStyle = P.gold; ctx.strokeStyle = P.ink; ctx.lineWidth = 2;
  star4(ctx, fx, hy - 36, 13, 0, 0.3); ctx.fill(); ctx.stroke();
  // eyes
  const eyeY = hy - 2;
  const eyeSep = 31;
  const blink = clamp(p.blink);
  for (const side of [-1, 1]) {
    const ex = fx + side * eyeSep * (1 - Math.abs(turn) * 0.12);
    let mode = p.eyes;
    if (mode === 'wink') mode = side === 1 ? 'happy' : 'open';
    const wide = mode === 'wide';
    const ry = (wide ? 24 : 20) * (1 - blink);
    if (mode === 'closed' || blink > 0.85) {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - 14, eyeY + 2); ctx.quadraticCurveTo(ex, eyeY + 9, ex + 14, eyeY + 2); ctx.stroke();
    } else if (mode === 'happy') {
      ctx.strokeStyle = P.ink; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - 14, eyeY + 6); ctx.quadraticCurveTo(ex, eyeY - 12, ex + 14, eyeY + 6); ctx.stroke();
    } else {
      ctx.fillStyle = P.cream; ctx.strokeStyle = P.ink; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(ex, eyeY, wide ? 19 : 16, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, eyeY, wide ? 19 : 16, ry, 0, 0, Math.PI * 2); ctx.clip();
      const px = ex + p.pupil[0] * 7 + turn * 4, py = eyeY + p.pupil[1] * 8;
      ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(px, py, wide ? 8.5 : 10.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px - 3.5, py - 4, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // brows
    const raise = side === -1 ? p.browB : p.browF;
    ctx.strokeStyle = P.hair; ctx.lineWidth = 7; ctx.lineCap = 'round';
    const by2 = eyeY - 31 - raise * 10;
    ctx.beginPath();
    ctx.moveTo(ex - 14, by2 + 4 - raise * side * 2 + (raise < 0 ? side * 5 : 0));
    ctx.quadraticCurveTo(ex, by2 - 4, ex + 14, by2 + 4 + raise * side * 2 - (raise < 0 ? side * 5 : 0));
    ctx.stroke();
  }
  // nose
  ctx.strokeStyle = P.skinDark; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(fx + 2, hy + 12); ctx.quadraticCurveTo(fx + 8 + turn * 4, hy + 22, fx + 1, hy + 25); ctx.stroke();
  // mouth
  const mx = fx + turn * 2, my = hy + 44;
  const open = clamp(p.mouthOpen);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4.5; ctx.lineJoin = 'round';
  if (open > 0.06 || p.mouth === 'o' || p.mouth === 'grin') {
    let w = 13 + open * 6, h = 4 + open * 16;
    if (p.mouth === 'o') { w = 9 + open * 3; h = 11 + open * 6; }
    if (p.mouth === 'grin') { w = 24; h = 10 + open * 10; }
    ctx.fillStyle = '#3B1410';
    ctx.beginPath();
    if (p.mouth === 'grin') { ctx.moveTo(mx - w, my - 4); ctx.quadraticCurveTo(mx, my + h * 2.2, mx + w, my - 4); ctx.closePath(); }
    else ctx.ellipse(mx, my, w, h, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#C8584A'; ctx.beginPath(); ctx.ellipse(mx, my + h * 0.9, w * 0.7, h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
    if (p.mouth === 'grin') { ctx.fillStyle = P.cream; ctx.fillRect(mx - w, my - 6, w * 2, 7); }
    ctx.restore();
  } else if (p.mouth === 'hmm') {
    ctx.beginPath(); ctx.moveTo(mx - 14, my + 2); ctx.quadraticCurveTo(mx - 6, my - 5, mx, my + 1); ctx.quadraticCurveTo(mx + 7, my + 6, mx + 14, my - 3); ctx.stroke();
  } else if (p.mouth === 'flat') {
    ctx.beginPath(); ctx.moveTo(mx - 12, my); ctx.lineTo(mx + 12, my); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(mx - 16, my - 3); ctx.quadraticCurveTo(mx, my + 12, mx + 16, my - 3); ctx.stroke();
  }
  // sweat / effort drop
  if (p.sweat > 0.01) {
    ctx.globalAlpha = p.sweat;
    ctx.fillStyle = '#CFEFE4'; ctx.strokeStyle = P.ink; ctx.lineWidth = 2.5;
    const sx = hx + 78, sy = hy - 52;
    ctx.beginPath(); ctx.moveTo(sx, sy - 14); ctx.quadraticCurveTo(sx + 10, sy, sx, sy + 6); ctx.quadraticCurveTo(sx - 10, sy, sx, sy - 14); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

export function drawBindu(ctx, pose, grain) {
  const p = { ...DEFAULT_POSE, ...pose };
  if (p.alpha <= 0.001 || p.s <= 0.001) return;
  ctx.save();
  if (p.shadow) softShadow(ctx, p.x, p.y + 2 * p.s, 70 * p.s, 14 * p.s, 0.38 * p.alpha);
  ctx.globalAlpha = p.alpha;
  ctx.translate(p.x, p.y);
  ctx.scale(p.s * p.flip, p.s);
  ctx.rotate(p.lean);
  const sq = p.squash;
  ctx.scale(1 + (1 - sq) * 0.7, sq);
  ctx.translate(0, p.bodyBob);
  const ink = P.ink;
  // back arm
  const sB = RIG.shoulderB, sF = RIG.shoulderF;
  const aB = ik2(sB, p.handB, RIG.upper, RIG.fore, p.bendB);
  limb(ctx, sB, aB.elbow, aB.hand, 24, P.g600, P.skin, ink);
  hand(ctx, aB.hand, aB.elbow, P.skinDark, ink, RIG.handR);
  if (p.propB) { ctx.save(); p.propB(ctx, aB.hand, aB.elbow); ctx.restore(); }
  // legs
  leg(ctx, RIG.hipB, p.footB, 1, ink);
  leg(ctx, RIG.hipF, p.footF, 1, ink);
  body(ctx, p, grain);
  head(ctx, p, grain);
  // front arm
  const aF = ik2(sF, p.handF, RIG.upper, RIG.fore, p.bendF);
  if (p.propF && p.propBehindHand) { ctx.save(); p.propF(ctx, aF.hand, aF.elbow); ctx.restore(); }
  limb(ctx, sF, aF.elbow, aF.hand, 24, P.g600, P.skin, ink);
  hand(ctx, aF.hand, aF.elbow, P.skin, ink, RIG.handR);
  if (p.propF && !p.propBehindHand) { ctx.save(); p.propF(ctx, aF.hand, aF.elbow); ctx.restore(); }
  ctx.restore();
}

// A tiny helper for idle breathing / blinking
export function idle(t, seed = 0) {
  const breathe = Math.sin(t * 2.4 + seed) * 2.2;
  const bt = (t + seed * 0.37) % 3.1;
  const blink = bt < 0.12 ? Math.sin((bt / 0.12) * Math.PI) : 0;
  return { bodyBob: breathe, blink };
}
