"""Hindi grapheme-to-phoneme for Kokoro, exactly as Kokoro's own pipeline does for lang 'h':
misaki.espeak.EspeakG2P(language='hi') on espeak-ng (bundled by espeakng-loader). Writes build/vo/phonemes.json.
Run with the isolated venv:  <venv>/bin/python -I src/g2p.py   (requirements: requirements-g2p.txt)"""
import json, os, sys
import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from misaki import espeak

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(root, 'src', 'narration.json'), encoding='utf-8'))
g2p = espeak.EspeakG2P(language='hi')
out = []
for l in cfg['lines']:
    ph = g2p(l.get('speak', l['say']))
    if isinstance(ph, tuple):
        ph = ph[0]
    out.append({'id': l['id'], 'say': l['say'], 'phonemes': ph})
    print(l['id'], ph)
os.makedirs(os.path.join(root, 'build', 'vo'), exist_ok=True)
json.dump(out, open(os.path.join(root, 'build', 'vo', 'phonemes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
