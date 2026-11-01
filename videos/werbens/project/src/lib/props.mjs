// Props: brief paper (flat / crumple / plane), stamp, phone, islands, chat bubbles, creator cards, avatars.
import { C } from "./palette.mjs";
import { rr, circle, icon } from "./draw.mjs";
import { mulberry32, lerp, clamp, E } from "./util.mjs";
import { drawHead } from "./rig.mjs";

export const FONT = {
  display: "InterDisplayXB",
  black: "InterDisplayBlack",
  semi: "InterSB",
  bold: "InterB",
};

// ---------------- Brief paper ----------------
const CRUMPLE_N = 18;
const crumpleOffsets = (() => {
  const r = mulberry32(77);
  return Array.from({ length: CRUMPLE_N }, () => ({ k: 0.55 + r() * 0.45, j: (r() - 0.5) * 0.5 }));
})();
const creases = (() => {
  const r = mulberry32(91);
  return Array.from({ length: 7 }, () => [r() - 0.5, r() - 0.5, r() - 0.5, r() - 0.5]);
})();

/** Brief paper centred at (x,y). o: { w, h, rot, crumple 0..1, stamp 0..1, sx, sy, alpha } */
export function drawBrief(ctx, x, y, o = {}) {
  const w = o.w ?? 130, h = o.h ?? 168, c = clamp(o.crumple ?? 0);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(o.sx ?? 1, o.sy ?? 1);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const shrink = lerp(1, 0.42, E.outCubic(c));
  // perimeter points of rect -> pulled inwards for crumple
  const per = [];
  for (let i = 0; i < CRUMPLE_N; i++) {
    const t = i / CRUMPLE_N;
    let px, py;
    if (t < 0.25) { px = lerp(-w / 2, w / 2, t / 0.25); py = -h / 2; }
    else if (t < 0.5) { px = w / 2; py = lerp(-h / 2, h / 2, (t - 0.25) / 0.25); }
    else if (t < 0.75) { px = lerp(w / 2, -w / 2, (t - 0.5) / 0.25); py = h / 2; }
    else { px = -w / 2; py = lerp(h / 2, -h / 2, (t - 0.75) / 0.25); }
    // move toward a circle of radius ~ w*0.42 with jitter
    const ang = Math.atan2(py, px);
    const R = (w * 0.5) * crumpleOffsets[i].k;
    const cx = Math.cos(ang + crumpleOffsets[i].j * 0.3) * R, cy = Math.sin(ang + crumpleOffsets[i].j * 0.3) * R;
    per.push({ x: lerp(px, cx, c) * shrink, y: lerp(py, cy, c) * shrink });
  }
  const path = () => {
    ctx.beginPath();
    per.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
  };
  // shadow
  ctx.save(); ctx.translate(5, 7); path(); ctx.fillStyle = "rgba(27,20,51,0.15)"; ctx.fill(); ctx.restore();
  path();
  ctx.fillStyle = c > 0.5 ? "#F6F1E6" : C.pureWhite;
  ctx.fill();
  ctx.save();
  path(); ctx.clip();
  const fade = 1 - clamp(c * 1.6);
  if (fade > 0) {
    ctx.globalAlpha *= fade;
    // header
    ctx.fillStyle = C.violet;
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.17);
    ctx.fillStyle = C.pureWhite;
    ctx.font = `${Math.round(h * 0.085)}px ${FONT.display}`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("BRIEF", -w / 2 + 12, -h / 2 + h * 0.087);
    // text lines
    ctx.fillStyle = C.grayLight;
    for (let i = 0; i < 5; i++) {
      const lw = i === 4 ? w * 0.4 : w * (0.72 - (i % 2) * 0.12);
      rr(ctx, -w / 2 + 14, -h / 2 + h * 0.27 + i * h * 0.12, lw, h * 0.045, 4); ctx.fill();
    }
    // dog ear
    ctx.fillStyle = C.grayLight;
    ctx.beginPath(); ctx.moveTo(w / 2 - 22, h / 2); ctx.lineTo(w / 2, h / 2 - 22); ctx.lineTo(w / 2 - 22, h / 2 - 22); ctx.closePath(); ctx.fill();
  }
  // crease lines
  if (c > 0.05) {
    ctx.globalAlpha = clamp(c * 1.5) * (o.alpha ?? 1);
    ctx.strokeStyle = "rgba(27,20,51,0.45)"; ctx.lineWidth = 2.5;
    for (const [a, b, cc, d] of creases) {
      ctx.beginPath(); ctx.moveTo(a * w * shrink, b * h * shrink); ctx.lineTo(cc * w * shrink, d * h * shrink); ctx.stroke();
    }
  }
  ctx.restore();
  path();
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.lineJoin = "round"; ctx.stroke();
  // stamp mark
  const st = o.stamp ?? 0;
  if (st > 0 && c < 0.3) {
    ctx.save();
    ctx.translate(4, h * 0.2);
    ctx.rotate(-0.2);
    const sc = st < 1 ? lerp(1.8, 1, E.outBack(st)) : 1;
    ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(st * 2) * (1 - c * 3);
    rr(ctx, -54, -19, 108, 38, 8);
    ctx.lineWidth = 5; ctx.strokeStyle = C.violet; ctx.stroke();
    ctx.fillStyle = C.violet;
    ctx.font = `25px ${FONT.black}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("READY", 0, 2);
    ctx.restore();
  }
  ctx.restore();
}

/** Paper plane, nose pointing +x before rotation. */
export function drawPlane(ctx, x, y, rot = 0, s = 1, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.lineJoin = "round";
  // shadow
  ctx.fillStyle = "rgba(27,20,51,0.13)";
  ctx.beginPath(); ctx.moveTo(56, 8); ctx.lineTo(-44, -14); ctx.lineTo(-30, 8); ctx.lineTo(-44, 26); ctx.closePath(); ctx.fill();
  // under body
  ctx.fillStyle = C.grayLight;
  ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(-30, 2); ctx.lineTo(-44, 20); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
  // top wing
  ctx.fillStyle = C.pureWhite;
  ctx.beginPath(); ctx.moveTo(52, 0); ctx.lineTo(-48, -22); ctx.lineTo(-30, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  // violet stripe (remnant of the brief header)
  ctx.strokeStyle = C.violet; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(-36, -14); ctx.lineTo(-12, -7); ctx.stroke();
  ctx.restore();
}

/** Rubber stamp (handle + base). */
export function drawStamp(ctx, x, y, rot = 0, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.lineJoin = "round";
  rr(ctx, -10, -78, 20, 46, 8); ctx.fillStyle = C.inkSoft; ctx.fill(); ctx.stroke();
  circle(ctx, 0, -86, 18, C.lilac, C.ink, 4);
  rr(ctx, -42, -34, 84, 26, 6); ctx.fillStyle = C.violet; ctx.fill(); ctx.stroke();
  rr(ctx, -38, -8, 76, 8, 3); ctx.fillStyle = C.ink; ctx.fill();
  ctx.restore();
}

// ---------------- Phone ----------------
export const PHONE = { w: 280, h: 540, r: 46, inset: 12 };
/**
 * Giant standing phone. Bottom-centre at (x, bottom). screenFn(ctx, sw, sh) draws in screen space.
 * o: { sx, sy, rot, glow }
 */
export function drawPhone(ctx, x, bottom, screenFn, o = {}) {
  const { w, h, r, inset } = PHONE;
  ctx.save();
  ctx.translate(x, bottom);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(o.sx ?? 1, o.sy ?? 1);
  // glow
  if (o.glow > 0) {
    ctx.save();
    ctx.globalAlpha = o.glow * 0.35;
    ctx.fillStyle = C.lilac;
    rr(ctx, -w / 2 - 26, -h - 26, w + 52, h + 52, r + 26); ctx.fill();
    ctx.restore();
  }
  // paper-cut drop shadow
  ctx.fillStyle = "rgba(27,20,51,0.18)";
  rr(ctx, -w / 2 + 12, -h + 10, w, h, r); ctx.fill();
  // body
  ctx.fillStyle = C.ink;
  rr(ctx, -w / 2, -h, w, h, r); ctx.fill();
  // side button
  ctx.fillStyle = C.inkSoft;
  rr(ctx, w / 2 - 2, -h + 120, 8, 60, 3); ctx.fill();
  // screen
  const sw = w - inset * 2, sh = h - inset * 2;
  ctx.save();
  ctx.translate(-w / 2 + inset, -h + inset);
  rr(ctx, 0, 0, sw, sh, r - inset);
  ctx.clip();
  ctx.fillStyle = "#120C26";
  ctx.fillRect(0, 0, sw, sh);
  if (screenFn) screenFn(ctx, sw, sh);
  ctx.restore();
  // notch
  ctx.fillStyle = C.ink;
  rr(ctx, -34, -h + inset + 8, 68, 16, 8); ctx.fill();
  // glass highlight
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = C.pureWhite;
  ctx.beginPath(); ctx.moveTo(-w / 2 + inset, -h + 80); ctx.lineTo(-w / 2 + 120, -h + inset); ctx.lineTo(-w / 2 + 170, -h + inset); ctx.lineTo(-w / 2 + inset, -h + 140); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();
}

// ---------------- Floating paper island ----------------
export function drawIsland(ctx, x, y, w, o = {}) {
  const s = o.s ?? 1;
  if (s <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s, s);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const hw = w / 2;
  const under = () => {
    ctx.beginPath();
    ctx.moveTo(-hw, 0);
    const n = 7;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const px = lerp(-hw, hw, t);
      const py = 22 + Math.sin(t * Math.PI) * 46 + (i % 2 ? 10 : -4);
      ctx.lineTo(px * (1 - Math.sin(t * Math.PI) * 0.12), py);
    }
    ctx.lineTo(hw, 0);
    ctx.closePath();
  };
  // shadow
  ctx.save(); ctx.translate(10, 16); under(); ctx.fillStyle = "rgba(27,20,51,0.12)"; ctx.fill(); ctx.restore();
  under(); ctx.fillStyle = C.lilac; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.lineJoin = "round"; ctx.stroke();
  // top surface
  ctx.beginPath(); ctx.ellipse(0, 0, hw, 20, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.white; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ---------------- Chat bubble ----------------
/** Bubble centred at (x,y). o: { w, h, fill, color, text, icon, tail: -1 | 1 | 0, s, alpha, font } */
export function drawBubble(ctx, x, y, o = {}) {
  const s = o.s ?? 1;
  if (s <= 0.01) return;
  const w = o.w ?? 150, h = o.h ?? 64;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s, s);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const path = () => {
    rr(ctx, -w / 2, -h / 2, w, h, Math.min(h / 2, 26));
    if (o.tail) {
      const tx = o.tail * (w / 2 - 22);
      ctx.moveTo(tx - 12 * o.tail, h / 2 - 2);
      ctx.lineTo(tx + 10 * o.tail, h / 2 + 18);
      ctx.lineTo(tx + 6 * o.tail, h / 2 - 2);
    }
  };
  if (o.shadow !== false) { ctx.save(); ctx.translate(5, 6); path(); ctx.fillStyle = "rgba(27,20,51,0.15)"; ctx.fill(); ctx.restore(); }
  path();
  ctx.fillStyle = o.fill ?? C.pureWhite; ctx.fill();
  ctx.lineWidth = o.lw ?? 4; ctx.strokeStyle = C.ink; ctx.lineJoin = "round"; ctx.stroke();
  // cover the seam between tail and body
  if (o.tail) {
    const tx = o.tail * (w / 2 - 22);
    ctx.fillStyle = o.fill ?? C.pureWhite;
    ctx.fillRect(Math.min(tx - 10 * o.tail, tx + 4 * o.tail), h / 2 - 5, 14, 6);
  }
  const col = o.color ?? C.ink;
  if (o.text) {
    ctx.fillStyle = col;
    ctx.font = o.font ?? `${Math.round(h * 0.42)}px ${FONT.bold}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(o.text, o.icon ? 14 : 0, 2);
  }
  if (o.icon) icon(ctx, o.icon, o.text ? -w / 2 + 28 : 0, 0, h * 0.5, col, 4);
  if (o.dots) {
    for (let i = 0; i < 3; i++) circle(ctx, (i - 1) * 16, 0, 5, col);
  }
  ctx.restore();
}

// ---------------- Avatar / creator card ----------------
export function drawAvatar(ctx, x, y, r, kind, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  circle(ctx, 0, 0, r, o.bg ?? C.lilacPale, C.ink, o.lw ?? 3);
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2); ctx.clip();
  const k = r / 46;
  ctx.translate(0, r * 0.18);
  ctx.scale(k, k);
  drawHead(ctx, kind, { smile: 0.7, ...(o.face || {}) }, 38, 7);
  ctx.restore();
  ctx.restore();
}

export const CARD = { w: 108, h: 100 };
export function drawCard(ctx, x, y, kind, o = {}) {
  const s = o.s ?? 1;
  if (s <= 0.01) return;
  const { w, h } = CARD;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot ?? 0);
  ctx.scale(s, s);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.fillStyle = "rgba(27,20,51,0.12)"; rr(ctx, -w / 2 + 4, -h / 2 + 5, w, h, 16); ctx.fill();
  rr(ctx, -w / 2, -h / 2, w, h, 16);
  ctx.fillStyle = o.selected ? C.lilacPale : C.pureWhite; ctx.fill();
  ctx.lineWidth = o.selected ? 4 : 2.5; ctx.strokeStyle = o.selected ? C.violet : C.grayLight; ctx.stroke();
  drawAvatar(ctx, 0, -h * 0.14, 27, kind, { lw: 2.5 });
  ctx.fillStyle = C.grayLight;
  rr(ctx, -30, h * 0.24, 60, 8, 4); ctx.fill();
  ctx.fillStyle = o.accent ?? C.lilac;
  rr(ctx, -20, h * 0.36, 40, 7, 3.5); ctx.fill();
  if (o.check > 0) {
    ctx.save();
    ctx.translate(w / 2 - 14, -h / 2 + 14);
    ctx.scale(o.check, o.check);
    circle(ctx, 0, 0, 14, C.violet, C.pureWhite, 3);
    icon(ctx, "check", 0, 0, 16, C.pureWhite, 3.5);
    ctx.restore();
  }
  ctx.restore();
}

/** Lightbulb idea pop. */
export function drawBulb(ctx, x, y, s, glow = 0) {
  if (s <= 0.01) return;
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  if (glow > 0) {
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.lineCap = "round";
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.42;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * 44, Math.sin(a) * 44); ctx.lineTo(Math.cos(a) * (44 + 22 * glow), Math.sin(a) * (44 + 22 * glow)); ctx.stroke();
    }
  }
  circle(ctx, 0, 0, 30, C.yellow, C.ink, 5);
  rr(ctx, -14, 26, 28, 20, 5); ctx.fillStyle = C.gray; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(0, -6); ctx.lineTo(8, 6); ctx.stroke();
  ctx.restore();
}

/** Confetti paper bits (deterministic physics). p0 = burst frame. */
export function confetti(ctx, f, f0, x, y, { n = 46, seed = 5, power = 26, colors = [C.violet, C.lilac, C.coral, C.yellow, C.pureWhite] } = {}) {
  if (f < f0) return;
  const r = mulberry32(seed);
  const t = (f - f0);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 2.4;
    const v = power * (0.45 + r() * 0.7);
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const drag = 0.92;
    const k = (1 - Math.pow(drag, t)) / (1 - drag);
    const px = x + vx * k + Math.sin(t * 0.25 + i) * 10;
    const py = y + vy * k + 0.35 * t * t * 0.5 * (0.6 + r() * 0.4);
    const rot = t * (0.15 + r() * 0.2) * (i % 2 ? 1 : -1);
    const col = colors[i % colors.length];
    const life = 1 - clamp((t - 30) / 25);
    if (life <= 0) continue;
    ctx.save();
    ctx.globalAlpha = life;
    ctx.translate(px, py); ctx.rotate(rot);
    ctx.scale(1, Math.cos(t * 0.3 + i));
    ctx.fillStyle = col;
    ctx.fillRect(-9, -5, 18, 10);
    ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.strokeRect(-9, -5, 18, 10);
    ctx.restore();
  }
}
