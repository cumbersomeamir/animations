# 12 — Production 30 s #01 (round production-30s-2026-11-02)

**Status: DONE.** Output `videos/help/production/30s/2026-11-02/help-30s-production-01.mp4`
SHA-256 `470743a39e6d7ec540699ee26cd98df33dafae8c2483c2304a41d1da2a2ec80b`. Format rules: `11-production-format.md`.

## Brief
User-approved production round: one new ready-to-post 30.000 s educational video. Genre (locked): practical helping poor people through
donations that match actual needs. Skill: Shadow Puppetry (lemo-opuscar `styles/shadow-puppet/STYLE.md`). Episode: "Before donating clothes,
ask these three questions." Respectful fictional coat exchange; wrong size first, then need/size/weather matching shown through action.

## Final script (draft used verbatim — fit 30 s naturally: 20.1 s of speech, no speed-up, no edits needed)
| # | Start (s) | End (s) | Sentence |
|---|---|---|---|
| 1 | 0.35 | 3.38 | Before donating clothes, ask three simple questions. |
| 2 | 3.75 | 4.94 | What does the person need? |
| 3 | 5.35 | 6.29 | What size fits? |
| 4 | 6.70 | 8.97 | And can they use it in the weather where they live? |
| 5 | 9.60 | 11.98 | A coat that is too small cannot do its job. |
| 6 | 12.80 | 18.86 | A clean, wearable item in the right size can be far more useful than a bag of random leftovers. |
| 7 | 23.20 | 24.80 | Start by asking, then choose. |
| 8 | 25.60 | 28.26 | Useful help begins with the person receiving it. |

## Sources (accessed 2026-11-02) and claim map
- **S1** FEMA, "Volunteer and Donate" (last updated 2026-04-20), https://www.fema.gov/disaster/recover/volunteer-donate — "Needs can change
  quickly, so always check with local sources before donating." · "Only donate items requested by relief organizations." · "Sending the wrong
  items or too many can overwhelm communities already facing challenges."
- **S2** Penrith City Council, "Donating Responsibly", https://penrithcity.nsw.gov.au/waste-environment/waste/donating-responsibly — "Is the item
  free from rips, stains, odours, and pet hair?" · "Would you be happy to wear the item if it was given to you by a friend?" · "NSW charities spend
  millions of dollars each year disposing of poor-quality donations".
- **S3** Dress for Success NSW & ACT, "Clothing Drive Donation Guidelines" 2025 (PDF hosted by Inner West Council),
  https://www.innerwest.nsw.gov.au/sites/default/files/page-documents/General_Clothing-Drive-Donation-Guidelines_2025.pdf (SHA-256 of fetched
  PDF `03187592…3abbc`) — "In season items" · "Knitwear, wovens, coats (in Autumn and Winter)" · prefers not to receive "Items that are dirty,
  damaged, or in need of repairs" · "We accept all sizes".

| Claim | Support |
|---|---|
| Ask what the person needs before donating | S1 (check needs first; donate requested items) |
| Ask what size fits | S3 (organisations specify sizes); common-sense consequence shown in S5 line |
| Can they use it in the weather where they live | S3 (in-season items; coats in autumn/winter) |
| A coat that is too small cannot do its job | Illustrative reasoning (no statistic) |
| Clean, wearable, right-size item can be far more useful than a bag of random leftovers | S2 (clean, wearable test; poor-quality donations cost charities to dispose), S1 (wrong items can overwhelm) — hedged "can be" |
| Start by asking, then choose / useful help begins with the person | Takeaway synthesising S1–S3 |
FEMA's page addresses disaster donations; the lesson applies its "check needs first" principle to everyday clothing gifts (stated as practical guidance, not a FEMA rule).

## Storyboard (one continuous stage; cue times in `src/cues.json`)
| Beat | Time | Action (shadow-puppet vocabulary) |
|---|---|---|
| Hook | 0–3 | Lamps rise; giver snaps onto the cloth from blur carrying a lumpy bag of mismatched leftovers (lone sock, tiny sleeve, sandal); three blank carved plaques **1 2 3** snap in on clapper hits. |
| Setup | 3–8 | Plaques swap to **NEED** (neighbour hugs self, shivers), **SIZE** (yellow ruler slides up, "L" tag), **WEATHER** (carved snowflakes fall at 12 fps, one lamp dims, scarf tassel swings). |
| Mechanism | 8–23 | Giver sets the bag down, pulls out a small coat, holds it to the neighbour → too small (frame-drum freeze, SIZE plaque shakes, head turn); coat goes back; bag pushed aside and dims; a clean right-size coat rises, is lifted, offered and settles on the neighbour; wordless breathing room 18.9–23: ✓ badges tick NEED/SIZE/WEATHER, neighbour relaxes, giver bows. |
| Takeaway | 23–29 | "?" plaque on a rod (ask) → ✓ chime (choose); slow camera push on frame centre; both nod. |
| End | 29–30 | Lamps dim; tiny icon + "Help" in the cloth strip; music resolves. |

## Captions (one ASR timing pass; cards never overlap)
| Time (s) | Card | Timing source |
|---|---|---|
| 0.28–1.59 | Before donating clothes, | proportional |
| 1.66–3.53 | ask three simple questions. | proportional |
| 3.60–5.12 | What does the person need? | asr |
| 5.19–6.50 | What size fits? | asr |
| 6.57–7.46 | And can they use it | asr |
| 7.53–9.32 | in the weather where they live? | asr |
| 9.48–10.64 | A coat that is too small | asr |
| 10.71–12.33 | cannot do its job. | asr |
| 12.69–14.24 | A clean, wearable item | asr |
| 14.31–15.56 | in the right size | asr |
| 15.63–16.73 | can be far more useful | asr |
| 16.80–19.20 | than a bag of random leftovers. | asr |
| 23.07–23.90 | Start by asking, | asr |
| 23.97–25.15 | then choose. | asr |
| 25.47–26.66 | Useful help begins | asr |
| 26.73–28.61 | with the person receiving it. | asr |

## QA (final export) — details in output folder `QA.md`
30.000000 s container/video/audio · H.264 High 1080×1920 yuv420p 30/1 · 900 frames decoded · full decode exit 0, 0 errors · AAC-LC 48 kHz
stereo · −15.2 LUFS, −1.5 dBTP, no clipping · caption ink x 93–987, y 388–452, 0 violations · ASR on final mix 66/67 words.

## Provenance / licensing
All visuals and music/SFX original code (Canvas2D `src/stage.html`, `audio/mix30.py` reusing pilot-01 synth primitives). Voice: Kokoro-82M
(Apache-2.0 model) via kokoro-onnx 0.6.1 (MIT) — local, no API. Font: Inter (OFL). Icon: approved app asset. Style doc read only.

## Remaining limits
No human listening pass (ASR-only); "ask" heard as "asked" by ASR; wrong-size coat less legible on tiny thumbnails; simple puppet joints.
