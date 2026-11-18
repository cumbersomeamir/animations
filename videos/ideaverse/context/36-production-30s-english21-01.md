# 36 — Production 30s english21-01 (English): "Two photos. One was made by AI, and the proof is hidden inside it."

Batch 2026-11-18-english-21 ("NEXT EPISODE — English batch21", expressly authorised 18 November; queued behind batch20, which
was finished and preserved first). Workspace `production/30s/2026-11-18-english-21/` · deliverables
`ideaverse-30s-english21-01.mp4` + `ideaverse-30s-english21-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse. Style: accepted pilot-01 DOCKET newsroom style via the latest
renderer; 2026-11-11 rules + first-frame rule (context/11). LIVE feedback applied: CTA exactly "Download the Ideaverse app.";
icon re-checked against the live Play listing; a non-obvious mechanism with a trap, not an AI-use tip or shallow trivia.

## Topic check (history: context/09, 12–35)
- Proposed: "How an AI voice clone can copy your loved one but not prove who is calling" (opening TWO VOICES. ONE TRAP.).
- Already covered: **english12-01** (context/27, "A familiar voice is no longer proof": a cloned voice from seconds of audio;
  hang up and call back on a number you already know) → replaced.
- Chosen (same genre: everyday AI fakes and what counts as proof; same "two items, one trap" shape; a verified mechanism and a
  checkable, non-obvious consequence): **invisible AI watermarks (SynthID)** — Google's image AI hides a watermark in the
  pixels; a second, jointly trained model finds it even after edits; Gemini checks for it; but "no watermark" only rules out
  Google's AI, so it is not proof a photo is real — find where it first appeared. Not covered by any earlier episode
  (prompt injection, spam, OCR, photo search, voice cloning etc. are different mechanisms).

## Script (English, 75 words incl. CTA) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook | Two photos. One was made by AI, and the proof is hidden inside it. |
| s2 | 4.65 | mechanism | Google's AI hides a watermark in the pixels as it makes the image. |
| s3 | 9.05 | mechanism | A second model, trained with it, can still find it after crops, filters or compression. |
| s4 | 14.20 | the check | That's what Gemini checks for. |
| s5 | 16.00 | trap (documented) | But no mark only means Google's AI didn't make it. Another AI could have. |
| s6 | 21.00 | payoff | So no mark isn't proof it's real. Find where the photo first appeared. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (punctuation aside). s3 first drafted as "still finds it"; softened to
"can still find it" because Google says the mark usually survives edits but may not after many alterations.

## Facts → sources (accessed 2026-11-18)
| claim | type | source |
|---|---|---|
| Google's AI hides a watermark in the pixels as it makes the image | documented | Google DeepMind, "SynthID", https://deepmind.google/models/synthid/ — "SynthID adds an invisible digital watermark to an AI-generated image … It's added the moment content is created"; "embeds digital watermarks directly into AI-generated images … imperceptible to humans". DeepMind blog (29 Aug 2023), "Identifying AI-generated images with SynthID", https://deepmind.google/discover/blog/identifying-ai-generated-images-with-synthid/ — "embeds a digital watermark directly into the pixels of an image, making it imperceptible to the human eye"; "Since SynthID's watermark is embedded in the pixels of an image … remains detectable even when metadata is lost". |
| a second model, trained with it | documented | DeepMind blog 2023 — "SynthID uses two deep learning models — for watermarking and identifying — that have been trained together". |
| can still find it after crops, filters or compression | documented (design goal; not guaranteed) | DeepMind SynthID page — "designed to stand up to modifications like cropping, adding filters, changing frame rates, or lossy compression"; Gemini Apps Help (below) — "The digital watermark will usually still exist even if the image … is re-scaled, re-colored, compressed or altered … However, there's still a chance that after many alterations the watermark won't be detected." |
| that's what Gemini checks for | documented | Gemini Apps Help, "Verify AI-generated images, videos, and audio", https://support.google.com/gemini/answer/16722517 — "SynthID: Uses invisible watermarks to determine if images, videos, and audio were generated or edited specifically by Google's AI models"; DeepMind page — "Gemini, Search and Chrome will check for a SynthID watermark". |
| no mark only means Google's AI didn't make it; another AI could have | documented | Gemini Apps Help — "If a SynthID watermark isn't detected, it means the image or video wasn't created or edited by Google AI, but it could have been created by other AI systems"; "Gemini can currently only recognize content created by Google AI tools." |
| no mark isn't proof it's real; find where the photo first appeared | documented (Google's own advice) | Gemini Apps Help — "Reverse image search: Use reverse image search tools (e.g., Google Images) to find original sources or similar images." |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse detection feature. |
Noted, not narrated: Content Credentials (C2PA) are a separate, signed history checked by Gemini too (Google blog, I/O 2026,
"Making it easier to understand how content was created and edited", https://blog.google/innovation-and-ai/products/making-it-easier-to-understand-how-content-was-created-and-edited/);
some partners (OpenAI, Kakao, ElevenLabs, NVIDIA) are adopting SynthID and DeepMind's SynthID Detector also checks partner
content — the narration therefore names Gemini's check, whose help page says it recognizes Google AI content only. Unclear
cases ("too small an edit", too simple) exist. Independent tests report mixed robustness; not used.
Illustrative (not measured): both photos, the mark pattern and enlarged pixels, the AI MAKER/AI FINDER chips, the check screen
(EXAMPLE; generic, not Gemini's UI), the posts, their ages and the "made with AI" caption.

## Storyboard (cues.js)
1. 0–4.5 hook: two framed photos on stands (sunset lake + sailboat; blue-hour lake + lit cabin); WHICH ONE IS AI? from frame 0.
2. 4.5–9.0 card: the cabin photo builds under AI MAKER; zoom box → enlarged pixels; hidden marks light up (INVISIBLE WATERMARK).
3. 9.0–11.72 AI MAKER ⇄ AI FINDER (TRAINED TOGETHER); the finder scans → ✓ MARK FOUND.
4. 11.72–14.1 the print: CROPPED → FILTERED → COMPRESSED, ✓ MARK FOUND each time (STILL FOUND).
5. 14.1–19.1 DOCKET's phone: AI check → WATERMARK FOUND (MARK FOUND); the sunset photo → NO WATERMARK → "Not made by Google AI".
6. 19.1–20.9 both photos again: the sunset photo gets an AI-MADE stamp (ANOTHER AI).
7. 20.9–26.85 card: NO MARK (NO MARK ≠ REAL) → reposts newest first, the oldest is the first post, "made with AI" (FIND THE FIRST POST).
8. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "WHICH ONE / IS AI?".

## QA / status — DELIVERED 2026-11-18
- Output: production/30s/2026-11-18-english-21/ideaverse-30s-english21-01.mp4 · sha256 164a40c2…5309, plus
  ideaverse-30s-english21-01-thumbnail.png ("WHICH ONE / IS AI?"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.6 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Frames: 900 in 1723 s (3 workers) + re-renders 63–93, 135–172, 309–329; score re-mixed after the build cue moved to the cut.
- Limitation: ASR-only listening check (no by-ear listen possible here).
