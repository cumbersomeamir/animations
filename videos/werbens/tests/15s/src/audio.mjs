// Original procedural soundtrack + SFX for the 15 s test, mixed with the Kokoro narration.
// Everything is synthesised here (no samples, no third-party audio) → no licensing constraints.
// Output: build/audio/mix.wav (48 kHz stereo, loudness-normalised to -14 LUFS / -1.5 dBTP via ffmpeg loudnorm, 2 pass)
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { SFX, DURATION, T } from "./timeline.js";

const SR = 48000;
const N = Math.round(DURATION * SR);
const music = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];
const voice = new Float32Array(N);
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function add(bus, t0, buf, gain = 1, pan = 0) {
  const s0 = Math.round(t0 * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4), gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < buf.length; i++) {
    const j = s0 + i; if (j < 0 || j >= N) continue;
    bus[0][j] += buf[i] * gl; bus[1][j] += buf[i] * gr;
  }
}
function env(n, a, d, sustain = 0, rel = 0) { // a,d,rel in seconds; exponential decay after attack
  const e = new Float32Array(n), A = a * SR, D = d * SR;
  for (let i = 0; i < n; i++) e[i] = i < A ? i / A : Math.exp(-(i - A) / D) * (1 - sustain) + sustain;
  if (rel > 0) { const R = rel * SR; for (let i = Math.max(0, n - R); i < n; i++) e[i] *= (n - i) / R; }
  return e;
}
// simple biquad
function biquad(buf, type, f, q = 0.707) {
  const w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2, a0, a1, a2;
  if (type === "lp") { b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = b0; }
  else if (type === "hp") { b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = b0; }
  else { b0 = al; b1 = 0; b2 = -al; }
  a0 = 1 + al; a1 = -2 * cs; a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < buf.length; i++) {
    const x = buf[i];
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y; buf[i] = y;
  }
  return buf;
}
// time-varying band-pass noise sweep (whoosh)
function sweep(dur, f0, f1, q = 1.2, shape = (u) => Math.sin(Math.PI * u) ** 1.5) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const u = i / n, f = f0 * Math.pow(f1 / f0, u);
    const w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
    const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
    const x = noise();
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y * shape(u) * 2.2;
  }
  return out;
}
function bell(freq, dur = 1.2, bright = 1) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  const parts = [[1, 1, 1], [2.76, 0.45 * bright, 1.8], [5.4, 0.22 * bright, 3], [8.9, 0.1 * bright, 4.5]];
  for (let i = 0; i < n; i++) {
    const t = i / SR; let v = 0;
    for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * freq * r * t) * Math.exp((-t * d * 3) / dur);
    out[i] = v * Math.min(1, t * 400) * 0.5;
  }
  return out;
}
function fmPluck(freq, dur = 0.45, idx = 2.2) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR, e = Math.exp(-t * 7);
    const m = Math.sin(2 * Math.PI * freq * 2 * t) * idx * Math.exp(-t * 14);
    out[i] = Math.sin(2 * Math.PI * freq * t + m) * e * Math.min(1, t * 300);
  }
  return out;
}
function padNote(freq, dur, cut = 1800, att = 0.4, rel = 0.8) {
  const n = Math.round(dur * SR), out = new Float32Array(n);
  const det = [-0.006, 0, 0.0065];
  const H = 9;
  const amps = []; for (let k = 1; k <= H; k++) amps.push((1 / k) * Math.exp(-(k * freq) / cut));
  for (let i = 0; i < n; i++) {
    const t = i / SR; let v = 0;
    for (const d of det) { const f = freq * (1 + d); for (let k = 1; k <= H; k++) v += amps[k - 1] * Math.sin(2 * Math.PI * f * k * t + k * d * 40); }
    const e = Math.min(1, t / att) * Math.min(1, (dur - t) / rel);
    out[i] = (v / 3) * e * (1 + 0.08 * Math.sin(2 * Math.PI * 0.3 * t));
  }
  return out;
}
function kick(gain = 1) {
  const n = Math.round(0.35 * SR), out = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; const f = 45 + 80 * Math.exp(-t * 28); ph += (2 * Math.PI * f) / SR; out[i] = Math.sin(ph) * Math.exp(-t * 9) * gain; }
  return out;
}
function hat(dur = 0.05) { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.exp((-i / SR) * 70); return biquad(o, "hp", 7000); }
function sub(dur = 0.8, f = 50) { const n = Math.round(dur * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * (f + 30 * Math.exp(-t * 10)) * t) * Math.exp(-t * 4) * Math.min(1, t * 200); } return o; }
function click() { const n = Math.round(0.012 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = noise() * Math.exp((-i / SR) * 600); return biquad(o, "hp", 2500); }
function pop(freq) { const n = Math.round(0.12 * SR), o = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * freq * (1 + 0.7 * Math.exp(-t * 60)) * t) * Math.exp(-t * 30); } return o; }

// ------------------------------------------------------------------ music (120 BPM; 1 beat = 0.5 s)
const B = 0.5;
const CH = [
  { t0: 0.0, t1: 2.5, notes: [50, 57, 62, 64, 69], root: 38 },   // Dadd9 (tunnel build)
  { t0: 2.5, t1: 4.5, notes: [47, 54, 59, 62, 66], root: 35 },   // Bm7
  { t0: 4.5, t1: 6.5, notes: [43, 50, 54, 59, 62], root: 31 },   // Gmaj7
  { t0: 6.5, t1: 8.5, notes: [50, 57, 61, 64, 66], root: 38 },   // Dmaj7(add6)
  { t0: 8.5, t1: 10.5, notes: [45, 52, 57, 61, 64], root: 33 },  // A
  { t0: 10.5, t1: 12.0, notes: [47, 54, 59, 62, 64], root: 35 }, // Bm(add11) build
  { t0: 12.0, t1: 15.0, notes: [50, 57, 62, 66, 69, 76], root: 38 }, // D (resolve on the icon hit)
];
for (const c of CH) {
  const dur = c.t1 - c.t0 + 0.6;
  const cut = c.t0 < 2.5 ? 900 : c.t0 >= 12 ? 2600 : 1700;
  c.notes.forEach((m, k) => add(music, c.t0, padNote(mtof(m), dur, cut, c.t0 === 0 ? 1.2 : 0.25, 0.5), 0.045, (k % 2 ? 0.3 : -0.3)));
  // bass
  if (c.t0 >= 2.5) {
    for (let b = c.t0; b < c.t1 - 0.01; b += B * 2) add(music, b, (() => { const n = Math.round(0.9 * SR), o = new Float32Array(n); const f = mtof(c.root + 12); for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 2.2) * Math.min(1, t * 120); } return o; })(), 0.32, 0);
  }
  // arpeggio (16ths in shot 1 for urgency, 8ths later)
  const step = c.t0 < 2.5 ? B / 4 : B / 2;
  let k = 0;
  for (let t = c.t0; t < c.t1 - 0.01 && t < 14.2; t += step, k++) {
    const pattern = [0, 2, 1, 3, 2, 4, 3, 1];
    const m = c.notes[pattern[k % pattern.length] % c.notes.length] + 12;
    const g = c.t0 < 2.5 ? 0.06 + 0.1 * (t / 2.5) : c.t0 >= 12 ? 0.09 * Math.max(0, 1 - (t - 12) / 2.4) : 0.11;
    add(music, t, fmPluck(mtof(m), 0.5, c.t0 < 2.5 ? 1.4 : 2.2), g, k % 2 ? 0.45 : -0.45);
  }
}
// drums: soft kick + hats from shot 2; build fill before the hit
for (let t = 2.5; t < 11.9; t += B) {
  add(music, t, kick(), t < 6.5 ? 0.5 : 0.6, 0);
  add(music, t + B / 2, hat(), 0.12, 0.25);
  if (t >= 6.5) add(music, t + B / 4, hat(0.03), 0.06, -0.3);
}
// build: rising noise into the hit, gap, then hit
add(music, 10.5, sweep(1.4, 400, 6000, 0.9, (u) => u ** 2), 0.18, 0);
for (let i = 0; i < 6; i++) add(music, 11.3 + i * 0.1, kick(0.6), 0.25 + i * 0.05, 0);

// ------------------------------------------------------------------ SFX from the shared cue sheet
function synth(c) {
  switch (c.type) {
    case "rush": { const a = sweep(c.dur, 180, 2400, 0.7, (u) => Math.min(1, u * 6) * (1 - u) ** 0.6); return a; }
    case "passby": return sweep(0.32, 2600, 500, 2.0);
    case "ignite": { const b = bell(c.freq, 1.1, 1.3); const s = sweep(0.25, 3000, 9000, 3); for (let i = 0; i < s.length; i++) b[i] += s[i] * 0.3; return b; }
    case "whoosh": return sweep(c.dur, c.f0, c.f1, 1.1);
    case "dock": { const b = bell(c.freq, 0.9, 0.9); const k = click(); for (let i = 0; i < k.length; i++) b[i] += k[i] * 0.8; return b; }
    case "pulse": { const s = sub(1.0, 48); const w = sweep(0.6, 300, 1200, 1.5); for (let i = 0; i < w.length; i++) s[i] += w[i] * 0.25; return s; }
    case "pop": return pop(c.freq);
    case "tick": { const b = fmPluck(c.freq, 0.35, 1.0); const k = click(); for (let i = 0; i < k.length; i++) b[i] += k[i] * 0.5; return b; }
    case "swell": return sweep(c.dur, 200, 3000, 0.8, (u) => Math.sin(Math.PI * Math.min(1, u * 1.1)) ** 2);
    case "shimmer": {
      const n = Math.round(c.dur * SR), o = new Float32Array(n);
      for (let g = 0; g < 26; g++) { const t0 = rnd() * c.dur * 0.9; const b = bell(mtof(86 + Math.floor(rnd() * 10)), 0.5, 0.6); const s0 = Math.round(t0 * SR); for (let i = 0; i < b.length && s0 + i < n; i++) o[s0 + i] += b[i] * 0.35 * (1 - t0 / c.dur); }
      return o;
    }
    case "spin": { const w = sweep(c.dur, 500, 2500, 1.4); for (let i = 0; i < w.length; i++) w[i] *= 0.6 + 0.4 * Math.sin(2 * Math.PI * (6 + 10 * i / w.length) * (i / SR)); return w; }
    case "hit": {
      const s = sub(1.6, 42), n = s.length;
      for (const m of [62, 69, 74, 78]) { const b = bell(mtof(m), 1.6, 1); for (let i = 0; i < Math.min(n, b.length); i++) s[i] += b[i] * 0.24; }
      const nb = biquad(Float32Array.from({ length: Math.round(0.25 * SR) }, (_, i) => noise() * Math.exp((-i / SR) * 18)), "lp", 5000);
      for (let i = 0; i < nb.length; i++) s[i] += nb[i] * 0.6;
      return s;
    }
    case "sparkle": { const n = Math.round(0.9 * SR), o = new Float32Array(n); [88, 93, 95, 100].forEach((m, k) => { const b = bell(mtof(m), 0.6, 0.5); const s0 = Math.round(k * 0.07 * SR); for (let i = 0; i < b.length && s0 + i < n; i++) o[s0 + i] += b[i] * 0.5; }); return o; }
  }
  throw new Error("unknown sfx " + c.type);
}
for (const c of SFX) add(sfx, c.t, synth(c), c.gain, c.pan ?? 0);

// ------------------------------------------------------------------ narration (24 kHz → 48 kHz)
const man = JSON.parse(fs.readFileSync("build/narration/manifest.json", "utf8"));
for (const l of man.lines) {
  const b = fs.readFileSync(l.file); const sr = b.readUInt32LE(24); const n = (b.length - 44) / 2;
  const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768;
  const ratio = sr / SR, s0 = Math.round(l.start * SR), m = Math.floor(n / ratio);
  for (let i = 0; i < m; i++) {
    const p = i * ratio, i0 = Math.floor(p), fr = p - i0;
    const xm1 = x[i0 - 1] ?? 0, x0 = x[i0] ?? 0, x1 = x[i0 + 1] ?? 0, x2 = x[i0 + 2] ?? 0; // cubic (Catmull-Rom) resample
    const v = x0 + 0.5 * fr * (x1 - xm1 + fr * (2 * xm1 - 5 * x0 + 4 * x1 - x2 + fr * (3 * (x0 - x1) + x2 - xm1)));
    if (s0 + i < N) voice[s0 + i] += v;
  }
}
// gentle presence EQ on voice
biquad(voice, "hp", 90);

// ------------------------------------------------------------------ reverb (Freeverb-lite) on music+sfx send
function reverb(inL, inR, wet = 0.22) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
  const run = (x, spread) => {
    const out = new Float32Array(x.length);
    for (const d0 of combs) { const d = d0 + spread; const buf = new Float32Array(d); let idx = 0, lp = 0; for (let i = 0; i < x.length; i++) { const y = buf[idx]; lp = y * 0.75 + lp * 0.25; buf[idx] = x[i] * 0.5 + lp * 0.8; idx = (idx + 1) % d; out[i] += y / combs.length; } }
    for (const d0 of aps) { const d = d0 + spread; const buf = new Float32Array(d); let idx = 0; for (let i = 0; i < out.length; i++) { const bo = buf[idx]; const y = -out[i] + bo; buf[idx] = out[i] + bo * 0.5; idx = (idx + 1) % d; out[i] = y; } }
    return out;
  };
  return [run(inL, 0), run(inR, 23)].map((r, c) => { const dry = c ? inR : inL; const o = new Float32Array(dry.length); for (let i = 0; i < dry.length; i++) o[i] = dry[i] + r[i] * wet; return o; });
}

// ------------------------------------------------------------------ mix: duck music under voice, sum, soft-limit
const duck = new Float32Array(N);
{ let e = 0; const att = Math.exp(-1 / (0.03 * SR)), rel = Math.exp(-1 / (0.35 * SR)); for (let i = 0; i < N; i++) { const a = Math.abs(voice[i]) > 0.02 ? 1 : 0; e = a > e ? a + (e - a) * att : a + (e - a) * rel; duck[i] = 1 - 0.55 * e; } }
const [mL, mR] = reverb(music[0], music[1], 0.3);
const [sL, sR] = reverb(sfx[0], sfx[1], 0.18);
const out = [new Float32Array(N), new Float32Array(N)];
const fadeOut = (i) => Math.min(1, (N - i) / (0.45 * SR));
const fadeIn = (i) => Math.min(1, i / (0.01 * SR));
for (let i = 0; i < N; i++) {
  const v = voice[i] * 1.25;
  const sd = 1 - (1 - duck[i]) * 0.6; // SFX duck ≈ -3 dB under voice
  out[0][i] = (mL[i] * duck[i] * 0.9 + sL[i] * 0.85 * sd + v) * fadeOut(i) * fadeIn(i);
  out[1][i] = (mR[i] * duck[i] * 0.9 + sR[i] * 0.85 * sd + v) * fadeOut(i) * fadeIn(i);
}
let peak = 0; for (const ch of out) for (const v of ch) peak = Math.max(peak, Math.abs(v));
const pre = 0.9 / peak;
for (const ch of out) for (let i = 0; i < N; i++) { const v = ch[i] * pre; ch[i] = Math.tanh(v * 1.1) / Math.tanh(1.1); }

function writeWavF32(file, chans) {
  const n = chans[0].length, nc = chans.length, buf = Buffer.alloc(44 + n * nc * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * nc * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(3, 20); buf.writeUInt16LE(nc, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * nc * 4, 28);
  buf.writeUInt16LE(nc * 4, 32); buf.writeUInt16LE(32, 34); buf.write("data", 36); buf.writeUInt32LE(n * nc * 4, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) buf.writeFloatLE(chans[c][i], 44 + (i * nc + c) * 4);
  fs.writeFileSync(file, buf);
}
fs.mkdirSync("build/audio", { recursive: true });
writeWavF32("build/audio/mix_raw.wav", out);
// also export stems for QA
writeWavF32("build/audio/stem_voice.wav", [voice]);

// two-pass EBU R128 loudness normalisation
const pass1 = spawnSync("ffmpeg", ["-hide_banner", "-i", "build/audio/mix_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
const out1 = pass1.stderr;
const j = JSON.parse(out1.slice(out1.lastIndexOf("{"), out1.lastIndexOf("}") + 1));
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", "build/audio/mix_raw.wav", "-af",
  `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`,
  "-t", String(DURATION), "-c:a", "pcm_s16le", "-ar", "48000", "build/audio/mix.wav"]);
console.log("loudnorm pass1", JSON.stringify({ input_i: j.input_i, input_tp: j.input_tp }));
console.log("wrote build/audio/mix.wav");
