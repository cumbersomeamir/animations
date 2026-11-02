#!/usr/bin/env python3
"""Mix narration + music + SFX into build/mix.wav (48 kHz stereo, exactly 15.000 s).

Voice +1.9 dB; music ducked 12 dB and SFX 9 dB under narration (60 ms look-ahead, 300 ms release).
Final loudness: two-pass FFmpeg loudnorm to -16 LUFS integrated, -1.5 dBTP.
"""
import json, os, re, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SR = 48000
script = json.load(open(os.path.join(ROOT, 'script.json')))
N = int(round(script['duration'] * SR))


def read(path):
    w = wave.open(path)
    assert w.getframerate() == SR, path
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2:
        a = a.reshape(-1, 2)
    else:
        a = np.stack([a, a], 1)
    return a


def write(path, a):
    a = np.clip(a, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'build')
    os.makedirs(out_dir, exist_ok=True)
    timing = json.load(open(os.path.join(HERE, 'narration', 'timing.json')))
    voice = np.zeros((N, 2)); speech = np.zeros(N)
    for L in timing['lines']:
        a = read(os.path.join(HERE, 'narration', L['id'] + '.wav'))
        i = int(round(L['start'] * SR)); j = min(N, i + len(a))
        voice[i:j] += a[: j - i]
        speech[i:j] = 1
    # ducking envelope with look-ahead and release
    look, rel = int(0.06 * SR), int(0.30 * SR)
    target = np.where(np.roll(np.maximum.accumulate(speech[::-1])[::-1] * 0 + speech, -look) > 0, 1.0, 0.0)
    target[-look:] = speech[-look:]
    duck = np.zeros(N); g = 0.0
    a_c, r_c = np.exp(-1 / (0.04 * SR)), np.exp(-1 / (rel / 3))
    for i in range(N):
        c = a_c if target[i] > g else r_c
        g = c * g + (1 - c) * target[i]
        duck[i] = g
    duck_gain = 10 ** (-12 * duck / 20)   # music under speech
    sfx_duck = 10 ** (-9 * duck / 20)     # effects under speech
    music = read(os.path.join(HERE, 'stems', 'music.wav'))[:N]
    sfx = read(os.path.join(HERE, 'stems', 'sfx.wav'))[:N]
    mix = voice * 1.25 + music * 0.36 * duck_gain[:, None] + sfx * 0.5 * sfx_duck[:, None]
    pre = os.path.join(out_dir, 'mix-pre.wav')
    write(pre, mix * (0.7 / (np.max(np.abs(mix)) + 1e-9)))

    # two-pass loudnorm
    target_i, target_tp, target_lra = -16, -1.5, 11
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', pre, '-af',
                        f'loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0))
    final = os.path.join(out_dir, 'mix.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', pre, '-af',
                    f"loudnorm=I={target_i}:TP={target_tp}:LRA={target_lra}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                    f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
                    f"aresample={SR}", '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', final + '.tmp.wav'], check=True)
    a = read(final + '.tmp.wav'); os.remove(final + '.tmp.wav')
    a = a[:N] if len(a) >= N else np.vstack([a, np.zeros((N - len(a), 2))])
    write(final, a)
    # verification measurements on the final mix
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', final, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True)
    summary = r.stderr[r.stderr.rfind('Summary:'):]
    stats = {'samples': len(a), 'seconds': len(a) / SR, 'peak_dbfs': round(20 * np.log10(np.max(np.abs(a)) + 1e-12), 2),
             'ebur128_summary': ' '.join(summary.split())}
    json.dump(stats, open(os.path.join(out_dir, 'mix-stats.json'), 'w'), indent=2)
    print(json.dumps(stats, indent=2))


if __name__ == '__main__':
    main()
