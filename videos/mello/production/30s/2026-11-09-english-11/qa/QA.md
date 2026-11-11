# QA: mello-30s-english11-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-09-english-11/mello-30s-english11-01.mp4`, sha256 `5aae62b321037a83dbcedd67b48bfdbfdfd03081a7d8a3c3aab2e88a41d99808`, 6,967,612 bytes.

Rendered from scratch in this session with the accepted renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`).

This is render 2 of 2. Render 1 failed `moving_every_second`: seconds 27–30 were almost static after the closing camera move. A slow camera drift was added under the lock-up and the video was fully re-rendered (see `notes/production-notes.md`, item 8). Render 1's outputs are not in the repo. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.6 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.6 LUFS, bed −29.1 LUFS (**13.5 dB under**); music ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.098, at 7–8 s and again at 27–28 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 108 / 263 / 519 / 609 are exactly the detected cuts (28.8 / 22.2 / 29.9 / 25.7); the largest non-cut change is 6.0 (the opening pull-back) | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** ("metre"/"meter" normalised) | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, at most two lines. The top 300 px are clear.
- The card and the labels "across the room", "charging" and "the easy reach" are each measured by their own oriented box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head is never behind caption text.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi audio reused.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements). Someone should give it a listen.
- **ASR result:** all 7 lines are exact matches on the final file.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses (`project/generated/timeline.json`) and word starts. For example, "farther away" appears at 6.12 s, "across the room," at 18.68 s and "where it used to be." at 20.38 s.

## Visual review (frames I looked at)
I looked at `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| First second intriguing | Frame 0: the phone is lit on the nightstand right by the performer, notification chips are rising off it, and his hand is moving toward it. |
| Phone beside the bed vs across the room | S1 reveals the book "across the room" on the desk. S4 shows the phone set on a charging pad on that desk ("charging"). S5's wide shot shows it charging in the foreground while he reads on the bed. |
| Book where the phone was | S5 opens with the same framing as S1. A dashed outline marks the phone's old spot, and the book lands in it ("the easy reach"). |
| Evidence | S2: a snack bowl slides from "20 cm" to "70 cm", then "fewer people ate any". S3: "what changed?" with both bowls equally noticeable, then "more effort", then "friction" as the phone and book trade places ("easy" / "harder"). |
| Distinct shots | S1 front-right, revealing the desk; S2 front-right card; S3 front-left card; S4 the desk; S5 nightstand bookend pulling back to the room. |
| Claims | The snack study (Maas et al. 2012) as measured; the phone tip as an application; one short scope line. No fixed seconds or steps. Sources are in `notes/publishing-copy.md` and `context/21`. |
| Style retained | Same room, slate performer, lavender/ivory palette, caption treatment, lock-up and CTA as english06–10, with a bed and nightstand added. |

## Known limitations
- ASR-only check; nobody has listened by ear.
- "across the room" is fully visible for about 0.7 s, during the opening pull-back; the reveal and the caption carry the line.
- Card labels such as "you" and "20 cm" are small (about 30 px). The large words are the titles and pills.
