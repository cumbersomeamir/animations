# QA — Media Diet · 30 s English episode 24 · "The safety net spread the crash."

**File:** `videos/media-diet/production/30s/2026-11-23-english-24/media-diet-30s-english24-01.mp4`
**SHA-256:** `9d95b22ec133a4a3bc4251ef52d81b905a89f7985392148ffd3613f2fb13b9d7` · 15,815,568 bytes · video ≈ 4.2 Mb/s (x264 CRF 20) · audio
stream tagged `eng`
**Thumbnail:** `thumbnail-english24-01.jpg` = frame 0 (1080×1920, JPEG q2, SHA-256 `6ead15aa21865047d23d80dfbee3d289cb3906e0dd038e0de7c08a8ea870bfa4`);
mean absolute difference vs the encoded MP4's frame 0: 1.37/255 (JPEG vs the lossless render: 0.89/255). Hook "THE SAFETY NET" /
"SPREAD THE CRASH." ink x 201–878, y 360–487; chip "illustration · Microsoft 365 outage, 12 Nov 2026" x 255–826, y 1453–1476.
Build (all in RAM, see "Disk"): three resumable chunk workers with Chromium temp files on the RAM disk, all 900 PNGs present, continuity
checked at all 14 chunk starts (0 glitches), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs <RAM path>.png` → JPEG q2.

## First-frame rule
Frame 0 is the finished subject: a receding row of paper gateway servers, the near ones frozen (frost, red LEDs, red overflowing gauges),
a glowing red rerouting net carrying mail onward to the still-green ones, plus the hook "THE SAFETY NET / SPREAD THE CRASH." (= first
narration line) at full opacity and the illustration/date chip; voice from 0.05 s, hum + freeze crackle from 0.0 s. Thumbnail = same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP** (limit ≤ −1.0), LRA 1.8 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **360–488**, x **192–888** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **201–877**, y **1342–1476**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **10/10 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | full-mix single pass **1.0** and per-line **1.0** on every line (incl. the CTA) | qa/asr.json |
| music beneath speech (stems, per line) | speech −20.5…−19.2 dB RMS; music −36.6…−30.1 dB (10.2–17.5 dB under); foley −53.2…−41.9 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 9 cuts, from the encoded MP4 (JPEG) | qa/contact-sheet-*.jpg |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets, encoded file)
| area | result |
|---|---|
| Hook 0–1.8 s | receding server row; near ones frozen, red rerouting arcs carry mail to the green ones; hook in two large lines (gold/white). |
| Super-hook 1.8–5.47 s | paper laptop with a generic mail screen: "Can't connect" + spinner; mail piles up; "≈ 24 hours of disruption" + report-date chip. |
| Bug 5.47–8.26 s | server cutaway: requests queue at a one-at-a-time lock that jams at "froze"; frost and flakes; "too busy → frozen" + "latent Windows defect: lock contention". |
| Rerouting 8.26–11.28 s | ten servers fed by one mail stream; one freezes; its mail goes to the rest; readout "same traffic ÷ 9 servers = 10.0 each" + "~14% of capacity offline for routine updates". |
| Cascade 11.28–14.25 s | neighbours cross the red limit line and freeze one by one; readout "7 left · 12.9 each" … "1 left · 90.0 each (limit 10)" + "illustrative" chip. |
| North America 14.25–18.58 s | stylised paper map; sites go dark outward from US East; ~16 % stay green; "over 80% unresponsive" + "North America, in under two hours". |
| Worldwide 18.58–21.12 s | traffic arcs leave North America for every other region; those sites go dark; "every region hit" + "stylised map · sites are illustrative". |
| Payoff 1 21.12–22.74 s | 13 servers: one freezes, the rest absorb its share without crossing the limit; "spare room absorbs it". |
| Payoff 2 22.74–25.9 s | violet walls rise between three pools; "walled-off pools" + "Microsoft's planned fix · report 20 Nov 2026". |
| CTA 25.9–30 s | Media Diet sign flips up (flat for ~0.25 s first); caption only. |
| Cuts | 10 shots / 9 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | In the walls shot the frozen pool sits at the left behind the first wall, so "the failure stays in one pool" is carried mostly by the label and narration; the world map is stylised (continents hand-drawn). No clipping of text, missing assets or text overlap seen. |

## Disk / staging (operational, recorded honestly)
The container's root disk had 20 MB free and all earlier caches were to be preserved, so nothing on disk was deleted or rewritten.
Everything for this episode — frames, audio WAVs, encode, QA, thumbnail and Git staging — lives on the RAM disk: a sparse partial clone
of `claude-video/media-diet` at `/dev/shm/repo24`, from which the commits were pushed. Shared read-only inputs (three.js, fonts, Kokoro
and Whisper models, Python venv) are symlinked to the existing copies on disk. The on-disk checkout `/home/user/animations` was not
modified and is behind the remote after this push (updating it needs roughly the MP4's size of free disk).

## Fixes during this round
1. Script: "Outlook's" lost its "s" and "froze too" was heard as "froze to" by Whisper, so both lines were rephrased; every final take exact.
2. Framing (three still passes): the mail hopper moved behind the row so it no longer blocks the servers; hook camera pulled back and
   centred; frost overlays reduced so frozen servers stay readable; the world map viewed from above-east to fit the portrait frame.
3. Honesty: illustrative load numbers labelled; the map labelled stylised; the fix labelled "planned".

## Known limitations (honest)
- The row scenes use illustrative numbers (90 units of traffic, limit 10 per server), not Microsoft's capacity figures.
- Microsoft's fixes are planned (target quarters CY26 Q4–CY27 Q1 or TBD in the report), not yet shipped.
- The PIR copy read is the PDF linked by Ars Technica (Microsoft distributes PIRs through the admin center).
- Servers, laptop, mail and map are generic paper reconstructions (no Microsoft, Outlook, Teams or Windows logos or screenshots).
- Not listened to or watched by a human yet.
