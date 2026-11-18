# 34 — Continuation note (2026-11-18): account move, batch 20 + batch 21 (English)

## Why this session exists
- The user expressly authorised moving this app's work to a new isolated Claude Code continuation on 2026-11-18 because the earlier account (info@tensorblue.com) was exhausted. Same repo `cumbersomeamir/animations`, same branch `claude-video/nutriai`, same workspace `videos/nutriai/`. No other app branch, folder or chat was read.
- The old chat had submitted neither episode 20 nor 21; this session replaces both pending assignments: first the missing batch 20, then exactly one batch 21. Both English, 30 s, same approved visuals; no Hindi.

## Restore record (what was re-initialised, nothing invented)
- Read in order: CLAUDE.md → START_HERE.md → context 00–05 → `.claude/skills/animation-direction/SKILL.md` → context 06–33 (all episodes, production format 11, feedback rules 25 with addenda) → english-19 source (`render.mjs`, `timeline.json`, `script.json`, `audio/mix.py`, `audio/voice_kokoro.py`), QA.md, SOURCES.md; egg (english-07), avocado (english-09) and kiwi (english-19) sheets inspected.
- Remote check: origin `claude-video/nutriai` head was `46e4873` (english-19 kiwi); no english-20 or english-21 folder or commit existed locally or on the remote branch, so nothing was duplicated.
- Toolchain: `npm ci` in `videos/nutriai/source/` (`@napi-rs/canvas` 1.1.0 pinned); Python venv in the session scratchpad (not committed) with `kokoro-onnx`, `numpy`, `scipy`, `faster-whisper==1.2.1`; Kokoro release `model-files-v1.0` (`kokoro-v1.0.onnx` sha256 7d5df8ec…a6c5, `voices-v1.0.bin` sha256 bca610b8…bf7d) downloaded to the scratchpad. USDA bulk files re-downloaded and verified against the hashes recorded in earlier episodes: `FoodData_Central_sr_legacy_food_json_2021-10-28.zip` sha256 789240d4…f96bc7, `sr28asc.zip` sha256 8308fd1d…ee70a.
- Voice: unchanged Meshline blend (Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98); the CTA is the cached accepted take (byte-identical to english-06…19).

## Latest live feedback (Published apps, Satisfied?, applies to this app only; received with the 18 November brief)
"No, earlier videos which were created has variety, they were fun, better first frame/thumbnail, but since we shifted to this format engagement has dropped, one of the posts have been promoted so dont get confused by it's views. text is too small, not cool enough motion graphics see the earlier egg video, or avocado video or dragonfruit video. I need something like that bro."
How it is applied from english-20 on (creative decisions, recorded here so later episodes keep them):
- Text: captions 84 px (auto-fit, never below 66 px) instead of 64 px; numbers 150–220 px; no sublabel under 44 px.
- Motion graphics: smooth 30 fps motion (the engraved line boil still steps at 15 drawings/s), whip-pan scene changes with speed lines instead of the soft gleam wipe, parallax background layers (rotating rays, floating bokeh) for depth, squash-and-stretch landings, impact shakes, particles, kinetic count-up numbers with overshoot and a shine sweep.
- Variety and fun: one playful original food character per episode (simple eyes, blinks, reactions), a different scene colour per beat, real transformations (crack, pour, stack, split).
- No dragonfruit episode or asset exists in this app's history; nothing was guessed for it. No engagement is inferred from the promoted post.

## Topic decisions
- Batch 20, pistachios (shell weight vs edible weight, per-100 g kernel breakdown, practical portion): never covered (peanuts were english-06; no pistachio anywhere in this app) → requested topic used. Details: `35-production-30s-english20-pistachios.md`.
- Batch 21, "roasted chickpeas vs cooked chickpeas: same food, water changes calories per gram": already produced as english-10 (`23-production-30s-english10-chickpeas.md`, 2026-11-09: same USDA records, same water-removal mechanism, same snack-portion payoff). Water-per-gram stories also carried english-08 (raisins), english-13 (rice) and english-17 (watermelon). Replacement chosen and explained in `36-production-30s-english21-*.md`.
