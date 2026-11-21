# QA: mello-30s-english23-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-21-english-23/mello-30s-english23-01.mp4`, sha256 `41b85ca99502eca2e22f8cfd4842cb873d671a909535feeaf4606af29b0960b4`, 6,811,574 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-21-english-23/mello-30s-english23-01-thumbnail.png`, 1080x1920 PNG, sha256 `0fc6a0f09ec3d464d83a818efe7051077bd8527c6c3fc3482b649a7c96ec8f14`. It reads "STOP PUSHING / THE IDEA" (4 words) above the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). Earlier MP4s are untouched.

Render history:
- **Render 1:** passed all 17 automated checks, but in frame review the payoff's watering beat was weak: the spout poked into the leaves and the pale drops were almost invisible. It was not delivered and is kept out of the repo.
- **Render 2 (this file):** the can is held above the leaves, and the drops are larger and blue. See `notes/production-notes.md`, fixes 6–7.
- After render 2, only code comments were edited (pronouns aligned with the approved performer's records); the executable scene code is byte-identical.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) is front and wide:
  - the approved performer forces violet piece A and gold piece B together, tab against tab;
  - on the wall behind him is a large lilac shape with a gold outline: the third shape, the one bigger piece they form once B is turned around.
- The caption "Stop pushing / the idea." (4 words) is fully visible at frame 0 at 100 px, inside y 280–460.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 17 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.5 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.8 LUFS, bed (pad + felt piano + soothing air + SFX) −28.8 LUFS (**13.0 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.063, at 29–30 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 48 / 176 / 338 / 473 / 630 / 699 are exactly the six largest frame changes (22.6 / 23.0 / 18.6 / 65.2 / 32.6 / 33.8) | `qa-report.json`, `transitions.jpg` |
| No jump between cuts | the largest non-cut change is 12.8 (frame 178, the card fading in), below the softest cut (18.6) | `qa-report.json` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details (`context/10` section 10):
- Caption text stays inside **x 100–900, y 280–460** in all 300 samples, at most two lines.
- The card, and both pieces in S1, S2 and S7 (where they are the subject), are measured by their own oriented boxes. None is behind caption text, in the right rail (x > 936, y 900–1700), in the bottom zone (y > 1560) or past the left margin (x < 60).
- In S5–S6 the pieces are background props and are not audited (in S5 their corners sit at the frame's bottom edge).
- His head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak, stem levels and the spectrogram (`audio.png`). Someone should give it a listen, including whether the bed sounds soothing and whether the shove bumps sound gentle.
- **ASR result:** all 7 lines are exact matches on the final file (punctuation aside).
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - the pieces ease apart on "loosen" (2.85 s), and he sets them down on "step away" (3.1–3.6 s);
  - TRY 1 on "listed new uses" (7.4 s), the mug icon on "everyday objects" (8.6 s), "in between ?" (9.9 s) and TRY 2 on "tried again" (10.3 s);
  - the gold bar pulls ahead on "beat" (12.6 s), and the other label builds on "hard task / rest / no break" (13.1 / 14.1 / 14.9 s);
  - the trail draws on "let minds wander" (17.1–18.2 s), then greys with a "?" on "often haven't found" (19.25 s);
  - the note is stuck on "note the problem" (21.4 s), and the water pours on "water a plant" (22.35–23.1 s);
  - he turns back on "come back" (23.45 s); B turns (23.95–24.75 s) and clicks at 25.1 s.
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
- **Render 1:**
  - `contact-sheet.jpg` and `transitions.jpg`;
  - beat frames for the note, watering, turning and click;
  - frame strips: S1–S2 at 1.6–5.8 s (every 12th frame), S7 at 23.3–26.3 s (every 8th), and the watering crop at 22.2–23.2 s (every 5th).
- **Render 2:** `contact-sheet.jpg`, `transitions.jpg`, the watering crop strip (22.2–23.2 s, every 5th frame), frame 0 and the thumbnail side by side.
- **During the iterations:** about 60 stills (mostly viewed as montages; frame 0, S5 and the watering at full size), plus three 300-sample audit runs (134 → 8 → 0 issues).

| Criterion | Assessment |
|---|---|
| Hook (0–5.85 s) | Frame 0 is the thumbnail composition and the hook words. Three-quarter view: rhythmic shoves, the pieces ease apart, he sets them down and steps back; "But what kind of break?" |
| Proof (5.85–21.0 s) | Dark card: TRY 1 (mug, list) → "in between ?" → TRY 2 "same problems". From a low angle, "IMPROVEMENT ON TRY 2": the easy-task bar pulls ahead (direction only). He tosses a ball while a gold dotted trail wanders out, then it greys with a "?" (the limit). |
| Payoff (21.0–26.3 s) | A "?" note on piece A; water visibly pours onto the plant; he comes back, turns piece B around and it clicks in (soft glow at the seam). |
| CTA | A wide shot of the joined pieces; lock-up. |
| Palette / sound | Store-sampled palette (`context/22`): violet and gold pieces, the lilac wall shape with a gold outline, the dark UI card. A soothing air bed under the pad and felt piano; gentle action sounds. |
| Claims | "can loosen" (incubation meta-analysis), "In one study… beat a hard task, rest, or no break" (Baird 2012), "later studies often haven't found that edge" (Murray 2021; Teng & Lien 2022; McDaniel 2025). The step is advice. No promise. Sources are in `notes/publishing-copy.md` and `context/33`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- Baird 2012 was read as an abstract (closed access); its design details come from Teng & Lien 2022. The bars show direction only.
- The ball toss, watering and puzzle are illustrations. The study used the Unusual Uses Task with 0-back / 1-back / rest / no-break conditions.
- The card shows as a translucent grey panel for about 0.25 s as it fades in at the start of S3 (5.85–6.1 s).
- In S5 the frame shows his upper body only, and the pieces' corners sit at the bottom edge.
- The shove "jitter" in S1–S2 is subtle (a few millimetres, about 1.6 per second); the struggle reads mainly from the tabs meeting and the pose.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
