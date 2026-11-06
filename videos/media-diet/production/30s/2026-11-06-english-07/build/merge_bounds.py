"""Merge per-range overlay text logs (frames/_bounds_*.json) into qa/text-bounds-raw.json; later files win per frame."""
import json, glob, os
by = {}
for f in sorted(glob.glob('frames/_bounds_*.json'), key=os.path.getmtime):
    for fr in json.load(open(f)): by[fr['f']] = fr
os.makedirs('qa', exist_ok=True); json.dump([by[k] for k in sorted(by)], open('qa/text-bounds-raw.json', 'w'))
print('merged bounds for', len(by), 'frames')
