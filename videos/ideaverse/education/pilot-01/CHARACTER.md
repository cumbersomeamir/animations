# DOCKET — recurring performer for Ideaverse AI Literacy

Original character created for this series (2026-11-02). Model sheet: `character/docket-model-sheet.png`
(rendered from the same rig: `node src/render.mjs --sheet`). Reusable rig: `src/character/docket.js`.

## Identity
- Role: robot reporter in an experimental newsroom who *tests* claims with physical props.
- Silhouette: rounded screen-face head with a navy cap ridge and a springy mint microphone antenna; filing-cabinet
  torso with two working drawers (NOTES, SOURCES) and a PRESS tag; navy tube arms with white mitten hands and mint
  cuffs; short navy legs with mint-toed boots. Height ≈ 1.55 scene units incl. antenna.
- Palette (sampled from the Ideaverse icon): navy #1B2333, mint #6CDA7E, white #F4F7FB; shell #E9EFF2 (derived light
  grey for the body). Amber #FFC24B is a provisional accent used only for "gap / unverified".
- Face: emissive screen with 8 expressions — neutral, happy, wow, skeptic, puzzled ("?"), focus (scan line),
  determined, proud — plus blink and a mouth bar driven by the narration amplitude (lip-sync per frame).
- Voice: Piper TTS (en_US-ljspeech-high) with an original character treatment (+1.6 semitone pitch, formants
  preserved, 3 ms metallic comb, band-limit) — see src/narration/make_voice.sh. Not modelled on any actor/character.

## Rig controls (`docket.pose({...})`)
`x, z, rotY, hop, crouch` (planted 2-bone legs) · `lean, tilt, twist` · `headYaw/Pitch/Roll` ·
arms A/B: `aFwd, aOut, aBend` / `bFwd, bOut, bBend` (+ numeric IK in the stage: `solveArm`) ·
`drawer` (SOURCES), `notes` (NOTES) open amounts · `antenna` spring angle. `docket.face(expr, {talk, blink, look, t})`.

## Consistency rules for later episodes
Same proportions, palette, face set and voice treatment every episode. Change situations, props, camera and
choreography — not the design. Drawers are the character's signature device (evidence/sources).

## Differentiation from references
Quality references named by the user (instagram.com/battysticky, instagram.com/breakingbreach) were not viewed in this
session and nothing was copied: no shared character shape, palette, script, logo, asset or voice.
