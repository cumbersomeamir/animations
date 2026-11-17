// English-19 script (sources, claim tags and story structure in context/35-english19-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why do shoppers keep more extras when they start full?" },
  { id: "L2", start: 3.35, text: "One builds up from basic. One trims down from full." },
  { id: "L3", start: 7.0, text: "In three studies, trimming down kept more options, at a higher total price." },
  { id: "L4", start: 11.95, text: "Across price levels and product types." },
  { id: "L5", start: 14.35, text: "But for shoppers barely set on buying, starting full put them off." },
  { id: "L6", start: 18.35, text: "Where a choice starts steers where it ends." },
  { id: "L7", start: 20.7, text: "Start committed buyers full, but every paid extra needs their own yes." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L3: { 8: 10.11, 9: 10.22, 10: 10.29, 11: 10.59, 12: 10.98 },
  L5: { 8: 16.99, 9: 17.3 },
  L7: { 7: 23.21 },
};
export const WORD_TEXT_FIX = {};
