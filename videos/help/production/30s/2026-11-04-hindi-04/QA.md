# QA — `help-30s-hindi04-01.mp4` (hindi-04, 2026-11-04) — Hindi narration + captions

All checks on the **final exported MP4**. SHA-256 `c0d370ed547356659260ebc2f2010b73e8051373145fb3b96450073380613caf`, 14.3 MB.

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames**; audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | exit 0, **0 error lines**; 900 frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| Loudness | **−15.0 LUFS**, LRA 2.7 LU, **true peak −1.7 dBTP** | `qa/loudness.txt` |
| Hindi voice | Kokoro-82M **native Hindi** voices hf_alpha 0.7 + hm_omega 0.3, lang `hi`, speed 0.98 (no English voice, no clone) | `audio/voice/sentences.json` |
| Intelligibility ("listening") | **ASR-only limitation:** I cannot hear audio. Checked with offline Hindi ASR (Vosk small-hi-0.22, QA-only). Final mix and voice track give the **same** transcript: 66/67 words recognised; only "ख़र्च" in "कौन-सा ख़र्च" was heard as "है"; other differences are spelling variants (nukta dropped, पूछें→पूछे). The same word "ख़र्च" is recognised correctly in sentence 4. | `qa/asr-final-mix-hi.txt`, `qa/asr-voice-track-hi.txt` |
| Narration ↔ captions | 6 lines at 0.20 / 4.30 / 9.35 / 14.10 / 17.30 / 25.95 s; 13 cards timed from the Hindi ASR word times, no overlaps; script assert: every spoken word appears in exactly one card; CTA 25.95–29.64 s | `src/captions.json`, `tools_captions.py` |
| Hindi glyphs | Noto Sans Devanagari (OFL) via @font-face; conjuncts, nukta (फ़, ज़, ख़), chandrabindu/anusvara render; no missing-glyph boxes | `qa/contact-sheet.png` |
| Caption bounds | 13 cards, 26 frames measured in-page: ink **x 109–971, y 369–493** (rule x 90–990, y 340–520) → **0 violations**; max 2 lines; y < 300 clear | `qa/caption-bounds.json` |
| Picture / transitions | 7 scenes follow the narration (fee card stamped "माफ़" yet empty desk → labelled fictional family, school far → bus fare + uniform drain the budget → boom gate, bag stays home → helper asks family/school, board "कौन-सा ख़र्च रोक रहा है?" ✓ बस किराया → bus pass, gate lifts, bag reaches desk ✓ → CTA with real icon). No child is drawn. Helper and Sunita are the same size in every scene. | `qa/contact-sheet.png`, `qa/scene-transitions.png` |

## Defects found and fixed (one fix round)
- E scene: helper (0.8) and Sunita (0.62) were not the same size → both 0.7 (before the first full render).
- First full render: **empty stage 3.9–4.4 s** (A slid out before B's props appeared) → house + Sunita now slide in with scene B.
- First full render: **budget bar unreadable** (green fill multiplied onto a dark trough looked black) → light hide trough; bar now reads full green → amber → empty "बजट ख़त्म".
- Caption word-count slip (three cards missing "है/हैं") was caught before render; an assert now prevents it.

## Remaining limits
- No human listening pass (Hindi ASR + loudness only). Kokoro Hindi is espeak-based: clear but slightly synthetic prosody.
- "ख़र्च" in sentence 5 is not recognised by the small ASR model there (recognised in sentence 4); kept because the caption shows it.
- E→G and G→F hand-offs overlap outgoing/incoming props for ~0.3 s under the lamp dip (intentional slide).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.
