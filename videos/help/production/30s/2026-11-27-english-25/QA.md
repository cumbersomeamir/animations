# QA — `help-30s-english25-01.mp4` (2026-11-27, batch 25) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `542e143b183bd8c5cae216ce8a45a597cb190c098dd539baacdb6c60d7243245`, 13.7 MB (13,697,641 bytes). Thumbnail `help-30s-english25-thumbnail.png` (1080×1920 PNG, SHA-256 `ac7c068613eea988dee8348d23760820bb77e0d196e369a3270f28735a23f904`).

| Check | Result | Evidence |
|---|---|---|
| Duplicate check | Before starting: no `2026-11-27-english-25` folder locally or on `origin/claude-video/help` (HEAD = origin `2db85f1`); no render/voice/ffmpeg job running | context 38 |
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a new black iron pot tied with a red ribbon bow on an unlit burner, an empty plate and an empty sack beside it; plaque "ONE POT. NO MEAL." (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "ONE POT. / NO MEAL." + Help badge | `help-30s-english25-thumbnail.png` |
| Loudness | **−15.0 LUFS**, LRA 2.3 LU, **true peak −1.7 dBTP**; SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice / soundtrack | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; established original pad + mallet motif + percussion accents, ducked under the voice; no Hindi. 77 words, 26.6 s of speech, ~0.45 s between sentences. Voice-only spellings: "Dee-haa-dee" (caption "Dihadi"), "lunger" (caption "langar") | `src/script.json`, `audio/mix30.py` |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the audio decoded from the final MP4 recognises the script; differences: names outside its vocabulary ("Dihadi" → "di hardy", "langar" → "lunch or"; checked by phonemes instead), homophones "flour" → "flower", "lasts" → "last" | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–2.45 s · superhook 2.92–6.76 s · question 7.22–9.19 s · proof 9.62–22.93 s (Lucknow kitchen: rations + money; Golden Temple langar: ~30 gas refills daily; staples in kind vs fuel money) · payoff 23.36–26.78 s · CTA 27.10–29.67 s | `src/cues.json`, `build/mix_info.json` |
| Captions | 14 cards from ASR word times, no overlaps; every spoken word in exactly one card. Zone (2026-11-19 brief, kept): ink **x 124–876, y 316–436** → **0 violations** in 28 checked frames (rule x 100–900, y 280–460) | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected on the final file. One headline at a time: ONE POT. NO MEAL. → LASTS FOR YEARS → RUNS OUT DAILY → WHAT KEEPS IT COOKING? → DIHADI KITCHEN → RATIONS + MONEY → GOLDEN TEMPLE LANGAR → ~30 GAS REFILLS DAILY → STAPLES: IN KIND → FUEL: MONEY → ASK FIRST → DROP OFF OR FUND? → LUCKNOW. Vital elements kept left of x 900 | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-27 before writing QA ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. The listing links no App Store page | context 38 |

## Defects found and fixed
- First take ran 26.8 s (only ~0.38 s pauses) → two lines shortened ("dry", "a day" → "daily").
- ASR: "A pot lasts years" was heard as "apart last year's" → "The pot lasts for years." Kokoro read "Dihadi" as "die-had-ee" → voice-only "Dee-haa-dee"; "langar" voiced as "lunger".
- Stills pass: the daily-use props (sack, dal bowl, gas cylinder) and the donation props were too small at phone size → enlarged; the "≈ 30 A DAY" tag overlapped the cylinder grid → the langar pots moved up and the tag placed between pots and cylinders; the Dihadi headline was shortened to stay inside x 900.
- All QA above was run on the final file.

## Remaining limits
- No human listening pass and no real-time viewing (ASR + loudness + frame sheets only).
- Dihadi Kitchen facts come from a 22 Aug 2024 feature (The Better India); its current operation and needs were not re-confirmed, so the narration says "has relied on". The Golden Temple figure is from The Tribune (13 Mar 2026), quoting the shrine's general manager: ~30 LPG refills a day **plus** ~1,300 units of piped CNG (the main fuel); the narration gives the refill count only.
- "Staples can be given in kind; fuel usually needs money" is a sourced generalisation (dry rations accepted in kind at Dihadi Kitchen; Golden Temple gas comes as refills from oil companies and piped CNG; SGPC asks for money donations), not a rule for every kitchen — hence "usually" and the payoff "ask first".
- The ThePrint report on Bangla Sahib (bot check) and DSGMC's site (connection reset) could not be read and were not used. The SGPC page lists bank accounts for money donations; no official in-kind list was found.
- Kitchens, people and amounts are illustrative; no beneficiary is shown or invented; Help is not affiliated with the kitchens named.
- A 0.3 s blur-in at 26.6 s overlaps the payoff with the CTA (the established CTA transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
