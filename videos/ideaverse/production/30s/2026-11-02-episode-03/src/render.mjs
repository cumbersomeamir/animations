// render.mjs — riso frames -> FFmpeg.  node render.mjs --stills=0,4.6,12 [--out=../build/stills]
//                                       node render.mjs --video=../build/video.mp4
import { createCanvas, ImageData } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { W, H } from './riso.mjs';
import { renderFrame, N, FPS } from './scene.mjs';
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
if (arg('stills')) {
  const dir = arg('out', '../build/stills'); fs.mkdirSync(dir, { recursive: true });
  const cv = createCanvas(W, H), cx = cv.getContext('2d');
  for (const s of arg('stills').split(',')) {
    const f = Math.round(+s * FPS), t0 = Date.now(), buf = renderFrame(f);
    cx.putImageData(new ImageData(new Uint8ClampedArray(buf.buffer, buf.byteOffset, buf.length), W, H), 0, 0);
    fs.writeFileSync(path.join(dir, `t${(+s).toFixed(2).padStart(5, '0')}.png`), cv.toBuffer('image/png'));
    console.log('still', s, Date.now() - t0, 'ms');
  }
}
if (arg('video')) {
  const outFile = arg('video'); fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); let last = null, lastB = -1;
  for (let f = 0; f < N; f++) {
    const B = Math.floor(f / 2);
    if (B !== lastB) { last = Buffer.from(renderFrame(f)); lastB = B; }   // on 2s: each print holds 2 frames
    if (!ff.stdin.write(last)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end(); await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error('ffmpeg ' + c)) : r())));
  console.log('video ->', outFile, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
