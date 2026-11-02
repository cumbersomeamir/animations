// Writes the event-linked SFX list and the story cues for the audio mixer and the notes.
import fs from 'node:fs';
import { sfxEvents, CUES } from './scene.mjs';
fs.writeFileSync(process.argv[2], JSON.stringify({ sfx: sfxEvents(), cues: CUES }, null, 1));
console.log('events', sfxEvents().length);
