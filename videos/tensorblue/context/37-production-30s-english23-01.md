# 37 — Batch `2026-11-21-english-23` (batch23) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-21-english-23/tensorblue-30s-english23-01.mp4`, thumbnail `…/tensorblue-30s-english23-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-21-english-23/production-notes.md`. All earlier MP4s are preserved unchanged.

**Process note:** the brief said to finish checkpointed batch22 work first. That was done: batch22 was committed and pushed as `2429bc2` before this episode started. This brief was submitted exactly once, as this episode.

## Brief (user-authorised, 21 Nov 2026)
- **Proposed topic:** "How an app avoids charging you twice after a retry" (idempotency keys; Stripe). Proposed frame zero: two payment attempts merging into one receipt, **TWO TRIES. ONE CHARGE.**
- **Rule in the brief:** "Read ALL prior topic records first, including the ACTUAL replacement subject used in batch22. This batch must have a different core question, visual setting and educational mechanism. If this proposal was already covered, choose an unrelated subject inside the fixed genre, not another version of that topic, and record why."
- **Feedback kept (2026-11-18):** about app development or something cool an app did; real 3D depth; fun motion.
- **Layout rules kept (2026-11-19):**
  - captions at y 280–460;
  - one headline plus the caption;
  - nothing vital near the right-side or bottom controls;
  - no fictional buttons;
  - frame zero is a truthful image with 2–5 words.

## Topic decision (why the proposal was replaced)
- **Already covered.** Idempotency / "pay twice, charged once" is **episode 14** (`14-production-30s-feedback-01.md`: one purchase, one receipt, Stripe idempotency keys).
- **Declined twice before.** It was proposed and declined in **english-07** and **english-14** (`11-production-format.md` log: "must not be proposed again without a genuinely new angle"). "After a retry" is the same mechanism and the same Stripe sources, so it is another version of that topic, not a new angle.
- **Chosen instead:** *How can an app tell you a password leaked, without ever sending the password?* This is the k-anonymity range check that 1Password Watchtower runs against Have I Been Pwned's Pwned Passwords.
- **Different from batch22** (english-22, the map blue dot in a tunnel):
  - core question: privacy-preserving lookup, not positioning without GPS;
  - setting: a phone, a hash press and a breach-list vault, not a mountain tunnel;
  - mechanism: hash prefix → range query → local compare, not dead reckoning or map matching.
- **Not a repeat of Hindi batch03** (`16-…`, how a password manager keeps your vault without knowing the master password). That episode covered key derivation and encrypted sync. This one covers breach detection by a partial-hash query. 1Password is cited in both, for different mechanisms.

## The test (`src/demo/breach_check.py`; Python 3 standard library)
- **What it does:** real requests to the public HIBP range API `https://api.pwnedpasswords.com/range/{first 5 SHA-1 chars}`, with the documented `Add-Padding: true` header.
- **Inputs:** two **public sample** passwords only, never anyone's real password:
  - the well-known weak `password123`;
  - a fresh random 20-character password generated in the script, used once and then discarded (only its prefix is kept).
- **Queried:** 2026-11-21 11:45 UTC. Results are in `src/demo/out/breach-check.json`:

| sample | SHA-1 (40 chars) | sent | lines returned | real leaked suffixes | padding (count 0) | result |
|---|---|---|---|---|---|---|
| `password123` | `CBFDAC6008F9CAB4083784CBD1874F76618D2A97` | `CBFDA` (5 chars) | **2,078** | 1,972 | 106 | **found, 2,266,677 times** |
| random 20-char | (not shown) | `DE4AD` (5 chars) | 2,047 | 1,966 | 81 | not found |

- **Not sent:** the other 35 characters and the password itself. There are 16⁵ = 1,048,576 possible prefixes.
- **Padding.** The API docs say padding gives "between 800 and 1,000" results. Both real buckets already held more than 1,900 real suffixes, so padding only added 81–106 decoys. The docs' range looks out of date for today's data set. The video says "two thousand look-alikes" (1,972 real + 106 decoys = 2,078 returned) and the headline shows the exact **2,078 BACK**.
- **These numbers change over time** as HIBP adds breaches. They are a snapshot of our query.
- The renderer reads the JSON directly (hash, prefixes, counts, example suffix lines), so no number is typed by hand.

## Final script (as spoken; 80 words, 29.54 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.12 | This password leaked. Your app knows, but never sent it. |
| L2 | 3.37–5.57 | Apps like 1Password do this. How? |
| L3 | 5.82–8.62 | First, the password becomes a forty-character hash. |
| L4 | 8.87–11.17 | Only the first five characters leave your phone. |
| L5 | 11.42–15.89 | The breach list returns every hash that starts the same, and your phone compares. |
| L6 | 16.14–21.73 | Our test got two thousand look-alikes, and password123 appeared over two million times. |
| L7 | 22.03–26.10 | Building sign-up? Check this way, and the password never leaves the phone. |
| L8 | 27.00–29.54 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- the TTS text says "One Password" for 1Password and "password one two three" for password123; captions keep the real spelling;
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Edits:**
- **Speech length:** the first draft ran 28.9 s of speech, which crowded the CTA. Two lines were cut to 26.8 s.
- **L6 wording:** "password123 had leaked two million times" became "**appeared** over two million times". The count is how many times it appears in the breach data, not the number of separate leaks.

## Source → claim map (read 2026-11-21; raw pages, quotes verbatim)
| claim | kind | source and what it says |
|---|---|---|
| Your app knows (the password leaked), but never sent it; apps like 1Password do this | documented app behaviour | **1Password Support — About Watchtower privacy** https://support.1password.com/watchtower-privacy/: "Your passwords are never sent to us or anyone else. To check for vulnerable passwords, ones that have appeared in data breaches, 1Password creates a 40-character hash of each password and sends only the first five characters of each hash to the Pwned Passwords service provided by haveibeenpwned.com." |
| The password becomes a forty-character hash | documented | same page ("creates a 40-character hash"); **1Password blog, Jeff Shiner, 28 Aug 2018** https://1password.com/blog/finding-pwned-passwords-with-1password: hashes "your password using SHA-1… only requires the first five characters of the 40-character hash." Test: SHA-1 is 40 hex characters. |
| Only the first five characters leave your phone | documented + our test | 1Password: "Only the first five characters of each hash leave your d[evice]". **HIBP API v3** https://haveibeenpwned.com/API/v3: "allows the first 5 characters of either a SHA-1 or an NTLM hash (not case-sensitive) to be passed to the API… GET https://api.pwnedpasswords.com/range/{first 5 SHA-1 chars}". Test: we sent `CBFDA`. |
| The breach list returns every hash that starts the same | documented + our test | HIBP API: "the API will respond with an HTTP 200 and include the suffix of every hash beginning with the specified prefix, followed by a count of how many times it appears in the data set." |
| …and your phone compares | documented | 1Password: "The service provides a list of vulnerable passwords that have hashes starting with those same five characters, and 1Password compares them locally on your device." HIBP API: "The API consumer can then search the results of the response for the presence of their source hash". |
| Our test got two thousand look-alikes | measured | 2,078 lines returned (1,972 real + 106 padding) |
| password123 appeared over two million times | measured | count 2,266,677 for its suffix (HIBP: "a count of how many times it appears in the data set") |
| Check this way, and the password never leaves the phone | method summary | **Cloudflare blog, Junade Ali, 21 Feb 2018** https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/ (the design behind the range API): "the Pwned Passwords API service never gains enough information about a non-breached password hash to be able to breach it later". Its client description: "The entire hash list is then downloaded and each downloaded hash is then compared to see if any match the locally generated hash." |

**Honest caveat (in the publishing caption):** 1Password notes that with similar weak passwords like "MySekret1 and MySekret1!" "there's a risk that Have I Been Pwned could learn your passwords if they acted maliciously". "Never leaves the phone" is about the password itself; the 5-character prefix does leave.

**Illustrative, not claims:**
- the hash press, glass case, flying tiles, capsule, vault and card stack. 26 cards stand for the 2,078 lines.
- **The phone screen** is our own generic "Password check" drawing. It has no buttons, no 1Password UI and no logo. Its text mirrors our real query results: "Found in breach data, seen 2,266,677 times" / "Not found in breach data, only 5 characters sent".
- The strong password is shown only as dots and its sent prefix `DE4AD`.

**Deliberately not claimed:**
- that every app or password manager does this;
- anything about how 1Password stores or encrypts vaults;
- that a prefix gives perfect privacy;
- any speed figure.
- No 1Password or HIBP logo or UI is reproduced. No Tensorblue product feature is implied.

## Storyboard as built (7 shots + CTA wipe; one headline at a time; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.25 | **1 Hook — frame zero** | Frame 0: a phone in a glass case shows "Password check · password123 · Found in breach data, seen 2,266,677 times". A red match strip `C6008F9CAB4…` floats beside it, with the white HASH press and, on the right, the BREACH LIST vault. **LEAKED. / NEVER SENT.** (soft shadow, centred x 500). |
| 3.25–5.70 | **2 How?** | The camera cranes back over the whole set; the red strip retracts. **HOW?** |
| 5.70–8.77 | **3 Hash** | Low camera. On "First" the press punches; 40 hash tiles hop out in a receding row, the first five blue (`CBFDA`). **40 CHARACTERS** |
| 8.77–11.32 | **4 Only five leave** | The five blue tiles lift and pack into a `CBFDA` capsule. The other 35 stay. **ONLY 5 LEAVE.** shows from "Only" and is gone before the capsule rises past the camera toward the vault. |
| 11.32–16.02 | **5 Range query** | High camera at the vault. The capsule docks in a drawer labelled `CBFDA`; 26 look-alike cards (real example suffixes) fly back in low arcs and stack flat beside the phone. **PHONE COMPARES** |
| 16.02–21.91 | **6 Proof** | The red match strip rises out of the stack and the phone turns red. **2,078 BACK**, then **SEEN 2,266,677×** (red). |
| 21.91–26.60 | **7 Payoff (sign-up)** | "New password", shown as dots. The same choreography, faster: only `DE4AD` flies, in a low arc, under the headline. The verdict turns green: "Not found in breach data · only 5 characters sent". **CHECK, DON'T SEND.** (green). |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english23-01-thumbnail.png`): frame zero (without the caption) plus the logo and wordmark. **LEAKED. NEVER SENT.** (3 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/breach_check.py` + `src/demo/out/breach-check.json`.

Reused from english-22:
- unchanged: `brt.mjs`, `stage3d.mjs`, `toy3d.mjs`, `render.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `transitions.mjs`, `requirements-audio.txt`;
- `qa.mjs`: the english-22 checks plus **check 4 (headline vs props)** and a `QA_HEAD_ONLY` switch;
- `mix.py`: heading, seed 20261126, 8-chord score, TP ceiling −3.0 dBTP.

Licences and assets:
- Fonts: Inter / Inter Display, JetBrains Mono (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0).
- ASR: faster-whisper base.en (MIT).
- Music and SFX: synthesized.

The HIBP range API needs no key and is free. No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `…/tensorblue-30s-english23-01.mp4` · SHA256 `3af8d3b40bd33f5eb525eb78ad2c0fb86b1b9948e6e2dda20da82ed66a1f592f` · 6,183,892 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | phone + red match strip + HASH press + vault + "LEAKED. NEVER SENT."; narration from 0.10 s |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 30/1, yuv420p, ~1.45 Mb/s, `+faststart` (ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | silent render checked at 900 frames before muxing; final `nb_read_frames=900`; all streams 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~192 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.3 LUFS**, LRA 1.7 LU, **−3.1 dBTP** |
| captions | ink inside x 100–900, **y 280–460**, ≤ 2 lines | all 14 groups pass: ink x 126–874, y 312–428 |
| top / caption band | no stage drawing in y 0–479 | 0 violations in 90 sampled frames |
| headline vs props (new) | no 3D prop or flying object inside a headline's box | 0 prop pixels in 396 sampled frames (every 2nd frame from 0 to the CTA) |
| text density | ≤ one headline + caption | one kinetic headline at a time (sheets + check 4) |
| narration (one ASR pass on the final audio) | intelligible | Every scripted word heard. 71/80 matched, WER 15.2 %, all from spelling: "one password", "40-character", "2,000", "lookalikes", "password 123", "signup", "TensorBlue". Low confidence: "123" (p 0.45). Mean start drift 0.125 s. |
| ASR max drift | — | 1.18 s on "Follow" is a Whisper artefact: voice RMS is 0.0000 at 26.15–26.95 s and speech starts at 26.95 s, matching the TTS timing (27.00 s) |
| audio identity | ASR-checked audio = final audio | audio-stream MD5 `d2bd4f4c…` unchanged across the last visual-only re-renders |
| watch-through | every second | 2 frames/s of the whole final file (60 frames) viewed, plus `qa/contact-sheet-1fps.png`, `qa/transitions.png` (22 frames decoded from the MP4), half-scale crops of the headline shots (8.0, 15.5, 23.4, 25.4 s) and 0.4-scale stills through both capsule flights |

**Fixed during QA:**
1. **Hook.** The phone sat behind the words, so the camera was lowered. The glass washed out the screen, so its alpha was reduced.
2. **Returned look-alikes.** They read as thin lines. They became taller cards facing the camera, flying in low arcs into a flat pile.
3. **Match strip.** It drifted into the headline area or off-frame, and was repositioned. Its red glow blob was reduced (alpha 0.12, radius 0.35).
4. **Payoff headline.** "SEND." touched the vault; the headline went to 84 px and the payoff camera was adjusted.
5. **Phone text overflow.** The payoff card read "checked with 5 characte…" (cut off). It became "only 5 characters sent", and screen textures now throw on overflow.
6. **Headlines on the vault.** "40-CHARACTER HASH" and "COMPARED ON THE PHONE" overlapped the vault. They became **40 CHARACTERS** and **PHONE COMPARES**, fitted ≤ 700 px and centred at x 500; the hook words moved to x 500 too.
7. **Capsules through headlines.** The CBFDA capsule crossed **ONLY 5 LEAVE.** for about 6 frames, and DE4AD crossed **CHECK, DON'T SEND.** The 2-fps sheet missed both; crops and the new check 4 caught them. Both capsules now fly a low arc, and **ONLY 5 LEAVE.** times out before the launch.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed. "Watched" means frame sheets at 2 fps, crops/stills of the headline shots and the pixel checks, not real-time playback.
- The API results are a snapshot (2026-11-21 11:45 UTC) and will change as breaches are added.
- The padding count differs from the docs' stated 800–1,000 range (see the test section).
- The k-anonymity caveat from 1Password (similar weak passwords) is in the caption, not the 30 s narration.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
