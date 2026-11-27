# 11 — Tensorblue production format (recurring rules for every round)

Durable context for future rounds and any later automation. **No automation exists; do not create one unless the user asks.**
**Latest user feedback overrides older style details.** The current default is **Blue Receipt Theatre** (from the 2026-11-02 feedback round). It supersedes the batch-02 "software cutaway" and the round-01 crosshatch notebook (both kept below as history only).

## Story, pacing and presentation rules (approved 2026-11-11 from the Published apps "Satisfied?" column — these override older storyboard/caption details below)
**Theory of Marketing — every episode follows:** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
- **Hook** answers "why should I care?" **Build-up** sustains one specific, real unanswered question. **Proof** makes the answer credible. **Payoff** gives useful knowledge. **CTA** gives a relevant next step.
- Suspense comes only from a real unanswered question, never from false claims. Do not repeat the answer in every scene or pad with generic statements.

**Pacing (adapt naturally, always exactly 30.000 s):**
- 0–3 s: an immediate striking image plus the hook.
- 3–5 s: optional escalation (super hook).
- 5–21 s: visual explanation and proof, with scene changes.
- 21–27 s: resolve the question with a concrete takeaway.
- 27–30 s: a concise, app-relevant CTA.

**Thumbnail:** a separate, attractive vertical thumbnail (1080×1920 PNG) tied to the hook, with 2–4 large words. Deliver it with the MP4.

**Frame zero (approved 2026-11-15):**
- No logo intro, fade from black or empty setup.
- Frame 0 is a beautifully composed, surprising subject, readable on a phone, with at most 2–5 truthful curiosity words fully on screen.
- It should work as the thumbnail. Click-worthy, never misleading.
- Hook audio starts immediately, promises a specific useful answer, and the episode delivers it.

**One visual idea at a time:**
- No paragraph cards. On-screen labels are large and brief; the voice explains the detail.
- Never show the caption, diagram labels and an explanatory paragraph competing at the same time.
- Reveal diagrams sequentially. Use deliberate depth, lighting and transitions, and meaningful motion that explains the topic. No decorative or distracting lines.

**Captions:** readable inside **x 100–900, y 230–1500**, clear of platform overlays. House setting from english-12 on: band ink y 340–520, centred at x 500, max line width 760 px.

**Facts:**
- Verify claims from primary or reliable sources before the final script.
- Distinguish measured facts, estimates and illustrative assumptions.
- Sources go in the project notes, not on screen as clutter.
- Never invent prices, returns, news, app functionality or scientific certainty.
- No boilerplate warning or disclaimer narration: omit risky procedures instead. Essential legal qualifications stay concise and accurate.
- If a fresh-news claim can't be verified, pick another verified story; never present rumour as news.

**Topics:** review this app's previous episodes. If the proposed topic was covered, choose a genuinely different topic in the same genre using the same story criteria.

**Isolation:**
- Use only this app's conversation, account, repo and branch.
- Never borrow another app's visuals, voice, CTA or assets, and never overwrite earlier outputs.
- Educational episodes are separate from any unrelated short-film requests.

**Delivery and QA honesty:**
- Only completed MP4s go to the user's video-review folder, when one exists. Source, citations, prompts and QA stay outside it.
- Render, full-decode, check duration and codecs, inspect transitions and frames, and check caption sync, clipping and missing assets.
- Never claim a watched or listened check that was not performed. Where listening isn't possible, say verification was ASR plus metering.
- Attach the finished MP4 **and** the thumbnail.

**Tensorblue-specific (2026-11-11):**
- Useful app-development / clever app-engineering stories; no dry paper or repository diagrams.
- Motion needs real 3D depth and fun: tactile miniature 3D objects, parallax, physical layers, purposeful camera changes and cause/effect, not flat node charts.
- Use the exact current tensorblue.com colours and logo.
- Ground stories in a documented real example or a clearly generic engineering model; never imply unverified Tensorblue app features.

## Channel genre (locked)
Practical system design · useful new GitHub tools · research explained through something viewers can actually understand. Not academic research diagrams, not generic AI news. See `00-channel.md` for scope and claim rules.

## Default style: "Blue Receipt Theatre" (custom style recipe — a rendering library is not the style)
**Recipe:** premium kinetic typography **+** tactile minimal UI cards **+** a simple isometric stage — joined by purposeful wipes, staged as clear before/after.

| ingredient | rules |
|---|---|
| **Kinetic typography** | Inter Display ExtraBold, large (80–136 px) and simple; words rise out of a mask line on the beat they are spoken; one key word in electric blue `#3B82F6`, the rest white. Max ~3 words per kinetic line. Lives in the stage area, never in the caption band. |
| **Tactile minimal UI cards** | Pale cards (`#D8E3F5`, or white `#FFFFFF` for paper) with dark readable text (`#030610`), generous corner radius, a darker base edge and a soft contact shadow so they feel like physical objects. One recognisable UI per story (e.g. one checkout). |
| **Simple isometric stage** | One flat slab (navy) and at most one physical machine (pale faces `#D8E3F5`/`#B7C7DF`/blue-gray mix) with a meaningful part (e.g. a duplicate-check slot). Label text skewed onto the face; no wiring diagrams. |
| **Story objects** | A single **blue token** = the active thing (in round feedback-01: one purchase; its white notch bars ARE the key, so "same key" is visible as the same bars without reading code). A **white receipt** = the result. Repeat the same token to show "same"; change the bars to show "different". |
| **Transitions** | ≥ 5 purposeful scene changes per 30 s, using solid electric-blue wipe bands (L→R, R→L, bottom→top) or object hand-offs. A new scene must change the staging, not just move a camera over one diagram. |
| **Staging** | Spacious composition, one idea per scene, clear before/after (e.g. two receipts = the fear → one receipt = the fix). |

**Never:** moving-line networks, drifting particles, decorative rings, wandering connector lines, persistent fine-grid motion, camera bobbing over a static page, mascots/random characters, brown/orange/cream-dominant looks, research-paper diagram slides, contact-sheet-as-video.

### Feedback log (append-only)
- **2026-11-03 round 02:** "Current style is fine." Keep the Blue Receipt Theatre grammar, official palette/logo, accepted caption treatment, voice, pacing and the accepted CTA ("Follow Tensorblue for software explained simply."). Use simpler content and readable everyday examples (e.g. one photo, one logo), not abstract moving-line research diagrams. Captions may also use the tighter accepted band y 350–470. Update context only with requested corrections plus the episode record.

- **2026-11-03 Hindi batch 03:** latest correction — narration and captions in natural **Hindi (Devanagari)** for this batch. Done with the same model's Hindi pipeline (Kokoro-82M `lang_code='h'`, official voices `hf_alpha`×0.7 + `hm_omega`×0.3, speed ~1.12), never the English voices; Devanagari set in **Mukta** (OFL) with zero letter-spacing; Hindi ASR with faster-whisper `medium`, `language='hi'`, sentence by sentence. Brand wordmark "Tensorblue" stays Latin; CTA spoken/captioned as "टेंसरब्लू फ़ॉलो करें, सॉफ़्टवेयर आसान भाषा में।" (TTS spelling "टेन्सर ब्लू"). Details: `16-production-30s-hindi03-01.md`.

- **2026-11-04 Hindi batch 04:** keep the satisfied design exactly; the renderer is the original Node + `@napi-rs/canvas` code (`brt.mjs` + per-episode `scene.mjs`) — **not Three.js**; the *style* is the Blue Receipt Theatre recipe. Re-fetch tensorblue.com colours each round (unchanged on 2026-11-04). Hindi wording rule: prefer native "चाबी" over the loanword "की" (espeak-hi makes "की" = postposition /ki/). Listening is not supported in the build container: record ASR-only verification. Details: `17-production-30s-hindi04-01.md`.

- **2026-11-05 feedback-05:** keep the satisfied design and Hindi setup; treat the user's performance snapshot as a controlled topic/opening test, not causal evidence or a reason to change style. Open on the working result inside 1–2 s. Real demos must use invented documents only and run the actual tool (here OCRmyPDF + Tesseract on a fictional slip). Hindi TTS: spell acronyms with spaces in `tts` ("ओ सी आर", "पी डी एफ़") — espeak-hi glides unspaced acronyms. Check every "how it works" claim against the tool's actual output (the OCR text layer is *beneath* the image, not on top). Publishing caption = the final transcript verbatim + sources + Tensorblue CTA only. Details: `18-production-30s-feedback05-01.md`.

- **2026-11-06 english-06:** language override back to **English** narration + captions for this batch (Kokoro `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98; Hindi audio never reused). "Approved voice character" = Tensorblue's own voice; other apps named in a brief are not read. Same satisfied design. For tool demos, decode/verify the final MP4's own frames, not just the test images (QR: segno + zbar + OpenCV). English ASR: run `asr.py` on the narration span only (`clip_timestamps`), because Whisper hallucinates on the music-only tail. Details: `19-production-30s-english06-01.md`.

- **2026-11-06 english-07:** the suggested topic (Pay twice / idempotency key + retry) duplicated episode 14, so a fresh same-genre topic was chosen per the brief: two buyers, one last seat (race condition, fixed by a one-step conditional UPDATE). Always check `1N-production-*.md` topics before accepting a suggested subject. Same satisfied design, English voice and CTA; real demo with the actual tool (SQLite) driving the on-screen numbers. Details: `20-production-30s-english07-01.md`.

- **2026-11-07 english-08:** "software mystery" framing (why a deleted photo is still on another device). Same satisfied design, English voice and CTA. First second must be visibly intriguing (here: deleted on the phone, still on the laptop by 0.9 s). Fictional systems are fine when backed by a real-tool run (real folders + rsync) whose states drive the on-screen result; say "often" where retention varies by service. Kit note: `rr()` begins a new path, so fill compound shapes separately. Details: `21-production-30s-english08-01.md`.

- **2026-11-08 english-09:** "engineering mystery" framing (works for your friend, fails for you: stale DNS cache). Same satisfied design, English voice and CTA. Real demo on localhost (dnslib + dnsmasq + dig) with reserved names/addresses (.example, RFC 5737). Include one practical tip from the primary source when it fits (RFC 1034: lower the TTL before a move). English pronunciation: check compound terms (misaki read "time-to-live" with the verb "live"). Captions: each phrase once, no repeated words across groups. Details: `22-production-30s-english09-01.md`.

- **2026-11-09 english-10:** private browsing vs being seen online. Same satisfied design, English voice and CTA. Real demo in the pre-installed Chromium via Playwright (use `channel: 'chromium'`: the headless-shell build writes no History file). Draw browser UI ourselves (no real product chrome). When a primary source is a single vendor, keep narration non-universal ("mainly", "can") and say which browser the demo ran. Before each new episode, confirm all accepted earlier jobs are committed/pushed; never invent analytics. Details: `23-production-30s-english10-01.md`.

- **2026-11-09 english-11:** sent photos losing tiny text (lossy re-save vs original file). Same satisfied design, English voice and CTA. Naming a real app: say only what its help pages state, as a quoted card with the URL; never reproduce its UI or logo. Image comparisons must be fair: same crop, same enlargement filter; judge readability by eye as well as OCR, and word the result to match what a viewer sees ("a guess", not "gone"). After rewording a line, recheck caption cues keyed to repeated words (`VW(..., n)`). Details: `24-production-30s-english11-01.md`.

- **2026-11-11 rules (Published apps, "Satisfied?" column):** Theory of Marketing story structure, the new pacing, a separate thumbnail, one visual idea at a time, captions inside x 100–900 / y 230–1500, fact discipline, no boilerplate disclaimers, honest QA, MP4 + thumbnail delivery, and real 3D depth for Tensorblue motion. Full text: "Story, pacing and presentation rules" at the top of this file. First applied in english-12: `25-production-30s-english12-01.md`.

- **2026-11-13 english-13 (Published apps, "Satisfied?" column; latest approved feedback retained):** topic "how an app can undo a mistake after the screen has changed". Same rules and Tensorblue 3D feedback (useful app engineering, real 3D depth and fun, exact palette/logo, no distracting lines). Built as a tactile "time-machine" bench:
  - each change lands as a physical entry tile on a HISTORY machine;
  - undo lifts the newest tile, flips it to its reversed side and runs it back into the phone;
  - the stack has a limit (Office's documented default of 100; the oldest drops off);
  - an email leaves through an OUT door after Gmail's 5–30 s Undo Send window.
  Naming real products: state only what their own docs say (Apple UndoManager, Microsoft Support, Gmail Help) and never imitate their UI. Unknown words for misaki (e.g. "Gmail's") get a phoneme override. Notes: `26-production-30s-english13-01.md`.

- **2026-11-14 english-14 (latest approved feedback retained):** the suggested topic ("why pressing Pay twice should not charge you twice", idempotency keys) duplicated episode 14 (`14-production-30s-feedback-01.md`), as it already had in english-07. Per the brief, a fresh topic in the same genre was chosen: how a long feed scrolls 10,000 posts with a few recycled rows (Android RecyclerView / Compose lazy lists / iOS cell reuse).
  - Tactile 3D: a phone with a 12-row feed; each row leaving the top flies round the side, spins and returns at the bottom with its next post (14 cards in all).
  - A 10,000-row tower is the plain list.
  - Real proof measured in Chromium (row counts only; timings are machine-specific and not narrated).
  - The idempotency / pay-twice subject must not be proposed again without a genuinely new angle.
  - Notes: `27-production-30s-english14-01.md`.

- **2026-11-15 english-15 (latest approved feedback retained) — NEW STANDING RULE: frame zero is critical.**
  - No logo intro, fade from black or empty setup.
  - Frame 0 must be a beautifully composed, surprising subject, readable on a phone, plus at most 2–5 truthful curiosity words already fully on screen (no animate-in).
  - The first image should work as the thumbnail. Click-worthy never means misleading.
  - Hook audio starts immediately (narration lead 0.1 s, a sound on frame 0), promises a specific useful answer, and the episode delivers it.
  - Applied here: a phone glowing "Saved ✓" at 1% in a blacked-out room with **WAS IT REALLY SAVED?**. The thumbnail is frame 0 plus the wordmark.
  - Topic: write-ahead logs and durability ("your app says saved but the power just went out"), new to the channel. Tactile 3D: a LOG notebook of receipt slips (stamped COMMIT once on disk), a MAIN FILE cabinet updated later, crash → replay, a FULL/FAST sync switch.
  - Real proof: a SQLite app-crash test (honestly an app crash, not a power cut).
  - Notes: `28-production-30s-english15-01.md`.

- **2026-11-15 english-16 (batch16; latest approved feedback retained):** topic "how a maps app reroutes before you reach the traffic jam", new to the channel.
  - Frame zero: a miniature 3D city with **YOUR ROUTE JUST CHANGED.**, a red jam on the old (blue) route and the new cyan detour; it doubles as the thumbnail.
  - Mechanism: streets as a graph with minute costs → live traffic raises one cost → a shortest-time search from the car, lit in the real settle order → the detour.
  - Proof: a real Dijkstra run on a made-up city (9 → old 14 vs detour 10).
  - Attribution: Google is cited only for what its own blog says (fastest routes from current traffic, automatic rerouting, predicted traffic); no claim about its secret algorithm.
  - **Colour rule clarified:** semantic colours are allowed when tensorblue.com's own stylesheet uses them. The site's Tailwind tokens red-500 `#FB2C36`, cyan-400 `#00D3F2` and green-400 `#05DF72` (checked 2026-11-15) are site colours; colours the site does not use stay out.
  - Notes: `29-production-30s-english16-01.md`.

- **2026-11-15 english-17 (batch17; latest approved feedback retained):** topic "how Figma lets two people move the same shape without destroying the file".
  - New to the channel. english-12 covered offline CRDT sync and episode 02 one user's optimistic like; this one covers two people at once through one central server.
  - Frame zero: one blue shape on a 3D canvas, tugged both ways by Ana's (cyan) and Ben's (green) cursors, with **TWO HANDS. ONE FILE.**; it doubles as the thumbnail.
  - Mechanism, from Figma's own 2019 engineering post:
    - your edit shows instantly;
    - edits go to the server, which orders them;
    - the same property ends with the last value the server gets, on every copy;
    - different properties both survive;
    - "not a true CRDT".
  - Proof: our event simulation of those rules (not Figma's code).
  - Each person's own screen is a translucent copy shown only where it differs from the file; edit cards dock in the server in arrival order.
  - Sources stay off screen (a "FIGMA BLOG, 2019" tag was removed in QA).
  - Colours: amber-400 `#FFB900` (defined and used on tensorblue.com) joins the allowed site tokens; it is the recolour, distinct from both cursor colours.
  - Notes: `30-production-30s-english17-01.md`.

- **2026-11-15 english-18 (batch18; latest approved feedback retained):** topic "how Shazam recognizes a song in a noisy café", new to the channel.
  - Frame zero: a café table (black coffee, a phone at "0:10") under a floating dark-glass "sound shard" whose spectrogram stands up as glowing 3D terrain, with **TEN SECONDS. ONE SONG.**; it doubles as the thumbnail.
  - Mechanism, from Shazam's own 2003 paper (Wang, ISMIR 2003):
    - spectrogram peaks become a star map (the paper's own "constellation" image);
    - peak pairs become hashes (two frequencies + gap);
    - lookups give random hits, but the right recording's hits share one time offset;
    - the sample's stars line up on the song like the paper's transparency on a strip chart.
  - Proof: our own implementation on made-up songs and café noise at 0 dB SNR (21 aligned hits vs 4). A hummed version finds no match.
  - Humming vs fingerprinting is kept accurate: the paper says the method is version-specific; the melody-based method is attributed to Google's hum-to-search post, not to Shazam.
  - Two worlds (café → database) are joined by a purposeful wipe. Peaks are drawn as small beads on dark glass so they read as stars, not bristles.
  - Notes: `31-production-30s-english18-01.md`.

- **2026-11-17 english-19 (batch19; latest approved feedback retained):** the proposed topic (a database surviving a power cut: WAL, commit, replay) duplicated english-15, so a different same-genre topic was chosen. That follows the brief's own rule.
  - Topic: why a video turns blurry for a moment instead of freezing (adaptive bitrate streaming), new to the channel.
  - Frame zero: a phone playing a visibly blurry "SD" film beside a glass buffer tower of chunk tiles, with **BLURRY, NOT FROZEN.**; it doubles as the thumbnail.
  - Mechanism:
    - chunks stored in several qualities (RFC 8216 HLS);
    - the next chunk chosen from buffer level (Stanford/Netflix SIGCOMM 2014, BBA-0);
    - a weak signal drains the buffer and the player picks smaller chunks.
  - Proof: our stdlib simulation on a made-up network: always-HD froze 11.6 s, adaptive 0 s. The notes also report the rate-map settings that froze 2.6 s or never reached HD.
  - Tiles carry quality as colour, sharpness and size; height stays 4 s of buffer. The tower's back wall shows the rate-map bands. A red-500 counter shows frozen time live.
  - Notes: `32-production-30s-english19-01.md`.

- **2026-11-18 account move + NEW FEEDBACK (Published apps "Satisfied?", Tensorblue only): "No, content is shit, make it about app development or something cool that some app did in the past, motion graphics lack 3d depth and are not fun at all."** The app moved to a new account (app-isolated continuation, same repo and branch; see `35-continuation-2026-11-18.md`). Standing response from english-20 on:
  - **Content:** a documented thing a real app did (cited only from its own help, policy or engineering pages), or a practical app-development insight, ending with a payoff an app builder can use. No dry repository or paper diagrams.
  - **3D depth (`toy3d.mjs`, new):**
    - every story object is a thick extruded toy with lit side walls and a glossy, textured front;
    - distance fog and a horizon fade;
    - stops laid out in a **zigzag into depth** so the vertical frame is filled from near to far;
    - big foreground objects framing shots, and the camera travelling through space;
    - no large empty dark areas.
  - **Fun:** hops with squash-and-stretch; things fall, bounce, pop, scramble and wake up; confirmations fly back as tokens; playful hop/fall/pop SFX. Physical comedy must still explain the mechanism.
  - **Texture seam:** two clipped texture triangles leave a faint diagonal line, so the first triangle paints the whole face.
  - english-20 (batch20): how WhatsApp's ticks map a store-and-forward journey. Frame zero **ONE TICK. / WHERE IS IT?**; proof from a real UDP model, send-once 3/20 vs store-and-forward 20/20. Notes: `33-production-30s-english20-01.md`.
  - english-21 (batch21): why a progress bar races to 99 % and then waits.
    - Frame zero: **WHY STUCK?** over a 3D scoreboard bar at 99 %.
    - The world is a parcel pipeline on a conveyor into depth: hopper → glowing VERIFY gate → UNPACK burst → INSTALL into a phone.
    - Proof is a real four-stage update run: the bytes-only bar hit 99 % at 3.0 s and was stuck for 1.8 s, while the staged bar stayed within 6 points of elapsed time.
    - Microsoft's own design guide is quoted ("particularly uninformative and annoying").
    - Layout lesson: put a story's key indicator where every shot looks (here a scoreboard at the far end of the belt), and draw large base objects (belts, floors) first rather than sorting them as one object.
    - Notes: `34-production-30s-english21-01.md`.

- **2026-11-19 brief (batch22) — NEW STANDING LAYOUT RULES (apply from english-22 on):**
  - **Captions** sit in the upper band at about **y 280–460**, centred x 500, ≤ 760 px lines. `qa.mjs` checks ink inside x 100–900 / y 280–460, the top 0–280 clean, and no stage pixels in y 280–479. The stage starts at **y 480**.
  - **Text density:** no more than **one short headline plus the spoken caption** at any moment. Use one kinetic headline per shot, not stacked tags.
  - **Placement:** keep vital information away from the right-side and bottom platform controls. Measure key elements on frame 0; for example, the english-22 phone dot sits at y ≈ 1460.
  - **Interfaces:** an interface shown must be accurate, or visibly illustrative and internally consistent. **No fictional buttons.**
  - **QA:** "watch fully" means a 2-frames-per-second review of the whole exported file, plus full-resolution crops, and the notes say so honestly. Check the silent render has 900 frames **before** muxing; an english-22 crash once produced a 798-frame export.
  - **Audio:** if the AAC export overshoots, lower `TP_CEIL_DB` in `mix.py`. english-22 used −3.0, because −1.6 overshot to +0.5 dBTP after encoding.
  - english-22: how a map keeps the blue dot moving in a tunnel.
    - Frame zero: **GPS IS GONE. WHY MOVE?**
    - Our simulation shows straight-line dead reckoning leaving the road, and turn sensor + map matching staying on the road but drifting 92 m ahead until the next fix.
    - Waze Beacons appear as the real thing an app did.
    - The payoff is the Google Maps blue accuracy circle.
    - Notes: `36-production-30s-english22-01.md`.

- **2026-11-21 brief (batch23) — english-23:**
  - **Topic replaced (third time).** The proposal ("How an app avoids charging you twice after a retry", idempotency) duplicated episode 14 and had already been declined in english-07 and english-14. Following the brief, an unrelated subject was chosen. It also differs from batch22 (a map tunnel; positioning) in its question, setting and mechanism.
  - **Subject:** how an app checks whether your password leaked without sending it. 1Password Watchtower uses the Have I Been Pwned range API, which is k-anonymity with a SHA-1 prefix. The test made real API queries with public sample passwords only.
  - **Frame zero:** **LEAKED. NEVER SENT.**
  - **New standing checks (from english-23 on):**
    - **Headlines must never sit on a 3D prop or a flying object.** The 2-fps watch-through missed a capsule crossing a headline for about 6 frames. `qa.mjs` check 4 now compares every 2nd frame before the CTA: inside each headline's ink box (+12 px), the world without headline must match the bare background (RGB-sum threshold 90; 45 trips on the lit floor itself).
    - Headlines are centred on the caption axis (x 500) and fitted to ≤ 700 px. If a prop sits on the right, shorten the words instead of shrinking the text.
    - Time a headline out before an object flies through its zone (one visual idea at a time).
    - Screen textures throw if a line overflows its card.
  - Notes: `37-production-30s-english23-01.md`.

- **2026-11-23 brief (batch24) — english-24:**
  - **Topic replaced.** The proposal ("Why deleting an app does not always delete its data": uninstall vs separate account-deletion request) overlapped english-08. That episode asked the same question ("deleted here, why does it still exist there?") with the same mechanism: local copy vs server copy, a separate delete path, retention.
  - **Chosen instead:** Twitter's Snowflake (2010, GitHub): unique, time-sorted IDs from many servers with no central counter. It is new to the channel and differs from batch23 in question, setting and mechanism. Payoff: keep 64-bit IDs as strings in JavaScript (X and Discord docs; our test shows 12 IDs → 6 Numbers).
  - **Frame zero:** **SAME MILLISECOND. NO REPEATS.**
  - **Choreography varied, identity kept:** a toy server room, flying ID plates, blocks sized by their bits, a sorted wall and a flip/merge payoff, with the same palette, type, captions and end card.
  - **New standing practices (from english-24 on):**
    - **Watch sheets sample exact frame numbers** (`select=not(mod(n,15))`, labelled with source pts). The old `fps=2` + pts-label sheets led the content by ~0.23 s (a labelled 21.0 s frame was really 21.23 s), and that applies to earlier rounds' sheets.
    - **`mix.py` raises on unknown SFX types.** Before, an unknown type was silently dropped.
    - Every scene texture measures its text and throws on overflow (not only phone screens).
    - **A headline's exit finishes before its shot cuts** (`HEAD_OUT` 0.32 s). If that leaves a headline under ~0.7 s, move the cut or the entry cue rather than overlapping the next shot.
    - **Keep SFX impacts off the narration.** A buzz on the tail of "number" made ASR hear a phantom "4". Put impacts just after the word ends.
    - The camera screen centre (`camera(..., cx, cy)`) can move content into the lower stage. english-24 used cy 1250 so the frame isn't half empty floor; keep vital items above y ≈ 1650 and away from the right edge.
  - Notes: `38-production-30s-english24-01.md`.

- **2026-11-27 brief (batch25) — english-25:**
  - **Topic replaced.** The proposal ("How Figma keeps two cursors from overwriting each other") is the same mechanism and sources as english-17: the central server, separate properties both survive, and the same property takes the last value received.
  - **Chosen instead:** Spotify's 2025 "Fewer Repeats" shuffle (Spotify Engineering, 13 Nov 2025): several random orders, each scored for freshness, the freshest kept. Our model: a just-played song came first 24.6 % → 8.1 %. Payoff: "keep it random, then pick the freshest of a few".
  - **Frame zero:** **JUST PLAYED. UP AGAIN?**
  - **Branding re-checked on tensorblue.com (27 Nov):** the core palette is unchanged; amber-400 `#FFB900` (16 homepage uses) for "just played", green-400 `#05DF72` (160 uses) for fresh/winner.
  - **Practices added:**
    - Measure the rightmost pixel of any vital coloured label on the hook and moving shots (`amber-extent.mjs`). A lift toward the camera pushed a pill to x 1079; keep it ≤ ~910.
    - When a shot shows many parallel candidates, stage them in depth (a receding, rising deck) rather than a flat row. Ten flat columns were unreadable; the deck kept every score badge visible.
    - Start a shot's first object at the cut. Two shots opened with 0.2–1.7 s of empty stage.
    - Check free disk at the start of a resumed session (27 GB here). Renders stream frames into ffmpeg, so no frame files are written.
  - Notes: `39-production-30s-english25-01.md`.

### References (from the user's sheet; borrow spacing, strong type, clean physical forms, purposeful wipes, before/after staging — never their characters or claims)
- https://www.instagram.com/p/De9jkaXhMo0/
- https://www.instagram.com/p/DfKmIL6C5vq/
- https://www.instagram.com/p/DfLY1llu3AT/
- https://www.instagram.com/p/DfFEMw3BPui/

These posts could not be viewed from the build container (Instagram shows a logged-out page); the recipe follows the user's written description of what to borrow.

### Palette (exact, checked by the user at https://www.tensorblue.com/ and confirmed in the site CSS on 2026-11-02)
| role | colour |
|---|---|
| background | near-black navy `#030610` |
| active object / highlight / key word | electric blue `#3B82F6` |
| text on dark, receipt paper | white `#FFFFFF` |
| cards | cool pale blue `#D8E3F5` |
| secondary text, machine side | muted blue-gray `#B7C7DF` |
| logo mark only | logo blue `#0A6CFF` (from `assets/brand/tensorblue-logo.svg`) |
Shades are only mixes of these (e.g. token base `#2757A6`, stage slab `#0C1834`). **Logo relationship:** blue drop with a white tensor grid; wordmark "Tensor" in white + "blue" in electric blue.

### Type
Inter Display ExtraBold/Bold for kinetic type and titles; Inter SemiBold for captions; Inter Medium/Bold for small UI text (`assets/fonts/inter/`, SIL OFL 1.1). Keep type large: nothing essential under ~30 px; captions 54 px.

### Brand / CTA
Final 3–4 s: logo drop + "Tensorblue" wordmark + one short useful line (round feedback-01: "Follow Tensorblue for software explained simply." spoken, with a blue "Follow" pill). The CTA must say "Tensorblue" explicitly and stay short; no app advert, no invented capability.

## Storyboard clock (30 s)
Strong opening (real UI on frame 0) · problem/hook by ~4.5 s · mechanism in distinct scenes as it is narrated · clear takeaway · CTA in the final 3–4 s. Narration is the clock: every visual cue is keyed to a word time from Kokoro. **Superseded in detail by the 2026-11-11 pacing (hook 0–3 s, escalation 3–5 s, proof 5–21 s, payoff 21–27 s, CTA 27–30 s).**

## Technical spec (export gate)
1080×1920 · 30 fps · exactly 900 frames · H.264 High yuv420p (CRF 18, cap 12 Mb/s) · AAC-LC 48 kHz stereo · exactly 30.000 s · `+faststart`.

## Caption and safe areas (from the feedback round)
- **y < 300: no meaningful text** (platform account overlays).
- *(2026-11-11: captions must now read inside x 100–900, y 230–1500 — see the rules section; house band y 340–520 centred at x 500, ≤ 760 px lines.)* Earlier rounds: captions in the **upper safe region: text ink inside y 340–520, x 90–990**, max two readable lines, Inter SemiBold 54 px / 64 px leading, split by word groups (renderer rejects lines wider than 880 px). No overlaps with stage content: the stage is clipped to start at y 540.
- Crucial visuals inside x 90–950, y 540–1480 (keep out of side and bottom platform UI).
- Verified by `qa.mjs` each round (pixel diff with/without captions; y 0–539 must equal the background except captions, every 10th frame).

## Audio configuration
- **Narration:** Kokoro-82M (`hexgrad/Kokoro-82M` rev `f3ff3571791e39611d31c381e3a41a3af07b4987`) via `kokoro==0.9.4`/`misaki[en]==0.9.4`, `lang_code='a'` (en-us), voice **`af_bella`×0.7 + `am_puck`×0.3**, **speed 0.98** — the established cached voice; run with `HF_HUB_OFFLINE=1`. No Piper, no imitation of real people.
- **Pronunciation:** check misaki phonemes for brand/technical words before rendering; use inline overrides `[word](/phonemes/)` when needed. Known: `[Tensorblue](/tˈɛnsəɹblˌu/)` (not in the lexicon). Avoid "retrying" (misaki stresses it on the first syllable); "retry" is fine.
- Script length ~65–75 words (≈ 22–23 s of speech) so scenes have breathing room.
- **Music:** subtle and non-repetitive: one sustained chord per scene + one soft felt note at each scene change (no arpeggio loop), ~20 dB under the voice during speech, ducked further.
- **SFX:** synthesized, each tied to an on-screen action (tap, token clack, wipe, receipt paper, slot, match, chime).
- **Targets:** −14 to −16 LUFS integrated (aim −15), true peak ≤ −1 dBTP.

## QA gates (every round)
1. ffprobe streams/codecs, 900 frames counted, 30.000 s; whole-file decode with zero errors; `+faststart`.
2. Loudness + true peak (ffmpeg `ebur128=peak=true`) on the exported MP4.
3. Caption bounds and clean top band (`qa.mjs`).
4. 1-fps contact sheet and a transitions sheet from the exported MP4 viewed; full-resolution crops for small/obstructed text and compression artefacts. Re-render if text is small, obstructed or scenes are static.
5. ASR (faster-whisper base.en) on the exported audio: WER and word-start drift vs caption timing.
6. Claims mapped to original/official sources; provenance and licences recorded; MP4 checksum recorded.
7. (2026-11-11) A separate 1080×1920 thumbnail with 2–4 large words is rendered, viewed and attached with the MP4. Listening checks are reported honestly (ASR + metering when listening is impossible).

## History (superseded looks — do not reuse unless asked)
- **Batch 02 (2026-11-02):** brand-aligned software cutaway (dark navy UI panels, static crosshatch texture, match-cut layers, palette `#0A6CFF`-led). Superseded because the feedback round asked for kinetic type + tactile cards + isometric stage and banned connector lines.
- **Round 01 (2026-11-02):** Crosshatch notebook (cream paper, brown ink, boiling lines) from `cth9191/animate` STYLE.md (read-only, never run). Retired by batch-02 feedback ("replace distracting boiling/moving crosshatch lines").
