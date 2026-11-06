# 11 — Production format: Recall (durable; current direction for every new Recall video)

**Current direction set 2026-11-02 by the user's feedback round (`2026-11-02-feedback-round`). It supersedes all earlier
format directions.** No automation has been created.

## Genre (locked)
**Useful educational stories about technology or how the world works.** Each video follows an everyday problem to the
mechanism behind it and ends with a clear, practical takeaway a general viewer can use. It is a story, not a quiz.

**Retired, do not use again:** the quiz/game-show direction (rounds 01 and 02) — no GUESS/REPLAY/command slams, no
answer chips, countdowns or fuses, no "grade-N" tests, no lives/stamps game UI, and no Microgame Frenzy home stage. The
Microgame Frenzy module and its rules in `production/30s/2026-11-02*/docs/STYLE-ADAPTATION.md` are historical only.

## Style
**Low-poly Everyday Discovery**: the full recipe is in `context/15-style-low-poly-everyday-discovery.md` (the style,
not a rendering library). In short: a cinematic, flat-shaded low-poly real-world set with warm directional light and real
depth; one original everyday human, only when the story needs one, acting through reactions (no talking head); hard cuts
between the person's problem, a readable physical screen and an oversized 3D "mechanism" object; comedic timing; Recall
lime/off-white accents.

## Every episode (30.000 s)
| beat | time | rule |
|---|---|---|
| strong opening | 0–3 s | the everyday problem plus the question in one line; something visibly happens |
| mechanism | 3–14 s | distinct scenes that show the mechanism as it is narrated; a mechanism diagram in 3D |
| limit / failure | 14–23 s | what breaks it, shown physically, with a reaction beat |
| takeaway | 23–26 s | the practical rule, shown (not a text slide) |
| CTA | final 3–4 s | spoken + visible: **"Download Recall for learning any new subject with AI."** (user's sheet feedback, 2026-11-03; replaces "Follow Recall for …"), with the small Recall mark; no learning guarantee or outcome claim |
- Narration 55–75 words, concise, no filler or empty motivational claims. Material qualifications go briefly inside the
  relevant sentence ("some", "may"). No long disclaimers, no fixed percentages unless a source states them exactly,
  and no universal-behaviour claims.
- Claims are researched from reliable original sources (inventor, standards body, institutional or textbook pages),
  recorded in `docs/SOURCES.md` and the publishing copy. Demonstrations that viewers could test (codes, numbers) must
  be real and verified (e.g. decode a generated QR code with a real decoder). No invented machine-readable result.
- No invented app capability, guarantee, statistic, income or testimonial.

## Delivery spec
1080×1920, 30 fps, exactly 30.000 s / 900 frames, H.264 yuv420p + AAC 48 kHz stereo.
Output path: `videos/recall/production/30s/<date-or-round>/recall-30s-<name>.mp4`. Source, notes and QA stay in the repo;
only finished MP4s go to a local review folder. Re-render if text is small, obstructed or a scene is static. A contact
sheet, a static page or a page with camera bobbing is never the deliverable.

## Safe areas (1080×1920)
| zone | rule |
|---|---|
| y < 300 | no meaningful text (platform account overlays) |
| captions | text ink about y 340–520, x 90–990, max 2 readable lines (Fredoka 600 ≥ 46 px), no overlaps |
| diagrams / screens | crucial diagrams and screen text in the central region (x ≈ 120–960, y ≈ 560–1450), away from side/bottom UI |
| y > 1500 | nothing essential |

## Audio
- Narration: Kokoro-82M v1.0 ONNX (Apache-2.0) via kokoro-onnx 0.6.1, the established "Meshline"/Recall voice:
  **af_bella 0.7 + am_puck 0.3, en-us, speed 0.98**. The cached model is reused (model.onnx sha256 8fbea51e…34cb).
- Music: subtle, original, no repetitive or distracting loops (evolving pads with sparse, varied notes). Voice is
  clearly on top. Foley follows the on-screen action.
- Loudness −14 to −16 LUFS, true peak ≤ −1 dBTP. One ASR + timing pass.

## Palette and brand
Recall accents from `assets/icon.png`: lime `#C7F36B`, paper `#F8FAF3`, ink `#20251B`. The environment uses warm real-world
neutrals; lime marks the mechanism and the brand. The Recall icon may appear in-world (e.g. as a logo) and in the CTA.

## Pipeline (implementation, not style)
Three.js (npm, pinned) flat-shaded meshes in preinstalled Playwright/Chromium (SwiftShader), 3 workers; PNG frames → x264
CRF 17 + AAC 192k with exact `-t`. Per-frame overlay boxes and safe anchors are logged; QA checks ffprobe, frames, full
decode, loudness, ASR, caption bounds and representative/transition frames.

## History
- 2026-11-02 round 01 (12) and batch 02 (13): quiz/game-show direction with Microgame Frenzy; retired by this file.
- 2026-11-02 feedback round 01 (14): first Low-poly Everyday Discovery episode (QR codes and logos).
- 2026-11-03 round 02 (16): second Low-poly Everyday Discovery episode (microwave cold patches); same performer/set/caption/voice;
  CTA corrected to the user's wording ("with AI" is the user's statement; not found in the saved listing or public site text, see 16).
- 2026-11-03 Hindi 03 (17): **language correction (user)**: when a round asks for Hindi, ALL narration and captions are natural
  Hindi in Devanagari, spoken by a genuinely Hindi-capable local voice (Kokoro v1.0 official Hindi voices hf_beta 0.7 +
  hm_omega 0.3, lang hi, speed 0.98; never the English blend), checked with multilingual ASR; captions use Baloo 2 (OFL,
  Devanagari) in the same pill treatment; CTA in Hindi ("कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें।").

- 2026-11-06 english-06 (20): **language override (user)**: when a round asks for English, ALL narration and captions are English
  (the accepted English blend af_bella 0.7 + am_puck 0.3, en-us, 0.98; Fredoka captions); never Hindi, and Hindi audio is never recycled.

## Episodes produced (do not repeat topics)
| # | topic | output | context |
|---|---|---|---|
| 01 | Steel ball sinks, steel ship floats (quiz format, retired) | `production/30s/2026-11-02/recall-30s-production-01.mp4` | 12 |
| 02 | A kilo of steel vs feathers (quiz format, retired) | `production/30s/2026-11-02-batch-02/recall-30s-production-02.mp4` | 13 |
| F01 | Why QR codes can still scan with a logo in the middle | `production/30s/2026-11-02-feedback-round/recall-30s-feedback-01.mp4` | 14 |
| R02 | Why a microwave leaves cold patches in food | `production/30s/2026-11-03-round-02/recall-30s-round02-01.mp4` | 16 |
| H03 | गीली स्क्रीन अजीब क्यों चलती है? (wet touchscreen; Hindi) | `production/30s/2026-11-03-hindi-03/recall-30s-hindi03-01.mp4` | 17 |
| H04 | इंडक्शन पर बर्तन गर्म कैसे होता है? (induction cooktop; Hindi) — requested microwave-turntable topic was already R02 | `production/30s/2026-11-04-hindi-04/recall-30s-hindi04-01.mp4` | 18 |
| F05 | हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी? (noise-cancelling headphones; Hindi) | `production/30s/2026-11-05-feedback-05/recall-30s-feedback05-01.mp4` | 19 |
| E06 | Why your phone compass points the wrong way near a speaker or a steel desk (English; magnetic interference vs GPS location) | `production/30s/2026-11-06-english-06/recall-30s-english06-01.mp4` | 20 |
| E07 | Why does your phone rush to 80% then crawl to 100%? (English; constant current → constant voltage, heat pause) — the suggested microwave topic was already R02 | `production/30s/2026-11-06-english-07/recall-30s-english07-01.mp4` | 21 |
| E08 | Your eyes can't see this remote's light. So why can your phone camera? (English; infrared remote + camera test) — the suggested ANC topic was already F05 | `production/30s/2026-11-07-english-08/recall-30s-english08-01.mp4` | 22 |
