// English-09 final script (sources and claim map in context/24-english09-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; rhotic "first" (context/11 pronunciation list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "fˈɜːst": "fˈɜɹst" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Same reward, same eight washes. Which card gets finished?" },
  { id: "L2", start: 3.95, text: "In a 2006 car wash study, both cards needed eight washes." },
  { id: "L3", start: 8.7, text: "The one that started with two free stamps was completed more often, and faster." },
  { id: "L4", start: 13.45, text: "That's the endowed progress effect: a head start feels like you've already begun." },
  { id: "L5", start: 18.5, text: "So give customers a real head start: a welcome stamp, or a checklist with the first step done." },
  { id: "L6", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.62, 4: 1.75 },
  L2: { 1: 4.2, 2: 4.25, 3: 4.97, 4: 5.15, 5: 5.6, 7: 6.79, 8: 7.1, 9: 7.42 },
  L3: { 1: 8.95, 2: 9.16, 3: 9.27, 4: 9.76, 5: 9.85, 6: 10.08, 8: 10.72, 9: 10.91, 10: 11.3, 11: 11.55, 12: 12.36, 13: 12.54 },
  L4: { 1: 13.62, 2: 13.75, 3: 14.52, 4: 15.08, 7: 16.22, 8: 16.56, 9: 16.86, 10: 17.04, 11: 17.2, 12: 17.59 },
  L5: { 2: 19.16, 3: 19.66, 4: 19.74, 5: 19.98, 6: 20.2, 8: 21.12, 9: 21.43, 10: 22.24, 11: 22.4, 12: 22.48, 13: 22.99, 14: 23.1, 15: 23.27, 17: 23.86 },
  L6: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
