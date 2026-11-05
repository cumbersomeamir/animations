# QA: mello-30s-feedback05-01.mp4 (Hindi)

File: `videos/mello/production/30s/2026-11-05-feedback-05/mello-30s-feedback05-01.mp4`, sha256 `856948f5a6dccae982dc33d78ef40049f0b8df1665ee31eb06e46f4d979fb1cd`, 9,367,783 bytes.

It was rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). This is render 2 of 2: render 1 was replaced after one text-overlap fix (see `notes/production-notes.md`, item 7). Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.1 LUFS integrated, −1.6 dBTP true peak | `qa-report.json` |
| Voice vs music | voice stem −15.9 LUFS, bed −28.8 LUFS (**12.9 dB under**, music kept quiet beneath speech); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.078, at 17–18 s in S4); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 116 / 359 / 479 / 773 are the detected cuts (36.2 / 44.0 / 38.4 / 27.1). The largest non-cut change is 16.1, at 12.57 s, where the notebook cover sweeps open. | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| Hindi intelligibility | faster-whisper **large-v3-turbo, language hi**, per line, on the final MP4: **CER 0.012, WER 0.027** | `asr.json` |
| CTA | "मेलो के साथ एक माइंडफुल ब्रेक लीजिए।" 26.30–28.74 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details (the audit is stricter than in earlier episodes):
- Caption text stays inside y 342–518 and x 90–990, with at most two lines. The top 300 px are clear.
- In-scene text (clock notes, thought card, log note, calendar card) is measured by its oriented on-screen box. None of it is in the caption band, the right rail (x > 930, y 900–1700), the bottom zone (y > 1560) or the left 60 px.
- No performer head and no clock dial is behind caption text in any sample.

## Hindi audio and text
- **Voice:** Kokoro-82M **hf_beta**, a Hindi-trained voice (lang "hi"), speed 1.05. Same verified voice as hindi03/hindi04; no English TTS, no cloning, no celebrity imitation.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). A native Hindi speaker should give it a listen.
- **Per-line ASR on the final file:**
  - **Exact matches (CER 0):** hook, name, real, fix, example and log.
    - Whisper writes the spoken numbers as digits (दस → 10, पचपन → 55), which the check treats as equivalent.
    - Whisper writes "planning fallacy" and "perfect" in Latin, so the loanwords are recognisable.
  - **CTA (CER 0.103):** मेलों/मेलो and माइनफुल/माइंडफुल, the same known variants as earlier episodes.
- **Speech/caption alignment:** every caption segment is driven by the measured line starts and the longest internal pause of each line in `project/generated/timeline.json`. Each caption appears just before its words and clears before the next line.
- **Glyphs:** I checked full-resolution frames (`frames/beat_*.jpg`). Captions and in-scene text render correctly: conjuncts (प्लानिंग, ब्रेक, परफ़ेक्ट, रिपोर्ट), nukta (फ़ैलेसी, परफ़ेक्ट, अंदाज़े, फ़ोन, सफ़ाई), chandrabindu (ढूँढना), anusvara (घंटा, ढूँढना) and danda. There are no missing squares.
- **Numbers:** spoken as words (दस, एक घंटा, पचपन). In-scene text shows "10 मिनट", "1 घंटा", "55 मिनट". The 55 and 58 minute values are example values in the demonstration, not data.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- Full resolution: frame 0, the hour completing (3.40 s), the full actual row (11.63 s), the time-log record (14.85 s, before and after the fix) and the logged time (24.64 s).

| Criterion | Assessment |
|---|---|
| Immediate hook (first 1–2 s) | Frame 0 already shows the quote caption "“बस दस मिनट का काम है…”", the "10 मिनट" note and the clock hand moving. By 0.8 s the lavender 10-minute wedge is full, and the warm overrun keeps growing until the hour completes at 2.9 s. |
| Relatable scene | A desk task (a sheet being written) that was meant to take ten minutes takes the full hour. |
| Imagined vs actual | The S2 card shows "सोचा" as a short, clean lavender bar (10 मिनट) and "असल" growing through फ़ोन / चाय / ढूँढना to "1 घंटा". In the room the phone buzzes and is tapped, the mug is lifted, and the head turns to search. |
| Past record, not a perfect future | S3 opens the time log ("असली समय") and highlights the similar past task, "रिपोर्ट 55 मिनट". The note "पिछली बार: 55 मिनट" appears on the cover. |
| One concrete planning action | S4: the dashed guess "10 मिनट?" fades and a full 6:00–7:00 block, "1 घंटा", is booked while the pencil writes. After the work, "असल: 58 मिनट ✓" is written in. |
| Distinct shots | S1 high over the right shoulder, S2 rear-left medium, S3 steep right three-quarter onto the log, S4 rear-right medium with the calendar, S5 wide room (accepted staging). |
| Claims | No guarantee of accuracy or productivity, no statistics spoken. Sources are in the publishing copy and `context/15`. |
| Style retained | Same room, purple performer, lavender/ivory palette, caption treatment, lock-up and CTA meaning as the accepted episodes. |

## Known limitations
- ASR-only Hindi check; nobody has listened by ear. Kokoro's Hindi voice is a small model, so a few words may sound slightly synthetic ("माइंडफुल" is heard as "माइनफुल").
- Secondary in-scene text is small, about 30 px on screen: the S2 chip labels (फ़ोन, चाय, ढूँढना) and the calendar times (6:00/6:30/7:00). The captions carry the full message.
- The core empirical paper (Buehler, Griffin & Ross, 1994) could not be opened here, so no study numbers are used. The spoken claims rest on Buehler (2019, read in full) and Roy et al. (2005, abstract).
