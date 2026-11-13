# QA — Media Diet · 30 s English episode 13 · "Why would a walking robot need wheels?"

**File:** `videos/media-diet/production/30s/2026-11-13-english-13/media-diet-30s-english13-01.mp4`
**SHA-256:** `9abd3e98617372033bb0061ccabfb0723f08a72c0407bd8e2b235e3021ca3f23` · 18,803,532 bytes · 5014 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english13-01.png` (1080×1920 RGB, SHA-256 `4304abcb337550211e7fef1ef5ee32ba3f2a7f165c0cd8ea80085e3455a0b70f`);
words "WHY" / "WHEELS?" ink x 195–883, y 239–570; small "editorial reconstruction" tag x 391–689 (all inside x 100–900 / y 230–1500).
Build: three resumable chunk workers (`build/render_chunks.sh 0 60 120 180 240`, `300 … 540`, `600 … 840`), then
`SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA); thumbnail `node build/thumb.mjs thumbnail-english13-01.png`.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.2 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **378–488**, x **181–900** | qa/text-bounds.json |
| labels (same safe area; never in the caption band while a caption shows; one large label at a time) | labels x **185–895**, y **1300–1456**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **12/12 cues OK**: each cue appears 0.10–0.18 s before its speech and stays 0.10–0.36 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** full-mix pass and **1.0** on every line; the full pass appends a hallucinated "You" over the music tail after the CTA | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.6…−19.0 dB RMS; music −35.1…−29.9 dB (10.0–14.5 dB under); foley −50.7…−39.7 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 9 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR pass on the final mix, caption sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–3.66 s | generic paper humanoid rolls in on scooter wheels, crouches, spins 360° in the air and lands; small source tag "Boston Dynamics · Atlas on a Roll · 9 Nov 2026" and "editorial reconstruction". |
| Super hook | ankle close-up: the feet slide away, magenta adapters appear, scooter rims bolt on ("scooter rim + 1 adapter"). |
| Answer / mechanism / proof | translucent shell, actuators glow as it launches ("test rig, not a product") → torque–speed board: axes, limit line, crossed-out corner ("not both at once") → operating point jumps to the line for LAUNCH / TURN / STOP and the line turns red → ghost robots on simulation tiles ("SIMULATION") → ideal-motor box, dot moves into the corner, real triangle appears and the dot turns into a red ✕ ("ideal motor" → "impossible move") → motor on a test bench spins, measured points appear, the simulated envelope snaps onto them ("MEASURED" → "sim = real"). |
| Payoff | robot rolls, dashes sideways and stops cleanly ("honest motor model"). |
| CTA | Media Diet sign (approved icon) hinges up beside the robot; caption only. |
| Cuts | 10 shots / 9 cuts on cue boundaries; each shot one idea, at most one large label. Sequential reveals open three shots on a briefly empty element: chart board ≈ 0.13 s (S4), simulation tiles ≈ 0.15 s (S6), axes before the ideal box ≈ 0.2 s (S7). In S2 the robot is lifted while the wheels go on, so its wheels hover briefly. |
| Missing assets / clipping | none seen: fonts loaded, icon on the sign, chart texture redraws every frame, no text outside the safe area (automated). |

## Fixes during this round
1. Script: first draft ran 28.2 s of speech → tightened to 81 words / 26.1 s (CTA ends 29.22 s; every gap ≥ 0.3 s).
2. Framing (stills): cameras pulled back for portrait (robot, chart board and sign were clipped; chart top sat under the captions);
   ankle close-up re-aimed so the swap reads; soft front fill light added so the robot isn't a silhouette; labels auto-fit ≤ 720 px.
3. Thumbnail: words moved above the robot's head, source tag moved off the wheels.

## Known limitations (honest)
- The robot is a generic paper reconstruction, not Atlas; no Boston Dynamics footage was used (none downloaded or licensed).
- The torque–speed chart is a generic straight-line motor curve (Northwestern Mechatronics Wiki), not Atlas motor data; dot positions
  for launch/turn/stop, the "ideal motor" box and the measured points are schematic.
- "A robot's AI is only as good as its motor model" is an editorial summary of BD's stated conclusion, not a BD quote.
- Not listened to or watched by a human yet.
