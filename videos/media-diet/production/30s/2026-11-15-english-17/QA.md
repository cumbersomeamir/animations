# QA — Media Diet · 30 s English episode 17 · "No joints. Just tension."

**File:** `videos/media-diet/production/30s/2026-11-15-english-17/media-diet-30s-english17-01.mp4`
**SHA-256:** `a848fb2ec7ed20ddaa520a5c02cc3274f4f67a381a974bbb3fa3326693d98a30` · 28,717,758 bytes · video 7455 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english17-01.png` = frame 0 (1080×1920 RGB, SHA-256 `c640420a95f401c419f1e1aeb7ef1f7a38b3b47be5607f15fd7eda216a4e2a8b`);
mean absolute difference vs the encoded MP4's frame 0: 1.6/255. Words "No joints." / "Just tension." ink x 225–853, y 340–516.
Build: three resumable chunk workers (15 chunks × 60 frames), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail
`node build/thumb.mjs thumbnail-english17-01.png`.

## First-frame rule
Frame 0 is the finished subject: two paper tensegrity robots (dark rods, glowing cyan and pink webs) wrapped around a diagonal pipe with
their claws locked, plus the 4-word hook (= first narration line) at full opacity; voice from 0.05 s, a taut-cord pluck from 0.0 s.
Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 1.9 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **340–516**, x **195–885** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **193–888**, y **1359–1456**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **11/11 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | per-line pass **1.0** on every line (incl. the CTA); full-mix single pass **0.988** — the one miss is "ducts" written as "ducks" (the per-line decode of the same window hears "ducts") | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.2…−19.2 dB RMS; music −35.0…−30.6 dB (10.8–15.4 dB under); foley ≤ −42.6 dB (silent under some lines) | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 8 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.96 s | two robots around the pipe, claws locked; hook in two large lines (gold/white). |
| Event | two robots inch toward each other and lock claws; source chip "Colorado State · Nature Machine Intelligence · 11 Nov 2026" + "editorial reconstruction". |
| Question | slow orbit of one robot under "So how does a body with no joints hold its shape?" |
| First principles | the six rods alone, then the web fades in ("RODS PUSH" → "WEB PULLS") → a block squashes the robot, the web glows, it springs back ("load spreads"). |
| Proof + constraint | two linked robots spiral up a vertical pipe ("loop + climb") → robot beside a paper controller with signal arcs ("human-piloted (for now)"). |
| Takeaway | a three-rod tensegrity prism grows from the desk ("TENSEGRITY"). |
| CTA | Media Diet sign with a robot resting on top; caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | at the S5 cut the block enters from the top edge for ~0.2 s before it descends into view; at 22.4–22.8 s the prism is still growing, so the frame is briefly sparse. No clipping, missing assets or text overlap seen. |

## Fixes during this round
1. Script: "the web pulls" (Whisper heard "web poles") → "pushing out while it pulls in"; every take then transcribed exactly.
2. Framing (stills): pipe stands hidden outside S1; frame-0 pipe turned diagonal (no end-on cap) and the camera moved in; CTA robot moved
   from above the caption onto the sign; S8 camera pulled back so the prism stays below the caption band.

## Known limitations (honest)
- Date: paper and CSU release 11 Nov 2026 (coverage 12 Nov) — just outside the requested 72 h window; disclosed in SOURCES.md and context/32.
- The robots are generic paper reconstructions from published descriptions (six rods, stretchable web, two-ended claws), not CSU's hardware;
  no CSU or journal footage/photos used. The duct-climbing H-shape is simplified to two linked robots spiralling up a pipe.
- "Load spreads" is the general tensegrity principle (SUPERball/NASA), not a measured TeCoBot load test. Actuation is not claimed.
- Not listened to or watched by a human yet.
