# QA — `recall-30s-english11-01.mp4` (English)

- **File:** `videos/recall/production/30s/2026-11-09-english-11/recall-30s-english11-01.mp4`
- **sha256:** `d8949d2812ddeb36e49274f708dc038230f76f921416e719d306572d0cb49e55`
- **Size:** 11,960,419 bytes

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the final MP4.

## Defect found after the full render, and fix
1. **Near-still test result (24.2–26.1 s) and a half-framed dish.** All checks passed, but the flat thermal view of the dish
   and cup barely changed for about 2 s (still runs of 23 and 32 frames), and the empty dish was partly out of frame in both
   test shots. Fixed: the test shots got their own cameras (dish, cup and timer all in frame; a clear push-in on the result)
   and the hot water now steams in the thermal view. Only frames 601–790 (test_in + test_out) were re-rendered (3 processes,
   same renderer and composite path); the audio was unchanged; the MP4 was re-muxed and all QA re-run; the renderer's layout
   log for those frames was replaced. Longest still run now: 14 frames.

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 48.5 > 12); longest static run 14 frames (limit < 60) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script (no Hindi or earlier audio reused). No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.012**. Transcript: "Why is the food steaming, but the plate's still cool? Microwaves tug the water molecules inside food back and forth, and that makes heat. Glass and microwave-safe ceramics barely absorb them. The hot food warms the plate, but water soaked into porous clay or an iron-rich glaze can make pottery heat itself. To test a dish, heat it empty beside a cup of water for one minute. If it stays cool, it's safe. Download Recall for learning any new subject with AI." |
| the only difference | "plate still" transcribed as "plate's still" |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 2.0 LU, 0 clipped samples |
| voice over bed | +15.9 … +17.9 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.30 | 0.300 | 0.0 ms | 0.86 | hook_thermal (scan → thermal view: food hot, rim cool) → react (bare-handed lift) |
| l02 | 3.35 | 3.350 | 0.0 ms | 0.84 | giant_food (microwaves into the food; water molecules tugged; food warms) |
| l03 | 8.85 | 8.850 | 0.0 ms | 0.85 | giant_plate (fixed lattice; waves pass through the rim; heat glow from under the food; rim cool) |
| l04 | 14.35 | 14.350 | 0.0 ms | 0.85 | giant_pottery (water soaks into porous clay; iron-rich glaze; both glow) |
| l05 | 20.10 | 20.100 | 0.0 ms | 0.85 | test_in (empty dish + cup of water; door closes; 1:00 → END) → test_out (thermal: water hot, dish cool) |
| l06 | 26.35 | 26.350 | −0.2 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 11 spoken caption groups appear 0.07–0.10 s before their first spoken word and stay until their last.
- No on-screen-only captions; the test's takeaway is spoken (l05), with tags "dish stays cool = safe" and "gets warm? don't use it".

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| font coverage | `document.fonts.check` true for every caption (Fredoka 600) |
| caption ink bounds | x 113–968, **y 341.5–464.5** (limits x 90–990, y 340–520); ≤ 2 lines |
| y < 300 | no meaningful text |
| labels | 17 distinct labels (incl. the thermal legend), inside x 110–974, y 570–1455; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 8 shots, plus
each caption start), both decoded from the final MP4, and preview stills of the re-rendered test shots.

**Fixed before the full render (from preview stills):** the microwave door (open from frame 0) blocked the hook camera; water
molecules lay in a diagonal line (now a jittered grid); the pottery water dots were offset twice (world position added inside
a local group); the react, plate, pottery and test framings; hook tags moved clear of the thermal legend; the performer's
hands moved out of the thermal close-up (they read as large warm blocks); the plate's heat glow made visible (stacked
translucent bands); the microwave door closed for the final café shot.

## Limits (honest)
- I cannot listen. English intelligibility was checked by ASR and loudness/ducking measurements.
- The thermal view and the giant set are illustrative (false colours, slowed-down molecules, glow levels), not measurements.
- Digitalfire is a ceramics technical reference rather than a peer-reviewed paper; it is used for why some pottery heats.
- "With AI" in the CTA is the user's wording and is not found in the saved listing or public site text.
