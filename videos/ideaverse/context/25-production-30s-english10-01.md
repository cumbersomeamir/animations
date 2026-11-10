# 25 — Production 30s english10-01 (English): "Why your map warns of a jam on a road that looks clear"

Batch 2026-11-09-english-10 (user-approved). Workspace `production/30s/2026-11-09-english-10/` · deliverable `ideaverse-30s-english10-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed; english-09 finished first, in queue order).
Style: accepted pilot-01 DOCKET newsroom lesson style via the latest renderer (english-09 src). Meme renderer not used.

## Topic decision (history checked: context/09, 12–24)
- Suggested: "live captions turn a noisy train announcement into words; a misheard place name; check the station display".
  This repeats **english06-01** (context/21): phone Live Captions mishear (numbers), check before you act — same feature,
  same lesson. So, per the brief, a fresh everyday-AI subject was chosen, keeping the travel angle the user asked for.
- Chosen: **how a maps app predicts traffic** — live speeds from phones on the road + how the road usually flows at this
  hour → a predicted jam before it forms; sudden crashes can still throw the estimate off; practical payoff: set a leave
  time in advance to compare estimated journey times (documented feature). Not covered by any earlier episode.

## Script (English, 72 words) — placements from ASR word timings (narration/words.json)
| id | start (s) | line |
|---|---|---|
| s1 | 0.20 | The road ahead looks clear. So why does your map warn of a jam? |
| s2 | 4.50 | Speeds from phones already on that road show the traffic right now. |
| s3 | 9.00 | Then it adds how that road usually flows at this hour, to predict what's coming. |
| s4 | 14.30 | It isn't perfect: a sudden crash can still throw the estimate off. |
| s5 | 19.00 | For an important trip, set a leave time in advance to see the estimated journey time. |
| s6 | 26.60 | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en on first synthesis. No numbers spoken (on-screen values are EXAMPLEs).

## Facts → sources (accessed 2026-11-10)
| claim | source |
|---|---|
| speeds from phones on the road show traffic right now | Google blog, "Google Maps 101: How AI helps predict traffic and determine routes" (J. Lau, Sep 2020), https://blog.google/products/maps/google-maps-101-how-ai-helps-predict-traffic-and-determine-routes/ — "When people navigate with Google Maps, aggregate location data can be used to understand traffic conditions on roads all over the world." |
| + how that road usually flows at this hour → predict what's coming | same post — "Google Maps analyzes historical traffic patterns for roads over time … We then combine this database of historical traffic patterns with live traffic conditions, using machine learning to generate predictions"; "predict whether or not you'll be affected by a slowdown that may not have even started yet" · Google DeepMind, "Traffic prediction with advanced Graph Neural Networks", https://deepmind.google/discover/blog/traffic-prediction-with-advanced-graph-neural-networks/ — live data "doesn't account for the traffic a driver can expect to see 10, 20, or even 50 minutes into their drive". |
| it isn't perfect; a sudden crash can throw the estimate off | same sources — predictions "consistently accurate for over 97% of trips" (so not all); historical patterns are "not always" reliable; incident reports needed when "road conditions change unexpectedly". |
| set a leave time in advance to see the estimated journey time | Google Maps Help, "Get directions & show routes" (Android), https://support.google.com/maps/answer/144339 — "Change the time that you leave or arrive: To find the best route based on estimated traffic and transit schedules, change your travel date or time … tap More > Set depart or arrive time." |
| Ideaverse | Name + current Play icon only. No claim that Ideaverse predicts traffic. |
Map, speeds, times and the directions screen are fictional EXAMPLEs drawn in code (generic UI).

## Storyboard (cues.js)
1. 0–1.6 hook (easel): city map, green route, cars moving freely on the road ahead; it turns red with "!" + "jam ahead"
   (0.4) and the ETA jumps 18 → 26 min (0.95).
2. 1.6–4.4 two-shot: DOCKET points at the map, head tilt + "?" ("So why does your map warn of a jam?").
3. 4.4–8.9 LIVE SPEEDS: phone dots appear on the roads, speed chips ("already on that road"), route lights up green
   ("right now") — the road ahead really is clear now.
4. 8.9–14.2 PREDICTED: "road ahead · usually" chart by hour, 6 pm highlighted + "you get there ≈ 6 pm"; the road ahead
   turns red (dashed = predicted), "jam in 12 min", ETA 26 min.
5. 14.25–18.7 push-in: a sudden crash pops on the next road, ETA becomes "34 min?" ("throw the estimate off").
6. 18.7–25.4 phone directions (EXAMPLE): "Leave now" → "Leave at…" picker → 5:30 pm; estimated journey time 5:30 ≈ 21 min
   vs 6:00 ≈ 31 min ("based on usual traffic"); ✓ on 5:30.
7. 25.4–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app".

## QA / status — IN PROGRESS
- Pre-render mix ASR: all lines MATCH, no word outside captions.
