// English-24 script (sources, claim tags and story structure in context/40-english24-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why does IKEA walk you through rooms first?" },
  { id: "L2", start: 3.0, text: "Its store guide says: start with the showroom." },
  { id: "L3", start: 5.85, text: "Whole rooms, furniture in action. Flat packs come later." },
  { id: "L4", start: 9.7, text: "Alone, a sofa is a size and a price. In a room, it's your evening." },
  { id: "L5", start: 14.5, text: "Studies suggest picturing yourself using a product can make you want it more." },
  { id: "L6", start: 19.15, text: "At the shelves, you're finishing a room." },
  { id: "L7", start: 21.6, text: "Don't just show the product. Show the life around it." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.47 },
  L2: { 1: 3.2, 2: 3.41 },
  L4: { 1: 10.38, 2: 10.52, 12: 13.26 },
  L5: { 7: 17.57, 8: 17.9 },
  L6: { 3: 20.01, 4: 20.17 },
};
export const WORD_TEXT_FIX = {};
