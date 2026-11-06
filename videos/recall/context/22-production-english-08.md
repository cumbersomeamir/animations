# 22 — English-08 (2026-11-07 batch): "Your eyes can't see this remote's light. So why can your phone camera?"

**Output:** `videos/recall/production/30s/2026-11-07-english-08/recall-30s-english08-01.mp4`

**Format:** 11. **Style:** 15, retained as most recently accepted in E06/E07 (same café, performer, lime phone, giant
mechanism set, lime/paper/ink palette, Fredoka caption pill, English voice). **Language:** English narration and captions only.
Previous MP4s are preserved, and no automation was created.

## Request essentials (user; facts about the brief)
- Batch 2026-11-07-english-08. One new 30 s English educational episode. Suggested topic: why noise-cancelling headphones
  struggle with sudden voices but reduce a steady engine hum (mic, opposing wave, timing, passive vs active). "If this topic
  was covered choose a different subject in the same fixed genre."
- Keep the most recently accepted style, palette, character, scene grammar and voice; no older rejected style; no quiz. The
  first second visibly intriguing; a concrete educational payoff; one short truthful CTA in the last 3–4 s; no long
  disclaimer. Music quiet under speech. Claims verified with primary sources and cited. Publishing caption = final
  transcript, correct app identity, no editing instructions, no other app names. Finish older running jobs first.
- "The user approved improvements from the Instagram App Performance sheet": the sheet was not provided in this chat; the
  improvements named in the brief were applied. No sheet data is stored here.

## Setup confirmation and history check
- **Repo and branch:** `cumbersomeamir/animations` (origin URL verified), branch `claude-video/recall` at 238efd9 (E07 final),
  tree clean, **no running jobs** (checked with `pgrep`). Git author is session-managed; commit trailers carry this session URL.
- **Topic history:** the suggested ANC topic **duplicates F05** (context 19: AC hum reduced, a friend's sudden voice heard;
  outer mic, opposite wave, "the opposite wave is formed a little late"). A fresh subject in the same genre was chosen: **why a
  phone camera shows a TV remote's invisible infrared, and how to use that to test a remote**. "infrared" and "remote" appear
  in no earlier episode (contexts 11–21 checked).

## Final script (75 words, 25.10 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matches every word)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.40 | Your eyes can't see this remote's light. So why can your phone camera? | 3.79 |
| l02 | 4.60 | Remotes blink infrared, light just past the red end your eyes detect, in a quick code the TV reads. | 6.57 |
| l03 | 11.60 | Many camera sensors respond to that infrared, so the blinks show up on screen. | 4.71 |
| l04 | 16.80 | Remote not working? Aim it at the camera and press a button. No flicker? Try new batteries, or another camera. | 6.74 |
| l05 | 26.35 | Download Recall for learning any new subject with AI. | 3.29 |

- Generated fresh with the cached Kokoro model (sha256 8fbea51e…34cb) and the established English "Meshline"/Recall blend; no
  Hindi or earlier audio reused. l03 shortened ("also" removed) to stay at 75 words.
- "Many" (not "all") camera sensors, and "or another camera", because only some cameras show infrared (S1, S4).

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **NASA Science, "Infrared Waves"** (live text): remotes use "light waves just beyond the visible spectrum of light—infrared";
  "around 940 nanometers"; "While you cannot "see" the light emitting from a remote, some digital and cell phone cameras are
  sensitive to that wavelength of radiation."
- **Samsung Support, "How do I test my Samsung TV remote control?"** (live text): point the tip at the camera lens and look for a
  light or flash; "If no light appears, the remote may have a hardware issue or low battery power."; some remotes use Bluetooth.
- **Vishay TSOP382/TSOP384 datasheet** (PDF text): "IR Receiver Modules for Remote Control Systems"; burst signals; "The
  demodulated output signal can be directly connected to a microprocessor for decoding."; carrier 38 kHz.
- **US8237121B2** (live text): silicon image sensors "respond not only to visible light, but also to infrared and/or near
  infrared light"; infrared-blocking filters.
- Not usable: Sony support (403), Cambridge Audio (Cloudflare challenge), LG UK (403), Philips (partial), Samsung US (maintenance
  page). No bot check was circumvented.

## Product-fact check (CTA)
Same CTA as 16–21. "with AI" is the user's wording and is not confirmed in the saved listing or public site text (context 16).
No learning guarantee.

## Creative decisions (choices, not facts)
- **Same café, performer and lime phone as F01/E06/E07** (`buildCafe` / `buildPerson` / `buildPhone` byte-identical). New props: a
  TV remote with a dark IR LED, a sliding battery cover and AAA cells; a small TV on the counter; an original selfie-camera
  preview and TV picture.
- **Opening = demonstration:** POV with the phone's preview flashing violet-white at the remote's tip in the first frames while
  the real remote's LED in the same frame stays dark.
- **Mechanism set:** a vertical light-spectrum column (visible, then a dark hatched infrared band) with "what eyes see" and camera
  brackets; a giant remote sending dim ghost rings in an on/off code to a giant TV receiver (volume bar steps) and to a giant
  camera sensor whose tiles glow, next to a giant eye that sees nothing.
- **Payoff demonstrated:** remote fails at the TV → no flicker on the phone → battery swap close-up → flicker + check → TV
  volume responds. On-screen takeaway "Flicker on camera = the remote is sending." (no VO).
- **Audio:** accepted score engine retimed; button clicks, sparkles on camera flashes, soft pips per pulse train, TV volume
  beeps, dull clicks + bonk for no flicker, battery-swap foley, chime; English bed gains 0.5/0.6.

## Skill adjustments learned this round
- When a site refuses automated reading (403 / Cloudflare), move to another manufacturer's support page rather than retrying;
  render pages in headless Chromium for verbatim text.
- For hand-held close-ups (battery swap), put the object down on the counter and shoot top-down; the IK hand otherwise fills
  the frame.

## Progress
- 2026-11-07 batch: setup confirmed; ANC topic found to duplicate F05 → infrared-remote topic chosen; sources verified (NASA,
  Samsung, patent live text; Vishay PDF text); narration generated and ASR-checked; scene built from E07 tooling; preview stills
  reviewed and fixed:
  - giant_code framing (TV off-frame) and giant_sensor framing (sensor seen edge-on);
  - counter TV moved and tv_fail/tv_ok/cafe_wide reframed;
  - battery swap moved to the counter with a top-down close-up (the hand filled the frame);
  - hook remote raised into frame.
  - Mix −14.57 LUFS, −1.6 dBTP, voice +15.7…+17.6 dB.
  - Pre-render caption sync: all 11 spoken groups 0.05–0.10 s before their first word.
  - Full render started (`WORKERS=3 ./build.sh`, one process).

## QA summary (verification results; details in the output folder's qa/QA.md)
Pending the full render.

## Publishing caption
`production/30s/2026-11-07-english-08/publishing-caption.txt`, generated by `make_caption.py` from `script.json`: the exact
final transcript (l01; l02–l04; l05) + one note ("Some remotes use Bluetooth instead of infrared and won't flash.") + 4 sources
+ hashtags. App identity: Recall; no other app names (source publishers only); no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-07-english-08 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py); `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
