# QA: meshline-30s-english07-01.mp4 (batch 2026-11-06-english-07)

**SHA-256:** `6994a0491da964080be466ea06d796521e0d1234ef3afd021025f9cb77ee7e65`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−14.4 LUFS**, LRA 4.1 LU, **true peak −3.4 dBTP**; music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.1 to +22.8 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines recognised; numbers come back as digits | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.095. All of it is digits vs spelled-out number words ("100" for "one hundred", "8" for "eight"…). With numbers normalised, **WER 0.0**. "Meshline", "megabits" and "megabyte" are all recognised. | `qa/asr_final.json` (fields `wer`, `wer_number_normalized`) |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 10 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 139–940 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 21 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (first second):** tiles pour down a wide five-track "download" bundle and the download bar reads "done ✓". Meanwhile the same video's tiles queue at the phone, one crawls up the single "upload" track, and the coral upload bar reads "sending…".
- **Mechanism:**
  - The lanes are highlighted "wide" and "narrow".
  - A printed "US benchmark · FCC · 2024" plaque appears, with "100 Mbps" and "20 Mbps" on the lanes (drawn 5:1).
  - The 100 MB race runs on a labelled sped-up clock: download 8 s ✓, upload 40 s, with ten tiles single-file up the narrow lane.
  - A tiny text envelope zips straight up the free narrow lane ("text: tiny").
- **Takeaway:** the instrument becomes a speed-test card (↓ 100 Mbps, ↑ 20 Mbps, with the upload boxed in coral) and the upload lane says "check this lane".
- **CTA:** icon and wordmark, with ambient traffic still flowing.
- **Claims:** mapped in `research/claims.md`. Real figures come from the FCC, and the 8 s / 40 s values are plain arithmetic, said with "about".

## Defects found and fixed
1. The five download tracks converged unevenly into the phone. They now drop vertically and merge at 45°.
2. The upload-queue logic produced odd tile positions, and the last upload tile landed early (≈37 of 40 s). The queue is now a simple counter, and the tiles are spaced 3.9 sim-s apart so the last lands at ≈39.5 s.
3. "sending…" sat against the "your phone" label. It moved right of the queue.
4. The benchmark plaque covered the download bundle while "100 megabits down" was spoken. It moved into the gap between the lanes and was shortened ("US benchmark · FCC · 2024").
5. The map went static after the race (takeaway and CTA). Ambient traffic now runs from 21.6 s: five-abreast tiles down, single-file up.

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only.
- The 8 s / 40 s values are ideal arithmetic; real transfers vary with overhead and conditions, hence "about".
