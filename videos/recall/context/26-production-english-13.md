# 26 — English-13 (2026-11-13 batch): "Why an elevator feels heavier as it starts rising"

**Output:** `videos/recall/production/30s/2026-11-13-english-13/recall-30s-english13-01.mp4` + separate vertical thumbnail
`recall-30s-english13-01-thumbnail.png`.

**Format:** 11, with this batch's changes (below). **Style:** 15, unchanged (same performer, café, lime/paper/ink palette,
Fredoka caption pill, English voice). **Language:** English narration and captions only. Previous MP4s are preserved, and no
automation was created. "english-13" is the user's batch name; there is no english-12 for Recall.

## Request essentials (user; facts about the brief)
- Next educational episode "updated from Published apps, Satisfied? column, latest approved feedback retained"; batch
  13 Nov 2026. This app was on hold; the user explicitly authorised this ONE video. Separate from an unrelated Discover
  short-film request (not touched).
- Topic: why an elevator feels heavier before/as it starts rising — acceleration changes the normal force; scale reading up
  while accelerating upward, back at constant speed, down while slowing; distinguish mass from apparent weight. If covered,
  choose another everyday mechanism.
- **Theory of marketing:** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA; suspense from a real
  question; no repeated answers or padding. **Pacing:** 0–3 s hook, 3–5 s escalation, 5–21 s explanation + proof with scene
  changes, 21–27 s concrete takeaway, 27–30 s CTA. **Thumbnail:** separate, vertical, 2–4 large words.
- One visual idea at a time; labels large and brief; captions readable within **x 100–900, y 230–1500**; captions, labels
  and paragraphs must not compete; sequential diagram reveals; no decorative lines; meaningful motion.
- Verify claims; separate measured facts, estimates and illustrative assumptions; sources in notes; no invented functionality;
  no boilerplate warnings. CTA must match verified Recall app context.
- Render, full decode, check codecs/duration, inspect transitions, "listen through" (see Limits), caption sync, clipping,
  missing assets; attach MP4 + thumbnail; report honestly. Save only completed MP4s in the user review folder when downloaded
  (that folder is not reachable from this cloud session).

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/recall` at fe2dcab (E11 final), equal to the remote;
  tree clean; no running jobs. Git author is session-managed; CLAUDE.md names the assigned account amir@tensorblue.com.
- **Topic history:** "elevator", "apparent weight", "normal force" appear in no earlier episode or context. Batch 02 (kilo of
  steel vs feathers, retired quiz format) touched mass but asked a different question. Topic **kept**.

## Final script (81 words, 25.63 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.20 | The elevator starts up, and the scale jumps from 75 to 84 kilos. | 4.83 |
| l02 | 5.30 | Did you gain nine kilos? No. | 2.02 |
| l03 | 7.65 | A scale reads how hard it pushes up on you. | 2.25 |
| l04 | 10.25 | To speed you up, it must push harder than gravity pulls. | 3.07 |
| l05 | 13.70 | At steady speed, the push matches gravity again. | 2.86 |
| l06 | 16.95 | Slowing at the top, it pushes less, so you read lighter. | 2.97 |
| l07 | 20.40 | Your mass never changed. Only the push did, while your speed was changing. | 4.35 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map and facts-vs-assumptions table in the output folder's `docs/SOURCES.md`)
- **OpenStax College Physics 2e §4.7**, worked example "What Does the Bathroom Scale Read in an Elevator?": 75.0 kg man,
  1.20 m/s² upward → "F_s = 825 N" vs "his 735-N (165 lb) weight"; "the scale is pushing up on the person with a force greater
  than his weight, as it must in order to accelerate him upward"; constant velocity → "735 N, which equals the person's weight";
  accelerating downward → "less than the weight of the person".
- **OpenStax University Physics Vol. 1 §5.4 Mass and Weight:** "Unlike weight, mass does not vary with location."
- **NIST "SI Units – Mass":** mass = inertial property / how much matter; weight = "the force exerted on it by gravity or the
  force needed to support it", in newtons.
- **Facts vs assumptions:** 84.2 kg and 75.0 kg are arithmetic from the textbook example (not a measured elevator); 65.8 kg
  assumes the same 1.20 m/s² while slowing (illustrative); the car's ride timing is compressed (illustrative).

## CTA check (verification result + decision)
- `assets/listing.json` (approved): "Turn your study material into lessons, practice and spaced reviews." The earlier CTA's
  "with AI" was never confirmed (context 16).
- This brief asks for a CTA that "matches verified Recall app context", so E13 uses the listing's wording: **"Download Recall
  to turn your study material into lessons."** (no guarantee, no unverified feature). Earlier episodes keep their CTA. If the
  user prefers the earlier wording, it is a one-line change in `script.json` (re-run TTS, mix and build).

## Creative decisions (choices, not facts)
- **Same performer and café;** the performer gets simple legs and shoes at runtime (first full-body episode; the shared rig is
  unchanged). New set: a cutaway elevator car (wood panels, lime stripe, handrail, floor indicator) riding up a concrete
  shaft with numbered floors.
- **Hook:** shoes on a bathroom scale; the display leaps 75.0 → 84.2 kg at 0.7 s. **Super hook:** "Did you gain nine kilos?
  No." (hand to belly, head shake).
- **Proof:** the floor's push (lime, from the floor) and gravity (coral) drawn to the same scale side by side, with a short
  dashed reference at gravity's length: the push's extra length lights up while speeding up, they match at steady speed,
  and a faint coral gap shows the missing push while slowing. One large reading chip ("scale 84.2 kg") and one or two brief
  labels at a time. Three camera angles for the three phases.
- **Payoff:** "mass: 75 kg", then a speed-over-the-ride graph drawn in three colours with the readings 84 / 75 / 66.
- **Captions:** the accepted Fredoka pill, centred at x 540 with text at most 660 px wide so text and pill stay inside
  x 100–900 (QA checks the new bounds); labels limited to x 100–900.
- **Thumbnail:** the hook's close-up with "HEAVIER / GOING UP?" (3 words) and the Recall pill; rendered in the same browser
  page (`render.mjs --sheet`).
- **Audio:** accepted score engine retimed; lift chime, start jolt, motor hum, digit beeps, blips for the arrows, arrival ding.

## Skill adjustments learned this round
- The shared performer rig has no legs (the counter always hid them): add legs and shoes for any full-body shot.
- For "same-scale" force comparisons, put both arrows on the same baseline with a short reference mark; highlight the
  difference rather than exaggerating the lengths.
- A thumbnail can be rendered with the episode's own scene and fonts through `__sheetPoses` / `__renderSheetPose`.

## Progress
- 2026-11-13 batch (E13): setup confirmed; topic kept; sources verified (OpenStax ×2, NIST); CTA checked against the listing;
  narration generated (every word heard by ASR); timeline and caption sync pre-check OK (leads 0.07–0.10 s); scene built from
  E11 tooling (explicit composite renderer kept); QA updated for the x 100–900 caption/label area.
- Preview stills reviewed and fixed: legless performer (legs + shoes added); react and payoff framing (head below the
  caption); label/chip overlap; graph label overlap; thumbnail gradient edge.
- Mix −14.61 LUFS, −1.6 dBTP, voice +16.1…+18.1 dB over the bed.
- Full render 1: 24/25 checks passed; caption ink reached x 911 (captions centred at 540; the new area is centred at 500).
  Fix: text at most 660 px wide, still centred (text and pill inside 100–900). Full re-render, re-mux, all QA re-run: 25/25,
  caption ink x 213–866. Committed, pushed and attached (MP4 + thumbnail). No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `4f32aa47b4a4cb52c11a21588c548133392aba1adaa89fd2d9246837309d660e` (9,750,298 bytes); thumbnail
  1080x1920 PNG sha256 `7221cafa…3f3d`.
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- English ASR on the final mix (Whisper base.en): WER 0.012 (only "nine" → "9"); narration within 0.0 ms; 12 spoken caption
  groups appear 0.07–0.10 s before their first word and stay past their last.
- −14.6 LUFS, −1.4 dBTP, 0 clipped samples; voice +16.1…+18.1 dB over the bed.
- Captions English only, ink x 213–866, y 341.5–464.5, ≤ 2 lines; labels inside x 110–890, y 566–1455; no overlaps; longest
  static run 21 frames.
- Limits: no human listening (ASR and level measurements only); readings from a textbook example, the slowing reading an
  assumption, the ride compressed; the review folder is not reachable from the cloud.

## Publishing caption
`production/30s/2026-11-13-english-13/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l07; l08) + one note (textbook example, assumption, compressed ride) + 3 sources + hashtags. App
identity: Recall; no other app names; no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-13-english-13 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → thumbnail →
qa/qa.py → qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
