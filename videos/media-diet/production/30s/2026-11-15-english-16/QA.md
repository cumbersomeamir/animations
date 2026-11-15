# QA — Media Diet · 30 s English episode 16 · "Ten fans. No jet fuel."

**File:** `videos/media-diet/production/30s/2026-11-15-english-16/media-diet-30s-english16-01.mp4`
**SHA-256:** `e6bef02fc5aaaebaf892dec2300a1451a47b091dba7cd73e11cb10a7e4ae6717` · 22,048,415 bytes · 5880 kb/s · audio stream tagged `eng`
**Thumbnail:** `thumbnail-english16-01.png` = frame 0 (1080×1920 RGB, SHA-256 `9f8bfb2ca72ae3ad0de32bb9ea03923bf82b8f00b34ecb169c0844b8f3e28fda`);
mean absolute difference vs the encoded MP4's frame 0: 1.49/255. Words "Ten fans." / "No jet fuel." ink x 283–799, y 342–534.
Build: three resumable chunk workers, then `SKIP_FRAMES=1 bash build/build.sh`; thumbnail `node build/thumb.mjs thumbnail-english16-01.png`.

## First-frame rule
Frame 0 is the finished subject: the paper airliner flying toward camera over sunset fields with all ten fan intakes visible, plus the
5-word hook (= first narration line) at full opacity; voice from 0.05 s, electric fan whir from 0.0 s. Thumbnail = the same image.

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **900** (counted by decode) | qa/stream-checks.json |
| durations | video **30.000000 s**, audio **30.000000 s**, container **30.000000 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.2 LUFS** integrated, true peak **−1.9 dBTP**, LRA 2.2 LU | qa/loudness.txt |
| captions (ink inside x 100–900, y 230–1500, ≤ 2 lines) | ink y **342–534** (hook) / 378–488, x **193–887** | qa/text-bounds.json |
| labels (safe area; never in the caption band while a caption shows; one large label at a time) | labels x **203–876**, y **1358–1456**; **0 violations** in 900 frames | qa/text-bounds.json |
| caption ↔ speech | **11/11 cues OK** (hook cue from frame 0) | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | per-line pass **1.0** on every line (incl. the CTA); full-mix single pass **0.861** — Whisper's one-window decode of the whole 30 s dropped the final CTA sentence (it returned "You") and wrote "no" as "know"; a separate decode of 25.5–30 s hears "Follow Media Diet for the physics behind the headlines." exactly, and the mix level of the CTA window (−17.4 dB RMS) equals the previous line's (−17.3 dB) | qa/asr.json + re-check during QA |
| music beneath speech (stems, per line) | speech −20.1…−19.3 dB RMS; music −34.5…−29.7 dB (10.2–14.5 dB under); foley −52.1…−31.5 dB | measured during QA |
| contact sheets | representative (1 frame/s, 30 frames) + ±2 frames at all 7 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** per-take Whisper checks, the ASR passes on the final mix, caption sync and stem
levels are the proxy. No human has watched or listened to the final file yet.

## Visual inspection (contact sheets + stills, encoded file)
| area | result |
|---|---|
| Hook 0–2.06 s | airliner toward camera, ten cyan fan intakes with magenta hubs spinning, clouds, sunset fields; hook in two large lines. |
| Event | side pass over fields and clouds; source chip "COMAC CE-25A · first crewed flight · 14 Nov 2026" + "editorial reconstruction". |
| Question | schematic map, a 400 km ring grows around a city ("400 km (stated)"). |
| First principles | 50 gold energy tiles stack over the jet-fuel can, one green tile over the battery cell ("~50× energy per kilo") → half the fuel tiles turn red and drift away ("still ~25×") → on two scales the fuel block shrinks, the battery block stays ("battery weight stays"). |
| Payoff | short hops drawn inside the ring, a small airliner flies one ("short hops first"). |
| CTA | Media Diet sign under the airliner; caption only. |
| Cuts | 8 shots / 7 cuts on cue boundaries; one idea and at most one large label per shot. |
| Missing assets / clipping | none seen; the drifting "waste" tiles in S5 read as small dots near the caption band (no text overlap). |

## Fixes during this round
1. Script: 28.8 s of speech → 72 words / 26.0 s; numbers normalised for ASR scoring ("ten fans" ↔ "10 fans", "fifty" ↔ "50", "14th" ↔ "14").
2. Framing (stills): frame 0 rebuilt — sunset sky card, fields raised above the desk, cloud deck, airliner turned toward camera so all ten
   fans read; comparison shots and CTA pulled back; clouds kept behind the sign.

## Known limitations (honest)
- The airliner is a generic paper reconstruction from published descriptions (T-tail, ten wing-top ducted fans), not the real aircraft;
  no COMAC footage used. Battery chemistry/capacity are undisclosed and not claimed.
- "~50×" (ICCT, pack level) and "~2×" (NASA) are published estimates; "~25×" is derived from them.
- The CE-25A is in flight testing; certification has only been applied for.
- Not listened to or watched by a human yet.
