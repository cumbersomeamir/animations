# 11 — Production format (durable, for future rounds)

Saved 2026-11-02 for round `production-30s-2026-11-02`. App: Help · `com.tensorblue.help` · branch `claude-video/help` · workspace `videos/help/`.
No automation was created; this file is the reusable spec.

## Channel genre (locked)
Practical helping poor people through donations that match actual needs. Educational, respectful, useful without the app.
Never: pity spectacle, fabricated beneficiary/testimonial, invented statistics or impact, fraud/scam-channel framing, app ads.

## Visual skill (exact)
**Shadow Puppetry** — https://github.com/lemomo-ai/lemo-opuscar/blob/main/styles/shadow-puppet/STYLE.md
(module `styles/shadow-puppet/`: STYLE.md, style.json, DEMO.md, demo/, poster.jpg, .srt; no SKILL.md exists). Read-only art direction;
nothing cloned, installed or executed. Implementation is original Canvas2D code in this app's folders.

### Adopted from STYLE.md
Warm cream cotton screen with procedural weave + darker edges; two lamps with broad lobe + hotspot, independent flicker; "lamp count is
the brightness dial" (one lamp dims for cold/night beats — never add blue); translucent dyed pieces multiplied with a hide texture; dense
carved openwork (diamond/coin lattice) + dark carved outline on every piece; jointed puppets (8–12 pieces) with round rivets, 2-bone IK
arms from hand targets, ~1.2× heads with headwear, fuller lower body, open-cut (sympathetic) faces that never change — attitude from head
angle/body tilt; held objects are separate pieces; nothing morphs (slide on rods, rotate on rivets, swap); thin rods visible to the bottom
edge; low-frequency hand tremor; pendulum tassels; arrivals snap from blur; dimming-lamp transitions; static cloth/frame (camera may push
on frame centre); warm brown vignette + light grain; percussion-first sound (clapper, frame drum, small gong).

### Adaptations (and why)
- Palette: Help icon colours instead of the style's dye set — green `#2DB37D` / `#1F8A5E`, yellow `#F2C230` / `#C99A12`, cream `#F7F5EF`,
  ink `#0B0D12`; neutrals for hide/skin `#D9B98A`, scarf `#E8A23A`, leftovers bag `#9A8F7A`.
- Type: app font Inter ExtraBold (from `education/pilot-01/fonts`, OFL) instead of the style's serif, for small-screen legibility; captions
  sit on the dark surround above the screen instead of a placard.
- Frame rates: delivery 30 fps; puppets step at 15 fps (each pose held 2 frames), effects (snow) at 12 fps — the style's 24/12 fps
  stop-motion feel mapped onto a 30 fps container.

## Recurring scene rules
One continuous stage per episode (no cuts needed; camera = audience-seat wide + slow pushes on frame centre). Two same-size, upright,
respectful figures in profile (giver left facing right, neighbour right facing left). Ideas become carved plaques on rods (question
plaques, ✓ badges). "Illustrative scene" carved small inside the cloth's bottom strip. Signature: tiny app icon + "Help" in the cloth's
bottom-right strip during the last ~1.5 s. Beat budget for 30 s: hook 0–3 · setup 3–8 · mechanism 8–23 · takeaway 23–29 · end 29–30
(lamps dim).

## Audio config
Voice: local Kokoro-82M ONNX (`kokoro-onnx==0.6.1`, model files `kokoro-v1.0.onnx` + `voices-v1.0.bin` from the kokoro-onnx GitHub release
`model-files-v1.0`, cached at `videos/help/tests/10s/pre-reset-2026-11-02/models/`, git-ignored). **Meshline blend `af_bella`×0.7 +
`am_puck`×0.3, speed 0.98, lang `en-us`.** One take per sentence; never speed up — shorten the script instead. No Piper.
Mix: voice upfront; quiet original music (plucked mallet, felt bass, pad) ducked ≈ −7 dB under speech; event-linked SFX on the shared
`cues.json`; target −15 LUFS integrated (accept −14…−16), true peak ≤ −1.5 dBTP; 48 kHz stereo AAC.

## Caption safe areas (1080×1920)
Top 0–300 px: nothing. Caption ink y 350–470, x ≥ 80 px from each edge, upper centre, on the dark surround; one card per spoken word group,
max 2 short lines (prefer one line, 64 px, never below 56 px before splitting); cards never overlap (≥ 2-frame gap), timed from one ASR
word-timing pass. Screen/action region y ≈ 530–1680 (stays clear of captions under camera pushes ≤ 1.08); essential visuals kept above
y ≈ 1530; bottom strip only for non-essential labels/signature.

## Pipeline (reuse)
`audio/voice_kokoro.py` → `audio/mix30.py` (soundtrack + `build/voice_track.wav`) → one Vosk ASR pass → `tools_captions.py`
(`src/captions.json`) → `node render.mjs` (Canvas2D → PNG → libx264 fast, reuses identical stop-motion frames) → ffmpeg mux →
QA (`render.mjs --capbounds`, ffprobe, full decode, contact sheets, ebur128). Reference implementation: `videos/help/production/30s/2026-11-02/`.

## Update 2026-11-02 — batch-02 (latest user feedback; overrides older details where they conflict)
- Rounds so far: 30s-01 "Before donating clothes, ask these three questions" (reviewed; do not regenerate the topic);
  30s-02 "Why a flood survivor may need cash rather than another box" (batch-02).
- Each new episode = genuinely new topic + fresh storyboard with purposeful transitions; never trim/recolour old output.
- Keep the accepted identity: the giver puppet (yellow wide-brim hat, green robe) is recurring; other figures are dignified
  households/neighbours built on the same rig (scaled 0.6 when a scene needs several people). No random new mascots.
- Scene vocabulary added in batch-02: carved flood-wave bands (12 fps), market stall with corrugated shutter + swappable
  OPEN/CLOSED tag (practical market condition), carved need plaques with icons (MEDICINE / TRANSPORT / RENT), choice tokens
  (envelope + coin hole; no currency symbols), supply boxes, "LOCAL GROUP — REQUESTS" board with tick rows, an identical
  pile of boxes that slides aside and dims on the payoff ("what is easiest to donate").
- Claims discipline (user): source humanitarian-method claims from IFRC / Red Cross Red Crescent guidance; show conditions
  (markets working or disrupted) instead of blanket rules — never "cash is always best". No invented recipients/testimonials.
- Script length for 30 s with Kokoro Meshline at 0.98: ~65–80 words (≈ 25–26 s of speech max); reword phrases that ASR
  mishears on key words (e.g. "do not all need" → "not every family needs") rather than speeding up.
- Captions: word groups chosen per sentence (src: `tools_captions.py` GROUPS); one line preferred, 56–64 px.

## Update 2026-11-02 — feedback round (SUPERSEDES conflicting earlier rules)
**Channel purpose:** Help = helping people in poverty through donations. Not general productivity, mentalism, or a disaster-news
channel. Episodes are concrete educational stories a general viewer can understand and share — no weak generic donation speeches,
no filler, no empty motivational lines, no long disclaimers (put any material qualification briefly inside the relevant sentence).

**Recurring format: "Hands That Reveal the Hidden Cost"** (first used in `production/30s/2026-11-02-feedback-round/`).
Inspiration reviewed by the user: https://www.instagram.com/p/DfOqfiFtzCm/ — take only its craft (textured high-contrast stage,
cut-out hands physically revealing an explanation, short bold captions, close-ups, dramatic prop changes). Its mentalism subject is
NOT Help content. Not accessed by Claude; the user's review is the reference.

### Exact style recipe (the look — a rendering library is not the style)
1. Stage: warm cream cotton shadow screen with visible weave, dark wood frame that never moves, ink surround; brown (not grey)
   vignette, light grain. High contrast: deep dyed pieces against a lamp-lit centre.
2. Light: two oil-lamp lobes with independent flicker; scene changes = a quick lamp dip, or one warm-white flash on a dramatic
   prop change; ending = lamps dim.
3. Pieces: translucent dyed hide (Help palette) multiplied with hide texture, dark carved outline on every piece, carved
   lattice/coin openwork inside larger shapes, rivets at joints, thin grey rods running to the bottom edge, soft offset cast shadow.
4. Hands: large cut-out hands on long sleeves (helper = green sleeve + yellow cuff; neighbour = light-green sleeve + orange cuff)
   that rise from below to lift, flip, tap, carry, lay planks — the hands do the explaining.
5. Props: few, big, readable: one idea per prop (small packet, bulk sack, budget envelope, coins without currency symbols,
   carved word-plaques, comparative bars). Prop changes are swaps/slides, never morphs.
6. Diagrams: large comparative bars without invented numbers or prices; labels are 1–3 word pills ("per kilo", "paid today",
   "left today"); keep them centred, above y≈1560, away from side UI.
7. Camera: push through the frame on close-ups (frame stays fixed), purposeful scene changes every 3–6 s (8 scenes in 30 s);
   no static page with camera bobbing.
8. People: the recurring yellow-hat helper silhouette + dignified same-size neighbour(s); no caricature of poverty, no pity montage;
   the person states the need and acts (takes what they asked for).
9. Motion: puppets step at 15 fps (each pose held 2 frames), arrivals snap from blur, small overshoot on reveals, hand tremor.
10. Type: Inter ExtraBold (app font), cream on ink for captions; glowing cut letters on dark hide plaques for in-scene words.
11. Palette: green `#2DB37D`/`#1F8A5E`, yellow `#F2C230`/`#C99A12`, cream `#F7F5EF`, ink `#0B0D12`, hide `#D9B98A`,
    sack kraft `#C9A06A`, neighbour orange `#E8A23A`.
12. Sound: Kokoro Meshline voice upfront; music = soft sustained pad per scene + one bass note and a two-note reveal motif at
    scene changes only (NO repeating arpeggio/loop); SFX tied to actions (cards, coins, gate, planks, tick); −15 LUFS, ≤ −1.5 dBTP.

### Structure + safe areas (feedback round)
Strong opening question; distinct scenes that show the mechanism as it is narrated; clear takeaway; short natural CTA in the final
3–4 s that fits Help's donation purpose (e.g. "Help someone meet a real need. Explore Help."). Never claim every donation is
tracked, never invent app capabilities, statistics, prices, savings, income or testimonials.
Captions: y < 300 empty; caption ink y 340–520, x 90–990, max two readable lines, one word group per card, no overlaps.
Output naming for this round: `videos/help/production/30s/2026-11-02-feedback-round/help-30s-feedback-01.mp4`.

## Update 2026-11-03 — round 02 (specific corrections only; accepted renderer/style/voice/captions unchanged)
- **Editorial scope (corrected):** broad, informative education about poverty, unmet essentials, access barriers and how aid
  systems work, always ending in a useful takeaway — not narrow app ads and not a recycled small-pack-price lesson.
- **Keep exactly:** the accepted "Hands That Reveal the Hidden Cost" renderer/style recipe (reference implementation:
  `production/30s/2026-11-02-feedback-round/src/stage.html` — its primitives are copied unchanged into each new episode),
  caption treatment, Kokoro af_bella 0.7 + am_puck 0.3 / en-us / 0.98 voice, quiet voice-forward mix, pacing and the
  yellow-hat helper. No unsolicited redesigns.
- **CTA (corrected):** "Download Help to donate essentials." — matches the verified Play listing ("Donate essentials in Lucknow
  with next-day delivery and verified proof", re-checked 2026-11-03). Never imply Help collects food surplus or runs services
  the listing does not document.
- **Icon:** use the latest official Play Store icon. Re-fetched 2026-11-03 from the listing (=s512): byte-identical to
  `assets/icon.png` (SHA-256 0646d82d…eebd4), so the approved asset is current. No fabricated screenshots or features.
- **Script:** natural 65–75 words; strong useful hook, concrete mechanism, meaningful scene changes, clear takeaway, CTA in the
  final 3–4 s; qualifications only inside the relevant sentence; source links only in repo notes / publishing copy.
- **Captions:** upper safe zone y 340–520 (accepted treatment lands ≈ 379–495), x 90–990, ≤ 2 lines, y < 300 clear.

## Update 2026-11-03 — hindi-03 (latest user correction: Hindi episodes)
- When a batch asks for Hindi: ALL narration and captions in natural Hindi (Devanagari); in-scene words in Hindi too
  (the app's brand logo plaque keeps the real icon + "Help").
- Hindi voice (never feed Hindi to an English voice): Kokoro-82M native Hindi voices, blend `hf_alpha`×0.7 + `hm_omega`×0.3
  (female-led, mirroring the accepted Meshline proportions), speed 0.98, lang `hi` (espeak-ng Hindi G2P bundled with
  kokoro-onnx). Same cached model files as the English episodes.
- Hindi font: Noto Sans Devanagari (OFL, npm `@fontsource/noto-sans-devanagari@5.2.8`, woff2 600/700/800 copied into the
  episode `fonts/`); font stack `Inter, "Noto Sans Devanagari"` keeps the accepted caption size/colour/position.
- Hindi intelligibility check: offline Vosk `vosk-model-small-hi-0.22` on the voice track + final mix (QA-only, not committed);
  replace words the ASR mishears (e.g. ढोना→"धोना", बाँटना, जाँचें) with clearer equivalents.
- Hindi pacing: the native voice is slower, so a 30 s Hindi episode carries ~55–60 words (≈25 s of speech); narrow the script,
  never speed it up. CTA in Hindi: "हेल्प ऐप डाउनलोड करें, ज़रूरी सामान दान करें।"

## Update 2026-11-04 — hindi-04 (skill adjustments learned this episode)
- Children: never draw or "film" a child. Represent a child's schooling with objects only (empty desk, school bag reaching
  the desk); adults/households are the recurring same-size puppets (keep helper and family at the SAME scale in every scene).
- A fictional family example must be labelled on screen ("काल्पनिक उदाहरण") and spoken as fictional; fictional names only.
- Captions: `tools_captions.py` now asserts every spoken word is in exactly one caption card (a Hindi word-count slip had
  dropped "है/हैं" from three cards before the assert was added).
- Indian government hosts (mospi.gov.in, indiacode.nic.in, education.gov.in) often refuse automated fetches; record them as
  unverified pointers and rely on verifiable primary research / official reproductions — never quote unverified figures.
- `piece()` multiplies its fill: a coloured meter fill drawn on a dark trough reads black. Draw meter troughs as light hide
  (e.g. `#D9C9A8`) so green → amber → empty stays legible.
- Scene entry: a scene's anchor props (house, figure) must slide in with the scene, not pop at a later cue, or the A→B hand-off
  leaves an empty stage. Pace: 67 Hindi words fit 30 s when sentences 1–5 run with ~0.35 s pauses and the CTA keeps ~3.7 s.

## Update 2026-11-05 — feedback-05 (corrections learned this episode)
- Opening test (user's performance snapshot; not a causal finding): the subject is on stage at frame 0 and completes a visible action within
  0.5 s (lift + screen lights); the episode's checks are pinned onto the object by ~3 s. Style itself unchanged.
- Device props: draw a lit screen source-over (a multiplied `piece()` screen turns dark); use generic app glyphs only, never third-party app brands.
- When the topic item is not an "essential" (e.g. a phone), keep the CTA scene on the essentials sack + real icon — never imply Help collects that item.
- Voice naming: "Meshline" (af_bella + am_puck) is English-only; for Hindi it maps to the approved Kokoro hf_alpha 0.7 + hm_omega 0.3 blend.
  No "Recall" voice is defined in this app's context.
- Hindi ASR: "टिकती" is heard as "दिखती" (meaning changes) → say "देर तक चले". Keep ~0.3–0.4 s pauses; 68 words fit with a 3.7 s CTA.

## Update 2026-11-06 — english-06 (corrections learned this episode)
- English batches: narration + captions + in-scene words in English only; voice = Meshline (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98)
  synthesized fresh per episode; Inter only (drop the Devanagari font faces). ~77 words ≈ 23.7 s of speech fits 30 s with a 1.8 s CTA line.
- Hook wording: sentence-initial "Would…" was heard as "What…" by ASR → open with a hard consonant ("Can a child…").
- Hands that reach down from above must be drawn *behind* step plaques (sleeves otherwise cover the plaque text).
- Check-tick SFX only in the pauses between sentences; ticks that land inside a spoken line are visual only (feedback-05 masking lesson).
- A "wrong vs right" comparison needs ≥ 0.8 s on screen (the size overshoot first showed for 0.3 s).
- Post copy never names other apps/platforms (keep e.g. GIVIT in repo notes only); it repeats the final transcript verbatim.

## Update 2026-11-06 — english-07 (corrections learned this episode)
- Topic gate: "ask the organisation what is needed" is already the takeaway of 30s-01, hindi-03 and english-06 — treat further "ask first /
  random bundle" proposals as covered and pick a fresh subject in the genre (english-07 → checking that an unknown donation group is genuine).
- Every scene must carry its anchor props from its first slide-in frame (QA again found an empty hand-off when the ID card/register popped in late);
  later cues may add emphasis (pulse/glow), not first appearance.
- Plaque text must fit its plaque (size the width to the longest label: "FICTIONAL EXAMPLE" at 44 px needs ≥ 560 px).
- A collector/fundraiser is shown only as a neutral hand with a tin — never a caricatured face; no recipients are shown in safety lessons.

## Update 2026-11-07 — english-08 (corrections learned this episode)
- Topic gate: cold storage / transport spoilage of donated food is covered (round-02). Food lessons must find a new mechanism (english-08: date labels).
- Wording must match the source's own examples (GOV.UK names ready-to-eat salads, not yoghurt, for use-by) and policy variety ("often"/"some", not "all").
- Start the first line ≥ 0.35 s in: ASR (and listeners) lose a clipped first word. ASR-test risky nouns in isolation before the full mix
  ("tin" after "the" → "ten"; "in date" → "and date"): rephrase rather than accept a misheard key word.
- Music duck under speech raised from 0.55 to 0.72 for english-08 (hook line had only ~11 dB of margin); keep ≥ 15 dB voice-over-music in hooks.

## Update 2026-11-08 — english-09 (corrections learned this episode)
- "Looks new" props need a saturated palette fill (e.g. P.yellow upper): pale fills under the hide pattern read as grey stone, not new.
- Side-view objects must carry one unmistakable silhouette cue (shoe: collar opening + toe line) or they read as blocks.
- ASR traps found: "one shoe alone" → "once you alone", "unworn" → "unborn" — rephrase ("a single shoe", "even if never worn").

## Update 2026-11-09 — english-10 (corrections learned this episode)
- Topic gate reaffirmed: "ask what is needed / random bundle" proposals stay covered (english-10 → toiletries gap in food help).
- SFX that sit on a spoken word must not be broadband (paper rustles masked "Soap" → ASR "so"); keep item-arrival sounds in pauses.
- Never put a `//` comment mid-line in the stage code: it swallowed `g.save()/translate` and leaked a scene's props into its neighbours.
  Use `/* … */` or a separate line; always re-check the transition sheet after any code edit.
- When a gov site refuses automated fetches (USDA FNS 403), use the regulation itself (govinfo CFR) rather than circumventing the block.

## Update 2026-11-09 — english-11 (corrections learned this episode)
- Topic gate: shoe checks (pair / sole / size) are covered (english-09). Next shoe/clothing-condition proposals → pick a new item or mechanism.
- When a key authority's text can't be read from a primary page (WHO guideline PDF 403, EMRO 502), drop that claim instead of paraphrasing it.
- Lint before each render: no mid-line `//` with code after it in `src/stage.html` (one-line python check, see english-11 QA).

## Update 2026-11-11 — "Published apps / Satisfied?" feedback (user-approved; SUPERSEDES conflicting earlier rules)
**Verdict read 11 Nov 2026:** style good; genre/content still weak; use the latest store icon.
**Niche (refined):** practical systems that help people in poverty — food access, community initiatives, donation effectiveness and dignity.
Each episode explains a documented, real model or mechanism (not a vague appeal, not an app tutorial). Retain the accepted style, narrator and assets.
**Story structure (Theory of Marketing):** thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
- Hook answers "why should I care"; build-up sustains ONE specific open question; proof makes the answer credible (a real, sourced initiative or
  an accurate editorial diagram); payoff gives useful knowledge; CTA is a relevant next step. Suspense only from a real unanswered question —
  never false claims. Do not repeat the answer in every scene; no generic padding.
**Pacing (30.000 s):** 0–3 s striking image + hook · 3–5 s optional escalation · 5–21 s visual explanation and proof with scene changes ·
  21–27 s resolve the question with a concrete takeaway · 27–30 s concise app-relevant CTA (adapt naturally, total stays 30 s).
**Thumbnail:** a separate attractive vertical thumbnail (1080×1920) tied to the hook, 2–4 large words; delivered with the MP4.
**Screen grammar:** one visual idea at a time; no paragraph cards; on-screen labels large and brief — the voice explains the detail. Never show a
  caption, diagram labels and an explanatory paragraph competing at once. Reveal diagrams sequentially; use deliberate depth, lighting and
  transitions; avoid decorative distracting lines; motion must explain the topic.
**Captions (NEW zone, supersedes x 90–990 / y 340–520):** readable inside x = 100..900, y = 230..1500, clear of platform overlays
  (implemented: centre x = 500, max ink width 760 → x ≈ 120..880; upper position kept, y ≈ 376..500; ≤ 2 lines).
**Claims:** verify with primary/reliable sources before the final script; label measured facts vs estimates vs illustrative assumptions; sources
  in project notes, not in the video. Never invent prices, returns, news, app functionality, impact numbers, testimonials or scientific certainty.
  No boilerplate warning/disclaimer narration — omit risky procedures instead; keep essential legal qualifications concise and accurate.
  If a fresh-news claim cannot be verified, choose another verified story.
**CTA:** relates to helping through Help using verified capabilities only (store listing: "Donate essentials in Lucknow with next-day delivery and
  verified proof"); never imply Help runs a third-party initiative shown in the episode.
**Icon:** re-verify the current Play/App Store icon each round before rendering.
**Delivery/QA:** completed MP4 (+ thumbnail) only for the user's video-review folder; source, citations, prompts and QA stay in the repo. Render,
  full-decode, check duration/codecs, inspect transitions/frames, check caption sync, clipping, missing assets. I cannot listen to audio: report
  the ASR-based check as such and never claim a listening pass.

## Update 2026-11-13 — english-13 (2026-11-11 feedback retained; corrections learned this episode)
- Topic gate: food-redistribution chain / transport / last-mile capacity / "your donation solves a bottleneck" proposals are covered (round-02 +
  english-08 gate + "ask first" gate). english-13 switched to **client-choice pantries** (shop-style food banks; "won't people take too much?") —
  now covered too; next pantry-model proposals need a different mechanism.
- Every scene needs an anchor present from its slide-in (english-13 trial scene: pedestals + plaque) — a reveal that starts from an empty stage reads
  as a blank frame. Badges/ticks must land before the scene's slide-out (≥ 0.4 s before the scene end).
- Hook label with a diegetic sign under the opening zoom: keep the label ≥ 80 px above the sign (english-13: label y 750, sign below).
- ASR traps: sentence-initial "But"/"And" are dropped in isolation → start lines without them; "skip food" → "skip through" (use "skip what").
- Sources: PubMed web pages are cookie-walled for the fetch tool → read the abstract via NCBI E-utilities efetch (official API); a university PDF
  returned as raw bytes → pdftotext on the saved file. A measured result from one trial must name what was tested ("choice plus coaching").

