// Media Diet · 30 s production 01 — "What airplane mode actually switches off"
// Visual Investigation grammar (adapted): one examination bench, one event clock, freeze/circle/magnify,
// evidence cards with highlighted lines, known/depends board, evidence map. Canvas 2D, deterministic:
// window.render(frame) draws frame = t*30; window.TEXTS() returns the ink boxes of every text drawn in that frame.
const TL = await (await fetch('./timeline.json')).json();
const CUES = await (await fetch('./data/cues.json')).json();
const E = TL.events;
const W = TL.width, H = TL.height, FPS = TL.fps;
const cv = document.getElementById('c'); const g = cv.getContext('2d');
await Promise.all(['700 46px "Space Grotesk"', '500 30px "Space Grotesk"', '600 30px Inter', '400 22px "Plex Mono"', '600 64px "Plex Mono"',
  'italic 400 40px "Source Serif"'].map((f) => document.fonts.load(f)));
const icon = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '../../../../assets/icon.png'; });

// Palette: sampled from videos/media-diet/assets/icon.png, mapped onto the style's colour roles.
const C = { ground: '#04061f', panel: '#0a0e36', panel2: '#0e1345', hair: '#2a2f72', text: '#ECEAF6', sec: '#9094c4', tick: '#4a4f80',
  acc: '#fe4092', on: '#2addfa', violet: '#7c3fda', violetL: '#a359fa', off: '#3a3f6e', paper: '#E6E4F0', ink: '#14163a' };
const SANS = '"Space Grotesk"', MONO = '"Plex Mono"', SERIF = '"Source Serif"';

// ---------------------------------------------------------------- helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const outCubic = (u) => 1 - Math.pow(1 - u, 3);
const prog = (t, a, b, e = outCubic) => e(clamp((t - a) / (b - a)));
const inL = (t, L) => t >= L.in && t < L.out;
const lay = (id) => TL.layouts.find((l) => l.id === id);
let T = 0; let TEXTLOG = [];

function text(str, x, y, o = {}) {
  g.save();
  g.font = o.font || `500 30px ${SANS}`; g.fillStyle = o.color || C.text; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  g.globalAlpha *= o.alpha ?? 1;
  if (o.shadow) { g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = o.shadow; }
  g.fillText(str, x, y);
  const m = g.measureText(str); const tr = g.getTransform();
  const x0 = x - m.actualBoundingBoxLeft, x1 = x + m.actualBoundingBoxRight, y0 = y - m.actualBoundingBoxAscent, y1 = y + m.actualBoundingBoxDescent;
  const p = (px, py) => ({ x: tr.a * px + tr.c * py + tr.e, y: tr.b * px + tr.d * py + tr.f });
  const a = p(x0, y0), b = p(x1, y1);
  if (g.globalAlpha > 0.05) TEXTLOG.push({ kind: o.kind || 'label', text: str, x0: Math.round(a.x), y0: Math.round(a.y), x1: Math.round(b.x), y1: Math.round(b.y) });
  g.restore();
  return m.width;
}
function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// cut-in: opacity within 0.1 s plus a 3-frame white flash over the element's box
function cutIn(t, t0) { return clamp((t - t0) / 0.1); }
function flashBox(t, t0, x, y, w, h) { const f = 1 - clamp((t - t0) / 0.11); if (t >= t0 && f > 0) { g.save(); g.globalAlpha = 0.75 * f; g.fillStyle = '#ffffff'; g.fillRect(x, y, w, h); g.restore(); } }
function tag(t, t0, x, y, str, color = C.sec) { // 6x12 chip + mono source tag sitting just above its frame
  const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a;
  g.fillStyle = C.acc; g.fillRect(x, y - 15, 6, 12); text(str, x + 14, y - 3, { font: `400 22px ${MONO}`, color, kind: 'tag' }); g.restore();
}
// progressive drawn ring (clockwise from 12 o'clock, 0.5 s, ease-out cubic)
function ring(t, t0, cx, cy, rx, ry, lw = 4) {
  const p = prog(t, t0, t0 + 0.5); if (p <= 0) return;
  g.save(); g.strokeStyle = C.acc; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke(); g.restore();
}
function leader(t, t0, pts, dur = 0.5, color = C.acc, dash = null, lw = 3) {
  const p = prog(t, t0, t0 + dur); if (p <= 0) return;
  let total = 0; const segs = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(d); total += d; }
  let left = total * p; g.save(); g.strokeStyle = color; g.lineWidth = lw; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) { const u = Math.min(1, left / segs[i - 1]); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= segs[i - 1]; }
  g.stroke(); g.restore();
}
function check(t, t0, x, y, s = 44) { // ✓ badge: drawn tick in a magenta box, no words
  const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = C.acc; rrect(x, y, s, s, 8); g.fill();
  const p = prog(t, t0, t0 + 0.25); g.strokeStyle = '#fff'; g.lineWidth = s * 0.12; g.lineCap = 'round'; g.lineJoin = 'round';
  const P = [[x + s * 0.24, y + s * 0.52], [x + s * 0.43, y + s * 0.7], [x + s * 0.77, y + s * 0.32]];
  g.beginPath(); g.moveTo(...P[0]); if (p > 0) { const u1 = Math.min(1, p * 2); g.lineTo(lerp(P[0][0], P[1][0], u1), lerp(P[0][1], P[1][1], u1)); if (p > 0.5) { const u2 = (p - 0.5) * 2; g.lineTo(lerp(P[1][0], P[2][0], u2), lerp(P[1][1], P[2][1], u2)); } }
  g.stroke(); g.restore(); flashBox(t, t0, x, y, s, s);
}

// ---------------------------------------------------------------- glyphs (generic status icons, drawn as line work)
function glyph(kind, cx, cy, s, color, lw = 3) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw / s; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'plane') {
    g.beginPath(); g.moveTo(0, -16); g.lineTo(2.4, -10); g.lineTo(2.4, -3); g.lineTo(15, 4); g.lineTo(15, 7.5); g.lineTo(2.4, 3.5); g.lineTo(2.4, 11); g.lineTo(6, 14); g.lineTo(6, 16.5);
    g.lineTo(0, 14.8); g.lineTo(-6, 16.5); g.lineTo(-6, 14); g.lineTo(-2.4, 11); g.lineTo(-2.4, 3.5); g.lineTo(-15, 7.5); g.lineTo(-15, 4); g.lineTo(-2.4, -3); g.lineTo(-2.4, -10); g.closePath(); g.fill();
  } else if (kind === 'cell') {
    for (let i = 0; i < 4; i++) { const h = 7 + i * 6; g.fillRect(-13 + i * 7.5, 13 - h, 5, h); }
  } else if (kind === 'wifi') {
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, 11, 7 + i * 7, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); }
    g.beginPath(); g.arc(0, 11, 2.6, 0, Math.PI * 2); g.fill();
  } else if (kind === 'bt') {
    g.beginPath(); g.moveTo(-7, -7); g.lineTo(7, 6); g.lineTo(0, 13); g.lineTo(0, -13); g.lineTo(7, -6); g.lineTo(-7, 7); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- the examination bench (shared ground of every layout)
function bench() {
  g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 1050, 120, 540, 1050, 1150); vg.addColorStop(0, 'rgba(36,40,126,0.30)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // bench mat
  const x = 64, y = 512, w = 952, h = 1080;
  g.save(); rrect(x, y, w, h, 18); g.fillStyle = C.panel; g.fill(); g.clip();
  g.strokeStyle = 'rgba(42,47,114,0.38)'; g.lineWidth = 1;
  for (let gx = x + 24; gx < x + w; gx += 48) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
  for (let gy = y + 24; gy < y + h; gy += 48) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
  g.restore();
  g.strokeStyle = C.hair; g.lineWidth = 2; rrect(x, y, w, h, 18); g.stroke();
  g.strokeStyle = C.tick; g.lineWidth = 1.5;
  for (let i = 0; i <= 39; i++) { const tx = x + 16 + i * 24; const L = i % 5 === 0 ? 14 : 7; g.beginPath(); g.moveTo(tx, y + 6); g.lineTo(tx, y + 6 + L); g.stroke(); }
}

// ---------------------------------------------------------------- isometric radio stack
const ISO = (s) => [0.866 * s, 0.5 * s, -0.866 * s, 0.5 * s];
function isoBegin(cx, cy, s) { g.save(); g.translate(cx, cy); g.transform(...ISO(s), 0, 0); }
function radioPlate(t, kind, cx, cy, s, st) {
  // st: { on: 0..1 (transmitting), maybe: 0..1 (dashed, uncertain), frozen: time to freeze waves at }
  const L = 150; isoBegin(cx, cy, s);
  const on = st.on, maybe = st.maybe || 0;
  rrect(-L, -L, 2 * L, 2 * L, 16);
  g.fillStyle = on > 0.5 ? `rgba(42,221,250,${0.07 + 0.06 * on})` : maybe > 0.5 ? 'rgba(124,63,218,0.12)' : 'rgba(58,63,110,0.22)'; g.fill();
  g.lineWidth = (on > 0.5 ? 3.2 : 2.2) / s; g.strokeStyle = on > 0.5 ? C.on : maybe > 0.5 ? C.violetL : C.off;
  if (maybe > 0.5 && on <= 0.5) g.setLineDash([14 / s, 10 / s]); g.stroke(); g.setLineDash([]);
  // waves: expanding rings on the plate plane (stop when off; stand still when frozen)
  if (on > 0.02) {
    const tt = st.frozen != null ? Math.min(t, st.frozen) : t;
    for (let k = 0; k < 4; k++) {
      const r = ((tt * 70 + k * 34) % 136) + 8; const a = on * (1 - r / 144) * 0.85;
      g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.strokeStyle = `rgba(42,221,250,${a})`; g.lineWidth = 2.4 / s; g.stroke();
    }
  }
  g.restore();
  // glyph printed on the plate (screen space, slightly squashed to sit on the plane)
  g.save(); g.translate(cx, cy); g.scale(1, 0.62);
  glyph(kind, 0, 0, 2.3 * s, on > 0.5 ? C.on : maybe > 0.5 ? C.violetL : C.off, 3.2); g.restore();
}
function phonePlate(t, cx, cy, s, alive = 1) {
  isoBegin(cx, cy, s);
  rrect(-110, -200, 220, 400, 34); g.fillStyle = '#141a52'; g.fill(); g.lineWidth = 3 / s; g.strokeStyle = C.violetL; g.stroke();
  rrect(-96, -184, 192, 368, 24); g.fillStyle = '#080b30'; g.fill();
  // live screen: equaliser bars = the phone still works offline
  for (let i = 0; i < 9; i++) {
    const h = 26 + 70 * Math.abs(Math.sin(t * 3.1 + i * 0.9)) * alive;
    g.fillStyle = alive > 0.5 ? 'rgba(163,89,250,0.9)' : 'rgba(58,63,110,0.6)'; g.fillRect(-80 + i * 18, 60 - h, 10, h);
  }
  g.restore();
}
function stack(t, cx, base, s, st, gap = 150) {
  phonePlate(t, cx, base, s, 1);
  radioPlate(t, 'bt', cx, base - gap * s, s, st.bt);
  radioPlate(t, 'wifi', cx, base - 2 * gap * s, s, st.wifi);
  radioPlate(t, 'cell', cx, base - 3 * gap * s, s, st.cell);
  return { cell: [cx, base - 3 * gap * s], wifi: [cx, base - 2 * gap * s], bt: [cx, base - gap * s], phone: [cx, base], halfW: 260 * s };
}
function stateTag(x, y, on, maybe = 0, align = 'left') {
  const str = on > 0.5 ? 'ON' : maybe > 0.5 ? 'MAY BE OFF' : 'OFF';
  text(str, x, y, { font: `600 26px ${MONO}`, color: on > 0.5 ? C.on : maybe > 0.5 ? C.violetL : C.sec, align });
}
function plateLabels(t, P, st, lx = 104) {
  const rows = [['cellular', 'cell'], ['Wi-Fi', 'wifi'], ['Bluetooth', 'bt']];
  for (const [name, k] of rows) {
    const [cx, cy] = P[k];
    text(name, lx, cy - 4, { font: `600 30px Inter`, color: C.text });
    stateTag(lx, cy + 30, st[k].on, st[k].maybe);
    g.save(); g.strokeStyle = C.hair; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lx + 170, cy - 12); g.lineTo(cx - P.halfW + 10, cy); g.stroke(); g.restore();
  }
}

// ---------------------------------------------------------------- controls (generic quick-setting buttons, schematic)
function controls(t, x, y, w, st, scale = 1, opts = {}) {
  const n = 4, r = 40 * scale, h = opts.h || 140 * scale;
  g.save(); rrect(x, y, w, h, 16); g.fillStyle = C.panel2; g.fill(); g.strokeStyle = C.hair; g.lineWidth = 2; g.stroke(); g.restore();
  const kinds = ['plane', 'cell', 'wifi', 'bt']; const pos = [];
  for (let i = 0; i < n; i++) {
    const cx = x + w * (i + 0.5) / n, cy = y + h / 2 + (opts.dy || 0);
    const on = st[kinds[i]];
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = on > 0.5 ? (i === 0 ? C.violetL : C.on) : '#161b55'; g.fill();
    g.lineWidth = 2; g.strokeStyle = on > 0.5 ? '#ffffff' : C.off; g.stroke(); g.restore();
    glyph(kinds[i], cx, cy, 1.25 * scale, on > 0.5 ? '#07092a' : C.sec, 3);
    pos.push([cx, cy]);
  }
  return { pos, r };
}
function clockReadout(t, x, y, value, label) {
  text(label, x, y - 66, { font: `400 22px ${MONO}`, color: C.sec, kind: 'tag' });
  text(value, x, y, { font: `600 64px ${MONO}`, color: C.text, kind: 'clock' });
}
const fmtT = (v) => (v < 0 ? 'T−' : 'T+') + Math.abs(v).toFixed(1).padStart(4, '0');

// ---------------------------------------------------------------- evidence cards (re-typeset transcriptions)
function card(t, t0, x, y, w, h, lines, hl, tagStr, font = `italic 400 40px ${SERIF}`) {
  const a = cutIn(t, t0); if (a <= 0) return;
  tag(t, t0, x, y - 6, tagStr);
  g.save(); g.globalAlpha = a; rrect(x, y, w, h, 6); g.fillStyle = C.paper; g.fill();
  text('transcription', x + w - 18, y + 26, { font: `400 16px ${MONO}`, color: 'rgba(20,22,58,0.55)', align: 'right', kind: 'tag' });
  const lh = 50; let by = y + 70;
  lines.forEach((ln, i) => {
    g.font = font; const full = ln;
    if (hl && hl.line === i) { // highlight: magenta multiply, alpha 0.6, wiped left to right
      const pre = full.slice(0, full.indexOf(hl.text)); const wpre = g.measureText(pre).width, whl = g.measureText(hl.text).width;
      const p = prog(t, hl.t0, hl.t0 + 0.45, (u) => u);
      g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.6 * a; g.fillStyle = C.acc; g.fillRect(x + 30 + wpre - 4, by - 36, (whl + 8) * p, 48); g.restore();
    }
    text(full, x + 30, by, { font, color: C.ink, kind: 'quote' }); by += lh;
  });
  g.restore(); flashBox(t, t0, x, y, w, h);
}
function chip(x, y, kind, label, on, maybe = 0, w = 272) {
  g.save(); rrect(x, y, w, 58, 12); g.fillStyle = on > 0.5 ? 'rgba(42,221,250,0.14)' : 'rgba(58,63,110,0.25)'; g.fill();
  g.lineWidth = 2; g.strokeStyle = on > 0.5 ? C.on : maybe > 0.5 ? C.violetL : C.off; if (maybe > 0.5 && on <= 0.5) g.setLineDash([8, 6]); g.stroke(); g.restore();
  glyph(kind, x + 32, y + 29, 0.95, on > 0.5 ? C.on : C.sec, 2.6);
  text(label, x + 60, y + 38, { font: `600 26px Inter`, color: C.text });
  text(on > 0.5 ? 'ON' : 'OFF', x + w - 14, y + 38, { font: `600 24px ${MONO}`, color: on > 0.5 ? C.on : C.sec, align: 'right' });
}

// ---------------------------------------------------------------- props
function headphones(t, cx, cy, s, on, t0) {
  const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(cx, cy); g.scale(s, s);
  const col = on > 0.5 ? C.on : C.sec; g.strokeStyle = col; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 10, 78, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
  for (const sx of [-1, 1]) { rrect(sx * 78 - 22, -6, 44, 74, 18); g.fillStyle = '#121750'; g.fill(); g.stroke(); }
  if (on > 0.5) for (let k = 0; k < 2; k++) { const r = 18 + ((t * 40 + k * 14) % 28); g.globalAlpha = a * (1 - r / 48); g.lineWidth = 3; for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 78, 30, r, sx > 0 ? -0.6 : Math.PI - 0.6, sx > 0 ? 0.6 : Math.PI + 0.6); g.stroke(); } }
  g.restore(); flashBox(t, t0, cx - 110 * s, cy - 80 * s, 220 * s, 170 * s);
}
function accessPoint(t, cx, cy, s, on, t0) {
  const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(cx, cy); g.scale(s, s);
  const col = on > 0.5 ? C.on : C.sec; g.strokeStyle = C.tick; g.lineWidth = 3;
  g.beginPath(); g.moveTo(-130, -46); g.quadraticCurveTo(0, -78, 130, -46); g.stroke(); // cabin ceiling line (schematic)
  g.beginPath(); g.ellipse(0, -40, 62, 16, 0, 0, Math.PI * 2); g.fillStyle = '#121750'; g.fill(); g.strokeStyle = col; g.lineWidth = 5; g.stroke();
  g.beginPath(); g.arc(0, -40, 5, 0, Math.PI * 2); g.fillStyle = col; g.fill();
  if (on > 0.5) for (let k = 0; k < 3; k++) { const r = 20 + ((t * 46 + k * 22) % 66); g.globalAlpha = a * (1 - r / 90); g.lineWidth = 4; g.strokeStyle = C.on; g.beginPath(); g.arc(0, -30, r, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
  g.restore(); flashBox(t, t0, cx - 135 * s, cy - 85 * s, 270 * s, 140 * s);
}
function signalLink(t, t0, a, b, on) { // radio link: animated cyan dashes from a to b
  const p = prog(t, t0, t0 + 0.6); if (p <= 0) return;
  g.save(); g.strokeStyle = on ? C.on : C.tick; g.lineWidth = 3; g.setLineDash([10, 12]); g.lineDashOffset = -t * 60;
  g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(lerp(a[0], b[0], p), lerp(a[1], b[1], p)); g.stroke(); g.restore();
}

// ---------------------------------------------------------------- captions (upper-centre; ink y 350–470; margins ≥ 80 px)
function captions(t) {
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return;
  const a = cutIn(t, c.in); g.save(); g.globalAlpha = a;
  const font = `700 46px ${SANS}`;
  if (c.lines.length === 1) text(c.lines[0], 540, 424, { font, align: 'center', shadow: 10, kind: 'caption' });
  else { text(c.lines[0], 540, 394, { font, align: 'center', shadow: 10, kind: 'caption' }); text(c.lines[1], 540, 452, { font, align: 'center', shadow: 10, kind: 'caption' }); }
  g.restore();
}

// ---------------------------------------------------------------- layouts
function push(t, L, max = 1.022) { const u = clamp((t - L.in) / (L.out - L.in)); const s = 1 + (max - 1) * u; g.translate(540, 1050); g.scale(s, s); g.translate(-540, -1050); }

function L1(t) { // bench: the switch-on (hook + setup)
  const ao = t >= E.airplaneOn;
  const st = { cell: { on: ao ? 0 : 1 }, wifi: { on: ao ? 0 : 1, maybe: ao ? 1 : 0 }, bt: { on: ao ? 0 : 1, maybe: ao ? 1 : 0 } };
  clockReadout(t, 104, 652, fmtT(t - TL.clock.t0), 'event clock');
  const ctl = controls(t, 560, 556, 424, { plane: ao ? 1 : 0, cell: ao ? 0 : 1, wifi: ao ? 0 : 1, bt: ao ? 0 : 1 });
  flashBox(t, E.airplaneOn, 560, 556, 424, 140);
  if (ao) ring(t, E.airplaneOn + 0.05, ctl.pos[0][0], ctl.pos[0][1], 56, 56, 4);
  const P = stack(t, 560, 1350, 0.98, st);
  plateLabels(t, P, st);
  // brick ghost: the misconception, then struck through
  if (t >= E.brickGhost) {
    const a = cutIn(t, E.brickGhost) * (t > E.brickStrike + 0.4 ? 0.35 : 1);
    const [px, py] = P.phone; g.save(); g.globalAlpha = a; g.strokeStyle = C.sec; g.lineWidth = 3; g.setLineDash([12, 10]);
    const top = [[px - 290, py], [px, py - 165], [px + 290, py], [px, py + 165]];
    g.beginPath(); top.forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q))); g.closePath(); g.stroke();
    g.beginPath(); for (const q of [top[0], top[3], top[2]]) { g.moveTo(q[0], q[1]); g.lineTo(q[0], q[1] + 40); } g.moveTo(top[0][0], top[0][1] + 40); g.lineTo(top[3][0], top[3][1] + 40); g.lineTo(top[2][0], top[2][1] + 40); g.stroke();
    g.restore(); flashBox(t, E.brickGhost, px - 290, py - 165, 580, 370);
    leader(t, E.brickStrike, [[px - 270, py + 140], [px + 270, py - 140]], 0.3, C.acc, null, 6);
    check(t, E.brickStrike + 0.35, px + 250, py - 40, 48);
  }
  // V2: freeze + circle the cellular plate
  if (t >= E.circleCell) { const [cx, cy] = P.cell; ring(t, E.circleCell, cx, cy, 300, 168, 4.5); }
}
function L2(t) { // two sources meet at T+00.0
  clockReadout(t, 104, 652, 'T+00.0', 'at switch-on');
  card(t, E.srcA, 96, 778, 888, 120, ['“This turns off all radios except for Bluetooth.”'], { line: 0, text: 'except for Bluetooth', t0: E.srcA + 0.35 }, 'Apple Support · iPhone · 2026-02-11', `italic 400 39px ${SERIF}`);
  if (t >= E.srcA + 0.2) { const a = cutIn(t, E.srcA + 0.2); g.save(); g.globalAlpha = a;
    chip(96, 926, 'cell', 'cellular', 0); chip(400, 926, 'wifi', 'Wi-Fi', 0); chip(704, 926, 'bt', 'Bluetooth', 1, 0, 280); g.restore(); }
  card(t, E.srcB, 96, 1132, 888, 120, ['“…Wi-Fi and Bluetooth turn off.”'], { line: 0, text: 'Wi-Fi and Bluetooth turn off', t0: E.srcB + 0.35 }, 'Google Pixel Help · Android · at first', `italic 400 39px ${SERIF}`);
  if (t >= E.srcB + 0.2) { const a = cutIn(t, E.srcB + 0.2); g.save(); g.globalAlpha = a;
    chip(96, 1280, 'cell', 'cellular', 0); chip(400, 1280, 'wifi', 'Wi-Fi', 0); chip(704, 1280, 'bt', 'Bluetooth', 0, 0, 280); g.restore(); }
  // sync line: both sources describe the same instant
  leader(t, E.srcB + 0.6, [[84, 668], [84, 1338]], 0.6, C.acc, [10, 9], 3);
  // the difference, circled
  ring(t, E.diffBracket, 844, 1132, 166, 252, 4);
  if (t >= E.diffBracket + 0.45) text('differs by device', 984, 1446, { font: `600 30px ${MONO}`, color: C.acc, align: 'right', alpha: cutIn(t, E.diffBracket + 0.45) });
}
function L3(t) { // radios come back one by one; cellular stays off
  const wOn = t >= E.wifiOn ? 1 : 0, bOn = t >= E.btOn ? 1 : 0;
  const fz = t >= E.freezeCompare ? E.freezeCompare : null;
  const st = { cell: { on: 0 }, wifi: { on: wOn, frozen: fz }, bt: { on: bOn, frozen: fz } };
  clockReadout(t, 104, 652, fmtT(Math.min(t, fz ?? t) - TL.clock.t0), fz ? 'event clock · frozen' : 'event clock');
  const ctl = controls(t, 560, 556, 424, { plane: 1, cell: 0, wifi: wOn, bt: bOn });
  flashBox(t, E.wifiOn, 560 + 212, 556, 106, 140); flashBox(t, E.btOn, 560 + 318, 556, 106, 140);
  const P = stack(t, 560, 1350, 0.98, st);
  plateLabels(t, P, st);
  if (fz) { flashBox(t, E.freezeCompare, 64, 512, 952, 1080); const [cx, cy] = P.cell; ring(t, E.freezeCompare + 0.05, cx, cy, 300, 168, 4.5);
    if (t >= E.freezeCompare + 0.4) text('still off', cx + 300, cy - 120, { font: `600 30px ${MONO}`, color: C.acc, align: 'right', alpha: cutIn(t, E.freezeCompare + 0.4) }); }
}
function L4(t) { // what still works — only where the airline allows it
  const st = { cell: { on: 0 }, wifi: { on: 1 }, bt: { on: 1 } };
  clockReadout(t, 104, 652, fmtT(t - TL.clock.t0), 'event clock');
  const P = stack(t, 400, 1286, 0.78, st, 150);
  text('cellular · OFF', 104, 800, { font: `600 26px ${MONO}`, color: C.sec });
  text('Wi-Fi · ON', 104, 1452, { font: `600 26px ${MONO}`, color: C.on, alpha: t >= E.allowGate + 0.15 ? 0 : 1 });
  text('Bluetooth · ON', 104, 1496, { font: `600 26px ${MONO}`, color: C.on, alpha: t >= E.allowGate + 0.15 ? 0 : 1 });
  if (t >= E.apLink) text('cabin Wi-Fi', 832, 980, { font: `400 24px ${MONO}`, color: C.sec, align: 'center', alpha: cutIn(t, E.apLink) });
  if (t >= E.phonesLink) text('headphones', 832, 1290, { font: `400 24px ${MONO}`, color: C.sec, align: 'center', alpha: cutIn(t, E.phonesLink) });
  accessPoint(t, 832, 880, 0.95, t >= E.apLink + 0.5 ? 1 : 0, E.apLink - 0.15);
  headphones(t, 832, 1170, 0.95, t >= E.phonesLink + 0.5 ? 1 : 0, E.phonesLink - 0.15);
  signalLink(t, E.apLink, [P.wifi[0] + P.halfW - 10, P.wifi[1]], [770, 880], true);
  signalLink(t, E.phonesLink, [P.bt[0] + P.halfW - 10, P.bt[1]], [742, 1180], true);
  check(t, E.works, 940, 790, 44); check(t, E.works + 0.12, 940, 1090, 44);
  // the condition: only if the airline allows it
  if (t >= E.allowGate) {
    const x = 668, y = 760, w = 316, h = 560;
    leader(t, E.allowGate, [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], 0.7, C.acc, [12, 10], 3);
    if (t >= E.allowGate + 0.5) text('airline rules', x + w - 8, y + h + 40, { font: `600 26px ${MONO}`, color: C.acc, align: 'right', alpha: cutIn(t, E.allowGate + 0.5) });
    card(t, E.allowGate + 0.15, 96, 1440, 888, 96, ['“If the airline allows it, you can still use…”'], { line: 0, text: 'If the airline allows it', t0: E.allowGate + 0.4 }, 'Apple Support · 2026-02-11', `italic 400 36px ${SERIF}`);
  }
}
function L5(t) { // freeze + magnify: the icons are different radios
  const L = lay('L5');
  tag(t, L.in, 96, 552, 'controls · ×2 · schematic');
  const ctl = controls(t, 96, 566, 888, { plane: 1, cell: 0, wifi: 1, bt: 1 }, 1.7, { h: 200 });
  flashBox(t, L.in, 96, 566, 888, 200);
  const [pc, cc, wc, bc] = ctl.pos; const R = ctl.r;
  const mods = [['cell', ['cellular', 'radio'], cc[0], 0], ['wifi', ['Wi-Fi', 'radio'], wc[0], 1], ['bt', ['Bluetooth', 'radio'], bc[0], 1]];
  for (const [k, name, x, on] of mods) {
    g.save(); rrect(x - 102, 1000, 204, 290, 14); g.fillStyle = on ? 'rgba(42,221,250,0.10)' : 'rgba(58,63,110,0.22)'; g.fill(); g.strokeStyle = on ? C.on : C.off; g.lineWidth = 2; g.stroke(); g.restore();
    glyph(k, x, 1068, 1.6, on ? C.on : C.sec, 3);
    name.forEach((n, i) => text(n, x, 1150 + i * 38, { font: `600 30px Inter`, color: C.text, align: 'center' }));
    text(on ? 'ON' : 'OFF', x, 1260, { font: `600 26px ${MONO}`, color: on ? C.on : C.sec, align: 'center' });
  }
  leader(t, E.leaderCell, [[cc[0], cc[1] + R + 6], [cc[0], 996]], 0.5);
  leader(t, E.leaderWifi, [[wc[0], wc[1] + R + 6], [wc[0], 996]], 0.5);
  leader(t, E.leaderBt, [[bc[0], bc[1] + R + 6], [bc[0], 996]], 0.5);
  // the airplane button reaches several radios (dashed: which ones depends on device and settings)
  leader(t, E.leaderPlane, [[pc[0], pc[1] + R + 6], [pc[0], 1340], [bc[0] + 60, 1340]], 0.7, C.acc, [10, 8], 3);
  for (const x of [cc[0], wc[0], bc[0]]) leader(t, E.leaderPlane + 0.55, [[x, 1340], [x, 1294]], 0.2, C.acc, [6, 5], 3);
  // misconception: one "internet switch" — shown dashed, then struck through
  if (t >= E.ghostSwitch) {
    const a = cutIn(t, E.ghostSwitch) * (t > E.strikeSwitch + 0.4 ? 0.45 : 1); g.save(); g.globalAlpha = a;
    rrect(370, 1440, 340, 92, 46); g.setLineDash([12, 9]); g.strokeStyle = C.sec; g.lineWidth = 3; g.stroke(); g.setLineDash([]);
    g.beginPath(); g.arc(663, 1486, 34, 0, Math.PI * 2); g.fillStyle = C.sec; g.fill();
    text('INTERNET', 412, 1498, { font: `600 32px ${MONO}`, color: C.sec }); g.restore();
    flashBox(t, E.ghostSwitch, 370, 1440, 340, 92);
    leader(t, E.strikeSwitch, [[350, 1530], [730, 1442]], 0.3, C.acc, null, 6);
  }
}
function L6(t) { // known / depends board
  text('KNOWN', 104, 604, { font: `600 30px ${MONO}`, color: C.text }); text('DEPENDS', 568, 604, { font: `600 30px ${MONO}`, color: C.text });
  g.save(); g.strokeStyle = C.hair; g.lineWidth = 2; g.beginPath(); g.moveTo(96, 622); g.lineTo(520, 622); g.moveTo(560, 622); g.lineTo(984, 622); g.stroke(); g.restore();
  const item = (t0, x, y, lines, src, known) => {
    const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; rrect(x, y, 424, 168, 12); g.fillStyle = known ? 'rgba(254,64,146,0.07)' : 'rgba(58,63,110,0.18)'; g.fill();
    g.strokeStyle = known ? C.hair : C.tick; g.lineWidth = 2; if (!known) g.setLineDash([10, 8]); g.stroke(); g.restore();
    if (known) check(t, t0, x + 20, y + 22, 40); else { g.save(); g.globalAlpha = a; g.strokeStyle = C.tick; g.setLineDash([6, 5]); g.lineWidth = 2; rrect(x + 20, y + 22, 40, 40, 8); g.stroke(); g.restore(); }
    lines.forEach((ln, i) => text(ln, x + 78, y + 54 + i * 40, { font: `600 32px Inter`, color: C.text, alpha: a }));
    text(src, x + 78, y + 146, { font: `400 21px ${MONO}`, color: C.sec, alpha: a, kind: 'tag' });
    flashBox(t, t0, x, y, 424, 168);
  };
  item(E.known1, 96, 648, ['Cellular', 'switches off'], 'FAA · Apple', true);
  item(E.known2, 96, 840, ['Crew instructions', 'come first'], 'EASA · FAA', true);
  item(E.dep1, 560, 648, ['Wi-Fi & Bluetooth', 'defaults'], 'Apple vs Google', false);
  item(E.dep2, 560, 840, ['When cabin Wi-Fi', 'may be used'], 'FAA · airline', false);
  // check what is actually on
  if (t >= E.checkRing - 0.4) {
    const a = cutIn(t, E.checkRing - 0.4); g.save(); g.globalAlpha = a;
    const ctl = controls(t, 186, 1110, 708, { plane: 1, cell: 0, wifi: 1, bt: 1 }, 1.25, { h: 170 }); g.restore();
    ring(t, E.checkRing, 540, 1195, 400, 118, 4.5);
    if (t >= E.checkChips) ['ON', 'OFF', 'ON', 'ON'].forEach((s, i) => text(s, ctl.pos[i][0], 1340, { font: `600 28px ${MONO}`, color: s === 'ON' ? C.on : C.sec, align: 'center', alpha: cutIn(t, E.checkChips + i * 0.12) }));
  }
}
function L7(t) { // evidence map + signature
  const L = lay('L7');
  const st = { cell: { on: 0 }, wifi: { on: 1 }, bt: { on: 1 } };
  const P = stack(t, 540, 1196, 0.62, st, 150);
  const srcs = [['Apple Support · 2026-02-11', 104, 630], ['Google Pixel Help', 104, 760], ['FAA InFO 13010 · 2013', 600, 630], ['EASA · 2014', 600, 760]];
  srcs.forEach(([s, x, y], i) => { tag(t, L.in + 0.1 + i * 0.12, x, y, s, C.text); leader(t, L.in + 0.25 + i * 0.12, [[x + 120, y + 12], [540, 840]], 0.5, C.acc, [8, 8], 2.5); });
  const a = cutIn(t, L.in + 0.7); g.save(); g.globalAlpha = a;
  g.drawImage(icon, 330, 1424, 64, 64);
  text('Media Diet', 412, 1468, { font: `700 38px ${SANS}`, color: C.text });
  text('tech, explained', 660, 1468, { font: `400 24px ${MONO}`, color: C.sec }); g.restore();
}

const LAYOUT_FN = { L1, L2, L3, L4, L5, L6, L7 };

function render(f) {
  const t = f / FPS; T = t; TEXTLOG = [];
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  bench();
  const L = TL.layouts.find((l) => inL(t, l)) || TL.layouts[TL.layouts.length - 1];
  g.save(); push(t, L); LAYOUT_FN[L.id](t); g.restore();
  // hard cut on the 0.5 s grid: 3-frame white flash over the bench
  for (const l of TL.layouts) if (l.in > 0 && t >= l.in && t < l.in + 0.1) { g.save(); g.globalAlpha = 0.22 * (1 - (t - l.in) / 0.1); g.fillStyle = '#fff'; rrect(64, 512, 952, 1080, 18); g.fill(); g.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  captions(t);
  return t;
}
window.render = render;
window.TEXTS = () => TEXTLOG;
window.__ready = true;
