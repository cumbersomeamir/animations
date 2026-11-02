# Storyboard and timing: courtlens-30s-feedback-01

Source of truth for timing: `src/timeline.json` (shared by `scene.js` and `audio_mix.py`).
Narration line starts are absolute seconds; durations come from `audio/lines/line_durations.json`.

| # | Time (s) | Narration (start → end) | Visual action (verbs) | Distinct change |
|---|---|---|---|---|
| S1 | 0.00–3.30 | L1 0.30→3.03 "You ordered online. The item arrived broken." | Order card **springs** up; delivery track **fills** Ordered→Shipped→**Delivered ✓**; mug **slides out** from behind the card, **lands** (squash), crack **draws** at "broken" (2.50), halves **split**, shards **scatter** | Opening hook |
| S2 | 3.30–5.75 | L2 3.45→5.19 "Can a seller just say no refunds?" | Order card **shrinks** to a receipt beside the mug; seller's **NO REFUNDS** sign **drops and swings**; red dashed line **draws** to a "✕ No refund" tag | 1: banner |
| S3 | 5.75–15.15 | L3 5.62→11.27 "In India, e-commerce rules protect buyers when goods are defective or not as described." · L4 11.65→15.01 "A no-refunds label does not erase those obligations." | Rule card **slides between** sign and mug (cuts the dashed line), header "INDIA · E-COMMERCE RULES, 2020"; lines **reveal** as spoken; clause chips **highlight**: "defective" (9.05), "not as described" (10.20); sign **tugs** (11.8); tag **flips** to "✓ Return or refund" at "does not erase" (13.20) | 2: rule card / clause flips outcome |
| S4 | 15.15–21.65 | L5 15.50→21.51 "Changing your mind is a different situation; there is no automatic right to return every purchase." | Sign **exits** sideways; divider **draws**; stage **splits** DEFECTIVE OR NOT AS DESCRIBED / CHANGED MY MIND; rule card **morphs** into "RULE APPLIES: Return or refund can't be refused"; intact mug **slides in** + "Not for me" bubble; "NO AUTOMATIC RIGHT: Depends on the return policy" **pops** (18.45); mini NO REFUNDS sticker **lands** on that side (19.3) | 3: split comparison |
| S5 | 21.65–26.30 | L6 21.95→26.27 "Keep the invoice, photograph the problem, and request a refund in writing." | Columns **slide out**; action card **rises**; envelope **rises**; invoice **slides in** (22.15, tick 22.85); photo **slides in** (23.30, tick 24.10); flap **closes** + seal (24.55–24.95); "Refund request" **written** with pen (25.0–25.9, tick 26.0) | 4: evidence envelope + action card |
| S6 | 26.30–30.00 | L7 26.62→29.57 "Follow Courtlens for everyday Indian law explained." | Envelope **drops away**; action card stays as the final takeaway; Courtlens icon **pops**, brand arc **draws**, "Follow Courtlens / Everyday Indian law, explained" **slides in** | 5: CTA (final 3.4 s) |

Caption chunks (y 340–520, ≤2 lines) and keyword highlights are listed in `src/timeline.json` → `captions`.

Audio: pad chords change per scene (Am9 → Fmaj7 → C(add9) → G6 → Am7 → Fmaj7(add9) → Dm9 → Gsus → Cmaj9), no loop;
event SFX: card whoosh, track ticks, mug thud, ceramic crack, shard tinkles, sign tap, card slide, marker swipes,
tag-flip click + soft pluck, bubble pop, paper slides, flap/seal tap, pen scratch, three rising tick plucks, CTA chord.
