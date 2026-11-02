// Original procedural score + foley for production 30 s #01 (Living Screencast sound palette), mixed under the narration.
// Everything is synthesised here from oscillators/noise (no samples, no third-party audio) → no licensing constraints.
// Output: build/audio/mix.wav (48 kHz stereo, two-pass EBU R128 loudnorm to -15 LUFS / -1.5 dBTP) + stems for QA.
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

// ------------------------------------------------------------------ extra voices for the screencast palette
function piano(freq, dur = 1.6, vel = 1) { // additive piano-like tone: hammer transient + decaying partials
  const o = buf(dur), parts = [[1, 1, 2.2], [2, 0.42, 3.4], [3, 0.2, 5], [4, 0.1, 7], [5.02, 0.05, 9]];
  for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * freq * r * t + r * 0.3) * Math.exp(-t * d); o[i] = v * Math.min(1, t * 700) * 0.42 * vel; }
  const h = noiseBurst(0.02, 3000, 0.7, 260); for (let i = 0; i < h.length; i++) o[i] += h[i] * 0.05 * vel;
  return o;
}
function square(freq, dur = 0.12, duty = 0.25, slide = 1) { // chiptune pulse voice (the mascot)
  const o = buf(dur); let ph = 0;
  for (let i = 0; i < o.length; i++) { const u = i / o.length, f = freq * Math.pow(slide, u); ph = (ph + f / SR) % 1; o[i] = (ph < duty ? 1 : -1) * Math.min(1, i / 60) * Math.min(1, (o.length - i) / 200); }
  return biquad(o, "lp", 6000);
}
const arp = (notes, step = 0.045, dur = 0.08) => { const o = buf(notes.length * step + dur); notes.forEach((m, k) => mixInto(o, square(mtof(m), dur), 0.8, k * step)); return o; };
function keyThock() { const o = mixInto(knock(180 + rnd() * 40, 45, 0.06), click(2500, 400, 0.02), 0.5); return o; }

// ------------------------------------------------------------------ score: 100 BPM (beat 0.6 s), F major, quiet
const B = 0.6;
const PROG = [ // [t0, t1, chord (midi), bass]
  [0.0, 2.4, [53, 57, 60, 64], 41], [2.4, 4.8, [50, 53, 57, 60, 64], 38], [4.8, 7.2, [46, 50, 53, 57], 34], [7.2, 9.6, [48, 52, 55, 57], 36],
  [9.6, 12.0, [53, 57, 60, 64], 41], [12.0, 14.4, [45, 48, 52, 55], 33], [14.4, 16.8, [46, 50, 53, 57], 34], [16.8, 19.55, [48, 52, 55, 58], 36],
  // 19.55–21.05: drop to room tone before the key promise (typing only)
  [26.0, 27.2, [53, 57, 60, 64], 41], [27.2, 28.2, [46, 50, 53, 57], 34], [28.2, 28.8, [48, 52, 55, 58], 36],
];
for (const [t0, t1, ch, bass] of PROG) {
  // piano comping: chord on 1, broken notes on the "and"s
  for (let t = t0, k = 0; t < t1 - 0.01; t += B, k++) {
    if (k % 2 === 0) ch.forEach((m, j) => add(music, t + j * 0.012, piano(mtof(m + 12), 1.4, 0.55), 0.09, j % 2 ? 0.2 : -0.2));
    else add(music, t + B / 2, piano(mtof(ch[(k * 2) % ch.length] + 24), 0.9, 0.5), 0.07, 0.3);
  }
  for (let t = t0; t < t1 - 0.01; t += B * 2) { add(music, t, pluckBass(mtof(bass)), 0.36, 0); add(music, t + B * 1.5, pluckBass(mtof(bass + 7)), 0.2, 0); }
  // brushes: swish on 2 & 4, light tap on the off-beats
  for (let t = t0 + B; t < t1 - 0.01; t += B * 2) add(music, t, sweep(0.22, 2500, 7000, 0.7, (u) => Math.sin(Math.PI * u)), 0.05, 0.25);
  for (let t = t0 + B / 2; t < t1 - 0.01; t += B) add(music, t, biquad(noiseBurst(0.04, 6000, 0.8, 90), "hp", 4000), 0.035, -0.2);
}
// held pads: under the honest-claim line (no drums) and a single pad under the spotlight freeze
add(music, 21.05, pad([50, 57, 62, 65].map(mtof), 3.4, 1300, 0.4, 0.6), 0.035, 0);
add(music, 24.4, pad([53, 60, 65, 67, 72].map(mtof), 1.8, 1800, 0.3, 0.5), 0.045, 0);
// resolve on F (add9) + glockenspiel
add(music, 28.8, pad([41, 53, 60, 65, 67, 72].map(mtof), 1.2, 2000, 0.02, 0.9), 0.05, 0);
add(music, 28.8, pluckBass(mtof(41), 0.9), 0.4, 0);
[77, 81, 84, 89].forEach((m, i) => add(music, 28.8 + i * 0.07, bell(mtof(m), 1.0, 0.6), 0.06, i % 2 ? 0.3 : -0.3));
// glockenspiel accents on key words (hi-fi layer)
for (const [t, m] of [[3.32, 84], [8.94, 81], [12.99, 84], [17.63, 86], [28.26, 89]]) add(music, t, bell(mtof(m), 0.9, 0.5), 0.05, 0.25);

// ------------------------------------------------------------------ foley + 8-bit mascot (cue sheet in timeline.js)
const HOP = [72, 74, 76, 77, 79, 81, 84]; // karaoke-ball notes (C D E F G A C)
function synth(c) {
  switch (c.type) {
    case "drag": return sweep(c.dur, 900, 1400, 0.6, (u) => Math.min(1, u * 8) * Math.min(1, (1 - u) * 8)).map((v) => v * 0.4);
    case "drop": return mixInto(knock(150, 30, 0.2), noiseBurst(0.05, 1200, 0.9, 80), 0.5);
    case "click": return mixInto(click(3000, 700, 0.012), knock(1800, 120, 0.03), 0.5);
    case "swish": return sweep(c.dur, 500, 4200, 0.9, (u) => Math.sin(Math.PI * u) ** 2);
    case "pop": return mixInto(glide(0.08, 600, 1200, { curve: 0.4, rel: 0.02 }), noiseBurst(0.03, 2500, 1.0, 120), 0.5);
    case "sparkle": { const o = buf(0.8); [88, 91, 96].forEach((m, k) => mixInto(o, bell(mtof(m), 0.5, 0.4), 0.45, k * 0.06)); return o; }
    case "chime": return mixInto(bell(mtof(84), 1.0, 0.7), bell(mtof(88), 0.9, 0.6), 0.7, 0.09);
    case "tick": return mixInto(bell(c.freq, 0.35, 0.4), click(5000, 900, 0.01), 0.3);
    case "keys": return mixInto(keyThock(), keyThock(), 1, 0.11);
    case "typing": { const o = buf(c.dur + 0.1); for (let k = 0; k < c.n; k++) mixInto(o, keyThock(), 0.8 + rnd() * 0.3, (k / c.n) * c.dur + rnd() * 0.012); return o; }
    case "link": return mixInto(sweep(c.dur, 1200, 3500, 2.2), bell(mtof(88), 0.5, 0.4), 0.3, c.dur * 0.8);
    case "strike": return sweep(0.25, 1800, 900, 3.0, (u) => Math.min(1, u * 10) * (1 - u));
    case "wipe": { const o = buf(c.dur + 0.1); for (let k = 0; k < 8; k++) mixInto(o, square(mtof(60 + k * 2), 0.05, 0.5), 0.35, k * c.dur / 8); return o; }
    case "rain": { const o = buf(c.dur); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.min(1, i / (0.6 * SR)) * Math.min(1, (o.length - i) / (0.8 * SR)); biquad(o, "bp", 2400, 0.5); for (let k = 0; k < c.dur * 9; k++) mixInto(o, click(3500, 900, 0.006), 0.3 * rnd(), rnd() * c.dur); return o; }
    case "stick": return mixInto(knock(420, 40, 0.1), arp([76, 83], 0.05, 0.07), 0.25);
    // 8-bit mascot voice
    case "jump8": return square(mtof(67), 0.14, 0.25, 2.0);
    case "land8": return mixInto(square(mtof(55), 0.07, 0.5, 0.6), noiseBurst(0.04, 900, 0.8, 90), 0.3);
    case "blip8": return square(c.freq, 0.09, 0.25);
    case "pickup8": return arp([72, 76, 79, 84]);
    case "note8": return square(mtof(HOP[c.n % HOP.length]), 0.1, 0.25);
    case "alert8": return mixInto(square(mtof(81), 0.08, 0.5), square(mtof(81), 0.08, 0.5), 1, 0.11);
    case "stomp8": return mixInto(square(mtof(43), 0.12, 0.5, 0.7), noiseBurst(0.06, 600, 0.7, 50), 0.5);
    case "cheer8": return arp([72, 76, 79, 84, 88], 0.05, 0.1);
  }
  throw new Error("unknown sfx " + c.type);
}
for (const c of SFX) add(sfx, c.t, synth(c), c.gain, c.pan ?? 0);
// snore (sleep at the end): two soft low square notes
add(sfx, 29.1, square(mtof(48), 0.35, 0.5, 0.9).map((v) => v * 0.5), 0.07, 0.1);
add(sfx, 29.6, square(mtof(46), 0.35, 0.5, 0.9).map((v) => v * 0.5), 0.06, 0.1);
// room tone (constant, very low) so the drop before the key promise is "room", not digital silence
{ const o = buf(DURATION); for (let i = 0; i < o.length; i++) o[i] = noise(); biquad(o, "lp", 500); add(sfx, 0, o, 0.012, 0); }

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

// ------------------------------------------------------------------ room reverb on music + SFX
function reverb(inL, inR, wet) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491], aps = [556, 441, 341];
  const run = (x, sp) => {
    const out = new Float32Array(x.length);
    for (const d0 of combs) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0, lp = 0; for (let i = 0; i < x.length; i++) { const y = bf[idx]; lp = y * 0.7 + lp * 0.3; bf[idx] = x[i] * 0.5 + lp * 0.7; idx = (idx + 1) % d; out[i] += y / combs.length; } }
    for (const d0 of aps) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0; for (let i = 0; i < out.length; i++) { const bo = bf[idx], y = -out[i] + bo; bf[idx] = out[i] + bo * 0.5; idx = (idx + 1) % d; out[i] = y; } }
    return out;
  };
  return [run(inL, 0), run(inR, 23)].map((r, c) => { const dry = c ? inR : inL, o = new Float32Array(dry.length); for (let i = 0; i < dry.length; i++) o[i] = dry[i] + r[i] * wet; return o; });
}
// ------------------------------------------------------------------ mix: voice up front; duck music −9 dB, SFX −4 dB under speech
const duck = new Float32Array(N);
{ let e = 0; const att = Math.exp(-1 / (0.025 * SR)), rel = Math.exp(-1 / (0.3 * SR)); for (let i = 0; i < N; i++) { const a = Math.abs(voice[i]) > 0.015 ? 1 : 0; e = a > e ? a + (e - a) * att : a + (e - a) * rel; duck[i] = e; } }
const [mL, mR] = reverb(music[0], music[1], 0.2), [sL, sR] = reverb(sfx[0], sfx[1], 0.1);
const out = bus();
for (let i = 0; i < N; i++) {
  const md = 1 - 0.65 * duck[i], sd = 1 - 0.37 * duck[i], fo = Math.min(1, (N - i) / (0.5 * SR)), v = voice[i] * 1.4;
  out[0][i] = (mL[i] * md * 0.8 + sL[i] * sd + v) * fo;
  out[1][i] = (mR[i] * md * 0.8 + sR[i] * sd + v) * fo;
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
const p1 = spawnSync("ffmpeg", ["-hide_banner", "-i", "build/audio/mix_raw.wav", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const j = JSON.parse(p1.slice(p1.lastIndexOf("{"), p1.lastIndexOf("}") + 1));
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", "build/audio/mix_raw.wav", "-af",
  `loudnorm=I=-15:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`,
  "-t", String(DURATION), "-c:a", "pcm_s16le", "-ar", "48000", "build/audio/mix.wav"]);
console.log("loudnorm pass1", JSON.stringify({ input_i: j.input_i, input_tp: j.input_tp, lra: j.input_lra }));
console.log("wrote build/audio/mix.wav");
