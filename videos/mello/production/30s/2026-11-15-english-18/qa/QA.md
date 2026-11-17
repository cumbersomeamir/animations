# QA: mello-30s-english18-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-15-english-18/mello-30s-english18-01.mp4`, sha256 `3555be7c9d2651c58d399efbfb3f8a6f84ee3565e5c126b6e5ce9b761a1340db`, 6,827,961 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-15-english-18/mello-30s-english18-01-thumbnail.png`, 1080x1920 PNG, sha256 `8b426cdde7307133aecf31efa517b243b7e32b408a26222f0062a7a39e40cbfb`. It reads "CAN THEY TELL?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows the approved performer at a lectern beside a giant thought bubble with a violet heart. Two audience members' heads are in the foreground.
- The caption "Can they tell / you're nervous?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.6 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.8 LUFS, bed (pad + soothing air + felt piano + heartbeat and SFX) −28.9 LUFS (**13.1 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.084, at 27–28 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 47 / 156 / 315 / 480 / 596 are exactly the five largest frame changes (20.3 / 29.8 / 23.9 / 33.3 / 27.8); the largest non-cut change is 10.8 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone). The large opening caption is at y ~310–560; the rest sit in the usual top band, at most two lines.
- The card is measured by its own oriented box. It is never behind caption text, in the right rail (x > 930, y 900–1700; its right edge is about 920 px in S4), in the bottom zone (y > 1560) or past the left 60 px.
- The speaker's head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed and the muffled heartbeat sound soothing rather than tense.
- **ASR result:** all 7 lines are exact matches on the final file (punctuation aside).
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "the illusion of transparency" appears at 3.4 s;
  - "speakers felt" bar at 7.3 s ("scored their own nerves"), "they guessed" at 8.7 s ("guessed");
  - the gold "≈" at 12.4 s ("nearly all of it"), and "audience saw" from 13.7 s, filling by 14.6 s ("clearly calmer");
  - the camera swings to the audience's side on "They only see the outside" (17.55–18.95 s), and the bubble fades;
  - the heart slows from 21.2 s ("helped speakers") to 24.6 s, while he looks up (23.1 s) and opens a hand (24.1 s).
- **Heartbeat:** computed from the same phase as the heart on screen. It plays only while the heart is visible (S1–S2, S5 fading out, S6 slowing).
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all five cuts);
- frame 0 at full size;
- the thumbnail at full size;
- full-resolution stills during the iterations, including S4 for the rail and the cut contrasts.

| Criterion | Assessment |
|---|---|
| Hook (0–5.2 s) | Frame 0 is the thumbnail composition and the question. Then a closer shot of the racing heart beside him as the illusion is named. |
| Proof (5.2–16.0 s) | The dark card "HOW NERVOUS, AFTER CLASS SPEECHES" ("one class study, averages"). "Speakers felt" and "they guessed" are almost the same length (≈); "audience saw" is clearly shorter (gold). Bars are drawn to scale from the published averages, with no numbers on screen. |
| Mechanism (16.0–19.85 s) | From behind him the bubble fills the view; the camera swings round to the audience's side and the bubble fades. From there he simply looks like a speaker. |
| Payoff (19.85–26.3 s) | The bubble returns, and the heart slows and shrinks; he looks up and opens a hand; two audience members nod. |
| CTA | Lock-up above the calmer bubble. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad; heartbeat, swish and ticks only for on-screen actions. |
| Claims | "One class study, averages" on the card; "in another study" for the 2003 finding; the reframe is advice, not a promise. Sources are in `notes/publishing-copy.md` and `context/28`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- Savitsky & Gilovich (2003) could not be read directly (publisher 403, archive host blocked, dead original link). "Knowing this helped speakers" rests on a peer-reviewed description of it (MacInnis et al. 2010).
- The bars are one class study's averages (93 speakers); individual speakers vary.
- Card fades: as the card fades in at the start of S3 (5.2–5.45 s) it shows as a translucent grey panel. At the end of S4 (about 15.7–16.0 s) it fades out to the room before the cut.
- The card's small labels ("one class study, averages", "calm", "very nervous") are about 30–35 px on screen; the narration carries them.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
