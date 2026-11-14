// Renders the separate 1080x1920 vertical thumbnail (the hook as one still, 3 large words).
// usage: node thumb.mjs <out.png>
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { drawThumbnail } from './scene.mjs';
const cv = createCanvas(1080, 1920);
drawThumbnail(cv.getContext('2d'));
fs.writeFileSync(process.argv[2], await cv.encode('png'));
console.log('wrote', process.argv[2]);
