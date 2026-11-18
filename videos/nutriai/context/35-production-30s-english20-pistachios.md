# 35 — Production 30 s, english-20 (batch 20, delivered 2026-11-18): pistachios, shell weight vs edible kernels, "HALF IS SHELL?" (English)

Output: `videos/nutriai/production/30s/2026-11-17-english-20/nutriai-30s-english20-01.mp4` and thumbnail `.../nutriai-30s-english20-thumbnail.png` (folder date as named in the brief). QA + hashes: `.../QA.md`. Sources: `.../SOURCES.md` (+ `research/`). Publishing caption: `.../publishing-caption.txt`. Rules: `25-feedback-rules-2026-11-11.md` (incl. 2026-11-15 addenda) + the 2026-11-18 live feedback in `34-continuation-2026-11-18.md`.

## Topic decision (history checked first)
- Requested: pistachios — shell weight vs edible weight, nutrient breakdown per 100 g of edible kernels, a practical portion comparison, playful approved egg/avocado-era style. Never covered (no pistachio anywhere in this app; peanuts vs peanut butter was english-06). Requested topic used.
- Repo `cumbersomeamir/animations`, branch `claude-video/nutriai`, in sync with origin at `46e4873` (english-19) before edits; no running or unfinished job; nothing duplicated. No engagement inferred from the promoted post.

## Design (full-frame + 2026-11-18 feedback: bigger text, cooler motion, playful character)
1. Hook (violet; frame 0 = thumbnail): a grinning in-shell pistachio character (eyes, blush, shell gaping to show the green kernel), pistachios tumbling at two depths and a foreground heap; "HALF IS / SHELL?".
2. Crack (orange): pistachios pour onto a scale (100 g), tremble, burst; shell halves fly onto one scale (47 g, "SHELL"), kernels hop onto another (53 g, "KERNELS").
3. Breakdown (raspberry): a kernel character with eyes; "100 g KERNELS · ROASTED · NO SALT"; one big number at a time with its motif: ≈ 570 kcal (sparks), 46 g FAT (oil drops into a golden pool), 21 g PROTEIN (cubes stack), 10 g FIBRE (green strands).
4. Payoff (teal): the 100 g in-shell pile; shells turn into dashed ghosts; ≈ 300 kcal; "NOT 570" slashed in red.
5. Portion (indigo): 49 kernels count into a bowl (28 g), ≈ 160 kcal; the pistachio peeks in and winks; CalMeter seal + white wordmark.
Whip-pan scene changes (motion blur + speed lines), rays + bokeh parallax, squash-and-stretch, shakes, kinetic numbers; captions 84 px; motion at 30 fps, line boil 15 drawings/s.

## Final script (Kokoro Meshline blend; cached CTA take)
| Take | Start | Beat | Text |
|---|---|---|---|
| T0 | 0.15 s | hook | Pistachios in the shell: how much do you really eat? |
| T1 | 3.20 s | superhook | Let's crack open a hundred grams. |
| T2 | 5.25 s | proof | Forty-seven grams of that is shell. Just fifty-three grams of kernels. |
| T3 | 9.50 s | breakdown | Per hundred grams of kernels: about five seventy calories, |
| T4 | 13.10 s | breakdown | forty-six grams of fat, twenty-one of protein, and ten of fibre. |
| T5 | 17.35 s | payoff | So a hundred grams in the shell is about three hundred calories, not five seventy. |
| T6 | 22.70 s | portion | A handful of forty-nine kernels: about a hundred sixty. |
| T9 | 27.10 s | CTA | Track your food and nutrition with CalMeter. |

## Facts
- Measured (USDA SR Legacy): pistachio nuts, dry roasted, without salt FDC 170185: 572 kcal, 45.8 g fat, 21.0 g protein, 10.3 g fibre per 100 g kernels; raw FDC 170184 560 kcal (cross-check). SR28 refuse "Shells" 47 %; "1 oz (49 kernels) = 28.35 g" (edible).
- Calculated: 100 g in shell = 47 g shell + 53 g kernels ≈ 303 kcal; 49 kernels ≈ 162 kcal (≈ 54 g in shell).

## Storyboard (30 fps; `production/30s/2026-11-17-english-20/source/timeline.json`)
| Beat | Time | Action | Caption | Sound |
|---|---|---|---|---|
| Hook | 0–2.9 s | Frame 0 character + "HALF IS SHELL?" (exits ~1.5 s) | Pistachios / in the shell: · How much do you / really eat? | — |
| Superhook | 2.9–5.0 s | Whip to orange; pour onto scale, 100 g; tremble; burst at 4.67 s | Let's crack open / 100 grams. | whoosh, patter, creak, crack |
| Proof | 5.0–9.2 s | Halves → scale 47 g "SHELL"; kernels → scale 53 g "KERNELS" | 47 g of that / is shell. · Just 53 g / of kernels. | clack, patter, ticks |
| Breakdown | 9.2–17.0 s | Whip to raspberry; kernel character; 570 / 46 g FAT / 21 g PROTEIN / 10 g FIBRE | Per 100 g / of kernels: · about 570 kcal, · 46 g of fat, · 21 g protein, · and 10 g fibre. | whoosh, pop, drip, clack, sprinkle |
| Payoff | 17.0–22.4 s | Whip to teal; in-shell pile 100 g; ghost shells; ≈ 300 kcal; NOT 570 slashed | So 100 g in the shell / is about 300 kcal, · not 570. | whoosh, thud, tick, slash |
| Portion | 22.4–26.9 s | Whip to indigo; 49 kernels into a bowl, 28 g; ≈ 160 kcal; pistachio peeks | A handful of / 49 kernels: · about 160 kcal. | whoosh, patter, pop, boing |
| CTA | 26.9–30 s | CalMeter seal + white wordmark; wink | Track your food / and nutrition · with CalMeter | pencil, bed fades |
