# 25 — Batch `2026-11-11-english-12` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-11-english-12/tensorblue-30s-english12-01.mp4`, thumbnail `…/tensorblue-30s-english12-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-11-english-12/production-notes.md`. All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 11 Nov 2026)
- **Topic:** why an app can keep working after you lose the internet.
- **Feedback:** a clever app-engineering story, not a dry paper/repository diagram.
  - Real 3D depth and some fun.
  - Exact current tensorblue.com colours and logo; no distracting moving lines.
  - Hook: a connection cable disappears but an edit still works, "OFFLINE. STILL WORKING."
  - Build through a tactile miniature 3D phone/workbench: local copy stores changes → queue waits → reconnect syncs → conflicting edits need a rule.
  - Ground it in a documented real example or a clearly generic model; imply no Tensorblue app features.
  - Payoff: local-first design in everyday terms. One concept, not a jargon inventory.
- **Rules applied:** the approved 2026-11-11 story, pacing and presentation rules, first used this round (now at the top of `11-production-format.md`):
  - thumbnail → hook → super hook → build-up + proof → payoff → CTA;
  - one visual idea at a time;
  - large, brief labels;
  - captions inside x 100–900 (house band y 340–520, centred x 500);
  - a separate vertical thumbnail;
  - honest QA.
- **History check:** not a duplicate. The nearest episodes are:
  - "why apps undo a like you just tapped" (optimistic updates rolled back by the server);
  - english-08 "why a deleted photo can still appear on another device" (sync of deletions vs backups).
  This one is about working *offline* (a local primary copy and a queue of pending changes) and what happens to two offline edits of the same item on reconnect. New visual world: a 3D workbench, not 2D cards.
- **Earlier jobs:** none running. Everything through english-11 had already been committed and pushed. No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` unchanged: captions, kinetic words, the blue wipe, the accepted English CTA card.
  - This round adds `stage3d.mjs`, an original ~130-line 3D stage. It has a perspective camera, lit box faces, textured faces, soft contact shadows, cable tubes and a floor spotlight.
  - Node + `@napi-rs/canvas` only: no Three.js, no Blender, no paid API.
  - Colours are the tensorblue.com CSS values re-checked 11 Nov 2026: `#3B82F6`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, and surface navies `#050816`, `#08101F`, `#0B1423`.
  - Logo: `assets/brand/tensorblue-logo.svg`, byte-identical to the site's.
- **No moving lines:** there are no network lines, particles, rings, connector lines or grid motion. The only lines are two physical 3D cables that are part of the story (unplug, plug back in). They are static except when unplugged or reconnected. They glow blue while data moves and dim to navy when idle.

## The real sync demo (`src/demo/sync_demo.mjs`; Automerge 3.5.0, MIT, npm `@automerge/automerge`)
A made-up shopping list `["bread"]` is copied from a server document to Phone A and Phone B, each with its own actor ID.

**Offline (each phone edits its own copy):**
- A adds "milk" and renames "bread" → "rye bread".
- B adds "eggs" and renames "bread" → "brown bread".
- The server still has `["bread"]`.
- Changes the server has not seen (`getChanges`): **A = 2, B = 2**. This is the "queue · 2 waiting" in the video.

**Back online:** the server merges A, then B; both phones merge the server's copy. Result on **all three copies: `["brown bread", "eggs", "milk"]`**, with identical heads (`all_copies_identical: true`).
- Both additions are kept.
- The two renames of the same item are a conflict. Automerge's rule shows **one** value ("brown bread") the same way on every copy, and keeps the other ("rye bread") in its conflicts object (`values_kept: ["rye bread", "brown bread"]`).

The renderer reads `demo/out/sync-demo.json` and refuses to render if these results change.

## Final script (as spoken; 85 words, 29.25 s incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–2.45 | No internet. The edit still saves. |
| L2 | 2.75–5.95 | Now two phones change the same list offline. Who wins? |
| L3 | 6.29–10.53 | Apps built for this keep a copy of your data on the phone and save there first. |
| L4 | 10.83–12.08 | Each change waits in a queue. |
| L5 | 12.38–14.74 | Back online, the queue syncs through the server. |
| L6 | 15.04–20.85 | Additions merge. If both changed the same item, a rule picks one, the same on every copy. |
| L7 | 21.20–26.40 | That's local-first: the main copy lives on your phone; servers just keep copies in sync. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** local-first, syncs, and the accepted `[Tensorblue](/tˈɛnsəɹblˌu/)` override.

## Source → claim map (primary/official, read 2026-11-11)
| claim | kind | source | what it says |
|---|---|---|---|
| Apps built for this keep a copy of your data on the phone and save there first | documented fact (generic) | **Firebase docs — Access data offline (Cloud Firestore)** https://firebase.google.com/docs/firestore/manage-data/enable-offline | Offline persistence "caches a copy of the Cloud Firestore data that your app actively uses"; "You can write, read, listen to, and query the cached data on mobile devices or in a web browser." |
| Each change waits in a queue | documented fact | same Firebase page | "Write operations are queued until network access is re-enabled." |
| Back online, the queue syncs through the server | documented fact | same Firebase page | When the device is back online, "Cloud Firestore synchronizes any local changes made by your app to the Cloud Firestore backend." |
| Additions merge | measured (our demo) | demo; **Automerge docs — Conflicts** https://automerge.org/docs/reference/documents/conflicts/ | In the demo, both offline additions are present on every copy after sync. Automerge resolves concurrent edits automatically except concurrent updates to the same property. |
| If both changed the same item, a rule picks one, the same on every copy | documented fact + measured | Automerge Conflicts page; same Firebase page; demo | Automerge: "The only case Automerge cannot handle automatically" is concurrent updates to the same property; it picks a winner — "the choice is arbitrary, but deterministic and equal across both documents"; the losing values "are merely relegated to a conflicts object… the other values are not lost." Firebase: "For multiple changes to the same document, it's last write wins." Demo: every copy shows "brown bread". |
| Local-first: the main copy lives on your phone; servers just keep copies in sync | documented definition | **Kleppmann, Wiggins, van Hardenberg, McGranaghan — "Local-First Software: You Own Your Data, in spite of the Cloud"**, Onward! '19 https://martin.kleppmann.com/papers/local-first.pdf | "we treat the copy of the data on your local device — your laptop, tablet, or phone — as the primary copy. Servers still exist, but they hold secondary copies of your data in order to assist with access from multiple devices." Section 2.3 "The Network Is Optional". |
| No internet. The edit still saves. | illustrative (hook) | Firebase page above; background: **Google Docs Editors Help — Use Google Docs, Sheets & Slides offline** https://support.google.com/docs/answer/6388102 | Shown with our generic "Groceries" app. Firebase documents offline writes. Google's help says "If you aren't connected to the internet, you can still create, view, and edit files". It is background only and not named in the video. |

**Illustrative, not claims:**
- the "Groceries" app, both phones, the server box, the list items;
- the drawer, the tray and the RULE stamp, which are physical metaphors for local storage, the pending-change queue and the conflict rule;
- the cable glow.

**Deliberately not claimed:**
- No specific product is said to work this way. The video says "apps built for this", not "all apps".
- The rule is never called "the latest edit wins". Firestore documents last-write-wins, but Automerge's choice is deterministic by internal operation ID, so the video says only "a rule picks one".
- The losing value is shown set aside on the bench, not destroyed, because Automerge keeps it in a conflicts object. No Tensorblue product feature is implied.

## Storyboard as built (8 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–2.66 | **1 Hook** | Phone A on the bench, plugged into the server. From 0.3 s the cable unplugs and slithers back into the server; the chip flips ONLINE → OFFLINE. "milk" is typed, "✓ Saved". Kinetic **OFFLINE. / STILL WORKING.** |
| 2.66–6.09 | **2 Super hook** | The camera pulls back; Phone B drops onto the bench beside it ("Phone A", "Phone B" labels). Both edit the same list offline: rye bread / brown bread, + milk / + eggs. Kinetic **WHO WINS?** |
| 6.09–10.63 | **3 Local copy** | Front-left camera on Phone A. A drawer slides out from behind the phone, a sheet with the list ("rye bread / milk") drops in ("LOCAL COPY"), the drawer shuts on "save there first", "✓ Saved". |
| 10.63–12.28 | **4 Queue** | Down onto a blue tray: the two changes land in slots, "QUEUE · 2 waiting". |
| 12.28–14.84 | **5 Reconnect** | Wide shot: both cables plug back in (glowing), phones go ONLINE, all four change cards arc over the phones to the server ("SYNC"). |
| 14.84–19.71 | **6 Merge + rule** | The camera dollies over the phones onto the server. "+ milk" and "+ eggs" drop in; the server's list gains eggs and milk. The two bread edits step forward and turn blue. A **RULE** stamp drops in and presses "brown bread" into the server; "rye bread" slides aside onto the bench. |
| 19.71–21.00 | **7 Same everywhere** | The camera pulls back to the question's two-phone framing: both phones and the server flash the same list ("SAME ON EVERY COPY"). |
| 21.00–26.60 | **8 Payoff** | Slow crane over the whole bench, kinetic **LOCAL-FIRST**. On "main copy … phone" the phones hop ("MAIN COPY: ON YOUR PHONE"); on "servers" the server hops and the cables glow ("SERVER: KEEPS COPIES IN SYNC"). |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

**Thumbnail** (`tensorblue-30s-english12-01-thumbnail.png`, 1080×1920): **OFFLINE. / STILL / WORKING.** at 150 px, Phone A showing "OFFLINE · ✓ Saved", the server and the unplugged cable end, small logo + wordmark.

## Provenance and licences
New this round:
- `src/stage3d.mjs`, `src/scene.mjs`, `src/thumb.mjs`;
- `src/demo/sync_demo.mjs` + `src/demo/out/sync-demo.json`.

Reused from english-11:
- unchanged: `brt.mjs`, `render.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`;
- `qa.mjs`: caption bounds tightened to x 100–900;
- `asr.py`: clip window capped at the file length, because the CTA now ends at 29.55 s;
- `mix.py`: only the heading, seed (20261115) and a 9-chord shot score changed.

Licences and assets:
- Dependencies are pinned in `src/package.json` and `requirements-audio.txt`.
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Automerge 3.5.0 (MIT), run locally.
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files. No third-party app UI or logo is reproduced.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-11-english-12/tensorblue-30s-english12-01.mp4` · SHA256 `cef3d9d3b78b77930e2f3b3adc2c58c5e2fe478c5d483fc610ddc1d488519dac` · 5,541,979 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.4 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 14 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | every group switches 0.0–0.26 s before the word Whisper hears (0.06 s before Kokoro's onset) |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | `tensorblue-30s-english12-01-thumbnail.png`, 3 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 82/85 scripted words matched, WER 4.65 %. The differences are listed under "Known limits". |
| speech timing | aligned | mean start drift 0.09 s, max 0.49 s |
| shots / transitions | one idea at a time, purposeful moves | 8 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (4 frames around each of the 8 changes) viewed. |

**Fixed during QA:**
1. **Layout.** In the first layout the server hid behind Phone B, the hook phone collided with "STILL WORKING.", "Groceries" was cut by the status chip, and labels overlapped the kinetic words. The bench was rebuilt (server centred between the phones; phone B drops in on "two phones"), and every camera pose was set with a projection check so nothing meaningful sits above y 540 or under the caption band.
2. **Merge shot.** The merge cards hid the server's list, and the foreground phones were cropped. It became an overhead dolly with additions in front, the conflict pair behind, and then the RULE stamp.
3. **Cables.** They dominated the merge shot, so they now dim when idle.
4. **Copy.** Two stacked cards in the drawer were unreadable; they became one list sheet facing the camera.
5. **Thumbnail.** The logo overlapped the wordmark; the wordmark is now measured and centred.
6. **ASR.** The window ran past the end of the file and crashed faster-whisper; it is now capped at the file length.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed.
- ASR heard:
  - "save **their** first" for "there" (homophone);
  - "If both **change** the same item" for "changed" (the /d/ before "the" is probably elided; caption and script say "changed");
  - "local first" and "TensorBlue" (tokenisation);
  - two near-zero-confidence tokens at the very end: "Early." (p 0.008, overlapping the tail of "simply") and "8" (p 0.002, after the narration ends at 29.55 s). They are treated as Whisper artefacts, not speech.
- The groceries app is generic. Real apps' conflict rules differ: Firestore uses last-write-wins, Automerge a deterministic pick that keeps the other value.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
