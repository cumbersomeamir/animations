# Source — Tensorblue 30s english-18 · episode 01 (ten seconds, one song: how Shazam fingerprints audio)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) plus the original 3D stage `stage3d.mjs` (unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/fingerprint_demo.py` | our implementation of the audio-fingerprint method in Wang (2003, Shazam): spectrogram peaks ("constellation map"), anchor/target pairs hashed as (freq 1, freq 2, time gap), database lookup, and a histogram of time offsets per track. Six made-up 60-s tracks, a 10-s clip of track 3 from 37 s buried in synthetic café noise at 0 dB SNR, plus a hummed version and an SNR sweep. Writes `demo/out/fingerprint-demo.json`. Not Shazam's code. |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s (hook audio at once), `[Tensorblue](/tˈɛnsəɹblˌu/)` override |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `stage3d.mjs` | original mini 3D stage (perspective camera, lit/textured box faces, contact shadows, floor spotlight) |
| `scene.mjs` | two 3D worlds joined by a wipe. Café: frame zero shows "TEN SECONDS. ONE SONG." with a glowing spectrogram "sound shard" over a phone; the terrain becomes star-like peaks; one pair becomes a HASH card. Database: six songs as star-chart lanes; the hashes rain down as hits, 21 stack at 37 s on track 3, and the shard docks there with its song stars lining up; a hummed shard finds no stack. Adds a small lit-cylinder helper (table, cup). Reads the test's result and stops if it changes. The thumbnail is frame zero + the wordmark. |
| `thumb.mjs` | writes the separate 1080×1920 thumbnail (frame zero) |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-shot score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption (x 100–900, y 340–520) and top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

Colours: the Tensorblue palette plus tensorblue.com's own Tailwind tokens cyan-400 `#00D3F2` (the matching stars and the stack) and amber-400 `#FFB900` (hashes in flight, the hum).

## Rebuild
```bash
npm ci
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python demo/fingerprint_demo.py demo/out
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english18-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english18-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node thumb.mjs ../tensorblue-30s-english18-01-thumbnail.png
```
