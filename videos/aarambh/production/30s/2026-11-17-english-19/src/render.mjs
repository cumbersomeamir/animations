// Aarambh english-19 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25) and the
// 2026-11-15 first-frame addendum: frame 0 = real portrait + the real 1814 skull plate + "A MONSTER IN THE CLIFF?" (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: Mary Anning and her first ichthyosaur — as a girl she dug a five-metre skeleton from a cliff -> locals said monster, scientists guessed crocodile; what was it?
// -> her brother Joseph found the skull (1811); she spent months freeing the body (1812) -> experts later named it Ichthyosaurus, an extinct sea reptile
// -> her finds inspired the first scene of ancient life drawn from fossils (De la Beche, Duria Antiquior, 1830) -> papers often skipped her name; lesson: credit the finder.
// Archival objects (public domain): portrait of Mary Anning (before 1842; Natural History Museum, London); Everard Home's 1814 plates of the skull and part of the
// skeleton (Philosophical Transactions); Duria Antiquior (Henry De la Beche, 1830); her own letter with a plesiosaur sketch (1823; Wellcome Collection).
// Ichthyosaur outline, rock, rings, plates, stamp and cards are original illustration.
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; token 6 is the surname)
  [0, 6, ['As a girl, fossil', 'hunter Mary Anning']],
  [7, 14, ['dug a five-metre', 'skeleton from a cliff.']],
  [15, 19, ['Locals called it', 'a monster;']],
  [20, 23, ['scientists guessed', 'a crocodile.']],
  [24, 26, ['What was it?']],
  [27, 31, ['Her brother', 'found the skull;']],
  [32, 37, ['she spent months', 'freeing the body.']],
  [38, 42, ['Experts later named', 'it Ichthyosaurus:']],
  [43, 46, ['an extinct', 'sea reptile.']],
  [47, 52, ['Her finds inspired', 'the first scene']],
  [53, 58, ['of ancient life', 'drawn from fossils.']],
  [59, 64, ['Yet papers often', 'skipped her name.']],
  [65, 68, ['Lesson:', 'credit the finder.']],
  [69, 74, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 15: SENT[1].start, 27: SENT[2].start, 38: SENT[3].start, 47: SENT[4].start, 59: SENT[5].start, 69: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                      // hard cut on "Locals called it a monster" -> the real 1814 skull plate, close
  whip: [SENT[2].start - 0.2, SENT[2].start],     // whip pan to the dig: skull (Joseph) and body (Mary) freed from the rock
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05], // push to the named animal: Ichthyosaurus, an extinct sea reptile
  push2: [SENT[4].start - 0.3, SENT[4].start],    // push to De la Beche's Duria Antiquior (1830)
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to her own letter and the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR0 = await loadImage(path.join(ROOT, 'assets/mary-anning-portrait-before-1842-nhm-pd.jpg'));
const SKULL = await loadImage(path.join(ROOT, 'assets/home-1814-ichthyosaur-skull-plate-pd.jpg'));
const SKEL = await loadImage(path.join(ROOT, 'assets/home-1814-ichthyosaur-skeleton-plate-pd.jpg'));
const DURIA = await loadImage(path.join(ROOT, 'assets/de-la-beche-duria-antiquior-1830-pd.jpg'));
const LETTER = await loadImage(path.join(ROOT, 'assets/mary-anning-plesiosaur-letter-1823-wellcome-pd.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const POR = crop(POR0, 0.03, 0.09, 0.69, 0.66); // Mary Anning with her hammer and basket, the cliff behind
const PORF = crop(POR0, 0.08, 0.10, 0.62, 0.50); // closer: her face, cape and hammer (frame 0)
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
function plate(c, lines, y, a, x = CX) { // a dark label plate: [[text, size, font, col], ...]
  if (a <= 0) return; c.save(); c.globalAlpha = a; let w = 0; for (const [tx, sz, f] of lines) { c.font = `800 ${sz}px ${f}`; w = Math.max(w, c.measureText(tx).width); } w += 64; const h = lines.reduce((s, l) => s + l[1] * 1.25, 0) + 40;
  c.translate(0, (1 - a) * 24); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = 'rgba(2,28,22,0.93)'; rr(c, x - w / 2, y, w, h, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = C.gold; c.lineWidth = 3; rr(c, x - w / 2, y, w, h, 20); c.stroke(); c.textAlign = 'center'; let yy = y + 20;
  for (const [tx, sz, f, col] of lines) { yy += sz * 1.05; c.font = `800 ${sz}px ${f}`; c.fillStyle = col; c.fillText(tx, x, yy); yy += sz * 0.2; } c.restore(); }
function ring(c, x, y, r, a, pulse = 0) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.gold; c.lineWidth = 7; c.shadowColor = 'rgba(241,180,68,0.8)'; c.shadowBlur = 20; c.beginPath(); c.arc(x, y, r * (0.6 + 0.4 * a), 0, 6.283); c.stroke();
  if (pulse > 0) { c.globalAlpha = a * (1 - pulse) * 0.8; c.beginPath(); c.arc(x, y, r * (1 + pulse * 0.9), 0, 6.283); c.stroke(); } c.restore(); }
const ROCK = (() => { const w = 900, h = 640, cv = createCanvas(w, h), c = cv.getContext('2d'); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7A6B55'); g.addColorStop(0.5, '#6A5C48'); g.addColorStop(1, '#55493A'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 7; k++) { const y = (k + 0.5) * h / 7 + (rnd(k, 3) - 0.5) * 30; c.fillStyle = `rgba(${k % 2 ? 40 : 150},${k % 2 ? 32 : 135},${k % 2 ? 24 : 110},0.14)`; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 60) c.lineTo(x, y + Math.sin(x / 140 + k) * 10); c.lineTo(w, y + 40); c.lineTo(0, y + 40); c.closePath(); c.fill(); }
  c.globalAlpha = 0.5; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(grainA, 'repeat'); c.fillRect(0, 0, w, h); return cv; })();
const rockTmp = createCanvas(ROCK.width, ROCK.height);
function rockCover(c, x, y, w, h, p, t) { // rock over the print, chipped away left -> right as p goes 0 -> 1 (illustration of the months of work)
  const k = rockTmp.getContext('2d'); k.setTransform(1, 0, 0, 1, 0, 0); k.globalCompositeOperation = 'source-over'; k.clearRect(0, 0, ROCK.width, ROCK.height); k.drawImage(ROCK, 0, 0);
  if (p > 0) { k.globalCompositeOperation = 'destination-out'; const edge = p * (ROCK.width + 120) - 60; k.fillStyle = '#000'; k.fillRect(0, 0, Math.max(0, edge - 40), ROCK.height);
    for (let i = 0; i < 40; i++) { const yy = (i + 0.5) * ROCK.height / 40, r = 26 + 22 * rnd(i, 7); k.beginPath(); k.arc(edge - 40 + 30 * rnd(i, 9), yy, r, 0, 6.283); k.fill(); } }
  c.save(); c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 20; c.drawImage(rockTmp, x - 14, y - 14, w + 28, h + 28); c.restore();
  if (p > 0 && p < 1) { const ex = x - 14 + (p * (ROCK.width + 120) - 60) * (w + 28) / ROCK.width; for (let i = 0; i < 9; i++) { const ph = (t * 1.7 + rnd(i, 4)) % 1; glowDot(c, ex + 20 * rnd(i, 2) + ph * 40, y + (h * rnd(i, 6)) + ph * 60, 0.5 * (1 - ph), 8, [220, 200, 160]); } }
}
function ichthy(c, x, y, L, t, stone = 0, a = 1) { // a stylised ichthyosaur (illustration; modern outline), facing left; stone 0..1 turns it grey and still
  if (a <= 0) return; const s = L, sw = (1 - stone) * Math.sin(t * 5) * 0.06; c.save(); c.globalAlpha = a; c.translate(x, y + (1 - stone) * Math.sin(t * 2.2) * 8);
  const col = (r1, g1, b1, r2, g2, b2) => `rgb(${Math.round(lerp(r1, r2, stone))},${Math.round(lerp(g1, g2, stone))},${Math.round(lerp(b1, b2, stone))})`;
  const body = c.createLinearGradient(0, -0.14 * s, 0, 0.14 * s); body.addColorStop(0, col(235, 190, 95, 150, 146, 138)); body.addColorStop(1, col(140, 98, 34, 92, 88, 82));
  c.shadowColor = `rgba(241,180,68,${0.55 * (1 - stone)})`; c.shadowBlur = 40; c.fillStyle = body;
  // tail fin (pivots at the tail stock)
  c.save(); c.translate(0.36 * s, -0.01 * s); c.rotate(sw); c.beginPath(); c.moveTo(0, -0.02 * s); c.quadraticCurveTo(0.08 * s, -0.08 * s, 0.15 * s, -0.17 * s); c.quadraticCurveTo(0.11 * s, -0.04 * s, 0.07 * s, 0); c.quadraticCurveTo(0.11 * s, 0.05 * s, 0.14 * s, 0.14 * s); c.quadraticCurveTo(0.07 * s, 0.07 * s, 0, 0.025 * s); c.closePath(); c.fill(); c.restore();
  // body
  c.beginPath(); c.moveTo(-0.5 * s, 0); c.quadraticCurveTo(-0.32 * s, -0.035 * s, -0.22 * s, -0.075 * s); c.quadraticCurveTo(-0.08 * s, -0.15 * s, 0.1 * s, -0.12 * s); c.quadraticCurveTo(0.27 * s, -0.07 * s, 0.37 * s, -0.025 * s);
  c.lineTo(0.37 * s, 0.03 * s); c.quadraticCurveTo(0.22 * s, 0.09 * s, 0.02 * s, 0.125 * s); c.quadraticCurveTo(-0.18 * s, 0.11 * s, -0.3 * s, 0.035 * s); c.quadraticCurveTo(-0.4 * s, 0.015 * s, -0.5 * s, 0.008 * s); c.closePath(); c.fill();
  // dorsal fin, flippers
  c.beginPath(); c.moveTo(-0.02 * s, -0.125 * s); c.quadraticCurveTo(0.06 * s, -0.24 * s, 0.13 * s, -0.105 * s); c.closePath(); c.fill();
  c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = col(120, 80, 20, 70, 68, 64); c.lineWidth = 0.006 * s; c.stroke();
  c.fillStyle = col(196, 140, 52, 120, 116, 108);
  c.save(); c.translate(-0.13 * s, 0.07 * s); c.rotate(0.55 + sw * 2); c.beginPath(); c.ellipse(0.075 * s, 0, 0.1 * s, 0.028 * s, 0, 0, 6.283); c.fill(); c.stroke(); c.restore();
  c.save(); c.translate(0.14 * s, 0.065 * s); c.rotate(0.6 - sw * 2); c.beginPath(); c.ellipse(0.045 * s, 0, 0.06 * s, 0.019 * s, 0, 0, 6.283); c.fill(); c.stroke(); c.restore();
  c.shadowColor = 'rgba(0,0,0,0)';
  // the big eye with its bony ring (as in the 1814 skull plate)
  c.fillStyle = col(30, 22, 10, 70, 68, 64); c.beginPath(); c.arc(-0.24 * s, -0.035 * s, 0.032 * s, 0, 6.283); c.fill();
  c.strokeStyle = col(255, 236, 190, 190, 186, 178); c.lineWidth = 0.008 * s; c.beginPath(); c.arc(-0.24 * s, -0.035 * s, 0.032 * s, 0, 6.283); c.stroke();
  c.strokeStyle = col(110, 74, 20, 80, 78, 72); c.lineWidth = 0.004 * s; c.beginPath(); c.moveTo(-0.5 * s, 0.004 * s); c.lineTo(-0.3 * s, 0.012 * s); c.stroke();
  if (stone > 0) { c.globalAlpha = a * stone * 0.35; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(grainB, 'repeat'); c.fillRect(-0.55 * s, -0.3 * s, 1.1 * s, 0.6 * s); }
  c.restore(); }
// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [330, 545, 560, 0.03], skull: [55, 990, 880, -0.05] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + the real 1814 skull plate + "A MONSTER IN THE CLIFF?"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, PORF, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  photo(c, SKULL, ...F0.skull, 1, t > 0.8 ? pr(t, 0.8, 2.1, (u) => u) : -1);
  c.restore();
  label(c, 'A MONSTER', CX, 1500, 112, C.cream, 'InterX'); label(c, 'IN THE CLIFF?', CX, 1625, 100, C.gold, 'InterX');
}
function scene2(c, t) { // the question: locals said monster, scientists guessed crocodile — the real skull, close
  c.drawImage(BG.b, 0, 0);
  const u = pr(t, T.cut, T.whip[0], (v) => v), z = lerp(1.0, 1.08, u); c.save(); c.translate(CX, 860); c.scale(z, z); c.translate(-CX, -860);
  photo(c, SKULL, 60, 700, 960, 0.0, 1, t > T.cut + 0.2 ? pr(t, T.cut + 0.2, T.cut + 1.5, (v) => v) : -1); c.restore();
  const qa = pr(t, ws(24) - 0.2, ws(24) + 0.15, eout), m = pr(t, ws(19) - 0.15, ws(19) + 0.2, eout) * (1 - qa), k = pr(t, ws(23) - 0.15, ws(23) + 0.2, eout) * (1 - qa);
  plate(c, [['monster?', 64, 'Fraunces', C.cream]], 1180, m, 300); plate(c, [['crocodile?', 64, 'Fraunces', C.gold]], 1180, k, 690);
  label(c, '?', CX, 1420, 220, C.gold, 'Fraunces', qa * (0.9 + 0.1 * Math.sin((t - ws(24)) * 5)));
}
const SK = { x: 160, y: 545, w: 680 }; SK.h = SK.w * SKULL.height / SKULL.width;
const BD = { x: 110, y: 960, w: 780 }; BD.h = BD.w * SKEL.height / SKEL.width;
function scene3(c, t) { // PROOF 1: who found what — the skull (Joseph, 1811), then the body freed from the rock by Mary (1812)
  c.drawImage(BG.c, 0, 0);
  photo(c, SKULL, SK.x, SK.y, SK.w, -0.01, 1);
  plate(c, [['JOSEPH · skull · 1811', 40, 'InterX', C.cream]], SK.y + SK.h + 26, pr(t, ws(28) - 0.15, ws(28) + 0.25, eout));
  photo(c, SKEL, BD.x, BD.y, BD.w, 0.008, 1);
  rockCover(c, BD.x, BD.y, BD.w, BD.h, pr(t, ws(33) - 0.2, ws(37) + 0.3, (v) => v), t);
  plate(c, [['MARY · body · 1812', 40, 'InterX', C.gold]], BD.y + BD.h + 30, pr(t, ws(32) - 0.15, ws(32) + 0.25, eout));
}
function scene4(c, t) { // PROOF 2: named Ichthyosaurus — an extinct sea reptile (the animal "turns to stone")
  c.drawImage(BG.a, 0, 0);
  const sw = pr(t, T.push[1] - 0.05, T.push[1] + 0.9, eout), st = pr(t, ws(44) - 0.15, ws(44) + 0.45);
  ichthy(c, CX + 20 + (1 - sw) * 520, 900, 820, t, st, 1);
  label(c, 'Ichthyosaurus', CX, 1250, 92, C.cream, 'Fraunces', pr(t, ws(42) - 0.15, ws(42) + 0.25, eout));
  label(c, '"fish lizard"', CX, 1320, 36, 'rgba(251,247,238,0.7)', 'Mono', pr(t, ws(42), ws(42) + 0.4, eout));
  stamp(c, ['EXTINCT', 'SEA REPTILE'], CX, 1480, pr(t, ws(44) - 0.1, ws(45) + 0.1, eout), -0.05, C.gold, 'rgba(2,28,22,0.85)');
}
const DU = { w: 980 }; DU.h = DU.w * DURIA.height / DURIA.width; const DP = { ich: [0.665, 0.535] };
function scene5(c, t) { // PROOF 3: Duria Antiquior (1830), the first scene of ancient life drawn from fossils — inspired by her finds
  c.drawImage(BG.b, 0, 0);
  const u = pr(t, T.push2[1], T.turn[0], (v) => v), fx = lerp(0.5, DP.ich[0], eio(u)), fy = lerp(0.5, DP.ich[1], eio(u)), z = lerp(1.0, 1.3, eio(u));
  const w = DU.w * z, h = DU.h * z, x = CX - fx * w, y = 930 - fy * h; photo(c, DURIA, x, y, w, 0, 1, t > T.push2[1] + 0.1 ? pr(t, T.push2[1] + 0.1, T.push2[1] + 1.6, (v) => v) : -1);
  const ra = pr(t, ws(51) - 0.15, ws(51) + 0.3, eout); ring(c, x + DP.ich[0] * w, y + DP.ich[1] * h, 120 * z, ra, t > ws(51) ? ((t - ws(51)) % 1.3) / 1.3 : 0);
  plate(c, [['Duria Antiquior · 1830', 40, 'Mono', C.cream], ['drawn from fossils', 54, 'Fraunces', C.gold]], 1390, pr(t, ws(55) - 0.1, ws(56) + 0.2, eout));
}
const LT = { x: 80, y: 540, w: 470 }; LT.h = LT.w * LETTER.height / LETTER.width;
function scene6(c, t) { // PAYOFF: her own sketch and letter (1823); papers often skipped her name; credit the finder
  c.drawImage(PAPER, 0, 0);
  photo(c, LETTER, LT.x, LT.y, LT.w, -0.025, 1, t > T.turn[1] + 0.1 ? pr(t, T.turn[1] + 0.1, T.turn[1] + 1.5, (v) => v) : -1);
  label(c, 'her own sketch, 1823', LT.x + LT.w / 2, LT.y + LT.h + 62, 30, C.goldDeep, 'Mono', pr(t, T.turn[1], T.turn[1] + 0.4, eout));
  circlePortrait(c, POR, 0.488, 0.2, 0.15, 770, 760, 125, 1);
  const skip = pr(t, ws(62) - 0.15, ws(64) + 0.1), cred = pr(t, ws(66) - 0.2, ws(66) + 0.3, eout);
  label(c, 'MARY ANNING', 770, 960, 40, cred > 0 ? C.goldDeep : C.ink, 'InterX', 1 - 0.75 * skip + 0.75 * cred);
  if (skip > 0 && cred < 1) { c.save(); c.globalAlpha = skip * (1 - cred); c.strokeStyle = 'rgba(18,59,49,0.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(640, 946); c.lineTo(640 + 260 * skip, 946); c.stroke(); c.restore(); }
  const ca = cred; if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 150, 1400, 700, 130, 22); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 54px InterX'; c.textAlign = 'center'; c.fillText('credit the finder', CX, 1485); c.restore(); }
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
  const cues = { T, sweep: 0.4, sweep2: 0.8, cut: T.cut, monster: ws(19) - 0.15, croc: ws(23) - 0.15, q: ws(24) - 0.2, whip: T.whip, joseph: ws(28) - 0.15, mary: ws(32) - 0.15, chip: [ws(33) - 0.2, ws(37) + 0.3],
    push: T.push, swim: [T.push[1] - 0.05, T.push[1] + 0.9], name: ws(42) - 0.15, stone: ws(44) - 0.15, stamp: ws(44) - 0.1,
    push2: T.push2, ring: ws(51) - 0.15, plate: ws(55) - 0.1, turn: T.turn, skip: ws(62) - 0.15, credit: ws(66) - 0.2, cta: T.cta };
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
