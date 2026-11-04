"""QA for mello-30s-hindi04-01.mp4: ffprobe, full decode, loudness, motion, contact sheet,
shot-transition frames and a narration/caption timing table. Writes into ../qa/.

  python -I src/qa.py ../mello-30s-hindi04-01.mp4
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
ROUND = os.path.dirname(PROJECT)
QA = os.path.join(ROUND, "qa")
GEN = os.path.join(PROJECT, "generated")
W, H, FPS, NFR = 1080, 1920, 30, 900


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def frame_at(video, t, w=W, h=H):
    if t < 29.5:
        args = ["-ss", f"{t:.4f}", "-i", video, "-vf", f"scale={w}:{h}"]
    else:   # near the end: pick the exact frame index instead of seeking past the last pts
        n = min(NFR - 1, int(t * FPS))
        args = ["-ss", "29.0", "-i", video, "-vf", f"select=eq(n\\,{n - 870}),scale={w}:{h}"]
    r = subprocess.run(["ffmpeg", "-v", "error", *args, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True)
    return Image.frombytes("RGB", (w, h), r.stdout)


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    video = os.path.abspath(sys.argv[1])
    os.makedirs(os.path.join(QA, "frames"), exist_ok=True)
    rep = {"file": os.path.relpath(video, os.path.dirname(os.path.dirname(os.path.dirname(ROUND))))}

    # ---- ffprobe (with exact frame count)
    pr = run(["ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", video])
    probe = json.loads(pr.stdout)
    with open(os.path.join(QA, "ffprobe.json"), "w") as fh:
        json.dump(probe, fh, indent=2)
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    rep["video"] = dict(codec=v["codec_name"], profile=v.get("profile"), pix_fmt=v["pix_fmt"], width=v["width"], height=v["height"],
                        r_frame_rate=v["r_frame_rate"], avg_frame_rate=v["avg_frame_rate"], nb_read_frames=int(v["nb_read_frames"]),
                        duration=float(v["duration"]))
    rep["audio"] = dict(codec=a["codec_name"], profile=a.get("profile"), sample_rate=int(a["sample_rate"]), channels=a["channels"],
                        duration=float(a["duration"]))
    rep["container_duration"] = float(probe["format"]["duration"])
    checks = {
        "h264_yuv420p": v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p",
        "aac": a["codec_name"] == "aac",
        "1080x1920": (v["width"], v["height"]) == (W, H),
        "30fps": v["r_frame_rate"] == "30/1" and v["avg_frame_rate"] == "30/1",
        "900_frames": int(v["nb_read_frames"]) == NFR,
        "video_30.000s": abs(float(v["duration"]) - 30.0) < 1e-3,
        "audio_30.000s": abs(float(a["duration"]) - 30.0) < 0.022,
        "container_30.000s": abs(float(probe["format"]["duration"]) - 30.0) < 0.022,
    }

    # ---- full decode
    dec = run(["ffmpeg", "-v", "error", "-xerror", "-i", video, "-f", "null", "-"])
    with open(os.path.join(QA, "decode.txt"), "w") as fh:
        fh.write(f"cmd: ffmpeg -v error -xerror -i {os.path.basename(video)} -f null -\nreturncode: {dec.returncode}\nstderr: {dec.stderr.strip() or '(empty)'}\n")
    checks["full_decode_clean"] = dec.returncode == 0 and not dec.stderr.strip()

    # ---- loudness of the final file
    lo = run(["ffmpeg", "-hide_banner", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    i = lo.rfind("Integrated loudness:")
    rep["integrated_lufs"] = float(lo[i:].split("I:")[1].split("LUFS")[0])
    j = lo.rfind("True peak:")
    rep["true_peak_dbtp"] = float(lo[j:].split("Peak:")[1].split("dBFS")[0])
    checks["loudness_-16+-1"] = abs(rep["integrated_lufs"] + 16) <= 1.0
    checks["true_peak_below_-1"] = rep["true_peak_dbtp"] <= -1.0
    with open(os.path.join(GEN, "audio_stats.json")) as fh:
        rep["mix_stats"] = json.load(fh)

    # ---- motion: mean abs difference between consecutive frames, per second (anti-static check)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", "scale=135:240,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135).astype(np.int16)
    diffs = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    per_sec = [round(float(diffs[s * FPS:(s + 1) * FPS - 1].mean()), 3) for s in range(30)]
    rep["motion_mean_abs_diff_per_second"] = per_sec
    rep["frames_identical_to_previous"] = int((diffs == 0).sum())
    checks["moving_every_second"] = min(per_sec) > 0.02

    # ---- events / shots
    with open(os.path.join(GEN, "events.json")) as fh:
        ev = json.load(fh)
    S = ev["S"]
    cuts = [S["s2"], S["s3"], S["s4"], S["s5"]]
    # cut detection: the largest frame differences should sit exactly on the planned cuts
    # a planned cut must be the sharpest change within +/-5 frames and clearly larger than camera motion there
    rep["planned_cut_frames"] = [math.ceil(c * FPS - 1e-6) for c in cuts]   # first frame at/after the cut time
    rep["cut_frame_diff"], ok = [], True
    for f0 in rep["planned_cut_frames"]:
        win = diffs[max(0, f0 - 6):f0 + 5]
        peak = float(diffs[f0 - 1])
        rep["cut_frame_diff"].append(round(peak, 2))
        ok &= peak >= win.max() - 1e-9 and peak > 10
    rep["detected_cut_frames"] = [int(x) for x in sorted(np.argsort(diffs)[-4:] + 1)]
    rep["max_non_cut_frame_diff"] = round(float(np.delete(diffs, [f - 1 for f in rep["planned_cut_frames"]]).max()), 2)
    checks["cuts_on_plan"] = bool(ok)

    # ---- contact sheet: one frame per second
    cols, tw, th = 6, 180, 320
    sheet = Image.new("RGB", (cols * tw, 5 * (th + 24)), "white")
    d = ImageDraw.Draw(sheet)
    f = font(16)
    for s in range(30):
        im = frame_at(video, s + 0.5).resize((tw, th), Image.LANCZOS)
        x, y = (s % cols) * tw, (s // cols) * (th + 24)
        sheet.paste(im, (x, y + 24))
        d.text((x + 6, y + 4), f"{s + 0.5:.1f}s", fill="black", font=f)
    sheet.save(os.path.join(QA, "contact-sheet.jpg"), quality=88)

    # ---- transition frames: last frame before / first frame after each cut, at full resolution
    pairs = []
    for c in cuts:
        fa = math.ceil(c * FPS - 1e-6) - 1
        for fi in (fa, fa + 1):
            im = frame_at(video, fi / FPS - 0.001)   # accurate seek returns the first frame with pts >= t
            name = f"f{fi:03d}_t{fi / FPS:05.2f}.jpg"
            im.save(os.path.join(QA, "frames", name), quality=90)
            pairs.append((fi, im))
    tw2, th2 = 270, 480
    tr = Image.new("RGB", (len(pairs) * tw2, th2 + 26), "white")
    d = ImageDraw.Draw(tr)
    for k, (fi, im) in enumerate(pairs):
        tr.paste(im.resize((tw2, th2), Image.LANCZOS), (k * tw2, 26))
        d.text((k * tw2 + 6, 4), f"frame {fi} ({fi / FPS:.2f}s)", fill="black", font=f)
    tr.save(os.path.join(QA, "transitions.jpg"), quality=88)

    # ---- key beat frames
    T = ev["T"]
    beats = {"open_frame0": 0.0, "scrolling_intention": 1.6, "intention_dissolving": T["intentOut"] + 0.9,
             "plan_card_keywords": T["thenKey"] + 0.4, "plan_card_full": T["thenText"] + 1.2, "cue_plate": T["cue"] + 1.0,
             "action_shelf": T["placed"] + 0.15, "timer_writing": T["writeA"] + 1.0, "buzz_glance": T["buzz"] + 0.5,
             "cta_lockup": 28.5, "last_frame": 29.98}
    for k, t in beats.items():
        frame_at(video, t).save(os.path.join(QA, "frames", f"beat_{k}_t{t:05.2f}.jpg"), quality=90)

    # ---- narration / caption timing table
    with open(os.path.join(GEN, "timeline.json")) as fh:
        tl = json.load(fh)
    def shot_of(t):
        return 1 + sum(t >= c for c in cuts)
    lines = ["| line | narration | start | end | shot |", "|---|---|---|---|---|"]
    for ln in tl["lines"]:
        lines.append(f"| {ln['id']} | {ln['text']} | {ln['start']:.2f} | {ln['end']:.2f} | S{shot_of(ln['start'])} |")
    rep["narration_lines"] = len(tl["lines"])
    rep["narration_last_end"] = tl["lines"][-1]["end"]
    checks["cta_in_final_4s"] = tl["lines"][-1]["start"] >= 26.0 and tl["lines"][-1]["end"] <= 29.5
    with open(os.path.join(QA, "narration-timing.md"), "w") as fh:
        fh.write("# Narration timing (measured from the placed Kokoro takes)\n\n"
                 f"Voice: {tl['voice_mix']}, lang {tl['lang']}, speed {tl['speed']}.\n\n" + "\n".join(lines) + "\n\n"
                 "Shot cuts (s): " + ", ".join(f"{c:.2f}" for c in cuts) + "\n\n"
                 "Scene beats from generated/events.json (s):\n\n" + "\n".join(f"- {k}: {v:.3f}" if not isinstance(v, list) else f"- {k}: " + ", ".join(f"{x:.3f}" for x in v) for k, v in T.items()) + "\n")

    # ---- audio picture: waveform (top), log-frequency spectrogram (bottom), narration lines and cuts marked
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "24000", "-f", "f32le", "-"],
                         capture_output=True).stdout
    x = np.frombuffer(pcm, np.float32)
    PW, WH, SH = 1500, 160, 360
    img = Image.new("RGB", (PW, WH + SH + 40), "white")
    d = ImageDraw.Draw(img)
    spp = len(x) / PW
    for px in range(PW):
        seg = x[int(px * spp):int((px + 1) * spp)]
        if len(seg):
            d.line([(px, WH / 2 - seg.max() * WH / 2), (px, WH / 2 - seg.min() * WH / 2)], fill=(60, 50, 110))
    nfft, hop = 2048, int(len(x) / PW)
    win = np.hanning(nfft)
    freqs = np.fft.rfftfreq(nfft, 1 / 24000)
    rows = np.geomspace(40, 11000, SH)
    idx = np.searchsorted(freqs, rows)
    spec = np.zeros((SH, PW))
    for px in range(PW):
        seg = x[px * hop:px * hop + nfft]
        if len(seg) < nfft:
            seg = np.pad(seg, (0, nfft - len(seg)))
        mag = np.abs(np.fft.rfft(seg * win))
        spec[:, px] = 20 * np.log10(mag[idx] + 1e-6)
    spec = np.clip((spec - spec.max() + 90) / 90, 0, 1)[::-1]
    simg = Image.fromarray((255 - spec * 255).astype(np.uint8)).convert("RGB")
    img.paste(simg, (0, WH + 20))
    for ln in tl["lines"]:
        a0, a1 = ln["start"] / 30 * PW, ln["end"] / 30 * PW
        d.rectangle([a0, WH + 4, a1, WH + 14], fill=(217, 188, 245))
    for c in cuts:
        d.line([(c / 30 * PW, 0), (c / 30 * PW, WH + SH + 40)], fill=(230, 80, 60))
    img.save(os.path.join(QA, "audio.png"))

    layout_path = os.path.join(QA, "layout.json")
    if os.path.exists(layout_path):
        with open(layout_path) as fh:
            lay = json.load(fh)
        rep["layout_samples"] = len(lay["rows"])
        rep["layout_issues"] = lay["issues"]
        checks["safe_zones"] = not lay["issues"]
    asr_path = os.path.join(QA, "asr.json")
    if os.path.exists(asr_path):
        with open(asr_path) as fh:
            asr = json.load(fh)
        rep["asr_hindi_cer"] = asr.get("cer")
        rep["asr_hindi_wer"] = asr.get("wer")
        checks["asr_hindi_cer_<=0.08"] = asr.get("cer", 1) <= 0.08
    rep["checks"] = checks
    rep["all_passed"] = all(checks.values())
    with open(os.path.join(QA, "qa-report.json"), "w") as fh:
        json.dump(rep, fh, indent=2)
    print(json.dumps({"checks": checks, "lufs": rep["integrated_lufs"], "tp": rep["true_peak_dbtp"],
                      "cuts": rep["detected_cut_frames"], "min_motion": min(per_sec)}, indent=1))


if __name__ == "__main__":
    main()
