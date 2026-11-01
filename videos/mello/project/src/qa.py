"""QA artefacts for videos/mello/output/mello-30s.mp4.

Writes into videos/mello/output/qa/:
  ffprobe.json, decode.txt, contact-sheet.jpg, frames/*.jpg (scene boundaries),
  motion.json (per-second frame-difference energy), audio-report.json, audio.png, sync.md
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import FONTS, GEN, OUTPUT, load_timeline  # noqa: E402

VIDEO = os.path.join(OUTPUT, "mello-30s.mp4")
QA = os.path.join(OUTPUT, "qa")
FR = os.path.join(QA, "frames")
BOUNDARIES = [0.0, 1.0, 1.97, 2.03, 5.82, 7.97, 8.03, 8.3, 8.95, 9.6, 10.4, 11.0, 13.6, 16.2, 18.6, 20.97, 21.23,
              22.98, 24.36, 25.37, 25.43, 26.2, 26.6, 27.4, 29.95]


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def label_font(size):
    return ImageFont.truetype(os.path.join(FONTS, "Nunito-800.ttf"), size)


def main():
    os.makedirs(FR, exist_ok=True)
    report = {}
    # ---- ffprobe
    pr = run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-count_frames", "-of", "json", VIDEO])
    probe = json.loads(pr.stdout)
    with open(os.path.join(QA, "ffprobe.json"), "w") as fh:
        json.dump(probe, fh, indent=2)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    report["video"] = dict(codec=v["codec_name"], profile=v.get("profile"), width=v["width"], height=v["height"],
                           fps=v["r_frame_rate"], pix_fmt=v["pix_fmt"], frames=int(v["nb_read_frames"]),
                           duration=float(v["duration"]))
    report["audio"] = dict(codec=a["codec_name"], sample_rate=int(a["sample_rate"]), channels=a["channels"],
                           duration=float(a["duration"]))
    report["container_duration"] = float(probe["format"]["duration"])
    # ---- full decode
    dec = run(["ffmpeg", "-v", "error", "-xerror", "-i", VIDEO, "-f", "null", "-"])
    with open(os.path.join(QA, "decode.txt"), "w") as fh:
        fh.write(f"command: ffmpeg -v error -xerror -i output/mello-30s.mp4 -f null -\n")
        fh.write(f"return code: {dec.returncode}\nstderr: {dec.stderr.strip() or '(empty: no decode errors)'}\n")
    report["full_decode_ok"] = dec.returncode == 0 and not dec.stderr.strip()
    # ---- low-res decode for motion + contact sheet
    w, h = 216, 384
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", VIDEO, "-vf", f"scale={w}:{h}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    fsz = w * h * 3
    prev = None
    diffs, thumbs = [], {}
    k = 0
    while True:
        buf = p.stdout.read(fsz)
        if len(buf) < fsz:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(h, w, 3)
        if prev is not None:
            diffs.append(float(np.abs(fr.astype(np.int16) - prev.astype(np.int16)).mean()))
        prev = fr
        if k % 30 == 15:
            thumbs[k] = fr.copy()
        k += 1
    p.wait()
    diffs = np.array(diffs)
    per_sec = [round(float(diffs[max(0, s * 30 - 1):(s + 1) * 30 - 1].mean()), 3) for s in range(30)]
    report["motion"] = dict(decoded_frames=k, mean_abs_diff_per_second=per_sec,
                            min_second=int(np.argmin(per_sec)), min_value=min(per_sec),
                            frames_with_zero_change=int((diffs < 0.02).sum()))
    with open(os.path.join(QA, "motion.json"), "w") as fh:
        json.dump(report["motion"], fh, indent=2)
    # contact sheet: one frame from the middle of every second
    cols, rows = 6, 5
    lab = 34
    sheet = Image.new("RGB", (cols * w, rows * (h + lab)), (24, 20, 44))
    dr = ImageDraw.Draw(sheet)
    f = label_font(22)
    for i, (fi, fr) in enumerate(sorted(thumbs.items())):
        x, y = (i % cols) * w, (i // cols) * (h + lab)
        sheet.paste(Image.fromarray(fr), (x, y + lab))
        dr.text((x + 8, y + 5), f"{fi / 30:05.2f}s  f{fi}", fill=(244, 239, 230), font=f)
    sheet.save(os.path.join(QA, "contact-sheet.jpg"), quality=88)
    # ---- full-res boundary frames
    for t in BOUNDARIES:
        out = os.path.join(FR, f"t{t:05.2f}.jpg")
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", VIDEO, "-frames:v", "1", "-q:v", "3", out])
    # boundary grid
    imgs = [Image.open(os.path.join(FR, f"t{t:05.2f}.jpg")).resize((w, h)) for t in BOUNDARIES]
    cols = 5
    rows = math.ceil(len(imgs) / cols)
    g = Image.new("RGB", (cols * w, rows * (h + lab)), (24, 20, 44))
    dr = ImageDraw.Draw(g)
    for i, (t, im) in enumerate(zip(BOUNDARIES, imgs)):
        x, y = (i % cols) * w, (i // cols) * (h + lab)
        g.paste(im, (x, y + lab))
        dr.text((x + 8, y + 5), f"{t:05.2f}s", fill=(244, 239, 230), font=f)
    g.save(os.path.join(QA, "boundary-frames.jpg"), quality=88)
    # ---- audio
    wav = os.path.join(GEN, "_qa_audio.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_f32le", wav])
    import soundfile as sf
    x, sr = sf.read(wav, dtype="float64")
    os.remove(wav)
    mono = x.mean(1)
    rms = [20 * math.log10(max(1e-9, float(np.sqrt((mono[s * sr:(s + 1) * sr] ** 2).mean())))) for s in range(30)]
    eb = run(["ffmpeg", "-hide_banner", "-nostats", "-i", VIDEO, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    i = eb.rfind("Integrated loudness:")
    lufs = float(eb[i:].split("I:")[1].split("LUFS")[0])
    j = eb.rfind("True peak:")
    tp = float(eb[j:].split("Peak:")[1].split("dBFS")[0])
    report["audio_levels"] = dict(integrated_lufs=lufs, true_peak_dbtp=tp, sample_peak=round(float(np.abs(x).max()), 4),
                                  samples_at_or_above_0dbfs=int((np.abs(x) >= 1.0).sum()),
                                  rms_dbfs_per_second=[round(r, 1) for r in rms],
                                  silent_seconds=[s for s, r in enumerate(rms) if r < -50])
    # waveform + spectrogram picture
    W2, H2 = 1800, 520
    im = Image.new("RGB", (W2, H2), (17, 13, 37))
    d2 = ImageDraw.Draw(im)
    step = len(mono) // W2
    for px in range(W2):
        seg = mono[px * step:(px + 1) * step]
        pk = float(np.abs(seg).max()) if len(seg) else 0
        d2.line([(px, 130 - pk * 120), (px, 130 + pk * 120)], fill=(205, 184, 244))
    nfft, hop = 2048, 1024
    frames = 1 + (len(mono) - nfft) // hop
    win = np.hanning(nfft)
    spec = np.empty((frames, nfft // 2))
    for q in range(frames):
        seg = mono[q * hop:q * hop + nfft] * win
        spec[q] = 20 * np.log10(np.abs(np.fft.rfft(seg))[:nfft // 2] / (nfft / 4) + 1e-9)
    spec = np.clip((spec + 90) / 80, 0, 1)
    fbins = np.geomspace(1, nfft // 2 - 1, 250).astype(int)
    sp = spec[:, fbins].T[::-1]
    spi = Image.fromarray((np.stack([sp * 247, sp * 197, 72 + sp * 0], 2)).astype(np.uint8)).resize((W2, 250))
    im.paste(spi, (0, 268))
    for s in range(0, 31, 5):
        d2.line([(s * W2 / 30, 0), (s * W2 / 30, H2)], fill=(80, 70, 130))
        d2.text((s * W2 / 30 + 4, 4), f"{s}s", fill=(244, 239, 230), font=label_font(18))
    im.save(os.path.join(QA, "audio.png"))
    # ---- caption / narration sync table
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from render import CAPTIONS, CHIPS
    tl = load_timeline()
    order = ["hook", "tangle", "tangle", "pause", "in1", "out1", "in2", "out2"]
    lines = ["| Narration line | VO start–end (s) | Caption on screen | Caption in–out (s) |", "|---|---|---|---|"]
    for (txt, tin, tout), lid in zip(CAPTIONS, order):
        ln = tl[lid]
        lines.append(f"| {ln['text']} | {ln['start']:.2f}–{ln['end']:.2f} | {txt.replace('*', '')} | {max(tin, 0):.2f}–{tout:.2f} |")
    for txt, lid in CHIPS:
        ln = tl[lid]
        lines.append(f"| {ln['text']} | {ln['start']:.2f}–{ln['end']:.2f} | chip: {txt} | {ln['start'] - 0.05:.2f}–25.70 |")
    for lid, txt in (("brand", "Mello wordmark"), ("cta", "Explore on Google Play pill")):
        ln = tl[lid]
        lines.append(f"| {ln['text']} | {ln['start']:.2f}–{ln['end']:.2f} | {txt} | {'26.25' if lid == 'brand' else '26.90'}–30.00 |")
    with open(os.path.join(QA, "sync.md"), "w") as fh:
        fh.write("\n".join(lines) + "\n")
    with open(os.path.join(QA, "qa-report.json"), "w") as fh:
        json.dump(report, fh, indent=2)
    print(json.dumps({k: report[k] for k in ("video", "audio", "full_decode_ok")}, indent=1))
    print("motion min/s:", report["motion"]["min_value"], "at", report["motion"]["min_second"],
          "| zero-change frames:", report["motion"]["frames_with_zero_change"])
    print("audio:", {k: v for k, v in report["audio_levels"].items() if k != "rms_dbfs_per_second"})


if __name__ == "__main__":
    main()
