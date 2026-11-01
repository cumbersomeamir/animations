// Props shared by several scenes: pencil, phone, stamp, magnifier, envelope/plane, jar, floor.
import { C, W, H, GROUND, F, rr, line, circle, heart, icon, label, card } from '../lib/paper.mjs';
import { rng, TAU, clamp, lerp } from '../lib/core.mjs';
import { geom } from '../lib/rig.mjs';

/** Blend an arm toward a world target with 2-bone IK. */
export function reach(P, arm, target, w = 1, bend = 1) {
  if (!target || w <= 0) return P;
  const g = geom(P);
  const fk = arm === 'aR' ? g.handR : g.handL;
  return { ...P, [arm]: { ik: { x: lerp(fk.x, target.x, w), y: lerp(fk.y, target.y, w) }, bend } };
}

const floorEdge = (() => {
  const r = rng(99), pts = [];
  for (let x = -20; x <= W + 20; x += 18) pts.push({ x, y: (r() - 0.5) * 7 });
  return pts;
})();

export function floor(ctx, color = C.paperDark, y = GROUND) {
  ctx.fillStyle = 'rgba(58,36,48,0.07)';
  ctx.beginPath();
  ctx.moveTo(-20, y + 6);
  floorEdge.forEach((p) => ctx.lineTo(p.x, y + 6 + p.y));
  ctx.lineTo(W + 20, H + 20); ctx.lineTo(-20, H + 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, y);
  floorEdge.forEach((p) => ctx.lineTo(p.x, y + p.y));
  ctx.lineTo(W + 20, H + 20); ctx.lineTo(-20, H + 20); ctx.closePath(); ctx.fill();
}

/** Giant pencil from the hand to the tip (tip is the writing point). */
export function pencil(ctx, hand, tip, s = 1) {
  const dx = tip.x - hand.x, dy = tip.y - hand.y, l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l;
  const back = { x: hand.x - ux * 70 * s, y: hand.y - uy * 70 * s };
  const total = l + 70 * s;
  ctx.save();
  ctx.translate(back.x, back.y);
  ctx.rotate(Math.atan2(uy, ux));
  const w = 26 * s;
  ctx.fillStyle = 'rgba(58,36,48,0.15)';
  ctx.fillRect(4, -w / 2 + 8, total - 60 * s, w);
  ctx.fillStyle = C.rose; rr(ctx, 0, -w / 2, 34 * s, w, 8 * s); ctx.fill();
  ctx.fillStyle = C.inkSoft; ctx.fillRect(30 * s, -w / 2, 16 * s, w);
  ctx.fillStyle = C.gold; ctx.fillRect(46 * s, -w / 2, total - 46 * s - 56 * s, w);
  ctx.fillStyle = C.goldDeep; ctx.fillRect(46 * s, -2 * s, total - 46 * s - 56 * s, 5 * s);
  ctx.fillStyle = '#EBCB9C';
  ctx.beginPath(); ctx.moveTo(total - 56 * s, -w / 2); ctx.lineTo(total, 0); ctx.lineTo(total - 56 * s, w / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.moveTo(total - 20 * s, -w * 0.18); ctx.lineTo(total, 0); ctx.lineTo(total - 20 * s, w * 0.18); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/** Phone body + screen. Returns screen rect in world coords. content(g, rect) draws inside (clipped). */
export const PHONE = { w: 400, h: 780, sw: 360, sh: 640 };
export function phone(ctx, x, y, sc, rot, content) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(58,36,48,0.18)';
  rr(ctx, -PHONE.w / 2 + 10, -PHONE.h / 2 + 16, PHONE.w, PHONE.h, 56); ctx.fill();
  ctx.fillStyle = C.ink;
  rr(ctx, -PHONE.w / 2, -PHONE.h / 2, PHONE.w, PHONE.h, 56); ctx.fill();
  ctx.save();
  rr(ctx, -PHONE.sw / 2, -PHONE.sh / 2, PHONE.sw, PHONE.sh, 26);
  ctx.clip();
  content && content(ctx, { x: -PHONE.sw / 2, y: -PHONE.sh / 2, w: PHONE.sw, h: PHONE.sh });
  ctx.restore();
  // speaker slot
  ctx.fillStyle = '#5A4350';
  rr(ctx, -40, -PHONE.h / 2 + 32, 80, 10, 5); ctx.fill();
  ctx.restore();
}

export function stamp(ctx, hand, s = 1, rot = 0) {
  ctx.save();
  ctx.translate(hand.x, hand.y);
  ctx.rotate(rot);
  ctx.scale(s, s);
  circle(ctx, 0, -18, 20, C.roseDeep);
  ctx.fillStyle = C.goldDeep; ctx.fillRect(-9, -4, 18, 46);
  ctx.fillStyle = C.ink; rr(ctx, -46, 40, 92, 26, 6); ctx.fill();
  ctx.fillStyle = C.roseDeep; ctx.fillRect(-42, 64, 84, 10);
  ctx.restore();
}

export function stampMark(ctx, x, y, text, rot, sc, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.font = F.sans(30);
  const w = ctx.measureText(text).width + 40;
  ctx.strokeStyle = C.roseDeep; ctx.lineWidth = 5;
  rr(ctx, -w / 2, -30, w, 60, 8); ctx.stroke();
  ctx.lineWidth = 2; rr(ctx, -w / 2 + 7, -23, w - 14, 46, 5); ctx.stroke();
  ctx.fillStyle = C.roseDeep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}

export function magnifier(ctx, hand, lensC, r, inner) {
  // handle from hand to lens edge
  const dx = lensC.x - hand.x, dy = lensC.y - hand.y, l = Math.hypot(dx, dy) || 1;
  const edge = { x: lensC.x - (dx / l) * r, y: lensC.y - (dy / l) * r };
  line(ctx, [{ x: hand.x - (dx / l) * 20, y: hand.y - (dy / l) * 20 }, edge], C.goldDeep, 20);
  ctx.save();
  ctx.beginPath(); ctx.arc(lensC.x, lensC.y, r, 0, TAU); ctx.clip();
  ctx.fillStyle = 'rgba(255,249,240,0.55)'; ctx.fillRect(lensC.x - r, lensC.y - r, r * 2, r * 2);
  inner && inner(ctx);
  ctx.restore();
  circle(ctx, lensC.x, lensC.y, r, null, C.ink, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(lensC.x, lensC.y, r * 0.7, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
}

/** Glass budget jar standing at (x, bottomY). level 0..1. planned 0..1 dashed line. */
export function jar(ctx, x, bottom, w, h, level, planned, coinsSeed = 3) {
  const top = bottom - h;
  ctx.fillStyle = 'rgba(58,36,48,0.14)';
  rr(ctx, x - w / 2 + 8, top + 10, w, h, 34); ctx.fill();
  // coins fill (clip to jar)
  ctx.save();
  rr(ctx, x - w / 2, top, w, h, 34); ctx.clip();
  ctx.fillStyle = 'rgba(255,249,240,0.75)'; ctx.fillRect(x - w / 2, top, w, h);
  const fy = bottom - h * level;
  const r = rng(coinsSeed);
  ctx.fillStyle = C.gold; ctx.fillRect(x - w / 2, fy + 12, w, bottom - fy);
  for (let yy = bottom - 6; yy > fy; yy -= 16) {
    for (let xx = x - w / 2 + 10; xx < x + w / 2; xx += 36) {
      const ox = (r() - 0.5) * 10;
      ctx.fillStyle = r() < 0.5 ? C.goldDeep : '#F0BE5E';
      ctx.beginPath(); ctx.ellipse(xx + ox, yy, 18, 7, 0, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  // glass outline + shine
  ctx.strokeStyle = C.ink; ctx.lineWidth = 7;
  rr(ctx, x - w / 2, top, w, h, 34); ctx.stroke();
  ctx.fillStyle = C.ink; rr(ctx, x - w * 0.36, top - 26, w * 0.72, 30, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w / 2 + 22, top + 40); ctx.lineTo(x - w / 2 + 22, top + h * 0.55); ctx.stroke();
  // planned line
  if (planned != null) {
    const py = bottom - h * planned;
    ctx.setLineDash([16, 12]); ctx.strokeStyle = C.roseDeep; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 26, py); ctx.lineTo(x + w / 2 + 26, py); ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function envelope(ctx, x, y, w, h, rot, fold = 0) {
  // fold 0 = envelope, 1 = paper plane
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  if (fold < 0.5) {
    const k = 1 - fold * 2 * 0.5;
    ctx.scale(1, k);
    card(ctx, { x: 0, y: 0, w, h, r: 6, fill: C.ivory }, (g) => {
      g.strokeStyle = 'rgba(58,36,48,0.35)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(-w / 2 + 4, -h / 2 + 4); g.lineTo(0, h * 0.08); g.lineTo(w / 2 - 4, -h / 2 + 4); g.stroke();
      heart(g, 0, h * 0.05, 18, C.roseDeep);
    });
  } else {
    plane(ctx, 0, 0, w * 0.75, 0, 1);
  }
  ctx.restore();
}

export function plane(ctx, x, y, s, rot, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot);
  const k = s / 100;
  ctx.fillStyle = 'rgba(58,36,48,0.15)';
  ctx.beginPath(); ctx.moveTo(60 * k + 4, 8); ctx.lineTo(-50 * k + 4, -30 * k + 8); ctx.lineTo(-30 * k + 4, 8); ctx.lineTo(-50 * k + 4, 34 * k + 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.ivory;
  ctx.beginPath(); ctx.moveTo(60 * k, 0); ctx.lineTo(-50 * k, -32 * k); ctx.lineTo(-28 * k, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F1E4D6';
  ctx.beginPath(); ctx.moveTo(60 * k, 0); ctx.lineTo(-28 * k, 0); ctx.lineTo(-50 * k, 34 * k); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(58,36,48,0.4)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(60 * k, 0); ctx.lineTo(-28 * k, 0); ctx.stroke();
  heart(ctx, -22 * k, -10 * k, 8 * k, C.roseDeep);
  ctx.restore();
}

/** Tiny stylized "Plan My Wedding" home screen used inside the phone (illustration, not a screenshot). */
export function homeScreen(ctx, r, t, tilesT, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = C.rose;
  ctx.fillRect(r.x, r.y, r.w, 92);
  heart(ctx, r.x + 42, r.y + 54, 15, C.ivory);
  ctx.fillStyle = C.ink; ctx.font = F.serif(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Plan My Wedding', r.x + 70, r.y + 56);
  const tiles = [
    { l: 'Vendors', ic: 'camera', c: C.roseTint },
    { l: 'Checklist', ic: 'list', c: C.sageTint },
    { l: 'Budget', ic: 'coin', c: C.butter },
    { l: 'Guests', ic: 'people', c: '#EFE2F0' },
  ];
  tiles.forEach((tl, i) => {
    const u = clamp((t - tilesT - i * 0.13) / 0.35);
    if (u <= 0) return;
    const e = u < 1 ? 1 - Math.pow(1 - u, 3) * Math.cos(u * 9) * 1 : 1;
    const cx = r.x + r.w / 2 + (i % 2 ? 86 : -86), cy = r.y + 210 + Math.floor(i / 2) * 182;
    const drop = (1 - Math.min(1, u * 1.4)) * -120;
    card(ctx, { x: cx, y: cy + drop, w: 158, h: 160, r: 22, fill: tl.c, sx: 0.6 + 0.4 * e, sy: 0.6 + 0.4 * e }, (g) => {
      g.save(); g.translate(0, -18); icon[tl.ic](g, 66); g.restore();
      g.fillStyle = C.ink; g.font = F.sans(24); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(tl.l, 0, 50);
    });
  });
  const u = clamp((t - tilesT - 0.6) / 0.3);
  if (u > 0) {
    card(ctx, { x: r.x + r.w / 2, y: r.y + 572, w: 330, h: 66, r: 33, fill: C.ivory, alpha: u }, (g) => {
      circle(g, -128, 0, 18, C.sage);
      g.fillStyle = C.ink; g.font = F.sans(23); g.textAlign = 'left'; g.textBaseline = 'middle';
      g.fillText('Next: book the venue', -100, 1);
    });
  }
  ctx.restore();
}
