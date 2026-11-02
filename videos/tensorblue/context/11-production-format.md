# 11 — Tensorblue production format (recurring rules for every round)

Durable context for future rounds and any later automation. **No automation exists; do not create one unless the user asks.**

## Channel genre (locked)
Useful new GitHub repositories · explained research papers · system design. See `00-channel.md` for scope and claim rules.

## Exact art-direction skill
- **Skill:** Animate → **Crosshatch**
- **URL:** https://github.com/cth9191/animate/blob/main/plugins/animate/skills/animate/styles/crosshatch/STYLE.md
- **Module path:** `plugins/animate/skills/animate/styles/crosshatch/STYLE.md` in `cth9191/animate` (repo HEAD `7e5eb56feb2dd573f890e1b7b34748af43d58263` when read on 2026-11-02).
- Read-only documents inspected: `styles/crosshatch/STYLE.md` (sha256 `97a3cdfd…3937a82`), `SKILL.md` (sha256 `1208ee4a…88bc0761`), `grammar/FRAME.md` (sha256 `54f27f1c…f8577665`), and the style's `sample.png` (looked at only, not committed).
- **Use:** instructions only. Never clone the repo, never run its `tools/` or `kit/` scripts, never copy its code. Write original rendering code each round.

### What we take from the style
- Sketchy ink line that **boils on 2s** (re-wobbles every 2 frames, even in held shots). We use a 4-drawing boil cycle so static layers can be cached.
- **Every filled shape carries a texture** (hatch, cross-hatch, coloured pencil, stipple) shaped by light from the **top-left** (denser toward bottom-right). Paper is the only flat fill.
- Paper grain over every frame; warm cream paper day world.
- **Terracotta `#d97757` hero dot with an asterisk** is reserved for the thing the story follows (in round 01: the viewer's request).
- **Red pencil dashes `rgba(212,56,44,0.92)` = a plan**; ink = the thing done for real. Show the plan first, then the doing.
- Write-ons (`frac`) for lines, routes and handwriting; a dark navy/periwinkle accent only where it means something (round 01: the v2 night picture).
- FRAME.md: one constant the eye can hold; colour means one thing; the idea is acted out, not labelled; something always happening; text lives in the world (tags, cards, clock) or as one short caption; scale varies (wide / mid / extreme close-up); recurring thread; phone-safe placement.

### Documented adaptations (why we differ from the skill)
| skill says | we do | why |
|---|---|---|
| story / look / storyboard check-ins before animating | skipped | each Tensorblue round arrives **user-approved** with brief + script draft |
| single-file `index.html`, Playwright capture, skill `tools/` | original Node renderer with `@napi-rs/canvas` (npm) piping raw RGBA to ffmpeg | no foreign scripts; faster, deterministic |
| no web fonts / no asset files | one OFL font asset (Patrick Hand) for captions and tags | caption legibility at phone size; licence stored with the font |
| 24 fps beat-cut pieces | 30 fps (platform spec), motion held on 2s, captions on 1s | user spec |
| voice via ElevenLabs connector or user recording | Kokoro-82M local TTS (Apache-2.0) | user-approved voice, no paid API |
| tool-call pills / navy "inside the computer" world | not used (paper world only) | not an agent explainer |
| `review.mjs` checks | our own `qa.mjs` + ffprobe/ffmpeg/ebur128 + ASR pass | same intent: "done" is measured |

## Recurring scene rules
- **One continuous notebook scene** per video (no slide cuts). The stage (round 01: a sketched globe) stays; camera moves give wide → medium → extreme close-up.
- **Every drawing participates in the mechanism.** No decorative doodles, no talking mascot, no generic diagram slideshow.
- Erasing leaves **residue** (ghost ≈ 7–13 % opacity) plus eraser crumbs; replaced content shows its ghost under the new drawing.
- Held frames keep idle life (boil, blinking server LEDs, looping requests).
- Labels are hand-lettered paper tags or text on objects; numbers that look like data are clearly illustrative (timestamps), never invented performance figures.
- Brand: neutral ink/cream fallback palette (no approved Tensorblue brand file yet); channel signature = hand-lettered "Tensorblue" + hero dot written in the caption band during the last second. No logo, no app ad.

## Storyboard clock (30 s)
hook 0–3 s · visible setup 3–8 s · mechanism/story 8–23 s · takeaway 23–29 s · elegant end 29–30 s. Narration is the clock: cues are timed from Kokoro word timings; payoff hits sit in pauses.

## Technical spec (export gate)
Portrait 1080×1920 · 30 fps · exactly 900 frames · H.264 High, yuv420p · AAC-LC 48 kHz stereo · duration 30.000 s · `+faststart`.

## Palette (Crosshatch day palette = neutral fallback)
ink `#3a2417` · paper `#f4ecd9` · cream `#efe5cf` · wood `#d6a466` · yellow `#f0c55a` · green `#5f9c5c` · red `#d4382c` · sky `#9cc4d6` · rose `#d98b8b` · **hero terracotta `#d97757`** · plan red pencil `rgba(212,56,44,0.92)` · night accent `#2b3060` + periwinkle `#8f9ad6`.

## Caption and safe areas
- Captions upper-centre, **text ink inside y 350–470**, horizontal margins ≥ 80 px, **max 2 short lines**; split by word groups, never squeeze. Patrick Hand 56 px, 56 px leading, 4 px inner pad (boil jitter stays inside the band). Captions are screen-space, so they survive camera moves.
- **Top 0–300 px: paper only.** World drawing is clipped to screen y ≥ 472 and dissolves through a paper fade between y 476–516, so nothing slides under the caption during camera moves.
- Essential visuals inside x 60–940, y 480–1500 (bottom overlay and right-hand action column stay clear of facts).
- Verified per round by `qa.mjs` (pixel diff with/without captions; top band and caption band vs paper-only render).

## Audio configuration
- **Narration:** Kokoro-82M (`hexgrad/Kokoro-82M`, revision `f3ff3571791e39611d31c381e3a41a3af07b4987`, `kokoro-v1_0.pth` sha256 `496dba11…f18ad1e4`) via PyPI `kokoro==0.9.4` + `misaki[en]==0.9.4`, `lang_code='a'` (en-us). Voice = **`af_bella`×0.7 + `am_puck`×0.3** (voice tensors blended), **speed 0.98**. No Piper, no imitation of real people/characters.
- Python 3.12 venv (kokoro needs < 3.13); torch CPU from the official PyTorch index; spaCy `en_core_web_sm` from spaCy's official Hugging Face repo. Model cache lives in `~/.cache/huggingface` (not committed).
- **Music:** original, synthesized in `mix.py` (96 BPM, D major felt-pluck arpeggio + soft pad + bass), ~17 LU under the voice and ducked ~45 % during speech.
- **SFX:** synthesized, each tied to an on-screen event list exported by the scene (pen scratch, pencil plan, eraser rub, pops, swishes, stamps, clock tick, closing chime in the pause after the last line).
- **Targets:** integrated −14 to −16 LUFS (we aim −15), true peak ≤ −1 dBTP (we aim ≤ −1.6 before AAC).
- One ASR + timing pass (faster-whisper `base.en`) on the final export; no repeated broad rework.

## QA gates (every round)
1. ffprobe: streams, codec/profile/pix_fmt, 900 frames counted, 30.000 s, AAC 48 kHz stereo.
2. Whole-file decode `ffmpeg -v error -i out.mp4 -f null -` with zero errors.
3. Loudness/true peak with ffmpeg `ebur128=peak=true` on the exported MP4.
4. Caption bounds + clean top (`qa.mjs`), contact sheet (1 frame/s) and transition tiles viewed.
5. ASR WER + word-start drift vs the caption timings.
6. Claims mapped to official sources; provenance/licences recorded.
