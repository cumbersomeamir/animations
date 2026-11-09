# 23 — Batch `2026-11-09-english-10` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-09-english-10/tensorblue-30s-english10-01.mp4`
(copied to `production/30s/2026-11-09-english-10/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 9 Nov 2026)
- **Topic:** why an incognito / private browser window does not make you invisible online. It contrasts the local history that is not saved with the website and network observations that still exist. The useful distinction is about shared devices, and the episode avoids claiming universal details.
- **History check:** not covered before. Episodes 12–22 covered CDN, optimistic updates, idempotency, raster vs vector, password manager, passkeys, OCR, QR, last-seat race, deleted-photo sync and DNS caching.
- **Earlier jobs:** none running. All accepted earlier episodes, through english-09, were already committed and pushed (verified before starting). No analytics were used or invented.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi audio. "Meshline/Recall" are other apps; their context was not read.
- **Style:** the most recently accepted Blue Receipt Theatre style kept: `brt.mjs` unchanged, Node + `@napi-rs/canvas`, **not Three.js**. Palette, captions, wipes and the English CTA card as accepted. No mascot, no decorative lines. The browser window is our own drawing: a "Private" pill on a navy title bar, not any real browser's UI.
- **Performance-sheet improvements:** the sheet is not in this container. Written points followed:
  - visibly intriguing first second: a private window opens `shop.example/gift`, and three observer cards pop in by 0.75 s (Website ✓, Network ✓, This device ✕);
  - a concrete real demo;
  - takeaway;
  - short CTA.

## The real browser demo (`src/demo/private_demo.mjs`, all on 127.0.0.1)
Setup:
- **Browser:** Playwright 1.63.0 driving the full Chromium build (`channel: 'chromium'`, new headless) with a persistent profile. The headless-shell build writes no History file, so it couldn't be used.
- **Site:** fictional `shop.example` (RFC 2606). A tiny "website" logs every request and sets one cookie per page (`seen_shoes`, `seen_gift`).
- **Network:** a logging HTTP proxy stands in for "your network". Only the demo site is relayed; Chromium's own background time check (`clients2.google.com`) was refused and is not counted.
- **Normal window:** visits `/shoes`.
- **Private window:** visits `/gift`, as an off-the-record context created over CDP with `Target.createBrowserContext`, which the DevTools Protocol describes as "Similar to an incognito profile".
- After both windows close, the profile's own `Default/History` and `Default/Cookies` SQLite files are read.

| observation | result (`demo/out/private-demo.json`) |
|---|---|
| private window cookies while open | `seen_gift` |
| a new private window after closing | no cookies |
| profile History after closing | `shop.example/shoes` only (normal window); `/gift` absent |
| profile Cookies after closing | `seen_shoes` only |
| website request log | `GET /shoes`, `GET /gift` (both windows) |
| network (proxy) log | `shop.example/shoes`, `shop.example/gift` (both windows). The video shows only the site name, which a network typically still sees even on HTTPS. |

The renderer reads the JSON and refuses to render if any of these results change.

## Final script (as spoken; 76 words, 24.4 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.40 | This window is private. So who can still see this visit? |
| L2 | 3.80–6.46 | Private mode mainly changes what this device keeps. |
| L3 | 6.71–9.59 | Close the window, and its history and cookies aren't kept. |
| L4 | 9.84–11.99 | Downloads and bookmarks you save still stay. |
| L5 | 12.24–19.23 | But the website still sees the visit, and so can whoever runs your network, like a school, employer or internet provider. |
| L6 | 19.48–23.56 | So it helps on a shared device. It doesn't make you invisible online. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** private /pɹˈIvət/, employer /ɪmplˈYjəɹ/, whoever /huˈɛvəɹ/, invisible, plus the accepted `[Tensorblue](/tˈɛnsəɹblˌu/)`. No new overrides needed.

## Source → claim map (primary/official, read 2026-11-09)
| claim | source | what it says |
|---|---|---|
| Closing the private window: its history and cookies aren't kept | **Google Chrome Help — Browse in Incognito mode** https://support.google.com/chrome/answer/9845881 ; demo | "After your Incognito session ends, Chrome doesn't retain site data or a record of the sites you visited." Cookies and site data are removed when the session ends. Demo: the profile's History and Cookies files hold only the normal window's entries. |
| Downloads and bookmarks you save still stay | Chrome Help (above) | "Chrome retains bookmarks that you save and files that you download when you exit Incognito." |
| The website still sees the visit | Chrome Help (above); demo | Websites you visit may still see your activity. Demo: the site's log has `GET /gift` from the private window. |
| So can whoever runs your network: school, employer, internet provider | Chrome Help (above); demo | "organizations that manage your network, like your school, employer, or internet service provider" may be able to observe your Incognito activity. Demo: the proxy log has `shop.example` for both windows. |
| The demo's private window is an incognito-like context | **Chrome DevTools Protocol — Target.createBrowserContext** (`browser_protocol.json`, ChromeDevTools/devtools-protocol) | "Creates a new empty BrowserContext. Similar to an incognito profile but you can have more than one." |

**Scope, not universal claims:**
- The narration says "private mode **mainly** changes what this device keeps" and never says every browser behaves identically.
- Chrome's own help page is the cited behaviour; the demo is Chromium.
- Firefox's and Safari's help pages could not be read from this container (served as script shells), so they are not cited.
- `gift-receipt.pdf` and the bookmark card are illustrative of Chrome's stated download/bookmark behaviour; they were not part of the demo run.

## Storyboard as built (8 scenes, 7 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.60 | **S1 Hook** | Frame 0: a private window ("Private" pill) at `shop.example/gift`; the page loads by 0.4 s. Three cards pop in from 0.45 s: Website ✓ "saw the visit", Network ✓ "saw the site", This device ✕ "won't keep it". Kinetic "Who can **still see?**" |
| 3.60–6.58 | **S2 While open** | Wipe →. The private window, plus a tray "on this device, while open": `open tab: shop.example/gift`, `cookie: seen_gift` (real). Kinetic "What this device **keeps.**" |
| 6.58–9.71 | **S3 After closing (real files)** | Wipe ←. The window shrinks away. "browser profile, after closing": History file `shop.example/shoes` ✓ (normal) vs dashed `shop.example/gift` (private: not saved); Cookies file `seen_shoes` ✓ vs dashed `seen_gift`; "real Chromium run". Kinetic "Aren't **kept.**" |
| 9.71–12.11 | **S4 What stays** | Wipe ↑. "still on this device": a downloaded file and a saved bookmark. Kinetic "Still **stay.**" |
| 12.11–14.16 | **S5 Website log (real)** | Wipe →. "shop.example's server log": `GET /shoes` (normal), `GET /gift` (private, outlined on "sees"). Kinetic "The website **still sees.**" |
| 14.16–19.38 | **S6 Network log (real)** | Wipe ←. "network log": `shop.example` for both windows; pills "a school", "an employer", "an internet provider" on the spoken words. Kinetic "Your **network**". |
| 19.38–25.80 | **S7 Takeaway** | Wipe →. Row ✓ "shared device — the next person won't find it in this browser's history"; row ✕ "online — websites and networks can still see the visit"; on the chime "private window: fewer traces on this device". Kinetic "Not **invisible.**" |
| 25.80–30.0 | **S8 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/private_demo.mjs` + `src/demo/out/private-demo.json`.

Reused unchanged from english-09: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`. `mix.py` was reused with only its seed (20261113), heading and an 8-chord scene score changed.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono (Apache-2.0).
- Logo: `assets/brand/tensorblue-logo.svg`.
- Playwright (Apache-2.0) and Chromium (BSD-style) were pre-installed in the container and run locally only.
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, real sites, real browsing data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-09-english-10/tensorblue-30s-english10-01.mp4` · SHA256 `4d063faf42d407bc00c1f418520275a4e88fdaf1ca41fc9e398ed93bade2b718` · 2,984,110 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 3.9 LU, **−1.8 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 11 groups pass: ink y 371–488, x 132–946 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | intriguing first second | private page loaded at 0.4 s; observer verdicts at 0.45–0.75 s |
| narration (one ASR pass, base.en, narration span) | intelligible | **WER 0.0 %**, 76/76 words matched, no low-confidence words |
| caption/speech timing | aligned | mean word-start drift 0.10 s, max 0.34 s |
| audio identity | ASR-checked audio = final audio | The last fix was visual only; the audio stream MD5 of the final file equals the ASR-checked export (`f7cef961…`). |
| scenes | mechanism moves with narration | 8 scenes / 7 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- The S2 tray first said "history: shop.example/gift" while the window was open. Private visits are not written to History even then, so it now says "open tab: …".
- The S6 log card was tightened.
- S3 had a ~0.6 s empty stage between the window closing and the profile card (the card now enters as the window closes).

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- The demo uses Chromium; other browsers' details may differ, which is why the narration avoids universal claims.
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
