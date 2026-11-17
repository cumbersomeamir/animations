# Production notes — Ideaverse 30s english18-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
Why your own card gets declined on holiday: the card network scores each payment for fraud from hundreds of clues; clues
that look fine alone (new country, new shop, bigger amount) stack past the bank's line; so real payments are sometimes
blocked; payoff: open your bank's app, confirm it was you, then pay again. Record context/33.
Proposed topic (email phishing detection) replaced: it repeats feedback-01 (spam filters).
- Beats: 0–4.75 hook (café counter, terminal DECLINED €24.80, DOCKET puzzled, DECLINED ON HOLIDAY? from frame 0) · 4.75–9.9
  card + clue dots (FRAUD SCORE → HUNDREDS OF CLUES), BANK'S LINE · 9.9–13.6 three clue columns · 13.6–18.35 ✓ each (ALONE:
  FINE) → stacked past the line, DECLINED stamp (TOGETHER: TOO HIGH) · 18.35–21 still declined (FALSE ALARM) · 21–24.3 bank
  alert, "Yes, it was me" → Card unblocked (CONFIRM IT WAS YOU) · 24.3–26.85 APPROVED (PAY AGAIN) · CTA.
- Illustrative: café, terminal, amount, clue icons, bar heights, the line, the bank-alert UI (EXAMPLE; no bank branding).
- Thumbnail: `render.mjs --thumb` (hook scene, camera raised + "DECLINED / ON HOLIDAY?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
