# 38 — Production 30s english23-01 (English): "This AI never drives a car, yet it can cut your stops at red lights."

Batch 2026-11-21-english-23 ("NEXT EPISODE — English batch23", authorised 21 November; batch22 was already delivered and pushed,
nothing checkpointed). Workspace `production/30s/2026-11-21-english-23/` · deliverables `ideaverse-30s-english23-01.mp4` +
`ideaverse-30s-english23-01-thumbnail.png`. Repo cumbersomeamir/animations · branch claude-video/ideaverse.
Style: accepted pilot-01 DOCKET newsroom identity (colours, DOCKET, caption pill, labels, CTA card) with new choreography: a
tiny night city on the newsroom floor. LIVE feedback applied: CTA exactly "Download the Ideaverse app."; icon re-checked
(unchanged); a non-obvious, non-LLM mechanism with a measured, scoped result and a concrete action.
Brief rules kept from 2026-11-19: captions in the upper band (pill y 282–458, x 100..900), vital info away from right/bottom
controls, ≤ one short headline + the caption, hook 0–3 / superhook 3–5 / build 5–21 / payoff 21–27 / CTA 27–30.

## Topic check (all records read: context/09, 12–37; batch22 actually used AI slow-motion frame interpolation, context/37)
- Proposed: "AI can reduce traffic stops without driving a single car" (Google Project Green Light; a verified intersection pilot).
- Nearest earlier episode: **english10-01** (context/25, "Why your map warns of a jam on a road that looks clear") — a maps ETA
  / jam prediction for the driver (live phone speeds + historical patterns; set a leave time). Different core question (how can
  traffic lights be retimed so cars stop less?), different mechanism (aggregate stop patterns → signal-timing suggestions → city
  engineers apply them; green waves), different setting (a signalised avenue, not a route map). Shared input only: aggregated
  Google Maps driving data. → Not a repeat; used as briefed.
- Different from batch22 in question (signals vs invented video frames), setting (3D city vs ball/video frames) and mechanism
  (timing coordination vs motion interpolation).

## Script (English, 72 words incl. CTA) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + superhook | This AI never drives a car, yet it can cut your stops at red lights. |
| s2 | 4.75 | mechanism | Google's Green Light reads anonymous Maps driving trends. |
| s3 | 8.50 | mechanism | Where cars keep stopping, it suggests new timing to city engineers. |
| s4 | 12.75 | mechanism (demo) | A little more green, or lights that turn green in a wave. |
| s5 | 16.20 | measured proof, scoped | In Boston's pilot, one crossing saw thirty-three percent fewer unnecessary stops. |
| s6 | 21.65 | payoff | Results vary. If one light always stops you, report it to your city. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en ("33 %" for "thirty-three percent"; checker map extended). Drafts trimmed
for pacing: "…driving trends at each crossing", "…Timing can change."

## Facts → sources (accessed 2026-11-21)
| claim | type | source |
|---|---|---|
| Green Light reads anonymous Maps driving trends | documented | Google Research, "Green Light", https://sites.research.google/greenlight/ — "Green Light uses AI and Google Maps driving trends … to model traffic patterns and build intelligent recommendations for city traffic engineers"; City of Boston, "Project Green Light: Saving You Time On The Road", https://www.boston.gov/node/16372851 — "Google Maps is using aggregated, anonymized driving trends"; "Any driving trends shared with the city are aggregated, anonymized and have gone through strict differential privacy measurements"; Google Research FAQ — "User data is never shared with the city or any other third party." |
| where cars keep stopping, it suggests new timing to city engineers | documented | Google Research — "We create a model to understand how traffic flows through the intersection … patterns of starting and stopping, average wait times …"; "we identify possible adjustments to traffic light timing. We share these adjustments as actionable recommendations with the city. The city's traffic engineers review the recommendations, approve them, and they can easily implement them in as little as 5 minutes"; dashboard "with the option to accept or reject the suggestion". Google blog (29 Jul 2024), "How Google uses AI to reduce stop-and-go traffic on your route", https://blog.google/outreach-initiatives/sustainability/google-ai-project-greenlight/ — model of "patterns of starting and stopping, average wait times … coordination between adjacent intersections". |
| a little more green, or lights that turn green in a wave | documented | Google Research FAQ — e.g. "if they should add additional seconds of 'green time' to a particular part of the traffic light cycle"; "By optimizing each intersection, and coordinating between adjacent intersections, we can create waves of green lights". City of Boston — "Engineers implement traffic synchronization with nearby intersections or change 'green time' between lights to better match demand." |
| in Boston's pilot, one crossing saw 33% fewer unnecessary stops | measured (City-reported; scope: phase 2 of Boston's pilot, one intersection, evaluated with INRIX) | City of Boston, "Mayor Wu Announces Expansion of Project Green Light Signal Optimization Program" (published 22 May 2025, page updated 17 Jun 2025), https://www.boston.gov/node/16381291 — "The City of Boston has partnered with INRIX … to evaluate the impact … During phase 2 of the Project Green Light pilot, the City has seen an average 13.5% reduction in delay … and a 20% average reduction of unnecessary stops across newly retimed intersections. At Atlantic Ave. and Richmond St. in the North End, the City saw a 21% reduction in overall traffic delay and a 33% reduction in unnecessary stops." |
| results vary | documented | Same Boston page: averages (20% fewer unnecessary stops) differ from the best crossings; "most effective during periods of heavy traffic". Google Research: "a potential for up to 30% reduction in stops" (early numbers). Scientific American (secondary), "Can Google Make Stoplights Smarter?", https://www.scientificamerican.com/article/googles-project-green-light-uses-ai-to-take-on-city-traffic/ — Seattle reverted a recommended change that "did not result in a net benefit"; Manchester engineers sometimes chose not to apply recommendations. |
| if one light always stops you, report it to your city | general civic advice (example) | Cities take signal reports, e.g. Boston 311 "Traffic Signal" requests include a "Controller/Timing Issues" problem type (https://boston.gov/311; public tickets on 311.boston.gov). The video's report screen is generic (EXAMPLE), not any city's app. |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse traffic feature. |
Not used on screen: the 30% / 10% "potential" figures, city counts, emissions numbers, fuel estimates, the Seattle/Manchester
details (context only). No "now/new" claims; the Boston figures are dated May 2025 in the notes.
Illustrative (not measured): the city, cars, signal cycle and offsets, trend dots and heat, "+6 s green", the engineer and
report screens.

## Storyboard (cues.js)
1. 0–4.6 hook: high view down a tiny night avenue; a green band travels with the released cars as each light turns green in
   sequence; AI THAT CHANGES / YOUR COMMUTE (frame 0).
2. 4.6–9.95 top-down, old timing: red dots where past trips stopped; red heat at each crossing; the worst pulses
   (MAPS DRIVING TRENDS → MOST STOPS HERE).
3. 9.95–12.55 DOCKET's phone (engineer view): Crossing 2 · most stops · Suggestion +6 s green (+ wave) → ACCEPT (ENGINEERS DECIDE).
4. 12.55–16.1 street level: crossing 2 turns green (+6 s GREEN); crossing 3 turns green as the cars arrive (GREEN WAVE).
5. 16.1–21.45 card: BOSTON PILOT · one crossing (Atlantic Ave & Richmond St) · −33% unnecessary stops · before/after bars ·
   source line (ONE CROSSING, ONE PILOT).
6. 21.45–26.85 DOCKET's phone: Report a problem → Traffic light · Timing: always red when I arrive → SEND → ✓ SENT
   (RESULTS VARY → REPORT A BAD LIGHT).
7. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "GREEN / WAVE".

## QA / status
- IN PROGRESS (2026-11-21): stage, narration, score written; stills checked; full render running.
