# 14 — Feedback round `2026-11-02-feedback-round` · 30s · feedback-01

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-02-feedback-round/tensorblue-30s-feedback-01.mp4`
(copied to `production/30s/2026-11-02-feedback-round/production-notes.md`). Rounds 01 and 02 and their MP4s are preserved unchanged.

## Episode brief (from the user)
- **Topic:** Why retrying a payment request should not create another charge — idempotency, with one purchase and one receipt.
- **Audience:** developers and curious non-developers. Teach: retries carrying the SAME unique request key return the recorded result; a different key is another request.
- **Mechanism source:** Stripe's official idempotent-request documentation. Illustrative demo only — no claim that every bank or app prevents duplicate payments.
- **Visual replacement:** custom style recipe **"Blue Receipt Theatre"** (premium kinetic typography + tactile minimal UI cards + simple isometric checkout stage), now Tensorblue's durable default — see `11-production-format.md`. One recognisable checkout UI, a single blue purchase token, a white receipt; a retry card slides into a physical duplicate-check slot and the SAME receipt comes back; close-up of matched request IDs; clean one-order/one-receipt outcome; ≥ 5 purposeful scene changes. No moving-line networks, particles, rings, wandering connectors, grid motion, mascots.
- **Palette:** `#030610`, `#3B82F6`, `#FFFFFF`, `#D8E3F5`, `#B7C7DF` (checked at tensorblue.com); preserve the logo relationship.
- **Captions:** y < 300 clear; captions in y 340–520, x 90–990, max two lines.
- **CTA:** short, useful, says Tensorblue, in the final 3–4 s.

## Final script (as spoken; 72 words, 22.9 s of speech)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–2.36 | You tap Pay. The connection drops. |
| L2 | 2.85–4.29 | Should a retry charge you twice? |
| L3 | 5.00–8.32 | A well-designed checkout sends that purchase with one unique key. |
| L4 | 8.80–14.96 | If a retry arrives with the same key, the server returns the saved result, instead of charging again. |
| L5 | 15.31–16.79 | This is called idempotency. |
| L6 | 17.14–19.51 | Keep the same key for retries of one purchase. |
| L7 | 19.86–21.42 | A new key means a new request. |
| L8 | 21.80–23.73 | One purchase, one key, one receipt. |
| L9 | 26.20–28.75 | Follow Tensorblue for software explained simply. (CTA) |

**Edits from the draft and why:**
- "A well-designed API gives that purchase a unique key" → "A well-designed checkout sends that purchase with one unique key": per Stripe, *the client* generates the idempotency key; the API does not hand it out. "Well-designed" is the brief in-sentence qualification (not every app does this).
- "If the same request comes back with the same key, it returns the saved result instead of creating another charge" → "If a retry arrives with the same key, the server returns the saved result, instead of charging again" (shorter; same claim as Stripe's "Retries with the same key return the saved response").
- "The important detail: keep the same key…" → "Keep the same key for retries of one purchase." (timing).
- Added the takeaway line "One purchase, one key, one receipt." (matches the outcome scene).
- "Should retrying charge you twice?" → "Should a retry charge you twice?": Kokoro's G2P stressed *retrying* on the first syllable (ASR heard "retrain"; with a stress override ASR heard "retry and"). "A retry" uses the dictionary pronunciation and matches L4.
- CTA kept as written. Pronunciation override `[Tensorblue](/tˈɛnsəɹblˌu/)` (word not in the misaki lexicon).

## Source → claim map (official documentation, read 2026-11-02)
| claim | source | what it says |
|---|---|---|
| A retry after a dropped connection can be repeated safely with an idempotency key | **Stripe API reference — Idempotent requests** https://docs.stripe.com/api/idempotent_requests | "The API supports idempotency for safely retrying requests without accidentally performing the same operation twice. When creating or updating an object, use an idempotency key. Then, if a connection error occurs, you can safely repeat the request without risk of creating a second object or performing the update twice." |
| The checkout (client) sends the purchase with one unique key | same | "A client generates an idempotency key, which is a unique key that the server uses to recognize subsequent retries of the same request." Stripe suggests V4 UUIDs or another random string with enough entropy. |
| Same key → the server returns the saved result | same | "Stripe saves the status code and body of the first request made with a given idempotency key after endpoint execution begins… Retries with the same key return the saved response, including 500 errors." |
| Keep the same key for retries of one purchase | **Stripe — Low-level error handling** https://docs.stripe.com/error-low-level | "When retrying the same operation, preserve the idempotency key and parameters within the retry window." "Retrying with the same key returns the cached response while Stripe retains it." |
| A new key means a new request | Stripe API reference (above) | The key is how the server "recognize[s] subsequent retries of the same request"; a request with a different key is not recognised as a retry, so it is processed as a new request (shown as a second receipt). |
| Why duplicates matter (context) | **Stripe blog — Designing robust and predictable APIs with idempotency** https://stripe.com/blog/idempotency | "…an API endpoint to charge a customer money; accidentally calling it twice would lead to the customer being double-charged… This is where idempotency keys come into play." |

**Illustrative, not claims:** "Blue mug $18.00", receipt numbers #1042/#1043, keys "7F3A"/"B91C" (short stand-ins for long random keys), the "duplicate check" machine. Not shown or implied: that every bank/app deduplicates payments, retention windows, statistics.
**Detail deliberately left out for length:** Stripe also compares the retry's parameters with the original and errors if they differ; keys may be removed after at least 24 h (API v1). These are in the publishing caption sources.

## Storyboard as built (9 scenes, 8 blue wipes)
| time (s) | scene | what happens | sound |
|---|---|---|---|
| 0–2.5 | **S1 Checkout (hook)** | Real checkout card on frame 0 (Blue mug, Total, blue "Pay $18.00"). Tap at 0.66 s → the blue purchase token pops out and flies; on "drops" the Wi-Fi arcs vanish, the token dims with "no reply", status "No response"; kinetic "Connection **lost.**" | tap, clack, two-step drop, type thumps |
| 2.5–4.6 | **S2 The fear (before)** | Wipe →. Receipt #1042 is there; on "charge" a duplicate #1043 slides in ("charge 1" / "charge 2?"); kinetic "Charged **twice?**" | wipe, paper ×2, thump |
| 4.6–8.5 | **S3 One purchase, one key** | Wipe ←. Mini checkout highlights; the token leaves it and grows; on "unique key" its white notch bars are cut in and "7F3A" appears ("unique key" tag); kinetic "1 purchase **= 1 key**". | clack, carve ticks, blip |
| 8.5–15.0 | **S4 Isometric stage: duplicate-check slot** | Wipe ↑. Navy slab + pale "DUPLICATE CHECK" machine; a pale "SAVED" card: key 7F3A → receipt #1042. A "retry" token (same bars) slides along the lane into the slot; the slot turns blue: "same key ✓". On "returns the saved result" the SAME receipt #1042 comes out ("same receipt"); on "instead of charging again" a dashed ghost #1043 is struck through: "no second charge". | slide, slot thunk, match, paper, strike |
| 15.0–16.9 | **S5 The name** | Wipe →. Kinetic "This is called / **idempotency**"; reminder: token + token → one receipt; "same key, same result". | thump, clack |
| 16.9–19.6 | **S6 Close-up: matched request IDs** | Wipe ←. "first try" and "retry" tokens side by side, blue "=", both "key 7F3A" underlined; on "retries of one purchase" both settle onto the single receipt #1042. | match, soft slide |
| 19.6–21.5 | **S7 New key = new request** | Wipe →. Left: 7F3A → #1042. Right: a token with different bars "B91C" ("new key") arrives and a NEW receipt #1043 prints ("new request"); kinetic "**new key** = new request". | clack, paper, low blip |
| 21.5–25.9 | **S8 Outcome (takeaway)** | Wipe ←. "Order placed ✓"; one receipt #1042; "1 purchase · 1 key · 1 receipt" land on the words; on the chime the token docks onto the receipt. | blips ×3, chime |
| 25.9–30.0 | **S9 CTA** | Wipe ↑. Tensorblue drop logo; "Tensor**blue**" wordmark; "software explained simply"; blue "Follow" pill. | soft clack, thump, tap |

## Provenance and licences
| item | source | licence / note |
|---|---|---|
| All layout, animation, iso stage, score, SFX | original code in `production/30s/2026-11-02-feedback-round/src/` | original work for Tensorblue |
| Style recipe | user's feedback-round brief ("Blue Receipt Theatre"); Instagram references listed in `11-production-format.md` (not viewable from the container; nothing copied) | — |
| Logo mark | `assets/brand/tensorblue-logo.svg` from https://www.tensorblue.com/tensorblue-logo.svg (the user's own site), sha256 `e10eba43…bdde69` | user's brand asset, used unmodified |
| Fonts | Inter 4.0 + Inter Display Bold/ExtraBold (`assets/fonts/inter/`, Debian `fonts-inter` of rsms/inter) | SIL OFL 1.1 |
| Narration | Kokoro-82M cached (`hexgrad/Kokoro-82M` rev `f3ff357`), offline, `af_bella`×0.7 + `am_puck`×0.3, speed 0.98, en-us | Apache-2.0; synthetic voice |
| Runtime | Python 3.12 venv (kokoro 0.9.4, misaki 0.9.4, torch 2.15.0 CPU, faster-whisper 1.2.1); `@napi-rs/canvas` 1.1.0 | reused from earlier rounds |
No paid APIs, Blender, secrets, or other apps' files were used.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-02-feedback-round/tensorblue-30s-feedback-01.mp4` · SHA256 `8bcad65fe0865c8a337ba1e99b98891c628b46a453dbee79a93ae68611fa0c37` · 3,550,364 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 **High**, 1080×1920, 30/1, yuv420p, ~0.75 Mb/s (flat graphics; full-res crops sharp, no banding), `+faststart` |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio and container all 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC, 48000 Hz, stereo, ~190 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 3.0 LU, **−1.9 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 13 groups pass: ink y 371–488, x 185–890 |
| top band | y < 300 clear; stage never under captions | 0 differences vs background in y 0–539 (except captions) across 90 sampled frames |
| narration (ASR, final MP4) | intelligible | faster-whisper base.en: **WER 0.0** (71/71 words matched); lowest confidence "You" 0.36 and "pay" 0.38 (both recognised correctly) |
| timing | captions/cues follow speech | mean word-start drift 0.10 s (Whisper starts slightly early after pauses; max 0.46 s) |
| audio balance | voice clear | during speech: music ≈ 21 dB and SFX ≈ 18 dB under the mix; 0 clipped samples; mix regenerates bit-identically |
| scenes / transitions | ≥ 5 distinct scenes | 9 scenes, 8 wipes; `qa/contact-sheet-1fps.png` and `qa/transitions.png` (25 frames across every wipe) viewed |

**Fixed during QA:** stalled token hid the Wi-Fi glyph and its "?" was clipped (moved); "Connection lost." sat in the bottom overlay (moved up, one line); machine label overflowed its face (bigger stage, fitted label); "#1042" overflowed the SAVED card; returned receipt covered the machine label; takeaway token covered "#1042" and the 2 s hold was static (token now docks on the chime); frame 0 showed a blank checkout card (now fully drawn); S2 opened on an empty stage (first receipt now present at the wipe); "retrying" mispronounced (reworded, see above).

**ASR passes, honestly counted:** 4 runs on successive export candidates — #1 caught "retrying" → "retrain"; #2 (stress override) heard "retry and"; #3 after rewording: WER 0.0; #4 on the final file (only SFX timing changed; narration samples identical): WER 0.0. Each re-run verified a single targeted fix, not a broad rework.

**Known limits:** I cannot listen; intelligibility rests on ASR + level metering. The Instagram references could not be viewed. Small labels on the stage (e.g. "SAVED", "no reply") are 26–34 px. The local Desktop/video-review folder does not exist in this cloud container, so the finished MP4 is delivered as the chat attachment and on the branch.
