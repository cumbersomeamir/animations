# QA — Recall Educational Pilot 01 (`recall-education-pilot-01.mp4`)

File: `videos/recall/education/pilot-01/recall-education-pilot-01.mp4` — new render made in this session (render 2 +
patched frames 8–55), sha256 `a2bdbc23df74025082316611c6962abffa507ed67bc1f05b422122c103705d45`, 7 566 681 bytes.
Evidence in this folder: `qa_report.json`, `ffprobe.json`, `contact_sheet.png` (1 frame/s), `boundaries.png`
(scene, caption and key-action boundaries), `physics.json`, `audio_report.json`. All sheets are decoded from the final MP4.
Model sheet: `../docs/kip-model-sheet.png`.

## Technical (measured by qa.py, all 19 checks pass)
| check | result |
|---|---|
| Container / codecs | MP4 (faststart), H.264 High yuv420p, AAC LC 48 kHz stereo |
| Size / rate / frames | 1080×1920, r_frame_rate = avg_frame_rate = 30/1, 450 frames (counted by decode) |
| Duration | video 15.000000 s, audio 15.000000 s, container 15.000000 s |
| Bitrate | video 3.83 Mb/s (CRF 16), audio 193 kb/s |
| Full decode | `ffmpeg -v error -i … -f null -` → exit 0, empty stderr |
| Loudness | −16.1 LUFS integrated, LRA 1.4 LU, true peak −1.5 dBFS (ebur128) |
| Clipping | 0 samples ≥ 0.999 (decoded peak 0.839) |
| Intelligibility | faster-whisper base.en on the final mix: "A steel ball sinks, so how do steel ships float? It pushes aside only a little water. Same steel as a hollow hull. Pushes aside much more water. Steel plus air is, on average, less dense than water." → WER 0.0 vs script |
| Voice over bed | +9.9 to +13.3 dB RMS per line (`audio_report.json`) |
| Pace | 38 words, 12.07 s speech, 2.53 words/s overall; per line 2.82–3.42 w/s |
| Motion | longest static run 0 frames (min mean frame diff 0.23); no black frames (luma min 88) |
| Text bounds (all 450 frames) | captions x 67–1013 px, y 250–454 px; signature bottom 1754 px (≥166 px above the bottom edge) |

## Visual review (contact sheets, boundary sheet, full-resolution crops)
| iteration | finding | fix |
|---|---|---|
| stills 1 | Kip's dark step showed through the glass like a submerged box | opaque deep-teal backing card behind the water |
| stills 1 | Kip too small; helmet hidden under the takeaway caption | Kip scale 1.2; shots A and E reframed |
| stills 1 | displaced-water ghost read as a solid lime ball | translucent fill + animated dashed outline drawn in the overlay |
| stills 2 | "water's push" and "water pushed aside" labels collided | push label left of the arrow, ghost label under the ghost |
| stills 2 | pointing at the toy ship went backwards | point up-and-left in screen space |
| stills 2 | steam puff rendered as a dark disc | unlit pale material |
| render 1 | Kip's hand plunged into the water while the ball rewound (hand followed the ball) | fixed catch point above the tank |
| render 1 | helmet tucked behind the two-line caption in shot B | shot B framed lower; caption pill 32 px shorter |
| render 1 (full-res) | **mouth invisible** (sat inside the body surface), so no lip-sync showed | mouth curved onto the surface, offset, polygon offset |
| render 1 (full-res) | helmet band jagged where it cut through the stretched dome | band scaled to the dome's 1.04 z-stretch |
| render 2 | "O" (startle) mouth rendered as a grey rectangle (seen on the model sheet) | arched top lip; frames 8–55 re-rendered with the fix and re-muxed; seams at 7/8 and 55/56 checked (mouth closed, no pop) |

Remaining (accepted): during the A→B camera move (≈4.1 s) the helmet's top passes behind the fading-in caption pill
for a few frames; the text stays fully readable because the pill is drawn on top. Gauge labels ("ball", "hull")
are 38 px, smaller than the captions, but are secondary and readable at full size.

## Continuity
One continuous set and one steel piece throughout: ball → sinks → rewinds to mid-water (paused) → rewinds into
Kip's hands → squished into the hull (same steel material and colour) → floats in the same tank. Camera moves
are continuous (no hard cuts). Gauge marks persist ("ball" stays visible when "hull" appears) so the 1 : 7.8 comparison
is on screen at once.

## Educational accuracy (see `../docs/SOURCES.md` for the claim map)
- Forces: weight always down, water's push always up. Weight arrow has the same length for ball and hull (same steel).
- Ball (paused fully submerged, so only these two forces act): push = weight ÷ 7.8 (steel 7.8, water 1.0; OpenStax Table 11.1).
- Hull: push follows the computed submerged volume while it bobs and equals the weight at rest ("=" plus ding at 10.5 s).
- Water level: physically computed rise (displaced volume ÷ tank area); hull rise ÷ ball rise = 7.80 (`physics.json`).
- No claim that the steel's density changes; the takeaway names the average of steel plus air.
- Disclosed simplifications: illustrative scale, morph as a storytelling device, rewind/pause device, fresh-water ratio.

## Audio sync (ASR word times vs. cues)
"sinks" 1.00 s (ball lands 1.12 s) · "float?" 3.10 s (after Kip points at the ship) · "pushes aside" 4.28–4.48 s
(ghost emerges 4.50 s) · "a little water" 5.44–5.80 s (arrows from 5.05 s) · "hollow hull" 7.90–8.12 s (squishes
7.20/7.62/8.05 s) · "much more water" 9.62–10.30 s (lime glow from 9.50 s, balance 10.50 s) · "air" 11.60 s ("air"
label 11.62 s) · "less dense" 13.22 s (thumbs-up 13.25 s). SFX are placed on the same cue times (`audio_report.json`).

## Claims and brand
Educational content only. App presence is a small ink pill with the verified icon + "Recall" from 12.9 s. No Google
Play CTA, slogan, feature tour, metrics, or product claims, and nothing that looks like app UI or experiment data.

## Limits of this QA
I cannot listen. Audio quality was judged by measurement (LUFS, peaks, voice-over-bed) and ASR only. Social-app
UI overlays were not simulated; captions sit at y 250–454 and the signature is at y 1690–1754.
