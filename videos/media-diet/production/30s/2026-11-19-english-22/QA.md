# QA — Media Diet · 30 s English episode 22 · "Five minutes. What's the catch?"

**File:** `videos/media-diet/production/30s/2026-11-19-english-22/media-diet-30s-english22-01.mp4`
**SHA-256:** `093ffc82e6d85cd7209bb9eb998307901ef8399eceb48d2da07b38d2cf79cb91` · 30,383,282 bytes · video ≈ 8.1 Mb/s (x264 CRF 20, see
"Disk" below) · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english22-01.jpg` = frame 0 (1080×1920, JPEG q2, SHA-256 `d5888ea115c24fc5bdf6143235959e345fa5425760768923bbe39c580367d829`);
mean absolute difference vs the encoded MP4's frame 0: 2.05/255 (JPEG vs the lossless render: 1.49/255). Hook words "FIVE MINUTES." /
"WHAT'S THE CATCH?" ink x 198–882, y 360–487.
Build: three resumable chunk workers (frames on the RAM disk `/dev/shm/md-e22`), all 900 PNGs verified, continuity checked at every chunk
start (frame-to-frame difference at each of the 14 chunk boundaries equals its neighbours: no first-frame glitches), then
`SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english22-01.png` converted to JPEG (q2).

## First-frame rule
Frame 0 is the finished subject: a huge glowing charging nozzle hanging over a small battery with a tiny lit gate, plus the hook
"FIVE MINUTES. / WHAT'S THE CATCH?" (= first narration line) at full opacity; voice from 0.05 s, charger hum from 0.0 s. Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.2 LUFS** integrated, true peak **−1.9 dBTP** (limit ≤ −1.0), LRA 2.4 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **360–488**, x **194–886** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **203–877**, y **1344–1478**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **10/10 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **0.976**, per-line **0.988**; every line 1.0 except V4 0.917 (Whisper wrote "27%" for "27 percent", a number-format difference) | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.7…−19.6 dB RMS; music −36.7…−30.7 dB (10.0–17.1 dB under); foley −56.0…−42.8 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 8 cuts, from the encoded MP4 (JPEG) | qa/contact-sheet-*.jpg |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets, encoded file)
| area | result |
|---|---|
| Hook 0–1.78 s | huge nozzle with a glowing cyan ring over a small battery; hook in two large lines (gold/white). |
| Claim 1.78–6.38 s | paper SUV at a flash charger, pulses in the cable; "10→70% in 5 min (claim)" + chip "BYD Tai 9 (Ti 9) · launch 19 Nov 2026 · BYD claim". |
| Question 6.38–8.19 s | close-up of the cable: the surge jams at the port. |
| Measured curve 8.19–12.43 s | steep to 70 % (5:17), bending to 97 % (8:57); "last 27%: 3 min 40 s" + chip "BYD press demo, Abu Dhabi · reported 13 Nov 2026". |
| Cell 12.43–17.31 s | ions cross the separator into graphite sheets; rushed, metal plating cones grow ("rushed → lithium plating"). |
| Heat 17.31–19.24 s | the cell glows red, thermometer climbs ("heat ∝ current²"). |
| Pace 19.24–22.91 s | the curve again, slow tail glowing, frost flakes ("battery sets the pace" + "BYD claim at −30 °C: 20→97% in 12 min"). |
| Payoff 22.91–26.15 s | big gauge, the fast middle band lights ("fast zone: the middle"). |
| CTA 26.15–30 s | Media Diet sign flips up; caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | the curve board has no numeric axis labels (the two measured times are in the label); the gauge is full before the band lights at 24.05 s. No clipping, missing assets or text overlap seen. |

## Disk (operational, recorded honestly)
About 108 MB of disk was free on 21 Nov with two episodes due, so this episode is encoded at x264 **CRF 20** (earlier episodes CRF 17)
and the QA contact sheets, first/last frames and thumbnail are JPEG. The PNG first/last frames written by `build/qa.sh` were converted
to `qa/first-frame.jpg` / `qa/last-frame.jpg` after QA (the PNG copies were removed). Frames, stills and intermediate WAVs lived on the
RAM disk only. Nothing from earlier episodes was deleted.

## Fixes during this round
1. Script: "Tai 9" was heard as "TI-9", so the model name is on screen only; every final take transcribed exactly.
2. Framing: the gauge kept leaving the frame in the claim shot, so it was removed there (it appears only in the payoff).
3. Date honesty: launch results/prices were not available when the script was written, so the narration says "claims" and the chip says
   "launch 19 Nov 2026 · BYD claim".

## Known limitations (honest)
- 10→70 % in 5 min is BYD's claim for the Tai 9; the measured numbers (5:17 to 70 %, 8:57 to 97 %) are from a press demo of an unnamed
  test vehicle, as reported by New Atlas. The curve between the two measured points is smooth interpolation (illustrative).
- The SUV, charger, nozzle, battery, cell cross-section and gauge are generic paper reconstructions (no company imagery or logos).
- Not listened to or watched by a human yet.
