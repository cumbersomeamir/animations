# 08 — Durable format rules + "Pop-up Counting Storybook" style recipe (TableVerse)

Set by user feedback on 2026-11-02 ("feedback round"). Supersedes conflicting earlier format directions
(the 30 s stickman brief and the 15 s Manim test brief remain as history). Reread on every resume together
with CLAUDE.md, 05-progress.md and the active episode brief (09-…).

## Delivery format (every TableVerse short from now on)
- Exactly **30.000 s**, 1080×1920 portrait, 30 fps (900 frames), H.264 yuv420p + AAC.
- English voiceover; music subtle, voice clearly on top; no repetitive or distracting loops.
- Strong opening (motion in the first second), distinct scenes that show the mechanism *while* it is narrated,
  a clear takeaway, and a short natural brand/action CTA in the final 3–4 s.
- Output path: `videos/tableverse/production/30s/<YYYY-MM-DD>-<round>/tableverse-30s-<round-id>.mp4`;
  production notes, source and QA live next to it in the repo. Earlier MP4s are never overwritten.
- Not deliverables on their own: a contact sheet, a storyboard, a static page with camera bobbing,
  a worksheet-like static layout. Re-render if text is small, obstructed or scenes are static.

## Safe areas and captions
- y < 300 px: no meaningful text (platform account overlays).
- Captions: upper safe band, centred around **y = 340–520**, inside **x = 90–990**, max **two** readable lines,
  never overlapping other text. Caption text mirrors the voiceover in short form.
- Crucial diagrams/counted objects stay inside roughly x 110–970 and y 560–1500 (clear of right-side and bottom UI).

## Content rules
- Child-friendly; suitable for a parent to watch with a child. Multiplication shown as **equal groups**;
  never label unequal groups as multiplication.
- Every counted object stays visible and accurate; no extra decorative copies of counted objects.
- No timed quiz, school-pressure gimmick, false learning guarantee, invented app capability, statistic,
  income claim or testimonial. App claims are limited to the verified listing sentence:
  "Learn multiplication tables through stories, practice and fun challenges."
- Research factual claims in reliable original sources; record them in the episode notes / publishing copy.
  Express any material qualification briefly in the relevant sentence; no long generic disclaimers or filler.

## Voice
- Kokoro-82M v1.0 (Apache-2.0, local, cached model files), voice blend **af_bella 0.7 + am_puck 0.3**,
  lang en-us, speed 0.98. "TableVerse" is sent to the TTS as "Table Verse" so it is said as two words.
- No paid API. Narration clips are committed so renders are reproducible without the model.

## Style recipe — "Pop-up Counting Storybook" (the style, independent of the rendering library)
1. **World**: a bright tabletop with a real-looking pop-up book; the open book is a little theatre — the upright
   page is the backdrop, the flat page is the stage floor, the spine is the hinge line.
2. **Material**: warm clean paper (cream, kraft), visible craft construction: subtle paper grain, slightly
   irregular hand-cut edges, white cut margins, dashed score/fold lines, paper tabs in slots, brass split-pin
   fasteners at puppet joints, soft offset shadows that show each layer's height above the page.
3. **Layering**: 4–6 depth layers per spread (backdrop print → pop-up wall pieces → shelf/counter → props →
   puppet → foreground lip); nearer layers cast larger, softer shadows.
4. **Mechanisms drive the motion**: things rise on hinges (fold-up with overshoot and a shading change),
   flaps open, pull-tabs slide along visible slot tracks, objects hop along dotted paper tracks, pages turn
   across the spine to change the arrangement. No camera wobble over a flat page.
5. **Puppet**: one small friendly cut-paper baker with hinged limbs (split pins), simple dot eyes and smile,
   chef hat, violet apron; gestures are puppet-like (pivot rotations with small overshoot), never a lip-synced
   talking avatar.
6. **Staging**: theatrical — a warm top light pool on the book, gentle vignette, one clear focal action at a
   time; scene changes by page turn, flap or cut.
7. **Counting language**: counted objects are bold, simple and identical (e.g. red paper apples with a leaf);
   containers are craft-paper baskets/tins; group completion = one warm glow pulse; running total on a paper
   flip-card sign.
8. **Brand accents (TableVerse icon pixels)**: deep violet #160A64 (2,2), violet #390CD6 (308,50),
   purple #911FF9 (250,152), lilac #D198FA (236,230), orange #F86F03 (362,222), yellow #F9E30E (406,54),
   cyan #06F2F9 (66,314). Paper neutrals: cream #FFF6E6, warm paper #F7E7C9, kraft #D9A867, ink #2A1650.
   Apples: red #E5463B / shade #B52F2A, leaf green #4FA34A (object colour, used only for apples).
9. **Typography**: Fredoka (SIL OFL 1.1), dark violet ink on paper labels; numbers large and rounded.
10. **Sound**: paper foley (fold, pop, slide, page turn), soft wooden "tok" per apple, one gentle chime per
    completed group, a light non-looping accompaniment kept well under the voice.

## Update 2026-11-13 (batch english-13) — supersedes conflicting lines above
- Story shape ("Theory of Marketing"): thumbnail → hook (why care) → optional super hook → build-up + proof →
  payoff (useful knowledge) → CTA (relevant next step). Suspense only from a real unanswered question.
- Pacing: 0–3 s striking image + hook; 3–5 s optional escalation; 5–21 s visual explanation and proof with scene
  changes; 21–27 s resolve with a concrete takeaway; 27–30 s concise CTA. Total exactly 30.000 s.
- Captions: English, readable inside **x = 100–900, y = 230–1500**, max two lines, clear of platform overlays;
  never a paragraph; caption, diagram labels and explanation never compete — on-screen labels large and brief,
  the voice carries the detail. Reveal diagram parts one at a time.
- Depth: deliberate depth, lighting and transitions (perspective hinges, depth of field, parallax on motivated
  camera moves); no decorative distracting lines.
- Thumbnail: a separate attractive vertical image tied to the hook, 2–4 large words, saved next to the MP4.
- Facts: primary/reliable sources in project notes; separate measured facts, estimates and illustrative
  assumptions; no boilerplate warning narration.
- Delivery: only completed MP4s go to a user review folder; source, citations, prompts and QA stay in the repo.
