# QA: mello-30s-round02-01.mp4

File: `videos/mello/production/30s/2026-11-03-round-02/mello-30s-round02-01.mp4`, sha256 `8d3c94bd3d8e58e7a6adaf98f6ac250423b86c1d2c15af5b6c1c461f9b67d0d4`, 9,327,019 bytes.

It was rendered from scratch in this session with `project/build.sh`, using the accepted feedback-01 renderer and style. Earlier MP4s (`output/mello-30s.mp4`, `2026-11-02-feedback-round/mello-30s-feedback-01.mp4`) are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.6 dBTP true peak | `qa-report.json` |
| Voice vs bed | voice stem −15.5 LUFS, music + SFX bed −28.0 LUFS (12.5 dB under); music ducks −8 dB under the voice | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.051, at the final hold); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | the planned cuts (frames 92, 239, 383, 618) are the four largest frame changes (19.8 / 24.4 / 45.1 / 25.5); the largest camera-move change is 14.8 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames (every 3rd), **0 issues** | `layout.json` |
| Intelligibility | faster-whisper base.en recovered **69 / 69** script words in order | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

What the safe-zone audit covers:
- Caption text stays inside the band: y 340–520, x 94–986. At most two lines.
- Nothing sits above y 300.
- The numbered tabs stay inside x 159–805, y 922–1476. They are clear of the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) and the left margin.
- The desk clock never sits behind caption text.

A separate check found the performer's head behind caption text in **0** sampled frames.

ASR timing note: faster-whisper 1.1.1 word alignment fails on a one-word take, so `asr.json` uses segment-level timestamps. The placement in `project/generated/timeline.json` is sample-exact.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- `frames/beat_*.jpg`: 13 beats, from frame 0 through chips settled, lamp, all three seen things, clock tick, breath, feet press, crane mid, back to the present, "one", writing, CTA and the last frame.

| Criterion | Assessment |
|---|---|
| Strong hook | At frame 0 the caption "Mind racing?" is already on screen and three navy thought chips are racing around the performer's head (head in hands). |
| Mechanism moves with the narration | "A lamp. / A mug. / Your notebook.": a ring and tab 1/2/3 pop on each word while the head turns to it. "A clock ticking.": the second hand jumps and rings pulse on each audible tick. "Your own breath.": the shoulders rise and fall and a ring expands around the chest. "Your feet on the floor.": the feet lift and press, with a floor ring and tab 1. "Three. Two. One.": the ring groups pulse in turn. "Then return…": the notebook opens and the performer writes. |
| Distinct shots | S1 rear 3/4 medium (accepted framing), S2 over the shoulder at the desk, S3 rear-left with the desk clock, S4 low under-desk angle on the feet with a push-in, then a 4 s crane, S5 wide room (accepted staging). |
| Takeaway | Three things you see, two sounds, one sensation, then back to the task. The countdown shows it again. |
| Qualification | Once, in the relevant sentence: "It won't solve what's worrying you, but…". The chip pile stays visible on the desk during that line. |
| Text legibility | Captions are Instrument Serif at 96–118 px with the accepted treatment. Observed and accepted: around 17.0 s, mid-crane, the thin white lamp stem sweeps behind the first qualification caption for about 0.5 s; the text stays readable. |
| Style retained | Same room, performer, lavender/ivory palette, typography, caption treatment, lock-up and CTA as feedback-01. Lavender is used only for highlights. |
| Claims | No cure, treatment, statistic, testimonial or app-feature claim. Sources are in `context/12-episode-grounding-break.md` and `../notes/publishing-copy.md`. |

## Issues found and fixed during this round
See `../notes/production-notes.md` → Fix log. Three full renders were made:
- **Render 1:** the S4 hold was nearly static.
- **Render 2:** the crane was whip-fast (peak frame change 25.8).
- **Render 3:** final. Its crane peaks at 14.8.

## Known limitations
- "Mello" is pronounced like "mellow" (as in the accepted episodes).
- The audio was verified with measurements, a spectrogram and ASR, not by a human listener.
