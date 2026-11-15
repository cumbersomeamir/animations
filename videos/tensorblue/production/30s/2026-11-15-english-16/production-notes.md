# 29 — Batch `2026-11-15-english-16` (batch16) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-15-english-16/tensorblue-30s-english16-01.mp4`, thumbnail `…/tensorblue-30s-english16-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-15-english-16/production-notes.md`. All earlier MP4s (including batch15 / english-15) are preserved unchanged.

## Brief (user-authorised, 15 Nov 2026, batch16)
- **Topic:** how a maps app reroutes before you reach the traffic jam.
  - Explain a dynamic routing graph: edge costs from current travel times, and the shortest-time path recomputed.
  - Use a verified, familiar app example, with no claim about its secret algorithm.
- **Look:** a 3D miniature city; a red jam reroutes the route to cyan/green; the exact tensorblue.com palette; no decorative moving lines.
- **Hook:** YOUR ROUTE JUST CHANGED.
- **Standing rules kept:**
  - frame zero is a composed, surprising subject plus 2–5 truthful words, with no fade or logo intro, working as the thumbnail, and hook audio at once;
  - Theory of Marketing structure and pacing;
  - one idea at a time;
  - captions inside x 100–900 (house band y 340–520);
  - honest QA.
- **Feedback kept:** a useful app-engineering story with real 3D depth and fun; exact palette and logo; no distracting lines.
- **History check:** not a duplicate. No earlier episode covers maps, routing or shortest paths. The words "route/routes" in episodes 12 (CDN) and 13 (optimistic like) refer to network requests, not navigation. This is a single job after the finished batch15; batch15 was not repeated.
- **Process:** the session's worker restarted mid-job and the user asked to "try again". Work resumed from the saved state; nothing was lost or duplicated.
- **Language and voice:** English only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached. Narration starts at 0.10 s. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` and `stage3d.mjs` (from english-15) unchanged.
  - Node + `@napi-rs/canvas` 1.1.0. No Three.js, Blender or paid API.
- **Colours** (tensorblue.com re-checked 2026-11-15, homepage + its three CSS files):
  - The Tensorblue palette as before: `#3B82F6`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, navies `#050816` / `#08101F` / `#0B1423`.
  - The brief asked for a red jam and a cyan/green route. The site's own stylesheet defines and uses these Tailwind tokens: `bg-red-500` (64 uses), `text-green-400` (108), `bg-green-500`, and cyan-300/400/500 classes.
  - So the jam is **red-500 `#FB2C36`** (oklch 63.7% .237 25.331), the new route **cyan-400 `#00D3F2`** (oklch 78.9% .154 211.53), and "DETOUR: 10 MIN" uses **green-400 `#05DF72`** (oklch 79.2% .209 151.711). The hex values were converted from the site's oklch tokens.
  - The old route stays brand blue `#3B82F6`.

## The real test (`src/demo/route_demo.py`; Python 3 stdlib `heapq`)
- **The city:** a made-up miniature city graph. Nodes are intersections C (the car), A1–A3 (the avenue), B1–B3 (side streets) and D (the destination). Two-way edges carry illustrative travel times in minutes: avenue 2/2/3/2, side 3/2/3/2, cross streets 2.
- **The search:** Dijkstra's shortest-path search runs from the car before and after a live-traffic update raises A1→A2 from 2 to 7 minutes. Results (`demo/out/route-demo.json`):

| | route | minutes |
|---|---|---|
| before | C → A1 → A2 → A3 → D (the avenue) | **9** |
| after the update: old route | same | **14** |
| after the update: chosen | C → B1 → B2 → B3 → D (side streets) | **10** |

- **Settle order** after the update: C 0, A1 2, B1 3, B2 5, A2 7, B3 8, A3 10, D 10. The video lights the intersections in exactly this order with these numbers.
- **Search time:** 11 µs in this container. It is machine-specific and not used in the video.
- **Honesty:** the inputs are illustrative and the computation is real. It demonstrates the general method, not any app's code. The renderer stops if these results change.

## Final script (as spoken; 85 words, 29.45 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.09 | Your route just changed, and you haven't even reached the jam. |
| L2 | 3.39–4.66 | How did the app know first? |
| L3 | 4.96–8.96 | To the app, streets are a graph. Each segment costs its travel time now. |
| L4 | 9.21–12.56 | Live traffic just raised this one from two minutes to seven. |
| L5 | 12.86–17.64 | It reruns a shortest-time search from your spot: old route fourteen, detour ten. |
| L6 | 17.89–21.26 | Google says Maps reroutes using live and predicted traffic. |
| L7 | 21.56–25.96 | So a reroute is fresh travel times plus a fast search, rerun as you drive. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):**
- "reroute(s)" is phonemised /ɹiɹˈut/, the /ruːt/ variant, which is standard in American English.
- "shortest-time" and "Google" are normal.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Timing edits from the draft (91 → 85 words):**
- L3: dropped "right".
- L5: "So it reruns … from where you are. Old route: fourteen minutes. Detour: ten." → "from your spot: old route fourteen, detour ten" (the "14 MIN" / "10 MIN" tags carry the unit).
- L7: "fast path search, run again" → "fast search, rerun".

## Source → claim map (primary/official, read 2026-11-15; quotes checked verbatim against the raw pages)
| claim | kind | source | what it says |
|---|---|---|---|
| Your route just changed (before you reach the jam) | documented behaviour of a familiar app + illustrative scene | **Google Blog — "Back to school doesn't have to mean back to traffic"** https://blog.google/products-and-platforms/products/maps/back-school-doesnt-have-mean-back-traffic/ | "When you get directions with Google Maps, we surface the fastest routes possible based on traffic conditions at that very moment. And if conditions change while you're en route, we'll automatically reroute you the fastest way." |
| Streets are a graph; each segment costs its travel time now | documented in a real open-source router (general engineering model) | **OSRM wiki — Traffic** https://github.com/Project-OSRM/osrm-backend/wiki/Traffic ; NIST (below) | OSRM: traffic updates come as a CSV where "each line has to follow the format `from_osm_id,to_osm_id,edge_speed_in_km_h(…)`" and "the edge speed will be used to update edge weight (corresponds to the "duration" weight)". |
| Live traffic raised this one from two minutes to seven | illustrative input | test | Our made-up update. |
| It reruns a shortest-time search from your spot; old route 14, detour 10 | documented method + measured on our model | **NIST DADS — Dijkstra's algorithm** https://xlinux.nist.gov/dads/HTML/dijkstraalgo.html ; test | "An algorithm to find the shortest paths from a single source vertex to all other vertices in a weighted, directed graph. All weights must be nonnegative." Test results as above. |
| Google says Maps reroutes using live and predicted traffic | documented (Google's own statements) | Google Blog (above); **Google Blog — "Google Maps 101: How AI helps predict traffic and determine routes"** https://blog.google/products/maps/google-maps-101-how-ai-helps-predict-traffic-and-determine-routes/ | "…automatically reroute you the fastest way" (above). Maps "analyzes historical traffic patterns for roads over time"; "We then combine this database of historical traffic patterns with live traffic conditions, using machine learning to generate predictions"; "If we predict that traffic is likely to become heavy in one direction, we'll automatically find you a lower-traffic alternative." |
| So a reroute is fresh travel times plus a fast search, rerun as you drive | summary of the general model | — | — |

**Illustrative, not claims:**
- the city, buildings, car, destination pin and every travel time;
- the jam's position;
- the "LIVE TRAFFIC" / "+ PREDICTED" tags, which repeat Google's own wording.

**Deliberately not claimed:**
- Google's actual routing algorithm and data pipeline are not public. The video never says Google uses Dijkstra; it attributes only what Google's blog says.
- Production engines use faster variants of shortest-path search (OSRM's wiki names CH and MLD). The video says "a fast search", not a specific algorithm.
- No accuracy, timing or traffic statistic is claimed. No Tensorblue product feature is implied. No Google Maps UI or logo is reproduced.

## Storyboard as built (7 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.24 | **1 Hook — frame zero** | Frame 0: a miniature 3D city seen from behind the user's blue car. A red jam sits on the avenue ahead (the old route, dimmed blue); a bright cyan detour bends round the side streets to the blue destination pin. **YOUR ROUTE JUST CHANGED.** is already on screen, with a sound on frame 0. On "jam" the red cars bounce. |
| 3.24–4.81 | **2 Super hook** | Closer, toward the jam ahead. Kinetic **HOW DID IT KNOW?** |
| 4.81–9.07 | **3 Graph** | High view, rewound to before the jam: the blue avenue route only. On "graph" the intersections pop up as node pads ("STREETS = GRAPH"); on "costs" every segment gets a minute chip. |
| 9.07–12.71 | **4 Live traffic** | Closer on the avenue: red cars drop onto A1→A2 ("LIVE TRAFFIC"). Only that segment's chip stays, and on "seven" it flips from "2 min" to a red "7 min". |
| 12.71–17.74 | **5 Search** | High view. From "reruns", intersections light cyan one by one in the real settle order with their minutes from the car (0, 2, 3, 5, 7, 8, 10, 10). "OLD: 14 MIN" (red) on the avenue; on "detour" the cyan route grows along the side streets, "DETOUR: 10 MIN" (green). |
| 17.74–21.43 | **6 Google** | The city from the side: "LIVE TRAFFIC", then "+ PREDICTED" above the jam (Google's own words). |
| 21.43–26.60 | **7 Payoff** | The car drives the cyan detour to the pin (slow crane). Kinetic **FRESH TIMES / + FAST SEARCH.** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english16-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark in the empty top. **YOUR ROUTE JUST CHANGED.** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/route_demo.py` + `src/demo/out/route-demo.json`.

Reused from english-15:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`;
- `mix.py`: heading, seed (20261119) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0. The demo uses only Python's standard library.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-15-english-16/tensorblue-30s-english16-01.mp4` · SHA256 `7f01c3505a7e223c324716dfb1cc5094178308a7ea5433d1b368f23091ab78ac` · 4,921,552 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = the city with the jam, old and new routes + "YOUR ROUTE JUST CHANGED." fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.1 LU, **−1.7 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 14 groups pass: ink x 140–860, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | Every group switches 0.06 s before Kokoro's word onset. Whisper starts some words later; the voice track is silent before "Live" (9.22 s) and "old" (15.59 s) and speech starts there (RMS 0.13), so those captions are on time. |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | frame zero + wordmark, 4 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 79/85 scripted words matched, WER 10.5 %; mean start drift 0.10 s, max 0.52 s on a mid-group word ("just") that switches no caption (`qa/asr.json`). The differences are under "Known limits". |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (frame 0 + frames around each change) viewed on the final file. |

**Fixed during QA:**
1. **City scale.** Buildings were too tall: in low shots they hid the routes and filled the frame, and frame 0's words overlapped the skyline. Buildings were lowered and the city compressed (9.6 → 8.2 units deep), and every camera was re-set with a projection check so the city sits under the words.
2. **Super-hook kinetic.** It became one line ("HOW DID IT KNOW?") to clear the far skyline.
3. **Chips.** In the jam close-up every cost chip showed; only the jammed segment's chip stays.
4. **Tags.** "LIVE TRAFFIC" covered that chip, and the Google-shot tags were anchored at the car instead of the jam.
5. **Captions.** Three groups were too wide and were re-split.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check on two words; no listening check was performed.
- WER 10.5 % comes from:
  - "re-root(s)" spellings for "reroute(s)" (the /ruːt/ pronunciation; the captions spell "reroute(s)");
  - numerals ("14", "10") and "shortest time" without the hyphen (tokenisation);
  - a doubled, low-confidence "Search," (p 0.19) at the "search, rerun" boundary, treated as a Whisper artefact.
- The city, its travel times and the jam are illustrative. The routing method is shown on our model, not measured in Google Maps.
- In the payoff the car is small in the wide frame.
- The full render took 431 s in this container (heavier scene); no effect on the output.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
