# QA: mello-30s-english06-01.mp4 (English)

File: `videos/mello/production/30s/2026-11-06-english-06/mello-30s-english06-01.mp4`, sha256 `95a6f89abde3649f38945ce0a58d631dc855fd486a1a544d14664884e99e299d`, 9,935,019 bytes.

It was rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`), in one full render after still-frame and audit iterations. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.5 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.5 LUFS, bed −28.5 LUFS (**13.0 dB under**, music kept quiet beneath speech); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.081, at 5–6 s while the inner-critic card holds); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 111 / 459 / 557 / 773 are the detected cuts (26.5 / 30.1 / 23.9 / 23.4); the largest non-cut change is 13.1 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.30–28.02 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside the band y 340–520 and x 90–990, with at most two lines. The top 300 px are clear.
- Each crucial in-scene text object (the card, the performer's laptop screen, the colleague's laptop screen) is measured by its own oriented on-screen box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- Neither the performer's head nor the colleague's head (projected-sphere boxes) is behind caption text in any sample.

## English audio and text
- **Voice:** Mello's accepted English voice, Kokoro-82M v1.0 with a 0.7 × af_bella + 0.3 × am_puck style blend, en-us, speed 0.98. It was synthesized fresh from the cached model; no Hindi audio was reused, no cloning, no celebrity imitation.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). Someone should give it a listen.
- **ASR result:** all 8 lines are exact matches on the final file. Whisper writes "Mello" correctly, and "Still feels huge? Ask:" as "Still feels huge? Ask." (punctuation only).
- **Speech/caption alignment:** caption segments are driven by the measured line starts, the longest internal pause of each line (`project/generated/timeline.json`), and measured word starts. Example: "more kindly than themselves." appears at the spoken "more" (10.10 s). Each caption appears just before its words and clears before the next line.
- **Typography:** Instrument Serif captions with the lavender highlighter (accepted English treatment), Inter for the stylised mail UI. The check marks in the toasts are drawn, so they don't depend on a fallback font.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- Full resolution: frame 0, the mistake spotted (2.80 s), the comparison (11.81 s), the fix sent (18.05 s), the reply sent (24.29 s) and the CTA lock-up (28.50 s).

| Criterion | Assessment |
|---|---|
| Immediate hook (first 1–2 s) | Frame 0 shows "You hit send to the whole team…" over the mail with "Q3_report_OLD.pdf" and the Send button. The click lands at 0.5 s and "Sent to Team (12) ✓" is up by 0.9 s. On "spot the mistake" a warm ring locks onto "OLD" and the performer drops their head into their hands. |
| Office slip-up | The wrong file goes to a 12-person team: a concrete, relatable office mistake. |
| Inner view vs research | The accepted navy thought card reads "“They'll think I'm careless.”". On "But in studies" it turns into two sliders. "Judging someone else" moves toward kinder on "more kindly", and "Judging yourself" moves toward harsher on "than themselves". Then the name pill "the beautiful mess effect" appears. |
| Concrete action | S3: one plain line is typed ("Sorry, wrong file. Here's the right one."), the right file is attached and the fix is sent. |
| Perspective-taking question | S4 switches to a colleague's desk during "If a colleague owned this mistake, what would I think of them?". Their own budget plan is in progress, the correction arrives, they reply "Thanks for flagging!" and go back to their own work. |
| Distinct shots | S1 over the shoulder onto the laptop, S2 rear-left medium with the card, S3 steep three-quarter onto the keyboard, S4 high view onto the colleague's laptop, S5 wide room with both desks (accepted staging). |
| Claims | One study-backed sentence and the authors' term. No anxiety treatment, no effect sizes, no app feature. The sliders are schematic (direction only). Sources are in the publishing copy and `context/16`. |
| Style retained | Same room, slate performer (the colleague is the lighter room-mate figure), lavender/ivory palette, English caption treatment, lock-up and CTA. |

## Known limitations
- ASR-only check; nobody has listened by ear. Kokoro says "Mello" like "mellow", as in the accepted English episodes.
- In S4 the colleague is shown by their laptop and typing hands, not their head. Every framing that showed their head put it, or the performer's background laptop, behind the caption.
- During the quote (4–7 s) the performer's head overlaps the empty bottom-right corner of the navy card. The quote text is not covered.
- The measured self–other difference is modest (4.92 vs 4.65 on a 1–7 scale in the 2022 mistake study). The script says "more kindly", not "much more".
