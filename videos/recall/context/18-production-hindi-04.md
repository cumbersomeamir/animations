# 18 — Hindi 04 (2026-11-04): "इंडक्शन पर बर्तन गर्म कैसे होता है?" (why only the pot heats on an induction cooktop)

**Output:** `videos/recall/production/30s/2026-11-04-hindi-04/recall-30s-hindi04-01.mp4`

**Format:** 11 (Hindi rule recorded in Hindi 03). **Style:** 15, unchanged. **Hindi setup:** as in 17. Previous MP4s are preserved, and no automation was created.

## Request essentials (user, 2026-11-04; facts about the brief)
- One new Hindi 30 s educational video on the requested topic: why a microwave turntable moves and how standing-wave hot/cold spots affect heating, with a leftover-food example, a wave pattern, and rotate/stir/stand guidance. No unsafe DIY and no quizzes.
- **Topic rule:** "If topic already covered choose a genuinely distinct equally useful topic in the exact genre and explain why in episode notes."
- Keep the accepted renderer, brand, performer, pacing and scene recipe. All narration and captions must be natural Hindi in Devanagari, with a verified Hindi-capable local voice and a compatible font. About 60–75 Hindi words with natural pauses, and a simple, truthful app CTA in the last 3–4 s.
- Exactly 30.000 s, 1080x1920, 30 fps, H.264 yuv420p/AAC. Captions at x 90–990, y 340–520, max 2 lines, with the top 300 px clear.
- **Not this app:** the separate "Ideaverse meme test / 15-second pilot" note concerns another app. It was not read or touched here, per context isolation.

## Topic history check → topic changed (why)
The requested topic is already covered by **R02** (2026-11-03, context 16, `production/30s/2026-11-03-round-02/`). R02 already shows:
- waves bouncing off the metal walls into a fixed pattern of strong and weak spots (standing waves, TU Delft);
- the turntable carrying a bowl of leftovers through them;
- outer layers heating first, with a cold middle;
- "stir halfway, spread evenly, let it stand" (Clemson).

A Hindi version would repeat the same mechanism, example, visual and takeaway. Following the user's rule, this episode uses a **distinct, equally useful kitchen-technology topic in the same genre: induction cooktops**. It covers why the pot heats while the glass stays relatively cool (eddy currents) and a practical, safe takeaway (the magnet test).

It suits a Hindi-speaking audience, where portable induction plates are common, and has a clear visual mechanism. "induction" appears nowhere in this app's earlier episodes. If the user wants a Hindi remake of R02 itself, that is a separate request.

## Final script (73 Hindi words, 26.3 s of speech; voice hf_beta 0.7 + hm_omega 0.3, lang hi, 0.98; CTA 1.05)
| id | start (s) | Hindi | gloss | dur (s) | ASR CER |
|---|---|---|---|---|---|
| l01 | 0.20 | इंडक्शन पर आग नहीं दिखती, फिर बर्तन गर्म कैसे होता है? | No flame on induction — so how does the pot heat? | 3.99 | 0.071 |
| l02 | 4.45 | नीचे लगी तांबे की कुंडली तेज़ी से बदलता चुंबक-क्षेत्र बनाती है। | A copper coil underneath makes a rapidly changing magnetic field. | 4.49 | 0.078 |
| l03 | 9.20 | यह क्षेत्र लोहे वाले तले में भंवर धाराएं बनाता है, जिससे तला खुद गर्म होता है। | It makes eddy currents in an iron base, so the base itself heats. | 5.87 | 0.081 |
| l04 | 15.35 | एल्युमिनियम या शीशे के बर्तन अक्सर गर्म नहीं होते। | Aluminium or glass vessels often don't heat. | 3.70 | 0.143 |
| l05 | 19.95 | तो तले पर चुंबक लगाएं; चिपक जाए, तो बर्तन गर्म हो सकता है। | Put a magnet on the base; if it sticks, the pot can heat. | 4.28 | 0.023 |
| l06 | 25.80 | कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें। | Download Recall for learning any new subject with AI. | 4.00 | 0.114 |

Mean CER 0.085. Whisper medium was run with language `hi` on the clean lines. Residual differences are spelling (क्ष/श, nasal marks, loanwords in Latin script).

**Wording changes from the intelligibility check** (Kokoro's Hindi voice is weak on aspirated छ, on "-कीय", and on a final च):
- "छिपी" → "लगी";
- "चुंबकीय क्षेत्र" (heard "चुम्प की एक") → "चुंबक-क्षेत्र" (heard exactly);
- "कांच" (heard "काज") → "शीशे".

There are no numbers, dates or currency.

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **EPRI, "Commercial Induction Cooktops" (2024):**
  - copper coil under the stovetop with a "high-frequency oscillating magnetic field";
  - "eddy currents in special magnetic cookware … causing it to heat directly, while the cooktop stays relatively cool";
  - magnetic pots required;
  - the surface "may be warm to touch" just after cooking.
- **GE Appliances support:**
  - a copper coil beneath the ceramic surface;
  - the pan bottom "must contain some iron";
  - "If a magnet sticks to the bottom, the pan can be heated on an induction cooktop."
- ENERGY STAR, energy.gov and NIMI pages returned 404. GE's "friction" wording was not used.

## Product-fact check (CTA)
Same as contexts 16/17: "with AI" is the user's wording and is not confirmed in the saved listing or the public site text. There is no learning guarantee.

## Creative decisions (choices, not facts)
- **Same café and performer as F01** (code identical).
- **New props:**
  - a portable induction plate whose LED strip uses icons only;
  - a steel chai patila with steam;
  - an aluminium pan;
  - a lime fridge magnet.
- **Mechanism object:** a giant induction cutaway.
  - Translucent black glass over a glowing copper spiral.
  - Lime field loops whose arrows flip (a changing field).
  - A giant steel pot whose base fills with lime eddy rings, glows orange and bubbles, while the glass stays dark.
  - An aluminium pan that slides in, with flickering, weak rings and no glow.
- **Comedy:** the performer peeks under the plate for a flame, waits by the cold aluminium pan tapping fingers, then gives a deadpan blink. The magnet slides off the aluminium and snaps onto the steel pot.
- **Takeaway on screen (no VO):** "चुंबक से जांचें, फिर पकाएं।" (check with a magnet, then cook). The wording was softened from an earlier "बर्तन तैयार" so it doesn't overclaim.
- **Audio:** the accepted engine and bed levels from H03. Foley follows each action, including a pulsing field hum, magnet scrape and snap.

## Skill adjustments learned this round (for future Hindi episodes)
- Run `qa/caption_sync.py` **before** the full render. It caught a caption appearing 0.48 s after its first word, which was fixed by moving the caption boundary to 6.30 s.
- Prefer words Kokoro's Hindi voice renders clearly. Avoid aspirated छ, "-कीय" adjectives and a word-final च where a natural synonym exists. Check each line with `audio/asr_words.py`.
- Metallic materials need low metalness (no environment map) or they render black.
- Draw "inside the object" overlays (eddy rings) with `depthTest: false` so translucent liquid doesn't hide them.

## Progress
- 2026-11-04:
  - Context reread; no active jobs; requested topic found covered (R02), so the distinct topic was chosen and recorded.
  - Sources researched; Hindi narration generated and ASR-checked (three wording fixes).
  - Scene built from H03 tooling; preview stills reviewed and fixed (steel too dark, opening framing, loop/ring layering, bubbles, aluminium-shot framing, magnet-test framing).
  - Mix −14.56 LUFS, −1.6 dBTP, voice +14.3…+17.7 dB over the bed; pre-render caption sync fixed.
  - Full render started.
