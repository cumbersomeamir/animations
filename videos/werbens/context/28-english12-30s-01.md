# 28 — English-12 (2026-11-11) 30 s #01: "Same product. New perception." (why a brand can make an ordinary product feel expensive)

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · assigned account
info@tensorblue.com (CLAUDE.md) · batch `2026-11-11-english-12`. Repo/branch confirmed (origin = github.com/cumbersomeamir/
animations, branch claude-video/werbens, local 90febd7 == origin, clean tree; every earlier accepted job, through english-11,
finished and pushed; no jobs running) before any edit. The approved feedback rules were persisted first (`context/27`,
commit 1f09bfc).
Output: `videos/werbens/production/30s/2026-11-11-english-12/werbens-30s-english12-01.mp4` + separate thumbnail
`werbens-30s-english12-01-thumbnail.png` (and `.jpg`).
Rules: **`context/27`** (current; story structure, pacing, thumbnail, caption/label bounds, facts, QA). Style: `context/11`
accepted "Satisfying Product Theatre" recipe + renderer (unchanged except where context/27 and the colour-theme feedback
apply). English voice: context/11 + context/16 (Meshline/Recall). Brand: `context/17` (re-checked today). Copy in the output
folder: `english12-30s-01.md`.

## 1. Brief (user-approved 2026-11-11, "Published apps", Satisfied? column)
- One new 30.000 s English educational episode (English narration + captions, established narrator, no Hindi, no Blender or
  paid APIs), built with the approved motion skill and assets, changing only what the rules in context/27 list.
- Proposed topic: **why a brand can make an ordinary product feel expensive**. Hook: identical product silhouettes with
  different presentation, "SAME PRODUCT. NEW PERCEPTION." Use a verified brand example of packaging, positioning or price
  anchoring; reveal one mechanism visually; useful marketing lesson in the payoff; no invented sales statistics; no excessive
  sales pitch.
- Feedback for this app: colour theme and logo must be the **actual app.werbens.com** (inspect that exact site, extract the
  current rendered palette and logo; not werbens.com, not a guessed light blue), kept across all scenes.

## 2. Topic check against the episode history → proposed topic kept, with a mechanism not used before
- Closest earlier work: the educational **pilot** (`education/pilot-01`, context/09). It taught *packaging as a cue*:
  identical fictional cookies in plain and luxe boxes, with sources Deliza & MacFie 1996, Piqueras-Fiszman & Spence 2012/2015,
  Becker et al. 2011 and Krishna 2012. **#09 english-07** taught *price anchoring* (Krishna et al. 2006). **#04 round-02**
  taught distinctive brand assets (one shape repeated everywhere).
- Of the three mechanisms the brief allows, packaging and anchoring are covered. **Positioning by name and meaning** is not
  covered: a brand name and story set a premium expectation, and brand knowledge changes preference for an almost identical
  product. So the topic is kept with this mechanism. The evidence (McClure et al. 2004), the example (Häagen-Dazs) and the
  visuals (tubs, cups, plinth/spotlight grammar) are all new to the series.
- No fresh-news claim is used (the example is documented company history), and the accepted style has no mascot or presenter.

## 3. Brand re-check (facts; 2026-11-11) and colour-theme decision
- The live `https://app.werbens.com/` was loaded in headless Chromium: HTTP 200 → `/app`, title "Werbens - Marketing Company and
  AI Content Platform".
  - The top-40 computed colour list is identical to the 2026-11-09 check.
  - Wordmark: Space Grotesk 700, 30.4 px, −1.216 px, `linear-gradient(135deg, rgb(127,231,220), rgb(49,104,121))`.
  - Hero headline: Space Grotesk 700 with `linear-gradient(135deg, #7FE7DC, #5CE0D2 50%, #FFFFFF)`.
  - The logo `https://app.werbens.com/app/werbens-logo.svg` is byte-identical to `assets/brand/app-werbens-logo.svg`
    (sha256 816c1761…).
  - Evidence (desktop and mobile screenshots, computed-colour JSON): Claude's scratchpad `appweb-dl-1112` (not committed;
    third-party page copy).
- **Decision (colour theme).** The rendered site is a **dark-navy hero** (#0B1120 panels, rgba(9,16,30)) with mint/teal accents
  under a light glass header. Earlier episodes used the light mint-white studio #F0FDFA, which can read as a pale blue. For
  this feedback the studio sweep becomes the site's navy hero, in every scene:
  - Background and fog: #0B1120.
  - Floor: navy, rendered ≈ #111A2D – #121B2F.
  - Hero accents: deep teal #316879 (sleeve rendered ≈ #25677A – #266B7E under the spotlight) and mint #7FE7DC (lid rendered ≈ #83D7CE – #95DDD5;
    "=" and "≈" signs; logo slab).
  - Cups and tubs: mint-white #F0FDFA.
  - Plinths: ink #0F172A.
  - Caption pill: the site's dark glass panel (rgba(9,16,30,.86), 2 px mint border @ 30 %), mint-white text, mint highlights.
  - Big labels: Space Grotesk 700 with the hero-headline gradient.
  - CTA: the logo SVG unchanged, drawn unlit on a mint slab (rendered #7EE7DC / #316879), plus the wordmark gradient.
  - Amber is not used.
  - Everything else about the accepted style is unchanged: renderer, motion grammar, studio sweep, contact shadows, caption
    word-timing, CTA tile.

## 4. English voice + checks
- Voice: the accepted Meshline/Recall host — Kokoro-82M v1.0 (q8) style blend **af_bella 0.7 + am_puck 0.3**, speed 0.98,
  en-us, newly synthesised for this script. No celebrity/voice imitation; no Hindi or recycled audio.
- Pronunciation overrides: "Werbens" → wˈɜɹbɛnz; general rhotic ɜː → ɜɹ.
  - New: "Häagen-Dazs" came out hˈɛədʒəndˈæzz → **hˈɑːɡən dˈɑːz** ("HAH-gen-dahz").
  - New: the weak "and" in "Coke and Pepsi" was heard as "Cocon" → stressed **kˈoʊk ˈænd**.
- Whisper base.en per line (clean narration):

  | Line | Score | Note |
  |---|---|---|
  | L1 | 4/4 | |
  | L2 | 6/6 | |
  | L3 | 12/15 | All words heard; Whisper splits "made-up" and spells the brand "Hagen Daz" |
  | L4 | 7/7 | |
  | L5 | 7/7 | |
  | L6 | 7/7 | |
  | L7 | 9/10 | "drink's" written "drinks" |
  | L8 | 8/8 | |
  | L9 | 7/7 | |
  | L10 | 6/7 | "Werbens" → "Warbins", the documented vocabulary limit |

- Caption timing: Whisper word times, with `WORD_FIX` onsets read from the voiced segments (10 ms envelope) for L1, L5, L6 and
  L8.
- Script iterations (pacing): the first drafts ran 3 s long and were tightened in three passes:
  - dropped "Bronx" and merged "luxury" into L3;
  - split the proof into two lines;
  - split the payoff into answer + action.

  After the passes, the hook ends at 2.1 s, the proof at 21.0 s, the payoff runs 21.3–26.7 s and the CTA starts at 27.0 s.

## 5. Facts used (verified 2026-11-11) — tagged measured / company account / illustration / advice
| Line | Claim | Tag | Source (quoted) |
|---|---|---|---|
| L3 | "In 1960, ice cream makers gave a luxury brand a made-up name: Häagen-Dazs." | **Documented company history** | General Mills brand page https://www.generalmills.com/our-food/brands/haagen-dazs: "In 1960, Häagen-Dazs set out with a goal to make better ice cream." · "Starting with vanilla, chocolate and coffee, Reuben Mattus set out to change ice cream forever." Froneri brand page https://www.froneri.com/brands/haagen-dazs/: "two Polish immigrants from the Bronx decided to create a new luxury in ice cream. They invented a recipe, dreamed up a name and made it happen." · "With three simple flavors – Vanilla, Chocolate and Coffee – and a playful made-up name--the Häagen-Dazs® brand and a new kind of luxury was born." (Why the name was chosen, e.g. any "Danish-sounding" intent, is not stated by these sources and is not claimed.) |
| L4 | "Then backed it with a rich recipe." | **The brand's own account** (not independently measured; no fat/air figures used) | Froneri: "At a time when others were cutting corners and pumping their ice cream with air, our creative founders set out to do something better. Using only the finest ingredients, their rich, velvety ice cream created a category all its own." |
| L6 | "Coke and Pepsi are chemically nearly identical." | **Published premise of a peer-reviewed study** | McClure, S. M., Li, J., Tomlin, D., Cypert, K. S., Montague, L. M., & Montague, P. R. (2004). Neural correlates of behavioral preference for culturally familiar drinks. *Neuron*, 44(2), 379–387. https://doi.org/10.1016/j.neuron.2004.09.019 (PubMed 15473974) — abstract: "Coca-Cola (Coke) and Pepsi are nearly identical in chemical composition, yet humans routinely display strong subjective preferences for one or the other." |
| L7 | "Yet in a study, knowing one drink's brand shifted preferences." | **Measured finding** (direction only; no effect size spoken or shown; small fMRI study) | Same abstract: "Two conditions were examined: (1) anonymous delivery of Coke and Pepsi and (2) brand-cued delivery of Coke and Pepsi … In the brand-cued experiment, brand knowledge for one of the drinks had a dramatic influence on expressed behavioral preferences and on the measured brain responses." (The abstract does not name which drink; the video's sleeve says only "BRAND".) |
| L8 | "A brand shapes expectations before the first bite." | **Explanatory takeaway** (inference from the evidence, not a number) | McClure et al. frame the question as "how cultural messages combine with content to shape our perceptions". Supporting background, not narrated: Plassmann, H., O'Doherty, J., Shiv, B., & Rangel, A. (2008). Marketing actions can modulate neural representations of experienced pleasantness. *PNAS*, 105(3), 1050–1054. https://doi.org/10.1073/pnas.0706929105 — abstract: "increasing the price of a wine increases subjective reports of flavor pleasantness". |
| L9 | "Signal a real strength, then deliver it." | **Practical advice** (not a measured sales effect) | Derived from the above plus the Häagen-Dazs account, where a luxury name and position were paired with what the company describes as a richer product. |
| — | identical tubs and cups, "=", "≈", plinth + spotlight, aura, spoon | **Illustration** | Unbranded procedural props. The tub that carries the name is a generic illustrated tub in Werbens colours, not the brand's packaging, logo or trade dress. The cups carry only a generic "BRAND" sleeve. The branded cup rising on a plinth shows direction only, with no study values. No prices, sales, market-share or conversion figures are used. (The Froneri page's "No. 1" market claims are not repeated.) |

## 6. Final script (= final transcript; Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98) — 68 words, 25.4 s of speech
| Part (context/27) | Line | Clip on air (s) | Text |
|---|---|---|---|
| Hook | L1 | 0.30–2.08 | Same product. New perception. |
| Super hook | L2 | 2.40–4.11 | So why does one feel expensive? |
| Build-up | L3 | 4.45–10.23 | In 1960, ice cream makers gave a luxury brand a made-up name: Häagen-Dazs. |
| Build-up | L4 | 10.45–12.21 | Then backed it with a rich recipe. |
| Proof (question) | L5 | 12.50–13.99 | But can a name change the taste? |
| Proof | L6 | 14.30–17.07 | Coke and Pepsi are chemically nearly identical. |
| Proof | L7 | 17.33–20.98 | Yet in a study, knowing one drink's brand shifted preferences. |
| Payoff | L8 | 21.30–24.24 | A brand shapes expectations before the first bite. |
| Payoff | L9 | 24.55–26.70 | Signal a real strength, then deliver it. |
| CTA | L10 | 27.00–29.32 | Follow Werbens to decode how brands sell. |
Publishing caption (`publishing-caption.txt`) = this transcript verbatim + one illustration note + sources; no editing notes.

## 7. How the context/27 rules were applied (creative decisions)
- **Thumbnail → hook:** the separate thumbnail repeats the hook image: plain tub vs. dressed tub on a lit plinth, with
  "SAME PRODUCT." / "NEW PERCEPTION." (4 words, Space Grotesk 700, the site's hero gradient) and the app.werbens.com logo +
  wordmark. Frame 0 of the video already has both tubs falling into place.
- **One question carries the build-up:** "why does one feel expensive?" → the name example → "can a name change the taste?" →
  the study → the answer is given once, in the payoff (L8), followed by the action (L9).
- **One visual idea at a time; sequential reveals:**
  1. "=" between identical tubs.
  2. The teal sleeve wipes up (new presentation); the plinth rises and the spotlight turns on.
  3. "?".
  4. "1960".
  5. The sleeve again on the plain tub; the plinth on "luxury".
  6. The name writes on.
  7. The lid pops and a dense scoop rises on "rich".
  8. The camera travels to two identical cups; the cups hop on their names.
  9. "≈".
  10. The BRAND sleeve wipes onto one cup.
  11. That cup rises on a plinth into the light on "shifted preferences" (the hook's grammar, so the mechanism reads the same
      way twice).
  12. Back to the tub; an aura on "shapes expectations".
  13. The spoon arrives before the bite and takes it on "bite".
  14. "SIGNAL IT", then "DELIVER IT".
  15. The CTA tile.
- **Labels:** large, 1–3 words each ("?", "1960", "SIGNAL IT", "DELIVER IT"), one at a time. There are no source chips and no
  paragraph cards; sources are in this file and the caption. There are no decorative lines: depth comes from the hero spotlight,
  fog falloff, the mint rim light and contact shadows.
- **Captions:** pill and ink inside x 100–900 (52/60 px Inter Display ExtraBold; groups auto-shrink only if a line would exceed
  the box — none needed), y ≈ 353–507.
- **Reusable lessons:**
  1. On a dark stage, keep spotlight pools dim and compensate lit bases (the sleeve base was multiplied to ~0.84 and the lid base
     darkened) so the rendered colours land on the site tokens.
  2. A short CTA tile drop (0.14 m) avoids crossing the caption band.
  3. Ease the stage clear in-out so the last prop has left before the tile lands, with no empty frame.
  4. Columns behind cups read as straws; use the plinth + spotlight "chosen" grammar instead.
  5. Possessive or weak function words after a brand name ("Coke and") may need a stress override.

## 8. Storyboard (as built; `src/timeline.js`)
| Section | Time | Camera | Action | Sound |
|---|---|---|---|---|
| Hook | 0–2.3 s | both tubs, slow push | tubs land; "="; right tub: sleeve, mint lid, plinth, spotlight | air, two lands, pop, zip, riser, glow, piano |
| Super hook | 2.3–4.3 s | push in on the dressed tub | pulse on "one"; "?" on "expensive" | tick, tag, piano |
| Build-up | 4.3–12.4 s | centre tub, push in on the name, up for the scoop | swap; "1960"; sleeve; plinth + spot on "luxury"; name writes on; lid pops; scoop rises | slide, card, zip, riser, glow, shimmer, pop, plop |
| Proof | 12.4–21.1 s | lateral dolly to the cups | cups hop on "Coke"/"Pepsi"; "≈"; BRAND sleeve; branded cup rises into the light | whoosh, thuds, tag, zip, riser, glow, piano |
| Payoff | 21.1–26.4 s | back to the tub | aura; spoon in; bite; SIGNAL IT; DELIVER IT | whoosh, glow, slide, squash, toss, tags |
| CTA | 26.4–30 s | pull back | tub/spoon slide off; logo tile lands (26.86 s); wordmark on "Werbens" (27.55 s) | slide, tile thud, D-major spread |

## 9. QA (final export) — details and evidence in the output folder's `QA.md` and `qa/`
Final export = **render 2**. Render 1, in checkpoint ed4b939, had the popping lid inside the caption pill at ≈ 11.0 s; it
was fixed and re-rendered.
- Format: 900 frames; video/audio/format 30.000000 s; H.264 High yuv420p 30/1 bt709; AAC-LC 48 kHz stereo; full decode
  0 errors.
- Audio: −15.0 LUFS, TP −1.9 dBTP, flat factor 0.
- Narration on air: L1 0.34–2.04 · L2 2.43–3.97 · L3 4.48–10.18 · L4 10.49–12.15 · L5 12.53–13.94 · L6 14.33–16.92 ·
  L7 17.36–20.92 · L8 21.33–24.10 · L9 24.58–26.65 · L10 27.07–29.28 s.
- Final-mix English ASR: the whole-mix transcript matches the script except the spellings "Hagen-Daz" and "Warbins".
  This is ASR only; no human listening was done.
- Every-frame DOM: caption ink x 175–825 / y 369–489, pill x 145–855 / y 353–507; labels x 262–818 / y 561–1456; nothing in
  y 0–300; 0 overlaps; one big label at a time; no page errors.
- Transition review: no empty frames.
- Thumbnail: 1080×1920.
- MP4 sha256 `d1db2065107e49c917f3b2df1d3e9d98868b17394fbbec4ee663a8f66f7d2a62`. Earlier MP4s verified unchanged.

## 10. Progress / provenance log (this round)
- Commands, in order:
  1. Repo/branch/account + earlier-jobs check.
  2. Rules persisted (context/27; commit 1f09bfc).
  3. app.werbens.com re-inspection (`tools/app.cjs`, `tools/appwm.cjs`, logo curl + sha256).
  4. Episode-history check (context/09, 11, 22).
  5. Sources: Froneri + General Mills brand pages, PubMed efetch 15473974 (McClure 2004), OpenAlex (Plassmann 2008).
  6. `node src/tts.mjs` (5 passes: draft, pronunciation + tighten, merge, final split, "Coke and").
  7. `node src/words.mjs` → `node src/words_fix.mjs`.
  8. Stills (7 passes) → colour calibration (pixel sampling).
  9. `node src/audio.mjs` → `node src/qa_dom.mjs 3`.
  10. `node src/render.mjs --thumb --stills 2.25 --out build/thumb` → `node src/render.mjs --video` → ffmpeg mux.
  11. `bash qa.sh` → `node src/qa_dom.mjs 1` → `node src/asr_mix.mjs <mp4>`; the transition sheet showed the lid in the
      caption band at 11.0 s → lid arc fix → full re-render (render 2) → mux → full QA again.
- Next step: none for this batch (one episode only; no automation).
