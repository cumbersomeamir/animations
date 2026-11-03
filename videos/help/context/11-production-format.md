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
