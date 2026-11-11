# 27 — Approved feedback rules (2026-11-11) — CURRENT; supersedes conflicting rules in context/11 and earlier files

Source: user message of 2026-11-11 ("Persist these approved feedback rules in this app context."), updated from the
"Published apps" sheet, *Satisfied?* column, read 11 November 2026. Applies to every Werbens educational episode from
english-12 on. Where this file conflicts with `context/11` ("Format rules (current)", "Style recipe", "Caption + safe areas")
or an older episode file, **this file wins**. Everything it does not change stays as accepted (renderer, studio, voice,
motion grammar, CTA). App: Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` ·
account info@tensorblue.com (CLAUDE.md).

## 1. Rules as approved (verbatim)

> NEXT EDUCATIONAL EPISODE — updated from Published apps, Satisfied? column, read 11 November 2026. Use this app's EXISTING
> Claude CODE conversation, its mapped account, cumbersomeamir/animations and its isolated claude-video/<slug> branch. Read its
> approved context, style skill and previous topics first. Do not borrow another app's visuals, voice, CTA or assets. Do not
> overwrite earlier outputs. This is an educational app-channel episode, separate from the unrelated Discover short-film
> request. Render an actual 30.000-second 1080x1920 H264/yuv420p MP4 with AAC, English voiceover and English captions. No
> Hindi. Keep the established narrator. No Blender or paid APIs. Use the existing approved motion skill and assets, with ONLY
> the changes below.
>
> Theory of Marketing: thumbnail -> hook -> optional super hook -> build-up + proof -> payoff -> CTA. Hook answers why I care;
> build-up sustains a specific question; proof makes the answer credible; payoff gives useful knowledge; CTA gives a relevant
> next step. Suspense must come from a real unanswered question, never false claims. Do not repeat the answer in every scene or
> pad with generic statements.
>
> Pacing: 0-3s immediate striking image and hook; 3-5s optional escalation; 5-21s visual explanation and proof, with scene
> changes; 21-27s resolve the question with a concrete takeaway; 27-30s concise app-relevant CTA. Adapt timings naturally to
> the story, but deliver 30s. Create an attractive separate vertical thumbnail tied to the hook, with 2-4 large words.
>
> One visual idea at a time, no paragraph cards. On-screen labels must be large and brief; voice explains the detail.
> Captions should be readable within x=100..900, y=230..1500 and avoid platform overlays. Don't show caption, diagram labels
> and explanatory paragraph competing simultaneously. Reveal diagrams sequentially, use deliberate depth, lighting and
> transitions, avoid decorative distracting lines. Show meaningful motion that explains the topic.
>
> Verify factual claims from primary/reliable sources before final script. Distinguish measured facts, estimates and
> illustrative assumptions. Put sources in project notes rather than cluttering the video. Do not invent prices, financial
> returns, news, app functionality or scientific certainty. Avoid boilerplate warning/disclaimer narration; omit risky
> procedures instead of devoting the story to warnings. Legal qualifications essential to the answer stay concise and
> accurate.
>
> Review this conversation's previous episodes to avoid repeating a topic. If the proposed topic was covered, choose a
> genuinely different topic in the same genre using the same story criteria. If a fresh-news claim cannot be verified, select
> another verified story rather than presenting rumor as news.
>
> Save only completed MP4s in the user review folder when downloaded; production source, citations, prompts and QA stay
> outside video-review. Render, full-decode, check duration/codecs, inspect transitions/frames, listen through for English
> narration, caption sync, clipping and missing assets. Attach the finished MP4 and thumbnail; report limitations honestly.
> Do not claim a watched/listened check you did not perform.
>
> APP: Werbens. PROPOSED TOPIC: Why a brand can make an ordinary product feel expensive. FEEDBACK ONLY: change color theme
> and logo to actual app.werbens.com. Inspect that exact website, extract current rendered palette/logo assets; do not
> substitute werbens.com or guessed light blue. Preserve approved visual style otherwise. Marketing genre stays. Hook
> juxtaposes identical product silhouettes with different presentation: "SAME PRODUCT. NEW PERCEPTION." Build a verified brand
> example illustrating packaging, positioning or price anchoring; avoid inventing conversion/sales statistics. Reveal one
> mechanism visually, payoff gives a useful marketing lesson. Maintain original app palette across scenes and use current
> logo, no excessive sales pitch.

## 2. Production defaults derived from these rules (how the renderer/QA implement them)
These are Claude's implementation of the rules above, recorded so later episodes apply them the same way.

| Area | Default from english-12 on | Replaces |
|---|---|---|
| Story structure | thumbnail → hook (0–3 s) → optional super hook (3–5 s) → build-up + proof (5–21 s, ≥ 2 scene changes) → payoff (21–27 s, one concrete takeaway) → CTA (27–30 s). One real open question carries the build-up; the answer is given once, in the payoff. | "strong opening … clear takeaway" (context/11) |
| CTA | "Follow Werbens to decode how brands sell." starts ≈ 27.0 s (last 3 s); logo tile + wordmark. App-relevant, no sales pitch. | CTA from ≈ 26.1 s |
| Thumbnail | separate 1080×1920 PNG (+ JPG) per episode, tied to the hook, 2–4 large words, same studio/palette/logo; saved as `<episode>-thumbnail.png` next to the MP4. | none before |
| Captions | caption **ink and pill** inside **x 100–900**, y 230–1500 (we keep the pill high, ≈ y 330–530, so it never meets bottom/side platform UI); ≤ 2 short lines. | x 90–990, y 340–520 |
| Labels | large (≥ 64 px cap text), 1–3 words, **one label idea on screen at a time**; never a paragraph card; text labels also kept inside x 100–900, below y 560, above y 1500. | x 80–1000, y ≤ 1560; 220-px cards with small text |
| Source chips | **none on screen** — sources live only in the episode notes and `publishing-caption.txt`. | per-claim source chips (english-06…11) |
| Fiction labels | no boilerplate disclaimers; an invented/illustrative object is simply unbranded; a short note goes in the notes/caption. | "one 'illustrative' label per invented example" |
| Diagrams | revealed in sequence (one step per spoken idea), lit with depth; no decorative lines, rays or flourishes. | — |
| Facts | every claim tagged in the notes as **measured fact**, **estimate** or **illustrative assumption**; no invented prices, returns, news, app functions or certainty. | claim map without tags |
| QA | render, full decode, duration/codecs, transition + key frames, DOM bounds every frame against the new boxes, ASR (Whisper) for narration/caption sync — reported as ASR, never as a human listen. | same, new bounds |
| Delivery | finished MP4 + thumbnail attached in chat and pushed to the episode folder; QA, citations, prompts and source stay in the repo (the "video-review" folder named in the brief does not exist in this cloud container). | MP4 only |

## 3. Brand rule (Werbens-specific)
- Colours and logo come from the **live rendered https://app.werbens.com** (not werbens.com, not a guessed light blue),
  re-inspected each episode in headless Chromium: computed colours, wordmark style and the served logo file, compared with
  `context/17`. The palette (deep teal #316879, mint #7FE7DC, teal #5CE0D2, ink #0F172A, mint-white #F0FDFA, navy #0B1120,
  slate #64748B) is used across **every scene**, and the CTA uses the current logo SVG unaltered.

## 4. Where this is referenced
- `context/11-production-format.md` → "Update — approved feedback rules (2026-11-11)" points here.
- `context/05-progress.md` → pointer line.
- Episode notes from english-12 on (`context/28-…`) state how each rule was met.
