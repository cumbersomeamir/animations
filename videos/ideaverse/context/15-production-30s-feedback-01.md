# 15 — Production 30s feedback-01: "AI you use daily — how spam filters learn to sort email"

Round: 2026-11-02 feedback round. Workspace: `production/30s/2026-11-02-feedback-round/`.
Deliverable: `production/30s/2026-11-02-feedback-round/ideaverse-30s-feedback-01.mp4`.
Style: pilot-01 DOCKET newsroom (context/11 "STYLE CORRECTION"). Riso banned.

## Brief (user, verbatim intent)
- Broad, relatable everyday-AI topic; no LLM-prompting tutorial, no jargon.
- DOCKET opens INBOX and SPAM drawers while oversized original email envelopes explain the idea.
- Narrative actions: one suspicious envelope → pattern magnifier → clusters of messages → two sorting drawers →
  a genuine message recovered after a wrong guess.
- Takeaway: spam filtering uses learned patterns and can misclassify; check spam for a missing message.
- Do not claim Ideaverse filters email. Original illustrative emails only (fictional senders, `.example` links).
- DOCKET is a purposeful presenter and physical sorter.

## Script (Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98) — 55 words, ~22 s speech
| id | start (s) | line |
|---|---|---|
| s1 | 0.30 | Ever wondered how your inbox catches spam? |
| s2 | 2.95 | AI learns patterns from lots of examples: suspicious links, repeated sales language, and messages people flag. |
| s3 | 10.85 | A new email gets a spam score, then your mail service decides where it belongs. |
| s4 | 16.40 | But a real message can be caught by mistake. |
| s5 | 20.00 | If something important is missing, check your spam folder. |
| s6 | 25.90 | Explore more everyday AI with Ideaverse. |

## Facts → sources (accessed 2026-11-02)
| claim in video | source (original) |
|---|---|
| AI learns patterns from lots of examples | Google Workspace blog, "Spam does not bring us joy—ridding Gmail of 100 million more spam messages with TensorFlow", 7 Feb 2019: "ML makes catching spam possible by helping us identify patterns in large data sets". Paul Graham, "A Plan for Spam", Aug 2002: "I start with one corpus of spam and one of nonspam mail." https://workspace.google.com/blog/product-announcements/ridding-gmail-of-100-million-more-spam-messages-with-tensorflow · http://www.paulgraham.com/spam.html |
| suspicious links | Microsoft Learn, "ASF settings in anti-spam policies" (updated 2026-08): e.g. "Messages that contain numeric-based URLs (typically, IP addresses) are marked as spam." https://learn.microsoft.com/en-us/defender-office-365/anti-spam-policies-asf-settings-about |
| repeated sales language | Graham 2002: each token mapped "to the probability that an email containing it is a spam" (example high tokens: "promotion 0.99", "investment 0.86", "valuable 0.82"). |
| messages people flag | Gmail Help, "Report spam in Gmail": "As you report more spam, Gmail identifies similar emails as spam more efficiently." https://support.google.com/mail/answer/1366858 |
| a new email gets a spam score | Graham 2002: the top tokens "are used to calculate the probability that the mail is spam"; Microsoft Learn, "Spam confidence level": SCL value "-1, or 0 to 9" stamped on messages. Qualification (kept in notes, not on screen): real services combine many signals; Microsoft says the SCL alone no longer decides the verdict. https://learn.microsoft.com/en-us/defender-office-365/anti-spam-spam-confidence-level-scl-about |
| mail service decides where it belongs | Gmail Help: "suspicious emails that Gmail automatically identified as spam"; Microsoft: filtering decides verdicts "using categorization and other signals". |
| a real message can be caught by mistake | Graham 2002: "False positives are innocent emails that get mistakenly identified as spams." |
| check your spam folder / move it back | Gmail Help: remove an email from Spam ("Not spam"); "After you remove the email, future emails from that sender won't go to Spam." |
| Ideaverse | Name + icon only (assets/). No claim that Ideaverse filters email. |

## Storyboard (creative decisions)
1. 0–2.9 hook: oversized suspicious envelope ("YOU WON!!! CLAIM NOW", fictional link) flies in; DOCKET catches it, skeptic face.
2. 2.9–5.9 examples: envelopes stream onto two piles — mint "LOOKS NORMAL", amber "LOOKS LIKE SPAM".
3. 5.9–10.5 patterns: magnifier over the suspicious envelope highlights the link, the repeated sales words, the "reported" flags.
4. 10.8–15.6 score + sort: envelope on the MAIL SORTER; SPAM SCORE gauge swings HIGH; SPAM drawer opens, it drops in; a normal letter scores LOW → INBOX.
5. 16.4–19 mistake: a real job-interview email scores high by mistake and drops into SPAM; DOCKET puzzled.
6. 20–25.6 recovery: INBOX empty of it → DOCKET opens SPAM, pulls it out, NOT SPAM sticker, files it in INBOX.
7. 25.9–30 CTA: DOCKET to camera; "Explore more everyday AI with Ideaverse" + icon chip.

## QA / status
- (filled in after render — see the round's qa/QA.md)
