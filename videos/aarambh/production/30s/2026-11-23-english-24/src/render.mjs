// Aarambh english-24 30 s #01 — Tu Youyou and the temperature clue. Approved editorial ("Vox scrapbook") motion skill under the 2026-11-11 rules (context/25),
// the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (one idea per scene, 2–5 curiosity words, explanatory motion, a striking thumbnail).
// Frame 0 = real 2015 portrait of Tu Youyou beside a heated flask of herb extract with a thermometer in it + "THE CLUE WAS THE TEMPERATURE" (no fade/flicker/intro);
// narration from 0.05 s; thumbnail = frame 0.
// Story: an extract against malaria kept failing; Tu Youyou found out why -> what was ruining it? -> it was made with heat (the active sparks break) -> an
// ancient recipe (Ge Hong's handbook; real Siku Quanshu page) said soak the herb, wring out the juice, no boiling -> her team extracted it cool, in ether
// (about 35 °C); in 1971 it cleared parasites in mice -> that led to artemisinin and a 2015 Nobel Prize -> lesson: when a good idea fails, test the step
// you assumed was harmless -> CTA. Sparks, glassware, the herb, the microscope view, crystals and the lesson diagram are original illustrations.
// Portrait: Bengt Nyman, Stockholm 2015 (Wikimedia Commons, CC BY 2.0). Page: Wenyuange Siku Quanshu vol. 734 p. 407 (Wikimedia Commons, PD-scan).
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues | --capbounds | --thumb out.png
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

const W = 1080, H = 1920, FPS = 30, N = 900, CX = 500; // CX: visual and caption centre inside the x 100..900 safe area
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const lin = (u) => u;
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings and captions ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; "Tu Youyou" = 6-7, "artemisinin" = 50-52)
  [0, 5, ['An extract against malaria', 'kept failing.']],
  [6, 10, ['Tu Youyou found out why.']],
  [11, 14, ['What was ruining it?']],
  [15, 19, ['It was made with heat.']],
  [20, 23, ['An ancient recipe said:']],
  [24, 30, ['soak the herb,', 'wring out the juice.']],
  [31, 32, ['No boiling.']],
  [33, 39, ['Her team extracted it', 'cool, in ether.']],
  [40, 46, ['In 1971, it cleared', 'parasites in mice.']],
  [47, 52, ['That led to artemisinin,']],
  [53, 57, ['and a 2015 Nobel Prize.']],
  [58, 63, ['Lesson: when a good', 'idea fails,']],
  [64, 70, ['test the step you', 'assumed was harmless.']],
  [71, 76, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 15: SENT[2].start, 20: SENT[3].start, 33: SENT[4].start, 47: SENT[5].start, 58: SENT[6].start, 71: SENT[7].start };
const sStart = (a) => (SENT_START[a] !== undefined ? (Math.abs(ws(a) - SENT_START[a]) > 0.25 ? SENT_START[a] + 0.1 : Math.max(ws(a), SENT_START[a])) : (we(a - 1) + ws(a)) / 2); // fall back to the placed start when ASR mis-stamps a sentence's first word
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                        // hard cut on "What was ruining it?" -> the sparks going out
  whip: [SENT[2].start - 0.25, SENT[2].start],      // whip pan to the flask on the flame: "It was made with heat."
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05],// push to the ancient-recipe page
  turn: [SENT[4].start - 0.35, SENT[4].start],      // page turn to the cool ether extraction
  dive: [ws(40) - 0.4, ws(40) - 0.05],              // dive into the extract: the microscope
  push2: [SENT[5].start - 0.3, SENT[5].start - 0.05],// push to artemisinin crystals and the Nobel Prize
  slide: [SENT[6].start - 0.35, SENT[6].start],     // slide to the lesson page
  cta: [SENT[7].start - 0.4, SENT[7].start],
};

// ---------- assets ----------
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/tu-youyou-2015-bengt-nyman-ccby2.jpg')); // 1280x1280 standard-width copy (Bengt Nyman, CC BY 2.0)
const GEH = await loadImage(path.join(ROOT, 'assets/gehong-zhouhou-beijifang-juan3-siku-734-407-pd.jpg')); // 800x1120 crop of Siku Quanshu vol. 734 p. 407
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PORC = crop(POR, 0.38, 0.03, 0.98, 0.77); // Tu Youyou, head to chest (Stockholm, December 2015)
const QH = [0.2, 0.29, 0.03, 0.79]; // the qinghao column on the page crop (x0, x1, y0, y1 fractions): 又方青蒿一握以水二升漬絞取汁盡服之

// ---------- textures, backgrounds ----------
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), paperTex = noiseTile(256, 21, 14);
function makeBg(cx, cy, inner, outer) {
  const cv = createCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = outer; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(cx, cy, 60, cx, cy, 1150); g.addColorStop(0, inner); g.addColorStop(0.55, '#06392F'); g.addColorStop(1, outer);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.07; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  return cv;
}
const BG = { a: makeBg(640, 980, '#0E5A49', '#01130F'), b: makeBg(CX, 1040, '#0B5244', '#011410'), c: makeBg(CX, 980, '#2A0E1A', '#08030A') };
function makePaper(seed, tint) { // a scrapbook page: cream paper, warm vignette, torn top and bottom edges
  const cv = createCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = '#0B2A23'; c.fillRect(0, 0, W, H);
  const top = 250, bot = 1640; c.beginPath(); c.moveTo(-10, top);
  for (let x = 0; x <= W + 20; x += 18) c.lineTo(x, top + (rnd(x, seed) - 0.5) * 16);
  c.lineTo(W + 10, bot); for (let x = W + 20; x >= -20; x -= 18) c.lineTo(x, bot + (rnd(x, seed + 3) - 0.5) * 16); c.closePath();
  c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetY = 16; c.fillStyle = tint; c.fill(); c.restore();
  c.save(); c.clip(); c.globalAlpha = 0.22; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; const g = c.createRadialGradient(CX, 950, 250, CX, 950, 1100); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(201,138,34,0.28)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  return cv;
}
const PAGE = { recipe: makePaper(5, '#FBF3E2'), lesson: makePaper(11, '#FFFBF0') };

// ---------- primitives ----------
function label(c, text, x, y, size, col = C.cream, font = 'Fraunces', a = 1, align = 'center') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px ${font}`; c.textAlign = align; c.fillStyle = col;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 4; c.fillText(text, x, y); c.restore(); }
function pill(c, text, x, y, size, a, col = C.gold) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 56;
  c.translate(x, y); const s = 0.9 + 0.1 * a; c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, -w / 2, -size * 0.95, w, size * 1.5, 18); c.fill();
  c.shadowColor = 'rgba(0,0,0,0)'; c.fillStyle = col; c.textAlign = 'center'; c.fillText(text, 0, size * 0.12); c.restore(); }
function photo(c, img, x, y, w, rot_ = 0, a = 1, sweep = -1) { // archival print: white border, deep soft shadow, optional light sweep
  if (a <= 0) return; const h = w * img.height / img.width; c.save(); c.globalAlpha = a; c.translate(x + w / 2, y + h / 2); c.rotate(rot_);
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (sweep >= 0 && sweep <= 1) { c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); const sx = lerp(-w, w, sweep); const g = c.createLinearGradient(sx - 120, 0, sx + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.rotate(-0.3); c.fillRect(-w * 1.5, -h * 1.5, w * 3, h * 3); c.restore(); }
  c.restore(); return { x, y, w, h };
}
function tape(c, x, y, w, rot_, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = 0.78 * a; c.translate(x, y); c.rotate(rot_); c.fillStyle = '#EFE4C2'; c.beginPath();
  c.moveTo(-w / 2, -22); for (let k = 0; k <= 6; k++) c.lineTo(-w / 2 + (w * k) / 6, -22 + (k % 2 ? 3 : 0)); c.lineTo(w / 2, 22); for (let k = 6; k >= 0; k--) c.lineTo(-w / 2 + (w * k) / 6, 22 - (k % 2 ? 3 : 0)); c.closePath(); c.fill();
  c.globalAlpha = 0.18 * a; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2, -22, w, 12); c.restore(); }
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function stamp(c, lines, x, y, a, rot_ = -0.06, col = C.goldDeep, bg = null) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot_); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 54px Mono' : '700 32px Mono'; return c.measureText(l).width; })) + 56, h = 40 + lines.length * 62;
  if (bg) { c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); } c.strokeStyle = col; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 54px Mono' : '700 32px Mono'; c.fillText(l, 0, -h / 2 + 76 + i * 58); }); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
function star(c, x, y, r, a, col = C.gold) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, rr_ = i % 2 ? r * 0.32 : r; c.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } c.fill(); c.restore(); }
function dust(c, t, seed, a = 1) { // foreground depth: large soft out-of-focus motes drifting in front of the subject
  if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) { const x = ((rnd(i, seed) * 1300 + t * (14 + 22 * rnd(i, seed + 1))) % 1300) - 110, y = 520 + rnd(i, seed + 2) * 1100 + Math.sin(t * 0.7 + i) * 30, r = 26 + 60 * rnd(i, seed + 3);
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,214,140,${0.16 * a})`); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  c.restore(); }

// ---------- the Earth ----------

// ---------- lab objects (original illustration) ----------
const GREENX = [64, 150, 82], REDT = '#D9483B';
function flaskPath(c, s) { // Erlenmeyer flask, local origin at the base centre
  c.beginPath(); c.moveTo(-36 * s, -480 * s); c.lineTo(-36 * s, -330 * s); c.lineTo(-150 * s, -28 * s); c.quadraticCurveTo(-160 * s, 0, -124 * s, 0); c.lineTo(124 * s, 0); c.quadraticCurveTo(160 * s, 0, 150 * s, -28 * s);
  c.lineTo(36 * s, -330 * s); c.lineTo(36 * s, -480 * s); c.closePath(); }
const NSP = 30;
function sparkAt(i, s, level, t) { // position of active "spark" i inside the liquid (local coords)
  const v = rnd(i, 2), u = rnd(i, 1), y = -(0.08 + v * 0.84) * level * 330 * s, half = 150 * s - (-y / (330 * s)) * 114 * s;
  return [(u * 2 - 1) * half * 0.78 + Math.sin(t * 0.8 + i) * 6 * s, y + Math.cos(t * 0.6 + i * 1.3) * 5 * s]; }
/** flask: o = { level, active(i) -> 0..1, broken 0..1, boil 0..1, steam 0..1, glowAll } */
function flask(c, x, y, s, t, o = {}) {
  const level = o.level ?? 0.55, ly = -level * 330 * s;
  c.save(); c.translate(x, y);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40 * s; c.shadowOffsetY = 18 * s; flaskPath(c, s); c.fillStyle = 'rgba(210,236,230,0.10)'; c.fill(); c.restore();
  // liquid
  c.save(); flaskPath(c, s); c.clip(); const lg = c.createLinearGradient(0, ly, 0, 0); lg.addColorStop(0, `rgba(${GREENX.join(',')},0.82)`); lg.addColorStop(1, 'rgba(20,70,40,0.95)');
  c.fillStyle = lg; c.fillRect(-170 * s, ly, 340 * s, -ly + 2); c.fillStyle = 'rgba(190,235,190,0.35)'; c.fillRect(-170 * s, ly - 3 * s, 340 * s, 6 * s);
  // bubbles when boiling
  if (o.boil > 0) for (let k = 0; k < 16; k++) { const ph = (t * (1.2 + rnd(k, 7)) + rnd(k, 8)) % 1, bx = (rnd(k, 9) * 2 - 1) * 110 * s * (1 - ph * 0.5), by = lerp(-8 * s, ly, ph), br = (5 + 9 * rnd(k, 10)) * s * (0.6 + ph);
    c.globalAlpha = o.boil * (1 - ph * 0.6); c.strokeStyle = 'rgba(230,255,235,0.9)'; c.lineWidth = 2.5 * s; c.beginPath(); c.arc(bx, by, br, 0, 6.283); c.stroke(); c.globalAlpha = 1; }
  // the active ingredient, drawn as gold sparks; heat breaks them into grey fragments
  for (let i = 0; i < NSP; i++) { const [px, py] = sparkAt(i, s, level, t), a = o.active ? o.active(i) : 1, br = o.broken || 0;
    if (a > 0 && br < 1) glowDot(c, px, py, 0.85 * a * (1 - br) * (o.glowAll ?? 1), 22 * s * (0.8 + 0.25 * Math.sin(t * 5 + i)));
    if (a > 0 && br < 1) { c.fillStyle = `rgba(255,236,170,${a * (1 - br)})`; c.beginPath(); c.arc(px, py, 5 * s, 0, 6.283); c.fill(); }
    if (br > 0) for (let k = 0; k < 3; k++) { const an = rnd(i * 3 + k, 11) * 6.283, d = br * 26 * s; c.fillStyle = `rgba(150,150,140,${0.7 * (1 - br * 0.7)})`; c.beginPath(); c.arc(px + Math.cos(an) * d, py + Math.sin(an) * d + br * 10 * s, 3 * s, 0, 6.283); c.fill(); } }
  c.restore();
  // glass: rim, outline, highlights
  c.lineJoin = 'round'; flaskPath(c, s); c.strokeStyle = 'rgba(235,250,245,0.75)'; c.lineWidth = 5 * s; c.stroke();
  c.fillStyle = 'rgba(235,250,245,0.8)'; rr(c, -44 * s, -492 * s, 88 * s, 16 * s, 6 * s); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22 * s, -460 * s); c.lineTo(-22 * s, -350 * s); c.lineTo(-110 * s, -90 * s); c.stroke();
  c.restore();
  if (o.steam > 0) steam(c, x, y - 492 * s, t, o.steam, s);
}
function steam(c, x, y, t, a, s = 1) { c.save(); c.lineCap = 'round';
  for (let k = 0; k < 4; k++) { const ph = (t * 0.45 + k / 4) % 1, yy = y - ph * 260 * s, xx = x + Math.sin(ph * 5 + k) * 30 * s;
    c.strokeStyle = `rgba(235,245,240,${0.35 * a * (1 - ph)})`; c.lineWidth = (18 + 30 * ph) * s; c.beginPath(); c.moveTo(xx - 10 * s, yy + 30 * s); c.quadraticCurveTo(xx + 25 * s, yy, xx - 5 * s, yy - 40 * s); c.stroke(); }
  c.restore(); }
/** thermometer from (x1, y1) (top) to bulb (x2, y2); temp 0..1; optional mark text at the column top */
function thermo(c, x1, y1, x2, y2, temp, s = 1, mark = null, ma = 1, glow = 0) {
  const L = Math.hypot(x2 - x1, y2 - y1), an = Math.atan2(y2 - y1, x2 - x1);
  c.save(); c.translate(x2, y2); c.rotate(an - Math.PI / 2); // local: bulb at (0,0), tube along -y towards (x1, y1)
  if (glow > 0) glowDot(c, 0, -L * 0.3, glow, 160 * s, [255, 120, 90]);
  c.fillStyle = 'rgba(240,250,248,0.55)'; rr(c, -14 * s, -L, 28 * s, L, 14 * s); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 3 * s; rr(c, -14 * s, -L, 28 * s, L, 14 * s); c.stroke();
  c.strokeStyle = 'rgba(18,59,49,0.55)'; c.lineWidth = 2 * s; for (let k = 1; k < 12; k++) { const yy = -30 * s - (L - 60 * s) * k / 12; c.beginPath(); c.moveTo(8 * s, yy); c.lineTo(14 * s, yy); c.stroke(); }
  const top = -24 * s - (L - 70 * s) * clamp(temp); c.fillStyle = REDT; rr(c, -6 * s, top, 12 * s, -top, 6 * s); c.fill();
  c.beginPath(); c.arc(0, 0, 22 * s, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.arc(-7 * s, -7 * s, 6 * s, 0, 6.283); c.fill();
  if (mark && ma > 0) { c.save(); c.translate(24 * s, top); c.rotate(-(an - Math.PI / 2)); c.globalAlpha = ma; c.font = `800 ${Math.round(40 * s)}px Mono`; c.fillStyle = C.gold; c.textAlign = 'left';
    c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 10; c.fillText(mark, 10 * s, 14 * s); c.restore(); }
  c.restore(); }
function burner(c, x, y, s, f, t) { // Bunsen burner: base at y; flame strength f
  c.save(); c.translate(x, y); c.fillStyle = '#2E3B37'; c.beginPath(); c.moveTo(-70 * s, 0); c.lineTo(70 * s, 0); c.lineTo(40 * s, -26 * s); c.lineTo(-40 * s, -26 * s); c.closePath(); c.fill();
  const tg = c.createLinearGradient(-16 * s, 0, 16 * s, 0); tg.addColorStop(0, '#5B6A65'); tg.addColorStop(0.5, '#B8C4BF'); tg.addColorStop(1, '#4A5753'); c.fillStyle = tg; c.fillRect(-16 * s, -150 * s, 32 * s, 126 * s);
  if (f > 0) { const fl = 1 + 0.08 * Math.sin(t * 31) + 0.06 * Math.sin(t * 17 + 1), h = (70 + 90 * f) * s * fl, w = (22 + 14 * f) * s;
    glowDot(c, 0, -150 * s - h * 0.4, 0.5 * Math.min(1, f), (90 + 90 * f) * s, [255, 140, 60]);
    c.save(); c.translate(0, -150 * s); const og = c.createLinearGradient(0, 0, 0, -h); og.addColorStop(0, 'rgba(90,150,255,0.95)'); og.addColorStop(0.45, `rgba(255,${f > 1 ? 150 : 190},80,${0.55 + 0.3 * Math.min(1, f)})`); og.addColorStop(1, 'rgba(255,120,40,0)');
    c.fillStyle = og; c.beginPath(); c.moveTo(-w, 0); c.bezierCurveTo(-w, -h * 0.5, -w * 0.2, -h * 0.7, 0, -h); c.bezierCurveTo(w * 0.2, -h * 0.7, w, -h * 0.5, w, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(160,210,255,0.9)'; c.beginPath(); c.moveTo(-w * 0.45, 0); c.quadraticCurveTo(0, -h * 0.55, w * 0.45, 0); c.closePath(); c.fill(); c.restore(); }
  c.restore(); }
function tripod(c, x, y, s, h) { c.save(); c.strokeStyle = '#3B4743'; c.lineWidth = 8 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 150 * s, y); c.lineTo(x + 150 * s, y); c.moveTo(x - 120 * s, y); c.lineTo(x - 150 * s, y + h); c.moveTo(x + 120 * s, y); c.lineTo(x + 150 * s, y + h); c.stroke(); c.restore(); }
function herb(c, x, y, s, rot_ = 0, sqx = 1, t = 0) { // a bundle of qinghao (sweet wormwood): three stems with finely divided leaves
  c.save(); c.translate(x, y); c.rotate(rot_); c.scale(sqx, 1);
  for (let st = 0; st < 3; st++) { const ang = (st - 1) * 0.22; c.save(); c.rotate(ang);
    c.strokeStyle = '#4E6B2E'; c.lineWidth = 6 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10 * s, -150 * s, 0, -300 * s); c.stroke();
    for (let k = 1; k < 9; k++) { const yy = -k * 34 * s, side = k % 2 ? 1 : -1, len = (70 - k * 5) * s; c.save(); c.translate(0, yy); c.rotate(side * (0.9 + 0.05 * Math.sin(t * 2 + k + st)));
      c.strokeStyle = '#6A8F3A'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -len); c.stroke();
      for (let q = 1; q < 5; q++) { c.fillStyle = q % 2 ? '#7FA84A' : '#5E8A35'; for (const sd of [-1, 1]) { c.save(); c.translate(0, -len * q / 5); c.rotate(sd * 0.9); c.beginPath(); c.ellipse(0, -9 * s, 3.2 * s, 10 * s, 0, 0, 6.283); c.fill(); c.restore(); } }
      c.restore(); }
    c.restore(); }
  c.fillStyle = '#C9A15A'; rr(c, -26 * s, -16 * s, 52 * s, 22 * s, 6 * s); c.fill(); // tie
  c.restore(); }
function bowl(c, x, y, s, t, ripple = -1) { // celadon bowl of cold water; ripple = seconds since the herb went in
  c.save(); c.translate(x, y); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.shadowOffsetY = 14;
  const bg = c.createLinearGradient(0, -40 * s, 0, 120 * s); bg.addColorStop(0, '#CFE3D6'); bg.addColorStop(1, '#7FA996'); c.fillStyle = bg; c.beginPath(); c.moveTo(-200 * s, 0); c.quadraticCurveTo(-180 * s, 130 * s, 0, 140 * s); c.quadraticCurveTo(180 * s, 130 * s, 200 * s, 0); c.closePath(); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = '#9ED2E2'; c.beginPath(); c.ellipse(0, 0, 196 * s, 34 * s, 0, 0, 6.283); c.fill(); c.strokeStyle = '#E9F3EE'; c.lineWidth = 7 * s; c.beginPath(); c.ellipse(0, 0, 200 * s, 36 * s, 0, 0, 6.283); c.stroke();
  if (ripple >= 0) for (let k = 0; k < 3; k++) { const u = clamp(ripple * 0.9 - k * 0.25); if (u <= 0 || u >= 1) continue; c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - u)})`; c.lineWidth = 3 * s; c.beginPath(); c.ellipse(0, 0, 40 * s + u * 140 * s, (8 + u * 24) * s, 0, 0, 6.283); c.stroke(); }
  c.restore(); }
function drop(c, x, y, r, a, col = 'rgba(80,160,90,0.95)') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r * 1.8); c.quadraticCurveTo(x + r * 1.1, y - r * 0.2, x, y + r); c.quadraticCurveTo(x - r * 1.1, y - r * 0.2, x, y - r * 1.8); c.fill(); c.restore(); }
function bath(c, x, y, w, h, t, front) { // ice-water bath: draw the back (front=false) before the flask and the front water after it
  if (!front) { c.save(); c.fillStyle = 'rgba(120,190,215,0.18)'; rr(c, x - w / 2, y - h, w, h, 26); c.fill(); c.restore(); return; }
  c.save(); const wl = y - h * 0.62; const g = c.createLinearGradient(0, wl, 0, y); g.addColorStop(0, 'rgba(150,215,235,0.42)'); g.addColorStop(1, 'rgba(90,170,205,0.55)'); c.fillStyle = g; rr(c, x - w / 2, wl, w, y - wl, 22); c.fill();
  c.strokeStyle = 'rgba(230,248,255,0.8)'; c.lineWidth = 5; rr(c, x - w / 2, y - h, w, h, 26); c.stroke(); c.beginPath(); c.moveTo(x - w / 2 + 10, wl); c.lineTo(x + w / 2 - 10, wl); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.stroke();
  for (let k = 0; k < 7; k++) { const ix = x - w / 2 + 50 + k * (w - 100) / 6 + Math.sin(t * 1.2 + k) * 6, iy = wl - 10 + Math.cos(t * 1.4 + k * 2) * 5, sz = 46 + 16 * rnd(k, 3);
    if (Math.abs(ix - x) < 150) continue; c.save(); c.translate(ix, iy); c.rotate((rnd(k, 4) - 0.5) * 0.6); c.fillStyle = 'rgba(235,250,255,0.85)'; rr(c, -sz / 2, -sz / 2, sz, sz, 10); c.fill(); c.strokeStyle = 'rgba(160,215,235,0.9)'; c.lineWidth = 3; rr(c, -sz / 2, -sz / 2, sz, sz, 10); c.stroke(); c.restore(); }
  c.restore(); }
// microscope view of infected red blood cells (illustration)
const RBC = Array.from({ length: 52 }, (_, i) => ({ x: (rnd(i, 21) * 2 - 1) * 1.15, y: (rnd(i, 22) * 2 - 1) * 1.15, r: 0.105 + 0.03 * rnd(i, 23), inf: rnd(i, 24) < 0.3 }));
function scope(c, cx, cy, R, t, clear, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.clip();
  const bg = c.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); bg.addColorStop(0, '#FBE7E2'); bg.addColorStop(1, '#E9B9B2'); c.fillStyle = bg; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  RBC.forEach((b, i) => { const x = cx + (b.x + 0.03 * Math.sin(t * 0.5 + i)) * R, y = cy + (b.y + 0.03 * Math.cos(t * 0.4 + i)) * R, r = b.r * R;
    const g = c.createRadialGradient(x, y, r * 0.15, x, y, r); g.addColorStop(0, '#F6C3B9'); g.addColorStop(0.7, '#E4847A'); g.addColorStop(1, '#C8564E'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    if (b.inf) { const k = 1 - clamp(clear * 1.4 - rnd(i, 25) * 0.4); if (k > 0) { c.strokeStyle = `rgba(92,52,150,${0.95 * k})`; c.lineWidth = r * 0.14; c.beginPath(); c.arc(x + r * 0.2, y - r * 0.15, r * 0.32 * (0.6 + 0.4 * k), 0, 6.283); c.stroke();
      c.fillStyle = `rgba(48,24,96,${k})`; c.beginPath(); c.arc(x + r * 0.42, y - r * 0.28, r * 0.11, 0, 6.283); c.fill(); } } });
  if (clear > 0 && clear < 1) { const sx = cx - R + 2.4 * R * clear; const g = c.createLinearGradient(sx - 200, 0, sx + 120, 0); g.addColorStop(0, 'rgba(241,180,68,0)'); g.addColorStop(0.7, 'rgba(255,214,120,0.45)'); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
  c.restore();
  c.save(); c.globalAlpha = a; c.strokeStyle = '#1C2522'; c.lineWidth = 34; c.beginPath(); c.arc(cx, cy, R + 16, 0, 6.283); c.stroke(); c.strokeStyle = C.gold; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R + 2, 0, 6.283); c.stroke();
  const v = c.createRadialGradient(cx, cy, R * 0.7, cx, cy, R); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.28)'); c.fillStyle = v; c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.fill(); c.restore(); }
function vial(c, x, y, s, grow, t) { // a glass vial of white needle crystals (pure artemisinin, illustration)
  c.save(); c.translate(x, y); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = 'rgba(220,240,235,0.12)'; rr(c, -90 * s, -300 * s, 180 * s, 300 * s, 30 * s); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); rr(c, -90 * s, -300 * s, 180 * s, 300 * s, 30 * s); c.clip();
  const n = Math.round(70 * clamp(grow)); for (let k = 0; k < n; k++) { const bx = (rnd(k, 31) * 2 - 1) * 70 * s, len = (30 + 70 * rnd(k, 32)) * s * clamp(grow * 1.3 - rnd(k, 33) * 0.3), an = -Math.PI / 2 + (rnd(k, 34) - 0.5) * 1.4;
    c.strokeStyle = `rgba(250,250,245,${0.75 + 0.25 * rnd(k, 35)})`; c.lineWidth = (3 + 4 * rnd(k, 36)) * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, -6 * s); c.lineTo(bx + Math.cos(an) * len, -6 * s + Math.sin(an) * len); c.stroke(); }
  if (grow > 0.5) for (let k = 0; k < 6; k++) { const gx = (rnd(k, 37) * 2 - 1) * 60 * s, gy = -(20 + 70 * rnd(k, 38)) * s; glowDot(c, gx, gy, 0.5 * Math.max(0, Math.sin(t * 4 + k * 1.7)), 26 * s, [255, 250, 230]); }
  c.restore();
  c.strokeStyle = 'rgba(235,250,245,0.8)'; c.lineWidth = 5 * s; rr(c, -90 * s, -300 * s, 180 * s, 300 * s, 30 * s); c.stroke();
  c.fillStyle = '#A9825A'; rr(c, -74 * s, -350 * s, 148 * s, 64 * s, 14 * s); c.fill(); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 8 * s; c.beginPath(); c.moveTo(-60 * s, -270 * s); c.lineTo(-60 * s, -40 * s); c.stroke();
  c.restore(); }
function fitLabel(c, text, x, y, maxSize, maxW, col, a = 1) { c.save(); c.font = `800 ${maxSize}px InterX`; const w = c.measureText(text).width; c.restore(); const sz = Math.min(maxSize, Math.floor(maxSize * maxW / w)); label(c, text, x, y, sz, col, 'InterX', a); return sz; }

// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [36, 600, 420, -0.05], fx: 732, fy: 1060, fs: 1.15 }; // frame-0 composition (also the thumbnail)
const FAIL = ws(4) - 0.1; // "kept failing": the sparks start going out
const sparkFail = (t, i, t0, spread) => { const off = t0 + rnd(i, 41) * spread; if (t < off) return 1; const u = t - off; return u > 0.35 ? 0.12 : (Math.sin(u * 40) > 0 ? 1 : 0.3); };
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + a heated flask of extract with a thermometer in it + "THE CLUE WAS THE TEMPERATURE"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.03, pr(t, 0, T.cut, lin)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, PORC, ...F0.por, 1, t > ws(6) - 0.1 ? pr(t, ws(6) - 0.1, ws(6) + 1.1, lin) : -1);
  tape(c, F0.por[0] + 80, F0.por[1] - 6, 160, -0.35);
  const { fx, fy, fs } = F0;
  burner(c, fx, fy + 196, 1.05, 0.9, t); tripod(c, fx, fy + 8, 1.15, 188);
  thermo(c, fx + 80, 568, fx + 10, fy - 80, 0.86, 1.05, null, 0, 0.55 * pr(t, ws(10) - 0.2, ws(10) + 0.3, eout));
  flask(c, fx, fy, fs, t, { level: 0.56, steam: 1, boil: 0.35, active: (i) => sparkFail(t, i, FAIL, 1.6) });
  c.restore();
  dust(c, t, 1, 0.7);
  fitLabel(c, 'THE CLUE WAS', CX, 1452, 112, 780, C.cream); fitLabel(c, 'THE TEMPERATURE', CX, 1560, 100, 790, C.gold);
}
function scene2(c, t) { // SUPER HOOK: what was ruining it? — close on the extract; the sparks go out one by one
  c.drawImage(BG.c, 0, 0);
  const z = lerp(1, 1.06, pr(t, T.cut, T.whip[0], lin)); c.save(); c.translate(CX, 1100); c.scale(z, z); c.translate(-CX, -1100);
  flask(c, CX, 1560, 2.3, t, { level: 0.62, active: (i) => sparkFail(t, i, T.cut + 0.05, 1.0) });
  c.restore();
  const q = pr(t, ws(13) - 0.15, ws(13) + 0.3, eout); label(c, '?', CX, 1290, 300 * (0.85 + 0.15 * q), C.gold, 'Fraunces', 0.2 + 0.8 * q);
}
const HEAT = ws(19) - 0.15;
function scene3(c, t) { // HEAT: the flask over a roaring flame; the sparks break apart
  c.drawImage(BG.b, 0, 0);
  const f = lerp(0.6, 1.5, pr(t, HEAT - 0.1, HEAT + 0.2, eout)), br = pr(t, HEAT + 0.05, HEAT + 0.55, eio);
  burner(c, CX, 1320, 1.15, f, t); tripod(c, CX, 1110, 1.15, 210);
  thermo(c, CX + 90, 520, CX + 10, 1030, lerp(0.6, 1.0, pr(t, HEAT - 0.1, HEAT + 0.4, eout)), 1.1, null, 0, 0.6 * pr(t, HEAT, HEAT + 0.3, lin));
  flask(c, CX, 1102, 1.1, t, { level: 0.56, steam: 1.2, boil: lerp(0.3, 1, pr(t, ws(17), HEAT + 0.2, lin)), broken: br });
  dust(c, t, 3, 0.5);
  pill(c, 'HEAT', CX, 1500, 60, pr(t, HEAT, HEAT + 0.25, eout), '#FF8A6E');
}
const SOAK = ws(24) - 0.2, WRING = ws(27) - 0.1, NOBOIL = ws(31) - 0.1;
function scene4(c, t) { // AN ANCIENT RECIPE: the real page (Ge Hong's handbook, Siku Quanshu copy), the qinghao line lit; then soak, wring, no boiling
  c.drawImage(PAGE.recipe, 0, 0);
  const mv = pr(t, SOAK - 0.25, SOAK + 0.25, eio), w = lerp(560, 300, mv), x = lerp(220, 70, mv), y = lerp(560, 540, mv), rot_ = lerp(-0.02, -0.06, mv);
  const p = photo(c, GEH, x, y, w, rot_, 1);
  tape(c, x + 70, y - 8, 160, -0.3);
  const hl = pr(t, ws(21) - 0.15, ws(23) + 0.1, eio); // the qinghao column is highlighted top to bottom
  if (hl > 0) { c.save(); c.translate(x + w / 2, y + p.h / 2); c.rotate(rot_); const x0 = -w / 2 + QH[0] * w, x1 = -w / 2 + QH[1] * w, y0 = -p.h / 2 + QH[2] * p.h, y1 = -p.h / 2 + QH[3] * p.h;
    c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(241,180,68,0.55)'; c.fillRect(x0, y0, x1 - x0, (y1 - y0) * hl); c.globalCompositeOperation = 'source-over';
    c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.strokeRect(x0, y0, x1 - x0, (y1 - y0) * hl); c.restore(); }
  // the demonstration: soak the herb in cold water, wring out the juice
  const da = pr(t, SOAK - 0.1, SOAK + 0.3, eout); if (da > 0) {
    const bx = 640, by = 1240, inW = pr(t, SOAK, SOAK + 0.5, eio), lift = pr(t, WRING - 0.1, WRING + 0.3, eio), twist = t > WRING ? Math.sin((t - WRING) * 9) * pr(t, WRING, WRING + 0.2, lin) * (1 - pr(t, NOBOIL - 0.2, NOBOIL, lin)) : 0;
    c.save(); c.globalAlpha = da;
    bowl(c, bx, by, 1, t, t > SOAK + 0.35 ? t - SOAK - 0.35 : -1);
    const hy = lerp(lerp(800, 1090, inW), 760, lift); // herb base y = hy + 260 (scale 1.25)
    c.save(); c.beginPath(); c.rect(0, 0, W, by + (lift > 0.5 ? 400 : 0)); c.clip(); herb(c, bx, hy + 260, 1.25, twist * 0.12, 1 - Math.abs(twist) * 0.2, t); c.restore();
    if (inW > 0.6 && lift < 0.4) { c.fillStyle = 'rgba(158,210,226,0.55)'; c.beginPath(); c.ellipse(bx, by, 196, 34, 0, 0, 6.283); c.fill(); }
    if (t > WRING + 0.1) for (let k = 0; k < 7; k++) { const ph = ((t - WRING) * 1.6 + k / 7) % 1, dx = bx + (rnd(k, 51) - 0.5) * 60, dy = lerp(hy + 270, by - 4, ph); if (t < NOBOIL + 0.6) drop(c, dx, dy, 10, 0.9 * (1 - ph * 0.3)); }
    c.restore(); }
  const nb = pr(t, NOBOIL - 0.05, NOBOIL + 0.2, eout); if (nb > 0) { c.save(); c.globalAlpha = nb; c.translate(CX, 1470); c.rotate(-0.05);
    const s = 1.25 - 0.25 * nb; c.scale(s, s); c.font = '800 54px Mono'; const tw = c.measureText('NO BOILING').width; const wd = tw + 150;
    c.fillStyle = 'rgba(255,251,240,0.85)'; rr(c, -wd / 2, -50, wd, 100, 14); c.fill(); c.strokeStyle = '#B23A2E'; c.lineWidth = 7; rr(c, -wd / 2, -50, wd, 100, 14); c.stroke();
    c.save(); c.translate(-wd / 2 + 56, 0); c.fillStyle = '#E0603E'; c.beginPath(); c.moveTo(-16, 22); c.bezierCurveTo(-18, 2, -4, -8, 0, -30); c.bezierCurveTo(6, -8, 18, 2, 16, 22); c.closePath(); c.fill();
    c.strokeStyle = '#B23A2E'; c.lineWidth = 6; c.beginPath(); c.moveTo(-26, -26); c.lineTo(26, 30); c.stroke(); c.restore();
    c.fillStyle = '#B23A2E'; c.textAlign = 'left'; c.fillText('NO BOILING', -wd / 2 + 100, 19); c.restore(); }
  dust(c, t, 4, 0.3);
}
const COOL = ws(37) - 0.2, ETHER = ws(39) - 0.15, Y1971 = ws(41) - 0.15, CLEAR = ws(43) - 0.1;
function scene5(c, t) { // COOL EXTRACTION in ether (about 35 °C), then a dive into the extract: parasites cleared in mice (1971)
  c.drawImage(BG.b, 0, 0);
  const dive = pr(t, T.dive[0], T.dive[1], (u) => u * u);
  if (dive < 1) {
    const z = 1 + 3.2 * dive; c.save(); c.translate(CX, 1150); c.scale(z, z); c.translate(-CX, -1150); c.globalAlpha = 1 - pr(dive, 0.75, 1, lin);
    bath(c, CX, 1330, 560, 250, t, false);
    const temp = lerp(0.62, 0.3, pr(t, COOL - 0.1, COOL + 0.5, eio));
    thermo(c, CX + 90, 560, CX + 10, 1160, temp, 1.05, '35°', pr(t, COOL + 0.3, COOL + 0.6, eout), 0);
    flask(c, CX, 1310, 1.05, t, { level: 0.56, glowAll: 1 + 0.3 * pr(t, COOL, COOL + 0.6, lin), active: () => 0.65 + 0.35 * pr(t, COOL, COOL + 0.6, eout) });
    bath(c, CX, 1330, 560, 250, t, true);
    const ea = pr(t, ETHER - 0.05, ETHER + 0.25, eout); if (ea > 0) { c.save(); c.globalAlpha = ea; c.translate(CX + 70, 870); c.rotate(0.08); c.fillStyle = '#FBF5E6'; rr(c, -100, -34, 200, 68, 10); c.fill(); c.strokeStyle = C.goldDeep; c.lineWidth = 4; rr(c, -100, -34, 200, 68, 10); c.stroke();
      c.strokeStyle = 'rgba(18,59,49,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-100, 0); c.lineTo(-150, -30); c.stroke(); c.fillStyle = C.ink; c.font = '800 40px Mono'; c.textAlign = 'center'; c.fillText('ETHER', 0, 14); c.restore(); }
    c.restore();
    dust(c, t, 5, 0.5 * (1 - dive));
  }
  if (dive > 0) { // the microscope: infected red blood cells; the extract clears the parasites
    const R = 380 * (dive < 1 ? E_out(dive) : 1), clear = pr(t, CLEAR, CLEAR + 1.1, eio);
    if (dive >= 1) c.drawImage(BG.c, 0, 0);
    scope(c, CX, 1000, R, t, clear, 1);
    if (clear > 0) glowDot(c, CX, 1000, 0.25 * clear * (1 - pr(t, CLEAR + 1.2, CLEAR + 2, lin)), 420);
    stamp(c, ['1971', 'extract 191'], 300, 660, pr(t, Y1971 - 0.1, Y1971 + 0.2, eout), -0.07, C.gold, 'rgba(2,28,22,0.85)');
  }
}
const E_out = (u) => 1 - Math.pow(1 - u, 3);
const ART = ws(50) - 0.15, NOB = ws(55) - 0.15;
function scene6(c, t) { // ARTEMISININ: gold sparks gather into a vial of white crystals; then her portrait and the 2015 Nobel Prize
  c.drawImage(BG.a, 0, 0);
  const g = pr(t, T.push2[1] - 0.1, ART + 0.9, eio);
  for (let k = 0; k < 24; k++) { const u = clamp(g * 1.2 - rnd(k, 61) * 0.2); if (u >= 1) continue; const a0 = rnd(k, 62) * 6.283, r0 = 520 + 200 * rnd(k, 63);
    const x = lerp(CX + Math.cos(a0) * r0, CX, eio(u)), y = lerp(1180 + Math.sin(a0) * r0 * 0.8, 1240, eio(u)); glowDot(c, x, y, 0.8 * (1 - u * 0.5), 24); }
  vial(c, CX, 1430, 1.15, pr(t, ART - 0.3, ART + 0.9, eout), t);
  pill(c, 'ARTEMISININ', CX, 1500, 52, pr(t, ART, ART + 0.3, eout) * (1 - pr(t, NOB - 0.4, NOB - 0.15, lin)));
  const na = pr(t, NOB - 0.1, NOB + 0.3, eout);
  circlePortrait(c, PORC, 0.48, 0.3, 0.26, CX, 660, 130, na);
  stamp(c, ['NOBEL', '2015'], CX, 875, pr(t, NOB + 0.15, NOB + 0.45, eout), -0.07, C.gold, 'rgba(2,28,22,0.85)');
  dust(c, t, 6, 0.6);
}
// lesson: a process of four steps; the result fails; a spotlight tests each step and stops on the one assumed harmless (heat), which turns cool; the result succeeds
const STEPX = [200, 400, 600, 800], STEPY = 900, TILES = ws(58) - 0.2, RUN = ws(61) - 0.1, FAILL = ws(63) - 0.05, SPOT = ws(64) - 0.1, STOP = ws(66), FLIP = ws(68), OKL = ws(70) - 0.2, CARD = ws(70) + 0.05;
function stepIcon(c, k, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  if (k === 'herb') { c.strokeStyle = '#4E6B2E'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 40); c.lineTo(0, -40); c.stroke(); c.fillStyle = '#6A8F3A'; for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { c.save(); c.translate(0, 26 - i * 20); c.rotate(sd * 0.8); c.beginPath(); c.ellipse(0, -16, 7, 18, 0, 0, 6.283); c.fill(); c.restore(); } }
  if (k === 'heat') { c.fillStyle = '#E0603E'; c.beginPath(); c.moveTo(-26, 36); c.bezierCurveTo(-30, 4, -6, -10, 0, -44); c.bezierCurveTo(10, -10, 30, 4, 26, 36); c.closePath(); c.fill(); c.fillStyle = '#FFC25A'; c.beginPath(); c.moveTo(-12, 36); c.bezierCurveTo(-12, 16, -2, 6, 0, -10); c.bezierCurveTo(4, 6, 12, 16, 12, 36); c.closePath(); c.fill(); }
  if (k === 'cool') { c.strokeStyle = '#4FA6C9'; c.lineWidth = 7; for (let i = 0; i < 3; i++) { c.save(); c.rotate(i * Math.PI / 3); c.beginPath(); c.moveTo(0, -42); c.lineTo(0, 42); c.moveTo(-12, -30); c.lineTo(0, -18); c.lineTo(12, -30); c.moveTo(-12, 30); c.lineTo(0, 18); c.lineTo(12, 30); c.stroke(); c.restore(); } }
  if (k === 'filter') { c.fillStyle = '#B9C4BF'; c.beginPath(); c.moveTo(-40, -36); c.lineTo(40, -36); c.lineTo(8, 6); c.lineTo(8, 40); c.lineTo(-8, 40); c.lineTo(-8, 6); c.closePath(); c.fill(); c.fillStyle = '#5E8A35'; c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, -30); c.lineTo(14, -10); c.lineTo(-14, -10); c.closePath(); c.fill(); }
  if (k === 'test') { c.strokeStyle = '#2E5A4E'; c.lineWidth = 6; rr(c, -14, -44, 28, 88, 14); c.stroke(); c.fillStyle = 'rgba(64,150,82,0.9)'; rr(c, -11, 0, 22, 41, 11); c.fill(); }
  c.restore(); }
function scene7(c, t) {
  c.drawImage(PAGE.lesson, 0, 0);
  const kinds = ['herb', t < FLIP + 0.2 ? 'heat' : 'cool', 'filter', 'test'];
  // connectors with a travelling pulse
  c.save(); c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 6; c.setLineDash([12, 12]); c.beginPath(); c.moveTo(STEPX[0], STEPY); c.lineTo(STEPX[3], STEPY); c.lineTo(STEPX[3], STEPY + 150); c.lineTo(CX + 90, 1230); c.stroke(); c.restore();
  const run = pr(t, RUN, FAILL, lin); if (run > 0 && run < 1) glowDot(c, lerp(STEPX[0], STEPX[3], run), STEPY, 0.9, 50);
  const run2 = pr(t, FLIP + 0.3, OKL, lin); if (run2 > 0 && run2 < 1) glowDot(c, lerp(STEPX[0], STEPX[3], run2), STEPY, 0.9, 50);
  // spotlight sweeping the steps, stopping on heat
  const sp = pr(t, SPOT, STOP, eio), sa = pr(t, SPOT - 0.1, SPOT + 0.1, lin) * (1 - pr(t, OKL, OKL + 0.3, lin)); if (sa > 0) { const sx = lerp(STEPX[3], STEPX[1], sp);
    c.save(); c.globalAlpha = 0.6 * sa; const g = c.createLinearGradient(CX, 560, sx, STEPY); g.addColorStop(0, 'rgba(255,230,160,0.9)'); g.addColorStop(1, 'rgba(255,214,120,0.2)'); c.fillStyle = g; c.beginPath(); c.moveTo(CX - 20, 560); c.lineTo(CX + 20, 560); c.lineTo(sx + 110, STEPY + 110); c.lineTo(sx - 110, STEPY + 110); c.closePath(); c.fill(); c.restore(); }
  STEPX.forEach((x, i) => { const a = pr(t, TILES + i * 0.12, TILES + i * 0.12 + 0.3, eout); if (a <= 0) return; const fl = i === 1 ? Math.abs(Math.cos(Math.PI * pr(t, FLIP, FLIP + 0.4, lin))) : 1;
    c.save(); c.globalAlpha = a; c.translate(x, STEPY + (1 - a) * 30); c.scale(Math.max(0.02, fl), 1); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 18; c.shadowOffsetY = 8;
    const hot = i === 1 && sp >= 1 && t < FLIP + 0.2; c.fillStyle = '#FFFDF6'; rr(c, -82, -82, 164, 164, 22); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = hot ? C.gold : 'rgba(18,59,49,0.5)'; c.lineWidth = hot ? 8 : 4; rr(c, -82, -82, 164, 164, 22); c.stroke(); c.restore();
    c.save(); c.globalAlpha = a; c.translate(x, STEPY + (1 - a) * 30); c.scale(Math.max(0.02, fl), 1); stepIcon(c, kinds[i], 0, 0, 1.2); c.restore(); });
  // the result: fails (red), then works (gold)
  const ra = pr(t, TILES + 0.5, TILES + 0.8, eout), fail = pr(t, FAILL, FAILL + 0.2, lin), ok = pr(t, OKL, OKL + 0.25, eout);
  if (ra > 0) { c.save(); c.globalAlpha = ra; c.translate(CX, 1240); c.fillStyle = ok > 0 ? `rgba(241,180,68,${0.4 + 0.6 * ok})` : fail > 0 ? 'rgba(200,70,60,0.95)' : 'rgba(18,59,49,0.25)'; c.beginPath(); c.arc(0, 0, 66, 0, 6.283); c.fill();
    c.strokeStyle = '#FFFDF6'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); if (ok > 0) { c.moveTo(-26, 2); c.lineTo(-6, 24); c.lineTo(30, -22); } else if (fail > 0) { c.moveTo(-22, -22); c.lineTo(22, 22); c.moveTo(22, -22); c.lineTo(-22, 22); } c.stroke(); c.restore();
    if (ok > 0) glowDot(c, CX, 1240, 0.7 * ok, 200); }
  const ca = pr(t, CARD, CARD + 0.35, eout); if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 170, 1390, 660, 130, 24); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 58px InterX'; c.textAlign = 'center'; c.fillText('test every step', CX, 1476); c.restore(); }
  tape(c, 210, 520, 180, -0.3, 1); tape(c, 820, 1580, 180, 0.25, 1);
}
function scene8(c, t) { // CTA (verified Aarambh listing line)
  c.drawImage(BG.a, 0, 0); const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.5 + 0.5 * a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.drawImage(icon, CX - 150, 600, 300, 300); c.restore();
  label(c, 'Download Aarambh', CX, 1060, 76, C.cream); label(c, 'to support livelihood tools', CX, 1134, 42, C.gold, 'InterX');
  label(c, 'Fund verified livelihood tools', CX, 1250, 32, 'rgba(251,247,238,0.85)', 'InterB'); label(c, 'and follow their impact.', CX, 1292, 32, 'rgba(251,247,238,0.85)', 'InterB');
  label(c, 'Get it on Google Play', CX, 1400, 28, 'rgba(251,247,238,0.65)', 'Mono');
}
const bufA = createCanvas(W, H), bufB = createCanvas(W, H);
function render(c, t) {
  const at = (fn, buf) => { const x = buf.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; fn(x, t); return buf; };
  const push = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); };
  const slide = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.translate(-W * e, 0); c.drawImage(a, 0, 0); c.restore(); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, W * (1 - e), 0); c.restore(); };
  const whip = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; };
  const turn = (fa, fb, T0, T1) => { const u = (t - T0) / (T1 - T0), e = eio(u); const a = at(fa, bufA), b = at(fb, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } };
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) return whip(scene2, scene3, T.whip[0], T.whip[1]);
  if (t < T.push[0]) return scene3(c, t);
  if (t < T.push[1]) return push(scene3, scene4, T.push[0], T.push[1]);
  if (t < T.turn[0]) return scene4(c, t);
  if (t < T.turn[1]) return turn(scene4, scene5, T.turn[0], T.turn[1]);
  if (t < T.push2[0]) return scene5(c, t);
  if (t < T.push2[1]) return push(scene5, scene6, T.push2[0], T.push2[1]);
  if (t < T.slide[0]) return scene6(c, t);
  if (t < T.slide[1]) return slide(scene6, scene7, T.slide[0], T.slide[1]);
  if (t < T.cta[0]) return scene7(c, t);
  if (t < T.cta[1]) return slide(scene7, scene8, T.cta[0], T.cta[1]);
  return scene8(c, t);
}
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; render(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // no opening flicker or fade: frame 0 is the finished composition (first-frame rule)
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.4 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate centred at x = 500, <= 800 px wide (x 100..900), y 300..460 (brief: upper captions about y 280-460); Inter 800 54 px
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(800, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 60);
    rr(ctx, CX - bw / 2, 300, bw, 160, 18); ctx.fillStyle = 'rgba(2,28,22,0.9)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(CX - bw / 2 + 18, 456, bw - 36, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, CX, (cw.lines.length === 1 ? 400 : 368) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.75)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawThumb(c) { drawFrame(0); c.drawImage(canvas, 0, 0); } // the thumbnail IS frame 0 (first-frame rule, context/25 addendum 2026-11-15)

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, fail: FAIL, sweep: ws(6) - 0.1, clue: ws(10) - 0.2, heat: HEAT, highlight: [ws(21) - 0.15, ws(23) + 0.1], soak: SOAK, wring: WRING, noboil: NOBOIL,
    cool: COOL, ether: ETHER, y1971: Y1971, clear: CLEAR, art: ART, nobel: NOB, tiles: TILES, run: RUN, fail2: FAILL, spot: [SPOT, STOP], flip: FLIP, ok: OKL, card: CARD };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(cues));
} else if (args.includes('--capbounds')) { // caption QA: widest line, plate bounds, timings
  const m = createCanvas(10, 10).getContext('2d'); m.font = '800 54px InterX'; let widest = 0, wl = '';
  const rows = capWin.map((cw) => { cw.lines.forEach((l) => { const w = m.measureText(l).width; if (w > widest) { widest = w; wl = l; } }); return `  ${cw.t0.toFixed(2)}-${cw.t1.toFixed(2)} | ${cw.lines.join(' / ')}`; });
  const bw = Math.min(800, widest + 60);
  const txt = `widest caption line ${widest.toFixed(0)} px ("${wl}"); plate ${bw.toFixed(0)} px centred at x 500 -> x ${(CX - bw / 2).toFixed(0)} to ${(CX + bw / 2).toFixed(0)} (rule: inside 100..900); plate y 300-460 (brief: about y 280-460, below the account UI); Inter 800 54 px; ${capWin.length} groups, max 2 lines; padding >= 30 px: ${widest + 60 <= 800}; first caption appears at ${capWin[0].t0.toFixed(2)} s (frame 0 has no caption)\n${rows.join('\n')}\n`;
  writeFileSync(path.join(ROOT, 'qa/caption_bounds.txt'), txt); console.log(txt);
} else if (arg('--thumb')) {
  const cv = createCanvas(W, H); drawThumb(cv.getContext('2d')); writeFileSync(path.resolve(ROOT, arg('--thumb')), cv.toBuffer('image/png')); console.log('thumb written');
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0,2.5,4.9,6.6,8.0,9.2,10.2,11.0,13.4,15.2,16.9,19.2,20.9,23.0,24.6,25.4,26.3,28.5').split(',').map(Number)) { const t0 = Date.now(); drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); console.log(tt, Date.now() - t0, 'ms'); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
