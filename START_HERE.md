# START HERE — Tensorblue video channel

This branch (`claude-video/tensorblue`) of `cumbersomeamir/animations` is the **isolated workspace for the Tensorblue channel only**.
The Code chat for this work is named **Tensorblue**. Do not create or rename chats.

## Read order (and read nothing else)
1. `CLAUDE.md` (repo rules for agents)
2. `videos/tensorblue/context/00-channel.md` — genre, scope, account mapping, asset rules
3. `videos/tensorblue/context/11-production-format.md` — the recurring production format (skill, current brand-aligned software-cutaway rules, user feedback log, audio, palette, caption safe areas, QA gates). **Latest user feedback overrides older style details.**
4. The latest round file `videos/tensorblue/context/1N-production-30s-NN.md` (12 = round 01, 13 = batch 02, 14 = feedback-round 01, 15 = round-02 episode 01, 16 = Hindi batch 03 episode 01, …) — what was made last, its script, sources, storyboard and QA
5. The output folder of the latest round under `videos/tensorblue/production/`

Do **not** read other apps' contexts, other branches, or any other repository (including the old `abbu-kbc-gift` repo). Do not touch `main`.

## Before any new round
- `git fetch origin claude-video/tensorblue` and check `videos/tensorblue/production/` for an existing folder of the same round/date — never duplicate or overwrite a previous output; add a new dated folder or a new `-NN` number.
- Confirm the remote is `cumbersomeamir/animations` and the branch is `claude-video/tensorblue`.

## Layout
```
CLAUDE.md, START_HERE.md            channel rules / entry point
videos/tensorblue/context/          durable channel context (00 channel, 11 format, 12+ round logs)
videos/tensorblue/assets/           licensed reusable assets (fonts with licence files)
videos/tensorblue/production/<len>/<date>/   one folder per round: MP4, publishing-caption.txt, notes, src/, qa/
```
