# 17: Production 30s, Hindi batch 04 ("बिना मोबाइल डेटा जीपीएस, और ऑफ़लाइन नक्शा" / GPS location without mobile data; offline maps), 2026-11-04

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-04-hindi-04/meshline-30s-hindi04-01.mp4`, sha256 `5239f66af914a1454115cdd74cae91c6a0f5e3a4e9f2ceea2c81f79006326a25`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo (audio language tag `hin`).
- Checks:
  - full decode OK, no black or freeze;
  - −14.5 LUFS, −3.6 dBTP, voice/bed +22 to +26 dB;
  - Hindi ASR (whisper-medium): per-line CER 0.095, final MP4 CER 0.092 (all words present; segment starts within ~0.1 s of caption starts);
  - Devanagari captions inside y 340–520 and x 90–990.
- Prior outputs are preserved and untouched.

## Pre-flight checks
- The working tree was clean on `claude-video/meshline` (HEAD `975a062`). No job was running, and the output folder did not exist.
- **Topic history:** GPS / offline maps had never been covered (grep of `context/`). The user's topic was used as given.
- **Isolation:** only Meshline files were read. The separate Ideaverse meme test and its 15-second pilot style are another app's material; they were not opened and nothing from them was used here.

## Renderer / skill (the accepted actual one, not Three.js)
- Node 22 + `@napi-rs/canvas` 2D Transit Map sheet renderer, copied from Hindi batch 03 (`src/render.mjs`, `fonts_hi.mjs`, `caplayout.mjs`). The scene is a new `src/gps.mjs` with the same helpers, palette, sheet, pen tips, veils, instrument plate and CTA signature.
- Same Hindi voice (Kokoro `hf_beta`, speed 1.0), same mix palette (`audio/mix_h4.py`), same QA scripts.

## Final script (73 words, Kokoro hf_beta, hi, speed 1.0)
| id | time (s) | line (Hindi) | English gloss |
|---|---|---|---|
| l1 | 0.20–3.89 | मोबाइल डेटा बंद, फिर भी मैप पर आपकी जगह दिख रही है? | Mobile data off, yet your location shows on the map? |
| l2 | 4.29–9.71 | जीपीएस सैटेलाइट एकतरफ़ा सिग्नल भेजते हैं; फ़ोन उन्हें सुनकर जगह निकालता है। | GPS satellites send one-way signals; the phone listens and works out its position. |
| l3 | 10.11–12.31 | इसके लिए मोबाइल डेटा ज़रूरी नहीं। | Mobile data isn't required for that. |
| l4 | 12.71–17.10 | पर सड़कों वाला नक्शा अलग है; नया नक्शा अक्सर इंटरनेट से आता है। | But the street map is separate; a fresh map often comes from the internet. |
| l5 | 17.50–21.90 | सफ़र से पहले वाई-फ़ाई पर पूरे रास्ते का इलाका सेव करके जाँच लें। | Before a trip, save the area covering the whole route on Wi-Fi, and check it. |
| l6 | 22.30–25.32 | सैटेलाइट जगह बताते हैं, सेव नक्शा सड़कें। | Satellites give the position; the saved map gives the streets. |
| l7 | 26.00–29.73 | पास वालों से ऑफ़लाइन बात के लिए मेशलाइन डाउनलोड करें। | Download Meshline to talk offline with people nearby. |

Edits during drafting:
- The first draft had 77 words and 28.4 s of speech. It was cut to 73: dropped "बस" (just), "डाउनलोड होता है" became "आता है", the tip was merged into one clause, and the CTA "आस-पास के लोगों से" became "पास वालों से".
- "अक्सर" (often) was kept because cached map data may already be on the phone.

## CTA check
The CTA is supported by `assets/listing.json`: "Private nearby messaging that keeps moving, even when the internet does not". It is free and InStock on Google Play. "पास वालों से" states the real scope (nearby). There is no map or GPS feature claim for Meshline.

## Citations (full mapping in `production/30s/2026-11-04-hindi-04/research/claims.md`)
- GPS.gov `/gps`: satellites "transmit one-way signals"; the receiver "receives the signals… and uses the transmitted information to calculate the user's three-dimensional position and time".
- Google Maps Help 6291838:
  - save an area for offline use (needs internet to download);
  - offline maps guide you "as long as the entire route is within the offline map";
  - check the "Offline maps" list;
  - update offline maps before they expire;
  - offline mode has no traffic or transit/bike/walk directions;
  - not available in some regions.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–4.3 | Hook | Cartouche "जीपीएस बनाम नक्शा / जगह कहाँ से, सड़कें कहाँ से?". The phone ("आपका फ़ोन") sits on a blank tile map with a pulsing blue location halo. A coral "डेटा बंद" tag pops, then a coral "?". |
| 4.3–10.0 | Satellites | Pull up. Three printed satellites pop. The pen draws dashed rays down to the phone with arrowheads ("एकतरफ़ा सिग्नल"), and pulses travel down only. Fix circles close in and lock ("आपकी जगह"). The instrument shows मोबाइल डेटा बंद and जगह ✓ "सैटेलाइट सिग्नल से". |
| 10.0–12.6 | No data needed | Wide. The rays keep pulsing while data stays off. The instrument highlights "बंद" and "✓" together. |
| 12.6–17.4 | Map is separate | The blank tiles turn coral-hatched ("सड़कें नहीं"). An "इंटरनेट" zone appears ("नक्शा: इंटरनेट से"). Tile tokens drop toward the map and fizzle at a coral × (data off). Instrument: सड़कें "?". |
| 17.4–22.2 | Pre-trip tip | A Wi-Fi router replaces the ×, and tiles stream in and fill the saved columns with printed streets. The pen draws the route to a "मंज़िल" pin, and the dashed "सेव इलाका" frame covers the whole route. A "✓ ऑफ़लाइन जाँचा" stamp appears. Instrument: सड़कें ✓ "सेव नक्शे से". |
| 22.2–26.0 | Takeaway | Wide. "सैटेलाइट → जगह" (the satellites glow), then "सेव नक्शा → सड़कें" (the streets glow). The phone travels the route with the rays tracking it, and the matching instrument rows highlight. |
| 26.0–30 | CTA | The instrument fades and the Meshline icon and wordmark appear in the safe area. The phone keeps travelling the route. Caption "पास वालों से ऑफ़लाइन बात के लिए / मेशलाइन डाउनलोड करें". |

## QA
See `production/30s/2026-11-04-hindi-04/QA.md`.

## Reproduce
From `videos/meshline/production/30s/2026-11-04-hindi-04`:
- `<kokoro-py> audio/voice_hi.py <kokoro_dir with hf_beta.bin> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr_hi.py lines <faster-whisper-medium> audio/narration asr_words.json`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr_hi.py final <faster-whisper-medium> meshline-30s-hindi04-01.mp4 qa/asr_final.json`

## Next
Await review (a native-speaker listen is recommended). No automation was created, and nothing was uploaded to Drive.
