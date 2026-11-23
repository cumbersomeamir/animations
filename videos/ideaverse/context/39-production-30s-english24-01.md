# 39 — Production 30s english24-01 (English): "Your iPhone charges to 80% overnight, then waits. Why does it stop?"

Batch 2026-11-23-english-24 ("NEXT EPISODE — English batch24", authorised 23 November; batch23 complete and pushed, nothing
checkpointed). Workspace `production/30s/2026-11-23-english-24/` · deliverables `ideaverse-30s-english24-01.mp4` +
`ideaverse-30s-english24-01-thumbnail.png`. Repo cumbersomeamir/animations · branch claude-video/ideaverse (current remote head
dbddd47 at start). Style: accepted pilot-01 DOCKET identity (colours, DOCKET, caption pill, labels, CTA card) with new
choreography: a bedside at night. LIVE feedback applied: CTA exactly "Download the Ideaverse app."; icon re-checked (listing
updated Nov 23, 2026; icon unchanged); a non-obvious everyday mechanism with documented specifics and a concrete action.

## Topic check (all records read: context/09, 12–38; batch23 actually used Google Project Green Light, context/38)
- Proposed: "Why your phone can read a menu in another language" (camera translation: locate text, recognise characters,
  translate, place translated words; check allergy/price wording against the original).
- Already covered: **round02-01** (context/16, "How your phone reads text from a photo": finds text, recognises letters; "tap to
  copy a bus time, or translate a menu into your language", with a Spanish menu flipping to English) — and the identical proposal
  was already replaced once in **english15-01** (context/30). → replaced with an unrelated subject, as the brief requires.
- Chosen (same fixed genre: everyday, usable, non-expert AI with a non-obvious mechanism and a concrete action): **Optimized
  Battery Charging** — why an iPhone stops at 80% overnight (on-device machine learning learns the charging routine; holds at
  80%; finishes shortly before you need it; Charge Now when you need it full). Different core question, setting (a bedside at
  night) and mechanism (learning a personal routine to limit time at full charge) from batch23 and from every earlier record
  (no battery/charging episode exists).

## Script (English, 74 words incl. CTA) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook | Your iPhone charges to eighty percent overnight, then waits. Why does it stop? |
| s2 | 5.10 | superhook | It's protecting the battery. |
| s3 | 6.70 | why | Batteries age faster when they sit at full charge. |
| s4 | 9.60 | mechanism | Machine learning on the phone learns your charging routine. |
| s5 | 13.10 | mechanism (documented conditions) | After two weeks of long charges in one place, it holds at eighty percent, |
| s6 | 17.62 | mechanism | and finishes shortly before you usually need it. |
| s7 | 21.10 | payoff | Need it full now? Touch and hold the notification, then tap Charge Now. |
| s8 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (punctuation and "80 %" aside). Rejected wordings: "Hours at full charge
wear a battery faster" (heard "were"), "…age a battery…" (heard "age of"), "…then waits. Why?" (trimmed clip heard "Bye").

## Facts → sources (accessed 2026-11-23)
| claim | type | source |
|---|---|---|
| an iPhone can charge to 80% overnight and then wait | documented | Apple Support, "About Charge Limit and Optimized Battery Charging on iPhone", https://support.apple.com/en-us/108055 — "When the feature is enabled, your iPhone will delay charging past 80 percent in certain situations." "Optimized Battery Charging is on by default when you set up your iPhone." |
| it's protecting the battery; batteries age faster when they sit at full charge | documented | Same page — "Optimized Battery Charging is designed to reduce the wear on your battery and improve its lifespan by reducing the time your iPhone spends fully charged." "A battery's chemical age results from a complex combination of several factors, including temperature history and charging pattern." |
| machine learning on the phone learns your charging routine | documented | Same page — "Your iPhone uses on-device machine learning to learn your daily charging routine so that Optimized Battery Charging activates only when your iPhone predicts it will be connected to a charger for an extended period of time." |
| after two weeks of long charges in one place, it holds at 80% | documented | Same page (footnote) — "Optimized Battery Charging needs at least 14 days to learn your charging habits, so it won't engage before then. Also, your iPhone needs to experience at least 9 charges of 5 hours or more in a given location for Optimized Battery Charging to engage." |
| and finishes shortly before you usually need it | documented | Apple, "Batteries — Maximizing Performance", https://www.apple.com/batteries/maximizing-performance/ — "Based on your daily charging routine, it may automatically defer charging to 100% until shortly before you need to use the battery." |
| need it full now? touch and hold the notification, then tap Charge Now | documented | Apple Support 108055 — "When Optimized Battery Charging is active, a notification on the Lock Screen says when your iPhone will be fully charged. If you need to have your iPhone fully charged sooner, touch and hold the notification and then tap Charge Now." |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse battery feature. |
Noted, not narrated: iPhone 15 and later also offer a Charge Limit (80–100% in 5% steps; Optimized Battery Charging is available
when the limit is 100%); Mac and Apple Watch have similar features; Software may also limit charging above 80% when recommended
temperatures are exceeded (Apple, "Why Lithium-ion?") — a different cause of a pause, not covered here.
Illustrative (not measured): all clock times (1:10, 3:40, 6:55, 7:00), "8 h at full", the aging bar, the 14 plug-in bars and
their times, the lock screen and notification wording (EXAMPLE; generic, not Apple's UI).

## Storyboard (cues.js)
1. 0–4.95 hook: a nightstand at night — alarm clock 1:10, the phone on a stand at 80%; the clock races to 3:40 while the battery
   stays at 80%; WHY STUCK / AT 80%? (frame 0).
2. 4.95–6.55 close-up: a shield closes over the 80% ring (NOT BROKEN).
3. 6.55–9.45 card: 100% battery, "HOURS AT FULL" counts up, a "BATTERY AGING" bar grows (FULL = FASTER AGING).
4. 9.45–15.55 card: ON THE PHONE; 14 nights of plug-in bars appear; "usually unplugged" line; ✓ 14+ DAYS · ✓ 9+ CHARGES, 5 H+ ·
   ✓ SAME PLACE (LEARNS YOUR ROUTINE).
5. 15.55–20.6 the night: the ring turns amber with a pause sign while the clock runs (HOLDS AT 80%), then 80 → 100% by 6:55 as the
   window turns to dawn, the 7:00 alarm rings (FULL WHEN YOU WAKE).
6. 20.6–26.85 DOCKET's phone: "Charging paused · at 80% · full by 6:55" → touch and hold → Charge Now → "Charging now 81%"
   (NEED IT NOW? → CHARGE NOW).
7. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "STUCK AT / 80%?".

## QA / status
- IN PROGRESS (2026-11-23): stage, narration, score written; stills checked; full render running.
