# 11 — Tensorblue production format (recurring rules for every round)

Durable context for future rounds and any later automation. **No automation exists; do not create one unless the user asks.**
**Latest user feedback overrides older style details** — the current format is the *brand-aligned software cutaway* (from batch 02, 2026-11-02). Round 01's cream crosshatch notebook is superseded (kept below only as history).

## Channel genre (locked)
Useful new GitHub repositories · explained research papers · system design. See `00-channel.md` for scope and claim rules.

## Exact approved style module
- **Skill:** Animate → **Crosshatch**
- **URL:** https://github.com/cth9191/animate/blob/main/plugins/animate/skills/animate/styles/crosshatch/STYLE.md
- **Module path:** `plugins/animate/skills/animate/styles/crosshatch/STYLE.md` in `cth9191/animate` (repo HEAD `7e5eb56feb2dd573f890e1b7b34748af43d58263` when read on 2026-11-02; STYLE.md sha256 `97a3cdfd418e9de66914708e9fd9b03cb20acb1b8ac0f327e46830f9b3937a82`). Also read: `SKILL.md`, `grammar/FRAME.md`, `sample.png` (not committed).
- **Use:** art direction only. Never clone the repo, never run its `tools/`/`kit/` scripts, never copy its code; write original rendering code each round.

## User feedback log (binding)
| date / round | feedback | consequence |
|---|---|---|
| 2026-11-02 · batch 02 | "REPLACE distracting boiling/moving crosshatch lines. Keep texture static if used, use clean purposeful UI cutaways and match-cut layers… No cream/brown fallback, no ambient moving lines, no generic research diagram." Website palette supplied (below). "Persist revised art direction as brand-aligned software cutaway format." | No line boil, no ambient motion; crosshatch survives only as static texture; dark brand palette; UI cutaways joined by match cuts. |

## Current format: brand-aligned software cutaway
**What we keep from Crosshatch:** hatch / cross-hatch texture inside shapes, shaded by light from the top-left (denser toward the bottom-right) — but **static**: every hatch is seeded once per element and never re-randomised between frames. One reserved hero colour. "Plan first, then the doing" becomes "pending first, then confirmed".
**What we replaced (per feedback):** boiling lines, paper grain that changes per frame, cream/brown paper, hand-lettered type, ambient moving lines.

### Scene rules
- **One continuous scene with a constant object** the eye can hold (batch 02: the like-heart). Change beats with **purposeful match cuts and layer moves** — an object from one beat becomes the next beat's object (heart → pending request card → accept/reject fork → rollback → comparison tiles → feedback/confirmed lanes). No slide cuts, no text slides.
- **Clean UI cutaways:** rounded panels (#0D1628 / #0A172D) with hairline #D8E3F5 borders, crisp vector icons, static hatched drop shadows. Show the mechanism by *doing it* on screen (request travels, server decides, heart drains), not by labelling a diagram.
- **Motion only when it means something** (tap, travel, decide, roll back, confirm, camera push to the subject). Spinners only while something is genuinely pending. Held frames are allowed to be still.
- Camera: wide for setup, push-in for the key mechanism (≈1.3–1.45×), pull back for comparison and takeaway; the safe areas below must hold at every zoom.
- Every element participates in the mechanism. No mascots, no random characters, no stock "AI" imagery. A recurring thread (batch 02: the finger taps in the hook and again before the takeaway).
- UI text inside the scene is generic and illustrative ("128 likes", "Couldn't like post") — never a claim about a real app's behaviour.
- **Channel signature:** "Tensorblue" in Inter Bold, white, with a brand-blue dot, written into the caption band in the last ~1.2 s. No logo invented, no app advert.

### Palette (Tensorblue website palette, supplied by the user, observed 2026-11-02)
| role | colour |
|---|---|
| background | `#030610` |
| panels / navy | `#0D1628`, `#0A172D` |
| **brand blue — the hero / optimistic state** | `#0A6CFF` |
| text | `#FFFFFF` |
| secondary text, hairlines | `#D8E3F5` |
| hero gradient (art, bursts, confirmed accents) | `#E8F3FF` → `#91BBFF` → `#85ECED` → `#EDF9FF` |
Colour meaning in batch 02: blue = what the screen shows optimistically; aqua `#85ECED` = server-confirmed; white/× = rejected; secondary = neutral/pending. Only alpha tints of these colours are allowed (no cream, brown, red or other hues).

### Type
Inter 4.0 (SIL OFL 1.1, `assets/fonts/inter/` with `OFL.txt`): captions **Inter SemiBold 50 px**, line height 58 px; UI labels Inter Medium/SemiBold 28–46 px; titles Inter Bold. (Patrick Hand belongs to the retired round-01 look.)

## Storyboard clock (30 s)
hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · elegant end 29–30 s. Narration is the clock: cues come from Kokoro word timings; payoff hits sit in pauses (batch 02: confirm chime right after the last word).

## Technical spec (export gate)
Portrait 1080×1920 · 30 fps · exactly 900 frames · H.264 High, yuv420p, CRF 18 capped at 12 Mb/s · AAC-LC 48 kHz stereo · duration 30.000 s · `+faststart`.

## Caption and safe areas
- Captions upper-centre, **text ink inside y 350–470**, horizontal margins ≥ 80 px (renderer rejects any caption line wider than 880 px), **max 2 short lines**; split by word groups. 4 px inner pad. Captions are screen-space, so camera moves never move them.
- **Top 0–300 px: background only.** World drawing is clipped to screen y ≥ 472 and fades into the background between y 476–516, so nothing slides under the caption during camera moves.
- Essential visuals inside x 60–940, y 480–1500 (bottom overlay and right-hand action column stay clear of facts).
- Verified each round by `qa.mjs` (pixel diff with/without captions; top band and caption band vs a background-only render, every 10th frame).

## Audio configuration
- **Narration:** Kokoro-82M (`hexgrad/Kokoro-82M`, revision `f3ff3571791e39611d31c381e3a41a3af07b4987`, `kokoro-v1_0.pth` sha256 `496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`) via `kokoro==0.9.4` + `misaki[en]==0.9.4`, `lang_code='a'` (en-us). Voice = **`af_bella`×0.7 + `am_puck`×0.3** (voice tensors blended), **speed 0.98**. Run with `HF_HUB_OFFLINE=1` when the cache exists. No Piper, no imitation of real people/characters.
- Script length: 65–80 words; at this voice ≈ 2.9–3.2 words/s, so ~70 words ≈ 22–24 s of speech leaves breathing room in 30 s.
- **Music:** original, synthesized in `mix.py` (felt-pluck arpeggio + soft pad + bass; key/tempo change per round), ~18–20 dB under the voice during speech and ducked further; +6 dB outro lift after the last word, applied after normalisation.
- **SFX:** synthesized, each tied to an on-screen event list exported by the scene (`dump-events.mjs`).
- **Targets:** integrated −14 to −16 LUFS (aim −15), true peak ≤ −1 dBTP (aim ≤ −1.6 before AAC).
- One ASR + timing pass (faster-whisper `base.en`) on the final mix; no repeated broad rework.

## QA gates (every round)
1. ffprobe: streams, codec/profile/pix_fmt, 900 frames counted, 30.000 s, AAC 48 kHz stereo.
2. Whole-file decode `ffmpeg -v error -i out.mp4 -f null -` with zero errors.
3. Loudness/true peak with ffmpeg `ebur128=peak=true` on the exported MP4.
4. Caption bounds + clean top (`qa.mjs`); 1-fps contact sheet and transition tiles from the exported MP4 viewed; full-resolution crops for compression artefacts.
5. ASR WER + word-start drift vs the caption timings.
6. Claims mapped to primary/official sources; provenance/licences recorded.

## History: round 01 (superseded look)
Round 01 (`12-production-30s-01.md`) used the Crosshatch day palette (cream paper, brown ink, terracotta hero dot), boiling ink on 2s, paper grain and Patrick Hand lettering. Retired by the batch-02 feedback; do not reuse it unless the user asks.
