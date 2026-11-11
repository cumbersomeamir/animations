// score.mjs — original synthesized music + action SFX + DOCKET's narration for production 30s english-12 #01
// (engine from education pilot-01; no samples, no deps). node music/score.mjs -> ../../build/mix.wav (48 kHz, 30.000 s); english-12 #01 events
// Every SFX time comes from ../stage/cues.js (the same file that drives the picture).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import C from '../stage/cues.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, N = Math.round(C.dur * SR), TAU = Math.PI * 2, H = C.hits;
const bus = () => [new Float32Array(N), new Float32Array(N)];
const MUS = bus(), SFX = bus(), VOX = bus(), SEND = bus();
let seed = 99173; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const lerp = (a, b, k) => a + (b - a) * k;

function add(target, t0, len, g, { gain = 1, pan = 0, rev = 0 } = {}) {
  const a = (pan + 1) * Math.PI / 4, gl = gain * Math.cos(a), gr = gain * Math.sin(a);
  const i0 = Math.max(0, Math.ceil(t0 * SR)), i1 = Math.min(N, Math.floor((t0 + len) * SR));
  for (let i = i0; i < i1; i++) {
    const lt = Math.max(0, i / SR - t0), v = g(lt);
    target[0][i] += v * gl; target[1][i] += v * gr;
    if (rev) { SEND[0][i] += v * gl * rev; SEND[1][i] += v * gr * rev; }
  }
}
function noise(target, t0, len, env, fc, { type = 'bp', q = 0.7, ...o } = {}) {
  let low = 0, band = 0;
  add(target, t0, len, (lt) => {
    const f = Math.min(0.8, 2 * Math.sin(Math.PI * Math.min(fc(lt), SR / 6) / SR)), qq = Math.max(0.5, q);
    const x = rnd() * 2 - 1; low += f * band; const high = x - low - qq * band; band += f * high;
    return env(lt) * (type === 'lp' ? low : type === 'hp' ? high : band);
  }, o);
}
// ---------------- instruments
const kick = (t, v = 1) => add(MUS, t, 0.4, (lt) => v * 0.8 * Math.sin(TAU * (50 * lt + (80 / 30) * (1 - Math.exp(-lt * 30)))) * Math.exp(-lt * 9) * Math.min(1, lt / 0.002), { gain: 0.8 });
const shaker = (t, v = 1) => noise(MUS, t, 0.07, (lt) => v * 0.3 * Math.min(1, lt / 0.008) * Math.exp(-lt * 55), () => 7000, { type: 'hp', gain: 0.35, pan: 0.35 });
const tick = (target, t, v = 1, f = 2600, pan = -0.25) => add(target, t, 0.03, (lt) => v * 0.3 * Math.sin(TAU * f * lt) * Math.exp(-lt * 200), { gain: 0.55, pan });
const typeKey = (t, v = 1) => { tick(MUS, t, v * 0.6, 1700 + 900 * rnd(), rnd() * 0.8 - 0.4); noise(MUS, t, 0.02, (lt) => v * 0.25 * Math.exp(-lt * 300), () => 3500, { gain: 0.3 }); };
const marimba = (t, m, v = 1, pan = 0) => add(MUS, t, 0.6, (lt) => { const f = mtof(m); return v * 0.15 * Math.exp(-lt * 7) * (Math.sin(TAU * f * lt) + 0.3 * Math.sin(TAU * 4 * f * lt) * Math.exp(-lt * 30) + 0.12 * Math.sin(TAU * 10 * f * lt) * Math.exp(-lt * 60)); }, { gain: 0.8, pan, rev: 0.25 });
const pizz = (t, m, v = 1) => add(MUS, t, 0.35, (lt) => { const f = mtof(m); return v * 0.3 * Math.exp(-lt * 11) * Math.tanh(1.5 * (Math.sin(TAU * f * lt) + 0.35 * Math.sin(TAU * 2 * f * lt))); }, { gain: 0.75 });
function pad(t, notes, len, v = 1) {
  notes.forEach((m, i) => add(MUS, t, len + 0.6, (lt) => { let s = 0; for (const d of [0.997, 1.003]) for (let h = 1; h <= 3; h++) s += Math.sin(TAU * mtof(m) * d * h * lt + h) / (h * h); return v * 0.018 * s * Math.min(1, lt / 0.5) * (lt > len ? Math.exp(-(lt - len) * 5) : 1); }, { gain: 0.8, pan: (i - 1) * 0.45, rev: 0.5 }));
}
const bell = (target, t, m, v = 1, pan = 0, len = 1.4) => add(target, t, len, (lt) => { const f = mtof(m); return v * 0.12 * Math.exp(-lt * 3) * (Math.sin(TAU * f * lt) + 0.4 * Math.sin(TAU * f * 2.76 * lt) * Math.exp(-lt * 5)); }, { gain: 0.8, pan, rev: 0.45 });
const glideTone = (target, t, len, f0, f1, v = 1, shape = 'sine', pan = 0) => add(target, t, len, (lt) => { const k = Math.min(1, lt / len), f = f0 * Math.pow(f1 / f0, k); const ph = TAU * f * lt; const env = Math.sin(Math.PI * k) ** 0.6; return v * 0.2 * env * (shape === 'sq' ? Math.sign(Math.sin(ph)) * 0.5 : Math.sin(ph)); }, { gain: 0.7, pan, rev: 0.2 });

// ---------------- SFX
const thump = (t, v = 1) => { add(SFX, t, 0.35, (lt) => v * 0.7 * Math.sin(TAU * (70 * lt + (60 / 20) * (1 - Math.exp(-lt * 20)))) * Math.exp(-lt * 12), { gain: 0.9 }); noise(SFX, t, 0.08, (lt) => v * 0.6 * Math.exp(-lt * 60), () => 1200, { type: 'lp', gain: 0.5 }); };
const clunk = (t, v = 1) => { add(SFX, t, 0.2, (lt) => v * 0.5 * Math.sin(TAU * 180 * lt) * Math.exp(-lt * 30), { gain: 0.8 }); noise(SFX, t, 0.05, (lt) => v * 0.5 * Math.exp(-lt * 90), () => 2500, { gain: 0.5 }); };
const slide = (t, len, v = 1) => { noise(SFX, t, len, (lt) => v * 0.35 * Math.sin(Math.PI * Math.min(1, lt / len)), (lt) => 900 + 600 * lt / len, { gain: 0.5, q: 1.2 }); for (let k = 0; k < len / 0.03; k++) tick(SFX, t + k * 0.03, 0.25 * v, 900 + 300 * rnd(), 0.2); };
const clink = (t, v = 1, f = 3200) => add(SFX, t, 0.35, (lt) => v * 0.16 * Math.exp(-lt * 14) * (Math.sin(TAU * f * lt) + 0.6 * Math.sin(TAU * f * 1.51 * lt) + 0.3 * Math.sin(TAU * f * 2.37 * lt)), { gain: 0.8, pan: 0.3, rev: 0.3 });
const paper = (t, len, v = 1) => noise(SFX, t, len, (lt) => v * 0.25 * Math.min(1, lt / 0.01) * Math.exp(-lt * (6 / len)), () => 4500, { type: 'hp', gain: 0.45 });
const thwack = (t, v = 1) => { add(SFX, t, 0.5, (lt) => v * 0.9 * Math.sin(TAU * (55 * lt + (90 / 25) * (1 - Math.exp(-lt * 25)))) * Math.exp(-lt * 8), { gain: 0.95 }); noise(SFX, t, 0.12, (lt) => v * 0.9 * Math.exp(-lt * 40), () => 1800, { type: 'lp', gain: 0.6 }); paper(t, 0.15, v * 0.8); };

// ---------------- music: the accepted quiet pad bed (one chord per 2.5 s, no rhythmic loops), event-linked notes only
const PROG = [['Dm', 0], ['Bb', 2.5], ['F', 5], ['C', 7.5], ['Dm', 10], ['Bb', 12.5], ['F', 15], ['C', 17.5], ['Dm', 20], ['Bb', 22.5], ['F', 25], ['Fadd', 27.5]];
const CHD = { Dm: [50, 57, 62, 65], Bb: [46, 53, 58, 62], F: [41, 53, 57, 60], C: [48, 55, 60, 64], Fadd: [41, 53, 57, 60, 67] };
PROG.forEach(([ch, t], i) => pad(t, CHD[ch], i === PROG.length - 1 ? 2.1 : 2.45, 0.85));
PROG.forEach(([ch, t]) => pizz(t + 0.02, CHD[ch][0], 0.35));
bell(MUS, 0.02, 74, 0.35, -0.2, 1.6);                                                                        // opening shimmer
bell(MUS, 26.7, 77, 0.35, -0.2, 1.8); bell(MUS, 26.95, 81, 0.3, 0.2, 1.8); bell(MUS, 28.5, 84, 0.32, 0, 1.4);   // CTA lift

// ---------------- action SFX (all from cues)
const whoosh = (t, len, v = 1) => noise(SFX, t, len, (lt) => v * 0.2 * Math.sin(Math.PI * Math.min(1, lt / len)) ** 1.5, (lt) => 500 + 2200 * (lt / len), { gain: 0.5, q: 1.4, pan: 0.3 });
const tick2 = (t, f = 2400, v = 0.6) => add(SFX, t, 0.05, (lt) => v * 0.25 * Math.sin(TAU * f * lt) * Math.exp(-lt * 120), { gain: 0.6, pan: 0.2 });
// A · hook: a phone ring (synth, two short pulses before the first word), wave grows, NOT PROOF lands after "proof"
const ringT = (t, len) => add(SFX, t, len, (lt) => 0.16 * Math.min(1, lt / 0.01) * Math.min(1, (len - lt) / 0.02) * (Math.sin(TAU * 440 * lt) + Math.sin(TAU * 480 * lt)), { gain: 0.8, pan: 0.15 });
ringT(H.ring[0], 0.2); glideTone(SFX, H.wave, 0.6, 300, 600, 0.08); tick2(H.ok, 2600, 0.35); thump(1.98, 0.35); clunk(2.0, 0.25);
// B · two-shot: the call (one short ring before "This"), bubble pops, NEVER SAID sting after "said it"
ringT(2.92, 0.07); paper(H.bubble, 0.12, 0.35); thump(5.24, 0.3); marimba(5.27, 62, 0.4); marimba(5.4, 58, 0.38);
// C · the short clip plays, the voice pattern blooms
thump(H.cut2, 0.18); tick2(H.clip, 2400, 0.3); glideTone(SFX, H.learn, 0.6, 500, 900, 0.08); [0, 0.1, 0.2].forEach((d, i) => bell(SFX, 9.75 + d, [72, 76, 79][i], 0.18, -0.2 + i * 0.2, 0.9));
// D · new words → output wave in the same voice; "believable" sting after the line
paper(H.flip1, 0.2, 0.5); glideTone(SFX, H.flip1, 0.3, 400, 800, 0.15); glideTone(SFX, H.out, 0.6, 600, 1100, 0.07); bell(SFX, 14.9, 77, 0.25, 0.2, 1.0); bell(SFX, 15.02, 81, 0.2, 0.2, 1.0);
// E · SOUND ✓ / KNOWS ✕ / code word (soft, under the line), resolved after "code word"
paper(H.flip2, 0.2, 0.5); whoosh(H.push[0], H.push[1] - H.push[0], 0.25); tick2(H.sound, 2600, 0.25); tick2(H.knows, 1600, 0.25); marimba(20.0, 64, 0.38); marimba(20.14, 60, 0.35);
// F · payoff: incoming ring before "So", hang-up clunk after "hang up", saved-number dial beeps + "fine" bell after the line
thump(H.cut4, 0.2); ringT(20.62, 0.2); clunk(23.93, 0.3); tick2(H.contacts + 0.3, 2400, 0.3); bell(SFX, 25.9, 84, 0.3, 0.2, 1.1); bell(SFX, 26.0, 88, 0.25, 0.2, 1.1);
thump(H.cta, 0.25);

// ---------------- narration (DOCKET) + ducking
function readWav(file) {
  const b = fs.readFileSync(file); let o = 12, fmt, data;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === 'data') data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  if (fmt.bits !== 16 || fmt.sr !== SR) throw new Error('unexpected wav ' + file);
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; return x;
}
const venv = new Float32Array(N);
for (const v of C.narration) {
  const x = readWav(path.join(HERE, '../narration/wav', v.id + '.wav')); let pk = 0; for (const s of x) pk = Math.max(pk, Math.abs(s));
  const g = 0.7 / pk, i0 = Math.round(v.t * SR);
  for (let i = 0; i < x.length && i0 + i < N; i++) { VOX[0][i0 + i] += x[i] * g; VOX[1][i0 + i] += x[i] * g; }
  for (let i = Math.max(0, i0 - SR * 0.05); i < Math.min(N, i0 + x.length + SR * 0.1); i++) venv[i] = 1;
}
{ let e = 0; for (let i = 0; i < N; i++) { e += (venv[i] > e ? 1 / (SR * 0.03) : 1 / (SR * 0.25)) * (venv[i] - e); venv[i] = e; } }
function reverb(x, offs) {
  const y = new Float32Array(N), combs = [1557, 1617, 1491, 1422].map((d) => Math.round((d + offs) * SR / 44100)), aps = [556, 225].map((d) => Math.round((d + offs) * SR / 44100));
  for (const d of combs) { const buf = new Float32Array(d); let p = 0, lp = 0; for (let i = 0; i < N; i++) { const o = buf[p]; lp = o * 0.72 + lp * 0.28; buf[p] = x[i] + lp * 0.78; p = (p + 1) % d; y[i] += o * 0.25; } }
  for (const d of aps) { const buf = new Float32Array(d); let p = 0; for (let i = 0; i < N; i++) { const b = buf[p], o = -y[i] + b; buf[p] = y[i] + b * 0.5; p = (p + 1) % d; y[i] = o; } }
  return y;
}
const RV = [reverb(SEND[0], 0), reverb(SEND[1], 23)];
const L = new Float32Array(N), R = new Float32Array(N);
if (process.env.STEM === 'vox') for (const b of [MUS, SFX, RV]) { b[0].fill(0); b[1].fill(0); }   // QA: voice-only stem
for (let i = 0; i < N; i++) {
  const t = i / SR, dm = 1 - 0.62 * venv[i], ds = 1 - 0.4 * venv[i];
  const fade = t > 29.2 ? Math.max(0, 1 - (t - 29.2) / 0.8) : 1, fin = Math.min(1, i / 96);
  for (const [o, ch] of [[L, 0], [R, 1]]) o[i] = Math.tanh(((MUS[ch][i] * 0.6 + RV[ch][i] * 0.28) * dm * fade + SFX[ch][i] * ds * 0.85) * fin + VOX[ch][i]);
}
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / pk, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
const outFile = path.resolve(HERE, process.env.STEM === 'vox' ? '../../build/vox.wav' : '../../build/mix.wav'); fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, buf);
console.log('mix ->', outFile, (N / SR).toFixed(3) + 's', 'gain', g.toFixed(3));
