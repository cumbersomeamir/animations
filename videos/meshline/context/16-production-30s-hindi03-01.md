# 16: Production 30s, Hindi batch 03 ("एयरप्लेन मोड असल में क्या बंद करता है?" / What airplane mode actually switches off), 2026-11-03

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-03-hindi-03/meshline-30s-hindi03-01.mp4`, sha256 `3fcc05cb73dfe1cc81e11edb270b6870ffb780331d081179bc57ea813207650a`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo (audio language tag `hin`).
- Checks:
  - full decode OK, no black or freeze;
  - −14.6 LUFS, −3.7 dBTP, voice/bed +20 to +26 dB;
  - Hindi ASR (whisper-medium): per-line CER 0.079, final MP4 CER 0.124;
  - Devanagari captions inside y 340–520 and x 90–990.
- Prior outputs are preserved and untouched.

## Pre-flight checks (before starting)
- The working tree was clean on `claude-video/meshline` (HEAD `3e6a1a3`). No generation was active (no render, TTS or ASR process), and `production/30s/2026-11-03-hindi-03/` did not exist.
- **Topic history:** the proposed "crowded concert, full bars but messages fail (signal vs capacity)" is already covered three times:
  - production 01, `12-production-30s-01.md`;
  - pilot 01;
  - the 10s test.

  Per the brief, it was replaced by an equally concrete planned title from `08-educational-strategy.md`, #7 "What airplane mode actually switches off". This keeps the brief's "what local offline communication can and cannot do" (a nearby direct link works within limited reach; the internet still needs a network).

## Brief (user, 3 Nov 2026, plus the latest correction)
- One new 30 s educational video in the accepted Transit Map style, with the CTA "Download Meshline for offline communication" if supported, and no range or connectivity claims.
- **Latest correction (overrides language):** all narration and captions in natural Hindi (Devanagari).
  - Use a genuinely Hindi-capable local voice, and never feed Hindi to the English Kokoro blend.
  - Check pronunciation and intelligibility, render real Devanagari glyphs, and clone no voice.
  - Use no paid API. State a blocker if Hindi isn't possible.

## Hindi voice decision
- **Installed multilingual TTS:** kokoro-onnx 0.6.1 with Kokoro-82M (Apache-2.0). Its Hindi-trained voices (hf_alpha, hf_beta, hm_omega, hm_psi) were downloaded from the same onnx-community repo, with espeak-ng `hi` phonemes.
- **Compared** on the first draft with whisper-small CER: hf_alpha 0.201, **hf_beta 0.169**, blend 0.7 hf_alpha + 0.3 hm_omega 0.207. hf_beta was chosen, at speed 1.0.
- **Rejected for licence or access:** Piper hi_IN (CC BY-NC-SA / IndicTTS), MMS-TTS hin (CC BY-NC), Indic Parler-TTS and IndicF5 (gated, need an account token), XTTS (non-commercial, cloning).
- **Limit:** the voice softens retroflex consonants. No human listening was possible; a native-speaker listen is recommended before posting.

## Final script (75 words, Kokoro hf_beta, hi, speed 1.0)
| id | time (s) | line (Hindi) | English gloss |
|---|---|---|---|
| l1 | 0.25–3.30 | एयरप्लेन मोड ऑन, फिर भी ईयरबड्स चल रहे हैं? | Airplane mode on, yet the earbuds still play? |
| l2 | 3.70–8.50 | यह मोबाइल नेटवर्क वाला रेडियो बंद करके टावर से जुड़ाव काटता है। | It switches off the mobile-network radio and cuts the link to the tower. |
| l3 | 8.90–12.93 | वाई-फ़ाई, ब्लूटूथ भी बंद होते हैं, पर दोबारा चालू हो सकते हैं। | Wi-Fi and Bluetooth turn off too, but can be turned on again. |
| l4 | 13.33–17.15 | तब ईयरबड्स या पास का फ़ोन सीधे रेडियो से जुड़ सकता है। | Then earbuds or a nearby phone can connect directly by radio. |
| l5 | 17.55–22.13 | पर यह लिंक सीमित दूरी तक ही चलता है; इंटरनेट के लिए वाई-फ़ाई चाहिए। | But the link only reaches a limited distance; the internet needs Wi-Fi. |
| l6 | 22.53–25.82 | यानी यह मोबाइल नेटवर्क काटता है, हर रेडियो नहीं। | So it cuts the mobile network, not every radio. |
| l7 | 26.25–29.41 | ऑफ़लाइन संचार के लिए मेशलाइन डाउनलोड करें। | Download Meshline for offline communication. |

Edits during drafting:
- The first draft had 89 words and ran 31–35 s, so it was trimmed to 75.
- "कम दूरी" (short distance) became "सीमित दूरी" (limited distance), because Bluetooth SIG range runs from under a metre to over a kilometre.
- "मोबाइल नेटवर्क का रेडियो" became "मोबाइल नेटवर्क वाला रेडियो", which reads more naturally.

## CTA check
The CTA is supported by `assets/listing.json`: a free, InStock Google Play Android app, "messaging that keeps moving, even when the internet does not". It is spoken and captioned as मेशलाइन, and the official icon plus the Latin wordmark appear on screen.

## Citations (full mapping in `production/30s/2026-11-03-hindi-03/research/claims.md`)
- Android Developers `Settings.Global`: AIRPLANE_MODE_RADIOS ("radios that need to be disabled when airplane mode is on"), with RADIO_CELL = "Cellular radio".
- Google Pixel/Android Help 12639358: Wi-Fi and Bluetooth turn off when airplane mode is first turned on, can be kept on for earbuds, and the phone remembers the setting.
- Apple Support HT204234: "If the airline allows it, you can still use Wi-Fi and Bluetooth in Airplane Mode."
- Bluetooth SIG range and tech overview: range is finite and variable; point-to-point device links.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–3.4 | Hook | Cartouche "एयरप्लेन मोड / असल में क्या बंद होता है?". The phone ("आपका फ़ोन") gets an "✈ ऑन" tag. The earbuds' dashed Bluetooth link and sound arcs keep going, and a coral "?" appears. |
| 3.4–8.6 | Mobile radio off | Pull up to the "मोबाइल टावर". The pen inks the blue "मोबाइल नेटवर्क" line with data pulses. The screen-space airplane-mode panel appears. At "बंद करके" the mobile toggle flips off, the line veils grey/dashed with a coral ×, and "जुड़ाव कटा" appears. |
| 8.6–13.0 | Wi-Fi/Bluetooth | Wide-ish. The pen inks the Wi-Fi line to the "वाई-फ़ाई राउटर". At "बंद होते हैं" both lines and toggles go off. At "दोबारा चालू" they re-ink and turn on. The mobile line stays cut. |
| 13.0–17.6 | Direct link | Close-up on the local cluster (the tower is veiled). "पास का फ़ोन" pops in, the pen draws a "सीधा रेडियो लिंक", and an envelope crosses directly. |
| 17.6–22.4 | Limits | Wide. The "सीमित पहुँच" reach circle with beacon pulses; "दूर का फ़ोन" beyond a coral gap ("पहुँच से बाहर"). The pen inks router → "इंटरनेट" and a message travels phone → router → internet. |
| 22.4–26.2 | Takeaway | The mobile line and its toggle are highlighted coral ("जुड़ाव कटा"). Then the Wi-Fi and Bluetooth lines glow with looping tokens, and their toggles are highlighted. |
| 26.2–30 | CTA | The panel fades and the Meshline icon and wordmark appear in the safe area. Slow push-in, loops continue. Caption "ऑफ़लाइन संचार के लिए / मेशलाइन डाउनलोड करें". |

## QA
See `production/30s/2026-11-03-hindi-03/QA.md`: 5 defects fixed, and the limits are listed honestly.

## Reproduce
From `videos/meshline/production/30s/2026-11-03-hindi-03`:
- `<kokoro-py> audio/voice_hi.py <kokoro_dir with hf_beta.bin> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr_hi.py lines <faster-whisper-medium> audio/narration asr_words.json`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr_hi.py final <faster-whisper-medium> meshline-30s-hindi03-01.mp4 qa/asr_final.json`

## Next
Await review, ideally with a native Hindi speaker listening. No automation was created, and nothing was uploaded to Drive.
