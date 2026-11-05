# 10 — Educational progress (active; reread with CLAUDE.md on every resume)

Brief: 08 (strategy) + 09 (pilot 01 brief/storyboard). Pilot folder: `videos/recall/education/pilot-01/`.
Prior deliverables preserved: `output/recall-30s.mp4` untouched; 06 15 s test = not started (honest status in 07).

## Verified facts (evidence, not opinion)
- Repo `cumbersomeamir/animations`, branch `claude-video/recall` (only branch used), workspace `videos/recall/`.
- `assets/icon.png` sha256 c059d0e0…2962 and `assets/listing.json` sha256 1f92917f…f039 match 03-assets.json.
- Icon palette measured from pixels: lime #C7F36B (169 260 px), paper #F8FAF3, ink #20251B.
- Physics sources (accessed 2026-11-02): OpenStax College Physics 2e §11.7 + Table 11.1 (steel 7.8, water 1.000,
  sea water 1.025 ×10³ kg/m³); OpenStax University Physics 1 §14.4 (average density decides; clay boat vs lump;
  "The same is true of steel ships."); Gard Insights 2012 (ship interior mostly air; floating object displaces its own
  weight). Claim map: `pilot-01/docs/SOURCES.md`. Britannica returned 403 (not used). Instagram references not viewed.
- Physics model (from `web/physics.js`, printed by the renderer): ball r 0.10 → V 0.004189; floating hull displaces
  7.8 V = 0.032673; tank area 0.52; level rise ball 0.00806 vs hull 0.06283 (ratio 7.80); hull draft 0.173 of 0.28
  depth (freeboard 0.107); hull could displace 1.64× what it needs before swamping.
- Narration (Kokoro, blend 0.6 af_heart + 0.4 bf_emma, speed 0.92): 38 words, 12.07 s of speech, 2.53 words/s
  overall; per-line ASR on the WAVs matched the script exactly (faster-whisper base.en).
- Mix (audio/mix.py): −16.06 LUFS integrated (BS.1770 in-script), sample peak −1.5 dBFS, voice over bed
  +9.9 … +13.3 dB per line.

## Creative decisions (choices, not facts)
- Performer: **Kip, the clay explorer** (original). Lime helmet + scarf, gumdrop clay body, ink brows; see
  `pilot-01/docs/CHARACTER.md`. Rendered at scale 1.2.
- Medium: Three.js 0.186.1 clay diorama rendered in headless Chromium (SwiftShader) via Playwright 1.63, PNG frames →
  FFmpeg x264 CRF 16. Fredoka 600 captions (ink pill, lime key words), Inter only for QA sheets.
- Story devices: "rewind + pause" (finger twirl) to inspect the submerged ball with only weight and water's push
  acting; same steel morphs ball → hollow hull (pinch-pot squish); lime glow = water pushed aside; gauge shows
  "ball" vs "hull" level marks (computed 1 : 7.8); "=" when arrows balance; flag marks the finding.
- Functional colours outside the icon palette: water #8ED6C4, steel #AEB5BA, tank backing #23352F, sea strips.
- Music/SFX: original numpy synthesis; music muffled during the pause; ducked under voice.
- Signature: small ink pill with icon + "Recall" from 12.9 s. No CTA, no product claims.

## Skill provenance / adaptations
- Local `.claude/skills/animation-direction/SKILL.md` (read): used storyboard-first with action verbs, anticipation →
  action → impact → recovery, props for cause and effect, full render + boundary frames + contact sheet + ffprobe +
  full decode, record commands. Adapted: stickman/editorial 2D → tactile 3D clay (brief requires clay explorer);
  pycairo not used.
- `nispa/stickman-video` SKILL.md (read-only via web fetch; no scripts run): adopted cue-anchored timing, 2.4–2.7
  words/s with voice, per-line speed check (<~3.3 w/s; ours 2.8–3.4, n1b 3.42 and n2 3.35 slightly above — kept
  because ASR is exact and overall pace is 2.53 w/s), SFX on the same cues as actions, music ducking, contact sheet
  before full render, no stillness > 2 s. Not adopted: Remotion, line-art rig, stickman grounding helper.

## Commands
```bash
cd videos/recall/education/pilot-01
npm install                    # three 0.186.1, @fontsource/fredoka 5.3.0
(cd audio && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -r requirements-qa.txt && ./fetch_models.sh)
audio/.venv/bin/python audio/tts.py          # narration WAVs (committed)
WORKERS=3 ./build.sh                         # mix -> render -> mux -> qa
node render.mjs --sheet build/sheet && audio/.venv/bin/python docs/make_sheet.py
```

## Render / QA state (verified)
- Iteration 1 stills: fixed step showing through tank (opaque backing), Kip too small (scale 1.2), ghost read as a
  solid ball (translucent + dashed outline), label collisions, helmet under captions (camera reframes), pointing
  direction, dark steam puff.
- Iteration 2 stills: fixed hull hiding Kip's mouth (hold lower), shot D framing.
- Render 1 (20 min, 3 workers; superseded, kept only in ignored build/): all technical checks passed, but visual review
  found the mouth invisible (inside the body), a jagged helmet band, a hand plunging into the water at 6.4 s, and the helmet
  under the 2-line caption in shot B. All fixed.
- Render 2 + patch of frames 8–55 (round "O" mouth fix): **FINAL**.
  `videos/recall/education/pilot-01/recall-education-pilot-01.mp4`, sha256 a2bdbc23…5d45, 7 566 681 bytes.
  H.264 High 1080×1920 30/1, 450 frames, video/audio/container 15.000000 s, AAC LC 48 kHz stereo, full decode clean,
  −16.1 LUFS, true peak −1.5 dBFS, 0 clipped samples, ASR WER 0.0, captions y 250–454, no static run, 19/19 checks.
  Evidence: `pilot-01/qa/QA.md`, `qa_report.json`, `ffprobe.json`, `contact_sheet.png`, `boundaries.png`,
  `physics.json`, `audio_report.json`; model sheet `pilot-01/docs/kip-model-sheet.png`.
- Exact final commands: `WORKERS=3 ./build.sh`; then `node render.mjs --pngdir build/patch --from 8 --to 31` and
  `--from 32 --to 55`, copy into build/frames, re-run the ffmpeg mux line from build.sh, then `audio/.venv/bin/python qa/qa.py`.
  (A clean `./build.sh` now reproduces the final in one pass, because the fix is in the source.)

## Unresolved / limits
- Audio judged by measurement and ASR only (cannot listen).
- Instagram references not viewed; only the user's description was used.
- Render speed: SwiftShader ≈ 7 s/frame per worker (≈ 20 min per full render with 3 workers).
- 06 15 s style test remains not started (07).

## Next action
Pilot 01 is complete. Next, on user request: pick one of the 10 titles in 08, write its brief + sources (new 11-*.md),
and reuse `web/character.js`, `clay.js`, `anim.js`, `render.mjs`, `audio/mix.py` and the Kip voice blend in a new
`education/episode-NN/` folder. Do not overwrite pilot-01.

## Update 2026-11-02 — production round `production-30s-2026-11-02`
Newer format: context/11-production-format.md (knowledge challenges, Microgame Frenzy adaptation, "Meshline" voice
config af_bella 0.7 + am_puck 0.3). Round record + QA: context/12-production-30s-01.md. Deliverable:
`videos/recall/production/30s/2026-11-02/recall-30s-production-01.mp4` (30.000 s, verified). Pilot 01 untouched.

## Update 2026-11-02 — production batch `production-30s-2026-11-02-batch-02`
Episode 02 "Which is heavier: a kilo of steel or feathers?" (mass vs volume): context 13; deliverable
`videos/recall/production/30s/2026-11-02-batch-02/recall-30s-production-02.mp4` (30.000 s, verified). Format 11 updated
with the user's batch-02 feedback (3 s think beat, MASS wording, no buoyancy distraction, labelled measuring prop).

## Update 2026-11-02 — feedback round (supersedes the quiz direction)
User feedback retired the knowledge-challenge/quiz format. Genre: useful educational stories about technology or how the
world works, in the "Low-poly Everyday Discovery" style (context 15); format rules in 11 (rewritten). Episode F01
"Why can a QR code still scan with a logo in the middle?": brief, sources, QA and progress in context 14; deliverable
`videos/recall/production/30s/2026-11-02-feedback-round/recall-30s-feedback-01.mp4`. Earlier MP4s untouched.

## Update 2026-11-03 — round 02
Episode R02 "Why a microwave leaves cold patches in food" (Low-poly Everyday Discovery; format 11 with the user's CTA
correction): record in context 16; deliverable `videos/recall/production/30s/2026-11-03-round-02/recall-30s-round02-01.mp4`.

## Update 2026-11-03 — Hindi 03
Episode H03 "गीली स्क्रीन अजीब क्यों चलती है?" (wet touchscreen), fully Hindi (Devanagari captions, Kokoro Hindi voices):
record in context 17; deliverable `videos/recall/production/30s/2026-11-03-hindi-03/recall-30s-hindi03-01.mp4`.

## Update 2026-11-04 — Hindi 04
Episode H04 "इंडक्शन पर बर्तन गर्म कैसे होता है?" (induction cooktop; Hindi). The requested microwave-turntable topic
was already R02, so a distinct topic was chosen (reason in context 18); deliverable
`videos/recall/production/30s/2026-11-04-hindi-04/recall-30s-hindi04-01.mp4`.

## Update 2026-11-05 — feedback-05
Episode F05 "हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी?" (noise-cancelling headphones; Hindi):
record in context 19; deliverable `videos/recall/production/30s/2026-11-05-feedback-05/recall-30s-feedback05-01.mp4`.
