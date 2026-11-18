/* Courtlens · "Is this legal in India?" · Episode 21 (English, english-21, batch 21): can a lender charge you for paying
 * off your loan early? Basis (current RBI consolidated directions, read 18 Nov 2026):
 *   Commercial Banks – Responsible Business Conduct Directions 2025 (RBI/2025-26/170, updated 1 Oct 2026) paras 352–353;
 *   NBFCs – Responsible Business Conduct Directions 2025 (RBI/DOR/2025-26/362, updated 1 Jul 2026) paras 33–34;
 *   both carry over the Pre-payment Charges on Loans Directions 2025 (RBI/2025-26/64, 2 Jul 2025).
 *   Floating-rate loans to individuals for non-business purposes: no pre-payment charge (existing and new loans);
 *   from 1 Jan 2026 explicitly irrespective of source of funds, part or full, no lock-in; other cases (e.g. fixed rate)
 *   per the lender's policy and only if disclosed in the sanction letter / agreement / KFS.
 * Built on the english-20 engine (palette, Inter, grain, captions, chip, stamp, pills, CTA) under
 * context/09-feedback-rules-2026-11-11.md incl. the 18 Nov addendum. Frame zero = thumbnail.
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

  function note(ctx, x, y, s, rot, tint = '#CBDDBF') {          // a stylised banknote (no real design)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.2)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    rr(ctx, -90, -46, 180, 92, 8); ctx.fillStyle = tint; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(2,25,59,0.35)'; ctx.lineWidth = 3; rr(ctx, -80, -36, 160, 72, 5); ctx.stroke();
    ctx.beginPath(); ctx.arc(34, 0, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,25,59,0.12)'; ctx.fill();
    txt(ctx, '₹', -40, 16, { f: '900 46px Inter', a: 'center', c: 'rgba(2,25,59,0.55)' });
    ctx.restore();
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

  // ---------- props ----------
  function floorShadow(ctx, x, y, rx, a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.17);
    const g = ctx.createRadialGradient(0, 0, 8, 0, 0, rx);
    g.addColorStop(0, `rgba(2,25,59,${0.26 * a})`); g.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function ironBall(ctx, x, y, r, rot = 0) {                     // the loan: a heavy iron ball
    ctx.save(); ctx.translate(x, y);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r * 1.05);
    g.addColorStop(0, '#6B7584'); g.addColorStop(0.45, '#2E3644'); g.addColorStop(1, '#0E131C');
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.45, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
    ctx.rotate(rot);
    rr(ctx, -r * 0.18, -r - 16, r * 0.36, 34, 8); ctx.fillStyle = '#3B4452'; ctx.fill();          // eye for the chain
    txt(ctx, 'LOAN', 0, r * 0.2, { f: `900 ${Math.round(r * 0.5)}px Inter`, a: 'center', c: '#F0E9DD', ls: 4 });
    ctx.restore();
  }
  function link(ctx, x, y, ang, side) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); if (side) ctx.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2); else ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = side ? '#5E6876' : '#9AA3AF'; ctx.lineWidth = side ? 9 : 8; ctx.stroke();
    if (!side) { ctx.beginPath(); ctx.ellipse(0, -3, 20, 9, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  }
  // chain from p0 to p1 with sag; drop (0..1) lets the links fall away (unlocked)
  function chain(ctx, p0, p1, sag, drop = 0, seed = 0) {
    const n = 13, cx = (p0[0] + p1[0]) / 2, cy = (p0[1] + p1[1]) / 2 + sag;
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = (1 - u) * (1 - u) * p0[0] + 2 * u * (1 - u) * cx + u * u * p1[0];
      const y = (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * cy + u * u * p1[1];
      const dx = 2 * (1 - u) * (cx - p0[0]) + 2 * u * (p1[0] - cx), dy = 2 * (1 - u) * (cy - p0[1]) + 2 * u * (p1[1] - cy);
      let ang = Math.atan2(dy, dx), xx = x, yy = y;
      if (drop > 0) { const k = drop * (0.6 + 0.4 * Math.sin(i * 2.3 + seed)); xx += Math.sin(i * 1.7) * 40 * k; yy += 260 * k * k * (0.5 + (1 - u)); ang += k * Math.sin(i * 3.1) * 1.5; }
      ctx.save(); ctx.globalAlpha *= 1 - clamp((drop - 0.6) * 2.5); link(ctx, xx, yy, ang, i % 2 === 1); ctx.restore();
    }
  }
  function padlock(ctx, x, y, s, open = 0, shake = 0) {          // body centre at (x, y)
    ctx.save(); ctx.translate(x + shake, y); ctx.scale(s, s);
    ctx.save(); ctx.translate(-100, -96 - 50 * eo(open)); ctx.rotate(-0.2 * eob(open, 1.6));    // shackle
    ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -100); ctx.arc(100, -100, 100, Math.PI, 0); ctx.lineTo(200, open > 0 ? 10 : 60);
    const sg = ctx.createLinearGradient(-20, 0, 220, 0); sg.addColorStop(0, '#8C96A3'); sg.addColorStop(0.5, '#E3E7EC'); sg.addColorStop(1, '#7D8794');
    ctx.strokeStyle = sg; ctx.lineWidth = 42; ctx.lineCap = 'butt'; ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.38)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 22;
    const bg = ctx.createLinearGradient(0, -110, 0, 140); bg.addColorStop(0, '#E9BE6E'); bg.addColorStop(1, '#B98633');
    rr(ctx, -165, -110, 330, 250, 40); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
    rr(ctx, -165, -110, 330, 46, 22); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fill();
    rr(ctx, -140, -60, 280, 176, 26); ctx.strokeStyle = 'rgba(110,70,20,0.35)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();         // keyhole
    ctx.beginPath(); ctx.moveTo(-14, 16); ctx.lineTo(14, 16); ctx.lineTo(8, 70); ctx.lineTo(-8, 70); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function feeTag(ctx, ax, ay, swing, k = 1, label = '2% FEE') {   // hangs from (ax, ay)
    if (k <= 0) return;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(0.18 + swing); ctx.scale(k, k);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, 50, 46, 110); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    ctx.translate(46, 110); ctx.rotate(-0.35);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.28)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, -66); ctx.lineTo(282, -66); ctx.quadraticCurveTo(300, -66, 300, -48);
    ctx.lineTo(300, 48); ctx.quadraticCurveTo(300, 66, 282, 66); ctx.lineTo(18, 66); ctx.closePath();
    ctx.fillStyle = C.card; ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); ctx.arc(14, 0, 10, 0, Math.PI * 2); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    txt(ctx, label, 160, 26, { f: '900 72px Inter', a: 'center', c: C.red, maxW: 240 });
    ctx.restore();
  }
  function cash(ctx, x, y, s, rot = 0) {                           // a bundle of notes with a band
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    for (let i = 3; i >= 0; i--) {
      ctx.save(); ctx.translate(i * 4, -i * 14);
      ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.22)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      rr(ctx, -120, -56, 240, 112, 10); ctx.fillStyle = i % 2 ? '#BFD6B0' : '#CFE0C2'; ctx.fill(); ctx.restore();
      rr(ctx, -110, -46, 220, 92, 6); ctx.strokeStyle = 'rgba(2,25,59,0.25)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
    txt(ctx, '₹', -64, 20, { f: '900 54px Inter', a: 'center', c: 'rgba(2,25,59,0.5)' });
    ctx.beginPath(); ctx.arc(54, 0, 30, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,25,59,0.12)'; ctx.fill();
    rr(ctx, -14, -60, 34, 120, 4); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore();
  }
  function waves(ctx, t, y0, a = 1) {                               // layered water for the floating rate
    for (let L = 0; L < 3; L++) {
      const yy = y0 + L * 46, amp = 18 - L * 3, sp = 1.4 + L * 0.5, ph = L * 1.7;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, yy + Math.sin(x / 120 + t * sp + ph) * amp + Math.sin(x / 47 - t * 1.1) * 4);
      ctx.lineTo(W, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, yy - 30, 0, yy + 520);
      g.addColorStop(0, [`rgba(18,170,211,${0.55 * a})`, `rgba(10,126,164,${0.6 * a})`, `rgba(2,60,110,${0.7 * a})`][L]);
      g.addColorStop(1, `rgba(244,238,226,0)`);
      ctx.fillStyle = g; ctx.fill();
    }
  }
  function pctBuoy(ctx, x, y, s, rot) {                             // a "%" riding on a float
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.ellipse(0, 70, 170, 52, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    for (const [x0, x1] of [[-170, -95], [-20, 20], [95, 170]]) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 70, 170, 52, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = C.red; ctx.fillRect(x0, 0, x1 - x0, 140); ctx.restore();
    }
    rr(ctx, -10, -40, 20, 90, 6); ctx.fillStyle = '#5E6876'; ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(0, -150, 120, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    txt(ctx, '%', 0, -108, { f: '900 150px Inter', a: 'center', c: '#FFF4DF' });
    ctx.restore();
  }
  function concretePct(ctx, x, y, s) {                              // a "%" set in concrete: fixed
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 20;
    const g = ctx.createLinearGradient(0, -170, 0, 170); g.addColorStop(0, '#C9C6BF'); g.addColorStop(1, '#9C988F');
    rr(ctx, -210, -170, 420, 340, 18); ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.fillStyle = 'rgba(70,64,56,0.25)';
    for (const [px, py, r] of [[-150, -120, 7], [120, -130, 5], [160, 90, 8], [-120, 110, 6], [40, 140, 4], [-180, 20, 5]]) { ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); }
    txt(ctx, '%', 0, 70, { f: '900 230px Inter', a: 'center', c: '#5B5750' });
    txt(ctx, '%', -4, 64, { f: '900 230px Inter', a: 'center', c: C.navy });
    for (const bx of [-150, 150]) { ctx.beginPath(); ctx.arc(bx, -130, 16, 0, Math.PI * 2); ctx.fillStyle = '#7D8794'; ctx.fill(); }
    ctx.restore();
  }
  function tile(ctx, x, y, k, draw) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    card(ctx, -110, -110, 220, 220, 44, C.card, { blur: 30, oy: 12 });
    draw(ctx); ctx.restore();
  }
  const icHome = ctx => { ctx.beginPath(); ctx.moveTo(-62, -4); ctx.lineTo(0, -60); ctx.lineTo(62, -4); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -46, -8, 92, 70, 6); ctx.fill(); rr(ctx, -12, 22, 24, 40, 4); ctx.fillStyle = C.gold; ctx.fill(); };
  const icCap = ctx => { ctx.beginPath(); ctx.moveTo(-74, -16); ctx.lineTo(0, -52); ctx.lineTo(74, -16); ctx.lineTo(0, 20); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-40, 6); ctx.lineTo(-40, 40); ctx.quadraticCurveTo(0, 66, 40, 40); ctx.lineTo(40, 6); ctx.lineTo(0, 24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(62, -10); ctx.lineTo(62, 34); ctx.stroke(); };
  const icWallet = ctx => { rr(ctx, -66, -44, 132, 96, 16); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, 18, -14, 54, 38, 10); ctx.fillStyle = C.cyan; ctx.fill(); ctx.beginPath(); ctx.arc(36, 5, 7, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -54, -62, 90, 26, 6); ctx.fillStyle = '#CFE0C2'; ctx.fill(); };
  function bank(ctx, x, y, s) {                                     // a second lender's building (generic)
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 16;
    rr(ctx, -170, -250, 340, 250, 8); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-200, -250); ctx.lineTo(0, -360); ctx.lineTo(200, -250); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 4; i++) { rr(ctx, -130 + i * 80, -210, 30, 190, 6); ctx.fillStyle = C.cyanTint; ctx.fill(); }
    rr(ctx, -190, -24, 380, 24, 4); ctx.fillStyle = C.navy; ctx.fill();
    ctx.restore();
  }
  function debtBlock(ctx, x, y, rot, a, hi) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha *= a;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    rr(ctx, -150, -42, 300, 84, 14); ctx.fillStyle = hi > 0 ? `rgb(${lerp(2, 18, hi)},${lerp(25, 170, hi)},${lerp(59, 211, hi)})` : C.navy; ctx.fill(); ctx.restore();
    rr(ctx, -150, -42, 300, 18, 9); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    txt(ctx, '₹', 0, 22, { f: '900 52px Inter', a: 'center', c: 'rgba(255,244,223,0.55)' });
    ctx.restore();
  }
  function papers(ctx, x, y, s, rot, hi) {                          // loan papers: one disclosed line
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -180, -230, 360, 460, 14, '#FFFFFF', { blur: 34, oy: 14 });
    rr(ctx, -140, -190, 170, 20, 10); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 7; i++) { const yy = -120 + i * 50;
      if (i === 3) { rr(ctx, -158, yy - 22, 316, 46, 10); ctx.fillStyle = hi > 0 ? C.redTint : 'rgba(0,0,0,0)'; ctx.fill();
        rr(ctx, -140, yy - 7, 180, 14, 7); ctx.fillStyle = C.navySoft; ctx.fill();
        txt(ctx, '2%', 110, yy + 14, { f: '900 40px Inter', a: 'center', c: C.red }); }
      else { rr(ctx, -140, yy - 7, [260, 230, 250, 0, 200, 240, 160][i], 14, 7); ctx.fillStyle = C.navyFaint; ctx.fill(); } }
    ctx.restore();
  }
  function sanctionLetter(ctx, x, y, s, o) {                        // payoff: the rate type on the letter
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.02);
    card(ctx, -300, -360, 600, 720, 18, '#FFFFFF', { blur: 44, oy: 18 });
    txt(ctx, 'SANCTION LETTER', 0, -268, { f: '900 46px Inter', a: 'center', c: C.navy, ls: 3, maxW: 520 });
    rr(ctx, -240, -230, 480, 6, 3); ctx.fillStyle = C.cyan; ctx.fill();
    for (let i = 0; i < 3; i++) { rr(ctx, -240, -180 + i * 44, [420, 360, 400][i], 16, 8); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    txt(ctx, 'RATE TYPE', -240, -20, { f: '800 40px Inter', c: C.navySoft, ls: 2 });
    for (const [i, lab, k] of [[0, 'FLOATING', o.hf], [1, 'FIXED', o.hx]]) {
      const yy = 50 + i * 110;
      if (k > 0) { rr(ctx, -262, yy - 50, 524, 92, 18); ctx.fillStyle = `rgba(180,227,241,${0.9 * k})`; ctx.fill(); }
      rr(ctx, -240, yy - 30, 52, 52, 10); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.stroke();
      txt(ctx, lab, -160, yy + 14, { f: '900 54px Inter', c: C.navy, ls: 2 });
    }
    for (let i = 0; i < 2; i++) { rr(ctx, -240, 250 + i * 44, [380, 300][i], 16, 8); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    ctx.restore();
  }
  function magnifier(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.strokeStyle = C.navy; ctx.lineWidth = 18; ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, 83, 0, Math.PI * 2); ctx.fillStyle = 'rgba(216,239,246,0.22)'; ctx.fill();
    ctx.save(); ctx.rotate(0.8); rr(ctx, 96, -16, 150, 32, 14); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.restore();
  }

  // ---------- scene windows (scale crossfades, as in the approved episodes) ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {
    const i = a <= 0 ? 1 : eo(P(t, a, a + fin)), o = 1 - eio(P(t, b - fout, b));
    return { a: Math.min(i, o), i, o };
  }
  function withScene(ctx, w, fn, push = 0, zoomIn = 0.94, zoomOut = 1.05) {
    if (w.a <= 0.001) return;
    const s = (w.i < 1 ? lerp(zoomIn, 1, w.i) : lerp(zoomOut, 1, w.o)) * (1 + push);
    ctx.save(); ctx.globalAlpha = w.a;
    ctx.translate(CX, 1060); ctx.scale(s, s); ctx.translate(-CX, -1060);
    fn(); ctx.restore();
  }

  // ---------- the loan: padlock + chain + iron ball (frame zero, escalation, unlock) ----------
  const LK = { x: 445, y: 990, s: 1.1 }, BALL = { x: 785, y: 1305, r: 140 };
  function lockScene(ctx, t, o) {
    spotlight(ctx, 520, 1060, 820, 1);
    const halo = ctx.createRadialGradient(LK.x, LK.y - 60, 60, LK.x, LK.y - 60, 430);          // brand-cyan halo
    halo.addColorStop(0, 'rgba(18,170,211,0.30)'); halo.addColorStop(0.6, 'rgba(18,170,211,0.10)'); halo.addColorStop(1, 'rgba(18,170,211,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 560, W, 1000);
    floorShadow(ctx, LK.x, 1410, 280, 1); floorShadow(ctx, BALL.x, 1452, 200, 1);
    const drop = o.drop || 0, S = LK.s;
    if (drop < 1) chain(ctx, [LK.x + 128 * S, LK.y + 120 * S], [BALL.x - 26, BALL.y - BALL.r - 10], 95, drop, 1.3);
    ironBall(ctx, BALL.x + (o.roll || 0), BALL.y, BALL.r, (o.roll || 0) / BALL.r);
    padlock(ctx, LK.x, LK.y, S, o.open || 0, o.shake || 0);
    if (o.cashX !== undefined) cash(ctx, o.cashX, o.cashY, 1.05, o.cashRot || 0);
    if (o.tagK > 0) feeTag(ctx, LK.x + 100 * S + (o.shake || 0), LK.y - (196 + 50 * eo(o.open || 0)) * S, o.swing || 0, o.tagK * 1.08);
  }
  function hookScene(ctx, t, thumb) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const push = thumb ? 0 : 0.04 * eio(P(t, 0, E.v3));
    ctx.translate(CX, 1060); ctx.scale(1 + push, 1 + push); ctx.translate(-CX, -1060);
    let cashX = 205, cashY = 1330, cashRot = -0.08;
    if (!thumb && t >= E.cash) {                                    // cash slides to the lock, then is pushed back
      const k = eio(P(t, E.cash, E.cashHit)), back = eob(P(t, E.block, E.block + 0.45), 1.3);
      cashX = lerp(205, 330, k) - 110 * back; cashY = lerp(1330, 1180, k) + 150 * back; cashRot = lerp(-0.08, 0.2, k) - 0.28 * back;
    }
    const shake = thumb ? 0 : wobble(t - E.block, 10, 6, 6) + wobble(t - E.cashHit, 6, 7, 7);
    const tagK = thumb ? 1 : 1 + 0.18 * Math.max(0, Math.sin(Math.PI * P(t, E.fee, E.fee + 0.5)));
    const swing = thumb ? 0 : wobble(t - E.tag, 0.14, 1.2, 1.7) + wobble(t - E.fee, 0.1, 1.5, 2.2) + Math.sin(t * 1.6) * 0.012;
    lockScene(ctx, t, { cashX, cashY, cashRot, shake, tagK, swing });
    if (!thumb && t >= E.block) badge(ctx, 300, 1100, spring(t - E.block, 2, 0.5) * (1 - P(t, E.v3 - 0.4, E.v3)), false, 44);
    ctx.restore();
  }
  function unlockScene(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      ctx.translate(0, 28);
      const rip = P(t, E.rip, E.rip + 0.6), open = P(t, E.open, E.open + 0.45);
      const drop = P(t, E.open + 0.1, E.open + 0.9);
      lockScene(ctx, t, { cashX: 205, cashY: 1330, cashRot: -0.08, open, drop, roll: 60 * eo(drop),
        shake: wobble(t - E.rip, 8, 6, 6), tagK: rip > 0 ? 0 : 1, swing: wobble(t - E.v5, 0.1, 1.2, 2) + Math.sin(t * 1.6) * 0.012 });
      if (rip > 0 && rip < 1) {                                       // the fee tag is torn off and flies away
        const e = eo(rip);
        ctx.save(); ctx.globalAlpha *= 1 - P(rip, 0.55, 1);
        feeTag(ctx, LK.x + 110 + e * 560, LK.y - 216 - e * 40 + rip * rip * 260, 0.18 + e * 1.6, 1.08 - 0.3 * e);
        ctx.restore();
      }
      if (t >= E.zero) badge(ctx, LK.x, LK.y + 10, spring(t - E.zero, 2, 0.5), true, 52);
    }, 0.02 * P(t, E.v5, E.v6));
    const lw = 1 - eio(P(t, E.v6 - 0.3, E.v6));
    if (lw > 0) {
      ctx.save(); ctx.globalAlpha *= lw;
      const l1 = 1 - eio(P(t, E.rip - 0.25, E.rip + 0.05));
      if (t >= E.lenders && l1 > 0) { ctx.save(); ctx.globalAlpha *= l1; pill(ctx, 'BANKS & NBFCs', CX, 1580, spring(t - E.lenders, 1.6, 0.6)); ctx.restore(); }
      if (t >= E.zero) pill(ctx, '₹0 CHARGE', CX, 1580, spring(t - E.zero, 1.6, 0.6), { icon: 'ok' });
      ctx.restore();
    }
  }
  // V3 — the RBI rule stamp
  function stampScene(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6); stampCard(ctx, CX, 1040, k, 'INDIA', 'RBI RULES'); ctx.restore();
    });
  }
  // V4 — floating rate: a "%" bobbing on water
  function floatScene(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v4b + 0.2), () => {
      spotlight(ctx, CX, 980, 760, 0.6);
      const rise = spring(t - E.float, 1.1, 0.5), by = lerp(1500, 1120, clamp(rise, 0, 1.2));
      waves(ctx, t, 1230, 1);
      pctBuoy(ctx, CX + Math.sin(t * 1.3) * 12, by + Math.sin(t * 2.4) * 22, 1.05, Math.sin(t * 1.9) * 0.08);
      waves(ctx, t + 3.1, 1310, 0.55);
      pill(ctx, 'FLOATING RATE', CX, 1580, spring(t - E.floatLab, 1.6, 0.6));
    }, 0.03 * P(t, E.v4, E.v4b));
  }
  // V4b — any loan except business: home, studies, personal
  function useScene(ctx, t) {
    withScene(ctx, win(t, E.v4b, E.v5), () => {
      spotlight(ctx, CX, 1040, 760, 0.6);
      const items = [[E.icon1, icHome, 230], [E.icon2, icCap, 500], [E.icon3, icWallet, 770]];
      for (const [te, ic, x] of items) {
        const k = spring(t - te, 1.8, 0.55);
        tile(ctx, x, 1060 + Math.sin(t * 2 + x) * 6, clamp(k, 0, 1.15), ic);
        badge(ctx, x + 84, 966, spring(t - te - 0.25, 2, 0.5), true, 30);
      }
      pill(ctx, 'NOT FOR BUSINESS', CX, 1400, spring(t - E.nbLab, 1.6, 0.6));
    });
  }
  // V6 — part or full, even with money from a new lender
  function towerScene(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7 + 0.2), () => {
      spotlight(ctx, CX, 1060, 780, 0.6);
      const baseY = 1400, bx = 380;
      floorShadow(ctx, bx, baseY + 10, 230, 1);
      for (let i = 0; i < 6; i++) {                                   // debt tower, bottom block i=0
        const top = i >= 4;
        const hitT = top ? E.part + 0.3 : E.arc + 0.45;
        let x = bx + (i % 2 ? 8 : -8), y = baseY - 42 - i * 88, rot = 0, a = 1;
        const d = t - hitT;
        if (d > 0) { const dir = i % 2 ? 1 : -1; x += dir * (160 + i * 30) * d * 1.6; y += -240 * d + 1200 * d * d; rot = dir * d * 3; a = 1 - clamp(d / 0.7); }
        const hi = t >= E.full && t < E.arc + 0.45 && !top ? 0.6 + 0.4 * Math.sin((t - E.full) * 9) : 0;
        if (a > 0) debtBlock(ctx, x, y, rot, a, top ? 0 : clamp(hi));
      }
      if (t >= E.part - 0.15 && t < E.part + 0.45) {                  // part payment: a small bundle from the left
        const k = eio(P(t, E.part - 0.15, E.part + 0.3));
        ctx.save(); ctx.globalAlpha *= 1 - P(t, E.part + 0.3, E.part + 0.45);
        cash(ctx, lerp(-120, bx - 40, k), lerp(820, baseY - 42 - 4.5 * 88, k) - Math.sin(Math.PI * k) * 120, 0.7, k * 3); ctx.restore();
      }
      const bk = spring(t - E.newLender, 1.2, 0.62);                   // the new lender's building
      if (t >= E.newLender) bank(ctx, lerp(1300, 790, clamp(bk, 0, 1.1)), baseY, 0.85);
      if (t >= E.arc - 0.05 && t < E.arc + 0.6) {                     // money from the new lender pays it off
        const k = eio(P(t, E.arc - 0.05, E.arc + 0.45));
        ctx.save(); ctx.globalAlpha *= 1 - P(t, E.arc + 0.45, E.arc + 0.6);
        cash(ctx, lerp(790, bx + 30, k), lerp(1150, baseY - 220, k) - Math.sin(Math.PI * k) * 260, lerp(0.8, 1.05, k), -k * 4); ctx.restore();
      }
      if (t >= E.anySrc) badge(ctx, bx, baseY - 120, spring(t - E.anySrc, 2, 0.5), true, 52);
      pill(ctx, 'ANY SOURCE', CX, 1580, spring(t - E.anySrc - 0.1, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V7 — fixed rate: a charge may apply if the loan papers disclose it
  function fixedScene(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1040, 760, 0.6);
      const slam = t < E.fixed ? 0 : eob(P(t, E.fixed, E.fixed + 0.35), 1.1);
      const cx = lerp(500, 300, eio(P(t, E.papers - 0.1, E.papers + 0.4)));
      floorShadow(ctx, cx, 1420, 260, clamp(slam));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.fixed + 0.1) * 6);
      concretePct(ctx, cx, lerp(860, 1240, clamp(slam)) + wobble(t - E.fixed - 0.3, 8, 4, 6), lerp(1.2, 0.95, eio(P(t, E.papers - 0.1, E.papers + 0.4))));
      ctx.restore();
      if (t >= E.feeBack) {
        const k = spring(t - E.feeBack, 1.4, 0.55);
        feeTag(ctx, cx + 140, 1060 - (1 - clamp(k)) * 200, wobble(t - E.feeBack, 0.16, 1.2, 1.6) + Math.sin(t * 1.6) * 0.012, clamp(k * 1.4, 0, 1) * 0.85);
      }
      if (t >= E.papers) { const k = spring(t - E.papers, 1.3, 0.62); papers(ctx, lerp(1250, 735, clamp(k, 0, 1.1)), 1090, 0.92, 0.05, P(t, E.disclosed - 0.2, E.disclosed)); }
      pill(ctx, 'IF DISCLOSED', CX, 1580, spring(t - E.disclosed, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V8 — payoff: check the rate type on the sanction letter
  function letterScene(ctx, t) {
    withScene(ctx, win(t, E.v8, E.v9 + 0.3, 0.35, 0.5), () => {
      spotlight(ctx, CX, 1040, 760, 0.6);
      const k = spring(t - E.letter, 1.3, 0.62);
      const hf = P(t, E.hiFloat, E.hiFloat + 0.2) * (1 - P(t, E.hiFixed - 0.1, E.hiFixed + 0.1)), hx = P(t, E.hiFixed, E.hiFixed + 0.2) * (1 - P(t, E.okLetter, E.okLetter + 0.4));
      sanctionLetter(ctx, CX, 1010 + (1 - clamp(k)) * 300, 0.98 * clamp(k * 1.2, 0, 1), { hf, hx });
      if (t >= E.lens) {
        const tf = eio(P(t, E.lens, E.hiFloat + 0.1)), tx = eio(P(t, E.hiFixed - 0.15, E.hiFixed + 0.15)), tb = eio(P(t, E.okLetter, E.okLetter + 0.4));
        const y0 = 1010 + 50 * 0.98, y1 = 1010 + 160 * 0.98;
        let mx = lerp(900, 420, tf), my = lerp(1500, y0, tf);
        my = lerp(my, y1, tx); mx = lerp(mx, 860, tb); my = lerp(my, 1330, tb);
        ctx.save(); ctx.globalAlpha *= clamp((t - E.lens) * 4); magnifier(ctx, mx, my, 0.9); ctx.restore();
      }
      if (t >= E.okLetter) pill(ctx, 'CHECK FIRST', CX, 1580, spring(t - E.okLetter, 1.6, 0.6), { icon: 'ok' });
    });
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    hookScene(ctx, t, thumb);
    if (thumb) return;
    stampScene(ctx, t); floatScene(ctx, t); useScene(ctx, t); unlockScene(ctx, t); towerScene(ctx, t); fixedScene(ctx, t); letterScene(ctx, t);
  }

  // ---------- CTA (unchanged from the approved episodes) ----------
  function drawCTA(ctx, t) {
    if (t < E.v9) return;
    const k = spring(t - E.v9, 1.6, 0.55);
    const ix = 170, iy = 975, is = 170;
    const ap = eio(P(t, E.v9 + 0.3, E.v9 + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.v9 + 0.15, E.v9 + 0.65));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1050, { f: '800 58px Inter', maxW: 520 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1106, { f: '600 32px Inter', c: C.navySoft, maxW: 520 });
    ctx.restore();
  }

  // ---------- captions (x 100..900, centred on x=500; band y 340..540) ----------
  const CAP = { size: 64, minSize: 46, maxW: 800, y1: 463 };
  const capCache = new Map();
  function layoutCaption(ctx, cp) {
    const key0 = cp.text + (cp.hook ? '#h' : '');
    if (capCache.has(key0)) return capCache.get(key0);
    const words = cp.text.split(' ');
    let size = cp.hook ? 104 : CAP.size, lines; const minS = cp.hook ? 70 : CAP.minSize;
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
      const y = lines.length === 1 ? CAP.y1 : (li === 0 ? 462 - gap / 2 : 462 + gap / 2);
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
    chip(ctx, 548, Math.min(eo(P(t, E.v2c + 0.2, E.v2c + 0.5)), 1 - eio(P(t, E.v3 - 0.3, E.v3))));
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
    chip(ctx, 548, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
