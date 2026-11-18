# Continuation note: 18 Nov 2026 account load-balancing session [USER DIRECTIVE + VERIFIED STATE]

## Why this session exists
- The user expressly authorised moving Courtlens production into this new, app-isolated Claude Code session because
  the original account was exhausted ("ACCOUNT LOAD BALANCING", 18 Nov 2026).
- Same repository and branch: `cumbersomeamir/animations` @ `claude-video/courtlens`. Workspace: `videos/courtlens/`
  only. No other app, branch, chat or memory is used.
- The previous chat submitted neither episode 20 nor 21. This session replaces those pending assignments:
  - **batch 20:** security deposit / wear and tear
  - **batch 21:** the 18 Nov brief

## State found at start (verified 2026-11-18)
- Branch clean and in sync with origin at 8ac97e0 (episode 19 delivered).
- No `2026-11-17-english-20` or `2026-11-18-english-21` folder existed locally or on the remote, so nothing had been
  checkpointed and nothing was duplicated.
- The fresh container had no caches. They were restored into the session scratchpad (`$S`), which is not committed:
  - `python3 -m venv $S/tts/venv && $S/tts/venv/bin/pip install kokoro-onnx==0.6.1 soundfile faster-whisper==1.2.1`
  - Kokoro v1.0 files from the official release, with hashes matching `03-assets.json`:
    - `kokoro-v1.0.onnx` 7d5df8ec…3636a6c5
    - `voices-v1.0.bin` bca610b8…1fbf7d
  - faster-whisper "medium" (Systran) cached in `$S/asr`
  - Playwright Chromium was pre-installed; node 22 and ffmpeg 6.1.1 were available.

## How to resume in a fresh container
1. Read the CLAUDE.md order: 00–05, then 08, 09 and this file, then the newest `episodes/` record.
2. Restore the caches with the commands above (the setup took about 2 minutes here).
3. Each episode folder holds a complete editable project: `src/` (scene.js, timeline.json, narration.json,
   audio_mix.py, build.sh, qa.py, align.py, asr_check.py, tts.py, fonts, icon), `audio/lines`, `notes/` and `qa/`.
   Commands are in 05-progress.md.

## Approved style carried forward unchanged
- Genre "Is this legal in India?" and the series chip
- Palette: navy #02193B, cyan #12AAD3, gold #D7A351, paper #F4EEE2
- Inter font; captions centred at x=500 (≤ 800 px wide, band y 340..540) with the cyan keyword marker
- Stamp slam; the Courtlens icon CTA "Follow Courtlens / Everyday Indian law, explained" in the final ~3 s
- Narrator: Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98
- Original synthesized pad + SFX; ≈ −16 LUFS
- English only; no Hindi, Blender or paid APIs
