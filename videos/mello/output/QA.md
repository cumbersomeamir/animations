# QA: mello-30s.mp4

File: `videos/mello/output/mello-30s.mp4` (sha256 `b167aa0356c2fb09795354b472c2cf4a0324e60df99deb7415fed05ad5fc4ada`)
Rendered from scratch in this session with `videos/mello/project/build.sh`. It is not an imported or older video.

## Technical checks (evidence in `output/qa/`)
| Check | Result | Evidence |
|---|---|---|
| Container / codecs | MP4, H.264 High, yuv420p; AAC-LC, 48 kHz stereo, 192 kb/s | `qa/ffprobe.json` |
| Size / rate | 1080x1920, 30/1 fps, 900 frames | `qa/ffprobe.json` (`nb_read_frames` 900) |
| Duration | video 30.000 s, audio 30.000 s, container 30.0 s | `qa/qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `qa/decode.txt` |
| Loudness | integrated −16.0 LUFS, true peak −1.4 dBTP, sample peak 0.847, 0 samples at or above 0 dBFS | `qa/qa-report.json`, `project/generated/audio_stats.json` |
| Silence / dropouts | no second below −50 dBFS RMS | `qa/qa-report.json` |
| Motion (anti-static) | mean absolute frame difference above 0.26 every second; 0 frames with no change | `qa/motion.json` |
| Narration intelligibility | faster-whisper base.en recovered 48/48 script words, in order | `qa/asr.json` |
| Visual sampling | 30-frame contact sheet (one per second) and 25 boundary frames at full resolution | `qa/contact-sheet.jpg`, `qa/boundary-frames.jpg`, `qa/frames/` |
| Audio picture | waveform and log-frequency spectrogram | `qa/audio.png` |

## Review criteria
- **Action continuity:** the same rig, threads and character run across every cut. The paper-to-night change is a single continuous wipe, not a cut. Scene-boundary frames at 1.97/2.03, 7.97/8.03, 20.97/21.23 and 25.37/25.43 match.
- **Clipped text:** captions wrap at 900 px inside 90 px side margins and sit in y 220–420. Chips sit in y 220–520 and end-card text in y 840–1210. Nothing is cut off in any sampled frame.
- **Overlap:** on the first pass, the raised arms hit the ring label (18.0 s), platform C appeared behind his chest (22.5 s), and the character covered his arm and the moon (24.4–25.4 s). All three were fixed (ring moved up, C appears at 23.15 s, character's path lowered) and confirmed in a re-render.
- **Pacing:** the hook moves from frame 0 (a thread is already in flight, the caption is popping in). There is a beat every 0.5–1.5 s, a calm reset at 8.3 s, two 5 s breath cycles, three hops on narration starts and a 4 s end card.
- **Narration sync:** captions follow the measured TTS times in `project/generated/timeline.json`. The full table is in `qa/sync.md`. Feature chips appear on the landing frames 21.45 / 22.98 / 24.36 s, exactly at each VO line start.
- **Audio clipping:** none; a soft-knee limiter touched 247 samples before the ceiling.
- **Feature claims:** only listing wording: guided relaxation, calming exercises, wellness challenges, progress tools. No metrics, outcomes, pricing or endorsements. The breathing ring and phone screen are **stylized illustrations**, not verified app UI.
- **CTA legibility:** "Explore on Google Play" is Nunito Black 52 px, navy on gold (`#1A1535` on `#F7C548`, contrast about 10:1). It is on screen from 26.9 s to 30.0 s. The real app icon (`assets/icon.png`, hash verified) is at 300 px.

## Known limitations
- Kokoro reads "Mello" as "mellow". ASR heard it the same way. The official pronunciation is not documented in context.
- The synthesized score and SFX have not been heard by a person; I checked them with numbers (loudness, peaks) and the spectrogram only.
