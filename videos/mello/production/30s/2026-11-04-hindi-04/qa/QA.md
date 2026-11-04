# QA: mello-30s-hindi04-01.mp4 (Hindi)

File: `videos/mello/production/30s/2026-11-04-hindi-04/mello-30s-hindi04-01.mp4`, sha256 `ccd34a3ffa97157753bfa314da4e11b28d63146530bfd6bd00c7249cc7a3709c`, 9,825,880 bytes.

It was rendered from scratch in this session with the accepted renderer and style (`project/render.mjs`, then `src/audio.py` and an ffmpeg mux, as in `project/build.sh`). Earlier MP4s are untouched.

## Technical checks (all 16 passed; evidence in this folder)
| Check | Result | Evidence |
|---|---|---|
| Codecs | H.264 High, yuv420p; AAC-LC 48 kHz stereo | `ffprobe.json` |
| Size / rate / frames | 1080x1920; r_frame_rate = avg_frame_rate = 30/1; 900 frames counted | `ffprobe.json` |
| Duration | video 30.000 s, audio 30.000 s, container 30.000 s | `qa-report.json` |
| Full decode | `ffmpeg -v error -xerror -i … -f null -` returned 0 with empty stderr | `decode.txt` |
| Loudness | −16.0 LUFS integrated, −2.2 dBTP true peak | `qa-report.json` |
| Voice vs bed | voice stem −15.9 LUFS, bed −28.5 LUFS (12.6 dB under, the accepted balance); music ducks −8 dB | `qa-report.json → mix_stats`, `audio.png` |
| Motion | every second moves (minimum mean frame difference 0.088, in the S2 slow push at 11–12 s); 0 frames identical to the previous one | `qa-report.json` |
| Shot cuts | planned cuts at frames 140 / 377 / 498 / 773 are the detected cuts (41.9 / 40.7 / 23.9 / 31.4); the largest non-cut change is 3.9 | `qa-report.json`, `transitions.jpg` |
| Safe zones | 300 sampled frames, **0 issues** | `layout.json` |
| Hindi intelligibility | faster-whisper **large-v3-turbo, language hi**, per line, on the final MP4: **CER 0.033, WER 0.095** | `asr.json` |
| CTA | "मेलो के साथ एक माइंडफुल ब्रेक लीजिए।" 26.30–28.74 s; lock-up from 26.0 s to the end | `narration-timing.md` |

Safe-zone details:
- Caption text stays inside x 101–979 and y 342–518, with at most two lines. The top 300 px are clear.
- No performer head and no in-scene text (intention card, plan card, labels) is behind caption text in any sample.
- In-scene text stays inside x 64–927 and y 531–1187, clear of the bottom UI zone and right rail.

## Hindi audio and text
- **Voice:** Kokoro-82M **hf_beta**, a Hindi-trained voice (lang "hi"), speed 1.05. Same verified voice as hindi03-01; no English TTS, no cloning.
- **Listening:** I can't listen to audio. This is an **ASR-only** check (plus the loudness and mix measurements above). A native Hindi speaker should give it a listen.
- **Per-line ASR on the final file:**
  - **Exact match (CER 0):** "why" (संकेत आते ही, फ़ैसला पहले से तय होता है).
  - **Minor variants, no meaning change:**
    - hook (करूंगी/करूँगी);
    - plan (बनाए/बनाइए); "अगर… तो…" is heard as two words, "अगर तो";
    - example (मिनिट/मिनट; "दस" is heard as a word);
    - mech (संकीत/संकेत);
    - evidence (हालांकी/हालाँकि); the qualification "हर बार नहीं" is heard exactly;
    - CTA (मेलों/मेलो, माइनफुल/माइंडफुल), the same variants as hindi03-01.
- **Speech/caption alignment:** every caption segment is driven by the measured line starts and internal pauses in `project/generated/timeline.json`. Each caption appears just before its words and clears before the next line.
- **Glyphs:** I checked full-resolution frames (`frames/beat_*.jpg`). Captions, the plan card, the labels (संकेत, काम, 10 मिनट) and "Google Play पर" all render correctly: conjuncts (स्क्रॉल, ब्रेक), nukta (फ़ोन, शेल्फ़, ख़त्म, फ़ैसला), chandrabindu (हालाँकि, दूँगी), danda. There are no missing squares.
- **Numbers:** "दस मिनट" is spoken in words. The plan card and the timer label show "10 मिनट".

## Visual review (frames I looked at)
- `contact-sheet.jpg`: 30 frames, one per second.
- `transitions.jpg`: the last and first frame on each side of each cut.
- Full-resolution beats: plan card full (10.87 s), cue (13.90 s), buzz (24.41 s), CTA (28.50 s), plus a crop of the plan card's right edge.

| Criterion | Assessment |
|---|---|
| Strong hook | The quote caption is on screen at frame 0. The phone feed scrolls over the finished plate while the small "“स्क्रॉल बंद करूँगी”" card floats up and dissolves. |
| Vague vs specific | The vague intention card dissolves (S1). The if-then card builds row by row in sync with the words (S2): "अगर", "तो", then "रात के खाने के बाद" and "फ़ोन शेल्फ़ पर, 10 मिनट". |
| Cue and action shown | S3: the hand pushes the plate away under the "संकेत" ring, then carries the phone to the shelf under "काम". The camera pans with the action. |
| Mechanism moves with narration | S4: the phone rests inside a filling 10-minute ring while the performer opens the notebook and writes. On "हालाँकि हर बार नहीं" the phone buzzes and lights up and the writing hand stops. |
| Distinct shots | S1 high over the right shoulder, S2 rear-left medium, S3 rear-right high pan, S4 high right three-quarter, S5 wide room (accepted staging). |
| Qualification | Once, in the evidence sentence: "हालाँकि हर बार नहीं।" |
| Style retained | Same room, performer, lavender/ivory palette, caption treatment, lock-up and CTA meaning as the accepted episodes. |
| Claims | No guarantee of behaviour change, no numbers or effect sizes spoken, no app planning feature. Sources are in the publishing copy and `context/14`. |

## Known limitations
- ASR-only Hindi check; nobody has listened by ear. Kokoro's Hindi voice is a small model, so a few words may sound slightly synthetic ("माइंडफुल" is heard as "माइनफुल").
- In S4 the performer's head is kept out of frame so it never sits behind the captions. The buzz "glance" therefore reads through the phone lighting up and the writing hand stopping, not through a head turn.
- From about 9.7 s in S2, the performer's head covers the plan card's bottom-right corner border. All card text, including "10 मिनट", stays clear and legible, so I kept this render.
- In S4 the captions sit over the notebook and desk. The dark text stays legible on the peach and orange background.
