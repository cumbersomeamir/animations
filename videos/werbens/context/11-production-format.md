# 11 — Production format (durable context for future rounds; no automation created)

Approved round: `production-30s-2026-11-02`. App Werbens · com.werbens.app · branch `claude-video/werbens`.
This file records the recurring format so later episodes (manual or automated later) stay consistent.

## Channel genre (locked)
Marketing and brand campaign breakdowns, advertising and consumer psychology. Educational, not app ads: each episode teaches
one usable idea; the app appears only as a subtle signature.

## Art-direction skill (exact)
- **Living Screencast** — https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/living-screencast/STYLE.md
  (module `styles/living-screencast/STYLE.md`; fetched read-only from raw.githubusercontent.com on 2026-11-02, 11,503 bytes).
  Used as art-direction text only. Nothing from that repository was cloned, installed or executed; `DEMO.md` and its `demo/`
  engine were not read or used. All code is original (`production/30s/<date>/src`).
- **Applied rules:** a redrawn 2D HTML/CSS/SVG interface (no screenshots) floating on wallpaper with a soft shadow; a
  square-pixel mascot on one sacred grid (16×20 sprite, 5 world px per pixel, positions snapped to half-pixels) that
  stands only on top edges of real UI elements, measured from the live DOM every frame. Two actors: cursor = user, mascot =
  the expertise/agency (no hands on screen). Recording-software camera: zoom ≥ 1, push-ins to the action, slow holds,
  whip pans with anisotropic motion blur on an untransformed wrapper only during whips, push-in + vignette "spotlight freeze"
  on the one promise, pull-back to the full window for the summary. Mascot acting: anticipation crouch, stretch, tuck,
  landing squash + pixel dust, idle beat-breathing, irregular blinks, eyes carry the acting. Native moves used: moving floor
  (mascot rides a dragged card), diegetic title (window title), karaoke-ball words, spotlight freeze, the film changes state
  (rain escapes the ad and takes over the film, then returns), ending "mascot goes to sleep as the window dims".
  Sound: hi-fi layer (piano, upright bass, brushes, glockenspiel) + chiptune square voice for the mascot; foley (trackpad
  clicks, key thocks, swishes, pops, chimes, ticks); a drop to room tone before the key promise; a held pad under the freeze.
- **Adaptations (documented deviations):** (1) the skill expects a *real* product UI; this channel teaches marketing, so the
  workspace is an original, explicitly labelled fictional "Campaign Board" ("ILLUSTRATIVE MOCK-UP", "Fictional brand") — it
  is not Werbens' UI and implies no Werbens feature. (2) Captions move from bottom to the brief's **upper-centre** zone.
  (3) The chapter pill is made diegetic (a 01–04 stepper in the window toolbar) so the top 0–300 px stays free.
  (4) Keystroke HUD sits just below the subject band (non-essential). (5) Mascot colour = the Werbens violet (series
  "brand mascot colour" rule); the UI is a light theme so the violet sprite still finds the eye.

## Recurring format
- 30.000 s · 1080×1920 portrait · 30 fps · 900 frames · H.264 High yuv420p · AAC-LC 48 kHz stereo · `+faststart`.
- Storyboard: hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · elegant end 29–30 s.
- One continuous screen-recording take inside one workspace (cuts only as whips/pixel wipes); the screen becomes the stage.
- Cast continuity: "Pixel Pip" = the series host Pip (education pilot 01) redrawn as a pixel sprite (violet body,
  lavender tilted beret). Keep the sprite, palette and behaviours stable; change the workspace content per episode.
- Fictional products/brands only, labelled on screen; no real-brand UI, no untested product claims, no invented data.

## Palette (from `assets/icon.png`)
> **Corrected 2026-11-03 — see `context/15-brand-correction-2026-11-03.md`:** measured app primary #573EEC, light #AEA2F4,
> background #F7F8FA, card border #E4E7EB, text #101114, grey #8C93A1, icon #6435FC; official logo = Play icon + werbens.com
> lockup. The palette lines below are historical.
Violet `#6234FB`, deep violet `#4A1FD6`, lavender `#CCC0F7`, pale `#F0EAFC`, white `#FEFEFD`; ink `#1B1433` (derived);
UI greys are lavender-tinted (`#E3DCF8` lines, `#8A82AE` secondary text). Wallpaper: violet gradient `#2A137A → #6234FB → #8C6CFB`.

## Caption + safe areas (portrait)
- Captions: upper-centre frosted pill; 50 px Inter Display ExtraBold, 58 px line height; **text in y 350–470**; horizontal
  margins ≥ 80 px; max 2 short lines; split into word groups (never squeeze); words brighten as spoken; ≤ 1 accent colour.
- Top 0–300 px: no overlays or essential content. Subject band (camera viewport for focus rects): x 80–1000, **y 510–1470**;
  every camera move interpolates focus rectangles mapped into this band, and each rect includes ~150 px headroom above
  anchor edges for the mascot, so the safe area holds during camera motion. Bottom overlay region (≈ y > 1480) holds only the
  transient keystroke HUD. QA script `src/qa_dom.mjs` verifies caption bounds and mascot/caption overlap every 1/6 s.
- Signature: window status bar "Werbens · Marketing craft" with the icon (diegetic, subtle). No CTA, no store badge.

## Audio configuration (agreed "Meshline" Kokoro voice)
- Kokoro-82M v1.0 ONNX q8 (`onnx-community/Kokoro-82M-v1.0-ONNX`, Apache-2.0) via kokoro-js 1.2.1; style-vector blend
  **af_bella 0.7 + am_puck 0.3**, **speed 0.98**, **en-us** G2P (af_bella / "a"). Weights reused from
  `education/pilot-01/node_modules/@huggingface/transformers/.cache` (no re-download). Phoneme override
  `wˈɔːɾɚɹᵻsˈɪstənt → wˈɔːtɚ ɹɪzˈɪstənt` ("water-resistant" was heard as "water-assistant").
- One Whisper base.en timing pass (word times piecewise-anchored, in order, to measured pauses) + one ASR pass on the
  final mix. Mix: voice up front; music ducked −9 dB and SFX −4 dB under speech; two-pass loudnorm to **−15 LUFS**,
  TP target −1.5 dBTP (accept −14…−16 LUFS, TP ≤ −1 dBTP). Score/foley fully synthesised in `src/audio.mjs` (original).

## Pipeline + QA checklist
`build.sh`: npm ci → tts → words → audio → render (DOM frames, ~0.37 s/frame) → mux → `qa.sh` (ffprobe, frame count, full
decode, loudness/true peak, 1-fps contact sheet, transition sheet, frames, spectrogram) → `qa_dom.mjs` → `asr_mix.mjs`.
Inspect transitions + full contact sheet, caption bounds, factual accuracy (claim map), provenance/licensing, audio.
Publishing: `publishing-caption.txt` — concise English caption + checked source links, no engagement bait.

## Update — batch-02 (2026-11-02): latest user feedback (overrides earlier style details)
- Keep the approved **violet Living Screencast performer + workspace** (Campaign Board window, Pixel Pip, cursor). Do not
  introduce new characters; keep the accepted app identity (subtle status-bar signature only).
- **Historical / real-brand ads:** show only an *original analytical reconstruction*, clearly labelled on screen
  ("ANALYTICAL RECONSTRUCTION … NOT THE ORIGINAL AD"): drawn silhouettes, layout proportions and greeked copy; never the
  brand's photo, logo or body copy, and **no performance statistics** (even if the original ad printed some). Short quoted
  headlines are fine for commentary. Comparisons use a *generic* layout labelled "illustrative, not a real ad".
- **Verify dates and attributions** against institutional/primary sources before scripting (e.g. German Historical
  Institute, museum collection records such as The Henry Ford); record exact quotes in the episode file. Fix draft errors
  (batch-02: the car sits *above* the headline, not beneath it; 1959 is the campaign/account date).
- Scene language per episode: blank canvas → structure/hierarchy → contrast → original worked example → takeaway freeze →
  pull-back → mascot sleeps. Transitions are UI-native (asset drag, resize handle, tabs, Compare split view, page swap,
  rack focus, template ghost) — whip blur only when a cut-across-panes is really needed; slow moves stay sharp.
- End every lesson with an **original fictional example** (labelled) that applies the idea, not a copy of the case study.
- Script length: about 65–80 words for 30 s (batch-02: 73 words, 24.7 s of speech); tighten for accuracy before timing.

## Update — feedback round (2026-11-02): latest user feedback (SUPERSEDES conflicting rules above)
Applies from episode 03 on. Where this section conflicts with "Art-direction skill", "Recurring format", "Caption + safe
areas" or "Update — batch-02" above, this section wins. Living Screencast / Pixel Pip are no longer required.

### Format rules (current)
- Exactly 30.000 s · 1080×1920 · 30 fps · H.264 yuv420p + AAC · English voiceover. Strong opening (motion in the first
  frames), distinct scenes that show the mechanism *as it is narrated*, a clear takeaway, and a short natural brand/action
  CTA in the **final 3–4 s** (e.g. "Follow Werbens to decode how brands sell." with the icon tile + wordmark).
- Captions: upper safe region below platform account overlays — **y < 300 kept clear of meaningful text; caption ink
  ≈ y 340–520; x 90–990; ≤ 2 readable lines; never overlapping labels or hero objects**. Crucial diagrams/labels stay in
  x 80–1000 and y 300–1560 (clear of side buttons and the bottom caption/UI band). A static page with camera bobbing, a source
  or contact sheet is not a deliverable; re-render if text is small, obstructed or a scene is static.
- Content: research claims against reliable original sources (papers/textbooks/institutions); record them in the episode file
  and `publishing-caption.txt`. Useful and easy for a general viewer; no filler, empty motivational lines or long generic
  disclaimers — put any material qualification briefly inside the relevant sentence ("can", "illustrative menu"). No invented
  app capability, guarantee, statistic, income or testimonial. Example prices/products are invented and labelled once.
- Audio: subtle music, clear voice, **no repetitive distracting loops** (no constant hats/arpeggios/bass patterns); the
  cached Meshline/Recall voice (Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98) and cached weights; no paid API.
- Delivery: MP4 attached in chat + pushed to `production/30s/<round>/<app-slug>-30s-<name>.mp4`; production notes, source and
  QA stay in the repo. Verify duration/codecs, full FFmpeg decode, narration timing and representative transition frames.

### Style recipe — "Satisfying Product Theatre" (the style is these rules, not the renderer)
1. **Stage:** one seamless light studio sweep (floor curving into a backdrop, `#F4F2F8` on `#F1EFF6`), lots of white/light
   neutral negative space. No presenter, mascot, UI window or busy background.
2. **Hero objects:** 1–3 uncluttered physical objects per shot, built from original procedural geometry (lathe/rounded
   boxes), smooth clearcoat materials; Werbens violet `#6234FB` / deep `#4A1FD6` as the hero accent, lavender `#CCC0F7` and
   white as secondary. Objects that represent quantities are geometrically honest (e.g. cup scale ∝ ∛volume).
3. **Light + shadow:** soft key from upper left, cool rim from behind, hemisphere fill; soft shadow-map shadows **plus** a
   radial contact-shadow decal under every object that tightens and darkens as it nears the floor (anticipation cue); objects
   in the air cast only the decal (no stray far-off shadow blobs).
4. **Motion grammar (tactile):** drops with near-impact slow motion (fast fall → slow hover just above the floor → snap),
   landing squash-and-stretch + a small dust ring; pops (lids lift and fade), hops, slides with friction; suspense holds
   before an impact (a suspended ball hovering, music thinning to a fifth); impacts that crush/flatten; slicing progressions
   (a ring tightens, snaps, the piece lifts off on an arc and is set down with a squash); a simple object that breaks the
   pattern. Never keep the viewer waiting for an undelivered payoff — every anticipation resolves within ~1 s.
5. **Deliberate shape/scale changes timed to words:** each spoken idea gets exactly one physical change (land, lift,
   transform to measuring glass, grey-out, hop, crush, cut). Change lands on or just before the key word.
6. **Camera:** slow dolly between 3–4 hero framings (wide → close two-object comparison → wide → push-in for the CTA); no
   bobbing, no shake, no whip pans; framing keeps objects in x 90–990 and below the caption band.
7. **Labels:** few, large, object-anchored labels (white cards 220 px: name 25 px, ml 40 px, price 50 px; violet/ink notes
   36 px); appear with a back-out pop; one "illustrative" label per invented example.
8. **Sound:** foley matched to each physical action (thud by object size, lid pop, glass shimmer, pour, coin clink, creak,
   whoosh, squash, slide, zip + snap, tile thud); music = one held, evolving pad chord per scene + a few event-tied piano
   notes, no grid; voice ducks music −10 dB / SFX −4 dB; −15 LUFS, TP ≤ −1.5 dBTP; foley kept off word onsets where possible.
9. **Pipeline (low-cost, offline):** Three.js 0.180.0 in headless Chromium (SwiftShader WebGL2, deterministic `frame(t)`),
   PNG frames piped to FFmpeg libx264 crf 16; no Blender, no GPU, no paid services. DOM QA of captions/labels every 1/3 s.

## Episode log (do not repeat topics)
| # | Folder | Topic | Case / example |
|---|---|---|---|
| 01 | `production/30s/2026-11-02/` | A feature is not yet a benefit | fictional backpack (water-resistant ≠ waterproof) |
| 02 | `production/30s/2026-11-02-batch-02/` | The ad that admits a weakness | VW "Think small." (1959, DDB) reconstruction → fictional compact tool |
| 03 | `production/30s/2026-11-02-feedback-round/` | The decoy effect (Satisfying Product Theatre) | illustrative coffee menu: small 150 ml Rs90 · medium 280 ml Rs155 (decoy) · large 300 ml Rs160 |
| 04 | `production/30s/2026-11-03-round-02/` | One shape, everywhere — distinctive brand assets (accepted style; brand colours/logo corrected, context/15) | fictional "Plimm Bakery" arch on logo tile, bag and sign |
| 05 | `production/30s/2026-11-03-hindi-03/` | विशेषण नहीं, सबूत दिखाइए — show it working, not adjectives (**Hindi**, Devanagari captions; app.werbens.com palette/logo, context/17) | fictional non-stick tawa + oil-free dosa demo |
| 06 | `production/30s/2026-11-04-hindi-04/` | एक ईमानदार पहले/बाद का शॉट — a fair before/after (same frame, same light, no filter) beats "premium quality" (**Hindi**; app.werbens.com palette) | fictional lint roller, one pass over half a sweater |
| 07 | `production/30s/2026-11-05-feedback-05/` | एक प्रोडक्ट, एक कीमत, एक काम — offer clarity vs adjective clutter (**Hindi**; app.werbens.com palette; batch 2026-11-05-feedback-05) | fictional restaurant ad "काल्पनिक रसोई": thali photo, ₹250, "अभी ऑर्डर करें" |
| 08 | `production/30s/2026-11-06-english-06/` | 75% lean or 25% fat? — attribute framing: same product, same numbers, different frame; tasting narrows the effect (**English** narration + captions, Meshline voice; app.werbens.com palette; batch 2026-11-06-english-06; suggested backpack topic replaced as a duplicate of #01/#05/#06) | two unbranded fictional mince trays, "75% LEAN" vs "25% FAT", Levin & Gaeth (1988) |

## Pronunciation overrides learned (Kokoro, en-us)
- `wˈɔːɾɚɹᵻsˈɪstənt → wˈɔːtɚ ɹɪzˈɪstənt` ("water-resistant", heard as "water-assistant").
- `tə kˈɑːpi → tˈuː kˈɑːpi` (weak "to" before "copy" was heard as "a copy").
- `wˈɜːbənz → wˈɜɹbɛnz` ("Werbens"; Whisper base.en still writes "Warbins"/"Wurbins" — vocabulary limit; spelling shown on screen).
- `fˈɜːst → fˈɜɹst` ("first"; Kokoro G2P returned the non-rhotic vowel for en-us — english-06).
