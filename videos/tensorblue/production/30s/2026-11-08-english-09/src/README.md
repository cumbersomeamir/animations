# Source — Tensorblue 30s english-09 · episode 01 (works for your friend, fails for you: DNS caching)

Original code. Format: Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged). English narration + captions. Notes: `../production-notes.md`.

| file | role |
|---|---|
| `demo/dns_demo.py` | real DNS run on 127.0.0.1: dnslib authoritative server for `shop.example` (TTL 30), two dnsmasq caching resolvers, questions asked with dig; the record moves from 192.0.2.10 to 198.51.100.20; writes `demo/out/dns-demo.json` |
| `script.json` | final English lines, voice `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98; overrides for Tensorblue, time-to-live, elsewhere |
| `tts.py` | Kokoro-82M narration + word timings |
| `brt.mjs` | Blue Receipt Theatre kit (unchanged) |
| `scene.mjs` | seven staged scenes + blue wipes (works there / fails here, lookup + cache, the move and the stale answer, friend's fresh answer, diagnostic, lower-the-TTL tip, CTA); reads `dns-demo.json` and stops if a result changes |
| `dump-events.mjs`, `mix.py` | event-linked SFX + quiet per-scene score, loudness normalisation |
| `render.mjs`, `qa.mjs`, `export-qa.sh` | frames → ffmpeg; caption/top-band pixel QA; mux + export gates |
| `asr.py` | one faster-whisper `base.en` pass over the narration span: WER + word-timing drift |

## Rebuild
```bash
npm ci
sudo apt install dnsmasq-base bind9-dnsutils
python3.12 -m venv demovenv && demovenv/bin/pip install dnslib==0.9.26 && demovenv/bin/python demo/dns_demo.py demo/out
python3.12 -m venv venv && . venv/bin/activate
pip install torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements-audio.txt
python tts.py script.json ../audio
node dump-events.mjs ../audio/sfx-events.json && python mix.py ../audio
node render.mjs video /tmp/silent.mp4
./export-qa.sh /tmp/silent.mp4 ../audio/mix.wav ../tensorblue-30s-english09-01.mp4 ../qa
node qa.mjs ../qa/caption-qa.json && python asr.py ../tensorblue-30s-english09-01.mp4 ../audio/voice-timing.json ../qa/asr.json
```
