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

## 2026-11-14 batch english-14 — "Nine Hides Inside Ten" (delivered)
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

## 2026-11-15 batch english-15 — "Two Equal Groups" (delivered)
Brief, topic decision, history table, script, sources: 12-episode-two-equal-groups.md.
- Topic decision: requested 6 × 7 = 42 repeats english13-01's fact (7 × 6 = 42) → kept the requested doubling
  strategy, structure and first frame but used 6 × 8 = 24 + 24 = 48.
- New rule applied: frame 0 = finished hook image + "SPLIT IT. SOLVE IT." (also the thumbnail); hook audio at 0.07 s.
- Creative: 6 × 8 donut sheet (48) split after row 3 on a hinge strip; ghost outline proves the groups are equal;
  flaps "3 × 8 = 24" ×2; card 6 × 8 = ? → 24 + 24 = 48 → 6 × 8 = 48; "× 2" on "double it"; groups close into one
  sheet; music in D. Macarons rejected in QA (unreadable at phone size) → donuts.
- Paths: production/30s/2026-11-15-english-15/ — tableverse-30s-english15-01.mp4 (sha256 43b526afaa20e074c810759b7bdf3e900cd0198978d7ee5cd6e9ddc95c5a5c76) +
  tableverse-30s-english15-01-thumbnail.png (= frame 0).
- Verified: 30.000 s, 900 frames, H.264 High yuv420p, AAC 48 kHz, 0 decode errors, −15.9 LUFS, −1.5 dBTP; ASR
  transcript matches script; 48-donut count on contact sheet + 41 frames. Machine-only listening check.

## 2026-11-15 batch english-16 — "Pack in Sevens" (delivered)
Brief, topic decision, history table, script, sources: 13-episode-pack-in-sevens.md.
- Topic decision: requested 9 × 7 = 70 − 7 ("ten groups, a creature steals one") repeats english14-01's strategy
  (9 × 8 = 80 − 8) → kept the creature, nine groups of exactly seven, the reversible story, format and CTA; taught
  division as the reverse of multiplication (63 ÷ 7 = 9 ⇔ 9 × 7 = 63). Hook words "HOW MANY PACKS?" (truthful;
  nothing escapes in this story).
- Facts: CCSS 3.OA.A.2, 3.OA.A.4, 3.OA.B.6, 3.OA.C.7 (official PDF, re-read 2026-11-15).
- Creative: 9 × 7 golden star-cookie tray (63); see-through hinged pack lids (cookies always visible); original
  cut-paper mouse on split pins pulls each lid shut by a ribbon; tags 1–9; card 63 ÷ 7 = ? → 63 ÷ 7 = 9 →
  9 × 7 = 63 → ? × 7 = 63 → 9 × 7 = 63; lids open in a wave and pack again; lamp moved to the window side;
  music in B-flat. Same narrator recipe; frame 0 = pack 1 closed + mouse pulling pack 2 (thumbnail).
- Commands: see production/30s/2026-11-15-english-16/README.md (npm ci; tts.py; render --timeline;
  build_audio.py; render --video --workers 4; render --thumb; bash qa/run_qa.sh <asr-python>).
- Paths: production/30s/2026-11-15-english-16/ — tableverse-30s-english16-01.mp4 (sha256 a648d835fc14c0ac9e6c3e442dc62345b4dd4fbd724470dec09f09a22ac594f5) +
  tableverse-30s-english16-01-thumbnail.png (= frame 0); src/, audio/, qa/, README.md.
- Verified: 30.000 s, 900 frames, H.264 High yuv420p, AAC 48 kHz, 0 decode errors, −15.9 LUFS, −1.5 dBTP; ASR
  transcript matches script (count and CTA confirmed by window ASR); 63-cookie count on contact sheet + 45 frames.
  Machine-only listening check.
- QA fixes: opaque wraps hid cookies → clear lids; lilac-looking stars → golden; mouse enlarged, lamp moved, ribbon;
  frame 0 restaged; long caption split; softer glow (details in qa/QA.md).

## 2026-11-15 batch english-17 — "The Robot That Packs in Tens" (ACTIVE)
Brief, topic decision, history table, script, sources: 14-episode-robot-packs-in-tens.md.
- Topic decision: requested 6 × 4 = 3 × 4 doubled repeats english15-01's strategy (six fact = three fact doubled)
  → as the brief allows, a fresh alternate in the same genre: child-robot mini-story, identical rows packed fast,
  the brief's 3 × 4 = 12 fact, teaching multiplication by a multiple of ten: 4 × 30 = 4 × 3 tens = 12 tens = 120
  (ten tens make a hundred). Frame-0 words "TOO MANY TO COUNT?" (truthful; no doubling in this story).
- Facts: CCSS 3.NBT.A.3, 2.NBT.A.1a, 3.OA.B.5, 3.OA.A.1 (official PDF, re-read 2026-11-15).
- Creative: original cut-paper robot (wheels, screen face, antenna bulb, split-pin arms) — dizzy at frame 0, light
  bulb, zooms through rows 2–4, scratches its head in the pause, dances, rolls aside for the CTA; 120 chocolate-chip
  cookies (4 rows × 2 × 15) → 12 clear tubes of 10 (all ten slices visible); tags 1–12; pop-up hundred crate (10
  tubes, "100") + "20"; card 4 × 30 = ? → 120 → 4 × 3 = 12 → 4 × 30 = 120; music in A. Same narrator recipe.
- Commands: see production/30s/2026-11-15-english-17/README.md (npm ci; tts.py; render --timeline;
  build_audio.py; render --video --workers 4; render --thumb; bash qa/run_qa.sh <asr-python>).
- Paths: production/30s/2026-11-15-english-17/ — tableverse-30s-english17-01.mp4 (sha256 b7f6fd402c25f901c14ac802afde336f76ae43f27baf34e0472d338f42247005) +
  tableverse-30s-english17-01-thumbnail.png (= frame 0); src/ (robot.mjs new), audio/, qa/, README.md.
- Verified: 30.000 s, 900 frames, H.264 High yuv420p, AAC 48 kHz, 0 decode errors, −15.4 LUFS, −1.5 dBTP; ASR
  transcript matches script (one hallucinated "Ten tens." in a narration-free gap, VO stem silent there; counts and
  CTA confirmed by window ASR); 120-cookie / 10-per-tube count on contact sheet + 53 frames. Machine-only listening.
- QA fixes: arm angle wrap; arms in front of head; belly gauge removed; robot enlarged; tube caps hid end slices →
  respaced; robot cleared the CTA badge; end-card pop masked "Play" → moved (details in qa/QA.md).

## Unresolved / next
- Await user review of english17-01. No further episode started.
