// Accepted test audio recipe (tests/15s/src/audio.mjs), extended to 30 s and mixed quieter / voice-forward:
// original synthesized music-box score + paper SFX (no samples), narration on top. Output: build/mix.wav.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildCues, BPM } from './cues.mjs';
import { LINES } from './narration.mjs';

const SR = 48000, DUR = 30, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
const busM = [new Float32Array(N), new Float32Array(N)];
const busS = [new Float32Array(N), new Float32Array(N)];
const busV = new Float32Array(N);
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const noise = () => rnd() * 2 - 1;
const TAU = Math.PI * 2;
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

function put(bus, t, buf, gain = 1, pan = 0) {
  const i0 = Math.round(t * SR);
  const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < buf.length; i++) { const k = i0 + i; if (k < 0 || k >= N) continue; bus[0][k] += buf[i] * gl; bus[1][k] += buf[i] * gr; }
}
const env = (n, a, d) => { const e = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; e[i] = Math.min(1, t / a) * Math.exp(-t / d); } return e; };
function lp(buf, fc) { const a = 1 - Math.exp(-TAU * fc / SR); let y = 0; for (let i = 0; i < buf.length; i++) { y += a * (buf[i] - y); buf[i] = y; } return buf; }
function hp(buf, fc) { const a = 1 - Math.exp(-TAU * fc / SR); let y = 0; for (let i = 0; i < buf.length; i++) { y += a * (buf[i] - y); buf[i] = buf[i] - y; } return buf; }
const bp = (buf, lo, hi) => lp(hp(buf, lo), hi);

// ---------------------------------------------------------------- instruments
function celesta(f, dur = 1.4, vel = 1) {
  const n = Math.round(dur * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const e = Math.min(1, t / 0.002);
    b[i] = vel * e * (Math.sin(TAU * f * t) * Math.exp(-t / 0.55) + 0.35 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / 0.3) + 0.12 * Math.sin(TAU * f * 4.2 * t) * Math.exp(-t / 0.08));
  }
  return b;
}
function pad(freqs, dur, vel = 1) {
  const n = Math.round(dur * SR), b = new Float32Array(n);
  for (const f of freqs) for (const [h, a] of [[1, 1], [2, 0.25], [3, 0.12]]) {
    const ph = rnd() * TAU, det = 1 + (rnd() - 0.5) * 0.004;
    for (let i = 0; i < n; i++) { const t = i / SR; b[i] += a * Math.sin(TAU * f * h * det * t + ph); }
  }
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] *= vel * Math.min(1, t / 0.5) * Math.min(1, (dur - t) / 0.6) / freqs.length; }
  return lp(b, 2200);
}
function pluck(f, dur = 0.8, vel = 1) {
  const n = Math.round(dur * SR), b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = vel * Math.min(1, t / 0.004) * Math.exp(-t / 0.22) * (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2 * t)); }
  return b;
}
function shaker(vel = 1) { const n = Math.round(0.07 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * vel * Math.min(1, t / 0.006) * Math.exp(-t / 0.018); } return hp(b, 5000); }

// ---------------------------------------------------------------- score (96 BPM, 6 bars, D major)
const beat = 60 / BPM, bar = beat * 4;
const C4 = [[50, 62, 66, 69], [47, 59, 62, 66], [43, 59, 62, 67], [45, 61, 64, 69]]; // D Bm G A
const A4 = [[74, 78, 81, 86], [71, 74, 78, 83], [71, 74, 79, 83], [73, 76, 81, 85]];
const CH = [...C4, ...C4, ...C4.slice(0, 2), [50, 62, 66, 69], [50, 62, 66, 69]], ARP = [...A4, ...A4, ...A4.slice(0, 2), A4[0], A4[0]];
const NB = CH.length; // 12 bars x 2.5 s = 30 s
for (let b = 0; b < NB; b++) {
  const t0 = b * bar;
  put(busM, t0, pad(CH[b].slice(1).map(midi), bar + 0.4, 0.5), 0.55, 0);
  if (b >= 1 && b < NB - 2) { put(busM, t0, pluck(midi(CH[b][0] - 12 + 12), 0.9, 0.9), 0.5, 0); put(busM, t0 + 2 * beat, pluck(midi(CH[b][0] - 12 + 12 + 7), 0.9, 0.7), 0.45, 0); }
  // music-box arpeggio: sparse in bar 1, 8ths from bar 2, rising flourish at the end card
  const notes = b === 0 || b === 8 ? [0, 2, 4, 6].map((k) => [k * beat * 0.5 + 0.3 * (k > 0), ARP[b][k % 4]]) : b < NB - 2 ? [...Array(8).keys()].map((k) => [k * beat * 0.5, ARP[b][[0, 1, 2, 3, 2, 1, 2, 3][k]]]) : [];
  for (const [dt, m] of notes) put(busM, t0 + dt, celesta(midi(m), 1.2, 0.8), 0.42, (rnd() - 0.5) * 0.6);
  if (b >= 1 && b < NB - 2 && b !== 8) for (let k = 0; k < 8; k++) put(busM, t0 + k * beat * 0.5 + (k % 2 ? 0.012 : 0), shaker(k % 2 ? 0.8 : 0.45), 0.16, k % 2 ? 0.3 : -0.3);
}
// end card: rising arpeggio and a held chord on the open
[86, 90, 93, 98, 102].forEach((m, i) => put(busM, 26.75 + i * 0.09, celesta(midi(m), 2.4, 0.8), 0.36, -0.4 + i * 0.2));
put(busM, 26.9, pad([62, 66, 69, 74].map(midi), 3.0, 0.6), 0.5, 0);
put(busM, 26.9, pluck(midi(38 + 12), 2.6, 1), 0.5, 0);

// ---------------------------------------------------------------- paper SFX
const SFX = {
  crease(p) { const n = Math.round(0.16 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; const grain = rnd() < 0.012 * p ? 1 : 0; b[i] = noise() * (0.25 + grain * 3) * Math.min(1, t / 0.004) * Math.exp(-t / 0.05); } return bp(b, 1800 * p, 7500); },
  snap(p) { const n = Math.round(0.14 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * Math.exp(-t / 0.008) * 1.2 + Math.sin(TAU * 130 * p * t) * Math.exp(-t / 0.05) * 0.8; } return hp(b, 60); },
  slide(p) { const n = Math.round(0.38 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * Math.sin(Math.PI * t / 0.38) ** 2; } return bp(b, 500 * p, 3500); },
  flap(p) { const n = Math.round(0.22 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * (Math.exp(-((t - 0.05) ** 2) / 0.0008) + 0.6 * Math.exp(-((t - 0.13) ** 2) / 0.0012)); } return bp(b, 250 * p, 1600 * p); },
  swoosh(p) { const n = Math.round(0.55 * SR), b = new Float32Array(n); let y = 0, z = 0; for (let i = 0; i < n; i++) { const t = i / SR; const fc = (400 + 1800 * Math.sin(Math.PI * t / 0.55)) * p; const a = 1 - Math.exp(-TAU * fc / SR); y += a * (noise() - y); z += a * (y - z); b[i] = (y - z) * 2.2 * Math.sin(Math.PI * t / 0.55) ** 1.5; } return b; },
  whoosh(p) { const n = Math.round(0.3 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * Math.sin(Math.PI * t / 0.3) ** 2; } return bp(b, 900 * p, 5000); },
  pop(p) { const n = Math.round(0.16 * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; const f = (120 + 260 * Math.exp(-t / 0.025)) * p; ph += TAU * f / SR; b[i] = Math.sin(ph) * Math.exp(-t / 0.06) + noise() * 0.25 * Math.exp(-t / 0.01); } return b; },
  chime(p) { const n = Math.round(1.3 * SR), b = new Float32Array(n), f = 1046.5 * p; for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.min(1, t / 0.002) * (Math.sin(TAU * f * t) * Math.exp(-t / 0.5) + 0.4 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.18) + 0.2 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-t / 0.07)); } return b; },
  shutter(p) { const n = Math.round(0.12 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = noise() * (Math.exp(-t / 0.004) + Math.exp(-Math.max(0, t - 0.05) / 0.005) * (t > 0.05 ? 1 : 0)); } return bp(b, 1500, 9000); },
  heart(p) { const n = Math.round(0.2 * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += TAU * (500 + 900 * t / 0.2) * p / SR; b[i] = Math.sin(ph) * Math.min(1, t / 0.005) * Math.exp(-t / 0.07); } return b; },
  stamp(p) { const n = Math.round(0.2 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.sin(TAU * 85 * p * t) * Math.exp(-t / 0.06) * 1.1 + noise() * Math.exp(-t / 0.012) * 0.7; } return b; },
  creak(p) { const n = Math.round(0.26 * SR), b = new Float32Array(n); let ph = 0; for (let i = 0; i < n; i++) { const t = i / SR; ph += TAU * (150 + 40 * Math.sin(t * 40)) * p / SR; b[i] = (Math.sin(ph) * 0.5 + noise() * 0.5) * Math.sin(Math.PI * t / 0.26) ** 2; } return bp(b, 120, 1400); },
  tick(p) { const n = Math.round(0.12 * SR), b = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / SR; b[i] = Math.sin(TAU * 1700 * p * t) * Math.exp(-t / 0.03) * 0.8 + noise() * Math.exp(-t / 0.004) * 0.6; } return b; },
  coin(p) { const n = Math.round(0.6 * SR), b = new Float32Array(n), f = 2100 * p; for (const [dt, v] of [[0, 1], [0.06, 0.6]]) for (let i = Math.round(dt * SR); i < n; i++) { const t = i / SR - dt; b[i] += v * Math.exp(-t / 0.18) * (Math.sin(TAU * f * t) + 0.6 * Math.sin(TAU * f * 1.51 * t) + 0.35 * Math.sin(TAU * f * 2.33 * t)); } return b; },
};
const cues = buildCues();
for (const c of cues) put(busS, c.t, SFX[c.type](c.p), 0.3 * c.gain, (rnd() - 0.5) * 0.4);

// ---------------------------------------------------------------- narration
function readF32(file) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
}
const voSpans = [];
for (const l of LINES) {
  // (episode lines are generated by src/tts.mjs with the blended voice)
  const x = readF32(`build/vo/${l.id}.wav`);
  const i0 = Math.round(l.start * SR);
  for (let i = 0; i < x.length && i0 + i < N; i++) busV[i0 + i] += x[i];
  voSpans.push([l.start, l.start + x.length / SR]);
}

// ---------------------------------------------------------------- reverb (Schroeder) for music + SFX
function reverb(inp, mix) {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({ d, buf: new Float32Array(d), i: 0, fb: 0.78 }));
  const aps = [225, 556].map((d) => ({ d, buf: new Float32Array(d), i: 0 }));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) { const y = c.buf[c.i]; c.buf[c.i] = inp[n] + y * c.fb; c.i = (c.i + 1) % c.d; s += y; }
    s *= 0.25;
    for (const a of aps) { const y = a.buf[a.i]; const v = s + y * 0.5; a.buf[a.i] = v; a.i = (a.i + 1) % a.d; s = y - v * 0.5; }
    out[n] = inp[n] + s * mix;
  }
  return out;
}
const mL = reverb(busM[0], 0.35), mR = reverb(busM[1], 0.35);
const sL = reverb(busS[0], 0.18), sR = reverb(busS[1], 0.18);

// ---------------------------------------------------------------- mix with ducking under the voice
const duck = new Float32Array(N);
let d = 0;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const on = voSpans.some(([a, b]) => t >= a - 0.05 && t <= b + 0.1) ? 1 : 0;
  d += (on - d) * (on > d ? 1 / (0.08 * SR) : 1 / (0.3 * SR));
  duck[n] = 1 - 0.6 * d;
}
for (let n = 0; n < N; n++) {
  const t = n / SR;
  const fade = Math.min(1, t / 0.02) * Math.min(1, (DUR - t) / 0.4);
  L[n] = (mL[n] * 0.42 * duck[n] + sL[n] * 0.6 + busV[n] * 1.0) * fade;
  R[n] = (mR[n] * 0.42 * duck[n] + sR[n] * 0.6 + busV[n] * 1.0) * fade;
}
// gentle peak safety (final loudness set in mux.mjs)
let pk = 0; for (let n = 0; n < N; n++) pk = Math.max(pk, Math.abs(L[n]), Math.abs(R[n]));
const g = pk > 0.95 ? 0.95 / pk : 1;
const inter = new Float32Array(N * 2);
for (let n = 0; n < N; n++) { inter[2 * n] = L[n] * g; inter[2 * n + 1] = R[n] * g; }
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/mix.f32', Buffer.from(inter.buffer));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'f32le', '-ar', String(SR), '-ac', '2', '-i', 'build/mix.f32', '-c:a', 'pcm_f32le', 'build/mix.wav']);
fs.unlinkSync('build/mix.f32');
console.log(`mix: ${cues.length} SFX cues, ${LINES.length} VO lines, peak ${pk.toFixed(3)} -> build/mix.wav`);
