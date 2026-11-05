# QA — Media Diet · English episode english-06 · "Chrome's enhanced autofill suggests details from Gmail in online forms"

**File:** `videos/media-diet/production/30s/2026-11-06-english-06/media-diet-30s-english06-01.mp4`
**SHA-256:** `bf60786f9b16a7747c6275a4ed8fd4fc4693056d2a483b65f801b7ae3171161c` · 18,030,257 bytes · 4808 kb/s · audio stream tagged `eng`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `bash build/build.sh` (two parallel frame workers, then audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−1.6 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **135–944** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **11/11 cues OK**: each cue appears 0.00–0.19 s before its speech and stays 0.00–0.44 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "October 28", "United States", "Gemini in Chrome", "Personal Intelligence" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.5…−20.5 dB RMS; music −30.5…−34.6 dB (11–14 dB under); foley −33.6…−50.8 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Digging through email for an order number? | Digging through email for an order number. | 1.0 |
| V2 | Since October 28, Chrome can help. | Since October 28, Chrome can help. | 1.0 |
| V3 | Enhanced autofill now suggests details from your Gmail in online forms, | Enhanced Autofill now suggests details from your Gmail in online forms. | 1.0 |
| V4 | like order numbers, tracking info and flight bookings. | Like order numbers, tracking info and flight bookings. | 1.0 |
| V5 | Tap the order field, and the number from your receipt email is suggested. | Tap the Order field, and the number from your receipt email is suggested. | 1.0 |
| V6 | It's rolling out in the United States, for users of Gemini in Chrome with Personal Intelligence on. | It's rolling out in the United States for users of Gemini in Chrome with personal intelligence on. | 1.0 |
| V7 | You control it in Chrome settings. | You control it in Chrome settings. | 1.0 |
| V8 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation and punctuation only.
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, Media Diet sign. |
| News identity | Calendar flips 26 → 27 → OCT 28 on "Since October 28"; a SOURCE placard reads "Google blog · Oct 28, 2026" and stays in the set through S3/S4. |
| Immediate hook | Frame 0: envelopes riffle out of an overflowing paper INBOX while a magnifier hunts; behind, a returns form waits with an empty "Order number" field. |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 an email card rides a cyan rail into the browser form and a suggestion appears · S4 three tickets pop on their words (#, truck, plane) · S5 demo: pointer taps the field, suggestion "A-48217 · from your receipt email in Gmail" unfolds, tap → field filled ✓ · S6 U.S. map lights, desktop/Android/iPhone props pop, "Personal Intelligence" toggle switches on · S7 settings card: Enhanced autofill toggle off → on, "Use info from Gmail" ✓, lock "Encrypted · you choose" · S8 hero pull-back + Media Diet sign (CTA, last 3.3 s). |
| No static pages | Every shot has object action tied to its line; eased camera moves only, no bobbing. |
| Accuracy | "suggests" (not "fills automatically"); date, U.S.-only rollout and eligibility spoken; platforms shown as props and in the publishing caption; generic browser/settings glyphs; no Google/Chrome/Gmail UI or logos. |

## Fixes during this round (each fixed once)
1. Pre-render wording (Whisper on each take): "U.S." was read letter by letter and "Gemini in Chrome" heard as "Gemini and Chrome" → V6 rephrased to "in the United States, for users of Gemini in Chrome …", now heard exactly.
2. Caption width: long cues ("details from your Gmail in online forms,") re-split so every line stays inside x 90–990 at the accepted 50 px size.
3. Framing (stills): tickets clipped, form/settings too close, map cut off → S3–S7 cameras widened (portrait-frame lesson: landscape screens need ~4.5 units of distance) and ticket spacing tightened.
4. Boundary review of the first encode: the S1 magnifier ring leaked into the first S2 frames (70–72), and S5 opened with the dropdown already visible before the tap → lens limited to S1, S5 starts with an empty unfocused field; frames 68–73 and 414–430 re-rendered and the film re-encoded (`SKIP_FRAMES=1 bash build/build.sh`); both fixed in the final export (qa/contact-sheet-boundaries.png).

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- Staged, U.S.-only rollout ("beginning to roll out") for Gemini in Chrome users with Personal Intelligence enabled; the narration says "rolling out".
- The shop, form and order number "A-48217" are fictional illustrations.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
