"""Word-to-event sync table (QA): narration-pass ASR word starts vs export ASR vs the event times in src/cues.json -> qa/sync.txt."""
import json
W = json.load(open('qa/asr_words_narration.json'))['words']; F = json.load(open('qa/asr_words_final.json'))['words']; Q = json.load(open('src/cues.json')); T = Q['T']
def near(i):
    w = W[i]; f = min(F, key=lambda x: abs(x['start'] - w['start'])); return f"{w['start']:.2f} ({w['w']})", f"{f['start']:.2f} ({f['w']})"
rows = [(0, 'FRAME 0 (complete, = thumbnail): real portrait + one pulsing star and its light curve + "A BLINK MEASURES SPACE"; star pulse sound from 0.00 s, narration 0.05 s', 0.0),
 (6, 'light sweep across the portrait on her name', Q['sweep']),
 (13, 'the star and its light curve flash ("blink")', Q['blink']),
 (14, 'HARD CUT (flash) to two stars that look equally faint', T['cut']),
 (17, 'the camera tilts up into a map: one star near, one far', Q['orb'][0]),
 (19, '"WEAK" on the near star', Q['weak']),
 (22, '"FAR" on the far, bright star', Q['far']),
 (24, 'PUSH (7.05-7.30) -> the distant star cloud', T['push'][0]),
 (26, 'her gold marks ring the blinking stars, one by one', Q['marks'][0]),
 (30, 'the cloud lights up and is outlined', Q['cloudHi']),
 (32, 'equal-distance lines from Earth to each marked star', Q['eq']),
 (34, 'the equal-distance arc and "SAME DISTANCE"', Q['same']),
 (36, 'DIVE (11.95-12.28) into the cloud -> its stars above an empty graph', T['dive'][0]),
 (38, 'the brighter stars swell', Q['bri']),
 (40, 'each star drops a dot onto the graph (first lands)', Q['drops'][0]),
 (41, 'the gold line through the dots', Q['line']),
 (42, 'her real 1912 figure (Circular 173) replaces the drawn graph; stamp 1912 LEAVITT', Q['figIn']),
 (44, 'the lookup arrow rises from a blinking star to her line', Q['look'][0]),
 (47, 'the arrow reaches the brightness axis (true brightness)', Q['look'][2]),
 (48, 'PAGE TURN -> the distance shot', T['turn'][0]),
 (49, 'the star dims to how faint it looks; its true glow remains as a dashed ring', Q['faint']),
 (52, 'the tape measure stretches to the star; "DISTANCE"', Q['dist']),
 (53, 'PUSH -> the real 1899 Andromeda photograph; a star in it is ringed and blinks', Q['hub']),
 (55, 'stamp "1923 HUBBLE"', Q['used']),
 (56, 'her rule (Leavitt 1912 card) and an arrow to the star', Q['rule']),
 (59, 'PULL BACK: Andromeda far above, the Milky Way below', Q['pull'][0]),
 (62, '"ANOTHER GALAXY" (tape from the Milky Way to Andromeda)', Q['gal']),
 (64, 'SLIDE -> the lesson page; stars pop in at mixed distances (placed S7; ASR stamps "Lesson" late)', T['slide'][0]),
 (68, 'scattered dots on the small graph; "?"', Q['pat']),
 (70, 'the stars slide onto one row (same distance); the dots line up', Q['cmp']),
 (73, 'gold tick; card "compare like with like"', Q['ok']),
 (74, 'CTA SLIDE (26.70-27.10) (placed S8 27.10; ASR stamps "Download" early)', T['cta'][0])]
out = ['word | narration-pass start | export ASR nearest | event | event time']
for i, ev, tt in rows:
    a, b = near(i); out.append(f"{W[i]['w']} | {a} | {b} | {ev} | {tt:.2f}")
open('qa/sync.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
