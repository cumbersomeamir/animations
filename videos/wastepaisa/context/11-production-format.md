# 11 · Production format (durable rules for WastePaisa production videos)

Recorded 2026-11-02 for production round `production-30s-2026-11-02`; **updated for batch-02** (`production-30s-2026-11-02-batch-02`) with the user's latest feedback, which overrides earlier style details. This is durable context for
future rounds. **No automation has been created.**

## Channel genre (locked)
Recycling explainers: material composition, sorting and potential scrap value. Each video teaches one
material fact that is useful without the app. Never claim payouts, prices, rates, "guaranteed profit",
earnings or a monthly allowance (saying prices *vary* is fine; giving numbers or promises is not); any value talk needs a checked, dated source and must stay non-promissory.

## Art-direction skill (exact)
- Skill: **Paper-cut Motion**, https://github.com/imMamdouhaboammar/motion-graphics-skills/blob/main/skills/paper-cut-motion/SKILL.md
  plus its `references/stop-motion-craft.md`. Read-only art direction. The repo's `scripts/` builder
  was **not** cloned or run; all code is original Canvas2D.
- Rules applied: 12 fps quantised time (`floor(t*12)/12`), stepped motion and no smooth morphing.
  One light from the upper left, with consistent directional shadows (bigger offsets when lifted).
  Pushpins and masking tape. Hard-cut drops in one frame with a tap sound. Stamps snap in one frame,
  tilted −3° to +5°. Replace sheets by covering or removing them. Labels are short printed strips.
  Seeded imperfections only, so seeking is deterministic. Sound only at contact points.
- Adaptations: the skill's red string becomes **copper wire** (scrap-shop identity). Camera moves are
  limited to stepped 12 fps pushes in the hook and takeaway (the skill gives no camera rule and warns
  against smooth moves). A quiet music bed is added under contact SFX, as the brief requires.

## PUBLISHED-APPS FEEDBACK RULES (2026-11-11, "Satisfied?" column; LATEST — supersede any conflicting rule in this file)
Approved by the user on 11 Nov 2026 for every following educational episode. Applied first in english-12.
- **Session and isolation:** this app's existing Claude Code conversation, its mapped account, `cumbersomeamir/animations`, branch
  `claude-video/wastepaisa` only. Read the approved context, style skill and previous topics first. Never borrow another app's visuals,
  voice, CTA or assets; never overwrite earlier outputs. App-channel educational episodes are separate from any Discover short-film work.
- **Deliverable:** an actual 30.000 s 1080×1920 H.264/yuv420p MP4 with AAC, English voiceover and English captions (no Hindi), the
  established Meshline narrator, no Blender or paid APIs, the existing approved motion skill and assets with only these changes.
- **Theory of Marketing:** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
  - Hook answers "why should I care"; build-up sustains one specific question; proof makes the answer credible; payoff gives useful
    knowledge; CTA gives a relevant next step.
  - Suspense comes from a real unanswered question, never a false claim. Don't repeat the answer in every scene or pad with generic lines.
- **Pacing (adapt naturally, always 30 s):** 0–3 s striking image + hook · 3–5 s optional escalation · 5–21 s visual explanation and
  proof with scene changes · 21–27 s resolve the question with a concrete takeaway · 27–30 s concise app-relevant CTA.
- **Thumbnail:** an attractive separate vertical image (1080×1920) tied to the hook, with 2–4 large words.
- **Visual grammar:** one visual idea at a time; no paragraph cards. On-screen labels are large and brief; the voice carries the
  detail. Caption, diagram labels and explanation must not compete at the same moment. Reveal diagrams sequentially; use deliberate
  depth, lighting and transitions; no decorative or distracting lines (leader lines only when they point at the thing being named).
  Motion must explain the topic.
- **Caption safe area (replaces the earlier x 90–990 / y 340–520 rule):** captions readable inside **x 100–900, y 230–1500**, clear of
  platform overlays (right-side action rail, bottom caption band, top account row).
- **Facts:** verify claims from primary or reliable sources before the final script. Keep measured facts, estimates and illustrative
  assumptions distinct. Sources go in project notes, not on screen. Never invent prices, returns, news, app functionality or scientific
  certainty. If a fresh-news claim cannot be verified, choose another verified story instead of presenting rumour as news.
- **Warnings:** no boilerplate warning or disclaimer narration; omit risky procedures instead of building the story around warnings.
  Keep legal qualifications that are essential to the answer, short and accurate.
- **Topics:** review previous episodes first; if the proposed topic is covered, choose a genuinely different topic in the same genre
  with the same story criteria.
- **Delivery and QA:** only completed MP4s go to the user's review folder (production source, citations, prompts and QA stay outside
  it). Render, full-decode, check duration and codecs, inspect transitions and frames, check English narration, caption sync, clipping
  and missing assets. Attach the finished MP4 and thumbnail; report limitations honestly and never claim a watched or listened check
  that wasn't performed (in this cloud session audio is checked by ASR and level meters, not by ear).
- **WastePaisa-specific feedback (same date):** keep the simple open-can scrap-shop mascot and the current CTA/style; pivot firmly to
  the money opportunity (identify → separate grades and contaminants → aggregate a consistent quantity → compare legitimate buyer
  quotes; buyers pay for reliable quality and volume). No disposal lecture and no obvious warnings (e.g. about burning wire). Show
  weighed material and buyer quality requirements, not disposal bins. Use dated, located real rates where they can be verified, and
  show gross revenue against collection, sorting and transport costs; otherwise a clearly labelled illustrative calculation. Never
  guaranteed profit or "₹10 to lakhs" claims; no hazardous extraction instructions. Improve purposeful motion.
- **Content references:** use a referenced post only after actually viewing it; if it can't be opened, say so and don't describe it.

## User feedback log (latest overrides earlier)
- **batch-02 (2026-11-02):** "Keep the open-lid can mascot, simplified to one clear cylinder, lid, eyes and two
  limbs; no bolts or complicated rig." "Paper-cut scrap shop unfolds into sorting tray, shredder, furnace
  cross-section and new sheet." "Distinct scene changes; no earnings promises." "Make hook and payoff useful,
  visibly explain mechanism with scene changes."

## Editorial emphasis update: round 02 (2026-11-03, user sheet feedback)
- Emphasis is **scrap value and earning opportunities**: help viewers identify what is worth selling and how buyers
  assess it, honestly and without financial promises (no rupee rates, income, allowances or guaranteed payouts).
- **Clean scripts:** omit generic "do not burn" lines, disposal instructions and repeated safety warnings when the topic
  needs no hazardous procedure. Put any required accuracy qualifier inside the relevant sentence only.
- Everything else stays exactly as accepted: the Scrap Shop X-ray renderer and recipe (B), the simplified open-can
  mascot, palette, caption treatment, the Kokoro voice and voice-forward subtle-pad audio, pacing, and the CTA
  "Join WastePaisa and put your scrap to use."

## Language note: hindi-03 (2026-11-03, latest user correction)
- When an episode is Hindi, **all narration and captions are natural Hindi in Devanagari**. Never feed Hindi to the
  English-only voices.
- Voice: Kokoro-82M native Hindi voices **hf_beta 0.7 + hm_omega 0.3**, `lang='hi'`, speed 1.15. Check every line
  with a Hindi ASR.
- Fonts: Baloo 2 Devanagari faces (OFL, same family); caption line spacing 84 px. Numbers may appear as digits with ₹
  in captions while spoken as Hindi words.
- Kept unchanged: the brand wordmark "WastePaisa" and the icon. The CTA in Hindi is
  "वेस्टपैसा से जुड़िए और अपना कबाड़ काम में लाइए!"
- Business or value maths needs dated sources, or explicitly illustrative numbers ("मान लीजिए" + on-screen "उदाहरण"),
  with turnover and profit always separated. Reference implementation: `production/30s/2026-11-03-hindi-03/src/scene.html`.
- Hindi pronunciation and mix notes (hindi-04, 2026-11-04). Check each draft line with Vosk small-hi before the final take.
  - **Avoid:**
    - **छाँटिए:** ASR heard a vulgar near-homophone.
    - **नग:** not recognised; use पीस.
    - **रीसाइक्लर:** misheard; name the recycler on screen instead.
    - **English loanwords at the start of a sentence:** पैलेट read as पहले there; mid-sentence is fine.
  - **Prefer clear line-final forms:** बिक गए, बदल दीजिए, and end the CTA with "!".
  - **Keep SFX quiet under a line's first and last words;** masking showed up in ASR on the export in hindi-03 and hindi-04.
  - **Business arithmetic:** when only marketplace asking prices exist, use an illustrative batch whose figures sit inside the dated
    asking ranges, and cite them as asking prices.
  - Latest reference implementation: `production/30s/2026-11-04-hindi-04/src/scene.html` (pallet props, three-pile grading,
    dismantle-and-repair, to-scale profit bar, silent recap).
- Approved improvements from the Instagram App Performance sheet (feedback-05, 2026-11-05). The style is unchanged; these are
  opening/topic choices.
  - **Opening:** subject on screen from frame 0, with the hook visible in the first 1–2 s. A buyer/margin question opens the script,
    then the demonstration.
  - **Performance snapshots** (e.g. 1,502 observed plays across 16 reels, median 118) are non-causal across unequal post ages. Change one
    variable per episode and record it in the episode notes.
  - **Spoken arithmetic:** must be complete on its own. Name every cost the result subtracts (purchase included), not only the
    on-screen bar.
  - **Publishing caption:** must match the final transcript, use only the WastePaisa identity, and carry no editing notes.
  - **Reference implementation:** `production/30s/2026-11-05-feedback-05/src/scene.html` (paper/cardboard props, moisture-meter and
    grade-tag mechanisms, sorted-vs-unsorted net margin).
- English episodes after the Hindi rounds (english-06, 2026-11-06):
  - **Language and voice:** English narration and captions only, using the Meshline voice (af_bella 0.7 + am_puck 0.3, en-us, speed
    0.98) synthesised fresh. Never reuse Hindi audio or text.
  - **Captions:** the accepted English line spacing (70 px; ink ≈ y 366–494). Keep the English CTA card "Put your scrap to use" and the
    spoken CTA "Join WastePaisa and put your scrap to use."
  - **Numbers:** write them as words in the TTS text, with digits and ₹ in captions. Spoken English numbers are slow, so budget about
    60–65 words. When time is short, drop the silent recap rather than a mechanism step.
  - **Hazardous processes** (carbonisation, kilns): show the equipment and the principle only, never a how-to. Record the
    pollution-board categorisation in notes.
  - **Reference implementation:** `production/30s/2026-11-06-english-06/src/scene.html` (coconut/charcoal props, drum kiln with
    closing air holes, crusher, starch, press, net bar with an input-price warning).
- **Topic history rule (english-07, 2026-11-06):** before accepting a suggested subject, check the episode records in context 12–20.
  If it is covered (cardboard grading already exists in feedback-05), choose a fresh subject in the same genre and record why in the
  episode notes.
  - Covered so far: paper cup, aluminium can, cable, brass, aluminium aggregation, pallets, cardboard grading, coconut-shell charcoal,
    PET bottles, glass cullet (english-08), cotton wiping rags (english-09), cardboard box reuse before
    scrap (english-10; a reuse angle, distinct from feedback-05's scrap grading), used cooking oil to licensed biodiesel
    (english-11), stainless steel offcuts by grade (english-12; replaced a proposed aluminium-offcut topic that repeated hindi-03), steel scrap grades by
    thickness/rust and furnace yield (english-13; replaced a proposed cardboard 'air in your load' topic that repeated english-07's
    density lesson and feedback-05's cardboard grading). Density/baling, colour sorting, moisture and alloy content are now all taken.
  - **Spellings ASR mishears** (english-11: flapped "liters" heard as "leaders"): fix with the optional `ph_sub` phoneme replacement
    in `audio/tts.py` / `lines.json` rather than rewording the line.
  - **No-earnings briefs:** when the brief forbids earnings, make the payoff a sourced cost comparison (e.g. per-litre route cost) with
    the same EXAMPLE tag and to-scale bars.
  - **Technical terms ASR can't confirm** (e.g. "cullet"): verify the G2P phonemes against a dictionary pronunciation. Keep the term
    when it is the correct trade word, and caption it plus show it as a chip.
  - **Chips that appear in sequence at the same spot** must hand off in one slot, never sit side by side (english-08 overlap fix).
  - Latest reference implementation: `production/30s/2026-11-06-english-07/src/scene.html` (PET bottles, PET-share grade gauge,
    loose-vs-baled trucks).

## FEEDBACK ROUND RULES (2026-11-02, latest; supersede conflicting directions above)
- **Focus:** material value and how to sell useful scrap well (sorting, grading, weighing, asking for quotes, safety),
  not disposal lectures. One practical value check per episode. No made-up rupee rates, guaranteed earnings,
  statistics, testimonials or app capabilities. Material qualifications go briefly *inside* the relevant sentence;
  no long generic disclaimers, filler or empty motivational lines.
- **Spec:** exactly 30.000 s, 1080×1920, 30 fps, H.264 yuv420p + AAC 48 kHz stereo.
- **Structure:** strong opening (first frame already shows subject + object) → distinct scenes that show the mechanism
  *while* it is narrated → clear takeaway → **short natural brand/action CTA in the final 3–4 s**
  (for example "Join WastePaisa and put your scrap to use." over the app icon and wordmark).
- **Captions:** upper safe region below account overlays: nothing meaningful at y < 300. Caption ink at y ≈ 340–520,
  x 90–990, at most 2 readable lines (62 px Baloo 2 ExtraBold, cream with orange highlight words, on a soft dark panel),
  no overlapping handoffs. Labels ≥ 40 px. Crucial diagrams stay out of the side and bottom UI areas
  (x 90–990, y ≤ ~1460). Re-render if text is small or obstructed, or if scenes are static. A contact sheet or a
  static page with camera bobbing is never the deliverable.
- **Audio:** the established Kokoro voice (af_bella 0.7 + am_puck 0.3, en-us, speed 0.98). Voice clear and upfront. Music is a
  subtle evolving pad with slow chord changes: **no repetitive rhythmic loops** (no marimba arpeggios or shakers).
  SFX tied to on-screen events. −15 LUFS, true peak ≤ −1 dBTP.
- **Character:** keep the accepted simplified open-lid can (one cylinder, one lid, two eyes, two simple arms). No
  gears, bolts, intricate mechanisms or extra characters. Physical objects (cross-sections, trays, scale) teach the
  lesson, and the mascot reacts and points.
- **Deliverable path:** `videos/wastepaisa/production/30s/<date-or-round>/wastepaisa-30s-<name>.mp4`. Notes, source and QA
  stay in the repo. Only finished MP4s go to the user's local review folder (not reachable from cloud sessions,
  so they're delivered as chat attachments).

## STYLE RECIPES (a rendering library is not a style)
### A. Accepted can format: "Paper-cut scrap shop" (30s-01, 30s-02)
Paper-cut Motion art direction (above): stepped 12 fps, torn paper pieces with one-light shadows, pins, stamps, copper-wire
connectors, scenes joined by fold, slide, drop, iris and unfold transitions.
### B. "Scrap Shop X-ray" (feedback-01; design-variation reference https://www.instagram.com/p/DfA9A6ZBRrJ/ by mindsetvibrations,
only the user's description of it was used, the post was not viewed)
1. **Ground:** near-black (#07090B) with a faint cool radial falloff, so the room reads as a dark architectural space.
2. **Secondary layer:** a sparse **point-cloud scrap shop** (floor-plan grid, back-wall outline, two shelving units with
   coils and boxes, the X-ray counter). Dots sampled every ~7.5 cm along 3D edges, radius 1.2–2.7 px, cream-white at 24–85 %
   alpha falling off with depth, a few cool cyan accents on scrap items, and **one small warm accent** (#F46D12: counter top
   edge and scan lamp). Dots are fixed in world space and seeded once: **no shimmer, no per-frame noise**.
3. **Camera:** disciplined smooth travel. One eased dolly, pan or rise per scene (push in to the counter, dive toward the
   object, pull back, rise, final pull-back). Parallax comes from the 3D dots. No bobbing or shake.
4. **Foreground:** solid, readable subjects drawn as filled shapes with a soft drop shadow: the can mascot (paper edge
   kept) and real objects (cables, trays, scale). The primary object is always the clearest thing on screen.
5. **X-ray reveal:** a cyan scan bar sweeps across an object. Behind it the outer layer turns translucent (cyan outline)
   to expose the inside (for example a copper core). The reveal persists as a cutaway.
6. **Hero diagram:** zoom from the object into one large, simple, colour-coded cross-section, and dim the point cloud to
   ~45 % while it is on screen. Use at most two leader-line labels plus one simple bar.
7. **Text:** short highlighted words. Captions are cream with orange highlights on a dark panel; labels are rounded dark
   chips (warm chip = the word being spoken).
8. **Transitions:** camera travel plus a 0.3 s dissolve between foreground scenes. The point-cloud room persists for continuity.
9. **Ending:** recap of 2–3 words with icons, then the app icon, the wordmark "WastePaisa" and a short action line; the
   mascot waves.
Implementation for reference: `production/30s/2026-11-02-feedback-round/src/scene.html` (Canvas2D, original code).

## Recurring scene and performer
- **Tinku (simplified, current):** a flat paper-cut mascot drawn procedurally in Canvas2D (`mascot()` in
  `production/30s/2026-11-02-batch-02/src/scene.html`). It has exactly **one tin cylinder** (cream label band with
  orange and green stripes), a **flipped-up open lid**, **two eyes** and **two copper-wire arms** with orange glove hands,
  plus a white paper edge. **No** bolts, ribs, antenna, ear flaps, loupe, legs or 3D rig. Pose with arm angles,
  eye direction and blinks. Use the same palette.
- (Superseded in 30s-02: the 3D-rig sprites used in 30s-01. Keep them only for that archived episode.)
- **Distinct scene changes** are now standard. Each mechanism stage gets its own paper-cut scene, joined by
  in-medium transitions lasting 4 steps (0.33 s): page **fold** down, panel **slide**, hard **drop**, paper
  **magnifier iris**, page **unfold**. Scenes start and end in Tinku's scrap shop.
- **Tinku's scrap shop**: dark cardboard pegboard wall, kraft backing sheet, cork **sorting board**,
  counter, "sorted scrap" crate (carries the subtle app signature), copper coil, printed material tags.
- Evidence hierarchy per episode: 1 anchor object, 3–6 evidence pieces, at most about 4 connectors,
  and 1 resolution piece (for example, a final tag).

## Video spec
1080×1920 portrait · 30 fps delivery (stepped 12 fps source; FFmpeg `fps=30` repeats frames) · H.264
High yuv420p (`-preset veryfast -crf 16`) · AAC-LC 48 kHz stereo 192 kb/s · exact duration (30.000 s =
900 frames) · `-movflags +faststart`.

## Story structure (30 s)
Hook = a useful, surprising material fact. Payoff = a practical, non-promissory action plus a callback visual
(30s-02: "CAN → CAN").
Hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · quiet end 29–30 s
(caption off, resolution piece held, music resolves).

## Caption and safe areas
- Captions are upper-centre typed strips: **text ink y 350–470**, horizontal margins ≥ 80 px (in practice
  ≥ 195 px), at most 2 short lines, split into word groups, hard switches with no overlap. Baloo 2
  ExtraBold 56 px, ink #2a1a10 on cream #f6ead6, key words in orange ink #c95a0c.
- **y 0–300 is kept clear** (nothing but wall texture). The app signature lives on the crate, not at the top.
- Essential visuals stay within x ≈ 60–1020 and y ≈ 500–1450 at every camera zoom. They stay out of the
  bottom overlay band (y > 1450) and the right-side UI column (x > 1020 at mid height).
  Check this at the maximum zoom.

## Palette (from the app icon + approved direction)
Icon orange #E8741C (ink #C95A0C) · icon green #1F6B3A · cream #F6EAD6 / paper #F3E5CC · cardboard
#A8743F / #7A5129 · wall #4A3121 · kraft #6E4A2C · cork #B98B55 · plastic film #DFF1F6 / #B2DEEE ·
copper #C47A42 · coffee #5B3420.

## Audio configuration
- Voice: **Kokoro-82M v1.0 ONNX** via `kokoro-onnx` 0.6.1, blend **af_bella 0.7 + am_puck 0.3**, speed
  **0.98**, `en-us`. Model files from the official kokoro-onnx release `model-files-v1.0`
  (kokoro-v1.0.onnx sha256 7d5df8ec…a6c5, voices-v1.0.bin bca610b8…f7d), cached locally and not committed.
  Never substitute Piper. No celebrity or character imitation.
- Music: quiet original numpy cue (96 BPM, D major) reusing `education/pilot-01/audio/synth.py` instruments.
  SFX play only on contact (pins, taps, tears, tape, landings, drops, stamps).
- Mix: voice upfront (×1.3), music ducked 12 dB and SFX 7 dB under speech. Paper transitions get a short paper-slide
  sound (contact). Two-pass loudnorm to
  **−15 LUFS, −1.5 dBTP** (the accepted window is −14 to −16 LUFS with true peak ≤ −1 dBTP).

## QA checklist (every production round)
ffprobe (duration, streams, frame count), a whole FFmpeg decode, caption ink bounds logged per step, a full
contact sheet plus transition frames decoded from the export, one ASR and timing pass, a loudness and true-peak
measurement, a claim-to-source map, and provenance/licence notes. Fix major defects, then re-check the final export.
