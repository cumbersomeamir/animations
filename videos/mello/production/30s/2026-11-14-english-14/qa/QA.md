# QA: mello-30s-english14-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-14-english-14/mello-30s-english14-01.mp4`, sha256 `079d0bd63228fb6617ce26a7c4350f02ffd0cda9d8e49e92c9dae7cd4675299f`, 7,531,840 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-14-english-14/mello-30s-english14-01-thumbnail.png`, 1080x1920 PNG, sha256 `ac29ed1ea10a6321de93b6a11ffe8db4aaaa5398b0b2be316ebf4e0d4af292b9`. It reads "EASIER FOR FRIENDS?" (three words) over a loose ring ("a friend's") and a tangled knot ("yours").

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

Topic note: the proposed Zeigarnik / next-action topic overlaps english12-01, so this episode covers Solomon's paradox and self-distancing (`context/24`).

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.5 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.6 LUFS, bed (pad + soothing air + SFX) −29.0 LUFS (**13.4 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.05, at 5–6 s while the card shows the name); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 107 / 372 / 479 / 626 are exactly the detected cuts (38.1 / 23.6 / 36.9 / 26.8); the largest non-cut change is 10.0 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.80–28.52 s; lock-up from 26.5 s | `narration-timing.md` |

Safe-zone details (2026-11-11 rules):
- Caption text stays inside **x 100–900** and y 340–520 (inside the allowed y 230–1500), at most two lines. The top 300 px are clear.
- The card, the bubble, the note card and the knot labels are each measured by their own oriented box. None is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head is never behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 7 lines are exact matches on the final file.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - the friend's knot loosens on "untangle";
  - "Solomon's paradox." appears at 4.6 s with the card title;
  - "your own" bar at 11.3 s;
  - the gap closes on "disappeared" (14.5–15.4 s);
  - "I" becomes "Alex" on "your own name" (16.95 s);
  - "tell a friend?" at 24.2 s.
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), the 12 beat frames in `frames/`, the thumbnail, and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–3.5 s) | Frame 0: two knots float beside the performer ("a friend's", "yours"). By 2 s the friend's knot has loosened into a calm ring; his stays tangled and jittery. |
| Super hook (3.5–6.2 s) | A dark in-app-style card, gold crown, "Solomon's paradox". |
| Proof (6.2–20.9 s) | "wise reasoning" bars appear one at a time (someone else's long, your own short). The camera steps back from the card and the "your own" bar grows to match ("the gap disappeared"). Then a bubble: "Why am I nervous?" → "Why is Alex nervous?"; his clasped hands open. |
| Payoff (20.9–26.5 s) | His knot returns. The note "Alex, / what would you tell a friend?" is written in sync with the pencil, and his knot loosens into a ring, mirroring the hook. |
| CTA | Lock-up over a slow pull back; the calm ring stays beside him. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad. |
| Claims | Study results attributed to the experiments; the authors' term; advice with no promised outcome. Sources are in `notes/publishing-copy.md` and `context/24`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The knot labels "a friend's" / "yours" are small, about 30 px text. The knots and the narration carry the idea, and the thumbnail shows the labels larger.
- For about 0.3 s as the dark card fades in and out (around 3.6 s and 15.9 s) it reads as a translucent grey panel.
- Bars, knots and the bubble are illustrative. "Alex" is an example name.
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
