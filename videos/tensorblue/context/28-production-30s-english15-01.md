# 28 — Batch `2026-11-15-english-15` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-15-english-15/tensorblue-30s-english15-01.mp4`, thumbnail `…/tensorblue-30s-english15-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-15-english-15/production-notes.md`. All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 15 Nov 2026)
- **Topic:** "Your app says saved but the power just went out". Write-ahead logs and durability: a tangible notebook/receipt recorded before the final database update; recovery replays committed work. Distinguish transaction durability settings, and present the illustrative app without universal guarantees.
- **New standing rule — frame zero is critical** (now in `11-production-format.md`):
  - no logo intro, fade from black or empty setup;
  - frame 0 is a composed, surprising subject, readable on a phone, with at most 2–5 truthful curiosity words;
  - it works as the thumbnail;
  - hook audio starts at once and promises a specific useful answer that the episode delivers.
- **Brief for frame 0:** a SAVE badge interrupted by a blackout, with "WAS IT REALLY SAVED?".
- **Feedback kept:**
  - a useful app-engineering story, not a dry diagram;
  - real 3D depth and fun;
  - the exact current tensorblue.com colours and logo;
  - no distracting moving lines;
  - an attractive, simple workbench.
- **History check:** not a duplicate. No earlier episode covers durability, write-ahead logs, journaling or crash recovery. The nearest are english-12 (offline local-first: local copies and sync) and english-13 (undo history). Neither is about surviving a crash or power loss. No narration is reused.
- **Earlier jobs:** none running. Everything through english-14 had already been committed and pushed. No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. Narration starts at 0.10 s. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` unchanged: captions, kinetic words, one blue wipe, the accepted English CTA card.
  - The original 3D stage `stage3d.mjs` from english-14, unchanged.
  - Node + `@napi-rs/canvas` 1.1.0 only. No Three.js, Blender or paid API.
  - Colours are the tensorblue.com CSS values re-checked 11 Nov 2026: `#3B82F6`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, `#0A6CFF`, and surface navies `#050816`, `#08101F`, `#0B1423`. A first draft used a red battery fill; it was replaced with ink to stay on palette.
  - Logo: `assets/brand/tensorblue-logo.svg`.
  - No lines move: the motion is physical slips, a drawer, a switch, lighting changes and camera moves.

## The real test (`src/demo/wal_demo.py`; Python 3.13 stdlib `sqlite3`, SQLite 3.53.1)
Setup: `journal_mode=WAL`, `synchronous=FULL`, `wal_autocheckpoint=0`, so the main file is only updated at an explicit checkpoint ("later"). A child process commits "Pay rent Fri" and "Call Sam", begins "Buy milk" without committing, then is killed with SIGKILL (exit by signal 9). Results (`demo/out/wal-demo.json`):

| check | Pay rent Fri | Call Sam | Buy milk (uncommitted) |
|---|---|---|---|
| in the main database file right after the crash | no | no | no |
| in the `-wal` log right after the crash | **yes** | **yes** | no |
| present after reopening | **yes** | **yes** | **no** |
| in the main file after `wal_checkpoint(TRUNCATE)` | yes | yes | no |

**Honest scope:** this is an application crash, not a power cut.
- SQLite's docs say "Transactions are durable across application crashes regardless of the synchronous setting or journal mode". Power loss is where the sync setting matters (see the source map).
- The renderer reads this file and refuses to render if these results change.

## Final script (as spoken; 85 words, 29.45 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.29 | It said saved. Then the power died. Is your note still there? |
| L2 | 3.59–5.50 | Good databases write it down first. |
| L3 | 5.80–9.24 | Each change goes into a log on disk, then the app says saved. |
| L4 | 9.49–13.79 | The main file is updated later. After a crash, the log is replayed. |
| L5 | 14.09–18.57 | In our test, SQLite crashed mid-save. Both committed notes came back. |
| L6 | 18.82–22.19 | Faster settings can lose the last few commits in a power cut. |
| L7 | 22.44–26.27 | So saved means logged. For data you can't lose, keep full sync. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- "SQLite" is not in the misaki lexicon (❓), so it is overridden as `/ˌɛskjuˌɛlˈIt/` ("ess-cue-ell-ite").
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.
- "replayed", "sync" and "databases" phonemise normally.

**Timing edits from the draft (91 → 85 words):**
- L5 dropped "the unfinished one didn't". The on-screen label "UNFINISHED: GONE" carries that fact.
- L7 dropped "on".
- The lead was 0.1 s (immediate hook audio) and gaps were tightened.

## Source → claim map (primary/official, read 2026-11-15; quotes checked verbatim against the raw pages)
| claim | kind | source | what it says |
|---|---|---|---|
| Good databases write it down first; each change goes into a log | documented design | **PostgreSQL docs — Write-Ahead Logging (WAL)** https://www.postgresql.org/docs/current/wal-intro.html ; **SQLite — Write-Ahead Logging** https://www.sqlite.org/wal.html | PostgreSQL: "WAL's central concept is that changes to data files (where tables and indexes reside) must be written only after those changes have been logged, that is, after WAL records describing the changes have been flushed to permanent storage." SQLite: "the changes are appended into a separate WAL file. A COMMIT occurs when a special record indicating a commit is appended to the WAL." |
| …on disk, then the app says saved | documented (with the safe setting) | **PostgreSQL — Asynchronous Commit** https://www.postgresql.org/docs/current/wal-async-commit.html ; **SQLite — PRAGMA synchronous** https://www.sqlite.org/pragma.html#pragma_synchronous | PostgreSQL: "transaction commit is normally synchronous: the server waits for the transaction's WAL records to be flushed to permanent storage before returning a success indication to the client." SQLite FULL: the engine will "ensure that all content is safely written to the disk surface prior to continuing"; "FULL is atomic, consistent, isolated, and durable (ACID) in WAL mode". |
| The main file is updated later | documented + measured | PostgreSQL WAL page; SQLite WAL page; test | PostgreSQL: "we do not need to flush data pages to disk on every transaction commit". SQLite: "a COMMIT can happen without ever writing to the original database". Test: main file had neither committed note until the checkpoint. |
| After a crash, the log is replayed | documented + measured | PostgreSQL WAL page; test | "in the event of a crash we will be able to recover the database using the log: any changes that have not been applied to the data pages can be redone from the WAL records. (This is roll-forward recovery, also known as REDO.)" Test: both committed notes back after reopening. |
| In our test, SQLite crashed mid-save; both committed notes came back (the unfinished one gone, on screen) | measured | `demo/out/wal-demo.json` | as above |
| Faster settings can lose the last few commits in a power cut | documented | SQLite PRAGMA synchronous; PostgreSQL Asynchronous Commit | SQLite: "A transaction committed in WAL mode with synchronous=NORMAL might roll back following a power loss or system crash." PostgreSQL: "Asynchronous commit is an option that allows transactions to complete more quickly, at the cost that the most recent transactions may be lost if the database should crash." |
| So saved means logged; for data you can't lose, keep full sync | takeaway from the above | — | "full sync" = SQLite `synchronous=FULL` (or EXTRA) / PostgreSQL synchronous commit (its default). |

**Illustrative, not claims:**
- the phone, the Notes app, "1%", "64%" and the note names;
- the notebook, slips, cabinet, drawer, FULL/FAST switch and lighting;
- the "slips hovering in memory" picture of an un-synced commit.

**Deliberately not claimed:**
- Not every app uses a database with a write-ahead log. The video says "good databases".
- No database survives every power cut in every configuration. Durability also depends on storage honouring flushes; the video makes no hardware claim.
- Our test was an app crash, not a power cut. No speed figure is given. No Tensorblue product feature is implied.

## Storyboard as built (7 camera shots + 1 blue wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.44 | **1 Hook — frame zero** | Frame 0: a dark room; one phone glows "Notes · Pay rent Fri · **Saved ✓**" at 1% battery; **WAS IT REALLY SAVED?** is already on screen; a sound on frame 0. On "saved" the badge pulses. On "died" the screen cuts to black. Slow push-in on "Is your note still there?". |
| 3.44–5.65 | **2 Promise** | Lights come back on, revealing the bench: phone, a LOG notebook, a MAIN FILE cabinet. Kinetic **WRITE IT DOWN / FIRST.** |
| 5.65–9.34 | **3 Log first** | The note is typed again ("Saving…"). A receipt slip leaves the phone and lands in the LOG ("LOG"). On "disk" it is stamped **COMMIT** ("ON DISK ✓"); on "says saved" the phone shows **Saved ✓**. |
| 9.34–13.94 | **4 Later + replay** | "MAIN FILE: LATER" over the closed cabinet. On "crash" the room blacks out briefly. On "replayed" a drawer slides open and the slip's copy flies in ("REPLAY"); the log keeps its copy. |
| 13.94–18.67 | **5 Our test** | "OUR SQLITE TEST": the log holds Pay rent Fri ✓, Call Sam ✓ and a faint unfinished "Buy milk…". On "crashed" it is dark. On "Both" the lights return, both committed slips are replayed into the drawer ("COMMITTED: BACK"), the unfinished slip fades ("UNFINISHED: GONE"), and the phone (now 64%) lists the two notes. |
| 18.67–22.31 | **6 Faster setting** | A FULL/FAST switch flips to FAST ("FASTER SETTING"). Two new notes hover above the log, unstamped ("NOT ON DISK YET"). On "power cut" the lights go out and they vanish ("LOST"). |
| 22.31–26.60 | **7 Payoff** | Lights back. Kinetic **SAVED = LOGGED.** Then the switch flips to FULL, the two notes land and are stamped, the phone hops, and **KEEP FULL SYNC.** appears (slow crane). |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

**Thumbnail** (`tensorblue-30s-english15-01-thumbnail.png`, 1080×1920): frame zero itself (without the caption) plus the logo and wordmark in the empty top area. **WAS IT REALLY SAVED?** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/wal_demo.py` + `src/demo/out/wal-demo.json`.

Reused from english-14:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs` (x 100–900), `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`;
- `mix.py`: heading, seed (20261118) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0. The demo uses only Python's standard library.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-15-english-15/tensorblue-30s-english15-01.mp4` · SHA256 `ce72b9b9b814721f8e0d24b737129ca89337b7e276e5ebb8c3982ec599d97439` · 4,852,663 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = lit "Saved ✓" phone in the dark + "WAS IT REALLY SAVED?" fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.1 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 15 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | Every group switches 0.06 s before Kokoro's word onset. Where Whisper starts a word later ("Then", "After", "Both"), the voice track is silent before Kokoro's onset (RMS ≤ 0.005) and speech starts there (RMS 0.09–0.11), so the captions are on time. |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames. The blackout now tints the whole frame uniformly, so the QA reference background gets the same tint; any drawn content would still be caught. |
| thumbnail | separate 1080×1920, 2–4 large words | frame zero + wordmark, 4 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 82/85 scripted words matched, WER 4.65 %; mean start drift 0.09 s, max 0.35 s (`qa/asr.json`) |
| audio identity | ASR-checked audio = final audio | The last fix was visual only. The final file's audio-stream MD5 equals the ASR-checked export (`fc7157f5…`), and the SFX list is unchanged. |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (frame 0 + frames around each change) viewed on the final file. |

**Fixed during QA:**
1. **Frame 0.** "SAVED?" overlapped the phone, and a notebook corner showed in the dark. The phone was reframed under the words; the hook's room is darker.
2. **Seam.** The blackout darkened only the 3D stage, leaving a visible seam at y 540. It now tints the whole frame, and the QA reference matches.
3. **Slips.** Slips lying on the log page were hidden by the notebook in the depth sort; they now draw right after the notebook. Slips landing in the payoff were seen edge-on as a thin bar; they now tilt to camera until they land.
4. **Overlaps.** "FIRST." overlapped the phone; the faster-setting notes overlapped each other and their tag covered the switch.
5. **Note name.** "Buy milk" (the unfinished test note) was reused in the faster-setting scene and was renamed "Book dentist".
6. **Palette.** The battery fill was red, which is off palette.
7. **Pronunciation.** misaki had no phonemes for "SQLite"; an override was added.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check on three words; no listening check was performed.
- ASR heard:
  - "Good **database is right** it down first" for "databases write it down first" (sound-alike word boundary; the caption shows the intended words);
  - "TensorBlue" (tokenisation);
  - a low-confidence "link." (p 0.105) in the pause before the CTA, treated as a Whisper artefact.
- The test is an app crash on this container's filesystem, not a power cut. Power-loss behaviour is quoted from SQLite/PostgreSQL docs, not measured.
- The FULL/FAST switch shows the active side under its knob, so the visible label is the inactive one. The tags and voice carry the meaning.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
