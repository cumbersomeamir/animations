# 21 — English-07 (2026-11-06): "Why does your phone rush to 80% then crawl to 100%?"

**Output:** `videos/recall/production/30s/2026-11-06-english-07/recall-30s-english07-01.mp4`

**Format:** 11. **Style:** 15, retained as most recently accepted in E06 (same café, performer, lime phone, giant mechanism
object, lime/paper/ink palette, Fredoka caption pill, English voice). **Language:** English narration and captions only.
Previous MP4s are preserved, and no automation was created.

## Request essentials (user, 2026-11-06; facts about the brief)
- Batch 2026-11-06-english-07. One new 30 s English educational episode. Suggested topic: why a microwave heats food
  unevenly, and how stirring and standing time help (rotating bowl, manufacturer or food-safety guidance, no one-size cooking
  time). "If covered choose another fresh subject in the same genre."
- Keep the most recently accepted style, palette, character, scene grammar and voice; no older rejected style; no quiz.
  Hook in the first 1–2 s, a concrete demonstration and takeaway, one short truthful CTA in the last 3–4 s. Music quiet under
  speech. Claims verified with primary sources and cited. Publishing caption = final transcript, correct app identity, no
  editing instructions, no other app names.
- "The user approved improvements from the Instagram App Performance sheet": the sheet was not provided in this chat; the
  improvements named in the brief were applied. No sheet data is stored here.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations` (origin URL verified), branch `claude-video/recall` at b9d8212 (E06
  final), tree clean, no active jobs. Git author is session-managed; commit trailers carry this Claude session URL.
- **Topic history:** the suggested microwave topic **duplicates R02** (context 16: "Why a microwave leaves cold patches in
  food" — turntable through a standing-wave pattern, outer layers heat first, "stir, spread, let it stand"). Per the rule, a
  fresh subject in the same genre was chosen: **why phone charging is fast to about 80% and then slows**. "battery",
  "charging" and "lithium" appear in no earlier episode (contexts 11–20 checked).

## Final script (73 words, 25.25 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.40 | Why does your phone rush to 80% then crawl to 100%? | 4.07 |
| l02 | 4.85 | At first, the charger pushes a big, steady current into the battery. | 3.91 |
| l03 | 9.20 | Near full, it holds the voltage steady and lets the current shrink, like pouring slower near the top of a glass. | 6.31 |
| l04 | 15.95 | That gentler finish helps the battery last. Keep it cool, too: when it's too warm, charging past 80% can pause. | 7.66 |
| l05 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English "Meshline"/Recall blend;
  no Hindi or earlier audio reused.
- **Pronunciation fixes from the ASR pass:** "race" was heard as "raise" → "rush"; "your pour" was heard as "your poor"
  (homophone) → "pouring slower"; a comma after "80%" made a 1 s pause → removed.

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **Apple, "Batteries - Why Lithium-ion?"** (live text checked in Chromium): "Your Apple lithium-ion battery uses fast
  charging to quickly reach 80% of its capacity, then switches to slower trickle charging."; "Eases the electrical current to
  extend battery lifespan."; "Software may limit charging above 80% when the recommended battery temperatures are exceeded."
- **Apple, "Batteries - Maximizing Performance"**: "Charging may pause temporarily while in extreme temperature conditions,
  and will resume once the battery’s temperature returns to its normal operating range."; comfort zone 16–22 °C; "Charging
  the device in high ambient temperatures can damage it further."; remove certain cases if the device gets hot when charging.
- **Texas Instruments SLAA287B** (PDF text): constant current "until the battery voltage reaches 4.1 V or 4.2 V", then
  constant voltage; "During this process the charging current starts to fall due to internal cell resistance."
- Not used: Apple Support 108055 (summarizer only); a Pixel help URL (unrelated page).

## Product-fact check (CTA)
Same CTA as 16–20. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café, performer and lime phone as F01/E06** (`buildCafe` / `buildPerson` / `buildPhone` byte-identical). New props:
  a small charger brick and cable, a window-light patch on the counter, a glass and a carafe, and an original minimal charging
  screen (battery fill, percentage, lime bolt; coral thermometer + pause bars when paused).
- **Opening = demonstration:** the percentage races 41% → 80% in 1.5 s (a tick per percent) and then crawls (slow ticks).
- **Mechanism object:** a giant battery cutaway: charge slots fill bottom-up with lime beads under a falling stream and a
  glowing column (current); a current dial and a voltage dial with a max mark; a lime 80% ring. Constant current up to the
  ring, then the voltage needle holds at max while the current decays exponentially, so the stream thins and the fill creeps.
- **Analogy made physical:** the performer pours water into a glass, thick then thin near the top.
- **Heat beat + takeaway:** the phone in window light shimmers; the performer touches it and shakes off the warmth; the giant
  battery glows coral, the thermometer rises and charging pauses; the performer slides the phone into the shade and it
  resumes (bolt + check). On-screen takeaway "Fast to 80%. Keep it cool." (no VO).
- **Audio:** accepted score engine retimed; percent ticks, charging hum that fades with the current, bead plinks, pour,
  sizzle, pause bonk, resume chime; English bed gains 0.5/0.6.

## Skill adjustments learned this round
- Base.en ASR exposes near-homophones ("race"/"raise", "pour"/"poor"); reword rather than trust context.
- Verify summarizer-only quotes against live page text (headless Chromium `innerText`) and PDFs with `pdftotext` before citing.
- Use one directly backgrounded build process (no detached subshells), so two muxes never write the same MP4.

## Progress
- 2026-11-06: setup confirmed; microwave topic found to duplicate R02 → battery-charging topic chosen; sources fetched and
  verified (Apple live text, TI PDF text); narration generated and ASR-checked (two rewordings); scene built from E06 tooling;
  preview stills reviewed and fixed:
  - giant dials moved inward (cut at the frame edges);
  - react framing (face clear of captions);
  - sun shot: touch the phone's far edge so the hand does not cover the screen, "warm" tag moved off the percentage;
  - shade shot: camera follows the phone (it left the frame).
  - Mix −14.56 LUFS, −1.6 dBTP, voice +15.3…+16.7 dB (charging hum and plinks lowered from +11.7 dB).
  - Pre-render caption sync: all 11 spoken groups 0.05–0.10 s before their first word.
  - Full render started (`WORKERS=3 ./build.sh`, one process).
- 2026-11-06: full render run 1 (8 m 15 s): all 25 checks + narration sync + caption sync pass; contact and boundary sheets
  reviewed; no re-render needed. Committed, pushed and attached. No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `8a0baddc8bdafb1e1fe9b23092bae3bbade618a6134d39a487afb0f003913b61` (11,459,324 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- English ASR on the final mix (Whisper base.en): WER 0.0 (exact transcript); narration within 0.2 ms of plan; 11 spoken
  caption groups appear 0.05–0.10 s before their first word and stay past their last.
- −14.6 LUFS, −1.5 dBTP, 0 clipped samples; voice +15.3…+16.7 dB over the bed.
- Captions English only, ink x 175–905, y 341.5–464.5, ≤ 2 lines; nothing above y 300; labels central; no overlaps; longest
  static run 6 frames.
- Limits: ASR-only listening check (I cannot listen); battery animation illustrative (80% per Apple, curve not measured);
  "with AI" is the user's wording.

## Publishing caption
`production/30s/2026-11-06-english-07/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l04; l05) + one illustration note + 3 sources + hashtags. App identity: Recall; no other app
names (source publishers only); no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-06-english-07 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
