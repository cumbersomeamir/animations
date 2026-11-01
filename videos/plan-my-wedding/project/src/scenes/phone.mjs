// S4 (12.5-22.3s): inside the stylized planner. Three panels the camera pans across:
// vendors (browse / save / quote) -> checklist + budget -> invitations + RSVPs.
import { C, W, H, GROUND, F, card, rr, line, circle, check, heart, icon, label, fitText } from '../lib/paper.mjs';
import { ease, seg, prog, kf, wobble, shake, lerp, clamp, qb, TAU, rng } from '../lib/core.mjs';
import { geom, drawFig, walk, POSES, BASE } from '../lib/rig.mjs';
import { T } from '../cues.mjs';
import { reach, floor, pencil, stamp, stampMark, magnifier, jar, envelope, plane } from './props.mjs';
import { screenPaper } from './desk.mjs';

const S = 1.2; // character scale inside the planner

export const camX = (t) => kf(t, [[12.5, 0], [T.pan1, 0], [T.pan1 + 0.55, 1080, ease.inOutCubic], [T.pan2, 1080], [T.pan2 + 0.55, 2160, ease.inOutCubic]]);

function mixP(a, b, u) {
  const o = { ...a };
  for (const k of ['aL', 'aR', 'lL', 'lR']) if (Array.isArray(a[k]) && Array.isArray(b[k])) o[k] = [lerp(a[k][0], b[k][0], u), lerp(a[k][1], b[k][1], u)];
  o.lean = lerp(a.lean ?? 0, b.lean ?? 0, u);
  return o;
}
const landSquash = (t, tl) => { const v = prog(t, tl, tl + 0.3); return v > 0 && v < 1 ? Math.sin(Math.PI * v) * (1 - v * 0.4) : 0; };

function run(P, t, ta, tb, x0, x1, amp = 1.3) {
  const u = prog(t, ta, tb);
  const wk = walk((t - ta) * 16, amp);
  return { ...P, ...wk, x: lerp(x0, x1, ease.inOutSine(u)), face: x1 > x0 ? 1 : -1 };
}

// ---------------------------------------------------------------- vendors panel data
const VENDORS = [
  { l: 'Venue', ic: 'venue', c: C.sageTint },
  { l: 'Decorator', ic: 'flower', c: C.butter },
  { l: 'Photographer', ic: 'camera', c: C.roseTint },
  { l: 'Caterer', ic: 'cloche', c: C.butter },
  { l: 'DJ', ic: 'music', c: C.sageTint },
  { l: 'Mehendi artist', ic: 'mehendi', c: C.roseTint },
];
const carC = (t) => kf(t, [[12.5, -3.4], [12.95, 0, ease.outCubic], [T.swipe1, 0], [T.swipe1 + 0.32, 1, ease.outBack], [T.swipe2, 1], [T.swipe2 + 0.32, 2, ease.outBack]]);
const TRAY = { x: 925, y: 610 };
const VS = 1.18; // vendor card scale
export const HEART = { x: 540 + 95 * 1.08 * VS, y: 935 + 138 * 1.08 * VS };
function vendorState(k, t) {
  const gap = k > 2 ? seg(t, 14.32, 14.66, ease.outBack) : 0;
  const c = carC(t);
  const vel = (c - carC(t - 1 / 30)) * 30;
  let x = 540 + (k - gap - c) * 390, y = 935, s = VS * lerp(1.08, 0.9, clamp(Math.abs(x - 540) / 390)), rot = clamp(-vel * 0.03, -0.25, 0.25), alpha = 1;
  if (k === 2 && t > T.heartTap + 0.1) {
    const u = prog(t, T.heartTap + 0.1, T.saved);
    const e = ease.inOutCubic(u);
    const p = qb({ x, y }, { x: 800, y: 560 }, TRAY, e);
    x = p.x; y = p.y; s = lerp(s, 0.28, e); rot = lerp(0, 0.1, e) + Math.sin(u * Math.PI) * 0.4;
  }
  if (k === 3 && t > T.stamp) { const w = wobble(t, T.stamp, 4, 7, 1); s *= 1 + 0.05 * w; y += 10 * Math.max(0, w); }
  return { x, y, s, rot, alpha };
}
function drawVendor(ctx, k, st, t) {
  const v = VENDORS[k];
  card(ctx, { x: st.x, y: st.y, w: 290, h: 380, r: 22, rot: st.rot, sx: st.s, sy: st.s, fill: C.ivory }, (g) => {
    g.fillStyle = v.c; rr(g, -145, -190, 290, 205, 22); g.fill(); g.fillRect(-145, -20, 290, 35);
    g.save(); g.translate(0, -90); icon[v.ic](g, 120); g.restore();
    g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    fitText(g, v.l, F.serif, 40, 250);
    g.fillText(v.l, 0, 60);
    // quote pill
    g.strokeStyle = C.inkSoft; g.lineWidth = 2.5; rr(g, -125, 114, 160, 48, 24); g.stroke();
    g.fillStyle = C.inkSoft; g.font = F.sans(21); g.fillText('Request quote', -45, 139);
    // heart button
    const saved = k === 2 && t > T.heartTap;
    const pu = saved ? wobble(t, T.heartTap, 3, 6, 1) : 0;
    circle(g, 95, 138, 30, saved ? C.roseTint : C.ivory, C.inkSoft, 2.5);
    heart(g, 95, 142, 15 * (1 + 0.5 * pu), saved ? C.roseDeep : null, saved ? null : C.inkSoft, 3);
    if (k === 3 && t > T.stamp) {
      const u = prog(t, T.stamp, T.stamp + 0.1);
      stampMark(g, 0, 110, 'QUOTE REQUESTED', -0.12, lerp(1.6, 1, ease.outCubic(u)), u * 0.95);
    }
  });
}
function heartBurst(ctx, t) {
  if (t < T.heartTap || t > T.heartTap + 0.6) return;
  const u = prog(t, T.heartTap, T.heartTap + 0.6);
  const c = HEART;
  circle(ctx, c.x, c.y, 30 + u * 90, null, `rgba(192,108,128,${0.6 * (1 - u)})`, 6 * (1 - u) + 1);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.42;
    const r = 40 + ease.outCubic(u) * 150;
    ctx.save(); ctx.globalAlpha = 1 - u;
    heart(ctx, c.x + Math.cos(a) * r, c.y + Math.sin(a) * r - u * 40, 14 * (1 - u * 0.4), i % 2 ? C.rose : C.roseDeep);
    ctx.restore();
  }
}
function drawTray(ctx, t) {
  const a = seg(t, 13.75, 14.0);
  if (a <= 0) return;
  card(ctx, { x: TRAY.x, y: TRAY.y + 8, w: 220, h: 140, r: 18, fill: C.roseTint, alpha: a, sx: 0.8 + 0.2 * ease.outBack(a), sy: 0.8 + 0.2 * ease.outBack(a) }, (g) => {
    g.fillStyle = C.ink; g.font = F.sans(26); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('Saved', -14, -40);
    heart(g, 52, -38, 12, C.roseDeep);
    g.fillStyle = 'rgba(58,36,48,0.08)'; rr(g, -90, -12, 180, 70, 12); g.fill();
  });
  if (t > T.saved) {
    const u = prog(t, T.saved, T.saved + 0.25);
    circle(ctx, TRAY.x + 98, TRAY.y - 52, 22 * ease.outBack(u), C.sage);
    check(ctx, TRAY.x + 98, TRAY.y - 52, 22, u, C.ivory, 6);
  }
}

// ---------------------------------------------------------------- checklist + budget panel
const P1 = 1080;
const LIST = { x: P1 + 330, top: 600, w: 450, h: 690 };
const ROWS = ['Book venue', 'Pick photographer', 'Menu tasting', 'Send invites'];
const rowY = (i) => LIST.top + 175 + i * 112;
const TICKS = [T.tick1, T.tick2, T.tick3];
const JAR = { x: P1 + 850, bottom: GROUND, w: 230, h: 320 };
const boxC = (i) => ({ x: LIST.x - LIST.w / 2 + 62, y: rowY(i) });
function drawList(ctx, t) {
  const u = ease.outCubic(prog(t, T.unroll, T.unroll + 0.45));
  if (t < T.unroll - 0.2) return;
  const h = 60 + LIST.h * u;
  ctx.save();
  card(ctx, { x: LIST.x, y: LIST.top + h / 2, w: LIST.w, h, r: 8, fill: C.ivory });
  ctx.beginPath(); ctx.rect(LIST.x - LIST.w / 2, LIST.top, LIST.w, h); ctx.clip();
  ctx.fillStyle = C.ink; ctx.font = F.serif(48); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Checklist', LIST.x - LIST.w / 2 + 34, LIST.top + 70);
  ctx.fillStyle = C.rose; ctx.fillRect(LIST.x - LIST.w / 2 + 34, LIST.top + 104, 120, 6);
  ROWS.forEach((r, i) => {
    const b = boxC(i);
    const done = i < 3 ? prog(t, TICKS[i], TICKS[i] + 0.2) : 0;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4; rr(ctx, b.x - 26, b.y - 26, 52, 52, 10); ctx.stroke();
    if (done > 0) { ctx.fillStyle = C.sageTint; rr(ctx, b.x - 24, b.y - 24, 48, 48, 9); ctx.fill(); }
    check(ctx, b.x + 2, b.y, 34, done, C.sage, 9);
    ctx.fillStyle = done >= 1 ? C.inkSoft : C.ink; ctx.font = F.sans(33); ctx.textAlign = 'left';
    ctx.fillText(r, b.x + 48, b.y + 2);
  });
  ctx.restore();
  // paper roll at the bottom edge
  ctx.fillStyle = C.paperDark; rr(ctx, LIST.x - LIST.w / 2 - 14, LIST.top + h - 18, LIST.w + 28, 40, 20); ctx.fill();
  ctx.strokeStyle = 'rgba(58,36,48,0.2)'; ctx.lineWidth = 2; ctx.stroke();
}
const coinsIn = (t) => TICKS.reduce((n, tk) => n + seg(t, tk + 0.45, tk + 0.6), 0);
function drawJar(ctx, t) {
  const a = seg(t, 15.9, 16.3, ease.outBack);
  if (a <= 0) return;
  ctx.save();
  ctx.translate(JAR.x, JAR.bottom); ctx.scale(a, a); ctx.translate(-JAR.x, -JAR.bottom);
  const lvl = 0.2 + 0.15 * coinsIn(t);
  jar(ctx, JAR.x, JAR.bottom, JAR.w, JAR.h, lvl, 0.82);
  card(ctx, { x: JAR.x, y: JAR.bottom - 120, w: 170, h: 62, r: 8, fill: C.ivory, rot: -0.03 }, (g) => {
    g.fillStyle = C.ink; g.font = F.serif(36); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Budget', 0, 2);
  });
  ctx.fillStyle = C.roseDeep; ctx.font = F.sans(24); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('plan', JAR.x + JAR.w / 2 + 30, JAR.bottom - JAR.h * 0.82);
  if (t > T.thumbs) {
    const u = prog(t, T.thumbs, T.thumbs + 0.5);
    ctx.globalAlpha = 1 - u;
    for (let i = 0; i < 8; i++) { const ang = (i / 8) * TAU; const r0 = 30 + u * 70; line(ctx, [{ x: JAR.x + Math.cos(ang) * r0, y: JAR.bottom - JAR.h * 0.82 + Math.sin(ang) * r0 }, { x: JAR.x + Math.cos(ang) * (r0 + 18), y: JAR.bottom - JAR.h * 0.82 + Math.sin(ang) * (r0 + 18) }], C.sage, 6); }
  }
  ctx.restore();
}
function drawCoins(ctx, t) {
  TICKS.forEach((tk, i) => {
    const u = prog(t, tk + 0.08, tk + 0.55);
    if (u <= 0 || u >= 1) return;
    const p0 = { x: LIST.x + LIST.w / 2 - 30, y: rowY(i) }, p2 = { x: JAR.x, y: JAR.bottom - JAR.h + 20 };
    const p = qb(p0, { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - 260 }, p2, ease.inOutQuad(u));
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(Math.cos(u * 14), 1); icon.coin(ctx, 60); ctx.restore();
  });
}
// pencil tip path for the ticks (world coords)
function tickTip(t) {
  const rest = { x: P1 + 470, y: 1240 };
  for (let i = 0; i < 3; i++) {
    const tk = TICKS[i], b = boxC(i);
    const start = { x: b.x - 15, y: b.y };
    if (t >= tk - 0.2 && t < tk) { const from = i === 0 ? rest : { x: boxC(i - 1).x + 22, y: boxC(i - 1).y - 18 }; return mixPt(from, start, ease.inOutQuad(prog(t, tk - 0.2, tk))); }
    if (t >= tk && t < tk + 0.2) {
      const u = prog(t, tk, tk + 0.2);
      const pts = [{ x: b.x - 15, y: b.y }, { x: b.x - 3, y: b.y + 13 }, { x: b.x + 22, y: b.y - 18 }];
      return u < 0.35 ? mixPt(pts[0], pts[1], u / 0.35) : mixPt(pts[1], pts[2], (u - 0.35) / 0.65);
    }
  }
  if (t >= TICKS[2] + 0.2) return mixPt({ x: boxC(2).x + 22, y: boxC(2).y - 18 }, rest, ease.inOutQuad(prog(t, TICKS[2] + 0.2, TICKS[2] + 0.5)));
  return rest;
}
const mixPt = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });

// ---------------------------------------------------------------- invitations panel
const P2 = 2160;
const HOUSES = [
  { x: 640, y: 830, c: C.roseTint, roof: C.roseDeep },
  { x: 830, y: 745, c: C.butter, roof: C.goldDeep },
  { x: 990, y: 865, c: C.sageTint, roof: C.sage },
  { x: 720, y: 1065, c: '#EFE2F0', roof: C.roseDeep },
  { x: 915, y: 1040, c: C.ivory, roof: C.goldDeep },
].map((h) => ({ ...h, x: h.x + P2 - 40 }));
const NAMES = ['Nani', 'Rohan', 'Priya', 'Sam', 'Aunty Neha'];
const rsvpT = (i) => T.rsvp0 + i * T.rsvpGap;
const SPLIT = { x: P2 + 700, y: 640 };
function drawHill(ctx) {
  ctx.fillStyle = '#F4DADD';
  ctx.beginPath();
  ctx.moveTo(P2 + 520, GROUND);
  ctx.bezierCurveTo(P2 + 560, 760, P2 + 760, 640, P2 + 900, 680);
  ctx.bezierCurveTo(P2 + 1020, 710, P2 + 1080, 760, P2 + 1120, 800);
  ctx.lineTo(P2 + 1120, GROUND); ctx.closePath(); ctx.fill();
}
function drawHouse(ctx, h, i, t) {
  const pop = t > rsvpT(i) ? wobble(t, rsvpT(i), 3, 6, 1) : 0;
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.scale(1 + pop * 0.06, 1 - pop * 0.06);
  ctx.fillStyle = 'rgba(58,36,48,0.14)'; ctx.fillRect(-62, -40, 132, 104);
  ctx.fillStyle = h.c; ctx.fillRect(-66, -46, 132, 100);
  ctx.fillStyle = h.roof;
  ctx.beginPath(); ctx.moveTo(-82, -40); ctx.lineTo(0, -112); ctx.lineTo(82, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.ink; rr(ctx, -18, 2, 36, 52, 16); ctx.fill();
  ctx.fillStyle = C.ivory; ctx.fillRect(28, -26, 26, 24);
  ctx.restore();
}
function drawGuest(ctx, h, i, t) {
  const tr = rsvpT(i);
  if (t < tr) return;
  const u = prog(t, tr, tr + 0.3);
  const P = { ...BASE, ...POSES.stand, x: h.x - 2, ground: h.y + 54, s: 0.42, face: i % 2 ? -1 : 1, mood: 'happy', lift: ease.outBack(u) * 24 - 24 + 24 * Math.min(1, u * 3) };
  const g0 = geom(P);
  const card0 = { x: g0.head.x + 34 * P.face, y: g0.head.y - 52 };
  const P2_ = reach(P, 'aR', card0, ease.outBack(u), -1);
  const g = geom(P2_);
  ctx.save(); ctx.globalAlpha = Math.min(1, u * 3);
  drawFig(ctx, g, { who: i % 2 ? 'B' : 'A' });
  card(ctx, { x: g.handR.x, y: g.handR.y - 26, w: 58, h: 52, r: 10, fill: C.sage, rot: 0.1 * P.face, sx: ease.outBack(u), sy: ease.outBack(u) }, (gg) => check(gg, 2, 0, 26, prog(t, tr + 0.08, tr + 0.3), C.ivory, 7));
  ctx.restore();
}
const CLIP = { w: 250, h: 330 };
function drawClipboard(ctx, c, t, rot) {
  card(ctx, { x: c.x, y: c.y, w: CLIP.w, h: CLIP.h, r: 14, fill: '#C9A27E', rot }, (g) => {
    g.fillStyle = C.ivory; rr(g, -CLIP.w / 2 + 14, -CLIP.h / 2 + 24, CLIP.w - 28, CLIP.h - 38, 6); g.fill();
    g.fillStyle = C.inkSoft; rr(g, -44, -CLIP.h / 2 - 8, 88, 34, 8); g.fill();
    g.fillStyle = C.ink; g.font = F.serif(30); g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText('Guest list', -CLIP.w / 2 + 30, -CLIP.h / 2 + 58);
    NAMES.forEach((n, i) => {
      const y = -CLIP.h / 2 + 108 + i * 46;
      g.fillStyle = C.ink; g.font = F.sans(25); g.fillText(n, -CLIP.w / 2 + 30, y);
      const d = prog(t, rsvpT(i) + 0.05, rsvpT(i) + 0.25);
      circle(g, CLIP.w / 2 - 40, y, 15, d > 0 ? C.sage : null, d > 0 ? null : C.inkSoft, 2.5);
      check(g, CLIP.w / 2 - 39, y, 15, d, C.ivory, 4.5);
    });
  });
}
function planeState(t, gB) {
  if (t < T.throwT) return null;
  if (t < T.split) {
    const u = prog(t, T.throwT, T.split);
    const p0 = { x: gB.handR.x, y: gB.handR.y };
    const c = { x: P2 + 560, y: 560 };
    const p = qb({ x: P2 + 600, y: 1150 }, c, SPLIT, ease.outQuad(u));
    const q = qb({ x: P2 + 600, y: 1150 }, c, SPLIT, ease.outQuad(Math.min(1, u + 0.03)));
    return [{ x: p.x, y: p.y, rot: Math.atan2(q.y - p.y, q.x - p.x), s: 120 }];
  }
  return HOUSES.map((h, i) => {
    const u = prog(t, T.split, rsvpT(i));
    if (u >= 1) return null;
    const door = { x: h.x, y: h.y + 20 };
    const c = { x: lerp(SPLIT.x, door.x, 0.5) + (i - 2) * 40, y: Math.min(SPLIT.y, door.y) - 120 + i * 20 };
    const p = qb(SPLIT, c, door, ease.inOutQuad(u));
    const q = qb(SPLIT, c, door, ease.inOutQuad(Math.min(1, u + 0.04)));
    return { x: p.x, y: p.y, rot: Math.atan2(q.y - p.y, q.x - p.x), s: lerp(80, 50, u) };
  }).filter(Boolean);
}

// ---------------------------------------------------------------- characters
export function poseA4(t) {
  let P = { ...BASE, ...POSES.stand, x: 400, ground: GROUND, s: S, face: 1, time: t, mood: 'happy' };
  if (t < T.land) { const u = prog(t, 12.5, T.land); return { ...P, ...POSES.jump, lift: (1 - ease.inQuad(u)) * 1400, mood: 'happy', lean: -0.1 }; }
  if (t < 13.1) return { ...P, ...mixP(POSES.stand, POSES.crouch, landSquash(t, T.land) * 0.8), mood: 'happy' };
  if (t < T.heartJump - 0.14) {
    // swipes
    P.mood = 'determined'; P.look = 1;
    for (const ts of [T.swipe1, T.swipe2]) {
      if (t > ts - 0.18 && t < ts + 0.38) {
        const a = seg(t, ts - 0.18, ts, ease.outQuad), b = seg(t, ts, ts + 0.25, ease.inOutCubic);
        const tg = { x: lerp(600, 420, b), y: 1130 - Math.sin(Math.PI * b) * 30 };
        P.lean = 0.12 * a - 0.1 * b;
        return reach(P, 'aR', tg, a * (1 - seg(t, ts + 0.25, ts + 0.38)), -1);
      }
    }
    return P;
  }
  if (t < 14.22) {
    const c = seg(t, T.heartJump - 0.14, T.heartJump, ease.inOutQuad);
    if (t < T.heartJump) return { ...P, ...mixP(POSES.stand, POSES.crouch, c * 0.7), mood: 'determined' };
    const u = prog(t, T.heartJump, 14.2);
    P = { ...P, ...POSES.jump, x: lerp(400, 500, ease.outQuad(u)), lift: Math.sin(Math.PI * u) * 120, mood: 'happy', look: 1, lean: 0.1 };
    return reach(P, 'aR', HEART, Math.sin(Math.PI * u), -1);
  }
  if (t < T.pan1) {
    P.x = 500;
    P = { ...P, ...mixP(POSES.stand, POSES.crouch, landSquash(t, 14.2) * 0.6) };
    if (t > 14.6) { P.look = -0.2; }
    if (t > T.stamp + 0.1) { P.lift = Math.abs(Math.sin((t - T.stamp) * 12)) * 12 * (1 - prog(t, T.stamp, T.pan1)); P = { ...P, aL: [2.6, 0.2], aR: [-2.6, -0.2] }; }
    return P;
  }
  if (t < T.pan1 + 0.6) return { ...run(P, t, T.pan1, T.pan1 + 0.6, 500, P1 + 470), mood: 'happy' };
  // checklist: A stands in front of the scroll, facing left, pencil ticks boxes
  P.x = P1 + 470; P.face = -1; P.mood = 'determined'; P.look = 0.9;
  if (t < T.pan2) {
    if (t > TICKS[2] + 0.4) { P.mood = 'happy'; }
    return P;
  }
  if (t < T.pan2 + 0.6) return { ...run(P, t, T.pan2, T.pan2 + 0.6, P1 + 470, P2 + 170), mood: 'happy' };
  P.x = P2 + 170; P.face = 1; P.mood = 'happy'; P.look = 1;
  if (t > 21.9 && t < T.jumpOut - 0.15) P.lift = Math.abs(Math.sin((t - 21.9) * 9)) * 18;
  if (t > T.jumpOut - 0.16) P = { ...P, ...mixP(POSES.stand, POSES.crouch, seg(t, T.jumpOut - 0.16, T.jumpOut) * 0.75) };
  return P;
}
export function poseB4(t) {
  let P = { ...BASE, ...POSES.stand, x: 830, ground: GROUND, s: S, face: -1, time: t, mood: 'happy' };
  const tl = T.land + 0.06;
  if (t < tl) { const u = prog(t, 12.5, tl); return { ...P, ...POSES.jump, lift: (1 - ease.inQuad(u)) * 1500, lean: -0.1 }; }
  if (t < 14.5) {
    P = { ...P, ...mixP(POSES.stand, POSES.crouch, landSquash(t, tl) * 0.8) };
    if (t > T.heartTap) { P.mood = 'happy'; P.lift = Math.abs(Math.sin((t - T.heartTap) * 10)) * 10 * (1 - prog(t, T.heartTap, 14.5)); }
    return P;
  }
  if (t < 14.68) return { ...run(P, t, 14.5, 14.68, 830, 720, 0.9), face: -1, mood: 'determined' };
  P.x = 720; P.mood = 'determined';
  if (t < T.stampJump) return { ...P, ...mixP(POSES.stand, POSES.crouch, seg(t, 14.68, T.stampJump) * 0.75), mood: 'determined' };
  if (t < 15.25) {
    const u = prog(t, T.stampJump, 15.22);
    const up = t < T.stamp ? ease.outQuad(prog(t, T.stampJump, T.stamp)) : 1 - ease.inQuad(prog(t, T.stamp, 15.22));
    P = { ...P, ...POSES.jump, lift: up * 115, mood: 'determined', lean: -0.05 };
    const hand = t < T.stamp - 0.05 ? { x: 640, y: 1040 - up * 200 } : { x: 600, y: 990 };
    return reach(P, 'aR', hand, 1, 1);
  }
  if (t < T.pan1) return { ...P, ...mixP(POSES.stand, POSES.crouch, landSquash(t, 15.22) * 0.6), mood: 'happy' };
  if (t < T.pan1 + 0.62) return { ...run(P, t, T.pan1, T.pan1 + 0.62, 720, P1 + 700), mood: 'happy' };
  P.x = P1 + 700; P.face = 1; P.mood = 'neutral';
  if (t < T.pan2) {
    if (t > TICKS[0]) P.look = -0.6;
    if (t > T.lens - 0.1) {
      P.mood = 'determined';
      const g = geom(P);
      const lens = { x: g.head.x + 30, y: g.head.y - 2 };
      P = reach(P, 'aR', { x: lens.x - 10, y: lens.y + 105 }, seg(t, T.lens - 0.1, T.lens + 0.15), -1);
      P.lean = 0.08 * seg(t, T.lens, T.lens + 0.3);
      if (t > T.thumbs - 0.1) { P.mood = 'happy'; P = reach(P, 'aL', { x: g.hip.x + 60, y: g.head.y - 30 }, seg(t, T.thumbs - 0.12, T.thumbs + 0.05, ease.outBack), 1); }
    }
    return P;
  }
  if (t < T.pan2 + 0.6) return { ...run(P, t, T.pan2, T.pan2 + 0.6, P1 + 700, P2 + 500), mood: 'happy' };
  P.x = P2 + 500; P.face = 1; P.mood = 'happy';
  const g = geom(P);
  if (t < T.fold + 0.35) {
    return reach(reach(P, 'aR', { x: g.hip.x + 70, y: g.hip.y - 120 }, 1, 1), 'aL', { x: g.hip.x + 40, y: g.hip.y - 110 }, seg(t, 19.6, 19.8), 1);
  }
  if (t < T.throwT) {
    const w = seg(t, T.fold + 0.35, T.throwT, ease.inOutQuad);
    P.lean = -0.2 * w; P.mood = 'determined';
    return reach(P, 'aR', { x: g.hip.x - 120 * w + 70 * (1 - w), y: g.hip.y - 120 - 90 * w }, 1, 1);
  }
  if (t < 21.2) {
    const f = seg(t, T.throwT, T.throwT + 0.12, ease.outQuad), r = seg(t, T.throwT + 0.25, 21.2);
    P.lean = lerp(-0.2, 0.25, f) * (1 - r); P.mood = 'determined';
    P.lL = [lerp(0.07, 0.5, f * (1 - r)), lerp(0, -0.4, f * (1 - r))];
    return reach(P, 'aR', { x: g.hip.x + lerp(-120, 170, f), y: g.hip.y - lerp(210, 150, f) }, 1 - r, 1);
  }
  if (t > 21.9 && t < T.jumpOut - 0.15) { P = { ...P, aL: [2.6, 0.2], aR: [-2.6, -0.2] }; P.lift = Math.abs(Math.sin((t - 21.9) * 9 + 1)) * 16; }
  if (t > T.jumpOut - 0.16) P = { ...P, ...mixP(POSES.stand, POSES.crouch, seg(t, T.jumpOut - 0.16, T.jumpOut) * 0.75) };
  return P;
}

const trail4 = (t) => [0, 1, 2, 3, 4, 5, 6].map((k) => geom(poseA4(Math.max(12.5, t - k * 0.045))).neck);

// pencil: leaning against the scroll until A grabs it
function pencilPose(t, gA) {
  const lean = { hand: { x: P1 + 600, y: GROUND - 300 }, tip: { x: P1 + 640, y: GROUND - 6 } };
  if (t < 16.15) return { ...lean, held: false };
  return { held: true };
}

// ---------------------------------------------------------------- frame
export function drawPhone(ctx, t, opt = {}) {
  const cx = camX(t);
  ctx.save();
  if (opt.drop) { ctx.translate(540, 960 + opt.drop * 1600); ctx.rotate(opt.drop * 0.08); ctx.translate(-540, -960); }
  ctx.drawImage(screenPaper, 0, 0, W, H);
  // planner dot grid (scrolls with the camera)
  ctx.fillStyle = 'rgba(192,108,128,0.16)';
  const off = ((cx % 60) + 60) % 60;
  for (let y = 120; y < GROUND; y += 60) for (let x = -off; x < W + 60; x += 60) ctx.fillRect(x - 2, y - 2, 4, 4);
  floor(ctx, '#F0D6DA');
  ctx.translate(-cx, 0);
  // floor marks
  ctx.fillStyle = 'rgba(192,108,128,0.25)';
  for (let x = Math.floor(cx / 140) * 140; x < cx + W + 140; x += 140) ctx.fillRect(x, GROUND + 40, 60, 6);

  const PA = poseA4(t), PB = poseB4(t);
  let gA = geom(PA);
  const gB = geom(PB);

  // ---- panel 0
  if (cx < 1080) {
    drawTray(ctx, t);
    for (const k of [0, 1, 5, 4, 3]) drawVendor(ctx, k, vendorState(k, t), t);
    drawVendor(ctx, 2, vendorState(2, t), t);
    heartBurst(ctx, t);
  }
  // ---- panel 1
  if (cx > 0 && cx < 2160) {
    drawList(ctx, t);
    drawJar(ctx, t);
  }
  // ---- panel 2
  if (cx > 1080) {
    drawHill(ctx);
    HOUSES.forEach((h, i) => drawHouse(ctx, h, i, t));
    HOUSES.forEach((h, i) => drawGuest(ctx, h, i, t));
  }

  if (!opt.noChars) {
    // A (with pencil in panel 1, clipboard in panel 2)
    let PA2 = PA;
    const pz = pencilPose(t, gA);
    if (!pz.held && cx > 0) pencil(ctx, pz.hand, pz.tip, S);
    let tip = null;
    if (pz.held && t < T.pan2) {
      tip = tickTip(t);
      const sh = gA.sh, d = Math.hypot(tip.x - sh.x, tip.y - sh.y), L = 330;
      const k = Math.min(L, d - 70) / d;
      const grab = seg(t, 16.15, 16.4);
      const hand = { x: lerp(P1 + 600, tip.x - (tip.x - sh.x) * k, grab), y: lerp(GROUND - 300, tip.y - (tip.y - sh.y) * k, grab) };
      PA2 = reach(PA, 'aR', hand, 1, 1);
      if (grab < 1) tip = { x: lerp(P1 + 640, tip.x, grab), y: lerp(GROUND - 6, tip.y, grab) };
    }
    let clip = null;
    if (t > T.pan2) {
      const g0 = geom(PA);
      const raise = t > 21.9 ? Math.abs(Math.sin((t - 21.9) * 9)) * 30 : 0;
      clip = { x: g0.hip.x + 120, y: g0.hip.y - 150 - raise };
      PA2 = reach(reach(PA, 'aR', { x: clip.x - 40, y: clip.y + 120 }, 1, -1), 'aL', { x: clip.x - 100, y: clip.y + 60 }, 1, -1);
    }
    gA = geom(PA2);
    drawFig(ctx, gA, { who: 'A', trail: trail4(t) });
    if (tip) pencil(ctx, gA.handR, tip, S);
    if (clip) drawClipboard(ctx, clip, t, 0.04);

    // B (stamp in panel 0, magnifier in panel 1, invitation in panel 2)
    drawFig(ctx, gB, { who: 'B' });
    if (t > 14.42 && t < T.pan1 + 0.3) { const a = ease.outBack(prog(t, 14.42, 14.6)); stamp(ctx, gB.handR, S * a, t > T.stampJump - 0.2 && t < 15.3 ? 0 : -0.35); }
    if (t > T.lens - 0.1 && t < T.pan2) {
      const lens = { x: gB.head.x + 30, y: gB.head.y - 2 };
      const a = seg(t, T.lens - 0.1, T.lens + 0.15);
      const lc = { x: lerp(gB.handR.x, lens.x, a), y: lerp(gB.handR.y - 100, lens.y, a) };
      magnifier(ctx, gB.handR, lc, 62, (g) => {
        // the classic gag: one giant eye keeping watch
        const blink = t > 18.38 && t < 18.48;
        if (blink) line(g, [{ x: lc.x - 26, y: lc.y }, { x: lc.x + 26, y: lc.y }], C.ink, 7);
        else { circle(g, lc.x + 6, lc.y, 20, C.ink); circle(g, lc.x + 12, lc.y - 7, 6, C.ivory); }
        g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(lc.x - 20, lc.y - 38); g.lineTo(lc.x + 30, lc.y - 34); g.stroke();
      });
      if (t > T.thumbs - 0.05) {
        // thumb up on the left hand
        const hL = gB.handL;
        line(ctx, [hL, { x: hL.x + 2, y: hL.y - 26 }], C.ink, 11 * S);
      }
    }
    if (t > T.pan2 + 0.3 && t < T.throwT) {
      const fold = prog(t, T.fold, T.fold + 0.3);
      envelope(ctx, gB.handR.x + 20, gB.handR.y - 30, 150, 100, -0.1, fold);
    }
    drawCoins(ctx, t);
    const pl = planeState(t, gB);
    if (pl) {
      pl.forEach((p) => plane(ctx, p.x, p.y, p.s, p.rot));
      if (t > T.split && t < T.split + 0.3) {
        const u = prog(t, T.split, T.split + 0.3);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; const r0 = 20 + u * 80; line(ctx, [{ x: SPLIT.x + Math.cos(a) * r0, y: SPLIT.y + Math.sin(a) * r0 }, { x: SPLIT.x + Math.cos(a) * (r0 + 20 * (1 - u)), y: SPLIT.y + Math.sin(a) * (r0 + 20 * (1 - u)) }], C.gold, 6); }
      }
    }
  }
  ctx.restore();
}
