/* Courtlens · "Is this legal in India?" · Episode 08 (English, english-08): train 3+ hours late — full fare via TDR
 * Engine, palette, captions and motion are the accepted feedback-01 renderer
 * (../../2026-11-02-feedback-round/src/scene.js), via the english-07 copy; only episode performers and copy differ.
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

  // ---------- departure board (the performer) + phone (the "just cancel" side) ----------
  const FLAPS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function flapText(from, to, p, t) {                // split-flap scramble that settles left to right
    const n = Math.max(from.length, to.length); let out = '';
    for (let i = 0; i < n; i++) {
      const settle = (i + 1) / (n + 1);
      if (p >= settle) out += to[i] || ' ';
      else if (p <= 0) out += from[i] || ' ';
      else out += FLAPS[(Math.floor(t * 24) * 7 + i * 13) % FLAPS.length];
    }
    return out;
  }
  function boardBody(ctx, o) {
    const st = o.state || 'ontime', fp = o.flipP ?? 0, mini = !!o.noShadow, late = st === 'late';
    // posts + base
    ctx.fillStyle = C.navy; rr(ctx, -112, 40, 16, 96, 6); ctx.fill(); rr(ctx, 96, 40, 16, 96, 6); ctx.fill();
    rr(ctx, -140, 128, 280, 16, 8); ctx.fill();
    // board
    rr(ctx, -158, -128, 316, 182, 18); ctx.fillStyle = C.navy; ctx.fill();
    ctx.strokeStyle = '#0B2E5C'; ctx.lineWidth = 6; ctx.stroke();
    if (mini) {                                      // icon version: a status bar only
      rr(ctx, -128, -20, 256, 46, 8); ctx.fillStyle = late ? C.red : C.cyan; ctx.fill();
      return;
    }
    txt(ctx, 'DEPARTURES', -132, -94, { f: '800 20px Inter', c: C.cyan, ls: 4 });
    txt(ctx, 'PF 3', 132, -94, { f: '800 20px Inter', c: 'rgba(255,248,238,0.7)', a: 'right', ls: 2 });
    txt(ctx, '18:00', -132, -50, { f: '800 30px Inter', c: C.gold });
    txt(ctx, 'EXPRESS', 132, -52, { f: '800 24px Inter', c: '#FFF8EE', a: 'right', ls: 2 });
    // status row (split-flap tiles)
    const s0 = 'ON TIME', s1 = 'LATE 4H 10M';
    const show = st === 'ontime' ? s0 : (late ? s1 : flapText(s0, s1, fp, o.t ?? 0));
    const n = s1.length, tw = 22, gap = 2.6, x0 = -(n * (tw + gap)) / 2;
    for (let i = 0; i < n; i++) {
      const ch = show[i] || ' ', x = x0 + i * (tw + gap);
      rr(ctx, x, -24, tw, 50, 4); ctx.fillStyle = '#0A2F5F'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, 0, tw, 1.5);
      const col = st === 'ontime' ? C.cyan : (late || (fp >= (i + 1) / (n + 1)) ? '#FF8E73' : '#FFF8EE');
      txt(ctx, ch, x + tw / 2, 14, { f: '800 30px Inter', c: col, a: 'center' });
    }
  }
  function phoneBody(ctx, o) {                       // ticket app: the "just press cancel" route
    rr(ctx, -92, -150, 184, 290, 28); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -80, -126, 160, 246, 16); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    rr(ctx, -22, -142, 44, 8, 4); ctx.fillStyle = 'rgba(255,248,238,0.5)'; ctx.fill();
    txt(ctx, 'Cancel ticket?', 0, -84, { f: '800 22px Inter', a: 'center', maxW: 150 });
    txt(ctx, 'Refund', 0, -36, { f: '700 20px Inter', a: 'center', c: C.navySoft });
    txt(ctx, '₹0', 0, 6, { f: '800 40px Inter', a: 'center', c: C.redDark });
    rr(ctx, -62, 40, 124, 44, 22); ctx.fillStyle = C.red; ctx.fill();
    txt(ctx, 'Cancel', 0, 70, { f: '800 22px Inter', a: 'center', c: '#FFF8EE' });
  }
  function drawPerformer(ctx, x, y, s, o = {}) {   // draws the episode performer (board or phone)
    const alpha = o.alpha ?? 1;
    if (alpha <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    if (!o.noShadow) {
      const lift = o.lift || 0, k = 1 - clamp(lift / 700) * 0.6;
      ctx.save(); ctx.translate(0, 150); ctx.scale(1, 0.13);
      const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 190 * k);
      g.addColorStop(0, `rgba(2,25,59,${0.20 * k})`); g.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 190 * k, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.translate(0, -(o.lift || 0));
    if (o.squash) { ctx.translate(0, 140); ctx.scale(1 / o.squash, o.squash); ctx.translate(0, -140); }
    if (o.phone) phoneBody(ctx, o); else boardBody(ctx, o);
    if (o.warn && !o.noShadow) {                     // warning sign once the delay shows
      const k = spring(o.warnT ?? 9, 1.8, 0.5);
      ctx.save(); ctx.translate(-196, -40); ctx.scale(k, k);   // left of the board: clear of the rule card above
      ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(24, 18); ctx.lineTo(-24, 18); ctx.closePath();
      ctx.fillStyle = C.red; ctx.fill(); ctx.strokeStyle = C.redDark; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
      rr(ctx, -3, -10, 6, 16, 3); ctx.fillStyle = '#FFF8EE'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 12, 3.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function performerState(t) {                             // shared S1 state for the main board
    return { state: t >= E.sneak ? 'late' : (t >= E.sneakStart ? 'flip' : 'ontime'), flipP: P(t, E.sneakStart, E.sneak) };
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

  // ---------- e-ticket card (same frame/motion as the accepted order card) ----------
  function crossBadge(ctx, x, y, color) {             // drawn "x" box (shape, not a glyph)
    rr(ctx, x, y, 34, 34, 7); ctx.fillStyle = color; ctx.fill();
    cross(ctx, x + 17, y + 17, 0.62, '#FFF8EE', 5);
  }
  function orderCardBody(ctx, t) {
    const w = 800, h = 320, hit = t >= E.sneak;
    card(ctx, 0, 0, w, h, 30, C.card);
    txt(ctx, 'E-TICKET · CONFIRMED', 44, 62, { f: '700 27px Inter', c: C.navySoft, ls: 3, maxW: 400 });
    setFont(ctx, '800 27px Inter', 1);
    const pill = hit ? 'Late 4h 10m' : 'On time', pw = ctx.measureText(pill).width + 76, px = w - 44 - pw;
    const pop = hit ? 1 + wobble(t - E.sneak, 0.12, 2.2, 6) : 1;
    ctx.save(); ctx.translate(px + pw / 2, 52); ctx.scale(pop, pop); ctx.translate(-(px + pw / 2), -52);
    rr(ctx, px, 30, pw, 46, 23); ctx.fillStyle = hit ? C.redTint : C.cyanTint; ctx.fill();
    ctx.beginPath(); ctx.arc(px + 28, 53, 8, 0, Math.PI * 2); ctx.fillStyle = hit ? C.red : C.cyanDark; ctx.fill();
    txt(ctx, pill, px + 48, 63, { f: '800 27px Inter', c: hit ? C.redDark : C.cyanDark, ls: 1 });
    ctx.restore();
    rr(ctx, 44, 98, 96, 96, 20); ctx.fillStyle = C.paperDeep; ctx.fill();
    drawPerformer(ctx, 92, 150, 0.25, { noShadow: true, state: hit ? 'late' : 'ontime' });
    txt(ctx, 'Pune → Nagpur', 168, 144, { f: '800 46px Inter', maxW: 380 });
    txt(ctx, 'Express · 3A · departs 18:00', 168, 184, { f: '600 27px Inter', c: C.navySoft, maxW: 420 });
    txt(ctx, '₹1,450', w - 44, 146, { f: '800 50px Inter', a: 'right' });
    // the status line: the tiny clause this episode turns on
    const hp = eio(P(t, E.quoteMark, E.quoteMark + 0.4)), qpop = 1 + wobble(t - E.quoteMark - 0.35, 0.03, 2.2, 6);
    const ip = hit ? spring(t - E.sneak, 2.0, 0.55) : 0;
    ctx.save(); ctx.translate(w / 2, 258); ctx.scale(qpop, qpop); ctx.translate(-w / 2, -258);
    rr(ctx, 44, 222, w - 88, 72, 14); ctx.fillStyle = hit ? C.redTint : C.paper; ctx.fill();
    ctx.setLineDash([10, 8]); ctx.strokeStyle = hit ? 'rgba(181,67,47,0.55)' : 'rgba(2,25,59,0.3)'; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
    if (hp > 0) { ctx.save(); rr(ctx, 44, 222, w - 88, 72, 14); ctx.clip(); ctx.fillStyle = C.cyanMark; ctx.fillRect(44, 222, (w - 88) * hp, 72); ctx.restore(); }
    if (hit) {                                        // the delay prints in
      ctx.save(); ctx.translate(w / 2, 258); ctx.scale(lerp(0.85, 1, ip), lerp(0.85, 1, ip)); ctx.translate(-w / 2, -258); ctx.globalAlpha *= clamp(ip * 1.5);
      crossBadge(ctx, 74, 241, C.red);
      txt(ctx, 'Running 4h 10m late · expected 22:10', 128, 270, { f: '800 33px Inter', c: C.redDark, maxW: w - 210 });
      ctx.restore();
    } else {
      txt(ctx, 'Status: on time', 84, 270, { f: '700 32px Inter', c: C.navySoft });
    }
    ctx.restore();
  }
  function orderState(t) {
    const enter = spring(t - E.cardIn, 1.25, 0.66);
    let cx = 540, cy = 815 + (1 - enter) * 160, s = 1, alpha = clamp(enter * 1.6);
    // curved path: right first, then down, so the shrinking card never crosses the cart
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
      txt(ctx, '₹1,450 gone?', -w / 2 + 92, 14, { f: '800 38px Inter', c: C.redDark, maxW: w - 112 });
    } else {
      card(ctx, -w / 2, -h / 2, w, h, 46, C.cyan, { blur: 22, oy: 8 });
      ctx.beginPath(); ctx.arc(-w / 2 + 50, 0, 25, 0, Math.PI * 2); ctx.fillStyle = C.card; ctx.fill();
      check(ctx, -w / 2 + 50, 1, 1.15, C.navy, 5);
      txt(ctx, 'Full fare back', -w / 2 + 90, 13, { f: '800 36px Inter', c: C.navy, maxW: w - 110 });
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
    txt(ctx, 'CANCEL NOW?', 0, 82, { f: '700 24px Inter', c: 'rgba(255,248,238,0.86)', a: 'center', ls: 3 });
    txt(ctx, 'Refund: ₹0', 0, 160, { f: '800 70px Inter', c: '#FFF8EE', a: 'center', maxW: 556 });
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
    txt(ctx, 'INDIA · RAILWAY REFUND RULES', 52, 60, { f: '800 27px Inter', c: C.cyanDark, ls: 3, maxW: w - 100 });
    const r1 = eo(P(t, E.rule1, E.rule1 + 0.4)), r2 = eo(P(t, E.rule2, E.rule2 + 0.4)), r3 = eo(P(t, E.rule3, E.rule3 + 0.4));
    txt(ctx, 'Train more than 3 hours late?', 52 + (1 - r1) * 24, 124, { f: '600 41px Inter', maxW: w - 96, alpha: r1 });
    txt(ctx, 'And you don’t travel:', 52 + (1 - r2) * 24, 180, { f: '600 41px Inter', maxW: w - 96, alpha: r2 });
    ctx.save(); ctx.globalAlpha *= r3; ctx.translate(0, (1 - r3) * 14);
    const chips = [['full fare back', E.chip1], ['no cancellation charge', E.chip2]];
    const pad = 34, gap = 14; let fs = 38;
    for (; fs > 24; fs -= 1) {                          // three chips must fit the card width
      setFont(ctx, `800 ${fs}px Inter`, 0);
      if (chips.reduce((acc, [l]) => acc + ctx.measureText(l).width + pad, 0) + gap * (chips.length - 1) <= w - 104) break;
    }
    let x = 52;
    for (const [label, tc] of chips) {
      setFont(ctx, `800 ${fs}px Inter`, 0);
      const cw = ctx.measureText(label).width + pad, cy = 206, ch = 64;
      const hp = eio(P(t, tc, tc + 0.32));
      const pop = 1 + wobble(t - tc - 0.25, 0.06, 2.2, 6);
      ctx.save(); ctx.translate(x + cw / 2, cy + ch / 2); ctx.scale(pop, pop); ctx.translate(-(x + cw / 2), -(cy + ch / 2));
      rr(ctx, x, cy, cw, ch, 16); ctx.fillStyle = C.paper; ctx.fill(); ctx.strokeStyle = C.navyFaint; ctx.lineWidth = 3; ctx.stroke();
      if (hp > 0) { ctx.save(); rr(ctx, x, cy, cw, ch, 16); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(x, cy, cw * hp, ch); ctx.restore(); }
      txt(ctx, label, x + pad / 2, cy + ch / 2 + fs * 0.36, { f: `800 ${fs}px Inter` });
      ctx.restore();
      x += cw + gap;
    }
    ctx.restore();
    ctx.restore();
  }
  function resultBody(ctx, w, h, kind, a) {
    ctx.save(); ctx.globalAlpha *= a;
    if (kind === 'left') {
      txt(ctx, 'TDR: LATE 3H+', 30, 56, { f: '800 24px Inter', c: 'rgba(2,25,59,0.78)', ls: 3, maxW: w - 56 });
      txt(ctx, '₹1,450 back', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, 'full fare', 30, 164, { f: '800 36px Inter', maxW: w - 56 });
    } else {
      txt(ctx, 'USUAL CANCEL', 30, 56, { f: '800 24px Inter', c: C.navySoft, ls: 3, maxW: w - 56 });
      txt(ctx, '1 hour before', 30, 118, { f: '800 36px Inter', maxW: w - 56 });
      txt(ctx, 'refund ₹0', 30, 164, { f: '800 36px Inter', c: C.redDark, maxW: w - 56 });
    }
    ctx.restore();
  }
  function drawRule(ctx, t) {
    if (t < E.ruleIn) return;
    const enter = spring(t - E.ruleIn, 1.15, 0.72);
    const m = eio(P(t, E.toS4 + 0.1, E.toS4 + 0.8));          // morph to left result
    const out = eio(P(t, E.toS5, E.toS5 + 0.42));            // exit left with the board
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

  // ---------- main item (the departure board) across S1–S4 ----------
  function drawMainItem(ctx, t) {
    if (t < E.itemDrop) return;
    const dp = P(t, E.itemDrop, E.itemLand);
    const lift = 260 * (1 - dp * dp);              // stays hidden behind the card while dropping
    const dl = t - E.itemLand;
    const squash = dl > 0 ? 1 - 0.075 * Math.exp(-dl * 7) * Math.cos(dl * 24) : 1;
    let x = 540, y = 1235, s = 1.15;                // same footprint as the round-02 bottle
    const a = eio(P(t, E.toS2, E.toS2 + 0.65)); x = lerp(x, 290, a); y = lerp(y, 1310, a); s = lerp(s, 0.78, a);
    const b = eio(P(t, E.toS4, E.toS4 + 0.75)); x = lerp(x, 297, b); y = lerp(y, 1285, b); s = lerp(s, 0.72, b);
    const c = eio(P(t, E.toS5, E.toS5 + 0.42)); x = lerp(x, -420, c);
    drawPerformer(ctx, x, y, s, { lift, squash, ...performerState(t), warn: t >= E.sneak, warnT: t - E.sneak, t });
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
      txt(ctx, l1, cx, 714, { f: '800 34px Inter', a: 'center', maxW: 410 });
      txt(ctx, l2, cx, 760, { f: '800 34px Inter', a: 'center', maxW: 410 });
      rr(ctx, cx - 40, 780, 80, 8, 4); ctx.fillStyle = accent; ctx.fill();
      ctx.restore();
    };
    hdr(297, 'File a TDR', '(train late)', C.cyan, -700 * outP);
    hdr(757, 'Just press', 'cancel', 'rgba(2,25,59,0.35)', 700 * outP);
    // right column: the ticket app's cancel button + thought bubble
    const rm = spring(t - E.rightItem, 1.2, 0.68);
    const rx = lerp(1320, 740, rm) + 700 * outP;
    if (t >= E.rightItem) drawPerformer(ctx, rx, 1285, 0.72, { phone: true, t });
    const bp = spring(t - E.bubble, 1.6, 0.55);
    if (t >= E.bubble) {
      ctx.save(); ctx.translate(866 + 700 * outP, 1110); ctx.scale(bp, bp);
      card(ctx, -96, -36, 192, 72, 36, C.card, { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
      txt(ctx, 'Just cancel?', 0, 10, { f: '700 28px Inter', a: 'center', maxW: 168 });
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
    // the sign's "₹0" returns as a sticker on the cancel side
    if (t >= E.sticker) {
      const sp = P(t, E.sticker, E.sticker + 0.4), land = E.sticker + 0.4;
      const sc = lerp(1.35, 1, eob(sp, 1.2)) + wobble(t - land, 0.05, 2.2, 6);   // pops in place: never crosses the header
      ctx.save(); ctx.globalAlpha = clamp(sp * 3); ctx.translate(880 + 700 * outP, 836); ctx.rotate(-0.10 + wobble(t - land, 0.05, 1.4, 4)); ctx.scale(sc, sc);
      card(ctx, -100, -26, 200, 52, 11, C.red, { blur: 14, oy: 6, shadow: 'rgba(2,25,59,0.2)' });
      txt(ctx, 'Refund: ₹0', 0, 9, { f: '800 24px Inter', c: '#FFF8EE', a: 'center', maxW: 176 });
      ctx.restore();
    }
  }

  // ---------- action card + evidence envelope ----------
  const ACT = { x: 110, y: 640, w: 860, h: 360 };
  const ROWS = [['Don’t press Cancel', 'tick1'], ['File TDR: “train late”', 'tick2'], ['Before it actually leaves', 'tick3']];
  function drawAction(ctx, t) {
    if (t < E.toS5 + 0.22) return;
    const ap = spring(t - (E.toS5 + 0.22), 1.3, 0.72);
    ctx.save(); ctx.translate(0, (1 - ap) * 90); ctx.globalAlpha = clamp(ap * 1.6);
    card(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30, C.card, { blur: 38, oy: 14 });
    ctx.save(); rr(ctx, ACT.x, ACT.y, ACT.w, ACT.h, 30); ctx.clip(); ctx.fillStyle = C.cyan; ctx.fillRect(ACT.x, ACT.y, ACT.w, 12); ctx.restore();
    txt(ctx, 'Train 3h+ late? Do this:', ACT.x + 52, ACT.y + 88, { f: '800 46px Inter', maxW: ACT.w - 100 });
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
  function invoiceBody(ctx) {                         // the e-ticket (kept for the TDR)
    const w = 228, h = 276;
    card(ctx, -w / 2, -h / 2, w, h, 10, '#FFFFFF', { stroke: C.navy, lw: 3, blur: 16, oy: 6 });
    txt(ctx, 'E-TICKET', -w / 2 + 20, -h / 2 + 42, { f: '800 21px Inter', ls: 3, maxW: w - 40 });
    const rows = [['Class', '3A', 0], ['Status', 'CNF', 0], ['Departs', '18:00', 1]];
    rows.forEach(([l, v, bad], i) => {
      const y = -h / 2 + 86 + i * 36;
      if (bad) { rr(ctx, -w / 2 + 12, y - 25, w - 24, 34, 6); ctx.fillStyle = C.redTint; ctx.fill(); }
      txt(ctx, l, -w / 2 + 20, y, { f: `${bad ? 800 : 700} 21px Inter`, c: bad ? C.redDark : C.navySoft });
      txt(ctx, v, w / 2 - 20, y, { f: `${bad ? 800 : 700} 21px Inter`, c: bad ? C.redDark : C.navySoft, a: 'right' });
    });
    ctx.fillStyle = C.navy; ctx.fillRect(-w / 2 + 20, h / 2 - 76, w - 40, 3);
    txt(ctx, 'Fare', -w / 2 + 20, h / 2 - 32, { f: '700 22px Inter', c: C.navySoft });
    txt(ctx, '₹1,450', w / 2 - 20, h / 2 - 30, { f: '800 30px Inter', a: 'right' });
  }
  function photoBody(ctx) {                           // screenshot of the running status
    const w = 196, h = 260;
    card(ctx, -w / 2, -h / 2, w, h, 26, C.navy, { blur: 16, oy: 6 });
    rr(ctx, -w / 2 + 12, -h / 2 + 30, w - 24, h - 64, 12); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    rr(ctx, -24, -h / 2 + 12, 48, 8, 4); ctx.fillStyle = 'rgba(255,248,238,0.5)'; ctx.fill();
    txt(ctx, 'Running status', -w / 2 + 26, -h / 2 + 62, { f: '700 18px Inter', c: C.navySoft });
    rr(ctx, -w / 2 + 24, -h / 2 + 76, w - 48, 92, 14); ctx.fillStyle = C.redTint; ctx.fill();
    txt(ctx, 'Late', -w / 2 + 38, -h / 2 + 112, { f: '800 26px Inter', c: C.redDark });
    txt(ctx, '4h 10m', -w / 2 + 38, -h / 2 + 150, { f: '800 30px Inter', c: C.redDark });
    ctx.fillStyle = C.navyFaint; rr(ctx, -w / 2 + 24, -h / 2 + 180, 120, 10, 5); ctx.fill(); rr(ctx, -w / 2 + 24, -h / 2 + 198, 90, 10, 5); ctx.fill();
    txt(ctx, 'SCREENSHOT', 0, h / 2 - 12, { f: '800 17px Inter', c: '#FFF8EE', a: 'center', ls: 2 });
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
      const label = 'TDR · train late', wp = eio(P(t, E.write, E.write + 0.45));
      ctx.save(); setFont(ctx, '700 42px Inter', 0);
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
        const core = w.replace(/[.,;:?!”]+$/, '');
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
