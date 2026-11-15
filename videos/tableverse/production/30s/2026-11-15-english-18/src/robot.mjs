// Small cut-paper robot puppet (english-17): two wheels, a body with a belly panel, a head with a dark screen face,
// an antenna bulb, and two-segment arms on brass split pins (same construction as the approved baker).
// drawRobot(ctx, r) with r = { x, y (ground), s, tilt (deg), bob, wheel (rad), armL, armR (deg, 0 = down, 90 = out
// sideways, 150 = raised beside the head), hat ('pirate' | none), elbL, elbR (deg extra bend outward/up), face: open|happy|dizzy|idea|think, look (-1..1),
// bulb (0..1 glow), sweat (0..1), steam (0..1), t (frame, for small loops) }.
import { C, cutPoly, cutCircle, roundRectPts, piece, withShadow, noShadow, splitPin } from './craft.mjs';
import { D2R } from './util.mjs';

const METAL = '#EEE9FF', METAL_DK = '#C9BEF2', BODY = '#7C4DF2', GLOW = '#7DF9FF';

function arm(ctx, side, a, e, t) {
  const sh = [side * 70, -168];
  const L1 = 50, L2 = 44;
  const a1 = a * D2R, a2 = (a + e) * D2R;
  const el = [sh[0] + side * Math.sin(a1) * L1, sh[1] + Math.cos(a1) * L1];
  const hd = [el[0] + side * Math.sin(a2) * L2, el[1] + Math.cos(a2) * L2];
  const seg = (p, q) => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke();
    ctx.strokeStyle = C.deep; ctx.lineWidth = 19; ctx.stroke();
    ctx.strokeStyle = METAL_DK; ctx.lineWidth = 13; ctx.stroke();
  };
  seg(sh, el); seg(el, hd);
  // claw: two prongs pointing along the forearm
  const dir = [side * Math.sin(a2), Math.cos(a2)], nrm = [-dir[1], dir[0]];
  const open = 0.35 + 0.15 * Math.sin(t * 0.3);
  ctx.save(); ctx.translate(...hd);
  for (const k of [-1, 1]) {
    const tip = [dir[0] * 20 + nrm[0] * k * 12 * (1 + open), dir[1] * 20 + nrm[1] * k * 12 * (1 + open)];
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...tip); ctx.stroke();
    ctx.strokeStyle = C.orange; ctx.lineWidth = 7; ctx.stroke();
  }
  ctx.restore();
  splitPin(ctx, ...sh, 5); splitPin(ctx, ...el, 4.5);
  return hd;
}

function face(ctx, r) {
  const cx = 0, cy = -268, lk = (r.look || 0) * 8;
  ctx.save();
  ctx.shadowColor = 'rgba(125,249,255,0.8)'; ctx.shadowBlur = 10;
  ctx.strokeStyle = GLOW; ctx.fillStyle = GLOW; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 6;
  const f = r.face || 'open';
  if (f === 'dizzy') {
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      const ex = cx + sx * 30, ey = cy - 8, rot = (r.t || 0) * 0.25 * sx;
      for (let i = 0; i <= 40; i++) { const u = i / 40, ang = rot + u * Math.PI * 4, rr = 2 + u * 15; const px = ex + Math.cos(ang) * rr, py = ey + Math.sin(ang) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.lineWidth = 4.5; ctx.stroke();
    }
    ctx.lineWidth = 5; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const px = cx - 22 + i * (44 / 24), py = cy + 26 + Math.sin(i * 0.8 + (r.t || 0) * 0.4) * 4; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  } else if (f === 'happy') {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * 30 + lk, cy - 2, 13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(cx + lk, cy + 10, 22, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  } else if (f === 'idea') {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * 30, cy - 8, 14, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + sx * 30 + 3, cy - 11, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(cx, cy + 26, 9, 11, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (f === 'think') {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.roundRect(cx + sx * 30 - 6 + 6, cy - 30, 12, 20, 6); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(cx - 14, cy + 24); ctx.lineTo(cx + 16, cy + 20); ctx.stroke();
  } else {
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.roundRect(cx + sx * 30 - 7 + lk, cy - 22, 14, 26, 7); ctx.fill(); }
    ctx.beginPath(); ctx.arc(cx + lk, cy + 12, 14, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }
  ctx.restore();
}

export function drawRobot(ctx, r) {
  const s = r.s ?? 1, t = r.t || 0;
  ctx.save();
  ctx.translate(r.x, r.y - (r.bob || 0));
  ctx.scale(s, s);
  // ground shadow
  ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = 'rgba(40,16,60,0.28)';
  ctx.beginPath(); ctx.ellipse(0, (r.bob || 0) / s + 2, 92, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // wheels
  withShadow(ctx, 5, 0.25);
  for (const wx of [-44, 44]) {
    ctx.save(); ctx.translate(wx, -28);
    piece(ctx, cutCircle(0, 0, 28, 28, 1801 + wx, 0.5, 30), C.deep, { margin: 3, grainA: 0.04 });
    noShadow(ctx);
    piece(ctx, cutCircle(0, 0, 15, 15, 1803 + wx, 0.4, 24), C.lilac, { grainA: 0.04, edge: null });
    ctx.rotate(r.wheel || 0);
    ctx.strokeStyle = C.deep; ctx.lineWidth = 3.5;
    for (let k = 0; k < 3; k++) { const a = (k * Math.PI * 2) / 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.stroke(); }
    splitPin(ctx, 0, 0, 4);
    withShadow(ctx, 5, 0.25);
    ctx.restore();
  }
  // tilt the upper body about the axle
  ctx.translate(0, -40); ctx.rotate((r.tilt || 0) * D2R); ctx.translate(0, 40);
  // chassis + body
  piece(ctx, cutPoly(roundRectPts(-70, -66, 140, 30, 12), 1810, 0.8, 10), C.violet, { margin: 3, grainA: 0.06 });
  noShadow(ctx);
  withShadow(ctx, 6, 0.28);
  piece(ctx, cutPoly(roundRectPts(-64, -200, 128, 142, 26), 1811, 1.0, 12), BODY, { margin: 3.5, grainA: 0.08 });
  noShadow(ctx);
  piece(ctx, cutPoly(roundRectPts(-40, -176, 80, 88, 16), 1812, 0.7, 10), METAL, { grainA: 0.05, edge: null });
  const lights = [C.yellow, C.cyan, C.orange];
  lights.forEach((col, i) => { ctx.beginPath(); ctx.arc(-20 + i * 20, -152, 7, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = C.deep; ctx.lineWidth = 2; ctx.stroke(); });
  // speaker slot under the lights
  ctx.fillStyle = C.deep;
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.roundRect(-22, -124 + k * 12, 44, 5, 2.5); ctx.fill(); }
  // neck + head
  withShadow(ctx, 6, 0.28);
  piece(ctx, cutPoly(roundRectPts(-16, -218, 32, 24, 6), 1813, 0.5, 8), METAL_DK, { margin: 2.5, grainA: 0.05 });
  noShadow(ctx);
  ctx.save(); ctx.translate(0, -218); ctx.rotate((r.headTilt || 0) * D2R); ctx.translate(0, 218);
  withShadow(ctx, 7, 0.3);
  for (const sx of [-1, 1]) piece(ctx, cutCircle(sx * 96, -268, 14, 18, 1820 + sx, 0.5, 20), C.orange, { margin: 2.5, grainA: 0.04 });
  piece(ctx, cutPoly(roundRectPts(-92, -334, 184, 124, 34), 1814, 1.1, 12), METAL, { margin: 3.5, grainA: 0.07 });
  noShadow(ctx);
  piece(ctx, cutPoly(roundRectPts(-72, -318, 144, 96, 22), 1815, 0.6, 10), C.deep, { grainA: 0.02, edge: null });
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(-64, -312, 70, 24, 12); ctx.fill();
  face(ctx, r);
  // antenna + bulb (english-18: optional cut-paper pirate hat; the antenna pokes out of its crown)
  const hat = r.hat === 'pirate';
  const ay = hat ? -400 : -334, by = hat ? -446 : -384;
  if (hat) {
    withShadow(ctx, 6, 0.3);
    piece(ctx, cutPoly([[-74, -340], [-66, -378], [-34, -402], [0, -408], [34, -402], [66, -378], [74, -340]], 1840, 0.8, 10), C.deep, { margin: 3, grainA: 0.06 });
    noShadow(ctx);
    withShadow(ctx, 5, 0.3);
    const brim = [[-128, -322], [-118, -352], [-96, -376], [-60, -360], [0, -352], [60, -360], [96, -376], [118, -352], [128, -322], [60, -328], [0, -326], [-60, -328]];
    piece(ctx, cutPoly(brim, 1841, 0.8, 10), C.violet, { margin: 3, grainA: 0.06 });
    noShadow(ctx);
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-118, -352); ctx.lineTo(-96, -376); ctx.lineTo(-60, -360); ctx.lineTo(0, -352); ctx.lineTo(60, -360); ctx.lineTo(96, -376); ctx.lineTo(118, -352); ctx.stroke();
    // TableVerse-style yellow "×" emblem instead of a skull
    ctx.strokeStyle = '#FFFDF8'; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(-11, -393); ctx.lineTo(11, -371); ctx.moveTo(11, -393); ctx.lineTo(-11, -371); ctx.stroke();
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.stroke();
  }
  ctx.strokeStyle = C.deep; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, ay); ctx.quadraticCurveTo(4, ay - 22, 0, by + 12); ctx.stroke();
  const b = r.bulb || 0;
  if (b > 0.01) {
    const g = ctx.createRadialGradient(0, by, 4, 0, by, 70);
    g.addColorStop(0, `rgba(255,236,120,${0.85 * b})`); g.addColorStop(1, 'rgba(255,236,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, by, 70, 0, Math.PI * 2); ctx.fill();
  }
  withShadow(ctx, 4, 0.25);
  piece(ctx, cutCircle(0, by, 14, 14, 1816, 0.4, 20), b > 0.3 ? '#FFF27A' : C.yellow, { margin: 2.5, grainA: 0.03 });
  noShadow(ctx);
  // sweat drops (overwhelmed)
  const sw = r.sweat || 0;
  if (sw > 0.01) {
    for (const [sx, ph] of [[-1, 0], [1, 0.5]]) {
      const u = ((t * 0.035 + ph) % 1);
      const px = sx * (104 + 6 * u), py = -306 + 70 * u;
      ctx.save(); ctx.globalAlpha = sw * (1 - u * 0.6); ctx.translate(px, py);
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(10, 2, 0, 8); ctx.quadraticCurveTo(-10, 2, 0, -14);
      ctx.fillStyle = '#9FF6FF'; ctx.fill(); ctx.strokeStyle = C.deep; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }
  }
  // steam puffs from the ear bolts
  const st = r.steam || 0;
  if (st > 0.01) {
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
      const u = ((t * 0.04 + k / 3 + (sx > 0 ? 0.15 : 0)) % 1);
      ctx.save(); ctx.globalAlpha = st * (1 - u) * 0.95;
      withShadow(ctx, 3, 0.15);
      piece(ctx, cutCircle(sx * (112 + 40 * u), -290 - 60 * u, 10 + 13 * u, 9 + 11 * u, 1830 + k, 0.6, 16), '#EFE8FF', { margin: 2, grainA: 0, edge: 'rgba(57,12,214,0.35)' });
      ctx.restore();
    }
  }
  ctx.restore(); // head tilt
  // arms last: shoulders sit outside the head, so a raised arm passes beside it, never hidden behind it
  const hL = arm(ctx, -1, r.armL ?? 20, r.elbL ?? 10, t);
  const hR = arm(ctx, 1, r.armR ?? 20, r.elbR ?? 10, t + 7);
  ctx.restore();
  return { hL, hR };
}
