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

## Updates from the user's feedback (batch-02, 2026-11-02) — latest feedback overrides earlier style details
- 30s-01 (airplane mode) was reviewed and accepted; keep its identity (bench, palette, type, captions, signature) and
  never regenerate a used topic. Each new episode gets a **fresh storyboard with purposeful transitions** — no trims,
  recolours or re-cuts of old output.
- **No decorative motion disconnected from narration.** Every animated element must be triggered by, or illustrate, the
  line being spoken (e.g. waves only travel when the voice talks about them; ambient dust/particles are not used).
- Show the mechanism through scene changes (object → cutaway → chart → contrast → verdict → practical check → map),
  one finding per layout, cuts on the 0.5 s grid at narration boundaries.
- Word budget 65–80 words for a natural 30 s at speed 0.98 (≈ 22.5–25 s of speech); tighten the draft only for accuracy and timing.
- Sound may **demonstrate** the mechanism (event-linked, always under the voice), e.g. a rumble that drops when anti-noise
  engages, a leak hiss that stops when a seal closes.
- Keep the accepted app identity; no new characters or mascots in this production format.
- Caches to reuse (not committed): `production/30s/2026-11-02/.cache/{venv,models}` (Kokoro model/voices, faster-whisper
  base.en) and `production/30s/2026-11-02/node_modules` — later batches symlink them (`.cache/venv`, `.cache/models`,
  `node_modules`) so no re-download or re-install is needed; build/QA scripts are copied per episode.

## Episode log
| # | folder | topic | status |
|---|---|---|---|
| 01 | production/30s/2026-11-02/ | What airplane mode actually switches off | delivered, reviewed |
| 02 | production/30s/2026-11-02-batch-02/ | How noise cancelling headphones create quiet | delivered (context/13-production-30s-02.md) |
| feedback-01 | production/30s/2026-11-02-feedback-round/ | How a warehouse robot finds its way when GPS cannot help inside (Layered Tech Cutaway) | delivered (context/14-production-30s-feedback-01.md) |
| round02-01 | production/30s/2026-11-03-round-02/ | How emergency satellite messaging reaches help when there is no mobile signal (Layered Tech Cutaway, accepted recipe unchanged) | delivered (context/15-production-30s-round02-01.md) |
| hindi03-01 | production/30s/2026-11-03-hindi-03/ | Hindi news episode: iOS 27.2 adds Google's invisible SynthID watermark to iPhone AI images — how to check (Layered Tech Cutaway; Hindi Kokoro voice + Devanagari captions) | delivered (context/16-production-30s-hindi03-01.md) |
| hindi04-01 | production/30s/2026-11-04-hindi-04/ | Hindi news episode: Google Play Store (2 Nov 2026) reminds you if Play Protect stays off — what it does, how to keep it on | delivered (context/17-production-30s-hindi04-01.md) |
| feedback05-01 | production/30s/2026-11-05-feedback-05/ | Hindi news episode: Android screen-share privacy now blanks login/payment fields in Chrome (rollout from 14 Oct 2026, Android 15+) — how to check your version | delivered (context/18-production-30s-feedback05-01.md) |

## FORMAT UPGRADE (feedback round, 2026-11-02) — supersedes conflicting rules above
User feedback: the flat Visual Investigation card look was judged too weak/flat. From this round on, every new Media Diet
30 s episode uses the **"Layered Tech Cutaway"** style recipe below. Earlier sections stay valid only where they do not
conflict (sourcing discipline, one finding per beat, no decorative motion, voice config, delivery specs).

### Style recipe: Layered Tech Cutaway (the style is the craft — a rendering library is not the style)
- Reference reviewed by the user: https://www.instagram.com/p/DfOg0TEDoTk/ — taken from it: warm tactile layered sets,
  jointed cut-out props, real-looking paper edges and cast shadows, distinct locations, narrative scene progression.
  Its folklore story is NOT Media Diet content; Claude could not open Instagram from this environment and works from the
  user's description.
- **World:** a genuinely dimensional handcrafted paper miniature of the episode's subject (e.g. a warehouse), standing on a
  layered paper table: walls/shelves stand above the floor; laminated two-tone card walls with visible stacked paper
  edges; paper grain (bump + fibre texture) and slight per-card tint variation; real cast shadows from a low warm key light
  placed so shadows fall toward the camera; cool brand-coloured stock (navy/violet/lavender/cyan/magenta from the icon).
- **Props are jointed and physical:** hinged roofs that lift, maps that unfold panel by panel, crates that slide and settle,
  paper path strips that flip — the mechanism is acted out by objects, never by a presenter or mascot.
- **Cutaway grammar:** remove/cut a wall to see inside (cut edges in a light pink "section" colour), lift lids, open boxes.
- **Camera:** a distinct set-up per beat (exterior low/3-4 angle, interior close, oblique overhead, high 3-4 over a desk
  prop, low aisle), at least five meaningful cuts per 30 s; eased crane/dolly moves only — never a lens drifting over a
  static page, no camera bobbing; restrained depth of field (bokeh focus on the subject, small aperture; overheads nearly sharp).
- **Sensing/measurement effects are the measurement:** e.g. one lidar sweep computed by ray casting against the set, dots
  only where rays hit; no decorative looping lines; stylised, not a dangerous-beam demo.
- **Labels:** only useful steps, no dense labelling; at most one small readout when it carries the idea (e.g. a stopwatch).
- **Signature/CTA:** a small physical paper sign with the app icon + "Media Diet" in the final 3–4 s, voiced CTA
  ("Follow Media Diet for technology explained."); no intrusive ad, no invented app capability.
- Implementation used (replaceable): three.js 0.170 (shadow-mapped MeshStandardMaterial paper, BokehPass, MSAA target),
  SwiftShader in headless Chromium; 2-D overlay canvas for captions/readouts; ≈ 2.8 s/frame on 4 CPU cores.

### Caption & safe areas (supersedes the y 350–470 rule)
- Leave y < 300 clear of meaningful text. Captions in the upper safe region below account overlays: **ink y 340–520,
  x 90–990, max two readable lines (50 px Space Grotesk 700), no overlaps**, soft dark band behind for legibility.
- Keep crucial diagrams/mechanism out of side and bottom UI areas (mechanism action roughly x 120–960, y 540–1550).
- Re-render if text is small, obstructed, or a scene is static.

### Audio (additions)
- Music subtle and sustained; **no repetitive loops or ostinatos** (removed after feedback); voice clearly upfront.
- Foley tied to on-screen physical events (paper rustle, taps on cuts, pulse ticks, one sweep sound per real scan).
- Voice unchanged: Kokoro-82M v1.0 af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (cached model reused).

### Script rules (additions)
- Strong opening question, mechanism narrated as it is shown, clear takeaway, short natural CTA in the last 3–4 s.
- Express material qualifications briefly inside the relevant sentence (e.g. "a lidar-equipped robot", not "all robots");
  no long generic disclaimers, no filler, no motivational claims.

### Delivery path for feedback rounds
`videos/media-diet/production/30s/2026-11-02-feedback-round/media-diet-30s-feedback-01.mp4`; production notes, code and
QA stay in the repo; only finished MP4s go to a local review folder.
