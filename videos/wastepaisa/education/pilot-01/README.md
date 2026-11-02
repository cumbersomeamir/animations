# WastePaisa · Education pilot 01: "Why a paper cup is not just paper"

A 15-second educational lesson (not an ad) for the **Hidden materials** series, performed by
**Tinku**, an original tin-can scrap creature, in a material dissection lab.

**Deliverable:** `wastepaisa-education-pilot-01.mp4`, exactly 15.000 s, 1080×1920, H.264, 30 fps,
AAC stereo 48 kHz. QA evidence is in `qa/` (see `qa/QA.md`).

## Files
| Path | What |
|---|---|
| `script.json` | Narration lines, start times, voice model URL + sha256 |
| `storyboard.md` | Shot-by-shot storyboard with timings, camera, action, captions and sound |
| `sources.md` | Dated public sources and the claim-to-source map |
| `LICENSES.md` | License and provenance for every dependency and asset |
| `src/main.js` | Scene runtime: `window.renderAt(t)` renders frame t deterministically |
| `src/choreo.js` | Choreography as data (camera, root path, pose keys, captions, chips, notes) |
| `src/rig/tinku.js` | Reusable character rig (pose parameters for body, face, hands, loupe, antenna) |
| `src/rig/cup.js`, `src/rig/lab.js` | Dissectable cup prop; lab stage, lights and facility cut-outs |
| `src/render.js` | Playwright frame capture → FFmpeg (video, stills, sheet modes) + text-bounds QA log |
| `src/sheet.js`, `tools/make_sheet.py` | Character/model sheet renderer + composer → `character/` |
| `audio/tts.py` | Piper narration, ASR-selected takes, character treatment, timing |
| `audio/synth.py`, `audio/mix.py` | Original music/SFX synthesis; ducked mix + two-pass loudnorm |
| `tools/qa.py`, `tools/contact.py`, `tools/asr_check.py` | ffprobe, full decode, contact sheets, intelligibility |
| `build.sh` | End-to-end reproducible build |

## Build
```bash
cd videos/wastepaisa/education/pilot-01
./build.sh
```
Re-synthesising the narration is optional, because the approved takes are committed:
```bash
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install piper-tts==1.8.0 vosk==0.3.45 numpy
# download en_US-kristin-medium.onnx(+.json) per script.json and a Vosk model, then:
REGEN_TTS=1 PYTHON_TTS=/tmp/tts/bin/python PIPER_BIN=/tmp/tts/bin/piper PIPER_VOICE_DIR=/path/to/voices VOSK_MODEL=/path/to/vosk-model ./build.sh
```
The render takes about 11–14 minutes in this container (software WebGL via SwiftShader, about
1.6–3 s per frame). Rendering is deterministic: every frame is a pure function of `t`.

## Skill adaptation
This follows `.claude/skills/animation-direction/SKILL.md`: storyboard first, a reusable rig
inside this app workspace, anticipation → action → impact → recovery, props that explain cause
and effect, a full render, boundary and contact-sheet inspection, ffprobe and a full decode. Where the
skill's stickman/editorial styles didn't fit the requested dimensional "material lab" look, a
browser Three.js character replaced the stickman, and the editorial idea of labelled
diagrams was kept as 3D-anchored chips. The skill's read-only reference repositories were not
fetched or executed. Everything is original code with official-registry dependencies.
