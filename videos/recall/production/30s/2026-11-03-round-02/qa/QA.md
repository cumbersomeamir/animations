# QA — `recall-30s-round02-01.mp4`

- **File:** `videos/recall/production/30s/2026-11-03-round-02/recall-30s-round02-01.mp4`
- **sha256:** `462a6a1161df7e8b4f5ad56eab8647ce0ff11d7a7c319d0192296606fbe09807`
- **Size:** 22,882,838 bytes

**How it was checked:** `qa/qa.py` checks the final MP4, and `qa/narration_sync.py` checks narration timing. Raw outputs are in `qa_report.json`, `ffprobe.json` and `narration_sync.json`. **Result: all 24 automated checks pass, and the narration sync check passes** on the first full render (`build/build1.log`, 12 m 07 s). No defects needed a re-render.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 70.5 > 12); longest static run 1 frame (limit < 60); luma min/mean/max 70.5 / 122.2 / 162.7 |

## Audio
| check | result |
|---|---|
| integrated loudness (EBU R128, final MP4) | **−14.6 LUFS** (target −14 to −16) |
| true peak | **−1.6 dBTP** (≤ −1) |
| loudness range | 4.3 LU |
| clipped samples | 0 |
| voice over bed (per line, mix stage) | +14.9 … +16.9 dB; music ducks 11 dB and foley 6 dB under the voice |
| music | the accepted F01 pad/pluck engine, retimed (chord per story beat, irregular plucks). **No repeating loop** |
| ASR (faster-whisper base.en on the final mix) | **WER 0.0**. The transcript matches the 74-word script |

## Narration timing
Each narration WAV is located in the decoded final audio by cross-correlation.

| line | planned (s) | measured (s) | error | corr | ends (s) | on screen at start → end |
|---|---|---|---|---|---|---|
| l01 "Why are microwaved leftovers…" | 0.25 | 0.250 | 0.0 ms | 0.84 | 4.08 | mw_open (door pops 0.38) → taste_cold (shiver 3.25) |
| l02 "Waves bounce off the metal walls…" | 4.35 | 4.350 | 0.0 ms | 0.83 | 8.90 | giant_waves (trails from 4.45) → giant_pattern (spots 6.25; labels 7.2 / 7.95) |
| l03 "The turntable carries food…" | 9.15 | 9.150 | 0.0 ms | 0.84 | 17.15 | giant_turn (rings) → giant_section (shell 11.4–13.9) → giant_core (inward 14.95–17.1) |
| l04 "So stir halfway, spread food evenly…" | 18.30 | 18.300 | 0.0 ms | 0.85 | 23.08 | panel_pause ("PAUSED", half bar) → stir_spread → giant_stand (evens 21.05–22.95) |
| l05 "Download Recall for learning…" | 26.45 | 26.450 | −0.2 ms | 0.84 | 29.74 | cafe_wide (CTA in the final 3.65 s) |

## Layout (renderer box log, all 900 frames)
| check | result |
|---|---|
| caption ink bounds | x 157.5–921.9, **y 341.5–464.5** (limits x 90–990, y 340–520) |
| caption lines / size | ≤ 2 lines; Fredoka 600 at 56 px (accepted F01 treatment, unchanged) |
| y < 300 | no meaningful text in any frame |
| labels | all inside x 100–980, y 560–1460 |
| overlaps (labels/brand vs caption pill) | none |
| readable screen | the "PAUSED" display insert fills about 65 % of the frame width; "END" is readable in the opening shot. Words only, no times |

## Visual review
**Inspected:**
- `contact_sheet.png`: one frame per second, decoded from the MP4.
- `boundaries.png`: the first and last frame of all 15 shots, plus every caption start.

**Fixed before the full render, from preview stills:**
1. **Opening shot** showed only the door window. It was reframed to an oblique close-up with the "END" display in frame.
2. **"PAUSED" insert** was too close and clipped the word. The camera was moved back.
3. **Steam** read as bubbles. It became soft camera-facing puffs.
4. **Giant cavity** was too tight to read as a microwave. It was given a wider lens and pull-back, and fog was moved back.
5. **Wave trails** were too faint. There are now 8 thicker trails, slower.
6. **Lime strong spots** washed out to white. Additive blending was removed, and they fade during the turntable shot so the heat ring shows.
7. **Surface heat** was too weak to see. The gain was raised.
8. **Spoon hand** blocked the chin. The camera side and spoon angle changed.
9. **Final wide shot** cut the performer, and the pill touched the hair. It was reframed.

## Limits (honest)
- I cannot listen. Audio is judged by loudness/peak measurement, voice-over-bed levels, ASR and cross-correlation only.
- The giant cavity, spot pattern and heat colours are illustrations of the sourced ideas, not a simulation of a real oven (see `docs/SOURCES.md`).
- The CTA's "with AI" is the product owner's wording. It is not found in the saved listing or the rendered public site text (see `docs/SOURCES.md`).
- USDA FSIS and FoodSafety.gov pages refused automated fetches, so FDA, TU Delft and Clemson Extension are the cited sources.
- No lip-sync by design: the narration is voiceover, and the performer acts.
