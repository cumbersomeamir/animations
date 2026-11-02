# QA — Media Diet · 30 s production 01 · "What airplane mode actually switches off"

**File:** `videos/media-diet/production/30s/2026-11-02/media-diet-30s-production-01.mp4`
**SHA-256:** `b3bbbf4c2e9b2ed6f40de763479e95178ec0f53d9ab9f5909d98f685c14c9763` · 8,603,107 bytes · 2294 kb/s
Built with `bash build/build.sh` (frames once, then `SKIP_FRAMES=1` after partial re-renders); QA = `build/qa.sh` on the exported MP4.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo 192 kb/s | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.0 LUFS** integrated, true peak **−1.9 dBTP** (spec −14…−16 LUFS, ≤ −1 dBTP) | qa/loudness.txt |
| captions | ink y **361–462** (spec 350–470), x 208–871 (spec ≥ 80 / ≤ 1000), ≤ 2 lines, in 784 frames | qa/text-bounds.json |
| safe areas | 0 violations over 900 frames: no text in y 0–300, nothing below y 1600, all text x 80–1000 (with the ≤ 1.022 push applied) | qa/text-bounds.json |
| intelligibility (one ASR + timing pass) | faster-whisper base.en word recall **1.0** (69 script words) | qa/asr.json |
| contact sheets | representative (every 1 s) + ±2 frames around all 6 cuts, from the encoded MP4 | qa/contact-sheet-*.png, first/last frame |

### ASR timing pass (heard word span vs scripted window)
| line | scripted window (s) | heard (s) | transcript |
|---|---|---|---|
| V1 | 0.30–2.91 | 0.0–2.62 | Airplane mode doesn't turn your phone into a brick. |
| V2 | 3.25–5.22 | 3.32–4.76 | It switches off cellular connectivity. |
| V3 | 5.85–11.91 | 5.88–11.46 | Wi -Fi and Bluetooth may go off too. Depending on the device, each can be turned back on separately. |
| V4 | 12.55–18.12 | 12.68–17.98 | So wireless headphones or an airline's Wi -Fi can still work if the airline allows it. |
| V5 | 18.75–22.18 | 18.78–21.8 | The icons are different radios, not one internet switch. |
| V6 | 23.10–27.46 | 23.08–27.22 | Follow the airline's instructions and check which connections are actually on. |
(V1's 0.0 start is Whisper's first-segment timestamp quantisation; the voice starts at 0.30 s.) I cannot listen to audio in
this environment; ASR is the objective proxy. Please give it one listen before posting.

## Visual inspection (contact sheets + full-resolution frames)
| area | result |
|---|---|
| Structure | Hook 0–3 (switch flips, ghost "brick" struck, screen still live) · setup 3–8 (cellular ringed; two sources at T+00.0) · mechanism 8–23 (Wi-Fi, then Bluetooth back on separately, freeze "still off"; headphones + cabin Wi-Fi inside an "airline rules" frame; icons → separate radios, "INTERNET" switch struck) · takeaway 23–29 (KNOWN / DEPENDS board, ringed real-state check) · end 29–30 (evidence map + sources + signature). |
| Continuity | One bench, one event clock (T−00.6 → T+…; frozen at T+00.0 for the sources; frozen again for the comparison), consistent radio colours (cyan on / grey off / violet dashed "may"). |
| Transitions | 6 hard cuts on the 0.5 s grid (5.5, 9.5, 12.5, 18.5, 23.0, 27.5) with a 3-frame flash; no dissolves, no empty frames after cuts (first evidence lands on the cut). |
| Motion | Something changes every second (waves, clock, cut-ins, drawn rings/leaders, highlights); holds only on the board (≥ 3.1 s with all items whole) and the end map. |
| Readability | Captions 46 px, ≤ 2 lines, word-group cues snapped to speech pauses; quotes 36–39 px; labels ≥ 24 px; tags 21–22 px (credits). |
| Accuracy | Every claim mapped in SOURCES.md (Apple Support 2026-02-11, Google Pixel Help, FAA InFO 13010, EASA 2014); "may", "depending on the device" and "if the airline allows it" keep the claims device- and airline-conditional; no claim that forbidden use is allowed. |
| Brand | App palette roles; only the end signature (icon + "Media Diet" + "tech, explained") — no ad, no CTA. |

## Fixes made during this round
1. Script 27.2 s → 24.0 s of speech (74 → 67 words); accuracy edits documented in context/12.
2. Sources layout enlarged and centred; props layout: overlapping plate labels replaced by short tags; stack lifted clear of the quote card.
3. First cut-ins after the 5.5 s and 23.0 s cuts moved onto the cut (bench was briefly empty for 6–7 frames).
4. True-peak headroom: loudnorm ceiling −1.5 → −2.0 dBTP (AAC overshoot had produced −1.2 dBTP).
5. ASR tool fixes (PyAV API mismatch → decoded samples; alignment crash on a non-speech tail → VAD filter); same single check.

## Remaining limitations (honest)
- The brief's "Meshline" cached Kokoro model was not present in this container. The same public Kokoro-82M v1.0 model was
  downloaded (hashes in context/11) and the stated blend/speed/language rebuilt with kokoro-onnx (espeak-ng phonemes);
  it may differ slightly from the Meshline pipeline's pronunciation.
- No real footage exists for this everyday-tech topic; "sources" are official documents (transcribed) and schematic drawings.
- FAA/EASA documents are 2013/2014 guidance (still the referenced documents); individual airline rules vary.
