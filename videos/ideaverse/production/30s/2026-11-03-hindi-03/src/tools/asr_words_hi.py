import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('medium', device='cpu', compute_type='int8')
out = {}
for f in sys.argv[2:]:
    x = np.frombuffer(subprocess.run(['ffmpeg','-nostdin','-v','error','-i',f,'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout,np.float32)
    segs,_ = m.transcribe(x, language='hi', beam_size=5, word_timestamps=True)
    words = [(w.word.strip(), round(w.start,2), round(w.end,2), round(w.probability,2)) for s in segs for w in s.words]
    key = f.split('/')[-1].split('.')[0]; out[key] = words
    print(key, f'{len(x)/16000:.2f}s |', ' '.join(w[0] for w in words), '| min p %.2f' % min(w[3] for w in words))
json.dump(out, open(sys.argv[1],'w'), indent=1, ensure_ascii=False)
