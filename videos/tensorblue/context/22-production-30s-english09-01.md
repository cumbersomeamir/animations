# 22 — Batch `2026-11-08-english-09` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-08-english-09/tensorblue-30s-english09-01.mp4`
(copied to `production/30s/2026-11-08-english-09/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 8 Nov 2026)
- **Topic (engineering mystery):** why a website can work for your friend but fail on your phone. A cached DNS record points to the old server, while a refreshed record reaches the new one. The episode separates DNS caching from other causes and gives the practical diagnostic lesson.
- **History check:** not a duplicate.
  - Round 01 (episode 12) was CDN edge caches: copies of *content* near users. DNS appears there only as routing to the nearest edge.
  - This episode is about a resolver caching a *name → address* answer (TTL) while a site moves servers.
  - Episodes 13–21 are unrelated.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi audio. "Meshline/Recall" are other apps; their context was not read.
- **Style:** the most recently accepted Blue Receipt Theatre style kept: `brt.mjs` unchanged, Node + `@napi-rs/canvas`, **not Three.js**. Palette, captions, wipes and the English CTA card as accepted. No mascot. No connector lines: question and answer cards are handed between objects.
- **Performance-sheet improvements:** the sheet is not in this container. Written points followed:
  - visibly intriguing first second: two phones open the same address; your friend's loads at 0.45 s while yours shows "Can't connect" at 0.6 s;
  - a concrete real demo;
  - a diagnostic payoff plus one practical tip;
  - short CTA.
- **Older jobs:** none running; english-08 was already committed and pushed.

## The real DNS demo (`src/demo/dns_demo.py`, all on 127.0.0.1)
Setup:
- Authoritative server: dnslib 0.9.26, for the fictional `shop.example` (`.example` is reserved by RFC 2606), TTL 30 s. It answers the **old server 192.0.2.10**, then the **new server 198.51.100.20** (both from the RFC 5737 documentation ranges).
- Two caching resolvers: dnsmasq 2.91, "your resolver" on :5401 and "your friend's resolver" on :5402.
- Every question is asked with `dig 9.18.39` (`dig @127.0.0.1 -p … shop.example A +noall +answer`).

| t (s) | who | real answer |
|---|---|---|
| 0.0 | your resolver (before the move) | `shop.example. 30 IN A 192.0.2.10` |
| 2.0 | site owner | record changed to 198.51.100.20 |
| 2.5 | authoritative server | `shop.example. 30 IN A 198.51.100.20` |
| 2.5 | your resolver (answered from cache) | `shop.example. 27 IN A 192.0.2.10` (**stale**) |
| 2.6 | friend's resolver (first ask, after the move) | `shop.example. 30 IN A 198.51.100.20` |
| 30.6 | your resolver (after the 30 s TTL ran out) | `shop.example. 30 IN A 198.51.100.20` (refreshed) |

The renderer reads `demo/out/dns-demo.json` and refuses to render if any of these results change. On screen:
- the "real dig answer" lines in S2 and S4;
- your resolver's TTL counting 30 → 27 in S3;
- the addresses throughout.

## Final script (as spoken; 76 words, 24.8 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.38 | It works on your friend's phone, but not on yours. Why? |
| L2 | 3.78–7.56 | Phones get a site's address from a DNS resolver, which caches it. |
| L3 | 7.81–13.28 | The site moved servers. Your resolver keeps the old address until its time-to-live runs out. |
| L4 | 13.53–16.84 | Your friend's resolver asked after the move and got the new one. |
| L5 | 17.09–22.43 | Compare both phones' addresses. Old one on yours? Stale cache. Same? Look elsewhere. |
| L6 | 22.68–25.09 | Moving a site? Lower the TTL first. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked; overrides in `script.json`):**
- `[time-to-live](/tˈIm tə lˈIv/)`: misaki read "live" as the verb /lɪv/.
- `[elsewhere](/ˈɛlswˌɛɹ/)`: misaki gave /ˈɛlshwˌɛɹ/.
- Checked without change: DNS /dˌiˌɛnˈɛs/, resolver, TTL /tˌitˌiˈɛl/, and the accepted `[Tensorblue](/tˈɛnsəɹblˌu/)`.

**Edits:** the 85-word draft ran 28.7 s. It was tightened to 76 words without losing a claim; the RFC 1034 tip line was kept.

## Source → claim map (primary sources, read 2026-11-08)
| claim | source | what it says |
|---|---|---|
| Phones get a site's address from a DNS resolver, which caches it | **RFC 1034 — Domain Names: Concepts and Facilities** https://www.rfc-editor.org/rfc/rfc1034 | §5.1: the resolver avoids network delay by "answering them from its cache of prior results." |
| The resolver keeps the old address until its time-to-live runs out | **RFC 1035 — Domain Names: Implementation and Specification** https://www.rfc-editor.org/rfc/rfc1035 ; RFC 1034 | RFC 1035 §4.1.3: TTL is "a 32 bit unsigned integer that specifies the time interval (in seconds) that the resource record may be cached before it should be discarded." RFC 1034 §3.6: "The TTL describes how long a RR can be cached before it should be discarded." Demo: TTL 27, still 192.0.2.10 after the change. |
| The friend's resolver asked after the move and got the new one | demo (above) | First query to a resolver with an empty cache, after the change, returned 198.51.100.20. |
| Compare addresses: old one on yours → stale cache; same → look elsewhere | reasoning from the mechanism + demo | If both devices resolve the same address, a DNS cache cannot explain one failing. The on-screen alternatives (the app, the network, the server) are where to look next. |
| Moving a site? Lower the TTL first | **RFC 1034** §3.6 | "If a change can be anticipated, the TTL can be reduced prior to the change to minimize inconsistency during the change." |

**Illustrative, not claims:**
- `shop.example`, the phones, the "Can't connect" screen (original wording, not a real browser's UI) and the "example settings" record card (3600 s → 60 s) are a fictional example.
- Real TTLs vary. Phones and apps can also cache answers themselves; "your resolver" stands for whichever cache answered.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.58 | **S1 Hook** | Frame 0: two phones ("You", "Friend") loading `shop.example`. Friend's loads the shop page ✓ at 0.45 s; yours shows "Can't connect" ✕ at 0.6 s; pill "same address: shop.example"; kinetic "**Why?**" |
| 3.58–7.68 | **S2 Lookup + cache** | Wipe →. Your phone hands "shop.example?" to "DNS resolver · yours"; the answer card `192.0.2.10` comes back and the cache row fills (TTL 30 s); "real dig answer…"; kinetic "DNS **resolver**". |
| 7.68–13.40 | **S3 The move (isometric stage)** | Wipe ←. Slab with two servers (`192.0.2.10`, `198.51.100.20`). The blue "site" block hops to the new server; the old server goes dark ("old server off"). Your resolver card keeps `192.0.2.10`, TTL counting down; "still cached"; kinetic "**time-to-live**". |
| 13.40–16.96 | **S4 Friend's fresh answer (mirror of S2)** | Wipe ↑. Friend's resolver starts "empty", is asked "after the move", and returns `198.51.100.20` (blue). The friend's page loads ✓; "real dig answer…"; kinetic "Got the **new one.**" |
| 16.96–22.55 | **S5 Diagnostic** | Wipe →. Cards "Your phone 192.0.2.10 · old" vs "Friend's phone 198.51.100.20"; verdict "Different, old on yours: stale cache". On "Same?" both show the same address: "Same address: not DNS" + pills "the app", "the network", "the server" ("look elsewhere"). Kinetic "Stale **cache.**" → "Look **elsewhere.**" |
| 22.55–25.80 | **S6 Owner's tip** | Wipe ←. "DNS record · example settings": the TTL slides 3600 s → 60 s on "Lower", "before moving" → "then move"; "old answers expire sooner" on the chime. Kinetic "Lower the **TTL first.**" |
| 25.80–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/dns_demo.py` + `src/demo/out/dns-demo.json`.

Reused unchanged from english-08: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`. `mix.py` was reused with only its seed (20261112), heading and chord comments changed.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono for addresses (Apache-2.0).
- Logo: `assets/brand/tensorblue-logo.svg`.
- Tools run locally only: dnslib (BSD, PyPI 0.9.26), dnsmasq (GPL, Ubuntu `dnsmasq-base 2.91-0ubuntu0.24.04.2`), dig (MPL-2.0, Ubuntu `bind9-dnsutils 1:9.18.39-0ubuntu0.24.04.9`).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, real domains or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-08-english-09/tensorblue-30s-english09-01.mp4` · SHA256 `6123f26e4df4d7abf170bcfa7c4ca92d5cb6879b5ed795381ccd78fa591060fd` · 2,931,371 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 2.6 LU, **−1.9 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 14 groups pass: ink y 371–488, x 128–951 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | intriguing first second | friend's page loads at 0.45 s, yours fails at 0.6 s, same address |
| narration (one ASR pass, base.en, narration span) | intelligible | every word heard; WER 1.3 % = "its time-to-live" written "it's time to live" (same sound); low confidence only "cache." 0.56 |
| caption/speech timing | aligned | hyphen-aware alignment matched 76/76 words: mean start drift 0.10 s, max 0.44 s ("and" in L4, not a cue word). The script's own greedy matcher matched 34/76 because "time-to-live" splits into three tokens. |
| audio identity | ASR-checked audio = final audio | The last fix changed captions only; the audio stream MD5 of the final file equals that of the ASR-checked export (`07662b88…`). |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- "time-to-live" and "elsewhere" were mispronounced (overrides).
- Two script trims for timing.
- S3's resolver card crowded the servers, and the addresses ran off the server faces (stage lowered, address pills).
- S4 was cluttered (restaged to mirror S2).
- S5's kinetic said "Stale cache?" over the "not DNS" verdict (it now exits, and "Look elsewhere." follows).
- The TTL chip covered the friend's address (moved to the cache label row).
- One caption line was too wide: the render guard stopped at frame 513, and the line was split.
- A caption group repeated "until its" (re-split at "until").

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- Other layers can cache too: phone OS, browser, apps. The video keeps to "your resolver" as the cache that answered.
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
