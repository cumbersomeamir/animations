# QA: meshline-30s-english12-01.mp4 (batch 2026-11-11-english-12)

**SHA-256:** `f5b63c6bee1021aacb4caf36208937c0340fcf4cd4172edc96dea075711e1698`
**Thumbnail:** `meshline-30s-english12-01-thumbnail.png`, 1080x1920 RGB, sha256 `2c651f640443a935741100a6523346bc41056c3245a4ead3cdc1c0ad169462a1`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.3 LUFS**, LRA 2.9 LU, **true peak −4.0 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +18.5 to +28.9 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en; whisper-small cross-check) | All lines match. base.en drops the short "Why?" in l1, but whisper-small and the final-MP4 pass both hear it. "2.4" was first voiced as "two… four" and is now spelled "two point four" for the TTS. | `asr_words.json` |
| ASR on the **final MP4** | Raw WER 0.13; **number-normalised WER 0.014**. The only difference is "Bluetooth's" heard as "Bluetooth". | `qa/asr_final.json` |
| Caption sync | Each chunk starts at the ASR time of its first word (−0.05 s); 11 chunks, no handoff overlap | `asr_words.json`, `captions.json` |
| Caption bounds (new brief) | Ink x 177–821, y 360–468; plate x 144–856, y 334–486. Inside x 100–900 and y 230–1500, at most 2 lines, centred at x 500. | `qa/caption_bounds.json` |
| Pacing | Hook 0–3.9 s (frame 1 already shows the link, the envelope and "same distance"). Escalation 4.3–6.7. Explanation and proof 7.1–20.8 across 3 scene changes. Resolution 21.2–25.7. CTA 26.3–29.55. | `audio/narration/narration_meta.json` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b28.00.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** two phones a labelled "same distance" apart; an envelope is already crossing in frame 1. A concrete wall slams down (dust, thump), the link turns coral, an envelope fizzles at the wall, ✕ and a coral "?". The meter reads "no wall → concrete".
- **Escalation:** the wall morphs to thin drywall; the link is blue again and a message arrives ✓ ("barely any loss", meter "−0.6 dB").
- **Mechanism:** close on the wall. A "2.4 GHz" wave travels in, glows coral inside the wall ("absorbed"), part bounces back ("reflected") and only a faint wave continues.
- **Proof:** a "−30 dB" stamp and a "20 cm" dimension on the wall. The instrument is hidden here, so only one readout is on screen.
- **Open-air equivalent:** the plan is veiled. Close on "open air" 1× phones, then a pull-out as the ruler counts to "30× the distance".
- **Payoff:** a "relay" phone pops into the doorway; two dashed clear hops carry an envelope ✓ ("2 clear hops"), while the direct path shows ✕ at the wall.
- **CTA:** the map steps back under a paper veil (the relay diagram fades, so no relay is implied for the app), with the icon and wordmark.

## Defects found and fixed
1. The ✕ marks were drawn under the wall and invisible. They are now drawn after the wall.
2. The "same distance" label sat across the lower wall segment. It moved left of the wall.
3. In the l3 close-up the right phone was cut at the edge and "absorbed" ran past x 990. The camera shifted left and "absorbed" moved left of the wall. "2.4 GHz" moved below the wave and fades before "absorbed".
4. The "−30 dB" was shown twice (stamp and instrument), and the "30×" too. The instrument is hidden during l4–l5 (one readout at a time), and the stamp moved clear of the right phone.
5. The l5 ruler was small and the sheet edge showed. It was enlarged, the plan is veiled, and the camera starts close on 1× then pulls out.
6. The CTA showed relay hops under the logo, which could imply an app relay feature. The hops now fade under a stronger CTA veil.
7. The first frame was an empty plan. It now opens with the link drawn and the envelope already moving.
8. The thumbnail's accent bar covered the "concrete" label, and the cartouche competed with the words. Both were removed from the thumbnail.

## Honest limits
- **No human listen-through was performed.** "Listening" here means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only.
- The 30 dB figure is NIST's measurement at 2.0 GHz, not at 2.4 GHz.
- The 30× factor assumes free space; real indoor reach also depends on devices, antennas, PHY, interference and layout (S1).
