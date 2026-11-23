# QA — `help-30s-english24-01.mp4` (2026-11-23, batch 24) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `e16c983d4cb54474b45a785c02733cc51016fbaddf5bddc01912a11661f52dc2`, 14.1 MB (14,116,230 bytes). Thumbnail `help-30s-english24-thumbnail.png` (1080×1920 PNG, SHA-256 `b15bf0828c0fc2fa26a209adcd9661b6307ab96b3f5fa4f7c016d922aec49f9e`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a clothes rail at night — one heavy quilted coat on the left, a stack of thin layers on the right, a thermometer between them; plaque "WHICH IS WARMER?" (3 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "WHICH IS / WARMER?" + Help badge | `help-30s-english24-thumbnail.png` |
| Loudness | **−15.0 LUFS**, LRA 1.9 LU, **true peak −1.6 dBTP** (below the −1.5 limit); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice / soundtrack | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; established original pad + mallet motif + percussion accents, ducked under the voice; no Hindi. 81 words, 25.7 s of speech, ~0.4 s between sentences | `src/script.json`, `audio/mix30.py` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the audio decoded from the final MP4 recognises the script; differences: "wood" → "would" (homophone) and one extra token "i'd" at the comma after "monoxide" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–3.49 s · superhook ("one common way to keep warm can kill") 3.90–6.15 s · proof 6.55–22.42 s (layers trap heat; stay dry; head, hands, feet; no coal or wood fire in a closed room; carbon monoxide) · payoff 22.85–26.21 s · CTA 27.10–29.67 s | `src/cues.json`, `build/mix_info.json` |
| Captions | 15 cards from ASR word times, no overlaps; every spoken word in exactly one card. Zone (2026-11-19 brief, kept): ink **x 183–817, y 316–435** → **0 violations** in 30 checked frames (rule x 100–900, y 280–460) | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected on the final file. One headline at a time: WHICH IS WARMER? → ONE HIDDEN DANGER → LAYERS TRAP HEAT → STAY DRY → HEAD, HANDS, FEET → NOT IN A CLOSED ROOM → CARBON MONOXIDE → CAN'T SEE OR SMELL IT → WINTER DONATIONS → LAYERS, CAPS, SOCKS → LUCKNOW. Vital elements kept left of x 900 | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-23 **before** writing QA ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. The listing links no App Store page | context 37 |

## Defects found and fixed
- Topic: the brief's proposal (school bag donated but the child still cannot attend — uniform/transport costs) repeats hindi-04 (record 17) and overlaps english-06 (record 19) → replaced with an unrelated, verified topic in the genre (cold-wave warmth and safety); reasons in context 37.
- Build: my `sock()` prop clashed with an existing stage helper → renamed `woolSock()`; the assembler choked on the apostrophe in the previous title → rewritten.
- Stills pass: the frame-0 headline overflowed its plaque → wider plaque; the trapped-heat dots were hidden under the outer layers → drawn on top; the eye/nose icons were unreadable (the nose sat on the door) → cream badges at the left of the room; a faint blue "night" wash was removed to keep the approved palette.
- All QA above was run on the final file.

## Remaining limits
- No human listening pass and no real-time viewing (ASR + loudness + frame sheets only).
- Advice is general cold-wave guidance from public advisories (Delhi DGHS, IMD, MedlinePlus, US EPA); no statistics, temperatures or death counts are claimed. NDMA's own cold-wave page reset the connection and was not used.
- The Delhi advisory names "candles, woods, etc."; "coal" in the narration rests on EPA (carbon monoxide comes from burning wood or charcoal) and the same advisory's carbon-monoxide warning.
- The clothes, room and dress form are illustrative; no person is shown in danger; no family is invented.
- A 0.3 s blur-in at 26.6 s overlaps the payoff with the CTA (the established CTA transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
