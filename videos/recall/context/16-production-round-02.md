# 16 — Round 02 (2026-11-03): "Why a microwave leaves cold patches in food"

- **Output:** `videos/recall/production/30s/2026-11-03-round-02/recall-30s-round02-01.mp4`.
- **Format:** 11. Only the CTA rule was corrected, at the user's request.
- **Style:** 15, unchanged.
- **Previous MP4s:** preserved.
- **Automation:** none.

## Request essentials (user, 2026-11-03; facts about the brief, not creative choices)
- One new 30 s English educational video for the topic above: uneven electromagnetic-field heating, turntable motion and redistribution of heat. It shows an illustrative bowl with warm/cool regions rotating through a field, then stirring/spreading as the practical takeaway. Sources: FDA/USDA/FoodSafety.gov. No invented safe cooking times and no hazardous demo. No quiz.
- **Sheet feedback to implement:**
  - Keep the accepted cinematic performer and scene style from F01 (no new character or design).
  - Change the final spoken and visible CTA to **"Download Recall for learning any new subject with AI."**
  - Verify product facts, and make no learning guarantee.
- **Keep everything else:**
  - Keep the accepted renderer and style recipe, assets, caption treatment, voice, pacing and character. No redesign and no wholesale context rewrite.
  - Narration is 65–75 words, with a hook, the mechanism, scene changes, a takeaway and the CTA in the last 3–4 s.
  - Captions sit at y 340–520 (or tighter), x 90–990, in at most 2 lines.
- **Output spec:** 30.000 s, 1080x1920, 30 fps, H.264 yuv420p + AAC.

## Topic history check
"microwave" appears nowhere in this app's context, notes or episode table (11). The topic is new, so it was kept.

## Final script (74 words, 24.45 s of speech; per-line ASR matched every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.25 | Why are microwaved leftovers hot at the edge, cold in the middle? | 3.83 |
| l02 | 4.35 | Waves bounce off the metal walls and overlap, leaving strong and weak spots. | 4.55 |
| l03 | 9.15 | The turntable carries food through them, but in thick food the waves mostly heat the outer layers; the middle waits for heat to spread inward. | 8.00 |
| l04 | 18.30 | So stir halfway, spread food evenly, and let it stand so the heat evens out. | 4.78 |
| l05 | 26.45 | Download Recall for learning any new subject with AI. | 3.29 |

Voice: Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. It uses the cached model (model.onnx sha256 8fbea51e…34cb, re-verified this round). The only qualification ("in thick food") sits in the sentence it qualifies.

## Sources (fetched 2026-11-03; quotes and the claim map are in the output folder's `docs/SOURCES.md`)
- **FDA, "Microwave Ovens":**
  - "The microwaves reflect off the metal interior of the oven and cause the water molecules in food to vibrate."
  - "When thick foods are cooked, the outer layers are heated and cooked primarily by microwaves while the inside is cooked mainly by the conduction of heat from the hot outer layers."
- **TU Delft ShowingPhysics demo 15.15, "Hot spots in the microwave":**
  - Standing waves: "In the nodes, the food is not heated, and in the antinodes, the heating is maximal."
  - "To achieve somewhat even heating, the food must rotate."
- **Clemson Cooperative Extension HGIC 3586, "Microwave Food Safety":**
  - "Stir or rotate foods midway through heating to reduce cold spots."
  - "Arrange food evenly …"
  - "Standing time allows heat to distribute evenly and finish cooking."
- **USDA FSIS and FoodSafety.gov:** their microwave pages refused automated fetches (HTTP 403; the UNT archive copies returned 503). They are recorded as attempted and are not quoted.

## Product-fact check for the CTA (verification result)
| evidence | what it says |
|---|---|
| `assets/listing.json` (approved, sha256 1f92917f…b039) | "Turn your study material into lessons, practice and spaced reviews." Education, Android, free, developer "Tensorblue AI" |
| Developer site from the listing (rendered in Chromium on 2026-11-03) | "Recall — Knowledge that stays", "Turn a chapter into clear ideas…", "Start with your textbook", "Find the core ideas". **No sentence mentions AI.** |
| Google Play page | no text was readable by automated fetch |

The CTA wording "with AI" is the user's own instruction for their product. It is used verbatim and is **not independently confirmed** by the public text above. "Any new subject" fits "your study material" or "your textbook". The CTA carries no learning guarantee or outcome claim.

## Creative decisions (choices, not facts)
- **Same set and performer:** the F01 café and performer, unchanged (`buildCafe` and `buildPerson` are byte-identical). New props only: a counter microwave with a live word-only display ("END", "PAUSED" plus a half-way bar, and never a time), a bowl of leftovers with a lime band, a spoon and steam.
- **Mechanism object:** a giant cutaway microwave cavity.
  - Lime wave trails bounce off the metal walls, then settle into a fixed pattern of lime strong spots, with a weak spot on the turntable axis.
  - The turntable carries the bowl through it, and the surface heat map forms rings while the centre stays cold.
  - A cross-section shows a hot shell around a cold middle, and heat creeps inward.
  - After stirring, a marbled section evens out during standing.
- **Heat map:** cold blue-grey → warm orange. Lime is reserved for the field and brand. The heat model (`web/heat.js`) is illustrative, not a simulation of a real oven.
- **Comedy:** a cold shiver on the first taste, and a 1.15 s deadpan silence after line 3.
- **Takeaway:** "Stir, spread, let it stand." shown over the steaming bowl and the satisfied taste (23.15–26.3 s, no VO).
- **CTA:** a wide café shot with the microwave and steaming bowl, the Recall pill, and the CTA caption in the final 3.65 s.
- **Audio:** the accepted score engine and chord sequence from F01, retimed (`music_sections` in timeline.json). Foley follows each action (beeps, door latch, steam, spoon, hum, wave pings, turntable motor).

## Progress
- 2026-11-03: context reread; no generation was active; topic history clear; research done (above); narration generated (74 words, ASR exact); scene/choreography/audio built from F01 tooling in `production/30s/2026-11-03-round-02/`; preview stills reviewed and fixed (hook framing, display insert size, steam look, giant framing, wave visibility, spot opacity, CTA framing). Mix −14.6 LUFS, −1.6 dBTP, voice +14.9…+16.9 dB over bed. Full render started.
