# Production notes — Ideaverse 30s english21-01 (English, lesson style, 2026-11-11 rules + first-frame rule)
Two photos, one made by AI — and the proof is hidden inside it: Google's AI hides an invisible watermark (SynthID) in the pixels
as it makes an image; a second model, trained with it, can still find it after crops, filters or compression; that is what
Gemini checks for. The trap: no mark only means Google's AI didn't make it — another AI could have. Payoff: no mark isn't proof
it's real; find where the photo first appeared. Record context/36.
Proposed topic (an AI voice clone can copy a loved one but not prove who is calling) replaced: it repeats english12-01
(context/27, "A familiar voice is no longer proof"; confirm through a separate known channel).
- Beats: 0–4.5 hook (two framed photos; WHICH ONE IS AI? from frame 0; push toward the cabin photo on "hidden inside it") ·
  4.5–11.72 card: the image builds under AI MAKER; a zoom box → enlarged pixels → hidden marks light up (INVISIBLE WATERMARK);
  AI MAKER ⇄ AI FINDER (TRAINED TOGETHER); the finder scans → ✓ MARK FOUND · 11.72–14.1 the print is cropped, filtered,
  compressed; ✓ MARK FOUND each time (STILL FOUND) · 14.1–19.1 DOCKET's phone: AI check → WATERMARK FOUND (MARK FOUND); swipe
  to the sunset photo → NO WATERMARK, "Not made by Google AI" (NOT GOOGLE'S AI) · 19.1–20.9 both photos: the sunset photo gets
  an AI-MADE stamp (ANOTHER AI) · 20.9–26.85 card: the sunset photo, NO MARK (NO MARK ≠ REAL) → reposts, newest first, the
  oldest = "First post · 9 days ago · made with AI" (FIND THE FIRST POST) · CTA.
- Illustrative: both photos are procedural drawings; the mark pattern, cells, the models' chips, the check screen (EXAMPLE),
  the posts and their ages are illustrations; SynthID's real pattern is not visible or public.
- Thumbnail: `render.mjs --thumb` (hook scene + "WHICH ONE / IS AI?").
- Commands: build.sh (PY + KOKORO_DIR with af_bella.bin + am_puck.bin), qa.sh (ASRPY=<python with faster-whisper>).
