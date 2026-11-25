# QA: mello-30s-english24-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-23-english-24/mello-30s-english24-01.mp4`, sha256 `15d5a3f957408b4d0e531557716e533a129c4da0523035bbd0f7ef9f0eba8d77`, 9,485,107 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-23-english-24/mello-30s-english24-01-thumbnail.png`, 1080x1920 PNG, sha256 `1a48b7b779d8c707f25fa83db5ce7042dba9886f04c70822e5e7a8b8aa2855d7`. It reads "STILL REREADING / YOUR NOTES?" (4 words) above the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

Resumed work (2026-11-25): the batch24 sources were checkpointed in commits `c2e24f5` and `da3a5a3` before rendering. No earlier english24 render existed, locally or on the remote branch.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) is front-on: the approved performer rereads an open notebook (gold highlighter on the lines) while lilac lines lift off the pages and drift away, fading. A low bookcase is behind him.
- The caption "Still rereading / your notes?" (4 words) is fully visible at frame 0 at 100 px, inside y 280–460.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 17 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.1 LUFS integrated, −1.4 dBTP true peak on the AAC file (mix −1.5 dBTP; no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.3 LUFS, bed (pad + felt piano + soothing air + SFX) −28.4 LUFS (**13.1 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.048, at 8–9 s on the card); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 50 / 138 / 272 / 428 / 608 / 738 are exactly the six largest frame changes (35.6 / 41.6 / 18.5 / 67.9 / 36.7 / 25.2) | `qa-report.json`, `transitions.jpg` |
| No jump between cuts | the largest non-cut change is 12.6 (frame 141, the card fading in), below the softest cut (18.5) | `qa-report.json` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details (`context/10` section 10):
- Caption text stays inside **x 100–900, y 280–460** in all 300 samples, at most two lines.
- The study card and the recall card are measured by their own oriented boxes. None is behind caption text, in the right rail (x > 936, y 900–1700), in the bottom zone (y > 1560) or past the left margin (x < 60).
- His head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak, stem levels and the spectrogram (`audio.png`). Someone should give it a listen, including:
  - whether the bed sounds soothing;
  - whether the hook sounds like a question (ASR punctuates it "Still rereading your notes." with a full stop).
- **ASR result:** all 7 lines are exact matches on the final file (punctuation aside). "Re-reading" with a hyphen counts as the same word; see `src/asr_check.py`.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - the pages glow on "feels like learning" (2.0 s), and the lines drift off faster on "will it stick" (3.35 s);
  - "reread" on its word (6.5 s) and "tried recalling" on its word (7.75 s);
  - the 5-minute bars appear on "five minutes later" (9.3 s), and rereading pulls ahead on "looked better" (10.45 s);
  - the 1-week bars appear on "a week later" (11.7 s), and recall pulls ahead on "recalling did better" (12.85 s);
  - the lilac strips stream in on "felt more certain" (14.55 s), then fade as the gold strips brighten on "recall lasted" (16.15 s);
  - the notebook claps shut on "close your notes" (20.75–21.05 s), and he writes on "write what you remember" (21.75–22.75 s);
  - he peeks on "check" (23.1 s), and the gap fills at 23.65 s ("what you missed").
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
- **Final MP4:**
  - `contact-sheet.jpg` and `transitions.jpg`;
  - a payoff strip at 20.4–24.5 s (every 10th frame);
  - full-resolution crops at 21.7 / 22.1 / 22.4 s (checking a suspected bar artefact, which was the bookcase top at the crop edge — no defect);
  - frames 22.0–22.13 s;
  - frame 0 and the thumbnail side by side.
- **During the iterations:** about 50 stills (mostly montages; frame 0, S6's peek and the post-cut frames larger), plus three 300-sample audit runs (2 → 2 → 0 issues).

| Criterion | Assessment |
|---|---|
| Hook (0–4.6 s) | Frame 0 is the thumbnail composition and the hook words. Close over the pages: they glow (familiar), then the lines drift off and fade; "But will it stick?" |
| Proof (4.6–20.25 s) | Dark card "ONE STUDY": reread vs tried recalling. From a low angle, "REMEMBERED LATER": at 5 minutes rereading is ahead; at 1 week recall is ahead (direction only). Side view: lilac (reread) strips bright, then fading; gold (recalled) strips last. |
| Payoff (20.25–26.3 s) | He closes the notebook, writes what he remembers on a gold card, peeks at the notes, and the missed line fills the card's gap. |
| CTA | The finished card on the closed notebook; lock-up. |
| Palette / sound | Store-sampled palette (`context/22`): violet notebook, gold highlighter and card, lilac strips, the dark UI card. A soothing air bed under the pad and felt piano; gentle page, pencil and clap sounds. |
| Claims | "In one study… Five minutes later, rereading looked better. A week later, recalling did better" and "Rereading felt more certain, but recall lasted" (Roediger & Karpicke 2006). "Many studies agree, though not all" (meta-analyses; a 2026 online null result). The routine is advice. No promise, no brain claims. Sources are in `notes/publishing-copy.md` and `context/34`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- Roediger & Karpicke 2006 was read as an abstract (the full text was not openly reachable), so no percentages are shown or spoken; the bars show direction only.
- The memory strips, the card lines and the filled gap are illustrations.
- The card shows as a translucent grey panel for about 0.25 s as it fades in at the start of S3 (4.6–4.85 s).
- The plant placed for foreground depth stays out of shot in most shots.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
