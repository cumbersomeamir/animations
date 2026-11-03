# QA: mello-30s-hindi03-01.mp4 (Hindi)

File: `videos/mello/production/30s/2026-11-03-hindi-03/mello-30s-hindi03-01.mp4`, sha256 `010a3d64c0bd8280b5d784cf2cf0b7894d60318cba5b3b51a54599660fb064d6`, 11,018,461 bytes.

It was rendered from scratch in this session with `project/build.sh`, using the accepted renderer and style. Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −1.9 dBTP true peak | `qa-report.json` |
| Voice vs bed | voice stem −16.1 LUFS, bed −28.7 LUFS (12.6 dB under, the accepted balance); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.10, at the final hold); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 98 / 167 / 419 / 656 are the sharpest local changes (46.9 / 41.5 / 30.2 / 18.2); the largest camera-move change is 8.2 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| Hindi intelligibility | faster-whisper **large-v3-turbo, language hi**, per line, on the final MP4: **CER 0.023, WER 0.06** | `asr.json` |
| CTA | "मेलो के साथ एक माइंडफुल ब्रेक लीजिए।" 26.30–28.74 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside y 342–518 and x 184–896, with at most two lines.
- No performer head, room-mate head or halo is behind caption text in any sample.
- Labels stay inside y 625–837. Twice (17.7 s and 21.7 s) a label's box touches x > 990, but only while it is fading out at the edge, almost transparent.

## Hindi audio and text
- **Voice:** Kokoro-82M **hf_beta**, a Hindi-trained voice (lang "hi", espeak-ng Hindi phonemes), speed 1.05. It is not the English af_bella/am_puck blend, and it is not voice cloning. How it was chosen is in `context/13-episode-spotlight-effect-hindi.md`.
- **Per-line ASR on the final file:**
  - **Exact matches (CER 0):**
    - "name" (Whisper writes the loanword as "Spotlight Effect");
    - "real" ("असल में सिर्फ करीब एक चौथाई को याद रहा", with no meaning flip);
    - "why";
    - "qual".
  - **Minor variants:**
    - hook (की/कि);
    - study (अधियन/अध्ययन);
    - ask (किसमे/किसमें);
    - CTA (मेलों/मेलो, माइनफुल/माइंडफुल).
- **Speech/caption alignment:** every caption segment is driven by the measured line starts and internal pauses in `project/generated/timeline.json`. Each caption appears 0.04–0.06 s before its words and clears before the next line.
- **Glyphs:** captions use Tiro Devanagari Hindi (OFL) as a fallback after Instrument Serif. I checked full-resolution frames (`frames/beat_*.jpg`, the CTA crop): conjuncts (व्यस्त, ब्रेक), nukta (फ़ोन, क़रीब), matras, anusvara and danda render correctly, with no missing squares. In-scene labels (पढ़ाई, फ़ोन, लैपटॉप, चाय) and the lock-up line "Google Play पर" render correctly too.
- **Numbers and dates:** spoken as words ("आधे" for about half, "एक-चौथाई" for about a quarter). No currency is used. The year 2000 appears only in the publishing copy.

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- `frames/beat_*.jpg`: 13 beats, plus full-resolution frames at 10.2, 20.9 and 28.5 s.

| Criterion | Assessment |
|---|---|
| Strong hook | The caption "कुछ गिरा," is on screen at frame 0. The hand knocks the mug over (0.16–0.5 s), then the spotlight snaps on and the room dims. |
| Imagined vs actual | **Imagined:** the four room-mates turn lavender with halos, heads up, staring under the spotlight. **Actual:** neutral colour, heads down on reading, phone, laptop and tea. |
| Mechanism moves with narration | "आधे लोग": two of four halos stay bright. "असल में": the lights come back, heads drop, and only one person glances (a quarter). "अपने कामों में": Hindi labels appear. "किसमें व्यस्त हैं?": the performer looks along the table and each label pulses. |
| Distinct shots | S1 rear 3/4 medium (accepted framing), S2 high wide from behind-left, S3 over the right shoulder, S4 dolly along the table with a pull-back, S5 wide room (accepted staging). |
| Takeaway / reframing action | The question "ये लोग असल में किसमें व्यस्त हैं?" while the performer checks each person. Then the mug is set upright and the performer returns to writing. |
| Qualification | Once, in the relevant sentence: "…पर शायद किसी ने उतना ध्यान नहीं दिया।" |
| Style retained | Same room (back wall moved back for the long table), performer, lavender/ivory palette, caption treatment, lock-up and CTA meaning. |
| Claims | Study figures are rounded honestly (46% → about half, 23% → about a quarter). No cure or app-feature claims. Sources are in the publishing copy and `context/13`. |

## Known limitations
- I can't listen to audio. Intelligibility was judged by the Hindi ASR round-trip and a pronunciation review of the espeak-ng phonemes, not by ear. A native Hindi speaker should still give it a listen.
- Kokoro's Hindi voice is a small model, so some words may sound slightly synthetic ("माइंडफुल" is heard as "माइनफुल").
- In the S4 pull-back, the two outer labels (पढ़ाई, चाय) fade out near the frame edges, so only फ़ोन and लैपटॉप stay fully visible there. All four labels show during the dolly.
