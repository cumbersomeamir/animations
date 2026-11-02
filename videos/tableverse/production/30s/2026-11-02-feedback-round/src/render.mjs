// Render CLI.
//   node src/render.mjs --timeline            write timeline.json (consumed by audio/build_audio.py)
//   node src/render.mjs --still 0,16,150      write QA stills to qa/stills/
//   node src/render.mjs --video               render all frames -> build/video.mp4 (H.264, no audio)
//   node src/render.mjs --video --workers 4   same, rendering frames in parallel worker threads
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { W, H, FPS, FRAMES, timelineJSON } from './timeline.mjs';
import { init, drawFrame } from './scene.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FONT_DIR = path.join(ROOT, 'node_modules', '@fontsource', 'fredoka', 'files');
for (const w of [400, 500, 600, 700]) GlobalFonts.registerFromPath(path.join(FONT_DIR, `fredoka-latin-${w}-normal.woff2`), 'Fredoka');

async function makeRenderer() {
  await init();
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  return (f, opts = {}) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    drawFrame(ctx, f, opts);
    if (opts.debug) { ctx.font = '700 30px Fredoka'; ctx.fillStyle = '#0a0'; ctx.textAlign = 'left'; ctx.fillText(`f${f} ${(f / 30).toFixed(2)}s`, 16, 1900); }
    return canvas;
  };
}

if (!isMainThread) {
  const render = await makeRenderer();
  parentPort.on('message', (f) => {
    if (f === null) process.exit(0);
    const c = render(f);
    // copy pixels into a plain transferable ArrayBuffer (the canvas-owned buffer cannot be transferred)
    const px = new Uint8Array(c.getContext('2d').getImageData(0, 0, W, H).data);
    parentPort.postMessage({ f, buf: px }, [px.buffer]);
  });
  parentPort.postMessage({ ready: true });
} else {
  const args = process.argv.slice(2);
  const arg = (k) => {
    const i = args.indexOf(k);
    return i >= 0 ? args[i + 1] : undefined;
  };
  if (args.includes('--timeline')) {
    fs.writeFileSync(path.join(ROOT, 'timeline.json'), JSON.stringify(timelineJSON(), null, 2));
    console.log('wrote timeline.json');
  }
  if (args.includes('--still')) {
    const render = await makeRenderer();
    const out = arg('--out') || path.join(ROOT, 'qa', 'stills');
    fs.mkdirSync(out, { recursive: true });
    for (const s of arg('--still').split(',')) {
      const f = parseInt(s, 10);
      const c = render(f, { debug: args.includes('--debug') });
      const p = path.join(out, `f${String(f).padStart(4, '0')}.png`);
      fs.writeFileSync(p, await c.encode('png'));
      console.log('wrote', p);
    }
  }
  if (args.includes('--video')) {
    const workers = parseInt(arg('--workers') || '4', 10);
    const from = parseInt(arg('--from') || '0', 10);
    const to = parseInt(arg('--to') || String(FRAMES), 10);
    const outFile = arg('--out') || path.join(ROOT, 'build', 'video.mp4');
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const ff = spawn('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-r', String(FPS), '-movflags', '+faststart', outFile,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    const pending = new Map();
    let nextWrite = from, nextSend = from;
    const pool = [];
    await new Promise((resolve, reject) => {
      const flush = async () => {
        while (pending.has(nextWrite)) {
          const buf = pending.get(nextWrite);
          pending.delete(nextWrite);
          if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
          nextWrite++;
          if (nextWrite % 60 === 0) process.stdout.write(`  ${nextWrite}/${to} frames  ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
        }
        if (nextWrite >= to) resolve();
      };
      let busy = Promise.resolve();
      for (let i = 0; i < workers; i++) {
        const w = new Worker(fileURLToPath(import.meta.url));
        pool.push(w);
        w.on('error', reject);
        w.on('message', (m) => {
          if (m.ready || m.buf) {
            if (m.buf) {
              pending.set(m.f, Buffer.from(m.buf.buffer ?? m.buf));
              busy = busy.then(flush);
            }
            // simple backpressure: don't run too far ahead of the writer
            const send = () => {
              if (nextSend < to && nextSend - nextWrite < workers * 4) w.postMessage(nextSend++);
              else if (nextSend < to) setTimeout(send, 5);
            };
            send();
          }
        });
      }
    });
    for (const w of pool) w.postMessage(null);
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`rendered ${to - from} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${outFile}`);
  }
}
