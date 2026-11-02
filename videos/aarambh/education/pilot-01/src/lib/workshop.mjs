// Workshop world (S1, T1, T2, S5): painted miniature workshop + oversized sewing machine (front view).
// World units == screen pixels at camera zoom 1. Original illustration (generic machine, no brand).
import { createCanvas } from '@napi-rs/canvas';
import { P, paintFill, rrect, softShadow, makeBrushLayer, makeWeave, thread, star4 } from './paint.mjs';
import { rgba, lerp, clamp } from './core.mjs';

export const WS = {
  needleX: 260,
  clothTopY: 1105, // cloth surface at the needle
  P_hole: [260, 1104],
  wheel: { cx: 822, cy: 742, rx: 30, ry: 112 },
  crankR: 50,
  stool: { x: 932, top: 872, base: 1112 },
  bedBack: 1052, bedFront: 1170, bedBottom: 1238,
  flap: { x0: 150, x1: 380, edgeY: 1170, len: 78 },
  needleTravel: 104,
};

let cache = null;
export function initWorkshop(grain) {
  const W = 1680, H = 2520, ox = -300, oy = -300;
  const wall = createCanvas(W, H);
  const c = wall.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, P.g900); g.addColorStop(0.45, P.g800); g.addColorStop(1, P.g850);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.drawImage(makeBrushLayer(W, H, 21, [P.g600, P.g950, P.g700, P.g500], 2600, [60, 240], [10, 40], [0.03, 0.08]), 0, 0);
  // warm lamp glow top-left
  const lg = c.createRadialGradient(-ox + 120, -oy + 120, 10, -ox + 120, -oy + 120, 900);
  lg.addColorStop(0, rgba(P.goldLight, 0.30)); lg.addColorStop(0.35, rgba(P.gold, 0.10)); lg.addColorStop(1, rgba(P.gold, 0));
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  // shelf with spools (background, low contrast)
  const shelfY = -oy + 300;
  c.fillStyle = rgba(P.g950, 0.55); c.fillRect(0, shelfY + 16, W, 30);
  c.fillStyle = rgba(P.g500, 0.55); c.fillRect(0, shelfY, W, 18);
  const spools = [[-ox + 60, P.gold], [-ox + 140, P.cream3], [-ox + 205, P.clothBack], [-ox + 860, P.cream3], [-ox + 935, P.gold], [-ox + 1010, P.blush]];
  for (const [x, col] of spools) {
    c.fillStyle = rgba(P.cream4, 0.55); c.fillRect(x - 26, shelfY - 12, 52, 12); c.fillRect(x - 26, shelfY - 96, 52, 12);
    c.fillStyle = rgba(col, 0.55); c.fillRect(x - 20, shelfY - 84, 40, 72);
    c.strokeStyle = rgba('#000000', 0.12); c.lineWidth = 2;
    for (let k = 0; k < 8; k++) { c.beginPath(); c.moveTo(x - 20, shelfY - 80 + k * 9); c.lineTo(x + 20, shelfY - 76 + k * 9); c.stroke(); }
  }
  // pegboard holes
  c.fillStyle = rgba(P.g950, 0.35);
  for (let y = -oy + 420; y < -oy + 1000; y += 46) for (let x = 20; x < W; x += 46) { c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill(); }
  // hanging scissors silhouette (right)
  c.save(); c.translate(-ox + 980, -oy + 470); c.rotate(0.2); c.strokeStyle = rgba(P.metal, 0.35); c.lineWidth = 9;
  c.beginPath(); c.arc(-18, 0, 22, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.arc(18, 0, 22, 0, Math.PI * 2); c.stroke();
  c.lineWidth = 12; c.beginPath(); c.moveTo(-6, 20); c.lineTo(20, 190); c.moveTo(6, 20); c.lineTo(-20, 190); c.stroke(); c.restore();
  // table
  const tY = -oy + 1200;
  const tg = c.createLinearGradient(0, tY, 0, H);
  tg.addColorStop(0, '#0E5040'); tg.addColorStop(0.5, '#0B4638'); tg.addColorStop(1, P.g900);
  c.fillStyle = tg; c.fillRect(0, tY, W, H - tY);
  c.drawImage(makeBrushLayer(W, H - tY, 33, ['#1C6B55', P.g900, '#0E5A47'], 900, [200, 600], [3, 9], [0.10, 0.22], 0.02), 0, tY);
  c.fillStyle = rgba(P.g300, 0.25); c.fillRect(0, tY, W, 4);
  // table props: pincushion + loose spool (left/right foreground)
  const pc = [-ox + 120, -oy + 1330];
  c.fillStyle = P.blush; c.strokeStyle = P.ink; c.lineWidth = 4;
  c.beginPath(); c.ellipse(pc[0], pc[1], 70, 46, 0, Math.PI, 0); c.lineTo(pc[0] + 70, pc[1] + 14); c.lineTo(pc[0] - 70, pc[1] + 14); c.closePath(); c.fill(); c.stroke();
  for (const [dx, dy, col] of [[-30, -40, P.gold], [6, -52, P.cream], [36, -38, P.gold]]) {
    c.strokeStyle = P.metalDark; c.lineWidth = 3; c.beginPath(); c.moveTo(pc[0] + dx * 0.7, pc[1] - 20); c.lineTo(pc[0] + dx, pc[1] + dy); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(pc[0] + dx, pc[1] + dy, 8, 0, Math.PI * 2); c.fill();
  }
  cache = { wall, ox, oy, weave: makeWeave(64, P.cloth, 5), weaveBack: makeWeave(64, P.clothBack, 6), grain };
}

function machineBody(ctx, grain) {
  const ink = P.ink;
  // shadow on table
  softShadow(ctx, 540, 1240, 560, 30, 0.55);
  // bed front face
  paintFill(ctx, (c) => { rrect(c, 34, WS.bedFront - 4, 1012, WS.bedBottom - WS.bedFront + 4, 18); }, { base: P.cream2, bounds: [34, 1166, 1012, 72], light: P.cream, dark: P.cream4, darkA: 0.6, tex: grain, texA: 0.4, stroke: ink, strokeW: 5 });
  ctx.strokeStyle = P.g600; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(60, 1210); ctx.lineTo(1020, 1210); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(60, 1200); ctx.lineTo(1020, 1200); ctx.stroke();
  // bed top face (perspective)
  const top = (c) => { c.beginPath(); c.moveTo(70, WS.bedBack); c.lineTo(1010, WS.bedBack); c.lineTo(1046, WS.bedFront); c.lineTo(34, WS.bedFront); c.closePath(); };
  paintFill(ctx, top, { base: P.cream, bounds: [34, WS.bedBack, 1012, WS.bedFront - WS.bedBack], light: '#FFFFFF', lightA: 0.4, dark: P.cream3, darkA: 0.5, lightAngle: -1.57, tex: grain, texA: 0.35, stroke: ink, strokeW: 5 });
  // needle plate
  ctx.fillStyle = P.metal; ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(196, 1086); ctx.lineTo(330, 1086); ctx.lineTo(338, 1126); ctx.lineTo(188, 1126); ctx.closePath(); ctx.fill(); ctx.stroke();
  // pillar
  paintFill(ctx, (c) => { c.beginPath(); c.moveTo(650, 600); c.lineTo(772, 600); c.quadraticCurveTo(780, 900, 800, 1060); c.lineTo(626, 1060); c.quadraticCurveTo(642, 900, 650, 600); c.closePath(); }, { base: P.cream, bounds: [626, 560, 174, 500], light: '#FFFFFF', dark: P.cream4, darkA: 0.7, lightAngle: -3.0, tex: grain, texA: 0.4, stroke: ink, strokeW: 5 });
  // arm
  paintFill(ctx, (c) => { c.beginPath(); c.moveTo(300, 470); c.quadraticCurveTo(300, 452, 330, 452); c.lineTo(740, 452); c.quadraticCurveTo(786, 452, 790, 500); c.lineTo(786, 640); c.lineTo(300, 610); c.closePath(); }, { base: P.cream, bounds: [300, 452, 490, 190], light: '#FFFFFF', lightA: 0.5, dark: P.cream4, darkA: 0.6, lightAngle: -1.7, tex: grain, texA: 0.4, stroke: ink, strokeW: 5 });
  // green decal stripe + gold pinstripe along arm
  ctx.strokeStyle = P.g600; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(360, 520); ctx.lineTo(740, 520); ctx.stroke();
  ctx.strokeStyle = P.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(360, 540); ctx.lineTo(740, 540); ctx.stroke();
  ctx.fillStyle = P.gold; star4(ctx, 760, 520, 15); ctx.fill();
  // head
  paintFill(ctx, (c) => { rrect(c, 148, 438, 196, 452, 40); }, { base: P.cream, bounds: [148, 438, 196, 452], light: '#FFFFFF', lightA: 0.6, dark: P.cream4, darkA: 0.7, tex: grain, texA: 0.4, stroke: ink, strokeW: 5 });
  paintFill(ctx, (c) => { rrect(c, 166, 640, 160, 230, 26); }, { base: P.cream2, bounds: [166, 640, 160, 230], dark: P.cream4, darkA: 0.5, stroke: rgba(P.ink, 0.6), strokeW: 3 });
  // tension discs
  ctx.fillStyle = P.metal; ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(196, 560, 11, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(208, 560, 11, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // take-up slot
  ctx.fillStyle = P.g900; rrect(ctx, 156, 600, 18, 120, 8); ctx.fill();
  // spool pin + spool of gold thread on top of the arm
  ctx.fillStyle = P.metalDark; ctx.fillRect(553, 380, 8, 74);
  paintFill(ctx, (c) => { rrect(c, 520, 396, 74, 56, 8); }, { base: P.gold, bounds: [520, 396, 74, 56], light: P.goldLight, dark: P.goldDeep, darkA: 0.7, stroke: ink, strokeW: 3.5 });
  ctx.strokeStyle = rgba(P.goldDeep, 0.8); ctx.lineWidth = 2;
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(522, 402 + k * 9); ctx.lineTo(592, 405 + k * 9); ctx.stroke(); }
  ctx.fillStyle = P.cream3; ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(557, 396, 44, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(557, 452, 44, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

function handwheel(ctx, phi, front) {
  const { cx, cy, rx, ry } = WS.wheel;
  const ink = P.ink;
  // crank arm & knob: in front when sin(phi) > 0
  const ka = [cx + 18 * Math.sin(phi), cy - WS.crankR * Math.cos(phi)];
  const inFront = Math.sin(phi) >= -0.15;
  const drawCrank = () => {
    ctx.strokeStyle = ink; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 10, cy); ctx.lineTo(ka[0] + 10, ka[1]); ctx.stroke();
    ctx.strokeStyle = P.metal; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(cx + 10, cy); ctx.lineTo(ka[0] + 10, ka[1]); ctx.stroke();
    // wooden knob sticking out toward viewer / right
    paintFill(ctx, (c) => { rrect(c, ka[0] + 4, ka[1] - 15, 46, 30, 13); }, { base: P.goldDeep, bounds: [ka[0], ka[1] - 15, 50, 30], light: P.goldLight, dark: '#7a4d12', stroke: ink, strokeW: 3.5 });
  };
  if (!front) {
    if (!inFront) drawCrank();
    // wheel disc
    paintFill(ctx, (c) => { c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); }, { base: P.cream2, bounds: [cx - rx, cy - ry, rx * 2, ry * 2], light: '#FFFFFF', dark: P.cream4, darkA: 0.7, stroke: ink, strokeW: 5 });
    ctx.strokeStyle = P.g600; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(cx, cy, rx - 8, ry - 10, 0, 0, Math.PI * 2); ctx.stroke();
    // rotating spokes
    ctx.strokeStyle = rgba(P.ink, 0.7); ctx.lineWidth = 4;
    for (let k = 0; k < 5; k++) {
      const a = phi + (k * Math.PI * 2) / 5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (rx - 10) * Math.sin(a), cy - (ry - 12) * Math.cos(a)); ctx.stroke();
    }
    ctx.fillStyle = P.metal; ctx.strokeStyle = ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy, 10, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (inFront) drawCrank();
  return [ka[0] + 26, ka[1]];
}

// needle-bar position from crank angle (0 = up, PI = deepest)
export const needleDip = (phi) => (1 - Math.cos(phi)) / 2;

function stitchesTop(ctx, flow = 0) {
  // gold stitch dashes from needle toward viewer across bed top + down the drape
  const x = WS.needleX;
  ctx.save();
  ctx.strokeStyle = P.ink; ctx.lineCap = 'round';
  const segs = [[1118, 1132], [1142, 1156], [1166, 1170]];
  for (const [a, b] of segs) {
    ctx.lineWidth = 9; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.moveTo(x, a); ctx.lineTo(x, b); ctx.stroke();
    ctx.lineWidth = 5.5; ctx.strokeStyle = P.gold; ctx.beginPath(); ctx.moveTo(x, a); ctx.lineTo(x, b); ctx.stroke();
  }
  ctx.restore();
}

function cloth(ctx, s) {
  const { weave, weaveBack } = cache;
  const f = WS.flap;
  // main cloth on bed top (perspective quad)
  ctx.save();
  const quad = (c) => { c.beginPath(); c.moveTo(118, WS.bedBack + 6); c.lineTo(420, WS.bedBack + 6); c.lineTo(436, WS.bedFront); c.lineTo(96, WS.bedFront); c.closePath(); };
  quad(ctx); ctx.fillStyle = P.cloth; ctx.fill(); ctx.save(); ctx.clip();
  ctx.fillStyle = ctx.createPattern(weave, 'repeat'); ctx.globalAlpha = 0.9; ctx.fillRect(90, WS.bedBack, 360, 130);
  ctx.globalAlpha = 1;
  const sh = ctx.createLinearGradient(0, WS.bedBack, 0, WS.bedFront); sh.addColorStop(0, rgba(P.g900, 0.35)); sh.addColorStop(1, rgba(P.g900, 0));
  ctx.fillStyle = sh; ctx.fillRect(90, WS.bedBack, 360, 130);
  ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4; quad(ctx); ctx.stroke();
  // previous stitch line on top (gold dashes running toward viewer)
  stitchesTop(ctx);
  // flap (drape over the front edge). alpha=0 hanging (top face out), alpha=PI flipped up (underside out)
  const a = s.flap ?? 0;
  const h = Math.cos(a) * f.len; // + down (hanging, top face out), - up (lifted, underside out)
  const underside = Math.cos(a) < 0;
  const skew = Math.sin(a) * 26; // flap swings toward viewer: widen slightly
  ctx.beginPath();
  ctx.moveTo(f.x0 - 54, f.edgeY);
  ctx.lineTo(f.x1 + 56, f.edgeY);
  ctx.lineTo(f.x1 + 56 + skew, f.edgeY + h);
  ctx.lineTo(f.x0 - 54 - skew, f.edgeY + h);
  ctx.closePath();
  ctx.fillStyle = underside ? P.clothBack : P.clothDark; ctx.fill();
  ctx.save(); ctx.clip(); ctx.globalAlpha = 0.85;
  ctx.fillStyle = ctx.createPattern(underside ? weaveBack : weave, 'repeat'); ctx.fillRect(f.x0 - 90, f.edgeY - 100, 400, 200);
  ctx.globalAlpha = 1; ctx.restore();
  ctx.strokeStyle = P.ink; ctx.lineWidth = 4; ctx.stroke();
  // stitches on flap: gold if top face shown, cream (bobbin thread) if underside shown
  const n = 3;
  for (let i = 0; i < n; i++) {
    const t0 = (i + 0.15) / n, t1 = (i + 0.75) / n;
    const y0 = f.edgeY + h * t0, y1 = f.edgeY + h * t1;
    ctx.lineCap = 'round';
    ctx.lineWidth = 10; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.moveTo(WS.needleX, y0); ctx.lineTo(WS.needleX, y1); ctx.stroke();
    ctx.lineWidth = 6.5; ctx.strokeStyle = underside ? P.bobbin : P.gold; ctx.beginPath(); ctx.moveTo(WS.needleX, y0); ctx.lineTo(WS.needleX, y1); ctx.stroke();
  }
  ctx.restore();
  return { corner: [f.x1 + 56 + skew, f.edgeY + h] };
}

function needleAssembly(ctx, dip, s) {
  const ink = P.ink;
  const ny = dip * WS.needleTravel;
  const x = WS.needleX;
  // presser bar + foot
  ctx.fillStyle = P.metal; ctx.strokeStyle = ink; ctx.lineWidth = 3;
  ctx.fillRect(296, 880, 12, 210); ctx.strokeRect(296, 880, 12, 210);
  ctx.beginPath(); ctx.moveTo(214, 1088); ctx.lineTo(312, 1088); ctx.lineTo(316, 1104); ctx.lineTo(204, 1104); ctx.quadraticCurveTo(204, 1090, 214, 1088); ctx.closePath(); ctx.fill(); ctx.stroke();
  // needle bar
  const top = 880, barEnd = 960 + ny;
  ctx.fillStyle = P.metalLight; ctx.fillRect(x - 8, top, 16, barEnd - top); ctx.strokeRect(x - 8, top, 16, barEnd - top);
  ctx.fillStyle = P.metal; ctx.fillRect(x - 14, barEnd - 16, 28, 20); ctx.strokeRect(x - 14, barEnd - 16, 28, 20);
  // needle
  const tip = barEnd + 62;
  ctx.fillStyle = P.metalLight; ctx.beginPath(); ctx.moveTo(x - 4, barEnd + 4); ctx.lineTo(x + 4, barEnd + 4); ctx.lineTo(x + 2, tip - 8); ctx.lineTo(x, tip); ctx.lineTo(x - 2, tip - 8); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 2; ctx.stroke();
  return { tip, eye: [x, tip - 14], guide: [x + 6, barEnd - 30] };
}

function takeUp(ctx, dip) {
  // lever rises as needle rises (simplified phase)
  const y = 690 - (1 - dip) * 70;
  const piv = [165, y + 20];
  const eye = [104, y - 6];
  ctx.strokeStyle = P.ink; ctx.lineWidth = 15; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(piv[0], piv[1]); ctx.lineTo(eye[0], eye[1]); ctx.stroke();
  ctx.strokeStyle = P.metal; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(piv[0], piv[1]); ctx.lineTo(eye[0], eye[1]); ctx.stroke();
  ctx.fillStyle = P.metalLight; ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(eye[0], eye[1], 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = P.g900; ctx.beginPath(); ctx.arc(eye[0], eye[1], 4.5, 0, Math.PI * 2); ctx.fill();
  return eye;
}

export function drawWorkshopWorld(ctx, s) {
  const { wall, ox, oy, grain } = cache;
  ctx.drawImage(wall, ox, oy);
  // stool spool for Bindu (big cream spool)
  const st = WS.stool;
  machineBody(ctx, grain);
  handwheel(ctx, s.phi, false);
  const dip = needleDip(s.phi);
  const eye = takeUp(ctx, dip);
  const cl = cloth(ctx, s);
  const nd = needleAssembly(ctx, dip, s);
  // needle thread: spool -> tension -> take-up eye -> guide -> needle eye
  thread(ctx, [[540, 404], [380, 440], [210, 540], [202, 560], [140, 610], eye, [150, 800], nd.guide, [WS.needleX + 4, nd.eye[1] - 30], nd.eye], { color: P.gold, edge: P.ink, w: 4.5, edgeW: 3, twist: false, smooth: true });
  // spool stool
  paintFill(ctx, (c) => { rrect(c, st.x - 58, st.top + 16, 116, st.base - st.top - 30, 6); }, { base: P.bobbin, bounds: [st.x - 58, st.top, 116, st.base - st.top], light: '#FFFFFF', dark: P.cream4, darkA: 0.6, lightAngle: -3, stroke: P.ink, strokeW: 4 });
  ctx.strokeStyle = rgba(P.cream4, 0.9); ctx.lineWidth = 2;
  for (let y = st.top + 24; y < st.base - 14; y += 10) { ctx.beginPath(); ctx.moveTo(st.x - 56, y); ctx.lineTo(st.x + 56, y + 3); ctx.stroke(); }
  for (const yy of [st.top + 8, st.base - 8]) {
    paintFill(ctx, (c) => { c.beginPath(); c.ellipse(st.x, yy, 76, 16, 0, 0, Math.PI * 2); }, { base: P.cream3, bounds: [st.x - 76, yy - 16, 152, 32], light: P.cream, dark: P.cream4, stroke: P.ink, strokeW: 4 });
  }
  return { cl, nd, frontCrank: () => handwheel(ctx, s.phi, true), knob: knobPos(s.phi) };
}

export function knobPos(phi) {
  const { cx, cy } = WS.wheel;
  return [cx + 18 * Math.sin(phi) + 40, cy - WS.crankR * Math.cos(phi)];
}

// Stitched cloth swatch prop. flipA: 0 = top face (gold needle-thread stitches), PI = underside (cream bobbin-thread stitches).
// Pivot = (px,py) on its near edge; extends in direction dir (-1 = left). lying: flatten for resting on the table.
export function drawSwatch(ctx, px, py, w, h, flipA, dir = -1, lying = 0) {
  const { weave, weaveBack } = cache;
  const cy = Math.cos(flipA) * (1 - 0.72 * lying);
  const under = Math.cos(flipA) < 0;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(dir, cy);
  // pinked-edge cloth rect from x=0..w, y=-h/2..h/2
  const path = () => {
    ctx.beginPath(); ctx.moveTo(0, -h / 2);
    const n = 9;
    for (let i = 1; i <= n; i++) ctx.lineTo((w * i) / n - w / n / 2, -h / 2 - 6), ctx.lineTo((w * i) / n, -h / 2);
    ctx.lineTo(w, h / 2);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo((w * i) / n + w / n / 2, h / 2 + 6), ctx.lineTo((w * i) / n, h / 2);
    ctx.closePath();
  };
  path(); ctx.fillStyle = under ? P.clothBack : P.cloth; ctx.fill();
  ctx.save(); ctx.clip(); ctx.globalAlpha = 0.85; ctx.fillStyle = ctx.createPattern(under ? weaveBack : weave, 'repeat'); ctx.fillRect(-10, -h, w + 20, 2 * h); ctx.restore();
  ctx.lineWidth = 4 / Math.max(0.2, Math.abs(cy)); ctx.strokeStyle = P.ink; path(); ctx.stroke();
  // stitch line along the length
  const k = 5;
  for (let i = 0; i < k; i++) {
    const x0 = w * (i + 0.18) / k, x1 = w * (i + 0.78) / k;
    ctx.lineCap = 'round';
    ctx.strokeStyle = P.ink; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke();
    ctx.strokeStyle = under ? P.bobbin : P.gold; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.stroke();
  }
  ctx.restore();
}
