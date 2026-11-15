// English-17 script (sources, claim tags and story structure in context/33-english17-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why can empty space make a product look more premium?" },
  { id: "L2", start: 3.5, text: "Same bottle, two displays: packed tight, or given room." },
  { id: "L3", start: 7.25, text: "In lab and field studies, more space made products seem more valuable." },
  { id: "L4", start: 11.8, text: "Items looked more attractive, and the store more prestigious." },
  { id: "L5", start: 15.6, text: "Not scarcity, not tidiness: the space itself." },
  { id: "L6", start: 18.8, text: "Less can look like more, but it's no guaranteed sale." },
  { id: "L7", start: 22.1, text: "Give your best product room: fewer items, space around each." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 4: 1.32, 5: 1.55, 6: 1.64, 7: 2.18, 8: 2.39, 9: 2.58 },
  L2: { 1: 3.86, 2: 4.23, 3: 4.36, 5: 5.55, 6: 5.76, 7: 6.03, 8: 6.28 },
  L5: { 1: 15.79 },
  L6: { 3: 19.43, 4: 19.57, 7: 20.49, 8: 20.67, 9: 21.08 },
  L7: { 6: 23.95, 7: 24.55, 8: 24.88, 9: 25.19 },
};
export const WORD_TEXT_FIX = {};
