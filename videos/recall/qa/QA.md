# QA — Recall 30 s production video

File: `videos/recall/output/recall-30s.mp4` (new render, this session). Evidence: `qa/ffprobe.json`, `qa/qa_report.json`, `qa/contact_sheet.png` (1 frame/s), `qa/boundaries.png` (first/last frame of every scene).

## Technical (measured)
| Check | Result |
|---|---|
| Container / codecs | MP4, H.264 High yuv420p + AAC LC 48 kHz stereo 192 kb/s |
| Size / fps / frames | 1080x1920, 30/1, 900 frames |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s |
| Full decode | `ffmpeg -v error -i … -f null -` → no errors |
| Loudness | -16.2 LUFS integrated, LRA 2.9 LU, true peak -1.7 dBFS |
| Clipping | 0 samples ≥ 0.999 (decoded AAC peak 0.82) |
| Narration intelligibility | faster-whisper base.en on the final mix: "Read it, forgot it, again. Notes everywhere, facts nowhere. Meet Recall, bring your study material. Turn it into lessons and practice. Then come back for spaced reviews. Lessons, practice, reviews. Recall, explore on Google Play." = script |
| Voice over bed | +4.5 to +10.7 dB RMS during each line (project/build/audio_balance.json) |

Per-line windowed ASR flags n1b/n6a/n6b only because adjacent one-word lines bleed into the ±0.25 s window; the full transcript is correct. I cannot listen to the audio myself, so subjective mix quality is unverified beyond these measurements.

## Visual review (contact sheets + targeted stills)
| Item | Finding | Action |
|---|---|---|
| Scale | First pass: figures ~23 % of frame height, big empty floor | Camera base zoom 1.12 |
| Caption overlap | Card A crowded the 3-line hook caption | Captions max 96 px at y 250; card hover moved lower |
| Walk feet | After walks, feet snapped back to old keys (stretched legs 18–21 s) | Feet keyed with every hip move |
| Desk overlap | Pick-up and idle poses intersected the desk | Pick-up faces the tile; review idle at x 455 |
| Night tint | Floor not tinted (visible band) | Floor tinted too; amplitude reduced |
| Tile landing | Tile landed on seated student's feet (7.5 s) | Student scoots back; tile moved to x 830 |
| Payoff | Incoming card covered "Practice" label | In-flight cards drawn behind slotted cards; bigger labels |
| End | Student passed in front of the icon | Drawn behind the icon until perched; tagline 50 px |
| Continuity | Same room, desk, tile and three cards carried through; no hard cuts | — |
| Text | All captions inside 940 px width, ≥ 230 px from the top, CTA above the bottom 600 px | — |

## Claims
Only the listing description is used ("study material → lessons, practice, spaced reviews"). No pricing, metrics, outcome guarantees or testimonials. The tile is a stylised illustration of the icon, not product UI; the end card uses the verified icon PNG. "Explore on Google Play" is plain text (no store badge/logo).

## Sources / licences
Original code; Inter (system, OFL); Kokoro-82M v1.0 ONNX (Apache-2.0) voice af_heart generated locally; all music and SFX synthesised in project/audio.py. No paid APIs or secrets.
