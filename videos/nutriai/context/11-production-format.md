# 11 — Production format (durable; NutriAI)

Episodes: #01 mango (`12-production-30s-01.md`), #02 guava (`13-production-30s-02.md`), #03 pomegranate (`14-production-30s-pomegranate.md`, 2026-11-03), round-02 #01 papaya (`15-production-30s-round02-papaya.md`, 2026-11-03), Hindi #03 orange (`16-production-30s-hindi03-orange.md`, 2026-11-03; Hindi narration/captions, Kokoro Hindi voice hf_beta, Noto Sans Devanagari).

Public app name from 2026-11-03: **CalMeter** (user request). Spoken end line "Track your food and nutrition with CalMeter." (Kokoro phoneme override `kˈælmˌiːtɚ` for the brand word). Style, typography, audio and caption rules below are unchanged.

Durable context for future production rounds. No automation is created by this file.

## Channel genre (locked)
Ingredient-by-ingredient nutrient and calorie breakdowns: what a measured portion of one food contributes. One food, one portion, one concept per video. Educational, not an app ad.

## Visual skill (locked for this format)
- **Copperplate Engraving**: https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/engraving/STYLE.md (read-only art direction; STYLE.md sha256 0c6816b8…ac0d, read 2026-11-02). Its `demo/engine/` was **not** cloned or run; all drawing is original Canvas2D code (`@napi-rs/canvas`, already installed in `videos/nutriai/source/`).
- Module used in production 01: `videos/nutriai/production/30s/2026-11-02/source/render.mjs` (burin stroke, analytic body to form-following hatch families, cutaway section, roundels, wash, balance vignette, captions with logged bounds).

## Recurring format / scene rules
- **One continuous engraved natural-history plate** per video (plate mark + ruled border + cut title), dark leaf-green paper with pale ink. No talking mascot, no text slides.
- Story grammar (30 s): hook 0–3 s (recognisable, appetising food engraved, then hand-coloured) → setup 3–8 s (measure the edible portion: cut/burnish/re-cut to the cutaway; removed parts labelled; balance vignette "100 g") → mechanism 8–23 s (magnification roundels flown in on the spoken numbers; leaders to the part) → takeaway 23–29 s (database-average caveat + portion-first message; camera pull-back) → end 29–30 s (finished plate, credit line, tiny signature).
- Engraving rules applied: tone from lines only (no grey fills in the ink); every line swells/tapers (w·(0.2+0.8·sin(πu)^0.7), 22 % end tapers); hatch families follow the form and switch on by tone (0.14 / 0.5 / 0.75); one light from the upper left; colour = transparent wash laid under the ink after the print, blooming from one point with a ragged front, colour only on the taught part (edible flesh), never on removed parts; transitions from printmaking (cut, burnish and re-cut, roundels flown in, letters cut), no dissolves for the subject.
- Stop motion: 15 drawings/s held 2 frames each, deterministic line boil.
- Camera: a loupe over the sheet. Opening push/pull-out, at most gentle push-ins (≤ 8 %), the safe area must survive every move.
- Food stays recognisable: the whole fruit opens the film and the stem + leaf stay on the plate through the cutaway.

## Facts
- One authoritative database entry per episode (default USDA FoodData Central), exact preparation and portion basis (per 100 g edible portion), refuse stated (SR28 FOOD_DES refuse description), values rounded honestly; on-screen source line; claim-to-source table in the episode doc. No health cures, daily-value claims or comparisons unless separately sourced.

## Audio configuration
- Voice: Kokoro-82M ONNX (kokoro-onnx; release model-files-v1.0: `kokoro-v1.0.onnx`, `voices-v1.0.bin`), **Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, lang en-us**. One take per sentence, cached in the episode's `source/audio/voice-takes/` and reused. No Piper, no imitation of a named voice.
- Music: original, synthesized dry harpsichord-like plucks while lines are cut, soft held chords when colour arrives, resolve at the end; ducked about 55 % under speech.
- SFX (synthesized, event-linked): burin micro-scratches, long-cut scrape, burnisher rub, water plip for washes, ting for scribed roundels, clink for the balance, cut-letter ticks.
- Master: two-pass loudnorm −15 LUFS integrated, true peak ≤ −1.5 dBTP, 48 kHz stereo AAC 192k.

## Palette (from `videos/nutriai/assets/icon.png`)
Ink `#151E16` · leaf `#5AB626` · green `#86DA3F` · lime `#A6E955` · leaf-dark `#2F7A1C` · mist `#EDF6E5`. Plate paper `#0D150F`, engraving ink `#E9E3CD`. Food washes in natural colours (mango golden `#EBA92E`, blush `#C43A24`, flesh `#E58C1C`). Fonts: Inter / Inter Display (vendored, OFL).

## Caption safe areas (1080×1920)
- Captions screen-fixed, upper centre, **ink inside y 350–470**, x margins ≥ 80 px (x 80–1000), max 2 short lines (58 px Inter Display Black; line baselines 404 and 458), word groups appear in step with speech; caption blocks never overlap (out before the next block's in).
- Top 0–300 px unobstructed. Plate content starts below y ≈ 490 at every camera position; essential facts stay above y ≈ 1550 (bottom overlay region kept for the source line / signature only).
- QA: every drawn text run is logged with device-space bounds (`build/textlog.json`) and checked.

## Latest user feedback (batch-02, 2026-11-02): this overrides earlier style details above
- **Ground and contrast:** ivory paper (`#F4EEDC`) with deep-ink engraving and labels (`#16201A`), higher contrast. The dark-plate look of #01 is retired for new episodes.
- **Colour:** washes multiply under the ink and are clipped to their own region (rings via even-odd clip, never flooding the whole section): clear leaf green for skin/leaves (`#7DC043` / `#5AB626`), the food's true flesh colour bright (guava coral `#F0705B`, light coral `#F9B6A3`); caption line 1 deep ink, line 2 leaf-dark `#2F7A1C`.
- **Larger cutaway:** the section is the hero (about 600 px across), with roundels underneath; whole fruit + leaf open the film.
- **Sound (replaces the old music completely):** voice-forward; very quiet original warm ambient bed (slow cross-fading chords + air, no beat, no repeating figure); subtle fruit-slice, juice and page/pencil foley on events; no reused track.
- **Script:** 65–80 words, about 30 s natural delivery, hook question first; every public claim mapped to a primary/institutional source (USDA FDC record + SR28 refuse/portion; NIH MedlinePlus for nutrient functions); use specific, sourced function statements (e.g. "fibre aids digestion", "vitamin C helps the body make collagen"), never cures; end with a practical portion payoff (USDA single-fruit weight vs 100 g on the balance).
- **Mechanism must be visible:** each spoken function gets a scene change (roundel enlarges and its engraved motif animates the idea).
