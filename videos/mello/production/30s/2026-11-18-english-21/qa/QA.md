# QA: mello-30s-english21-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-18-english-21/mello-30s-english21-01.mp4`, sha256 `9ca227ded90f1a900665a0c31c407131c420591a945179d930e1576bd27ea682`, 7,123,177 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-18-english-21/mello-30s-english21-01-thumbnail.png`, 1080x1920 PNG, sha256 `fe943bdfe2fc8165251cff0f55ea5026ba4faed68d0eeba6712669c8d85765d0`. It reads "KEEP GOOD NEWS QUIET?" over the frame-0 composition.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched.

## First frame (`context/10` section 9)
- Frame 0 (`frames/beat_open_frame0_t00.00.jpg`) is a close shot of the approved performer holding a small glowing gold orb (his good news) by the desk with the closed laptop. His friend (the second rig, gold hair) looks at her phone.
- The caption "Keep good news / to yourself?" (5 words) is fully visible at frame 0 at 132 px.
- No logo intro, no fade from black, no empty set-up. The hook audio starts at 0.15 s.
- The thumbnail is the same composition.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.6 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.5 LUFS, bed (pad + soothing air + felt piano + shimmer SFX) −28.6 LUFS (**13.1 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.067, at 29–30 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 53 / 120 / 327 / 546 / 651 / 765 are exactly the six largest frame changes (25.0 / 22.7 / 58.2 / 21.6 / 27.3 / 14.9); the largest non-cut change is 13.3 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.60–28.32 s; lock-up from 26.3 s | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside **x 100–900** and y 300–1500 (the user's zone). The large opening caption is at y ~310–560; the rest sit in the usual top band, at most two lines.
- The card is measured by its own oriented box. It is never behind caption text, in the right rail, in the bottom zone or past the left margin.
- **Neither** head is behind caption text.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio and did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the bed sounds soothing.
- **ASR result:** all 7 lines are exact matches on the final file (punctuation aside).
- **Speech/caption alignment:** caption segments follow measured line starts, pauses and word starts. For example:
  - the orb lifts toward her on "bigger" (2.0–3.4 s);
  - "shared it" appears at 6.7 s and its gold arrow rises at 7.8 s ("more positive mood");
  - "beyond the good event itself" at 9.3 s;
  - she looks up at 14.9 s and lights up at 15.4 s ("especially when the listener was enthusiastic"), and the orb grows most by 16.8 s;
  - "one small win" from 19.3 s;
  - her own orb grows as he leans in on "real interest" (23.4–24.6 s).
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at:
- `contact-sheet.jpg` (one frame per second);
- `transitions.jpg` (both sides of all six cuts);
- the 10 beat frames in `frames/`;
- the thumbnail at full size;
- stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–4.0 s) | Frame 0 is the thumbnail composition and the question; then the orb lifts toward her and grows a little. |
| Proof (4.0–18.2 s) | The dark card "DIARY STUDIES / daily positive mood": "kept it" vs "shared it" (direction only), then "beyond the good event itself". Back in the scene, he shares and the orb grows a little; she looks up and lights up, and it grows most. |
| Payoff (18.2–25.5 s) | Close from the front: one small win held out. Then the roles swap: she shares hers, he leans in with open hands, and her orb grows. |
| CTA | Both orbs glowing; lock-up. |
| Palette / sound | Store-sampled palette (`context/22`); a soothing air bed under the pad; a shimmer only as orbs grow. |
| Claims | "In diary studies … had" (association), "In experiments … feel more valuable" (causal), "especially when the listener was enthusiastic". No promise. Sources are in `notes/publishing-copy.md` and `context/31`. |

## Known limitations
- No listen-through: audio is checked by ASR and measurements only.
- The diary findings are associations; the orb's size is a metaphor for "perceived value", not a measurement.
- The card shows as a translucent grey panel for about 0.25 s as it fades in at the start of S3 (4.0–4.25 s).
- In S5 the friend is mostly out of frame (only her hand). In S6 he is at the left edge as he leans in.
- Her enthusiastic gesture (both hands up near her head) is stylised; it could read as "wow!".
- The user's video-review folder is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
