"""Generate narration lines for the Aarambh 30s promo with local Kokoro TTS.

Model: Kokoro-82M (Apache-2.0) via kokoro-onnx 0.6.1 (MIT), run fully offline.
Model files (not committed, ~350 MB):
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    sha256 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
    sha256 bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d

Usage: python tts.py <models_dir> <out_dir> [voice] [speed]
"""
import json
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

HERE = Path(__file__).resolve().parent
LINES = json.loads((HERE / "narration.json").read_text())["lines"]

# espeak renders "Aarambh" as "ˈɑːɹɹæmb"; we want "AA-rumb" (आरंभ).
AARAMBH_IPA = "ˈɑːɹʌmb"


def main() -> None:
    models = Path(sys.argv[1])
    out = Path(sys.argv[2])
    voice = sys.argv[3] if len(sys.argv) > 3 else "af_heart"
    speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
    out.mkdir(parents=True, exist_ok=True)
    kokoro = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    tok = Tokenizer()
    for line in LINES:
        ph = tok.phonemize(line["text"], "en-us").replace("ˈɑːɹɹæmb", AARAMBH_IPA)
        audio, sr = kokoro.create(ph, voice=voice, speed=line.get("speed", speed), is_phonemes=True)
        sf.write(out / f"{line['id']}.wav", audio, sr, subtype="PCM_16")
        print(f"{line['id']}\t{len(audio) / sr:.2f}s\t{ph}")


if __name__ == "__main__":
    main()
