// English-15 script (sources, claim tags and story structure in context/31-english15-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
// weak "what" after "sell" was heard as "with": stressed wˈʌt.
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "sˈɛl wʌt ɐ": "sˈɛl wˈʌt ɐ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why can a free sample sell what a perfect ad can't?" },
  { id: "L2", start: 3.25, text: "An ad asks you to believe; a sample lets you check." },
  { id: "L3", start: 6.6, text: "In a 1983 study, opinions from trying predicted buying better than opinions from ads." },
  { id: "L4", start: 12.9, text: "Field tests found samples brought in new buyers, with effects up to a year later." },
  { id: "L5", start: 18.0, text: "Results varied widely between brands." },
  { id: "L6", start: 20.5, text: "So if one taste proves it, let people try." },
  { id: "L7", start: 23.3, text: "Make the sample prove your main claim." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.4, 2: 0.5, 3: 0.63, 6: 1.64 },
  L2: { 4: 4.2, 5: 4.27 },
  L3: { 5: 9.14, 6: 9.34, 7: 9.78, 8: 10.31, 9: 10.74, 10: 11.05, 12: 11.83, 13: 11.99 },
  L4: { 8: 16.11, 9: 16.3, 10: 16.53 },
};
// Whisper token text corrections used only for caption alignment ("sell" written as the homophone "cell"): applied by src/words_fix.mjs.
export const WORD_TEXT_FIX = { L1: { 5: "sell," } };
