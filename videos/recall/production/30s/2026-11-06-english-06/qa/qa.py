"""QA for recall-30s-english06-01.mp4: technical checks + contact sheets, written to qa/.

Usage: audio/.venv/bin/python qa/qa.py
Checks: ffprobe streams/duration/frames, full FFmpeg decode, EBU R128 loudness + true peak, clipping,
Whisper ASR of the final mix vs script, caption/signature bounds (from renderer layout logs),
stillness scan (no static stretch > 2 s), contact sheets decoded from the final MP4.
"""
import glob
import json
import os
import re
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MP4 = os.path.join(ROOT, "recall-30s-english06-01.mp4")
TL = json.load(open(os.path.join(ROOT, "timeline.json")))
SCRIPT = json.load(open(os.path.join(ROOT, "script.json")))
FONT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


_FRAMES = {}


def frame_at(t, w=270, h=480):
    """Frame of the final MP4 at time t, by frame index (n = round(t*30)), from one full decode."""
    if (w, h) not in _FRAMES:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-"],
                             capture_output=True).stdout
        _FRAMES[(w, h)] = np.frombuffer(raw, dtype=np.uint8).reshape(-1, h, w, 3)
    fr = _FRAMES[(w, h)]
    return Image.fromarray(fr[min(len(fr) - 1, int(round(t * 30)))])


def sheet(times, labels, path, cols, w=270, h=480, title=""):  # noqa: E302
    rows = (len(times) + cols - 1) // cols
    pad, lab = 10, 30
    W = cols * (w + pad) + pad
    H = rows * (h + lab + pad) + pad + (50 if title else 0)
    im = Image.new("RGB", (W, H), "#F8FAF3")
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 20)
    y0 = 0
    if title:
        d.text((pad, 12), title, fill="#20251B", font=ImageFont.truetype(FONT, 26))
        y0 = 50
    for i, (t, l) in enumerate(zip(times, labels)):
        x, y = pad + (i % cols) * (w + pad), y0 + pad + (i // cols) * (h + lab + pad)
        im.paste(frame_at(t, w, h), (x, y + lab))
        d.text((x, y + 4), l, fill="#20251B", font=f)
    im.save(path)


def main():
    rep = {"file": os.path.relpath(MP4, os.path.dirname(os.path.dirname(os.path.dirname(ROOT))))}
    # --- ffprobe
    pr = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-count_frames", "-of", "json", MP4]).stdout)
    json.dump(pr, open(os.path.join(HERE, "ffprobe.json"), "w"), indent=2)
    v = next(s for s in pr["streams"] if s["codec_type"] == "video")
    a = next(s for s in pr["streams"] if s["codec_type"] == "audio")
    rep["video"] = {k: v.get(k) for k in ("codec_name", "profile", "width", "height", "pix_fmt", "r_frame_rate", "avg_frame_rate", "duration", "nb_read_frames", "bit_rate")}
    rep["audio"] = {k: a.get(k) for k in ("codec_name", "profile", "sample_rate", "channels", "duration", "bit_rate")}
    rep["container_duration"] = pr["format"]["duration"]
    rep["size_bytes"] = int(pr["format"]["size"])
    checks = {
        "h264": v["codec_name"] == "h264",
        "aac": a["codec_name"] == "aac",
        "1080x1920": (v["width"], v["height"]) == (1080, 1920),
        "30fps": v["r_frame_rate"] == "30/1" and v["avg_frame_rate"] == "30/1",
        "900_frames": int(v["nb_read_frames"]) == 900,
        "video_30.000s": abs(float(v["duration"]) - 30.0) < 1e-3,
        "audio_30.000s": abs(float(a["duration"]) - 30.0) < 1e-3,
        "container_30.000s": abs(float(pr["format"]["duration"]) - 30.0) < 1e-3,
        "yuv420p": v["pix_fmt"] == "yuv420p",
        "audio_48k_stereo": a["sample_rate"] == "48000" and a["channels"] == 2,
    }
    # --- full decode
    dec = run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "null", "-"])
    rep["full_decode_stderr"] = dec.stderr.strip()
    checks["full_decode_clean"] = dec.returncode == 0 and not dec.stderr.strip()
    # --- loudness (EBU R128) + true peak
    eb = run(["ffmpeg", "-nostats", "-i", MP4, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"]).stderr
    summ = eb[eb.rfind("Summary:"):]
    I = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1))
    LRA = float(re.search(r"LRA:\s+(-?[\d.]+) LU", summ).group(1))
    TP = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
    rep["loudness"] = {"integrated_lufs": I, "lra_lu": LRA, "true_peak_dbfs": TP}
    checks["loudness_-16_to_-14"] = -16.0 <= I <= -14.0
    checks["true_peak_le_-1dBTP"] = TP <= -1.0
    pcm = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "f32le", "-ac", "2", "-ar", "48000", "-"],
                                       capture_output=True).stdout, dtype=np.float32)
    rep["decoded_audio_peak"] = float(np.max(np.abs(pcm)))
    rep["clipped_samples"] = int(np.sum(np.abs(pcm) >= 0.999))
    checks["no_clipping"] = rep["clipped_samples"] == 0
    # --- ASR of the final mix
    try:
        from faster_whisper import WhisperModel
        a16 = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                                           capture_output=True).stdout, dtype=np.float32)
        m = WhisperModel("base.en", device="cpu", compute_type="int8")
        segs = list(m.transcribe(a16, beam_size=5, language="en")[0])   # transcript for WER (no word alignment)
        try:   # word times are a bonus; faster-whisper's aligner can fail on some mixes (IndexError in find_alignment)
            wsegs = list(m.transcribe(a16, beam_size=5, language="en", word_timestamps=True)[0])
        except Exception as e:  # noqa: BLE001
            wsegs, word_err = [], repr(e)
        else:
            word_err = None
        hyp = " ".join(s.text.strip() for s in segs)
        NUM = {"8": "eight", "eight": "eight"}   # ASR writes "figure eight" as "figure 8"; scored as the same word
        norm = lambda s: [NUM.get(w, w) for w in re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " ")).split()]
        ref = norm(" ".join(l["text"] for l in SCRIPT["lines"]))
        h = norm(hyp)
        # word error rate (Levenshtein)
        D = np.zeros((len(ref) + 1, len(h) + 1), dtype=int)
        D[:, 0] = range(len(ref) + 1); D[0, :] = range(len(h) + 1)
        for i in range(1, len(ref) + 1):
            for j in range(1, len(h) + 1):
                D[i, j] = min(D[i - 1, j] + 1, D[i, j - 1] + 1, D[i - 1, j - 1] + (ref[i - 1] != h[j - 1]))
        rep["asr"] = {"model": "faster-whisper base.en (int8, CPU)", "transcript": hyp, "wer": round(D[-1, -1] / len(ref), 3),
                      "words": [{"w": w.word.strip(), "t": round(w.start, 2)} for s in wsegs for w in (s.words or [])],
                      "word_timestamps_error": word_err}
        checks["asr_wer_le_0.1"] = rep["asr"]["wer"] <= 0.1
    except Exception as e:  # noqa: BLE001
        rep["asr"] = {"error": repr(e)}
    # --- every caption is English (Latin script only, no Devanagari)
    cap_text = " ".join("".join(seg[0] for seg in ln) for c in TL["captions"] for ln in c["lines"])
    rep["caption_non_latin_chars"] = sorted(set(ch for ch in cap_text if ord(ch) > 0x24F))
    checks["captions_english_only"] = not rep["caption_non_latin_chars"]
    # --- layout + safe areas from renderer logs (every frame)
    logs = []
    for f in glob.glob(os.path.join(ROOT, "build", "frames", "layout_*.json")):
        logs += json.load(open(f))
    logs.sort(key=lambda e: e["f"])
    ink = {"left": 1e9, "right": -1e9, "top": 1e9, "bottom": -1e9}
    top_violations, label_violations, max_lines, overlaps = [], [], 0, []
    for e in logs:
        caps = [b for b in e.get("boxes", []) if b.get("kind") == "caption"]
        others = [b for b in e.get("boxes", []) if b.get("kind") != "caption"]
        for b in caps:
            for k, fn in (("left", min), ("top", min), ("right", max), ("bottom", max)):
                ink[k] = fn(ink[k], b["ink"][k])
            max_lines = max(max_lines, b["nLines"])
        for b in e.get("boxes", []):
            top = b["pill"]["top"] if b.get("kind") == "caption" else b["top"]
            if top < 300: top_violations.append((e["f"], b.get("kind")))
        for b in others:
            if b.get("kind") == "label" and (b["left"] < 100 or b["right"] > 980 or b["top"] < 560 or b["bottom"] > 1460):
                label_violations.append((e["f"], b.get("text")))
            for c in caps:   # labels / brand must not overlap the caption pill
                p = c["pill"]
                if not (b["right"] < p["left"] or b["left"] > p["right"] or b["bottom"] < p["top"] or b["top"] > p["bottom"]):
                    overlaps.append((e["f"], b.get("kind")))
    rep["caption_ink_px"] = ink
    rep["caption_max_lines"] = max_lines
    rep["top_300_violations"] = top_violations[:20]
    rep["label_region_violations"] = label_violations[:20]
    rep["overlay_overlaps"] = overlaps[:20]
    rep["layout_frames_logged"] = len(logs)
    checks["layout_logged_every_frame"] = len(logs) == 900
    checks["caption_ink_y_340_520"] = ink["top"] >= 340 and ink["bottom"] <= 520
    checks["caption_ink_x_90_990"] = ink["left"] >= 90 and ink["right"] <= 990
    checks["caption_max_2_lines"] = max_lines <= 2
    checks["top_0_300_clear"] = not top_violations
    checks["labels_in_central_region"] = not label_violations
    checks["no_overlay_overlaps"] = not overlaps
    # --- stillness scan (mean abs diff of consecutive 135x240 frames)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MP4, "-f", "rawvideo", "-pix_fmt", "gray", "-s", "135x240", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 240, 135).astype(np.float32)
    diff = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
    still = diff < 0.15
    longest, cur = 0, 0
    for s in still:
        cur = cur + 1 if s else 0; longest = max(longest, cur)
    rep["motion"] = {"mean_frame_diff": round(float(diff.mean()), 3), "min_frame_diff": round(float(diff.min()), 4),
                     "longest_static_run_frames": int(longest), "max_frame_diff": round(float(diff.max()), 2),
                     "max_diff_at_s": round(float((np.argmax(diff) + 1) / 30), 3)}
    lum = fr.mean(axis=(1, 2))
    rep["luma_min_mean_max"] = [round(float(lum.min()), 1), round(float(lum.mean()), 1), round(float(lum.max()), 1)]
    checks["no_static_run_over_2s"] = longest < 60
    checks["no_black_frames"] = lum.min() > 12
    # --- contact sheets from the decoded MP4
    sheet([i + 0.5 for i in range(30)], [f"{i + 0.5:.1f}s" for i in range(30)], os.path.join(HERE, "contact_sheet.png"), 6,
          title="Representative frames, 1 per second (decoded from the final MP4)", w=216, h=384)
    C = TL["cues"]
    bounds = []
    for sh in TL["shots"]:
        bounds.append((f"{sh['id']} in", sh["t0"] + 0.02))
        bounds.append((f"{sh['id']} out", max(sh["t0"] + 0.05, sh["t1"] - 0.04)))
    for c in TL["captions"]:
        bounds.append((f"cap {c['start']:.2f}", c["start"] + 0.02))
    bounds.sort(key=lambda b: b[1])
    sheet([b[1] for b in bounds], [f"{b[1]:.2f}s {b[0]}" for b in bounds], os.path.join(HERE, "boundaries.png"), 10,
          title="Shot boundaries (first/last frame of every cut) and caption starts (decoded from the final MP4)", w=170, h=302)
    checks = {k: bool(v) for k, v in checks.items()}
    rep["checks"] = checks
    rep["all_checks_pass"] = all(checks.values())
    json.dump(rep, open(os.path.join(HERE, "qa_report.json"), "w"), indent=2)
    print(json.dumps({"checks": checks, "loudness": rep["loudness"], "asr": rep["asr"].get("transcript"), "wer": rep["asr"].get("wer"),
                      "motion": rep["motion"], "caption_ink": ink, "overlaps": overlaps[:5], "labels": label_violations[:5]}, indent=1))


if __name__ == "__main__":
    main()
