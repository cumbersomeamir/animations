# 27 — Batch `2026-11-14-english-14` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-14-english-14/tensorblue-30s-english14-01.mp4`, thumbnail `…/tensorblue-30s-english14-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-14-english-14/production-notes.md`. All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 14 Nov 2026)
- **Proposed topic:** "Why pressing Pay twice should not charge you twice" — duplicate taps, retry after a network failure, idempotency keys, tactile 3D checkout parcels.
- **History check: duplicate.** Episode 14 (`14-production-30s-feedback-01.md`) was exactly this ("why retrying a payment request should not create another charge — idempotency, with one purchase and one receipt", Stripe docs). english-07 had already declined the same suggestion for this reason.
- **Chosen instead**, per the brief ("select a genuinely different same-genre topic before scripting"): **how a feed can scroll 10,000 posts while the app only keeps a handful of rows**. That is view recycling / list virtualisation (Android RecyclerView, Jetpack Compose lazy lists, iOS cell reuse).
  - Useful, clever app engineering, and new to the channel. No earlier episode covers lists, scrolling or recycling.
  - It suits a tactile 3D treatment: physical rows flying round a phone.
- **Feedback kept:**
  - a useful app-engineering story, not a dry diagram;
  - real 3D depth and fun;
  - the exact current tensorblue.com colours and logo;
  - no distracting moving lines;
  - explain a design, never guarantee every app.
- **Rules applied:** the 2026-11-11 story, pacing and presentation rules at the top of `11-production-format.md`. Thumbnail → hook → super hook → build-up + proof → payoff → CTA; one visual idea at a time; large brief labels; captions inside x 100–900 (house band y 340–520); a separate thumbnail; honest QA.
- **Earlier jobs:** none running. Everything through english-13 had already been committed and pushed. No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` unchanged: captions, kinetic words, one blue wipe, the accepted English CTA card.
  - The original 3D stage `stage3d.mjs` from english-13, unchanged.
  - Node + `@napi-rs/canvas` 1.1.0 only. No Three.js, Blender or paid API.
  - Colours are the tensorblue.com CSS values re-checked 11 Nov 2026: `#3B82F6`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, and surface navies `#050816`, `#08101F`, `#0B1423`.
  - Logo: `assets/brand/tensorblue-logo.svg`.
  - No lines move: the motion is physical row cards, a growing tower and camera moves.

## The real test (`src/demo/list_demo.mjs`; pre-installed Chromium 153 via Playwright, `channel: 'chromium'`)
A phone-sized page (390×844 CSS px, 72 px rows) shows 10,000 made-up posts two ways (`demo/out/list-demo.json`).

| list | rows in the page | notes |
|---|---|---|
| plain list (one DOM row per post) | **10,000** | — |
| our recycling list | **14** | 12 fill the viewport + 1 spare above and below. Never more than 14 at any point while scrolling the whole feed; rows created: 14; re-fills: 10,000; last post shown: 10,000. |

- **One physical row,** followed through the scroll, showed posts **1 → 15 → 29 → 43** (every 14th). That is the "same row, next post" the video shows.
- **Timings** (plain build + layout 83 ms; scrolling the whole recycled feed 318 ms) are from this container only and are not used in the video.
- **Honesty:** the recycling list is our own minimal code (no library). It demonstrates the documented technique; it does not measure any particular app. The renderer reads this file and refuses to render if the counts change.

## Final script (as spoken; 81 words, 29.24 s incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–2.96 | Ten thousand posts. Not ten thousand rows. |
| L2 | 3.26–4.78 | So where do new posts come from? |
| L3 | 5.08–8.73 | Lists built for this only create the rows on screen, plus spares. |
| L4 | 8.98–13.13 | A row that leaves the top isn't destroyed. It's reused for the next post. |
| L5 | 13.38–18.04 | In our test: a plain list, ten thousand rows. A recycling list, fourteen. |
| L6 | 18.34–21.73 | Android says it improves responsiveness and saves power. |
| L7 | 22.03–25.85 | A long feed is just a small loop of rows, refilled as you scroll. |
| L8 | 27.00–29.54 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** "recycling", "responsiveness" and "fourteen" phonemise normally; `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Timing edits from the draft:**
- L1: "The app never built ten thousand rows" → "Not ten thousand rows".
- L5: made crisper.
- L6: "this" → "it".
- Gaps were tightened so the payoff ends at 25.85 s and the CTA starts at 27.0 s.

## Source → claim map (primary/official, read 2026-11-14; quotes checked verbatim against the raw pages)
| claim | kind | source | what it says |
|---|---|---|---|
| Lists built for this only create the rows on screen (plus spares) | documented fact + measured | **Android Developers — Lists and grids (Jetpack Compose)** https://developer.android.com/develop/ui/compose/lists ; **Create dynamic lists with RecyclerView** https://developer.android.com/develop/ui/views/layout/recyclerview ; test | Compose: "using a layout such as Column can cause performance issues, since all the items will be composed and laid out whether or not they are visible. Compose provides a set of components which only compose and lay out items which are visible in the component's viewport." RecyclerView "dynamically creates the elements when they're needed". Test: 12 on screen + 2 spares. |
| A row that leaves the top isn't destroyed; it's reused for the next post | documented fact + measured | RecyclerView page (above); **Apple — UITableView ("Recycling table view cells")** https://developer.apple.com/documentation/uikit/uitableview ; test | "When an item scrolls off the screen, RecyclerView doesn't destroy its view. Instead, RecyclerView reuses the view for new items that have scrolled onscreen." Apple `dequeueReusableCell(withIdentifier:for:)`: "Returns a reusable table-view cell object…". Test: one row showed posts 1, 15, 29, 43. |
| In our test: a plain list, ten thousand rows; a recycling list, fourteen | measured | `demo/out/list-demo.json` | as above |
| Android says it improves responsiveness and saves power | documented claim (attributed) | RecyclerView page | "RecyclerView improves performance and your app's responsiveness, and it reduces power consumption." |
| A long feed is just a small loop of rows, refilled as you scroll | summary of the above | — | — |

**Illustrative, not claims:**
- the phone, the "Feed" screen, the post names, and the flight path round the side;
- the spin, which stands in for a row being re-filled;
- the tower, which stands for the plain list's 10,000 rows (it runs out of frame);
- the "MORE RESPONSIVE" / "SAVES POWER" labels, which repeat Android's own statement and are not measured.

**Deliberately not claimed:**
- Not every app's feed works this way; the line is "lists built for this".
- No speed, memory or battery number is given.
- The narration attributes the responsiveness/power benefit to Android's documentation.
- No Tensorblue product feature is implied. No Android, Apple or other app UI or logo is reproduced.

## Storyboard as built (7 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.14 | **1 Hook** | A phone with a "Feed · 10,000 posts" list scrolling (12 rows on screen); a row already peels off the top and flies out to the side. Kinetic **10,000 POSTS. / NOT 10,000 ROWS.** |
| 3.14–4.94 | **2 Super hook** | 3/4 view: a row lifts off the top, swings round the side and slides back in at the bottom. Kinetic **WHERE FROM?** |
| 4.94–8.83 | **3 On screen + spares** | Front-side view. "12 ON SCREEN" on the rows; on "spares", "+ 2 SPARES" by the rows in flight and entering. |
| 8.83–13.23 | **4 One row, reused** | The scroll slows. A blue row reading **Post 15** leaves the top ("NOT DESTROYED"), flies round the side, spins once and comes back in at the bottom reading **Post 29** ("REUSED"), as the test's row 1 → 15 → 29 → 43. |
| 13.23–18.20 | **5 Proof** | Wide shot. On "a plain list" a row tower rises out of frame beside the phone ("10,000 ROWS"); on "fourteen" the phone's loop is labelled "14 ROWS". |
| 18.20–21.88 | **6 Android** | The tower lowers away. Closer on the running loop: "MORE RESPONSIVE", then "SAVES POWER" (the phone hops). |
| 21.88–26.60 | **7 Payoff** | Slow crane; the loop keeps refilling. Kinetic **SMALL LOOP, / REFILLED.** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

**Thumbnail** (`tensorblue-30s-english14-01-thumbnail.png`, 1080×1920): **10,000 / POSTS. / 14 ROWS.** at 150 px, with the phone feed (Posts 16–28) and the blue Post 15 row flying round the side; small logo + wordmark.

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/list_demo.mjs` + `src/demo/out/list-demo.json`.

Reused from english-13:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs` (x 100–900), `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`;
- `mix.py`: heading, seed (20261117) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0 (npm). Playwright/Chromium are the environment's pre-installed copies, run locally.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-14-english-14/tensorblue-30s-english14-01.mp4` · SHA256 `ac6b5a13b3038c39b1aae56c77e42fbcc9ba2f8a6091e472068c7a8f382d6b7b` · 8,647,185 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.0 LU, **−1.9 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 15 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | every group switches 0.06 s before Kokoro's word onset, and 0.0–0.18 s before the word Whisper hears, except two where Whisper's boundaries are off (below) |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | `tensorblue-30s-english14-01-thumbnail.png`, 4 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | Every scripted word is heard. WER 9.9 % comes from Whisper writing numerals ("10,000 posts", "14") for "ten thousand" / "fourteen", plus one low-confidence "role." (p 0.14) in the pause after "scroll" (`qa/asr.json`). |
| speech timing | aligned | Mean start drift 0.10 s, max 0.65 s on "and" (L6). Whisper starts "and" at 20.02 s, but the voice track is silent from 20.45–20.70 s and speech resumes at ~20.72 s (Kokoro 20.67). "Android" is similar: silence before 18.34 s, RMS 0.137 from 18.34 s. The captions (20.61 s, 18.28 s) are right. |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (4 frames around each of the 7 changes) viewed. |

**Fixed during QA:**
1. **Topic.** The proposed topic was a duplicate (episode 14), so a new one was chosen.
2. **Flight direction.** The first draft ran the side flight backwards (the transit mapping was inverted).
3. **Stamp.** A planned "refill" stamp block would have hidden the cards; it was replaced by a spin, with the new number revealed after the turn. The spin was shortened so the card's back shows only briefly.
4. **Framing.** The phone overlapped the hook's and payoff's kinetic words, and the followed row left the frame at the top. All poses were re-set with a projection check.
5. **Tower.** It first used one 60-unit textured face, which the affine mapping distorted. It is now built from row-sized segments, the growing top shows whole rows, and a soft top fade hides the stage edge while it runs out of frame.
6. **Labels.** "REUSED" covered the card it labelled. The "14 ROWS." thumbnail line overlapped the phone.
7. **Sound.** Per-row clicks were limited to the shots where the flight is the subject.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check on two words; no listening check was performed.
- The recycling list in the test is our own minimal code in a browser page, not an Android or iOS app. The row counts depend on its 844 px viewport and 72 px rows (12 + 2).
- A spinning row is edge-on for one or two frames mid-flip.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
