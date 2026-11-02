// Original procedural score + action-timed SFX for pilot 01, mixed under the host narration.
// Everything is synthesised here from oscillators/noise (no samples, no third-party audio) → no licensing constraints.
// Output: build/audio/mix.wav (48 kHz stereo, two-pass EBU R128 loudnorm to -14 LUFS / -1.5 dBTP) + stems for QA.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { SFX, DURATION, T } from "./timeline.js";

const SR = 48000, N = Math.round(DURATION * SR);
const bus = () => [new Float32Array(N), new Float32Array(N)];
const music = bus(), sfx = bus();
const voice = new Float32Array(N);
let seed = 20261102;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const buf = (dur) => new Float32Array(Math.max(1, Math.round(dur * SR)));

function add(b, t0, x, gain = 1, pan = 0) {
  const s0 = Math.round(t0 * SR), gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < x.length; i++) { const j = s0 + i; if (j < 0 || j >= N) continue; b[0][j] += x[i] * gl; b[1][j] += x[i] * gr; }
}
function biquad(x, type, f, q = 0.707) {
  const w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2; const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
  if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; } else if (type === "hp") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; } else { b0 = al; b1 = 0; b2 = -al; }
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = x[i], y = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = v; y2 = y1; y1 = y; x[i] = y; }
  return x;
}
// time-varying band-pass noise (whooshes, falls)
function sweep(dur, f0, f1, q = 1.2, shape = (u) => Math.sin(Math.PI * u) ** 1.5) {
  const o = buf(dur); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < o.length; i++) {
    const u = i / o.length, f = f0 * Math.pow(f1 / f0, u), w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
    const v = noise(), y = (al * v - al * x2 + 2 * cs * y1 - (1 - al) * y2) / (1 + al); // RBJ band-pass (0 dB peak)
    x2 = x1; x1 = v; y2 = y1; y1 = y; o[i] = y * shape(u) * 2.2;
  }
  return o;
}
// pitch glide (sine with optional vibrato)
function glide(dur, f0, f1, { vib = 0, vibF = 9, att = 0.005, rel = 0.05, curve = 1, harm = 0 } = {}) {
  const o = buf(dur); let ph = 0;
  for (let i = 0; i < o.length; i++) {
    const t = i / SR, u = i / o.length, f = f0 * Math.pow(f1 / f0, Math.pow(u, curve)) * (1 + vib * Math.sin(2 * Math.PI * vibF * t));
    ph += (2 * Math.PI * f) / SR;
    o[i] = (Math.sin(ph) + harm * Math.sin(2 * ph) * 0.5 + harm * Math.sin(3 * ph) * 0.25) * Math.min(1, t / att) * Math.min(1, (dur - t) / rel);
  }
  return o;
}
function bell(freq, dur = 1.0, bright = 1) {
  const o = buf(dur), parts = [[1, 1, 1], [2.76, 0.42 * bright, 1.8], [5.4, 0.2 * bright, 3], [8.9, 0.08 * bright, 4.5]];
  for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * freq * r * t) * Math.exp((-t * d * 3) / dur); o[i] = v * Math.min(1, t * 400) * 0.5; }
  return o;
}
function marimba(freq, dur = 0.55) {
  const o = buf(dur);
  for (let i = 0; i < o.length; i++) {
    const t = i / SR, e = Math.exp(-t * 9);
    o[i] = (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 3.93 * t) * Math.exp(-t * 30) + 0.12 * Math.sin(2 * Math.PI * freq * 9.2 * t) * Math.exp(-t * 60)) * e * Math.min(1, t * 900);
  }
  return o;
}
function pluckBass(freq, dur = 0.7) { // upright-bass-like pluck
  const o = buf(dur);
  for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * freq * t) + 0.45 * Math.sin(4 * Math.PI * freq * t) * Math.exp(-t * 8) + 0.2 * Math.sin(6 * Math.PI * freq * t) * Math.exp(-t * 14)) * Math.exp(-t * 3.2) * Math.min(1, t * 250); }
  return biquad(o, "lp", 900);
}
function pad(freqs, dur, cut = 1400, att = 0.4, rel = 0.6) {
  const o = buf(dur);
  for (const f0 of freqs) for (const d of [-0.004, 0.004]) {
    const f = f0 * (1 + d), amps = [1, 0.5, 0.3, 0.18, 0.1].map((a, k) => a * Math.exp(-((k + 1) * f) / cut));
    for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (let k = 0; k < amps.length; k++) v += amps[k] * Math.sin(2 * Math.PI * f * (k + 1) * t + k * d * 50); o[i] += v; }
  }
  for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] *= Math.min(1, t / att) * Math.min(1, (dur - t) / rel) / (freqs.length * 2); }
  return o;
}
const click = (hp = 2500, dec = 600, dur = 0.015) => { const o = buf(dur); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.exp((-i / SR) * dec); return biquad(o, "hp", hp); };
const knock = (f, dec = 30, dur = 0.18) => { const o = buf(dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * f * (1 + 0.6 * Math.exp(-t * 80)) * t) * Math.exp(-t * dec); } return o; };
const noiseBurst = (dur, f, q, dec) => { const o = buf(dur); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.exp((-i / SR) * dec); return biquad(o, "bp", f, q); };
const mixInto = (a, b, g = 1, off = 0) => { const s = Math.round(off * SR); for (let i = 0; i < b.length && s + i < a.length; i++) a[s + i] += b[i] * g; return a; };

// ------------------------------------------------------------------ score (96 BPM, beat 0.625 s): curious pizzicato/marimba groove
const B = 0.625, E8 = B / 2;
const SECTIONS = [
  { t0: 0.0, t1: 2.5, ch: [50, 53, 57, 60], root: 38 },   // Dm7
  { t0: 2.5, t1: 5.0, ch: [46, 50, 53, 57], root: 34 },   // Bbmaj7
  { t0: 5.0, t1: 7.5, ch: [43, 46, 50, 53], root: 31 },   // Gm7
  { t0: 7.5, t1: 9.3, ch: [45, 49, 52, 55], root: 33 },   // A7 (tension into the reveal)
];
const MOTIF = [0, null, 2, 3, null, 2, 4, null]; // 8th-note pattern over chord tones (4 = octave)
for (const s of SECTIONS) {
  add(music, s.t0, pad(s.ch.map(mtof), s.t1 - s.t0 + 0.5, 1100, 0.3, 0.45), 0.05, 0);
  for (let t = s.t0, k = 0; t < s.t1 - 0.01; t += E8, k++) {
    const m = MOTIF[k % 8]; if (m === null) continue;
    const note = m === 4 ? s.ch[0] + 12 : s.ch[m];
    add(music, t, marimba(mtof(note + 12)), 0.16 * (k % 8 === 0 ? 1.15 : 1), (k % 2 ? 0.35 : -0.25));
  }
  for (let t = s.t0; t < s.t1 - 0.01; t += B * 2) { add(music, t, pluckBass(mtof(s.root)), 0.42, 0); add(music, t + B * 1.5, pluckBass(mtof(s.root + 7)), 0.26, 0); }
  for (let t = s.t0; t < s.t1 - 0.01; t += E8) add(music, t + 0.01, biquad(noiseBurst(0.06, 7000, 0.8, 70), "hp", 5000), 0.05 + 0.03 * ((Math.round(t / E8) % 2) === 1), 0.3); // brush
  for (let t = s.t0 + B; t < s.t1 - 0.01; t += B * 2) add(music, t, mixInto(click(1500, 160, 0.06), knock(1800, 60, 0.05), 0.4), 0.16, -0.2); // finger snap on 2 & 4
}
// S4: the groove stops when the lamp clicks on — suspended pad under the hum, resolves on the "=" ding
add(music, 9.3, pad([50, 57, 62, 64].map(mtof), 2.5, 1600, 0.05, 0.5), 0.04, 0);
add(music, T.equal, pad([53, 57, 62, 65, 69].map(mtof), 1.6, 2000, 0.02, 0.8), 0.045, 0);
// S5: brighter major groove → resolved ending
const END = [
  { t0: 11.6, t1: 12.85, ch: [53, 57, 60, 64], root: 41 }, // Fmaj7
  { t0: 12.85, t1: 13.9, ch: [46, 50, 53, 57], root: 34 }, // Bbmaj7
  { t0: 13.9, t1: 14.3, ch: [48, 52, 55, 58], root: 36 },  // C7
];
for (const s of END) {
  add(music, s.t0, pad(s.ch.map(mtof), s.t1 - s.t0 + 0.4, 1500, 0.08, 0.35), 0.05, 0);
  for (let t = s.t0, k = 0; t < s.t1 - 0.01; t += E8, k++) { const m = [0, 2, 3, 4][k % 4]; add(music, t, marimba(mtof((m === 4 ? s.ch[0] + 12 : s.ch[m]) + 12)), 0.15, k % 2 ? 0.3 : -0.3); }
  add(music, s.t0, pluckBass(mtof(s.root)), 0.42, 0);
  for (let t = s.t0; t < s.t1 - 0.01; t += E8) add(music, t + 0.01, biquad(noiseBurst(0.06, 7000, 0.8, 70), "hp", 5000), 0.05, 0.3);
}
add(music, 14.3, pad([53, 57, 60, 67, 72].map(mtof), 0.7, 2200, 0.01, 0.55), 0.06, 0); // Fadd9 resolve
add(music, 14.3, pluckBass(mtof(41), 0.7), 0.45, 0);
[65, 69, 72, 77].forEach((m, i) => add(music, 14.3 + i * 0.045, marimba(mtof(m + 12), 0.6), 0.13, i % 2 ? 0.3 : -0.3));

// ------------------------------------------------------------------ SFX (cue sheet in timeline.js)
function synth(c) {
  switch (c.type) {
    case "fall": return glide(c.dur, 1500, 700, { vib: 0.004, harm: 0.15 }).map((v) => v * 0.35);
    case "tap": return mixInto(knock(240, 38, 0.16), biquad(noiseBurst(0.06, 1800, 1.2, 70), "lp", 4000), 0.6);
    case "thud": {
      const o = buf(0.9); let ph = 0;
      for (let i = 0; i < o.length; i++) { const t = i / SR, f = 46 + 70 * Math.exp(-t * 22); ph += (2 * Math.PI * f) / SR; o[i] = Math.sin(ph) * Math.exp(-t * 6) * Math.min(1, t * 600); }
      return mixInto(mixInto(o, biquad(noiseBurst(0.25, 400, 0.8, 18), "lp", 900), 1.4), knock(120, 25, 0.25), 0.7);
    }
    case "rattle": { const o = buf(0.45); for (let k = 0; k < 7; k++) mixInto(o, knock(900 + rnd() * 900, 70, 0.06), 0.4 * (1 - k / 7), 0.04 + k * 0.05 + rnd() * 0.02); return o; }
    case "squint": return glide(0.22, 950, 1350, { vib: 0.03, vibF: 22, harm: 0.3 }).map((v) => v * 0.5);
    case "point": return mixInto(glide(0.12, 600, 1300, { curve: 0.5 }), click(3000), 0.6);
    case "cut": return sweep(0.22, 2500, 900, 1.6);
    case "whoopUp": return mixInto(glide(0.32, 500, 1600, { curve: 0.6, harm: 0.2 }).map((v) => v * 0.55), sweep(0.3, 600, 3000, 1.4), 0.5);
    case "bubble": return glide(0.14, c.freq, c.freq * 1.9, { curve: 0.4, rel: 0.03 });
    case "pop": return mixInto(glide(0.09, 700, 1400, { curve: 0.3, rel: 0.02 }), noiseBurst(0.05, 2500, 1.0, 90), 0.8);
    case "strain": {
      const o = buf(c.dur); let ph = 0;
      for (let i = 0; i < o.length; i++) { const t = i / SR, f = 72 + 10 * Math.sin(t * 31) + 6 * noise(); ph += (2 * Math.PI * f) / SR; o[i] = ((ph / Math.PI) % 2 - 1) * Math.sin(Math.PI * t / c.dur); }
      return biquad(biquad(o, "lp", 700), "hp", 60);
    }
    case "tag": return mixInto(bell(c.freq, 0.5, 0.6), click(4000), 0.4);
    case "inflate": { const o = glide(c.dur, 280, 760, { vib: 0.05, vibF: 13, curve: 0.8, harm: 0.25 }); return mixInto(o.map((v) => v * 0.6), sweep(c.dur, 300, 1500, 2), 0.3); }
    case "sparkle": { const o = buf(0.9); [88, 93, 95, 100].forEach((m, k) => mixInto(o, bell(mtof(m), 0.6, 0.5), 0.5, k * 0.07)); return o; }
    case "lidPop": return mixInto(mixInto(glide(0.08, c.freq * 0.5, c.freq, { curve: 0.4, rel: 0.02 }), noiseBurst(0.04, 3000, 0.9, 120), 0.9), bell(c.freq * 1.5, 0.4, 0.4), 0.3, 0.03);
    case "crunch": {
      const o = buf(0.42);
      for (let k = 0; k < 14; k++) { const at = k < 3 ? k * 0.012 : 0.04 + rnd() * 0.3; mixInto(o, noiseBurst(0.035 + rnd() * 0.03, 1800 + rnd() * 3200, 1.2, 60 + rnd() * 90), (k < 3 ? 1.1 : 0.55) * (1 - at / 0.45), at); }
      return mixInto(o, knock(260, 50, 0.08), 0.5);
    }
    case "delight": { const o = buf(1.1); [72, 76, 79, 83, 84, 88].forEach((m, k) => mixInto(o, bell(mtof(m), 0.7, 0.6), 0.42, k * 0.055)); return o; }
    case "meh": { // two-note falling "wah-wah" (muted brass-like, synthetic)
      const o = buf(0.62);
      [[0, 0.26, 311, 294], [0.28, 0.34, 277, 247]].forEach(([at, d, f0, f1]) => { const g = glide(d, f0, f1, { harm: 0.9, att: 0.02, rel: 0.08 }); const lp = biquad(g, "lp", 900, 1.5); mixInto(o, lp, 0.8, at); });
      return o;
    }
    case "whip": return sweep(c.dur, 600, 5000, 1.0, (u) => Math.sin(Math.PI * u) ** 2);
    case "clack": return mixInto(mixInto(click(1200, 250, 0.03), knock(1400, 90, 0.04), 0.8), mixInto(click(1500, 300, 0.03), knock(1100, 90, 0.04), 0.8), 0.9, 0.045);
    case "hum": {
      const o = buf(c.dur);
      for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * 120 * t) + 0.5 * Math.sin(2 * Math.PI * 240 * t) + 0.25 * Math.sin(2 * Math.PI * 360 * t) + 0.04 * noise()) * Math.min(1, t / 0.05) * Math.min(1, (c.dur - t) / 0.4); }
      return biquad(o, "lp", 1200);
    }
    case "ding": return mixInto(bell(mtof(79), 1.4, 1.1), bell(mtof(86), 1.2, 0.8), 0.45, 0.0);
    case "slide": return glide(c.dur, 1800, 900, { vib: 0.02, vibF: 30, harm: 0.2 }).map((v) => v * 0.45);
    case "link": { const o = buf(c.dur + 0.3); [76, 79, 83].forEach((m, k) => mixInto(o, bell(mtof(m), 0.45, 0.5), 0.45, k * 0.09)); return mixInto(o, sweep(c.dur, 800, 4000, 2.5), 0.2); }
    case "plop": return mixInto(mixInto(knock(180, 22, 0.2), noiseBurst(0.08, 900, 1.0, 50), 0.6), knock(700, 60, 0.07), 0.3, 0.06);
    case "check": return mixInto(bell(mtof(84), 0.8, 0.6), bell(mtof(91), 0.9, 0.6), 0.9, 0.11);
    case "wink": return mixInto(bell(mtof(96), 0.35, 0.3), click(6000), 0.3);
  }
  throw new Error("unknown sfx " + c.type);
}
for (const c of SFX) add(sfx, c.t, synth(c), c.gain, c.pan ?? 0);

// ------------------------------------------------------------------ narration (24 kHz → 48 kHz, cubic resample)
const man = JSON.parse(fs.readFileSync("build/narration/manifest.json", "utf8"));
for (const l of man.lines) {
  const b = fs.readFileSync(l.file), sr = b.readUInt32LE(24), n = (b.length - 44) / 2, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768;
  const ratio = sr / SR, s0 = Math.round(l.start * SR), m = Math.floor(n / ratio);
  for (let i = 0; i < m; i++) {
    const p = i * ratio, i0 = Math.floor(p), fr = p - i0, xm1 = x[i0 - 1] ?? 0, x0 = x[i0] ?? 0, x1 = x[i0 + 1] ?? 0, x2 = x[i0 + 2] ?? 0;
    const v = x0 + 0.5 * fr * (x1 - xm1 + fr * (2 * xm1 - 5 * x0 + 4 * x1 - x2 + fr * (3 * (x0 - x1) + x2 - xm1)));
    if (s0 + i < N) voice[s0 + i] += v;
  }
}
biquad(voice, "hp", 90);

// ------------------------------------------------------------------ small room reverb on music + SFX
function reverb(inL, inR, wet) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
  const run = (x, sp) => {
    const out = new Float32Array(x.length);
    for (const d0 of combs) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0, lp = 0; for (let i = 0; i < x.length; i++) { const y = bf[idx]; lp = y * 0.7 + lp * 0.3; bf[idx] = x[i] * 0.5 + lp * 0.72; idx = (idx + 1) % d; out[i] += y / combs.length; } }
    for (const d0 of aps) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0; for (let i = 0; i < out.length; i++) { const bo = bf[idx], y = -out[i] + bo; bf[idx] = out[i] + bo * 0.5; idx = (idx + 1) % d; out[i] = y; } }
    return out;
  };
  return [run(inL, 0), run(inR, 23)].map((r, c) => { const dry = c ? inR : inL, o = new Float32Array(dry.length); for (let i = 0; i < dry.length; i++) o[i] = dry[i] + r[i] * wet; return o; });
}
// ------------------------------------------------------------------ mix: duck music (−8 dB) and SFX (−3 dB) under the voice
const duck = new Float32Array(N);
{ let e = 0; const att = Math.exp(-1 / (0.025 * SR)), rel = Math.exp(-1 / (0.3 * SR)); for (let i = 0; i < N; i++) { const a = Math.abs(voice[i]) > 0.015 ? 1 : 0; e = a > e ? a + (e - a) * att : a + (e - a) * rel; duck[i] = e; } }
const [mL, mR] = reverb(music[0], music[1], 0.22), [sL, sR] = reverb(sfx[0], sfx[1], 0.12);
const out = bus();
for (let i = 0; i < N; i++) {
  const md = 1 - 0.6 * duck[i], sd = 1 - 0.3 * duck[i], fo = Math.min(1, (N - i) / (0.35 * SR)), v = voice[i] * 1.35;
  out[0][i] = (mL[i] * md * 0.85 + sL[i] * sd + v) * fo;
  out[1][i] = (mR[i] * md * 0.85 + sR[i] * sd + v) * fo;
}
let peak = 0; for (const ch of out) for (const v of ch) peak = Math.max(peak, Math.abs(v));
for (const ch of out) for (let i = 0; i < N; i++) ch[i] = Math.tanh((ch[i] / peak) * 0.95 * 1.1) / Math.tanh(1.1);

function writeWavF32(file, chans) {
  const n = chans[0].length, nc = chans.length, b = Buffer.alloc(44 + n * nc * 4);
  b.write("RIFF", 0); b.writeUInt32LE(36 + n * nc * 4, 4); b.write("WAVEfmt ", 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(nc, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * nc * 4, 28); b.writeUInt16LE(nc * 4, 32); b.writeUInt16LE(32, 34); b.write("data", 36); b.writeUInt32LE(n * nc * 4, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) b.writeFloatLE(chans[c][i], 44 + (i * nc + c) * 4);
  fs.writeFileSync(file, b);
}
fs.mkdirSync("build/audio", { recursive: true });
writeWavF32("build/audio/mix_raw.wav", out);
writeWavF32("build/audio/stem_voice.wav", [voice]);
writeWavF32("build/audio/stem_music.wav", [mL, mR]);
writeWavF32("build/audio/stem_sfx.wav", [sL, sR]);
const p1 = spawnSync("ffmpeg", ["-hide_banner", "-i", "build/audio/mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const j = JSON.parse(p1.slice(p1.lastIndexOf("{"), p1.lastIndexOf("}") + 1));
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", "build/audio/mix_raw.wav", "-af",
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`,
  "-t", String(DURATION), "-c:a", "pcm_s16le", "-ar", "48000", "build/audio/mix.wav"]);
console.log("loudnorm pass1", JSON.stringify({ input_i: j.input_i, input_tp: j.input_tp, lra: j.input_lra }));
console.log("wrote build/audio/mix.wav");
