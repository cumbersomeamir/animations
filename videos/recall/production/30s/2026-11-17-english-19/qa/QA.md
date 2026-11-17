# QA — `recall-30s-english19-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-17-english-19/recall-30s-english19-01.mp4`
- **sha256:** `78e70acbb6b690ea5bde0db53d7c16423d6aa7625b9788c606222c5b7ed92130`
- **Size:** 10,278,036 bytes
- **Thumbnail:** `recall-30s-english19-01-thumbnail.png`, 1080x1920 PNG, sha256 `7baa4833e87c5eabcb5af91c4cd1d709519a90d261f9ba86e21f6d6e3db404c8`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** after one partial re-render (below).

## Fix after the first full render
The first full render failed one check, `labels_in_central_region`: the "sea level" label (frames 270–333) was clamped at the
bottom of the label area and its box reached y 1463 (limit 1460) — the same off-by-a-few-pixels clamp as in E18. Root cause: the
label clamp allowed a centre at y 1420, which lets a 76 px label plus its 5 px shadow reach y 1463. The clamp is now y 1410 (and
the anchor was raised); frames 265–334 were re-rendered, their layout-log entries merged into `layout_0_299.json` and
`layout_300_599.json`, the MP4 re-muxed from the frames and the existing mix, and all QA re-run. The label now sits at
y 1368–1453. No other label reaches the clamp (their lowest bottom edge is y 1232), and frame 0 has no labels, so the thumbnail
is unaffected.

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | a half-section pressure cooker on a glowing hob, lid locked, steam from the valve weight, the thermometer dial at about 120 °C (orange zone) and the pressure gauge at 2×; plus the title "HOTTER THAN / BOILING WATER" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | 92 px Fredoka, ink x 205–875, y 387–558 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill area excluded: mean absolute difference 1.47/255 (p99 6.7, i.e. compression only) |
| hook audio | valve hiss and weight rattle at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 82.7 > 12); longest static run 4 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "Hotter than boiling water, a pressure cooker keeps water liquid above 100 degrees. Water boils when its vapor pushes as hard as the air above it. At sea level, that's 100 degrees. Lock the lid and steam can't escape, so the pressure rises. So the water must reach about 120 degrees to boil. Hotter water cooks food faster. On a mountain, it's the reverse. Water boils cooler, so food cooks slower. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.7 LUFS**, true peak **−1.6 dBTP**, LRA 2.3 LU, **0 clipped samples** |
| voice over bed | +16.8 … +19.0 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | −0.1 ms | 0.85 | hook_cooker (frame 0: locked cooker at 120 °C + title) |
| l02 | 1.45 | 1.450 | 0.0 ms | 0.84 | react_valve (eyes on the hissing café cooker, raised brow) |
| l03 | 5.10 | 5.100 | 0.0 ms | 0.85 | giant_open ("vapor push", then "air push"; the bubble breaks away) |
| l04 | 8.90 | 8.900 | 0.0 ms | 0.83 | giant_100 (thermometer at 100 °C: "sea level") |
| l05 | 11.20 | 11.200 | 0.0 ms | 0.84 | giant_lid (lid locks, steam trapped, gauge to 2×: "pressure ×2") |
| l06 | 14.85 | 14.850 | 0.0 ms | 0.85 | giant_hot (thermometer climbs to about 120 °C, boiling resumes: "≈120 °C") |
| l07 | 18.50 | 18.500 | 0.0 ms | 0.85 | giant_food (food warms and softens: "cooks faster") |
| l08 | 20.70 | 20.700 | 0.0 ms | 0.85 | payoff_mountain → payoff_cool at 22.63 ("boils cooler", then "cooks slower") |
| l09 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 14 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0; its words are spoken 0.05–0.71 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.38 s) x 205–875, y 387–558; all other captions **x 223–858, y 341.5–464.5**; ≤ 2 lines; 56 px (long lines 48 px) |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 8 brief labels ("vapor push", "air push", "sea level", "pressure ×2", "≈120 °C", "cooks faster", "boils cooler", "cooks slower"), **one at a time**, inside x 159–890, y 563–1453; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 10 shots, plus
each caption start), both decoded from the final (re-muxed) MP4, and the thumbnail. Every boundary frame shows the right caption
and label for its shot (no stale overlay); hard cuts only. Small cosmetic note: on the thermometer dial the needle passes over the
"120" numeral when it points there; the numeral stays readable.

**Fixed before the full render (three preview passes):** a runtime error (a variable scoped inside a block); the frame-0 title sat
over the dials → camera reframed; dial close-ups had the caption over the top of the dial → reframed so dials sit below the caption
band; the air-push arrows disappeared almost at once (the bubble released on the word "air") → bubble release moved to the end of
the sentence, arrows thicker and blue; food looked pale → brighter, nearer the cut face.

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- "About 120 °C" assumes a typical cooker at about 15 psi (Penn State: 250 °F); settings vary. The ×2 gauge, the ~90 °C mountain
  reading (≈10,000 ft), bubbles, steam dots and the food's "cooking" glow are illustrations. No cooking times are claimed.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
