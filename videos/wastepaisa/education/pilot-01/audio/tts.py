#!/usr/bin/env python3
"""Narration for WastePaisa educational pilot 01.

Synthesises each line of ../script.json with Piper (en_US-kristin-medium,
trained from scratch on public-domain LibriVox recordings), trims padding,
applies a light "tin-can" character treatment and writes:

  narration/raw/<id>.wav      untreated Piper output (22.05 kHz)
  narration/<id>.wav          treated, trimmed, 48 kHz mono
  narration/timing.json       start/end/duration per line (seconds)

Piper output is stochastic, so the committed WAVs are the reproducible source of
truth. Use --regen to synthesise again (needs PIPER_BIN and PIPER_VOICE_DIR).
With --regen and VOSK_MODEL set, up to TAKES takes per line are generated and the
take whose *treated* audio gets the best offline-ASR word accuracy is kept; the
transcripts are stored in timing.json as intelligibility evidence.
--only L3[,L4] limits --regen to those lines (others keep their approved takes).
Without --regen the script only re-applies treatment and re-measures timing.
"""
import difflib, re, shutil
import json, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'narration')
RAW = os.path.join(OUT, 'raw')
SR = 48000

# Character treatment: +7 % pitch with formants shifted (a slightly smaller
# creature), very short comb echoes for a faint tin resonance, gentle EQ.
VOICE_FILTER = (
    'aresample=48000,'
    'rubberband=pitch=1.07:formant=shifted:pitchq=quality,'
    'aecho=in_gain=0.92:out_gain=0.92:delays=2.6|4.3:decays=0.22|0.14,'
    'highpass=f=110,'
    'equalizer=f=260:t=q:w=1.0:g=-2,'
    'equalizer=f=3300:t=q:w=1.2:g=2.5'
)


def read_wav(path):
    w = wave.open(path)
    sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
    a = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768
    if ch > 1:
        a = a.reshape(-1, ch).mean(1)
    return a, sr


def write_wav(path, a, sr):
    a = np.clip(a, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((a * 32767).astype(np.int16).tobytes())


def trim(a, sr, thr=0.012, pad_in=0.03, pad_out=0.06):
    env = np.convolve(np.abs(a), np.ones(int(sr * 0.005)) / int(sr * 0.005), 'same')
    idx = np.where(env > thr)[0]
    s = max(0, idx[0] - int(pad_in * sr)); e = min(len(a), idx[-1] + int(pad_out * sr))
    out = a[s:e].copy()
    f = int(0.008 * sr)  # de-click fades
    out[:f] *= np.linspace(0, 1, f); out[-f:] *= np.linspace(1, 0, f)
    return out


def norm_words(s):
    return re.sub(r"[^a-z' ]", ' ', s.lower()).split()


_asr_model = None
def asr(path):
    """Offline transcript (Vosk small en-US) or None if Vosk is unavailable."""
    global _asr_model
    if not os.environ.get('VOSK_MODEL'):
        return None
    from vosk import Model, KaldiRecognizer, SetLogLevel
    SetLogLevel(-1)
    if _asr_model is None:
        _asr_model = Model(os.environ['VOSK_MODEL'])
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000',
                          '-f', 's16le', '-'], capture_output=True, check=True).stdout
    r = KaldiRecognizer(_asr_model, 16000)
    for i in range(0, len(pcm), 8000):
        r.AcceptWaveform(pcm[i:i + 8000])
    return json.loads(r.FinalResult()).get('text', '')


def word_acc(ref, hyp):
    a, b = norm_words(ref), norm_words(hyp or '')
    m = sum(bl.size for bl in difflib.SequenceMatcher(None, a, b).get_matching_blocks())
    return m / max(len(a), len(b), 1)


def treat(raw, line_id):
    tmp = os.path.join(OUT, line_id + '.treated.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', VOICE_FILTER,
                    '-ac', '1', '-ar', str(SR), tmp], check=True)
    a, sr = read_wav(tmp); os.remove(tmp)
    a = trim(a, sr)
    a *= 0.89 / (np.max(np.abs(a)) + 1e-9)  # peak -1 dBFS per line; final loudness set in mix
    out = os.path.join(OUT, line_id + '.wav')
    write_wav(out, a, SR)
    return out, len(a) / SR


def main():
    regen = '--regen' in sys.argv
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    script = json.load(open(os.path.join(ROOT, 'script.json')))
    os.makedirs(RAW, exist_ok=True)
    timing = []
    for line in script['lines']:
        raw = os.path.join(RAW, line['id'] + '.wav')
        best = None
        if (regen and (only is None or line['id'] in only)) or not os.path.exists(raw):
            piper = os.environ['PIPER_BIN']
            model = os.path.join(os.environ['PIPER_VOICE_DIR'], script['voice']['model'] + '.onnx')
            for k in range(int(os.environ.get('TAKES', '6'))):
                take = os.path.join(RAW, f"{line['id']}.take{k}.wav")
                subprocess.run([piper, '-m', model, '-f', take], input=line['text'].encode(),
                               check=True, capture_output=True)
                out, _ = treat(take, line['id'])
                hyp = asr(out)
                acc = word_acc(line['text'], hyp) if hyp is not None else 0.0
                print(f"  {line['id']} take{k}: acc={acc:.2f} '{hyp}'")
                if best is None or acc > best[0]:
                    best = (acc, take)
                if hyp is None or acc >= 0.999:
                    break
            shutil.copy(best[1], raw)
            for f in os.listdir(RAW):
                if '.take' in f:
                    os.remove(os.path.join(RAW, f))
        out, d = treat(raw, line['id'])
        hyp = asr(out)
        timing.append({'id': line['id'], 'text': line['text'], 'start': line['start'],
                       'duration': round(d, 3), 'end': round(line['start'] + d, 3),
                       'asr_transcript': hyp,
                       'asr_word_accuracy': None if hyp is None else round(word_acc(line['text'], hyp), 3)})
    for a, b in zip(timing, timing[1:]):
        gap = b['start'] - a['end']
        flag = '' if gap >= 0.25 else '  <-- GAP TOO SMALL'
        print(f"{a['id']}->{b['id']} gap {gap:.2f}s{flag}")
    last = timing[-1]['end']
    print(f"last line ends {last:.2f}s (video {script['duration']}s)")
    if last > script['duration'] - 1.2:
        print('WARNING: narration leaves under 1.2 s for the takeaway hold')
    json.dump({'sample_rate': SR, 'lines': timing}, open(os.path.join(OUT, 'timing.json'), 'w'), indent=2)
    for t in timing:
        print(f"{t['id']} {t['start']:.2f}-{t['end']:.2f} ({t['duration']:.2f}s) {t['text']}")


if __name__ == '__main__':
    main()
