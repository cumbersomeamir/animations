# 24: Production 30s, batch 2026-11-09-english-11 (English): "Why a text gets through when a call won't"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-09-english-11/meshline-30s-english11-01.mp4`, sha256 `13bc1b0b925065d61310751d6bb714ea76a7e5bdaf699f61de8580732e6cac3e`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.1 LUFS, −3.8 dBTP, voice/bed +17.5 to +24.8 dB;
  - ASR WER 0.0 (raw and number-normalised);
  - captions inside y 350–470 and x 90–990.
- Earlier renders are preserved.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`. The assigned account is amir@tensorblue.com; commits use the session's noreply identity.
- **Queue order:** english-09 (`bc87c30`) and english-10 (`d34fb10`) were finished, pushed and attached first; this batch was third.
- **Isolation:** only Meshline files were read; no other app names appear.
- **Language:** English only, with the approved English blend (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).

## Topic swap (history check)
- **Suggested:** "Why mobile networks can fail at a crowded concert even when the signal looks strong". This duplicates **episode 01** (concert capacity), pilot 01 and the 10 s test.
- **Chosen:** the unused planned title "one bar can still send a text", told as "Why a text gets through when a call won't".
- **Kept from the brief:**
  - the overloaded doorway (a busy tower gate a crowd's traffic streams through);
  - "agree a meeting point before the event";
  - a truthful nearby CTA, drawn inside a limited range ring.
- **Not repeated:** 01 (capacity → slow data), 03 (store-and-forward relay route), 08 (sent vs delivered ticks).

## Approved style kept
- The same 2D `@napi-rs/canvas` Transit Map renderer and helpers; new scene `src/text.mjs`.
- One screen-space instrument with three sequential phases:
  - call vs text needs;
  - signal / held / delivered;
  - plan / short text with a character count.
- English captions at 52 px in y 350–470, CTA icon + wordmark, no mascot.

## Final script (80 words)
| id | time (s) | line |
|---|---|---|
| l1 | 0.25–2.85 | Your call won't connect, but a text still gets through? |
| l2 | 3.49–6.83 | A call needs a path held open for every second you talk. |
| l3 | 7.47–11.38 | A text is one tiny burst, up to 160 characters. |
| l4 | 12.02–16.19 | It needs less signal, and the network can hold it, then deliver it in a gap. |
| l5 | 16.83–20.76 | So emergency guides say: to check in, text instead of calling. |
| l6 | 21.40–25.54 | Before a busy event, agree a meeting point, so one short text is enough. |
| l7 | 26.14–29.55 | Download Meshline for nearby messaging, even offline. |

## Sources
See `production/30s/2026-11-09-english-11/research/claims.md`:
- FCC/FEMA disaster tips (DOC-309723A1);
- FCC 14-6 (SMS needs much lower signal levels; often transmitted during congestion);
- 3GPP TS 23.040 (store-and-forward service centre; 140 octets), TS 23.038 (160 characters) and TS 23.203 (conversational voice on a reserved-bitrate bearer);
- the Meshline listing.

Ready.gov / FEMA meeting-place pages returned 403 to automated fetches; the meeting-point line is used as planning advice only.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–3.4 | Hook | Whole map: the call fails ("call ✕"); a text slips through a gap in the crowd's traffic ("text ✓", "sent"). Cartouche "Call vs text / what each one needs". |
| 3.4–7.3 | Call | Faint full-route band ("held open"); the blue call band inks to the doorway and is blocked (✕, "busy doorway"). The instrument bar fills: "held open the whole call". |
| 7.3–11.9 | Text | Close-up: one envelope, "one burst", "up to 160 / characters"; the instrument shows a tiny block. |
| 11.9–16.6 | Gap | Phone drops to 1 bar ("1 bar is enough"); the envelope waits at the doorway with a clock ring ("held"), then slips through a gap ("slips through a gap") to the friend ("delivered"). |
| 16.6–21.2 | Guides | Printed callout "EMERGENCY GUIDES / to check in, / text instead / of calling"; another text slips through. |
| 21.2–26.1 | Plan | "before the event" → pin "meeting point"; one short text "At the meeting point." (21 / 160 characters) is delivered; both phones walk to the pin. |
| 26.1–30 | CTA | Short dashed "nearby" link, envelope hop, limited range ring; the doorway above stays busy. Icon and wordmark. |

## Reproduce
From `production/30s/2026-11-09-english-11/`:
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english11-01.mp4 qa/asr_final.json`

Here `$S` is the session scratchpad that holds the venvs and model caches. `node_modules` is a symlink to `education/pilot-01/node_modules` and is not tracked.

## Next
The queue is empty. Nothing is pending from 09 → 10 → 11. No automation was created and nothing was uploaded to Drive.
