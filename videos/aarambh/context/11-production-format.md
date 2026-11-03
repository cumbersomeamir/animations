# 11 — Production format (durable; read before any Aarambh production round)

Status: ACTIVE since 2026-11-02 (user-approved production round `production-30s-2026-11-02`).
This supersedes 08 (tools and livelihoods niche). That lesson and the Pilot 01 output are preserved but no longer the direction.

## Channel genre (locked)
**Famous people: their achievements and life stories.**
- **One person and one verifiable achievement per episode,** told through real public-domain archive objects.
- **Useful lesson, not an ad:** no motivational slogans, invented thoughts or quotes, health, legal or income claims, testimonials, or "breakthrough" hype.

## Style module (exact)
**Archive Light Table:** https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/archive-lighttable/STYLE.md
- Read as art direction only; no code from that repo is cloned or run.
- Raw read for reference: https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/main/styles/archive-lighttable/STYLE.md

**Adaptations made for Aarambh:**

| STYLE.md | Aarambh adaptation |
|---|---|
| Cool near-white table | Cream/green glowing glass in the icon palette, framed in icon green |
| One signal colour (e.g. orange) | Icon gold `#F1B444` for marks, leaders, the research thread and caption edges |
| Bottom caption strip | Upper-centre caption plate (user rule; see "Caption safe areas" below) |
| 24 fps | 30 fps delivery |
| WebGL lens shaders | Canvas2D re-draw of the world inside a clipped, magnified circle (no pincushion distortion; noted as a simplification) |

**Unchanged from STYLE.md:**
- one world and one camera
- the loupe is the "door"
- loupe landings ease out (about 0.4 s)
- marks attach to objects with an anchor dot and leader
- the table can switch on and off
- light grain, no sepia or halftone
- `FACTS`-style claim table delivered with each film

## Recurring scene rules
1. **One continuous scene:** a single light table, no cuts. Transitions are loupe land/lift, camera glide, push and pull-back.
2. **Real objects only for archive items:** public-domain or CC0 scans at true proportions, with a credit line printed on the table next to each (author, date if known, licence, holder).
3. **Typeset cards are labelled** "TYPESET SUMMARY, NOT AN ARCHIVAL DOCUMENT". They quote the official record's wording in quotation marks. No fake letters, certificates or diplomas.
4. **The beat map:**
   - hook 0–3 s: table flickers on, loupe on the person
   - setup 3–8 s: zones or objects introduced
   - story 8–23 s: loupe moves object to object; ink lines and rays show continuity
   - takeaway 23–29 s: pull back, one gold thread traces the whole path
   - end 29–30 s: table dims
5. **No mascots, 3D presenters or text slides.** The camera, magnifier and illumination tell the story.
6. **Signature:** small gold star plus "Aarambh" bottom-right. No CTA.

## Palette (sampled from assets/icon.png)
- green `#05473A` (frame), deep `#022C24` (plates/loupe), desk `#011E18`
- cream `#FBF7EE` (caption text), paper `#FFFDF6`
- gold `#F1B444` (signal), gold-deep `#C98A22` (ink rays)
- ink `#123B31`

## Type
- Fraunces 800 for names and titles
- Inter 700/800 for captions and labels
- JetBrains Mono Bold for dates, identifiers and credits
- All OFL

## Caption safe areas (1080x1920)
- **Top band:** y 0–300 is kept free of captions and labels. Name tags fade out when the camera moves away.
- **Caption plate:** upper centre, y 336–484, dark plate `rgba(2,34,28,0.86)` with a 3 px gold edge. Text ink is about y 362–470, Inter 800 52 px. At most 2 short lines, plate width ≤ 920 (x margins ≥ 80).
- **Word groups:** captions are split into short groups timed to ASR word timestamps. There are no overlapping handoffs: each caption ends 0.06 s before the next begins.
- **Subjects:** kept between y ≈ 500 and 1500 at reading moments; nothing essential below y ≈ 1550 (platform UI).

## Audio configuration
- **Voice:** Kokoro-82M ONNX v1.0 (official `kokoro-onnx` `model-files-v1.0`: `kokoro-v1.0.onnx` sha256 `7d5df8ec…`, `voices-v1.0.bin` sha256 `bca610b8…`).
  - **Meshline blend:** `0.7·af_bella + 0.3·am_puck`, speed 0.98, lang `en-us`. Synthesised per sentence.
  - Write years as words in the TTS text (e.g. "nineteen oh three"), keep digits in captions.
  - Not Piper, no voice cloning, no imitation of a famous character.
- **Music:** original, quiet felt-piano and glass (procedural, from this app's pilot-01 helpers), ducked about 10 dB under the voice.
- **SFX:** light-table starter clicks and 100 Hz ballast hum, loupe-on-glass clacks at landings, paper sweeps on glides, pen strokes as lines draw, label ticks, glass bells on reveals.
- **Loudness:** two-pass linear loudnorm to −15 LUFS with true peak ≤ −1.5 dBTP.

## Delivery and QA checklist
- **Spec:** 1080x1920, 30 fps, exactly 30.000 s (900 frames), H.264 High yuv420p, AAC 48 kHz stereo.
- **Checks:**
  - ffprobe streams, duration and decoded frame count
  - full FFmpeg decode
  - loudness
  - contact sheets (representative and transitions)
  - caption bounds
  - one ASR and timing pass (faster-whisper tiny.en)
  - fact table against official sources
  - licences for every archive object
- **Output:** `videos/aarambh/production/30s/<date>/aarambh-30s-production-NN.mp4`, plus `publishing-caption.txt`, `README.md` (facts, licences, QA) and source.


## User feedback log (latest overrides earlier rules)
- **2026-11-02, batch-02 brief (applies to all future episodes):** every episode must change across at least FIVE distinct full pages or scenes on the light table, using actual page turns, slide swaps and cuts.
  - No loupe bobbing on a single page. The loupe is optional, used for at most one deliberate landing that tracks along a line.
  - Verify facts against institutional and primary sources (e.g. Science Museum, Bodleian, NobelPrize.org), and qualify contested "first" attributions on screen and in narration.
  - Script length about 65–80 words, fitted naturally into 30 s.

## Scene-change vocabulary (implemented in production/30s/2026-11-02-batch-02/src/render.mjs)
- **Page turn:** a vertical fold sweeps right to left. The flap shows the paper back with faint mirrored show-through and casts a shadow on the next page. About 0.7 s, with a paper swish.
- **Slide swap:** the next glass slide slides in from the right and pushes the current page off to the left. About 0.55 s, with a glass scrape and a clack.
- **Hard cut:** an instant change on a spoken word, with a light-table click and a 0.1 s white flash at ≤ 35%.
- **Index pull-back:** all pages shrink into a 3+2 grid on the table and a gold thread joins them in story order (the takeaway).
- **Page layout:** each page is a cached 900x1000 canvas drawn at 0.94 scale. The camera keeps the page top at screen y ≥ ~530 and the bottom at ≤ ~1510, so captions never cover page content.

## Episode log
- 01 (2026-11-02): Marie Curie, two sciences, two Nobel Prizes. Record: `12-production-30s-01.md`
- 02 (2026-11-02, batch-02): Ada Lovelace, Note G and the first published computer algorithm. Record: `13-production-30s-02.md`


## FEEDBACK ROUND 2026-11-02 — current rules (supersede any conflicting rule above)
**Genre (final):** famous people, achievements and life stories. Each episode teaches **one mechanism or idea** a general viewer can use or retell.

### Exact style recipe: Archive Light Table, Aarambh variant
The style is this recipe; a rendering library is not the style. Canvas2D is only the tool.
1. **Stage:** one cream/green glowing light table seen from above. The frame is icon green `#05473A` on a desk of `#011E18`, with a faint catalogue grid and diffuser grain.
2. **Objects:** paper pages (900x1000, cream `#FFFDF6`, thin green inner border, warm edge glow), drawn at 0.94 scale so their tops sit below the caption plate. Each page has:
   - a mono kicker (gold-deep `#C98A22`, e.g. "UNDER THE MICROSCOPE")
   - a Fraunces title
   - a short mono source footer, ≤ ~40 characters
3. **Content is real or honestly original:** public-domain or permissively licensed scans with on-page credit, OR original illustrations labelled "ILLUSTRATION". Never invented archive scans, letters, certificates or quotes. If no free portrait exists, use a typeset name plate rather than a fake likeness.
4. **At least five distinct pages per episode,** changed by at least three complete page changes from this set:
   - page turn (fold sweeps right to left; the flap shows the paper back)
   - slide swap (the next page pushes the current one off)
   - hard cut on a spoken word (light-table click and a small flash)
   - a CTA card sliding in
5. **The magnifier is used once,** to explain one detail. It is never bobbed over a static sheet.
6. **Objects move to explain the mechanism as it is narrated:** things stick, catch, weave, press, flex and release. No decorative rays and no static page with camera bobbing.
7. **Marks:** gold `#F1B444` leaders and dots, dark label pills (Inter 800, 32 px), and gold-deep rubber-stamp boxes for dates and outcomes (Mono 34/28 px).
8. **Camera:** gentle push (zoom 1.0–1.06) per page, a reset on each change, no wobble.
9. **End:** a brand/action CTA card in the final 3–4 s. Deep-green card, the real app icon (`assets/icon.png`), **"Download Aarambh" / "to support livelihood tools"**, and the official listing line "Fund verified livelihood tools and follow their impact." No source line on the card: sources belong in the repo and the publishing copy. *(Corrected 2026-11-03; see the CTA correction below.)*

### Safe areas (1080x1920)
- **Top band:** y < 300 has no meaningful text.
- **Captions:** upper centre, plate y 350–510, text ink about y 377–492, Inter 800 54 px, at most two lines. Plate width ≤ 900, so x stays within 90–990. Word groups are split by ASR timing, and each caption ends 0.06 s before the next starts.
- **Page content:** crucial diagrams stay within x 140–900 and y 540–1500, away from the side and bottom platform UI.

### Education and CTA rules
- **Structure:**
  - a strong opening, a real moment or observation (0–5 s)
  - the mechanism shown step by step as narrated (5–20 s)
  - a practical takeaway the viewer can reuse (20–25 s)
  - a short natural CTA (final 3–4 s): **"Download Aarambh to support livelihood tools."** (corrected 2026-11-03; the earlier "Follow Aarambh for the ideas behind great inventions" was WRONG)
- **Wording:** no filler, empty motivation or long disclaimers. Put a material qualification briefly inside the relevant sentence (e.g. "With a French weaver, he spent years…").
- **Sources:** use reliable original or institutional sources (e.g. National Inventors Hall of Fame, WIPO, museums, NobelPrize.org), recorded in the episode note and in `publishing-caption.txt`. Keep dates only if verified and needed.
- **Never** invent app capabilities, guarantees, statistics, income claims or testimonials.

### Audio (current)
- **Voice:** the cached Meshline/Recall Kokoro-82M ONNX v1.0, `0.7·af_bella + 0.3·am_puck`, en-us, speed 0.98. Synthesised per sentence and placed with about 0.4 s gaps.
- **Music:** subtle and NON-repetitive. Long pads plus a few sparse, non-periodic notes; no looping arpeggios. Ducked under the voice.
- **SFX:** one per on-screen action (stick, turn, swap, cut, loupe land, catch, weave, stamp, press, rip on pull, strap, ticks, CTA chime).
- **Loudness:** −15 LUFS integrated, true peak ≤ −1.5 dBTP (two-pass linear loudnorm).

### Delivery checks
- **Spec:** 30.000 s, 900 frames, H.264 High yuv420p, AAC LC 48 kHz stereo.
- **Checks:**
  - full FFmpeg decode
  - ffprobe streams and decoded frame count
  - loudness
  - one ASR timing pass, plus an ASR check on the export
  - word-to-event sync table
  - representative and transition contact sheets
  - caption bounds
- **Re-render** if any text is small (< ~26 px on screen for supporting facts), obstructed or overlapping, or a scene is static.

- 03 (2026-11-02, feedback round): George de Mestral, burrs and hook-and-loop fasteners. Record: `14-production-30s-feedback-01.md`


## CTA correction, 2026-11-03 (user sheet feedback; applies to all future episodes)
- **Verified against the live Google Play listing** (https://play.google.com/store/apps/details?id=in.aarambh.app, fetched 2026-11-03):
  - "Fund verified livelihood tools and follow their impact."
  - "Aarambh helps supporters fund verified tools and equipment that can help people start, continue, or grow their livelihoods …"
- **CTA narration and card:** "Download Aarambh to support livelihood tools." The card may add the listing line "Fund verified livelihood tools and follow their impact."
- **Never** describe Aarambh as a biography, learning or education app. Never invent app features or screens.
- Biography episodes stay in the approved format and genre; only the CTA changed.
- Everything else in this file (renderer recipe, captions, voice, pacing, transitions) remains accepted and unchanged.

- 04 (2026-11-03, round-02): Hedy Lamarr & George Antheil, frequency hopping. Record: `15-production-30s-round02-01.md`

## Hindi-language note, 2026-11-03 (user correction; applies when an episode is Hindi)
- **Hindi throughout:** all spoken narration and all captions are natural Hindi in Devanagari. No English narration.
- **Voice:** use a genuinely Hindi-trained local voice. Never feed Hindi to an English-only voice (the af_bella + am_puck blend is English-only).
  - Current choice: Kokoro-82M ONNX v1.0 `hf_alpha`, `lang="hi"`, speed 0.98. It was chosen by Hindi ASR CER (see `16`).
  - Rejected: Piper `hi_IN` pratham and priyamvada (CC BY-NC-SA 4.0) and rohan (IITM IndicTTS licence).
  - No cloning or imitation of any real person's voice; no paid APIs.
- **Fonts:** Noto Sans Devanagari 700/800 and Noto Serif Devanagari 800 (`@fontsource` 5.3.0, OFL). Register each font's **Latin subset as a fallback family** so digits, punctuation and Latin words render without tofu. Captions use Noto Sans Devanagari 800 at 52 px inside the existing caption plate (y 350–510, at most 2 lines).
- **Hindi CTA:** "आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें।" Optional listing line: "सत्यापित आजीविका औज़ारों के लिए योगदान दें और उनका असर देखें।"
- **QA:** add a Hindi ASR pass (faster-whisper small, `language="hi"`) on the export, plus an espeak-ng phoneme check of names, dates and numbers. Spell out years in the TTS text (उन्नीस सौ बासठ) while the caption shows digits.
- Everything else in this file (renderer recipe, pacing, transitions, magnifier once, safe areas, CTA meaning) is unchanged.

- 05 (2026-11-03, hindi-03): Katherine Johnson and the hand-check behind John Glenn's orbital flight (Hindi). Record: `16-production-30s-hindi03-01.md`
