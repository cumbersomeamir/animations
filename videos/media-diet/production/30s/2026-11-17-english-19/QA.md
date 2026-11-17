# QA — Media Diet · 30 s English episode 19 · "Tiny label. Big problem."

**File:** `videos/media-diet/production/30s/2026-11-17-english-19/media-diet-30s-english19-01.mp4`
**SHA-256:** `4b9a8f877de20a0a693ab896fb8a429bce1a820bcc2634051ac7ffd01445419b` · 31,857,946 bytes · video 8291 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english19-01.png` = frame 0 (1080×1920 RGB, SHA-256 `d9f44118c8186fd94f8123293cb99eecb50e682298dd57b58d21c60a1db567d8`);
mean absolute difference vs the encoded MP4's frame 0: 1.78/255. Words "Tiny label." / "Big problem." ink x 240–839, y 340–534.
Build: three resumable chunk workers (15 chunks × 60 frames, frames on the RAM disk `/dev/shm/md-e19`), all 900 PNGs verified, then
`SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english19-01.png`.

## First-frame rule
Frame 0 is the finished subject: a light, sensor-gloved robot hand with its fingertip on a tiny yellow label on a liner strip, a taped
cardboard box behind, plus the 4-word hook (= first narration line) at full opacity; voice from 0.05 s, a fingertip tap from 0.0 s.
Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.1 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **340–534** (hook), x **194–887** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **204–875**, y **1354–1484**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **11/11 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **1.0** and per-line pass **1.0** on every line (incl. the CTA) | qa/asr.json |
| music beneath speech (stems, per line) | speech −21.1…−20.2 dB RMS; music −36.8…−31.4 dB (10.3–16.2 dB under); foley ≤ −41.3 dB (silent under some lines) | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 8 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.9 s | gloved fingertip on the tiny label, taped box behind; hook in two large lines (gold/white). |
| Event | from above: a hand lowers a small box into a big one, the flaps fold, tape runs along the seam; source chip "Genesis AI demo · TechCrunch · 17 Nov 2026" + "editorial reconstruction". |
| Escalation | the fingertip slides across the label, which barely lifts and drops back ("rerun"). |
| Question | the box, then the camera settles on the tiny label strip. |
| First principles | peel cutaway: film pulled nearly flat with a growing red arrow ("flat pull ≈ 66× force" + small "ideal thin film, 10° vs 90° (Kendall 1975)") → film turns straight up with a short green arrow ("straight up: easy"). |
| The hard part | the fingertip lifts the label's first edge ("lift the edge"). |
| Mechanism + constraint | the same sensor glove on a worker's hand (blue sleeve) and the robot's hand, pads glowing ("same sensor glove") → the robot glove scuffs and its pads flicker ("hands last weeks"). |
| Takeaway | corner lifted, then pulled steep — the label comes off ("corner, then steep"). |
| CTA | Media Diet sign flips up, the box behind it; caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | the flat-pull arrow grows past the left frame edge at 14–15 s (deliberate: "dozens of times more force"); arms and forearms pass behind the caption gradient in S2 and the close-ups; for ~0.3 s at the CTA cut the paper riser shows before the sign flips up. No clipping, missing assets or text overlap seen. |

## Fixes during this round
1. Script: first draft ran ~28 s; "taped a box" (heard as "taped to box") rewritten; final 87 words / 26.5 s, every take exact.
2. Framing (stills): close-up cameras pulled back; dark glove replaced by a light glove for contrast; palm pad removed; sensor dots added to
   the backs of the fingers; peel cutaway shortened and centred; S2 camera raised so the packing reads; edge-lift and steep-peel staged so
   the curling label is visible.
3. Disk: the session's disk allowance is nearly full (~110 MB free after encode), so frames, stills and QA frames were written to the RAM
   disk via gitignored symlinks; no earlier files were deleted.

## Known limitations (honest)
- Genesis AI's demo footage is not used; the hands, box, label strip and cutaway are a generic paper reconstruction. Whether the demo arms
  wore the sensor gloves is not reported, and the date of the reporter's visit is not stated (the report is dated 17 Nov 2026).
- Why the rerun went wrong was not reported; the peel physics explains why lifting the first edge is hard in general (Kendall's ideal
  thin-film law; the 66× figure is for an ideal film at 10° vs 90°). "Hands wear out in weeks" is the company's own statement.
- Not listened to or watched by a human yet.
