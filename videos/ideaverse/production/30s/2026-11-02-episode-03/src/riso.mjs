// riso.mjs — an original risograph print engine (written for this project, following the Riso STYLE.md rules):
// three spot-ink plates hold grey tones (0..1, quantised to 20 levels); a per-pixel pass screens each plate into
// halftone dots at its own angle and multiplies the inks onto cream paper; plates print a few px off register,
// with per-variant ink dropouts. Fills knock out, lines overprint, white is paper, no black ink.
import { createCanvas } from '@napi-rs/canvas';

export const W = 1080, H = 1920;
export const PAPER = [242, 236, 227];
// Ideaverse inks: navy (key, registered), mint, amber. Navy/mint from the app icon; navy lifted to a printable
// transparent ink; amber = the series' provisional accent (context/08). All darks are overprints of these three.
export const INKS = {
  navy: { rgb: [44, 62, 102], angle: 15, off: [0, 0] },
  mint: { rgb: [108, 218, 126], angle: 75, off: [4, -3] },
  amber: { rgb: [255, 194, 75], angle: 45, off: [-3, 4] },
};
export const PLATES = ['navy', 'mint', 'amber'];
export const PITCH = { fine: 7, world: 10.8, field: 17.5 };
const JIT = [[0, 0], [0.3, -0.2], [-0.25, 0.3]];

// overprint colour of a set of tones (for previews / docs)
export function inkRGB(t) {
  return PAPER.map((p, c) => { let v = p; for (const k of PLATES) v *= 1 - (t[k] || 0) * (1 - INKS[k].rgb[c] / p); return Math.round(v); });
}

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- paper (flat, faint fibres + specks)
function makePaper() {
  const b = new Float32Array(W * H * 3), R = rng(17);
  for (let i = 0; i < W * H; i++) { const n = (R() + R() + R() - 1.5) * 1.6; for (let c = 0; c < 3; c++) b[i * 3 + c] = PAPER[c] + n; }
  for (let f = 0; f < 260; f++) {           // curly fibres, ~2-3 levels darker
    let x = R() * W, y = R() * H, a = R() * 6.28; const len = 20 + R() * 60, d = 1.5 + R() * 2;
    for (let s = 0; s < len; s++) { a += (R() - 0.5) * 0.5; x += Math.cos(a); y += Math.sin(a); const i = (Math.round(y) * W + Math.round(x)); if (i >= 0 && i < W * H) for (let c = 0; c < 3; c++) b[i * 3 + c] -= d; }
  }
  for (let s = 0; s < 400; s++) { const i = Math.floor(R() * W * H); for (let c = 0; c < 3; c++) b[i * 3 + c] -= 6 + R() * 8; }
  return b;
}
export const PAPERBUF = makePaper();

// dropout maps (3 boil variants): ~0.6% of pixels lose one plate, in 1-2 px specks
const DROP = [0, 1, 2].map((v) => {
  const m = new Uint8Array(W * H), R = rng(101 + v);
  const n = Math.floor(W * H * 0.006 / 2.5);
  for (let k = 0; k < n; k++) { const x = Math.floor(R() * (W - 2)), y = Math.floor(R() * (H - 2)), p = 1 + Math.floor(R() * 3); m[y * W + x] = p; if (R() < 0.6) m[y * W + x + 1] = p; if (R() < 0.4) m[(y + 1) * W + x] = p; }
  return m;
});

// ---------------------------------------------------------------- sheet
export class Sheet {
  constructor() { this.rgb = new Float32Array(W * H * 3); this.out = Buffer.alloc(W * H * 4); }
  fromPaper() { this.rgb.set(PAPERBUF); return this; }
  copyFrom(s) { this.rgb.set(s.rgb); return this; }
  toRGBA() { const o = this.out, s = this.rgb; for (let i = 0, j = 0; i < W * H; i++, j += 4) { o[j] = s[i * 3]; o[j + 1] = s[i * 3 + 1]; o[j + 2] = s[i * 3 + 2]; o[j + 3] = 255; } return o; }
}

// ---------------------------------------------------------------- layer: 3 grey plate canvases + a mask
export class Layer {
  constructor() {
    this.cv = {}; this.cx = {};
    for (const k of [...PLATES, 'mask']) { this.cv[k] = createCanvas(W, H); this.cx[k] = this.cv[k].getContext('2d'); }
  }
  begin(box = [0, 0, W, H]) {
    this.box = box.map(Math.round);
    for (const k of [...PLATES, 'mask']) { const c = this.cx[k]; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(...this.box); }
    return this;
  }
  transform(fn) { for (const k of [...PLATES, 'mask']) fn(this.cx[k]); }
  each(fn, keys = [...PLATES, 'mask']) { for (const k of keys) { const c = this.cx[k]; c.save(); fn(c, k); c.restore(); } }
  // knockout fill: listed plates get their tone, unlisted plates go to paper, mask set
  fill(path, tones, o = {}) {
    this.each((c, k) => {
      if (k === 'mask') { if (o.noMask) return; c.fillStyle = '#fff'; path(c); c.fill(o.rule || 'nonzero'); return; }
      const t = tones[k];
      if (o.over) { if (t === undefined) return; c.globalCompositeOperation = 'lighten'; }
      c.fillStyle = grey(t || 0); path(c); c.fill(o.rule || 'nonzero');
    });
  }
  // overprinting stroke (lighten) on listed plates; knock:true strokes paper on all plates
  stroke(path, tones, w, o = {}) {
    this.each((c, k) => {
      c.lineWidth = w; c.lineCap = o.cap || 'round'; c.lineJoin = 'round';
      if (k === 'mask') { c.strokeStyle = '#fff'; path(c); c.stroke(); return; }
      if (o.knock) { c.strokeStyle = '#000'; path(c); c.stroke(); return; }
      const t = tones[k]; if (t === undefined) return;
      c.globalCompositeOperation = 'lighten'; c.strokeStyle = grey(t); path(c); c.stroke();
    });
  }
  text(str, x, y, font, tones, o = {}) {
    this.each((c, k) => {
      c.font = font; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic'; if (o.ls) c.letterSpacing = o.ls + 'px';
      if (k === 'mask') { c.fillStyle = '#fff'; c.fillText(str, x, y); return; }
      if (o.knock) { c.fillStyle = '#000'; c.fillText(str, x, y); return; }
      const t = tones[k]; if (t === undefined) return;
      c.globalCompositeOperation = 'lighten'; c.fillStyle = grey(t); c.fillText(str, x, y);
    });
  }
  // screen + multiply into the sheet inside the mask (knocks back to paper there first)
  print(sheet, pitch, B, reg = 1) {
    const [bx, by, bw, bh] = this.box, x0 = Math.max(0, bx), y0 = Math.max(0, by), x1 = Math.min(W, bx + bw), y1 = Math.min(H, by + bh);
    if (x1 <= x0 || y1 <= y0) return;
    const w = x1 - x0, h = y1 - y0;
    const img = {}; for (const k of [...PLATES, 'mask']) img[k] = this.cx[k].getImageData(x0, y0, w, h).data;
    const v = B % 3, drop = DROP[v];
    const P = PLATES.map((k, pi) => {
      const ink = INKS[k], a = (ink.angle * Math.PI) / 180, j = k === 'navy' ? [0, 0] : JIT[v];
      return { pi, data: img[k], c: Math.cos(a) / pitch, s: Math.sin(a) / pitch, dx: Math.round(ink.off[0] * reg + j[0]), dy: Math.round(ink.off[1] * reg + j[1]), fx: j[0] % 1, kc: PAPER.map((pp, ci) => 1 - ink.rgb[ci] / pp) };
    });
    const R20 = new Float32Array(21), INV = new Uint8Array(21);
    for (let q = 0; q <= 20; q++) { const t = q / 20; INV[q] = t > 0.5 ? 1 : 0; R20[q] = t <= 0.5 ? Math.sqrt(t / Math.PI) : Math.sqrt((1 - t) / Math.PI); }
    const mask = img.mask, rgb = sheet.rgb;
    const cov = new Float32Array(3);
    for (let yy = 0; yy < h; yy++) {
      const y = y0 + yy;
      for (let xx = 0; xx < w; xx++) {
        const mi = (yy * w + xx) * 4, m = mask[mi] / 255; if (m <= 0) continue;
        const x = x0 + xx, gi = y * W + x, dr = drop[gi];
        for (let p = 0; p < 3; p++) {
          const Q = P[p];
          const sx = xx - Q.dx, sy = yy - Q.dy;           // plate printed off register
          let tone = 0; if (sx >= 0 && sy >= 0 && sx < w && sy < h) tone = Q.data[(sy * w + sx) * 4];
          if (tone < 7 || dr === p + 1) { cov[p] = 0; continue; }
          const q = Math.round((tone / 255) * 20);
          if (q >= 20) { cov[p] = 1; continue; }
          const u = (x + Q.fx) * Q.c + y * Q.s, vv = -(x + Q.fx) * Q.s + y * Q.c;
          let fu = u - Math.floor(u) - 0.5, fv = vv - Math.floor(vv) - 0.5;
          if (!INV[q]) cov[p] = clamp01((R20[q] - Math.sqrt(fu * fu + fv * fv)) * pitch + 0.5);
          else { const au = 0.5 - Math.abs(fu), av = 0.5 - Math.abs(fv); cov[p] = clamp01((Math.sqrt(au * au + av * av) - R20[q]) * pitch + 0.5); }
        }
        const pi3 = gi * 3;
        for (let ch = 0; ch < 3; ch++) {
          let val = PAPERBUF[pi3 + ch];
          for (let p = 0; p < 3; p++) if (cov[p] > 0) val *= 1 - cov[p] * P[p].kc[ch];
          rgb[pi3 + ch] = rgb[pi3 + ch] * (1 - m) + val * m;
        }
      }
    }
  }
}
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
function grey(t) { const v = Math.round(Math.max(0, Math.min(1, t)) * 255); return `rgb(${v},${v},${v})`; }

// ---------------------------------------------------------------- hand-made marks (wobble on the boil)
export function wob(seed, B, amt = 1.2) { const R = rng(seed * 7919 + (B % 3) * 104729); return () => (R() - 0.5) * 2 * amt; }
export function roughRect(x, y, w, h, r, seed, B, amt = 1.4) {
  const j = wob(seed, B, amt);
  return (c) => { c.beginPath(); c.roundRect(x + j(), y + j(), w + j(), h + j(), r); };
}
export function roughPoly(pts, seed, B, amt = 1.4, closed = true) {
  const j = wob(seed, B, amt);
  return (c) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + j(), y + j()) : c.moveTo(x + j(), y + j()))); if (closed) c.closePath(); };
}
// rim: a rough ribbon plus a thinner second pass that doesn't agree with the first
export function rim(L, path2, tones, w, seed, B) {
  L.stroke(path2(seed, 1.6), tones, w); L.stroke(path2(seed + 3, 2.2), tones, Math.max(1.5, w * 0.45));
}
