# QA: mello-30s-english10-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-09-english-10/mello-30s-english10-01.mp4`, sha256 `2b170188e1cb98343fc0f595157443bdea2c22b197acc8f3902cb7a8be1643a5`, 8,408,770 bytes.

Rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). One full render. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.5 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.8 LUFS, bed −28.8 LUFS (**13.0 dB under**); music ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.060, at 19–20 s while the week strip holds); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 96 / 287 / 528 / 773 are exactly the detected cuts (27.9 / 19.5 / 18.1 / 19.7); the largest non-cut change is 2.4 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** (digits 21/18/254 mapped to words) | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, at most two lines. The top 300 px are clear.
- The main card, the week strip and the "same cue → walk" label are each measured by their own oriented box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head (projected sphere) is never behind caption text.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi audio reused.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements). Someone should give it a listen.
- **ASR result:** all 7 lines are exact matches on the final file, including "near-automatic" and "two hundred fifty-four".
- **Speech/caption alignment:** caption segments follow measured line starts, pauses (`project/generated/timeline.json`) and word starts, e.g. "Not quite." at 2.2 s, "two hundred fifty-four days." at 12.98 s, "after the same cue." at 24.08 s.

## Visual review (frames I looked at)
- `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), and full-resolution stills during the iterations (S2 card, S3 curves, S4 week strip and cue label, S5 walk).

| Criterion | Assessment |
|---|---|
| First second intriguing | Frame 0: a "21 days?" calendar already crossing itself off; all 21 are crossed by 2 s, then "not quite" stamps on and dashed extra rows appear. |
| Concrete demonstration | S2 the study set-up ("same context" → "after breakfast", 84 dots filling); S3 individual curves with "18 days" and "254 (estimated)", "fast at first", "then levels off"; S4 a week with Thursday empty and the line carrying on. |
| Payoff | S4/S5: the work bag goes down (the cue, "same cue → walk"), the performer turns and walks. |
| Distinct shots | S1 card front, S2 rear-left closer, S3 high rear-left, S4 front-right full figure, S5 wide room following the walk. |
| Claims | 18–254 days stated as an estimate; "didn't materially derail it" is the authors' wording; no guaranteed result. Sources in `notes/publishing-copy.md` and `context/20`. |
| Style retained | Same room, slate performer, lavender/ivory palette, caption treatment, lock-up and CTA as english06–09. |

## Known limitations
- ASR-only check; nobody has listened by ear.
- Curves, calendar and week strip are schematic. "e.g. a walk" is an illustrative activity.
- Topic swap: implementation intentions was already covered (hindi04-01); this episode keeps the brief's evening cue.
- Around 17.4–17.6 s the card has faded and the performer has stood up out of frame for about 0.2 s before the cut.
