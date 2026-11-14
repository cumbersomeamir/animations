// Aarambh english-14 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25):
// one visual idea per scene, large brief labels, no on-screen source footers, spotlit desk with depth, captions inside x 100..900 (plate centred at x = 500),
// motivated transitions (hard cut, whip, page turn, push, push, CTA slide).
// Story: Emily Warren Roebling and the Brooklyn Bridge — the chief engineer could not visit the site for 11 years -> how did his plans reach the builders?
// -> the bends in the pressurized caissons (real 1867 caisson section) -> he dictated, she wrote it down and carried it to the assistant engineers
// -> she learned the engineering; on site she was treated like the chief engineer -> lesson: to translate expert knowledge, learn enough to answer the next question.
// Archival objects: Brooklyn Museum portraits of Emily Warren Roebling (Carolus-Duran, 1896) and Washington A. Roebling (Chartran, c. 1899), both PD-Art;
// "N.Y. Caisson, transverse section" drawing, 1867 (RPI archives, PD-US-expired); "The great East River suspension bridge", 1883 lithograph (Library of Congress pga.09027).
// Everything else (window, tower, paths, note, figures, icons) is original illustration.
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
  [0, 4, ["The Brooklyn Bridge's", 'chief engineer']],
  [5, 10, ["couldn't visit it", 'for 11 years.']],
  [11, 18, ['So how did his plans', 'reach the builders?']],
  [19, 23, ['Washington Roebling', 'got the bends']],
  [24, 29, ['in pressurized caissons', 'under the river.']],
  [30, 33, ['He dictated from home;']],
  [34, 39, ['his wife, Emily,', 'wrote it down']],
  [40, 46, ['and carried it to the', 'assistant engineers.']],
  [47, 50, ['She learned', 'the engineering;']],
  [51, 59, ['on site, she was treated', 'like the chief engineer.']],
  [60, 64, ['Lesson: to translate', 'expert knowledge,']],
  [65, 71, ['learn enough to answer', 'the next question.']],
  [72, 77, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 19: SENT[2].start, 30: SENT[3].start, 47: SENT[4].start, 60: SENT[5].start, 72: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                   // hard cut on "So how"
  whip: [SENT[2].start - 0.2, SENT[2].start],    // whip pan to the real caisson drawing
  turn: [SENT[3].start - 0.35, SENT[3].start],   // page turn to the relay page
  push: [SENT[4].start - 0.25, SENT[4].start],   // push to Emily on site
  push2: [SENT[5].start - 0.3, SENT[5].start],   // push to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const EMILY = await loadImage(path.join(ROOT, 'assets/emily-warren-roebling-carolus-duran-1896-pd.jpg'));
const WASH = await loadImage(path.join(ROOT, 'assets/washington-roebling-chartran-1899-pd.jpg'));
const CAIS = await loadImage(path.join(ROOT, 'assets/ny-caisson-transverse-section-1867-pd.jpg'));
const BRIDGE = await loadImage(path.join(ROOT, 'assets/east-river-bridge-1883-loc-pga09027.jpg'));
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
// ---------- Roebling primitives (original illustration) ----------
const INK = '#16302A', STONE = '#C9BFA6', STONE_D = '#8E836A';
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function bigPill(c, text, x, y, a, size = 40, bg = 'rgba(2,28,22,0.92)', fg = C.cream) { if (a <= 0) return 0; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 44;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6; c.fillStyle = bg; rr(c, x - w / 2, y - size * 0.95, w, size * 1.9, 16); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = fg; c.textAlign = 'center'; c.fillText(text, x, y + size * 0.35); c.restore(); return w; }
function tower(c, x, yb, h, a = 1, col = STONE) { // Brooklyn-Bridge-style masonry tower (two pointed arches), base centre (x, yb)
  if (a <= 0) return; const w = h * 0.42; c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 14;
  c.fillStyle = col; c.fillRect(x - w / 2, yb - h, w, h); c.fillRect(x - w / 2 - 8, yb - h - 14, w + 16, 18); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = 'rgba(2,28,22,0.85)'; for (const dx of [-w * 0.22, w * 0.22]) { const aw = w * 0.26, ab = yb - h * 0.22, at = yb - h * 0.72; c.beginPath(); c.moveTo(x + dx - aw / 2, ab); c.lineTo(x + dx - aw / 2, at + aw * 0.6); c.quadraticCurveTo(x + dx - aw / 2, at, x + dx, at - aw * 0.25); c.quadraticCurveTo(x + dx + aw / 2, at, x + dx + aw / 2, at + aw * 0.6); c.lineTo(x + dx + aw / 2, ab); c.closePath(); c.fill(); }
  c.strokeStyle = STONE_D; c.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = yb - h * k / 6; c.beginPath(); c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); c.stroke(); } c.restore(); }
function cables(c, x, yTop, len, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(232,222,196,0.75)'; c.lineWidth = 4;
  for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(x, yTop); c.quadraticCurveTo(x + sd * len * 0.5, yTop + len * 0.55, x + sd * len, yTop + len * 0.35); c.stroke(); } c.restore(); }
function windowIcon(c, x, y, s, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  const g = c.createRadialGradient(0, 0, 10, 0, 0, 160); g.addColorStop(0, 'rgba(255,214,140,0.55)'); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.fillRect(-170, -170, 340, 340);
  c.fillStyle = '#F6D79A'; rr(c, -90, -110, 180, 220, 10); c.fill(); c.strokeStyle = '#5A4630'; c.lineWidth = 12; rr(c, -90, -110, 180, 220, 10); c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(0, -110); c.lineTo(0, 110); c.moveTo(-90, 0); c.lineTo(90, 0); c.stroke();
  c.fillStyle = INK; c.beginPath(); c.arc(-36, 40, 16, 0, 6.283); c.fill(); rr(c, -58, 58, 44, 52, 10); c.fill(); c.restore(); }
function note(c, x, y, w, h, prog, rot = 0, a = 1, fold = 0) { // a paper note; prog 0..1 writes four handwriting lines
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(1, 1 - 0.75 * fold);
  c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = '#FFFDF6'; rr(c, -w / 2, -h / 2, w, h, 8); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(30,50,80,0.85)'; c.lineWidth = 3.5; c.lineCap = 'round';
  for (let k = 0; k < 4; k++) { const lp = clamp(prog * 4 - k); if (lp <= 0) continue; const y0 = -h / 2 + 40 + k * (h - 70) / 3, x0 = -w / 2 + 26, x1 = lerp(x0, w / 2 - 26 - (k === 3 ? w * 0.3 : 0), lp);
    c.beginPath(); for (let xx = x0; xx <= x1; xx += 4) { const yy = y0 + Math.sin(xx * 0.22 + k) * 4 + Math.sin(xx * 0.07) * 2; xx === x0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke(); }
  c.restore(); }
function person(c, x, y, s = 1, col = INK) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.arc(0, -96, 16, 0, 6.283); c.fill(); rr(c, -20, -78, 40, 62, 12); c.fill(); c.fillRect(-16, -20, 12, 20); c.fillRect(4, -20, 12, 20);
  c.fillRect(-17, -126, 34, 18); c.fillRect(-24, -112, 48, 5); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { // crop a circle around (fx, fy) (fractions) with radius fr (fraction of width)
  if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
function check(c, x, y, s, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#7FD39A'; c.lineWidth = 12; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - s, y); c.lineTo(x - s * 0.25, y + s * 0.7); c.lineTo(x + s, y - s * 0.75); c.stroke(); c.restore(); }
const qpt = (x0, y0, x1, y1, bend, u) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + bend, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; return [a * x0 + b * mx + d * x1, a * y0 + b * my + d * y1]; };
function dashPath(c, x0, y0, x1, y1, bend, prog, a = 1, t = 0) { if (a <= 0 || prog <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.setLineDash([18, 14]); c.lineDashOffset = -t * 60;
  c.beginPath(); for (let i = 0; i <= 60 * prog; i++) { const [x, y] = qpt(x0, y0, x1, y1, bend, i / 60); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); }

// ---------- scenes (each draws the full frame; t is global time) ----------
function scene1(c, t) { // HOOK: the finished bridge (real 1883 print) and its chief engineer (real portrait at his window); "11 YEARS"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.06, 1.0, pr(t, 0, 1.6, eout)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const pa = pr(t, 0, 0.45, eout); photo(c, BRIDGE, 150, 545 + (1 - pa) * 30, 700, -0.012, pa, pr(t, 0.2, 1.3, (u) => u));
  const wa = pr(t, ws(3) - 0.4, ws(3), eout); photo(c, WASH, 110, 990 + (1 - wa) * 60, 260, 0.03, wa);
  label(c, 'CHIEF ENGINEER', 650, 1140, 38, C.gold, 'Mono', pr(t, ws(3) - 0.1, ws(3) + 0.3, eout));
  label(c, '11 YEARS', 650, 1290, 104, C.cream, 'Fraunces', pr(t, ws(9) - 0.15, ws(9) + 0.25, eout));
  label(c, 'away from the site', 650, 1356, 32, C.cream, 'Mono', pr(t, ws(9) + 0.1, ws(9) + 0.5, eout));
  c.restore();
}
function scene2(c, t) { // SUPER HOOK: how did his plans reach the builders? a lit window, a tower, a path with a question travelling along it
  c.drawImage(BG.b, 0, 0);
  const u = t - T.cut;
  windowIcon(c, 230, 700, 1, pr(t, T.cut, T.cut + 0.3, eout));
  tower(c, 770, 1420, 500, pr(t, T.cut + 0.15, T.cut + 0.5, eout)); cables(c, 770, 920, 260, pr(t, T.cut + 0.3, T.cut + 0.7, eout));
  const pp = pr(t, ws(15) - 0.3, ws(16) + 0.2); dashPath(c, 310, 780, 690, 1150, -160, pp, 1, t);
  const mu = pr(t, ws(15) - 0.2, ws(18), eout); if (mu > 0) { const [nx, ny] = qpt(310, 780, 690, 1150, -160, mu * 0.55); note(c, nx, ny, 110, 80, 1, -0.1, 1, 0); }
  label(c, '?', 330, 1320, 230, C.gold, 'Fraunces', pr(t, ws(18) - 0.3, ws(18), eout) * (0.85 + 0.15 * Math.sin(u * 8)));
}
const CH = [0.12, 0.81, 0.89, 0.90]; // working chamber on the real 1867 drawing (fractions: x0, y0, x1, y1)
function scene3(c, t) { // PROOF 1: the real 1867 caisson section; push into the pressurized working chamber; THE BENDS
  c.drawImage(BG.c, 0, 0);
  const r = { x: 100, y: 560, w: 800 }; r.h = r.w * CAIS.height / CAIS.width;
  const fx = r.x + r.w * 0.5, fy = r.y + r.h * 0.86, z = lerp(1.0, 1.2, pr(t, T.whip[1], ws(29), eio));
  c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy);
  photo(c, CAIS, r.x, r.y, r.w, 0, 1, pr(t, T.whip[1], T.whip[1] + 1.2, (u) => u));
  const x0 = r.x + r.w * CH[0], y0 = r.y + r.h * CH[1], x1 = r.x + r.w * CH[2], y1 = r.y + r.h * CH[3];
  const pz = pr(t, ws(25) - 0.2, ws(25) + 0.4), pulse_ = 0.65 + 0.35 * Math.sin(t * 7);
  if (pz > 0) { c.save(); c.globalAlpha = pz * pulse_ * 0.8; const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, 'rgba(230,90,50,0.2)'); g.addColorStop(1, 'rgba(230,90,50,0.85)'); c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.restore();
    for (let k = 0; k < 9; k++) { const ph = (t * 0.55 + k / 9) % 1, bx = r.x + r.w * 0.5 + Math.sin(ph * 9 + k) * 8, by = lerp(y0, r.y + r.h * 0.12, ph);
      c.save(); c.globalAlpha = pz * (1 - ph); c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(bx, by, 5 + 5 * (1 - ph), 0, 6.283); c.stroke(); c.restore(); } }
  for (let k = 0; k < 4; k++) { const px = lerp(x0 + 60, x1 - 60, (k + 0.5) / 4), bob = Math.sin(t * 3 + k * 1.7) * 2; person(c, px + (k % 2 ? 20 : 0), y1 - 4 + bob, 0.32, `rgba(22,48,42,${0.85 * pr(t, T.whip[1], T.whip[1] + 0.5)})`); }
  c.restore();
  label(c, 'THE BENDS', CX, 1400, 110, C.cream, 'Fraunces', pr(t, ws(23) - 0.15, ws(23) + 0.25, eout));
  label(c, 'pressurized', CX, 1470, 36, '#F2A07D', 'Mono', pr(t, ws(25) - 0.1, ws(25) + 0.3, eout));
}
function scene4(c, t) { // PROOF 2: the relay — he dictates, she writes it down and carries it to the assistant engineers
  c.drawImage(PAPER, 0, 0);
  photo(c, WASH, 90, 560, 240, -0.03, 1);
  const da = pr(t, ws(31) - 0.2, ws(31) + 0.2) * (1 - pr(t, ws(34), ws(35)));
  for (let k = 0; k < 4; k++) { const ph = (t * 1.3 + k / 4) % 1; c.save(); c.globalAlpha = da * (1 - ph); c.strokeStyle = C.goldDeep; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(360, 740, 30 + ph * 170, -0.45, 0.45); c.stroke(); c.restore(); }
  const ea = pr(t, ws(35) - 0.35, ws(35), eout); photo(c, EMILY, 660, 520 + (1 - ea) * 50, 230, 0.03, ea);
  label(c, 'EMILY WARREN ROEBLING', CX, 1040, 34, C.goldDeep, 'Mono', pr(t, ws(36) - 0.1, ws(36) + 0.3, eout));
  const wr = pr(t, ws(37) - 0.15, ws(39) + 0.25, (u) => u), ca = pr(t, ws(41) - 0.2, ws(46) + 0.1, eio), fo = pr(t, ws(40) - 0.1, ws(41));
  const [nx, ny] = qpt(330, 1220, 760, 1380, -200, ca);
  tower(c, 790, 1470, 330, pr(t, ws(40) - 0.4, ws(40), eout));
  for (let k = 0; k < 3; k++) person(c, 680 + k * 60, 1490, 0.62, `rgba(22,48,42,${pr(t, ws(44) - 0.4, ws(45), eout)})`);
  dashPath(c, 330, 1220, 760, 1380, -200, ca, 0.8, t);
  if (wr > 0) note(c, nx, ny, lerp(300, 120, ca), lerp(210, 84, ca), wr, lerp(-0.04, 0.2, ca), pr(t, ws(37) - 0.4, ws(37) - 0.1), fo * 0.3);
  glowDot(c, 760, 1380, t > ws(46) ? 1 - pr(t, ws(46), ws(46) + 0.6) : 0, 70);
}
function scene5(c, t) { // PROOF 3: she learned the engineering; on site she was treated like the chief engineer
  c.drawImage(BG.a, 0, 0);
  const ea = pr(t, T.push[1], T.push[1] + 0.3, eout); photo(c, EMILY, 100, 540, 380, -0.02, 1);
  const st = pr(t, ws(48) - 0.2, ws(50), eout), go = pr(t, ws(51) - 0.2, ws(52), eio);
  const sb = pr(t, ws(49) - 0.1, ws(50) + 0.1, eout); c.save(); c.translate(go * 400, 0);
  photo(c, CAIS, 560, 600 + (1 - st) * 120, 330, 0.06 * st, st * (1 - go)); photo(c, BRIDGE, 540, 860 + (1 - sb) * 120, 360, -0.05, sb * (1 - go)); c.restore();
  const tw = pr(t, ws(51) - 0.1, ws(52) + 0.3, eout); tower(c, 730, 1480 + (1 - tw) * 300, 560, tw); cables(c, 730, 920 + (1 - tw) * 300, 200, tw);
  const tg = pr(t, ws(55) - 0.15, ws(58) + 0.1, eout);
  if (tg > 0) { c.save(); c.globalAlpha = tg; c.translate(690, 1110 + (1 - tg) * -40); c.rotate(0.04 * (1 - tg)); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
    c.fillStyle = 'rgba(2,28,22,0.96)'; rr(c, -200, -74, 400, 148, 16); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = C.gold; c.lineWidth = 4; rr(c, -200, -74, 400, 148, 16); c.stroke();
    c.textAlign = 'center'; c.fillStyle = C.cream; c.font = '700 30px Mono'; c.fillText('treated like the', 0, -18); c.fillStyle = C.gold; c.font = '800 44px Mono'; c.fillText('CHIEF ENGINEER', 0, 40); c.restore(); }
}
function scene6(c, t) { // PAYOFF: expert -> translator -> builders; the next question is answered by the translator
  c.drawImage(BG.b, 0, 0);
  const A = [200, 880], B = [500, 880], Cc = [800, 880];
  const a0 = pr(t, T.push2[0], T.push2[1] + 0.2, eout);
  circlePortrait(c, WASH, 0.59, 0.24, 0.13, A[0], A[1], 105, a0 * (1 - 0.45 * pr(t, ws(66), ws(67)))); circlePortrait(c, EMILY, 0.48, 0.21, 0.1, B[0], B[1], 105, a0);
  for (let k = 0; k < 3; k++) person(c, Cc[0] - 50 + k * 50, Cc[1] + 70, 0.9, `rgba(232,222,196,${a0})`);
  const la = pr(t, ws(62) - 0.2, ws(63) + 0.2, eout);
  label(c, 'expert', A[0], 1060, 38, C.cream, 'InterX', la); label(c, 'translator', B[0], 1060, 38, C.gold, 'InterX', la); label(c, 'builders', Cc[0], 1060, 38, C.cream, 'InterX', la);
  const f1 = pr(t, ws(62) - 0.2, ws(63) + 0.3), f2 = pr(t, ws(63) + 0.1, ws(64) + 0.3);
  if (f1 > 0 && f1 < 1) glowDot(c, lerp(A[0] + 115, B[0] - 115, f1), A[1] - 140 + Math.sin(f1 * Math.PI) * -40, 1, 34);
  if (f2 > 0 && f2 < 1) glowDot(c, lerp(B[0] + 115, Cc[0] - 90, f2), A[1] - 140 + Math.sin(f2 * Math.PI) * -40, 1, 34);
  const q = pr(t, ws(66) - 0.1, ws(68), eio);
  if (q > 0 && q < 1) label(c, '?', lerp(Cc[0] - 40, B[0] + 80, q), 1180 + Math.sin(q * Math.PI) * 40, 90, C.gold, 'Fraunces', 1);
  const ans = pr(t, ws(68) + 0.05, ws(70), eio);
  if (ans > 0 && ans < 1) check(c, lerp(B[0] + 80, Cc[0] - 40, ans), 1160 - Math.sin(ans * Math.PI) * 40, 30, 1);
  if (t >= ws(70)) check(c, Cc[0], 1160, 30, 1 - pr(t, ws(70) + 0.6, ws(70) + 1.0));
  label(c, 'answer the next question', CX, 1360, 60, C.cream, 'Fraunces', pr(t, ws(70) - 0.1, ws(70) + 0.3, eout));
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
  const push = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); };
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) { const e = eio((t - T.whip[0]) / (T.whip[1] - T.whip[0])); const a = at(scene2, bufA), b = at(scene3, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; return; }
  if (t < T.turn[0]) return scene3(c, t);
  if (t < T.turn[1]) { const u = (t - T.turn[0]) / (T.turn[1] - T.turn[0]), e = eio(u); const a = at(scene3, bufA), b = at(scene4, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } return; }
  if (t < T.push[0]) return scene4(c, t);
  if (t < T.push[1]) return push(scene4, scene5, T.push[0], T.push[1]);
  if (t < T.push2[0]) return scene5(c, t);
  if (t < T.push2[1]) return push(scene5, scene6, T.push2[0], T.push2[1]);
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
function drawThumb(c) { // separate vertical thumbnail tied to the hook question ("how did his plans reach the builders?"): real portrait + 1883 bridge + "SHE CARRIED THE PLANS"
  c.drawImage(BG.a, 0, 0);
  const g = c.createRadialGradient(CX, 700, 50, CX, 700, 700); g.addColorStop(0, 'rgba(241,180,68,0.2)'); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.55; photo(c, BRIDGE, 90, 300, 820, -0.02, 1); c.restore();
  photo(c, EMILY, 330, 420, 340, 0.02, 1);
  note(c, 760, 900, 190, 130, 1, 0.12, 1, 0); glowDot(c, 760, 900, 0.6, 120);
  label(c, 'SHE CARRIED', CX, 1220, 100, C.cream, 'InterX'); label(c, 'THE PLANS', CX, 1350, 120, C.gold, 'InterX');
  c.save(); c.font = '800 38px Fraunces'; c.fillStyle = 'rgba(251,247,238,0.85)'; c.textAlign = 'left'; const mw = c.measureText('Aarambh').width; c.fillText('Aarambh', CX - mw / 2 + 16, 1460);
  const sx = CX - mw / 2 - 10; c.fillStyle = C.gold; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 4.5 : 14; c.lineTo(sx + Math.cos(a) * r, 1448 + Math.sin(a) * r); } c.fill(); c.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, print: 0.0, wash: ws(3) - 0.4, chief: ws(3) - 0.1, years: ws(9) - 0.15, cut: T.cut, window: T.cut, tower: T.cut + 0.15, path: [ws(15) - 0.3, ws(16) + 0.2], q: ws(18) - 0.3,
    whip: T.whip, bends: ws(23) - 0.15, pressure: [ws(25) - 0.2, T.turn[0]], turn: T.turn, dictate: [ws(31) - 0.2, ws(35)], emily: ws(35) - 0.35, name: ws(36) - 0.1,
    write: [ws(37) - 0.15, ws(39) + 0.25], carry: [ws(41) - 0.2, ws(46) + 0.1], land: ws(46), push: T.push, pages: [ws(48) - 0.2, ws(49) - 0.1], tower2: ws(51) - 0.1, tag: ws(55) - 0.15,
    push2: T.push2, flow: [ws(62) - 0.2, ws(63) + 0.1], qback: ws(66) - 0.1, answer: ws(68) + 0.05, done: ws(70), payoff: ws(70) - 0.1, cta: T.cta };
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
