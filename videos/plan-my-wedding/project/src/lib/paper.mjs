// Paper-cut editorial primitives: palette, fonts, cards, notes, text, icons.
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';
import path from 'node:path';
import { rng, clamp, TAU } from './core.mjs';

export const W = 1080, H = 1920, FPS = 30, DURATION = 30;
export const GROUND = 1650;

export const C = {
  paper: '#F7F0E6',
  paperDark: '#EADFCF',
  ink: '#3A2430',
  inkSoft: '#7A6270',
  rose: '#DDA4AD', // brand reference colour from the previous brief
  roseDeep: '#C06C80',
  roseTint: '#F6DCE0',
  thread: '#B23B57',
  gold: '#E6A53C',
  goldDeep: '#C9822A',
  butter: '#F7E4B5',
  sage: '#7FA37C',
  sageTint: '#DCE8D3',
  ivory: '#FFF9F0',
  screen: '#FBEDEE',
};

const FONT_DIR = path.resolve('node_modules/@expo-google-fonts');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'fraunces/600SemiBold/Fraunces_600SemiBold.ttf'), 'Fraunces');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'fraunces/600SemiBold_Italic/Fraunces_600SemiBold_Italic.ttf'), 'Fraunces Italic');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'dm-sans/700Bold/DMSans_700Bold.ttf'), 'DM Sans');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'caveat/700Bold/Caveat_700Bold.ttf'), 'Caveat');

export const F = {
  serif: (px) => `${px}px Fraunces`,
  serifI: (px) => `${px}px "Fraunces Italic"`,
  sans: (px) => `${px}px "DM Sans"`,
  hand: (px) => `${px}px Caveat`,
};

/** Pre-rendered paper texture (static grain + soft vignette). */
export function makePaper(base = C.paper, seed = 7, vignette = 0.10) {
  const cv = createCanvas(W, H);
  const g = cv.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);
  const r = rng(seed);
  for (let i = 0; i < 26000; i++) {
    const x = r() * W, y = r() * H, s = r() * 2.2 + 0.4;
    g.fillStyle = r() < 0.5 ? `rgba(90,60,50,${0.025 + r() * 0.03})` : `rgba(255,255,255,${0.05 + r() * 0.06})`;
    g.fillRect(x, y, s, s);
  }
  // a few long fibres
  for (let i = 0; i < 160; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 10 + r() * 26;
    g.strokeStyle = `rgba(120,90,80,${0.035 + r() * 0.03})`;
    g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const vg = g.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.75);
  vg.addColorStop(0, 'rgba(58,36,48,0)');
  vg.addColorStop(1, `rgba(58,36,48,${vignette})`);
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
  return cv;
}

export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Paper card centred on (x,y). draw(ctx) renders content in local coordinates (origin = centre). */
export function card(ctx, o, draw) {
  const { x, y, w, h, r = 16, fill = C.ivory, rot = 0, sx = 1, sy = 1, alpha = 1, shadow = 1, lift = 0 } = o;
  if (alpha <= 0 || sx === 0 || sy === 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  if (shadow > 0) {
    ctx.fillStyle = `rgba(58,36,48,${0.16 * shadow})`;
    rr(ctx, -w / 2 + 5 + lift * 0.4, -h / 2 + 9 + lift, w, h, r);
    ctx.fill();
  }
  ctx.fillStyle = fill;
  rr(ctx, -w / 2, -h / 2, w, h, r);
  ctx.fill();
  if (o.edge !== false) {
    ctx.strokeStyle = 'rgba(58,36,48,0.10)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (draw) draw(ctx);
  ctx.restore();
}

/** Sticky note with tape and handwritten label. */
export function note(ctx, o) {
  const { label, color = C.butter, w = 210, h = 150 } = o;
  card(ctx, { ...o, w, h, r: 6, fill: color }, (g) => {
    // folded corner
    g.fillStyle = 'rgba(58,36,48,0.08)';
    g.beginPath(); g.moveTo(w / 2 - 34, h / 2); g.lineTo(w / 2, h / 2 - 34); g.lineTo(w / 2, h / 2); g.closePath(); g.fill();
    // tape
    g.save();
    g.rotate(-0.06);
    g.fillStyle = 'rgba(255,255,255,0.55)';
    g.fillRect(-38, -h / 2 - 14, 76, 28);
    g.restore();
    g.fillStyle = C.ink;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    fitText(g, label, F.hand, 50, w - 26);
    g.fillText(label, 0, 6);
  });
}

/** Set font so text fits maxW; returns size used. */
export function fitText(ctx, text, fontFn, size, maxW, min = 10) {
  let s = size;
  ctx.font = fontFn(s);
  while (s > min && ctx.measureText(text).width > maxW) { s -= 2; ctx.font = fontFn(s); }
  return s;
}

/** Spaced uppercase label */
export function label(ctx, text, x, y, px, color, spacing = 0.12, align = 'center') {
  ctx.font = F.sans(px);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  const chars = [...text];
  const sp = px * spacing;
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + sp; });
  return total;
}

export function line(ctx, pts, color, width, cap = 'round') {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = cap;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

export function circle(ctx, x, y, r, fill, stroke, lw) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

/** Check mark drawn with progress u (0..1) */
export function check(ctx, x, y, s, u, color = C.sage, lw = 10) {
  if (u <= 0) return;
  const p = [{ x: x - 0.5 * s, y: y }, { x: x - 0.12 * s, y: y + 0.38 * s }, { x: x + 0.6 * s, y: y - 0.45 * s }];
  const l1 = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y), l2 = Math.hypot(p[2].x - p[1].x, p[2].y - p[1].y);
  const d = u * (l1 + l2);
  const pts = [p[0]];
  if (d <= l1) pts.push({ x: p[0].x + (p[1].x - p[0].x) * (d / l1), y: p[0].y + (p[1].y - p[0].y) * (d / l1) });
  else { pts.push(p[1]); const v = (d - l1) / l2; pts.push({ x: p[1].x + (p[2].x - p[1].x) * v, y: p[1].y + (p[2].y - p[1].y) * v }); }
  line(ctx, pts, color, lw);
}

export function heart(ctx, x, y, s, fill, stroke, lw = 4) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 1.0, y - s * 0.25, x - s * 0.45, y - s * 0.95, x, y - s * 0.42);
  ctx.bezierCurveTo(x + s * 0.45, y - s * 0.95, x + s * 1.0, y - s * 0.25, x, y + s * 0.35);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}

/** Marigold flower */
export function marigold(ctx, x, y, r, rot = 0, col = C.gold, deep = C.goldDeep) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = deep;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.5, r * 0.32, a, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = col;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + 0.3;
    ctx.beginPath(); ctx.ellipse(Math.cos(a) * r * 0.3, Math.sin(a) * r * 0.3, r * 0.38, r * 0.26, a, 0, TAU); ctx.fill();
  }
  circle(ctx, 0, 0, r * 0.2, deep);
  ctx.restore();
}

/** Simple line icons, centred, size s (~ box size). */
export const icon = {
  venue(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-s * 0.42, s * 0.38); g.lineTo(-s * 0.42, -s * 0.02);
    g.arc(0, -s * 0.02, s * 0.42, Math.PI, 0); g.lineTo(s * 0.42, s * 0.38);
    g.moveTo(-s * 0.2, s * 0.38); g.lineTo(-s * 0.2, s * 0.02); g.arc(0, s * 0.02, s * 0.2, Math.PI, 0); g.lineTo(s * 0.2, s * 0.38);
    g.moveTo(-s * 0.52, s * 0.38); g.lineTo(s * 0.52, s * 0.38);
    g.stroke();
  },
  camera(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineJoin = 'round';
    rr(g, -s * 0.46, -s * 0.24, s * 0.92, s * 0.6, s * 0.1); g.stroke();
    g.beginPath(); g.moveTo(-s * 0.16, -s * 0.24); g.lineTo(-s * 0.08, -s * 0.38); g.lineTo(s * 0.12, -s * 0.38); g.lineTo(s * 0.2, -s * 0.24); g.stroke();
    circle(g, 0, s * 0.06, s * 0.17, null, col, s * 0.07);
  },
  cloche(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineCap = 'round';
    g.beginPath(); g.arc(0, s * 0.18, s * 0.38, Math.PI, 0); g.stroke();
    g.beginPath(); g.moveTo(-s * 0.5, s * 0.22); g.lineTo(s * 0.5, s * 0.22); g.stroke();
    circle(g, 0, -s * 0.26, s * 0.06, col);
  },
  flower(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07;
    for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; g.beginPath(); g.ellipse(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2 - s * 0.08, s * 0.16, s * 0.1, a, 0, TAU); g.stroke(); }
    g.beginPath(); g.moveTo(0, s * 0.12); g.quadraticCurveTo(s * 0.05, s * 0.3, 0, s * 0.46); g.stroke();
  },
  music(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineCap = 'round';
    g.beginPath(); g.arc(0, s * 0.05, s * 0.34, Math.PI, 0); g.stroke();
    rr(g, -s * 0.42, s * 0.02, s * 0.16, s * 0.3, s * 0.05); g.fillStyle = col; g.fill();
    rr(g, s * 0.26, s * 0.02, s * 0.16, s * 0.3, s * 0.05); g.fill();
  },
  mehendi(g, s, col = C.ink) {
    // stylised palm with dotted mandala
    g.strokeStyle = col; g.lineWidth = s * 0.06; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(-s * 0.22, s * 0.45); g.lineTo(-s * 0.26, -s * 0.05);
    g.lineTo(-s * 0.26, -s * 0.32); g.moveTo(-s * 0.1, -s * 0.05); g.lineTo(-s * 0.1, -s * 0.44);
    g.moveTo(s * 0.06, -s * 0.05); g.lineTo(s * 0.06, -s * 0.42); g.moveTo(s * 0.2, -s * 0.02); g.lineTo(s * 0.2, -s * 0.3);
    g.moveTo(s * 0.22, s * 0.45); g.lineTo(s * 0.24, s * 0.08); g.lineTo(s * 0.4, -s * 0.06);
    g.stroke();
    circle(g, 0, s * 0.16, s * 0.11, null, col, s * 0.04);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; circle(g, Math.cos(a) * s * 0.18, s * 0.16 + Math.sin(a) * s * 0.18, s * 0.025, col); }
  },
  people(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineCap = 'round';
    circle(g, -s * 0.16, -s * 0.16, s * 0.13, null, col, s * 0.07);
    circle(g, s * 0.2, -s * 0.12, s * 0.11, null, col, s * 0.07);
    g.beginPath(); g.arc(-s * 0.16, s * 0.34, s * 0.28, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    g.beginPath(); g.arc(s * 0.22, s * 0.34, s * 0.22, Math.PI * 1.15, Math.PI * 1.9); g.stroke();
  },
  coin(g, s, col = C.ink) {
    circle(g, 0, 0, s * 0.4, C.gold, col, s * 0.06);
    circle(g, 0, 0, s * 0.26, null, C.goldDeep, s * 0.05);
  },
  list(g, s, col = C.ink) {
    g.strokeStyle = col; g.lineWidth = s * 0.07; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const yy = -s * 0.28 + i * s * 0.28;
      rr(g, -s * 0.42, yy - s * 0.08, s * 0.16, s * 0.16, s * 0.03); g.stroke();
      g.beginPath(); g.moveTo(-s * 0.14, yy); g.lineTo(s * 0.44, yy); g.stroke();
    }
  },
};

export { clamp };
