# QA — Media Diet · 30 s English episode 20 · "24 hours to say hello."

**File:** `videos/media-diet/production/30s/2026-11-17-english-20/media-diet-30s-english20-01.mp4`
**SHA-256:** `4540f6819232b5dfa0fb1d946d6f0a228d8c15300b542860fb764168595a5eeb` · 21,793,634 bytes · video 5609 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english20-01.png` = frame 0 (1080×1920 RGB, SHA-256 `94f615f66b0995ef3c48bcb5e7092be9aac2c4251bea76cfa9cb9f9f7b141082`);
mean absolute difference vs the encoded MP4's frame 0: 1.22/255. Words "24 hours" / "to say hello." ink x 248–830, y 340–534.
Build: three resumable chunk workers (frames on the RAM disk `/dev/shm/md-e20`), all 900 PNGs verified, frames 597 and 600 re-rendered
after a fix (below), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english20-01.png`.

## First-frame rule
Frame 0 is the finished subject: a paper Voyager 1 (dish facing the viewer, gold bus, booms) among paper stars with a golden radio ring
arriving, plus the 5-word hook (= first narration line) at full opacity; voice from 0.05 s, a soft carrier blip from 0.0 s. Thumbnail =
the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.3 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **340–534** (hook), x **192–886** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **206–875**, y **1350–1483**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **11/11 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | per-line pass **1.0** on every line (incl. the CTA); full-mix single pass **0.989** — every scripted word heard; the scorer counts "four" (spelled out) against "4" and an extra trailing "You" after the CTA | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.6…−19.5 dB RMS; music −37.1…−30.3 dB (9.7–17.6 dB under); foley −58.8…−42.8 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 9 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.88 s | paper Voyager, golden radio rings arriving; hook in two large lines (gold/white). |
| Super-hook | a pulse travels from Earth to Voyager while a 24-hour dial sweeps once ("24 h one way"); small NASA date chip. |
| Question | over Voyager's shoulder toward a tiny Earth; a glowing paper fridge bulb. |
| Inverse square | rays from a point source, one lit tile at distance 1, four dimmer tiles at distance 2 ("2× farther → ¼ power"). |
| Proof | Earth inside a beam footprint much wider than the planet, a few faint sparks ("< 10⁻¹⁸ W" + "estimate: inverse-square + dish gains"). |
| Mechanism | Voyager's dish squeezes a wide cone into a narrow beam → a 70 m dish (person for scale) catches the sparks ("70-meter dish"). |
| Constraint | RTGs glow orange then dim; a power gauge drops into red ("−4 W every year"). |
| Payoff | a big dish beside a small one; the big one catches most sparks ("bigger ears"). |
| CTA | Media Diet sign flips up; small paper Voyager on a stick behind it; caption only. |
| Cuts | 10 shots / 9 cuts on cue boundaries; one idea and at most one large label per shot. |

## Fixes during this round
1. **Frame defect found and fixed:** frames 597 and 600 (first frames of the RTG shot in two render chunks) showed a flat blue desk because
   that shot's camera read Voyager's pose before the frame posed it. The camera now poses Voyager itself; both frames were re-rendered
   (brightness now matches neighbours: 36.0–36.2 vs 128 for the previous shot), the MP4 re-encoded and QA re-run from scratch.
2. Script: lines re-spaced to the audio builder's 0.25 s minimum gap so the CTA ends at 29.47 s; every take transcribed exactly.
3. Framing (stills): Voyager-relative cameras for the over-the-shoulder, beam-cone and RTG shots; beam footprint shrunk so Earth reads
   inside it; Deep Space Network dishes viewed from above; S2 pulled back so the label clears Earth.

## Known limitations (honest)
- Date: produced 17 Nov 2026 (the day of NASA's "Shine Bright" event); the one-light-day crossing is on 18 Nov at 5:16 a.m. EST (NASA).
  The narration states that date rather than claiming it already happened.
- "Less than a billion-billionth of a watt" is our link-budget estimate (2–4 × 10⁻¹⁹ W for 12–23 W), labelled "estimate" on screen.
  Sources disagree on the exact transmitter wattage, so the narration uses PopSci's "fridge-bulb" comparison instead of a number.
- Models are generic paper reconstructions (no NASA imagery); beam, sparks, footprint and the 24-hour dial are schematic.
- Not listened to or watched by a human yet.
