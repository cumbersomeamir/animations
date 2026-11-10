# Asset sources and licenses (Meshline videos)

| Item | Source | License |
|---|---|---|
| `assets/icon.png`, `assets/listing.json` | Approved app assets (saved public Play listing, Oct 2026), sha256 in `context/03-assets.json` | App owner's assets |
| All animation, characters, backgrounds, UI glyphs | Original, code-drawn in `project/src` (and `tests/*/src`) | Original work for this app |
| Music and SFX | Synthesised from scratch with numpy/scipy oscillators, noise and filters (`project/audio/mix.py`, `tests/15s/audio`). No samples. | Original work |
| Narration WAVs | Generated locally with Kokoro-82M (onnx-community/Kokoro-82M-v1.0-ONNX, voice `af_heart`) via `kokoro-onnx` | Apache-2.0 (model and voices) |
| Fonts | Inter / Inter Display (rsms/inter, Debian `fonts-inter`) | OFL-1.1, see `project/fonts/LICENSE-Inter-debian-copyright.txt` |
| Renderer | `@napi-rs/canvas` 1.0.11 (npm) + FFmpeg 6.1 (system) | MIT / LGPL-GPL (system tool, not redistributed) |
| text-message-animation skill (15s test) | iart-ai/text-message-video-skills, read as reference only and reimplemented in original code (`tests/15s/SKILL-NOTES.md`) | MIT |
| Educational pilot 01 (cast, score, voice blend) | Original code in `education/pilot-01/` — see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s #01 (transit map) | Original code in `production/30s/2026-11-02/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s #02 (transit map, walkie-talkie) | Original code in `production/30s/2026-11-02-batch-02/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s store-and-forward (2026-11-03) | Original code in `production/30s/2026-11-03/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s round 02 (2026-11-03, direct radio vs network route) | Original code in `production/30s/2026-11-03-round-02/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s Hindi batch 03 (2026-11-03, airplane mode) | Original code in `production/30s/2026-11-03-hindi-03/`; Noto Sans Devanagari (OFL-1.1) in its `fonts/`; Kokoro Hindi voice hf_beta; see its `LICENSE-NOTES.md` | Original work / OFL-1.1 font / Apache-2.0 voice model |
| Production 30s Hindi batch 04 (2026-11-04, GPS without data / offline maps) | Original code in `production/30s/2026-11-04-hindi-04/`; Noto Sans Devanagari (OFL-1.1) in its `fonts/`; Kokoro Hindi voice hf_beta; see its `LICENSE-NOTES.md` | Original work / OFL-1.1 font / Apache-2.0 voice model |
| Production 30s batch 2026-11-05-feedback-05 (Hindi, headphones behind a wall) | Original code in `production/30s/2026-11-05-feedback-05/`; Noto Sans Devanagari (OFL-1.1) in its `fonts/`; Kokoro Hindi voice hf_beta; see its `LICENSE-NOTES.md` | Original work / OFL-1.1 font / Apache-2.0 voice model |
| Production 30s batch 2026-11-06-english-06 (English, sent vs delivered) | Original code in `production/30s/2026-11-06-english-06/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s batch 2026-11-06-english-07 (English, upload vs download) | Original code in `production/30s/2026-11-06-english-07/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s batch 2026-11-07-english-08 (English, latency vs bandwidth) | Original code in `production/30s/2026-11-07-english-08/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s batch 2026-11-08-english-09 (English, packet loss and jitter) | Original code in `production/30s/2026-11-08-english-09/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
| Production 30s batch 2026-11-09-english-10 (English, full Wi-Fi bars but no internet) | Original code in `production/30s/2026-11-09-english-10/`; see its `LICENSE-NOTES.md` | Original work / Apache-2.0 voice model |
