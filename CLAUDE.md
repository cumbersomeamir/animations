# CLAUDE.md — Tensorblue channel workspace

Scope: this branch holds ONLY the Tensorblue educational video channel. Start with `START_HERE.md`.

## Hard rules
- Repository `cumbersomeamir/animations`, branch `claude-video/tensorblue` only. Never push to `main` or other branches; never read other apps' context or assets.
- Locked genre: useful new GitHub repositories, explained research papers, system design. No fake news, no invented repository announcements, no invented speed/benchmark figures, no health/legal/income/testimonial/breakthrough claims.
- Every public claim needs a credible, checked primary/official source recorded in the round's context file (`videos/tensorblue/context/1N-production-*.md`) and in `publishing-caption.txt`.
- Art direction: the custom **Blue Receipt Theatre** recipe (premium kinetic typography + tactile minimal UI cards + simple isometric stage, purposeful wipes, before/after staging; exact Tensorblue website palette; no moving-line networks, particles, rings, connector lines, grid motion or camera bobbing) — see `videos/tensorblue/context/11-production-format.md`. Earlier looks (Crosshatch notebook, software cutaway) are superseded. Write original rendering code; never run foreign scripts. No Blender, no paid APIs/subscriptions, no secrets.
- Dependencies only from official registries (npm, PyPI, PyTorch CPU index, Hugging Face official model repos). Pin versions in the round's `src/`.
- Preserve previous outputs: each round gets its own dated folder; never overwrite a published MP4.
- Narration voice: Kokoro-82M (hexgrad, Apache-2.0), blend `af_bella` 0.7 + `am_puck` 0.3, speed ~0.98, `en-us`. No Piper substitution, no celebrity/character imitation.
- Spec gates (portrait 1080x1920, 30 fps, H.264 yuv420p, AAC 48 kHz stereo, −14 to −16 LUFS, true peak ≤ −1 dBTP, captions readable inside x 100–900 / y 230–1500 (house band y 340–520, centred x 500), nothing meaningful at y < 300, plus a separate 1080×1920 thumbnail) are listed in `11-production-format.md`; a round is not done until the exported MP4 passes them.
- Story structure, pacing and presentation follow the 2026-11-11 rules at the top of `11-production-format.md` (thumbnail → hook → super hook → build-up + proof → payoff → CTA; one visual idea at a time; honest QA).
- Do not create scheduled automations unless the user asks.
