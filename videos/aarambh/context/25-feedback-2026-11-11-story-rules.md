# 25 — Approved feedback rules, 2026-11-11 (Published apps, "Satisfied?" column) — CURRENT for every future educational episode

Source: the user's brief of 2026-11-11 ("NEXT EDUCATIONAL EPISODE — updated from Published apps, Satisfied? column, read 11 November 2026"). These rules are approved, and they **supersede any conflicting rule in `11` or earlier records**. Only qualitative feedback is stored here, never analytics.

## Feedback on the previous Aarambh episodes (verbatim intent)
- **Problems:** "too much simultaneous information/text, motion unappealing, weak thumbnail."
- **Keep:** the famous-person life/achievement genre and the approved editorial ("Vox") motion skill (`.claude/skills/animation-direction`, editorial mode).
- **Portraits:** real, appropriately sourced portraits of the person.
- **Scenes:** distinct pages/scenes with minimal labels. "Not a static page with a lens moving up/down."

## Setup and isolation (unchanged)
- **Where:** this app's EXISTING Claude Code conversation and mapped account, `cumbersomeamir/animations`, branch `claude-video/aarambh`.
- **Before starting:** read the approved context, the style skill and previous topics.
- **Never:** borrow another app's visuals, voice, CTA or assets, or overwrite earlier outputs.
- **Separate work:** educational app-channel episodes are separate from any Discover short-film request.

## Deliverable
- **Video:** an actual 30.000 s, 1080x1920, H.264/yuv420p MP4 with AAC; English voiceover and English captions (no Hindi); the established narrator (Meshline/Recall Kokoro blend). No Blender or paid APIs.
- **Thumbnail:** an attractive, separate vertical thumbnail tied to the hook, with 2–4 large words.
- **Attach:** the finished MP4 and the thumbnail.
- **Review folder:** save only completed MP4s in the user review folder when downloaded. Production source, citations, prompts and QA stay outside video-review.

## Story structure (theory of marketing)
- **Sequence:** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
  - **Hook:** answers "why should I care?"
  - **Build-up:** sustains a specific question.
  - **Proof:** makes the answer credible.
  - **Payoff:** gives useful knowledge.
  - **CTA:** gives a relevant next step.
- **Suspense:** must come from a real unanswered question, never from false claims.
- **No repetition:** don't repeat the answer in every scene or pad with generic statements.

## Pacing (adapt naturally; total exactly 30 s)
| window | job |
|---|---|
| 0–3 s | an immediate striking image and the hook |
| 3–5 s | optional escalation (super hook) |
| 5–21 s | visual explanation and proof, with scene changes |
| 21–27 s | resolve the question with a concrete takeaway |
| 27–30 s | a concise, app-relevant CTA (Aarambh: "Download Aarambh to support livelihood tools.") |

## Screen design
- **One visual idea at a time;** no paragraph cards.
- **Labels:** large and brief on screen; the voice explains the detail.
- **Captions:** readable within **x = 100..900, y = 230..1500**, avoiding platform overlays (right-side buttons, bottom bar). This replaces the older x 90–990 rule. Caption plates are centred at x = 500 and no wider than 800 px.
- **No competition:** don't show a caption, diagram labels and an explanatory paragraph at the same time.
- **Diagrams:** reveal them sequentially. Use deliberate depth, lighting and transitions, and avoid decorative, distracting lines (e.g. the old catalogue grid on the light table).
- **Motion:** meaningful motion that explains the topic. No static page with a lens moving up and down.
- **Sources:** keep them in project notes, not in on-screen footers.

## Accuracy
- Verify factual claims from primary or reliable sources before the final script.
- Distinguish measured facts, estimates and illustrative assumptions.
- Never invent prices, financial returns, news, app functionality or scientific certainty.
- Avoid boilerplate warning or disclaimer narration; omit risky procedures instead of devoting the story to warnings. Keep legal qualifications that are essential to the answer concise and accurate.
- If a fresh-news claim cannot be verified, choose another verified story; never present rumour as news.

## Topic choice
- Review this conversation's previous episodes (the episode log in `11`) to avoid repeats.
- If the proposed topic was covered, choose a genuinely different topic in the same genre, using the same story criteria.

## QA before delivery
- Render, full-decode, and check duration and codecs.
- Inspect transitions and frames.
- Check English narration, caption sync, clipping and missing assets.
- Report limitations honestly. **Do not claim a watched or listened check that was not performed:** in this cloud container, listening means ASR-based checks only, and it must be reported that way.
