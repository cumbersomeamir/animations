# 33 — Batch `2026-11-17-english-20` (batch20) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-17-english-20/tensorblue-30s-english20-01.mp4`, thumbnail `…/tensorblue-30s-english20-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-17-english-20/production-notes.md`. All earlier MP4s (including batch19 / english-19) are preserved unchanged.

## Brief and continuation (user-authorised, 18 Nov 2026)
- **Account move:** the user moved this app to a new account because the previous one was exhausted, and expressly authorised an app-isolated continuation on `cumbersomeamir/animations`, branch `claude-video/tensorblue` only. Everything was restored from the branch. Continuation note: `35-continuation-2026-11-18.md`.
- **Remote check first:** the branch held episodes through english-19. Nothing for batch20 or batch21 existed, so nothing was duplicated.
- **Topic (batch20, "finish first"):** how WhatsApp kept messages from disappearing on a bad connection. It covers documented store-and-forward and delivery acknowledgments, as a playful 3D message journey, with no invented internal architecture.
- **History check:** not a duplicate.
  - No earlier episode covers messaging delivery, delivery ticks, or a server holding messages for an offline recipient.
  - Nearest is english-12 (offline-first: a *document* edited offline, a local queue, CRDT conflicts). This episode is about one *message* crossing three stops and the confirmations between them.
  - english-11 named WhatsApp only for photo compression.
- **Feedback applied (2026-11-18, Published apps "Satisfied?", this app only):** "No, content is shit, make it about app development or something cool that some app did in the past, motion graphics lack 3d depth and are not fun at all." What changed:
  - **Content:** a real app's documented behaviour (WhatsApp's ticks and server storage), plus an app-builder payoff: "Building chat? Hold every message until the next stop confirms it."
  - **3D depth:** a new original module, `src/toy3d.mjs`.
    - Every object is a thick extruded toy. Its side walls are lit by their own normals, and the front face is lit, textured and glossed.
    - Distance fog and a horizon fade push far objects back.
    - The layout is a zigzag into depth (your phone near-left, the server mid-right, your friend far-left), so each stop gets its own band of the vertical frame and the camera travels through space.
    - Large foreground objects frame the shots. Objects fill the frame, where english-19 left large empty dark areas.
  - **Fun:** objects hop with squash-and-stretch.
    - A copy falls through a missing stepping pad (the bad link), turning red, and bumps the floor.
    - Tick tokens hop back as confirmations, a padlock drops on the stored message and its text scrambles into bytes, and a calendar block pops up for "up to 30 days".
    - The friend's phone wakes with a bounce, and the server's copy shrinks away when deleted.
  - **Sound:** new playful hop/fall/pop/rewind/stamp sounds.
- **Standing rules kept:**
  - frame zero is a composed, surprising subject plus 2–5 truthful words, with no fade or logo intro, working as the thumbnail, and hook audio at once;
  - Theory of Marketing structure and pacing;
  - one idea at a time;
  - captions inside x 100–900 (house band y 340–520);
  - the exact palette and logo, no decorative lines;
  - honest QA.
- **Language and voice:** English only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, narration from 0.10 s, and the accepted CTA. No Hindi. Other apps named in the brief (Ideaverse, Aarambh, Werbens, Mello, CalMeter, WastePaisa) were not read or used.
- **Colours** (tensorblue.com re-checked 2026-11-18: homepage + its three CSS files; logo SVG byte-identical, sha256 `e10eba43…`):
  - Palette: `#030610`, `#3B82F6`, `#FFFFFF`, `#D8E3F5`, `#B7C7DF`, logo `#0A6CFF`, navies `#050816` / `#08101F` / `#0B1423`.
  - Site tokens, all still defined: **amber-400 `#FFB900`** (the clock, "STILL ON YOUR PHONE", 30 days), **red-500 `#FB2C36`** (a lost copy, 3 / 20), **cyan-400 `#00D3F2`** (back online, STORE-AND-FORWARD), **green-400 `#05DF72`** (DELIVERED, 20 / 20).
  - The chat UI is our own generic drawing: navy screen, pale bubbles, gray ticks. It is not WhatsApp's UI, colours or logo.

## The test (`src/demo/delivery_demo.py`; Python 3 standard library, real UDP sockets on 127.0.0.1)
- **What it is:** our own small model of the generic design. It is **not WhatsApp's code or protocol**.
- **Cast:**
  - a sender (your phone) sends 20 messages, one every 50 ms;
  - a **bad link** relays phone ↔ server and drops packets in both directions;
  - a server relays to the friend;
  - the friend's phone is **off** until 0.6 s (no socket listening).
- **The drop rule:** a packet drops when a SHA-256 hash of (direction, kind, message id, attempt) falls under 33 %, so the same packets drop on every run whatever the timing. Over 10,000 hashes the rate is 32 %. In this run 10 of the 20 first tries happened to drop.
- **Two designs:**
  - **send-once:** no acknowledgments and no storage;
  - **store-and-forward:** the phone keeps each message and resends every 120 ms until the server acknowledges it (one tick). The server keeps it until the friend's phone acknowledges, then deletes its copy and sends a delivered receipt (two ticks), resent until the phone confirms. Resends are de-duplicated by message id.
- **Results** (`demo/out/delivery-demo.json`, identical on three runs):

| | send-once | store-and-forward |
|---|---|---|
| reached the friend | **3 of 20** (ids 14, 16, 18) | **20 of 20** |
| lost on the bad link | 10 (first and only try) | 0 (21 message drops, all resent) |
| arrived while the friend was off, nowhere to keep | 7 | 0 (server held up to 19) |
| send attempts | 20 | 57 |
| server copies at the end | 0 | **0** |
| final ticks on the phone | none | **two ticks on all 20** |

- The proof shot replays this log on two lanes at the same time scale (1 s of test = 2.4 s of video). Launch times, which tries fall, the server's held count ("HOLDING n") and both counters come from the log. The renderer stops if any of these results change.

## Final script (as spoken; 79 words, 29.55 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–2.94 | One gray tick, not two. Where's your message right now? |
| L2 | 3.19–4.53 | Each tick marks a hand-off. |
| L3 | 4.78–6.89 | A clock: still on your phone, not sent yet. |
| L4 | 7.14–12.71 | One tick: sent. Friend offline? WhatsApp's servers keep it, encrypted, up to thirty days. |
| L5 | 12.96–17.09 | Phone back on? Two ticks: delivered, and the server deletes its copy. |
| L6 | 17.34–22.31 | Our bad-link test: send-once delivered three of twenty; store-and-forward, all twenty. |
| L7 | 22.61–26.48 | Building chat? Hold every message until the next stop confirms it. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** "WhatsApp's" /wˌʌtsˈæps/, "hand-off", "send-once", "store-and-forward", "bad-link" and "gray" phonemise normally; `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override. Kokoro leaves a 0.18 s micro-pause at the hyphen in "send-once" (voice track silent 18.92–19.10 s).

**Timing edits from the draft (93 → 79 words):** L3 dropped "it's"; L4 "If your friend is offline" became "Friend offline?"; L5 became "Two ticks: delivered"; L6 was tightened; L7 "Keep" became "Hold". Gaps were cut to 0.25 s so the payoff ends at 26.48 s.

## Source → claim map (read 2026-11-18)
WhatsApp pages could not be fetched raw from the container (they return an error page to curl), so they were read through the web fetcher. The quotes below are its verbatim excerpts. Standards were fetched raw and checked verbatim.

| claim | kind | source and what it says |
|---|---|---|
| A clock: still on your phone, not sent yet | documented | **WhatsApp Help Center — How to check read receipts** https://faq.whatsapp.com/665923838265756: "Seeing a clock means the message is not yet sent or delivered." **WhatsApp Privacy Policy** (effective January 4, 2021) https://www.whatsapp.com/legal/privacy-policy: "Instead, your messages are stored on your device and not typically stored on our servers." |
| One tick: sent | documented | Help Center (above), one gray check mark: "The message was successfully sent." |
| Friend offline? WhatsApp's servers keep it, encrypted, up to thirty days | documented | Privacy Policy: "Undelivered Messages. If a message cannot be delivered immediately (for example, if the recipient is offline)," … "we keep it in encrypted form on our servers for up to 30 days as we try to deliver it." "If a message is still undelivered after 30 days, we delete it." |
| Phone back on? Two ticks: delivered | documented | Help Center, two gray check marks: "The message was successfully delivered to the recipient's phone or any of their linked devices." Also: "If the recipient's phone is off and the message isn't delivered to any of their linked devices," (no second check). |
| …and the server deletes its copy | documented | Privacy Policy: "Once your messages are delivered, they are deleted from our servers." |
| Each tick marks a hand-off | summary of the two documented ticks | one tick = sent (reached WhatsApp); two ticks = reached the recipient's device |
| Our bad-link test: send-once 3 of 20; store-and-forward 20 of 20 | measured on our model | `demo/out/delivery-demo.json` (above) |
| Building chat? Hold every message until the next stop confirms it | documented design principle | **XEP-0198 Stream Management** https://xmpp.org/extensions/xep-0198.html: "until a stanza has been affirmed as handled by the server, that stanza is the responsibility of the sender (e.g., to resend it or generate an error if it is never affirmed as handled by the server)"; a server SHOULD treat unacknowledged stanzas "by either returning an error to the sender, delivery to an alternate resource, or committing the stanza to offline storage". **XEP-0184 Message Delivery Receipts** https://xmpp.org/extensions/xep-0184.html: "the sender of a message can request notification that the message has been delivered to a client controlled by the intended recipient." **RFC 5321 (SMTP) §6.1** https://www.rfc-editor.org/rfc/rfc5321.txt: "When the receiver-SMTP accepts a piece of mail … it is accepting responsibility for delivering or relaying the message … It MUST NOT lose the message for frivolous reasons". WhatsApp's own pages show the same pattern: kept until delivered, then deleted. |

**Illustrative, not claims:**
- Sam, Alex, "Dinner later?" / "See you at 8!", the chat screens and the "9f2c a71e" bytes, which stand for encrypted content and are not real ciphertext;
- the stepping pads (the bad link), the server tower, the padlock and the calendar block;
- the flight times, and the "rewind" at 4.7 s that replays the journey from the start.

**Deliberately not claimed:**
- WhatsApp's internal protocol, servers, retry timing or architecture. The XMPP and SMTP documents are cited as standard designs, not as what WhatsApp runs.
- Read receipts (blue ticks), group-chat ticks and linked-device details are not covered.
- "Up to 30 days" is WhatsApp's stated maximum, not a typical time.
- No Tensorblue product feature is implied. No WhatsApp UI or logo is reproduced.

## Storyboard as built (7 shots, 2 blue wipes for the proof set, then the CTA wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.05 | **1 Hook — frame zero** | Frame 0: your phone big in the foreground showing "See you at 8!" with **one gray tick**. Behind it is the SERVER tower, its glass window holding the message as a locked bubble of scrambled bytes; your friend's phone stands dark ("OFF") far behind. **ONE TICK. / WHERE IS IT?** is already on screen, with a sound on frame 0. Slow push-in; on "Where's" the server gives a little hop. |
| 3.05–4.68 | **2 Hand-offs** | The camera cranes up over the whole relay. Tags YOU / SERVER / FRIEND. On "marks" a one-tick token hops from the server back down the pads to your phone; on "hand-off" a two-tick token hops from the friend's phone to the server. |
| 4.68–7.0 | **3 Clock** | A rewind: the message zips back into your phone and the screen shows a clock. On "still" the bubble pops out of the screen and hovers with a big amber clock ("STILL ON YOUR PHONE"). On "not sent" a copy hops onto the first pad; the middle pad drops away; the copy turns red, falls and bumps the floor ("LOST ON THE WAY"). The original stays. |
| 7.0–12.85 | **4 One tick, held** | The pad returns and the camera rides along as a copy hops across three pads into the server ("SENT ✓"). A tick token hops back and your screen shows one tick. A glance at the far phone: "OFFLINE". Then a close-up on the server: "KEPT ON THE SERVER". On "encrypted" a padlock drops on and the text scrambles to bytes ("ENCRYPTED"). On "thirty" a calendar block "30 DAYS" pops onto the server's front ("UP TO 30 DAYS"). |
| 12.85–17.2 | **5 Delivered** | The friend's phone wakes with a bounce ("BACK ONLINE"). A copy hops round the server to it and appears on its screen. A two-tick token hops back to the server ("DELIVERED ✓✓") and on down to your phone (two ticks). The camera pulls back; on "deletes" the server's copy shrinks away ("COPY DELETED"). |
| 17.2–22.45 | **6 Proof** | Wipe ↑ to two lanes, SEND-ONCE and STORE-AND-FORWARD. They replay the test log at the same speed. Messages hop out; lost tries turn red and fall. On send-once, messages arriving while the friend is off are tossed. On store-and-forward the phone resends, the server shows "HOLDING n", and when the friend comes on everything flows across. The counters land on **3 / 20** (red) and **20 / 20** (green). |
| 22.45–26.6 | **7 Payoff** | Wipe ↑ back to the relay (slow crane). One message makes the whole journey: each stop glows while it holds it, until the tick comes back. Kinetic **HOLD IT / UNTIL CONFIRMED.** |
| 26.6–30.0 | **CTA** | Blue wipe ↑ into the accepted end card (logo, "Tensor**blue**", "software explained simply", Follow). |

**Thumbnail** (`tensorblue-30s-english20-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark in the empty top. **ONE TICK. WHERE IS IT?** (5 words).

## Provenance and licences
New this round:
- `src/toy3d.mjs`: extruded lit toys, fog, light pools, squash/hop helpers, blurred layers;
- `src/scene.mjs`;
- `src/demo/delivery_demo.py` + `src/demo/out/delivery-demo.json`;
- `src/transitions.mjs`: the transitions sheet, decoded from the exported MP4;
- `src/proj-check.mjs`: a dev helper that prints projected positions for camera tuning; not used in the render.

Reused from english-19:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `requirements-audio.txt`;
- `mix.py`: heading, seed (20261123), an 8-chord shot score and new SFX types (hop, fall, pop, rewind, stamp, unpop, reject);
- `package.json`: only `@napi-rs/canvas` 1.1.0 (npm).

Toolchain restored in the new container from official registries at the pinned versions:
- Python 3.12 venv: torch 2.15.0+cpu (PyTorch CPU index), kokoro 0.9.4, misaki 0.9.4, spaCy 3.7.5;
- `en_core_web_sm` 3.7.1 from `spacy/en_core_web_sm` rev `8fb6f81` (sha256 `86cc141f…` matches);
- Kokoro-82M rev `f3ff357`, faster-whisper 1.2.1 with `Systran/faster-whisper-base.en` rev `3d3d5de`.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono (Apache-2.0) for the encrypted bytes.
- Voice: Kokoro-82M (Apache-2.0).
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-17-english-20/tensorblue-30s-english20-01.mp4` · SHA256 `70d7eec4a4c05865b323bf38fe724cce9507d026bb4f6b5906ba5670661f119b` · 6,777,323 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = phone with one tick, server holding the locked message, dark far phone + "ONE TICK. WHERE IS IT?" fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1, thumbnail) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, ~1.6 Mb/s; `+faststart` (top-level atoms ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~191 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 1.8 LU, **−1.9 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 17 groups pass: ink x 140–856, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | every group starts 0.06 s before Kokoro's word onset and dissolves into the next |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–5 large words | frame zero + wordmark, viewed at full size |
| narration (one ASR pass, base.en, narration span) | intelligible | Every scripted word heard. WER 7.2 % is tokenisation ("hand off", "What's app", "bad link", "send once", "Store and forward", "30", "20", "TensorBlue") plus one doubled "until" (see Known limits). Mean start drift 0.13 s (`qa/asr.json`). |
| audio identity | ASR-checked audio = final audio | The last fix was visual only. The final file's audio-stream MD5 equals the ASR-checked export (`8e41e576…`). |
| shots / transitions | one idea at a time, purposeful moves | 7 shots, 2 proof-set wipes, 1 CTA wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (22 frames: frame 0 + around each change, decoded from the final MP4) viewed. Full-resolution crops of the phone screen and server window checked. |

**Fixed during QA:**
1. **Layout.** The first layout (objects spread sideways) put the frame-zero words on the server and hid the friend's phone behind it. A zigzag-into-depth layout, cameras set with a projection helper, and slightly raised hook words fixed it.
2. **Clock shot.** The hovering original hid the copy's attempt, and the falling copy dropped through the floor. The original now hovers to the side, and the copy bumps the floor and fades.
3. **Placement.** The calendar was out of frame in the close-up, and the "KEPT ON THE SERVER" / "ENCRYPTED" / "COPY DELETED" tags covered the SERVER title.
4. **Proof lanes.** The far phones were hidden behind the servers; the lanes now open in a V. The counters no longer cover the phones.
5. **Text size.** The screen UI was enlarged so the frame-0 tick reads on a phone.
6. **Seam.** A faint diagonal seam ran across textured faces where two clipped texture triangles met. It is fixed in `toy3d.mjs`: the first triangle paints the whole face.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check; no listening check was performed.
- ASR heard "until until". The voice track has a single continuous "until" (energy 24.70–25.0 s; Kokoro's word 24.80–25.02 s, which cannot hold two), so this is a Whisper artefact. "send" got low confidence (0.23) because Whisper began it inside the silence before it; the voice starts at 18.57 s, as captioned.
- The test is our model on one machine's loopback network, not WhatsApp. Its drop rule, timings and counts are settings of the test.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
