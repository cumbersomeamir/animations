// Final script (user draft, minimally edited for accuracy/timing — see context/12-production-30s-01.md).
// Voice: agreed "Meshline" Kokoro config — style-vector blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella"; // G2P voice (American English, "a")
// Kokoro G2P flaps the t and reduces the vowel ("wˈɔːɾɚɹᵻsˈɪstənt"); Whisper heard "water-assistant". Clear "water re-ZIS-tant":
export const PHONEME_OVERRIDES = { "wˈɔːɾɚɹᵻsˈɪstənt": "wˈɔːtɚ ɹɪzˈɪstənt" };
export const NARRATION = [
  { id: "L1", start: 0.25, text: "A feature tells people what a product has." },
  { id: "L2", start: 2.95, text: "A benefit tells them why it matters." },
  { id: "L3", start: 5.3, text: "Take a fictional backpack." },
  { id: "L4", start: 7.25, text: "Water-resistant fabric is the feature." },
  { id: "L5", start: 9.75, text: "Keeping your notebook dry on a drizzly commute is the benefit." },
  { id: "L6", start: 14.05, text: "In an ad, show the situation, connect the feature to a useful outcome, and support the claim." },
  { id: "L7", start: 21.1, text: "Do not promise waterproof protection when the material is only water-resistant." },
  { id: "L8", start: 26.55, text: "Clear marketing makes the difference visible." },
];
