// Aarambh english-25 30 s #01 — Henrietta Leavitt and the blinking-star ruler. Approved editorial ("Vox scrapbook") motion skill under the 2026-11-11 rules
// (context/25), the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (one idea per scene, 2–5 curiosity words, explanatory motion,
// a striking thumbnail). Replaces the brief's Mary Anning topic (already delivered as episode 21, english-19; see context/39).
// Frame 0 = real portrait of Henrietta Leavitt (c. 1898) beside one pulsing star and its light curve + "A BLINK MEASURES SPACE" (no fade/flicker/intro);
// narration from 0.05 s; thumbnail = frame 0.
// Story: how far away is a star? -> a faint star might be weak, or just far (two stars, a camera tilt reveals depth) -> she studied blinking stars in one
// distant cloud, all about equally far -> there, the brighter ones blinked slower (dots on a graph -> her real 1912 figure, Harvard Circular 173) -> so a
// blink gives true brightness (lookup on her line), and faintness then gives distance (a tape measure) -> Hubble later used her rule to show Andromeda is
// another galaxy (Isaac Roberts' real 1899 photograph) -> lesson: to see a real pattern, compare like with like -> CTA.
// Stars, the cloud, the light curves, the tape measure, the Milky Way disc and the lesson diagram are original illustrations.
// Portrait: c. 1898, published in Popular Astronomy 30 (1922) (Wikimedia Commons, public domain). Figure: Leavitt & Pickering, HCO Circular 173 (1912),
// Fig. 2 (Commons, public domain). Andromeda: Isaac Roberts, 1899 (Commons, public domain).
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; 80 words, one per script word)
  [0, 5, ['How far away is a star?']],
  [6, 13, ['Henrietta Leavitt found', 'a clue in its blink.']],
  [14, 23, ['A faint star might be', 'weak, or just far away.']],
  [24, 31, ['She studied blinking', 'stars in one distant cloud,']],
  [32, 35, ['all about equally far.']],
  [36, 41, ['There, the brighter ones', 'blinked slower.']],
  [42, 47, ['So a blink gives', 'true brightness,']],
  [48, 52, ['and faintness then', 'gives distance.']],
  [53, 57, ['Hubble later used', 'her rule']],
  [58, 63, ['to show Andromeda is', 'another galaxy.']],
  [64, 69, ['Lesson: to see a', 'real pattern,']],
  [70, 73, ['compare like with like.']],
  [74, 79, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 14: SENT[1].start, 24: SENT[2].start, 36: SENT[3].start, 42: SENT[4].start, 53: SENT[5].start, 64: SENT[6].start, 74: SENT[7].start };
const sStart = (a) => (SENT_START[a] !== undefined ? (Math.abs(ws(a) - SENT_START[a]) > 0.25 ? SENT_START[a] + 0.1 : Math.max(ws(a), SENT_START[a])) : (we(a - 1) + ws(a)) / 2); // fall back to the placed start when ASR mis-stamps a sentence's first word
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                         // hard cut on "A faint star might be weak..." -> two stars, a camera tilt reveals depth
  push: [SENT[2].start - 0.3, SENT[2].start - 0.05], // push to the star cloud
  dive: [SENT[3].start - 0.35, SENT[3].start - 0.02],// dive into the cloud: its blinking stars and the graph
  turn: [ws(48) - 0.4, ws(48) - 0.05],               // page turn to the distance shot: "and faintness then gives distance"
  push2: [SENT[5].start - 0.3, SENT[5].start - 0.05],// push to Andromeda (Hubble)
  slide: [SENT[6].start - 0.35, SENT[6].start],      // slide to the lesson page
  cta: [SENT[7].start - 0.4, SENT[7].start],
};

// ---------- assets ----------
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/henrietta-leavitt-c1898-pd.jpg'));      // 1280x1700 standard-width copy of the 2388x3171 Commons scan
const FIG = await loadImage(path.join(ROOT, 'assets/leavitt-1912-circular173-fig2-pd.png')); // 1280x1328 (Circular 173, Fig. 2: log period vs magnitude)
const ROB = await loadImage(path.join(ROOT, 'assets/andromeda-isaac-roberts-1899-pd.jpg'));  // 569x371 (Isaac Roberts, Great Andromeda Nebula, 1899)
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PORC = crop(POR, 0.1, 0.07, 0.92, 0.7); // head and lace collar
// Fig. 2 pixel geometry (measured on the 1280x1328 copy): plot x 100..1172 (log P 0..2.2), y 108..1215; magnitude m at y = 310 + (m - 12) * 201;
// her upper fitted line (maxima) runs from (110, 1031) to (1150, 141): y = 1031 - 0.856 (x - 110)
const FIGLINE = (x) => 1031 - 0.856 * (x - 110), LOOKX = 830; // lookup at log P ~ 1.5 -> the line at y ~ 415 (magnitude ~ 12.5)
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


// ---------- sky objects (original illustration) ----------
BG.n = makeBg(CX, 860, '#0C4A4E', '#010E10'); // night sky in the app's deep teal-green
PAGE.plate = makePaper(17, '#F4EEDD');
const ceph = (t, P, ph = 0) => { const u = (((t / P + ph) % 1) + 1) % 1; return u < 0.2 ? eout(u / 0.2) : 1 - Math.pow((u - 0.2) / 0.8, 0.85); }; // Cepheid-like light curve (illustrative): quick rise, slow fade
const SKY = Array.from({ length: 150 }, (_, i) => ({ x: rnd(i, 51) * W, y: 470 + rnd(i, 52) * 1320, r: 0.8 + 2.2 * Math.pow(rnd(i, 53), 3), l: 1 + Math.floor(rnd(i, 54) * 3), tw: rnd(i, 55) * 6.28 }));
function sky(c, t, a = 1, drift = 6) { if (a <= 0) return; c.save(); c.fillStyle = C.cream; // three parallax layers of faint stars
  for (const s of SKY) { const x = ((s.x + t * drift * s.l) % (W + 40)) - 20; c.globalAlpha = a * (0.22 + 0.2 * s.l) * (0.75 + 0.25 * Math.sin(t * 2.2 + s.tw)); c.beginPath(); c.arc(x, s.y, s.r * (0.7 + 0.2 * s.l), 0, 6.283); c.fill(); }
  c.restore(); }
function bigStar(c, x, y, r, b, a = 1) { // a glowing star: halo + two soft spikes + core; b = brightness 0..1
  if (a <= 0) return; b = clamp(b); c.save(); c.globalAlpha = a; c.globalCompositeOperation = 'lighter';
  const R = r * (2.2 + 2.4 * b), g = c.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(255,246,214,0.95)'); g.addColorStop(0.18, `rgba(255,214,120,${0.5 + 0.4 * b})`); g.addColorStop(0.5, `rgba(241,180,68,${0.16 + 0.22 * b})`); g.addColorStop(1, 'rgba(241,180,68,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, 6.283); c.fill();
  c.strokeStyle = `rgba(255,236,190,${0.3 + 0.45 * b})`; c.lineCap = 'round'; c.lineWidth = Math.max(1.5, r * 0.09); const L = r * (1.4 + 2.6 * b);
  c.beginPath(); c.moveTo(x - L, y); c.lineTo(x + L, y); c.moveTo(x, y - L); c.lineTo(x, y + L); c.stroke();
  c.globalCompositeOperation = 'source-over'; c.fillStyle = '#FFFBEA'; c.beginPath(); c.arc(x, y, r * (0.42 + 0.22 * b), 0, 6.283); c.fill(); c.restore(); }
function lightCurve(c, x0, y0, w, h, t, P, ph, a = 1, hi = 0) { // a scrolling light curve of the star's blink; the bright dot at the right is "now"
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12; rr(c, x0, y0, w, h, 18); c.fillStyle = 'rgba(2,28,22,0.82)'; c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(241,180,68,0.35)'; c.lineWidth = 2; c.stroke();
  c.strokeStyle = 'rgba(251,247,238,0.1)'; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x0 + 16, y0 + h * k / 4); c.lineTo(x0 + w - 16, y0 + h * k / 4); c.stroke(); }
  const span = 2.3 * P, px = x0 + w - 40, Y = (v) => y0 + h - 24 - (h - 48) * v;
  c.strokeStyle = C.gold; c.lineWidth = 5 + 3 * hi; c.lineJoin = 'round'; c.beginPath();
  for (let k = 0; k <= 90; k++) { const tau = t - span + span * k / 90, x = x0 + 24 + (px - x0 - 24) * k / 90, v = ceph(tau, P, ph); k ? c.lineTo(x, Y(v)) : c.moveTo(x, Y(v)); } c.stroke();
  const vy = Y(ceph(t, P, ph)); glowDot(c, px, vy, 1, 28 + 20 * hi); c.fillStyle = '#FFF6DA'; c.beginPath(); c.arc(px, vy, 8, 0, 6.283); c.fill(); c.restore(); }
function eye(c, x, y, s, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); // the observer
  c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 20; c.fillStyle = C.cream; c.beginPath(); c.moveTo(-62, 0); c.quadraticCurveTo(0, -48, 62, 0); c.quadraticCurveTo(0, 48, -62, 0); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = C.ink; c.beginPath(); c.arc(0, 0, 23, 0, 6.283); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(0, 0, 12, 0, 6.283); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-7, -7, 5, 0, 6.283); c.fill(); c.restore(); }
function earth(c, x, y, r, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; // a small Earth (illustration)
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, '#5DB3C2'); g.addColorStop(0.6, '#1F6F80'); g.addColorStop(1, '#0B3340');
  c.shadowColor = 'rgba(80,190,210,0.5)'; c.shadowBlur = 40; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.fillStyle = 'rgba(96,170,96,0.85)';
  [[-0.35, -0.2, 0.32, 0.22], [0.25, 0.15, 0.28, 0.36], [-0.1, 0.5, 0.22, 0.12]].forEach(([dx, dy, rx, ry]) => { c.beginPath(); c.ellipse(x + dx * r, y + dy * r, rx * r, ry * r, 0.5, 0, 6.283); c.fill(); }); c.restore();
  c.strokeStyle = 'rgba(241,180,68,0.8)'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r + 4, 0, 6.283); c.stroke(); c.restore(); }
const gauss = (i, s) => { const u1 = rnd(i, s) + 1e-6, u2 = rnd(i, s + 1); return [Math.sqrt(-2 * Math.log(u1)) * Math.cos(6.283 * u2), Math.sqrt(-2 * Math.log(u1)) * Math.sin(6.283 * u2)]; };
const CLOUD = (() => { const cv = createCanvas(760, 460), c = cv.getContext('2d'); // a distant star cloud (illustration of the Small Magellanic Cloud)
  c.save(); c.translate(380, 230); c.rotate(-0.25); c.scale(1, 0.48); const g = c.createRadialGradient(0, 0, 10, 0, 0, 340); g.addColorStop(0, 'rgba(255,236,200,0.34)'); g.addColorStop(0.5, 'rgba(190,225,210,0.12)'); g.addColorStop(1, 'rgba(190,225,210,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 340, 0, 6.283); c.fill(); c.restore();
  for (let i = 0; i < 1700; i++) { const [gx, gy] = gauss(i, 61), x = gx * 140, y = gy * 62, ca = Math.cos(-0.25), sa = Math.sin(-0.25); c.fillStyle = `rgba(255,248,228,${0.25 + 0.6 * rnd(i, 63)})`; c.beginPath(); c.arc(380 + x * ca - y * sa, 230 + x * sa + y * ca, 0.6 + 1.6 * Math.pow(rnd(i, 64), 4), 0, 6.283); c.fill(); }
  return cv; })();
const MW = (() => { const cv = createCanvas(760, 300), c = cv.getContext('2d'); c.translate(380, 150); c.scale(1, 0.34); // the Milky Way's disc seen at a tilt (illustration)
  const g = c.createRadialGradient(0, 0, 5, 0, 0, 360); g.addColorStop(0, 'rgba(255,240,200,0.95)'); g.addColorStop(0.15, 'rgba(255,214,140,0.55)'); g.addColorStop(0.6, 'rgba(160,210,200,0.14)'); g.addColorStop(1, 'rgba(160,210,200,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 360, 0, 6.283); c.fill();
  for (let arm = 0; arm < 2; arm++) for (let i = 0; i < 700; i++) { const th = i * 0.012 + arm * Math.PI, r = 40 * Math.exp(0.32 * th * 0.75), [gx, gy] = gauss(i + arm * 999, 81); if (r > 350) continue; c.fillStyle = `rgba(255,246,220,${0.25 + 0.5 * rnd(i, 83 + arm)})`; c.beginPath(); c.arc(Math.cos(th) * r + gx * 12, Math.sin(th) * r + gy * 12, 1 + 1.5 * rnd(i, 85), 0, 6.283); c.fill(); }
  return cv; })();
function telescope(c, x, y, s, ang) { // a brass refractor on a tripod; returns the objective's screen position
  c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#2E3A36'; c.lineWidth = 9; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(-80, 170); c.moveTo(0, 0); c.lineTo(80, 170); c.moveTo(0, 0); c.lineTo(0, 180); c.stroke();
  c.rotate(ang); const g = c.createLinearGradient(0, -24, 0, 24); g.addColorStop(0, '#F6D27C'); g.addColorStop(0.5, '#C98A22'); g.addColorStop(1, '#7A5212'); c.fillStyle = g;
  rr(c, -80, -22, 270, 44, 10); c.fill(); c.fillStyle = '#5C3D0E'; rr(c, 170, -28, 34, 56, 8); c.fill(); rr(c, -112, -12, 40, 24, 5); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(-60, -16, 220, 5); c.restore();
  return [x + Math.cos(ang) * 205 * s, y + Math.sin(ang) * 205 * s]; }
function tapeMeasure(c, x0, y0, x1, y1, w0, w1, prog, a = 1) { // a yellow tape measure stretching from (x0, y0) toward (x1, y1), narrowing with distance
  if (a <= 0 || prog <= 0) return; const ex = lerp(x0, x1, prog), ey = lerp(y0, y1, prog), wE = lerp(w0, w1, prog), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 16; c.fillStyle = '#F3C64F';
  c.beginPath(); c.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); c.lineTo(ex + nx * wE / 2, ey + ny * wE / 2); c.lineTo(ex - nx * wE / 2, ey - ny * wE / 2); c.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); c.closePath(); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(2,28,22,0.8)'; c.lineCap = 'butt';
  for (let k = 1; k <= 60; k++) { const u = 1 - Math.pow(1 - k / 60, 1.6); if (u > prog) break; const px = lerp(x0, x1, u), py = lerp(y0, y1, u), wu = lerp(w0, w1, u), len = wu * (k % 5 ? 0.3 : 0.6); c.lineWidth = Math.max(1, wu * 0.05);
    c.beginPath(); c.moveTo(px + nx * wu / 2, py + ny * wu / 2); c.lineTo(px + nx * (wu / 2 - len), py + ny * (wu / 2 - len)); c.stroke(); }
  c.fillStyle = '#3B2A0A'; c.save(); c.translate(ex, ey); c.rotate(Math.atan2(dy, dx)); c.fillRect(-wE * 0.12, -wE * 0.62, wE * 0.24, wE * 1.24); c.restore(); c.restore(); }
function inkStar(c, x, y, r, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.ink; c.lineCap = 'round'; c.lineWidth = Math.max(3, r * 0.14);
  for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4; c.beginPath(); c.moveTo(x + Math.cos(an) * r * 1.25, y + Math.sin(an) * r * 1.25); c.lineTo(x + Math.cos(an) * r * (k % 2 ? 1.5 : 1.75), y + Math.sin(an) * r * (k % 2 ? 1.5 : 1.75)); c.stroke(); }
  c.fillStyle = C.gold; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.lineWidth = 3; c.stroke(); c.restore(); }
function arrowLine(c, x0, y0, x1, y1, col, lw, head = true) { c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  if (head) { const an = Math.atan2(y1 - y0, x1 - x0), hs = lw * 3.2; c.beginPath(); c.moveTo(x1 + Math.cos(an) * hs * 0.6, y1 + Math.sin(an) * hs * 0.6); c.lineTo(x1 + Math.cos(an + 2.5) * hs, y1 + Math.sin(an + 2.5) * hs); c.lineTo(x1 + Math.cos(an - 2.5) * hs, y1 + Math.sin(an - 2.5) * hs); c.closePath(); c.fill(); } c.restore(); }
function fitLabel(c, text, x, y, maxSize, maxW, col, a = 1) { c.save(); c.font = `800 ${maxSize}px InterX`; const w = c.measureText(text).width; c.restore(); const sz = Math.min(maxSize, Math.floor(maxSize * maxW / w)); label(c, text, x, y, sz, col, 'InterX', a); return sz; }

// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [34, 588, 462, -0.05], sx: 752, sy: 800, P: 1.7 }; // frame-0 composition (also the thumbnail)
const BLINK = ws(13) - 0.1;
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + one pulsing star and its light curve + "A BLINK MEASURES SPACE"
  c.drawImage(BG.a, 0, 0); sky(c, t, 0.9, 5);
  const z = lerp(1.0, 1.03, pr(t, 0, T.cut, lin)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, PORC, ...F0.por, 1, t > ws(6) - 0.1 ? pr(t, ws(6) - 0.1, ws(7) + 0.9, lin) : -1);
  tape(c, F0.por[0] + 100, F0.por[1] - 6, 170, -0.35);
  const fl = pr(t, BLINK, BLINK + 0.15, eout) * (1 - pr(t, BLINK + 0.15, BLINK + 0.8));
  bigStar(c, F0.sx, F0.sy, 58, clamp(0.3 + 0.7 * ceph(t, F0.P, 0.2) + 0.6 * fl));
  lightCurve(c, 548, 1086, 392, 200, t, F0.P, 0.2, 1, fl);
  c.restore();
  dust(c, t, 1, 0.5);
  fitLabel(c, 'A BLINK', CX, 1452, 124, 780, C.cream); fitLabel(c, 'MEASURES SPACE', CX, 1566, 104, 800, C.gold);
}
const ORB = [4.95, 5.75], WEAK = ws(19) - 0.1, FARL = ws(22) - 0.1;
function scene2(c, t) { // A FAINT STAR MIGHT BE WEAK, OR JUST FAR: two stars look the same; the camera tilts up into a map and reveals depth
  c.drawImage(BG.n, 0, 0); sky(c, t, 0.6, 4);
  const s = pr(t, ORB[0], ORB[1], eio), proj = (gx, gz) => [CX + gx * 400 * lerp(1 - 0.72 * gz, 1, s), lerp(1092 - 34 * gz, 1650 - 1050 * gz, s)];
  c.save(); c.strokeStyle = 'rgba(241,180,68,0.2)'; c.lineWidth = 2; c.globalAlpha = 0.35 + 0.65 * s;
  for (let k = 0; k <= 7; k++) { const [xa, ya] = proj(-1, k / 7), [xb, yb] = proj(1, k / 7); c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke(); }
  for (let k = -3; k <= 3; k++) { const [xa, ya] = proj(k / 3, 0), [xb, yb] = proj(k / 3, 1); c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke(); }
  c.restore();
  const A = proj(-0.55, 0.3), B = proj(0.6, 0.9), E = [CX, lerp(1700, 1668, s)];
  c.save(); c.setLineDash([10, 14]); c.strokeStyle = 'rgba(251,247,238,0.42)'; c.lineWidth = 3; [A, B].forEach(([x, y]) => { c.beginPath(); c.moveTo(E[0], E[1] - 30); c.lineTo(x, y); c.stroke(); }); c.restore();
  bigStar(c, A[0], A[1], lerp(24, 13, s), lerp(0.7, 0.35, s)); bigStar(c, B[0], B[1], lerp(24, 46, s), lerp(0.7, 1, s));
  eye(c, E[0], E[1], 1.0);
  pill(c, 'WEAK', A[0], A[1] + 120, 46, pr(t, WEAK, WEAK + 0.3, eout)); pill(c, 'FAR', B[0], B[1] + 250, 46, pr(t, FARL, FARL + 0.3, eout));
}
const CLC = [500, 800], VAR3 = [[-262, -24, 1.1], [-165, 56, 0.6], [-67, -71, 0.8], [30, 27, 0.45], [134, -51, 0.95], [250, 34, 0.7], [-15, 117, 0.55]];
const MARK = ws(26) - 0.1, CLOUDHI = ws(30) - 0.1, EQ = ws(32) - 0.15, SAME = ws(34) - 0.15, ER = [500, 1640];
function scene3(c, t) { // ONE DISTANT CLOUD: her blinking stars are marked; all lie about the same distance from Earth
  c.drawImage(BG.n, 0, 0); sky(c, t, 0.7, 4);
  const z = lerp(1, 1.06, pr(t, T.push[0], T.dive[0], lin)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const hi = pr(t, CLOUDHI, CLOUDHI + 0.4, eout);
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.85 + 0.15 * hi; c.translate(CLC[0], CLC[1]); c.scale(1.22, 1.22); c.drawImage(CLOUD, -380, -230); c.restore();
  if (hi > 0) { c.save(); c.setLineDash([16, 12]); c.strokeStyle = `rgba(241,180,68,${0.75 * hi})`; c.lineWidth = 4; c.beginPath(); c.ellipse(CLC[0], CLC[1], 400, 200, -0.25, -1.2, -1.2 + 6.283 * hi); c.stroke(); c.restore(); }
  VAR3.forEach(([dx, dy, P], i) => { const x = CLC[0] + dx, y = CLC[1] + dy, m = pr(t, MARK + i * 0.09, MARK + i * 0.09 + 0.25, eout);
    bigStar(c, x, y, 9, t > MARK + i * 0.09 ? ceph(t, P, rnd(i, 71)) : 0.35, 0.95);
    if (m > 0) { c.save(); c.globalAlpha = m; c.strokeStyle = C.gold; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 26 * (1.4 - 0.4 * m), 0, 6.283); c.stroke(); c.restore(); } });
  const L = pr(t, EQ, EQ + 0.5, eio);
  if (L > 0) { c.save(); c.setLineDash([8, 12]); c.strokeStyle = 'rgba(251,247,238,0.6)'; c.lineWidth = 3;
    VAR3.forEach(([dx, dy]) => { const x = CLC[0] + dx, y = CLC[1] + dy, sx = ER[0], sy = ER[1] - 74; c.beginPath(); c.moveTo(sx, sy); c.lineTo(lerp(sx, x, L), lerp(sy, y, L)); c.stroke(); }); c.restore(); }
  const A = pr(t, EQ + 0.4, EQ + 0.95, eio);
  if (A > 0) { const R = ER[1] - CLC[1]; c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.shadowColor = 'rgba(241,180,68,0.6)'; c.shadowBlur = 16; c.beginPath(); c.arc(ER[0], ER[1], R, -Math.PI / 2 - 0.32, -Math.PI / 2 - 0.32 + 0.64 * A); c.stroke(); c.restore(); }
  earth(c, ER[0], ER[1], 66);
  c.restore();
  pill(c, 'SAME DISTANCE', CX, 1240, 52, pr(t, SAME, SAME + 0.3, eout));
}
const S4 = [[235, 640, 1.25, 1.0], [400, 728, 0.48, 0.22], [568, 612, 0.85, 0.66], [700, 712, 0.36, 0.06], [812, 636, 0.62, 0.42]]; // x, y, blink period (s, illustrative), true brightness 0..1
const BRI = ws(38) - 0.15, DROP = ws(40) - 0.2, LINE = DROP + 0.72, FIGIN = LINE + 0.25, STAMP12 = FIGIN + 0.3, LOOK = ws(44) - 0.1, LOOK2 = LOOK + 0.4, LOOK3 = LOOK2 + 0.38;
const GX = (P) => 262 + (P - 0.3) / 1.0 * 520, GY = (b) => 1400 - b * 450;
const FR = { x: 205, y: 845, w: 610 }; FR.h = FR.w * FIG.height / FIG.width; const fx = (px) => FR.x + FR.w * px / FIG.width, fy = (py) => FR.y + FR.h * py / FIG.height;
function scene4(c, t) { // THE BRIGHTER ONES BLINKED SLOWER: stars drop dots onto a graph -> a line -> her real 1912 figure; then a blink gives true brightness
  c.drawImage(BG.b, 0, 0); sky(c, t, 0.5, 3);
  const fin = pr(t, FIGIN, FIGIN + 0.35, eio), sz = pr(t, BRI, BRI + 0.4, eio);
  S4.forEach(([x, y, P, b], i) => bigStar(c, x, y, lerp(15, 9 + 22 * b, sz), lerp(0.55, 0.25 + 0.75 * b, sz) * (0.45 + 0.55 * ceph(t, P, rnd(i, 91))), 1 - 0.45 * fin));
  const ga = 1 - fin, ax = pr(t, T.dive[1] - 0.15, T.dive[1] + 0.3, eout) * ga;
  if (ax > 0) { c.save(); c.globalAlpha = ax; arrowLine(c, 230, 1440, 840, 1440, 'rgba(251,247,238,0.85)', 5); arrowLine(c, 230, 1440, 230, 880, 'rgba(251,247,238,0.85)', 5); c.restore();
    label(c, 'slower blink', 535, 1505, 40, 'rgba(251,247,238,0.85)', 'InterB', ax); c.save(); c.translate(178, 1160); c.rotate(-Math.PI / 2); label(c, 'brighter', 0, 0, 40, 'rgba(251,247,238,0.85)', 'InterB', ax); c.restore(); }
  const order = S4.map((s, i) => [s[2], i]).sort((a, b) => a[0] - b[0]);
  order.forEach(([P, i], k) => { const [x, y, , b] = S4[i], u = pr(t, DROP + k * 0.08, DROP + k * 0.08 + 0.42, eio); if (u <= 0 || ga <= 0) return;
    const gx = GX(P), gy = GY(b), px = lerp(x, gx, u), py = lerp(y, gy, u) - Math.sin(Math.PI * u) * 90; c.save(); c.globalAlpha = ga; glowDot(c, px, py, 1, 30); c.fillStyle = C.gold; c.beginPath(); c.arc(px, py, 13, 0, 6.283); c.fill(); c.restore(); });
  const ln = pr(t, LINE, LINE + 0.3, eio); if (ln > 0 && ga > 0) { const x0 = GX(0.3), y0 = GY(0.0) + 10, x1 = GX(1.3), y1 = GY(1.05); c.save(); c.globalAlpha = ga; c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(lerp(x0, x1, ln), lerp(y0, y1, ln)); c.stroke(); c.restore(); }
  if (fin > 0) { // her real figure (Circular 173, Fig. 2), placed over the drawn graph
    const s = lerp(0.9, 1, fin); c.save(); c.translate(FR.x + FR.w / 2, FR.y + FR.h / 2); c.scale(s, s); c.translate(-(FR.x + FR.w / 2), -(FR.y + FR.h / 2)); photo(c, FIG, FR.x, FR.y, FR.w, 0, fin); c.restore();
    tape(c, FR.x + 60, FR.y - 4, 150, -0.3, fin); tape(c, FR.x + FR.w - 60, FR.y + FR.h + 6, 150, -0.25, fin);
    stamp(c, ['1912', 'LEAVITT'], 728, 1330, pr(t, STAMP12, STAMP12 + 0.25, eout), -0.08, C.goldDeep, 'rgba(255,253,246,0.92)'); }
  const l1 = pr(t, LOOK, LOOK2, eio), l2 = pr(t, LOOK2, LOOK3, eio), mx = fx(LOOKX), my0 = fy(1215), my1 = fy(FIGLINE(LOOKX)), mxa = fx(100);
  const ms = pr(t, LOOK - 0.3, LOOK, eout);
  if (ms > 0) { bigStar(c, mx, 1572, 14, 0.4 + 0.6 * ceph(t, 1.0, 0.1), ms); }
  if (l1 > 0) arrowLine(c, mx, 1548, mx, lerp(1548, my1, l1), C.gold, 8, l2 <= 0);
  if (l2 > 0) { arrowLine(c, mx, my1, lerp(mx, mxa + 14, l2), my1, C.gold, 8); }
  const gl = pr(t, LOOK3 - 0.05, LOOK3 + 0.3, eout); if (gl > 0) bigStar(c, mxa - 6, my1, 20, 0.6 + 0.4 * gl, gl);
}
const FNT = ws(49) - 0.2, DST = ws(52) - 0.45, STAR5 = [575, 742];
function scene5(c, t) { // ...AND FAINTNESS THEN GIVES DISTANCE: knowing its true glow, the faint star must be far; a tape measure reaches it
  c.drawImage(BG.n, 0, 0); sky(c, t, 0.8, 4);
  const z = lerp(1, 1.04, pr(t, T.turn[0], T.push2[0], lin)); c.save(); c.translate(CX, 1100); c.scale(z, z); c.translate(-CX, -1100);
  c.save(); c.strokeStyle = 'rgba(241,180,68,0.16)'; c.lineWidth = 2; const hz = 770;
  for (let k = 1; k <= 9; k++) { const y = hz + (1760 - hz) * Math.pow(k / 9, 2); c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(STAR5[0], hz); c.lineTo(STAR5[0] + k * 260, 1900); c.stroke(); } c.restore();
  const f = pr(t, FNT, FNT + 0.6, eio);
  if (f > 0) { c.save(); c.setLineDash([12, 12]); c.strokeStyle = `rgba(241,180,68,${0.85 * f})`; c.lineWidth = 4; c.beginPath(); c.arc(STAR5[0], STAR5[1], 120, 0, 6.283); c.stroke(); c.restore(); }
  bigStar(c, STAR5[0], STAR5[1], lerp(40, 8, f), lerp(1, 0.3, f) * (0.8 + 0.2 * ceph(t, 1.25, 0.3)));
  const [ox, oy] = telescope(c, 380, 1560, 1.0, Math.atan2(STAR5[1] - 1560, STAR5[0] - 380));
  tapeMeasure(c, ox, oy, STAR5[0], STAR5[1] + 22, 66, 10, pr(t, DST, DST + 0.6, eio));
  c.restore();
  pill(c, 'DISTANCE', 770, 1200, 52, pr(t, DST + 0.45, DST + 0.75, eout));
}
const HUB = ws(53) - 0.1, USED = ws(55) - 0.15, RULE = ws(56) - 0.15, PULL = [ws(59) - 0.1, ws(59) + 0.5], GAL = ws(62) - 0.15, AND = [560, 700];
function scene6(c, t) { // HUBBLE LATER USED HER RULE: a blinking star in the real 1899 Andromeda photograph -> pull back: another galaxy beyond the Milky Way
  const p = pr(t, PULL[0], PULL[1], eio), q = 1 - p;
  c.drawImage(BG.n, 0, 0); sky(c, t, p, 3);
  if (q > 0) { c.save(); c.globalAlpha = q; c.drawImage(PAGE.plate, 0, 0); c.restore(); }
  const z = lerp(1, 1.05, pr(t, T.push2[1], PULL[0], lin)), w0 = 800 * z, x0 = CX - w0 / 2, y0 = 640 - (z - 1) * 260;
  const pw = lerp(w0, 300, p), px = lerp(x0, AND[0] - 150, p), ph = pw * ROB.height / ROB.width, py = lerp(y0, AND[1] - ph / 2, p);
  const vin = pr(p, 0.45, 1, lin);
  if (vin < 1) { const r = photo(c, ROB, px, py, pw, lerp(-0.03, 0, p), 1 - vin); if (q > 0) tape(c, px + 90, py - 4, 150, -0.3, q * (1 - vin)); }
  if (vin > 0) { c.save(); c.globalAlpha = vin; c.globalCompositeOperation = 'lighter'; c.beginPath(); c.ellipse(px + pw / 2, py + ph / 2, pw * 0.5, ph * 0.5, 0, 0, 6.283); c.clip(); c.drawImage(ROB, px, py, pw, ph); c.restore(); }
  const mx = px + pw * 0.66, my = py + ph * 0.33, mh = pr(t, HUB, HUB + 0.3, eout);
  if (mh > 0) { glowDot(c, mx, my, (0.4 + 0.6 * ceph(t, 0.9, 0.2)) * mh, 40 * pw / 800); c.save(); c.globalAlpha = mh * q; c.strokeStyle = C.gold; c.lineWidth = 5; c.beginPath(); c.arc(mx, my, 30 * (1.4 - 0.4 * mh), 0, 6.283); c.stroke(); c.restore(); }
  stamp(c, ['1923', 'HUBBLE'], 300, 1300, pr(t, USED, USED + 0.25, eout) * q, -0.07, C.goldDeep, 'rgba(255,253,246,0.92)');
  const rc = pr(t, RULE, RULE + 0.35, eout) * q;
  if (rc > 0) { const cx = lerp(1000, 720, pr(t, RULE, RULE + 0.35, eout)), cy = 1300; c.save(); c.globalAlpha = rc; c.translate(cx, cy); c.rotate(0.05);
      c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#FFFDF6'; c.fillRect(-140, -100, 280, 200); c.shadowColor = 'rgba(0,0,0,0)';
      c.strokeStyle = C.ink; c.lineWidth = 3; c.beginPath(); c.moveTo(-110, -70); c.lineTo(-110, 60); c.lineTo(115, 60); c.stroke(); c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-95, 45); c.lineTo(105, -65); c.stroke();
      c.fillStyle = C.ink; c.font = '700 26px InterB'; c.textAlign = 'center'; c.fillText('Leavitt 1912', 0, 92); c.restore();
    const la = pr(t, RULE + 0.25, RULE + 0.55, eio); if (la > 0) { c.save(); c.globalAlpha = q; c.setLineDash([12, 10]); arrowLine(c, 690, 1195, lerp(690, mx + 18, la), lerp(1195, my + 30, la), C.goldDeep, 5, la > 0.95); c.restore(); } }
  if (p > 0) { // the pulled-back view: our galaxy's disc below, Andromeda far above
    c.save(); c.globalAlpha = p; c.globalCompositeOperation = 'lighter'; c.drawImage(MW, CX - 380, lerp(1900, 1290, p)); c.restore();
    label(c, 'Milky Way', CX, 1560, 38, 'rgba(251,247,238,0.85)', 'InterB', pr(t, PULL[1] - 0.1, PULL[1] + 0.2));
    tapeMeasure(c, CX, 1420, AND[0], AND[1] + 95, 60, 14, pr(t, PULL[1], PULL[1] + 0.65, eio));
    pill(c, 'ANOTHER GALAXY', CX, 1130, 52, pr(t, GAL, GAL + 0.3, eout)); }
}
const LS = [[210, 22, 0.9], [355, 10, 0.15], [500, 30, 0.75], [645, 14, 0.45], [790, 18, 0.05]]; // x, true size, depth (0 near .. 1 far)
const POP = T.slide[0] + 0.02, PAT = ws(68) - 0.2, CMP = ws(70) - 0.1, OK7 = ws(73) - 0.1, CARD = OK7 + 0.3;
const RANK = LS.map((s, i) => [s[1], i]).sort((a, b) => a[0] - b[0]).reduce((m, [, i], k) => { m[i] = k; return m; }, {});
function scene7(c, t) { // LESSON: compare like with like — stars at mixed distances hide the pattern; on one row it appears
  c.drawImage(PAGE.lesson, 0, 0);
  const m = pr(t, CMP, CMP + 0.6, eio);
  c.save(); c.strokeStyle = 'rgba(18,59,49,0.18)'; c.lineWidth = 2; // a floor in perspective: near at the bottom, far at the top
  for (let k = 0; k <= 5; k++) { const y = lerp(1060, 640, k / 5), hw = lerp(420, 250, k / 5); c.beginPath(); c.moveTo(CX - hw, y); c.lineTo(CX + hw, y); c.stroke(); }
  for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(CX + k * 105, 1060); c.lineTo(CX + k * 62.5, 640); c.stroke(); } c.restore();
  if (m > 0) { c.save(); c.strokeStyle = `rgba(201,138,34,${0.8 * m})`; c.lineWidth = 5; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(150, 850); c.lineTo(850, 850); c.stroke(); c.restore(); }
  LS.forEach(([x, r, d], i) => { const pop = pr(t, POP + i * 0.08, POP + i * 0.08 + 0.3, eout); if (pop <= 0) return; const dd = lerp(d, 0.5, m), y = lerp(1060, 640, dd) - 10, app = r * lerp(1.7, 0.45, dd);
    const xx = lerp(CX + (x - CX) * lerp(1, 0.6, d), x, m); inkStar(c, xx, y, app * (0.6 + 0.4 * pop), pop); });
  // a small graph: blink length (true order) vs how bright each looks
  const ga = pr(t, PAT - 0.2, PAT + 0.2, eout);
  if (ga > 0) { c.save(); c.globalAlpha = ga; arrowLine(c, 300, 1400, 720, 1400, C.ink, 4); arrowLine(c, 300, 1400, 300, 1130, C.ink, 4); c.restore();
    LS.forEach(([x, r, d], i) => { const u = pr(t, PAT + RANK[i] * 0.07, PAT + RANK[i] * 0.07 + 0.25, eout); if (u <= 0) return; const ab = r * lerp(1.7, 0.45, d), at_ = r * 1.075;
      const gx = 345 + RANK[i] * 85, gy = 1385 - lerp((ab - 9) / 22, (at_ - 9) / 25, m) * 220; c.save(); c.globalAlpha = u; c.fillStyle = C.goldDeep; c.beginPath(); c.arc(gx, gy, 14, 0, 6.283); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 3; c.stroke(); c.restore(); });
    const ln = pr(t, CMP + 0.5, CMP + 0.85, eio); if (ln > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(335, 1385 - 0.12 * 220); c.lineTo(lerp(335, 700, ln), 1385 - lerp(0.12, 1.0, ln) * 220); c.stroke(); c.restore(); }
    const qa = pr(t, PAT + 0.4, PAT + 0.7, eout) * (1 - m); if (qa > 0) label(c, '?', 790, 1300, 120, '#C0392B', 'Fraunces', qa);
    const ok = pr(t, OK7, OK7 + 0.3, eout); if (ok > 0) { c.save(); c.globalAlpha = ok; c.translate(800, 1255); c.scale(0.7 + 0.3 * ok, 0.7 + 0.3 * ok); c.fillStyle = C.gold; c.beginPath(); c.arc(0, 0, 56, 0, 6.283); c.fill();
      c.strokeStyle = C.ink; c.lineWidth = 11; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-24, 2); c.lineTo(-6, 22); c.lineTo(26, -18); c.stroke(); c.restore(); } }
  const cd = pr(t, CARD, CARD + 0.3, eout);
  if (cd > 0) { c.save(); c.globalAlpha = cd; c.translate(CX, 1528); c.scale(0.9 + 0.1 * cd, 0.9 + 0.1 * cd); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = C.ink; rr(c, -330, -58, 660, 104, 20); c.fill();
    c.shadowColor = 'rgba(0,0,0,0)'; c.fillStyle = C.gold; c.font = '800 56px InterX'; c.textAlign = 'center'; c.fillText('compare like with like', 0, 14); c.restore(); }
  tape(c, 210, 520, 180, -0.3, 1); tape(c, 820, 1590, 180, 0.25, 1);
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
  const dive = (fa, fb, T0, T1, cx, cy) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.globalAlpha = e; const sb = lerp(0.82, 1, e); c.translate(CX, 900); c.scale(sb, sb); c.translate(-CX, -900); c.drawImage(b, 0, 0); c.restore();
    c.save(); c.globalAlpha = 1 - e; const sa = 1 + 2.6 * e; c.translate(cx, cy); c.scale(sa, sa); c.translate(-cx, -cy); c.drawImage(a, 0, 0); c.restore(); c.globalAlpha = 1; };
  const turn = (fa, fb, T0, T1) => { const u = (t - T0) / (T1 - T0), e = eio(u); const a = at(fa, bufA), b = at(fb, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#0E3F37'); bg.addColorStop(1, '#062A24'); c.fillStyle = bg; c.fill(); c.restore(); } };
  if (t < T.cut) return scene1(c, t);
  if (t < T.push[0]) return scene2(c, t);
  if (t < T.push[1]) return push(scene2, scene3, T.push[0], T.push[1]);
  if (t < T.dive[0]) return scene3(c, t);
  if (t < T.dive[1]) return dive(scene3, scene4, T.dive[0], T.dive[1], CLC[0], CLC[1]);
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
  // captions: plate centred at x = 500, <= 800 px wide (x 100..900), y 300..460 (brief: captions roughly y 280-460); Inter 800 54 px
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
  const pulses = (P, ph, t0, t1) => { const out = []; for (let k = -2; k < 40; k++) { const tt = (k - ph + 0.2) * P; if (tt >= t0 && tt < t1) out.push(+tt.toFixed(3)); } return out; }; // light-curve peaks (u = 0.2)
  const cues = { T, hookPulses: pulses(F0.P, 0.2, 0, T.cut), sweep: ws(6) - 0.1, blink: BLINK, orb: ORB, weak: WEAK, far: FARL,
    marks: VAR3.map((_, i) => +(MARK + i * 0.09).toFixed(3)), cloudHi: CLOUDHI, eq: EQ, arc: EQ + 0.4, same: SAME,
    bri: BRI, drops: S4.map((_, k) => +(DROP + k * 0.08 + 0.42).toFixed(3)), line: LINE, figIn: FIGIN, stamp12: STAMP12, look: [LOOK, LOOK2, LOOK3],
    faint: FNT, dist: DST, distPill: DST + 0.45, hub: HUB, used: USED, rule: RULE, pull: PULL, mwTape: PULL[1], gal: GAL,
    pop: LS.map((_, i) => +(POP + i * 0.08).toFixed(3)), pat: PAT, cmp: CMP, ok: OK7, card: CARD };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(cues));
} else if (args.includes('--capbounds')) { // caption QA: widest line, plate bounds, timings
  const m = createCanvas(10, 10).getContext('2d'); m.font = '800 54px InterX'; let widest = 0, wl = '';
  const rows = capWin.map((cw) => { cw.lines.forEach((l) => { const w = m.measureText(l).width; if (w > widest) { widest = w; wl = l; } }); return `  ${cw.t0.toFixed(2)}-${cw.t1.toFixed(2)} | ${cw.lines.join(' / ')}`; });
  const bw = Math.min(800, widest + 60);
  const txt = `widest caption line ${widest.toFixed(0)} px ("${wl}"); plate ${bw.toFixed(0)} px centred at x 500 -> x ${(CX - bw / 2).toFixed(0)} to ${(CX + bw / 2).toFixed(0)} (rule: inside 100..900); plate y 300-460 (brief: roughly y 280-460, below the account UI); Inter 800 54 px; ${capWin.length} groups, max 2 lines; padding >= 30 px: ${widest + 60 <= 800}; first caption appears at ${capWin[0].t0.toFixed(2)} s (frame 0 has no caption)\n${rows.join('\n')}\n`;
  writeFileSync(path.join(ROOT, 'qa/caption_bounds.txt'), txt); console.log(txt);
} else if (arg('--thumb')) {
  const cv = createCanvas(W, H); drawThumb(cv.getContext('2d')); writeFileSync(path.resolve(ROOT, arg('--thumb')), cv.toBuffer('image/png')); console.log('thumb written');
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0,2.4,4.6,5.4,6.6,8.3,9.8,11.3,12.4,13.3,14,14.6,15.6,16.3,17.9,19,20,20.8,21.9,23.4,24.4,25.9,28').split(',').map(Number)) { const t0 = Date.now(); drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); console.log(tt, Date.now() - t0, 'ms'); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
