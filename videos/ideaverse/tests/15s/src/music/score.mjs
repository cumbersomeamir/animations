// score.mjs — original synthesized score for the Ideaverse 15 s kinetic reel (no samples, no dependencies).
// Reads ../reel/cues.js so every hit lands on its frame; mixes the narration clips with voice ducking.
//   node music/score.mjs  ->  ../build/score.wav (48 kHz stereo, exactly 15.000 s)
// Sound rules from the kinetic-reel skill (references/sound.md), implemented independently here:
// no noise whooshes on transitions (swell / bloom / glide / harp instead), impacts only on structural moments,
// different energy per chapter, ticks/blips tied to on-screen events.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import C from '../reel/cues.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, N = Math.round(C.dur * SR), TAU = Math.PI * 2;
const H = C.hits, S = C.S;
const bus = () => [new Float32Array(N), new Float32Array(N)];
const DRUM = bus(), MUS = bus(), VOX = bus(), SEND = bus();
const kickDuck = new Float32Array(N).fill(1);
let seed = 1234567;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// add a generator g(localTime) into a bus with equal-power pan and an optional reverb send
function add(target, t0, len, g, { gain = 1, pan = 0, rev = 0 } = {}) {
  const a = (pan + 1) * Math.PI / 4, gl = gain * Math.cos(a), gr = gain * Math.sin(a);
  const i0 = Math.max(0, Math.ceil(t0 * SR)), i1 = Math.min(N, Math.floor((t0 + len) * SR));
  for (let i = i0; i < i1; i++) {
    const lt = Math.max(0, i / SR - t0), v = g(lt);
    target[0][i] += v * gl; target[1][i] += v * gr;
    if (rev) { SEND[0][i] += v * gl * rev; SEND[1][i] += v * gr * rev; }
  }
}
// 2-pole state-variable filtered noise (cutoff/q clamped for stability)
function noiseHit(target, t0, len, env, fc, { type = 'bp', q = 0.7, ...o } = {}) {
  let low = 0, band = 0;
  add(target, t0, len, (lt) => {
    const f = Math.min(0.8, 2 * Math.sin(Math.PI * Math.min(fc(lt), SR / 6) / SR)), qq = Math.max(0.5, q);
    const x = rnd() * 2 - 1; low += f * band; const high = x - low - qq * band; band += f * high;
    return env(lt) * (type === 'lp' ? low : type === 'hp' ? high : band);
  }, o);
}

// ---------------- drums
function kick(t, v = 1) {
  add(DRUM, t, 0.5, (lt) => v * Math.sin(TAU * (46 * lt + (95 / 28) * (1 - Math.exp(-lt * 28)))) * Math.exp(-lt * 7) * Math.min(1, lt / 0.002), { gain: 0.95 });
  noiseHit(DRUM, t, 0.015, (lt) => v * 0.4 * Math.exp(-lt * 350), () => 4000, { gain: 0.4 });
  const i0 = Math.round(t * SR);
  for (let i = 0; i < SR * 0.28 && i0 + i < N; i++) if (i0 + i >= 0) kickDuck[i0 + i] = Math.min(kickDuck[i0 + i], 1 - 0.55 * Math.exp(-(i / SR) * 12));
}
function clap(t, v = 1) {
  for (let k = 0; k < 3; k++) noiseHit(DRUM, t + k * 0.011, 0.22, (lt) => v * (k === 2 ? 0.7 * Math.exp(-lt * 16) : 0.5 * Math.exp(-lt * 80)), () => 1500, { gain: 0.6, pan: 0.05, rev: 0.2 });
}
const hat = (t, v = 1, open = false) => noiseHit(DRUM, t, open ? 0.25 : 0.05, (lt) => v * 0.35 * Math.exp(-lt * (open ? 14 : 75)), () => 9500, { type: 'hp', gain: 0.45, pan: 0.3 });
const tick = (t, v = 1, f = 2400, pan = -0.25) => add(DRUM, t, 0.035, (lt) => v * 0.28 * Math.sin(TAU * f * lt) * Math.exp(-lt * 170), { gain: 0.55, pan });
function impact(t, v = 1) {
  kick(t, v);
  noiseHit(DRUM, t, 1.2, (lt) => v * 0.8 * Math.exp(-lt * 3.5), (lt) => 2200 * Math.exp(-lt * 2.4) + 180, { type: 'lp', gain: 0.55, rev: 0.5 });
  add(DRUM, t, 1.4, (lt) => v * 0.5 * Math.sin(TAU * (36 * lt + (26 / 7) * (1 - Math.exp(-lt * 7)))) * Math.exp(-lt * 2.4), { gain: 0.8 });
}
function softImpact(t, v = 1) {
  kick(t, v);
  add(DRUM, t, 0.9, (lt) => v * 0.4 * Math.sin(TAU * (42 * lt + (30 / 9) * (1 - Math.exp(-lt * 9)))) * Math.exp(-lt * 3.5), { gain: 0.7 });
}

// ---------------- tonal
const blip = (t, m, v = 1, pan = 0) => add(MUS, t, 0.18, (lt) => v * 0.26 * Math.sin(TAU * mtof(m) * lt) * Math.exp(-lt * 24), { gain: 0.7, pan, rev: 0.35 });
const bell = (t, m, v = 1, pan = 0, len = 1.6) => add(MUS, t, len, (lt) => {
  const f = mtof(m); return v * 0.12 * Math.exp(-lt * 2.6) * (Math.sin(TAU * f * lt) + 0.45 * Math.sin(TAU * f * 2.76 * lt) * Math.exp(-lt * 4) + 0.25 * Math.sin(TAU * f * 5.4 * lt) * Math.exp(-lt * 7));
}, { gain: 0.8, pan, rev: 0.55 });
const pluck = (t, m, v = 1, pan = 0) => add(MUS, t, 0.45, (lt) => {
  const f = mtof(m); return v * 0.14 * Math.exp(-lt * 8.5) * (Math.sin(TAU * f * lt) + 0.4 * Math.sin(TAU * 2 * f * lt) * Math.exp(-lt * 10) + 0.2 * Math.sin(TAU * 3 * f * lt) * Math.exp(-lt * 18));
}, { gain: 0.8, pan, rev: 0.3 });
function bass(t, m, len, v = 1) {
  const f = mtof(m);
  add(MUS, t, len + 0.04, (lt) => {
    const ph = (f * lt) % 1, env = Math.min(1, lt / 0.004) * (lt < len ? 1 : Math.exp(-(lt - len) * 70));
    return v * 0.3 * env * Math.tanh(1.6 * (0.8 * Math.sin(TAU * f * lt) + 0.35 * (2 * ph - 1) + 0.5 * Math.sin(TAU * f * 0.5 * lt)));
  }, { gain: 0.8 });
}
function pad(t, notes, len, v = 1, att = 0.35) {
  notes.forEach((m, i) => add(MUS, t, len + 0.7, (lt) => {
    let s = 0; for (const d of [0.997, 1, 1.0035]) for (let h = 1; h <= 4; h++) s += Math.sin(TAU * mtof(m) * d * h * lt + h * 1.3) / (h * h);
    return v * 0.022 * s * Math.min(1, lt / att) * (lt > len ? Math.exp(-(lt - len) * 5) : 1);
  }, { gain: 0.8, pan: (i - 1) * 0.45, rev: 0.6 }));
}
const stab = (t, notes, v = 1) => notes.forEach((m, i) => add(MUS, t, 0.6, (lt) => v * 0.1 * Math.exp(-lt * 6) * (Math.sin(TAU * mtof(m) * lt) + 0.5 * Math.sin(TAU * mtof(m) * 2.002 * lt) + 0.2 * Math.sin(TAU * mtof(m) * 3 * lt)), { gain: 0.85, pan: (i - 1) * 0.4, rev: 0.45 }));
// transition cues (in key, never noise)
function swell(tEnd, notes, len = 0.9) { notes.forEach((m, i) => add(MUS, tEnd - len, len, (lt) => { const k = lt / len; let s = 0; for (let h = 1; h <= 3; h++) s += Math.sin(TAU * mtof(m) * h * lt) / h; return 0.05 * s * Math.pow(k, 2.4); }, { gain: 0.8, pan: (i - 1) * 0.5, rev: 0.3 })); }
const bloom = (t, notes) => notes.forEach((m, i) => bell(t + i * 0.03, m, 0.85, (i - 1.5) * 0.35, 2.0));
function glide(t, len, m0, m1) { add(MUS, t, len + 0.2, (lt) => { const k = Math.min(1, lt / len), f = mtof(lerp(m0, m1, k * k)); const ph = (f * lt) % 1; return 0.09 * (1 - Math.abs(2 * ph - 1) * 2 + 0.0) * Math.sin(Math.PI * Math.min(1, lt / (len + 0.2))); }, { gain: 0.6, rev: 0.5 }); }
function harp(t, span, notes, v = 1, up = true) { const seq = up ? notes : [...notes].reverse(); seq.forEach((m, i) => pluck(t + (i * span) / seq.length, m, v, -0.6 + (1.2 * i) / seq.length)); }
const lerp = (a, b, k) => a + (b - a) * k;

// ---------------- arrangement (D major, 120 BPM, bars of 2 s)
const CHORD = { D: [62, 66, 69], Bm: [59, 62, 66], G: [55, 59, 62], A: [57, 61, 64] };
const ROOT = { D: 38, Bm: 35, G: 43, A: 45 };
const BARS = ['D', 'Bm', 'G', 'A', 'D', 'G', 'D', 'D'];   // bar i covers [2i, 2i+2)
const chordAt = (t) => { const b = Math.min(BARS.length - 1, Math.floor(t / 2)); return t >= 11 && t < 12 ? 'A' : BARS[b]; };
const ARP = [0, 1, 2, 1];

// 01 IDEA (0-2): opening hit on frame 0, dot blip, letter ticks, pad swell, groove at 70 %
softImpact(0, 0.85); blip(0, 86, 0.9);
pad(0, [50, 57, 62, 66], 1.9, 0.9, 0.08);
'ONE'.split('').forEach((_, i) => tick(Math.max(0, H.wordOne + i * 0.045 + 0.12), 0.8, 2600 + i * 200));
'IDEA.'.split('').forEach((_, i) => tick(H.wordIdea + i * 0.045 + 0.1, 0.8, 2400 + i * 180));
bloom(H.bulbLit, [74, 78, 81, 85]);
blip(H.chipInput, 81, 0.6, -0.3);
swell(S.one, [59, 62, 66], 0.8);

// groove
for (let t = 0; t < S.end; t += 0.5) {
  const beat = Math.round(t / 0.5) % 4, ch = chordAt(t), lead = t >= S.image && t < S.motion;
  const vIdea = t < S.one ? 0.75 : 1;
  kick(t, (beat === 0 ? 1 : 0.85) * vIdea);
  if (t >= S.one && (beat === 1 || beat === 3)) clap(t, 0.7);
  hat(t + 0.25, 0.8 * vIdea, beat === 3 && t >= S.one);
  if (lead) { hat(t + 0.125, 0.4); hat(t + 0.375, 0.45); }
  if (t >= S.one) { bass(t, ROOT[ch], 0.2, 0.9); bass(t + 0.25, ROOT[ch] + 12, 0.18, 0.7); }
  const notes = CHORD[ch];
  for (let k = 0; k < 2; k++) pluck(t + k * 0.25, notes[ARP[(Math.round(t / 0.25) + k) % 4]] + 12, t < S.one ? 0.55 : 0.7, (k ? 0.35 : -0.35));
}
for (let b = 0; b < 6; b++) pad(b * 2, CHORD[BARS[b]].map((m) => m - 12), 1.9, b === 2 || b === 3 || b === 4 ? 1 : 0.7);

// 02 ONE APP: a blip per app chip, a tock as each is absorbed, slam on the bar's beat 3, chip blip, glide into the zoom
H.apps.forEach((t, i) => blip(t, [74, 76, 78, 81, 83][i], 0.7, i % 2 ? 0.5 : -0.5));
H.absorb.forEach((t, i) => add(DRUM, t, 0.08, (lt) => 0.35 * Math.sin(TAU * (520 - i * 30) * lt) * Math.exp(-lt * 60), { gain: 0.6 }));
softImpact(H.slam, 0.95); stab(H.slam, [62, 66, 69, 74], 1);
blip(H.chipAI, 86, 0.7, -0.4); blip(H.chipAI + 0.125, 90, 0.5, 0.4);
glide(S.image - 0.5, 0.5, 62, 74);

// 03 IMAGE (lead, 16th hats): particle stream ticks, a rising blip per scan band, stab + bloom when the image resolves
for (let k = 0; k < 24; k++) tick(H.stream[0] + k * 0.042, 0.35 + 0.4 * rnd(), 1800 + 1600 * rnd(), rnd() * 1.4 - 0.7);
H.scan.forEach((t, i) => { blip(t, [69, 71, 74, 76, 78, 81][i], 0.8, -0.3 + i * 0.12); });
stab(H.done, [62, 66, 69, 74], 1.1); bloom(H.done + 0.02, [74, 78, 81, 86]);
glide(H.ringIn, 0.6, 69, 81);
harp(S.motion - 0.05, 0.3, [62, 66, 69, 74, 78, 81], 0.8, true);

// 04 MOTION: lighter, voice words carried by soft plucks
H.voice.forEach((t, i) => pluck(t, [78, 81, 83, 86][i], 0.55, 0));
swell(S.end, [62, 66, 69], 0.7);

// END: structural impact, then a breath (kick on bar starts only), name ticks, CTA stab, ring-out
impact(S.end, 1);
kick(14, 0.6);
pad(S.end, [50, 57, 62, 66, 69], 2.4, 1.1, 0.05);
bass(S.end, 38, 1.2, 0.8);
'IDEAVERSE'.split('').forEach((_, i) => tick(H.name + i * 0.035 + 0.08, 0.6, 2200 + i * 90, -0.4 + i * 0.1));
blip(H.sub, 81, 0.6); stab(H.cta, [62, 66, 69, 74], 0.9); bell(H.cta, 86, 0.6, 0, 2);
H.ctaPulse.forEach((t) => blip(t, 86, 0.5));

// ---------------- narration + ducking
function readWav(file) {
  const b = fs.readFileSync(file); let o = 12, fmt = null, data = null;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === 'data') data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  if (!fmt || fmt.bits !== 16 || fmt.sr !== SR) throw new Error('unexpected wav ' + file);
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; return x;
}
const voiceEnv = new Float32Array(N);
for (const v of C.narration) {
  const x = readWav(path.join(HERE, '../narration/wav', v.id + '.wav'));
  let pk = 0; for (const s of x) pk = Math.max(pk, Math.abs(s)); const g = 0.62 / pk;
  const i0 = Math.round(v.t * SR);
  for (let i = 0; i < x.length && i0 + i < N; i++) { VOX[0][i0 + i] += x[i] * g; VOX[1][i0 + i] += x[i] * g; }
  for (let i = Math.max(0, i0 - SR * 0.06); i < Math.min(N, i0 + x.length + SR * 0.12); i++) voiceEnv[i] = 1;
}
// smooth the voice envelope (fast attack, slower release)
{ let e = 0; for (let i = 0; i < N; i++) { const tgt = voiceEnv[i]; e += (tgt > e ? 1 / (SR * 0.03) : 1 / (SR * 0.22)) * (tgt - e); voiceEnv[i] = e; } }

// ---------------- reverb (Schroeder: 4 combs + 2 allpasses per side)
function reverb(x, offs) {
  const y = new Float32Array(N), combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d + offs) * SR / 44100)), aps = [556, 225].map((d) => Math.round((d + offs) * SR / 44100));
  for (const d of combs) { const buf = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const o = buf[p]; lp = o * 0.75 + lp * 0.25; buf[p] = x[i] + lp * 0.8; p = (p + 1) % d; y[i] += o * 0.25; } }
  for (const d of aps) { const buf = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = buf[p], o = -y[i] + b; buf[p] = y[i] + b * 0.5; p = (p + 1) % d; y[i] = o; } }
  return y;
}
const RV = [reverb(SEND[0], 0), reverb(SEND[1], 23)];

// ---------------- mix
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const duckV = 1 - 0.62 * voiceEnv[i];        // ~ -8.4 dB under narration
  const fade = t > 14.35 ? Math.max(0, 1 - (t - 14.35) / 0.62) : 1;
  const fadeIn = Math.min(1, i / 96);           // avoid a click on sample 0
  const m = kickDuck[i];
  for (const [o, ch] of [[L, 0], [R, 1]]) {
    const v = (DRUM[ch][i] * (1 - 0.35 * voiceEnv[i]) + MUS[ch][i] * m * duckV + RV[ch][i] * 0.35 * duckV) * fade * fadeIn + VOX[ch][i] * 1.0;
    o[i] = Math.tanh(v * 0.9) / 0.9;
  }
}
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / pk;
const outBuf = Buffer.alloc(44 + N * 4);
outBuf.write('RIFF', 0); outBuf.writeUInt32LE(36 + N * 4, 4); outBuf.write('WAVE', 8); outBuf.write('fmt ', 12);
outBuf.writeUInt32LE(16, 16); outBuf.writeUInt16LE(1, 20); outBuf.writeUInt16LE(2, 22); outBuf.writeUInt32LE(SR, 24); outBuf.writeUInt32LE(SR * 4, 28); outBuf.writeUInt16LE(4, 32); outBuf.writeUInt16LE(16, 34);
outBuf.write('data', 36); outBuf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { outBuf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); outBuf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
const outFile = path.resolve(HERE, '../../build/score.wav');
fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, outBuf);
console.log('score ->', outFile, (N / SR).toFixed(3) + 's', 'peak gain', g.toFixed(3));
