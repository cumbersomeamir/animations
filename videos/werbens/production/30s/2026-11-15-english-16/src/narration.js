// English-16 script (sources, claim tags and story structure in context/32-english16-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why can one option you'll probably skip change what you pick?" },
  { id: "L2", start: 3.75, text: "Here are two made-up plans: Basic and Plus." },
  { id: "L3", start: 6.75, text: "Add a more expensive Premium, and Plus becomes the middle choice." },
  { id: "L4", start: 10.6, text: "We judge options against their neighbors, not alone." },
  { id: "L5", start: 13.9, text: "In consumer studies, middle options gained appeal; extremes lost it." },
  { id: "L6", start: 19.7, text: "So one extra tier reshapes the whole menu." },
  { id: "L7", start: 22.4, text: "Use it honestly: build every tier for a real customer, not as bait." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 4: 1.52, 5: 1.75, 6: 2.06 },
  L2: { 5: 4.62, 7: 5.75, 8: 5.98 },
  L3: { 5: 8.68, 6: 8.9, 7: 9.13, 8: 9.56, 9: 9.66, 10: 10.0 },
  L4: { 4: 11.89, 5: 12.23 },
};
export const WORD_TEXT_FIX = {};
