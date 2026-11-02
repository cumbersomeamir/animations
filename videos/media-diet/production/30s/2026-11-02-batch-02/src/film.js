// Media Diet · 30 s production 02 — "How noise cancelling headphones create quiet"
// Visual Investigation grammar (adapted, see context/11): one examination bench; evidence case → cutaway → waveform
// chart with a playhead (slowed time) → cutaway → two-column board → fit check → evidence map.
// Every motion is tied to a narration beat (user feedback: no decorative motion). Deterministic: window.render(frame).
const TL = await (await fetch('./timeline.json')).json();
const CUES = await (await fetch('./data/cues.json')).json();
const E = TL.events;
const W = TL.width, H = TL.height, FPS = TL.fps;
const cv = document.getElementById('c'); const g = cv.getContext('2d');
await Promise.all(['700 46px "Space Grotesk"', '600 30px Inter', '400 22px "Plex Mono"', '600 64px "Plex Mono"'].map((f) => document.fonts.load(f)));
const icon = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '../../../../assets/icon.png'; });

// Palette roles (identical to production 01; sampled from assets/icon.png)
const C = { ground: '#04061f', panel: '#0a0e36', panel2: '#0e1345', hair: '#2a2f72', text: '#ECEAF6', sec: '#9094c4', tick: '#4a4f80',
  acc: '#fe4092', on: '#2addfa', violet: '#7c3fda', violetL: '#a359fa', off: '#3a3f6e', foam: '#191d5c', noise: '#c9c6e6' };
const SANS = '"Space Grotesk"', MONO = '"Plex Mono"';

// ---------------------------------------------------------------- shared helpers (same grammar as production 01)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const outCubic = (u) => 1 - Math.pow(1 - u, 3);
const prog = (t, a, b, e = outCubic) => e(clamp((t - a) / (b - a)));
let TEXTLOG = [];
function text(str, x, y, o = {}) {
  g.save(); g.font = o.font || `500 30px ${SANS}`; g.fillStyle = o.color || C.text; g.textAlign = o.align || 'left'; g.textBaseline = 'alphabetic';
  g.globalAlpha *= o.alpha ?? 1; if (o.shadow) { g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = o.shadow; }
  g.fillText(str, x, y);
  const m = g.measureText(str); const tr = g.getTransform();
  const p = (px, py) => ({ x: tr.a * px + tr.c * py + tr.e, y: tr.b * px + tr.d * py + tr.f });
  const a = p(x - m.actualBoundingBoxLeft, y - m.actualBoundingBoxAscent), b = p(x + m.actualBoundingBoxRight, y + m.actualBoundingBoxDescent);
  if (g.globalAlpha > 0.05) TEXTLOG.push({ kind: o.kind || 'label', text: str, x0: Math.round(a.x), y0: Math.round(a.y), x1: Math.round(b.x), y1: Math.round(b.y) });
  g.restore();
}
function rrect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const cutIn = (t, t0) => clamp((t - t0) / 0.1);
function flashBox(t, t0, x, y, w, h) { const f = 1 - clamp((t - t0) / 0.11); if (t >= t0 && f > 0) { g.save(); g.globalAlpha = 0.75 * f; g.fillStyle = '#fff'; g.fillRect(x, y, w, h); g.restore(); } }
function tag(t, t0, x, y, str, color = C.sec) { const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = C.acc; g.fillRect(x, y - 15, 6, 12);
  text(str, x + 14, y - 3, { font: `400 22px ${MONO}`, color, kind: 'tag' }); g.restore(); }
function ring(t, t0, cx, cy, rx, ry, lw = 4) { const p = prog(t, t0, t0 + 0.5); if (p <= 0) return; g.save(); g.strokeStyle = C.acc; g.lineWidth = lw; g.lineCap = 'round';
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); g.stroke(); g.restore(); }
function leader(t, t0, pts, dur = 0.5, color = C.acc, dash = null, lw = 3) {
  const p = prog(t, t0, t0 + dur); if (p <= 0) return; let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * p; g.save(); g.strokeStyle = color; g.lineWidth = lw; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && left > 0; i++) { const u = Math.min(1, left / seg[i - 1]); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= seg[i - 1]; }
  g.stroke(); g.restore();
}
function check(t, t0, x, y, s = 44) { const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = C.acc; rrect(x, y, s, s, 8); g.fill();
  const p = prog(t, t0, t0 + 0.25); g.strokeStyle = '#fff'; g.lineWidth = s * 0.12; g.lineCap = 'round'; g.lineJoin = 'round';
  const P = [[x + s * 0.24, y + s * 0.52], [x + s * 0.43, y + s * 0.7], [x + s * 0.77, y + s * 0.32]]; g.beginPath(); g.moveTo(...P[0]);
  if (p > 0) { const u1 = Math.min(1, p * 2); g.lineTo(lerp(P[0][0], P[1][0], u1), lerp(P[0][1], P[1][1], u1)); if (p > 0.5) { const u2 = (p - 0.5) * 2; g.lineTo(lerp(P[1][0], P[2][0], u2), lerp(P[1][1], P[2][1], u2)); } }
  g.stroke(); g.restore(); flashBox(t, t0, x, y, s, s); }
function bench() {
  g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 1050, 120, 540, 1050, 1150); vg.addColorStop(0, 'rgba(36,40,126,0.30)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const x = 64, y = 512, w = 952, h = 1080; g.save(); rrect(x, y, w, h, 18); g.fillStyle = C.panel; g.fill(); g.clip(); g.strokeStyle = 'rgba(42,47,114,0.38)'; g.lineWidth = 1;
  for (let gx = x + 24; gx < x + w; gx += 48) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
  for (let gy = y + 24; gy < y + h; gy += 48) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
  g.restore(); g.strokeStyle = C.hair; g.lineWidth = 2; rrect(x, y, w, h, 18); g.stroke(); g.strokeStyle = C.tick; g.lineWidth = 1.5;
  for (let i = 0; i <= 39; i++) { const tx = x + 16 + i * 24; const L = i % 5 === 0 ? 14 : 7; g.beginPath(); g.moveTo(tx, y + 6); g.lineTo(tx, y + 6 + L); g.stroke(); }
}
function captions(t) { const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; g.save(); g.globalAlpha = cutIn(t, c.in); const font = `700 46px ${SANS}`;
  if (c.lines.length === 1) text(c.lines[0], 540, 424, { font, align: 'center', shadow: 10, kind: 'caption' });
  else { text(c.lines[0], 540, 394, { font, align: 'center', shadow: 10, kind: 'caption' }); text(c.lines[1], 540, 452, { font, align: 'center', shadow: 10, kind: 'caption' }); }
  g.restore(); }
function push(t, L, max = 1.022) { const u = clamp((t - L.in) / (L.out - L.in)); const s = 1 + (max - 1) * u; g.translate(540, 1050); g.scale(s, s); g.translate(-540, -1050); }
function readout(label, value, x = 104, y = 652) { text(label, x, y - 66, { font: `400 22px ${MONO}`, color: C.sec, kind: 'tag' }); text(value, x, y, { font: `600 64px ${MONO}`, color: C.text, kind: 'clock' }); }

// ---------------------------------------------------------------- headphones (top view, schematic line art)
function headphonesTop(cx, cy, s, o = {}) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = C.violetL; g.lineWidth = 16; g.beginPath(); g.arc(0, 40, 210, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  g.strokeStyle = '#2b2f78'; g.lineWidth = 8; g.beginPath(); g.arc(0, 40, 210, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
  for (const sx of [-1, 1]) {
    g.save(); g.translate(sx * 205, 110);
    rrect(-62, -96, 124, 192, 52); g.fillStyle = '#141a52'; g.fill(); g.strokeStyle = C.violetL; g.lineWidth = 5; g.stroke();
    rrect(-44, -76, 88, 152, 38); g.strokeStyle = o.cushion ? C.on : C.tick; g.lineWidth = 9; g.stroke();      // cushion
    g.beginPath(); g.arc(sx * -40, -62, 7, 0, Math.PI * 2); g.fillStyle = o.mic ? C.on : C.sec; g.fill();       // outer microphone grille
    g.restore();
  }
  g.restore();
}
// ---------------------------------------------------------------- ear-cup cutaway (schematic cross-section)
// Shell on the left, ear/head on the right. Returns anchor points.
function cutaway(t, cx, cy, s, st) {
  const P = (x, y) => [cx + x * s, cy + y * s];
  g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  // head side + ear (right)
  g.strokeStyle = C.tick; g.lineWidth = 4; g.beginPath(); g.moveTo(250, -330); g.lineTo(250, 330); g.stroke();
  g.beginPath(); g.moveTo(250, -70); g.bezierCurveTo(200, -80, 190, 40, 250, 70); g.stroke();
  g.fillStyle = 'rgba(74,79,128,0.25)'; g.fillRect(250, -330, 60, 660);
  // shell (D shape)
  g.beginPath(); g.moveTo(150, -290); g.bezierCurveTo(-120, -300, -260, -180, -260, 0); g.bezierCurveTo(-260, 180, -120, 300, 150, 290);
  g.fillStyle = '#121750'; g.fill(); g.strokeStyle = C.violetL; g.lineWidth = 6; g.stroke();
  // inner cavity
  g.beginPath(); g.moveTo(150, -240); g.bezierCurveTo(-60, -245, -190, -150, -190, 0); g.bezierCurveTo(-190, 150, -60, 245, 150, 240); g.closePath();
  g.fillStyle = '#0a0e36'; g.fill();
  // cushions (top and bottom), hatched foam
  const gap = st.gap || 0;
  for (const sy of [-1, 1]) {
    const y0 = sy > 0 ? 170 : -300, h = 130;
    g.save(); rrect(150, y0, 100 - gap, h, 34); g.fillStyle = st.cushionHi ? 'rgba(42,221,250,0.18)' : C.foam; g.fill(); g.strokeStyle = st.cushionHi ? C.on : C.violetL; g.lineWidth = 4; g.stroke();
    g.clip(); g.strokeStyle = 'rgba(163,89,250,0.35)'; g.lineWidth = 2; for (let k = -6; k < 12; k++) { g.beginPath(); g.moveTo(150 + k * 18, y0); g.lineTo(150 + k * 18 + 60, y0 + h); g.stroke(); } g.restore();
  }
  // driver (cone facing the ear)
  g.beginPath(); g.moveTo(60, -120); g.lineTo(120, -150); g.lineTo(120, 150); g.lineTo(60, 120); g.closePath(); g.fillStyle = '#1b2066'; g.fill();
  g.strokeStyle = st.driver ? C.on : C.sec; g.lineWidth = 5; g.stroke(); g.fillStyle = st.driver ? C.on : C.sec; g.fillRect(30, -40, 30, 80);
  // electronics
  rrect(-150, -40, 110, 80, 10); g.fillStyle = st.chip ? 'rgba(42,221,250,0.25)' : '#161b55'; g.fill(); g.strokeStyle = st.chip ? C.on : C.sec; g.lineWidth = 4; g.stroke();
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-135 + k * 27, 40); g.lineTo(-135 + k * 27, 54); g.moveTo(-135 + k * 27, -40); g.lineTo(-135 + k * 27, -54); g.stroke(); }
  // microphones: outer (on shell, outside) and inner (inside the cup, near the ear)
  g.beginPath(); g.arc(-180, -205, 16, 0, Math.PI * 2); g.fillStyle = st.micOut ? C.on : C.sec; g.fill();
  g.beginPath(); g.arc(170, 40, 13, 0, Math.PI * 2); g.fillStyle = st.micIn ? C.on : C.sec; g.fill();
  g.restore();
  return { micOut: P(-180, -205), micIn: P(170, 40), chip: P(-95, 0), driver: P(120, 0), cushionTop: P(200, -235), cushionBot: P(200, 235), ear: P(250, 0), shellLeft: P(-260, 0), gapPt: P(250, 235) };
}
// travelling wave segment (schematic): from x0 to x1 at y, amplitude amp, wavelength lam, phase from time
function waveLine(x0, x1, y, amp, lam, phase, color, lw = 4, alpha = 1, drawTo = 1) {
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = lw; g.beginPath();
  const xe = lerp(x0, x1, drawTo); for (let x = x0; x <= xe; x += 3) { const y_ = y + amp * Math.sin(((x - x0) / lam) * Math.PI * 2 - phase); if (x === x0) g.moveTo(x, y_); else g.lineTo(x, y_); }
  g.stroke(); g.restore();
}

function waveV(x, y0, y1, amp, lam, phase, color, lw = 3) { // vertical travelling wave (leak through a gap)
  g.save(); g.strokeStyle = color; g.lineWidth = lw; g.beginPath(); const dir = y1 < y0 ? -1 : 1;
  for (let y = y0; dir * (y1 - y) >= 0; y += 3 * dir) { const x_ = x + amp * Math.sin((Math.abs(y - y0) / lam) * Math.PI * 2 - phase); if (y === y0) g.moveTo(x_, y); else g.lineTo(x_, y); }
  g.stroke(); g.restore();
}
// ---------------------------------------------------------------- waveform chart with playhead (slowed time)
const CH = { x0: 150, x1: 960, rows: [{ y: 790, label: 'noise · outer mic' }, { y: 1010, label: 'anti-noise · driver' }, { y: 1230, label: 'what reaches your ear' }], amp: 72 };
function chart(t, t0, kind) {
  const dur = 2.6; const p = clamp((t - t0) / dur); const xp = lerp(CH.x0, CH.x1, p);
  readout(kind.scale, `t +${(p * kind.ms).toFixed(1)} ms`);
  CH.rows.forEach((r, i) => {
    g.save(); g.strokeStyle = C.hair; g.lineWidth = 1.5; g.beginPath(); g.moveTo(CH.x0, r.y); g.lineTo(CH.x1, r.y); g.stroke(); g.restore();
    text(r.label, 104, r.y - 96, { font: `600 28px Inter`, color: i === 2 ? C.text : C.sec });
  });
  const f = (row, x) => { const u = (x - CH.x0) / (CH.x1 - CH.x0); const n = kind.noise(u); return row === 0 ? n : row === 1 ? kind.anti(u) : n + kind.anti(u); };
  const cols = [C.noise, C.on, '#ffffff'];
  CH.rows.forEach((r, i) => {
    if (i === 2 && t < (kind.sumAt ?? t0)) return;
    g.save(); g.strokeStyle = cols[i]; g.lineWidth = i === 2 ? 5 : 4; g.beginPath();
    for (let x = CH.x0; x <= xp; x += 2) { const y_ = r.y - CH.amp * f(i, x); if (x === CH.x0) g.moveTo(x, y_); else g.lineTo(x, y_); }
    g.stroke(); g.restore();
  });
  g.save(); g.strokeStyle = C.acc; g.lineWidth = 3; g.beginPath(); g.moveTo(xp, 700); g.lineTo(xp, 1320); g.stroke(); g.restore();   // playhead
  return { xp, y: (i, u) => CH.rows[i].y - CH.amp * f(i, lerp(CH.x0, CH.x1, u)), xAt: (u) => lerp(CH.x0, CH.x1, u) };
}
const KIND = {
  generic: { scale: 'slowed · schematic', ms: 12.0, noise: (u) => Math.sin(u * Math.PI * 2 * 3.0), anti: (u) => -0.62 * Math.sin(u * Math.PI * 2 * 3.0) },
  engine: { scale: 'engine rumble · schematic', ms: 25.0, noise: (u) => Math.sin(u * Math.PI * 2 * 1.6) * 0.95 + 0.06 * Math.sin(u * Math.PI * 2 * 3.2), anti: (u) => -0.9 * (Math.sin(u * Math.PI * 2 * 1.6) * 0.95 + 0.06 * Math.sin(u * Math.PI * 2 * 3.2)) },
  voice: { scale: 'voice / sudden · schematic', ms: 25.0,
    noise: (u) => { const burst = (c, w) => Math.exp(-Math.pow((u - c) / w, 2)); const v = 0.8 * Math.sin(u * Math.PI * 2 * 14) * (burst(0.28, 0.07) + burst(0.62, 0.05)); const click = 1.1 * Math.exp(-Math.pow((u - 0.82) / 0.008, 2)); return clamp(v + click + 0.25 * Math.sin(u * Math.PI * 2 * 1.6), -1.15, 1.15); },
    anti: (u) => -0.85 * 0.25 * Math.sin(u * Math.PI * 2 * 1.6) },
};

// ---------------------------------------------------------------- layouts
function L1(t) { // evidence case opens; "not just a wall"
  tag(t, 0, 104, 566, 'evidence · noise cancelling headphones');
  const open = prog(t, E.lidOpen, E.lidOpen + 0.35);
  const bx = 120, by = 640, bw = 840, bh = 820;
  g.save(); rrect(bx, by, bw, bh, 28); g.fillStyle = '#0d1140'; g.fill(); g.strokeStyle = C.hair; g.lineWidth = 3; g.stroke(); g.restore();   // case base
  g.save(); rrect(bx + 40, by + 40, bw - 80, bh - 80, 22); g.fillStyle = C.foam; g.fill(); g.restore();                                    // foam bed
  if (open > 0) headphonesTop(540, 1010, 1.25, { mic: t >= E.micHint, cushion: false });
  // lid: lifts off (top edge moves up, shrinks) — drawn as a quad
  const lidH = Math.max(18, (bh + 16) * (1 - open));
  g.save(); rrect(bx - 8, by - 8 - (open > 0.98 ? 22 : 0), bw + 16, lidH, 26); g.fillStyle = '#151a54'; g.fill(); g.strokeStyle = C.violetL; g.lineWidth = 4; g.stroke();
  if (open < 0.6) { rrect(520, by - 8 + lidH - 70, 40, 60, 10); g.fillStyle = t >= E.latch ? C.acc : C.sec; g.fill(); }   // latch
  g.restore();
  flashBox(t, E.lidOpen, bx, by, bw, bh);
  // the "wall" idea: a hatched barrier around one cup (dashed = only part of the story)
  if (t >= E.wallGhost) {
    const a = cutIn(t, E.wallGhost); g.save(); g.globalAlpha = a; g.strokeStyle = C.sec; g.lineWidth = 4; g.setLineDash([12, 10]); rrect(178, 998, 212, 298, 50); g.stroke(); g.restore();
    text('wall', 284, 1350, { font: `600 30px ${MONO}`, color: C.sec, align: 'center', alpha: a });
  }
  if (t >= E.micHint) { ring(t, E.micHint, 540 + 1.25 * 205 + 1.25 * 40 * -1 * 1, 1010 + 1.25 * (110 - 62), 30, 30, 4); ring(t, E.micHint + 0.1, 540 - 1.25 * 205 + 1.25 * 40, 1010 + 1.25 * (110 - 62), 30, 30, 4);
    text('+ ?', 796, 1350, { font: `600 34px ${MONO}`, color: C.acc, align: 'center', alpha: cutIn(t, E.micHint + 0.2) }); }
}
function L2(t) { // cutaway: microphones listen, electronics create the opposing wave
  tag(t, 3.5, 104, 566, 'cutaway · one ear cup · schematic');
  const st = { micOut: t >= E.micOut, micIn: t >= E.micIn, chip: t >= E.chip, driver: t >= E.antiOut };
  const A = cutaway(t, 560, 1060, 1.12, st);
  // outside noise arriving at the outer microphone (only after "listen to the noise")
  const reach = prog(t, E.noiseIn, E.noiseIn + 0.6, (u) => u);
  waveLine(96, lerp(96, A.micOut[0] - 34, reach), A.micOut[1], 30, 90, t * 6, C.noise, 4, 1);
  text('noise', 104, A.micOut[1] - 54, { font: `600 26px ${MONO}`, color: C.noise, alpha: cutIn(t, E.noiseIn) });
  ring(t, E.micOut, A.micOut[0], A.micOut[1], 40, 40, 4); if (t >= E.micOut + 0.3) text('outer mic', A.micOut[0] - 20, A.micOut[1] - 56, { font: `600 26px ${MONO}`, color: C.acc, alpha: cutIn(t, E.micOut + 0.3) });
  ring(t, E.micIn, A.micIn[0], A.micIn[1], 34, 34, 4); if (t >= E.micIn + 0.3) text('inner mic', A.micIn[0] + 26, A.micIn[1] + 64, { font: `600 26px ${MONO}`, color: C.acc, alpha: cutIn(t, E.micIn + 0.3) });
  // signal path: mics -> electronics -> driver
  leader(t, E.chip - 0.3, [A.micOut, [A.micOut[0], A.chip[1] - 60], [A.chip[0] - 40, A.chip[1] - 60]], 0.4, C.on, [8, 6], 3);
  leader(t, E.chip - 0.1, [A.micIn, [A.micIn[0] - 60, A.micIn[1]], [A.chip[0] + 60, A.chip[1] + 20]], 0.4, C.on, [8, 6], 3);
  if (t >= E.chip) text('electronics', A.chip[0], A.chip[1] + 110, { font: `600 26px ${MONO}`, color: C.on, align: 'center', alpha: cutIn(t, E.chip) });
  leader(t, E.antiOut - 0.25, [[A.chip[0] + 60, A.chip[1]], [A.driver[0] - 60, A.driver[1]]], 0.25, C.on, [8, 6], 3);
  // the opposing wave leaves the driver towards the ear (inverted shape of the incoming noise)
  if (t >= E.antiOut) { const r = prog(t, E.antiOut, E.antiOut + 0.6, (u) => u);
    waveLine(A.driver[0] + 4, lerp(A.driver[0] + 4, A.ear[0] - 4, r), A.driver[1] - 100, -30, 60, t * 6, C.on, 4);
    text('anti-noise', A.driver[0] - 20, A.driver[1] - 160, { font: `600 26px ${MONO}`, color: C.on, alpha: cutIn(t, E.antiOut) }); }
}
function L3(t) { // waves meet: reduced, not zero
  const c = chart(t, E.playA, { ...KIND.generic, sumAt: E.sumA });
  if (t >= E.ringA) { ring(t, E.ringA, c.xAt(0.42), CH.rows[2].y, 120, 70, 4);
    text('reduced, not zero', c.xAt(0.42) + 140, CH.rows[2].y + 120, { font: `600 28px ${MONO}`, color: C.acc, align: 'center', alpha: cutIn(t, E.ringA + 0.35) }); }
}
function L4(t) { // steady low rumble: mostly cancelled
  const c = chart(t, E.playB, { ...KIND.engine, sumAt: E.playB });
  tag(t, 11.5, 560, 566, 'Sony · Bose: low, steady noise');
  if (t >= E.checkB) { check(t, E.checkB, 900, 1150, 50); text('mostly cancelled', 880, 1360, { font: `600 28px ${MONO}`, color: C.text, align: 'right', alpha: cutIn(t, E.checkB + 0.2) }); }
}
function L5(t) { // voice / sudden sound: gets through
  const c = chart(t, E.playC, { ...KIND.voice, sumAt: E.playC });
  tag(t, 15.0, 560, 566, 'Sony · Bose: voices, sudden');
  ring(t, E.ringC1, c.xAt(0.28), CH.rows[2].y, 80, 92, 4); ring(t, E.ringC2, c.xAt(0.82), CH.rows[2].y - 40, 50, 92, 4);
  if (t >= E.ringC2 + 0.3) text('gets through', c.xAt(0.62), CH.rows[2].y + 128, { font: `600 28px ${MONO}`, color: C.acc, align: 'center', alpha: cutIn(t, E.ringC2 + 0.3) });
}
function L6(t) { // passive: the cushion blocks sound physically
  tag(t, 18.5, 104, 566, 'cutaway · cushion seal · schematic');
  const A = cutaway(t, 560, 1060, 1.12, { micOut: 0, micIn: 0, chip: 0, driver: 0, cushionHi: t >= E.ringCushion });
  // sound arriving at the cushion: large outside; only a small remainder reaches the inside (passive; ANC off in this view)
  const r = prog(t, E.waveP, E.waveP + 0.7, (u) => u);
  waveLine(96, lerp(96, A.cushionBot[0] - 30, r), 1440, 30, 46, t * 7, C.noise, 4);
  text('outside', 104, 1392, { font: `600 26px ${MONO}`, color: C.noise, alpha: cutIn(t, E.waveP) });
  if (t >= E.waveP + 0.7) { waveLine(A.driver[0] + 14, A.ear[0] - 10, 1200, 9, 40, t * 7, C.noise, 3, 0.95, prog(t, E.waveP + 0.7, E.waveP + 1.1, (u) => u));
    text('inside', A.driver[0] + 14, 1160, { font: `600 26px ${MONO}`, color: C.noise, alpha: cutIn(t, E.waveP + 0.7) }); }
  ring(t, E.ringCushion, A.cushionBot[0], A.cushionBot[1] - 8, 120, 110, 4); ring(t, E.ringCushion + 0.12, A.cushionTop[0], A.cushionTop[1] + 8, 120, 110, 4);
  if (t >= E.passiveTag) { text('passive', 104, 1546, { font: `600 30px ${MONO}`, color: C.on, alpha: cutIn(t, E.passiveTag) });
    text('ANC off in this view', 984, 1546, { font: `400 22px ${MONO}`, color: C.sec, align: 'right', alpha: cutIn(t, E.passiveTag) }); }
}
function L7(t) { // board: two mechanisms
  text('ACTIVE', 104, 604, { font: `600 30px ${MONO}`, color: C.text, alpha: cutIn(t, E.colA) }); text('PASSIVE', 568, 604, { font: `600 30px ${MONO}`, color: C.text, alpha: cutIn(t, E.colB) });
  g.save(); g.strokeStyle = C.hair; g.lineWidth = 2; g.beginPath(); g.moveTo(96, 622); g.lineTo(520, 622); g.moveTo(560, 622); g.lineTo(984, 622); g.stroke(); g.restore();
  const item = (t0, x, y, lines, src, known) => { const a = cutIn(t, t0); if (a <= 0) return; g.save(); g.globalAlpha = a; rrect(x, y, 424, 168, 12);
    g.fillStyle = known ? 'rgba(254,64,146,0.07)' : 'rgba(58,63,110,0.18)'; g.fill(); g.strokeStyle = known ? C.hair : C.tick; g.lineWidth = 2; if (!known) g.setLineDash([10, 8]); g.stroke(); g.restore();
    if (known) check(t, t0, x + 20, y + 22, 40); else { g.save(); g.globalAlpha = a; g.strokeStyle = C.tick; g.setLineDash([6, 5]); g.lineWidth = 2; rrect(x + 20, y + 22, 40, 40, 8); g.stroke(); g.restore(); }
    lines.forEach((ln, i) => text(ln, x + 78, y + 54 + i * 40, { font: `600 32px Inter`, color: C.text, alpha: a })); text(src, x + 78, y + 146, { font: `400 21px ${MONO}`, color: C.sec, alpha: a, kind: 'tag' }); flashBox(t, t0, x, y, 424, 168); };
  item(E.colA, 96, 648, ['Mics + anti-noise', 'cancel part of it'], 'Apple · Sony · Bose', true);
  item(E.colA + 0.3, 96, 840, ['Best on steady,', 'low rumble'], 'Sony · Bose', true);
  item(E.itemA3, 96, 1032, ['Voices, sudden', 'sounds: harder'], 'Sony · Bose', false);
  item(E.colB, 560, 648, ['Cushions, padding', 'and fit'], 'Bose', true);
  item(E.colB + 0.3, 560, 840, ['Block sound', 'physically'], 'Bose', true);
  // the two mechanisms join into the quiet you hear
  leader(t, E.brace, [[308, 1230], [308, 1290], [772, 1290], [772, 1230]], 0.5, C.acc, null, 4);
  leader(t, E.brace + 0.35, [[540, 1290], [540, 1350]], 0.2, C.acc, null, 4);
  if (t >= E.brace + 0.5) text('QUIET', 540, 1420, { font: `600 54px ${MONO}`, color: C.text, align: 'center', alpha: cutIn(t, E.brace + 0.5) });
}
function L8(t) { // fit: a leak at the cushion lets noise in; a snug fit closes it
  tag(t, 26.0, 104, 566, 'fit · seal · schematic');
  const g0 = 34 * (1 - prog(t, E.seal, E.seal + 0.45));
  const A = cutaway(t, 560, 1060, 1.12, { micOut: 1, micIn: 1, chip: 1, driver: 1, cushionHi: t >= E.seal + 0.45, gap: g0 });
  if (g0 > 2) { const gx = A.gapPt[0] - g0 * 0.56; waveV(gx, 1500, 1215, 14 * g0 / 34, 40, t * 7, C.noise, 3); ring(t, E.leak + 0.1, gx, 1330, 46, 110, 4);
    text('leak', gx - 70, 1520, { font: `600 28px ${MONO}`, color: C.acc, align: 'center', alpha: cutIn(t, E.leak + 0.4) * (g0 / 34) }); }
  if (t >= E.fitChecks) { check(t, E.fitChecks, 104, 1440, 44); text('active', 160, 1474, { font: `600 28px ${MONO}`, color: C.text, alpha: cutIn(t, E.fitChecks) });
    check(t, E.fitChecks + 0.12, 330, 1440, 44); text('passive', 386, 1474, { font: `600 28px ${MONO}`, color: C.text, alpha: cutIn(t, E.fitChecks + 0.12) }); }
}
function L9(t) { // evidence map + signature
  const A = cutaway(t, 540, 1100, 0.7, { micOut: 1, micIn: 1, chip: 1, driver: 1, cushionHi: 1 });
  const srcs = [['Apple Support · 2026-09-14', 104, 640], ['Sony Help Guide · WF-SP800N', 104, 760], ['Bose · 2026-04-27', 640, 640]];
  srcs.forEach(([s, x, y], i) => { tag(t, E.map + i * 0.12, x, y, s, C.text); leader(t, E.map + 0.15 + i * 0.12, [[x + 120, y + 12], [540, 880]], 0.5, C.acc, [8, 8], 2.5); });
  const a = cutIn(t, E.map + 0.6); g.save(); g.globalAlpha = a; g.drawImage(icon, 330, 1424, 64, 64);
  text('Media Diet', 412, 1468, { font: `700 38px ${SANS}`, color: C.text }); text('tech, explained', 660, 1468, { font: `400 24px ${MONO}`, color: C.sec }); g.restore();
}
const LAYOUT_FN = { L1, L2, L3, L4, L5, L6, L7, L8, L9 };

function render(f) {
  const t = f / FPS; TEXTLOG = []; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  bench();
  const L = TL.layouts.find((l) => t >= l.in && t < l.out) || TL.layouts[TL.layouts.length - 1];
  g.save(); push(t, L); LAYOUT_FN[L.id](t); g.restore();
  for (const l of TL.layouts) if (l.in > 0 && t >= l.in && t < l.in + 0.1) { g.save(); g.globalAlpha = 0.22 * (1 - (t - l.in) / 0.1); g.fillStyle = '#fff'; rrect(64, 512, 952, 1080, 18); g.fill(); g.restore(); }
  g.setTransform(1, 0, 0, 1, 0, 0); captions(t); return t;
}
window.render = render; window.TEXTS = () => TEXTLOG; window.__ready = true;
