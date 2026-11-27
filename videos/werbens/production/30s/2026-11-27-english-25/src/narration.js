// English-25 script (sources, claim tags and story structure in context/41-english25-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why did people search the cooler for one bottle?" },
  { id: "L2", start: 2.95, text: "Share a Coke swapped the logo for popular first names." },
  { id: "L3", start: 6.36, text: "It started in Australia, with 150 names." },
  { id: "L4", start: 9.95, text: "So every cooler became a search: is my name here?" },
  { id: "L5", start: 13.4, text: "Research suggests our own name grabs attention when others slip by." },
  { id: "L6", start: 18.0, text: "Spot a friend's name, and it becomes a gift." },
  { id: "L7", start: 20.95, text: "Give shoppers something to find, and someone to give it to." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.52 },
  L2: { 1: 3.39, 2: 3.55, 3: 3.75 },
  L3: { 4: 8.05, 5: 8.17, 6: 8.7 },
  L5: { 5: 15.3, 7: 16.4 },
  L6: { 4: 19.4, 5: 19.62 },
  L7: { 5: 22.95, 6: 23.13 },
};
// Whisper writes "swapped the" as "swap the" and "shoppers something" as "shopper something" (final consonant merges into the
// next word); restores the caption words
export const WORD_TEXT_FIX = { L2: { 3: "swapped" }, L7: { 1: "shoppers" } };
