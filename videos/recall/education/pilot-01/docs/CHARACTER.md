# Kip, the clay explorer (original recurring performer)

Model sheet: `docs/kip-model-sheet.png` (rendered from the same rig used in the video).
Rig: `web/character.js` (`new Kip(scale)`, `kip.apply(pose)`); pose channels in `KIP_DEFAULT_POSE`.

## Design
- **Silhouette**: one-piece gumdrop clay body (head and torso in one), stubby rubber-hose arms with mitten hands,
  short legs with ink boots, wide **lime pith helmet** with an ink band. Readable as a silhouette at thumbnail size.
- **Face**: tall oval eyes with ink pupils and glints, ink clay brows (main expression driver), small "D" mouth
  that opens with the narration envelope (lip-flap from `build/mouth.json`).
- **Accents**: lime helmet + lime neckerchief with a knot; props in lime (magnifier rim, flag).
- **Material**: matte clay with fingerprint/lump bump texture generated in code (`web/clay.js`).
- **Palette** (sampled from the Recall icon): lime `#C7F36B`, paper `#F8FAF3` (body warmed to `#F1F1E6`), ink `#20251B`.

## Proportions (units of the rig, scale 1)
Body 0.58 tall, 0.42 wide; legs 0.12; helmet brim Ø0.5. Eyes at 0.405, mouth at 0.318, shoulders at 0.26 (body-local).
In the pilot Kip is rendered at scale 1.2.

## How Kip moves (consistent across episodes)
- Face and helmet slide around the body for head turns (gumdrop trick); the body leans/sways and squash-stretches
  (anticipation before drops, squash on catches and squishes, stretch on hops).
- Arms are re-tubed each frame from shoulder to hand target, so Kip can reach, hold, point, press and plant.
- Signature gestures: **finger twirl = rewind/pause time** (to inspect a moment), **magnifier peek**, **lime flag** to
  mark a finding, thumbs-up at the takeaway.

## Expressions (on the sheet)
neutral, curious (one brow up), surprised ("oh"), determined (brows down, squash), delighted (thumbs-up).

## Voice
Kokoro-82M local synthetic voice, fixed style blend 0.6 af_heart + 0.4 bf_emma at speed 0.92 (Apache-2.0).
Reuse the same blend for every episode. Kip never imitates a named actor or character.

## Do / don't
- Do: let Kip physically run the experiment and react. Keep helmet, scarf and palette identical.
- Don't: use Kip as a talking head beside text, add brand slogans, or put Kip in app UI.
