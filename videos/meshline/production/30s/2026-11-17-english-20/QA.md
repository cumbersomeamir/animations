# QA: meshline-30s-english20-01.mp4 (batch 2026-11-17-english-20)

**SHA-256:** `34cd0eaf8a0f82ab5c100eefc29788cc1146b46c28b5f0c2a234fb83e7a97d18`
**Thumbnail:** `meshline-30s-english20-01-thumbnail.png`, 1080x1920 RGB, the same composition as frame zero ("NEAREST TOWER. / NOT CHOSEN."), sha256 `ab9f59c0e06bd1a3dfd930c311198e96925bde539166d578c509c819a6e3658f`

| Check | Result | Evidence |
|---|---|---|
| Video | H.264 High, yuv420p, 1080x1920, 30/1 fps, **900 frames** (counted by decode) | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio | AAC LC, 48 kHz, stereo | `qa/ffprobe.json` |
| Duration | **30.000000 s** (format, video and audio) | `qa/ffprobe-summary.txt` |
| Full decode | No errors | `qa/decode.log` |
| Black/freeze | None (black ≥ 0.25 s, freeze ≥ 2 s) | `qa/black_freeze.txt` |
| Loudness / clipping | **−15.0 LUFS**, LRA 3.1 LU, **true peak −3.2 dBTP** (no clipping), read from the final MP4 | `qa/loudness.txt` |
| Voice clarity (speech-band voice vs bed) | +20.3 to +25.4 dB on all 7 lines | `qa/voice_balance.json` |
| ASR per line (base.en) | All 7 lines match apart from punctuation (after one rewrite: "measured signal wins" was heard as "winds", so the line now says "counts") | `asr_words.json` |
| ASR on the **final MP4** | **WER 0.0** with whisper base.en; **normalised WER 0.0** with whisper-small (cross-check). Decoded audio PCM sha256 `3bfd89cb…` is the scored take. | `qa/asr_final.json`, `qa/asr_crosscheck_small.json` |
| First frame | Frame 0: the phone ("you") at the foot of the tallest, nearest tower, while its blue link arcs away to a distant tower; title "NEAREST TOWER. / NOT CHOSEN.". No logo intro, no fade, no empty setup. The hook audio starts at 0.25 s; the words hand over to the first caption at 0.55 s. | `qa/boundaries/b00.00.png` |
| Caption sync / bounds | Chunks start at the ASR time of their anchor word (−0.05 s); 12 chunks, no overlap. Ink x 133–864, y 360–468; plate x 101–899 (the CTA chunk is the widest). Inside x 100–900 and y 230–1500. | `captions.json`, `qa/caption_bounds.json` |
| Framing | No camera key shows the sheet's left or right edge (checked numerically: x·60·z ≥ 540 and (18−x)·60·z ≥ 540) | `src/tower.mjs` |
| Missing assets | None: the official icon renders in the CTA and on the thumbnail | `qa/boundaries/b27.60.png`, thumbnail |
| Representative sheet | 30 frames, 1 per second | `qa/contact-sheet.png` |
| Transition sheet | 23 frames at every beat and camera move | `qa/boundary-sheet.png` |

## Visual and accuracy review (frames inspected; not a human playback)
- **Hook:** the phone at the foot of the nearest tower; the live blue link (moving dots) goes to the far tower; "?" on "Why?".
- **Superhook:** the nearest tower turns grey with "other network"; a dashed grey link to it is struck out.
- **Measured, not distance:** the camera pulls out; "tower 1 / stronger" (farther) vs "tower 2 / nearer" behind a "building"; the instrument "what your phone measures" shows tower 1's bar higher.
- **Walk:** the phone walks past the building; tower 2's bar rises and crosses tower 1's (the "stronger" tag moves to tower 2 at the model's crossing); the link stays on tower 1, "waits".
- **Margin and set time:** a "margin" band appears on tower 2's row; when tower 2 clears it, a timer ring fills around the phone ("set time"); a coral ghost link bounces between towers ("bouncing") and is struck out; then the link swings to tower 2 ✓ and the readout says "using tower 2".
- **Payoff:** a wide view: "nearest / other network" and "a moment" by the phone; tower 2 ✓.
- **CTA (feedback "call to action needed" applied):** paper veil and a slow push; icon and wordmark, then an explicit blue button "Download free · Android"; spoken "Download Meshline for nearby messages, even offline."

## Defects found and fixed
1. **Scale:** the first layout was small and high; the towers are now taller, the camera lower and the phone larger.
2. **Ambiguous link:** the hook link passed the nearest tower's top and looked attached to it; the nearest tower now stands on the other side of the phone.
3. **Clipped label:** "tower 1" was cut at the frame edge by a zoom; the walk beat now stays at z ≤ 1.02.
4. **Overlaps:** "waits", "set time" and "a moment" sat on tower lattice; moved onto the street beside the phone.
5. **Timing:** the first walk model crossed the margin before "margin" was spoken; the walk curve and margin were retuned (crossing 12.6 s, margin 17.2 s, switch 20.2 s).
6. **ASR:** "wins" was heard as "winds"; the line now says "counts".

## Honest limits
- **No human listen-through was performed.** "Listening" means ASR on each line and on the final MP4, plus loudness and true-peak measurement.
- The camera is 2D only. Signal bars, margin and timer are illustrative (no network's real values).
- The idle-mode quotes come from ETSI TS 136 304 (LTE). 5G (TS 38.304) uses the same ranking idea, but it was not quoted here.
