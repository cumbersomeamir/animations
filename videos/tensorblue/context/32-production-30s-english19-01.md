# 32 — Batch `2026-11-17-english-19` (batch19) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-17-english-19/tensorblue-30s-english19-01.mp4`, thumbnail `…/tensorblue-30s-english19-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-17-english-19/production-notes.md`. All earlier MP4s (including batch18 / english-18) are preserved unchanged.

## Brief and topic decision (user-authorised, 17 Nov 2026, batch19)
- **Proposed topic:** "How a database survives a power cut halfway through saving": write-ahead log, durable commit and replay, fsync and crash recovery.
- **History check:** that topic was **already covered**. english-15 (`28-production-30s-english15-01.md`, 15 Nov) was "Your app says saved but the power just went out". It used write-ahead logs, commit once on disk, crash → replay and the FULL/FAST sync setting, with a SQLite crash test.
- **Instruction followed:** "if this was already covered select a genuinely different specific topic in the same genre".
- **Chosen topic:** **why a video turns blurry for a moment instead of freezing**. Adaptive bitrate streaming: chunks stored in several qualities, and the player picking each next chunk from its buffer level.
- **Why it is new:** no earlier episode covers video streaming or buffering.
  - The nearest are round02 (raster pixels vs vectors when zooming a photo) and english-11 (a messaging app compressing a photo). Both are about image resolution. Neither is about network adaptation, chunks or a playback buffer.
  - english-12 (CDN edge caches) is about where copies live, not about quality switching.
- **Standing rules kept:**
  - frame zero is a composed, surprising subject plus 2–5 truthful words, with no fade or logo intro, working as the thumbnail, and hook audio at once;
  - Theory of Marketing structure and pacing;
  - one idea at a time;
  - captions inside x 100–900 (house band y 340–520);
  - honest QA.
- **Feedback kept:** a useful app-engineering story with real 3D depth and fun; exact palette and logo; no distracting lines.
- **Language and voice:** English only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached. Narration starts at 0.10 s. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` and `stage3d.mjs` unchanged.
  - Node + `@napi-rs/canvas` 1.1.0. No Three.js, Blender or paid API.
  - The film on the phones is an original drawing (dusk sea, sun, mountains, a sailboat). No real app UI, logo or footage.
- **Colours:**
  - The Tensorblue palette: `#3B82F6`, `#0A6CFF`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, navies `#050816` / `#08101F` / `#0B1423`.
  - tensorblue.com's own tokens (as checked for english-16/18): **cyan-400 `#00D3F2`** (HD), **amber-400 `#FFB900`** (SD, weak signal), **red-500 `#FB2C36`** (the FROZEN counter).
  - 720p uses brand blue `#3B82F6`.

## The test (`src/demo/abr_demo.py`; Python 3 standard library only)
- **What it is:** our own simulation of the published methods. It is not any app's code.
- **Shared setup:**
  - 4-second chunks (the paper's test setting);
  - ladder: SD 0.235 / 720p 1.75 / HD 5 Mb/s. The SD and HD values are the paper's "typically 235kb/s standard definition to 5Mb/s high definition"; **720p is illustrative**;
  - a 20-s buffer limit;
  - the **network is illustrative**: 8 Mb/s, then 1.2 Mb/s from 14 to 40 s (a weak patch), then 8 Mb/s.
  - 60 s of viewing at 10 ms steps. Playback drains the buffer one second per second, and a new quality is picked only when a chunk finishes (as in the paper).
- **The two players:**
  - **always HD:** every chunk at 5 Mb/s;
  - **adaptive:** BBA-0 buffer-based rate map. The lowest rate is used up to a reservoir of 8 s (two chunks), then the rate rises linearly to the highest at 16 s (the fullest buffer at which a request can happen).
- **Results** (`demo/out/abr-demo.json`):

| | always HD | adaptive |
|---|---|---|
| frozen (stalled) | **11.6 s** (26.5–37.6 s and 41.6–42.1 s) | **0 s** |
| time to first picture | 2.51 s | 0.12 s |
| video played in 60 s | 45.9 s | 59.9 s |
| on screen | HD only | SD 16.1 s · 720p 31.7 s · HD 12.0 s |

- **Sensitivity (reported, not hidden).** Two other adaptive settings were tried first:
  - **Reservoir of one chunk (4 s), top rate at 14 s:** froze **2.6 s**. It had just started an HD chunk when the signal dropped. This is the paper's own caveat: "we can only pick a new rate when a chunk finishes arriving. If the network suddenly slows down … the buffer might run dry".
  - **The paper's production proportions scaled to a 20-s buffer** (reservoir 90/240, top rate at 90 %): froze 0 s but never reached HD (SD 16.0 s, 720p 43.8 s), because the top rate sat above the fullest buffer a request can see.
  - The video uses the setting above. Always-HD freezes 11.6 s in every case, because it does not adapt.
- **Honesty:** the network trace and the 720p rung are illustrative; the playback logic is exact. The renderer stops if these results change.

## Final script (as spoken; 80 words, 29.45 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.35 | Your video went blurry instead of freezing. The app chose that. |
| L2 | 3.65–5.07 | But how does it switch mid-video? |
| L3 | 5.37–9.85 | Streaming apps cut video into short chunks, each saved in several qualities. |
| L4 | 10.10–12.95 | The player picks each next chunk by how full its buffer is. |
| L5 | 13.25–16.56 | Weak signal drains the buffer, so it grabs smaller chunks. |
| L6 | 16.86–21.96 | In our test, always-HD froze for nearly twelve seconds. Adaptive never froze. |
| L7 | 22.31–24.96 | So a blurry moment means the app chose to keep playing. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):**
- "always-HD" is read "always aitch-dee"; "mid-video" is normal.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

## Source → claim map (primary/reliable, read 2026-11-17; quotes checked verbatim against the raw files)
**[RFC]** R. Pantos (Apple) & W. May, **RFC 8216 "HTTP Live Streaming"**, August 2017. https://www.rfc-editor.org/rfc/rfc8216.txt
**[BBA]** Te-Yuan Huang, Ramesh Johari, Nick McKeown (Stanford), Matthew Trunnell, Mark Watson (Netflix), **"A Buffer-Based Approach to Rate Adaptation: Evidence from a Large Video Streaming Service"**, ACM SIGCOMM 2014. http://yuba.stanford.edu/~nickm/papers/sigcomm2014-video.pdf

| claim | kind | source and what it says |
|---|---|---|
| Your video went blurry instead of freezing; the app chose that | documented design goal | [RFC] §1: HLS "allows a receiver to adapt the bit rate of the media to the current network conditions in order to maintain uninterrupted playback at the best possible quality." [BBA]: ABR algorithms "try to maximize the video quality by picking the highest video rate the network can support… [and] minimize rebuffering events which cause the video to halt if the client's playback buffer goes empty." |
| Streaming apps cut video into short chunks, each saved in several qualities | documented | [RFC] §3: "A Media Playlist contains a series of Media Segments that make up the overall presentation." §2: "A Variant Stream includes a Media Playlist that specifies media encoded at a particular bit rate, in a particular format, and at a particular resolution". [BBA]: "Each video is encoded at a number of different rates (typically 235kb/s standard definition to 5Mb/s high definition)"; chunks "containing a fixed duration of video (four seconds…)". |
| …how does it switch mid-video? | documented | [RFC] §2: "Clients should switch between different Variant Streams to adapt to network conditions." |
| The player picks each next chunk by how full its buffer is | documented (one published, field-tested method) | [BBA]: "We start with a simple design which directly chooses the video rate based on the current buffer occupancy"; the BBA-0 rate map (reservoir → lowest rate, cushion → rising rate). Tested on Netflix with "over half a million real users each" per experiment. The paper adds that simple capacity estimation helps during startup. |
| Weak signal drains the buffer, so it grabs smaller chunks | documented + our test | [BBA]: "The buffer drains at unit rate (since one second is played back every second of real time)"; when the buffer is low the map gives a lower rate. Test: 720p and SD chunks during the weak patch. |
| In our test, always-HD froze for nearly twelve seconds; adaptive never froze | measured on our model | Test: 11.6 s vs 0 s (setting and sensitivity above). [BBA]: streaming "at the maximum video rate Rmax all the time… would risk extensive rebuffering." |
| So a blurry moment means the app chose to keep playing | summary of the above | — |

**Illustrative, not claims:**
- the film;
- the network trace, its "8 Mb/s" and "1.2 Mb/s" tags, and the signal bars;
- the 720p rung;
- the tower and shelf;
- tile sizes, which show relative bits.

**Deliberately not claimed:**
- Any specific app's algorithm, ladder or buffer size. Netflix is named only in the notes, as the field test of one published method; real players also use throughput estimates.
- That adaptive streaming can never freeze. The narration says only "in our test", and the notes report the one-chunk-reservoir run that froze 2.6 s.
- The paper's measured "10–20 %" rebuffer reduction is not used on screen.
- No app logos or UI are reproduced. No Tensorblue product feature is implied.

## Storyboard as built (7 camera shots + 1 blue wipe; test-driven from 10.1 s; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.50 | **1 Hook — frame zero** | Frame 0: a phone plays the little film visibly blurry (an "SD" badge, progress moving). Beside it stands a glass buffer tower whose back wall carries the HD/720p/SD bands, holding a small amber SD chunk with two cyan HD chunks above. **BLURRY, NOT FROZEN.** is already on screen, with a sound on frame 0. |
| 3.50–5.22 | **2 It switches** | Closer. On "switch" the SD chunk melts into the phone and the screen snaps sharp ("HD" badge). |
| 5.22–9.95 | **3 Chunks + qualities** | Up to a shelf: the film as a strip of tiles ("CHUNKS"). On "several qualities" it becomes three rows: HD (big, crisp), 720p, SD (small, blurry), each labelled. |
| 9.95–13.10 | **4 The buffer decides** | Back to the phone; the test starts (sim 0 s). Tiles fly from the shelf into the tower; the band the stack reaches decides the next tile (SD → 720p → HD). Tags: "8 Mb/s", "BUFFER". |
| 13.10–16.71 | **5 Weak signal** | On "Weak" the signal bars drop to one amber bar ("1.2 Mb/s"); an HD chunk crawls in; the stack sinks and the next chunks are smaller blue 720p and amber SD tiles ("SMALLER CHUNKS"). |
| 16.71–22.17 | **6 Proof** | Pull back: the always-HD lane fades in beside it. Its tower runs dry and the phone freezes behind a pause sign, with a red "FROZEN" counter climbing as the test runs. The adaptive lane keeps playing (badge HD → 720p → SD); "FROZEN 0 s" on "never". |
| 22.17–26.60 | **7 Payoff** | Wider (slow crane; the shelf fades). Kinetic **BLURRY,** / **BUT PLAYING.** The adaptive phone is on a blurry SD chunk; always-HD stalls once more and its counter lands on **11.6 s**. |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english19-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark in the empty top. **BLURRY, NOT FROZEN.** (3 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/abr_demo.py` + `src/demo/out/abr-demo.json`.

Reused from english-18:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `requirements-audio.txt`;
- `mix.py`: heading, seed (20261122) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-17-english-19/tensorblue-30s-english19-01.mp4` · SHA256 `7d266b9343b3958f7f4c09c2c5b3a86990c86d23674208cb241a15cdfc7911b1` · 5,240,096 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = the blurry-but-playing phone and its buffer tower + "BLURRY, NOT FROZEN." fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1, thumbnail) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 3.4 LU, **−1.9 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 15 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | Every group starts 0.06 s before Kokoro's word onset and dissolves into the next with no blank frame. Whisper drifts up to 0.48 s: "Follow" is heard 0.48 s early, but the voice track is silent until 27.00 s, so that caption is on time. The other drifts (≤ 0.27 s) are mid-group words. |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | frame zero + wordmark, 3 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 76/80 scripted words matched, WER 3.7 %; mean start drift 0.11 s (`qa/asr.json`) |
| shots / transitions | one idea at a time, purposeful moves | 7 shots + 1 wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (frame 0 + frames around each change) viewed on the final file. |

**Fixed during QA:**
1. **Frame zero.** The phone and tower overlapped "NOT FROZEN." and were small; the camera was re-set with a projection check.
2. **Blur.** SD and 720p were too sharp to read as blurry; they now render at 9 % and 28 % scale.
3. **"Smaller chunks".** Every tile was the same size; tiles are now smaller for lower qualities (fewer bits), while their height stays 4 s of buffer.
4. **Shelf shot.** The phone lane peeked in at the bottom; it now fades out while the camera is on the shelf.
5. **Payoff.** The shelf, and tiles flying from it, crossed the payoff words. The shelf fades and late chunks drop in from just above the tower.
6. **Freeze counter.** It disappeared at 11.1 s, before always-HD's second short stall; it now stays until the CTA and lands on 11.6 s.
7. **Tags.** "SMALLER CHUNKS" covered an incoming tile and the phone's badge; the signal tag sat on the shelf. Both moved.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check; no listening check was performed.
- WER 3.7 % comes from:
  - "always HD" for "always-HD" and "12" for "twelve" (tokenisation);
  - "So blurry moment" with the "a" dropped;
  - a doubled "playing." (p 0.089) inside the final word's own span (24.44–24.95 s). The voice track is silent from 25.00 s, so this is a Whisper artefact.
- The network and the 720p rung are illustrative, and the adaptive result depends on the rate-map setting (all three runs are reported above). The test shows the method, not any specific app.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
