// Aarambh Hindi-04 30 s #01 — Archive Light Table (Hindi): Louis Braille and why six raised dots read by touch.
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted recipe); Devanagari captions.
// Archival objects: Henri Thiriat's 1887 engraving of Louis Braille (public domain, Wikimedia Commons) and pages of Braille's own
// 1829 "Procédé" (APH M.C. Migel Library scan on the Internet Archive, "No Copyright"). Cells, fingertip, slate/stylus and the
// Barbier grid are original illustrations labelled "चित्रण". Braille letters drawn follow the 1829 definitions (b = dots 1-2, c = 1-4).
// Original Canvas2D code (renderer from hindi-03); art direction (read-only) from the public Archive Light Table STYLE.md.
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues
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
// Devanagari (Noto, OFL via @fontsource) with Latin subsets as fallback for digits/punctuation
GlobalFonts.registerFromPath(`${FS}/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-800-normal.woff2`, 'DevaX');
GlobalFonts.registerFromPath(`${FS}/noto-sans-devanagari/files/noto-sans-devanagari-latin-800-normal.woff2`, 'DevaLatinX');
GlobalFonts.registerFromPath(`${FS}/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-700-normal.woff2`, 'DevaB');
GlobalFonts.registerFromPath(`${FS}/noto-sans-devanagari/files/noto-sans-devanagari-latin-700-normal.woff2`, 'DevaLatinB');
GlobalFonts.registerFromPath(`${FS}/noto-serif-devanagari/files/noto-serif-devanagari-devanagari-800-normal.woff2`, 'DevaSerif');
GlobalFonts.registerFromPath(`${FS}/noto-serif-devanagari/files/noto-serif-devanagari-latin-800-normal.woff2`, 'DevaSerifLatin');
const HX = 'DevaX, DevaLatinX', HB = 'DevaB, DevaLatinB', HS = 'DevaSerif, DevaSerifLatin';

const W = 1080, H = 1920, FPS = 30, N = 900;
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', yarnDark: '#B9A887', skin: '#E6C7A6', skinDark: '#B98F6A', slate: '#2E3B36' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], u)); }
  return keys[keys.length - 1][1];
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ---------- word timings (one ASR pass on placed narration) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; Hindi ASR word indices (qa/asr_words_narration.json)
  [0, 11, ['दृष्टिबाधित किशोर लुई ब्रेल ने', 'छह उभरे बिंदुओं की लिपि बनाई।']],
  [12, 20, ['उनके स्कूल में उभरे अक्षर', 'छूकर पहचानना मुश्किल था।']],
  [21, 30, ['बार्बिए की लिपि में 12 बिंदु थे;', 'ब्रेल ने इन्हें आधा किया।']],
  [31, 36, ['बिंदुओं की जगह से', 'अक्षर बदलता है:']],
  [37, 44, ['ऊपर-नीचे दो बिंदु ‘बी’,', 'अगल-बगल ‘सी’।']],
  [45, 53, ['सीख: चीज़ें इस्तेमाल करने वाले', 'के नाप से बनाइए।']],
  [54, 62, ['आरंभ डाउनलोड करें,', 'आजीविका के औज़ारों का साथ दें।']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 12: SENT[1].start, 21: SENT[2].start, 31: SENT[3].start, 45: SENT[4].start, 54: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : ws(a));
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start], turn2: [SENT[3].start - 0.35, SENT[3].start],
  cut: ws(37) - 0.08, // hard cut on "ऊपर"
  loupe: [ws(37) + 0.15, ws(44) + 0.45], loupeMove: [ws(42) - 0.15, ws(44) - 0.15], // sign 2 (b) -> sign 3 (c) in the real 1829 table
  swap2: [SENT[4].start - 0.35, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['portrait', 'louis-braille-engraving-thiriat-1887.jpg'], ['title1829', 'braille-1829-procede-title-page.jpg'], ['signs1829', 'braille-1829-procede-p5-ten-signs.jpg']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), diffuser = noiseTile(256, 3, 20), paperTex = noiseTile(256, 21, 14);
const tableCache = createCanvas(W + 800, H + 800);
{
  const c = tableCache.getContext('2d'); c.translate(400, 400);
  c.fillStyle = C.desk; c.fillRect(-400, -400, W + 800, H + 800);
  rr(c, 30, 250, W - 60, H - 330, 26); c.fillStyle = C.green; c.fill();
  rr(c, 52, 272, W - 104, H - 374, 14);
  const g = c.createRadialGradient(540, 1050, 120, 540, 1050, 1000); g.addColorStop(0, '#FFFFFB'); g.addColorStop(1, '#E2EADD');
  c.save(); c.fillStyle = g; c.fill(); c.clip();
  c.globalAlpha = 0.06; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(diffuser, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(5,71,58,0.08)'; c.lineWidth = 1.5;
  for (let x = 92; x < W - 52; x += 64) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, H - 102); c.stroke(); }
  for (let y = 304; y < H - 102; y += 64) { c.beginPath(); c.moveTo(52, y); c.lineTo(W - 52, y); c.stroke(); }
  c.restore();
}

// ---------- pages (900 x 1000 local), drawn per frame onto offscreen canvases ----------
const PW = 900, PH = 1000, PX = 90, PY = 512;
const paperBG = (() => {
  const cv = createCanvas(PW, PH), c = cv.getContext('2d');
  c.fillStyle = C.paper; c.fillRect(0, 0, PW, PH);
  c.globalAlpha = 0.18; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, PW, PH);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  const g = c.createRadialGradient(PW / 2, PH / 2, PW * 0.3, PW / 2, PH / 2, PW * 0.78); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.16)');
  c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = 'rgba(5,71,58,0.3)'; c.lineWidth = 2; c.strokeRect(16, 16, PW - 32, PH - 32);
  return cv;
})();
const pageCv = {}; for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']) pageCv[id] = createCanvas(PW, PH);
function head(c, kicker, title) {
  c.textAlign = 'left'; c.fillStyle = C.goldDeep; c.font = `700 28px ${HB}`; c.fillText(kicker, 48, 72);
  if (title) { c.fillStyle = C.ink; c.font = `800 44px ${HS}`; c.fillText(title, 48, 130); }
}
function foot(c, text) { c.textAlign = 'left'; c.font = `700 22px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.72)'; c.fillText(text, 48, PH - 34); }
function label(c, text, x, y, ax, ay, a = 1) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(x, y); c.stroke();
  c.fillStyle = C.gold; c.beginPath(); c.arc(ax, ay, 7, 0, 6.283); c.fill();
  c.font = `800 32px ${HX}`; const w = c.measureText(text).width + 32;
  c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, x - w / 2, y - 27, w, 54, 12); c.fill();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.fillText(text, x, y + 11); c.restore();
}
function stamp(c, lines, x, y, a, rot = -0.08) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  c.font = `800 34px ${HX}`; const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 40, h = 26 + lines.length * 46;
  c.strokeStyle = C.goldDeep; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  c.fillStyle = C.goldDeep; c.textAlign = 'center'; lines.forEach((l, i) => { c.font = i === 0 ? `800 34px ${HX}` : `700 28px ${HB}`; c.fillText(l, 0, -h / 2 + 52 + i * 44); });
  c.restore();
}
function note(c, text, x, y, size = 22, col = 'rgba(18,59,49,0.72)', align = 'left') { c.textAlign = align; c.font = `700 ${size}px ${HB}`; c.fillStyle = col; c.fillText(text, x, y); }
// archival print: white border + soft shadow; returns drawn rect
function print(c, img, x, y, w, rot = 0, credit = null, align = 'left') {
  const h = w * img.height / img.width;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24 + (credit ? 30 : 0)); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (credit) { c.font = `700 19px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.8)'; c.textAlign = align; c.fillText(credit, align === 'right' ? w / 2 : -w / 2, h / 2 + 30); }
  c.restore(); return { x, y, w, h };
}

// ---------- braille primitives (illustration) ----------
// dot k (1..6): column = k <= 3 ? 0 : 1, row = (k - 1) % 3  — Braille 1829: "first column" left, "upper position" furthest from the reader
const dotXY = (cx, cy, s, k) => [cx + (k <= 3 ? -0.5 : 0.5) * s, cy + (((k - 1) % 3) - 1) * s];
function emptyPos(c, x, y, r, num = null, a = 1) {
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 3; c.setLineDash([5, 6]); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke(); c.setLineDash([]);
  if (num !== null) { c.fillStyle = 'rgba(18,59,49,0.55)'; c.font = `800 ${Math.round(r * 0.9)}px Mono`; c.textAlign = 'center'; c.fillText(String(num), x, y + r * 0.32); }
  c.restore();
}
function raisedDot(c, x, y, r, h = 1) { // h 0..1: how far the bump has risen (scale + shadow)
  if (h <= 0) return; const rr_ = r * (0.55 + 0.45 * h);
  c.save(); c.fillStyle = `rgba(2,34,28,${0.25 * h})`; c.beginPath(); c.arc(x + 4 * h, y + 6 * h, rr_, 0, 6.283); c.fill();
  const g = c.createRadialGradient(x - rr_ * 0.35, y - rr_ * 0.4, rr_ * 0.1, x, y, rr_); g.addColorStop(0, '#FFF6DC'); g.addColorStop(0.45, C.gold); g.addColorStop(1, C.goldDeep);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, rr_, 0, 6.283); c.fill(); c.restore();
}
function cell(c, cx, cy, s, r, dots, rise = () => 1, nums = false, posA = 1) { // dots: list of raised positions; rise(k) -> 0..1
  for (let k = 1; k <= 6; k++) { const [x, y] = dotXY(cx, cy, s, k); emptyPos(c, x, y, r, nums ? k : null, posA); }
  for (const k of dots) { const [x, y] = dotXY(cx, cy, s, k); raisedDot(c, x, y, r, rise(k)); }
}
function finger(c, tipX, tipY, ang, len = 330, wid = 92, a = 0.95) { // illustrated fingertip; pad centre at (tipX, tipY), shaft along angle ang
  c.save(); c.globalAlpha = a; c.translate(tipX, tipY); c.rotate(ang);
  c.fillStyle = 'rgba(2,34,28,0.18)'; rr(c, -wid / 2 + 8, -wid / 2 + 10, len, wid, wid / 2); c.fill();
  c.fillStyle = C.skin; c.strokeStyle = C.skinDark; c.lineWidth = 3; rr(c, -wid / 2, -wid / 2, len, wid, wid / 2); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,240,225,0.75)'; c.strokeStyle = 'rgba(185,143,106,0.8)'; c.lineWidth = 2; rr(c, -wid * 0.18, -wid * 0.32, wid * 0.62, wid * 0.64, wid * 0.22); c.fill(); c.stroke(); // nail
  c.strokeStyle = 'rgba(185,143,106,0.6)'; c.lineWidth = 2; for (const dx of [len * 0.42, len * 0.47]) { c.beginPath(); c.moveTo(dx, -wid * 0.35); c.quadraticCurveTo(dx + 8, 0, dx, wid * 0.35); c.stroke(); }
  c.restore();
}

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'कूपव्रे, फ़्रांस · 1809–1852', null);
  print(c, IMG.portrait, 56, 108, 440, -0.015, 'चित्र: हेनरी थिरिआ (उत्कीर्णन), 1887');
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = `800 56px ${HS}`; c.fillText('लुई ब्रेल', 540, 190);
  c.font = `700 28px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.85)'; c.fillText('ब्रेल लिपि के आविष्कारक', 540, 238);
  // six positions rise one by one on "छह उभरे बिंदुओं"
  const t0 = ws(6) - 0.05, t1 = ws(8) + 0.35;
  cell(c, 690, 420, 92, 30, [1, 2, 3, 4, 5, 6], (k) => pr(t, t0 + (k - 1) * (t1 - t0) / 6, t0 + (k - 1) * (t1 - t0) / 6 + 0.22, eout));
  note(c, 'छह बिंदुओं का खाना (चित्रण)', 690, 600, 24, 'rgba(18,59,49,0.75)', 'center');
  stamp(c, ['1824', '15 वर्ष की उम्र में'], 690, 740, pr(t, ws(10) - 0.1, ws(10) + 0.3, eout), -0.06);
  foot(c, 'स्रोत: AFB · RNIB');
}
function drawP2(c, t) {
  head(c, 'पेरिस: दृष्टिबाधित युवाओं का संस्थान', 'उभरे अक्षरों वाली किताबें');
  const r = print(c, IMG.title1829, 60, 170, 470, -0.012, 'स्कैन: ब्रेल की किताब, 1829 (उभरे अक्षर)');
  pages.p2print = r;
  // fingertip traces the raised letters of "PROCEDE" slowly (illustration)
  const u = pr(t, ws(17) - 0.45, ws(19) + 0.2, (x) => x), on = Math.min(pr(t, ws(17) - 0.7, ws(17) - 0.3, eout), 1 - pr(t, T.swap[0] - 0.25, T.swap[0], eout));
  if (on > 0) { const wob = Math.sin(u * Math.PI * 7) * 10; finger(c, lerp(r.x + 80, r.x + r.w - 70, u), r.y + 62 + wob, 0.55, 300, 84, 0.93 * on); }
  label(c, 'उभरे अक्षर', 700, 300, r.x + r.w * 0.82, r.y + 64, pr(t, ws(15) - 0.15, ws(15) + 0.3, eout));
  note(c, 'चित्रण: उँगली हर अक्षर', 580, 420, 24, 'rgba(18,59,49,0.75)'); note(c, 'की रेखा टटोलती है', 580, 452, 24, 'rgba(18,59,49,0.75)');
  stamp(c, ['पढ़ना मुश्किल'], 720, 600, pr(t, ws(19) - 0.05, ws(19) + 0.35, eout), -0.05);
  foot(c, 'स्रोत: AFB · RNIB');
}
function drawP3(c, t) {
  head(c, 'बार्बिए की लिपि से ब्रेल का खाना', '12 जगहों से 6 जगहें');
  const S = 74, R = 22, gx = 230, gy0 = 250;
  const fill = (i) => pr(t, ws(25) - 0.1 + i * 0.07, ws(25) + 0.12 + i * 0.07, eout); // 12 positions light up on "बारह"
  const half = pr(t, ws(29) - 0.15, ws(29) + 0.45);                                 // lower half drops away on "आधा"
  note(c, 'बार्बिए: 12 बिंदु', gx, 210, 28, C.ink, 'center');
  for (let row = 0; row < 6; row++) for (let col = 0; col < 2; col++) {
    const x = gx + (col - 0.5) * S, lower = row >= 3, y = gy0 + row * S + (lower ? half * 90 : 0), a = lower ? 1 - half : 1;
    emptyPos(c, x, y, R, null, a); c.save(); c.globalAlpha = a; raisedDot(c, x, y, R, fill(row * 2 + col)); c.restore();
  }
  // Braille's 6-position cell under a fingertip outline (sizes illustrative)
  const b = pr(t, ws(29) + 0.2, ws(30) + 0.5, eout);
  if (b > 0) {
    c.save(); c.globalAlpha = b;
    const cx = 640, cy = 400;
    c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.setLineDash([12, 9]); c.beginPath(); c.ellipse(cx, cy, 120, 160, 0, 0, 6.283); c.stroke(); c.setLineDash([]);
    cell(c, cx, cy, S, R, [1, 2, 3, 4, 5, 6], () => 1);
    note(c, 'ब्रेल: 6 बिंदु', cx, 210, 28, C.ink, 'center');
    note(c, 'एक पोर जितनी जगह', cx, 610, 28, C.goldDeep, 'center');
    c.strokeStyle = C.gold; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(330, 330); c.lineTo(470, 360); c.stroke();
    c.beginPath(); c.moveTo(470, 360); c.lineTo(450, 342); c.moveTo(470, 360); c.lineTo(446, 372); c.stroke();
    c.restore();
  }
  c.fillStyle = 'rgba(2,34,28,0.06)'; rr(c, 48, 720, 804, 120, 14); c.fill();
  note(c, 'ब्रेल, 1829: “हमारे दो चिह्न, बार्बिए के', 76, 770, 28, C.ink);
  note(c, 'एक चिह्न जितनी जगह लेते हैं।”', 76, 815, 28, C.ink);
  foot(c, 'चित्रण · स्रोत: AFB · RNIB · ब्रेल 1829');
}
function drawP4(c, t) {
  head(c, 'उभार कैसे बनता है', 'छह तय जगहें');
  // numbered cell: numbers appear on "जगह", dot 1 pressed on "अक्षर", dot 2 on "बदलता"
  const cx = 230, cy = 400, S = 120, R = 38;
  const numA = pr(t, ws(33) - 0.3, ws(33) + 0.3);
  const p1 = ws(34) - 0.05, p2 = ws(35) - 0.05;
  cell(c, cx, cy, S, R, [1, 2], (k) => pr(t, k === 1 ? p1 : p2, (k === 1 ? p1 : p2) + 0.25, eout), numA > 0.5, 1);
  note(c, 'बायाँ स्तंभ 1-2-3 · दायाँ 4-5-6', cx, 640, 24, 'rgba(18,59,49,0.8)', 'center');
  // slate & stylus cross-section (illustration of AFB's description)
  const X0 = 470, Y0 = 250;
  c.fillStyle = C.slate; rr(c, X0, Y0 + 110, 380, 70, 10); c.fill();
  c.fillStyle = '#1C2622'; c.beginPath(); c.arc(X0 + 190, Y0 + 110, 30, 0, Math.PI); c.fill(); // pit in the slate
  const press = Math.max(pr(t, p1 - 0.25, p1, eout) * (1 - pr(t, p1 + 0.1, p1 + 0.35)), pr(t, p2 - 0.25, p2, eout) * (1 - pr(t, p2 + 0.1, p2 + 0.35)));
  const dented = pr(t, p1 - 0.05, p1 + 0.05);
  c.strokeStyle = C.yarnDark; c.fillStyle = '#FBF4E2'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(X0 - 10, Y0 + 104); c.lineTo(X0 + 160, Y0 + 104); c.quadraticCurveTo(X0 + 190, Y0 + 104 + 52 * dented, X0 + 220, Y0 + 104); c.lineTo(X0 + 390, Y0 + 104);
  c.lineTo(X0 + 390, Y0 + 96); c.lineTo(X0 + 220, Y0 + 96); c.quadraticCurveTo(X0 + 190, Y0 + 96 + 52 * dented, X0 + 160, Y0 + 96); c.lineTo(X0 - 10, Y0 + 96); c.closePath(); c.fill(); c.stroke();
  const sy = Y0 + 96 + 26 * dented - 52 * (1 - press) - 4;
  c.save(); c.translate(X0 + 190, sy); c.fillStyle = '#C9C2B0'; c.strokeStyle = C.ink; c.lineWidth = 3;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(-10, -40); c.lineTo(10, -40); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = C.ink; rr(c, -16, -118, 32, 80, 12); c.fill(); c.restore();
  note(c, 'स्लेट पर स्टाइलस से, पीछे से दबाया', X0 + 190, Y0 + 230, 24, C.ink, 'center');
  // flipped: the same paper read from the front — the dent is now a bump
  const flip = pr(t, p1 + 0.15, p1 + 0.55, eout);
  c.save(); c.globalAlpha = flip; const FY = Y0 + 330;
  c.fillStyle = '#FBF4E2'; c.strokeStyle = C.yarnDark; c.lineWidth = 3;
  c.beginPath(); c.moveTo(X0 - 10, FY); c.lineTo(X0 + 160, FY); c.quadraticCurveTo(X0 + 190, FY - 52, X0 + 220, FY); c.lineTo(X0 + 390, FY); c.lineTo(X0 + 390, FY + 8); c.lineTo(X0 - 10, FY + 8); c.closePath(); c.fill(); c.stroke();
  raisedDot(c, X0 + 190, FY - 16, 13, 1);
  note(c, 'पलटकर: उभरा बिंदु, उँगली से पढ़ें', X0 + 190, FY + 60, 26, C.goldDeep, 'center'); c.restore();
  foot(c, 'चित्रण · स्रोत: AFB');
}
const STRIP = { x: 50, y: 118, w: 800 };
const SIGN = { 2: [320 / 1300, 268 / 340], 3: [420 / 1300, 262 / 340] }; // centres of signs 2 and 3 in the 1829 table crop
function drawP5(c, t) {
  head(c, 'ब्रेल की किताब, 1829 · दस मूल चिह्न', null);
  const r = print(c, IMG.signs1829, STRIP.x, STRIP.y, STRIP.w, -0.006, 'स्कैन: ब्रेल, 1829, पृ. 5', 'right'); // right-aligned: the loupe over signs 2-3 never hides the credit
  pages.p5strip = r;
  note(c, 'जगह बदली, अक्षर बदला', 450, 492, 40, C.ink, 'center');
  const bA = pr(t, ws(37) - 0.05, ws(38) + 0.25), cA = pr(t, ws(42) - 0.05, ws(43) + 0.25);
  const S = 92, R = 32;
  for (const [cx, dots, a, name, nums, sign, lab] of [[250, [1, 2], bA, 'बी (b)', 'बिंदु 1, 2', 'चिह्न 2', ws(41)], [650, [1, 4], cA, 'सी (c)', 'बिंदु 1, 4', 'चिह्न 3', ws(44)]]) {
    c.save(); c.globalAlpha = 0.35 + 0.65 * clamp(a * 3);
    cell(c, cx, 655, S, R, dots, (k) => pr(a, k === dots[0] ? 0 : 0.4, k === dots[0] ? 0.6 : 1, eout));
    c.restore();
    const la = pr(t, lab - 0.12, lab + 0.25, eout);
    c.save(); c.globalAlpha = la; c.textAlign = 'center';
    c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, cx - 120, 790, 240, 64, 14); c.fill();
    c.fillStyle = C.cream; c.font = `800 36px ${HX}`; c.fillText(name, cx, 834);
    c.font = `700 26px ${HB}`; c.fillStyle = C.ink; c.fillText(`${nums} · 1829 का ${sign}`, cx, 896); c.restore();
  }
  foot(c, 'स्रोत: ब्रेल, “Procédé…”, 1829');
}
function drawP6(c, t) {
  head(c, 'सीख', 'इस्तेमाल करने वाले के नाप से');
  print(c, IMG.portrait, 600, 180, 250, 0.03, 'चित्र: थिरिआ, 1887');
  const cx = 290, cy = 520, S = 62, R = 18;
  cell(c, cx, cy, S, R, [1, 2, 3, 4, 5, 6], () => 1);
  const down = pr(t, ws(46) - 0.2, ws(46) + 0.5, eout);
  if (down > 0) finger(c, cx, lerp(cy - 110, cy, down), -Math.PI / 2 - 0.12, 290, 190, 0.72 * clamp(down * 2.5)); // stays below the title
  const m = pr(t, ws(51) - 0.25, ws(51) + 0.3, eout);
  c.save(); c.globalAlpha = m; c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.lineCap = 'round';
  for (const [x0, y0, x1, y1] of [[cx - 100, cy + 150, cx + 100, cy + 150], [cx - 100, cy + 138, cx - 100, cy + 162], [cx + 100, cy + 138, cx + 100, cy + 162]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
  note(c, 'पोर का नाप = खाने का नाप', cx, cy + 200, 30, C.goldDeep, 'center');
  c.fillStyle = C.gold; c.beginPath(); c.arc(cx + 190, cy - 40, 40, 0, 6.283); c.fill();
  c.strokeStyle = C.deep; c.lineWidth = 8; c.beginPath(); c.moveTo(cx + 172, cy - 40); c.lineTo(cx + 186, cy - 24); c.lineTo(cx + 210, cy - 56); c.stroke(); c.restore();
  foot(c, 'चित्रण · स्रोत: RNIB');
}
function drawP7(c, t) {
  c.fillStyle = C.deep; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(22, 22, PW - 44, PH - 44);
  const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.4 + 0.6 * a; c.drawImage(icon, PW / 2 - 130, 130, 260, 260); c.restore();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.font = '800 44px Fraunces'; c.fillText('Aarambh', PW / 2, 450);
  c.font = `800 64px ${HS}`; c.fillText('आरंभ डाउनलोड करें', PW / 2, 560);
  c.font = `800 40px ${HX}`; c.fillStyle = C.gold; c.fillText('आजीविका के औज़ारों का साथ दें', PW / 2, 636);
  c.font = `700 28px ${HB}`; c.fillStyle = 'rgba(251,247,238,0.82)'; c.fillText('सत्यापित आजीविका औज़ारों के लिए योगदान दें', PW / 2, 744); c.fillText('और उनका असर देखें।', PW / 2, 786);
  c.font = `700 26px ${HB}`; c.fillStyle = 'rgba(251,247,238,0.62)'; c.fillText('Google Play पर उपलब्ध', PW / 2, 880);
}
const DRAW = { p1: drawP1, p2: drawP2, p3: drawP3, p4: drawP4, p5: drawP5, p6: drawP6, p7: drawP7 };
const pages = {};
function page(id, t) { const cv = pageCv[id], c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(paperBG, 0, 0); c.save(); DRAW[id](c, t); c.restore(); return cv; }

function pageShadow(c, x, y, w, h, a = 0.3) { c.save(); c.shadowColor = `rgba(2,44,36,${a})`; c.shadowBlur = 26; c.shadowOffsetY = 9; c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.restore(); }
function drawPage(c, id, t, dx = 0, dy = 0, rot = 0, sc = 1) {
  const cv = page(id, t);
  c.save(); c.translate(PX + PW / 2 + dx, PY + PH / 2 + dy); c.rotate(rot); c.scale(sc, sc); c.translate(-PX - PW / 2, -PY - PH / 2);
  pageShadow(c, PX, PY, PW, PH); c.drawImage(cv, PX, PY); c.restore();
}
function pageTurn(c, idOld, idNew, u, t) {
  drawPage(c, idNew, t);
  const old = page(idOld, t);
  const x0 = PX, x1 = PX + PW, f = lerp(x1, x0, eio(u));
  c.save(); c.beginPath(); c.rect(x0, PY - 40, f - x0, PH + 80); c.clip(); pageShadow(c, PX, PY, PW, PH, 0.2); c.drawImage(old, PX, PY); c.restore();
  const sg = c.createLinearGradient(f, 0, f + 60, 0); sg.addColorStop(0, 'rgba(2,34,28,0.35)'); sg.addColorStop(1, 'rgba(2,34,28,0)');
  c.fillStyle = sg; c.fillRect(f, PY, Math.min(60, x1 - f), PH);
  const fw = x1 - f, fade = 1 - pr(u, 0.82, 1);
  if (fw > 1 && fade > 0) {
    const lift = Math.sin(Math.PI * u) * 26;
    c.save(); c.globalAlpha = fade; c.translate(0, -lift * 0.3);
    c.beginPath(); c.moveTo(f, PY); c.lineTo(f - fw, PY - lift); c.lineTo(f - fw, PY + PH + lift); c.lineTo(f, PY + PH); c.closePath();
    c.save(); c.clip(); const bg = c.createLinearGradient(f - fw, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(0.75, '#F8F3E6'); bg.addColorStop(1, '#D9CFB6');
    c.fillStyle = bg; c.fillRect(f - fw - 2, PY - 60, fw + 4, PH + 120); c.restore();
    c.strokeStyle = 'rgba(5,71,58,0.35)'; c.lineWidth = 2; c.stroke(); c.restore();
  }
}
function slideSwap(c, a, b, u, t) { const e = eio(u); drawPage(c, a, t, -1050 * e, 20 * e, -0.05 * e); drawPage(c, b, t, 1050 * (1 - e), -20 * (1 - e), 0.04 * (1 - e)); }
function scene(c, t) {
  if (t < T.turn1[0]) return drawPage(c, 'p1', t);
  if (t < T.turn1[1]) return pageTurn(c, 'p1', 'p2', (t - T.turn1[0]) / (T.turn1[1] - T.turn1[0]), t);
  if (t < T.swap[0]) return drawPage(c, 'p2', t);
  if (t < T.swap[1]) return slideSwap(c, 'p2', 'p3', (t - T.swap[0]) / (T.swap[1] - T.swap[0]), t);
  if (t < T.turn2[0]) return drawPage(c, 'p3', t);
  if (t < T.turn2[1]) return pageTurn(c, 'p3', 'p4', (t - T.turn2[0]) / (T.turn2[1] - T.turn2[0]), t);
  if (t < T.cut) return drawPage(c, 'p4', t);
  if (t < T.swap2[0]) return drawPage(c, 'p5', t);
  if (t < T.swap2[1]) return slideSwap(c, 'p5', 'p6', (t - T.swap2[0]) / (T.swap2[1] - T.swap2[0]), t);
  if (t < T.cta[0]) return drawPage(c, 'p6', t);
  if (t < T.cta[1]) return slideSwap(c, 'p6', 'p7', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p7', t);
}
// magnifier — used once: lands on sign 2 (b) of Braille's own 1829 table, then moves to sign 3 (c)
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.cut || t >= T.swap2[0] || !pages.p5strip) return;
  const r = pages.p5strip, m = pr(t, T.loupeMove[0], T.loupeMove[1]);
  const fx = lerp(SIGN[2][0], SIGN[3][0], m), fy = lerp(SIGN[2][1], SIGN[3][1], m);
  const lx = PX + r.x + r.w * fx, ly = PY + r.y + r.h * fy;
  const R = 112 * (1.35 - 0.35 * land), mag = 2.6;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p5', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.turn2[0], [540, 954, 1.04]], [T.turn2[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.03]], [T.cut, [540, 950, 1.06]], [T.swap2[0], [540, 954, 1.02]], [T.swap2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const [cx, cy, z] = camera(t);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  ctx.drawImage(tableCache, -400, -400);
  ctx.translate(540, 1012); ctx.scale(0.94, 0.94); ctx.translate(-540, -1012);
  scene(ctx, t); loupe(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const flick = t < 0.4 ? (t < 0.08 ? 0.35 : t < 0.14 ? 1 : t < 0.2 ? 0.55 : pr(t, 0.2, 0.4)) : 1;
  const dark = 1 - flick;
  if (dark > 0.001) { ctx.fillStyle = `rgba(2,34,28,${clamp(dark * 0.8, 0, 0.8)})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.35 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate y 350–510, x within 90..990; text ink ~y 372–492
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = `800 52px ${HX}`;
    const bw = Math.min(900, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 350, bw, 160, 16); ctx.fillStyle = 'rgba(2,34,28,0.88)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 16, 506, bw - 32, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, 540, (cw.lines.length === 1 ? 450 : 418) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.8)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.2; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const t0 = ws(6) - 0.05, t1 = ws(8) + 0.35;
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, T.loupeMove[1]],
    pops: [...[0, 1, 2, 3, 4, 5].map((k) => t0 + k * (t1 - t0) / 6), ws(34) - 0.05, ws(35) - 0.05, ws(37) - 0.05, ws(38) + 0.05, ws(42) - 0.05, ws(43) + 0.05],
    grid: [...Array(12).keys()].map((i) => ws(25) - 0.1 + i * 0.07), trace: [ws(17) - 0.45, ws(19) + 0.2], halve: ws(29) - 0.15,
    nums: [0, 1, 2, 3, 4, 5].map((k) => ws(33) - 0.3 + k * 0.1), label: [ws(15) - 0.15, ws(41) - 0.12, ws(44) - 0.12],
    stamp: [ws(10) - 0.1, ws(19) - 0.05], press: [ws(34) - 0.3, ws(35) - 0.3], finger: ws(46) - 0.2, ok: ws(51) - 0.25, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.5,3.6,4.6,7.6,8.9,11.5,13.6,14.3,15.6,16.6,17.6,19.7,22.0,23.9,26.5').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
