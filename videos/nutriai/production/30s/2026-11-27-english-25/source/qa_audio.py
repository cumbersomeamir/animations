"""QA: voice vs background balance on the pre-master stems (build/mix.wav, build/voice.wav; background = mix - voice = ambient bed + foley), 50 ms windows."""
import os, wave
import numpy as np
here = os.path.dirname(os.path.abspath(__file__))
def rd(n):
    w = wave.open(os.path.join(here, 'build', n)); return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32).mean(1) / 32768, w.getframerate()
mix, sr = rd('mix.wav'); vo, _ = rd('voice.wav'); bg = mix - vo; hop = sr // 20
rms = lambda x: 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + hop] ** 2) + 1e-12) for i in range(0, len(x) - hop + 1, hop)]))
V, B = rms(vo), rms(bg); sp = V > -40; ratio = V - B; tight = np.where(sp & (V > -32) & (ratio < 6))[0]
print('Audio balance (pre-master stems build/mix.wav and build/voice.wav; background = mix - voice = ambient bed + foley), 50 ms windows')
print(f'speech windows: {sp.sum()} of {len(V)} ({sp.sum() / 20:.1f} s); median voice {np.median(V[sp]):.1f} dBFS; median background while speaking {np.median(B[sp]):.1f} dBFS')
print(f'median voice-to-background ratio while speaking: {np.median(ratio[sp]):.1f} dB; windows with voice > -32 dBFS and ratio < 6 dB: {len(tight)}')
pk = np.max(np.abs(mix)); print(f'background between lines: median {np.median(B[~sp]):.1f} dBFS, max {np.max(B[~sp]):.1f} dBFS; mix sample peak {20 * np.log10(pk):.1f} dBFS (pre-master), clipped samples {int(np.sum(np.abs(mix) >= 0.9999))}')
print('tight windows (s, voice dBFS, background dBFS):', [(float(round(i / 20, 2)), float(round(V[i], 1)), float(round(B[i], 1))) for i in tight])
