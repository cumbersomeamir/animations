// English-11 final script (sources and claim map in context/26-english11-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list);
// "zero" came out as zˈiəɹoʊ: standard US zˈɪɹoʊ.
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "zˈiəɹoʊ": "zˈɪɹoʊ" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "24 jams? Or just 6?" },
  { id: "L2", start: 2.6, text: "In a 2000 study, shoppers were more likely to buy from a table of 6 jams than from 24." },
  { id: "L3", start: 9.35, text: "But a review of 50 experiments found the average effect was nearly zero." },
  { id: "L4", start: 14.0, text: "It depends: overload grows when options are hard to compare." },
  { id: "L5", start: 18.15, text: "So make choosing easy: group your options, and say who each one is for." },
  { id: "L6", start: 22.65, text: "Like: for kids, for cheese boards, for baking." },
  { id: "L7", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.92, 2: 1.5, 3: 1.72, 4: 2.02 },
  L2: { 1: 2.83, 2: 2.92, 3: 3.58, 6: 4.81, 7: 5.05, 8: 5.41, 9: 5.55, 10: 5.85, 11: 6.1, 12: 6.28, 14: 7.05, 16: 7.98, 17: 8.13, 18: 8.33 },
  L3: { 1: 9.6, 2: 9.66, 3: 10.19, 5: 10.7, 6: 11.36, 7: 11.6, 8: 11.66, 9: 12.02, 10: 12.3, 11: 12.57, 12: 12.95 },
  L4: { 1: 14.15, 3: 15.42, 4: 15.65, 5: 15.85, 6: 16.24, 7: 16.43, 8: 16.84, 9: 16.95 },
  L5: { 1: 18.5, 2: 18.71, 3: 19.07, 4: 19.95, 5: 20.14, 6: 20.3, 7: 20.62, 8: 20.88, 9: 21.12, 10: 21.3, 11: 21.48, 12: 21.67, 13: 21.95 },
  L6: { 1: 23.09, 2: 23.25, 3: 23.77, 4: 23.87, 5: 24.22, 6: 24.62, 7: 24.75 },
  L7: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
