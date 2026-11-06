# QA: mello-30s-english07-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-06-english-07/mello-30s-english07-01.mp4`, sha256 `e697e31e41f97619bc8a730397148be5ee08c9f43767c98c98e8586e50703dee`, 8,304,672 bytes.

It was rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). This is render 2 of 2: render 1 had a 2-frame phone jump before the S3→S4 cut and was replaced (see `notes/production-notes.md`, item 9). Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.1 LUFS integrated, −1.7 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.7 LUFS, bed −29.0 LUFS (**13.3 dB under**, music kept quiet beneath speech); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.071, at 4–5 s while the card title holds); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 104 / 473 / 575 / 773 are exactly the detected cuts (38.0 / 38.9 / 34.8 / 17.2); the largest non-cut change is 3.2 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, with at most two lines. The top 300 px are clear.
- Each crucial in-scene text object (the bundle/chart card, the status card, the phone screen) is measured by its own oriented on-screen box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head (projected sphere) is never behind caption text, including when standing and walking.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0 with a 0.7 × af_bella + 0.3 × am_puck style blend, en-us, speed 0.98. It was synthesized fresh; no Hindi audio was reused, no cloning, no celebrity imitation.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). Someone should give it a listen.
- **ASR result:** all 7 lines are exact matches on the final file. Whisper writes "Mello" correctly and "page-turner" with the hyphen.
- **Speech/caption alignment:** caption segments are driven by the measured line starts and pauses (`project/generated/timeline.json`) and measured word starts. For example, "a show, / a playlist, / a podcast." appear word by word at 17.0 / 17.4 / 17.9 s, the same moments the phone tiles light up.
- **Typography:** Instrument Serif captions with the lavender highlighter (accepted English treatment); Inter in the stylised phone UI. The padlock, play icon and check mark are drawn, so they don't depend on a fallback font.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut. Frames 571–575 were also checked around the S3→S4 cut after the render 1 fix.
- Full resolution during the iterations: the phone lock, the bundle card, the chart labels, the pick screen, the standing / headphones / lace-up frames and the CTA.

| Criterion | Assessment |
|---|---|
| Immediate hook (first 1–2 s) | Frame 0 shows "New rule:" over the podcast player. The navy padlock drops onto Play at 0.35 s and the "walks only" tag appears by 1.2 s, while "this podcast only plays on walks" is spoken. |
| Concept shown | The card builds "temptation bundling", then "want: podcast" + "putting off: a walk", joined "only together". |
| Evidence, honestly | The card turns into a schematic chart: the "audiobooks only at the gym" line is above the comparison group ("more often") and converges ("the boost faded"). No numbers are shown. |
| Concrete demonstration | Pick one treat (Show / Playlist / Podcast ✓ on the phone). The rule is acted out: the performer stands, steps into the walking shoes, the status flips "walks only" → "now playing", headphones go on, and the performer laces up and walks. |
| Distinct shots | S1 over the shoulder onto the phone, S2 rear-left medium with the card, S3 close onto the phone in the hand, S4 front-right wide for the standing figure, S5 wide room with the walk (accepted staging). |
| Claims | The authors' definition and one study sentence with its qualification. No promise of habit change, no percentages, no app feature. Sources are in the publishing copy and `context/17`. |
| Style retained | Same room, slate performer, lavender/ivory palette, English caption treatment, lock-up and CTA as english06-01. |

## Known limitations
- ASR-only check; nobody has listened by ear. Kokoro says "Mello" like "mellow", as in the accepted English episodes.
- The walk is a simple procedural gait; the feet slide a little as it starts.
- The S4 status card text is small (about 30 px). The captions carry the full message.
- The schematic chart shows direction only. The study reported 51% / 29% more visits initially, declining over time; those numbers are in the notes, not in the video.
