// Original procedural score + foley for English-14 (accepted Satisfying Product Theatre audio recipe; English Meshline narration).
// Everything is synthesised here from oscillators/noise (no samples, no third-party audio) → no licensing constraints.
// Music is deliberately NON-looping: one held, slowly evolving pad chord per scene + a handful of piano notes tied to object
// events (landings, lift, hop, cut, tile). No beat grid, no hats, no arpeggio or bass pattern that repeats.
// Output: build/audio/mix.wav (48 kHz stereo, two-pass EBU R128 loudnorm to -15 LUFS / -2 dBTP so the AAC export stays ≤ -1.5 dBTP) + stems for QA.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { SFX, DURATION, T } from "./timeline.js";

const SR = 48000, N = Math.round(DURATION * SR);
const bus = () => [new Float32Array(N), new Float32Array(N)];
const music = bus(), sfx = bus();
const voice = new Float32Array(N);
let seed = 20261111;
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
// time-varying band-pass noise (air, slides, zips)
function sweep(dur, f0, f1, q = 1.2, shape = (u) => Math.sin(Math.PI * u) ** 1.5) {
  const o = buf(dur); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < o.length; i++) {
    const u = i / o.length, f = f0 * Math.pow(f1 / f0, u), w = (2 * Math.PI * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * q);
    const v = noise(), y = (al * v - al * x2 + 2 * cs * y1 - (1 - al) * y2) / (1 + al);
    x2 = x1; x1 = v; y2 = y1; y1 = y; o[i] = y * shape(u) * 2.2;
  }
  return o;
}
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
function piano(freq, dur = 2.2, vel = 1) { // additive piano-like tone: hammer transient + decaying partials
  const o = buf(dur), parts = [[1, 1, 1.6], [2, 0.38, 2.6], [3, 0.16, 4], [4, 0.07, 6], [5.02, 0.035, 8]];
  for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (const [r, a, d] of parts) v += a * Math.sin(2 * Math.PI * freq * r * t + r * 0.3) * Math.exp(-t * d); o[i] = v * Math.min(1, t * 600) * Math.min(1, (dur - t) / 0.2) * 0.42 * vel; }
  const h = noiseBurst(0.02, 2800, 0.7, 260); for (let i = 0; i < h.length; i++) o[i] += h[i] * 0.03 * vel;
  return o;
}
// slow pad: detuned additive voices, slow attack/release and a gentle low-pass that opens a little over the chord's life
function pad(freqs, dur, cut = 1300, att = 0.9, rel = 1.1) {
  const o = buf(dur);
  for (const f0 of freqs) for (const d of [-0.0035, 0.0035]) {
    const f = f0 * (1 + d), amps = [1, 0.42, 0.22, 0.1].map((a, k) => a * Math.exp(-((k + 1) * f) / cut));
    for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (let k = 0; k < amps.length; k++) v += amps[k] * Math.sin(2 * Math.PI * f * (k + 1) * t + k * d * 50); o[i] += v; }
  }
  for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] *= Math.min(1, t / att) * Math.min(1, Math.max(0, dur - t) / rel) * (0.9 + 0.1 * Math.sin(2 * Math.PI * 0.13 * t)) / (freqs.length * 2); }
  return o;
}
function softBass(freq, dur) { const o = buf(dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = (Math.sin(2 * Math.PI * freq * t) + 0.18 * Math.sin(4 * Math.PI * freq * t)) * Math.min(1, t / 0.25) * Math.min(1, Math.max(0, dur - t) / 0.8); } return o; }
const click = (hp = 2500, dec = 600, dur = 0.015) => { const o = buf(dur); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.exp((-i / SR) * dec); return biquad(o, "hp", hp); };
const knock = (f, dec = 30, dur = 0.18) => { const o = buf(dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = Math.sin(2 * Math.PI * f * (1 + 0.6 * Math.exp(-t * 80)) * t) * Math.exp(-t * dec); } return o; };
function noiseBurst(dur, f, q, dec) { const o = buf(dur); for (let i = 0; i < o.length; i++) o[i] = noise() * Math.exp((-i / SR) * dec); return biquad(o, "bp", f, q); }
const mixInto = (a, b, g = 1, off = 0) => { const s = Math.round(off * SR); for (let i = 0; i < b.length && s + i < a.length; i++) a[s + i] += b[i] * g; return a; };
function metal(freq, dur = 0.5, dec = 9) { // inharmonic coin partials
  const o = buf(dur), parts = [[1, 1], [2.41, 0.6], [4.13, 0.35], [6.27, 0.2]];
  for (let i = 0; i < o.length; i++) { const t = i / SR; let v = 0; for (const [r, a] of parts) v += a * Math.sin(2 * Math.PI * freq * r * t) * Math.exp(-t * dec * (0.7 + r * 0.3)); o[i] = v * Math.min(1, t * 2000) * 0.4; }
  return o;
}

// ------------------------------------------------------------------ score (accepted recipe: one held chord per scene, no grid)
const PADS = [ // [t0, t1, notes, root] — overlapping so chords crossfade; D major colour as accepted; one chord per story beat
  [0.0, 3.7, [62, 66, 69, 73], 50], [3.5, 6.3, [59, 62, 66, 71], 47], [6.1, 11.6, [55, 59, 62, 67], 43], [11.4, 15.2, [57, 61, 64, 69], 45],
  [15.0, 20.2, [59, 62, 66, 69], 47], [20.0, 26.3, [62, 66, 69, 74], 50], [26.1, 30.0, [62, 66, 69, 76, 78], 50],
];
for (const [t0, t1, notes, root] of PADS) { add(music, t0, pad(notes.map(mtof), t1 - t0), 0.05, 0); add(music, t0, softBass(mtof(root - 12), t1 - t0), 0.05, 0); }
// event-tied piano notes (each once): the two pack prices, the flip to per-100 g, 107p (high) and 52p (low), "about double",
// the number growing, kilojoules, the chosen snack, "same unit", the shelf labels; CTA spread as accepted
const KEYS = [
  [T.tagS + 0.35, 74, 0.22], [T.tagL + 0.35, 76, 0.22], [T.flip[1], 81, 0.26], [T.read107 + 0.05, 86, 0.22], [T.read52 + 0.05, 74, 0.22],
  [T.double[0] + 0.05, 78, 0.24], [T.numUp[0] + 0.1, 81, 0.22], [T.kj[1], 78, 0.24], [T.chosen[1], 81, 0.26], [T.sameUnit[0] + 0.05, 74, 0.24], [T.shelf[1], 78, 0.26],
  [T.tile[1], 74, 0.45], [T.tile[1] + 0.08, 78, 0.4], [T.tile[1] + 0.16, 81, 0.4], [T.tile[1] + 0.24, 86, 0.4], [29.2, 81, 0.3], [29.3, 86, 0.25],
];
for (const [t, m, v] of KEYS) add(music, t, piano(mtof(m), 2.4, v), 0.11, ((m % 5) - 2) * 0.12);

// ------------------------------------------------------------------ foley (cue sheet in timeline.js)
function synth(c) {
  switch (c.type) {
    case "fallAir": return sweep(c.dur, 2400, 700, 0.8, (u) => Math.sin(Math.PI * Math.min(1, u * 1.3)) ** 2);
    case "cupLand": { const s = c.size; const o = mixInto(knock(115 / s, 26, 0.3), noiseBurst(0.08, 850 / s, 0.9, 55), 0.55); return mixInto(o, click(3500, 900, 0.01), 0.25); }
    case "tag": return mixInto(click(2800, 500, 0.02), bell(2637, 0.25, 0.2), 0.12);
    case "riser": return sweep(c.dur, 350, 1600, 1.4, (u) => u * u * (1 - u) * 4);
    case "tick": return mixInto(bell(c.freq, 0.35, 0.4), click(5000, 900, 0.01), 0.3);
    case "pop": return mixInto(glide(0.08, 520, 1150, { curve: 0.4, rel: 0.02 }), noiseBurst(0.03, 2200, 1.0, 120), 0.5);
    case "shimmer": { const o = mixInto(buf(0.9), sweep(c.dur, 3000, 9000, 1.5, (u) => Math.sin(Math.PI * u)), 0.35); [90, 93, 97].forEach((m, k) => mixInto(o, bell(mtof(m), 0.5, 0.3), 0.3, k * 0.07)); return o; }
    case "pour": { const o = biquad(sweep(c.dur, 900, 600, 0.6, (u) => Math.sin(Math.PI * u)), "lp", 1800); for (let k = 0; k < 7; k++) mixInto(o, glide(0.03, 500 + rnd() * 500, 1300 + rnd() * 600, { curve: 0.5, rel: 0.01 }), 0.25, rnd() * c.dur * 0.9); return o; }
    case "glow": return glide(0.6, 620, 930, { att: 0.12, rel: 0.3, curve: 0.6, harm: 0.3 });
    case "toss": return sweep(0.3, 1800, 3500, 2.5, (u) => Math.sin(Math.PI * u));
    case "coinDrop": { const o = buf(0.9); [[0, 1], [0.13, 0.5], [0.22, 0.3], [0.28, 0.18], [0.32, 0.1]].forEach(([dt, g]) => mixInto(o, metal(2350, 0.5, 9), g, dt)); return o; }
    case "bloop": return glide(0.16, 300, 720, { curve: 0.5, rel: 0.04 });
    case "plink": { const o = glide(0.09, 1400, 2600, { curve: 0.4, rel: 0.03 }); for (let k = 0; k < 4; k++) mixInto(o, glide(0.03, 800 + k * 200, 1600 + k * 250, { rel: 0.01 }), 0.3, 0.05 + k * 0.035); return o; }
    case "flip": return mixInto(sweep(0.25, 900, 3200, 1.2), click(3000, 700, 0.015), 0.5, 0.2);
    case "creak": { const o = buf(c.dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = noise() * (0.5 + 0.5 * Math.sin(2 * Math.PI * 3.1 * t) ** 2) * Math.min(1, t / 0.2) * Math.min(1, (c.dur - t) / 0.3); } biquad(o, "bp", 420, 3); return mixInto(o, glide(c.dur, 182, 176, { att: 0.2, rel: 0.3, harm: 0.6 }), 0.12); }
    case "whoosh": return sweep(c.dur, 300, 2600, 0.9, (u) => Math.sin(Math.PI * u) ** 2);
    case "squash": { const o = mixInto(knock(68, 9, 0.6), noiseBurst(0.25, 380, 0.8, 16), 0.9); for (let k = 0; k < 6; k++) mixInto(o, noiseBurst(0.03, 2200 + rnd() * 1800, 1.4, 140), 0.35 * (1 - k / 6), 0.01 + k * 0.022); return o; }
    case "slide": return sweep(c.dur, 1700, 1100, 0.9, (u) => Math.min(1, u * 6) * (1 - u)).map((v) => v * 0.6);
    case "slice": { const o = sweep(c.dur, 700, 4200, 3.2, (u) => 0.3 + 0.7 * u); return mixInto(mixInto(o, click(2500, 500, 0.03), 1.4, c.dur), bell(mtof(90), 0.6, 0.5), 0.35, c.dur); }
    case "settle": return mixInto(knock(165, 32, 0.2), metal(3100, 0.25, 16), 0.18, 0.01);
    case "thud": { const z = c.size; const o = mixInto(knock(118 / z, 26, 0.3), noiseBurst(0.08, 820 / z, 0.9, 55), 0.55); return mixInto(o, click(3500, 900, 0.01), 0.2); }
    case "clack": return mixInto(knock(420, 48, 0.12), click(3200, 800, 0.015), 0.4);
    case "sink": return sweep(0.4, 1400, 380, 1.1, (u) => Math.sin(Math.PI * u) ** 2);
    case "stamp": { const o = mixInto(knock(150, 30, 0.22), noiseBurst(0.05, 1500, 1.1, 90), 0.45); return mixInto(o, click(4200, 1100, 0.008), 0.25); }
    case "card": return mixInto(noiseBurst(0.05, 2400, 1.0, 80), knock(600, 70, 0.05), 0.3);
    case "chime": return mixInto(bell(mtof(88), 0.8, 0.5), bell(mtof(93), 0.7, 0.4), 0.6, 0.08);
    case "peel": return sweep(c.dur, 2600, 5200, 2.4, (u) => Math.min(1, u * 4) * (1 - u) ** 0.5);
    case "zip": return sweep(c.dur, 900, 3400, 3.0, (u) => 0.4 + 0.6 * Math.sin(Math.PI * u));
    case "snap": return mixInto(mixInto(click(2200, 300, 0.04), knock(900, 60, 0.08), 0.5), noiseBurst(0.06, 3200, 1.2, 70), 0.4);
    case "hollow": return mixInto(knock(260, 14, 0.35), knock(410, 18, 0.25), 0.5, 0.02);
    case "clatter": { const o = buf(0.6); [[0, 1], [0.09, 0.7], [0.16, 0.5], [0.24, 0.3]].forEach(([dt, g]) => mixInto(o, mixInto(knock(240 + dt * 300, 30, 0.15), click(2600, 600, 0.02), 0.4), g, dt)); return o; }
    case "clink": return mixInto(metal(2900, 0.5, 10), metal(4100, 0.3, 14), 0.4, 0.01);
    case "sizzle": { const o = buf(c.dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = noise() * (0.6 + 0.4 * Math.sin(2 * Math.PI * 7.3 * t) ** 2) * Math.min(1, t / 0.15) * Math.min(1, (c.dur - t) / 0.4); } biquad(o, "hp", 3500); for (let k = 0; k < c.dur * 18; k++) mixInto(o, click(4500, 1200, 0.006), 0.25 * rnd(), rnd() * c.dur); return o; }
    case "plop": return mixInto(knock(140, 24, 0.22), noiseBurst(0.06, 600, 0.8, 50), 0.5);
    case "clank": return mixInto(knock(180, 22, 0.25), metal(1600, 0.35, 12), 0.3, 0.005);
    case "shutter": return mixInto(mixInto(click(3000, 900, 0.015), click(2200, 700, 0.02), 0.8, 0.06), noiseBurst(0.05, 1800, 1.0, 60), 0.3);
    case "beep": return glide(0.12, 1760, 1760, { att: 0.005, rel: 0.04 }).map((v) => v * 0.6);
    case "flap": return mixInto(knock(120, 16, 0.3), noiseBurst(0.12, 900, 0.7, 25), 0.7);
    case "puff": return mixInto(sweep(0.45, 1800, 600, 0.9, (u) => Math.sin(Math.PI * u) ** 2), noiseBurst(0.08, 900, 0.8, 30), 0.3);
    case "roll": { const o = buf(c.dur); for (let i = 0; i < o.length; i++) { const t = i / SR; o[i] = noise() * 0.25 * Math.min(1, t / 0.08) * Math.min(1, (c.dur - t) / 0.12); } biquad(o, "lp", 1400); for (let k = 0; k < c.dur * 55; k++) mixInto(o, click(3200 + rnd() * 2500, 1400, 0.006), 0.35 * rnd(), rnd() * c.dur); return mixInto(o, glide(c.dur, 90, 82, { att: 0.08, rel: 0.12 }), 0.08); }
    case "tileLand": return mixInto(mixInto(knock(92, 20, 0.4), noiseBurst(0.06, 700, 0.9, 60), 0.6), click(3000, 800, 0.012), 0.3);
  }
  throw new Error("unknown sfx " + c.type);
}
for (const c of SFX) add(sfx, c.t, synth(c), c.gain, c.pan ?? 0);
// very low room tone so pauses are "room", not digital silence
{ const o = buf(DURATION); for (let i = 0; i < o.length; i++) o[i] = noise(); biquad(o, "lp", 450); add(sfx, 0, o, 0.01, 0); }

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
    for (const d0 of combs) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0, lp = 0; for (let i = 0; i < x.length; i++) { const y = bf[idx]; lp = y * 0.7 + lp * 0.3; bf[idx] = x[i] * 0.5 + lp * 0.7; idx = (idx + 1) % d; out[i] += y / combs.length; } }
    for (const d0 of aps) { const d = d0 + sp, bf = new Float32Array(d); let idx = 0; for (let i = 0; i < out.length; i++) { const bo = bf[idx], y = -out[i] + bo; bf[idx] = out[i] + bo * 0.5; idx = (idx + 1) % d; out[i] = y; } }
    return out;
  };
  return [run(inL, 0), run(inR, 23)].map((r, c) => { const dry = c ? inR : inL, o = new Float32Array(dry.length); for (let i = 0; i < dry.length; i++) o[i] = dry[i] + r[i] * wet; return o; });
}
// ------------------------------------------------------------------ mix: voice up front; duck music −10 dB, SFX −4 dB under speech
const duck = new Float32Array(N);
{ let e = 0; const att = Math.exp(-1 / (0.025 * SR)), rel = Math.exp(-1 / (0.35 * SR)); for (let i = 0; i < N; i++) { const a = Math.abs(voice[i]) > 0.015 ? 1 : 0; e = a > e ? a + (e - a) * att : a + (e - a) * rel; duck[i] = e; } }
const [mL, mR] = reverb(music[0], music[1], 0.25), [sL, sR] = reverb(sfx[0], sfx[1], 0.1);
const out = bus();
for (let i = 0; i < N; i++) {
  const md = 1 - 0.68 * duck[i], sd = 1 - 0.37 * duck[i], fo = Math.min(1, (N - i) / (0.6 * SR)), v = voice[i] * 1.4; // accepted English voice gain (round-02 Meshline/Recall stem)
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
const p1 = spawnSync("ffmpeg", ["-hide_banner", "-i", "build/audio/mix_raw.wav", "-af", "loudnorm=I=-15:TP=-2:LRA=11:print_format=json", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const j = JSON.parse(p1.slice(p1.lastIndexOf("{"), p1.lastIndexOf("}") + 1));
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", "build/audio/mix_raw.wav", "-af",
  `loudnorm=I=-15:TP=-2:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,aresample=48000`,
  "-t", String(DURATION), "-c:a", "pcm_s16le", "-ar", "48000", "build/audio/mix.wav"]);
console.log("loudnorm pass1", JSON.stringify({ input_i: j.input_i, input_tp: j.input_tp, lra: j.input_lra }));
console.log("wrote build/audio/mix.wav");
