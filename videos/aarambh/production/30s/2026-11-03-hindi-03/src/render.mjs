// Aarambh Hindi-03 30 s #01 — Archive Light Table (Hindi): Katherine Johnson hand-checks John Glenn's orbital numbers (1962).
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted recipe); Devanagari captions.
// Archival objects: real NASA photographs (NASA Image and Video Library; NASA media generally not copyrighted, credited NASA/photographer).
// Printout, console and ledger are original illustrations labelled as such.
// Original Canvas2D code; art direction (read-only) from the public Archive Light Table STYLE.md.
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
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', burr: '#7A5A2A', burrDark: '#4E3815', yarn: '#E9DFC6', yarnDark: '#B9A887', tape: '#0A5A49', tapeLight: '#2C7A63' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
const obk = (t) => { const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
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
  [0, 8, ['1962 में, जॉन ग्लेन की', 'उड़ान के अंक']],
  [9, 12, ['आईबीएम कंप्यूटरों ने', 'निकाले।']],
  [13, 22, ['पर उस दौर के कंप्यूटर', 'कभी-कभी अटक जाते थे।']],
  [23, 32, ['ग्लेन के कहने पर, नासा की', 'गणितज्ञ कैथरीन जॉनसन ने']],
  [33, 37, ['वही समीकरण', 'हाथ से हल किए।']],
  [38, 43, ['जाँच के बाद', 'उड़ान सफल रही।']],
  [44, 51, ['सीख: ज़रूरी गणना की', 'अलग से जाँच कराइए।']],
  [52, 60, ['आरंभ डाउनलोड करें,', 'आजीविका के औज़ारों का साथ दें।']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 13: SENT[1].start, 23: SENT[2].start, 38: SENT[3].start, 44: SENT[4].start, 52: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : ws(a));
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[0].start + 5.72, SENT[1].start], swap: [SENT[1].start + 3.95, SENT[2].start], cut: ws(33) - 0.08,
  loupe: [ws(35) - 0.35, ws(37) + 0.45],
  turn2: [SENT[2].start + 6.5, SENT[3].start], swap2: [SENT[3].start + 2.5, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['launch', 'nasa-KSC-62PC-0011-friendship-7-launch.jpg'], ['desk66', 'nasa-LRC-1966-B701_P-06717-katherine-johnson-at-desk.jpg'], ['work62', 'nasa-LRC-1962-B701_P-09381-katherine-johnson-at-work.jpg'], ['portrait71', 'nasa-LRC-1971-B701_P-03033-katherine-johnson-portrait.jpg'], ['decal', 'nasa-S64-14854-glenn-friendship-7-decal.jpg']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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
function label(c, text, x, y, ax, ay, a = 1, col = C.ink) {
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
// drawing primitives for the mechanism
function burr(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = C.burrDark; c.beginPath(); c.arc(0, 0, r * 0.62, 0, 6.283); c.fill();
  c.strokeStyle = C.burr; c.lineWidth = Math.max(2, r * 0.07); c.lineCap = 'round';
  for (let k = 0; k < 26; k++) { const a = k * 2.399 + 0.3, l = r * (0.95 + 0.1 * Math.sin(k * 7)); const ex = Math.cos(a) * l, ey = Math.sin(a) * l;
    c.beginPath(); c.moveTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4); c.lineTo(ex, ey);
    c.quadraticCurveTo(ex + Math.cos(a + 1.6) * r * 0.16, ey + Math.sin(a + 1.6) * r * 0.16, ex + Math.cos(a + 2.6) * r * 0.12, ey + Math.sin(a + 2.6) * r * 0.12); c.stroke(); }
  c.fillStyle = 'rgba(255,240,200,0.18)'; c.beginPath(); c.arc(-r * 0.2, -r * 0.22, r * 0.25, 0, 6.283); c.fill();
  c.restore();
}
function hookShape(c, x, y, len, curl, dir = 1, col = C.tapeLight, w = 7) { // stem from (x,y) along +y*dir, J-hook at the tip; curl 0..1
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  const tipY = y + len * dir; c.beginPath(); c.moveTo(x, y); c.lineTo(x, tipY);
  const r = len * 0.22, a0 = dir > 0 ? 0 : Math.PI, sweep = Math.PI * (0.25 + 0.95 * curl);
  c.arc(x + r, tipY, r, a0 + (dir > 0 ? Math.PI : 0), a0 + (dir > 0 ? Math.PI : 0) - sweep * dir, dir > 0); c.stroke(); c.restore();
}
function loopShape(c, x, y, h, wdt, dir = -1, col = C.yarn, edge = C.yarnDark, lw = 7, stretch = 0) {
  c.save(); c.lineCap = 'round'; const top = y + h * dir * (1 + stretch);
  for (const [cl, ww] of [[edge, lw + 4], [col, lw]]) { c.strokeStyle = cl; c.lineWidth = ww; c.beginPath(); c.moveTo(x - wdt / 2, y); c.bezierCurveTo(x - wdt * 0.8, top, x + wdt * 0.8, top, x + wdt / 2, y); c.stroke(); }
  c.restore();
}

const VO = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const RED = '#B5532F';
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
const NUMS = [['3.8742', '3.8742'], ['1.2093', '1.2093'], ['7.4415', '7.4415'], ['0.6628', '0.6628'], ['5.1170', '5.1170']];
function drawP1(c, t) {
  head(c, 'फ़्रेंडशिप 7 · 20 फ़रवरी 1962', null);
  print(c, IMG.launch, 60, 110, 420, -0.02, 'फ़ोटो: NASA');
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = `800 52px ${HS}`; c.fillText('जॉन ग्लेन', 520, 190);
  c.font = `700 30px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.85)'; c.fillText('कक्षीय उड़ान', 520, 240);
  // computer printout strip (illustration): orbital numbers scroll out
  const a = pr(t, ws(9) - 0.3, ws(9) + 0.3, eout), off = Math.max(0, t - ws(9)) * 60;
  c.save(); c.globalAlpha = 0.25 + 0.75 * a;
  c.fillStyle = '#F4EEDC'; c.strokeStyle = C.yarnDark; c.lineWidth = 3; rr(c, 520, 300, 330, 520, 10); c.fill(); c.stroke();
  c.beginPath(); rr(c, 520, 300, 330, 520, 10); c.clip();
  c.font = '700 30px Mono'; c.fillStyle = C.ink; c.textAlign = 'left';
  for (let i = -1; i < 14; i++) { const y = 340 + i * 40 - (off % 40); const r = NUMS[((i + Math.floor(off / 40)) % 5 + 5) % 5][0]; c.fillText(`${(i + Math.floor(off / 40) + 1).toString().padStart(2, '0')}  ${r}`, 545, y); }
  c.restore();
  label(c, 'आईबीएम कंप्यूटर की गणना', 690, 860, 690, 820, a);
  foot(c, 'चित्रण: प्रिंटआउट · स्रोत: NASA');
}
function drawP2(c, t) {
  head(c, 'समस्या', 'मशीनें कभी-कभी अटक जाती थीं');
  // illustrated early mainframe console with tape reels; output stalls
  c.fillStyle = '#3E4A45'; rr(c, 90, 220, 720, 430, 18); c.fill();
  const spin = t < ws(20) ? t * 3 : ws(20) * 3; // reels stop when "अटक" is said
  for (const [x, y] of [[230, 360], [450, 360], [670, 360]]) {
    c.fillStyle = '#D9D0B5'; c.beginPath(); c.arc(x, y, 80, 0, 6.283); c.fill(); c.fillStyle = '#3E4A45'; c.beginPath(); c.arc(x, y, 22, 0, 6.283); c.fill();
    c.strokeStyle = '#3E4A45'; c.lineWidth = 8; for (let k = 0; k < 3; k++) { const an = spin + k * 2.094; c.beginPath(); c.moveTo(x + Math.cos(an) * 30, y + Math.sin(an) * 30); c.lineTo(x + Math.cos(an) * 70, y + Math.sin(an) * 70); c.stroke(); }
  }
  for (let k = 0; k < 12; k++) { const on = t < ws(20) ? (Math.floor(t * 8 + k * 3) % 4 === 0) : (k % 5 === 0); c.fillStyle = on ? C.gold : '#5F6B66'; c.beginPath(); c.arc(140 + k * 56, 560, 12, 0, 6.283); c.fill(); }
  const st = pr(t, ws(20), ws(20) + 0.4, eout);
  stamp(c, ['रुकावट!'], 450, 760, st, -0.05);
  foot(c, 'चित्रण · NASA जीवनी: मशीनें "hiccups and blackouts" वाली थीं');
}
function drawP3(c, t) {
  head(c, 'ग्लेन का अनुरोध', null);
  print(c, IMG.desk66, 70, 110, 470, 0.015, 'फ़ोटो: NASA/बॉब नाय, 1966');
  const a = pr(t, ws(29) - 0.1, ws(29) + 0.45, eout);
  c.save(); c.globalAlpha = a; c.translate((1 - a) * 30, 0);
  c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 560, 230, 300, 300, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
  c.fillStyle = C.cream; c.textAlign = 'left'; c.font = `800 44px ${HS}`; c.fillText('कैथरीन', 584, 300); c.fillText('जॉनसन', 584, 356);
  c.fillStyle = C.gold; c.font = `800 32px ${HX}`; c.fillText('नासा की गणितज्ञ', 584, 420);
  c.fillStyle = 'rgba(251,247,238,0.8)'; c.font = `700 24px ${HB}`; c.fillText('लैंगली, 1953 से', 584, 470);
  c.restore();
  foot(c, 'स्रोत: NASA जीवनी (2016)');
}
const PHOTO62 = { x: 40, y: 100, w: 500 };
function drawP4(c, t) {
  head(c, 'वही समीकरण, हाथ से', null);
  const r = print(c, IMG.work62, PHOTO62.x, PHOTO62.y, PHOTO62.w, -0.01, 'फ़ोटो: NASA/बॉब नाय, दिसंबर 1962', 'right'); // right-aligned so the label leader never crosses the credit
  pages.p4photo = r;
  // ledger: computer vs hand — rows tick as they match
  const L0 = 552, top = 120;
  c.fillStyle = '#F6F0DE'; c.strokeStyle = C.yarnDark; c.lineWidth = 3; rr(c, L0, top, 318, 470, 12); c.fill(); c.stroke();
  c.font = `800 26px ${HX}`; c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText('कंप्यूटर', L0 + 80, top + 44); c.fillText('हाथ से', L0 + 200, top + 44);
  const k = pr(t, T.cut + 0.2, T.turn2[0] - 0.2, (u) => u);
  NUMS.forEach(([a, b], i) => {
    const y = top + 100 + i * 72, on = k * 5 - i;
    c.font = '700 28px Mono'; c.fillStyle = C.ink; c.fillText(a, L0 + 80, y);
    c.globalAlpha = clamp(on * 2); c.fillText(b, L0 + 200, y); c.globalAlpha = 1;
    if (on >= 1) { c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(L0 + 270, y - 8); c.lineTo(L0 + 280, y + 2); c.lineTo(L0 + 298, y - 20); c.stroke(); }
  });
  c.font = `700 20px ${HB}`; c.fillStyle = 'rgba(18,59,49,0.7)'; c.textAlign = 'left'; c.fillText('चित्रण: अंक प्रतीकात्मक हैं', L0, top + 500);
  label(c, 'मेज़ की गणना-मशीन', 300, 820, PHOTO62.x + PHOTO62.w * 0.12, PHOTO62.y + PHOTO62.w * 0.49, pr(t, ws(35) - 0.2, ws(35) + 0.3, eout));
  foot(c, 'स्रोत: NASA जीवनी (2016)');
}
function drawP5(c, t) {
  head(c, 'नतीजा', null);
  print(c, IMG.decal, 60, 120, 780, -0.015, 'फ़ोटो: NASA · ग्लेन और "फ़्रेंडशिप 7", फ़रवरी 1962');
  stamp(c, ['सफल उड़ान', '20 फ़रवरी 1962'], 620, 760, pr(t, ws(42), ws(42) + 0.4, eout), -0.06);
  foot(c, 'स्रोत: NASA');
}
function drawP6(c, t) {
  head(c, 'सीख', 'ज़रूरी गणना की अलग से जाँच');
  print(c, IMG.portrait71, 560, 160, 290, 0.03, 'फ़ोटो: NASA/बॉब नाय, 1971');
  const a = pr(t, ws(47), ws(51) + 0.3);
  // two independent paths converge on one checked answer
  const box = (x, y, txt, on) => { c.fillStyle = on ? 'rgba(2,34,28,0.92)' : 'rgba(18,59,49,0.15)'; rr(c, x, y, 250, 80, 14); c.fill(); c.fillStyle = on ? C.cream : C.ink; c.font = `800 30px ${HX}`; c.textAlign = 'center'; c.fillText(txt, x + 125, y + 52); };
  box(60, 560, 'कंप्यूटर', a > 0.05); box(60, 740, 'हाथ से', a > 0.2); // diagram sits below the 1971 print's credit
  c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round';
  const p = clamp(a * 1.4);
  c.beginPath(); c.moveTo(310, 600); c.lineTo(lerp(310, 520, p), lerp(600, 680, p)); c.stroke();
  c.beginPath(); c.moveTo(310, 780); c.lineTo(lerp(310, 520, p), lerp(780, 700, p)); c.stroke();
  const ok = pr(t, ws(51) - 0.2, ws(51) + 0.3, eout);
  c.save(); c.globalAlpha = ok; c.fillStyle = C.gold; c.beginPath(); c.arc(570, 690, 52, 0, 6.283); c.fill();
  c.strokeStyle = C.deep; c.lineWidth = 9; c.beginPath(); c.moveTo(546, 690); c.lineTo(564, 710); c.lineTo(596, 670); c.stroke();
  c.fillStyle = C.ink; c.font = `800 32px ${HX}`; c.textAlign = 'left'; c.fillText('मेल खाया, तभी भरोसा', 470, 810); c.restore();
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
// magnifier — used once: lands on the real mechanical calculator in NASA photo LRC-1962-B701_P-09381
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.cut || t >= T.turn2[0] || !pages.p4photo) return;
  const r = pages.p4photo; const lx = PX + r.x + r.w * 0.13, ly = PY + r.y + r.h * 0.6;
  const R = 120 * (1.35 - 0.35 * land), mag = 2.2;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p4', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.05]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.swap2[0], [540, 954, 1.04]], [T.swap2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
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
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35],
    printout: ws(9), stall: ws(20), plate: ws(29), ticks: [0, 1, 2, 3, 4].map((i) => lerp(T.cut + 0.2, T.turn2[0] - 0.2, (i + 1) / 5)), stamp: [ws(20), ws(42)],
    paths: [ws(47), ws(51)], ok: ws(51), cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.5,4.5,6.2,8.5,10.0,10.5,12.5,14.0,15.2,16.4,17.3,18.6,20.1,21.6,23.2,25.2,27.5').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
