// S5 (22.3-27s): the tangled threads return as garlands, an arch assembles, the couple dances.
// S6 (27-30s): end card - Plan My Wedding + Explore on Google Play.
import { C, W, H, GROUND, F, card, rr, line, circle, heart, marigold, makePaper } from '../lib/paper.mjs';
import { ease, seg, prog, kf, wobble, lerp, clamp, qb, TAU, rng } from '../lib/core.mjs';
import { geom, drawFig, POSES, BASE } from '../lib/rig.mjs';
import { T, BEAT } from '../cues.mjs';
import { reach, floor } from './props.mjs';

const celebPaper = makePaper('#F8EEE3', 13, 0.12);
const S = 1.2;
const AX = 470, BX = 610;

function mixP(a, b, u) {
  const o = { ...a };
  for (const k of ['aL', 'aR', 'lL', 'lR']) if (Array.isArray(a[k]) && Array.isArray(b[k])) o[k] = [lerp(a[k][0], b[k][0], u), lerp(a[k][1], b[k][1], u)];
  o.lean = lerp(a.lean ?? 0, b.lean ?? 0, u);
  return o;
}
const squash = (t, tl, amt = 0.7) => { const v = prog(t, tl, tl + 0.3); return v > 0 && v < 1 ? Math.sin(Math.PI * v) * (1 - v * 0.4) * amt : 0; };

// ---------------------------------------------------------------- couple
function coupleBase(t, who, phonePose) {
  const x1 = who === 'A' ? AX : BX;
  const face = who === 'A' ? 1 : -1;
  let P = { ...BASE, ...POSES.stand, x: x1, ground: GROUND, s: S, face, time: t, mood: 'happy' };
  if (t < 22.85) {
    // leap out of the planner into the celebration
    const p0 = phonePose(T.jumpOut);
    const u = prog(t, T.jumpOut, 22.85);
    return { ...P, ...POSES.jump, x: lerp(p0.x - 2160, x1, ease.inOutQuad(u)), lift: Math.sin(Math.PI * u) * 260, face: x1 > p0.x - 2160 ? 1 : -1 };
  }
  P = { ...P, ...mixP(POSES.stand, POSES.crouch, squash(t, 22.85)) };
  if (t < 23.2) return P;
  if (t < T.twirl) {
    // join hands, then lift them
    const up = seg(t, 23.65, T.twirl);
    const meet = { x: 540, y: lerp(1335, 1095, up) };
    return reach(P, 'aR', meet, seg(t, 23.2, 23.45), who === 'A' ? -1 : 1);
  }
  if (t < 25.0) {
    if (who === 'A') {
      const u = ease.inOutSine(prog(t, T.twirl, 25.0));
      return { ...P, ...POSES.armsUp, spin: u * 2, scarfFlare: Math.sin(Math.PI * u), lift: Math.abs(Math.sin(u * TAU)) * 10 };
    }
    return reach({ ...P, lean: -0.05 }, 'aR', { x: AX + 20, y: 1060 + Math.sin(t * 12) * 8 }, 1, 1);
  }
  if (t < T.bigJump) return { ...P, ...mixP(POSES.stand, POSES.crouch, seg(t, 25.0, T.bigJump, ease.inOutQuad) * 0.8) };
  if (t < T.bigLand) { const u = prog(t, T.bigJump, T.bigLand); return { ...P, ...POSES.jump, lift: Math.sin(Math.PI * u) * 140 }; }
  P = { ...P, ...mixP(POSES.stand, POSES.crouch, squash(t, T.bigLand, 0.6)) };
  const b = (t - T.bigLand) / BEAT;
  const sway = Math.sin(Math.PI * b);
  P.lean = 0.1 * sway;
  P.aL = [2.5 + 0.25 * Math.sin(TAU * b * 0.5), 0.3];
  P.aR = [-2.5 + 0.25 * Math.sin(TAU * b * 0.5 + 1), -0.3];
  if (t > T.zoomOut + 0.4) {
    // wave at the viewer on the end card
    P.aL = [0.2, 0.2];
    P.aR = [-2.4 + 0.35 * Math.sin(t * 9 + (who === 'A' ? 0 : 1.5)), -0.6];
    P.lean = 0.04 * sway;
    P.look = 0;
  }
  return P;
}

const GUESTS = [
  { x: 95, face: 1, who: 'A' }, { x: 195, face: 1, who: 'B' }, { x: 885, face: -1, who: 'A' }, { x: 985, face: -1, who: 'B' },
];
function guestPose(gst, i, t) {
  const enter = ease.outCubic(prog(t, 23.25 + i * 0.08, 23.9 + i * 0.08));
  const x = lerp(gst.x + (gst.face > 0 ? -260 : 260), gst.x, enter);
  let P = { ...BASE, ...POSES.stand, x, ground: GROUND, s: 0.74, face: gst.face, mood: 'happy', time: t };
  if (enter < 1) { const ph = t * 16; P.lift = Math.abs(Math.sin(ph)) * 8; P.lL = [0.4 * Math.sin(ph), -0.4]; P.lR = [-0.4 * Math.sin(ph), -0.4]; }
  if (t > 24.0) {
    const g = geom(P);
    const b = ((t - 24.0) / BEAT) % 1;
    const gap = 8 + 34 * Math.abs(Math.sin(Math.PI * b));
    const c = { x: g.hip.x + 46 * gst.face, y: g.hip.y - 98 };
    P = reach(P, 'aR', { x: c.x + gap * 0.5 * gst.face, y: c.y }, 1, -1);
    P = reach(P, 'aL', { x: c.x - gap * 0.5 * gst.face, y: c.y }, 1, 1);
    P.lift = t > T.bigJump && t < T.bigLand + 0.2 ? Math.sin(Math.PI * prog(t, T.bigJump, T.bigLand + 0.2)) * 30 : 0;
  }
  return P;
}

// ---------------------------------------------------------------- set pieces
const ARCH = { cx: 540, cy: 1030, r: 262, pw: 50 };
function drawArch(ctx, t) {
  const pl = ease.outBack(prog(t, 22.72, T.pillarL), 1.3), pr = ease.outBack(prog(t, 22.82, T.pillarR), 1.3);
  const top = ease.outBounce(prog(t, 22.95, T.archTop));
  const pop = prog(t, T.archTop + 0.05, T.archTop + 0.35);
  const pillar = (x, off) => {
    ctx.save(); ctx.translate(off, 0);
    ctx.fillStyle = 'rgba(58,36,48,0.12)'; rr(ctx, x - ARCH.pw / 2 + 8, ARCH.cy, ARCH.pw, GROUND - ARCH.cy + 4, 10); ctx.fill();
    ctx.fillStyle = C.roseTint; rr(ctx, x - ARCH.pw / 2, ARCH.cy, ARCH.pw, GROUND - ARCH.cy, 10); ctx.fill();
    ctx.fillStyle = C.rose; for (let y = ARCH.cy + 40; y < GROUND - 20; y += 70) ctx.fillRect(x - ARCH.pw / 2, y, ARCH.pw, 10);
    ctx.fillStyle = C.goldDeep; rr(ctx, x - ARCH.pw / 2 - 12, GROUND - 30, ARCH.pw + 24, 30, 6); ctx.fill();
    ctx.restore();
  };
  if (pl > 0) pillar(ARCH.cx - ARCH.r, (1 - pl) * -560);
  if (pr > 0) pillar(ARCH.cx + ARCH.r, (1 - pr) * 560);
  if (t > 22.95) {
    ctx.save(); ctx.translate(0, (1 - top) * -1100);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = 'rgba(58,36,48,0.12)'; ctx.lineWidth = ARCH.pw + 6;
    ctx.beginPath(); ctx.arc(ARCH.cx + 8, ARCH.cy + 10, ARCH.r, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = C.roseTint; ctx.lineWidth = ARCH.pw;
    ctx.beginPath(); ctx.arc(ARCH.cx, ARCH.cy, ARCH.r, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(ARCH.cx, ARCH.cy, ARCH.r + ARCH.pw / 2, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(ARCH.cx, ARCH.cy, ARCH.r - ARCH.pw / 2, Math.PI, 0); ctx.stroke();
    for (let a = Math.PI + 0.12; a < TAU - 0.06; a += 0.2) marigold(ctx, ARCH.cx + Math.cos(a) * ARCH.r, ARCH.cy + Math.sin(a) * ARCH.r, 15, a);
    // hanging marigold strands sway after landing
    for (let i = 0; i < 5; i++) {
      const a = Math.PI + 0.55 + i * 0.5;
      const ax = ARCH.cx + Math.cos(a) * (ARCH.r - 26), ay = ARCH.cy + Math.sin(a) * (ARCH.r - 26);
      const sw = wobble(t, T.archTop, 1.6, 1.8, 0.25) + Math.sin(t * 2.2 + i) * 0.04;
      for (let k = 1; k <= 4; k++) marigold(ctx, ax + Math.sin(sw) * k * 24, ay + Math.cos(sw) * k * 24, 10, k);
    }
    ctx.restore();
  }
  if (pop > 0) {
    const s = ease.outBack(pop, 2);
    [[ARCH.cx, ARCH.cy - ARCH.r, 1.2], [ARCH.cx - ARCH.r, ARCH.cy, 0.9], [ARCH.cx + ARCH.r, ARCH.cy, 0.9]].forEach(([x, y, k]) => cluster(ctx, x, y, 34 * k * s));
  }
}
function cluster(ctx, x, y, r) {
  if (r <= 0) return;
  ctx.fillStyle = C.sage;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.3; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.5, r * 0.22, a, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; rose(ctx, x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42, r * 0.5); }
  marigold(ctx, x, y, r * 0.42, 0.4);
}
function rose(ctx, x, y, r) {
  circle(ctx, x, y, r, C.roseDeep);
  ctx.strokeStyle = C.rose; ctx.lineWidth = r * 0.16;
  ctx.beginPath(); for (let k = 0; k < 20; k++) { const a = k * 0.7, rr0 = (k / 20) * r * 0.8; const px = x + Math.cos(a) * rr0, py = y + Math.sin(a) * rr0; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke();
}

// garlands: the crimson thread from act one, now strung with flowers
const GARL = [
  { y0: [540, 560], y1: [128, 150], sag: [110, 84], d: 0 },
  { y0: [612, 596], y1: [196, 180], sag: [86, 66], d: 0.07 },
];
function garlands(ctx, t) {
  if (t < T.garland) return;
  const z = ease.inOutCubic(prog(t, T.zoomOut, T.zoomOut + 0.6));
  GARL.forEach((gl, gi) => {
    const u = ease.outCubic(prog(t, T.garland + gl.d, T.garland + gl.d + 0.5));
    const yl = lerp(gl.y0[0], gl.y1[0], z), yr = lerp(gl.y0[1], gl.y1[1], z);
    const L = { x: -30, y: yl };
    const R = { x: lerp(-30, W + 30, u), y: lerp(yl - 300, yr, u) };
    const sag = lerp(gl.sag[0], gl.sag[1], z) * (0.4 + 0.6 * u) + wobble(t, T.garland + gl.d + 0.5, 1.4, 2.4, 26) + Math.sin(t * 1.6 + gi) * 4;
    const ctrl = { x: (L.x + R.x) / 2, y: (L.y + R.y) / 2 + sag * 2 };
    const pts = []; for (let k = 0; k <= 30; k++) pts.push(qb(L, ctrl, R, k / 30));
    line(ctx, pts, C.thread, 5);
    const n = Math.floor(26 * u);
    for (let k = 1; k <= n; k++) {
      const p = qb(L, ctrl, R, k / 27);
      if (k % 4 === 0) {
        // small paper pennant
        ctx.fillStyle = gi ? C.rose : C.ivory;
        ctx.beginPath(); ctx.moveTo(p.x - 16, p.y); ctx.lineTo(p.x + 16, p.y); ctx.lineTo(p.x, p.y + 34); ctx.closePath(); ctx.fill();
      } else marigold(ctx, p.x, p.y, k % 4 === 2 ? 13 : 11, k, k % 3 === 0 ? C.rose : C.gold, k % 3 === 0 ? C.roseDeep : C.goldDeep);
    }
  });
}

// petals and confetti
const PET = (() => { const r = rng(77); return Array.from({ length: 60 }, () => ({ x: r() * W, ts: 23.0 + r() * 7.4, v: 230 + r() * 160, amp: 20 + r() * 50, f: 1 + r() * 2, rot: r() * TAU, c: [C.rose, C.roseDeep, C.gold, C.rose][Math.floor(r() * 4)] })); })();
function petals(ctx, t, top) {
  PET.forEach((p, i) => {
    const tau = t - p.ts;
    if (tau < 0) return;
    const y = -30 + p.v * tau;
    if (y > GROUND + 10) return;
    if (top && y > 1000) return;
    const x = p.x + Math.sin(tau * p.f * 2 + i) * p.amp;
    ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot + tau * 2);
    ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(tau * p.f * 3)));
    ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, TAU); ctx.fill();
    ctx.restore();
  });
}
const CONF = (() => { const r = rng(5); return Array.from({ length: 36 }, (_, i) => ({ a: -Math.PI / 2 + (r() - 0.5) * 2.4, v: 700 + r() * 600, c: [C.gold, C.rose, C.roseDeep, C.sage][i % 4], w: 10 + r() * 8 })); })();
function confetti(ctx, t) {
  const t0 = T.bigLand - 0.2;
  if (t < t0 || t > t0 + 1.6) return;
  const tau = t - t0;
  CONF.forEach((c, i) => {
    const drag = (1 - Math.exp(-2.5 * tau)) / 2.5;
    const x = 540 + Math.cos(c.a) * c.v * drag, y = 1180 + Math.sin(c.a) * c.v * drag + 420 * tau * tau;
    ctx.save(); ctx.globalAlpha = 1 - prog(tau, 1.1, 1.6); ctx.translate(x, y); ctx.rotate(tau * 9 + i);
    ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -4, c.w, 8); ctx.restore();
  });
}

// ---------------------------------------------------------------- end card
const TITLE = 'Plan My Wedding';
function endCard(ctx, t) {
  if (t < T.title) return;
  // title letters drop in
  let size = 124;
  ctx.font = F.serif(size);
  let w = ctx.measureText(TITLE).width;
  if (w > 940) { size = Math.floor(size * 940 / w); ctx.font = F.serif(size); w = ctx.measureText(TITLE).width; }
  const y = 640;
  let x = 540 - w / 2;
  [...TITLE].forEach((ch, i) => {
    const cw = ctx.measureText(ch).width;
    const u = prog(t, T.title + i * 0.035, T.title + i * 0.035 + 0.4);
    if (u > 0) {
      ctx.save();
      ctx.globalAlpha = clamp(u * 3);
      ctx.translate(x + cw / 2, y - (1 - ease.outBack(u, 2.2)) * 70);
      ctx.rotate((1 - ease.outCubic(u)) * (i % 2 ? 0.25 : -0.25));
      ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    x += cw;
  });
  // swash underline
  const su = ease.inOutCubic(prog(t, 27.55, 27.95));
  if (su > 0) {
    const pts = []; for (let k = 0; k <= 40 * su; k++) { const v = k / 40; pts.push({ x: 540 - w / 2 + 20 + v * (w - 40), y: y + 34 + Math.sin(v * Math.PI) * 14 - v * 8 }); }
    if (pts.length > 1) line(ctx, pts, C.rose, 10);
  }
  // feature line
  const fu = ease.outCubic(prog(t, 27.75, 28.1));
  if (fu > 0) {
    ctx.save(); ctx.globalAlpha = fu;
    ctx.fillStyle = C.roseDeep; ctx.font = F.sans(36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Vendors  ·  Checklist  ·  Budget  ·  Guests', 540, 752 + (1 - fu) * 20);
    ctx.restore();
  }
  // CTA button
  const bu = prog(t, T.button, T.button + 0.38);
  if (bu > 0) {
    const press = t > T.press && t < T.press + 0.18 ? Math.sin(Math.PI * prog(t, T.press, T.press + 0.18)) : 0;
    const s = ease.outBack(bu, 1.8) * (1 - 0.06 * press);
    const bw = 700, bh = 132, by = 905;
    ctx.save(); ctx.translate(540, by); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(58,36,48,0.2)'; rr(ctx, -bw / 2 + 6, -bh / 2 + 12 * (1 - press), bw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = C.ink; rr(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fill();
    // generic play triangle (not a store logo)
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(-250, -26); ctx.lineTo(-206, 0); ctx.lineTo(-250, 26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ivory; ctx.font = F.sans(46); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Explore on Google Play', 30, 3);
    ctx.restore();
    const ru = prog(t, T.press + 0.1, T.press + 0.7);
    if (ru > 0 && ru < 1) {
      ctx.save(); ctx.globalAlpha = 1 - ru; ctx.strokeStyle = C.gold; ctx.lineWidth = 6;
      const g = ease.outCubic(ru) * 40;
      rr(ctx, 540 - bw / 2 - g, by - bh / 2 - g, bw + 2 * g, bh + 2 * g, bh / 2 + g); ctx.stroke(); ctx.restore();
    }
  }
}

// ---------------------------------------------------------------- frame
export function drawCelebrate(ctx, t, phoneMod) {
  ctx.drawImage(celebPaper, 0, 0, W, H);
  // warm glow behind the arch
  const gl = seg(t, 22.8, 23.6);
  if (gl > 0) {
    const gr = ctx.createRadialGradient(540, 1150, 50, 540, 1150, 700);
    gr.addColorStop(0, `rgba(230,165,60,${0.16 * gl})`); gr.addColorStop(1, 'rgba(230,165,60,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }
  floor(ctx, '#EBDCCB');
  // stage group scales down for the end card (anchored on the floor)
  const z = ease.inOutCubic(prog(t, T.zoomOut, T.zoomOut + 0.6));
  const k = lerp(1, 0.6, z);
  ctx.save();
  ctx.translate(540, GROUND); ctx.scale(k, k); ctx.translate(-540, -GROUND);
  drawArch(ctx, t);
  GUESTS.forEach((g, i) => { if (t > 23.2) drawFig(ctx, geom(guestPose(g, i, t)), { who: g.who }); });
  ctx.restore();

  // the planner world drops away during the transition
  if (t < 22.9 && phoneMod) {
    const d = ease.inBack(prog(t, 22.36, 22.86), 1.4);
    phoneMod.drawPhone(ctx, t, { drop: d, noChars: true });
  }
  ctx.save();
  ctx.translate(540, GROUND); ctx.scale(k, k); ctx.translate(-540, -GROUND);
  const PA = coupleBase(t, 'A', phoneMod.poseA4), PB = coupleBase(t, 'B', phoneMod.poseB4);
  const trail = [0, 1, 2, 3, 4, 5, 6].map((j) => geom(coupleBase(Math.max(22.4, t - j * 0.045), 'A', phoneMod.poseA4)).neck);
  drawFig(ctx, geom(PB), { who: 'B' });
  drawFig(ctx, geom(PA), { who: 'A', trail, scarfFlare: PA.scarfFlare || 0 });
  confetti(ctx, t);
  ctx.restore();
  petals(ctx, t, false);
  garlands(ctx, t);
  endCard(ctx, t);
}
