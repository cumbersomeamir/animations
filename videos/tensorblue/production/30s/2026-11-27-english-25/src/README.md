# Source — Tensorblue 30s english-25 · episode 01 (JUST PLAYED. UP AGAIN? Spotify's "Fewer Repeats" shuffle)

Original code. Format: Blue Receipt Theatre (`brt.mjs`, unchanged), `stage3d.mjs` (unchanged) and `toy3d.mjs` (from english-20, unchanged). English narration and captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/shuffle_test.py` | Our own Python stdlib model of Spotify's Standard vs Fewer Repeats shuffle (13 Nov 2025 post). Standard is one random value per song, then a sort. Fewer Repeats is the best of 10 random orders by freshness (our weights). 20,000 trials, plus a worked example from the first draw of a fresh generator. Writes `demo/out/shuffle-test.json`; the renderer reads every number from it and throws if results change. |
| `script.json` | English lines; voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s; overrides `[Spotify](/spˈɑtɪfˌI/)`, `[Spotify's](/spˈɑtɪfˌIz/)`, `[Tensorblue](/tˈɛnsəɹblˌu/)` |
| `scene.mjs` | The toy listening room and its objects. **Props:** the queue (real first-draw order, amber = just played), five coins, a deck of ten real candidate panels with counting-down badges, two proof trays (3 vs 1 amber of 12), a die and three generic feed cards. **Text and output:** one headline at a time (centred x 500, ≤ 700 px, gone before each cut), captions at y 280–460, CTA, SFX list, thumbnail. Every texture line throws if it overflows its face. |
| `qa.mjs` | caption bounds, clean top, caption band, headline vs props (`QA_HEAD_ONLY=1` for check 4 only) |
| `amber-extent.mjs` | dev helper: the rightmost amber pixel per given time (keeps amber labels out of the right-side controls zone): `node amber-extent.mjs 0,1,2,3` |
| `mix.py` | SFX plus a per-scene score (seed 20261128, 9 chords); TP ceiling −3.0 dBTP; unknown SFX types raise |
| `render.mjs`, `export-qa.sh`, `transitions.mjs`, `asr.py`, `thumb.mjs`, `dump-events.mjs`, `tts.py` | as in earlier rounds |

## Rebuild
```bash
npm ci
python3 demo/shuffle_test.py demo/out      # deterministic (seeded)
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4      # streams frames into ffmpeg; check 900 frames before muxing
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english25-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english25-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english25-01.mp4 ../qa/transitions.png && node thumb.mjs ../tensorblue-30s-english25-01-thumbnail.png
# watch sheet by exact frame number:
ffmpeg -i ../tensorblue-30s-english25-01.mp4 -vf "drawtext=fontfile=../../../../assets/fonts/Inter-SemiBold.otf:text='%{pts\:hms}':x=6:y=6:fontsize=40:fontcolor=yellow,select='not(mod(n\,15))',scale=270:480,tile=10x3" -fps_mode vfr /tmp/sheet-%d.png
```
