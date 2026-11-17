// English-20 script (sources, claim tags and story structure in context/36-english20-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "tˈuː pˈɔɪnt nˈaɪn nˈaɪn": "tˈuː nˈaɪnti nˈaɪn", "θɹˈiː pˈɔɪnt zˈiəɹoʊ zˈiəɹoʊ": "θɹˈiː", "θɹˈiː pˈɔɪnt fˈaɪv nˈaɪn": "θɹˈiː fˈɪfti nˈaɪn", "θɹˈiː pˈɔɪnt sˈɪks zˈiəɹoʊ": "θɹˈiː sˈɪksti" }; // prices read as people say them ("two ninety-nine"), captions keep the digits
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why do prices end in 99, not a round number?" },
  { id: "L2", start: 3.55, text: "Only a cent less, and the first digit drops." },
  { id: "L3", start: 6.55, text: "In studies, 2.99 felt smaller than 3.00." },
  { id: "L4", start: 9.85, text: "But 3.59 versus 3.60? No effect: same first digit." },
  { id: "L5", start: 15.1, text: "In field tests, nine endings lifted demand, most for new items." },
  { id: "L6", start: 19.8, text: "So use a nine where it flips the first digit." },
  { id: "L7", start: 22.55, text: "For feel-good purchases, a round price can feel right." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L2: { 4: 4.84, 5: 4.99, 6: 5.05, 7: 5.37, 8: 5.66 },
  L3: { 3: 8.17 },
  L4: { 0: 9.88, 1: 10.04, 2: 10.91, 3: 11.28, 4: 12.49, 5: 12.89, 6: 13.48, 7: 13.95, 8: 14.24 },
  L6: { 4: 20.77, 5: 20.9, 6: 21.0, 7: 21.26, 8: 21.33, 9: 21.6 },
};
export const WORD_TEXT_FIX = { L4: { 2: "versus" }, L6: { 3: "nine" } }; // Whisper writes "versus" as "vs." and "nine" as "9" (sound is right); fixes caption alignment
