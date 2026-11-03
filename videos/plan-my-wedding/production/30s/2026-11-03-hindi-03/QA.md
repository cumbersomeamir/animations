# QA: plan-my-wedding-30s-hindi03-01.mp4

Full record (script, gloss, storyboard, citations, voice route, ASR evidence): `../../../context/09-episode-2026-11-03-hindi03-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Full decode | no errors (qa/decode.log empty) |
| Loudness | −16.0 LUFS integrated, −1.5 dBTP |
| Language | all narration and captions in Hindi (Devanagari); brand wordmark "Plan My Wedding" kept as the official name |
| Voice | Kokoro-82M Hindi voices (0.7 hf_alpha + 0.3 hm_omega), misaki/espeak-ng `hi` G2P, local CPU; IPA fully in vocab (qa/phonemes.json, qa/vo.json) |
| Listening (ASR) | Whisper large-v3-turbo on the rendered MP4 audio recovers all 7 sentences and all numbers (qa/asr_rendered_audio.json) |
| Glyphs | Devanagari shaping verified (reph/conjuncts/nukta/chandrabindu/₹); no tofu after replacing "✓" with a drawn check |
| Captions | ≤2 lines, strip y≈340–510, x 90–990, each opens at its VO line start; top 300 px clear |
| Claims | hypothetical figures ("मान लीजिए" plus the on-screen "उदाहरण के आँकड़े, बाज़ार दर नहीं"); arithmetic checked; CTA supported by the listing |

## Defects found and fixed
1. "डेढ़ सौ", "बढ़ा दिए", "तय" and "डाउनलोड" misheard by ASR → reworded or respelled (G2P-only respelling for the CTA).
2. Speech ran 30.2 s → script trimmed to 67 words; speed 1.04, with 0.98 on number lines.
3. "✓" rendered as a tofu box in Hind → drawn folded check.
4. Scale prices used the Latin serif → Noto Serif Devanagari (native ₹).
5. The 100-guest grid overlapped the folding per-guest scene at 9.6 s → fold moved to 9.12 s.
6. The 0.4 s end fade would have dimmed the CTA's last syllable → 0.12 s fade.

## Known limitations
- Kokoro's Hindi voices are graded C by their authors: intelligible (confirmed by ASR) but less natural than its English voices.
- In isolation "साठ" leans toward "साथ"; in context, and with the ₹60,000 caption, it is unambiguous.
- "Listening" was automated ASR, not a native-speaker review.
