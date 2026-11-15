// Aarambh english-17 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25) and the
// 2026-11-15 first-frame addendum: frame 0 = real portrait + an enormous thread holding a weight + "A THREAD THAT SAVED LIVES" (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: Stephanie Kwolek and Kevlar — this thread has helped save police lives, and it began as a cloudy liquid -> how did a liquid get that strong?
// -> in 1965 she had it spun into fibre (her real 1972 patent for optically anisotropic dopes) -> rod-like chains lie side by side, like dry spaghetti, not a tangle
// (real museum sample of Kevlar yarn, then a zoom inside a strand) -> pull, and they share the load; by weight five times stronger than steel (NIHF / SHI)
// -> lesson: strong isn't bulletproof; ask which threats a vest is rated for (NIJ).
// Archival objects: Stephanie Kwolek, photograph by Harry Kalish (Science History Institute, CC BY-SA 3.0); U.S. Patent 3,671,542 first page (1972, public domain);
// sample of 100% Kevlar yarn (Industriemuseum Gent, CC0). Thread, weight, beaker, spinneret, chains, bars and vest are original illustration.
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; "rod-like" is tokens 31-32; token 24 is the surname)
  [0, 6, ['This thread has helped', 'save police lives,']],
  [7, 13, ['and it began as', 'a cloudy liquid.']],
  [14, 20, ['How did a liquid', 'get that strong?']],
  [21, 24, ['In 1965,', 'Stephanie Kwolek']],
  [25, 29, ['had it spun', 'into fibre.']],
  [30, 37, ['Its rod-like chains', 'lie side by side,']],
  [38, 43, ['like dry spaghetti,', 'not a tangle.']],
  [44, 49, ['Pull, and they', 'share the load:']],
  [50, 56, ['by weight, five times', 'stronger than steel.']],
  [57, 60, ['Lesson: strong', "isn't bulletproof;"]],
  [61, 68, ['ask which threats', 'a vest is rated for.']],
  [69, 74, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 14: SENT[1].start, 21: SENT[2].start, 30: SENT[3].start, 44: SENT[4].start, 57: SENT[5].start, 69: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: ws(12) - 0.12,                             // hard cut on "cloudy liquid" -> the cloudy liquid (illustration)
  whip: [SENT[2].start - 0.2, SENT[2].start],     // whip pan to her real 1972 patent (optically anisotropic dopes) + spinning
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05], // push to the real museum sample of Kevlar yarn -> zoom inside a strand
  push2: [SENT[4].start - 0.3, SENT[4].start],    // push to the pull test and the same-weight comparison
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR0 = await loadImage(path.join(ROOT, 'assets/stephanie-kwolek-harry-kalish-shi-cc-by-sa-3.jpg'));
const PAT = await loadImage(path.join(ROOT, 'assets/us-patent-3671542-kwolek-1972-p1-pd.jpg'));
const SAMPLE = await loadImage(path.join(ROOT, 'assets/kevlar-yarn-sample-industriemuseum-gent-cc0.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const POR = crop(POR0, 0.08, 0.2, 0.86, 0.8);    // Stephanie Kwolek, head and shoulders
const PATC = crop(PAT, 0.07, 0.045, 0.505, 0.219); // the patent's first page, left column: header, title, inventor, assignee
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
function thread(c, x, y0, y1, t, a = 1, wid = 46) { // an enormous golden aramid thread: twisted filaments, travelling glint, a few stray fibrils
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.save(); c.globalCompositeOperation = 'lighter'; const gg = c.createLinearGradient(x - wid * 2.2, 0, x + wid * 2.2, 0);
  gg.addColorStop(0, 'rgba(241,180,68,0)'); gg.addColorStop(0.5, 'rgba(241,180,68,0.15)'); gg.addColorStop(1, 'rgba(241,180,68,0)'); c.fillStyle = gg; c.fillRect(x - wid * 2.2, y0, wid * 4.4, y1 - y0); c.restore();
  const g = c.createLinearGradient(x - wid / 2, 0, x + wid / 2, 0); g.addColorStop(0, '#6B430F'); g.addColorStop(0.3, '#D99A3A'); g.addColorStop(0.5, '#FFE3A3'); g.addColorStop(0.72, '#D99A3A'); g.addColorStop(1, '#5E3A0C');
  c.fillStyle = g; c.fillRect(x - wid / 2, y0, wid, y1 - y0);
  c.save(); c.beginPath(); c.rect(x - wid / 2, y0, wid, y1 - y0); c.clip();
  c.lineWidth = 2.2; c.strokeStyle = 'rgba(80,48,8,0.38)'; for (let yy = y0 - wid; yy < y1 + wid; yy += 13) { c.beginPath(); c.moveTo(x - wid / 2, yy); c.lineTo(x + wid / 2, yy + wid * 0.6); c.stroke(); }
  c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,240,200,0.3)'; for (let yy = y0 - wid + 6; yy < y1 + wid; yy += 13) { c.beginPath(); c.moveTo(x - wid / 2, yy); c.lineTo(x + wid / 2, yy + wid * 0.6); c.stroke(); }
  const span = y1 - y0 + 500, gy = y0 - 250 + ((t * 300 + 420) % span); const gl = c.createLinearGradient(0, gy - 110, 0, gy + 110);
  gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,250,230,0.5)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x - wid / 2, gy - 110, wid, 220);
  c.restore();
  c.strokeStyle = 'rgba(241,200,120,0.55)'; c.lineWidth = 1.3;
  for (let k = 0; k < 12; k++) { const yy = y0 + 40 + (y1 - y0 - 80) * rnd(k, 3), sg = k % 2 ? 1 : -1, ex = wid / 2 + 6 + 16 * rnd(k, 5); c.beginPath(); c.moveTo(x + sg * wid / 2, yy); c.quadraticCurveTo(x + sg * (wid / 2 + 8), yy + 10, x + sg * ex, yy + 26); c.stroke(); }
  c.restore();
}
function weight(c, x, y, w, h) { // cast-iron mass on a ring; y = top of the ring
  c.save();
  c.strokeStyle = '#3A4240'; c.lineWidth = 13; c.beginPath(); c.arc(x, y + 26, 24, 0, 6.283); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y + 26, 28, Math.PI * 1.1, Math.PI * 1.7); c.stroke();
  const top = y + 58, bw = w / 2, tw = w * 0.3;
  c.fillStyle = '#20262A'; rr(c, x - 22, top - 10, 44, 18, 6); c.fill();
  c.beginPath(); c.moveTo(x - tw, top); c.lineTo(x + tw, top); c.quadraticCurveTo(x + tw + 12, top, x + tw + 16, top + 14); c.lineTo(x + bw, top + h - 24);
  c.quadraticCurveTo(x + bw + 2, top + h, x + bw - 24, top + h); c.lineTo(x - bw + 24, top + h); c.quadraticCurveTo(x - bw - 2, top + h, x - bw, top + h - 24); c.lineTo(x - tw - 16, top + 14); c.quadraticCurveTo(x - tw - 12, top, x - tw, top); c.closePath();
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 50; c.shadowOffsetY = 24;
  const g = c.createLinearGradient(x - bw, 0, x + bw, 0); g.addColorStop(0, '#0F1413'); g.addColorStop(0.28, '#56605D'); g.addColorStop(0.42, '#7C8784'); g.addColorStop(0.62, '#2C3432'); g.addColorStop(1, '#0B0F0E');
  c.fillStyle = g; c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  const hl = c.createLinearGradient(0, top, 0, top + 40); hl.addColorStop(0, 'rgba(255,255,255,0.28)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = hl; c.fill();
  c.restore(); return top + h;
}
function beaker(c, x, y, w, h, t) { // a glass beaker of thin, cloudy, shimmering liquid being stirred (illustration)
  const x0 = x - w / 2, x1 = x + w / 2, y1 = y + h, ly = y + h * 0.3;
  c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 60; c.shadowOffsetY = 30; c.fillStyle = 'rgba(200,230,220,0.07)'; rr(c, x0, y, w, h, 34); c.fill(); c.restore();
  c.save(); rr(c, x0 + 8, ly, w - 16, y1 - ly - 8, 28); c.clip();
  const lg = c.createLinearGradient(0, ly, 0, y1); lg.addColorStop(0, 'rgba(232,238,232,0.92)'); lg.addColorStop(1, 'rgba(176,196,188,0.95)'); c.fillStyle = lg; c.fillRect(x0, ly, w, y1 - ly);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 0.32;
  const hues = [[255, 170, 200], [150, 200, 255], [255, 220, 140], [170, 255, 220]];
  for (let k = 0; k < 7; k++) { const ang = t * (0.9 + 0.25 * k) + k * 1.7, rx = w * (0.22 + 0.05 * (k % 3)), ry = (y1 - ly) * 0.18; const cx = x + Math.cos(ang) * w * 0.16, cy = ly + (y1 - ly) * (0.25 + 0.1 * (k % 6));
    const hc = hues[k % 4]; const gr = c.createRadialGradient(cx, cy, 0, cx, cy, rx); gr.addColorStop(0, `rgba(${hc[0]},${hc[1]},${hc[2]},0.9)`); gr.addColorStop(1, `rgba(${hc[0]},${hc[1]},${hc[2]},0)`);
    c.save(); c.translate(cx, cy); c.rotate(ang * 0.6); c.scale(1, ry / rx); c.translate(-cx, -cy); c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, rx, 0, 6.283); c.fill(); c.restore(); }
  c.globalAlpha = 1;
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2.5; for (let k = 0; k < 4; k++) { const ph = t * 2.2 + k * 1.6; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, xx = lerp(x0 + 20, x1 - 20, u), yy = ly + (y1 - ly) * (0.3 + 0.14 * k) + Math.sin(u * 6 + ph) * 12; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  c.restore();
  c.save(); c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.ellipse(x, ly, w / 2 - 10, 14, 0, 0, 6.283); c.fill(); c.restore();
  const rx = x + Math.sin(t * 2.4) * w * 0.18; c.save(); c.strokeStyle = 'rgba(235,245,240,0.8)'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(rx + 70, y - 90); c.lineTo(rx - 10, y1 - 60); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(rx + 66, y - 86); c.lineTo(rx - 12, y1 - 64); c.stroke(); c.restore();
  c.save(); c.strokeStyle = 'rgba(235,245,240,0.75)'; c.lineWidth = 6; rr(c, x0, y, w, h, 34); c.stroke(); c.beginPath(); c.moveTo(x0 - 26, y - 14); c.quadraticCurveTo(x0 - 4, y - 6, x0 + 6, y + 30); c.stroke();
  const sh = c.createLinearGradient(x0 + 24, 0, x0 + 64, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.35)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.fillRect(x0 + 24, y + 40, 40, h - 90); c.restore();
}
function spinneret(c, x, y, t, a, flow) { // dope pushed through a plate of fine holes -> filaments -> one yarn (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 40);
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; const mg = c.createLinearGradient(x - 180, 0, x + 180, 0); mg.addColorStop(0, '#1A2321'); mg.addColorStop(0.45, '#4F5B58'); mg.addColorStop(1, '#151C1A');
  c.fillStyle = mg; rr(c, x - 180, y, 360, 120, 16); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  const wg = c.createLinearGradient(0, y + 24, 0, y + 96); wg.addColorStop(0, 'rgba(232,238,232,0.9)'); wg.addColorStop(1, 'rgba(176,196,188,0.9)'); c.fillStyle = wg; rr(c, x - 140, y + 24, 280, 72, 10); c.fill();
  c.save(); rr(c, x - 140, y + 24, 280, 72, 10); c.clip(); c.globalCompositeOperation = 'soft-light'; for (let k = 0; k < 3; k++) { const cx = x + Math.cos(t * 1.3 + k * 2) * 90; const gr = c.createRadialGradient(cx, y + 60, 0, cx, y + 60, 90); gr.addColorStop(0, ['rgba(255,170,200,0.9)', 'rgba(150,200,255,0.9)', 'rgba(255,220,140,0.9)'][k]); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(x - 140, y + 24, 280, 72); } c.restore();
  c.fillStyle = '#0D1211'; c.fillRect(x - 190, y + 118, 380, 16);
  const holes = 7, top = y + 134, L = 300 * flow, Y = 150 * flow;
  for (let i = 0; i < holes; i++) { const hx = x - 132 + i * 44; c.fillStyle = '#000'; c.beginPath(); c.arc(hx, y + 126, 5, 0, 6.283); c.fill();
    if (flow > 0) { c.strokeStyle = `rgba(241,190,90,${0.95})`; c.lineWidth = 3.2; c.beginPath(); c.moveTo(hx, top); c.quadraticCurveTo(hx + (x - hx) * 0.15, top + L * 0.55, lerp(hx, x, Math.min(1, flow * 1.4)), top + L); c.stroke(); }
    else { glowDot(c, hx, top + 4, 0.5, 9, [220, 230, 225]); } }
  if (flow > 0.55) { const yy = top + L, k = (flow - 0.55) / 0.45; const yg = c.createLinearGradient(x - 6, 0, x + 6, 0); yg.addColorStop(0, '#9A6418'); yg.addColorStop(0.5, '#FFE0A0'); yg.addColorStop(1, '#9A6418'); c.fillStyle = yg; c.fillRect(x - 6, yy - 4, 12, Y * k + 4);
    const gy = yy + ((t * 220) % Math.max(1, Y * k)); glowDot(c, x, gy, 0.6, 18); }
  c.restore();
}
function hexagon(c, x, y, r) { c.beginPath(); for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3; const px = x + r * Math.cos(an), py = y + r * Math.sin(an); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.stroke(); }
function rod(c, x0, y, len, a = 1, glow = 0, col = C.gold) { // a rod-like polymer chain: linked rings along a straight backbone (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  if (glow > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,214,120,${0.55 * glow})`; c.lineWidth = 26; c.lineCap = 'round'; c.shadowColor = 'rgba(255,200,90,0.9)'; c.shadowBlur = 30; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + len, y); c.stroke(); c.restore(); }
  c.strokeStyle = col; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + len, y); c.stroke();
  c.lineWidth = 3.5; const n = Math.max(1, Math.floor(len / 44)); for (let i = 0; i < n; i++) { c.fillStyle = '#04241E'; const hx = x0 + (len - (n - 1) * 44) / 2 + i * 44; c.beginPath(); c.arc(hx, y, 15, 0, 6.283); c.fill(); hexagon(c, hx, y, 15); }
  c.restore(); }
function tangle(c, x, y, s, a, seed = 3) { // a cooked-spaghetti tangle (flexible chains), grey
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = '#9AA6A2'; c.lineWidth = 4; c.lineCap = 'round';
  for (let k = 0; k < 4; k++) { c.beginPath(); let px = x + (rnd(k, seed) - 0.5) * s, py = y + (rnd(k, seed + 1) - 0.5) * s * 0.6; c.moveTo(px, py);
    for (let i = 0; i < 9; i++) { const nx = x + (rnd(k * 20 + i, seed + 2) - 0.5) * s, ny = y + (rnd(k * 20 + i, seed + 3) - 0.5) * s * 0.6; c.quadraticCurveTo(px + (rnd(i, k + 9) - 0.5) * s * 0.7, py + (rnd(i, k + 11) - 0.5) * s * 0.5, nx, ny); px = nx; py = ny; } c.stroke(); }
  c.restore(); }
function vest(c, x, y, w, h, a = 1) { // a soft body-armour vest, front view (illustration)
  if (a <= 0) return; c.save(); c.globalAlpha = a; const x0 = x - w / 2, x1 = x + w / 2, y1 = y + h;
  c.beginPath(); c.moveTo(x0 + w * 0.2, y); c.lineTo(x0 + w * 0.36, y); c.quadraticCurveTo(x, y + h * 0.26, x1 - w * 0.36, y); c.lineTo(x1 - w * 0.2, y);
  c.quadraticCurveTo(x1 - w * 0.12, y + h * 0.2, x1, y + h * 0.34); c.lineTo(x1, y1 - 28); c.quadraticCurveTo(x1, y1, x1 - 28, y1); c.lineTo(x0 + 28, y1); c.quadraticCurveTo(x0, y1, x0, y1 - 28); c.lineTo(x0, y + h * 0.34); c.quadraticCurveTo(x0 + w * 0.12, y + h * 0.2, x0 + w * 0.2, y); c.closePath();
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 34; c.shadowOffsetY = 16; const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#0C2A23'); g.addColorStop(0.45, '#1D4A3E'); g.addColorStop(1, '#0A231D'); c.fillStyle = g; c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, x0 + 14, y + h * 0.62, w - 28, 26, 8); c.fill();
  c.restore(); }
// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [48, 570, 476, -0.03], thread: [766, -30], weightTop: 1000 }; // frame-0 composition (also the thumbnail)
function hang(c, t, x, top, wTop) { const th = 0.012 * Math.sin(t * 2 * Math.PI / 2.8); c.save(); c.translate(x, top); c.rotate(th); c.translate(-x, -top);
  thread(c, x, top, wTop + 8, t); weight(c, x, wTop - 4, 270, 210); c.restore(); }
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + an enormous thread holding a weight + "A THREAD THAT SAVED LIVES"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  hang(c, t, F0.thread[0], F0.thread[1], F0.weightTop);
  photo(c, POR, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  c.restore();
  label(c, 'A THREAD THAT', CX, 1430, 88, C.cream, 'InterX'); label(c, 'SAVED LIVES', CX, 1560, 112, C.gold, 'InterX');
}
function scene2(c, t) { // the hook's "cloudy liquid" and the question: how did a liquid get that strong?
  c.drawImage(BG.b, 0, 0);
  const z = lerp(1.0, 1.05, pr(t, T.cut, T.whip[0], (u) => u)); c.save(); c.translate(CX, 950); c.scale(z, z); c.translate(-CX, -950);
  beaker(c, CX, 690, 430, 560, t); c.restore();
  const qa = pr(t, ws(14) - 0.15, ws(14) + 0.2, eout); label(c, '?', CX, 1530, 210, C.gold, 'Fraunces', qa * (0.9 + 0.1 * Math.sin((t - ws(14)) * 5)));
}
const PP = { x: 110, y: 560, w: 780 }; PP.h = PP.w * PATC.height / PATC.width;
const NAME = { x0: 0.312, x1: 0.728, y: 0.752 }; // "Stephanie Louise Kwolek" on the crop (fractions)
function scene3(c, t) { // PROOF 1: her real patent for the optically anisotropic ("cloudy") dopes; then the spinning (illustration)
  c.drawImage(BG.b, 0, 0);
  const z = lerp(1.0, 1.03, pr(t, T.whip[1], T.push[0], (u) => u)); c.save(); c.translate(CX, 760); c.scale(z, z); c.translate(-CX, -760);
  photo(c, PATC, PP.x, PP.y, PP.w, -0.015, 1, t > T.whip[1] + 0.2 ? pr(t, T.whip[1] + 0.2, T.whip[1] + 1.6, (u) => u) : -1);
  const u = pr(t, ws(23) - 0.15, ws(24) + 0.35, eout); if (u > 0) { c.save(); c.translate(PP.x + PP.w / 2, PP.y + PP.h / 2); c.rotate(-0.015); c.translate(-(PP.x + PP.w / 2), -(PP.y + PP.h / 2));
    const ux0 = PP.x + PP.w * NAME.x0, ux1 = PP.x + PP.w * NAME.x1, uy = PP.y + PP.h * NAME.y; c.fillStyle = C.gold; c.globalAlpha = 0.95; rr(c, ux0, uy, (ux1 - ux0) * u, 6, 3); c.fill();
    c.globalAlpha = 0.18 * u; c.fillRect(ux0 - 6, uy - 24, (ux1 - ux0) * u + 12, 28); c.restore(); }
  c.restore();
  const sa = pr(t, ws(25) - 0.35, ws(25) + 0.1, eout), fl = pr(t, ws(27) - 0.15, ws(29) + 0.4, (v) => v);
  spinneret(c, CX, 1090, t, sa, fl);
  label(c, 'spun', 760, 1500, 64, C.gold, 'Fraunces', pr(t, ws(27) - 0.1, ws(27) + 0.25, eout));
}
const SC = { x: 110, y: 600, w: 780 }; SC.h = SC.w * SAMPLE.height / SAMPLE.width; const FOC = [SC.x + SC.w * 0.3, SC.y + SC.h * 0.42]; // a strand of the yarn
const RODS = 7, RX = 190, RL = 620, RY = 790, RS = 62;
function scene4(c, t) { // PROOF 2: the real museum sample of Kevlar yarn -> zoom inside a strand -> rod-like chains side by side
  c.drawImage(BG.c, 0, 0);
  const zz = pr(t, ws(31) - 0.15, ws(33) + 0.1, (u) => u * u * u), z = lerp(1, 9, zz), fade = pr(t, ws(33) - 0.35, ws(33) + 0.05);
  if (fade < 1) { c.save(); c.globalAlpha = 1 - fade; c.translate(FOC[0], FOC[1]); c.scale(z, z); c.translate(-FOC[0], -FOC[1]); photo(c, SAMPLE, SC.x, SC.y, SC.w, 0.012, 1 - fade, t > T.push[1] + 0.1 && zz === 0 ? pr(t, T.push[1] + 0.1, T.push[1] + 1.2, (u) => u) : -1); c.restore(); }
  if (fade > 0) {
    c.save(); c.globalAlpha = fade; const vg = c.createRadialGradient(CX, 980, 120, CX, 980, 640); vg.addColorStop(0, 'rgba(14,90,73,0.55)'); vg.addColorStop(1, 'rgba(1,19,15,0)'); c.fillStyle = vg; c.fillRect(0, 300, W, 1400); c.restore();
    for (let k = 0; k < RODS; k++) { const tk = ws(33) - 0.05 + k * 0.09, p = pr(t, tk, tk + 0.45, eout), off = (1 - p) * (k % 2 ? 260 : -260); rod(c, RX + off, RY + k * RS, RL, p * fade); }
  }
  label(c, 'dry spaghetti', CX, 1300, 70, C.gold, 'Fraunces', pr(t, ws(39) - 0.2, ws(40) + 0.1, eout));
  const ta = pr(t, ws(41) - 0.2, ws(43) + 0.1, eout); if (ta > 0) { tangle(c, 330, 1470, 210, ta * 0.9, 5); label(c, 'not a tangle', 640, 1490, 40, '#B9C4C0', 'Mono', ta);
    c.save(); c.globalAlpha = ta; c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; const s = pr(t, ws(43) - 0.05, ws(43) + 0.3, eout); c.beginPath(); c.moveTo(225, 1540); c.lineTo(225 + 210 * s, 1540 - 140 * s); c.stroke(); c.restore(); }
}
const PR = { n: 7, x0: 270, len: 460, y0: 800, dy: 44 };
function scene5(c, t) { // PROOF 3: pull -> every aligned chain carries the load; then strength at the same weight: steel 1x, Kevlar 5x (as stated by NIHF / SHI)
  c.drawImage(BG.a, 0, 0);
  const outA = pr(t, ws(50) - 0.32, ws(50) - 0.14), inB = pr(t, ws(50) - 0.12, ws(50) + 0.12); // sequential: the pull diagram leaves, then the bars arrive
  if (outA < 1) { c.save(); c.globalAlpha = 1 - outA; c.translate(0, -160 * outA);
    const d = 14 * pr(t, ws(44) - 0.1, ws(44) + 0.45, eout);
    for (let k = 0; k < PR.n; k++) { const tk = ws(47) - 0.2 + k * 0.05; const gl = pr(t, tk, tk + 0.3) * (0.7 + 0.3 * Math.sin((t - tk) * 6)); rod(c, PR.x0 - d, PR.y0 + k * PR.dy, PR.len + 2 * d, 1 - outA, t > tk ? gl : 0); }
    const clampAt = (x) => { c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; const g = c.createLinearGradient(x - 40, 0, x + 40, 0); g.addColorStop(0, '#1A2321'); g.addColorStop(0.5, '#56625F'); g.addColorStop(1, '#151C1A'); c.fillStyle = g; rr(c, x - 40, PR.y0 - 50, 80, (PR.n - 1) * PR.dy + 100, 14); c.fill(); c.restore(); };
    clampAt(PR.x0 - d - 34); clampAt(PR.x0 + PR.len + d + 34);
    const aa = pr(t, ws(44) - 0.15, ws(44) + 0.2, eout); if (aa > 0) { c.save(); c.globalAlpha = aa * (1 - outA); c.strokeStyle = C.cream; c.fillStyle = C.cream; c.lineWidth = 8; c.lineCap = 'round';
      const arrow = (xa, xb) => { c.beginPath(); c.moveTo(xa, 720); c.lineTo(xb, 720); c.stroke(); const dir = Math.sign(xb - xa); c.beginPath(); c.moveTo(xb + dir * 10, 720); c.lineTo(xb - dir * 22, 702); c.lineTo(xb - dir * 22, 738); c.closePath(); c.fill(); };
      arrow(PR.x0 - d - 20, PR.x0 - d - 20 - 100 * aa); arrow(PR.x0 + PR.len + d + 20, PR.x0 + PR.len + d + 20 + 100 * aa); c.restore(); }
    label(c, 'load shared', CX, 1200, 56, C.gold, 'Fraunces', pr(t, ws(47) - 0.1, ws(49) + 0.1, eout) * (1 - outA));
    c.restore(); }
  if (inB > 0) { c.save(); c.globalAlpha = inB; c.translate(0, 160 * (1 - inB));
    label(c, 'same weight', CX, 760, 44, C.cream, 'Mono', 0.9 * inB);
    const bx = 170, unit = 112, kv = lerp(1, 5, pr(t, ws(52) - 0.1, ws(53) + 0.3, eout));
    const bar = (y, wd, col, name, nameCol) => { label(c, name, bx, y - 22, 50, nameCol, 'InterX', inB, 'left'); c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 26; c.shadowOffsetY = 10; c.fillStyle = col; rr(c, bx, y, wd, 84, 14); c.fill(); c.restore(); };
    const sg = c.createLinearGradient(0, 900, 0, 984); sg.addColorStop(0, '#B9C4C0'); sg.addColorStop(1, '#6E7A76'); bar(900, unit, sg, 'steel', C.cream);
    label(c, '1×', bx + unit + 70, 962, 50, C.cream, 'Fraunces', inB);
    const kg = c.createLinearGradient(0, 1110, 0, 1194); kg.addColorStop(0, '#FFD98A'); kg.addColorStop(1, '#C98A22'); bar(1110, unit * kv, kg, 'Kevlar', C.gold);
    label(c, '5×', bx + unit * 5 + 90, 1176, 96, C.gold, 'Fraunces', pr(t, ws(53) - 0.05, ws(53) + 0.3, eout) * inB);
    c.restore(); }
}
function scene6(c, t) { // PAYOFF: strong isn't bulletproof; ask which threats a vest is rated for (NIJ)
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, POR, 0.345, 0.36, 0.25, CX, 640, 112, 1);
  label(c, 'STEPHANIE KWOLEK', CX, 820, 32, C.goldDeep, 'Mono', 1);
  const la = pr(t, ws(58) - 0.15, ws(60) + 0.1, eout); label(c, "STRONG ISN'T", CX, 930, 60, C.ink, 'InterX', la); label(c, 'BULLETPROOF', CX, 1000, 60, C.ink, 'InterX', pr(t, ws(60) - 0.15, ws(60) + 0.25, eout));
  const va = pr(t, T.turn[1] - 0.05, T.turn[1] + 0.4, eout); vest(c, 390, 1065, 360, 430, va);
  const ga = pr(t, ws(61) - 0.2, ws(61) + 0.3, eout); if (ga > 0) { const sw = Math.sin((t - ws(61)) * 7) * Math.exp(-(t - ws(61)) * 2.4) * 0.25; c.save(); c.globalAlpha = ga; const px = 556, py = 1150;
    c.strokeStyle = C.ink; c.lineWidth = 3; c.translate(px, py); c.rotate(-0.12 + sw); c.beginPath(); c.moveTo(0, 0); c.lineTo(60, 70); c.stroke();
    c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 18; c.shadowOffsetY = 8; c.fillStyle = '#FFF7E3'; rr(c, 30, 70, 300, 150, 18); c.fill(); c.shadowColor = 'rgba(0,0,0,0)'; c.strokeStyle = C.goldDeep; c.lineWidth = 5; rr(c, 30, 70, 300, 150, 18); c.stroke();
    c.fillStyle = C.goldDeep; c.beginPath(); c.arc(60, 98, 9, 0, 6.283); c.fill(); c.textAlign = 'center'; c.fillStyle = C.ink; c.font = '800 32px Mono'; c.fillText('RATED FOR', 180, 132); c.font = '800 40px InterX'; c.fillText('which threats?', 180, 188); c.restore(); }
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
  const cues = { T, sweep: 0.4, cut: T.cut, q: ws(14) - 0.15, whip: T.whip, underline: ws(23) - 0.15, spinneret: ws(25) - 0.35, flow: [ws(27) - 0.15, ws(29) + 0.4], spun: ws(27) - 0.1,
    push: T.push, zoom: [ws(31) - 0.15, ws(33) + 0.1], rods: Array.from({ length: RODS }, (_, k) => ws(33) - 0.05 + k * 0.09), spaghetti: ws(39) - 0.2, tangle: ws(41) - 0.2, strike: ws(43) - 0.05,
    push2: T.push2, pull: ws(44) - 0.1, share: ws(47) - 0.2, swap: ws(50) - 0.32, grow: [ws(52) - 0.1, ws(53) + 0.3], five: ws(53) - 0.05,
    turn: T.turn, strong: ws(58) - 0.15, bulletproof: ws(60) - 0.15, tag: ws(61) - 0.2, cta: T.cta };
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
