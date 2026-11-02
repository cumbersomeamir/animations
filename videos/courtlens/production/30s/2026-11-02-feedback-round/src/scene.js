/* Courtlens · "Is this legal in India?" · Episode: No refunds vs a defective item
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

  // ---------- mug ----------
  const CRACK = [[-4, -320], [-4, -146], [12, -112], [-12, -70], [10, -28], [-10, 12], [12, 54], [-8, 96], [6, 140], [6, 320]];
  const CRACK_VIS = CRACK.slice(1, -1);
  function mugBody(ctx) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(104, -72); ctx.bezierCurveTo(222, -84, 222, 78, 100, 66);
    ctx.lineWidth = 36; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.lineWidth = 22; ctx.strokeStyle = C.card; ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-120, -125); ctx.lineTo(120, -125); ctx.lineTo(108, 116);
    ctx.quadraticCurveTo(106, 140, 80, 140); ctx.lineTo(-80, 140); ctx.quadraticCurveTo(-106, 140, -108, 116); ctx.closePath();
    ctx.fillStyle = C.card; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = C.cyan; ctx.fillRect(-130, -18, 260, 46);
    ctx.fillStyle = C.gold; ctx.fillRect(-130, 36, 260, 7);
    const g = ctx.createLinearGradient(-120, 0, 120, 0);
    g.addColorStop(0, 'rgba(2,25,59,0.02)'); g.addColorStop(0.62, 'rgba(2,25,59,0)'); g.addColorStop(1, 'rgba(2,25,59,0.13)');
    ctx.fillStyle = g; ctx.fillRect(-130, -130, 260, 280);
    ctx.restore();
    ctx.lineWidth = 7; ctx.strokeStyle = C.navy; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -125, 120, 26, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#E6DCCB'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -121, 102, 17, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.strokeStyle = 'rgba(2,25,59,0.22)'; ctx.lineWidth = 3; ctx.stroke();
  }
  function crackPath(ctx, pts, prog) {
    let total = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    let rem = total * prog;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const d = seg[i - 1], k = Math.min(1, rem / d);
      ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); rem -= d;
    }
  }
  const SHARDS = [
    { sx: 6, sy: -140, lx: 186, ly: 150, d: 0.46, h: 150, r0: 0.2, rs: 5.0, pts: [[0, -15], [18, 8], [-13, 10]] },
    { sx: -10, sy: 30, lx: -196, ly: 151, d: 0.38, h: 70, r0: 1.0, rs: -4.0, pts: [[0, -11], [12, 7], [-10, 6]] },
    { sx: 10, sy: 92, lx: 150, ly: 153, d: 0.30, h: 40, r0: 0.4, rs: 3.0, pts: [[0, -8], [10, 6], [-8, 5]] },
    { sx: -8, sy: -70, lx: -150, ly: 150, d: 0.42, h: 110, r0: 2.0, rs: -5.5, pts: [[0, -9], [9, 6], [-9, 7]] },
  ];
  function drawMug(ctx, x, y, s, o = {}) {
    const crack = o.crack || 0, split = o.split || 0, alpha = o.alpha ?? 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    // ground shadow
    if (!o.noShadow) {
      const lift = o.lift || 0, k = 1 - clamp(lift / 700) * 0.6;
      ctx.save(); ctx.translate(0, 152); ctx.scale(1, 0.13);
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 175 * k);
      g.addColorStop(0, `rgba(2,25,59,${0.20 * k})`); g.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 175 * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.translate(0, -(o.lift || 0));
    if (o.squash) { ctx.translate(0, 140); ctx.scale(1 / o.squash, o.squash); ctx.translate(0, -140); }
    if (split <= 0) {
      mugBody(ctx);
      if (crack > 0) {
        crackPath(ctx, CRACK_VIS, crack);
        ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
      }
    } else {
      const a = 0.11 * split, dx = 16 * split;
      for (const side of [-1, 1]) {
        ctx.save();
        const px = side * 80, py = 140;
        ctx.translate(side * dx, 0);
        ctx.translate(px, py); ctx.rotate(side * a); ctx.translate(-px, -py);
        ctx.beginPath(); ctx.moveTo(side * 420, -320);
        for (const [cx, cy] of CRACK) ctx.lineTo(cx, cy);
        ctx.lineTo(side * 420, 320); ctx.closePath(); ctx.clip();
        mugBody(ctx);
        ctx.beginPath(); for (const [i, [cx, cy]] of CRACK_VIS.entries()) (i ? ctx.lineTo(cx, cy) : ctx.moveTo(cx, cy));
        ctx.strokeStyle = C.navy; ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();
      }
      // shards
      const dtS = o.shardT ?? 99;
      for (const sh of SHARDS) {
        const p = clamp(dtS / sh.d);
        const sx = lerp(sh.sx, sh.lx, eo(p)), sy = lerp(sh.sy, sh.ly, p * p) - sh.h * 4 * p * (1 - p) * 0.5;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(sh.r0 + sh.rs * p);
        ctx.beginPath(); sh.pts.forEach(([u, v], i) => (i ? ctx.lineTo(u, v) : ctx.moveTo(u, v))); ctx.closePath();
        ctx.fillStyle = C.card; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();
      }
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

  // ---------- order card ----------
  function orderCardBody(ctx, t) {
    const w = 800, h = 320;
    card(ctx, 0, 0, w, h, 30, C.card);
    txt(ctx, 'ORDER #CL-4821', 44, 62, { f: '700 27px Inter', c: C.navySoft, ls: 3 });
    const delivered = t >= E.track3;
    setFont(ctx, '800 27px Inter', 1);
    const pill = delivered ? 'Delivered' : 'On the way';
    const pw = ctx.measureText(pill).width + (delivered ? 78 : 44), px = w - 44 - pw;
    const pop = delivered ? 1 + wobble(t - E.track3, 0.12, 2.2, 6) : 1;
    ctx.save(); ctx.translate(px + pw / 2, 52); ctx.scale(pop, pop); ctx.translate(-(px + pw / 2), -52);
    rr(ctx, px, 30, pw, 46, 23); ctx.fillStyle = delivered ? C.cyanTint : C.paperDeep; ctx.fill();
    if (delivered) check(ctx, px + 30, 53, 0.95, C.cyanDark, 5);
    txt(ctx, pill, px + (delivered ? 52 : 22), 63, { f: '800 27px Inter', c: delivered ? C.cyanDark : C.navySoft, ls: 1 });
    ctx.restore();
    // item row
    rr(ctx, 44, 98, 96, 96, 20); ctx.fillStyle = C.paperDeep; ctx.fill();
    drawMug(ctx, 92, 150, 0.26, { noShadow: true });
    txt(ctx, 'Ceramic mug', 168, 144, { f: '800 46px Inter' });
    txt(ctx, 'Qty 1 · Paid online', 168, 184, { f: '600 27px Inter', c: C.navySoft });
    txt(ctx, '₹499', w - 44, 146, { f: '800 50px Inter', a: 'right' });
    // delivery track
    const xs = [70, 400, 730], ty = 240, ts = [E.track1, E.track2, E.track3];
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(xs[0], ty); ctx.lineTo(xs[2], ty); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 8; ctx.stroke();
    const f1 = eio(P(t, ts[0], ts[1])), f2 = eio(P(t, ts[1], ts[2]));
    ctx.beginPath(); ctx.moveTo(xs[0], ty); ctx.lineTo(lerp(xs[0], xs[1], f1), ty);
    if (f2 > 0) ctx.lineTo(lerp(xs[1], xs[2], f2), ty);
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.stroke();
    const labels = ['Ordered', 'Shipped', 'Delivered'];
    xs.forEach((x, i) => {
      const on = t >= ts[i], k = on ? 1 + wobble(t - ts[i], 0.25, 2.4, 7) : 1;
      ctx.beginPath(); ctx.arc(x, ty, 15 * k, 0, Math.PI * 2);
      ctx.fillStyle = on ? C.cyan : C.card; ctx.fill();
      ctx.strokeStyle = on ? C.cyanDark : C.navyFaint; ctx.lineWidth = 4; ctx.stroke();
      txt(ctx, labels[i], x, 292, { f: '600 25px Inter', c: on ? C.navy : C.navySoft, a: i === 0 ? 'left' : i === 2 ? 'right' : 'center' });
    });
  }
  function orderState(t) {
    const enter = spring(t - E.cardIn, 1.25, 0.66);
    let cx = 540, cy = 815 + (1 - enter) * 160, s = 1, alpha = clamp(enter * 1.6);
    // curved path: right first, then down, so the shrinking card never crosses the mug
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
      txt(ctx, 'No refund', -w / 2 + 92, 14, { f: '800 40px Inter', c: C.redDark });
    } else {
      card(ctx, -w / 2, -h / 2, w, h, 46, C.cyan, { blur: 22, oy: 8 });
      ctx.beginPath(); ctx.arc(-w / 2 + 50, 0, 25, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      check(ctx, -w / 2 + 50, 1, 1.15, C.navy, 5);
      txt(ctx, 'Return or refund', -w / 2 + 90, 13, { f: '800 36px Inter', c: C.navy, maxW: w - 110 });
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
    txt(ctx, "SELLER'S POLICY", 0, 80, { f: '700 22px Inter', c: 'rgba(255,248,238,0.82)', a: 'center', ls: 4 });
    txt(ctx, 'NO REFUNDS', 0, 162, { f: '900 84px Inter', c: '#FFF8EE', a: 'center', ls: 2 });
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
    txt(ctx, 'INDIA · E-COMMERCE RULES, 2020', 52, 60, { f: '800 27px Inter', c: C.cyanDark, ls: 3, maxW: w - 100 });
    const r1 = eo(P(t, E.ruleIn + 0.55, E.ruleIn + 0.95)), r2 = eo(P(t, E.ruleIn + 1.25, E.ruleIn + 1.65)), r3 = eo(P(t, E.ruleIn + 2.2, E.ruleIn + 2.6));
    txt(ctx, "Sellers can’t refuse to take back", 52 + (1 - r1) * 24, 124, { f: '600 41px Inter', maxW: w - 96, alpha: r1 });
    txt(ctx, 'or refund goods that are:', 52 + (1 - r2) * 24, 176, { f: '600 41px Inter', maxW: w - 96, alpha: r2 });
    ctx.save(); ctx.globalAlpha *= r3; ctx.translate(0, (1 - r3) * 14);
    const chips = [['defective', E.chipDefective], ['not as described', E.chipDescribed]];
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
      txt(ctx, 'RULE APPLIES', 30, 56, { f: '800 24px Inter', c: 'rgba(2,25,59,0.78)', ls: 3 });
      txt(ctx, 'Return or refund', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, "can’t be refused", 30, 164, { f: '800 36px Inter', maxW: w - 56 });
    } else {
      txt(ctx, 'NO AUTOMATIC RIGHT', 30, 56, { f: '800 24px Inter', c: C.navySoft, ls: 2, maxW: w - 56 });
      txt(ctx, 'Depends on the', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, 'return policy', 30, 164, { f: '800 36px Inter', maxW: w - 56 });
    }
    ctx.restore();
  }
  function drawRule(ctx, t) {
    if (t < E.ruleIn) return;
    const enter = spring(t - E.ruleIn, 1.15, 0.72);
    const m = eio(P(t, E.toS4 + 0.1, E.toS4 + 0.8));          // morph to left result
    const out = eio(P(t, E.toS5, E.toS5 + 0.42));            // exit left with the mug
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

  // ---------- main (broken) mug across S1–S4 ----------
  function drawMainMug(ctx, t) {
    if (t < E.mugDrop) return;
    const dp = P(t, E.mugDrop, E.mugLand);
    const lift = 400 * (1 - dp * dp);
    const dl = t - E.mugLand;
    const squash = dl > 0 ? 1 - 0.075 * Math.exp(-dl * 7) * Math.cos(dl * 24) : 1;
    let x = 540, y = 1235, s = 1;
    const a = eio(P(t, E.toS2, E.toS2 + 0.65)); x = lerp(x, 290, a); y = lerp(y, 1300, a); s = lerp(s, 0.66, a);
    const b = eio(P(t, E.toS4, E.toS4 + 0.75)); x = lerp(x, 297, b); y = lerp(y, 1285, b); s = lerp(s, 0.62, b);
    const c = eio(P(t, E.toS5, E.toS5 + 0.42)); x = lerp(x, -420, c);
    drawMug(ctx, x, y, s, { lift, squash, crack: eo(P(t, E.crack, E.split)), split: eob(P(t, E.split, E.split + 0.34), 1.3), shardT: t - E.split });
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
    hdr(297, 'DEFECTIVE OR', 'NOT AS DESCRIBED', C.cyan, -700 * outP);
    hdr(757, 'CHANGED', 'MY MIND', 'rgba(2,25,59,0.35)', 700 * outP);
    // right column: intact mug + thought bubble
    const rm = spring(t - E.rightMug, 1.2, 0.68);
    const rx = lerp(1320, 757, rm) + 700 * outP;
    if (t >= E.rightMug) drawMug(ctx, rx, 1285, 0.62, {});
    const bp = spring(t - E.bubble, 1.6, 0.55);
    if (t >= E.bubble) {
      ctx.save(); ctx.translate(862 + 700 * outP, 1138); ctx.scale(bp, bp);
      card(ctx, -98, -36, 196, 72, 36, C.card, { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
      txt(ctx, 'Not for me', 0, 10, { f: '700 29px Inter', a: 'center' });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(bp);
      for (const [dx, dy, r] of [[-12, 52, 8], [-22, 70, 5]]) {
        ctx.beginPath(); ctx.arc(862 + dx + 700 * outP, 1138 + dy, r, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
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
    // the seller's sign returns as a small sticker where it is relevant
    if (t >= E.sticker) {
      const sp = P(t, E.sticker, E.sticker + 0.4);
      const land = E.sticker + 0.4;
      const sy = lerp(640, 836, eob(sp, 1.0)), sc = lerp(1.25, 1, eo(sp)) + wobble(t - land, 0.05, 2.2, 6);
      ctx.save(); ctx.translate(893 + 700 * outP, sy); ctx.rotate(-0.10 + wobble(t - land, 0.05, 1.4, 4)); ctx.scale(sc, sc);
      card(ctx, -90, -26, 180, 52, 11, C.red, { blur: 14, oy: 6, shadow: 'rgba(2,25,59,0.2)' });
      txt(ctx, 'NO REFUNDS', 0, 10, { f: '900 25px Inter', c: '#FFF8EE', a: 'center', ls: 1 });
      ctx.restore();
    }
  }

  // ---------- action card + evidence envelope ----------
  const ACT = { x: 110, y: 640, w: 860, h: 360 };
  const ROWS = [['Keep the invoice', 'tick1'], ['Photograph the problem', 'tick2'], ['Request a refund in writing', 'tick3']];
  function drawAction(ctx, t) {
    if (t < E.toS5 + 0.22) return;
    const ap = spring(t - (E.toS5 + 0.22), 1.3, 0.72);
    ctx.save(); ctx.translate(0, (1 - ap) * 90); ctx.globalAlpha = clamp(ap * 1.6);
    card(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30, C.card, { blur: 38, oy: 14 });
    ctx.save(); rr(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(ACT.x, ACT.y, ACT.w, 12); ctx.restore();
    txt(ctx, 'Defective item? Do this:', ACT.x + 52, ACT.y + 88, { f: '800 46px Inter', maxW: ACT.w - 100 });
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
    txt(ctx, 'INVOICE', -w / 2 + 22, -h / 2 + 44, { f: '800 24px Inter', ls: 3 });
    ctx.fillStyle = C.navyFaint;
    for (let i = 0; i < 4; i++) { rr(ctx, -w / 2 + 22, -h / 2 + 70 + i * 30, i % 2 ? 120 : 170, 12, 6); ctx.fill(); }
    ctx.fillStyle = C.navy; ctx.fillRect(-w / 2 + 22, h / 2 - 76, w - 44, 3);
    txt(ctx, 'Total', -w / 2 + 22, h / 2 - 32, { f: '700 24px Inter', c: C.navySoft });
    txt(ctx, '₹499', w / 2 - 22, h / 2 - 30, { f: '800 30px Inter', a: 'right' });
  }
  function photoBody(ctx) {
    const w = 220, h = 236;
    card(ctx, -w / 2, -h / 2, w, h, 8, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    ctx.save(); rr(ctx, -w / 2 + 16, -h / 2 + 16, w - 32, 168, 4); ctx.fillStyle = C.paperDeep; ctx.fill(); ctx.clip();
    drawMug(ctx, -6, -h / 2 + 108, 0.36, { split: 1, shardT: 99 });
    ctx.restore();
    txt(ctx, 'Photo', 0, h / 2 - 16, { f: '700 22px Inter', c: C.navySoft, a: 'center' });
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
    if (t >= E.invoice) {
      const p = eo(P(t, E.invoice, E.invoice + 0.7));
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
    // written request
    if (t >= E.write) {
      const wp = P(t, E.write, E.write + 0.9);
      ctx.save(); setFont(ctx, 'italic 500 40px Inter', 0);
      const label = 'Refund request', tw = ctx.measureText(label).width, x0 = -tw / 2, by = h / 2 - 34;
      ctx.beginPath(); ctx.rect(x0 - 4, by - 50, (tw + 8) * wp, 70); ctx.clip();
      ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(label, x0, by);
      ctx.restore();
      if (wp < 1) {
        ctx.save(); setFont(ctx, 'italic 500 40px Inter', 0);
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
    drawMainMug(ctx, t);
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
