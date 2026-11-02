# 00 — Tensorblue channel: genre, scope, account mapping, asset rules

## Identity and account mapping
| item | value |
|---|---|
| App / channel | **Tensorblue** |
| Repository | `cumbersomeamir/animations` |
| Branch (only) | `claude-video/tensorblue` |
| Claude Code chat name | `Tensorblue` (do not create or rename chats) |
| Posting account | Tensorblue channel account(s). Platform handles are **not recorded in this repo yet**; the user posts manually. Add handles here only when the user supplies them. |
| Automation | None. Do not create scheduled tasks unless the user asks. |

## Locked genre (from the user's sheet)
1. **Useful new GitHub repositories** — what a real repo does, checked against its README/licence/release notes at the time of the round. Never invent stars, launches or "new" status; link the repo.
2. **Explained research papers** — the mechanism of a real paper, cited with title/authors/arXiv or venue link. No hype words ("breakthrough") unless quoting a source.
3. **System design** — how real infrastructure works (caches, CDNs, queues, databases, load balancers), checked against official vendor documentation (e.g. Cloudflare, AWS) or standards (RFCs, MDN).

Out of scope: product ads for the Tensorblue app, current-news claims, invented benchmarks or speed numbers, health/legal/income claims, testimonials.

## Asset rules
- Use only: (a) code-drawn graphics written for this channel, (b) licensed assets stored under `videos/tensorblue/assets/` **with their licence file**, (c) assets the user explicitly approves for Tensorblue.
- **Brand colours:** the Tensorblue website palette supplied by the user on 2026-11-02 (batch 02) is the approved palette: background `#030610`, navy `#0D1628`/`#0A172D`, brand blue `#0A6CFF`, white `#FFFFFF`, secondary `#D8E3F5`, hero gradient `#E8F3FF`/`#91BBFF`/`#85ECED`/`#EDF9FF` (details in `11-production-format.md`). The round-01 cream/brown fallback is retired. Do not invent a logo; the channel signature is the word "Tensorblue" with a brand-blue dot.
- Fonts: `assets/fonts/inter/` Inter 4.0 Medium/SemiBold/Bold (SIL OFL 1.1, from the Debian `fonts-inter` package of rsms/inter; `OFL.txt` + `debian-copyright.txt` alongside) — current format. `assets/fonts/patrick-hand/` (SIL OFL 1.1) — round-01 look only.
- Voice model: Kokoro-82M (Apache-2.0) downloaded from the official Hugging Face repo `hexgrad/Kokoro-82M`; not committed (large binary) — re-download or reuse a local cache.
- Music and SFX: synthesized in code per round (original, no third-party samples).
- Never use other apps' assets or the old `abbu-kbc-gift` repository.
