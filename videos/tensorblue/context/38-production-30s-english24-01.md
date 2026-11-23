# 38 — Batch `2026-11-23-english-24` (batch24) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-23-english-24/tensorblue-30s-english24-01.mp4`, thumbnail `…/tensorblue-30s-english24-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-23-english-24/production-notes.md`. All earlier MP4s are preserved unchanged. Batch23 was already complete and pushed (`4b096b9`); nothing from it was pending.

## Brief (user-authorised, 23 Nov 2026)
- **Proposed topic:** "Why deleting an app does not always delete its data". It would contrast the client installation with remote server records, uninstalling with a separate account-data deletion request, and teach the principle of explicit data ownership and a deletion lifecycle. No blanket claims about real apps.
- **Rule in the brief:** "Read ALL prior topic records first, including the ACTUAL replacement subject used in batch23. This batch must have a different core question, visual setting and educational mechanism. If this proposal was already covered, choose an unrelated subject inside the fixed genre, not another version of that topic, and record why." Also: "If the topic overlaps actual history, replace it with an unrelated verified topic in this fixed genre."
- **Kept:**
  - the 2026-11-18 feedback: app development or something cool an app did, real 3D depth, fun;
  - the exact tensorblue.com palette and logo, with no distracting lines and no fake interface;
  - the 2026-11-19 layout rules: captions y 280–460, one headline plus caption, nothing vital near the right/bottom controls;
  - "vary scene choreography rather than replacing the visual identity".

## Topic decision (why the proposal was replaced)
- **It overlaps english-08** (`21-production-30s-english08-01.md`): *"why a deleted photo can still appear in the cloud or on another device"*. That episode covered local deletion vs synchronised deletion vs backups: deleting this device's copy leaves the server's copy; a separate synced delete removes it; trash and backups keep copies for a while.
- **Same question, same mechanism.** The proposal asks the same question ("I deleted it here — why does the data still exist over there?") with the same mechanism: a local copy vs the server's own records, a separate deletion path, and retention. Uninstalling vs requesting account deletion is another version of that topic, not a new one.
- **Chosen instead:** *How did Twitter give every tweet a unique number, from many servers at once, with no central counter?*
  - This is **Snowflake** (2010), open-sourced on GitHub (`twitter-archive/snowflake`).
  - It fits the genre on three counts: a useful GitHub repository, system design, and "something cool an app did in the past".
  - It ends in a concrete app-development rule, verified by X's and Discord's API docs: **keep these IDs as strings in JavaScript**.
- **New to the channel.** Prior topics are CDN, optimistic updates, idempotency, raster/vector, password vault, passkeys, OCR, QR, last-seat race, deleted-photo sync, DNS, incognito, photo compression, offline-first, undo, list recycling, write-ahead log, reroute, Figma, Shazam, adaptive bitrate, WhatsApp store-and-forward, progress bar, tunnel dead reckoning and k-anonymity. None covers ID generation.
  - Idempotency (episode 14) is about client keys that stop duplicate requests.
  - The last-seat race (english-07) is about one contested row.
  - Neither covers bit-packed, uncoordinated, time-sorted IDs.
- **Different from batch23** (k-anonymity password check):
  - question: unique IDs at scale, not privacy-preserving lookup;
  - setting: a toy server room with ID plates, bit-sized blocks and a sorted wall, not a phone, hash press and vault;
  - mechanism: time + machine + counter bits, not hash prefix → range query → local compare.

## The test (`src/demo/snowflake_test.py` + `src/demo/js_precision.mjs`; Python stdlib + Node 22)
- **What it is:** our own re-implementation of the layout documented in the 2010 README. It is not Twitter's code; no foreign script was run.
  - time: 41 bits of milliseconds since Twitter's epoch `1288834974657`, which is 2010-11-04 01:42:54.657 UTC (from `IdWorker.scala`);
  - machine: 10 bits;
  - counter: 12 bits.
- **Run:** 2026-11-23 12:57:40.747 UTC.
  - One real clock reading was captured. Machines 1, 2 and 3 each made 3 IDs in that same millisecond (counter 0, 1, 2), then 1 more each in the next millisecond: 12 IDs.
  - **12 of 12 distinct.** Sorted by number, they come out in time order. Decoding returns the original time, machine and counter.
  - A clock moved back 5 ms is refused ("clock moved backwards by 6 ms" — measured from the last ID made).
- **Sample (machine 2, counter 0):** `2124849866982039552`, 19 digits, 61 bits used, 506,603,686,090 ms since the epoch.
- **JavaScript (Node v22.23.5):**
  - the 12 IDs become **6 distinct values** as `Number`;
  - `2124849866982035456` and `2124849866982035457` (machine 1, counter 0 and 1) are different strings but **equal as Numbers**;
  - three groups of three IDs collapsed, because doubles are exact only up to 2^53 (9,007,199,254,740,991);
  - `BigInt` and strings keep all 12 distinct.
- **Capacity (arithmetic on the documented layout):** 4,096 IDs per millisecond per machine; 1,024 machines; 69.7 years of time field (until 2080-07-10).
- **Differences from the original:**
  - our generator raises an error at the 4,097th ID in one millisecond, where the 2010 code waits for the next millisecond (`tilNextMillis`);
  - the 2010 code splits the 10 machine bits into 5 datacenter + 5 worker bits; we use one 10-bit machine id, as the README describes.
- `scene.mjs` reads every number from `demo/out/snowflake-test.json` and stops if the results change.

## Final script (as spoken; 72 words incl. CTA, 29.55 s; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–2.39 | Twitter needed ten thousand IDs a second. |
| L2 | 2.69–5.58 | No repeats, without servers coordinating. How? |
| L3 | 5.88–9.36 | In 2010 they built Snowflake: one number, three parts. |
| L4 | 9.66–11.49 | First, the time, to the millisecond. |
| L5 | 11.74–13.06 | Then, which machine made it. |
| L6 | 13.31–16.02 | Then a counter, for IDs in the same millisecond. |
| L7 | 16.32–20.86 | Our test: three machines, the same millisecond, nine IDs, zero repeats. |
| L8 | 21.21–26.10 | In JavaScript, keep IDs as strings, or different IDs can become one number. |
| L9 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked before TTS):**
- "IDs" → /ˌIdˈiz/ ("eye-DEEZ");
- "2010" → "twenty ten";
- Snowflake and JavaScript are correct;
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Edits:**
- The first draft ran 28.2 s of speech, and the hook line took 3.5 s. The hook was cut to "Twitter needed ten thousand IDs a second." (2.3 s); "No repeats" moved into the superhook; the payoff line was shortened.
- "And servers shouldn't have to coordinate" became "without servers coordinating", which matches the README's "should not have to coordinate".

## Source → claim map (read 2026-11-23; raw files, quotes verbatim)
| claim | kind | source and what it says |
|---|---|---|
| Twitter needed ten thousand IDs a second | documented requirement | **Snowflake README, tag snowflake-2010** https://github.com/twitter-archive/snowflake/blob/snowflake-2010/README.mkd — Requirements: "minimum 10k ids per second per process". (A requirement per process, not a measured total; the caption says so.) |
| No repeats | documented | README: "Snowflake is a network service for generating unique ID numbers at high scale with some simple guarantees." **X docs, X IDs** https://docs.x.com/fundamentals/x-ids: "IDs are globally unique across all of X, not just within a single object type." |
| …without servers coordinating | documented | README: "For high availability within and across data centers, machines generating ids should not have to coordinate with each other." |
| In 2010 they built Snowflake | documented | **Snowflake repo README (master)** https://github.com/twitter-archive/snowflake: "The initial version, released in 2010, was based on Apache Thrift"; source "reachable from snowflake-2010 tag". README motivation: "As we at Twitter move away from Mysql towards Cassandra, we've needed a new way to generate id numbers." |
| One number, three parts | documented | README: "id is composed of: time - 41 bits (millisecond precision w/ a custom epoch gives us 69 years); configured machine id - 10 bits - gives us up to 1024 machines; sequence number - 12 bits - rolls over every 4096 per machine (with protection to avoid rollover in the same ms)". X docs: "X IDs are 64-bit unsigned integers generated using a system called 'Snowflake.' Each ID encodes: Timestamp — When the object was created; Worker number — Which server generated the ID; Sequence number — Order within that millisecond". |
| First, the time, to the millisecond | documented | README (above). **IdWorker.scala** (2010 tag) `val twepoch = 1288834974657L`; the id is `((timestamp - twepoch) << timestampLeftShift) \| … \| sequence`. |
| Then, which machine made it | documented | README "configured machine id"; X docs "Worker number — Which server generated the ID". |
| Then a counter, for IDs in the same millisecond | documented | X docs "Sequence number — Order within that millisecond"; IdWorker.scala: `if (lastTimestamp == timestamp) { sequence = (sequence + 1) & sequenceMask` … `} else { sequence = 0 }`. |
| Our test: three machines, the same millisecond, nine IDs, zero repeats | measured | above (9 same-ms IDs distinct; 12/12 overall) |
| (headline "SAME MILLISECOND. NO REPEATS.") | measured | the same 9 IDs, shown on the plates |
| In JavaScript, keep IDs as strings | documented | X docs: "Always use string IDs in your code. Some programming languages (like JavaScript) can't accurately represent 64-bit integers." "In JavaScript, integers are limited to 53 bits. This causes precision loss with large IDs". **Discord API reference, Snowflakes** https://docs.discord.com/developers/reference: "Discord utilizes Twitter's snowflake format… Because Snowflake IDs are up to 64 bits in size (e.g. a uint64), they are always returned as strings in the HTTP API to prevent integer overflows in some languages." |
| …or different IDs can become one number | measured + documented | our test: 12 IDs → 6 Numbers; `…035456` and `…035457` are equal as Numbers (X docs: "precision loss") |
| (TIME block "ms since 4 Nov 2010") | from code | epoch 1288834974657 = 2010-11-04 01:42:54.657 UTC |

**Not read:** Twitter's 2010 blog post "Announcing Snowflake" (blog.x.com returned 403 to our fetch). It is not cited; every claim above rests on the repository and the official docs.

**Illustrative, not claims:**
- the server towers and their numbers 1/2/3 (the machine IDs in our test);
- the "ONE COUNTER 0042" block (the coordinated alternative, not used by Snowflake);
- the plates, the blocks sized at 0.04 units per bit, the sorted wall (rows = machine, columns = counter, which is numeric order), and the "string"/"Number" pills.

**Deliberately not claimed:**
- any speed or volume Twitter/X actually reached;
- that Twitter still runs the 2010 code (its README says the internal version is "a full rewrite");
- Discord's exact layout (42-bit timestamp, 2015 epoch, 5+5 worker/process bits) beyond "uses Twitter's snowflake format";
- that every JavaScript ID breaks (only IDs above 2^53 lose precision).
- No X/Twitter or Discord logo or UI appears.

## Storyboard as built (8 shots + CTA wipe; one headline at a time; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–2.57 | **1 Hook — frame zero** | Three server towers (1, 2, 3) fire white ID plates, interleaved 1-2-3; the plates arc through the lower half and out of the bottom. Frame 0: a large `2124849866982039552` in the foreground with plates from all three servers in the air. **SAME MILLISECOND. / NO REPEATS.** (soft shadow, centred x 500). Each launch squashes its tower and plays a hop. |
| 2.57–6.18 | **2 No central counter** | The camera cranes up. A "ONE COUNTER 0042" block pops up between the servers and, on "without", sinks into the floor while the servers slide apart. **HOW?** lands on "How" and holds. |
| 6.18–9.54 | **3 One number, three parts** | Server 2 pops the real plate `2124849866982039552` forward. It pulses on "one number" and on "three parts" splits into blocks sized by their bits: **TIME** (blue, 41), **MACHINE** (pale, 10), **COUNT** (green, 12). The towers fade to dark silhouettes; the camera sees the exploded bar on a diagonal. **SNOWFLAKE, 2010** |
| 9.54–11.62 | **4 Time first** | Close on TIME: its digits roll and land on **506,603,686,090** "ms since 4 Nov 2010" (our run's real value); the other blocks dim. **TIME FIRST** |
| 11.62–13.31 | **5 Which machine** | MACHINE lifts and shows **2**. **WHICH MACHINE** |
| 13.31–16.20 | **6 The counter** | COUNT flips **0 → 1 → 2** on "counter / same / millisecond", and three tail plates `…2039552/553/554` fan out under it. **COUNT 0, 1, 2** |
| 16.20–21.09 | **7 Proof** | A wall rises from the floor. The nine same-millisecond plates fly from their servers into a 3×3 wall in numeric order; their sides turn green on "zero". **9 IDs. 0 REPEATS.** |
| 21.09–26.60 | **8 Payoff** | Two real plates, `…035456` and `…035457`. On "strings" they flip to quoted green strings and stay distinct. On "become" they flip to red JS Numbers that both read `…035456`, then clash and merge into one plate just after "number". **KEEP IDs AS STRINGS** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english24-01-thumbnail.png`): frame zero (without the caption) plus the logo and wordmark. **SAME MILLISECOND. NO REPEATS.** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/snowflake_test.py`, `src/demo/js_precision.mjs` and `src/demo/out/snowflake-test.json`.

Reused from english-23:
- unchanged: `brt.mjs`, `stage3d.mjs`, `toy3d.mjs`, `render.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `transitions.mjs`, `qa.mjs` (with check 4), `requirements-audio.txt`;
- `mix.py`: heading, seed 20261127, a 9-scene chord list, dispatch for `tick` / `swish2` / `confirm`, and **unknown SFX types now raise an error** (they were silently dropped before).

Licences and assets:
- Fonts: Inter / Inter Display, JetBrains Mono (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0).
- ASR: faster-whisper base.en (MIT).
- Music and SFX: synthesized.

Twitter's Snowflake source was only read, never run. No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `…/tensorblue-30s-english24-01.mp4` · SHA256 `f595df86df2bf61ec01a13dc74385b49022a9e33ac4aa2980e837bf617103dfc` · 6,077,218 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | three servers + plates in flight + large real ID + "SAME MILLISECOND. NO REPEATS."; narration from 0.10 s, a sound at 0.00 s |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 30/1, yuv420p, ~1.42 Mb/s, `+faststart` (ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | silent render checked at 900 frames before muxing; final `nb_read_frames=900`; all streams 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~191 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.2 LUFS**, LRA 2.3 LU, **−3.1 dBTP** |
| captions | ink inside x 100–900, **y 280–460**, ≤ 2 lines | all 11 groups pass: ink x 128–870, y 311–428 |
| top / caption band | no stage drawing in y 0–479 | 0 violations in 90 sampled frames |
| headline vs props | nothing from the world inside a headline's box (+12 px) | 0 prop pixels in 396 sampled frames (every 2nd frame to the CTA) |
| text density | ≤ one headline + caption | one kinetic headline at a time; each exits before its shot cuts |
| texture text | no overflow | every texture line is measured and throws if it overflows its face |
| narration (one ASR pass on the final audio) | intelligible | Every scripted word heard. 70/72 matched, WER 2.8 %: "10,000", "2010" as numerals, "TensorBlue". Low confidence: "they" (p 0.35). Mean start drift 0.12 s. |
| ASR max drift | — | 0.54 s on "or" and 0.42 s on "Follow" are Whisper boundaries after pauses. The voice has the tail of "strings" at 23.42–23.90 s; it is silent (RMS 0.0000) at 26.58–26.95 s, and speech starts at 27.0 s, matching the TTS timing. |
| audio identity | ASR-checked audio = final audio | audio-stream MD5 `7756c75e…` (the ASR pass ran on this exact file) |
| watch-through | every second | 2 frames/s **by exact frame number** (`select=not(mod(n,15))`, labelled with source pts) of the whole final file, plus `qa/transitions.png` (25 frames decoded from the MP4) and stills of every shot and transition |

**Fixed during the build/QA:**
1. **Bit-sized MACHINE block.** It is 0.40 units wide; its title overflowed and the texture guard threw. Titles now auto-fit; the widths stay honest to the bits.
2. **Caption width.** "Then, which machine made it." was too wide and was split.
3. **Silent SFX.** `tick`, `swish2` and `confirm` were not dispatched by `mix.py` and would have been dropped silently. They were added, and unknown types now raise.
4. **Framing.**
   - Content sat high with ~450 px of empty floor, so the camera screen centre moved to y 1250.
   - The hero plate and blocks overflowed the frame, so cameras are computed from block positions, the overview is diagonal and the spread was reduced.
   - Towers cluttered the block shots, so they became dark silhouettes.
   - The proof wall faded in as translucent glass; it now rises solid from the floor.
5. **Hook.** Frame 0 showed only server 1's plates; launches were interleaved and shifted 0.5 s, and the paths now dive through the lower half instead of into the lens.
6. **Counter plates.** They first landed in the bottom, then the right-side controls zone; they now float in a fan under the COUNT block.
7. **COUNT headline.** The tower silhouettes touched its bottom at 13.6 s; the counter camera was adjusted. Check 4 now reports 0.
8. **Headline timing.**
   - Headlines finished exiting 0.15 s into the next shot, so they now end before each cut.
   - That made HOW? and WHICH MACHINE too short, so the parts cut moved 0.3 s into L3, the counter cut moved to L6's first word, and those headlines enter on their phrase.
9. **Phantom "4".** ASR inserted a "4" (p 0.04) where the `reject` buzz overlapped the end of "number". The clash, both sound and squash, moved to just after the word; the phantom is gone.
10. **Sheet labels led the content by ~0.23 s.** The 2-fps sheets used `fps=2` + `pts` labels, and a labelled 21.0 s frame was really frame 637 (21.23 s). This also applies to earlier rounds' sheets. Sheets now sample exact frame numbers.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed. "Watched" means exact-frame sheets at 2 fps plus stills and pixel checks, not real-time playback.
- Our test re-implements the documented layout; it does not measure Twitter/X's production system. "Ten thousand IDs a second" is the README's requirement (per process), not a measured figure.
- The thumbnail's large foreground plate sits low (y ≈ 1680–1840), where feed controls may cover it. It is illustrative depth; the message is in the headline.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
