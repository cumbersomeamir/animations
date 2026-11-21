# QA — Media Diet · 30 s English episode 23 · "Kicked flat. How does it get up?"

**File:** `videos/media-diet/production/30s/2026-11-21-english-23/media-diet-30s-english23-01.mp4`
**SHA-256:** `ae3400bcb5608462f9901af740752704587f013e382c85733a11954f100e60f9` · 17,951,618 bytes · video ≈ 4.8 Mb/s (x264 CRF 23, see
"Disk" below) · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english23-01.jpg` = frame 0 (1080×1920, JPEG q2, SHA-256 `2a5016c68ed3bfd3aec2a980ad1807ba7c9afc25d3145c1c1423830a094a16c7`);
mean absolute difference vs the encoded MP4's frame 0: 2.08/255 (JPEG vs the lossless render: 1.22/255). Hook "KICKED FLAT." /
"HOW DOES IT GET UP?" ink x 201–881, y 364–481; chip "illustrative 3D recreation" x 392–688, y 1453–1472.
Build: three resumable chunk workers (frames on the RAM disk `/dev/shm/md-e23`, Chromium temp files on the RAM disk via `TMPDIR`), all 900
PNGs verified, continuity checked at all 14 chunk starts (no chunk-start glitch; the one large jump, frame 778→779, is the planned
S7→S8 cut at 25.95 s), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs <RAM path>.png` → JPEG q2.

## First-frame rule
Frame 0 is the finished subject: the paper humanoid flat on the test lawn, starting to push up, with its centre-of-mass marker and plumb
line landing (red) away from its feet, plus the hook "KICKED FLAT. / HOW DOES IT GET UP?" (= first narration line) at full opacity and the
"illustrative 3D recreation" chip; voice from 0.05 s, servo whir from 0.0 s. Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP** (limit ≤ −1.0), LRA 2.2 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **364–488**, x **196–885** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **204–878**, y **1341–1476**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **10/10 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **1.0** and per-line **1.0** on every line (incl. the CTA) | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.1…−19.0 dB RMS; music −37.0…−30.3 dB (10.8–17.9 dB under); foley −55.1…−42.7 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 (JPEG) | qa/contact-sheet-*.jpg |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets, encoded file)
| area | result |
|---|---|
| Hook 0–1.85 s | humanoid flat on the lawn pushing up; centre-of-mass marker with a red plumb dot; trees behind; hook in two large lines (gold/white). |
| Study 1.85–6.14 s | side view: robot standing; a boot kicks it from behind at 3.62 s (burst), it topples forward and lands prone; counter "1→47 kicks"; dated chip. |
| Principle 6.14–9.32 s | prone robot, marker over its belly (red), green patch at its feet; a translucent ghost stands over the feet from 8.3 s ("center of mass → over the feet"). |
| Mechanism 9.32–13.56 s | plank → feet hop in → weight shifts back; support patch, plumb line, cyan hand and green foot arrows; readout 430/210 N → 110/520 N → 0/630 N; hands lift; it stands with the marker over its feet. |
| Training 13.56–17.56 s | hologram robot on a grid pad; gold cable, ring and arrow on its head ("training aid: 400 N"); reset flash at 15.62 s; second get-up while the aid steps 400 → 0 N in 20 N steps. |
| Hardware 17.56–21.38 s | 47 tiles appear; 34 flip to green checks, 5 grey, 8 red; stopwatch badge "2.64 s mean get-up"; "34 falls → 34 get-ups" + chip "other 13 kicks: 5 no fall, 8 safety cut-outs". |
| Payoff 21.38–25.95 s | the robot walks on (tracking shot) past a "KICK FORCE ?" meter with a wandering needle; "proves recovery, not toughness" + chip "kick force not measured · not yet peer-reviewed". |
| CTA 25.95–30 s | Media Diet sign flips up (flat for ~0.2 s first); the robot waves behind it; caption only. |
| Cuts | 8 shots / 7 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | 17.56–17.75 s the tally board is blank before its tiles appear; in S6 the robot stands at the left edge with an arm close to the frame edge; in S7 the meter sits at the right edge and is fully readable only near the end (its message is also in the label and chip, which are centred). No clipping of text, missing assets or text overlap seen. |

## Disk (operational, recorded honestly)
About 65 MB of disk was free after batch 22's commit, so this episode is encoded at x264 **CRF 23** (batch 22: CRF 20; earlier: 17)
and the QA sheets, first/last frames and thumbnail are JPEG. A first render worker died with "Unable to capture screenshot" while free
disk swung by ~8 MB (Chromium temp files in /tmp); all workers were restarted with `TMPDIR` on the RAM disk and every frame was
re-rendered from its chunk start. Nothing from earlier episodes was deleted.

## Fixes during this round
1. Script: "2.6 seconds" was read as "2, 6" by Whisper, so the mean get-up time is on screen (stopwatch) only; every final take exact.
2. Framing (four still passes): subjects lifted above the label band; three-quarter angles for depth; the side-on kick angle so the boot
   is visible; the tally board made square (7×7) and the camera pulled back so robot and board fit; the CTA robot raised behind the sign.
3. Honesty: the 47 kicks are split on screen (34 falls with control active, 5 no fall, 8 safety cut-outs); force readouts labelled
   "illustrative statics"; the training aid labelled "simulation only"; "not yet peer-reviewed" in the payoff chip.

## Known limitations (honest)
- ReLoco is an arXiv preprint (18 Nov 2026), not peer-reviewed. Hardware counts and timings are the authors' own; the 47 are the
  standing-kick trials (21 further kicks during walking/running are not counted in the narration).
- The get-up choreography (plant hands, feet in, shift back, let go) is an illustrative first-principles explanation, not a trace of the
  robot's actual motion; the newton readouts come from 2-D statics on an illustrative mass split, not robot measurements.
- The humanoid, boot, lawn, simulation pad, tally board, stopwatch and meter are generic paper reconstructions (no company imagery, footage
  or logos).
- Not listened to or watched by a human yet.
