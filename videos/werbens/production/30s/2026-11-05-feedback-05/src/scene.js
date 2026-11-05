// Werbens · 30 s Hindi feedback-05 — "एक प्रोडक्ट, एक कीमत, एक काम" (a clear restaurant ad beats vague premium adjectives),
// in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment as hindi-03/04): procedural 3D
// hero objects on a clean light sweep, soft contact shadows, tactile timed changes. Colours/logo from app.werbens.com (context/17).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { STICKERS, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["800 52px NSD", "700 36px NSD", "700 104px SG"].map((f) => document.fonts.load(f, "अआ शब्द ₹250 Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-05); C3 = lit 3D bases pre-compensated (ACES)
const C = { teal: "#316879", mint: "#7FE7DC", teal2: "#5CE0D2", ink: "#0F172A", mintw: "#F0FDFA", navy: "#0B1120", slate: "#64748B", amber: "#F59E0B" };
const C3 = { teal: "#1F4F5F", mint: "#4FC9BC", floor: "#F6FFFD", navy: "#0B1120" };

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
const star = (g, cx, cy, r) => { g.beginPath(); for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.fill(); };
const STK = { amber: [C.amber, C.ink], teal: [C.teal, "#FFFFFF"], ink: [C.ink, C.mint], mint: [C.mint, C.ink], white: ["#FFFFFF", C.ink] };

// ------------------------------------------------------------------ the ad board (fictional restaurant ad on an easel)
const BW = 1.0, BH = 1.35, BD = 0.05, BY = 0.2; // board size + height of its bottom edge (easel)
const SLOT = { photo: [0, 0.915, 0.86, 0.47], price: [0, 0.52, 0.5, 0.2], button: [0, 0.23, 0.64, 0.17] }; // x, y (centre), w, h
function makeBoard(name) {
  const g = new THREE.Group(); scene.add(g); const face = BD / 2 + 0.001;
  const board = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 4, 0.03), mat("#FFFFFF", { roughness: 0.5, clearcoat: 0.3 })); board.position.y = BH / 2; board.castShadow = true; board.receiveShadow = true; g.add(board);
  for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, BY + 0.5, 10), mat(C3.navy, { roughness: 0.4 })); leg.position.set(sx * 0.36, (BY + 0.5) / 2 - BY, -0.06); leg.rotation.x = 0.08; leg.castShadow = true; g.add(leg); }
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.2, 10), mat(C3.navy, { roughness: 0.4 })); back.position.set(0, 0.45 - BY, -0.32); back.rotation.x = -0.42; g.add(back);
  const header = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.13), new THREE.MeshStandardMaterial({ roughness: 0.6, transparent: true, map: canvasTex(920, 130, (k, w, h) => { k.fillStyle = C.ink; k.beginPath(); k.roundRect(0, 0, w, h, 26); k.fill(); k.fillStyle = C.mint; k.font = "800 76px NSD"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(name, w / 2, h * 0.54); }) }));
  header.position.set(0, 1.265, face); g.add(header);
  return { g, header, face };
}
const ad = makeBoard("काल्पनिक रसोई"), adB = makeBoard("काल्पनिक रसोई"); const adSh = contactShadow(), adBSh = contactShadow();
// dashed slot outlines with their numbers (appear when the ad is cleared)
const slotTex = (w, h, n) => canvasTex(Math.round(w * 600), Math.round(h * 600), (k, cw, ch) => { k.strokeStyle = C.slate; k.lineWidth = 8; k.setLineDash([26, 18]); k.beginPath(); k.roundRect(6, 6, cw - 12, ch - 12, 22); k.stroke(); k.setLineDash([]); k.fillStyle = "rgba(100,116,139,0.5)"; k.font = `800 ${Math.round(ch * 0.5)}px NSD`; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(String(n), cw / 2, ch / 2); });
const slots = ["photo", "price", "button"].map((k, i) => { const [x, y, w, h] = SLOT[k]; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: slotTex(w, h, i + 1), transparent: true, opacity: 0, depthWrite: false })); m.position.set(x, y, ad.face + 0.002); ad.g.add(m); return m; });
// stickers (front board + a static copy on the comparison board)
function stickerTex(txt, w, h, [bg, fg]) { return canvasTex(Math.round(w * 700), Math.round(h * 700), (k, cw, ch) => { k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, ch * 0.22); k.fill(); k.strokeStyle = "rgba(15,23,42,0.18)"; k.lineWidth = 6; k.stroke(); k.fillStyle = fg;
  if (txt.includes("★")) { for (let i = 0; i < 5; i++) star(k, cw * (0.14 + i * 0.18), ch * 0.52, ch * 0.32); } else { k.font = `800 ${Math.round(ch * 0.6)}px NSD`; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.56); } }); }
function makeSticker(s, board, k) { const [txt, x, y, w, h, rz, col] = s; const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.012, 2, 0.004), [0, 1, 2, 3, 4, 5].map((f) => (f === 4 ? new THREE.MeshStandardMaterial({ map: stickerTex(txt, w, h, STK[col]), roughness: 0.5 }) : new THREE.MeshStandardMaterial({ color: STK[col][0], roughness: 0.5 }))));
  m.castShadow = true; board.g.add(m); return { m, x, y, rz, z: board.face + 0.008 + k * 0.004 }; }
const stk = STICKERS.map((s, k) => makeSticker(s, ad, k)), stkB = STICKERS.map((s, k) => makeSticker(s, adB, k));
stkB.forEach((s) => { s.m.position.set(s.x, s.y, s.z); s.m.rotation.z = s.rz; });
// photo panel = live render of the same thali (the "honest product proof")
const RT = new THREE.WebGLRenderTarget(688, 376, { samples: 4 }); RT.texture.colorSpace = THREE.SRGBColorSpace;
const photo = new THREE.Mesh(new THREE.PlaneGeometry(SLOT.photo[2], SLOT.photo[3]), new THREE.MeshBasicMaterial({ map: RT.texture, transparent: true, opacity: 0, toneMapped: false })); photo.position.set(0, SLOT.photo[1], ad.face + 0.004); ad.g.add(photo);
const photoCam = new THREE.PerspectiveCamera(32, 688 / 376, 0.05, 20);
// price tag + order button
const faceText = (w, h, txt, bg, fg, px) => canvasTex(Math.round(w * 700), Math.round(h * 700), (k, cw, ch) => { k.fillStyle = bg; k.fillRect(0, 0, cw, ch); k.fillStyle = fg; k.font = `800 ${px}px NSD`; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.56); });
const tag = new THREE.Group(); ad.g.add(tag);
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.18, 0.04, 3, 0.02), mat(C3.mint, { roughness: 0.35 })); b.castShadow = true; tag.add(b); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.15), new THREE.MeshBasicMaterial({ map: faceText(0.42, 0.15, "₹250", C.mint, C.ink, 82), toneMapped: false })); f.position.z = 0.0205; tag.add(f); }
const button = new THREE.Group(); ad.g.add(button);
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.15, 0.06, 3, 0.03), mat(C3.teal, { roughness: 0.35 })); b.castShadow = true; button.add(b); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.12), new THREE.MeshBasicMaterial({ map: faceText(0.56, 0.12, "अभी ऑर्डर करें", C.teal, "#FFFFFF", 52), toneMapped: false })); f.position.z = 0.0305; button.add(f); }
// thali on a small stand in front of the ad (fictional dish)
const thali = new THREE.Group(); scene.add(thali); const thaliSh = contactShadow();
{ const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.07, 48), mat("#FFFFFF", { roughness: 0.45 })); stand.position.y = 0.035; stand.castShadow = true; stand.receiveShadow = true; thali.add(stand);
  const steel = mat("#C9D2D6", { metalness: 0.85, roughness: 0.25 });
  const pp = [new THREE.Vector2(0, 0), new THREE.Vector2(0.27, 0), new THREE.Vector2(0.3, 0.03), new THREE.Vector2(0.305, 0.035), new THREE.Vector2(0.29, 0.035), new THREE.Vector2(0.26, 0.012), new THREE.Vector2(0, 0.012)];
  const plate = new THREE.Mesh(new THREE.LatheGeometry(pp, 72), steel); plate.position.y = 0.07; plate.castShadow = true; plate.receiveShadow = true; thali.add(plate);
  const bowl = (x, z, fill) => { const bp = [new THREE.Vector2(0, 0), new THREE.Vector2(0.05, 0), new THREE.Vector2(0.065, 0.04), new THREE.Vector2(0.06, 0.042), new THREE.Vector2(0.045, 0.006), new THREE.Vector2(0, 0.006)]; const b = new THREE.Mesh(new THREE.LatheGeometry(bp, 40), steel); b.position.set(x, 0.082, z); b.castShadow = true; thali.add(b); const f = new THREE.Mesh(new THREE.CircleGeometry(0.058, 32), new THREE.MeshStandardMaterial({ color: fill, roughness: 0.4 })); f.rotation.x = -Math.PI / 2; f.position.set(x, 0.082 + 0.034, z); thali.add(f); };
  bowl(-0.16, -0.12, "#D98A2B"); bowl(0.0, -0.19, "#F4F1EA"); bowl(0.16, -0.12, "#4E8A3A");
  const rice = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), new THREE.MeshStandardMaterial({ color: "#FBF8F0", roughness: 0.8 })); rice.scale.y = 0.45; rice.position.set(-0.13, 0.09, 0.1); thali.add(rice);
  const roti = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 32), new THREE.MeshStandardMaterial({ color: "#E0B878", roughness: 0.8 })); roti.position.set(0.15, 0.09, 0.1); roti.rotation.z = 0.12; thali.add(roti);
  for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new RoundedBoxGeometry(0.048, 0.04, 0.048, 2, 0.01), new THREE.MeshStandardMaterial({ color: i % 2 ? "#D9782A" : "#C9652A", roughness: 0.6 })); c.position.set(-0.05 + i * 0.026, 0.104 + (i % 2) * 0.012, 0.0 + (i % 3) * 0.02 - 0.01); c.rotation.y = i * 0.7; c.castShadow = true; thali.add(c); } }
const THALI_Z = 0.62;
// CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped) on a slab in the logo's mint
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

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0, 1.08, 4.75], [0, 0.82, 0]];
const CAMS = [
  [0.0, [0, 1.15, 5.15], [0, 0.85, 0]], [3.2, [0, 1.1, 4.85], [0, 0.84, 0]], [7.8, ...FRONT], [16.9, ...FRONT], [17.9, [0, 1.15, 6.7], [0, 0.82, 0]], [22.2, [0, 1.15, 6.6], [0, 0.82, 0]],
  [23.0, ...FRONT], [25.75, ...FRONT], [26.6, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
];
function cameraAt(t) { let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ captions (accepted word-timed groups; Devanagari tokens)
const tok = (s) => s.replace(/[‘’“”"']/g, "").split(/\s+/).filter(Boolean);
const bare = (s) => s.replace(/[,।?!:;.—…]/g, "");
const AW = Object.fromEntries(WJ.lines.map((l) => { const shown = tok(l.script); return [l.id, l.words.map((w, i) => ({ w: shown[i] ?? w.w, t0: w.t0, t1: w.t1 }))]; }));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
  if (i !== capShown) { cap.innerHTML = "";
    if (i >= 0) { const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill"; const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words];
      for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(bare(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); }
      cap.appendChild(pill); }
    capShown = i; }
  if (i < 0) return; const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.4 + 0.6 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 96 + hw, 984 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; }

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in), off = -2.9 * cl;
  const ci = ramp(t, ...T.compareIn, E.inOut) * (1 - ramp(t, ...T.compareOut, E.inOut)), co = ramp(t, ...T.compareOut, E.in);
  const ax = 0.62 * ci + off; // the clean ad shifts right while the cluttered copy is shown
  ad.g.position.set(ax, BY, 0); ad.g.visible = cl < 1; placeShadow(adSh, ax, -0.1, 0, 0.55, 0.25, cl < 1 ? 0.6 : 0);
  const bx = t < T.compareIn[0] ? -3 : lerp(-2.6, -0.62, ramp(t, ...T.compareIn, E.out)) - 2.2 * co;
  adB.g.visible = t >= T.compareIn[0] && co < 1; adB.g.position.set(bx, BY, 0); placeShadow(adBSh, bx, -0.1, 0, 0.55, 0.25, adB.g.visible ? 0.6 : 0);
  adB.header.material.opacity = 1 - 0.65 * ramp(t, T.brandDim, T.brandDim + 0.4); ad.header.material.opacity = 1;
  // --- stickers: slap onto the ad (fly from the camera side, squash), wobble, then peel off and fall away on "अब"
  stk.forEach((s, k) => {
    const t0 = STICKERS[k][7], u = ramp(t, t0, t0 + 0.17, E.in), pk = ramp(t, T.peel[0] + k * 0.06, T.peel[0] + k * 0.06 + 0.5, E.in);
    s.m.visible = t >= t0 && pk < 1;
    const sq = squash(t, t0 + 0.17, -0.25), wob = wobble(t, T.clutterWobble, 0.06, 6, 6) * (k % 2 ? 1 : -1);
    s.m.position.set(s.x + (k % 2 ? 0.25 : -0.25) * pk, s.y - 1.1 * pk * pk, s.z + lerp(0.9, 0, u) + 0.25 * pk); s.m.rotation.set(-1.2 * pk, 0, s.rz + wob + (k % 2 ? -1 : 1) * 1.5 * pk);
    const sc = lerp(1.6, 1, u) * (1 + sq); s.m.scale.set(sc, sc, 1);
  });
  // --- slots, photo, price, button
  slots.forEach((m, i) => { m.material.opacity = win(t, T.slots[0] + i * 0.12, T.slots[1], 0.25, 0.2) * (i === 0 ? 1 - ramp(t, T.shot, T.shot + 0.2) : i === 1 ? 1 - ramp(t, T.price, T.price + 0.1) : 1 - ramp(t, T.button, T.button + 0.1)); });
  photo.material.opacity = ramp(t, T.shot, T.shot + 0.15, E.lin);
  const pu = pop(t, T.price, 0.3); tag.visible = t >= T.price; tag.position.set(SLOT.price[0], SLOT.price[1], ad.face + 0.02 + 0.25 * (1 - clamp(pu))); tag.scale.setScalar(Math.max(0.001, pu) * (1 + 0.06 * pulse(t, T.priceSay, 0.4) + 0.08 * pulse(t, T.rule2, 0.4)));
  const bu = pop(t, T.button, 0.3), pr = pulse(t, T.press, 0.22); button.visible = t >= T.button; button.position.set(SLOT.button[0], SLOT.button[1], ad.face + 0.03 - 0.022 * pr); button.scale.set(Math.max(0.001, bu) * (1 + 0.06 * pulse(t, T.rule3, 0.4)), Math.max(0.001, bu) * (1 - 0.12 * pr + 0.06 * pulse(t, T.rule3, 0.4)), Math.max(0.001, bu));
  // --- thali slides onto its stand in front of the ad; moves with the ad
  const ti = ramp(t, ...T.thaliIn, E.out), tx = lerp(2.4, 0, ti) + ax; thali.visible = t >= T.thaliIn[0] && cl < 1; thali.position.set(tx, 0, THALI_Z); thali.rotation.y = (1 - ti) * -0.8 + 0.04 * pulse(t, T.rule1, 0.4);
  placeShadow(thaliSh, tx, THALI_Z, 0, 0.38, 0.38, thali.visible ? 1 : 0);
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);
  // --- live "photo" of the same thali (render target; the ad itself is hidden for this pass)
  if (photo.material.opacity > 0.001 && thali.visible) { const tp = thali.position; photoCam.position.set(tp.x, 0.62, tp.z + 0.52); photoCam.lookAt(tp.x, 0.08, tp.z - 0.02); photoCam.updateMatrixWorld();
    const vis = [ad.g.visible, adB.g.visible, tile.visible]; ad.g.visible = adB.g.visible = tile.visible = false; renderer.setRenderTarget(RT); renderer.render(scene, photoCam); renderer.setRenderTarget(null); [ad.g.visible, adB.g.visible, tile.visible] = vis; }

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("chip"), [540, 584], 0); // the board header itself says "काल्पनिक रसोई" (fictional) — no extra chip over it
  hudAt($("chip2"), [540, 584], win(t, T.gaze[0] - 0.3, T.compareOut[0], 0.25, 0.25));
  hudAt($("nQ"), (() => { const p = toScreen(v3(BW / 2 + 0.12 + ax, BY + 1.05, 0.1)); return [p[0], Math.max(640, p[1])]; })(), win(t, ...T.q, 0.25, 0.3) * (1 - ramp(t, T.peel[0] - 0.2, T.peel[0])), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  const slotScreen = (k, dx = 0) => { const [x, y, w] = SLOT[k]; return toScreen(v3(ax + x + dx * w / 2, BY + y, ad.face + 0.05)); };
  let svg = "";
  // flash on the photo
  const fl = pulse(t, T.shot, 0.18); if (fl > 0) svg += `<rect x="0" y="0" width="1080" height="1920" fill="#FFFFFF" opacity="${0.35 * fl}"/>`;
  // gaze paths (illustrative): wandering over the cluttered copy, 1→2→3 over the clean ad
  const gz = win(t, T.gaze[0], T.compareOut[0], 0.2, 0.25);
  if (gz > 0) { const u = ramp(t, ...T.gaze, E.lin);
    const wander = [[-0.2, 0.98], [0.22, 0.78], [-0.12, 0.52], [0.27, 1.08], [0.2, 0.3], [-0.22, 0.22], [-0.18, 0.75], [0.18, 0.55], [0.3, 0.98], [-0.05, 0.4]].map(([x, y]) => toScreen(v3(bx + x, BY + y, 0.1)));
    const clean = [toScreen(v3(ax, BY + SLOT.photo[1], 0.1)), toScreen(v3(ax, BY + SLOT.price[1], 0.1)), toScreen(v3(ax, BY + SLOT.button[1], 0.1))];
    const draw = (pts, n, col, r) => { const k = Math.max(1, Math.floor(n)); const seg = pts.slice(0, k + 1); if (seg.length > 1) svg += `<polyline points="${seg.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="6" stroke-linejoin="round" stroke-dasharray="14 10" opacity="${gz}"/>`; seg.forEach((p, i) => (svg += `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${col}" opacity="${gz * (i === seg.length - 1 ? 1 : 0.7)}"/>`)); };
    draw(wander, u * (wander.length - 1), C.amber, 14); draw(clean, Math.min(2, u * 3.2), C.teal, 18); }
  $("ov").innerHTML = svg;
  // rule badges + labels on "एक प्रोडक्ट" / "एक कीमत" / "एक काम"
  [["photo", T.rule1, "b1", "r1"], ["price", T.rule2, "b2", "r2"], ["button", T.rule3, "b3", "r3"]].forEach(([k, t0, b, r]) => {
    const o = win(t, t0, T.ctaClear[0], 0.25, 0.2), L = slotScreen(k, -1), R = slotScreen(k, 1);
    hudAt($(b), [L[0] - 6, L[1]], o, 0.85 + 0.15 * Math.min(1, pop(t, t0, 0.3)));
    const rw = $(r).offsetWidth / 2 || 90; hudAt($(r), [R[0] + 22 + rw, R[1]], o, 0.85 + 0.15 * Math.min(1, pop(t, t0, 0.3))); // right of the element, never over it
  });
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".tag, .note, .badge, #chip, #chip2, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
