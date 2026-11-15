// Aarambh english-18 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25) and the
// 2026-11-15 first-frame addendum: frame 0 = real portrait + the pump and its handle + "ONE HANDLE. MANY LIVES." (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: John Snow and the 1854 Broad Street outbreak — over 500 died in ten days near one pump -> many doctors blamed bad air; how did Snow find the cause?
// -> he traced where the dead had lived: nearly all near the Broad Street pump (his real map) -> the exceptions: brewery workers drinking beer escaped;
// the workhouse with its own well barely suffered -> the handle came off (8 Sept), but attacks were already falling (his own Table 1)
// -> lesson: map who got sick, then ask who was spared.
// Archival objects (public domain): John Snow, autotype of an 1856 photograph; Snow's map of deaths around Broad Street (1854, in the 1855 2nd edition);
// title page of "On the Mode of Communication of Cholera" (1855; Wellcome Collection b28985266). Data: Snow (1855) Table 1 via HistData::Snow.dates.
// Pump, fog, rings, plates, chart and cards are original illustration.
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
  [0, 7, ['In ten days, cholera', 'killed over 500 people']],
  [8, 11, ['near one London pump.']],
  [12, 16, ['Many doctors', 'blamed bad air.']],
  [17, 23, ['How did John Snow', 'find the cause?']],
  [24, 30, ['He traced where the', 'dead had lived:']],
  [31, 37, ['nearly all near the', 'Broad Street pump.']],
  [38, 42, ['Brewery workers', 'drinking beer escaped;']],
  [43, 50, ['a workhouse with its', 'own well barely suffered.']],
  [51, 54, ['The handle came off,']],
  [55, 59, ['but attacks were', 'already falling.']],
  [60, 64, ['Lesson: map', 'who got sick,']],
  [65, 69, ['then ask', 'who was spared.']],
  [70, 75, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 12: SENT[1].start, 24: SENT[2].start, 38: SENT[3].start, 51: SENT[4].start, 60: SENT[5].start, 70: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                      // hard cut on "Many doctors blamed bad air" -> fog (miasma), then his 1855 book
  whip: [SENT[2].start - 0.2, SENT[2].start],     // whip pan to his real map of the deaths around Broad Street
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05], // push closer on the map: the brewery and the workhouse
  push2: [SENT[4].start - 0.3, SENT[4].start],    // push to the pump and his own table of attacks by day
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR0 = await loadImage(path.join(ROOT, 'assets/john-snow-portrait-1856-pd.jpg'));
const MAP = await loadImage(path.join(ROOT, 'assets/snow-broad-street-map-1854-pd.jpg'));
const BOOK = await loadImage(path.join(ROOT, 'assets/snow-1855-title-page-wellcome-pd.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
// Snow's Table 1 (1855), fatal attacks by day, 19 Aug - 30 Sep 1854 (via HistData::Snow.dates; 45 attacks of unknown date omitted)
const DAYS = readFileSync(path.join(ROOT, 'assets/snow-1855-table1-fatal-attacks-by-day.csv'), 'utf8').trim().split('\n').slice(1).map((l) => l.split(',')).filter((v) => v[1]).map((v) => ({ date: v[1], n: +v[2] }));
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
function pump(c, x, y, s, hOff = 0, t = 0) { // a cast-iron Victorian street pump (illustration); y = ground line; hOff 0..1 = the handle coming off and falling
  c.save();
  c.save(); c.globalAlpha = 0.45; const sh = c.createRadialGradient(x, y + 6, 10, x, y + 6, 150 * s); sh.addColorStop(0, 'rgba(0,0,0,0.7)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sh; c.beginPath(); c.ellipse(x, y + 6, 150 * s, 26 * s, 0, 0, 6.283); c.fill(); c.restore();
  const metal = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#0B1512'); g.addColorStop(0.3, '#2F4A40'); g.addColorStop(0.45, '#5E7A6F'); g.addColorStop(0.62, '#1E3229'); g.addColorStop(1, '#08100D'); return g; };
  c.fillStyle = metal(x - 78 * s, x + 78 * s); rr(c, x - 78 * s, y - 46 * s, 156 * s, 46 * s, 8 * s); c.fill();
  c.beginPath(); c.moveTo(x - 50 * s, y - 46 * s); c.lineTo(x - 38 * s, y - 420 * s); c.lineTo(x + 38 * s, y - 420 * s); c.lineTo(x + 50 * s, y - 46 * s); c.closePath(); c.fillStyle = metal(x - 50 * s, x + 50 * s); c.fill();
  c.strokeStyle = 'rgba(241,190,110,0.45)'; c.lineWidth = 4 * s; c.beginPath(); c.moveTo(x + 48 * s, y - 50 * s); c.lineTo(x + 37 * s, y - 415 * s); c.stroke();
  c.strokeStyle = 'rgba(160,200,185,0.16)'; c.lineWidth = 3 * s; for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(x + k * 70 * s, y - 60 * s); c.lineTo(x + k * 54 * s, y - 405 * s); c.stroke(); }
  for (const yy of [y - 160 * s, y - 420 * s]) { c.fillStyle = metal(x - 56 * s, x + 56 * s); rr(c, x - 56 * s, yy - 14 * s, 112 * s, 28 * s, 8 * s); c.fill(); }
  c.fillStyle = metal(x - 62 * s, x + 62 * s); c.beginPath(); c.moveTo(x - 62 * s, y - 432 * s); c.quadraticCurveTo(x, y - 540 * s, x + 62 * s, y - 432 * s); c.closePath(); c.fill();
  c.beginPath(); c.arc(x, y - 548 * s, 16 * s, 0, 6.283); c.fill();
  c.strokeStyle = metal(x - 40 * s, x + 110 * s); c.lineWidth = 26 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 30 * s, y - 232 * s); c.quadraticCurveTo(x - 110 * s, y - 236 * s, x - 112 * s, y - 196 * s); c.stroke();
  c.fillStyle = '#050A08'; c.beginPath(); c.ellipse(x - 112 * s, y - 186 * s, 13 * s, 6 * s, 0, 0, 6.283); c.fill();
  // the handle: pivot near the top, long arm with a knob; rim-lit in gold
  const px = x + 36 * s, py = y - 372 * s; const fall = Math.max(0, hOff); c.save(); c.translate(px + 60 * s * fall, py + 520 * s * fall * fall); c.rotate(0.42 + 1.9 * fall); c.globalAlpha = 1 - pr(fall, 0.7, 1);
  c.lineCap = 'round'; c.strokeStyle = '#13201B'; c.lineWidth = 24 * s; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(110 * s, -24 * s, 230 * s, 6 * s); c.stroke();
  c.strokeStyle = 'rgba(241,180,68,0.95)'; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(6 * s, -10 * s); c.quadraticCurveTo(110 * s, -34 * s, 226 * s, -5 * s); c.stroke();
  c.fillStyle = '#13201B'; c.beginPath(); c.arc(240 * s, 8 * s, 22 * s, 0, 6.283); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 4 * s; c.beginPath(); c.arc(240 * s, 8 * s, 22 * s, Math.PI * 1.05, Math.PI * 1.75); c.stroke();
  c.restore();
  if (fall < 1) { c.fillStyle = '#0B1512'; c.beginPath(); c.arc(px, py, 15 * s, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(241,180,68,0.8)'; c.lineWidth = 3 * s; c.beginPath(); c.arc(px, py, 15 * s, Math.PI * 1.1, Math.PI * 1.8); c.stroke(); }
  else { c.fillStyle = '#0B1512'; c.beginPath(); c.arc(px, py, 10 * s, 0, 6.283); c.fill(); }
  c.restore();
}
function fog(c, t, a) { // drifting "bad air" (miasma) clouds — illustration of the belief, not of a cause
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  for (let k = 0; k < 16; k++) { const sp = 18 + 22 * rnd(k, 2), dir = k % 2 ? 1 : -1; const x = ((rnd(k, 1) * 1400 + dir * sp * t * 3) % 1500 + 1500) % 1500 - 210, y = 520 + rnd(k, 3) * 1000 + Math.sin(t * 0.8 + k) * 30, r = 220 + 200 * rnd(k, 4);
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${150 + 30 * rnd(k, 5)},${170 + 20 * rnd(k, 6)},${140},0.34)`); g.addColorStop(1, 'rgba(120,150,120,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  c.restore(); }
function plate(c, lines, y, a) { // a dark label plate (for labels over the white map): [[text, size, font, col], ...]
  if (a <= 0) return; c.save(); c.globalAlpha = a; let w = 0; for (const [tx, sz, f] of lines) { c.font = `800 ${sz}px ${f}`; w = Math.max(w, c.measureText(tx).width); } w += 64; const h = lines.reduce((s, l) => s + l[1] * 1.25, 0) + 40;
  c.translate(0, (1 - a) * 24); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 30; c.shadowOffsetY = 10; c.fillStyle = 'rgba(2,28,22,0.93)'; rr(c, CX - w / 2, y, w, h, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = C.gold; c.lineWidth = 3; rr(c, CX - w / 2, y, w, h, 20); c.stroke(); c.textAlign = 'center'; let yy = y + 20;
  for (const [tx, sz, f, col] of lines) { yy += sz * 1.05; c.font = `800 ${sz}px ${f}`; c.fillStyle = col; c.fillText(tx, CX, yy); yy += sz * 0.2; } c.restore(); }
function ring(c, x, y, r, a, pulse = 0) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.gold; c.lineWidth = 7; c.shadowColor = 'rgba(241,180,68,0.8)'; c.shadowBlur = 20; c.beginPath(); c.arc(x, y, r * (0.6 + 0.4 * a), 0, 6.283); c.stroke();
  if (pulse > 0) { c.globalAlpha = a * (1 - pulse) * 0.8; c.beginPath(); c.arc(x, y, r * (1 + pulse * 0.9), 0, 6.283); c.stroke(); } c.restore(); }
// ---------- the real map: a camera over the print (no rotation, so map points map exactly to the screen) ----------
const MAPW = 900, MAPH = MAPW * MAP.height / MAP.width;
const MP = { pump: [0.506, 0.502], work: [0.348, 0.308], brew: [0.626, 0.532] }; // positions on the map crop (fractions)
function mapView(c, fx, fy, z, ay = 920) { const w = MAPW * z, h = MAPH * z, x = CX - fx * w, y = ay - fy * h; photo(c, MAP, x, y, w, 0, 1); return (p) => [x + p[0] * w, y + p[1] * h]; }
function heat(c, at, z, a) { if (a <= 0) return; const [x, y] = at(MP.pump), r = 230 * z * (0.5 + 0.5 * a); c.save(); c.globalCompositeOperation = 'screen'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(241,170,50,${0.95 * a})`); g.addColorStop(0.6, `rgba(241,170,50,${0.6 * a})`); g.addColorStop(1, 'rgba(241,170,50,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
// ---------- scenes (each draws the full frame; t is global time) ----------
const POR = crop(POR0, 0.05, 0.02, 0.97, 0.62); // John Snow, head and torso
const F0 = { por: [46, 600, 470, -0.03], pump: [705, 1225, 1.18] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + the pump with its handle + "ONE HANDLE. MANY LIVES."
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  pump(c, ...F0.pump, 0, t);
  photo(c, POR, ...F0.por, 1, t > 0.4 ? pr(t, 0.4, 1.7, (u) => u) : -1);
  c.restore();
  label(c, 'ONE HANDLE.', CX, 1440, 104, C.cream, 'InterX'); label(c, 'MANY LIVES.', CX, 1572, 112, C.gold, 'InterX');
}
const BK = { x: 255, y: 560, w: 490 }; BK.h = BK.w * BOOK.height / BOOK.width;
function scene2(c, t) { // ESCALATION: "bad air" (miasma) fog; it clears to his 1855 book
  c.drawImage(BG.b, 0, 0);
  const open = pr(t, ws(17) - 0.2, ws(19) + 0.3);
  if (open > 0) { const s = lerp(0.9, 1, eout(open)); c.save(); c.translate(CX, BK.y + BK.h / 2); c.scale(s, s); c.translate(-CX, -(BK.y + BK.h / 2)); photo(c, BOOK, BK.x, BK.y, BK.w, 0.012, open, t > ws(19) ? pr(t, ws(19), ws(19) + 1.3, (u) => u) : -1);
    const u = pr(t, ws(19) - 0.1, ws(20) + 0.3, eout); if (u > 0) { c.translate(CX, BK.y + BK.h / 2); c.rotate(0.012); c.translate(-CX, -(BK.y + BK.h / 2)); c.fillStyle = C.gold; const ux0 = BK.x + BK.w * 0.28, ux1 = BK.x + BK.w * 0.665, uy = BK.y + BK.h * 0.540; rr(c, ux0, uy, (ux1 - ux0) * u, 6, 3); c.fill(); }
    c.restore(); }
  fog(c, t, 1 - 0.85 * open);
  const ba = pr(t, ws(15) - 0.15, ws(16) + 0.2, eout) * (1 - pr(t, ws(17) - 0.3, ws(17) + 0.1)); label(c, 'bad air?', CX, 1060, 110, C.cream, 'Fraunces', ba);
}
function scene3(c, t) { // PROOF 1: his real map; the deaths cluster around the Broad Street pump
  c.drawImage(BG.c, 0, 0);
  const u = pr(t, T.whip[1], T.push[0], (v) => v), fx = lerp(0.5, MP.pump[0], u), fy = lerp(0.45, MP.pump[1], u), z = lerp(1.0, 1.32, eio(u));
  const at = mapView(c, fx, fy, z);
  heat(c, at, z, pr(t, ws(31) - 0.15, ws(33) + 0.3, eout));
  const pa = pr(t, ws(35) - 0.15, ws(35) + 0.25, eout); const [px, py] = at(MP.pump); ring(c, px, py, 44 * z, pa, ((t - ws(35)) % 1.2) / 1.2 * (t > ws(35) ? 1 : 0));
  label(c, 'Broad Street pump', CX, 1450, 62, C.gold, 'Fraunces', pa);
}
function scene4(c, t) { // PROOF 2: the exceptions near the pump — the brewery (beer, its own well) and the workhouse (its own well)
  c.drawImage(BG.c, 0, 0);
  const pan = pr(t, ws(43) - 0.45, ws(43) + 0.1), fx = lerp(MP.brew[0], MP.work[0], pan), fy = lerp(MP.brew[1], MP.work[1], pan), z = 1.75;
  const at = mapView(c, fx, fy, z, 880); heat(c, at, z, 0.75);
  const ba = pr(t, ws(38) - 0.2, ws(38) + 0.2, eout) * (1 - pan); const [bx, by] = at(MP.brew); ring(c, bx, by, 70, ba);
  plate(c, [['BREWERY', 56, 'InterX', C.cream], ['beer, not pump water', 36, 'Mono', C.gold]], 1300, ba * pr(t, ws(40) - 0.15, ws(40) + 0.2, eout));
  const wa = pr(t, ws(44) - 0.2, ws(44) + 0.2, eout); const [wx, wy] = at(MP.work); ring(c, wx, wy, 120, wa);
  plate(c, [['WORKHOUSE', 56, 'InterX', C.cream], ['own well: 5 of 535 died', 36, 'Mono', C.gold]], 1300, wa * pr(t, ws(48) - 0.15, ws(49) + 0.1, eout));
}
const CH = { x0: 140, x1: 860, base: 1440, top: 1100 }; const PEAK = Math.max(...DAYS.map((d) => d.n)); const iSep8 = DAYS.findIndex((d) => d.date === '1854-09-08'), iSep1 = DAYS.findIndex((d) => d.date === '1854-09-01');
function scene5(c, t) { // the handle came off (8 Sept) — but his own table shows attacks were already falling
  c.drawImage(BG.a, 0, 0);
  const off = pr(t, ws(53) - 0.1, ws(54) + 0.55, (v) => v * v); pump(c, CX, 980, 0.78, off, t);
  const grow = pr(t, T.push2[1] - 0.05, T.push2[1] + 0.7, eout), hl = pr(t, ws(58) - 0.2, ws(59) + 0.2, eout), bw = (CH.x1 - CH.x0) / DAYS.length;
  c.save(); c.fillStyle = 'rgba(251,247,238,0.5)'; c.fillRect(CH.x0 - 6, CH.base, CH.x1 - CH.x0 + 12, 4); c.restore();
  DAYS.forEach((d, i) => { const h = (CH.base - CH.top) * d.n / PEAK * clamp(grow * 1.6 - i / DAYS.length * 0.6); if (h <= 0) return; const x = CH.x0 + i * bw;
    const inFall = i >= iSep1 && i <= iSep8; c.fillStyle = inFall && hl > 0 ? `rgba(241,180,68,${0.55 + 0.45 * hl})` : 'rgba(251,247,238,0.82)'; rr(c, x + 1.5, CH.base - h, bw - 3, h, 3); c.fill(); });
  label(c, '143', CH.x0 + (iSep1 + 0.5) * bw, CH.top - 18, 40, C.cream, 'Mono', grow);
  label(c, 'fatal attacks per day', CX, CH.base + 56, 30, 'rgba(251,247,238,0.7)', 'Mono', grow);
  const ma = pr(t, ws(54) - 0.1, ws(54) + 0.3, eout); if (ma > 0) { const mx = CH.x0 + (iSep8 + 0.5) * bw; c.save(); c.globalAlpha = ma; c.fillStyle = C.gold; c.fillRect(mx - 3, CH.top + 40, 6, CH.base - CH.top - 40); c.beginPath(); c.moveTo(mx, CH.top + 40); c.lineTo(mx - 14, CH.top + 16); c.lineTo(mx + 14, CH.top + 16); c.closePath(); c.fill(); c.restore();
    label(c, 'handle off · Sept 8', mx + 20, CH.top - 2, 36, C.gold, 'InterX', ma, 'left'); }
  if (hl > 0) { c.save(); c.globalAlpha = hl; c.strokeStyle = C.gold; c.fillStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; const x0 = CH.x0 + (iSep1 + 1.5) * bw, x1 = CH.x0 + (iSep8 - 0.5) * bw, y0 = CH.top + 40, y1 = CH.base - 120;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(lerp(x0, x1, hl), lerp(y0, y1, hl)); c.stroke(); c.restore(); label(c, 'already falling', CX - 150, CH.base + 110, 46, C.gold, 'Fraunces', hl); }
}
function scene6(c, t) { // PAYOFF: map who got sick, then ask who was spared
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, POR, 0.603, 0.4, 0.2, CX, 700, 130, 1);
  label(c, 'JOHN SNOW', CX, 905, 34, C.goldDeep, 'Mono', 1);
  const c1 = pr(t, ws(61) - 0.2, ws(62) + 0.1, eout), c2 = pr(t, ws(66) - 0.2, ws(67) + 0.1, eout);
  const card = (y, txt, a, mark) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 150, y - 60, 700, 120, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 44px Mono'; c.textAlign = 'left'; c.fillText(mark, 190, y + 16); c.fillStyle = C.cream; c.font = '800 46px InterX'; c.fillText(txt, 270, y + 16); c.restore(); };
  card(1060, 'map who got sick', c1, '1'); card(1210, 'ask who was spared', c2, '2');
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
  const cues = { T, sweep: 0.4, cut: T.cut, badair: ws(15) - 0.15, open: ws(17) - 0.2, underline: ws(19) - 0.1, whip: T.whip, heat: ws(31) - 0.15, pumpring: ws(35) - 0.15,
    push: T.push, brew: ws(38) - 0.2, brewlabel: ws(40) - 0.15, pan: ws(43) - 0.45, work: ws(44) - 0.2, worklabel: ws(48) - 0.15,
    push2: T.push2, bars: [T.push2[1] - 0.05, T.push2[1] + 0.7], handle: ws(53) - 0.1, marker: ws(54) - 0.1, falling: ws(58) - 0.2,
    turn: T.turn, card1: ws(61) - 0.2, card2: ws(66) - 0.2, cta: T.cta };
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
