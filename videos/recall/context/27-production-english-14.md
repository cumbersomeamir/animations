# 27 — English-14 (2026-11-14 batch): "Why an open fridge makes the kitchen warmer"

**Output:** `videos/recall/production/30s/2026-11-14-english-14/recall-30s-english14-01.mp4` + separate vertical thumbnail
`recall-30s-english14-01-thumbnail.png`.

**Format:** 11 with the 2026-11-13 batch note (marketing structure, thumbnail, captions/labels x 100–900, verified CTA).
**Style:** 15, unchanged (same performer with the E13 legs, café, palette, Fredoka caption pill, English voice). **Language:**
English narration and captions only. Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Next educational episode, batch 14 Nov 2026, "updated from Published apps, Satisfied? column, latest approved feedback
  retained"; same rules as E13 (theory of marketing; pacing 0–3 / 3–5 / 5–21 / 21–27 / 27–30 s; separate vertical
  thumbnail with 2–4 large words; one visual idea at a time; brief large labels; captions readable within x 100–900,
  y 230–1500; sequential reveals; verified claims with facts vs assumptions in notes; no invented functionality; no
  boilerplate warnings; render + decode + transitions + caption sync + clipping + missing assets; attach MP4 + thumbnail;
  honest limits).
- Suggested topic: "How noise-cancelling headphones create more sound to make less noise" (superposition, inverted noise
  signal, active vs passive, timing and fit; no perfect-silence claim). "If this topic overlaps a previous episode, select a
  genuinely different same-genre topic before scripting." Preserve the latest accepted style, narrator and CTA.
- Separate from an unrelated Discover short-film request (not touched).

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at 38ea172 (E13 final), equal to the remote;
  tree clean; no running jobs. Git author is session-managed; CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** the suggested ANC subject is **F05** (context 19: the outside mic hears the noise, the speaker plays the
  inverted wave, it is a little late, so it works on steady low hum, not voices) — a direct overlap (it also made E08 change
  topic). Chosen instead: **why an open fridge makes the kitchen warmer** (a fridge pumps heat; payoff: why an air
  conditioner's hot side is outdoors). Fridges, heat pumps and air conditioners appear in no earlier episode.

## Final script (86 words, 26.63 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.20 | Leave the fridge open on a hot day, and the kitchen gets warmer. | 3.63 |
| l02 | 4.10 | So how can a cold box heat a room? | 1.83 |
| l03 | 6.30 | A fridge doesn't make cold. It pumps heat. | 2.46 |
| l04 | 9.15 | Cold fluid in the inside coils evaporates, soaking up your food's heat. | 4.26 |
| l05 | 13.80 | A compressor squeezes it hotter than the room, and coils outside the box release that heat. | 4.97 |
| l06 | 19.15 | Door open, that heat just circles back, plus the motor's own. | 3.48 |
| l07 | 23.00 | That's why air conditioners dump their heat outdoors. | 2.73 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

- Iterations: a final "Why?" in l01 was dropped by ASR → moved into its own question line (l02); "boils" was heard as "biles"
  → "evaporates".

## Sources (quotes, claim map and facts-vs-assumptions in the output folder's `docs/SOURCES.md`)
- **OpenStax College Physics 2e §15.5:** "Heat pumps, air conditioners, and refrigerators utilize heat transfer from cold to
  hot."; Q_h = Q_c + W; the evaporator, compressor ("increases the temperature and pressure of the gas"), condenser ("Because
  the temperature of the gas is higher than the temperature inside the room, heat transfer to the room occurs"), expansion
  valve; "What is considered the benefit in a heat pump is considered waste heat in a refrigerator."
- **University of Illinois Physics Van, "Open Refrigerator":** heat "is usually blown out the back of the fridge by a little
  fan"; "even if you open the fridge door … the fridge will still be heating the room more than cooling it"; "The average room
  temperature in the room will rise."
- **Energy Education (U. Calgary), "Refrigerator":** "a refrigerator must exhaust more heat to the room than it removes from
  the inside." **"Air conditioner":** heat moved "to some outside area"; condenser coils transfer heat "to the outside air".
- **Facts vs assumptions:** the warming is a principle, not quantified (thermometer needles move slightly, no numbers); heat
  bits, fluid colours and coil layout are illustrative.

## CTA
Same verified wording as E13 (listing-based): "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Hook:** the performer swings the café fridge open on a hot afternoon (light, spilling cold mist) and fans their face; a
  window thermometer creeps up ("warmer").
- **Mechanism set:** a giant side-cutaway fridge with insulated walls, frosty inside coils, a compressor and dark outside
  coils; refrigerant blobs travel the loop and change colour (cold blue → warmer while absorbing → hot red after the
  compressor → cream after the outside coils → blue after the valve); orange heat bits move from the food into the coils and
  out of the back. The door-open shot loops the heat bits around the fridge, with red motor heat joining.
- **Payoff:** a room cutaway with a split air conditioner — cool air inside, heat leaving through the outdoor unit; the room
  thermometer falls.
- **Thumbnail:** dedicated camera (face below the words), "OPEN FRIDGE, / HOTTER ROOM?" + Recall pill.
- **Audio:** door unseal and swing, mist hiss, fanning, compressor hum and thumps, bubbling, whooshes, fan whir, chime.

## Skill adjustments learned this round
- A thumbnail often needs its own camera: the hook framing can put the title over the face.
- Heat or particle flows need larger bits in wide shots (scale 1.6–2 vs close-ups) to stay readable.
- Short one-word questions at the end of a TTS line ("Why?") can be dropped by ASR: give questions their own line.

## Progress
- 2026-11-14 batch (E14): setup confirmed; topic changed (ANC = F05); sources verified (OpenStax, U. Illinois, U. Calgary ×2);
  narration generated (two fixes); timeline and caption sync pre-check OK (leads 0.07–0.10 s); scene built from E13 tooling.
- Preview stills reviewed and fixed: react framing (face cut), giant_pump/loop framing, larger heat bits in wide shots, AC
  layout and lighting (units in frame, no wall shadow over the room), thumbnail word size (inside x 100–900) and framing.
- Mix −14.65 LUFS, −1.6 dBTP, voice +16.5…+19.4 dB over the bed.
- Full render (`WORKERS=3 ./build.sh`, one process): all 25 checks, narration sync and caption sync passed on the first render;
  sheets reviewed (no stale overlays). Committed, pushed and attached (MP4 + thumbnail). No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `4fd2be2ecde5f32d65cc730c4ede9d1d9fffd6c91c991190385468883bb0aeae` (12,370,821 bytes); thumbnail 1080x1920
  PNG sha256 `de81f5b1…049b`.
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- English ASR on the final mix (Whisper base.en): WER 0.0; narration within 0.1 ms; 12 spoken caption groups appear
  0.07–0.10 s before their first word and stay past their last.
- −14.7 LUFS, −1.5 dBTP, 0 clipped samples; voice +16.5…+19.4 dB over the bed.
- Captions English only, ink x 212–868, y 341.5–464.5, ≤ 2 lines; 7 labels, one at a time, inside x 110–890, y 566–1459;
  no overlaps; longest static run 6 frames.
- Limits: no human listening (ASR and level measurements only); warming not quantified and visuals illustrative; the review
  folder is not reachable from the cloud.

## Publishing caption
`production/30s/2026-11-14-english-14/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l07; l08) + one illustration note + 4 sources + hashtags. App identity: Recall; no other app
names; no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-14-english-14 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
