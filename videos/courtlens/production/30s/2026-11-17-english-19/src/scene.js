/* Courtlens · "Is this legal in India?" · Episode 19 (English, english-19, batch 19): can a shop charge you for a
 * carry bag? Basis: NCDRC, Bata India Ltd v. Dinesh Parshad Raturi, RP 1715/2019 with RP 774/2020, 27 Nov 2024,
 * paras 23.1–23.5 (no obligation to give bags free; buying one must be optional; a bag carrying the seller's name or
 * logo cannot be charged for; customers may bring empty bags; notices incl. at the entrance, before purchase), building
 * on NCDRC, Big Bazaar (Future Retail Ltd.) v. Ashok Kumar, RP 975/2020, 22 Dec 2020. Frame zero = thumbnail.
 * Built on the english-18 engine under context/09-feedback-rules-2026-11-11.md.
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
    let s = 20261118 >>> 0;
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
  function stampCard(ctx, cx, cy, k, kicker, title, sub, subA) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -400, -170, 800, 340, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -370, -140, 740, 280, 20); ctx.stroke();
    txt(ctx, kicker, 0, -52, { f: '800 40px Inter', a: 'center', c: C.cyanDark, ls: 10 });
    txt(ctx, title, 0, 30, { f: '900 66px Inter', a: 'center', c: C.navy, ls: 1, maxW: 690 });
    if (subA > 0) txt(ctx, sub, 0, 100, { f: '700 36px Inter', a: 'center', c: C.cyanDark, alpha: subA, maxW: 660 });
    ctx.restore();
  }
  // a kraft paper shopping bag (generic shop, no real brand). Local origin = bottom centre of the front face.
  function shopBag(ctx, cx, by, s, o = {}) {
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-60, -510); ctx.bezierCurveTo(-52, -705, 168, -705, 176, -515);     // back handle
    ctx.strokeStyle = '#94652F'; ctx.lineWidth = 17; ctx.stroke();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.28)'; ctx.shadowBlur = 44; ctx.shadowOffsetY = 20;
    ctx.beginPath(); ctx.moveTo(-210, -500); ctx.lineTo(-150, -528); ctx.lineTo(276, -528); ctx.lineTo(276, -26); ctx.lineTo(210, 0); ctx.lineTo(-210, 0); ctx.closePath();
    ctx.fillStyle = '#B98A50'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.moveTo(-210, -500); ctx.lineTo(-150, -528); ctx.lineTo(276, -528); ctx.lineTo(210, -500); ctx.closePath();
    ctx.fillStyle = '#7E5426'; ctx.fill();                                                        // open top, inside
    ctx.beginPath(); ctx.moveTo(210, -500); ctx.lineTo(276, -528); ctx.lineTo(276, -26); ctx.lineTo(210, 0); ctx.closePath();
    const gs = ctx.createLinearGradient(210, 0, 276, 0); gs.addColorStop(0, '#A87A42'); gs.addColorStop(1, '#C59A60');
    ctx.fillStyle = gs; ctx.fill();                                                               // side gusset (depth)
    const g = ctx.createLinearGradient(-210, 0, 210, 0); g.addColorStop(0, '#CD9C5E'); g.addColorStop(0.42, '#E4BE86'); g.addColorStop(1, '#D3A465');
    rr(ctx, -210, -500, 420, 500, 4); ctx.fillStyle = g; ctx.fill();                               // front face
    rr(ctx, -210, -500, 420, 44, 4); ctx.fillStyle = 'rgba(110,70,25,0.16)'; ctx.fill();           // folded top band
    ctx.beginPath(); ctx.moveTo(-120, -478); ctx.bezierCurveTo(-110, -690, 110, -690, 120, -478);   // front handle
    ctx.strokeStyle = '#A9743C'; ctx.lineWidth = 19; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,236,200,0.35)'; ctx.lineWidth = 5; ctx.stroke();
    for (const x of [-120, 120]) { rr(ctx, x - 16, -492, 32, 30, 6); ctx.fillStyle = '#A06C35'; ctx.fill(); }
    if (o.logo > 0) {                                                                             // the shop's own logo
      const k = o.logoK ?? 1;
      ctx.save(); ctx.globalAlpha *= clamp(o.logo); ctx.translate(0, -262); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, 0, 112, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 94, 0, Math.PI * 2); ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.stroke();
      txt(ctx, 'S', 0, 52, { f: '900 150px Inter', a: 'center', c: '#FFF4DF' });
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= clamp(o.logo);
      txt(ctx, 'SHOP', 0, -64, { f: '900 60px Inter', a: 'center', c: C.navy, ls: 12 });
      ctx.restore();
    }
    if (o.tag) priceTag(ctx, 100, -560, o.swing || 0, o.tagFlip || 0, o.tagScale || 1);
    ctx.restore();
  }
  function priceTag(ctx, ax, ay, swing, flip, ts) {                      // hangs from the handle; flips to FREE
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(0.12 + swing); ctx.scale(ts, ts);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, 40, 64, 104); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    ctx.translate(64, 104); ctx.rotate(-0.42);
    const sx = Math.max(0.02, Math.abs(Math.cos(Math.PI * clamp(flip)))), free = flip > 0.5;
    ctx.translate(122, 0); ctx.scale(sx, 1); ctx.translate(-122, 0);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, -62); ctx.lineTo(244, -62); ctx.quadraticCurveTo(262, -62, 262, -44);
    ctx.lineTo(262, 44); ctx.quadraticCurveTo(262, 62, 244, 62); ctx.lineTo(18, 62); ctx.closePath();
    ctx.fillStyle = free ? C.cyan : C.card; ctx.fill(); ctx.restore();
    ctx.strokeStyle = free ? C.navy : C.red; ctx.lineWidth = 5; ctx.stroke();
    ctx.beginPath(); ctx.arc(14, 0, 10, 0, Math.PI * 2); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    txt(ctx, free ? 'FREE' : '₹18', 142, 28, { f: '900 78px Inter', a: 'center', c: free ? C.navy : C.red, ls: free ? 3 : 0, maxW: 210 });
    ctx.restore();
  }
  function receiptPrinter(ctx, x, by, len, mark) {                       // billing counter printer with its receipt
    const slot = by - 112, top = slot - len;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.18)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.beginPath(); ctx.moveTo(x - 136, slot); ctx.lineTo(x - 136, top + 12);
    for (let i = 0; i <= 16; i++) ctx.lineTo(x - 136 + i * 17, top + (i % 2 ? 0 : 12));
    ctx.lineTo(x + 136, slot); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.restore();
    const rows = [[top + 46, 150], [top + 86, 110], [top + 126, 170]];
    for (const [y, w] of rows) if (y < slot - 10) { rr(ctx, x - 96, y - 9, w, 14, 7); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    const ly = top + 172;
    if (ly < slot - 6) {
      if (mark > 0) { rr(ctx, x - 126, ly - 32, 252 * mark, 44, 9); ctx.fillStyle = C.redTint; ctx.fill(); }
      txt(ctx, 'CARRY BAG ₹18', 0 + x, ly, { f: '900 31px Inter', a: 'center', c: mark > 0.5 ? C.red : C.navy, maxW: 240 });
    }
    if (top + 218 < slot - 6) { rr(ctx, x - 96, top + 208, 120, 16, 8); ctx.fillStyle = C.navySoft; ctx.fill(); }
    rr(ctx, x - 156, slot - 6, 312, 118, 22); ctx.fillStyle = '#2B3A55'; ctx.fill();
    rr(ctx, x - 142, slot - 6, 284, 16, 8); ctx.fillStyle = '#16223A'; ctx.fill();
    ctx.beginPath(); ctx.arc(x + 116, slot + 62, 9, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
  }
  function counter(ctx, a = 1) {                                         // the billing counter top + front
    ctx.save(); ctx.globalAlpha *= a;
    const fg = ctx.createLinearGradient(0, 1432, 0, 1800); fg.addColorStop(0, '#1B2C52'); fg.addColorStop(0.45, 'rgba(27,44,82,0.55)'); fg.addColorStop(1, 'rgba(27,44,82,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, 1432, W, 470);
    const tg = ctx.createLinearGradient(0, 1392, 0, 1436); tg.addColorStop(0, '#EBD3A8'); tg.addColorStop(1, '#C9A673');
    ctx.fillStyle = tg; ctx.fillRect(0, 1392, W, 44);
    ctx.restore();
  }
  function toteBag(ctx, cx, by, s, rot = 0) {                            // your own reusable cloth bag
    ctx.save(); ctx.translate(cx, by); ctx.rotate(rot); ctx.scale(s, s);
    ctx.lineCap = 'round';
    for (const [x0, x1] of [[-120, -40], [40, 120]]) {
      ctx.beginPath(); ctx.moveTo(x0, -440); ctx.bezierCurveTo(x0 - 10, -700, x1 + 10, -700, x1, -440);
      ctx.strokeStyle = C.navy; ctx.lineWidth = 22; ctx.stroke();
    }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.26)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    ctx.beginPath(); ctx.moveTo(-200, -450); ctx.lineTo(200, -450); ctx.lineTo(220, -12); ctx.quadraticCurveTo(220, 0, 206, 0);
    ctx.lineTo(-206, 0); ctx.quadraticCurveTo(-220, 0, -220, -12); ctx.closePath();
    const g = ctx.createLinearGradient(-220, 0, 220, 0); g.addColorStop(0, '#E2D3B4'); g.addColorStop(0.45, '#F3E8D2'); g.addColorStop(1, '#DCCBA9');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    rr(ctx, -210, -330, 425, 86, 0); ctx.fillStyle = C.cyan; ctx.fill();                             // woven band
    ctx.fillStyle = 'rgba(2,25,59,0.08)'; ctx.beginPath(); ctx.moveTo(-200, -450); ctx.lineTo(200, -450); ctx.lineTo(196, -420); ctx.lineTo(-196, -420); ctx.fill();
    ctx.restore();
  }
  function shopFront(ctx, cx, by, s, o = {}) {                           // a shop entrance with its notice board
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.22)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    rr(ctx, -420, -820, 840, 820, 16); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    rr(ctx, -400, -800, 800, 140, 14); ctx.fillStyle = C.navy; ctx.fill();
    txt(ctx, 'SHOP', 0, -704, { f: '900 92px Inter', a: 'center', c: '#FFF4DF', ls: 18 });
    for (let i = 0; i < 10; i++) {                                                                 // striped awning
      ctx.beginPath(); const x0 = -400 + i * 80;
      ctx.moveTo(x0, -660); ctx.lineTo(x0 + 80, -660); ctx.lineTo(x0 + 80, -592); ctx.arc(x0 + 40, -592, 40, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#FFF4DF' : C.cyan; ctx.fill();
    }
    const dg = ctx.createRadialGradient(-40, -260, 30, -40, -260, 360); dg.addColorStop(0, 'rgba(246,217,160,0.95)'); dg.addColorStop(1, 'rgba(246,217,160,0.25)');
    rr(ctx, -250, -500, 420, 500, 10); ctx.fillStyle = dg; ctx.fill();                               // lit glass doors
    ctx.strokeStyle = C.navy; ctx.lineWidth = 10; rr(ctx, -250, -500, 420, 500, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-40, -500); ctx.lineTo(-40, 0); ctx.stroke();
    for (const x of [-64, -16]) { rr(ctx, x - 6, -300, 12, 90, 6); ctx.fillStyle = C.gold; ctx.fill(); }
    rr(ctx, 210, -500, 170, 300, 10); ctx.fillStyle = 'rgba(246,217,160,0.6)'; ctx.fill();         // shop window
    ctx.restore();
    if (o.board > 0) {                                                                             // the notice at the entrance
      const k = clamp(o.board);
      ctx.save(); ctx.translate(cx + 250 * s, by - 18 * s - (1 - eo(k)) * 260); ctx.rotate(o.swing || 0); ctx.globalAlpha *= clamp(k * 3);
      ctx.strokeStyle = '#7A4E2A'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-130, 0); ctx.lineTo(-90, -420); ctx.moveTo(130, 0); ctx.lineTo(90, -420); ctx.stroke();
      card(ctx, -170, -460, 340, 360, 18, '#22324F', { blur: 30, oy: 14, stroke: '#9A6838', lw: 10 });
      txt(ctx, 'CARRY BAGS', 0, -390, { f: '800 38px Inter', a: 'center', c: '#FFF4DF', ls: 3 });
      txt(ctx, '₹ EXTRA', 0, -300, { f: '900 76px Inter', a: 'center', c: C.warm });
      txt(ctx, 'OPTIONAL', 0, -200, { f: '900 54px Inter', a: 'center', c: '#7FD6EE', ls: 3 });
      ctx.restore();
      if (o.ok > 0) badge(ctx, cx + 250 * s + 150, by - 18 * s - 470, o.ok, true, 44);
    }
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

  // V1 — frame zero: their logo bag, priced ₹18, at the billing counter (hook + escalation)
  function billing(ctx, t, thumb = false) {
    spotlight(ctx, 440, 1080, 900, 1);
    counter(ctx);
    const len = thumb ? 230 : lerp(230, 270, eio(P(t, E.print, E.print + 0.7)));
    receiptPrinter(ctx, 862, 1420, len, thumb ? 0 : eo(P(t, E.line, E.line + 0.35)));
    tableShadow(ctx, 462, 1404, 350, 1);
    const swing = thumb ? 0 : wobble(t - E.tag, 0.16, 1.2, 1.8) + Math.sin(t * 1.7) * 0.015;
    shopBag(ctx, 425, 1400, 1.08, { logo: 1, tag: true, swing });
  }
  function v1(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    billing(ctx, t);
    ctx.restore();
    chip(ctx, 570, win(t, E.v2c + 0.2, E.v3).a);
  }
  // V3 — the national commission
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1040, k, 'NATIONAL', 'CONSUMER COMMISSION', '2024 · Bata India case', eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
    });
  }
  // V4 + V5 — one bag on stage: a plain bag is your choice; print their logo on it and the tag flips to FREE
  function bagStage(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v6), () => {
      spotlight(ctx, CX, 1080, 780, 0.75);
      const drop = spring(t - E.sell, 1.3, 0.62), by = 1290 - (1 - clamp(drop, 0, 1.2)) * 520;
      ctx.save(); ctx.globalAlpha *= clamp((t - E.sell) * 5);
      tableShadow(ctx, 430, 1294, 330, clamp(drop));
      const ink = clamp((t - E.logo + 0.1) * 7), slam = t < E.logo ? 1.9 : lerp(1.9, 1, eob(P(t, E.logo, E.logo + 0.32), 1.2));
      const swing = wobble(t - E.sell - 0.35, 0.14, 1.2, 1.8) + wobble(t - E.free, 0.1, 1.5, 2.5) + wobble(t - E.logo, 0.05, 1.6, 3);
      shopBag(ctx, 400, by, 0.95, { logo: ink, logoK: slam, tag: true, swing, tagFlip: eio(P(t, E.free, E.free + 0.4)), tagScale: 1.12 });
      ctx.restore();
      const ca = 1 - eio(P(t, E.v5 - 0.1, E.v5 + 0.25));                      // the choice: buy or not
      if (ca > 0 && t >= E.choice) {
        ctx.save(); ctx.globalAlpha *= ca;
        badge(ctx, 330, 1420, spring(t - E.choice, 2, 0.5), true, 54);
        badge(ctx, 530, 1420, spring(t - E.choice - 0.15, 2, 0.5), false, 54);
        label(ctx, 'YOUR CHOICE', CX - 70, 1556, eo(P(t, E.choice + 0.2, E.choice + 0.55)), { f: '900 70px Inter' });
        ctx.restore();
      }
      label(ctx, 'LOGO BAG = FREE', CX - 30, 1470, eo(P(t, E.free + 0.25, E.free + 0.6)), { f: '900 72px Inter' });
    });
  }
  // V6 — you may bring your own empty bag
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v6b), () => {
      spotlight(ctx, CX, 1080, 760, 0.7);
      const k = spring(t - E.own, 1.2, 0.5);
      tableShadow(ctx, CX - 20, 1330, 300, clamp(k));
      toteBag(ctx, CX - 20 - (1 - k) * 520, 1320, 1.0, wobble(t - E.own - 0.3, 0.08, 0.9, 1.6) - (1 - clamp(k)) * 0.3);
      badge(ctx, CX + 200, 760, spring(t - E.ok6, 2, 0.5), true, 56);
      label(ctx, 'BRING YOUR OWN', CX - 20, 1500, eo(P(t, E.own + 0.5, E.own + 0.85)), { f: '900 76px Inter' });
    });
  }
  // V6b — notices at the entrance, before you shop
  function v6b(ctx, t) {
    withScene(ctx, win(t, E.v6b, E.v7), () => {
      spotlight(ctx, CX, 1060, 800, 0.7);
      shopFront(ctx, CX - 60, 1420, 0.8, { board: P(t, E.notice, E.notice + 0.45), swing: wobble(t - E.notice - 0.45, 0.06, 1.3, 2.2), ok: spring(t - E.before - 0.2, 2, 0.5) });
      label(ctx, 'BEFORE YOU SHOP', CX, 1560, eo(P(t, E.before, E.before + 0.35)), { f: '900 76px Inter' });
    });
  }
  // V7 — payoff: three steps
  function iconLogoBag(ctx) { ctx.save(); ctx.scale(0.19, 0.19); shopBag(ctx, -30, 330, 1, { logo: 1 }); ctx.restore(); }
  function iconPlainBag(ctx) { ctx.save(); ctx.scale(0.19, 0.19); shopBag(ctx, -30, 330, 1, {}); ctx.restore(); }
  function iconTote(ctx) { ctx.save(); ctx.scale(0.2, 0.2); toteBag(ctx, 0, 300, 1); ctx.restore(); }
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const items = [[E.s1, iconLogoBag, 'LOGO BAG: FREE'], [E.s2, iconPlainBag, 'PLAIN BAG: SAY NO'], [E.s3, iconTote, 'BRING YOUR OWN']];
      items.forEach(([te, icon, lab], i) => {
        if (t < te) return;
        const k = spring(t - te, 1.7, 0.6), y = 840 + i * 240;
        ctx.save(); ctx.translate(210 + (1 - clamp(k)) * 120, y); ctx.globalAlpha *= clamp(k * 1.5);
        card(ctx, -80, -80, 160, 160, 38, C.card, { blur: 26, oy: 10 });
        icon(ctx);
        txt(ctx, lab, 120, 20, { f: '900 56px Inter', maxW: 560 });
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
    v1(ctx, t); v3(ctx, t); bagStage(ctx, t); v6(ctx, t); v6b(ctx, t); v7(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition, plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    billing(ctx, 0, true);
    drawCaptions(ctx, 0);
    chip(ctx, 600, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
