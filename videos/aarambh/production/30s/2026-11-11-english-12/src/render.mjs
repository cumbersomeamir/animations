// Aarambh english-12 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25):
// one visual idea per scene, large brief labels, no on-screen source footers, spotlit desk with depth (no decorative grid),
// captions inside x 100..900 (plate centred at x = 500), motivated transitions (hard cut, whip, zoom-through, push, page turn, CTA slide).
// Story: Grace Hopper's wire "nanoseconds" (Smithsonian NMAH 1985.3088.01) -> why ~30 cm (speed of light, NIST) -> pepper picosecond -> shorter paths, faster computers.
// Archival object: U.S. Navy official portrait of Commodore Grace M. Hopper, 20 Jan 1984, James S. Davis (PD-USGov-Military-Navy).
// Everything else (wire, ruler, globe, time tiles, pepper grain, chips and paths) is original illustration.
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
  [0, 5, ['Grace Hopper handed out', 'a nanosecond']],
  [6, 8, ['you could hold.']],
  [9, 16, ['It was a wire, about', '30 centimeters long.']],
  [17, 19, ['Why that length?']],
  [20, 24, ['Nothing travels', 'faster than light:']],
  [25, 30, ['about 300,000', 'kilometers a second.']],
  [31, 36, ['In one billionth', 'of a second,']],
  [37, 42, ['even light covers only', '30 centimeters.']],
  [43, 46, ['As computer parts shrank,']],
  [47, 55, ['she used a grain of pepper', 'for a picosecond.']],
  [56, 62, ['Her point: signals need', 'time to travel,']],
  [63, 68, ['so shorter paths make', 'faster computers.']],
  [69, 74, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 9: SENT[1].start, 17: SENT[2].start, 31: SENT[3].start, 43: SENT[4].start, 56: SENT[5].start, 69: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                  // hard cut on "It was a wire"
  whip: [SENT[2].start - 0.2, SENT[2].start],   // whip-pan to the "why?" scene
  zoom: [SENT[3].start - 0.3, SENT[3].start],   // zoom through the globe into the time ladder
  push: [SENT[4].start - 0.25, SENT[4].start],  // push to the shrinking scene
  turn: [SENT[5].start - 0.35, SENT[5].start],  // page turn to the payoff page
  cta: [SENT[6].start - 0.5, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/grace-hopper-navy-portrait-1984-pd.jpg'));

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
const wirePt = (x0, y0, x1, y1, sag, u) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag; const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; return [a * x0 + b * mx + d * x1, a * y0 + b * my + d * y1]; };
function wire(c, x0, y0, x1, y1, sag = 0, lw = 16, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.lineCap = 'round';
  const path_ = () => { c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); };
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 22; c.shadowOffsetY = 12; path_(); c.strokeStyle = '#8F8778'; c.lineWidth = lw + 4; c.stroke(); c.shadowColor = 'rgba(0,0,0,0)';
  path_(); c.strokeStyle = '#F4EFE4'; c.lineWidth = lw; c.stroke(); path_(); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = lw * 0.25; c.translate(0, -lw * 0.22); c.stroke(); c.restore();
  c.save(); c.globalAlpha = a; c.fillStyle = '#C97B3A'; for (const [x, y] of [[x0, y0], [x1, y1]]) { c.beginPath(); c.arc(x, y, lw * 0.3, 0, 6.283); c.fill(); } c.restore(); }
function pulse(c, pts, u, a = 1, r = 26, step = 0.012) { // glowing light pulse with a short trail along a path function pts(u) -> [x,y]
  if (a <= 0 || u < 0 || u > 1) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 12; k >= 0; k--) { const uu = u - k * step; if (uu < 0) continue; const [x, y] = pts(uu), rr_ = r * (1 - k / 16);
    const g = c.createRadialGradient(x, y, 0, x, y, rr_ * 2.2); g.addColorStop(0, `rgba(255,236,170,${a * (1 - k / 13)})`); g.addColorStop(0.35, `rgba(241,180,68,${0.7 * a * (1 - k / 13)})`); g.addColorStop(1, 'rgba(241,180,68,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rr_ * 2.2, 0, 6.283); c.fill(); }
  c.restore(); }
function ruler(c, x0, x1, y, a = 1, reveal = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 24; c.shadowOffsetY = 10;
  c.fillStyle = '#EBD9A8'; rr(c, x0 - 20, y, x1 - x0 + 40, 96, 8); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = '#6E5A2E'; c.lineWidth = 3;
  for (let i = 0; i <= 30 * reveal; i++) { const x = lerp(x0, x1, i / 30), L = i % 10 === 0 ? 46 : i % 5 === 0 ? 32 : 20; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + L); c.stroke();
    if (i % 10 === 0) { c.fillStyle = '#4E3F1E'; c.font = '800 28px Mono'; c.textAlign = 'center'; c.fillText(String(i), x, y + 82); } }
  c.restore(); }
function globe(c, x, y, r, rot) { c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.shadowOffsetY = 26; c.fillStyle = '#1C5C73'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.fillStyle = '#3F8A5B';
  for (let k = 0; k < 7; k++) { const ph = ((rnd(k, 5) + rot) % 1) * 2.4 - 1.2, lx = x + ph * r * 1.1, ly = y + (rnd(k, 6) - 0.5) * r * 1.3, s = r * (0.18 + rnd(k, 7) * 0.22);
    c.beginPath(); for (let j = 0; j < 9; j++) { const an = j / 9 * 6.283, rad = s * (0.7 + rnd(k * 9 + j, 8) * 0.5); c.lineTo(lx + Math.cos(an) * rad * 1.3, ly + Math.sin(an) * rad); } c.closePath(); c.fill(); }
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r * 1.05); g.addColorStop(0, 'rgba(255,255,255,0.28)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,10,20,0.6)');
  c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = 'rgba(160,220,240,0.35)'; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 3, 0, 6.283); c.stroke(); c.restore(); }
function tile(c, x, y, w, h, top, big, flip = 1) { // a paper time card; flip 0..1 squashes it vertically for the card-flip
  c.save(); c.translate(x, y); c.scale(1, Math.max(0.02, Math.abs(flip))); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 36; c.shadowOffsetY = 16;
  c.fillStyle = C.paper; rr(c, -w / 2, -h / 2, w, h, 22); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = 'rgba(201,138,34,0.6)'; c.lineWidth = 4; rr(c, -w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 14); c.stroke();
  c.textAlign = 'center'; c.fillStyle = C.goldDeep; c.font = '800 40px Mono'; c.fillText(top, 0, -h / 2 + 86); c.restore(); c.save(); c.translate(x, y); c.scale(1, Math.max(0.02, Math.abs(flip)));
  c.shadowColor = 'rgba(0,0,0,0)'; approx(c, big, 0, h / 2 - 62, 100, C.ink); c.restore(); }
function pepper(c, x, y, s, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y);
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 30; c.shadowOffsetY = 14; c.fillStyle = '#2A221D'; c.beginPath();
  for (let j = 0; j < 28; j++) { const an = j / 28 * 6.283, rad = s * (0.82 + 0.18 * Math.sin(an * 3 + 1) + rnd(j, 3) * 0.1); c.lineTo(Math.cos(an) * rad, Math.sin(an) * rad * 0.9); } c.closePath(); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = 'rgba(120,96,80,0.55)'; c.lineWidth = s * 0.05; for (let k = 0; k < 7; k++) { const an = rnd(k, 4) * 6.283; c.beginPath(); c.arc(Math.cos(an) * s * 0.25, Math.sin(an) * s * 0.2, s * (0.35 + rnd(k, 5) * 0.3), an, an + 1.2); c.stroke(); }
  const g = c.createRadialGradient(-s * 0.35, -s * 0.4, s * 0.05, 0, 0, s); g.addColorStop(0, 'rgba(255,240,220,0.35)'); g.addColorStop(0.5, 'rgba(255,240,220,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, s, 0, 6.283); c.fill(); c.restore(); }
function chip(c, x, y, s, glow = 0) { c.save(); c.translate(x, y); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 24; c.shadowOffsetY = 10; c.fillStyle = '#1D2B28'; rr(c, -s / 2, -s / 2, s, s, 12); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = '#B8A472'; for (let k = 0; k < 5; k++) { const o = -s / 2 + s * (k + 0.5) / 5 - 5; c.fillRect(o, -s / 2 - 16, 10, 16); c.fillRect(o, s / 2, 10, 16); c.fillRect(-s / 2 - 16, o, 16, 10); c.fillRect(s / 2, o, 16, 10); }
  if (glow > 0) { c.strokeStyle = `rgba(241,180,68,${glow})`; c.lineWidth = 8; rr(c, -s / 2 - 8, -s / 2 - 8, s + 16, s + 16, 16); c.stroke(); } c.restore(); }

// ---------- scenes (each draws the full frame; t is global time) ----------
const S1W = [140, 1200, 860, 1200, 18]; // hook wire
function scene1(c, t) { // HOOK: the official portrait in a spotlight; a light pulse races along a wire from frame 0; "1 nanosecond"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.06, 1.0, pr(t, 0, 1.2, eout)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const pa = pr(t, 0, 0.45, eout);
  photo(c, POR, 300, 545 + (1 - pa) * 30, 400, -0.025, pa, pr(t, 0.25, 1.1, (u) => u));
  label(c, 'GRACE HOPPER', CX, 1118, 34, C.gold, 'Mono', pr(t, 0.5, 0.9, eout));
  const [x0, y0, x1, y1, sg] = S1W; wire(c, x0, y0, x1, y1, sg);
  const pts = (u) => wirePt(x0, y0, x1, y1, sg, u);
  for (const s0 of [0.05, 0.95, 1.85, 2.75]) pulse(c, pts, (t - s0) / 0.7, 1);
  label(c, '1 nanosecond', CX, 1360, 92, C.cream, 'Fraunces', pr(t, ws(5) - 0.2, ws(5) + 0.2, eout));
  c.restore();
}
function scene2(c, t) { // SUPER HOOK + PROOF: the Smithsonian keeps a bundle of her wires; one wire measured: about 30 cm
  c.drawImage(BG.b, 0, 0);
  const u = t - T.cut, z = lerp(1.0, 1.04, clamp(u / 2.8)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  const bA = pr(t, T.cut, T.cut + 0.35, eout);
  for (let k = 0; k < 9; k++) { const fan = (k - 4) * 0.035 * pr(t, T.cut + 0.2, T.cut + 1.0, eout), y = 700 + (k - 4) * 7; c.save(); c.translate(CX, y); c.rotate(fan); c.translate(-CX, -y); wire(c, 170, y, 830, y, 3, 12, bA * 0.92); c.restore(); }
  const tg = pr(t, ws(12) - 0.25, ws(12) + 0.2, eout);
  if (tg > 0) { c.save(); c.globalAlpha = tg; c.translate(760, 720); c.rotate(0.12 - 0.12 * tg); c.strokeStyle = '#8F7B4E'; c.lineWidth = 3; c.beginPath(); c.moveTo(-40, -10); c.lineTo(0, 40); c.stroke();
    c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 18; c.shadowOffsetY = 8; c.fillStyle = '#F3E6C4'; rr(c, -110, 40, 230, 74, 10); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.ink; c.font = '800 30px Mono'; c.textAlign = 'center'; c.fillText('SMITHSONIAN', 5, 88); c.restore(); }
  const wy = 1010, mA = pr(t, ws(12) - 0.1, ws(12) + 0.4, eout);
  wire(c, 140, wy, 860, wy, 0, 18, mA);
  ruler(c, 140, 860, wy + 40, pr(t, ws(13) - 0.2, ws(13) + 0.2, eout), pr(t, ws(13) - 0.1, ws(15), (x) => x));
  const br = pr(t, ws(14) - 0.15, ws(15) + 0.1);
  if (br > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; const xe = lerp(140, 860, br); c.beginPath(); c.moveTo(140, wy - 52); c.lineTo(xe, wy - 52); c.stroke(); c.beginPath(); c.moveTo(140, wy - 70); c.lineTo(140, wy - 34); c.stroke();
    if (br > 0.98) { c.beginPath(); c.moveTo(860, wy - 70); c.lineTo(860, wy - 34); c.stroke(); } c.restore(); }
  approx(c, '≈ 30 cm', CX, 1330, 120, C.gold, 'Fraunces', pr(t, ws(15) - 0.1, ws(15) + 0.25, eout));
  c.restore();
}
function scene3(c, t) { // BUILD: why that length? -> light's speed: about 7.5 laps of the Earth in one second (time-scaled)
  c.drawImage(BG.c, 0, 0);
  const qA = 1 - pr(t, ws(20) - 0.3, ws(20) + 0.1);
  if (qA > 0) { c.save(); c.globalAlpha = qA; wire(c, 180, 760, 820, 760, 0, 16); label(c, '?', CX, 1180, 300, C.gold, 'Fraunces', pr(t, ws(17) - 0.1, ws(17) + 0.3, eout)); c.restore(); }
  const eA = pr(t, ws(20) - 0.25, ws(20) + 0.3, eout); if (eA <= 0) return;
  c.save(); c.globalAlpha = eA; c.translate(0, (1 - eA) * 80);
  const gx = CX, gy = 1010, R = 210, lp = 7.48 * pr(t, ws(21) - 0.1, ws(29) + 0.2, (x) => x), th = lp * 6.283 - 1.5708;
  const orb = (u) => { const a = (u * 7.48) * 6.283 - 1.5708; return [gx + Math.cos(a) * 330, gy + Math.sin(a) * 120]; };
  const uNow = lp / 7.48, front = Math.sin(th) > 0;
  c.save(); c.strokeStyle = 'rgba(241,180,68,0.22)'; c.lineWidth = 4; c.beginPath(); c.ellipse(gx, gy, 330, 120, 0, 3.1416, 6.283); c.stroke(); c.restore();
  if (!front) pulse(c, orb, uNow, 0.75, 22, 0.0018);
  globe(c, gx, gy, R, t * 0.05);
  c.save(); c.strokeStyle = 'rgba(241,180,68,0.4)'; c.lineWidth = 4; c.beginPath(); c.ellipse(gx, gy, 330, 120, 0, 0, 3.1416); c.stroke(); c.restore();
  if (front) pulse(c, orb, uNow, 1, 24, 0.0018);
  // one-second clock and lap count
  const ck = pr(t, ws(21) - 0.3, ws(21), eout), cx = 230, cy = 640;
  if (ck > 0) { c.save(); c.globalAlpha = ck; c.fillStyle = 'rgba(251,247,238,0.1)'; c.beginPath(); c.arc(cx, cy, 70, 0, 6.283); c.fill(); c.strokeStyle = C.cream; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, 70, 0, 6.283); c.stroke();
    c.strokeStyle = C.gold; c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, 52, -1.5708, -1.5708 + 6.283 * (lp / 7.48)); c.stroke(); c.restore(); label(c, '1 second', cx, cy + 120, 40, C.cream, 'Mono', ck); }
  label(c, `${Math.min(7.5, Math.floor(lp * 2) / 2).toFixed(1)}×`, 770, 668, 84, C.gold, 'Fraunces', ck); label(c, 'around Earth', 770, 720, 30, C.cream, 'Mono', ck);
  label(c, '300,000 km', CX, 1360, 110, C.cream, 'Fraunces', pr(t, ws(26) - 0.15, ws(26) + 0.25, eout));
  c.restore();
}
const LADDER = [['1 SECOND', '300,000 km'], ['1 MILLISECOND', '≈ 300 km'], ['1 MICROSECOND', '≈ 300 m'], ['1 NANOSECOND', '≈ 30 cm']];
const FLIPS = () => [T.zoom[1] + 0.3, T.zoom[1] + 0.7, T.zoom[1] + 1.1]; // ÷1000 steps during "In one billionth of a second"
function scene4(c, t) { // ANSWER: one second -> ÷1000 -> ÷1000 -> ÷1000 = one nanosecond = 30 cm; then the pulse crosses the wire once
  c.drawImage(BG.a, 0, 0);
  const F = FLIPS(); let k = 0; for (const f of F) if (t >= f) k++;
  let flip = 1; for (const f of F) { const d = t - f; if (d > -0.09 && d < 0.09) flip = Math.abs(d) / 0.09; }
  const up = pr(t, ws(37) - 0.4, ws(37) + 0.1, eout), ty = lerp(940, 720, up);
  tile(c, CX, ty, 760, 330, LADDER[k][0], LADDER[k][1], flip);
  for (let i = 0; i < 3; i++) { const d = t - F[i]; if (d > -0.05 && d < 0.45) label(c, '÷ 1000', CX + 300, ty - 190 - d * 60, 46, C.gold, 'Mono', 1 - clamp(d / 0.45)); }
  const wA = pr(t, ws(37) - 0.3, ws(37) + 0.15, eout), wy = 1210;
  wire(c, 140, wy, 860, wy, 0, 18, wA);
  const pu = (t - ws(38)) / 1.3; pulse(c, (u) => [lerp(140, 860, u), wy], pu, wA, 30);
  if (pu > 1) pulse(c, () => [860, wy], 0.999, wA * (1 - clamp((pu - 1) * 1.2)), 34);
}
function scene5(c, t) { // ESCALATION: parts shrank -> the 30 cm wire shrinks to a dot -> a grain of pepper = 1 picosecond (≈ 0.3 mm)
  c.drawImage(BG.b, 0, 0);
  const sh = pr(t, T.push[1], ws(46) + 0.2, (x) => 1 - Math.pow(1 - x, 2)), sc = lerp(1, 0.02, sh), wy = 1000;
  if (sh < 1) { c.save(); c.translate(CX, wy); c.scale(sc, 1); c.translate(-CX, -wy); wire(c, 140, wy, 860, wy, 0, 18); c.restore(); }
  const dot = pr(t, ws(46) - 0.1, ws(46) + 0.2) * (1 - pr(t, ws(49) - 0.2, ws(49) + 0.1)); if (dot > 0) pulse(c, () => [CX, wy], 0.5, dot, 22);
  const pg = pr(t, ws(49) - 0.2, ws(50) + 0.2, eout);
  if (pg > 0) { c.save(); c.globalAlpha = pg; const rad = lerp(40, 300, pg); const g = c.createRadialGradient(CX, wy, rad * 0.2, CX, wy, rad); g.addColorStop(0, 'rgba(255,246,220,0.95)'); g.addColorStop(0.7, 'rgba(240,220,170,0.8)'); g.addColorStop(1, 'rgba(240,220,170,0)');
    c.fillStyle = g; c.beginPath(); c.arc(CX, wy, rad, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(241,180,68,0.8)'; c.lineWidth = 6; c.beginPath(); c.arc(CX, wy, rad * 0.86, 0, 6.283); c.stroke(); c.restore();
    pepper(c, CX, wy, lerp(10, 120, pg), pg); }
  label(c, '1 picosecond', CX, 1420, 92, C.cream, 'Fraunces', pr(t, ws(55) - 0.25, ws(55) + 0.15, eout));
  label(c, '≈ 0.3 mm', CX, 1500, 44, C.gold, 'Mono', pr(t, ws(55) + 0.05, ws(55) + 0.4, eout));
}
const LONG = (u) => { const x = lerp(250, 750, u); return [x, 900 - Math.sin(u * Math.PI * 3) * 110 - Math.sin(u * Math.PI) * 110]; }; // winding long path
const SHORT = (u) => [lerp(250, 750, u), 1070];
function scene6(c, t) { // PAYOFF page: two pulses at the same speed; the shorter path arrives first -> shorter = faster
  c.drawImage(PAPER, 0, 0);
  photo(c, POR, 110, 540, 140, -0.03, pr(t, ws(56) - 0.2, ws(56) + 0.2, eout));
  const pA = pr(t, ws(58) - 0.4, ws(58) - 0.05, eout);
  c.save(); c.globalAlpha = pA; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#B9AE95'; c.lineWidth = 12;
  c.beginPath(); for (let i = 0; i <= 80; i++) { const [x, y] = LONG(i / 80); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.beginPath(); c.moveTo(250, 1070); c.lineTo(750, 1070); c.stroke(); c.restore();
  const t0 = ws(58), sp = 520; // px per second, the same for both pulses
  const lenL = (() => { let L = 0, p = LONG(0); for (let i = 1; i <= 200; i++) { const q = LONG(i / 200); L += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; } return L; })();
  const uS = (t - t0) * sp / 500, uL = (t - t0) * sp / lenL;
  pulse(c, SHORT, Math.min(uS, 1), pA, 26); pulse(c, LONG, Math.min(uL, 1), pA, 26);
  chip(c, 210, 1070, 120, 0); chip(c, 790, 1070, 120, uS >= 1 ? clamp((t - t0 - 500 / sp) * 3) : 0);
  label(c, 'shorter = faster', CX, 1380, 84, C.ink, 'Fraunces', pr(t, ws(64) - 0.15, ws(64) + 0.25, eout));
}
function scene7(c, t) { // CTA (verified Aarambh listing line)
  c.drawImage(BG.a, 0, 0); const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.5 + 0.5 * a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.drawImage(icon, CX - 150, 600, 300, 300); c.restore();
  label(c, 'Download Aarambh', CX, 1060, 76, C.cream); label(c, 'to support livelihood tools', CX, 1134, 42, C.gold, 'InterX');
  label(c, 'Fund verified livelihood tools', CX, 1250, 32, 'rgba(251,247,238,0.85)', 'InterB'); label(c, 'and follow their impact.', CX, 1292, 32, 'rgba(251,247,238,0.85)', 'InterB');
  label(c, 'Get it on Google Play', CX, 1400, 28, 'rgba(251,247,238,0.65)', 'Mono');
}
const SC = [scene1, scene2, scene3, scene4, scene5, scene6, scene7];
const bufA = createCanvas(W, H), bufB = createCanvas(W, H);
function render(c, t) {
  const at = (fn, buf) => { const x = buf.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); fn(x, t); return buf; };
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) { const e = eio((t - T.whip[0]) / (T.whip[1] - T.whip[0])); const a = at(scene2, bufA), b = at(scene3, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; return; }
  if (t < T.zoom[0]) return scene3(c, t);
  if (t < T.zoom[1]) { const e = eio((t - T.zoom[0]) / (T.zoom[1] - T.zoom[0])); const a = at(scene3, bufA), b = at(scene4, bufB);
    c.drawImage(b, 0, 0); c.save(); c.globalAlpha = 1 - e; c.translate(CX, 1010); c.scale(1 + 2.2 * e, 1 + 2.2 * e); c.translate(-CX, -1010); c.drawImage(a, 0, 0); c.restore(); return; }
  if (t < T.push[0]) return scene4(c, t);
  if (t < T.push[1]) { const e = eio((t - T.push[0]) / (T.push[1] - T.push[0])); const a = at(scene4, bufA), b = at(scene5, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); return; }
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
function drawThumb(c) { // separate vertical thumbnail tied to the hook: portrait + glowing wire + "HOLD A NANOSECOND"
  c.drawImage(BG.a, 0, 0);
  const g = c.createRadialGradient(CX, 760, 50, CX, 760, 700); g.addColorStop(0, 'rgba(241,180,68,0.22)'); g.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  photo(c, POR, 250, 300, 500, -0.03, 1);
  const pts = (u) => wirePt(110, 1000, 890, 1000, 20, u); wire(c, 110, 1000, 890, 1000, 20, 22); pulse(c, pts, 0.62, 1, 40); pulse(c, pts, 0.18, 0.8, 30);
  label(c, 'HOLD A', CX, 1190, 112, C.cream, 'InterX'); label(c, 'NANOSECOND', CX, 1320, 104, C.gold, 'InterX');
  c.save(); c.font = '800 38px Fraunces'; c.fillStyle = 'rgba(251,247,238,0.85)'; c.textAlign = 'left'; const mw = c.measureText('Aarambh').width; c.fillText('Aarambh', CX - mw / 2 + 16, 1440);
  const sx = CX - mw / 2 - 10; c.fillStyle = C.gold; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 4.5 : 14; c.lineTo(sx + Math.cos(a) * r, 1428 + Math.sin(a) * r); } c.fill(); c.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const pulses = [0.05, 0.95, 1.85, 2.75];
  const cues = { T, pulses, title: ws(5) - 0.2, cut: T.cut, fan: T.cut + 0.2, tag: ws(12) - 0.25, ruler: [ws(13) - 0.1, ws(15)], measure: ws(15) - 0.1, whip: T.whip,
    q: ws(17) - 0.1, earth: ws(20) - 0.25, laps: [ws(21) - 0.1, ws(29) + 0.2], km: ws(26) - 0.15, zoom: T.zoom, flips: FLIPS(), cross: [ws(38), ws(38) + 1.3], push: T.push,
    shrink: [ws(44) - 0.1, ws(46) + 0.1], pepper: ws(49) - 0.2, ps: ws(55) - 0.25, turn: T.turn, race: ws(58), arriveS: ws(58) + 500 / 520, payoff: ws(64) - 0.15, cta: T.cta };
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
