# QA: Aarambh Educational Pilot 01 (lockstitch)

- **File:** `videos/aarambh/education/pilot-01/aarambh-education-pilot-01.mp4`
- **sha256:** `a513250845432be73d1113707ae497f0dc4cc1f1db72d93299dabbc1a1477fc3`
- **QA date:** 2026-11-02, with every check rerun on the final build output (`build.sh`, exit 0)

## 1. Delivery spec (ffprobe; `qa/ffprobe.json`, `qa/video_stream.txt`, `qa/audio_stream.txt`)
| check | required | measured | result |
|---|---|---|---|
| container duration | 15.000 s | 15.000000 s | PASS |
| video | H.264, 1080x1920, 30 fps | h264 High, 1080x1920, yuv420p, r_frame_rate 30/1, duration 15.000000 | PASS |
| frame count | 450 | `nb_read_frames=450` (counted by decoding) | PASS |
| audio | AAC | aac, 48 kHz, 2 ch, duration 15.000000, ~196 kb/s | PASS |
| full decode | no errors | `ffmpeg -v error -xerror -i … -map 0 -f null -` gives "full decode OK (no errors)" | PASS |
| loudness | social-safe, no clipping | −15.1 LUFS integrated, −1.7 dBTP true peak, LRA 2.0, sample peak −1.9 dBFS, 0 NaNs | PASS |
| new render | generated in this session | rendered from `src/` by `build.sh`; no imported footage | PASS |

## 2. Narration intelligibility (`qa/asr.json`, `tools/asr_check.py`)
- **Method:** automatic speech recognition on the final MP4's audio track, with music and SFX in. Model: faster-whisper `tiny.en`, the smallest model, used as a deliberately strict proxy.
- **Result:** **WER 0.000.** The transcript matches all 35 script words.
- **Fix made:** the first L4 take was transcribed as "two **friends**" even with no music (raw TTS gave "pulp tight, two friends…").
  - Ten new takes were generated and scored.
  - Take 0 (same synthesis settings) transcribes correctly both raw and after Bindu's voice processing. It replaced the old take.
- **Limitation:** this is a machine proxy. I can't listen to audio in this environment, so no human listening test was done. Music is ducked about 55% under speech. Pacing is 35 words in ~11.8 s of speech with pauses of 0.21–0.53 s between lines (`audio/build/narration_timing.json`).

## 3. Sound-to-action sync (ASR word times vs. `src/timeline.json`)
| spoken word | time (s) | visual event | Δ |
|---|---|---|---|
| "down … up" | 1.52 / 2.16 | 2nd needle dip ≈1.68, needle back up 2.1 (crank rev 2) | in step |
| "loop" | 4.72 | needle at bottom 4.95, loop forms 4.95–5.55, "loop" label 5.05 | visual follows word by ≤0.25 s |
| "hook" | 6.54 | hook catches loop 5.75 and carries it; "hook" label 6.35 | label lands with the word |
| "bobbin" | 8.50 | loop has travelled round the case by 8.55 | 0.05 s |
| "tight" | 9.44 | take-up pull 9.30–10.88; Bindu is lifted by the lever | in step |
| "lock" | 10.94 | lock snap + sparkle + woodblock "tock" at 10.88 | 0.06 s. Before the fix the snap was at 10.55 (0.39 s early); it was retimed |
| "lockstitch" | ≈13.3 | banner unrolled 12.78–13.35 | in step |

The SFX cues are computed from the same timeline as the visuals:
- crank ratchet, needle thunks on each cloth pierce, hops
- swatch flips, "?" pop, dive whoosh and needle-hole "plip"
- loop pluck, hook "tink" plus rotating whirr, thread "zip", lock "tock" and sparkles
- drop and landing, lens "ting", feed shuffle, exit whoosh, banner flutter, wink twinkle and music button

## 4. Visual inspection (`qa/contact_representative.jpg`, every 0.5 s; `qa/contact_boundaries.jpg`, before/at/after each transition)
**Scenes and transitions checked:**
- S1 workshop crank
- S1 swatch puzzle
- T1 dive and iris (3.5–4.4)
- S2 loop, S3 hook, S4 lock
- T2 exit iris (12.2–12.75)
- S5 banner and swatch callback
- first and last frames

**Text bounds:**
- Captions are Inter ExtraBold 56 px in a cream box, at most 976 px wide (at least 52 px side margins). The box is centred at y=1548 and stays between y≈1470 and 1630, above the bottom 280 px platform-UI zone.
- Two-line captions fit; nothing clipped.
- Labels are 34 px; the kicker and signature are 30–34 px at y≈170–210.
- Banner text is 30–100 px inside the cream card.

**Issues found during review and fixed before the final render:**

| # | issue | fix |
|---|---|---|
| 1 | Cloth flap drawn inverted (underside hanging down) | Sign fix, then the flap was replaced by the swatch prop (see 5) |
| 2 | IK inverse transform used the wrong rotation sign | `toLocal` fixed |
| 3 | Bindu's arms crossed the face at the crank | Wheel lowered, smaller crank radius, taller spool stool |
| 4 | Interlock looked jumbled ("tripod legs"); the bobbin thread was invisible against the metal plate | Chain-link style gold U / cream ∩ interlock; bobbin run moved inside the bottom ply |
| 5 | Underside reveal was ambiguous | Bindu now picks up a stitched swatch and flips it: gold on top, cream underneath. Placed over the cream bed for contrast |
| 6 | Supply thread and needle bar crossed the header text | Head casing cut-face added; needle bar clipped; thread routed via a fixed guide |
| 7 | "?" bubble drifted with the dive | Pinned and faded before the dive |
| 8 | Dive read as a big character flying past the needle | Bindu now shrinks into the needle hole by 3.88 s with a sparkle, then the iris opens |
| 9 | Banner unrolled while the exit iris was still closing | Pop-back moved to 12.68 s, banner to 12.78 s; mechanism Bindu hops out during T2 |
| 10 | Forming loop too small to read | Loop enlarged; "loop" label added |
| 11 | "take-up lever" leader crossed Bindu | Label moved |
| 12 | Narration mis-heard; lock snap early | See sections 2 and 3 |

**Accepted residuals:**
- At 8.55 s, when the hook releases the loop, the loop shape changes slightly between two frames: the dim back limb merges into the full lasso.
- Small labels fade in and out at line changes, and captions have 0.1–0.2 s gaps between lines.

## 5. Educational accuracy (see `SOURCES.md`)
- **One concept:** the lockstitch interlock. Every spoken and labelled claim maps to S1–S4.
- **No chain-stitch imagery**, and the narration never mentions chain stitch.
- **Two threads:** gold needle thread and cream bobbin thread throughout. The lock is drawn at mid-thickness, between two plies.
- **Simplifications** are disclosed on screen ("simplified cutaway") and listed in `SOURCES.md`.
- **No app feature, impact, income or outcome claims.** The only app element is a small "✦ Aarambh" signature, top right.
- **No CTA, no motivational slogan.** Nothing is presented as app UI or data.

## 6. Character and continuity
- Bindu uses one rig (`src/lib/bindu.mjs`) throughout.
- **Consistent across scenes:** green kurta with cream piping, tape-measure sash, gold star bindi, pencil bun, gold juttis.
- **Scale:** 0.95 in the workshop, 0.58 inside the cutaway (shrink device shown in T1, pop-back in T2).
- **Lip-sync** is driven by the narration envelope (`audio/build/narration_timing.json`).
- **What Bindu does:** cranks, hops, picks up and flips the swatch, dives, points, tracks the hook, is lifted by the take-up lever, holds the magnifier, presents and winks.

## 7. Reproducibility
- `build.sh` was run end to end from `npm ci` with exit code 0.
- Dependencies are pinned in `package.json`/`package-lock.json` and `requirements-audio.txt`.
- The render takes 62 s for 450 frames on this container.
