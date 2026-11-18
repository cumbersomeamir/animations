# 35 — Continuation note: account move, 18 Nov 2026

**Why this file exists:** on 18 Nov 2026 the user moved the Tensorblue app to another Claude account because the previous one ("info") was exhausted. The user expressly authorised an **app-isolated continuation**:
- only `cumbersomeamir/animations`, branch `claude-video/tensorblue`;
- none of the new account's other apps;
- other apps' briefs, context and assets are not read.

The old chat had submitted neither episode 20 nor 21. The move replaced their pending assignments with:
- **batch20** (`2026-11-17-english-20`, finish first): how WhatsApp kept messages from disappearing on a bad connection;
- **batch21** (`2026-11-18-english-21`): why a progress bar races to 99 % and then gets stuck.

## State found on the branch (checked before any work)
- `git fetch origin claude-video/tensorblue`: the head was `e8e9a3d` (english-19). The production folders ran from `2026-11-02` to `2026-11-17-english-19`.
- No english-20 or english-21 folder or commit existed, so nothing was duplicated or overwritten.
- All context files `00`, `11`, `12`–`32` were read in order before creative work, along with the english-19 source (`scene.mjs`, `brt.mjs`, `stage3d.mjs`, `mix.py`, QA scripts), its assets (fonts, logo + `SOURCE.md`) and its audio/QA outputs.

## What was restored in the fresh container (nothing is committed except source)
| item | how | check |
|---|---|---|
| Python 3.12 venv (outside the repo, `/home/user/tbenv/venv`) | `torch==2.15.0` from the PyTorch CPU index; `requirements-audio.txt` from PyPI (kokoro 0.9.4, misaki 0.9.4, spaCy 3.7.5, numpy 1.26.4, scipy 1.14.1, soundfile 0.14.0, pyloudnorm 0.2.0, faster-whisper 1.2.1, ctranslate2 4.8.4) | `pip freeze` matches the pins |
| spaCy `en_core_web_sm` 3.7.1 | `spacy/en_core_web_sm` (Hugging Face) rev `8fb6f8155286360bf5486fe399e2738d1df7ded2` | sha256 `86cc141f…3889` matches the pinned value |
| Kokoro-82M | `hexgrad/Kokoro-82M` rev `f3ff3571791e39611d31c381e3a41a3af07b4987`: `config.json`, `kokoro-v1_0.pth`, `voices/af_bella.pt`, `voices/am_puck.pt` | same revision as every earlier round |
| ASR model | `Systran/faster-whisper-base.en` rev `3d3d5dee…` | same revision |
| npm | `npm ci` in each round's `src/` (`@napi-rs/canvas` 1.1.0) | lockfile |

**Offline gotcha:** files fetched by pinned revision leave no `refs/main` in the HF cache. Write the pinned hash into `~/.cache/huggingface/hub/models--hexgrad--Kokoro-82M/refs/main` (and the same for `models--Systran--faster-whisper-base.en`), or `HF_HUB_OFFLINE=1` fails to resolve the model.

## Kept exactly (approved)
- **Voice:** Kokoro `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98.
- **CTA:** the line "Follow Tensorblue for software explained simply." and the end card (logo drop, wordmark, Follow pill).
- **Captions:** Inter SemiBold 54 px, house band y 340–520, centred x 500.
- **Palette and logo:** re-checked on tensorblue.com on 2026-11-18. The palette is unchanged, the Tailwind tokens are still defined, and the logo SVG is byte-identical.
- **Structure:** the frame-zero rule and the Theory of Marketing structure.

## New on 2026-11-18 (feedback for this app)
The latest Published apps "Satisfied?" feedback for Tensorblue: "No, content is shit, make it about app development or something cool that some app did in the past, motion graphics lack 3d depth and are not fun at all." The response is recorded in the feedback log of `11-production-format.md`, in `33-…` (english-20) and in `34-…` (english-21). In short:
- **Content:** a real app's documented behaviour or a practical app-development insight, with an app-builder payoff.
- **Depth:** the new `toy3d.mjs` (thick lit extruded toys, fog, depth layouts, foreground framing).
- **Fun:** hops with squash-and-stretch, falls, pops, tokens flying back, and playful SFX.

## Status at the end of this continuation (18 Nov 2026)
| batch | folder | output | context | commit |
|---|---|---|---|---|
| batch20 (finished first) | `production/30s/2026-11-17-english-20/` | `tensorblue-30s-english20-01.mp4` + thumbnail, attached in chat | `33-production-30s-english20-01.md` | `b9b2699` |
| batch21 | `production/30s/2026-11-18-english-21/` | `tensorblue-30s-english21-01.mp4` + thumbnail, attached in chat | `34-production-30s-english21-01.md` | the commit that adds this section |

There are no pending, queued or checkpointed jobs, and no scheduled automations. The next round starts by reading `00`, `11` and the latest round file (34), then this note. Toolchain restore steps are above.
