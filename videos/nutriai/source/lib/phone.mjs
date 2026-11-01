// Giant phone with a STYLIZED tracker screen (illustration only: not the real NutriAI UI).
import { C, D2R, TAU, clamp, ease, lerp, rgba, roundRect } from './util.mjs';
import { drawIcon } from './props.mjs';
import { text } from './type.mjs';

export const PHONE = { w: 420, h: 840 };
const CX = -180, CW = 360;
export const CARDS = [
  { k: 'meals', y: -292, h: 178, label: 'Meals', icon: 'fork' },
  { k: 'water', y: -100, h: 122, label: 'Water', icon: 'drop' },
  { k: 'weight', y: 36, h: 150, label: 'Weight', icon: 'scale' },
  { k: 'fasting', y: 200, h: 150, label: 'Fasting', icon: 'moon' },
];
const WEIGHT_V = [0.46, 0.56, 0.42, 0.52, 0.44, 0.54, 0.48];

// Local (phone-space) anchor points used by the scene to aim flying objects.
export function anchor(name, i = 0) {
  if (name === 'card') { const c = CARDS[i]; return [0, c.y + c.h / 2]; }
  if (name === 'ring') return [CX + 80, CARDS[0].y + 114];
  if (name === 'mealRow') return [CX + 330, CARDS[0].y + 70 + i * 40 - 9];
  if (name === 'glass') return [CX + 38 + i * 40, CARDS[1].y + 86];
  if (name === 'weightDot') { const p = weightPt(6); return p; }
  if (name === 'fastRing') return [CX + 300, CARDS[3].y + 92];
  return [0, 0];
}
function weightPt(i) {
  const c = CARDS[2];
  const x0 = CX + 30, x1 = CX + 330;
  return [x0 + ((x1 - x0) * i) / 6, c.y + 134 - WEIGHT_V[i] * 66];
}
export function toWorld(st, p) {
  const s = st.s ?? 1, r = (st.rot ?? 0) * D2R;
  const x = p[0] * s, y = p[1] * s;
  return [st.x + x * Math.cos(r) - y * Math.sin(r), st.y + x * Math.sin(r) + y * Math.cos(r)];
}

function cardFrame(ctx, c, vis, active, activeAmt, pulse) {
  const cx = CX + CW / 2, cy = c.y + c.h / 2;
  const sc = lerp(0.6, 1, ease.outBack(clamp(vis), 2.4)) + (active ? 0.035 * activeAmt : 0);
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = 'rgba(28,38,32,0.10)';
  roundRect(ctx, CX + 4, c.y + 6, CW, c.h, 26);
  ctx.fill();
  roundRect(ctx, CX, c.y, CW, c.h, 26);
  ctx.fillStyle = C.white;
  ctx.fill();
  ctx.lineWidth = active ? lerp(2.5, 5, activeAmt) : 2.5;
  ctx.strokeStyle = active ? C.leaf : '#E6DCC8';
  ctx.stroke();
  if (pulse > 0 && pulse < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - pulse;
    ctx.strokeStyle = C.lime;
    ctx.lineWidth = 6;
    const g = pulse * 22;
    roundRect(ctx, CX - g, c.y - g, CW + 2 * g, c.h + 2 * g, 26 + g);
    ctx.stroke();
    ctx.restore();
  }
  // label row
  ctx.fillStyle = C.mint;
  ctx.beginPath();
  ctx.arc(CX + 32, c.y + 36, 19, 0, TAU);
  ctx.fill();
  drawIcon(ctx, c.icon, CX + 32, c.y + 36, 0.68, C.leafDark);
  ctx.fillStyle = C.ink;
  ctx.font = '700 28px "NutriText"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  text(ctx, c.label, CX + 62, c.y + 46, 'phone');
}

export function drawPhone(ctx, st, icon) {
  const s = st.s ?? 1;
  ctx.save();
  ctx.globalAlpha = st.alpha ?? 1;
  ctx.translate(st.x, st.y);
  ctx.rotate((st.rot ?? 0) * D2R);
  ctx.scale(s * (1 + (st.squash ?? 0) * 0.5), s * (1 - (st.squash ?? 0)));
  // body
  ctx.fillStyle = 'rgba(28,38,32,0.18)';
  roundRect(ctx, -210 + 12, -420 + 16, 420, 840, 60);
  ctx.fill();
  roundRect(ctx, -210, -420, 420, 840, 60);
  ctx.fillStyle = C.ink;
  ctx.fill();
  ctx.fillStyle = '#2E3A33';
  roundRect(ctx, 207, -250, 8, 90, 4);
  ctx.fill();
  roundRect(ctx, 207, -130, 8, 56, 4);
  ctx.fill();
  // screen
  roundRect(ctx, -196, -406, 392, 812, 46);
  ctx.fillStyle = '#FFFBF3';
  ctx.fill();
  ctx.save();
  roundRect(ctx, -196, -406, 392, 812, 46);
  ctx.clip();
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.arc(0, -386, 8, 0, TAU);
  ctx.fill();
  // header
  if (icon) ctx.drawImage(icon, -180, -366, 56, 56);
  ctx.fillStyle = C.ink;
  ctx.font = '800 32px "NutriText"';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  text(ctx, 'NutriAI', -114, -336, 'phone');
  ctx.font = '600 22px "NutriText"';
  ctx.fillStyle = C.ink2;
  text(ctx, 'Today', -114, -311, 'phone');
  // cards
  CARDS.forEach((c, i) => {
    const vis = st.cards ? st.cards[i] : 1;
    const active = st.active === i;
    const dimmed = st.active !== undefined && st.active >= 0 && !active;
    if (vis <= 0) {
      // empty slot
      ctx.save();
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = rgba(C.ink, 0.18);
      ctx.lineWidth = 3;
      roundRect(ctx, CX, c.y, CW, c.h, 26);
      ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.globalAlpha *= clamp(vis * 2.5) * (dimmed ? 1 - 0.45 * (st.activeAmt ?? 0) : 1);
    cardFrame(ctx, c, vis, active, st.activeAmt ?? 0, st.pulse ? st.pulse[i] : 0);
    if (c.k === 'meals') meals(ctx, c, st);
    if (c.k === 'water') water(ctx, c, st);
    if (c.k === 'weight') weight(ctx, c, st);
    if (c.k === 'fasting') fasting(ctx, c, st);
    ctx.restore();
  });
  // home bar
  ctx.fillStyle = rgba(C.ink, 0.3);
  roundRect(ctx, -60, 382, 120, 7, 4);
  ctx.fill();
  if (st.glow) {
    ctx.fillStyle = rgba('#FFFFFF', 0.35 * st.glow);
    ctx.fillRect(-200, -410, 400, 820);
  }
  ctx.restore();
  ctx.restore();
}

function meals(ctx, c, st) {
  const m = st.meals || [0, 0, 0];
  const ring = st.ring ?? 0;
  const [rx, ry] = [CX + 80, c.y + 114];
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#EFE6D4';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(rx, ry, 42, 0, TAU);
  ctx.stroke();
  if (ring > 0.002) {
    ctx.strokeStyle = C.leaf;
    ctx.beginPath();
    ctx.arc(rx, ry, 42, -Math.PI / 2, -Math.PI / 2 + TAU * ring);
    ctx.stroke();
  }
  drawIcon(ctx, 'fork', rx, ry, 0.8, ring > 0.99 ? C.leaf : C.ink2);
  const rows = ['Breakfast', 'Lunch', 'Dinner'];
  rows.forEach((r, i) => {
    const y = c.y + 76 + i * 40;
    const p = clamp(m[i]);
    ctx.font = '600 25px "NutriText"';
    ctx.fillStyle = p > 0.5 ? C.ink : rgba(C.ink, 0.5);
    ctx.textAlign = 'left';
    text(ctx, r, CX + 150, y, 'phone');
    const cx = CX + 330, cy = y - 9;
    ctx.lineWidth = 3;
    ctx.strokeStyle = rgba(C.ink, 0.25);
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, TAU);
    ctx.stroke();
    if (p > 0) {
      const k = ease.outBack(p, 3);
      ctx.fillStyle = C.leaf;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * k, 0, TAU);
      ctx.fill();
      drawIcon(ctx, 'check', cx, cy, 0.85 * clamp(k), C.white);
    }
  });
}

function glassIcon(ctx, x, y, fill) {
  // x,y = top-left; 28 x 40
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 28, y);
    ctx.lineTo(x + 24, y + 40);
    ctx.lineTo(x + 4, y + 40);
    ctx.closePath();
  };
  if (fill > 0) {
    ctx.save();
    path();
    ctx.clip();
    ctx.fillStyle = C.water;
    const h = 40 * clamp(fill);
    ctx.fillRect(x - 2, y + 40 - h, 32, h + 2);
    ctx.fillStyle = C.waterLight;
    ctx.fillRect(x - 2, y + 40 - h, 32, 5);
    ctx.restore();
  }
  path();
  ctx.strokeStyle = fill > 0.99 ? C.water : rgba(C.ink, 0.35);
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function water(ctx, c, st) {
  const w = st.water || [];
  for (let i = 0; i < 8; i++) glassIcon(ctx, CX + 24 + i * 40, c.y + 66, w[i] ?? 0);
}

function weight(ctx, c, st) {
  const dot = st.weightDot ?? 0;
  const line = st.weightLine ?? 0;
  ctx.save();
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = rgba(C.ink, 0.12);
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const y = c.y + 76 + k * 30;
    ctx.beginPath();
    ctx.moveTo(CX + 24, y);
    ctx.lineTo(CX + 336, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = rgba(C.ink, 0.45);
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const [x, y] = weightPt(i);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  if (line > 0) {
    const a = weightPt(5), b = weightPt(6);
    ctx.strokeStyle = C.leaf;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(lerp(a[0], b[0], line), lerp(a[1], b[1], line));
    ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const [x, y] = weightPt(i);
    ctx.fillStyle = C.white;
    ctx.strokeStyle = rgba(C.ink, 0.55);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  if (dot > 0) {
    const [x, y] = weightPt(6);
    const k = ease.outBack(clamp(dot), 3);
    ctx.fillStyle = rgba(C.lime, 0.35 * (1 - clamp(dot)));
    ctx.beginPath();
    ctx.arc(x, y, 10 + 22 * clamp(dot), 0, TAU);
    ctx.fill();
    ctx.fillStyle = C.leaf;
    ctx.beginPath();
    ctx.arc(x, y, 10 * k, 0, TAU);
    ctx.fill();
  }
}

function fasting(ctx, c, st) {
  const sw = clamp(st.fasting ?? 0);
  // optional tag
  ctx.font = '700 19px "NutriText"';
  const tw = ctx.measureText('optional').width + 22;
  ctx.fillStyle = C.mint;
  roundRect(ctx, CX + 172, c.y + 22, tw, 30, 15);
  ctx.fill();
  ctx.fillStyle = C.leafDark;
  ctx.textAlign = 'left';
  text(ctx, 'optional', CX + 183, c.y + 44, 'phone');
  // bar from moon to sun
  const y = c.y + 108, x0 = CX + 62, x1 = CX + 228;
  drawIcon(ctx, 'moon', CX + 34, y, 0.62, C.ink2);
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#EFE6D4';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
  if (sw > 0.003) {
    ctx.strokeStyle = C.leaf;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(lerp(x0, x1, sw), y);
    ctx.stroke();
  }
  ctx.fillStyle = C.honey;
  ctx.beginPath();
  ctx.arc(x1 + 26, y, 9, 0, TAU);
  ctx.fill();
  // ring
  const [rx, ry] = [CX + 300, c.y + 92];
  ctx.strokeStyle = '#EFE6D4';
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.arc(rx, ry, 36, 0, TAU);
  ctx.stroke();
  if (sw > 0.003) {
    ctx.strokeStyle = C.leaf;
    ctx.beginPath();
    ctx.arc(rx, ry, 36, -Math.PI / 2, -Math.PI / 2 + TAU * sw);
    ctx.stroke();
    const a = -Math.PI / 2 + TAU * sw;
    ctx.fillStyle = C.leafDark;
    ctx.beginPath();
    ctx.arc(rx + Math.cos(a) * 36, ry + Math.sin(a) * 36, 7, 0, TAU);
    ctx.fill();
  }
}
