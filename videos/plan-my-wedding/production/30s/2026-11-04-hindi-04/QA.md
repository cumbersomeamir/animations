# QA: plan-my-wedding-30s-hindi04-01.mp4

Full record (script, gloss, storyboard, citations, recipe notes): `../../../context/10-episode-2026-11-04-hindi04-01.md`.

| Check | Result |
|---|---|
| Format | 30.000 s; H.264 High 1080x1920 yuv420p 30 fps (900 frames); AAC 48 kHz stereo 30.000 s |
| Decode / loudness | full decode clean; −16.0 LUFS, −1.5 dBTP |
| Language & glyphs | all narration and captions in Hindi (Devanagari) via Noto Serif Devanagari and Hind; no tofu |
| Voice | local Kokoro Hindi voices (0.7 hf_alpha + 0.3 hm_omega) with misaki/espeak-ng `hi` G2P; IPA fully in vocab |
| Listening | ASR only: Whisper large-v3-turbo on per-line WAVs and on the final MP4 audio recovers every sentence and number |
| Captions | ≤2 lines; strip y≈340–510, x 90–990; each opens at its VO line start; top 300 px clear |
| Claims | illustrative quotes ("मान लीजिए" plus the on-screen "उदाहरण के आँकड़े, बाज़ार दर नहीं"); arithmetic checked; no tax rate claimed; CTA supported by the listing |

## Defects found and fixed
1. Speech ran 29.7 s → script trimmed from 73 to 70 words.
2. Sentence-final "दो लाख" partly swallowed (ASR "2,00,") → "दो लाख रुपये", confirmed by A/B.
3. Hook cloches were too small → scaled 1.5×, tags enlarged.
4. Tower blocks dropping from 260 px passed through the caption band at ~16.4 s → 110 px drop.

## Known limitations
- Kokoro Hindi voices are author-graded C: intelligible but less natural than its English voices.
- No human native-speaker listen; ASR is the proxy.
