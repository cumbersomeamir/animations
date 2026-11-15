# 28 · english-15 episode 01: "Same sack. Which weight?" (verified trade scales and what a light scale costs, English)

Batch `2026-11-15-english-15` (user-approved 15 Nov 2026; Published-apps rules of 2026-11-11 retained, plus the new FIRST-FRAME rule below).
- **Language:** English narration and English captions only; every line synthesised fresh. No narration reused from earlier episodes.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-14-english-14/src/scene.html`
  with its 2026-11-11 adaptations. Mascot, palette, caption panel, voice and CTA are unchanged. Props, scenes and text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-15-english-15/wastepaisa-30s-english15-01.mp4`
  SHA-256 `640ddc89b7d0a03f99c8f47282343f03afd0c4f9db27eca586d39071abb006e5` · 11,611,667 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "SAME SACK. WHICH WEIGHT?"):
  `videos/wastepaisa/production/30s/2026-11-15-english-15/wastepaisa-30s-english15-01-thumbnail.png`
  SHA-256 `1441c6450214efb6303f400b94a7e145fdfec7ef8c29f785510c2b2fc733360a` · 1,630,771 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 3fa9765 (english-14) before
  edits. No render or job was running, so nothing had to be queued behind; earlier outputs were not touched.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Proposed topic rejected as covered:** "The cardboard mistake that quietly costs a scrap seller money" (dry vs wet corrugated: buyer
  acceptance, contamination, weighing, logistics; first frame a soaked box on a scale, "HEAVIER. WORTH LESS?"). feedback-05 (context 18)
  already taught it: sort dry corrugated apart from wet and mixed paper; "the buyer deducts the moisture weight and drops the price for
  contamination"; a wet bale on a scale with a moisture probe and a weight-deduction stamp; an example with net profit vs selling unsorted.
- **Replacement, same story criteria and an equally strong opening:** the weighing part of the brief, made into its own story. The same
  sack reads 50.0 kg on one scale and 49.0 kg on another. What does 1 kg mean, what does the law require of a trade scale, how can a
  seller check it, and what a light scale does to a load's profit. History: only one line in hindi-03 (context 16, L6 "a verified
  scale") touched this; no episode explained it.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/: still readable only as page metadata (dexter_zee1, "Make Money ! From
  Hair ??!!", 5 Nov 2026). The video was not viewed; nothing about it is claimed beyond that.

## 2026-11-15 FIRST-FRAME rule applied
- Frame 0 is the composed subject: two identical "SAME SACK" sacks on two platform scales, readouts 50.0 kg (green) and 49.0 kg (amber),
  with the 4 curiosity words "Same sack. Which weight?" already on screen (the big hook caption is forced visible from frame 0) and
  the narration starting at 0.10 s. No logo, fade or empty setup.
- The thumbnail is the same composition with the same words, so the first image works as the thumbnail. The words are truthful: the
  episode is about two scales that disagree and how to tell which one to trust.

## Final script (English narration = captions) · 70 words before the CTA, 27.3 s of speech including it
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.54 | Same sack. Which weight? (big hook caption, on screen from frame 0) |
| L2 | 1.84–5.04 | One kilo short on fifty is two percent of your money. |
| L3 | 5.32–8.80 | By law, a scale used in trade must be verified and stamped. |
| L4 | 9.08–14.09 | Check the stamp's year, the certificate, and the verified test weights traders must keep. |
| L5 | 14.36–21.50 | Say 500 kilos sell for ₹15,000; after buying and transport, ₹900 is left. (spoken "five hundred … fifteen thousand rupees … nine hundred") |
| L6 | 21.77–24.34 | A 2% light scale takes ₹300 of that. (spoken "two percent … three hundred") |
| L7 | 24.62–26.62 | Check the scale before you check the price. |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage changes: L4 first said "the stamped test weights"; both ASR engines heard "stamp test weights", so it now says "verified test
weights" (the rule's own wording is "duly verified and stamped weights"), and L5–L7 moved 0.22 s later to keep the gaps.

## Research (accessed 15 Nov 2026). Legal facts, measured facts and illustrative assumptions are kept apart
- **L1, Legal Metrology Act, 2009, s.24:** weights and measures used in transactions must be verified and stamped (read in full for
  hindi-03; context 16). https://www.indiacode.nic.in/bitstream/123456789/2102/1/2009l.pdf
- **L2, Government of NCT of Delhi, Weights & Measures Department, FAQs** (primary):
  - FAQ 42: "Consumer can ensure the accuracy of the weights & measures equipment by checking the verification stamp/seal"; users must
    "display the verification certificate issued by this Department at the conspicuous place in their establishment"; under Rule 21
    users must keep "duly verified and stamped weights equal to one-tenth of the capacity of the instrument" at each weighing instrument.
  - FAQ 38: the stamp shows "the ID No. of the LMO, year of stamping and the quarter" (A–D); the verification certificate lists the
    verification date, the next due date, the instrument's type and class, and its maximum permissible error.
  - FAQ 33/46: complaints about short weighment can be made to the Controller or a district office (telephone, writing, email).
  - https://weightnmeasures.delhi.gov.in/faqs?page=1 and https://weightnmeasures.delhi.gov.in/faqs?page=2
- **L3, re-verification:** Legal Metrology (General) Rules, 2011, rule 27 sets periodic re-verification (intervals differ by instrument;
  a 2026 amendment exists). The exact interval for platform scales was not confirmed, so the episode says only "check the stamp's year".
- **Arithmetic:** 1 kg of 50 kg = 2 % (measured fact of the example). A scale reading 2 % light pays for 490 kg of a 500 kg load.

### Illustrative load (on-screen "EXAMPLE")
| Item | ₹ | Basis |
|---|---|---|
| Sale: 500 kg × ₹30/kg | 15,000 | assumed price (inside typical kabadi ranges, e.g. hard plastic ₹15–30, iron ₹35–42/kg, contexts 26–27) |
| Buying the scrap: 500 kg × ₹27/kg | −13,500 | assumption |
| Transport | −600 | assumption (one short trip) |
| **Left (profit)** | **900** | arithmetic, 6 % of the sale |
| A 2 % light scale (pays for 490 kg) | −300 | arithmetic: 10 kg × ₹30 |
| **Left after short weight** | **600** | one-third of the profit gone |

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Same sack, which weight? (50.0 kg vs 49.0 kg) | demonstration | Illustrative readings |
| One kilo short on fifty is two percent of your money (50 blocks, one lifts away; 1 KG OF 50; = 2% OF YOUR PAY) | arithmetic | n/a |
| By law, a scale used in trade must be verified and stamped (BY LAW; stamp on the scale's seal; VERIFIED) | L1, L2 | Indian law; no penalty or interval quoted |
| Check the stamp's year, the certificate, and the verified test weights traders must keep (seal close-up "LMO 27 · 2026 · B"; certificate with NEXT DUE; three 10 kg weights read 30.0 kg ✓) | L2 (FAQ 38, FAQ 42, Rule 21) | Seal text is a generic illustration |
| Say 500 kilos sell for ₹15,000; after buying and transport, ₹900 is left (EXAMPLE; 500 kg × ₹30; SALE ₹15,000; BUYING −₹13,500; TRANSPORT −₹600; LEFT ₹900) | assumptions | "Say" + EXAMPLE; costs and profit shown separately; bar to scale |
| A 2% light scale takes ₹300 of that (sack 500 kg on a scale reading 490 kg; 2% LIGHT; PROFIT ₹900 → ₹600 LEFT, −₹300) | arithmetic | n/a |
| Check the scale before you check the price (a test weight reads 10.0 kg ✓, then the price tag appears) | L2 | Advice, not a promise |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–1.7 s | Two SAME SACK sacks on two scales, 50.0 kg vs 49.0 kg (the light readout pulses); big hook caption "Same sack. Which weight?" from frame 0 |
| Escalation | 1.7–5.2 s | 50 one-kilo blocks; the last one lifts away (1 KG OF 50, 2.6); = 2% OF YOUR PAY (3.88) |
| Law | 5.2–9.0 s | A platform scale with a seal; BY LAW (5.47); a stamp tool presses the seal; VERIFIED (8.2) |
| Checks | 9.0–14.0 s | One at a time: seal close-up with the year (YEAR 9.3), the verification certificate with NEXT DUE (CERTIFICATE 10.45), three verified 10 kg test weights read 30.0 kg with a tick (TEST WEIGHTS 11.9) |
| Example | 14.0–21.6 s | EXAMPLE; 500 kg × ₹30 (14.72); to-scale bar SALE ₹15,000 (16.34); BUYING −₹13,500 (18.65); TRANSPORT −₹600 (19.28); LEFT ₹900 (20.09) |
| Short weight | 21.6–24.5 s | The 500 kg sack reads 490 kg (2% LIGHT 22.1); the PROFIT ₹900 block loses a red −₹300 third (23.1–23.7) → ₹600 LEFT |
| Takeaway | 24.5–27 s | The mascot's test weight reads 10.0 kg, a tick, then a THEN THE PRICE tag (26.07) |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:** whole decode exit 0 with 0 bytes of errors; **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 3.7 LU; sample
  peak −1.49 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged): ink **x 117.9–882.1**, **y 343–517**, at most 2 lines; the hook caption is present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`): Vosk L3, L5, L6, L7 1.00; other
  misses are homophones or apostrophes (weight/"wait", kilo/"kilos", traders/"traitors", stamp's/"stamps") and the brand; mean 0.926;
  onsets and offsets within ±0.03 s. faster-whisper small matches the script word for word apart from the brand spelling.
- **Fixes:**
  - Script: the first long middle was condensed; "stamped test weights" → "verified test weights" (ASR), with L5–L7 re-timed.
  - Stills: the law, checks and takeaway scales were small, so they were enlarged (×1.35) and the readouts made larger for phones.
  - Caption log: one group ("and the stamped test weights traders must keep.") reached x 80–920, so it was split; now x 118–882.
  - First full render: the example scene showed only its tag for ~1 s, so "500 kg × ₹30" now arrives on "five hundred"; re-rendered and
    re-muxed. All QA above is on that final file.
- **Visual review:** stills of every scene, 40 transition and representative frames decoded from the export
  (`qa/contact-transitions.png`), a full sheet every 1.25 s (`qa/contact-full.png`), and frame 0 at half resolution.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - The load figures are illustrative; real margins vary. The 50.0 vs 49.0 kg readings are a demonstration.
  - Delhi's FAQ is one state's guidance under the national Act and rules; other states run their own Legal Metrology departments.
  - The re-verification interval for platform scales was not confirmed and is not stated.
  - The Instagram reference could only be read as page metadata.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
