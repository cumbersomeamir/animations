/* Courtlens · "Is this legal in India?" · Episode 20 (English, english-20, batch 20): can a landlord keep your
 * security deposit for ordinary wear and tear? Jurisdiction: TAMIL NADU (urban areas), Tamil Nadu Regulation of Rights
 * and Responsibilities of Landlords and Tenants Act, 2017 (TN Act 42 of 2017, as amended by Act 39 of 2018):
 *   s.15(1)  notwithstanding any contract, keep the premises as good as at the start "except for normal wear and tear";
 *            repairs per the Second Schedule (Part A item 2: whitewashing walls / painting doors and windows = landlord)
 *   s.16(a)  the tenant shall not intentionally or negligently damage the premises
 *   s.11(2)  deposit refunded "at the time of taking over of possession of the vacant premises by the landlord, after
 *            making due deduction of any liability of the tenant" (wording substituted by Act 39 of 2018)
 * Built on the english-19 engine (palette, Inter, grain, captions, chip, stamp, CTA) under
 * context/09-feedback-rules-2026-11-11.md. New for the 18 Nov feedback ("too much text, more appealing motion"):
 * one continuous rented-flat diorama with a moving camera, one short label per beat. Frame zero = thumbnail.
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

  // ---------- the rented flat: a cut-away diorama in one-point perspective (world coordinates) ----------
  const RM = { L: 100, R: 900, T: 630, B: 1430, bl: 270, br: 730, bt: 740, bb: 1180 };
  const WIN = { x: 300, y: 800, w: 150, h: 210 };          // window on the back wall
  const DOOR = { x: 580, y: 880, w: 125, h: 300 };         // door on the back wall
  const HOOK = [548, 975];                                 // key hook beside the door
  function floorPt(xn, d) {                                // xn 0..1 left→right, d 0 front → 1 back
    const y = lerp(RM.B, RM.bb, d), xl = lerp(RM.L, RM.bl, d), xr = lerp(RM.R, RM.br, d);
    return [lerp(xl, xr, xn), y];
  }
  // st: fade (0 fresh .. 1 worn), wipe (repaint progress 0..1, top→bottom), crack (0..1), heal (0..1 glass repaired),
  //     sun (beam position 0..1), day (light level 0..1), circles (red marker rings 0..1 each), rollerY
  function room(ctx, st) {
    const { L, R, T, B, bl, br, bt, bb } = RM;
    // outer cut edge (dollhouse) + drop shadow
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.30)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 26;
    rr(ctx, L - 22, T - 22, R - L + 44, B - T + 44, 26); ctx.fillStyle = '#FFFDF8'; ctx.fill(); ctx.restore();
    // ceiling, side walls, floor
    poly(ctx, [[L, T], [R, T], [br, bt], [bl, bt]]); ctx.fillStyle = '#E7D8BE'; ctx.fill();
    let g = ctx.createLinearGradient(L, 0, bl, 0); g.addColorStop(0, '#E9D6B4'); g.addColorStop(1, '#F1E2C6');
    poly(ctx, [[L, T], [bl, bt], [bl, bb], [L, B]]); ctx.fillStyle = g; ctx.fill();
    g = ctx.createLinearGradient(R, 0, br, 0); g.addColorStop(0, '#DCC7A3'); g.addColorStop(1, '#EAD8B9');
    poly(ctx, [[R, T], [br, bt], [br, bb], [R, B]]); ctx.fillStyle = g; ctx.fill();
    g = ctx.createLinearGradient(0, bb, 0, B); g.addColorStop(0, '#B98B57'); g.addColorStop(1, '#CFA06A');
    poly(ctx, [[bl, bb], [br, bb], [R, B], [L, B]]); ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.16; ctx.strokeStyle = '#7A5230'; ctx.lineWidth = 2;      // faint floorboards
    for (let i = 1; i < 7; i++) { const a = floorPt(i / 7, 0), b = floorPt(i / 7, 1); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    ctx.restore();
    // side-wall wear: a soft yellowing as the flat ages
    if (st.fade > 0) {
      ctx.save(); ctx.globalAlpha = 0.22 * st.fade;
      poly(ctx, [[L, T], [bl, bt], [bl, bb], [L, B]]); ctx.fillStyle = '#C9B48A'; ctx.fill();
      poly(ctx, [[R, T], [br, bt], [br, bb], [R, B]]); ctx.fill();
      ctx.restore();
    }
    // back wall (fresh paint), then the worn layer above the repaint line
    rr(ctx, bl, bt, br - bl, bb - bt, 0); ctx.fillStyle = '#F8EDD6'; ctx.fill();
    const wipeY = bt + (bb - bt) * (st.wipe || 0);
    if (st.fade > 0 && wipeY < bb) {
      ctx.save(); rr(ctx, bl, wipeY, br - bl, bb - wipeY, 0); ctx.clip();
      ctx.globalAlpha = st.fade;
      rr(ctx, bl, bt, br - bl, bb - bt, 0); ctx.fillStyle = '#DEC89D'; ctx.fill();
      const blot = [[350, 1110, 120, 54, '#BB9C68'], [655, 792, 96, 54, '#B8996A'], [513, 935, 40, 74, '#BE9F6E'],
        [300, 770, 80, 40, '#C3A677'], [700, 1130, 60, 46, '#B3956A']];
      for (const [x, y, rx, ry, c] of blot) {
        const bg = ctx.createRadialGradient(x, y, 4, x, y, rx);
        bg.addColorStop(0, c); bg.addColorStop(0.55, c + 'AA'); bg.addColorStop(1, 'rgba(214,193,152,0)');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(80,60,40,0.35)'; ctx.lineWidth = 6; ctx.lineCap = 'round';                // scuffs by the skirting
      for (const [x0, x1, y] of [[300, 360, 1158], [400, 430, 1164], [640, 690, 1160]]) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y - 4); ctx.stroke(); }
      ctx.restore();
    }
    // skirting
    rr(ctx, bl, bb - 14, br - bl, 14, 0); ctx.fillStyle = '#E2CFAE'; ctx.fill();
    // window (sky, frame) with optional crack
    windowPane(ctx, st);
    // door with knob
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.2)'; ctx.shadowBlur = 12;
    rr(ctx, DOOR.x - 10, DOOR.y - 10, DOOR.w + 20, DOOR.h + 10, 6); ctx.fillStyle = '#FFF8EC'; ctx.fill(); ctx.restore();
    g = ctx.createLinearGradient(DOOR.x, 0, DOOR.x + DOOR.w, 0); g.addColorStop(0, '#8E5F33'); g.addColorStop(1, '#A87442');
    rr(ctx, DOOR.x, DOOR.y, DOOR.w, DOOR.h, 3); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(60,36,14,0.35)'; ctx.lineWidth = 3;
    rr(ctx, DOOR.x + 16, DOOR.y + 18, DOOR.w - 32, 110, 3); ctx.stroke(); rr(ctx, DOOR.x + 16, DOOR.y + 150, DOOR.w - 32, 128, 3); ctx.stroke();
    ctx.beginPath(); ctx.arc(DOOR.x + 22, DOOR.y + 160, 8, 0, Math.PI * 2); ctx.fillStyle = C.gold; ctx.fill();
    // key hook
    rr(ctx, HOOK[0] - 9, HOOK[1] - 22, 18, 40, 5); ctx.fillStyle = '#9A6838'; ctx.fill();                 // key peg
    rr(ctx, HOOK[0] - 3, HOOK[1] + 4, 6, 18, 3); ctx.fillStyle = '#6E4A28'; ctx.fill();
    // sunlight: beam from the window down onto the floor
    const sun = st.sun ?? 0.4, day = st.day ?? 1;
    if (day > 0) {
      const s = (sun - 0.4) * 0.9;
      const a1 = [WIN.x, WIN.y + WIN.h], a2 = [WIN.x + WIN.w, WIN.y + WIN.h];
      const f1 = floorPt(0.06 + s, 0.22), f2 = floorPt(0.44 + s, 0.22), f3 = floorPt(0.36 + s, 0.62), f4 = floorPt(0.1 + s, 0.62);
      ctx.save(); ctx.globalAlpha = 0.34 * day;
      let bg2 = ctx.createLinearGradient(0, WIN.y, 0, f1[1]); bg2.addColorStop(0, 'rgba(255,240,205,0.85)'); bg2.addColorStop(1, 'rgba(255,240,205,0)');
      poly(ctx, [[WIN.x, WIN.y], [WIN.x + WIN.w, WIN.y], f2, f1]); ctx.fillStyle = bg2; ctx.fill();
      ctx.globalAlpha = 0.55 * day;
      poly(ctx, [f4, f3, f2, f1]); ctx.fillStyle = 'rgba(255,236,190,0.75)'; ctx.fill();
      ctx.restore();
      void a1; void a2;
    }
    // pendant lamp (depth cue)
    ctx.strokeStyle = '#3B3326'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(500, T); ctx.lineTo(500, 700); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(462, 728); ctx.quadraticCurveTo(500, 680, 538, 728); ctx.closePath(); ctx.fillStyle = C.navy; ctx.fill();
    const lg = ctx.createRadialGradient(500, 735, 4, 500, 735, 160); lg.addColorStop(0, 'rgba(255,226,160,0.55)'); lg.addColorStop(1, 'rgba(255,226,160,0)');
    ctx.fillStyle = lg; ctx.fillRect(330, 640, 340, 260);
    // red marker rings round the worn patches (the landlord's complaint)
    for (const [k, x, y, rx, ry] of [[st.c1 || 0, 513, 928, 46, 82], [st.c2 || 0, 655, 792, 94, 52]]) {
      if (k <= 0) continue;
      ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 9 * (st.ringW || 1); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.12, -0.6, -0.6 + Math.PI * 2.15 * k); ctx.stroke(); ctx.restore();
    }
    // night tint (time-lapse) + gentle vignette inside the box
    if (day < 1) { poly(ctx, [[L, T], [R, T], [R, B], [L, B]]); ctx.fillStyle = `rgba(10,24,52,${0.38 * (1 - day)})`; ctx.fill(); }
    const vg = ctx.createRadialGradient(500, 1000, 250, 500, 1000, 700); vg.addColorStop(0, 'rgba(2,25,59,0)'); vg.addColorStop(1, 'rgba(2,25,59,0.30)');
    poly(ctx, [[L, T], [R, T], [R, B], [L, B]]); ctx.fillStyle = vg; ctx.fill();
  }
  function windowPane(ctx, st) {
    const { x, y, w, h } = WIN;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.18)'; ctx.shadowBlur = 10;
    rr(ctx, x - 12, y - 12, w + 24, h + 24, 6); ctx.fillStyle = '#FFF8EC'; ctx.fill(); ctx.restore();
    const day = st.day ?? 1;
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, `rgb(${lerp(40, 168, day)},${lerp(60, 214, day)},${lerp(110, 236, day)})`);
    g.addColorStop(1, `rgb(${lerp(70, 226, day)},${lerp(80, 240, day)},${lerp(120, 246, day)})`);
    rr(ctx, x, y, w, h, 2); ctx.fillStyle = g; ctx.fill();
    ctx.save(); rr(ctx, x, y, w, h, 2); ctx.clip();                                                  // glass sheen
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFFFFF';
    poly(ctx, [[x + 20, y + h], [x + 60, y + h], [x + w, y + 40], [x + w, y]]); ctx.fill();
    ctx.restore();
    // crack
    const ck = st.crack || 0, heal = st.heal || 0;
    if (ck > 0 && heal < 1) {
      ctx.save(); rr(ctx, x, y, w, h, 2); ctx.clip(); ctx.globalAlpha = 1 - heal;
      const ix = x + w * 0.42, iy = y + h * 0.36;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const rays = [[0.1, 1.0], [0.95, 0.85], [1.75, 1.0], [2.5, 0.8], [3.3, 1.0], [4.1, 0.9], [4.9, 0.95], [5.6, 0.85]];
      for (const [a, len] of rays) {
        const n = 5, seg = (len * 150 * eo(ck)) / n; let px = ix, py = iy, ang = a;
        ctx.beginPath(); ctx.moveTo(px, py);
        for (let i = 0; i < n; i++) { ang += Math.sin(a * 7 + i * 3.1) * 0.35; px += Math.cos(ang) * seg; py += Math.sin(ang) * seg; ctx.lineTo(px, py); }
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(2,25,59,0.45)'; ctx.lineWidth = 2;
      for (const r of [16, 34]) { ctx.beginPath(); ctx.arc(ix, iy, r * eo(ck), 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(ix, iy, 6 * eo(ck), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#FFF8EC'; ctx.lineWidth = 9;                                                   // glazing bars
    ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h * 0.48); ctx.lineTo(x + w, y + h * 0.48); ctx.stroke();
    rr(ctx, x - 18, y + h + 8, w + 36, 14, 4); ctx.fillStyle = '#EFE1C6'; ctx.fill();                  // sill
  }

  // ---------- props ----------
  function note(ctx, x, y, s, rot, tint = '#CBDDBF') {          // a stylised banknote (no real design)
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.2)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    rr(ctx, -90, -46, 180, 92, 8); ctx.fillStyle = tint; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(2,25,59,0.35)'; ctx.lineWidth = 3; rr(ctx, -80, -36, 160, 72, 5); ctx.stroke();
    ctx.beginPath(); ctx.arc(34, 0, 22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,25,59,0.12)'; ctx.fill();
    txt(ctx, '₹', -40, 16, { f: '900 46px Inter', a: 'center', c: 'rgba(2,25,59,0.55)' });
    ctx.restore();
  }
  function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
  // the deposit envelope. o: amount, lock (0..1), notes (peeking notes 0..1)
  function envelope(ctx, x, y, s, rot, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if ((o.notes ?? 1) > 0) {
      const k = o.notes ?? 1;
      note(ctx, -70, -150 + (1 - k) * 90, 1.25, -0.16, '#CFE0C2');
      note(ctx, 60, -160 + (1 - k) * 90, 1.25, 0.12, '#E9D1A6');
    }
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.30)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    rr(ctx, -230, -150, 460, 290, 18); ctx.fillStyle = '#F1DDB4'; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(-230, 0, 230, 0); g.addColorStop(0, '#E9D0A0'); g.addColorStop(0.5, '#F6E6C4'); g.addColorStop(1, '#E6CB98');
    rr(ctx, -230, -150, 460, 290, 18); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(122,82,48,0.30)'; ctx.lineWidth = 4;                                       // folds
    ctx.beginPath(); ctx.moveTo(-226, 132); ctx.lineTo(0, -10); ctx.lineTo(226, 132); ctx.stroke();
    rr(ctx, -150, -18, 300, 104, 14); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    ctx.strokeStyle = C.navy; ctx.lineWidth = 4; ctx.stroke();
    txt(ctx, 'DEPOSIT', 0, -48, { f: '900 38px Inter', a: 'center', c: '#7A5230', ls: 8 });
    txt(ctx, fmt(o.amount ?? 45000), 0, 58, { f: '900 72px Inter', a: 'center', c: o.amtC || C.navy, maxW: 280 });
    if ((o.lock || 0) > 0) {                                                                          // padlocked shut
      const k = o.lock;
      ctx.save(); ctx.translate(212, 30); ctx.rotate(wobble(o.lockDt || 0, 0.25, 2.2, 3)); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, -58, 38, Math.PI, 0); ctx.strokeStyle = '#6E7A89'; ctx.lineWidth = 15; ctx.stroke();
      ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      rr(ctx, -56, -62, 112, 104, 18); ctx.fillStyle = C.red; ctx.fill(); ctx.restore();
      rr(ctx, -56, -62, 112, 26, 12); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -16, 12, 0, Math.PI * 2); ctx.fillStyle = C.redDark; ctx.fill();
      rr(ctx, -5, -12, 10, 30, 4); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function keys(ctx, x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.strokeStyle = '#8C949E'; ctx.lineWidth = 7; ctx.stroke();
    for (const [a, c] of [[0.5, C.gold], [1.35, '#C9CDD2']]) {
      ctx.save(); ctx.rotate(a); ctx.translate(26, 0);
      ctx.beginPath(); ctx.arc(26, 0, 22, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
      ctx.beginPath(); ctx.arc(26, 0, 7, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
      rr(ctx, 44, -8, 70, 16, 3); ctx.fillStyle = c; ctx.fill();
      rr(ctx, 92, 6, 10, 12, 2); rr(ctx, 74, 6, 10, 9, 2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  function roller(ctx, x, y, s) {                                     // paint roller, head centred at (x, y)
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#3B4658'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(130, 0); ctx.lineTo(160, 0); ctx.lineTo(160, 70); ctx.lineTo(40, 110); ctx.lineTo(40, 170); ctx.stroke();
    rr(ctx, 26, 160, 28, 120, 12); ctx.fillStyle = C.navy; ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    rr(ctx, -130, -26, 260, 52, 24); ctx.fillStyle = '#FBF2DF'; ctx.fill(); ctx.restore();
    rr(ctx, -130, -26, 260, 52, 24); ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }
  function agreement(ctx, x, y, s, rot, strike) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -150, -190, 300, 380, 12, '#FFFFFF', { blur: 30, oy: 14 });
    txt(ctx, 'AGREEMENT', 0, -130, { f: '900 34px Inter', a: 'center', c: C.navy, ls: 3 });
    for (let i = 0; i < 6; i++) { const yy = -80 + i * 42, wv = i === 2 ? 230 : [200, 220, 0, 180, 210, 150][i];
      if (i === 2) { rr(ctx, -125, yy - 16, 250, 34, 8); ctx.fillStyle = C.redTint; ctx.fill(); rr(ctx, -110, yy - 6, 220, 13, 6); ctx.fillStyle = C.red; ctx.fill(); }
      else { rr(ctx, -110, yy - 6, wv, 12, 6); ctx.fillStyle = C.navyFaint; ctx.fill(); } }
    if (strike > 0) { ctx.strokeStyle = C.navy; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-132, 4 - 2); ctx.lineTo(-132 + 264 * eo(strike), 4 - 2 - 8 * strike); ctx.stroke(); }
    ctx.restore();
  }
  function phone(ctx, cx, cy, s, flash) {                                // camera frame (screen-space), see-through
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    const w = 470, h = 760;
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 56); ctx.roundRect(-w / 2 + 22, -h / 2 + 60, w - 44, h - 170, 18);
    ctx.fillStyle = C.navy; ctx.fill('evenodd'); ctx.restore();
    if (flash > 0) { rr(ctx, -w / 2 + 22, -h / 2 + 60, w - 44, h - 170, 18); ctx.fillStyle = `rgba(255,255,255,${0.85 * flash})`; ctx.fill(); }
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const bx = w / 2 - 54, by1 = -h / 2 + 92, by2 = h / 2 - 142;                                  // viewfinder corners
    for (const [sx, sy] of [[-1, by1], [1, by1], [-1, by2], [1, by2]]) {
      const yy = sy, xx = sx * bx, dy = sy === by1 ? 34 : -34;
      ctx.beginPath(); ctx.moveTo(xx, yy + dy); ctx.lineTo(xx, yy); ctx.lineTo(xx - sx * 34, yy); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, h / 2 - 56, 34, 0, Math.PI * 2); ctx.fillStyle = '#FFFDF8'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, h / 2 - 56, 26, 0, Math.PI * 2); ctx.strokeStyle = C.cyan; ctx.lineWidth = 5; ctx.stroke();
    rr(ctx, -40, -h / 2 + 22, 80, 16, 8); ctx.fillStyle = '#1B2C52'; ctx.fill();
    ctx.restore();
  }
  function polaroid(ctx, x, y, s, rot, lab, st) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    card(ctx, -110, -130, 220, 260, 10, '#FFFFFF', { blur: 24, oy: 10 });
    ctx.save(); rr(ctx, -94, -114, 188, 180, 4); ctx.clip();
    ctx.fillStyle = '#F4EEE2'; ctx.fillRect(-94, -114, 188, 180);
    ctx.translate(-94, -114); ctx.scale(188 / 860, 180 / 860); ctx.translate(-70, -600);
    room(ctx, st);
    ctx.restore();
    txt(ctx, lab, 0, 112, { f: '900 40px Inter', a: 'center', c: C.navy, ls: 4 });
    ctx.restore();
  }
  function writtenNote(ctx, x, y, s, k, pen) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.03);
    card(ctx, -230, -150, 460, 300, 16, '#FFFFFF', { blur: 34, oy: 14 });
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = C.cyanTint; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-190, -70 + i * 56); ctx.lineTo(190, -70 + i * 56); ctx.stroke(); }
    const segs = [[-180, -84, 260], [-180, -28, 330], [-180, 28, 220], [-180, 84, 150]];          // handwriting squiggles
    let total = k * segs.length, px = -180, py = -84;
    ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    segs.forEach(([x0, y0, len], i) => {
      const f = clamp(total - i); if (f <= 0) return;
      ctx.beginPath();
      for (let j = 0; j <= 40 * f; j++) { const xx = x0 + (len * j) / 40, yy = y0 + Math.sin(j * 1.3 + i) * 9 * Math.sin(j * 0.31 + i * 2); if (j === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); px = xx; py = yy; }
      ctx.stroke();
    });
    if (pen > 0) {                                                                                     // the pen follows the line
      ctx.save(); ctx.globalAlpha *= pen; ctx.translate(px, py); ctx.rotate(-0.6);
      rr(ctx, 0, -12, 170, 24, 10); ctx.fillStyle = C.cyanDark; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-24, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = '#F1DDB4'; ctx.fill();
      ctx.beginPath(); ctx.arc(-20, 0, 4, 0, Math.PI * 2); ctx.fillStyle = C.navy; ctx.fill();
      ctx.restore();
    }
    ctx.restore();
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

  // ---------- camera (world → screen): focus point lands on (500, 1030) ----------
  const CAMK = [[0, 500, 1030, 1.0], [2.1, 500, 1030, 1.0], [4.8, 500, 1005, 1.07], [6.85, 500, 1005, 1.07], [7.3, 500, 1030, 1.0],
    [10.25, 500, 1030, 1.0], [10.8, 500, 965, 1.24], [14.05, 500, 965, 1.24], [14.65, 378, 905, 1.65], [17.5, 378, 905, 1.65],
    [18.1, 600, 1010, 1.22], [21.1, 600, 1010, 1.22], [21.7, 500, 1030, 1.0], [30, 500, 1030, 1.0]];
  function cam(t) {
    for (let i = 0; i < CAMK.length - 1; i++) {
      const a = CAMK[i], b = CAMK[i + 1];
      if (t <= b[0]) { const k = eio(P(t, a[0], b[0])); return { fx: lerp(a[1], b[1], k), fy: lerp(a[2], b[2], k), z: lerp(a[3], b[3], k) }; }
    }
    const l = CAMK[CAMK.length - 1]; return { fx: l[1], fy: l[2], z: l[3] };
  }
  const toScreen = (cm, x, y) => [500 + (x - cm.fx) * cm.z, 1030 + (y - cm.fy) * cm.z];

  // ---------- state of the flat over time ----------
  function flatState(t) {
    let fade = 1, wipe = 0, sun = 0.4, day = 1;
    if (t >= E.rewind) {                                                  // rewind to move-in day, then a time-lapse
      const rw = eio(P(t, E.rewind, E.rewind + 0.6));
      fade = 1 - rw; sun = 0.4 - Math.sin(Math.PI * rw) * 0.5;
      if (t >= E.lapse) {
        const lp = P(t, E.lapse, E.lapse + 0.9), ph = lp * 3;
        sun = (ph % 1); day = lp >= 1 ? 1 : 0.55 + 0.45 * Math.cos(2 * Math.PI * ph);
        fade = eio(lp);
        if (lp >= 1) sun = 0.4;
      }
    }
    if (t >= E.roll) wipe = eio(P(t, E.roll, E.roll + 0.95));
    const crack = t >= E.crack ? P(t, E.crack, E.crack + 0.22) : 0;
    const heal = P(t, E.fixed, E.fixed + 0.35);
    return { fade, wipe, sun, day, crack, heal, c1: eo(P(t, E.circ1, E.circ1 + 0.4)) * (1 - P(t, E.rewind, E.rewind + 0.3)), c2: 1 - P(t, E.rewind, E.rewind + 0.3),
      ringW: 1 + 0.6 * Math.max(Math.exp(-Math.max(0, t - E.circ1) * 5) * (t >= E.circ1 ? 1 : 0), Math.exp(-Math.max(0, t - E.circ2) * 5) * (t >= E.circ2 ? 1 : 0)) };
  }
  function keysPos(t) {                                                   // dropped on the floor, later hung by the door
    if (t < E.keys) return null;
    const d = t - E.keys, land = 0.32;
    let x = 205, y, rot = 0.3;
    if (d < land) { const k = d / land; y = lerp(1060, 1330, k * k); rot = lerp(-0.5, 0.3, k); }
    else { y = 1330 - Math.abs(Math.sin((d - land) * 9)) * 40 * Math.exp(-(d - land) * 6); }
    if (t >= E.keysHand) { const k = eio(P(t, E.keysHand, E.keysHand + 0.6)); const arc = Math.sin(Math.PI * k) * 120;
      x = lerp(205, HOOK[0], k); y = lerp(1330, HOOK[1] + 40, k) - arc; rot = lerp(0.3, 1.45, k); }
    return [x, y, rot];
  }

  // ---------- frame ----------
  function scene(ctx, t, thumb = false) {
    const cm = cam(t), st = flatState(t);
    const roomA = 1 - eio(P(t, E.v9 - 0.15, E.v9 + 0.35));
    if (roomA > 0) {
      ctx.save(); ctx.globalAlpha = roomA;
      ctx.translate(500, 1030); ctx.scale(cm.z, cm.z); ctx.translate(-cm.fx, -cm.fy);
      room(ctx, st);
      const kp = keysPos(t); if (kp) keys(ctx, kp[0], kp[1], 1.0, kp[2]);
      // repaint: roller sweeps the back wall
      if (t >= E.roll - 0.25 && t < E.job + 0.5) {
        const k = P(t, E.roll - 0.25, E.roll), out = P(t, E.job, E.job + 0.5);
        const ry = RM.bt + (RM.bb - RM.bt) * st.wipe;
        ctx.save(); ctx.globalAlpha *= clamp(k * 3) * (1 - out);
        roller(ctx, 500 + Math.sin(t * 9) * 4, ry - (1 - eo(k)) * 160, 1.15);
        ctx.restore();
      }
      ctx.restore();
      // labels and screen-space props
      ctx.save(); ctx.globalAlpha = roomA;
      hookProps(ctx, t, thumb);
      sceneLabels(ctx, t, cm);
      ctx.restore();
    }
  }
  function hookProps(ctx, t, thumb) {                                     // V1: the locked deposit envelope
    const out = eio(P(t, E.v3 - 0.05, E.v3 + 0.4));
    if (out >= 1) return;
    const bob = thumb ? 0 : Math.sin(t * 2.2) * 6;
    const x = 520 + out * 520, y = 1290 + bob + out * 80, rot = -0.05 + out * 0.3;
    ctx.save(); ctx.globalAlpha *= 1 - out * 0.3;
    const sh = ctx.createRadialGradient(x, 1440, 10, x, 1440, 300); sh.addColorStop(0, 'rgba(2,25,59,0.22)'); sh.addColorStop(1, 'rgba(2,25,59,0)');
    ctx.save(); ctx.translate(0, 1440); ctx.scale(1, 0.18); ctx.translate(0, -1440); ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(x, 1440, 300, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    envelope(ctx, x, y, 1.0, rot, { lock: 1, lockDt: thumb ? 0 : t - E.lock, amount: 45000 });
    ctx.restore();
  }
  function sceneLabels(ctx, t, cm) {
    // V3: Tamil Nadu tenancy law stamp over the dimmed flat
    const sw = Math.min(eo(P(t, E.v3, E.v3 + 0.25)), 1 - eio(P(t, E.v4 - 0.25, E.v4 + 0.05)));
    if (sw > 0) {
      ctx.save(); ctx.fillStyle = `rgba(244,238,226,${0.72 * sw})`; ctx.fillRect(0, 590, W, 1000); ctx.restore();
      const k = t < E.stamp ? 1.6 : lerp(1.6, 1, eob(P(t, E.stamp, E.stamp + 0.35), 1.2));
      ctx.save(); ctx.globalAlpha *= clamp((t - E.stamp + 0.12) * 6) * sw;
      stampCard(ctx, CX, 1040, k, 'TAMIL NADU', 'TENANCY ACT');
      ctx.restore();
    }
    // V4: normal wear and tear
    const w4 = Math.min(1, 1 - eio(P(t, E.v5 - 0.2, E.v5 + 0.15)));
    if (t >= E.wearOk && w4 > 0) {
      ctx.save(); ctx.globalAlpha *= w4;
      pill(ctx, 'NORMAL WEAR', CX, 1530, spring(t - E.wearOk, 1.6, 0.6), { icon: 'ok' });
      ctx.restore();
    }
    // V5: repainting is the landlord's job; the agreement's contrary line is struck
    const w5 = 1 - eio(P(t, E.v6 - 0.2, E.v6 + 0.15));
    if (t >= E.job && w5 > 0) {
      ctx.save(); ctx.globalAlpha *= w5;
      if (t >= E.agree) {
        const k = spring(t - E.agree, 1.4, 0.6);
        agreement(ctx, 760 + (1 - k) * 420, 1090, 0.95, 0.07 + wobble(t - E.agree, 0.08, 1.3, 2.4), P(t, E.strike, E.strike + 0.35));
      }
      pill(ctx, "LANDLORD'S JOB", CX, 1530, spring(t - E.job, 1.6, 0.6));
      ctx.restore();
    }
    // V6: a cricket ball (damage you cause) flies into the window and cracks it
    if (t >= E.crack - 0.5 && t < E.crack + 0.9) {
      const [ix, iy] = toScreen(cm, WIN.x + WIN.w * 0.42, WIN.y + WIN.h * 0.36);
      let x, y, s, a = 1;
      if (t < E.crack) { const k = P(t, E.crack - 0.5, E.crack), e = k * k; x = lerp(170, ix, e); y = lerp(1620, iy, e) - Math.sin(Math.PI * k) * 120; s = lerp(1.25, 0.5, e); }
      else { const d = t - E.crack; x = ix - d * 90; y = iy + d * 40 + 900 * d * d; s = 0.5; a = 1 - P(d, 0.5, 0.9); }
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(t * 14); ctx.scale(s, s);
      ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
      ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); const bg = ctx.createRadialGradient(-16, -18, 6, 0, 0, 56);
      bg.addColorStop(0, '#D45A44'); bg.addColorStop(1, '#8E2F1F'); ctx.fillStyle = bg; ctx.fill(); ctx.restore();
      ctx.strokeStyle = '#F3E3C3'; ctx.lineWidth = 5; ctx.setLineDash([7, 7]);
      for (const o of [-9, 9]) { ctx.beginPath(); ctx.ellipse(o, 0, 14, 50, 0, -1.25, 1.25); ctx.stroke(); }
      ctx.setLineDash([]); ctx.restore();
      if (t >= E.crack && t < E.crack + 0.25) {                                          // impact flash
        const k = P(t, E.crack, E.crack + 0.25);
        ctx.save(); ctx.globalAlpha *= 1 - k; ctx.beginPath(); ctx.arc(ix, iy, 30 + 120 * k, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 10 * (1 - k) + 2; ctx.stroke(); ctx.restore();
      }
    }
    // V6: damage you cause is deducted: notes leave the envelope to fix the window
    const w6 =Math.min(eo(P(t, E.v6 + 0.6, E.v6 + 1.0)), 1 - eio(P(t, E.v7 - 0.1, E.v7 + 0.3)));
    if (w6 > 0) {
      const amt = Math.round(lerp(45000, 43500, eio(P(t, E.notes + 0.05, E.notes + 0.55))) / 100) * 100;
      const ex = 790, ey = 1365;
      ctx.save(); ctx.globalAlpha *= w6;
      envelope(ctx, ex, ey + (1 - w6) * 160, 0.62, -0.06, { amount: amt, amtC: t > E.notes && t < E.fixed + 0.6 ? C.red : C.navy });
      ctx.restore();
      const [wx, wy] = toScreen(cm, WIN.x + WIN.w / 2, WIN.y + WIN.h / 2);
      for (let i = 0; i < 2; i++) {
        const k = P(t, E.notes + i * 0.12, E.notes + i * 0.12 + 0.5);
        if (k <= 0 || k >= 1) continue;
        const e = eio(k), arc = Math.sin(Math.PI * e) * 220;
        const x = lerp(ex - 20, wx, e), y = lerp(ey - 90, wy, e) - arc;
        ctx.save(); ctx.globalAlpha *= 1 - P(k, 0.8, 1); note(ctx, x, y, lerp(0.9, 0.55, e), e * 5 + i, i ? '#E9D1A6' : '#CFE0C2'); ctx.restore();
      }
      if (t >= E.notes + 0.2) pill(ctx, 'DEDUCTED', CX, 1560, spring(t - E.notes - 0.2, 1.6, 0.6), { c: C.red });
    }
    // V7: the rest comes back at handover
    const w7 = Math.min(1, 1 - eio(P(t, E.v8 - 0.1, E.v8 + 0.3)));
    if (t >= E.envBack - 0.2 && w7 > 0) {
      const k = spring(t - E.envBack + 0.2, 1.3, 0.62);
      ctx.save(); ctx.globalAlpha *= w7 * clamp(k * 2);
      envelope(ctx, lerp(-260, 330, k), 1330 + wobble(t - E.envBack, 10, 1.4, 2.5), 0.78, lerp(-0.4, -0.04, clamp(k)), { amount: 43500, notes: 1 });
      badge(ctx, 490, 1210, spring(t - E.ok7, 2, 0.5), true, 46);
      if (t >= E.handover) pill(ctx, 'AT HANDOVER', CX, 1560, spring(t - E.handover, 1.6, 0.6));
      ctx.restore();
    }
    // V8: payoff: photograph every room (in / out), deductions in writing
    if (t >= E.v8 && t < E.v9 + 0.4) {
      const outP = eio(P(t, E.v9 - 0.15, E.v9 + 0.3));
      ctx.save(); ctx.globalAlpha *= 1 - outP;
      const ph = spring(t - E.v8 - 0.15, 1.3, 0.65), phOut = eio(P(t, E.write - 0.3, E.write + 0.2));
      if (phOut < 1) {
        const fl = Math.max(0, 1 - (t - E.snap1) / 0.25) * (t >= E.snap1 ? 1 : 0) + Math.max(0, 1 - (t - E.snap2) / 0.25) * (t >= E.snap2 ? 1 : 0);
        phone(ctx, 500, 1040 + (1 - ph) * 900 + phOut * 900, 1.0, clamp(fl));
      }
      const snapSt = { fade: 0, wipe: 0, sun: 0.4, day: 1 };
      for (const [te, lab, tx] of [[E.snap1, 'IN', 300], [E.snap2, 'OUT', 700]]) {
        if (t < te + 0.1) continue;
        const k = spring(t - te - 0.1, 1.3, 0.62), yy = lerp(1050, 1300, clamp(k));
        polaroid(ctx, lerp(500, tx, clamp(k)), yy, lerp(0.7, 1.0, clamp(k)), (tx < 500 ? -0.1 : 0.1) * clamp(k), lab, snapSt);
      }
      if (t >= E.write) {
        const k = spring(t - E.write, 1.4, 0.62);
        writtenNote(ctx, 500, 930 + (1 - k) * 60, 1.0 * clamp(k * 1.3, 0, 1), P(t, E.write + 0.25, E.write + 1.6), 1 - P(t, E.write + 1.6, E.write + 1.9));
        pill(ctx, 'IN WRITING', CX, 1560, spring(t - E.write - 0.4, 1.6, 0.6), { icon: 'ok' });
      }
      ctx.restore();
    }
  }

  // ---------- CTA (unchanged from the approved episodes) ----------
  function drawCTA(ctx, t) {
    if (t < E.v9) return;
    const k = spring(t - E.v9, 1.6, 0.55);
    const ix = 170, iy = 975, is = 170;
    const ap = eio(P(t, E.v9 + 0.3, E.v9 + 1.3));
    if (ap > 0) {
      ctx.beginPath(); ctx.arc(ix + is / 2, iy + is / 2, 112, Math.PI * 1.05, Math.PI * (1.05 + 0.9 * ap));
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.save(); ctx.translate(ix + is / 2, iy + is / 2); ctx.scale(lerp(0.55, 1, k), lerp(0.55, 1, k)); ctx.globalAlpha = clamp(k * 1.6);
    ctx.save(); ctx.shadowColor = 'rgba(2,25,59,0.25)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.fillStyle = C.navy; ctx.fill(); ctx.restore();
    ctx.save(); rr(ctx, -is / 2, -is / 2, is, is, 40); ctx.clip(); ctx.drawImage(ICON, -is / 2 - 8, -is / 2 - 8, is + 16, is + 16); ctx.restore();
    ctx.restore();
    const tp = eo(P(t, E.v9 + 0.15, E.v9 + 0.65));
    ctx.save(); ctx.globalAlpha = tp; ctx.translate((1 - tp) * 40, 0);
    txt(ctx, 'Follow Courtlens', 376, 1050, { f: '800 58px Inter', maxW: 520 });
    txt(ctx, 'Everyday Indian law, explained', 378, 1106, { f: '600 32px Inter', c: C.navySoft, maxW: 520 });
    ctx.restore();
  }

  // ---------- captions (x 100..900, centred on x=500; band y 340..540) ----------
  const CAP = { size: 64, minSize: 46, maxW: 800, y1: 463 };
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
    chip(ctx, 548, Math.min(eo(P(t, E.v2c + 0.2, E.v2c + 0.5)), 1 - eio(P(t, E.v3 - 0.3, E.v3))));
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
    chip(ctx, 548, 1);
  }
  function init(tl, icon) { TL = tl; E = tl.events; ICON = icon; GRAIN = makeGrain(); }
  window.SCENE = { init, render, renderThumb };
})();
