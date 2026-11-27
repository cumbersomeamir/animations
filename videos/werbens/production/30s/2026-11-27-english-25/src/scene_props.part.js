// ------------------------------------------------------------------ props (illustration): an ORIGINAL miniature store floor — an
// entrance arch, a one-way arrow path, three pop-up rooms (living, bedroom, dining) whose pieces unfold from flat cut-outs,
// flat-pack racks, a lone sofa on a plinth that gets its own room, shopper pawns. No IKEA logo, colours, products or photos; no
// prices or numbers. Palette from app.werbens.com.
const HALF = Math.PI / 2, PT = 0.008, WALL_H = 0.1, WT = 0.006;
const stage = new THREE.Group(); scene.add(stage);
const M = {
  plate: mat("#BFDCD6", { roughness: 0.75, clearcoat: 0.15 }), wall: mat(C3.teal, { roughness: 0.88, clearcoat: 0 }), sofa: mat(C3.mint, { roughness: 0.55, clearcoat: 0.25 }),
  rug: mat("#2F7F7B", { roughness: 0.95, clearcoat: 0 }), ink: mat(C3.ink, { roughness: 0.4, clearcoat: 0.6 }), white: mat(C3.mintw, { roughness: 0.45, clearcoat: 0.4 }),
  slate: mat("#64748B", { roughness: 0.5, clearcoat: 0.3 }), leaf: mat(C3.mint, { roughness: 0.6, clearcoat: 0.1 }), tealD: mat("#24586A", { roughness: 0.6, clearcoat: 0.2 }),
  pawn: mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4 }), shopper: mat("#EEF7F1", { roughness: 0.35, clearcoat: 0.5, emissive: C.mint, emissiveIntensity: 0 }),
  arch: mat(C3.mint, { roughness: 0.35, clearcoat: 0.6, emissive: C.mint, emissiveIntensity: 0.15 }),
};
const GHOST = new THREE.MeshBasicMaterial({ color: "#7FE7DC", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
const GHOST_ROOM = new THREE.MeshBasicMaterial({ color: "#7FE7DC", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
const box = (w, h, d, m, x = 0, y = 0, z = 0, r = 0.0018) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
const cyl = (rt, rb, h, m, x = 0, y = 0, z = 0, seg = 20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
const ball = (r, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), m); o.position.set(x, y, z); o.castShadow = true; return o; };
// textures (no text, no numbers)
const ART_TEX = canvasTex(160, 112, (k, w, h) => { k.fillStyle = "#F0FDFA"; k.fillRect(0, 0, w, h); k.fillStyle = "#7FE7DC"; k.fillRect(10, 10, w - 20, h - 20); k.fillStyle = "#316879"; k.beginPath(); k.moveTo(10, h - 10); k.lineTo(60, 44); k.lineTo(92, 72); k.lineTo(118, 52); k.lineTo(w - 10, h - 10); k.fill(); k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(118, 34, 9, 0, Math.PI * 2); k.fill(); });
const WIN_TEX = canvasTex(200, 140, (k, w, h) => { k.fillStyle = "#F0FDFA"; k.fillRect(0, 0, w, h); const g = k.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0B1120"); g.addColorStop(1, "#24586A"); k.fillStyle = g; k.fillRect(10, 10, w - 20, h - 20); k.fillStyle = "#F0FDFA"; k.fillRect(w / 2 - 3, 10, 6, h - 20); k.fillRect(10, h / 2 - 3, w - 20, 6);
  k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(150, 42, 14, 0, Math.PI * 2); k.fill(); k.fillStyle = "#0B1120"; k.beginPath(); k.arc(158, 37, 12, 0, Math.PI * 2); k.fill(); k.fillStyle = "#7FE7DC"; for (const [x, y] of [[40, 30], [70, 50], [130, 95], [50, 100]]) { k.fillRect(x, y, 3, 3); } });
const TAG_TEX = canvasTex(180, 240, (k, w, h) => { k.fillStyle = "#F0FDFA"; k.beginPath(); k.roundRect(4, 4, w - 8, h - 8, 18); k.fill(); k.strokeStyle = "#0F172A"; k.lineWidth = 8; k.lineCap = "round";
  // ruler (size) icon
  k.beginPath(); k.moveTo(34, 70); k.lineTo(w - 34, 70); k.stroke(); for (let i = 0; i <= 5; i++) { const x = 34 + (i * (w - 68)) / 5; k.beginPath(); k.moveTo(x, 70); k.lineTo(x, i % 5 === 0 ? 40 : 54); k.stroke(); }
  // price-tag glyph
  k.fillStyle = "#316879"; k.beginPath(); k.moveTo(50, 120); k.lineTo(112, 120); k.lineTo(140, 162); k.lineTo(112, 204); k.lineTo(50, 204); k.closePath(); k.fill(); k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(112, 162, 9, 0, Math.PI * 2); k.fill(); });
const CHEV_TEX = canvasTex(128, 128, (k, w) => { k.strokeStyle = "#FFFFFF"; k.lineWidth = 22; k.lineCap = "round"; k.lineJoin = "round"; k.beginPath(); k.moveTo(24, 86); k.lineTo(64, 40); k.lineTo(104, 86); k.stroke(); });

// ------------------------------------------------------------------ furniture builders (origin = back-bottom edge, facing +z)
function makeSofa(m = M.sofa, mBack = M.tealD) { const g = new THREE.Group(); g.add(box(0.09, 0.044, 0.012, mBack, 0, 0.022, 0.006, 0.003), box(0.074, 0.018, 0.036, m, 0, 0.009, 0.03, 0.003), box(0.01, 0.03, 0.048, mBack, -0.04, 0.015, 0.024, 0.003), box(0.01, 0.03, 0.048, mBack, 0.04, 0.015, 0.024, 0.003), box(0.03, 0.02, 0.006, m, -0.018, 0.03, 0.015, 0.002), box(0.03, 0.02, 0.006, m, 0.018, 0.03, 0.015, 0.002)); return g; }
function makeBed() { const g = new THREE.Group(); g.add(box(0.075, 0.016, 0.105, M.white, 0, 0.008, 0.0525, 0.003), box(0.076, 0.007, 0.07, M.wall, 0, 0.0195, 0.07, 0.003), box(0.05, 0.008, 0.018, M.sofa, 0, 0.02, 0.021, 0.003), box(0.079, 0.046, 0.006, M.tealD, 0, 0.023, 0.003, 0.002)); return g; }
function makeTable() { const g = new THREE.Group(); g.add(box(0.075, 0.005, 0.045, M.white, 0, 0.03, 0.0225, 0.002), cyl(0.004, 0.004, 0.028, M.ink, 0, 0.014, 0.0225, 12), cyl(0.012, 0.014, 0.003, M.ink, 0, 0.0015, 0.0225)); return g; }
function makeChair() { const g = new THREE.Group(); g.add(box(0.02, 0.004, 0.02, M.sofa, 0, 0.017, 0.012, 0.0015), box(0.02, 0.026, 0.003, M.sofa, 0, 0.029, 0.0015, 0.0012), cyl(0.0025, 0.0025, 0.015, M.ink, 0, 0.0075, 0.012, 10)); return g; }
function makeLamp(scale = 1) { const g = new THREE.Group(); const shadeM = mat(C3.mintw, { roughness: 0.4, clearcoat: 0.2, emissive: "#F0FDFA", emissiveIntensity: 0 });
  g.add(cyl(0.007, 0.008, 0.002, M.ink, 0, 0.001, 0.008), cyl(0.0015, 0.0015, 0.064, M.ink, 0, 0.033, 0.008, 8)); const sh = cyl(0.008, 0.013, 0.017, shadeM, 0, 0.068, 0.008, 24); g.add(sh);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); glow.position.set(0, 0.062, 0.012); glow.scale.setScalar(0.11); glow.renderOrder = 6; g.add(glow);
  g.scale.setScalar(scale); g.userData = { shadeM, glow }; return g; }
function makePlant() { const g = new THREE.Group(); g.add(cyl(0.008, 0.006, 0.013, M.ink, 0, 0.0065, 0.008), ball(0.011, M.leaf, 0, 0.024, 0.008), ball(0.008, M.leaf, -0.007, 0.033, 0.01), ball(0.007, M.leaf, 0.007, 0.034, 0.006)); return g; }
function makeShelf() { const g = new THREE.Group(); g.add(box(0.06, 0.07, 0.014, M.white, 0, 0.035, 0.007, 0.002), box(0.054, 0.002, 0.012, M.tealD, 0, 0.026, 0.009, 0.001), box(0.054, 0.002, 0.012, M.tealD, 0, 0.05, 0.009, 0.001), cyl(0.004, 0.004, 0.012, M.sofa, -0.015, 0.033, 0.008), box(0.012, 0.01, 0.008, M.wall, 0.012, 0.032, 0.008, 0.001), ball(0.005, M.sofa, 0.0, 0.057, 0.008)); return g; }
function makeSideTable() { const g = new THREE.Group(); g.add(cyl(0.012, 0.012, 0.003, M.ink, 0, 0.022, 0.012), cyl(0.002, 0.002, 0.021, M.ink, 0, 0.0105, 0.012, 8), cyl(0.008, 0.009, 0.002, M.ink, 0, 0.001, 0.012)); const cup = cyl(0.0036, 0.003, 0.007, M.white, 0.003, 0.027, 0.012, 14); g.add(cup); g.userData.cup = cup; return g; }
function makePawn(m, sitting = false) { const g = new THREE.Group(); const h = sitting ? 0.02 : 0.03; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0075, 0.0095, h, 20), m); b.position.y = h / 2; b.castShadow = true; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 20, 14), m); hd.position.y = h + 0.008; hd.castShadow = true; g.add(hd); return g; }

// ------------------------------------------------------------------ pop-up room: every piece hinges up from a flat cut-out
// (hinge.rotation.x = −90° lies it on its back; its depth is squashed while flat). ctx = context (walls, rug, lamp, decor) that
// folds away in the payoff; products (sofa, bed, table, chairs) stay.
function hinge(parent, x, z, yaw = 0) { const pv = new THREE.Group(); pv.position.set(x, PT, z); pv.rotation.y = yaw; parent.add(pv); const h = new THREE.Group(); pv.add(h); return h; }
function makeRoom(kind, cx, cz, side, win, opts = {}) {
  const W = opts.W || 0.2, D = opts.D || 0.17, g = new THREE.Group(); g.position.set(cx, 0, cz); stage.add(g);
  const R = { g, kind, win, parts: [], lamps: [], hideFlat: !!opts.hideFlat, delay: opts.delay || 0, W, D, starts: opts.starts, dur: opts.dur };
  const add = (obj, type, ctx) => { R.parts.push({ obj, type, ctx, k: R.parts.length }); return obj; };
  const plate = box(W, PT, D, M.plate, 0, PT / 2, 0, 0.003); g.add(plate); if (opts.plateCtx) add(plate, "plate", true);
  const bw = hinge(g, 0, -D / 2); bw.add(box(W, WALL_H, WT, M.wall, 0, WALL_H / 2, WT / 2, 0.002)); add(bw, "hinge", true);
  const sw = hinge(g, side * W / 2, 0, -side * HALF); sw.add(box(D, WALL_H, WT, M.wall, 0, WALL_H / 2, WT / 2, 0.002)); add(sw, "hinge", true);
  const decor = new THREE.Group(); decor.position.set(opts.decorX || 0, WALL_H * 0.62, WT + 0.0012); bw.add(decor);
  if (opts.window) { decor.add(box(0.056, 0.04, 0.002, M.white, 0, 0, 0, 0.001)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.052, 0.036), new THREE.MeshBasicMaterial({ map: WIN_TEX, toneMapped: false })); p.position.z = 0.0012; decor.add(p); }
  else { decor.add(box(0.044, 0.03, 0.002, M.white, 0, 0, 0, 0.001)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.026), new THREE.MeshStandardMaterial({ map: ART_TEX, roughness: 0.7 })); p.position.z = 0.0012; decor.add(p); }
  add(decor, "pop", true);
  const rug = new THREE.Group(); rug.position.set(opts.rugX || 0, PT + 0.0008, opts.rugZ || 0.02); rug.add(box(opts.rugW || 0.12, 0.0016, opts.rugD || 0.075, M.rug, 0, 0, 0, 0.0008)); g.add(rug); add(rug, "rug", true);
  const back = -D / 2 + WT + 0.003, inner = -side * 1;
  if (kind === "living") {
    if (!opts.noSofa) { const s = hinge(g, opts.sofaX || 0, back); s.add(makeSofa()); add(s, "hinge", false); R.seat = [opts.sofaX || 0, PT + 0.018, back + 0.03]; }
    const ct = hinge(g, 0, 0.012); ct.add(box(0.045, 0.012, 0.025, M.ink, 0, 0.006, 0.0125, 0.002)); add(ct, "hinge", true);
    const lp = hinge(g, side * (W / 2 - 0.024), back + 0.004); const L = makeLamp(); lp.add(L); R.lamps.push(L); add(lp, "hinge", true);
    const pl = hinge(g, inner * (W / 2 - 0.02), back); pl.add(makePlant()); add(pl, "hinge", true);
  } else if (kind === "bedroom") {
    const b = hinge(g, 0.012 * inner, back); b.add(makeBed()); add(b, "hinge", false); R.seat = [0.012 * inner + 0.03, PT + 0.02, back + 0.06];
    const ns = hinge(g, side * (W / 2 - 0.028), back); ns.add(box(0.022, 0.02, 0.02, M.ink, 0, 0.01, 0.01, 0.002)); const L = makeLamp(0.55); L.position.set(0, 0.02, 0.002); ns.add(L); R.lamps.push(L); add(ns, "hinge", true);
    const pl = hinge(g, inner * (W / 2 - 0.02), back); pl.add(makePlant()); add(pl, "hinge", true);
  } else if (kind === "dining") {
    const t = hinge(g, 0, -0.025); t.add(makeTable()); add(t, "hinge", false);
    R.chairs = [-1, 1].map((sx) => { const c = hinge(g, sx * 0.06, -0.0025, -sx * HALF); c.add(makeChair()); add(c, "hinge", false); return [sx * 0.048, PT + 0.019, -0.0025]; });
    const sh = hinge(g, side * 0.02, back); sh.add(makeShelf()); add(sh, "hinge", true);
    const pl = hinge(g, side * (W / 2 - 0.02), back + 0.01); pl.add(makePlant()); add(pl, "hinge", true);
  }
  if (opts.sideTable) { const st = hinge(g, opts.sideTable[0], opts.sideTable[1]); const S = makeSideTable(); st.add(S); R.cup = S.userData.cup; add(st, "hinge", true); }
  return R;
}
// layout: entrance at z +0.36, path along −z (gentle S), rooms alternate sides, flat-pack racks, the lone sofa at the end
const pathX = (z) => 0.03 * Math.sin(z * 3.3 + 0.4);
// room A: explicit starts so frame 0 catches it mid-unfold (walls rising, rug unrolling, sofa lifting, the rest still flat)
const roomA = makeRoom("living", -0.15, 0.0, -1, T.unfoldA, { sideTable: [0.07, -0.03], delay: 0, starts: [-0.13, -0.08, 0.95, -0.15, -0.06, 0.5, 0.7, 1.05, 1.3], dur: 0.9 });
const roomB = makeRoom("bedroom", 0.15, -0.38, 1, T.unfoldB, { delay: 0.08 });
const roomC = makeRoom("dining", -0.15, -0.76, -1, T.unfoldC, { delay: 0.16 });
const roomD = makeRoom("living", 0, -1.52, -1, T.unfoldD, { noSofa: true, hideFlat: true, plateCtx: true, window: true, decorX: 0.03, W: 0.24, D: 0.2, rugZ: 0.03, rugW: 0.14, rugD: 0.08, sideTable: [0.07, -0.04], delay: 0.24 });
const ROOMS = [roomA, roomB, roomC, roomD];
// the lone sofa on its plinth (inside room D's footprint)
const plinth = box(0.12, 0.012, 0.075, M.ink, 0, 0.006, -1.52 + 0.005, 0.003); stage.add(plinth);
const sofaD = makeSofa(); sofaD.position.set(0, 0.012, -1.52 - 0.032); stage.add(sofaD); roomD.seat = [0, 0.012 + 0.018, -1.52 - 0.002];
const dimBar = new THREE.Group(); dimBar.position.set(0, 0.075, -1.52 - 0.01); stage.add(dimBar);
{ const dm = mat(C3.mintw, { emissive: C.mint, emissiveIntensity: 0.6, roughness: 0.3 }); dimBar.add(box(0.09, 0.0022, 0.0022, dm, 0, 0, 0, 0.0008)); for (const sx of [-1, 1]) dimBar.add(box(0.0022, 0.012, 0.0022, dm, sx * 0.045, 0, 0, 0.0008)); }
const tagG = new THREE.Group(); tagG.position.set(-0.064, 0, -1.462); stage.add(tagG);
{ tagG.add(cyl(0.0015, 0.0015, 0.05, M.slate, 0, 0.025, 0, 8), cyl(0.006, 0.007, 0.002, M.ink, 0, 0.001, 0)); const card = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.04), new THREE.MeshBasicMaterial({ map: TAG_TEX, transparent: true, toneMapped: false, side: THREE.DoubleSide })); card.position.set(0, 0.066, 0.002); tagG.add(card); tagG.userData.card = card; }
// path arrows (chevrons) from the entrance to room D
const PATH_Z0 = 0.33, PATH_Z1 = -1.36, NCHEV = 34;
const chevrons = Array.from({ length: NCHEV }, (_, i) => { const z = lerp(PATH_Z0, PATH_Z1, i / (NCHEV - 1)), x = pathX(z), dz = -0.01, dx = pathX(z + dz) - x; const o = new THREE.Group(); o.position.set(x, 0.0016, z); o.rotation.y = Math.atan2(-dx, -dz);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.03), new THREE.MeshBasicMaterial({ map: CHEV_TEX, color: C.mint, transparent: true, opacity: 0.2, depthWrite: false, toneMapped: false })); p.rotation.x = -HALF; p.renderOrder = 2; o.add(p); stage.add(o); o.userData = { m: p.material, s: i / (NCHEV - 1) }; return o; });
// entrance arch
const arch = new THREE.Group(); arch.position.set(pathX(0.37), 0, 0.37); stage.add(arch); arch.add(box(0.008, 0.1, 0.008, M.arch, -0.07, 0.05, 0), box(0.008, 0.1, 0.008, M.arch, 0.07, 0.05, 0), ball(0.008, M.arch, -0.07, 0.104, 0), ball(0.008, M.arch, 0.07, 0.104, 0)); // two posts, no lintel (the follow-cam passes over)
// flat-pack racks (aisle at x ≈ 0, z −1.0 … −1.26)
const RACK_Z = -1.13, PACKS = [];
for (const rx of [-0.08, 0.08]) { const r = new THREE.Group(); r.position.set(rx, 0, RACK_Z); stage.add(r);
  for (const [px, pz] of [[-0.025, -0.11], [0.025, -0.11], [-0.025, 0.11], [0.025, 0.11]]) r.add(box(0.004, 0.15, 0.004, M.slate, px, 0.075, pz, 0.001));
  [0.004, 0.056, 0.108].forEach((y, li) => { r.add(box(0.054, 0.003, 0.226, M.slate, 0, y, 0, 0.001));
    [-0.072, 0, 0.072].forEach((pz, pi) => { const pk = box(0.046, 0.011, 0.064, (li + pi) % 2 ? M.white : M.tealD, 0, y + 0.0075, pz, 0.0015); r.add(pk); PACKS.push({ o: pk, rx, x0: 0, y0: y + 0.0075, z0: pz, i: PACKS.length }); }); }); }
// the shopper (walks the path), the imagined (ghost) shopper, the dotted thought arc, the cart and the ghost room
const shopper = makePawn(M.shopper); stage.add(shopper);
const ghostP = makePawn(GHOST, true); ghostP.traverse((o) => { o.castShadow = false; }); stage.add(ghostP);
const THINK_N = 12, thinkGeo = new THREE.BufferGeometry(); thinkGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(THINK_N * 3), 3));
const thinkDots = new THREE.Points(thinkGeo, new THREE.PointsMaterial({ size: 0.011, map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); thinkDots.frustumCulled = false; thinkDots.renderOrder = 7; stage.add(thinkDots);
const cart = new THREE.Group(); stage.add(cart);
{ cart.add(box(0.04, 0.004, 0.07, M.slate, 0, 0.009, 0, 0.0015)); for (const [wx, wz] of [[-0.016, -0.028], [0.016, -0.028], [-0.016, 0.028], [0.016, 0.028]]) { const w = cyl(0.0035, 0.0035, 0.003, M.ink, wx, 0.0035, wz, 12); w.rotation.z = HALF; cart.add(w); }
  cart.add(box(0.003, 0.05, 0.003, M.slate, -0.017, 0.034, 0.033, 0.001), box(0.003, 0.05, 0.003, M.slate, 0.017, 0.034, 0.033, 0.001), box(0.037, 0.003, 0.003, M.slate, 0, 0.058, 0.033, 0.001)); }
const cartPack = box(0.046, 0.011, 0.064, M.white, 0, 0, 0, 0.0015); stage.add(cartPack);
const ghostRoom = new THREE.Group(); stage.add(ghostRoom);
{ const gm = GHOST_ROOM; ghostRoom.add(box(0.2, 0.006, 0.17, gm, 0, 0.003, 0, 0.002), box(0.2, 0.1, 0.005, gm, 0, 0.05, -0.0825, 0.002), box(0.005, 0.1, 0.17, gm, -0.0975, 0.05, 0, 0.002));
  const s = makeSofa(gm, gm); s.position.set(0, 0.006, -0.07); ghostRoom.add(s); const L = makeLamp(); L.traverse((o) => { if (o.isMesh) o.material = gm; }); L.userData.glow.visible = false; L.position.set(-0.075, 0.006, -0.07); ghostRoom.add(L);
  ghostRoom.add(box(0.12, 0.002, 0.075, gm, 0, 0.007, 0.02, 0.001)); ghostRoom.traverse((o) => { o.castShadow = false; o.receiveShadow = false; o.renderOrder = 9; }); ghostRoom.scale.setScalar(0.5); }
// life: people in every room for the payoff (sitting)
const life = [];
const sitAt = (room, p) => { const pw = makePawn(M.pawn, true); pw.position.set(p[0], p[1], p[2]); room.g.add(pw); life.push({ o: pw, room }); return pw; };
sitAt(roomA, roomA.seat); sitAt(roomB, roomB.seat); roomC.chairs.forEach((c) => sitAt(roomC, c));
{ const pw = makePawn(M.pawn, true); pw.position.set(roomD.seat[0], roomD.seat[1], roomD.seat[2]); stage.add(pw); life.push({ o: pw, room: roomD }); }
