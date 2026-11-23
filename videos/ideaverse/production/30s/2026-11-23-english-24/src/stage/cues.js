// cues.js — one timeline for picture, lip-sync and score (seconds). English narration placements from the ASR-measured
// clips (narration/words.json, faster-whisper base.en); action hits placed on those words.
// Pacing (2026-11-23 brief): 0–4.95 hook (stuck at 80% overnight; "Why does it stop?") · 4.95–6.55 superhook (protecting the
// battery) · 6.55–20.6 build (full charge ages batteries; on-device learning of the routine; 14 days + long charges in one
// place → hold at 80% → finish shortly before you need it) · 20.6–26.85 payoff (touch and hold → Charge Now) · 26.85–30 CTA.
const CUES = {
  fps: 30, dur: 30,
  hits: {
    // A · hook: the phone at 80% on the nightstand; "then waits" 2.88–3.2 → the clock races 1:10 → 3:40; "Why does it stop?" 3.96
    race: [2.9, 4.6], why: 3.95,
    // B · close-up: "It's protecting the battery" 5.1–6.1 → a shield closes over the battery ring
    cut1: 4.95, shield: 5.3,
    // C · card: "Batteries age faster when they sit at full charge" 6.7–8.98 → hours tick at 100%, the age bar grows
    cut2: 6.55, hours: [7.0, 8.9],
    // D · card: "Machine learning on the phone" 9.6–10.84 → ON THE PHONE; "learns your charging routine" 10.84–12.34 → 14 nights
    cut3: 9.45, onPhone: 10.15, nights: [10.85, 12.35], unplug: 12.45,
    //     "After two weeks · of long charges · in one place" 13.5 · 14.1 · 15.0 → three checks
    chk: [13.5, 14.15, 15.05],
    // E · night time-lapse: "it holds at 80%" 15.98–17.14 → clock runs, battery stays; F · "finishes shortly before you usually
    //     need it" 17.7–20.06 → 80 → 100 by 6:55, dawn, the 7:00 alarm
    cut4: 15.55, hold: [15.7, 17.6], fill: [17.9, 19.6], alarm: 19.9,
    // G · DOCKET's phone: "Need it full now?" 21.1 · "Touch and hold the notification" 22.36–23.46 · "tap Charge Now" 24.0–24.96
    cut5: 20.6, press: [22.4, 23.3], menu: 23.35, tap: 24.3, go: 24.55,
    cta: 26.85,
  },
  narration: [
    { id: 's1', t: 0.2 }, { id: 's2', t: 5.1 }, { id: 's3', t: 6.7 }, { id: 's4', t: 9.6 }, { id: 's5', t: 13.1 }, { id: 's6', t: 17.62 }, { id: 's7', t: 21.1 }, { id: 's8', t: 27.2 },
  ],
  // caption band (2026-11-19 brief): pill y ≈ 282..458, x 100..900 (pill centred at x 500, max width 800)
  captions: [
    { t0: 0.15, t1: 2.6, lines: [[['Your iPhone charges', 0]], [['to ', 0], ['80%', 2], [' overnight,', 0]]] },
    { t0: 2.6, t1: 4.95, lines: [[['then waits.', 0]], [['Why does it stop?', 2]]] },
    { t0: 5.0, t1: 6.6, lines: [[['It’s protecting', 1]], [['the battery.', 0]]] },
    { t0: 6.6, t1: 9.45, lines: [[['Batteries age faster', 2]], [['when they sit at full charge.', 0]]] },
    { t0: 9.5, t1: 10.8, lines: [[['Machine learning', 1]], [['on the phone', 0]]] },
    { t0: 10.8, t1: 12.95, lines: [[['learns your', 0]], [['charging routine.', 1]]] },
    { t0: 13.0, t1: 15.6, lines: [[['After two weeks', 1], [' of long', 0]], [['charges in one place,', 0]]] },
    { t0: 15.6, t1: 17.55, lines: [[['it holds at ', 0], ['80%,', 1]]] },
    { t0: 17.55, t1: 20.5, lines: [[['and finishes shortly', 0]], [['before you usually ', 0], ['need it.', 1]]] },
    { t0: 21.0, t1: 22.25, lines: [[['Need it full now?', 2]]] },
    { t0: 22.25, t1: 23.8, lines: [[['Touch and hold', 1]], [['the notification,', 0]]] },
    { t0: 23.8, t1: 25.7, lines: [[['then tap', 0]], [['Charge Now.', 1]]] },
    { t0: 26.9, t1: 30.2, lines: [[['Download the', 0]], [['@icon', 0], ['Ideaverse app.', 1]]], cta: true },
  ],
};
export default CUES;
