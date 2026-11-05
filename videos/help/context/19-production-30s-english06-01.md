# 19 — english-06 (2026-11-06) 30 s #01 — English: donate a school bag a child can actually use

**Status: DONE.** `videos/help/production/30s/2026-11-06-english-06/help-30s-english06-01.mp4` · SHA-256 `2b6f787b2f737dafd340c33d3ea02ada40fdb64b0d620ea25c7c8f88d397d02d`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`5af7fb3`; feedback-05 already pushed, nothing to checkpoint), assigned account info@tensorblue.com, workspace `videos/help/` only.

## Language override (this batch)
English narration AND English captions only. Voice = the approved Meshline character, recreated fresh from the cached Kokoro-82M model:
`af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98 (no Hindi audio recycled, no imitation). Captions/labels in Inter ExtraBold (no Devanagari).

## Topic check
Suggested subject used as briefed: not covered before. hindi-04 only used a school bag as a *prop* for hidden school costs; 30s-01 covered
clothes; feedback-05 covered phones. This episode is the condition/fit checklist for a donated school bag + asking the receiving organisation +
a dignity test. Original illustrated scenario; no child, beneficiary or "proof" footage is shown (the bag and objects carry the lesson).

## Approved style kept (notes)
Accepted "Hands That Reveal the Hidden Cost" Canvas2D shadow-puppet renderer (stage head/primitives copied unchanged from feedback-05, minus the
unused Devanagari font faces; Three.js not used), cream cloth + two lamps, lamp-dip scene changes, cut-out hands, carved plaques, yellow-hat helper +
scarf neighbour (here a "local group" volunteer) at the same size (0.7; 0.8 in the CTA), real Play icon, quiet pad + scene-change motif, voice upfront.
New props in the same carved-hide language: school bag (working main zip with parting teeth + slider, two straps that lift, front pocket that
opens, wipeable stain), inspection table, frayed-strap card, size gauge with a "SMALL CHILD" mark, cloth, sun/drips, "LOCAL GROUP" desk + needs board.
Hook: the bag is on screen at frame 0 and drops onto the table by 0.4 s (squash + dust), "?" at 1.3 s.

## Final script (English; 77 words; 23.7 s of speech)
| # | Start–end (s) | Line |
|---|---|---|
| 1 | 0.25–2.42 | Can a child actually use this school bag? |
| 2 | 2.85–4.90 | Check every zip: open it, close it. |
| 3 | 5.35–7.90 | Tug both straps. They should hold, not fray. |
| 4 | 8.40–11.47 | Match the size: a small child needs a smaller bag. |
| 5 | 11.95–14.61 | Clean it: empty the pockets, wipe it, let it dry. |
| 6 | 15.10–18.52 | Then ask the organisation which bags and ages they need. |
| 7 | 19.00–21.39 | Last test: would you be happy to receive it? |
| 8 | 21.80–25.30 | Then hand it over ready to use: a gift, not a leftover. |
| 9 | 26.10–27.94 | Download Help to donate essentials. |
Pronunciation check (offline English ASR, Vosk small-en-us): draft hook "Would a child…" was heard as "What a child…" → re-taken as
"Can a child…" (recognised). Every other word recognised; "ask" is heard as "asked" and "this" as "the" by the small model (kept; meaning intact).
CTA = the approved verified-listing wording (donate essentials); the CTA scene shows the essentials sack + real icon — no claim that Help collects bags.

## Sources (accessed 2026-11-06 unless noted)
- **P1** Penrith City Council, "Donating Responsibly" (published 15 Oct 2020, last updated 1 Oct 2026),
  https://penrithcity.nsw.gov.au/waste-environment/waste/donating-responsibly : "Ask yourself whether you would be happy to receive the items from
  somebody else or if you'd be comfortable passing them onto a friend. Only proceed to donate if the answer is yes." · "Is the item free from rips,
  stains, odours, and pet hair?" · "Do any zips, ties, buttons, and buckles on the item function well?"
- **A1** American Academy of Pediatrics, HealthyChildren.org, "School Backpack Safety" (last updated 27 Aug 2026),
  https://www.healthychildren.org/English/safety-prevention/at-play/Pages/Backpack-Safety.aspx : "Has two broad, padded shoulder straps…" ·
  "Correct size—Bigger is not necessarily better." · "The bag you choose should be proportional to your child's height."
- **O1** American Academy of Orthopaedic Surgeons, OrthoInfo, "Backpack Safety", https://www.orthoinfo.org/staying-healthy/backpack-safety/ :
  "Two wide, padded shoulder straps" · "look for one that is appropriate for the size of your child."
- **F1** FEMA, "Volunteer and Donate" (last updated 20 Apr 2026; verified 2026-11-03 for hindi-03), https://www.fema.gov/disaster/recover/volunteer-donate :
  "Only donate items requested by relief organizations." · "Needs can change quickly, so always check with local sources before donating."
- **G1** GIVIT (giving platform; repo notes only, not named in post copy), https://www.givit.org.au/ : "GIVIT allows donors to directly meet the
  specific needs of individuals or communities by fulfilling individual requests."
- Tried, not used: ASSORT aid-sorting guidelines PDF (404).

| Claim (spoken) | Support |
|---|---|
| Check every zip: open it, close it | P1 (zips… function well) |
| Tug both straps; they should hold, not fray | A1/O1 (two broad/wide padded straps carry the load), P1 (free from rips) |
| A small child needs a smaller bag | A1 (proportional to the child's height; bigger is not better), O1 (appropriate for the size of the child) |
| Clean it: empty the pockets, wipe it, let it dry | P1 (free from stains, odours); emptying pockets = practical step |
| Ask the organisation which bags and ages they need | F1 (donate requested items; check first), G1 (fulfil specific requests) |
| Would you be happy to receive it? Hand it over ready to use | P1 (happy to receive it; only donate if yes) |
| Download Help to donate essentials | Verified Play listing |
The board's "SMALL BAGS / AGES 6–9" is an illustrative example answer, not a claim about a real group.

## Storyboard (9 scenes; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–2.6 | A used bag (stain) drops onto an inspection table (squash, dust); "?"; camera eases out. |
| B Zips | 2.6–5.15 | Plaque "1 ZIPS"; a hand from above pulls the slider: teeth part, dark gap opens, then closes; ✓ in the pause. |
| C Straps | 5.15–8.3 | Plaque "2 STRAPS"; two hands tug the straps, the bag lifts; stitch points glow; "FRAYED ✗" card; ✓. |
| D Size | 8.3–11.75 | Plaque "3 SIZE"; gauge + "SMALL CHILD" mark; big bag overshoots (red zone ✗); it slides away, a small bag drops in and fits ✓. |
| E Clean | 11.75–14.9 | Plaque "4 CLEAN"; pocket opens, items pop into an "EMPTIED" box; cloth wipes the stain away; sun + drips, "DRY"; ✓. |
| F Ask | 14.9–18.8 | Helper with the bag asks "?"; volunteer at a "LOCAL GROUP" desk; board "WHAT'S NEEDED?" → SMALL BAGS, AGES 6–9 ✓✓. |
| G Test | 18.8–21.6 | Plaque "HAPPY TO RECEIVE IT?"; the clean bag turns on the table; ✓ "YES". |
| H Hand over | 21.6–25.8 | Bag passed helper → volunteer (same size); "READY TO USE"; "A GIFT" glows; "A LEFTOVER" ✗ falls away. |
| I CTA | 25.8–30 | Helper + neighbour with the essentials sack; real Help icon + name; lamps dim. |

## Captions (English; one ASR timing pass; every spoken word in exactly one card)
| Time (s) | Card |
|---|---|
| 0.12–1.13 | Can a child actually |
| 1.20–2.63 | use this school bag? |
| 2.70–3.65 | Check every zip: |
| 3.72–5.12 | open it, close it. |
| 5.19–6.41 | Tug both straps. |
| 6.48–8.21 | They should hold, not fray. |
| 8.28–9.38 | Match the size: |
| 9.45–11.72 | a small child needs a smaller bag. |
| 11.79–13.19 | Clean it: empty the pockets, |
| 13.26–14.90 | wipe it, let it dry. |
| 14.97–16.46 | Then ask the organisation |
| 16.53–18.80 | which bags and ages they need. |
| 18.87–19.76 | Last test: |
| 19.83–21.59 | would you be happy to receive it? |
| 21.66–22.49 | Then hand it over |
| 22.56–23.63 | ready to use: |
| 23.70–25.65 | a gift, not a leftover. |
| 25.95–29.70 | Download Help to donate essentials. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean (exit 0, 0 errors) · AAC-LC 48 kHz stereo · −15.1 LUFS /
−1.6 dBTP · captions x 103–977, y 376–496, 0 violations · **ASR-only listening limitation** (no human listen): Vosk English on the final mix
recognises 76/77 words ("this" → "the"). Fixed: plaques hidden by arms; too-brief size overshoot; empty stage at 8.0–8.6 s (re-rendered).
Details: output `QA.md`.

## Publishing caption
`production/30s/2026-11-06-english-06/publishing-caption.txt` — the final transcript verbatim (checks on separate lines), "(Illustrative scene.)",
four sources, three hashtags. App name: Help only; no other app/platform names; no editing notes.
