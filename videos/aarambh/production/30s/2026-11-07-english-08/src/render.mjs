// Aarambh english-08 30 s #01 — Archive Light Table (English): Samuel F. B. Morse, a former portrait painter, and his recording
// telegraph (U.S. Patent 1,647, 1840). Six pages on the light table changed by page turns, a slide swap, a hard cut and a CTA
// slide-in (accepted recipe). Archival objects: Brady studio portrait (Library of Congress, cwpbh.00853), Brady's 1857 photo of
// Morse with his recorder (Commons, PD) and real patent drawing sheets 1 and 3 (USPTO). Map/wire, tape, circuit and lesson scenes
// are original illustrations labelled "ILLUSTRATION". Original Canvas2D code (core from the english-07 renderer).
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
  [0, 6, ['In 1844, a message', 'flashed by wire']],
  [7, 10, ['between Washington', 'and Baltimore.']],
  [11, 18, ['It ran on the telegraph', 'of Samuel Morse,']],
  [19, 26, ['a former portrait painter', 'with little electrical training.']],
  [27, 32, ['His 1840 patent', 'describes a register:']],
  [33, 41, ['a magnet that presses', 'a pen onto moving paper.']],
  [42, 47, ['Short pulses of current', 'leave dots;']],
  [48, 51, ['longer ones leave lines.']],
  [52, 56, ['Lesson: combine', 'what you know']],
  [57, 63, ['with a field', 'you are new to.']],
  [64, 69, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 27: SENT[2].start, 42: SENT[3].start, 52: SENT[4].start, 64: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(32) - 0.2, SENT[3].start - 0.2], loupeMove: [ws(34) - 0.05, ws(38) + 0.1], // Fig. 4: magnet -> pen
  cut: SENT[3].start - 0.06, // hard cut on "Short"
  turn2: [SENT[4].start - 0.35, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['brady', 'samuel-morse-brady-loc-cwpbh00853.jpg'], ['recorder', 'samuel-morse-with-recorder-brady-1857.jpg'], ['sheet3', 'us1647-sheet3-register.png'], ['letters', 'us1647-sheet1-example3-letters.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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

// ---------- illustration primitives ----------
const GREEN = '#3E8E5A', COPPER = '#B87333';
// P1 pulse train (illustrative, not the 1844 tape): [start, duration]; pulses take TRAVEL s to cross the wire
const TRAVEL = 0.7, PULSES = (() => { const out = []; const pat = [1, 1, 3, 0, 1, 3, 3, 0, 1, 1, 1, 0, 3, 1, 3, 0, 1, 3, 1, 1, 0, 3, 3, 0]; let x = 0.12;
  while (x < 5.4) for (const p of pat) { if (x >= 5.4) break; if (p === 0) { x += 0.2; continue; } const d = p === 1 ? 0.11 : 0.36; out.push([+x.toFixed(3), d]); x += d + 0.12; } return out; })();
function palette(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#C9A26B'; c.beginPath(); c.ellipse(0, 0, 46, 34, -0.3, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(2,34,28,0.92)'; c.beginPath(); c.arc(-18, 12, 8, 0, 6.283); c.fill();
  for (const [dx, dy, col] of [[-6, -18, '#C0392B'], [14, -14, '#F1B444'], [26, 2, '#2E86C1'], [16, 18, '#3E8E5A']]) { c.fillStyle = col; c.beginPath(); c.arc(dx, dy, 7, 0, 6.283); c.fill(); }
  c.strokeStyle = '#6E4630'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(30, 30); c.lineTo(60, -34); c.stroke(); c.restore(); }
function coil(c, x, y, s = 1) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#7A7F80'; c.fillRect(-10, -40, 20, 80);
  c.strokeStyle = COPPER; c.lineWidth = 5; for (let k = 0; k < 7; k++) { c.beginPath(); c.ellipse(0, -30 + k * 10, 20, 5, 0, 0, 6.283); c.stroke(); }
  c.fillStyle = '#F1B444'; c.beginPath(); c.moveTo(34, -30); c.lineTo(22, 2); c.lineTo(34, 2); c.lineTo(24, 34); c.lineTo(46, -6); c.lineTo(34, -6); c.lineTo(44, -30); c.closePath(); c.fill(); c.restore(); }
function tapeMarks(c, t, penX, y, speed, x0, x1, marks, lw = 9) { // marks: [arrival, duration]; ink is laid at the pen and carried left
  c.save(); c.beginPath(); c.rect(x0, y - 24, x1 - x0, 48); c.clip(); c.strokeStyle = C.ink; c.lineWidth = lw; c.lineCap = 'round';
  for (const [a, d] of marks) { if (t < a) continue; const xs = penX - (t - a) * speed, xe = penX - Math.max(0, t - a - d) * speed; if (xe < x0 - 20) continue; c.beginPath(); c.moveTo(xs, y); c.lineTo(Math.max(xs + 1, xe), y); c.stroke(); }
  c.restore(); }

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'WASHINGTON · BALTIMORE', null);
  const mx = 60, my = 96, mw = 780, mh = 360, W_ = [180, 390], B_ = [720, 190];
  c.fillStyle = C.night; rr(c, mx, my, mw, mh, 14); c.fill();
  // the wire with poles
  c.strokeStyle = 'rgba(251,247,238,0.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(...W_); c.lineTo(...B_); c.stroke();
  for (let k = 1; k < 9; k++) { const f = k / 9, px = lerp(W_[0], B_[0], f), py = lerp(W_[1], B_[1], f); c.fillStyle = 'rgba(251,247,238,0.5)'; c.fillRect(px - 2, py, 4, 26); }
  // pulses travelling Washington -> Baltimore (illustration)
  c.save(); c.strokeStyle = C.gold; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.8)'; c.shadowBlur = 14;
  for (const [s, d] of PULSES) { const f0 = clamp((t - s) / TRAVEL), f1 = clamp((t - s - d) / TRAVEL); if (f0 <= 0 || f1 >= 1) continue;
    c.beginPath(); c.moveTo(lerp(W_[0], B_[0], f1), lerp(W_[1], B_[1], f1)); c.lineTo(lerp(W_[0], B_[0], f0), lerp(W_[1], B_[1], f0)); c.stroke(); }
  c.restore();
  for (const [p, name, dx, dy] of [[W_, 'WASHINGTON', -10, 46], [B_, 'BALTIMORE', -120, -26]]) { c.fillStyle = C.gold; c.beginPath(); c.arc(p[0], p[1], 12, 0, 6.283); c.fill(); note(c, name, p[0] + dx, p[1] + dy, 24, C.cream, 'left', 'Mono'); }
  note(c, 'ILLUSTRATION', mx + mw - 14, my + mh - 14, 18, 'rgba(251,247,238,0.7)', 'right', 'Mono');
  // paper tape at the receiving end
  const penX = 640, ty = 560, arrivals = PULSES.map(([s, d]) => [s + TRAVEL, d]);
  c.fillStyle = '#F7F0DC'; c.fillRect(80, ty - 30, 740, 60); c.strokeStyle = C.yarnDark; c.lineWidth = 2; c.strokeRect(80, ty - 30, 740, 60);
  tapeMarks(c, t, penX, ty, 170, 80, 820, arrivals);
  const down = arrivals.some(([a, d]) => t >= a && t < a + d);
  c.strokeStyle = C.ink; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(penX + 120, ty - 90); c.lineTo(penX, ty - (down ? 14 : 40)); c.stroke();
  c.fillStyle = C.goldDeep; c.beginPath(); c.arc(penX, ty - (down ? 14 : 40), 7, 0, 6.283); c.fill();
  // the first message
  const n = Math.floor(clamp((t - (ws(3) - 0.1)) / 1.5) * 22), msg = 'WHAT HATH GOD WROUGHT!'.slice(0, n);
  c.fillStyle = C.ink; c.font = '800 46px Fraunces'; c.textAlign = 'center'; c.fillText(msg, 450, 700);
  note(c, 'the first message sent on the line', 450, 744, 24, 'rgba(18,59,49,0.8)', 'center');
  stamp(c, ['MAY 24, 1844'], 450, 850, pr(t, ws(1) - 0.1, ws(1) + 0.3, eout), -0.04);
  foot(c, 'Source: NIHF inductee page');
}
function drawP2(c, t) {
  head(c, 'THE INVENTOR', null);
  print(c, IMG.brady, 56, 100, 360, -0.02, 'Brady studio · Library of Congress');
  const pl = pr(t, ws(17) - 0.25, ws(17) + 0.25, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate((1 - pl) * 20, 0); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 446, 110, 404, 150, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 36px Fraunces'; c.fillText('Samuel F. B. Morse', 466, 176); c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('1791–1872', 466, 226); c.restore(); }
  const card = (y, a, icon_, k1, k2) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate((1 - a) * 30, 0); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 446, y, 404, 150, 16); c.fill();
    icon_(515, y + 75); c.fillStyle = C.gold; c.font = '800 22px Mono'; c.textAlign = 'left'; c.fillText(k1, 585, y + 62); c.fillStyle = C.cream; c.font = '800 30px InterX'; c.fillText(k2, 585, y + 106); c.restore(); };
  card(300, pr(t, ws(21) - 0.2, ws(21) + 0.3, eout), (x, y) => palette(c, x, y, 1), 'FORMER', 'portrait painter');
  card(480, pr(t, ws(25) - 0.2, ws(25) + 0.3, eout), (x, y) => coil(c, x - 10, y, 1), 'LITTLE TRAINING', 'in electricity');
  note(c, 'icons: ILLUSTRATION', 846, 655, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  pill(c, 'painter turned inventor', 450, 800, pr(t, ws(25) - 0.1, ws(25) + 0.35, eout), 30);
  foot(c, 'Source: NIHF inductee page');
}
const SH3 = { x: 50, y: 96, w: 470 };
function drawP3(c, t) {
  head(c, 'THE 1840 PATENT', null);
  const r = print(c, IMG.sheet3, SH3.x, SH3.y, SH3.w, -0.008, 'U.S. Patent 1,647, sheet 3 (USPTO)');
  pages.p3pat = r;
  print(c, IMG.recorder, 545, 130, 305, 0.02, 'Morse with his recorder, 1857');
  stamp(c, ['PATENT 1,647', 'JUNE 20, 1840'], 697, 650, pr(t, ws(29) - 0.1, ws(29) + 0.35, eout), -0.05);
  pill(c, 'register: records the signs', 697, 790, pr(t, ws(32) - 0.2, ws(32) + 0.25, eout), 24);
  pill(c, 'Fig. 4: the magnet moves the lever; the pen meets the paper', 450, 915, pr(t, ws(38) - 0.2, ws(38) + 0.25, eout), 22);
}
const PRESSES = () => [[ws(42) - 0.02, 0.13], [ws(42) + 0.33, 0.13], [ws(47) - 0.05, 0.13], [ws(48) - 0.05, 0.55], [ws(51) - 0.1, 0.5]];
function drawP4(c, t) {
  head(c, 'HOW IT WORKED', 'Short = dot, long = line');
  print(c, IMG.letters, 50, 158, 800, -0.006, 'Patent sheet 1, Example 3: signs for letters');
  const P = PRESSES(), on = P.some(([s, d]) => t >= s && t < s + d), col = on ? C.gold : 'rgba(18,59,49,0.45)';
  // circuit (larger): key -> wire -> magnet above the lever's left end; the pen end drops onto the moving paper
  c.fillStyle = '#5E4A33'; rr(c, 60, 640, 230, 34, 8); c.fill(); // key base
  c.save(); c.translate(100, 634); c.rotate(on ? 0.14 : 0); c.fillStyle = C.ink; rr(c, 0, -20, 180, 20, 8); c.fill(); c.fillStyle = C.goldDeep; c.beginPath(); c.arc(170, -26, 16, 0, 6.283); c.fill(); c.restore();
  note(c, 'KEY', 175, 716, 26, C.ink, 'center', 'Mono');
  c.strokeStyle = col; c.lineWidth = 8; c.lineJoin = 'round'; c.beginPath(); c.moveTo(100, 640); c.lineTo(100, 400); c.lineTo(400, 400); c.lineTo(400, 436); c.stroke();
  c.fillStyle = '#7A7F80'; c.fillRect(372, 436, 56, 86); c.strokeStyle = COPPER; c.lineWidth = 6; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(400, 446 + k * 13, 36, 8, 0, 0, 6.283); c.stroke(); }
  note(c, 'MAGNET', 400, 384, 24, C.ink, 'center', 'Mono');
  const ang = on ? -0.12 : 0, piv = [540, 560];
  c.save(); c.translate(...piv); c.rotate(ang); c.fillStyle = C.ink; rr(c, -175, -11, 450, 22, 8); c.fill(); c.fillStyle = '#9AA0A0'; c.fillRect(-180, -26, 60, 16); // lever + armature
  c.fillStyle = C.goldDeep; c.beginPath(); c.moveTo(255, 11); c.lineTo(271, 11); c.lineTo(263, 56); c.closePath(); c.fill(); c.restore(); // pen
  c.fillStyle = C.ink; c.beginPath(); c.moveTo(piv[0] - 18, piv[1] + 40); c.lineTo(piv[0] + 18, piv[1] + 40); c.lineTo(piv[0], piv[1]); c.closePath(); c.fill(); // fulcrum
  const py = 668, penX = 803;
  c.fillStyle = '#F7F0DC'; c.fillRect(330, py - 32, 530, 64); c.strokeStyle = C.yarnDark; c.lineWidth = 2; c.strokeRect(330, py - 32, 530, 64);
  tapeMarks(c, t, penX, py, 150, 330, 860, P.map(([s, d]) => [s + 0.04, d]), 16);
  note(c, 'paper moves', 595, py + 66, 22, 'rgba(18,59,49,0.75)', 'center', 'Mono');
  pill(c, 'short pulse = dot', 300, 812, pr(t, ws(43) - 0.15, ws(43) + 0.25, eout), 30);
  pill(c, 'long pulse = line', 620, 880, pr(t, ws(49) - 0.15, ws(49) + 0.25, eout), 30);
  note(c, 'ILLUSTRATION · after the patent register', 48, PH - 34, 21, 'rgba(18,59,49,0.72)', 'left', 'Mono');
}
function drawP5(c, t) {
  head(c, 'LESSON', 'Combine fields');
  const a = pr(t, ws(53) - 0.2, ws(53) + 0.3, eout), b = pr(t, ws(59) - 0.2, ws(59) + 0.3, eout), d = pr(t, ws(63) - 0.25, ws(63) + 0.3, eout);
  const card = (x, y, w, a, icon_, k1, k2, fill = 'rgba(2,34,28,0.92)', ink = C.cream) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 24); c.fillStyle = fill; rr(c, x, y, w, 190, 16); c.fill();
    icon_(x + w / 2, y + 62); c.fillStyle = fill === C.gold ? C.deep : C.gold; c.font = '800 22px Mono'; c.textAlign = 'center'; c.fillText(k1, x + w / 2, y + 136); c.fillStyle = ink; c.font = '800 28px InterX'; c.fillText(k2, x + w / 2, y + 172); c.restore(); };
  card(60, 190, 340, a, (x, y) => palette(c, x, y, 0.9), 'WHAT HE KNEW', 'painting');
  if (b > 0) { c.save(); c.globalAlpha = b; c.fillStyle = C.gold; c.beginPath(); c.arc(450, 285, 30, 0, 6.283); c.fill(); c.fillStyle = C.deep; c.font = '800 44px InterX'; c.textAlign = 'center'; c.fillText('+', 450, 300); c.restore(); }
  card(500, 190, 340, b, (x, y) => coil(c, x - 10, y, 0.85), 'A NEW FIELD', 'electricity');
  card(180, 460, 540, d, (x, y) => { c.save(); c.strokeStyle = C.deep; c.lineWidth = 9; c.lineCap = 'round'; for (const [x0, x1] of [[-90, -82], [-60, -10], [16, 24], [50, 100]]) { c.beginPath(); c.moveTo(x + x0, y); c.lineTo(x + x1, y); c.stroke(); } c.restore(); }, 'NEW TOOL', 'a recording telegraph', C.gold, C.deep);
  if (d > 0) { c.save(); c.globalAlpha = d; c.fillStyle = C.deep; c.beginPath(); c.arc(700, 470, 34, 0, 6.283); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 7; c.beginPath(); c.moveTo(684, 470); c.lineTo(696, 484); c.lineTo(717, 457); c.stroke(); c.restore(); }
  print(c, IMG.brady, 690, 700, 140, 0.03, 'S. F. B. Morse');
  pill(c, 'what you know + a new field', 340, 760, d, 28);
  foot(c, 'Source: NIHF');
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
// magnifier — used once: lands on Fig. 4 of the real register sheet (magnet end), then moves to the pen over the paper
const LENS = [[0.233, 0.78], [0.58, 0.741]];
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut || !pages.p3pat) return;
  const r = pages.p3pat, m = pr(t, T.loupeMove[0], T.loupeMove[1]);
  const lx = PX + r.x + r.w * lerp(LENS[0][0], LENS[1][0], m), ly = PY + r.y + r.h * lerp(LENS[0][1], LENS[1][1], m);
  const R = 100 * (1.35 - 0.35 * land), mag = 2.4;
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
  const P = PRESSES();
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, T.loupeMove[1]],
    penDown: PULSES.map(([s]) => +(s + TRAVEL).toFixed(3)).filter((x) => x < T.turn1[0]), msg: ws(3) - 0.1, stamp: [ws(1) - 0.1, ws(29) - 0.1],
    plate: ws(17) - 0.25, cards: [ws(21) - 0.2, ws(25) - 0.2, ws(53) - 0.2, ws(59) - 0.2], label: [ws(32) - 0.2, ws(38) - 0.2, ws(43) - 0.15, ws(49) - 0.15],
    presses: P, ok: ws(63) - 0.25, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.6,1.6,3.6,5.2,7.0,9.8,11.4,13.4,15.2,16.4,17.6,19.3,21.0,22.3,23.4,25.2,26.4,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
