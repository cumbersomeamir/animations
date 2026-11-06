// Werbens · 30 s English-07 — "Is a 320-rupee sandwich expensive?" (anchoring: a high reference price on a menu changes how
// an ordinary price looks), in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment/CTA as
// feedback-05 + english-06; the menu board is feedback-05's easel board). Procedural 3D hero objects on a clean light sweep,
// soft contact shadows, tactile timed changes. Colours/logo from app.werbens.com (context/17).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { ROWS, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "₹1,200 Chef's platter FICTIONAL CAFÉ Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked for this batch); C3 = lit 3D bases pre-compensated (ACES)
const C = { teal: "#316879", mint: "#7FE7DC", teal2: "#5CE0D2", ink: "#0F172A", mintw: "#F0FDFA", navy: "#0B1120", slate: "#64748B", amber: "#F59E0B" };
const C3 = { teal: "#1F4F5F", mint: "#4FC9BC", floor: "#F6FFFD", navy: "#0B1120", amber: "#D47A05" };

// ------------------------------------------------------------------ renderer + studio (accepted setup)
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(C.mintw);
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 80);
{ const g = new THREE.PlaneGeometry(40, 30, 1, 120); g.rotateX(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < -2.5) { const d = -2.5 - z; p.setY(i, d * d * 0.32); p.setZ(i, -2.5 - d * 0.75); } }
  g.computeVertexNormals(); const floor = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: C3.floor, roughness: 0.88, metalness: 0 })); floor.receiveShadow = true; scene.add(floor); }
scene.add(new THREE.HemisphereLight("#FFFFFF", "#D6E4E2", 1.15));
const key_ = new THREE.DirectionalLight("#FFFFFF", 2.4); key_.position.set(-3.2, 7.5, 5.2); key_.castShadow = true;
Object.assign(key_.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 20 }); key_.shadow.mapSize.set(2048, 2048); key_.shadow.radius = 6; key_.shadow.bias = -0.0004; key_.shadow.normalBias = 0.02; scene.add(key_);
const rim = new THREE.DirectionalLight("#E6F7F4", 0.9); rim.position.set(2.5, 4, -6); scene.add(rim);

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
const SHADOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(15,23,42,0.95)"); grd.addColorStop(0.45, "rgba(15,23,42,0.5)"); grd.addColorStop(1, "rgba(15,23,42,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); })();
function contactShadow() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.renderOrder = 1; scene.add(m); return m; }
function placeShadow(sh, x, z, h, rx, rz = rx, op = 1) { const s = 1 + h * 0.9; sh.position.set(x, 0.003, z); sh.scale.set(rx * 2.7 * s, rz * 2.7 * s, 1); sh.material.opacity = (op * 0.62) / (1 + h * 2.4); sh.visible = op > 0.01; }
function canvasTex(w, h, draw) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
let seed = 20261107; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ------------------------------------------------------------------ the menu board (fictional café, on feedback-05's easel)
const BW = 1.0, BH = 1.35, BD = 0.05, BY = 0.2, FACE = BD / 2 + 0.001;
const board = new THREE.Group(); scene.add(board); const boardSh = contactShadow();
{ const b = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 4, 0.03), mat("#FFFFFF", { roughness: 0.5, clearcoat: 0.3 })); b.position.y = BH / 2; b.castShadow = true; b.receiveShadow = true; board.add(b);
  for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, BY + 0.5, 10), mat(C3.navy, { roughness: 0.4 })); leg.position.set(sx * 0.36, (BY + 0.5) / 2 - BY, -0.06); leg.rotation.x = 0.08; leg.castShadow = true; board.add(leg); }
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.2, 10), mat(C3.navy, { roughness: 0.4 })); back.position.set(0, 0.45 - BY, -0.32); back.rotation.x = -0.42; board.add(back);
  const header = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.13), new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, map: canvasTex(920, 130, (k, w, h) => { k.fillStyle = C.ink; k.beginPath(); k.roundRect(0, 0, w, h, 26); k.fill(); k.fillStyle = C.mint; k.font = "74px IDBK"; k.textAlign = "center"; k.textBaseline = "middle"; k.letterSpacing = "6px"; k.fillText("FICTIONAL CAFÉ", w / 2, h * 0.54); }) }));
  header.position.set(0, 1.265, FACE); board.add(header); }
// menu row cards (slam onto the board)
const RW = 0.88, RH = 0.19;
function rowTex(name, price, kind) { return canvasTex(Math.round(RW * 1000), Math.round(RH * 1000), (k, w, h) => {
  const bg = kind === "premium" ? C.navy : "#FFFFFF", fg = kind === "premium" ? "#FFFFFF" : C.ink, pc = kind === "premium" ? C.mint : C.ink;
  k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, w, h, 26); k.fill();
  if (kind === "sandwich") { k.strokeStyle = C.mint; k.lineWidth = 14; k.beginPath(); k.roundRect(7, 7, w - 14, h - 14, 22); k.stroke(); }
  k.fillStyle = fg; k.font = "68px IB"; k.textAlign = "left"; k.textBaseline = "middle"; k.fillText(name, 44, h * 0.53);
  k.fillStyle = pc; k.font = "86px IDBK"; k.textAlign = "right"; k.fillText(price, w - 40, h * 0.54); }); }
const rows = ROWS.map(([id, name, price, y, t0], i) => { const g = new THREE.Group(); board.add(g);
  const m = new THREE.MeshStandardMaterial({ color: id === "premium" ? C3.navy : "#FFFFFF", roughness: 0.5, emissive: new THREE.Color(C.mint), emissiveIntensity: 0 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(RW, RH, 0.014, 2, 0.006), m); base.castShadow = true; g.add(base);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(RW - 0.008, RH - 0.008), new THREE.MeshBasicMaterial({ map: rowTex(name, price, id), toneMapped: false, transparent: true })); face.position.z = 0.0075; g.add(face);
  return { id, g, m, face, y, t0, z: FACE + 0.008 + i * 0.001 }; });
const rowById = Object.fromEntries(rows.map((r) => [r.id, r]));
// fake "WAS ₹500" sticker + the X that rejects it
const fake = new THREE.Group(); board.add(fake);
{ const w = 0.36, h = 0.13; const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.012, 2, 0.005), new THREE.MeshStandardMaterial({ color: C.amber, roughness: 0.5 })); b.castShadow = true; fake.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, h - 0.006), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(720, 260, (k, cw, ch) => { k.fillStyle = C.amber; k.beginPath(); k.roundRect(0, 0, cw, ch, 30); k.fill(); k.fillStyle = C.ink; k.font = "128px IDBK"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("WAS ₹500", cw / 2, ch * 0.55); }) })); f.position.z = 0.0065; fake.add(f); }
const xMark = new THREE.Group(); board.add(xMark);
for (const r of [0.62, -0.62]) { const bar = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.04, 0.014, 2, 0.008), mat(C.ink, { roughness: 0.35 })); bar.rotation.z = r; bar.castShadow = true; xMark.add(bar); }
const FAKE_POS = [0.0, 0.83];

// ------------------------------------------------------------------ the sandwich (fictional club sandwich, two halves) + ₹320 flag
const breadMat = new THREE.MeshPhysicalMaterial({ color: "#DDAE70", roughness: 0.75, clearcoat: 0.1 }), crustMat = new THREE.MeshPhysicalMaterial({ color: "#C98E4B", roughness: 0.7 });
function triLayer(L, thick, m, sc = 1) { const s = new THREE.Shape(); const a = (L * sc) / 2; s.moveTo(-a, -a); s.lineTo(a, -a); s.lineTo(-a, a); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: Math.min(0.006, thick * 0.3), bevelSize: 0.008, bevelSegments: 2, curveSegments: 4 });
  g.translate(a / 3, a / 3, 0); g.rotateX(-Math.PI / 2); const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
function sandwichHalf(L) { const g = new THREE.Group(); let y = 0;
  for (const [th, m, sc] of [[0.03, crustMat, 1], [0.012, mat("#5FA33F", { roughness: 0.5, clearcoat: 0.4 }), 1.07], [0.008, mat("#F2C14E", { roughness: 0.45 }), 1.04], [0.013, mat("#D2483A", { roughness: 0.4, clearcoat: 0.6 }), 0.97], [0.03, breadMat, 1]]) {
    const l = triLayer(L, th, m, sc); l.position.y = y; g.add(l); y += th + 0.004; }
  g.userData.h = y; return g; }
function makeSandwich(L) { const g = new THREE.Group(); const a = sandwichHalf(L), b = sandwichHalf(L);
  a.rotation.y = -0.75 * Math.PI + 0.25; a.position.set(-0.06, 0, 0.03); b.rotation.y = 0.25 * Math.PI + 0.15; b.position.set(0.07, 0, -0.03); g.add(a, b); g.userData.halves = [a, b]; return g; }
const SW_X = -0.3, PROP_Z = 0.86;
const swGroup = new THREE.Group(); scene.add(swGroup); const swSh = contactShadow();
const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.05, 48), mat("#FFFFFF", { roughness: 0.45 })); stand.position.y = 0.025; stand.castShadow = true; stand.receiveShadow = true; swGroup.add(stand);
const sandwich = makeSandwich(0.25); sandwich.position.y = 0.05; swGroup.add(sandwich); swGroup.scale.setScalar(1.12);
const flag = new THREE.Group(); swGroup.add(flag);
{ const pick = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 8), mat("#E9D6B0", { roughness: 0.6 })); pick.position.y = 0.15; pick.castShadow = true; flag.add(pick);
  const card = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.085, 0.006, 2, 0.003), new THREE.MeshStandardMaterial({ color: C.mint, roughness: 0.5 })); card.position.set(0.082, 0.26, 0); card.castShadow = true; flag.add(card);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.155, 0.08), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(620, 320, (k, w, h) => { k.fillStyle = C.mint; k.beginPath(); k.roundRect(0, 0, w, h, 34); k.fill(); k.fillStyle = C.ink; k.font = "176px IDBK"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("₹320", w / 2, h * 0.55); }) })); f.position.set(0.082, 0.26, 0.0035); flag.add(f); }
const FLAG_BASE = [0.0, 0.1, 0.02];

// ------------------------------------------------------------------ the gauge (how pricey does ₹320 look? illustrative)
const GX = 0.34, GS = 1.45;
const gauge = new THREE.Group(); scene.add(gauge); const gaugeSh = contactShadow();
const needle = new THREE.Group();
{ const navy = mat(C3.navy, { roughness: 0.4 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.035, 36), navy); base.position.y = 0.0175; base.castShadow = true; gauge.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 10), navy); post.position.y = 0.07; post.castShadow = true; gauge.add(post);
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.235, 0.03, 3, 0.02), mat("#FFFFFF", { roughness: 0.4 })); back.position.y = 0.22; back.castShadow = true; gauge.add(back);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.215), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(760, 430, (k, w, h) => {
    k.fillStyle = "#FFFFFF"; k.fillRect(0, 0, w, h); const cx = w / 2, cy = 330, r = 230; const grd = k.createLinearGradient(cx - r, 0, cx + r, 0); grd.addColorStop(0, C.mint); grd.addColorStop(0.5, "#E8F4F1"); grd.addColorStop(1, C.amber);
    k.strokeStyle = grd; k.lineWidth = 54; k.lineCap = "round"; k.beginPath(); k.arc(cx, cy, r, Math.PI * 1.04, Math.PI * 1.96); k.stroke();
    k.strokeStyle = "rgba(15,23,42,0.35)"; k.lineWidth = 6; for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.08 + (0.84 * i) / 8); k.beginPath(); k.moveTo(cx + Math.cos(a) * (r - 44), cy + Math.sin(a) * (r - 44)); k.lineTo(cx + Math.cos(a) * (r - 64), cy + Math.sin(a) * (r - 64)); k.stroke(); }
    k.fillStyle = C.ink; k.font = "50px IB"; k.textBaseline = "middle"; k.textAlign = "left"; k.fillText("FAIR", 26, 396); k.textAlign = "right"; k.fillText("PRICEY", w - 26, 396); }) }));
  face.position.set(0, 0.22, 0.0155); gauge.add(face);
  needle.position.set(0, 0, 0.024); gauge.add(needle);
  const nd = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.13, 0.008, 2, 0.004), mat(C.ink, { roughness: 0.3 })); nd.position.y = 0.065; nd.castShadow = true; needle.add(nd);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 20), mat(C3.teal, { roughness: 0.3 })); cap.rotation.x = Math.PI / 2; needle.add(cap); }
needle.position.y = 0.22 + (0.215 / 2 - (330 / 430) * 0.215);

// ------------------------------------------------------------------ the anchor (drops onto the premium row on "anchoring")
const anchor = new THREE.Group(); board.add(anchor);
{ const m = mat(C3.teal, { roughness: 0.28, metalness: 0.25 });
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 12), m); anchor.add(shank);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 28), m); ring.position.y = 0.128; anchor.add(ring);
  const stock = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.016, 0.016, 2, 0.006), m); stock.position.y = 0.08; anchor.add(stock);
  const arms = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 10, 30, Math.PI), m); arms.rotation.z = Math.PI; arms.position.y = -0.03; anchor.add(arms);
  for (const sx of [-1, 1]) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.05, 10), m); fl.position.set(sx * 0.075, -0.03 + 0.012, 0); fl.rotation.z = -sx * 0.5; anchor.add(fl); }
  anchor.children.forEach((c) => (c.castShadow = true)); anchor.scale.setScalar(1.25); }
const ANCHOR_POS = [-0.5, 1.03];

// ------------------------------------------------------------------ the real premium item: a fictional chef's platter
const platter = new THREE.Group(); scene.add(platter); const platterSh = contactShadow();
{ const pp = [new THREE.Vector2(0, 0), new THREE.Vector2(0.23, 0), new THREE.Vector2(0.24, 0.008), new THREE.Vector2(0.24, 0.032), new THREE.Vector2(0.23, 0.038), new THREE.Vector2(0, 0.038)];
  const wood = new THREE.Mesh(new THREE.LatheGeometry(pp, 64), mat("#A8743F", { roughness: 0.55, clearcoat: 0.3 })); wood.castShadow = true; wood.receiveShadow = true; platter.add(wood);
  for (const [x, z, ry] of [[-0.1, 0.06, 0.4], [0.02, 0.1, -0.5], [-0.05, -0.08, 1.4]]) { const s = sandwichHalf(0.12); s.scale.setScalar(1); s.position.set(x, 0.038, z); s.rotation.y = ry; platter.add(s); }
  for (const [x, z, c] of [[0.12, -0.06, "#E0A23A"], [0.13, 0.08, "#7DA453"]]) { const bp = [new THREE.Vector2(0, 0), new THREE.Vector2(0.04, 0), new THREE.Vector2(0.05, 0.035), new THREE.Vector2(0.045, 0.037), new THREE.Vector2(0.035, 0.006), new THREE.Vector2(0, 0.006)];
    const b = new THREE.Mesh(new THREE.LatheGeometry(bp, 32), mat("#FFFFFF", { roughness: 0.3 })); b.position.set(x, 0.038, z); b.castShadow = true; platter.add(b);
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.043, 28), new THREE.MeshStandardMaterial({ color: c, roughness: 0.35 })); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.038 + 0.03, z); platter.add(d); }
  for (let i = 0; i < 9; i++) { const gr = new THREE.Mesh(new THREE.SphereGeometry(0.017, 16, 12), mat("#6A3F78", { roughness: 0.3 })); gr.position.set(0.03 + (i % 3) * 0.03 - (Math.floor(i / 3) % 2) * 0.015, 0.055 + Math.floor(i / 3) * 0.022, -0.12 + Math.floor(i / 3) * 0.012); gr.castShadow = true; platter.add(gr); }
  for (let i = 0; i < 3; i++) { const ch = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.03, 0.03, 2, 0.006), mat("#F2C14E", { roughness: 0.45 })); ch.position.set(-0.14 + i * 0.035, 0.054, -0.01 - i * 0.02); ch.rotation.y = i * 0.6; ch.castShadow = true; platter.add(ch); } }
const platStand = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.27, 0.05, 48), mat("#FFFFFF", { roughness: 0.45 })); platStand.castShadow = true; platStand.receiveShadow = true; scene.add(platStand);

// ------------------------------------------------------------------ CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped)
const tile = new THREE.Group(); scene.add(tile); const tileSh = contactShadow();
const LW = 0.94, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.04, LH + 0.04, 0.12, 5, 0.03), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.04) / 2; slab.castShadow = true; tile.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.04) / 2, 0.0605); tile.add(face); }

// ------------------------------------------------------------------ motion helpers
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
// slam a card onto the board face: flies in from the camera side, lands at +0.17 s, squash
function slam(g, t, t0, x, y, z, rz = 0, s0 = 1.6, dz = 0.9) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); g.visible = t >= t0; const sc = lerp(s0, 1, u) * (1 + sq); g.scale.set(sc, sc, 1); g.position.set(x, y, z + lerp(dz, 0, u)); g.rotation.set(0, 0, rz); }

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0, 1.12, 5.5], [0, 0.82, 0.1]], ANCH = [[-0.06, 1.28, 3.85], [-0.06, 1.0, 0]], LESSON = [[0, 1.05, 5.2], [0, 0.76, 0.15]];
const CAMS = [
  [0.0, [SW_X, 0.53, PROP_Z + 1.4], [SW_X, 0.26, PROP_Z]], [2.95, [SW_X, 0.5, PROP_Z + 1.22], [SW_X, 0.26, PROP_Z]], [4.0, ...FRONT], [11.45, ...FRONT], [12.25, ...ANCH], [14.5, ...ANCH],
  [15.3, ...FRONT], [21.2, ...FRONT], [22.1, ...LESSON], [25.75, ...LESSON], [26.6, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
];
function cameraAt(t) { let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ captions (accepted word-timed groups; English script words aligned to Whisper tokens)
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9%]/g, "");
function align(line) { const sw = line.script.split(" "), tok = line.words, out = []; let j = 0; for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); } return out; }
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
  if (i !== capShown) { cap.innerHTML = "";
    if (i >= 0) { const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill"; const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words];
      for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(nrm(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); }
      cap.appendChild(pill); }
    capShown = i; }
  if (i < 0) return; const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.4 + 0.6 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 96 + hw, 984 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; }

// needle angle: 0 = centre, + = FAIR (left), − = PRICEY (right); swings with a little overshoot
function needleAt(t) { const a = -1.0 * ramp(t, T.pricey - 0.05, T.pricey + 0.3, E.outBack) + 1.95 * ramp(t, T.fair - 0.05, T.fair + 0.32, E.outBack); return a + 0.04 * wobble(t, T.pricey + 0.3, 1, 7, 7) - 0.04 * wobble(t, T.fair + 0.32, 1, 7, 7); }

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in);
  // --- board + rows
  const bx = -2.9 * cl; board.position.set(bx, BY, 0); board.visible = cl < 1; placeShadow(boardSh, bx, -0.1, 0, 0.55, 0.25, board.visible ? 0.6 : 0);
  rows.forEach((r) => { if (r.id === "sandwich") slam(r.g, t, r.t0, 0, r.y, r.z, 0, 1.12, 0.12); else slam(r.g, t, r.t0, 0, r.y, r.z, 0, 1.3, 0.45);
    let p = 0; if (r.id === "sandwich") p = 0.06 * pulse(t, T.above, 0.4) + 0.05 * pulse(t, T.ref[1] - 0.1, 0.4) + 0.05 * pulse(t, T.items, 0.4);
    else if (r.id === "premium") p = 0.06 * pulse(t, T.high, 0.45) + 0.05 * pulse(t, T.extreme, 0.45); else p = 0.05 * pulse(t, T.items + (r.id === "muffin" ? 0.08 : 0.16), 0.4);
    r.g.scale.multiplyScalar(1 + p);
    r.m.emissiveIntensity = r.id === "premium" ? 0.5 * pulse(t, T.high, 0.6) + 0.5 * pulse(t, T.extreme, 0.6) : 0; });
  // --- fake "WAS ₹500" sticker (slaps on on "fake"), X stamp on "was", then both fall away on "price"
  { const fo = ramp(t, ...T.fakeOut, E.in); slam(fake, t, T.fake, FAKE_POS[0], FAKE_POS[1], FACE + 0.03, -0.1); fake.scale.multiplyScalar(0.85); slam(xMark, t, T.xStamp, FAKE_POS[0], FAKE_POS[1], FACE + 0.045, 0); xMark.scale.multiplyScalar(0.8);
    xMark.scale.multiplyScalar(1 - 0.12 * squash(t, T.xStamp + 0.12, 1));
    if (t >= T.fakeOut[0]) for (const [g, s] of [[fake, 1], [xMark, -1]]) { g.position.set(FAKE_POS[0] + 0.25 * fo, FAKE_POS[1] - 1.3 * fo * fo, FACE + 0.03 + 0.35 * fo); g.rotation.set(-1.0 * fo, 0, -0.14 + s * 0.9 * fo); g.visible = fo < 1 && cl < 1; } }
  // --- anchor drops onto the premium row (hangs at its left end)
  { const [a0, a1] = T.anchor, u = clamp((t - a0) / (a1 - a0)), y = t < a1 ? lerp(0.75, 0, u * u) : 0, sq = squash(t, a1, -0.16);
    anchor.visible = t >= a0; anchor.position.set(ANCHOR_POS[0], ANCHOR_POS[1] - 0.06 + y, FACE + 0.035); anchor.rotation.z = 0.18 + 0.06 * wobble(t, a1, 1, 5, 4); anchor.scale.set(1.25 * (1 - sq * 0.4), 1.25 * (1 + sq), 1.25); }
  // --- sandwich halves drop in (already falling on frame 0); ₹320 flag spears in on "320-rupee"; props slide closer on "next to it"
  const nx = ramp(t, ...T.nextTo, E.inOut), swx = SW_X + 0.08 * nx - 2.9 * cl;
  swGroup.position.set(swx, 0, PROP_Z); swGroup.visible = cl < 1; placeShadow(swSh, swx, PROP_Z, 0, 0.24, 0.24, swGroup.visible ? 1 : 0);
  sandwich.userData.halves.forEach((hf, i) => { const [d0, d1] = T.sw[i], u = clamp((t - d0) / (d1 - d0)), y = t < d1 ? lerp(0.5, 0, u * u) : 0, sq = squash(t, d1, -0.14);
    hf.position.y = y; hf.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4); hf.visible = t >= d0 - 0.2; });
  { const u = ramp(t, T.flag, T.flag + 0.16, E.in), sq = squash(t, T.flag + 0.16, -0.12); flag.visible = t >= T.flag; flag.position.set(FLAG_BASE[0], FLAG_BASE[1] + lerp(0.6, 0, u), FLAG_BASE[2]); flag.scale.set(1, 1 + sq, 1); flag.rotation.z = 0.06 * wobble(t, T.flag + 0.16, 1, 6, 5); }
  sandwich.position.y = 0.05 + 0.03 * pulse(t, T.above, 0.35) + 0.025 * pulse(t, T.nextTo[1], 0.3);
  // --- gauge pops in on "it can look", needle swings PRICEY → FAIR; sinks for the lesson
  { const gi = pop(t, T.gauge, 0.3), go = ramp(t, ...T.gaugeOut, E.in), gx = GX - 2.9 * cl; gauge.visible = t >= T.gauge && go < 1; gauge.position.set(gx, -0.6 * go, PROP_Z); gauge.scale.setScalar(GS * Math.max(0.001, gi) * (1 - 0.3 * go));
    needle.rotation.z = needleAt(t); placeShadow(gaugeSh, gx, PROP_Z, 0, 0.16, 0.16, gauge.visible ? 1 - go : 0); }
  // --- the real premium platter slides onto its stand on "real", hops on "premium", moves next to the sandwich on "next to it"
  { const pi = ramp(t, ...T.platterIn, E.out), px = lerp(2.4, GX + 0.02, pi) - 0.08 * nx + 2.9 * cl, hop = 0.06 * pulse(t, T.premiumHop, 0.3) + 0.03 * pulse(t, T.nextTo[1], 0.3), sq = squash(t, T.platterIn[1], -0.08);
    const vis = t >= T.platterIn[0] - 0.05 && cl < 1; platter.visible = platStand.visible = vis;
    platStand.position.set(px, 0.025, PROP_Z); platter.position.set(px, 0.05 + hop, PROP_Z); platter.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3); platter.rotation.y = (1 - pi) * 0.8;
    placeShadow(platterSh, px, PROP_Z, hop, 0.28, 0.28, vis ? 1 : 0); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  board.updateMatrixWorld(); swGroup.updateMatrixWorld();
  const bw = (x, y) => toScreen(board.localToWorld(v3(x, y, FACE + 0.02)));
  hudAt($("nQ"), (() => { const p = toScreen(swGroup.localToWorld(v3(0.27, 0.37, 0))); return [p[0], p[1]]; })(), win(t, ...T.q, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  hudAt($("cite"), [540, 562], win(t, ...T.cite, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite[0], 0.3)));
  hudAt($("illus"), [540, 562], win(t, ...T.illus, 0.25, 0.3));
  let svg = "";
  // reference line: from the ₹1,200 price down to the ₹320 price (dashed, drawn on "sets the reference")
  const ro = ramp(t, ...T.ref, E.out) * (1 - ramp(t, T.refOut, T.refOut + 0.3));
  if (ro > 0.01) { const a = bw(0.45, ROWS[0][3]), b = bw(0.45, ROWS[1][3]), c = [Math.max(a[0], b[0]) + 70, (a[1] + b[1]) / 2], len = 2.2 * Math.hypot(c[0] - a[0], c[1] - a[1]);
    svg += `<path d="M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0] + 8} ${b[1]}" fill="none" stroke="${C.teal}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${len * ro} ${len}"/>`;
    if (ro > 0.95) svg += `<path d="M${b[0] + 30} ${b[1] - 18} L${b[0] + 8} ${b[1]} L${b[0] + 34} ${b[1] + 12}" fill="none" stroke="${C.teal}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`; }
  // would-pay arrows rising beside the moderate rows (direction only — no values)
  const ar = win(t, T.arrows[0], T.cite[1], 0.2, 0.3);
  if (ar > 0.01) ROWS.slice(1).forEach((r, i) => { const u = ramp(t, T.arrows[0] + i * 0.12, T.arrows[1] + i * 0.12, E.outBack), p = bw(0.5, r[3]), x = p[0] + 46, y0 = p[1] + 26, y1 = y0 - 56 * u - 6 * pulse(t, T.items + i * 0.08, 0.4);
    svg += `<g opacity="${ar}"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${C.teal}" stroke-width="9" stroke-linecap="round"/><path d="M${x - 16} ${y1 + 16} L${x} ${y1} L${x + 16} ${y1 + 16}" fill="none" stroke="${C.teal}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>`; });
  $("ov").innerHTML = svg;
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".note, #illus, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
