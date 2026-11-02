# Narration voice provenance
- Engine: Piper TTS, `piper-tts==1.8.0` (PyPI), run locally on CPU. No API, no key.
- Voice: `en_US-ljspeech-high` from https://huggingface.co/rhasspy/piper-voices (repo license: MIT).
  Model card: dataset LJ Speech (https://keithito.com/LJ-Speech-Dataset/), license: public domain.
- Files (downloaded to the session scratchpad, not committed because of size, 114 MB):
  - en_US-ljspeech-high.onnx       sha256 5d4f08ba6a2a48c44592eed3ce56bf85e9de3dd4e20df90541ae68a8310c029a
  - en_US-ljspeech-high.onnx.json  sha256 7e1f4634af596d83cca997fb7a931ba80b70f8a316a2655ee69c55365e0ace14
- Settings: --length-scale 0.92, default noise. Lines and frames: ../timeline.json.
- Music and every sound effect are synthesized in build_audio.py (original; no samples).
