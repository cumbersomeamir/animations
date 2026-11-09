// Aarambh english-10 30 s #01 — Archive Light Table (English): Josephine Cochran and her 1886 hand-operated dish-washing machine.
// Six pages on the light table changed by page turns, a slide swap, a hard cut and a CTA slide-in (accepted recipe).
// Archival objects: a public-domain 19th-century portrait (Wikimedia Commons, PD-US-expired / PD-old-70; the same photo is on the USPTO's
// "I'll do it myself" story page) and real drawings of U.S. Patent 355,139 (USPTO full-image PDF): sheet 1 (Fig. I), racks Figs. IX, XI, XIII.
// The plate/brush hook, jets-vs-scrubbing cards, the working-machine demo and the lesson cards are original illustrations ("ILLUSTRATION").
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(`${FS}/fraunces/files/fraunces-latin-800-normal.woff2`, 'Fraunces');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-700-normal.woff2`, 'InterB');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-800-normal.woff2`, 'InterX');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf', 'Mono');

const W = 1080, H = 1920, FPS = 30, N = 900;
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', yarnDark: '#B9A887', tape: '#0A5A49', glass: '#CFE3E8', night: '#2E4650', snow: '#FFFFFF' };
const RED = '#B5532F';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], u)); }
  return keys[keys.length - 1][1];
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings (one ASR pass on placed narration) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json)
  [0, 3, ['Hand-washing was chipping']],
  [4, 7, ["Josephine Cochran's", 'heirloom china.']],
  [8, 12, ['Her 1886 patent', 'cleaned dishes']],
  [13, 18, ['with water pressure,', 'instead of scrubbing.']],
  [19, 22, ['Wire racks held plates,']],
  [23, 30, ['glasses and knives in place', 'inside a crate.']],
  [31, 36, ['A hand lever pumped', 'soapy jets']],
  [37, 41, ['while the crate', 'slowly turned;']],
  [42, 45, ['then hot water rinsed,']],
  [46, 53, ['and the dishes dried', 'from their own heat.']],
  [54, 57, ['Lesson: notice', 'everyday friction;']],
  [58, 62, ['it can inspire', 'an invention.']],
  [63, 68, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 8: SENT[1].start, 19: SENT[2].start, 31: SENT[3].start, 54: SENT[4].start, 63: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(20) - 0.2, SENT[3].start - 0.26], // plate rack -> glass-rack springs -> knife clamp bars (real patent figures)
  cut: SENT[3].start - 0.06, // hard cut on "A hand lever"
  turn2: [SENT[4].start - 0.35, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const PUMP = [ws(32) - 0.1, ws(49)]; // lever strokes: "hand" .. "dried"
const SWITCH = ws(42) - 0.05; // soap-suds pump -> clear hot-water pump ("Then")
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['por', 'josephine-cochran-portrait-pd.jpg'], ['sh1', 'us355139-sheet1-fig1-lever.png'], ['f11', 'us355139-fig11-plate-rack.png'], ['f13', 'us355139-fig13-glass-rack.png'], ['f9', 'us355139-fig9-knife-rack.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), diffuser = noiseTile(256, 3, 20), paperTex = noiseTile(256, 21, 14);
const tableCache = createCanvas(W + 800, H + 800);
{
  const c = tableCache.getContext('2d'); c.translate(400, 400);
  c.fillStyle = C.desk; c.fillRect(-400, -400, W + 800, H + 800);
  rr(c, 30, 250, W - 60, H - 330, 26); c.fillStyle = C.green; c.fill();
  rr(c, 52, 272, W - 104, H - 374, 14);
  const g = c.createRadialGradient(540, 1050, 120, 540, 1050, 1000); g.addColorStop(0, '#FFFFFB'); g.addColorStop(1, '#E2EADD');
  c.save(); c.fillStyle = g; c.fill(); c.clip();
  c.globalAlpha = 0.06; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(diffuser, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(5,71,58,0.08)'; c.lineWidth = 1.5;
  for (let x = 92; x < W - 52; x += 64) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, H - 102); c.stroke(); }
  for (let y = 304; y < H - 102; y += 64) { c.beginPath(); c.moveTo(52, y); c.lineTo(W - 52, y); c.stroke(); }
  c.restore();
}

// ---------- pages (900 x 1000 local), drawn per frame onto offscreen canvases ----------
const PW = 900, PH = 1000, PX = 90, PY = 512;
const paperBG = (() => {
  const cv = createCanvas(PW, PH), c = cv.getContext('2d');
  c.fillStyle = C.paper; c.fillRect(0, 0, PW, PH);
  c.globalAlpha = 0.18; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, PW, PH);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  const g = c.createRadialGradient(PW / 2, PH / 2, PW * 0.3, PW / 2, PH / 2, PW * 0.78); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.16)');
  c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = 'rgba(5,71,58,0.3)'; c.lineWidth = 2; c.strokeRect(16, 16, PW - 32, PH - 32);
  return cv;
})();
const pageCv = {}; for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']) pageCv[id] = createCanvas(PW, PH);
function head(c, kicker, title) {
  c.textAlign = 'left'; c.fillStyle = C.goldDeep; c.font = '700 26px Mono'; c.fillText(kicker, 48, 70);
  if (title) { c.fillStyle = C.ink; c.font = '800 46px Fraunces'; c.fillText(title, 48, 124); }
}
function foot(c, text) { c.textAlign = 'left'; c.font = '700 21px Mono'; c.fillStyle = 'rgba(18,59,49,0.72)'; c.fillText(text, 48, PH - 34); }
function pill(c, text, x, y, a = 1, size = 30) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 32; c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, x - w / 2, y - size * 0.85, w, size * 1.7, 12); c.fill(); c.fillStyle = C.cream; c.textAlign = 'center'; c.fillText(text, x, y + size * 0.34); c.restore(); }
function stamp(c, lines, x, y, a, rot = -0.08, col = C.goldDeep) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  c.font = '800 34px Mono'; const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 34px Mono' : '700 28px Mono'; return c.measureText(l).width; })) + 40, h = 26 + lines.length * 46;
  c.strokeStyle = col; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  c.fillStyle = col; c.textAlign = 'center'; lines.forEach((l, i) => { c.font = i === 0 ? '800 34px Mono' : '700 28px Mono'; c.fillText(l, 0, -h / 2 + 52 + i * 44); });
  c.restore();
}
function note(c, text, x, y, size = 24, col = 'rgba(18,59,49,0.78)', align = 'left', font = 'InterB') { c.textAlign = align; c.font = `${font === 'InterX' ? 800 : 700} ${size}px ${font}`; c.fillStyle = col; c.fillText(text, x, y); }
// archival print: white border + soft shadow; returns drawn rect
function print(c, img, x, y, w, rot = 0, credit = null, align = 'left') {
  const h = w * img.height / img.width;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24 + (credit ? 30 : 0)); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (credit) { c.font = '700 18px Mono'; c.fillStyle = 'rgba(18,59,49,0.8)'; c.textAlign = align; c.fillText(credit, align === 'right' ? w / 2 : -w / 2, h / 2 + 30); }
  c.restore(); return { x, y, w, h };
}
const UL = { name: [0.34, 0.585, 0.06], date: [0.55, 0.93, 0.128] }; // gold underlines on the sheet-1 header (fractions of the print)

// ---------- illustration primitives (original drawings, labelled "ILLUSTRATION") ----------
const BLUE = '#2F5D8A', STEEL = '#6F7F7B', WOOD = '#8A6A4A';
function plateDraw(c, x, y, r) { // heirloom-style china plate, face on
  c.save(); c.shadowColor = 'rgba(2,44,36,0.22)'; c.shadowBlur = 14; c.shadowOffsetY = 5;
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore();
  c.save(); c.strokeStyle = 'rgba(18,59,49,0.25)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke();
  c.strokeStyle = BLUE; c.lineWidth = r * 0.06; c.beginPath(); c.arc(x, y, r * 0.9, 0, 6.283); c.stroke();
  c.lineWidth = r * 0.02; c.beginPath(); c.arc(x, y, r * 0.8, 0, 6.283); c.stroke(); c.beginPath(); c.arc(x, y, r * 0.55, 0, 6.283); c.stroke();
  c.fillStyle = BLUE; for (let k = 0; k < 6; k++) { const a = k * 1.047; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.12, r * 0.05, a, 0, 6.283); c.fill(); }
  c.beginPath(); c.arc(x, y, r * 0.08, 0, 6.283); c.fill();
  for (let k = 0; k < 16; k++) { const a = k * 0.3927; c.beginPath(); c.arc(x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68, r * 0.025, 0, 6.283); c.fill(); }
  c.restore();
}
function chipPath(c, x, y, r, a0, a1) { // jagged wedge at the rim
  const am = (a0 + a1) / 2;
  c.beginPath(); c.moveTo(x + Math.cos(a0) * (r + 3), y + Math.sin(a0) * (r + 3));
  c.lineTo(x + Math.cos(a0 + 0.04) * (r - 18), y + Math.sin(a0 + 0.04) * (r - 18));
  c.lineTo(x + Math.cos(am - 0.05) * (r - 30), y + Math.sin(am - 0.05) * (r - 30));
  c.lineTo(x + Math.cos(am + 0.06) * (r - 22), y + Math.sin(am + 0.06) * (r - 22));
  c.lineTo(x + Math.cos(a1 - 0.03) * (r - 12), y + Math.sin(a1 - 0.03) * (r - 12));
  c.lineTo(x + Math.cos(a1) * (r + 3), y + Math.sin(a1) * (r + 3));
  c.arc(x, y, r + 3, a1, a0, true); c.closePath();
}
function crack(c, x, y, r, a, g) { if (g <= 0) return; const pts = [[r - 26, 0], [r - 48, 0.05], [r - 70, -0.03], [r - 92, 0.06], [r - 112, 0.0]];
  c.save(); c.strokeStyle = 'rgba(40,40,40,0.75)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26));
  const n = Math.max(1, Math.ceil(g * (pts.length - 1)));
  for (let i = 1; i <= n; i++) { const [rr_, da] = pts[i]; c.lineTo(x + Math.cos(a + da) * rr_, y + Math.sin(a + da) * rr_); } c.stroke(); c.restore(); }
function brush(c, x, y, ang, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(ang);
  c.fillStyle = '#A0784F'; rr(c, -90, -22, 180, 44, 12); c.fill(); c.fillStyle = '#7B5A3A'; rr(c, 60, -10, 120, 20, 10); c.fill();
  c.strokeStyle = '#E8D9B5'; c.lineWidth = 4; for (let k = -80; k <= 80; k += 11) { c.beginPath(); c.moveTo(k, 22); c.lineTo(k + 2, 44); c.stroke(); } c.restore(); }
function suds(c, x, y, t, a, n = 14, spread = 120) { if (a <= 0) return; c.save(); for (let k = 0; k < n; k++) { const ph = (t * 0.6 + rnd(k, 3)) % 1, bx = x + (rnd(k, 1) - 0.5) * spread * 2, by = y + (rnd(k, 2) - 0.3) * spread - ph * 40;
  c.globalAlpha = a * (1 - ph) * 0.9; c.strokeStyle = 'rgba(120,170,190,0.9)'; c.fillStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; c.beginPath(); c.arc(bx, by, 6 + rnd(k, 4) * 10, 0, 6.283); c.fill(); c.stroke(); } c.restore(); }
function check(c, x, y, s, a, col = '#2E7D4F') { if (a <= 0) return; c.save(); c.strokeStyle = col; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - s, y); const u = clamp(a * 2), v = clamp(a * 2 - 1);
  c.lineTo(x - s + s * 0.8 * u, y + s * 0.8 * u); if (v > 0) c.lineTo(x - s * 0.2 + s * 1.4 * v, y + s * 0.6 - s * 1.6 * v); c.stroke(); c.restore(); }
function xmark(c, x, y, s, a) { if (a <= 0) return; c.save(); c.strokeStyle = RED; c.lineWidth = 10; c.lineCap = 'round'; const u = clamp(a * 2), v = clamp(a * 2 - 1);
  c.beginPath(); c.moveTo(x - s, y - s); c.lineTo(x - s + 2 * s * u, y - s + 2 * s * u); c.stroke(); if (v > 0) { c.beginPath(); c.moveTo(x + s, y - s); c.lineTo(x + s - 2 * s * v, y - s + 2 * s * v); c.stroke(); } c.restore(); }
function jets(c, x0, x1, yPipe, yTop, t, s, rinse) { if (s <= 0) return; c.save(); c.lineCap = 'round';
  for (let x = x0; x <= x1; x += 26) for (let j = 0; j < 4; j++) { const ph = (t * 2.4 + x * 0.013 + j / 4) % 1, y = yPipe - 6 - ph * (yPipe - yTop);
    c.globalAlpha = s * (1 - ph * 0.6); c.strokeStyle = rinse ? 'rgba(70,150,190,0.95)' : 'rgba(255,255,255,0.95)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + Math.sin(ph * 6 + x) * 3, y); c.lineTo(x + Math.sin(ph * 6 + x) * 3, y - 12); c.stroke();
    if (!rinse) { c.strokeStyle = 'rgba(110,160,180,0.9)'; c.lineWidth = 1.5; c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.arc(x + 9, y - 4, 4, 0, 6.283); c.fill(); c.stroke(); } }
  c.restore(); }
function steam(c, x0, x1, yBase, t, a, n = 5, h = 90) { if (a <= 0) return; c.save(); c.lineCap = 'round'; c.lineWidth = 6;
  for (let k = 0; k < n; k++) { const ph = (t * 0.45 + k / n) % 1, x = lerp(x0, x1, (k + 0.5) / n); c.globalAlpha = a * Math.sin(Math.PI * ph) * 0.55; c.strokeStyle = 'rgba(150,170,175,1)';
    c.beginPath(); for (let i = 0; i <= 12; i++) { const yy = yBase - ph * h - i * 5; c.lineTo(x + Math.sin(i * 0.7 + t * 3 + k) * 8, yy); } c.stroke(); } c.restore(); }
function cardBox(c, x, y, w, h, a, k1, k2) { c.save(); c.globalAlpha = 0.35 + 0.65 * a; c.fillStyle = 'rgba(2,34,28,0.06)'; rr(c, x, y, w, h, 16); c.fill();
  c.strokeStyle = a > 0.5 ? C.goldDeep : 'rgba(18,59,49,0.2)'; c.lineWidth = 3; c.stroke(); note(c, k1, x + 20, y + 40, 22, C.goldDeep, 'left', 'Mono'); note(c, k2, x + 20, y + 70, 22, C.ink, 'left', 'InterX'); c.restore(); }

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'SHELBYVILLE, ILLINOIS · 1880s', null);
  note(c, 'ILLUSTRATION', 852, 72, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  const pa = pr(t, 0.02, 0.5, eout);
  c.save(); c.globalAlpha = pa; c.translate(0, (1 - pa) * 24); print(c, IMG.por, 48, 100, 352, -0.02, 'public domain photo'); c.restore();
  // hook: an heirloom plate is scrubbed by hand from frame 0; a crack runs and a chip breaks off on "chipping"
  const X = 662, Y = 330, R = 172, A0 = -0.98, A1 = -0.62, tc = ws(3) - 0.05;
  plateDraw(c, X, Y, R);
  crack(c, X, Y, R, (A0 + A1) / 2, pr(t, 0.3, tc, (u) => u));
  if (t >= tc) {
    c.save(); c.fillStyle = C.paper; chipPath(c, X, Y, R, A0, A1); c.fill(); c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 2; c.stroke(); c.restore();
    const u = t - tc; if (u < 1.6) { const am = (A0 + A1) / 2; c.save(); c.globalAlpha = clamp(1.6 - u); c.translate(Math.cos(am) * (60 + 180 * u), Math.sin(am) * (60 + 120 * u) + 260 * u * u); c.translate(X, Y); c.rotate(u * 5); c.translate(-X, -Y);
      c.fillStyle = '#FFFFFF'; chipPath(c, X, Y, R, A0, A1); c.fill(); c.strokeStyle = BLUE; c.lineWidth = 3; c.stroke(); c.restore(); }
  }
  const sc = 1 - pr(t, tc + 0.15, tc + 0.7), f = 2.2;
  suds(c, X - 10, Y + 30, t, 0.3 + 0.7 * sc, 12, 110);
  brush(c, X - 30 + Math.sin(t * 2 * Math.PI * f) * 70 * sc - (1 - sc) * 60, Y + 80 + Math.cos(t * 2 * Math.PI * f) * 10 * sc + (1 - sc) * 120, -0.3, sc);
  stamp(c, ['CHIPPED'], 790, 500, pr(t, tc + 0.05, tc + 0.4, eout), -0.08, RED);
  pill(c, 'heirloom china', 560, 566, pr(t, ws(6) - 0.15, ws(6) + 0.2, eout), 26);
  const pl = pr(t, ws(4) - 0.25, ws(4) + 0.25, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate(0, (1 - pl) * 20); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 48, 640, 804, 120, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 48px Fraunces'; c.fillText('Josephine Cochran', 76, 698); c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('inventor · Shelbyville, Illinois · 1839–1913', 76, 740); c.restore();
    note(c, 'also spelled Cochrane; the patent reads "Josephine G. Cochran"', 48, 800, 20, 'rgba(18,59,49,0.75)', 'left', 'Mono'); }
  foot(c, 'Sources: USPTO; U.S. Patent 355,139');
}
function underline(c, r, fx0, fx1, fy, a) { if (a <= 0) return; c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; const y = r.y + r.h * fy, x0 = r.x + r.w * fx0; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (r.w * (fx1 - fx0)) * a, y); c.stroke(); c.restore(); }
function drawP2(c, t) {
  head(c, 'THE 1886 PATENT', null);
  const r = print(c, IMG.sh1, 44, 96, 436, -0.008, 'U.S. Patent 355,139, sheet 1 (USPTO)');
  underline(c, r, UL.name[0], UL.name[1], UL.name[2], pr(t, ws(8) - 0.15, ws(8) + 0.3));
  underline(c, r, UL.date[0], UL.date[1], UL.date[2], pr(t, ws(9) - 0.1, ws(9) + 0.45));
  // her machine: water pressure (jets) — earlier machines: scrubbers
  const aj = pr(t, ws(14) - 0.25, ws(14) + 0.3, eout), ax = pr(t, ws(16) - 0.05, ws(18) + 0.1, (u) => u);
  cardBox(c, 500, 106, 356, 290, aj, 'HERS', 'water pressure');
  plateDraw(c, 678, 262, 58);
  jets(c, 612, 744, 360, 300, t, aj, false);
  c.save(); c.strokeStyle = STEEL; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(606, 366); c.lineTo(750, 366); c.stroke(); c.restore();
  check(c, 806, 150, 22, pr(t, ws(15) - 0.1, ws(15) + 0.3));
  cardBox(c, 500, 420, 356, 250, 1 - 0.6 * ax, 'EARLIER MACHINES', 'scrubbers');
  plateDraw(c, 678, 560, 52);
  brush(c, 678 + Math.sin(t * 2 * Math.PI * 1.6) * 30 * (1 - ax), 582, -0.15, 0.85);
  xmark(c, 678, 560, 62, ax);
  stamp(c, ['PATENT 355,139', 'DEC. 28, 1886'], 680, 772, pr(t, ws(10) - 0.1, ws(10) + 0.3, eout), -0.05);
  note(c, 'application filed Dec. 31, 1885', 680, 868, 20, 'rgba(18,59,49,0.75)', 'center');
  foot(c, 'Sources: USPTO; U.S. Patent 355,139');
}
const P3R = { f11: [48, 100, 500, -0.015], f13: [352, 430, 500, 0.012], f9: [48, 752, 370, -0.01] };
const rectOf = (k) => { const [x, y, w] = P3R[k]; return { x, y, w, h: w * IMG[k].height / IMG[k].width }; };
function drawP3(c, t) {
  head(c, 'THE RACKS · PATENT 355,139', null);
  print(c, IMG.f11, ...P3R.f11);
  const a13 = pr(t, ws(23) - 0.3, ws(23) + 0.05, eout), a9 = pr(t, ws(25) - 0.3, ws(25) + 0.05, eout);
  if (a13 > 0) { c.save(); c.globalAlpha = a13; c.translate(0, (1 - a13) * -30); print(c, IMG.f13, ...P3R.f13); c.restore(); }
  if (a9 > 0) { c.save(); c.globalAlpha = a9; c.translate(0, (1 - a9) * -30); print(c, IMG.f9, ...P3R.f9); c.restore(); }
  pill(c, 'wires hold plates', 722, 250, pr(t, ws(22) - 0.2, ws(22) + 0.2, eout), 24);
  pill(c, 'springs grip glasses', 190, 600, pr(t, ws(23) - 0.1, ws(23) + 0.3, eout), 24);
  pill(c, 'clamp bars hold knives', 665, 800, pr(t, ws(25) - 0.1, ws(25) + 0.3, eout), 24);
  pill(c, 'racks go in the crate', 665, 885, pr(t, ws(30) - 0.25, ws(30) + 0.15, eout), 24);
  foot(c, 'Source: U.S. Patent 355,139, Figs. IX, XI, XIII');
}
function drawP4(c, t) {
  head(c, 'HOW IT WORKED', 'Lever, jets, turning crate');
  note(c, 'ILLUSTRATION · after patent Figs. I–II', 48, 176, 18, 'rgba(18,59,49,0.7)', 'left', 'Mono');
  const pumpA = Math.min(pr(t, PUMP[0], PUMP[0] + 0.3), 1 - pr(t, PUMP[1] - 0.1, PUMP[1] + 0.4));
  const ph = 2 * Math.PI * 1.3 * Math.max(0, t - PUMP[0]), stroke = Math.sin(ph) * pumpA;
  const rinse = t >= SWITCH, sw = pr(t, SWITCH - 0.1, SWITCH + 0.2);
  const ang = 0.62 * (clamp(t, PUMP[0], PUMP[1] + 0.2) - PUMP[0]);
  // cabinet (side section)
  c.save(); c.fillStyle = '#F1E6D3'; c.strokeStyle = WOOD; c.lineWidth = 6; rr(c, 100, 250, 620, 560, 14); c.fill(); c.stroke(); c.restore();
  // tanks: soap-suds (left) and clear hot water (right, heater below)
  const tank = (x, w, col, active, hot) => { c.save(); c.fillStyle = col; rr(c, x, 736, w, 60, 8); c.fill(); c.strokeStyle = active ? C.goldDeep : 'rgba(18,59,49,0.3)'; c.lineWidth = active ? 4 : 2; c.stroke(); c.restore(); };
  tank(124, 282, '#D6E8EE', !rinse, false); tank(414, 282, '#BFDDE9', rinse, true);
  suds(c, 250, 752, t, 0.8, 6, 100);
  steam(c, 440, 680, 736, t, 0.5, 4, 40);
  note(c, 'soap-suds', 250, 774, 20, 'rgba(18,59,49,0.85)', 'center', 'Mono'); note(c, 'hot water', 555, 774, 20, 'rgba(18,59,49,0.85)', 'center', 'Mono');
  for (let k = 0; k < 5; k++) { const fx = 495 + k * 30, fl = 14 + Math.sin(t * 13 + k * 2) * 5; c.save(); c.fillStyle = k % 2 ? C.gold : '#E9893A'; c.beginPath(); c.moveTo(fx - 8, 836); c.quadraticCurveTo(fx, 836 - fl * 2.2, fx + 8, 836); c.closePath(); c.fill(); c.restore(); }
  note(c, 'heater', 645, 834, 16, 'rgba(18,59,49,0.7)', 'left', 'Mono');
  // crate with dishes in racks
  const CX = 340, CY = 455, CR = 150;
  c.save(); c.translate(CX, CY); c.fillStyle = 'rgba(207,227,232,0.45)'; c.beginPath(); c.arc(0, 0, CR, 0, 6.283); c.fill();
  c.rotate(ang); c.strokeStyle = STEEL; c.lineWidth = 3; for (let k = 0; k < 8; k++) { const a = k * 0.785; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * CR, Math.sin(a) * CR); c.stroke(); }
  c.lineWidth = 2; for (const rr_ of [60, 124]) { c.beginPath(); c.arc(0, 0, rr_, 0, 6.283); c.stroke(); }
  for (let k = 0; k < 6; k++) { const a = k * 1.047 + 0.39; plateDraw(c, Math.cos(a) * 92, Math.sin(a) * 92, 32); }
  c.fillStyle = BLUE; c.beginPath(); c.arc(Math.cos(0.39) * 92, Math.sin(0.39) * 92, 7, 0, 6.283); c.fill();
  c.restore();
  c.save(); c.strokeStyle = STEEL; c.lineWidth = 7; c.beginPath(); c.arc(CX, CY, CR, 0, 6.283); c.stroke(); c.fillStyle = STEEL; c.beginPath(); c.arc(CX, CY, 12, 0, 6.283); c.fill(); c.restore();
  note(c, 'crate', CX - CR - 6, CY - CR + 6, 18, 'rgba(18,59,49,0.8)', 'left', 'Mono');
  const ra = pr(t, ws(39) - 0.25, ws(39) + 0.2, eout) * (1 - pr(t, PUMP[1] + 0.2, PUMP[1] + 0.6));
  if (ra > 0) { c.save(); c.globalAlpha = ra; c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; const a0 = -2.6 + (t * 0.8) % 0.4; c.beginPath(); c.arc(CX, CY, CR + 22, a0, a0 + 1.5); c.stroke();
    const ae = a0 + 1.5, hx = CX + Math.cos(ae) * (CR + 22), hy = CY + Math.sin(ae) * (CR + 22); c.fillStyle = C.gold; c.beginPath(); c.moveTo(hx + Math.cos(ae + 1.57) * 18, hy + Math.sin(ae + 1.57) * 18); c.lineTo(hx + Math.cos(ae) * 13, hy + Math.sin(ae) * 13); c.lineTo(hx - Math.cos(ae) * 13, hy - Math.sin(ae) * 13); c.closePath(); c.fill(); c.restore(); }
  // jet pipe below the crate and its jets (soap-suds, then clear hot rinse)
  const js = pumpA * (0.55 + 0.45 * Math.max(0, Math.sin(ph)));
  jets(c, 232, 452, 646, 560, t, js, rinse);
  c.save(); c.strokeStyle = STEEL; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(220, 652); c.lineTo(574, 652); c.stroke();
  c.lineWidth = 8; c.beginPath(); c.moveTo(590, 640); c.lineTo(590, 690); c.lineTo(392, 690); c.lineTo(392, 740); c.stroke(); c.beginPath(); c.moveTo(650, 640); c.lineTo(650, 740); c.stroke(); c.beginPath(); c.moveTo(574, 652); c.lineTo(650, 652); c.stroke(); c.restore();
  note(c, 'jets', 196, 660, 18, 'rgba(18,59,49,0.8)', 'right', 'Mono');
  // two force-pumps; the hand lever works the selected one
  const beamY = 206, piv = 520, phi = -0.2 * stroke;
  const bp = (xb) => [piv + (xb - piv) * Math.cos(phi), beamY + (xb - piv) * Math.sin(phi)];
  [[590, !rinse, '#D6E8EE'], [650, rinse, '#BFDDE9']].forEach(([cx, act, col]) => {
    c.save(); c.fillStyle = col; c.strokeStyle = act ? C.goldDeep : STEEL; c.lineWidth = act ? 5 : 3; rr(c, cx - 22, 380, 44, 260, 8); c.fill(); c.stroke();
    const [ax, ay] = bp(cx), py = act ? 470 + (ay - beamY) * 4 : 470;
    c.fillStyle = '#4E5B58'; c.fillRect(cx - 18, py, 36, 16);
    c.strokeStyle = act ? C.ink : 'rgba(78,91,88,0.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx, py); c.lineTo(act ? ax : cx, act ? ay : 262); c.stroke();
    if (act) { c.fillStyle = C.gold; c.beginPath(); c.arc(ax, ay, 7, 0, 6.283); c.fill(); }
    c.restore(); });
  note(c, 'pumps', 620, 360, 18, 'rgba(18,59,49,0.8)', 'center', 'Mono');
  c.save(); c.fillStyle = WOOD; c.fillRect(piv - 8, beamY, 16, 250 - beamY); c.strokeStyle = WOOD; c.lineWidth = 14; c.lineCap = 'round';
  const [b0x, b0y] = bp(470), [b1x, b1y] = bp(800), [b2x, b2y] = bp(866); c.beginPath(); c.moveTo(b0x, b0y); c.lineTo(b1x, b1y); c.stroke();
  c.strokeStyle = '#5E3F26'; c.lineWidth = 24; c.beginPath(); c.moveTo(b1x, b1y); c.lineTo(b2x, b2y); c.stroke();
  c.fillStyle = C.ink; c.beginPath(); c.arc(piv, beamY, 9, 0, 6.283); c.fill(); c.restore();
  // selector: small lever switches the lever from the soap pump to the hot-water pump
  c.save(); c.translate(620, 300); c.rotate(lerp(-0.6, 0.6, sw)); c.strokeStyle = C.goldDeep; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -34); c.stroke(); c.restore();
  // drying: steam rises from the hot dishes once pumping stops
  steam(c, 240, 440, 330, t, pr(t, PUMP[1] - 0.3, PUMP[1] + 0.4), 5, 110);
  // one explanation pill, changing with the narration
  const msgs = [[ws(32) - 0.15, 'a hand lever works a pump'], [ws(35) - 0.15, 'soap-suds jets from below'], [ws(39) - 0.15, 'the crate turns slowly'], [SWITCH, 'switch: clear hot-water rinse'], [ws(49) - 0.15, 'dishes dry from their own heat']];
  for (let i = 0; i < msgs.length; i++) { const [a, m] = msgs[i], b = i + 1 < msgs.length ? msgs[i + 1][0] : 99; const al = Math.min(pr(t, a, a + 0.2, eout), 1 - pr(t, b - 0.12, b)); pill(c, m, 450, 900, al, 30); }
  foot(c, 'Source: U.S. Patent 355,139, specification');
}
function drawP5(c, t) {
  head(c, 'LESSON', 'From friction to invention');
  const st = [['FRICTION', 'chipped heirloom china', ws(56)], ['FIX', 'fitted racks + water jets', ws(60)], ['INVENTION', 'U.S. Patent 355,139 (1886)', ws(62)]];
  st.forEach(([k, v, w], i) => { const a = pr(t, w - 0.2, w + 0.25, eout), y = 190 + i * 150; c.save(); c.globalAlpha = 0.25 + 0.75 * a; c.fillStyle = a > 0.5 ? 'rgba(2,34,28,0.92)' : 'rgba(2,34,28,0.2)'; rr(c, 60, y, 470, 120, 16); c.fill();
    c.fillStyle = C.gold; c.font = '800 26px Mono'; c.textAlign = 'left'; c.fillText(`${i + 1}  ${k}`, 90, y + 50); c.fillStyle = C.cream; c.font = '800 30px InterX'; c.fillText(v, 90, y + 95); c.restore();
    if (i < 2 && a > 0.5) { c.save(); c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.beginPath(); c.moveTo(295, y + 124); c.lineTo(295, y + 146); c.stroke(); c.restore(); } });
  print(c, IMG.por, 590, 190, 250, 0.02, 'Josephine Cochran');
  note(c, '1893 World\'s Fair: her machine', 60, 676, 21, 'rgba(18,59,49,0.8)', 'left');
  note(c, 'won the highest award (USPTO)', 60, 704, 21, 'rgba(18,59,49,0.8)', 'left');
  pill(c, 'Your turn: which chore keeps going wrong?', 450, 800, pr(t, ws(62) + 0.05, ws(62) + 0.4, eout), 28);
  foot(c, 'Sources: USPTO; U.S. Patent 355,139');
}
function drawP6(c, t) {
  c.fillStyle = C.deep; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(22, 22, PW - 44, PH - 44);
  const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.4 + 0.6 * a; c.drawImage(icon, PW / 2 - 140, 150, 280, 280); c.restore();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.font = '800 74px Fraunces'; c.fillText('Download Aarambh', PW / 2, 560);
  c.font = '800 40px InterB'; c.fillStyle = C.gold; c.fillText('to support livelihood tools', PW / 2, 632);
  c.font = '700 26px InterB'; c.fillStyle = 'rgba(251,247,238,0.8)'; c.fillText('Fund verified livelihood tools', PW / 2, 740); c.fillText('and follow their impact.', PW / 2, 778);
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(251,247,238,0.6)'; c.fillText('Get it on Google Play', PW / 2, 880);
}
const DRAW = { p1: drawP1, p2: drawP2, p3: drawP3, p4: drawP4, p5: drawP5, p6: drawP6 };
const pages = {};
function page(id, t) { const cv = pageCv[id], c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(paperBG, 0, 0); c.save(); DRAW[id](c, t); c.restore(); return cv; }

function pageShadow(c, x, y, w, h, a = 0.3) { c.save(); c.shadowColor = `rgba(2,44,36,${a})`; c.shadowBlur = 26; c.shadowOffsetY = 9; c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.restore(); }
function drawPage(c, id, t, dx = 0, dy = 0, rot = 0, sc = 1) {
  const cv = page(id, t);
  c.save(); c.translate(PX + PW / 2 + dx, PY + PH / 2 + dy); c.rotate(rot); c.scale(sc, sc); c.translate(-PX - PW / 2, -PY - PH / 2);
  pageShadow(c, PX, PY, PW, PH); c.drawImage(cv, PX, PY); c.restore();
}
function pageTurn(c, idOld, idNew, u, t) {
  drawPage(c, idNew, t);
  const old = page(idOld, t);
  const x0 = PX, x1 = PX + PW, f = lerp(x1, x0, eio(u));
  c.save(); c.beginPath(); c.rect(x0, PY - 40, f - x0, PH + 80); c.clip(); pageShadow(c, PX, PY, PW, PH, 0.2); c.drawImage(old, PX, PY); c.restore();
  const sg = c.createLinearGradient(f, 0, f + 60, 0); sg.addColorStop(0, 'rgba(2,34,28,0.35)'); sg.addColorStop(1, 'rgba(2,34,28,0)');
  c.fillStyle = sg; c.fillRect(f, PY, Math.min(60, x1 - f), PH);
  const fw = x1 - f, fade = 1 - pr(u, 0.82, 1);
  if (fw > 1 && fade > 0) {
    const lift = Math.sin(Math.PI * u) * 26;
    c.save(); c.globalAlpha = fade; c.translate(0, -lift * 0.3);
    c.beginPath(); c.moveTo(f, PY); c.lineTo(f - fw, PY - lift); c.lineTo(f - fw, PY + PH + lift); c.lineTo(f, PY + PH); c.closePath();
    c.save(); c.clip(); const bg = c.createLinearGradient(f - fw, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(0.75, '#F8F3E6'); bg.addColorStop(1, '#D9CFB6');
    c.fillStyle = bg; c.fillRect(f - fw - 2, PY - 60, fw + 4, PH + 120); c.restore();
    c.strokeStyle = 'rgba(5,71,58,0.35)'; c.lineWidth = 2; c.stroke(); c.restore();
  }
}
function slideSwap(c, a, b, u, t) { const e = eio(u); drawPage(c, a, t, -1050 * e, 20 * e, -0.05 * e); drawPage(c, b, t, 1050 * (1 - e), -20 * (1 - e), 0.04 * (1 - e)); }
function scene(c, t) {
  if (t < T.turn1[0]) return drawPage(c, 'p1', t);
  if (t < T.turn1[1]) return pageTurn(c, 'p1', 'p2', (t - T.turn1[0]) / (T.turn1[1] - T.turn1[0]), t);
  if (t < T.swap[0]) return drawPage(c, 'p2', t);
  if (t < T.swap[1]) return slideSwap(c, 'p2', 'p3', (t - T.swap[0]) / (T.swap[1] - T.swap[0]), t);
  if (t < T.cut) return drawPage(c, 'p3', t);
  if (t < T.turn2[0]) return drawPage(c, 'p4', t);
  if (t < T.turn2[1]) return pageTurn(c, 'p4', 'p5', (t - T.turn2[0]) / (T.turn2[1] - T.turn2[0]), t);
  if (t < T.cta[0]) return drawPage(c, 'p5', t);
  if (t < T.cta[1]) return slideSwap(c, 'p5', 'p6', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p6', t);
}
// magnifier — used once: the real rack drawings, from the plate rack's support wires (Fig. XI) to the glass rack's springs (Fig. XIII)
const LENS = [['f11', 0.3, 0.5], ['f13', 0.42, 0.62]];
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut) return;
  const m = pr(t, ws(23) - 0.15, ws(23) + 0.3);
  const p = LENS.map(([k, fx, fy]) => { const r = rectOf(k); return [r.x + r.w * fx, r.y + r.h * fy]; });
  const lx = PX + lerp(p[0][0], p[1][0], m), ly = PY + lerp(p[0][1], p[1][1], m);
  const R = 100 * (1.35 - 0.35 * land), mag = 2.2;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p3', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.04]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const [cx, cy, z] = camera(t);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  ctx.drawImage(tableCache, -400, -400);
  ctx.translate(540, 1012); ctx.scale(0.94, 0.94); ctx.translate(-540, -1012);
  scene(ctx, t); loupe(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const flick = t < 0.4 ? (t < 0.08 ? 0.35 : t < 0.14 ? 1 : t < 0.2 ? 0.55 : pr(t, 0.2, 0.4)) : 1;
  const dark = 1 - flick;
  if (dark > 0.001) { ctx.fillStyle = `rgba(2,34,28,${clamp(dark * 0.8, 0, 0.8)})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.35 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate y 350–510, x within 90..990; Inter 800 54 px
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(900, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 350, bw, 160, 16); ctx.fillStyle = 'rgba(2,34,28,0.88)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 16, 506, bw - 32, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, 540, (cw.lines.length === 1 ? 450 : 418) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.8)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.2; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const strokes = []; for (let x = PUMP[0] + 0.25 / 1.3; x < PUMP[1]; x += 1 / 1.3) strokes.push(+x.toFixed(3)); // lever down-strokes
  const scrub = []; for (let x = 0.12; x < ws(3) + 0.1; x += 1 / 4.4) scrub.push(+x.toFixed(3)); // brush passes (2.2 Hz, both directions)
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, ws(23) + 0.3],
    scrub, chip: ws(3) - 0.05, plate: ws(4) - 0.25, stamp: [ws(3) + 0.05, ws(10) - 0.1], underline: [ws(8) - 0.15, ws(9) - 0.1],
    check: ws(15) - 0.1, xmark: ws(16) - 0.05, drops: [ws(23) - 0.3, ws(25) - 0.3],
    label: [ws(6) - 0.15, ws(22) - 0.2, ws(23) - 0.1, ws(25) - 0.1, ws(30) - 0.25, ws(35) - 0.15, ws(39) - 0.15, ws(49) - 0.15],
    pump: PUMP, strokes, switch: SWITCH, steam: PUMP[1] - 0.3,
    steps: [ws(56) - 0.2, ws(60) - 0.2, ws(62) - 0.2], ok: ws(62), prompt: ws(62) + 0.05, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.6,2.0,3.0,5.5,7.6,9.8,11.9,13.6,15.4,16.6,18.6,20.4,22.3,24.2,25.9,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}

