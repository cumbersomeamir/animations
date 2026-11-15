# QA: mello-30s-english17-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01.mp4`, sha256 `01155602871dd0f31dc91680b3334c5a3ac59a5ead1784d2984717725c0bfb44`, 8,907,556 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-15-english-17/mello-30s-english17-01-thumbnail.png`, 1080x1920 PNG, sha256 `92b3f5e52f7d69454f60c3a85c67c47d6f6db66a99aecafccb0da04fcccb3754`. It reads "PERFECT WORDS?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows the approved performer at his desk with his pen over a blank card. Beside him is a heap of crumpled drafts taller than his head, with one more draft in mid-air above it.
- The caption "Waiting for the / perfect words?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.4 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.5 LUFS, bed (pad + soothing air + felt piano + paper/pen SFX) −28.4 LUFS (**12.9 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.056, at 29–30 s under the lock-up); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 59 / 129 / 272 / 396 / 582 / 729 are exactly the six largest frame changes (18.3 / 24.9 / 25.8 / 15.9 / 33.0 / 34.1); the largest non-cut change is 13.0 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone). The large opening caption is at y ~310–560; the rest sit in the usual top band, at most two lines.
- Each of these is measured by its own oriented box: the feelings card, the wording card, the "writer" and "recipient" labels and the "?" bubble. None is behind caption text, in the right rail (x > 930, y 900–1700), in the bottom zone (y > 1560) or past the left 60 px.
- **Neither** figure's head is behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 7 lines are exact matches on the final file. The only differences are punctuation, and "thank you" or digits for "thank-you" and "seven / ten / nine", which are normalised.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "people wrote / thank-you letters" from 5.2 s, while he writes;
  - the envelope is handed over at 6.6–7.15 s, and the "?" bubble appears at 7.25 s on "guessed";
  - the "felt good" bars at 9.85 s and 10.95 s ("expected"), and "awkward" at 12.1 s;
  - "7" at 15.35 s ("seven"), and "9.3" with the gold ring at 17.95 s ("over nine");
  - "Thank you," is written from 20.98 s ("Write one thank-you"), line 1 at 22.7 s ("what they did") and line 2 at 23.6 s ("how it helped").
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all six cuts);
- the 13 beat frames in `frames/` (frame 0 at full size);
- the thumbnail at full size;
- full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–4.3 s) | Frame 0 is the thumbnail composition and the question. The draft lands on the heap. Then he crumples the card and tosses it on the heap, while the sealed envelope stays on the desk ("unsent"). |
| Proof (4.3–19.4 s) | He writes, seals and hands over the note; his "?" guess; the recipient opens it, hand on chest. The dark card shows the writers' guess vs what recipients felt (to scale, Experiment 1 averages). The light card shows the wording score, 7 → 9.3 ("one experiment, averages"). |
| Payoff (19.4–26.3 s) | A flat-lay from above: he writes "Thank you," and two lines right away. Then the wide shot: the note goes over and the recipient reads it. |
| CTA | Both figures at the desk; lock-up. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad; paper and pen sounds only for on-screen actions. |
| Claims | Attributed to "experiments" and to one experiment for the numbers. "Can keep" is hedged (the link is correlational). No promise. Sources are in `notes/publishing-copy.md` and `context/27`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The wording numbers come from one experiment (N = 127 writers, 78 recipients), and the feelings bars from Experiment 1's averages. The heap, the in-person handover and the "?" bubble are staging.
- In the flat-lay (S6) the card is turned to the camera so "Thank you," reads; from his seat it would be upside down. The two lines under the heading are scribbles, not words, and his hand covers part of them as he writes.
- Dark-card fades:
  - For about 2 frames before the S3→S4 cut (9.00–9.03 s), the dark card starting to fade in shows as a faint grey rectangle over the wide shot.
  - At the end of S4 (about 12.9–13.2 s) the dark card fades out to the room before the cut.
- The wording card shows only its title for about 2 s (13.2–15.3 s) while "And the wording?" is said.
- The card legends ("writers' guess", "what they felt", "one experiment, averages") are small (about 34 px on screen); the narration carries them.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
