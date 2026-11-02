#!/usr/bin/env python3
"""Contact sheet builder.

  contact.py stills <out.png> <cols> <img1> <img2> ...       (label = file stem)
  contact.py video  <out.png> <cols> <video.mp4> <t1> <t2> ... (frames decoded with ffmpeg)

Frames are decoded from the final MP4 (not from source renders) when using
`video` mode, so the sheet shows exactly what was delivered.
"""
import os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

FONT = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'


def font(sz):
    try:
        return ImageFont.truetype(FONT, sz)
    except OSError:
        return ImageFont.load_default()


def sheet(images, labels, out, cols, cell_w=270):
    ims = [Image.open(p).convert('RGB') for p in images]
    w0, h0 = ims[0].size
    cell_h = int(cell_w * h0 / w0)
    rows = (len(ims) + cols - 1) // cols
    pad, lab = 10, 30
    S = Image.new('RGB', (cols * (cell_w + pad) + pad, rows * (cell_h + lab + pad) + pad), (18, 13, 10))
    d = ImageDraw.Draw(S)
    f = font(20)
    for i, (im, l) in enumerate(zip(ims, labels)):
        r, c = divmod(i, cols)
        x = pad + c * (cell_w + pad); y = pad + r * (cell_h + lab + pad)
        S.paste(im.resize((cell_w, cell_h), Image.LANCZOS), (x, y + lab))
        d.text((x + 2, y + 4), l, fill=(255, 243, 224), font=f)
    S.save(out)
    print(out, S.size)


def main():
    mode, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3])
    if mode == 'stills':
        paths = sys.argv[4:]
        sheet(paths, [os.path.splitext(os.path.basename(p))[0] for p in paths], out, cols)
    else:
        video, times = sys.argv[4], sys.argv[5:]
        tmp = tempfile.mkdtemp()
        paths, labels = [], []
        for t in times:
            frame = round(float(t) * 30)
            p = os.path.join(tmp, f'f{frame:03d}.png')
            # frame-exact: decode and select frame index n (frame n covers [n/30, (n+1)/30))
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', f'select=eq(n\\,{frame})', '-fps_mode', 'passthrough',
                            '-frames:v', '1', p], check=True)
            paths.append(p); labels.append(f'f{frame}  t={frame / 30:.3f}s')
        sheet(paths, labels, out, cols)


if __name__ == '__main__':
    main()
