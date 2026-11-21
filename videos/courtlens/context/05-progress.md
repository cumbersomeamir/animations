# Progress

Rounds are listed newest first. Earlier rounds are preserved verbatim from previous Courtlens chats.
Context files: 06-style-test.md + 07-test-progress.md (2026-11-01 15 s style test), 08-series-format.md (durable
series format from 2026-11-02, newest direction), episodes/ (per-episode briefs; 2026-11-03 hindi-03 is Hindi).

## Round 2026-11-21 (english-23, batch 23): "Paper or phone?": driving licence in DigiLocker at a traffic check

### Status
- **Confirmed before edits:** CLAUDE.md and this file reread; branch clean and in sync at 9d17ffb. Batch 22 was
  delivered, so nothing was pending or duplicated. Caches were intact.
- **The proposed topic (a NO RETURNS bill vs a defective toaster) repeats episodes 04 and 01.** Batches 08, 13, 16 and
  21 rejected it too.
- **Replacement (unrelated, and different from batch 22's valet in question, setting and mechanism):** a licence on
  your phone at a traffic check. Record: `context/episodes/2026-11-21-english23-licence-digilocker.md`.
- CHECKPOINT (before the full render): sources, narration, audio lines, timeline, scene, notes and thumbnail were
  committed.

### Verified facts (details: `production/30s/2026-11-21-english-23/notes/LEGAL-SOURCES.md`)
- **CMVR r.139 as amended by G.S.R. 1081(E), 2 Nov 2018:** "in physical or electronic form". Read via a reproduction;
  the MoRTH PDF was not retrievable here (checkpoint).
- **MoRTH letter RT-11036/64/2017-MVL, 8 Aug 2018** (official copy in Kerala Police Circular 25/2018):
  - DigiLocker/mParivahan records are "at par with the original documents"
  - impounding is reflected electronically via eChallan, with no physical seizure
- **PIB 26 Sep 2020 (ID 1659408; G.S.R. 584(E), w.e.f. 1 Oct 2020):** physical forms "shall not be demanded" once an
  officer validates electronically, "including in cases where there is an offence made out necessitating seizure".

### Creative decisions
- **Frame zero = thumbnail:**
  - a windshield view of a night POLICE checkpoint with red/cyan glow, road, cone and a fading dashboard (an empty
    wallet slot "?" and the phone glowing with a licence)
  - "PAPER OR PHONE?"
  - voice at 0.05 s
- **Beats:**
  - card → phone (ELECTRONIC FORM)
  - app tiles
  - card = phone (SAME AS ORIGINAL)
  - device scan → VERIFIED, paper ✕ (NO PAPER DEMANDED)
  - OFFENCE → record to database (RECORDED ONLINE)
  - + ADD (ADD IT NOW)
- **Narration:**
  - TTS spells "Diji Locker" and "M Pari-vaahan"; the normaliser maps phonetic/ASR spellings and licence/offence
    variants
  - "Stopped at…" became "You're stopped at…"
- **Mix gain:** 7.4 dB (−16.2 LUFS on the pre-render mix; fewer words than earlier episodes).
- **Self-check during research:** a retry of the MoRTH PDF with a browser user agent was blocked by the session's
  permission policy. It was not worked around; official copies via the Kerala Police and PIB were used instead.

### Exact commands (S = session scratchpad)
```bash
cd videos/courtlens/production/30s/2026-11-21-english-23/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st23 <times>
node render.cjs thumb .. courtlens-30s-english23-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build23 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english23-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english23-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
$S/tts/venv/bin/python capcheck.py ../courtlens-30s-english23-01.mp4 ../courtlens-30s-english23-01-thumbnail.png ../qa/frame-zero.jpg 230 470 470 545
```

### Fixed before the full render (stills review)
- The dashboard ended in a hard horizontal edge at y≈1480. It now fades into the paper, and the steering wheel is
  clipped.

### Next
- Full render, QA, QA.md, delivery commit and push, attach the MP4 and thumbnail.

## Round 2026-11-19 (english-22, batch 22): "Your car. Your risk?": valet "owner's risk" ticket (SC, 2019)

### Status
- **Confirmed before edits:** CLAUDE.md and this file reread; branch claude-video/courtlens clean and in sync at
  94beeff. Batches 20 and 21 were delivered, so nothing was pending or duplicated. Scratchpad caches (Kokoro, whisper)
  were intact.
- **The proposed topic (restaurant service charge) repeats episode 06.** The replacement is the valet "owner's risk"
  ticket (new in 01–21). Record: `context/episodes/2026-11-19-english22-valet-owners-risk.md`.
- The 19 Nov layout brief is persisted as an addendum in `context/09-feedback-rules-2026-11-11.md`.
- CHECKPOINT (before the full render, commit 9d03229): sources, narration, audio lines, timeline, scene, notes and
  thumbnail were committed.
- DELIVERED:
  - `production/30s/2026-11-19-english-22/courtlens-30s-english22-01.mp4`
    sha256 `592900abd62ccd2c60e44b0ac1ad98049d98270f4cbd0720940c0bffd0a44fc2`
  - `courtlens-30s-english22-01-thumbnail.png`
    sha256 `5716faf1c11dd39ce256f7416cf18bde761503c36201c52eff5dbb6dcb2577a3`
  - QA: `production/30s/2026-11-19-english-22/qa/QA.md`

### Verified facts (details: `production/30s/2026-11-19-english-22/notes/LEGAL-SOURCES.md`)
- **SC, Taj Mahal Hotel v. United India Insurance Co. Ltd., CA 8611/2019, 14 Nov 2019** (official PDF, sha256
  44b4453a…db26104):
  - paras 18.2–18.3: valet custody = bailment; a mere parking licence is not
  - paras 18.7–18.8: even if complimentary
  - para 19: failure to return = prima facie negligence; the burden is on the hotel
  - paras 28–30: the s.151 care can't be contracted out of; "owner's risk" clauses don't rescue a negligent hotel
- **Scope:** limited to hotels (para 28). Later commission orders (2023, 2024) follow it (notes only). No later SC
  change was found.

### Creative decisions
- **Central object:** a thick 3D valet ticket with keys. Its red fine-print line "PARKED AT OWNER'S RISK" glows at
  frame zero, is struck on "can't excuse" and tears off on "negligence".
- **Beats:** keys to the valet → care shield; FREE tag; car lost (dashed) then scratched; a PROOF weight on the
  hotel's pan; a self-park bay with no handover ✕; payoff: keep the ticket + write.
- **Layout:** captions raised to y≈280–460 (baselines 396 or 354/434; hook 92 px); chip at y 478; pills at
  y≈1356–1456.
- **Narration:** l9 reordered to end on "in writing" (the ASR heard "in riding"). The normaliser maps "twenty
  nineteen".
- Mix gain is 6.0 dB (−16.1 LUFS / −2.4 dBTP measured on the pre-render mix).

### Exact commands (S = session scratchpad)
```bash
cd videos/courtlens/production/30s/2026-11-19-english-22/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st22 <times>
node render.cjs thumb .. courtlens-30s-english22-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build22 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english22-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english22-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
$S/tts/venv/bin/python capcheck.py ../courtlens-30s-english22-01.mp4 ../courtlens-30s-english22-01-thumbnail.png ../qa/frame-zero.jpg
```

### Fixed before the full render (stills review)
- **Frame zero:** the keys covered "VALET" and "No." collided with "047". The key ring moved to the corner (keys hang
  outside the card), "No." was removed, and VALET shrank slightly.
- **FREE tag:** it covered the stand's VALET sign, so it moved up between the post and the podium.

### Fixed after the full render (decoded review and final-mix ASR)
- **Hook caption:** the ink reached y 277, so it is now 90 px, centred at y 400 (ink ≥ 285). qa.py's top zone is now
  y<280, per the brief.
- **Transitions:** dips became cross-fades (incoming scenes start 0.18 s early). The self-park figure now appears
  after the car parks. The episode was fully re-rendered.
- **Masked hook word:** the final-mix ASR heard l1 as "Your car at your risk" because the key jingle at 0.3 s masked
  it. The swing and jingle moved to 1.2 s and the rustle was softened. Re-render, verify and re-mux:
  ```bash
  node render.cjs range $S/build22/frames 0-125
  SKIP_TTS=1 SKIP_FRAMES=1 PY=$S/tts/venv/bin/python WORK=$S/build22 PYTHONDONTWRITEBYTECODE=1 ./build.sh
  ```
  Neighbours 126–128 were bit-identical.

### Verification (final MP4, all PASS)
- 30.000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −16.2 LUFS, true peak −2.4 dBFS; 10/10 lines at +3 ms; CTA 26.95–29.90 s.
- ASR WER 0.012 (only "Courtlens" → "Courtlands"); no words outside caption windows.
- Caption ink x 117..884, y 285..452 (band y≈280–460); y<280 clear (darkest pixel 205).
- Frame 0 vs thumbnail mean abs diff 1.67/255.

### Unresolved
- Listening is ASR-only. Nobody watched or listened in real time.
- **Scope:** the ruling is limited to hotels (para 28). The narration says "a hotel's valet". Restaurant and other
  applications by consumer commissions are in the notes only, not read in full.
- **Brief light frames:** about 4.0–4.2 s and 23.0–23.3 s, while the stamp and ticket spring in.
- The desktop review folder is not reachable from this environment. The MP4 is delivered in the repo and attached in
  chat.

### Next
- Await the next batch request. No automation and no further episode unless asked. `$S/build22/frames` is deleted
  after delivery.

## Round 2026-11-18 (english-21, batch 21): "Pay early, get fined?": loan pre-payment charges (RBI)

### Status
- Started after batch 20 was delivered, pushed (cba0f5e) and attached in this same continuation session.
- **The proposed topic repeats episodes 01/04:** the change-of-mind return vs faulty product vs disclosed policy was
  the core split of both, and batches 08, 13 and 16 rejected it as a repeat. The replacement is loan pre-payment charges
  (new in 01–20). Record: `context/episodes/2026-11-18-english21-loan-prepayment-charges.md`.
- CHECKPOINT (before the full render, commit 4d6631c): sources, narration, audio lines, timeline, scene, notes and
  thumbnail were committed.
- DELIVERED:
  - `production/30s/2026-11-18-english-21/courtlens-30s-english21-01.mp4`
    sha256 `85523e0101cbc99c948f365609ce2a5a3bddd03a91859dc1cf304450604f537e`
  - `courtlens-30s-english21-01-thumbnail.png`
    sha256 `ea23b446272937fba3722132397977fe3004ddf2874c7c8f9a242c533350a1e6`
  - QA: `production/30s/2026-11-18-english-21/qa/QA.md`

### Verified facts (details: `production/30s/2026-11-18-english-21/notes/LEGAL-SOURCES.md`)
- **RBI Commercial Banks – Responsible Business Conduct Directions 2025** (updated 1 Oct 2026):
  - para 352: no pre-payment charge on existing floating-rate non-business term loans to individuals
  - para 353: from 1 Jan 2026, none on floating-rate loans to individuals (non-business and business) and MSEs; any
    source of funds, part or full, no lock-in; other cases per policy, but only if disclosed in the sanction letter,
    agreement and KFS
- **RBI NBFC – Responsible Business Conduct Directions 2025** (updated 1 Jul 2026), paras 33–34: the same for
  non-business loans; business loans depend on the layer.
- **RBI (Pre-payment Charges on Loans) Directions 2025** (2 Jul 2025): applies to commercial banks (except payments
  banks), co-operative banks, NBFCs and AIFIs.

### Creative decisions (18 Nov feedback applied)
- **Central object:** the padlocked LOAN ball and chain with a red "2% FEE" tag (2% is illustrative). It is blocked in
  the escalation and springs open in the answer.
- **Inserts, one condition each:** a "%" buoy on waves (floating); home/studies/wallet tiles (not for business); a
  debt tower plus a new lender (part or full, any source); a "%" in concrete with the papers (fixed, if disclosed); the
  sanction letter and a magnifier (payoff).
- **Text:** one 1–3-word pill per beat.
- **Frame zero = thumbnail:** "PAY EARLY. GET FINED?" with a soft cyan halo; voice at 0.05 s.
- **Narration:** "NBFCs" was heard as "NBFC" (the plural dropped), so it became "banks and finance companies". The
  normaliser maps "two percent".
- Mix gain is 6.0 dB (−16.0 LUFS / −2.2 dBTP measured on the pre-render mix).

### Exact commands (S = session scratchpad)
```bash
cd videos/courtlens/production/30s/2026-11-18-english-21/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st21 <times>
node render.cjs thumb .. courtlens-30s-english21-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build21 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english21-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english21-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
$S/tts/venv/bin/python capcheck.py ../courtlens-30s-english21-01.mp4 ../courtlens-30s-english21-01-thumbnail.png ../qa/frame-zero.jpg
```

### Fixed before the full render (stills review)
- **Frame zero:** the lock and ball were enlarged, the chain made longer and visible, and a brand-cyan halo added.
- **Caption band:**
  - the opened shackle grazed the band at ~13.6 s, so the lift and rotation were reduced and the unlock scene lowered
    28 px
  - the torn tag's path would have crossed the band, so it now exits right
  - the concrete block's slam started at y≈496, so it now starts at 860
- **Fixed-rate beat:** the loan papers sat near the right edge, so they moved in (x 735) and the concrete moved left.

### Fixed after the full render (frame review)
- **"ANY SOURCE" too late:** the ✓ and pill appeared only as the tower scene faded. newLender/arc/anySrc moved to
  15.55/16.0/16.5, and the tower window was extended to 17.5.
- **Near-blank beat (8.7–9.1 s):** the icons now start at 8.95, and the buoy fades later.
- **Re-render and re-mux:**
  ```bash
  node render.cjs range $S/build21/frames 250-310
  node render.cjs range $S/build21/frames 460-526
  SKIP_TTS=1 SKIP_FRAMES=1 PY=$S/tts/venv/bin/python WORK=$S/build21 PYTHONDONTWRITEBYTECODE=1 ./build.sh
  ```
- Neighbour frames 247–249, 311–313, 457–459 and 527–529 were bit-identical on a fresh render.

### Verification (final MP4, all PASS)
- 30.000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −16.0 LUFS, true peak −2.3 dBFS; 9/9 lines at +3 ms; CTA 26.95–29.90 s.
- ASR WER 0.012 (only "Courtlens" → "Courtlands"); no words outside caption windows.
- Caption ink x 117..884, y 331..518; top zone darkest pixel 205.
- Frame 0 vs thumbnail mean abs diff 1.61/255 outside the chip band.

### Unresolved
- Listening is ASR-only. Nobody listened to it or watched it in real time.
- **Lender coverage:** Small Finance Banks, Payments Banks, RRBs, Local Area Banks and co-operative banks have
  separate consolidated directions, which were not read. The July 2025 Directions covered co-operative banks and all
  commercial banks except payments banks.
- **Loans before 2026:** the older-loan rule (paras 352/33) has no explicit "source of funds / part or full" wording.
  The narration's wording is in the new-loan text and is consistent with the unconditional older ban.
- **Crossfade dips:** brief dips to paper (≈0.2–0.3 s at 5.55, 9.0 and 21.5 s) remain; this is the established
  style.
- The desktop review folder is not reachable from this environment. The MP4 is delivered in the repo and attached in
  chat.

### Next
- Await the next batch request. No automation and no further episode unless asked. `$S/build21/frames` is deleted
  after delivery.

## Round 2026-11-18 (english-20, batch 20): "Deposit gone for wear and tear?": security deposit (Tamil Nadu)

### Status
- **Continuation:** new app-isolated Code session (account load-balancing, expressly authorised 18 Nov). Context:
  `context/10-continuation-2026-11-18.md`.
- **Confirmed before edits:**
  - repo cumbersomeamir/animations, branch claude-video/courtlens
  - working tree clean and in sync with origin at 8ac97e0
  - no batch-20/21 folder locally or on the remote (nothing to resume or duplicate)
  - caches restored, with model hashes matching
- **Topic:** new (no deposit or wear-and-tear episode in 01–19). Record:
  `context/episodes/2026-11-17-english20-deposit-wear-and-tear-tn.md`.
- **18 Nov feedback** persisted as an addendum in `context/09-feedback-rules-2026-11-11.md`.
- CHECKPOINT (before the full render, commit c5772d2): sources, narration, audio lines, timeline, scene, notes and
  thumbnail were committed.
- DELIVERED:
  - `production/30s/2026-11-17-english-20/courtlens-30s-english20-01.mp4`
    sha256 `6b8d5ca09fa636e4fae6cd4635f2b6e204676b06f8e4b884d5b7e6bbf5bb6d14`
  - `courtlens-30s-english20-01-thumbnail.png`
    sha256 `e324e28eb87b1f325b04d0002ad460c55d1c18d0e3f5d6a432e69e342496dd24`
  - QA: `production/30s/2026-11-17-english-20/qa/QA.md`

### Verified facts (details: `production/30s/2026-11-17-english-20/notes/LEGAL-SOURCES.md`)
- **TN Act 42 of 2017** (Gazette copy via PRS, sha256 09a11942…cc1a91; extends to the state's urban areas, s.1(2)):
  - s.11(2) as amended by Act 39 of 2018 s.9: refund "at the time of taking over of possession of the vacant premises
    by the landlord, after making due deduction of any liability of the tenant"
  - s.15(1): "Notwithstanding any contract in writing to the contrary… as good a condition as at the commencement…
    except for normal wear and tear"
  - s.16(a): no intentional or negligent damage
  - Second Schedule Part A item 2: whitewashing walls / painting doors and windows = landlord
- No 2023–2026 amendment found. Act 19 of 2022 doesn't touch these sections, and its commencement is unconfirmed.

### Creative decisions (18 Nov feedback applied)
- **One continuous rented-flat diorama** in one-point perspective with a keyframed camera (dolly/zoom to the back
  wall, the window and the door). No slides.
- **One short label per beat:** NORMAL WEAR, LANDLORD'S JOB, DEDUCTED, AT HANDOVER, IN WRITING.
- **Frame zero = thumbnail:**
  - the padlocked ₹45,000 envelope in the worn flat, with a red ring on a stain
  - "DEPOSIT GONE FOR WEAR & TEAR?"
  - voice at 0.05 s
- **Motion beats:**
  - keys drop
  - rewind to move-in day, then a day/night time-lapse
  - roller wipe and a struck agreement line
  - a cricket ball cracks the window; notes fly as the amount rolls ₹45,000 → ₹43,500
  - the envelope returns; keys arc onto the peg
  - phone flashes with polaroids IN/OUT; a pen writes
- Amounts are illustrative. No forum is named (it would need the s.4-A registration caveat, and the feedback asked for
  less information).
- Mix gain is 6.0 dB (−15.9 LUFS / −2.4 dBTP measured on the pre-render mix).

### Exact commands (S = session scratchpad)
```bash
cd videos/courtlens/production/30s/2026-11-17-english-20/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st20 <times>
node render.cjs thumb .. courtlens-30s-english20-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build20 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english20-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english20-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Phone viewfinder:** it rendered as a solid navy block because the even-odd path was reset by `rr()`. It is now
  one see-through path.
- **Frame zero:**
  - the worn layer was too faint, so the stains are stronger and the inner vignette deeper
  - a picture "ghost" plus the key hook read as a face, so the ghost was removed and the hook became a peg
  - two red rings overlapped, so there is now one at t=0 and a second drawn on "faded"
- **Keys:** they were hidden behind the envelope, so they moved left.
- **Window beat:** the crack was small, so a cricket ball now flies in, with a tighter zoom (1.65).
- **Odometer:** it now rolls in ₹100 steps. The chip moved up to y=548, off the room frame.
- **Narration:** trimmed from 28.4 s to 26.4 s. "Tamil Nadu's tenancy law draws the line" was heard with a break, so
  it became "…says:".

### Verification (final MP4, all PASS)
- 30.000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −15.9 LUFS, true peak −2.4 dBFS; 9/9 lines at +3 ms; CTA 26.95–29.90 s.
- ASR WER 0.013 (only "Courtlens" → "Courtlands"); no words outside caption windows.
- Caption ink x 104..897, y 358..516 (`src/capcheck.py`); top zone darkest pixel 205.
- Frame 0 vs thumbnail mean abs diff 1.52/255 outside the chip band.
- Render: 900/900 frames in one pass (107 s), no retries. Frame review found no defect needing a re-render.

### Unresolved
- Listening is ASR-only. Nobody listened to it or watched it in real time.
- **Interpretation:** a cost the Act excludes (normal wear and tear) or assigns to the landlord (repainting) is not a
  "liability of the tenant" for s.11(2). No court ruling on this point was read.
- The commencement of Act 19 of 2022 is unconfirmed; it doesn't touch the sections used. The principal Act's
  22 Feb 2019 commencement rests on secondary sources plus the G.O. reference.
- The desktop review folder is not reachable from this environment. The MP4 is delivered in the repo and attached in
  chat.

### Next
- Batch 21 (English) in this session. `$S/build20/frames` is deleted after delivery.

## Round 2026-11-17 (english-19, batch 19): "₹18 for their bag?": carry bag charges

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at 464b92f. Batch 18 was delivered and is
  not repeated.
- The proposed topic ("Can a shop charge more than MRP?") repeats episode 02. The replacement is a carry bag charged at
  the billing counter. Record: `context/episodes/2026-11-17-english19-carry-bag-charge.md`.
- CHECKPOINT (before the full render, commit fafd99d): sources, narration, audio lines, timeline, scene, notes and
  thumbnail were committed.
- DELIVERED:
  - `production/30s/2026-11-17-english-19/courtlens-30s-english19-01.mp4`
    sha256 `fee5078b4f9cf67d500ce9dd0b359207201535dfd2138a2a21b673146997ecac`
  - `courtlens-30s-english19-01-thumbnail.png`
    sha256 `7265fd8c64460c19b8253807d4509b6710cf577f4cef809efe8c41ecab049343`
  - QA: `production/30s/2026-11-17-english-19/qa/QA.md`

### Verified facts (details: `production/30s/2026-11-17-english-19/notes/LEGAL-SOURCES.md`)
- **NCDRC, Bata India Ltd v. Dinesh Parshad Raturi, RP 1715/2019 with RP 774/2020, 27 Nov 2024 (full text read):**
  - 23.1: no obligation to give bags free
  - 23.2: purchase optional
  - 23.3: a bag with the seller's name or logo can't be charged for
  - 23.4: empty own bags allowed (unless local law prohibits)
  - 23.5: notices incl. at the entrance; invoice notice not enough
- **NCDRC, Big Bazaar v. Ashok Kumar, RP 975/2020, 22 Dec 2020:** prior notice before choosing the shop and goods.
- **Later orders, consistent:**
  - Uttarakhand State Commission, 30 Oct 2026: informed purchase, no law mandates free bags
  - South Delhi District Commission, 26 May 2026
- No Supreme Court ruling was found.

### Creative decisions
- **Frame zero = thumbnail:**
  - their "S · SHOP" logo bag with a red ₹18 tag on a lit billing counter, the receipt showing "CARRY BAG ₹18"
  - "₹18 FOR THEIR BAG?"
  - voice at 0.05 s
- **Beats:**
  - receipt line marked red
  - NATIONAL CONSUMER COMMISSION · 2024 stamp
  - the same bag returns plain: ✓/✕ "YOUR CHOICE"
  - the logo slams on and the tag flips to FREE: "LOGO BAG = FREE"
  - a tote swings in: "BRING YOUR OWN"
  - shopfront notice board "CARRY BAGS / ₹ EXTRA / OPTIONAL": "BEFORE YOU SHOP"
  - three steps
  - CTA
- **Attribution:** the conditions are "The National Consumer Commission said:" (directions in the Bata case).
- **Not narrated (no blanket "illegal" claim):** state orders, plain-bag pricing, local-law limits.
- **Narration:** trimmed from 29.0 s to 24.7 s (year moved to the stamp; "So at the counter" dropped).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-17-english-19/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st19 <times>
node render.cjs thumb .. courtlens-30s-english19-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build19 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english19-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english19-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The logo's rubber-stamp prop entered the caption band and pressed at the wrong spot. It was replaced by the
  series' slam-in of the logo itself (11.15 s, on "name or logo").
- The counter front was too heavy, so it now fades earlier. The receipt was enlarged so "CARRY BAG ₹18" reads.
- The bag stage was raised so "YOUR CHOICE" clears the bottom overlay zone.
- Per-line ASR before the render: lines 1–8 word-perfect; brand heard as "Courtlands" (as in all episodes).

### Verification (final MP4, all PASS)
- 30.000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −16.3 LUFS, true peak −2.4 dBFS; 9/9 lines at +3 ms; CTA 26.95–29.90 s.
- ASR WER 0.012 (only "Courtlens" → "Courtlands"); no words outside caption windows.
- Caption ink x 106..892, y 330..518; top zone darkest pixel 154 (the bag dropping in at 6.3 s).
- Frame 0 vs thumbnail mean abs diff 1.56/255 outside the chip band.
- Render: 900/900 frames in one pass, no retries. Frame review found no defect needing a re-render.

### Unresolved
- Listening is ASR-only. Nobody listened to it or watched it in real time.
- The conditions are NCDRC directions in the Bata case (copied to all State Commissions), not a statute. The video
  attributes them ("The National Consumer Commission said:"). State orders vary in detail (notes only).
- A Hindustan Times snippet about the Supreme Court and a commission judgment could not be opened (403) or
  identified. No Supreme Court carry-bag ruling was found.
- The desktop review folder is not reachable from this environment. The MP4 is delivered in the repo and attached in
  chat.

### Next
- Await the next batch request.

## Round 2026-11-15 (english-18, batch 18): "Your snack. Their rule?": cinema outside food

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at d849161. Batch 17 was delivered and is
  not repeated.
- The proposed topic is new (no overlap with 01–17). Record:
  `context/episodes/2026-11-15-english18-cinema-outside-food.md`.
- CHECKPOINT (before the full render, commit 0ca9e30): sources, narration, audio lines, timeline, scene, notes and
  thumbnail were committed.
- DELIVERED:
  - `production/30s/2026-11-15-english-18/courtlens-30s-english18-01.mp4`
    sha256 `60feee0992051e7b5c50696e8855f20e282ddc26bbe295f75e5d5977983b540b`
  - `courtlens-30s-english18-01-thumbnail.png`
    sha256 `cc535470b202d501ac9294e2717fe31cd33b56eb67b733d4c9998281c4b5dcfb`
  - QA: `production/30s/2026-11-15-english-18/qa/QA.md`

### Verified facts (details: `production/30s/2026-11-15-english-18/notes/LEGAL-SOURCES.md`)
- **SC, K C Cinema (K C Theatre) v. State of J&K, CA 77/2023, 3 Jan 2023 (official PDF):**
  - paras 23/32/35: cinemas are private property and may set entry conditions, including no outside food
  - para 33: the cinemas' recorded statements of free hygienic drinking water, and reasonable food for an infant or
    young child in practice
  - para 34: the Court requests owners to consider medical/dietary cases case by case
- No later change was found.

### Creative decisions
- **Frame zero = thumbnail:**
  - a giant foil snack bag stopped (✕) at a lit cinema entrance with "NO OUTSIDE FOOD", a rope and a red carpet
  - "YOUR SNACK. THEIR RULE?"
  - voice at 0.05 s
- **Beats:**
  - the SUPREME COURT · 2023 stamp
  - the door ✓ "THEIR ENTRY RULES"
  - a glass fills with water + FREE
  - bottle + lunchbox ✓ "CHILD'S FOOD / REASONABLE AMOUNT"
  - DIET note + ASK bubble "CASE BY CASE"
  - three steps
  - CTA
- **Strength-accurate wording:** "cinemas told the court", "they also said", "the court asked".
- Mix gain is 6.0 dB (−16.1 LUFS measured on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-15-english-18/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st18 <times>
node render.cjs thumb .. courtlens-30s-english18-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build18 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english18-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english18-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Frame zero:** the ✕ on the bag covered the "N" of "NO OUTSIDE FOOD", so the sign moved right and the ✕ moved to
  the bag's other corner.
- **Child-food beat:** a ~0.85 s empty start, so the items now enter at 11.75.
- **Narration:** trimmed from 28.2 s to 25.2 s (the year moved onto the stamp). The WER normaliser now maps "twenty
  twenty three".

### Fixed after the full render (frame review)
- Two near-blank beats: the stamp moved 4.55 → 4.3 s; the DIET note moved 16.3 → 15.95 s (with "On a medical diet?").
- Only the affected frames were re-rendered, then re-muxed:
  ```bash
  node render.cjs range $S/build18/frames 118-181
  node render.cjs range $S/build18/frames 475-503
  SKIP_TTS=1 SKIP_FRAMES=1 PY=$S/tts/venv/bin/python WORK=$S/build18 PYTHONDONTWRITEBYTECODE=1 ./build.sh
  ```
- Neighbour frames 112–117, 182–186, 469–474 and 504–505 were bit-identical on a fresh render. 501–503 differed, so
  the range was extended to 503.

### Verification (final MP4, all PASS)
- 30.000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −16.2 LUFS, true peak −2.5 dBFS; 8/8 lines at +3 ms; CTA 26.95–29.90 s.
- ASR WER 0.013 (only "Courtlens" → "Courtlands"); no words outside caption windows.
- Caption ink x 107..892, y 330..518; top zone darkest pixel 204.
- Frame 0 vs thumbnail mean abs diff 1.93/255 outside the chip band.

### Unresolved
- Listening is ASR-only. Nobody listened to it or watched it in real time.
- Water and child food are the cinemas' statements recorded by the Court (para 33), not directions. The video words
  them that way.
- The desktop review folder is not reachable from this environment. The MP4 is delivered in the repo and attached in
  chat.
- The thumbnail's marquee bulbs are at a slightly different chase phase from frame 0 (99th-percentile diff 11.3/255).

### Next
- Await the next batch request.

### Next
- Full render, QA, QA.md, delivery commit and push, attach the MP4 and thumbnail, then delete `$S/build18/frames`.

## Round 2026-11-15 (english-17, batch 17): "30 grams missing. Legal?": short net quantity in a sealed pack

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at d9f80f0. Batch 16 was delivered and is
  not repeated.
- The proposed topic (a delivery app charging above MRP) repeats Episode 02's MRP ceiling and overlaps Episode 05's
  checkout instrument, so a fresh same-genre question was chosen. Record:
  `context/episodes/2026-11-15-english17-short-weight-pack.md`.
- A worker restart and a "Try again" happened mid-research. Work resumed from the scratchpad, with nothing lost.
- Checkpoint commit 72e683d was made before the full render.
- DELIVERED: `production/30s/2026-11-15-english-17/courtlens-30s-english17-01.mp4`
  (sha256 759e4aee5821d171fcefcb7a3568458e63f8bcd05d1dccf1a31715889098db28) and the thumbnail
  `courtlens-30s-english17-01-thumbnail.png` (sha256 8a450791f2b5f5f323173b07334c4e6726b03d92540df3fbf32d902ec4ef6b00;
  = frame-zero composition + chip).

### Verification (final MP4)
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −15.9 LUFS / −2.4 dBTP.
- Narration 8/8 at +3 ms; CTA 26.95–29.90 s.
- Frame 0 = the thumbnail composition (mean diff 1.6/255); voice at 0.05 s.
- Caption ink x 108..892, y 347..514; y<300 clear.
- English ASR on the final mix: WER 0.014 (only "Courtlands"); all words fall in caption windows.
- The frame review found no defects needing a re-render.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-15-english-17/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- The principal Rules are a scanned Gazette PDF read visually (no text layer, no OCR here). The quoted passages were
  transcribed from pp.43, 63–64 and 72.
- The review folder is not reachable from this cloud session, so the MP4 and thumbnail are attached in chat.

### Verified facts (details: `production/30s/2026-11-15-english-17/notes/LEGAL-SOURCES.md`)
- **Packaged Commodities Rules 2011** (DoCA Gazette scan):
  - r.6(1)(c): net quantity = the commodity contained in the package
  - First Schedule Table I: 500–1000 g → maximum permissible error 15 g
  - r.21: a complaint triggers a test at the retailer; short beyond the error → seize and act against the dealer;
    "when packed" proviso for environmental loss; within the error → may be sold
- No amendment through 21 Sep 2026 changes these.

### Creative decisions
- **Frame zero = thumbnail:**
  - the big sealed "RICE · NET QTY 1 kg" pack, a bowl of contents on the scale at 970 g, and a "−30 g" tag
  - "30 GRAMS MISSING. LEGAL?"
  - the tag pulses on "missing"; voice at 0.05 s
- **Beats:**
  - the label glows and the scale blinks
  - a gram gauge with the 15 g allowed band, then the needle drops to 970 ("30 g SHORT = 2×")
  - the officer badge, tested at the shop, the SEIZED stamp
  - the WHEN PACKED caveat (sun and moisture, "MAY BE EXCUSED")
  - three steps
  - CTA
- Mix gain is 6.0 dB (−15.2 LUFS measured at 6.8 dB on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-15-english-17/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st17 <times>
node render.cjs thumb .. courtlens-30s-english17-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build17 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english17-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english17-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Frame zero:** the "−30 g" tag and the label highlight only appeared later, so they are now present at t=0 (= the
  thumbnail) and pulse on their words.
- **"When packed" beat:** the strip on the pack was too small, so a large "WHEN PACKED" label was added. "MAY BE
  EXCUSED" moved clear of the pack.
- **A caption overflowed two lines and threw in the renderer:** "Marked 'when packed'? Environmental loss can be
  excused." was split at the pause.
- **Narration:**
  - "Complain, and a Legal Metrology officer" was heard as "an illegal metrology officer", so it became "Complain. A
    Legal Metrology officer".
  - Speech was trimmed from 27.5 s to 25.6 s.

### Next
- Await the next request. No automation and no further episode unless asked. `$S/build17/frames` was deleted after
  delivery.

## Round 2026-11-15 (english-16, batch 16): "Their city, or yours?": file a consumer complaint where you live

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at 6b7b006. Batch 15 was finished and was
  not repeated.
- The proposed topic (a shop refusing a refund for a defective product) duplicates Episodes 01 and 04, so a fresh
  same-genre topic was chosen. Record: `context/episodes/2026-11-15-english16-consumer-court-your-city.md`.
- A usage-limit pause and a worker restart happened mid-research. Work resumed from the scratchpad
  (`$S/legal16`), with nothing lost.
- Checkpoint commit b1e936d was made before the full render.
- DELIVERED: `production/30s/2026-11-15-english-16/courtlens-30s-english16-01.mp4`
  (sha256 38f107c106022de6cd70b369b6f9a01ff7261448fc6ced2ed8e36e9853966ad9) and the thumbnail
  `courtlens-30s-english16-01-thumbnail.png` (sha256 3f469b9c11244e39cb101b2df8484d2da617ffe5cfee57e045d8eee47729e6b1;
  = frame-zero composition + chip).

### Verification (final MP4)
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.1 LUFS / −2.4 dBTP.
- Narration 8/8 at +3 ms; CTA 26.95–29.90 s.
- Frame 0 = the thumbnail composition (mean diff 1.5/255); voice at 0.05 s.
- Caption ink x 106..894, y 330..518; y<300 clear.
- English ASR on the final mix: WER 0.051. The only misses are spellings: "companies" for "company's", "EJGreedy" for
  "e-Jagriti", and "Courtlands". All words fall in caption windows.
- **Frame review fixes:** remedy placeholders (17.6–18.9 s), a DEADLINE label, the stamp moved to 5.5 s, and
  sequential payoff labels.
  - Frames 150–210 and 430–805 were re-rendered in place and the file re-muxed.
  - Neighbouring frames were verified bit-identical.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-15-english-16/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- **Fee rule:** the nil fee up to ₹5 lakh (2023 amendment) is in the notes only, from a legal-database reproduction.
  The e-Gazette was unreachable (TLS failure / 503).
- **Regulation 3(4):** read via a reproduction (taxguru), not the NCDRC PDF.
- **e-Jagriti screens:** not fetched. The video shows a generic form with the portal name only.
- **Review folder:** not reachable from this cloud session, so the MP4 and thumbnail are attached in chat.

### Verified facts (details: `production/30s/2026-11-15-english-16/notes/LEGAL-SOURCES.md`)
- **CPA 2019:**
  - s.34(2)(d): file where the complainant resides or personally works for gain
  - s.35(1)(a): the consumer files, and may file electronically
  - s.39(1): remove the defect, replace, refund with interest, compensation
  - s.69: two years, with condonation possible
- **Jurisdiction Rules 2021:** District Commission up to ₹50 lakh.
- **NCDRC Procedure Regulations 2020, reg. 3(4):** appear in person, through an agent or through counsel.
- **PIB 23 Dec 2025:** e-Jagriti (from 1 Jan 2025) is operational in all states and UTs.

### Creative decisions
- **Frame zero = thumbnail:**
  - your home in front, their HQ tower far away, YOURS/THEIRS pins
  - "THEIR CITY, OR YOURS?"
  - the pins bounce on their words; voice at 0.05 s
- **Beats:**
  - phone cracks, NO REPLY, ANOTHER STATE
  - the CPA stamp
  - a commission rises by your home while the tower fades ("WHERE YOU LIVE")
  - the generic e-Jagriti form: FILE → FILED ✓
  - YOU vs LAWYER "OPTIONAL"
  - a 2-year bar with a PROBLEM pin
  - four remedy tiles
  - bill + replies → folder → district commission
  - CTA
- Mix gain is 6.8 dB (−16.5 LUFS measured at 6.3 dB on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-15-english-16/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st16 <times>
node render.cjs thumb .. courtlens-30s-english16-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build16 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english16-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english16-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Frame zero:** the pins were missing (they popped in later), so they are now present at t=0 and bounce on their
  words. Frame 0 now equals the thumbnail composition.
- **"THEIRS" label:** it touched the series chip, so the tower moved right.
- **YOU/LAWYER labels:** they were overlapped by the figures' legs, so they moved down.
- **Evidence folder:** it flew into the caption band, so it now scales about its own centre and lands on the
  commission.
- **Narration:** trimmed from 28.9 s to 27.4 s of speech. "Keep the bill and every reply" became "Keep your bill, and
  every reply," (ASR heard "in").

### Next
- Await the next request. No automation and no further episode unless asked. `$S/build16/frames` was deleted after
  delivery.

## Round 2026-11-15 (english-15): can your employer keep your original certificates? (one Madras HC case)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at d62f13a. No job was running: english-14
  was delivered.
- The proposed topic is new (no overlap with 01–14). Record:
  `context/episodes/2026-11-15-english15-employer-certificates.md`.
- The new "FIRST FRAME IS CRITICAL" directive is persisted as an addendum in `context/09-feedback-rules-2026-11-11.md`.
- Checkpoint commit 3026771 was made before the full render.
- DELIVERED: `production/30s/2026-11-15-english-15/courtlens-30s-english15-01.mp4`
  (sha256 c85d0109e5530db43a653d7b7bd29dc419f921e9c47202f9bf2cc32f549720bb) and the thumbnail
  `courtlens-30s-english15-01-thumbnail.png` (sha256 04cedb68e587a5f7329fb3223cd87a776bc3df156892292ec17f96ba684c4f02;
  = frame zero + chip).

### Verification (final MP4)
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.0 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA 26.95–29.90 s.
- Frame 0 = the hero composition (matches the thumbnail, mean diff 1.6/255); voice onset 0.08 s.
- Caption ink x 109..889, y 330..518; y<300 clear.
- English ASR on the final mix: WER 0.013 (only "Courtlands"); all words fall in caption windows.
- Frame review found a ~0.9 s near-empty beat at 21.05–21.95 s. The first payoff step moved to 21.35, frames 630–805
  were re-rendered in place (`node render.cjs range $S/build15/frames 630-805`), and the file was re-muxed with
  `SKIP_FRAMES=1`. Neighbouring frames were verified bit-identical.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-15-english-15/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- The judgment text was read from Indian Kanoon's reproduction; the Madras HC's own copy was not fetched.
- The BNS s.316 mapping is per secondary concordances (the video cites no section number).
- The scope is one single-judge HC order (TN). Other HCs (Kerala, Madras 2008) were cited in the Delhi 2018 judgment
  but not read.
- The desktop review folder is not reachable from this cloud session, so the MP4 and thumbnail are attached in chat.

### Verified facts (details: `production/30s/2026-11-15-english-15/notes/LEGAL-SOURCES.md`)
- **Madras HC, *A. John Paul v. State* (Crl.OP 9920/2012, 10.07.2012):**
  - a school kept teachers' originals after they resigned, citing a "repay three months' salary" clause
  - certificates are "only entrusted" and "cannot be retained like a ransom"
  - the management may sue for money owed
  - police were directed to register a s.406 IPC case
- **Delhi HC, *Tomar v. UoI* (2018):** degrees cannot be held "by way of ransom" absent a bond clause. Supporting, not
  narrated.

### Creative decisions
- **Frame zero = thumbnail:**
  - the degree locked in an office glass drawer (HR plate, padlock, lit well, glass sheen) on a desk
  - "YOUR DEGREE. THEIR LOCK?"
  - `renderThumb` = `render(0)` + chip
  - voice onset 0.08 s
- **Beats:**
  - glass sheen + padlock rattle
  - resignation letter + "PAY UP FIRST" tag
  - degree handed to the HR tray (CUSTODY / WITH CONSENT)
  - MADRAS HIGH COURT · 2012 stamp
  - tag torn off: "NOT A RANSOM"
  - ₹ coin → courthouse: "SUE FOR IT"
  - police shield + case file "REGISTERED" / "BREACH OF TRUST"
  - three evidence steps
  - CTA
- Mix gain is 6.3 dB (−16.4 LUFS measured at 5.9 dB on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-15-english-15/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st15 <times>
node render.cjs thumb .. courtlens-30s-english15-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build15 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english15-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english15-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The drawer read like a screen, so a desk surface and an "HR" plate were added to make it an office drawer.
- The custody scene was small and its tick collided with "WITH CONSENT", so the scene was enlarged and the tick moved.
- The falling ransom tag crossed "NOT A RANSOM", so the label moved above the cabinet.

### Next
- Await the next request. No automation and no further episode unless asked. `$S/build15/frames` was deleted after
  delivery.

## Round 2026-11-14 (english-14): can the electricity company cut your power over a bill you dispute? (India)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at b782fd6. No job was running: english-13
  was delivered.
- The proposed topic (restaurant service charge) duplicates Episode 06, so a new same-genre topic was chosen. Record:
  `context/episodes/2026-11-14-english14-electricity-disconnection.md`.
- The approved rules in `context/09-feedback-rules-2026-11-11.md` were re-sent unchanged and apply as written.
- Checkpoint commit 5397727 (sources, narration, audio lines, timeline, scene, notes, thumbnail) was made before the
  full render.
- DELIVERED: `production/30s/2026-11-14-english-14/courtlens-30s-english14-01.mp4`
  (sha256 57cbf3ed137dcb85947a628c652e4606f8054ab4154c5632254aba72c24980ff) and the thumbnail
  `courtlens-30s-english14-01-thumbnail.png` (sha256 0931017c372a3c34248fc6e5b2bbefe2bf93aa522b317202922ab580b159be2f).

### Verification (final MP4)
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.0 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA 26.95–29.90 s (final 3.05 s); y<300 clear.
- Caption ink in decoded frames: x 104..891, y 330..518.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in caption
  windows.
- Render 900/900 with no capture retries.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-14-english-14/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- The official India Code copy of the Act was unreachable (CDN error or 403). s.56 is quoted from the Supreme Court's
  reproduction (2020).
- The Electricity (Amendment) Bill 2025: no enactment was found. The PRS bill page shows an unexplained "Passed" label,
  but the published draft does not amend s.56. Re-check if it is enacted.
- The desktop review folder is not reachable from this cloud session, so the MP4 and thumbnail are attached in chat.

### Verified facts (details: `production/30s/2026-11-14-english-14/notes/LEGAL-SOURCES.md`)
- Electricity Act 2003 s.56(1): disconnection for non-payment only after "not less than fifteen clear days' notice in
  writing".
- Proviso: no cut-off if the consumer deposits under protest the lower of (a) the sum claimed or (b) each month's
  charge at the preceding six months' average, "pending disposal of any dispute".
- The text is verbatim from the Supreme Court in *Bihar SEB v. Iceberg Industries* (27 Apr 2020).
- The Draft Electricity (Amendment) Bill 2025 does not amend s.56. No enactment was found as of 14 Nov 2026
  (checkpoint).

### Creative decisions
- Engine: english-13, with new props (bill with a disputed line, pendant lamp, plug/socket, notice envelope, 15-tile
  strip, bills bar chart with an average line, hourglass, step icons).
- Beats:
  - the lights die over a wrong bill (hook)
  - the "pay all or disconnect" notice and the plug yanked out (escalation)
  - the ELECTRICITY ACT stamp
  - notice + 15 clear days
  - bars → claim tower → UNDER PROTEST → PAY THE LOWER → average line ✓
  - the plug back in, the light returns, "SUPPLY STAYS ON / WHILE PENDING"
  - three steps + "PAID UNDER PROTEST"
  - CTA
- Hook words = thumbnail words = spoken hook: "Wrong bill. Lights out?"
- Amounts are illustrative.
- Mix gain is 5.9 dB (−15.6 LUFS measured at 6.3 dB on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-14-english-14/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st14 <times>
node render.cjs thumb .. courtlens-30s-english14-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build14 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english14-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english14-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Bill:** "THIS MONTH" collided with the amount, so the rows were resized.
- **Hook:** the bill stayed bright in the dark room, so the room now dims over the bill while the disputed line glows
  on top.
- **Hook → escalation:** the hook's zoom muddied the cut to the plug, so it became a short crossfade.
- **Notice:** the envelope was enlarged.
- **Chart:** "CLAIMED ₹9,800" collided with the UNDER PROTEST stamp, so the bar was shortened and the stamp moved.
- **Payoff:** the hourglass sat on the cable, so it was moved. The steps list was left-heavy, so it was centred.
- **Thumbnail:** the lamp cord showed through the chip, so the cord now starts below it.

### Next
- Await the next request. No automation and no further episode unless asked. `$S/build14/frames` was deleted after
  delivery (disk hygiene).

## Round 2026-11-13 (english-13): can a bank refuse to exchange your torn note? (India)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com. The working tree was clean and in sync with origin at 479fe5b. No older job was pending:
  english-12 was delivered.
- The proposed topic ("NO RETURNS" vs a defective product) duplicates Episodes 01 and 04, so a new same-genre topic
  was chosen. Record: `context/episodes/2026-11-13-english13-torn-note-exchange.md`.
- The approved rules in `context/09-feedback-rules-2026-11-11.md` were re-sent unchanged on 13 Nov and apply as
  written.
- Checkpoint commit 58a6580 (sources, narration, audio lines, timeline, scene, notes, thumbnail) was made before the
  full render.
- DELIVERED: `production/30s/2026-11-13-english-13/courtlens-30s-english13-01.mp4`
  (sha256 dbc4f175950a4bfe6e3e6618e820002ca6e824ac21f4aea844f4943d568b6913) and the thumbnail
  `courtlens-30s-english13-01-thumbnail.png` (sha256 60c3a9a030fc79761a8440e7332bab95593607d33a5b04d924aeee90beba67d5).

### Verified facts (details: `production/30s/2026-11-13-english-13/notes/LEGAL-SOURCES.md`)
- **RBI Master Direction – Exchange of Notes and Coins** (RBI/DCM/2026-27/395, updated 16 Oct 2026):
  - all branches exchange notes for customers and others, without discrimination (1.1/1.3/1.7)
  - a two-piece note pasted together with nothing missing is "soiled" (3); up to 20 notes / ₹5,000 a day are exchanged
    free over the counter (6.1.1)
  - mutilated notes may be presented at any branch and are adjudicated under the NRR (4.1)
  - complaint to the branch, then the Ombudsman after 30 days or a rejection (9)
- **NRR 2009 (amended 2018)** r.8(2), for ₹50 and above: full value if the largest piece is > 80%; half value at
  40–80%; otherwise rejected.
- **RB-IOS 2026** (from 1 Jul 2026, replacing 2021): first approach the bank with proof; escalate after 30 days or an
  unsatisfactory reply, within 90 days.

### Creative decisions
- The english-12 engine is reused with new props:
  - a stylised ₹500 note (tear / tape / missing-piece clipping)
  - a teller window and sign
  - branch fronts with lit exchange boards
  - people, the complaint letter, a calendar and the Ombudsman building
- Beats:
  - the note rips (hook)
  - the sign "NO ACCOUNT? NO EXCHANGE" and the tray pushed back (escalation)
  - the RBI RULES stamp
  - every branch's board lights, customer or not
  - halves taped → SOILED → FREE SWAP at the counter
  - a piece falls → ACCEPTED → the "what's left" size morphs through FULL / HALF / NOTHING
  - REFUSED? → a written complaint
  - a calendar 1→30 → envelope to the RBI Ombudsman
  - CTA
- Hook words = thumbnail words = spoken hook: "Torn note. Worthless?"
- Mix gain is 6.3 dB (−16.3 LUFS measured at 6.0 dB on the pre-render mix).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-13-english-13/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st13 <times>
node render.cjs thumb .. courtlens-30s-english13-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build13 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english13-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english13-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- **Narration:**
  - Trimmed from 30.2 s to 26.1 s of speech so the CTA lands in the last 3 s.
  - "Complain to the branch in writing" was heard as "complained", so it became "Make a written complaint".
- **Hook:** the torn halves drifted off-frame, so the scale and separation were reduced. Dash-like paper fibres were
  removed because they read as a decorative line.
- **Proof 2:**
  - The side branches' boards were clipped behind the centre branch, so the branches were spaced out.
  - The "CUSTOMER OR NOT" label overlapped the people, so the people were moved up and the label down.
- **Free swap:**
  - A floating navy bar read as a decorative line, so it became a full-width counter that the old note sinks behind.
  - The swap was faster so the "FREE SWAP" label is not crossed.
- **Transitions:** the RBI stamp now lands at 5.35, closing a blank gap after the counter scene. The Ombudsman building
  now enters after the calendar moves aside.

### Render issues and fixes
- **Two full renders failed** at ~450 frames (Chromium "Unable to capture screenshot", then the browser closed).
  - Cause: the session disk was full (86 MB free) from eleven old episodes' 900-frame PNG folders in the scratchpad.
  - Those reproducible intermediate folders were deleted, leaving 26 GB free. The delivered MP4s are in git.
  - `render.cjs` now retries a failed capture up to 3 times.
- **Frame review of the first complete render:**
  - The sign overlapped the chip (~2.9 s), so it now drops from the window top.
  - A stray shrinking tick appeared (~13.5 s), so it now fades with the swap.
  - The ✕ and the letter cross-faded (~21.2 s), so they are now sequential, and the ✕ pops at 20.5.
  - The episode was re-rendered in full.
- **Frame review of the second complete render:**
  - The fading "EVERY BRANCH" label sat behind the people (~9.0 s), so it now fades before they step in.
  - Frames 250–285 were re-rendered (`node render.cjs range $S/build13/frames 250-285`) and re-muxed
    (`SKIP_FRAMES=1 ./build.sh`).
  - Determinism evidence: frames 245–249 and 286–290 re-rendered with the new code are bit-identical to the full
    render.
- **Disk hygiene for future rounds:** delete `$S/buildNN/frames` after an episode is delivered (use literal paths).

### Verification (final MP4)
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.0 LUFS / −2.4 dBTP.
- Narration 8/8 at +3 ms; CTA 26.95–29.90 s (final 3.05 s); y<300 clear.
- Caption ink in decoded frames: x 103..894, y 330..518.
- English ASR on the final mix: WER 0.014 (the only miss is the ASR spelling "Courtlands"); all words fall in caption
  windows.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-13-english-13/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- The RB-IOS 2026 scheme PDF was blocked by a human-verification page. Claims rest on the official RBI FAQ and on
  Master Direction para 9, which still names the 2021 scheme.
- The Note Refund Rules were read via a fetch summary of the RBI page (partial quotes).
- The desktop review folder is not reachable from this cloud session, so the MP4 and thumbnail are attached in chat.

### Next
- Await the next request. No automation and no further episode unless asked.

## Round 2026-11-11 (english-12): can a landlord enter your rented home whenever they want? (Tamil Nadu)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens, assigned account
  info@tensorblue.com.
- The checkpointed english-11 render was finished first: it was re-rendered after a worker restart killed it at
  592/900 frames, then QA'd, pushed (04e1f5e) and attached.
- New approved feedback rules are persisted in `context/09-feedback-rules-2026-11-11.md` (5ad84ce); 08 points to them.
- DELIVERED: `production/30s/2026-11-11-english-12/courtlens-30s-english12-01.mp4`
  (sha256 fbedfed53307a8741b8aafd51a87f252006c6bc836699be0ea6f12af8663c6d2) and the thumbnail
  `courtlens-30s-english12-01-thumbnail.png` (sha256 250436d7efbb611fc7a68844206b79fef7684557272f7524652c86daef6c965b).
- Episode record: `context/episodes/2026-11-11-english12-landlord-entry-tn.md`.

### Verified facts
- TN Act 42 of 2017:
  - s.17(1)(a)–(c): entry only for repairs, an inspection, or a reasonable reason specified in the agreement
  - s.17(1): written notice at least 24 hours before entry
  - s.17(2): the notice states the reason, the day and a time between 7 am and 8 pm
  - TN Act 19 of 2022 would allow notice "in writing or through electronic mode"; commencement unconfirmed
- Forum: the Rent Court (s.34 as numbered in 2018). The Rent Authority's s.31 powers don't include s.17.
- Details: `production/30s/2026-11-11-english-12/notes/LEGAL-SOURCES.md`.

### Creative decisions (per the 11 Nov rules)
- A new engine:
  - one visual idea per beat; large labels of 1–3 words
  - depth and lighting: full-width hallway, warm light spill, day/night contrast
  - push-through and scale crossfades
  - captions centred at x=500 (max 800); a thumbnail render mode
- Beats:
  - key turns and the door opens (hook)
  - shadow over the tenant (escalation)
  - TAMIL NADU stamp
  - three reasons, one by one
  - notice + 24 h ring
  - why/day/time + 7–8 dial
  - day/night contrast
  - Rent Court
  - CTA
- The hook words, thumbnail words and spoken hook are all "Their house. Your home?".

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-11-english-12/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st12 <times>
node render.cjs thumb .. courtlens-30s-english12-01-thumbnail.png
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build12 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english12-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english12-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The hallway wall and floor were partial panels with hard edges; they are now full-width gradients with a vignette.
- The thumbnail's key floated beside a barely open door; the door is now half-open with warm light and a large
  foreground key.
- The "Agreed reason" label was shrinking; it now has more width.
- Frame review of the first full render: the push-through zoom crossed the caption/chip, and the room panel had hard
  edges. Both were fixed and the episode was re-rendered in full. The superseded render was not committed.

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −15.9 LUFS / −2.5 dBTP.
- Narration 8/8 at +3 ms; CTA 26.95–29.90 s (final 3.05 s); y<300 clear.
- 10 captions, ≤2 lines, centred inside x 100..900.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Not performed: an actual listen-through or real-time watch.
- Details: `production/30s/2026-11-11-english-12/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen and watch is recommended.
- The commencement of TN Act 19 of 2022 (electronic notice) is unconfirmed.
- Official TN hosts were unreachable (Gazette reproduction used).

### Next
Await review. No further episode or automation unless asked.

## Round 2026-11-09 (english-11): English episode 11, can a landlord cut the power to force you out? (Tamil Nadu)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync, clean; english-10
  delivered at ff5f4d7), assigned account info@tensorblue.com. No earlier job pending. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-09-english-11/courtlens-30s-english11-01.mp4`
  (sha256 b3fe05b18d28157b8068a7eb2d30dbf6fc55992299905f6cc49d5b5f61e8a588).
- Episode record: `context/episodes/2026-11-09-english11-landlord-power-cut-tn.md`.

### Verified facts
- Jurisdiction: Tamil Nadu. TN Act 42 of 2017 (Gazette copy, amendments to 2022):
  - s.20(1): no landlord shall cut off or withhold essential supply or service; the Explanation includes electricity
  - s.20(2): the Rent Authority may order interim restoration immediately, pending inquiry
  - s.20(3): inquiry within one month
  - s.20(4): penalty up to ₹5,000 (Act 39 of 2018)
  - s.21: eviction only by a Rent Court order on listed grounds
- Maharashtra (Rent Control Act 1999 s.29) was considered, but no official text was reachable.
- Details: `production/30s/2026-11-09-english-11/notes/LEGAL-SOURCES.md`.

### Checkpoint
- Official TN hosts unreachable; the PRS Gazette reproduction was used. No post-2022 amendment found.

### Creative decisions
- Performer: an apartment block with a meter. The breaker swings OFF and Flat 3B flickers dark (hook by 1.35 s). In
  the split, the same flat relights when the Rent Authority restores power.
- Other changes:
  - "LANDLORD · 'Vacate this week'" sign
  - tag flips "Power off to evict?" → "Court order only"
  - rule card with chips: electricity / water / lifts
  - split: Rent Court vs Rent Authority, with "penalty ≤ ₹5,000" and an "Inquiry: 1 month" sticker
  - envelope with rent receipt + dated meter photo, written "TN Rent Authority"

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-09-english-11/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st11 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build11 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english11-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english11-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- On the rent receipt, "November" ran into "₹18,000", so the labels are now "Oct rent" / "Nov rent".

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −15.9 LUFS / −2.4 dBTP. It was −14.5 at first; the gain went from 7.5 to 6.0 dB and the audio was
  re-muxed onto the same frames.
- Narration 7/7 at +3 ms; CTA final 3.73 s; y<300 clear; 11 captions, ≤2 lines.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Interruption: a worker restart killed the first render at 592/900 frames; it was re-rendered in full.
- Details: `production/30s/2026-11-09-english-11/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen is recommended.
- The official TN hosts were unreachable (Gazette reproduction used).

### Next
Delivered. The next request is english-12 (landlord entry), the first episode under
`context/09-feedback-rules-2026-11-11.md`.

## Round 2026-11-09 (english-10): English episode 10, no phone number, no bill?

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync), assigned account
  info@tensorblue.com.
- Earlier accepted jobs were finished in order first: english-08 (187508a) and english-09 (2244205) were delivered
  and attached. The repeated english-09 request was not duplicated. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-09-english-10/courtlens-30s-english10-01.mp4`
  (sha256 8fe29ca85c95242a0ef6375e15f50c888cc142425c1e347a4c4de57d04187464).
- The english-09 and english-10 requests were re-delivered mid-turn; each was handled once, with no duplicates.
- Episode record: `context/episodes/2026-11-09-english10-phone-number-bill.md`.

### Verified facts
- CPA 2019 (DoCA PDF):
  - s.2(47)(vii): "not issuing bill or cash memo or receipt for the goods sold … in such manner as may be
    prescribed" is an unfair trade practice
  - (ix): disclosing personal information given in confidence
- GST tax invoice particulars (CBIC Invoice Rules page): no phone field; recipient name and address only for
  unregistered recipients at ₹50,000 or more.
- NCH 1915 (Lok Sabha USQ 4041, 12.08.2026).
- Details: `production/30s/2026-11-09-english-10/notes/LEGAL-SOURCES.md`.

### Checkpoint (secondary only, not narrated)
- The DoCA advisory of May 2023 on mobile numbers is reported in the news, but its text was not found on PIB or DoCA.
  It is kept as context only. The IT Act "offence" claims in some reports were not used.
- taxinformation.cbic.gov.in failed TLS verification (not bypassed); the cbic-gst.gov.in invoice-rules page was used.

### Creative decisions
- Performer: a POS terminal; the receipt prints, then stops half-out with a red ✕, and the screen shows "Mobile no.
  required" (hook by 1.35 s).
- Other changes:
  - "CASHIER · 'Number first'" sign
  - tag flips "No number, no bill?" → "Bill anyway"
  - rule card with two chips ("bill is due", "invoice: no phone field")
  - split: bill vs loyalty/e-bill, with a rewards phone and a "Skip is fine" sticker
  - envelope: printed bill with "Mobile —" plus the NCH 1915 slip, written "Keep the bill"
- "GST" was heard as "GSD", so the TTS input uses "G S T" (as in episode 06).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-09-english-10/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st10 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build10 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english10-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english10-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The POS screen's "required" sat on the screen border; it is now one line, "Mobile no. required", above the input.
- The NCH slip was visible for only about 0.3 s before the envelope closed. The flap, label and seal moved to
  24.85 / 25.05 / 25.30 s, after "call 1915".

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.0 LUFS / −2.3 dBTP. It was −17.3 at first; the gain went from 6.2 to 7.5 dB and the audio was
  re-muxed onto the same frames.
- Narration 7/7 at +3 ms; CTA final 3.85 s; y<300 clear; 10 captions, ≤2 lines, in y 340–520.
- English ASR on the final mix: WER 0.014 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Details: `production/30s/2026-11-09-english-10/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen is recommended.
- The 2023 DoCA mobile-number advisory text is unverified (news-only).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review. No further episode or automation unless asked.

## Round 2026-11-08 (english-09): English episode 09, can a hotel keep your original Aadhaar?

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync), assigned account
  info@tensorblue.com.
- Older work finished first: english-08's render had been killed by a worker restart (596/900 frames). It was
  re-rendered in full, QA'd, pushed (187508a) and attached before any english-09 edits. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-08-english-09/courtlens-30s-english09-01.mp4`
  (sha256 0988a85a9eb70822b47316e41f377f5ff4347ca57917ab0f6bd3e669124dff33).
- The same english-09 request arrived again mid-turn; it was treated as this one episode, not duplicated.
- Episode record: `context/episodes/2026-11-08-english09-hotel-aadhaar.md`.

### Verified facts
- UIDAI Aadhaar (Authentication and Offline Verification) Regulations, 2021 (clean copy updated 15.12.2025):
  - 2(1)(mb): any entity wanting offline verification is an OVSE
  - 5(3): no denial of service if you identify through a viable alternative
  - 6: consent
  - 14A(1)(b): an OVSE shall not collect, use or store the Aadhaar number except per the Act/regs
  - 16B/16C: verification through the secure QR code
  - 20A: logs, but never the Aadhaar number
  - 2(1)(mc) and 14(1)(mb): masking (first 8 digits)
- PIB, 10 Jan 2023 (UIDAI guideline to OVSEs): don't store the number; any copy masked and irretrievable; QR
  verification; alternative ID.
- Not used: the PIB release of 27 May 2022 claiming an "offence". The underlying release was withdrawn by MeitY on
  29 May 2022 (PIB 1829162).
- Details: `production/30s/2026-11-08-english-09/notes/LEGAL-SOURCES.md`.

### Creative decisions
- Performer: a generic ID card labelled "AADHAAR" (no emblem or official layout; number shown as dots) hops into a
  front-desk DEPOSIT box and the padlock snaps shut (hook by 1.45 s).
- Other changes:
  - check-in card; "Card stays here" sign; tag flips "Leave your card?" → "Scan & return"
  - UIDAI rule card with three short chips
  - show vs leave split with a "QR scanned" sticker
  - hotel-record envelope with a masked copy (XXXX XXXX 4821) and a QR-verified phone
- "UIDAI" can't be voiced cleanly ("U of I", "UID AI", or a sentence break with full stops), so the narration says
  "Aadhaar's own rules" and the screen shows UIDAI.

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-08-english-09/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st9 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build9 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english09-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english09-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The third rule chip overflowed the card edge, so the labels were shortened to "scan the QR / no storing / mask
  copies".
- "Room 204 · 1 night" crowded the price, so the title is now "Room 204" with the subtitle "1 night · check-out 11:00".

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −15.6 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.74 s; y<300 clear; 12 captions, ≤2 lines, in y 340–520.
- English ASR on the final mix: WER 0.012 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Details: `production/30s/2026-11-08-english-09/qa/QA.md`.

### Unresolved
- ASR-only listening; a human listen is recommended.
- UIDAI hosts were intermittently unreachable (503 / reset). The masked-Aadhaar FAQ wording was read from the search
  index; the regulations PDF was downloaded and hashed.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Delivered. Next queued request: english-10 (phone number for a bill).

## Round 2026-11-07 (english-08): English episode 08, train 3+ hours late (full fare via TDR)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync, clean; english-07
  delivered at 99c85ca), assigned account info@tensorblue.com. No older job running. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-07-english-08/courtlens-30s-english08-01.mp4`
  (sha256 2cd33c985432adf8f64a678df308691a3a87597de8e9e0807ee20759a4ce7ef9).
- Topic: the suggested "changed my mind vs defective" e-commerce returns subject duplicates Episode 01, so a fresh
  subject was chosen (episode record: `context/episodes/2026-11-07-english08-train-late-tdr.md`).

### Verified facts
- IRCTC Refund Rules and TDR Filing (PDF generated 19 Jan 2026; based on the 2015 Refund Rules):
  - clause 6: train more than 3 h late and passenger not travelling means full fare, no cancellation charge or
    clerkage; e-ticket TDR must be filed online before the actual departure
  - note (5) and TDR table row 2 restate this
  - clause 1(d): no refund on a confirmed ticket cancelled within 4 h of scheduled departure (8 h for VB Sleeper /
    Amrit Bharat II)
- Details: `production/30s/2026-11-07-english-08/notes/LEGAL-SOURCES.md`.

### Checkpoint (unconfirmed)
- News reports say the 8-hour no-refund cut-off was extended to all trains in April 2026. The official Railway Board
  2026 circulars returned 404 here. No report says clause 6 changed. The narration ("an hour before departure, that
  can return nothing") is true under either cut-off.
- Considered and not used: the DGCA 48-hour flight "look-in" rule (CAR issued 24 Feb 2026, effective 26 Mar 2026).
  The official DGCA PDF could not be retrieved; recorded for a future episode.

### Creative decisions
- Performer: a departure board with a split-flap status that scrambles in the first second and settles on "LATE 4H
  10M" (hook at 0.85–1.55 s).
- Other changes:
  - e-ticket card; "Cancel now? Refund: ₹0" sign
  - tag flips from "₹1,450 gone?" to "Full fare back"
  - rule card with two chips
  - split: TDR "₹1,450 back" vs press-cancel "refund ₹0", with a phone and sticker
  - envelope with e-ticket + running-status screenshot, written "TDR · train late"
- Plain "TDR" in the TTS input. "T.D.R." made the voice end the sentence (an awkward 1 s break). l6 was reworded to
  "Instead, file a TDR online for the late train, before it actually leaves."

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-07-english-08/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st8 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build8 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english08-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english08-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Fixed before the full render (stills review)
- The board's "18:00" overlapped "EXPRESS · 3A", so the board now shows "EXPRESS" (class is on the ticket) at a
  smaller size.
- The rule card's first line now reveals at 7.95 s, right after "rules say:", instead of 8.55 s.
- The ticket line "now 22:10" read like the current time; it is now "expected 22:10".

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.4 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.76 s; y<300 clear; 11 captions, ≤2 lines, in y 340–520.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Details: `production/30s/2026-11-07-english-08/qa/QA.md`.
- Interruption: a worker restart killed the first render at 596/900 frames. It was re-rendered cleanly in full
  (deterministic frames) before QA.

### Unresolved
- ASR-only listening; a human listen is recommended.
- The April 2026 slab change is a checkpoint (see above).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Delivered. The next request (english-09) follows.

## Round 2026-11-06 (english-07): English episode 07, ATM debited but no cash (RBI failed-transaction rules)

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync, clean; english-06
  delivered at ffe0f5c), assigned account info@tensorblue.com. No active jobs. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-06-english-07/courtlens-30s-english07-01.mp4`
  (sha256 f89efc47f2468e44e319d8b7f91d5456f76acb3e653626b8aa805e6434d7cab4).
- Topic: the suggested "above printed MRP" subject duplicates Episode 02, so a fresh subject was chosen (episode
  record: `context/episodes/2026-11-06-english07-failed-atm.md`).

### Verified facts
- RBI DPSS.CO.PD No.629/02.01.014/2019-20 (20 Sep 2019):
  - for an ATM debit with no cash, the reversal is due within T+5 days
  - after that, ₹100 per day of delay goes to the account holder
  - compensation is credited suo moto, without a claim
- The circular is not in RBI's withdrawn-circular lists (checked 2026-11-06, including the 28 Nov 2025 consolidation).
  The RBI ATM FAQ (updated 4 Jul 2025, Q20–Q21) restates the rule and puts the payment on the card-issuing bank.
- RB-IOS 2026 is in force from 1 Jul 2026 and replaces RB-IOS 2021:
  - approach the bank first
  - go to the Ombudsman after no reply in 30 days, or after an unsatisfactory reply, within 90 days
  - complaints at cms.rbi.org.in
- Details: `production/30s/2026-11-06-english-07/notes/LEGAL-SOURCES.md`.

### Creative decisions
- Performer: an ATM whose screen fails while the cash tray slides out empty (hook at 1.75 s).
- Other changes:
  - alert card: balance ₹12,450 → ₹10,450
  - "Under review" helpline sign; tag flips from "₹2,000 lost?" to "Back in 5 days"
  - RBI rule card with three chips
  - on-time vs 3-days-late split: one "+₹100" chip per late day, "+ ₹300 extra"
  - ATM slip + SMS evidence; envelope written "cms.rbi.org.in"
- No status stamp (no litigation).
- Plain "RBI" in the TTS input is voiced letter by letter and recognised correctly.
- l3 and l6 were shortened so the CTA has the final 3.74 s.

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-06-english-07/src
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st7 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build7 PYTHONDONTWRITEBYTECODE=1 ./build.sh
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python qa.py ../courtlens-30s-english07-01.mp4 timeline.json ../audio/lines ../qa
PYTHONDONTWRITEBYTECODE=1 $S/tts/venv/bin/python asr_check.py ../courtlens-30s-english07-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −15.9 LUFS / −2.3 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.74 s; y<300 clear; 12 captions, ≤2 lines, in y 340–520.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Details: `production/30s/2026-11-06-english-07/qa/QA.md`.

### Fixed
- Stills review: the ATM slip label is now "Amount"; the bubble now reads "Not my bank" instead of duplicating
  the header.
- After the full render: −14.4 LUFS, so the gain went from 7.8 to 6.2 dB. Audio was re-muxed with SKIP_FRAMES=1,
  giving −15.9 LUFS. QA was re-run.

### Unresolved
- ASR-only listening; a human listen is recommended.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review. No further episode or automation unless asked.

## Round 2026-11-06 (english-06): English episode 06, restaurant service charge vs tip vs GST

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync with origin),
  assigned account info@tensorblue.com. No active jobs; Kokoro/whisper caches intact. Earlier MP4s untouched.
- DELIVERED: `production/30s/2026-11-06-english-06/courtlens-30s-english06-01.mp4`
  (sha256 b8c88442376ac02c14867226f279f67c6ae20b425a5c9940dc679ba5e8f50aea).
- Episode record (brief, script, citations, approved style notes): `context/episodes/2026-11-06-english06-service-charge.md`.

### Verified facts
- CCPA guidelines on service charge, 4 Jul 2022 (official PDF):
  - para 7: no adding by default, no other name, no forcing, no entry restriction, no GST on a service-charge total
  - para 9: ask for removal, NCH 1915, Consumer Commission/e-Daakhil, District Collector
- Delhi High Court, 28 Mar 2025 (W.P.(C) 10683/2022 and 10867/2022):
  - guidelines upheld; petitions dismissed with ₹1 lakh costs each
  - para 174(iii): service charge/tip is voluntary
- What applies today: CCPA enforcement continued in 2026 (27 restaurants on 10 Jan; LPG-charge advisory on 25 Mar;
  41 restaurants on 19 Jul).
- GST: standalone restaurants 5% without ITC (GST Council note); unchanged by the 56th Council FAQs.
- Details: `production/30s/2026-11-06-english-06/notes/LEGAL-SOURCES.md`.

### Checkpoint (unconfirmed)
- NRAI/FHRAI Division Bench appeal: filed about Apr 2025, heard May and Aug 2025 per news reports. No ruling or stay
  found as of 2026-11-05. The court site is unreachable from this environment. The narration says only "upheld … in
  2025".

### Creative decisions
- English narration and captions only. The approved English voice (af_bella 0.7 + am_puck 0.3, en-us, 0.98) was
  freshly synthesised.
- "C.C.P.A." is spelled with full stops so all four letters are voiced; "C C P A" was heard as "CCP".
- Changes from the accepted renderer (feedback-05 copy):
  - performer: a plate onto which a "+10%" table card hops
  - bill total jumps ₹1,050 → ₹1,155
  - "Upheld · Delhi HC, 2025" stamp on the rule card
  - tip/service charge vs GST split
  - bill + payment slip evidence
- English caption treatment from round-02 (Inter only; marker offsets 0.74/0.92). Devanagari fonts were removed
  from this round's src.

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-06-english-06/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python align.py ../audio/lines narration.json $S/asr
node render.cjs stills $S/st6 <times>
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build6 ./build.sh
$S/tts/venv/bin/python qa.py ../courtlens-30s-english06-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python asr_check.py ../courtlens-30s-english06-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean.
- Loudness −16.0 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.43 s; y<300 clear; 12 captions, ≤2 lines, in y 340–520.
- English ASR on the final mix: WER 0.013 (the only miss is the ASR spelling "Courtlands"); all words fall in
  caption windows.
- Details: `production/30s/2026-11-06-english-06/qa/QA.md`.

### Fixed
- Before the full render: the "Upheld" stamp overlapped "Hotels & restaurants", so it was moved right and shrunk.
  The rule card's second line and chips now reveal earlier (6.30 / 8.40), so the card is no longer half-empty.
- After the full render: −16.9 LUFS, so the gain went from 6.8 to 7.8 dB in build.sh. Audio was re-muxed with
  SKIP_FRAMES=1, giving −16.0 LUFS. QA was re-run.

### Unresolved
- ASR-only listening; a human listen is recommended.
- The Division Bench appeal status is unconfirmed (see Checkpoint).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review. No further episode or automation unless asked.

## Round 2026-11-05 (feedback-05): Hindi episode 05, basket sneaking at an online checkout

### Status
- Confirmed before edits: repo cumbersomeamir/animations, branch claude-video/courtlens (in sync), assigned account
  info@tensorblue.com. No active jobs; caches intact.
- DELIVERED: `production/30s/2026-11-05-feedback-05/courtlens-30s-feedback05-01.mp4`
  (sha256 21365cadb22eb7568e7968319a800478ea77e649ed047752738f419b2e2d7ea4). Earlier MP4s untouched.
- Episode record (sheet feedback, script, citations, approved style notes): `context/episodes/2026-11-05-feedback05-basket-sneaking.md`.

### Verified facts
- CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023 (30 Nov 2023; CPA 2019 s.18), official DoCA PDF:
  - Clause 4: no person, including any platform, shall engage in any dark pattern
  - Annexure 1(2): basket sneaking means adding items or donations at checkout without consent so the total rises;
    free samples, complimentary services and disclosed necessary fees are excluded
- NCH contact re-checked 2026-11-05.
- Details: `production/30s/2026-11-05-feedback-05/notes/LEGAL-SOURCES.md`.

### Creative decisions
- The performance snapshot (1546 plays / 52 likes / median 133) is treated as a controlled topic and opening test.
  Only change: the problem is shown on the object within 2 s.
- Accepted renderer, Hindi voice, font, caption band and audio kept, via the hindi-04 copy. Changes:
  - performer: a shopping cart, into which a ₹49 donation parcel sneaks
  - checkout card whose total jumps
  - CCPA rule card
  - sneaked vs opted-in split
  - receipt + screenshot evidence
- The publishing caption matches the final transcript and uses only "Courtlens".

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-05-feedback-05/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python -I align.py ../audio/lines narration.json $S/asr
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build5 ./build.sh
$S/tts/venv/bin/python qa.py ../courtlens-30s-feedback05-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python -I asr_check.py ../courtlens-30s-feedback05-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean; −15.9 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.38 s; y<300 clear; captions ≤2 lines in y 340–520.
- Hindi ASR on the final mix: CER 0.079, all words in caption windows. One full render; one layout defect fixed before it.

### Unresolved
- ASR-only listening; a native-speaker listen is recommended.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review. No further episode or automation unless asked.

## Round 2026-11-04 (hindi-04): Hindi episode 04, shop bill says "रिफ़ंड नहीं" on a defective product

### Status
- No generation active at start (clean tree, no jobs, remote not ahead). Caches intact.
- DELIVERED: `production/30s/2026-11-04-hindi-04/courtlens-30s-hindi04-01.mp4`
  (sha256 3e2b194f1725f8c0165d1ce7ca4ebc3c3f92cfcfac9bcd1860bf203054ac4f57). Earlier MP4s untouched.
- Episode record (topic-overlap decision vs episode 01, Hindi script, citations, reusable Hindi adjustments):
  `context/episodes/2026-11-04-hindi-bill-no-refund.md`.

### Verified facts (details: production/30s/2026-11-04-hindi-04/notes/LEGAL-SOURCES.md)
- Consumer Protection Act 2019 (official DoCA PDF):
  - s.2(47)(viii): refusing to take back defective goods and refund, within the bill's stated period or else 30
    days, is an unfair trade practice
  - s.2(10) defect
  - s.35 complaint
  - s.39(1)(a)–(c) repair, replacement, refund
- Change of mind: no statutory right; shop policy decides.
- NCH contact re-checked 2026-11-04 (1915 / 1800-11-4000).
- DoCA (consumeraffairs.gov.in) also hosts the official E-Commerce Rules 2020 and E-Commerce Amendment Rules 2026 PDFs.
  These could close episode-01 checkpoints A/B if a revision is ever requested (not done; out of scope).

### Creative decisions
- Topic kept despite overlap with episode 01: different setting (physical shop vs online), different provision
  (CPA s.2(47)(viii) vs E-Commerce Rules), new lesson (bill period / 30 days; bill as evidence), Hindi audience.
- Same accepted engine, Hindi voice, font, caption band and pacing as hindi-03. Changes:
  - performer: a leaking kettle
  - shop-bill card with the "रिफ़ंड नहीं · बिका माल वापस नहीं होगा" clause
  - shopkeeper's sign
  - CPA rule card with two time-window chips
  - defective vs change-of-mind split, with the shop's sign as a sticker on the change-of-mind side
  - bill + leak photo in the envelope, then the CTA

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-04-hindi-04/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python -I align.py ../audio/lines narration.json $S/asr
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build4 ./build.sh
$S/tts/venv/bin/python qa.py ../courtlens-30s-hindi04-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python -I asr_check.py ../courtlens-30s-hindi04-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean; −15.8 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.25 s; y<300 clear; captions ≤2 lines in y 340–520.
- Hindi ASR on the final mix: CER 0.063, every word recognised, all inside caption windows.
- One full render. Two wording defects were fixed before it (see `qa/QA.md`).

### Unresolved / checkpoints
- ASR-only listening: no direct audio listening in this environment; a native-speaker listen is recommended.
- Ernakulam order (secondary) and e-Daakhil URL not used on screen; see LEGAL-SOURCES.md.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-hindi04-01.mp4. No further episode or automation unless asked.

## Round 2026-11-03 (hindi-03): Hindi episode 03, recording a call you are part of

### Status
- No generation was active at start (clean tree, no jobs, remote not ahead).
- The session's worker restarted mid-round and the user's usage limit was hit once. All state was intact in the repo
  and scratchpad (Hindi lines, word times, cached models). Work resumed without duplicate generation.
- DELIVERED: `production/30s/2026-11-03-hindi-03/courtlens-30s-hindi03-01.mp4`
  (sha256 5035fbf9220c0246d9fbe06456eab891cce0ea8accceeed224ffac39f2949e37). Earlier MP4s untouched.
- Episode record (topic check, Hindi script, citations, user corrections): `context/episodes/2026-11-03-hindi-call-recording.md`.

### Verified facts (details: production/30s/2026-11-03-hindi-03/notes/LEGAL-SOURCES.md)
- Vibhor Garg v. Neha, 2025 INSC 829 (SC, 14 Jul 2025), para 9.5, official PDF: three-fold test (relevance,
  identification, accuracy); recording without consent or knowledge doesn't bar admissibility.
- R.M. Malkani (1973), official PDF.
- R. Rajagopal (1994) para 26(1), publishing private matters without consent can bring damages (via Indian Kanoon).
- Narrowed claim: no blanket legal/illegal answer. Evidence and posting are treated separately.

### Creative decisions
- **Language:** all narration and captions in Hindi (Devanagari); on-screen labels Hindi; "Courtlens" in Latin only on
  the icon CTA card.
- **Voice:** Kokoro v1.0 native Hindi voices hf_alpha 0.7 + hm_psi 0.3 (keeps the accepted 0.7/0.3 female-lead
  character), lang hi, speed 1.05 (Hindi pace; tested for clarity). English voices not used for Hindi.
- **Glyphs:** Noto Sans Devanagari 5.3.0 (OFL, npm @fontsource) as Devanagari fallback; no letter-spacing on Hindi.
- **Engine:** the accepted engine reused via the round-02 copy. Changes:
  - phone performer
  - call card with the landlord's quote
  - landlord's sign
  - SC rule card with three chips
  - evidence vs posting split
  - audio file + call log in the envelope
  - Hindi action card and CTA
- **New tools:** `src/align.py` (word times + ASR per line) and `src/asr_check.py` (ASR on the final mix + caption alignment).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-03-hindi-03/src
$S/tts/venv/bin/pip install faster-whisper            # local ASR, model 'medium' cached in $S/asr
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python -I align.py ../audio/lines narration.json $S/asr
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build3 ./build.sh          # SKIP_FRAMES=1 re-muxes audio only
$S/tts/venv/bin/python qa.py ../courtlens-30s-hindi03-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python -I asr_check.py ../courtlens-30s-hindi03-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean; −15.9 LUFS / −2.5 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.33 s; y<300 clear; captions ≤2 lines in y 340–520.
- Hindi ASR on the final mix: CER 0.097, every word recognised, all words inside caption windows. Glyphs verified at
  full resolution. Six defects fixed (see `qa/QA.md`).

### Unresolved / checkpoints
- A: R. Rajagopal official PDF (digiscr.sci.gov.in) returned 502; text read via Indian Kanoon.
- B: BSA 2023 s.63 (electronic records) not verified from India Code; not used in the video.
- The ASR proxy can't judge accent naturalness; a native-speaker listen is recommended before posting.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-hindi03-01.mp4. No further episode or automation unless asked.

## Round 2026-11-03 (round-02): "Is this legal in India?" episode 02, MRP on a packaged water bottle

### Status
- No generation was active at start (clean tree, no running jobs, remote not ahead); nothing to checkpoint.
- DELIVERED: `production/30s/2026-11-03-round-02/courtlens-30s-round02-01.mp4`
  (sha256 f12d786e3a8824a87d788891dee6e0e0a697b5ed4f0c47d7f860fb59583291bb). Earlier MP4s untouched.
- Episode record (topic-history check, script, citations, sheet feedback applied):
  `context/episodes/2026-11-03-mrp-packaged-water.md`.

### Verified facts (details: production/30s/2026-11-03-round-02/notes/LEGAL-SOURCES.md)
- Legal Metrology (Packaged Commodities) Rules, 2011:
  - Rule 18(2), read in the Gazette scan from consumeraffairs.gov.in.
  - Rule 2(m), MRP inclusive of all taxes (G.S.R. 629(E), 2017).
  - Rule 6(1)(e), MRP must be printed (as amended 2017/2021).
  - No amendment through G.S.R. 826(E) of 21 Sep 2026 changes these rules.
- Supreme Court, CA 21790/2017, 12 Dec 2017, para 17 (hotels/restaurants: a different case). NCH contact page:
  1915 / 1800-11-4000, WhatsApp 8800001915.
- consumeraffairs.gov.in (new DoCA domain) and api.sci.gov.in are reachable from the container. `*.nic.in` and the
  NCH FAQ page are not.

### Creative decisions (sheet feedback: Satisfied = Yes)
- Reused the accepted feedback-01 renderer, palette, captions, voice, pacing, motion and CTA unchanged. Copied
  `src/` and swapped only episode performers and copy. `08-series-format.md` is not rewritten.
- Script: 74 words, 27.01 s speech; "1 9 1 5" is spelled as digits for correct reading.
- Audio: same pad voicings and SFX palette; chord changes now follow the episode's scene events (`CHORD_EVENTS`).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-03-round-02/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build2 ./build.sh          # SKIP_FRAMES=1 re-muxes audio only
$S/tts/venv/bin/python qa.py ../courtlens-30s-round02-01.mp4 timeline.json ../audio/lines ../qa
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −15.9 LUFS / −2.0 dBTP; narration 7/7 lines at +3 ms; CTA final 3.38 s; y<300 clear; captions ≤2 lines in y 340–520.
- Fixed: bottle scale (stills re-checked); true peak −1.2 → −2.0 dBTP (audio re-mux). See `qa/QA.md`.

### Unresolved / checkpoints
- A: NCH Legal Metrology FAQ wording seen only via search snippet (page returns 403 to the container).
- B: no national circular specifically on "cooling charges"; "chilled or not" rests on the Rule 18(2) text.
- Episode-01 checkpoint B can now be re-checked: DoCA hosts the E-Commerce Amendment Rules 2026 PDF on
  consumeraffairs.gov.in (not done in this round; outside its scope).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-round02-01.mp4. No further episode or automation unless asked.

## Round 2026-11-02 (feedback round): "Is this legal in India?" no refunds vs defective item

### Verified facts
- App identity and branch: Courtlens, courtlens.tensorblue.app, branch `claude-video/courtlens`, account info@tensorblue.com.
- Product evidence (`assets/listing.json`): "Court records, case tracking and an AI assistant for advocates."
  Free, Android, rated 12+. No other product claims are used.
- Brand palette sampled from `assets/icon.png` (2026-11-02): navy #02193B, cyan accent #12AAD3, gold #D7A351,
  ivory #F0E9DD (details in `08-series-format.md` §3).
- Legal research for the 2026-11-02 episode: see
  `production/30s/2026-11-02-feedback-round/notes/LEGAL-SOURCES.md`. Key provisions: E-Commerce Rules 2020
  Rule 6(3) and Rule 7(4) (Gazette text read); 2026 amendment (G.S.R. 789(E)) in force 1 Jan 2027, refund duties reportedly unchanged.

### Creative decisions
- 2026-11-02: durable series format, style recipe "Tiny Clause, Big Consequence", approved voice, palette and
  safe-caption rules stored in `context/08-series-format.md`; episode brief in
  `context/episodes/2026-11-02-no-refunds-defective.md`. 02/04 marked as superseded where they conflict.
- Narration: user draft used verbatim (fits 30 s: 26.75 s speech). The longer "can't refuse to take back or refund"
  wording would overflow 30 s, so that exact rule text is shown on the rule card instead.
- Layout: captions y 340–520; series chip y≈560; stage y≈560–1460; nothing enters the caption band or y<300,
  including mid-transition (banner exits sideways; mug emerges from behind the order card; action card rises from below).
- Rendering: original Canvas 2D scene (`src/scene.js`) drawn in pre-installed headless Chromium via Playwright,
  frame-exact (t = frame/30), encoded with ffmpeg. No Blender, no paid API.
- Audio: Kokoro v1.0 ONNX, af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. Original synthesized pad + SFX, no loops,
  music ducked about 15 dB under voice, final about −16 LUFS / ≤ −1.5 dBTP.

### Completed (2026-11-02 feedback round)
- Episode "Can an online seller use 'NO REFUNDS' to refuse a defective item?" (INDIA): ONE new English 30 s video.
- Output: `videos/courtlens/production/30s/2026-11-02-feedback-round/courtlens-30s-feedback-01.mp4`
- Sources: `.../src/` (scene.js, index.html, render.cjs, timeline.json, narration.json, tts.py, audio_mix.py, build.sh, qa.py, fonts/, icon.png)
- Narration stems: `.../audio/lines/l1..l7.wav` + `line_durations.json`
- Notes: `.../notes/LEGAL-SOURCES.md`, `PUBLISHING.md`, `STORYBOARD.md`; QA: `.../qa/` (QA.md, qa_report.json, sheets)

### Exact commands
```bash
# one-time: TTS runtime (scratch venv) + Kokoro v1.0 model files
python3 -m venv $S/tts/venv && $S/tts/venv/bin/pip install kokoro-onnx soundfile
curl -sSL -o $S/tts/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSL -o $S/tts/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
# sha256: kokoro-v1.0.onnx 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5
#         voices-v1.0.bin  bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
# full build (TTS → mix → loudness → 900 frames → H.264/AAC)
cd videos/courtlens/production/30s/2026-11-02-feedback-round/src
KOKORO_DIR=$S/tts PY=$S/tts/venv/bin/python WORK=$S/build ./build.sh      # SKIP_TTS=1 reuses audio/lines
# stills for inspection
node render.cjs stills $S/stills 0,2.5,6.1,13.35,15.5,22,26.6,29.9
# QA
$S/tts/venv/bin/python qa.py ../courtlens-30s-feedback-01.mp4 timeline.json ../audio/lines ../qa
```

### Verification (final render, 2026-11-02)
- `courtlens-30s-feedback-01.mp4` sha256 8df8a15e524a71b22a7c648948e428f299e2525710b62558b108f590f42bad08, 18.6 MB.
- 30.000000 s format/video/audio; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo.
- Full FFmpeg decode: exit 0, no errors. Loudness −15.9 LUFS, true peak −2.0 dBFS.
- Narration: all 7 lines measured at planned start +3 ms (cross-correlation); CTA occupies final 3.38 s.
- y<300 clear on 180 sampled frames; captions ≤2 lines, non-overlapping, in y 340–520.
- Visual review of the contact sheet, transition frames and targeted stills: 8 defects found and fixed, then re-rendered
  (list in `qa/QA.md`). Render time is about 9 min for 900 frames on 4 workers.

### Unresolved / checkpoints
- Carried over from the 2026-11-01 round (not part of this request, left untouched): the earlier 30 s film's QA.md is still marked pending below.
- A: `*.nic.in` (Department of Consumer Affairs, India Code) and eGazette were unreachable from the build container;
  the E-Commerce Rules text was read from the Gazette PDF reproduced by LiveLaw. Re-check against the DoCA copy.
- B: 2026 Amendment Rules (G.S.R. 789(E)) official Gazette text not read directly; PIB + two clause-by-clause analyses
  say 6(3)/7(4) are untouched. Re-confirm before/after 1 Jan 2027.
- C: CPA 2019 s.2(47)(viii) read via Indian Kanoon only (not used on screen).
- The Meshline/Recall cached voice files were not present in this fresh container (and other app branches are off-limits);
  identical public Kokoro v1.0 files were downloaded with the user-specified blend parameters.
- The user's local Desktop/video-review folder is not reachable from this cloud session; the finished MP4 is
  delivered as a Claude attachment and pushed to the branch.

### Next
Await user review of courtlens-30s-feedback-01.mp4. Do not start another episode or automation unless asked.

## Round 2026-11-01: Courtlens 30 s production video (preserved from the earlier chat)

### Verified facts (from assets/listing.json + icon.png only)
- Listing line: "Court records, case tracking and an AI assistant for advocates." Android, Business, rated 12+, author Tensorblue AI, Play offer price 0 INR.
- Icon: navy tile, ivory courthouse, gold disc, cyan chat bubble with gold sparkle. Hashes match 03-assets.json.
- Unknowns kept unknown: pricing beyond listing, metrics, endorsements, real UI screens (none approved → all UI drawn as labelled illustration).

### Creative decisions
- Editorial paper-cutout world + original stick-figure advocate (black coat, white bands). Story: file slam → paper mountain collapses → paper maze → Courtlens lens collects walls into the phone → cards become a case trail → AI assistant answer verified against an official record with a magnifier → navy end card + "Explore on Google Play".
- Palette from icon (navy/ivory/gold/cyan) on warm paper; Fraunces + Inter (OFL, pinned via npm @fontsource).
- Narration: local Kokoro-82M v1.0 ONNX (Apache-2.0), voice af_heart; "Courtlens" spoken via "Court lens" spelling. Music + SFX synthesised in numpy (original).
- Storyboard: docs/storyboard.md. SFX cue sheet exported from the same timing constants as the animation (src/scenes.js → build/cues.json).

### Status (2026-11-01)
- RENDERED: output/courtlens-30s.mp4 — H.264 1080x1920 30fps 900 frames, AAC 48 kHz stereo, 30.000 s, loudnorm -14 LUFS; full ffmpeg decode OK.
- Narration ASR check (faster-whisper base.en): all 7 lines recognised (sim 0.80–1.00; lower scores are only "Court Lens" word split).
- Mix: VO 6.4–10.2 dB above music+SFX bed per line after compression/ducking.
- QA PENDING (paused when the 15 s diagram-animation test was requested): full post-mux contact sheet, scene-boundary frame review of the final encode, QA.md write-up.

### Exact commands (from videos/courtlens/project)
- `python3 -m venv .venv && .venv/bin/pip install kokoro-onnx==0.6.1 soundfile faster-whisper==1.2.1 scipy==1.17.0`; `npm ci`
- `./tools/fetch_models.sh` (sha256-verified HuggingFace download)
- `.venv/bin/python audio/narration.py && .venv/bin/python audio/asr_check.py && .venv/bin/python audio/captions.py`
- `node src/render.js cues build/cues.json && .venv/bin/python audio/score.py`
- `node src/render.js video build/video_noaudio.mp4`
- `ffmpeg -i build/video_noaudio.mp4 -i build/audio/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart ../output/courtlens-30s.mp4`

### Next
- Finish 30 s QA.md after the 15 s test is delivered.
- 15 s diagram-animation style test (2026-11-01): see 07-test-progress.md.
