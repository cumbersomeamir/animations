// Aarambh 10 s style test — "Archive light table": Marie Curie, two Nobel Prizes in two sciences.
// Original Canvas2D code (art direction only from the public Archive Light Table STYLE.md; no third-party code).
// Usage: node src/render.mjs --out build/video.mp4 | --stills qa/stills --times 1,3,6
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(`${FS}/fraunces/files/fraunces-latin-800-normal.woff2`, 'Fraunces');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-700-normal.woff2`, 'InterB');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-800-normal.woff2`, 'InterX');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf', 'Mono');

const W = 1080, H = 1920, FPS = 30, N = 300;
// palette sampled from videos/aarambh/assets/icon.png
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', glass: '#F4F7EF', gold: '#F1B444', ink: '#123B31', paper: '#FFFDF6' };
const VO0 = 0.6; // narration offset (s)

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function kf(t, keys) { // monotone smooth keys [[t, [x,y,z]]]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], u)); }
  return keys[keys.length - 1][1];
}

const portrait = await loadImage(path.join(ROOT, 'assets/marie-curie-c1920-henri-manuel-PD.jpg'));
// objects on the table (world = 1080x1920 at zoom 1)
const PH = { x: 540, y: 905, w: 360, h: 360 * 1305 / 960, rot: -0.025 };
const CARD1 = { x: 300, y: 1445, w: 410, h: 260, rot: -0.04, year: '1903', title: ['Nobel Prize', 'in Physics'], share: 'shared · prize share 1/4', glyph: 'rays' };
const CARD2 = { x: 790, y: 1462, w: 410, h: 260, rot: 0.035, year: '1911', title: ['Nobel Prize', 'in Chemistry'], share: 'prize share 1/1', glyph: 'flask' };
const LP = (o, lx, ly) => [o.x + lx * Math.cos(o.rot) - ly * Math.sin(o.rot), o.y + lx * Math.sin(o.rot) + ly * Math.cos(o.rot)];
const GL1 = LP(CARD1, 140, -58), GL2 = LP(CARD2, 140, -58); // ink-detail centres

// static noise tiles (deterministic)
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 46), grainB = noiseTile(256, 99, 46), diffuser = noiseTile(256, 3, 20);

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

function glyph(c, kind, x, y, s, lit) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = lit > 0 ? `rgba(${Math.round(lerp(18, 201, lit))},${Math.round(lerp(59, 138, lit))},${Math.round(lerp(49, 34, lit))},1)` : C.ink;
  c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  if (kind === 'rays') { // physics: radiation rays from a source (drawn ink detail)
    c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(-34, 0, 7, 0, 6.283); c.fill();
    for (let k = -2; k <= 2; k++) { const a = k * 0.32; c.beginPath(); c.moveTo(-24, 0); for (let i = 0; i <= 24; i++) { const d = i * 3; c.lineTo(-24 + d * Math.cos(a) - Math.sin(i * 0.9) * 3.2 * Math.sin(a), d * Math.sin(a) + Math.sin(i * 0.9) * 3.2 * Math.cos(a)); } c.stroke(); }
  } else { // chemistry: flask with liquid line and bubbles
    c.beginPath(); c.moveTo(-10, -42); c.lineTo(-10, -12); c.lineTo(-38, 34); c.quadraticCurveTo(-40, 42, -30, 42); c.lineTo(30, 42); c.quadraticCurveTo(40, 42, 38, 34); c.lineTo(10, -12); c.lineTo(10, -42); c.stroke();
    c.beginPath(); c.moveTo(-16, -44); c.lineTo(16, -44); c.stroke();
    c.beginPath(); c.moveTo(-27, 18); c.quadraticCurveTo(0, 12, 27, 18); c.stroke();
    for (const [bx, by, br] of [[-8, 28, 4], [8, 24, 3], [2, 6, 2.5]]) { c.beginPath(); c.arc(bx, by, br, 0, 6.283); c.stroke(); }
  }
  c.restore();
}

function card(c, o, lit) {
  c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
  const w = o.w, h = o.h;
  c.shadowColor = 'rgba(2,44,36,0.25)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.fillStyle = C.paper; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'rgba(0,0,0,0)';
  // backlit paper: warm glow at edges
  const g = c.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.62); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.16)');
  c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  c.strokeStyle = 'rgba(5,71,58,0.35)'; c.lineWidth = 2; c.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  c.fillStyle = C.ink; c.textBaseline = 'alphabetic';
  c.font = '700 30px Mono'; c.fillText(o.year, -w / 2 + 28, -h / 2 + 56);
  c.font = '800 34px Fraunces'; c.fillText(o.title[0], -w / 2 + 28, -h / 2 + 108); c.fillText(o.title[1], -w / 2 + 28, -h / 2 + 148);
  c.font = '700 19px Mono'; c.fillStyle = 'rgba(18,59,49,0.8)'; c.fillText(o.share, -w / 2 + 28, -h / 2 + 186);
  c.font = '700 15px Mono'; c.fillStyle = 'rgba(18,59,49,0.62)';
  c.fillText('TYPESET SUMMARY · NOT AN ARCHIVAL DOCUMENT', -w / 2 + 28, h / 2 - 40);
  c.fillText('source: nobelprize.org (facts page)', -w / 2 + 28, h / 2 - 20);
  // underline the discipline when lit
  if (lit > 0) { c.strokeStyle = C.gold; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-w / 2 + 64, -h / 2 + 158); c.lineTo(-w / 2 + 64 + 150 * lit, -h / 2 + 158); c.stroke(); }
  c.restore();
  glyph(c, o.glyph, ...(o === CARD1 ? GL1 : GL2), 1, lit);
}

function photo(c) {
  c.save(); c.translate(PH.x, PH.y); c.rotate(PH.rot);
  const b = 16;
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
  c.fillStyle = '#FFFFFF'; c.fillRect(-PH.w / 2 - b, -PH.h / 2 - b, PH.w + 2 * b, PH.h + 2 * b + 40); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(portrait, -PH.w / 2, -PH.h / 2, PH.w, PH.h);
  c.font = '700 15px Mono'; c.fillStyle = 'rgba(18,59,49,0.75)';
  c.fillText('Henri Manuel, c. 1920 · public domain · Wikimedia Commons', -PH.w / 2, PH.h / 2 + 34);
  c.restore();
}

function table(c, t, light) {
  c.fillStyle = C.desk; c.fillRect(-400, -400, W + 800, H + 800);
  // aluminium (green) frame + glowing glass
  rr(c, 30, 250, W - 60, H - 330, 26); c.fillStyle = C.green; c.fill();
  rr(c, 52, 272, W - 104, H - 374, 14);
  const g = c.createRadialGradient(540, 1060, 120, 540, 1060, 980);
  g.addColorStop(0, lerp(0, 1, light) > 0.5 ? '#FFFFFC' : '#7d857d'); g.addColorStop(1, light > 0.5 ? '#E3EBDF' : '#59625a');
  c.save(); c.fillStyle = g; c.fill(); c.clip();
  c.globalAlpha = 1 - light; c.fillStyle = C.deep; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
  c.globalAlpha = 0.06; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(diffuser, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(5,71,58,0.08)'; c.lineWidth = 1.5; // catalogue grid
  for (let x = 92; x < W - 52; x += 64) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, H - 102); c.stroke(); }
  for (let y = 304; y < H - 102; y += 64) { c.beginPath(); c.moveTo(52, y); c.lineTo(W - 52, y); c.stroke(); }
  c.restore();
}

function world(c, t, s) {
  table(c, t, s.light);
  photo(c);
  card(c, CARD1, s.lit1); card(c, CARD2, s.lit2);
  // name reading attached to the photograph (anchor dot, leader, label)
  if (s.name > 0) {
    const a = [PH.x - 110, PH.y + PH.h / 2 - 40];
    c.save(); c.globalAlpha = s.name;
    c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.arc(a[0], a[1], 9, 0, 6.283); c.stroke();
    c.beginPath(); c.moveTo(a[0], a[1] + 9); c.lineTo(a[0], a[1] + 9 + 66 * s.name); c.stroke();
    c.fillStyle = 'rgba(2,34,28,0.86)'; rr(c, a[0] - 20, a[1] + 76, 300, 62, 10); c.fill();
    c.fillStyle = C.cream; c.font = '800 38px Fraunces'; c.fillText('Marie Curie', a[0], a[1] + 120);
    c.restore();
  }
  // closing: two signal leaders from portrait to the two cards
  if (s.links > 0) {
    c.save(); c.strokeStyle = C.gold; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([2, 12]);
    const p0 = [PH.x + 20, PH.y + PH.h / 2 + 100];
    for (const q of [[CARD1.x + 10, CARD1.y - CARD1.h / 2 - 12], [CARD2.x - 10, CARD2.y - CARD2.h / 2 - 12]]) {
      c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(lerp(p0[0], q[0], s.links), lerp(p0[1], q[1], s.links)); c.stroke();
    }
    c.setLineDash([]); c.fillStyle = C.gold; c.beginPath(); c.arc(p0[0], p0[1], 8, 0, 6.283); c.fill();
    c.restore();
  }
}

function state(t) {
  const flick = t < 0.45 ? (t < 0.12 ? 0 : t < 0.18 ? 1 : t < 0.24 ? 0.25 : pr(t, 0.24, 0.45)) : 1;
  return {
    light: 0.12 + 0.88 * flick,
    name: pr(t, 1.15, 1.6, eout),
    lit1: pr(t, VO0 + 2.25, VO0 + 2.6, eout), // ~"physics"
    lit2: pr(t, VO0 + 2.95, VO0 + 3.3, eout), // ~"chemistry"
    links: pr(t, VO0 + 3.95, VO0 + 4.8),
  };
}
// camera (world centre x,y and zoom) and loupe (world x,y, landed 0..1)
const camKeys = [[0, [540, 1060, 0.96]], [0.6, [540, 1040, 0.98]], [2.4, [540, 960, 1.12]], [2.85, [470, 1240, 1.1]], [3.6, [650, 1300, 1.1]], [4.5, [655, 1290, 1.1]], [5.6, [540, 1150, 0.97]], [10, [540, 1140, 1.0]]];
const lpKeys = [[0, [760, 640]], [0.55, [760, 640]], [1.0, [PH.x + 10, PH.y - 90]], [2.75, [PH.x + 10, PH.y - 90]], [3.05, GL1], [3.5, GL1], [3.8, GL2], [4.75, GL2], [5.4, [980, 640]]];
function loupeLanded(t) { return Math.min(pr(t, 0.6, 1.0, eout), 1 - pr(t, 4.75, 5.3, eout)); }

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const s = state(t);
  const [cx, cy, z] = kf(t, camKeys);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  world(ctx, t, s);
  // loupe
  const land = loupeLanded(t);
  if (land > 0.001) {
    const [lx, ly] = kf(t, lpKeys);
    const R = 150 * (1.35 - 0.35 * land), mag = 2.3;
    const sh = 26 * (1.4 - land);
    ctx.save(); ctx.globalAlpha = land * 0.5; ctx.fillStyle = 'rgba(1,30,24,0.55)'; ctx.beginPath(); ctx.ellipse(lx + sh, ly + sh, R + 14, R + 14, 0, 0, 6.283); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(land * 1.6);
    ctx.beginPath(); ctx.arc(lx, ly, R, 0, 6.283); ctx.clip();
    ctx.translate(lx, ly); ctx.scale(mag, mag); ctx.translate(-lx, -ly);
    world(ctx, t, s);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(land * 1.6);
    ctx.lineWidth = 22; ctx.strokeStyle = C.deep; ctx.beginPath(); ctx.arc(lx, ly, R + 11, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(lx, ly, R + 4, 3.6, 4.9); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(lx, ly, R + 21, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
  // screen space: captions (upper centre, y 350–460), signature, grain
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const caps = [[VO0 - 0.05, VO0 + 3.55, ['Marie Curie won Nobel Prizes', 'in physics and chemistry.']], [VO0 + 3.75, 9.85, ['One person,', 'two different sciences.']]];
  for (const [a, b, lines] of caps) {
    if (t < a || t > b) continue;
    const al = clamp(Math.min((t - a) / 0.15, (b - t) / 0.15));
    ctx.save(); ctx.globalAlpha = al;
    ctx.font = '800 54px InterX';
    const bw = Math.min(920, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 340, bw, 132, 18); ctx.fillStyle = 'rgba(2,34,28,0.86)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 18, 466, bw - 36, 4);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    lines.forEach((l, i) => ctx.fillText(l, 540, 396 + i * 60));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 30px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.82)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1868);
  const sx = 1000 - ctx.measureText('Aarambh').width - 20; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 4 : 12; ctx.lineTo(sx + Math.cos(a) * r, 1858 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.22; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const t of arg('--times', '0.3,1.3,3.2,4.1,6.5').split(',').map(Number)) { drawFrame(t); writeFileSync(path.join(dir, `t${t.toFixed(2)}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
