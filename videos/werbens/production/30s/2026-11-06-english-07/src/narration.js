// English-07 final script (sources and claim map in context/22-english07-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens" (context/11 pronunciation list).
// Hyphenated prices ("320-rupee") are joined by the G2P ("twˈɛntiɹˈuːpiː"): split them; stress "was" in "a 'was' price".
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "iɹˈuːpiː": "i ɹˈuːpiː", "dɹˈuːpiː": "d ɹˈuːpiː", "ɐ wʌz pɹˈaɪs": "ɐ wˈʌz pɹˈaɪs" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Is a 320-rupee sandwich expensive?" },
  { id: "L2", start: 3.45, text: "Beside 150-rupee snacks, it can look pricey." },
  { id: "L3", start: 7.25, text: "Add a 1,200-rupee platter above it, and it can look fair." },
  { id: "L4", start: 11.65, text: "That's anchoring: the high price sets the reference." },
  { id: "L5", start: 14.7, text: "In a 2006 study, one extreme price in a catalog raised what people would pay for other items." },
  { id: "L6", start: 21.4, text: "So list a real premium item next to it, and never fake a 'was' price." },
  { id: "L7", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.47, 2: 0.56 },
  L2: { 1: 3.88, 7: 6.3 },
  L3: { 5: 9.15, 6: 9.5, 7: 9.74, 8: 10.26, 9: 10.45, 10: 10.55, 11: 10.73, 12: 10.87 },
  L4: { 1: 11.91, 3: 12.84, 4: 13.08, 5: 13.45, 6: 13.63, 7: 13.72 },
  L5: { 1: 14.98, 2: 15.05, 3: 15.88, 5: 16.9, 6: 17.45, 7: 17.98, 8: 18.03, 9: 18.08, 10: 18.6, 11: 19.03, 12: 19.29, 13: 19.68, 14: 19.85, 15: 20.12, 16: 20.3, 17: 20.48 },
  L6: { 1: 21.8, 2: 22.12, 3: 22.25, 4: 22.55, 5: 22.95, 6: 23.3, 7: 23.47, 8: 23.6, 9: 24.07, 10: 24.2, 11: 24.48, 12: 24.7, 13: 24.78, 14: 25.05 },
  L7: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
