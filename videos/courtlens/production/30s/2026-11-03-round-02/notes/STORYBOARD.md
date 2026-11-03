# Storyboard and timing: courtlens-30s-round02-01

Renderer, palette, caption treatment, voice, pacing and motion are the accepted feedback-01 build
(`../../2026-11-02-feedback-round/src/`). This folder's `src/` is a copy with only episode performers and copy swapped.
Source of truth for timing: `src/timeline.json`. Line durations: `audio/lines/line_durations.json`.

| # | Time (s) | Narration (start → end) | Visual action | Change |
|---|---|---|---|---|
| S1 | 0.00–2.62 | L1a 0.25→2.58 "The bottle says MRP twenty rupees." | Price-label card **springs** up; the printed "MRP ₹20.00 (incl. of all taxes)" line gets a **marker sweep** (1.15); bottle **slides out** behind the card and **lands** (1.80) | Hook |
| S2 | 2.62–7.30 | L1b →5.45 "The shop wants twenty-five, because it's chilled." · L2 5.83→7.00 "Is that legal in India?" | Card **shrinks** to the right, bottle to the left; shop sign "CHILLED ₹25" **drops and swings** on "twenty-five" (3.25); frost and condensation **appear** on "chilled" (4.85); red dashed line **draws** to the "✕ ₹25 asked" tag | 1: shop's demand |
| S3 | 7.30–15.62 | L3 7.42→12.77 "Packaged goods must carry a maximum retail price, and it already includes all taxes." · L4 13.15→15.47 "A shop can't sell above it, chilled or not." | Rule card **slides between** sign and bottle ("INDIA · PACKAGED COMMODITIES RULES, 2011"); lines **reveal**; chips **highlight** "MRP" (9.35) and "incl. all taxes" (11.55); tag **flips** to "✓ Max ₹20 (MRP)" on "can't sell above it" (13.55); sign **tugs** on "chilled or not" (14.62) | 2: clause flips outcome |
| S4 | 15.62–18.95 | L5 15.89→18.74 "Restaurants and hotels serving you are a different case." | Sign **exits** sideways; divider **draws**; split SHOP COUNTER / RESTAURANT OR HOTEL; rule card **morphs** to "MRP RULE APPLIES: Pay no more than the MRP"; served bottle on tray with glass **slides in**; "At my table" bubble; "DIFFERENT CASE: Water served with service" **pops** (17.85); "SC RULING 2017" tag **lands** (18.25) | 3: retail vs service |
| S5 | 18.95–26.32 | L6 19.12→26.29 "Overcharged? Keep the bill, snap the label, and contact the National Consumer Helpline: 1 9 1 5." | Action card "Overcharged at a shop? Do this:" **rises**; envelope **rises**; bill (Total ₹25) **slides in** (20.35, tick 21.05); photo of the MRP label **slides in** (21.50, tick 22.20); flap **closes** + seal (22.70–23.10); "NCH ·" **written** as the helpline is named (23.45); each digit of **1915 written as spoken** (24.85–26.15, tick 26.20) | 4: evidence + action |
| S6 | 26.32–30.00 | L7 26.62→29.57 "Follow Courtlens for everyday Indian law explained." | Envelope **drops away**; action card stays as the takeaway; Courtlens icon **pops**, brand arc **draws**, "Follow Courtlens / Everyday Indian law, explained" **slides in** | 5: CTA (final 3.38 s) |

Narration: 74 words, 27.01 s of speech. Captions: 12 chunks in `src/timeline.json` (≤2 lines, keyword marker).
Audio: the same pad voicings and SFX palette as feedback-01, with chord changes riding this timeline's scene events
(`CHORD_EVENTS` in `audio_mix.py`). Episode SFX: marker sweep on the MRP line, bottle tap, frost sparkle on "chilled",
one pen stroke per spoken digit.
