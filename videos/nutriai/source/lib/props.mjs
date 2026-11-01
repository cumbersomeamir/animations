// Original prop illustrations (paper-cutout style) used across the NutriAI promo.
import { C, D2R, TAU, clamp, lerp, rgba, rng, roundRect, ease } from './util.mjs';

const SH = 'rgba(28,38,32,0.16)';
function hardShadow(ctx, on, dx = 6, dy = 8) {
  if (on) {
    ctx.shadowColor = SH;
    ctx.shadowOffsetX = dx;
    ctx.shadowOffsetY = dy;
    ctx.shadowBlur = 0;
  } else {
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}

// ---------- food ----------
export function drawToast(ctx, x, y, s, rot = 0, bites = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * D2R);
  ctx.scale(s, s);
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(-28, 26);
    ctx.lineTo(-28, -10);
    ctx.bezierCurveTo(-36, -30, -20, -40, -6, -34);
    ctx.bezierCurveTo(4, -42, 26, -40, 30, -22);
    ctx.bezierCurveTo(36, -12, 30, -6, 28, -2);
    ctx.lineTo(28, 26);
    ctx.closePath();
  };
  ctx.save();
  if (bites > 0) {
    // carve a bite out of the top-right corner
    ctx.beginPath();
    ctx.rect(-60, -60, 120, 120);
    const r = 12 + 6 * bites;
    ctx.arc(26, -34, r, 0, TAU, true);
    ctx.arc(8, -42, r * 0.8, 0, TAU, true);
    ctx.clip('evenodd');
  }
  path();
  ctx.fillStyle = '#C8843A';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, 2);
  ctx.scale(0.78, 0.8);
  path();
  ctx.fillStyle = '#F2CC8C';
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

function egg(ctx) {
  ctx.fillStyle = '#FFFDF6';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, 0);
  ctx.bezierCurveTo(-40, -16, -18, -22, -6, -16);
  ctx.bezierCurveTo(8, -26, 34, -18, 34, -4);
  ctx.bezierCurveTo(40, 6, 20, 8, 0, 6);
  ctx.bezierCurveTo(-18, 9, -32, 8, -34, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#F4B12A';
  ctx.beginPath();
  ctx.ellipse(2, -8, 11, 8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.7);
  ctx.beginPath();
  ctx.ellipse(-2, -11, 3.5, 2.2, -0.4, 0, TAU);
  ctx.fill();
}

function bowl(ctx, fillCol) {
  ctx.fillStyle = fillCol;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-50, -26);
  ctx.bezierCurveTo(-48, 6, -30, 14, 0, 14);
  ctx.bezierCurveTo(30, 14, 48, 6, 50, -26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = rgba('#FFFFFF', 0.35);
  ctx.beginPath();
  ctx.ellipse(-24, -10, 8, 12, 0.5, 0, TAU);
  ctx.fill();
}

function salad(ctx) {
  // greens heaped above bowl rim
  const leaves = [[-34, -30, 18, C.leaf], [-14, -40, 20, C.lime], [8, -38, 20, C.leaf], [28, -30, 17, C.lime], [-4, -28, 18, '#5DB52E']];
  for (const [x, y, r, col] of leaves) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.7, 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  for (const [x, y] of [[-18, -34], [16, -40]]) {
    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = rgba('#FFFFFF', 0.6);
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, 2.4, 0, TAU);
    ctx.fill();
  }
  bowl(ctx, '#FFFFFF');
}

function dinner(ctx, f) {
  // rice dome + curry + peas, with steam
  ctx.fillStyle = '#FFF9EE';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(-12, -28, 30, 20, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.honey;
  ctx.beginPath();
  ctx.ellipse(22, -26, 24, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.lime;
  for (const [x, y] of [[14, -30], [26, -33], [34, -28], [-2, -40]]) {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, TAU);
    ctx.fill();
  }
  bowl(ctx, C.honeyDark);
  // steam
  ctx.strokeStyle = rgba(C.ink, 0.35);
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = (f * 0.06 + i * 0.9) % 1;
    const xx = -20 + i * 20;
    ctx.globalAlpha = Math.sin(ph * Math.PI);
    ctx.beginPath();
    for (let k = 0; k <= 10; k++) {
      const yy = -52 - ph * 30 - k * 3.2;
      const x2 = xx + Math.sin(k * 0.7 + f * 0.15 + i) * 5;
      k ? ctx.lineTo(x2, yy) : ctx.moveTo(x2, yy);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Plate seen from a low 3/4 angle; origin = centre of the top surface.
// food: 'breakfast' | 'lunch' | 'dinner' | 'empty'. spinX in [-1,1] fakes a coin-flip spin.
export function drawPlate(ctx, x, y, s, rot = 0, food = 'breakfast', opt = {}) {
  const f = opt.f ?? 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * D2R);
  ctx.scale(s * (opt.spinX ?? 1), s);
  hardShadow(ctx, opt.shadow !== false);
  ctx.fillStyle = '#E9E2D2';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.ellipse(0, 7, 96, 25, 0, 0, TAU);
  ctx.fill();
  hardShadow(ctx, false);
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.ellipse(0, 0, 96, 23, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(C.ink, 0.25);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 1, 66, 14, 0, 0, TAU);
  ctx.stroke();
  if (food === 'breakfast') {
    ctx.save();
    ctx.translate(22, -2);
    egg(ctx);
    ctx.restore();
    if (!opt.noToast) drawToast(ctx, -34, -22, 0.95, -8, opt.toastBites || 0);
  } else if (food === 'lunch') {
    ctx.save();
    ctx.translate(0, -6);
    salad(ctx);
    ctx.restore();
  } else if (food === 'dinner') {
    ctx.save();
    ctx.translate(0, -6);
    dinner(ctx, f);
    ctx.restore();
  }
  ctx.restore();
}

// ---------- glass ----------
// origin = bottom centre. level 0..1. rot in degrees; water stays level in world space.
export function drawGlass(ctx, x, y, s, rot = 0, level = 0.7, opt = {}) {
  const H = 112, TW = 40, BW = 30;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * D2R);
  ctx.scale(s, s);
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(-TW, -H);
    ctx.lineTo(TW, -H);
    ctx.lineTo(BW, 0);
    ctx.quadraticCurveTo(BW, 4, BW - 4, 4);
    ctx.lineTo(-BW + 4, 4);
    ctx.quadraticCurveTo(-BW, 4, -BW, 0);
    ctx.closePath();
  };
  hardShadow(ctx, opt.shadow !== false);
  shape();
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fill();
  hardShadow(ctx, false);
  if (level > 0.001) {
    ctx.save();
    shape();
    ctx.clip();
    const ly = -H * level + 4;
    ctx.translate(0, ly);
    ctx.rotate(-rot * D2R);
    ctx.fillStyle = C.water;
    ctx.beginPath();
    const amp = opt.slosh ?? 0;
    const ph = opt.f ? opt.f * 0.45 : 0;
    ctx.moveTo(-200, 0);
    for (let i = -200; i <= 200; i += 10) ctx.lineTo(i, Math.sin(i * 0.05 + ph) * amp);
    ctx.lineTo(200, 300);
    ctx.lineTo(-200, 300);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.waterLight;
    ctx.beginPath();
    ctx.moveTo(-200, 0);
    for (let i = -200; i <= 200; i += 10) ctx.lineTo(i, Math.sin(i * 0.05 + ph) * amp);
    for (let i = 200; i >= -200; i -= 10) ctx.lineTo(i, Math.sin(i * 0.05 + ph) * amp + 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  shape();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-TW + 14, -H + 16);
  ctx.lineTo(-BW + 12, -18);
  ctx.stroke();
  ctx.restore();
}

// ---------- bathroom scale ----------
// origin = bottom centre on the floor. needle in degrees (0 = straight up).
export function drawScale(ctx, x, y, s, opt = {}) {
  const sq = opt.squash ?? 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * (1 + sq * 0.5), s * (1 - sq));
  hardShadow(ctx, opt.shadow !== false);
  roundRect(ctx, -112, -58, 224, 58, 16);
  ctx.fillStyle = '#FBF7EE';
  ctx.fill();
  hardShadow(ctx, false);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.stroke();
  // top pad
  roundRect(ctx, -100, -58, 200, 12, 6);
  ctx.fillStyle = C.mint;
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // dial window
  ctx.fillStyle = C.white;
  ctx.beginPath();
  ctx.arc(0, -24, 19, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = rgba(C.ink, 0.5);
  ctx.lineWidth = 2;
  for (let i = -4; i <= 4; i++) {
    const a = i * 26 * D2R;
    ctx.beginPath();
    ctx.moveTo(Math.sin(a) * 13, -24 - Math.cos(a) * 13);
    ctx.lineTo(Math.sin(a) * 16.5, -24 - Math.cos(a) * 16.5);
    ctx.stroke();
  }
  const na = (opt.needle ?? -100) * D2R;
  ctx.strokeStyle = C.coral;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -24);
  ctx.lineTo(Math.sin(na) * 15, -24 - Math.cos(na) * 15);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(0, -24, 3.5, 0, TAU);
  ctx.fill();
  // feet
  ctx.fillStyle = C.ink;
  roundRect(ctx, -96, -2, 26, 7, 3);
  ctx.fill();
  roundRect(ctx, 70, -2, 26, 7, 3);
  ctx.fill();
  ctx.restore();
}

// ---------- alarm clock ----------
// origin = centre of the face. minA/hourA in degrees clockwise from 12.
export function drawClock(ctx, x, y, s, opt = {}) {
  const R = 60;
  const shake = opt.shake ?? 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((opt.rot ?? 0) + shake * 7) * D2R);
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // bells + hammer
  const bj = shake * 3;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * 36, -R + 2 + (side > 0 ? bj : -bj));
    ctx.rotate(side * 0.6);
    ctx.fillStyle = C.honey;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, -6, 22, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, -R);
  ctx.lineTo(0, -R - 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -R - 22, 6, 0, TAU);
  ctx.fillStyle = C.ink;
  ctx.fill();
  // legs
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 34, R - 12);
    ctx.lineTo(side * 48, R + 14);
    ctx.stroke();
  }
  // body
  hardShadow(ctx, opt.shadow !== false);
  ctx.fillStyle = C.honey;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();
  hardShadow(ctx, false);
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = C.cream;
  ctx.beginPath();
  ctx.arc(0, 0, R - 13, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // fasting-style arc on the face (optional)
  if (opt.arc) {
    ctx.strokeStyle = C.leaf;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, R - 21, -Math.PI / 2, -Math.PI / 2 + TAU * opt.arc);
    ctx.stroke();
  }
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const r1 = i % 3 === 0 ? R - 25 : R - 21;
    ctx.beginPath();
    ctx.moveTo(Math.sin(a) * r1, -Math.cos(a) * r1);
    ctx.lineTo(Math.sin(a) * (R - 17), -Math.cos(a) * (R - 17));
    ctx.stroke();
  }
  const hand = (deg, len, w) => {
    const a = deg * D2R;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.sin(a) * len, -Math.cos(a) * len);
    ctx.stroke();
  };
  ctx.strokeStyle = C.ink;
  hand(opt.hourA ?? 300, 22, 6);
  ctx.strokeStyle = opt.minCol || C.ink;
  hand(opt.minA ?? 0, 36, 5);
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
  // ringing vibration marks
  if (shake) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = rgba(C.ink, 0.7 * Math.min(1, Math.abs(shake) * 3));
    ctx.lineWidth = 4 * s;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const r = (R + 24 + k * 14) * s;
        ctx.beginPath();
        ctx.arc(0, -R * 0.6 * s, r, side < 0 ? Math.PI * 1.15 : -Math.PI * 0.35, side < 0 ? Math.PI * 1.35 : -Math.PI * 0.15);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// Minute-hand tip position (world) for the clock drawn at (x,y,s,rot=0).
export function clockTip(x, y, s, minA, len = 36) {
  const a = minA * D2R;
  return [x + Math.sin(a) * len * s, y - Math.cos(a) * len * s];
}

// ---------- table ----------
export function drawTable(ctx, x, y, w, legLen, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.fillStyle = '#B97A3A';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.rect(side * (w / 2 - 34) - 9, 18, 18, legLen - 18);
    ctx.fill();
    ctx.stroke();
  }
  hardShadow(ctx, true, 0, 10);
  roundRect(ctx, -w / 2, -4, w, 26, 8);
  ctx.fillStyle = '#D9A35F';
  ctx.fill();
  hardShadow(ctx, false);
  ctx.stroke();
  ctx.fillStyle = rgba('#FFFFFF', 0.28);
  roundRect(ctx, -w / 2 + 12, -1, w - 24, 6, 3);
  ctx.fill();
  ctx.restore();
}

// ---------- sky ----------
export function drawSun(ctx, x, y, r, f, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = rgba(C.honey, 0.22);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.55, 0, TAU);
  ctx.fill();
  ctx.rotate(f * 0.01);
  ctx.fillStyle = rgba(C.honey, 0.55);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(TAU / 12);
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, -r * 1.12);
    ctx.lineTo(0, -r * 1.42);
    ctx.lineTo(r * 0.16, -r * 1.12);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = C.honey;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.25);
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.3, r * 0.45, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawMoon(ctx, x, y, r, alpha = 1, bg = C.night) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rgba(C.cream, 0.12);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#F4E9CF';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x + r * 0.42, y - r * 0.22, r * 0.86, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawStar(ctx, x, y, r, a = 1) {
  ctx.save();
  ctx.globalAlpha = clamp(a);
  ctx.fillStyle = '#F7EED6';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 ? r * 0.32 : r;
    const ang = (i / 8) * TAU;
    ctx.lineTo(x + Math.sin(ang) * rr, y - Math.cos(ang) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCloud(ctx, x, y, s, col = '#FFFFFF', alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = rgba('#1C2620', 0.06);
  const blob = (dx, dy) => {
    ctx.beginPath();
    ctx.arc(-60 + dx, 0 + dy, 34, 0, TAU);
    ctx.arc(-14 + dx, -26 + dy, 46, 0, TAU);
    ctx.arc(38 + dx, -8 + dy, 38, 0, TAU);
    ctx.arc(74 + dx, 8 + dy, 26, 0, TAU);
    ctx.rect(-60 + dx, 0 + dy, 134, 34);
    ctx.fill();
  };
  blob(6, 8);
  ctx.fillStyle = col;
  blob(0, 0);
  ctx.restore();
}

// ---------- labels / chips ----------
export function drawTag(ctx, ax, ay, text, rot, opt = {}) {
  const font = opt.font || '700 30px "NutriText"';
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(rot * D2R);
  ctx.font = font;
  const w = ctx.measureText(text).width + 34;
  const h = 46;
  const len = opt.len ?? 34;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, len);
  ctx.stroke();
  hardShadow(ctx, true, 4, 5);
  roundRect(ctx, -w / 2, len, w, h, 10);
  ctx.fillStyle = opt.bg || C.ink;
  ctx.fill();
  hardShadow(ctx, false);
  ctx.fillStyle = opt.dot || C.lime;
  ctx.beginPath();
  ctx.arc(-w / 2 + 14, len + h / 2, 5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = opt.fg || C.cream;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(text, 6, len + h / 2 + 1);
  ctx.restore();
  return { w, h };
}

export function drawChip(ctx, x, y, s, rot, label, icon = 'fork') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * D2R);
  ctx.scale(s, s);
  ctx.font = '700 28px "NutriText"';
  const w = ctx.measureText(label).width + 76;
  hardShadow(ctx, true, 5, 6);
  roundRect(ctx, -w / 2, -28, w, 56, 28);
  ctx.fillStyle = C.white;
  ctx.fill();
  hardShadow(ctx, false);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.arc(-w / 2 + 28, 0, 18, 0, TAU);
  ctx.fill();
  drawIcon(ctx, icon, -w / 2 + 28, 0, 0.62, C.leafDark);
  ctx.fillStyle = C.ink;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, -w / 2 + 54, 1);
  ctx.restore();
}

export function drawDrop(ctx, x, y, s, col = C.water) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.bezierCurveTo(6, -10, 14, -2, 14, 6);
  ctx.arc(0, 6, 14, 0, Math.PI);
  ctx.bezierCurveTo(-14, -2, -6, -10, 0, -22);
  ctx.fill();
  ctx.fillStyle = rgba('#FFFFFF', 0.6);
  ctx.beginPath();
  ctx.ellipse(-5, 5, 3, 5, 0.3, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawPadlock(ctx, x, y, s, closed = 1, glow = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (glow > 0) {
    ctx.fillStyle = rgba(C.lime, 0.25 * glow);
    ctx.beginPath();
    ctx.arc(0, -10, 90 + 20 * glow, 0, TAU);
    ctx.fill();
  }
  // shackle
  const lift = (1 - closed) * 26;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 13;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.moveTo(-26, -6 - lift);
  ctx.lineTo(-26, -36 - lift);
  ctx.arc(0, -36 - lift, 26, Math.PI, 0);
  ctx.lineTo(26, -6 - (closed < 1 ? lift : 0));
  ctx.stroke();
  ctx.strokeStyle = '#7C8A80';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-26, -10 - lift);
  ctx.lineTo(-26, -36 - lift);
  ctx.arc(0, -36 - lift, 26, Math.PI, 0);
  ctx.stroke();
  hardShadow(ctx, true, 5, 6);
  roundRect(ctx, -46, -14, 92, 74, 16);
  ctx.fillStyle = C.leaf;
  ctx.fill();
  hardShadow(ctx, false);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(0, 16, 9, 0, TAU);
  ctx.fill();
  ctx.fillRect(-4, 18, 8, 20);
  ctx.restore();
}

// ---------- small UI icons (drawn, not taken from the real app) ----------
export function drawIcon(ctx, kind, x, y, s, col) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = col;
  ctx.fillStyle = col;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  if (kind === 'fork') {
    ctx.beginPath();
    ctx.moveTo(-8, -18); ctx.lineTo(-8, -4);
    ctx.moveTo(0, -18); ctx.lineTo(0, 20);
    ctx.moveTo(8, -18); ctx.lineTo(8, -4);
    ctx.moveTo(-8, -4); ctx.quadraticCurveTo(0, 6, 8, -4);
    ctx.stroke();
  } else if (kind === 'drop') {
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.bezierCurveTo(6, -8, 13, -1, 13, 6);
    ctx.arc(0, 6, 13, 0, Math.PI);
    ctx.bezierCurveTo(-13, -1, -6, -8, 0, -18);
    ctx.fill();
  } else if (kind === 'scale') {
    roundRect(ctx, -17, -15, 34, 30, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -2, 7, Math.PI, 0);
    ctx.stroke();
  } else if (kind === 'moon') {
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0.9, Math.PI * 2 - 0.9 + Math.PI * 0.0, false);
    ctx.quadraticCurveTo(-2, 0, Math.cos(0.9) * 15, Math.sin(0.9) * 15);
    ctx.fill();
  } else if (kind === 'check') {
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-9, 1);
    ctx.lineTo(-2, 8);
    ctx.lineTo(10, -7);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- particles ----------
// Deterministic burst: returns nothing, draws particles for frame f emitted at f0.
export function burst(ctx, f, f0, opt) {
  const t = (f - f0) / 30;
  const life = opt.life ?? 0.7;
  if (t < 0 || t > life) return;
  const r = rng(opt.seed ?? 1);
  const n = opt.n ?? 10;
  const g = opt.g ?? 1400;
  for (let i = 0; i < n; i++) {
    const ang = lerp(opt.a0 ?? -150, opt.a1 ?? -30, r()) * D2R;
    const sp = lerp(opt.v0 ?? 250, opt.v1 ?? 600, r());
    const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp;
    const x = opt.x + vx * t, y = opt.y + vy * t + 0.5 * g * t * t;
    const k = t / life;
    const size = (opt.size ?? 8) * lerp(0.6, 1.3, r());
    const a = 1 - ease.inQuad(k);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.rotate(r() * 6 + t * 8);
    if (opt.kind === 'crumb') {
      ctx.fillStyle = r() > 0.5 ? '#C8843A' : '#F2CC8C';
      ctx.fillRect(-size / 2, -size / 2, size, size * 0.8);
    } else if (opt.kind === 'drop') {
      ctx.fillStyle = C.water;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, TAU);
      ctx.fill();
    } else if (opt.kind === 'dust') {
      ctx.globalAlpha = a * 0.75;
      ctx.fillStyle = opt.col || '#E3D6BC';
      ctx.beginPath();
      ctx.arc(0, 0, size * (0.6 + k * 1.6), 0, TAU);
      ctx.fill();
    } else if (opt.kind === 'spark') {
      ctx.fillStyle = opt.col || C.lime;
      ctx.beginPath();
      for (let j = 0; j < 8; j++) {
        const rr = j % 2 ? size * 0.3 : size;
        const aa = (j / 8) * TAU;
        ctx.lineTo(Math.sin(aa) * rr, -Math.cos(aa) * rr);
      }
      ctx.closePath();
      ctx.fill();
    } else if (opt.kind === 'leaf') {
      ctx.fillStyle = r() > 0.5 ? C.leaf : C.lime;
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 0.45, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

// Speed lines behind a moving object.
export function speedLines(ctx, x, y, dx, dy, n, alpha, col = C.ink) {
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  ctx.save();
  ctx.strokeStyle = rgba(col, alpha);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * 22;
    const px = x - uy * off, py = y + ux * off;
    const len = 50 + (i % 2) * 30;
    ctx.beginPath();
    ctx.moveTo(px - ux * 30, py - uy * 30);
    ctx.lineTo(px - ux * (30 + len), py - uy * (30 + len));
    ctx.stroke();
  }
  ctx.restore();
}
