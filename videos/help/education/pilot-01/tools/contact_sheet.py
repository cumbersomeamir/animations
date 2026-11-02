"""Contact sheets for QA.

  python3 tools/contact_sheet.py stills <dir> <out.png> [cols]
      tiles every PNG in <dir> (labelled with frame/time)
  python3 tools/contact_sheet.py video <mp4> <out.png> <t1,t2,...> [cols] [title]
      extracts exact timestamps from the encoded MP4 with FFmpeg and tiles them
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"
FPS = 30


def tile(items, out, cols=4, thumb_w=270, title=None):
    ims = [(Image.open(p).convert("RGB"), label) for p, label in items]
    tw = thumb_w
    th = int(ims[0][0].height * tw / ims[0][0].width)
    rows = (len(ims) + cols - 1) // cols
    pad, lab, head = 10, 34, (56 if title else 0)
    sheet = Image.new("RGB", (cols * (tw + pad) + pad, head + rows * (th + lab + pad) + pad), (24, 26, 32))
    d = ImageDraw.Draw(sheet)
    f = ImageFont.truetype(FONT, 22)
    if title:
        d.text((pad, 14), title, fill=(247, 245, 239), font=ImageFont.truetype(FONT, 28))
    for i, (im, label) in enumerate(ims):
        r, c = divmod(i, cols)
        x, y = pad + c * (tw + pad), head + pad + r * (th + lab + pad)
        sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y))
        d.text((x + 4, y + th + 5), label, fill=(242, 194, 48), font=f)
    sheet.save(out)
    print("wrote", out, sheet.size)


def main():
    mode = sys.argv[1]
    if mode == "stills":
        d, out = Path(sys.argv[2]), sys.argv[3]
        cols = int(sys.argv[4]) if len(sys.argv) > 4 else 4
        files = sorted(d.glob("f*.png"))
        items = [(p, f"f{int(p.stem[1:])}  {int(p.stem[1:]) / FPS:.2f}s") for p in files]
        tile(items, out, cols)
    elif mode == "video":
        mp4, out, times = sys.argv[2], sys.argv[3], [float(x) for x in sys.argv[4].split(",")]
        cols = int(sys.argv[5]) if len(sys.argv) > 5 else 4
        title = sys.argv[6] if len(sys.argv) > 6 else None
        with tempfile.TemporaryDirectory() as td:
            items = []
            for i, t in enumerate(times):
                p = Path(td) / f"{i:03d}.png"
                # exact frame: select by decoded frame index n = round(t * fps)
                n = round(t * FPS)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-vf", f"select=eq(n\\,{n})", "-fps_mode", "passthrough", "-frames:v", "1", str(p)], check=True)
                items.append((p, f"f{n}  {n / FPS:.3f}s"))
            tile(items, out, cols, title=title)


if __name__ == "__main__":
    main()
