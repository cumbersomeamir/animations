// Cut-paper craft primitives for the "Pop-up Counting Storybook" style.
// Hand-cut edges (deterministic jitter), paper grain, white cut margins, offset layer shadows,
// dashed score lines and brass split pins. All sprites are cached offscreen canvases.
import { createCanvas } from '@napi-rs/canvas';
import { rng, D2R } from './util.mjs';

export const C = {
  deep: '#160A64', violet: '#390CD6', purple: '#911FF9', lilac: '#D198FA', orange: '#F86F03', yellow: '#F9E30E', cyan: '#06F2F9',
  cream: '#FFF6E6', paper: '#F7E7C9', kraft: '#D9A867', kraftDk: '#B9863F', kraftLt: '#EBC58C', ink: '#2A1650',
  apple: '#E5463B', appleDk: '#B52F2A', appleHi: '#FF8A73', leaf: '#4FA34A', leafDk: '#2F7A34',
  wall: '#F6EEF7', wall2: '#EBDDF1', wood: '#EBCB9E', wood2: '#DDB27E', brass: '#D9A93B', brassDk: '#9C7420',
};
export const FONT = 'Fredoka';

// ------------------------------------------------------------------ grain
let grainTile = null;
export function grain() {
  if (grainTile) return grainTile;
  const n = 192, c = createCanvas(n, n), x = c.getContext('2d');
  const img = x.createImageData(n, n);
  const r = rng(99);
  for (let i = 0; i < n * n; i++) {
    const v = 128 + (r() - 0.5) * 90 + (r() < 0.02 ? -70 : 0);
    img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  // a few paper fibres
  x.strokeStyle = 'rgba(90,70,50,0.35)';
  x.lineWidth = 0.8;
  for (let i = 0; i < 26; i++) {
    const px = r() * n, py = r() * n, a = r() * Math.PI;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * 6 + 3, py + Math.sin(a) * 6, px + Math.cos(a) * 12, py + Math.sin(a) * 12); x.stroke();
  }
  grainTile = c;
  return c;
}
/** overlay grain inside the current path/clip region */
export function applyGrain(ctx, x, y, w, h, alpha = 0.07, mode = 'multiply') {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = mode;
  ctx.fillStyle = ctx.createPattern(grain(), 'repeat');
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ------------------------------------------------------------------ hand-cut shapes
/** polygon with every edge subdivided and jittered perpendicular -> hand-cut look */
export function cutPoly(pts, seed = 1, amp = 1.6, step = 14, closed = true) {
  const r = rng(seed);
  const out = [];
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const segs = Math.max(1, Math.round(len / step));
    const nx = -dy / (len || 1), ny = dx / (len || 1);
    for (let s = 0; s < segs; s++) {
      const t = s / segs;
      const j = s === 0 ? 0 : (r() - 0.5) * 2 * amp;
      out.push([a[0] + dx * t + nx * j, a[1] + dy * t + ny * j]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
export function cutCircle(cx, cy, rx, ry = rx, seed = 1, amp = 1.4, n = 44) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const j = 1 + (r() - 0.5) * 2 * (amp / Math.max(rx, 1));
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return pts;
}
export function roundRectPts(x, y, w, h, r, n = 6) {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return pts;
}
export function pathFrom(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
}
/**
 * Draw a cut-paper piece: optional white cut margin, fill (colour or gradient), optional
 * grain, darker hairline edge. Shadow via current ctx.shadow* settings (call withShadow).
 */
export function piece(ctx, pts, fill, opts = {}) {
  const { margin = 0, marginColor = '#FFFDF8', edge = 'rgba(40,20,60,0.25)', grainA = 0.08, bbox = null } = opts;
  // the layer shadow is cast once by the backing shape, then restored for the next piece
  const sh = [ctx.shadowColor, ctx.shadowBlur, ctx.shadowOffsetX, ctx.shadowOffsetY];
  if (margin > 0) {
    pathFrom(ctx, pts);
    ctx.lineJoin = 'round';
    ctx.lineWidth = margin * 2;
    ctx.strokeStyle = marginColor;
    ctx.stroke();
    ctx.fillStyle = marginColor;
    ctx.fill();
    // margin draws the shadow; the fill on top should not shadow again
    ctx.shadowColor = 'transparent';
  }
  pathFrom(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (grainA > 0) {
    ctx.save();
    pathFrom(ctx, pts);
    ctx.clip();
    const b = bbox || bounds(pts);
    applyGrain(ctx, b[0], b[1], b[2] - b[0], b[3] - b[1], grainA);
    ctx.restore();
  }
  if (edge) {
    pathFrom(ctx, pts);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = edge;
    ctx.stroke();
  }
  [ctx.shadowColor, ctx.shadowBlur, ctx.shadowOffsetX, ctx.shadowOffsetY] = sh;
}
export function bounds(pts) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return [a, b, c, d];
}
export function withShadow(ctx, lift = 6, alpha = 0.28, color = '60,30,70') {
  ctx.shadowColor = `rgba(${color},${alpha})`;
  ctx.shadowBlur = lift * 1.6;
  ctx.shadowOffsetX = lift * 0.35;
  ctx.shadowOffsetY = lift * 0.9;
}
export function noShadow(ctx) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
export function scoreLine(ctx, x0, y0, x1, y1, color = 'rgba(42,22,80,0.35)', w = 2) {
  ctx.save();
  ctx.setLineDash([9, 7]);
  ctx.lineWidth = w;
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}
export function splitPin(ctx, x, y, r = 5.5) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0.5, x, y, r);
  g.addColorStop(0, '#FFF1B8');
  g.addColorStop(0.5, C.brass);
  g.addColorStop(1, C.brassDk);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(80,50,10,0.6)'; ctx.stroke();
}

// ------------------------------------------------------------------ sprites
const cache = new Map();
function sprite(key, w, h, draw) {
  if (cache.has(key)) return cache.get(key);
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  draw(x);
  const s = { img: c, w, h };
  cache.set(key, s);
  return s;
}

export const APPLE_D = 60;
/** red cut-paper apple, centred in an 84x92 sprite (cx=42, cy=50) */
export function appleSprite(variant = 0) {
  return sprite(`apple${variant}`, 84, 92, (x) => {
    const cx = 42, cy = 52, R = APPLE_D / 2;
    // body: two lobes merged
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const lobe = 1 + 0.06 * Math.cos(2 * a) - 0.1 * Math.max(0, -Math.sin(a)) * Math.pow(Math.abs(Math.cos(a)), 6);
      const top = a > Math.PI * 1.35 && a < Math.PI * 1.65 ? -0.12 * Math.sin((a - Math.PI * 1.35) / 0.3 * Math.PI) : 0;
      pts.push([cx + Math.cos(a) * R * lobe, cy + Math.sin(a) * R * (lobe + top) * 0.95]);
    }
    const body = cutPoly(pts, 11 + variant, 0.9, 7);
    const g = x.createRadialGradient(cx - 9, cy - 10, 3, cx, cy, R * 1.1);
    g.addColorStop(0, C.appleHi);
    g.addColorStop(0.45, C.apple);
    g.addColorStop(1, C.appleDk);
    piece(x, body, g, { margin: 3, grainA: 0.1 });
    // highlight cut-out
    pathFrom(x, cutCircle(cx - 11, cy - 12, 6, 9, 3 + variant, 0.5, 16));
    x.fillStyle = 'rgba(255,240,230,0.75)';
    x.fill();
    // stem + leaf
    x.lineCap = 'round';
    x.strokeStyle = '#6B3B1C';
    x.lineWidth = 4;
    x.beginPath(); x.moveTo(cx, cy - R * 0.78); x.quadraticCurveTo(cx + 1, cy - R - 6, cx + 4, cy - R - 12); x.stroke();
    const leaf = cutPoly([[cx + 4, cy - R - 6], [cx + 16, cy - R - 16], [cx + 28, cy - R - 12], [cx + 16, cy - R - 3]], 5 + variant, 0.6, 6);
    piece(x, leaf, C.leaf, { margin: 2, grainA: 0.05 });
    x.strokeStyle = C.leafDk; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(cx + 6, cy - R - 7); x.lineTo(cx + 24, cy - R - 12); x.stroke();
  });
}

/** woven kraft basket: back (rim behind apples) and front (body in front of apples) */
export function basketSprites(w = 200, h = 150) {
  const back = sprite(`bb${w}`, w + 30, h + 40, (x) => {
    const ox = 15, oy = 14;
    const pts = cutPoly([[ox + 6, oy + 26], [ox + w - 6, oy + 26], [ox + w - 2, oy + 44], [ox + 2, oy + 44]], 41, 1.0, 10);
    piece(x, pts, C.kraftDk, { margin: 0, grainA: 0.12 });
    // handle arch
    x.lineCap = 'round';
    x.strokeStyle = '#FFFDF8'; x.lineWidth = 15;
    x.beginPath(); x.arc(ox + w / 2, oy + 40, w * 0.38, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    x.strokeStyle = C.kraft; x.lineWidth = 10;
    x.beginPath(); x.arc(ox + w / 2, oy + 40, w * 0.38, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    x.strokeStyle = C.kraftDk; x.lineWidth = 2; x.setLineDash([6, 6]);
    x.beginPath(); x.arc(ox + w / 2, oy + 40, w * 0.38, Math.PI * 1.08, Math.PI * 1.92); x.stroke();
  });
  const front = sprite(`bf${w}`, w + 30, h + 40, (x) => {
    const ox = 15, oy = 14;
    const pts = cutPoly([[ox, oy + 40], [ox + w, oy + 40], [ox + w - 16, oy + h], [ox + 16, oy + h]], 43, 1.3, 10);
    const g = x.createLinearGradient(0, oy + 40, 0, oy + h);
    g.addColorStop(0, C.kraftLt); g.addColorStop(1, C.kraft);
    piece(x, pts, g, { margin: 3, grainA: 0.12 });
    x.save(); pathFrom(x, pts); x.clip();
    // weave
    x.strokeStyle = 'rgba(150,100,45,0.55)'; x.lineWidth = 2;
    for (let yy = oy + 58; yy < oy + h; yy += 16) { x.beginPath(); x.moveTo(ox, yy); x.lineTo(ox + w, yy); x.stroke(); }
    for (let r = 0; r < 8; r++) for (let xx = ox + 10 + (r % 2) * 11; xx < ox + w; xx += 22) {
      const yy = oy + 44 + r * 16;
      x.fillStyle = 'rgba(255,240,205,0.35)';
      x.fillRect(xx, yy, 11, 14);
    }
    // violet band (TableVerse accent)
    x.fillStyle = C.violet; x.fillRect(ox, oy + 72, w, 16);
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(ox, oy + 72, w, 4);
    x.restore();
    // rim roll
    const rim = cutPoly([[ox - 4, oy + 32], [ox + w + 4, oy + 32], [ox + w + 4, oy + 46], [ox - 4, oy + 46]], 45, 1.0, 10);
    piece(x, rim, C.kraftLt, { margin: 2, grainA: 0.1 });
    x.strokeStyle = 'rgba(150,100,45,0.6)'; x.lineWidth = 2;
    for (let xx = ox; xx < ox + w; xx += 14) { x.beginPath(); x.moveTo(xx, oy + 33); x.lineTo(xx + 8, oy + 45); x.stroke(); }
  });
  return { back, front, ox: 15, oy: 14, w, h };
}

/** long pie/loaf tin for a row of four apples */
export function tinSprites(w = 262, h = 92) {
  const back = sprite(`tb${w}`, w + 30, h + 40, (x) => {
    const ox = 15, oy = 14;
    const pts = cutPoly(roundRectPts(ox + 4, oy + 6, w - 8, 30, 14), 61, 0.9, 10);
    piece(x, pts, '#7E68B8', { grainA: 0.1 });
  });
  const front = sprite(`tf${w}`, w + 30, h + 40, (x) => {
    const ox = 15, oy = 14;
    const pts = cutPoly([[ox, oy + 26], [ox + w, oy + 26], [ox + w - 18, oy + h], [ox + 18, oy + h]], 63, 1.2, 10);
    const g = x.createLinearGradient(0, oy + 26, 0, oy + h);
    g.addColorStop(0, C.lilac); g.addColorStop(1, C.purple);
    piece(x, pts, g, { margin: 3, grainA: 0.1 });
    x.save(); pathFrom(x, pts); x.clip();
    x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 3;
    for (let i = 0; i < 9; i++) { const xx = ox + 22 + i * ((w - 44) / 8); x.beginPath(); x.moveTo(xx, oy + 40); x.lineTo(xx - 4, oy + h - 8); x.stroke(); }
    x.restore();
    const rim = cutPoly([[ox - 4, oy + 20], [ox + w + 4, oy + 20], [ox + w + 4, oy + 33], [ox - 4, oy + 33]], 65, 0.9, 10);
    piece(x, rim, '#EADCFB', { margin: 2, grainA: 0.08 });
  });
  return { back, front, ox: 15, oy: 14, w, h };
}

export function crateSprites(w = 330, h = 100) {
  const front = sprite(`cf${w}`, w + 30, h + 30, (x) => {
    const ox = 15, oy = 10;
    for (let k = 0; k < 3; k++) {
      const pts = cutPoly([[ox, oy + k * 32], [ox + w, oy + k * 32], [ox + w, oy + k * 32 + 28], [ox, oy + k * 32 + 28]], 70 + k, 1.2, 12);
      piece(x, pts, k % 2 ? C.wood2 : C.wood, { margin: 2, grainA: 0.16 });
    }
    x.strokeStyle = 'rgba(120,80,40,0.5)'; x.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(ox + 12, oy + k * 32 + 14); x.bezierCurveTo(ox + w * 0.3, oy + k * 32 + 8, ox + w * 0.6, oy + k * 32 + 20, ox + w - 12, oy + k * 32 + 13); x.stroke(); }
    for (const px of [ox + 14, ox + w - 14]) for (let k = 0; k < 3; k++) splitPin(x, px, oy + k * 32 + 14, 4);
  });
  const back = sprite(`cb${w}`, w + 30, h + 30, (x) => {
    const ox = 15, oy = 10;
    const pts = cutPoly([[ox + 8, oy - 4], [ox + w - 8, oy - 4], [ox + w - 8, oy + 20], [ox + 8, oy + 20]], 75, 1, 12);
    piece(x, pts, C.wood2, { grainA: 0.14 });
  });
  return { front, back, ox: 15, oy: 10, w, h };
}

export function drawSprite(ctx, s, x, y, opts = {}) {
  // (x, y) = where the sprite's top-left lands
  ctx.drawImage(s.img, x, y);
}

/** soft sparkle star (paper confetti-like) */
export function sparkle(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** paper label text: dark ink on a cut-paper strip */
export function label(ctx, text, x, y, size, opts = {}) {
  const { fill = C.ink, weight = 700, align = 'center' } = opts;
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}
export function measure(ctx, text, size, weight = 700) {
  ctx.save();
  ctx.font = `${weight} ${size}px ${FONT}`;
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}
export { D2R };

// ------------------------------------------------------------------ cupcake (counted object for english-13)
/** bold cut-paper cupcake: purple pleated wrapper, cream frosting with a lilac swirl, small yellow star.
 *  sprite 116x112, visual centre at (58, 58); ~92 px wide. */
export function cupcakeSprite() {
  return sprite('cupcake', 116, 112, (x) => {
    const cx = 58;
    // wrapper (trapezoid, pleats)
    const wrap = cutPoly([[cx - 41, 58], [cx + 41, 58], [cx + 31, 100], [cx - 31, 100]], 801, 0.8, 8);
    const g = x.createLinearGradient(0, 58, 0, 100);
    g.addColorStop(0, C.purple); g.addColorStop(1, C.violet);
    piece(x, wrap, g, { margin: 3, grainA: 0.08 });
    x.save(); pathFrom(x, wrap); x.clip();
    x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 3;
    for (let k = -3; k <= 3; k++) { x.beginPath(); x.moveTo(cx + k * 12, 60); x.lineTo(cx + k * 9, 100); x.stroke(); }
    x.restore();
    // frosting: three soft lobes + top dome
    const lobes = [];
    const add = (px, py, r, n = 18) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; lobes.push([px + Math.cos(a) * r, py + Math.sin(a) * r]); } };
    const fr = (px, py, r, seed) => cutCircle(px, py, r, r * 0.92, seed, 0.7, 26);
    x.save(); withShadow(x, 4, 0.22);
    piece(x, fr(cx - 24, 56, 21, 811), C.cream, { margin: 2.5, grainA: 0.05 });
    piece(x, fr(cx + 24, 56, 21, 812), C.cream, { margin: 2.5, grainA: 0.05 });
    piece(x, fr(cx, 50, 27, 813), C.cream, { margin: 2.5, grainA: 0.05 });
    piece(x, fr(cx, 30, 19, 814), C.cream, { margin: 2.5, grainA: 0.05 });
    x.restore();
    // swirl
    x.strokeStyle = C.lilac; x.lineWidth = 4.5; x.lineCap = 'round';
    x.beginPath(); x.moveTo(cx - 36, 58); x.quadraticCurveTo(cx, 70, cx + 36, 56); x.stroke();
    x.beginPath(); x.moveTo(cx - 20, 42); x.quadraticCurveTo(cx + 2, 50, cx + 22, 38); x.stroke();
    // star topper
    x.save(); withShadow(x, 3, 0.25);
    const star = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5; const r = i % 2 ? 6 : 13; star.push([cx + Math.cos(a) * r, 14 + Math.sin(a) * r]); }
    piece(x, star, C.yellow, { margin: 2, grainA: 0.03, edge: 'rgba(120,80,0,0.4)' });
    x.restore();
  });
}
