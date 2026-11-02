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

## Episode log (do not repeat topics)
| # | Folder | Topic | Case / example |
|---|---|---|---|
| 01 | `production/30s/2026-11-02/` | A feature is not yet a benefit | fictional backpack (water-resistant ≠ waterproof) |
| 02 | `production/30s/2026-11-02-batch-02/` | The ad that admits a weakness | VW "Think small." (1959, DDB) reconstruction → fictional compact tool |

## Pronunciation overrides learned (Kokoro, en-us)
- `wˈɔːɾɚɹᵻsˈɪstənt → wˈɔːtɚ ɹɪzˈɪstənt` ("water-resistant", heard as "water-assistant").
- `tə kˈɑːpi → tˈuː kˈɑːpi` (weak "to" before "copy" was heard as "a copy").
