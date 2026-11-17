# 33 — Production 30s english18-01 (English): "Your card works fine at home, then gets declined on holiday. Why?"

Batch 2026-11-15-english-18 ("NEXT EDUCATIONAL EPISODE", batch18; follows the delivered batch17). Workspace
`production/30s/2026-11-15-english-18/` · deliverables `ideaverse-30s-english18-01.mp4` + `ideaverse-30s-english18-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at e22a8a3; no job running, nothing queued).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules + first-frame rule (context/11).

## Topic check (history: context/09, 12–32)
- Proposed: "Why an email can look harmless while AI treats it as suspicious" (spam/phishing detection from combined
  signals: sender, links, message patterns; probabilistic filtering and errors; hook THE MESSAGE LOOKED NORMAL).
- Already covered: **feedback-01** (context/15, "AI you use daily — how spam filters learn to sort email": patterns from
  links, sales language and reports → a spam score → the mail service decides → a real message caught by mistake → check
  spam). english12-01 (voice-cloning scams) is also in the scam family → replaced.
- Chosen (same genre: an everyday AI that combines signals into a probabilistic risk score, with real errors and a concrete
  takeaway; equally strong opening): **card-payment fraud scoring** — why your own card gets declined on holiday (each
  payment is scored from hundreds of clues; clues that are fine alone stack past the bank's line; false declines; confirm in
  the bank's app, then pay again). Not covered by any earlier episode. No scam instructions; no bank or card brand UI.

## Script (English, 72 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + real question | Your card works fine at home, then gets declined on holiday. Why? |
| s2 | 5.00 | mechanism | Your card network scores each payment for fraud, using hundreds of clues. |
| s3 | 9.95 | clues (illustrative examples) | A new country. A new shop. A bigger amount than usual. |
| s4 | 13.75 | combination + threshold | Each alone looks fine. Together, the score climbs past your bank's line. |
| s5 | 18.55 | the error | So sometimes a real payment gets blocked. |
| s6 | 21.10 | payoff | If that happens, open your bank's app, confirm it was you, then pay again. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (base.en appends "//" noise after s4; ignored by the checker).

## Facts → sources (accessed 2026-11-17)
| claim | type | source |
|---|---|---|
| your card network scores each payment for fraud, using hundreds of clues | documented (Visa) | Visa Canada, "Fraud Prevention", https://visa.ca/en_CA/pay-with-visa/security/fraud-prevention.html — "Every time you pay with your Visa, Visa Advanced Authorization analyzes more than 500 data points to ensure that there has been no unusual purchase activity … Visa provides your bank with a comprehensive risk assessment" · Visa, "Visa Protect risk solutions", https://www.visa.com/en-us/solutions/secure-card-payments.html — "AI-powered fraud prevention"; "Real-time risk scoring helps issuers identify good and bad transactions"; "Evaluates up to 400 unique attributes per transaction". (Counts differ by page → narrated as "hundreds".) |
| a new country, a new shop, a bigger amount than usual | illustrative examples of "unusual purchase activity" | Visa Canada — "unusual purchase activity, such as a purchase in Munich and Moncton at the same time … analyzing usage patterns"; Visa Protect — patterns "by location of issuance, card type and transaction type". The three clues and their sizes are illustrative, not Visa's list. |
| each alone looks fine; together the score climbs past your bank's line | documented mechanism (score + issuer rules); bars illustrative | Visa Protect — "Using the VAA risk score along with 70+ transaction parameters, VRM helps issuers build targeted rules to decline only the highest-risk transactions" (the bank sets the line); Visa Canada — Visa provides the risk assessment to your bank. |
| sometimes a real payment gets blocked | documented | Visa Protect — "stop fraud and false declines"; Visa Canada — VAA "also helps reduce the likelihood of false declines". |
| open your bank's app, confirm it was you, then pay again | documented (bank examples; varies by bank) | Nationwide Building Society, "Fraud alert messages", https://www.nationwide.co.uk/help/fraud-and-security/fraud-alert-messages/ — "we'll block your card and send you a fraud alert message through our Banking app … tap Yes, it was me. We'll remove the block"; "If your transaction was declined, you'll need to make the transaction again"; "We'll never ask for your account number or PIN in a fraud alert message." · U.S. Bank, "What should I do if I receive a credit or debit card fraud alert?", https://www.usbank.com/customer-service/knowledge-base/KB0249205.html — "Fraud alerts are sent when we identify potentially suspicious activity … If it is valid, respond … to confirm". The narration points to the bank's own app (not to replying to texts), since lookalike scam texts exist. |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse payment or banking feature. |
Not used on screen: 1–99 score range, "about a millisecond" timing and fraud-prevented totals (secondary sources / inconsistent).
Illustrative: the café, terminal, card, amount (€24.80), the clue icons, bar heights, the bank's line, the bank-alert screen (EXAMPLE).

## Storyboard (cues.js)
1. 0–4.75 hook: DOCKET (puzzled) with a suitcase at a café counter; the terminal reads DECLINED €24.80; DECLINED ON HOLIDAY?
   from frame 0; head tilt on "Why?".
2. 4.75–9.9 card: a payment card, then a grid of clue dots lighting up (FRAUD SCORE → HUNDREDS OF CLUES); the dots clear
   and the dashed BANK'S LINE draws.
3. 9.9–13.6 three columns rise, one per clue (globe, shop, coins), each well under the line.
4. 13.6–18.35 ✓ over each (ALONE: FINE); the columns slide together and stack past the line, turn red, DECLINED stamp
   (TOGETHER: TOO HIGH).
5. 18.35–21 back at the counter: still DECLINED (FALSE ALARM).
6. 21–24.3 DOCKET's phone: bank alert "Was this you? Café, abroad €24.80"; touch on "Yes, it was me" → Card unblocked
   (CONFIRM IT WAS YOU).
7. 24.3–26.85 terminal close-up: the card taps again → APPROVED (PAY AGAIN).
8. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "DECLINED / ON HOLIDAY?".

## QA / status — IN PROGRESS (rendering)
