// Aarambh production 30 s #02 — Archive Light Table: "Ada Lovelace and the first published computer algorithm".
// Five full pages on the light table, changed by page turns, a slide swap and a hard cut (user feedback: no loupe bobbing on one page).
// Original Canvas2D code; art direction read-only from the public Archive Light Table STYLE.md.
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(`${FS}/fraunces/files/fraunces-latin-800-normal.woff2`, 'Fraunces');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-500-normal.woff2`, 'InterM');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-700-normal.woff2`, 'InterB');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-800-normal.woff2`, 'InterX');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf', 'Mono');

const W = 1080, H = 1920, FPS = 30, N = 900;
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6' };
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
function wrap(c, text, x, y, maxW, lh) { let line = ''; for (const w of text.split(' ')) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = w; } else line = t; } if (line) c.fillText(line, x, y); return y; }

// ---------- word timings (one ASR pass on placed narration) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [
  [0, 5, ['In 1843, Ada Lovelace', 'published notes']],
  [6, 10, ["on Babbage's proposed", 'Analytical Engine.']],
  [11, 16, ['Her Note G', 'laid out steps']],
  [17, 20, ['for calculating', 'Bernoulli numbers,']],
  [21, 27, ['often called the first', 'published computer algorithm.']],
  [28, 35, ['The engine was never', 'completed in her lifetime.']],
  [36, 43, ['She also imagined it handling', 'symbols beyond numbers,']],
  [44, 45, ['even music.']],
  [46, 52, ["Her story isn't only about", 'predicting computers.']],
  [53, 56, ["It's about seeing", 'possibilities']],
  [57, 63, ['in a machine that', "didn't yet exist."]],
];
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = Math.max(0, ws(a) - 0.08), next = i + 1 < CAPS.length ? ws(CAPS[i + 1][0]) - 0.08 : 30;
  return { t0: a === 0 ? 0.3 : t0, t1: Math.min(we(b) + 0.6, next - 0.06), lines };
});

// ---------- scene timing (derived from words) ----------
const T = {
  stamp1843: ws(1), name: ws(2),
  turn1: [ws(6) - 0.35, ws(6) + 0.35],          // page turn: portrait -> engine ("on Babbage's…")
  proposed: ws(8),
  swap: [ws(11) - 0.45, ws(11) + 0.1],          // slide swap: engine -> Note G ("Her Note G")
  loupeIn: ws(16) - 0.25, rowRead: [ws(17), we(20)], loupeOut: ws(21) - 0.1, quote: ws(21),
  cut: ws(28) - 0.06,                           // hard cut: Note G -> timeline ("The engine…")
  never: ws(31), lifetime: ws(34),
  turn2: [ws(36) - 0.45, ws(36) + 0.25],        // page turn: timeline -> music ("She also…")
  symbols: ws(41), music: ws(45),
  index: [ws(46) - 0.35, ws(46) + 1.1],         // pull back: pages become the index ("Her story…")
  thread: [ws(53), ws(56) + 0.5], exist: ws(59),
};

// ---------- assets ----------
const imgPortrait = await loadImage(path.join(ROOT, 'assets/ada-lovelace-chalon-c1840-PD.jpg'));
const imgEngine = await loadImage(path.join(ROOT, 'assets/analytical-engine-science-museum-wichary-CCBY2.jpg'));
const imgNoteG = await loadImage(path.join(ROOT, 'assets/note-g-bernoulli-diagram-1843-PD.jpg'));
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), diffuser = noiseTile(256, 3, 20), paperTex = noiseTile(256, 21, 14);

// ---------- cached table ----------
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

// ---------- cached pages (900 x 1000), static content ----------
const PW = 900, PH = 1000, PX = 90, PY = 512; // page rect on the table (world)
function newPage(kind = 'paper') {
  const cv = createCanvas(PW, PH), c = cv.getContext('2d');
  c.fillStyle = kind === 'slide' ? '#1B2A26' : C.paper; c.fillRect(0, 0, PW, PH);
  if (kind !== 'slide') {
    c.globalAlpha = 0.18; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, PW, PH);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    const g = c.createRadialGradient(PW / 2, PH / 2, PW * 0.3, PW / 2, PH / 2, PW * 0.78); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.16)');
    c.fillStyle = g; c.fillRect(0, 0, PW, PH);
    c.strokeStyle = 'rgba(5,71,58,0.3)'; c.lineWidth = 2; c.strokeRect(16, 16, PW - 32, PH - 32);
  }
  return [cv, c];
}
function footer(c, text, y = PH - 34, col = 'rgba(18,59,49,0.66)') { c.font = '700 15px Mono'; c.fillStyle = col; c.textAlign = 'left'; c.fillText(text, 40, y); }

const pages = {};
{ // 1. portrait / title
  const [cv, c] = newPage();
  const iw = 470, ih = iw * 1839 / 1280, ix = (PW - iw) / 2, iy = 46;
  c.fillStyle = '#fff'; c.fillRect(ix - 12, iy - 12, iw + 24, ih + 24); c.drawImage(imgPortrait, ix, iy, iw, ih);
  c.textAlign = 'center'; c.fillStyle = C.ink;
  c.font = '800 60px Fraunces'; c.fillText('Ada Lovelace', PW / 2, iy + ih + 82);
  c.font = '700 26px Mono'; c.fillText('1815–1852 · mathematician, writer', PW / 2, iy + ih + 124);
  footer(c, 'Portrait: A. E. Chalon, watercolour, c. 1840 · public domain (Wikimedia Commons)', PH - 54);
  footer(c, 'TYPESET LABELS · dates: Science Museum', PH - 32);
  pages.p1 = cv;
}
{ // 2. engine mechanism document
  const [cv, c] = newPage();
  const iw = 560, ih = iw * 1707 / 1280, ix = (PW - iw) / 2, iy = 40;
  c.fillStyle = '#fff'; c.fillRect(ix - 12, iy - 12, iw + 24, ih + 24); c.drawImage(imgEngine, ix, iy, iw, ih);
  c.textAlign = 'center'; c.fillStyle = C.ink;
  c.font = '800 40px Fraunces'; c.fillText("Charles Babbage's", PW / 2, iy + ih + 64); c.fillText('Analytical Engine', PW / 2, iy + ih + 110);
  footer(c, 'Photo: Marcin Wichary, CC BY 2.0 (Wikimedia Commons) · engine display, Science Museum, London', PH - 54);
  footer(c, 'Design begun 1834; only a trial piece completed by 1871 (Science Museum)', PH - 32);
  pages.p2 = cv;
}
{ // 3. Note G table (a glass slide)
  const [cv, c] = newPage('slide');
  c.fillStyle = '#F7F4EA'; c.fillRect(20, 20, PW - 40, PH - 40);
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = '800 44px Fraunces'; c.fillText('Note G', 52, 96);
  c.font = '700 22px Mono'; c.fillText('steps for computing Bernoulli numbers', 52, 132);
  const iw = PW - 80, ih = iw * 896 / 1280; c.drawImage(imgNoteG, 40, 168, iw, ih);
  c.strokeStyle = 'rgba(18,59,49,0.5)'; c.lineWidth = 2; c.strokeRect(40, 168, iw, ih);
  footer(c, "Diagram from Lovelace's Notes (Taylor's Scientific Memoirs, Aug 1843) · public domain", PH - 54);
  footer(c, 'Original held at Magdalen College, Oxford (per Bodleian blog)', PH - 32);
  pages.p3 = cv;
}
{ // 4. unfinished engine timeline (typeset summary)
  const [cv, c] = newPage();
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = '800 46px Fraunces'; c.fillText('An engine never finished', 52, 100);
  const ev = [[1815, 'Ada Lovelace born'], [1834, 'Babbage conceives the Analytical Engine'], [1843, "Lovelace's Notes published (August)"], [1852, 'Lovelace dies'], [1871, 'Babbage dies; only a trial piece completed']];
  const yOf = (yr) => 200 + (yr - 1815) * 11.6;
  c.strokeStyle = C.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(150, yOf(1815) - 20); c.lineTo(150, yOf(1871) + 20); c.stroke();
  for (const [yr, txt] of ev) {
    const y = yOf(yr); c.fillStyle = C.ink; c.beginPath(); c.arc(150, y, 9, 0, 6.283); c.fill();
    c.font = '700 30px Mono'; c.fillText(String(yr), 44, y + 10);
    c.font = '700 27px InterB'; wrap(c, txt, 186, y + 10, 640, 34);
  }
  footer(c, 'TYPESET SUMMARY, NOT AN ARCHIVAL DOCUMENT · source: Science Museum (2020, 2023)', PH - 34);
  pages.p4 = cv; pages.yOf = yOf;
}
{ // 5. symbolic music manuscript (typeset transcription + illustration)
  const [cv, c] = newPage();
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = '700 22px Mono'; c.fillText('NOTES, 1843 · TYPESET TRANSCRIPTION', 52, 84);
  c.font = '800 34px Fraunces';
  wrap(c, '“…the engine might compose elaborate and scientific pieces of music of any degree of complexity or extent.”', 52, 150, PW - 104, 46);
  c.font = '700 20px InterB'; c.fillStyle = 'rgba(18,59,49,0.75)'; c.fillText('— A.A.L. (Ada Lovelace), quoted by the Bodleian Library blog', 52, 352);
  // staff for the illustration
  for (let i = 0; i < 5; i++) { c.strokeStyle = 'rgba(18,59,49,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(52, 520 + i * 26); c.lineTo(PW - 52, 520 + i * 26); c.stroke(); }
  c.font = '800 120px Fraunces'; c.fillStyle = 'rgba(18,59,49,0.6)'; c.fillText('𝄞'.length === 2 ? '' : '', 60, 640);
  c.font = '700 18px Mono'; c.fillStyle = 'rgba(18,59,49,0.6)'; c.fillText('ILLUSTRATION: numbers as symbols for pitches (not her notation)', 52, 700);
  footer(c, 'Quotation: Lovelace, Notes (1843), via blogs.bodleian.ox.ac.uk/adalovelace', PH - 34);
  pages.p5 = cv;
}

// ---------- dynamic overlays per page (world coords: page origin PX,PY) ----------
function overlay(c, id, t) {
  c.save(); c.translate(PX, PY);
  if (id === 'p1') {
    const a = pr(t, T.stamp1843, T.stamp1843 + 0.4, eout);
    if (a > 0) { // date stamp "NOTES · 1843"
      c.save(); c.globalAlpha = a; c.translate(720, 120); c.rotate(-0.12); c.scale(1.3 - 0.3 * a, 1.3 - 0.3 * a);
      c.strokeStyle = C.goldDeep; c.lineWidth = 5; rr(c, -110, -48, 220, 96, 12); c.stroke();
      c.fillStyle = C.goldDeep; c.font = '700 22px Mono'; c.textAlign = 'center'; c.fillText('NOTES', 0, -8); c.font = '800 40px Mono'; c.fillText('1843', 0, 32);
      c.restore();
    }
    const n = pr(t, T.name, T.name + 0.5);
    if (n > 0) { c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(250, 836); c.lineTo(250 + 400 * n, 836); c.stroke(); }
  }
  if (id === 'p2') {
    const a = pr(t, T.proposed, T.proposed + 0.4, eout);
    if (a > 0) {
      c.save(); c.globalAlpha = a; c.translate(700, 110); c.rotate(0.1); c.scale(1.3 - 0.3 * a, 1.3 - 0.3 * a);
      c.fillStyle = 'rgba(2,34,28,0.88)'; rr(c, -130, -40, 260, 80, 12); c.fill();
      c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
      c.fillStyle = C.gold; c.font = '800 34px Mono'; c.textAlign = 'center'; c.fillText('PROPOSED', 0, 12);
      c.restore();
    }
  }
  if (id === 'p3') {
    const q = pr(t, T.quote, T.quote + 0.5, eout);
    if (q > 0) { // qualified attribution plate
      c.save(); c.globalAlpha = q; c.translate(0, (1 - q) * 30);
      c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, 40, 800, PW - 80, 120, 14); c.fill();
      c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
      c.fillStyle = C.cream; c.font = '700 25px InterB'; c.textAlign = 'left';
      c.fillText('“the first published algorithm, sometimes credited', 66, 846); c.fillText('as the first computer programme” — Science Museum', 66, 884);
      c.restore();
    }
    const rw = pr(t, T.rowRead[0], T.rowRead[1]);
    if (rw > 0 && t < T.cut) { c.strokeStyle = C.gold; c.lineWidth = 4; c.globalAlpha = 0.9; c.beginPath(); c.moveTo(48, 330); c.lineTo(48 + (PW - 96) * rw, 330); c.stroke(); c.globalAlpha = 1; }
  }
  if (id === 'p4') {
    const yOf = pages.yOf;
    const nv = pr(t, T.never, T.never + 0.5, eout);
    // engine bar 1834 -> 1871, dashed: never completed
    c.save(); c.strokeStyle = C.goldDeep; c.lineWidth = 10; c.setLineDash([16, 12]); c.lineCap = 'butt';
    const y0 = yOf(1834), y1 = lerp(y0, yOf(1871), pr(t, T.cut + 0.1, T.never));
    c.beginPath(); c.moveTo(118, y0); c.lineTo(118, y1); c.stroke(); c.restore();
    if (nv > 0) {
      c.save(); c.globalAlpha = nv; c.translate(640, yOf(1871) - 120); c.rotate(-0.08); c.scale(1.3 - 0.3 * nv, 1.3 - 0.3 * nv);
      c.strokeStyle = C.goldDeep; c.lineWidth = 5; rr(c, -175, -40, 350, 80, 10); c.stroke();
      c.fillStyle = C.goldDeep; c.font = '800 30px Mono'; c.textAlign = 'center'; c.fillText('NEVER COMPLETED', 0, 11);
      c.restore();
    }
    const lf = pr(t, T.lifetime, T.lifetime + 0.5, eout);
    if (lf > 0) { // bracket: her lifetime 1815–1852
      c.save(); c.globalAlpha = lf; c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round';
      const a = yOf(1815), b = lerp(a, yOf(1852), lf);
      c.beginPath(); c.moveTo(850, a); c.lineTo(866, a); c.lineTo(866, b); c.lineTo(850, b); c.stroke();
      c.fillStyle = C.goldDeep; c.font = '700 22px Mono'; c.textAlign = 'right'; c.fillText('her lifetime', 840, yOf(1824) + 8);
      c.restore();
    }
  }
  if (id === 'p5') {
    // numbers -> notes on the staff (illustration)
    const sym = pr(t, T.symbols - 0.2, T.symbols + 0.8), mu = pr(t, T.music, T.music + 0.6, eout);
    const nums = [1, 3, 5, 8, 5, 3, 6, 8, 10, 8];
    nums.forEach((n, i) => {
      const x = 110 + i * 76, y = 624 - n * 13;
      const k = clamp(sym * 10 - i * 0.6, 0, 1);
      c.save();
      c.globalAlpha = 1 - k; c.fillStyle = C.ink; c.font = '700 34px Mono'; c.textAlign = 'center'; c.fillText(String(n), x, y + 12);
      c.globalAlpha = k; c.fillStyle = mu > 0 ? `rgba(${Math.round(lerp(18, 201, mu))},${Math.round(lerp(59, 138, mu))},${Math.round(lerp(49, 34, mu))},1)` : C.ink;
      c.beginPath(); c.ellipse(x, y, 15, 11, -0.35, 0, 6.283); c.fill();
      c.lineWidth = 3; c.strokeStyle = c.fillStyle; c.beginPath(); c.moveTo(x + 13, y - 3); c.lineTo(x + 13, y - 62); c.stroke();
      c.restore();
    });
    if (mu > 0) { c.strokeStyle = C.gold; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(52, 222); c.lineTo(52 + 520 * mu, 222); c.stroke(); }
  }
  c.restore();
}

// ---------- page presentation helpers ----------
function pageShadow(c, x, y, w, h, a = 0.3) { c.save(); c.shadowColor = `rgba(2,44,36,${a})`; c.shadowBlur = 26; c.shadowOffsetY = 9; c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.restore(); }
function drawPage(c, id, t, dx = 0, dy = 0, rot = 0, sc = 1) {
  c.save(); c.translate(PX + PW / 2 + dx, PY + PH / 2 + dy); c.rotate(rot); c.scale(sc, sc); c.translate(-PX - PW / 2, -PY - PH / 2);
  pageShadow(c, PX, PY, PW, PH); c.drawImage(pages[id], PX, PY); overlay(c, id, t);
  c.restore();
}
function pageTurn(c, idOld, idNew, u, t) { // vertical fold moving right -> left; flap shows the paper back
  drawPage(c, idNew, t);
  const x0 = PX, x1 = PX + PW, f = lerp(x1, x0, eio(u));
  c.save(); c.beginPath(); c.rect(x0, PY - 40, f - x0, PH + 80); c.clip();
  pageShadow(c, PX, PY, PW, PH, 0.2); c.drawImage(pages[idOld], PX, PY); overlay(c, idOld, t); c.restore();
  // shadow cast on the new page by the lifting flap
  const sg = c.createLinearGradient(f, 0, f + 60, 0); sg.addColorStop(0, 'rgba(2,34,28,0.35)'); sg.addColorStop(1, 'rgba(2,34,28,0)');
  c.fillStyle = sg; c.fillRect(f, PY, Math.min(60, x1 - f), PH);
  const fw = x1 - f; const fade = 1 - pr(u, 0.82, 1);
  if (fw > 1 && fade > 0) {
    const lift = Math.sin(Math.PI * u) * 26;
    c.save(); c.globalAlpha = fade; c.translate(0, -lift * 0.3);
    c.beginPath(); c.moveTo(f, PY); c.lineTo(f - fw, PY - lift); c.lineTo(f - fw, PY + PH + lift); c.lineTo(f, PY + PH); c.closePath();
    c.save(); c.clip();
    const bg = c.createLinearGradient(f - fw, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(0.75, '#F8F3E6'); bg.addColorStop(1, '#D9CFB6');
    c.fillStyle = bg; c.fillRect(f - fw - 2, PY - 60, fw + 4, PH + 120);
    c.globalAlpha = 0.1 * fade; c.translate(2 * f, 0); c.scale(-1, 1); c.drawImage(pages[idOld], PX, PY); // faint show-through, mirrored
    c.restore();
    c.strokeStyle = 'rgba(5,71,58,0.35)'; c.lineWidth = 2; c.stroke();
    c.restore();
  }
}

// ---------- scene state machine ----------
function scene(c, t) {
  if (t < T.turn1[0]) return drawPage(c, 'p1', t);
  if (t < T.turn1[1]) return pageTurn(c, 'p1', 'p2', (t - T.turn1[0]) / (T.turn1[1] - T.turn1[0]), t);
  if (t < T.swap[0]) return drawPage(c, 'p2', t);
  if (t < T.swap[1]) { // slide swap: Note G glass slide pushes the engine page off to the left
    const u = eio((t - T.swap[0]) / (T.swap[1] - T.swap[0]));
    drawPage(c, 'p2', t, -1050 * u, 20 * u, -0.05 * u);
    drawPage(c, 'p3', t, 1050 * (1 - u), -20 * (1 - u), 0.04 * (1 - u));
    return;
  }
  if (t < T.cut) return drawPage(c, 'p3', t);
  if (t < T.turn2[0]) return drawPage(c, 'p4', t);
  if (t < T.turn2[1]) return pageTurn(c, 'p4', 'p5', (t - T.turn2[0]) / (T.turn2[1] - T.turn2[0]), t);
  if (t < T.index[0]) return drawPage(c, 'p5', t);
  // index: the five pages shrink into a laid-out set on the table, joined by a gold thread
  const u = pr(t, T.index[0], T.index[1]);
  const slots = { p1: [-300, -230, -0.035], p2: [0, -236, 0.03], p3: [300, -228, -0.02], p4: [-150, 172, 0.025], p5: [150, 168, -0.03] };
  const sc = lerp(1, 0.31, u);
  const order = ['p1', 'p2', 'p3', 'p4', 'p5'];
  const cen = (id) => [PX + PW / 2 + slots[id][0] * u, PY + PH / 2 + slots[id][1] * u];
  for (const id of order) { if (id === 'p5') continue; const [dx, dy, r] = slots[id]; c.save(); c.globalAlpha = clamp(u * 2.2); drawPage(c, id, t, dx * u, dy * u, r * u, sc); c.restore(); }
  { const [dx, dy, r] = slots.p5; drawPage(c, 'p5', t, dx * u, dy * u, r * u, sc); }
  const th = pr(t, T.thread[0], T.thread[1]);
  if (th > 0) {
    const pts = order.map(cen); c.save(); c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round';
    let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * th; c.beginPath(); c.moveTo(...pts[0]);
    for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= seg[i - 1]; }
    c.stroke(); for (const p of pts.slice(0, 1 + Math.floor(th * 4.01))) { c.fillStyle = C.gold; c.beginPath(); c.arc(p[0], p[1], 11, 0, 6.283); c.fill(); }
    c.restore();
  }
  const ex = pr(t, T.exist, T.exist + 0.6, eout); // the engine page: a machine that did not yet exist
  if (ex > 0) { const [x, y] = cen('p2'); c.save(); c.globalAlpha = ex; c.strokeStyle = C.gold; c.lineWidth = 5; c.setLineDash([14, 10]); rr(c, x - PW * sc / 2 - 16, y - PH * sc / 2 - 16, PW * sc + 32, PH * sc + 32, 10); c.stroke(); c.restore(); }
}

// ---------- loupe (one landing on Note G, tracking along a row) ----------
function loupe(c, t, cam) {
  const land = Math.min(pr(t, T.loupeIn, T.loupeIn + 0.4, eout), 1 - pr(t, T.loupeOut, T.loupeOut + 0.4, eout));
  if (land <= 0.001 || t >= T.cut) return;
  const rx = lerp(PX + 150, PX + PW - 170, pr(t, T.rowRead[0], T.rowRead[1]));
  const lx = rx, ly = PY + 330, R = 125 * (1.35 - 0.35 * land), mag = 2.3;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p3', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}

function camera(t) {
  const keys = [[0, [540, 990, 0.92]], [0.7, [540, 962, 0.97]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.05]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.index[0], [540, 954, 1.04]], [T.index[1], [540, 962, 1.0]], [30, [540, 964, 1.03]]];
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, keys);
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const [cx, cy, z] = camera(t);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  ctx.drawImage(tableCache, -400, -400);
  const flick = t < 0.45 ? (t < 0.12 ? 0 : t < 0.18 ? 1 : t < 0.24 ? 0.3 : pr(t, 0.24, 0.45)) : 1;
  ctx.translate(540, 1012); ctx.scale(0.94, 0.94); ctx.translate(-540, -1012); // page scale keeps pages below the caption plate
  scene(ctx, t);
  loupe(ctx, t);
  // light level (flicker on, cut flash, end dim)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const dark = (1 - (0.1 + 0.9 * flick)) + 0.4 * pr(t, 29.0, 30.0);
  if (dark > 0.001) { ctx.fillStyle = `rgba(2,34,28,${clamp(dark, 0, 0.9)})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.35 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 52px InterX';
    const bw = Math.min(920, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 336, bw, 148, 16); ctx.fillStyle = 'rgba(2,34,28,0.86)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 16, 481, bw - 32, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, 540, (cw.lines.length === 1 ? 428 : 400) + i * 58));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.8)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.2; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = {
    land: [T.loupeIn + 0.4],
    glide: [[T.turn1[0], T.turn1[1] - T.turn1[0]], [T.turn2[0], T.turn2[1] - T.turn2[0]], [T.index[0], 1.2]],
    slide: [T.swap[0]], cut: [T.cut],
    pen: [[T.name, 0.5], [T.rowRead[0], T.rowRead[1] - T.rowRead[0]], [T.lifetime, 0.5], [T.music, 0.6], [T.thread[0], T.thread[1] - T.thread[0]]],
    stamp: [T.stamp1843, T.proposed, T.never],
    tick: [T.quote, T.symbols, T.exist],
    bell: [[T.quote, 1760], [T.music, 2093], [T.exist, 2637]],
    T,
  };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.5,3.6,5.2,6.6,9.5,12,15.2,16.8,17.1,20.5,23,27.6').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
