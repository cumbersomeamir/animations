// Original vector props for the Ideaverse promo.
import { createCanvas } from '@napi-rs/canvas';
import { roundRect } from './rig.mjs';
import { lerp, clamp, rng } from './math.mjs';

export const PAL = {
  navy: '#1B2333', deep: '#121826', ink: '#1B2333', mint: '#6CDA7E', mintHi: '#9BF0AA', mintDark: '#3E9E58',
  white: '#F4F7FB', slate: '#2A3550', slate2: '#38456A',
  coral: '#FF7A6B', amber: '#FFC24B', lavender: '#A694FF', sky: '#4FC3F7', heart: '#FF6B8B',
};
export const TILE_COLORS = [PAL.coral, PAL.amber, PAL.lavender, PAL.sky];

function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function mixColor(a, b, t) {
  const A = hex(a), B = hex(b); t = clamp(t);
  const r = A.map((v, i) => Math.round(lerp(v, B[i], t)));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
}
export function rgba(c, a) { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; }

// ---------- tiles (generic tool pictograms, no third-party marks) ----------
export function drawTile(ctx, x, y, size, rot, color, icon, opt = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(opt.sx || 1, opt.sy || 1);
  ctx.globalAlpha *= opt.alpha ?? 1;
  const h = size / 2;
  // drop shadow
  ctx.fillStyle = 'rgba(8,10,20,0.35)';
  roundRect(ctx, -h + 5, -h + 8, size, size, size * 0.24); ctx.fill();
  ctx.fillStyle = color;
  roundRect(ctx, -h, -h, size, size, size * 0.24); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, -h, -h, size, size * 0.42, size * 0.24); ctx.fill();
  ctx.strokeStyle = 'rgba(15,20,35,0.35)'; ctx.lineWidth = size * 0.035;
  roundRect(ctx, -h, -h, size, size, size * 0.24); ctx.stroke();
  drawGlyph(ctx, icon, size * 0.5, opt.glyph || '#FFFFFF');
  ctx.restore();
}

function drawGlyph(ctx, icon, s, col) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.lineWidth = s * 0.14;
  const k = s / 2;
  switch (icon % 8) {
    case 0: // paintbrush
      ctx.beginPath(); ctx.moveTo(k * 0.8, -k * 0.8); ctx.lineTo(-k * 0.05, k * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-k * 0.35, k * 0.38, k * 0.36, k * 0.24, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
      break;
    case 1: // scissors
      ctx.beginPath(); ctx.arc(-k * 0.5, k * 0.55, k * 0.26, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(k * 0.5, k * 0.55, k * 0.26, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-k * 0.3, k * 0.35); ctx.lineTo(k * 0.45, -k * 0.85); ctx.moveTo(k * 0.3, k * 0.35); ctx.lineTo(-k * 0.45, -k * 0.85); ctx.stroke();
      break;
    case 2: // text "Aa"
      ctx.font = `800 ${Math.round(s * 0.95)}px InterXB`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Aa', 0, k * 0.08);
      break;
    case 3: // sliders
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(-k * 0.85, i * k * 0.6); ctx.lineTo(k * 0.85, i * k * 0.6); ctx.stroke();
        ctx.beginPath(); ctx.arc([-0.35, 0.4, -0.05][i + 1] * k, i * k * 0.6, k * 0.2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 4: // grid layout
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { roundRect(ctx, a * k * 0.48 - k * 0.38, b * k * 0.48 - k * 0.38, k * 0.76, k * 0.76, k * 0.16); ctx.fill(); }
      break;
    case 5: // crop
      ctx.beginPath(); ctx.moveTo(-k * 0.55, -k * 0.9); ctx.lineTo(-k * 0.55, k * 0.55); ctx.lineTo(k * 0.9, k * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-k * 0.9, -k * 0.55); ctx.lineTo(k * 0.55, -k * 0.55); ctx.lineTo(k * 0.55, k * 0.9); ctx.stroke();
      break;
    case 6: // camera
      roundRect(ctx, -k * 0.9, -k * 0.5, k * 1.8, k * 1.25, k * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, k * 0.12, k * 0.33, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-k * 0.35, -k * 0.5); ctx.lineTo(-k * 0.2, -k * 0.75); ctx.lineTo(k * 0.2, -k * 0.75); ctx.lineTo(k * 0.35, -k * 0.5); ctx.stroke();
      break;
    default: // palette
      ctx.beginPath(); ctx.arc(0, 0, k * 0.85, 0, Math.PI * 2); ctx.stroke();
      for (const [a, b] of [[-0.35, -0.35], [0.3, -0.42], [-0.45, 0.22]]) { ctx.beginPath(); ctx.arc(a * k, b * k, k * 0.14, 0, Math.PI * 2); ctx.fill(); }
  }
}

// ---------- idea bulb ----------
export function bulbPath(ctx, r) {
  // glass: circle top that tapers into a neck
  ctx.beginPath();
  ctx.moveTo(-r * 0.46, r * 0.86);
  ctx.bezierCurveTo(-r * 0.5, r * 0.5, -r * 1.0, r * 0.3, -r * 1.0, -r * 0.1);
  ctx.bezierCurveTo(-r * 1.0, -r * 0.72, -r * 0.55, -r * 1.12, 0, -r * 1.12);
  ctx.bezierCurveTo(r * 0.55, -r * 1.12, r * 1.0, -r * 0.72, r * 1.0, -r * 0.1);
  ctx.bezierCurveTo(r * 1.0, r * 0.3, r * 0.5, r * 0.5, r * 0.46, r * 0.86);
  ctx.closePath();
}

export function drawBulb(ctx, x, y, r, on, opt = {}) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(opt.rot || 0); ctx.scale(opt.sx || 1, opt.sy || 1);
  ctx.globalAlpha *= opt.alpha ?? 1;
  if (on > 0.02) {
    const g = ctx.createRadialGradient(0, -r * 0.1, r * 0.3, 0, -r * 0.1, r * (3.2 + on));
    g.addColorStop(0, rgba(PAL.mint, 0.55 * on)); g.addColorStop(0.45, rgba(PAL.mint, 0.16 * on)); g.addColorStop(1, rgba(PAL.mint, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -r * 0.1, r * (3.2 + on), 0, Math.PI * 2); ctx.fill();
  }
  bulbPath(ctx, r);
  ctx.fillStyle = mixColor('#4A5570', PAL.mint, on); ctx.fill();
  ctx.lineWidth = r * 0.12; ctx.strokeStyle = mixColor('#6B7690', PAL.mintHi, on); ctx.stroke();
  // highlight
  ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.45 * on})`; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, -r * 0.1, r * 0.68, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke();
  // inner sparkle
  if (on > 0.2) sparkle(ctx, r * 0.05, -r * 0.18, r * 0.55 * on, `rgba(255,255,255,${on})`);
  // screw base
  ctx.fillStyle = mixColor('#5D6782', '#C9D3E6', 0.6);
  for (let i = 0; i < 3; i++) { roundRect(ctx, -r * 0.48, r * (0.9 + i * 0.25), r * 0.96, r * 0.2, r * 0.1); ctx.fill(); }
  ctx.fillStyle = '#5D6782'; ctx.beginPath(); ctx.arc(0, r * 1.62, r * 0.2, 0, Math.PI); ctx.fill();
  ctx.restore();
}

// 4-point sparkle star (echoes the icon's sparkles)
export function sparkle(ctx, x, y, r, col) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r);
  ctx.fill();
}

export function heart(ctx, x, y, r, col, rot = 0, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= alpha;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.25, r * 0.05, -r * 1.05, -r * 1.05, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 1.05, -r * 1.05, r * 1.25, r * 0.05, 0, r * 0.9);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(-r * 0.42, -r * 0.35, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- phone (stylized device; only the real app icon is shown on screen) ----------
export const PHONE = { w: 260, h: 500 };
export function phoneScreenRect(w, h) { return { x: -w / 2 + w * 0.07, y: -h / 2 + h * 0.075, w: w * 0.86, h: h * 0.85 }; }

export function drawPhone(ctx, x, y, scale, rot, glow, drawScreen, sx = 1, sy = 1) {
  const w = PHONE.w, h = PHONE.h;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(scale * sx, scale * sy);
  if (glow > 0.01) {
    const g = ctx.createRadialGradient(0, 0, w * 0.2, 0, 0, h * 0.95);
    g.addColorStop(0, rgba(PAL.mint, 0.35 * glow)); g.addColorStop(1, rgba(PAL.mint, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, h * 0.95, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(5,8,16,0.4)'; roundRect(ctx, -w / 2 + 10, -h / 2 + 14, w, h, 40); ctx.fill();
  ctx.fillStyle = '#0E1320'; roundRect(ctx, -w / 2, -h / 2, w, h, 40); ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = mixColor('#33405F', PAL.mint, glow * 0.85); roundRect(ctx, -w / 2, -h / 2, w, h, 40); ctx.stroke();
  const S = phoneScreenRect(w, h);
  ctx.save(); roundRect(ctx, S.x, S.y, S.w, S.h, 22); ctx.clip();
  ctx.fillStyle = mixColor('#141A2A', PAL.navy, glow); ctx.fillRect(S.x, S.y, S.w, S.h);
  if (drawScreen) drawScreen(ctx, S);
  ctx.restore();
  ctx.fillStyle = '#0E1320'; roundRect(ctx, -w * 0.14, -h / 2 + h * 0.022, w * 0.28, h * 0.035, 8); ctx.fill();
  ctx.restore();
}

// ---------- generated picture: "sky whale" illustration (original) ----------
export function makePicture(size = 600) {
  const c = createCanvas(size, size), g = c.getContext('2d');
  const s = size / 600;
  const sky = g.createLinearGradient(0, 0, 0, size);
  sky.addColorStop(0, '#2B2468'); sky.addColorStop(0.55, '#7A4C9E'); sky.addColorStop(0.85, '#FF9A7A'); sky.addColorStop(1, '#FFC98B');
  g.fillStyle = sky; g.fillRect(0, 0, size, size);
  const R = rng(7);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + R() * 0.6})`; g.beginPath(); g.arc(R() * size, R() * size * 0.6, (0.8 + R() * 2.2) * s, 0, Math.PI * 2); g.fill(); }
  // moon
  g.fillStyle = 'rgba(255,240,215,0.95)'; g.beginPath(); g.arc(455 * s, 130 * s, 62 * s, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,220,190,0.6)'; g.beginPath(); g.arc(435 * s, 115 * s, 12 * s, 0, Math.PI * 2); g.arc(480 * s, 150 * s, 8 * s, 0, Math.PI * 2); g.fill();
  // ringed planet
  g.save(); g.translate(120 * s, 120 * s); g.rotate(-0.35);
  g.fillStyle = '#FFB36B'; g.beginPath(); g.arc(0, 0, 30 * s, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#FFE1B0'; g.lineWidth = 6 * s; g.beginPath(); g.ellipse(0, 0, 54 * s, 12 * s, 0, 0, Math.PI * 2); g.stroke();
  g.restore();
  // hills
  g.fillStyle = '#2E8C6A'; g.beginPath(); g.moveTo(0, 470 * s); g.bezierCurveTo(150 * s, 400 * s, 260 * s, 470 * s, 360 * s, 450 * s); g.bezierCurveTo(470 * s, 425 * s, 540 * s, 440 * s, 600 * s, 420 * s); g.lineTo(600 * s, 600 * s); g.lineTo(0, 600 * s); g.fill();
  g.fillStyle = '#6CDA7E'; g.beginPath(); g.moveTo(0, 530 * s); g.bezierCurveTo(120 * s, 490 * s, 230 * s, 520 * s, 330 * s, 515 * s); g.bezierCurveTo(450 * s, 505 * s, 520 * s, 480 * s, 600 * s, 500 * s); g.lineTo(600 * s, 600 * s); g.lineTo(0, 600 * s); g.fill();
  // whale
  g.save(); g.translate(300 * s, 285 * s); g.rotate(-0.12);
  const body = () => {
    g.beginPath();
    g.moveTo(-170 * s, 10 * s);
    g.bezierCurveTo(-170 * s, -80 * s, -40 * s, -95 * s, 60 * s, -55 * s);
    g.bezierCurveTo(120 * s, -30 * s, 150 * s, -20 * s, 190 * s, -55 * s);
    g.lineTo(235 * s, -95 * s); g.lineTo(222 * s, -35 * s); g.lineTo(255 * s, 5 * s);
    g.bezierCurveTo(215 * s, -5 * s, 185 * s, 5 * s, 160 * s, 25 * s);
    g.bezierCurveTo(90 * s, 80 * s, -60 * s, 95 * s, -130 * s, 65 * s);
    g.bezierCurveTo(-160 * s, 50 * s, -170 * s, 35 * s, -170 * s, 10 * s);
    g.closePath();
  };
  g.fillStyle = 'rgba(20,10,40,0.25)'; g.save(); g.translate(8 * s, 14 * s); body(); g.fill(); g.restore();
  g.fillStyle = '#4FB7C9'; body(); g.fill();
  g.save(); body(); g.clip();
  g.fillStyle = '#D9F4EE'; g.beginPath(); g.ellipse(-30 * s, 70 * s, 160 * s, 50 * s, -0.08, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(79,183,201,0.7)'; g.lineWidth = 5 * s;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-120 * s + i * 40 * s, 40 * s); g.lineTo(-110 * s + i * 40 * s, 85 * s); g.stroke(); }
  g.restore();
  g.fillStyle = '#1B2333'; g.beginPath(); g.arc(-105 * s, -2 * s, 9 * s, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(-102 * s, -5 * s, 3 * s, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#1B2333'; g.lineWidth = 4 * s; g.lineCap = 'round'; g.beginPath(); g.arc(-125 * s, 25 * s, 22 * s, 0.2, 1.2); g.stroke();
  g.fillStyle = '#3C9DB0'; g.beginPath(); g.moveTo(-40 * s, 45 * s); g.quadraticCurveTo(-10 * s, 110 * s, 30 * s, 95 * s); g.quadraticCurveTo(0, 70 * s, -10 * s, 45 * s); g.fill();
  g.restore();
  // star spout
  for (const [x, y, r] of [[190, 175, 16], [225, 140, 11], [168, 135, 9], [205, 105, 7]]) sparkle(g, x * s, y * s, r * s, 'rgba(255,255,255,0.95)');
  // tiny stickman with mint scarf on the hill, waving at the whale
  g.strokeStyle = '#F4F7FB'; g.lineWidth = 5 * s; g.lineCap = 'round';
  const bx = 455 * s, by = 492 * s;
  g.beginPath(); g.moveTo(bx - 10 * s, by + 34 * s); g.lineTo(bx, by); g.lineTo(bx + 10 * s, by + 34 * s); g.moveTo(bx, by); g.lineTo(bx, by - 40 * s);
  g.moveTo(bx, by - 34 * s); g.lineTo(bx - 18 * s, by - 14 * s); g.moveTo(bx, by - 34 * s); g.lineTo(bx + 20 * s, by - 60 * s); g.stroke();
  g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(bx, by - 52 * s, 11 * s, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6CDA7E'; g.fillRect(bx - 8 * s, by - 42 * s, 16 * s, 5 * s);
  return c;
}

// pixelated copies used by the "noise resolves into an image" reveal
export function makePixelLevels(pic, levels) {
  return levels.map((n) => {
    const small = createCanvas(n, n), sg = small.getContext('2d');
    sg.imageSmoothingEnabled = true; sg.drawImage(pic, 0, 0, n, n);
    return small;
  });
}

// ---------- planets ----------
export function drawMiniPlanet(ctx, x, y, r, col, ringCol) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, mixColor(col, '#FFFFFF', 0.25)); g.addColorStop(1, mixColor(col, PAL.navy, 0.45));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.25, r * 0.22, r * 0.14, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - r * 0.35, y + r * 0.45, r * 0.14, r * 0.09, 0.1, 0, Math.PI * 2); ctx.fill();
  if (ringCol) {
    ctx.strokeStyle = ringCol; ctx.lineWidth = r * 0.09;
    ctx.beginPath(); ctx.ellipse(x, y + r * 0.1, r * 1.45, r * 0.32, -0.12, 0.05 * Math.PI, 0.95 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}
