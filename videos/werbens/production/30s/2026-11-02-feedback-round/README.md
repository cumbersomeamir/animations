# Werbens · Feedback round 30 s #01 — "The decoy effect" (Satisfying Product Theatre)

- Final video: `werbens-30s-feedback-01.mp4` (1080×1920, 30 fps, 900 frames, H.264 yuv420p + AAC 48 kHz stereo, 30.000 s)
- Brief, user feedback, sources, final script, creative decisions, storyboard, QA summary: `feedback-30s-01.md`
  (copy of `../../../context/14-feedback-30s-01.md`)
- Durable format + "Satisfying Product Theatre" style recipe + episode log: `../../../context/11-production-format.md`
- QA report + evidence: `QA.md`, `qa/` · rights/licenses: `LICENSES.md` · post caption with sources: `publishing-caption.txt`
- Source: `src/` (scene.html/scene.js/cup.js/timeline.js = Three.js scene; audio.mjs = score/foley/mix; tts.mjs, words.mjs =
  narration + timing; render.mjs = offline capture; qa_dom.mjs, asr_mix.mjs = QA)
- Rebuild: `bash build.sh` (npm ci → tts → words → audio → render → mux → qa.sh → qa_dom → asr_mix)
