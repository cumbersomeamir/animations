// Werbens · 30 s English-22 — "THE FREE SHIPPING TRAP" (free-shipping thresholds: a basket of 40 pays 6 shipping (46) or adds
// a 10 item to reach the free-shipping line at 50 — four more for an item instead of a fee; in one retailer's data threshold
// offers drove extra sales but lost shipping revenue made them unprofitable; Lewis, Singh & Fay 2006), in the accepted 'Satisfying
// Product Theatre' style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-19). Made-up amounts, no currency.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "THE FREE SHIPPING TRAP ITEM, NOT FEE EXTRA SALES LOST FEES ONLY IF WANTED 0123456789+ Werbens")));
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

// ------------------------------------------------------------------ props (illustration): unbranded basket + products, a shipping
// parcel, a free-shipping meter, number tiles with made-up amounts (no currency), receipt towers, a retailer counter. Palette from
// app.werbens.com. Sets run left → right: A (x 0) basket · B (0.3) towers · C (0.6) retailer · D (0.9) final basket.
const HALF = Math.PI / 2, PLT = 0.02;
const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const numTex = (txt, w = 320, h = 200, dark = false) => canvasTex(w, h, (k, W, H) => { k.fillStyle = dark ? "#0F172A" : "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, W, H, H * 0.28); k.fill();
  k.fillStyle = dark ? "#7FE7DC" : C.ink; k.font = `700 ${Math.round(H * 0.72)}px SG`; let s = Math.round(H * 0.72); while (k.measureText(txt).width > W * 0.84 && s > 20) { s -= 4; k.font = `700 ${s}px SG`; } k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, W / 2, H * 0.55); });
const TEX = Object.fromEntries(["40", "46", "50", "+6", "FREE", "10", "+4"].map((s) => [s, numTex(s)]));
function makeTile(parent, w, h) { const g = new THREE.Group(); parent.add(g);
  const plate = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.004, 2, Math.min(w, h) * 0.2), mat(C3.mintw, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0 })); g.add(plate);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, h * 0.98), new THREE.MeshBasicMaterial({ map: TEX["40"], toneMapped: false, transparent: true })); face.position.z = 0.0022; face.renderOrder = 4; g.add(face);
  return { g, plate, face }; }
const setTile = (tl, key) => { if (tl.face.material.map !== TEX[key]) { tl.face.material.map = TEX[key]; tl.face.material.needsUpdate = true; } };
// flip: turn edge-on, swap at the midpoint, turn back (0.22 s)
function flipKey(changes, t) { let i = 0; for (let j = 1; j < changes.length; j++) if (t >= changes[j][0]) i = j; const [tc, key] = changes[i], prev = i ? changes[i - 1][1] : key, dt = t - tc;
  if (i && dt < 0.11) return { key: prev, a: (dt / 0.11) * HALF }; if (i && dt < 0.22) return { key, a: (1 - (dt - 0.11) / 0.11) * HALF }; return { key, a: 0 }; }

// basket: woven look = mint-white walls with two teal bands, teal rim, arched handle
function makeBasket(parent, s = 1) { const g = new THREE.Group(); g.scale.setScalar(s); parent.add(g);
  const W = 0.14, D = 0.09, H = 0.055, th = 0.0045, wm = mat(C3.mintw, { roughness: 0.42, clearcoat: 0.3 }), tm = mat(C3.teal, { roughness: 0.35 });
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new RoundedBoxGeometry(W, th, D, 2, 0.002), wm, 0, th / 2, 0);
  for (const sz of [-1, 1]) { add(new RoundedBoxGeometry(W, H, th, 2, 0.002), wm, 0, H / 2, sz * (D / 2 - th / 2)); add(new RoundedBoxGeometry(th, H, D, 2, 0.002), wm, sz * (W / 2 - th / 2), H / 2, 0); }
  for (const y of [0.018, 0.034]) { for (const sz of [-1, 1]) { add(new RoundedBoxGeometry(W + 0.002, 0.004, th + 0.0016, 1, 0.001), tm, 0, y, sz * (D / 2 - th / 2)); add(new RoundedBoxGeometry(th + 0.0016, 0.004, D + 0.002, 1, 0.001), tm, sz * (W / 2 - th / 2), y, 0); } }
  for (const sz of [-1, 1]) { add(new RoundedBoxGeometry(W + 0.006, 0.006, 0.008, 2, 0.002), tm, 0, H, sz * (D / 2 - th / 2)); add(new RoundedBoxGeometry(0.008, 0.006, D + 0.006, 2, 0.002), tm, sz * (W / 2 - th / 2), H, 0); }
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.0035, 10, 48, Math.PI), tm); handle.position.set(0, H, 0); handle.castShadow = true; g.add(handle);
  return { g, W, D, H }; }
// products (unbranded): box, jar, bottle; the "extra" item is a small mint box with a teal band
function product(parent, kind, x, z, y0 = 0.004) { const g = new THREE.Group(); g.position.set(x, y0, z); parent.add(g); let m;
  if (kind === "box") { m = new THREE.Mesh(new RoundedBoxGeometry(0.034, 0.075, 0.03, 2, 0.004), mat("#3A8195", { roughness: 0.35, clearcoat: 0.6 })); m.position.y = 0.0375; }
  else if (kind === "jar") { m = new THREE.Mesh(lathe([[0, 0], [0.015, 0], [0.016, 0.004], [0.016, 0.05], [0.012, 0.054], [0, 0.054]]), mat(C3.mintw, { roughness: 0.2, clearcoat: 1 })); const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.01, 28), mat(C3.teal, { roughness: 0.3 })); lid.position.y = 0.059; lid.castShadow = true; g.add(lid); }
  else if (kind === "bottle") { m = new THREE.Mesh(lathe([[0, 0], [0.012, 0], [0.013, 0.003], [0.013, 0.062], [0.007, 0.074], [0.0055, 0.088], [0, 0.088]]), mat(C3.mint, { roughness: 0.25, clearcoat: 1, emissive: C.mint, emissiveIntensity: 0.06 })); }
  else { m = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.072, 0.026, 2, 0.004), mat(C3.mintw, { roughness: 0.3, clearcoat: 0.8, emissive: C.mint, emissiveIntensity: 0 })); m.position.y = 0.036; const band = new THREE.Mesh(new RoundedBoxGeometry(0.031, 0.01, 0.027, 1, 0.002), mat(C3.mint, { roughness: 0.3 })); band.position.y = 0.042; g.add(band); }
  m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.m = m; return g; }
function makeParcel(parent) { const g = new THREE.Group(); parent.add(g);
  const box = new THREE.Mesh(new RoundedBoxGeometry(0.045, 0.032, 0.036, 2, 0.003), mat("#24586A", { roughness: 0.55 })); box.position.y = 0.016; box.castShadow = true; g.add(box);
  const tape = new THREE.Mesh(new RoundedBoxGeometry(0.0455, 0.0325, 0.009, 1, 0.001), mat(C3.mint, { roughness: 0.4 })); tape.position.y = 0.016; g.add(tape);
  return g; }
const GLOWS = []; const glow = (parent) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); parent.add(s); GLOWS.push(s); return s; };
const CHECK_TEX = canvasTex(128, 128, (k, w) => { k.fillStyle = "#7FE7DC"; k.beginPath(); k.arc(w / 2, w / 2, w * 0.47, 0, Math.PI * 2); k.fill(); k.strokeStyle = "#0F172A"; k.lineWidth = w * 0.11; k.lineCap = "round"; k.lineJoin = "round"; k.beginPath(); k.moveTo(w * 0.29, w * 0.52); k.lineTo(w * 0.44, w * 0.67); k.lineTo(w * 0.72, w * 0.36); k.stroke(); });
const makeCheck = (parent, s = 0.02) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: CHECK_TEX, transparent: true, toneMapped: false })); c.renderOrder = 6; parent.add(c); return c; };
const base = (parent, w, d) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, PLT, d, 3, 0.006), mat(C3.ink, { roughness: 0.5, clearcoat: 0.3 })); b.position.y = PLT / 2; b.castShadow = true; b.receiveShadow = true; parent.add(b); return b; };

// ------------------------------------------------------------------ set A (x 0): basket, products, gap, extra item, parcel, meter
const stageA = new THREE.Group(); scene.add(stageA); const shA = contactShadow(); base(stageA, 0.27, 0.16);
const basketA = makeBasket(stageA); basketA.g.position.set(-0.025, PLT, 0);
product(basketA.g, "box", -0.045, 0, 0.004); product(basketA.g, "jar", -0.008, 0.008, 0.004); product(basketA.g, "bottle", 0.018, -0.012, 0.004);
const gapGhost = new THREE.Mesh(new RoundedBoxGeometry(0.032, 0.074, 0.028, 2, 0.004), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false })); gapGhost.renderOrder = 3; basketA.g.add(gapGhost); gapGhost.position.set(0.045, 0.041, 0.01);
const gapGlow = glow(basketA.g); gapGlow.position.set(0.045, 0.06, 0.0);
const itemA = product(stageA, "item", 0, 0); const itemTag = makeTile(itemA, 0.026, 0.016); itemTag.g.position.set(0, 0.06, 0.0135);
const totalA = makeTile(stageA, 0.05, 0.03); // on the basket front
const parcelA = makeParcel(stageA); const parcelTag = makeTile(parcelA, 0.04, 0.022); parcelTag.g.position.set(0, 0.016, 0.0185);
const meter = new THREE.Group(); meter.position.set(0.093, PLT, 0.0); stageA.add(meter);
const MH = 0.14;
{ const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, MH, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: "#E8FFFB", roughness: 0.05, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })); tube.position.y = MH / 2; tube.renderOrder = 5; meter.add(tube);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.006, 32), mat(C3.ink, { roughness: 0.4 })); foot.position.y = 0.003; meter.add(foot); }
const fillGeo = new THREE.CylinderGeometry(0.0095, 0.0095, 1, 32); fillGeo.translate(0, 0.5, 0);
const fill = new THREE.Mesh(fillGeo, mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.25 })); fill.position.y = 0.006; meter.add(fill);
const gapFill = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); gapFill.renderOrder = 4; meter.add(gapFill);
const flagTile = makeTile(meter, 0.04, 0.024); flagTile.g.position.set(0, MH + 0.02, 0); setTile(flagTile, "50");
const flagGlow = glow(meter); flagGlow.position.set(0, MH + 0.02, -0.004);

// ------------------------------------------------------------------ set B (0.3): receipt towers 40 + 6 = 46 vs 40 + 10 = 50
const XB = 0.3, U = 0.0021; // one unit of the made-up amounts = 2.1 mm of tower
const stageB = new THREE.Group(); stageB.position.x = XB; scene.add(stageB); const shB = contactShadow(); base(stageB, 0.24, 0.12);
const towers = [-0.05, 0.05].map((x, k) => { const g = new THREE.Group(); g.position.set(x, PLT, 0); stageB.add(g);
  const b40 = new THREE.Mesh(new RoundedBoxGeometry(0.05, 40 * U, 0.05, 3, 0.004), mat(C3.mintw, { roughness: 0.35, clearcoat: 0.6 })); b40.position.y = 20 * U; b40.castShadow = true; b40.receiveShadow = true; g.add(b40);
  const t40 = makeTile(g, 0.034, 0.02); t40.g.position.set(0, 20 * U, 0.0262); setTile(t40, "40");
  const topH = k ? 10 * U : 6 * U, topM = k ? mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.1 }) : mat("#24586A", { roughness: 0.55, emissive: C.teal, emissiveIntensity: 0 });
  const top = new THREE.Mesh(new RoundedBoxGeometry(0.05, topH, 0.05, 2, 0.003), topM); top.position.y = 40 * U + topH / 2 + 0.001; top.castShadow = true; g.add(top);
  const tt = makeTile(g, 0.028, 0.016); tt.g.position.set(0, 40 * U + topH / 2 + 0.001, 0.0262); setTile(tt, k ? "10" : "+6");
  const sum = makeTile(g, 0.044, 0.026); sum.g.position.set(0, 40 * U + topH + 0.022, 0); setTile(sum, k ? "50" : "46");
  return { g, b40, top, topM, sum, topH }; });
const diff = new THREE.Mesh(new RoundedBoxGeometry(0.054, 4 * U, 0.054, 2, 0.002), new THREE.MeshBasicMaterial({ color: C.mint, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); diff.renderOrder = 4; diff.position.set(0.05, PLT + 48 * U + 0.001, 0); stageB.add(diff);
const diffTile = makeTile(stageB, 0.032, 0.02); diffTile.g.position.set(0.105, PLT + 48 * U, 0.01); setTile(diffTile, "+4");

// ------------------------------------------------------------------ set C (0.6): retailer counter — orders (mini baskets), fee parcels, profit coins
const XC = 0.55, stageC = new THREE.Group(); stageC.position.x = XC; scene.add(stageC); const shC = contactShadow(); base(stageC, 0.26, 0.14);
const miniBaskets = Array.from({ length: 8 }, () => { const b = makeBasket(stageC, 0.32); b.g.position.x = -0.075; return b; });
const feeParcels = Array.from({ length: 5 }, () => { const p = makeParcel(stageC); p.scale.setScalar(0.7); p.position.x = 0; return p; });
const coinGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.0058, 40), coinMat = mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.15, metalness: 0.2 });
const coins = Array.from({ length: 9 }, () => { const c = new THREE.Mesh(coinGeo, coinMat); c.castShadow = true; stageC.add(c); return c; });

// ------------------------------------------------------------------ set D (0.9): final basket (with the wanted item), an unwanted
// extra that drifts away, and the seller's margin coins
const XD = 0.8, stageD = new THREE.Group(); stageD.position.x = XD; scene.add(stageD); const shD = contactShadow(); base(stageD, 0.27, 0.16);
const basketD = makeBasket(stageD); basketD.g.position.set(-0.03, PLT, 0);
product(basketD.g, "box", -0.045, 0, 0.004); product(basketD.g, "jar", -0.008, 0.008, 0.004); product(basketD.g, "bottle", 0.018, -0.012, 0.004);
const wantedD = product(basketD.g, "item", 0.045, 0.01, 0.004); const checkD = makeCheck(stageD, 0.022);
const unwanted = product(stageD, "jar", 0, 0); unwanted.scale.setScalar(0.9);
const coinMatD = mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.2, metalness: 0.2 }), marginCoins = Array.from({ length: 5 }, () => { const c = new THREE.Mesh(coinGeo, coinMatD); c.castShadow = true; stageD.add(c); return c; });
const checkM = makeCheck(stageD, 0.022);

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




// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const cam = (x, y, d, ty, tz = 0.05) => [[x, y, d], [x, ty, tz]];
const FA0 = cam(0, 0.25, 0.75, 0.115), FA1 = cam(0, 0.245, 0.72, 0.113), FA2 = cam(0, 0.24, 0.7, 0.111);
const FB = cam(XB, 0.25, 0.72, 0.13), FB2 = cam(XB, 0.245, 0.69, 0.128);
const FC = cam(XC, 0.23, 0.66, 0.1), FC2 = cam(XC, 0.225, 0.63, 0.098);
const FD = cam(XD, 0.25, 0.74, 0.115), FD2 = cam(XD, 0.245, 0.71, 0.113);
const CTAV = [[XD, 0.28, 1.3], [XD, 0.098, 0]], CTAV2 = [[XD, 0.28, 1.26], [XD, 0.098, 0]];
const CAMS = [[0, ...FA0], [3.3, ...FA0], [4.2, ...FA1], [7.5, ...FA1], [8.4, ...FA2], [11.25, ...FA2], [12.0, ...FB], [12.5, ...FB], [14.2, ...FB2], [14.3, ...FB2], [15.1, ...FC], [17.0, ...FC], [21.7, ...FC2], [21.8, ...FC2], [22.6, ...FD], [25.5, ...FD2], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...FA0[0]), tgt: v3(...FA0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
const L3 = (a, b, u) => a.map((v, k) => lerp(v, b[k], u));
const arc = (a, b, u, h) => { const p = L3(a, b, u); p[1] += h * Math.sin(Math.PI * u); return p; };

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(c.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  const vis = (x) => Math.abs(c.tgt.x - x) < 0.42;
  stageA.visible = vis(0) && t < 12.5; stageB.visible = vis(XB) && t > 10.8 && t < 15.6; stageC.visible = vis(XC) && t > 13.8 && t < 22.8; stageD.visible = vis(XD) && cl < 0.999; stageD.position.y = -0.27 * cl;
  placeShadow(shA, 0, 0, 0, 0.14, 0.08, stageA.visible ? 0.8 : 0); placeShadow(shB, XB, 0, 0, 0.12, 0.06, stageB.visible ? 0.8 : 0);
  placeShadow(shC, XC, 0, 0, 0.13, 0.07, stageC.visible ? 0.8 : 0); placeShadow(shD, XD, 0, 0, 0.14, 0.08, stageD.visible ? 0.8 * (1 - cl) : 0);

  // --- set A: the gap, the extra item, the total, the parcel, the meter
  { const GAP = [0.02, PLT + 0.004, 0.01], HOVER0 = [0.05, PLT + 0.08, 0.015], TUG = [0.032, PLT + 0.068, 0.014], AWAY = [0.024, PLT + 0.112, 0.0];
    const tug = ramp(t, ...T.tug, E.inOut), bk = ramp(t, ...T.back, E.inOut), drop = ramp(t, ...T.addItem, E.in);
    let p = L3(HOVER0, TUG, tug); p = L3(p, AWAY, bk); if (drop > 0) p = arc(AWAY, GAP, drop, 0.015);
    const bob = drop > 0 ? 0 : 0.003 * Math.sin(t * 3.1); itemA.position.set(p[0], p[1] + bob, p[2]); itemA.rotation.z = (1 - drop) * (0.25 - 0.15 * tug) + 0.04 * Math.sin(t * 2.3) * (1 - drop);
    itemA.userData.m.material.emissiveIntensity = 0.15 * (1 - drop) + 0.2 * pulse(t, T.addItem[1], 0.4);
    const inGap = drop >= 1, gl = (1 - ramp(t, T.addItem[1] - 0.1, T.addItem[1] + 0.2)) * (0.55 + 0.25 * Math.sin(t * 4.5) + 0.4 * win(t, ...T.tug, 0.15, 0.3));
    gapGlow.visible = gl > 0.01; gapGlow.material.opacity = 0.6 * gl; gapGlow.scale.set(0.07, 0.07, 1); gapGhost.visible = !inGap; gapGhost.material.opacity = 0.12 + 0.12 * gl;
    itemTag.g.visible = ramp(t, T.addItem[0] - 0.4, T.addItem[0]) > 0.5 || t >= T.addItem[0]; itemTag.g.scale.setScalar(Math.max(0.001, ramp(t, T.addItem[0] - 0.4, T.addItem[0], E.outBack))); setTile(itemTag, "10");
    // total tile on the basket front: 40 → 46 → 50
    const tv = ramp(t, T.t40 - 0.05, T.t40 + 0.25, E.outBack), tk = flipKey([[0, "40"], [T.t46, "46"], [T.t50, "50"]], t);
    totalA.g.visible = tv > 0.005; totalA.g.scale.setScalar(Math.max(0.001, tv)); totalA.g.position.set(-0.012, PLT + 0.03, 0.0475); totalA.g.rotation.x = tk.a; setTile(totalA, tk.key);
    totalA.plate.material.emissiveIntensity = 0.5 * (pulse(t, T.t46, 0.5) + pulse(t, T.t50, 0.5));
    // parcel: slides in on "Shipping costs 6", hooks on (46), unhooks and turns FREE (50)
    const pin = ramp(t, ...T.parcel, E.out), hook = ramp(t, T.t46 - 0.15, T.t46 + 0.15, E.inOut) * (1 - ramp(t, ...T.unhook, E.inOut));
    parcelA.visible = pin > 0.005; parcelA.position.set(lerp(-0.2, -0.078, pin) + 0.01 * hook - 0.02 * ramp(t, ...T.unhook), PLT, 0.068 - 0.01 * hook + 0.01 * ramp(t, ...T.unhook)); parcelA.rotation.y = 0.25 * (1 - pin);
    const pk = flipKey([[0, "+6"], [T.freeTag, "FREE"]], t); parcelTag.g.rotation.x = pk.a; setTile(parcelTag, pk.key); parcelTag.plate.material.emissiveIntensity = 0.4 * pulse(t, T.freeTag, 0.6);
    // meter: fill 40 → 50; the gap (40 → 50) glows from "free from 50"; the flag lights on 50 and when reached
    const v = lerp(40, 50, ramp(t, ...T.fill, E.inOut)), sc = (MH - 0.012) / 50;
    fill.scale.set(1, Math.max(0.001, v * sc), 1); gapFill.position.y = 0.006 + v * sc; gapFill.scale.set(1, Math.max(0.001, (50 - v) * sc), 1);
    gapFill.material.opacity = 0.35 * ramp(t, ...T.flag) * (0.7 + 0.3 * Math.sin(t * 5)) * (1 - ramp(t, T.fill[1] - 0.1, T.fill[1]));
    const fl = win(t, ...T.flag, 0.15, 0.4) + ramp(t, T.fill[1] - 0.1, T.fill[1] + 0.2) * (1 - ramp(t, 11.2, 11.6)); flagGlow.visible = fl > 0.01; flagGlow.material.opacity = 0.6 * clamp(fl); flagGlow.scale.set(0.09, 0.09, 1);
    flagTile.plate.material.emissiveIntensity = 0.4 * clamp(fl); }

  // --- set B: receipt towers build, the 4 difference glows, item vs fee
  { const bu = (k) => ramp(t, T.build[0] + k * 0.25, T.build[0] + k * 0.25 + 0.4, E.out);
    towers.forEach((tw, k) => { tw.g.position.y = PLT + 0.04 * (1 - bu(k)) ; tw.g.scale.setScalar(Math.max(0.001, bu(k)));
      if (k) tw.topM.emissiveIntensity = 0.1 + 0.45 * ramp(t, ...T.swap); else { tw.topM.emissiveIntensity = 0; tw.top.material.color.set(t > T.swap[0] ? "#1C3F4C" : "#24586A"); }
      tw.sum.plate.material.emissiveIntensity = 0.35 * pulse(t, T.build[1] + k * 0.25, 0.5); });
    const d = win(t, T.four[0], T.toC[0], 0.2, 0.3); diff.material.opacity = 0.55 * d * (0.75 + 0.25 * Math.sin(t * 6)); diffTile.g.visible = d > 0.01; diffTile.g.scale.setScalar(Math.max(0.001, E.outBack(ramp(t, T.four[0], T.four[0] + 0.3, E.lin)))); }

  // --- set C: orders, fees, profit
  { const nOrd = 3 + 4 * ramp(t, ...T.orders, E.lin);
    miniBaskets.forEach((b, i) => { const v = clamp(nOrd - i); b.g.visible = v > 0.01; b.g.scale.setScalar(0.32 * Math.max(0.001, E.outBack(v))); b.g.position.set(i < 4 ? -0.098 : -0.058, PLT + (i % 4) * 0.019 + 0.02 * (1 - v), 0.005); });
    feeParcels.forEach((p, i) => { const go = ramp(t, T.lose[0] + (4 - i) * 0.15, T.lose[0] + (4 - i) * 0.15 + 0.25, E.in); p.visible = go < 0.99; p.scale.setScalar(0.7 * Math.max(0.001, 1 - go)); p.position.set(0, PLT + i * 0.0226 + 0.02 * go, 0.005); });
    const nCoin = 9 - 6 * ramp(t, ...T.sink, E.inOut); coins.forEach((cn, i) => { const v = clamp(nCoin - i); cn.visible = v > 0.01; cn.scale.setScalar(Math.max(0.001, v)); cn.position.set(0.075, PLT + 0.003 + i * 0.0062, 0.005); cn.rotation.y = i * 0.6; });
    coinMat.emissiveIntensity = 0.15 - 0.1 * ramp(t, ...T.sink); }

  // --- set D: the wanted item (check), an unwanted extra drifts toward the gap and away, the margin check
  { const tm = ramp(t, ...T.tempt, E.inOut), u = Math.sin(Math.PI * tm), away = ramp(t, T.tempt[0] + 0.7, T.tempt[1], E.in);
    unwanted.visible = stageD.visible && away < 0.99; unwanted.position.set(lerp(0.075, 0.04, u) + 0.06 * away, PLT + 0.07 + 0.012 * u + 0.015 * away, 0.025); unwanted.rotation.z = 0.3 - 0.2 * u; unwanted.scale.setScalar(0.9 * Math.max(0.001, 1 - away));
    const ck = E.outBack(ramp(t, T.keep, T.keep + 0.3, E.lin)) * (1 - cl); checkD.visible = ck > 0.01; checkD.scale.setScalar(Math.max(0.001, ck)); checkD.position.set(0.015, PLT + 0.07, 0.03);
    wantedD.userData.m.material.emissiveIntensity = 0.25 * ramp(t, T.keep, T.keep + 0.3);
    marginCoins.forEach((cn, i) => { cn.position.set(0.09, PLT + 0.003 + i * 0.0062, 0.02); cn.rotation.y = i * 0.6; cn.scale.setScalar(Math.max(0.001, 1 - cl)); });
    const cm = E.outBack(ramp(t, T.margin[0], T.margin[0] + 0.3, E.lin)) * (1 - cl); checkM.visible = cm > 0.01; checkM.scale.setScalar(Math.max(0.001, cm)); checkM.position.set(0.09, PLT + 0.055, 0.03); }

  // --- lights: hero spot follows the focus of each set
  { const tx = c.tgt.x + (t < 11.3 ? 0.0 : 0); hero.intensity = 2.4 * (1 - cl); hero.position.set(tx + 0.1, 1.1, 0.55); hero.target.position.set(tx, PLT + 0.06, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(XD, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, XD, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lItem", T.itemLab); lab("lSales", T.salesLab); lab("lLose", T.loseLab); lab("lPay", T.payLab);
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
