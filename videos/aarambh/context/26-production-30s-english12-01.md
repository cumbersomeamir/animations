# 26 — English-12 30 s #01: Grace Hopper's "nanosecond you could hold" (first episode under the 2026-11-11 rules, `25`)

- **Batch:** 2026-11-11-english-12 (no batch ID was given; named after the series pattern)
- **Video:** `videos/aarambh/production/30s/2026-11-11-english-12/aarambh-30s-english12-01.mp4`
  - sha256 `2f84eccba3ab1c3c2f48b0a14a4b1c43da027a23da1214cdc0e58ab5c108ed53`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-11-english-12/aarambh-30s-english12-01-thumbnail.png` (1080x1920 RGB, "HOLD A NANOSECOND")
  - sha256 `b7346d3e44e9db761dd423380b32ed3fea4cd283b29865530c9bf29d76d93f51`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98).
- **Pre-flight (2026-11-11):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `cf82b6f` (english-11), clean tree; account checked against CLAUDE.md; commits authored as "Claude".
  - The new feedback rules were persisted first (`25`, the superseding section in `11`, `05`) and pushed as `1f6a939`.
  - No unfinished job existed, and earlier renders are untouched.

## Subject change (why this is not Hedy Lamarr)
- **Already covered twice:** the proposed topic, "Why Hedy Lamarr's wartime invention kept changing frequencies", was episode 04 (round-02, English) and episode 07 (feedback-05, Hindi). english-08 already declined a third version.
- **Rule `25`:** "If the proposed topic was covered, choose a genuinely different topic in the same genre using the same story criteria."
- **Replacement:** Grace Hopper's wire "nanoseconds", never covered. It meets every story criterion:
  - a famous person, with a real, well-sourced portrait;
  - a striking hook object;
  - a real open question ("why that length?");
  - credible proof (a Smithsonian object record and the exact speed of light from NIST);
  - an accurate payoff that separates what she showed from what she didn't claim;
  - a strong 2–4-word thumbnail.

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| thumbnail | — | — | official portrait, a glowing wire with light pulses, "HOLD A NANOSECOND" |
| hook (why care) | 0.25–3.22 | "Grace Hopper handed out a nanosecond you could hold." | from frame 0, a spotlit portrait lands with a light sweep while light pulses race along a wire; "1 nanosecond" |
| super hook | 3.40–5.90 | "It was a wire, about 30 centimeters long." | hard cut: a bundle of wires with a SMITHSONIAN tag (proof); one wire on a ruler; the bracket grows to "≈ 30 cm" |
| build-up (the question) | 6.15–7.16 | "Why that length?" | whip pan: the wire and a big gold "?" |
| proof | 7.84–16.44 | "Nothing travels faster than light: about 300,000 kilometers a second. In one billionth of a second, even light covers only 30 centimeters." | the globe: light laps the Earth 7.5 times while a one-second clock fills, then "300,000 km"; zoom through to the time card, which flips ÷1000 three times (1 s → 1 ms → 1 µs → 1 ns ≈ 30 cm); a pulse crosses the 30 cm wire once |
| escalation | 17.00–21.06 | "As computer parts shrank, she used a grain of pepper for a picosecond." | push: the wire shrinks to a glowing point, which becomes a pepper grain in a macro spotlight; "1 picosecond", "≈ 0.3 mm" |
| payoff | 21.45–26.38 | "Her point: signals need time to travel, so shorter paths make faster computers." | page turn to a paper page: two pulses leave one chip at the same speed; the shorter path arrives first and the chip glows; "shorter = faster" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | the Aarambh card (icon, the verified listing line, Google Play) |

## Final script (English; 74 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.25 | Grace Hopper handed out a nanosecond you could hold. | — |
| S2 | 3.40 | It was a wire, about 30 centimeters long. | "thirty" |
| S3 | 6.15 | Why that length? Nothing travels faster than light: about 300,000 kilometers a second. | "three hundred thousand" |
| S4 | 12.45 | In one billionth of a second, even light covers only 30 centimeters. | "thirty" |
| S5 | 17.00 | As computer parts shrank, she used a grain of pepper for a picosecond. | — |
| S6 | 21.45 | Her point: signals need time to travel, so shorter paths make faster computers. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

All lines were checked with tiny.en and small before placement; small heard every line exactly except the app name.

## Sources and claim map (accessed 2026-11-11)
- **[S] Smithsonian NMAH, "Nanoseconds Associated with Grace Hopper".**
  - Record nmah_692464, ID 1985.3088.01, made 1985; no online image. Ark: https://n2t.net/ark:/65665/ng49ca746a5-2dc6-704b-e053-15f76fa0b4fa
  - Related records: nmah_1190444 (autographed photograph) and nmah_692462 (documents from the same 1985 lecture).
- **[NIST] CODATA, speed of light in vacuum:** 299 792 458 m s⁻¹, "(exact)". https://physics.nist.gov/cgi-bin/cuu/Value?c
- **[NASA] Earth Fact Sheet:** equatorial radius 6378.137 km. https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- **[P] Portrait:** "Commodore Grace M. Hopper, USN (covered)", 1984-01-20, by James S. Davis, U.S. Navy (DN-SC-84-05971; also NHHC NH 96919-KN), {{PD-USGov-Military-Navy}}. https://commons.wikimedia.org/wiki/File:Commodore_Grace_M._Hopper,_USN_(covered).jpg

| claim | kind | source and wording relied on |
|---|---|---|
| Grace Hopper handed out "nanoseconds" (wires) | documented | S: she "started distributing these wire 'nanoseconds' in the late 1960s"; the bundle was handed "to Smithsonian docents at a March 1985 lecture at NMAH" |
| A wire, about 30 cm long; SMITHSONIAN tag | documented | S: "about one hundred pieces of plastic-coated wire, each about 30 cm (11.8 in) long" |
| Nothing travels faster than light; about 300,000 km a second | measured/defined constant | NIST: c = 299 792 458 m/s, exact; "about 300,000 km" is a rounding |
| In one billionth of a second, even light covers only 30 cm | computed | 299 792 458 m/s × 10⁻⁹ s = 0.2998 m. S describes each wire as "the distance an electrical signal travels in a nanosecond". Strictly, 30 cm is light's distance in vacuum; signals in real wires travel more slowly, so the narration phrases it as an upper limit ("even light covers only 30 cm"). |
| Time card: 1 ms ≈ 300 km, 1 µs ≈ 300 m, 1 ns ≈ 30 cm | computed | c × 10⁻³ s = 299.8 km; c × 10⁻⁶ s = 299.8 m; c × 10⁻⁹ s = 29.98 cm |
| Light circles the Earth about 7.5 times a second (globe scene) | computed, shown time-scaled | 2π × 6378.137 km = 40,075 km (NASA); 299,792 / 40,075 = 7.48. The second is stretched over ~3.8 s on screen. |
| As computer parts shrank, she used a grain of pepper for a picosecond; ≈ 0.3 mm | documented, plus computed | S: "Later, as components shrank and computer speeds increased, Hopper used grains of pepper to represent the distance electricity traveled in a picosecond". c × 10⁻¹² s = 0.30 mm. |
| Her point: signals need time to travel, so shorter paths make faster computers | documented purpose | S: she distributed them "in order to demonstrate how designing smaller components would produce faster computers" |
| GRACE HOPPER (name tag) | documented | P: the portrait title; S: "Grace Murray Hopper (1906–1992)" |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative, not measured:**
  - the wire, ruler, bundle and SMITHSONIAN tag drawings (the real object has no online image);
  - the stylised globe (not a map);
  - the slowed orbit and the slowed pulse crossing;
  - the two-path race (same speed, illustrative distances);
  - the pepper-grain drawing (not to scale).
- **Deliberately NOT claimed:** that Hopper discovered the physics; anything about COBOL or "firsts"; a wire's exact signal speed; any numbers beyond those above.

## Images (real archival object; everything else original illustration)
| file | what | source | licence |
|---|---|---|---|
| `assets/grace-hopper-navy-portrait-1984-pd.jpg` | official portrait of Commodore Grace M. Hopper, 1984 (960x1200 rendition) | Wikimedia Commons (U.S. Navy, James S. Davis; DN-SC-84-05971 / NHHC NH 96919-KN) | {{PD-USGov-Military-Navy}} |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

## Style under rule `25` (approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("1 nanosecond", "≈ 30 cm", "300,000 km", "1 picosecond", "shorter = faster"). No paragraph cards, note lines or source footers; sources live here and in the publishing caption.
- **Look:** a spotlit dark-green desk with radial lighting and deep, soft shadows on photo prints, cards and wires. The decorative catalogue grid is removed. The payoff uses a cream paper page (the historical-page grammar).
- **Transitions:** hard cut with flash (3.34), whip pan with motion trails (5.95–6.15), zoom through the globe (12.15–12.45), push (16.75–17.00), page turn (21.10–21.45), CTA slide (26.60–27.10). No magnifier, and no static page with a lens bobbing.
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, ≤ 800 px wide, y 330–490; the brand mark is unchanged.
- **Fonts:** Fraunces lacks "≈" and InterX lacks "✦", so "≈" is drawn in JetBrains Mono and the thumbnail star is drawn as a shape.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −2.0 dBTP true peak, LRA 2.4.
- **Clipping** (`qa/clipping.txt`): overall peak −1.98 dBFS, flat factor 0 (no samples held at full scale).
- **Captions** (`qa/caption_bounds.txt`): 13 groups of at most 2 lines. The widest line is 712 px, so the plate runs x 114–886 (inside 100–900) and y 330–490 (inside 230–1500).
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script exactly except "RUM" for Aarambh.
  - **tiny.en** (`qa/asr_final.txt`) matches except "RM".
  - The card shows the app name.
- **Word-to-event sync** (`qa/sync.txt`): 27 events, each from 0.50 s before to 0.34 s after its word. All pacing windows are met (hook 0.25–3.22, escalation 3.40–5.90, proof 6.15–21.06, payoff 21.45–26.38, CTA 27.10–29.87).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (19 transition and edge frames).
- **Thumbnail** (`qa/thumbnail.txt`): 1080x1920 RGB; the "NANOSECOND" ink spans x 124–877.
- **Fixes:**
  - **Before the full render:** the missing glyphs, the orbit trail, the name tag touching the photo, a duplicate "30 cm" label, the empty shrink moment, and the payoff glow near the portrait.
  - **After the first render** (one video-only re-render; the audio stream md5 `46741eddd1196793cfcc51a77fe5cfd0` is unchanged): "300,000 km" overflowed the time card. The card was widened to 760 px and the text set to 100 px.
  - **Thumbnail:** the text was resized to sit inside x 100–900.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics. No human listening was done.
- **No photo of the real wires:** the Smithsonian object has no online image, so the bundle is an illustration with a SMITHSONIAN tag; the record is cited here and in the caption.
- **Simplified visuals:** the time-scaled orbit and the path race are illustrations, not measurements.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
