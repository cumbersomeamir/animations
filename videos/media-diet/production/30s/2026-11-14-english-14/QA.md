# QA — Media Diet · 30 s English episode 14 · "How can disorder beat a perfect pattern?"

**File:** `videos/media-diet/production/30s/2026-11-14-english-14/media-diet-30s-english14-01.mp4`
**SHA-256:** `f62dab879a12c190b73227a9e446cbf89408c91162baaea4a0545bacc6237cd2` · 22,230,616 bytes · 5928 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english14-01.png` (1080×1920 RGB, SHA-256 `2a14daab174c3ec28d66d2c82c1e0840d65fa09effab127fa3954cf1d8cc43a3`);
words "MESSIER" / "= TOUGHER?" ink x 203–884, y 278–535; small "editorial reconstruction" tag x 391–689 (inside x 100–900 / y 230–1500).
Build: three resumable chunk workers, then a caption-fit fix and a re-render of the nine chunks carrying the affected captions
(`node build/render.mjs film frames <start> <start+59>` for 240, 300, 480 … 840), then `SKIP_FRAMES=1 bash build/build.sh`.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.0 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **378–488**, x **192–887** | qa/text-bounds.json |
| labels (same safe area; never in the caption band while a caption shows; one large label at a time) | labels x **187–895**, y **1359–1456**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **10/10 cues OK**: each cue appears 0.00–0.13 s before its speech and stays 0.00–0.35 s after (V4's split point sits exactly on a pause) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** full-mix pass and **1.0** on every line; the full pass appends a hallucinated "You" over the music tail after the CTA | qa/asr.json |
| music beneath speech (stems, per line) | speech −19.9…−19.4 dB RMS; music −34.8…−30.0 dB (10.6–15.4 dB under); foley −53.9…−40.8 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR pass on the final mix, caption sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–3.46 s | a weight drops on the paper network sample; beams bow and glow briefly; it holds. Small tags "MIT + Northeastern · Nature · 11 Nov 2026" and "editorial reconstruction". |
| Super hook | lattice ("ORDER") and network ("DISORDER") side by side, each lights on its word. |
| Mechanism | a press settles on the lattice; one cell buckles red, then the whole row follows ("one buckles, all follow"). |
| Constraint | equal weights on a long thin column (bows, turns pink) and a short thick one (holds) ("long + thin buckles first"). |
| Design | the network is drawn: border, then lines from random points that stop at the first line they meet, thinner each time ("MANY SIZES"). |
| Proof | weights dropped on both: the lattice collapses in one band, the network bows and holds ("network held up better"). |
| Payoff | beams of the network light up outward from the impact ("damage shared"). |
| CTA | Media Diet sign (approved icon) hinges up; caption only. |
| Cuts | 8 shots / 7 cuts on cue boundaries; each shot one idea, at most one large label. Sequential reveals open two shots on a near-empty set for ≤ 0.2 s (Euler bases before the columns grow; the network border before the lines). |
| Missing assets / clipping | none seen: fonts loaded, icon on the sign, no text outside the safe area after the fix (automated). |

## Fixes during this round
1. Script: first draft ran 29.0 s of speech → tightened to 75 words / 25.6 s (CTA ends 29.22 s; every gap ≥ 0.3 s).
2. Framing (stills): side-by-side shots and the CTA pulled back (samples/sign clipped); long Euler column shortened (its weight left the
   frame); network beams thinned; platen kept level while the band spreads; plinth tags only in side-by-side shots; more contrast in the glow.
3. **Caption bound (caught by QA on the first encode):** captions are centred at x 540, so a line must be ≤ 720 px wide to end by x 900;
   two lines ("they beat lattices and honeycombs." 747 px, "Mixed sizes share the damage," 734 px) reached x 913. Caption auto-fit
   tightened from 760 to 700 px, the nine affected chunks re-rendered, re-encoded, QA re-run: 0 violations. The superseded first encode
   was not committed.

## Known limitations (honest)
- Paper samples, beam layouts and the collapse/glow animations are schematic reconstructions, not the paper's geometry or measured fields.
- The study is lab research on 3D-printed samples; no product, price or stiffness/energy numbers are claimed.
- "Tougher" paraphrases "more resilient to compression and impacts" / "high energy absorption".
- Not listened to or watched by a human yet.
