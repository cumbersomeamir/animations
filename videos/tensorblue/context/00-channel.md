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
3. **System design** — practical mechanisms viewers can understand (caches, CDNs, retries/idempotency, queues, databases), checked against official vendor documentation (e.g. Cloudflare, AWS, Stripe) or standards (RFCs, MDN). Explain through one concrete everyday example, not academic diagrams or generic AI news.

Out of scope: product ads for the Tensorblue app, current-news claims, invented benchmarks or speed numbers, health/legal/income claims, testimonials.

## Asset rules
- Use only: (a) code-drawn graphics written for this channel, (b) licensed assets stored under `videos/tensorblue/assets/` **with their licence file**, (c) assets the user explicitly approves for Tensorblue.
- **Brand colours (current):** exact Tensorblue website palette checked by the user at https://www.tensorblue.com/ (confirmed in the site CSS, 2026-11-02): near-black navy `#030610`, electric blue `#3B82F6`, white `#FFFFFF`, cool pale blue `#D8E3F5`, muted blue-gray `#B7C7DF`. Blue = the active object/highlight; pale cards with dark readable text. Batch-02's `#0A6CFF`-led palette and the round-01 cream/brown look are superseded.
- **Logo:** `assets/brand/tensorblue-logo.svg` (blue `#0A6CFF` drop with a white tensor grid) from the user's own site; provenance in `assets/brand/SOURCE.md`. Preserve the relationship: blue mark + white detail, wordmark "Tensor" white + "blue" electric blue. Do not redraw or alter the mark.
- Fonts: `assets/fonts/inter/` Inter 4.0 Medium/SemiBold/Bold + Inter Display Bold/ExtraBold (SIL OFL 1.1, Debian `fonts-inter` of rsms/inter; `OFL.txt` + `debian-copyright.txt`) — current format. `assets/fonts/patrick-hand/` (SIL OFL 1.1) — retired round-01 look only.
- Hindi episodes: Devanagari font `assets/fonts/mukta/` (Mukta SemiBold/Bold/ExtraBold, SIL OFL 1.1, from the official `google/fonts` repo; `OFL.txt` alongside); Kokoro-82M official Hindi voices `hf_alpha`/`hm_omega` (Apache-2.0, cached, not committed).
- Voice model: Kokoro-82M (Apache-2.0) downloaded from the official Hugging Face repo `hexgrad/Kokoro-82M`; not committed (large binary) — re-download or reuse a local cache.
- Music and SFX: synthesized in code per round (original, no third-party samples).
- Never use other apps' assets or the old `abbu-kbc-gift` repository.
