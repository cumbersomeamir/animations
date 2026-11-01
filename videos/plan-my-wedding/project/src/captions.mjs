// Editorial captions: words rise in staggered, keywords get a hand-drawn highlighter.
// Line appearance times come from measured phrase onsets of the narration (build/vo/vo.json).
import fs from 'node:fs';
import { C, F } from './lib/paper.mjs';
import { ease, prog, clamp } from './lib/core.mjs';

let VO = {};
try {
  const j = JSON.parse(fs.readFileSync('build/vo/vo.json', 'utf8'));
  for (const l of j.lines) VO[l.id] = l;
} catch { /* captions fall back to fixed times */ }
const on = (id, k, fallback) => (VO[id] ? +(VO[id].start + (VO[id].onsets?.[k] ?? 0)).toFixed(2) : fallback);

export const CAPS = [
  { t1: 2.42, size: 100, lines: [
    { text: 'One wedding.', at: on('l1', 0, 0.3) },
    { text: 'A thousand details.', at: on('l1', 1, 1.16), hl: ['thousand'] }] },
  { t1: 8.75, size: 84, lines: [
    { text: 'Add a few guests…', at: on('l2', 0, 3.0) },
    { text: '…and everything shifts.', at: on('l2', 1, 4.13), hl: ['everything'] }] },
  { t1: 11.95, size: 86, eyebrow: { text: 'PLAN MY WEDDING', at: on('l3', 0, 9.35) }, lines: [
    { text: 'Give your plans one home.', at: on('l3', 0, 9.35) + 0.1, hl: ['home.'] }] },
  { t1: 15.62, size: 76, lines: [
    { text: 'Browse vendors.', at: on('l4', 0, 12.85) },
    { text: 'Save favourites.', at: on('l4', 1, 13.9) },
    { text: 'Request quotes.', at: on('l4', 1, 13.9) + 0.82 }] },
  { t1: 19.02, size: 76, lines: [
    { text: 'Tick off your checklist.', at: on('l5', 0, 16.2) },
    { text: 'Keep an eye on the budget.', at: on('l5', 1, 17.61), hl: ['budget.'] }] },
  { t1: 22.32, size: 80, lines: [
    { text: 'Send invitations.', at: on('l6', 0, 19.55) },
    { text: 'Follow every RSVP.', at: on('l6', 1, 20.88), hl: ['RSVP.'] }] },
  { t1: 26.75, size: 96, italic: true, lines: [
    { text: 'Back to the', at: on('l7', 0, 23.1) },
    { text: 'celebration.', at: on('l7', 0, 23.1) + 0.55, hl: ['celebration.'] }] },
];

const MAXW = 930;
const TOP = 250;

export function drawCaptions(ctx, t) {
  for (const cap of CAPS) {
    const t0 = Math.min(...cap.lines.map((l) => l.at), cap.eyebrow ? cap.eyebrow.at : 99);
    if (t < t0 - 0.05 || t > cap.t1 + 0.35) continue;
    const font = cap.italic ? F.serifI : F.serif;
    // uniform size that fits the widest line
    let size = cap.size;
    ctx.font = font(size);
    const widest = Math.max(...cap.lines.map((l) => ctx.measureText(l.text).width));
    if (widest > MAXW) size = Math.floor(size * (MAXW / widest));
    const lh = size * 1.12;
    const exit = ease.inCubic(prog(t, cap.t1, cap.t1 + 0.3));
    let y = TOP;
    if (cap.eyebrow && t >= cap.eyebrow.at) {
      const u = ease.outCubic(prog(t, cap.eyebrow.at, cap.eyebrow.at + 0.35));
      ctx.save();
      ctx.globalAlpha = u * (1 - exit);
      ctx.font = F.sans(34);
      ctx.fillStyle = C.roseDeep;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      spaced(ctx, cap.eyebrow.text, 540, y - 6 - (1 - u) * 14, 34, 0.22);
      ctx.restore();
    }
    if (cap.eyebrow) y += 44;
    cap.lines.forEach((ln) => {
      y += lh;
      drawLine(ctx, ln, t, font, size, y - size * 0.22, exit);
    });
  }
}

function spaced(ctx, text, cx, y, px, sp) {
  const chars = [...text];
  const ws = chars.map((c) => ctx.measureText(c).width);
  const total = ws.reduce((a, b) => a + b, 0) + px * sp * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, x, y); x += ws[i] + px * sp; });
}

function drawLine(ctx, ln, t, font, size, baseY, exit) {
  if (t < ln.at) return;
  ctx.font = font(size);
  const words = ln.text.split(' ');
  const space = ctx.measureText(' ').width;
  const ws = words.map((w) => ctx.measureText(w).width);
  const total = ws.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let x = 540 - total / 2;
  words.forEach((w, i) => {
    const wt = ln.at + i * 0.065;
    const u = prog(t, wt, wt + 0.32);
    if (u <= 0) { x += ws[i] + space; return; }
    const a = clamp(u * 2.2) * (1 - exit);
    const dy = (1 - ease.outBack(u, 2.2)) * 34 - exit * 26;
    const rot = (1 - ease.outCubic(u)) * 0.12 * (i % 2 ? 1 : -1);
    // highlighter swipe behind keyword
    if (ln.hl && ln.hl.includes(w)) {
      const hu = ease.outCubic(prog(t, wt + 0.18, wt + 0.5));
      if (hu > 0) {
        ctx.save();
        ctx.globalAlpha = 0.6 * (1 - exit);
        ctx.fillStyle = C.rose;
        ctx.beginPath();
        const hx = x - 8, hy = baseY - size * 0.42, hw = (ws[i] + 16) * hu, hh = size * 0.46;
        ctx.moveTo(hx, hy + 6); ctx.lineTo(hx + hw, hy); ctx.lineTo(hx + hw - 4, hy + hh); ctx.lineTo(hx + 3, hy + hh + 5); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x + ws[i] / 2, baseY + dy);
    ctx.rotate(rot);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = 'rgba(247,240,230,0.92)';
    ctx.lineWidth = size * 0.16;
    ctx.lineJoin = 'round';
    ctx.strokeText(w, 0, 0);
    ctx.fillStyle = C.ink;
    ctx.fillText(w, 0, 0);
    ctx.restore();
    x += ws[i] + space;
  });
}
