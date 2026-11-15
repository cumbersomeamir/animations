/* Courtlens · "Is this legal in India?" · Episode 18 (English, english-18, batch 18): can a cinema stop you bringing
 * your own food? Basis: Supreme Court, K.C. Cinema (correct name K.C. Theatre) v. State of J&K, CA 77 of 2023,
 * 3 Jan 2023 — paras 23 & 32 (private property; owners may set entry conditions incl. no outside food), para 33
 * (cinemas' recorded statements: free hygienic drinking water; reasonable food for an infant or young child), para 34
 * (the Court "requests" owners to consider dietary/medical cases case by case). Frame zero = thumbnail.
 * Built on the english-17 engine under context/09-feedback-rules-2026-11-11.md.
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
  function stampCard(ctx, cx, cy, k, title, sub, subA) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -360, -150, 720, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -330, -120, 660, 240, 20); ctx.stroke();
    txt(ctx, title, 0, 14, { f: '900 66px Inter', a: 'center', c: C.navy, ls: 1, maxW: 620 });
    if (subA > 0) txt(ctx, sub, 0, 84, { f: '700 36px Inter', a: 'center', c: C.cyanDark, alpha: subA, maxW: 600 });
    ctx.restore();
  }
  function snackBag(ctx, cx, cy, s, rot = 0, o = {}) { // a crinkly foil snack bag (generic, no brand)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    ctx.beginPath(); ctx.moveTo(-150, -230); for (let i = 0; i <= 10; i++) ctx.lineTo(-150 + i * 30, -230 + (i % 2 ? -10 : 0));
    ctx.bezierCurveTo(170, -100, 170, 100, 150, 230); for (let i = 10; i >= 0; i--) ctx.lineTo(-150 + i * 30, 230 + (i % 2 ? 10 : 0));
    ctx.bezierCurveTo(-170, 100, -170, -100, -150, -230); ctx.closePath();
    const g = ctx.createLinearGradient(-160, 0, 160, 0); g.addColorStop(0, '#C8382A'); g.addColorStop(0.45, '#E8604A'); g.addColorStop(0.55, '#F08A6E'); g.addColorStop(1, '#B22F22');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    const sh = ctx.createLinearGradient(-160, -230, 160, 230); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.42, 'rgba(255,255,255,0.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh; ctx.fillRect(-160, -240, 320, 480);                                 // foil sheen
    ctx.beginPath(); ctx.ellipse(0, 10, 120, 82, 0, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    txt(ctx, 'SNACKS', 0, 32, { f: '900 54px Inter', a: 'center', c: C.navy, ls: 3 });
    for (const [x, y] of [[-60, -130], [40, -150], [80, 150], [-80, 140]]) { ctx.beginPath(); ctx.ellipse(x, y, 26, 16, 0.6, 0, Math.PI * 2); ctx.fillStyle = '#F2C76B'; ctx.fill(); }
    if (o.blocked > 0) badge(ctx, -110, -190, o.blocked, false, 50);
    ctx.restore();
  }
  function cinemaFront(ctx, cx, by, s, t, o = {}) {   // a cinema entrance with marquee bulbs, doors, rope and sign
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    // facade with lit marquee
    const fg = ctx.createLinearGradient(0, -900, 0, 0); fg.addColorStop(0, '#1B2C52'); fg.addColorStop(1, '#0D1C3B');
    rr(ctx, -420, -900, 840, 900, 18); ctx.fillStyle = fg; ctx.fill();
    rr(ctx, -380, -860, 760, 170, 16); ctx.fillStyle = '#2B1A12'; ctx.fill();
    txt(ctx, 'CINEMA', 0, -745, { f: '900 96px Inter', a: 'center', c: '#FFE3A0', ls: 14 });
    for (let i = 0; i < 18; i++) {                    // marquee bulbs chase
      const on = ((Math.floor(t * 8) + i) % 3) !== 0;
      for (const y of [-866, -684]) { ctx.beginPath(); ctx.arc(-366 + i * 43, y, 9, 0, Math.PI * 2); ctx.fillStyle = on ? '#FFE3A0' : 'rgba(255,227,160,0.35)'; ctx.fill(); }
    }
    // warm interior glow through the doors
    const dg = ctx.createRadialGradient(0, -280, 30, 0, -280, 380); dg.addColorStop(0, 'rgba(246,217,160,0.85)'); dg.addColorStop(1, 'rgba(246,217,160,0.1)');
    rr(ctx, -260, -620, 520, 620, 10); ctx.fillStyle = dg; ctx.fill();
    ctx.fillStyle = 'rgba(2,25,59,0.55)'; rr(ctx, -260, -620, 250, 620, 8); ctx.fill(); rr(ctx, 10, -620, 250, 620, 8); ctx.fill();
    rr(ctx, -40, -330, 16, 90, 8); ctx.fillStyle = C.gold; ctx.fill(); rr(ctx, 24, -330, 16, 90, 8); ctx.fill();
    // sign on the door
    if (o.sign > 0) {
      ctx.save(); ctx.translate(o.signX || 0, -470 - 60 * (1 - clamp(o.sign))); ctx.rotate(o.swing || 0); ctx.globalAlpha *= clamp(o.sign * 2);
      card(ctx, -230, -70, 460, 140, 14, C.card, { blur: 20, oy: 8, stroke: C.red, lw: 8 });
      txt(ctx, 'NO OUTSIDE FOOD', 0, 20, { f: '900 46px Inter', a: 'center', c: C.red, maxW: 420 });
      ctx.restore();
    }
    // velvet rope between brass posts
    for (const x of [-330, 330]) { rr(ctx, x - 12, -220, 24, 220, 10); ctx.fillStyle = C.gold; ctx.fill(); ctx.beginPath(); ctx.arc(x, -230, 22, 0, Math.PI * 2); ctx.fill(); }
    const sag = 70 + (o.ropeK || 0) * 10;
    ctx.beginPath(); ctx.moveTo(-318, -200); ctx.quadraticCurveTo(0, -200 + sag * 2, 318, -200); ctx.strokeStyle = '#9E1F2C'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.stroke();
    ctx.restore();
  }
  function waterGlass(ctx, x, y, s, fill) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-90, -150); ctx.lineTo(90, -150); ctx.lineTo(70, 150); ctx.lineTo(-70, 150); ctx.closePath();
    ctx.fillStyle = 'rgba(216,239,246,0.55)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 7; ctx.stroke();
    if (fill > 0) {
      const top = 150 - 280 * clamp(fill), wx = 90 - 20 * (top + 150) / 300;
      ctx.beginPath(); ctx.moveTo(-wx + 4, top); ctx.lineTo(wx - 4, top); ctx.lineTo(66, 146); ctx.lineTo(-66, 146); ctx.closePath(); ctx.fillStyle = C.cyan; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, top, wx - 4, 10, 0, 0, Math.PI * 2); ctx.fillStyle = '#7FD6EE'; ctx.fill();
    }
    ctx.restore();
  }
  function babyBottle(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-14, -170); ctx.quadraticCurveTo(0, -200, 14, -170); ctx.lineTo(24, -130); ctx.lineTo(-24, -130); ctx.closePath(); ctx.fillStyle = '#F2C76B'; ctx.fill();
    rr(ctx, -50, -134, 100, 34, 10); ctx.fillStyle = C.cyan; ctx.fill();
    rr(ctx, -56, -100, 112, 240, 30); ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.stroke();
    rr(ctx, -50, 10, 100, 124, 24); ctx.fillStyle = '#FFF4DF'; ctx.fill();
    for (let i = 0; i < 4; i++) { rr(ctx, -40, -70 + i * 40, 26, 6, 3); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    ctx.restore();
  }
  function lunchbox(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -120, -80, 240, 160, 26, C.cyanTint, { blur: 20, oy: 10, stroke: C.navy, lw: 6 });
    rr(ctx, -120, -80, 240, 52, 26); ctx.fillStyle = C.cyan; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.stroke();
    rr(ctx, -30, -110, 60, 30, 12); ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();
  }
  function doctorNote(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -170, -220, 340, 440, 16, '#FFFFFF', { blur: 30, oy: 14, stroke: C.navy, lw: 5 });
    rr(ctx, -150, -200, 300, 90, 10); ctx.fillStyle = C.cyanTint; ctx.fill();
    ctx.fillStyle = C.red; rr(ctx, -126, -170, 60, 20, 6); ctx.fill(); rr(ctx, -106, -190, 20, 60, 6); ctx.fill();
    txt(ctx, 'DIET', 50, -138, { f: '900 46px Inter', a: 'center', c: C.navy, ls: 4 });
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 6; i++) { rr(ctx, -130, -70 + i * 44, i === 5 ? 120 : 260, 14, 7); ctx.fill(); }
    ctx.strokeStyle = C.navySoft; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(10, 190); ctx.bezierCurveTo(50, 150, 80, 210, 130, 170); ctx.stroke();
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

  // V1 — frame zero: a giant snack bag stopped at the cinema door (hook + escalation)
  function entrance(ctx, t, thumb = false) {
    spotlight(ctx, CX, 1250, 860, 1);
    const fl = ctx.createLinearGradient(0, 1600, 0, 1880); fl.addColorStop(0, '#7A1E28'); fl.addColorStop(1, 'rgba(122,30,40,0)');
    rr(ctx, 60, 1600, 960, 280, 0); ctx.fillStyle = fl; ctx.fill();                              // red carpet into the light
    const swing = thumb ? 0 : wobble(t - E.sign, 0.06, 1.3, 2.2);
    cinemaFront(ctx, CX + 40, 1610, 0.92, thumb ? 0.3 : t, { sign: 1, signX: 120, swing, ropeK: thumb ? 0 : Math.max(0, wobble(t - E.rope, 1, 2, 3)) });
    const bob = thumb ? 0 : Math.sin(t * 2.4) * 8;
    snackBag(ctx, 250, 1430 + bob, 1.05, -0.12, { blocked: thumb ? 1 : 1 });
  }
  function v1(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    entrance(ctx, t);
    ctx.restore();
    chip(ctx, 570, win(t, E.v2c + 0.2, E.v3).a);
  }
  // V3 — the court
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v3b), () => {
      spotlight(ctx, CX, 1020, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1040, k, 'SUPREME COURT', '2023 · K.C. Cinema v. J&K', eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
    });
  }
  // V3b — their entry rules: the door with its sign gets a tick
  function v3b(ctx, t) {
    withScene(ctx, win(t, E.v3b, E.v4), () => {
      ctx.save(); ctx.translate(CX, 1060); ctx.scale(0.78, 0.78); ctx.translate(-CX, -1060);
      cinemaFront(ctx, CX, 1560, 0.95, t, { sign: 1 });
      ctx.restore();
      badge(ctx, CX + 250, 820, spring(t - E.rules, 2, 0.5), true, 48);
      label(ctx, 'THEIR ENTRY RULES', CX, 1590, eo(P(t, E.rules, E.rules + 0.35)), { f: '900 66px Inter' });
    });
  }
  // V4 — drinking water: free
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1060, 760, 0.7);
      waterGlass(ctx, CX, 1080, 1.4, eio(P(t, E.pour, E.pour + 1.0)));
      if (t >= E.free) {
        const k = eob(P(t, E.free, E.free + 0.35), 1.3);
        ctx.save(); ctx.translate(CX + 220, 860); ctx.rotate(-0.12); ctx.scale(clamp(k) * 1.0, clamp(k) * 1.0);
        card(ctx, -120, -56, 240, 112, 56, C.cyan, { blur: 20, oy: 8 });
        txt(ctx, 'FREE', 0, 22, { f: '900 66px Inter', a: 'center', c: C.navy, ls: 4 }); ctx.restore();
      }
      label(ctx, 'DRINKING WATER', CX, 1440, eo(P(t, E.v4 + 0.4, E.v4 + 0.8)), { f: '900 70px Inter' });
    });
  }
  // V5 — a child's food: reasonable amounts
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1060, 760, 0.7);
      const kk = eo(P(t, E.kid, E.kid + 0.5));
      ctx.save(); ctx.globalAlpha *= kk; ctx.translate(-80 * (1 - kk), 0);
      babyBottle(ctx, 330, 1030, 1.15); lunchbox(ctx, 650, 1100, 1.15);
      ctx.restore();
      badge(ctx, CX, 820, spring(t - E.ok, 2, 0.5), true, 50);
      label(ctx, "CHILD'S FOOD", CX, 1380, eo(P(t, E.kid + 0.2, E.kid + 0.55)), { f: '900 72px Inter' });
      label(ctx, 'REASONABLE AMOUNT', CX, 1470, eo(P(t, E.amount, E.amount + 0.35)), { f: '900 52px Inter', c: C.cyanDark });
    });
  }
  // V6 — medical diets: the court's request, case by case
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1060, 760, 0.7);
      const nk = eo(P(t, E.note, E.note + 0.5));
      ctx.save(); ctx.globalAlpha *= nk; doctorNote(ctx, 360, 1060 + 60 * (1 - nk), 1.0, -0.06); ctx.restore();
      if (t >= E.ask) {
        const k = spring(t - E.ask, 1.6, 0.55);
        ctx.save(); ctx.translate(720, 960); ctx.scale(clamp(k), clamp(k));
        card(ctx, -140, -90, 280, 180, 40, C.card, { blur: 24, oy: 10, stroke: C.cyanDark, lw: 6 });
        txt(ctx, 'ASK', 0, 26, { f: '900 72px Inter', a: 'center', c: C.cyanDark, ls: 6 });
        ctx.beginPath(); ctx.moveTo(-90, 86); ctx.lineTo(-120, 130); ctx.lineTo(-40, 88); ctx.closePath(); ctx.fillStyle = C.card; ctx.fill();
        ctx.restore();
      }
      label(ctx, 'CASE BY CASE', CX, 1440, eo(P(t, E.cbc, E.cbc + 0.35)), { f: '900 80px Inter', ls: 3 });
    });
  }
  // V7 — payoff: three steps
  function iconGlass(ctx) { ctx.save(); ctx.scale(0.36, 0.36); waterGlass(ctx, 0, 0, 1, 0.7); ctx.restore(); }
  function iconBox(ctx) { ctx.save(); ctx.scale(0.42, 0.42); lunchbox(ctx, 0, 10, 1); ctx.restore(); }
  function iconNote(ctx) { ctx.save(); ctx.scale(0.27, 0.27); doctorNote(ctx, 0, 0, 1); ctx.restore(); }
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const items = [[E.s1, iconGlass, 'ASK: FREE WATER'], [E.s2, iconBox, "CHILD'S FOOD"], [E.s3, iconNote, "DOCTOR'S NOTE"]];
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
    v1(ctx, t); v3(ctx, t); v3b(ctx, t); v4(ctx, t); v5(ctx, t); v6(ctx, t); v7(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition, plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    entrance(ctx, 0, true);
    drawCaptions(ctx, 0);
    chip(ctx, 600, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
