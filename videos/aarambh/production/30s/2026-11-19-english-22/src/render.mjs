// Aarambh english-22 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25), the 2026-11-15
// first-frame addendum and the 2026-11-17 feedback addendum (less text at once, explanatory motion, a striking thumbnail): frame 0 = real portrait of Elizebeth
// Friedman + one luminous radio dial + coded letters on the air + "SHE READ THEIR SECRETS" (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Topic note: the brief asked for Hedy Lamarr's frequency-hopping radio; that subject is already covered in this app (context/36), so this episode keeps the
// brief's lesson (changing a pattern protects a signal) from the codebreaker's side.
// Story: smugglers radioed orders in secret code; Elizebeth Friedman read them anyway -> how, without the key? -> their codes swapped each letter the same way
// every time, so patterns showed (E always became Q; Q piles up) -> she and an aide cracked over 12,000 messages -> Nazi spies used Enigma, which changed
// the swap every key press (E -> Q, X, M); her team still broke it -> lesson: patterns that repeat leak secrets; never reuse a password (one key per lock).
// Portrait: NSA photograph of Elizebeth Smith Friedman (Wikimedia Commons "Elizebeth-Friedman.jpg", PD-USGov).
// Radio dial, coded letters, padlocks, keys, swap box, slips, rotor and cards are original illustration; letter mappings are illustrative.
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; "12,000" is tokens 34-35)
  [0, 5, ['Smugglers radioed', 'orders in secret code.']],
  [6, 10, ['Elizebeth Friedman', 'read them anyway.']],
  [11, 14, ['How, without the key?']],
  [15, 19, ['Their codes swapped', 'each letter']],
  [20, 27, ['the same way every time,', 'so patterns showed.']],
  [28, 36, ['She and an aide cracked', 'over 12,000 messages.']],
  [37, 40, ['Nazi spies used Enigma,']],
  [41, 47, ['which changed the swap', 'every key press;']],
  [48, 52, ['her team still broke it.']],
  [53, 58, ['Lesson: patterns that', 'repeat leak secrets;']],
  [59, 62, ['never reuse a password.']],
  [63, 68, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 15: SENT[2].start, 28: SENT[3].start, 37: SENT[4].start, 53: SENT[5].start, 63: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? (Math.abs(ws(a) - SENT_START[a]) > 0.25 ? SENT_START[a] + 0.1 : Math.max(ws(a), SENT_START[a])) : (we(a - 1) + ws(a)) / 2); // fall back to the placed start when ASR mis-stamps a sentence's first word
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                      // hard cut on "How, without the key?" -> the padlock
  whip: [SENT[2].start - 0.2, SENT[2].start],     // whip pan to the swap: the same letter always becomes the same symbol
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05], // push to the pile of cracked messages
  push2: [SENT[4].start - 0.3, SENT[4].start - 0.05], // push to Enigma's stepping rotor
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/elizebeth-friedman-nsa-pd-2x.jpg')); // 2x of the 480x640 NSA photograph (no added detail)
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PORC = crop(POR, 0.2, 0.01, 0.76, 0.56); // Elizebeth Friedman, head to coat (hat, tweed coat)
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
const CYAN = '#BFEAF5', REDK = '#C8463C';
function tile(c, ch, x, y, s, kind, a = 1, sx = 1) { // a letter tile: 'plain' (message letter), 'ciph' (coded letter), 'gold' (decoded)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(Math.max(0.02, sx), 1);
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 18; c.shadowOffsetY = 8; c.fillStyle = kind === 'plain' ? '#FBF6E8' : kind === 'gold' ? C.gold : '#0B2A33'; rr(c, -s / 2, -s / 2, s, s, s * 0.16); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  if (kind === 'ciph') { c.strokeStyle = 'rgba(150,215,235,0.6)'; c.lineWidth = 3; rr(c, -s / 2 + 2, -s / 2 + 2, s - 4, s - 4, s * 0.14); c.stroke(); }
  c.fillStyle = kind === 'plain' ? C.ink : kind === 'gold' ? '#2A1A02' : CYAN; c.font = `800 ${Math.round(s * 0.6)}px Mono`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, s * 0.03); c.restore(); }
function flipTile(c, a0, k0, a1, k1, x, y, s, u, a = 1) { tile(c, u < 0.5 ? a0 : a1, x, y, s, u < 0.5 ? k0 : k1, a, Math.abs(Math.cos(Math.PI * clamp(u)))); }
function dial(c, x, y, r, needle, a = 1) { // a luminous radio tuning dial (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.save(); c.globalCompositeOperation = 'lighter'; const h = c.createRadialGradient(x, y, r * 0.6, x, y, r * 2.2); h.addColorStop(0, 'rgba(255,186,84,0.42)'); h.addColorStop(1, 'rgba(255,186,84,0)'); c.fillStyle = h; c.beginPath(); c.arc(x, y, r * 2.2, 0, 6.283); c.fill(); c.restore();
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 40; c.shadowOffsetY = 16; const bz = c.createLinearGradient(x - r, y - r, x + r, y + r); bz.addColorStop(0, '#F0CF8A'); bz.addColorStop(0.5, '#8A6326'); bz.addColorStop(1, '#D9AE5E'); c.fillStyle = bz; c.beginPath(); c.arc(x, y, r + 24, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  const fg = c.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.1, x, y, r); fg.addColorStop(0, '#FFF6D6'); fg.addColorStop(0.6, '#FFC867'); fg.addColorStop(1, '#D9862A'); c.fillStyle = fg; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
  const A0 = Math.PI * 0.8, A1 = Math.PI * 2.2, NUM = ['55', '60', '65', '70', '80', '90', '100', '130', '160'];
  c.strokeStyle = 'rgba(74,40,6,0.85)'; c.lineCap = 'round';
  for (let i = 0; i <= 40; i++) { const an = lerp(A0, A1, i / 40), long = i % 5 === 0; c.lineWidth = long ? 4 : 2; c.beginPath(); c.moveTo(x + Math.cos(an) * r * 0.88, y + Math.sin(an) * r * 0.88); c.lineTo(x + Math.cos(an) * r * (long ? 0.74 : 0.8), y + Math.sin(an) * r * (long ? 0.74 : 0.8)); c.stroke(); }
  c.fillStyle = 'rgba(74,40,6,0.85)'; c.font = `700 ${Math.round(r * 0.13)}px Mono`; c.textAlign = 'center'; c.textBaseline = 'middle';
  NUM.forEach((n, i) => { const an = lerp(A0, A1, i / 8); c.fillText(n, x + Math.cos(an) * r * 0.6, y + Math.sin(an) * r * 0.6); });
  const na = lerp(A0, A1, needle); c.strokeStyle = '#8A1E10'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(na) * r * 0.9, y + Math.sin(na) * r * 0.9); c.stroke();
  c.fillStyle = '#3A2A12'; c.beginPath(); c.arc(x, y, r * 0.12, 0, 6.283); c.fill(); c.fillStyle = '#C9A050'; c.beginPath(); c.arc(x - r * 0.03, y - r * 0.03, r * 0.05, 0, 6.283); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.16)'; c.beginPath(); c.ellipse(x - r * 0.42, y - r * 0.46, r * 0.36, r * 0.14, -0.62, 0, 6.283); c.fill();
  c.restore(); }
function padlock(c, x, y, s, open = 0, a = 1, ink = false, glow = 0, glowCol = [241, 180, 68]) { // body centred at (x, y); keyhole at (x, y + 12 s)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  if (glow > 0) { c.save(); c.globalCompositeOperation = ink ? 'source-over' : 'lighter'; const g = c.createRadialGradient(0, -20, 10, 0, -20, 190); g.addColorStop(0, `rgba(${glowCol.join(',')},${0.5 * glow})`); g.addColorStop(1, `rgba(${glowCol.join(',')},0)`); c.fillStyle = g; c.beginPath(); c.arc(0, -20, 190, 0, 6.283); c.fill(); c.restore(); }
  c.save(); c.translate(-62, -70 - 46 * open); c.rotate(-0.55 * open); c.strokeStyle = ink ? '#4C6A62' : '#B9BDB8'; c.lineWidth = 26; c.lineCap = 'butt'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -60); c.arc(62, -60, 62, Math.PI, 0); c.lineTo(124, 0); c.stroke(); c.restore();
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; const bg = c.createLinearGradient(-100, -80, 100, 90);
  if (ink) { bg.addColorStop(0, '#2E5A4E'); bg.addColorStop(1, '#0E2E26'); } else { bg.addColorStop(0, '#F3CF7C'); bg.addColorStop(0.55, '#C98A22'); bg.addColorStop(1, '#7A4E10'); }
  c.fillStyle = bg; rr(c, -100, -80, 200, 165, 26); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = ink ? '#FBF6E8' : '#2A1A02'; c.beginPath(); c.arc(0, 0, 18, 0, 6.283); c.fill(); c.beginPath(); c.moveTo(-9, 8); c.lineTo(9, 8); c.lineTo(14, 44); c.lineTo(-14, 44); c.closePath(); c.fill();
  c.restore(); }
function key(c, x, y, s, rot, col, teeth, a = 1, dashed = false) { // a key; (x, y) is the tip of the blade
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.arc(-170, 0, 40, 0, 6.283); c.moveTo(-144, 0); c.arc(-170, 0, 16, 0, 6.283, true); c.rect(-132, -10, 132, 20); teeth.forEach((h, i) => c.rect(-70 + i * 20, 10, 14, h));
  if (dashed) { c.setLineDash([12, 10]); c.strokeStyle = col; c.lineWidth = 5; c.stroke(); } else { c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = col; c.fill('evenodd'); }
  c.restore(); }
// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [40, 565, 430, -0.04], dial: [758, 1010, 158] }; // frame-0 composition (also the thumbnail)
const GLY = 'QXJKVZWMPBRT', HL2 = 96; // HL2: second headline line size (measured to fit x 100..900)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + one luminous radio dial + coded letters on the air + "SHE READ THEIR SECRETS"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const [dx, dy, dr] = F0.dial;
  c.save(); c.strokeStyle = 'rgba(255,200,110,1)'; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const ph = ((t * 0.5 + k / 3) % 1); c.globalAlpha = 0.45 * (1 - ph); c.lineWidth = 5; c.beginPath(); c.arc(dx, dy, dr + 45 + ph * 220, Math.PI * 1.08, Math.PI * 1.62); c.stroke(); } c.restore();
  dial(c, dx, dy, dr, 0.38 + 0.03 * Math.sin(t * 1.3));
  photo(c, PORC, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  const rd = ws(8) - 0.05; // "read": from here, letters that reach her turn to gold
  for (let k = 0; k < 4; k++) { const u = ((t * 0.18 + k / 4 + 0.1) % 1); const x = (1 - u) ** 2 * (dx - 20) + 2 * u * (1 - u) * 930 + u * u * 500, y = (1 - u) ** 2 * (dy - dr - 40) + 2 * u * (1 - u) * 470 + u * u * 600;
    const al = pr(u, 0, 0.1) * (1 - pr(u, 0.88, 1)); const gu = t >= rd ? pr(u, 0.6, 0.75, (v) => v) * pr(t, rd, rd + 0.3, (v) => v) : 0;
    flipTile(c, GLY[(k * 5) % GLY.length], 'ciph', GLY[(k * 5) % GLY.length], 'gold', x, y + 8 * Math.sin(t * 2 + k), 64, gu, al); }
  c.restore();
  label(c, 'SHE READ', CX, 1440, 112, C.cream, 'InterX'); label(c, 'THEIR SECRETS', CX, 1566, HL2, C.gold, 'InterX');
}
function scene2(c, t) { // SUPER HOOK: how, without the key? A locked padlock and a missing key
  c.drawImage(BG.b, 0, 0);
  const sh = pr(t, ws(14) - 0.05, ws(14) + 0.35, (u) => u), jig = Math.sin(sh * Math.PI * 6) * 10 * (1 - sh);
  const z = lerp(1.0, 1.05, pr(t, T.cut, T.whip[0], (u) => u)); c.save(); c.translate(CX, 950); c.scale(z, z); c.translate(-CX, -950);
  padlock(c, CX + jig, 860, 1.7, 0, 1, false, 0.6);
  const ka = 0.55 + 0.45 * Math.sin((t - T.cut) * 6); key(c, CX, 1130, 1.45, -Math.PI / 2, 'rgba(251,247,238,0.9)', [26, 14, 30, 18], ka, true);
  c.restore();
}
const COLS = ['X', 'M', 'Q', 'B', 'R', 'K'], HTS = [2, 1, 6, 3, 1, 2], QI = 2, TS = 80, colX = (i) => 250 + i * 100, slotY = (k) => 1360 - k * 88;
const P = [ws(17) - 0.25, ws(21) - 0.25, ws(24) - 0.2], PD = 0.9; // three passes of the same letter E through the same swap
const RAIN = [ws(25) - 0.1, ws(27) + 0.15];
const BOX = [CX, 700];
function scene3(c, t) { // SAME SWAP EVERY TIME: E always becomes Q, so Q piles up highest -> the top Q flips to E
  c.drawImage(BG.c, 0, 0);
  const [bx, by] = BOX; let flash = 0; for (const p of P) flash = Math.max(flash, pr(t, p + PD * 0.38, p + PD * 0.45) * (1 - pr(t, p + PD * 0.5, p + PD * 0.65)));
  c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.fillStyle = '#082A26'; rr(c, bx - 110, by - 90, 220, 180, 26); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = `rgba(241,180,68,${0.6 + 0.4 * flash})`; c.lineWidth = 6; rr(c, bx - 110, by - 90, 220, 180, 26); c.stroke();
  c.strokeStyle = `rgba(241,180,68,${0.35 + 0.6 * flash})`; c.lineWidth = 4; c.lineCap = 'round'; for (const [a, b] of [[0, 3], [1, 0], [2, 4], [3, 1], [4, 2]]) { c.beginPath(); c.moveTo(bx - 80, by - 60 + a * 30); c.bezierCurveTo(bx - 20, by - 60 + a * 30, bx + 20, by - 60 + b * 30, bx + 80, by - 60 + b * 30); c.stroke(); } c.restore();
  glowDot(c, bx, by, flash * 0.9, 150);
  // columns: Q tiles from the three passes, then the rain of other coded letters
  const rain = (i, k) => { const order = (i * 7 + k * 3) % 11; return pr(t, RAIN[0] + order * 0.045, RAIN[0] + order * 0.045 + 0.32, eout); };
  const glow = pr(t, ws(27) - 0.05, ws(27) + 0.25, eout); if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(colX(QI), 1140, 20, colX(QI), 1140, 320); g.addColorStop(0, `rgba(241,180,68,${0.45 * glow})`); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.fillRect(colX(QI) - 320, 800, 640, 660); c.restore(); }
  COLS.forEach((ch, i) => { for (let k = 0; k < HTS[i]; k++) {
    if (i === QI && k < 3) { const p0 = P[k] + PD, u = pr(t, p0, p0 + 0.5, eio); if (t < p0) continue; const x = (1 - u) ** 2 * 830 + 2 * u * (1 - u) * 720 + u * u * colX(i), y = (1 - u) ** 2 * by + 2 * u * (1 - u) * 520 + u * u * slotY(k); tile(c, ch, x, y, TS, 'ciph'); continue; }
    const u = rain(i, k); if (u <= 0) continue; const y = lerp(560, slotY(k), u);
    if (i === QI && k === HTS[i] - 1) flipTile(c, 'Q', 'ciph', 'E', 'gold', colX(i), y, TS, pr(t, ws(27) + 0.05, ws(27) + 0.4, (v) => v), pr(u, 0, 0.3));
    else tile(c, ch, colX(i), y, TS, 'ciph', pr(u, 0, 0.3)); } });
  // the passes: plain E slides in, coded Q slides out
  P.forEach((p, k) => { const u = (t - p) / PD; if (u < 0 || u > 1) return;
    if (u < 0.42) tile(c, 'E', lerp(170, bx - 40, pr(u, 0, 0.4, eout)), by, 100, 'plain', pr(u, 0, 0.08) * (1 - pr(u, 0.34, 0.42)));
    if (u > 0.5) tile(c, 'Q', lerp(bx + 40, 830, pr(u, 0.5, 0.95, eout)), by, 100, 'ciph', pr(u, 0.5, 0.58)); });
}
const NSLIP = 14, LAND = Array.from({ length: NSLIP }, (_, i) => lerp(T.push[1] + 0.05, ws(36) + 0.15, i / (NSLIP - 1)));
function slip(c, x, y, rot, seed, chk, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#FBF6E8'; rr(c, -280, -160, 560, 320, 10); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = 'rgba(18,59,49,0.28)'; for (let r = 0; r < 4; r++) for (let g = 0; g < 5; g++) { if (rnd(seed * 31 + r * 7 + g, 3) < 0.12) continue; rr(c, -230 + g * 94, -100 + r * 56, 76, 26, 6); c.fill(); }
  if (chk > 0) { c.strokeStyle = C.goldDeep; c.lineWidth = 20; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); const p1 = [120, 20], p2 = [175, 90], p3 = [270, -60]; c.moveTo(...p1); const u1 = clamp(chk * 2), u2 = clamp(chk * 2 - 1); c.lineTo(lerp(p1[0], p2[0], u1), lerp(p1[1], p2[1], u1)); if (u2 > 0) c.lineTo(lerp(p2[0], p3[0], u2), lerp(p2[1], p3[1], u2)); c.stroke(); }
  c.restore(); }
const fmt = (n) => n.toLocaleString('en-US');
function scene4(c, t) { // OVER 12,000 MESSAGES: coded slips land on a growing pile, each ticked; the counter runs to 12,000+
  c.drawImage(BG.a, 0, 0);
  const base = 1300;
  for (let i = 0; i < NSLIP; i++) { const tl = LAND[i]; const u = pr(t, tl - 0.35, tl, eout); if (u <= 0) continue; const ry = base - i * 7, rot = (rnd(i, 5) - 0.5) * 0.12;
    slip(c, lerp(1250, CX + (rnd(i, 9) - 0.5) * 30, u), lerp(ry - 260, ry, u), lerp(0.5, rot, u), i, pr(t, tl + 0.02, tl + 0.25, (v) => v)); }
  const n = Math.round(12000 * pr(t, ws(32) - 0.1, ws(35) + 0.15, eout));
  c.save(); c.font = '800 150px Fraunces'; const w = c.measureText('12,000').width; c.restore();
  const ca = pr(t, ws(32) - 0.25, ws(32) - 0.05, eout); label(c, fmt(n), CX + w / 2 - 20, 820, 150, C.gold, 'Fraunces', ca, 'right');
  label(c, '+', CX + w / 2 - 12, 820, 150, C.gold, 'Fraunces', pr(t, ws(35) + 0.1, ws(35) + 0.3, eout), 'left');
}
const K = [ws(42) - 0.05, ws(44) - 0.05, ws(46) - 0.05], OUTL = ['Q', 'X', 'M'], ROW = [380, 500, 620], RC = [CX, 830], RR = 170, BROKE = ws(51) - 0.1;
function rotor(c, x, y, r, ang, a = 1) { // an Enigma-style rotor seen face-on: serrated thumbwheel, ring of 26 letters, wired core (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 40; c.shadowOffsetY = 16;
  c.fillStyle = '#3B3F3D'; c.beginPath(); for (let i = 0; i < 52; i++) { const an = ang + i * Math.PI / 26, rr_ = r + (i % 2 ? 0 : 12); c.lineTo(Math.cos(an) * rr_, Math.sin(an) * rr_); } c.closePath(); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 10, 0, 0, r); g.addColorStop(0, '#6E7470'); g.addColorStop(1, '#262A28'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r - 6, 0, 6.283); c.fill();
  c.fillStyle = '#E9E3D0'; c.beginPath(); c.arc(0, 0, r * 0.84, 0, 6.283); c.arc(0, 0, r * 0.64, 0, 6.283, true); c.fill('evenodd');
  c.fillStyle = '#2A2A26'; c.font = `800 ${Math.round(r * 0.13)}px Mono`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < 26; i++) { const an = ang + i * 2 * Math.PI / 26 - Math.PI / 2; c.save(); c.rotate(an + Math.PI / 2); c.fillText(String.fromCharCode(65 + i), 0, -r * 0.74); c.restore(); }
  c.fillStyle = '#1C1F1E'; c.beginPath(); c.arc(0, 0, r * 0.6, 0, 6.283); c.fill(); c.fillStyle = '#9A8F70'; for (let i = 0; i < 8; i++) { const an = ang + i * Math.PI / 4; c.beginPath(); c.arc(Math.cos(an) * r * 0.42, Math.sin(an) * r * 0.42, 9, 0, 6.283); c.fill(); }
  c.fillStyle = '#B9B2A0'; c.beginPath(); c.arc(0, 0, r * 0.16, 0, 6.283); c.fill(); c.restore(); }
function scene5(c, t) { // ENIGMA: the same key E gives Q, then X, then M as the rotor steps on every press -> her team still broke it: all three read E
  c.drawImage(BG.b, 0, 0);
  const [rx, ry] = RC, inA = pr(t, T.push2[0], T.push2[1] + 0.35, eout); // present while the page pushes in
  let steps = 0; K.forEach((k) => { steps += pr(t, k, k + 0.2, eio); });
  let wire = 0, kk = -1; K.forEach((k, i) => { const w = pr(t, k + 0.05, k + 0.15) * (1 - pr(t, k + 0.45, k + 0.6)); if (w > wire) { wire = w; kk = i; } });
  if (wire > 0) { const cy = [ry - 120, ry + 130, ry - 30][kk]; c.save(); c.strokeStyle = `rgba(241,180,68,${wire})`; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.8)'; c.shadowBlur = 20; c.beginPath(); c.moveTo(200, ry); c.lineTo(rx - RR - 10, ry); c.bezierCurveTo(rx - 60, cy, rx + 60, 2 * ry - cy, rx + RR + 10, ry); c.lineTo(800, ry); c.stroke(); c.restore(); }
  c.save(); c.translate(rx, ry); const sc = lerp(0.85, 1, inA); c.scale(sc, sc); c.translate(-rx, -ry); rotor(c, rx, ry, RR, steps * 2 * Math.PI / 26, inA); c.restore();
  if (wire > 0) { c.save(); c.strokeStyle = `rgba(241,180,68,${wire})`; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.8)'; c.shadowBlur = 20; const cy = [ry - 120, ry + 130, ry - 30][kk]; c.beginPath(); c.moveTo(rx - RR * 0.6, lerp(ry, cy, 0.25)); c.bezierCurveTo(rx - 40, cy, rx + 40, 2 * ry - cy, rx + RR * 0.6, lerp(ry, 2 * ry - cy, 0.25)); c.stroke(); c.restore(); }
  let press = 0; K.forEach((k) => { press = Math.max(press, pr(t, k - 0.06, k) * (1 - pr(t, k + 0.08, k + 0.2))); });
  tile(c, 'E', 150, ry + 8 * press, 100 * (1 - 0.08 * press), 'plain', pr(t, T.push2[0], T.push2[1] + 0.3, eout));
  K.forEach((k, i) => { const on = pr(t, k + 0.12, k + 0.22), off = i < 2 ? pr(t, K[i + 1] + 0.05, K[i + 1] + 0.12) : pr(t, k + 0.55, k + 0.9); const drop = pr(t, k + 0.3, k + 0.75, eio);
    if (on > 0 && drop < 1) tile(c, OUTL[i], 850, ry, 100, 'ciph', on * (1 - off) * (1 - drop));
    if (drop > 0) { const x = lerp(850, ROW[i], drop), y = lerp(ry, 1190, drop) - Math.sin(Math.PI * drop) * 80; flipTile(c, OUTL[i], 'ciph', 'E', 'gold', x, y, 100, pr(t, BROKE + i * 0.14, BROKE + i * 0.14 + 0.32, (v) => v), drop); } });
  const bg = pr(t, BROKE + 0.3, BROKE + 0.7, eout); if (bg > 0) glowDot(c, CX, 1190, bg * 0.8, 260);
  label(c, 'ENIGMA', CX, 1450, 92, C.cream, 'InterX', pr(t, ws(40) - 0.15, ws(40) + 0.2, eout));
}
const LK = [270, 500, 730], LY = 1080, OPEN = [ws(56) - 0.05, ws(57) + 0.05, ws(58) + 0.1], SHUT = ws(59) - 0.05, NEWK = ws(60) - 0.1, CARD = ws(62) - 0.2;
const KEYC = [['#E3A73A', [26, 12, 30, 18]], ['#3E9C8C', [14, 30, 18, 26]], ['#5B7FD6', [30, 22, 10, 28]]];
function scene6(c, t) { // PAYOFF: one key (a repeated pattern) opens every lock; a different key for each lock keeps the rest shut
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, PORC, 0.464, 0.21, 0.21, CX, 650, 112, 1);
  const shut = pr(t, SHUT, SHUT + 0.25, eio);
  LK.forEach((x, i) => { const op = pr(t, OPEN[i] + 0.12, OPEN[i] + 0.3, eout) * (1 - shut); padlock(c, x, LY, 0.72, op, 1, true, op, [200, 70, 60]); });
  // the one shared red key hops from lock to lock
  const ka = pr(t, T.turn[1] + 0.1, T.turn[1] + 0.5, eout) * (1 - pr(t, SHUT, SHUT + 0.3));
  if (ka > 0) { let kx = 600, ky = 1330, kr = 0;
    OPEN.forEach((o, i) => { const u = pr(t, o - 0.25, o, eio); if (u > 0) { kx = lerp(i ? LK[i - 1] : 600, LK[i], u); ky = lerp(i ? LY + 20 : 1330, LY + 20, u); kr = i ? -Math.PI / 2 : lerp(0, -Math.PI / 2, u); } });
    const fall = pr(t, SHUT, SHUT + 0.3, (u) => u * u); key(c, kx, ky + fall * 120, 0.62, kr, REDK, [26, 12, 30, 18], ka); }
  KEYC.forEach(([col, teeth], i) => { const u = pr(t, NEWK + i * 0.1, NEWK + i * 0.1 + 0.35, eout); if (u > 0) key(c, LK[i], LY + 20 + (1 - u) * 80, 0.62, -Math.PI / 2, col, teeth, u); });
  const ca = pr(t, CARD, CARD + 0.35, eout); if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 170, 1400, 660, 130, 24); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 58px InterX'; c.textAlign = 'center'; c.fillText('one key per lock', CX, 1486); c.restore(); }
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
  const cues = { T, sweep: 0.4, beeps: 2.9, read: ws(8) - 0.05, cut: T.cut, keyq: ws(14) - 0.05, whip: T.whip, pass: P, PD, rain: RAIN, flip: ws(27) + 0.05, push: T.push, land: LAND, count: [ws(32) - 0.1, ws(35) + 0.15], plus: ws(35) + 0.1,
    push2: T.push2, enigma: ws(40) - 0.15, press: K, broke: BROKE, turn: T.turn, open: OPEN, shut: SHUT, newk: NEWK, card: CARD, cta: T.cta };
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
