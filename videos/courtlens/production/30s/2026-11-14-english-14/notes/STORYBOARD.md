# Storyboard and timing: courtlens-30s-english14-01 (English, India)

Third episode under `context/09-feedback-rules-2026-11-11.md`. Built on the english-13 engine.
- **Kept:** genre, palette, Inter, grain, keyword-marker captions, series chip, icon CTA, narrator voice (Kokoro
  af_bella 0.7 + am_puck 0.3, en-us, 0.98), scene windows with scale crossfades, captions centred inside x 100..900
  (band y 340..540), a "thumb" render mode.
- **New props:**
  - an electricity bill with one disputed line
  - a pendant lamp whose light cone defines the room (lights out / back on)
  - plug and socket
  - a NOTICE envelope and a 15-tile day strip
  - a monthly-bills bar chart with a six-month average line
  - an hourglass
  - three step icons (letter, ₹ coin, receipt)

Structure (story criteria):
- **Thumbnail**
- **Hook** (why care: a wrong bill and the lights go out)
- **Escalation** (the threat: pay it all, or we cut you off)
- **Build-up + proof:** the statutory notice, then the under-protest deposit as one diagram revealed in order
- **Payoff:** the supply stays on, plus three concrete steps
- **CTA**

Timing source: `src/timeline.json`. Word times: `audio/lines/word_times.json`.

| Window | Time (s) | Narration | Visual (one idea) |
|---|---|---|---|
| Hook | 0.00–2.70 | l1 0.30→1.80 "Wrong bill. Lights out?" | Under a warm pendant lamp, an ELECTRICITY BILL **slides up** (0.05). The "THIS MONTH ₹9,800" line **lights red** (0.55) under "LAST MONTH ₹1,400". The lamp **flickers twice and dies** (1.15); the room drops into dark, and only the disputed line keeps glowing. Giant caption "WRONG BILL. LIGHTS OUT?" matches the thumbnail. |
| Escalation | 2.65–5.50 | l2 2.65→5.37 "The company says: pay it all, or we cut you off." | In the dark room a red notice **swings down**: "PAY ALL ₹9,800 / OR DISCONNECT" (3.1). The plug is **yanked out** of the socket with a spark on "cut you off" (4.75). Chip "IS THIS LEGAL IN INDIA?". |
| Proof 1 | 5.50–6.90 | l3 5.65→ "But the Electricity Act…" | An "ELECTRICITY ACT" stamp **slams** down (5.95); "2003 · Section 56" fades in (6.55). |
| Proof 2 | 6.90–9.95 | l3 →9.75 "…requires fifteen clear days' written notice first." | A NOTICE envelope **drops in** (6.95). 15 day-tiles **fill one by one** (7.45–8.5); "15 CLEAR DAYS" (8.0); "IN WRITING" (8.55). |
| Proof 3 | 9.95–17.75 | l4 10.10→17.49 "Disputing the bill? Deposit, under protest, the lower amount: what they claim, or your six-month average for each month." | Six monthly bars **rise** (10.1), then the disputed month **towers** in red (10.8). An "UNDER PROTEST" stamp lands (12.2); "PAY THE LOWER" (13.1); "CLAIMED ₹9,800" tags the red bar (14.3). The **average line sweeps** across the six bars, "6-MONTH AVERAGE ₹1,400" (15.6). On "each month" (16.7) the average gets ✓ and the claim bar fades. |
| Payoff 1 | 17.75–21.25 | l5 17.90→20.42 "Then they can't cut you off while the dispute is pending." | The plug **slides back** in (18.2) and the lamp **relights**, its warm cone returning (18.45). "SUPPLY STAYS ON" (19.0). An hourglass **turns**, "WHILE PENDING" (19.9). |
| Payoff 2 | 21.25–26.75 | l6 21.40→25.19 "So put your dispute in writing, pay the lower amount, and keep the receipt." | Three steps **slide in one at a time**, each with ✓: letter "IN WRITING" (21.6), ₹ coin "PAY THE LOWER" (23.05), receipt "KEEP RECEIPT" (24.35). A "PAID UNDER PROTEST" stamp lands on the receipt (25.1). |
| CTA | 26.75–30.00 | l7 26.95→29.90 "Follow Courtlens for everyday Indian law explained." | The Courtlens icon **pops**, the arc **draws**: "Follow Courtlens / Everyday Indian law, explained". |

- **Narration:** 77 spoken words; speech 25.0 s.
- **Thumbnail:** the dark room with the dead lamp; the bill's red "THIS MONTH ₹9,800" line glows. "WRONG BILL." /
  "LIGHTS OUT?" and the series chip.
- **Amounts:** illustrative (see `LEGAL-SOURCES.md`, fact classification).
