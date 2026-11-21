"""QA: check logged text bounds (build/textlog.json) against the approved safe areas.
english-22 zones (2026-11-19 brief): captions x 100-900, y 280-460 (below platform account UI); headlines/labels and the CTA x 100-940, y 480-1450 (clear of the right-side and bottom platform controls). Prints a summary."""
import json, sys, os
here = os.path.dirname(os.path.abspath(__file__))
log = json.load(open(os.path.join(here, 'build', sys.argv[1] if len(sys.argv) > 1 else 'textlog.json')))
zones = {'caption': (100, 900, 280, 460), 'fig': (100, 940, 480, 1450), 'cta': (100, 940, 480, 1450)}
for tag, (x0, x1, y0, y1) in zones.items():
    runs = [r for r in log if r['tag'] == tag]
    bad = [r for r in runs if r['x0'] < x0 - 0.5 or r['x1'] > x1 + 0.5 or r['y0'] < y0 - 0.5 or r['y1'] > y1 + 0.5]
    if not runs: print(f'{tag}: 0 runs'); continue
    ext = (min(r['x0'] for r in runs), max(r['x1'] for r in runs), min(r['y0'] for r in runs), max(r['y1'] for r in runs))
    print(f"{tag}: {len(runs)} runs, {len(bad)} outside x {x0}-{x1} / y {y0}-{y1}; extent x {ext[0]:.0f}-{ext[1]:.0f}, y {ext[2]:.0f}-{ext[3]:.0f}")
    for r in bad[:12]: print('   OUT', r['f'], repr(r['s']), round(r['x0']), round(r['x1']), round(r['y0']), round(r['y1']))
