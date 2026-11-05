// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // B · settings ("Live Caption" 4.07, "Android" 4.87, "Live Captions" 5.85, "iPhone" 6.83)
    togA: 4.3, togI: 6.1,
    // C · AI types the words ("listens" 8.46, "audio" 9.36, "types the words on your screen" 10.3–11.9)
    play: 8.6, words0: 10.25, words1: 11.95,
    // D · said vs captioned ("said three fifteen" 14.34–15.2, "caption says three fifty" 15.98–17.2)
    said: 14.3, capSays: 15.95, ne: 16.6,
    // E · check ("times" 18.64, "names" 19.4, "numbers" 20.0, "check with the sender" 21.28–22.1)
    chips: [18.62, 19.38, 19.98], type0: 21.2, type1: 22.4, send: 22.55, reply: 23.6, fixed: 24.05,
  },
  narration: [
    { id: 's1', t: 0.25 }, { id: 's2', t: 3.75 }, { id: 's3', t: 8.3 }, { id: 's4', t: 12.6 }, { id: 's5', t: 18.4 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.2, t1: 3.55, lines: [[['Stuck on a noisy bus with a', 0]], [['voice message ', 0], ['you can’t hear?', 2]]] },
    { t0: 3.6, t1: 8.05, lines: [[['Turn on ', 0], ['Live Caption', 1], [' on Android,', 0]], [['or ', 0], ['Live Captions', 1], [' on iPhone.', 0]]] },
    { t0: 8.1, t1: 12.4, lines: [[['AI listens to the audio and', 0]], [['types the words', 1], [' on your screen.', 0]]] },
    { t0: 12.45, t1: 15.9, lines: [[['But it can get it wrong.', 2]], [['Your friend said ', 0], ['3:15.', 1]]] },
    { t0: 15.9, t1: 18.3, lines: [[['The caption says ', 0], ['3:50.', 2]]] },
    { t0: 18.35, t1: 21.0, lines: [[['So for ', 0], ['times, names', 2]], [['and ', 0], ['numbers', 2], [' that matter,', 0]]] },
    { t0: 21.0, t1: 23.4, lines: [[['check with the sender', 1]], [['before you act.', 0]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
