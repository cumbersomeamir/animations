# 19 — Batch `2026-11-06-english-06` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-06-english-06/tensorblue-30s-english06-01.mp4`
(copied to `production/30s/2026-11-06-english-06/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 6 Nov 2026)
- **Topic:** how a QR code still scans after a corner is damaged — error correction, shown with an original, simple demonstration and its limits, plus why it matters for everyday scanning.
- **Language override:** English narration and English captions only, never Hindi. Hindi audio was not reused.
- **Voice:** the approved Tensorblue voice character, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, from the local cache (offline). The brief's "Meshline/Recall voice character" names other apps. Their context was not read (app isolation), and "where applicable" here means Tensorblue's own approved voice.
- **History check:** not covered before. Earlier episodes covered CDN, optimistic updates, idempotency, raster vs vector, password managers, passkeys and OCR.
- **Improvements from the user's performance sheet:** the sheet itself is not in this container. I followed the written points: a visual hook in 1–2 s (corner tears off at 0.12 s, "✓ example.com/menu" at 1.05 s), one concrete demonstration, a clear takeaway, and the short CTA in the last 4 s.
- **Kept exactly:** Blue Receipt Theatre recipe and the accepted renderer (original Node + `@napi-rs/canvas`, `brt.mjs` unchanged — **not Three.js**), palette, logo, caption treatment (Inter SemiBold 54 px, y 340–520), wipe compositor, the accepted English CTA end card and line.
- **Palette:** unchanged since the 2026-11-05 site check (`#030610`, `#3B82F6`, `#FFFFFF`, `#D8E3F5`, `#B7C7DF`; logo `#0A6CFF`).

## The real QR demo (nothing private)
`src/demo/make_qr_demo.py` encodes `https://example.com/menu` (example.com is reserved for documentation, RFC 2606). It uses **segno 1.6.6** at level **L** (version 2, 25×25 modules) and level **H** (version 3, 29×29), with `boost_error=False`.

Each code is drawn exactly as in the video: a white sticker with a 4-module quiet zone, on a pale menu card, on the navy stage. Tears remove part of the sticker and expose the pale card. Two independent open-source readers decode every state at 6, 10 and 16 px per module:
- **zbar 0.23.93** (`zbarimg`, Ubuntu `zbar-tools 0.23.93-4build3`)
- **OpenCV 5.0.0** `QRCodeDetector` (`opencv-python-headless 5.0.0.93`)

| state | zbar | OpenCV |
|---|---|---|
| L intact / H intact | ✓ all sizes | ✓ all sizes |
| **same bottom-right tear** (cut at 50 % of each edge), level L | ✕ all sizes | ✕ all sizes |
| **same bottom-right tear**, level H | ✓ all sizes | ✓ all sizes |
| small tear on the top-left corner square (20 % of each edge), level H | ✕ all sizes | ✕ all sizes |

The renderer reads `demo/out/qr.json` (matrices, tear polygons, results) and refuses to render if a result changes. **Decoded from the final MP4's own frames** (`qa/frame-decode.json`):
- S1 torn H at 1.5 s and 2.9 s: ✓ ✓
- S2 small intact H: ✓ ✓
- S4 torn L: ✕ ✕; torn H: ✓ ✓
- S5 corner-square tear at 18.75 s (before any overlay) and 20.8 s: ✕ ✕
- S6 preview: ✓ ✓

On-screen numbers come from this demo:
- 26 message + 44 recovery bytes: the version 3-H block table (2 × [13 data + 22 EC] codewords) as implemented by segno.
- 25×25 / 29×29 module sizes.
- "105 squares lost": modules whose centre lies inside the tear.

A tear was chosen over a dark stain because the tear exposes light card. In the sweep, a dark fill confused OpenCV even at level H. The video shows only the tested look.

## Final script (as spoken; 73 words, 25.4 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.15 | This QR code lost a corner, and it still scans. |
| L2 | 3.55–7.44 | Every QR code carries extra recovery data: error correction. |
| L3 | 7.69–11.64 | If squares get torn or dirty, the scanner rebuilds the missing data. |
| L4 | 11.89–16.76 | Level L recovers about seven percent of its data; level H, about thirty. |
| L5 | 17.01–20.86 | But error correction can't fix the three corner squares scanners look for. |
| L6 | 21.16–24.65 | Printing one? Choose a higher level, and keep those corners clear. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked before rendering):**
- QR = /kjˌuˈɑɹ/, L = /ˈɛl/, H = /ˈAʧ/, data = /dˈATə/.
- Tensorblue uses the accepted override `[Tensorblue](/tˈɛnsəɹblˌu/)`.

**Edits:** the first draft (78 words) ended at 25.7 s, too close to the CTA wipe. "called error correction" became ": error correction", and "…that help scanners find the code" became "…scanners look for".

## Source → claim map (DENSO WAVE, the QR Code inventor; read 2026-11-06)
| claim | source | what it says |
|---|---|---|
| A QR code can still be read when part of it is damaged | **What is a QR Code?** https://www.qrcode.com/en/about/ ; **Error correction feature** https://www.qrcode.com/en/about/error_correction.html | "Even if a QR Code is partly smeared or damaged, it has the capacity to correct itself and restore the original data." / "QR Code has error correction capability to restore data if the code is dirty or damaged." |
| Every QR code carries extra recovery data (error correction) | Error correction feature (above) | "The QR Code error correction feature is implemented by adding a Reed-Solomon Code to the original data." |
| The scanner rebuilds the missing data | Error correction feature (above) | restores data "if the code is dirty or damaged"; the rate is a "Data restoration rate for total codewords (codeword is a unit that constructs the data area. One codeword of QR Code is equal to 8 bits.)" |
| Level L ≈ 7 %, level H ≈ 30 % (UI also shows M 15 %, Q 25 %) | **QR Code standardization** https://www.qrcode.com/en/about/standards.html | "Level L — Approx. 7% of codewords can be restored … Level M — Approx. 15% … Level Q — Approx. 25% … Level H — Approx. 30% of codewords can be restored." |
| Higher level → denser code (25×25 vs 29×29 on screen) | Error correction feature (above) | "Raising this level improves error correction capability but also increases the amount of data QR Code size." |
| Three corner squares that scanners look for | **Micro QR Code** https://www.qrcode.com/en/codes/microqr.html ; **History of QR Code** https://www.qrcode.com/en/history/ | "position detection patterns are located at the three corners of a symbol"; the patterns were added as "positional information indicating the existence of a code to be read". |
| Error correction can't fix those corner squares | the two sources above + demo | Restoration works on codewords, "a unit that constructs the data area"; the position detection patterns are positional marks, not data codewords. Demo: a much smaller tear on one corner square stopped both readers at every size, while the large data-corner tear did not stop level H. |
| Takeaway: choose a higher level for codes that may get damaged | Error correction feature (above) | "Level Q or H may be selected for factory environment where QR Code get dirty"; "Typically, Level M (15%) is most frequently selected." (the settings card starts on M) |

**Not claimed:** no guarantee that any phone app reads a given damaged code. The ✓/✕ results are the two named open-source readers on these exact images, and the narration avoids "always". QR Code is a registered trademark of DENSO WAVE INCORPORATED.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.35 | **S1 Hook** | Frame 0: a pale "MENU · TABLE 12" card with a real level-H QR sticker. At 0.12 s the bottom-right corner tears off and flies away; scanner corners snap on (0.75 s); "✓ example.com/menu" (1.05 s); kinetic "Still **scans.**" |
| 3.35–7.56 | **S2 Inside the code** | Wipe →. Small sticker; "inside this code (level H)": 26 white message tiles, then 44 blue recovery tiles on "extra recovery"; legend; pill "error correction". |
| 7.56–11.76 | **S3 Rebuild** | Wipe ←. Zoomed into the torn corner: the missing area is outlined on "torn" ("105 squares lost"); on "rebuilds" the lost dark squares return in blue ("rebuilt from recovery data"); "✓ example.com/menu — decoded by zbar and OpenCV". |
| 11.76–17.14 | **S4 Same tear, two levels** | Wipe ↑. Level L (25×25) beside level H (29×29), same tear. Bars fill to "about 7%" / "about 30% can be restored"; L "✕ Can't read", H "✓ Scans"; kinetic "7% → **30%**". |
| 17.14–21.01 | **S5 The limit** | Wipe →. Intact H sticker; on "can't" a small nick tears off the top-left corner square. On "three" the three corner squares are outlined (the damaged one dashed). On "look" grey scanner corners appear: "✕ No code found — zbar and OpenCV"; kinetic "Corner **squares**". |
| 21.01–25.80 | **S6 Takeaway** | Wipe ←. Kinetic "Higher level," / "**corners clear.**"; an "Error correction" selector slides from M to H on "higher"; ticks appear beside the three corner squares (outside the code) on "corners"; "✓ example.com/menu" on the chime. |
| 25.80–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/make_qr_demo.py` + `src/demo/out/` (qr.json, six tested PNGs), `src/demo/requirements-demo.txt`.

Reused unchanged: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py` (feedback-05 version, English defaults).

Reused with edits:
- `mix.py`: seed 20261109, heading, seven scene chords.
- `asr.py` (round 02): narration span only via `clip_timestamps`, plus `condition_on_previous_text=False`. On the music-only tail, faster-whisper 1.2.1 hallucinated "." segments past 30 s and crashed in word alignment.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Logo: `assets/brand/tensorblue-logo.svg`.
- Encoder and readers: segno (BSD-3-Clause), zbar (LGPL-2.1), OpenCV (Apache-2.0). They were run locally only and are not bundled.
- Voice: Kokoro-82M (Apache-2.0), cached `af_bella`/`am_puck`.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, private data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-06-english-06/tensorblue-30s-english06-01.mp4` · SHA256 `eb7e74c99dbda031a0d5ae72ed7e462f70dd3d7b292dc352102cd9943a513a58` · 3,119,443 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.6 LU, **−1.8 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 12 groups pass: ink y 371–488, x 155–921 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | visual payoff in 1–2 s | real menu QR on frame 0; tear at 0.12 s; "✓ example.com/menu" at 1.05 s |
| demo truth | what is shown decodes as shown | 9 frame decodes from the final MP4 match (see demo section) |
| narration (one ASR pass, base.en) | intelligible | every word heard; WER 4.1 %, entirely number formatting ("7%" for "seven percent", "30" for "thirty"); low-confidence: "about" 0.52, "one" 0.47 |
| caption/speech timing | aligned | mean word-start drift 0.13 s. Max 0.50 s on "can't", where Whisper starts the word inside "correction"; the voice track's energy shows silence 18.02–18.17 s and the onset at ~18.20 s, matching Kokoro's 18.14 s cue |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- S1's result chip extended past y 1480 (menu card shortened, chip raised).
- S6's corner ticks touched the result chip and the settings card (tightened).
- The torn-edge stroke ran past the sticker in the test render (now clipped to the sticker, as in the video).

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- Phone camera apps were not tested. The demo uses two open-source readers on the exact images.
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
