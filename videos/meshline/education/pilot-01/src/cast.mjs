// Recurring cast rig (reusable across lessons): Bix (signal sprite with a four-bar crest) and Dot (data packet).
// Characters are drawn in a reference space (Bix ≈ 300 ref-px tall, origin at the feet) and placed with a
// screen position + scale, so they can stand inside the 3D city as billboards or be drawn flat on a sheet.
import { C, clamp, lerp, TAU, ik2, roundRect, hexA } from './core.mjs';

export const BIX_REF_H = 300;

export const BIX_BASE = {
  face: 1,            // -1..1 facing (sign = direction, magnitude squashes for turns)
  lean: 0,            // radians, about the hips
  squash: 0,          // >0 squash (wide/short), <0 stretch
  lift: 0,            // ref-px, jump
  bars: 4,            // how many crest bars are lit (0..4, fractional fades the next bar)
  barGlow: 0,         // extra glow pulse on the crest
  look: [1, 0],       // pupil direction
  eye: 1,             // openness (0 closed .. 1.3 wide)
  happyEyes: 0,       // 0..1 morph to ^ ^ eyes
  brow: 0,            // + raised, - furrowed
  browTilt: 0,        // + worried (inner up)
  mouth: 0.4,         // smile (-1 frown .. 1 grin)
  mouthO: 0,          // open "o"
  handN: [92, -66],   // near hand (screen-side) target, ref-px relative to feet
  handF: [-92, -66],  // far hand
  footN: [24, 0], footF: [-24, 0],
};

// Bix: rounded electric-blue body, white node face plate, four signal bars as a crest, ink limbs
export function drawBix(ctx, x, y, scale, pose, opts = {}) {
  const p = { ...BIX_BASE, ...pose };
  const fs = Math.sign(p.face || 1), fmag = Math.max(0.15, Math.abs(p.face));
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale * (BIX_REF_H / 300), scale * (BIX_REF_H / 300));
  // contact shadow
  if (!opts.noShadow) {
    const sh = 1 - clamp(-p.lift / 160) * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 4, 70 * sh, 13 * sh, 0, 0, TAU); ctx.fill();
  }
  ctx.translate(0, p.lift);
  const hip = [0, -78];
  const bodyC = [Math.sin(p.lean) * 72, -150 + (1 - Math.cos(p.lean)) * 72];
  const sx = fmag * (1 + 0.18 * p.squash), sy = 1 - 0.18 * p.squash;
  const limb = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...pts[0]); for (const q of pts.slice(1)) ctx.lineTo(...q); ctx.stroke(); };
  const leg = (f, col) => { const r = ik2(hip[0] + f[0] * 0.35, hip[1], f[0], f[1], 42, 40, f[0] >= 0 ? -1 : 1); limb([[hip[0] + f[0] * 0.35, hip[1]], [r.jx, r.jy], [r.ex, r.ey]], 13, col); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(r.ex + 6 * fs, r.ey - 2, 15, 8, 0, 0, TAU); ctx.fill(); };
  const sh = s => [bodyC[0] + s * 70 * fmag, bodyC[1] + 8];
  const arm = (shp, h, col) => { const hx = h[0] * fs, hy = h[1]; const r = ik2(shp[0], shp[1], hx, hy, 48, 46, hx > shp[0] ? 1 : -1); limb([shp, [r.jx, r.jy], [r.ex, r.ey]], 12, col); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(r.ex, r.ey, 12, 0, TAU); ctx.fill(); return [r.ex, r.ey]; };
  // far limbs (behind body)
  leg([p.footF[0] * fs, p.footF[1]], '#B9C0BB');
  const hF = arm(sh(-fs), p.handF, '#B9C0BB');
  leg([p.footN[0] * fs, p.footN[1]], C.ink);
  // body
  ctx.save(); ctx.translate(...bodyC); ctx.rotate(p.lean * 0.6); ctx.scale(sx, sy);
  // crest: four signal bars (lit = white glow; unlit = deep blue)
  const barX = [-36, -12, 12, 36], barH = [26, 42, 58, 74];
  for (let i = 0; i < 4; i++) {
    const lit = clamp(p.bars - i);
    const bx = barX[i] * fs - 9, by = -70 - barH[i] + 14;
    if (lit > 0.02) { const g = ctx.createRadialGradient(barX[i] * fs, by + barH[i] / 2, 2, barX[i] * fs, by + barH[i] / 2, 46); g.addColorStop(0, hexA(C.ink, 0.35 * lit * (1 + p.barGlow))); g.addColorStop(1, hexA(C.ink, 0)); ctx.fillStyle = g; ctx.fillRect(bx - 40, by - 30, 98, barH[i] + 60); }
    roundRect(ctx, bx, by, 18, barH[i], 7);
    ctx.fillStyle = lit > 0.5 ? C.ink : C.blueDeep; ctx.globalAlpha = lit > 0.5 ? 1 : 1; ctx.fill();
    if (lit > 0 && lit <= 0.5) { ctx.globalAlpha = lit * 2; ctx.fillStyle = C.ink; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = '#0B1A66'; ctx.lineWidth = 3; ctx.stroke();
  }
  // body sphere (dimensional shading)
  const g = ctx.createRadialGradient(-26, -30, 10, 0, 0, 84);
  g.addColorStop(0, '#7B96FF'); g.addColorStop(0.55, C.blue); g.addColorStop(1, '#1A2E9C');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 78, 0, TAU); ctx.fill();
  ctx.strokeStyle = hexA('#B8C6FF', 0.55); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 77, Math.PI * 1.05, Math.PI * 1.55); ctx.stroke();
  // face plate (the icon's white node, enlarged)
  const fx = 16 * fs * fmag;
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(fx, -4, 52, 44, 0, 0, TAU); ctx.fill();
  // eyes
  const ex = [fx - 19, fx + 19];
  for (const e of ex) {
    if (p.happyEyes > 0.5) {
      ctx.strokeStyle = C.charcoal; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(e, -6, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    } else {
      const eh = Math.max(1.5, 13 * clamp(p.eye, 0, 1.4));
      ctx.fillStyle = C.charcoal; ctx.beginPath(); ctx.ellipse(e + p.look[0] * 4 * fs, -10 + p.look[1] * 3, 9, eh, 0, 0, TAU); ctx.fill();
      if (p.eye > 0.35) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(e + p.look[0] * 4 * fs + 3, -14 + p.look[1] * 3, 3, 0, TAU); ctx.fill(); }
    }
    // brows
    const inner = e > fx ? -1 : 1;
    ctx.strokeStyle = C.charcoal; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const by = -32 - 6 * p.brow;
    ctx.beginPath(); ctx.moveTo(e - 9 * inner, by); ctx.lineTo(e + 9 * inner, by - 6 * p.browTilt); ctx.stroke();
  }
  // mouth
  ctx.fillStyle = C.charcoal; ctx.strokeStyle = C.charcoal; ctx.lineWidth = 5;
  if (p.mouthO > 0.08) { ctx.beginPath(); ctx.ellipse(fx + 2 * fs, 18, 6 + 5 * p.mouthO, 4 + 9 * p.mouthO, 0, 0, TAU); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(fx - 13, 16 - 3 * p.mouth); ctx.quadraticCurveTo(fx, 16 + 14 * p.mouth, fx + 13, 16 - 3 * p.mouth); ctx.stroke(); }
  ctx.restore();
  // near arm in front of body
  const hN = arm(sh(fs), p.handN, C.ink);
  ctx.restore();
  // return hand positions in screen space for props
  const k = scale * (BIX_REF_H / 300);
  return { handN: [x + hN[0] * k, y + (hN[1] + p.lift) * k], handF: [x + hF[0] * k, y + (hF[1] + p.lift) * k], head: [x + bodyC[0] * k, y + (bodyC[1] + p.lift) * k], scale: k };
}

// Dot: a rounded data-packet cube (off-white faces, blue band, node dot) with a tiny face and legs.
export function drawDot(ctx, x, y, size, opt = {}) {
  const s = size, t = opt.t ?? 0;
  const face = opt.face ?? true, mood = opt.mood ?? 0.5, eye = opt.eye ?? 1, alpha = opt.alpha ?? 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(opt.rot ?? 0);
  const d = s * 0.32; // depth offset (top/side faces)
  if (opt.legs) {
    ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.5, s * 0.08); ctx.lineCap = 'round';
    const tap = opt.tap ? Math.max(0, Math.sin(t * TAU * 3.2)) * s * 0.12 : 0;
    ctx.beginPath(); ctx.moveTo(-s * 0.2, 0); ctx.lineTo(-s * 0.24, s * 0.28); ctx.moveTo(s * 0.2, 0); ctx.lineTo(s * 0.26, s * 0.28 - tap); ctx.stroke();
  }
  // side face
  ctx.fillStyle = opt.dim ? '#7F8AA8' : '#BFC7DD';
  ctx.beginPath(); ctx.moveTo(s / 2, -s); ctx.lineTo(s / 2 + d, -s - d * 0.7); ctx.lineTo(s / 2 + d, -d * 0.7); ctx.lineTo(s / 2, 0); ctx.closePath(); ctx.fill();
  // top face
  ctx.fillStyle = opt.dim ? '#AEB6CC' : '#FFFFFF';
  ctx.beginPath(); ctx.moveTo(-s / 2, -s); ctx.lineTo(-s / 2 + d, -s - d * 0.7); ctx.lineTo(s / 2 + d, -s - d * 0.7); ctx.lineTo(s / 2, -s); ctx.closePath(); ctx.fill();
  // front face
  roundRect(ctx, -s / 2, -s, s, s, s * 0.14); ctx.fillStyle = opt.dim ? '#C9D0E2' : C.ink; ctx.fill();
  // blue band + node
  ctx.fillStyle = C.blue; ctx.fillRect(-s / 2, -s * 0.36, s, s * 0.14);
  ctx.beginPath(); ctx.moveTo(s / 2, -s * 0.36); ctx.lineTo(s / 2 + d, -s * 0.36 - d * 0.7); ctx.lineTo(s / 2 + d, -s * 0.22 - d * 0.7); ctx.lineTo(s / 2, -s * 0.22); ctx.closePath(); ctx.fill();
  if (face && s > 14) {
    ctx.fillStyle = C.charcoal;
    const eh = Math.max(1, s * 0.09 * eye);
    ctx.beginPath(); ctx.ellipse(-s * 0.16, -s * 0.66, s * 0.055, eh, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 0.16, -s * 0.66, s * 0.055, eh, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.charcoal; ctx.lineWidth = Math.max(1.2, s * 0.045); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.5 - s * 0.03 * mood); ctx.quadraticCurveTo(0, -s * 0.5 + s * 0.09 * mood, s * 0.1, -s * 0.5 - s * 0.03 * mood); ctx.stroke();
  }
  ctx.restore();
}
