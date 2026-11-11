/* Courtlens · "Is this legal in India?" · Episode 12 (English, english-12): can a landlord enter your rented home?
 * Jurisdiction: Tamil Nadu (TN Act 42 of 2017, s.17). First episode under context/09-feedback-rules-2026-11-11.md.
 * Same identity as the accepted renderer: ivory paper, navy type, Courtlens cyan accent, Inter, grain,
 * keyword-marker captions, icon CTA. New per feedback: one visual idea at a time, large brief labels,
 * sequential reveals, depth and lighting, captions inside x 100..900.
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
    night: '#0B2148',
  };
  let TL, E, ICON, GRAIN;

  // ---------- math ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eio = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eo = x => 1 - Math.pow(1 - x, 3);
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
  function badge(ctx, x, y, k, ok) {                 // round tick / cross badge
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ok ? C.cyan : C.red; ctx.fill();
    if (ok) check(ctx, 0, 1, 1.6, C.navy, 6); else cross(ctx, 0, 0, 1.3, '#FFF8EE', 7);
    ctx.restore();
  }

  // ---------- background with soft lighting ----------
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); const id = g.createImageData(W, H);
    let s = 20261111 >>> 0;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
    for (let i = 0; i < W * H; i++) {
      const v = rnd(), dark = rnd() < 0.55;
      id.data[i * 4] = dark ? 70 : 255; id.data[i * 4 + 1] = dark ? 60 : 252; id.data[i * 4 + 2] = dark ? 45 : 244;
      id.data[i * 4 + 3] = Math.floor(v * v * 20);
    }
    g.putImageData(id, 0, 0);
    return c;
  }
  function background(ctx, nightK = 0) {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(CX, 1040, 200, CX, 1040, 1250);
    g.addColorStop(0, 'rgba(255,252,245,0.6)'); g.addColorStop(1, 'rgba(196,178,148,0.36)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(GRAIN, 0, 0);
  }

  // ---------- props ----------
  function key(ctx, x, y, rot, s) {                  // brass key: bow + shaft + teeth (shapes)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    ctx.beginPath(); ctx.arc(60, 0, 30, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(60, 0, 11, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill();
    rr(ctx, -70, -8, 104, 16, 6); ctx.fillStyle = C.gold; ctx.fill();
    ctx.fillRect(-64, 6, 12, 14); ctx.fillRect(-44, 6, 9, 10); ctx.fillRect(-28, 6, 12, 16);
    ctx.strokeStyle = 'rgba(2,25,59,0.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(60, 0, 30, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // a door seen from the hallway: hinge on the left, opening inward; open 0..1
  function hallway(ctx, floorY) {                   // full-width wall and floor with soft depth (no hard edges)
    const wg = ctx.createLinearGradient(0, floorY - 900, 0, floorY);
    wg.addColorStop(0, 'rgba(2,25,59,0.00)'); wg.addColorStop(1, 'rgba(2,25,59,0.07)');
    ctx.fillStyle = wg; ctx.fillRect(0, floorY - 900, W, 900);
    const fg = ctx.createLinearGradient(0, floorY, 0, H);
    fg.addColorStop(0, 'rgba(2,25,59,0.13)'); fg.addColorStop(1, 'rgba(2,25,59,0.03)');
    ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H - floorY);
    const v = ctx.createRadialGradient(CX, floorY - 300, 300, CX, floorY - 300, 1100);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,25,59,0.10)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  function doorFront(ctx, cx, cy, s, open, o = {}) {
    const w = 330, h = 600, x0 = -w / 2, y0 = -h / 2;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    // wall + floor depth
    // doorway interior (warm room light) revealed as the door opens
    const roomLight = o.night ? '#1A2F5A' : C.warm;
    rr(ctx, x0, y0, w, h, 6); ctx.fillStyle = open > 0.01 ? roomLight : C.navy; ctx.fill();
    if (open > 0.01 && !o.night) {
      // light spilling onto the hallway floor
      ctx.save(); ctx.globalAlpha = Math.min(1, 0.8 * open + (o.spill || 0));
      const sp = ctx.createLinearGradient(0, h / 2, 0, h / 2 + 300);
      sp.addColorStop(0, 'rgba(246,217,160,0.95)'); sp.addColorStop(1, 'rgba(246,217,160,0)');
      ctx.beginPath(); ctx.moveTo(x0, h / 2); ctx.lineTo(x0 + w, h / 2); ctx.lineTo(x0 + w + 160 * open, h / 2 + 300); ctx.lineTo(x0 - 160 * open, h / 2 + 300); ctx.closePath();
      ctx.fillStyle = sp; ctx.fill(); ctx.restore();
      // a lamp inside the room
      ctx.save(); ctx.globalAlpha = clamp(open * 1.4);
      ctx.beginPath(); ctx.moveTo(60, -40); ctx.lineTo(110, -40); ctx.lineTo(126, 10); ctx.lineTo(44, 10); ctx.closePath(); ctx.fillStyle = C.gold; ctx.fill();
      ctx.fillStyle = 'rgba(2,25,59,0.55)'; ctx.fillRect(83, 10, 4, 150); ctx.fillRect(60, 160, 50, 8);
      ctx.restore();
    }
    // door panel: hinge at left edge, free edge recedes as it swings in
    const a = open * 1.3, wp = w * Math.cos(a), inset = 26 * Math.sin(a);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + wp, y0 + inset); ctx.lineTo(x0 + wp, -y0 - inset); ctx.lineTo(x0, -y0); ctx.closePath();
    ctx.fillStyle = o.night ? '#16305E' : '#1B3A6B'; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.stroke();
    // panel details (only while mostly closed)
    if (open < 0.35) {
      const k = 1 - open / 0.35;
      ctx.save(); ctx.globalAlpha *= k; ctx.strokeStyle = 'rgba(255,248,238,0.18)'; ctx.lineWidth = 4;
      rr(ctx, x0 + 40, y0 + 50, w - 80, 210, 8); ctx.stroke(); rr(ctx, x0 + 40, y0 + 310, w - 80, 230, 8); ctx.stroke();
      // number plate
      rr(ctx, -40, y0 + 18, 80, 30, 6); ctx.fillStyle = C.gold; ctx.fill();
      txt(ctx, '3B', 0, y0 + 41, { f: '800 22px Inter', a: 'center', c: C.navy });
      // knob + keyhole
      ctx.beginPath(); ctx.arc(x0 + w - 52, 10, 17, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
      ctx.beginPath(); ctx.arc(x0 + w - 52, 58, 9, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
      ctx.fillRect(x0 + w - 55, 60, 6, 14);
      ctx.restore();
    }
    // frame
    ctx.strokeStyle = C.navy; ctx.lineWidth = 14; rr(ctx, x0 - 7, y0 - 7, w + 14, h + 14, 8); ctx.stroke();
    ctx.restore();
  }
  function tenant(ctx, x, y, s, look) {              // simple seated figure with a laptop (pictogram)
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -150, 40, 300, 90, 30); ctx.fillStyle = C.cyanTint; ctx.fill();          // sofa
    rr(ctx, -170, 10, 40, 120, 20); ctx.fill(); rr(ctx, 130, 10, 40, 120, 20); ctx.fill();
    rr(ctx, -46, -40, 92, 100, 40); ctx.fillStyle = C.navy; ctx.fill();               // body
    ctx.save(); ctx.translate(0, -78); ctx.rotate(-0.35 * look);
    ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    rr(ctx, -40, 18, 80, 10, 4); ctx.fillStyle = C.gold; ctx.fill();               // laptop
    rr(ctx, -34, -22, 68, 42, 4); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    ctx.restore();
  }
  function stampCard(ctx, cx, cy, k, sub) {          // "TAMIL NADU" jurisdiction stamp
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -330, -150, 660, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -300, -120, 600, 240, 20); ctx.stroke();
    txt(ctx, 'TAMIL NADU', 0, 22, { f: '900 96px Inter', a: 'center', c: C.navy, ls: 2, maxW: 560 });
    if (sub > 0) txt(ctx, 'Tenancy Act 2017 · s.17', 0, 88, { f: '700 34px Inter', a: 'center', c: C.cyanDark, alpha: sub });
    ctx.restore();
  }
  function iconWrench(ctx) {
    ctx.save(); ctx.rotate(-0.7);
    rr(ctx, -12, -10, 24, 110, 10); ctx.fillStyle = C.navy; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -30, 38, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-16, -78); ctx.lineTo(16, -78); ctx.lineTo(12, -38); ctx.lineTo(-12, -38); ctx.closePath(); ctx.fillStyle = C.card; ctx.fill();
    ctx.restore();
  }
  function iconLens(ctx) {
    ctx.beginPath(); ctx.arc(-14, -14, 42, 0, Math.PI * 2); ctx.lineWidth = 14; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.save(); ctx.rotate(0.78); rr(ctx, 40, -10, 70, 20, 10); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
  }
  function iconDoc(ctx) {
    rr(ctx, -46, -62, 92, 124, 10); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = C.navy; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 4; i++) { rr(ctx, -30, -38 + i * 22, i === 3 ? 34 : 60, 9, 4); ctx.fill(); }
    check(ctx, 22, 38, 1.0, C.cyanDark, 6);
  }
  function notice(ctx, cx, cy, k, fields) {          // the written notice, with its three required items
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    card(ctx, -230, -300, 460, 600, 18, '#FFFFFF', { blur: 40, oy: 18, stroke: C.navy, lw: 4 });
    txt(ctx, 'NOTICE', 0, -220, { f: '900 56px Inter', a: 'center', ls: 6 });
    ctx.fillStyle = C.cyan; ctx.fillRect(-60, -196, 120, 8);
    if (fields) {
      const items = [['WHY', fields[0]], ['DAY', fields[1]], ['TIME', fields[2]]];
      items.forEach(([l, p], i) => {
        const y = -110 + i * 120;
        rr(ctx, -180, y - 50, 360, 92, 16); ctx.fillStyle = p > 0 ? C.cyanTint : C.paper; ctx.fill();
        txt(ctx, l, -150, y + 14, { f: '900 48px Inter', c: p > 0 ? C.navy : C.navySoft, ls: 2 });
        if (p > 0) badge(ctx, 128, y - 4, spring(p, 2.2, 0.5) * 0.85, true);
      });
    } else {
      ctx.fillStyle = C.navyFaint; for (let i = 0; i < 6; i++) { rr(ctx, -170, -140 + i * 56, i % 3 === 2 ? 220 : 340, 16, 8); ctx.fill(); }
    }
    ctx.restore();
  }
  function ring24(ctx, cx, cy, p) {                  // 24-hour notice ring filling
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.lineWidth = 28; ctx.strokeStyle = C.navyFaint; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 150, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * p); ctx.strokeStyle = C.cyan; ctx.lineCap = 'round'; ctx.stroke();
    txt(ctx, String(Math.round(24 * p)), 0, 26, { f: '900 110px Inter', a: 'center' });
    txt(ctx, 'HOURS', 0, 82, { f: '800 34px Inter', a: 'center', c: C.navySoft, ls: 4 });
    ctx.restore();
  }
  function dial(ctx, cx, cy, arcP, hand) {           // 24-hour day dial: 7 am–8 pm window lights up
    ctx.save(); ctx.translate(cx, cy);
    card(ctx, -190, -190, 380, 380, 190, C.card, { blur: 30, oy: 12 });
    const ang = h => -Math.PI / 2 + (h / 24) * 2 * Math.PI;
    for (let h = 0; h < 24; h++) {
      const a = ang(h), r1 = h % 6 === 0 ? 132 : 146;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a) * 160, Math.sin(a) * 160);
      ctx.strokeStyle = C.navySoft; ctx.lineWidth = h % 6 === 0 ? 6 : 3; ctx.stroke();
    }
    if (arcP > 0) {
      ctx.beginPath(); ctx.arc(0, 0, 112, ang(7), ang(7 + 13 * arcP)); ctx.lineWidth = 38; ctx.strokeStyle = C.cyan; ctx.lineCap = 'butt'; ctx.stroke();
    }
    // night half shading
    ctx.beginPath(); ctx.arc(0, 0, 70, ang(20), ang(31)); ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(11,33,72,0.35)'; ctx.stroke();
    if (hand !== null) {
      const a = ang(hand); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); ctx.strokeStyle = C.navy; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
    }
    ctx.restore();
  }
  function sun(ctx, x, y) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.strokeStyle = C.gold; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke(); } ctx.restore(); }
  function moon(ctx, x, y) { ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fillStyle = '#F3DFB5'; ctx.fill();
    ctx.beginPath(); ctx.arc(16, -10, 32, 0, Math.PI * 2); ctx.fillStyle = C.night; ctx.fill(); ctx.restore(); }
  function courthouse(ctx, cx, cy, s, gavelK) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-220, -120); ctx.lineTo(0, -230); ctx.lineTo(220, -120); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    rr(ctx, -230, -120, 460, 26, 6); ctx.fill();
    for (let i = 0; i < 5; i++) { rr(ctx, -190 + i * 88, -84, 40, 200, 8); ctx.fill(); }
    rr(ctx, -250, 124, 500, 34, 8); ctx.fill();
    // gavel strikes on cue
    const k = gavelK;
    ctx.save(); ctx.translate(210, 40); ctx.rotate(-0.9 + 0.9 * k);
    rr(ctx, -6, -150, 12, 130, 6); ctx.fillStyle = C.gold; ctx.fill(); rr(ctx, -46, -178, 92, 46, 12); ctx.fill();
    ctx.restore();
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

  // V1 — hook: key turns, door swings open
  function v1(ctx, t) {
    const w = win(t, -1, E.v2 + 0.45, 0, 0.45);
    if (w.a <= 0) return;
    const zoom = 1 + 1.6 * eio(P(t, E.v2 - 0.1, E.v2 + 0.45));            // push through the doorway into V2
    ctx.save(); ctx.globalAlpha = w.a;
    ctx.beginPath(); ctx.rect(0, 560, W, H - 560); ctx.clip();          // keep the push-through below the caption band
    ctx.translate(CX, 1060); ctx.scale(zoom, zoom); ctx.translate(-CX, -1060);
    hallway(ctx, 1360);
    const open = eio(P(t, E.doorOpen, E.doorOpen + 1.1));
    doorFront(ctx, CX, 1060, 1.0, open);
    // key: slides in, turns, then leaves with the door
    const kin = eo(P(t, E.keyIn, E.keyIn + 0.5)), turn = eio(P(t, E.keyTurn, E.keyTurn + 0.3));
    const kx = CX + 165 - 52 + lerp(380, 70, kin), ky = 1060 + 58;
    if (open < 0.2) { ctx.save(); ctx.globalAlpha *= 1 - open * 5; ctx.translate(kx, ky); ctx.scale(1, lerp(1, 0.3, turn)); key(ctx, 0, 0, 0, 1.0); ctx.restore(); }
    ctx.restore();
  }
  // V2 — escalation: inside, a shadow falls across the room
  function v2(ctx, t) {
    withScene(ctx, win(t, E.v2, E.v3), () => {
      // room: floor + far wall
      const rg = ctx.createLinearGradient(0, 600, 0, 1560);                 // warm room light with soft edges
      rg.addColorStop(0, 'rgba(246,217,160,0)'); rg.addColorStop(0.12, 'rgba(246,217,160,0.38)');
      rg.addColorStop(0.85, 'rgba(246,217,160,0.32)'); rg.addColorStop(1, 'rgba(246,217,160,0)');
      ctx.fillStyle = rg; ctx.fillRect(0, 600, W, 960);
      const fl = ctx.createLinearGradient(0, 1290, 0, 1560);
      fl.addColorStop(0, 'rgba(2,25,59,0.08)'); fl.addColorStop(1, 'rgba(2,25,59,0)');
      ctx.fillStyle = fl; ctx.fillRect(0, 1290, W, 270);
      tenant(ctx, CX + 70, 1180, 1.2, eio(P(t, E.look, E.look + 0.4)));
      // the door edge at the left, opening, with a long landlord shadow sliding across the floor
      const sp = eio(P(t, E.shadow, E.shadow + 1.0));
      ctx.save(); ctx.globalAlpha *= 0.32 * sp;
      ctx.beginPath(); ctx.moveTo(110, 1490); ctx.lineTo(150, 1000); ctx.lineTo(230, 1000); ctx.lineTo(110 + 520 * sp, 1490); ctx.closePath();
      ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
      ctx.fillStyle = '#1B3A6B'; ctx.fillRect(60, 640, 46, 860);
      rr(ctx, 100, 980, 18, 18, 9); ctx.fillStyle = C.gold; ctx.fill();
      if (t >= E.qmark) {
        const k = spring(t - E.qmark, 1.8, 0.5);
        ctx.save(); ctx.translate(CX + 220, 900); ctx.scale(k, k);
        ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
        txt(ctx, '?', 0, 32, { f: '900 92px Inter', a: 'center', c: '#FFF8EE' });
        ctx.restore();
      }
    });
    // series identity chip (only here, under the question)
    const cw = win(t, E.v2 + 0.2, E.v3);
    if (cw.a > 0) {
      ctx.save(); ctx.globalAlpha = cw.a;
      setFont(ctx, '800 28px Inter', 3);
      const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2, y = 570;
      rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.85)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
      ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
      ctx.restore();
    }
  }
  // V3 — jurisdiction stamp, then the line is drawn
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      const k = t < E.stamp ? lerp(1.6, 1.6, 0) : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      const a = clamp((t - E.stamp + 0.12) * 6);
      ctx.save(); ctx.globalAlpha *= a; stampCard(ctx, CX, 1000, k, eo(P(t, E.sub, E.sub + 0.4))); ctx.restore();
      const lp = eio(P(t, E.line, E.line + 0.5));
      if (lp > 0) { ctx.beginPath(); ctx.moveTo(CX - 330, 1250); ctx.lineTo(CX - 330 + 660 * lp, 1250); ctx.strokeStyle = C.cyan; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.stroke(); }
    });
  }
  // V4 — the three reasons, one at a time beside a small door
  function v4(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      doorFront(ctx, 230, 1060, 0.62, 0, { noWall: true });
      const items = [[E.r1, iconWrench, 'Repairs'], [E.r2, iconLens, 'Inspection'], [E.r3, iconDoc, 'Agreed reason']];
      items.forEach(([te, icon, lab], i) => {
        if (t < te) return;
        const k = spring(t - te, 1.7, 0.6), y = 800 + i * 230;
        ctx.save(); ctx.translate(560 + (1 - clamp(k)) * 120, y); ctx.globalAlpha *= clamp(k * 1.5);
        card(ctx, -70, -70, 140, 140, 34, C.card, { blur: 26, oy: 10 });
        ctx.save(); ctx.scale(0.8, 0.8); icon(ctx); ctx.restore();
        txt(ctx, lab, 100, 18, { f: '900 54px Inter', maxW: 380 });
        ctx.restore();
      });
    });
  }
  // V5 — written notice slides under the door; 24-hour ring fills
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      const sp = eo(P(t, E.slide, E.slide + 0.6));
      ctx.save(); ctx.translate(lerp(-260, 0, sp), 0); ctx.rotate(lerp(-0.2, 0, sp));
      notice(ctx, 300, 1070, 0.62, null); ctx.restore();
      if (t >= E.ring) ring24(ctx, 720, 1070, eio(P(t, E.ring, E.ring + 1.1)));
      label(ctx, 'IN WRITING', 300, 1330, eo(P(t, E.slide + 0.3, E.slide + 0.7)), { f: '900 50px Inter' });
      label(ctx, 'AHEAD', 720, 1330, eo(P(t, E.ring + 0.9, E.ring + 1.3)), { f: '900 50px Inter' });
    });
  }
  // V6 — what the notice must say; the 7 am–8 pm window lights up
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      const f = [P(t, E.f1, E.f1 + 0.6) > 0 ? t - E.f1 : 0, P(t, E.f2, E.f2 + 0.6) > 0 ? t - E.f2 : 0, P(t, E.f3, E.f3 + 0.6) > 0 ? t - E.f3 : 0];
      const slide = eio(P(t, E.dialIn, E.dialIn + 0.5));
      notice(ctx, lerp(CX, 300, slide), 1060, lerp(0.95, 0.72, slide), f);
      if (t >= E.dialIn) {
        ctx.save(); ctx.globalAlpha *= slide;
        const arc = eio(P(t, E.arc, E.arc + 1.4));
        dial(ctx, 760, 1060, arc, t >= E.arc ? lerp(7, 20, arc) : null);
        label(ctx, '7 AM – 8 PM', 760, 1330, eo(P(t, E.arc + 1.2, E.arc + 1.6)), { f: '900 52px Inter', maxW: 380 });
        ctx.restore();
      }
    });
  }
  // V7 — contrast: with notice by day vs no notice at night
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v7b), () => {
      // day half
      ctx.save(); ctx.beginPath(); ctx.rect(0, 620, CX, 880); ctx.clip();
      ctx.fillStyle = 'rgba(246,217,160,0.28)'; ctx.fillRect(0, 620, CX, 880);
      sun(ctx, 120, 720);
      doorFront(ctx, 270, 1080, 0.55, eio(P(t, E.v7 + 0.3, E.v7 + 1.1)), { noWall: true });
      badge(ctx, 270, 1330, spring(t - E.v7 - 0.6, 2, 0.5), true);
      ctx.restore();
      // night half
      ctx.save(); ctx.beginPath(); ctx.rect(CX, 620, W - CX, 880); ctx.clip();
      ctx.fillStyle = C.night; ctx.fillRect(CX, 620, W - CX, 880);
      moon(ctx, 950, 720);
      doorFront(ctx, 740, 1080, 0.55, 0, { noWall: true, night: true });
      const back = eio(P(t, E.keyBack, E.keyBack + 0.6));          // "ask them to come back": the key withdraws
      key(ctx, 740 + 60 + 120 * back, 1080 + 32, 0, 0.55 * (1 - back * 0.2));
      if (t >= E.noNotice) badge(ctx, 740, 1330, spring(t - E.noNotice, 2, 0.5), false);
      ctx.restore();
      ctx.fillStyle = 'rgba(2,25,59,0.25)'; ctx.fillRect(CX - 2, 620, 4, 880);
      label(ctx, 'NOTICE', 270, 700, eo(P(t, E.v7 + 0.5, E.v7 + 0.9)), { f: '900 46px Inter', maxW: 300 });
      label(ctx, 'NO NOTICE', 740, 700, eo(P(t, E.noNotice, E.noNotice + 0.4)), { f: '900 46px Inter', c: '#FFF8EE', maxW: 360 });
    });
  }
  // V7b — the forum: Rent Court
  function v7b(ctx, t) {
    withScene(ctx, win(t, E.v7b, E.v8), () => {
      courthouse(ctx, CX, 1020, 1.1, t >= E.gavel ? 1 - wobble(t - E.gavel, 0.6, 2.2, 4) : 0);
      label(ctx, 'RENT COURT', CX, 1330, eo(P(t, E.gavel - 0.1, E.gavel + 0.3)), { f: '900 72px Inter' });
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
    v1(ctx, t); v2(ctx, t); v3(ctx, t); v4(ctx, t); v5(ctx, t); v6(ctx, t); v7(ctx, t); v7b(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- separate vertical thumbnail: key in an opening door + 4 large words ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    const g = ctx.createRadialGradient(CX, 1200, 60, CX, 1200, 900);
    g.addColorStop(0, 'rgba(246,217,160,0.55)'); g.addColorStop(1, 'rgba(246,217,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    hallway(ctx, 1555);
    doorFront(ctx, CX, 1240, 1.05, 0.55, { spill: 0.3 });
    key(ctx, CX + 250, 1560, -0.55, 2.3);              // large foreground key for depth
    txt(ctx, 'THEIR HOUSE.', CX, 470, { f: '900 118px Inter', a: 'center', maxW: 800 });
    txt(ctx, 'YOUR HOME?', CX, 610, { f: '900 118px Inter', a: 'center', c: C.cyanDark, maxW: 800 });
    setFont(ctx, '800 28px Inter', 3);
    const lab = 'IS THIS LEGAL IN INDIA?', tw = ctx.measureText(lab).width, wch = tw + 92, x = CX - wch / 2, y = 690;
    rr(ctx, x, y, wch, 58, 29); ctx.fillStyle = 'rgba(255,253,248,0.9)'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 32, y + 29, 8, 0, Math.PI * 2); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.fillStyle = C.navy; ctx.textAlign = 'left'; ctx.fillText(lab, x + 54, y + 39);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
