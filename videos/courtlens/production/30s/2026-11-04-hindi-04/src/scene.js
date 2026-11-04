/* Courtlens · "Is this legal in India?" · Episode 04 (Hindi): shop bill says "no refund" on a defective product
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
    fitFont(ctx, o.f || '700 40px Inter, "Noto Sans Devanagari"', s, o.maxW || 0, o.ls || 0);
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

  // ---------- kettle (the defective product) ----------
  function kettleBody(ctx, o) {
    const leak = o.leak || 0, tt = o.t || 0, band = o.band || C.cyan;
    if (leak > 0) {                                   // puddle grows under the base
      ctx.save(); ctx.globalAlpha *= clamp(leak * 1.5);
      ctx.beginPath(); ctx.ellipse(-30, 146, 30 + 60 * leak, 9 + 5 * leak, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(18,170,211,0.30)'; ctx.fill();
      ctx.restore();
    }
    rr(ctx, -100, 112, 200, 30, 12); ctx.fillStyle = C.navy; ctx.fill();                       // power base
    ctx.beginPath(); ctx.arc(-74, 127, 6, 0, Math.PI * 2); ctx.fillStyle = leak > 0 ? C.red : C.cyan; ctx.fill();
    ctx.save(); ctx.lineCap = 'round';                                                          // handle
    ctx.beginPath(); ctx.moveTo(58, -104); ctx.bezierCurveTo(150, -112, 152, 64, 74, 60);
    ctx.lineWidth = 30; ctx.strokeStyle = C.navy; ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = C.card; ctx.stroke();
    ctx.restore();
    ctx.beginPath(); ctx.moveTo(-62, -64); ctx.lineTo(-132, -122); ctx.lineTo(-118, -138); ctx.lineTo(-58, -100); ctx.closePath();   // spout
    ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-60, -132); ctx.lineTo(60, -132); ctx.lineTo(86, 100);            // body
    ctx.quadraticCurveTo(88, 112, 74, 112); ctx.lineTo(-74, 112); ctx.quadraticCurveTo(-88, 112, -86, 100); ctx.closePath();
    ctx.fillStyle = C.card; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = band; ctx.fillRect(-100, 20, 200, 40);
    ctx.fillStyle = C.gold; ctx.fillRect(-100, 62, 200, 6);
    rr(ctx, 22, -100, 22, 100, 11); ctx.fillStyle = '#D6EEF6'; ctx.fill();                       // water window
    const g = ctx.createLinearGradient(-90, 0, 90, 0);
    g.addColorStop(0, 'rgba(2,25,59,0.02)'); g.addColorStop(0.6, 'rgba(2,25,59,0)'); g.addColorStop(1, 'rgba(2,25,59,0.13)');
    ctx.fillStyle = g; ctx.fillRect(-100, -140, 200, 260);
    ctx.restore();
    ctx.lineWidth = 7; ctx.strokeStyle = C.navy; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -134, 64, 14, 0, 0, Math.PI * 2); ctx.fillStyle = '#E6DCCB'; ctx.fill(); ctx.stroke();   // lid
    rr(ctx, -16, -160, 32, 20, 8); ctx.fillStyle = C.navy; ctx.fill();
    if (leak > 0) {                                   // crack near the base + drips
      ctx.save(); ctx.globalAlpha *= clamp(leak * 2);
      ctx.beginPath(); ctx.moveTo(-70, 104); ctx.lineTo(-56, 82); ctx.lineTo(-64, 70); ctx.lineTo(-48, 52);
      ctx.strokeStyle = C.navy; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ph = ((tt * 1.3 + i / 3) % 1 + 1) % 1, y = 110 + 38 * ph * ph;
        ctx.save(); ctx.globalAlpha *= 1 - ph * 0.6;
        ctx.beginPath(); ctx.moveTo(-58, y - 9); ctx.quadraticCurveTo(-50, y + 2, -58, y + 6); ctx.quadraticCurveTo(-66, y + 2, -58, y - 9);
        ctx.fillStyle = C.cyan; ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
  }
  function drawKettle(ctx, x, y, s, o = {}) {
    const alpha = o.alpha ?? 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    if (!o.noShadow) {
      const lift = o.lift || 0, k = 1 - clamp(lift / 700) * 0.6;
      ctx.save(); ctx.translate(0, 152); ctx.scale(1, 0.13);
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 160 * k);
      g.addColorStop(0, `rgba(2,25,59,${0.20 * k})`); g.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 160 * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.translate(0, -(o.lift || 0));
    if (o.squash) { ctx.translate(0, 140); ctx.scale(1 / o.squash, o.squash); ctx.translate(0, -140); }
    kettleBody(ctx, o);
    if (o.leak > 0 && !o.noShadow) {                // warning sign beside the kettle
      const k = spring(o.leakT ?? 9, 1.8, 0.5);
      ctx.save(); ctx.translate(128, -150); ctx.scale(k, k);
      ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(24, 18); ctx.lineTo(-24, 18); ctx.closePath();
      ctx.fillStyle = C.red; ctx.fill(); ctx.strokeStyle = C.redDark; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
      rr(ctx, -3, -10, 6, 16, 3); ctx.fillStyle = '#FFF8EE'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 12, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------- series chip ----------
  function seriesChip(ctx, t) {
    const a = 1 - P(t, E.toS4, E.toS4 + 0.35);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    setFont(ctx, '800 28px Inter, "Noto Sans Devanagari"', 0);
    const label = 'क्या यह भारत में कानूनी है?';
    const tw = ctx.measureText(label).width, w = tw + 92, x = 540 - w / 2, y = 560;
    rr(ctx, x, y, w, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.7)'; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(label, x + 54, y + 39);
    ctx.restore();
  }

  // ---------- shop bill card (same frame/motion as the accepted order card) ----------
  function orderCardBody(ctx, t) {
    const w = 800, h = 320, leaking = t >= E.leak;
    card(ctx, 0, 0, w, h, 30, C.card);
    txt(ctx, 'दुकान का बिल', 44, 64, { f: '700 28px Inter, "Noto Sans Devanagari"', c: C.navySoft });
    setFont(ctx, '800 27px Inter, "Noto Sans Devanagari"', 0);
    const pill = leaking ? 'तीसरे दिन लीक' : '1 नवंबर', pw = ctx.measureText(pill).width + 76, px = w - 44 - pw;
    const pop = leaking ? 1 + wobble(t - E.leak, 0.12, 2.2, 6) : 1;
    ctx.save(); ctx.translate(px + pw / 2, 52); ctx.scale(pop, pop); ctx.translate(-(px + pw / 2), -52);
    rr(ctx, px, 30, pw, 46, 23); ctx.fillStyle = leaking ? C.redTint : C.cyanTint; ctx.fill();
    ctx.beginPath(); ctx.arc(px + 28, 53, 8, 0, Math.PI * 2); ctx.fillStyle = leaking ? C.red : C.cyanDark; ctx.fill();
    txt(ctx, pill, px + 48, 63, { f: '800 27px Inter, "Noto Sans Devanagari"', c: leaking ? C.redDark : C.cyanDark });
    ctx.restore();
    rr(ctx, 44, 98, 96, 96, 20); ctx.fillStyle = C.paperDeep; ctx.fill();
    drawKettle(ctx, 92, 150, 0.24, { noShadow: true });
    txt(ctx, 'इलेक्ट्रिक केतली', 168, 146, { f: '800 44px Inter, "Noto Sans Devanagari"', maxW: 420 });
    txt(ctx, 'बिल नं. 4821 · नकद', 168, 186, { f: '600 27px Inter, "Noto Sans Devanagari"', c: C.navySoft });
    txt(ctx, '₹1,299', w - 44, 146, { f: '800 50px Inter, "Noto Sans Devanagari"', a: 'right' });
    // the clause printed on the bill: the tiny clause this episode turns on
    const hp = eio(P(t, E.quoteMark, E.quoteMark + 0.4)), qpop = 1 + wobble(t - E.quoteMark - 0.35, 0.03, 2.2, 6);
    ctx.save(); ctx.translate(w / 2, 258); ctx.scale(qpop, qpop); ctx.translate(-w / 2, -258);
    rr(ctx, 44, 222, w - 88, 72, 14); ctx.fillStyle = C.paper; ctx.fill();
    ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(2,25,59,0.3)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
    if (hp > 0) { ctx.save(); rr(ctx, 44, 222, w - 88, 72, 14); ctx.clip(); ctx.fillStyle = C.cyanMark; ctx.fillRect(44, 222, (w - 88) * hp, 72); ctx.restore(); }
    txt(ctx, 'रिफ़ंड नहीं · बिका माल वापस नहीं होगा', w / 2, 270, { f: '800 34px Inter, "Noto Sans Devanagari"', a: 'center', maxW: w - 120 });
    ctx.restore();
  }
  function orderState(t) {
    const enter = spring(t - E.cardIn, 1.25, 0.66);
    let cx = 540, cy = 815 + (1 - enter) * 160, s = 1, alpha = clamp(enter * 1.6);
    // curved path: right first, then down, so the shrinking card never crosses the kettle
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
      txt(ctx, 'पैसा वापस नहीं?', -w / 2 + 92, 14, { f: '800 38px Inter, "Noto Sans Devanagari"', c: C.redDark, maxW: w - 112 });
    } else {
      card(ctx, -w / 2, -h / 2, w, h, 46, C.cyan, { blur: 22, oy: 8 });
      ctx.beginPath(); ctx.arc(-w / 2 + 50, 0, 25, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      check(ctx, -w / 2 + 50, 1, 1.15, C.navy, 5);
      txt(ctx, 'रिफ़ंड माँग सकते हैं', -w / 2 + 90, 13, { f: '800 36px Inter, "Noto Sans Devanagari"', c: C.navy, maxW: w - 110 });
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
    txt(ctx, 'दुकानदार', 0, 82, { f: '700 24px Inter, "Noto Sans Devanagari"', c: 'rgba(255,248,238,0.86)', a: 'center' });
    txt(ctx, 'रिफ़ंड नहीं!', 0, 164, { f: '800 76px Inter, "Noto Sans Devanagari"', c: '#FFF8EE', a: 'center', maxW: 556 });
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
    txt(ctx, 'भारत · उपभोक्ता संरक्षण अधिनियम, 2019', 52, 62, { f: '800 30px Inter, "Noto Sans Devanagari"', c: C.cyanDark, maxW: w - 100 });
    const r1 = eo(P(t, E.ruleIn + 0.55, E.ruleIn + 0.95)), r2 = eo(P(t, E.ruleIn + 1.25, E.ruleIn + 1.65)), r3 = eo(P(t, E.ruleIn + 2.2, E.ruleIn + 2.6));
    txt(ctx, 'खराब सामान वापस न लेना, पैसे न लौटाना', 52 + (1 - r1) * 24, 124, { f: '600 41px Inter, "Noto Sans Devanagari"', maxW: w - 96, alpha: r1 });
    txt(ctx, 'अनुचित व्यापार प्रथा है, इस अवधि में:', 52 + (1 - r2) * 24, 176, { f: '600 41px Inter, "Noto Sans Devanagari"', maxW: w - 96, alpha: r2 });
    ctx.save(); ctx.globalAlpha *= r3; ctx.translate(0, (1 - r3) * 14);
    const chips = [['बिल में लिखी अवधि', E.chip1], ['वरना 30 दिन', E.chip2]];
    const pad = 34, gap = 14; let fs = 38;
    for (; fs > 24; fs -= 1) {                          // three chips must fit the card width
      setFont(ctx, `800 ${fs}px Inter, "Noto Sans Devanagari"`, 0);
      if (chips.reduce((acc, [l]) => acc + ctx.measureText(l).width + pad, 0) + gap * (chips.length - 1) <= w - 104) break;
    }
    let x = 52;
    for (const [label, tc] of chips) {
      setFont(ctx, `800 ${fs}px Inter, "Noto Sans Devanagari"`, 0);
      const cw = ctx.measureText(label).width + pad, cy = 206, ch = 64;
      const hp = eio(P(t, tc, tc + 0.32));
      const pop = 1 + wobble(t - tc - 0.25, 0.06, 2.2, 6);
      ctx.save(); ctx.translate(x + cw / 2, cy + ch / 2); ctx.scale(pop, pop); ctx.translate(-(x + cw / 2), -(cy + ch / 2));
      rr(ctx, x, cy, cw, ch, 16); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 3; ctx.stroke();
      if (hp > 0) { ctx.save(); rr(ctx, x, cy, cw, ch, 16); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(x, cy, cw * hp, ch); ctx.restore(); }
      txt(ctx, label, x + pad / 2, cy + ch / 2 + fs * 0.3, { f: `800 ${fs}px Inter, "Noto Sans Devanagari"` });
      ctx.restore();
      x += cw + gap;
    }
    ctx.restore();
    ctx.restore();
  }
  function resultBody(ctx, w, h, kind, a) {
    ctx.save(); ctx.globalAlpha *= a;
    if (kind === 'left') {
      txt(ctx, 'कानून लागू', 30, 58, { f: '800 26px Inter, "Noto Sans Devanagari"', c: 'rgba(2,25,59,0.78)', maxW: w - 56 });
      txt(ctx, 'आयोग दिला सकता है', 30, 120, { f: '800 36px Inter, "Noto Sans Devanagari"', maxW: w - 56 });
      txt(ctx, 'मरम्मत, बदली या रिफ़ंड', 30, 168, { f: '800 36px Inter, "Noto Sans Devanagari"', maxW: w - 56 });
    } else {
      txt(ctx, 'कोई सीधा हक़ नहीं', 30, 58, { f: '800 26px Inter, "Noto Sans Devanagari"', c: C.navySoft, maxW: w - 56 });
      txt(ctx, 'वापसी दुकान', 30, 120, { f: '800 36px Inter, "Noto Sans Devanagari"', maxW: w - 56 });
      txt(ctx, 'की नीति पर', 30, 168, { f: '800 36px Inter, "Noto Sans Devanagari"', maxW: w - 56 });
    }
    ctx.restore();
  }
  function drawRule(ctx, t) {
    if (t < E.ruleIn) return;
    const enter = spring(t - E.ruleIn, 1.15, 0.72);
    const m = eio(P(t, E.toS4 + 0.1, E.toS4 + 0.8));          // morph to left result
    const out = eio(P(t, E.toS5, E.toS5 + 0.42));            // exit left with the kettle
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

  // ---------- main item (leaking kettle) across S1–S4 ----------
  function drawMainItem(ctx, t) {
    if (t < E.itemDrop) return;
    const dp = P(t, E.itemDrop, E.itemLand);
    const lift = 260 * (1 - dp * dp);              // phone is wider than the bottle: stay hidden behind the card while dropping
    const dl = t - E.itemLand;
    const squash = dl > 0 ? 1 - 0.075 * Math.exp(-dl * 7) * Math.cos(dl * 24) : 1;
    let x = 540, y = 1235, s = 1.15;                // same footprint as the round-02 bottle
    const a = eio(P(t, E.toS2, E.toS2 + 0.65)); x = lerp(x, 290, a); y = lerp(y, 1310, a); s = lerp(s, 0.78, a);
    const b = eio(P(t, E.toS4, E.toS4 + 0.75)); x = lerp(x, 297, b); y = lerp(y, 1285, b); s = lerp(s, 0.72, b);
    const c = eio(P(t, E.toS5, E.toS5 + 0.42)); x = lerp(x, -420, c);
    drawKettle(ctx, x, y, s, { lift, squash, leak: P(t, E.leak, E.leak + 1.2), leakT: t - E.leak, t });
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
      txt(ctx, l1, cx, 714, { f: '800 34px Inter, "Noto Sans Devanagari"', a: 'center', maxW: 410 });
      txt(ctx, l2, cx, 760, { f: '800 34px Inter, "Noto Sans Devanagari"', a: 'center', maxW: 410 });
      rr(ctx, cx - 40, 780, 80, 8, 4); ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
    };
    hdr(297, 'खराब', 'सामान', C.cyan, -700 * outP);
    hdr(757, 'मन बदल', 'गया', 'rgba(2,25,59,0.35)', 700 * outP);
    // right column: an intact kettle in another colour + thought bubble
    const rm = spring(t - E.rightItem, 1.2, 0.68);
    const rx = lerp(1320, 740, rm) + 700 * outP;
    if (t >= E.rightItem) drawKettle(ctx, rx, 1285, 0.72, { band: C.gold, t });
    const bp = spring(t - E.bubble, 1.6, 0.55);
    if (t >= E.bubble) {
      ctx.save(); ctx.translate(866 + 700 * outP, 1110); ctx.scale(bp, bp);
      card(ctx, -96, -36, 192, 72, 36, C.card, { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
      txt(ctx, 'रंग पसंद नहीं', 0, 10, { f: '700 28px Inter, "Noto Sans Devanagari"', a: 'center', maxW: 164 });
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
    // the shop's sign returns as a small sticker where it is relevant (change of mind)
    if (t >= E.sticker) {
      const sp = P(t, E.sticker, E.sticker + 0.4);
      const land = E.sticker + 0.4;
      const sy = 836, sc = lerp(1.35, 1, eob(sp, 1.2)) + wobble(t - land, 0.05, 2.2, 6);   // pops in place: never crosses the header
      ctx.save(); ctx.globalAlpha = clamp(sp * 3); ctx.translate(880 + 700 * outP, sy); ctx.rotate(-0.10 + wobble(t - land, 0.05, 1.4, 4)); ctx.scale(sc, sc);
      card(ctx, -100, -26, 200, 52, 11, C.red, { blur: 14, oy: 6, shadow: 'rgba(2,25,59,0.2)' });
      txt(ctx, 'रिफ़ंड नहीं', 0, 10, { f: '800 23px Inter, "Noto Sans Devanagari"', c: '#FFF8EE', a: 'center', maxW: 176 });
      ctx.restore();
    }
  }

  // ---------- action card + evidence envelope ----------
  const ACT = { x: 110, y: 640, w: 860, h: 360 };
  const ROWS = [['बिल संभालकर रखें', 'tick1'], ['खराबी की फ़ोटो लें', 'tick2'], ['लिखित शिकायत, फिर 1915', 'tick3']];
  function drawAction(ctx, t) {
    if (t < E.toS5 + 0.22) return;
    const ap = spring(t - (E.toS5 + 0.22), 1.3, 0.72);
    ctx.save(); ctx.translate(0, (1 - ap) * 90); ctx.globalAlpha = clamp(ap * 1.6);
    card(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30, C.card, { blur: 38, oy: 14 });
    ctx.save(); rr(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(ACT.x, ACT.y, ACT.w, 12); ctx.restore();
    txt(ctx, 'खराब सामान? ऐसा करें:', ACT.x + 52, ACT.y + 88, { f: '800 46px Inter, "Noto Sans Devanagari"', maxW: ACT.w - 100 });
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
      txt(ctx, label, ACT.x + 128, cy + 14, { f: done ? '700 40px Inter, "Noto Sans Devanagari"' : '600 40px Inter, "Noto Sans Devanagari"', c: done ? C.navy : C.navySoft });
    });
    ctx.restore();
  }
  function invoiceBody(ctx) {                         // the shop bill (proof of purchase and date)
    const w = 230, h = 270;
    card(ctx, -w / 2, -h / 2, w, h, 10, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    txt(ctx, 'बिल', -w / 2 + 22, -h / 2 + 46, { f: '800 28px Inter, "Noto Sans Devanagari"' });
    txt(ctx, '1 नवंबर', w / 2 - 22, -h / 2 + 46, { f: '700 20px Inter, "Noto Sans Devanagari"', c: C.navySoft, a: 'right' });
    txt(ctx, 'इलेक्ट्रिक केतली', -w / 2 + 22, -h / 2 + 90, { f: '700 22px Inter, "Noto Sans Devanagari"', c: C.navySoft, maxW: w - 44 });
    ctx.fillStyle = C.navyFaint;
    for (let i = 0; i < 2; i++) { rr(ctx, -w / 2 + 22, -h / 2 + 110 + i * 26, i % 2 ? 120 : 170, 12, 6); ctx.fill(); }
    ctx.fillStyle = C.navy; ctx.fillRect(-w / 2 + 22, h / 2 - 76, w - 44, 3);
    txt(ctx, 'कुल', -w / 2 + 22, h / 2 - 32, { f: '700 24px Inter, "Noto Sans Devanagari"', c: C.navySoft });
    txt(ctx, '₹1,299', w / 2 - 22, h / 2 - 30, { f: '800 30px Inter, "Noto Sans Devanagari"', a: 'right' });
  }
  function photoBody(ctx) {                           // photo of the leak
    const w = 220, h = 236;
    card(ctx, -w / 2, -h / 2, w, h, 8, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    ctx.save(); rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, 168, 4); ctx.fillStyle = C.paperDeep; ctx.fill(); ctx.clip();
    drawKettle(ctx, 4, -h / 2 + 118, 0.36, { noShadow: true, leak: 1, t: 0.4 });
    ctx.restore();
    txt(ctx, 'खराबी की फ़ोटो', 0, h / 2 - 16, { f: '700 22px Inter, "Noto Sans Devanagari"', c: C.navySoft, a: 'center', maxW: w - 30 });
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
      const x = lerp(-760, -72, p), y = lerp(-110, -52, p) + tuck, r = lerp(-0.3, -0.07, p);   // slides in at envelope height (clear of the action card)
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); invoiceBody(ctx); ctx.restore();
    }
    if (t >= E.photo) {
      const p = eo(P(t, E.photo, E.photo + 0.7));
      const x = lerp(760, 82, p), y = lerp(-110, -38, p) + tuck, r = lerp(0.35, 0.08, p);
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
    // written label: what is inside the envelope
    if (t >= E.write) {
      const label = 'लिखित शिकायत', wp = eio(P(t, E.write, E.write + 0.45));
      ctx.save(); setFont(ctx, '700 42px Inter, "Noto Sans Devanagari"', 0);
      const tw = ctx.measureText(label).width, x0 = -tw / 2, by = h / 2 - 34;
      ctx.beginPath(); ctx.rect(x0 - 4, by - 56, (tw + 8) * wp, 80); ctx.clip();
      ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(label, x0, by);
      ctx.restore();
      if (wp < 1) {
        ctx.save();
        ctx.translate(x0 + tw * wp + 6, by - 18 + Math.sin(wp * 40) * 3); ctx.rotate(-0.7);
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
    txt(ctx, 'Courtlens को फ़ॉलो करें', 376, 1252, { f: '800 52px Inter, "Noto Sans Devanagari"', maxW: 560 });
    txt(ctx, 'आसान भाषा में भारतीय कानून', 378, 1310, { f: '600 32px Inter, "Noto Sans Devanagari"', c: C.navySoft, maxW: 560 });
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
      setFont(ctx, `800 ${size}px Inter, "Noto Sans Devanagari"`, 0);
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
    setFont(ctx, `800 ${size}px Inter, "Noto Sans Devanagari"`, 0);
    const sp = ctx.measureText(' ').width;
    const hl = new Set(cp.hl || []);
    const out = lines.map(([a, b], li) => {
      const ws = words.slice(a, b);
      const total = ws.reduce((s, w) => s + ctx.measureText(w).width, 0) + sp * (ws.length - 1);
      let x = 540 - total / 2;
      const y = lines.length === 1 ? CAP.y1 : (li === 0 ? CAP.y2a : CAP.y2b);
      const items = ws.map(w => {
        const ww = ctx.measureText(w).width;
        const core = w.replace(/[.,;:?!”।]+$/, '');
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
          if (w > 0) { rr(ctx, x0, r.y - L.size * 0.86, w, L.size * 1.08, 12); ctx.fillStyle = C.cyanMark; ctx.fill(); }
        }
        setFont(ctx, `800 ${L.size}px Inter, "Noto Sans Devanagari"`, 0); ctx.fillStyle = C.navy; ctx.textAlign = 'left';
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
