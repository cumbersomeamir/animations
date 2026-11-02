# 13 — Production round `production-30s-2026-11-02-batch-02` · 30s · 02

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-02-batch-02/tensorblue-30s-production-02.mp4`
(copied to `production/30s/2026-11-02-batch-02/production-notes.md`). Round 01 (`12-production-30s-01.md`, CDN topic) is preserved and was not regenerated.

## Brief (user-authorised)
- **Topic:** Why apps undo a like you just tapped (system design / client architecture: optimistic updates).
- **Format:** one new 30.000 s portrait English explainer, end-to-end export + QA + push.
- **Feedback applied (binding, see `11-production-format.md` feedback log):** replace boiling/moving crosshatch lines; static texture only; clean purposeful UI cutaways with match-cut layers (thumb/heart, pending request card, accept/reject fork, rollback); Tensorblue website palette (`#030610`, `#0D1628`/`#0A172D`, `#0A6CFF`, `#FFFFFF`, `#D8E3F5`, hero gradient `#E8F3FF`/`#91BBFF`/`#85ECED`/`#EDF9FF`); no cream/brown, no ambient moving lines, no generic research diagram; persist the "brand-aligned software cutaway" format; source TanStack Query's optimistic-updates docs.

## Final script (as spoken; 71 words, 22.2 s of speech)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–2.65 | You tap like, and the heart lights up instantly. |
| L2 | 3.30–6.90 | Some apps update the screen before the server confirms the change. |
| L3 | 7.25–9.08 | That's called an optimistic update. |
| L4 | 9.43–12.52 | It feels fast, while the request travels in the background. |
| L5 | 12.87–16.85 | If the server rejects it, the app can roll the heart back and show an error. |
| L6 | 17.80–22.05 | It suits reversible actions, but it's risky where a false success matters. |
| L7 | 23.30–26.42 | Fast feedback and confirmed success are different things. |

**Edits from the draft (77 words; accuracy + timing):**
- "before the server confirms *anything*" → "confirms *the change*" (the docs describe updating before *a mutation* completes; "anything" over-reaches).
- "That is called" → "That's called"; "It makes the interface feel fast" → "It feels fast" (timing).
- "the app *may* roll back the heart" → "the app *can* roll the heart back" (it is a design choice the libraries support, not automatic in every app).
- "It is useful for reversible actions, but risky for actions where a false success matters" → "It suits reversible actions, but it's risky where a false success matters" (timing; same meaning).
- "Fast feedback and confirmed success are different things." unchanged.

## Source → claim map (primary documentation, read 2026-11-02)
| spoken / on-screen claim | source | what it says |
|---|---|---|
| Some apps update the screen before the server confirms the change; that is an optimistic update | **TanStack Query — Optimistic Updates** https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates | "React Query provides two ways to optimistically update your UI before a mutation has completed." The UI variant renders the pending item (opacity 0.5) "as long as the mutation is pending". |
| …same, and the like-button example | **React — `useOptimistic`** https://react.dev/reference/react/useOptimistic | "useOptimistic is a React Hook that lets you optimistically update the UI." Its examples include `setOptimisticLike(true)` while `saveChanges()` is awaited. |
| It feels fast while the request is still in flight | **Apollo Client — Optimistic mutation results** https://www.apollographql.com/docs/react/performance/optimistic-ui | "It's often possible to predict the most likely result of a mutation before your GraphQL server returns it. Apollo Client can use this 'most likely result' to update your UI optimistically, making your app feel more responsive to the user." |
| If the server rejects it, the app can roll the heart back and show an error | TanStack (above); React (above); Apollo (above) | TanStack: "there is a chance that the mutation will fail… you can instead choose to roll back your update" (`onMutate` snapshot → `onError` restore), and can keep showing the item with a Retry button on `isError`. React: if the Action fails, "the UI shows what it showed before the optimistic update. You can catch the error to show a message to the user." Apollo: on a GraphQL error it "discards the optimistic version of the object and rolls back to the previous state." |
| It suits reversible actions, but it's risky where a false success matters | reasoning from the documented mechanism (Apollo "most likely result"; React/TanStack rollback on failure) | The UI shows a predicted result before confirmation, so on failure the user has briefly seen a success that did not happen; that is cheap to undo for a like, costly where users act on the success. No primary doc states a rule for payments; the Payment tile is an illustrative contrast, not a claim about any product. |
| Fast feedback and confirmed success are different things | TanStack (pending/error/settled states) and React ("The optimistic and real state converge… when the Transition completes") | The optimistic state and the confirmed server state are separate and only converge after the request settles. |

**Illustrative, not claims:** "128/129 likes", "Couldn't like post", the Payment tile, and the travel time of the request card. No real app, company, latency figure or failure rate is shown or implied.

## Storyboard as built (one continuous software cutaway; the heart is the constant)
| time (s) | beat | what happens | camera | sound |
|---|---|---|---|---|
| 0–2.8 | **hook** | A post card (abstract hero-gradient art). A finger enters and taps the outline heart at 0.70 s; it fills brand blue instantly with a hero-gradient burst; 128 → 129 likes. | wide → push-in ×1.3 on the heart | swish, tap, pop, sparkle |
| 2.8–7.4 | **setup** | Match cut: the card shrinks into the cutaway as "screen" (outline glows blue on "screen"). A **pending request card** ("like · pending", spinner) is born from the heart and parks; the **server** appears: "not confirmed yet". | pull back to wide | swish, blips |
| 7.4–9.1 | setup → term | A brand-blue chip "optimistic update" pins to the filled heart while the request is still pending. | wide | blip |
| 9.4–12.5 | **mechanism: background** | The request travels down the right-hand route to the server (blue trail); "in the background" label. | wide | long swish, knock on arrival |
| 12.9–14.5 | **mechanism: accept/reject fork** | Two answer routes appear: "accepted ✓" (aqua) and "rejected ×" (white). On "rejects" the server decides: × stamps the card, the accepted route dims. | wide | tick, soft two-step "no" |
| 14.5–16.9 | **rollback** | The rejected answer rides the white route back to the heart; a ↺ arrow wraps the heart as it drains (129 → 128); toast "Couldn't like post". | push-in ×1.42 on the screen card | reverse swish, un-pop, tick, toast |
| 17.2–22.1 | **reversible vs. false success** | Match cut: the card becomes the **Like** tile (heart + aqua ↺, "easy to undo" ✓); the **Payment** tile slides in: "Send" → "Sent ✓" too early → dashed outline + "!" on "false success" → "Confirming…" + "wait for the server" on "matters" ("hard to undo"). | pull back to wide | swishes, tap, blip, soft warn, tick |
| 22.2–23.3 | bridge | Tiles collapse into one big heart (reset to outline); the finger returns and taps it again (callback to the hook). | wide | swish, tap, pop, sparkle |
| 23.3–26.4 | **takeaway** | Two lanes: **feedback** (blue heart at the tap) and **confirmed** (spinner → aqua ✓ later); the big heart's badge switches pending → ✓; bracket "not the same moment" on "different". | slow push-in | lane draws, confirm |
| 26.4–28.8 | hold | Aqua confirmation ring after the last word; still frame (no ambient motion). | slow push-in | chime in the pause, music lift |
| 28.8–30.0 | **end** | Caption clears; "Tensorblue" + brand-blue dot in the caption band. | settle | soft sparkle, final F chord |

## Provenance and licences
| item | source | licence / note |
|---|---|---|
| All drawing, layout, animation, score, SFX | original code in `production/30s/2026-11-02-batch-02/src/` | original work for Tensorblue |
| Art direction | Animate → Crosshatch STYLE.md (`cth9191/animate` @ `7e5eb56`) + user feedback (batch 02) | read-only instructions; no code copied or executed |
| Palette | Tensorblue website palette as supplied by the user (observed 2026-11-02) | user-approved brand colours |
| Font | Inter 4.0 Medium/SemiBold/Bold (`assets/fonts/inter/`, from Debian `fonts-inter` 4.0+ds-1 of rsms/inter); sha256 SemiBold `bd68706b…a593e`, Medium `1e65171f…97ba`, Bold `00fd6f46…1c49` | SIL OFL 1.1 (`OFL.txt`, `debian-copyright.txt`) |
| Narration | Kokoro-82M (`hexgrad/Kokoro-82M` rev `f3ff357`, cached, run offline), `af_bella`×0.7 + `am_puck`×0.3, speed 0.98, en-us | Apache-2.0; synthetic voice, no imitation of a real person |
| Runtime reused | Python 3.12 venv (kokoro 0.9.4, misaki 0.9.4, torch 2.15.0 CPU, faster-whisper 1.2.1), `@napi-rs/canvas` 1.1.0 | same pinned versions as round 01 |
No paid APIs, subscriptions, Blender, secrets, other apps' assets or the old `abbu-kbc-gift` repo were used.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-02-batch-02/tensorblue-30s-production-02.mp4` · SHA256 `542bae53caa94c17193740c78b93dd91631d1615f59484bcdc617974087fa969` · 12,954,180 bytes. Reports in `production/30s/2026-11-02-batch-02/qa/`.

| gate | target | result |
|---|---|---|
| video | H.264, 1080×1920, 30 fps, yuv420p | h264 **High**, 1080×1920, 30/1, yuv420p, ~3.25 Mb/s (CRF 18, cap 12 Mb/s; static texture compresses well), `+faststart` |
| frames | exactly 900 | `nb_frames=900`; decoded count `nb_read_frames=900` |
| duration | exactly 30 s | video 30.000000 s, audio 30.000000 s, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC, 48000 Hz, 2 ch stereo, ~194 kb/s |
| whole-file decode | no errors | `ffmpeg -v error … -f null -` printed nothing |
| loudness (exported AAC) | −14 to −16 LUFS | **−15.5 LUFS**, LRA 3.6 LU |
| true peak | ≤ −1 dBTP | **−1.8 dBTP** |
| captions | ink y 350–470, margins ≥ 80 px, ≤ 2 lines | all 11 groups pass: ink y 357–463, x 174–905 (≥ 174 px margins); signature y 388–432 |
| top 0–300 / caption band | unobstructed | 0 differences vs background-only render in 90 sampled frames; world never paints into y 300–470 |
| intelligibility (one ASR pass, final MP4) | — | faster-whisper base.en: **WER 0.0** (71/71 words); lowest confidence "like," 0.45 (recognised correctly) |
| timing | captions follow speech | Kokoro word timings drive captions (0.06 s lead). Whisper starts average 0.11 s earlier; largest −0.51 s on "while", −0.48 "are", −0.44 "actions" — words after a pause, where Whisper's boundary absorbs the silence (same bias seen in round 01), not a sync error |
| audio balance | voice upfront | during speech: music ≈ 20 dB and SFX ≈ 19 dB under the voice; 0 clipped samples; mix regenerates bit-identically |
| visual review | contact sheet + transitions | `qa/contact-sheet-1fps.png` and `qa/transitions.png` (20 frames across every match cut) viewed; full-resolution crops sharp |

**Fixed during QA:** cutaway first sat in the upper-left with an empty lower half (re-laid out as a vertical flow screen → request → server → answers back to the heart); "like" and "pending" collided in the request card (wider card); the Like tile's panel covered the heart (draw order); zero-length round-cap dots and an un-drawing reject arc left stray marks in the tile transition (guard + fade instead of un-draw).

**Known limits (honest):**
- I cannot hear audio. Intelligibility is verified by ASR on the final export (WER 0); balance by stem measurements, loudness meters and true-peak checks. A human listen before posting is still advised.
- The "risky where a false success matters" line is reasoning from the documented mechanism; I found no primary/institutional source that states it as a rule (only practitioner blogs), so it is not presented as a statistic or standard.
- Small UI labels in the cutaway (26–30 px: "pending", "not confirmed yet", "in the background") are readable on a phone but are the smallest text in the piece.
- The tile and lane transitions are short crossfades with the heart moving across; they read as match cuts in motion but look busy on single frames.
- Frame 0 shows the post card before the finger arrives; the tap happens at 0.70 s.
- Not posted anywhere by Claude; posting handles are not recorded.
