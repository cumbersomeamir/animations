# Progress — TableVerse (com.tensorblue.tableverse)

Session branch: `claude-video/tableverse` · Workspace: `videos/tableverse/` only · Session title: "TableVerse — Production Video"

## Verified facts (from assets/listing.json + context; hashes re-checked against 03-assets.json)
- Name: TableVerse · Package: com.tensorblue.tableverse · Android · Education · Rated for 3+ · Author: Tensorblue AI.
- Listing description (used verbatim in the end card): "Learn multiplication tables through stories, practice and fun challenges."
- icon.png sha256 0ad7f267…9561 and listing.json sha256 e2f9f0da…ad26db match 03-assets.json.
- Icon content: purple/orange number-7 mascot, yellow ×, cyan orbit ring, indigo space background.
- Unknown / not claimed: learning outcomes, pricing, ratings, downloads, endorsements, specific in-app UI or features beyond the listing sentence.

## Creative decisions (proposals, refined in this session)
- Format: original stickman + "Seven" buddy (simplified original drawing in the icon mascot's colours) in a small space-planet world; palette sampled from the icon (indigo, purple, orange, yellow #F6C555, cyan).
- Story arc (cause → effect): a giant "7 × 8" block crashes down → kid freezes in ice ("Brain freeze!") → Seven knocks the ice apart → Seven stomps the block, which bursts into 8 rows of 7 sleepy stars (the *story*) → kid bounces on a trampoline 8 times, each high-five wakes a row while the counter climbs 7…56 and the VO counts in sevens (the *practice*) → three blocks drop (7×3, 7×5, then the giant 7×8 rematch) and get smashed: 21, 35, 56 (the *fun challenge*) → high five, stars swirl into the icon's orbit ring → end card: real app icon, TableVerse wordmark, verbatim listing line, "Explore on Google Play" (text only, no store badge/logo).
- No app UI is shown (none verified); the stars/blocks are explicitly stylised illustration.
- Narration: local Kokoro-82M (Apache-2.0) voice af_heart; captions mirror VO for sound-off viewing.
- Music/SFX: fully procedural (numpy/scipy synthesis), 120 BPM so the 8 practice apexes land on beats (every 30 frames).
- Typography: Fredoka (SIL OFL 1.1) via @fontsource/fredoka.

## Implementation (paths relative to videos/tableverse/)
- `source/src/timeline.mjs` — single source of truth for frames, VO placement, captions, SFX events → `source/timeline.json`.
- `source/src/scene.mjs` — per-frame pure-function scene; `characters.mjs` (FK stickman rig, expressions, headband follow-through; Seven buddy); `props.mjs` (blocks + triangle-shard shatter physics, ice, stars, trampoline, particles, captions); `render.mjs` (CLI, worker-thread renderer piping RGBA to ffmpeg).
- `source/audio/tts.py` (narration), `source/audio/build_audio.py` (music, SFX, ducking, mix).

## Commands
```
cd videos/tableverse/source
npm ci                                   # @napi-rs/canvas 1.1.0, @fontsource/fredoka 5.2.10 (exact pins)
python3 -m venv /tmp/tts && /tmp/tts/bin/pip install kokoro-onnx==0.6.1 soundfile
# model files: kokoro-v1.0.onnx (sha256 7d5df8ec…a6c5), voices-v1.0.bin (sha256 bca610b8…bf7d)
#   from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
/tmp/tts/bin/python -I audio/tts.py --model <model-dir>          # -> audio/narration/*.wav (committed)
node src/render.mjs --timeline                                    # -> timeline.json
python3 -m venv /tmp/av && /tmp/av/bin/pip install -r audio/requirements.txt
/tmp/av/bin/python -I audio/build_audio.py                        # -> build/mix.wav
node src/render.mjs --video --workers 4                           # -> build/video.mp4
```

## Checks so far
- Stills inspected for every scene (hook, story, practice, challenge, celebrate, CTA) at thumbnail and full-res crops.
- Fixed: block invisible at frame 0; hook framing too bottom-heavy; kid too small; reach arm hidden behind the head (high-five read as a point); ring stars in transit read as dark specks; over-strong white flashes; high-five overlap; VO overlap between "Fifty-six!" and the challenge line (line shortened to "A fun challenge!", moved to frame 567).

## 2026-11-02 feedback round — "Four Groups of Three" (ACTIVE)
Durable rules + style recipe: 08-format-and-style.md. Episode brief, narration, fact sources: 09-episode-four-groups-of-three.md.
- Facts: multiplication-as-equal-groups and the commutative example verified in CCSS 3.OA.A.1 / 3.OA.B.5
  (thecorestandards.org, retrieved 2026-11-02). App claim limited to the listing sentence.
- Creative decisions: tabletop flip-stage pop-up book (top-hinged page turns), cut-paper baker with brass split-pin
  joints, 12 apples visible from the first second (crate heap 3/4/5), exactly 3 per basket, single glow per completed
  group, TOTAL flip-card 0→3→6→9→12, page turn, same 12 apples into 3 tins of 4, recount badges 1–12, drawing page
  (3 circles × 4 dots), TableVerse end card with the verified icon. CTA line adjusted to "Play and learn tables
  together with TableVerse." so it addresses parent + child.
- Voice: Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98 (cached local model; Meshline/Recall files not accessed —
  other apps are out of scope, so the voice was re-synthesised from the stated recipe).
- Paths: videos/tableverse/production/30s/2026-11-02-feedback-round/ (src/, audio/, qa/, README.md);
  deliverable tableverse-30s-feedback-01.mp4 in that folder.
- Earlier work preserved: 30 s stickman (source/, silent render source/build/video.mp4 + mix), 15 s Manim test
  (tests/15s/, unrendered — see 07).

## Verification — feedback-01 (final file, 2026-11-02)
- tableverse-30s-feedback-01.mp4 sha256 0da083fa…72fc: 30.000 s (format/video/audio), 900 frames @ 30/1, h264 High
  yuv420p 1080×1920, AAC 48 kHz stereo; full decode 0 errors; −15.5 LUFS, −1.5 dBTP; captions in y 355–505.
- Narration: whole-file ASR matches script (offsets −0.01…+0.19 s); counts verified by window ASR "3 | 6 | 9 | 12";
  trailing ASR words after the CTA confirmed as hallucination over the final chord (tail ASR clean).
- Fixed in QA: card hidden under lifted apples; TOTAL flip lag (now completes on the glow frame); small recount badges;
  last-caption fade; CTA wording; per-piece shadow restore. Full re-render after fixes. Details: production/…/qa/QA.md.
- Earlier stickman picture+mix muxed for preservation at output/tableverse-30s.mp4 (30.000 s, clean decode; never
  fully QA'd; superseded).

## 2026-11-13 batch english-13 — "The Missing Row Trick" (delivered)
Brief + script + sources: 10-episode-missing-row-trick.md. Rules updated in 08 (Theory of Marketing, pacing,
caption window x 100–900 / y 230–1500, thumbnail, depth).
- Facts: CCSS 3.OA.A.3 (arrays), 3.OA.B.5 (distributive example), 3.OA.C.7 from the official CCSS PDF
  (retrieved 2026-11-13; HTML site returned a bot check).
- Creative: cupcake tray (7 × 6) with a real hinge after row 5; perspective hinges for every move, depth of field,
  parallax at beats, lamp key light; baker operates a pull-tab; flaps "5 × 6 = 30", "2 × 6 = 12", "30 + 12 = 42",
  tag "7 × 6 = ?" → 42, takeaway "5 × 6 + 2 × 6"; CTA = user's original line.
- Voice: same narrator (Kokoro af_bella 0.7 + am_puck 0.3, en-us, 0.98; cached model hashes verified).
- Paths: production/30s/2026-11-13-english-13/ (src/, audio/, qa/, README.md);
  tableverse-30s-english13-01.mp4 (sha256 dd3b84f5…bed4) + tableverse-30s-english13-01-thumbnail.png.
- Verified: 30.000 s, 900 frames, H.264 High yuv420p, AAC 48 kHz, 0 decode errors, −16.0 LUFS, −1.6 dBTP;
  ASR transcript of the final MP4 matches the script; 42-cupcake count checked across contact sheet + 42 frames.
  Listening check is machine-only (ASR + meters).

## 2026-11-14 batch english-14 — "Nine Hides Inside Ten" (ACTIVE)
Brief, episode history table, script, sources: 11-episode-nine-hides-inside-ten.md.
- Topic check: new strategy (take one group away from a ten-fact, 9 × 8 = 10 × 8 − 8); prior episodes taught equal
  groups/rearrangement (feedback-01) and split-and-add (english13-01). Visual variation: cookies, backward fold,
  flip card, music in F.
- Facts: CCSS 3.OA.A.3, 3.OA.B.5, 3.NBT.A.3, 3.OA.D.9 (official CCSS PDF, sha256 2d28ded2…).
- Creative: 10 × 8 cookie sheet (80); flip card 9 × 8 = ? → 10 × 8 = ? → 10 × 8 = 80 → 9 × 8 = ? → 9 × 8 = 72;
  untimed noticing pause; row 10 drops on a hinge strip and folds back (visible, greyed); flap 80 − 8 → 80 − 8 = 72 →
  10 × 8 − 8; closing nine-row sweep; CTA = user's line. Same narrator recipe; narration line "leaves seventy-two"
  replaced by "Seventy-two are left." after a clarity check.
- Paths: production/30s/2026-11-14-english-14/ — tableverse-30s-english14-01.mp4 (sha256 0797aa41…b74d) +
  tableverse-30s-english14-01-thumbnail.png; src/, audio/, qa/, README.md.
- Verified: 30.000 s, 900 frames, H.264 High yuv420p, AAC 48 kHz, 0 decode errors, −15.6 LUFS, −1.5 dBTP; ASR
  transcript of the final MP4 matches the script; 80-cookie count checked on contact sheet + 42 frames. Machine-only
  listening check.

## Unresolved / next
- Await user review of english14-01. No further episode started.
