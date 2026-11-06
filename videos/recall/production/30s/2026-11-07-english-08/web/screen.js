// Screen artwork (original, minimal; no real phone's or TV's interface):
//  - drawPreview: the phone's selfie-camera view of the remote's tip; when the LED emits infrared the camera shows a
//    violet-white flash (false colour as cameras render it); a dark tip when nothing is sent.
//  - drawTV: a calm low-poly landscape with a lime volume bar when a command arrives.
import { PAL, IRC } from './lowpoly.js';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** s: { glow 0/1, held 0/1, dead 0/1, ok 0..1 } */
export function drawPreview(ctx, W, H, s) {
  const g = ctx, k = W / 540;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  const w = 540, h = 1140;
  const bg = g.createLinearGradient(0, 70, 0, 900); bg.addColorStop(0, '#B89070'); bg.addColorStop(1, '#5E4636');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,226,176,0.35)'; g.beginPath(); g.ellipse(120, 260, 140, 110, 0, 0, Math.PI * 2); g.fill();   // blurred window glow
  g.fillStyle = 'rgba(32,37,27,0.25)'; g.beginPath(); g.ellipse(420, 380, 120, 160, 0, 0, Math.PI * 2); g.fill();
  // the remote seen nose-on: tapered body coming toward the lens, LED dome at the tip
  const cx = 270, cy = 560;
  g.fillStyle = '#23271F'; g.beginPath(); g.moveTo(cx - 74, cy - 34); g.lineTo(cx + 74, cy - 34); g.lineTo(cx + 150, 900); g.lineTo(cx - 150, 900); g.closePath(); g.fill();
  rr(g, cx - 86, cy - 44, 172, 74, 26); g.fillStyle = '#2E332A'; g.fill();
  g.fillStyle = '#4A5045'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx - 60 + i * 60, 700, 14, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = PAL.lime; g.beginPath(); g.arc(cx, 780, 18, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#3A1C26'; g.beginPath(); g.arc(cx, cy - 6, 22, 0, Math.PI * 2); g.fill();
  if (s.glow) {   // the camera sees the infrared flash
    const gr = g.createRadialGradient(cx, cy - 6, 4, cx, cy - 6, 190);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(236,214,255,0.95)'); gr.addColorStop(0.45, 'rgba(192,138,240,0.55)'); gr.addColorStop(1, 'rgba(192,138,240,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy - 6, 190, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(245,235,255,0.75)'; g.lineWidth = 5;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 40, cy - 6 + Math.sin(a) * 40); g.lineTo(cx + Math.cos(a) * 120, cy - 6 + Math.sin(a) * 120); g.stroke(); }
  }
  // camera UI
  g.fillStyle = 'rgba(12,14,10,0.92)'; g.fillRect(0, 0, w, 70); g.fillRect(0, 930, w, 210);
  g.fillStyle = PAL.paper; g.beginPath(); g.arc(270, 1030, 52, 0, Math.PI * 2); g.fill();
  g.lineWidth = 6; g.strokeStyle = '#12160F'; g.beginPath(); g.arc(270, 1030, 44, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = PAL.paper; g.lineWidth = 5; g.beginPath(); g.arc(440, 1030, 26, 0.6, Math.PI * 1.8); g.stroke();
  rr(g, 70, 1006, 48, 48, 10); g.fillStyle = '#5E4636'; g.fill();
  g.fillStyle = PAL.lime; g.beginPath(); g.arc(270, 36, 8, 0, Math.PI * 2); g.fill();
  if (s.ok > 0.01) {
    g.globalAlpha = s.ok; g.fillStyle = PAL.lime; g.beginPath(); g.arc(cx + 150, cy - 130, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + 133, cy - 130); g.lineTo(cx + 145, cy - 117); g.lineTo(cx + 168, cy - 144); g.stroke(); g.globalAlpha = 1;
  }
  g.restore();
}

/** s: { show 0/1, level 0..10 } on a 512x320 canvas */
export function drawTV(ctx, s) {
  const g = ctx;
  const sky = g.createLinearGradient(0, 0, 0, 320); sky.addColorStop(0, '#7FB2C9'); sky.addColorStop(1, '#E9D6A6');
  g.fillStyle = sky; g.fillRect(0, 0, 512, 320);
  g.fillStyle = '#F4E3B5'; g.beginPath(); g.arc(380, 92, 34, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6F8A4E'; g.beginPath(); g.moveTo(0, 250); g.lineTo(120, 170); g.lineTo(230, 230); g.lineTo(340, 150); g.lineTo(512, 240); g.lineTo(512, 320); g.lineTo(0, 320); g.closePath(); g.fill();
  g.fillStyle = '#88A35E'; g.beginPath(); g.moveTo(0, 290); g.lineTo(160, 240); g.lineTo(300, 280); g.lineTo(512, 250); g.lineTo(512, 320); g.lineTo(0, 320); g.closePath(); g.fill();
  if (s.show) {
    rr(g, 96, 238, 320, 44, 14); g.fillStyle = 'rgba(20,24,16,0.85)'; g.fill();
    for (let i = 0; i < 10; i++) { rr(g, 112 + i * 30, 250, 22, 20, 5); g.fillStyle = i < s.level ? PAL.lime : 'rgba(248,250,243,0.25)'; g.fill(); }
  }
}
