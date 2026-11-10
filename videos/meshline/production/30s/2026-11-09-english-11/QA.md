# QA: meshline-30s-english11-01.mp4 (batch 2026-11-09-english-11)

**SHA-256:** `13bc1b0b925065d61310751d6bb714ea76a7e5bdaf699f61de8580732e6cac3e`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness | **−15.1 LUFS**, LRA 4.5 LU, **true peak −3.8 dBTP** (read from the final MP4); music stays quiet under speech | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +17.5 to +24.8 dB on all 7 lines (l3 raised from +16.2 by lowering two cues) | `qa/voice_balance.json` |
| ASR per line (faster-whisper base.en) | All 7 lines verbatim, apart from punctuation. The first draft of l3 ("at most 160") was heard as "and most", so it was reworded to "up to 160". | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** raw and number-normalised ("160" is transcribed as digits on both sides). The decoded audio PCM (sha256 `0f8fd8ca…`) is unchanged by the last, video-only rebuild. | `qa/asr_final.json` |
| Narration / caption timing | Each chunk starts at the ASR time of its first word (−0.05 s); 14 chunks, no handoff overlap. The CTA plays 26.14–29.55 s (the last 3.9 s). | `asr_words.json`, `captions.json` |
| Caption bounds (pixel-exact ink) | Ink y 360–468 (inside 350–470), x 171–909 (inside 90–990), at most 2 lines. The top 300 px are clear. | `qa/caption_bounds.json` |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every camera move and beat | `qa/boundary-sheet.png` |

## Visual and accuracy review
- **Hook (first second):** the whole map is visible: your phone, the tower's doorway, the friend and the crowd. The call shows "connecting…", then fails (coral handset ✕, tag "call ✕", instrument "call ✕ failed"). At 1.45 s an envelope leaves, waits a beat and slips through a gap in the crowd's traffic, and the tags read "text ✓" / "sent". Cartouche: "Call vs text / what each one needs".
- **Call:** a faint band marks the whole route ("held open"). The blue call band inks up to the doorway and is stopped there (coral ✕, fizz, "busy doorway"). The instrument bar fills continuously: "held open the whole call".
- **Text:** close-up on one envelope ("one burst", "up to 160 / characters"). The instrument shows a tiny block, "one tiny burst · up to 160 characters".
- **Less signal, held, gap:** your phone drops to 1 coral bar ("1 bar is enough"). The envelope climbs to the doorway and waits with a filling clock ring ("held") while grey traffic streams through. At "gap" the lintel turns blue and the envelope slips through ("slips through a gap") to the friend ("delivered"). Instrument: "1 bar · still enough for a text" / "held by the network → ✓ delivered in a gap".
- **Guides:** printed callout "EMERGENCY GUIDES / to check in, / text instead / of calling"; another text slips through a gap.
- **Plan:** "before the event", then a pin drops ("meeting point"). One short text goes through; the instrument types "At the meeting point." with "21 / 160 characters" ✓. Both phones walk to the pin.
- **CTA:** a short dashed "nearby" link between the two phones, an envelope hop and a dashed limited-range ring, while the doorway above stays "busy doorway". Icon and wordmark.
- **Claims:** mapped in `research/claims.md` (FCC/FEMA, FCC 14-6, 3GPP TS 23.040 / 23.038 / 23.203).

## Defects found and fixed
1. The "✕" character is missing from the font and rendered as a bar in the hook tag. Marks are now drawn as strokes (a `tag()` helper).
2. The hook's tower antenna touched the caption plate. The hook framing was lowered slightly (z 1.24 → 1.2).
3. The l5 callout was too small to read. It was enlarged (0.6–0.66 G lines, taller spine).
4. Line 3's voice-over-bed margin was +16.2 dB, under the +17 dB house target. The burst "land" and "click" cues were lowered, giving +17.5 dB.
5. In the l3 close-up the "crowd" label clipped at the right edge, the sheet's left edge showed, and "tower" sat beside the caption band. The camera shifted right, and both labels are veiled during that beat. This was a video-only rebuild, and the audio hash was confirmed unchanged.
6. The caption builder's anchor "then" matched the ASR word "the" (the reverse-prefix rule). Reverse-prefix matches now need an ASR word longer than 3 letters.

## Remaining limits (honest)
- No human listening; this relies on ASR and level metrics.
- The camera is 2D only.
- The doorway/traffic picture is a teaching metaphor. Real networks schedule calls and texts in more complex ways, and texts can still be delayed under heavy congestion (S1).
