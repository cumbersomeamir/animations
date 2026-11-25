# 38 — English-24 30 s #01: Tu Youyou and the low-temperature clue, "THE CLUE WAS THE TEMPERATURE" (fifth episode under the 2026-11-17 feedback addendum in `25`)

- **Batch:** 2026-11-23-english-24 (the user's brief "NEXT EPISODE — English batch24, authorised 23 November"; rendered 2026-11-23, finished and pushed 2026-11-25 after a "resume the unfinished English batch 24" request)
- **Video:** `videos/aarambh/production/30s/2026-11-23-english-24/aarambh-30s-english24-01.mp4`
  - sha256 `4c10d9aef8cfb950cdbe222fb77adcc5cb46e376a3e66707872038f41cd44720`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-23-english-24/aarambh-30s-english24-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `bac439f439e8585b002efe53daae63b2b0fbdef4754267beb217e7f8dc84033b`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo (QA below)
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98) and the established procedural soundtrack recipe.

## The brief (persisted so future iterations can follow it)
- **Topic:** "How Tu Youyou found an antimalarial clue in an ancient recipe."
- **Creative and educational brief:** a real licensed portrait of Tu Youyou and distinct editorial pages. The mystery: heat ruined a promising extract. Explain her historical low-temperature extraction insight and the Nobel-recognised artemisinin work with accurate attribution; no treatment advice. Hook: "THE CLUE WAS THE TEMPERATURE". One useful takeaway about testing assumptions.
- **Feedback carried in the brief ("Satisfied?" = no):** "no, too much information being displayed at once, too much text, motion graphics can be more appealing also need a super cool thumbnail" (already persisted as the 2026-11-17 addendum in `25`).
- **Visual context:** keep the approved VOX scrapbook/editorial skill with genuine portrait photos and distinct moving pages; one idea and 2–5 curiosity words per display; no bobbing lens over a static page.
- **Structure:** hook 0–3 s, optional super hook 3–5 s, proof 5–21 s, payoff 21–27 s, CTA 27–30 s. Upper captions about y 280–460 with safe margins; nothing vital near the right-side or bottom controls.
- **Rules:** read every prior topic record; batch 24 must differ from batch 23 in core question, visual setting and mechanism; preserve the approved skill and colours; verify claims from authoritative sources; source notes stay in the project, not in the narration; no invented news, claims or app features. Free tools only (no Blender, no paid API). English only, the established voice, never Hindi.
- **Output:** `videos/aarambh/production/30s/2026-11-23-english-24/aarambh-30s-english24-01.mp4` plus the first-frame thumbnail; verify full decode, cuts and assets, audio alignment, captions and ending; state checks not performed; commit and push to `claude-video/aarambh`; no new or renamed chats; no social posting; no operational files in Desktop/video-review.

## Pre-flight
- **2026-11-23:** branch `claude-video/aarambh` matched the remote at `14322cc` (english-23 complete; record 37). The batch folder was new (`test ! -e`); earlier outputs untouched.
- **2026-11-25 resume:** local and remote were still both at `14322cc`; the remote had no english-24 files, so the final was not yet published. The local, untracked batch folder held a complete render (the sha256 above) with passing spec, decode, loudness and first-frame QA. It was reused as the final after the checks below; the only working-tree change outside the batch was a regenerated `education/pilot-01/audio/__pycache__/*.pyc` (from importing its audio helpers), restored before commit.
- **Isolation:** only Aarambh's own context, skill, palette, narrator and CTA were used; public subject research is cited below.

## Topic check (not a repeat)
- **Prior topics** (episode log in `11`): Curie, Lovelace, de Mestral, Lamarr & Antheil (×2), Katherine Johnson, Braille, Mary Anderson, Garrett Morgan, Morse, Spencer, Cochran, Sundback, Hopper, Otis, Emily Warren Roebling, Kelsey, Nightingale, Kwolek, Snow, Anning, Alice Ball, Vivien Thomas, Elizebeth Friedman, Inge Lehmann.
- A grep for "tu youyou", artemisinin, qinghao and malaria over `videos/aarambh` found nothing, so the brief's subject is fresh.
- **How it differs from batch 23 (Inge Lehmann, the inner core):**
  - core question: "what step was destroying the active ingredient?" (batch 23: "what hidden structure explains waves where none should arrive?");
  - visual setting: glassware, a burner, an ancient printed page, an ice bath, a microscope and a crystal vial (batch 23: a sliced 3D Earth and a drum seismograph);
  - mechanism: heat-sensitive extraction and a low-boiling solvent (batch 23: refraction and reflection of seismic waves).
- **Nearest earlier episode:** 22 (Alice Ball, chaulmoogra oil) is also medical chemistry, but its question (making an oil injectable) and mechanism (esterification) differ; this episode is about extraction temperature and testing an assumed-harmless step.

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real 2015 Stockholm portrait (left, tilted print with tape);
  - a flask of green extract with gold "active" sparks over a burner, a thermometer in the neck glowing (right);
  - "THE CLUE WAS" (cream) / "THE TEMPERATURE" (gold): the brief's 4-word hook.
- **No intro:** no logo, flicker, fade from black or fade-in; frame 0 mean luminance 58.9/255.
- **No caption at frame 0:** the first caption appears at 0.22 s.

## Story structure
| beat | time (s) | narration | picture (on-screen text) |
|---|---|---|---|
| hook | 0.05–4.12 | "An extract against malaria kept failing. Tu Youyou found out why." | frame-0 composition; sparks blink out on "kept failing"; a light sweep crosses the portrait on her name; the thermometer glows on "why" |
| super hook | 4.45–5.43 | "What was ruining it?" | hard cut with flash (4.39) to the big flask; the last sparks go out; a gold "?" |
| proof 1: heat | 5.75–6.80 | "It was made with heat." | whip pan (5.50–5.75): the flask over a roaring flame; the sparks crackle apart ("HEAT") |
| proof 2: the recipe | 7.10–11.45 | "An ancient recipe said: soak the herb, wring out the juice. No boiling." | push (6.80–7.05) to a paper page: the real Siku Quanshu print of Ge Hong's recipe, the qinghao column highlighted; the herb dips into cold water, is lifted and wrung (drips); "NO BOILING" stamp over a struck-out flame |
| proof 3: cool extraction | 11.80–17.75 | "Her team extracted it cool, in ether. In 1971, it cleared parasites in mice." | page turn (11.45–11.80): the flask in an ice bath; the thermometer drops to 35°; the sparks brighten ("ETHER"); dive (14.30–14.65) into a microscope: red blood cells with ring-stage parasites; "1971 / extract 191" stamp; the parasites clear |
| result | 18.10–21.79 | "That led to artemisinin, and a 2015 Nobel Prize." | push (17.80–18.05): the gold sparks gather into a vial; white crystals grow ("ARTEMISININ"); her portrait chip and "NOBEL 2015" stamp |
| payoff | 22.10–26.41 | "Lesson: when a good idea fails, test the step you assumed was harmless." | slide (21.75–22.10) to a cream lesson page: four step tiles (herb, heat, filter, test); the result fails (red ✗); a spotlight tests each step and stops on heat; heat flips to a snowflake; the result works (gold ✓); card "test every step" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10): app icon, "Download Aarambh / to support livelihood tools / Fund verified livelihood tools and follow their impact. / Get it on Google Play" |

## Final script (English; 75 words)
1. An extract against malaria kept failing. Tu Youyou found out why.
2. What was ruining it?
3. It was made with heat.
4. An ancient recipe said: soak the herb, wring out the juice. No boiling.
5. Her team extracted it cool, in ether. In 1971, it cleared parasites in mice.
6. That led to artemisinin, and a 2015 Nobel Prize.
7. Lesson: when a good idea fails, test the step you assumed was harmless.
8. Download Aarambh to support livelihood tools.

- **TTS-only spellings:** "nineteen seventy-one", "twenty fifteen", "Aa-rumbh"; captions keep the real forms.
- **Name phonemes:** "Tu Youyou" is synthesised as tˈuː jˈoʊjˈoʊ ("too YOH-yoh") via `phoneme_overrides`.

## Sources (accessed 2026-11-23)
- L. H. Miller and X. Su, "Artemisinin: discovery from the Chinese herbal garden", Cell 146 (2011): https://pmc.ncbi.nlm.nih.gov/articles/PMC3414217/ (Project 523 from 23 May 1967; Tu leads a team at the Institute of Chinese Materia Medica from 1969; >2,000 recipes, 380 extracts from about 200 herbs tested in mice; qinghao's early 68 % inhibition then 12–40 %; Ge Hong's recipe; the realisation that heating could destroy the active ingredient; ether extraction at low temperature; extract no. 191, 100 % inhibition in mouse malaria, October 1971).
- Lasker Foundation, 2011 Lasker~DeBakey Clinical Medical Research Award, Tu Youyou: https://laskerfoundation.org/winners/artemisinin-therapy-for-malaria/ (Ge Hong's handbook, about 340 CE: soak a handful of qinghao in water, wring out the juice and drink it, with the water given as two liters; lower-temperature ether extraction; the extract "obliterated Plasmodia in the blood of mice and monkeys", reported March 1972; pure substance 8 November 1972).
- The Nobel Prize in Physiology or Medicine 2015 (one half to Tu Youyou "for her discoveries concerning a novel therapy against Malaria"; the other half to William C. Campbell and Satoshi Ōmura): https://www.nobelprize.org/prizes/medicine/2015/tu/facts/ (the page refused automated access; the citation wording was confirmed through search-result summaries of the page).
- PubChem, Diethyl ether, CID 3283 (boiling point 34.6 °C): https://pubchem.ncbi.nlm.nih.gov/compound/3283
- Wikimedia Commons, "D810 4987 Tu Youyou, medicine (22945001843).jpg" (Bengt Nyman, Stockholm, 6 December 2015, CC BY 2.0) and "文淵閣四庫全書 0734冊.djvu", page 412 (printed 734-407; PD-scan / PD-old-100-expired).

## Claim map (documented, interpretive, illustrative)
- **Documented:**
  - an extract against malaria "kept failing": qinghao's early activity could not be reproduced (Miller & Su);
  - an ancient recipe said soak the herb and wring out the juice (Ge Hong's 肘後備急方, shown in the real print: 青蒿一握以水二升漬絞取汁盡服之);
  - "her team extracted it cool, in ether" (Miller & Su; Lasker);
  - "in 1971, it cleared parasites in mice": extract 191, 100 % inhibition in mouse malaria, October 1971 (Miller & Su);
  - artemisinin and the 2015 Nobel Prize (Nobel citation).
- **Interpretive:**
  - "Tu Youyou found out why" / "It was made with heat": her reading that high-temperature extraction could destroy the active ingredient, prompted by the recipe (Miller & Su; Lasker). The narration attributes the extraction to "her team";
  - "No boiling": the recipe uses no heat; the caption does not claim the text forbids boiling. The stamp is a visual summary.
  - the lesson is the episode's takeaway, not a quotation.
- **Illustrative:** the gold "sparks" stand for the active ingredient (not molecules); the 35° mark echoes ether's 34.6 °C boiling point; the microscope view, crystal vial and lesson tiles are diagrams.
- **Deliberately not claimed:** any treatment advice or dosing (the recipe's water volume is also not stated, as sources differ: two sheng vs "two liters"); who first obtained the pure crystals (Miller & Su credit other teams); that she worked alone; monkey results; anything about the app beyond the standard CTA.

## Style (rule `25` incl. both addenda; approved animation-direction skill, editorial "Vox scrapbook" mode)
- Real portrait as a taped print (frame 0) and a round chip (Nobel beat); the real recipe print as a paper page with a gold highlighter pass.
- Deep-green backgrounds for lab scenes, cream paper for the recipe and lesson pages, gold accents; Fraunces/Inter; grain overlay; "★ Aarambh" signature bottom-right.
- One idea per shot; on-screen words: the 4-word hook, "?", "HEAT", "NO BOILING", "35°", "ETHER", "1971 / extract 191", "ARTEMISININ", "NOBEL 2015", "test every step", plus the spoken caption.
- Distinct transitions: hard cut + flash, whip pan, push, page turn, dive, push, slide, CTA slide. No bobbing lens.
- **Captions:** Inter 800 54 px, plate centred at x = 500, y 300–460; frame-0 elements stay below y ≈ 560.

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 8.1 MB.
- **Full decode** (`-xerror`): no errors.
- **Loudness:** −15.0 LUFS integrated, −1.6 dBTP true peak, LRA 2.9.
- **Clipping:** sample peak −1.63 dBFS, flat factor 0; audio md5 `df9c36ec97cfb6b46cbd6ee6d95df019`.
- **First frame:** equals the thumbnail composition (1.59/255, H.264 only); mean luminance 58.9/255; first audio above −34 dBFS RMS at 0.07 s (the burner hiss from 0.00 s; narration placed at 0.05 s).
- **Captions** (`qa/caption_bounds.txt`): 14 groups of at most 2 lines; the widest line is 700 px, so the plate runs x 120–880 and y 300–460; the first caption appears at 0.22 s.
- **Narration onsets** (measured in each WAV): every sentence starts 0.02–0.06 s after its placement. ASR stamps "Lesson" late and "Download" early, so those captions fall back to the placed starts.
- **ASR on the export:**
  - faster-whisper tiny.en (`qa/asr_final.txt`) matches the script except "Two yoyo" (Tu Youyou), "ring" (wring, a homophone), "biling" (boiling), "art amissin' in" (artemisinin) and "RM" (Aarambh);
  - small.en (`qa/asr_small_crosscheck.txt`), no prompt: matches except "Two yo-yo", "bring out", "parasites and mice" and "R.U.M.B"; with a name prompt ("Tu Youyou, artemisinin. Aarambh.") it matches the script except "ring" (homophone).
  - **"parasites and mice" follow-up (2026-11-25):** the S5 WAV alone is heard as "in mice" by both models. A stressed "in" was tried and rejected (tiny.en then heard "and mice" on the placed track and lost two words); the original S5 was restored byte-identical. Logged in the cross-check file.
- **Sync** (`qa/sync.txt`), 28 events: e.g. sparks start blinking out at 1.38 ("kept" 1.48); hard cut at 4.39 ("What" 4.54); the flame roars at 6.31 ("heat" 6.46); the herb dips at 8.60 ("soak" 8.80) and is wrung at 9.50 ("wring" 9.60); "NO BOILING" at 10.60 ("no" 10.70); the thermometer drops at 12.94 ("cool" 13.14); the parasites clear at 16.16 ("cleared" 16.26); crystals at 18.59 ("artemisinin" 18.74); "NOBEL 2015" at 20.09 ("2015" 20.24); the spotlight stops on heat at 24.78 ("step" 24.78); heat flips at 25.16 ("assumed" 25.16).
- **Frames:** reviewed on the final export: `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (frames around each transition incl. t = 0 and the ending).
- **Fixes before the final render:** the thermometer was drawn upside down (rotation sign); the burner overlapped the frame-0 headline (flask raised, scale 1.15); the herb was not visibly wrung (lifted higher, scaled up, drips from its base); the Nobel stamp overlapped the vial cap (chip, stamp and vial re-spaced); the lesson spotlight was too faint (alpha 0.6); the narration was trimmed (S1, S5, S6) to fit the beat budget.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps, onset measurements and audio statistics; no human listening was done. "in mice" may sound like "and mice" under the music to some listeners.
- **Sources not opened directly:** NobelPrize.org (refused automated access; citation checked via search summaries); Tu Youyou's own 2011 Nature Medicine essay and her Nobel lecture.
- **Source disagreements handled by omission:** the recipe's water volume (two sheng vs "two liters"); the pure-crystal credit (Lasker vs Miller & Su); the date the 191 result was reported (October 1971 vs March 1972 report).
- **Simplifications:** sparks as a metaphor for the active ingredient; one microscope view; four lesson tiles; "No boiling" as a summary of a heat-free recipe.
- **No review folder:** none in this cloud container. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
