# Storyboard and timing: courtlens-30s-english07-01 (English)

Approved style kept: the accepted "Tiny Clause, Big Consequence" Canvas 2D renderer and scene recipe, through the
english-06 copy.
- Voice: the approved English voice (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98), freshly synthesised.
- English caption band and marker; Inter only.
- Episode changes:
  - performer: an ATM whose screen fails while its cash tray slides out empty
  - bank-alert card with the debit line
  - RBI rule card
  - on-time vs 3-days-late split with one "+₹100" chip per late day
  - ATM slip + SMS evidence

Timing source: `src/timeline.json`; word times: `audio/lines/word_times.json`.

| # | Time (s) | Narration | Visual action | Change |
|---|---|---|---|---|
| S1 | 0.00–4.36 | l1 0.22→4.43 "The ATM gave no cash, but two thousand rupees left your account." | Alert card **springs** up ("BANK ALERT · SMS", ATM withdrawal ₹2,000, pill "Balance ₹12,450", "Status: processing…"). ATM **lands** (0.62); its screen goes "Please wait" with pulsing dots (1.00). The cash tray **slides out empty** (1.40). The screen turns "Transaction failed" (1.75), the line **prints** "✕ Debited ₹2,000 · cash given ₹0", the pill turns red "Balance ₹10,450", and a warning sign **pops**. Marker **sweeps** the line on "two thousand" (2.54). | Hook (<2 s) |
| S2 | 4.36–6.00 | l2 4.71→5.75 "Can the bank keep it?" | Card **shrinks** right, ATM left; red sign "BANK HELPLINE · 'Under review'" **drops and swings** (4.73); dashed line **draws** to the tag "✕ ₹2,000 lost?" | 1: the claim |
| S3 | 6.00–16.19 | l3 6.03→11.67 "RBI rules say a failed ATM withdrawal must be credited back within five days." · l4 11.96→16.19 "After that, your bank owes you a hundred rupees a day, without you asking." | Rule card "INDIA · RBI DIRECTIONS ON FAILED TRANSACTIONS" **slides between**; lines **reveal** ("ATM debit, but no cash came out?", "Your bank must:" 7.65); chips appear (8.60). Tag **flips** to "✓ Back in 5 days" on "credited back" (9.97). Chips **highlight** "refund in 5 days" (10.59), "₹100/day if late" (13.66), "no claim needed" (15.20). Sign **tugs** (15.72). | 2: rule flips the outcome |
| S4 | 16.19–21.00 | l5 16.46→20.98 "Three days late? That's three hundred rupees, even at another bank's ATM." | Split "Back within 5 days" / "Back 3 days late". Rule card **morphs** into "ON TIME · ₹2,000 back by day 5". One "+₹100" chip **pops** per late day: day 6, 7, 8 (16.55 / 16.85 / 17.15). "3 DAYS LATE · ₹2,000 back + ₹300 extra" **pops** on "three hundred" (18.02). An "OTHER BANK" ATM **slides in** on "even at another" (19.06), with a "Not my bank" bubble (19.62). | 3: the concrete payoff |
| S5 | 21.00–25.98 | l6 21.26→25.98 "Not back? Complain to your bank, and after thirty days, to the RBI Ombudsman." | Action card "Money still not back?" **rises**; envelope **rises**. ATM slip (Status FAILED, cash given ₹0) **slides in** (21.55), then the SMS screenshot (22.20). Tick "Complain to your bank" (22.82). Flap **closes** + seal (23.25 / 23.70). Tick "Give it 30 days" (23.96). "cms.rbi.org.in" **written** (24.70). Tick "Then: RBI Ombudsman" (25.32). | 4: action + evidence |
| S6 | 25.98–30.00 | l7 26.26→29.21 "Follow Courtlens for everyday Indian law explained." | Envelope drops away; action card stays. The Courtlens icon **pops** and the arc **draws**: "Follow Courtlens / Everyday Indian law, explained". | 5: CTA (final 3.74 s) |

Narration: 78 spoken words; speech 27.3 s, with lines placed 0.28 s apart.
