# QA — Recall 30 s production 01 (`recall-30s-production-01.mp4`)

File: `videos/recall/production/30s/2026-11-02/recall-30s-production-01.mp4`, rendered in this session (render 1 +
patched frames 254–277 and 839–852), sha256 `d0261d676523589dbb9d577b19a7e02d47d092a2a380d77001081383a36c0077`,
10 590 379 bytes. Evidence here: `qa_report.json`, `ffprobe.json`, `contact_sheet.png` (1 frame/s, 30 frames),
`boundaries.png` (segment/caption boundaries and key actions), `audio_report.json`, `cue_table.json`, `physics.json`.
All sheets are decoded from the final MP4.

## Technical (qa.py on the exported file — 24/24 checks pass)
| check | result |
|---|---|
| container / codecs | MP4 faststart · H.264 High yuv420p · AAC LC 48 kHz stereo |
| size / rate / frames | 1080×1920 · r_frame_rate = avg_frame_rate = 30/1 · **900 frames** (counted by decode) |
| duration | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** |
| bitrate | video 2.62 Mb/s (CRF 17), audio 199 kb/s |
| full decode | `ffmpeg -v error -i … -f null -` → exit 0, empty stderr |
| loudness | **−14.6 LUFS** integrated (target −16…−14), LRA 2.8 LU, **true peak −1.5 dBTP** (≤ −1) |
| clipping | 0 samples ≥ 0.999 (decoded peak 0.84) |
| intelligibility (one ASR pass) | faster-whisper base.en on the final mix: "A steel ball sinks. A steel ship floats. Same material. So what changes? Make your guess. Here's the answer. The ship's hollow shape displaces much more water for its weight. The water pushes upward. When that buoyant force balances the ship's weight, it floats. Fill the hull with water, and the situation changes. It's not that the steel became lighter. The shape changed the balance." → **WER 0.0** |
| voice over bed | +7.6 (l08, under the FILL IT! stab and gurgle) to +13.0 dB per line |
| pace | 65 words, 20.44 s speech, 2.17 words/s overall |
| caption text ink (all 900 frames) | **y 353.5–466.5** (rule 350–470) · **x 221–859** (margins ≥ 80) · max **2 lines** · pill y 324–492 |
| top 0–300 px | no overlay box in any frame (slam bursts capped) |
| subject zone (camera moves included) | Kip's helmet top ≥ **618 px** (below the UI row), tank floor ≤ **1490 px** (above the bottom overlay region), tank x 47–995 px |
| motion / frames | longest static run 5 frames; no black frames (min mean luma 120) |

## Visual review and fixes
| stage | finding | fix |
|---|---|---|
| stills 1 | weight arrows on resting pieces ran into the BALL/SHIP plates | drawn above each piece, pressing down; "=" + "same weight" between |
| stills 1 | result stamps collided with Kip's resting hands; labels small | stamps moved up; labels 34–38 px |
| stills 1 | 3-frame slam overshoot pushed the starburst into the top 300 px | burst radius capped, slam centre at y 860, overshoot 1.45× |
| mix 1 | l08 voice over bed 6.7 dB (gurgle + rush) | foley lowered → 7.6 dB; ASR exact |
| render 1 QA | 10 frames (8.60–8.77 s answer hop + push-in; 28.13–28.23 s thumbs hop) put the helmet tip under the chips/tag row (y 571 / 597) | hops and push-in reduced; frames 254–277 and 839–852 re-rendered; min helmet top 618 px |
| render 1 review | at 8.52 s the outgoing GUESS! tag flew across answer chip B | the fly-out is hidden while chips are on screen (same patch) |
| patch seams | frame-difference at 253/254, 277/278, 838/839, 852/853 equals neighbouring motion (0.13–4.9); the 254→255 jump is the intended ANSWER! slam | — |

Continuity: one continuous clay stage, a locked frontal camera with beat-locked push-ins ≤ 6%, and the same tank,
ball and ship throughout. Command slams and stamps are the only transitions; no fades or blank frames. Segments:
hook 0–3 s (ball ✗, ship ✓), setup 3–8.5 s (same steel → GUESS! → 2.0 s fuse with 4 beat knots), mechanism 8.5–22.5 s
(answer, displacement 1× vs ≈8×, push = weight, FILL IT! → founders → ✗), takeaway 22.5–29 s (same weight,
REPLAY!, ✓/✗ summary), end 29–30 s (button chord, Recall signature).

## Accuracy (claim map: `../docs/SOURCES.md`)
- Archimedes' principle verified (OpenStax CP2e §11.7). Steel/water 7.8 (Table 11.1) ⇒ the floating ship displaces
  7.8× the ball's water; the computed chamber rises are 0.00695 vs 0.0542 (ratio 7.80, `physics.json`), shown as
  1× / ≈8× marks.
- Forces: weight down, water's push up. Ball push = weight/7.8. Floating ship push = weight ("=" at "balances").
  Resting pieces are shown with weight only (no unbalanced pair). The ship's push varies with its computed submerged
  volume while it bobs.
- Flooding: water enters from the same chamber, so the level holds while afloat, then falls to the ball's level once
  only the steel displaces water; the weight arrows stay identical ("not lighter").
- "Fifth-grade" framing: Texas TEKS §112.7(b)(6)(A) (sinking and floating, relative density); England's Year 5
  programme does not include it, so the caption cites Texas only.

## Sync (ASR word times in the final mix vs picture cues)
"sinks." 0.92 s (ball lands 1.0 s, ✗ 1.5 s) · "floats." 2.44 s (✓ 2.5 s) · "guess." 5.90 s (fuse 6.5–8.5 s) ·
"answer." 9.04 s (stab 8.5 s, ✓ chip) · "hollow shape" 10.4–10.6 s (glow from 10.05 s) · "displaces" 11.02 s (markers
11.05 s) · "upward." 14.30 s (push arrows from 13.75 s) · "balances" 16.08 s ("=" + ding 16.1 s) · "Fill" 18.80 s (plug
19.0 s) · "changes." 20.64 s (founders 20.55 s) · "lighter." 23.76 s ("=" + same weight 23.5 s) · "balance." 25.60 s.
58 SFX events on cues (`audio_report.json`).

## Remaining limits (honest)
- I cannot listen. "Actually listen" was covered only by measurements (LUFS, true peak, voice-over-bed) and one ASR
  pass on the lines and on the final mix (exact). Subjective voice quality and music taste are unverified.
- Social-app UI overlays were not simulated; the safe zones come from the brief and are verified numerically.
- The "fifth-grade" framing rests only on Texas TEKS §112.7 (read via Cornell LII's reproduction; the official SOS page had moved).
- Render speed ≈ 28 frames/min (SwiftShader); a full rebuild takes ≈ 30 min.
