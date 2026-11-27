/* Courtlens · "Is this legal in India?" · Episode 25 (English, english-25, batch 25): flight cancelled — can the airline
 * force a voucher? Basis (DGCA, official PDFs from dgca.gov.in):
 *   CAR Section 3 Series M Part IV (Rev. 4, 25 Jan 2023, effective 15 Feb 2023):
 *     3.3.1 cancellation notified ≥ 24 h before: alternate flight or refund "as acceptable to the passenger"
 *     3.3.2 not so informed (< 24 h): alternate flight acceptable to the passenger, or compensation in addition to the
 *           full refund — INR 5,000 / 7,500 / 10,000 by block time (≤1 h / 1–2 h / >2 h) or one-way basic fare + fuel
 *           charge, whichever is less
 *     3.3.4 + 1.4/1.5 no compensation for extraordinary circumstances (incl. meteorological conditions)
 *     3.7.1 compensation in cash, by bank transfer, or travel vouchers only with the passenger's signed agreement
 *   CAR Section 3 Series M Part II, clause 3(f): holding the refund in a credit shell "shall be the prerogative of the
 *     passenger and not a default practice of the airline" (DGCA portal copy; final Feb 2026 text not retrieved)
 * Built on the english-24 engine (captions y≈280–460, chip y 478, pills y≈1418, crossfade windows). Frame zero = thumbnail.
 */
(function () {
  const W = 1080, H = 1920, CX = 500;            // visual centre follows the caption centre (x 100..900)
  const C = {
    paper: '#F4EEE2', paperDeep: '#E9E0CF', card: '#FFFDF8',
    navy: '#02193B', navySoft: 'rgba(2,25,59,0.62)', navyFaint: 'rgba(2,25,59,0.16)',
    cyan: '#12AAD3', cyanDark: '#0A7EA4', cyanMark: '#B4E3F1', cyanTint: '#D8EFF6',
    gold: '#D7A351', warm: '#F6D9A0',
    red: '#B5432F', redTint: '#F6DFD8', redDark: '#8E2F1F',
  };
  let TL, E, ICON, GRAIN;

  // ---------- math ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eo = x => 1 - Math.pow(1 - x, 3);
  const eob = (x, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  function spring(dt, f = 1.5, z = 0.55) {
    if (dt <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
  }
  const wobble = (dt, amp, f = 1.1, decay = 2.2) => (dt <= 0 ? 0 : amp * Math.exp(-dt * decay) * Math.sin(2 * Math.PI * f * dt));
  const L2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

  // ---------- drawing helpers ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function card(ctx, x, y, w, h, r, fill, o = {}) {
    ctx.save();
    ctx.shadowColor = o.shadow || 'rgba(2,25,59,0.16)';
    ctx.shadowBlur = o.blur ?? 40; ctx.shadowOffsetY = o.oy ?? 16;
    rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    ctx.restore();
    if (o.stroke) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 3; ctx.stroke(); }
  }
  function setFont(ctx, f, ls = 0) { ctx.font = f; ctx.letterSpacing = ls + 'px'; }
  function txt(ctx, s, x, y, o = {}) {
    ctx.save();
    setFont(ctx, o.f || '800 40px Inter', o.ls || 0);
    if (o.maxW) { let size = parseFloat(ctx.font.match(/(\d+(?:\.\d+)?)px/)[1]); while (ctx.measureText(s).width > o.maxW && size > 12) { size -= 1; setFont(ctx, (o.f || '800 40px Inter').replace(/\d+(?:\.\d+)?px/, size + 'px'), o.ls || 0); } }
    ctx.fillStyle = o.c || C.navy; ctx.textAlign = o.a || 'left'; ctx.textBaseline = 'alphabetic';
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.fillText(s, x, y);
    ctx.restore();
  }
  function check(ctx, x, y, s, color, lw = 6) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -9);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  function cross(ctx, x, y, s, color, lw = 6) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(9, 9); ctx.moveTo(9, -9); ctx.lineTo(-9, 9);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
  }
  function badge(ctx, x, y, k, ok, r = 34) {        // round tick / cross badge
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k * r / 34, k * r / 34);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ok ? C.cyan : C.red; ctx.fill(); ctx.restore();
    if (ok) check(ctx, 0, 1, 1.6, C.navy, 6); else cross(ctx, 0, 0, 1.3, '#FFF8EE', 7);
    ctx.restore();
  }

  // ---------- background with soft lighting ----------
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); const id = g.createImageData(W, H);
    let s = 20261117 >>> 0;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    for (let i = 0; i < W * H; i++) {
      const v = rnd(), dark = rnd() < 0.55;
      id.data[i * 4] = dark ? 70 : 255; id.data[i * 4 + 1] = dark ? 60 : 252; id.data[i * 4 + 2] = dark ? 45 : 244;
      id.data[i * 4 + 3] = Math.floor(v * v * 20);
    }
    g.putImageData(id, 0, 0);
    return c;
  }
  function background(ctx) {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(CX, 1040, 200, CX, 1040, 1250);
    g.addColorStop(0, 'rgba(255,252,245,0.6)'); g.addColorStop(1, 'rgba(196,178,148,0.36)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function grain(ctx) { ctx.drawImage(GRAIN, 0, 0); }
  function spotlight(ctx, cx, cy, r, a) {
    const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, r);
    g.addColorStop(0, `rgba(246,217,160,${0.55 * a})`); g.addColorStop(1, 'rgba(246,217,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function stampCard(ctx, cx, cy, k, kicker, title) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -400, -150, 800, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -370, -120, 740, 240, 20); ctx.stroke();
    txt(ctx, kicker, 0, -30, { f: '800 44px Inter', a: 'center', c: C.cyanDark, ls: 12 });
    txt(ctx, title, 0, 62, { f: '900 84px Inter', a: 'center', c: C.navy, ls: 2, maxW: 690 });
    ctx.restore();
  }
  function pill(ctx, s, x, y, k, o = {}) {                               // one short label per beat
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - eo(clamp(k))) * 30);
    const f = o.f || '900 66px Inter'; setFont(ctx, f, 2);
    const tw = ctx.measureText(s).width, w = tw + 80 + (o.icon ? 74 : 0), x0 = -w / 2;
    card(ctx, x0, -62, w, 98, 49, o.fill || C.card, { blur: 26, oy: 10, stroke: o.stroke, lw: 4 });
    txt(ctx, s, x0 + 40 + (o.icon ? 74 : 0), 12, { f, c: o.c || C.navy, ls: 2 });
    if (o.icon) badge(ctx, x0 + 64, -13, 1, o.icon === 'ok', 30);
    ctx.restore();
  }
  function chip(ctx, y, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a;
    setFont(ctx, '800 28px Inter', 3);
    const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2;
    rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.95)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
    ctx.restore();
  }

  function writtenNote(ctx, x, y, s, k, pen) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.03);
    card(ctx, -230, -150, 460, 300, 16, '#FFFFFF', { blur: 34, oy: 14 });
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = C.cyanTint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-190, -70 + i * 56); ctx.lineTo(190, -70 + i * 56); ctx.stroke(); }
    const segs = [[-180, -84, 260], [-180, -28, 330], [-180, 28, 220], [-180, 84, 150]];          // handwriting squiggles
    let total = k * segs.length, px = -180, py = -84;
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    segs.forEach(([x0, y0, len], i) => {
      const f = clamp(total - i); if (f <= 0) return;
      ctx.beginPath();
      for (let j = 0; j <= 40 * f; j++) { const xx = x0 + (len * j) / 40, yy = y0 + Math.sin(j * 1.3 + i) * 9 * Math.sin(j * 0.31 + i * 2); if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); px = xx; py = yy; }
      ctx.stroke();
    });
    if (pen > 0) {                                                                                     // the pen follows the line
      ctx.save(); ctx.globalAlpha *= pen; ctx.translate(px, py); ctx.rotate(-0.6);
      rr(ctx, 0, -12, 170, 24, 10); ctx.fillStyle = C.cyanDark; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-24, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = '#F1DDB4'; ctx.fill();
      ctx.beginPath(); ctx.arc(-20, 0, 4, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  // ---------- props ----------
  function floorShadow(ctx, x, y, rx, a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.17);
    const g = ctx.createRadialGradient(0, 0, 8, 0, 0, rx);
    g.addColorStop(0, `rgba(2,25,59,${0.26 * a})`); g.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function halo(ctx, x, y, r, a = 1, rgb = '18,170,211') {
    const g = ctx.createRadialGradient(x, y, 30, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${0.32 * a})`); g.addColorStop(0.6, `rgba(${rgb},${0.10 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 540, W, 1000);
  }
  function plane(ctx, x, y, s, rot = 0) {                        // a generic airliner silhouette (side view, nose right)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-300, -10); ctx.quadraticCurveTo(-300, -40, -250, -40); ctx.lineTo(220, -40);
    ctx.quadraticCurveTo(300, -40, 320, 0); ctx.quadraticCurveTo(300, 30, 230, 30); ctx.lineTo(-250, 30); ctx.quadraticCurveTo(-300, 30, -300, -10); ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(-250, -40); ctx.lineTo(-300, -150); ctx.lineTo(-250, -150); ctx.lineTo(-170, -40); ctx.closePath(); ctx.fill();   // tail
    ctx.beginPath(); ctx.moveTo(-40, 10); ctx.lineTo(-140, 110); ctx.lineTo(-90, 110); ctx.lineTo(60, 10); ctx.closePath(); ctx.fill();        // wing
    ctx.restore();
  }
  // a boarding pass (generic; no real airline). o.stamp (0..1 CANCELLED stamp), o.newFlight (label variant)
  function boardingPass(ctx, x, y, s, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
    rr(ctx, -280, -150, 560, 300, 24); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -280, -150, 560, 300, 24); ctx.clip(); ctx.fillStyle = C.navy; ctx.fillRect(-280, -150, 560, 70); ctx.restore();
    txt(ctx, 'BOARDING PASS', -250, -103, { f: '900 30px Inter', c: '#FFFFFF', ls: 4 });
    ctx.fillStyle = '#FFFFFF'; plane(ctx, 220, -114, 0.11);
    txt(ctx, 'DEL', -240, -10, { f: '900 76px Inter', c: C.navy });
    txt(ctx, 'BOM', 90, -10, { f: '900 76px Inter', c: C.navy });
    ctx.fillStyle = C.cyanDark; plane(ctx, 30, -36, 0.14);
    txt(ctx, o.newFlight ? 'FL 302 · 14:10' : 'FL 214 · 09:40', -240, 60, { f: '800 34px Inter', c: C.navySoft, ls: 2 });
    ctx.setLineDash([10, 10]); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150, -80); ctx.lineTo(150, 150); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 9; i++) { rr(ctx, 180 + (i % 3) * 26, 10 + Math.floor(i / 3) * 34, 16 + (i % 2) * 6, 26, 3); ctx.fillStyle = C.navy; ctx.fill(); }
    const st = o.stamp || 0;
    if (st > 0) {
      const k = st < 1 ? lerp(1.6, 1, eob(st, 1.2)) : 1;
      ctx.save(); ctx.translate(-40, 72); ctx.rotate(-0.12); ctx.scale(k, k); ctx.globalAlpha *= clamp(st * 4);
      rr(ctx, -215, -48, 430, 96, 14); ctx.fillStyle = 'rgba(255,253,248,0.82)'; ctx.fill(); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.stroke();
      txt(ctx, 'CANCELLED', 0, 22, { f: '900 62px Inter', a: 'center', c: C.red, ls: 4, maxW: 390 }); ctx.restore();
    }
    ctx.restore();
  }
  // the airline's voucher card (gold, generic). o.flip (0..1 turning over), o.glow
  function voucher(ctx, x, y, s, rot, o = {}) {
    const sx = Math.max(0.03, Math.abs(Math.cos(Math.PI * (o.flip || 0))));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * sx, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    const g = ctx.createLinearGradient(-230, -140, 230, 140); g.addColorStop(0, '#F6D9A0'); g.addColorStop(0.5, '#E9BE6E'); g.addColorStop(1, '#C9973F');
    rr(ctx, -230, -140, 460, 280, 24); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -230, -140, 460, 280, 24); ctx.clip();
    ctx.globalAlpha *= 0.25; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-230, 140); ctx.lineTo(-120, 140); ctx.lineTo(60, -140); ctx.lineTo(-50, -140); ctx.closePath(); ctx.fill(); ctx.restore();
    rr(ctx, -200, -110, 400, 220, 16); ctx.strokeStyle = 'rgba(110,70,20,0.45)'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, 'VOUCHER', 0, 28, { f: '900 84px Inter', a: 'center', c: C.navy, ls: 6 });
    ctx.fillStyle = C.navy; plane(ctx, 0, -66, 0.14);
    txt(ctx, 'FUTURE TRAVEL ONLY', 0, 86, { f: '800 26px Inter', a: 'center', c: 'rgba(2,25,59,0.65)', ls: 3 });
    ctx.restore();
  }
  function cash(ctx, x, y, s, rot = 0) {                           // refund money (a stack of notes)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    for (let i = 3; i >= 0; i--) { ctx.save(); ctx.translate(i * 5, -i * 14);
      ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.22)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      rr(ctx, -150, -70, 300, 140, 12); ctx.fillStyle = i % 2 ? '#BFD6B0' : '#CFE0C2'; ctx.fill(); ctx.restore();
      rr(ctx, -136, -56, 272, 112, 8); ctx.strokeStyle = 'rgba(2,25,59,0.25)'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
    txt(ctx, '₹', -76, 24, { f: '900 68px Inter', a: 'center', c: 'rgba(2,25,59,0.55)' });
    ctx.beginPath(); ctx.arc(64, 0, 38, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,25,59,0.12)'; ctx.fill();
    ctx.restore();
  }
  function optionCard(ctx, x, y, k, kind, lab, ok) {                // choice cards
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    card(ctx, -190, -230, 380, 460, 40, C.card, { blur: 40, oy: 16, stroke: ok > 0.5 ? C.cyan : null, lw: 8 });
    if (kind === 'flight') boardingPass(ctx, 0, -40, 0.58, -0.04, { newFlight: true });
    else cash(ctx, 0, -40, 0.85, 0.04);
    txt(ctx, lab, 0, 170, { f: '900 46px Inter', a: 'center', c: C.navy, ls: 2, maxW: 330 });
    ctx.restore();
    if (ok > 0) badge(ctx, x + 150 * k, y - 200 * k, ok, true, 40);
  }
  function toggle(ctx, x, y, s, on, glow) {                          // credit shell switch: off unless you turn it on
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 30, 0, 0, 300); g.addColorStop(0, `rgba(18,170,211,${0.3 * glow})`); g.addColorStop(1, 'rgba(18,170,211,0)'); ctx.fillStyle = g; ctx.fillRect(-320, -320, 640, 640); }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -200, -100, 400, 200, 100); ctx.fillStyle = on > 0.5 ? C.cyan : '#B9C0C9'; ctx.fill(); ctx.restore();
    const kx = lerp(-100, 100, eio(clamp(on)));
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(kx, 0, 82, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    ctx.restore();
  }
  function hand(ctx, x, y, s, press) {                               // a simple pointing finger (your tap)
    ctx.save(); ctx.translate(x, y + press * 18); ctx.scale(s, s);
    rr(ctx, -26, -10, 52, 150, 26); ctx.fillStyle = '#F1C9A5'; ctx.fill();
    rr(ctx, -70, 90, 140, 150, 50); ctx.fill();
    ctx.strokeStyle = 'rgba(122,82,48,0.35)'; ctx.lineWidth = 4; rr(ctx, -26, -10, 52, 150, 26); ctx.stroke();
    ctx.restore();
  }
  function clock(ctx, x, y, s, frac, danger) {                       // a 24-hour notice ring
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
    ctx.lineWidth = 34; ctx.strokeStyle = C.cyanTint; ctx.beginPath(); ctx.arc(0, 0, 160, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = danger > 0.5 ? C.red : C.cyan; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 160, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke();
    txt(ctx, danger > 0.5 ? '< 24h' : '24h', 0, 30, { f: '900 96px Inter', a: 'center', c: danger > 0.5 ? C.red : C.navy });
    ctx.restore();
  }
  function bars(ctx, x, y, k, t) {                                    // compensation by flight length: ₹5,000 / 7,500 / 10,000 caps
    const vals = [[5000, '₹5,000'], [7500, '₹7,500'], [10000, '₹10,000']];
    vals.forEach(([v, lab], i) => {
      const kk = clamp(spring(t - i * 0.18, 1.6, 0.6), 0, 1.1), h = 380 * (v / 10000) * kk, bx = x - 250 + i * 250;
      ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.22)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
      rr(ctx, bx - 70, y - h, 140, h, 18); ctx.fillStyle = i === 2 ? C.cyan : C.cyanDark; ctx.fill(); ctx.restore();
      if (kk > 0.3) txt(ctx, lab, bx, y - h - 22, { f: '900 46px Inter', a: 'center', c: C.navy, alpha: clamp((kk - 0.3) * 2) });
      ctx.save(); ctx.strokeStyle = C.navySoft; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.globalAlpha *= clamp(k * 2);   // flight length under each bar
      ctx.beginPath(); ctx.moveTo(bx - 20 - i * 20, y + 50); ctx.lineTo(bx + 20 + i * 20, y + 50); ctx.stroke();
      ctx.fillStyle = C.navySoft; plane(ctx, bx + 26 + i * 20, y + 50, 0.08); ctx.restore();
    });
  }
  function bankIcon(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -120, -120, 240, 240, 48, C.card, { blur: 30, oy: 12 });
    ctx.beginPath(); ctx.moveTo(-80, -30); ctx.lineTo(0, -80); ctx.lineTo(80, -30); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 4; i++) { rr(ctx, -62 + i * 36, -20, 18, 80, 4); ctx.fillStyle = C.navy; ctx.fill(); }
    rr(ctx, -84, 66, 168, 14, 4); ctx.fill();
    ctx.restore();
  }

  // ---------- the hook: an airport gate at dusk ----------
  function gate(ctx, t) {
    const L = 90, R = 910, T = 600, B = 1240;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    rr(ctx, L, T, R - L, B - T, 34); ctx.fillStyle = '#22324F'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, L + 18, T + 18, R - L - 36, B - T - 36, 22); ctx.clip();
    const sky = ctx.createLinearGradient(0, T, 0, B); sky.addColorStop(0, '#1B2C52'); sky.addColorStop(0.55, '#B5432F'); sky.addColorStop(0.75, '#E9BE6E'); sky.addColorStop(1, '#F6D9A0');
    ctx.fillStyle = sky; ctx.fillRect(L, T, R - L, B - T);
    ctx.fillStyle = 'rgba(2,25,59,0.55)'; ctx.fillRect(L, 1080, R - L, 200);                       // apron
    ctx.fillStyle = '#0B1A33'; plane(ctx, 560 + Math.sin(t * 0.4) * 4, 1030, 1.05);                 // parked plane silhouette
    for (let i = 1; i < 4; i++) { ctx.fillStyle = 'rgba(2,25,59,0.65)'; ctx.fillRect(L + i * ((R - L) / 4) - 6, T, 12, B - T); }   // window mullions
    ctx.restore();
    // departures screen (one row)
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    rr(ctx, 170, 650, 520, 120, 16); ctx.fillStyle = '#0B1220'; ctx.fill(); ctx.restore();
    txt(ctx, 'FL 214  BOM', 196, 724, { f: '900 40px Inter', c: '#F6D9A0', ls: 1 });
    const blink = 0.65 + 0.35 * Math.cos(t * 6);
    rr(ctx, 488, 682, 186, 56, 10); ctx.fillStyle = `rgba(181,67,47,${blink})`; ctx.fill();
    txt(ctx, 'CANCELLED', 581, 721, { f: '900 28px Inter', a: 'center', c: '#FFF4DF', ls: 1 });
  }

  // ---------- scene windows (crossfades) ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {
    const i = a <= 0 ? 1 : eo(P(t, a - 0.18, a + fin - 0.18)), o = 1 - eio(P(t, b - fout, b));
    return { a: Math.min(i, o), i, o };
  }
  function withScene(ctx, w, fn, push = 0, zoomIn = 0.94, zoomOut = 1.05) {
    if (w.a <= 0.001) return;
    const s = (w.i < 1 ? lerp(zoomIn, 1, w.i) : lerp(zoomOut, 1, w.o)) * (1 + push);
    ctx.save(); ctx.globalAlpha = w.a;
    ctx.translate(CX, 1000); ctx.scale(s, s); ctx.translate(-CX, -1000);
    fn(); ctx.restore();
  }
  const PILL_Y = 1418;

  // V1–V2: frame zero — the cancelled boarding pass, the voucher pushed over it
  function hookScene(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const push = 0.05 * eio(P(t, 0, E.v3));
    ctx.translate(500, 1100); ctx.scale(1 + push, 1 + push); ctx.translate(-500, -1100);
    gate(ctx, t);
    floorShadow(ctx, 470, 1420, 330, 1);
    const st = t <= 0 ? 1 : 1 + 0.25 * Math.max(0, 1 - Math.abs(t - E.stampC) / 0.3);
    boardingPass(ctx, 410, 1170, 1.0, -0.07, { stamp: 1 });
    ctx.save(); ctx.globalAlpha *= 1; void st; ctx.restore();
    const vx = lerp(760, 700, eio(P(t, E.offer - 0.2, E.offer + 0.4)));                              // the voucher slides further in on "offers"
    voucher(ctx, vx, 1345 + Math.sin(t * 1.8) * 6, 0.74, 0.12 + wobble(t - E.offer, 0.05, 1.3, 2.2), {});
    ctx.restore();
  }
  function stampScene(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 980, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6); stampCard(ctx, CX, 960, k, 'DGCA', 'FLIGHT CANCELLED?'); ctx.restore();
    });
  }
  // V3: the voucher flips into your two choices
  function choiceScene(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1000, 800, 0.7);
      const fl = P(t, E.flip, E.flip + 0.45);
      if (fl < 1) { ctx.save(); ctx.globalAlpha *= 1 - P(fl, 0.5, 1); voucher(ctx, CX, 1000, 0.9, 0, { flip: fl * 0.5 }); ctx.restore(); }
      optionCard(ctx, 290, 1010, clamp(spring(t - E.opt1, 1.7, 0.6), 0, 1.12), 'flight', 'NEW FLIGHT', spring(t - E.choiceLab, 2, 0.5) * 0);
      optionCard(ctx, 710, 1010, clamp(spring(t - E.opt2, 1.7, 0.6), 0, 1.12), 'refund', 'FULL REFUND', 0);
      if (t >= E.choiceLab) { hand(ctx, lerp(500, 600, eio(P(t, E.choiceLab, E.choiceLab + 0.4))), 1210, 0.8, Math.max(0, 1 - Math.abs(t - E.choiceLab - 0.45) / 0.15)); }
      pill(ctx, 'YOUR CHOICE', CX, PILL_Y, spring(t - E.choiceLab, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V4: a credit shell is your call — the switch stays off unless you turn it on
  function shellScene(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      txt(ctx, 'CREDIT SHELL', CX, 830, { f: '900 60px Inter', a: 'center', c: C.navy, ls: 4 });
      const tap = P(t, E.toggle, E.toggle + 0.3), off = P(t, E.toggle + 0.55, E.toggle + 0.85);
      const on = tap * (1 - off);
      toggle(ctx, CX, 1020, 1.0, on, on);
      hand(ctx, lerp(560, 600, eio(clamp(on))), 1080 + (1 - spring(t - E.toggle + 0.4, 1.4, 0.6)) * 300, 0.9, Math.max(0, 1 - Math.abs(t - E.toggle) / 0.12) + Math.max(0, 1 - Math.abs(t - E.toggle - 0.6) / 0.12));
      if (t >= E.noDefault) {                                                                       // "DEFAULT" struck out
        const k = spring(t - E.noDefault, 1.6, 0.55);
        ctx.save(); ctx.translate(CX - 230, 1215); ctx.rotate(-0.12); ctx.scale(k, k);
        rr(ctx, -130, -40, 260, 80, 12); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.stroke();
        txt(ctx, 'DEFAULT', 0, 18, { f: '900 46px Inter', a: 'center', c: C.red, ls: 3 });
        ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-120, 28); ctx.lineTo(120, -28); ctx.stroke(); ctx.restore();
      }
      pill(ctx, 'YOUR CALL', CX, PILL_Y, spring(t - E.toggle - 0.2, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V5: under a day's notice, and no flight that suits you
  function noticeScene(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      const fr = lerp(1, 0.62, eio(P(t, E.clock, E.clock + 0.7)));
      const cx = lerp(CX, 300, eio(P(t, E.noFit - 0.35, E.noFit)));
      clock(ctx, cx, 1000, lerp(1, 0.75, eio(P(t, E.noFit - 0.35, E.noFit))), fr, fr < 0.98 ? 1 : 0);
      if (t >= E.noFit - 0.1) {
        const k = spring(t - E.noFit + 0.1, 1.6, 0.6);
        ctx.save(); ctx.globalAlpha *= clamp(k * 2); boardingPass(ctx, 720, 1010, 0.6 * clamp(k, 0, 1.1), 0.06, { newFlight: true }); ctx.restore();
        badge(ctx, 860, 880, spring(t - E.noFit - 0.45, 2, 0.5), false, 42);
      }
      pill(ctx, '< 24 HOURS', CX, PILL_Y, spring(t - E.noticeLab, 1.6, 0.6));
    });
  }
  // V6: refund plus compensation (by flight length), paid in cash or bank transfer
  function compScene(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1000, 800, 0.7);
      const mv = eio(P(t, E.bars - 0.3, E.bars + 0.1));
      cash(ctx, lerp(CX, 210, mv), lerp(1020, 690, mv) + (1 - clamp(spring(t - E.refund, 1.4, 0.6))) * 300, lerp(1.0, 0.55, mv), -0.05);
      if (t >= E.bars - 0.1) bars(ctx, 560, 1240, 1, t - E.bars);
      if (t >= E.bank) {
        const k = spring(t - E.bank, 1.5, 0.6);
        bankIcon(ctx, 790, 680, 0.6 * clamp(k, 0, 1.1));
        const a = P(t, E.bank + 0.1, E.bank + 0.6); ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(320, 680); ctx.lineTo(lerp(320, 700, a), 680); ctx.stroke();
        if (a > 0.9) { ctx.beginPath(); ctx.moveTo(680, 660); ctx.lineTo(704, 680); ctx.lineTo(680, 700); ctx.stroke(); } ctx.restore();
      }
      pill(ctx, 'CASH OR BANK', CX, PILL_Y, spring(t - E.cashLab, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V7: causes beyond their control (weather): no compensation, the refund stays
  function exceptScene(ctx, t) {
    withScene(ctx, win(t, E.v8, E.v9), () => {
      spotlight(ctx, CX, 1000, 760, 0.5);
      const sk = P(t, E.storm, E.storm + 0.6);
      for (const [cx, cy, r] of [[380, 760, 90], [480, 730, 110], [600, 760, 90], [520, 790, 90]]) { ctx.beginPath(); ctx.arc(cx, cy - (1 - eo(sk)) * 80, r, 0, Math.PI * 2); ctx.fillStyle = `rgba(94,104,118,${sk})`; ctx.fill(); }
      const lt = Math.max(0, 1 - Math.abs(t - E.storm - 0.5) / 0.2) + Math.max(0, 1 - Math.abs(t - E.noComp) / 0.2);
      if (lt > 0) { ctx.save(); ctx.globalAlpha *= clamp(lt); ctx.beginPath(); ctx.moveTo(500, 830); ctx.lineTo(450, 940); ctx.lineTo(510, 940); ctx.lineTo(470, 1040); ctx.strokeStyle = C.gold; ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
      ctx.save(); ctx.strokeStyle = 'rgba(18,170,211,0.5)'; ctx.lineWidth = 4;                       // rain
      for (let i = 0; i < 26; i++) { const x0 = 300 + ((i * 53) % 420), y0 = 830 + ((i * 97 + t * 900) % 260); ctx.globalAlpha = sk * 0.7; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - 10, y0 + 30); ctx.stroke(); }
      ctx.restore();
      cash(ctx, 300, 1230, 0.6, -0.05); badge(ctx, 390, 1150, spring(t - E.noComp - 0.2, 2, 0.5), true, 36);   // refund stays
      ctx.save(); ctx.globalAlpha *= 1 - 0.55 * P(t, E.noComp, E.noComp + 0.4);                           // compensation coins (+₹)
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(720, 1270 - i * 26, 90, 28, 0, 0, Math.PI * 2); ctx.fillStyle = i === 3 ? '#F6D9A0' : '#D7A351'; ctx.fill(); ctx.strokeStyle = '#B98633'; ctx.lineWidth = 3; ctx.stroke(); }
      txt(ctx, '+₹', 720, 1210, { f: '900 52px Inter', a: 'center', c: C.navy }); ctx.restore();
      if (t >= E.noComp) badge(ctx, 810, 1110, spring(t - E.noComp, 2, 0.5), false, 48);
      pill(ctx, 'NO COMPENSATION', CX, PILL_Y, spring(t - E.ncLab, 1.6, 0.6), { icon: 'no' });
    }, 0, 0.94, 1.05);
  }
  // V8: payoff — push the voucher back, ask for your refund in writing
  function payoffScene(ctx, t) {
    withScene(ctx, win(t, E.v9, E.v10 + 0.3, 0.35, 0.5), () => {
      spotlight(ctx, CX, 1000, 780, 0.7);
      const pk = eio(P(t, E.push, E.push + 0.5));
      ctx.save(); ctx.globalAlpha *= 1 - pk * 0.7; voucher(ctx, lerp(CX, 900, pk), lerp(960, 820, pk), lerp(0.85, 0.5, pk), lerp(0, 0.4, pk), {}); ctx.restore();
      if (t >= E.push + 0.2) badge(ctx, lerp(CX + 160, 980, pk), lerp(860, 760, pk), spring(t - E.push - 0.2, 2, 0.5) * (1 - pk * 0.4), false, 40);
      if (t >= E.write) { const kw = spring(t - E.write, 1.4, 0.62); writtenNote(ctx, CX, 1120 + (1 - clamp(kw)) * 120, 0.95 * clamp(kw * 1.3, 0, 1), P(t, E.write + 0.25, E.write + 1.5), 1 - P(t, E.write + 1.5, E.write + 1.8)); }
      pill(ctx, 'REFUND, IN WRITING', CX, PILL_Y, spring(t - E.writeLab, 1.6, 0.6), { icon: 'ok' });
    });
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    hookScene(ctx, t);
    if (thumb) return;
    stampScene(ctx, t); choiceScene(ctx, t); shellScene(ctx, t); noticeScene(ctx, t); compScene(ctx, t); exceptScene(ctx, t); payoffScene(ctx, t);
  }

  // ---------- CTA (unchanged from the approved episodes) ----------
  function drawCTA(ctx, t) {
    if (t < E.v10) return;
    const k = spring(t - E.v10, 1.6, 0.55);
    const ix = 170, iy = 975, is = 170;
    const ap = eio(P(t, E.v10 + 0.3, E.v10 + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.v10 + 0.15, E.v10 + 0.65));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1050, { f: '800 58px Inter', maxW: 520 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1106, { f: '600 32px Inter', c: C.navySoft, maxW: 520 });
    ctx.restore();
  }

  // ---------- captions (x 100..900, centred on x=500; band y 340..540) ----------
  const CAP = { size: 64, minSize: 46, maxW: 800, y1: 396 };
  const capCache = new Map();
  function layoutCaption(ctx, cp) {
    const key0 = cp.text + (cp.hook ? '#h' : '');
    if (capCache.has(key0)) return capCache.get(key0);
    const words = cp.text.split(' ');
    let size = cp.hook ? 90 : CAP.size, lines; const minS = cp.hook ? 64 : CAP.minSize;
    for (; size >= minS; size -= 2) {
      setFont(ctx, `${cp.hook ? 900 : 800} ${size}px Inter`, 0);
      const sp = ctx.measureText(' ').width, ws = words.map(w => ctx.measureText(w).width);
      const width = (a, b) => ws.slice(a, b).reduce((s, v) => s + v, 0) + sp * (b - a - 1);
      if (!cp.hook && width(0, words.length) <= CAP.maxW) { lines = [[0, words.length]]; break; }
      let best = null;
      for (let k = 1; k < words.length; k++) {
        const m = Math.max(width(0, k), width(k, words.length));
        if (m <= CAP.maxW && (!best || m < best.m)) best = { k, m };
      }
      if (best) { lines = [[0, best.k], [best.k, words.length]]; break; }
    }
    setFont(ctx, `${cp.hook ? 900 : 800} ${size}px Inter`, 0);
    const sp = ctx.measureText(' ').width, hl = new Set(cp.hl || []);
    const gap = cp.hook ? size * 1.08 : 80;
    const out = lines.map(([a, b], li) => {
      const ws = words.slice(a, b);
      const total = ws.reduce((s, w) => s + ctx.measureText(w).width, 0) + sp * (ws.length - 1);
      let x = 500 - total / 2;
      const y = lines.length === 1 ? CAP.y1 : (li === 0 ? (cp.hook ? 400 : 394) - gap / 2 : (cp.hook ? 400 : 394) + gap / 2);
      return ws.map(w => {
        const ww = ctx.measureText(w).width, core = w.replace(/[.,;:?!”]+$/, '');
        const it = { w, x, y, ww, hw: ctx.measureText(core).width, hl: hl.has(w) }; x += ww + sp; return it;
      });
    });
    const res = { size, weight: cp.hook ? 900 : 800, lines: out };
    capCache.set(key0, res);
    return res;
  }
  function drawCaptions(ctx, t) {
    for (const cp of TL.captions) {
      if (t < cp.start || t >= cp.end) continue;
      const L = layoutCaption(ctx, cp);
      const inP = cp.start <= 0 ? 1 : eo(P(t, cp.start, cp.start + 0.2));
      const outP = cp.end >= TL.duration ? 0 : P(t, cp.end - 0.1, cp.end);
      const alpha = inP * (1 - outP), dy = (1 - inP) * 18;
      const hp = cp.start <= 0 ? 1 : eio(P(t, cp.start + 0.15, cp.start + 0.5));
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(0, dy);
      for (const items of L.lines) {
        let run = null; const runs = [];
        for (const it of items) {
          if (it.hl) { if (!run) { run = { x0: it.x, x1: it.x + it.hw, y: it.y }; runs.push(run); } else run.x1 = it.x + it.hw; }
          else run = null;
        }
        for (const r of runs) {
          const x0 = r.x0 - 8, w = (r.x1 - r.x0 + 16) * hp;
          if (w > 0) { rr(ctx, x0, r.y - L.size * 0.74, w, L.size * 0.92, 12); ctx.fillStyle = C.cyanMark; ctx.fill(); }
        }
        setFont(ctx, `${L.weight} ${L.size}px Inter`, 0); ctx.fillStyle = C.navy; ctx.textAlign = 'left';
        for (const it of items) ctx.fillText(it.w, it.x, it.y);
      }
      ctx.restore();
    }
  }

  function render(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    scene(ctx, t);
    grain(ctx);
    chip(ctx, 478, Math.min(eo(P(t, E.v2c + 0.2, E.v2c + 0.5)), 1 - eio(P(t, E.v3 - 0.3, E.v3))));
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition, plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    scene(ctx, 0, true);
    grain(ctx);
    drawCaptions(ctx, 0);
    chip(ctx, 478, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
