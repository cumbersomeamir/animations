// English-13 script (sources, claim tags and story structure in context/29-english13-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Identical boxes. Why pay more for one?" },
  { id: "L2", start: 3.2, text: "One difference: you built it." },
  { id: "L3", start: 5.25, text: "IKEA's pitch: we do our part, you do yours." },
  { id: "L4", start: 8.4, text: "In a 2012 study, people who assembled an IKEA box bid more than people handed one ready-made." },
  { id: "L5", start: 15.0, text: "But when they couldn't finish, or took it apart, the boost vanished." },
  { id: "L6", start: 19.4, text: "Effort adds value when it ends in success." },
  { id: "L7", start: 22.2, text: "So give customers a real step they can finish, not busywork." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 1.14 },
  L2: { 2: 4.16, 3: 4.31 },
  L3: { 1: 5.73, 6: 7.04, 7: 7.24 },
  L4: { 3: 9.31, 10: 11.83, 11: 12.07, 14: 13.04 },
  L5: { 6: 16.3, 7: 16.5, 8: 16.7, 9: 17.15, 10: 17.31, 11: 17.64 },
};
// Whisper token text corrections used only for caption alignment (Whisper dropped the possessive): applied by src/words_fix.mjs.
export const WORD_TEXT_FIX = { L3: { 0: "IKEA's" } };
