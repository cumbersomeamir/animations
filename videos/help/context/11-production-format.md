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
