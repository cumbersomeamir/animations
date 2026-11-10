# Ideaverse Discover — "Not My Life" (2026-11-11)

*"My camera roll from a life I never lived."* 25.000 s vertical film, 1080×1920, 30 fps (750 frames), H.264 yuv420p + AAC.
No voiceover, no speech. Isolated production; it is not part of the Ideaverse application repository.

## Deliverables (`out/`)
| file | what |
|---|---|
| `not-my-life-25s.mp4` | picture + original score + sound design |
| `not-my-life-25s-no-music.mp4` | identical picture + sound design only |
| `thumbnail.png` / `thumbnail.jpg` | 1080×1920, real 6-of-30 frame + "NOT MY LIFE." |
| `audio/` | lossless FLAC of both mixes + the score stem (48 kHz, exactly 1,200,000 samples, loop-periodic) |
| `qa/` | `report.json` (ffprobe, decode, frame count, black/frozen, loop seams, loudness, onsets), `textboxes.json`, transition + overview contact sheets, audio waveform/spectrum |
| `not-my-life-project.zip` | editable project (code, docs, manifest, genuine clip, all slots/UI plates/plates/fonts, thumbnail, QA, FLAC audio); excludes `node_modules/`, `cache/`, `build/`, the MP4s and the 52 MB raw recording (fetched + SHA-256-verified by `scripts/fetch_sources.sh`). Rebuild with `bash scripts/package.sh`. |

Docs: [`source-selection.md`](source-selection.md) (factual source timecodes, stand-ins, music origin/licence) ·
[`insertion-guide.md`](insertion-guide.md) (replacement slots: timecodes, frames, framing, moves, handles, layers) ·
[`manifest.json`](manifest.json) (machine-readable slots/plates/render settings).

## Timeline (no narration)
| time | frames | beat |
|---|---|---|
| 0.0–3.0 | 0–89 | Hook: close-up of the phone on the real Discover grid; camera dives into one tile — a cafe photo of a couple. "NEVER HAPPENED." |
| 3.0–3.5 | 90–104 | 0.5 s black card with the same words. |
| 3.5–6.0 | 105–179 | Superhook: the same result, held, then it actually moves (real 6-of-30 video result). "THEN ONE MOVED." It swipes up into depth. |
| 6.0–16.0 | 180–479 | Three reveals (stand-ins for underwater dinner / Tokyo night / space): dinner card in teal caustics → real feed scroll proof → night portrait in neon rain → fire portrait in deep space, dolly-zoom, push-through. |
| 16.0–22.0 | 480–659 | Payoff: reverse perspective — the phone (real recording) now floats inside a world, among floating result cards. |
| 22.0–25.0 | 660–749 | Viewer closes to the grid (real), "Which life would you pick?", camera returns to the opening composition; f749 → f0 and the audio loop are seamless. |

## Build
Requirements: Node 22, Python 3.11+ with numpy, pillow, scipy; FFmpeg 6; Chromium via Playwright (pre-installed here).
```bash
npm install                                  # three@0.170.0
bash scripts/fetch_sources.sh                # verifies the clip, downloads the 52 MB raw recording from the public Drive folder
python3 scripts/prepare_assets.py            # (re)builds slots/UI plates from the sources + render cache
#   without the raw recording: python3 scripts/prepare_assets.py --slots-only   (uses the committed assets/)
node scripts/render.mjs --workers 2          # Three.js scene -> build/segments/* -> build/video.mp4
python3 scripts/audio.py                     # build/audio/{music,sfx,mix_full,mix_nomusic}.wav
bash scripts/mux.sh                          # out/*.mp4
python3 scripts/thumbnail.py                 # out/thumbnail.png
python3 scripts/qa.py                        # build/qa/report.json + contact sheets
```
Stills for inspection: `node scripts/render.mjs --png 0,90,285,480 --dir build/stills`.

## Structure
```
assets/sources/   genuine clip (attachment = Drive clips/01-...mp4)
assets/slots/     replaceable footage slots (placeholders cut from the real recordings)
assets/ui/        genuine UI plates (never replaced with generated content)
assets/plates/    real result used as an editorial card
assets/fonts/     Inter Display (OFL)
scene/            index.html + main.js — deterministic Three.js renderer (window.NML.renderFrame(f))
scripts/          fetch, prepare, render, audio, mux, thumbnail, qa, package
manifest.json     slots, UI plates, render parameters
```
