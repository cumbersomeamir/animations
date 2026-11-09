# 25 — English-11 (2026-11-09 batch): "Why is the food steaming but the plate still cool?"

**Output:** `videos/recall/production/30s/2026-11-09-english-11/recall-30s-english11-01.mp4`

**Format:** 11. **Style:** 15, kept as most recently accepted in E06–E10 (same café, performer, giant mechanism set,
lime/paper/ink palette, Fredoka caption pill, English voice). **Language:** English narration and captions only. Previous
MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Batch 2026-11-09-english-11. One new 30 s English educational episode: why a microwave heats food but the plate can stay
  cooler; follow microwave energy into water-containing food; distinguish dielectric heating from heat conducted into the
  plate; explain why some ceramics themselves heat up. Accurate everyday science, concrete reveal, no quiz. If the topic was
  covered, choose another.
- Keep the most recently accepted style, palette, character, scene grammar and voice; immediate visual hook in the first
  1–2 s; concrete demonstration and takeaway; one short truthful CTA in the last 3–4 s; no filler or repeated disclaimers;
  music quiet under speech; primary sources cited; publishing caption = final transcript, correct app identity, no editing
  instructions, no other app names. Confirm repo/branch/account before edits; finish older jobs first.
- "The user approved improvements from the Instagram App Performance sheet": the sheet was not provided in this chat; the
  improvements named in the brief were applied. No sheet data is stored here.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations` (origin URL verified), branch `claude-video/recall` at 8e3ee87 (E10 final),
  equal to the remote; tree clean; **no running jobs** (`pgrep`). **Account:** git author is session-managed
  (noreply@anthropic.com); CLAUDE.md names the assigned account amir@tensorblue.com; commits carry this session's trailers.
- **Topic history:** **R02** (context 16) covered why microwaved leftovers have **cold patches** (standing waves, outer layers
  first, stir and stand). Plates, containers, ceramics, glazes and dish tests appear in no earlier episode. The question and
  the payoff differ (why the plate stays cooler, which pottery heats itself, a dish test), so the topic was **kept** (as E09
  was kept beside H03), with new mechanism visuals rather than R02's cavity and standing waves.

## Final script (82 words, 27.38 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.30 | Why is the food steaming but the plate still cool? | 2.66 |
| l02 | 3.35 | Microwaves tug the water molecules inside food back and forth, and that makes heat. | 5.13 |
| l03 | 8.85 | Glass and microwave-safe ceramics barely absorb them; the hot food warms the plate. | 5.12 |
| l04 | 14.35 | But water soaked into porous clay or an iron-rich glaze can make pottery heat itself. | 5.35 |
| l05 | 20.10 | To test a dish, heat it empty beside a cup of water for one minute. If it stays cool, it's safe. | 5.83 |
| l06 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English Recall blend; no Hindi or
  earlier audio reused.
- Iterations for length and clarity: the first draft ran 29.5 s and ASR heard "molecules in food" as "molecules and food";
  the final wording ("inside food") is heard exactly and fits with pauses. "Barely absorb" (not "can't") and "can make"
  (not "makes") keep the claims within the sources.

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **FDA "Microwave Ovens":** microwaves "pass through glass, paper, plastic, and similar materials; and they are absorbed by
  foods"; "Microwaves cause water molecules in food to vibrate, producing heat that cooks the food."; containers "cannot be
  heated by microwaves, they can become hot from the heat of the food cooking inside."
- **HyperPhysics "Microwave Ovens"** (GSU): "dielectric heating"; torques on the water molecules' dipole moments; "the major
  heating effect … is the heating of the water included in the material."
- **Digitalfire "Microwave Safe"** (Tony Hansen): porous bodies soak up water through an unglazed foot ring or crazed glaze and
  it "will certainly super-heat the piece"; "bodies of higher iron content do heat up"; high-iron-oxide glazes "will clearly
  be an issue".
- **UH CTAHR Extension "Microwave Cooking":** empty dish beside 1 cup of water, 1 minute on high; "If the dish stays cool, it is
  safe to microwave. If the dish gets warm or hot to the touch, it should not be used for microwaving."
- Not usable: UMD Extension PDF (certificate chain refused via the proxy), MSU Extension (did not load), LSBU (HTTP 502), a
  course copy of Vollmer's paper (HTML). No bot check circumvented.

## Product-fact check (CTA)
Same CTA as 16–24. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café and performer as F01/E06–E10** (`buildCafe` / `buildPerson` byte-identical); **R02's counter microwave and
  steam** reused; new plate of food (lime band), test dish and glass measuring cup.
- **Opening = thermal reveal:** a lime scan line sweeps down at 0.12 s and switches the frame to an illustrative thermal view
  (legend "thermal view: cool → hot"): the food glows hot, the plate is warm under the food and cool at the rim. The
  performer then lifts the plate bare-handed in the react shot.
- **Mechanism set:** a giant food cross-section with water molecules (red O, white H) turned back and forth by lime
  microwaves (slowed down enormously), the food warming; the plate's cross-section with a fixed lattice, waves passing
  through the rim, and a heat glow spreading from under the food (rim stays cool); a cut-away porous mug with a dark
  iron-rich glaze, crazing and a bare foot ring, water soaking in and then glowing.
- **Payoff:** the dish test in the counter microwave (empty dish + cup of water, 1:00 → END as a time-lapse, labelled), then a
  thermal scan: water hot, dish cool ("dish stays cool = safe"; "gets warm? don't use it").
- **Audio:** accepted score engine retimed; done beeps, scan sweeps, pings, clink, field hum, rattles, fizzle, droplets, door
  thunk/clunk, timer beeps and a chime; English bed gains 0.5/0.6.

## Skill adjustments learned this round
- A **thermal / x-ray view** works as a second, scissored render pass with per-mesh false-colour materials swapped in and out
  (no extra scene); a scan line on the overlay marks the wipe edge.
- People close to a thermal camera become large warm blocks: keep hands out of a thermal close-up until the cut.
- A `CanvasTexture` gradient on a transparent plane rendered nothing in SwiftShader here, and vertex-colour alpha did not show
  either; stacked translucent solid planes give a reliable soft glow.
- ASR splits hyphenated words ("-safe", "-rich"): derive caption splits from word text, not word indices.

## Progress
- 2026-11-09 batch (E11): setup confirmed; topic kept vs R02; sources verified; narration generated (two rewrites for length and
  one ASR mishear), timeline and caption sync pre-check OK (leads 0.07–0.10 s); scene built from E10 tooling (explicit
  composite renderer kept).
- Preview stills reviewed and fixed: door open blocking the hook camera; molecules in a line (jittered grid); pottery water
  dots double-offset; framing of the react, plate, pottery and test shots; hook tags clear of the thermal legend; hands moved
  out of the thermal close-up; heat glow made visible; door closed for the final café shot.
- Mix −14.54 LUFS, −1.6 dBTP, voice +15.9…+17.9 dB over the bed.
- Full render started (`WORKERS=3 ./build.sh`, one process).
