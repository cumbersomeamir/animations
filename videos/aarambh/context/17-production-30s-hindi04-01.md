# 17 — Hindi-04 30 s #01: Louis Braille and why six raised dots read by touch

- **Output:** `videos/aarambh/production/30s/2026-11-04-hindi-04/aarambh-30s-hindi04-01.mp4`
- **sha256:** `3319c7ebf55a0d391e5fcd0852dd5c43d287267a804f67bff7854fd3d32d8feb`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Recipe:** the accepted Archive Light Table recipe (`11-production-format.md`) with the Hindi-language note. The renderer is `production/30s/2026-11-04-hindi-04/src/render.mjs`, built from the hindi-03 renderer. It keeps the light table, paper pages, page turn, slide swap, hard cut, a single magnifier, the caption plate and the CTA card; only the page content is new. No Three.js or Blender; Canvas2D is only the tool.
- **Topic history:** new. Earlier episodes were the lockstitch pilot, Curie, Lovelace, de Mestral, Lamarr & Antheil and Katherine Johnson. Braille had not been covered, so the requested topic was used as given.
- **Pre-flight:** no unfinished job existed. Hindi-03 was committed and pushed, and the tree was clean, so there was nothing to checkpoint and every earlier output is untouched.

## Brief and the specific corrections applied
1. **Famous person:** Louis Braille, and why a six-dot cell can be read by touch.
2. **Real historic image with verified identity and a usable licence:**
   - Henri Thiriat's engraving of Louis Braille (*La Nature*, 1887; public domain) is on P1 and P6.
   - Real pages of Braille's own 1829 book are on P2 and P5: the title page printed in raised letters, and the table of ten basic signs.
3. **Real raised-dot mechanism:** P4 shows the slate-and-stylus process AFB describes ("The paper bulges on its reverse side forming dots"). The real 1829 table, magnified, shows the actual dot signs.
4. **One concrete Braille principle:** the *position* of the dots inside the fixed six-dot cell distinguishes the symbols. Two dots one above the other (dots 1-2) are **b**; two dots side by side (1-4) are **c**. This comes from Braille's own 1829 definitions of signs 2 and 3.
5. **No false literacy claims:** the video makes no universal claim about who reads braille or about literacy rates.
6. **Takeaway:** "सीख: चीज़ें इस्तेमाल करने वाले के नाप से बनाइए।" (make things to the measure of the person who will use them). The visual is the cell fitting under one fingertip.
7. **CTA in the final ~4.5 s:** "आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें।" The narration starts at 25.5 s and the card slides in at 25.0 s.
8. **Hindi everywhere:** all narration and captions are in Devanagari. The voice is Kokoro-82M Hindi `hf_alpha`; no English voice and no cloned voice.

## Final script (Hindi; 60 words; 26.2 s of speech with natural pauses)
Captions show `text`; the voice reads `tts`, which differs only where a written form would be mispronounced. Speed is 1.02.

| id | start (s) | caption text | TTS differences | English gloss (record only) |
|---|---|---|---|---|
| S1 | 0.30 | दृष्टिबाधित किशोर लुई ब्रेल ने छह उभरे बिंदुओं की लिपि बनाई। | छह → **छे** (natural spoken form; espeak reads छह as cʰʌh); comma after ने | Visually impaired teenager Louis Braille created a script of six raised dots. |
| S2 | 5.20 | उनके स्कूल में उभरे अक्षर छूकर पहचानना मुश्किल था। | comma after में | At his school, raised letters were hard to make out by touch. |
| S3 | 9.70 | बार्बिए की लिपि में 12 बिंदु थे; ब्रेल ने इन्हें आधा किया। | 12 → बारह | Barbier's script had 12 dots; Braille halved them. |
| S4 | 14.50 | बिंदुओं की जगह से अक्षर बदलता है: ऊपर-नीचे दो बिंदु ‘बी’, अगल-बगल ‘सी’। | hyphens → spaces (ऊपर नीचे, अगल बगल); espeak drops the schwa across hyphens | The position of the dots changes the letter: two dots one above the other is "b", side by side is "c". |
| S5 | 20.50 | सीख: चीज़ें इस्तेमाल करने वाले के नाप से बनाइए। | comma after चीज़ें | Lesson: make things to the measure of the person who uses them. |
| S6 | 25.50 | आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें। | — | Download Aarambh, support livelihood tools. |

**Wording choices:**
- "पढ़ना" was replaced by "पहचानना", because espeak renders ढ़ as r.h.
- "दृष्टिबाधित" is used as the respectful term.
- S2 says "hard to make out by touch" rather than "large", because AFB says "hard to read" and does not give letter size.

## Sources and claim map (accessed 2026-11-04)
- **[A1] AFB, "What Is Braille?":** https://www.afb.org/blindness-and-low-vision/braille/what-braille
- **[A2] AFB Louis Braille Online Museum, "Braille Invents His Code":** https://www.afb.org/about-afb/history/online-museums/life-and-legacy-louis-braille/braille-nvents-his-code ; sub-pages …/braille-nvents-his-code/books , …/coupvray/accident-workshop , …/braille-recognized/final-years
- **[R] RNIB, "Braille: past, present and future":** https://www.rnib.org.uk/practical-help/reading/braille-and-moon-tactile-codes/braille-past-present-future/
- **[P] Primary source: L. Braille, *Procédé pour écrire les paroles, la musique et le plain-chant au moyen de points…*, Paris, 1829.**
  - Facsimile scan from the American Printing House for the Blind, M.C. Migel Library, on the Internet Archive: https://archive.org/details/procdpourcrirele00loui (item notes: "No Copyright").
  - The English translation quoted below is from the item description.
- **[W] Portrait:** Wikimedia Commons, "File:Engraving of Louis Braille by Henri Thiriat (cropped).jpg": https://commons.wikimedia.org/wiki/File:Engraving_of_Louis_Braille_by_Henri_Thiriat_(cropped).jpg
  - **Licence:** Public domain. Artist: Henri Thiriat. Original publication: *La Nature: revue des sciences…* 15 (1887), G. Masson, p. 20.
  - **Identity:** the Commons description and the original publication, plus an independent picture-library listing titled "Louis Braille - Thiriat" (Mary Evans, picture no. 10071853, seen as a search-result title only). The engraving is signed "H. Thiriat sc."
  - **Not done:** the 1887 *La Nature* page itself was not opened.
- **[G] Google Play listing** (CTA meaning, verified 2026-11-03; see `11` CTA correction): https://play.google.com/store/apps/details?id=in.aarambh.app

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| Coupvray, France; 1809–1852 (P1 kicker) | A1; A2 museum pages | A1: "born in Coupvray, France, on January 4, 1809"; final-years page: "died on January 6th, 1852" |
| Visually impaired (S1) | A2 "accident-workshop" | an awl injury at age 3; "by the time Louis was 5 years old, he was completely blind" |
| A teenager created the six-dot script; "1824 · at 15" stamp | A1; R; A2 | A1: "The writing system he invented, at age fifteen"; R: "By 1824, aged just 15 years old, Louis had found 63 ways to use a six-dot cell" |
| His school in Paris, for blind youth (P2 kicker) | A1 | "He attended the National Institute for Blind Youth in Paris" |
| Raised letters were hard to read by touch | A1; R | A1: "books were created using raised print which was laborious to produce, hard to read, and difficult for individuals to write"; R: "the raised cursive writing in use at the school" |
| The book on P2 is itself printed in raised letters | A2 "books"; P scan | "The book was prepared using embossed type, but examples were provided in Louis' six-dot code." |
| Barbier's script had 12 dots; Braille halved them | A2; R; P | A2: "His system combined 12 dots to represent sounds"; R: "using just six dots (instead of Barbier's 12)"; P (1829): "two of our signs take exactly the same amount of space as one of Mr. Barbier's" (quoted on P3 in Hindi) |
| "एक पोर जितनी जगह" (area of one fingertip) | R | "a six-dot cell in an area no larger than a fingertip" |
| Six fixed positions, numbered 1–6 (left column 1-2-3, right column 4-5-6) | A1 | "six raised dots arranged in two parallel rows each having three dots. The dot positions are identified by numbers from one through six." |
| Slate and stylus: pressed from the back, read as a bump on the front | A1 | "tactile dots are made by pushing the pointed end of the stylus into the paper over the depressions. The paper bulges on its reverse side forming dots." |
| Position distinguishes letters: b = 1-2, c = 1-4 | P (1829 definitions); A1 (numbering) | P: "the second [sign] by a dot in each position of the first column; the third, by a dot in the upper position of each column"; the item notes these ten signs are the letters a–j |
| Barbier's idea was the seed (credit, not spoken) | P | "it is to his procedure that we owe the germ of the idea of our own" |
| Takeaway | interpretive, drawn from R (cell sized to a fingertip) and P (signs made smaller than Barbier's) | — |
| CTA | G | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that braille made all blind people literate, or that all blind people read braille
- the 63/64 combination count (AFB and RNIB differ on it)
- the contested "soldiers reading at night" story
- the date the Institute adopted braille
- any quote other than the 1829 Barbier sentence
- Bharati Braille / Hindi braille (true and relevant, but not sourced this round)

## Images (archival objects are real; drawings are labelled "चित्रण")
| page | file | what | rights / credit on screen |
|---|---|---|---|
| P1, P6 | `assets/louis-braille-engraving-thiriat-1887.jpg` | Thiriat's engraving of Louis Braille (Commons 1280 px rendition) | Public domain; "चित्र: हेनरी थिरिआ (उत्कीर्णन), 1887" |
| P2 | `assets/braille-1829-procede-title-page.jpg` | title page of the 1829 *Procédé*, printed in raised letters (cropped and scaled from IA page n0) | Internet Archive "No Copyright"; "स्कैन: ब्रेल की किताब, 1829 (उभरे अक्षर)" |
| P5 | `assets/braille-1829-procede-p5-ten-signs.jpg` | the table of ten basic signs, digits above and dots below (crop of IA page n18, book p. 5) | as above; "स्कैन: ब्रेल, 1829, पृ. 5" |

The six-dot cells, Barbier grid, fingertip, slate and stylus are original Canvas2D drawings, labelled "चित्रण" in the page footers or notes.

## Storyboard (as rendered; times from the Hindi ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–5.20 | P1 portrait | table on | the Thiriat engraving; name plate "लुई ब्रेल · ब्रेल लिपि के आविष्कारक"; six positions rise one by one on "छह उभरे बिंदुओं" (2.37–3.6); the "1824 · 15 वर्ष की उम्र में" stamp lands on "लिपि" (3.76) |
| 5.20–9.70 | P2 1829 book | **page turn** (4.85–5.20) | the real raised-letter title page; "उभरे अक्षर" label on "उभरे" (6.21); an illustrated fingertip slowly traces "PROCEDE" from "छूकर" (6.77–8.6); "पढ़ना मुश्किल" stamp on "मुश्किल" (8.39) |
| 9.70–14.50 | P3 Barbier → Braille | **slide swap** (9.35–9.70) | the Barbier 2×6 grid fills on "बारह" (11.0–11.8); its lower half drops away on "आधा" (13.03); Braille's 2×3 cell appears inside a fingertip outline, "एक पोर जितनी जगह"; the 1829 quote card sits below |
| 14.50–16.90 | P4 how a dot is raised | **page turn** (14.15–14.50) | numbers 1–6 appear on "जगह" (14.88); the stylus presses the paper into the slate pit and dot 1 rises on "अक्षर" (15.79); a flipped strip shows the bump "पलटकर: उभरा बिंदु"; dot 2 rises on "बदलता" (16.25) |
| 16.90–20.50 | P5 Braille's 1829 table | **hard cut** on "ऊपर" (16.90) | the **magnifier (only use)** lands on real sign 2 (vertical pair, 17.13–17.5); the b cell rises and "बी (b)" lands (18.52); the magnifier glides to sign 3 on "अगल" (18.67–19.39); the c cell rises and "सी (c)" lands (19.42). Heading "जगह बदली, अक्षर बदला" |
| 20.50–25.50 | P6 takeaway | **slide swap** (20.15–20.50) | the fingertip lands over the six-dot cell on "चीज़ें" (20.72); the measure bracket "पोर का नाप = खाने का नाप" and a gold check on "नाप" (23.07); a small portrait print |
| 25.50–30 | P7 CTA card | **slide swap** (25.00–25.50) | app icon, "Aarambh", "आरंभ डाउनलोड करें", "आजीविका के औज़ारों का साथ दें", the listing line, "Google Play पर उपलब्ध" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −3.8 dBTP true peak, LRA 2.1.
- **Captions:**
  - 7 groups of 2 lines each, in Noto Sans Devanagari 800 at 52 px.
  - The widest line is 701 px, so the plate runs x 157–923 and y 350–510; the top 300 px stays clear.
  - The typographic quotes ‘ ’ render from the Latin-subset fallback; no tofu appears in any inspected frame.
- **Hindi ASR on the export** (faster-whisper small, language hi; `qa/asr_final.txt`). Every sentence is recognised in order:
  - 0.00–4.52: द्रिश्ट बादध के शोर लूई ब्रेल ने चे अभ्रे बींदों की लिपी बनाई
  - 5.20–9.06: उनकी सकूल में अभ्रे अक्षर चूकर पहज़ानना मुष्किल ता
  - 9.76–13.88: बार भिये की लिपी में बारहा बींदु ते ब्रेल ने इने आदा किया
  - 13.88–19.88: बिन्दों की जगासे अक्षर बडलता है उपर निचे दो बिन्दों भी अगल बगल सी
  - 19.88–24.54: सीख चीजे इस्तिमाल करने वाले के नाप से बनाये
  - 24.54–29.52: आरंभ डाओन लोड करे आजीविका के ओजारो का साथ दे
  - The mis-hearings are spelling-level: दृष्टिबाधित split, "भी" for बी (the export pass), aspiration losses.
- **Before the final take,** "छह" (spoken cʰʌh) was heard as "च्या"/"चा". The TTS now reads "छे" (cʰeː), which is recognised as "चे", the natural spoken form of the word.
- **Word-to-event sync** (`qa/sync.txt`): 21 events, each landing 0.0–0.45 s before or on its word.
- **Contact sheets:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (every boundary).
- **Fixes found on the previews and the first full render:**
  1. The "→" in the P3 kicker rendered as tofu; it was replaced with "से".
  2. On P4, the stylus overlapped its heading; the heading was merged into the caption under the slate.
  3. On P5, the magnifier covered the scan credit and the heading; the credit is now right-aligned and the heading and cells moved lower.
  4. The P2 note overran the page edge; it is now two lines.
  5. The lesson caption broke mid-phrase; it was re-split.
  6. On P6 (first full render), the descending fingertip crossed the page title; it now enters below the title. One re-render.

## Remaining limits
- **No human listening:** I can't listen here. Words, pronunciation and alignment were verified by Hindi ASR and espeak phonemes only, and the voice is TTS-grade. A native-speaker listen is recommended before posting.
- **Portrait:** it is an 1887 engraving made 35 years after Braille's death. It is identified as Louis Braille by the Commons record and the original publication, not by a life photograph.
- **Scan quality:** the 1829 scan is a photocopy facsimile, so the embossed dots are faint; the magnifier and the illustrated cells carry the explanation.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The finished MP4 is attached in chat and pushed only to the app branch.
