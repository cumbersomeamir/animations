// dev helper: rightmost amber (#FFB900) pixel in the stage per frame (checks the right-side controls zone)
import { createCanvas } from '@napi-rs/canvas';
import { W, H, FPS } from './brt.mjs';
import { drawFrame } from './scene.mjs';
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
process.env.NO_CAPTION = '1'; process.env.NO_HEADLINE = '1';
for (const t of process.argv[2].split(',').map(Number)) {
  drawFrame(ctx, Math.round(t * FPS)); const d = ctx.getImageData(0, 0, W, H).data;
  let xmax = -1, ymin = 1e9, ymax = -1;
  for (let y = 480; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; if (d[i] > 230 && d[i + 1] > 160 && d[i + 1] < 205 && d[i + 2] < 60) { if (x > xmax) xmax = x; if (y < ymin) ymin = y; if (y > ymax) ymax = y; } }
  console.log(t, 'amber xmax', xmax, 'y', ymin, ymax);
}
