> **Updated 2026-11-02:** finished episodes now go to
> `videos/courtlens/production/30s/<date>-<round>/courtlens-30s-<round>-NN.mp4` with `src/`, `notes/`, `qa/` beside it
> (see `08-series-format.md` §5–6). Exactly 30.000 s, 1080x1920, 30 fps, H.264 yuv420p + AAC. The QA list below still applies.

# Deliverables
- videos/courtlens/output/courtlens-30s.mp4, new rendered final, H.264, AAC audio, 1080x1920, 30fps, approximately 30 seconds.
- Source project with pinned dependencies and reproducible render command.
- Storyboard and timed narration, original or licensed soundtrack and SFX; record asset license/source.
- Contact sheet sampling all scenes, ffprobe metadata and full decode validation.
- QA.md: assess action continuity, clipped text, visual overlap, pacing, narration synchronization, audio clipping, feature claims and CTA legibility. Fix observed issues and rerender.

Use known official registry packages and local rendering, e.g. Remotion + FFmpeg or a self-contained vector animation renderer. No paid API or secrets required. If synthetic narration is unavailable, finish an expressive captioned cut with original sound and document the limitation. Do not stop with a plan. Never call an old uploaded video newly generated.
