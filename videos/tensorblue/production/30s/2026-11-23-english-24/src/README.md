# Source — Tensorblue 30s english-24 · episode 01 (SAME MILLISECOND. NO REPEATS. Twitter's Snowflake IDs)

Original code. Format: Blue Receipt Theatre (`brt.mjs`, unchanged), `stage3d.mjs` (unchanged) and `toy3d.mjs` (from english-20, unchanged). English narration and captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/snowflake_test.py` | Our own Python stdlib re-implementation of the 2010 Snowflake README layout (41-bit ms time since `1288834974657`, 10-bit machine, 12-bit counter). Not Twitter's code. Three machines make IDs in one real captured millisecond and the next. It checks uniqueness, time order, decoding and that a backwards clock is refused, then writes `demo/out/snowflake-test.json`. |
| `demo/js_precision.mjs` | Node: turns the same IDs into JavaScript `Number`s and records which collide (12 → 6), plus a showcase pair. It adds a `js` block to the JSON. |
| `script.json` | English lines; voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s; override `[Tensorblue](/tˈɛnsəɹblˌu/)` ("IDs" and "2010" checked in misaki, no override). |
| `scene.mjs` | The toy server room and its objects. **Props:** three towers, the ID plates (real digits), the sinking "one counter" block, TIME/MACHINE/COUNT blocks sized 0.04 units per bit, the sorted 3×3 wall, the string/Number flip and merge. **Text and output:** one headline at a time (centred x 500, ≤ 700 px, gone before each cut), captions at y 280–460, CTA, SFX list, thumbnail. Every texture line throws if it overflows its face. |
| `qa.mjs` | 1) Caption ink inside x 100–900 / y 280–460. 2) Clean top 0–280. 3) No stage pixels in y 280–479. 4) Headline vs props. `QA_HEAD_ONLY=1` runs check 4 only. |
| `mix.py` | SFX plus a per-scene score (seed 20261127, 9 chords); TP ceiling −3.0 dBTP; unknown SFX types raise |
| `render.mjs`, `export-qa.sh`, `transitions.mjs`, `asr.py`, `thumb.mjs`, `dump-events.mjs`, `tts.py` | as in earlier rounds |

## Rebuild
```bash
npm ci
python3 demo/snowflake_test.py demo/out && node demo/js_precision.mjs demo/out   # optional: new clock reading -> new IDs (the committed JSON is what the video shows)
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4      # check: 900 frames before muxing
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english24-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english24-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english24-01.mp4 ../qa/transitions.png && node thumb.mjs ../tensorblue-30s-english24-01-thumbnail.png
# watch sheet by exact frame number (an fps=2 filter with pts labels leads the content by ~0.23 s):
ffmpeg -i ../tensorblue-30s-english24-01.mp4 -vf "drawtext=fontfile=../../../../assets/fonts/Inter-SemiBold.otf:text='%{pts\:hms}':x=6:y=6:fontsize=40:fontcolor=yellow,select='not(mod(n\,15))',scale=270:480,tile=10x3" -fps_mode vfr /tmp/sheet-%d.png
```
