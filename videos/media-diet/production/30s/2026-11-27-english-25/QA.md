# QA — Media Diet · 30 s English episode 25 · "We hit an asteroid. Here's the scar."

**File:** `videos/media-diet/production/30s/2026-11-27-english-25/media-diet-30s-english25-01.mp4`
**SHA-256:** `102d27f0b6da2bb8adf2fd673d88c42308f9479a0020a9892e63ed3a2356a29c` · 16,660,604 bytes · video ≈ 4.4 Mb/s (x264 CRF 20) · audio
stream tagged `eng`
**Thumbnail:** `thumbnail-english25-01.jpg` = frame 0 (1080×1920, JPEG q2, SHA-256 `2635a94613cd0ef6e526627c5754775aa32ff96c4af56d1110eb63fafcb11a31`);
mean absolute difference vs the encoded MP4's frame 0: 1.47/255 (JPEG vs the lossless render: 1.0/255). Hook "WE HIT AN ASTEROID." /
"HERE'S THE SCAR." ink x 200–878, y 362–483; chip "illustration of ESA Hera's view · 25 Nov 2026" x 279–801, y 1453–1472.
Build (all in RAM, see "Disk"): three resumable chunk workers with Chromium temp files on the RAM disk, all 900 PNGs present, continuity
checked at all 14 chunk starts (0 glitches), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs <RAM path>.png` → JPEG q2.

## First-frame rule
Frame 0 is the finished subject: an illustration of Hera's view — Dimorphos with its flattened, dark crater face and rim, boulders
drifting around it against the starfield — plus the hook "WE HIT AN ASTEROID. / HERE'S THE SCAR." (= first narration line) at full
opacity and the illustration/date chip; voice from 0.05 s, deep rumble from 0.0 s. Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP** (limit ≤ −1.0), LRA 2.1 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **362–488**, x **191–888** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **205–877**, y **1340–1478**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **9/9 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **1.0** and per-line **1.0** on every line (incl. the CTA) — see note | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.5…−19.3 dB RMS; music −35.4…−30.5 dB (10.0–16.1 dB under); foley −55.8…−40.2 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 8 cuts, from the encoded MP4 (JPEG) | qa/contact-sheet-*.jpg |

ASR note: the first pass scored V3 0.909 only because Whisper wrote "6 kilometers" while the check's number map expected "6 km"; the
map was corrected (six→6, kilometers→km) and the ASR step re-run on the same MP4 (`build/asr_check_en.py … qa/asr.json`): 1.0 everywhere.
**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets, encoded file)
| area | result |
|---|---|
| Hook 0–2.3 s | Dimorphos with the flattened dark crater face and rim, boulders around; hook in two large lines (gold/white). |
| Hera 2.3–6.05 s | a paper Hera (gold bus, blue wings) beside the moonlet; a paper stadium pops in at left; "stadium-sized crater" + ESA chip. |
| Impact 6.05–9.23 s | the round, pre-impact moonlet; DART streaks in from the camera side and strikes (flash at 7.18 s); first rubble; "6.1 km/s" + DART chip. |
| Orbit 9.23–13.2 s | Dimorphos circles Didymos on a tall elliptical path; the gold inner ring appears (gap exaggerated); "orbit: 33 min shorter". |
| Plume 13.2–16.85 s | rubble blasts out of the crater toward the camera; exhaust-like glow; the moonlet recoils; "rubble recoil". |
| Pushes 16.85–20.9 s | cyan arrow (DART, 1×) then amber (rubble, ≈2.6×) stacked, gold total alongside; "≈ 3.6 × the push" + β chip. |
| Payoff 20.9–23.05 s | paper bars DART vs RUBBLE grow; "the rubble did most of it" + "β 2.2–4.9 for any plausible density". |
| Defence 23.05–25.9 s | a probe nudges a generic incoming asteroid; its path bends past a paper Earth; "planetary defense" + no-threat chip. |
| CTA 25.9–30 s | Media Diet sign flips up (flat for ~0.25 s first); caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | 6.05–6.4 s DART starts close to the camera and its long solar-array rod crosses the upper frame briefly; the stadium sits at the left edge (recognisable, partly cropped); the exhaust glow reads as a flat cone. No clipping of text, missing assets or text overlap seen. |

## Disk / staging (operational, recorded honestly)
After the container restart the root disk had ~17 MB free. A `git fetch` into the disk checkout ran out of space and left 43 unreachable,
partially fetched objects (17.4 MB) plus a temp file; exactly those were removed (verified unreachable and created by that fetch;
`git fsck --connectivity-only` clean), restoring the pre-fetch state. No cache or earlier output was touched. Everything for this episode —
frames, audio WAVs, encode, QA, thumbnail and Git staging — lives on the RAM disk in a sparse partial clone at `/dev/shm/repo25`, from
which the commits were pushed. The on-disk checkout is untouched and behind the remote.

## Fixes during this round
1. Script: "Hera" (heard "Hira") and "NASA's" (heard "NASA") moved on screen; "3.6" (heard "three, six") said as "about three and a
   half times", with β = 3.61 on screen; every final take exact.
2. Framing (three still passes): the shared desk/hills hidden in the space shots (they read as a floor); crater shading added and the
   crater face turned to camera; Hera, the stadium, DART's approach, the plume direction, the arrow layout and the bars reframed for portrait.
3. Honesty: illustration chips on the hook and the defence scene; "gap exaggerated" on the orbit; β with its density assumption and range.

## Known limitations (honest)
- β = 3.61 assumes equal densities (2.4 g/cm³); across plausible densities it is 2.2–4.9 — the rubble's share exceeds DART's in all cases.
- The asteroid shapes, crater, plume, spacecraft and orbit gap are illustrative paper reconstructions, not shape models or Hera images.
- Not listened to or watched by a human yet.
