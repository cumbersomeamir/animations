# 34 — English-21 (2026-11-18 batch 21): "This drop is floating" (why a water drop skates on a very hot pan)

**Output:** `videos/recall/production/30s/2026-11-18-english-21/recall-30s-english21-01.mp4` + separate vertical thumbnail
`recall-30s-english21-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes (marketing structure, thumbnail, captions/labels x 100–900,
y 230–1500, frame 0 = thumbnail). **Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill,
English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no automation was created.
**Feedback applied:** the latest Satisfied? answer for Recall is "Yes", so the approved style, palette, narrator, caption treatment,
soundtrack engine and CTA are kept unchanged; only the subject, sets and foley are new.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch21, expressly authorised 18 November … If previous batch20 has checkpointed unfinished work,
  finish and preserve it first, then produce this new episode once; never cancel, overwrite or duplicate earlier jobs."
- Suggested topic: "How a microwave heats your leftovers but leaves a frozen centre: standing-wave hot spots and heat conduction …
  why stirring and standing time help. No quizzes, approved style, big surprising cross-section." "If already covered, choose a
  genuinely different subject in this same genre and explain your choice."
- Same rules as E13–E20 (hook 0–3, optional superhook 3–5, proof 5–21, payoff 21–27, CTA 27–30; frame 0 striking, truthful,
  2–5 words, no fade/logo; captions in the mobile safe area; sources in the project; no operational files in Desktop/video-review;
  no new chat). The other-app notes (Ideaverse, Aarambh, Werbens, Tensorblue, Mello, CalMeter, WastePaisa) do not apply to Recall.

## Order of work
- Batch 20 was still rendering when this brief arrived. It was finished first: full render, QA, docs, commit f94c42c, push and
  attachment. Then E21 started in a new folder; E20's files were not changed afterwards.

## Topic check → topic changed (why)
- The microwave frozen-centre subject is **R02** (2026-11-03, context 16: standing-wave strong/weak spots, outer layers heat first,
  the middle waits for conduction, stir and let stand). E11 covered plate vs food, and the same suggestion was declined for H04 and
  E07. Chosen instead (same kitchen-physics genre, with a big surprising cross-section): **why a water drop skates on a very hot
  pan** — the Leidenfrost effect and the cook's water test. Not covered by any earlier episode; unrelated to E19 (boiling point vs
  pressure) and E20 (refraction).

## Final script (81 words, 26.46 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | This drop is floating. | 1.13 |
| l02 | 1.45 | Make the pan hotter, and it lasts longer, not shorter. | 2.90 |
| l03 | 4.60 | On a warm pan, water touches the metal and sizzles away in seconds. | 4.08 |
| l04 | 8.90 | But on a very hot pan, the underside flashes into steam. | 3.44 |
| l05 | 12.55 | That steam cushion holds it up, and steam carries heat poorly, so the drop skates instead of boiling. | 5.88 |
| l06 | 20.45 | Kitchen test on an empty pan: sizzling means not yet; skating beads mean ready to sear. | 5.75 |
| l07 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

- Iterations: the first tip line ran 6.15 s (too long for the payoff window) and was shortened; "its underside" was transcribed
  "it's underside" and "wait" as "weight" (homophones) → "the underside" and "not yet".

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **J. Walker (Cleveland State University), "Boiling and the Leidenfrost Effect"** (Fundamentals of Physics essay): drops spread
  and vaporise quickly on a plate between 100 and ~200 °C but bead up and last over a minute near ~200 °C — "in a certain
  temperature range, the drops last longer when the hot plate is hotter"; the underside vaporises at once and the vapour layer
  supports the drop; vapour conducts ~10× worse than water; layer ~0.1–0.2 mm; the empty-skillet water test.
- **Mathijssen et al., arXiv:2201.12128** (culinary fluid mechanics review): the water-droplet test before searing a steak;
  sizzling vs levitating without boiling; the cushion insulates; ~100 µm; lifetime up to 10× longer; hotter still shortens it slowly.
- **Brown University News 2019:** sizzle vs "dancing and skittering"; the vapour cushion "supports the drop's weight", insulates it
  and slows evaporation.
- **Emory University News 2021:** drops "levitate just above the pan's surface, sliding across it on vapor layers"; ~80 µm.
- **Facts vs assumptions:** no temperature is narrated (sources give ~150–240 °C depending on surface and method); the cushion is
  drawn far thicker than ~0.1 mm; the orange heat tint on the pan's cut face and the coil glow are illustrative; "lasts longer"
  holds from a warm pan up to around the Leidenfrost point.

## CTA
Same verified wording as E13–E20 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** the giant cross-section: a big glossy drop hovering above the pan, vapour streaming out from under it,
  coil glowing; title "THIS DROP / IS FLOATING". No logo, fade or empty set.
- **Escalation:** the performer flicks water onto the hot café pan, the beads skate, the camera tilts up to a raised brow.
- **Proof:** warm pan (drop lands, flattens, boils, steams away) → very hot pan (underside flashes to steam, bounce, hover) →
  close-ups of the gap (lime "holds it up" arrows; orange heat arrows stopping short: "slows heat") → the drop skates → back to the
  real pan, beads still skating ("lasts longer").
- **Payoff:** top view of the empty café pan: two sprinkles that sizzle away ("not yet"), then a hotter pan where the beads skate
  ("ready to sear").
- **Fixed during preview review:** oversized arrow heads and vapour dots in the close-ups, a steam layer that read as a pedestal,
  a react shot that hid the pan (now a tilt from pan to face), beads too big, faint sizzle puffs, a pale pan.

## Skill adjustments learned this round
- Finish a running batch before starting the next one; keep each in its own folder and commit.
- Homophones again ("its"/"it's", "wait"/"weight"): reword before rendering.
- Close-ups of a thin layer need thin arrows and small particles; scale effects to the camera distance.

## Progress
- 2026-11-18 batch 21 (E21): setup confirmed; topic changed (microwave = R02); sources verified (Walker, Mathijssen et al., Brown,
  Emory); narration generated (two rewordings for ASR, one trim for timing); timeline and caption-sync pre-check OK; giant pan and
  café pan sets built on E19/E20 tooling; three preview passes (fixes above). Mix −14.58 LUFS, −1.6 dBTP, voice +16.3…+20.5 dB
  over the bed. Source checkpoint a22789c pushed before the full render.
- Full render: see QA summary.

## QA summary (verification results; details in the output folder's qa/QA.md)
- (filled in after the full render)

## Publishing caption
`production/30s/2026-11-18-english-21/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l06; l07) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app names.

## Exact commands
`cd videos/recall/production/30s/2026-11-18-english-21 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `TTS=1 ./build.sh` also regenerates the narration; `python3
make_caption.py` regenerates the post copy.

## Next
Only on user request.
