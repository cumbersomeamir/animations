// Aarambh english-15 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25)
// and the 2026-11-15 first-frame addendum: frame 0 is a finished composition (real portrait + real unopened bottle + "STOPPED AT THE DOOR"), no fade/flicker/intro,
// narration from 0.05 s, and the thumbnail is frame 0. One visual idea per scene, large brief labels, captions inside x 100..900 (plate centred at x = 500).
// Story: Frances Oldham Kelsey and thalidomide — an FDA reviewer refused a pill sold in dozens of countries -> it was thalidomide; why did she say no?
// -> the safety evidence was too thin -> the company kept pressing; she kept asking for reliable evidence -> researchers linked it to severe birth defects;
// it was never marketed in the U.S. -> lesson: popularity isn't proof of safety; ask what the evidence shows.
// Archival objects (all U.S. government works, public domain): NLM portrait of Frances Kelsey; FDA photo "Kevadon (thalidomide), 1960" (the real investigational bottle);
// FDA photo of Kelsey in the 1960s at a desk with stacks of documents (FDA 171). Everything else (dots, gauge, envelopes, building, timeline, scale) is original illustration.
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
  [0, 5, ['In 1960, an FDA', 'reviewer refused']],
  [6, 12, ['a pill sold in', 'dozens of countries.']],
  [13, 15, ['It was thalidomide.']],
  [16, 20, ['Why did she say no?']],
  [21, 28, ['Frances Kelsey found its', 'safety evidence too thin.']],
  [29, 32, ['The company', 'kept pressing;']],
  [33, 38, ['she kept asking for', 'reliable evidence.']],
  [39, 46, ['Then researchers linked it', 'to severe birth defects;']],
  [47, 54, ['it was never marketed', 'in the U.S.']],
  [55, 60, ['Lesson: popularity', "isn't proof of safety;"]],
  [61, 65, ['ask what the', 'evidence shows.']],
  [66, 71, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 13: SENT[1].start, 21: SENT[2].start, 29: SENT[3].start, 39: SENT[4].start, 55: SENT[5].start, 66: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                   // hard cut on "It was thalidomide" -> the real label close-up
  whip: [SENT[2].start - 0.2, SENT[2].start],    // whip pan to the FDA photo of her at a desk
  turn: [SENT[3].start - 0.35, SENT[3].start],   // page turn to the pressure page
  push: [SENT[4].start - 0.25, SENT[4].start],   // push to the timeline
  push2: [SENT[5].start - 0.3, SENT[5].start],   // push to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/frances-kelsey-portrait-nlm-pd.png'));
const KEV = await loadImage(path.join(ROOT, 'assets/kevadon-thalidomide-1960-fda-pd.jpg'));
const DESK = await loadImage(path.join(ROOT, 'assets/frances-kelsey-1960s-fda171-pd.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const BOTTLE = crop(KEV, 0.33, 0.0, 0.85, 1.0);   // the whole real bottle
const LABEL = crop(KEV, 0.40, 0.44, 0.75, 0.80);  // the real label: KEVADON / thalidomide / caution line
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
const INK = '#16302A', RED = '#C0503A';
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function stamp(c, lines, x, y, a, rot = -0.06, col = C.goldDeep, bg = 'rgba(2,28,22,0.55)') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; return c.measureText(l).width; })) + 48, h = 30 + lines.length * 50;
  if (bg) { c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); } c.strokeStyle = col; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; c.fillText(l, 0, -h / 2 + 58 + i * 48); }); c.restore(); }
function envelope(c, x, y, s, rot, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 16; c.shadowOffsetY = 6; c.fillStyle = '#F4EEDF'; rr(c, -60, -40, 120, 80, 6); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(90,70,40,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-60, -40); c.lineTo(0, 6); c.lineTo(60, -40); c.stroke(); c.restore(); }
function building(c, x, yb, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#3F5B52'; c.fillRect(x - 110, yb - 260, 220, 260); c.fillRect(x - 70, yb - 330, 70, 80); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = 'rgba(246,215,154,0.85)'; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) c.fillRect(x - 90 + k * 48, yb - 236 + r * 56, 28, 34); c.fillStyle = '#2A3F38'; c.fillRect(x - 22, yb - 64, 44, 64); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
const qpt = (x0, y0, x1, y1, bend, u) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + bend, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; return [a * x0 + b * mx + d * x1, a * y0 + b * my + d * y1]; };
function docStack(c, x, yb, n, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; for (let k = 0; k < n; k++) { c.save(); c.translate(x + (k % 2 ? 4 : -4), yb - k * 14); c.rotate((k % 3 - 1) * 0.03); c.fillStyle = k % 2 ? '#FFFDF6' : '#F1EAD8'; c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 8; c.fillRect(-56, -12, 112, 14); c.restore(); } c.restore(); }

// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [60, 600, 390, -0.03], bot: [565, 545, 365, 0.025] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + real unopened bottle + "STOPPED AT THE DOOR"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, BOTTLE, ...F0.bot, 1, t > 0.3 ? pr(t, 0.3, 1.6, (u) => u) : -1);
  photo(c, POR, ...F0.por, 1, t > 0.5 ? pr(t, 0.5, 1.8, (u) => u) : -1);
  const ref = pr(t, ws(5) - 0.1, ws(5) + 0.3, eout);
  if (ref > 0) { c.save(); c.globalAlpha = ref; c.strokeStyle = C.gold; c.lineWidth = 10; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.7)'; c.shadowBlur = 20; const x = 507; c.beginPath(); c.moveTo(x, lerp(1170, 540, ref)); c.lineTo(x, 1170); c.stroke(); c.restore(); }
  c.restore();
  label(c, 'STOPPED AT', CX, 1300, 104, C.cream, 'InterX'); label(c, 'THE DOOR', CX, 1430, 118, C.gold, 'InterX');
}
const UL = [0.27, 0.66, 0.49]; // underline under "thalidomide" on the label crop (x0, x1, y fractions)
function scene2(c, t) { // SUPER HOOK: hard cut to the real label; "thalidomide" underlined; the question
  c.drawImage(BG.b, 0, 0);
  const u = t - T.cut, z = lerp(1.0, 1.06, clamp(u / 2.6)), w = 820, h = w * LABEL.height / LABEL.width, x = CX - w / 2, y = 560;
  c.save(); c.translate(CX, y + h / 2); c.scale(z, z); c.translate(-CX, -(y + h / 2)); photo(c, LABEL, x, y, w, -0.01, 1);
  const ul = pr(t, ws(15) - 0.1, ws(15) + 0.4); if (ul > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.6)'; c.shadowBlur = 14; c.beginPath(); c.moveTo(x + w * UL[0], y + h * UL[2]); c.lineTo(x + w * lerp(UL[0], UL[1], ul), y + h * UL[2]); c.stroke(); c.restore(); }
  c.restore();
  label(c, '?', CX, 1440, 220, C.gold, 'Fraunces', pr(t, ws(16) - 0.2, ws(16) + 0.15, eout) * (0.88 + 0.12 * Math.sin(u * 7)));
}
function scene3(c, t) { // PROOF 1: the real FDA photo of Kelsey (1960s) at a desk with stacks of documents; the evidence gauge stalls: "too thin"
  c.drawImage(BG.c, 0, 0);
  const dz = lerp(1.0, 1.05, pr(t, T.whip[1], T.turn[0], (u) => u)); c.save(); c.translate(380, 870); c.scale(dz, dz); c.translate(-380, -870);
  photo(c, DESK, 110, 560, 500, -0.012, 1, pr(t, T.whip[1], T.whip[1] + 1.2, (u) => u)); c.restore();
  label(c, 'FRANCES KELSEY', 360, 1260, 34, C.gold, 'Mono', pr(t, ws(21) - 0.1, ws(22) + 0.2, eout));
  const gx = 760, gy0 = 640, gy1 = 1140, ga = pr(t, ws(25) - 0.3, ws(25), eout);
  if (ga > 0) { c.save(); c.globalAlpha = ga; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 24; c.fillStyle = 'rgba(251,247,238,0.12)'; rr(c, gx - 40, gy0, 80, gy1 - gy0, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.strokeStyle = 'rgba(251,247,238,0.6)'; c.lineWidth = 4; rr(c, gx - 40, gy0, 80, gy1 - gy0, 20); c.stroke();
    const fill = 0.22 * pr(t, ws(25), ws(26) + 0.4, eout) + 0.015 * Math.sin(t * 9) * pr(t, ws(26), ws(27)), fy = lerp(gy1, gy0, fill);
    c.fillStyle = '#E8A04E'; rr(c, gx - 32, fy, 64, gy1 - fy - 8, 14); c.fill();
    const ny = lerp(gy1, gy0, 0.85); c.strokeStyle = '#9FD8B0'; c.setLineDash([12, 10]); c.lineWidth = 5; c.beginPath(); c.moveTo(gx - 64, ny); c.lineTo(gx + 64, ny); c.stroke(); c.setLineDash([]); c.restore();
    label(c, 'needed', gx, ny - 22, 30, '#9FD8B0', 'Mono', ga); label(c, 'EVIDENCE', gx, gy0 - 30, 34, C.cream, 'Mono', ga); }
  label(c, 'too thin', gx - 10, 1250, 64, '#F2A07D', 'Fraunces', pr(t, ws(27) - 0.1, ws(28) + 0.15, eout));
}
function scene4(c, t) { // PROOF 2: the company presses (letters keep arriving); she keeps asking for reliable evidence ("?" goes back)
  c.drawImage(PAPER, 0, 0);
  building(c, 230, 1080, 1); label(c, 'the company', 230, 1150, 36, INK, 'InterX', 1);
  photo(c, POR, 640, 640, 250, 0.02, 1); label(c, 'Kelsey', 765, 1060, 36, INK, 'InterX', 1);
  const arrivals = [ws(30) - 0.2, ws(30) + 0.25, ws(31), ws(32) - 0.1, ws(32) + 0.35];
  let landed = 0; arrivals.forEach((a0, k) => { const u = pr(t, a0, a0 + 0.55, eio); if (u >= 1) landed++; else if (u > 0) { const [x, y] = qpt(330, 880, 640, 1180, -260, u); envelope(c, x, y, 0.9, (1 - u) * -0.5 + k * 0.05, 1); } });
  for (let k = 0; k < landed; k++) envelope(c, 640 + (k % 2 ? 18 : -12), 1200 - k * 26, 0.9, (k % 3 - 1) * 0.08, 1);
  label(c, 'pressing', 450, 760, 40, RED, 'Mono', pr(t, ws(31) - 0.1, ws(32) + 0.1, eout) * (1 - pr(t, ws(34), ws(35))));
  const asks = [ws(35) - 0.1, ws(37) - 0.05, ws(38) + 0.1];
  asks.forEach((a0) => { const u = pr(t, a0, a0 + 0.7, eio); if (u > 0 && u < 1) { const [x, y] = qpt(620, 900, 320, 860, -220, u); label(c, '?', x, y + 30, 96, C.goldDeep, 'Fraunces', 1); } });
  stamp(c, ['RELIABLE', 'EVIDENCE?'], 470, 1380, pr(t, ws(37) - 0.1, ws(37) + 0.3, eout), -0.05, '#A8701A', 'rgba(255,253,246,0.0)');
}
function scene5(c, t) { // PROOF 3 (timeline): 1960 application -> 1961 link to severe birth defects -> never marketed in the U.S.
  c.drawImage(BG.a, 0, 0);
  const y = 700, x0 = 160, x1 = 840, lp = pr(t, ws(40) - 0.3, ws(41) + 0.2, eio);
  c.save(); c.strokeStyle = 'rgba(251,247,238,0.85)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, Math.max(0.05, lp)), y); c.stroke(); c.restore();
  const dot = (x, a, col) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(x, y, 16, 0, 6.283); c.fill(); c.restore(); };
  dot(x0, 1, C.gold); label(c, '1960', x0 + 10, y - 40, 44, C.gold, 'Mono', 1); label(c, 'application', x0 + 10, y + 64, 30, C.cream, 'Mono', 1);
  const a61 = pr(t, ws(41) - 0.1, ws(41) + 0.3, eout); dot(x1 - 60, a61, '#F2A07D'); label(c, '1961', x1 - 60, y - 40, 44, '#F2A07D', 'Mono', a61);
  const bd = pr(t, ws(44) - 0.1, ws(46) + 0.1, eout); if (bd > 0) { c.save(); c.globalAlpha = bd; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 440, y + 30, 440, 110, 16); c.fill(); c.strokeStyle = '#F2A07D'; c.lineWidth = 4; rr(c, 440, y + 30, 440, 110, 16); c.stroke(); c.restore();
    label(c, 'severe birth defects', 660, y + 100, 36, '#F2A07D', 'InterX', bd); }
  const ba = pr(t, ws(48) - 0.4, ws(49), eout); photo(c, BOTTLE, 370, 880 + (1 - ba) * 120, 260, -0.03, ba);
  stamp(c, ['NEVER MARKETED', 'IN THE U.S.'], CX, 1370, pr(t, ws(50) - 0.1, ws(50) + 0.3, eout), -0.06, C.gold);
}
function scene6(c, t) { // PAYOFF: popularity vs evidence on a scale; it tips to evidence on "ask what the evidence shows"
  c.drawImage(BG.b, 0, 0);
  circlePortrait(c, POR, 0.5, 0.36, 0.3, CX, 670, 110, pr(t, T.push2[0], T.push2[1] + 0.2, eout));
  const tip = lerp(-0.16, 0.2, pr(t, ws(61) - 0.2, ws(63), eio)), px = CX, py = 900, L = 290;
  c.save(); c.fillStyle = '#B9A36A'; c.fillRect(px - 10, py, 20, 360); c.fillRect(px - 90, py + 350, 180, 22); c.beginPath(); c.arc(px, py, 18, 0, 6.283); c.fill(); c.restore();
  const ends = [[-1, 'popular'], [1, 'evidence']].map(([sd, name]) => { const ex = px + sd * L * Math.cos(tip), ey = py + sd * L * Math.sin(tip); return [ex, ey, sd, name]; });
  c.save(); c.strokeStyle = '#D9C48A'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(ends[0][0], ends[0][1]); c.lineTo(ends[1][0], ends[1][1]); c.stroke(); c.restore();
  for (const [ex, ey, sd, name] of ends) { c.save(); c.strokeStyle = 'rgba(217,196,138,0.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - 70, ey + 110); c.moveTo(ex, ey); c.lineTo(ex + 70, ey + 110); c.stroke();
    c.fillStyle = '#D9C48A'; c.beginPath(); c.ellipse(ex, ey + 112, 90, 18, 0, 0, 6.283); c.fill(); c.restore();
    if (sd < 0) { for (let k = 0; k < 14; k++) glowDot(c, ex - 60 + (k % 7) * 20, ey + 94 - Math.floor(k / 7) * 18, 0.85, 12); } else docStack(c, ex, ey + 100, 6, 1);
    label(c, name, ex, ey + 180, 40, sd < 0 ? C.cream : '#9FD8B0', 'InterX', pr(t, ws(56) - 0.2, ws(56) + 0.2, eout)); }
  label(c, 'ask for the evidence', CX, 1420, 66, C.cream, 'Fraunces', pr(t, ws(64) - 0.2, ws(64) + 0.2, eout));
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
  const cues = { T, sweep: 0.3, refuse: ws(5) - 0.1, dots: [ws(10) - 0.2, ws(12)], cut: T.cut, underline: ws(15) - 0.1, q: ws(16) - 0.2, whip: T.whip, name: ws(21) - 0.1,
    gauge: ws(25) - 0.3, fill: [ws(25), ws(26) + 0.4], thin: ws(27) - 0.1, turn: T.turn, letters: [ws(30) - 0.2, ws(30) + 0.25, ws(31), ws(32) - 0.1, ws(32) + 0.35].map((x) => x + 0.55),
    asks: [ws(35) - 0.1, ws(37) - 0.05, ws(38) + 0.1], stamp: ws(37) - 0.1, push: T.push, line: ws(40) - 0.3, y1961: ws(41) - 0.1, defects: ws(44) - 0.1, bottle: ws(48) - 0.4, never: ws(50) - 0.1,
    push2: T.push2, labels: ws(56) - 0.2, tip: [ws(61) - 0.2, ws(63)], ask: ws(64) - 0.2, cta: T.cta };
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
