# 10 · Educational progress

Session: Claude Code, branch `claude-video/wastepaisa`, 2026-11-02. App: WastePaisa
(`com.wastepaisa`), repo `cumbersomeamir/animations`. Workspace: `videos/wastepaisa/` only. No other
branches, apps, chats or private assets were opened.

## Status
**Pilot 01 "Why a paper cup is not just paper": COMPLETE (render v3, QA passed).**
- Deliverable: `videos/wastepaisa/education/pilot-01/wastepaisa-education-pilot-01.mp4`
  (SHA-256 `5121f1a42feccc7cd98238e0ea8a0a5bb616f903a67209eb92c794cec5304a0b`, 11.6 MB)
- 15.000 s · 1080×1920 · H.264 High 30/1 fps, 450 frames · AAC-LC 48 kHz stereo (720000 samples declared)
- QA report: `education/pilot-01/qa/QA.md`

## Prior work (verified at session start)
No earlier 30 s campaign render, 15 s skill test or educational pilot existed on this branch.
Context 05 said "No new video has been rendered yet" and the file tree confirmed it. Nothing
needed checkpointing or preserving. Context files 06 and 07 do not exist. The campaign deliverable in 04
remains **not started**, deliberately: the user's latest brief said not to make another campaign ad.

## Verified facts (evidence)
| Fact | Evidence |
|---|---|
| Listing: "Check recycling prices, sort waste, book pickups and track every payout." Lifestyle, free, Tensorblue AI | `assets/listing.json` (sha256 matches 03) |
| Subject claims C1–C6 (linings, other coatings, waterproofing, bonded separation, local facilities) | Dated public sources S1–S5, mapped in `education/pilot-01/sources.md` |
| User-described allowance | **Unverified**: never shown, never implied |
| Video/audio spec, decode, bounds, intelligibility | `qa/checks.json`, `qa/ffprobe.json`, `qa/decode.log`, `qa/text-bounds.json` (0/450 violations), `qa/asr-intelligibility.json` (100 %) |

## Creative choices (not facts)
Tinku (original performer), the material-dissection lab, the "Hidden materials · 01" series tag,
the cut stroke, exploded view, stretchy-arm pour, tug-of-war metaphor and facility ✓/✗ cut-outs
(labelled illustration). Palette: cream/brown/metallic with icon orange #E8741C and green #1F6B3A.
Original 96 BPM synthesized cue. Voice: Piper `en_US-kristin-medium` (public-domain LibriVox
data), +7 % pitch/formant with tin resonance. Details in context 08/09.

## Provenance and adaptations
- Skill `.claude/skills/animation-direction/SKILL.md` was read and followed: storyboard first, a reusable rig
  in this workspace, anticipation/impact/recovery, props explaining cause and effect, a full render,
  boundary and contact-sheet inspection, ffprobe and a full decode. **Adapted**: a browser Three.js 3D
  character replaced the stickman for the dimensional lab look, and editorial labelled diagrams became
  3D-anchored chips. The skill's reference repositories were not fetched or run.
- Dependencies come only from official registries: three 0.186.1, @fontsource/baloo-2 5.3.0 (npm); piper-tts 1.8.0
  and vosk 0.3.45 (PyPI, in a scratch venv). Voice and ASR models were downloaded from Hugging Face and alphacephei
  and are not committed. No Blender, paid APIs, secrets or third-party scripts.
- Narration adaptation: L3 changed from "drinks" to "liquid" after ASR showed the TTS blurred
  "drinks soaking". L4 got a comma after "But" for a clearer onset.

## Exact commands (from `education/pilot-01/`)
```bash
npm ci
python3 audio/tts.py                      # re-treat committed takes (REGEN: --regen [--only L3], needs PIPER_BIN, PIPER_VOICE_DIR, VOSK_MODEL)
python3 audio/synth.py && python3 audio/mix.py build
node src/render.js video build/video-only-v3.mp4      # 688 s for 450 frames
ffmpeg -i build/video-only-v3.mp4 -i build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart wastepaisa-education-pilot-01.mp4
VOSK_PY=<venv python> VOSK_MODEL=<vosk-model-en-us-0.22-lgraph> python3 tools/qa.py wastepaisa-education-pilot-01.mp4
node src/render.js sheet build/sheet && python3 tools/make_sheet.py build/sheet character/tinku-model-sheet.png
```
Or simply run `./build.sh`.

## Render and QA state
v1 → v2 → v3 full renders. Each review fixed real defects (see the iteration log in `qa/QA.md`).
v3 passes every automated check, and its boundary, representative and dense motion sheets were reviewed.

## Unresolved / limitations
No human listening test (cloud session); intelligibility comes from two ASR models. The beaker prop is
partly in frame at the bottom-right during the bond beat. English only. The Instagram references were not viewed.

## 10 s style test, batch 2026-11-02-pre-reset: COMPLETE
S11 paper-cut motion in Tinku's scrap shop (new source, new render; the 15 s pilot is untouched).
- Output: `videos/wastepaisa/tests/10s/pre-reset-2026-11-02/wastepaisa-10s-test.mp4`, SHA-256 `a7faf0e5e63745f93ca957908c9f62ee96fc85ab82e272f00f52d3e0bc590267`
- 10.000 s · 1080×1920 · H.264 30/1 · 300 frames (120 unique stepped 12 fps frames) · AAC-LC 48 kHz stereo 480000 samples · full decode clean
- Voice: Kokoro-82M ONNX, Meshline blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us (not Piper). Narration unshortened.
- Captions y 350–466 / x 172–908, no overlaps; one ASR pass shows all words present (one inserted "and").
- QA: `tests/10s/pre-reset-2026-11-02/qa/QA.md`. Limits: no human listening test; stylised lining band; sprite-swap posing.
- Fact facts reused: pilot-01 S1–S5. Labelled illustration. No payout or allowance claims.

## Next action
User review of pilot 01. If approved, research and claim-map episode 02 ("The magnet test")
from the list in context 08, reusing the rig, lab and audio pipeline with new staging. Make no app posts
until the user asks for one.
