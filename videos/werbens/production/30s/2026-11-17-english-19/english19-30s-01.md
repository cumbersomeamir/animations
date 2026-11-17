# 35 — English-19 (batch19, 2026-11-17) 30 s #01: "SAME OPTIONS. BIGGER ORDER?" (subtractive vs additive option framing)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · assigned account
info@tensorblue.com (CLAUDE.md) · batch `2026-11-17-english-19`.

Pre-edit checks:
- Repo/branch confirmed: origin = github.com/cumbersomeamir/animations, branch claude-video/werbens, local bbd81f2 == origin,
  clean tree.
- Batch 18 (english-18) was finished, pushed and attached first, and is not repeated here. No jobs were running.
- CLAUDE.md and `05-progress.md` were re-read; topic history read from `context/11` (episode log rows 01–20) and episode notes.

Output:
- Video: `videos/werbens/production/30s/2026-11-17-english-19/werbens-30s-english19-01.mp4`.
- Thumbnail: `werbens-30s-english19-01-thumbnail.png` (and `.jpg`) = **frame 0 plus the app.werbens.com logo/wordmark**.

Rules and references:
- **`context/27`** incl. **§5 first-frame rule**.
- Style: `context/11` "Satisfying Product Theatre" on the live app.werbens.com dark-navy theme (context/28 §3).
- Voice: context/11 + context/16 (Meshline/Recall).
- Brand: `context/17` (re-checked today).
- Copy in the output folder: `english19-30s-01.md`.

## 1. Brief (user-approved, batch19 on 17 November 2026; latest feedback retained)
- Proposed topic: **why a decoy option changes what people choose** (asymmetric dominance), with clearly hypothetical three
  offer cards; compare before/after, not fake measured conversion data.
- Exact app.werbens.com colours; approved simple premium visual style.
- If already covered, select a genuinely different specific topic in the same genre. One new English episode.

## 2. Topic check against the episode history → decoy covered; fresh alternative chosen
**The decoy effect is already covered.** Episode **#03** (`production/30s/2026-11-02-feedback-round/`, context/14) taught it
with an illustrative coffee menu (small / medium decoy / large). Batch16 (#18) received the same proposal and switched to the
compromise effect for the same reason.

**Chosen instead: where a choice starts — subtractive vs additive option framing** (a default/starting-point effect). Same
genre (choice architecture of offers) and the same story criteria (identical options, before/after comparison, hypothetical
cards, no invented conversion data), but a mechanism the series has not used. Nothing in context/ covers defaults, pre-selected
options, opt-in/opt-out or add-vs-remove configuration. Hook: **SAME OPTIONS. BIGGER ORDER?** (4 words; truthful: the options
are identical, and the finding is that starting full led to more options chosen).

## 3. Brand re-check (facts; 2026-11-17, batch19)
Live `https://app.werbens.com/` (HTTP 200 → `/app`, headless Chromium, scratchpad `appweb-dl-1117`):
- The top-40 computed colour list is identical to the batch-18 check (`appweb-dl-1115d`).
- Wordmark: Space Grotesk 700, 30.4 px, −1.216 px, `linear-gradient(135deg, rgb(127,231,220), rgb(49,104,121))`.
- Logo `https://app.werbens.com/app/werbens-logo.svg` sha256 816c1761… is unchanged (= `assets/brand/app-werbens-logo.svg`).

## 4. Facts used (verified 2026-11-17) — tagged measured / advice / legal / illustration
Primary source: Park, C. W., Jun, S. Y., & MacInnis, D. J. (2000). Choosing what I want versus rejecting what I do not want: An
application of decision framing to product option choice decisions. *Journal of Marketing Research*, 37(2), 187–202.
https://doi.org/10.1509/jmkr.37.2.187.18731 — abstract as deposited by the publisher (Crossref API, read 2026-11-17):

> "The authors examine the effects of using a subtractive versus an additive option-framing method on consumers' option choice
> decisions in three studies. The former option-framing method presents consumers with a fully loaded product and asks them to
> delete options they do not want. The latter presents them with a base model and asks them to add the options they do want.
> … Consumers tend to choose more options with a higher total option price when they use subtractive versus additive option
> framing. This effect holds across different option price levels (Study 1) and product categories of varying price (Study 2).
> Moreover, this effect is magnified when subjects are asked to anticipate regret from their option choice decisions
> (Study 2). However, option framing has a different effect on the purchase likelihood of the product category itself,
> depending on the subject's initial interest in buying within the category. Although subtractive option framing offers strong
> advantages to managers when product commitment is high, it appears to demotivate category purchase when product commitment
> is low (Study 3). …"

Legal source (concise qualification for paid extras): The Consumer Contracts (Information, Cancellation and Additional Charges)
Regulations 2013 (UK SI 2013/3134), **regulation 40** "Additional payments under a contract", read on legislation.gov.uk on
2026-11-17 (shown as in force, latest revised version): no payment beyond the main price is payable "unless, before the consumer
became bound by the contract, the trader obtained the consumer's express consent"; consent cannot be inferred from the consumer
not changing a default option "such as a pre-ticked box on a website". (The EU Consumer Rights Directive 2011/83/EU, Art. 22,
is the parallel EU rule; EUR-Lex returned a bot challenge in this session, so it is noted, not quoted.)

| Line | Claim | Tag | Source |
|---|---|---|---|
| L1 | "Why do shoppers keep more extras when they start full?" | **Question framed by the finding** | Park et al. abstract |
| L2 | "One builds up from basic. One trims down from full." | **Illustration** of the two framings (additive / subtractive) | Park et al. design |
| L3 | "In three studies, trimming down kept more options, at a higher total price." | **Measured finding** (direction only) | "Consumers tend to choose more options with a higher total option price when they use subtractive versus additive option framing." |
| L4 | "Across price levels and product types." | **Measured** | "holds across different option price levels (Study 1) and product categories of varying price (Study 2)" |
| L5 | "But for shoppers barely set on buying, starting full put them off." | **Measured** (limitation) | "it appears to demotivate category purchase when product commitment is low (Study 3)" |
| L6 | "Where a choice starts steers where it ends." | **Interpretation** of the finding | — |
| L7 | "Start committed buyers full, but every paid extra needs their own yes." | **Advice** (first half, from Study 3's high-commitment result) + **legal** (second half: express consent for extra payments; a pre-ticked box is not consent — UK reg. 40) | Park et al.; UK SI 2013/3134 reg. 40 |
| — | product cores, option modules, ghost slots, coins, shopper pawn | **Illustration** | Module counts (2 vs 4 of 5) and coin stacks are made up; no prices, no currency, no conversion rates. |

## 5. English voice + checks
- Voice: the established Meshline/Recall narrator — Kokoro-82M v1.0 (q8), **af_bella 0.7 + am_puck 0.3**, speed 0.98, en-us,
  newly synthesised. Hook audio starts at 0.15 s.
- Script fixes: L3 and L4 touched in the first pass (0.08 s), so lines were re-spaced to ~0.4 s gaps.
- Whisper base.en per line (clean narration): L1 10/10 · L2 10/10 · L3 13/13 · L4 6/6 · L5 12/12 · L6 8/8 · L7 12/12 ·
  L8 6/7 ("Werbens" → "Warbins", known limit).
- Caption timing: Whisper word times plus `WORD_FIX` pins for L3, L5 and L7, read from the voiced segments of the narration
  envelope (e.g. "at a higher total" 9.85/10.65/10.84 → 10.11/10.29/10.59 s; "full" 16.85 → 16.99 s).

## 6. Final script (= final transcript) — 78 words, 23.6 s of speech
| Part (context/27) | Line | On air (s) | Text |
|---|---|---|---|
| Hook (frame 0: SAME OPTIONS. / BIGGER ORDER?) | L1 | 0.15–2.88 | Why do shoppers keep more extras when they start full? |
| Build-up | L2 | 3.38–6.56 | One builds up from basic. One trims down from full. |
| Proof | L3 | 7.03–11.49 | In three studies, trimming down kept more options, at a higher total price. |
| Proof | L4 | 11.98–13.90 | Across price levels and product types. |
| Proof (limitation) | L5 | 14.38–17.91 | But for shoppers barely set on buying, starting full put them off. |
| Payoff (answer) | L6 | 18.38–20.12 | Where a choice starts steers where it ends. |
| Payoff (takeaway + legal) | L7 | 20.73–24.74 | Start committed buyers full, but every paid extra needs their own yes. |
| CTA | L8 | 27.03–29.29 | Follow Werbens to decode how brands sell. |

## 7. How the rules were applied (creative decisions)
- **Frame 0 = thumbnail.** Two identical, unbranded mint-white products on a low ink plinth. Above each are the same five option
  slots, drawn as faint "ghost" discs with mint rims, so the menu is visibly identical. The left product is bare (additive
  start); the right one is fully loaded with five solid option modules in teal/mint tones (subtractive start). The headline
  reads "SAME OPTIONS. / BIGGER ORDER?" (Space Grotesk 700; the second line uses the hero gradient), x 117–883, y 330–573. No
  intro, no fade. The headline clears by 0.42 s as the first caption appears.
- **One real question:** "why do shoppers keep more extras when they start full?"
  - Build-up: the left builds up (adds two options); the right trims down (drops one).
  - Proof: more options kept at a higher total (coins, no currency); the effect held across price levels (coins double) and
    product types (the products change shape; the 2-vs-4 gap holds); then the limitation (a barely interested shopper backs
    away from the full product).
  - Payoff: both reset to their starts and move to their ends ("START STEERS"); then the takeaway: a committed shopper, and
    each paid extra lights up only with its own check (one is declined).
- **Before/after, not conversion data.** Module counts (2 vs 4 of 5) and coin stacks are illustrative; no rates, prices or
  currency appear anywhere.
- **Labels:** MORE KEPT / HIGHER TOTAL / EVERY TYPE / PUT OFF / START STEERS / THEIR OWN YES. All large and brief, one at a time,
  y ≥ 574. The only in-world marks are check icons (no text).
- **Excluded:** no brand, no prices, no source chips, no decorative lines.
- **Reusable lessons:**
  1. Ghost slots make "same options" visible at frame 0 without any text.
  2. Objects added to the stage (not the station group) need absolute positions; the first coin pass was off-screen.
  3. When clearing a stack, collapse the spacing as well as the scale, or it reads as floating wafers.
  4. Check every caption group's on-screen time before the full render (english-18 lesson); here the shortest is 1.1 s.

## 8. Storyboard (as built; `src/timeline.js`)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Frame 0 + hook | 0–3.3 s | two products, slow push | headline; bare vs fully loaded; the loaded one glows on "start full" | shimmer, piano |
| Build-up | 3.3–6.8 s | push | left adds two options; right drops one | clinks, slide, piano |
| Proof 1 | 6.8–11.9 s | pull back | MORE KEPT; coins stack (3 vs 6 units, no currency; HIGHER TOTAL) | whoosh, tag, coin drops |
| Proof 2 | 11.9–14.3 s | slight orbit | coins double ("price levels"); products change shape ("product types"); EVERY TYPE | coin drops, pop |
| Proof 3 | 14.3–18.3 s | close on the full product | right full again; a dim shopper walks up and backs away (PUT OFF) | clink, ticks, sink, tag |
| Payoff | 18.3–20.6 s | wide | both reset to their starts and move to their ends (START STEERS) | whoosh, clink, slide, tag |
| Takeaway | 20.6–26.25 s | close on the right | committed shopper; extras turn pending; four checks light four extras; the fifth is declined (THEIR OWN YES) | plop, chimes, slide, tag |
| CTA | 26.25–30 s | pull back | stage sinks; logo tile pops up 26.38–26.74 s; wordmark 27.55 s | slide, tile thud, D-major spread |

## 9. QA (final export) — details and evidence in the output folder's `QA.md` and `qa/`
**Output:** `production/30s/2026-11-17-english-19/werbens-30s-english19-01.mp4`, sha256 `b468d260…af95`, 4,143,290 bytes
(render 1). Thumbnail `…-thumbnail.png` (sha256 `d6b276c5…`) and `.jpg` (sha256 `e43ac553…`).

Verification results (2026-11-17):
- **Streams:** 30.000000 s for format, video and audio; 900 decoded frames; h264 High 1080×1920 yuv420p 30/1 bt709; AAC-LC
  48 kHz stereo ~193 kb/s; full decode with `-xerror` gives 0 errors; render log clean.
- **Audio:** −15.0 LUFS integrated, true peak −1.9 dBTP, LRA 3.6 LU, flat factor 0. Stems: voice −21.0, music −31.6, foley
  −36.1 LUFS.
- **ASR of the final mix (Whisper base.en):** whole-mix transcript matches the script except "Werbens" → "Wurbens". Line
  windows L1–L7 full; L8 6/7 ("Warbins"). ASR only, no human listen.
- **DOM, every frame (900):** caption ink x 152–848 / y 369–489; pill x 122–878 / y 353–507; headline 13 frames x 117–883 /
  y 330–573; labels x 173–827 / y 574–1456. 0 headline conflicts, 0 outside, 0 overlaps, 0 in y < 300, never two big labels.
  Caption groups: 13, shortest 1.10 s.
- **Visual review:** the transition sheet (30 beats), the contact sheet and frame 0 were inspected. Identical ghost slots on
  both sides throughout; no empty frames; nothing crossing the caption/label band; no missing assets. Render 1 passed and is
  the delivered file.
- **Earlier outputs:** 21 earlier MP4s were re-hashed and are unchanged; nothing earlier was overwritten.

## 10. Progress / provenance log (this round)
1. Checked repo/branch/account; confirmed batch 18 was finished; re-read CLAUDE.md and 05-progress; read the topic history.
2. Topic check → decoy covered (#03); switched to subtractive vs additive option framing (§2).
3. Sources: Crossref (Park et al. abstract), legislation.gov.uk (reg. 40). EUR-Lex returned a bot challenge (202, empty); not
   pursued further.
4. app.werbens.com re-inspection (`tools/app.cjs`, `tools/appwm.cjs` → `appweb-dl-1117`).
5. Project created from the english-18 skeleton (`src/` tools, fonts, node_modules); outputs, QA and words.json not copied.
6. `node src/tts.mjs` (2 passes) → `node src/words.mjs` → `node src/words_fix.mjs`.
7. Stills (3 passes): coins off-screen (double offset) → placed in front of each product; coin clear collapsed; thumbnail and
   transitions checked.
8. `node src/audio.mjs` (english-18 fizz bed removed; new pads/keys) → `node src/qa_dom.mjs 3` (PASS) → caption durations
   checked (shortest 1.1 s) → checkpoint commit 79d2fc9.
9. `node src/render.mjs --video` → ffmpeg mux → `node src/render.mjs --thumb --stills 0 --out build/thumb` → `bash qa.sh` →
   `node src/qa_dom.mjs 1` → `node src/asr_mix.mjs werbens-30s-english19-01.mp4`.
10. Frame review passed (no re-render) → QA.md written; context/05 marked delivered; committed and pushed; MP4 + thumbnail
    attached in chat.

Next step: none for this batch (one episode only; no automation).
