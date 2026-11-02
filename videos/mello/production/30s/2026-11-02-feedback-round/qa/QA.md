# QA: mello-30s-feedback-01.mp4

File: `videos/mello/production/30s/2026-11-02-feedback-round/mello-30s-feedback-01.mp4`, sha256 `e3865266f62d422b9134aa69fd1c96dcd34a43dbf54b652bedd31ea896476f46`, 8,698,698 bytes.

It was rendered from scratch in this session with `project/build.sh`. It is not an imported or older video, and earlier MP4s (`videos/mello/output/mello-30s.mp4`) are untouched.

## Technical checks (all passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920, r_frame_rate = avg_frame_rate = 30/1, 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.1 LUFS integrated, −1.6 dBTP true peak (final MP4) | `qa-report.json` |
| Voice vs bed | voice stem −15.2 LUFS, music + SFX bed −27.2 LUFS (12 dB under); music ducks −8 dB while the voice speaks | `qa-report.json → mix_stats`, `audio.png` |
| Motion | mean absolute frame difference 0.08–2.73 per second; 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | the four largest frame changes fall exactly on the planned cuts (frames 114, 291, 558, 729) | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames (every 3rd), **0 issues** | `layout.json` |
| Intelligibility | faster-whisper base.en recovered 68 of 69 script words in order (98.6 %); see note below | `asr.json` |
| CTA timing | "Take a mindful break with Mello." 26.20–27.92 s; lock-up from 26.0 s to the end | `narration-timing.md` |

The safe-zone audit checks that:
- caption text sits inside y 340–520 and x 90–990, with at most two lines;
- nothing is above y 300;
- the card/frame and notebook stay out of the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) and the left margin.

Measured extremes: caption text spans y 340–520; minimum card x is 100 px; maximum head x in S3 is 903 px.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- `frames/beat_*.jpg`: frame 0, card landed, label typed, card clearing, frame beside, looking back to the task, defusion named, notebook contact, cover open, CTA, last frame.

| Criterion | Assessment |
|---|---|
| Strong opening | Frame 0 already shows the headline "A thought can sound like a fact:" and the navy thought card landing in front of the figure. |
| Mechanism shown as it is narrated | The card blocks the view. The lavender tab types "I'm noticing the thought that…" as the line is spoken. On the repeat of "I'll mess this up." the card clears into a glass frame with readable text and drifts beside the person. The head turns to it on "observing it" and back to the desk on "instead of treating it as a prediction". |
| Distinct shots | S1 rear 3/4 medium, S2 tight over-the-shoulder, S3 wider rear-left, S4 overhead insert, S5 wide calm room with a slow pull-back. |
| Takeaway | "Notice it, then choose one small, useful action." plays over the notebook being placed and opened (contact at 23.09 s). |
| Text legibility | Captions use Instrument Serif at 92–118 px. In-scene thought text is about 60 px cap height in S2 and about 45 px in S3. It is small in the S5 wide shot, where the caption and lock-up carry the message. |
| Obstruction / overlap | One caption at a time, no overlaps. The frame never crosses the caption band: its rise happens after the S2→S3 cut. |
| Metaphor accuracy | The thought is never deleted. It stays visible beside the person until the last frame. |
| Brand | Lavender #D9BCF5 (sampled from the icon) appears only on the thought frame, the tab and the caption highlights. The real icon (sha256 verified) is in the lock-up. |
| Claims | No statistics, guarantees, testimonials, pricing or app features beyond the listing. Sources are in `../notes/publishing-copy.md` and `context/11-episode-thought-is-not-a-fact.md`. |

## Issues found and fixed before this render
See `../notes/production-notes.md` → Fix log (13 items). Highlights:
- The stage rendered gray because of back-facing geometry.
- The first full cut failed the layout audit (31 issues): captions slid 7–13 px below the band, and the notebook started in the bottom zone of S4.
- The S3 thought text was too small.
- Kokoro read "defusion" as "diffusion". The phonemes are now forced to /diːˈfjuːʒən/.

## Known limitations
- ASR spells the word "diffusion". The phoneme string now has the long "dee" (/diːˈfjuːʒən/), but Whisper's base vocabulary prefers the more common word. Nobody has listened to the result yet.
- Kokoro says "Mello" like "mellow". The official pronunciation is not documented.
- Whisper places several line starts 0.1–0.4 s early after silences, a known word-timestamp bias. The placement in `timeline.json` is sample-exact.
- The figure is only seen from behind or above. This is deliberate, because the viewer shares the person's view.
- The audio was verified with measurements, a spectrogram and ASR, not by a human listener.
