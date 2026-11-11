# 25 — Approved feedback rules for CalMeter educational episodes (from "Published apps", Satisfied? column, read 11 November 2026)

Status: approved by the user on 2026-11-11. These rules apply to every next educational episode of this app and take precedence over older format notes in `11-production-format.md` where they differ (caption zone, text size, plate layout). Facts, voice, palette and the engraving art direction stay as recorded there.

## Scope and isolation
- Work in this app's existing Claude Code conversation, its mapped account, repo `cumbersomeamir/animations`, branch `claude-video/nutriai`. Read the approved context, style skill and previous topics first.
- Never borrow another app's visuals, voice, CTA or assets. Never overwrite earlier outputs. Educational app-channel episodes are separate from any unrelated "Discover" short-film request.

## Deliverable
- An actual rendered 30.000 s, 1080×1920, H.264 yuv420p MP4 with AAC; English voice-over and English captions only (no Hindi); the established narrator (Meshline/Recall Kokoro blend). No Blender, no paid APIs. Existing approved motion skill and assets, with only the changes below.
- A separate, attractive vertical thumbnail tied to the hook, with 2–4 large words.
- Completed MP4s only go to the user's review folder when downloaded; production source, citations, prompts and QA stay outside video-review (in the episode folder of this repo).

## Story structure ("Theory of Marketing")
thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
- Hook answers "why do I care"; build-up sustains one specific question; proof makes the answer credible; payoff gives useful knowledge; CTA gives a relevant next step.
- Suspense only from a real unanswered question, never from false claims. Do not repeat the answer in every scene; no generic padding.
- Pacing (adapt naturally, always 30 s): 0–3 s immediate striking image + hook; 3–5 s optional escalation; 5–21 s visual explanation and proof with scene changes; 21–27 s resolve the question with a concrete takeaway; 27–30 s concise app-relevant CTA.

## Visual rules
- One visual idea at a time; no paragraph cards. On-screen labels large and brief; the voice explains the detail.
- Captions readable inside x 100–900, y 230–1500, clear of platform overlays. Caption, diagram labels and explanatory text never compete on screen at the same time.
- Reveal diagrams sequentially; deliberate depth, lighting and transitions; no decorative distracting lines; meaningful motion that explains the topic.
- Design direction (feedback 2026-11-11): return to the fun, varied composition of the egg (english-07) and avocado (english-09) episodes — one large hero food per scene, real transformations (cut, pour, fry, balance, morph), big roundel numbers — with a stronger first frame and thumbnail, larger text and better motion. Do not keep the newer rigid table/ledger format of english-10/11. ("Dragonfruit" was named too, but no dragonfruit episode or asset exists in this app's history; nothing was guessed for it.)

## Facts and claims
- Verify every factual claim from primary or reliable sources before the final script; distinguish measured facts, estimates and illustrative assumptions; sources go in the project notes, not on screen clutter.
- Never invent prices, returns, news, app functionality or scientific certainty. A fresh-news claim that cannot be verified is replaced by another verified story.
- No boilerplate warning/disclaimer narration; omit risky procedures rather than narrating warnings. Essential legal qualifications stay short and accurate.
- Do not infer engagement from a promoted post's views.

## Topic selection
- Review this conversation's previous episodes and never repeat a topic; if a proposed topic was covered, choose a genuinely different one in the same genre (food/nutrient breakdowns) with the same story criteria.

## QA before delivery
- Render, full FFmpeg decode, check duration and codecs, inspect transitions and frames, check English narration, caption sync, clipping and missing assets. Attach the finished MP4 and the thumbnail; report limitations honestly. Never claim a watched or listened check that was not performed (ASR and frame sheets are machine checks, not a human listen).
- CTA invites tracking nutrition with CalMeter (never "NutriAI" branding in copy).
