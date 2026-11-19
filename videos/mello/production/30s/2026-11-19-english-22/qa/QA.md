# QA: mello-30s-english22-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-19-english-22/mello-30s-english22-01.mp4`, sha256 `7b01d3bfbda895f08dbb53f67dc5e81fd16af8cfac4f3ee818b2f29920a6a8b3`, 8,672,483 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-19-english-22/mello-30s-english22-01-thumbnail.png`, 1080x1920 PNG, sha256 `18439afe4f1559935e642d102bdc92f376f4fbdac2bc08cd702ac36825713294`. It reads "TOO HARD ON / YOURSELF?" (4 words) on the white fill of the frame-0 cloud.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). Earlier episodes' MP4s are untouched.

Render history:
- **Render 1:** passed all 16 automated checks then in use, but frame-by-frame review found visible defects. It was not delivered and is kept out of the repo. The defects were:
  - strobing scribbles at 3.1–3.6 s (a phase jump);
  - the gold arrow blinking out at 10.4–10.8 s;
  - the cloud outline crossing the frame-0 words;
  - scribbles passing in front of the message;
  - a clipped "fine. whatever." bubble;
  - a cut-off cloud sliver in S6 and at the start of S7.
  See `notes/production-notes.md`, fix 4.
- **Render 2 (this file):** all fixed. `qa.py` gained a 17th check, `no_jump_between_cuts`, so a jump like render 1's now fails automatically.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) shows the new character, small, inside her own huge outlined thought, with dark zig-zag scribbles racing around her. This is the brief's "tiny character trapped inside their own oversized thought".
- The caption "Too hard / on yourself?" (4 words) is fully visible at frame 0 at 100 px, inside the y 280–460 band, on the cloud's white fill.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 17 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.0 dBTP true peak on the AAC file (mix −1.5 dBTP; no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.5 LUFS, bed (pad + felt piano + soothing air + SFX) −28.5 LUFS (**13.0 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.027, at 11–12 s on the card); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 47 / 146 / 384 / 483 / 582 / 741 are exactly the six largest frame changes (43.8 / 47.2 / 17.8 / 71.1 / 25.5 / 26.9) | `qa-report.json`, `transitions.jpg` |
| No jump between cuts (new) | the largest non-cut change is 12.6 (frame 148, the card fading in), below the softest cut (17.8). Render 1 had 28.0 at frame 103. | `qa-report.json` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details (batch22 rule, `context/10` section 10):
- Caption text stays inside **x 100–900, y 280–460** in all 300 samples, at most two lines.
- The card and the message screen are measured by their own oriented boxes. None is behind caption text, in the right rail (x > 936, y 900–1700), in the bottom zone (y > 1560) or past the left margin (x < 60).
- Her head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak, stem levels and the spectrogram (`audio.png`). Someone should give it a listen, including:
  - whether the bed sounds soothing;
  - whether the hook sounds like a question. ASR punctuated it as "Too hard on yourself." — the words are exact, but this may hint at a flat intonation.
- **ASR result:** all 7 lines are exact matches on the final file (punctuation aside).
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - "fine. whatever." gets "Read 9:12 PM" at 2.6 s; the scribbles race on "harsh" (3.0–3.7 s);
  - the "kind view" column appears at 7.2 s ("kind, understanding view"); its arrow grows from 10.4 s ("more motivated to make amends");
  - the kind-view bar grows at 15.0 s ("studied longer");
  - the thought softens and shrinks over 16.3–18.3 s ("Kindness led to more effort, not less");
  - the apology is typed over 21.9–23.6 s ("one calm step") and sent at 23.95 s ("a short apology").
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all six cuts);
- the 11 beat frames in `frames/`;
- frame strips:
  - render 1: 2.0–5.0 s (every 6th frame) and 3.2–3.7 s (every frame), plus a per-frame difference trace of 1.4–5.0 s;
  - render 2: 3.0–3.8 s (every 3rd frame) and 10.2–11.4 s (every 3rd frame, the arrow growing), plus a per-frame difference trace of the whole file;
- frame 0 and the thumbnail at full size.

| Criterion | Assessment |
|---|---|
| Hook (0–4.85 s) | Frame 0 is the thumbnail composition and the question. Close: her snippy "fine. whatever." is read, and the dark scribbles orbit faster (smoothly in render 2). |
| Proof (4.85–19.4 s) | Dark card "ONE EXPERIMENT / motivation to make amends": other groups vs kind view (direction only). From a low angle, "AFTER FAILING A TEST / time spent studying for the retest": the kind-view bar grows. Back in the room, the big thought shrinks into a small soft cloud and the scribbles become lilac and gold balls. |
| Payoff (19.4–26.3 s) | Close: she types "Sorry, that came out wrong." and sends it. Wider: calm, the small soft thought above her. |
| CTA | The thought fades (25.4–26.1 s), then the lock-up. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad and felt piano; a low swell for the harsh replay that eases as the thought softens. |
| Claims | "In one experiment… felt more motivated to make amends", "In another, after failing a test, they studied longer", "Kindness led to more effort, not less". The apology is advice. No promise. Sources are in `notes/publishing-copy.md` and `context/32`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only (see above, including the hook intonation).
- The source was read as an abstract only (the full text is closed access); the abstract gives no effect sizes, so the card shows direction only. "Something they regretted" glosses "a recent moral transgression".
- The card shows as a translucent grey panel for about 0.25 s as it fades in at the start of S3 (4.85–5.1 s).
- In S6 she is at the left edge (head and shoulder; her phone partly out of frame). The floating message screen carries the action.
- As the big thought shrinks (16.5–17.5 s), its outline briefly passes behind the caption "Kindness led to more effort,". The text stays readable.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
