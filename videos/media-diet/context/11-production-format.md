# 11 · Production format (30 s educational shorts) — durable context for future rounds

Approved 2026-11-02 (round production-30s-2026-11-02). Applies to Media Diet 30 s educational productions.
Do not create automation from this file; it is reference for future sessions.

## Channel genre (locked)
Tech news and breakthroughs, with explanations of everyday technology. One useful, sourced explanation per video;
a viewer who never installs the app still learns something correct. No ads, no store CTA, no invented claims.

## Exact skill (read-only art direction)
- URL: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/visual-investigation/STYLE.md
- Module: `styles/visual-investigation` ("Visual Investigation — Style Prompt"); fetched raw 2026-11-02,
  sha256 9b39ebaa00c3d77ae544d7453e99b79caf4dfaae1d37798b1f995a5578aac30b (138 lines). Nothing cloned or executed;
  its demo tools (`footage.py`, `readcheck.mjs`, `mix.py`…) were NOT used — our own equivalents are original code.
- Kept: cold investigation bench; one event clock read inside the picture (`T+xx.x`, freezes and changes form at cuts);
  one finding per layout; uncertainty drawn (dashed = "may / depends"); freeze → circle (clockwise 0.5 s) → magnify;
  re-typeset transcriptions labelled `transcription` with the decisive line highlighted (multiply α 0.6, wiped L→R);
  short mono source tags above each frame; known/unresolved board (here KNOWN / DEPENDS) held ≥ 2.5 s; evidence-map ending
  with full source credits; elements cut in ≤ 0.1 s with a 3-frame white flash; hard cuts on a 0.5 s grid; no dissolves,
  bounces or scale pops; only drawn things animate progressively; camera static with slow push ≤ 1.022; something
  changes every second; sound palette (low D bed + room tone, quiet pizzicato Dm–B♭–Gm–A, clock tick per event second,
  procedural foley, voice ducking ≈ −9 dB); facts file mapping every claim.
- Adapted (brief overrides the style): portrait 1080×1920 instead of 1920×1080; app palette instead of greyscale + red
  (the single pointing accent is the icon's magenta); captions upper-centre instead of bottom subtitles; voice blend
  af_bella/am_puck instead of am_michael; no archival footage exists for an everyday-tech topic, so "sources" are official
  documents (transcribed) and drawn schematics (marked `schematic`); no presenter/mascot.

## Recurring scene rules
- One continuous scene language: a navy **examination bench** (rounded mat x 64–1016, y 512–1592, 48 px grid, ruler ticks)
  on which evidence objects are laid out; layouts change only on hard cuts.
- Objects are drawn line work: isometric **exploded stacks** for device internals, generic control buttons, props as
  schematic line art. Generic icons only (no OS screenshots, no brand logos).
- One event clock per film. Freeze = waves/clock stop + white flash + ring.
- Every factual layout carries its source tag; every inference/uncertainty is dashed or labelled.
- Ending: evidence map (sources linked to the object) + subtle signature (icon 64 px + "Media Diet" + "tech, explained").

## Palette (sampled from assets/icon.png → roles)
| role | value |
|---|---|
| ground | `#04061f` (icon navy `#000219` lifted) |
| bench / panels | `#0a0e36` / `#0e1345` |
| hairlines | `#2a2f72` (icon deep blue `#24287e`) |
| text / secondary / ticks | `#ECEAF6` / `#9094c4` / `#4a4f80` |
| **the one pointing accent** (rings, leaders, highlights, ✓, strike-through, sync lines) | `#fe4092` (icon magenta) |
| active / transmitting state | `#2addfa` (icon cyan) |
| uncertain / maybe | `#a359fa` dashed (icon violet) |
| off | `#3a3f6e` |
| paper (transcriptions) / ink | `#E6E4F0` / `#14163a` |

## Type
Space Grotesk 700 (captions 46 px), Inter 600 (labels 24–32 px), IBM Plex Mono 400/600 (tags 21–22 px, clock 64 px),
Source Serif 4 Italic (quoted originals 36–39 px). All OFL via @fontsource (pinned in package.json).

## Caption & safe areas (portrait 1080×1920)
- Top 0–300 px: nothing. Captions: upper-centre, **text ink y 350–470**, x 80–1000, max 2 short lines, word groups split
  into separate cues rather than squeezed (2-line baselines 394/452, 1-line baseline 424, 46 px, 10 px shadow).
- Essential content inside the bench, x 96–984, y 520–1580 (survives the ≤ 1.022 push); nothing essential below y 1600
  (platform overlay region). Checked per frame by `build/bounds_check.py` from the page's `window.TEXTS()`.
- Cue boundaries snap to real pauses in the narration (`build/cues.py`).

## Audio configuration
- Voice: Kokoro-82M v1.0 via kokoro-onnx 0.6.1 (PyPI, MIT) — model `kokoro-v1.0.onnx`
  (sha256 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5), voices `voices-v1.0.bin`
  (sha256 bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d), from github.com/thewh1teagle/kokoro-onnx
  release `model-files-v1.0`; weights Apache-2.0 (hexgrad/Kokoro-82M). Style vector = 0.7·af_bella + 0.3·am_puck,
  speed 0.98, lang en-us, espeak-ng phonemes (espeakng-loader). 24 kHz → 48 kHz (soxr), HPF 70 Hz, trimmed.
  NOTE: the "Meshline" cached model referenced in the brief was not present in this container; the same public model and
  the stated configuration were re-created here. Kokoro output was deterministic across runs in this session.
  Narration takes are committed (`audio/narration/*.wav`) as build inputs.
- Music/foley: synthesized in `build/audio.py` (no samples). Bed ≈ 30 dB under voice, ducking ≈ −9 dB under voice.
- Master: two-pass EBU R128 `loudnorm` to −15 LUFS integrated with a −2.0 dBTP ceiling before AAC (AAC overshoot adds ≈ 0.3–0.7 dB; delivered −1.9 dBTP). Accepted band −14…−16 LUFS, TP ≤ −1 dBTP.
- Check: one ASR + timing pass on the final export (faster-whisper base.en, offline). The agent cannot listen; ASR is
  the intelligibility proxy and the user should listen before posting.

## Timing template (30.000 s, 900 frames)
Hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · elegant end 29–30 s.
Speech ≈ 24 s max (≈ 67 words at Kokoro speed 0.98), ≥ 0.3 s air between lines, last line ends ≥ 2 s before 30.0.

## Delivery
`videos/media-diet/production/30s/<date>/media-diet-30s-production-NN.mp4` + publishing-caption.txt, SOURCES.md (facts
file), LICENSES.md, QA.md, qa/ evidence; brief/script/storyboard/QA summary in context/12-… per production.
H.264 High yuv420p 1080×1920 30/1 fps, AAC-LC 48 kHz stereo 192 kb/s, exactly 30.000 s, faststart.
