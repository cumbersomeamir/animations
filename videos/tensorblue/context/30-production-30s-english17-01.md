# 30 — Batch `2026-11-15-english-17` (batch17) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-15-english-17/tensorblue-30s-english17-01.mp4`, thumbnail `…/tensorblue-30s-english17-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-15-english-17/production-notes.md`. All earlier MP4s (including batch16 / english-16) are preserved unchanged.

## Brief (user-authorised, 15 Nov 2026, batch17)
- **Topic:** how Figma lets two people move the same shape without destroying the file.
  - Collaborative-editing conflict resolution, from Figma's own verified engineering description: a local optimistic view and server-ordered edits.
  - Figma must not be called a CRDT, because its own description says otherwise.
- **Look:** a playful 3D shared shape with two cursors; the exact tensorblue.com palette and logo; no decorative moving lines.
- **Frame zero:** the shape tugged both ways, with **TWO HANDS. ONE FILE.**
- **Standing rules kept:**
  - frame zero is a composed, surprising subject plus 2–5 truthful words, with no fade or logo intro, working as the thumbnail, and hook audio at once;
  - Theory of Marketing structure and pacing;
  - one idea at a time;
  - captions inside x 100–900 (house band y 340–520);
  - honest QA.
- **Feedback kept:** a useful app-engineering story with real 3D depth and fun; exact palette and logo; no distracting lines.
- **History check** (this app's completed rounds only): the topic is new.
  - english-12 (`25-…`) covered offline-first sync with Automerge, a CRDT: "a rule picks one, the same on every copy".
  - Episode 02 (`13-…`) covered optimistic updates for one user's like, rolled back when the server refuses.
  - english-17 is about two people editing at once through **one central server**. The server's order decides; the same property ends with the last value it receives; different properties both survive. Figma says outright that this is *not* a true CRDT.
  - The "shows on your screen instantly" beat (3.7 s) touches episode 02's idea. Here it is only the setup for the conflict story.
  - This is a single job after the finished batch16; batch16 was not repeated.
- **Process:** the session's worker restarted mid-job and the user asked to "try again". Work resumed from the saved state; nothing was lost or duplicated.
- **Language and voice:** English only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached. Narration starts at 0.10 s. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` and `stage3d.mjs` unchanged.
  - Node + `@napi-rs/canvas` 1.1.0. No Three.js, Blender or paid API.
  - No Figma UI, logo or screenshots: the cursors, canvas and "SERVER" box are generic and original.
- **Colours** (tensorblue.com re-checked 2026-11-15: homepage + its three CSS files; hex converted from the site's oklch tokens):
  - The Tensorblue palette as before: `#3B82F6` (the shape), `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, navies `#050816` / `#08101F` / `#0B1423`.
  - Ana's cursor: **cyan-400 `#00D3F2`**.
  - Ben's cursor: **green-400 `#05DF72`**.
  - The new colour Ana picks: **amber-400 `#FFB900`** (oklch 82.8% .189 84.429). The site defines `--color-amber-400`, and its homepage uses amber-400 classes 16 times.
  - Amber keeps the recolour distinct from both people's cursor colours.

## The model (`src/demo/multiplayer_demo.py`; Python 3 stdlib `heapq` event simulation)
- **What it is:** our small simulation of the design Figma's co-founder described. It is **not Figma's code**.
- **Setup:**
  - two clients (Ana 40 ms, Ben 60 ms one-way latency; illustrative);
  - one server;
  - one shape with properties `x` and `fill`.
- **Rules implemented (each from the blog):**
  - local edits apply at once (optimistic);
  - the server applies edits in arrival order, keeps the latest value per property, and sends each change to every client;
  - a client discards incoming server changes to a property it has unacknowledged edits for.
- **Edits:**
  - Ana `x = −2` at 0 ms and Ben `x = 2` at 5 ms (the same property, at once);
  - then Ana `fill = amber` at 200 ms and Ben `x = 0` at 202 ms (different properties).
- **Results** (`demo/out/multiplayer-demo.json`):

| check | result |
|---|---|
| server arrival order | Ana x −2 (40 ms) → Ben x 2 (65 ms) → Ana fill amber (240 ms) → Ben x 0 (262 ms) |
| same property, sent at once | **Ben's x = 2 wins**, because it reached the server last; Ana's screen moves to 2 at 105 ms |
| different properties | **both kept**: final x 0 (Ben) and fill amber (Ana) |
| every copy the same at the end | **true** (Ana, Ben and the server: x 0, fill amber) |
| Ben's screen flickers (−2 then back to 2) | **0** with the discard rule; **1** for a naive client that applies every server message |

- **Honesty:** the latencies and values are illustrative; the event logic is real. The renderer stops if these results change. The order in which the shape lands and the card numbers 1 and 2 follow this run.
- In the "different properties" beat the two cards are unnumbered. On screen Ben's card flies first because the narration says "position" before "color"; in the run Ana's arrived first. The order does not change that result.
- The flicker check is in the notes only; it is not on screen.

## Final script (as spoken; 77 words, 29.45 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.50 | Two people drag one shape at once. Why doesn't the file break? |
| L2 | 3.80–5.67 | Figma's co-founder explained the trick. |
| L3 | 5.97–9.63 | Your drag shows on your screen instantly, before the server answers. |
| L4 | 9.88–13.47 | Then every edit goes to the server, which puts them in one order. |
| L5 | 13.77–17.60 | Same property? The last value the server gets wins, everywhere. |
| L6 | 17.85–21.08 | Different properties, like position and color? Both survive. |
| L7 | 21.38–25.95 | Figma says that's not a true CRDT: one server orders every change. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):**
- "Figma" and "Figma's" are not in the misaki lexicon, so they are overridden as `[Figma](/fˈɪɡmə/)` and `[Figma's](/fˈɪɡməz/)`.
- "CRDT" is spelled out letter by letter.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

## Source → claim map (primary/official, read 2026-11-15; quotes checked verbatim against the raw page)
Source: **Figma Blog — "How Figma's multiplayer technology works"**, Evan Wallace (Co-founder, Figma), October 16, 2019. https://www.figma.com/blog/how-figmas-multiplayer-technology-works/

| claim | kind | what the source says |
|---|---|---|
| Figma's co-founder explained the trick | documented | Byline: "Evan Wallace, Co-founder, Figma", October 16, 2019. |
| Your drag shows on your screen instantly, before the server answers | documented | "Property changes on the client are always applied immediately instead of waiting for acknowledgement from the server since we want Figma to feel as responsive as possible." |
| Every edit goes to the server | documented | "We use a client/server architecture where Figma clients are web pages that talk with a cluster of servers over WebSockets." "…updates to that document in both directions are synced over the WebSocket connection." |
| …which puts them in one order | documented | "…we don't need a timestamp because the server can define the order of events." |
| Same property? The last value the server gets wins, everywhere | documented + our model | "A conflict happens when two clients change the same property on the same object, in which case the document will just end up with the last value that was sent to the server." "The eventually consistent value for a given property is always a value sent by one of the clients." Model: Ben's later-arriving x wins on every copy. |
| Different properties, like position and color? Both survive | documented + our model | "…two clients changing unrelated properties on the same object won't conflict…" "Each object has an ID and a collection of properties with values." Model: x 0 and fill amber both kept. Position and colour are our illustrative examples of properties. |
| Figma says that's not a true CRDT: one server orders every change | documented | "Figma isn't using true CRDTs though. CRDTs are designed for decentralized systems where there is no single central authority to decide what the final state should be… Since Figma is centralized (our server is the central authority), we can simplify our system by removing this extra overhead…" plus the order quote above. |

**Illustrative, not claims:**
- the people (Ana, Ben), the shape and canvas, and the arrows and amber;
- the 3D "SERVER" box and the edit cards;
- the latencies;
- the translucent "own screen" copies. They show each person's local view; this is a visual device, not Figma's UI.

**Deliberately not claimed:**
- Figma is never called a CRDT. The video only repeats Figma's "not a true CRDT" and its centralized description.
- The source is from 2019. The notes and caption date it; nothing claims it is the design today.
- The flicker-avoidance rule is modelled but not narrated, to keep one idea per beat.
- Simultaneous typing in the same text box is not covered (the blog says that doesn't merge).
- No performance, user-count or latency figure is claimed. No Tensorblue product feature is implied. No Figma UI or logo is reproduced.

## Storyboard as built (7 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.65 | **1 Hook — frame zero** | Frame 0: a pale design canvas on a 3D bench. One blue shape is stretched both ways: Ana's cyan cursor pulls her translucent copy left and Ben's green cursor pulls his right. **TWO HANDS. ONE FILE.** is already on screen, with a sound on frame 0. On "break?" the tug yanks harder. |
| 3.65–5.82 | **2 The trick** | Pull back; the copies relax into the one shape and a "SERVER" box pops up behind (a little overshoot). |
| 5.82–9.73 | **3 Instant** | On "drag" Ana's copy slides left at once while the file's shape stays put ("INSTANT"). Her edit card (← MOVE, cyan band) pops up above her and waits. |
| 9.73–13.66 | **4 One order** | Ben drags right and his card (→ MOVE, green band) appears. On "edit" both cards fly into the server's two slots, Ana's first ("1"), then Ben's ("2"); the server hops as each lands. "ONE ORDER". |
| 13.66–17.70 | **5 Same property** | "SAME PROPERTY" (both cards pulse). On "last" Ana's card dims and Ben's pulses: "LAST ONE WINS". On "wins" the file's shape slides to Ben's spot; on "everywhere" Ana's copy follows. One shape, everyone agrees. |
| 17.70–21.23 | **6 Different properties** | Ben drags the shape back toward the centre (his copy); Ana repaints it amber (her copy, with a little pop). Their cards (← MOVE, COLOR swatch) dock in the server. On "Both" the file's shape takes both changes, centred and amber: "POSITION ✓", "COLOR ✓". |
| 21.23–26.60 | **7 Payoff** | Wider (slow crane). "NOT A TRUE CRDT" over the server; on "one server" the server hops; kinetic **ONE SERVER, / ONE ORDER.** The shape gives a happy hop on "orders". |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english17-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark in the empty top. **TWO HANDS. ONE FILE.** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/multiplayer_demo.py` + `src/demo/out/multiplayer-demo.json`.

Reused from english-16:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`;
- `mix.py`: heading, seed (20261120) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0. The demo uses only Python's standard library.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-15-english-17/tensorblue-30s-english17-01.mp4` · SHA256 `573bfb165960446adec1bc45e86f2e199061add9c6c5ad402d1476d5ed1045cf` · 3,920,160 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = the shape tugged both ways by Ana's and Ben's cursors + "TWO HANDS. ONE FILE." fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (stills and thumbnail) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 1.9 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 14 groups pass: ink x 144–854, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | Every group starts 0.06 s before Kokoro's word onset and dissolves into the next with no blank frame (checked frame by frame at the 5.9 s hand-off). Whisper puts "before", "everywhere" and "Both" up to 0.57 s earlier. The voice track is silent just before each word (8.05–8.30 s, 16.95 s dip, 19.85–20.15 s), with speech resuming at Kokoro's onset, so those captions are on time. |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | frame zero + wordmark, 4 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 76/77 scripted words matched, WER 1.3 %; mean start drift 0.11 s, max 0.57 s ("before"; see caption sync) (`qa/asr.json`) |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (frames around each change) viewed on the final file. |

**Fixed during QA:**
1. **Scale.** In the first pass the shape, cards and server were too small and the edit cards were unreadable. The canvas was narrowed, the server moved closer, and the cards now dock upright in two slots on the server's front with big arrows and swatches. Every camera was re-set with a projection check.
2. **No source on screen.** A "FIGMA BLOG, 2019" tag was removed; sources stay in the notes and caption.
3. **Cursor labels.** "Ana" and "Ben" overlapped when both cursors were on one shape. Ana's label now sits above her arrow, Ben's below, and Ana's slides aside while Ben's copy passes under it.
4. **Order badges.** "1" and "2" covered the SERVER title; they moved to the server's sides.
5. **Copies.** Each person's translucent copy now appears only where their screen differs from the file, so overlapping copies no longer tint the shape. The recolour uses amber instead of Ana's cyan, so "her colour" and "the new colour" don't blur.
6. **Card exit.** Cards slid through the server's base; they now shrink into their slots.
7. **Caption hand-off.** A one-frame blank appeared between caption groups: a group's end was computed before the next group's 0.06 s lead was applied. Fixed; every group now dissolves straight into the next.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check on three words; no listening check was performed.
- The only ASR mismatch is a doubled "change." at 25.60–25.88 s (p 0.054) inside the final word's own span. The narration has one "change" and the voice track is silent from 25.95 s, so this is a Whisper artefact.
- The source dates from 2019. The video shows the design Figma described then; Figma may have changed details since.
- Ana, Ben, the latencies and every value are illustrative. The model reproduces the described rules; it does not measure Figma.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
