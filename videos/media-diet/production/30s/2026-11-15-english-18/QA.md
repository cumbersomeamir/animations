# QA — Media Diet · 30 s English episode 18 · "Copper isn't magnetic."

**File:** `videos/media-diet/production/30s/2026-11-15-english-18/media-diet-30s-english18-01.mp4`
**SHA-256:** `37e16aacef61f1ea52974f9bc7941c587e8ec770393fd1e267fcb8bf10a72f4c` · 22,734,615 bytes · video 5857 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english18-01.png` = frame 0 (1080×1920 RGB, SHA-256 `dee3e66ab36c378f136d2db785431b4b06e0e5c50f738f7d5e4f17f0f21a62f6`);
mean absolute difference vs the encoded MP4's frame 0: 1.41/255. Words "Copper isn't" / "magnetic." ink x 250–832, y 340–534.
Build: three resumable chunk workers (15 chunks × 60 frames), then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail
`node build/thumb.mjs thumbnail-english18-01.png`.

## First-frame rule
Frame 0 is the finished subject: a pink paper hoverboard hovering over a brushed copper plate, its red/blue magnet rings and the gap visible,
schematic current loops in the copper, plus the 3-word hook (= first narration line) at full opacity; voice from 0.05 s, rotor hum from 0.0 s.
Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000 s**, audio **30.000 s** (±1 AAC frame), container **30.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−2.0 dBTP**, LRA 2.2 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **340–534** (hook) , x **196–885** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **152–839**, y **1350–1483**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **13/13 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | per-line pass **1.0** on every line (incl. the CTA); full-mix single pass **0.974** — every word is heard; the scorer counts "four-gram"/"six" (spelled out) against the script's "4-gram"/"6" and an extra trailing "You" after the CTA | qa/asr.json |
| music beneath speech (stems, per line) | speech −21.0…−19.1 dB RMS; music −34.6…−30.8 dB (10.3–14.4 dB under); foley −42.6…−32.5 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 8 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem levels
are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–1.66 s | board hovering over copper, gap and magnet rings visible; hook in two large lines (gold/white). |
| Event | the board glides across the plate; source chip "Jake Rogers · YouTube video · 13 Nov 2026 (UTC)" + "editorial reconstruction". |
| Question | camera at plate level looking into the gap under the board. |
| Mechanism | shell lifts away and fades; two magnet rings spin in opposite directions; glowing current loops appear ("eddy currents") → side view, loops brighten, green arrows push up ("pushes back") → shell back on, rotors stop, the board drops onto the copper ("no spin, no lift"). |
| Limit | one rotor close up spins up, one gold magnet, radial arrows on every magnet, a paper 6 kg weight ("≈ 6 kg pull" + small "creator's estimate · 3.84 g magnet at 8,000 rpm"). |
| Takeaway | the board glides off the copper edge onto paving and drops ("motion + metal"). |
| CTA | Media Diet sign flips up; the board hovers over a copper strip behind it; caption only. |
| Cuts | 9 shots / 8 cuts on cue boundaries; one idea and at most one large label per shot. |
| Notes | S8 opens with the board entering from the left edge (it glides in); for ~0.3 s at the CTA cut the sign is still flat and the paper riser behind it shows before the sign flips up. No clipping, missing assets or text overlap seen. |

## Fixes during this round
1. Script: the first draft ran ~28 s of speech; tightened to 76 words / 25.7 s; every take then transcribed exactly.
2. Framing (stills): all cameras pulled back for portrait; rotor base shrunk so the magnet ring reads from above; copper made metallic
   (reflection map on that material only); shell fades fully when lifted so it never crosses the caption band; single-rotor shot lowered
   out of the caption band with radial arrows on every magnet; 6 kg weight moved beside the label.
3. Render: all three workers stopped on their last chunk because the session's disk allowance was full ("Unable to capture screenshot").
   I cleared the pip/uv/npm download caches (≈ 430 MB), checked every PNG decodes, and re-rendered only the three missing chunks.
   (Deleting other episodes' gitignored frame caches was blocked by the permission system and was not done.)

## Known limitations (honest)
- The hoverboard is a generic paper reconstruction from published descriptions (two counter-rotating rings of 12 magnets under a shell),
  not the creator's board; none of his footage or photos is used, and the video itself could not be played here — its content comes from
  Hackster, TechEBlog and Interesting Engineering write-ups.
- "Like 6 kilos" is the creator's own estimate (61 N on a 3.84 g magnet at 8,000 rpm), labelled as such on screen; the hover gap is
  exaggerated and the on-screen spin slowed for readability; current loops and arrows are schematic.
- Not listened to or watched by a human yet.
