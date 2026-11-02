# QA — Media Diet · 30 s production 02 · "How noise cancelling headphones create quiet"

**File:** `videos/media-diet/production/30s/2026-11-02-batch-02/media-diet-30s-production-02.mp4`
**SHA-256:** `f077ae0bfb37b1ac84905cec0b2379421404183c5a584b42f641effd2d7a69d8` · 6,974,856 bytes · 1859 kb/s
Build: `bash build/build.sh` (full frames once, then partial re-renders + `SKIP_FRAMES=1`). QA: `build/qa.sh` on the exported MP4.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo 192 kb/s | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−1.9 dBTP** | qa/loudness.txt |
| captions | ink y **361–462** (spec 350–470), x 150–929 (spec 80–1000), ≤ 2 lines | qa/text-bounds.json |
| safe areas | **0 violations** over 900 frames (no text in y 0–300 or below 1600; all text x 80–1000, push applied) | qa/text-bounds.json |
| one ASR + timing pass | faster-whisper base.en, word recall **0.986**; the only "miss" is the spelling variant "canceling" for "cancelling" | qa/asr.json |
| contact sheets | representative (every 1 s) + ±2 frames around all 8 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### ASR timing pass
| line | scripted window (s) | heard (s) | transcript |
|---|---|---|---|
| V1 | 0.25–3.50 | 0.0–3.22 | Noise -canceling headphones don't just wall off your ears. |
| V2 | 3.85–8.25 | 4.0–7.92 | Microphones listen to the noise, and electronics create an opposing wave. |
| V3 | 8.70–11.33 | 8.74–10.86 | When the waves meet, part of the noise is reduced. |
| V4 | 11.80–14.90 | 11.84–14.56 | This works best on steady low rumbles, like an engine. |
| V5 | 15.35–18.44 | 15.62–18.14 | Voices and sudden, sharp sounds are harder to cancel. |
| V6 | 18.95–21.11 | 19.02–20.68 | Ear cushions also block sound physically. |
| V7 | 23.05–26.03 | 23.03–25.71 | So the quiet comes from two mechanisms working together. |
| V8 | 26.50–27.76 | 26.51–27.45 | A snug fit helps both. |
I cannot listen to audio here; ASR + timing is the proxy. Please listen once before posting.

## Visual inspection
| area | result |
|---|---|
| Story | Hook: evidence case opens, a dashed "wall" around one cup and "+ ?" at the microphones → setup: cutaway, outer/inner mic ringed, signal path to electronics, anti-noise leaves the driver → mechanism: slowed waveform chart with playhead (noise / anti-noise / at your ear): "reduced, not zero" → engine rumble mostly cancelled ✓ → voice/sudden sounds "get through" (ringed) → cutaway: cushion seal, big outside / small inside → takeaway: ACTIVE + PASSIVE board joined into QUIET → fit: leak closes, ✓ active ✓ passive → evidence map + signature. |
| Motion tied to narration | Waves travel only while described; playhead runs only in the chart layouts; no ambient/decorative animation (user feedback). |
| Transitions | 8 hard cuts on the 0.5 s grid at narration boundaries with a 3-frame flash; every new layout lands with content on the cut frame. |
| Readability | Captions 46 px ≤ 2 lines (word-group cues snapped to speech pauses); labels ≥ 26 px; tags 21–22 px. |
| Accuracy | Claims C1–C9 mapped in SOURCES.md (Apple Support 2026-09-14, Sony Help Guide, Bose 2026-04-27); schematic amplitudes labelled "schematic"; "reduced, not zero" and "ANC off in this view" keep the diagrams honest. |
| Audio | Voice upfront; bed ducks ≈ −9 dB; demonstration layer (rumble drops when anti-noise engages, bursts stay, leak hiss stops on seal) stays under the voice. |

## Fixes during this round
1. Script draft 72 words → 69 words; hook shortened to 3.25 s; accuracy edits ("don't just", "Voices and sudden, sharp sounds", "A snug fit helps both").
2. Case lid re-drawn to hinge inside the bench (it would have crossed the caption zone and top 0–300 px).
3. Cutaway labels moved off the driver/wave; passive scene given labelled outside/inside waves.
4. Over-wide source tag (x 1022) shortened → 0 bounds violations; board items moved onto the 21.5 s cut.

## Remaining limitations (honest)
- The "Meshline" Kokoro cache itself was never present in this container; production 01's locally cached Kokoro-82M v1.0
  model and the agreed blend/speed/language were reused unchanged (possible minor pronunciation differences vs Meshline).
- The physics is shown schematically (no measured product data). The peer-reviewed background reference (Kuo & Morgan 1999)
  could not be opened from this environment and is listed only as background.
