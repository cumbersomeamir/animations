// Final script for production 30 s #02 (user draft tightened for verified accuracy/timing — see context/13-production-30s-02.md).
// Voice: agreed "Meshline" Kokoro config — style-vector blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella"; // G2P voice (American English, "a")
// weak "tə" before "copy" was heard as "a copy" → full "to"
export const PHONEME_OVERRIDES = { "tə kˈɑːpi": "tˈuː kˈɑːpi" };
export const NARRATION = [
  { id: "L1", start: 0.25, text: "Volkswagen's 1959 campaign put a tiny car above two words: Think small." },
  { id: "L2", start: 6.45, text: "Instead of pretending the car was bigger, it made smallness the point." },
  { id: "L3", start: 10.65, text: "White space, plain words and a modest photo stood out when most cars were bigger and flashier." },
  { id: "L4", start: 16.65, text: "The lesson is not to copy that layout." },
  { id: "L5", start: 19.2, text: "Find a real trade-off your product makes, then show why the right customer might prefer it." },
  { id: "L6", start: 25.3, text: "A limitation can become a reason to choose." },
];
