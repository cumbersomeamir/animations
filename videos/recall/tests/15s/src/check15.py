"""Render verification (skill step 7, own implementation of check_render's checks + QA extras).
Writes qa/ffprobe.json, qa/check_report.json, qa/contact_sheet.png, qa/boundaries.png."""
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import video15 as V  # noqa: E402
from cues import CUES, DURATION, FPS  # noqa: E402

ROOT = os.path.join(HERE, "..")
MP4 = os.path.join(ROOT, "recall-15s-test.mp4")
QA = os.path.join(ROOT, "qa")


def sh(cmd, text=True):
    return subprocess.run(cmd, capture_output=True, text=text)


def frames_sheet(out, frames, cols, tw):
    tmp = os.path.join(ROOT, "build", "frames")
    os.makedirs(tmp, exist_ok=True)
    paths = []
    for fr in frames:
        p = os.path.join(tmp, f"f{fr:03d}.png")
        sh(["ffmpeg", "-v", "error", "-y", "-i", MP4, "-vf", f"select=eq(n\\,{fr})", "-vframes", "1", p])
        paths.append(p)
    from PIL import Image, ImageDraw, ImageFont
    th = int(tw * 1920 / 1080)
    rows = (len(paths) + cols - 1) // cols
    im = Image.new("RGB", (cols * tw, rows * (th + 24)), "white")
    d = ImageDraw.Draw(im)
    fnt = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 15)
    for n, (fr, p) in enumerate(zip(frames, paths)):
        x, y = (n % cols) * tw, (n // cols) * (th + 24)
        im.paste(Image.open(p).convert("RGB").resize((tw, th)), (x, y + 24))
        d.text((x + 4, y + 3), f"f{fr} {fr / FPS:.2f}s", fill="black", font=fnt)
    im.save(out)


def main():
    rep = {}
    probe = json.loads(sh(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-count_frames", "-of", "json", MP4]).stdout)
    json.dump(probe, open(os.path.join(QA, "ffprobe.json"), "w"), indent=1)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    rep["video"] = dict(codec=v["codec_name"], profile=v.get("profile"), size=f'{v["width"]}x{v["height"]}', fps=v["r_frame_rate"],
                        pix_fmt=v["pix_fmt"], frames=int(v["nb_read_frames"]), duration=float(v["duration"]))
    rep["audio"] = dict(codec=a["codec_name"], rate=int(a["sample_rate"]), channels=a["channels"], duration=float(a["duration"]))
    dur = float(probe["format"]["duration"])
    rep["duration_s"] = round(dur, 3)
    rep["timeline_s"] = DURATION
    rep["delta_s"] = round(dur - DURATION, 3)
    rep["duration_ok_pm0.1"] = abs(dur - DURATION) <= 0.1
    rep["full_decode_errors"] = sh(["ffmpeg", "-v", "error", "-i", MP4, "-f", "null", "-"]).stderr.strip() or "none"
    eb = sh(["ffmpeg", "-hide_banner", "-i", MP4, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summ = eb[eb.rfind("Summary:"):]
    get = lambda k: next((l.split(":", 1)[1].strip() for l in summ.splitlines() if l.strip().startswith(k)), None)  # noqa: E731
    rep["loudness"] = dict(integrated=get("I:"), true_peak=get("Peak:"), lra=get("LRA:"))
    raw = sh(["ffmpeg", "-loglevel", "error", "-i", MP4, "-vn", "-f", "f32le", "-ac", "1", "-ar", "8000", "-"], text=False).stdout
    x = np.frombuffer(raw, np.float32)
    db = lambda q: round(float(20 * np.log10(max(float(q), 1e-9))), 1)  # noqa: E731
    rep["audio_levels"] = dict(peak_dBFS=db(np.abs(x).max()), rms_dBFS=db(np.sqrt((x ** 2).mean())),
                               clipped_samples=int((np.abs(x) >= 0.99).sum()))
    hits = {"blast": V.BLAST, "icon_land": V.ICON_LAND, "catch1": V.CATCH[0], "catch2": V.CATCH[1],
            "catch3_punch": V.CATCH[2], "review_stamp": V.RSTAMP, "cta_click": V.CLICK}
    rep["hits"] = []
    for name, fr in hits.items():
        h = fr / FPS
        now = x[int(h * 8000): int((h + 0.3) * 8000)]
        before = x[max(0, int((h - 0.6) * 8000)): int((h - 0.1) * 8000)]
        rep["hits"].append(dict(name=name, t=round(h, 2), dB=db(np.abs(now).max()), before_dB=db(np.abs(before).max())))
    # sheets: every 15 frames + every scene boundary
    frames_sheet(os.path.join(QA, "contact_sheet.png"), list(range(0, 450, 15)) + [449], 8, 180)
    bounds = [99, 100, 159, 160, 264, 265, 354, 355, 0, 449]
    frames_sheet(os.path.join(QA, "boundaries.png"), sorted(set(bounds)), 5, 216)
    # narration check with Whisper (skill step 8 tooling used as a verifier)
    try:
        import soundfile as sf
        from faster_whisper import WhisperModel
        wav = os.path.join(ROOT, "build", "asr16k.wav")
        sh(["ffmpeg", "-v", "error", "-y", "-i", MP4, "-ac", "1", "-ar", "16000", wav])
        audio, _ = sf.read(wav, dtype="float32")
        model = WhisperModel("base.en", device="cpu", compute_type="int8",
                             download_root=os.path.join(ROOT, "..", "..", "project", ".cache", "whisper"))
        segs, _ = model.transcribe(audio, beam_size=5, condition_on_previous_text=False)
        segs = list(segs)
        rep["asr_transcript"] = " ".join(s.text.strip() for s in segs)
        rep["asr_segments"] = [dict(start=round(s.start, 2), end=round(s.end, 2), text=s.text.strip()) for s in segs]
        norm = lambda z: " ".join("".join(c for c in z.lower() if c.isalnum() or c == " ").split())  # noqa: E731
        script = norm(" ".join(c["text"] for c in CUES))
        rep["asr_matches_script"] = norm(rep["asr_transcript"]) == script
        rep["script"] = " ".join(c["text"] for c in CUES)
    except Exception as e:  # pragma: no cover
        rep["asr_error"] = repr(e)
    json.dump(rep, open(os.path.join(QA, "check_report.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in rep.items() if k != "asr_segments"}, indent=1))


if __name__ == "__main__":
    main()
