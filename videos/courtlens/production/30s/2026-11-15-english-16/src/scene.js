/* Courtlens · "Is this legal in India?" · Episode 16 (English, english-16): must you fight a company in its city?
 * Basis: Consumer Protection Act, 2019 — s.34(2)(d) (file where you reside or personally work for gain), s.35(1)(a)
 * (the consumer files; e-filing proviso), s.69 (two years), s.39(1) (remedies); District Commission up to Rs 50 lakh
 * (Jurisdiction Rules 2021); NCDRC Procedure Regulations 2020 reg. 3(4) (appear in person, through agent or counsel);
 * e-Jagriti (PIB, 23 Dec 2025). Frame zero = thumbnail (their HQ tower far away, your home in front).
 * Built on the english-15 engine under context/09-feedback-rules-2026-11-11.md (with the 15 Nov first-frame addendum).
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
    let s = 20261116 >>> 0;
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
    card(ctx, -360, -150, 720, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -330, -120, 660, 240, 20); ctx.stroke();
    txt(ctx, title, 0, 14, { f: '900 60px Inter', a: 'center', c: C.navy, ls: 1, maxW: 620 });
    if (subA > 0) txt(ctx, sub, 0, 84, { f: '700 36px Inter', a: 'center', c: C.cyanDark, alpha: subA, maxW: 600 });
    ctx.restore();
  }
  function tower(ctx, cx, by, s, dim = 0) {           // the company's distant glass headquarters
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    const g = ctx.createLinearGradient(-130, -720, 130, 0); g.addColorStop(0, '#2E5A96'); g.addColorStop(1, '#14305C');
    ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(-130, -640); ctx.lineTo(0, -720); ctx.lineTo(130, -640); ctx.lineTo(130, 0); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    for (let r = 0; r < 14; r++) for (let c = 0; c < 4; c++) {
      const lit = ((r * 7 + c * 3) % 5) !== 0;
      rr(ctx, -104 + c * 54, -600 + r * 42, 38, 26, 4); ctx.fillStyle = lit ? 'rgba(246,217,160,0.85)' : 'rgba(180,227,241,0.25)'; ctx.fill();
    }
    rr(ctx, -70, -690, 140, 46, 10); ctx.fillStyle = C.gold; ctx.fill();
    txt(ctx, 'HQ', 0, -655, { f: '900 32px Inter', a: 'center', c: C.navy, ls: 4 });
    if (dim > 0) { ctx.globalAlpha *= dim; ctx.beginPath(); ctx.moveTo(-132, 2); ctx.lineTo(-132, -642); ctx.lineTo(0, -722); ctx.lineTo(132, -642); ctx.lineTo(132, 2); ctx.closePath(); ctx.fillStyle = 'rgba(232,224,207,0.85)'; ctx.fill(); }
    ctx.restore();
  }
  function home(ctx, cx, by, s) {                     // your small home with a lit window
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 12;
    rr(ctx, -120, -170, 240, 170, 10); ctx.fillStyle = C.card; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-150, -160); ctx.lineTo(0, -270); ctx.lineTo(150, -160); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill();
    rr(ctx, -84, -130, 70, 62, 8); ctx.fillStyle = C.warm; ctx.fill();
    const gl = ctx.createRadialGradient(-49, -99, 4, -49, -99, 90); gl.addColorStop(0, 'rgba(246,217,160,0.7)'); gl.addColorStop(1, 'rgba(246,217,160,0)'); ctx.fillStyle = gl; ctx.fillRect(-140, -190, 180, 180);
    rr(ctx, 26, -110, 62, 110, 6); ctx.fillStyle = '#1B3A6B'; ctx.fill();
    ctx.restore();
  }
  function pin(ctx, x, y, k, col, lab) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y - 40 * (1 - clamp(k))); ctx.scale(clamp(k * 1.2), clamp(k * 1.2));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-40, -50, -46, -70, -46, -88); ctx.arc(0, -88, 46, Math.PI, 0); ctx.bezierCurveTo(46, -70, 40, -50, 0, 0); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -90, 18, 0, Math.PI * 2); ctx.fillStyle = '#FFF8EE'; ctx.fill();
    if (lab) txt(ctx, lab, 0, -150, { f: '900 38px Inter', a: 'center', c: col, ls: 2 });
    ctx.restore();
  }
  function phone(ctx, x, y, s, crack) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -70, -130, 140, 260, 22, '#0F2A55', { blur: 24, oy: 10 });
    rr(ctx, -58, -112, 116, 222, 12); ctx.fillStyle = '#2B5088'; ctx.fill();
    if (crack > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(crack * 2); ctx.strokeStyle = '#FFF8EE'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-58, -60); ctx.lineTo(-10, -20); ctx.lineTo(-24, 20); ctx.lineTo(30, 50); ctx.lineTo(58, 40);
      ctx.moveTo(-10, -20); ctx.lineTo(40, -70); ctx.moveTo(-24, 20); ctx.lineTo(-58, 70); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function bubble(ctx, x, y, k, text) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(clamp(k), clamp(k));
    card(ctx, -150, -56, 300, 112, 30, C.card, { blur: 24, oy: 10, stroke: C.red, lw: 6 });
    ctx.beginPath(); ctx.moveTo(-90, 52); ctx.lineTo(-120, 96); ctx.lineTo(-50, 54); ctx.closePath(); ctx.fillStyle = C.card; ctx.fill();
    txt(ctx, text, 0, 18, { f: '900 48px Inter', a: 'center', c: C.red, maxW: 260 });
    ctx.restore();
  }
  function commission(ctx, cx, cy, s, glow) {         // a civic building: the consumer commission
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (glow > 0) { const g = ctx.createRadialGradient(0, -40, 20, 0, -40, 360); g.addColorStop(0, `rgba(246,217,160,${0.75 * glow})`); g.addColorStop(1, 'rgba(246,217,160,0)'); ctx.fillStyle = g; ctx.fillRect(-380, -420, 760, 760); }
    ctx.beginPath(); ctx.moveTo(-230, -130); ctx.lineTo(0, -250); ctx.lineTo(230, -130); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -168, 34, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    rr(ctx, -240, -130, 480, 28, 6); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 5; i++) { rr(ctx, -196 + i * 90, -90, 42, 210, 8); ctx.fill(); }
    rr(ctx, -260, 124, 520, 34, 8); ctx.fill(); rr(ctx, -290, 160, 580, 30, 8); ctx.fill();
    ctx.restore();
  }
  function person(ctx, x, y, s, col = C.navy) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, -168, 34, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    rr(ctx, -46, -126, 92, 130, 40); ctx.fill();
    rr(ctx, -36, 0, 30, 96, 14); ctx.fill(); rr(ctx, 6, 0, 30, 96, 14); ctx.fill();
    ctx.restore();
  }
  function lawyer(ctx, x, y, s, a) {                  // a gowned figure with a briefcase, drawn faded when optional
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, -168, 34, 0, Math.PI * 2); ctx.fillStyle = '#1B1B1B'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-56, -126); ctx.lineTo(56, -126); ctx.lineTo(70, 40); ctx.lineTo(-70, 40); ctx.closePath(); ctx.fillStyle = '#1B1B1B'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, -126); ctx.lineTo(14, -126); ctx.lineTo(8, -80); ctx.lineTo(-8, -80); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    rr(ctx, -30, 40, 24, 60, 10); ctx.fillStyle = '#1B1B1B'; ctx.fill(); rr(ctx, 6, 40, 24, 60, 10); ctx.fill();
    rr(ctx, 58, -40, 70, 54, 8); ctx.fillStyle = '#6B4A2B'; ctx.fill(); rr(ctx, 80, -52, 26, 14, 5); ctx.strokeStyle = '#6B4A2B'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }
  function screenForm(ctx, cx, cy, s, press, done) {  // a generic online filing form (no real UI reproduced)
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    card(ctx, -300, -260, 600, 520, 26, '#FFFFFF', { blur: 44, oy: 18, stroke: C.navy, lw: 5 });
    ctx.save(); rr(ctx, -300, -260, 600, 520, 26); ctx.clip(); ctx.fillStyle = C.navy; ctx.fillRect(-300, -260, 600, 92); ctx.restore();
    txt(ctx, 'e-Jagriti', -250, -198, { f: '900 46px Inter', c: '#FFF8EE' });
    txt(ctx, 'NEW COMPLAINT', 250, -200, { f: '800 26px Inter', a: 'right', c: C.cyanMark, ls: 2 });
    for (let i = 0; i < 4; i++) { rr(ctx, -240, -130 + i * 70, 480, 44, 10); ctx.fillStyle = C.paper; ctx.fill(); rr(ctx, -222, -116 + i * 70, i % 2 ? 180 : 300, 16, 8); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    const pk = press > 0 && press < 1 ? 1 - 0.06 * Math.sin(Math.PI * press) : 1;
    ctx.save(); ctx.translate(0, 186); ctx.scale(pk, pk);
    rr(ctx, -150, -42, 300, 84, 42); ctx.fillStyle = done > 0 ? C.cyanDark : C.cyan; ctx.fill();
    txt(ctx, done > 0 ? 'FILED' : 'FILE', 0, 16, { f: '900 46px Inter', a: 'center', c: done > 0 ? '#FFF8EE' : C.navy, ls: 4 });
    ctx.restore();
    if (done > 0) badge(ctx, 150, 146, spring(done, 2, 0.5), true, 36);
    ctx.restore();
  }
  function iconWrench(ctx) {
    ctx.save(); ctx.rotate(-0.7);
    rr(ctx, -12, -10, 24, 110, 10); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -30, 38, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-16, -78); ctx.lineTo(16, -78); ctx.lineTo(12, -38); ctx.lineTo(-12, -38); ctx.closePath(); ctx.fillStyle = C.card; ctx.fill();
    ctx.restore();
  }
  function iconSwap(ctx) {                            // replacement: new box with circular arrows
    rr(ctx, -40, -30, 80, 70, 8); ctx.fillStyle = C.gold; ctx.fill(); ctx.fillStyle = 'rgba(2,25,59,0.25)'; ctx.fillRect(-6, -30, 12, 70);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 4, 66, -2.6, -0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 4, 66, 0.55, 2.2); ctx.stroke();
    ctx.fillStyle = C.navy; ctx.beginPath(); ctx.moveTo(44, -60); ctx.lineTo(62, -28); ctx.lineTo(26, -32); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-44, 68); ctx.lineTo(-62, 36); ctx.lineTo(-26, 40); ctx.closePath(); ctx.fill();
  }
  function iconCoinBack(ctx) {
    ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(2,25,59,0.3)'; ctx.lineWidth = 5; ctx.stroke();
    txt(ctx, '₹', 0, 24, { f: '900 66px Inter', a: 'center', c: C.navy });
  }
  function iconScales(ctx) {                          // compensation: a balance tipping
    ctx.fillStyle = C.navy; rr(ctx, -6, -60, 12, 110, 5); ctx.fill(); rr(ctx, -40, 46, 80, 14, 6); ctx.fill();
    ctx.save(); ctx.translate(0, -52); ctx.rotate(-0.18); rr(ctx, -70, -5, 140, 10, 5); ctx.fill();
    ctx.beginPath(); ctx.arc(-62, 26, 26, 0, Math.PI); ctx.fillStyle = C.gold; ctx.fill(); ctx.beginPath(); ctx.arc(62, 26, 26, 0, Math.PI); ctx.fill();
    ctx.restore();
  }
  function billDoc(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-70, -100); ctx.lineTo(70, -100); ctx.lineTo(70, 92);
    for (let i = 0; i < 7; i++) { ctx.lineTo(70 - 10 - i * 20, 80); ctx.lineTo(70 - 20 - i * 20, 92); }
    ctx.lineTo(-70, -100); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    txt(ctx, 'BILL', 0, -58, { f: '900 34px Inter', a: 'center', ls: 4 });
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 4; i++) { rr(ctx, -46, -30 + i * 26, i === 3 ? 50 : 92, 10, 5); ctx.fill(); }
    ctx.restore();
  }
  function replyDoc(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    rr(ctx, -90, -62, 150, 86, 18); ctx.fillStyle = C.cyanTint; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.stroke();
    rr(ctx, -40, 0, 140, 80, 18); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.navyFaint; rr(ctx, -70, -40, 100, 10, 5); ctx.fill(); rr(ctx, -20, 22, 100, 10, 5); ctx.fill(); rr(ctx, -20, 44, 60, 10, 5); ctx.fill();
    ctx.restore();
  }
  function folder(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -150, -120, 120, 40, 10); ctx.fillStyle = '#E6D3AC'; ctx.fill();
    card(ctx, -150, -100, 300, 210, 16, '#F2E3C2', { blur: 24, oy: 10 });
    ctx.restore();
  }

  // ---------- scene windows ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {
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
  function label(ctx, s, x, y, k, o = {}) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.5); ctx.translate(x, y + (1 - eo(clamp(k))) * 24);
    txt(ctx, s, 0, 0, { f: o.f || '900 60px Inter', a: 'center', c: o.c || C.navy, ls: o.ls ?? 1, maxW: o.maxW || 760 });
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

  // V1 — frame zero: your small home in front, their HQ tower far away (hook + escalation)
  function landscape(ctx, t, thumb = false) {
    spotlight(ctx, 260, 1300, 700, 1);
    const gg = ctx.createLinearGradient(0, 1380, 0, 1760); gg.addColorStop(0, 'rgba(201,214,180,0.75)'); gg.addColorStop(1, 'rgba(201,214,180,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, 1380, W, 380);
    // the road from your door to their tower, receding in depth
    ctx.beginPath(); ctx.moveTo(150, 1640); ctx.bezierCurveTo(440, 1520, 650, 1460, 845, 1392); ctx.lineTo(887, 1392); ctx.bezierCurveTo(720, 1470, 530, 1560, 330, 1660); ctx.closePath();
    ctx.fillStyle = 'rgba(2,25,59,0.16)'; ctx.fill();
    tower(ctx, 860, 1395, 0.78, 0);
    const hz = ctx.createLinearGradient(0, 760, 0, 1400); hz.addColorStop(0, 'rgba(244,238,226,0.35)'); hz.addColorStop(1, 'rgba(244,238,226,0)');
    ctx.fillStyle = hz; ctx.fillRect(560, 760, 520, 640);                                       // atmospheric depth on the far tower
    home(ctx, 250, 1600, 1.15);
    // pins are present from frame zero (= thumbnail) and bounce on their words
    const b1 = thumb ? 0 : wobble(t - E.pinHQ, 0.18, 2.2, 3), b2 = thumb ? 0 : wobble(t - E.pinHome, 0.18, 2.2, 3);
    pin(ctx, 860, 820 - 60 * Math.max(0, b1), 1, C.navy, 'THEIRS');
    pin(ctx, 250, 1270 - 60 * Math.max(0, b2), 1, C.red, 'YOURS');
  }
  function v1(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    landscape(ctx, t);
    if (t >= E.phone) { const k = spring(t - E.phone, 1.6, 0.55); phone(ctx, 470, 1520, clamp(k) * 0.9, P(t, E.phone + 0.25, E.phone + 0.5)); }
    bubble(ctx, 560, 1300, spring(t - E.noreply, 1.8, 0.5), 'NO REPLY');
    label(ctx, 'ANOTHER STATE', 820, 1490, eo(P(t, E.state, E.state + 0.35)), { f: '900 46px Inter', c: C.navy, maxW: 420 });
    ctx.restore();
    chip(ctx, 570, win(t, E.v2c + 0.2, E.v3).a);
  }
  // V3 — the Act
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v3b), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1040, k, 'CONSUMER PROTECTION ACT', '2019 · Section 34', eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
    });
  }
  // V3b — file where you live: a commission rises next to your home; their tower fades
  function v3b(ctx, t) {
    withScene(ctx, win(t, E.v3b, E.v4), () => {
      spotlight(ctx, 330, 1250, 760, 0.9);
      tower(ctx, 880, 1300, 0.55, 0.3 + 0.5 * eo(P(t, E.near, E.near + 0.6)));
      home(ctx, 230, 1430, 1.0);
      const ck = eob(P(t, E.near, E.near + 0.5), 1.1);
      if (ck > 0) { ctx.save(); ctx.globalAlpha *= clamp(ck * 2); commission(ctx, 560, 1300 + 60 * (1 - clamp(ck)), 0.62, eo(P(t, E.near + 0.3, E.near + 0.8))); ctx.restore(); }
      label(ctx, 'WHERE YOU LIVE', CX - 40, 870, eo(P(t, E.near + 0.1, E.near + 0.45)), { f: '900 72px Inter', c: C.cyanDark });
    });
  }
  // V4 — file it yourself online
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v4b), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      screenForm(ctx, CX, 1060, 1.05, P(t, E.file, E.file + 0.3), t >= E.filed ? t - E.filed : 0);
      label(ctx, 'FILE IT YOURSELF', CX, 1440, eo(P(t, E.screen + 0.3, E.screen + 0.7)), { f: '900 66px Inter' });
    });
  }
  // V4b — appear in person; a lawyer is optional
  function v4b(ctx, t) {
    withScene(ctx, win(t, E.v4b, E.v5), () => {
      spotlight(ctx, CX, 1100, 760, 0.6);
      person(ctx, 330, 1300, 1.5);
      label(ctx, 'YOU', 330, 1540, 1, { f: '900 56px Inter' });
      const lk = eo(P(t, E.optional, E.optional + 0.5));
      lawyer(ctx, 700, 1300, 1.5, lerp(1, 0.35, lk));
      if (lk > 0) {
        ctx.save(); ctx.translate(700, 1080); ctx.rotate(-0.1); ctx.scale(lerp(1.4, 1, eob(lk, 1.2)), lerp(1.4, 1, eob(lk, 1.2))); ctx.globalAlpha *= clamp(lk * 3);
        rr(ctx, -170, -44, 340, 88, 14); ctx.fillStyle = 'rgba(255,253,248,0.9)'; ctx.fill(); ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 7; ctx.stroke();
        txt(ctx, 'OPTIONAL', 0, 18, { f: '900 52px Inter', a: 'center', c: C.cyanDark, ls: 3, maxW: 310 });
        ctx.restore();
      }
      label(ctx, 'LAWYER', 700, 1540, 1, { f: '900 56px Inter', c: C.navySoft });
    });
  }
  // V5 — the deadline: two years from the problem
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const x0 = 150, x1 = 850, y = 1080, fk = eio(P(t, E.bar, E.bar + 0.8));
      rr(ctx, x0, y - 22, x1 - x0, 44, 22); ctx.fillStyle = C.navyFaint; ctx.fill();
      if (fk > 0) { rr(ctx, x0, y - 22, Math.max(44, (x1 - x0) * fk), 44, 22); ctx.fillStyle = C.cyan; ctx.fill(); }
      for (const [f, s] of [[0.5, '1 YR'], [1, '2 YRS']]) {
        const k = eo(P(t, E.bar + 0.8 * f - 0.1, E.bar + 0.8 * f + 0.2));
        if (k > 0) { ctx.save(); ctx.globalAlpha *= k; rr(ctx, x0 + (x1 - x0) * f - 4, y - 46, 8, 92, 4); ctx.fillStyle = C.navy; ctx.fill(); txt(ctx, s, x0 + (x1 - x0) * f, y + 100, { f: '900 44px Inter', a: f === 1 ? 'right' : 'center' }); ctx.restore(); }
      }
      pin(ctx, x0 + 10, y - 30, eob(P(t, E.problem, E.problem + 0.35), 1.2), C.red, 'PROBLEM');
      label(ctx, 'DEADLINE', CX, 840, eo(P(t, E.v5 + 0.15, E.v5 + 0.5)) * (1 - P(t, E.bar - 0.15, E.bar + 0.05)), { f: '900 96px Inter', ls: 4, c: C.red });
      label(ctx, '2 YEARS', CX, 840, eo(P(t, E.bar + 0.1, E.bar + 0.45)), { f: '900 96px Inter', ls: 4 });
    });
  }
  // V6 — what the commission can order: four remedies, one at a time
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1100, 760, 0.6);
      const items = [[E.r1, iconWrench, 'REPAIR'], [E.r2, iconSwap, 'REPLACE'], [E.r3, iconCoinBack, 'REFUND'], [E.r4, iconScales, 'COMPENSATION']];
      items.forEach(([te, icon, lab], i) => {
        const x = i % 2 ? 690 : 310, y = 900 + Math.floor(i / 2) * 380;
        if (t < te) {                                   // four empty slots: the remedies still to come
          ctx.save(); ctx.globalAlpha *= 0.55; rr(ctx, x - 110, y - 110, 220, 220, 48); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 6; ctx.setLineDash([]); ctx.stroke();
          txt(ctx, '?', x, y + 34, { f: '900 96px Inter', a: 'center', c: C.navyFaint }); ctx.restore();
          return;
        }
        const k = spring(t - te, 1.8, 0.55);
        ctx.save(); ctx.translate(x, y); ctx.scale(clamp(k) * 1.0, clamp(k) * 1.0);
        card(ctx, -110, -110, 220, 220, 48, C.card, { blur: 30, oy: 12 });
        ctx.save(); ctx.scale(1.25, 1.25); icon(ctx); ctx.restore();
        txt(ctx, lab, 0, 170, { f: '900 46px Inter', a: 'center', maxW: 360 });
        ctx.restore();
      });
    });
  }
  // V7 — payoff: keep the evidence, file with the district commission
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1100, 760, 0.6);
      const fl = eio(P(t, E.fly, E.fly + 0.7));
      const bk = eo(P(t, E.bill, E.bill + 0.45)), rk = eo(P(t, E.replies, E.replies + 0.45));
      ctx.save(); ctx.globalAlpha *= 1 - P(fl, 0.75, 1);
      ctx.translate(lerp(330, 720, fl), lerp(1240, 1130, fl)); ctx.scale(1 - 0.65 * fl, 1 - 0.65 * fl); ctx.translate(-330, -1240);
      folder(ctx, 330, 1240, 1.25);
      if (bk > 0) billDoc(ctx, lerp(150, 290, bk), lerp(900, 1180, bk), 1.1, lerp(-0.4, -0.12, bk));
      if (rk > 0) replyDoc(ctx, lerp(560, 400, rk), lerp(900, 1200, rk), 1.1, lerp(0.4, 0.1, rk));
      ctx.restore();
      label(ctx, 'BILL + REPLIES', 330, 1460, eo(P(t, E.replies + 0.2, E.replies + 0.55)) * (1 - P(t, E.fly - 0.35, E.fly - 0.05)), { f: '900 58px Inter' });
      if (t >= E.fly - 0.2) { const ck = eo(P(t, E.fly - 0.2, E.fly + 0.3)); ctx.save(); ctx.globalAlpha *= ck; commission(ctx, 720, 1180, 0.6, eo(P(t, E.fly + 0.5, E.fly + 0.9))); ctx.restore(); }
      label(ctx, 'DISTRICT COMMISSION', CX, 1440, eo(P(t, E.fly + 0.4, E.fly + 0.8)), { f: '900 62px Inter', c: C.cyanDark });
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
    v1(ctx, t); v3(ctx, t); v3b(ctx, t); v4(ctx, t); v4b(ctx, t); v5(ctx, t); v6(ctx, t); v7(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition with both pins, plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    landscape(ctx, 0, true);
    drawCaptions(ctx, 0);
    chip(ctx, 600, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
