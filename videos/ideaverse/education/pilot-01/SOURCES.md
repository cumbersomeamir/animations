# Sources and claim-to-source map — Pilot 01 (accessed 2026-11-02)

| # | Source | Date | What it supports |
|---|---|---|---|
| S1 | NIST AI 600-1, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*, https://doi.org/10.6028/NIST.AI.600-1 (§2.2 "Confabulation") | July 2024 | "Confabulation: The production of confidently stated but erroneous or false content…"; LLMs "predict the next token… can also produce outputs that are factually inaccurate"; "GAI outputs may also include confabulated logic or citations that purport to justify or explain the system's answer"; risk arises "often due to the confident nature of the response". |
| S2 | Kalai, Nachum, Vempala, Zhang, *Why Language Models Hallucinate*, arXiv:2509.04664, https://arxiv.org/abs/2509.04664 | 4 Sep 2025 | Models can produce "plausible yet incorrect statements instead of admitting uncertainty"; training/evaluation "reward guessing over acknowledging uncertainty". |
| S3 | Magesh, Surani, Dahl, Suzgun, Manning, Ho, *Hallucination-Free? Assessing the Reliability of Leading AI Legal Research Tools*, arXiv:2405.20362, https://arxiv.org/abs/2405.20362 | 30 May 2024 | Retrieval-based tools reduce hallucinations vs a general chatbot, yet "each hallucinate between 17% and 33% of the time" (legal research benchmark) → sources/retrieval help but do not guarantee correctness. |
| S4 | Wineburg & McGrew, *Lateral Reading and the Nature of Expertise: Reading Less and Learning More When Evaluating Digital Information*, Teachers College Record 121 (2019), https://purl.stanford.edu/yk133ht8603 | 2019 | Professional fact checkers verified claims by leaving the page to consult other sources ("lateral reading") and reached more warranted conclusions. |

## Claim map (what is said/shown → support)
| On screen / spoken | Type | Support |
|---|---|---|
| "This AI answer sounds certain." (TONE gauge slams to SURE) | Illustrative premise | S1 (confidently stated content), S2 |
| "But fluent writing isn't evidence." / caption "Fluent ≠ evidence" | Claim | S1 (next-token prediction can be fluent yet inaccurate; confident presentation misleads), S2 |
| "Open its support. There's a missing link." (answer HAS a support drawer and a SOURCE tag, but the chain has a gap) | Claim + metaphor | S1 (confabulated citations can "purport to justify"), S3 (retrieval/citations don't guarantee truth). Deliberately does not imply AI never retrieves or that citations are always right. |
| "Check a reliable source." | Advice | S4 (lateral reading), S1 (verify before acting) |
| "No match? Label it unconfirmed." | Advice | S1/S2 (acknowledge uncertainty rather than treat confident output as fact) |
| "Sounding sure isn't proof." / "Check the source before you trust it." | Takeaway | S1, S2, S4 |
| The answer box, "DEFINITELY.", gauge, chain, book, "NO MATCH" | Illustration | Invented for the lesson; labelled "ILLUSTRATIVE EXAMPLE · NOT A REAL CHAT" and "ILLUSTRATIVE" on the box. Not app UI, data or a report. |
| Ideaverse name + icon (signature only) | App fact | assets/icon.png, assets/listing.json. No product claims made. |
