// Aarambh english-21 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25), the 2026-11-15
// first-frame addendum and the 2026-11-17 feedback addendum (less text at once, explanatory motion, a striking thumbnail): frame 0 = real portrait of Vivien Thomas
// + a heart + a blue blood bead stranded outside it + "THE HANDS THEY FORGOT" (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: blue babies lacked oxygen; Vivien Thomas helped fix it, then went uncredited -> too little of their blood reached the lungs -> a shunt rerouted an artery
// to the lungs, so more blood picked up oxygen (the baby turns pink) -> he perfected it on about 200 dogs, then coached the surgeon -> on paper he was a janitor;
// the 1945 report left out his name -> lesson: practise where mistakes are safe, then guide the real thing.
// Portrait: Wikimedia Commons "Vivien Thomas.jpg" (300x436; Commons lists it as public domain on the source site's say-so — licence basis noted in context/35).
// Heart, lungs, baby, vessels, beads, stool, surgeon, card, page, stamp and cards are original illustration.
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
  [0, 3, ['Blue babies', 'lacked oxygen.']],
  [4, 8, ['Vivien Thomas', 'helped fix it,']],
  [9, 11, ['then went uncredited.']],
  [12, 19, ['Too little of their blood', 'reached the lungs.']],
  [20, 27, ['A shunt rerouted an', 'artery to the lungs,']],
  [28, 33, ['so more blood', 'picked up oxygen.']],
  [34, 40, ['Thomas perfected it', 'on about 200 dogs,']],
  [41, 44, ['then coached', 'the surgeon.']],
  [45, 50, ['On paper he', 'was a janitor;']],
  [51, 57, ['the 1945 report', 'left out his name.']],
  [58, 63, ['Lesson: practise where', 'mistakes are safe,']],
  [64, 68, ['then guide', 'the real thing.']],
  [69, 74, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 12: SENT[1].start, 20: SENT[2].start, 34: SENT[3].start, 45: SENT[4].start, 58: SENT[5].start, 69: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? (Math.abs(ws(a) - SENT_START[a]) > 0.25 ? SENT_START[a] + 0.1 : Math.max(ws(a), SENT_START[a])) : (we(a - 1) + ws(a)) / 2); // fall back to the placed start when ASR mis-stamps a sentence's first word
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                      // hard cut on "Too little of their blood…" -> the circulation: before, then the shunt
  whip: [SENT[3].start - 0.2, SENT[3].start],     // whip pan to his hands: practice, then coaching the surgeon
  push: [SENT[4].start - 0.28, SENT[4].start - 0.03], // push to "on paper": the job card
  push2: [ws(51) - 0.3, ws(51) - 0.05],           // push to the 1945 report's byline
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/vivien-thomas-commons-pd-claimed-2x.jpg')); // 2x of the 300x436 Commons scan (softened halftone; no added detail)
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PORC = crop(POR, 0.12, 0.0, 0.98, 0.78); // Vivien Thomas in the laboratory, head to apron
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
const BLUE = [79, 140, 255], RED = [226, 72, 79];
const mix = (a, b, u) => [0, 1, 2].map((i) => Math.round(lerp(a[i], b[i], u)));
const rgb = (c, al = 1) => `rgba(${c[0]},${c[1]},${c[2]},${al})`;
function bead(c, x, y, r, col, a = 1) { // a glowing blood bead (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.save(); c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(x, y, 0, x, y, r * 3); h.addColorStop(0, rgb(col, 0.55)); h.addColorStop(1, rgb(col, 0)); c.fillStyle = h; c.beginPath(); c.arc(x, y, r * 3, 0, 6.283); c.fill(); c.restore();
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.25, rgb(mix(col, [255, 255, 255], 0.35))); g.addColorStop(1, rgb(mix(col, [0, 0, 0], 0.35))); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
  c.restore(); }
function heart(c, x, y, s, t, a = 1, vessels = true) { // a stylised heart with its two great arteries (illustration)
  if (a <= 0) return; const beat = 1 + 0.035 * Math.max(0, Math.sin(t * 7.5)) ** 6; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s * beat, s * beat);
  c.lineCap = 'round';
  if (vessels) {
  c.strokeStyle = '#6E3D7A'; c.lineWidth = 30; c.beginPath(); c.moveTo(-18, -62); c.quadraticCurveTo(-40, -128, -96, -150); c.stroke();          // pulmonary trunk
  c.strokeStyle = '#A3202F'; c.lineWidth = 36; c.beginPath(); c.moveTo(14, -70); c.quadraticCurveTo(30, -168, 96, -150); c.quadraticCurveTo(128, -138, 122, -88); c.stroke(); } // aorta
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetY = 24;
  c.beginPath(); c.moveTo(-6, -82); c.bezierCurveTo(-70, -110, -128, -50, -108, 20); c.bezierCurveTo(-90, 80, -20, 120, 26, 150); c.bezierCurveTo(70, 100, 122, 40, 112, -26); c.bezierCurveTo(104, -84, 46, -100, -6, -82); c.closePath();
  const g = c.createRadialGradient(-30, -40, 10, 0, 20, 170); g.addColorStop(0, '#E8606A'); g.addColorStop(0.55, '#B42536'); g.addColorStop(1, '#5E0E18'); c.fillStyle = g; c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(80,10,20,0.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(10, -70); c.bezierCurveTo(-10, -10, 10, 60, 24, 140); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(-52, -36, 18, 34, -0.5, 0, 6.283); c.fill();
  c.restore(); }
function lungs(c, x, y, s, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  for (const sg of [-1, 1]) { c.save(); c.scale(sg, 1); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 30; c.shadowOffsetY = 12; const g = c.createLinearGradient(30, -120, 150, 120); g.addColorStop(0, '#F6C9C2'); g.addColorStop(1, '#D98C88'); c.fillStyle = g;
    c.beginPath(); c.moveTo(28, -110); c.bezierCurveTo(110, -140, 170, -20, 160, 80); c.bezierCurveTo(150, 140, 60, 140, 30, 110); c.bezierCurveTo(10, 40, 12, -40, 28, -110); c.fill(); c.restore(); }
  c.strokeStyle = 'rgba(160,80,80,0.5)'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, -150); c.lineTo(0, -60); c.moveTo(0, -60); c.lineTo(-40, -20); c.moveTo(0, -60); c.lineTo(40, -20); c.stroke(); c.restore(); }
function baby(c, x, y, s, u, a = 1) { // a simple baby figure, tinted from blue to pink by u (illustration)
  if (a <= 0) return; const col = mix([118, 150, 224], [246, 168, 170], u); c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = rgb(col); c.beginPath(); c.ellipse(0, 70, 95, 72, 0, 0, 6.283); c.fill(); c.beginPath(); c.arc(0, -40, 62, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = rgb(mix(col, [255, 255, 255], 0.35)); c.beginPath(); c.ellipse(-20, -58, 14, 20, -0.4, 0, 6.283); c.fill(); c.fillStyle = rgb(mix(col, [255, 120, 140], 0.5 * u), 0.8); c.beginPath(); c.arc(-26, -26, 11, 0, 6.283); c.arc(26, -26, 11, 0, 6.283); c.fill();
  c.restore(); }
function qpath(pts) { // polyline through points, sampled smoothly (Catmull-Rom); returns f(u) -> [x, y]
  const seg = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; seg.push([p0, p1, p2, p3]); }
  const at = (u) => { const n = seg.length, k = Math.min(n - 1, Math.floor(u * n)), v = u * n - k, [p0, p1, p2, p3] = seg[k], v2 = v * v, v3 = v2 * v;
    return [0, 1].map((j) => 0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * v + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * v2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * v3)); };
  return at; }
function tube(c, f, w, col, a = 1, upto = 1) { if (a <= 0 || upto <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); for (let i = 0; i <= 60 * upto; i++) { const [x, y] = f(i / 60); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); }
// circulation geometry (scene 2)
const HC = [500, 1075], LC = [500, 715], BC = [500, 1445];
const PA = qpath([[470, 1000], [452, 930], [448, 860], [430, 790]]);            // pulmonary artery, heart -> lungs (narrowed)
const PV = qpath([[575, 790], [570, 880], [548, 960], [528, 1000]]);           // pulmonary veins, lungs -> heart
const AO = qpath([[540, 1005], [640, 930], [712, 1010], [712, 1250], [585, 1390]]); // aorta, heart -> body
const VC = qpath([[415, 1390], [300, 1260], [296, 1130], [432, 1095]]);        // veins, body -> heart
const SH = qpath([[652, 938], [610, 870], [520, 832], [448, 845]]);            // the shunt: body artery -> lung artery
function flow(c, f, n, speed, t, colFn, r = 13, a = 1) { for (let k = 0; k < n; k++) { const u = ((t * speed + k / n) % 1 + 1) % 1; const [x, y] = f(u); bead(c, x, y, r, colFn(u), a); } }
// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [55, 570, 420, -0.04], heart: [770, 880, 1.4], bead: [880, 1215] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + a heart + a blue blood bead stranded outside it + "THE HANDS THEY FORGOT"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  heart(c, ...F0.heart, t, 1);
  const [bx, by] = F0.bead; c.save(); c.strokeStyle = 'rgba(120,170,255,0.45)'; c.lineWidth = 4; c.setLineDash([10, 14]); c.beginPath(); c.arc(bx, by, 62 + 4 * Math.sin(t * 3), 0, 6.283); c.stroke(); c.restore();
  bead(c, bx, by + 6 * Math.sin(t * 1.6), 32, BLUE, 1);
  photo(c, PORC, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  c.restore();
  label(c, 'THE HANDS', CX, 1470, 112, C.cream, 'InterX'); label(c, 'THEY FORGOT', CX, 1598, 106, C.gold, 'InterX');
}
function scene2(c, t) { // BEFORE -> AFTER: too little blood reaches the lungs; the shunt reroutes an artery to the lungs; the baby turns pink
  c.drawImage(BG.b, 0, 0);
  const grow = pr(t, ws(21) - 0.15, ws(22) + 0.6, eio), after = pr(t, ws(28) - 0.2, ws(33) + 0.3, (u) => u);
  tube(c, VC, 30, 'rgba(110,140,220,0.35)'); tube(c, AO, 34, `rgba(${mix([140, 120, 210], [200, 70, 80], after).join(',')},0.4)`); tube(c, PV, 26, 'rgba(220,90,100,0.35)');
  const pinch = 0.5 + 0.5 * Math.sin(t * 6), warn = pr(t, ws(13) - 0.1, ws(13) + 0.3) * (1 - grow);
  tube(c, PA, 12, 'rgba(120,120,210,0.45)'); if (warn > 0) { const [px, py] = PA(0.5); c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(px, py, 0, px, py, 70); g.addColorStop(0, `rgba(241,180,68,${0.55 * warn * pinch})`); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.beginPath(); c.arc(px, py, 70, 0, 6.283); c.fill(); c.restore(); }
  tube(c, SH, 26, 'rgba(241,180,68,0.9)', 1, grow); if (grow > 0 && grow < 1) { const [gx, gy] = SH(grow); glowDot(c, gx, gy, 0.8, 40); }
  lungs(c, LC[0], LC[1], 0.95, 1); heart(c, HC[0], HC[1], 0.8, t, 1, false); baby(c, BC[0], BC[1], 0.95, after, 1);
  flow(c, VC, 7, 0.22, t, () => BLUE, 12);
  flow(c, AO, 7, 0.22, t, () => mix([140, 110, 230], RED, after), 12);
  flow(c, PA, 2 + Math.round(0 * after), 0.16, t, (u) => mix(BLUE, RED, pr(u, 0.75, 1)), 9);
  flow(c, PV, Math.round(2 + 6 * after), 0.22, t, () => RED, 11);
  if (grow >= 1) flow(c, SH, 5, 0.3, t, (u) => mix([140, 110, 230], RED, pr(u, 0.8, 1) * after), 11, pr(t, ws(22) + 0.6, ws(23) + 0.6));
  label(c, 'lungs', 220, 735, 40, 'rgba(251,247,238,0.75)', 'Mono', pr(t, ws(19) - 0.3, ws(19) + 0.1, eout) * (1 - pr(t, ws(21) - 0.4, ws(21) - 0.1)));
  label(c, 'shunt', 820, 830, 64, C.gold, 'Fraunces', pr(t, ws(21) - 0.1, ws(21) + 0.3, eout));
}
const STOOL = [255, 975];
function stool(c, x, y, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; const g = c.createLinearGradient(0, y, 0, y + 200); g.addColorStop(0, '#B07A45'); g.addColorStop(1, '#6B4423'); c.fillStyle = g;
  rr(c, x - 150, y, 300, 34, 8); c.fill(); rr(c, x - 110, y + 100, 220, 28, 8); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.fillStyle = '#5A381C'; for (const dx of [-130, 112]) { rr(c, x + dx, y + 20, 18, 190, 6); c.fill(); } c.restore(); }
function surgeon(c, x, y, a) { // seen from behind: cap, shoulders, gown (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.save(); c.globalCompositeOperation = 'lighter'; const lg = c.createRadialGradient(x - 40, y + 260, 20, x - 40, y + 260, 360); lg.addColorStop(0, 'rgba(255,240,200,0.35)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = lg; c.fillRect(x - 420, y - 100, 760, 760); c.restore();
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; const g = c.createLinearGradient(x - 200, 0, x + 200, 0); g.addColorStop(0, '#0E3A30'); g.addColorStop(0.5, '#2F6B5A'); g.addColorStop(1, '#0B2E26'); c.fillStyle = g;
  c.beginPath(); c.moveTo(x - 210, y + 520); c.bezierCurveTo(x - 220, y + 260, x - 160, y + 170, x, y + 160); c.bezierCurveTo(x + 160, y + 170, x + 220, y + 260, x + 210, y + 520); c.closePath(); c.fill();
  c.fillStyle = '#C79A7A'; c.beginPath(); c.ellipse(x, y + 90, 70, 82, 0, 0, 6.283); c.fill(); c.fillStyle = '#3E8C77'; c.beginPath(); c.ellipse(x, y + 52, 76, 58, 0, Math.PI, 2 * Math.PI); c.fill(); c.fillRect(x - 76, y + 48, 152, 22); c.restore(); }
function scene3(c, t) { // HIS HANDS: about 200 practice operations in dogs, then coaching the surgeon (from a stepstool, over his shoulder)
  c.drawImage(BG.c, 0, 0);
  const co = pr(t, ws(41) - 0.35, ws(42) + 0.3, eio);
  const px = lerp(80, 110, co), py = lerp(560, 585, co), pw = lerp(440, 300, co); stool(c, STOOL[0], STOOL[1], co);
  photo(c, PORC, px, py, pw, lerp(-0.03, -0.06, co), 1, t > T.whip[1] ? pr(t, T.whip[1], T.whip[1] + 1.2, (v) => v) : -1);
  surgeon(c, 690, 720, co);
  const ca = pr(t, ws(38) - 0.15, ws(39) + 0.2, eout) * (1 - pr(t, ws(41) - 0.55, ws(41) - 0.3)), n = Math.round(200 * pr(t, ws(38) - 0.1, ws(40) + 0.1, (u) => u));
  if (ca > 0) approx(c, '≈ ' + n, CX, 1300, 130, C.gold, 'Fraunces', ca);
}
function scene4(c, t) { // ON PAPER: his job was classed as janitor
  c.drawImage(BG.a, 0, 0);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FBF6E8'; rr(c, 150, 720, 780, 460, 22); c.fill(); c.restore();
  photo(c, PORC, 200, 770, 230, -0.02, 1);
  c.fillStyle = 'rgba(18,59,49,0.16)'; for (let l = 0; l < 5; l++) { rr(c, 480, 800 + l * 62, 380 - (l % 2) * 90, 16, 6); c.fill(); }
  const sa = pr(t, ws(50) - 0.15, ws(50) + 0.15, eout); if (sa > 0) { c.save(); c.globalAlpha = sa; c.translate(700, 1010); c.rotate(-0.09); const sc = 1.35 - 0.35 * sa; c.scale(sc, sc); c.strokeStyle = '#B3261E'; c.lineWidth = 9; rr(c, -230, -70, 460, 130, 18); c.stroke(); c.fillStyle = 'rgba(179,38,30,0.08)'; rr(c, -230, -70, 460, 130, 18); c.fill(); c.fillStyle = '#B3261E'; c.font = '800 84px InterX'; c.textAlign = 'center'; c.fillText('JANITOR', 0, 28); c.restore(); }
}
function scene5(c, t) { // THE 1945 REPORT: the byline names Blalock and Taussig; his name is not there
  c.drawImage(BG.b, 0, 0);
  c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FBF6E8'; rr(c, 150, 600, 780, 820, 16); c.fill(); c.restore();
  label(c, '1945', 860, 670, 34, 'rgba(18,59,49,0.6)', 'Mono', 1, 'right');
  c.fillStyle = 'rgba(18,59,49,0.22)'; for (let l = 0; l < 2; l++) { rr(c, 230, 720 + l * 50, 620 - l * 160, 24, 8); c.fill(); }
  label(c, 'BLALOCK · TAUSSIG', CX + 40, 900, 54, C.ink, 'InterX', pr(t, T.push2[1], T.push2[1] + 0.3, eout));
  c.fillStyle = 'rgba(18,59,49,0.1)'; for (let l = 0; l < 6; l++) { rr(c, 230, 1000 + l * 52, 620 - (l === 5 ? 240 : 0), 14, 6); c.fill(); }
  const slot = pr(t, ws(53) - 0.2, ws(53) + 0.2, eout), gone = pr(t, ws(54) - 0.1, ws(57) + 0.2);
  if (slot > 0) { c.save(); c.globalAlpha = slot; c.strokeStyle = '#B3261E'; c.lineWidth = 5; c.setLineDash([14, 12]); rr(c, 330, 925, 420, 64, 12); c.stroke(); c.restore(); label(c, 'THOMAS', CX + 40, 975, 46, 'rgba(18,59,49,0.55)', 'InterX', slot * (1 - gone)); }
}
function scene6(c, t) { // PAYOFF: practise where mistakes are safe, then guide the real thing
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, PORC, 0.645, 0.22, 0.2, CX, 700, 140, 1);
  label(c, 'VIVIEN THOMAS', CX, 920, 44, C.ink, 'InterX', 1);
  const ca = pr(t, ws(64) - 0.2, ws(65) + 0.3, eout); if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 170, 1030, 660, 140, 24); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 58px InterX'; c.textAlign = 'center'; c.fillText('rehearse, then guide', CX, 1120); c.restore(); }
  const ha = pr(t, T.turn[1] + 0.1, T.turn[1] + 0.6, eout); heart(c, CX, 1400, 0.62, t, ha); bead(c, CX - 8, 1405, 16, RED, ha);
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
  const cues = { T, sweep: 0.4, cut: T.cut, warn: ws(13) - 0.1, grow: [ws(21) - 0.15, ws(22) + 0.6], pink: [ws(28) - 0.2, ws(33) + 0.3], whip: T.whip, count: [ws(38) - 0.1, ws(40) + 0.1], coach: ws(41) - 0.35,
    push: T.push, janitor: ws(50) - 0.15, push2: T.push2, slot: ws(53) - 0.2, gone: ws(54) - 0.1, turn: T.turn, card: ws(64) - 0.2, cta: T.cta };
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
