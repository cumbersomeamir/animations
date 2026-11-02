// Painted-texture helpers and palette (sampled from videos/aarambh/assets/icon.png).
import { createCanvas } from '@napi-rs/canvas';
import { rng, rgba, clamp } from './core.mjs';

export const P = {
  g950: '#011E18',
  g900: '#022C24',
  g850: '#033429',
  g800: '#043D32',
  g700: '#05473A', // icon field
  g600: '#0A5A49',
  g500: '#16705A',
  cloth: '#3F8F72',
  clothDark: '#2C7059',
  clothBack: '#5AA386',
  g300: '#86BFA6',
  cream: '#FBF7EE', // icon letter
  cream2: '#F1E8D6',
  cream3: '#DDCFB2',
  cream4: '#B9A887',
  gold: '#F1B444', // icon star
  goldDeep: '#C98A22',
  goldLight: '#FFD57E',
  bobbin: '#FFF6E2',
  bobbinShade: '#D8CBB0',
  skin: '#A9653D',
  skinLight: '#C98257',
  skinDark: '#7E4528',
  hair: '#22160F',
  ink: '#062B23',
  metal: '#C9D0C9',
  metalLight: '#F2F5EF',
  metalDark: '#7C8984',
  metalDeep: '#4B5753',
  blush: '#D9785A',
};

// ---- procedural textures (generated once) ----
function valueNoise(w, h, cell, seed) {
  const r = rng(seed);
  const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2;
  const g = new Float32Array(gw * gh).map(() => r());
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const gy = y / cell, iy = Math.floor(gy), fy = gy - iy, sy = fy * fy * (3 - 2 * fy);
    for (let x = 0; x < w; x++) {
      const gx = x / cell, ix = Math.floor(gx), fx = gx - ix, sx = fx * fx * (3 - 2 * fx);
      const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
      out[y * w + x] = (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
    }
  }
  return out;
}

// Grain tile: grey noise with mid 128, for overlay / soft-light
export function makeGrain(size = 512, seed = 7, strength = 1) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const n1 = valueNoise(size, size, 3, seed);
  const n2 = valueNoise(size, size, 22, seed + 1);
  const r = rng(seed + 2);
  for (let i = 0; i < size * size; i++) {
    const v = 128 + ((n1[i] - 0.5) * 60 + (n2[i] - 0.5) * 50 + (r() - 0.5) * 26) * strength;
    const q = clamp(Math.round(v), 0, 255);
    img.data[i * 4] = q; img.data[i * 4 + 1] = q; img.data[i * 4 + 2] = q; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// Brush-stroke layer: many soft translucent strokes of given colours
export function makeBrushLayer(w, h, seed, colors, count = 900, len = [40, 160], width = [6, 26], alpha = [0.03, 0.09], angle = null) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  const r = rng(seed);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * w, y = r() * h;
    const a = angle === null ? r() * Math.PI : angle + (r() - 0.5) * 0.5;
    const L = len[0] + r() * (len[1] - len[0]);
    const bend = (r() - 0.5) * L * 0.35;
    const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L;
    const mx = (x + x2) / 2 - Math.sin(a) * bend, my = (y + y2) / 2 + Math.cos(a) * bend;
    ctx.strokeStyle = rgba(colors[Math.floor(r() * colors.length)], alpha[0] + r() * (alpha[1] - alpha[0]));
    ctx.lineWidth = width[0] + r() * (width[1] - width[0]);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
  }
  return c;
}

// Woven cloth tile
export function makeWeave(size = 64, base = P.cloth, seed = 3) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0, 0, size, size);
  const r = rng(seed);
  const step = 8;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const over = ((x + y) / step) % 2 === 0;
      ctx.fillStyle = over ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
      ctx.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.05})`;
      ctx.fillRect(x + (over ? 1 : 3), y + (over ? 3 : 1), over ? step - 2 : 2, over ? 2 : step - 2);
    }
  }
  return c;
}

// Fill a path with a painted look: base + texture + directional shading
export function paintFill(ctx, pathFn, o) {
  ctx.save();
  pathFn(ctx);
  ctx.fillStyle = o.base;
  ctx.fill();
  ctx.clip();
  const b = o.bounds; // [x,y,w,h]
  if (o.light || o.dark) {
    const ang = o.lightAngle ?? -2.3; // light from top-left
    const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2, rr = Math.hypot(b[2], b[3]) / 2;
    const gx = Math.cos(ang) * rr, gy = Math.sin(ang) * rr;
    const g = ctx.createLinearGradient(cx + gx, cy + gy, cx - gx, cy - gy);
    g.addColorStop(0, o.light ? rgba(o.light, o.lightA ?? 0.55) : 'rgba(0,0,0,0)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, o.dark ? rgba(o.dark, o.darkA ?? 0.45) : 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(b[0] - 4, b[1] - 4, b[2] + 8, b[3] + 8);
  }
  if (o.tex) {
    ctx.globalAlpha = o.texA ?? 0.25;
    ctx.globalCompositeOperation = o.texOp ?? 'soft-light';
    const pat = ctx.createPattern(o.tex, 'repeat');
    ctx.fillStyle = pat;
    ctx.fillRect(b[0] - 4, b[1] - 4, b[2] + 8, b[3] + 8);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
  if (o.rim) {
    // inner rim light along top edge
    ctx.lineWidth = o.rimW ?? 6;
    ctx.strokeStyle = rgba(o.rim, o.rimA ?? 0.35);
    ctx.translate(0, o.rimOff ?? 3);
    pathFn(ctx);
    ctx.stroke();
  }
  ctx.restore();
  if (o.stroke) {
    ctx.save();
    pathFn(ctx);
    ctx.lineJoin = 'round';
    ctx.lineWidth = o.strokeW ?? 4;
    ctx.strokeStyle = o.stroke;
    ctx.stroke();
    ctx.restore();
  }
}

export function rrect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Soft contact shadow ellipse
export function softShadow(ctx, x, y, rx, ry, a = 0.35, color = '#000000') {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.translate(-x, -y);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, rx, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Four-point star (the icon's sparkle motif)
export function star4(ctx, x, y, r, rot = 0, pinch = 0.28) {
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = rot + (i * Math.PI) / 2 - Math.PI / 2;
    const a2 = a + Math.PI / 4;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    const qx = x + Math.cos(a2) * r * pinch, qy = y + Math.sin(a2) * r * pinch;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.quadraticCurveTo(x + Math.cos(a - Math.PI / 4) * r * pinch * 0.6, y + Math.sin(a - Math.PI / 4) * r * pinch * 0.6, px, py);
    ctx.quadraticCurveTo(x + Math.cos(a2) * r * pinch * 0.6, y + Math.sin(a2) * r * pinch * 0.6, qx, qy);
  }
  ctx.closePath();
}

// Draw a thread along a polyline/curve given as array of points, with twist dashes
export function thread(ctx, pts, o) {
  if (pts.length < 2) return;
  const w = o.w ?? 9;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    if (o.smooth !== false && pts.length > 2) {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
      }
      const l = pts[pts.length - 1];
      ctx.lineTo(l[0], l[1]);
    } else {
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    }
  };
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.globalAlpha = o.alpha ?? 1;
  path(); ctx.strokeStyle = o.edge; ctx.lineWidth = w + (o.edgeW ?? 4); ctx.stroke();
  path(); ctx.strokeStyle = o.color; ctx.lineWidth = w; ctx.stroke();
  if (o.twist !== false) {
    path(); ctx.strokeStyle = o.twistColor ?? 'rgba(0,0,0,0.18)'; ctx.lineWidth = w * 0.55;
    ctx.setLineDash([w * 0.55, w * 0.9]); ctx.lineDashOffset = -(o.flow ?? 0); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.translate(-w * 0.18, -w * 0.18);
  path(); ctx.strokeStyle = o.hi ?? 'rgba(255,255,255,0.45)'; ctx.lineWidth = Math.max(1.5, w * 0.25); ctx.stroke();
  ctx.restore();
}
