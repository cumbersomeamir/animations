# QA — `recall-30s-english24-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-23-english-24/recall-30s-english24-01.mp4`
- **sha256:** `c21a2206244b70d3507919839a7ce00c1543c2020930b4a7692b7ba137babc76`
- **Size:** 29,260,457 bytes (~7.6 Mb/s: the fine perforated mesh is high-detail; same x264 CRF 17 as earlier episodes)
- **Thumbnail:** `recall-30s-english24-01-thumbnail.png`, 1080x1920 PNG, sha256 `236f6df5169b44be2e6437faf368363811b4ea30b07daf0ca4c56b8084491f91`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py`, `qa/caption_sync.py`, plus decoded-frame reviews of the contact sheet
(1/s), the boundary sheet (first/last frame of every cut and every caption start) and targeted frames. Raw outputs: `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json`, `cue_table.json`. Caption area: ink inside x 100–900,
y 230–1500, nothing in y 0–230; labels inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync.**

## Render history (honest)
| step | result | fix |
|---|---|---|
| full render (3 workers, 10.4 min) | 25/25 checks and narration sync passed; caption sync reported two groups as "on-screen only" | the checker only knew "8" = "eight"; captions show "12" and "2,000" where the script spells the numbers out. Added that equivalence to `qa/caption_sync.py` (no video change); both groups then align at 0.00 s lead |
| boundary review | the frame-0 title lingered 0.15 s past the hook cut (1.60–1.75 s), over the performer | title group ends at 1.60 s (fades inside the hook); **partial re-render of frames 39–56** with the same renderer (untouched frames 39 and 56 came out byte-identical, md5), re-mux, layout log merged, all QA re-run |

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | macro of the microwave door: a perforated metal net with a lit terracotta mug (lime band) behind it; title "THIS WINDOW / IS A METAL NET" (6 words = the spoken l01) at full opacity; no logo intro, no fade, no empty set |
| title bounds | Fredoka title inside x 206–874, y 342–558 |
| frame 0 = thumbnail | decoded frame 0 vs the thumbnail, pill rows excluded: mean absolute difference 2.12/255 (p99 10.0; compression of the fine mesh) |
| hook audio | oven hum + tick at 0.00 s; the narrator starts at 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode | exit 0, empty stderr |
| black frames / static runs | none (luma min/mean/max 34.4/83.2/140.4); longest static run 16 frames (0.53 s) |
| assets | fonts load for every caption; the Recall icon loads (end pill, thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0, established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated for this script |
| ASR, final mix | faster-whisper base.en: WER 0.058 (number formatting only: "100" for "a hundred", "2,000"). "This window is a metal net. Light gets through, so why don't the microwaves? Microwaves are waves about 12 centimeters long. The holes are only about a millimeter wide, over 100 times smaller. To waves that long, the net is like solid metal, so they bounce back inside. Light waves are about 2,000 times smaller than the holes, so they slip through. So if the door is bent or won't close firmly, stop using it. Download Recall to turn your study material into lessons." |
| loudness (final MP4) | **−14.6 LUFS**, true peak **−1.4 dBTP**, LRA 2.2 LU, decoded peak 0.84, **0 clipped samples** |
| voice over bed | +16.5 … +18.3 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | on screen |
|---|---|---|---|---|
| l01 | 0.05 | 0.050 | −0.2 ms | hook_mesh (frame 0 + title) |
| l02 | 1.75 | 1.750 | 0.0 ms | peer_react (peers in → turns to camera at 2.94) |
| l03 | 4.75 | 4.750 | 0.0 ms | giant_wave ("~12 cm wave" ruler) |
| l04 | 7.95 | 7.950 | 0.0 ms | giant_holes ("~1 mm hole" ruler) |
| l05 | 12.35 | 12.350 | 0.0 ms | giant_solid ("like solid metal") → giant_bounce at 15.25 ("bounces back") |
| l06 | 17.05 | 17.050 | 0.0 ms | light_rays ("light ~0.0005 mm") → peer_pov at 20.40 (mug seen through the net) |
| l07 | 21.90 | 21.900 | 0.0 ms | door_gap ("gap") → unplug at 23.80 (plug pulled at 24.60) |
| l08 | 26.45 | 26.450 | 0.0 ms | cafe_cta (CTA, Recall pill) |

## Captions and layout (renderer box log, all 900 frames)
- All 13 caption groups start 0.00–0.05 s before their first spoken word and stay until their last; ≤ 2 lines; one headline (frame-0
  title) plus the current caption; English only; caption ink x 206–874, y 342–558; y 0–230 clear; labels inside the central region;
  no overlaps between captions, labels and the brand pill.

## Visual review (decoded frames)
- Contact and boundary sheets: every cut changes idea and view; café, performer, microwave, mug and plug stay consistent; the giant
  sheet's holes and wave keep their 1 : 120 scale; the oven is never shown running with its door open.
- Known weakness (kept): in `unplug` the performer's face is partly above the frame; the action (hand, plug, ajar door) is clear.

## Not verified / limits
- I cannot listen: audio is judged from loudness, peaks, voice-over-bed ratios, ASR and the event log, not by ear.
- I did not watch the MP4 in real time; motion was reviewed from decoded frames and frame-difference statistics.
