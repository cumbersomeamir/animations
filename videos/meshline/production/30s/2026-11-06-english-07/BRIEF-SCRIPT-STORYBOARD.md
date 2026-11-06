# 20: Production 30s, batch 2026-11-06-english-07 (English): "Upload vs download: why sending a video takes longer"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-06-english-07/meshline-30s-english07-01.mp4`, sha256 `6994a0491da964080be466ea06d796521e0d1234ef3afd021025f9cb77ee7e65`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −14.4 LUFS, −3.4 dBTP, voice/bed +17.1 to +22.8 dB;
  - ASR WER 0.0 with numbers normalised (raw 0.095 is only digit spellings);
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`. The assigned account is amir@tensorblue.com (CLAUDE.md); commits use the session's noreply identity.
- **State:** the tree was clean at `645fa5f`, no job was running, and the batch folder did not exist.
- **Isolation:** only Meshline files were read. The "Recall" voice belongs to another app and was not used; no other app name appears in the CTA or copy.
- **Language override:** English narration and captions only, with the approved English blend (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98, en-us). No Hindi audio was reused.
- **Topic replaced:** the suggested "Bluetooth range shrinks across walls / open room vs concrete wall / proximity vs internet" already exists as episode 07 (feedback-05) and episode 04 (round-02). Planned title #9 (upload vs download) was chosen instead and had never been made.

## Approved style kept (latest accepted: english-06)
- The actual renderer: Node 22 + `@napi-rs/canvas` 2D Transit Map sheet (`src/render.mjs`). The new scene `src/lanes.mjs` uses the same helpers and conventions:
  - charcoal sheet, blue routes, pen grammar, paper-veil/label halos;
  - coral only for problems;
  - one screen-space instrument (progress bars, then a speed-test card);
  - English captions at 52 px EBold, baselines 398/458;
  - CTA icon + wordmark at y ≈ 1462–1526;
  - the bottom note at 1612.
- No mascot or characters were added (rule from batch 02): the network performs.
- Quiet pad bed (`audio/mix_e7.py`) with the voice upfront.

## Final script (73 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–4.03 | It downloads in seconds; why does sending a video take forever? |
| l2 | 4.45–7.95 | Many connections have a wide lane down and a narrow lane up. |
| l3 | 8.38–12.76 | The US broadband benchmark: one hundred megabits down, twenty up. |
| l4 | 13.18–18.73 | So a hundred-megabyte video downloads in about eight seconds, but uploads in about forty. |
| l5 | 19.16–21.49 | A text is tiny, so it still slips through. |
| l6 | 21.91–25.54 | When sending crawls, check your upload speed, not just download. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

The first draft had 84 words and 30.2 s of speech; it was trimmed to 73 words and 26.6 s. Captions and the publishing caption write the numbers as digits (100, 20, 8, 40).

## Sources
See `production/30s/2026-11-06-english-07/research/claims.md`:
- FCC press release, 14 March 2024 (fixed benchmark 100/20 Mbps; mobile 5G-NR threshold 35/3), with the PDF text extracted locally;
- M-Lab NDT ("reports upload and download speeds");
- the Meshline listing.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–4.3 | Hook | Cartouche "Down vs up / two lanes". Tiles pour down a five-track "download" bundle into "your phone", and the download bar reads "done ✓". The same video queues at the phone and crawls up the single "upload" track, with a coral bar and "sending…". |
| 4.3–8.3 | Two lanes | Push to the bundle ("wide"), then to the single track ("narrow"). |
| 8.3–13.1 | Benchmark | A printed "US benchmark · FCC · 2024" plaque between the lanes, then "100 Mbps" on download and "20 Mbps" on upload (drawn 5:1). |
| 13.1–19.0 | The race | The bars reset ("100 MB video · clock sped up"). Download finishes at 8 s ✓ while ten tiles go single file up the narrow lane, and upload reaches 40 s. |
| 19.0–21.8 | Text | A tiny envelope zips up the free narrow lane ("text: tiny"), with a ring at the internet. |
| 21.8–26.1 | Check | Ambient traffic starts. The instrument becomes a speed-test card (↓ 100 / ↑ 20 Mbps, upload boxed in coral), and the upload lane says "check this lane". |
| 26.1–30 | CTA | Icon and wordmark; ambient traffic continues with a slow push-in. |

## Reproduce
From the batch folder:
- `<kokoro-py> ../../../education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr.py lines <faster-whisper-base.en>`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en> meshline-30s-english07-01.mp4 qa/asr_final.json`

## Next
Await review. No automation was created, nothing was uploaded to Drive, and no other video was started.
