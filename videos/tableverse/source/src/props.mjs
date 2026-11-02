// Props, effects and typography. All functions are deterministic in (frame, seed).
import { createCanvas } from '@napi-rs/canvas';
import { PAL } from './palette.mjs';
import { E, clamp, lerp, rng, D2R, prog } from './util.mjs';
import { W, H } from './timeline.mjs';

export const FONT = 'Fredoka';

// ------------------------------------------------------------------ ground / background
export const PLANET = { cx: 540, cy: 1650 + 2200, r: 2200 };
export function groundY(x) {
  const dx = x - PLANET.cx;
  return PLANET.cy - Math.sqrt(PLANET.r * PLANET.r - dx * dx);
}

let bgCache = null;
function bgStars() {
  if (bgCache) return bgCache;
  const r = rng(7);
  const stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({ x: r() * W, y: r() * 1700, s: 0.6 + r() * 2.2, ph: r() * 6.28, sp: 0.04 + r() * 0.08, depth: 0.2 + r() * 0.5 });
  }
  const twinklers = [];
  for (let i = 0; i < 9; i++) twinklers.push({ x: 60 + r() * 960, y: 120 + r() * 1300, s: 10 + r() * 10, ph: r() * 6.28 });
  bgCache = { stars, twinklers };
  return bgCache;
}

export function drawBackground(ctx, f, cam) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.bgTop);
  g.addColorStop(0.55, PAL.bgMid);
  g.addColorStop(1, PAL.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // soft nebula blobs
  const blobs = [
    [180, 420, 420, 'rgba(123,63,228,0.22)'],
    [900, 900, 480, 'rgba(56,214,232,0.10)'],
    [520, 1350, 520, 'rgba(255,138,31,0.07)'],
  ];
  for (const [x, y, r, c] of blobs) {
    const rg = ctx.createRadialGradient(x, y + Math.sin(f * 0.01) * 10, 0, x, y, r);
    rg.addColorStop(0, c);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  const { stars, twinklers } = bgStars();
  for (const s of stars) {
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f * s.sp + s.ph));
    const x = s.x - (cam?.x || 0) * s.depth * 0.3;
    const y = s.y - (cam?.y || 0) * s.depth * 0.3;
    ctx.fillStyle = `rgba(255,246,220,${a * 0.8})`;
    ctx.beginPath();
    ctx.arc(x, y, s.s, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const t of twinklers) {
    const a = 0.5 + 0.5 * Math.sin(f * 0.09 + t.ph);
    sparkle(ctx, t.x, t.y, t.s * (0.6 + 0.4 * a), `rgba(255,227,138,${0.35 + 0.5 * a})`);
  }
}

export function drawPlanet(ctx, f) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 1640, 0, H);
  g.addColorStop(0, PAL.planetA);
  g.addColorStop(1, PAL.planetB);
  ctx.beginPath();
  ctx.arc(PLANET.cx, PLANET.cy, PLANET.r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.clip();
  // craters
  const cr = [
    [170, 1760, 70, 16],
    [470, 1820, 110, 22],
    [860, 1745, 80, 15],
    [700, 1880, 60, 12],
    [90, 1880, 50, 10],
  ];
  for (const [x, y, rx, ry] of cr) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(20,8,60,0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 3, rx * 0.92, ry * 0.7, 0, Math.PI, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
  // rim light
  ctx.beginPath();
  ctx.arc(PLANET.cx, PLANET.cy, PLANET.r, Math.PI * 1.25, Math.PI * 1.75);
  ctx.strokeStyle = 'rgba(56,214,232,0.85)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(PLANET.cx, PLANET.cy, PLANET.r + 10, Math.PI * 1.25, Math.PI * 1.75);
  ctx.strokeStyle = 'rgba(56,214,232,0.18)';
  ctx.lineWidth = 16;
  ctx.stroke();
}

// ------------------------------------------------------------------ small shapes
export function starPath(ctx, x, y, R, r, rot = 0, n = 5) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = rot * D2R - Math.PI / 2 + (i * Math.PI) / n;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function sparkle(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(0, 0, s, 0);
  ctx.quadraticCurveTo(0, 0, 0, s);
  ctx.quadraticCurveTo(0, 0, -s, 0);
  ctx.quadraticCurveTo(0, 0, 0, -s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ------------------------------------------------------------------ star tokens (the 56 stars)
/** state: 0 = asleep/dim, 1 = lit. pop = 0..1 scale pop. */
export function drawStarToken(ctx, x, y, R, lit, pop = 0, rot = 0, sleepy = 0, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  const s = 1 + 0.45 * Math.sin(Math.PI * clamp(pop));
  if (lit > 0.01) {
    const gr = ctx.createRadialGradient(x, y, 0, x, y, R * 2.3 * s);
    gr.addColorStop(0, `rgba(255,214,102,${0.55 * lit})`);
    gr.addColorStop(1, 'rgba(255,214,102,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(x, y, R * 2.3 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  starPath(ctx, x, y, R * s, R * 0.47 * s, rot);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = lit > 0.5 ? PAL.ink : `rgba(190,175,255,${0.45})`;
  ctx.stroke();
  // dim fill -> lit fill
  const dim = [92, 74, 170], on = [246, 197, 85];
  const c = dim.map((d, i) => Math.round(lerp(d, on[i], lit)));
  ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${lerp(0.55, 1, lit)})`;
  ctx.fill();
  if (lit > 0.5) {
    starPath(ctx, x - R * 0.12, y - R * 0.16, R * 0.45 * s, R * 0.2 * s, rot);
    ctx.fillStyle = `rgba(255,248,210,${0.7 * lit})`;
    ctx.fill();
  }
  if (sleepy > 0.01) {
    // closed sleepy eyes
    ctx.strokeStyle = `rgba(30,18,90,${0.8 * sleepy})`;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(x + sx * R * 0.24, y - R * 0.02, R * 0.13, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ------------------------------------------------------------------ number blocks
const blockCache = new Map();
export function blockImage(label, w, h) {
  const key = `${label}|${w}|${h}`;
  if (blockCache.has(key)) return blockCache.get(key);
  const pad = 16, depth = 18;
  const c = createCanvas(w + pad * 2, h + pad * 2 + depth);
  const x = c.getContext('2d');
  const r = Math.min(34, h * 0.22);
  // depth
  roundRect(x, pad, pad + depth, w, h, r);
  x.fillStyle = '#B9771A';
  x.fill();
  x.lineWidth = 7;
  x.strokeStyle = PAL.ink;
  x.stroke();
  // face
  roundRect(x, pad, pad, w, h, r);
  const g = x.createLinearGradient(0, pad, 0, pad + h);
  g.addColorStop(0, PAL.yellowHi);
  g.addColorStop(0.55, PAL.yellow);
  g.addColorStop(1, PAL.yellowLo);
  x.fillStyle = g;
  x.fill();
  x.stroke();
  // gloss
  roundRect(x, pad + 14, pad + 10, w - 28, h * 0.2, h * 0.1);
  x.fillStyle = 'rgba(255,255,255,0.38)';
  x.fill();
  // label
  x.font = `700 ${Math.round(h * 0.6)}px ${FONT}`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = PAL.text;
  x.fillText(label, pad + w / 2, pad + h / 2 + h * 0.04);
  const out = { img: c, w, h, pad, depth };
  blockCache.set(key, out);
  return out;
}

/** draw block centred at (x,y) of its face, with squash sx/sy around its bottom edge */
export function drawBlock(ctx, label, w, h, x, y, rot = 0, sx = 1, sy = 1, alpha = 1) {
  const b = blockImage(label, w, h);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y + h / 2 + b.depth);
  ctx.rotate(rot * D2R);
  ctx.scale(sx, sy);
  ctx.drawImage(b.img, -w / 2 - b.pad, -h - b.pad - b.depth);
  ctx.restore();
}

const shardCache = new Map();
function makeShards(seed, w, h, cols, rows) {
  const key = `${seed}|${w}|${h}|${cols}|${rows}`;
  if (shardCache.has(key)) return shardCache.get(key);
  const r = rng(seed);
  const pts = [];
  for (let j = 0; j <= rows; j++) {
    const row = [];
    for (let i = 0; i <= cols; i++) {
      const edgeX = i === 0 || i === cols, edgeY = j === 0 || j === rows;
      const jx = edgeX ? 0 : (r() - 0.5) * (w / cols) * 0.6;
      const jy = edgeY ? 0 : (r() - 0.5) * (h / rows) * 0.6;
      row.push([(i * w) / cols + jx, (j * h) / rows + jy]);
    }
    pts.push(row);
  }
  const tris = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const a = pts[j][i], b = pts[j][i + 1], c = pts[j + 1][i + 1], d = pts[j + 1][i];
      const flip = r() > 0.5;
      const t1 = flip ? [a, b, c] : [a, b, d];
      const t2 = flip ? [a, c, d] : [b, c, d];
      for (const t of [t1, t2]) {
        const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
        tris.push({ pts: t, cx, cy, rv: r(), rv2: r(), rv3: r() });
      }
    }
  shardCache.set(key, tris);
  return tris;
}

/**
 * Shatter an image (canvas) whose top-left is at (ox, oy). Impact at (ix, iy) in world coords.
 * t = frames since impact.
 */
export function drawShatter(ctx, img, ox, oy, w, h, ix, iy, t, opts = {}) {
  if (t < 0) return;
  const { seed = 1, cols = 4, rows = 3, power = 16, gravity = 1.15, life = 34, upBias = 6, spin = 14 } = opts;
  const tris = makeShards(seed, w, h, cols, rows);
  for (const s of tris) {
    const wx = ox + s.cx, wy = oy + s.cy;
    let dx = wx - ix, dy = wy - iy;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    const sp = power * (0.55 + s.rv * 0.9);
    const vx = dx * sp + (s.rv2 - 0.5) * 6;
    const vy = dy * sp - upBias * (0.5 + s.rv3);
    const px = wx + vx * t;
    const py = wy + vy * t + 0.5 * gravity * t * t;
    const ang = (s.rv - 0.5) * spin * t * D2R * 1.6;
    const a = 1 - clamp((t - life * 0.6) / (life * 0.4));
    if (a <= 0) continue;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0] - s.cx, s.pts[0][1] - s.cy);
    ctx.lineTo(s.pts[1][0] - s.cx, s.pts[1][1] - s.cy);
    ctx.lineTo(s.pts[2][0] - s.cx, s.pts[2][1] - s.cy);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.drawImage(img, -s.cx - (opts.imgPad || 0), -s.cy - (opts.imgPad || 0));
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = opts.edge || 'rgba(20,12,58,0.9)';
    ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ ice
let iceCache = null;
export const ICE = { w: 250, h: 340 };
export function iceImage() {
  if (iceCache) return iceCache;
  const pad = 10;
  const c = createCanvas(ICE.w + pad * 2, ICE.h + pad * 2);
  const x = c.getContext('2d');
  const r = rng(42);
  // faceted outline
  const poly = [];
  const n = 18;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rx = ICE.w / 2 - r() * 10, ry = ICE.h / 2 - r() * 12;
    const px = Math.cos(a) * rx, py = Math.sin(a) * ry;
    // squarer shape
    const k = 0.62;
    poly.push([
      pad + ICE.w / 2 + Math.sign(px) * Math.pow(Math.abs(px) / (ICE.w / 2), k) * (ICE.w / 2 - 6),
      pad + ICE.h / 2 + Math.sign(py) * Math.pow(Math.abs(py) / (ICE.h / 2), k) * (ICE.h / 2 - 6),
    ]);
  }
  x.beginPath();
  poly.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
  x.closePath();
  const g = x.createLinearGradient(0, 0, ICE.w, ICE.h);
  g.addColorStop(0, 'rgba(210,248,255,0.62)');
  g.addColorStop(0.5, 'rgba(140,215,255,0.42)');
  g.addColorStop(1, 'rgba(110,180,255,0.55)');
  x.fillStyle = g;
  x.fill();
  x.lineWidth = 6;
  x.strokeStyle = 'rgba(235,252,255,0.95)';
  x.stroke();
  x.save();
  x.clip();
  // facets
  for (let i = 0; i < 9; i++) {
    x.beginPath();
    const x0 = pad + r() * ICE.w, y0 = pad + r() * ICE.h;
    x.moveTo(x0, y0);
    x.lineTo(x0 + (r() - 0.5) * 120, y0 + (r() - 0.5) * 160);
    x.lineTo(x0 + (r() - 0.5) * 120, y0 + (r() - 0.5) * 160);
    x.closePath();
    x.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.1})`;
    x.fill();
  }
  // highlights
  x.strokeStyle = 'rgba(255,255,255,0.75)';
  x.lineCap = 'round';
  x.lineWidth = 9;
  x.beginPath();
  x.moveTo(pad + 40, pad + 70);
  x.lineTo(pad + 70, pad + 30);
  x.stroke();
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(pad + 36, pad + 110);
  x.lineTo(pad + 52, pad + 88);
  x.stroke();
  x.restore();
  iceCache = { img: c, pad };
  return iceCache;
}

/** frost creeping upward: grow 0..1 */
export function drawIce(ctx, cx, bottom, grow, f, opts = {}) {
  if (grow <= 0) return;
  const { img, pad } = iceImage();
  const top = bottom - ICE.h - pad;
  const left = cx - ICE.w / 2 - pad;
  const level = bottom + pad - (ICE.h + pad * 2) * grow;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left - 20, bottom + 40);
  ctx.lineTo(left + ICE.w + pad * 2 + 20, bottom + 40);
  const teeth = 9;
  for (let i = teeth; i >= 0; i--) {
    const x = left - 20 + ((ICE.w + pad * 2 + 40) * i) / teeth;
    const jag = grow < 1 ? (i % 2 ? -22 : 8) * (1 - grow * 0.6) : 0;
    ctx.lineTo(x, level + jag);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, left, top);
  // sheen sweep
  if (opts.sheen !== undefined && opts.sheen > 0 && opts.sheen < 1) {
    const sx = left - 120 + (ICE.w + 240) * opts.sheen;
    const g = ctx.createLinearGradient(sx - 60, top, sx + 60, top + 80);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, bottom - ICE.h / 2, ICE.w / 2 - 6, ICE.h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // cracks
  if (opts.crack) {
    for (const ck of opts.crack) drawCrack(ctx, ck.x, ck.y, ck.amt, ck.seed);
  }
  ctx.restore();
}

function drawCrack(ctx, x, y, amt, seed) {
  if (amt <= 0) return;
  const r = rng(seed);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let b = 0; b < 5; b++) {
    let px = x, py = y;
    let a = Math.PI + (r() - 0.5) * 2.6;
    ctx.beginPath();
    ctx.moveTo(px, py);
    const segs = 4;
    for (let i = 0; i < segs * amt; i++) {
      const len = 16 + r() * 20;
      a += (r() - 0.5) * 0.9;
      px += Math.cos(a) * len;
      py += Math.sin(a) * len;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ trampoline
export function drawTrampoline(ctx, x, bedY, depth, alpha = 1, sink = 0) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(0, sink);
  const rx = 150, ry = 24;
  const gy = groundY(x) + 8;
  ctx.lineCap = 'round';
  // legs
  for (const lx of [-118, -50, 50, 118]) {
    ctx.beginPath();
    ctx.moveTo(x + lx, bedY + 8);
    ctx.lineTo(x + lx * 1.08, gy);
    ctx.lineWidth = 17;
    ctx.strokeStyle = PAL.ink;
    ctx.stroke();
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#8F63F0';
    ctx.stroke();
  }
  // back rim
  ctx.beginPath();
  ctx.ellipse(x, bedY, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.strokeStyle = PAL.cyan;
  ctx.stroke();
  // bed (deflects)
  ctx.beginPath();
  ctx.moveTo(x - rx + 14, bedY);
  ctx.quadraticCurveTo(x, bedY + depth * 2, x + rx - 14, bedY);
  ctx.quadraticCurveTo(x, bedY + ry * 0.9, x - rx + 14, bedY);
  ctx.fillStyle = '#1A0F45';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  // springs
  ctx.strokeStyle = 'rgba(220,230,255,0.75)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const sx = x - rx + 18 + t * (rx * 2 - 36);
    const dd = depth * 2 * 4 * t * (1 - t) * 0.5;
    ctx.beginPath();
    ctx.moveTo(sx, bedY - 2);
    ctx.lineTo(sx, bedY + dd);
    ctx.stroke();
  }
  // front rim
  ctx.beginPath();
  ctx.ellipse(x, bedY, rx, ry, 0, 0, Math.PI);
  ctx.lineWidth = 16;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.strokeStyle = PAL.cyan;
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ particles
export function drawDust(ctx, x, y, t, seed = 3, n = 10, spread = 1) {
  if (t < 0 || t > 30) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const sp = (3 + r() * 7) * spread;
    const px = x + side * (20 + sp * t * (1 - t / 60));
    const py = y - (r() * 3 + 1.5) * t * (1 - t / 40);
    const rad = (10 + r() * 16) * (0.6 + t / 20);
    const a = 0.55 * (1 - t / 30);
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,185,255,${a})`;
    ctx.fill();
  }
}

const CONF_COLORS = [PAL.yellow, PAL.orange, PAL.cyan, '#B48CFF', '#FFFFFF', PAL.pink];
export function drawConfetti(ctx, x, y, t, seed = 9, n = 60, power = 22) {
  if (t < 0 || t > 80) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5;
    const sp = power * (0.35 + r() * 0.75);
    const drag = Math.exp(-0.05 * t);
    const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp;
    const k = (1 - drag) / 0.05;
    const px = x + vx * k + Math.sin(t * 0.25 + i) * 10;
    const py = y + vy * k + 0.18 * t * t * 0.5 + t * 1.2;
    const rot = t * (r() - 0.5) * 0.5 + i;
    const al = 1 - clamp((t - 55) / 25);
    ctx.save();
    ctx.globalAlpha *= al;
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.scale(1, Math.abs(Math.cos(t * 0.3 + i)) + 0.15);
    ctx.fillStyle = CONF_COLORS[i % CONF_COLORS.length];
    ctx.fillRect(-7, -4, 14, 8);
    ctx.restore();
  }
}

export function drawBurstRays(ctx, x, y, t, len = 260, n = 14, color = 'rgba(255,227,138,', life = 14, seed = 5) {
  if (t < 0 || t > life) return;
  const r = rng(seed);
  const p = t / life;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.3;
    const r0 = len * (0.25 + 0.75 * E.outCubic(p)) * (0.7 + r() * 0.3);
    const r1 = r0 + len * 0.35 * (1 - p);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    ctx.lineWidth = 10 * (1 - p) + 2;
    ctx.strokeStyle = `${color}${1 - p})`;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawRing(ctx, x, y, t, maxR = 120, life = 16, color = '255,255,255', width = 8) {
  if (t < 0 || t > life) return;
  const p = t / life;
  ctx.beginPath();
  ctx.arc(x, y, maxR * E.outCubic(p), 0, Math.PI * 2);
  ctx.lineWidth = width * (1 - p) + 1;
  ctx.strokeStyle = `rgba(${color},${1 - p})`;
  ctx.stroke();
}

export function drawSparkBurst(ctx, x, y, t, seed = 4, n = 8, dist = 90, life = 22) {
  if (t < 0 || t > life) return;
  const r = rng(seed);
  const p = t / life;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r();
    const d = dist * E.outCubic(p) * (0.6 + r() * 0.5);
    const s = (12 + r() * 10) * (1 - p);
    sparkle(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, s, i % 2 ? PAL.yellowHi : '#FFFFFF');
  }
}

export function drawSnow(ctx, cx, cy, f, from, to, seed = 11) {
  if (f < from || f > to) return;
  const r = rng(seed);
  const a = clamp((f - from) / 8) * (1 - clamp((f - (to - 10)) / 10));
  for (let i = 0; i < 16; i++) {
    const ox = (r() - 0.5) * 360, oy = (r() - 0.5) * 400;
    const sp = 0.6 + r() * 1.2;
    const y = cy + ((oy + (f - from) * sp * 2) % 400) - 200;
    const x = cx + ox + Math.sin(f * 0.1 + i) * 8;
    ctx.save();
    ctx.globalAlpha *= a * 0.9;
    ctx.translate(x, y);
    ctx.rotate(f * 0.05 + i);
    ctx.strokeStyle = '#E8FBFF';
    ctx.lineWidth = 2.5;
    const s = 5 + r() * 5;
    for (let k = 0; k < 3; k++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawZzz(ctx, x, y, t, life = 60) {
  if (t < 0 || t > life) return;
  for (let i = 0; i < 3; i++) {
    const tt = t - i * 9;
    if (tt < 0) continue;
    const p = tt / (life - 18);
    if (p > 1) continue;
    const px = x + i * 26 + Math.sin(tt * 0.15) * 10;
    const py = y - tt * 2.2 - i * 10;
    ctx.save();
    ctx.globalAlpha *= Math.sin(Math.PI * clamp(p));
    ctx.font = `700 ${36 + i * 10}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 8;
    ctx.strokeStyle = PAL.ink;
    ctx.strokeText('z', px, py);
    ctx.fillStyle = '#C9BCFF';
    ctx.fillText('z', px, py);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ text
export function outlinedText(ctx, text, x, y, size, opts = {}) {
  const { fill = PAL.cream, stroke = PAL.ink, sw = Math.max(6, size * 0.14), weight = 700, align = 'center', shadow = true, grad = null } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  if (shadow) {
    ctx.fillStyle = 'rgba(8,4,30,0.55)';
    ctx.lineWidth = sw;
    ctx.strokeStyle = 'rgba(8,4,30,0.55)';
    ctx.strokeText(text, x, y + size * 0.08);
  }
  ctx.lineWidth = sw;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  if (grad) {
    const g = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
    grad.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
  } else ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function wrapLines(ctx, text, size, maxW, weight = 700) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT}`;
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  ctx.restore();
  return lines;
}

/** caption with pop-in / fade-out, y = centre of block */
export function drawCaption(ctx, text, f, fin, fout, y = 300, size = 70) {
  if (f < fin || f > fout) return;
  const pin = E.outBack(prog(fin, fin + 9, f));
  const pout = prog(fout - 7, fout, f);
  const a = clamp(prog(fin, fin + 5, f)) * (1 - pout);
  const lines = wrapLines(ctx, text, size, 900);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(W / 2, y - pout * 20);
  const sc = 0.75 + 0.25 * pin;
  ctx.scale(sc, sc);
  const lh = size * 1.12;
  lines.forEach((ln, i) => outlinedText(ctx, ln, 0, (i - (lines.length - 1) / 2) * lh, size));
  ctx.restore();
}

export { lerp };
