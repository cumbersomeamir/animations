# Aarambh production 30 s #01: Marie Curie, two sciences, two Nobel Prizes

**Final file:** `aarambh-30s-production-01.mp4`
- 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC 48 kHz stereo
- sha256 `83cdfef3825d7cb19241a0f02fb117bfeadc5413af33def2129cb5ea825fb986`

**Records:**
- Full brief, final script, source-to-claim map, storyboard and QA: `../../../../context/12-production-30s-01.md`
- Durable format rules (genre, style module, palette, caption safe areas, audio config): `../../../../context/11-production-format.md`

**Assets and licences:**
- `assets/marie-curie-c1920-henri-manuel-PD.jpg`: Wikimedia Commons "File:Marie_Curie_c._1920s.jpg", Henri Manuel, c. 1920, **public domain**
- `assets/becquerel-plate-1896-PD.jpg`: Wikimedia Commons "File:Becquerel_plate.jpg", Henri Becquerel, "Photographic plate … showing effects of exposure to radioactivity", **public domain**
- Fonts: Fraunces and Inter (OFL, @fontsource npm), JetBrains Mono (OFL)
- Music and SFX: original procedural (`audio/build_audio.py`)
- Voice: Kokoro-82M ONNX v1.0 (Apache-2.0 model, official kokoro-onnx release files), blend 0.7 af_bella + 0.3 am_puck, speed 0.98, en-us. Takes are committed in `audio/narration/`.
- Art direction: read-only, from https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/archive-lighttable/STYLE.md. No code from it was used.

## Rebuild
```bash
# node_modules -> ../../../education/pilot-01/node_modules (same pinned package.json); python venv with numpy, scipy (+ kokoro-onnx for TTS, faster-whisper for ASR)
python audio/tts_kokoro.py <kokoro-v1.0.onnx> <voices-v1.0.bin>      # optional: regenerates audio/narration/S*.wav
python tools/asr_words.py build/vo_timing.wav qa/asr_words_narration.json   # word timings (committed)
node src/render.mjs --cues                                          # src/cues.json (SFX timing from word times)
python audio/build_audio.py                                         # build/mix.wav (−15 LUFS, TP −1.5)
node src/render.mjs --out build/video.mp4                           # ~93 s
ffmpeg -y -i build/video.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 30 -movflags +faststart aarambh-30s-production-01.mp4
```

## QA files
- `qa/ffprobe.txt`, `qa/full_decode.log`, `qa/loudness.txt`, `qa/caption_bounds.txt`, `qa/sha256.txt`
- `qa/asr_words_narration.json`, `qa/asr_words_final.json`, `qa/asr_final.txt`
- `qa/contact_representative.jpg`, `qa/contact_transitions.jpg`
