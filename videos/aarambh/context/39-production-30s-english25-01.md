# 39 — English-25 30 s #01: Henrietta Leavitt and the blinking-star ruler, "A BLINK MEASURES SPACE" (sixth episode under the 2026-11-17 feedback addendum in `25`)

- **Batch:** 2026-11-27-english-25 (the user's brief "NEXT EPISODE — English batch 25, authorized 27 November"; worked on 2026-11-27)
- **Video:** `videos/aarambh/production/30s/2026-11-27-english-25/aarambh-30s-english25-01.mp4`
  - sha256 `8d3bc0994dab2e64c3aa1d4b7d30532784117a1f63ce62486ec16d207d193aab`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-27-english-25/aarambh-30s-english25-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `cf10a2c2de3806405f83bd2e7fc120b1f38947d1b867705dedb4f149d3582887`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo (QA below)
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98) and the established procedural soundtrack recipe.

## The brief (persisted so future iterations can follow it)
- **Topic suggested:** "How Mary Anning read a sea monster in the cliffs. Open on the fossil eye." A genuine cleared portrait or labelled period portrait; distinct moving VOX scrapbook pages; credit Mary and Joseph precisely and explain the evidence for a marine reptile.
- **Replacement rule in the brief:** "Read the actual delivered topic history, including replacements, and latest app context/feedback. If this mechanism has already been covered, choose an unrelated subject within the same established genre, and record the change."
- **Keep:** the approved app-specific visual skill, branding, voice and music; verify all claims with authoritative sources.
- **Deliverable:** an actual 30.000 s 1080x1920 H.264/yuv420p MP4 with AAC, English voiceover and English captions only; a strong truthful frame zero and thumbnail. Hook 0–3 s, visual build-up/proof through 21 s, useful payoff by 27 s, short relevant CTA. One idea per shot, minimal large text, meaningful motion and depth. Captions roughly y 280–460 with safe margins; vital content away from the bottom/right platform UI. Free tools only (no Blender, no paid API).
- **Output:** `videos/aarambh/production/30s/2026-11-27-english-25/aarambh-30s-english25-01.mp4` plus the first-frame thumbnail and source/QA notes. Check full decode, visual/caption timing, narration and branding. Commit and push only new work to `claude-video/aarambh`; check free disk early; preserve all earlier work; no social publishing.

## Pre-flight (2026-11-27)
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/aarambh`, local = remote at `83e117c` (english-24, record 38); clean tree.
- **Disk:** 27 GB free on the session volume; the scratchpad held 1.6 GB (voice and ASR models). No streaming or temporary-space workaround was needed.
- **Earlier batches:** batch 24 complete and pushed; the batch-25 folder was created after `test ! -e`; earlier outputs untouched. The pilot-01 helper `.pyc` that the audio build rewrites was restored before commit.

## Topic check and replacement
- **Delivered history:** episode 21 (english-19, record `33`) was "Mary Anning and her first ichthyosaur, A MONSTER IN THE CLIFF?": a five-metre skeleton from a cliff; locals said monster, scientists guessed crocodile; Joseph found the skull, Mary freed the body; named Ichthyosaurus, an extinct sea reptile; frame 0 was Home's 1814 skull plate with its ringed eye. The brief's subject, credit split, mechanism (reading a marine reptile from the fossil) and even its frame-0 idea (the fossil eye) were all covered.
- **Replacement:** Henrietta Swan Leavitt and the period–luminosity relation of Cepheid variables (1912). A grep for leavitt, cepheid, magellanic over `videos/aarambh` found nothing outside third-party `node_modules`, so it is fresh.
- **Same genre, unrelated subject:** a real woman scientist, a real period portrait and real period documents, one mystery answered with one mechanism.
  - Core question: "how can you tell how far away a star is?" (Anning: "what is this skeleton?"; batch 24 Tu Youyou: "what step destroyed the active ingredient?").
  - Setting: night sky, a star cloud, her 1912 graph, a telescope and Andromeda (no fossils, cliffs, lab glassware or earth cutaways).
  - Mechanism: pulsation period reveals true brightness; apparent faintness then gives distance.
- **Kept from the brief's intent:** precise credit (her 1912 figure is stamped LEAVITT; Hubble is named as the one who later used her rule) and an evidence-led explanation.

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real portrait of Henrietta Leavitt (c. 1898; left, tilted print with tape);
  - one large pulsing gold star (right) above its scrolling light curve;
  - "A BLINK" (cream) / "MEASURES SPACE" (gold): 4 words.
- **No intro:** no logo, flicker, fade from black or fade-in; frame 0 mean luminance 62.5/255.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Truthful words:** a Cepheid's period ("blink") is used to measure distances (standard candles); "blink" is a metaphor for a brightness cycle of days to months.

## Story structure
| beat | time (s) | narration | picture (on-screen text) |
|---|---|---|---|
| hook | 0.05–4.04 | "How far away is a star? Henrietta Leavitt found a clue in its blink." | frame-0 composition; light sweep across the portrait on her name; the star and its curve flash on "blink" |
| super hook / problem | 4.35–7.00 | "A faint star might be weak, or just far away." | hard cut with flash (4.29): two stars that look equally faint above an eye; the camera tilts up into a map (4.95–5.75): one is weak and near ("WEAK"), the other bright and far ("FAR") |
| proof 1: one cloud | 7.35–11.96 | "She studied blinking stars in one distant cloud, all about equally far." | push (7.05–7.30): a star cloud above Earth; gold rings mark her blinking stars one by one; the cloud is outlined; equal-distance lines from Earth and an arc through the cloud ("SAME DISTANCE") |
| proof 2: the pattern | 12.30–14.11 | "There, the brighter ones blinked slower." | dive into the cloud (11.95–12.28): five stars blink at different rates; the bright ones swell; each drops a dot onto a graph (slower blink → brighter); a gold line |
| proof 3: her figure and the rule | 14.45–16.0 | "So a blink gives true brightness," | her real Fig. 2 of Circular 173 replaces the drawn graph (stamp "1912 LEAVITT"); a blinking star sends a gold arrow up to her fitted line and across to the brightness axis |
| proof 4: distance | 16.08–18.16 | "and faintness then gives distance." | page turn (15.68–16.03): the star's known glow shrinks to how faint it looks (dashed ring = true glow); a tape measure stretches from a telescope to it ("DISTANCE") |
| impact | 18.50–22.40 | "Hubble later used her rule to show Andromeda is another galaxy." | push (18.20–18.45): Isaac Roberts' real 1899 photograph of Andromeda on a page; a star in it is ringed and blinks; stamp "1923 HUBBLE"; a "Leavitt 1912" card with an arrow to the star; pull back: Andromeda far above, the Milky Way below, a tape between them ("ANOTHER GALAXY") |
| payoff | 22.75–25.69 | "Lesson: to see a real pattern, compare like with like." | slide (22.40–22.75) to a cream page: stars at mixed distances; their dots scatter ("?"); they slide onto one row, the dots line up (gold tick); card "compare like with like" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10): app icon, "Download Aarambh / to support livelihood tools / Fund verified livelihood tools and follow their impact. / Get it on Google Play" |

## Final script (English; 80 words)
1. How far away is a star? Henrietta Leavitt found a clue in its blink.
2. A faint star might be weak, or just far away.
3. She studied blinking stars in one distant cloud, all about equally far.
4. There, the brighter ones blinked slower.
5. So a blink gives true brightness, and faintness then gives distance.
6. Hubble later used her rule to show Andromeda is another galaxy.
7. Lesson: to see a real pattern, compare like with like.
8. Download Aarambh to support livelihood tools.

- **TTS-only spelling:** "Aa-rumbh".
- **Name phonemes:** espeak reads "Leavitt" as lˈiːvɪt; the override lˈɛvɪt (LEV-it) is in `phoneme_overrides`.

## Sources (accessed 2026-11-27)
- H. S. Leavitt and E. C. Pickering, "Periods of 25 Variable Stars in the Small Magellanic Cloud", Harvard College Observatory Circular 173 (March 1912): ADS record https://ui.adsabs.harvard.edu/abs/1912HarCi.173....1L/abstract. The ADS scan server returned HTTP 500, so the circular's text was read through MacTutor's verbatim excerpt; the figure itself was inspected directly (Commons copy).
- MacTutor History of Mathematics, "Henrietta Swan Leavitt": https://mathshistory.st-andrews.ac.uk/Biographies/Leavitt/. It quotes the 1912 circular: "Since the variables are probably at nearly the same distance from the Earth their periods are apparently associated with their actual emission of light…" and "A straight line can readily be drawn among each of the two series of points corresponding to maxima and minima, thus showing that there is a simple relation between the brightness of the variables and their periods." It quotes the 1908 paper: "It is worthy of notice that the brighter variables have the longer periods." It also covers her volunteer start and paid work at Harvard, her death in December 1921, and that Pickering kept her on other projects.
- Wikipedia, "Henrietta Swan Leavitt" (used for cross-checks only): the circular "was communicated and signed by Edward Pickering, but the first sentence indicates that it was 'prepared by Miss Leavitt'"; 25 Cepheids in the Small Magellanic Cloud; "One year after Leavitt reported her results, Ejnar Hertzsprung determined the distance of several Cepheids in the Milky Way; with this calibration, the distance to any Cepheid could be determined accurately"; Hubble, "using Leavitt's Law, calculated that their distance was far too great to be part of the Milky Way and were separate galaxies in their own right".
- Library of Congress, Inside Adams blog, "Henrietta Swan Leavitt" (N. Smith, 12 Dec 2019): https://blogs.loc.gov/inside_adams/2019/12/henriettaleavitt/. It covers her work as a computer under Pickering, examining photographic plates for brightness changes; the 1908 paper "1777 Variables in the Magellanic Clouds" (longer cycle, greater brightness); the 1912 paper's "the brighter variables have the longer periods"; dates 1868–1921; and the use of the variables as distance standards via the inverse-square law.
- Astronomy.com, "Oct. 5th, 1923: Hubble discovers galaxies beyond the Milky Way": https://www.astronomy.com/today-in-the-history-of-astronomy/oct-5th-1923-hubble-discovers-galaxies-beyond-the-milky-way/. It covers the plates of the Andromeda Nebula on 4 and 5 October 1923, a star that changed in brightness, his distance answer "1 million light-years" (modern value about 2.5 million), and that Andromeda and its brethren "were in fact entire galaxies separate from the Milky Way".
- Carnegie Science, "VAR! plate 100th anniversary" (title seen in search results; page not opened): https://carnegiescience.edu/video-var-plate-100th-anniversary
- Wikimedia Commons file pages (licences): "Henrietta Swan Leavitt.jpg" (c. 1898; Popular Astronomy 30, no. 4, April 1922; public domain), "HSLeavittHSCr13Fig2 1912.png" (Circular 173 Fig. 2; public domain), "Pic iroberts1.jpg" (Isaac Roberts, 1899; public domain).

## Claim map (documented, interpretive, illustrative)
- **Documented:**
  - she studied variable ("blinking") stars in one cloud (the Small Magellanic Cloud; 25 Cepheids in 1912);
  - they are about equally far ("probably at nearly the same distance from the Earth", her own 1912 wording);
  - the brighter ones have longer periods (1908 and 1912);
  - her straight-line relation (Fig. 2, shown as the real figure);
  - Hubble used her relation on a variable star in Andromeda (October 1923 plates) and showed Andromeda lies far outside the Milky Way, a separate galaxy.
- **Interpretive (standard textbook reading):**
  - "a blink gives true brightness, and faintness then gives distance": period → luminosity → distance by the inverse-square law;
  - the zero point came from Hertzsprung's 1913 calibration (and later work), which the narration does not detail;
  - "her rule" = Leavitt's law / the period–luminosity relation.
- **Illustrative:**
  - blink speeds are compressed (real Cepheid periods are days to months);
  - the cloud, the five graph stars and the lookup star are diagrams;
  - the lookup arrow reads her upper (maxima) line at log P ≈ 1.5;
  - the ringed star on the Roberts photograph marks an illustrative position, not the actual V1;
  - "1923 HUBBLE" dates the plate, not the 1925 publication;
  - the tape measures and the Milky Way disc are metaphors and are not to scale;
  - the lesson diagram is generic.
- **Deliberately not claimed:**
  - that she computed distances herself (calibration came from others);
  - Hubble's distance figure (sources differ: 900,000 / 930,000 / 1 million light-years);
  - the "VAR!" annotation (not confirmed on a page actually read);
  - the 1 January 1925 announcement (not confirmed);
  - her start year and pay details (sources differ: 1892/1895 volunteer, 1902/1903 paid);
  - the 1908 count "1,777" (MacTutor's body figures do not add up to it);
  - any Nobel claim (the Mittag-Leffler nomination attempt came after her death).

## Style (rule `25` incl. both addenda; approved animation-direction skill, editorial "Vox scrapbook" mode)
- **Real material:** the portrait as a taped print (frame 0), her real 1912 figure as a taped print with a stamp, and the real 1899 Andromeda photograph on a cream page.
- **Look:** deep-green/teal night skies, cream paper for the photo page and the lesson, and gold accents; Fraunces/Inter; grain; "★ Aarambh" bottom-right.
- **One idea per shot.** On-screen words: the 4-word hook, "WEAK", "FAR", "SAME DISTANCE", axis words "slower blink" / "brighter", "1912 LEAVITT", "DISTANCE", "1923 HUBBLE", "Leavitt 1912", "ANOTHER GALAXY", "Milky Way", "?", "compare like with like", plus the spoken caption.
- **Depth and meaningful motion:**
  - the camera tilts from eye level to a map, revealing depth;
  - parallax star layers;
  - a dive into the cloud;
  - dots fly onto the graph;
  - a perspective floor and a narrowing tape measure;
  - a pull-back from the photograph to a two-galaxy view;
  - stars slide onto one row.
- **Transitions:** hard cut + flash, push, dive, page turn, push, slide, CTA slide; no bobbing lens.
- **Captions:** Inter 800 54 px, plate centred at x = 500, y 300–460; frame-0 elements below y ≈ 560; nothing vital near the right edge or the bottom.

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 9.3 MB.
- **Full decode** (`-xerror`): no errors.
- **Loudness:** −15.0 LUFS integrated, −1.5 dBTP true peak, LRA 2.9.
- **Clipping:** sample peak −1.49 dBFS, flat factor 0; audio md5 `bade57e559c7bd713b3415aab61cfce9`.
- **First frame:** equals the thumbnail composition (1.53/255, H.264 only); mean luminance 62.5/255; audio from 0.00 s (the star's pulse); narration placed at 0.05 s, speech onset +0.05 s.
- **Captions** (`qa/caption_bounds.txt`): 13 groups of at most 2 lines; widest line 691 px, so the plate runs x 124–876 and y 300–460; first caption at 0.22 s.
- **Narration onsets** (measured in each WAV): every sentence starts 0.03–0.07 s after its placement. ASR stamps "Lesson" late and "Download" early, so those captions fall back to the placed starts.
- **ASR on the export:**
  - faster-whisper tiny.en (`qa/asr_final.txt`), 80 words, one per script word: matches except "Levitt" (the intended LEV-it), "one's" (ones), "light" (the last "like", under the lesson chimes) and "RM" (Aarambh);
  - small.en, no prompt (`qa/asr_small_crosscheck.txt`): word for word except "Levitt" and "RMB";
  - small.en with a name prompt: exact, including "Leavitt" and "Aarambh".
- **Sync** (`qa/sync.txt`), 32 events, including:
  - the sweep at 1.96 on "Henrietta" (2.06);
  - the flash at 3.48 on "blink" (3.58);
  - WEAK at 5.34 on "weak" (5.44); FAR at 6.20 on "far" (6.30);
  - the marks from 7.82 on "blinking" (7.92);
  - equal-distance lines at 10.31 on "all" (10.46);
  - the stars swell at 12.65 on "brighter" (12.80);
  - dots land from 13.54 on "blinked slower" (13.32–13.62);
  - her figure at 14.09 on "so" (14.50);
  - the lookup at 14.72 on "blink" (14.82), reaching the brightness axis at 15.50 on "brightness" (15.62);
  - the star dims at 16.48 on "faintness" (16.68);
  - the tape at 17.13 on "distance" (17.58);
  - the Hubble ring at 18.62 on "Hubble" (18.72);
  - the pull-back at 20.02 on "show" (20.12);
  - ANOTHER GALAXY at 21.31 on "another" (21.46);
  - the stars line up at 24.52 on "compare" (24.62);
  - the tick at 25.34 on "like" (25.44).
- **Frames:** reviewed on the final export: `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (27 frames incl. t = 0 and the ending).
- **Fixes:**
  - **Before the full render:**
    - the "1912 LEAVITT" stamp covered the lookup arrow and moved to the empty lower right of her plot;
    - frame 0's portrait and star were enlarged;
    - the cloud was scaled up;
    - the graph axes now appear as the dive ends.
  - **After the first full render:**
    - the lesson page slid in empty (its stars popped in 0.4 s later), so the stars now start popping as the slide begins;
    - the full render, mux and QA above were rerun.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps, onset measurements and audio statistics; no human listening was done.
- **Sources not opened directly:** the circular's scan (ADS returned 500; its text was read through MacTutor's verbatim excerpt and checked against Wikipedia); the Carnegie VAR! plate page; NASA's VAR! page (404); the AAVSO biography (403); Live Science (403). Wikipedia was used only as a cross-check.
- **Simplifications:**
  - blink speeds;
  - one lookup on her upper (maxima) line;
  - no mention of Hertzsprung's calibration in the narration;
  - an illustrative variable-star position on the Andromeda photo;
  - the Roberts photo is only 569x371 (shown at about 800 px wide on the page, then as a small vignette).
- **No review folder:** none in this cloud container. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
