# QA: WastePaisa education pilot 01 (final = render v3)

File: `videos/wastepaisa/education/pilot-01/wastepaisa-education-pilot-01.mp4`
SHA-256 `5121f1a42feccc7cd98238e0ea8a0a5bb616f903a67209eb92c794cec5304a0b` · 11,582,437 bytes · QA run 2026-11-02.

## 1. Technical checks (`checks.json`, `ffprobe.json`, `decode.log`)
| Check | Result |
|---|---|
| Container duration | **15.000000 s** |
| Video | H.264 High, yuv420p, **1080×1920**, r/avg frame rate **30/1**, **450** decoded frames (`-count_frames`), duration 15.000 s |
| Audio | **AAC-LC**, 48 kHz stereo, 192 kb/s. Declared `duration_ts` **720000** @ 1/48000 = **15.000 s** |
| AAC padding | Raw decode gives 720,896 samples. The 1024-sample priming is offset by a negative first pts, and the extra 896 samples are encoder end padding (peak 3.1e-5, silent). Players honour the declared 15.000 s |
| Full decode | `ffmpeg -v error -i … -map 0 -f null -` → exit 0, **0 bytes of errors** |
| Black frames | `blackdetect` (d ≥ 0.1 s): none |
| Unintended freezes | `freezedetect` (n = 0.0005, d ≥ 0.5 s): none. Something moves throughout, including the end-card hold |
| Loudness | **−16.0 LUFS** integrated, LRA 2.9 LU, true peak **−1.6 dBFS** (two-pass loudnorm targeting −16 LUFS / −1.5 dBTP), so no clipping |

## 2. Text bounds and readability (`text-bounds.json`)
Every visible caption word, sub-line, chip, note, signature and series tag was measured in
the browser on **all 450 frames**: **0 violations** of a 40 px safe margin. The overall text
extent is x 44–1034, y 54–1786. Captions are Baloo 2 ExtraBold 78 px on a dark scrim (about
2 lines max, balanced wrapping); chips are 40 px; notes are Inter 28 px. Caption words pop in
with the narration and fade 0.12 s before the next line, so no two captions overlap
(checked on `contact-motion-every-6-frames.png`).

## 3. Motion, continuity and transitions
Inspected `contact-representative.png` (1 s steps), `contact-boundaries.png` (both sides of
every beat change, the hard cut, the first and last frames) and `contact-motion-every-6-frames.png`
(75 frames, 0.2 s steps). All are decoded from the delivered MP4.
- **f0**: the cup is already sliding in and Tinku is entering at the right edge, so the hook has motion on frame 0.
- **f73→f77**: cut stroke → halves spring open with overshoot. The lining is revealed and Tinku recoils.
- **f149→f151**: the exploded-view chips fade as the beaker rises; no pop.
- **f222→f223→f224**: halves close around the coffee, then the **hard cut on the CLACK** (in the L3/L4
  speech gap) to the 3/4 angle. Spatial continuity holds: the same cup, now closed, with Tinku beside it.
- **f285→f287**: tug at full stretch → grip slips. The film snaps back, Tinku tumbles and lands seated, and stays in frame (fixed in v3).
- **f408→f410**: L5 caption fades out and the end card builds. **f448/f449** hold the end card while Tinku settles.
- Character consistency: Tinku's proportions, colours, loupe side and lid crest are identical in every shot and match `character/tinku-model-sheet.png`.

## 4. Educational accuracy (see `../sources.md`)
Every spoken or on-screen claim (C1–C6) maps to dated public sources. Hedges are in place:
"Many" (not all) cups have a plastic lining, and a note says "Some cups use other barrier coatings".
The exploded view is labelled "thickness not to scale". The facility ✓/✗ signs are labelled
"Illustration · acceptance varies by area". The takeaway "Check what your local recycling
accepts" is not a universal disposal instruction. There are **no** app UI, payout, price,
allowance or impact claims; the app appears only as a small signature. The tug-of-war and
stretchy arm are metaphors; real separation is industrial pulping (noted in context 09).

## 5. Audio and intelligibility
- Narration: 5 lines, 33 words, 11.2 s of speech in 15 s (about 2.9 words/s), gaps of 0.29–0.31 s, nothing sped up.
- Offline ASR on the **delivered MP4** (`asr-intelligibility.json`, Vosk en-us-0.22-lgraph):
  **100 % word accuracy on all 5 lines**.
  The small Vosk model (`asr-intelligibility-small-model.json`) scores 94.3 %. Its only misses are
  "but" heard as "that" (L4) and a spurious leading "the" (L5), which the larger model gets right.
- Music is ducked 12 dB and SFX 9 dB under speech; voice is +1.9 dB. `audio-waveform.png` and
  `audio-spectrogram.png` show the speech windows and the action transients.
- SFX are timed to the actions: taps (1.02/1.22 s), slice (2.27 s), open (2.45 s), pour (5.2 s),
  drop impacts (6.2/6.32 s), clack and cut (7.42/7.45 s), stretch squeak (8.15–9.52 s), snap
  (9.52 s), landing (9.88 s), facility pops (10.95/11.2/11.45 s), end chime (13.62 s).
- No human listening test was possible in this cloud session. Intelligibility evidence is the
  two ASR models plus the loudness, peak and spectrogram checks.

## 6. Problems found and fixed during QA (iteration log)
| Iteration | Problem | Fix |
|---|---|---|
| Stills 1 | Portrait framing too tight; shelf jars behind captions; loupe not over the eye; orphan caption wraps; tug unreadable; centre facility hidden | Re-staged for depth, top scrim, loupe arc rig, `text-wrap: balance`, tug restaged |
| Stills 2 | Performer and stained half on opposite sides, so the reaction was lost | Performance mirrored to the right side (data transform in `choreo.js`) |
| Stills 3 | **Bug**: chips projected with the previous frame's camera matrix | `camera.updateMatrixWorld()` before projection |
| Perf | SwiftShader 3–4.5 s/frame | Lambert backdrop, selective env maps, CDP fast PNG capture (about 1.5 s/frame) |
| Perf side-effect | Paper turned tan and the wall went black | Ambient + hemisphere fill restored |
| Audio 1 | Mix ASR 0.80: whoosh under "Many", creak under L4, clack on "But", impacts on "drinks soaking" | SFX redesigned and moved; close and cut moved into the L3/L4 gap; ducking |
| Audio 2 | The larger ASR showed the L3 error was in the TTS take itself ("drinks soaking") | Reworded to "liquid" (more general, same meaning); L3 alone re-synthesised → 100 % |
| v1 review | Seated Tinku cropped after the tumble | Root and camera adjusted (v2) |
| v2 review | Still cropped at 10.0–10.5 s; Tinku absent on f0 | Tug camera shifted, tumble landing pulled in, earlier entry (**v3 = final**) |

## 7. Known limitations (honest)
- The synthetic voice is clear but somewhat even in tone. The pitch/formant and tin treatment gives
  character, not acting nuance.
- The beaker (a continuity prop) sits partly in frame at the bottom-right during the bond beat.
- Chips briefly overlap the background shelf jars; their solid fills keep them readable.
- English captions only. Software WebGL makes each full render take about 11–12 min.
- The Instagram references were not viewed. Tinku and the style were designed from the brief's description.
