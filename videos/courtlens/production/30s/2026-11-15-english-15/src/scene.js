/* Courtlens · "Is this legal in India?" · Episode 15 (English, english-15): can your employer keep your original
 * certificates? Scope: one clear case — A. John Paul v. State (Madras High Court, 10 Jul 2012, Crl.OP 9920/2012):
 * certificates handed over at joining are only entrusted; they cannot be retained "like a ransom" after the teachers
 * resigned and asked for them; the school may sue for money owed; police were directed to register a s.406 IPC case.
 * Frame zero is a fully composed hero image (degree locked in an office glass drawer) that doubles as the thumbnail.
 * Built on the english-14 engine under context/09-feedback-rules-2026-11-11.md.
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
    let s = 20261115 >>> 0;
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
    card(ctx, -350, -150, 700, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -320, -120, 640, 240, 20); ctx.stroke();
    txt(ctx, title, 0, 14, { f: '900 72px Inter', a: 'center', c: C.navy, ls: 1, maxW: 600 });
    if (subA > 0) txt(ctx, sub, 0, 84, { f: '700 34px Inter', a: 'center', c: C.cyanDark, alpha: subA, maxW: 580 });
    ctx.restore();
  }
  function degree(ctx, cx, cy, s, rot = 0) {          // a generic degree certificate (no real institution)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -230, -165, 460, 330, 10, '#FFFBF0', { blur: 22, oy: 10 });
    ctx.strokeStyle = C.gold; ctx.lineWidth = 6; rr(ctx, -212, -147, 424, 294, 6); ctx.stroke();
    ctx.strokeStyle = 'rgba(215,163,81,0.5)'; ctx.lineWidth = 2; rr(ctx, -200, -135, 400, 270, 4); ctx.stroke();
    txt(ctx, 'DEGREE', 0, -62, { f: '900 54px Inter', a: 'center', c: C.navy, ls: 8 });
    ctx.fillStyle = C.navyFaint; rr(ctx, -150, -30, 300, 12, 6); ctx.fill(); rr(ctx, -110, -4, 220, 12, 6); ctx.fill();
    // signature + seal with ribbon
    ctx.strokeStyle = C.navySoft; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-170, 92); ctx.bezierCurveTo(-140, 62, -120, 112, -90, 80); ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(120, 92); ctx.lineTo(100, 150); ctx.lineTo(122, 136); ctx.lineTo(136, 156); ctx.lineTo(140, 96); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(150, 92); ctx.lineTo(176, 146); ctx.lineTo(154, 138); ctx.lineTo(142, 158); ctx.lineTo(134, 98); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(136, 76, 38, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.beginPath(); ctx.arc(136, 76, 27, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(2,25,59,0.3)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }
  function padlock(ctx, x, y, s, open, rot = 0) {     // open 0 = locked, 1 = shackle lifted
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.translate(0, -40 * open);
    ctx.beginPath(); ctx.arc(0, -40, 40, Math.PI, 0); ctx.lineTo(40, 10); ctx.moveTo(-40, -40); ctx.lineTo(-40, 10);
    ctx.strokeStyle = '#8C93A3'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    rr(ctx, -64, -16, 128, 112, 20); ctx.fillStyle = C.gold; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(-64, -16, 64, 96); g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)');
    rr(ctx, -64, -16, 128, 112, 20); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 30, 13, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill(); rr(ctx, -5, 34, 10, 30, 4); ctx.fill();
    ctx.restore();
  }
  // the office glass-front drawer with the degree locked inside — frame zero and the thumbnail
  function cabinet(ctx, cx, cy, s, o = {}) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    // cabinet body (desk-height office unit) with depth
    card(ctx, -400, -330, 800, 660, 26, '#1B3A6B', { blur: 60, oy: 30, shadow: 'rgba(2,25,59,0.35)' });
    const bg = ctx.createLinearGradient(0, -330, 0, 330); bg.addColorStop(0, '#24467C'); bg.addColorStop(1, '#14305C');
    rr(ctx, -400, -330, 800, 660, 26); ctx.fillStyle = bg; ctx.fill();
    // inner well behind the glass, warmly lit
    rr(ctx, -350, -280, 700, 470, 16); ctx.fillStyle = '#0D2550'; ctx.fill();
    const wl = ctx.createRadialGradient(0, -60, 20, 0, -60, 420); wl.addColorStop(0, 'rgba(246,217,160,0.55)'); wl.addColorStop(1, 'rgba(246,217,160,0.05)');
    rr(ctx, -350, -280, 700, 470, 16); ctx.fillStyle = wl; ctx.fill();
    degree(ctx, 0, -46, 1.18, -0.03);
    // the glass pane: tint + sheen sweep
    ctx.save(); rr(ctx, -350, -280, 700, 470, 16); ctx.clip();
    ctx.fillStyle = 'rgba(180,227,241,0.20)'; ctx.fillRect(-350, -280, 700, 470);
    const sx = lerp(-700, 700, o.sweep ?? 0.35);
    const sg = ctx.createLinearGradient(sx - 140, -280, sx + 140, 190);
    sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.38)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.fillRect(-350, -280, 700, 470);
    ctx.restore();
    rr(ctx, -350, -280, 700, 470, 16); ctx.strokeStyle = 'rgba(216,239,246,0.85)'; ctx.lineWidth = 6; ctx.stroke();
    // drawer front below the glass: handle + hasp
    rr(ctx, -350, 214, 700, 90, 14); ctx.fillStyle = '#2B5088'; ctx.fill();
    rr(ctx, -110, 246, 220, 26, 13); ctx.fillStyle = '#C9D2E0'; ctx.fill();
    rr(ctx, -318, 236, 110, 46, 8); ctx.fillStyle = C.gold; ctx.fill();
    txt(ctx, 'HR', -263, 271, { f: '900 30px Inter', a: 'center', c: C.navy, ls: 4 });
    rr(ctx, -26, 170, 52, 110, 10); ctx.fillStyle = '#8C93A3'; ctx.fill();
    ctx.restore();
    padlock(ctx, cx, cy + (226) * s, 1.15 * s, o.open || 0, o.lockRot || 0);
  }
  function resignLetter(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -150, -190, 300, 380, 10, '#FFFFFF', { blur: 30, oy: 14, stroke: C.navy, lw: 4 });
    txt(ctx, 'RESIGNATION', 0, -128, { f: '900 34px Inter', a: 'center', ls: 2, maxW: 260 });
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 6; i++) { rr(ctx, -110, -80 + i * 38, i === 5 ? 110 : 220, 12, 6); ctx.fill(); }
    ctx.strokeStyle = C.navySoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-100, 150); ctx.bezierCurveTo(-60, 110, -40, 170, 0, 130); ctx.stroke();
    ctx.restore();
  }
  function payTag(ctx, ax, ay, k, swing, fall = 0) {  // red tag hanging from the drawer handle
    if (k <= 0) return;
    ctx.save(); ctx.translate(ax + 120 * fall, ay + 520 * fall * fall); ctx.rotate(swing + 0.9 * fall); ctx.globalAlpha *= clamp(k * 2) * (1 - fall);
    ctx.strokeStyle = C.navySoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 60 * k); ctx.stroke();
    ctx.translate(0, 60 * k);
    card(ctx, -170, 0, 340, 120, 16, C.card, { blur: 20, oy: 10, stroke: C.red, lw: 7 });
    ctx.beginPath(); ctx.arc(0, 18, 8, 0, Math.PI * 2); ctx.fillStyle = C.navySoft; ctx.fill();
    txt(ctx, 'PAY UP FIRST', 0, 84, { f: '900 46px Inter', a: 'center', c: C.red, maxW: 300 });
    ctx.restore();
  }
  function person(ctx, x, y, s, col = C.navy) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, -168, 34, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    rr(ctx, -46, -126, 92, 130, 40); ctx.fill();
    rr(ctx, -36, 0, 30, 96, 14); ctx.fill(); rr(ctx, 6, 0, 30, 96, 14); ctx.fill();
    ctx.restore();
  }
  function hrTray(ctx, x, y, s) {                     // the employer's document tray
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -150, -40, 300, 120, 18, '#1B3A6B', { blur: 26, oy: 12 });
    rr(ctx, -130, -60, 260, 30, 10); ctx.fillStyle = '#2B5088'; ctx.fill();
    txt(ctx, 'HR', 0, 48, { f: '900 52px Inter', a: 'center', c: '#FFF8EE', ls: 6 });
    ctx.restore();
  }
  function coin(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(0, 0, 90, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(2,25,59,0.3)'; ctx.lineWidth = 6; ctx.stroke();
    txt(ctx, '₹', 0, 38, { f: '900 104px Inter', a: 'center', c: C.navy });
    ctx.restore();
  }
  function courthouse(ctx, cx, cy, s, glow) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    if (glow > 0) { const g = ctx.createRadialGradient(0, -40, 20, 0, -40, 360); g.addColorStop(0, `rgba(246,217,160,${0.7 * glow})`); g.addColorStop(1, 'rgba(246,217,160,0)'); ctx.fillStyle = g; ctx.fillRect(-380, -420, 760, 760); }
    ctx.beginPath(); ctx.moveTo(-230, -130); ctx.lineTo(0, -250); ctx.lineTo(230, -130); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -240, -130, 480, 28, 6); ctx.fill();
    for (let i = 0; i < 5; i++) { rr(ctx, -196 + i * 90, -90, 42, 210, 8); ctx.fill(); }
    rr(ctx, -260, 124, 520, 34, 8); ctx.fill(); rr(ctx, -290, 160, 580, 30, 8); ctx.fill();
    ctx.restore();
  }
  function shield(ctx, x, y, s) {                     // generic police shield (no real insignia)
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(100, -84); ctx.lineTo(92, 30); ctx.bezierCurveTo(80, 90, 30, 120, 0, 136); ctx.bezierCurveTo(-30, 120, -80, 90, -92, 30); ctx.lineTo(-100, -84); ctx.closePath();
    ctx.fillStyle = '#1B3A6B'; ctx.fill(); ctx.restore();
    ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 22 : 52; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r + 6); } ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore();
  }
  function caseFile(ctx, x, y, s, stampK) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -190, -140, 380, 280, 14, '#F2E3C2', { blur: 26, oy: 12 });
    rr(ctx, -190, -168, 150, 40, 10); ctx.fillStyle = '#E6D3AC'; ctx.fill();
    ctx.fillStyle = 'rgba(2,25,59,0.18)'; for (let i = 0; i < 4; i++) { rr(ctx, -140, -90 + i * 36, i === 3 ? 140 : 280, 12, 6); ctx.fill(); }
    if (stampK > 0) {
      ctx.save(); ctx.rotate(-0.12); ctx.scale(lerp(1.5, 1, eob(clamp(stampK), 1.2)), lerp(1.5, 1, eob(clamp(stampK), 1.2))); ctx.globalAlpha *= clamp(stampK * 4);
      rr(ctx, -170, 40, 340, 78, 12); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.stroke();
      txt(ctx, 'REGISTERED', 0, 96, { f: '900 46px Inter', a: 'center', c: C.red, ls: 3, maxW: 310 });
      ctx.restore();
    }
    ctx.restore();
  }
  function iconReceipt(ctx) {
    ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(40, 56);
    for (let i = 0; i < 4; i++) { ctx.lineTo(40 - 10 - i * 20, 46); ctx.lineTo(40 - 20 - i * 20, 56); }
    ctx.lineTo(-40, -60); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 2; i++) { rr(ctx, -26, -42 + i * 22, 52, 8, 4); ctx.fill(); }
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-24, 22); ctx.bezierCurveTo(-10, 4, 0, 36, 22, 14); ctx.stroke();
  }
  function iconLetter(ctx) {
    rr(ctx, -44, -58, 88, 116, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 4; i++) { rr(ctx, -28, -36 + i * 22, i === 3 ? 30 : 56, 8, 4); ctx.fill(); }
    ctx.save(); ctx.translate(30, 30); ctx.rotate(-0.7); rr(ctx, -7, -60, 14, 64, 5); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
  }
  function iconReplies(ctx) {
    rr(ctx, -56, -54, 88, 58, 14); ctx.fillStyle = C.cyanTint; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.stroke();
    rr(ctx, -24, 2, 84, 54, 14); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.navyFaint; rr(ctx, -42, -36, 56, 8, 4); ctx.fill(); rr(ctx, -10, 20, 54, 8, 4); ctx.fill(); rr(ctx, -10, 34, 34, 8, 4); ctx.fill();
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

  // V1 — hook + escalation: the degree locked in the office glass drawer (fully composed at frame zero)
  function hero(ctx, t, thumb = false) {
    spotlight(ctx, CX, 1120, 820, 1);
    const dg = ctx.createLinearGradient(0, 1470, 0, 1640); dg.addColorStop(0, '#B98A57'); dg.addColorStop(1, '#9C6F42');
    rr(ctx, -40, 1470, W + 80, 170, 0); ctx.fillStyle = dg; ctx.fill();
    const df = ctx.createLinearGradient(0, 1640, 0, 1760); df.addColorStop(0, 'rgba(2,25,59,0.18)'); df.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.fillStyle = df; ctx.fillRect(0, 1640, W, 120);
    tableShadow(ctx, CX, 1500, 480, 1.2);
    const sweep = thumb ? 0.36 : lerp(0.36, 1.2, eio(P(t, E.sweep, E.sweep + 0.9)));
    const rattle = thumb ? 0 : wobble(t - E.rattle, 0.22, 4.5, 4.5);
    const lift = thumb ? 0 : Math.max(0, wobble(t - E.rattle, 0.18, 4.5, 6));
    cabinet(ctx, CX, 1150, 1.0, { sweep, open: lift, lockRot: rattle });
  }
  function v1(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    hero(ctx, t);
    // resignation letter slides onto the desk in front
    if (t >= E.letter) { const k = eo(P(t, E.letter, E.letter + 0.5)); resignLetter(ctx, lerp(-200, 205, k), 1500, 0.78, lerp(-0.4, -0.12, k)); }
    // "pay up, or it stays": a red tag swings onto the drawer hasp
    if (t >= E.tag) payTag(ctx, CX + 70, 1420, eo(P(t, E.tag, E.tag + 0.4)), wobble(t - E.tag, 0.25, 1.3, 2.2) + 0.08);
    ctx.restore();
    chip(ctx, 570, win(t, E.v2c + 0.2, E.v3).a);
  }
  // V3 — custody with consent: the degree is handed over at joining
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 1100, 760, 0.7);
      ctx.fillStyle = 'rgba(27,58,107,0.85)'; rr(ctx, 60, 1290, 960, 26, 13); ctx.fill();        // the desk edge
      person(ctx, 210, 1185, 1.3);
      hrTray(ctx, 790, 1215, 1.25);
      const pk = eio(P(t, E.pass, E.pass + 1.3));
      degree(ctx, lerp(290, 790, pk), lerp(980, 1110, pk) - Math.sin(Math.PI * pk) * 110, lerp(0.55, 0.62, pk), lerp(-0.1, 0.02, pk));
      label(ctx, 'CUSTODY', CX, 820, eo(P(t, E.custody, E.custody + 0.35)), { f: '900 92px Inter', ls: 4 });
      label(ctx, 'WITH CONSENT', CX - 40, 1440, eo(P(t, E.consent, E.consent + 0.35)), { f: '900 60px Inter', c: C.cyanDark });
      badge(ctx, CX + 255, 1420, spring(t - E.consent - 0.1, 2, 0.5), true, 32);
    });
  }
  // V4 — the court
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v4b), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1040, k, 'MADRAS HIGH COURT', '2012 · teachers v. their school', eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
    });
  }
  // V4b — not a ransom: the tag is torn away
  function v4b(ctx, t) {
    withScene(ctx, win(t, E.v4b, E.v5), () => {
      ctx.save(); ctx.translate(CX, 1060); ctx.scale(0.82, 0.82); ctx.translate(-CX, -1060);
      hero(ctx, t, true);
      const fall = eio(P(t, E.tear, E.tear + 0.6));
      payTag(ctx, CX + 70, 1420, 1, 0.08 + wobble(t - E.v4b, 0.12, 1.3, 2), fall);
      ctx.restore();
      if (t >= E.tear) { badge(ctx, CX + 290, 1330, spring(t - E.tear, 2, 0.5), false, 46); }
      label(ctx, 'NOT A RANSOM', CX, 780, eo(P(t, E.tear + 0.1, E.tear + 0.45)), { f: '900 80px Inter', c: C.redDark });
    });
  }
  // V5 — money owed: the employer can sue
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v5b), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const ck = spring(t - E.coin, 1.6, 0.55);
      const mv = eio(P(t, E.sue - 0.6, E.sue + 0.2));
      if (t >= E.coin) coin(ctx, lerp(CX, 260, mv), lerp(1000, 1060, mv), clamp(ck) * lerp(1.2, 0.8, mv));
      if (mv > 0) {
        ctx.save(); ctx.globalAlpha *= mv; courthouse(ctx, 730, 1080, 0.72, eo(P(t, E.sue, E.sue + 0.5))); ctx.restore();
        const ap = eo(P(t, E.sue - 0.2, E.sue + 0.3));
        ctx.save(); ctx.globalAlpha *= ap; ctx.fillStyle = C.navySoft;
        rr(ctx, 370, 1052, 150 * ap, 14, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(370 + 150 * ap + 22, 1059); ctx.lineTo(370 + 150 * ap - 6, 1038); ctx.lineTo(370 + 150 * ap - 6, 1080); ctx.closePath(); ctx.fill(); ctx.restore();
      }
      label(ctx, 'MONEY OWED?', CX, 820, eo(P(t, E.coin + 0.2, E.coin + 0.55)) * (1 - P(t, E.sue - 0.4, E.sue - 0.1)), { f: '900 76px Inter' });
      label(ctx, 'SUE FOR IT', CX, 1400, eo(P(t, E.sue, E.sue + 0.35)), { f: '900 76px Inter', c: C.cyanDark });
    });
  }
  // V5b — the court told police to register a breach-of-trust case
  function v5b(ctx, t) {
    withScene(ctx, win(t, E.v5b, E.v6), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const sk = spring(t - E.police, 1.6, 0.55);
      if (t >= E.police) shield(ctx, 270, 1000, clamp(sk) * 1.0);
      if (t >= E.file) { const fk = eo(P(t, E.file, E.file + 0.45)); ctx.save(); ctx.globalAlpha *= fk; caseFile(ctx, lerp(900, 680, fk), 1040, 0.95, P(t, E.trust, E.trust + 0.3)); ctx.restore(); }
      label(ctx, 'POLICE CASE', CX, 1330, eo(P(t, E.police + 0.2, E.police + 0.55)), { f: '900 70px Inter' });
      label(ctx, 'BREACH OF TRUST', CX, 1420, eo(P(t, E.trust, E.trust + 0.35)), { f: '900 54px Inter', c: C.red });
    });
  }
  // V6 — payoff: evidence, one step at a time
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v8), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const items = [[E.s1, iconReceipt, 'SIGNED RECEIPT'], [E.s2, iconLetter, 'ASK IN WRITING'], [E.s3, iconReplies, 'KEEP REPLIES']];
      items.forEach(([te, icon, lab], i) => {
        if (t < te) return;
        const k = spring(t - te, 1.7, 0.6), y = 840 + i * 240;
        ctx.save(); ctx.translate(210 + (1 - clamp(k)) * 120, y); ctx.globalAlpha *= clamp(k * 1.5);
        card(ctx, -80, -80, 160, 160, 38, C.card, { blur: 26, oy: 10 });
        ctx.save(); ctx.scale(0.95, 0.95); icon(ctx); ctx.restore();
        txt(ctx, lab, 120, 20, { f: '900 58px Inter', maxW: 560 });
        ctx.restore();
        badge(ctx, 285, y - 70, spring(t - te - 0.25, 2, 0.5), true, 24);
      });
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
    v1(ctx, t); v3(ctx, t); v4(ctx, t); v4b(ctx, t); v5(ctx, t); v5b(ctx, t); v6(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition, plus the series chip ----------
  function renderThumb(ctx) {
    render(ctx, 0);
    chip(ctx, 600, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
