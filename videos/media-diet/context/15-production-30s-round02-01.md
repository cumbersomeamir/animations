# 15 · Round-02 episode — "How emergency satellite messaging reaches help when there is no mobile signal"

Round: 2026-11-03 round 02. Output: `videos/media-diet/production/30s/2026-11-03-round-02/media-diet-30s-round02-01.mp4`.
Previous MP4s (pilot-01, 30s-01, 30s-02, feedback-01) preserved unchanged. No generation was active at the start of this
round (repo clean at c61ea19, remote equal, no render processes), so nothing needed checkpointing first.

## Brief (as given, condensed)
One new ready-to-post 30 s English educational video in the locked genre (technology news / explanations of everyday
technology). Topic: how emergency satellite messaging reaches help without mobile signal — phone, orbiting satellite, ground
station, response centre; the practical difference from ordinary mobile towers. Use official Apple/Google supported-device
documentation dated this round; no invented universal availability or Indian launch news; a capability explainer, not an
announcement. 65–75 natural words, strong hook, concrete mechanism, meaningful scene changes, clear takeaway, CTA in the last
3–4 s; qualifier only in the relevant sentence; sources in repo/publishing copy, not on screen.

## Sheet feedback for this round and how it was applied
- **Satisfied = Yes. Retain the exact approved character, polished stage/cuts and palette; do not change format/context; keep
  the accepted CTA.** → Renderer core copied unchanged from the accepted `2026-11-02-feedback-round/src/film.js` (imports,
  helpers, brand palette `P`, MSAA + restrained BokehPass + OutputPass, ACES, paper grain/bump stock, `card()` builder,
  hemisphere + key light at (−11, 10, −4) + rim, layered table + paper hills backdrop, caption overlay at baselines 414/478
  with the y 300–560 band, miniature vignette, the small stopwatch readout, the paper Media Diet sign hinging up with
  "Follow Media Diet for technology explained."). Same Kokoro voice/config, same audio recipe (sustained pad, no loops,
  event-tied foley, two-pass loudnorm −15 LUFS / −2.0 dBTP ceiling), same caption cue timing and QA scripts.
- **"Character"**: the accepted latest style has no presenter mascot, so "character" was read as the accepted paper world
  (stage, palette, captions, voice, CTA). The person in need is implied by props (phone on a rock, tent, backpack); no new
  character was introduced. The accepted "?" tag prop is reused when the voice asks the question.
- **Topic history**: not covered before (no satellite-messaging episode; the feedback episode only had a GPS satellite prop),
  so the proposed topic was used as given.
- **No context rewrite**: context/11 received only an episode-log row; this file is the new episode record.

## Draft → final narration (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us) — 75 words, 24.1 s of speech
Draft (76 words): V5 "…then **on** to a response centre." → "on" removed to stay within 75 words.
QA fix: V3 was "On supported phones and countries, it can go via satellite." — the ASR pass heard "**Unsupported** phones"
(the synthetic voice runs "On sup-" together), which would invert the qualifier. Re-worded to "With a supported phone and
country, it goes via satellite." (10 words; only V3 re-synthesised; ASR then heard it exactly; its caption frames re-rendered).

| id | start | end | final line | why |
|---|---|---|---|---|
| V1 | 0.25 | 2.32 | No mobile signal, and you need help. | hook: the situation, in 7 words |
| V2 | 2.70 | 4.47 | How can a text still reach rescuers? | the question the film answers |
| V3 | 4.85 | 8.07 | With a supported phone and country, it goes via satellite. | the one required qualifier, in its sentence (A1, G1) |
| V4 | 8.90 | 11.32 | Your phone sends a short text up to a satellite, | mechanism step 1 (A1, A3) |
| V5 | 11.65 | 15.60 | which passes it down to a ground station, then to a response centre. | steps 2–3 (A3; A1 "Emergency Relay Center") |
| V6 | 16.20 | 22.46 | Unlike a nearby tower, the satellite is far away: aim at open sky, expect slower replies. | practical difference + what to do (A2, G1) |
| V7 | 22.95 | 24.77 | Try the demo before going off-grid. | takeaway action (A1/A2 demo, G1 demo) |
| V8 | 26.50 | 29.13 | Follow Media Diet for technology explained. | accepted CTA (final 3.5 s) |

## Sources (checked 2026-11-03; quotes and claim map in the output folder's SOURCES.md)
- A1 Apple Support 101573 *Use Emergency SOS via satellite on your iPhone* (Published Oct 05, 2026): iPhone 14 or later; clear
  view of sky and horizon; "Try the Satellite Connection demo"; texts go to emergency service providers or the Emergency Relay
  Center; country list (no India).
- A2 Apple Support 105097 *Connect to a satellite with your iPhone* (Published Sep 29, 2026): satellites "move rapidly, have low
  bandwidth, and are located hundreds of miles away"; 30 s or more to send, up to several minutes under foliage; obstructions.
- A3 Apple Newsroom (Nov 10, 2022): satellite → "custom ground stations" → emergency services or relay center.
- G1 Google Pixel Help 15254448 *Get emergency help through satellite with your Pixel phone* (accessed 2026-11-03): Pixel 9 and
  later except 9a; country table "doesn't guarantee coverage" (no India); satellites "in fixed positions"; face/tilt toward the
  satellite; trees/terrain/buildings block; reply "within a few minutes"; Satellite SOS Demo in Settings.

## Storyboard (as rendered; 9 shots, 8 cuts)
| time | shot | action tied to narration |
|---|---|---|
| 0.0–4.8 | S1 valley, low | phone on a paper rock shows no bars, slash pops; the distant lattice tower's signal rings head for it and die at the paper ridge ("No mobile signal"); "?" tag pops; camera tilts up toward the empty sky ("How can a text…"). |
| 4.8–8.8 | S2 low, wide | paper satellite glides in along its arc; the phone's screen switches to a satellite-aim glyph ("With a supported phone…") and the phone leans to aim ("via satellite"). |
| 8.8–11.6 | S3 close, follow tilt | a bubble appears on screen, a paper speech bubble lifts off and climbs the cyan uplink thread; camera tilts up with it to the satellite ("sends a short text up to a satellite"). |
| 11.6–13.9 | S4 follow tilt down | ground-station dish turns to the satellite; the bubble descends the downlink to the dish ("passes it down to a ground station"). |
| 13.9–16.1 | S5 high 3/4 | bubble runs the paper route dashes (lighting them) to the response centre; windows light, SOS placard flips up ("then to a response centre"). |
| 16.1–19.2 | S6 crane | top-down on the tower: a small coverage circle and short threads to nearby homes ("Unlike a nearby tower"); camera descends/pulls back to the long thread from phone to satellite, a pulse climbing it ("the satellite is far away"). |
| 19.2–22.85 | S7 medium | phone under a tree: the link thread stops in the canopy (magenta burst); the phone hops to open ground and tilts; link connects ("aim at open sky"); a magenta reply bubble descends slowly with the stopwatch ("expect slower replies"). |
| 22.85–26.4 | S8 trailhead | phone (full bars) next to a backpack runs a generic practice demo that completes with a ✓; the signpost arm with a "no bars" pictogram swings up pointing to the valley ("before going off-grid"). |
| 26.4–30.0 | S9 hero pull-back | whole route visible (phone → satellite → dish → centre); paper Media Diet sign hinges up (CTA); music resolves, fade 29.3–30.0. |

## QA summary (final export; full report in the output folder's QA.md)
- SHA-256 `51db6af0eb83efeadb335a2779200e0f1210816ad31fc5fd346440ee44f47e0e` · 18,736,680 bytes.
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −15.2 LUFS / −2.0 dBTP · caption ink y 378–488, x 196–882 · 0 safe-area violations in 900 frames.
- ASR + timing: word recall 0.961 (spelling/weak-word noise only), every line inside its scripted window; V3 fixed after
  the first pass heard "Unsupported" (see narration section).
- Representative and cut-boundary contact sheets inspected; the stopwatch carry-over into S8 was fixed (frames 678–700 re-rendered).

## Limits
- Meshline/Recall voice cache not present here → same cached Kokoro-82M v1.0 + agreed config reused (as in earlier rounds).
- Audio checked by measurement and ASR only (no listening in this environment).
- No local Desktop/video-review folder exists in this cloud container; the finished MP4 is attached in the session and pushed.
- Schematic miniature: not to scale; generic phone and invented screen glyphs (no Apple/Google UI). No automation created.
