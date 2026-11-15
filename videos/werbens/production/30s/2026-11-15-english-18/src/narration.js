// English-18 script (sources, claim tags and story structure in context/34-english18-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Can a sound make the same drink seem fizzier?" },
  { id: "L2", start: 3.3, text: "Same water, two glasses. Only the sound changes." },
  { id: "L3", start: 6.95, text: "In lab tests, turning the fizz up made the water seem more carbonated." },
  { id: "L4", start: 11.45, text: "Held closer to the ear, the same water seemed fizzier." },
  { id: "L5", start: 14.85, text: "But in the mouth, sound changed nothing; touch and tingle took over." },
  { id: "L6", start: 18.9, text: "So sound sets the promise before the first sip." },
  { id: "L7", start: 22.05, text: "Let them hear the fizz, then make the drink deliver it." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L3: { 5: 8.63 },
  L5: { 4: 15.63, 5: 16.0, 6: 16.42, 8: 17.42, 9: 17.61, 10: 17.98, 11: 18.17 },
  L6: { 1: 19.08, 2: 19.46, 3: 19.8, 4: 19.89, 5: 20.28 },
  L7: { 1: 22.27, 2: 22.4, 3: 22.57, 4: 22.65 },
};
export const WORD_TEXT_FIX = { L1: { 8: "fizzier?" }, L2: { 2: "two" }, L4: { 9: "fizzier." } }; // Whisper spells "fizzier" as "fisier" and "two" as "to" (sound is right); fixes caption alignment
