/* Courtlens · "Is this legal in India?" · Episode 14 (English, english-14): can the electricity company cut your power
 * over a bill you dispute? Basis: Electricity Act, 2003, s.56 (15 clear days' written notice; deposit under protest of
 * the lower of the sum claimed or the six-month-average charge for each month, pending the dispute).
 * Built on the english-13 engine under context/09-feedback-rules-2026-11-11.md: one visual idea at a time, large brief
 * labels, sequential reveals, depth and lighting, captions inside x 100..900. Bill amounts are illustrative.
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
    let s = 20261114 >>> 0;
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

  // ---------- props ----------
  function stampCard(ctx, cx, cy, k, title, sub, subA) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -340, -150, 680, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -310, -120, 620, 240, 20); ctx.stroke();
    txt(ctx, title, 0, 18, { f: '900 84px Inter', a: 'center', c: C.navy, ls: 1, maxW: 580 });
    if (subA > 0) txt(ctx, sub, 0, 86, { f: '700 36px Inter', a: 'center', c: C.cyanDark, alpha: subA });
    ctx.restore();
  }
  function dimRoom(ctx, k) {                          // the room goes dark (feathered; the caption band stays on paper)
    if (k <= 0) return;
    const g = ctx.createLinearGradient(0, 590, 0, 1720);
    g.addColorStop(0, 'rgba(11,33,72,0)'); g.addColorStop(0.12, `rgba(11,33,72,${0.62 * k})`);
    g.addColorStop(0.86, `rgba(11,33,72,${0.62 * k})`); g.addColorStop(1, 'rgba(11,33,72,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 590, W, 1130);
  }
  function lamp(ctx, x, y, on, cone = 1, cordTop = 600) {            // pendant lamp; on 0..1; cone of warm light below
    if (on > 0 && cone > 0) {
      ctx.save(); ctx.globalAlpha *= on * cone;
      const g = ctx.createLinearGradient(0, y + 40, 0, y + 640);
      g.addColorStop(0, 'rgba(246,217,160,0.65)'); g.addColorStop(1, 'rgba(246,217,160,0)');
      ctx.beginPath(); ctx.moveTo(x - 70, y + 40); ctx.lineTo(x + 70, y + 40); ctx.lineTo(x + 360, y + 640); ctx.lineTo(x - 360, y + 640); ctx.closePath();
      ctx.fillStyle = g; ctx.fill();
      const b = ctx.createRadialGradient(x, y + 46, 4, x, y + 46, 150);
      b.addColorStop(0, 'rgba(255,236,190,0.95)'); b.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = b; ctx.fillRect(x - 160, y - 110, 320, 320);
      ctx.restore();
    }
    ctx.strokeStyle = C.navySoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, cordTop); ctx.lineTo(x, y - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 26, y - 34); ctx.lineTo(x + 26, y - 34); ctx.lineTo(x + 80, y + 30); ctx.lineTo(x - 80, y + 30); ctx.closePath();
    ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + 42, 22, 0, Math.PI * 2); ctx.fillStyle = on > 0.5 ? '#FFF1C9' : '#8A93A6'; ctx.fill();
  }
  function bill(ctx, cx, cy, s, hot, o = {}) {        // the electricity bill with one disputed line
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    card(ctx, -260, -330, 520, 660, 18, '#FFFFFF', { blur: 40, oy: 18 });
    ctx.save(); rr(ctx, -260, -330, 520, 660, 18); ctx.clip(); ctx.fillStyle = C.navy; ctx.fillRect(-260, -330, 520, 110); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-190, -300); ctx.lineTo(-214, -262); ctx.lineTo(-196, -262); ctx.lineTo(-212, -232); ctx.lineTo(-176, -276); ctx.lineTo(-194, -276); ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
    txt(ctx, 'ELECTRICITY BILL', 30, -258, { f: '900 40px Inter', a: 'center', c: '#FFF8EE', ls: 2, maxW: 360 });
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 3; i++) { rr(ctx, -200, -170 + i * 44, i === 2 ? 220 : 400, 14, 7); ctx.fill(); }
    txt(ctx, 'LAST MONTH', -205, 24, { f: '800 30px Inter', c: C.navySoft });
    txt(ctx, '₹1,400', 205, 26, { f: '900 42px Inter', a: 'right', c: C.navySoft });
    if (!o.lineOnTop) billLine(ctx, hot, o.t);
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 2; i++) { rr(ctx, -200, 226 + i * 44, i ? 160 : 300, 14, 7); ctx.fill(); }
    ctx.restore();
  }
  function billLine(ctx, hot, t) {                   // the disputed line (bill coordinates)
    const pulse = hot > 0 ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
    rr(ctx, -232, 74, 464, 96, 14); ctx.fillStyle = hot > 0 ? `rgba(246,223,216,${0.75 + 0.25 * hot})` : C.paper; ctx.fill();
    if (hot > 0) { ctx.save(); ctx.shadowColor = `rgba(181,67,47,${(0.55 + 0.25 * pulse) * hot})`; ctx.shadowBlur = 34 * hot; rr(ctx, -232, 74, 464, 96, 14); ctx.strokeStyle = `rgba(181,67,47,${hot})`; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
    txt(ctx, 'THIS MONTH', -205, 134, { f: '900 30px Inter', c: hot > 0 ? C.redDark : C.navy });
    txt(ctx, '₹9,800', 208, 140, { f: '900 50px Inter', a: 'right', c: hot > 0 ? C.red : C.navy });
  }
  function billLineAt(ctx, cx, cy, s, hot, t) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); billLine(ctx, hot, t); ctx.restore(); }
  function socket(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -90, -90, 180, 180, 28, C.card, { blur: 24, oy: 10, stroke: C.navy, lw: 5 });
    for (const dx of [-30, 30]) { rr(ctx, dx - 9, -30, 18, 44, 8); ctx.fillStyle = C.navy; ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 50, 11, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function plug(ctx, x, y, s, out, spark) {          // plug at the socket; out 0 = in, 1 = pulled out
    ctx.save(); ctx.translate(x - 230 * out, y + 30 * out); ctx.rotate(-0.25 * out); ctx.scale(s, s);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-90, 0); ctx.bezierCurveTo(-200, 0, -240, 120, -420, 140); ctx.stroke();
    for (const dy of [-22, 22]) { rr(ctx, 40, dy - 7, 46, 14, 5); ctx.fillStyle = C.gold; ctx.fill(); }
    rr(ctx, -100, -54, 140, 108, 22); ctx.fillStyle = '#1B3A6B'; ctx.fill();
    ctx.restore();
    if (spark > 0 && spark < 1) {
      ctx.save(); ctx.translate(x - 30, y); ctx.globalAlpha *= 1 - spark;
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.3, r0 = 20 + 40 * spark, r1 = r0 + 34; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke(); }
      ctx.restore();
    }
  }
  function envelope(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -110, -72, 220, 144, 10, '#FFFFFF', { blur: 18, oy: 8, stroke: C.navy, lw: 5 });
    ctx.beginPath(); ctx.moveTo(-104, -66); ctx.lineTo(0, 12); ctx.lineTo(104, -66); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    rr(ctx, -62, 26, 124, 34, 8); ctx.fillStyle = C.red; ctx.fill();
    txt(ctx, 'NOTICE', 0, 52, { f: '900 24px Inter', a: 'center', c: '#FFF8EE', ls: 2 });
    ctx.restore();
  }
  function hourglass(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    rr(ctx, -46, -64, 92, 12, 6); ctx.fillStyle = C.navy; ctx.fill(); rr(ctx, -46, 52, 92, 12, 6); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-36, -52); ctx.lineTo(36, -52); ctx.lineTo(4, 0); ctx.lineTo(36, 52); ctx.lineTo(-36, 52); ctx.lineTo(-4, 0); ctx.closePath();
    ctx.fillStyle = C.cyanTint; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22, 48); ctx.lineTo(22, 48); ctx.lineTo(0, 22); ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore();
  }
  function iconLetter(ctx) {
    rr(ctx, -44, -58, 88, 116, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 4; i++) { rr(ctx, -28, -36 + i * 22, i === 3 ? 30 : 56, 8, 4); ctx.fill(); }
    ctx.save(); ctx.translate(30, 30); ctx.rotate(-0.7); rr(ctx, -7, -60, 14, 64, 5); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
  }
  function iconCoin(ctx) {
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(2,25,59,0.35)'; ctx.lineWidth = 5; ctx.stroke();
    txt(ctx, '₹', 0, 24, { f: '900 66px Inter', a: 'center', c: C.navy });
  }
  function iconReceipt(ctx) {
    ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(40, 56);
    for (let i = 0; i < 4; i++) { ctx.lineTo(40 - 10 - i * 20, 46); ctx.lineTo(40 - 20 - i * 20, 56); }
    ctx.lineTo(-40, -60); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 3; i++) { rr(ctx, -26, -42 + i * 22, i === 2 ? 30 : 52, 8, 4); ctx.fill(); }
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
  const lightsOut = t => {                            // flicker, flicker, off
    if (t < E.flick) return 1;
    const d = t - E.flick;
    if (d < 0.08) return 0.15; if (d < 0.16) return 1; if (d < 0.24) return 0.1; if (d < 0.30) return 0.8;
    return Math.max(0, 0.8 - (d - 0.30) * 6);
  };

  // V1 — hook: a wrong bill under the lamp; the lights go out
  function v1(ctx, t) {
    const w = win(t, -1, E.v2 + 0.2, 0, 0.3);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const on = lightsOut(t), hot = eo(P(t, E.line, E.line + 0.3));
    const bi = eo(P(t, E.billIn, E.billIn + 0.45)), by = lerp(1330, 1170, bi);
    lamp(ctx, CX, 700, on);
    tableShadow(ctx, CX, 1560, 400, 1);
    bill(ctx, CX, by, 0.98, hot, { t, lineOnTop: true });
    dimRoom(ctx, 1 - on);
    lamp(ctx, CX, 700, on, 0);                          // shade and bulb stay crisp above the dark
    billLineAt(ctx, CX, by, 0.98, hot, t);              // the disputed line keeps glowing in the dark
    ctx.restore();
  }
  // V2 — escalation: "pay it all, or we cut you off" — the plug is pulled
  function v2(ctx, t) {
    withScene(ctx, win(t, E.v2 + 0.15, E.v3), () => {
      dimRoom(ctx, 0.75);
      const nk = spring(t - E.notice, 1.5, 0.5);
      if (t >= E.notice) {
        ctx.save(); ctx.translate(CX, lerp(640, 860, nk)); ctx.rotate(wobble(t - E.notice, 0.06, 1.3, 2));
        card(ctx, -260, -90, 520, 180, 18, C.card, { blur: 30, oy: 14, stroke: C.red, lw: 8 });
        txt(ctx, 'PAY ALL ₹9,800', 0, -14, { f: '900 56px Inter', a: 'center', c: C.redDark, maxW: 460 });
        txt(ctx, 'OR DISCONNECT', 0, 56, { f: '900 50px Inter', a: 'center', c: C.red, maxW: 460 });
        ctx.restore();
      }
      const out = eio(P(t, E.unplug, E.unplug + 0.35));
      socket(ctx, 760, 1260, 1.1);
      plug(ctx, 640, 1260, 1.1, out, P(t, E.unplug + 0.05, E.unplug + 0.5));
    });
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
  // V3 — the law: Electricity Act stamp
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v3b), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1020, k, 'ELECTRICITY ACT', '2003 · Section 56', eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
    });
  }
  // V3b — written notice, then fifteen clear days, one by one
  function v3b(ctx, t) {
    withScene(ctx, win(t, E.v3b, E.v4), () => {
      spotlight(ctx, CX, 1000, 700, 0.7);
      const ek = spring(t - E.env, 1.6, 0.55);
      if (t >= E.env) envelope(ctx, CX, lerp(720, 840, clamp(ek)), 1.5 * clamp(ek * 1.2), wobble(t - E.env, 0.08, 1.2, 2.5));
      label(ctx, 'IN WRITING', CX, 1010, eo(P(t, E.wr, E.wr + 0.35)), { f: '900 56px Inter', c: C.cyanDark });
      const n = 15, tw = 44, gap = 8, x0 = CX - (n * tw + (n - 1) * gap) / 2, y = 1090;
      for (let i = 0; i < n; i++) {
        const ti = E.days + i * 0.06, k = eo(P(t, ti, ti + 0.18));
        const x = x0 + i * (tw + gap);
        rr(ctx, x, y, tw, 64, 10); ctx.fillStyle = C.navyFaint; ctx.fill();
        if (k > 0) { ctx.save(); ctx.globalAlpha *= k; rr(ctx, x, y + 64 * (1 - k), tw, 64 * k, 10); ctx.fillStyle = C.cyan; ctx.fill(); ctx.restore(); }
      }
      label(ctx, '15 CLEAR DAYS', CX, 1260, eo(P(t, E.cdays, E.cdays + 0.35)), { f: '900 76px Inter' });
    });
  }
  // V4 — deposit under protest: the lower of the claim and the six-month average
  const MONTHS = [1320, 1480, 1350, 1460, 1390, 1400], CLAIM = 9800, AVG = 1400;
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const base = 1400, sc = 440 / CLAIM, bw = 70, gap = 22, x0 = 150;
      const dimRed = eo(P(t, E.each, E.each + 0.4));
      ctx.fillStyle = 'rgba(2,25,59,0.25)'; ctx.fillRect(120, base, 780, 4);
      MONTHS.forEach((v, i) => {
        const k = eo(P(t, E.bars + i * 0.09, E.bars + i * 0.09 + 0.3));
        if (k <= 0) return;
        const h = v * sc * k, x = x0 + i * (bw + gap);
        rr(ctx, x, base - h, bw, h, 8); ctx.fillStyle = C.navySoft; ctx.fill();
      });
      // the disputed month towers
      const bk = eob(P(t, E.big, E.big + 0.6), 1.1);
      if (bk > 0) {
        const h = CLAIM * sc * bk, x = x0 + 6 * (bw + gap) + 30;
        ctx.save(); ctx.globalAlpha *= lerp(1, 0.35, dimRed);
        ctx.shadowColor = 'rgba(181,67,47,0.45)'; ctx.shadowBlur = 30;
        rr(ctx, x, base - h, bw + 20, h, 10); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
        label(ctx, 'CLAIMED', x + 45, base - h - 64, eo(P(t, E.claim, E.claim + 0.3)) * lerp(1, 0.4, dimRed), { f: '900 40px Inter', c: C.redDark, maxW: 220 });
        label(ctx, '₹9,800', x + 45, base - h - 18, eo(P(t, E.claim, E.claim + 0.3)) * lerp(1, 0.4, dimRed), { f: '900 40px Inter', c: C.red, maxW: 220 });
      }
      // six-month average line sweeps across
      const ak = eio(P(t, E.avg, E.avg + 0.6));
      if (ak > 0) {
        const y = base - AVG * sc - 6, xa = 128, xb = x0 + 6 * (bw + gap) - 10;
        rr(ctx, xa, y - 5, (xb - xa) * ak, 10, 5); ctx.fillStyle = C.cyan; ctx.fill();
        label(ctx, '6-MONTH AVERAGE ₹1,400', (xa + xb) / 2, y - 40, eo(P(t, E.avg + 0.4, E.avg + 0.8)), { f: '900 38px Inter', c: C.cyanDark, maxW: 520 });
        badge(ctx, xb - 10, y - 40 - 70, spring(t - E.each, 2, 0.5), true, 34);
      }
      // the rule, revealed in order: under protest → the lower amount
      const pk = eo(P(t, E.protest, E.protest + 0.3)), lk = eo(P(t, E.lower, E.lower + 0.35));
      if (pk > 0) {
        ctx.save(); ctx.globalAlpha *= pk; ctx.translate(CX - 60, 730); ctx.rotate(-0.05); ctx.scale(lerp(1.4, 1, eob(pk, 1.2)), lerp(1.4, 1, eob(pk, 1.2)));
        rr(ctx, -250, -50, 500, 100, 16); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.stroke();
        txt(ctx, 'UNDER PROTEST', 0, 20, { f: '900 54px Inter', a: 'center', c: C.red, ls: 2, maxW: 440 });
        ctx.restore();
      }
      label(ctx, 'PAY THE LOWER', CX, 1510, lk, { f: '900 66px Inter' });
    });
  }
  // V5 — then they can't cut you off: plug back in, the light returns
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      const on = eo(P(t, E.relight, E.relight + 0.3));
      dimRoom(ctx, 0.75 * (1 - on));
      lamp(ctx, CX, 700, on);
      const back = 1 - eio(P(t, E.plugin, E.plugin + 0.35));
      socket(ctx, 760, 1180, 1.1);
      plug(ctx, 640, 1180, 1.1, back, 0);
      label(ctx, 'SUPPLY STAYS ON', CX, 1400, eo(P(t, E.stays, E.stays + 0.35)), { f: '900 70px Inter' });
      if (t >= E.pend - 0.1) {
        const hk = eo(P(t, E.pend - 0.1, E.pend + 0.25));
        ctx.save(); ctx.globalAlpha *= hk; hourglass(ctx, 250, 980, 1.0, Math.PI * eio(P(t, E.pend + 0.3, E.pend + 0.9))); ctx.restore();
        label(ctx, 'WHILE PENDING', CX, 1490, eo(P(t, E.pend, E.pend + 0.35)), { f: '900 50px Inter', c: C.cyanDark });
      }
    });
  }
  // V6 — payoff: three steps, one at a time
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v8), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const items = [[E.s1, iconLetter, 'IN WRITING'], [E.s2, iconCoin, 'PAY THE LOWER'], [E.s3, iconReceipt, 'KEEP RECEIPT']];
      items.forEach(([te, icon, lab], i) => {
        if (t < te) return;
        const k = spring(t - te, 1.7, 0.6), y = 820 + i * 240;
        ctx.save(); ctx.translate(230 + (1 - clamp(k)) * 120, y); ctx.globalAlpha *= clamp(k * 1.5);
        card(ctx, -80, -80, 160, 160, 38, C.card, { blur: 26, oy: 10 });
        ctx.save(); ctx.scale(0.95, 0.95); icon(ctx); ctx.restore();
        txt(ctx, lab, 120, 20, { f: '900 60px Inter', maxW: 540 });
        ctx.restore();
        badge(ctx, 305, y - 70, spring(t - te - 0.25, 2, 0.5), true, 24);
      });
      if (t >= E.paid) {                              // the receipt gets its "under protest" stamp
        const k = eob(P(t, E.paid, E.paid + 0.3), 1.2);
        ctx.save(); ctx.translate(590, 1420); ctx.rotate(-0.08); ctx.scale(lerp(1.5, 1, k), lerp(1.5, 1, k)); ctx.globalAlpha *= clamp((t - E.paid) * 6);
        rr(ctx, -210, -38, 420, 76, 12); ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.stroke();
        txt(ctx, 'PAID UNDER PROTEST', 0, 14, { f: '900 36px Inter', a: 'center', c: C.red, ls: 1, maxW: 390 });
        ctx.restore();
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
    v1(ctx, t); v2(ctx, t); v3(ctx, t); v3b(ctx, t); v4(ctx, t); v5(ctx, t); v6(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- separate vertical thumbnail: the wrong bill in a room going dark + 4 large words ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    tableShadow(ctx, CX, 1720, 440, 1.2);
    bill(ctx, CX, 1300, 1.02, 1, { t: 0.22, lineOnTop: true });
    dimRoom(ctx, 0.85);
    lamp(ctx, CX, 800, 0.0, 0, 660);
    billLineAt(ctx, CX, 1300, 1.02, 1, 0.22);
    txt(ctx, 'WRONG BILL.', CX, 400, { f: '900 120px Inter', a: 'center', maxW: 800 });
    txt(ctx, 'LIGHTS OUT?', CX, 540, { f: '900 120px Inter', a: 'center', c: C.cyanDark, maxW: 800 });
    setFont(ctx, '800 28px Inter', 3);
    const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2, y = 600;
    rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.94)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
