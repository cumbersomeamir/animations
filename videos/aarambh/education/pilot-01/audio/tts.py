"""Synthesize Bindu's narration lines with Piper TTS (public-domain LJSpeech voice).

Usage (from pilot-01/):
  python audio/tts.py --model /path/to/en_US-ljspeech-medium.onnx --out audio/narration

Raw TTS is then turned into Bindu's character voice by audio/voice.sh
(rubberband pitch/formant shift + EQ + compression). The processed WAVs are
committed, so rendering never blocks on the ~63 MB voice model download.
"""
import argparse, json, wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

LINES = json.loads((Path(__file__).parent / "script.json").read_text())

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--out", default="audio/narration")
    ap.add_argument("--only", default=None)
    a = ap.parse_args()
    voice = PiperVoice.load(a.model)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    for ln in LINES["lines"]:
        if a.only and ln["id"] != a.only:
            continue
        cfg = SynthesisConfig(length_scale=ln.get("length_scale", 1.0),
                              noise_scale=0.6, noise_w_scale=0.7)
        p = out / f"{ln['id']}_raw.wav"
        with wave.open(str(p), "wb") as w:
            voice.synthesize_wav(ln["tts_text"], w, syn_config=cfg)
        with wave.open(str(p)) as w:
            d = w.getnframes() / w.getframerate()
        print(f"{ln['id']}: {d:.2f}s  {ln['tts_text']}")

if __name__ == "__main__":
    main()
