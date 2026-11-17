# QA: mello-30s-english19-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01.mp4`, sha256 `a075e8c6c7e8025ec10a290c01bd6a35bf7a5bb57b6c732e73213b17e6a0b533`, 6,734,517 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-17-english-19/mello-30s-english19-01-thumbnail.png`, 1080x1920 PNG, sha256 `54f3ae65677a2ea4031273909658f666e058a8e744a3c27f8bdc963c863a3e02`. It reads "WHY MONDAYS FEEL NEW?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). Earlier episodes' MP4s are untouched.

Render history:
- **Render 1 (superseded, overwritten at the same path, never committed):** 15 of 16 checks passed. `cuts_on_plan` failed at the S3→S4 cut (frame change 8.8, under the 10 threshold).
- **Render 2 (this file):** S4 moved to a clearly different low angle (see `notes/production-notes.md`, fix 8).

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows a giant calendar whose SUNDAY page, marked with crossed-out slip-ups, swings open like a door onto MONDAY 1 with a gold sunrise. The approved performer faces it.
- The caption "Why do Mondays / feel new?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.5 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.6 LUFS, bed (pad + soothing air + felt piano + paper SFX) −28.5 LUFS (**12.9 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.029, at 27–28 s under the lock-up; threshold 0.02); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 51 / 132 / 237 / 404 / 515 / 614 are exactly the six largest frame changes (28.2 / 24.0 / 19.5 / 27.9 / 27.8 / 21.8); the largest non-cut change is 12.8 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone). The large opening caption is at y ~310–560; the rest sit in the usual top band, at most two lines.
- Each of these is measured by its own oriented box: the card, and the calendar page's text area (header, numeral, and the grid rows down to the DAY 1 row). Neither is behind caption text, in the right rail (x > 930, y 900–1700), in the bottom zone (y > 1560) or past the left 60 px.
- The performer's head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 8 lines are exact matches on the final file. "Twentieth" is transcribed as "20th" and normalised.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "the fresh start effect" appears at 2.95 s;
  - THU 20 is ringed at 6.0 s ("picked a day");
  - "third Thursday" 7% from 8.35 s; "first day of spring" at 9.85 s, its bar growing to 26% from 11.2 s ("over three times as many");
  - SUMMER BREAK, DAY 1 swings in at 15.25–16.05 s ("first day of summer break");
  - the old page drifts away from 17.5 s ("past slip-ups feel further away");
  - the DAY 1 tag goes on at 23.3–24.15 s ("like day one").
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all six cuts);
- frame 0 and the thumbnail at full size;
- full-resolution stills during the iterations, including S4 for the rail and the cut contrast.

| Criterion | Assessment |
|---|---|
| Hook (0–4.4 s) | Frame 0 is the thumbnail composition and the question; then MONDAY 1 straight on as the effect is named. |
| Proof (4.4–17.15 s) | The card: a March week strip with THU 20 ringed. Then, from a low angle, "third Thursday" 7% vs "first day of spring" 26% (to scale, real figures). The calendar then swings to SUMMER BREAK, DAY 1 for the second study. |
| Mechanism (17.15–20.45 s) | Sunday's page with its slip-ups drifts away into the back of the room. |
| Payoff (20.45–26.3 s) | A month view (today the 10th ringed); his hand sets a gold DAY 1 tag on the coming Monday. |
| CTA | Lock-up above the calendar. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad; paper sounds only for on-screen actions. |
| Claims | "In one study" with the measured figures; "a second study found the same"; "can make…" for the mechanism; the payoff is advice. Sources are in `notes/publishing-copy.md` and `context/29`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The studies measured choices of a reminder date (and, in other studies, engagement and motivation), not whether people reached their goals; the script says only "chose it".
- Fades and cuts:
  - The card shows as a translucent grey panel for about 0.3 s as it fades in at the start of S3 (4.4–4.7 s).
  - At the end of S4 it fades out to the empty room before the cut.
  - The Sunday page in frame 0 finishes its swing by about 1.0 s.
- In S7 the performer is mostly out of frame; only his reaching arm is seen as the tag goes on.
- The minimum per-second motion (0.029 at 27–28 s, under the lock-up) is close to the 0.02 threshold.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
