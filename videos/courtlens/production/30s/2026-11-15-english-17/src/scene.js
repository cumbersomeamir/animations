/* Courtlens · "Is this legal in India?" · Episode 17 (English, english-17, batch 17): 30 grams missing from a sealed
 * 1 kg pack — legal? Basis: Legal Metrology (Packaged Commodities) Rules, 2011 — rule 6(1)(c) (net quantity = the
 * commodity contained in the package), First Schedule Table I (maximum permissible error 15 g for a 500–1000 g pack),
 * rule 21 (on a complaint, testing at the retail premises; seizure and action if the deficiency exceeds the error;
 * proviso for 'when packed' environmental loss). Unchanged through G.S.R. 826(E) of 21 Sep 2026.
 * Frame zero = thumbnail. Built on the english-16 engine under context/09-feedback-rules-2026-11-11.md.
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
    let s = 20261117 >>> 0;
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
  function pack(ctx, cx, by, s, o = {}) {             // a sealed kraft pack with a "NET QTY 1 kg" label (generic, no brand)
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.28)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    ctx.beginPath(); ctx.moveTo(-170, 0); ctx.lineTo(-180, -520); ctx.lineTo(180, -520); ctx.lineTo(170, 0); ctx.closePath();
    const g = ctx.createLinearGradient(-180, 0, 180, 0); g.addColorStop(0, '#C9A26B'); g.addColorStop(0.5, '#DDBB86'); g.addColorStop(1, '#B98F58');
    ctx.fillStyle = g; ctx.fill(); ctx.restore();
    rr(ctx, -186, -560, 372, 52, 8); ctx.fillStyle = '#A9824C'; ctx.fill();                     // crimped top seal
    for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(2,25,59,0.12)'; ctx.fillRect(-176 + i * 30, -556, 14, 44); }
    card(ctx, -130, -440, 260, 300, 16, C.card, { blur: 10, oy: 4 });
    txt(ctx, 'RICE', 0, -360, { f: '900 64px Inter', a: 'center', c: C.navy, ls: 6 });
    const hot = o.hot || 0;
    rr(ctx, -110, -300, 220, 120, 12); ctx.fillStyle = hot > 0 ? `rgba(18,170,211,${0.18 + 0.3 * hot})` : C.paper; ctx.fill();
    txt(ctx, 'NET QTY', 0, -262, { f: '800 28px Inter', a: 'center', c: C.navySoft, ls: 3 });
    txt(ctx, '1 kg', 0, -198, { f: '900 64px Inter', a: 'center', c: C.navy });
    if (o.wp) { ctx.save(); ctx.globalAlpha *= clamp(o.wp); rr(ctx, -120, -120, 240, 56, 10); ctx.fillStyle = C.gold; ctx.fill(); txt(ctx, 'WHEN PACKED', 0, -82, { f: '900 30px Inter', a: 'center', c: C.navy, ls: 2 }); ctx.restore(); }
    if (o.seized > 0) {
      ctx.save(); ctx.translate(0, -300); ctx.rotate(-0.16); const k = eob(clamp(o.seized), 1.2); ctx.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); ctx.globalAlpha *= clamp(o.seized * 4);
      rr(ctx, -170, -50, 340, 100, 14); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.stroke();
      txt(ctx, 'SEIZED', 0, 26, { f: '900 66px Inter', a: 'center', c: C.red, ls: 6 }); ctx.restore();
    }
    ctx.restore();
  }
  function scale(ctx, cx, cy, s, reading, glow) {      // digital kitchen scale with a bowl of grain
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    // bowl of rice (contents only)
    ctx.beginPath(); ctx.ellipse(0, -96, 150, 50, 0, Math.PI, 0); ctx.fillStyle = '#F6EFE0'; ctx.fill();
    for (let i = 0; i < 40; i++) { const a = (i * 2.399) % Math.PI, r = 30 + (i * 37) % 110; ctx.beginPath(); ctx.ellipse(Math.cos(a + Math.PI) * r, -100 - Math.sin(a) * r * 0.32, 7, 3.5, a, 0, Math.PI * 2); ctx.fillStyle = 'rgba(201,180,140,0.9)'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-160, -96); ctx.bezierCurveTo(-150, -10, 150, -10, 160, -96); ctx.closePath(); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -96, 160, 22, 0, 0, Math.PI * 2); ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 6; ctx.stroke();
    // scale body
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.3)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    rr(ctx, -230, -30, 460, 120, 26); ctx.fillStyle = '#E8EDF2'; ctx.fill(); ctx.restore();
    rr(ctx, -230, -30, 460, 26, 13); ctx.fillStyle = '#C9D2E0'; ctx.fill();
    rr(ctx, -110, 14, 220, 64, 12); ctx.fillStyle = '#0D2550'; ctx.fill();
    if (glow > 0) { ctx.save(); ctx.shadowColor = `rgba(181,67,47,${0.8 * glow})`; ctx.shadowBlur = 30 * glow; rr(ctx, -110, 14, 220, 64, 12); ctx.strokeStyle = `rgba(181,67,47,${glow})`; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
    txt(ctx, reading, 0, 64, { f: '900 46px Inter', a: 'center', c: glow > 0.3 ? '#FF8A70' : '#7FE3FF', ls: 2 });
    ctx.restore();
  }
  function badgeLM(ctx, x, y, s) {                     // generic Legal Metrology officer badge (no real insignia)
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -190, -110, 380, 220, 24, '#1B3A6B', { blur: 30, oy: 12 });
    ctx.beginPath(); ctx.arc(-110, -10, 50, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-138, -24); ctx.lineTo(-82, -24); ctx.moveTo(-110, -40); ctx.lineTo(-110, 24); ctx.stroke();
    ctx.beginPath(); ctx.arc(-138, 0, 12, 0, Math.PI); ctx.moveTo(-70, 0); ctx.arc(-82, 0, 12, 0, Math.PI); ctx.stroke();
    txt(ctx, 'LEGAL', 70, -14, { f: '900 46px Inter', a: 'center', c: '#FFF8EE', ls: 3 });
    txt(ctx, 'METROLOGY', 70, 38, { f: '900 34px Inter', a: 'center', c: C.cyanMark, ls: 2, maxW: 210 });
    ctx.restore();
  }
  function sunDrops(ctx, x, y, k) {                   // environmental loss: warmth drying moisture off
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= clamp(k * 1.5);
    ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 70, Math.sin(a) * 70); ctx.lineTo(Math.cos(a) * 92, Math.sin(a) * 92); ctx.strokeStyle = C.gold; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.stroke(); }
    for (let i = 0; i < 3; i++) { const dy = -((k * 120 + i * 40) % 120); ctx.save(); ctx.globalAlpha *= 1 - (-dy / 120); ctx.translate(150 + i * 46, 60 + dy); ctx.beginPath(); ctx.moveTo(0, -20); ctx.bezierCurveTo(14, 0, 14, 14, 0, 16); ctx.bezierCurveTo(-14, 14, -14, 0, 0, -20); ctx.fillStyle = C.cyan; ctx.fill(); ctx.restore(); }
    ctx.restore();
  }
  function iconBowl(ctx) {
    ctx.beginPath(); ctx.moveTo(-56, -10); ctx.bezierCurveTo(-50, 50, 50, 50, 56, -10); ctx.closePath(); ctx.fillStyle = C.cyan; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -10, 56, 14, 0, 0, Math.PI * 2); ctx.fillStyle = '#E9DCC0'; ctx.fill();
    rr(ctx, -62, 44, 124, 18, 8); ctx.fillStyle = C.navy; ctx.fill();
  }
  function iconBill(ctx) {
    ctx.beginPath(); ctx.moveTo(-40, -60); ctx.lineTo(40, -60); ctx.lineTo(40, 56);
    for (let i = 0; i < 4; i++) { ctx.lineTo(40 - 10 - i * 20, 46); ctx.lineTo(40 - 20 - i * 20, 56); }
    ctx.lineTo(-40, -60); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.fillStyle = C.navyFaint; for (let i = 0; i < 3; i++) { rr(ctx, -26, -42 + i * 22, i === 2 ? 30 : 52, 8, 4); ctx.fill(); }
  }
  function iconBadge(ctx) {
    rr(ctx, -60, -42, 120, 84, 14); ctx.fillStyle = '#1B3A6B'; ctx.fill();
    ctx.beginPath(); ctx.arc(-24, 0, 22, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    ctx.fillStyle = C.cyanMark; rr(ctx, 6, -16, 40, 10, 5); ctx.fill(); rr(ctx, 6, 4, 30, 10, 5); ctx.fill();
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

  // V1 — frame zero: the sealed 1 kg pack beside its contents on a scale reading 970 g
  function kitchen(ctx, t, thumb = false) {
    spotlight(ctx, CX, 1250, 820, 1);
    const tg = ctx.createLinearGradient(0, 1460, 0, 1800); tg.addColorStop(0, '#C9A57A'); tg.addColorStop(1, 'rgba(201,165,122,0)');
    rr(ctx, -40, 1460, W + 80, 340, 0); ctx.fillStyle = tg; ctx.fill();                       // countertop with soft falloff
    const hot = thumb ? 0.6 : 0.6 + 0.3 * Math.max(0, wobble(t - E.label, 1, 1.5, 3));         // highlighted from frame zero (= thumbnail)
    pack(ctx, 300, 1480, 1.05, { hot });
    const pulse = thumb ? 1 : 0.6 + 0.4 * Math.abs(Math.sin((t - E.pulse) * 6)) * (t > E.pulse && t < E.pulse + 1.2 ? 1 : 0) + (t >= E.pulse + 1.2 || t < E.pulse ? 0.4 : 0);
    scale(ctx, 740, 1420, 0.95, '970 g', pulse);
    const tk = 1 + (thumb ? 0 : 0.18 * Math.max(0, wobble(t - E.tag, 1, 1.8, 3)));                // present from frame zero; pulses on "missing"
    if (tk > 0) {
      ctx.save(); ctx.translate(760, 1130); ctx.scale(tk, tk);
      card(ctx, -120, -46, 240, 92, 46, C.red, { blur: 20, oy: 8 });
      txt(ctx, '−30 g', 0, 18, { f: '900 54px Inter', a: 'center', c: '#FFF8EE' });
      ctx.restore();
    }
  }
  function v1(ctx, t) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    kitchen(ctx, t);
    ctx.restore();
    chip(ctx, 570, win(t, E.v2c + 0.2, E.v3).a);
  }
  // V3 — the tolerance gauge: 15 g allowed for a 1 kg pack; 970 g is double that
  function v3(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v5), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const x0 = 130, x1 = 870, gmin = 950, gmax = 1005, X = g => x0 + (x1 - x0) * (g - gmin) / (gmax - gmin), y = 1100;
      const gk = eo(P(t, E.gauge, E.gauge + 0.5));
      ctx.save(); ctx.globalAlpha *= gk;
      rr(ctx, x0, y - 30, x1 - x0, 60, 30); ctx.fillStyle = C.navyFaint; ctx.fill();
      for (const g of [950, 960, 970, 980, 990, 1000]) { rr(ctx, X(g) - 3, y + 40, 6, 26, 3); ctx.fillStyle = C.navySoft; ctx.fill(); txt(ctx, String(g), X(g), y + 106, { f: '800 30px Inter', a: 'center', c: C.navySoft }); }
      txt(ctx, 'grams', x1, y + 150, { f: '700 28px Inter', a: 'right', c: C.navySoft });
      ctx.restore();
      // declared: 1 kg
      if (gk > 0) { ctx.save(); ctx.globalAlpha *= gk; rr(ctx, X(1000) - 5, y - 80, 10, 160, 5); ctx.fillStyle = C.navy; ctx.fill(); txt(ctx, '1 kg', X(1000), y - 100, { f: '900 46px Inter', a: 'center' }); ctx.restore(); }
      // allowed error band 985–1000
      const bk = eio(P(t, E.band, E.band + 0.7));
      if (bk > 0) { rr(ctx, X(1000) - (X(1000) - X(985)) * bk, y - 30, (X(1000) - X(985)) * bk, 60, 12); ctx.fillStyle = 'rgba(18,170,211,0.85)'; ctx.fill(); }
      label(ctx, 'ALLOWED: 15 g', CX, 820, eo(P(t, E.fifteen, E.fifteen + 0.35)) * (1 - P(t, E.needle - 0.1, E.needle + 0.2)), { f: '900 84px Inter', c: C.cyanDark });
      // the needle drops to 970 — twice the allowed error
      if (t >= E.needle - 0.05) {
        const nk = eob(P(t, E.needle, E.needle + 0.5), 1.1), gx = lerp(X(1000), X(970), clamp(nk));
        rr(ctx, X(970), y - 30, (X(985) - X(970)) * clamp(nk), 60, 12); ctx.fillStyle = 'rgba(181,67,47,0.85)'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(gx, y - 44); ctx.lineTo(gx - 22, y - 92); ctx.lineTo(gx + 22, y - 92); ctx.closePath(); ctx.fillStyle = C.red; ctx.fill();
        txt(ctx, '970', gx, y - 104, { f: '900 40px Inter', a: 'center', c: C.red, alpha: clamp(nk) });
      }
      label(ctx, '30 g SHORT = 2×', CX, 820, eo(P(t, E.double, E.double + 0.35)), { f: '900 84px Inter', c: C.red });
    });
  }
  // V5 — on a complaint, the officer tests at the shop and seizes short packs
  function v5(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1100, 760, 0.6);
      ctx.fillStyle = 'rgba(27,58,107,0.85)'; rr(ctx, 40, 1480, 1000, 30, 12); ctx.fill();          // the shop counter
      const bk = spring(t - E.badge, 1.6, 0.55);
      if (t >= E.badge) badgeLM(ctx, CX, 790, clamp(bk) * 1.0);
      pack(ctx, 300, 1480, 0.8, { seized: P(t, E.seize, E.seize + 0.3) });
      if (t >= E.test - 0.3) { const k = eo(P(t, E.test - 0.3, E.test + 0.2)); ctx.save(); ctx.globalAlpha *= k; scale(ctx, 740, 1430, 0.8, t >= E.test + 0.3 ? '970 g' : '— — —', t >= E.test + 0.3 ? 0.8 : 0); ctx.restore(); }
      label(ctx, 'TESTED AT THE SHOP', CX, 1620, eo(P(t, E.test, E.test + 0.35)) * (1 - P(t, E.seize - 0.2, E.seize + 0.1)), { f: '900 58px Inter' });
      label(ctx, 'SHORT PACKS SEIZED', CX, 1620, eo(P(t, E.seize + 0.1, E.seize + 0.45)), { f: '900 58px Inter', c: C.red });
    });
  }
  // V6 — the catch: "when packed" packs can be excused for environmental loss
  function v6(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1100, 760, 0.6);
      pack(ctx, 300, 1500, 1.0, { wp: eo(P(t, E.wp, E.wp + 0.4)) });
      label(ctx, 'WHEN PACKED', CX, 840, eo(P(t, E.wp, E.wp + 0.35)), { f: '900 84px Inter', c: C.navy, ls: 3 });
      if (t >= E.env - 0.1) sunDrops(ctx, 700, 1060, P(t, E.env - 0.1, E.env + 2.2));
      label(ctx, 'MAY BE EXCUSED', 730, 1300, eo(P(t, E.excused, E.excused + 0.35)), { f: '900 50px Inter', c: C.cyanDark, maxW: 360 });
    });
  }
  // V7 — payoff: three steps, one at a time
  function v7(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1060, 760, 0.6);
      const items = [[E.s1, iconBowl, 'WEIGH CONTENTS'], [E.s2, iconBill, 'KEEP THE BILL'], [E.s3, iconBadge, 'COMPLAIN']];
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
    v1(ctx, t); v3(ctx, t); v5(ctx, t); v6(ctx, t); v7(ctx, t);
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition (with the -30 g tag), plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    kitchen(ctx, 0, true);
    drawCaptions(ctx, 0);
    chip(ctx, 600, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
