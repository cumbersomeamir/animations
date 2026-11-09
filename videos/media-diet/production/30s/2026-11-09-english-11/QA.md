# QA — Media Diet · English episode english-11 · "Instagram's teen-detection AI goes global"

**File:** `videos/media-diet/production/30s/2026-11-09-english-11/media-diet-30s-english11-01.mp4`
**SHA-256:** `d8db014cb07bdff26c559c6619d9ec6aa7fa0553059e2803971b3bc075d0c5ad` · 19,563,961 bytes · 5217 kb/s · audio stream tagged `eng`
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
| loudness | **−15.0 LUFS** integrated, true peak **−2.0 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **126–953** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **9/9 cues OK**: each cue appears 0.00–0.14 s before its speech and stays 0.00–0.37 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "November 9", "Instagram's", "teen-detection AI", "Teen Account", "Facebook", "Threads" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.5…−20.2 dB RMS; music −30.0…−34.6 dB (10.2–14.4 dB under); foley −37.1…−49.6 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Your teen signed up with a fake adult birthday? | Your teen signed up with a fake adult birthday. | 1.0 |
| V2 | On November 9, Instagram's teen-detection AI went global. | On November 9, Instagram's teen detection AI went global. | 1.0 |
| V3 | Before, a fake adult birthday could slip right past. | Before, a fake adult birthday could slip right past. | 1.0 |
| V4 | Now, if the AI suspects a teen, the account moves into Teen Account protections. | Now, if the AI suspects a teen, the account moves into teen account protections. | 1.0 |
| V5 | That limits who can contact them, what they see, and their time on the app. | That limits who can contact them, what they see, and their time on the app. | 1.0 |
| V6 | Facebook is still rolling out, and Threads comes later this year. | Facebook is still rolling out, and threads comes later this year. | 1.0 |
| V7 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation, hyphenation and punctuation only.
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, source placard, Media Diet sign. |
| News identity | Calendar flips 7 → 8 → NOV 9 on "On November 9"; a SOURCE placard "Meta Newsroom · Nov 9, 2026" hinges up in front of it. |
| Immediate hook | From 0.1 s the birth year on a paper "Create account" form rolls 2012 → 1999; "Age 18+" ticks at 1.75 s; "Account created". |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 globe, pins light worldwide · S4 "Before": the 1999 account card slips through the "Age check" gate into "Adult account" · S5 "Now": "AI" lens sweeps, "Likely a teen" stamp, the card hops into the "Teen Account" booth, which lights · S6 badges "Who can contact them", "What they see", "Time on the app" pop on their words · S7 app tiles: Instagram "Worldwide now", Facebook "Rolling out", Threads "Later this year" · S8 hero + Media Diet sign (CTA, last 4.0 s). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | Date, the global Instagram expansion, the move into Teen Account protections, the three limits and the Facebook/Threads status are spoken; how the AI estimates age is not depicted or claimed; generic glyphs; no Meta, Instagram, Facebook or Threads logos or interface. |

## Fixes during this round (each fixed once)
1. Script length (ASR-timed takes): 27.2 s → 24.5 s of speech so the CTA sits in the last 4 s.
2. Framing (stills): the form, globe, badges and app tiles were clipped, the "AI" lens covered the "Adult account" label, the Before/Now tags were off-frame, a booth label crowded the hook → cameras re-aimed, lens lowered over the card, tags moved under their booths, badges spaced and scaled; the year now starts rolling at 0.1 s.
3. Push conflict: the owner added `videos/media-diet/assets/user-footage/2026-11-10-chicago-bean.mp4` on the remote meanwhile → rebased onto it (kept intact, not used here), no force push.
4. Session restart during the job: chunked, resumable rendering kept all 900 frames; encoded from the complete set.

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- Instagram globally from Nov 9; Facebook still rolling out; Threads later this year (said in V6).
- The form, booths, badges and tiles are illustrations, not Meta screenshots.
- At the S7 cut (21.82 s) the app tiles pop in over the first ~0.2 s, so the opening frames show only the globe.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
