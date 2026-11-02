# 12 — Production round `production-30s-2026-11-02` · 30s · 01

**Status:** delivered — see QA below. Output: `videos/tensorblue/production/30s/2026-11-02/tensorblue-30s-production-01.mp4`
(the same notes are copied to `production/30s/2026-11-02/production-notes.md`).

## Brief (user-approved)
- **Episode:** Why websites keep copies close to you (system design: CDN edge caches).
- **Format:** ONE new 30.000 s portrait educational video (not a trim, not an app campaign).
- **Look:** an inventor's moving crosshatched notebook (Animate → Crosshatch), neutral ink/cream fallback palette because no approved Tensorblue brand file exists in this branch.
- **Visual story rules:** sketched globe; original server → two edge caches → users; ink packets visibly taking shorter paths; stale copy, then refresh, with timestamps; every drawing participates in the mechanism; hand lines, held frames that boil, erase residue, purposeful close-ups, paper texture.
- **Claim rules:** CDN/cache explanation checked against official Cloudflare and AWS documentation; latency depends on many factors; no invented speed figures; no fake news or repository announcements.

## Final script (as spoken; 68 words, 24.0 s of speech)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.62 | Why can the same website load faster in one city than another? |
| L2 | 3.97–5.27 | One reason is distance. |
| L3 | 5.62–11.99 | A content delivery network keeps copies of selected files, like images and scripts, closer to users. |
| L4 | 12.34–16.84 | Your request can reach a nearby copy, instead of the distant original server. |
| L5 | 17.19–19.20 | But not everything can be cached forever. |
| L6 | 19.55–23.05 | When content changes, those copies need rules for updating. |
| L7 | 23.40–26.39 | Faster delivery also means keeping copies correct. |

**Edits from the draft (timing + accuracy only):** the draft measured 26.4 s of speech with this voice, which left no breathing room and pushed the takeaway to ~24.8 s.
- L3 "at servers closer to users" → "closer to users" (the edge servers are drawn; Cloudflare's wording is "closer to end users than origin servers").
- L4 "instead of travelling all the way to the original server" → "instead of the distant original server" (−1.0 s; the long route is drawn and struck out).
- L7 "Faster delivery is also a problem of keeping copies correct." → "Faster delivery also means keeping copies correct." (−0.7 s).

## Source → claim map (all official documentation, read 2026-11-02)
| on-screen / spoken claim | source | what it says |
|---|---|---|
| Distance is *one* reason load time differs | AWS, What is a CDN? https://aws.amazon.com/what-is/cdn/ | "If the user is located far from that server, it will take a long time to load a large file… the website content is stored on CDN servers geographically closer to the users"; primary purpose of a CDN is to reduce latency. "One reason" keeps it from implying distance is the only factor. |
| A CDN keeps copies of *selected* files, like images and scripts, closer to users | Cloudflare Cache https://developers.cloudflare.com/cache/ ; Default cache behavior https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ | "Cache stores copies of frequently accessed content… in geographically distributed data centers that are located closer to end users than origin servers." By default Cloudflare caches by file extension (e.g. JS, CSS, PNG, JPG) and "does not cache HTML or JSON by default". On screen the page (`</>`) card stays at the origin; only image + script are copied. |
| A request can reach a nearby copy instead of the distant original server | Amazon CloudFront, How CloudFront delivers content https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html | DNS routes the request to the edge location that can best serve it, "typically the nearest… in terms of latency"; "If the object is in the cache, CloudFront returns it to the user", otherwise it forwards to the origin and caches the response. |
| Not everything can be cached forever | Cloudflare default cache behavior (above); AWS What is a CDN? | Cloudflare does not cache responses marked `private`, `no-store`, `no-cache`, `max-age=0`, or with `Set-Cookie`; AWS: "Caching doesn't work well with dynamic web content". |
| Copies need rules for updating (expiry → re-check with origin; stale copy until then) | CloudFront cache expiration https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html ; Cloudflare purge https://developers.cloudflare.com/cache/how-to/purge-cache/ ; CloudFront invalidation https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html | CloudFront "serves a file from an edge location until the cache duration that you specified passes… After it expires, the next time the edge location gets a request for the file, CloudFront forwards the request to the origin to verify that the cache contains the latest version". Purge/invalidation remove copies before expiry. The animation enacts exactly this: origin changes to v2 at 09:05, the edge still serves v1 ("old copy") until its "keep 10 min" rule expires at 09:10, then the next request makes the edge fetch v2. |

**Illustrative values (not claims):** the clock times 09:00/09:05/09:10 and "keep 10 min" are a worked example; real TTLs vary (e.g. CloudFront's default TTL is 24 h without a cache policy; Cloudflare's default edge TTL for 200 responses without cache headers is 120 min). The packets' travel speed is the same on both routes so the *distance* difference is what shows; no speed or latency numbers appear anywhere.

## Storyboard as built (one continuous notebook scene)
| time (s) | beat | what happens (every element participates) | camera | sound |
|---|---|---|---|---|
| 0–3.6 | **hook** | Globe + original server. Two hand-drawn browser cards, ink leaders to two cities: the near city's page fills and gets a ✓ at 2.6; the far city's still shows a hatched progress bar and spinner. | wide | paper, pen scratches, tick |
| 3.6–5.3 | **setup: distance** | Eraser rubs the cards to residue. Red-pencil plan routes origin→near and origin→far with ruler ticks; two ink packets leave together at the same speed — the near one lands first. | wide | eraser, pencil, swish, pops |
| 5.3–9.6 | **setup → mechanism: copies** | Origin's shelf of files (page, script, image "v1 · 09:00"). Two edge caches are drawn. On "selected files" only image + script get ✓; red-pencil plans, then ink packets carry the copies to both edges; clock appears at 09:00. | wide | scratches, swish, stamp, clock |
| 9.6–12.0 | mechanism | Edge copies get timestamps and a "keep 10 min" rule with a timer pie; users appear by the edges with short ruler-ticked routes. | wide | pop |
| 12.0–16.8 | mechanism: short path | The request (terracotta hero dot) — the long route to the origin is planned in red pencil and **struck out**; the hero hops to the nearby edge and returns with the image; a second user does the same. | slow push | pop, scribble, swish, pops |
| 16.8–19.4 | **stale copy** | Clock → 09:05; eraser updates the origin's image to v2 (night picture) "v2 · 09:05" over a ghost of v1. The user's next request still returns the sun picture: "old copy". | medium (×1.28) | clock, eraser, scratch, swish |
| 19.4–23.1 | **refresh by rule** | Clock → 09:10, timer pie full, "expired". A request arrives; the edge copy is erased to residue; an ink packet makes one trip to the origin and back with v2; extreme close-up as "v2 · 09:10" is written and the rule "keep 10 min" is underlined on "rules"; the user receives the night picture. | medium → extreme close-up (×1.95) | eraser, swish, stamp, scratch, pop |
| 23.1–26.4 | **takeaway** | Pull back to the globe; the second edge refreshes the same way. On "keeping copies correct" ✓ marks land on origin v2, edge v2, edge v2. | wide, slow push-in | swish, stamp, three ticks |
| 26.4–29.0 | takeaway hold | Requests keep looping on the short paths; LEDs blink; lines boil; chime in the pause after the last word; score lifts gently. | slow push-in | chime, music |
| 29.0–30.0 | **end** | Caption clears; "Tensorblue" is hand-lettered in the caption band with the hero dot; the score resolves on D. | settle | pen scratch, final chord |

## Provenance and licences
| item | source | licence / note |
|---|---|---|
| All drawings, layout, animation, score, SFX | original code in `production/30s/2026-11-02/src/` | original work for Tensorblue |
| Art direction | Animate → Crosshatch STYLE.md (`cth9191/animate` @ `7e5eb56`) | read-only instructions; no code copied or executed |
| Font | Patrick Hand Regular, `google/fonts` repo (`ofl/patrickhand`), sha256 `0f173b3e…ef4ad0fc` | SIL OFL 1.1 (`assets/fonts/patrick-hand/OFL.txt`) |
| Narration | Kokoro-82M (`hexgrad/Kokoro-82M` rev `f3ff357`), voices `af_bella` (sha256 `8cb64e02…`) ×0.7 + `am_puck` (sha256 `dd1d8973…`) ×0.3, speed 0.98, en-us | Apache-2.0 model; synthetic voice, not an imitation of a real person |
| G2P | `misaki[en]` 0.9.4 + spaCy `en_core_web_sm` 3.7.1 from `huggingface.co/spacy/en_core_web_sm` | MIT |
| Renderer deps | `@napi-rs/canvas` 1.1.0 (npm) | MIT |
| ASR check | `faster-whisper` 1.2.1 + `Systran/faster-whisper-base.en` (rev `3d3d5de`) | MIT |
| Audio deps | torch 2.15.0 CPU (PyTorch index), numpy, scipy, soundfile, pyloudnorm (PyPI) | open-source |

No paid APIs, subscriptions, Blender, secrets, other apps' assets, or the old `abbu-kbc-gift` repo were used.

## QA (final exported MP4)
File: `videos/tensorblue/production/30s/2026-11-02/tensorblue-30s-production-01.mp4`
SHA256 `89acda694d32c9a64d80d53b177e6befecdb831dbc757e42ef4e21f93c3e54af` · 46,589,960 bytes. Reports in `production/30s/2026-11-02/qa/`.

| gate | target | result |
|---|---|---|
| video stream | H.264, 1080×1920, 30 fps, yuv420p | h264 **High** L4.2, 1080×1920, 30/1, yuv420p, ~12.2 Mb/s (CRF 18, capped 12 Mb/s), `+faststart` (moov before mdat) |
| frames | exactly 900 | `nb_frames=900`, decoded count `nb_read_frames=900` |
| duration | exactly 30 s | video 30.000000 s, audio 30.000000 s, container 30.000000 s |
| audio stream | AAC 48 kHz stereo | AAC-LC, 48000 Hz, 2 ch stereo, ~194 kb/s |
| whole-file decode | no errors | `ffmpeg -v error -i … -f null -` printed nothing |
| loudness (exported AAC) | −14 to −16 LUFS | **−15.2 LUFS** integrated, LRA 3.1 LU (ffmpeg ebur128) |
| true peak | ≤ −1 dBTP | **−1.8 dBTP** |
| caption ink bounds | y 350–470, x margins ≥ 80, ≤ 2 lines | all 10 groups pass: ink y 352–468, x 219–861 (≥ 219 px margins); signature y 386–449 (`qa/caption-qa.json`, pixel diff with vs without captions) |
| top 0–300 px | unobstructed | 0 differences vs paper-only render in 90 sampled frames (every 10th); caption band y 300–470 never touched by world drawing (0/90) |
| intelligibility | one ASR pass | faster-whisper base.en on the mixed audio: **WER 0.0** (68/68 words), transcript identical to the script; lowest word confidences "closer" 0.44, "instead" 0.56 (both recognised correctly) |
| caption/cue timing | captions follow speech | Kokoro word timings drive captions (shown 0.06 s before each group). Whisper word starts are on average 0.14 s earlier (max 0.45 s on words after a pause, where Whisper's boundary absorbs the silence) — a known Whisper offset, not a sync error |
| visual review | contact sheet + transitions viewed | `qa/contact-sheet-1fps.png` (30 tiles), `qa/transitions.png` (16 frames across every erase, camera move and refresh) viewed; full-resolution crops checked for compression artefacts (none visible) |
| determinism | reproducible | renderer is seeded (no wall clock); `mix.py` re-run in a clean folder produced a bit-identical `mix.wav` |

**Fixed during QA:** paper mottling too dark (softened); props/labels too small (re-laid out larger, timestamps moved onto the copy cards); world drawing slid under the caption band during camera moves (clip at y 472 + paper fade 476–516); caption ink exceeded the band by 1–2 px from boil jitter (56 px type, 56 px leading, 4 px pad); 23–29 s hold was static (slow push-in added); ending fell to ≈ −28 LUFS after the last word (score lifted +6 dB after the narration, applied post-normalisation so the speech region stayed sample-identical to the ASR-checked mix); first export was 78 MB at ~20.6 Mb/s (re-encoded capped at 12 Mb/s → 46.6 MB).

**Known limits (honest):**
- I cannot hear audio; "listening" here means the ASR pass, stem-balance measurements (music ≈ 20 dB and SFX ≈ 18 dB under the voice during speech), loudness/true-peak meters and a spectrogram check. A human listen before posting is still advised.
- The ASR ran on the mix before the +6 dB outro lift; the narration region of the final mix is bit-identical (verified sample-by-sample up to the end of the last line + 0.2 s), so the result carries over.
- Frame 0 shows only the globe and the original server (the hook cards and first caption arrive within 0.3 s); choose a cover frame around 2.6 s if the platform uses the first frame as the thumbnail.
- Wide-shot labels inside small cards (timestamps ≈ 22–26 px) are readable mainly in the medium and close-up shots, where the timestamp story is told.
- Brand colours are the neutral fallback; swap in approved Tensorblue colours when a brand file exists.
- Not published anywhere by Claude; posting is manual.
