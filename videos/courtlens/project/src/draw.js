'use strict';
// Original editorial props and typography helpers.
const { TAU, clamp, lerp, rng, E } = require('./lib');
const C = require('./palette');

const F = {
  serif: (w, px) => `${w} ${px}px Fraunces`,
  serifI: (w, px) => `italic ${w} ${px}px Fraunces`,
  sans: (w, px) => `${w} ${px}px Inter`,
};

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// A sheet of paper centred at (x,y) with faint text lines. opts: title, seed, fill, lines, alpha
function sheet(ctx, x, y, w, h, rot = 0, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (o.scaleX !== undefined) ctx.scale(o.scaleX, 1);
  ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  // shadow
  if (o.shadow !== false) {
    ctx.fillStyle = 'rgba(14,42,82,0.13)';
    rrect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 6);
    ctx.fill();
  }
  ctx.fillStyle = o.fill || C.sheet;
  ctx.strokeStyle = o.stroke || C.ink;
  ctx.lineWidth = o.lw || 3;
  rrect(ctx, -w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.stroke();
  // dog-ear
  if (o.ear !== false) {
    const e = Math.min(w, h) * 0.16;
    ctx.fillStyle = C.sheetShade;
    ctx.beginPath();
    ctx.moveTo(w / 2 - e, -h / 2);
    ctx.lineTo(w / 2, -h / 2 + e);
    ctx.lineTo(w / 2 - e, -h / 2 + e);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  const pad = Math.max(10, w * 0.12);
  let yy = -h / 2 + pad;
  if (o.title) {
    ctx.fillStyle = o.titleColor || C.ink;
    const fs = o.titleSize || Math.max(12, Math.min(w * 0.12, 30));
    ctx.font = F.sans(800, fs);
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(o.title, -w / 2 + pad, yy);
    yy += fs * 1.5;
  }
  const r = rng(o.seed || 7);
  const lines = o.lines === undefined ? 6 : o.lines;
  ctx.strokeStyle = o.lineColor || C.line;
  ctx.lineWidth = Math.max(2, h * 0.018);
  ctx.lineCap = 'round';
  const step = Math.max(10, (h - pad - (yy + h / 2)) / (lines + 0.5));
  for (let i = 0; i < lines && yy < h / 2 - pad * 0.7; i++) {
    const len = (w - pad * 2) * (0.55 + r() * 0.45);
    ctx.beginPath();
    ctx.moveTo(-w / 2 + pad, yy);
    ctx.lineTo(-w / 2 + pad + len, yy);
    ctx.stroke();
    yy += step;
  }
  if (o.stamp) {
    ctx.strokeStyle = C.goldDeep;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w / 2 - pad - 14, h / 2 - pad - 14, 16, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

// Case folder (closed) centred at x,y
function folder(ctx, x, y, w, h, rot, color, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= o.alpha === undefined ? 1 : o.alpha;
  ctx.fillStyle = 'rgba(14,42,82,0.14)';
  rrect(ctx, -w / 2 + 5, -h / 2 + 7, w, h, 7);
  ctx.fill();
  // papers peeking out
  ctx.fillStyle = C.sheet;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  rrect(ctx, -w / 2 + 10, -h / 2 - 7, w - 30, h, 4);
  ctx.fill();
  ctx.stroke();
  // tab
  ctx.fillStyle = o.tab || C.gold;
  rrect(ctx, w / 2 - w * 0.3, -h / 2 - 9, w * 0.2, 14, 4);
  ctx.fill();
  ctx.stroke();
  // body
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  rrect(ctx, -w / 2, -h / 2, w, h, 7);
  ctx.fill();
  ctx.stroke();
  if (o.label) {
    ctx.fillStyle = o.labelColor || C.sheet;
    ctx.globalAlpha *= 0.95;
    rrect(ctx, -w * 0.32, -h * 0.22, w * 0.42, h * 0.44, 4);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = F.sans(800, Math.min(18, h * 0.32));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.label, -w * 0.11, 1);
  }
  ctx.restore();
}

// Question tag on a string: pill with a hole
function tag(ctx, x, y, text, sc = 1, rot = 0, alpha = 1) {
  if (sc <= 0.001 || alpha <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.globalAlpha *= alpha;
  ctx.font = F.sans(800, 34);
  const tw = ctx.measureText(text).width;
  const w = tw + 74, h = 66;
  ctx.fillStyle = 'rgba(14,42,82,0.16)';
  rrect(ctx, -w / 2 + 5, -h / 2 + 7, w, h, 16);
  ctx.fill();
  ctx.fillStyle = C.gold;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 22, -h / 2);
  ctx.lineTo(w / 2 - 14, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 14);
  ctx.lineTo(w / 2, h / 2 - 14);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 14, h / 2);
  ctx.lineTo(-w / 2 + 22, h / 2);
  ctx.lineTo(-w / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.sheet;
  ctx.beginPath(); ctx.arc(-w / 2 + 22, 0, 7, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, -w / 2 + 40, 2);
  ctx.restore();
}

function sparkle(ctx, x, y, r, rot = 0, color = C.gold) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4;
    const a2 = a + TAU / 8;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.quadraticCurveTo(0, 0, Math.cos(a2 + TAU / 8) * r, Math.sin(a2 + TAU / 8) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// The AI assistant: cyan chat bubble with a gold sparkle (echoing the store icon) + eyes.
function aiBubble(ctx, x, y, sc, t, o = {}) {
  if (sc <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(o.rot || 0);
  ctx.scale(sc, sc);
  const w = 210, h = 150;
  // glow
  const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 190);
  g.addColorStop(0, 'rgba(62,198,242,0.40)');
  g.addColorStop(1, 'rgba(62,198,242,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 190, 0, TAU); ctx.fill();
  ctx.fillStyle = C.navy;
  ctx.strokeStyle = C.cyan;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 34);
  ctx.fill();
  ctx.stroke();
  // tail (bottom-left)
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 40, h / 2 - 4);
  ctx.lineTo(-w / 2 + 34, h / 2 + 46);
  ctx.lineTo(-w / 2 + 84, h / 2 - 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 40, h / 2 + 2);
  ctx.lineTo(-w / 2 + 34, h / 2 + 46);
  ctx.lineTo(-w / 2 + 84, h / 2 + 2);
  ctx.stroke();
  ctx.fillStyle = C.navy;
  ctx.fillRect(-w / 2 + 36, h / 2 - 12, 50, 12);
  if (o.dots) {
    for (let i = 0; i < 3; i++) {
      const b = Math.max(0, Math.sin((t * 7 - i * 0.7) * 1.0)) * 14;
      ctx.fillStyle = C.cyanSoft;
      ctx.beginPath(); ctx.arc(-46 + i * 46, 10 - b, 13, 0, TAU); ctx.fill();
    }
  } else {
    sparkle(ctx, 0, 6, 46 * (1 + 0.08 * Math.sin(t * 6)), Math.sin(t * 2) * 0.15);
  }
  // eyes (peek above the sparkle)
  if (o.eyes !== false) {
    const bl = o.blink ? 0.15 : 1;
    ctx.fillStyle = C.cyanSoft;
    for (const ex of [-38, 38]) {
      ctx.beginPath(); ctx.ellipse(ex + (o.look || 0) * 8, -40, 8, 11 * bl, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

function speech(ctx, x, y, sc, text, o = {}) {
  if (sc <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.font = o.font || F.serif(900, 84);
  const w = Math.max(120, ctx.measureText(text).width + 70), h = 130;
  ctx.fillStyle = C.sheet;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 40);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, h / 2 - 3);
  ctx.lineTo(-34 * (o.tailDir || 1), h / 2 + 40);
  ctx.lineTo(18, h / 2 - 3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14, h / 2);
  ctx.lineTo(-34 * (o.tailDir || 1), h / 2 + 40);
  ctx.lineTo(18, h / 2);
  ctx.stroke();
  ctx.fillStyle = o.color || C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 6);
  ctx.restore();
}

function magnifier(ctx, x, y, r, rot, o = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // handle
  ctx.strokeStyle = C.ink;
  ctx.lineCap = 'round';
  ctx.lineWidth = r * 0.34;
  ctx.beginPath();
  ctx.moveTo(r * 0.72, r * 0.72);
  ctx.lineTo(r * 1.65, r * 1.65);
  ctx.stroke();
  ctx.strokeStyle = C.goldDeep;
  ctx.lineWidth = r * 0.2;
  ctx.beginPath();
  ctx.moveTo(r * 1.05, r * 1.05);
  ctx.lineTo(r * 1.6, r * 1.6);
  ctx.stroke();
  // glass
  ctx.fillStyle = o.glass || 'rgba(189,235,250,0.35)';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = r * 0.17;
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.09, 0, TAU); ctx.stroke();
  // glint
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = r * 0.08;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.7, Math.PI * 1.1, Math.PI * 1.4); ctx.stroke();
  ctx.restore();
}

// Simple original courthouse emblem (not the app icon) for the "official record" seal.
function emblem(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-r * 0.62, -r * 0.18); ctx.lineTo(0, -r * 0.55); ctx.lineTo(r * 0.62, -r * 0.18);
  ctx.closePath(); ctx.fill();
  for (let i = -2; i <= 2; i++) ctx.fillRect(i * r * 0.24 - r * 0.06, -r * 0.12, r * 0.12, r * 0.48);
  ctx.fillRect(-r * 0.66, r * 0.4, r * 1.32, r * 0.13);
  ctx.restore();
}

function seal(ctx, x, y, r, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.gold;
  ctx.strokeStyle = C.goldDeep;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const rr = i % 2 ? r : r * 0.9;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  emblem(ctx, 0, 0, r * 0.7, C.navy);
  ctx.restore();
}

function check(ctx, x, y, r, prog = 1, color = C.gold, bg = C.navy) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.22;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const pts = [[-r * 0.45, 0], [-r * 0.12, r * 0.32], [r * 0.5, -r * 0.35]];
  const L1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  const L2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
  const d = clamp(prog) * (L1 + L2);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  if (d <= L1) ctx.lineTo(lerp(pts[0][0], pts[1][0], d / L1), lerp(pts[0][1], pts[1][1], d / L1));
  else {
    ctx.lineTo(pts[1][0], pts[1][1]);
    const k = (d - L1) / L2;
    ctx.lineTo(lerp(pts[1][0], pts[2][0], k), lerp(pts[1][1], pts[2][1], k));
  }
  ctx.stroke();
  ctx.restore();
}

function phone(ctx, x, y, w, h, rot, screen) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = C.ink;
  rrect(ctx, -w / 2, -h / 2, w, h, w * 0.16);
  ctx.fill();
  ctx.fillStyle = C.navyDeep;
  rrect(ctx, -w / 2 + w * 0.08, -h / 2 + w * 0.1, w * 0.84, h - w * 0.2, w * 0.1);
  ctx.fill();
  if (screen) {
    ctx.save();
    rrect(ctx, -w / 2 + w * 0.08, -h / 2 + w * 0.1, w * 0.84, h - w * 0.2, w * 0.1);
    ctx.clip();
    screen(ctx, w * 0.84, h - w * 0.2);
    ctx.restore();
  }
  ctx.restore();
}

// Flag on a pole; wave in [0..1] amplitude, t time
function flag(ctx, x, y, h, unfurl, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  const fw = 120 * unfurl, fh = 76;
  if (fw > 2) {
    ctx.fillStyle = C.gold;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(4, -h + 2);
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      ctx.lineTo(4 + u * fw, -h + 2 + Math.sin(t * 9 - u * 4) * 7 * u);
    }
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      ctx.lineTo(4 + u * fw, -h + fh + Math.sin(t * 9 - u * 4) * 7 * u - u * 6);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (unfurl > 0.7) {
      ctx.globalAlpha *= clamp((unfurl - 0.7) / 0.3);
      ctx.fillStyle = C.navy;
      const cx = 4 + fw * 0.5, cy = -h + fh * 0.5 + Math.sin(t * 9 - 2) * 3.5;
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.lineWidth = 6;
      ctx.strokeStyle = C.navy;
      ctx.moveTo(-16, 0); ctx.lineTo(-4, 12); ctx.lineTo(18, -12);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Burst of short strokes around a point (impact / pop accents)
function burst(ctx, x, y, r0, r1, n, k, color = C.ink, lw = 6, rot = 0) {
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw * (1 - k * 0.6);
  ctx.lineCap = 'round';
  const a = E.outCubic(k);
  for (let i = 0; i < n; i++) {
    const ang = rot + (i / n) * TAU;
    const ra = lerp(r0, r1, a), rb = lerp(r0, r1, Math.min(1, a * 1.35 + 0.15));
    if (rb - ra < 0.5) continue;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(ang) * ra, y + Math.sin(ang) * ra);
    ctx.lineTo(x + Math.cos(ang) * rb, y + Math.sin(ang) * rb);
    ctx.stroke();
  }
  ctx.restore();
}

function dust(ctx, x, y, k, seed = 3, spread = 140, color = 'rgba(14,42,82,0.22)') {
  if (k <= 0 || k >= 1) return;
  const r = rng(seed);
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < 9; i++) {
    const dirn = r() < 0.5 ? -1 : 1;
    const dist = (0.3 + r() * 0.7) * spread * E.outCubic(k);
    const rad = (8 + r() * 16) * (1 - k);
    ctx.globalAlpha = 1 - k;
    ctx.beginPath();
    ctx.arc(x + dirn * dist, y - r() * 30 * k - 6, rad, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function stars(ctx, x, y, t, r = 60, n = 3) {
  for (let i = 0; i < n; i++) {
    const a = t * 5 + (i * TAU) / n;
    sparkle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.35, 13, t * 4, C.gold);
  }
}

// Wrapped centred text; returns list of lines
function wrap(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

module.exports = { F, rrect, sheet, folder, tag, sparkle, aiBubble, speech, magnifier, emblem, seal, check, phone, flag, burst, dust, stars, wrap };
