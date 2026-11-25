"""Word-to-event sync table (QA): narration-pass ASR word starts vs export ASR vs the event times in src/cues.json -> qa/sync.txt."""
import json
W = json.load(open('qa/asr_words_narration.json'))['words']; F = json.load(open('qa/asr_words_final.json'))['words']; Q = json.load(open('src/cues.json')); T = Q['T']
def near(i):
    w = W[i]; f = min(F, key=lambda x: abs(x['start'] - w['start'])); return f"{w['start']:.2f} ({w['w']})", f"{f['start']:.2f} ({f['w']})"
rows = [(0, 'FRAME 0 (complete, = thumbnail): real portrait + heated flask with thermometer + "THE CLUE WAS THE TEMPERATURE"; burner hiss from 0.00 s, narration 0.08 s', 0.0),
 (4, 'the sparks in the extract start blinking out ("kept failing")', Q['fail']),
 (6, 'light sweep across the portrait on her name', Q['sweep']),
 (10, 'the thermometer glows (the clue)', Q['clue']),
 (11, 'HARD CUT (flash) to the extract close-up; the last sparks go out', T['cut']),
 (15, 'WHIP PAN (5.50-5.75) -> the flask on the flame', T['whip'][0]),
 (19, 'the flame roars, the sparks crackle apart; "HEAT"', Q['heat']),
 (20, 'PUSH (6.80-7.05) -> the ancient recipe page', T['push'][0]),
 (21, 'the qinghao column is highlighted, top to bottom', Q['highlight'][0]),
 (24, 'the herb dips into cold water', Q['soak']),
 (27, 'the herb is lifted and wrung; drips', Q['wring']),
 (31, '"NO BOILING" stamp', Q['noboil']),
 (33, 'PAGE TURN (11.45-11.80) -> the flask in an ice bath', T['turn'][0]),
 (37, 'the thermometer drops to 35 deg; the sparks brighten', Q['cool']),
 (39, '"ETHER" tag', Q['ether']),
 (40, 'DIVE (14.30-14.65) into the extract -> the microscope', T['dive'][0]),
 (41, '"1971 / extract 191" stamp', Q['y1971']),
 (43, 'the parasites clear from the blood cells', Q['clear']),
 (47, 'PUSH (17.80-18.05) -> gold sparks gather into a vial', T['push2'][0]),
 (50, 'white crystals grow; "ARTEMISININ"', Q['art']),
 (55, 'her portrait chip and "NOBEL 2015"', Q['nobel']),
 (58, 'SLIDE (21.75-22.10) -> the lesson page; step tiles appear (placed S7 22.10; ASR stamps "Lesson" late)', T['slide'][0]),
 (63, 'the result fails (red cross)', Q['fail2']),
 (64, 'the spotlight tests each step', Q['spot'][0]),
 (66, 'the spotlight stops on the heat step', Q['spot'][1]),
 (68, 'the heat step flips to cool', Q['flip']),
 (70, 'the result works (gold tick); card "test every step"', Q['ok']),
 (71, 'CTA SLIDE (26.70-27.10) (placed S8 27.10; ASR stamps "Download" early)', T['cta'][0])]
out = ['word | narration-pass start | export ASR nearest | event | event time']
for i, ev, tt in rows:
    a, b = near(i); out.append(f"{W[i]['w']} | {a} | {b} | {ev} | {tt:.2f}")
open('qa/sync.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
