# QA — Media Diet · 30 s English episode 12 · "Why is 500 km/h so hard?"

**File:** `videos/media-diet/production/30s/2026-11-11-english-12/media-diet-30s-english12-01.mp4`
**SHA-256:** `743dec9abd92bb95d3edcfbe2d0db23a26bcc3aaf32108ad55d776c0426e4053` · 21,984,980 bytes · 5863 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english12-01.png` (1080×1920 RGB, SHA-256 `10c6f54164db739b8b48ceae842ae75f40e9ac65dc2a094e203e1f17a40060bb`);
words "500 KM/H" / "WHY HARD?" ink x 193–885, y 454–706 (inside x 100–900 / y 230–1500).
Build: three resumable chunk workers (`build/render_chunks.sh 0 60 120 180 240`, `300 … 540`, `600 … 840`, ≈ 9–14 s per frame per
worker on 4 cores), then `SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA); thumbnail `node build/thumb.mjs thumbnail-english12-01.png`.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 1.8 LU | qa/loudness.txt |
| captions (approved rule: ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **378–488**, x **181–900** (longest line auto-fitted) | qa/text-bounds.json |
| labels (same safe area; never in the caption band while a caption shows; one large label at a time) | labels x **237–845**, y **1217–1482**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **11/11 cues OK**: each cue appears 0.10–0.16 s before its speech and stays 0.14–0.35 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full-mix pass; **0.975** on the per-line pass — the only miss is V4, where Whisper fused "speed cubed" into one token "SpeedCubed" (the full pass hears "speed cubed"); the full pass also appends a hallucinated "You" over the music tail after the CTA | qa/asr.json |
| music beneath speech (stems, per line) | speech −19.7…−20.4 dB RMS; music −29.3…−35.4 dB (9.4–15.4 dB under); foley −34.6…−52.0 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 9 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** the per-take Whisper check, the ASR pass on the final mix, caption-sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–3.5 s | paper hypercar on the desert straight, road dashes/dust streaming, wheels spinning; readout counts to 503.17 km/h; small "FIA-recognised · Abu Dhabi · 1 Nov 2026" and "editorial reconstruction" tags. |
| Super hook | speedometer needle sweeps to 490 and strains toward the magenta 500 tick. |
| Mechanism / proof | side view with air flecks flowing over the body and a red drag arrow growing ∝ v² → square of red blocks → cyan layers "× speed" → gold cube "power: speed³" → 4³ vs 5³ with paper tags and "×1.95" → translucent car, four motors light in turn, "4 × 555 kW" → "= 2.2 MW" → battery glows hot ("HEAT"), thermometer settles into the green band ("ideal start temp"). |
| Takeaway | gold 5³ cube gains three translucent slabs ("+1% speed" → "+3% power", tagged "slabs exaggerated for clarity"); top-down road with one cyan run arrow ("ONE WAY") and a faint return arrow ("no 2-way average"). |
| CTA | Media Diet sign (approved icon) hinges up beside the road; caption only. |
| Cuts | 10 shots / 9 cuts, hard cuts on cue boundaries; each shot has one idea and at most one large label. Minor: S4 opens on the empty desk for ≈ 0.13 s (frames 229–232) before the first blocks pop in. |
| Missing assets / clipping | none seen: fonts loaded, icon present on the sign, no text outside the safe area (automated), car/cubes/dial fully in frame after the still-frame fixes. |

## Fixes during this round
1. Script: first draft ran 28.4 s of speech → tightened to 85 words / 26.5 s so the CTA ends at 29.42 s and every line gap is ≥ 0.25 s.
2. Framing (stills): first cameras were far too tight for portrait (car, dial and cubes clipped) → all pulled back; S3 changed from
   overhead to side view so the air visibly flows over the profile; thermometer moved behind the car; slabs made thinner and translucent;
   one-way shot reframed top-down with the label below the car; needle animation added (was static).
3. Font coverage: avoided ∝, →, ≈ in labels (not in the bundled Space Grotesk subset).

## Known limitations (honest)
- The car is a generic paper reconstruction, not the real vehicle; no authorised BYD/FIA footage was used.
- The cube law covers aerodynamic drag power only (fixed Cd, area, air density); real top speed also depends on rolling resistance,
  drivetrain losses, gearing/motor limits and the aero changes BYD made. "Nearly double" (×1.95) and "+3 %" are first-principles estimates.
- "2.2 MW" is the manufacturer's motor rating (4 × 555 kW), not measured output during the run.
- Not listened to or watched by a human yet.
