# QA — Media Diet · English episode english-08 · "A photo of a recipe can fill your shopping cart (by text)"

**File:** `videos/media-diet/production/30s/2026-11-07-english-08/media-diet-30s-english08-01.mp4`
**SHA-256:** `75e35072bda29ae3d2338538fd9f972edc166d11e8a2205f44d4fddfeeb346f0` · 18,820,345 bytes · 5019 kb/s · audio stream tagged `eng`
Style: Layered Tech Cutaway, accepted recipe unchanged (context/11). Build: `build/render_chunks.sh` (two parallel workers,
resumable 60-frame chunks), then `SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **123–958** | qa/text-bounds.json |
| safe areas | **0 violations** in 900 frames (top 300 px and bottom clear; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech (narration stem used in the mix) | **10/10 cues OK**: each cue appears 0.00–0.16 s before its speech and stays 0.00–0.35 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** on the full pass and **1.0** on every per-line slice; "November 6", "Amazon", "Alexa for Shopping", "invite-only", "United States" and "Media Diet" heard exactly | qa/asr.json |
| music quiet beneath speech (stems, per line, pre-loudnorm) | speech −19.5…−20.0 dB RMS; music −30.8…−34.9 dB (10.8–15.0 dB under); foley −39.2…−46.9 dB | measured during QA |
| contact sheets | representative (1 frame/s) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

### English ASR (final export, Whisper medium, per-line slices)
| line | spoken = caption | Whisper | recall |
|---|---|---|---|
| V1 | Can a photo of a recipe fill your shopping cart? | Can a photo of a recipe fill your shopping cart? | 1.0 |
| V2 | Since November 6, some Amazon shoppers can text Alexa for Shopping. | Since November 6, some Amazon shoppers can text Alexa for shopping. | 1.0 |
| V3 | Before: read the recipe, search each ingredient, one by one. | Before, read the recipe, search each ingredient one by one. | 1.0 |
| V4 | Now: text a photo of the recipe, and the ingredients land in your cart. | Now, text a photo of the recipe and the ingredients land in your cart. | 1.0 |
| V5 | One text replaces all those searches. | One text replaces all those searches. | 1.0 |
| V6 | The catch: it's invite-only in the United States, expanding over the coming weeks. | The catch? It's invite-only in the United States, expanding over the coming weeks. | 1.0 |
| V7 | Follow Media Diet for technology explained. | Follow Media Diet for Technology Explained. | 1.0 |
Differences are capitalisation and punctuation only.
**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection (stills, full-res frames, contact sheets)
| area | result |
|---|---|
| Accepted look retained | Same paper stock, key light, restrained bokeh, palette, table + hills, vignette, English caption band (Space Grotesk 700 50 px), calendar flip, source placard, Media Diet sign. |
| News identity | Calendar flips 4 → 5 → NOV 6 on "Since November 6"; a SOURCE placard "Amazon News · Nov 6, 2026" hinges up in front of it. |
| Immediate hook | Frame 0: a paper phone frames a "Lasagna" recipe card in its camera; shutter flash at 0.12 s; from 0.4 s the seven ingredient tiles peel off the card and drop into a paper shopping cart (all in by 1.9 s). |
| Scene progression (7 cuts) | S1 hook · S2 date + source · S3 text thread "Alexa for Shopping": invitation bubble arrives · S4 "Before": seven searches typed one by one, "Add to cart" tapped each time, "search k of 7", cart 0 → 7, recipe lines ticked · S5 "Now": the recipe photo flies into the thread, reply "Added 7 items to your cart", camera pulls back as all seven tiles fly into the cart · S6 a "1 text" card pops while seven search cards fold flat · S7 U.S. map: three invited phones get envelopes, "Invite only · U.S." banner, more phones light over the coming weeks, two still off · S8 hero + Media Diet sign (CTA, last 3.97 s). |
| No static pages | Every shot has object action on its line; eased camera moves only, no bobbing. |
| Accuracy | "some … shoppers", the date, the photo-to-cart demo, invite-only + U.S. + expanding over the coming weeks are all spoken; generic phone/screen glyphs; no Amazon or Alexa logos or interface. |

## Fixes during this round (each fixed once)
1. Script length: 79 → 70 words so the CTA starts 3.97 s before the end; long caption lines re-split to stay inside x 90–990.
2. Framing (stills): the map's banner sat in the calendar shot's sight line, the cart crowded the hook and the before shot, the takeaway set was cut off → map moved to the far right, cart scaled 0.85 and moved forward, search counter moved onto the phone screen (the paper counter and clock were dropped), checkboxes moved to the visible side of the recipe card, cameras re-aimed.
3. Washed-out takeaway cards: a flat white emissive without a texture → printed cards use their print as the emissive map.
4. Session restart after all frames had rendered: chunked, resumable rendering meant nothing was lost; encoded from the complete frame set.

## Remaining limitations (honest)
- Stock synthetic English voice (approved Kokoro English blend; Meshline/Recall cache not present in this container).
- Invite-only for a small group of U.S. customers from Nov 6, 2026, expanding over the coming weeks — said in V6.
- The recipe, screens, reply text and cart are illustrations, not Amazon screenshots.
- No local Desktop/video-review folder exists in this cloud container; the MP4 is attached in the session and pushed to the branch.
