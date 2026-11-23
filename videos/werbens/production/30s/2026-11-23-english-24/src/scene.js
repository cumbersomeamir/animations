// Werbens · 30 s English-24 — "WHY ROOMS COME FIRST?" (IKEA's store guide starts customers in the showroom: whole furnished
// rooms, furniture in action, flat packs later; picturing yourself using a product can raise wanting it — Escalas 2004, Elder &
// Krishna 2012; show the life around the product), in the accepted 'Satisfying Product Theatre' style on the live app.werbens.com
// dark-navy theme (context/17 re-checked 2026-11-23). Original illustrative miniature store; no IKEA branding, no numbers.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "WHY ROOMS COME FIRST? SHOWROOM FIRST YOUR EVENING PICTURE IT FINISH THE ROOM SHOW THE LIFE Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-15); C3 = lit 3D bases (pre-compensated for ACES
// under this lighting; rendered values measured in QA)
const C = { teal: "#316879", mint: "#7FE7DC", teal2: "#5CE0D2", ink: "#0F172A", mintw: "#F0FDFA", navy: "#0B1120", slate: "#64748B" };
const C3 = { teal: "#2A6273", mint: "#45C9BC", mintw: "#EEF9F7", floor: "#0C1526", ink: "#101A2E", navyLiquid: "#0B1120" };

// ------------------------------------------------------------------ renderer + studio (accepted setup; dark app.werbens.com theme)
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color(C.navy); scene.fog = new THREE.Fog(C.navy, 2.2, 6.0);
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
const camera = new THREE.PerspectiveCamera(38, W / H, 0.03, 60);
{ const g = new THREE.PlaneGeometry(40, 30, 1, 120); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < -2.5) { const d = -2.5 - z; p.setY(i, d * d * 0.32); p.setZ(i, -2.5 - d * 0.75); } }
  g.computeVertexNormals(); const floor = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: C3.floor, roughness: 0.92, metalness: 0 })); floor.receiveShadow = true; scene.add(floor); }
scene.add(new THREE.HemisphereLight("#B4D6E2", "#0B1120", 0.36));
const key_ = new THREE.SpotLight("#FFFFFF", 11, 0, 0.62, 0.9, 2); key_.castShadow = true; key_.shadow.mapSize.set(2048, 2048); key_.shadow.radius = 5; key_.shadow.bias = -0.0004; key_.shadow.normalBias = 0.02; key_.shadow.camera.near = 0.5; key_.shadow.camera.far = 8; scene.add(key_, key_.target);
const hero = new THREE.SpotLight("#F4FFFD", 0, 0, 0.24, 0.85, 2); hero.castShadow = true; hero.shadow.mapSize.set(1024, 1024); hero.shadow.radius = 4; hero.shadow.bias = -0.0004; hero.shadow.camera.near = 0.3; hero.shadow.camera.far = 5; scene.add(hero, hero.target);
const heroC = new THREE.SpotLight("#F4FFFD", 0, 0, 0.26, 0.8, 2); scene.add(heroC, heroC.target);
const rim = new THREE.DirectionalLight(C.mint, 1.6); rim.position.set(0.5, 1.3, -2.2); scene.add(rim);

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
const SHADOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(2,6,14,0.95)"); grd.addColorStop(0.45, "rgba(2,6,14,0.5)"); grd.addColorStop(1, "rgba(2,6,14,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); })();
function contactShadow() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; m.renderOrder = 1; scene.add(m); return m; }
function placeShadow(sh, x, z, h, rx, rz = rx, op = 1) { const s = 1 + h * 0.9; sh.position.set(x, 0.002, z); sh.scale.set(rx * 2.7 * s, rz * 2.7 * s, 1); sh.material.opacity = (op * 0.7) / (1 + h * 2.4); sh.visible = op > 0.01; }
function canvasTex(w, h, draw) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const fitText = (k, txt, font, maxW, px) => { let s = px; k.font = `${s}px ${font}`; while (k.measureText(txt).width > maxW && s > 10) { s -= 2; k.font = `${s}px ${font}`; } };
const GLOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(127,231,220,0.85)"); grd.addColorStop(0.35, "rgba(92,224,210,0.35)"); grd.addColorStop(1, "rgba(92,224,210,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

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

// ------------------------------------------------------------------ CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped)
const tileCTA = new THREE.Group(); scene.add(tileCTA); const tileSh = contactShadow();
const LW = 0.3, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.016, LH + 0.016, 0.045, 5, 0.012), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.016) / 2; slab.castShadow = true; tileCTA.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.016) / 2, 0.0228); tileCTA.add(face); }

// ------------------------------------------------------------------ motion helpers
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
const drop = (t, [t0, t1], h) => (t < t1 ? h * (1 - clamp((t - t0) / (t1 - t0)) ** 2) : 0);



// ------------------------------------------------------------------ captions (accepted word-timed groups; English script words aligned to Whisper tokens)
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9%]/g, "");
function align(line) { const sw = line.script.split(" "), tok = line.words, out = []; let j = 0; for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); } return out; }
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = CAPTIONS[i].t0 ?? c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
let capShown = -1;
function captions(t) {
  const i = THUMB ? -1 : CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
  if (i !== capShown) { cap.innerHTML = "";
    if (i >= 0) { const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill"; const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words];
      for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(nrm(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); }
      cap.appendChild(pill);
      // keep every line inside the 800-px caption box (x 100–900): shrink the group's type only if a line would overflow
      const wmax = Math.max(...[...pill.querySelectorAll(".ln")].map((e) => e.scrollWidth)); if (wmax > 740) for (const e of pill.querySelectorAll(".ln")) { const s = (52 * 740) / wmax; e.style.fontSize = s + "px"; e.style.lineHeight = s * 1.16 + "px"; } }
    capShown = i; }
  if (i < 0) return; const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.4 + 0.6 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 110 + hw, 890 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; }

// ------------------------------------------------------------------ camera: follow-cam along the store path (this episode's
// choreography): hero 3/4 → crane over the entrance → follow the shopper down the path → the lone sofa → side view → turn back to
// the shelves → high overview of the whole path → CTA
const K = (p, t) => [p, t];
// shopper position along the path (pawn is rotationally symmetric, so no yaw)
const WALK_Z1 = -1.36, STAND = [0.06, -1.36], CART_AT = [0.025, -1.04], SHOP_AT_CART = [-0.03, -0.98];
function shopperAt(t) {
  if (t < T.walk[0]) return [pathX(PATH_Z0), PATH_Z0, 0];
  if (t < T.walk[1]) { const u = E.inOut((t - T.walk[0]) / (T.walk[1] - T.walk[0])), z = lerp(PATH_Z0, WALK_Z1, u); return [pathX(z), z, Math.abs(Math.sin(t * 13)) * 0.004]; }
  const st = [lerp(pathX(WALK_Z1), STAND[0], ramp(t, T.walk[1], T.walk[1] + 0.4)), lerp(WALK_Z1, STAND[1], ramp(t, T.walk[1], T.walk[1] + 0.4)) - 0.025 * ramp(t, ...T.want, E.inOut)];
  const back = ramp(t, T.shelves[0], T.shelves[1] - 0.1, E.inOut); if (back <= 0) return [st[0], st[1], 0];
  return [lerp(st[0], SHOP_AT_CART[0], back), lerp(st[1], SHOP_AT_CART[1], back), back < 1 ? Math.abs(Math.sin(t * 13)) * 0.004 : 0];
}
const FOLLOW = (t) => { const [sx, sz] = shopperAt(t), k = E.inOut(clamp((-sz - 0.55) / 0.6)); return K([0.45 * sx, 0.24 + 0.13 * k, sz + 0.46 + 0.12 * k], [0.5 * sx, 0.04, sz - 0.3]); }; // rises over the racks near the end
const F0 = K([0.06, 0.25, 0.36], [-0.14, 0.04, -0.03]), H1 = K([0.05, 0.235, 0.33], [-0.14, 0.04, -0.03]);
const OV1 = K([0.03, 0.55, 1.1], [0, 0, -0.45]); // solved by projection: no room plate under the SHOWROOM FIRST label (y 560–700)
const D1 = K([-0.02, 0.155, -1.1], [-0.01, 0.05, -1.52]), D1b = K([-0.02, 0.152, -1.13], [-0.01, 0.05, -1.52]), D2 = K([0.02, 0.2, -1.02], [0.0, 0.075, -1.55]);
const S1 = K([0.2, 0.2, -1.2], [-0.01, 0.05, -1.52]), S2 = K([0.19, 0.195, -1.22], [-0.01, 0.05, -1.52]);
const R1 = K([0.0, 0.26, -0.76], [0.01, 0.1, -1.0]), R2 = K([0.0, 0.255, -0.78], [0.01, 0.1, -1.0]);
const OV2 = K([0.0, 1.5, 1.1], [0.0, 0.0, -0.6]), OV2b = K([0.0, 1.48, 1.08], [0.0, 0.0, -0.6]); // framing solved by projection: room C below the label, room A above y ≈ 1680
const OV3 = K([-0.04, 0.36, 0.4], [-0.145, 0.06, -0.03]); // payoff bookend: push into room A (frame 0's room), now lived in
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const FOLLOW_W = [6.2, 9.4];
const CAMS = [[0, ...F0], [2.9, ...H1], [3.0, ...H1], [4.3, ...OV1], [5.5, ...OV1], [FOLLOW_W[0], ...FOLLOW(FOLLOW_W[0])], [FOLLOW_W[1], ...FOLLOW(FOLLOW_W[1])],
  [10.2, ...D1], [12.4, ...D1b], [13.5, ...D2], [14.3, ...D2], [15.1, ...S1], [18.75, ...S2], [19.6, ...R1], [21.3, ...R2], [22.5, ...OV2], [24.05, ...OV2b], [25.7, ...OV3], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  if (t > FOLLOW_W[0] && t < FOLLOW_W[1]) { const f = FOLLOW(t); return { pos: v3(...f[0]), tgt: v3(...f[1]) }; }
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
// room part progress: staggered pop-up inside the room's window; context parts fold flat on "Don't just show the product" and
// pop back on "Show the life around it"
function partU(R, p, t) { const [a, b] = R.win, n = R.parts.length, st = R.starts ? R.starts[p.k] : a + (b - a) * 0.7 * (p.k / (n - 1)), dur = R.dur || Math.max(0.28, (b - a) * 0.38);
  let u = E.outBack(clamp((t - st) / dur));
  if (p.ctx) { const f0 = T.foldAll[0] + R.delay + p.k * 0.03, f = ramp(t, f0, f0 + 0.35, E.inOut), pb = E.outBack(clamp((t - (T.popAll[0] + R.delay + p.k * 0.04)) / 0.4)); u = u * (1 - f) + pb; }
  return u; }
const LAMP_ON = new Map([[roomA, () => [T.lampA, T.lampA + 0.3]], [roomB, () => [T.unfoldB[1] - 0.1, T.unfoldB[1] + 0.2]], [roomD, () => [T.evening, T.evening + 0.35]]]);
for (const R of ROOMS) R.lampPart = R.lamps.map((L) => R.parts.find((p) => p.obj === L.parent || p.obj === L.parent?.parent));
const CUP_Y = roomD.cup.position.y, CUP_Y_A = roomA.cup.position.y; cartPack.material = PACKS[11].o.material;
const thinkP = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, c.tgt.z + 1.75); key_.target.position.set(c.tgt.x, 0.05, c.tgt.z); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut); stage.position.y = -0.4 * cl; stage.visible = cl < 0.999;
  const alone = win(t, T.alone, T.unfoldD[0] + 0.35, 0.3, 0.5), eve = win(t, T.evening, T.shelves[0] + 0.3, 0.4, 0.5);
  key_.intensity = 11 * (1 - 0.45 * alone - 0.22 * eve);

  // --- rooms: parts pop up from flat cut-outs; lamps light; context folds/pops in the payoff
  for (const R of ROOMS) {
    for (const p of R.parts) { const u = partU(R, p, t), o = p.obj;
      if (p.type === "hinge") { o.rotation.x = -HALF * (1 - Math.min(u, 1.08)); o.scale.z = lerp(0.1, 1, clamp(u)); o.visible = R.hideFlat ? u > 0.02 : true; }
      else if (p.type === "rug") { o.scale.x = Math.max(0.02, u); o.visible = R.hideFlat ? u > 0.02 : true; }
      else if (p.type === "pop") { o.scale.setScalar(Math.max(0.001, u)); o.visible = u > 0.01; }
      else if (p.type === "plate") { o.scale.set(Math.max(0.01, u), 1, Math.max(0.01, u)); o.visible = u > 0.02; } }
    R.lamps.forEach((L, j) => { const on = LAMP_ON.has(R) ? ramp(t, ...LAMP_ON.get(R)()) : 0, pu = R.lampPart[j] ? partU(R, R.lampPart[j], t) : 1, g = on * clamp((pu - 0.8) / 0.2);
      L.userData.glow.material.opacity = 0.8 * g; L.userData.glow.visible = g > 0.01; L.userData.shadeM.emissiveIntensity = 0.9 * g; });
  }
  // --- the lone sofa: cold spot, dimension bar on "size", plain tag on "price"; both leave when room D unfolds
  { const gone = 1 - ramp(t, T.unfoldD[0], T.unfoldD[0] + 0.3), ds = E.outBack(ramp(t, T.size, T.size + 0.32)) * gone; dimBar.scale.set(Math.max(0.001, ds), 1, 1); dimBar.visible = ds > 0.01;
    const tg = E.outBack(ramp(t, T.price, T.price + 0.3)) * gone; tagG.scale.setScalar(Math.max(0.001, tg)); tagG.visible = tg > 0.01; tagG.userData.card.rotation.y = 0.25 * Math.sin(t * 2.2); }
  hero.intensity = 3.2 * alone; hero.position.set(0.05, 0.9, -1.25); hero.target.position.set(0, 0.03, -1.52); hero.target.updateMatrixWorld(); heroC.intensity = 0;

  // --- path arrows: faint at rest; light from the entrance into the showroom on "start with the showroom", then a flowing wave
  for (const ch of chevrons) { const s = ch.userData.s, lit = ramp(t, T.pathLight[0] + s * 1.1, T.pathLight[0] + s * 1.1 + 0.15), flow = 0.45 + 0.55 * Math.max(0, Math.sin(s * 9 - t * 2.4)) ** 2;
    ch.userData.m.opacity = 0.16 + 0.7 * lit * flow * (1 - cl); }
  M.arch.emissiveIntensity = 0.15 + 0.5 * pulse(t, T.pawnIn, 0.6);

  // --- shopper
  { const [sx, sz, bob] = shopperAt(t), sp = THUMB ? 0 : E.outBack(ramp(t, T.pawnIn, T.pawnIn + 0.3)); shopper.position.set(sx, bob, sz); shopper.scale.setScalar(Math.max(0.001, sp)); shopper.visible = sp > 0.01;
    M.shopper.emissiveIntensity = 0.35 * win(t, T.ghost[0], T.pictureLab[1], 0.2, 0.3) + 0.3 * pulse(t, T.want[0], 0.5);
    // thought arc from the shopper's head to the imagined shopper on the sofa
    const ta = win(t, T.think[0], T.pictureLab[1], 0.12, 0.35), rev = ramp(t, ...T.think), pos = thinkGeo.attributes.position.array;
    tmpA.set(sx, 0.052, sz); tmpB.set(roomD.seat[0], roomD.seat[1] + 0.04, roomD.seat[2]);
    for (let k = 0; k < THINK_N; k++) { const u = (k + 1) / (THINK_N + 1); thinkP.lerpVectors(tmpA, tmpB, u); thinkP.y += 0.045 * Math.sin(Math.PI * u); const on = u <= rev; pos[3 * k] = thinkP.x; pos[3 * k + 1] = on ? thinkP.y : -5; pos[3 * k + 2] = thinkP.z; }
    thinkGeo.attributes.position.needsUpdate = true; thinkDots.material.opacity = ta; thinkDots.visible = ta > 0.01; }
  // --- the imagined (ghost) shopper on the sofa; reaches for the cup on "using"; becomes a real person in the payoff
  { const go = 0.5 * win(t, T.ghost[0], T.popAll[0] + 0.3, 0.3, 0.3); GHOST.opacity = go; ghostP.visible = go > 0.01; ghostP.position.set(roomD.seat[0], roomD.seat[1] + 0.004 * Math.sin(t * 3), roomD.seat[2]);
    ghostP.scale.setScalar(0.9 + 0.1 * E.outBack(ramp(t, T.ghost[0], T.ghost[1]))); ghostP.rotation.z = -0.25 * win(t, T.using, T.using + 1.3, 0.25, 0.4);
    roomD.cup.position.y = CUP_Y + 0.01 * win(t, T.using, T.using + 1.3, 0.25, 0.4); roomA.cup.position.y = CUP_Y_A; }
  // --- racks: flat packs slide onto the shelves on "Flat packs"; one slides onto the cart on "shelves"; a ghost of the finished
  // room rises above it on "finishing a room"
  for (const pk of PACKS) { const d = (pk.i % 9) * 0.05 + (pk.rx > 0 ? 0.02 : 0), u = E.out(ramp(t, T.racks[0] + d, T.racks[0] + d + 0.35)); pk.o.position.x = pk.x0 + (pk.rx > 0 ? -1 : 1) * 0.07 * (1 - u); pk.o.visible = u > 0.01 && !(pk.i === 11 && t >= T.packOn); }
  { const cv = E.outBack(ramp(t, T.shelves[0] + 0.2, T.shelves[0] + 0.55)); cart.visible = cv > 0.01 && cl < 1; cart.scale.setScalar(Math.max(0.001, cv)); cart.position.set(CART_AT[0], 0, CART_AT[1]);
    const mv = ramp(t, T.packOn, T.packOn + 0.35, E.inOut); cartPack.visible = t >= T.packOn; const from = [0.08, 0.0115, RACK_Z + 0.072], to = [CART_AT[0], 0.0165, CART_AT[1]];
    cartPack.position.set(lerp(from[0], to[0], mv), lerp(from[1], to[1], mv) + 0.02 * Math.sin(Math.PI * mv), lerp(from[2], to[2], mv));
    const gr = win(t, T.ghostRoom[0], T.payCrane[0] + 0.4, 0.4, 0.4); GHOST_ROOM.opacity = 0.7 * gr; ghostRoom.visible = gr > 0.01;
    ghostRoom.position.set(CART_AT[0], 0.035 + 0.035 * E.out(ramp(t, ...T.ghostRoom)) + 0.002 * Math.sin(t * 2.5), CART_AT[1]); ghostRoom.rotation.y = 0.5 + 0.05 * t; ghostRoom.scale.setScalar(0.2 + 0.1 * E.outBack(ramp(t, ...T.ghostRoom))); }
  // --- life: people in every room on "Show the life around it"
  for (const L of life) { const v = E.outBack(clamp((t - (T.popAll[0] + 0.25 + L.room.delay)) / 0.35)); L.o.scale.setScalar(Math.max(0.001, v)); L.o.visible = v > 0.01; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lShow", T.showLab); lab("lEve", T.eveLab); lab("lPic", T.pictureLab); lab("lFin", T.finishLab);
  lab("lLife", T.lifeLab);
  const wd = THUMB ? 0 : ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = THUMB ? 0 : ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

{ // headline lines (frame 0 + thumbnail) share one size that fits inside x 110–890 (centred at x 500)
  $("thumb").style.display = "block";
  const ls = [...document.querySelectorAll("#thumb .t")]; let fs = 150; const wide = () => Math.max(...ls.map((e) => e.getBoundingClientRect().width));
  while (wide() > 770 && fs > 60) { fs -= 2; for (const e of ls) { e.style.fontSize = fs + "px"; e.style.lineHeight = fs + "px"; } }
  $("th2").style.top = 330 + fs * 1.08 + "px"; $("th1").style.top = "330px"; $("thLogo").style.display = THUMB ? "flex" : "none"; }
window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".big, #lockup, #tagline, #thumb .t")].filter((e) => e.closest("#thumb") === null || $("thumb").style.display !== "none").filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
frame(+(Q.get("t") || 0));
window.__ready = true;
