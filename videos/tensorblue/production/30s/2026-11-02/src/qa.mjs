// Pixel QA on the renderer itself:
//  1) caption ink bounds: render each caption group with and without captions,
//     bbox of changed pixels must sit inside y 350-470 and x 80-1000.
//  2) clean top: in y 0-300 (and up to the caption) frames must equal paper+grain.
//  3) world never paints into the caption band (y 350-470) at any sampled frame.
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { W, H, FPS, NFRAMES } from './lib.mjs';
import { drawFrame, CAPTIONS, CUES } from './scene.mjs';

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
function grab(f, env = {}) {
  for (const k of ['NO_CAPTION', 'ONLY_PAPER']) delete process.env[k];
  Object.assign(process.env, env);
  drawFrame(ctx, f);
  const d = ctx.getImageData(0, 0, W, H).data;
  for (const k of Object.keys(env)) delete process.env[k];
  return new Uint8ClampedArray(d);
}
function diffBox(a, b, y0 = 0, y1 = H, thr = 10) {
  let x0 = 1e9, xa = -1, ya0 = 1e9, ya1 = -1, n = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const dlt = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]);
    if (dlt > thr) { n++; if (x < x0) x0 = x; if (x > xa) xa = x; if (y < ya0) ya0 = y; if (y > ya1) ya1 = y; }
  }
  return n ? { x0, x1: xa, y0: ya0, y1: ya1, n } : null;
}
const report = { captions: [], signature: null, top: [], band: [] };
let ok = true;
for (const c of CAPTIONS) {
  const tm = Math.min(c.tEnd - 0.15, c.t0 + 0.6);
  const f = Math.round(tm * FPS);
  const box = diffBox(grab(f), grab(f, { NO_CAPTION: '1' }), 0, 700);
  const pass = !!box && box.y0 >= 350 && box.y1 <= 470 && box.x0 >= 80 && box.x1 <= 1000 && c.lines.length <= 2;
  ok = ok && pass;
  report.captions.push({ lines: c.lines, t0: +c.t0.toFixed(2), tEnd: +c.tEnd.toFixed(2), frame: f, box, pass });
}
{
  const f = NFRAMES - 1;
  const box = diffBox(grab(f), grab(f, { NO_CAPTION: '1' }), 0, 700);
  const pass = !!box && box.y0 >= 350 && box.y1 <= 470 && box.x0 >= 80 && box.x1 <= 1000;
  ok = ok && pass; report.signature = { frame: f, box, pass };
}
// top 0-300 clean and caption band untouched by the world, every 10th frame
for (let f = 0; f < NFRAMES; f += 10) {
  const full = grab(f, { NO_CAPTION: '1' }), paper = grab(f, { ONLY_PAPER: '1' });
  const top = diffBox(full, paper, 0, 300, 6);
  const band = diffBox(full, paper, 300, 471, 6);
  if (top) { ok = false; report.top.push({ f, top }); }
  if (band) { ok = false; report.band.push({ f, band }); }
}
report.pass = ok;
report.checkedFrames = Math.ceil(NFRAMES / 10);
fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 1));
console.log(JSON.stringify({ pass: ok, captions: report.captions.map((c) => [c.pass, c.box && [c.box.x0, c.box.y0, c.box.x1, c.box.y1]]), signature: report.signature.box, topViolations: report.top.length, bandViolations: report.band.length }));
