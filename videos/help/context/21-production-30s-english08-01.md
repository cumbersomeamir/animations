# 21 — english-08 (2026-11-07) 30 s #01 — English: read the date before you donate food (use-by vs best-before)

**Status: DONE.** `videos/help/production/30s/2026-11-07-english-08/help-30s-english08-01.mp4` · SHA-256 `455326f9ef5628e409edd14f70efd62ba69a7e187f8f4ae56a09cb8aecec4e3b`.
Confirmed before edits: app Help (`com.tensorblue.help`), repo `cumbersomeamir/animations`, branch `claude-video/help` (clean, HEAD = origin
`9ebd271`; english-07 already pushed; no render/ffmpeg job running, nothing to checkpoint), assigned account info@tensorblue.com, workspace
`videos/help/` only. Language: English narration + captions only; Meshline voice synthesized fresh (no Hindi audio reused).

## Topic check → subject changed (episode history consulted)
Suggested: "why donating food that needs refrigeration can fail when a distribution point has no cold storage" (donor checks storage, transport
time, dietary needs, then picks shelf-stable items). **Already covered by round-02 (15):** "Often, timing, storage and transport break the link…
the kitchen has no cold space, and no van is free before it spoils… ask a verified local group what it accepts, and when." So a fresh food-donation
subject in the same genre was chosen: **read which date is printed — use-by (safety, food that goes off quickly) vs best-before (quality, long-life
food) — and give long-life food well within its date.** Not covered by any episode. Kept from the brief: respectful fictional donor, the
shelf-stable choice (a tin over chilled salad), one concrete takeaway, no impact numbers, straightforward Help CTA.

## Approved style kept (notes)
Most recent accepted look (english-07 stage head/primitives unchanged; Three.js not used): cream cloth + two lamps, lamp-dip scene changes, cut-out
hands, carved plaques, yellow-hat helper (0.7; 0.8 in the CTA), real Play icon, quiet pad + scene-change motif, voice upfront. New props in the
same carved-hide language: fridge + wall cupboard with swinging doors and cold mist, ready-to-eat salad tub, tin of beans, USE BY / BEST BEFORE
label tags, shield ("SAFETY"), fast clock ("GOES OFF QUICKLY"), star ("QUALITY"), months calendar ("LONG-LIFE"), food-bank shelf (tins, pasta,
rice), "FRESH ✗" card, TODAY → BEST BEFORE timeline ("MONTHS LEFT"), paper "FOOD BANK" bag. Hook: at frame 0 the doors are already swinging;
the salad and the tin hop out onto the table by 0.7 s; "?" at 1.7 s.

## Final script (English; 76 words; 23.6 s of speech)
| # | Start–end (s) | Line |
|---|---|---|
| 1 | 0.35–3.05 | A fresh salad or a tin: which one can you donate? |
| 2 | 3.50–6.48 | Fictional example: a donor packs a food bank bag. |
| 3 | 6.95–8.22 | First, read the label. |
| 4 | 8.70–11.91 | Use by is about safety, on food that spoils quickly. |
| 5 | 12.40–15.94 | Best before is about quality, on long-life food like tins. |
| 6 | 16.45–21.13 | Food banks often want long-life food, and some ask for months left on the date. |
| 7 | 21.60–24.95 | So the tinned food goes in: sealed, and well within its date. |
| 8 | 26.05–27.89 | Download Help to donate essentials. |
Pronunciation tests (offline English ASR on candidate takes): "salad pot" at the track start → "solid pot" (lead-in clipped; now starts at 0.35 s,
"fresh salad"); "the tin goes in" → "the ten…" in every variant → "the tinned food goes in"; "well in date" → "and date" → "well within its date".
Final takes: every word recognised ("use" → "used", "its" → "it's" only).
Wording follows the sources: "yoghurt" was replaced by "salad" (GOV.UK names ready-to-eat salads for use-by); "food banks often want…, some ask for
months left" (two food banks' own pages), not a universal rule. CTA = approved verified-listing wording.

## Sources (accessed 2026-11-07)
- **L1** GOV.UK, "Understanding food labelling: Best before and use-by dates" (food.gov.uk's former page now redirects here),
  https://www.gov.uk/understanding-food-labelling/best-before-and-use-by-dates : "Use-by dates relate to the safety of food, whereas best before dates
  relate to quality." · use-by dates "must be shown on foods that go off quickly, such as meat products and ready-to-eat salads." · "Eating food after
  the use-by date could make you ill." · best before examples include "tinned foods (for example baked beans and canned tomatoes)". · "After the best
  before date, the food is usually safe to eat but may not be of the same quality."
- **D1** Devizes & District Foodbank, "Donate food", https://devizesdistrict.foodbank.org.uk/give-help/donate-food/ : "Please ensure that your food
  donations are non-perishable and have a minimum of 4 months until the best before date." · cannot accept "Food beyond its best before date".
- **W1** Walton & Hersham Foodbank, "Donating Food", https://waltonhersham.foodbank.org.uk/give-help/donate-food/ : "To enable us to manage waste,
  please donate ambient food with a long best before date." · "No fresh, out of date or opened food…"
- Tried, not used: Basingstoke Foodbank best-before post (404). Policies differ between food banks (some accept food just past best-before), so
  the script says "often" / "some" and the takeaway is "well within its date".

| Claim (spoken) | Support |
|---|---|
| Use by is about safety, on food that spoils quickly | L1 |
| Best before is about quality, on long-life food like tins | L1 (quality; tinned foods carry best before) |
| Food banks often want long-life food; some ask for months left on the date | D1 (non-perishable; ≥ 4 months), W1 (ambient, long best before) |
| The tinned food goes in: sealed, and well within its date | W1 (no opened or out-of-date food), D1 |
| Download Help to donate essentials | Verified Play listing |

## Storyboard (8 scenes; cues in output `src/cues.json`)
| Scene | Time | Action |
|---|---|---|
| A Hook | 0–3.3 | Fridge and cupboard doors swing open (cold mist); a salad tub and a tin of beans hop onto the table; "?". |
| B Fictional | 3.3–6.8 | "FICTIONAL EXAMPLE"; donor with a paper "FOOD BANK" bag beside the table. |
| C Read label | 6.8–8.5 | "READ THE LABEL"; a magnifier sweeps; tags "USE BY" (salad) and "BEST BEFORE" (tin) pop on strings. |
| D Use by | 8.5–12.2 | "USE BY = SAFETY"; big salad with frost flakes; shield "SAFETY"; fast clock "GOES OFF QUICKLY". |
| E Best before | 12.2–16.2 | "BEST BEFORE = QUALITY"; big tin; star "QUALITY"; months calendar "LONG-LIFE". |
| F Food bank | 16.2–21.4 | "FOOD BANK" shelf fills with tins, pasta, rice ("LONG-LIFE FOOD"); "FRESH ✗"; timeline TODAY → BEST BEFORE, "MONTHS LEFT". |
| G Pack | 21.4–25.8 | The donor drops the tin into the FOOD BANK bag; "SEALED ✓", "WELL IN DATE ✓"; the salad hops back into the fridge, door shuts; ✓. |
| I CTA | 25.8–30 | Helper + neighbour with the essentials sack; real Help icon + name; lamps dim. |

## Captions (English; one ASR timing pass; every spoken word in exactly one card)
| Time (s) | Card |
|---|---|
| 0.24–1.70 | A fresh salad or a tin: |
| 1.77–3.29 | which one can you donate? |
| 3.36–4.61 | Fictional example: |
| 4.68–6.74 | a donor packs a food bank bag. |
| 6.81–8.48 | First, read the label. |
| 8.55–10.16 | Use by is about safety, |
| 10.23–12.17 | on food that spoils quickly. |
| 12.24–13.97 | Best before is about quality, |
| 14.04–16.22 | on long-life food like tins. |
| 16.29–18.89 | Food banks often want long-life food, |
| 18.96–20.06 | and some ask for months |
| 20.13–21.38 | left on the date. |
| 21.45–22.97 | So the tinned food goes in: |
| 23.04–25.30 | sealed, and well within its date. |
| 25.89–29.70 | Download Help to donate essentials. |

## QA summary
30.000000 s · H.264 High 1080×1920 yuv420p 30/1 · 900 frames · full decode clean (exit 0, 0 errors) · AAC-LC 48 kHz stereo · −15.1 LUFS /
−1.7 dBTP · captions x 100–980, y 376–496, 0 violations · **ASR-only listening limitation** (no human listen): voice track 76/76 words; final mix
75/76 (hook "tin" → "ten", a small-model vowel confusion after the music was ducked deeper; "tins"/"tinned" recognised). Details: output `QA.md`.

## Publishing caption
`production/30s/2026-11-07-english-08/publishing-caption.txt` — the final transcript verbatim, "(Illustrative scene; the donor is fictional.)",
three sources, three hashtags. App name: Help only; no other app names; no editing notes.
