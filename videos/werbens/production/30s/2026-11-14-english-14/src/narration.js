// English-14 script (sources, claim tags and story structure in context/30-english14-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
// Prices are read the way UK shoppers say them: "£2.30" → "two thirty" (G2P gave "two pounds and thirty pence").
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "tˈuː pˈaʊndz ænd θˈɜɹɾi pˈɛns": "tˈuː θˈɜɹɾi", "tˈuː pˈaʊndz ænd ˈeɪɾi pˈɛns": "tˈuː ˈeɪɾi" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "£2.30 or £2.80: which mayo is the better buy?" },
  { id: "L2", start: 3.75, text: "Same brand. Now switch the unit." },
  { id: "L3", start: 6.15, text: "Per 100 grams: 107p versus 52p. About double." },
  { id: "L4", start: 11.7, text: "Research shows we focus on the number, not the unit." },
  { id: "L5", start: 15.0, text: "Listing snacks in kilojoules, not calories, raised healthy snack choices." },
  { id: "L6", start: 20.15, text: "Shoppers: compare every option in the same unit." },
  { id: "L7", start: 23.1, text: "Sellers: show unit prices clearly, in one unit." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 1.06, 2: 1.17 },
  L3: { 2: 6.91, 4: 8.42, 5: 8.68, 6: 9.34, 7: 9.7 },
  L5: { 5: 17.11 },
  L6: { 1: 20.9 },
  L7: { 2: 24.26, 3: 24.47, 4: 24.7, 5: 25.11 },
};
export const WORD_TEXT_FIX = {};
