# QA — `help-30s-hindi03-01.mp4` (hindi-03, 2026-11-03) — Hindi narration + captions

All checks on the **final exported MP4**. SHA-256 `649520e96e9aac9190844fea7065a35dae2e65d3bcde83c64ad9081114293061`, 13.9 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error bytes**; **900** frames decoded | `qa/full-decode.log` |
| Loudness | **−15.0 LUFS**, LRA 2.7 LU, **true peak −1.7 dBTP**; music ≈19 dB under the voice at speech | `qa/loudness.txt` |
| Hindi voice | Kokoro-82M **native Hindi** voices hf_alpha 0.7 + hm_omega 0.3, lang `hi`, speed 0.98 (no English voice used for Hindi) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | I cannot hear audio; checked with offline Hindi ASR (Vosk small-hi-0.22). Voice track: every sentence recognised word-for-word (counts aligned for all 15 caption cards). Final mix: full narration recognised; only "माँगा" heard as "मांगे गए", plus nukta/chandrabindu spelling variants. Draft words ढोना/बाँटना/जाँचें were misheard in early tests and replaced. | `qa/asr-voice-track-hi.txt`, `qa/asr-final-mix-hi.txt` |
| Narration ↔ captions | 6 lines at 0.20 / 4.55 / 8.75 / 14.00 / 18.45 / 25.85 s; caption cards timed from the Hindi ASR word times (no overlaps, ≥2-frame gaps); checklist ticks land on "संस्था की जाँच करें" (19.7 s) / "ज़रूरत पूछें" (21.4 s) / "सही मदद चुनें" (22.6 s); CTA 25.85–29.54 s | `src/captions.json`, `src/cues.json` |
| Hindi glyphs | Noto Sans Devanagari (OFL) woff2 loaded via @font-face; conjuncts, matras, nukta (ज़), chandrabindu (हैं, माँगा) render correctly at native size; no tofu/missing boxes | `qa/contact-sheet.png` |
| Caption bounds | 15 cards, 30 frames measured in-page: ink **x 146–934, y 396–481** (rule y 340–520, x 90–990) → **0 violations**; single lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | 6 scenes moving with the narration (heap of unrequested items → stored in godown + loaded on truck → godown भरा, truck व्यस्त, relief crate इंतज़ार → trusted organisation board क्या/कितना/कब ✓ → checklist ✓✓✓ then requested relief driven to the neighbour ✓ → CTA with real app icon). Fixes before final: hook hands hid the items; truck load drawn too large; relief crate hidden behind truck; near-empty stage at 13.8–14.3 s (board now enters at 13.9 s). | `qa/scene-transitions.png` |

## Remaining limits
- No human listening pass (Hindi ASR + loudness only). Kokoro's Hindi is espeak-based; prosody is clear but slightly synthetic.
- Hindi narration is ~57 words (25.6 s of speech): the native voice is slower than English, so the script was narrowed rather than sped up.
- E→F (25.7 s) overlaps the outgoing and incoming figures for ~0.4 s under the lamp dip.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
