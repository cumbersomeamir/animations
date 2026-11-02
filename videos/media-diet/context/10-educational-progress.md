# 10 · Educational progress (pilot 01) — resume file

Re-read CLAUDE.md, START_HERE.md, 05-progress.md and this file before any resumed turn.
Scope: app Media Diet (com.mediadiet), repo cumbersomeamir/animations, branch `claude-video/media-diet` only,
workspace `videos/media-diet/`. Pilot folder: `videos/media-diet/education/pilot-01/`.

## Prior state found (2026-11-02)
Only the context scaffold (commit 8a9342c). No earlier renders, 30 s campaign MP4 or 15 s skill tests existed on this
branch → nothing to preserve or checkpoint (documented in 05-progress.md). Context files 06/07 did not exist.

## Verified facts used (see education/pilot-01/SOURCES.md for quotes, URLs, access date 2026-11-02)
- Internet data travels in IP packets/datagrams whose headers carry addresses (RFC 791).
- Routers forward packets hop by hop toward the next hop using the destination address (RFC 1812; Wikipedia "Router").
- Home routers forward between home devices and the Internet/ISP (Wikipedia "Router").
- Major messengers relay/queue messages on their servers (Apple iMessage via APNs; Signal queues for offline devices);
  some apps sync directly between devices (Briar) → hence "usually" + on-screen "Simplified diagram" disclaimer.
- 203.0.113.0/24 and 198.51.100.0/24 are documentation-only ranges (RFC 5737) → used on packet tags.
- Media Diet facts: only listing.json (news app: "Current tech, science and finance news, clearly sourced and concise.").
  The pilot makes no product claims; only a small signature.

## Creative decisions (not facts)
- One concept: "not one jump, many hand-offs". Hook = the misconception as a dashed straight beam that shatters on "Nope";
  the hidden network rises from the floor; packets with magenta address tags; numbered hop badges; server cutaway
  with a re-labelling stamp; Nodo rides packets, fires a tether, lands, thumbs-up.
- Character Nodo (original): see context/08 and character/nodo-model-sheet.png. Name chosen to avoid "Noddy".
- Look: three.js toon shading (3-band ramp) + OutlineEffect, navy/violet/cyan/magenta sampled from icon.png.
- Type: Space Grotesk 700 captions (64 px; 82 px final), Inter 500 disclaimer (29 px) under the caption card.
- Voice: Piper en_US-mike-medium (CC0 dataset), length 1.06, pitch ×1.06 formants preserved; closing line changed from
  "Not a beam. A relay." to "Not one jump. Many hand-offs." because ASR repeatedly heard "relay" as "really".
- Music/SFX: synthesized in build/audio.py (120 BPM D-dorian pad/pluck/bass, kick+hat during the journey, ducking).

## Skill adaptation (.claude/skills/animation-direction/SKILL.md, read in full)
Used: storyboard first with timing + action verbs (context/09); simple rig with clear silhouette, action poses and facial
cues; anticipation → action → impact → recovery (wind-up/toss, stomp squash, landing squash, tumble); props explain
cause/effect (packets, tags, routers, stamp); no static drawings with pan/zoom; reusable primitives kept inside this app
workspace; full render, boundary frames + contact sheet, ffprobe + full decode, fix and rerender.
Adapted: the skill's 2D stickman / paper-editorial look was replaced by a dimensional toon 3D stage (brief asks for a
dimensional technician and cutaways); "editorial" lessons kept for captions/labels/diagram clarity.
Not used: the skill's read-only reference repos (nispa/stickman-video, jaredcassoutt/vox-editorial) were not opened;
nothing executed from them.

## Build commands (exact)
```
cd videos/media-diet/education/pilot-01
npm ci                                   # three@0.170.0, @fontsource/space-grotesk@5.2.10, @fontsource/inter@5.2.8
python3 -m venv .cache/venv && .cache/venv/bin/pip install -r build/requirements.txt
bash build/build.sh                      # audio → loudnorm → 450 frames → encode → QA  (REGEN_VOICE=1 to re-voice)
node build/render.mjs sheet character/nodo-model-sheet.png
```
QA-only extras needed locally: `.cache/vosk-model-small-en-us-0.15` (https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip,
sha256 30f26242c4eb449f948e42cb302dd7a686cb29a3423a8367f99ff41780942498).

## Iteration log (render/QA)
Full table in education/pilot-01/QA.md. Summary: stills v0 (framing, occlusion, unreadable stomp) → v1 full render
(hop-shot camera drift, final-wide occlusion, callout overlap, stomp SFX masking "It") → v2 full render
(off-screen YOUR PHONE label, pointing direction, Nodo off-frame at the 8.75 s cut, label edge/timing) → partial
re-renders of affected frame ranges → final encode.

## Verification results (final file)
- `education/pilot-01/media-diet-education-pilot-01.mp4` — SHA-256 ff387d9f6ef5409ffcadeb8aa9dceea5c6d98c6126ad9dfa3cc54128425bac05, 13,381,009 bytes.
- ffprobe: H.264 yuv420p 1080×1920, 30/1 fps, 450 frames, video 15.000000 s, AAC 48 kHz stereo 15.000000 s, container 15.000000 s.
- Full decode: exit 0, no errors. Loudness −16.0 LUFS integrated, −1.5 dBTP. Text bounds: 0 violations / 450 frames.
- ASR word recall 0.80 vs script (Vosk small model; misses are near-homophones; all lines captioned).
- Evidence: education/pilot-01/qa/ (ffprobe.json, stream-checks.json, full-decode.log, loudness.txt, contact sheets,
  text-bounds.json, asr-transcript.json, audio-timeline.png, first/last frame).

## Unresolved / limitations
- Synthetic TTS voice (local Piper); I could not listen to the mix — intelligibility checked by ASR + caption redundancy.
- 30 s campaign video (context/02, 04) remains unrendered by design: the user redirected effort to educational pilots.

## State
**DONE — pilot 01 rendered, verified, committed and pushed** to `claude-video/media-diet`.
Next action (only if the user asks): pick episode 2 from context/08, research + claim map first, reuse src/nodo.js
unchanged for character consistency, new set/camera/choreography; render only that episode.
