# QA: mello-30s-english08-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-07-english-08/mello-30s-english08-01.mp4`, sha256 `e9beb123d8173e4a450e572d2fad000b30e50a2a069aed7a32ec687e4ada30a3`, 10,108,170 bytes.

It was rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). This is render 2 of 2: render 1 typed the S3 speech bubble too late to read and was replaced (see `notes/production-notes.md`, item 7).

The container restarted after render 2 had finished and been muxed (900 frames, full decode clean). Only the audit / ASR / QA steps were re-run on that file. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.6 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.6 LUFS, bed −28.7 LUFS (**13.1 dB under**, music kept quiet beneath speech); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.073, at 13–14 s while the card holds the name); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 78 / 429 / 528 / 773 are exactly the detected cuts (41.4 / 35.5 / 41.1 / 28.5); the largest non-cut change is 4.3 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, with at most two lines. The top 300 px are clear.
- Each crucial in-scene text object (the confidence card, the speech bubble, "stuck here → learn next", "Y-shaped channel") is measured by its own oriented on-screen box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- Neither the performer's head (projected sphere) nor the zipper's footprint is behind caption text in any sample.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0 with a 0.7 × af_bella + 0.3 × am_puck style blend, en-us, speed 0.98. It was synthesized fresh; no Hindi audio was reused, no cloning, no celebrity imitation.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). Someone should give it a listen.
- **ASR result:** all 8 lines are exact matches on the final file, including "illusion of explanatory depth" and "Y-shaped channel". Whisper writes "Mello" correctly.
- **Speech/caption alignment:** caption segments are driven by the measured line starts and pauses (`project/generated/timeline.json`) and measured word starts. Examples: "lower" appears with the spoken word (9.1 s), "is what to learn next." at 18.7 s.
- **Typography:** Instrument Serif captions with the lavender highlighter (accepted English treatment). Card and label text is set in Instrument Serif and Inter.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- Frames 465 / 490 / 515 for the fixed speech bubble.
- Full-resolution stills during the iterations: the zipper hook, the confidence card states, the X-ray slider and the CTA.

| Criterion | Assessment |
|---|---|
| First second intriguing | Frame 0 shows a big brass zipper, half open, under "Quick:". It zips itself shut by 1.95 s, the teeth fanning ahead of the slider and meshing behind it. |
| Confidence before vs after | The card's rating climbs to 6 on "feel sure". The step-by-step attempt stalls at "2. The teeth… lock, somehow?" with a "?". On "lower" the rating drops to 3, with "before" left as a ghost at 6 and the knob labelled "after explaining". |
| Practical trick | S3: the performer explains out loud with a gesture; the bubble types "“So the teeth… um…”" and the head tilts (stuck). |
| Concrete payoff | S4: the slider is ringed ("stuck here → learn next"), then turns see-through to reveal the lavender Y-shaped channel ("Y-shaped channel") as the teeth converge through it and interlock. |
| Distinct shots | S1 high over the zipper, S2 rear-left medium with the card, S3 front-right three-quarter, S4 close X-ray onto the zipper, S5 wide room (accepted staging). |
| Claims | The direction of the effect, the authors' term and the documented slider mechanism (Sundback 1917). No numbers, no guarantees, no app feature. Sources are in the publishing copy and `context/18`. |
| Style retained | Same room, slate performer, lavender/ivory palette, English caption treatment, lock-up and CTA as english06/07. |

## Known limitations
- ASR-only check; nobody has listened by ear. Kokoro says "Mello" like "mellow", as in the accepted English episodes.
- The zipper is a stylised diagram: the teeth interlock as staggered blocks, not modelled hooks and recesses.
- The 6 → 3 rating on the card illustrates the direction of the effect, not a reported mean.
