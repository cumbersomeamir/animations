/* Courtlens · "Is this legal in India?" · Episode 24 (English, english-24, batch 24): locker robbed — who pays?
 * Basis: Reserve Bank of India (Commercial Banks – Responsible Business Conduct) Directions, 2025 (RBI/2025-26/170,
 * updated as on 1 Oct 2026), section C.8–C.9:
 *   para 258  loss of locker contents from fire, theft / burglary / robbery, dacoity, building collapse, or fraud by
 *             the bank's employee(s): "the bank's liability shall be for an amount equivalent to one hundred times the
 *             prevailing annual rent of the safe deposit locker"
 *   para 257  no liability for natural calamities / acts of God (earthquake, floods, lightning, thunderstorm) or the
 *             customer's sole negligence (the bank must still take appropriate care of its locker systems)
 *   para 260  the bank keeps no record of contents and "shall under no circumstances offer, directly or indirectly,
 *             any insurance product to its locker hirers for insurance of locker contents"
 * Replaces the proposed landlord-entry topic (episode 12). Built on the english-23 engine (captions y≈280–460, chip
 * y 478, pills y≈1418, crossfade windows). Frame zero = thumbnail.
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
  const eob = (x, s = 1.4) => { const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
  function spring(dt, f = 1.5, z = 0.55) {
    if (dt <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
  }
  const wobble = (dt, amp, f = 1.1, decay = 2.2) => (dt <= 0 ? 0 : amp * Math.exp(-dt * decay) * Math.sin(2 * Math.PI * f * dt));
  const L2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

  // ---------- drawing helpers ----------
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
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
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ok ? C.cyan : C.red; ctx.fill(); ctx.restore();
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
  }
  function grain(ctx) { ctx.drawImage(GRAIN, 0, 0); }
  function spotlight(ctx, cx, cy, r, a) {
    const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, r);
    g.addColorStop(0, `rgba(246,217,160,${0.55 * a})`); g.addColorStop(1, 'rgba(246,217,160,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  function stampCard(ctx, cx, cy, k, kicker, title) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.rotate(-0.04);
    card(ctx, -400, -150, 800, 300, 28, C.card, { blur: 46, oy: 22 });
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 8; rr(ctx, -370, -120, 740, 240, 20); ctx.stroke();
    txt(ctx, kicker, 0, -30, { f: '800 44px Inter', a: 'center', c: C.cyanDark, ls: 12 });
    txt(ctx, title, 0, 62, { f: '900 84px Inter', a: 'center', c: C.navy, ls: 2, maxW: 690 });
    ctx.restore();
  }
  function pill(ctx, s, x, y, k, o = {}) {                               // one short label per beat
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k * 1.6); ctx.translate(x, y + (1 - eo(clamp(k))) * 30);
    const f = o.f || '900 66px Inter'; setFont(ctx, f, 2);
    const tw = ctx.measureText(s).width, w = tw + 80 + (o.icon ? 74 : 0), x0 = -w / 2;
    card(ctx, x0, -62, w, 98, 49, o.fill || C.card, { blur: 26, oy: 10, stroke: o.stroke, lw: 4 });
    txt(ctx, s, x0 + 40 + (o.icon ? 74 : 0), 12, { f, c: o.c || C.navy, ls: 2 });
    if (o.icon) badge(ctx, x0 + 64, -13, 1, o.icon === 'ok', 30);
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

  // ---------- props ----------
  function floorShadow(ctx, x, y, rx, a = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.17);
    const g = ctx.createRadialGradient(0, 0, 8, 0, 0, rx);
    g.addColorStop(0, `rgba(2,25,59,${0.26 * a})`); g.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  function halo(ctx, x, y, r, a = 1, rgb = '18,170,211') {
    const g = ctx.createRadialGradient(x, y, 30, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${0.32 * a})`); g.addColorStop(0.6, `rgba(${rgb},${0.10 * a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, 540, W, 1000);
  }
  // one safe-deposit locker door (two keyholes: the customer's and the bank's)
  function lockerDoor(ctx, x, y, w, h, num, shade = 0) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#D9DDE2'); g.addColorStop(1, '#A9B1BB');
    rr(ctx, x, y, w, h, 8); ctx.fillStyle = g; ctx.fill();
    rr(ctx, x, y, w, h, 8); ctx.strokeStyle = 'rgba(2,25,59,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    rr(ctx, x + w / 2 - 34, y + 16, 68, 26, 6); ctx.fillStyle = '#E9BE6E'; ctx.fill();
    txt(ctx, num, x + w / 2, y + 36, { f: '800 20px Inter', a: 'center', c: C.navy });
    for (const kx of [x + w / 2 - 24, x + w / 2 + 24]) { ctx.beginPath(); ctx.arc(kx, y + h * 0.62, 10, 0, Math.PI * 2); ctx.fillStyle = '#3B4452'; ctx.fill(); rr(ctx, kx - 3, y + h * 0.62, 6, 16, 3); ctx.fill(); }
    if (shade > 0) { rr(ctx, x, y, w, h, 8); ctx.fillStyle = `rgba(2,25,59,${shade})`; ctx.fill(); }
  }
  // the vault wall of lockers; o.open (0..1 door swing of the robbed locker), o.alarm (0..1), o.t
  const GRID = { x: 150, y: 640, cols: 4, rows: 4, w: 170, h: 132, gx: 14, gy: 14 };
  function vault(ctx, t, o = {}) {
    const { x, y, cols, rows, w, h, gx, gy } = GRID, W2 = cols * (w + gx) - gx, H2 = rows * (h + gy) - gy;
    ctx.save();                                                                               // dark vault room behind the wall
    ctx.beginPath(); ctx.roundRect(70, 545, 860, 900, 40);
    const vg = ctx.createLinearGradient(0, 545, 0, 1445); vg.addColorStop(0, '#0B1A33'); vg.addColorStop(0.7, '#1B2C52'); vg.addColorStop(1, 'rgba(27,44,82,0)');
    ctx.fillStyle = vg; ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    rr(ctx, x - 30, y - 30, W2 + 60, H2 + 60, 22); ctx.fillStyle = '#4A5463'; ctx.fill(); ctx.restore();
    rr(ctx, x - 16, y - 16, W2 + 32, H2 + 32, 14); ctx.fillStyle = '#2E3644'; ctx.fill();
    const OPEN = [1, 1];                                                                      // row 1, col 1 is the robbed locker
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const lx = x + c * (w + gx), ly = y + r * (h + gy);
      if (r === OPEN[0] && c === OPEN[1]) continue;
      lockerDoor(ctx, lx, ly, w, h, String(200 + r * 10 + c + 1), 0);
    }
    // the robbed locker: dark empty cavity + door swung open (perspective parallelogram)
    const lx = x + OPEN[1] * (w + gx), ly = y + OPEN[0] * (h + gy), op = o.open ?? 1;
    const cg = ctx.createLinearGradient(lx, ly, lx + w, ly + h); cg.addColorStop(0, '#0B1220'); cg.addColorStop(1, '#1B2230');
    rr(ctx, lx, ly, w, h, 6); ctx.fillStyle = cg; ctx.fill();
    ctx.save(); rr(ctx, lx, ly, w, h, 6); ctx.clip();                                         // light falls into the empty box
    const sg = ctx.createRadialGradient(lx + w * 0.5, ly + h * 0.75, 4, lx + w * 0.5, ly + h * 0.75, 110); sg.addColorStop(0, 'rgba(246,217,160,0.35)'); sg.addColorStop(1, 'rgba(246,217,160,0)');
    ctx.fillStyle = sg; ctx.fillRect(lx, ly, w, h); ctx.restore();
    const sw = lerp(0.05, 1, op);                                                             // door hinged on the right edge
    const dx = lx + w, dw = w * (1 - 0.72 * sw), skew = 26 * sw;
    ctx.beginPath(); ctx.moveTo(dx, ly); ctx.lineTo(dx + dw, ly - skew); ctx.lineTo(dx + dw, ly + h + skew); ctx.lineTo(dx, ly + h); ctx.closePath();
    const dg = ctx.createLinearGradient(dx, 0, dx + dw, 0); dg.addColorStop(0, '#8A939E'); dg.addColorStop(1, '#D9DDE2'); ctx.fillStyle = dg; ctx.fill();
    ctx.strokeStyle = 'rgba(2,25,59,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    // alarm beacon + sweeping red light
    const al = o.alarm ?? 1, ang = (o.t || 0) * 3.2;
    const bx = x + W2 - 10, by = y - 54;
    ctx.save(); ctx.beginPath(); ctx.roundRect(70, 545, 860, 900, 40); ctx.clip(); ctx.globalAlpha *= 0.55 * al;   // beam stays inside the vault
    for (const a of [ang, ang + Math.PI]) {
      const g2 = ctx.createRadialGradient(bx, by, 10, bx, by, 760);
      g2.addColorStop(0, 'rgba(229,90,70,0.55)'); g2.addColorStop(1, 'rgba(229,90,70,0)');
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.arc(bx, by, 760, a - 0.22, a + 0.22); ctx.closePath(); ctx.fillStyle = g2; ctx.fill();
    }
    ctx.restore();
    ctx.beginPath(); ctx.arc(bx, by, 26, Math.PI, 0); ctx.fillStyle = '#E5735F'; ctx.fill();
    rr(ctx, bx - 34, by, 68, 14, 4); ctx.fillStyle = '#3B4452'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.roundRect(70, 545, 860, 900, 40); ctx.clip();
    const gl = ctx.createRadialGradient(bx, by, 4, bx, by, 120); gl.addColorStop(0, `rgba(229,115,95,${0.6 * al})`); gl.addColorStop(1, 'rgba(229,115,95,0)');
    ctx.fillStyle = gl; ctx.fillRect(bx - 120, by - 120, 240, 240); ctx.restore();
  }
  function jewelBox(ctx, x, y, s, rot, o = {}) {                    // an open, empty velvet jewellery box
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    floorShadow(ctx, 0, 40, 200, 1);
    ctx.save(); ctx.translate(0, -60); ctx.rotate(-0.5 - 0.25 * (o.lid || 0));                       // lid
    rr(ctx, -150, -110, 300, 110, 18); ctx.fillStyle = '#7A1F2B'; ctx.fill();
    rr(ctx, -134, -96, 268, 84, 12); ctx.fillStyle = '#5A1420'; ctx.fill(); ctx.restore();
    rr(ctx, -150, -60, 300, 110, 18); ctx.fillStyle = '#8E2633'; ctx.fill();                  // base
    rr(ctx, -132, -50, 264, 48, 10); ctx.fillStyle = '#4A0F18'; ctx.fill();                   // empty velvet slot
    ctx.beginPath(); ctx.ellipse(0, -26, 70, 14, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,220,200,0.35)'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, -20, 10, 40, 22, 6); ctx.fillStyle = C.gold; ctx.fill();
    ctx.restore();
  }
  function icon(ctx, x, y, k, kind) {                               // event icons on cards
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    card(ctx, -110, -110, 220, 220, 48, C.card, { blur: 30, oy: 12 });
    if (kind === 'theft') {                                                                  // a thief's mask + crowbar
      ctx.beginPath(); ctx.ellipse(0, -10, 78, 40, 0, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
      for (const ex of [-32, 32]) { ctx.beginPath(); ctx.ellipse(ex, -12, 20, 12, 0, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill(); }
      ctx.save(); ctx.rotate(-0.6); rr(ctx, -70, 52, 140, 16, 8); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
    } else if (kind === 'fire') {
      ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(60, -10, 66, 30, 40, 62); ctx.quadraticCurveTo(0, 86, -40, 62); ctx.bezierCurveTo(-66, 30, -40, -10, -6, -30); ctx.quadraticCurveTo(-4, -60, 0, -78);
      ctx.fillStyle = '#E5735F'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.bezierCurveTo(30, 20, 30, 46, 16, 60); ctx.quadraticCurveTo(0, 70, -16, 60); ctx.bezierCurveTo(-30, 40, -14, 18, 0, -10); ctx.fillStyle = C.gold; ctx.fill();
    } else if (kind === 'collapse') {                                                         // a cracked building
      rr(ctx, -60, -70, 120, 140, 6); ctx.fillStyle = '#7D8794'; ctx.fill();
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { rr(ctx, -40 + j * 46, -54 + i * 42, 34, 26, 4); ctx.fillStyle = C.cyanTint; ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(-10, -72); ctx.lineTo(8, -30); ctx.lineTo(-6, 0); ctx.lineTo(14, 40); ctx.lineTo(2, 72); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
    }
    ctx.restore();
  }
  function staffBadge(ctx, x, y, s, rot, stamp) {                   // a bank staff ID on a lanyard, stamped FRAUD
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.strokeStyle = C.cyanDark; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-60, -420); ctx.lineTo(0, -230); ctx.lineTo(60, -420); ctx.stroke();
    card(ctx, -150, -230, 300, 400, 24, '#FFFFFF', { blur: 36, oy: 14 });
    rr(ctx, -150, -230, 300, 80, 24); ctx.fillStyle = C.navy; ctx.fill(); ctx.fillRect(-150, -180, 300, 30);
    txt(ctx, 'BANK STAFF', 0, -176, { f: '900 34px Inter', a: 'center', c: C.gold, ls: 4 });
    ctx.beginPath(); ctx.arc(0, -70, 56, 0, Math.PI * 2); ctx.fillStyle = C.cyanTint; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -82, 24, 0, Math.PI * 2); ctx.fillStyle = C.navySoft; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-40, -20); ctx.quadraticCurveTo(0, -64, 40, -20); ctx.closePath(); ctx.fill();
    for (const [yy, w] of [[40, 200], [80, 150]]) { rr(ctx, -w / 2, yy - 8, w, 16, 8); ctx.fillStyle = C.navyFaint; ctx.fill(); }
    if (stamp > 0) {
      const k = stamp < 1 ? lerp(1.7, 1, eob(stamp, 1.2)) : 1;
      ctx.save(); ctx.translate(0, 40); ctx.rotate(-0.22); ctx.scale(k, k); ctx.globalAlpha *= clamp(stamp * 4);
      rr(ctx, -130, -44, 260, 88, 12); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.stroke();
      txt(ctx, 'FRAUD', 0, 22, { f: '900 66px Inter', a: 'center', c: C.red, ls: 6 }); ctx.restore();
    }
    ctx.restore();
  }
  function coin(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.ellipse(0, 8, 70, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#B98633'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 70, 22, 0, 0, Math.PI * 2); const g = ctx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#E9BE6E'); g.addColorStop(0.5, '#F6D9A0'); g.addColorStop(1, '#D7A351'); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
  function storm(ctx, t, o) {                                       // floods + earthquake + lightning (acts of God)
    const fk = o.flood || 0, qk = o.quake || 0, sh = qk > 0 && qk < 1 ? Math.sin(t * 60) * 10 * (1 - qk) : 0;
    ctx.save(); ctx.translate(sh, 0);
    for (const [cx, cy, r] of [[380, 760, 90], [480, 730, 110], [600, 760, 90], [520, 790, 90]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = '#5E6876'; ctx.fill(); }
    const lt = o.lightning || 0;
    if (lt > 0) { ctx.save(); ctx.globalAlpha *= lt; ctx.beginPath(); ctx.moveTo(500, 830); ctx.lineTo(450, 960); ctx.lineTo(510, 960); ctx.lineTo(460, 1100);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 16; ctx.lineJoin = 'round'; ctx.stroke(); ctx.restore(); }
    // a small bank building, standing on the ground
    rr(ctx, 400, 1060, 200, 160, 6); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(380, 1060); ctx.lineTo(500, 1000); ctx.lineTo(620, 1060); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    for (let i = 0; i < 4; i++) { rr(ctx, 420 + i * 46, 1080, 18, 120, 4); ctx.fillStyle = C.cyanTint; ctx.fill(); }
    if (qk > 0) { ctx.beginPath(); ctx.moveTo(260, 1230); ctx.lineTo(330, 1250); ctx.lineTo(380, 1226); ctx.lineTo(450, 1262); ctx.lineTo(520, 1236); ctx.lineTo(600, 1266); ctx.lineTo(700, 1232);
      ctx.strokeStyle = `rgba(2,25,59,${0.7 * clamp(qk * 3)})`; ctx.lineWidth = 8; ctx.lineJoin = 'round'; ctx.stroke(); }
    ctx.restore();
    if (fk > 0) {                                                                              // floodwater rises
      const yy = lerp(1380, 1185, eo(fk));
      for (let L = 0; L < 2; L++) { ctx.beginPath(); ctx.moveTo(100, 1460);
        for (let xx = 100; xx <= 900; xx += 20) ctx.lineTo(xx, yy + L * 30 + Math.sin(xx / 60 + t * 3 + L) * 10);
        ctx.lineTo(900, 1460); ctx.closePath();
        const wg = ctx.createLinearGradient(0, yy, 0, 1460); wg.addColorStop(0, L ? 'rgba(10,126,164,0.8)' : 'rgba(18,170,211,0.6)'); wg.addColorStop(0.7, L ? 'rgba(10,126,164,0.5)' : 'rgba(18,170,211,0.35)'); wg.addColorStop(1, 'rgba(18,170,211,0)');
        ctx.fillStyle = wg; ctx.fill(); }
    }
  }
  function policyCard(ctx, x, y, s, rot) {                          // a generic "locker insurance" policy offered by the bank
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -170, -210, 340, 420, 18, '#FFFFFF', { blur: 34, oy: 14 });
    ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(70, -122); ctx.lineTo(70, -60); ctx.quadraticCurveTo(70, -6, 0, 22); ctx.quadraticCurveTo(-70, -6, -70, -60); ctx.lineTo(-70, -122); ctx.closePath();
    ctx.fillStyle = C.cyan; ctx.fill();
    txt(ctx, 'LOCKER', 0, 82, { f: '900 40px Inter', a: 'center', c: C.navy, ls: 3 });
    txt(ctx, 'INSURANCE', 0, 128, { f: '900 40px Inter', a: 'center', c: C.navy, ls: 3 });
    rr(ctx, -110, 160, 220, 14, 7); ctx.fillStyle = C.navyFaint; ctx.fill();
    ctx.restore();
  }
  function bankCounter(ctx, x, y, s) {                              // a bank window the policy is pushed from
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -260, -300, 520, 300, 18); ctx.fillStyle = '#E9E0CF'; ctx.fill();
    rr(ctx, -200, -250, 400, 200, 14); ctx.fillStyle = C.cyanTint; ctx.fill();
    rr(ctx, -300, 0, 600, 60, 12); ctx.fillStyle = C.navy; ctx.fill();
    txt(ctx, 'BANK', 0, 42, { f: '900 40px Inter', a: 'center', c: C.gold, ls: 8 });
    ctx.restore();
  }
  function rentSlip(ctx, x, y, s, k) {                              // payoff: your yearly locker rent
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    card(ctx, -230, -110, 460, 220, 20, '#FFFFFF', { blur: 34, oy: 14 });
    txt(ctx, 'YEARLY LOCKER RENT', 0, -44, { f: '800 32px Inter', a: 'center', c: C.navySoft, ls: 3 });
    txt(ctx, '₹4,000', 0, 52, { f: '900 96px Inter', a: 'center', c: C.navy });
    if (k > 0) { ctx.save(); ctx.globalAlpha *= k; rr(ctx, 250, -30, 120, 60, 16); ctx.fillStyle = C.cyan; ctx.fill(); txt(ctx, '×100', 310, 12, { f: '900 38px Inter', a: 'center', c: C.navy }); ctx.restore(); }
    ctx.restore();
  }

  // ---------- scene windows (crossfades) ----------
  function win(t, a, b, fin = 0.35, fout = 0.35) {
    const i = a <= 0 ? 1 : eo(P(t, a - 0.18, a + fin - 0.18)), o = 1 - eio(P(t, b - fout, b));
    return { a: Math.min(i, o), i, o };
  }
  function withScene(ctx, w, fn, push = 0, zoomIn = 0.94, zoomOut = 1.05) {
    if (w.a <= 0.001) return;
    const s = (w.i < 1 ? lerp(zoomIn, 1, w.i) : lerp(zoomOut, 1, w.o)) * (1 + push);
    ctx.save(); ctx.globalAlpha = w.a;
    ctx.translate(CX, 1000); ctx.scale(s, s); ctx.translate(-CX, -1000);
    fn(); ctx.restore();
  }
  const PILL_Y = 1418;

  // V1–V2: the robbed vault (frame zero)
  function hookScene(ctx, t, thumb) {
    const w = win(t, -1, E.v3, 0, 0.35);
    if (w.a <= 0) return;
    ctx.save(); ctx.globalAlpha = w.a;
    const push = 0.05 * eio(P(t, 0, E.v3));
    ctx.translate(500, 1050); ctx.scale(1 + push, 1 + push); ctx.translate(-500, -1050);
    spotlight(ctx, 500, 980, 820, 0.8);
    const op = 1 - 0.12 * Math.max(0, 1 - Math.abs(t - E.swing) / 0.4) * (t > 0 ? 1 : 0);
    vault(ctx, t, { open: op + wobble(t - E.swing, 0.06, 1.5, 3), alarm: 0.85 + 0.15 * Math.cos(t * 6) + 0.4 * Math.max(0, 1 - Math.abs(t - E.break) / 0.5), t: t + 0.12 });
    jewelBox(ctx, 330, 1380, 0.9, -0.08, { lid: Math.max(0, 1 - Math.abs(t - E.gone) / 0.35) * (t > 0 ? 1 : 0) });
    ctx.restore();
  }
  function stampScene(ctx, t) {
    withScene(ctx, win(t, E.v3, E.v4), () => {
      spotlight(ctx, CX, 980, 700, 0.7);
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6); stampCard(ctx, CX, 960, k, 'RBI', 'LOCKER RULES'); ctx.restore();
    });
  }
  // V3: theft / robbery, fire, building collapse
  function eventsScene(ctx, t) {
    withScene(ctx, win(t, E.v4, E.v5), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      icon(ctx, 210, 1010 + Math.sin(t * 2) * 6, clamp(spring(t - E.theft, 1.8, 0.55), 0, 1.15), 'theft');
      icon(ctx, 500, 1010 + Math.sin(t * 2 + 1) * 6, clamp(spring(t - E.fire, 1.8, 0.55), 0, 1.15), 'fire');
      icon(ctx, 790, 1010 + Math.sin(t * 2 + 2) * 6, clamp(spring(t - E.collapse, 1.8, 0.55), 0, 1.15), 'collapse');
    });
  }
  // V4: fraud by the bank's own staff
  function fraudScene(ctx, t) {
    withScene(ctx, win(t, E.v5, E.v6), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      const k = spring(t - E.v5 + 0.1, 1.2, 0.5);
      staffBadge(ctx, CX, 1060 - (1 - clamp(k)) * 300, 0.95, wobble(t - E.v5, 0.12, 1.1, 1.6), P(t, E.fraud, E.fraud + 0.3));
    });
  }
  // V5: the rent coin multiplies ×100 into a stack
  function multiplyScene(ctx, t) {
    withScene(ctx, win(t, E.v6, E.v7), () => {
      spotlight(ctx, CX, 1000, 800, 0.7); halo(ctx, CX, 1000, 460, P(t, E.multiply, E.multiply + 0.8), '215,163,81');
      const n = Math.round(lerp(1, 100, eio(P(t, E.multiply, E.multiply + 1.1))));
      const baseY = 1330, step = 6.2;
      floorShadow(ctx, CX, baseY + 18, 180, 1);
      const k = spring(t - E.coin, 1.6, 0.55);
      for (let i = 0; i < n; i++) coin(ctx, CX + Math.sin(i * 1.7) * 3, baseY - i * step - (i === 0 ? (1 - clamp(k)) * 200 : 0), 1.0);
      const ny = baseY - (n - 1) * step;
      ctx.save(); ctx.globalAlpha *= clamp(k * 2);
      txt(ctx, n === 1 ? '1 YEAR' : `× ${n}`, CX + 170, Math.min(1290, ny + 10), { f: '900 64px Inter', a: 'left', c: C.navy });
      ctx.restore();
      pill(ctx, '100 × RENT', CX, PILL_Y, spring(t - E.stackLab, 1.6, 0.6));
    });
  }
  // V6: floods or earthquakes — not the bank's liability
  function godScene(ctx, t) {
    withScene(ctx, win(t, E.v7, E.v8), () => {
      spotlight(ctx, CX, 1000, 760, 0.5);
      storm(ctx, t, { flood: P(t, E.flood, E.flood + 0.8), quake: P(t, E.quake, E.quake + 0.7), lightning: Math.max(0, 1 - Math.abs(t - E.flood - 0.1) / 0.25) + Math.max(0, 1 - Math.abs(t - E.quake - 0.4) / 0.2) });
      if (t >= E.notLiable) badge(ctx, 700, 980, spring(t - E.notLiable, 2, 0.5), false, 52);
      pill(ctx, 'NOT LIABLE', CX, PILL_Y, spring(t - E.notLiable - 0.1, 1.6, 0.6), { icon: 'no' });
    });
  }
  // V7: banks can't sell you insurance for the contents
  function noSellScene(ctx, t) {
    withScene(ctx, win(t, E.v8, E.v9), () => {
      spotlight(ctx, CX, 1000, 760, 0.6);
      bankCounter(ctx, CX, 1000, 1.0);
      const pk = eio(P(t, E.policy, E.block)), back = eob(P(t, E.block, E.block + 0.45), 1.2);
      policyCard(ctx, CX + 0, lerp(860, 1150, pk) - 220 * back, 0.7, lerp(0, 0.08, pk) - 0.1 * back);
      if (t >= E.block) badge(ctx, CX + 150, 980, spring(t - E.block, 2, 0.5), false, 56);
      pill(ctx, 'NOT FROM THE BANK', CX, PILL_Y, spring(t - E.noSell, 1.6, 0.6));
    });
  }
  // V8: payoff — check your rent; buy your own insurance
  function payoffScene(ctx, t) {
    withScene(ctx, win(t, E.v9, E.v10 + 0.3, 0.35, 0.5), () => {
      spotlight(ctx, CX, 1000, 780, 0.7);
      const rk = spring(t - E.rent, 1.4, 0.6), mv = eio(P(t, E.shield - 0.4, E.shield + 0.2));
      rentSlip(ctx, CX, lerp(820, 760, mv) + (1 - clamp(rk)) * 260, lerp(1, 0.8, mv) * clamp(rk * 1.3, 0, 1), P(t, E.calc, E.calc + 0.3));
      jewelBox(ctx, CX, 1250, 0.8, 0, {});
      if (t >= E.shield) {                                                    // your own insurance wraps the box
        const sk = spring(t - E.shield, 1.3, 0.6);
        ctx.save(); ctx.globalAlpha *= clamp(sk); ctx.translate(CX, 1180); ctx.scale(sk, sk);
        ctx.beginPath(); ctx.moveTo(0, -200); ctx.lineTo(190, -130); ctx.lineTo(190, 20); ctx.quadraticCurveTo(190, 150, 0, 210); ctx.quadraticCurveTo(-190, 150, -190, 20); ctx.lineTo(-190, -130); ctx.closePath();
        ctx.fillStyle = 'rgba(18,170,211,0.18)'; ctx.fill(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.stroke(); ctx.restore();
      }
      pill(ctx, 'OWN INSURANCE', CX, PILL_Y, spring(t - E.ownLab, 1.6, 0.6), { icon: 'ok' });
    });
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    hookScene(ctx, t, thumb);
    if (thumb) return;
    stampScene(ctx, t); eventsScene(ctx, t); fraudScene(ctx, t); multiplyScene(ctx, t); godScene(ctx, t); noSellScene(ctx, t); payoffScene(ctx, t);
  }

  // ---------- CTA (unchanged from the approved episodes) ----------
  function drawCTA(ctx, t) {
    if (t < E.v10) return;
    const k = spring(t - E.v10, 1.6, 0.55);
    const ix = 170, iy = 975, is = 170;
    const ap = eio(P(t, E.v10 + 0.3, E.v10 + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.v10 + 0.15, E.v10 + 0.65));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1050, { f: '800 58px Inter', maxW: 520 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1106, { f: '600 32px Inter', c: C.navySoft, maxW: 520 });
    ctx.restore();
  }

  // ---------- captions (x 100..900, centred on x=500; band y 340..540) ----------
  const CAP = { size: 64, minSize: 46, maxW: 800, y1: 396 };
  const capCache = new Map();
  function layoutCaption(ctx, cp) {
    const key0 = cp.text + (cp.hook ? '#h' : '');
    if (capCache.has(key0)) return capCache.get(key0);
    const words = cp.text.split(' ');
    let size = cp.hook ? 90 : CAP.size, lines; const minS = cp.hook ? 64 : CAP.minSize;
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
      const y = lines.length === 1 ? CAP.y1 : (li === 0 ? (cp.hook ? 400 : 394) - gap / 2 : (cp.hook ? 400 : 394) + gap / 2);
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
      const hp = cp.start <= 0 ? 1 : eio(P(t, cp.start + 0.15, cp.start + 0.5));
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

  function render(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    scene(ctx, t);
    grain(ctx);
    chip(ctx, 478, Math.min(eo(P(t, E.v2c + 0.2, E.v2c + 0.5)), 1 - eio(P(t, E.v3 - 0.3, E.v3))));
    drawCTA(ctx, t);
    drawCaptions(ctx, t);
  }
  // ---------- thumbnail = the frame-zero composition, plus the series chip ----------
  function renderThumb(ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.letterSpacing = '0px';
    background(ctx);
    scene(ctx, 0, true);
    grain(ctx);
    drawCaptions(ctx, 0);
    chip(ctx, 478, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
