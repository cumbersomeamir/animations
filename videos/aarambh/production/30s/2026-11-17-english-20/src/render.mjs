// Aarambh english-20 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25), the 2026-11-15
// first-frame addendum and the 2026-11-17 feedback (less text at once, more appealing motion, a striking thumbnail): frame 0 = real 1915 portrait + a glowing drop of oil
// on a syringe needle + "HER METHOD. HIS NAME." (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: Alice Ball made a leprosy oil (chaulmoogra) usable, then lost the credit -> swallowed it caused nausea; injected it hurt and barely absorbed
// -> she turned its fatty acids into ethyl esters, thin oils the body absorbs -> she died at 24; her supervisor published without crediting her
// -> a 1922 paper (Hollmann) called it Ball's Method -> lesson: a remedy only helps if patients can take it.
// Archival objects (public domain): Alice Ball, photograph 1915; H. T. Hollmann, Archives of Dermatology and Syphilology 1922, p. 95.
// Drop, syringe, spoon, tissue layers, molecules, pages, plates and cards are original illustration.
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
  [0, 3, ['At 23, Alice Ball']],
  [4, 8, ['made a leprosy', 'oil usable,']],
  [9, 12, ['then lost the credit.']],
  [13, 16, ['Swallowed, it', 'caused nausea;']],
  [17, 22, ['injected, it hurt', 'and barely absorbed.']],
  [23, 30, ['She turned its fatty', 'acids into ethyl esters:']],
  [31, 35, ['thin oils the', 'body absorbs.']],
  [36, 39, ['She died at 24;']],
  [40, 44, ['her supervisor', 'published the work']],
  [45, 47, ['without crediting her.']],
  [48, 54, ['A 1922 paper called', "it Ball's Method."]],
  [55, 59, ['Lesson: a remedy', 'only helps']],
  [60, 64, ['if patients', 'can take it.']],
  [65, 70, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 13: SENT[1].start, 23: SENT[2].start, 36: SENT[3].start, 48: SENT[4].start, 55: SENT[5].start, 65: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                      // hard cut on "Swallowed…" -> the thick oil (the obstacle)
  whip: [SENT[2].start - 0.2, SENT[2].start],     // whip pan to the chemistry: fatty acids -> ethyl esters
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05], // push to the credit: her portrait and name
  push2: [SENT[4].start - 0.3, SENT[4].start],    // push to Hollmann's real 1922 page: "Ball's Method"
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/alice-ball-1915-pd-2x-lanczos.jpg')); // 2x Lanczos of the 269x381 original (no added detail)
const PAGE = await loadImage(path.join(ROOT, 'assets/hollmann-1922-archives-of-dermatology-p95-pd.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PAGEC = crop(PAGE, 0.17, 0.263, 0.84, 0.436); // "…I interested Miss Alice Ball, M.S. … Miss Ball solved the problem … BALL'S METHOD OF MAKING ETHYL ESTERS…"
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
// ---------- primitives (original illustration) ----------
const INK = '#16302A', BLUEW = '#8FB4C9', REDW = '#E7A9A0', GREYW = '#6E6A66';
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function stamp(c, lines, x, y, a, rot = -0.06, col = C.goldDeep, bg = null) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; return c.measureText(l).width; })) + 48, h = 30 + lines.length * 50;
  if (bg) { c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); } c.strokeStyle = col; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; c.fillText(l, 0, -h / 2 + 58 + i * 48); }); c.restore(); }
function chip(c, col, text, x, y, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = '800 38px InterX'; const w = c.measureText(text).width; const x0 = x - (w + 70) / 2;
  c.fillStyle = 'rgba(2,28,22,0.9)'; rr(c, x0 - 18, y - 44, w + 106, 66, 16); c.fill(); c.fillStyle = col; rr(c, x0, y - 30, 40, 40, 8); c.fill(); c.fillStyle = C.cream; c.textAlign = 'left'; c.fillText(text, x0 + 60, y + 2); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
const AMBER = [232, 160, 40], TEAL = '#5FC4B8';
function droplet(c, x, y, r, t, a = 1) { // a glowing drop of amber oil (illustration)
  if (a <= 0) return; const wob = 1 + 0.03 * Math.sin(t * 3.1), rx = r * wob, ry = r * (2 - wob);
  c.save(); c.globalAlpha = a;
  c.save(); c.globalCompositeOperation = 'lighter'; const halo = c.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6); halo.addColorStop(0, 'rgba(241,170,50,0.35)'); halo.addColorStop(1, 'rgba(241,170,50,0)'); c.fillStyle = halo; c.beginPath(); c.arc(x, y, r * 2.6, 0, 6.283); c.fill(); c.restore();
  c.beginPath(); c.moveTo(x, y - ry * 1.55); c.bezierCurveTo(x + rx * 0.35, y - ry * 1.1, x + rx, y - ry * 0.35, x + rx, y + ry * 0.15); c.arc(x, y + ry * 0.15, rx, 0, Math.PI, false); c.bezierCurveTo(x - rx, y - ry * 0.35, x - rx * 0.35, y - ry * 1.1, x, y - ry * 1.55); c.closePath();
  const g = c.createRadialGradient(x - rx * 0.3, y - ry * 0.2, r * 0.1, x, y + ry * 0.2, r * 1.3); g.addColorStop(0, '#FFE7A8'); g.addColorStop(0.35, '#F2B347'); g.addColorStop(0.8, '#B8741A'); g.addColorStop(1, '#7A4708');
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = g; c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.clip(); c.globalCompositeOperation = 'screen'; for (let k = 0; k < 3; k++) { const ang = t * (0.6 + 0.2 * k) + k * 2.1, cx = x + Math.cos(ang) * rx * 0.35, cy = y + ry * 0.2 + Math.sin(ang) * ry * 0.3; const cg = c.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5); cg.addColorStop(0, 'rgba(255,240,190,0.5)'); cg.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = cg; c.fillRect(x - rx, y - ry * 1.6, rx * 2, ry * 3); } c.restore();
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(x - rx * 0.42, y - ry * 0.05, rx * 0.13, ry * 0.26, -0.4, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(x + rx * 0.35, y + ry * 0.55, rx * 0.18, ry * 0.07, -0.3, 0, 6.283); c.fill();
  c.restore(); }
function syringe(c, x, y, s, ang, fill = 0.7, plunge = 0, a = 1) { // glass syringe pointing along ang (radians); (x, y) = needle tip
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(ang);
  c.strokeStyle = '#D8E2DE'; c.lineWidth = 4 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-150 * s, 0); c.stroke();               // needle
  c.fillStyle = '#C9D3CF'; rr(c, -175 * s, -12 * s, 30 * s, 24 * s, 5 * s); c.fill();                                                                  // hub
  const bx = -175 * s, bw = 300 * s, bh = 76 * s; c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = 'rgba(220,240,232,0.16)'; rr(c, bx - bw, -bh / 2, bw, bh, 12 * s); c.fill(); c.restore();
  const fw = bw * fill * (1 - plunge); const lg = c.createLinearGradient(0, -bh / 2, 0, bh / 2); lg.addColorStop(0, '#F6C766'); lg.addColorStop(1, '#B9771C'); c.fillStyle = lg; rr(c, bx - fw, -bh / 2 + 6 * s, fw, bh - 12 * s, 8 * s); c.fill();
  c.strokeStyle = 'rgba(235,245,240,0.85)'; c.lineWidth = 4 * s; rr(c, bx - bw, -bh / 2, bw, bh, 12 * s); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; rr(c, bx - bw + 16 * s, -bh / 2 + 8 * s, bw - 32 * s, 8 * s, 4 * s); c.fill();
  const px = bx - fw - 10 * s; c.fillStyle = '#2B3A35'; rr(c, px - 14 * s, -bh / 2 + 4 * s, 14 * s, bh - 8 * s, 4 * s); c.fill(); c.fillRect(px - 150 * s, -6 * s, 140 * s, 12 * s); rr(c, px - 170 * s, -40 * s, 22 * s, 80 * s, 6 * s); c.fill();
  c.fillStyle = '#2B3A35'; rr(c, bx - bw - 10 * s, -bh / 2 - 22 * s, 20 * s, bh + 44 * s, 6 * s); c.fill();
  c.restore(); }
function spoonDrip(c, x, y, t, t0, a = 1) { // a spoon of thick oil, a slow viscous drip (illustration of "swallowed")
  if (a <= 0) return; c.save(); c.globalAlpha = a; const u = clamp((t - t0) / 1.8);
  c.save(); c.translate(x, y); c.rotate(-0.12 - 0.15 * eio(clamp((t - t0) / 0.8)));
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 14; const sg = c.createLinearGradient(-200, 0, 200, 0); sg.addColorStop(0, '#5E6B66'); sg.addColorStop(0.5, '#D5DED9'); sg.addColorStop(1, '#6E7B76'); c.fillStyle = sg;
  c.beginPath(); c.ellipse(60, 0, 120, 58, 0, 0, 6.283); c.fill(); rr(c, -320, -12, 260, 24, 12); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  const og = c.createRadialGradient(50, -10, 10, 60, 0, 110); og.addColorStop(0, '#FFD98A'); og.addColorStop(1, '#B8741A'); c.fillStyle = og; c.beginPath(); c.ellipse(60, 4, 100, 42, 0, 0, 6.283); c.fill(); c.restore();
  const sx = x + 170, sy = y + 30, L = 40 + 300 * u * u, bob = 26 + 10 * u; const dg = c.createLinearGradient(sx - 20, 0, sx + 20, 0); dg.addColorStop(0, '#B8741A'); dg.addColorStop(0.5, '#FFD98A'); dg.addColorStop(1, '#B8741A'); c.fillStyle = dg;
  c.beginPath(); c.moveTo(sx - 12, sy); c.quadraticCurveTo(sx - 5, sy + L * 0.6, sx - 6 * (1 - u) - 3, sy + L); c.lineTo(sx + 6 * (1 - u) + 3, sy + L); c.quadraticCurveTo(sx + 5, sy + L * 0.6, sx + 12, sy); c.closePath(); c.fill();
  c.beginPath(); c.arc(sx, sy + L + bob * 0.6, bob, 0, 6.283); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.ellipse(sx - bob * 0.35, sy + L + bob * 0.3, bob * 0.18, bob * 0.3, -0.4, 0, 6.283); c.fill();
  c.restore(); }
function skin(c, x0, y0, w, h, a = 1) { // abstract tissue layers (illustration, brand palette)
  if (a <= 0) return; c.save(); c.globalAlpha = a; const bands = [['#E7C3AA', 0.12], ['#D9A58A', 0.38], ['#F0D58A', 0.5]]; let y = y0;
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = bands[0][0]; rr(c, x0, y0, w, h, 26); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); rr(c, x0, y0, w, h, 26); c.clip(); for (const [col, f] of bands) { c.fillStyle = col; c.beginPath(); c.moveTo(x0, y); for (let xx = 0; xx <= w; xx += 40) c.lineTo(x0 + xx, y + Math.sin(xx / 90) * 6); c.lineTo(x0 + w, y0 + h); c.lineTo(x0, y0 + h); c.closePath(); c.fill(); y += h * f; }
  c.fillStyle = 'rgba(255,255,255,0.12)'; for (let k = 0; k < 26; k++) { c.beginPath(); c.arc(x0 + w * rnd(k, 3), y0 + h * (0.55 + 0.42 * rnd(k, 4)), 16 + 14 * rnd(k, 5), 0, 6.283); c.fill(); } c.restore(); c.restore(); }
function chain(c, x, y, n, ang, col, a = 1, cap = 0) { // a fatty-acid chain as a zigzag of beads (illustration); cap 0..1 adds an ethyl group (teal) at the free end
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(ang); c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); for (let i = 0; i <= n; i++) { const px = i * 30, py = (i % 2 ? -14 : 14); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  for (let i = 0; i <= n; i++) { c.fillStyle = col; c.beginPath(); c.arc(i * 30, i % 2 ? -14 : 14, 9, 0, 6.283); c.fill(); }
  if (cap > 0) { const ex = (n + 1) * 30, s = eout(cap); c.globalAlpha = a * cap; c.strokeStyle = TEAL; c.fillStyle = TEAL; c.lineWidth = 7; c.beginPath(); c.moveTo(n * 30, n % 2 ? -14 : 14); c.lineTo(ex, 0); c.lineTo(ex + 30 * s, -16 * s); c.stroke();
    c.save(); c.globalCompositeOperation = 'lighter'; glowDot(c, ex + 30 * s, -16 * s, 0.6 * cap, 30, [95, 196, 184]); c.restore(); c.beginPath(); c.arc(ex, 0, 11, 0, 6.283); c.fill(); c.beginPath(); c.arc(ex + 30 * s, -16 * s, 11, 0, 6.283); c.fill(); }
  c.restore(); }
function plate(c, lines, y, a, x = CX) { // a dark label plate: [[text, size, font, col], ...]
  if (a <= 0) return; c.save(); c.globalAlpha = a; let w = 0; for (const [tx, sz, f] of lines) { c.font = `800 ${sz}px ${f}`; w = Math.max(w, c.measureText(tx).width); } w += 64; const h = lines.reduce((s, l) => s + l[1] * 1.25, 0) + 40;
  c.translate(0, (1 - a) * 24); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = 'rgba(2,28,22,0.93)'; rr(c, x - w / 2, y, w, h, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = C.gold; c.lineWidth = 3; rr(c, x - w / 2, y, w, h, 20); c.stroke(); c.textAlign = 'center'; let yy = y + 20;
  for (const [tx, sz, f, col] of lines) { yy += sz * 1.05; c.font = `800 ${sz}px ${f}`; c.fillStyle = col; c.fillText(tx, x, yy); yy += sz * 0.2; } c.restore(); }
// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [60, 560, 420, -0.045], drop: [722, 1002, 122], syr: [722, 845] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real 1915 portrait + a glowing drop of the oil on a syringe needle + "HER METHOD. HIS NAME."
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  syringe(c, F0.syr[0], F0.syr[1], 0.55, Math.PI / 2, 0.75, 0, 1);
  const grow = 1 + 0.08 * pr(t, 0.5, 4.5, (u) => u); droplet(c, F0.drop[0], F0.drop[1] + 6 * Math.sin(t * 1.4), F0.drop[2] * grow, t, 1);
  photo(c, POR, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  c.restore();
  label(c, 'HER METHOD.', CX, 1500, 104, C.cream, 'InterX'); label(c, 'HIS NAME.', CX, 1625, 120, C.gold, 'InterX');
}
function scene2(c, t) { // THE OBSTACLE: swallowed -> nausea (a slow, thick drip); injected -> a lump that hurts and barely spreads
  c.drawImage(BG.b, 0, 0);
  const sw = pr(t, ws(17) - 0.45, ws(17) - 0.05); // switch from the spoon to the injection
  if (sw < 1) { c.save(); c.globalAlpha = 1 - sw; c.translate(0, -120 * sw); spoonDrip(c, 380, 820, t, T.cut + 0.1, 1);
    const q = pr(t, ws(16) - 0.15, ws(16) + 0.3, eout); if (q > 0) { c.save(); c.globalAlpha = q * (1 - sw); c.strokeStyle = '#9CCB6A'; c.lineWidth = 9; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 30; i++) { const xx = 330 + i * 12, yy = 1350 + k * 34 + Math.sin(i * 0.6 + t * 6 + k) * 10; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); } c.restore(); }
    c.restore(); }
  if (sw > 0) { c.save(); c.globalAlpha = sw; c.translate(0, 120 * (1 - sw));
    skin(c, 110, 960, 780, 460, 1);
    const inj = pr(t, ws(17) - 0.05, ws(17) + 0.5, eout), push = pr(t, ws(17) + 0.4, ws(19) + 0.2);
    const tipY = lerp(840, 1130, inj); syringe(c, 520, tipY, 0.8, Math.PI / 2 - 0.05, 0.7, push, 1);
    const lump = 40 + 70 * push; if (push > 0) { const pain = pr(t, ws(19) - 0.1, ws(19) + 0.2) * (0.5 + 0.5 * Math.sin((t - ws(19)) * 9)); const lg = c.createRadialGradient(525, 1150, 0, 525, 1150, lump * 2.4); lg.addColorStop(0, `rgba(230,70,50,${0.55 * pain})`); lg.addColorStop(1, 'rgba(230,70,50,0)'); c.fillStyle = lg; c.beginPath(); c.arc(525, 1150, lump * 2.4, 0, 6.283); c.fill();
      const og = c.createRadialGradient(510, 1140, 4, 525, 1150, lump); og.addColorStop(0, '#FFE0A0'); og.addColorStop(1, '#B8741A'); c.fillStyle = og; c.beginPath(); c.ellipse(525, 1150, lump, lump * 0.62, 0, 0, 6.283); c.fill(); }
    c.restore(); }
}
const MOL = { gx: 230, gy: 760, dy: 150 };
function scene3(c, t) { // THE FIX: the oil's fatty acids split off, each becomes an ethyl ester; thin droplets the body absorbs
  c.drawImage(BG.c, 0, 0);
  const split = pr(t, ws(26) - 0.2, ws(27) + 0.4, eio), cap = pr(t, ws(29) - 0.1, ws(30) + 0.35), flow = pr(t, ws(31) - 0.1, ws(35) + 0.4, (v) => v), molA = 1 - pr(t, ws(31) - 0.3, ws(31) + 0.1);
  if (molA > 0) { c.save(); c.globalAlpha = molA;
    const ga = 1 - split; c.save(); c.globalAlpha = molA * ga; c.strokeStyle = '#C8D3CF'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(MOL.gx, MOL.gy); c.lineTo(MOL.gx, MOL.gy + 2 * MOL.dy); c.stroke(); for (let k = 0; k < 3; k++) { c.fillStyle = '#C8D3CF'; c.beginPath(); c.arc(MOL.gx, MOL.gy + k * MOL.dy, 16, 0, 6.283); c.fill(); } c.restore();
    for (let k = 0; k < 3; k++) { const dx = 30 + 70 * split, dy = (k - 1) * 90 * split; chain(c, MOL.gx + dx, MOL.gy + k * MOL.dy + dy, 15, 0, C.gold, molA, cap); }
    c.restore(); }
  label(c, 'fatty acids', CX, 1360, 70, C.cream, 'Fraunces', pr(t, ws(26) - 0.1, ws(27) + 0.2, eout) * (1 - pr(t, ws(29) - 0.3, ws(29))));
  label(c, 'ethyl esters', CX, 1360, 70, TEAL, 'Fraunces', pr(t, ws(29) - 0.1, ws(30) + 0.2, eout) * (1 - pr(t, ws(31) - 0.3, ws(31))));
  if (flow > 0) { const fa = pr(t, ws(31) - 0.3, ws(31) + 0.1); c.save(); c.globalAlpha = fa; skin(c, 110, 1060, 780, 360, 1);
    syringe(c, 485, 1150, 0.7, Math.PI / 2 - 0.05, 0.7, flow * 0.9, 1);
    for (let i = 0; i < 70; i++) { const born = i / 70 * 0.85, age = clamp((flow - born) / 0.35); if (age <= 0) continue; const ang = rnd(i, 3) * 6.283, d = 30 + 330 * age * (0.5 + 0.5 * rnd(i, 4));
      const px = 485 + Math.cos(ang) * d * 1.1, py = 1170 + Math.abs(Math.sin(ang)) * d * 0.55; if (py > 1410) continue; glowDot(c, px, py, 0.75 * (1 - age), 16, [241, 190, 90]); }
    c.restore(); }
}
const PF = { x: 300, y: 560, w: 400 };
function scene4(c, t) { // CREDIT LOST: she died at 24; her supervisor published without crediting her (the esters became "Dean's derivatives")
  c.drawImage(BG.a, 0, 0);
  photo(c, POR, PF.x, PF.y, PF.w, 0.02, 1, t > T.push[1] ? pr(t, T.push[1], T.push[1] + 1.3, (v) => v) : -1);
  const nameDim = pr(t, ws(45) - 0.2, ws(47) + 0.2); plate(c, [['ALICE BALL', 54, 'InterX', C.cream], ['1892–1916', 36, 'Mono', C.gold]], 1180, 1 - 0.8 * nameDim);
  const pg = pr(t, ws(42) - 0.2, ws(42) + 0.45, eout); if (pg > 0) { for (let k = 0; k < 3; k++) { const x = lerp(1180, 180 + k * 26, pg), y = 1130 + k * 22; c.save(); c.translate(x + 330, y + 120); c.rotate(-0.05 + k * 0.035); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FBF6E8'; rr(c, -330, -120, 660, 240, 10); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
      c.fillStyle = 'rgba(18,59,49,0.18)'; for (let l = 0; l < 6; l++) rr(c, -280, -70 + l * 30, 560 - (l === 5 ? 200 : 0), 9, 4), c.fill(); c.restore(); }
    const da = pr(t, ws(46) - 0.15, ws(46) + 0.3, eout); label(c, '“Dean’s derivatives”', CX + 10, 1290, 54, C.goldDeep, 'Fraunces', da); }
}
const PG = { x: 60, w: 960 }; PG.h = PG.w * PAGEC.height / PAGEC.width; PG.y = 560;
const NM = { x0: 0.594, x1: 0.804, y: 0.214 }, HD = { x0: 0.036, x1: 0.233, y: 0.898 };
function scene5(c, t) { // CREDIT GIVEN: Hollmann's real 1922 paper — "Miss Ball solved the problem… BALL'S METHOD"
  c.drawImage(BG.b, 0, 0);
  const z = lerp(1.0, 1.06, pr(t, T.push2[1], T.turn[0], (v) => v)); c.save(); c.translate(CX, PG.y + PG.h / 2); c.scale(z, z); c.translate(-CX, -(PG.y + PG.h / 2));
  photo(c, PAGEC, PG.x, PG.y, PG.w, 0, 1, t > T.push2[1] + 0.1 ? pr(t, T.push2[1] + 0.1, T.push2[1] + 1.4, (v) => v) : -1);
  const u1 = pr(t, ws(49) - 0.1, ws(50) + 0.3, eout), u2 = pr(t, ws(53) - 0.2, ws(54) + 0.2, eout);
  const ul = (r, u) => { if (u <= 0) return; const x0 = PG.x + PG.w * r.x0, x1 = PG.x + PG.w * r.x1, y = PG.y + PG.h * r.y; c.fillStyle = C.gold; rr(c, x0, y, (x1 - x0) * u, 7, 3); c.fill(); c.save(); c.globalAlpha = 0.2 * u; c.fillRect(x0 - 4, y - 34, (x1 - x0) * u + 8, 38); c.restore(); };
  ul(NM, u1); ul(HD, u2); c.restore();
  plate(c, [['Dr. Harry Hollmann, 1922', 40, 'Mono', C.cream]], PG.y + PG.h * z + 70, pr(t, T.push2[1] + 0.2, T.push2[1] + 0.6, eout));
}
function scene6(c, t) { // PAYOFF: a remedy only helps if patients can take it
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, POR, 0.5, 0.33, 0.34, CX, 720, 150, 1);
  label(c, 'ALICE BALL', CX, 950, 46, C.ink, 'InterX', 1);
  const ca = pr(t, ws(61) - 0.2, ws(61) + 0.3, eout); if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 170, 1080, 660, 140, 24); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 60px InterX'; c.textAlign = 'center'; c.fillText('make it usable', CX, 1172); c.restore(); }
  droplet(c, CX, 1400, 46, t, pr(t, ws(63) - 0.2, ws(63) + 0.3, eout));
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
  if (t < T.push[0]) return scene3(c, t);
  if (t < T.push[1]) return push(scene3, scene4, T.push[0], T.push[1]);
  if (t < T.push2[0]) return scene4(c, t);
  if (t < T.push2[1]) return push(scene4, scene5, T.push2[0], T.push2[1]);
  if (t < T.turn[0]) return scene5(c, t);
  if (t < T.turn[1]) { const u = (t - T.turn[0]) / (T.turn[1] - T.turn[0]), e = eio(u); const a = at(scene5, bufA), b = at(scene6, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } return; }
  if (t < T.cta[0]) return scene6(c, t);
  if (t < T.cta[1]) { const e = eio((t - T.cta[0]) / (T.cta[1] - T.cta[0])); const a = at(scene6, bufA), b = at(scene7, bufB);
    c.save(); c.translate(-W * e, 0); c.drawImage(a, 0, 0); c.restore(); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, W * (1 - e), 0); c.restore(); return; }
  return scene7(c, t);
}
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; render(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // no opening flicker or fade: frame 0 is the finished composition (first-frame rule)
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
function drawThumb(c) { drawFrame(0); c.drawImage(canvas, 0, 0); } // the thumbnail IS frame 0 (first-frame rule, context/25 addendum 2026-11-15)

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, sweep: 0.4, cut: T.cut, drip: T.cut + 0.3, queasy: ws(16) - 0.15, inject: ws(17) - 0.05, pain: ws(19) - 0.1, whip: T.whip, split: ws(26) - 0.2, caps: [ws(29) - 0.1, ws(30) + 0.35], flow: [ws(31) - 0.1, ws(35) + 0.4],
    push: T.push, pages: ws(42) - 0.2, dim: ws(45) - 0.2, dean: ws(46) - 0.15, push2: T.push2, ul1: ws(49) - 0.1, ul2: ws(53) - 0.2, turn: T.turn, card: ws(61) - 0.2, drop: ws(63) - 0.2, cta: T.cta };
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
