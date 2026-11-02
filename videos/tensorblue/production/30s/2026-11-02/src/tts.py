"""Kokoro-82M narration for Tensorblue 30s production 01.

Voice: blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us (lang_code 'a').
Model: official hexgrad/Kokoro-82M (Apache-2.0) via the `kokoro` PyPI package.

usage: python tts.py script.json out_dir [--measure]
  script.json: {"lead": s, "lines": [{"id", "text", "at"?: start seconds, "after": gap}]}
  writes out_dir/voice.wav (24 kHz mono, 30.0 s) and out_dir/voice-timing.json
"""
import json
import sys
import os

import numpy as np
import soundfile as sf
import torch
from kokoro import KPipeline

SR = 24000
VOICE_MIX = [("af_bella", 0.7), ("am_puck", 0.3)]
SPEED = 0.98
REPO = "hexgrad/Kokoro-82M"


def trim(audio, thresh=0.004, pad=0.03):
    """Trim leading/trailing near-silence, keep a small natural pad."""
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio, 0.0
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(audio), idx[-1] + int(pad * SR))
    return audio[a:b], a / SR


def main():
    script_path, out_dir = sys.argv[1], sys.argv[2]
    measure = "--measure" in sys.argv
    script = json.load(open(script_path))
    os.makedirs(out_dir, exist_ok=True)
    torch.manual_seed(0)
    pipe = KPipeline(lang_code="a", repo_id=REPO)
    voice = sum(w * pipe.load_single_voice(name) for name, w in VOICE_MIX)

    takes = []
    for line in script["lines"]:
        chunks, words, t = [], [], 0.0
        for res in pipe(line["text"], voice=voice, speed=SPEED, split_pattern=None):
            aud = res.audio.detach().cpu().numpy() if hasattr(res.audio, "detach") else np.asarray(res.audio)
            for tok in (res.tokens or []):
                if tok.start_ts is None or tok.end_ts is None:
                    continue
                if not any(ch.isalnum() for ch in tok.text):
                    continue
                words.append({"w": tok.text, "t0": t + float(tok.start_ts), "t1": t + float(tok.end_ts)})
            chunks.append(aud)
            t += len(aud) / SR
        audio = np.concatenate(chunks).astype(np.float32)
        audio, cut = trim(audio)
        for w in words:
            w["t0"] = round(max(0.0, w["t0"] - cut), 3)
            w["t1"] = round(max(0.0, w["t1"] - cut), 3)
        takes.append({"id": line["id"], "text": line["text"], "audio": audio, "dur": len(audio) / SR, "words": words})
        print(f'{line["id"]:>4} {len(audio)/SR:6.2f}s  {line["text"]}')

    total_speech = sum(tk["dur"] for tk in takes)
    print(f"speech total {total_speech:.2f}s")
    if measure:
        return

    dur = float(script.get("duration", 30.0))
    out = np.zeros(int(round(dur * SR)), dtype=np.float32)
    t = float(script.get("lead", 0.25))
    timing = {"sr": SR, "duration": dur, "voice": "+".join(f"{n}*{w}" for n, w in VOICE_MIX),
              "speed": SPEED, "lang": "en-us", "model": REPO, "lines": []}
    for line, tk in zip(script["lines"], takes):
        if "at" in line:
            t = max(t, float(line["at"]))
        i0 = int(round(t * SR))
        seg = tk["audio"][: max(0, len(out) - i0)]
        out[i0:i0 + len(seg)] += seg
        timing["lines"].append({
            "id": tk["id"], "text": tk["text"], "t0": round(t, 3), "t1": round(t + tk["dur"], 3),
            "words": [{"w": w["w"], "t0": round(t + w["t0"], 3), "t1": round(t + w["t1"], 3)} for w in tk["words"]],
        })
        print(f'  place {tk["id"]:>4} {t:6.2f} -> {t + tk["dur"]:6.2f}')
        t = t + tk["dur"] + float(line.get("after", 0.35))
    if t > dur:
        print(f"WARNING: narration overruns {dur}s (ends {t:.2f})")
    sf.write(os.path.join(out_dir, "voice.wav"), out, SR, subtype="PCM_16")
    json.dump(timing, open(os.path.join(out_dir, "voice-timing.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
