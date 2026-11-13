# 26 — Batch `2026-11-13-english-13` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-13-english-13/tensorblue-30s-english13-01.mp4`, thumbnail `…/tensorblue-30s-english13-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-13-english-13/production-notes.md`. All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 13 Nov 2026)
- **Topic:** how an app can undo a mistake after the screen has changed.
- **Brief:** a tactile 3D phone "time-machine" workbench.
  - An action leaves a reversible history entry (or snapshot), and undo restores or inverts the state.
  - History is limited, and irreversible external actions may not undo.
  - One concrete example: moving a card, then recovering it.
- **Feedback kept:**
  - a useful app-engineering story, not a dry research diagram;
  - real 3D depth and fun;
  - the exact current tensorblue.com colours and logo;
  - no distracting moving lines.
- **Rules applied:** the 2026-11-11 story, pacing and presentation rules at the top of `11-production-format.md`. Thumbnail → hook → super hook → build-up + proof → payoff → CTA; one visual idea at a time; large brief labels; captions inside x 100–900 (house band y 340–520); a separate thumbnail; honest QA.
- **History check:** not a duplicate.
  - The nearest episode is 13 ("why apps undo a like you just tapped"). That one is about optimistic updates: the *app* rolls back a like after the *server* rejects it.
  - This episode is about *user-initiated* undo: a history of entries, replayed in reverse, with a limit, and actions that leave the app.
  - Episode 13's payment "false success" tile is not reused here; the external-action example is email. The prior subject (english-12, offline/local-first) is not reused, and no narration is reused.
- **Earlier jobs:** none running. Everything through english-12 had already been committed and pushed. No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` unchanged: captions, kinetic words, one blue wipe, the accepted English CTA card.
  - The original 3D stage `stage3d.mjs` from english-12, with one addition: a bottom face, so an entry tile can physically flip over to its reversed side.
  - Node + `@napi-rs/canvas` 1.1.0 only. No Three.js, Blender or paid API.
  - Colours are the tensorblue.com CSS values re-checked 11 Nov 2026: `#3B82F6`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, and surface navies `#050816`, `#08101F`, `#0B1423`.
  - Logo: `assets/brand/tensorblue-logo.svg`.
  - No lines of any kind move: no cables, networks, particles or rings. The motion is physical tiles, a flip, a door shutter and camera moves.

## The demo (`src/demo/undo_demo.mjs`; our own minimal model, no dependencies)
An illustrative model of the documented design, not any app's code:
- each change records how to revert it (as Apple's UndoManager documents);
- `undo()` reverts the newest entry;
- the history has a level cap.

Results (`demo/out/undo-demo.json`):
- Board To do [Invoice, Slides], Done [Logo]. Moving Invoice to Done records the entry **{card: Invoice, from: To do #1, to: Done #2}**.
- The user then navigates to Calendar. Navigation is not a data change, so it is not recorded.
- Undo → To do [Invoice, Slides], Done [Logo]: **restored exactly**, with Invoice back at position 1.
- Limit: with a cap of 100 (Office's documented default), 101 changes leave **100 undos possible**. The first change can no longer be undone (oldest dropped: 1).
- Send window (simulated clock, 5 s, Gmail's shortest option): cancelling at 3 s stops it; at 6 s it has been sent. The send is not part of the undo history.

The renderer reads this file and refuses to render if these results change.

## Final script (as spoken; 81 words, 29.25 s incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.36 | Wrong card. The screen moved on. Undo brings it back. |
| L2 | 3.66–4.82 | How does the app remember? |
| L3 | 5.17–8.96 | Every change saves an entry: which card, where it was, where it went. |
| L4 | 9.21–12.07 | Undo takes the newest entry and runs it backwards. |
| L5 | 12.32–16.55 | History is limited: Office keeps the last hundred actions by default. |
| L6 | 16.85–20.94 | Actions that leave the app are harder: Gmail's Undo Send lasts seconds. |
| L7 | 21.29–25.92 | Undo is a short history played in reverse: use it soon, before you hit send. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- "Gmail's" is not in the misaki lexicon (it phonemised as ❓), so it is overridden as `/ʤˈimˌAlz/`.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.
- "Undo", "Office" and "backwards" phonemise normally (checked).

**Timing edits from the draft (85 → 81 words):**
- Dropped "still", "So", "and" and "only".
- Shortened L3–L7, so the payoff ends at 25.92 s and the CTA starts at 27.0 s.

## Source → claim map (primary/official, read 2026-11-13; quotes checked verbatim against the raw pages)
| claim | kind | source | what it says |
|---|---|---|---|
| Every change saves an entry (which card, where it was, where it went) | documented design + our model | **Apple Developer Documentation — UndoManager** https://developer.apple.com/documentation/foundation/undomanager | "A general-purpose recorder of operations that enables undo and redo." "You specify the name of the object that's changing (or the owner of that object) and provide a closure, method, or invocation to revert its state." |
| Undo takes the newest entry and runs it backwards | documented design + measured (our demo) | Apple (above); **Redux docs — Implementing Undo History** https://redux.js.org/usage/implementing-undo-history | Apple: "After you register an undo operation, you can call undo() on the undo manager to revert to the state of the last undo operation." Redux (the snapshot variant): to undo, "Remove the *last* element from the `past`" and "Set the `present` to the element we removed". Demo: the board is restored exactly. |
| History is limited: Office keeps the last hundred actions by default | documented fact | **Microsoft Support — Undo, redo, or repeat an action** https://support.microsoft.com/en-us/office/undo-redo-or-repeat-an-action-84bdb9bc-4e23-4f06-ba78-f7b893eb2d28 ; Apple `levelsOfUndo` | "Excel and all other Office programs have a default undo/redo maximum of 100 actions." "By default Office saves the last 100 undoable actions". Apple: `levelsOfUndo` is "The maximum number of top-level undo groups the undo manager holds." |
| …the oldest drops off | measured (our demo) + documented wording | demo; Microsoft "the last 100" | Demo: 101 changes with a cap of 100 → 100 undos, the first change is gone. |
| Actions that leave the app are harder: Gmail's Undo Send lasts seconds | documented fact | **Gmail Help — Send or unsend Gmail messages** https://support.google.com/mail/answer/2819488 | "If you decide you don't want to send an email, you have a short time after to cancel it." "Next to "Undo Send," select a Send cancellation period of 5, 10, 20, or 30 seconds." (On screen: "UNDO SEND: 5–30 s".) |
| Wrong card… the screen moved on… undo brings it back | illustrative (hook) | our model; Apple (above) | A generic Tasks board. Undo works on the recorded change, not on what is currently on screen. |

**Illustrative, not claims:**
- the Tasks/Calendar/mail screens, card names and the older history entries;
- the HISTORY machine, the OUT door, the shrinking window slab and the stack height. The stack shows about 10 tiles, not 100: the number is in the label and the voice.

**Deliberately not claimed:**
- Gmail's help does not say *how* Undo Send works internally, so the video does not say it "delays" sending. It says only that the window lasts seconds (5–30 s, as documented).
- The video does not say every app has undo or that all apps keep 100 steps. The 100 is Office's documented default, and Apple's limit is configurable.
- No Tensorblue product feature is implied. Microsoft, Gmail and Apple UI or logos are not reproduced.

## Storyboard as built (7 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.51 | **1 Hook** | A phone with a Tasks board; beside it, the HISTORY machine. On "Wrong card" Invoice jumps from To do to Done, and a small entry tile hops out of the phone onto the stack. On "screen moved on" the screen slides to Calendar. On "Undo" the ↶ button is pressed, the tile hops back into the phone, the board returns and Invoice glides home ✓. Kinetic **WRONG CARD. / UNDO.** |
| 3.51–4.97 | **2 Super hook** | Pull back to the whole set. Kinetic **HOW DOES IT / REMEMBER?** |
| 4.97–9.01 | **3 The entry** | A "REPLAY" chip on the screen; the move happens again. An entry tile prints out of the phone and lands on the stack ("HISTORY ENTRY"). Its face highlights **Invoice** → **To do** → **Done** on "which card / where it was / where it went". |
| 9.01–12.12 | **4 Undo** | The newest tile lifts off the stack ("NEWEST"), flips over to its blue reversed side "Invoice · Done → To do", tilts to camera and runs into the phone ("RUN BACKWARDS"). Invoice glides back to To do ✓. |
| 12.12–16.66 | **5 Limit** | Low camera on the stack. Four newer entries land quickly ("OFFICE: LAST 100"); then one more lands and the oldest tile at the bottom slides out and fades ("OLDEST DROPS OFF"). The stack settles by one. |
| 16.66–21.09 | **6 Leaves the app** | The phone shows a generic "New email" and Send is tapped ("Sending…"). An "Invoice" envelope flies over to the OUT door ("LEAVES THE APP") and waits in the doorway while a blue window slab drains ("UNDO SEND: 5–30 s"). Then it goes through and a SENT shutter drops; the button reads "Sent". |
| 21.09–26.60 | **7 Payoff** | Wide crane over the bench. Kinetic **SHORT HISTORY / IN REVERSE.** while the top entries flip over in a cascade like a rewind, then **UNDO SOON.**; the phone hops on "soon" and the door on "send". |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

**Thumbnail** (`tensorblue-30s-english13-01-thumbnail.png`, 1080×1920): **WRONG / CARD? / UNDO.** at 150 px, with the Tasks board, the blue reversed entry tile "Invoice · Done → To do", the HISTORY stack, and a small logo + wordmark.

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/undo_demo.mjs` + `src/demo/out/undo-demo.json`.

Reused from english-12:
- unchanged: `brt.mjs`, `render.mjs`, `qa.mjs` (x 100–900), `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`;
- `stage3d.mjs`: bottom face added;
- `mix.py`: heading, seed (20261116) and an 8-chord shot score.

Dependencies:
- `package.json` drops Automerge and keeps only `@napi-rs/canvas` 1.1.0 (npm).
- Python dependencies are pinned in `requirements-audio.txt`.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-13-english-13/tensorblue-30s-english13-01.mp4` · SHA256 `d7c37bfba58ea0ff51d3ad26ebe94f8e42a6a4c5fdbf70a656d3dc020e2f712d` · 5,282,359 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.1 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 13 groups pass: ink x 130–872, y 372–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | every group switches 0.06 s before Kokoro's word onset. Where Whisper differs, the voice track decides (see below). |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | `tensorblue-30s-english13-01-thumbnail.png`, 3 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 79/81 scripted words matched, WER 3.7 % (`qa/asr.json`). Differences are under "Known limits". |
| speech timing | aligned | Mean start drift 0.12 s. Max 1.14 s on "Follow": Whisper stretched it back over the silent gap. The voice track's RMS is 0.0000 from 25.90–26.95 s and 0.119 from 26.95–27.15 s, so "Follow" really starts at 27.0 s, as captioned. "Office" (Whisper +0.31 s) and "Actions" (+0.30 s) are the same case: silence before, speech from 13.80 and 16.85 s. |
| audio identity | ASR-checked audio = final audio | The last fix was visual only. The final file's audio-stream MD5 equals the ASR-checked export (`001125d6…`), and the SFX list is unchanged. |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (4 frames around each of the 7 changes) viewed on the final file. |

**Fixed during QA:**
1. **Framing.** In the first layout the OUT door sat behind the history stack and peeked into the hook. "REMEMBER?" and "IN REVERSE." overlapped the phone, and the hook's entry tile arced through the kinetic words. The door moved right/back, every camera pose was re-set with a projection check, and the hook tile now hops low from the phone's side.
2. **Labels.** Older history entries included "+ Invoice", which could be confused with the example card; they were renamed. The "NEWEST" tag covered the lifted tile.
3. **Flipped tile.** The blue reversed side was readable but at a grazing angle, so the tile now tilts to camera.
4. **Oldest entry.** It first slid toward the camera and out of frame, then hid behind the stack; it now slides out the far side and fades. The "OFFICE: LAST 100" tag covered the arriving 101st entry, so it now clears just before.
5. **Send button.** It read "Sent" during the undo window; it now reads "Sending…" until the shutter drops.
6. **Flying tiles.** Entry tiles, the newer entries and the envelope were seen edge-on in flight and read as thin bars (lines). They now tilt their faces to camera while flying, with lower arcs.
7. **Pronunciation.** misaki had no phonemes for "Gmail's", so an override was added. A wide caption ("Every change saves an entry:") was split.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed.
- ASR heard:
  - "**Gmails** Undo send" (apostrophe tokenisation, p 0.51);
  - "**last** seconds" for "lasts seconds" (the final s runs into "seconds"; caption and script say "lasts");
  - "TensorBlue" (tokenisation);
  - an "And" at p 0.091 overlapping the end of "send" at 25.66 s, treated as a Whisper artefact (the voice track is silent from 25.90 s until "Follow").
- The Tasks app, the history machine and the OUT door are illustrations. The stack shows about 10 tiles while the label and voice give Office's documented 100. Real apps differ: Apple's limit is configurable, and Gmail's window is 5–30 s as the user sets it.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
