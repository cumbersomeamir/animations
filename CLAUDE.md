# CLAUDE.md — Tensorblue channel workspace

Scope: this branch holds ONLY the Tensorblue educational video channel. Start with `START_HERE.md`.

## Hard rules
- Repository `cumbersomeamir/animations`, branch `claude-video/tensorblue` only. Never push to `main` or other branches; never read other apps' context or assets.
- Locked genre: useful new GitHub repositories, explained research papers, system design. No fake news, no invented repository announcements, no invented speed/benchmark figures, no health/legal/income/testimonial/breakthrough claims.
- Every public claim needs a credible, checked primary/official source recorded in the round's context file (`videos/tensorblue/context/1N-production-*.md`) and in `publishing-caption.txt`.
- Art direction: the Animate skill's **Crosshatch** style, used read-only as instructions, as revised by user feedback into the **brand-aligned software cutaway** format (static texture only, no boiling/ambient moving lines, Tensorblue website palette) — see `videos/tensorblue/context/11-production-format.md`. Write original rendering code; do not clone or run the skill's scripts. No Blender, no paid APIs/subscriptions, no secrets.
- Dependencies only from official registries (npm, PyPI, PyTorch CPU index, Hugging Face official model repos). Pin versions in the round's `src/`.
- Preserve previous outputs: each round gets its own dated folder; never overwrite a published MP4.
- Narration voice: Kokoro-82M (hexgrad, Apache-2.0), blend `af_bella` 0.7 + `am_puck` 0.3, speed ~0.98, `en-us`. No Piper substitution, no celebrity/character imitation.
- Spec gates (portrait 1080x1920, 30 fps, H.264 yuv420p, AAC 48 kHz stereo, −14 to −16 LUFS, true peak ≤ −1 dBTP, caption box y 350–470) are listed in `11-production-format.md`; a round is not done until the exported MP4 passes them.
- Do not create scheduled automations unless the user asks.
