// English-22 script (sources, claim tags and story structure in context/38-english22-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why does free shipping make you add one more thing?" },
  { id: "L2", start: 3.3, text: "Your basket is 40. Shipping costs 6, but it's free from 50." },
  { id: "L3", start: 7.55, text: "Pay 46 as it is, or add a 10 item and pay 50." },
  { id: "L4", start: 11.6, text: "Four more, and you get an item instead of a fee." },
  { id: "L5", start: 14.55, text: "In one retailer's data, threshold offers drove extra sales." },
  { id: "L6", start: 18.8, text: "But lost shipping revenue made them unprofitable there." },
  { id: "L7", start: 22.05, text: "So add only what you'd buy anyway. Sellers: check the margin." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 4: 1.51 },
  L2: { 5: 5.24, 6: 5.5, 7: 5.83 },
  L4: { 2: 12.37 },
};
export const WORD_TEXT_FIX = {};
