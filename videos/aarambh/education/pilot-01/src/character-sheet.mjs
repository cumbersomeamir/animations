// Renders Bindu's model sheet: character/bindu-model-sheet.png
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { drawBindu } from './lib/bindu.mjs';
import { P, makeGrain, makeBrushLayer, rrect, star4 } from './lib/paint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const F = (f) => path.join(ROOT, 'node_modules/@fontsource', f);
GlobalFonts.registerFromPath(F('fraunces/files/fraunces-latin-800-normal.woff2'), 'Fraunces');
GlobalFonts.registerFromPath(F('inter/files/inter-latin-700-normal.woff2'), 'Inter');
GlobalFonts.registerFromPath(F('inter/files/inter-latin-500-normal.woff2'), 'InterM');

const W = 2400, H = 1600;
const c = createCanvas(W, H);
const ctx = c.getContext('2d');
const grain = makeGrain(512, 11);
ctx.fillStyle = P.g800; ctx.fillRect(0, 0, W, H);
ctx.drawImage(makeBrushLayer(W, H, 4, [P.g600, P.g900, P.g500], 1400), 0, 0);

ctx.fillStyle = P.cream; ctx.font = '800 64px Fraunces';
ctx.fillText('Bindu — model sheet', 60, 100);
ctx.font = '500 28px InterM'; ctx.fillStyle = P.cream2;
ctx.fillText('Aarambh education series · original recurring performer · rig: src/lib/bindu.mjs · height ~4.8 heads incl. bun', 60, 145);

function label(t, x, y) { ctx.font = '700 26px Inter'; ctx.fillStyle = P.gold; ctx.textAlign = 'center'; ctx.fillText(t, x, y); ctx.textAlign = 'left'; }

// Row 1: turnaround-ish
const y1 = 660;
const base = { s: 1, y: y1 };
drawBindu(ctx, { ...base, x: 220, handB: [-70, -100], handF: [70, -100] }, grain); label('front', 220, y1 + 50);
drawBindu(ctx, { ...base, x: 520, headTurn: 0.6, pupil: [0.6, 0], handB: [-50, -95], handF: [80, -105] }, grain); label('3/4 right', 520, y1 + 50);
drawBindu(ctx, { ...base, x: 820, flip: -1, headTurn: 0.6, pupil: [0.6, 0], handB: [-50, -95], handF: [80, -105] }, grain); label('3/4 left (flip)', 820, y1 + 50);
// action poses
drawBindu(ctx, { ...base, x: 1130, lean: -0.12, handB: [70, -330], handF: [92, -300], bendB: 1, bendF: 1, eyes: 'open', pupil: [0.5, -0.8], browF: 0.5, browB: 0.5, mouth: 'grin', sweat: 1, footB: [-40, 0], footF: [30, 0] }, grain); label('crank / pull', 1130, y1 + 50);
drawBindu(ctx, { ...base, x: 1430, handF: [120, -250], handB: [-60, -120], headTurn: 0.4, pupil: [1, -0.3], mouth: 'smile', mouthOpen: 0.4, propF: (cc, h) => { cc.fillStyle = P.gold; cc.strokeStyle = P.ink; cc.lineWidth = 3; cc.save(); cc.translate(h[0], h[1]); cc.rotate(-0.6); cc.beginPath(); cc.rect(0, -6, 70, 12); cc.fill(); cc.stroke(); cc.restore(); } }, grain); label('point (pencil)', 1430, y1 + 50);
drawBindu(ctx, { ...base, x: 1730, handB: [-30, -380], handF: [10, -390], bendB: -1, bendF: 1, footB: [-18, -10], footF: [26, 6], eyes: 'wide', mouth: 'o', mouthOpen: 0.6, browB: 1, browF: 1 }, grain); label('dangle / lifted', 1730, y1 + 50);
drawBindu(ctx, { ...base, x: 2060, handF: [110, -180], handB: [-90, -240], headTurn: 0.2, eyes: 'wink', mouth: 'grin', mouthOpen: 0.3 }, grain); label('present / wink', 2060, y1 + 50);

// Row 2: expressions (head close-ups)
const exprs = [
  ['neutral', { eyes: 'open', mouth: 'smile' }],
  ['curious', { eyes: 'open', browB: 0.9, browF: -0.2, pupil: [0.6, 0.6], mouth: 'hmm' }],
  ['puzzled', { eyes: 'open', browB: -0.8, browF: 1, pupil: [-0.4, -0.6], mouth: 'hmm', headTilt: 0.12 }],
  ['surprised', { eyes: 'wide', browB: 1, browF: 1, mouth: 'o', mouthOpen: 0.7 }],
  ['delighted', { eyes: 'happy', mouth: 'grin', mouthOpen: 0.5 }],
  ['effort', { eyes: 'closed', browB: -1, browF: -1, mouth: 'grin', mouthOpen: 0.1, sweat: 1 }],
  ['talking', { eyes: 'open', mouth: 'smile', mouthOpen: 0.7, browF: 0.3 }],
];
exprs.forEach(([n, e], i) => {
  const x = 190 + i * 320, y = 1500;
  ctx.save();
  ctx.beginPath(); rrect(ctx, x - 140, 900, 280, 520, 30); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
  ctx.clip();
  drawBindu(ctx, { x, y: 1660, s: 1.55, shadow: false, ...e }, grain);
  ctx.restore();
  label(n, x, 1460);
});

// palette swatches
const sw = [[P.g700, 'green #05473A'], [P.cream, 'cream #FBF7EE'], [P.gold, 'gold #F1B444'], [P.skin, 'skin #A9653D'], [P.hair, 'hair #22160F'], [P.g600, 'kurta #0A5A49']];
sw.forEach(([col, n], i) => {
  const x = 60 + i * 300, y = 1500;
  ctx.fillStyle = col; ctx.strokeStyle = P.cream; ctx.lineWidth = 3;
  ctx.beginPath(); rrect(ctx, x, y + 20, 50, 50, 10); ctx.fill(); ctx.stroke();
  ctx.font = '500 24px InterM'; ctx.fillStyle = P.cream; ctx.fillText(n, x + 64, y + 54);
});
ctx.fillStyle = P.gold; star4(ctx, 2300, 90, 30); ctx.fill();
ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.35;
ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);

mkdirSync(path.join(ROOT, 'character'), { recursive: true });
const out = path.join(ROOT, 'character/bindu-model-sheet.png');
writeFileSync(out, c.toBuffer('image/png'));
console.log('wrote', out);
