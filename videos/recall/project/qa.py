"""QA for the final MP4: metadata, full decode, frame sampling, audio levels, narration sync (ASR).

Writes ../qa/ffprobe.json, ../qa/contact_sheet.png, ../qa/boundaries.png, ../qa/qa_report.json
"""
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from timeline import DURATION, FPS, NARRATION, SCENES  # noqa: E402

MP4 = os.path.join(HERE, "..", "output", "recall-30s.mp4")
QA = os.path.join(HERE, "..", "qa")
FR = os.path.join(QA, "frames")


def run(cmd, **kw):
    kw.setdefault("text", True)
    return subprocess.run(cmd, capture_output=True, **kw)


def main():
    os.makedirs(FR, exist_ok=True)
    rep = {}
    probe = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", MP4]).stdout)
    with open(os.path.join(QA, "ffprobe.json"), "w") as f:
        json.dump(probe, f, indent=1)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    rep["video"] = dict(codec=v["codec_name"], profile=v.get("profile"), width=v["width"], height=v["height"],
                        fps=v["r_frame_rate"], pix_fmt=v["pix_fmt"], frames=int(v.get("nb_frames", 0)),
                        duration=float(v["duration"]))
    rep["audio"] = dict(codec=a["codec_name"], sample_rate=int(a["sample_rate"]), channels=a["channels"],
                        duration=float(a["duration"]))
    rep["container_duration"] = float(probe["format"]["duration"])
    rep["size_bytes"] = int(probe["format"]["size"])
    dec = run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "null", "-"])
    rep["full_decode_errors"] = dec.stderr.strip() or "none"
    # loudness / peaks
    eb = run(["ffmpeg", "-hide_banner", "-i", MP4, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summ = eb[eb.rfind("Summary:"):]
    def grab(key):
        for line in summ.splitlines():
            if line.strip().startswith(key):
                return line.split(":", 1)[1].strip()
        return None
    rep["loudness"] = dict(integrated=grab("I:"), lra=grab("LRA:"), true_peak=grab("Peak:"))
    # clipping check on the decoded AAC
    pcm = run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "f32le", "-ac", "2", "-ar", "48000", "-"],
              text=False).stdout
    x = np.frombuffer(pcm, dtype=np.float32)
    rep["audio_sample_peak"] = float(np.max(np.abs(x)))
    rep["clipped_samples_ge_0.999"] = int(np.sum(np.abs(x) >= 0.999))
    # silence check per second (any dead air?)
    mono = x.reshape(-1, 2).mean(axis=1)
    sec = [float(20 * np.log10(np.sqrt(np.mean(mono[i * 48000:(i + 1) * 48000] ** 2)) + 1e-9))
           for i in range(int(len(mono) / 48000))]
    rep["rms_dbfs_per_second"] = [round(s, 1) for s in sec]
    # frame sampling: 1 per second + scene boundaries
    times = [i + 0.5 for i in range(int(DURATION))]
    for t in times:
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", MP4, "-frames:v", "1",
             os.path.join(FR, f"s{t:05.2f}.png")])
    bts = []
    for name, t0, t1 in SCENES:
        for t in (t0 + 1 / FPS, t1 - 1 / FPS):
            t = min(max(t, 0), DURATION - 1 / FPS)
            bts.append(t)
            run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", MP4, "-frames:v", "1",
                 os.path.join(FR, f"b{t:05.2f}.png")])
    py = sys.executable
    run([py, os.path.join(HERE, "contact.py"), os.path.join(QA, "contact_sheet.png")] +
        [os.path.join(FR, f"s{t:05.2f}.png") for t in times], env={**os.environ, "COLS": "6", "TW": "240"})
    run([py, os.path.join(HERE, "contact.py"), os.path.join(QA, "boundaries.png")] +
        [os.path.join(FR, f"b{t:05.2f}.png") for t in bts], env={**os.environ, "COLS": "7", "TW": "200"})
    # ASR narration check (optional dependency)
    try:
        from faster_whisper import WhisperModel
        wav = os.path.join(HERE, "build", "qa_audio16k.wav")
        run(["ffmpeg", "-v", "error", "-y", "-i", MP4, "-ac", "1", "-ar", "16000", wav])
        model = WhisperModel("base.en", device="cpu", compute_type="int8",
                             download_root=os.path.join(HERE, ".cache", "whisper"))
        import soundfile as sf
        audio16k, _sr = sf.read(wav, dtype="float32")
        segs, _ = model.transcribe(audio16k, beam_size=5, condition_on_previous_text=False)
        rep["asr_transcript"] = " ".join(sg.text.strip() for sg in segs)
        # per-line check: transcribe each narration window cut from the final mix
        meta = json.load(open(os.path.join(HERE, "audio", "narration", "lines.json")))
        sync = []
        for line in meta["lines"]:
            a0 = max(0.0, line["start"] - 0.25)
            a1 = min(DURATION, line["start"] + line["duration"] + 0.25)
            clip = audio16k[int(a0 * 16000):int(a1 * 16000)]
            heard, onset = "", None
            try:
                sg = list(model.transcribe(clip, beam_size=5, word_timestamps=True,
                                           condition_on_previous_text=False)[0])
                ws = [w for x in sg for w in (x.words or [])]
                heard = " ".join(w.word.strip() for w in ws)
                onset = round(a0 + ws[0].start, 2) if ws else None
            except Exception:
                sg = list(model.transcribe(clip, beam_size=5, condition_on_previous_text=False)[0])
                heard = " ".join(x.text.strip() for x in sg)
                onset = round(a0 + sg[0].start, 2) if sg else None
            norm = lambda z: "".join(c for c in z.lower() if c.isalnum() or c == " ").split()
            sync.append(dict(id=line["id"], script=line["text"], heard=heard, planned_start=line["start"],
                             heard_start=onset, words_match=norm(heard) == norm(line["text"])))
        rep["narration_sync"] = sync
    except Exception as e:  # pragma: no cover
        rep["asr_error"] = repr(e)
    with open(os.path.join(QA, "qa_report.json"), "w") as f:
        json.dump(rep, f, indent=1)
    short = {k: v for k, v in rep.items() if k not in ("asr_words",)}
    print(json.dumps(short, indent=1))


if __name__ == "__main__":
    main()
