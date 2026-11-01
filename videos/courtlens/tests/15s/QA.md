# QA — Courtlens 15 s diagram-animation test

Deliverable: `videos/courtlens/tests/15s/courtlens-15s-test.mp4`
(sha256 `39062915c3485488dd1486276f9494ca3247244aece025c7d20a74bc12ae9279`, 2.98 MB)

## Technical (from the final encode; raw outputs in `qa/`)
| Check | Result | Evidence |
|---|---|---|
| Duration | 15.000 s (container and both streams) | qa/ffprobe.json |
| Video | H.264 High, 1080×1920, yuv420p, 30/1 fps, **450 frames counted** | qa/video_stream.txt |
| Audio | AAC 48 kHz stereo, 15.000 s | qa/ffprobe.json |
| Full decode | `ffmpeg -v error -i … -f null -` → 0 bytes of errors | qa/decode.txt, qa/decode_errors.txt |
| Loudness | −14.1 LUFS integrated, LRA 0.8 LU, true peak −1.0 dBTP; sample peak −1.02 dBFS (no clipping) | qa/loudness.txt, qa/astats.txt |
| Narration clarity | VO over music+SFX per line: 13.4 / 13.3 / 9.6 / 10.7 / 7.9 dB | `audio/score15.py` output |
| Narration intelligibility | faster-whisper base.en on each line: similarity 1.00 for all 5 lines | build/vo/manifest.json (`asr`) |
| SFX ↔ action sync | SFX are placed sample-exact from the cue sheet exported by the same GSAP master timeline. Detected onsets were +0–2.5 ms on every unmasked arrival/step/verified/logo cue. Some cues were "masked" because a travel tick stream already sounds before them; the CTA chime's detected onset is +63 ms because it starts soft and its second note crossed the threshold. | qa/sync_check.txt |

## Visual inspection
Inspected the contact sheet of the final encode (every 0.5 s, `qa/contact-sheet.png`), the scene-boundary frames
0.00 / 2.00 / 5.20 / 8.25 / 12.05 / 12.60 / 13.40 / last (`qa/boundary_strip.png`), and further representative
frames in `qa/frames/`.

| Area | Finding | Action |
|---|---|---|
| Strong opening | v1: frame 0 was blank (seeking an untouched GSAP timeline to exactly 0 renders nothing). v2: a small lone node. | Seek clamps to 0.0005 s; CASE node is on screen at frame 0 at 1.45× with a pulse ring and starts settling immediately. Rerendered. |
| Clipped text / edges | v1: the "VERIFY" label sat about 18 px from the left edge. | Left AI/verify column moved +35 px; label now ≥ 50 px inside. Rerendered. |
| Overlap | v1: the trail container label crossed the hub→trail connector; the hub sub-label touched the hub's dashed ring. | Trail label moved under the trail; hub labels raised. No remaining overlaps in the inspected frames. |
| Readability | v1: node labels 21–32 px mono were small for a phone. | Raised to 22–34 px; region labels 25 px; end chips 25 px. Captions are 42 px mono; CTA 46 px Inter 800. |
| Reveal order (skill) | Containers → nodes → edges → labels holds in every section (COURT RECORDS box before sorting; node shells before connectors; labels last). | — |
| Active path / context | Records dim to 0.35 when the trail starts; passed steps dim as the signal moves on; AI path dims once the gold verified path takes over. | — |
| Colour grammar | Ivory = records/trail, cyan = AI only, gold = official record/verified only, navy-mid = idle structure. It never changes mid-piece (the CTA is ivory, not gold). | — |
| Continuity | One continuous diagram. Scattered nodes physically fly into their record type; everything converges into the hub, which becomes the end-card icon. No cuts or jumps at section seams. | — |
| Pacing | Each step holds 0.4–1.5 s and is gated on narration word onsets. The converge beat (12.05–12.6) is intentionally sparse (hub only) for about 0.5 s. | Accepted as a breath before the end card. |
| CTA legibility | "Explore on Google Play" is 46 px navy on an ivory pill from 13.96 s to the end, plus the wordmark, "for advocates" and a two-line footnote. | — |

## Claims audit
- Text claims used: "court records", "case tracking", "AI assistant", "for advocates" — all from the verified listing line.
- Case / cause list / order are shown as kinds of court record (user art direction). The trail states are labelled
  "CASE TRAIL · ILLUSTRATIVE". Footnote: "Illustrative diagram, not app screens. Verify information with official court records."
- No metrics, prices, ratings, testimonials, outcome promises or invented UI screenshots. The only product image is the
  verified store icon (assets/icon.png, sha256 f5855b89…).
- No Google Play badge artwork is used; the CTA is plain text.

## Known limitations
- The narration voice is a stock British-English Kokoro voice (bf_emma); no Indian-English Kokoro voice is available locally.
- The sync detector cannot isolate some onsets that sit inside an already-sounding tick stream; their placement is exact by construction.
- The 30 s film's own QA.md is still pending (see context/05-progress.md).
