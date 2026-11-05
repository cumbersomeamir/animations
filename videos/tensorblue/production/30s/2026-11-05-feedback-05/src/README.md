# Source — Tensorblue 30s feedback-05 · episode 01 (OCR makes a scanned PDF searchable, Hindi)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). Hindi narration + Devanagari captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/make_demo.py` | builds the invented library slip, then runs the real tools: img2pdf → `scan.pdf` (0 text chars), OCRmyPDF + Tesseract → `searchable.pdf`, Tesseract TSV word boxes, `pdftotext -bbox`; writes `demo/out/ocr.json` |
| `script.json` | final Hindi lines (`text` = caption, `tts` = spoken spelling, e.g. "ओ सी आर"), `lang_code: "h"`, voices `hf_alpha`×0.7 + `hm_omega`×0.3, speed 1.14 |
| `tts.py` | Kokoro-82M; reads language/voices/speed from `script.json`; estimates Hindi word times inside each line |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged): palette, Inter/Inter Display, kinetic words, cards, logo |
| `scene.mjs` | seven staged scenes + blue wipes (search hit, just a picture, Tesseract boxes, layer beneath the image, select + search, terminal takeaway, CTA); Mukta for Devanagari, JetBrains Mono for terminal/recognised text |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr_hi.py` | Hindi ASR (faster-whisper `medium`, `language='hi'`, sentence by sentence): CER/WER + timing drift |

## OCR demo tools (Ubuntu 24.04 archive, apt)
`ocrmypdf 15.2.0+dfsg1-1`, `tesseract-ocr 5.3.4-1build5`, `tesseract-ocr-eng 1:4.1.0-2`, `poppler-utils 24.02.0-1ubuntu9.11`, `python3-img2pdf 0.5.1-1`, `python3-pikepdf 8.7.1+dfsg-2build2`, `fonts-dejavu-core 2.37-8`. The slip is drawn with Pillow 12.3.0. OCRmyPDF is run as `/usr/bin/python3.12 -m ocrmypdf` because the distro launcher picks a Python without pikepdf.

## Rebuild
```bash
npm ci
python3 demo/make_demo.py demo/out                      # fictional slip + real OCR run
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio            # downloads hexgrad/Kokoro-82M + voices/hf_alpha.pt, hm_omega.pt once
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-feedback05-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr_hi.py ../tensorblue-30s-feedback05-01.mp4 ../audio/voice-timing.json ../qa/asr-hi.json
```
Hindi G2P uses the espeak-ng `hi` data bundled with `espeakng-loader` (installed by `misaki[en]`). ASR model: `Systran/faster-whisper-medium` (downloaded once).
