# 21 — Batch `2026-11-07-english-08` · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-07-english-08/tensorblue-30s-english08-01.mp4`
(copied to `production/30s/2026-11-07-english-08/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 7 Nov 2026)
- **Topic (software mystery):** why a deleted photo can still appear in the cloud or on another device. Covers local deletion vs synchronised deletion vs backups, using a fictional system, and the difference between recycle-bin retention and permanent removal.
- **History check:** not covered before. Episodes 12–20 covered CDN, optimistic updates, idempotency, raster vs vector, password manager, passkeys, OCR, QR error correction and the last-seat race. The suggested topic was used as given.
- **Language and voice:** English narration and captions only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached and offline. No Hindi audio. "Meshline/Recall" are other apps; their context was not read.
- **Style:** the most recently accepted Blue Receipt Theatre style kept: accepted renderer (`brt.mjs` unchanged, Node + `@napi-rs/canvas`, **not Three.js**), palette (`#030610`, `#3B82F6`, `#FFFFFF`, `#D8E3F5`, `#B7C7DF`; logo `#0A6CFF`), captions, wipes, English CTA card. No mascot (the recipe bans mascots); no decorative lines (the "deleted" record moves as an object hand-off).
- **Performance-sheet improvements:** the sheet is not in this container. Written points followed:
  - first second visibly intriguing: the photo is deleted on the phone by 0.75 s while the same photo stays on the laptop ("still here" at 0.9 s);
  - concrete demo;
  - short takeaway checklist;
  - short CTA.
- **Older jobs:** none running; english-07 was already committed and pushed.

## The real-folder demo (`src/demo/sync_demo.py`, rsync 3.2.7 from the Ubuntu archive)
A fictional sync system made of real folders: `phone/`, `cloud/`, `laptop/`, `cloud-trash/` and an older snapshot `backup-monday/`. The photos are placeholder files; `beach.jpg` is the one followed.

| step | commands (relative) | where `beach.jpg` still exists |
|---|---|---|
| 0 start | `rsync -a phone/ cloud/`, `rsync -a cloud/ laptop/`, `rsync -a cloud/ backup-monday/` | phone, cloud, laptop, backup |
| 1 device-only removal | `rm phone/beach.jpg`, then upload-only `rsync -a phone/ cloud/`, `rsync -a cloud/ laptop/` | **cloud, laptop, backup** |
| 2 synced delete | `rm phone/beach.jpg`, `rsync -a --delete --backup --backup-dir=cloud-trash phone/ cloud/`, `rsync -a --delete cloud/ laptop/` | **cloud trash, backup** |
| 4a empty the trash | `rm cloud-trash/*` | **backup only** |
| 4b remove the old backup | `rm -r backup-monday` | **nowhere** |

The renderer reads `demo/out/sync-demo.json`, refuses to render if any of these results change, and draws S6's five location chips from these states. On screen: "checked with real folders synced by rsync".

## Final script (as spoken; 75 words, 24.3 s of speech incl. CTA)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–3.96 | You deleted this photo on your phone. Why is it still on your laptop? |
| L2 | 4.41–8.59 | Some deletes only remove this device's copy. The cloud keeps its own. |
| L3 | 8.94–12.61 | A synced delete is different: every device removes its copy. |
| L4 | 12.96–16.10 | Even then, it waits in the trash, often for thirty days. |
| L5 | 16.45–19.22 | And older backups can keep a copy until they're removed. |
| L6 | 19.57–23.93 | For permanent removal: sync the delete, empty the trash, check your backups. |
| L7 | 26.15–28.70 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):** deletes /dəlˈits/, synced /sˈɪŋkt/, laptop /lˈæptˌɑp/, backups /bˈækˌʌps/, and the accepted override `[Tensorblue](/tˈɛnsəɹblˌu/)`.

**Edits:** the 86-word first draft ran 28.2 s and pushed the CTA past 30 s. It was cut by 11 words; dropped "the cloud records it" and changed "until those backups are removed" → "until they're removed". No claim was lost.

## Source → claim map (official help pages, read 2026-11-07)
| claim | source | what it says |
|---|---|---|
| Some deletes only remove the device's copy; the cloud keeps its own | **Google Photos Help — Free up space on your device** https://support.google.com/photos/answer/6128843 ; **Google Photos Help — Delete & restore photos & videos** https://support.google.com/photos/answer/6128858 | Free-up-space "deletes photos from your device", yet you can "See your photos and videos, including the ones you just removed, in the Google Photos app and photos.google.com." The delete page offers a separate "Delete from device" option. |
| A synced delete: every device removes its copy | **Apple — Set up and use iCloud Photos** https://support.apple.com/en-us/108782 ; Google Photos delete page (above) | Apple: "When you delete photos and videos on one device, they're deleted everywhere that you use iCloud Photos." Google: deleting a backed-up item also deletes it on every device with backup on. |
| It waits in the trash, often for thirty days | Apple iCloud Photos (above); Google Photos delete page (above); **Microsoft — Restore deleted files or folders in OneDrive** https://support.microsoft.com/en-us/office/restore-deleted-files-or-folders-in-onedrive-949ada80-0026-4db3-a953-c99083e6a84f | Apple: "you can recover it in the Recently Deleted folder for 30 days." Google: backed-up items stay in the trash for 30 days. Microsoft: "For personal accounts, you can restore files or folders deleted within the last 30 days." Hence "often", not "always". |
| Older backups can keep a copy until they're removed | **Apple — Back up your Mac with Time Machine** https://support.apple.com/en-us/104984 | "Time Machine automatically makes hourly backups for the past 24 hours, daily backups for the past month, and weekly backups for all previous months. The oldest backups are deleted when your backup disk is full." |
| Permanent removal: empty the trash | Apple iCloud Photos; Google Photos delete page | Apple: after 30 days "it's deleted permanently and you can't get it back." Google: "Empty Trash" → "Delete permanently"; emptied items can't be restored. |

**Illustrative, not claims:**
- The phone, cloud, laptop, trash and "Backup · Monday" drive are a fictional system.
- "day … of 30" is the example's counter.
- The "delete: beach.jpg" card pictures the deletion travelling between devices.
- No service is named on screen, and none is said to behave exactly like the example.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–4.16 | **S1 Hook** | Frame 0: a phone and a laptop both showing the code-drawn beach.jpg. At 0.12 s the phone's bin button is pressed and the photo shrinks into it ("deleted" slot by 0.75 s). The laptop's copy gets a blue frame and "still here" at 0.9 s. Kinetic "Still on your **laptop?**" |
| 4.16–8.74 | **S2 Device-only delete** | Wipe →. Cloud on top, phone and laptop below. "Remove from this device" turns blue; the phone's copy becomes a dashed "removed" slot. The cloud's copy gets a ✓ and "cloud copy kept"; the laptop keeps its copy ✓. Kinetic "Only **this device's copy.**" |
| 8.74–12.76 | **S3 Synced delete** | Wipe ←. "Delete everywhere". A blue "delete: beach.jpg" card travels phone → cloud (the cloud's copy goes; a trash chip shows "1") → laptop (the laptop's copy goes). Kinetic "Every **device.**" |
| 12.76–16.25 | **S4 Trash retention** | Wipe ↑. A white "Trash · recently deleted" card: the photo drops in, a "Restore" button appears, and a 30-cell counter fills "day 1 … 30 of 30". Kinetic "Thirty **days.**" |
| 16.25–19.37 | **S5 Older backup (isometric stage)** | Wipe →. A slab with a pale "Backup · Monday" drive; Monday's copy of the photo rises out of it; pill "kept until this backup is removed". Kinetic "Older **backups.**" |
| 19.37–25.80 | **S6 Takeaway** | Wipe ←. Kinetic "Permanent removal"; a checklist ticks on "sync", "empty", "check". Five location chips (Phone, Cloud, Laptop, Trash, Backup) follow the real demo states: start → after the synced delete (Trash + Backup) → trash emptied (Backup) → backup removed (none). "no copy left" on the chime. |
| 25.80–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "software explained simply", Follow pill. |

## Provenance and licences
New: `src/scene.mjs`, `src/demo/sync_demo.py` + `src/demo/out/sync-demo.json`.

Reused unchanged from english-07: `brt.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`. `mix.py` was reused with only its seed (20261111), heading and chord comments changed.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Logo: `assets/brand/tensorblue-logo.svg`.
- The beach photo is drawn in code in the palette (original).
- rsync (GPL-3.0, Ubuntu `rsync 3.2.7-1ubuntu1.5`) was run locally only.
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, private files or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-07-english-08/tensorblue-30s-english08-01.mp4` · SHA256 `8d80f1d2731dd868a6f7c23fb0c004e967aed8057ab5ba9422ce1870a1208213` · 2,861,156 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 3.7 LU, **−1.9 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 13 groups pass: ink y 372–488, x 162–914 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| hook | intriguing first second | photo deleted on the phone by 0.75 s while the laptop copy stays ("still here" 0.9 s) |
| narration (one ASR pass, base.en, narration span) | intelligible | every word heard; WER 4.0 %: "synced delete" → "sync delete" (the /t/ before /d/ is elided in normal speech), "And" → "An", "thirty" → "30" |
| caption/speech timing | aligned | mean word-start drift 0.10 s, max 0.34 s |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once each):**
- The cloud's bumps never drew, because the kit's `rr()` starts a new path; it now fills the blobs separately, with a white "Cloud" label below.
- The laptop label was hidden behind the photo (moved below the base).
- "delete: beach.jpg" overflowed its card (wider card).
- The S2 action pill touched the kinetic line (layout raised).
- S5's rising photo hit the kinetic line and the LED sat on the drive label (stage raised, kinetic moved down, LED moved, longer drive).
- "removed here" spilled out of its slot (now "removed").

**Known limits:**
- I can't listen here; clarity rests on ASR plus loudness/true-peak metering.
- Retention times vary by service and plan; the video says "often".
- There is no Desktop/video-review folder in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
