// Aarambh english-13 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25):
// one visual idea per scene, large brief labels, no on-screen source footers, spotlit desk with depth, captions inside x 100..900 (plate centred at x = 500),
// motivated transitions (hard cut, whip, push, zoom through the real drawing, page turn, push, CTA slide).
// Story: Elisha Otis — the cable is cut, the platform holds -> ordinary hoists had no brake -> his catches, spring and toothed rails (U.S. Patent 31,128)
// -> he did not invent the elevator; he proved its safety brake in public in 1854 -> a new invention may need a test people can see before anyone wants it.
// Archival objects: public-domain portrait of Elisha Otis (Wikimedia Commons "Otis.jpg", PD-old) and the original Patent Office drawing for No. 31,128
// (U.S. National Archives, ARC 305889). Everything else (shaft, platform, axe, hoist, schematic, 1854 stage and crowd, icons) is original illustration.
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues | --thumb out.png
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
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings and captions ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json)
  [0, 5, ['Elisha Otis rose', 'on a platform,']],
  [6, 10, ['then had its cable cut.']],
  [11, 12, ['It held.']],
  [13, 19, ['Hoists of his day', 'had a flaw:']],
  [20, 26, ['if the rope broke,', 'the load fell.']],
  [27, 34, ['His brake: rope tension', 'held two catches back;']],
  [35, 37, ['if it snapped,']],
  [38, 44, ['a spring threw them', 'into toothed rails.']],
  [45, 49, ["He didn't invent", 'the elevator;']],
  [50, 58, ['in 1854, he proved its', 'safety brake in public.']],
  [59, 65, ['Lesson: a new invention', 'may need a test']],
  [66, 73, ['people can see,', 'before anyone wants it.']],
  [74, 79, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 13: SENT[2].start, 27: SENT[3].start, 45: SENT[4].start, 59: SENT[5].start, 74: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                   // hard cut on "It held."
  whip: [SENT[2].start - 0.2, SENT[2].start],    // whip pan to the ordinary hoist
  push: [SENT[3].start - 0.25, SENT[3].start],   // push to the patent page
  zoomIn: [ws(29) - 0.3, ws(29) + 0.05],         // zoom through the real drawing into the brake schematic ("rope tension")
  turn: [SENT[4].start - 0.35, SENT[4].start],   // page turn to the 1854 public test
  push2: [SENT[5].start - 0.3, SENT[5].start],   // push to the lesson
  cta: [SENT[6].start - 0.48, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/elisha-otis-portrait-pd.jpg'));
const PAT = await loadImage(path.join(ROOT, 'assets/us31128-nara-305889-patent-drawing.jpg'));
// ---------- textures, background ----------
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
const BG = { a: makeBg(CX, 980, '#0E5A49', '#01130F'), b: makeBg(CX, 1050, '#0B5244', '#011410'), c: makeBg(CX, 1000, '#0D4F57', '#01131A') };
const PAPER = (() => { const cv = createCanvas(W, H), c = cv.getContext('2d'); c.fillStyle = C.paper; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.2; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; const g = c.createRadialGradient(CX, 1000, 300, CX, 1000, 1200); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(201,138,34,0.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H); return cv; })();

// ---------- primitives ----------
function label(c, text, x, y, size, col = C.cream, font = 'Fraunces', a = 1, align = 'center') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px ${font}`; c.textAlign = align; c.fillStyle = col;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 4; c.fillText(text, x, y); c.restore(); }
function approx(c, text, x, y, size, col, font = 'Fraunces', a = 1) { // draws a leading '≈ ' in Mono (Fraunces lacks the glyph), rest in font, centred
  if (a <= 0) return; if (!text.startsWith('≈ ')) return label(c, text, x, y, size, col, font, a);
  const rest = text.slice(2); c.save(); c.font = `800 ${size}px Mono`; const w1 = c.measureText('≈ ').width; c.font = `800 ${size}px ${font}`; const w2 = c.measureText(rest).width; c.restore();
  const x0 = x - (w1 + w2) / 2; label(c, '≈', x0, y, size, col, 'Mono', a, 'left'); label(c, rest, x0 + w1, y, size, col, font, a, 'left'); }
function photo(c, img, x, y, w, rot = 0, a = 1, sweep = -1) { // archival print: white border, deep soft shadow, optional light sweep
  if (a <= 0) return; const h = w * img.height / img.width; c.save(); c.globalAlpha = a; c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (sweep >= 0 && sweep <= 1) { c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); const sx = lerp(-w, w, sweep); const g = c.createLinearGradient(sx - 120, 0, sx + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.rotate(-0.3); c.fillRect(-w * 1.5, -h * 1.5, w * 3, h * 3); c.restore(); }
  c.restore(); return { x, y, w, h };
}
// ---------- Otis primitives (original illustration) ----------
const IRON = '#5C676B', IRON_D = '#3A4245', WOODC = '#7A5E43', INK = '#16302A';
function rail(c, x, y0, y1, side, p = 46, d = 18, w = 34) { // vertical guide rail; side = +1 teeth face right, -1 face left; hook teeth point up
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = WOODC; const x0 = side > 0 ? x - w : x; c.fillRect(x0, y0, w, y1 - y0); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(x0 + 4, y0, 5, y1 - y0);
  c.fillStyle = IRON; c.strokeStyle = IRON_D; c.lineWidth = 2;
  for (let y = y0 + 6; y + p < y1; y += p) { c.beginPath(); c.moveTo(x, y + p); c.lineTo(x + side * d, y + 4); c.lineTo(x, y); c.closePath(); c.fill(); c.stroke(); }
  c.restore(); }
function cable(c, x, y0, y1, lw = 7, col = '#C9B48A') { c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke();
  c.strokeStyle = 'rgba(80,60,30,0.4)'; c.lineWidth = 1.5; for (let y = y0; y < y1; y += 9) { c.beginPath(); c.moveTo(x - lw / 2, y); c.lineTo(x + lw / 2, y + 6); c.stroke(); } c.restore(); }
function figure(c, x, y, s = 1, col = INK) { // standing man with a top hat (silhouette), feet at (x, y)
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  rr(c, -16, -96, 32, 70, 10); c.fill(); c.fillRect(-14, -30, 11, 30); c.fillRect(3, -30, 11, 30);
  c.beginPath(); c.arc(0, -110, 14, 0, 6.283); c.fill(); c.fillRect(-12, -150, 24, 30); c.fillRect(-19, -124, 38, 6);
  c.save(); c.translate(16, -88); c.rotate(-0.9); c.fillRect(0, -5, 34, 10); c.restore(); c.restore(); }
function platformCar(c, cx, y, w, engage = 0, glow = 0) { // deck at y; crosshead 150 above; pawls at crosshead ends
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 22; c.shadowOffsetY = 10;
  c.fillStyle = WOODC; c.fillRect(cx - w / 2, y, w, 20); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = IRON; c.fillRect(cx - w / 2 + 8, y - 150, 10, 150); c.fillRect(cx + w / 2 - 18, y - 150, 10, 150); c.fillRect(cx - w / 2 + 4, y - 158, w - 8, 14);
  for (const sd of [-1, 1]) { const px = cx + sd * (w / 2 - 4 + engage * 14); c.save(); c.translate(px, y - 150);
    if (glow > 0) { c.shadowColor = `rgba(241,180,68,${glow})`; c.shadowBlur = 24; }
    c.fillStyle = glow > 0 ? '#E8C25E' : IRON_D; c.beginPath(); c.moveTo(0, -6); c.lineTo(sd * 22, 2); c.lineTo(0, 12); c.closePath(); c.fill(); c.restore(); }
  c.restore(); }
function axe(c, x, y, ang, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(ang);
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 16; c.shadowOffsetY = 8; c.fillStyle = '#8A6A44'; rr(c, -8, 0, 16, 190, 7); c.fill();
  c.fillStyle = '#B9C2C4'; c.beginPath(); c.moveTo(-8, 4); c.lineTo(-62, -14); c.quadraticCurveTo(-74, 22, -62, 56); c.lineTo(-8, 36); c.closePath(); c.fill(); c.strokeStyle = '#5E686B'; c.lineWidth = 3; c.stroke(); c.restore(); }
function spark(c, x, y, a, r = 40) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(241,180,68,${0.7 * a})`); g.addColorStop(1, 'rgba(241,180,68,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function strike(c, x0, x1, y, a) { if (a <= 0) return; c.save(); c.strokeStyle = '#B5532F'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, a), y); c.stroke(); c.restore(); }
function bigPill(c, text, x, y, a, size = 40, bg = 'rgba(2,28,22,0.92)', fg = C.cream) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 44;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6; c.fillStyle = bg; rr(c, x - w / 2, y - size * 0.95, w, size * 1.9, 16); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = fg; c.textAlign = 'center'; c.fillText(text, x, y + size * 0.35); c.restore(); return w; }
function stamp(c, lines, x, y, a, rot = -0.06, col = C.goldDeep) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 38px Mono' : '700 30px Mono'; return c.measureText(l).width; })) + 44, h = 30 + lines.length * 48;
  c.strokeStyle = col; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 38px Mono' : '700 30px Mono'; c.fillText(l, 0, -h / 2 + 56 + i * 46); }); c.restore(); }

// ---------- scenes (each draws the full frame; t is global time) ----------
const CUT_T = () => ws(10); // the cable is cut on "cut"
function scene1(c, t) { // HOOK: real portrait; a platform rises in a toothed shaft; an axe cuts the cable; the catches bite
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.05, 1.0, pr(t, 0, 1.2, eout)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const pa = pr(t, 0, 0.45, eout); photo(c, POR, 110, 590 + (1 - pa) * 30, 290, -0.025, pa, pr(t, 0.25, 1.1, (u) => u));
  label(c, 'ELISHA OTIS', 255, 1012, 34, C.gold, 'Mono', pr(t, 0.5, 0.9, eout));
  rail(c, 590, 540, 1470, 1); rail(c, 830, 540, 1470, -1);
  const ct = CUT_T(), py0 = lerp(1400, 1060, pr(t, 0.05, 2.7)), drop = t > ct ? 26 * pr(t, ct, ct + 0.18, (u) => u * u) : 0, py = py0 + drop, eng = pr(t, ct + 0.05, ct + 0.15);
  c.save(); c.fillStyle = IRON_D; c.fillRect(570, 528, 280, 16); c.restore();
  if (t < ct) cable(c, 710, 544, py - 158); else { const k = t - ct; c.save(); c.beginPath(); c.rect(0, 544, W, H); c.clip(); cable(c, 710, 544 - k * 300, 744 - k * 300); c.restore(); c.save(); c.translate(710, py - 158); c.rotate(Math.sin(k * 9) * 0.25 * Math.exp(-k * 2)); cable(c, 0, -140 + k * 120, 0); c.restore(); }
  platformCar(c, 710, py, 240, eng, eng * (1 - pr(t, ct + 0.5, ct + 1.2)));
  figure(c, 700, py, 0.9);
  const ax = pr(t, ct - 0.55, ct, (u) => u * u); axe(c, 800, py - 230 - 40, lerp(0.9, -0.15, ax), pr(t, ct - 0.75, ct - 0.5) * (1 - pr(t, ct + 0.4, ct + 0.7)));
  spark(c, 710, py - 250, t >= ct ? 1 - pr(t, ct, ct + 0.35) : 0, 60); spark(c, 600, py - 150, eng * (1 - pr(t, ct + 0.15, ct + 0.6)), 46); spark(c, 820, py - 150, eng * (1 - pr(t, ct + 0.15, ct + 0.6)), 46);
  c.restore();
}
function scene2(c, t) { // SUPER HOOK: close-up — the platform drops, a catch slams into a tooth: HELD
  c.drawImage(BG.b, 0, 0);
  const hit = ws(11), fall = 120 * pr(t, T.cut, hit, (u) => u * u), sh = t > hit ? Math.sin((t - hit) * 60) * 10 * Math.exp(-(t - hit) * 9) : 0;
  c.save(); c.translate(sh, 0);
  rail(c, 250, 520, 1480, 1, 92, 40, 70);
  const y = 760 + fall; c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 26; c.shadowOffsetY = 12; c.fillStyle = IRON; c.fillRect(340, y - 30, 420, 60); c.fillRect(650, y - 300, 60, 580); c.restore();
  const eng = pr(t, hit - 0.08, hit); c.save(); c.translate(340 - eng * 30, y); c.fillStyle = t >= hit ? '#E8C25E' : IRON_D; c.beginPath(); c.moveTo(0, -24); c.lineTo(-50, 6); c.lineTo(0, 30); c.closePath(); c.fill(); c.restore();
  spark(c, 290, y, t >= hit ? 1 - pr(t, hit, hit + 0.5) : 0, 90);
  c.restore();
  label(c, 'HELD', 560, 1330, 150, C.gold, 'Fraunces', pr(t, ws(12) - 0.05, ws(12) + 0.2, eout));
}
function scene3(c, t) { // PAGE 1 — the problem: an ordinary hoist; the rope breaks and the load falls
  c.drawImage(BG.c, 0, 0);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = WOODC; c.fillRect(226, 560, 34, 880); c.fillRect(740, 560, 34, 880); c.fillRect(206, 560, 588, 34); c.restore();
  c.save(); c.fillStyle = IRON_D; c.beginPath(); c.arc(500, 620, 30, 0, 6.283); c.fill(); c.fillStyle = IRON; c.beginPath(); c.arc(500, 620, 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(220, 1440, 560, 14); c.restore();
  const br = ws(23), fr = pr(t, ws(22) - 0.1, br, (u) => u), cy0 = 940, g = t > br ? Math.min(1, (t - br) / (ws(26) - br)) : 0, cy = cy0 + (1340 - cy0) * g * g;
  if (t < br) cable(c, 500, 650, cy0 - 70); else { const k = t - br; cable(c, 500, 650, 780 - k * 260 > 650 ? 780 - k * 260 : 652); cable(c, 500, cy - 70 - 130 + k * 40, cy - 70); }
  if (fr > 0 && t < br + 0.2) { c.save(); c.strokeStyle = '#C9B48A'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(500, 790); c.lineTo(500 + (k - 2.5) * 6 * fr, 790 + (rnd(k, 3) - 0.5) * 20 * fr); c.stroke(); } c.restore(); }
  c.save(); c.translate(500, cy); c.rotate(g * 0.06); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 26; c.shadowOffsetY = 14; c.fillStyle = '#9C7A50'; c.fillRect(-90, -70, 180, 140); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = '#6E5233'; c.lineWidth = 6; c.strokeRect(-90, -70, 180, 140); c.beginPath(); c.moveTo(-90, -70); c.lineTo(90, 70); c.moveTo(90, -70); c.lineTo(-90, 70); c.stroke(); c.restore();
  if (t > ws(26)) { const k = t - ws(26); c.save(); c.globalAlpha = Math.max(0, 0.6 - k); c.fillStyle = '#E9E1CC'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(500 + (i - 3.5) * 40 * (1 + k * 2), 1410 - k * 60 * rnd(i, 2), 22 + k * 40, 0, 6.283); c.fill(); } c.restore(); }
  label(c, 'NO BRAKE', CX, 1180, 84, C.cream, 'Fraunces', pr(t, ws(19) - 0.15, ws(19) + 0.25, eout) * (1 - pr(t, ws(22), ws(23))));
}
const HL = [0.695, 0.10, 0.285, 0.47]; // the hoist frame with platform, catches and racks on the real drawing (fractions)
function patentCard(c, t) { const w = 800, x = 100, y = 640, h = w * PAT.height / PAT.width;
  photo(c, PAT, x, y, w, -0.008, 1);
  const hl = pr(t, ws(28) - 0.2, ws(28) + 0.2, eout); if (hl > 0) { c.save(); c.globalAlpha = hl; c.strokeStyle = C.gold; c.lineWidth = 7; c.shadowColor = 'rgba(241,180,68,0.6)'; c.shadowBlur = 18; rr(c, x + w * HL[0], y + h * HL[1], w * HL[2], h * HL[3], 10); c.stroke(); c.restore(); }
  stamp(c, ['PATENT 31,128', 'JAN. 15, 1861'], CX, 1330, pr(t, T.push[1] - 0.05, T.push[1] + 0.3, eout), -0.05);
  return { x, y, w, h }; }
function scene4(c, t) { // PAGE 2 — the mechanism: the real drawing, then the catches, the spring and the toothed rails
  c.drawImage(BG.a, 0, 0);
  if (t < T.zoomIn[1]) { const zi = pr(t, T.zoomIn[0], T.zoomIn[1]); const r = { x: 100, y: 640, w: 800, h: 800 * PAT.height / PAT.width }; const fx = r.x + r.w * (HL[0] + HL[2] / 2), fy = r.y + r.h * (HL[1] + HL[3] / 2);
    c.save(); c.globalAlpha = 1 - pr(t, T.zoomIn[0] + 0.2, T.zoomIn[1]); c.translate(fx, fy); c.scale(1 + 3 * zi, 1 + 3 * zi); c.translate(-fx, -fy); patentCard(c, t); c.restore();
    if (zi <= 0) return; }
  const a = pr(t, T.zoomIn[0] + 0.15, T.zoomIn[1] + 0.1, eout); c.save(); c.globalAlpha = a;
  const snap = ws(37), eng = pr(t, ws(39) - 0.1, ws(39) + 0.15, eout), lock = ws(44), drop = 22 * pr(t, ws(39), lock, (u) => u * u), cy = 900 + drop;
  rail(c, 270, 540, 1460, 1, 56, 26, 46); rail(c, 730, 540, 1460, -1, 56, 26, 46);
  // crossbar and deck
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 20; c.shadowOffsetY = 10; c.fillStyle = IRON; c.fillRect(320, cy - 14, 360, 28); c.fillStyle = WOODC; c.fillRect(300, cy + 300, 400, 24); c.fillStyle = IRON; c.fillRect(320, cy, 14, 300); c.fillRect(666, cy, 14, 300); c.restore();
  // vertical bar F, spring, levers, catches
  const barTop = cy - 260 + (1 - eng) * -30, eye = cy - 40 + (1 - eng) * -34;
  c.save(); c.fillStyle = IRON_D; c.fillRect(492, barTop, 16, eye - barTop + 8); c.restore();
  c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; const sTop = cy - 120, sBot = eye - 6; c.beginPath(); for (let i = 0; i <= 14; i++) { const yy = lerp(sTop, sBot, i / 14); c.lineTo(500 + (i % 2 ? 22 : -22), yy); } c.stroke(); c.restore();
  for (const sd of [-1, 1]) { const px = 500 + sd * lerp(150, 205, eng), pyy = cy + 2; c.save(); c.strokeStyle = IRON_D; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(500, eye); c.lineTo(px, pyy); c.stroke(); c.restore();
    c.save(); c.translate(px, pyy); const gl = t > lock ? 1 - pr(t, lock + 0.3, lock + 1.2) : 0; if (gl > 0) { c.shadowColor = `rgba(241,180,68,${gl})`; c.shadowBlur = 26; }
    c.fillStyle = gl > 0 ? '#E8C25E' : IRON_D; c.beginPath(); c.moveTo(0, -16); c.lineTo(sd * 42, -4); c.lineTo(0, 22); c.closePath(); c.fill(); c.restore(); }
  // the rope: taut (tension arrow) until it snaps
  if (t < snap) { cable(c, 500, 540, barTop, 9); const ta = pr(t, ws(29) - 0.1, ws(30) + 0.2, eout); if (ta > 0) { c.save(); c.globalAlpha = ta; c.fillStyle = C.gold; c.beginPath(); c.moveTo(580, 600); c.lineTo(612, 650); c.lineTo(592, 650); c.lineTo(592, 740); c.lineTo(568, 740); c.lineTo(568, 650); c.lineTo(548, 650); c.closePath(); c.fill(); c.restore(); } }
  else { const k = t - snap; c.save(); c.beginPath(); c.rect(0, 540, W, H); c.clip(); cable(c, 500, 540 - k * 400, 620 - k * 400, 9); c.restore(); c.save(); c.translate(500, barTop); c.rotate(Math.sin(k * 8) * 0.3 * Math.exp(-k * 2)); cable(c, 0, -110 + Math.min(110, k * 200), 0, 9); c.restore(); spark(c, 500, 640, 1 - pr(t, snap, snap + 0.3), 60); }
  for (const sd of [-1, 1]) spark(c, 500 + sd * 205, cy, t > lock ? 1 - pr(t, lock, lock + 0.45) : 0, 56);
  c.restore();
  label(c, 'rope pulls', 630, 690, 40, C.cream, 'Mono', pr(t, ws(30) - 0.1, ws(30) + 0.2, eout) * (1 - pr(t, snap - 0.1, snap + 0.1)), 'left');
  label(c, 'spring', 560, cy - 60, 40, C.gold, 'Mono', pr(t, ws(39) - 0.1, ws(39) + 0.2, eout) * (1 - pr(t, lock + 0.4, lock + 0.7)), 'left');
  label(c, 'LOCKED', CX, 1335, 96, C.gold, 'Fraunces', pr(t, lock + 0.05, lock + 0.35, eout));
}
function crowd(c, y, t, cheer) { // original silhouettes: rows of heads and hats
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const x = 120 + i * 95 + (row % 2) * 45 + (rnd(i, row) - 0.5) * 20; if (x > 890) continue; const yy = y + row * 70, lift = cheer * (rnd(i * 3 + row, 7) > 0.4 ? 26 : 0) * Math.abs(Math.sin(t * 5 + i));
    c.save(); c.globalAlpha = 0.75 + row * 0.08; c.fillStyle = INK; c.beginPath(); c.arc(x, yy, 26, 0, 6.283); c.fill(); c.fillRect(x - 40, yy + 20, 80, 70);
    if (rnd(i, row + 9) > 0.45) { c.fillRect(x - 17, yy - 52 - lift, 34, 32); c.fillRect(x - 26, yy - 24 - lift, 52, 6); } c.restore(); } }
function scene5(c, t) { // PAGE 3 — the public test (illustration): not the elevator, the brake; New York, 1854
  c.drawImage(PAPER, 0, 0);
  c.save(); c.fillStyle = 'rgba(22,48,42,0.06)'; c.fillRect(0, 540, W, 760); c.restore();
  rail(c, 400, 560, 1250, 1, 40, 14, 26); rail(c, 600, 560, 1250, -1, 40, 14, 26);
  c.save(); c.fillStyle = IRON_D; c.fillRect(380, 548, 240, 14); c.restore();
  const cutT = ws(53) + 0.25, py = 900 + (t > cutT ? 16 * pr(t, cutT, cutT + 0.15) : 0), gl = pr(t, ws(55) - 0.15, ws(55) + 0.2) * (1 - pr(t, ws(57), ws(58) + 0.5));
  if (t < cutT) cable(c, 500, 562, py - 158); else { cable(c, 500, 562, 640 - Math.min(80, (t - cutT) * 300)); }
  platformCar(c, 500, py, 176, t > cutT ? 1 : 0, gl);
  figure(c, 500, py, 0.85);
  const ax = pr(t, cutT - 0.45, cutT, (u) => u * u); axe(c, 600, py - 280, lerp(0.9, -0.15, ax), pr(t, cutT - 0.65, cutT - 0.4) * (1 - pr(t, cutT + 0.4, cutT + 0.7)));
  crowd(c, 1270, t, pr(t, ws(58) - 0.2, ws(58) + 0.2));
  const ep = pr(t, ws(47) - 0.15, ws(47) + 0.2, eout) * (1 - pr(t, ws(51) - 0.2, ws(51)));
  const pw = bigPill(c, 'the elevator', CX, 1150, ep, 40); if (pw) strike(c, CX - pw / 2 + 14, CX + pw / 2 - 14, 1150 - 4, pr(t, ws(49) - 0.1, ws(49) + 0.2) * ep);
  bigPill(c, 'his invention: the brake', CX, 1150, pr(t, ws(55) - 0.1, ws(55) + 0.25, eout), 40, 'rgba(201,138,34,0.95)', C.paper);
  stamp(c, ['NEW YORK', '1854'], 795, 690, pr(t, ws(51) - 0.1, ws(51) + 0.3, eout), 0.06);
}
function icon3(c, kind, x, y, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y);
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = C.paper; c.beginPath(); c.arc(0, 0, 100, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = C.goldDeep; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, 88, 0, 6.283); c.stroke();
  if (kind === 0) { c.fillStyle = WOODC; c.fillRect(-46, -60, 26, 120); c.fillStyle = IRON; for (let k = 0; k < 4; k++) { const yy = -56 + k * 30; c.beginPath(); c.moveTo(-20, yy + 30); c.lineTo(-6, yy + 4); c.lineTo(-20, yy); c.closePath(); c.fill(); }
    c.fillStyle = '#E8C25E'; c.beginPath(); c.moveTo(40, -8); c.lineTo(-4, 4); c.lineTo(40, 18); c.closePath(); c.fill(); c.fillStyle = IRON_D; c.fillRect(40, -12, 24, 34); }
  if (kind === 1) { c.fillStyle = INK; c.beginPath(); c.moveTo(-60, 0); c.quadraticCurveTo(0, -56, 60, 0); c.quadraticCurveTo(0, 56, -60, 0); c.closePath(); c.fill(); c.fillStyle = C.paper; c.beginPath(); c.arc(0, 0, 22, 0, 6.283); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 11, 0, 6.283); c.fill(); }
  if (kind === 2) { for (const [dx, s] of [[-36, 0.75], [0, 0.9], [36, 0.75]]) { c.fillStyle = INK; c.beginPath(); c.arc(dx, -22 * s, 15 * s, 0, 6.283); c.fill(); rr(c, dx - 20 * s, -4 * s, 40 * s, 48 * s, 12 * s); c.fill(); }
    c.fillStyle = C.goldDeep; c.beginPath(); c.moveTo(0, -84); c.lineTo(16, -60); c.lineTo(-16, -60); c.closePath(); c.fill(); }
  c.restore(); }
function scene6(c, t) { // PAYOFF: invention -> a test people can see -> demand
  const IY = 1150; c.drawImage(BG.a, 0, 0);
  photo(c, POR, 380, 560, 240, -0.02, pr(t, T.push2[0], T.push2[0] + 0.25, eout));
  label(c, 'ELISHA OTIS · 1811–1861', CX, 930, 34, C.gold, 'Mono', pr(t, T.push2[0] + 0.1, T.push2[1] + 0.1, eout));
  const a1 = pr(t, ws(61) - 0.2, ws(62), eout), a2 = pr(t, ws(66) - 0.2, ws(67), eout), a3 = pr(t, ws(70) - 0.2, ws(71), eout);
  const ar = (x0, x1, a) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.gold; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, IY); c.lineTo(lerp(x0, x1, a), IY); c.stroke();
    c.fillStyle = C.gold; c.beginPath(); c.moveTo(lerp(x0, x1, a) + 14, IY); c.lineTo(lerp(x0, x1, a) - 6, IY - 14); c.lineTo(lerp(x0, x1, a) - 6, IY + 14); c.closePath(); c.fill(); c.restore(); };
  icon3(c, 0, 205, IY, a1); ar(312, 382, a2); icon3(c, 1, 500, IY, a2); ar(607, 677, a3); icon3(c, 2, 795, IY, a3);
  label(c, 'invention', 205, 1310, 38, C.cream, 'InterX', a1); label(c, 'a visible test', 500, 1310, 38, C.cream, 'InterX', a2); label(c, 'demand', 795, 1310, 38, C.cream, 'InterX', a3);
}
function scene7(c, t) { // CTA (verified Aarambh listing line)
  c.drawImage(BG.a, 0, 0); const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.5 + 0.5 * a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.drawImage(icon, CX - 150, 600, 300, 300); c.restore();
  label(c, 'Download Aarambh', CX, 1060, 76, C.cream); label(c, 'to support livelihood tools', CX, 1134, 42, C.gold, 'InterX');
  label(c, 'Fund verified livelihood tools', CX, 1250, 32, 'rgba(251,247,238,0.85)', 'InterB'); label(c, 'and follow their impact.', CX, 1292, 32, 'rgba(251,247,238,0.85)', 'InterB');
  label(c, 'Get it on Google Play', CX, 1400, 28, 'rgba(251,247,238,0.65)', 'Mono');
}
const bufA = createCanvas(W, H), bufB = createCanvas(W, H);
function render(c, t) {
  const at = (fn, buf) => { const x = buf.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; fn(x, t); return buf; };
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) { const e = eio((t - T.whip[0]) / (T.whip[1] - T.whip[0])); const a = at(scene2, bufA), b = at(scene3, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; return; }
  if (t < T.push[0]) return scene3(c, t);
  if (t < T.push[1]) { const e = eio((t - T.push[0]) / (T.push[1] - T.push[0])); const a = at(scene3, bufA), b = at(scene4, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); return; }
  if (t < T.turn[0]) return scene4(c, t);
  if (t < T.turn[1]) { const u = (t - T.turn[0]) / (T.turn[1] - T.turn[0]), e = eio(u); const a = at(scene4, bufA), b = at(scene5, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } return; }
  if (t < T.push2[0]) return scene5(c, t);
  if (t < T.push2[1]) { const e = eio((t - T.push2[0]) / (T.push2[1] - T.push2[0])); const a = at(scene5, bufA), b = at(scene6, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); return; }
  if (t < T.cta[0]) return scene6(c, t);
  if (t < T.cta[1]) { const e = eio((t - T.cta[0]) / (T.cta[1] - T.cta[0])); const a = at(scene6, bufA), b = at(scene7, bufB);
    c.save(); c.translate(-W * e, 0); c.drawImage(a, 0, 0); c.restore(); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, W * (1 - e), 0); c.restore(); return; }
  return scene7(c, t);
}
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; render(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  const flick = t < 0.3 ? (t < 0.06 ? 0.4 : t < 0.12 ? 1 : pr(t, 0.12, 0.3)) : 1;
  if (flick < 0.999) { ctx.fillStyle = `rgba(1,19,15,${(1 - flick) * 0.75})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.4 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate centred at x = 500, <= 800 px wide (x 100..900), y 330..490; Inter 800 54 px
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(800, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 60);
    rr(ctx, CX - bw / 2, 330, bw, 160, 18); ctx.fillStyle = 'rgba(2,28,22,0.9)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(CX - bw / 2 + 18, 486, bw - 36, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, CX, (cw.lines.length === 1 ? 430 : 398) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.75)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawThumb(c) { // separate vertical thumbnail tied to the hook: real portrait + a platform whose cable is being cut + "CUT THE CABLE"
  c.drawImage(BG.a, 0, 0);
  const g = c.createRadialGradient(CX, 760, 50, CX, 760, 700); g.addColorStop(0, 'rgba(241,180,68,0.2)'); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  photo(c, POR, 120, 330, 360, -0.03, 1);
  rail(c, 590, 300, 1060, 1); rail(c, 830, 300, 1060, -1); c.save(); c.fillStyle = IRON_D; c.fillRect(570, 288, 280, 16); c.restore();
  cable(c, 710, 304, 560); cable(c, 710, 640, 742); platformCar(c, 710, 900, 240, 0, 0); figure(c, 700, 900, 0.9);
  axe(c, 800, 560, -0.1, 1); spark(c, 712, 600, 1, 70);
  label(c, 'CUT THE', CX, 1220, 120, C.cream, 'InterX'); label(c, 'CABLE', CX, 1360, 140, C.gold, 'InterX');
  c.save(); c.font = '800 38px Fraunces'; c.fillStyle = 'rgba(251,247,238,0.85)'; c.textAlign = 'left'; const mw = c.measureText('Aarambh').width; c.fillText('Aarambh', CX - mw / 2 + 16, 1460);
  const sx = CX - mw / 2 - 10; c.fillStyle = C.gold; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 4.5 : 14; c.lineTo(sx + Math.cos(a) * r, 1448 + Math.sin(a) * r); } c.fill(); c.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, rise: [0.05, 2.7], axe: ws(10) - 0.55, cutCable: ws(10), catch1: ws(10) + 0.1, held: ws(11), heldLabel: ws(12) - 0.05, whip: T.whip,
    flaw: ws(19) - 0.15, fray: ws(22) - 0.1, snap1: ws(23), crash: ws(26), push: T.push, stamp: T.push[1] - 0.05, hl: ws(28) - 0.2, zoomIn: T.zoomIn,
    tension: ws(30) - 0.1, snap2: ws(37), spring: ws(39) - 0.1, lock: ws(44), turn: T.turn, strike: ws(49) - 0.1, stamp2: ws(51) - 0.1, axe2: ws(53) + 0.25 - 0.45, cut2: ws(53) + 0.25,
    brake: ws(55) - 0.1, cheer: ws(58) - 0.2, push2: T.push2, chain: [ws(61) - 0.2, ws(66) - 0.2, ws(70) - 0.2], cta: T.cta };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--thumb')) {
  const cv = createCanvas(W, H); drawThumb(cv.getContext('2d')); writeFileSync(path.resolve(ROOT, arg('--thumb')), cv.toBuffer('image/png')); console.log('thumb written');
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.5,2.4,4.5,5.6,7,9,11,13,13.9,15.2,16.4,18,20.5,22.8,24.2,25.8,28.5').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
