// Pixel QA on the renderer itself:
//  1) caption ink bounds: render each caption group with and without captions,
//     bbox of changed pixels must sit inside y 280-460 and x 100-900 (2026-11-19 brief: upper captions ~y280-460).
//  2) clean top: in y 0-280 frames must equal the static background.
//  3) the world never paints into the caption band or above the stage (y 280-479) at any sampled frame.
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { W, H, FPS, NFRAMES } from './brt.mjs';
import { drawFrame, CAPTIONS, CUES } from './scene.mjs';

const cv = createCanvas(W, H), ctx = cv.getContext('2d');
function grab(f, env = {}) {
  for (const k of ['NO_CAPTION', 'ONLY_BG', 'NO_HEADLINE']) delete process.env[k];
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
const HEAD_ONLY = !!process.env.QA_HEAD_ONLY;   // fast iteration on check 4 only
for (const c of HEAD_ONLY ? [] : CAPTIONS) {
  const tm = Math.min(c.tEnd - 0.15, c.t0 + 0.6);
  const f = Math.round(tm * FPS);
  const box = diffBox(grab(f), grab(f, { NO_CAPTION: '1' }), 0, 479);
  const pass = !!box && box.y0 >= 280 && box.y1 <= 460 && box.x0 >= 100 && box.x1 <= 900 && c.lines.length <= 2;
  ok = ok && pass;
  report.captions.push({ lines: c.lines, t0: +c.t0.toFixed(2), tEnd: +c.tEnd.toFixed(2), frame: f, box, pass });
}
report.signature = 'n/a (end card is in the stage area)';
// top 0-300 clean and caption band untouched by the world, every 10th frame
for (let f = 0; f < (HEAD_ONLY ? 0 : NFRAMES); f += 10) {
  const full = grab(f, { NO_CAPTION: '1' }), paper = grab(f, { ONLY_BG: '1' });
  const top = diffBox(full, paper, 0, 280, 6);
  const band = diffBox(full, paper, 280, 479, 6); // caption band + gap: no stage drawing (stage starts at y 480)
  if (top) { ok = false; report.top.push({ f, top }); }
  if (band) { ok = false; report.band.push({ f, band }); }
}
// 4) headlines never sit on a 3D prop: inside each headline's ink box (+12 px) the world
//    (without headline/caption) must look like the bare background, every 2nd frame up to the CTA.
//    (added english-23 after the watch-through found "HASH" / "PHONE" touching the vault)
function inkIn(a, b, box, pad, thr) {
  let n = 0; const x0 = Math.max(0, box.x0 - pad), x1 = Math.min(W - 1, box.x1 + pad), y0 = Math.max(480, box.y0 - pad), y1 = Math.min(H - 1, box.y1 + pad);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = (y * W + x) * 4; if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > thr) n++; }
  return n;
}
report.headline = [];
let worstHead = 0;
for (let f = 0; f < Math.floor(CUES.ctaAt * FPS) - 6; f += 2) {
  const withH = grab(f, { NO_CAPTION: '1' }), noH = grab(f, { NO_CAPTION: '1', NO_HEADLINE: '1' });
  const box = diffBox(withH, noH, 480, H, 30);
  if (!box) continue;
  const n = inkIn(noH, grab(f, { ONLY_BG: '1' }), box, 12, Number(process.env.HEAD_THR || 90));
  worstHead = Math.max(worstHead, n);
  if (n > 0) { ok = false; report.headline.push({ f, t: +(f / FPS).toFixed(2), box, propPixels: n }); }
}
report.headlineWorstPropPixels = worstHead;
report.pass = ok;
report.checkedFrames = Math.ceil(NFRAMES / 10);
fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 1));
console.log(JSON.stringify({ pass: ok, captions: report.captions.map((c) => [c.pass, c.box && [c.box.x0, c.box.y0, c.box.x1, c.box.y1]]), topViolations: report.top.length, bandViolations: report.band.length }));
