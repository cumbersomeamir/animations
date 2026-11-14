# QA — `recall-30s-english14-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-14-english-14/recall-30s-english14-01.mp4`
- **sha256:** `4fd2be2ecde5f32d65cc730c4ede9d1d9fffd6c91c991190385468883bb0aeae`
- **Size:** 12,370,821 bytes
- **Thumbnail:** `recall-30s-english14-01-thumbnail.png`, 1080x1920 PNG, sha256 `de81f5b19940b3f23767d1a87ddcc60e14a5280ead6e1b07c31caa7010fe049b`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption check uses the
batch safe area (x 100–900); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the first full render (no re-render
needed).

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 96.2 > 12); longest static run 6 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "Leave the fridge open on a hot day, and the kitchen gets warmer. So how can a cold box heat a room? A fridge doesn't make cold. It pumps heat. Cold fluid in the inside coils evaporates, soaking up your food's heat. A compressor squeezes it hotter than the room, and coils outside the box release that heat. Door open, that heat just circles back plus the motor's own. That's why air conditioners dump their heat outdoors. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.7 LUFS**, true peak **−1.5 dBTP** (−1.6 dBTP in the mix before AAC), LRA 1.8 LU, **0 clipped samples** |
| voice over bed | +16.5 … +19.4 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.20 | 0.200 | 0.0 ms | 0.84 | hook_fridge (fridge swung open, mist, fanning; thermometer "warmer") |
| l02 | 4.10 | 4.100 | 0.0 ms | 0.85 | react (puzzled, thermometer) |
| l03 | 6.30 | 6.300 | 0.0 ms | 0.85 | giant_pump (heat into the inside coils, out of the back: "heat out") |
| l04 | 9.15 | 9.150 | −0.1 ms | 0.86 | giant_inside (blue refrigerant warms while absorbing: "evaporates") |
| l05 | 13.80 | 13.800 | 0.0 ms | 0.85 | giant_back ("compressor"; hot red refrigerant; heat into the room: "hotter than the room") |
| l06 | 19.15 | 19.150 | 0.0 ms | 0.86 | giant_loop (door open: heat circles back; "+ motor heat") |
| l07 | 23.00 | 23.000 | 0.0 ms | 0.84 | giant_ac (heat leaves through the outdoor unit: "heat goes outdoors") |
| l08 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 12 spoken caption groups appear 0.07–0.10 s before their first spoken word and stay until their last.

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | **x 212–868, y 341.5–464.5** (limits x 100–900, y 340–520); ≤ 2 lines; 56 px (a few long lines 48–54 px) |
| y < 300 | no meaningful text |
| labels | 7 brief labels, **at most one at a time**, inside x 110–890, y 566–1459; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 8 shots, plus
each caption start), both decoded from the final MP4, and the thumbnail. Every boundary frame shows the right caption and
label for its shot (no stale overlay).

**Fixed before the full render (from preview stills):** the react close-up cut the performer's face; the giant_pump and
giant_loop framings were too tight and the heat bits too small in wide shots; the AC set's outdoor unit was cut off and its
wall shadow darkened the room (units moved, key light from the left-front); the thumbnail's words spilled past x 900 and
covered the face (smaller words, dedicated thumbnail camera).

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- The kitchen's warming is a principle from the sources (small in practice; not quantified); thermometer needles, heat bits,
  fluid colours and coil layout are illustrative.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
