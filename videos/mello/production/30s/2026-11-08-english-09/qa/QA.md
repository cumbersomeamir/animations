# QA: mello-30s-english09-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-08-english-09/mello-30s-english09-01.mp4`, sha256 `422778a388074bc2042d59466b2a5426079ce5e1eba9a34e60e19c86c6541156`, 8,667,788 bytes.

Rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). One full render. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.5 dBTP true peak (file), −1.6 dBTP (mix) | `qa-report.json` |
| Voice vs music | voice stem −15.7 LUFS, bed −29.4 LUFS (**13.7 dB under**); music ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.089, at 16–17 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 95 / 254 / 554 / 773 are exactly the detected cuts (30.3 / 30.2 / 24.5 / 21.8); the largest non-cut change is 9.8 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, at most two lines. The top 300 px are clear.
- The memory card and the laptop's to-do list are each measured by their own oriented on-screen box (the list only in S4 before the lid starts closing). Neither is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head (projected sphere) is never behind caption text or the card.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi audio reused, no cloning, no celebrity imitation.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). Someone should give it a listen.
- **ASR result:** all 7 lines are exact matches on the final file, including "peak-end rule" and "endings carry weight".
- **Speech/caption alignment:** caption segments follow the measured line starts, pauses (`project/generated/timeline.json`) and measured word starts, e.g. "great day out?" at 1.41 s, "less unpleasant." at 13.75 s, "close the laptop." at 23.63 s.

## Visual review (frames I looked at)
- `contact-sheet.jpg` (30 frames, one per second), `transitions.jpg` (both sides of every cut), beat frames 0.00 / 2.95 / 17.52 / 23.42 s at full size, and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| First second intriguing | Frame 0: the "a day out" card is already drawing a low, flat line over a shuffling queue; it rises to a lavender peak star and a good end by 2.9 s. |
| Whole experience vs recalled moments | S2: the whole line dims ("what you remember") while the peak and the end stay lit and get labelled. |
| Evidence | S3: "standard ending" vs "gentler final minutes", each with an "in memory" bar; the gentler one ends shorter on "less unpleasant"; the tail is outlined on "endings carry weight". |
| Practical payoff | S4: the last task "Send the proposal" is checked, "Done for today" appears, a lavender loop closes around the list and the right hand shuts the lid. |
| Distinct shots | S1 card front, S2 rear-left medium, S3 high rear-left, S4 steep right three-quarter onto the laptop, S5 wide room (accepted staging). |
| Claims | Direction of the 1996 and 2003 findings only; no numbers spoken; one short scope line. Sources in `notes/publishing-copy.md` and `context/19`. |
| Style retained | Same room, slate performer, lavender/ivory palette, caption treatment, lock-up and CTA as english06–08. |

## Known limitations
- ASR-only check; nobody has listened by ear.
- The curves and bars are schematic (direction only).
- While the lid closes, the right arm briefly crosses the to-do list; the loop and "Done for today" are visible before that.
