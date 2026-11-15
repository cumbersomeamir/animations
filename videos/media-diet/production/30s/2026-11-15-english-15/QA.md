# QA — Media Diet · 30 s English episode 15 · "How do you catch this?"

**File:** `videos/media-diet/production/30s/2026-11-15-english-15/media-diet-30s-english15-01.mp4`
**SHA-256:** `0cc0c57b3e7e4a0607597fba8ba4ac78a9ec4cd91ec6ab36d85376a7ab72525b` · 24,166,182 bytes · 6444 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english15-01.png` = frame 0 (1080×1920 RGB, SHA-256 `1f22f1300c887f72577587c703f2d6e63fd4f05a64c90fe12304e898e0019ced`);
mean absolute difference vs the encoded MP4's frame 0: 1.45/255 (encode only). Words "How do you" / "catch this?" ink x 263–816, y 342–516.
Build: three resumable chunk workers, then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english15-01.png`.

## First-frame rule (15 Nov)
Frame 0 is the finished scene, not a logo, fade or empty set: the paper ship held in the tower's arms at dusk, readable at phone size,
with the 5-word question "How do you / catch this?" (the first narration line) at full opacity; voice starts at 0.05 s; a low rumble
sits under the hook from 0.0 s. The thumbnail is the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.4 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **342–516** (hook lines) / 378–488, x **191–888** | qa/text-bounds.json |
| labels (same safe area; never in the caption band while a caption shows; one large label at a time) | labels x **237–844**, y **1353–1485**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **12/12 cues OK** (hook cue on screen from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** full-mix pass; **0.989** per line — the only miss is V4, where Whisper spelled the homophone "braking" as "breaking" (V3's "seven" written as "7" is normalised); the full pass also appends a hallucinated "You" over the music tail | qa/asr.json |
| music beneath speech (stems, per line) | speech −19.8…−18.5 dB RMS; music −37.3…−29.6 dB (9.9–18.8 dB under); foley −50.6…−36.1 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR pass on the final mix, caption sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.31 s | ship in the arms, lattice tower, pad; question in two large lines above the nose. |
| Escalation | ship circling a paper Earth with a trail, then dropping toward home; source chip + "editorial reconstruction". |
| First principles | one steel cube, then seven orange cubes stack beside it ("~7 kg fuel per kg", "rocket-equation estimate"). |
| Mechanism | ship horizontal with its tiled belly glowing and plasma streaming ("AIR BRAKES") → flip to vertical beside the open arms ("FLIP") → engine flames ("ENGINES ON") → close-up: arms swing shut and the yellow pins settle on them ("2 pins · ~1 ft"). |
| Payoff | hexagonal tiles glow orange then cool ("HEAT, NOT FUEL"). |
| CTA | Media Diet sign in front of the tower holding the ship; caption only. |
| Cuts | 8 shots / 7 cuts on cue boundaries; one idea and at most one large label per shot. Sequential reveals: S3 opens on the empty plinth for ≈ 0.25 s; S7 shows the cool, dark tiles for ≈ 1.1 s before they glow on "heat". |
| Missing assets / clipping | none seen; small orbiting ship in S2 is tiny (the trail carries the motion). |

## Fixes during this round
1. Script: "belly-first" was heard as "Bella first" → "it falls on its belly". Engine count left out (reports differ).
2. Framing (stills): hook question made two large lines and the camera raised so the nose clears the words; Earth shot pulled back;
   fuel cubes reframed; re-entry made side-on; pins made the bright element (arm pads removed); tiles given a glow mask.
3. ASR scoring: number words normalised ("seven" ↔ "7").

## Known limitations (honest)
- Tower, arms and ship are a generic paper reconstruction, not SpaceX hardware; no SpaceX footage used.
- "About seven kilos of fuel per kilo of ship" is a rocket-equation estimate (range 6.3–8.2 for the stated assumptions).
- Flight 15 was a test flight; the booster's own catch was aborted (not covered in the narration).
- Not listened to or watched by a human yet.
