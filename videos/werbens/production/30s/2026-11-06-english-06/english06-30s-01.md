# 21 — English-06 (batch 2026-11-06-english-06) 30 s #01: "75% lean, or 25% fat?" (attribute framing)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · assigned account
info@tensorblue.com (CLAUDE.md) · batch `2026-11-06-english-06`. Repo/branch confirmed (origin = github.com/cumbersomeamir/
animations, branch claude-video/werbens, HEAD edebd10 == origin, clean tree) before any edit; no jobs were running.
Output: `videos/werbens/production/30s/2026-11-06-english-06/werbens-30s-english06-01.mp4`
Format/style: `context/11` (accepted "Satisfying Product Theatre" recipe + renderer, unchanged). English voice: context/11 +
context/16 (Meshline/Recall). Brand: `context/17`. Copy in the output folder: `english06-30s-01.md`.

## 1. Brief (user-approved)
- ONE new finished 30.000 s **English** educational episode (English narration AND English captions only, never Hindi);
  approved voice character via an English-capable local voice; no recycled Hindi audio. Fixed genre + accepted motion-graphics
  skill (Three.js is only the renderer). Immediate visual hook in 1–2 s; a concrete demonstration and takeaway; one short
  truthful CTA in the last 3–4 s; quiet music; checked pronunciation; no filler, repeated disclaimers, invented features or
  guaranteed outcomes; claims verified against primary sources.
- Suggested topic: "showing the product in use beats saying premium quality — two fictional backpack ads (laptop fitting,
  rain beading), no unsupported waterproof claim" — **with the instruction to pick a fresh, equally useful subject in the same
  genre if it already exists.**
- Delivery: this path only; push only the app branch; attach the MP4. Desktop/video-review does not exist in this cloud
  container. No renaming, new chats, other videos, Drive upload or automation.

## 2. Topic-overlap decision (why the suggested topic was replaced)
The episode log (context/11) already covers it: **#01** "A feature is not yet a benefit" used a *fictional backpack*
(water-resistant ≠ waterproof, drizzly-commute demo), and **#05/#06** (hindi-03/04) taught "show it working / a fair
before/after beats premium adjectives". The backpack-in-use idea would repeat both. Chosen instead: **attribute framing**
(the unproduced context/08 idea "Framing — lean vs fat"): the same product with the same numbers is judged differently
depending on which side of the number you lead with, and the product experience narrows that effect. Lesson: lead with the
positive side, keep every number true, and let the product carry the rest. Not covered before.

## 3. Brand re-check (facts; container clock 2026-11-05)
app.werbens.com re-loaded in headless Chromium (HTTP 200 → /app): top-40 computed colour list identical to the previous check
(#0F172A, #F0FDFA, #316879, #7FE7DC, #5CE0D2, #0B1120, #64748B, #F59E0B, #FFFFFF …); wordmark unchanged (Space Grotesk 700,
30.4 px, −1.216 px, `linear-gradient(135deg, #7FE7DC, #316879)`); Login button #316879; `werbens-logo.svg` byte-identical
(sha256 816c1761…). Amber #F59E0B (a measured site accent) is used only for the "25% FAT" card and the fat block.

## 4. English voice + checks
- Voice: the accepted Meshline/Recall host — Kokoro-82M v1.0 (q8) style blend **af_bella 0.7 + am_puck 0.3**, speed 0.98,
  en-us (`src/narration.js`, `src/tts.mjs`), newly synthesised for this script. No celebrity/voice imitation; no Hindi audio.
- Pronunciation: established override `wˈɜːbənz → wˈɜɹbɛnz` ("Werbens"); new `fˈɜːst → fˈɜɹst` (Kokoro's G2P gave the
  non-rhotic "first" for en-us). Digits are read correctly by the G2P: "75%" → seventy-five percent, "1988" → nineteen
  eighty-eight (checked in the phoneme strings).
- Script fix before recording: "lead with what your product has, not what it lacks" was replaced — a 75/25 product *has*
  the 25 % fat, so "lacks" would be wrong for this example. Final: "lead with the positive side, not the negative one."
- Whisper base.en per line (clean narration): L1 heard "75% lean or 25% fat." (exact) · L2 8/8 · L3 15/15 · L4 6/6 ·
  L5 10/10 · L6 4/4 · L7 10/10 · L8 6/7 ("Werbens" → "Warbins", the documented vocabulary limit; the name is on screen).
- Caption timing: Whisper word times + `WORD_FIX` onsets read from the voiced segments of each clip (10 ms envelope) where
  Whisper drifted (e.g. "same numbers", "study", "when it was labeled lean", "tasting", "positive", "product").

## 5. Facts used (verified 2026-11-05 unless noted)
| Claim (line) | Source |
|---|---|
| L3 "In a 1988 study, people rated the same meat more favorably when it was labeled lean." | Levin, I. P., & Gaeth, G. J. (1988). How Consumers are Affected by the Framing of Attribute Information Before and After Consuming the Product. *Journal of Consumer Research*, 15(3), 374–378. https://doi.org/10.1086/209174 (Crossref metadata; abstract via OpenAlex): "Consumers rated several qualitative attributes of ground beef that framed the beef as either '75% lean' or '25% fat.' The consumers' evaluations were more favorable toward the beef labeled '75% lean' than that labeled '25% fat.'" The narration says "meat" (the study's product was ground beef); the on-screen trays are generic unbranded mince packs. |
| L4 "After tasting it, that gap shrank." | Same abstract: "the magnitude of this information framing effect lessened when consumers actually tasted the meat." The animation narrows the gap but does not close it. |
| L5 "So lead with the positive side, not the negative one." | Practical principle derived from the result above (positive attribute frame → more favourable evaluation). Not presented as a sales or conversion effect; no numbers claimed. |
| L6 "Keep every number true." | ASCI Code, Chapter I "Truthful & honest representation" (re-read 2026-11-05): "Advertisements must be truthful. All descriptions, claims and comparisons, which relate to matters of objectively ascertainable fact, should be capable of substantiation." https://www.ascionline.in/the-asci-code/ — shown as "75% + 25% = 100%" over the returning 3+1 blocks: the reframed pack keeps the full 75/25 composition visible. |
| L7 "The frame shapes first impressions; the product shapes the rest." | Same abstract: "a diagnostic product experience dilutes the impact of information framing" (averaging model). Phrased as a principle. |
| Trays, cards, rating tubes | **Fictional illustration**; the tubes carry the chip "Ratings shown: illustration, not study data" — no study values are drawn. |

## 6. Final script (= final transcript; Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98) — 66 words as written, 24.1 s of speech
| Line | Clip on air (s) | Text |
|---|---|---|
| L1 | 0.30–3.50 | 75% lean, or 25% fat? |
| L2 | 4.00–7.15 | Same tray. Same numbers. Only the frame changed. |
| L3 | 7.65–13.39 | In a 1988 study, people rated the same meat more favorably when it was labeled lean. |
| L4 | 13.85–15.61 | After tasting it, that gap shrank. |
| L5 | 16.10–19.33 | So lead with the positive side, not the negative one. |
| L6 | 19.75–20.96 | Keep every number true. |
| L7 | 21.50–24.95 | The frame shapes first impressions; the product shapes the rest. |
| L8 | 26.10–28.42 | Follow Werbens to decode how brands sell. |
Publishing caption (`publishing-caption.txt`) = this transcript verbatim + a one-line fiction note + sources; no editing notes.

## 7. Approved style notes + skill adjustments (saved for future generation)
- Same renderer/studio/caption treatment/CTA as feedback-05 (`src/` copied; episode objects, English captions and English
  narration tools from round-02 swapped in). Captions: Inter Display ExtraBold 54/62 in the accepted pill, word groups that
  brighten as spoken, mint highlights on the key words.
- Hook from frame 1: two identical unbranded mince trays are already falling on frame 0 and land on display stands; "75% LEAN"
  (mint) slams onto the left on "75%", "25% FAT" (amber) onto the right on "25%"; "?" between them on "fat".
- Demonstration: both trays hop together on "Same tray" ("=" between them); identical 3 mint + 1 amber blocks drop in on
  "Same numbers"; teal picture frames drop around both labels on "frame"; on "changed" the left lifts its three lean blocks and
  the right lifts its one fat block (same numbers, different part in focus). Study: pull back, "Levin & Gaeth, 1988" note;
  rating tubes rise on "people rated", fill equally, the left rises on "more favorably" (gap bracket, labelled illustration);
  one shared sample plate slides in, a fork lifts a bite on "tasting", the gap narrows on "shrank" (not to zero). Lesson: a
  positive "75% LEAN" card slaps over the right label on "positive" and the "25% FAT" card slides out from under it on
  "negative"; the 3+1 blocks return on "Keep every number true" with "75% + 25% = 100% ✓"; frames glow on "frame", lift away on
  "product" while the sample plate returns. CTA: app.werbens.com logo tile lands (26.28 s), wordmark on "Werbens".
- Reusable lessons: (1) check that the lesson's wording fits the example ("lacks" did not); (2) the same props carried
  through the whole episode keep a comparison readable; (3) illustrative meters need an on-screen "not study data" chip;
  (4) portrait framing of two side-by-side packs needs tall packs, otherwise the frame is mostly empty.

## 8. Storyboard (as built; `src/timeline.js`)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Hook | 0–3.85 s | front, slow push | trays fall (frame 0) and land; labels slam on "75%"/"25%"; "?" | 2 thuds, 2 stamps, tag |
| Same | 3.85–7.4 s | front | hop on "Same tray" + "="; 3+1 blocks on "Same numbers"; frames on "frame"; split on "changed" | thud, tag, 4 clacks, clank, pop |
| Study | 7.4–13.6 s | pull back | blocks sink; source note; tubes rise, fill, left rises on "more favorably"; left label pulses on "lean" | sink, tag, whoosh, pour, glow |
| Taste | 13.6–15.9 s | wide | plate in; fork bite on "tasting"; gap narrows on "shrank" | slide, clink, toss, sink |
| Lead | 15.9–19.6 s | gentle push | tubes + plate out; positive card slaps on "positive"; old card slides out on "negative" | slide, stamp, peel, card |
| True | 19.6–21.4 s | front | 3+1 blocks return; "75% + 25% = 100% ✓" on "true" | 4 clacks, tick |
| Rest | 21.4–25.75 s | front, slow push | frames glow on "frame"; lift away + plate returns on "product" | shimmer, whoosh, settle |
| CTA | 25.75–30 s | push to front | trays + plate slide off; logo tile lands; wordmark on "Werbens"; tagline | slide, tile thud, D-major spread |

## 9. QA (final export) — details and evidence in the output folder's `QA.md` and `qa/`
900 frames; video/audio/format 30.000000 s; H.264 High yuv420p 30/1 bt709; AAC-LC 48 kHz stereo; full decode 0 errors;
−15.0 LUFS, TP −1.5 dBTP, flat factor 0; narration L1 0.33–3.45 … L8 26.16–28.38 s (CTA in the last 3.8 s); final-mix
English ASR 66/67 (only "Werbens" → "Warbins"; ASR-only, no human listening); every-frame DOM: caption ink y 367–491,
x 201–879, ≤ 2 lines; labels x 188–892, y 580–1547; nothing in y 0–300; 0 overlaps; no page errors.
sha256 `16052093757f44a042cd8b931e9622236248112d2046c01b751c30d38b4a20e6`. Earlier MP4s verified unchanged (hashes in QA notes).

## 10. Progress / provenance log (this round)
- Commands: app.werbens.com re-check (headless Chromium + logo sha256) → Crossref/OpenAlex check of DOI 10.1086/209174 →
  ASCI page re-read → `node src/tts.mjs` (3 script passes: base, "positive/negative" fix, L6/L7 re-spacing) →
  `node src/words.mjs` → `node src/words_fix.mjs` → stills (3 passes) → `node src/audio.mjs` → `node src/qa_dom.mjs 6` →
  `node src/render.mjs --video` → ffmpeg mux → `bash qa.sh` → `node src/qa_dom.mjs 1` → `node src/asr_mix.mjs <mp4>`.
- Next step: none for this batch (one episode only; no automation).
