// Aarambh english-09 30 s #01 — Archive Light Table (English): Percy Spencer, radar magnetrons and microwave cooking.
// Six pages on the light table changed by page turns, a slide swap, a hard cut and a CTA slide-in (accepted recipe).
// Archival objects: real patent drawings (U.S. 2,408,235 magnetron; U.S. 2,495,429 cooking, USPTO) and the Smithsonian NMAH CC0
// photo of a 1956 Tappan RL-1 microwave oven. No openly licensed portrait of Spencer exists, so a typeset name plate is used
// (accepted rule in context/11). Pocket/candy, waves, egg/energy bars and lesson cards are original illustrations ("ILLUSTRATION").
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
  [0, 4, ['Radar engineer', 'Percy Spencer recalled']],
  [5, 14, ['a candy bar melting in his', 'pocket near a magnetron.']],
  [15, 18, ['Retellings change the snack;']],
  [19, 25, ['the documented record', 'is his 1945 patent.']],
  [26, 32, ['It sends magnetron', 'microwaves down a guide']],
  [33, 37, ['to food on a conveyor.']],
  [38, 43, ['His test: an egg', 'hard-boiled']],
  [44, 51, ['with 2 units of energy,', 'instead of 36.']],
  [52, 56, ['Lesson: when something', 'odd happens,']],
  [57, 61, ['test it and measure it.']],
  [62, 67, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 15: SENT[1].start, 26: SENT[2].start, 38: SENT[3].start, 52: SENT[4].start, 62: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(28) - 0.2, SENT[3].start - 0.2], // magnetron -> wave guide -> food in the real 1945 drawing
  cut: SENT[3].start - 0.06, // hard cut on "His"
  turn2: [SENT[4].start - 0.35, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['mag', 'us2408235-sheet1-magnetron.png'], ['cook', 'us2495429-drawing-cooking.png'], ['head', 'us2495429-header.png'], ['tappan', 'tappan-rl1-1956-nmah-cc0.jpg']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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
const GREEN = '#3E8E5A', CHOC = '#5A3A22';
function waves(c, x, y, t, rMax, a = 1, n = 5, lw = 7) { c.save(); c.strokeStyle = C.gold; c.lineWidth = lw; c.lineCap = 'round';
  for (let k = 0; k < n; k++) { const ph = ((t * 0.7 + k / n) % 1), r = 30 + ph * rMax; c.globalAlpha = a * Math.min(1, (1 - ph) * 1.4); c.beginPath(); c.arc(x, y, r, -0.5, 0.5); c.stroke(); } c.restore(); }
function pocket(c, x, y, melt, sc = 1) { // lab-coat pocket with a candy bar; melt 0..1 (drips run down over the pocket)
  c.save(); c.translate(x, y); c.scale(sc, sc);
  c.fillStyle = '#F4F1EA'; rr(c, -160, -230, 320, 470, 20); c.fill(); c.strokeStyle = 'rgba(18,59,49,0.25)'; c.lineWidth = 3; c.stroke();
  const sag = melt * 30;
  c.save(); c.translate(0, -60); c.fillStyle = CHOC; c.beginPath(); c.moveTo(-54, 40); c.lineTo(-50, -120 + sag * 0.4); c.quadraticCurveTo(0, -140 + sag * 1.5, 50, -120 + sag); c.lineTo(54, 40); c.closePath(); c.fill(); c.restore();
  c.fillStyle = '#ECE7DC'; rr(c, -118, -30, 236, 190, 12); c.fill(); c.strokeStyle = 'rgba(18,59,49,0.3)'; c.lineWidth = 3; c.stroke(); // pocket in front of the bar
  c.fillStyle = '#C0392B'; c.fillRect(-56, -48, 112, 40); c.fillStyle = C.cream; c.font = '800 22px Mono'; c.textAlign = 'center'; c.fillText('CANDY', 0, -20);
  for (let k = 0; k < 4; k++) { const dl = clamp(melt * 1.7 - k * 0.22) * (70 + k * 26); if (dl <= 0) continue; const dx = -42 + k * 28; // chocolate runs down the pocket front
    c.fillStyle = CHOC; c.beginPath(); c.moveTo(dx - 9, -10); c.lineTo(dx + 9, -10); c.lineTo(dx + 6, -10 + dl); c.arc(dx, -10 + dl, 8, 0, Math.PI); c.closePath(); c.fill(); }
  c.restore();
}
function eggDraw(c, x, y, cook, sc = 1) { c.save(); c.translate(x, y); c.scale(sc, sc); c.translate(-x, -y); c.fillStyle = '#FFFFFF'; c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 70, 92, 0, 0, 6.283); c.fill(); c.stroke();
  c.fillStyle = `rgba(241,180,68,${0.35 + 0.65 * cook})`; c.beginPath(); c.arc(x, y + 12, 34, 0, 6.283); c.fill(); c.restore(); }

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'RAYTHEON · 1940s', null);
  const r = print(c, IMG.mag, 48, 96, 400, -0.015, 'his U.S. Patent 2,408,235: magnetron (filed 1941)');
  // microwaves from the magnetron toward the pocket (illustration) — moving from frame 0
  const mx = r.x + r.w * 0.56, my = r.y + r.h * 0.72;
  c.save(); c.beginPath(); c.rect(0, 0, PW, PH); c.clip(); c.translate(mx, my); c.rotate(-0.35); waves(c, 0, 0, t, 330, 1, 6, 8); c.restore();
  const melt = clamp(0.1 + 0.9 * pr(t, 0.4, ws(8) + 1.2, (u) => u));
  pocket(c, 700, 360, melt, 0.92);
  note(c, 'ILLUSTRATION', 846, 650, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  const pl = pr(t, ws(2) - 0.25, ws(2) + 0.25, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate(0, (1 - pl) * 20); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 48, 690, 804, 120, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 48px Fraunces'; c.fillText('Percy L. Spencer', 76, 748); c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('radar engineer · Raytheon · 1894–1970', 76, 790); c.restore(); }
  stamp(c, ['HIS OWN ACCOUNT'], 450, 885, pr(t, ws(4) - 0.1, ws(4) + 0.3, eout), -0.04);
  foot(c, 'Sources: NIHF; Smithsonian NMAH; Linda Hall Library');
}
const SNACKS = ['a chocolate bar', 'a Payday bar', 'a peanut-cluster bar'];
function drawP2(c, t) {
  head(c, 'STORY VS RECORD', null);
  const a = pr(t, ws(15) - 0.2, ws(15) + 0.3, eout);
  c.save(); c.globalAlpha = 0.25 + 0.75 * a; c.fillStyle = 'rgba(2,34,28,0.06)'; rr(c, 48, 110, 804, 330, 16); c.fill(); c.restore();
  note(c, 'THE STORY · retellings vary', 76, 160, 26, C.goldDeep, 'left', 'Mono');
  if (a > 0) { const k = Math.floor(Math.max(0, t - ws(15) + 0.2) / 0.55);
    SNACKS.forEach((s, i) => { const on = i === k % 3; c.save(); c.globalAlpha = a * (on ? 1 : 0.35); c.translate(0, on ? -6 : 0); pill(c, s, 220 + i * 230 - (i === 2 ? 10 : 0), 260 + (i % 2) * 90, 1, on ? 30 : 26); c.restore(); }); }
  note(c, 'the candy and other details change between tellings', 450, 420, 22, 'rgba(18,59,49,0.75)', 'center');
  const b = pr(t, ws(20) - 0.2, ws(20) + 0.3, eout);
  note(c, 'THE RECORD', 76, 520, 26, C.goldDeep, 'left', 'Mono');
  if (b > 0) { c.save(); c.globalAlpha = b; c.translate(0, (1 - b) * 20); print(c, IMG.head, 60, 548, 780, -0.006, 'U.S. Patent 2,495,429 (USPTO)'); c.restore(); }
  stamp(c, ['DOCUMENTED', 'FILED OCT. 8, 1945'], 450, 820, pr(t, ws(25) - 0.15, ws(25) + 0.3, eout), -0.04);
  foot(c, 'Sources: Linda Hall Library; UMaine guide; USPTO');
}
const COOK = { x: 70, y: 96, w: 760 };
function drawP3(c, t) {
  head(c, 'THE 1945 PATENT', null);
  const r = print(c, IMG.cook, COOK.x, COOK.y, COOK.w, -0.006, 'U.S. Patent 2,495,429, drawing (USPTO)');
  pages.p3pat = r;
  pill(c, 'magnetrons, wave guide, food on a conveyor', 450, 960, pr(t, ws(37) - 0.25, ws(37) + 0.2, eout), 24);
}
function drawP4(c, t) {
  head(c, 'HIS MEASUREMENT', 'An egg: 2 versus 36');
  const cook = pr(t, T.cut + 0.2, ws(51), (u) => u);
  waves(c, 170, 300, t, 190, 1, 5, 8);
  eggDraw(c, 470, 300, cook, 1.45);
  note(c, 'ILLUSTRATION', 840, 420, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  const bar = (y, w, a, col, l1, l2) => { if (a <= 0) return; c.save(); c.globalAlpha = Math.min(1, a * 1.5); note(c, l1, 60, y - 14, 26, C.ink, 'left', 'InterX');
    c.fillStyle = col; rr(c, 60, y, Math.max(8, w * a), 46, 10); c.fill(); c.fillStyle = col === C.gold ? C.deep : '#FFFFFF'; c.font = '800 26px Mono'; c.textAlign = 'left'; c.fillText(l2, 60 + Math.max(8, w * a) + (w < 120 ? 14 : -170), y + 32); c.restore(); };
  const b1 = pr(t, ws(45) - 0.15, ws(45) + 0.4, eout), b2 = pr(t, ws(51) - 0.6, ws(51) + 0.4, eout);
  bar(520, 42, b1, C.gold, 'microwave test (patent)', '');
  if (b1 > 0) { c.save(); c.globalAlpha = b1; c.fillStyle = C.ink; c.font = '800 28px Mono'; c.textAlign = 'left'; c.fillText('2 kW·s', 120, 552); c.restore(); }
  bar(660, 756, b2, C.ink, 'conventional cooking', '36 kW·s');
  pill(c, 'about 1/18 of the energy', 450, 790, pr(t, ws(51) - 0.1, ws(51) + 0.3, eout), 30);
  note(c, 'patent: waves ~10 cm, near the size of the food, heat it intensely', 450, 868, 22, 'rgba(18,59,49,0.8)', 'center');
  foot(c, 'Source: U.S. Patent 2,495,429, columns 1–3');
}
function drawP5(c, t) {
  head(c, 'LESSON', 'Test the odd result');
  const st = [['ODD RESULT', 'candy melted', ws(55)], ['TEST', 'popcorn, an egg', ws(57)], ['MEASURE', '2 vs 36', ws(60)]];
  st.forEach(([k, v, w], i) => { const a = pr(t, w - 0.2, w + 0.25, eout), y = 190 + i * 150; c.save(); c.globalAlpha = 0.25 + 0.75 * a; c.fillStyle = a > 0.5 ? 'rgba(2,34,28,0.92)' : 'rgba(2,34,28,0.2)'; rr(c, 60, y, 470, 120, 16); c.fill();
    c.fillStyle = C.gold; c.font = '800 26px Mono'; c.textAlign = 'left'; c.fillText(`${i + 1}  ${k}`, 90, y + 50); c.fillStyle = C.cream; c.font = '800 30px InterX'; c.fillText(v, 90, y + 95); c.restore();
    if (i < 2 && a > 0.5) { c.save(); c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.beginPath(); c.moveTo(295, y + 124); c.lineTo(295, y + 146); c.stroke(); c.restore(); } });
  print(c, IMG.tappan, 580, 190, 260, 0.02, 'Tappan RL-1, 1956');
  note(c, 'Photo: the Tappan RL-1, the first microwave oven', 60, 676, 21, 'rgba(18,59,49,0.8)', 'left');
  note(c, 'designed for home use (Smithsonian NMAH, CC0)', 60, 704, 21, 'rgba(18,59,49,0.8)', 'left');
  note(c, 'step 2 from his own account (Linda Hall Library)', 60, 746, 20, 'rgba(18,59,49,0.7)', 'left');
  foot(c, 'Sources: Linda Hall Library; Smithsonian NMAH; USPTO');
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
// magnifier — used once: travels the real 1945 drawing from a magnetron oscillator along the wave guide to the food
const LENS = [[0.341, 0.572], [0.653, 0.659], [0.79, 0.667]];
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut || !pages.p3pat) return;
  const r = pages.p3pat, m1 = pr(t, ws(30) - 0.1, ws(32) + 0.1), m2 = pr(t, ws(33), ws(34) + 0.2);
  const fx = m1 < 1 ? lerp(LENS[0][0], LENS[1][0], m1) : lerp(LENS[1][0], LENS[2][0], m2), fy = m1 < 1 ? lerp(LENS[0][1], LENS[1][1], m1) : lerp(LENS[1][1], LENS[2][1], m2);
  const lx = PX + r.x + r.w * fx, ly = PY + r.y + r.h * fy;
  const R = 100 * (1.35 - 0.35 * land), mag = 2.3;
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
  const flips = []; for (let x = ws(15) - 0.2; x < ws(19); x += 0.55) flips.push(+x.toFixed(3));
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, ws(32) + 0.1, ws(34) + 0.2],
    hum: [0.2, T.turn1[0]], melt: ws(8) - 0.1, plate: ws(2) - 0.25, stamp: [ws(4) - 0.1, ws(25) - 0.15], flips, header: ws(20) - 0.2,
    label: [ws(37) - 0.25, ws(51) - 0.1], bars: [ws(45) - 0.15, ws(51) - 0.6], steps: [ws(55) - 0.2, ws(57) - 0.2, ws(60) - 0.2], ok: ws(60), cta: T.cta[1] };
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
