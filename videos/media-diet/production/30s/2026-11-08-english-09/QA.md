# QA — Media Diet · English episode english-09 · "Your own Spotify on a United seatback screen"

**File:** `videos/media-diet/production/30s/2026-11-08-english-09/media-diet-30s-english09-01.mp4`
**SHA-256:** `344d8d563f4e0ff3c2c79058a48c3ee356bdc4874648fb8c3e6a25cdbed1ab20` · 22,794,318 bytes · 6078 kb/s · audio stream tagged `eng`
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
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **158–921** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **11/11 cues OK**: each cue appears 0.00–0.19 s before its speech and stays 0.00–0.40 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "November 5", "Spotify", "United", "Wi-Fi", "QR code", "Starlink" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.3…−20.1 dB RMS; music −29.8…−34.4 dB (9.6–14.8 dB under); foley −38.7…−46.1 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Your own playlists, on an airplane seatback screen? | Your own playlists on an airplane seatback screen. | 1.0 |
| V2 | New on November 5: your Spotify login on United seatbacks. | New on November 5. Your Spotify login on United Seatbacks. | 1.0 |
| V3 | Join the plane's Wi-Fi, no pass needed, then scan the QR code. | Join the plane's Wi-Fi, no pass needed, then scan the QR code. | 1.0 |
| V4 | Your playlists and podcasts appear, right where you left off. | Your playlists and podcasts appear right where you left off. | 1.0 |
| V5 | Your password never touches the screen; it logs out after the flight. | Your password never touches the screen. It logs out after the flight. | 1.0 |
| V6 | The catch: only United planes with Starlink for now, but more are coming. | The catch? Only United Planes with Starlink for now, but more are coming. | 1.0 |
| V7 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation and punctuation only.
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, source placard, Media Diet sign. |
| News identity | Calendar flips 3 → 4 → NOV 5 on "New on November 5"; a SOURCE placard "Spotify Newsroom · Nov 5, 2026" hinges up in front of it. |
| Immediate hook | Frame 0: a paper airplane seat whose seatback shows a QR code; from 0.2 s the phone on the tray table scans it (cyan beam), "Connected" at 0.75 s, your own library tiles fill the seatback by 1.9 s; clouds drift past the window. |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 seatback "Entertainment" menu, Spotify tile lights up · S4 phone: join "United" Wi-Fi → Connected, "No Wi-Fi pass needed"; pull back; QR scan → Confirm → Connected · S5 "Your Library": playlists + "Continue listening · Podcast · Ep. 12" resuming; phone as remote · S6 password "Stays on your phone"; seatback "No password typed here"; flight map → landing → "Logged out" · S7 paper fleet: Starlink planes light first, two more on "more are coming", two still waiting; banner "more aircraft through 2027" · S8 hero + Media Diet sign (CTA, last 4.0 s). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | Date, the steps (Wi-Fi without a pass, QR scan), resume, login never on the seatback, auto logout, Starlink-only for now with more to come are spoken; generic seat/screen glyphs; no Spotify, United or Starlink logos or interface. |

## Fixes during this round (each fixed once)
1. Pre-render wording (Whisper on each take): "United's" was heard as "United" → "United planes with Starlink"; the spoken year ("through 2027", ~1.5 s) moved onto the banner; script trimmed 84 → 71 words so the CTA starts 4.0 s before the end.
2. Framing (stills): seatback screen under the captions in the cabin and privacy shots, the phone close-up under the captions with the seatback's text behind them → cameras re-aimed (higher cabin view, top-down phone view, privacy shot from the left), "No password typed here" laid out on the uncovered half, the seatback dimmed during the Wi-Fi close-up.
3. The phone's paper strut poked through its screen (the phone leans back further on the tray) → strut moved behind the phone.
4. Session restarts during the job: chunked, resumable rendering kept all 900 frames; encoded from the complete set.

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- Only on United's Starlink-equipped aircraft for now, expanding through 2027; features depend on Spotify plan and market (source).
- The seat, screens, QR-style pattern and playlists are illustrations, not Spotify or United screenshots.
- During the 0.5 s camera pull-back at 10.4 s the seatback's "Log in with your phone" text passes behind the caption band (readable captions throughout).
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
