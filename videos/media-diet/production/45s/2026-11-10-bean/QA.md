# QA — Media Diet · 45 s physics special · "How many people would actually move Chicago's Bean seven inches?"

**File:** `videos/media-diet/production/45s/2026-11-10-bean/media-diet-bean-45s-01.mp4`
**SHA-256:** `a7a31eaeefb6a15e513c74889b69925e26f4d9fc8303d876d70ecdc407e532f4` · 26,330,161 bytes · 4681 kb/s · audio stream tagged `eng`
Build: footage frames 180–284 of the user video → `.cache/footage/`; three resumable chunk workers (`build/render_chunks.sh`); then
`SKIP_FRAMES=1 bash build/build.sh` (audio, encode, QA).

## Automated checks (final export)
| check | result | evidence |
|---|---|---|
| H.264 High, yuv420p, 1080×1920, 30/1 fps | PASS | qa/ffprobe.json, qa/stream-checks.json |
| frame count | **1350** (counted by decode) | qa/stream-checks.json |
| durations | video **45.000000 s**, audio **45.000 s** (±1 AAC frame), container **45.0 s** | qa/stream-checks.json |
| AAC-LC 48 kHz stereo | PASS | qa/ffprobe.json |
| full FFmpeg decode (`-xerror`, all streams) | exit 0, 0 bytes of errors | qa/full-decode.log |
| loudness | **−15.1 LUFS** integrated, true peak **−1.9 dBTP** | qa/loudness.txt |
| captions (English, ink y 340–520, x 90–990, ≤ 2 lines) | ink y **378–488**, x **155–924** | qa/text-bounds.json |
| safe areas | **0 violations** in 1350 frames (top 300 px clear of our text; nothing below y 1600; all text x 90–990) | qa/text-bounds.json |
| caption ↔ speech | **18/18 cues OK**: each cue appears 0.10–0.22 s before its speech and stays 0.14–0.37 s after | qa/caption-sync.json |
| English intelligibility (Whisper medium, en) | word recall **1.0** full pass and **1.0** on every line ("490,000", "1,600", "300 newtons", "structurally supported", "anchoring calculation", "Media Diet" heard exactly) | qa/asr.json |
| music quiet beneath speech (stems, per line) | speech −18.8…−20.0 dB RMS; music −29.7…−34.7 dB (10.1–15.7 dB under); foley −42.5…−55.6 dB | measured during QA |
| contact sheets | representative (1 frame/s, 45 frames) + ±2 frames at all 10 cuts, from the encoded MP4 | qa/contact-sheet-*.png |

**I cannot listen to audio in this environment;** ASR, stem levels and per-take pronunciation checks are the proxy. Please listen once before posting.

## Visual inspection
| area | result |
|---|---|
| Real footage (0–3.5 s) | the user's crowd-on-the-Bean shot, full frame, gentle 5 % push-in; its baked label "100s of Chicagoans vs. one giant Bean" stays visible above our caption band; date pill "Millennium Park · Sunday, Nov 8, 2026"; source audio removed. |
| Concrete 3D set | polished chrome Bean (arched underside, skyline reflections) on a tiled paper plaza with paper skyline and trees; schematic rings/posts/slab cutaway; graph-paper model page with a block wearing a Bean silhouette. |
| Vectors | mg DOWN (yellow), N UP (cyan) at the feet, friction LEFT (red) along the contact, people RIGHT (green) — cylinders with arrowheads anchored to the objects, one fixed scale (490 kN ≈ 1.6 units) so the 75 kN example and the 490 kN sum compare honestly; cancelling pushes, F·cos θ component, support reaction (blue). |
| Model labelling | every model page carries "IMAGINARY LOOSE BEAN · idealised model" and the chips "μs = 0.5 (assumed)", "300 N per person (assumed)"; the 250-person card says "example only, not the real crowd size"; the n card says "idealised estimate". |
| Equations | lower cards only (y 1190–1590): m ≈ 99,790 kg (110 short tons) → N = m·g ≈ 979,000 N → F_start = μs·N ≈ 490,000 N → n > 490,000 ÷ 300 ≈ 1,632 (about 1,600) · μs 0.3–0.6 → roughly 1,000–2,000 · F·cos θ · 7 in = 0.178 m is a distance · once moving ΣF = m·a · 110 tons ÷ 300 N ≠ answer. |
| Real conclusion | the real Bean returns unchanged on its schematic supports; the push is balanced by the support reaction; "real answer needs anchor strength + contact geometry"; no real people count claimed, no anchor strength invented. |
| Cuts | 11 shots / 10 cuts, each with its own action; eased camera moves only, no bobbing. |

## Fixes during this round (each fixed once)
1. Script: the suggested VO ran 46.7 s of speech → tightened to 108 words / 39.2 s; mass-vs-weight wording; "barely" → "only partly".
2. Labels and framing (stills): 3-D labels that fell into the caption band moved low or into lower cards; cameras widened; mg and N separated; the queue made to recede; the slider ruler aligned to the (enlarged) 7-inch move with a start mark and displacement arrow.
3. Arrow scale bug: the force-to-length helper multiplied by 300 twice (giant friction bar) → N/306,000.
4. 45 s pipeline: chunk renderer clamped to the timeline end; QA updated to 1350 frames / 45.000 s; ASR scoring normalises spoken numbers ("four hundred ninety thousand" = 490,000).

## Remaining limitations (honest)
- Idealised model only (assumed μs and per-person force); the real sculpture's answer depends on its supports/foundation and contact geometry. Aerotrope's 80-ton figure would make the model estimate ≈ 1,300.
- Stock synthetic English voice (approved Kokoro English blend).
- No local Desktop/video-review folder in this cloud container; the MP4 is attached in the session and pushed. No social publishing.
