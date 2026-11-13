/* Courtlens · "Is this legal in India?" · Episode 13 (English, english-13): can a bank refuse to exchange a torn note?
 * Basis: RBI Master Direction – Facility for Exchange of Notes and Coins (2026, updated 16 Oct 2026), RBI (Note Refund)
 * Rules 2009 as amended 2018, RB-IOS 2026. Built on the english-12 engine under context/09-feedback-rules-2026-11-11.md:
 * one visual idea at a time, large brief labels, sequential reveals, depth and lighting, captions inside x 100..900.
 * The banknote is a stylised prop (no portrait, no security features), not a reproduction of a real note.
 * Every element is a pure function of time t (seconds) so frames are deterministic.
 */
(function () {
  const W = 1080, H = 1920, CX = 500;            // visual centre follows the caption centre (x 100..900)
  const C = {
    paper: '#F4EEE2', paperDeep: '#E9E0CF', card: '#FFFDF8',
    navy: '#02193B', navySoft: 'rgba(2,25,59,0.62)', navyFaint: 'rgba(2,25,59,0.16)',
    cyan: '#12AAD3', cyanDark: '#0A7EA4', cyanMark: '#B4E3F1', cyanTint: '#D8EFF6',
    gold: '#D7A351', warm: '#F6D9A0',
    red: '#B5432F', redTint: '#F6DFD8', redDark: '#8E2F1F',
    noteA: '#DCD9C6', noteB: '#C7CBB3', noteInk: '#4C5A43', noteEdge: '#F8F5EA',
  };
  let TL, E, ICON, GRAIN;

  // ---------- math ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eo = x => 1 - Math.pow(1 - x, 3);
  const ei = x => x * x * x;
  const eob = (x, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  function spring(dt, f = 1.5, z = 0.55) {
    if (dt <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
  }
  const wobble = (dt, amp, f = 1.1, decay = 2.2) => (dt <= 0 ? 0 : amp * Math.exp(-dt * decay) * Math.sin(2 * Math.PI * f * dt));

  // ---------- drawing helpers ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
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
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ok ? C.cyan : C.red; ctx.fill();
    if (ok) check(ctx, 0, 1, 1.6, C.navy, 6); else cross(ctx, 0, 0, 1.3, '#FFF8EE', 7);
    ctx.restore();
  }

  // ---------- background with soft lighting ----------
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); const id = g.createImageData(W, H);
    let s = 20261113 >>> 0;
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
    ctx.drawImage(GRAIN, 0, 0);
  }
  function spotlight(ctx, cx, cy, r, a) {             // warm pool of light (depth), full-frame soft falloff
    const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, r);
    g.addColorStop(0, `rgba(246,217,160,${0.55 * a})`); g.addColorStop(1, 'rgba(246,217,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function tableShadow(ctx, cx, cy, rx, a) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.16);
    const g = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
    g.addColorStop(0, `rgba(2,25,59,${0.22 * a})`); g.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ---------- the stylised banknote (600 x 264, centred on the origin) ----------
  const NW = 600, NH = 264;
  const TEAR = [8, -14, 12, -9, 15, -12, 9, -7, 5];   // jagged tear, top to bottom (x offsets)
  function drawNote(ctx, o = {}) {
    const x0 = -NW / 2, y0 = -NH / 2;
    const g = ctx.createLinearGradient(x0, y0, x0 + NW, y0 + NH);
    g.addColorStop(0, o.fresh ? '#E4E2D0' : C.noteA); g.addColorStop(1, o.fresh ? '#D2D6BE' : C.noteB);
    rr(ctx, x0, y0, NW, NH, 14); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(76,90,67,0.40)'; ctx.lineWidth = 4; rr(ctx, x0 + 16, y0 + 16, NW - 32, NH - 32, 8); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x0 + NW * 0.21, 0, NH * 0.25, NH * 0.31, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,248,0.72)'; ctx.fill();
    txt(ctx, '₹', x0 + NW * 0.21, 26, { f: '800 72px Inter', a: 'center', c: 'rgba(76,90,67,0.30)' });
    txt(ctx, '₹500', x0 + NW * 0.66, 34, { f: '900 96px Inter', a: 'center', c: C.noteInk });
    txt(ctx, '500', x0 + 34, y0 + 58, { f: '800 30px Inter', c: C.noteInk });
    txt(ctx, '500', x0 + NW - 34, y0 + NH - 30, { f: '800 30px Inter', a: 'right', c: C.noteInk });
    if (o.shine > 0 && o.shine < 1) {                 // a light sweep across a fresh note
      ctx.save(); rr(ctx, x0, y0, NW, NH, 14); ctx.clip();
      const sx = lerp(x0 - 200, x0 + NW + 200, o.shine);
      const sg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.65)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(x0, y0, NW, NH); ctx.restore();
    }
    if (o.dim > 0) { rr(ctx, x0, y0, NW, NH, 14); ctx.fillStyle = `rgba(120,118,108,${o.dim})`; ctx.fill(); }
  }
  function tearPath(ctx, side, xBase = 0) {           // clip polygon for one half of a torn note
    const ys = TEAR.map((_, i) => -NH / 2 + (NH * i) / (TEAR.length - 1));
    const ex = side < 0 ? -NW / 2 - 6 : NW / 2 + 6;
    ctx.beginPath(); ctx.moveTo(ex, -NH / 2 - 6); ctx.lineTo(xBase + TEAR[0], -NH / 2 - 6);
    TEAR.forEach((dx, i) => ctx.lineTo(xBase + dx, ys[i]));
    ctx.lineTo(xBase + TEAR[TEAR.length - 1], NH / 2 + 6); ctx.lineTo(ex, NH / 2 + 6); ctx.closePath();
  }
  function tearEdge(ctx, xBase = 0, upto = 1) {      // pale fibrous paper edge along the tear
    const ys = TEAR.map((_, i) => -NH / 2 + (NH * i) / (TEAR.length - 1));
    const n = Math.max(1, Math.round((TEAR.length - 1) * upto));
    ctx.beginPath(); ctx.moveTo(xBase + TEAR[0], ys[0]);
    for (let i = 1; i <= n; i++) ctx.lineTo(xBase + TEAR[i], ys[i]);
    ctx.strokeStyle = C.noteEdge; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function noteHalf(ctx, side, o = {}) {
    ctx.save(); tearPath(ctx, side); ctx.clip(); drawNote(ctx, o); tearEdge(ctx); ctx.restore();
  }
  // a note with a piece missing: keep the part left of a jagged cut at fraction r of the width
  function cutX(r) { return -NW / 2 + NW * r; }
  function notePiece(ctx, r, o = {}) {
    ctx.save(); tearPath(ctx, -1, cutX(r)); ctx.clip(); drawNote(ctx, o); tearEdge(ctx, cutX(r)); ctx.restore();
  }
  function noteChunk(ctx, r, o = {}) {
    ctx.save(); tearPath(ctx, 1, cutX(r)); ctx.clip(); drawNote(ctx, o); tearEdge(ctx, cutX(r)); ctx.restore();
  }

  // ---------- props ----------
  function person(ctx, x, y, s, prop, col = C.navy) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, -168, 34, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    rr(ctx, -46, -126, 92, 130, 40); ctx.fill();
    rr(ctx, -36, 0, 30, 96, 14); ctx.fill(); rr(ctx, 6, 0, 30, 96, 14); ctx.fill();
    if (prop === 'card') { ctx.save(); ctx.translate(58, -54); ctx.rotate(-0.25); rr(ctx, -30, -20, 60, 40, 7); ctx.fillStyle = C.cyan; ctx.fill(); ctx.fillStyle = C.gold; ctx.fillRect(-20, -8, 14, 10); ctx.restore(); }
    if (prop === 'note') { ctx.save(); ctx.translate(62, -56); ctx.rotate(0.2); ctx.scale(0.16, 0.16); noteHalf(ctx, -1); ctx.translate(26, 8); noteHalf(ctx, 1); ctx.restore(); }
    ctx.restore();
  }
  function branch(ctx, cx, by, s, lit, a = 1) {     // a bank branch front with its exchange board
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s); ctx.globalAlpha *= a;
    card(ctx, -160, -280, 320, 280, 10, C.card, { blur: 30, oy: 14 });
    rr(ctx, -182, -312, 364, 40, 8); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -48, -140, 96, 140, 6); ctx.fillStyle = '#1B3A6B'; ctx.fill();
    ctx.beginPath(); ctx.arc(30, -70, 6, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    rr(ctx, -130, -100, 56, 60, 6); ctx.fillStyle = C.cyanTint; ctx.fill(); rr(ctx, 74, -100, 56, 60, 6); ctx.fill();
    // the exchange board
    ctx.save();
    if (lit > 0) { ctx.shadowColor = `rgba(18,170,211,${0.7 * lit})`; ctx.shadowBlur = 40 * lit; }
    rr(ctx, -142, -258, 284, 92, 12); ctx.fillStyle = lit > 0 ? `rgba(18,170,211,${0.25 + 0.75 * lit})` : C.navyFaint; ctx.fill();
    ctx.restore();
    txt(ctx, 'NOTES', 0, -219, { f: '900 32px Inter', a: 'center', c: lit > 0.5 ? C.navy : C.navySoft, ls: 2 });
    txt(ctx, 'EXCHANGED HERE', 0, -182, { f: '800 26px Inter', a: 'center', c: lit > 0.5 ? C.navy : C.navySoft, ls: 1, maxW: 260 });
    ctx.restore();
  }
  function stampCard(ctx, cx, cy, k, sub) {          // "RBI RULES" stamp
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -330, -150, 660, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -300, -120, 600, 240, 20); ctx.stroke();
    txt(ctx, 'RBI RULES', 0, 22, { f: '900 104px Inter', a: 'center', c: C.navy, ls: 2, maxW: 560 });
    if (sub > 0) txt(ctx, 'Note exchange · 2026', 0, 88, { f: '700 34px Inter', a: 'center', c: C.cyanDark, alpha: sub });
    ctx.restore();
  }
  function tape(ctx, k) {                             // a translucent strip of tape laid along the tear
    if (k <= 0) return;
    ctx.save(); ctx.rotate(0.03); ctx.globalAlpha *= clamp(k * 2);
    const h = (NH + 60) * eo(k);
    rr(ctx, -34, -NH / 2 - 30, 68, h, 6); ctx.fillStyle = 'rgba(255,250,232,0.62)'; ctx.fill();
    ctx.strokeStyle = 'rgba(2,25,59,0.10)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  function letter(ctx, cx, cy, k, lines, penOn) {     // the written complaint
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    card(ctx, -240, -310, 480, 620, 18, '#FFFFFF', { blur: 40, oy: 18, stroke: C.navy, lw: 4 });
    txt(ctx, 'COMPLAINT', 0, -228, { f: '900 54px Inter', a: 'center', ls: 4 });
    ctx.fillStyle = C.cyan; ctx.fillRect(-70, -204, 140, 8);
    const L = [330, 380, 300, 360, 240, 320];
    let px = null, py = null;
    for (let i = 0; i < L.length; i++) {
      const p = clamp(lines * L.length - i);
      if (p <= 0) break;
      const y = -130 + i * 62, w = L[i] * p;
      rr(ctx, -190, y - 8, w, 16, 8); ctx.fillStyle = C.navySoft; ctx.fill();
      px = -190 + w; py = y;
    }
    if (penOn && px !== null) {
      ctx.save(); ctx.translate(px + 6, py - 6); ctx.rotate(-0.75);
      rr(ctx, -10, -150, 20, 140, 8); ctx.fillStyle = C.navy; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, -10); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function envelope(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -70, -46, 140, 92, 8, '#FFFFFF', { blur: 16, oy: 6, stroke: C.navy, lw: 4 });
    ctx.beginPath(); ctx.moveTo(-66, -42); ctx.lineTo(0, 8); ctx.lineTo(66, -42); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
  }
  function calendar(ctx, cx, cy, s, day, pulse) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s * (1 + 0.06 * pulse), s * (1 + 0.06 * pulse));
    card(ctx, -180, -200, 360, 400, 26, C.card, { blur: 40, oy: 18 });
    ctx.save(); rr(ctx, -180, -200, 360, 400, 26); ctx.clip(); ctx.fillStyle = C.navy; ctx.fillRect(-180, -200, 360, 96); ctx.restore();
    for (const x of [-90, 90]) { rr(ctx, x - 12, -226, 24, 56, 12); ctx.fillStyle = C.gold; ctx.fill(); }
    txt(ctx, String(day), 0, 92, { f: '900 190px Inter', a: 'center', c: day >= 30 ? C.red : C.navy });
    txt(ctx, 'DAYS', 0, 160, { f: '800 38px Inter', a: 'center', c: C.navySoft, ls: 6 });
    ctx.restore();
  }
  function institution(ctx, cx, cy, s, glow) {        // the Ombudsman's office (generic civic building + ₹ emblem)
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (glow > 0) {
      const g = ctx.createRadialGradient(0, -40, 20, 0, -40, 380);
      g.addColorStop(0, `rgba(246,217,160,${0.75 * glow})`); g.addColorStop(1, 'rgba(246,217,160,0)');
      ctx.fillStyle = g; ctx.fillRect(-400, -440, 800, 800);
    }
    ctx.beginPath(); ctx.moveTo(-230, -130); ctx.lineTo(0, -250); ctx.lineTo(230, -130); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -168, 40, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    txt(ctx, '₹', 0, -150, { f: '900 52px Inter', a: 'center', c: C.navy });
    rr(ctx, -240, -130, 480, 28, 6); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 5; i++) { rr(ctx, -196 + i * 90, -90, 42, 210, 8); ctx.fill(); }
    rr(ctx, -260, 124, 520, 34, 8); ctx.fill(); rr(ctx, -290, 160, 580, 30, 8); ctx.fill();
    ctx.restore();
  }

  // ---------- scene windows ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {   // visibility with eased fades in/out
    const i = a <= 0 ? 1 : eo(P(t, a, a + fin)), o = 1 - eio(P(t, b - fout, b));
    return { a: Math.min(i, o), i, o };
  }
  function withScene(ctx, w, fn, zoomIn = 0.94, zoomOut = 1.05) {
    if (w.a <= 0.001) return;
    const s = w.i < 1 ? lerp(zoomIn, 1, w.i) : lerp(zoomOut, 1, w.o);
    ctx.save(); ctx.globalAlpha = w.a;
    ctx.translate(CX, 1060); ctx.scale(s, s); ctx.translate(-CX, -1060);
    fn(); ctx.restore();
  }
  function label(ctx, s, x, y, k, o = {}) {          // large brief on-screen label
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); ctx.translate(x, y + (1 - eo(clamp(k))) * 24);
    txt(ctx, s, 0, 0, { f: o.f || '900 60px Inter', a: 'center', c: o.c || C.navy, ls: o.ls ?? 1, maxW: o.maxW || 760 });
    ctx.restore();
  }

  // V1 — hook: the note rips in two under a warm spotlight
  function v1(ctx, t) {
    const w = win(t, -1, E.v2 + 0.45, 0, 0.45);
    if (w.a <= 0) return;
    const zoom = 1 + 1.4 * eio(P(t, E.v2 - 0.1, E.v2 + 0.45));            // push-through into the bank
    ctx.save(); ctx.globalAlpha = w.a;
    spotlight(ctx, CX, 1020, 760, 1);
    ctx.beginPath(); ctx.rect(0, 560, W, H - 560); ctx.clip();          // keep the push-through below the caption band
    ctx.translate(CX, 1060); ctx.scale(zoom, zoom); ctx.translate(-CX, -1060);
    const tp = P(t, E.tear, E.split), sp = eo(P(t, E.split, E.split + 0.55)), dp = eio(P(t, E.droop, E.droop + 0.8));
    const shake = t < E.split ? wobble(t - E.tear, 6, 9, 3) : 0;
    tableShadow(ctx, CX, 1300, 420 - 60 * sp, 1);
    ctx.save(); ctx.translate(CX + shake, 1010 + Math.sin(t * 2.2) * 4); ctx.scale(1.18, 1.18);
    if (t < E.split) {
      drawNote(ctx);
      if (tp > 0) { tearEdge(ctx, 0, tp); ctx.save(); ctx.globalAlpha *= 0.5; tearEdge(ctx, 2, tp); ctx.restore(); }
    } else {
      const dim = 0.32 * dp;
      ctx.save(); ctx.translate(-70 * sp - 10 * dp, 26 * sp + 70 * dp); ctx.rotate(-0.13 * sp - 0.10 * dp); noteHalf(ctx, -1, { dim }); ctx.restore();
      ctx.save(); ctx.translate(70 * sp + 10 * dp, -12 * sp + 90 * dp); ctx.rotate(0.11 * sp + 0.14 * dp); noteHalf(ctx, 1, { dim }); ctx.restore();
    }
    ctx.restore();
    ctx.restore();
  }
  // V2 — escalation: the counter, the sign, the tray pushed back
  function v2(ctx, t) {
    withScene(ctx, win(t, E.v2, E.v3), () => {
      const wg = ctx.createLinearGradient(0, 640, 0, 1600);              // wall with soft light, full width
      wg.addColorStop(0, 'rgba(2,25,59,0)'); wg.addColorStop(0.5, 'rgba(2,25,59,0.06)'); wg.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = wg; ctx.fillRect(0, 640, W, 960);
      // teller window
      ctx.save(); rr(ctx, CX - 320, 690, 640, 560, 26); ctx.clip();
      ctx.fillStyle = 'rgba(180,227,241,0.45)'; ctx.fillRect(CX - 320, 690, 640, 560);
      ctx.beginPath(); ctx.arc(CX + 160, 1012, 54, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,25,59,0.55)'; ctx.fill();
      rr(ctx, CX + 40, 1074, 240, 220, 90); ctx.fill();
      const rg = ctx.createLinearGradient(CX - 320, 690, CX + 80, 1250);   // glass sheen (lighting)
      rg.addColorStop(0, 'rgba(255,255,255,0.35)'); rg.addColorStop(0.4, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.fillRect(CX - 320, 690, 640, 560);
      ctx.restore();
      rr(ctx, CX - 320, 690, 640, 560, 26); ctx.strokeStyle = C.navy; ctx.lineWidth = 10; ctx.stroke();
      // counter top + tray
      rr(ctx, 0, 1236, W, 64, 10); ctx.fillStyle = '#1B3A6B'; ctx.fill();
      const fg = ctx.createLinearGradient(0, 1300, 0, 1620);
      fg.addColorStop(0, 'rgba(27,58,107,0.30)'); fg.addColorStop(1, 'rgba(27,58,107,0)');
      ctx.fillStyle = fg; ctx.fillRect(0, 1300, W, 320);
      const pk = eio(P(t, E.push, E.push + 0.45));
      ctx.save(); ctx.translate(0, 120 * pk);
      rr(ctx, CX - 210, 1206, 420, 48, 14); ctx.fillStyle = '#0F2A55'; ctx.fill();
      ctx.save(); ctx.translate(CX - 70, 1196); ctx.rotate(-0.08); ctx.scale(0.42, 0.42); noteHalf(ctx, -1); ctx.restore();
      ctx.save(); ctx.translate(CX + 78, 1190); ctx.rotate(0.10); ctx.scale(0.42, 0.42); noteHalf(ctx, 1); ctx.restore();
      ctx.restore();
      badge(ctx, CX + 250, 1150, spring(t - E.push - 0.15, 2, 0.5), false, 44);
      // the hanging sign swings down
      const sd = spring(t - E.sign, 1.4, 0.45), sw = wobble(t - E.sign, 0.08, 1.2, 1.8);
      if (t >= E.sign) {
        ctx.save(); ctx.translate(CX, lerp(560, 712, sd)); ctx.rotate(sw);
        ctx.strokeStyle = C.navySoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-150, -40); ctx.lineTo(-150, 0); ctx.moveTo(150, -40); ctx.lineTo(150, 0); ctx.stroke();
        card(ctx, -250, 0, 500, 200, 18, C.card, { blur: 30, oy: 14, stroke: C.red, lw: 8 });
        txt(ctx, 'NO ACCOUNT?', 0, 84, { f: '900 62px Inter', a: 'center', c: C.red, maxW: 440 });
        txt(ctx, 'NO EXCHANGE', 0, 160, { f: '900 62px Inter', a: 'center', c: C.redDark, maxW: 440 });
        ctx.restore();
      }
    });
    // series identity chip (only here, under the question)
    const cw = win(t, E.v2 + 0.2, E.v3);
    if (cw.a > 0) {
      ctx.save(); ctx.globalAlpha = cw.a;
      setFont(ctx, '800 28px Inter', 3);
      const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2, y = 570;
      rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.92)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
      ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
      ctx.restore();
    }
  }
  // V3 — the rulebook stamp
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v3b), () => {
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1020, k, eo(P(t, E.stamp + 0.4, E.stamp + 0.8))); ctx.restore();
    });
  }
  // V3b — every branch lights its exchange board; customer or not, both served
  function v3b(ctx, t) {
    withScene(ctx, win(t, E.v3b, E.v4), () => {
      spotlight(ctx, CX, 1050, 700, 0.6);
      const pe = eo(P(t, E.cust - 0.2, E.cust + 0.3));
      const rise = k => eo(clamp(k));
      const sides = [[186, E.b1], [814, E.b3]];
      for (const [x, tb] of sides) {
        const r = rise(P(t, E.v3b, E.v3b + 0.5));
        branch(ctx, x, 1130 + 40 * (1 - r), 0.7, eo(P(t, tb, tb + 0.35)), r * lerp(0.8, 0.45, pe));
      }
      const r = rise(P(t, E.v3b + 0.05, E.v3b + 0.55));
      branch(ctx, CX, 1230 + 40 * (1 - r), 1.12, eo(P(t, E.b2, E.b2 + 0.35)), r * lerp(1, 0.7, pe));
      label(ctx, 'EVERY BRANCH', CX, 1350, eo(P(t, E.b3 + 0.1, E.b3 + 0.5)) * (1 - pe));
      // two people: an account holder and a walk-in
      if (t >= E.cust - 0.2) {
        ctx.save(); ctx.globalAlpha *= pe;
        person(ctx, 360 + 40 * (1 - pe), 1440, 0.8, 'card');
        person(ctx, 640 - 40 * (1 - pe), 1440, 0.8, 'note');
        ctx.restore();
        badge(ctx, 430, 1292, spring(t - E.cust, 2, 0.5), true, 30);
        badge(ctx, 710, 1292, spring(t - E.notc, 2, 0.5), true, 30);
        label(ctx, 'CUSTOMER OR NOT', CX, 1610, eo(P(t, E.notc, E.notc + 0.4)), { f: '900 56px Inter' });
      }
    });
  }
  // V4 — two halves, nothing missing: soiled, swapped free
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1000, 700, 0.8);
      const jk = eio(P(t, E.join, E.join + 0.65)), sw = eio(P(t, E.swap, E.swap + 0.35));
      tableShadow(ctx, CX, 1250, 420, 1 - sw);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 1430); ctx.clip();
      ctx.save(); ctx.translate(CX, 1000 + 420 * sw); ctx.globalAlpha *= 1 - sw; ctx.scale(1.2 * (1 - 0.3 * sw), 1.2 * (1 - 0.3 * sw));
      ctx.save(); ctx.translate(-130 * (1 - jk), 30 * (1 - jk)); ctx.rotate(-0.13 * (1 - jk)); noteHalf(ctx, -1); ctx.restore();
      ctx.save(); ctx.translate(130 * (1 - jk), -10 * (1 - jk)); ctx.rotate(0.11 * (1 - jk)); noteHalf(ctx, 1); ctx.restore();
      tape(ctx, P(t, E.tape, E.tape + 0.45));
      const ok = eo(P(t, E.tape + 0.2, E.tape + 0.6));                    // the whole note outlined: nothing missing
      if (ok > 0) { ctx.save(); ctx.globalAlpha *= ok * (1 - P(t, E.soiled + 0.3, E.soiled + 0.8) * 0.6); rr(ctx, -NW / 2 - 14, -NH / 2 - 14, NW + 28, NH + 28, 22); ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.stroke(); ctx.restore(); }
      ctx.restore();
      if (t >= E.swap + 0.15) {
        const up = eo(P(t, E.swap + 0.1, E.swap + 0.45));
        ctx.save(); ctx.translate(CX, lerp(1560, 1000, up)); ctx.scale(1.2, 1.2);
        drawNote(ctx, { fresh: true, shine: P(t, E.swap + 0.6, E.swap + 1.2) }); ctx.restore();
      }
      ctx.restore();
      badge(ctx, CX + 360, 830, spring(t - E.tape - 0.3, 2, 0.5) * (1 - sw), true, 36);
      // the counter: the old note goes down behind it, a fresh one comes back up
      const ck = eo(P(t, E.swap - 0.45, E.swap - 0.05));
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha *= ck; ctx.translate(0, (1 - ck) * 60);
        rr(ctx, -20, 1430, W + 40, 56, 10); ctx.fillStyle = '#1B3A6B'; ctx.fill();
        const fg = ctx.createLinearGradient(0, 1486, 0, 1760);
        fg.addColorStop(0, 'rgba(27,58,107,0.30)'); fg.addColorStop(1, 'rgba(27,58,107,0)');
        ctx.fillStyle = fg; ctx.fillRect(0, 1486, W, 274);
        ctx.restore();
      }
      label(ctx, 'SOILED', CX, 1290, eo(P(t, E.soiled, E.soiled + 0.35)) * (1 - P(t, E.swap - 0.2, E.swap + 0.1)), { f: '900 92px Inter', c: C.cyanDark, ls: 6 });
      label(ctx, 'FREE SWAP', CX, 1290, eo(P(t, E.free, E.free + 0.35)), { f: '900 92px Inter', ls: 4 });
    });
  }
  // V5 — a piece gone: accepted, paid by what's left (full / half / nothing)
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 960, 700, 0.8);
      // remaining fraction of the note: after the piece falls, then illustrating the three outcomes
      let r = 0.78;
      const seq = [[E.full, 0.9], [E.half, 0.6], [E.nothing, 0.27]];
      let prev = 0.78;
      for (const [te, v] of seq) { if (t >= te) { r = lerp(prev, v, eio(P(t, te, te + 0.3))); } prev = v; }
      ctx.save(); ctx.translate(CX, 940); ctx.scale(1.2, 1.2);
      tableShadow(ctx, 0, 230, 380, 1);
      if (t < E.piece) { drawNote(ctx); tearEdge(ctx, cutX(0.78), P(t, E.v5 + 0.1, E.piece)); }
      else {
        notePiece(ctx, r);
        const fall = P(t, E.piece, E.piece + 0.8);
        if (fall < 1) { ctx.save(); ctx.translate(40 * fall, 520 * ei(fall)); ctx.rotate(0.6 * fall); ctx.globalAlpha *= 1 - fall; noteChunk(ctx, 0.78); ctx.restore(); }
        // what's left, highlighted
        const lk = eo(P(t, E.left, E.left + 0.4));
        if (lk > 0) {
          ctx.save(); tearPath(ctx, -1, cutX(r)); ctx.clip();
          rr(ctx, -NW / 2, -NH / 2, NW, NH, 14); ctx.fillStyle = `rgba(18,170,211,${0.22 * lk})`; ctx.fill(); ctx.restore();
          rr(ctx, -NW / 2, NH / 2 + 34, NW, 22, 11); ctx.fillStyle = C.navyFaint; ctx.fill();
          rr(ctx, -NW / 2, NH / 2 + 34, Math.max(22, NW * r * lk), 22, 11); ctx.fillStyle = C.cyan; ctx.fill();
        }
      }
      ctx.restore();
      label(ctx, 'ACCEPTED', CX, 1290, eo(P(t, E.accept, E.accept + 0.35)) * (1 - P(t, E.left - 0.2, E.left + 0.1)), { f: '900 84px Inter', c: C.cyanDark, ls: 4 });
      badge(ctx, CX + 300, 760, spring(t - E.accept, 2, 0.5) * (1 - P(t, E.left - 0.2, E.left + 0.1)), true, 40);
      // outcome chips
      const chips = [['FULL', E.full, C.cyan], ['HALF', E.half, C.gold], ['NOTHING', E.nothing, C.red]];
      const ck = eo(P(t, E.left + 0.2, E.left + 0.6));
      if (ck > 0) {
        chips.forEach(([s, te, col], i) => {
          const x = 260 + i * 240, y = 1330;
          const on = t >= te && (i === 2 || t < chips[i + 1][1]);
          const pop = on ? spring(t - te, 2.2, 0.5) : 0;
          ctx.save(); ctx.globalAlpha *= ck; ctx.translate(x, y + (1 - ck) * 20); ctx.scale(1 + 0.08 * pop, 1 + 0.08 * pop);
          rr(ctx, -108, -48, 216, 96, 48); ctx.fillStyle = on ? col : 'rgba(255,253,248,0.9)'; ctx.fill();
          ctx.strokeStyle = on ? col : C.navyFaint; ctx.lineWidth = 4; ctx.stroke();
          txt(ctx, s, 0, 15, { f: '900 42px Inter', a: 'center', c: on ? (i === 2 ? '#FFF8EE' : C.navy) : C.navySoft, maxW: 190 });
          ctx.restore();
        });
      }
    });
  }
  // V6 — refused? a written complaint
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      const out = eio(P(t, E.write - 0.35, E.write));
      if (out < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - out;
        badge(ctx, CX, 1000, spring(t - E.refused, 2, 0.5), false, 120);
        label(ctx, 'REFUSED?', CX, 1240, eo(P(t, E.refused, E.refused + 0.3)), { f: '900 80px Inter', c: C.red });
        ctx.restore();
      }
      if (t >= E.write - 0.35) {
        const k = eo(P(t, E.write - 0.35, E.write + 0.1));
        ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, (1 - k) * 120);
        letter(ctx, CX, 1010, 0.92, P(t, E.write + 0.05, E.write + 1.0), t < E.write + 1.15);
        ctx.restore();
        label(ctx, 'IN WRITING', CX, 1390, eo(P(t, E.write + 0.4, E.write + 0.8)), { f: '900 64px Inter' });
      }
    });
  }
  // V7 — no reply in 30 days: the RBI Ombudsman
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      const cp = P(t, E.cal, E.calEnd), day = Math.max(1, Math.min(30, 1 + Math.floor(29 * eio(cp) + 0.0001)));
      const mv = eio(P(t, E.go, E.go + 0.5));
      const pulse = t >= E.calEnd ? Math.max(0, wobble(t - E.calEnd, 1, 1.6, 3)) : 0;
      calendar(ctx, lerp(CX, 250, mv), lerp(1000, 1020, mv), lerp(1.0, 0.62, mv), day, pulse);
      label(ctx, 'NO REPLY?', CX, 1320, eo(P(t, E.cal + 0.2, E.cal + 0.6)) * (1 - mv));
      if (t >= E.go) {
        const bk = eo(P(t, E.go + 0.2, E.go + 0.6));
        ctx.save(); ctx.globalAlpha *= bk;
        institution(ctx, 730, 1060 + 40 * (1 - bk), 0.8, eo(P(t, E.omb, E.omb + 0.5)));
        ctx.restore();
        const fl = eio(P(t, E.go + 0.25, E.omb));
        if (fl > 0 && fl < 1) envelope(ctx, lerp(300, 720, fl), lerp(980, 1010, fl) - Math.sin(Math.PI * fl) * 200, 0.9, lerp(-0.2, 0.1, fl));
        label(ctx, 'RBI OMBUDSMAN', CX, 1350, eo(P(t, E.omb, E.omb + 0.4)), { f: '900 72px Inter' });
      }
    });
  }
  // V8 — CTA
  function drawCTA(ctx, t) {
    if (t < E.v8) return;
    const k = spring(t - E.v8, 1.6, 0.55);
    const ix = 170, iy = 975, is = 170;
    const ap = eio(P(t, E.v8 + 0.3, E.v8 + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.v8 + 0.15, E.v8 + 0.65));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1050, { f: '800 58px Inter', maxW: 520 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1106, { f: '600 32px Inter', c: C.navySoft, maxW: 520 });
    ctx.restore();
  }

  // ---------- captions (x 100..900, centred on x=500; band y 340..540) ----------
  const CAP = { size: 64, minSize: 46, maxW: 800, y1: 463, y2a: 422, y2b: 502 };
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
      const hp = eio(P(t, cp.start + 0.15, cp.start + 0.5));
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

  // ---------- frame ----------
  function render(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    v1(ctx, t); v2(ctx, t); v3(ctx, t); v3b(ctx, t); v4(ctx, t); v5(ctx, t); v6(ctx, t); v7(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- separate vertical thumbnail: the torn note + 3 large words ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    spotlight(ctx, CX, 1230, 900, 1.1);
    tableShadow(ctx, CX, 1500, 480, 1.2);
    ctx.save(); ctx.translate(CX, 1200); ctx.scale(1.24, 1.24);
    ctx.save(); ctx.translate(-62, 34); ctx.rotate(-0.15); noteHalf(ctx, -1); ctx.restore();
    ctx.save(); ctx.translate(62, -26); ctx.rotate(0.12); noteHalf(ctx, 1); ctx.restore();
    ctx.restore();
    txt(ctx, 'TORN NOTE.', CX, 470, { f: '900 124px Inter', a: 'center', maxW: 800 });
    txt(ctx, 'WORTHLESS?', CX, 614, { f: '900 124px Inter', a: 'center', c: C.cyanDark, maxW: 800 });
    setFont(ctx, '800 28px Inter', 3);
    const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2, y = 694;
    rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.9)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
