# 20 — Batch `2026-11-06-english-07` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-06-english-07/tensorblue-30s-english07-01.mp4`
(copied to `production/30s/2026-11-06-english-07/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 6 Nov 2026) and topic decision
- **Suggested topic:** "why pressing Pay twice should not charge you twice" — an idempotency key travelling with a checkout request, a timeout and retry, one recorded payment.
- **History check: already covered.** Episode 14 (`2026-11-02-feedback-round`, feedback-01) is exactly that story: "You tap Pay. The connection drops. Should a retry charge you twice?…", with idempotency keys and one receipt.
- **What I did instead:** following the brief's rule ("if this suggested subject already exists choose a fresh equally useful subject in the same genre"), I chose a fresh system-design topic in the same checkout setting: **two people tap Buy on the last seat at the same moment.** It is a race condition, fixed by claiming the seat in one atomic conditional update. The mechanism differs from idempotent retries: two *different* buyers race, rather than one request being repeated.
- **Brief's honesty rule kept:** "well-built systems" vs "not every app does this". No claim about any real app or ticketing company.
- **Language and voice:** English narration and captions only. Voice is the approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi audio. "Meshline/Recall" are other apps; their context was not read.
- **Style:** the most recently accepted style kept: Blue Receipt Theatre, accepted renderer (`brt.mjs` unchanged, Node + `@napi-rs/canvas`, **not Three.js**), palette, captions, wipes and English CTA end card. The channel has no mascot (the recipe bans mascots), so none was added.
- **Performance-sheet improvements:** the sheet is not in this container. I followed the written points: a hook in 1–2 s (both Buy buttons pressed at 0.87 s, claim tokens racing to "Seat K12"), one concrete real demo, a clear takeaway, and the short CTA in the last 4 s.

## The real SQLite demo (`src/demo/seat_demo.py`, Python 3.12.3 stdlib, SQLite 3.45.1)
Fictional event "City Hall · Friday 8 pm"; one seat left, K12. Tables `seats(id, buyer)` and `tickets(seat, buyer)`.

| run | what happens | result (`demo/out/seat-demo.json`) |
|---|---|---|
| careless, interleaved as two servers can run it | A and B both `SELECT buyer IS NULL … 'K12'` → both see it free; both then `UPDATE seats SET buyer = …` and insert a ticket | **2 tickets for K12** (A and B) |
| one step | each runs `UPDATE seats SET buyer = '<buyer>' WHERE id = 'K12' AND buyer IS NULL`, then reads `changes()` | **A: 1 row changed, B: 0 rows changed → 1 ticket** |
| stress, 300 real-thread races each (barrier start, 2 ms of "app work" between check and sell) | careless vs one step | careless sold twice in 300/300; **one step 0/300** |

The careless 300/300 comes from the deliberate 2 ms gap; real-world frequency depends on timing. That figure is therefore **not shown** in the video. The screen shows only the interleaved result ("real SQLite run: 2 tickets for seat K12") and "SQLite demo: 300 races, 0 sold twice". The renderer reads `seat-demo.json` and refuses to render if any of these results change.

## Final script (as spoken; 87 words, 24.8 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.96 | Two people tap Buy on the last seat at the same moment. Who gets it? |
| L2 | 4.41–7.85 | A careless app checks first, both see it free, and it sells twice. |
| L3 | 8.20–11.94 | A well-built system claims it in one step: only if it's still free. |
| L4 | 12.29–16.38 | The database runs the claims one at a time; the second finds it taken. |
| L5 | 16.73–20.09 | So one person gets the ticket, and the other sees "sold out". |
| L6 | 20.44–24.43 | Not every app does this, but the fix is simple: check and claim together. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** Buy /bˈI/, database /dˈæTəbˌAs/, well-built /wˌɛlbˈɪlt/, and the accepted override `[Tensorblue](/tˈɛnsəɹblˌu/)`.

**Edit:** the first five-line draft left 5.6 s of silence before the CTA, so the payoff line L5 was added.

## Source → claim map (official documentation, read 2026-11-06)
| claim | source | what it says |
|---|---|---|
| Check-then-sell in two separate steps can sell one seat twice | demo (above) | Shown by the interleaved SQLite run: both checks see the seat free, and two tickets are created. A demonstration, not a statement about any real app. |
| A well-built system claims it in one step, only if it's still free | **PostgreSQL 18 — UPDATE** https://www.postgresql.org/docs/current/sql-update.html ; **SQLite — changes()** https://www.sqlite.org/lang_corefunc.html | PostgreSQL: "an UPDATE command returns a command tag of the form UPDATE count … If count is 0, no rows were updated by the query (this is not considered an error)." SQLite: changes() "returns the number of database rows that were changed or inserted or deleted by the most recently completed INSERT, DELETE, or UPDATE statement". The `WHERE … AND buyer IS NULL` condition is the "only if still free" part. |
| The database runs the claims one at a time; the second finds it taken | **PostgreSQL 18 — Transaction Isolation (Read Committed)** https://www.postgresql.org/docs/current/transaction-iso.html ; **SQLite — Isolation** https://www.sqlite.org/isolation.html | PostgreSQL: "the would-be updater will wait for the first updating transaction to commit or roll back … The search condition of the command (the WHERE clause) is re-evaluated to see if the updated version of the row still matches the search condition." SQLite: "There can only be a single writer at a time to an SQLite database." Connections "have to take turns." |
| One person gets the ticket, the other sees "sold out" | demo (above) | A: 1 row changed → ticket. B: 0 rows changed → the app shows "sold out". |
| Not every app does this | — | Deliberately no claim about any named app; the video contrasts "careless" and "well-built" designs only. |

**Illustrative, not claims:** the City Hall event, phones, seat card and tickets are invented UI. The isometric "database" machine with one slot is a teaching picture of writes taking turns on one row.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–4.16 | **S1 Hook** | Frame 0: two phones (A, B) on the same event, "Row K · Seat 12 · 1 seat left", blue Buy buttons. Both press at 0.87 s. Blue claim tokens A and B race to one "Seat K12" card; pill "same moment"; kinetic "Who gets it?". |
| 4.16–8.00 | **S2 Careless: check, then sell** | Wipe →. Two columns: "1 check seat K12 → ✓ free" for both, then "2 sell it": two white tickets "Row K · Seat 12", Buyer A and Buyer B. Kinetic "Sold **twice.**"; "real SQLite run: 2 tickets for seat K12". |
| 8.00–12.09 | **S3 One-step claim** | Wipe ←. Pills "check" and "sell" slide together into "claim: one step". The real statement `UPDATE seats SET buyer = 'A' WHERE id = 'K12' AND buyer IS NULL`; the last line highlights on "only", pill "= still free"; kinetic "One **step.**" |
| 12.09–16.53 | **S4 One at a time (isometric stage)** | Wipe ↑. A slab with one pale "database" machine with a single slot. Token A enters ("seat K12 · buyer A", "✓ A: 1 row changed"). Token B enters, "✕ B: 0 rows changed", and pops back out dimmed and tagged "taken". Kinetic "One **at a time.**" |
| 16.53–20.24 | **S5 Outcome (mirror of the hook)** | Wipe →. Same two phones: A's Buy button becomes a ticket; B shows "no seats left · Sold out" with a ✕ badge. Kinetic "One **ticket.**" |
| 20.24–25.80 | **S6 Takeaway** | Wipe ←. Row "careless — check, then sell — 2 tickets ✕"; row "well-built — claim in one step — 1 ticket ✓"; "SQLite demo: 300 races, 0 sold twice". Kinetic "Check and claim / **together.**"; the well-built row is outlined in blue on the chime. |
| 25.80–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/seat_demo.py` + `src/demo/out/seat-demo.json`.

Reused unchanged from english-06: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py` (narration-span ASR). `mix.py` was reused with only its seed (20261110), heading and chord comments changed.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono for the SQL (Apache-2.0, `assets/fonts/jetbrains-mono/`).
- Logo: `assets/brand/tensorblue-logo.svg`.
- SQLite (public domain) via the Python standard library.
- Voice: Kokoro-82M (Apache-2.0), cached `af_bella`/`am_puck`.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, real customer data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-06-english-07/tensorblue-30s-english07-01.mp4` · SHA256 `cc3505ef98f5d4760aeff7cd6fdd3b39178d831eb4497938de5c9521141f3c06` · 3,053,732 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.8 LU, **−1.8 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 13 groups pass: ink y 371–488, x 154–923 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | visual payoff in 1–2 s | both Buy buttons press at 0.87 s; claim tokens reach "Seat K12" by ~2 s |
| narration (one ASR pass, base.en, narration span) | intelligible | every word heard; WER 1.1 % = "Buy" written as its homophone "by" (low confidence 0.59). Same sound /bˈI/; caption and button show "Buy". |
| caption/speech timing | aligned | mean word-start drift 0.09 s, max 0.34 s |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- "Who gets it?" collided with the seat card (kinetic moved up, seat card smaller).
- Ticket text ran past the ticket edge (wider stub, 28 px text).
- The database label was clipped and a tiny face label sat under the tokens (bigger machine, one centred label, spaced queue).
- Phone A's ticket half-covered its Buy button (the ticket now replaces the button).
- A redundant seat card in the takeaway was replaced by an outline of the well-built row.

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- The demo uses SQLite. PostgreSQL behaviour is cited from its documentation, not run here.
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
