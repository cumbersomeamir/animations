"""Kokoro-82M ONNX narration per sentence. Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (the established Aarambh English narrator).
Phoneme overrides: script.json "phoneme_overrides" replace espeak phonemes before synthesis (used for names).
Usage: python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>"""
import sys, json, wave, numpy as np
from pathlib import Path
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
here = Path(__file__).parent
k = Kokoro(sys.argv[1], sys.argv[2]); tok = Tokenizer()
style = 0.7 * k.get_voice_style("af_bella") + 0.3 * k.get_voice_style("am_puck")
S = json.loads((here / "script.json").read_text())
for s in S["sentences"]:
    ph = tok.phonemize(s["tts"], "en-us")
    for a, b in S.get("phoneme_overrides", {}).items(): ph = ph.replace(a, b)
    x, sr = k.create(ph, voice=style, speed=0.98, lang="en-us", is_phonemes=True)
    with wave.open(str(here / f"narration/{s['id']}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    print(s["id"], round(len(x) / sr, 2), ph)
