// Character / model sheet for the recurring cast. usage: node src/sheet.mjs character/model-sheet.png
import fs from 'node:fs';
import './fonts.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { C, hexA, roundRect } from './core.mjs';
import { drawBix, drawDot, BIX_BASE } from './cast.mjs';

export const POSES = {
  neutral: {},
  proud: { handN: [95, -205], handF: [-95, -205], mouth: 1, happyEyes: 1, barGlow: 0.8, squash: -0.15, lift: -8 },
  confused: { handN: [60, -120], handF: [-30, -268], brow: 0.6, browTilt: 1, mouth: -0.2, look: [-0.5, -0.8], lean: -0.08 },
  point: { handN: [40, -288], handF: [-60, -110], mouth: 0.6, brow: 0.5, look: [0, -1] },
  shrug: { handN: [110, -170], handF: [-110, -170], mouth: -0.5, brow: 0.8, browTilt: 1, squash: 0.25 },
  impatient: { handN: [52, -138], handF: [-52, -138], brow: -0.9, mouth: -0.35, eye: 0.7, footN: [30, -10] },
  relieved: { handN: [80, -150], handF: [-80, -150], happyEyes: 1, mouth: 0.9, squash: 0.1 },
  surprised: { handN: [90, -250], handF: [-90, -250], eye: 1.35, brow: 1, mouthO: 0.9, lift: -30, squash: -0.3 },
};
export const BARS_STATES = [0, 1, 2, 3, 4];

const Wd = 2400, Hd = 1800;
const cv = createCanvas(Wd, Hd), ctx = cv.getContext('2d');
ctx.fillStyle = C.bg; ctx.fillRect(0, 0, Wd, Hd);
ctx.strokeStyle = hexA(C.blueSoft, 0.06); ctx.lineWidth = 1;
for (let x = 0; x < Wd; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, Hd); ctx.stroke(); }
for (let y = 0; y < Hd; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(Wd, y); ctx.stroke(); }
const label = (t, x, y, size = 30, col = C.ink, font = 'ESemi') => { ctx.fillStyle = col; ctx.font = `${size}px ${font}`; ctx.textAlign = 'center'; ctx.fillText(t, x, y); };
ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.font = '64px EDisplay'; ctx.fillText('Bix & Dot — model sheet', 70, 110);
ctx.font = '30px EMed'; ctx.fillStyle = C.muted; ctx.fillText('Meshline educational series · original cast · palette sampled from the app icon (#111714 / #3157FF / #F7F7F2)', 70, 160);
// turnaround
label('TURNAROUND', 420, 250, 28, C.blueSoft);
[[1, 'front-right'], [0.45, '3/4 turn'], [-1, 'front-left']].forEach(([f, n], i) => { drawBix(ctx, 170 + i * 250, 640, 1.05, { face: f }); label(n, 170 + i * 250, 700, 24, C.muted, 'EMed'); });
// signal crest states
label('CREST = SIGNAL BARS (0–4 lit)', 1250, 250, 28, C.blueSoft);
BARS_STATES.forEach((b, i) => { drawBix(ctx, 880 + i * 190, 640, 0.78, { bars: b, mouth: b > 2 ? 0.7 : -0.2, brow: b > 2 ? 0.2 : -0.4 }); label(`${b}`, 880 + i * 190, 700, 26, C.muted, 'EMed'); });
// expressions & poses
label('POSES / EXPRESSIONS', 1200, 790, 28, C.blueSoft);
Object.entries(POSES).filter(([n]) => n !== 'neutral').forEach(([n, p], i) => { drawBix(ctx, 170 + i * 320, 1230, 1.0, p); label(n, 170 + i * 320, 1290, 26, C.muted, 'EMed'); });
// Dot
label('DOT — data packet', 330, 1390, 28, C.blueSoft);
drawDot(ctx, 150, 1600, 120, { mood: 1, legs: true }); label('happy', 150, 1680, 24, C.muted, 'EMed');
drawDot(ctx, 350, 1600, 120, { mood: -0.8, eye: 0.6, legs: true }); label('waiting', 350, 1680, 24, C.muted, 'EMed');
drawDot(ctx, 540, 1600, 60, { face: false, dim: true }); label('crowd packet', 540, 1680, 24, C.muted, 'EMed');
// specs
ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.font = '28px EMed';
const spec = [
  'Silhouette: sphere body + 4-bar crest (instantly reads as "signal"), white node face plate.',
  'Bix height = 300 ref-px (crest 1.25 heads); limbs ink #F7F7F2 (near) / #B9C0BB (far).',
  'Crest lit bars = signal strength only. Speed is never shown on the crest (lesson rule).',
  'Voice: original Kokoro style blend (0.7 af_bella + 0.3 am_puck), speed 0.98; not a named actor/character.',
  'Dot: off-white cube, blue band, node; faces only on the hero packet; crowd packets are dim and faceless.',
  'Rig: src/cast.mjs — drawBix(ctx,x,y,scale,pose) / drawDot(ctx,x,y,size,opts); poses in src/sheet.mjs.',
];
spec.forEach((s, i) => ctx.fillText('• ' + s, 760, 1420 + i * 52));
fs.writeFileSync(process.argv[2] || 'character/model-sheet.png', await cv.encode('png'));
console.log('sheet ->', process.argv[2] || 'character/model-sheet.png');
