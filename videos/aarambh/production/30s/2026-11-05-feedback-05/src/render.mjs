// Aarambh feedback-05 30 s #01 — Archive Light Table (Hindi): Hedy Lamarr & George Antheil, frequency hopping (US 2,292,387).
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted recipe); Devanagari captions.
// Archival objects: Screenland cover, October 1942 (Library of Congress copy on the Internet Archive, "not in copyright"); George Antheil
// by Berenice Abbott, 1927 (public domain, Wikimedia Commons); U.S. Patent 2,292,387 drawing sheet 2 (header, Fig. 4, signatures).
// Channels, ships, torpedo, jammer and rolls are original illustrations labelled "चित्रण" (drawing code from this app's round-02 renderer).
// Original Canvas2D code (renderer from hindi-04); art direction (read-only) from the public Archive Light Table STYLE.md.
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
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', yarnDark: '#B9A887', tape: '#0A5A49' };
const RED = '#B5532F';
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
  [0, 10, ['एक अभिनेत्री और एक संगीतकार ने', 'रेडियो का पेटेंट लिया।']],
  [11, 19, ['एक फ़्रीक्वेंसी वाला रेडियो', 'टॉरपीडो जाम हो सकता था।']],
  [20, 28, ['उपाय: भेजने और पाने वाला', 'साथ-साथ फ़्रीक्वेंसी बदलें।']],
  [29, 36, ['पियानो-रोल जैसी दो समान', 'पट्टियाँ ताल मिलाती थीं।']],
  [37, 42, ['नौसेना ने तब', 'इसे नहीं अपनाया।']],
  [43, 52, ['सीख: हेडी और जॉर्ज की तरह', 'अलग-अलग हुनर मिलाइए।']],
  [53, 60, ['आरंभ डाउनलोड करें,', 'आजीविका के औज़ारों का साथ दें।']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 20: SENT[2].start, 29: SENT[3].start, 37: SENT[4].start, 43: SENT[5].start, 53: SENT[6].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : ws(a));
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  cut: ws(29) - 0.06, // hard cut on "पियानो"
  loupe: [ws(30) - 0.2, ws(33) + 0.35],
  turn2: [SENT[4].start - 0.35, SENT[4].start], swap2: [SENT[5].start - 0.35, SENT[5].start], cta: [SENT[6].start - 0.5, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['lamarr', 'hedy-lamarr-screenland-oct-1942-cover.jpg'], ['antheil', 'george-antheil-berenice-abbott-1927.jpg'], ['sheet', 'us2292387-sheet2-figs7-4.png'], ['sig', 'us2292387-sheet2-signatures.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
const CROP = { head: [70, 55, 1050, 150], fig4: [60, 735, 1090, 225] }; // source rects in the patent sheet image
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
function stamp(c, lines, x, y, a, rot = -0.08, col = C.goldDeep) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  c.font = `800 34px ${HX}`; const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 40, h = 26 + lines.length * 46;
  c.strokeStyle = col; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  c.fillStyle = col; c.textAlign = 'center'; lines.forEach((l, i) => { c.font = i === 0 ? `800 34px ${HX}` : `700 28px ${HB}`; c.fillText(l, 0, -h / 2 + 52 + i * 44); });
  c.restore();
}
function note(c, text, x, y, size = 22, col = 'rgba(18,59,49,0.72)', align = 'left', weight = 700) { c.textAlign = align; c.font = `${weight} ${size}px ${weight > 700 ? HX : HB}`; c.fillStyle = col; c.fillText(text, x, y); }
// archival print: white border + soft shadow; returns drawn rect. src = optional source rect [sx, sy, sw, sh]
function print(c, img, x, y, w, rot = 0, credit = null, align = 'left', src = null) {
  const h = src ? w * src[3] / src[2] : w * img.height / img.width;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24 + (credit ? 30 : 0)); c.shadowColor = 'rgba(0,0,0,0)';
  if (src) c.drawImage(img, src[0], src[1], src[2], src[3], -w / 2, -h / 2, w, h); else c.drawImage(img, -w / 2, -h / 2, w, h);
  if (credit) { c.font = `700 19px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.8)'; c.textAlign = align; c.fillText(credit, align === 'right' ? w / 2 : -w / 2, h / 2 + 30); }
  c.restore(); return { x, y, w, h };
}

// ---------- mechanism primitives (illustration; from this app's round-02 renderer) ----------
function wavePath(c, x0, y, x1, amp, freq, phase) { c.beginPath(); for (let x = x0; x <= x1; x += 4) { const yy = y + Math.sin((x - x0) * freq + phase) * amp; x === x0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
function torpedo(c, x, y, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#3E4A45'; rr(c, -60, -11, 120, 22, 11); c.fill(); c.fillStyle = '#2A332F'; c.beginPath(); c.moveTo(-60, 0); c.lineTo(-76, -12); c.lineTo(-76, 12); c.closePath(); c.fill(); c.fillStyle = C.gold; c.fillRect(30, -3, 12, 6); c.restore(); }
function ship(c, x, y, s = 1, col = C.ink) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-80, 0); c.lineTo(80, 0); c.lineTo(60, 26); c.lineTo(-64, 26); c.closePath(); c.fill(); c.fillRect(-30, -26, 50, 26); c.fillRect(-4, -62, 6, 36); c.restore(); }
const SEQ = [3, 6, 1, 5, 2, 7, 0, 4, 6, 2, 5, 1, 3, 7, 4, 0];
const seqAt = (i) => SEQ[((i % SEQ.length) + SEQ.length) % SEQ.length];
function roll(c, x, y, w, h, offset, rows, hiCol) { // a scrolling perforated roll; holes chosen per step from a fixed sequence
  c.save(); c.fillStyle = '#F1E8D2'; c.strokeStyle = C.yarnDark; c.lineWidth = 3; rr(c, x, y, w, h, 8); c.fill(); c.stroke();
  c.beginPath(); rr(c, x, y, w, h, 8); c.clip();
  const step = 56, rowH = h / (rows + 1);
  for (let k = -2; k < w / step + 3; k++) {
    const gi = Math.floor(offset / step) + k, xx = x + k * step - (offset % step);
    c.fillStyle = Math.abs(xx + step / 2 - hiCol) < step / 2 ? C.goldDeep : C.ink;
    rr(c, xx + 14, y + rowH * (seqAt(gi) + 1) - 7, 28, 14, 6); c.fill();
  }
  c.restore();
}
function ladder(c, y0, dy, n = 8, x0 = 60, x1 = PW - 60) { for (let k = 0; k < n; k++) { c.strokeStyle = 'rgba(18,59,49,0.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0 + k * dy); c.lineTo(x1, y0 + k * dy); c.stroke(); } }
function jamZig(c, x0, x1, y, amp, t, a = 1) { c.save(); c.globalAlpha = a; c.strokeStyle = RED; c.lineWidth = 6; c.beginPath(); for (let x = x0; x <= x1; x += 18) c.lineTo(x, y + ((x / 18) % 2 ? -amp : amp) * (0.6 + 0.4 * Math.sin(t * 40 + x))); c.stroke(); c.restore(); }

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'अमेरिकी पेटेंट 2,292,387 · 1942', null);
  const inA = pr(t, 0.15, 0.7, eout), inB = pr(t, 0.3, 0.85, eout);
  c.save(); c.globalAlpha = inA; c.translate(0, (1 - inA) * 24); print(c, IMG.lamarr, 50, 100, 340, -0.02, 'फ़ोटो: Screenland, अक्टूबर 1942'); c.restore();
  c.save(); c.globalAlpha = inB; c.translate(0, (1 - inB) * 24); print(c, IMG.antheil, 510, 130, 330, 0.02, 'फ़ोटो: बेरेनिस ऐबट, 1927'); c.restore();
  const plate = (x, w, a, name, role) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 20);
    c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, x, 660, w, 118, 14); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = `800 40px ${HS}`; c.fillText(name, x + 22, 712);
    c.fillStyle = C.gold; c.font = `800 28px ${HX}`; c.fillText(role, x + 22, 756); c.restore(); };
  plate(50, 350, pr(t, ws(1) - 0.15, ws(1) + 0.3, eout), 'हेडी लमार', 'अभिनेत्री · 1914–2000');
  plate(500, 350, pr(t, ws(4) - 0.15, ws(4) + 0.3, eout), 'जॉर्ज ऐन्टाइल', 'संगीतकार · 1900–1959');
  const plus = pr(t, ws(2) - 0.1, ws(2) + 0.3, eout);
  if (plus > 0) { c.save(); c.globalAlpha = plus; c.fillStyle = C.gold; c.beginPath(); c.arc(450, 719, 30 * plus, 0, 6.283); c.fill(); c.fillStyle = C.deep; c.font = `800 44px InterX`; c.textAlign = 'center'; c.fillText('+', 450, 734); c.restore(); }
  stamp(c, ['पेटेंट 2,292,387', '11 अगस्त 1942'], 450, 872, pr(t, ws(9) - 0.1, ws(9) + 0.35, eout), -0.04);
  foot(c, 'स्रोत: NIHF · पेटेंट US 2,292,387');
}
function drawP2(c, t) {
  head(c, 'समस्या', 'एक चैनल, एक कमज़ोरी');
  const chY = (k) => 260 + k * 46, sig = 3, blk = ws(16) - 0.1;
  ladder(c, 260, 46);
  note(c, 'रेडियो चैनल (चित्रण)', 62, 240, 24, 'rgba(18,59,49,0.75)');
  const on = pr(t, ws(12) - 0.2, ws(12) + 0.3), jam = pr(t, blk, blk + 0.35, eout);
  c.save(); c.strokeStyle = C.tape; c.lineWidth = 6; c.globalAlpha = on * (1 - 0.75 * jam); wavePath(c, 150, chY(sig), PW - 150, 9, 0.09, -t * 9); c.restore();
  ship(c, 130, 700, 0.9);
  c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 3; c.setLineDash([8, 10]); c.beginPath(); c.moveTo(130, chY(sig) + 18); c.lineTo(130, 640); c.stroke(); c.setLineDash([]);
  const tx = lerp(330, 600, pr(t, ws(14) - 0.2, blk + 0.6, (u) => u));
  torpedo(c, tx, 780 + jam * 40, jam * 0.6);
  note(c, 'भेजने वाला', 130, 770, 28, C.ink, 'center', 800); note(c, 'टॉरपीडो', tx, 840 + jam * 40, 28, C.ink, 'center', 800);
  if (jam > 0) { c.save(); c.globalAlpha = jam; ship(c, 760, 700, 0.75, '#5B3B2E'); c.restore(); jamZig(c, 150, PW - 150, chY(sig), 18, t, jam); note(c, 'जैमर', 760, 770, 28, RED, 'center', 800); }
  stamp(c, ['जाम!'], 640, 190, jam, 0.05, RED);
  foot(c, 'चित्रण · स्रोत: NIHF · पेटेंट US 2,292,387');
}
function drawP3(c, t) {
  head(c, 'उपाय', 'दोनों साथ-साथ चैनल बदलें');
  const y0 = 300, dy = 50, jk = 3, hop0 = ws(25) - 0.1, stepT = 0.38;
  ladder(c, y0, dy, 8, 220, PW - 220);
  for (let k = 0; k < 8; k++) note(c, String(k + 1), 200, y0 + k * dy + 8, 22, 'rgba(18,59,49,0.6)', 'right');
  const sA = pr(t, ws(21) - 0.15, ws(21) + 0.3, eout), rA = pr(t, ws(23) - 0.15, ws(23) + 0.3, eout);
  const hopping = t >= hop0, idx = hopping ? Math.floor((t - hop0) / stepT) : 0, ch = hopping ? seqAt(idx) : jk;
  // sender (left) and receiver (right) — both light the SAME channel
  const node = (x, a, name) => { c.save(); c.globalAlpha = 0.25 + 0.75 * a; c.fillStyle = C.ink; rr(c, x - 70, y0 - 40, 140, 8 * dy + 30, 16); c.fill();
    for (let k = 0; k < 8; k++) { c.fillStyle = k === ch && a > 0.5 ? C.gold : 'rgba(251,247,238,0.18)'; c.beginPath(); c.arc(x, y0 + k * dy, 13, 0, 6.283); c.fill(); }
    c.restore(); note(c, name, x, y0 + 8 * dy + 30, 26, C.ink, 'center', 800); };
  node(120, sA, 'भेजने वाला'); node(PW - 120, rA, 'पाने वाला');
  if (sA > 0.5 && rA > 0.5) { // the signal crosses on the current channel
    const ph = hopping ? ((t - hop0) % stepT) / stepT : (t * 1.5) % 1;
    c.save(); c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(190, y0 + ch * dy); c.lineTo(lerp(190, PW - 190, clamp(ph * 1.6)), y0 + ch * dy); c.stroke(); c.restore();
  }
  // jammer stuck on one channel
  const jA = pr(t, SENT[2].start + 0.1, SENT[2].start + 0.5);
  jamZig(c, 240, PW - 240, y0 + jk * dy, 12, t, 0.75 * jA); note(c, 'जैमर: सिर्फ़ एक चैनल', 450, y0 + jk * dy - 20, 22, RED, 'center', 800);
  stamp(c, ['संदेश साफ़'], 450, 830, pr(t, ws(28) - 0.1, ws(28) + 0.35, eout), -0.04);
  foot(c, 'चित्रण · स्रोत: NIHF');
}
const FIG4 = { x: 40, y: 104, w: 820 };
function drawP4(c, t) {
  head(c, 'पेटेंट की तरकीब: Fig. 4', null);
  const r = print(c, IMG.sheet, FIG4.x, FIG4.y, FIG4.w, -0.006, 'पेटेंट शीट 2, Fig. 4', 'right', CROP.fig4); // short, right-aligned: clear of the loupe path
  pages.p4fig = r;
  const off = Math.max(0, t - T.cut) * 120, hiX = 450, rows = 7;
  roll(c, 60, 390, PW - 120, 120, off, rows, hiX);
  roll(c, 60, 640, PW - 120, 120, off, rows, hiX);
  note(c, 'भेजने वाले की पट्टी', 64, 378, 24, C.ink, 'left', 800); note(c, 'पाने वाले की पट्टी', 64, 790, 24, C.ink, 'left', 800);
  c.strokeStyle = C.gold; c.lineWidth = 4; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(hiX, 380); c.lineTo(hiX, 770); c.stroke(); c.setLineDash([]);
  const ch = seqAt(Math.floor((off + hiX - 60) / 56));
  for (let k = 0; k < 8; k++) { const on = k === ch; c.fillStyle = on ? C.gold : 'rgba(18,59,49,0.12)'; rr(c, 130 + k * 82, 548, 66, 42, 10); c.fill(); c.fillStyle = on ? C.deep : 'rgba(18,59,49,0.55)'; c.font = '800 22px Mono'; c.textAlign = 'center'; c.fillText(String(k + 1), 163 + k * 82, 577); }
  label(c, 'एक जैसे छेद = एक ही चैनल', 450, 860, hiX, 770, pr(t, ws(34) - 0.15, ws(34) + 0.3, eout));
  note(c, 'पेटेंट: 88 फ़्रीक्वेंसी तक', PW - 48, 72, 24, C.goldDeep, 'right', 800);
  foot(c, 'चित्रण (नीचे) · स्रोत: पेटेंट; NIHF');
}
function drawP5(c, t) {
  head(c, 'नतीजा', null);
  print(c, IMG.sheet, 40, 110, 820, -0.008, 'पेटेंट शीट 2 का शीर्षक', 'right', CROP.head);
  note(c, 'आवेदन: 10 जून 1941 · पेटेंट: 11 अगस्त 1942', 450, 330, 28, C.ink, 'center', 800);
  c.save(); c.fillStyle = '#FFFFFF'; c.shadowColor = 'rgba(2,44,36,0.2)'; c.shadowBlur = 12; c.fillRect(120, 380, 660, 200); c.restore();
  c.drawImage(IMG.sig, 0, 30, 760, 185, 140, 395, 620, 151); // crop off the stray sheet text above the signatures
  note(c, 'दोनों आविष्कारकों के हस्ताक्षर (पेटेंट ड्रॉइंग)', 450, 612, 22, 'rgba(18,59,49,0.75)', 'center');
  stamp(c, ['नौसेना ने', 'तब नहीं अपनाया'], 450, 770, pr(t, ws(41) - 0.1, ws(41) + 0.35, eout), -0.05);
  foot(c, 'स्रोत: पेटेंट US 2,292,387 · NIHF');
}
function drawP6(c, t) {
  head(c, 'सीख', 'अलग हुनर, एक नया हल');
  print(c, IMG.lamarr, 50, 160, 220, -0.03, 'Screenland, 1942');
  print(c, IMG.antheil, 630, 170, 220, 0.03, 'ऐबट, 1927');
  const a = pr(t, ws(44) - 0.15, ws(44) + 0.35, eout), b = pr(t, ws(46) - 0.15, ws(46) + 0.35, eout), j = pr(t, ws(51) - 0.2, ws(51) + 0.4);
  const card = (x, y, w, a, l1, l2) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, x, y, w, 110, 14); c.fill();
    c.fillStyle = C.gold; c.font = `800 30px ${HX}`; c.textAlign = 'center'; c.fillText(l1, x + w / 2, y + 44); c.fillStyle = C.cream; c.font = `700 26px ${HB}`; c.fillText(l2, x + w / 2, y + 86); c.restore(); };
  card(lerp(40, 70, j), lerp(560, 540, j), 360, a, 'हेडी', 'टॉरपीडो-नियंत्रण की जानकारी'); // below both print credits
  card(lerp(500, 470, j), lerp(560, 540, j), 360, b, 'जॉर्ज', 'पियानो-रोल जैसा ताल-मेल');
  if (j > 0) {
    c.save(); c.globalAlpha = j; c.fillStyle = C.gold; c.beginPath(); c.arc(450, 595, 30, 0, 6.283); c.fill(); c.fillStyle = C.deep; c.font = '800 44px InterX'; c.textAlign = 'center'; c.fillText('+', 450, 610);
    c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.beginPath(); c.moveTo(450, 655); c.lineTo(450, 720); c.stroke();
    c.fillStyle = C.gold; rr(c, 200, 730, 500, 120, 16); c.fill(); c.fillStyle = C.deep; c.font = `800 38px ${HX}`; c.fillText('फ़्रीक्वेंसी हॉपिंग', 450, 785);
    c.strokeStyle = C.deep; c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); [[330, 830], [380, 810], [430, 835], [480, 805], [530, 832], [580, 812]].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
  }
  foot(c, 'स्रोत: NIHF (हेडी लमार; जॉर्ज ऐन्टाइल)');
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
  if (t < T.cut) return drawPage(c, 'p3', t);
  if (t < T.turn2[0]) return drawPage(c, 'p4', t);
  if (t < T.turn2[1]) return pageTurn(c, 'p4', 'p5', (t - T.turn2[0]) / (T.turn2[1] - T.turn2[0]), t);
  if (t < T.swap2[0]) return drawPage(c, 'p5', t);
  if (t < T.swap2[1]) return slideSwap(c, 'p5', 'p6', (t - T.swap2[0]) / (T.swap2[1] - T.swap2[0]), t);
  if (t < T.cta[0]) return drawPage(c, 'p6', t);
  if (t < T.cta[1]) return slideSwap(c, 'p6', 'p7', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p7', t);
}
// magnifier — used once: lands on the real perforations of patent Fig. 4 and tracks along the strip
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.cut || t >= T.turn2[0] || !pages.p4fig) return;
  const r = pages.p4fig, m = pr(t, T.loupe[0] + 0.3, T.loupe[1] - 0.3);
  const lx = PX + r.x + r.w * lerp(0.18, 0.5, m), ly = PY + r.y + r.h * 0.68; // along the perforation band
  const R = 90 * (1.35 - 0.35 * land), mag = 2.4;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p4', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.04]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.swap2[0], [540, 954, 1.04]], [T.swap2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
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
  const hop0 = ws(25) - 0.1, hops = []; for (let x = hop0; x < T.cut - 0.05; x += 0.38) hops.push(+x.toFixed(3));
  const rollTicks = []; for (let x = T.cut + 0.2; x < T.turn2[0] - 0.1; x += 56 / 120) rollTicks.push(+x.toFixed(3));
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35],
    plates: [ws(1) - 0.15, ws(4) - 0.15], plus: ws(2) - 0.1, signal: ws(12) - 0.2, jam: ws(16) - 0.1, nodes: [ws(21) - 0.15, ws(23) - 0.15],
    hops, rollTicks, label: [ws(34) - 0.15], stamp: [ws(9) - 0.1, ws(41) - 0.1], clear: ws(28) - 0.1,
    cards: [ws(44) - 0.15, ws(46) - 0.15], join: ws(51) - 0.2, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.5,1.5,3.9,6.0,8.0,10.4,12.2,13.2,14.6,15.6,16.6,19.8,22.4,24.4,27.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
