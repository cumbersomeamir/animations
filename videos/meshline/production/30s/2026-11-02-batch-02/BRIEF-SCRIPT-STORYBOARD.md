# 13: Production 30s #02, "Why a walkie-talkie can work when the internet is down" (batch production-30s-2026-11-02-batch-02)

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-02-batch-02/meshline-30s-production-02.mp4`, sha256 `1fb50fb7bc2a554f9c710a28a8ed45cb377bdbbdb1b26bde92e42afa753ea47c`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 yuv420p + AAC 48 kHz stereo.
- Checks: full decode OK. −14.6 LUFS, −2.6 dBTP. ASR WER 0.0 on the final MP4. Caption ink inside y 350–470, x ≥ 154.
- Episode 01 and all earlier outputs are preserved and untouched.

## User feedback captured for future episodes (also in `11-production-format.md`)
- Latest feedback overrides earlier style details. Keep the Transit Map world, and make a fresh storyboard with purposeful scene changes.
- Don't regenerate reviewed topics (01 is closed).
- Research every claim first, then tighten minimally. Aim for 65–80 words in 30 s.
- Keep app identity, with no new random characters.
- Distinguish walkie-talkies and other radios from Meshline. Never claim which radio Meshline uses or that its range is unlimited.
- Don't create automation. Save the brief, script, citations, storyboard and format in this app's context.

## Brief
- Topic: why a walkie-talkie can work when the internet is down.
- Scene: in the Transit Map world, voice packets travel between two stations without the internet hub, a hill blocks a route, and a repeater station extends it.
- Genre: communication, wireless connectivity and communication without the internet.
- Style module: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/transit-map/STYLE.md, used as art direction only.

## Final script (67 words). Edits from the draft and why
- Added the hook "Internet down?" (useful hook; 2 words).
- "sends your voice as radio signals directly to another radio" → "sends your voice by radio, straight to another radio" (timing; same meaning).
- "It does not need a website, mobile data or an internet router." → "No website, mobile data or internet router needed." (timing).
- "check their actual limits" → "check their limits" (timing).
- "does not" → "doesn't" (natural delivery).

| id | time (s) | line |
|---|---|---|
| l1 | 0.30–5.44 | Internet down? A walkie-talkie sends your voice by radio, straight to another radio. |
| l2 | 5.79–9.06 | No website, mobile data or internet router needed. |
| l3 | 9.41–13.85 | Both radios need compatible settings and must be within usable range. |
| l4 | 14.15–17.15 | Buildings, hills and interference can weaken the signal. |
| l5 | 17.47–20.61 | Some radio systems use repeaters to reach farther. |
| l6 | 20.91–25.67 | Offline messaging apps may use different radios and rules, so check their limits. |
| l7 | 25.97–28.98 | No internet doesn't mean unlimited communication. |

Voice: Kokoro-82M ONNX, Meshline blend 0.7 af_bella + 0.3 am_puck, speed 0.98, en-us.

## Citations (full mapping in `production/30s/2026-11-02-batch-02/research/claims.md`)
- eCFR 47 CFR §95.503 (FRS: short-distance two-way voice between hand-held radios).
- eCFR 47 CFR Part 95 Subpart E (GMRS, with repeater stations).
- Bluetooth SIG "Understanding Bluetooth Range" (range depends on the technology; obstacles and interference).
- Wikipedia "Walkie-talkie" (single channel; terrain; line of sight) and "Repeater" (extending over distance and obstructions).

## Storyboard (as rendered)
| Time (s) | Beat | Map action | Captions |
|---|---|---|---|
| 0–3 | Hook | The printed internet path (ROUTER → INTERNET → MOBILE DATA, with WEBSITE). The hub is stamped offline (0.45 s). A voice token tries the path and fizzles at the router (2.3 s). | "Internet down?" → "A walkie-talkie sends / your voice by radio," |
| 3–8 | Setup | The pen inks a direct radio link RADIO A → RADIO B ("direct radio link"). Voice packets ride it with push-to-talk squelch. WEBSITE, MOBILE DATA and ROUTER are stamped "not needed" as each is spoken. | "straight to / another radio" → "No website, mobile data / or internet router needed" |
| 8–14 | Mechanism | The internet path veils back. Channel bullets CH 7 vs CH 3 ("settings don't match"): packets stall and fizzle. The bullet flips to CH 7 ("matching settings") and packets flow. A dashed "usable range" arc is drawn around RADIO A. | "Both radios need / compatible settings" → "and must be within / usable range" |
| 14–17.5 | Mechanism | Glide down to RADIO C past a printed hill, buildings and interference scribble. The low path's ink breaks up at the hill and tokens fizzle ("signal weakens"). | "Buildings, hills and interference / can weaken the signal" |
| 17.5–21 | Mechanism | A REPEATER lands with weight on the hilltop. The relay route inks to RADIO C, and packets hop A → repeater (ring) → C. | "Some radio systems / use repeaters to reach farther" |
| 21–26 | Takeaway | Paper veil, then glide to a printed comparison panel: "Walkie-talkie: two-way radio · channel + range" vs "Offline messaging app: radios + rules vary · check its limits". | "Offline messaging apps may use / different radios and rules," → "so check their limits" |
| 26–29 | Takeaway | Pull back to the whole sheet. Finite dashed coverage rings appear around every radio, with a printed callout "No internet ≠ unlimited range". | "No internet doesn't mean / unlimited communication" |
| 29–30 | End | Whole network held, with the title cartouche back and a subtle Meshline signature. | — |

## QA
See `production/30s/2026-11-02-batch-02/QA.md`: 7 defects fixed, and the remaining limits are listed honestly.

## Reproduce
From `videos/meshline/production/30s/2026-11-02-batch-02`:
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr.py final <faster-whisper-base.en dir> meshline-30s-production-02.mp4 qa/asr_final.json`

The narration WAVs are committed. To regenerate them, run `education/pilot-01/audio/voice.py <kokoro_dir> audio/narration.json audio/narration`.

## Next
Await review. No automation was created.
