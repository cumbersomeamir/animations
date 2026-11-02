# License and provenance notes: Pilot 01

| element | origin | license / status |
|---|---|---|
| All animation, the workshop, the machine, the cutaway, Bindu (character, rig, model sheet), the banner and the captions | Original procedural code in `src/` written in this session | Original work for Aarambh (owner: the repository owner). No third-party artwork, logos or templates |
| Bindu's name and design | Original. Not derived from either reference account (Sticky / BreakingBreach) or any named character | Original |
| App signature "✦ Aarambh" | Typeset in Fraunces. The star is redrawn from the icon motif in `assets/icon.png` (approved app asset, 03-assets.json) | App's own mark |
| Palette | Sampled from `videos/aarambh/assets/icon.png` (#05473A, #FBF7EE, #F1B444) | App's own asset |
| Fonts | Fraunces 800 and Inter 500/700/800 via `@fontsource/fraunces@5.3.0` and `@fontsource/inter@5.3.0` (npm) | SIL Open Font License 1.1 |
| Renderer | `@napi-rs/canvas@1.0.11` (npm, Skia bindings) and FFmpeg 6.1 (libx264, AAC, librubberband) | MIT; FFmpeg LGPL/GPL build (tool use only, nothing redistributed) |
| Music | Original procedural composition (`audio/build_audio.py`: additive hammered-string plucks, pads, bass, bells) | Original |
| SFX | Original procedural synthesis (filtered noise, chirps, clicks, thumps, bell partials) in `audio/build_audio.py` | Original |
| Narration text | Original script (`audio/script.json`) | Original |
| Narration voice | Piper TTS (`piper-tts==1.8.0`, OHF-Voice) with voice model **en_US-ljspeech-medium** (rhasspy/piper-voices). Model card: dataset **LJ Speech, "License: public domain"**, trained from scratch. Model sha256 `6f52a751…7f22`. The raw TTS is turned into Bindu's voice by an original processing chain: rubberband pitch ×1.08 with shifted formants, EQ and compression (`audio/build_audio.py: VOICE_CHAIN`) | Dataset public domain; piper-tts is GPL-3.0 (used as a tool, nothing redistributed). Raw and processed takes are committed (`audio/narration/raw`, `audio/narration`) |
| Voice imitation | None. No named actor or character (e.g. Rick Sanchez) is imitated. Neither reference channel's voice was heard or used | — |
| QA-only tools | faster-whisper 1.1.1 (MIT) with the `tiny.en` model (Systran, MIT), used only to measure intelligibility (`tools/asr_check.py`). Not used for rendering | MIT |

**Paid APIs, subscriptions, secrets, Blender, unreviewed third-party scripts:** none were used.
**Downloads:** the Piper voice model (63 MB) is needed only to regenerate narration. The committed WAVs
mean rendering never blocks on it. The ASR model (75 MB) is QA-only.
