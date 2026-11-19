# 38 — English-22 (batch22, 2026-11-19) 30 s #01: "THE FREE SHIPPING TRAP" (free-shipping thresholds)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · assigned account
info@tensorblue.com (CLAUDE.md) · batch `2026-11-19-english-22`.

Pre-edit checks:
- Repo/branch confirmed: origin = github.com/cumbersomeamir/animations, branch claude-video/werbens, local f4c3859 == origin,
  clean tree.
- Batches 20 and 21 were finished, pushed and attached; no checkpointed unfinished work and no jobs running. Not repeated.
- CLAUDE.md and `05-progress.md` were re-read; topic history read from `context/11` (episode log rows 01–23).
- This brief is submitted once as the next episode; no chat was created or renamed; nothing is published to social media.

Output:
- Video: `videos/werbens/production/30s/2026-11-19-english-22/werbens-30s-english22-01.mp4`.
- Thumbnail: `werbens-30s-english22-01-thumbnail.png` (and `.jpg`) = **frame 0 plus the app.werbens.com logo/wordmark**.

Rules and references:
- **`context/27`** incl. **§5 first-frame rule**.
- Style: `context/11` "Satisfying Product Theatre" on the live app.werbens.com dark-navy theme (context/28 §3).
- Voice: context/11 + context/16 (Meshline/Recall).
- Brand: `context/17` (re-checked today).
- Copy in the output folder: `english22-30s-01.md`.

## 1. Brief (batch22, authorised 19 November 2026; latest live feedback retained)
- Topic: **why a free-shipping threshold sells one more item.** A basket approaching a shipping threshold acquires a small
  item; explain the marketing incentive with one mathematically correct illustrative example comparing total spend (no fake
  real-brand checkout).
- First frame: an empty gap in a basket pulling in another product, **THE FREE SHIPPING TRAP**.
- Live feedback for this app: "No, only color theme and logo needs to be changed, take from app.werbens.com". Applied
  explicitly: exact palette and logo from the live app.werbens.com (§3).
- **New caption rule from this brief:** upper captions below the platform account UI, approximately **y 280–460**, with
  horizontal safe margins; keep vital information away from the right-side and bottom platform controls. Typography spare:
  no more than one short headline plus the current spoken caption.

## 2. Topic check against the episode history → not covered; topic kept
No earlier episode covers shipping fees, delivery fees, free-shipping thresholds or minimum-order offers (searched `context/`
for shipping, delivery fee, threshold, minimum order, free delivery). Closest neighbours are different mechanisms: #23
(english-21, zero price: two products with a constant price gap, one becomes free) and #22 (english-20, price endings). Here the
mechanism is a **threshold**: a fee disappears only above a basket total, so adding an item can cost less than it seems.

## 3. Brand re-check (facts; 2026-11-19, batch22)
Live `https://app.werbens.com/` (HTTP 200 → `/app`, headless Chromium, scratchpad `appweb-dl-1119`):
- The top-40 computed colour list is identical to the batch-21 check (`appweb-dl-1118`).
- Wordmark: Space Grotesk 700, 30.4 px, −1.216 px, `linear-gradient(135deg, rgb(127,231,220), rgb(49,104,121))`.
- Logo `https://app.werbens.com/app/werbens-logo.svg` sha256 816c1761… is unchanged (= `assets/brand/app-werbens-logo.svg`).

## 4. Facts used (verified 2026-11-19) — tagged measured / illustration / advice
**Lewis, M., Singh, V., & Fay, S. (2006).** An empirical study of the impact of nonlinear shipping and handling fees on
purchase incidence and expenditure decisions. *Marketing Science*, 25(1), 51–64. https://doi.org/10.1287/mksc.1050.0150 —
abstract as deposited by the publisher (Crossref API, read 2026-11-19): "Using a database from an online retailer that has
experimented with a wide variety of shipping-fee schedules … Results show that consumers are very sensitive to shipping charges
and that shipping fees influence order incidence and basket size. Promotions such as free shipping and free shipping for orders
that exceed some size threshold are found to be very effective in generating additional sales. However, the lost revenues from
shipping and the lack of response by several segments are substantial enough to render such promotions unprofitable to the
retailer."

Not used: Lewis (2006), *Journal of Retailing* 82(1), 13–23 (doi 10.1016/j.jretai.2005.11.005) — abstract elided by the
publisher on Semantic Scholar and absent from Europe PMC; Koukova, Srivastava & Steul-Fischer (2012), *JAMS* 40(6) — abstract
not read.

**Illustrative example (made-up numbers, no currency, no brand):** basket 40; shipping 6, free from 50.
- Keep the basket: 40 + 6 = **46**.
- Add a 10 item: 40 + 10 = 50 ≥ 50 → shipping 0 → **50**.
- Difference: 50 − 46 = **4** more, and the 6 fee is replaced by a 10 item.
All arithmetic is exact; the numbers are not from the study.

| Line | Claim | Tag | Source |
|---|---|---|---|
| L1 | "Why does free shipping make you add one more thing?" | **Question** | — |
| L2 | "Your basket is 40. Shipping costs 6, but it's free from 50." | **Illustration** (made-up numbers) | — |
| L3 | "Pay 46 as it is, or add a 10 item and pay 50." | **Illustration** (exact arithmetic) | — |
| L4 | "Four more, and you get an item instead of a fee." | **Illustration** (50 − 46 = 4; the fee 6 is replaced by the item) | — |
| L5 | "In one retailer's data, threshold offers drove extra sales." | **Measured finding** (one online retailer; direction only) | Lewis et al.: threshold free shipping "very effective in generating additional sales" |
| L6 | "But lost shipping revenue made them unprofitable there." | **Measured finding** (that retailer) | Lewis et al.: "lost revenues from shipping … render such promotions unprofitable to the retailer" |
| L7 | "So add only what you'd buy anyway. Sellers: check the margin." | **Practical advice** derived from L3–L6 (not a measured rule) | — |
| — | basket, products, parcel, meter, towers, order tokens | **Illustration** | Order and revenue movements show direction only, not study data. |

## 5. English voice + checks
- Voice: the established Meshline/Recall narrator — Kokoro-82M v1.0 (q8), **af_bella 0.7 + am_puck 0.3**, speed 0.98, en-us,
  newly synthesised. Hook audio starts at 0.15 s. Numbers are read naturally ("forty", "forty-six", "fifty").
- Script fixes: the first draft ran 28 s of speech (L5 6.6 s overlapped L6) → L5–L7 tightened, lines re-spaced (gaps
  0.07–0.57 s; L5→L6 is the shortest at 0.07 s of silence between "sales." and "But").
- Whisper base.en per line (clean narration): L1 10/10 · L2 9/9 · L3 10/10 · L4 11/11 · L5 9/9 · L6 8/8 · L7 11/11 · L8 6/7
  ("Werbens" → "Warbins", known limit).
- Caption timing: Whisper word times plus `WORD_FIX` pins for L1 ("make" 1.51 s), L2 ("costs 6 but" 5.24/5.50/5.83 s) and L4
  ("and" 12.37 s), read from the voiced segments of the narration envelope.

## 6. Final script (= final transcript) — 72 words, 23.0 s of speech
| Part (context/27) | Line | On air (s) | Text |
|---|---|---|---|
| Hook (frame 0: THE FREE / SHIPPING TRAP) | L1 | 0.15–2.70 | Why does free shipping make you add one more thing? |
| Super hook | L2 | 3.33–7.14 | Your basket is 40. Shipping costs 6, but it's free from 50. |
| Build-up | L3 | 7.58–11.18 | Pay 46 as it is, or add a 10 item and pay 50. |
| Proof (math) | L4 | 11.63–14.10 | Four more, and you get an item instead of a fee. |
| Proof (study) | L5 | 14.58–18.50 | In one retailer's data, threshold offers drove extra sales. |
| Proof (limit) | L6 | 18.63–21.50 | But lost shipping revenue made them unprofitable there. |
| Payoff | L7 | 21.88–25.50 | So add only what you'd buy anyway. Sellers: check the margin. |
| CTA | L8 | 27.03–29.29 | Follow Werbens to decode how brands sell. |

## 7. How the rules were applied (creative decisions)
- **Frame 0 = thumbnail (per the brief).** A woven-look shopping basket (mint-white walls, teal bands and handle) with three
  unbranded products and an **empty glowing gap**; one more product hovers above the gap, tilted toward it, being pulled in.
  A free-shipping meter beside the basket is filled to 40 of 50 with a "50" flag on top. The headline reads "THE FREE /
  SHIPPING TRAP" (Space Grotesk 700; the second line uses the hero gradient), x 121–879, y 330–585. No intro, no fade. The
  headline clears by 0.42 s as the first caption appears.
- **One insight, one clean example (exact arithmetic, made-up amounts, no currency):** the "40" tile appears on the basket; a
  "+6" shipping parcel slides in; the meter's empty part (40 → 50) glows on "free from 50". On "Pay 46" the parcel hooks on and
  the total flips to 46; on "add a 10 item" the item drops into the gap (its "10" tag shows) and the parcel unhooks; on "pay 50"
  the total flips to 50, the meter fills to the flag and the parcel's tag flips to FREE.
- **Proof scenes (distinct, lateral moves):** two receipt towers built from the same blocks, 40 + 6 = 46 vs 40 + 10 = 50, the
  4 difference glowing ("ITEM, NOT FEE"); a retailer counter where order baskets stack up ("EXTRA SALES"), then fee parcels pop
  away and the profit coins sink ("LOST FEES").
- **Payoff:** a final basket keeps only the wanted item (check) while an unwanted extra drifts toward the gap and away ("ONLY IF
  WANTED"); the seller's margin coins get a check on "check the margin".
- **Caption band (new rule from this brief):** the caption box moved from y 330–530 to y 280–460; measured pill y 293–447, ink
  y 309–429, x 100–900. The one short headline (frame 0) or one brief label (y ≥ 574) is the only other text.
- **Labels:** ITEM, NOT FEE / EXTRA SALES / LOST FEES / ONLY IF WANTED. In-world numbers: the made-up amounts only.
- **Excluded:** no real brand or checkout, no currency, no study figures, no source chips, no decorative lines.
- **Reusable lessons:**
  1. Make the "extra item" as tall as the other products so it reads as one more product, not a token.
  2. Stacks that grow (orders) go in two short columns so they never reach the label band.
  3. With four sets in a row, gate each set's visibility by time as well as distance, or the next set's edge appears in the
     wide CTA shot.

## 8. Storyboard (as built; `src/timeline.js`)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Frame 0 + hook | 0–3.3 s | basket + meter | headline; the item hovers and is tugged toward the glowing gap on "add one more thing" | shimmer, piano |
| Super hook | 3.3–7.5 s | slight push | item drifts back; "40" tile; "+6" parcel slides in; the 40 → 50 gap glows on "free from 50" | slide, flip, slide, thud, chime |
| Build-up | 7.5–11.25 s | push | parcel hooks on (46); item drops into the gap ("10"), parcel unhooks; total 50, meter fills, parcel → FREE | flip, plop, slide, riser, flip, flip |
| Proof (math) | 11.25–14.3 s | lateral move to the towers | 40+6=46 vs 40+10=50 build; the 4 glows; item block glows, fee block dims (ITEM, NOT FEE) | whoosh, clacks, chime, tag |
| Proof (study) | 14.3–19.0 s | lateral move to the retailer counter | order baskets stack up (EXTRA SALES) | whoosh, plops, tag |
| Proof (limit) | 19.0–21.6 s | hold | fee parcels pop away; profit coins sink (LOST FEES) | pops, sink, tag |
| Payoff | 21.6–26.25 s | lateral move to the final basket | unwanted extra drifts toward the gap and away; wanted item checked (ONLY IF WANTED); margin checked | whoosh, slide, chime, tag, chime |
| CTA | 25.5–30 s | pull back | stage sinks 26.25 s; logo tile pops up 26.38–26.74 s; wordmark 27.55 s | slide, tile thud, D-major spread |

## 9. QA (final export) — details and evidence in the output folder's `QA.md` and `qa/`
**Output:** `production/30s/2026-11-19-english-22/werbens-30s-english22-01.mp4`, sha256 `434afd8b…1c49`, 4,353,727 bytes
(render 2). Thumbnail `…-thumbnail.png` (sha256 `96758d74…`) and `.jpg` (sha256 `d84af91f…`).

Verification results (2026-11-19):
- **Streams:** 30.000000 s for format, video and audio; 900 decoded frames; h264 High 1080×1920 yuv420p 30/1 bt709; AAC-LC
  48 kHz stereo ~193 kb/s; full decode with `-xerror` gives 0 errors; render log clean.
- **Audio:** −15.0 LUFS integrated, true peak −1.9 dBTP, LRA 2.2 LU, flat factor 0. Stems: voice −20.8, music −31.6, foley
  −35.8 LUFS.
- **ASR of the final mix (Whisper base.en):** whole-mix transcript matches the script except "Werbens". ASR only, no human listen.
- **DOM, every frame (900):** caption pill x 100–900 / **y 293–447** (brief: y 280–460); ink x 130–870 / y 309–429; headline 13
  frames x 121–879 / y 330–585; labels x 152–848 / y 574–1456. 0 conflicts, 0 outside, 0 overlaps, never two big labels.
  Caption groups: 11, shortest 1.50 s.
- **Visual review:** every cut, move and the ending inspected in the final MP4 (`qa/cuts.png`); objects in frame through every
  move; no missing assets.
- **Render 1 was rejected after review:** a sparse move at ~21.9 s and a 0.13 s L5→L6 pause. Sets C/D moved closer; L6/L7 and
  their beats 0.2 s later; render 2 is the delivered file.
- **Earlier outputs:** 24 earlier MP4s were re-hashed and are unchanged; nothing was deleted or overwritten.

## 10. Progress / provenance log (this round)
1. Checked repo/branch/account; confirmed batches 20–21 finished (no checkpointed work, no jobs); re-read CLAUDE.md and
   05-progress; read the topic history.
2. Topic check → not covered; kept (§2).
3. Sources: Crossref (Lewis, Singh & Fay abstract; DOIs); RePEc (404), Semantic Scholar (abstract elided) and Europe PMC (no
   record) for Lewis 2006 JR — not used.
4. app.werbens.com re-inspection (`tools/app.cjs`, `tools/appwm.cjs` → `appweb-dl-1119`).
5. Project created from the english-21 skeleton (`src/` tools, fonts, node_modules); outputs, QA and words.json not copied.
6. `node src/tts.mjs` (2 passes) → `node src/words.mjs` → `node src/words_fix.mjs`.
7. Stills (4 passes): extra item too small to read as a product → taller item, new waiting spot; framings too tight (meter cut,
   label crossing the towers) → wider framings; order stack into the label band → two columns; unwanted item near the label →
   lower path; set C's edge in the CTA shot → time-gated visibility. Thumbnail checked.
8. `node src/audio.mjs` (0 NaN) → `node src/qa_dom.mjs 3` (PASS; caption pill y 293–447) → caption durations checked
   (shortest 1.5 s) → checkpoint commit e05e484.
9. `node src/render.mjs --video` → ffmpeg mux → `node src/render.mjs --thumb --stills 0 --out build/thumb` → `bash qa.sh` →
   `node src/qa_dom.mjs 1` → `node src/asr_mix.mjs werbens-30s-english22-01.mp4`.
10. Render 1 review → sets C/D closer, L6/L7 +0.2 s → render 2 → mux → thumbnail → `bash qa.sh` → `node src/qa_dom.mjs 1` →
    `node src/asr_mix.mjs werbens-30s-english22-01.mp4`, all PASS; every cut and the ending checked in the final MP4 (§9).
11. QA.md written; context/05 marked delivered; committed and pushed; MP4 + thumbnail attached in chat.

Next step: none for this batch (one episode only; no automation). Application-specific decisions for future iterations: the
caption band y 280–460 is now standard (context/27 §6).
