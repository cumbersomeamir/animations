# QA: mello-30s-english12-01.mp4 (English) + thumbnail

Files:
- **Video:** `videos/mello/production/30s/2026-11-11-english-12/mello-30s-english12-01.mp4`, sha256 `4922cce1f6db0ff9deed422eda335d6abe610ebf85881ccf182a0ddd794cff5c`, 8,133,150 bytes.
- **Thumbnail:** `videos/mello/production/30s/2026-11-11-english-12/mello-30s-english12-01-thumbnail.png`, 1080x1920 PNG, sha256 `48cc7786bd78a002599b9b41541372f9a9b0eb1e7315eec9fe9ca81d874924d6`. It reads "STILL IN YOUR HEAD?" (four words) over the open loop beside the performer's head.

Rendered from scratch in this session with the approved renderer (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`; the thumbnail comes from `project/thumbnail.mjs`). One full render. Earlier MP4s are untouched. This is the first episode under the 2026-11-11 rules (`context/10` section 8).

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness / clipping | −16.0 LUFS integrated, −1.5 dBTP true peak (no clipping; soft-knee limiter) | `qa-report.json` |
| Voice vs soothing bed | voice stem −15.7 LUFS, bed (pad + evening ambience + SFX) −28.8 LUFS (**13.1 dB under**); the bed ducks −8 dB under speech | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.12, at 14–15 s while the card holds); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 92 / 210 / 314 / 566 are exactly the detected cuts (39.2 / 43.0 / 22.7 / 24.8); the largest non-cut change is 10.5 (S4's move from the card to the performer) | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| English intelligibility | faster-whisper **large-v3-turbo, language en**, per line, on the final MP4: **CER 0.000, WER 0.000** ("9" mapped to "nine") | `asr.json` |
| CTA | "Take a mindful break with Mello." 26.80–28.52 s (inside 27–30 s pacing, in the final 3.2 s of speech); lock-up from 26.5 s | `narration-timing.md` |

Safe-zone details (2026-11-11 rules):
- Caption text stays inside **x 100–900** and y 340–520 (inside the allowed y 230–1500), at most two lines. The top 300 px are clear.
- The card and the note card are each measured by their own oriented box. Neither is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- The performer's head is never behind caption text.
- Captions and on-screen labels are never paragraphs. Each card shows one idea at a time ("intrusions" with "plan", then "falling asleep" with "to-do list" / "done list"). The note shows two short lines.

## English audio and text
- **Voice:** the established narrator, Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, synthesized fresh. No Hindi.
- **Listening:** I can't listen to audio. I did **not** do a listen-through. The checks are an ASR round-trip per line, loudness, true peak and stem levels. Someone should give it a listen, including whether the evening bed sounds soothing.
- **ASR result:** all 8 lines are exact matches on the final file.
- **Speech/caption alignment:** caption segments follow measured line starts, pauses (`project/generated/timeline.json`) and word starts. For example, "follow you into bed?" appears at 1.66 s, "kept intruding" at 4.96 s, "fell asleep faster" at 13.1 s and "tomorrow at nine." at 23.3 s. The note writes "Email Sam" during "jot down the next step" and "tomorrow, 9:00" during "when you'll do it". The loop lands on "9:00" as "nine" is spoken.
- **Missing assets:** fonts load (`window.__fontCheck`), the real icon is in the lock-up, and every scene object rendered in the reviewed frames.

## Visual review (frames I looked at)
I looked at `contact-sheet.jpg` (one frame per second), `transitions.jpg` (both sides of every cut), the 15 beat frames in `frames/`, the thumbnail, and full-resolution stills during the iterations.

| Criterion | Assessment |
|---|---|
| Hook (0–3 s) | Frame 0: the performer on the bed edge, lamp on, an open violet loop with a gold spark circling his head. Caption: the question. |
| Escalation (3–7 s) | He reads; the loop cuts between his eyes and the page three times. |
| Proof (7–18.8 s) | Dark in-app-style card, one idea at a time. "intrusions": blips stream, a note lands ("plan"), the line goes quiet. Then "falling asleep": "to-do list" bar (short, violet), then "done list" bar (longer, grey). The card fades on "Not a cure" and the loop drifts to hang by the lamp. |
| Payoff (18.8–26 s) | The note card writes "NEXT STEP / Email Sam / tomorrow, 9:00" in sync with the pencil. The loop flies onto "9:00" and closes (parked). The note drops into the notebook, which closes with the ring on its cover. The lamp dims. |
| CTA (26.8–28.5 s) | Calm room, lock-up (real icon, "Mello", "On Google Play"). |
| Palette | Store-sampled colours: pale lavender stage (rendered #EAE4F4 vs store #EDE8FE), ink #191632, violet #633BFE, lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357. |
| Depth / lighting / transitions | Five distinct shots: front-right, front-left close, front-right card, front-left card moving down to the performer, front-right writing then a pull back. The lamp dims at the resolution. No decorative lines. |
| Claims | Two study findings stated as study results; "Not a cure" keeps the scope; no numbers on screen. Sources are in `notes/publishing-copy.md` and `context/22`. |

## Known limitations
- No listen-through: the audio is checked by ASR and measurements only.
- For about 0.3 s as the dark card fades in and out (around 7.0 s and 16.5 s) it reads as a translucent grey panel.
- The rendered stage is slightly darker and less blue than the store background (#EAE4F4 vs #EDE8FE).
- The video-review folder on the user's computer is not reachable from this cloud session. The MP4 and thumbnail are delivered as chat attachments and on the branch.
