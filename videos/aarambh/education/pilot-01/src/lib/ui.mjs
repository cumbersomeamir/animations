// Screen-space typography: kicker, signature, captions, labels, banner.
import { P, rrect, star4, paintFill, thread } from './paint.mjs';
import { rgba, clamp, ease, lerp } from './core.mjs';
import { M, lockAt } from './mechanism.mjs';

export const FONT = { display: 'Fraunces', bold: 'InterB', heavy: 'InterX', med: 'InterM' };

function spaced(ctx, text, x, y, sp) {
  let cx = x;
  for (const ch of text) { ctx.fillText(ch, cx, y); cx += ctx.measureText(ch).width + sp; }
  return cx;
}
function spacedWidth(ctx, text, sp) { let w = 0; for (const ch of text) w += ctx.measureText(ch).width + sp; return w - sp; }

export function drawKicker(ctx, a, tag) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  // soft top scrim for legibility
  const g = ctx.createLinearGradient(0, 120, 0, 290);
  g.addColorStop(0, 'rgba(1,30,24,0.55)'); g.addColorStop(1, 'rgba(1,30,24,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 120, 1080, 170);
  ctx.font = `700 30px ${FONT.bold}`;
  ctx.fillStyle = P.gold; star4(ctx, 84, 192, 13); ctx.fill();
  ctx.fillStyle = P.cream;
  spaced(ctx, 'HOW TOOLS WORK · 01', 108, 203, 3.2);
  // signature (small, unobtrusive)
  ctx.font = `800 34px ${FONT.display}`;
  const sig = 'Aarambh';
  const w = ctx.measureText(sig).width;
  ctx.globalAlpha = a * 0.85;
  ctx.fillStyle = P.cream; ctx.fillText(sig, 1000 - w, 204);
  ctx.fillStyle = P.gold; star4(ctx, 1000 - w - 22, 192, 11); ctx.fill();
  if (tag > 0) {
    ctx.globalAlpha = a * tag;
    ctx.font = `500 26px ${FONT.med}`;
    const tw = ctx.measureText('simplified cutaway').width;
    ctx.fillStyle = 'rgba(1,30,24,0.75)'; rrect(ctx, 76, 228, tw + 36, 42, 21); ctx.fill();
    ctx.strokeStyle = rgba(P.cream, 0.5); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = P.cream2; ctx.fillText('simplified cutaway', 94, 258);
  }
  ctx.restore();
}

// Caption box in the mobile-safe lower-middle zone
export function drawCaption(ctx, text, highlights, a, pop) {
  if (a <= 0.001 || !text) return;
  ctx.save();
  ctx.globalAlpha = a;
  const size = 56;
  ctx.font = `800 ${size}px ${FONT.heavy}`;
  const maxW = 900;
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const tryL = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryL).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
  }
  if (cur) lines.push(cur);
  const lh = 70;
  const boxW = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 76;
  const boxH = lines.length * lh + 40;
  const cx = 540, cy = 1548;
  const sc = 0.94 + 0.06 * pop;
  ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.translate(-cx, -cy);
  const bx = cx - boxW / 2, by = cy - boxH / 2;
  ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = P.cream; rrect(ctx, bx, by, boxW, boxH, 26); ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => {
    const lw = ctx.measureText(l).width;
    let x = cx - lw / 2;
    const y = by + 20 + lh * i + 52;
    for (const w of l.split(' ')) {
      const ww = ctx.measureText(w).width;
      if (highlights.includes(w)) {
        ctx.strokeStyle = P.gold; ctx.lineWidth = 14; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x + 2, y + 10); ctx.quadraticCurveTo(x + ww / 2, y + 14, x + ww - 2, y + 8); ctx.stroke();
      }
      ctx.fillStyle = P.g800;
      ctx.fillText(w, x, y);
      x += ww + ctx.measureText(' ').width;
    }
  });
  ctx.restore();
}

// Label pill with leader line to anchor (both in current transform space)
export function drawLabel(ctx, text, anchor, at, color, a, align = 'left') {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a);
  const s = 0.85 + 0.15 * ease.outBack(clamp(a));
  ctx.font = `700 34px ${FONT.bold}`;
  const w = ctx.measureText(text).width + 40, h = 54;
  const bx = align === 'left' ? at[0] : at[0] - w, by = at[1] - h / 2;
  const attach = [align === 'left' ? bx : bx + w, at[1]];
  ctx.strokeStyle = P.ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(attach[0], attach[1]); ctx.lineTo(anchor[0], anchor[1]); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(attach[0], attach[1]); ctx.lineTo(anchor[0], anchor[1]); ctx.stroke();
  ctx.fillStyle = color; ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.translate(at[0], at[1]); ctx.scale(s, s); ctx.translate(-at[0], -at[1]);
  ctx.fillStyle = 'rgba(2,34,28,0.92)'; rrect(ctx, bx, by, w, h, 27); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = color; ctx.fillText(text, bx + 20, by + 39);
  ctx.restore();
}

export function drawQuestion(ctx, x, y, a, sc, wob) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y); ctx.rotate(wob); ctx.scale(sc, sc);
  ctx.fillStyle = P.cream; ctx.strokeStyle = P.ink; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.font = `800 64px ${FONT.display}`; ctx.fillStyle = P.g700; ctx.textAlign = 'center';
  ctx.fillText('?', 0, 22);
  ctx.restore();
}

export function drawBurst(ctx, x, y, r, a, color = P.gold) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = color;
  star4(ctx, x, y, r); ctx.fill();
  for (let k = 0; k < 6; k++) {
    const an = (k / 6) * Math.PI * 2 + 0.3;
    ctx.beginPath(); ctx.arc(x + Math.cos(an) * r * 1.5, y + Math.sin(an) * r * 1.5, r * 0.12, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// S5 lesson banner (screen space). openK 0..1 (with overshoot)
export function drawBanner(ctx, openK, grain, a = 1) {
  if (openK <= 0.001) return;
  const x = 100, y = 236, w = 880, fullH = 520;
  const h = fullH * openK;
  ctx.save();
  ctx.globalAlpha = a;
  // strings
  ctx.strokeStyle = rgba(P.cream3, 0.9); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 120, y); ctx.lineTo(x + 160, 120); ctx.moveTo(x + w - 120, y); ctx.lineTo(x + w - 160, 120); ctx.stroke();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.fillStyle = P.cream; rrect(ctx, x, y, w, Math.max(10, h), 18); ctx.fill();
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.save(); rrect(ctx, x, y, w, Math.max(10, h), 18); ctx.clip();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a * 0.25;
  ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  // title
  ctx.textAlign = 'center';
  ctx.font = `800 100px ${FONT.display}`; ctx.fillStyle = P.g700;
  ctx.fillText('Lockstitch', 540, y + 112);
  // diagram panel
  const px = x + 46, py = y + 140, pw = w - 92, ph = 236;
  ctx.fillStyle = P.g800; rrect(ctx, px, py, pw, ph, 18); ctx.fill();
  ctx.save(); rrect(ctx, px, py, pw, ph, 18); ctx.clip();
  const sc = 1.25;
  ctx.translate(px + pw / 2, py + 122); ctx.scale(sc, sc); ctx.translate(-540, -M.clothMid);
  ctx.fillStyle = P.cloth; ctx.fillRect(200, M.clothTop, 680, M.clothMid - M.clothTop);
  ctx.fillStyle = P.clothDark; ctx.fillRect(200, M.clothMid, 680, M.clothBot - M.clothMid);
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.strokeRect(200, M.clothTop, 680, M.clothBot - M.clothTop);
  const xs = [330, 540, 750];
  thread(ctx, [[200, M.clothTop - 3], [880, M.clothTop - 3]], { color: P.gold, edge: P.ink, w: 8, twist: false, smooth: false });
  thread(ctx, [[200, M.clothBot - 5], [880, M.clothBot - 5]], { color: P.bobbin, edge: P.ink, w: 8, twist: false, smooth: false });
  for (const lx of xs) lockAt(ctx, lx);
  // highlight ring on the middle lock
  ctx.strokeStyle = P.goldLight; ctx.lineWidth = 4; ctx.setLineDash([8, 7]);
  ctx.beginPath(); ctx.arc(540, M.clothMid + 2, 34, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.font = `700 30px ${FONT.bold}`;
  ctx.fillStyle = P.gold; ctx.fillText('needle thread', px + 24, py + 42);
  ctx.fillStyle = P.bobbin; ctx.fillText('bobbin thread', px + 24, py + ph - 14);
  ctx.textAlign = 'right'; ctx.fillStyle = P.goldLight; ctx.fillText('lock', px + pw - 24, py + 42);
  ctx.textAlign = 'center';
  ctx.font = `800 44px ${FONT.heavy}`; ctx.fillStyle = P.g800;
  ctx.fillText('Two threads, locked', 540, y + 422);
  ctx.fillText('inside the cloth.', 540, y + 476);
  ctx.restore();
  // dowel at bottom edge
  ctx.fillStyle = P.goldDeep; ctx.strokeStyle = P.ink; ctx.lineWidth = 4;
  rrect(ctx, x - 20, y + h - 12, w + 40, 26, 13); ctx.fill(); ctx.stroke();
  ctx.restore();
}
