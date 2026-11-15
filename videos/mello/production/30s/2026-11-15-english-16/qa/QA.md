# QA: mello-30s-english16-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-15-english-16/mello-30s-english16-01.mp4`, sha256 `97bd8f9999c1a412dae3cb1948ce61c27cce99cb327f99cb7fdc3fb6575c0b39`, 9,779,588 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-15-english-16/mello-30s-english16-01-thumbnail.png`, 1080x1920 PNG, sha256 `7f11e75a59cc15bd6d0870983f445e673a3ca37a73e775e1b1117a4b07eba773`. It reads "WHY FEEL SMALL?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). Earlier episodes' MP4s are untouched.

Render history:
- **Render 1 (superseded, not in the repo):** passed all 16 checks. But ASR on its final mix heard the line "It's called awe: …" as "It's cold awe" (that line CER 0.057; the file passed overall at 0.009).
- **Render 2 (this file):** the line was reworded to "That feeling is awe: what you feel near something vast, like a night sky." The captions were updated and the whole video was re-rendered. See `notes/production-notes.md`, fix 8.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows the tiny approved figure from behind, on the crest of a dusk meadow. A big gold-cream moon with a halo fills the right side, and a thin band of lit windows lies on the horizon.
- The caption "Why feel small / on purpose?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.1 LUFS integrated, −1.3 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.6 LUFS, bed (pad + soothing air + felt piano + footsteps) −28.6 LUFS (**13.0 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.138, at 15–16 s on the photo card); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 68 / 182 / 329 / 575 are exactly the detected cuts (31.1 / 50.0 / 24.6 / 26.9); the largest non-cut change is 9.7 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone; the large opening caption sits at the top of it, the rest in the usual top band), at most two lines.
- The study card and the photo card are each measured by their own oriented box. Neither is behind caption text, in the right rail (x > 930, y 900–1700), in the bottom zone (y > 1560) or past the left 60 px.
- The performer's head is never behind caption text.
- In S5 the moon is hidden, so it never sits behind the lock-up.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 7 lines are exact matches on the final file. The only differences are punctuation, and "15-minute" for "fifteen-minute", which is normalised.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "That feeling is awe:" is on screen while it is said (from 2.05 s);
  - "what you feel near / something vast," appears after the pause at 3.4 s, and "like a night sky." around 4.8 s;
  - the chips land on their words: "weekly" at 8.2 s, "15 min" at 8.6 s, "8 weeks" at 9.9 s;
  - the selfies fill weeks 1/3/5/8 from 11.4 s to 14.4 s, and the gold frame marks the bigger smile at 15.0 s;
  - the distress bar shortens from 16.4 s to 18.3 s;
  - the walk runs from 19.4 s to 24.0 s, and he looks up from 22.5 s to 24.1 s on "pause for it" (24.16 s).
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of every cut);
- frame 0 at full size;
- full-resolution caption crops at 2.3–3.3 s;
- the thumbnail;
- full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–2.25 s) | Frame 0 is the thumbnail composition and the question; he tilts his head up to the moon. |
| Definition (2.25–6.05 s) | A crane from behind him rises into the stars; awe is defined on a vast sky. |
| Proof (6.05–19.15 s) | Dark in-app card "ONE STUDY": older adults, then "weekly", "15 min" and "8 weeks". A light photo card shows selfies for weeks 1/3/5/8, with the self shrinking and the scenery and smile growing. Then "daily distress", with a bar that shortens. |
| Payoff (19.15–26.3 s) | He walks a grove path past the skyline and stops under the tallest tree. The camera moves low and looks up the trunk to the sky. |
| CTA | Under the trees, with the lock-up. |
| Palette / sound | Store-sampled palette (`context/22`): a dusk sky from #060513 to #633BFE and lilac, gold #FEC357 key words and windows. A soothing air bed sits under the pad. |
| Claims | Attributed to "one study"; "less daily distress" is the reported group difference over time. No promise for the viewer; no claim about anxiety, depression or life satisfaction, which did not change. Sources are in `notes/publishing-copy.md` and `context/26`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The evidence is one small randomized study (60 healthy older adults). The selfies and the distress bar are illustrative of the reported direction, not data.
- From 2.25 s to about 3.0 s, the gold "awe" sits on the moon's soft halo and the colon touches the moon's edge. "awe" stays legible; the colon is faint there.
- The text on the photo card ("week 1", "awe walkers, over 8 weeks") is small; the narration carries the point.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
