// score.mjs — original synthesized score + event SFX + Kokoro narration, voice upfront (no samples).
//   node score.mjs -> ../build/mix.wav (48 kHz stereo, exactly 30.000 s)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CUE as C, NARR } from './scene.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 30, N = SR * DUR, TAU = Math.PI * 2;
const bus = () => [new Float32Array(N), new Float32Array(N)];
const MUS = bus(), SFX = bus(), VOX = bus(), SEND = bus();
let seed = 4242; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function add(b, t0, len, g, { gain = 1, pan = 0, rev = 0 } = {}) {
  const a = (pan + 1) * Math.PI / 4, gl = gain * Math.cos(a), gr = gain * Math.sin(a);
  const i0 = Math.max(0, Math.ceil(t0 * SR)), i1 = Math.min(N, Math.floor((t0 + len) * SR));
  for (let i = i0; i < i1; i++) { const v = g(Math.max(0, i / SR - t0)); b[0][i] += v * gl; b[1][i] += v * gr; if (rev) { SEND[0][i] += v * gl * rev; SEND[1][i] += v * gr * rev; } }
}
function noise(b, t0, len, env, fc, { type = 'bp', q = 0.7, ...o } = {}) {
  let lo = 0, bd = 0;
  add(b, t0, len, (lt) => { const f = Math.min(0.8, 2 * Math.sin(Math.PI * Math.min(fc(lt), SR / 6) / SR)); const x = rnd() * 2 - 1; lo += f * bd; const hi = x - lo - Math.max(0.5, q) * bd; bd += f * hi; return env(lt) * (type === 'lp' ? lo : type === 'hp' ? hi : bd); }, o);
}
// ---------------- instruments (quiet)
const chug = (t, v = 1) => { add(MUS, t, 0.25, (lt) => v * 0.5 * Math.sin(TAU * (62 * lt + (40 / 25) * (1 - Math.exp(-lt * 25)))) * Math.exp(-lt * 14), { gain: 0.7 }); noise(MUS, t, 0.05, (lt) => v * 0.25 * Math.exp(-lt * 80), () => 900, { type: 'lp', gain: 0.4 }); };
const tickM = (t, v = 1, f = 3200, pan = 0.3) => add(MUS, t, 0.03, (lt) => v * 0.2 * Math.sin(TAU * f * lt) * Math.exp(-lt * 220), { gain: 0.5, pan });
const marimba = (t, m, v = 1, pan = 0) => add(MUS, t, 0.7, (lt) => { const f = mtof(m); return v * 0.12 * Math.exp(-lt * 6) * (Math.sin(TAU * f * lt) + 0.25 * Math.sin(TAU * 4 * f * lt) * Math.exp(-lt * 30)); }, { gain: 0.8, pan, rev: 0.3 });
function pad(t, notes, len, v = 1) { notes.forEach((m, i) => add(MUS, t, len + 0.8, (lt) => { let s = 0; for (const d of [0.997, 1.003]) for (let h = 1; h <= 3; h++) s += Math.sin(TAU * mtof(m) * d * h * lt + h) / (h * h); return v * 0.014 * s * Math.min(1, lt / 0.7) * (lt > len ? Math.exp(-(lt - len) * 4) : 1); }, { gain: 0.8, pan: (i - 1) * 0.5, rev: 0.5 })); }
const bell = (b, t, m, v = 1, pan = 0, len = 1.2) => add(b, t, len, (lt) => { const f = mtof(m); return v * 0.1 * Math.exp(-lt * 3.5) * (Math.sin(TAU * f * lt) + 0.35 * Math.sin(TAU * f * 2.76 * lt) * Math.exp(-lt * 6)); }, { gain: 0.8, pan, rev: 0.4 });
const glide = (b, t, len, m0, m1, v = 1, pan = 0) => add(b, t, len, (lt) => { const k = Math.min(1, lt / len), f = mtof(m0 + (m1 - m0) * k * k); return v * 0.12 * Math.sin(Math.PI * k) * Math.sin(TAU * f * lt); }, { gain: 0.6, pan, rev: 0.3 });
// ---------------- SFX
const paper = (t, len, v = 1, pan = 0) => noise(SFX, t, len, (lt) => v * 0.3 * Math.min(1, lt / 0.015) * Math.exp(-lt * (5 / len)), (lt) => 3000 + 2500 * lt / len, { type: 'hp', gain: 0.5, pan });
const slap = (t, v = 1) => { noise(SFX, t, 0.08, (lt) => v * 0.5 * Math.exp(-lt * 60), () => 1800, { gain: 0.6 }); add(SFX, t, 0.12, (lt) => v * 0.3 * Math.sin(TAU * 150 * lt) * Math.exp(-lt * 35), { gain: 0.6 }); };
const clunk = (t, v = 1, f = 200) => { add(SFX, t, 0.3, (lt) => v * 0.55 * Math.sin(TAU * (f * lt + 30 * (1 - Math.exp(-lt * 30)) / 30)) * Math.exp(-lt * 16), { gain: 0.85 }); add(SFX, t, 0.05, (lt) => v * 0.25 * Math.sin(TAU * 2900 * lt) * Math.exp(-lt * 90), { gain: 0.5 }); };
const scribble = (t, len, v = 1) => noise(SFX, t, len, (lt) => v * 0.28 * (0.6 + 0.4 * Math.sin(TAU * 18 * lt)) * Math.min(1, lt / 0.02) * Math.min(1, (len - lt) / 0.05), () => 2300, { q: 1.6, gain: 0.5, pan: -0.2 });
const blip = (t, m, v = 1, pan = 0) => add(SFX, t, 0.16, (lt) => v * 0.22 * Math.sin(TAU * mtof(m) * lt) * Math.exp(-lt * 26), { gain: 0.7, pan, rev: 0.25 });
const bonk = (t, v = 1) => add(SFX, t, 0.3, (lt) => v * 0.35 * Math.sign(Math.sin(TAU * (150 - 60 * lt) * lt)) * 0.5 * Math.exp(-lt * 12), { gain: 0.55 });
const stampHit = (t, v = 1) => { add(SFX, t, 0.35, (lt) => v * 0.7 * Math.sin(TAU * (58 * lt + 70 * (1 - Math.exp(-lt * 28)) / 28)) * Math.exp(-lt * 11), { gain: 0.9 }); noise(SFX, t, 0.1, (lt) => v * 0.6 * Math.exp(-lt * 45), () => 1500, { type: 'lp', gain: 0.6 }); };
const roller = (t0, t1, v = 1) => { for (let t = t0; t < t1; t += 1 / 15) tickM(t, v * (0.5 + 0.3 * rnd()), 1700 + 500 * rnd(), 0.15); noise(SFX, t0, t1 - t0, (lt) => v * 0.05 * Math.min(1, lt / 0.1) * Math.min(1, (t1 - t0 - lt) / 0.1), () => 600, { type: 'lp', gain: 0.6 }); };

// ---------------- arrangement: D minor -> F major release, 112.5 BPM (beat = 16 frames), quiet bed
const BEAT = 60 / 112.5, BARS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]];   // Dm  Bb  F  C
const MOT = [0, 2, 1, 2];
const rest = (t) => t > 21.0 && t < 23.4;                         // the gate holds: the bed thins out
for (let b = 0, t = 0; t < 29.2; b++, t = b * BEAT) {
  const bar = Math.floor(b / 4) % 4, ch = t > 23.9 ? [53, 57, 60] : BARS[bar], stopK = t > C.stop[0] ? Math.max(0, 1 - (t - C.stop[0]) / 1.2) : 1;
  if (stopK > 0 && !rest(t)) chug(t, 0.55 * stopK);
  if (stopK > 0) tickM(t + BEAT / 2, (rest(t) ? 0.3 : 0.5) * stopK);
  if (b % 2 === 0 && t > 0.3) marimba(t, ch[MOT[(b / 2) % 4]] + 24, 0.5, b % 4 ? 0.3 : -0.3);
  if (b % 4 === 0) pad(t, ch.map((m) => m + 12), BEAT * 4 - 0.1, 0.8);
}
pad(27.6, [53 + 12, 57 + 12, 60 + 12], 1.8, 1.1); bell(MUS, C.regMark, 77, 0.7, 0, 1.6); bell(MUS, C.regMark + 0.07, 84, 0.5, 0.2, 1.4);

// ---------------- action SFX (all from the scene cues)
clunk(C.reqLand, 0.9, 200);
paper(C.pageIn[0], 0.5, 0.8, 0.5); slap(C.pageIn[1], 0.5);
glide(SFX, C.loupe[0], 0.25, 72, 84, 0.6, 0.2); glide(SFX, C.loupe[1] - 0.2, 0.2, 84, 72, 0.4, 0.2);   // window opens / closes
glide(SFX, C.hiddenWobble, 0.4, 62, 58, 0.5, -0.2);
[0, 0.06, 0.12].forEach((d, i) => clunk(C.drawerRattle + d, 0.35, 600 + i * 90));
paper(C.pageToSlot[0], 0.4, 0.7, 0.3); clunk(C.pageToSlot[1], 0.8, 230);
noise(SFX, C.stampOut, 0.18, (lt) => 0.4 * Math.exp(-lt * 18), () => 2600, { q: 1.2, gain: 0.5 });   // stamp peels off the page
glide(SFX, C.stampOut + 0.15, 2.2, 60, 67, 0.35, -0.3);
stampHit(C.stampSlap, 0.9);
for (let t = C.leverPull[0]; t < C.leverPull[1]; t += 0.09) tickM(t, 0.9, 1200, 0.5);   // ratchet
clunk(C.leverPull[1], 0.7, 170);
[0, 1, 2, 3].forEach((i) => blip(C.lanes + 0.08 * i, [74, 77, 81, 84][i], 0.5, -0.4 + 0.25 * i));
paper(C.stampToData[0], 0.3, 0.6); slap(C.stampToData[1], 0.6); slap(C.uploadIn + 0.2, 0.5);
stampHit(C.notAuth + 0.05, 0.45);
for (let t = C.leverTry; t < C.gate; t += 0.09) tickM(t, 0.8, 1200, 0.5);
clunk(C.gate, 1.1, 120); stampHit(C.gate, 0.5);
blip(C.review + 0.05, 81, 0.6, 0.4);
C.perms.slice(1).forEach((t) => { tickM(t, 1.4, 2300, -0.4); clunk(t + 0.01, 0.25, 500); });
roller(C.summary[0], C.summary[1], 0.8); stampHit(C.notProof, 0.8);

// ---------------- narration (voice upfront) + ducking
function readWav(file) {
  const b = fs.readFileSync(file); let o = 12, fmt, data;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === 'data') data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  if (fmt.sr !== SR || fmt.bits !== 16) throw new Error('bad wav ' + file);
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; return x;
}
const venv = new Float32Array(N);
for (const v of NARR) {
  const x = readWav(path.join(HERE, 'narration/wav', v.id + '.wav')); let rms = 0; for (const s of x) rms += s * s; rms = Math.sqrt(rms / x.length);
  const g = 0.16 / rms, i0 = Math.round(v.t * SR);                   // RMS-matched lines
  for (let i = 0; i < x.length && i0 + i < N; i++) { VOX[0][i0 + i] += x[i] * g; VOX[1][i0 + i] += x[i] * g; }
  for (let i = Math.max(0, i0 - SR * 0.06); i < Math.min(N, i0 + x.length + SR * 0.12); i++) venv[i] = 1;
}
{ let e = 0; for (let i = 0; i < N; i++) { e += (venv[i] > e ? 1 / (SR * 0.04) : 1 / (SR * 0.3)) * (venv[i] - e); venv[i] = e; } }
function reverb(x, offs) {
  const y = new Float32Array(N), combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d + offs) * SR / 44100)), aps = [556, 225].map((d) => Math.round((d + offs) * SR / 44100));
  for (const d of combs) { const bf = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const o = bf[p]; lp = o * 0.7 + lp * 0.3; bf[p] = x[i] + lp * 0.76; p = (p + 1) % d; y[i] += o * 0.25; } }
  for (const d of aps) { const bf = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = bf[p], o = -y[i] + b; bf[p] = y[i] + b * 0.5; p = (p + 1) % d; y[i] = o; } }
  return y;
}
const RV = [reverb(SEND[0], 0), reverb(SEND[1], 23)];
const L = new Float32Array(N), R = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR, dm = 1 - 0.62 * venv[i], ds = 1 - 0.4 * venv[i], fade = t > 29.3 ? Math.max(0, 1 - (t - 29.3) / 0.68) : 1, fin = Math.min(1, i / 96);
  for (const [o, ch] of [[L, 0], [R, 1]]) o[i] = ((MUS[ch][i] * 0.7 + RV[ch][i] * 0.3) * dm * fade + SFX[ch][i] * ds * fade) * fin + VOX[ch][i];
}
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.7 / pk, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(L[i] * g * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] * g * 32767), 46 + i * 4); }
const out = path.resolve(HERE, '../build/mix.wav'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, buf);
console.log('mix ->', out, (N / SR).toFixed(3) + 's');
