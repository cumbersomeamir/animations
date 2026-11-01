// Stickman rig: IK limbs, expressive face, accessories, glowing phone.
import { C, ik2, hexA, roundRect, clamp, mixHex } from './lib.mjs';

export const DIM = { thigh: 118, shin: 118, torso: 168, neck: 12, headR: 44, upper: 96, fore: 92, stroke: 15 };

export const BASE_POSE = {
  lift: 0, crouch: 0, lean: 0, tilt: 0,
  hn: [70, 95],     // near hand rel. shoulder (phone hand)
  hf: [-18, 175],   // far hand rel. shoulder
  fn: [26, 0], ff: [-26, 0],
  look: 1,
  eye: 1, brow: 0, browTilt: 0, smile: 0.2, mouthO: 0,
  phoneTilt: 0.12, phone: 1,
};

// ch: {x, y, s, fs (facing scale -1..1), pose, acc, phoneColor, glyph, glow}
export function solve(ch) {
  const p = { ...BASE_POSE, ...ch.pose };
  const s = ch.s ?? 1, fs = ch.fs ?? 1;
  const map = (x, y) => [ch.x + x * fs * s, ch.y + y * s];
  const hipY = -(DIM.thigh + DIM.shin - 8) + p.crouch + p.lift;
  const hip = [0, hipY];
  const up = [Math.sin(p.lean), -Math.cos(p.lean)];
  const sh = [hip[0] + up[0] * DIM.torso, hip[1] + up[1] * DIM.torso];
  const head = [sh[0] + up[0] * (DIM.neck + DIM.headR), sh[1] + up[1] * (DIM.neck + DIM.headR)];
  const leg = f => {
    const r = ik2(hip[0], hip[1], f[0], f[1] + p.lift, DIM.thigh, DIM.shin, -1);
    return { k: [r.jx, r.jy], f: [r.ex, r.ey] };
  };
  const arm = (h, bend) => {
    const r = ik2(sh[0], sh[1], sh[0] + h[0], sh[1] + h[1], DIM.upper, DIM.fore, bend);
    return { e: [r.jx, r.jy], h: [r.ex, r.ey] };
  };
  const legN = leg(p.fn), legF = leg(p.ff);
  const armN = arm(p.hn, p.hn[0] > 0 ? 1 : -1), armF = arm(p.hf, p.hf[0] > 0 ? 1 : -1);
  const L = { hip, sh, head, legN, legF, armN, armF };
  const M = {};
  M.hip = map(...hip); M.sh = map(...sh); M.head = map(...head);
  M.kN = map(...legN.k); M.fN = map(...legN.f); M.kF = map(...legF.k); M.fF = map(...legF.f);
  M.eN = map(...armN.e); M.hN = map(...armN.h); M.eF = map(...armF.e); M.hF = map(...armF.h);
  // phone sits in the near hand, screen centred slightly above the grip
  const ang = p.phoneTilt * Math.sign(fs || 1);
  M.phone = [M.hN[0] + Math.sin(ang) * 26 * s, M.hN[1] - Math.cos(ang) * 26 * s];
  M.phoneAng = ang;
  return { ch, p, s, fs, map, L, M };
}

function seg(ctx, pts, w, col) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) ctx.lineTo(...pts[i]); ctx.stroke();
}

export function drawGlow(ctx, g) {
  const { ch, M, s, p } = g;
  if (!ch.glow || p.phone <= 0) return;
  const r = 190 * s;
  const grd = ctx.createRadialGradient(M.phone[0], M.phone[1], 0, M.phone[0], M.phone[1], r);
  grd.addColorStop(0, hexA(ch.phoneColor ?? C.ink, 0.30 * ch.glow));
  grd.addColorStop(1, hexA(ch.phoneColor ?? C.ink, 0));
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(M.phone[0], M.phone[1], r, 0, Math.PI * 2); ctx.fill();
}

export function drawStick(ctx, g) {
  const { ch, M, s, fs, p, map } = g;
  const w = DIM.stroke * s;
  const ink = ch.ink ?? C.ink, dim = ch.dim ?? C.inkDim;
  // far side
  seg(ctx, [M.hip, M.kF, M.fF], w, dim);
  seg(ctx, [M.sh, M.eF, M.hF], w, dim);
  // torso + near leg
  seg(ctx, [M.hip, M.sh], w * 1.05, ink);
  seg(ctx, [M.hip, M.kN, M.fN], w, ink);
  // head
  drawHead(ctx, g);
  // near arm + phone
  seg(ctx, [M.sh, M.eN, M.hN], w, ink);
  if (p.phone > 0) drawPhone(ctx, g);
  // hand over phone grip
  ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(M.hN[0], M.hN[1], w * 0.62, 0, Math.PI * 2); ctx.fill();
}

function drawHead(ctx, g) {
  const { ch, M, s, fs, p } = g;
  const r = DIM.headR * s;
  const [hx, hy] = M.head;
  const ink = ch.ink ?? C.ink;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate((p.tilt + p.lean * 0.4) * Math.sign(fs || 1));
  // accessories behind head
  if (ch.acc === 'bun') {
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(-r * 0.78 * fs, -r * 0.72, r * 0.36, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = ch.headFill ?? C.bg;
  ctx.strokeStyle = ink; ctx.lineWidth = 12 * s;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (ch.acc === 'beanie') {
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.62, r * 0.98, r * 0.8, 0, Math.PI, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    roundRect(ctx, -r * 1.06, -r * 0.8, r * 2.12, r * 0.25, r * 0.1); ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.12 * fs, -r * 1.48, r * 0.24, 0, Math.PI * 2); ctx.fill();
  }
  if (ch.acc === 'bun') {
    // fringe
    ctx.strokeStyle = ink; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.98, Math.PI * (fs >= 0 ? 1.05 : 1.45), Math.PI * (fs >= 0 ? 1.55 : 1.95)); ctx.stroke();
  }
  // face (local coords, mirrored by fs)
  const X = x => x * fs;
  const look = p.look;
  const fx = 14 * look;
  ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineCap = 'round';
  const eyeH = Math.max(1.4, 8.4 * clamp(p.eye, 0, 1.4)) * s;
  for (const ex of [fx - 12, fx + 12]) {
    ctx.beginPath(); ctx.ellipse(X(ex * s), -4 * s, 6 * s, eyeH, 0, 0, Math.PI * 2); ctx.fill();
    // brows
    const by = (-20 - 5 * p.brow) * s;
    const inner = ex > fx ? -1 : 1; // inner side toward face centre
    const tilt = p.browTilt * 5 * s;
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(X((ex - 7 * inner) * s), by + tilt * 0.0);
    ctx.lineTo(X((ex + 7 * inner) * s), by - tilt);
    ctx.stroke();
  }
  // mouth
  const mx = (fx + 1) * s, my = 17 * s;
  if (p.mouthO > 0.05) {
    ctx.beginPath(); ctx.ellipse(X(mx), my + 2 * s, (5 + 4 * p.mouthO) * s, (3 + 8 * p.mouthO) * s, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.lineWidth = 5 * s;
    ctx.beginPath();
    ctx.moveTo(X(mx - 12 * s), my - 2 * s * p.smile);
    ctx.quadraticCurveTo(X(mx), my + 12 * s * p.smile, X(mx + 12 * s), my - 2 * s * p.smile);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPhone(ctx, g) {
  const { ch, M, s, p } = g;
  const pw = 46 * s, ph = 80 * s;
  ctx.save();
  ctx.translate(M.phone[0], M.phone[1]);
  ctx.rotate(M.phoneAng);
  const k = p.phone;
  ctx.scale(k, k);
  roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 9 * s);
  ctx.fillStyle = '#1B2421'; ctx.fill();
  ctx.lineWidth = 4 * s; ctx.strokeStyle = C.ink; ctx.stroke();
  const col = ch.phoneColor ?? C.ink;
  roundRect(ctx, -pw / 2 + 5 * s, -ph / 2 + 7 * s, pw - 10 * s, ph - 14 * s, 5 * s);
  ctx.fillStyle = hexA(col, 0.25 + 0.75 * (ch.screen ?? 1)); ctx.fill();
  // glyph
  const gl = ch.glyph ?? 'chat';
  ctx.strokeStyle = gl === 'chat' ? '#2A3430' : C.ink; ctx.fillStyle = C.ink;
  ctx.lineCap = 'round'; ctx.lineWidth = 4 * s;
  if (gl === 'chat') {
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-12 * s, (-14 + i * 12) * s); ctx.lineTo((i === 2 ? 2 : 12) * s, (-14 + i * 12) * s); ctx.stroke(); }
  } else if (gl === 'x') {
    ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(-9 * s, -9 * s); ctx.lineTo(9 * s, 9 * s); ctx.moveTo(9 * s, -9 * s); ctx.lineTo(-9 * s, 9 * s); ctx.stroke();
  } else if (gl === 'mesh') {
    ctx.lineWidth = 5 * s;
    ctx.beginPath(); ctx.moveTo(-13 * s, 9 * s); ctx.bezierCurveTo(-4 * s, 9 * s, -6 * s, 0, 0, 0); ctx.bezierCurveTo(6 * s, 0, 4 * s, -9 * s, 13 * s, -9 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 4.2 * s, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  }
  ctx.restore();
}

// Procedural walk cycle: returns pose overrides. phase in cycles.
export function walkPose(phase, amt = 1, stride = 46) {
  const a = phase * Math.PI * 2;
  const foot = ph => {
    const c = Math.cos(ph);
    return [stride * Math.sin(ph) * amt, (c > 0 ? -26 * c : 0) * amt];
  };
  return {
    fn: foot(a), ff: foot(a + Math.PI),
    crouch: (4 + 5 * Math.cos(2 * a)) * amt,
    lean: 0.06 * amt,
    hf: [-18 + 46 * Math.sin(a) * amt, 170 - 8 * Math.abs(Math.sin(a)) * amt],
  };
}
