# Mello durable format, style and audio rules

Source: user feedback, 2026-11-02 feedback round (new isolated Mello Code chat). These rules **supersede conflicting format directions** in `02-creative-brief.md` and `04-deliverables-and-qa.md` (for example the stickman direction, "Explore on Google Play" end card and `output/mello-30s.mp4` path). Earlier MP4s stay untouched.

Read after 00–05. Facts, creative decisions and verification results are kept in separate sections.

## 1. Genre (user rule)
- English educational shorts covering **both mindfulness exercises and practical psychology techniques**. Each episode teaches one concrete, usable exercise.
- Not generic motivational quotes. No personality manipulation, fabricated brain statistics or "master any skill in 20 hours" style guarantees.
- No invented app capability, guarantee, statistic, income or testimonial. Product wording must stay within `assets/listing.json`: "Guided relaxation, calming exercises, wellness challenges and progress tools."
- Research every factual claim in reliable original sources, and record the sources in repo notes and the publishing copy. State any material qualification briefly, inside the sentence it applies to. Avoid filler and long generic disclaimers.

## 2. Deliverable format (user rule)
- Exactly **30.000 s, 1080x1920, 30 fps, H.264 yuv420p + AAC**, with English voiceover.
- Structure: a strong opening, then distinct scenes that show the mechanism while it is narrated, then a clear takeaway, then a short, natural brand/action CTA in the **final 3–4 s**.
- Path: `videos/mello/production/30s/<YYYY-MM-DD>-<round>/mello-30s-<round>-NN.mp4`. Keep previous MP4s.
- Production notes, source code and QA stay in the repo. The local Desktop/video-review folder holds finished MP4s only.
- A source sheet, contact sheet or static page with camera bobbing is **not** a deliverable. Re-render if text is small or obstructed, or if scenes are static.
- Verify duration and codecs, run a full FFmpeg decode, and check narration timing and representative transition frames.

## 3. Safe-caption rule (user rule, enforced by `render.mjs --layout`)
- **y < 300:** no meaningful text. This area belongs to the platform's account overlays.
- **Captions:** in the band y 340–520, x 90–990. At most two readable lines, one caption at a time, no overlaps.
- **Crucial diagrams and objects** stay out of the side and bottom UI: not in the right rail (x > 930, y 900–1700) and not in the bottom description area (y > 1560).
- Caption text matches the narration word for word.

## 4. Narration and audio settings (user rule plus measured implementation)
- Voice: the established cached narration voice. **Kokoro-82M v1.0 ONNX** (Apache-2.0) via `kokoro-onnx==0.4.9`, local CPU. Voice style blend **0.7 × af_bella + 0.3 × am_puck**, `lang="en-us"`, **speed 0.98**.
  - Model files are cached at `videos/mello/project/.cache/tts/` (gitignored). Their hashes are in `videos/mello/project/tts.sha256`, and `videos/mello/project/setup.sh` fetches them.
  - No recording of this voice exists inside the Mello workspace (other apps are out of scope by isolation), so the voice is re-synthesized from these exact settings.
- Each line is synthesized separately, trimmed, faded over 8 ms and placed at a fixed start, so the pauses are deliberate. Let the key rephrasing breathe; never rush through a list.
- Music: a subtle synthesized pad (numpy/scipy, no samples). Chords change on story beats, and there is **no repeating loop**. The music ducks −8 dB under the voice, and the whole bed sits about 12 dB below the voice (integrated).
- SFX only for on-screen actions. No decorative noise.
- Master: −16 LUFS integrated, true peak ≤ −1 dBTP, soft-knee limiter.
- No paid API, no Blender. Reuse cached models and assets.

## 5. Brand (verified versus proposed)
- **Verified:** `assets/icon.png` (sha256 `3182c61f…ae81`) is a lavender ghost-like character on deep navy with gold sparkles. Sampled colours: lavender **#D9BCF5** (brand accent), navy #0B0825 / #150F34, gold sparkle.
- The mint `#B6D7C2` in `01-product-facts.json → previous_brief_reference` comes from an older brief, not from the icon. Do not treat it as the verified accent.
- CTA used in feedback-01: spoken "Take a mindful break with Mello.", plus the real icon, the word "Mello" and "On Google Play" (the listing is on Google Play). Kokoro pronounces "Mello" like "mellow", and the official pronunciation is undocumented.

## 6. Style recipe: "Thoughts in a Quiet Room" (exact, as specified by the user)
> A sparse clean 3D miniature scene with one abstract original human form, no expressive face or copied character, soft contact shadows, large elegant condensed-serif headlines and simple everyday props.

Additional user constraints:
- White or pale-gray stage, with **Mello's verified brand accent (lavender #D9BCF5) used as the thought-frame highlight**.
- Purposeful demonstration and pacing: one simple figure demonstrates one step at a time, with relevant props and clear short captions.
- Restrained movement. Five distinct shots for a 30 s episode. No decorative noise and no stock presenter.
- Avoid the previous origami-bird loop.
- A rendering library is **not** the style. The recipe above is the style; any renderer that achieves it is acceptable.

How feedback-01 implements it (a creative decision that can be revised):
- **Stage:** a near-white floor that sweeps up into the back wall (#F7F6F8 under a neutral tone map), a pale rug, and a plant at the back-left. Soft VSM key shadow plus blurred contact-shadow blobs under every grounded object.
- **Figure:** an abstract mannequin made of capsules and spheres in muted slate-lilac #7E7A9C. It has no face. A slightly darker hair cap (#55507A) makes head direction readable.
- **Props:** a birch desk, a white stool, a white lamp, a mug, a pencil and one ochre notebook (#D6A452, echoing the icon's gold sparkle).
- **Thought object:** a solid near-black navy card (#1C1733) with cream serif text. It becomes a clear glass frame with a lavender #D9BCF5 rim, a lavender tab reading "I'm noticing the thought that…", and navy text.
- **Type:** Instrument Serif (OFL; condensed display serif; roman + italic) for captions and in-scene text, and Inter 500 for the small "On Google Play" line. Captions are navy #17122E with no box. Key phrases get a lavender highlighter band.
- **Renderer:** three.js 0.170.0 in headless Chromium (SwiftShader WebGL), frames piped to ffmpeg.

## 7. References reviewed (user-supplied, read-only inspiration)
- https://www.instagram.com/p/DexFblEh9o7/ (user review): white airy stage, simple dimensional social figures, large high-contrast type, deliberate composition changes.
- https://www.instagram.com/p/DfLaoQgTS-C/ (user review): one simple figure demonstrating one step at a time, with relevant props and clear short captions.
- **Borrow:** the purposeful demonstration and the pacing.
- **Do not copy:** its exact yellow figure, its audio or its learning claims.
- Claude did not open these posts in this session. The descriptions above are the user's review notes.

## 8. Approved feedback rules, 2026-11-11 (user rule; apply from the 2026-11-11 episode on)
Source: "Published apps, Satisfied? column", read 11 November 2026. These **add to or override** sections 2–6 where they conflict. Episodes requested earlier (english-10, english-11) keep the spec they were requested with.

**Story structure ("Theory of Marketing")**
- thumbnail → hook → optional super hook → build-up + proof → payoff → CTA.
- The hook answers "why do I care"; the build-up sustains one specific question; the proof makes the answer credible; the payoff gives useful knowledge; the CTA gives a relevant next step.
- Suspense comes only from a real unanswered question, never a false claim. Don't repeat the answer in every scene or pad with generic statements.

**Pacing (adapt naturally, always 30.000 s)**
- 0–3 s: an immediate striking image and the hook. 3–5 s: optional escalation.
- 5–21 s: visual explanation and proof, with scene changes.
- 21–27 s: resolve the question with a concrete takeaway. 27–30 s: a concise, app-relevant CTA.

**Thumbnail**
- A separate, attractive vertical thumbnail (1080x1920 PNG) tied to the hook, with 2–4 large words. Deliver it with the MP4.

**On-screen text and visuals**
- One visual idea at a time; no paragraph cards. On-screen labels are large and brief; the voice carries the detail.
- Captions readable within **x 100–900, y 230–1500**, clear of platform overlays. (Mello keeps its top caption band, now narrowed to x 100–900, so the top ~300 px and the right rail stay clear.)
- Caption, diagram labels and any explanatory text must not compete at the same moment.
- Reveal diagrams sequentially. Use deliberate depth, lighting and transitions. No decorative, distracting lines. Motion must explain the topic.

**Facts**
- Verify every factual claim in primary or reliable sources before the final script. Distinguish measured facts, estimates and illustrative assumptions. Sources go in project notes, not on screen.
- Don't invent prices, returns, news, app functionality or scientific certainty. No boilerplate warning narration; omit risky procedures instead. Keep essential qualifications concise and accurate.
- Check earlier episodes for repeats; if the proposed topic was covered, pick a genuinely different topic in the same genre. Never present an unverified fresh-news claim as news.

**Brand and audio (Mello feedback)**
- **Match the published app colours.** Sample the palette from the *current* Play Store icon and screenshots, not from an older asset or a guessed purple. The sampled values and their source are recorded in the episode record.
- Prefer a psychology insight with a useful demonstration over guided meditation.
- Add original, gentle, soothing background sound below speech (synthesized here; no unlicensed samples).
- Keep the approved format, narrator and motion skill otherwise.

**Delivery and checks**
- Only finished MP4s go to the user's review folder; source, citations, prompts and QA stay in the repo.
- Render, full-decode, check duration/codecs, inspect transitions and frames, check narration, caption sync, clipping and missing assets. Attach the MP4 and the thumbnail.
- Report limitations honestly. Never claim a watched or listened check that wasn't performed (here: the audio check is an ASR round-trip plus measurements).
