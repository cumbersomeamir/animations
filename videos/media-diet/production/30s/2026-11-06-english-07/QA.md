# QA — Media Diet · English episode english-07 · "WhatsApp Events invites now reach friends who aren't on WhatsApp"

**File:** `videos/media-diet/production/30s/2026-11-06-english-07/media-diet-30s-english07-01.mp4`
**SHA-256:** `c89e87bd5047a31a56e14ead15075ab4110fd19b3833a09b67effebcf39f6d27` · 17,572,636 bytes · 4686 kb/s · audio stream tagged `eng`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `build/render_chunks.sh` (two parallel workers,
resumable 60-frame chunks), then `SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−1.9 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **128–953** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **9/9 cues OK**: each cue appears 0.00–0.12 s before its speech and stays 0.00–0.47 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "November 5", "WhatsApp", "RSVP", "without downloading the app", "only after replying" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.5…−20.5 dB RMS; music −30.0…−34.7 dB (10–15 dB under); foley −36.5…−46.1 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Planning a meetup, but one friend isn't on WhatsApp? | Planning a meetup, but one friend isn't on WhatsApp. | 1.0 |
| V2 | On November 5, WhatsApp updated Events. | On November 5, WhatsApp updated events. | 1.0 |
| V3 | Create an event, add a photo, and share one link with everyone. | Create an event, add a photo and share one link with everyone. | 1.0 |
| V4 | Your friend opens it and can RSVP without downloading the app. | Your friend opens it and can RSVP without downloading the app. | 1.0 |
| V5 | Replies land in the new Events Home, with reminders. | Replies land in the new event's home with reminders. | 1.0 |
| V6 | One limit: guests without WhatsApp see the address only after replying. | One limit. Guests without WhatsApp see the address only after replying. | 1.0 |
| V7 | It's rolling out to everyone over the coming weeks. | It's rolling out to everyone over the coming weeks. | 1.0 |
| V8 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation, punctuation and the homophone "event's home". The full pass appends a stray "You" after the CTA:
the narration stem is silent there (29.04–30.0 s, only the pad at −37.8 dB), a known Whisper artefact on quiet music.
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, source placard, Media Diet sign. |
| News identity | Calendar flips 3 → 4 → NOV 5 on "On November 5"; a SOURCE placard "Meta newsroom · Nov 5, 2026" hinges up in front of it. |
| Immediate hook | From 0.05 s invite envelopes fly from the host's phone to five paper friends; four get a check by 1.4 s; the fifth (no-app badge) bounces the invite back and a "?" pops at 1.8 s. |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 new-event form: name types, cover photo drops in, "Share link" → one link fans out to all five friends, "?" → check · S4 the friend's phone opens a plain web page from the link, pointer taps RSVP → "You're going ✓", address + pin appear; "Install app?" tile struck out and tipped over · S5 Events Home: replies fly back, Going 0 → 5, reminder switches on · S6 limit: "Not replied yet" (address locked, lock rattles) vs "Replied" (14 Park Lane, pin) · S7 rollout grid lights in waves, two phones still waiting, banner part-filled · S8 hero pull-back + Media Diet sign (CTA, last 3.6 s). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | Date, how it works, the limit ("only after replying" = after they RSVP) and the staged rollout are spoken; generic phone/page glyphs; no WhatsApp/Meta logos or interface. |

## Fixes during this round (each fixed once)
1. Pre-render wording (Whisper on each take): "after they RSVP" was heard as "after they are RSVP" (also spelled "R.S.V.P.") → "after replying"; script trimmed 77 → 73 words so the CTA starts 3.6 s before the end.
2. Framing (stills): the friend without the app was cut off in the hook, the S2 source placard was clipped, the 3-D pin covered the event title, the "Install app?" tile sat out of frame and the Events header hid under the captions → tokens re-spaced and scaled, calendar/placard stacked for the portrait frame, pin made smaller and moved to the address row's end, tile moved to the lower left, S1/S2/S3/S5/S6/S7 cameras re-aimed.
3. Session restart during rendering stopped both workers at ~127 frames → resumable 60-frame chunk driver (`build/render_chunks.sh`); all 900 frames rendered with complete caption logs.
4. Boundary review of the first encode: the friend's phone showed an empty white page for ~0.4 s after the 10.38 s cut → page opening starts at the cut (0.3 s fade); frames 311–330 re-rendered and the film re-encoded.

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- Staged rollout ("rolling out to everyone over the following weeks"); some phones may not show the update yet — said in V7.
- The picnic, address, friend tokens and screen layouts are illustrations, not WhatsApp screenshots.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
