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

## Hindi skill adjustments, 2026-11-04 (from hindi-04; add to the Hindi-language note)
- **TTS text vs caption text:** the caption keeps standard spelling; the TTS text may use the spoken form. Before synthesis, check espeak-ng phonemes for every number, name and key word.
  - "छह" → TTS "छे" (cʰeː; espeak reads छह as cʰʌh, which ASR hears as "च्या").
  - Split hyphenated compounds with a space in the TTS text (ऊपर नीचे, अगल बगल); espeak drops the schwa across a hyphen.
  - Prefer words without ढ़/ड़ when an equal word exists (पढ़ना → पहचानना); espeak renders them as r.h.
- **Pacing:** about 60 Hindi words at speed 1.02 with about 0.5 s gaps gives ~26 s of speech, leaving the CTA sentence (~4.2 s) to start at ~25.5 s.
- **Real primary documents** (scans of a person's own book or patent) make strong archival pages and magnifier targets. Crop the relevant table or figure, and credit it on the print.
- **Wikimedia Commons access when its API returns 429:** read licence metadata through `en.wikipedia.org/w/api.php` (`prop=imageinfo&iiprop=extmetadata`, retry with backoff). Download a standard-width rendition (`…/thumb/…/1280px-<file>`), which is served from cache when the original URL is rate-limited.
- **Glyphs:** "→" is not in the Devanagari or Latin subsets used here, so write "से" instead. Curly quotes ‘ ’ render.

- 06 (2026-11-04, hindi-04): Louis Braille and the six-dot cell, position distinguishes symbols (Hindi). Record: `17-production-30s-hindi04-01.md`

## Feedback-05 notes, 2026-11-05 (Instagram App Performance sheet; user-approved improvements)
- **The fixed genre and the accepted style recipe stay.** A performance snapshot is a controlled topic/opening test, not permission to change the style. Post ages differ and totals do not establish causality. Per CLAUDE.md, the numbers are not stored here.
- **Opening:** an immediate visual hook in the first 1–2 s. The real portrait(s) and name plates are on screen by ~0.8 s, and the first spoken line states the surprising fact.
- **Combining-skills takeaways** name the people in the takeaway line, and the skill cards cite NIHF-style sources.
- **CTA and copy are Aarambh-only.** Never use "Help", "TensorBlue" or any other app or company name in the video, CTA or publishing caption.
- **`publishing-caption.txt` must contain the final transcript sentences verbatim,** plus sources, photo credits and hashtags. It must never contain editing instructions. Check it with a script before committing.
- **Voice:** the Meshline/Recall blend is English-only; for Hindi narration the approved voice remains Kokoro `hf_alpha` (Hindi-language note above).
- **Image licences:** prefer a scan whose repository states the rights. For example, the Internet Archive item `screenland45unse` (Library of Congress) says "not in copyright", and the cover prints the person's name. Commons file-page wikitext gives the licence template (PD-US-not renewed, PD-US-expired).

- 07 (2026-11-05, feedback-05): Hedy Lamarr & George Antheil, frequency hopping (Hindi re-test of 04 with real portraits and a combining-skills takeaway). Record: `18-production-30s-feedback05-01.md`

## English-06 notes, 2026-11-06 (language override: English episodes)
- **English episodes:** English narration and English captions only, never Hindi. Use the approved Meshline/Recall English voice (Kokoro 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98), round-02's English typography (Mono kickers, footers and stamps; Fraunces titles; Inter 800 at 54 px for captions) and tiny.en ASR. Do not reuse Hindi audio.
- **App name in English TTS:** write "Aa-rumbh" in the TTS text (espeak ˈɑːɹˈʌmb); keep "Aarambh" in captions and on the card. ASR still hears "RM"/"RUMB", so the card shows the name.
- **Hook:** ambient motion from frame 0 (snow in a scene panel) plus the portrait by 0.6 s.
- **Mechanism pages:** build them from the patent figure itself (pivot location, swept area) and cite the figure on screen ("patent Fig. 2, area a").
- **Use the right-sized ASR:** if tiny.en garbles a phrase on the full mix but hears it correctly on the isolated segment, cross-check with the small model before changing the audio; record both results.
- **Patent full text:** the USPTO full-image PDF endpoint (`image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/<7-digit number>`) works when Google Patents returns 503.

- 08 (2026-11-06, english-06): Mary Anderson and the windshield wiper (U.S. Patent 743,801). Record: `19-production-30s-english06-01.md`

## English-07 notes, 2026-11-06
- **Inventor-of-an-improvement episodes:**
  - State what already existed first (with a source), then use the patent's own word ("Improvement").
  - Add an on-screen line such as "an improvement, not the first signal".
  - Never write "invented the …" for a category that predates the patent.
- **Show the before-state as the hook.** Motion from frame 0 that demonstrates the problem (here a two-step signal causing a near miss) beats a static title.
- **Photograph licences:** prefer a dated publication made before 1931 (for example a 1916 newspaper photo whose caption names the person) over modern reprints. A local English-Wikipedia file with a "government reprint" PD claim is the weakest option; skip it when a Commons alternative exists.
- **Second ASR model:** when tiny.en mishears a short word ("let" → "lit"), run faster-whisper small (en) once on the export and save it as `qa/asr_small_crosscheck.txt`, rather than re-synthesising.

- 09 (2026-11-06, english-07): Garrett Morgan's all-stop traffic signal improvement (U.S. Patent 1,475,024). Record: `20-production-30s-english07-01.md`

## English-08 notes, 2026-11-07
- **Duplicate topics:** before scripting, grep the episode log (the "- NN (" lines above) and `videos/aarambh` for the suggested subject. Lamarr & Antheil is covered (04 English, 07 Hindi). When a brief repeats a covered subject and says to choose a fresh one, keep its requested lesson and theme with a new person, and record why in the episode note.
- **Real-image sources that work from this container:**
  - Library of Congress `tile.loc.gov/storage-services/service/pnp/<collection>/<folder>/<id>v.jpg` (for example cwpbh.00853) when Commons is rate-limited;
  - USPTO full-image PDFs for patents;
  - Commons thumbnails only at standard widths (250/330/500/960/1280), which may still 429.
- **ASR-friendly phrasing:** test risky phrases ("once a portrait…") with tiny.en and small before final placement; pick the variant both hear correctly.
- **Demonstration pages:** draw the mechanism large enough to fill the page (key, magnet, lever, pen, paper), sync each press to a spoken word, and pair it with a real patent strip on the same page.

- 10 (2026-11-07, english-08): Samuel F. B. Morse, painter turned telegraph inventor (U.S. Patent 1,647); replaces a third Lamarr & Antheil episode. Record: `21-production-30s-english08-01.md`

## English-09 notes, 2026-11-08
- **No licensed portrait:** if no openly licensed photo exists (check Commons, the en.wikipedia page image, Smithsonian Open Access and NIHF), use a typeset name plate (name · role · employer · years). Never draw a face. Use the person's real patent drawing or a museum CC0 object photo as the authentic image instead, and state the blocker in the record and the final report.
- **Anecdote vs record:** spend one sentence on it, not the episode.
  - Attribute the anecdote ("recalled", stamp "HIS OWN ACCOUNT").
  - Show how retellings vary as flipping tags.
  - Stamp the dated primary document ("DOCUMENTED · FILED …").
- **Concrete payoff from the patent's own numbers:** quote a measured comparison (here 2 vs 36 kW·s for an egg) and draw the bars to scale. Speak plain units ("2 units … instead of 36") and keep the exact units on screen.
- **ASR-risky fractions:** "one-eighteenth" was heard as "one-eighth" by both models. Say the two numbers instead and put the fraction on screen.
- **Smithsonian Open Access:** `api.si.edu/openaccess/api/v1.0/search?q=…&api_key=DEMO_KEY` (retry on 429). CC0 media come via `ids.si.edu/ids/deliveryService?id=<idsId>&max=1400`. Quote the record's notes verbatim on screen ("first *microwave* oven designed for home use", not "first oven").
- **Footers and credits:** keep print credits shorter than the print (Mono 18 px ≈ 10.8 px per character). Cite the exact patent columns that hold the quoted numbers.

- 11 (2026-11-08, english-09): Percy Spencer, radar magnetrons and microwave cooking (U.S. Patent 2,495,429). Record: `22-production-30s-english09-01.md`

## English-10 notes, 2026-11-09
- **Repeated suggestions:** briefs can re-suggest covered subjects (Lamarr & Antheil twice; Mary Anderson, episode 08). Grep the "- NN (" log lines first. When it is covered, keep the brief's lesson ("noticing an everyday friction can inspire an invention") and pick a fresh inventor whose patent shows the fix, e.g. Josephine Cochran's dish-washing machine.
- **USPTO "Journeys of Innovation" stories** (`uspto.gov/learning-and-resources/journeys-innovation/historical-stories/…`) are an official secondary source that opens from this container. They are good for the human problem (here chipped heirloom china) and for identifying portraits. Cross-check every mechanism claim in the patent text itself.
- **Reading a scanned patent without OCR:** render the text pages with `pdftoppm -r 150`, split each column into three strips about 1000 px wide, and read the strips. This finds the operating sentences ("During the continuous operation of the lever…") quickly.
- **Commons originals may 429** while standard-width thumbnails (500/250 px) download; take the licence from the file page's raw wikitext (`action=raw`).
- **Demonstration pages:** one explanation pill in a fixed slot, changing text on each spoken step, keeps a busy mechanism readable. Keep diagram labels clear of moving parts (check the lever's full swing).

- 12 (2026-11-09, english-10): Josephine Cochran's 1886 hand-operated dish-washing machine (U.S. Patent 355,139); replaces a second Mary Anderson episode. Record: `23-production-30s-english10-01.md`

## English-11 notes, 2026-11-09
- **Repeated suggestions again:** Garrett Morgan (episode 09) was re-suggested. When replacing a covered subject, keep the brief's lesson and its care about credit. Here a "made it reliable / improved" inventor (Sundback over Judson) mirrors "did not invent all traffic lights".
- **Lessons about transitions:** pick an invention whose key part is the in-between mechanism (a slider, a revolving door, a signal phase). Show the endpoints dimmed and the transition highlighted in the lesson diagram.
- **Name pronunciation:** tiny.en lacks many surnames ("Sundback" → "son back"). Accept a name when small (en) hears it exactly in isolation, and record both results. Avoid compound terms that ASR turns into wrong words ("clasp locker" → "class blocker"); keep such terms on screen only.
- **Commons search API** (`commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6`) still answers when the en.wikipedia API returns 429. Read the licence from `action=raw`, and compare the likeness with the NIHF photo to confirm identity.
- **Counters make "step by step" concrete** (TEETH PARTED 0 → 48 with a soft tick per step). Label the demo "ILLUSTRATION · after patent Fig. N".

- 13 (2026-11-09, english-11): Gideon Sundback, the 1917 separable fastener and its slider (U.S. Patent 1,219,881); replaces a second Garrett Morgan episode. Record: `24-production-30s-english11-01.md`

## "Satisfied?" feedback, 2026-11-11 — CURRENT rules (supersede any conflicting rule above)
**Full approved text:** `25-feedback-2026-11-11-story-rules.md`. Read it before every episode.

Changes to the recipe above:
- **Story:** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
  - **Timing:** hook 0–3 s, escalation 3–5 s, proof and scene changes 5–21 s, payoff 21–27 s, CTA 27–30 s.
  - **Suspense:** from a real open question only.
- **Thumbnail:** a separate vertical thumbnail with 2–4 large words, tied to the hook, delivered with the MP4.
- **Screen:** one visual idea at a time; large, brief labels; no paragraph cards or note lines; no source footers on screen (sources go in notes and the publishing caption).
  - Never show a caption, diagram labels and an explanation at the same time.
  - Diagrams reveal sequentially, with depth, lighting and motivated transitions.
  - No decorative grid lines; no static page with a lens moving up and down.
- **Captions:** inside x 100–900, y 230–1500, with the plate centred at x = 500 and ≤ 800 px wide.
- **Feedback addressed:** "too much simultaneous information/text, motion unappealing, weak thumbnail." Keep the genre, the editorial skill and real sourced portraits.
- **QA wording:** say "ASR-checked", never "listened", unless a human listening was actually done.

- 14 (2026-11-11, english-12): Grace Hopper's wire "nanoseconds": why ~30 cm, the pepper picosecond, shorter paths = faster computers (Smithsonian NMAH 1985.3088.01); replaces a third Lamarr & Antheil episode; first episode under `25` (thumbnail delivered). Record: `26-production-30s-english12-01.md`

## English-13 notes, 2026-11-13
- **The 2026-11-13 brief re-proposed a covered subject** (Mary Anderson, episode 08). Keep its structure (three distinct mechanism pages) and its lesson (an invention can come before market demand) with a fresh inventor.
- **USPTO full-image PDFs returned 403 this session.** `patentimages.storage.googleapis.com/pdfs/US<number>.pdf` and `patents.google.com/patent/US<number>/en` (OCR text; the `A` suffix may 503) worked instead. NARA patent drawings on Commons (Record Group 241) are good period images.
- **Names:** test first-name spellings for the TTS ("Elisha" → "Alicia"; "Elysha" is heard as "Elisha"); show the name on screen.
- **Flying debris** (cut ropes, chips) must be clipped to the scene so it never enters the caption or top band.

- 15 (2026-11-13, english-13): Elisha Otis, "cut the cable": the elevator safety brake (U.S. Patent 31,128; NARA drawing); replaces a second Mary Anderson episode. Record: `27-production-30s-english13-01.md`

## English-14 notes, 2026-11-14
- **The brief's topic line may not match its detailed brief** ("a bridge collapse made useful" vs Emily Warren Roebling). Follow the detailed, verifiable brief and never adopt an unsupported framing (no collapse, no "inventor" label).
- **Portraits as artworks:** the Brooklyn Museum's Roebling portraits on Commons are PD-Art. Chartran's Washington Roebling shows the bridge through his window, a real image that carries the story. RPI's 1867 caisson section is a strong "engineering page".
- **Caption width:** at Inter 800 54 px, keep each caption line ≤ ~700 px (about 26 characters), so the plate keeps ≥ 30 px padding inside the 800 px cap.
- **`photo()` sets its own globalAlpha,** so pass fades as its `a` argument, never via a parent `globalAlpha`.

- 16 (2026-11-14, english-14): Emily Warren Roebling and the Brooklyn Bridge: she wrote down and carried the bedridden chief engineer's instructions and learned the engineering (Linda Hall Library; Brooklyn Museum portraits; RPI 1867 caisson drawing). Record: `28-production-30s-english14-01.md`

## First-frame rule, 2026-11-15 (addendum to `25`; supersedes the spotlight-flicker opening)
- Frame 0 is a finished composition: the real portrait, the key object and 2–5 truthful words, already in place.
- No fade-in, no flicker, no logo intro.
- Narration starts at about 0.05 s.
- Frame 0 doubles as the thumbnail.

## English-15 notes, 2026-11-15
- **First frame done right:** draw the scene's first state already complete (no alpha ramps at t = 0), remove the opening flicker, and render the thumbnail from `drawFrame(0)`. Verify with `qa/first_frame.txt`: frame 0 against the thumbnail, mean luminance, and audio onset.
- **Sensitive medical history:** name harms in text only (no graphic imagery). Use the regulator's exact wording for scope ("never marketed in the U.S."), and don't claim sole credit or numbers saved.
- **Real objects make strong first frames:** FDA's history photos on Flickr/Commons are public-domain U.S. government works (here the real 1960 Kevadon bottle).
- **Measure caption lines before the first full render** (≤ 700 px at Inter 800 54 px).

- 17 (2026-11-15, english-15): Frances Oldham Kelsey and thalidomide, "STOPPED AT THE DOOR": she refused approval for lack of reliable evidence despite company pressure; never marketed in the U.S. (FDA; NLM; real Kevadon bottle). First episode under the first-frame addendum. Record: `29-production-30s-english15-01.md`

## English-16 notes, 2026-11-15
- **Data stories need an honest causal line.** When a chart shows a before/after drop, say what was measured, show it (here, her own monthly figures), then say plainly what one chart cannot rule out. Use "strong evidence, not certainty", not a disclaimer card.
- **Real charts as the first frame:** a crop of the real printed diagram beside the real portrait makes a complete, truthful frame 0 ("NOT THE WOUNDS").
- **Redrawn data must be labelled** on screen (one short line, e.g. "redrawn from her 1858 figures") and drawn area-true (radius ∝ sqrt(value)) when the original is area-true.
- **Where sources disagree on a date** (commission arrival March vs around April 1855), narrate only the year.
- **Useful sources:** HistData datasets via Rdatasets CSV; Wellcome Collection books on the Internet Archive (`/download/<id>/page/nN_w900.jpg`; the first pages may be blank); SORT/idescat PDFs.

- 18 (2026-11-15, english-16): Florence Nightingale and the polar-area chart, "NOT THE WOUNDS": blue = preventable disease; after the 1855 Sanitary Commission flushed sewers, disease deaths fell, even the next winter (Jan 1855 2,761 vs Jan 1856 42); strong evidence, not certainty (Friendly & Andrews 2021; 1857 Panmure report; HistData `Nightingale`; real 1858 diagram and Hering portrait). Record: `30-production-30s-english16-01.md`

## English-17 notes, 2026-11-15
- **Topic lines can again disagree with the brief** ("made firefighters harder to burn" vs a strength and bullet-resistance brief). Follow the detailed, verifiable brief; don't add an unsupported framing.
- **Safety-equipment topics:** use the regulator's wording ("no such thing as bulletproof armor"; armour is rated to threat levels). Prefer an actionable takeaway ("ask which threats a vest is rated for") over an absolute ("stops only…"), which can overstate.
- **Group fades:** `label()`, `rod()` and `photo()` set their own globalAlpha, so a parent fade does not reach them. Pass the fade into each call. Make in-scene swaps sequential (out, then in), never overlapping.
- **Patent pages as archival pages:** crop to the column with the title and inventor so it reads on a phone; check the printed name (a related Kwolek patent misprints it "Kwoleck").
- **Names:** test TTS respellings of surnames ("Kwolek" → "Kwo-leck" for KWO-lek).
- **Licences:** CC BY-SA portraits (Science History Institute) need the photographer and institution credited in the publishing caption; CC0 museum objects (Industriemuseum Gent) make good real "object" pages.

- 19 (2026-11-15, english-17): Stephanie Kwolek and Kevlar, "A THREAD THAT SAVED LIVES": a thin, cloudy liquid spun into fibre in 1965; rod-like chains lie side by side like dry spaghetti and share the load; by weight five times stronger than steel; strong isn't bulletproof, so ask which threats a vest is rated for (SHI; NIHF; Lemelson-MIT; U.S. Patent 3,671,542; NIJ). Record: `31-production-30s-english17-01.md`

## English-18 notes, 2026-11-15
- **Myth-check stories:** when a famous story has an oversimplified version (here, "removing the handle ended the outbreak"), use the subject's own data and caveat on screen (Snow's Table 1 and "attacks had so far diminished before the use of the water was stopped"). Don't add a disclaimer card.
- **A real map as a stage:** keep the print unrotated so map points (pump, brewery, workhouse) map exactly to screen positions. Check rings at full resolution. A 'screen'-composited gold glow tints the printed death bars near the pump without altering the scan.
- **Wikimedia downloads:** original-size files now return 429 for scripts; request the standard thumbnail sizes (1280 px, 3840 px) instead.
- **Wellcome Collection scans on the Internet Archive** give clean title pages and full text for exact quotes (`/download/<id>/<id>_djvu.txt`).

- 20 (2026-11-15, english-18): John Snow and the 1854 Broad Street outbreak, "ONE HANDLE. MANY LIVES.": over 500 died in ten days near one pump; many doctors blamed bad air; nearly all the dead lived near the Broad Street pump; brewery workers drinking beer escaped and the workhouse with its own well barely suffered; the handle came off on 8 Sept, but attacks were already falling (his Table 1); lesson: map who got sick, then ask who was spared (Snow 1855; HistData; London Museum). Record: `32-production-30s-english18-01.md`

## English-19 notes, 2026-11-17
- **"Nobody believed" titles:** check which find the doubt belongs to. Here Cuvier's suspicion of a fake was about the 1823 plesiosaur, not the first ichthyosaur, so the narration used what the sources say about the ichthyosaur (locals: a monster; scientists: a crocodile).
- **Credit inside the story:** when two people share a find, show who found what on screen (JOSEPH · skull · 1811; MARY · body · 1812). A struck-through name restored at the lesson makes "credit the finder" visible without a paragraph.
- **Small archival plates** (e.g. 1814 Phil. Trans. engravings, under 900 px) work at the 960 px standard thumbnail size; keep them at or below about 920 px on screen.
- **Frame 0 with a caption above:** keep frame-0 prints below about y 545 so the 0.22 s caption plate (y 330–490) never overlaps them, and leave about 60 px between prints and the big words.

- 21 (2026-11-17, english-19): Mary Anning and her first ichthyosaur, "A MONSTER IN THE CLIFF?": as a girl she dug a five-metre skeleton from a cliff; locals said monster, scientists guessed crocodile; Joseph found the skull, Mary freed the body; named Ichthyosaurus, an extinct sea reptile; her finds inspired Duria Antiquior (1830), the first scene of ancient life drawn from fossils; papers often skipped her name; lesson: credit the finder (NHM; UCMP; Home 1814; De la Beche 1830; her 1823 letter). Record: `33-production-30s-english19-01.md`

## Feedback 2026-11-17 (summary; full text in the `25` addendum)
- Less at once: one moving idea per scene, at most one 2–3-word label.
- More appealing, explanatory motion.
- A bold, high-contrast frame-0 thumbnail with 2–4 huge words.

## English-20 notes, 2026-11-17
- **Chemistry without text:** show the obstacle and the fix as objects that move. Thick oil drips slowly and sits as a painful lump; the molecule's chains split, gain ethyl caps, and the thin droplets spread and fade into tissue. Two single-word labels ("fatty acids", then "ethyl esters") are enough.
- **Small portraits:** the 1915 Ball portrait is only 269x381. Use a 2x Lanczos copy (no added detail) at about 400–420 px, and let a large illustrated hero object carry the thumbnail.
- **Precise underlines on scanned papers:** read word boxes with `pdftotext -bbox` and convert them to fractions of the page crop, rather than guessing from previews.
- **Wording discipline:** say "her supervisor published the work without crediting her" (documented) and name Dean only through the documented term "Dean's derivatives". Avoid "water-soluble" (the esters were thin oils, per Parascandola) and "cure" (a treatment, replaced by sulfones in the 1940s).

- 22 (2026-11-17, english-20): Alice Ball and chaulmoogra oil, "HER METHOD. HIS NAME.": swallowed it caused nausea; injected it hurt and barely absorbed; she turned its fatty acids into ethyl esters, thin oils the body absorbs; she died at 24; her supervisor published the work without crediting her; Hollmann's 1922 paper called it Ball's Method; lesson: a remedy only helps if patients can take it (Parascandola/NLM; Hollmann 1922; University of Hawaiʻi). Record: `34-production-30s-english20-01.md`

## English-21 notes, 2026-11-18
- **Correct a brief's job title before scripting:** Vivien Thomas was a surgical technician, not a surgeon. Say what the person did ("coached the surgeon"), not what the title line claims.
- **Portrait licensing:** when the only portrait has a weak public-domain basis (a Commons "PD-because" tag) or conflicting rights statements, use it only with a clear caveat in the record and in the report, and keep the asset filename explicit (`…-pd-claimed`) so it can be swapped.
- **Before/after physiology as one live diagram:** one circulation diagram that changes (a narrowed artery, then a gold shunt growing, beads turning red, the figure turning pink) explains better than two separate pages, and needs only two single-word labels.
- **ASR can mis-stamp a sentence's first word** (zero-length "Thomas" at 12.76 against a 12.30 placement). Caption starts now fall back to the placed sentence start (+0.1 s) when the two differ by more than 0.25 s. Check each sentence's first caption on stills.
- **Close the loop visually:** bring the frame-0 object back in the payoff, resolved (here the stranded blue bead becomes a red bead inside the heart).

- 23 (2026-11-18, english-21): Vivien Thomas and the blue-baby shunt, "THE HANDS THEY FORGOT": blue babies lacked oxygen because too little blood reached the lungs; a shunt rerouted an artery to the lungs; Thomas perfected it on about 200 dogs and coached the surgeon; classed as a janitor and left out of the 1945 report; lesson: practise where mistakes are safe, then guide the real thing (PBS; ACC; JAMA 2008; J Med Biogr 2017; StatPearls). Portrait licence caveat in the record. Record: `35-production-30s-english21-01.md`

## English-22 notes, 2026-11-19
- **Lamarr & Antheil suggested again:** replaced again (after Morse and Hopper), this time with Elizebeth Friedman, keeping the brief's lesson ("changing a pattern protects a signal") and its frame-0 idea (a real portrait beside one luminous radio dial). Tell the lesson from whichever side the new person stands on; here the codebreaker shows why a repeating pattern leaks.
- **Explain a cipher without text:** letter tiles do the work. The same E becomes the same Q three times, the Q column grows tallest, and its top tile flips to E. Then a rotor steps on each press and E becomes Q, X, M, which all flip back to E when broken. No label is needed beyond "ENIGMA".
- **Push transitions need content on the incoming page:** an element that fades in only after the push ends leaves the push showing an empty page. Start its fade at the push's start (check a still mid-push).
- **Caption plate y 300–460** this episode, per the brief's "approximately y280-460" below the platform account UI (the standard plate was y 330–490). Keep frame-0 elements below about y 560.
- **Kokoro reads "Elizebeth" badly:** use the TTS spelling "Elizabeth" and keep the real spelling in captions. Measure each narration WAV's onset; ASR can stamp a sentence's first word 0.3 s late ("Nazi") or early ("Download").

- 24 (2026-11-19, english-22): Elizebeth Friedman, codebreaker, "SHE READ THEIR SECRETS" (replaces a third Lamarr & Antheil episode, suggested again): smugglers radioed orders in secret code and she read them anyway; their codes swapped each letter the same way every time, so patterns showed; she and an aide cracked over 12,000 messages; Nazi spies used Enigma, which changed the swap every key press, and her team still broke it; lesson: patterns that repeat leak secrets, never reuse a password (Marshall Foundation; PBS; Smithsonian Magazine; National Geographic; Cambridge; Oxford). Record: `36-production-30s-english22-01.md`
