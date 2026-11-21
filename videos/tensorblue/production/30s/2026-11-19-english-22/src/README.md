# Source — Tensorblue 30s english-22 · episode 01 (GPS is gone. Why move? the blue dot in a tunnel)

Original code. Format: Blue Receipt Theatre (`brt.mjs`, unchanged) + `stage3d.mjs` (unchanged) + `toy3d.mjs` (from english-20, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/tunnel_sim.py` | our simulation (Python stdlib) of a car through a 600 m S-bend tunnel that slows from 60 to 45 km/h: freeze / straight dead reckoning / + turn sensor / + map matching / + beacons (illustrative 100 m spacing), plus an illustrative accuracy-circle model. Writes `demo/out/tunnel-sim.json` (deterministic). Not any app's code. |
| `script.json` | English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, lead 0.1 s, overrides `[Waze](/wˈAz/)`, `[Tensorblue](/tˈɛnsəɹblˌu/)` |
| `scene.mjs` | the toy world (mountain with portal that lifts, tunnel road with walls/ribs/lamps, toy car, blue-dot puck over an accuracy disc, GPS-fix pins, wall beacons), a foreground phone map on its own fixed camera (road + blue dot + light-blue circle only), one headline per shot, captions at y 280–460, CTA, SFX list, thumbnail |
| `qa.mjs` | caption ink inside x 100–900 / y 280–460; clean top 0–280; no stage pixels in y 280–479 |
| `mix.py` | SFX + quiet per-shot score; true-peak ceiling −3.0 dBTP (the AAC encode overshot −1.6) |
| `render.mjs`, `export-qa.sh`, `transitions.mjs`, `asr.py`, `thumb.mjs`, `dump-events.mjs`, `tts.py` | as in earlier rounds |
| `proj-check.mjs` | dev helper for camera layout (not used by the render) |

## Rebuild
```bash
npm ci
python3 demo/tunnel_sim.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
HF_HUB_OFFLINE=1 python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4      # check: 900 frames before muxing
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english22-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english22-01.mp4 ../audio/voice-timing.json ../qa/asr.json
node transitions.mjs ../tensorblue-30s-english22-01.mp4 ../qa/transitions.png && node thumb.mjs ../tensorblue-30s-english22-01-thumbnail.png
```
