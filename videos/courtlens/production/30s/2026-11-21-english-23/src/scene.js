/* Courtlens · "Is this legal in India?" · Episode 23 (English, english-23, batch 23): licence at home, but on your phone —
 * can the traffic police insist on paper? Basis:
 *   CMVR 1989 rule 139 as amended by G.S.R. 1081(E), 2 Nov 2018: certificates and the driving licence may be produced
 *     "in physical or electronic form" (amending text via reproduction; MoRTH page not retrievable here)
 *   MoRTH letter RT-11036/64/2017-MVL, 8 Aug 2018 (official copy annexed to Kerala Police Circular 25/2018): DigiLocker /
 *     mParivahan records "deemed to be legally recognised at par with the original documents" (IT Act 2000); impounding
 *     can be reflected electronically via eChallan, no physical seizure needed
 *   PIB release 26 Sep 2020 (MoRTH, G.S.R. 584(E) of 25 Sep 2020, w.e.f. 1 Oct 2020): documents validated through
 *     electronic means by the enforcement officer "shall not be demanded" in physical form, "including in cases where
 *     there is an offence made out necessitating seizure"
 * Replaces the proposed "NO RETURNS vs defective" topic (episodes 01/04). Built on the english-22 engine (captions at
 * y≈280–460, chip y 478, pills y≈1418, crossfade windows). Frame zero = thumbnail.
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
  // a generic driving licence card (illustrative, not an official design). o: flip (0..1 card turn), glow
  function licence(ctx, x, y, s, rot, o = {}) {
    const sx = Math.max(0.04, Math.abs(Math.cos(Math.PI * (o.flip || 0))));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * sx, s);
    ctx.save(); ctx.shadowColor = o.glow ? `rgba(18,170,211,${0.8 * o.glow})` : 'rgba(2,25,59,0.30)'; ctx.shadowBlur = o.glow ? 50 : 34; ctx.shadowOffsetY = o.glow ? 0 : 14;
    rr(ctx, -210, -130, 420, 260, 22); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -210, -130, 420, 260, 22); ctx.clip();
    ctx.fillStyle = C.cyanDark; ctx.fillRect(-210, -130, 420, 64);
    const g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, 'rgba(216,239,246,0.0)'); g.addColorStop(1, 'rgba(216,239,246,0.6)');
    ctx.fillStyle = g; ctx.fillRect(-210, -66, 420, 196); ctx.restore();
    txt(ctx, 'DRIVING LICENCE', 0, -86, { f: '900 30px Inter', a: 'center', c: '#FFFFFF', ls: 4 });
    rr(ctx, -180, -40, 120, 140, 12); ctx.fillStyle = C.cyanTint; ctx.fill();                         // photo
    ctx.beginPath(); ctx.arc(-120, 4, 30, 0, Math.PI * 2); ctx.fillStyle = C.navySoft; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-168, 96); ctx.quadraticCurveTo(-120, 34, -72, 96); ctx.closePath(); ctx.fill();
    for (const [yy, w] of [[-18, 210], [22, 170], [62, 200]]) { rr(ctx, -30, yy - 8, w, 16, 8); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    rr(ctx, 120, 78, 56, 40, 8); ctx.fillStyle = C.gold; ctx.fill();                                   // chip
    ctx.restore();
  }
  // a phone; o.screen: 'card' | 'apps' | 'add' | 'blank'; o.cardK (0..1 card on screen), o.ok, o.glow
  function phone(ctx, x, y, s, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (o.glow > 0) { const g = ctx.createRadialGradient(0, 0, 60, 0, 0, 420); g.addColorStop(0, `rgba(18,170,211,${0.35 * o.glow})`); g.addColorStop(1, 'rgba(18,170,211,0)'); ctx.fillStyle = g; ctx.fillRect(-460, -560, 920, 1120); }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.4)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 18;
    rr(ctx, -160, -310, 320, 620, 44); ctx.fillStyle = '#0B1A33'; ctx.fill(); ctx.restore();
    rr(ctx, -146, -292, 292, 584, 32); const sg = ctx.createLinearGradient(0, -292, 0, 292); sg.addColorStop(0, '#F7FBFD'); sg.addColorStop(1, '#DDEFF6'); ctx.fillStyle = sg; ctx.fill();
    rr(ctx, -40, -282, 80, 14, 7); ctx.fillStyle = '#0B1A33'; ctx.fill();
    ctx.save(); rr(ctx, -146, -292, 292, 584, 32); ctx.clip();
    if (o.screen === 'card' || o.screen === 'add') {
      rr(ctx, -120, -240, 240, 40, 12); ctx.fillStyle = C.navy; ctx.fill();
      txt(ctx, 'MY DOCUMENTS', 0, -212, { f: '800 22px Inter', a: 'center', c: '#FFFFFF', ls: 3 });
      if ((o.cardK ?? 1) > 0) { ctx.save(); ctx.globalAlpha *= clamp((o.cardK ?? 1) * 1.5); licence(ctx, 0, -60 + (1 - (o.cardK ?? 1)) * 140, 0.6, 0, { glow: o.cardGlow || 0 }); ctx.restore(); }
      if (o.screen === 'add') {
        rr(ctx, -110, 110, 220, 70, 35); ctx.fillStyle = C.cyan; ctx.fill();
        txt(ctx, '+ ADD', 0, 157, { f: '900 36px Inter', a: 'center', c: C.navy, ls: 2 });
      }
    }
    ctx.restore();
    if (o.ok > 0) badge(ctx, 120, -250, o.ok, true, 44);
    ctx.restore();
  }
  function appTile(ctx, x, y, k, label, glyph) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    card(ctx, -96, -96, 192, 192, 44, C.card, { blur: 30, oy: 12 });
    glyph(ctx);
    txt(ctx, label, 0, 150, { f: '900 36px Inter', a: 'center', c: C.navy, ls: 1, maxW: 260 });
    ctx.restore();
  }
  const glLocker = ctx => { rr(ctx, -50, -46, 100, 96, 16); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -46, 30, Math.PI, 0); ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill(); rr(ctx, -5, 0, 10, 26, 4); ctx.fill(); };
  const glCar = ctx => { ctx.beginPath(); ctx.moveTo(-64, 20); ctx.lineTo(-64, -4); ctx.lineTo(-40, -8); ctx.lineTo(-22, -40); ctx.lineTo(26, -40); ctx.lineTo(46, -8); ctx.lineTo(64, -4); ctx.lineTo(64, 20); ctx.closePath();
    ctx.fillStyle = C.cyanDark; ctx.fill(); for (const wx of [-36, 36]) { ctx.beginPath(); ctx.arc(wx, 22, 14, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill(); } };
  // the officer's handheld checking device. o.mode: 'idle' | 'scan' | 'ok' | 'offence' | 'record'; o.beam (0..1)
  function device(ctx, x, y, s, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (o.beam > 0) {                                                                                  // scanning beam
      ctx.save(); ctx.globalAlpha *= o.beam; const bg = ctx.createLinearGradient(0, -240, 0, -560);
      bg.addColorStop(0, 'rgba(18,170,211,0.55)'); bg.addColorStop(1, 'rgba(18,170,211,0)');
      ctx.beginPath(); ctx.moveTo(-50, -250); ctx.lineTo(50, -250); ctx.lineTo(200, -600); ctx.lineTo(-200, -600); ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    rr(ctx, -130, -250, 260, 500, 40); ctx.fillStyle = '#2E3644'; ctx.fill(); ctx.restore();
    rr(ctx, -60, -266, 120, 30, 10); ctx.fillStyle = '#1B2230'; ctx.fill();
    rr(ctx, -40, -262, 80, 12, 6); ctx.fillStyle = o.beam > 0 ? C.cyan : '#5E6876'; ctx.fill();
    rr(ctx, -104, -210, 208, 230, 18); ctx.fillStyle = '#0B1A33'; ctx.fill();                          // screen
    const m = o.mode || 'idle';
    if (m === 'scan') { ctx.save(); rr(ctx, -104, -210, 208, 230, 18); ctx.clip(); const yy = -200 + ((o.t || 0) * 260) % 220; ctx.fillStyle = 'rgba(18,170,211,0.6)'; ctx.fillRect(-104, yy, 208, 6); ctx.restore(); }
    if (m === 'ok') { badge(ctx, 0, -120, o.k ?? 1, true, 52); txt(ctx, 'VERIFIED', 0, -20, { f: '900 32px Inter', a: 'center', c: '#7FD6EE', ls: 3 }); }
    if (m === 'offence' || m === 'record') {
      rr(ctx, -84, -184, 168, 44, 10); ctx.fillStyle = C.red; ctx.fill();
      txt(ctx, 'OFFENCE', 0, -152, { f: '900 28px Inter', a: 'center', c: '#FFF4DF', ls: 3 });
      for (let i = 0; i < 3; i++) { rr(ctx, -84, -110 + i * 36, [150, 120, 140][i], 14, 7); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); }
      if (m === 'record') { rr(ctx, -84, -18, 168, 30, 8); ctx.fillStyle = `rgba(18,170,211,${0.9 * (o.k ?? 1)})`; ctx.fill();
        txt(ctx, 'RECORDED', 0, 4, { f: '900 22px Inter', a: 'center', c: C.navy, ls: 2 }); }
    }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { rr(ctx, -84 + j * 60, 50 + i * 56, 48, 40, 10); ctx.fillStyle = '#3B4452'; ctx.fill(); }
    ctx.restore();
  }
  function cloudDb(ctx, x, y, k) {                               // the online record (generic database)
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    for (let i = 2; i >= 0; i--) { ctx.beginPath(); ctx.ellipse(0, i * 48, 90, 26, 0, 0, Math.PI * 2); ctx.fillStyle = i === 0 ? C.cyan : C.cyanDark; ctx.fill();
      ctx.fillRect(-90, i * 48, 180, 30); ctx.beginPath(); ctx.ellipse(0, i * 48 + 30, 90, 26, 0, 0, Math.PI * 2); ctx.fillStyle = C.cyanDark; ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(0, 0, 90, 26, 0, 0, Math.PI * 2); ctx.fillStyle = '#7FD6EE'; ctx.fill();
    ctx.restore();
  }
  // ---------- the hook: a night checkpoint seen through the windshield ----------
  function checkpoint(ctx, t, thumb) {
    const L = 100, R = 900, T = 610, B = 1190;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;   // windshield frame
    ctx.beginPath(); ctx.moveTo(L + 50, T); ctx.lineTo(R - 50, T); ctx.quadraticCurveTo(R, T, R + 10, T + 60); ctx.lineTo(R + 40, B); ctx.lineTo(L - 40, B); ctx.lineTo(L - 10, T + 60); ctx.quadraticCurveTo(L, T, L + 50, T); ctx.closePath();
    ctx.fillStyle = '#1B2C52'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(L + 60, T + 16); ctx.lineTo(R - 60, T + 16); ctx.quadraticCurveTo(R - 12, T + 16, R - 4, T + 70); ctx.lineTo(R + 22, B); ctx.lineTo(L - 22, B); ctx.lineTo(L + 4, T + 70); ctx.quadraticCurveTo(L + 12, T + 16, L + 60, T + 16); ctx.closePath(); ctx.clip();
    const sky = ctx.createLinearGradient(0, T, 0, B); sky.addColorStop(0, '#0B1A33'); sky.addColorStop(0.55, '#1B2C52'); sky.addColorStop(1, '#2B3A55'); ctx.fillStyle = sky; ctx.fillRect(0, T, W, B - T);
    const vx = 500, vy = 880;
    ctx.beginPath(); ctx.moveTo(vx - 30, vy); ctx.lineTo(vx + 30, vy); ctx.lineTo(R + 120, B); ctx.lineTo(L - 120, B); ctx.closePath(); ctx.fillStyle = '#3B4452'; ctx.fill();   // road
    const sp = thumb ? 0 : (t * 0.9) % 1;                                                               // lane dashes rolling in
    for (let i = 0; i < 5; i++) { const u = ((i + sp) / 5), u2 = Math.min(1, u + 0.08), y1 = lerp(vy, B, u * u), y2 = lerp(vy, B, u2 * u2), w1 = lerp(2, 16, u * u), w2 = lerp(2, 16, u2 * u2);
      ctx.beginPath(); ctx.moveTo(vx - w1, y1); ctx.lineTo(vx + w1, y1); ctx.lineTo(vx + w2, y2); ctx.lineTo(vx - w2, y2); ctx.closePath(); ctx.fillStyle = 'rgba(246,217,160,0.7)'; ctx.fill(); }
    // flashing police lights: red / cyan alternate (brand red and cyan)
    const ph = 0.25 + t * 2.2, red = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2), cy = 1 - red;
    const flare = thumb ? 0 : Math.max(0, 1 - Math.abs(t - E.check) / 0.6);
    for (const [lx, a, rgb] of [[380, red, '181,67,47'], [620, cy, '18,170,211']]) {
      const g = ctx.createRadialGradient(lx, 930, 4, lx, 930, 300 + 120 * flare); g.addColorStop(0, `rgba(${rgb},${0.55 * a + 0.2})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(L - 40, T, R - L + 80, B - T);
    }
    // barricade with POLICE board
    for (let i = 0; i < 6; i++) { ctx.beginPath(); const x0 = 330 + i * 57; ctx.moveTo(x0, 950); ctx.lineTo(x0 + 28, 950); ctx.lineTo(x0 + 18, 990); ctx.lineTo(x0 - 10, 990); ctx.closePath(); ctx.fillStyle = i % 2 ? '#FFFDF8' : C.red; ctx.fill(); }
    rr(ctx, 320, 945, 360, 8, 4); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    rr(ctx, 336, 990, 10, 50, 4); ctx.fillStyle = '#9AA3AF'; ctx.fill(); rr(ctx, 654, 990, 10, 50, 4); ctx.fill();
    rr(ctx, 410, 880, 180, 54, 10); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    txt(ctx, 'POLICE', 500, 921, { f: '900 38px Inter', a: 'center', c: C.navy, ls: 5 });
    for (const [lx, a, c] of [[380, red, '#E5735F'], [620, cy, '#7FD6EE']]) { ctx.beginPath(); ctx.arc(lx, 936, 14, 0, Math.PI * 2); ctx.fillStyle = c; ctx.globalAlpha = 0.5 + 0.5 * a; ctx.fill(); ctx.globalAlpha = 1; }
    // a traffic cone, near the car (depth)
    ctx.beginPath(); ctx.moveTo(800, 1180); ctx.lineTo(860, 1180); ctx.lineTo(838, 1060); ctx.lineTo(822, 1060); ctx.closePath(); ctx.fillStyle = '#E5735F'; ctx.fill();
    rr(ctx, 808, 1110, 44, 16, 4); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    ctx.restore();
    // dashboard (foreground depth)
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 40;
    ctx.beginPath(); ctx.moveTo(0, 1170); ctx.quadraticCurveTo(500, 1120, W, 1170); ctx.lineTo(W, 1480); ctx.lineTo(0, 1480); ctx.closePath();
    const dg = ctx.createLinearGradient(0, 1130, 0, 1480); dg.addColorStop(0, '#22324F'); dg.addColorStop(0.62, '#0F213F'); dg.addColorStop(1, 'rgba(11,26,51,0)'); ctx.fillStyle = dg; ctx.fill(); ctx.restore();   // fades into the paper (no hard edge)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 1100, W, 360); ctx.clip(); ctx.beginPath(); ctx.arc(170, 1640, 330, Math.PI * 1.22, Math.PI * 1.78); ctx.strokeStyle = '#060F21'; ctx.lineWidth = 48; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();   // steering wheel
    // the wallet on the dash: licence slot empty
    const hk = 0.6 + 0.4 * Math.cos(t * 4) + 0.8 * Math.max(0, 1 - Math.abs(t - E.home) / 0.6);   // t=0 equals the thumbnail
    ctx.save(); ctx.translate(300, 1300); ctx.rotate(-0.06);
    rr(ctx, -150, -86, 300, 172, 22); ctx.fillStyle = '#7A4E2A'; ctx.fill();
    rr(ctx, -130, -66, 260, 132, 14); ctx.fillStyle = '#5E3B1F'; ctx.fill();
    ctx.setLineDash([16, 12]); rr(ctx, -110, -48, 220, 96, 12); ctx.strokeStyle = `rgba(229,115,95,${clamp(hk, 0.35, 1)})`; ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]);
    txt(ctx, '?', 0, 26, { f: '900 72px Inter', a: 'center', c: `rgba(229,115,95,${clamp(hk, 0.35, 1)})` });
    ctx.restore();
    // the phone in its dash mount, glowing with the licence
    rr(ctx, 640, 1300, 24, 90, 8); ctx.fillStyle = '#060F21'; ctx.fill();
    phone(ctx, 652, 1180, 0.62, 0.04, { screen: 'card', cardK: 1, glow: 0.8 + 0.2 * Math.cos(t * 3), cardGlow: 0.6 });
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

  function hookScene(ctx, t, thumb) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const push = thumb ? 0 : 0.05 * eio(P(t, 0, E.v3));
    ctx.translate(500, 1100); ctx.scale(1 + push, 1 + push); ctx.translate(-500, -1100);
    checkpoint(ctx, t, thumb);
    ctx.restore();
  }
  function stampScene(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 980, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6); stampCard(ctx, CX, 960, k, 'INDIA', 'MOTOR VEHICLE RULES'); ctx.restore();
    });
  }
  // V3: the plastic card turns and flies into the phone: electronic form
  function morphScene(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1000, 760, 0.7); halo(ctx, 640, 980, 420, P(t, E.intoPhone, E.intoPhone + 0.4));
      const pk = spring(t - E.v4 + 0.1, 1.3, 0.62);
      phone(ctx, 650, 1000 + (1 - clamp(pk)) * 400, 0.95, 0.03, { screen: 'card', cardK: P(t, E.intoPhone + 0.1, E.intoPhone + 0.45), glow: P(t, E.intoPhone, E.intoPhone + 0.4), ok: spring(t - E.elLab, 2, 0.5) });
      const fk = eio(P(t, E.flip, E.intoPhone + 0.25));
      if (fk < 1) {
        const x = lerp(300, 650, fk), y = lerp(1060, 940, fk) - Math.sin(Math.PI * fk) * 140, sc = lerp(0.95, 0.55, fk);
        ctx.save(); ctx.globalAlpha *= 1 - P(fk, 0.85, 1); licence(ctx, x, y, sc, lerp(-0.12, 0, fk), { flip: clamp(fk * 2) }); ctx.restore();
      }
      pill(ctx, 'ELECTRONIC FORM', CX, PILL_Y, spring(t - E.elLab, 1.6, 0.6), { icon: 'ok' });
    }, 0.03 * P(t, E.v4, E.v5));
  }
  // V4: DigiLocker or mParivahan
  function appsScene(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      phone(ctx, CX, 1010, 0.8, 0, { screen: 'card', cardK: 1, glow: 0.5 });
      for (const [te, x, lab, gl] of [[E.tile1, 210, 'DigiLocker', glLocker], [E.tile2, 790, 'mParivahan', glCar]]) {
        const k = spring(t - te, 1.8, 0.55);
        appTile(ctx, x, 940 + Math.sin(t * 2 + x) * 6, clamp(k, 0, 1.15), lab, gl);
        if (t >= te) {                                                           // a link pulses from the tile to the phone
          const lk = P(t, te + 0.15, te + 0.55); ctx.save(); ctx.globalAlpha *= 1 - P(t, te + 0.55, te + 0.9);
          const px = lerp(x, CX, lk); ctx.beginPath(); ctx.arc(px, 940 + 30 * Math.sin(Math.PI * lk), 12, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill(); ctx.restore();
          badge(ctx, x + 72, 862, spring(t - te - 0.3, 2, 0.5), true, 28);
        }
      }
    });
  }
  // V5: the electronic copy counts like the original
  function equalScene(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      const a = spring(t - E.v6 + 0.05, 1.4, 0.6);
      licence(ctx, 260 - (1 - clamp(a)) * 300, 1000, 0.72, -0.06, {});
      phone(ctx, 760 + (1 - clamp(a)) * 300, 1000, 0.72, 0.04, { screen: 'card', cardK: 1, glow: 0.4 });
      const ek = spring(t - E.eq, 1.8, 0.5);
      if (ek > 0) { ctx.save(); ctx.translate(500, 1000); ctx.scale(ek, ek); ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
        rr(ctx, -32, -20, 64, 12, 6); ctx.fillStyle = C.navy; ctx.fill(); rr(ctx, -32, 8, 64, 12, 6); ctx.fill(); ctx.restore(); }
      pill(ctx, 'SAME AS ORIGINAL', CX, PILL_Y, spring(t - E.sameLab, 1.6, 0.6));
    });
  }
  // V6: the officer verifies it electronically → no paper demanded
  function verifyScene(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1000, 800, 0.7);
      const dk = spring(t - E.v7 + 0.05, 1.3, 0.62);
      const mode = t < E.scan ? 'idle' : t < E.verified ? 'scan' : 'ok';
      phone(ctx, 690, 900, 0.7, 0.06, { screen: 'card', cardK: 1, glow: mode === 'ok' ? 0.8 : 0.4, ok: spring(t - E.verified - 0.1, 2, 0.5) });
      device(ctx, 300 - (1 - clamp(dk)) * 400, 1160, 0.82, 0.32, { mode, t, beam: t >= E.scan && t < E.verified + 0.2 ? 1 - P(t, E.verified, E.verified + 0.2) : 0, k: spring(t - E.verified, 2, 0.5) });
      if (t >= E.ghost) {                                                       // a paper copy is waved off
        const g = spring(t - E.ghost, 1.4, 0.6);
        ctx.save(); ctx.globalAlpha *= 0.55 * clamp(g * 2); ctx.setLineDash([16, 12]);
        rr(ctx, 560, 1120, 260, 160, 18); ctx.strokeStyle = C.navySoft; ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]);
        txt(ctx, 'PAPER', 690, 1215, { f: '900 44px Inter', a: 'center', c: C.navySoft, ls: 4 }); ctx.restore();
        badge(ctx, 820, 1120, spring(t - E.noPaper, 2, 0.5), false, 44);
      }
      pill(ctx, 'NO PAPER DEMANDED', CX, PILL_Y, spring(t - E.noPaper - 0.1, 1.6, 0.6));
    });
  }
  // V7: even with an offence, seizure is recorded online
  function seizeScene(ctx, t) {
    withScene(ctx, win(t, E.v8, E.v9), () => {
      spotlight(ctx, CX, 1000, 800, 0.7);
      const mode = t < E.offence ? 'idle' : t < E.record ? 'offence' : 'record';
      device(ctx, 330, 1050, 0.85, 0.05, { mode, k: P(t, E.record, E.record + 0.3) });
      phone(ctx, 760, 1080, 0.6, 0.06, { screen: 'card', cardK: 1, glow: 0.3, ok: spring(t - E.record - 0.2, 2, 0.5) });
      if (t >= E.seize) {                                                       // the record flies to the online database
        const k = P(t, E.seize, E.record);
        cloudDb(ctx, 560, 700, spring(t - E.seize, 1.6, 0.6) * 0.9);
        if (k > 0 && k < 1) { ctx.save(); ctx.globalAlpha *= 1 - P(k, 0.8, 1); const x = lerp(340, 560, eio(k)), y = lerp(920, 740, eio(k)) - Math.sin(Math.PI * k) * 80;
          rr(ctx, x - 40, y - 26, 80, 52, 10); ctx.fillStyle = C.red; ctx.fill(); rr(ctx, x - 26, y - 6, 52, 10, 5); ctx.fillStyle = '#FFF4DF'; ctx.fill(); ctx.restore(); }
      }
      pill(ctx, 'RECORDED ONLINE', CX, PILL_Y, spring(t - E.recLab, 1.6, 0.6), { icon: 'ok' });
    });
  }
  // V8: payoff — add your licence before you drive
  function payoffScene(ctx, t) {
    withScene(ctx, win(t, E.v9, E.v10 + 0.3, 0.35, 0.5), () => {
      spotlight(ctx, CX, 1000, 780, 0.7); halo(ctx, CX, 1000, 460, P(t, E.slide, E.slide + 0.5));
      const pk = spring(t - E.v9 + 0.05, 1.3, 0.62);
      const sk = P(t, E.slide - 0.5, E.slide);
      phone(ctx, CX, 1010 + (1 - clamp(pk)) * 400, 0.95, 0, { screen: 'add', cardK: sk, glow: P(t, E.slide, E.slide + 0.5), ok: spring(t - E.addLab, 2, 0.5) });
      if (t >= E.add - 0.1 && t < E.slide + 0.1) {                                 // tap on + ADD
        const k = P(t, E.add - 0.1, E.add + 0.4); ctx.save(); ctx.globalAlpha *= 1 - P(t, E.add + 0.4, E.add + 0.8);
        ctx.beginPath(); ctx.arc(CX, 1010 + 145 * 0.95, 20 + 70 * k, 0, Math.PI * 2); ctx.strokeStyle = C.cyan; ctx.lineWidth = 8 * (1 - k) + 2; ctx.stroke(); ctx.restore();
      }
      pill(ctx, 'ADD IT NOW', CX, PILL_Y, spring(t - E.addLab, 1.6, 0.6), { icon: 'ok' });
    });
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    hookScene(ctx, t, thumb);
    if (thumb) return;
    stampScene(ctx, t); morphScene(ctx, t); appsScene(ctx, t); equalScene(ctx, t); verifyScene(ctx, t); seizeScene(ctx, t); payoffScene(ctx, t);
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
