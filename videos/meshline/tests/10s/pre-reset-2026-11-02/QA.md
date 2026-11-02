# QA: tests/10s/pre-reset-2026-11-02/meshline-10s-test.mp4 (batch 2026-11-02-pre-reset)

The style is S14 Transit Map, taken from the public STYLE.md (lemomo-ai/lemo-opuscar `styles/transit-map`) and used as art direction only. Nothing from that repository was cloned or executed.
The code is original Canvas2D (`src/map.mjs`) and reuses this app's pilot-01 core, fonts and audio helpers.

| Check | Result |
|---|---|
| Streams | H.264 1080x1920, 30/1 fps, **300 frames**; AAC 48 kHz stereo |
| Duration | **10.000000 s** (format, video and audio): `qa/ffprobe-summary.txt` |
| Full decode | `FULL DECODE OK`: `qa/decode.log` |
| Loudness | −14.0 LUFS, true peak −3.3 dBTP: `qa/loudness.txt` |
| Voice | Kokoro-82M ONNX, Meshline blend 0.7 `af_bella` + 0.3 `am_puck`, speed 0.98, en-us; one take, 0.30–7.67 s; speech-band voice/bed +23 dB |
| Frames | 9 representative and transition frames: `qa/contact-sheet.png` |
| Captions | Upper centre: plate y 330–498, text lines about 340–480; at most 2 lines; ≥ 80 px side margins; no overlapping handoffs (0.3–2.35, 2.55–4.9, 5.1–9.95 s) |
| SHA-256 | see `qa/sha256.txt` |

## Beats
1. **0–2.6 s:** a pen inks YOUR PHONE → CELL TOWER, and the printed bars fill to full.
2. **2.6–5 s:** eight more routes ink in and converge on the same tower. The capsule lands with weight and turns "busy · shared capacity".
3. **5–10 s:** one camera push toward the tower. Data tokens queue on the route and step through a single gate at a fixed rate, with "your data · waiting". A tiny Meshline signature appears.

## Claims
The only claim is that "signal strength isn't spare capacity; many phones share the tower, so data waits". It reuses the verified source from pilot 01 (T-Mobile, 2026-03-26; see `education/pilot-01/research/claims.md`). The map is labelled "Illustrative map · not real network data" and shows no numbers.

## Fixes made
- Narration was buried (+4 dB) → deeper duck, quieter pen and pad, voice up (+23 dB).
- The "busy · shared capacity" label was clipped at the frame edge after the push → centred above the capsule on a plate.

## Unresolved (honest)
- No ASR or listening check, because of the time budget. Narration levels were checked by speech-band metric only.
- The caption plate extends about 20–40 px beyond the suggested 350–460 band.
- Station labels and printed bars at YOUR PHONE are small in beat 1, before the push. Paper texture is a light speckle, not full paper tooth.
- No depth of field or tilt beyond a slight shear during the push.
