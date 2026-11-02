# QA — `recall-30s-feedback-01.mp4`

- **File:** `videos/recall/production/30s/2026-11-02-feedback-round/recall-30s-feedback-01.mp4`
- **sha256:** `1f7208ec0e46fa37da69a3c8ee1e2c6595f2fc36c4f81302086e402258fef555`
- **Size:** 18,766,196 bytes

**How it was checked:** `qa/qa.py` checks the final MP4. `qa/narration_sync.py` checks narration timing. Raw outputs are in `qa_report.json`, `ffprobe.json` and `narration_sync.json`. **Result: all 25 automated checks pass, and the narration sync check passes.**

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 84.6 > 12); longest static run 3 frames (limit < 60); luma min/mean/max 84.6 / 120.8 / 154.6 |

## Audio
| check | result |
|---|---|
| integrated loudness (EBU R128, final MP4) | **−14.7 LUFS** (target −14 to −16) |
| true peak | **−1.5 dBTP** (≤ −1) |
| loudness range | 4.9 LU |
| clipped samples / decoded peak | 0 / 0.843 |
| voice over bed (per line, mix stage) | +14.1 … +17.3 dB. Music ducks 11 dB and foley 6 dB under the voice |
| music | original pad that changes chord per story beat, with sparse irregular plucks. **No repeating loop** |
| ASR (faster-whisper base.en on the final mix) | **WER 0.0**. The transcript matches the script word for word ("error correction" without the hyphen) |

## Narration timing
Each narration WAV is located in the decoded final audio by cross-correlation.

| line | planned (s) | measured (s) | error | corr | ends (s) | on screen at start → end |
|---|---|---|---|---|---|---|
| l01 "How can a QR code still work…" | 0.25 | 0.250 | 0.0 ms | 0.84 | 3.24 | card_cu → phone_scan (decodes at 2.85) |
| l02 "It stores extra error-correction…" | 4.10 | 4.100 | 0.0 ms | 0.84 | 9.11 | giant_ec (EC tiles light 4.4, plate lifts 6.8, rebuild 7.3–8.6) |
| l03 "Those three large corner squares…" | 10.05 | 10.050 | 0.0 ms | 0.84 | 13.78 | giant_finders (markers 10.25/10.75/11.2) → phone_orient (lock, turn 12.9) |
| l04 "Cover too much, especially those markers…" | 14.65 | 14.650 | 0.0 ms | 0.82 | 17.80 | thumb_ots (thumb 14.55) → giant_covered |
| l05 "A bigger logo isn't always better." | 20.10 | 20.100 | −0.1 ms | 0.83 | 22.04 | giant_big (slam 20.15) → deadpan |
| l06 "Follow Recall for the technology…" | 26.15 | 26.150 | 0.0 ms | 0.83 | 29.81 | cafe_wide (CTA, final 3.85 s) |

## Layout (renderer box log, all 900 frames)
| check | result |
|---|---|
| caption ink bounds | x 132.4–949.3, **y 341.5–464.5** (limits x 90–990, y 340–520) |
| caption lines / size | ≤ 2 lines; Fredoka 600 at 56 px, auto-fit floor 44 |
| y < 300 | no meaningful text in any frame |
| labels | all inside x 100–980, y 560–1460 |
| overlaps (labels/brand vs caption pill) | none |
| phone insert | phone ≈ 56 % of frame width. The result text "HELLO FROM RECALL" is ≈ 50 px cap-to-baseline at y ≈ 1450, above the 1500 bottom band |

## QR code shown in the video (zxing-cpp 2.3.0)
| image | expected | decoded |
|---|---|---|
| card, small logo (`build/cards/card_small.png`) | decodes | "HELLO FROM RECALL" ✓ |
| card, 15×15 sticker (`card_big.png`) | fails | nothing ✓ |
| card, thumb over the top-right marker (`card_thumb.png`) | fails | nothing ✓ |
| final MP4 frame 3.0 s (phone insert) | decodes | "HELLO FROM RECALL" |
| final MP4 frame 24.9 s (phone insert) | decodes | "HELLO FROM RECALL" |

The flat-render tests and codeword counts are in `docs/SOURCES.md`. The phone shows "Text found" only in the decodable state.

## Visual review
**What I inspected:**
- `contact_sheet.png`: one frame per second, decoded from the MP4.
- `boundaries.png`: the first and last frame of all 17 shots, plus every caption start.
- Earlier full-resolution test stills.

**Fixes made before the final render:**
1. **Hand blocking the QR in the thumb shot.** The covered marker moved from the top-left to the top-right, so the hand reaches in from the edge. The phone screen, the giant slab and the decode test changed to match.
2. **Phone inserts too small.** The camera moved closer and lower, so the phone is about 49 % → 56 % of frame width and clear of the caption.
3. **Hook caption touched "SCAN ME".** The card shot was reframed.
4. **CTA brand pill overlapped the hair.** The wide shot was reframed.
5. **Two layout checks failed by small margins in the first full render** (run 1): caption ink top at 338.5 px, and the "message data" label bottom at 1475 px. I shifted the captions down 3 px and capped labels at y 1420, then re-rendered all 900 frames.

## Limits (honest)
- I cannot listen. Audio quality is judged by loudness/peak measurement, ducking levels, ASR and cross-correlation only.
- I did not view the Instagram style reference. The style recipe (context/15) follows the user's description of it.
- Phone inserts are POV shots with the person hidden, so no hands appear in front of the screen. The fingertips at the phone edges are simplified.
- The character does not lip-sync. The narration is voiceover, and the acting is non-verbal by design.
- Decode results come from one open-source decoder on clean renders. They illustrate the idea and are not a rule for every scanner, which is how both the narration and the caption phrase it.
