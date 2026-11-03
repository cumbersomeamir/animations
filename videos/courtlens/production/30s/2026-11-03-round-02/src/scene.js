/* Courtlens · "Is this legal in India?" · Episode 02: Above-MRP price for a packaged water bottle
 * Engine, palette, captions and motion are the accepted feedback-01 renderer
 * (../../2026-11-02-feedback-round/src/scene.js); only episode performers and copy differ.
 * Style recipe: "Tiny Clause, Big Consequence" — ivory paper, navy type, small tactile tokens,
 * few explanatory objects, subtle shadows, one clause that changes the visible outcome.
 * Every element is a pure function of time t (seconds) so frames are deterministic.
 */
(function () {
  const W = 1080, H = 1920;
  // Palette: neutral paper + dark navy type carry the scene; brand accent sampled from assets/icon.png
  const C = {
    paper: '#F4EEE2', paperDeep: '#E9E0CF', card: '#FFFDF8',
    navy: '#02193B',                       // icon background navy (sampled #02193B)
    navySoft: 'rgba(2,25,59,0.62)', navyFaint: 'rgba(2,25,59,0.16)',
    cyan: '#12AAD3',                       // icon glow accent (sampled #12AAD3)
    cyanDark: '#0A7EA4', cyanMark: '#B4E3F1', cyanTint: '#D8EFF6',
    gold: '#D7A351',                       // icon gold (sampled #D7A351), used sparingly
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
    ctx.shadowColor = o.shadow || 'rgba(2,25,59,0.13)';
    ctx.shadowBlur = o.blur ?? 34; ctx.shadowOffsetY = o.oy ?? 12;
    rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
    ctx.restore();
    if (o.stroke) { rr(ctx, x, y, w, h, r); ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 3; ctx.stroke(); }
  }
  function setFont(ctx, f, ls = 0) { ctx.font = f; ctx.letterSpacing = ls + 'px'; }
  function fitFont(ctx, f, s, maxW, ls = 0) {
    let size = parseFloat(f.match(/(\d+(?:\.\d+)?)px/)[1]);
    setFont(ctx, f, ls);
    while (maxW && ctx.measureText(s).width > maxW && size > 12) { size -= 1; setFont(ctx, f.replace(/\d+(?:\.\d+)?px/, size + 'px'), ls); }
  }
  function txt(ctx, s, x, y, o = {}) {
    ctx.save();
    fitFont(ctx, o.f || '700 40px Inter', s, o.maxW || 0, o.ls || 0);
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

  // ---------- background ----------
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); const id = g.createImageData(W, H);
    let s = 20261102 >>> 0;
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
    const g = ctx.createRadialGradient(540, 980, 260, 540, 980, 1250);
    g.addColorStop(0, 'rgba(255,252,245,0.55)'); g.addColorStop(1, 'rgba(206,190,163,0.32)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(GRAIN, 0, 0);
  }

  // ---------- bottle (packaged drinking water) ----------
  const DROPS = [[-46, -12, 7], [38, -26, 6], [-30, 50, 8], [52, 38, 5], [-58, 94, 6], [22, 102, 7], [48, -80, 5], [-42, -72, 5], [6, 28, 5], [-10, -40, 4]];
  function bottlePath(ctx) {
    ctx.beginPath();
    ctx.moveTo(-28, -150); ctx.lineTo(-28, -128);
    ctx.bezierCurveTo(-28, -100, -74, -92, -74, -54);
    ctx.lineTo(-74, 118); ctx.quadraticCurveTo(-74, 140, -52, 140);
    ctx.lineTo(52, 140); ctx.quadraticCurveTo(74, 140, 74, 118);
    ctx.lineTo(74, -54); ctx.bezierCurveTo(74, -92, 28, -100, 28, -128); ctx.lineTo(28, -150); ctx.closePath();
  }
  function bottleBody(ctx, chill = 0) {
    bottlePath(ctx);
    ctx.fillStyle = '#E2F2F8'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-90, -170, 180, 72);          // air above the water line
    ctx.strokeStyle = 'rgba(2,25,59,0.18)'; ctx.lineWidth = 3;
    for (const y of [92, 110]) { ctx.beginPath(); ctx.moveTo(-74, y); ctx.lineTo(74, y); ctx.stroke(); }
    ctx.fillStyle = C.cyan; ctx.fillRect(-90, -36, 180, 104);                              // label band (brand accent)
    ctx.fillStyle = C.gold; ctx.fillRect(-90, 62, 180, 6);
    const g = ctx.createLinearGradient(-74, 0, 74, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.2, 'rgba(255,255,255,0.4)'); g.addColorStop(0.3, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(2,25,59,0.12)');
    ctx.fillStyle = g; ctx.fillRect(-90, -170, 180, 320);
    ctx.restore();
    bottlePath(ctx); ctx.lineWidth = 7; ctx.strokeStyle = C.navy; ctx.lineJoin = 'round'; ctx.stroke();
    txt(ctx, 'WATER', 0, -4, { f: '900 28px Inter', c: '#FFFFFF', a: 'center', ls: 3 });
    rr(ctx, -58, 10, 116, 42, 8); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
    txt(ctx, 'MRP ₹20', 0, 40, { f: '800 25px Inter', a: 'center' });                        // printed price on the object
    rr(ctx, -34, -182, 68, 36, 8); ctx.fillStyle = C.navy; ctx.fill();                        // cap
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    for (const x of [-20, -8, 4, 16]) { ctx.beginPath(); ctx.moveTo(x + 2, -176); ctx.lineTo(x + 2, -152); ctx.stroke(); }
    if (chill > 0) {                                                                          // condensation when chilled
      DROPS.forEach(([x, y, r], i) => {
        const a = clamp(chill * 1.6 - i * 0.07); if (a <= 0) return;
        ctx.save(); ctx.globalAlpha *= a; ctx.beginPath(); ctx.ellipse(x, y, r * 0.8, r, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.fill(); ctx.strokeStyle = 'rgba(2,25,59,0.35)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      });
    }
  }
  function snowflake(ctx, x, y, r, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(0.3 * (1 - k));
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 3);
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r);
      for (const d of [-1, 1]) { ctx.moveTo(0, d * r * 0.55); ctx.lineTo(-r * 0.3, d * r * 0.8); ctx.moveTo(0, d * r * 0.55); ctx.lineTo(r * 0.3, d * r * 0.8); }
      ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  function glassAndTray(ctx) {
    ctx.beginPath(); ctx.ellipse(55, 146, 205, 20, 0, 0, Math.PI * 2); ctx.fillStyle = C.paperDeep; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(112, 34); ctx.lineTo(196, 34); ctx.lineTo(188, 140); ctx.lineTo(120, 140); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = '#CFEAF3'; ctx.fillRect(100, 72, 110, 80); ctx.restore();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
  }
  function drawBottle(ctx, x, y, s, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    if (!o.noShadow) {
      const lift = o.lift || 0, k = 1 - clamp(lift / 700) * 0.6;
      ctx.save(); ctx.translate(0, 152); ctx.scale(1, 0.13);
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 150 * k);
      g.addColorStop(0, `rgba(2,25,59,${0.20 * k})`); g.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 150 * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (o.served) glassAndTray(ctx);
    ctx.translate(0, -(o.lift || 0));
    if (o.squash) { ctx.translate(0, 140); ctx.scale(1 / o.squash, o.squash); ctx.translate(0, -140); }
    bottleBody(ctx, o.chill || 0);
    if (o.chill > 0) {
      const k = spring(o.chillT ?? 9, 1.8, 0.5);
      snowflake(ctx, 112, -150, 26, k);
      ctx.save(); ctx.globalAlpha *= clamp(o.chill * 2); ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (const [dx, dy] of [[100, -70], [112, -40], [100, -10]]) { ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 26, dy - 8); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------- series chip ----------
  function seriesChip(ctx, t) {
    const a = 1 - P(t, E.toS4, E.toS4 + 0.35);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    setFont(ctx, '800 28px Inter', 3);
    const label = 'IS THIS LEGAL IN INDIA?';
    const tw = ctx.measureText(label).width, w = tw + 92, x = 540 - w / 2, y = 560;
    rr(ctx, x, y, w, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.7)'; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(label, x + 54, y + 39);
    ctx.restore();
  }

  // ---------- price label card (same frame/motion as the accepted order card) ----------
  function orderCardBody(ctx, t) {
    const w = 800, h = 320;
    card(ctx, 0, 0, w, h, 30, C.card);
    txt(ctx, 'PACKAGED DRINKING WATER', 44, 62, { f: '700 27px Inter', c: C.navySoft, ls: 3, maxW: 470 });
    setFont(ctx, '800 27px Inter', 1);
    const pill = 'Sealed', pw = ctx.measureText(pill).width + 78, px = w - 44 - pw;
    rr(ctx, px, 30, pw, 46, 23); ctx.fillStyle = C.cyanTint; ctx.fill();
    check(ctx, px + 30, 53, 0.95, C.cyanDark, 5);
    txt(ctx, pill, px + 52, 63, { f: '800 27px Inter', c: C.cyanDark, ls: 1 });
    rr(ctx, 44, 98, 96, 96, 20); ctx.fillStyle = C.paperDeep; ctx.fill();
    drawBottle(ctx, 92, 152, 0.24, { noShadow: true });
    txt(ctx, 'Water bottle', 168, 144, { f: '800 46px Inter' });
    txt(ctx, 'Net quantity 1 L', 168, 184, { f: '600 27px Inter', c: C.navySoft });
    txt(ctx, '₹20', w - 44, 146, { f: '800 50px Inter', a: 'right' });
    // the printed price line: the tiny clause this episode turns on
    const hp = eio(P(t, E.mrpMark, E.mrpMark + 0.4)), pop = 1 + wobble(t - E.mrpMark - 0.35, 0.03, 2.2, 6);
    ctx.save(); ctx.translate(w / 2, 258); ctx.scale(pop, pop); ctx.translate(-w / 2, -258);
    rr(ctx, 44, 222, w - 88, 72, 14); ctx.fillStyle = C.paper; ctx.fill();
    ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(2,25,59,0.3)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
    if (hp > 0) { ctx.save(); rr(ctx, 44, 222, w - 88, 72, 14); ctx.clip(); ctx.fillStyle = C.cyanMark; ctx.fillRect(44, 222, (w - 88) * hp, 72); ctx.restore(); }
    txt(ctx, 'MRP ₹20.00 (incl. of all taxes)', w / 2, 270, { f: '800 34px Inter', a: 'center', maxW: w - 120 });
    ctx.restore();
  }
  function orderState(t) {
    const enter = spring(t - E.cardIn, 1.25, 0.66);
    let cx = 540, cy = 815 + (1 - enter) * 160, s = 1, alpha = clamp(enter * 1.6);
    // curved path: right first, then down, so the shrinking card never crosses the bottle
    cx = lerp(cx, 750, eio(P(t, E.toS2, E.toS2 + 0.5)));
    cy = lerp(cy, 1250, eio(P(t, E.toS2 + 0.15, E.toS2 + 0.75)));
    s = lerp(s, 0.52, eio(P(t, E.toS2, E.toS2 + 0.65)));
    const b = eio(P(t, E.toS4, E.toS4 + 0.45));
    cy += 90 * b; alpha *= 1 - b;
    return { cx, cy, s, alpha };
  }
  function drawOrder(ctx, t) {
    const st = orderState(t);
    if (st.alpha <= 0.001) return;
    ctx.save(); ctx.globalAlpha = st.alpha;
    ctx.translate(st.cx, st.cy); ctx.scale(st.s, st.s); ctx.translate(-400, -160);
    orderCardBody(ctx, t);
    ctx.restore();
  }

  // ---------- outcome tag (the token the clause flips) ----------
  function drawTag(ctx, t) {
    const appear = E.refuseLine + 0.2;
    if (t < appear) return;
    const st = orderState(t);
    if (st.alpha <= 0.001) return;
    const ax = st.cx, ay = st.cy + 160 * st.s;
    const pop = spring(t - appear, 1.8, 0.5);
    const fp = P(t, E.tagFlip, E.tagFlip + 0.38);
    const sx = Math.abs(Math.cos(Math.PI * fp)), front = fp < 0.5;
    const swing = wobble(t - appear, 0.10, 0.9, 2.5) + wobble(t - E.tagFlip, 0.07, 0.9, 2.5);
    ctx.save(); ctx.globalAlpha = st.alpha;
    ctx.translate(ax, ay); ctx.rotate(swing);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
    ctx.translate(0, 66); ctx.scale(Math.max(sx, 0.001) * pop, pop * (1 + (front ? 0 : wobble(t - E.tagFlip - 0.19, 0.06, 2, 5))));
    const w = 390, h = 92;
    if (front) {
      card(ctx, -w / 2, -h / 2, w, h, 46, C.redTint, { stroke: C.red, lw: 3, blur: 18, oy: 6 });
      cross(ctx, -w / 2 + 52, 0, 1.25, C.red, 6);
      txt(ctx, '₹25 asked', -w / 2 + 92, 14, { f: '800 40px Inter', c: C.redDark });
    } else {
      card(ctx, -w / 2, -h / 2, w, h, 46, C.cyan, { blur: 22, oy: 8 });
      ctx.beginPath(); ctx.arc(-w / 2 + 50, 0, 25, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      check(ctx, -w / 2 + 50, 1, 1.15, C.navy, 5);
      txt(ctx, 'Max ₹20 (MRP)', -w / 2 + 90, 13, { f: '800 36px Inter', c: C.navy, maxW: w - 110 });
    }
    ctx.restore();
  }

  // ---------- seller banner ----------
  function bannerState(t) {
    if (t < E.bannerDrop) return null;
    const dp = P(t, E.bannerDrop, E.bannerLand);
    const y = 655 + lerp(-150, 0, eob(dp, 1.6));
    const xo = 1000 * ei(P(t, E.toS4, E.toS4 + 0.6));
    const ang = wobble(t - E.bannerLand, 0.085, 0.85, 1.4) + wobble(t - E.ruleBump, -0.055, 0.85, 1.6) + wobble(t - E.bannerTug, 0.06, 0.9, 1.7) + 0.12 * ei(P(t, E.toS4, E.toS4 + 0.6));
    return { y, ang, xo };
  }
  function drawBanner(ctx, t) {
    const st = bannerState(t); if (!st || st.xo > 900) return;
    ctx.save(); ctx.globalAlpha = clamp(P(t, E.bannerDrop, E.bannerDrop + 0.18)); ctx.translate(540 + st.xo, st.y); ctx.rotate(st.ang);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-250, 40); ctx.lineTo(-210, 0); ctx.lineTo(210, 0); ctx.lineTo(250, 40);
    ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
    card(ctx, -300, 40, 600, 152, 20, C.red, { blur: 26, oy: 12, shadow: 'rgba(2,25,59,0.18)' });
    txt(ctx, 'SHOP PRICE', 0, 80, { f: '700 22px Inter', c: 'rgba(255,248,238,0.82)', a: 'center', ls: 4 });
    txt(ctx, 'CHILLED ₹25', 0, 162, { f: '900 84px Inter', c: '#FFF8EE', a: 'center', ls: 2, maxW: 556 });
    ctx.restore();
  }
  function drawRefuseLine(ctx, t) {
    const st = bannerState(t);
    const p = eio(P(t, E.refuseLine, E.refuseLine + 0.35));
    const fade = 1 - P(t, E.ruleIn + 0.15, E.ruleIn + 0.5);
    if (!st || p <= 0 || fade <= 0) return;
    const bx = 540 - 192 * Math.sin(st.ang) + 150, by = st.y + 192 * Math.cos(st.ang);
    const ex = 750, ey = 1352;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.beginPath();
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = (i / 40) * p, mt = 1 - u;
      const x = mt * mt * mt * bx + 3 * mt * mt * u * (bx + 120) + 3 * mt * u * u * (ex + 160) + u * u * u * ex;
      const y = mt * mt * mt * by + 3 * mt * mt * u * (by + 200) + 3 * mt * u * u * (ey - 260) + u * u * u * ey;
      pts.push([x, y]);
    }
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.setLineDash([16, 14]); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
    ctx.restore();
  }

  // ---------- rule card (morphs into the left result in the split) ----------
  const RULE = { cx: 540, cy: 1010, w: 840, h: 290 };
  const LRES = { cx: 297, cy: 945, w: 390, h: 210 };
  const RRES = { cx: 757, cy: 945, w: 390, h: 210 };
  function ruleBody(ctx, t, a) {
    const w = RULE.w, h = RULE.h;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.save(); rr(ctx, 0, 0, w, h, 26); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(0, 0, 16, h); ctx.restore();
    txt(ctx, 'INDIA · PACKAGED COMMODITIES RULES, 2011', 52, 60, { f: '800 27px Inter', c: C.cyanDark, ls: 3, maxW: w - 100 });
    const r1 = eo(P(t, E.ruleIn + 0.55, E.ruleIn + 0.95)), r2 = eo(P(t, E.ruleIn + 1.25, E.ruleIn + 1.65)), r3 = eo(P(t, E.ruleIn + 2.2, E.ruleIn + 2.6));
    txt(ctx, 'No shop may sell a packaged item', 52 + (1 - r1) * 24, 124, { f: '600 41px Inter', maxW: w - 96, alpha: r1 });
    txt(ctx, 'for more than its printed:', 52 + (1 - r2) * 24, 176, { f: '600 41px Inter', maxW: w - 96, alpha: r2 });
    ctx.save(); ctx.globalAlpha *= r3; ctx.translate(0, (1 - r3) * 14);
    const chips = [['MRP', E.chip1], ['incl. all taxes', E.chip2]];
    let x = 52;
    for (const [label, tc] of chips) {
      setFont(ctx, '800 42px Inter', 0);
      const cw = ctx.measureText(label).width + 44, cy = 206, ch = 64;
      const hp = eio(P(t, tc, tc + 0.32));
      const pop = 1 + wobble(t - tc - 0.25, 0.06, 2.2, 6);
      ctx.save(); ctx.translate(x + cw / 2, cy + ch / 2); ctx.scale(pop, pop); ctx.translate(-(x + cw / 2), -(cy + ch / 2));
      rr(ctx, x, cy, cw, ch, 16); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 3; ctx.stroke();
      if (hp > 0) { ctx.save(); rr(ctx, x, cy, cw, ch, 16); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(x, cy, cw * hp, ch); ctx.restore(); }
      txt(ctx, label, x + 22, cy + 46, { f: '800 42px Inter' });
      ctx.restore();
      x += cw + 18;
    }
    ctx.restore();
    ctx.restore();
  }
  function resultBody(ctx, w, h, kind, a) {
    ctx.save(); ctx.globalAlpha *= a;
    if (kind === 'left') {
      txt(ctx, 'MRP RULE APPLIES', 30, 56, { f: '800 24px Inter', c: 'rgba(2,25,59,0.78)', ls: 3, maxW: w - 56 });
      txt(ctx, 'Pay no more', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, 'than the MRP', 30, 164, { f: '800 36px Inter', maxW: w - 56 });
    } else {
      txt(ctx, 'DIFFERENT CASE', 30, 56, { f: '800 24px Inter', c: C.navySoft, ls: 2, maxW: w - 56 });
      txt(ctx, 'Water served', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, 'with service', 30, 164, { f: '800 36px Inter', maxW: w - 56 });
    }
    ctx.restore();
  }
  function drawRule(ctx, t) {
    if (t < E.ruleIn) return;
    const enter = spring(t - E.ruleIn, 1.15, 0.72);
    const m = eio(P(t, E.toS4 + 0.1, E.toS4 + 0.8));          // morph to left result
    const out = eio(P(t, E.toS5, E.toS5 + 0.42));            // exit left with the bottle
    const cx = lerp(RULE.cx + (1 - enter) * 1000, LRES.cx, m) - 700 * out;
    const cy = lerp(RULE.cy, LRES.cy, m);
    const w = lerp(RULE.w, LRES.w, m), h = lerp(RULE.h, LRES.h, m);
    const rot = (1 - enter) * 0.06;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    card(ctx, -w / 2, -h / 2, w, h, 26, C.card, { blur: 40, oy: 16, shadow: 'rgba(2,25,59,0.16)' });
    if (m > 0) { ctx.save(); ctx.globalAlpha = m; rr(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = C.cyan; ctx.fill(); ctx.restore(); }
    if (m < 0.45) { ctx.save(); ctx.translate(-w / 2, -h / 2); ctx.scale(w / RULE.w, h / RULE.h); ruleBody(ctx, t, 1 - m / 0.45); ctx.restore(); }
    if (m > 0.55) { ctx.save(); ctx.translate(-w / 2, -h / 2); resultBody(ctx, w, h, 'left', (m - 0.55) / 0.45); ctx.restore(); }
    ctx.restore();
  }

  // ---------- main item (chilled bottle) across S1–S4 ----------
  function drawMainItem(ctx, t) {
    if (t < E.itemDrop) return;
    const dp = P(t, E.itemDrop, E.itemLand);
    const lift = 400 * (1 - dp * dp);
    const dl = t - E.itemLand;
    const squash = dl > 0 ? 1 - 0.075 * Math.exp(-dl * 7) * Math.cos(dl * 24) : 1;
    let x = 540, y = 1235, s = 1.15;                // bottle is slimmer than the accepted mug, so it is drawn larger
    const a = eio(P(t, E.toS2, E.toS2 + 0.65)); x = lerp(x, 290, a); y = lerp(y, 1310, a); s = lerp(s, 0.78, a);
    const b = eio(P(t, E.toS4, E.toS4 + 0.75)); x = lerp(x, 297, b); y = lerp(y, 1285, b); s = lerp(s, 0.72, b);
    const c = eio(P(t, E.toS5, E.toS5 + 0.42)); x = lerp(x, -420, c);
    drawBottle(ctx, x, y, s, { lift, squash, chill: P(t, E.chill, E.chill + 0.7), chillT: t - E.chill });
  }

  // ---------- split stage ----------
  function drawSplit(ctx, t) {
    if (t < E.toS4) return;
    const inP = P(t, E.toS4 + 0.3, E.toS4 + 0.85), outP = eio(P(t, E.toS5, E.toS5 + 0.42));
    if (outP >= 1) return;
    // divider
    const dl = eio(inP) * (1 - eio(P(t, E.toS5, E.toS5 + 0.3)));
    if (dl > 0) {
      ctx.beginPath(); ctx.moveTo(530, 668); ctx.lineTo(530, 668 + 760 * dl);
      ctx.strokeStyle = 'rgba(2,25,59,0.22)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
    }
    // headers
    const hp = eo(P(t, E.toS4 + 0.45, E.toS4 + 0.95));
    const hdr = (cx, l1, l2, accent, slide) => {
      ctx.save(); ctx.globalAlpha = hp; ctx.translate(slide, (1 - hp) * 24);
      txt(ctx, l1, cx, 714, { f: '800 34px Inter', a: 'center', ls: 1, maxW: 410 });
      txt(ctx, l2, cx, 758, { f: '800 34px Inter', a: 'center', ls: 1, maxW: 410 });
      rr(ctx, cx - 40, 780, 80, 8, 4); ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
    };
    hdr(297, 'SHOP', 'COUNTER', C.cyan, -700 * outP);
    hdr(757, 'RESTAURANT', 'OR HOTEL', 'rgba(2,25,59,0.35)', 700 * outP);
    // right column: bottle served at a table (tray + glass) + label bubble
    const rm = spring(t - E.rightItem, 1.2, 0.68);
    const rx = lerp(1320, 740, rm) + 700 * outP;
    if (t >= E.rightItem) drawBottle(ctx, rx, 1285, 0.72, { served: true });
    const bp = spring(t - E.bubble, 1.6, 0.55);
    if (t >= E.bubble) {
      ctx.save(); ctx.translate(866 + 700 * outP, 1110); ctx.scale(bp, bp);
      card(ctx, -96, -36, 192, 72, 36, C.card, { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
      txt(ctx, 'At my table', 0, 10, { f: '700 28px Inter', a: 'center', maxW: 160 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(bp);
      for (const [dx, dy, r] of [[2, 54, 8], [-4, 74, 5]]) {
        ctx.beginPath(); ctx.arc(866 + dx + 700 * outP, 1110 + dy, r, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
        ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
      }
      ctx.restore();
    }
    // right result card
    if (t >= E.rightResult) {
      const rp = spring(t - E.rightResult, 1.5, 0.6);
      ctx.save(); ctx.translate(RRES.cx + 700 * outP, RRES.cy + (1 - rp) * 60); ctx.globalAlpha = clamp(rp * 1.5);
      const sc = lerp(0.9, 1, rp); ctx.scale(sc, sc);
      card(ctx, -RRES.w / 2, -RRES.h / 2, RRES.w, RRES.h, 26, C.card, { stroke: C.navy, lw: 3 });
      ctx.translate(-RRES.w / 2, -RRES.h / 2); resultBody(ctx, RRES.w, RRES.h, 'right', 1);
      ctx.restore();
    }
    // a small ruling tag lands on the restaurant side (the reason it is a different case)
    if (t >= E.sticker) {
      const sp = P(t, E.sticker, E.sticker + 0.4);
      const land = E.sticker + 0.4;
      const sy = lerp(640, 836, eob(sp, 1.0)), sc = lerp(1.25, 1, eo(sp)) + wobble(t - land, 0.05, 2.2, 6);
      ctx.save(); ctx.translate(880 + 700 * outP, sy); ctx.rotate(-0.10 + wobble(t - land, 0.05, 1.4, 4)); ctx.scale(sc, sc);
      card(ctx, -100, -26, 200, 52, 11, C.navy, { blur: 14, oy: 6, shadow: 'rgba(2,25,59,0.2)' });
      txt(ctx, 'SC RULING 2017', 0, 10, { f: '900 23px Inter', c: '#FFF8EE', a: 'center', ls: 1, maxW: 176 });
      ctx.restore();
    }
  }

  // ---------- action card + evidence envelope ----------
  const ACT = { x: 110, y: 640, w: 860, h: 360 };
  const ROWS = [['Keep the bill', 'tick1'], ['Snap the MRP label', 'tick2'], ['Contact NCH: 1915', 'tick3']];
  function drawAction(ctx, t) {
    if (t < E.toS5 + 0.22) return;
    const ap = spring(t - (E.toS5 + 0.22), 1.3, 0.72);
    ctx.save(); ctx.translate(0, (1 - ap) * 90); ctx.globalAlpha = clamp(ap * 1.6);
    card(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30, C.card, { blur: 38, oy: 14 });
    ctx.save(); rr(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(ACT.x, ACT.y, ACT.w, 12); ctx.restore();
    txt(ctx, 'Overcharged at a shop? Do this:', ACT.x + 52, ACT.y + 88, { f: '800 46px Inter', maxW: ACT.w - 100 });
    ROWS.forEach(([label, ev], i) => {
      const cy = ACT.y + 158 + i * 76, done = t >= E[ev];
      const k = done ? spring(t - E[ev], 2.2, 0.45) : 0;
      ctx.beginPath(); ctx.arc(ACT.x + 78, cy, 25, 0, Math.PI * 2);
      ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 4; ctx.stroke();
      if (done) {
        ctx.save(); ctx.translate(ACT.x + 78, cy); ctx.scale(k, k);
        ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
        check(ctx, 0, 1, 1.15, C.navy, 5.5);
        ctx.restore();
      }
      txt(ctx, label, ACT.x + 128, cy + 14, { f: done ? '700 40px Inter' : '600 40px Inter', c: done ? C.navy : C.navySoft });
    });
    ctx.restore();
  }
  function invoiceBody(ctx) {
    const w = 230, h = 270;
    card(ctx, -w / 2, -h / 2, w, h, 10, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    txt(ctx, 'BILL', -w / 2 + 22, -h / 2 + 44, { f: '800 24px Inter', ls: 3 });
    txt(ctx, 'Water 1 L', -w / 2 + 22, -h / 2 + 86, { f: '700 22px Inter', c: C.navySoft });
    ctx.fillStyle = C.navyFaint;
    for (let i = 0; i < 3; i++) { rr(ctx, -w / 2 + 22, -h / 2 + 104 + i * 26, i % 2 ? 120 : 170, 12, 6); ctx.fill(); }
    ctx.fillStyle = C.navy; ctx.fillRect(-w / 2 + 22, h / 2 - 76, w - 44, 3);
    txt(ctx, 'Total', -w / 2 + 22, h / 2 - 32, { f: '700 24px Inter', c: C.navySoft });
    txt(ctx, '₹25', w / 2 - 22, h / 2 - 30, { f: '800 30px Inter', a: 'right' });
  }
  function photoBody(ctx) {
    const w = 220, h = 236;
    card(ctx, -w / 2, -h / 2, w, h, 8, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    ctx.save(); rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, 168, 4); ctx.fillStyle = C.paperDeep; ctx.fill(); ctx.clip();
    drawBottle(ctx, 0, -h / 2 + 118, 0.36, { noShadow: true });
    ctx.restore();
    txt(ctx, 'MRP label', 0, h / 2 - 16, { f: '700 22px Inter', c: C.navySoft, a: 'center' });
  }
  const ENV = { cx: 540, cy: 1290, w: 540, h: 310 };
  function drawEnvelope(ctx, t) {
    if (t < E.toS5 + 0.26) return;
    const up = spring(t - (E.toS5 + 0.26), 1.3, 0.72);
    const down = eio(P(t, E.toS6, E.toS6 + 0.42));
    const cy = ENV.cy + (1 - up) * 560 + down * 640;
    const alpha = clamp(up * 1.8) * (1 - down);
    if (alpha <= 0) return;
    const w = ENV.w, h = ENV.h, top = -h / 2;
    const fp = eio(P(t, E.flap, E.flap + 0.4));
    const flapS = lerp(-0.55, 1, fp);                 // open (leaning back) -> closed
    const tuck = 235 * eio(P(t, E.flap - 0.3, E.flap + 0.12));
    ctx.save(); ctx.translate(ENV.cx, cy); ctx.globalAlpha = alpha;
    const flap = () => {
      ctx.save(); ctx.translate(0, top); ctx.scale(1, flapS);
      ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(0, 175); ctx.lineTo(w / 2, 0); ctx.closePath();
      ctx.fillStyle = flapS > 0 ? '#F8F1E3' : '#EFE6D5'; ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
      ctx.restore();
    };
    card(ctx, -w / 2, top, w, h, 14, '#F1E9DA', { stroke: C.navy, lw: 4, blur: 30, oy: 12 });
    if (flapS <= 0) flap();
    ctx.save(); ctx.beginPath(); ctx.rect(-2000, -2000, 4000, 2000 + h / 2 - 6); ctx.clip();
    // invoice
    if (t >= E.bill) {
      const p = eo(P(t, E.bill, E.bill + 0.7));
      const x = lerp(-760, -72, p), y = lerp(-420, -52, p) + tuck, r = lerp(-0.5, -0.07, p);
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); invoiceBody(ctx); ctx.restore();
    }
    if (t >= E.photo) {
      const p = eo(P(t, E.photo, E.photo + 0.7));
      const x = lerp(760, 82, p), y = lerp(-420, -38, p) + tuck, r = lerp(0.55, 0.08, p);
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); photoBody(ctx); ctx.restore();
    }
    ctx.restore();
    // front pocket
    ctx.beginPath();
    ctx.moveTo(-w / 2, top + 108); ctx.lineTo(0, top + 196); ctx.lineTo(w / 2, top + 108);
    ctx.lineTo(w / 2, h / 2 - 14); ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 14, h / 2);
    ctx.lineTo(-w / 2 + 14, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 14); ctx.closePath();
    ctx.fillStyle = '#FBF6EC'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
    if (flapS > 0) flap();
    // seal
    if (t >= E.seal) {
      const k = spring(t - E.seal, 2.0, 0.5);
      ctx.save(); ctx.translate(0, top + 175); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
      ctx.strokeStyle = C.navy; ctx.lineWidth = 3; ctx.stroke();
      check(ctx, 0, 1, 1.0, C.navy, 5);
      ctx.restore();
    }
    // written contact: "NCH · " while the helpline is named, then each digit as it is spoken
    if (t >= E.write) {
      const label = 'NCH · 1915', pre = 6;
      const nPre = pre * P(t, E.write, E.write + 0.5);
      const nDig = 4 * P(t, E.digits, E.digitsEnd);
      const n = t < E.digits ? nPre : pre + Math.ceil(nDig - 1e-6);
      const writing = (t < E.write + 0.5) || (t >= E.digits && t < E.digitsEnd + 0.15);
      ctx.save(); setFont(ctx, 'italic 500 46px Inter', 0);
      const tw = ctx.measureText(label).width, x0 = -tw / 2, by = h / 2 - 34;
      const cut = Math.floor(n), frac = n - cut;
      const shown = ctx.measureText(label.slice(0, cut)).width + frac * (ctx.measureText(label.slice(0, cut + 1)).width - ctx.measureText(label.slice(0, cut)).width);
      ctx.beginPath(); ctx.rect(x0 - 4, by - 56, shown + 6, 76); ctx.clip();
      ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(label, x0, by);
      ctx.restore();
      const wp = shown / tw;
      if (writing) {
        ctx.save(); setFont(ctx, 'italic 500 46px Inter', 0);
        const px = -ctx.measureText(label).width / 2 + ctx.measureText(label).width * wp;
        ctx.translate(px + 6, by - 18 + Math.sin(wp * 40) * 3); ctx.rotate(-0.7);
        rr(ctx, -7, -70, 14, 70, 4); ctx.fillStyle = C.navy; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.lineTo(0, 14); ctx.closePath(); ctx.fillStyle = C.cyan; ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ---------- brand CTA ----------
  function drawCTA(ctx, t) {
    if (t < E.ctaIn) return;
    const k = spring(t - E.ctaIn, 1.6, 0.55);
    const ix = 170, iy = 1175, is = 170;
    // brand arc echoing the icon's glow
    const ap = eio(P(t, E.ctaIn + 0.3, E.ctaIn + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.ctaText, E.ctaText + 0.5));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1250, { f: '800 58px Inter', maxW: 560 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1306, { f: '600 32px Inter', c: C.navySoft, maxW: 560 });
    ctx.restore();
  }

  // ---------- captions (upper safe region: y 340..520, x 90..990) ----------
  const CAP = { size: 64, minSize: 46, maxW: 900, lh: 80, y1: 453, y2a: 412, y2b: 492 };
  const capCache = new Map();
  function layoutCaption(ctx, cp) {
    if (capCache.has(cp.text)) return capCache.get(cp.text);
    const words = cp.text.split(' ');
    let size = CAP.size, lines;
    for (; size >= CAP.minSize; size -= 2) {
      setFont(ctx, `800 ${size}px Inter`, 0);
      const sp = ctx.measureText(' ').width, ws = words.map(w => ctx.measureText(w).width);
      const width = (a, b) => ws.slice(a, b).reduce((s, v) => s + v, 0) + sp * (b - a - 1);
      if (width(0, words.length) <= CAP.maxW) { lines = [[0, words.length]]; break; }
      let best = null;
      for (let k = 1; k < words.length; k++) {
        const m = Math.max(width(0, k), width(k, words.length));
        if (m <= CAP.maxW && (!best || m < best.m)) best = { k, m };
      }
      if (best) { lines = [[0, best.k], [best.k, words.length]]; break; }
    }
    setFont(ctx, `800 ${size}px Inter`, 0);
    const sp = ctx.measureText(' ').width;
    const hl = new Set(cp.hl || []);
    const out = lines.map(([a, b], li) => {
      const ws = words.slice(a, b);
      const total = ws.reduce((s, w) => s + ctx.measureText(w).width, 0) + sp * (ws.length - 1);
      let x = 540 - total / 2;
      const y = lines.length === 1 ? CAP.y1 : (li === 0 ? CAP.y2a : CAP.y2b);
      const items = ws.map(w => {
        const ww = ctx.measureText(w).width;
        const core = w.replace(/[.,;?!”]+$/, '');
        const it = { w, x, y, ww, hw: ctx.measureText(core).width, hl: hl.has(w) };
        x += ww + sp; return it;
      });
      return items;
    });
    const res = { size, lines: out };
    capCache.set(cp.text, res);
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
        // merge consecutive highlighted words into one marker stroke
        let run = null; const runs = [];
        for (const it of items) {
          if (it.hl) { if (!run) { run = { x0: it.x, x1: it.x + it.hw, y: it.y }; runs.push(run); } else run.x1 = it.x + it.hw; }
          else run = null;
        }
        for (const r of runs) {
          const x0 = r.x0 - 8, w = (r.x1 - r.x0 + 16) * hp;
          if (w > 0) { rr(ctx, x0, r.y - L.size * 0.74, w, L.size * 0.92, 12); ctx.fillStyle = C.cyanMark; ctx.fill(); }
        }
        setFont(ctx, `800 ${L.size}px Inter`, 0); ctx.fillStyle = C.navy; ctx.textAlign = 'left';
        for (const it of items) ctx.fillText(it.w, it.x, it.y);
      }
      ctx.restore();
    }
  }

  // ---------- frame ----------
  function render(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    seriesChip(ctx, t);
    drawBanner(ctx, t);
    drawRefuseLine(ctx, t);
    drawMainItem(ctx, t);
    drawOrder(ctx, t);
    drawTag(ctx, t);
    drawRule(ctx, t);
    drawSplit(ctx, t);
    drawAction(ctx, t);
    drawEnvelope(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render };
})();
