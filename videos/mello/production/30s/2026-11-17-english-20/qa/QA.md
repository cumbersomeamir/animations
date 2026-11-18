# QA: mello-30s-english20-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-17-english-20/mello-30s-english20-01.mp4`, sha256 `edd65fef19664df77080972df35ab73cb4c2ca762b06e7cb8ba488481ec9e3fc`, 6,865,754 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-17-english-20/mello-30s-english20-01-thumbnail.png`, 1080x1920 PNG, sha256 `13f2514095a35a0e55bca29c60fa3e1f1e846e31c8b44ab7842bbbb2d9e27a09`. It reads "DOES NAMING HELP?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). Earlier episodes' MP4s are untouched.

Render history (renders 1–2 were superseded, kept out of the repo, and overwritten at the same path):
- **Render 1:** failed `safe_zones` (the message screen in the right rail during S2) and `cuts_on_plan` (the S4→S5 cut at 6.5, because the card faded out first).
- **Render 2:** passed all 16 checks, but the gold "I feel anxious" tag was half hidden behind the message screen in S6–S7.
- **Render 3 (this file):** the tag sits in front of the screen. See `notes/production-notes.md`, fixes 4–5.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows the approved performer looking down at his phone. A dark, spiky storm (the unnamed feeling) hangs over his head, beside a big phone screen reading "We need to talk.".
- The caption "Does naming / a feeling help?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.1 LUFS integrated, −1.5 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.6 LUFS, bed (pad + soothing air + felt piano + SFX) −28.7 LUFS (**13.1 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.04, at 6–7 s on the card); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 51 / 132 / 323 / 432 / 536 / 678 are exactly the six largest frame changes (21.6 / 26.0 / 18.4 / 53.1 / 27.4 / 14.9); the largest non-cut change is 12.6 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone), at most two lines.
- Each of these is measured by its own oriented box: the card, the message screen, and the "worse?", "I feel anxious", "anxious" and "amygdala" tags. None is behind caption text, in the right rail, in the bottom zone or past the left margin.
- The performer's head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 8 lines are exact matches on the final file (punctuation aside).
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - the ghost storm swells on "worse" (2.4–3.8 s);
  - the "angry" tag lands at 5.7 s ("putting feelings into words"), and the distress arrow drops from 8.8 s ("lowered reported distress");
  - the naming / reframing / distraction arrows appear at 11.2 / 12.25 / 13.1 s, on their words;
  - the amygdala glow dims from 15.6 s ("less amygdala activity");
  - he lowers the phone on "pause" (19.85 s), and the tag appears at 21.05 s ("I feel anxious");
  - the storm softens over 21.3–25.0 s ("a little softer").
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all six cuts);
- frame 0 and the payoff beats at full size;
- the thumbnail;
- full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–4.4 s) | Frame 0 is the thumbnail composition and the question; then a translucent ghost storm swells: "worse?". |
| Proof (4.4–17.85 s) | Dark card: an upsetting-image icon gets a word tag, and distress goes down. From a low angle, naming / reframing / distraction show similar drops (direction only). A translucent brain: the amygdala glow dims when "anxious" appears. |
| Payoff (17.85–26.3 s) | He lowers the phone, hand to chest; a gold "I feel anxious" tag. The storm stays but becomes smaller, rounder and lilac. |
| CTA | Lock-up above the softened storm. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad; a soft chime, a low swell that eases, ticks and a tap. |
| Claims | "Many people expect…" (participants' predictions), "In studies… lowered reported distress", "about as well as reframing or distraction", "less amygdala activity", "The feeling stays, but often a little softer". No cure promise. Sources are in `notes/publishing-copy.md` and `context/30`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The evidence is lab studies with pictures; the tense-message moment is an application, not something tested. The card arrows show direction only.
- The card shows as a translucent grey panel for about 0.25 s as it fades in at the start of S3 (4.4–4.65 s).
- In the final wide shot the "I feel anxious" tag overlaps the message bubble's left edge; the message stays mostly legible.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
