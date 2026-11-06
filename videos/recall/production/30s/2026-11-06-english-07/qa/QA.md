# QA — `recall-30s-english07-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-06-english-07/recall-30s-english07-01.mp4`
- **sha256:** `8a0baddc8bdafb1e1fe9b23092bae3bbade618a6134d39a487afb0f003913b61`
- **Size:** 11,459,324 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: on the first full render (8 m 15 s, one build process), all 25 automated checks pass, and so do narration sync and
caption sync.** Caption sync was also run before rendering (same result).

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 63.2 > 12); longest static run 6 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "Why does your phone rush to 80%? Then crawl to 100%. At first, the charger pushes a big, steady current into the battery. Near full, it holds the voltage steady and lets the current shrink, like pouring slower near the top of a glass. That gentler finish helps the battery last. Keep it cool, too, when it's too warm, charging past 80% can pause. Download Recall for learning any new subject with AI." |
| pronunciation fixes (before rendering) | "race" → "rush" (heard as "raise"); "your pour" → "pouring slower" (heard as "poor"); comma after "80%" removed (1 s pause) |
| numbers | "80%" and "100%" are spoken as "eighty percent" / "one hundred percent" and transcribed as digits |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.5 dBTP**, LRA 4.0 LU, 0 clipped samples |
| voice over bed | +15.3 … +16.7 dB per line (charging hum and bead plinks lowered from +11.7 dB under line 2) |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.40 | 0.400 | 0.0 ms | 0.84 | hook_cu (41% → 80% by 1.6 s, "80%" spoken at 1.6 s) → react |
| l02 | 4.85 | 4.850 | 0.0 ms | 0.85 | giant_cc (constant current, slots filling) |
| l03 | 9.20 | 9.200 | 0.0 ms | 0.85 | giant_cv (80% ring + voltage held 10.1, current shrinks 11.5) → pour_cu (13.1) |
| l04 | 15.95 | 15.950 | 0.0 ms | 0.84 | giant_ease → sun_cu (18.7) → giant_heat (pause 21.9) |
| l05 | 26.35 | 26.350 | −0.2 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.05–0.10 s before their first spoken word and stay until their last.
- The takeaway "Fast to 80%. Keep it cool." is on-screen only (no VO), 23.75–26.25 s.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 175–905, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | inside x 100–980, y 560–1460; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 11 shots,
plus each caption start), both decoded from the final MP4.

**Fixed before the render (from preview stills):**
1. The current and voltage dials were cut at the frame edges; moved inward.
2. React framing (face clear of the captions).
3. Sun shot: the hand covered the screen and the "warm" tag sat on the percentage; the hand now touches the far edge and the tag moved.
4. Shade shot: the phone left the frame while sliding; the camera now follows it.

**Soft spot (not a defect):** the café pendant lamp shows as a dark shape near the top of the react shot.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR (exact transcript) and loudness/ducking measurements.
- The battery animation is illustrative: the 80% switch point follows Apple's description; the curve shapes and times are
  not measured, and the exact switch point varies by device and settings.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
