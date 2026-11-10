// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: the empty road ahead turns red ("jam ahead") and the ETA jumps; "So why does your map warn of a jam?" 1.78–3.2
    warn: 0.4, eta: 0.95, cut1: 1.6, point: 2.0, how: 2.6,
    // B · "Speeds from phones" 4.5 → phone dots; "already on that road" 5.48 → speed chips; "show the traffic right now" 6.58–7.9 → roads coloured NOW
    cut2: 4.4, dots: 4.55, speeds: 5.5, now: 6.7,
    // C · "usually flows at this hour" 10.28–11.8 → usual-traffic chart for the road ahead; "predict what's coming" 12.06–13.22 → predicted jam
    usual: 10.2, hour: 11.1, predict: 12.1,
    // D · "It isn't perfect" 14.3; "a sudden crash" 15.46–16.16 → crash pops; "throw the estimate off" 16.46–17.78 → ETA wrong
    push: [14.25, 15.2], crash: 15.6, off: 16.9,
    // E · phone: "set a leave time" 20.44–21.2 → picker; "in advance" 21.2–21.7 → 5:30 pm; "estimated journey time" 22.06–23.62 → comparison
    cut4: 18.7, picker: 20.45, pick: 21.25, compare: 22.2, choose: 23.6,
    cta: 25.4,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 4.5 }, { id: 's3', t: 9.0 }, { id: 's4', t: 14.3 }, { id: 's5', t: 19.0 }, { id: 's6', t: 26.6 },
  ],
  // English captions; parts: [text, colour] 0 white · 1 mint · 2 amber ; each caption ≤ 2 lines
  captions: [
    { t0: 0.15, t1: 1.55, lines: [[['The road ahead ', 0], ['looks clear.', 1]]] },
    { t0: 1.55, t1: 4.4, lines: [[['So why does your map', 0]], [['warn of a ', 0], ['jam?', 2]]] },
    { t0: 4.45, t1: 6.6, lines: [[['Speeds from phones', 1]], [['already on that road', 0]]] },
    { t0: 6.6, t1: 8.9, lines: [[['show the traffic ', 0], ['right now.', 1]]] },
    { t0: 8.95, t1: 11.85, lines: [[['Then it adds how that road', 0]], [['usually flows', 1], [' at this hour,', 0]]] },
    { t0: 11.85, t1: 14.2, lines: [[['to ', 0], ['predict', 1], [' what’s coming.', 0]]] },
    { t0: 14.25, t1: 15.3, lines: [[['It isn’t perfect:', 2]]] },
    { t0: 15.3, t1: 18.6, lines: [[['a ', 0], ['sudden crash', 2], [' can still', 0]], [['throw the estimate off.', 0]]] },
    { t0: 18.9, t1: 20.2, lines: [[['For an important trip,', 0]]] },
    { t0: 20.2, t1: 21.75, lines: [[['set a ', 0], ['leave time', 1], [' in advance', 0]]] },
    { t0: 21.75, t1: 24.1, lines: [[['to see the ', 0], ['estimated', 1]], [['journey time.', 1]]] },
    { t0: 26.3, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app', 1]]], cta: true },
  ],
};
export default CUES;
