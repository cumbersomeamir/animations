# QA: mello-30s-english13-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-13-english-13/mello-30s-english13-01.mp4`, sha256 `c5b4a1294d2ed78c1111c3ecc8aeb5cadfd24475a88552763e609f47f39431cd`, 7,580,324 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-13-english-13/mello-30s-english13-01-thumbnail.png`, 1080x1920 PNG, sha256 `b274953c6ae8220d8cdb239179fe2aea8b1fc1cadd79f138bec756e03692f207`. It reads "DON'T PICTURE THIS." (three words) over the pink elephant on the desk.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.4 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.4 LUFS, bed (pad + soothing air + SFX) −28.7 LUFS (**13.3 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.031, at 19–20 s on "So what actually helps?"); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 77 / 162 / 312 / 549 are exactly the detected cuts (18.7 / 36.7 / 25.4 / 40.0); the largest non-cut change is 10.2 (the elephant popping back) | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.80–28.52 s; lock-up from 26.5 s | `narration-timing.md` |

Safe-zone details (2026-11-11 rules):
- Caption text stays inside **x 100–900** and y 340–520 (inside the allowed y 230–1500), at most two lines. The top 300 px are clear.
- The card, the note card and the labels "checking", "rebound" and "noticed" are each measured by their own oriented box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head is never behind caption text.
- One visual idea per shot; no paragraph cards. The longest on-screen text is "DON'T THINK OF A / white bear" and "ONE JOB / Draft the intro".

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No narration was reused and there is no Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 8 lines are exact matches on the final file.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "a pink elephant." appears at 1.2 s;
  - "kept ringing a bell for it." at 8.45 s, with the bell ringing from 8.5 s;
  - "keeps checking for it." at 12.25 s, with the beam finding the elephant at 12.55 s;
  - "Notice it," at 21.35 s, with the nod and shrink from 21.4 s;
  - "one specific job." at 23.0 s.
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), the 13 beat frames in `frames/`, the thumbnail, and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–2.5 s) | Frame 0: a pink elephant on the desk with the performer pushing it; it slides off the edge. |
| Super hook (2.5–5.4 s) | "Too late": it pops back bigger. He pushes it off the other side and it pops back again. The question is spoken. |
| Proof (5.4–18.3 s) | S3: dark card "DON'T THINK OF A / white bear"; the bell rings and small bells pile up. S4: a lilac "checking" beam sweeps the room and finds the elephant peeking behind the plant (it glows); on "return more" it pops back onto the desk, bigger ("rebound"). |
| Payoff (18.3–26.5 s) | The pushing stops. A nod ("noticed"), and the elephant shrinks into the desk corner and stays. The notebook opens under a warm light and "ONE JOB / Draft the intro" is written in sync with the pencil. |
| CTA | Lock-up over a slow pull back; the small elephant is still in the corner. |
| Palette / sound | Store-sampled palette as in english12; the pink elephant is the brief's. A soothing air bed under the pad. |
| Claims | One study (measured), one theory (labelled), a small repeated effect (meta-analyses), and advice with no promised outcome. Sources are in `notes/publishing-copy.md` and `context/23`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- For about 0.3 s as the dark card fades in and out (around 5.4 s and 10.4 s) it reads as a translucent grey panel.
- In S5 the small noticed elephant sits at the right edge of the frame; it is partly cut until the pull-back.
- The elephant, bell count, beam and rebound size are illustrative.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
