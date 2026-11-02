# QA — Recall 30 s production 02 (`recall-30s-production-02.mp4`)

File: `videos/recall/production/30s/2026-11-02-batch-02/recall-30s-production-02.mp4`, rendered in this session
(render 2, full), sha256 `5fe71d5694460f7f2c1df9df6d07582af60f6126844051a6d4f2b42803637b0d`, 11 413 451 bytes.
Evidence here: `qa_report.json`, `ffprobe.json`, `contact_sheet.png` (1 frame/s), `boundaries.png` (segment, caption
and key-action boundaries), `audio_report.json`, `cue_table.json`, `physics.json`. Sheets are decoded from the final MP4.

## Technical (qa.py on the exported file — 24/24 checks pass)
| check | result |
|---|---|
| container / codecs | MP4 faststart · H.264 High yuv420p · AAC LC 48 kHz stereo |
| size / rate / frames | 1080×1920 · 30/1 (r and avg) · **900 frames** (counted by decode) |
| duration | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** |
| bitrate | video 2.84 Mb/s (CRF 17), audio 197 kb/s |
| full decode | exit 0, empty stderr |
| loudness | **−14.6 LUFS** integrated, LRA 3.3 LU, **true peak −1.5 dBTP** |
| clipping | 0 samples ≥ 0.999 (decoded peak 0.845) |
| intelligibility (one ASR pass) | faster-whisper base.en on the final mix: all 71 script words recognised in order; one hallucinated trailing "You" over the music tail → **WER 0.014** (1 insertion) |
| per-line ASR + timing | every line WAV transcribed exactly (`audio/narration/words.json`); word-level alignment on the full mix hit a faster-whisper aligner bug (IndexError in `find_alignment`), recorded in `qa_report.json` |
| voice over bed | +9.6 to +14.9 dB per line |
| pace | 71 words, 21.67 s speech, 2.37 words/s overall |
| caption text ink (900 frames) | **y 352–468** · x 208–871 (margins ≥ 80) · ≤ **2 lines** · pill y 324–492 |
| top 0–300 px | clear in every frame |
| subject zone (incl. push-ins) | Kip's helmet ≥ **617 px**; balance base / lowest pan ≤ **1451 px**; widest prop (sack) x 56–1053 px |
| motion | longest static run 6 frames; no black frames |

## Visual review and fixes
| stage | finding | fix |
|---|---|---|
| stills 1 | "same size" label sat on Kip's scarf; duplicate "1 kg" (overlay pill + clay tag on the sack); "feathers + air" over the sack's tag | label moved below the beam over the post; overlay pill only on the tiny cube; label moved down |
| render 1 QA | the whole subject sat ~100 px low (helmet ≥ 737 px, base/pan to 1541 px: inside the bottom overlay region) leaving a dead band under the UI row | camera reframed (6 % closer, looks lower): helmet ≥ 617, floor ≤ 1451; full rerender |
| render 1 review | lime "=" over the lime post read like an "8" | "=" drawn in an ink badge |
| render 1 QA | ASR step crashed (faster-whisper word-alignment IndexError) | transcript for WER taken without word alignment; alignment attempted separately and its error recorded |
| render 2 | 23.0–23.25 s: the outgoing WEIGH! tag fades out over the incoming recap chip | accepted (transitional, < 0.3 s; nothing important covered) |

Continuity: same clay stage, balance and props throughout; locked frontal camera with ≤ 2 % beat push-ins; every
change is a command slam, pin pull, button-driven tile-flip or beam motion (no fades or blank frames).
Segments: hook 0–3 s (LOAD!, pans loaded), setup 3–8 s (locked balance, GUESS!, 3 chips, **3.0 s think beat with 6
knots**), mechanism 8–23 s (WEIGH! → level/same mass → volumes → pile density; FLIP! → same size → WEIGH! → steel),
takeaway 23–29 s (recap chips + toggles on "mass"/"volume"), end 29–30 s (level balance, signature).

## Accuracy (claim map: `../docs/SOURCES.md`)
- Question and payoff worded as **mass** (NIST: kilogram = SI unit of mass; "mass used when mass is meant").
- Same mass → level balance; feathers occupy much more volume because their (pile) density is much lower — OpenStax
  §11.2, which states the same riddle. Pile density counts the air between feathers (FAO "bulk volume" incl. air).
- Same-size boxes → steel has far more mass (ρ = m/V, steel 7.8 × 10³ kg/m³).
- 1 kg steel cube at true size (5.04 cm); feather pile size illustrative; no buoyancy discussion (per feedback;
  disclosed in SOURCES.md).

## Remaining limits (honest)
- I cannot listen; audio was judged by LUFS/true-peak/voice-over-bed measurements and ASR only.
- Full-mix word timings are unavailable (aligner bug); timing evidence comes from per-line ASR + placed start times.
- Social-app UI overlays not simulated (safe zones verified numerically).
- No fetchable institutional definition of "bulk density" was found, so the narration avoids the term (see 13).
