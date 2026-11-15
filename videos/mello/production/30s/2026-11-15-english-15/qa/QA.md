# QA: mello-30s-english15-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-15-english-15/mello-30s-english15-01.mp4`, sha256 `3f732e1ae600849119494d8f761f4abdd91b303d025cc1e885a3933ba7133b13`, 9,974,020 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-15-english-15/mello-30s-english15-01-thumbnail.png`, 1080x1920 PNG, sha256 `c6ee063fa166de11fb82f983ab715ba63f3c11af13eba5279a67561e90cd1c7c`. It reads "WHO IS TOMORROW YOU?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

## First frame (new rule, `context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows two versions of the same approved character facing each other across a TODAY | TOMORROW calendar.
  - Today-you is in violet, holding up a cupcake.
  - Tomorrow-you is a lighter, glowing version, holding running shoes and pointing at "TOMORROW · 7:00 run".
- The caption "Who is / tomorrow-you?" (4 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.7 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.9 LUFS, bed (pad + soothing air + SFX) −29.1 LUFS (**13.2 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.12, at 29–30 s under the lock-up); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 101 / 321 / 446 / 602 are exactly the detected cuts (25.4 / 28.4 / 23.6 / 34.6); the largest non-cut change is 9.1 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.80–28.52 s; lock-up from 26.5 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone; the large opening caption reaches y 306–554, the rest sit in the usual top band), at most two lines.
- The card, the calendar and the "shoes by the door" label are each measured by their own oriented box. None is behind caption text, in the right rail (x > 930, y 900–1700), in the bottom zone (y > 1560) or past the left 60 px.
- **Neither** figure's head is behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 6 lines are exact matches on the final file.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "like a stranger?" appears at 2.2 s;
  - "disgusting," at 4.6 s;
  - the "=" frame on the card at 8.0 s, before "for a stranger." at 9.35 s;
  - the balance tips to "now" around 12–14 s and to "later" around 16.4–19 s, on "more patient";
  - "by the door." at 24.55 s, with the shoes set down at 24.1 s.
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), the 11 beat frames in `frames/` (frame 0 at full size), the thumbnail, and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–3.35 s) | Frame 0 is the thumbnail composition and the question; the two of them keep gesturing. |
| Proof (3.35–20 s) | Card "ONE EXPERIMENT": "a disgusting drink", then now-you / future-you / a stranger, with future-you = a stranger framed. A balance shows the cupcake ("now") outweighing the receding star ("later"). Tomorrow's page fills with a vivid sunrise, tomorrow-you glows, the star returns and the balance tips to "later". |
| Payoff (20–26.5 s) | Tomorrow-you hands over the running shoes; today-you sets them on the bench by the door ("shoes by the door"). |
| CTA | Both of them by the calendar; lock-up. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad. |
| Claims | Attributed to one experiment and to studies; "helps" for the link; no guaranteed habit change. Sources are in `notes/publishing-copy.md` and `context/25`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The direction and amounts of Pronin et al.'s drink experiment are not shown, because the full text is closed. The card shows only "future-you = a stranger".
- For about 0.3 s as the dark card fades in and out (around 3.4 s and 10.7 s) it reads as a translucent grey panel.
- The "shoes by the door" label is small (about 40 px text) and shown for about 1.2 s; the narration says it at the same time.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
