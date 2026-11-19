/* Courtlens · "Is this legal in India?" · Episode 22 (English, english-22, batch 22): the valet ticket says "parked at
 * owner's risk" — who is responsible? Basis: Supreme Court of India, Taj Mahal Hotel v. United India Insurance Co. Ltd.
 * & Ors., Civil Appeal No. 8611 of 2019, judgment 14 Nov 2019 (official PDF, api.sci.gov.in):
 *   paras 18.2–18.3  valet custody = bailment (Contract Act s.148); merely licensing a parking space is not
 *   paras 18.7–18.8  bailment exists even if valet parking is "complimentary"
 *   para 19          failure to return the car = prima facie negligence; burden on the hotel (ss.151–152)
 *   paras 28–30      the s.151 standard of care can't be contracted out of; "owner's risk" clauses don't rescue a
 *                    negligent hotel; disclaimers for third-party acts / force majeure only after the hotel proves care
 * Replaces the proposed service-charge topic, already covered by episode 06. Built on the english-21 engine; captions
 * raised to y≈280–460 per the 19 Nov brief. Frame zero = thumbnail.
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
  function keys(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.strokeStyle = '#8C949E'; ctx.lineWidth = 7; ctx.stroke();
    for (const [a, c] of [[0.5, C.gold], [1.35, '#C9CDD2']]) {
      ctx.save(); ctx.rotate(a); ctx.translate(26, 0);
      ctx.beginPath(); ctx.arc(26, 0, 22, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
      ctx.beginPath(); ctx.arc(26, 0, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      rr(ctx, 44, -8, 70, 16, 3); ctx.fillStyle = c; ctx.fill();
      rr(ctx, 92, 6, 10, 12, 2); rr(ctx, 74, 6, 10, 9, 2); ctx.fill();
      ctx.restore();
    }
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
  function halo(ctx, x, y, r, a = 1) {
    const g = ctx.createRadialGradient(x, y, 40, x, y, r);
    g.addColorStop(0, `rgba(18,170,211,${0.30 * a})`); g.addColorStop(0.6, `rgba(18,170,211,${0.10 * a})`); g.addColorStop(1, 'rgba(18,170,211,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 540, W, 1000);
  }
  // the valet ticket, drawn as a thick 3D card. o: line (red fine-print line 0..1), glow, strike (0..1), tear (0..1),
  // yaw (-0.3..0.3: turning), sheen (0..1 sweep), keys (bool), keySwing
  function ticket(ctx, x, y, s, rot, o = {}) {
    const yaw = o.yaw || 0, sx = Math.cos(yaw), th = 18;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * sx, s); ctx.transform(1, Math.sin(yaw) * 0.18, 0, 1, 0, 0);
    const tear = o.tear || 0;
    const body = (top, bot, fill, dx = 0, dy = 0) => {                       // card outline with side notches at y=120
      ctx.beginPath(); ctx.moveTo(-200 + dx, top + dy + 26); ctx.quadraticCurveTo(-200 + dx, top + dy, -174 + dx, top + dy);
      ctx.lineTo(174 + dx, top + dy); ctx.quadraticCurveTo(200 + dx, top + dy, 200 + dx, top + dy + 26);
      if (bot > 120) { ctx.lineTo(200 + dx, 104 + dy); ctx.arc(200 + dx, 120 + dy, 16, -Math.PI / 2, Math.PI / 2, true); }
      ctx.lineTo(200 + dx, bot + dy - 26); ctx.quadraticCurveTo(200 + dx, bot + dy, 174 + dx, bot + dy);
      ctx.lineTo(-174 + dx, bot + dy); ctx.quadraticCurveTo(-200 + dx, bot + dy, -200 + dx, bot + dy - 26);
      if (bot > 120) { ctx.lineTo(-200 + dx, 136 + dy); ctx.arc(-200 + dx, 120 + dy, 16, Math.PI / 2, -Math.PI / 2, true); }
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    };
    const bottom = tear > 0 ? 120 : 350;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.38)'; ctx.shadowBlur = 56; ctx.shadowOffsetY = 26;
    body(-350, bottom, '#BFB3A0', th * (yaw >= 0 ? 1 : -1) * 0.8, th); ctx.restore();             // thickness (depth)
    const fg = ctx.createLinearGradient(-200, -350, 200, 350); fg.addColorStop(0, '#FFFFFF'); fg.addColorStop(1, '#F1E9DA');
    body(-350, bottom, fg);
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -350, 400, 150); ctx.clip();                           // header band
    rr(ctx, -200, -350, 400, 176, 26); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    txt(ctx, 'VALET', -18, -248, { f: '900 84px Inter', a: 'center', c: C.gold, ls: 9 });
    ctx.beginPath(); ctx.arc(168, -322, 14, 0, Math.PI * 2); ctx.fillStyle = '#E9E0CF'; ctx.fill();     // key-ring hole
    txt(ctx, '047', 20, -40, { f: '900 150px Inter', a: 'center', c: C.navy, ls: 4 });
    carIcon(ctx, 0, 50, 0.5);
    ctx.fillStyle = C.navyFaint; for (let i = -180; i <= 180; i += 26) { ctx.beginPath(); ctx.arc(i, 120, 4, 0, Math.PI * 2); ctx.fill(); }  // perforation
    if (tear < 1) stub(ctx, o, tear, th, yaw);
    if (o.sheen > 0 && o.sheen < 1) {                                                                 // light sweep
      ctx.save(); body(-350, bottom, 'rgba(0,0,0,0)'); ctx.clip();
      const sxp = lerp(-420, 420, o.sheen), sg = ctx.createLinearGradient(sxp - 90, 0, sxp + 90, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.55)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.transform(1, 0, -0.5, 1, 0, 0); ctx.fillRect(-700, -400, 1400, 800); ctx.restore();
    }
    ctx.restore();
    if (o.keys) keys(ctx, x + (168 * Math.cos(rot) + 322 * Math.sin(rot)) * s * sx, y + (168 * Math.sin(rot) - 322 * Math.cos(rot)) * s, 1.05 * s, -0.55 + (o.keySwing || 0));
  }
  function stub(ctx, o, tear, th, yaw) {                         // the fine-print stub below the perforation
    ctx.save();
    if (tear > 0) { const e = tear; ctx.translate(-40 * e, 900 * e * e); ctx.rotate(-0.5 * e); ctx.globalAlpha *= 1 - clamp((e - 0.6) * 2.5); }
    ctx.beginPath(); ctx.moveTo(-200, 120); ctx.lineTo(200, 120); ctx.lineTo(200, 324); ctx.quadraticCurveTo(200, 350, 174, 350);
    ctx.lineTo(-174, 350); ctx.quadraticCurveTo(-200, 350, -200, 324); ctx.closePath();
    if (tear > 0) { ctx.save(); ctx.translate(th * 0.8, th); ctx.fillStyle = '#BFB3A0'; ctx.fill(); ctx.restore(); }
    ctx.fillStyle = tear > 0 ? '#F4ECDD' : 'rgba(0,0,0,0)'; ctx.fill();
    for (const [yy, w] of [[160, 300], [186, 250]]) { rr(ctx, -150, yy - 6, w, 10, 5); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    const L = o.line ?? 1;
    if (L > 0) {
      const gl = o.glow || 0;
      if (gl > 0) { ctx.save(); ctx.shadowColor = `rgba(181,67,47,${0.75 * gl})`; ctx.shadowBlur = 40; rr(ctx, -178, 212, 356 * L, 112, 16); ctx.fillStyle = 'rgba(246,223,216,0.95)'; ctx.fill(); ctx.restore(); }
      else { rr(ctx, -178, 212, 356 * L, 112, 16); ctx.fillStyle = C.redTint; ctx.fill(); }
      ctx.save(); ctx.beginPath(); ctx.rect(-190, 200, 380 * L, 140); ctx.clip();
      txt(ctx, 'PARKED AT', 0, 258, { f: '900 44px Inter', a: 'center', c: C.red, ls: 3 });
      txt(ctx, "OWNER'S RISK", 0, 310, { f: '900 52px Inter', a: 'center', c: C.red, ls: 2, maxW: 340 });
      ctx.restore();
      const sk = o.strike || 0;
      if (sk > 0) { ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 16; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-170, 300); ctx.lineTo(-170 + 340 * eo(sk), 300 - 70 * eo(sk)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-170, 230); ctx.lineTo(-170 + 340 * eo(clamp(sk * 1.4 - 0.4)), 230 + 70 * eo(clamp(sk * 1.4 - 0.4))); ctx.stroke(); ctx.restore(); }
    }
    ctx.restore();
  }
  function carIcon(ctx, x, y, s) {                               // small car pictogram printed on the ticket
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-150, 30); ctx.lineTo(-150, -10); ctx.quadraticCurveTo(-140, -30, -100, -34); ctx.lineTo(-60, -80);
    ctx.lineTo(60, -80); ctx.lineTo(110, -34); ctx.quadraticCurveTo(150, -30, 150, -6); ctx.lineTo(150, 30); ctx.closePath();
    ctx.fillStyle = C.cyanDark; ctx.fill();
    for (const wx of [-90, 90]) { ctx.beginPath(); ctx.arc(wx, 32, 28, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill(); }
    ctx.restore();
  }
  // a side-view car (generic). o: scratch (0..1), alpha, dashed (outline only)
  function car(ctx, x, y, s, o = {}) {                            // (x, y) = ground point under the centre
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const path = () => {
      ctx.beginPath(); ctx.moveTo(-270, -40); ctx.lineTo(-268, -96); ctx.quadraticCurveTo(-262, -128, -214, -134);
      ctx.lineTo(-150, -140); ctx.lineTo(-86, -206); ctx.quadraticCurveTo(-70, -218, -44, -218); ctx.lineTo(96, -218);
      ctx.quadraticCurveTo(120, -218, 136, -204); ctx.lineTo(196, -140); ctx.lineTo(240, -132); ctx.quadraticCurveTo(272, -126, 274, -94);
      ctx.lineTo(276, -40); ctx.closePath();
    };
    if (o.dashed) {
      path(); ctx.setLineDash([18, 14]); ctx.strokeStyle = C.navySoft; ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]);
      for (const wx of [-160, 170]) { ctx.beginPath(); ctx.arc(wx, -40, 50, 0, Math.PI * 2); ctx.setLineDash([14, 12]); ctx.stroke(); ctx.setLineDash([]); }
      ctx.restore(); return;
    }
    floorShadow(ctx, 0, 6, 330, 1);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    path(); const g = ctx.createLinearGradient(0, -218, 0, -40); g.addColorStop(0, '#3CC3E6'); g.addColorStop(1, '#0A8DB5');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-70, -196); ctx.lineTo(-130, -140); ctx.lineTo(16, -140); ctx.lineTo(16, -196); ctx.closePath(); ctx.fillStyle = '#D8EFF6'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(34, -196); ctx.lineTo(34, -140); ctx.lineTo(176, -140); ctx.lineTo(124, -196); ctx.closePath(); ctx.fill();
    rr(ctx, -262, -100, 520, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    rr(ctx, 236, -112, 30, 18, 6); ctx.fillStyle = '#FFE6A8'; ctx.fill();
    rr(ctx, -268, -110, 22, 18, 6); ctx.fillStyle = C.red; ctx.fill();
    for (const wx of [-160, 170]) {
      ctx.beginPath(); ctx.arc(wx, -40, 50, 0, Math.PI * 2); ctx.fillStyle = '#16223A'; ctx.fill();
      ctx.beginPath(); ctx.arc(wx, -40, 24, 0, Math.PI * 2); ctx.fillStyle = '#C9CDD2'; ctx.fill();
    }
    const sc = o.scratch || 0;
    if (sc > 0) {                                                                                      // a scratch along the door
      ctx.save(); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); const n = 9; for (let i = 0; i <= n * eo(sc); i++) { const xx = -120 + i * 34, yy = -76 + (i % 2 ? -14 : 10); if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
      ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function valetStand(ctx, x, y, s, o = {}) {                    // podium + key board; returns hook position
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    floorShadow(ctx, 0, 6, 150, 1);
    rr(ctx, -12, -520, 24, 260, 6); ctx.fillStyle = '#3B4452'; ctx.fill();                              // post
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    rr(ctx, -110, -600, 220, 120, 14); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();          // key board
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-60 + i * 60, -560, 8, 0, Math.PI * 2); ctx.fillStyle = '#7D8794'; ctx.fill(); }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.moveTo(-100, -270); ctx.lineTo(100, -270); ctx.lineTo(80, 0); ctx.lineTo(-80, 0); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    rr(ctx, -116, -300, 232, 40, 10); ctx.fillStyle = '#1B2C52'; ctx.fill();
    txt(ctx, 'VALET', 0, -150, { f: '900 54px Inter', a: 'center', c: C.gold, ls: 6 });
    ctx.restore();
    return [x, y - 560 * s];
  }
  function balance(ctx, x, y, s, tilt, wDrop) {                  // burden of proof: a weight lands on the hotel's pan
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    floorShadow(ctx, 0, 330, 260, 1);
    rr(ctx, -16, -40, 32, 370, 8); ctx.fillStyle = '#3B4452'; ctx.fill();
    rr(ctx, -110, 316, 220, 26, 10); ctx.fill();
    ctx.save(); ctx.rotate(tilt);
    rr(ctx, -330, -60, 660, 22, 11); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -49, 22, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    const pan = (px, icon) => {
      ctx.save(); ctx.translate(px, -49); ctx.rotate(-tilt);
      ctx.strokeStyle = '#7D8794'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 170); ctx.moveTo(0, 0); ctx.lineTo(90, 170); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 176, 120, 24, 0, 0, Math.PI * 2); ctx.fillStyle = '#E0D6C4'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 172, 120, 20, 0, 0, Math.PI * 2); ctx.fillStyle = '#F4ECDD'; ctx.fill();
      icon(); ctx.restore();
    };
    pan(-300, () => { ctx.beginPath(); ctx.arc(0, 66, 30, 0, Math.PI * 2); ctx.fillStyle = C.navySoft; ctx.fill();          // you
      ctx.beginPath(); ctx.moveTo(-46, 168); ctx.quadraticCurveTo(0, 86, 46, 168); ctx.closePath(); ctx.fill(); });
    pan(300, () => { ctx.save(); ctx.translate(0, 168); ctx.scale(0.42, 0.42);                                               // hotel valet
      ctx.beginPath(); ctx.moveTo(-100, -270); ctx.lineTo(100, -270); ctx.lineTo(80, 0); ctx.lineTo(-80, 0); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
      txt(ctx, 'VALET', 0, -120, { f: '900 60px Inter', a: 'center', c: C.gold, ls: 4 }); ctx.restore();
      if (wDrop > 0) { const yy = lerp(-560, 0, clamp(wDrop)); ctx.save(); ctx.translate(0, yy);                              // the PROOF weight
        ctx.beginPath(); ctx.moveTo(-90, 52); ctx.lineTo(90, 52); ctx.lineTo(70, -40); ctx.lineTo(-70, -40); ctx.closePath();
        const wg = ctx.createLinearGradient(0, -40, 0, 52); wg.addColorStop(0, '#E9BE6E'); wg.addColorStop(1, '#B98633'); ctx.fillStyle = wg; ctx.fill();
        rr(ctx, -26, -64, 52, 26, 10); ctx.strokeStyle = '#B98633'; ctx.lineWidth = 10; ctx.stroke();
        txt(ctx, 'PROOF', 0, 22, { f: '900 40px Inter', a: 'center', c: C.navy, ls: 2 }); ctx.restore(); } });
    ctx.restore(); ctx.restore();
  }
  function parkingBay(ctx, cx, y) {                              // a self-park bay in light perspective
    ctx.save();
    const fg = ctx.createLinearGradient(0, y - 260, 0, y + 80); fg.addColorStop(0, 'rgba(120,128,140,0)'); fg.addColorStop(0.35, 'rgba(120,128,140,0.28)'); fg.addColorStop(1, 'rgba(120,128,140,0.38)');
    ctx.beginPath(); ctx.moveTo(cx - 360, y - 260); ctx.lineTo(cx + 360, y - 260); ctx.lineTo(cx + 470, y + 80); ctx.lineTo(cx - 470, y + 80); ctx.closePath(); ctx.fillStyle = fg; ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * 300, y - 240); ctx.lineTo(cx + sx * 380, y + 60); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(cx - 300, y - 240); ctx.lineTo(cx + 300, y - 240); ctx.stroke();
    rr(ctx, cx + 300, y - 520, 14, 290, 6); ctx.fillStyle = '#3B4452'; ctx.fill();                       // P sign
    rr(ctx, cx + 252, y - 600, 110, 110, 18); ctx.fillStyle = C.cyanDark; ctx.fill();
    txt(ctx, 'P', cx + 307, y - 512, { f: '900 84px Inter', a: 'center', c: '#FFFFFF' });
    ctx.restore();
  }
  function person(ctx, x, y, s) {                                // you, holding your own keys
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    floorShadow(ctx, 0, 4, 110, 1);
    ctx.beginPath(); ctx.arc(0, -250, 46, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-62, -150); ctx.quadraticCurveTo(0, -200, 62, -150); ctx.lineTo(70, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- scene windows (scale crossfades, as in the approved episodes) ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {
    const i = a <= 0 ? 1 : eo(P(t, a - 0.18, a + fin - 0.18)), o = 1 - eio(P(t, b - fout, b));   // incoming overlaps the outgoing fade: crossfade, no empty dip
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

  // V1–V2: frame zero, the valet ticket with its fine-print line
  function hookScene(ctx, t, thumb) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const push = thumb ? 0 : 0.06 * eio(P(t, E.pulse - 0.3, E.v3));                       // push towards the stub
    ctx.translate(500, 1150); ctx.scale(1 + push, 1 + push); ctx.translate(-500, -1150);
    spotlight(ctx, 500, 1000, 820, 1); halo(ctx, 500, 980, 470, 1);
    floorShadow(ctx, 500, 1420, 300, 1);
    const bob = thumb ? 0 : Math.sin(t * 1.8) * 8, yaw = thumb ? -0.14 : -0.14 + Math.sin(t * 0.9) * 0.05;
    const glow = thumb ? 1 : 0.7 + 0.3 * Math.sin(t * 5) + 0.6 * Math.max(0, 1 - Math.abs(t - E.pulse - 0.3) / 0.5);
    ticket(ctx, 495, 1000 + bob, 0.98, -0.08, { line: 1, glow: clamp(glow, 0, 1.4), yaw, keys: true,
      keySwing: thumb ? 0 : wobble(t - E.swing, 0.18, 1.1, 1.6) + Math.sin(t * 1.4) * 0.03, sheen: thumb ? 0 : P(t, 0.15, 1.15) });
    ctx.restore();
  }
  // V3: the Supreme Court ruling, 14 Nov 2019
  function stampScene(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 980, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6); stampCard(ctx, CX, 960, k, 'SUPREME COURT', '14 NOV 2019'); ctx.restore();
    });
  }
  // V4–V6a: keys to the valet → the car in its care → even if free → lost or damaged
  function valetScene(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v6), () => {
      spotlight(ctx, 560, 1040, 820, 0.8);
      const hook = valetStand(ctx, 210, 1290, 1.0);
      const lostK = eio(P(t, E.lost, E.lost + 0.3)), back = eio(P(t, E.damaged - 0.25, E.damaged));
      const gone = lostK * (1 - back);
      if (gone > 0.02) { ctx.save(); ctx.globalAlpha *= gone; car(ctx, 610, 1290, 0.95, { dashed: true }); ctx.restore(); }
      if (gone < 0.98) { ctx.save(); ctx.globalAlpha *= 1 - gone; car(ctx, 610 + (t < E.damaged ? 0 : wobble(t - E.damaged, 10, 6, 6)), 1290, 0.95, { scratch: P(t, E.damaged, E.damaged + 0.35) }); ctx.restore(); }
      if (t >= E.damaged && t < E.damaged + 0.3) {                                          // scratch spark
        const k = P(t, E.damaged, E.damaged + 0.3);
        ctx.save(); ctx.globalAlpha *= 1 - k; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5;
        for (let i = 0; i < 6; i++) { const a = i * 1.05, r0 = 20 + 60 * k; ctx.beginPath(); ctx.moveTo(610 - 40 + Math.cos(a) * r0, 1220 + Math.sin(a) * r0); ctx.lineTo(610 - 40 + Math.cos(a) * (r0 + 30), 1220 + Math.sin(a) * (r0 + 30)); ctx.stroke(); }
        ctx.restore();
      }
      const sh = spring(t - E.shield, 1.2, 0.6) * (1 - eio(P(t, E.lost - 0.05, E.lost + 0.2)));      // the care shield
      if (sh > 0.01) {
        ctx.save(); ctx.globalAlpha *= clamp(sh);
        ctx.beginPath(); ctx.ellipse(610, 1240, 330 * sh, 210 * sh, 0, Math.PI, 0); ctx.lineTo(610 + 330 * sh, 1290); ctx.lineTo(610 - 330 * sh, 1290); ctx.closePath();
        const g = ctx.createRadialGradient(610, 1200, 40, 610, 1200, 360); g.addColorStop(0, 'rgba(18,170,211,0.06)'); g.addColorStop(1, 'rgba(18,170,211,0.28)');
        ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(18,170,211,0.85)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
      }
      // keys fly from you to the valet's hook
      let kx = -120, ky = 1500, kr = 0.5, kv = t >= E.keysFly - 0.25;
      if (kv) { const k = eio(P(t, E.keysFly - 0.25, E.keysFly + 0.45)); kx = lerp(-120, hook[0] - 50, k); ky = lerp(1500, hook[1] + 6, k) - Math.sin(Math.PI * k) * 260; kr = lerp(0.5, 1.5, k) + (k >= 1 ? wobble(t - E.keysFly - 0.45, 0.25, 1.4, 2) : 0); keys(ctx, kx, ky, 0.85, kr); }
      if (t >= E.freeTag) {                                                                  // a FREE tag swings onto the stand
        const k = spring(t - E.freeTag, 1.3, 0.55);
        ctx.save(); ctx.translate(210, 925 - (1 - clamp(k)) * 160); ctx.rotate(wobble(t - E.freeTag, 0.2, 1.2, 1.8));
        ctx.globalAlpha *= clamp(k * 2); card(ctx, -90, -40, 180, 80, 16, C.cyan, { blur: 14, oy: 6 });
        txt(ctx, 'FREE', 0, 22, { f: '900 54px Inter', a: 'center', c: C.navy, ls: 3 }); ctx.restore();
      }
      const l1 = 1 - eio(P(t, E.freeTag - 0.1, E.freeTag + 0.2)), l2 = 1 - eio(P(t, E.lost - 0.1, E.lost + 0.15));
      if (t >= E.careLab && l1 > 0) { ctx.save(); ctx.globalAlpha *= l1; pill(ctx, "HOTEL'S CARE", CX, PILL_Y, spring(t - E.careLab, 1.6, 0.6), { icon: 'ok' }); ctx.restore(); }
      if (t >= E.freeLab && l2 > 0) { ctx.save(); ctx.globalAlpha *= l2; pill(ctx, 'STILL COUNTS', CX, PILL_Y, spring(t - E.freeLab, 1.6, 0.6), { icon: 'ok' }); ctx.restore(); }
    }, 0.04 * P(t, E.v4, E.v6));
  }
  // V6b: the burden of proof falls on the hotel
  function proofScene(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1000, 760, 0.7);
      const d = spring(t - E.weight - 0.3, 1.1, 0.45);
      balance(ctx, CX, 960, 1.0, 0.16 * d, P(t, E.weight - 0.05, E.weight + 0.3));
      pill(ctx, 'HOTEL MUST PROVE', CX, PILL_Y, spring(t - E.proveLab, 1.6, 0.6));
    });
  }
  // V7: the owner's-risk line is struck and torn away
  function strikeScene(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1000, 820, 0.9); halo(ctx, 500, 980, 460, 0.7);
      const tear = P(t, E.crumble, E.crumble + 0.8);
      floorShadow(ctx, 500, 1420, 300, 1);
      const sk = P(t, E.strike, E.strike + 0.3);
      ticket(ctx, 500 + wobble(t - E.strike, 8, 5, 6), 990, 1.0, 0.04, { line: 1, glow: 0.6 + 0.4 * Math.sin(t * 5), yaw: 0.1 + Math.sin(t * 0.9) * 0.04, strike: sk, tear, keys: false });
      pill(ctx, 'NEGLIGENCE: NO EXCUSE', CX, PILL_Y, spring(t - E.noExcLab, 1.6, 0.6), { f: '900 58px Inter' });
    }, 0.02 * P(t, E.v7, E.v8));
  }
  // V8: self-parked — no handover, so the rule doesn't apply
  function selfParkScene(ctx, t) {
    withScene(ctx, win(t, E.v8, E.v9), () => {
      spotlight(ctx, CX, 1060, 780, 0.6);
      parkingBay(ctx, 560, 1240);
      const k = eio(P(t, E.park, E.park + 0.8));
      car(ctx, lerp(-260, 560, k), 1250, 0.8, {});
      if (t >= E.keysStay) { ctx.save(); const pk = spring(t - E.keysStay, 1.6, 0.6); ctx.globalAlpha *= clamp(pk * 2); person(ctx, 175, 1300 + (1 - clamp(pk)) * 40, 0.95); ctx.restore(); }
      if (t >= E.keysStay) { const kk = spring(t - E.keysStay, 1.5, 0.55); keys(ctx, 238, 1150 - (1 - clamp(kk)) * 120, 0.8, 1.2 + wobble(t - E.keysStay, 0.2, 1.3, 2)); badge(ctx, 175, 960, spring(t - E.keysStay - 0.2, 2, 0.5), true, 36); }
      if (t >= E.noHand - 0.4) {                                                          // the care shield can't form
        const k = P(t, E.noHand - 0.4, E.noHand + 0.2);
        ctx.save(); ctx.globalAlpha *= (1 - P(t, E.noHand + 0.2, E.noHand + 0.6)) * 0.9;
        ctx.setLineDash([22, 18]); ctx.strokeStyle = C.cyan; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.ellipse(560, 1205, 300 * (0.85 + 0.15 * k), 190, 0, Math.PI, 0); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
        badge(ctx, 560, 1010, spring(t - E.noHand, 2, 0.5), false, 48);
      }
      pill(ctx, 'NO HANDOVER', CX, PILL_Y, spring(t - E.noHand - 0.1, 1.6, 0.6), { icon: 'no' });
    });
  }
  // V9: payoff — keep the ticket, report damage in writing
  function payoffScene(ctx, t) {
    withScene(ctx, win(t, E.v9, E.v10 + 0.3, 0.35, 0.5), () => {
      spotlight(ctx, CX, 1000, 780, 0.7);
      const k = spring(t - E.keep, 1.3, 0.62), mv = eio(P(t, E.write - 0.3, E.write + 0.3));
      ticket(ctx, lerp(500, 260, mv), lerp(1020, 1010, mv) + (1 - clamp(k)) * 320, lerp(0.85, 0.55, mv) * clamp(k * 1.3, 0, 1), lerp(-0.06, -0.14, mv), { line: 0, yaw: -0.1, keys: false });
      badge(ctx, lerp(650, 360, mv), lerp(720, 840, mv), spring(t - E.keep - 0.4, 2, 0.5), true, 46);
      if (t >= E.write) { const kw = spring(t - E.write, 1.4, 0.62); writtenNote(ctx, lerp(900, 640, clamp(kw)), 1040, 0.82 * clamp(kw * 1.3, 0, 1), P(t, E.write + 0.25, E.write + 1.7), 1 - P(t, E.write + 1.7, E.write + 2.0)); }
      if (t >= E.writeLab) pill(ctx, 'IN WRITING', CX, PILL_Y, spring(t - E.writeLab, 1.6, 0.6), { icon: 'ok' });
    });
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    hookScene(ctx, t, thumb);
    if (thumb) return;
    stampScene(ctx, t); valetScene(ctx, t); proofScene(ctx, t); strikeScene(ctx, t); selfParkScene(ctx, t); payoffScene(ctx, t);
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
