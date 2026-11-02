# QA — Werbens education pilot 01 (final = render pass 2)

**File:** `videos/werbens/education/pilot-01/werbens-education-pilot-01.mp4`
**sha256:** `d40419b7f8a220a09f77447e09b0bd6955e6c7e328d58d6dee2eb8912ca7de0b` · 7,564,186 bytes · checked 2026-11-02

## 1. Container / streams (ffprobe — `qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 15.000 s | 15.000000 / 15.000000 / 15.000000 | PASS |
| Video | H.264, 1080×1920, 30 fps | h264 High, 1080×1920, yuv420p, r/avg frame rate 30/1, bt709 tv range | PASS |
| Frame count (counted by decoding) | 450 | nb_read_frames = 450 | PASS |
| Audio | AAC | AAC-LC, 48 kHz, stereo, ~203 kb/s | PASS |
| Full decode | no errors | `ffmpeg -v error -xerror -i … -f null -` → 0 errors (`qa/decode.log`) | PASS |
| Faststart | moov at front | muxed with `-movflags +faststart` | PASS |

## 2. Audio (`qa/loudness.txt`, `qa/astats.txt`, `qa/audio-spectrogram.png`, `qa/asr-mix.json`)
- Integrated −14.0 LUFS, LRA 2.1 LU, true peak −1.0 dBTP, sample peak −1.46 dBFS, flat factor 0 (no clipped runs). PASS.
- Voice ≈ 10 dB above the ducked score (music ducked −8 dB, SFX −3 dB under speech).
- **Intelligibility inside the final mix** (local Whisper base.en, per narration window): L1 6/6, L2 8/8, L3 6/6, L4 2/2, L5 8/8
  words; full-mix transcript = the script verbatim: "Which box holds the better cookies? Packaging is a clue. It sets an
  expectation. And expectations can tilt the taste. Same cookies. So make the box promise what's really inside." PASS.
- Pacing: 30 words in 15 s (≈2.0 words/s overall; speech occupies ≈10.2 s); 2.0 s speech-free tasting beat and two shorter
  breathing gaps. Comfortable for one concept.
- Sync: every SFX cue is read from the same `src/timeline.js` the scene animates from (single source of truth): landings,
  lid pops, crunches (identical sample for both cookies on purpose), lamp click/hum, "=" ding, check chime.

## 3. Visual inspection (`qa/contact-sheet.png` = every 0.5 s; `qa/boundary-sheet.png` = last/first frames of every cut + first/last frame; `qa/frames/*.jpg` full-res)
- **Complete motion:** every shot has character performance + prop physics (no static/poster frames). Checked frames 0, 21,
  60, 77/78, 130, 176/177, 210, 240, 278/279, 300, 330, 347/348, 400, 449 at full resolution.
- **Transitions:** S1→S2 (f77/78) and S2→S3 (f176/177) clean cuts with consistent prop state (lids, bubble, boxes, caption
  carried across); S3→S4 (f278/279) whip-blur cut; S4→S5 (f347/348) deliberate elliptical cut-on-action — Pip has picked up
  the luxe box and switched the lamp off between shots (accepted editing convention; noted).
- **Continuity:** cookie counts stay consistent (3 per box → Quibble takes one from each → the X-ray shows 2 + 2 → Pip
  borrows one and drops it back); bitten cookies and crumbs stay on the table; the popped lid stays where it landed;
  Quibble's glasses slip and are pushed back in S5.
- **Text bounds/readability:** captions 70 px Inter Display ExtraBold on a dark pill inside x 70–1010, y ≈1300–1500 (over the
  table skirt, never over faces/props after fixes); ≤ 2 lines; each caption ≥ 1.56 s on screen. Tags 40 px inside x 86–993.
  Note (28 px) on its own dark pill. Chip, signature and research line within safe margins; nothing below y 1680.
- **Educational accuracy:** one concept; hedged wording ("can tilt"); on-screen "Illustrative demo · not experiment data ·
  effects vary" during the demo; no numbers, brands, endorsements or app-feature claims; identical contents are true by
  construction; research line + `sources.md` claim map. No implication of real app UI or experiment data.
- **Character consistency:** Pip and Quibble use one rig/spec throughout (model sheet `character/model-sheet.png`).
- Page log: no console errors/warnings, no failed requests. Renderer memory stable (geometries 140 → 180 after 450 frames;
  per-frame mouth geometry is disposed).

## 4. Defects found and fixed (chronological)
| Pass | Defect | Fix |
|---|---|---|
| stills 1 | Host cropped (S1, S4, S5); lifted plain box hid Quibble's face; luxe box/tags off-frame; action under captions (S3); S5 camera on Pip's eye | Re-planned every camera with a projection script; moved boxes closer to Quibble; lifted the plain box outward; longer arms for reach |
| stills 2–3 | Box lids blocking faces; Pip's holding hand over his face; cookie over Pip's eye; tags overlapping/cut | Luxe lid pops off onto the table, plain lid hinges sideways; "waiter" hold under the box; cookie raised up-left; tags at fixed screen positions |
| stills 4–5 | Bite landed below the mouth; ✓ off-screen; weak frame 0 | Hand target at mouth height; ✓ above the box; box already falling + chip + question on frame 0 |
| model sheet | 22/26 panels empty (characters never re-shown), white labels on white body | Re-show active character, hide loose lid; dark label pill, wider close-ups |
| full pass 1 | Note text crossing the table stripe; Quibble's point read as "adjusting glasses"; X-ray reveal small and "=" covering cookies; beam washing Quibble | Note pill; point target moved left of the face; S4 push-in on the evidence after Pip's gesture; badge at mid-box height; brighter glass + white outlines; beam opacity 0.20→0.13 |
| full pass 2 | — re-inspected: no remaining blocking defects | Final |

## 5. Known limitations (honest)
- Narration is synthetic (Kokoro-82M, local); intelligible (100% ASR) but not a human performance.
- Quibble's face is very bright inside the X-ray beam (features remain readable).
- The pointing beat in S1 reads as "hand over the chosen box" rather than a long extended finger (rig limits at that reach).
- Becker et al. 2011 details are from secondary summaries (abstract not accessible); it is only used for "shape is a cue" and
  "effects vary", never for numbers.
- The user's Instagram references could not be viewed (HTTP 429); they were not used beyond the user's own description.
