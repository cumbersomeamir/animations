# QA — Media Diet · English episode english-10 · "Describe a school dashboard and Muse builds it"

**File:** `videos/media-diet/production/30s/2026-11-09-english-10/media-diet-30s-english10-01.mp4`
**SHA-256:** `9fa46e991efec11aaf15f10dbee1fb6b4d1dcc4ec94191d916327cf7407e5f4e` · 18,801,537 bytes · 5014 kb/s · audio stream tagged `eng`
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
| loudness | **−15.1 LUFS** integrated, true peak **−1.8 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **122–959** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **11/11 cues OK**: each cue appears 0.00–0.18 s before its speech and stays 0.00–0.44 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "November 6", "Meta", "Muse", "school dashboard", "calendar" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.8…−20.7 dB RMS; music −29.9…−34.3 dB (10.0–14.2 dB under); foley −36.8…−48.8 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Drowning in school emails about your kids' events? | Drowning in school emails about your kids events. | 1.0 |
| V2 | On November 6, Meta added spaces to its Muse app. | On November 6, Meta added spaces to its Muse app. | 1.0 |
| V3 | Before, you dug through every email and copied each date by hand. | Before, you dug through every email and copied each date by hand. | 1.0 |
| V4 | Now, describe a school dashboard: Muse builds it and adds those events to your calendar. | Now describe a school dashboard. Muse builds it and adds those events to your calendar. | 1.0 |
| V5 | Connect your apps, and it keeps itself up to date in the background. | Connect your apps and it keeps itself up to date in the background. | 1.0 |
| V6 | It's live wherever Muse is available, but you can't share spaces yet. | It's live wherever Muse is available, but you can't share spaces yet. | 1.0 |
| V7 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation and punctuation only (the matcher now ignores a trailing apostrophe: "kids'" = "kids"; the first run
scored V1 0.875 only because of that apostrophe).
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, source placard, Media Diet sign. |
| News identity | Calendar flips 4 → 5 → NOV 6 on "On November 6"; a SOURCE placard "Meta Newsroom · Nov 6, 2026" hinges up in front of it. |
| Immediate hook | Frame 0: school envelopes are already falling onto a paper phone whose inbox scrolls with "School office" mail; the unread count climbs to 47 and the envelopes pile up. |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 Muse app "Spaces · NEW", example spaces, "+ New space" · S4 "Before": a paper pointer carries two dates from the letters to the wall calendar, one at a time · S5 "Now": the idea is typed, "Building your space…", "School dashboard" lists the events, pull-back as every date flies onto the calendar · S6 Mail and Calendar tiles wired to the phone; a new email → "Book fair · NEW" + a chip on the Calendar tile; "Updated just now" · S7 "Muse on the web" laptop; share card bounces off "Sharing · not yet"; phone "Share space · not yet" · S8 hero + Media Diet sign (CTA, last 3.95 s). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | Date, Meta's own school-dashboard example, self-updating with connected apps, "wherever Muse is available" and "can't share spaces yet" are spoken; generic phone/screen glyphs; no Meta or Muse logos or interface; no claim about how well Muse reads emails. |

## Fixes during this round (each fixed once)
1. Caption width: the long V5 cue re-split so every line stays inside x 90–990.
2. Framing (stills): the phone header sat under the captions in S1/S6/S7, the wall calendar was clipped in the "Before" shot, the Calendar tile hid behind the letters, the "Now" pull-back cut off the phone → cameras re-aimed, Calendar tile moved forward; the hook's envelopes now start falling before frame 0 so the first frame already moves.
3. ASR scoring: an apostrophe-only spelling difference ("kids'" vs "kids") counted as a miss → the matcher strips trailing apostrophes; re-scored on the same export (1.0 everywhere).
4. Session restarts during the job: chunked, resumable rendering kept all 900 frames; encoded from the complete set.

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- "Available everywhere Muse is available" — Meta's post does not list countries; sharing spaces is not offered yet (said in V6).
- The screens, events, letters, tiles and laptop are illustrations, not Meta screenshots.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
