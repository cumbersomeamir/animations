# QA — Media Diet · 30 s English episode 21 · "This drill has no bit."

**File:** `videos/media-diet/production/30s/2026-11-18-english-21/media-diet-30s-english21-01.mp4`
**SHA-256:** `8d9c424ed53d46d6887628fce23f50cfff2470140f15be8536380c8b3933769a` · 39,192,321 bytes · video 10,248 kb/s (busy paper grain on the
large strata faces) · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english21-01.png` = frame 0 (1080×1920 RGB, SHA-256 `f4cfc5ba2425891867f6d5fd5031ef2792a0b89b04ef32e7c22e2bcde902173b`);
mean absolute difference vs the encoded MP4's frame 0: 1.67/255. Words "This drill" / "has no bit." ink x 292–791, y 340–516.
Build: three resumable chunk workers (frames on the RAM disk `/dev/shm/md-e21`), all 900 PNGs verified, continuity checked at every
chunk start (frame-to-frame difference at each chunk boundary equals its neighbours: no first-frame glitches), then
`SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english21-01.png`.

## First-frame rule
Frame 0 is the finished subject: a paper crust cutaway (strata reddening with depth), a derrick and gyrotron truck on top, a bright beam
boring down to a molten glow with sparks, plus the 5-word hook (= first narration line) at full opacity; voice from 0.05 s, gyrotron hum
and crackle from 0.0 s. Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−1.8 dBTP** (limit ≤ −1.0), LRA 1.9 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **340–516** (hook), x **196–885** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **204–876**, y **1350–1482**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **12/12 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **1.0** and per-line pass **1.0** on every line (incl. the CTA) | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.5…−19.2 dB RMS; music −39.0…−30.9 dB (11.2–19.8 dB under); foley −53.8…−41.9 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 8 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.48 s | crust cutaway, rig + gyrotron truck on top, beam boring to a molten glow with sparks; hook in two large lines (gold/white). |
| Super-hook | surface: steam plant, a power line with moving dots, the data center lights up ("50 MW deal"); chip "Quaise × Google · power deal · 17 Nov 2026". |
| Question | an ordinary tri-cone bit grinding beside the beam's glow. |
| Heat with depth | camera descends the strata, thermometer climbs ("≈ +25 °C every km"), the bit glows and breaks ("bits break"). |
| Super-hot water | drops go down blue and come back glowing gold ("374 °C+: super-hot water" + "up to 10× power per well (Quaise estimate)"). |
| Mechanism | the beam switches on (≈ 14.8 s), reaches deeper; vapor and purge gas rise ("beam + gas, no bit"). |
| Limitation | paper volcano and an ordinary derrick ("phase 1: ordinary drills" + "beam drilling planned for phase 2 (Quaise)"). |
| Payoff | day sky turns to night; the plant keeps powering the data center ("day and night"). |
| CTA | Media Diet sign flips up; a small derrick behind it; caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | 14.14–14.8 s the borehole is dark until the beam switches on with the word "beam"; at 16–18 s the molten glow sits just under the label (label stays legible); ~0.3 s of riser before the CTA sign flips up. No clipping, missing assets or text overlap seen. |

## Fixes during this round
1. Script: "Quaise" (heard as "Quaze") kept on screen only; an unverifiable record-depth line was replaced by the primary-sourced limitation
   (phase 1 ordinary drilling); every final take transcribed exactly.
2. Framing (stills): frame 0 pulled back to show the rig, bigger molten glow + sparks; the bit placed beside the beam in S3; thermometer moved
   into view in S4; the volcano shot re-framed and the protruding drill pipe hidden.

## Known limitations (honest)
- Power from the deal starts "as early as 2030", and its first wells use conventional drilling; millimeter-wave drilling is planned for
  phase 2. The narration says this ("the first wells will still use ordinary drills").
- "≈ 25 °C per km" is a rule-of-thumb gradient; "up to 10× power per well" is Quaise's estimate (labelled on screen).
- The rig, truck, beam, plant and data center are generic paper reconstructions (no company imagery or logos).
- Not listened to or watched by a human yet.
