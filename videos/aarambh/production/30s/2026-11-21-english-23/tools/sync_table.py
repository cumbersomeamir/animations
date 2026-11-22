"""Word-to-event sync table (QA): narration-pass ASR word starts vs export ASR vs the event times in src/cues.json -> qa/sync.txt."""
import json
W = json.load(open('qa/asr_words_narration.json'))['words']; F = json.load(open('qa/asr_words_final.json'))['words']; Q = json.load(open('src/cues.json')); T = Q['T']
def near(i):
    w = W[i]; f = min(F, key=lambda x: abs(x['start'] - w['start'])); return f"{w['start']:.2f} ({w['w']})", f"{f['start']:.2f} ({f['w']})"
rows = [(0, 'FRAME 0 (complete, = thumbnail): real portrait + Earth sliced open + band station pinging + "SHE HEARD THE IMPOSSIBLE"; audio from 0.00 s (quake thump), narration 0.08 s', 0.0),
 (5, 'the band station pings again (the impossible arrival)', Q['ping0']),
 (6, 'light sweep across the portrait on her name', Q['sweep']),
 (10, 'HARD CUT (flash) into the veiled centre (placed S2 4.00; speech onset 4.03; ASR stamps "what" early)', T['cut']),
 (12, 'the "?" swells over the veiled core', Q['veilQ']),
 (14, 'WHIP PAN (5.35-5.60) -> face-on cutaway; the PKP ray launches', Q['ray3'][0]),
 (16, 'the ray enters the core: flash, turns amber, slows', Q['ray3Core'][0]),
 (21, 'the ray lands beyond the band (151 deg), station pings', Q['ray3'][1]),
 (22, 'the shadow band darkens, "SHADOW ZONE"', Q['band']),
 (26, 'PUSH (9.65-9.90) -> drum seismograph page', T['push'][0]),
 (28, '"1929" stamp', Q['stamp1929']),
 (31, 'the pen kicks into the strong arrival (gold)', Q['rec']),
 (34, 'PAGE TURN (13.85-14.20) -> cutaway, core veiled', T['turn'][0]),
 (35, 'portrait chip with "1936"', Q['por1936']),
 (39, 'the veil burns off: "INNER CORE"', Q['unveil']),
 (41, 'the PKiKP ray launches', Q['ray5'][0]),
 (43, 'the ray reflects at the inner-core boundary (flash)', Q['ray5Bounce']),
 (47, 'the ray lands at 125 deg inside the band; the band glows gold', Q['ray5'][1]),
 (48, 'PUSH + ORBIT into the core (19.60-20.30) (placed S6 19.95; speech onset 19.98; ASR stamps "Later" late)', T['zoom'][0]),
 (53, 'the core crystallises; "SOLID"', Q['solid'][0]),
 (54, 'SLIDE (21.60-21.95) -> lesson page; predicted arcs draw (placed S7 21.95; speech onset 21.99; ASR stamps "Lesson" late)', T['slide'][0]),
 (58, 'the gold measured arrival lands in the gap', Q['meas']),
 (61, 'a ring marks the mismatch', Q['ring']),
 (63, 'the mismatch opens into a lens on the hidden core', Q['lens']),
 (64, 'card "mismatch = clue"', Q['card']),
 (66, 'CTA SLIDE (26.70-27.10) (placed S8 27.10; speech onset 27.13; ASR stamps "Download" early)', T['cta'][0])]
out = ['word | narration-pass start | export ASR nearest | event | event time']
for i, ev, tt in rows:
    a, b = near(i); out.append(f"{W[i]['w']} | {a} | {b} | {ev} | {tt:.2f}")
open('qa/sync.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
