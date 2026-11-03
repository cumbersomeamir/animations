// Werbens · 30 s Hindi episode 03 — "विशेषण नहीं, सबूत दिखाइए" (show the product working, not adjectives), in the accepted
// 'Satisfying Product Theatre' style: procedural 3D hero objects on a clean light studio sweep, soft contact shadows,
// tactile timed shape/scale changes. Colours/logo from app.werbens.com (context/17). Devanagari captions/labels.
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { POS, ADJ, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["800 52px NSD", "700 36px NSD", "700 104px SG"].map((f) => document.fonts.load(f, "अआ शब्द Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17); C3 = lit 3D bases pre-compensated for the accepted ACES renderer
const C = { teal: "#316879", mint: "#7FE7DC", teal2: "#5CE0D2", ink: "#0F172A", mintw: "#F0FDFA", navy: "#0B1120", slate: "#64748B" };
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
const textTex = (txt, w = 1024, h = 320, fg = C.ink, bg = "#FFFFFF", px = 170) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `800 ${px}px NSD`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h * 0.53); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

// ------------------------------------------------------------------ objects
// adjective word tiles (white faces, ink Devanagari words, mint edges) — they form a wall hiding the covered product
const TW = 0.98, TH = 0.3, TD = 0.12;
const tiles = ADJ.map((w) => { const g = new THREE.Group(); scene.add(g);
  const box = new THREE.Mesh(new RoundedBoxGeometry(TW, TH, TD, 4, 0.04), mat(C3.mint, { roughness: 0.4 })); box.castShadow = true; box.receiveShadow = true; g.add(box);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.06, TH - 0.05), new THREE.MeshStandardMaterial({ map: textTex(w), roughness: 0.6, transparent: true })); face.position.z = TD / 2 + 0.002; g.add(face);
  return { g, box, face, sh: contactShadow() }; });
// the covered product: a fictional packaging hood (white sleeve, teal band) over the tawa
const hood = new THREE.Group(); scene.add(hood); const hoodSh = contactShadow();
{ const body = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.5, 0.95, 4, 0.05), mat("#FFFFFF", { roughness: 0.6, clearcoat: 0.3 })); body.position.y = 0.25; body.castShadow = true; body.receiveShadow = true; hood.add(body);
  const band = new THREE.Mesh(new RoundedBoxGeometry(1.12, 0.12, 0.97, 3, 0.03), mat(C3.teal, { roughness: 0.4 })); band.position.y = 0.3; hood.add(band); }
// tawa (non-stick griddle) on a stove ring; pivot at its left rim so it tilts toward the plate
const TR = 0.4, ringH = 0.11;
const stove = new THREE.Group(); scene.add(stove); const stoveSh = contactShadow();
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.032, 14, 64), mat(C3.navy, { roughness: 0.35 })); ring.rotation.x = Math.PI / 2; ring.position.y = ringH - 0.035; ring.castShadow = true; stove.add(ring);
  for (let i = 0; i < 3; i++) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, ringH - 0.04, 10), mat(C3.navy)); const a = (i / 3) * Math.PI * 2; leg.position.set(Math.cos(a) * 0.29, (ringH - 0.04) / 2, Math.sin(a) * 0.29); stove.add(leg); } }
const tawaPivot = new THREE.Group(); scene.add(tawaPivot); const tawa = new THREE.Group(); tawaPivot.add(tawa);
{ const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(TR - 0.03, 0.0), new THREE.Vector2(TR, 0.012), new THREE.Vector2(TR + 0.012, 0.04), new THREE.Vector2(TR - 0.01, 0.045), new THREE.Vector2(TR - 0.05, 0.022), new THREE.Vector2(0, 0.02)];
  const pan = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), mat(C3.navy, { roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2, side: THREE.DoubleSide })); pan.castShadow = true; pan.receiveShadow = true; tawa.add(pan);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.05, 0.08, 3, 0.02), mat(C3.teal, { roughness: 0.35 })); const HA = 0.7; handle.position.set((TR + 0.17) * Math.cos(HA), 0.035, -(TR + 0.17) * Math.sin(HA)); handle.rotation.y = HA; handle.castShadow = true; tawa.add(handle); // handle angled back-right (keeps the close demo frame clear)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 10), mat("#8FA3A8", { metalness: 0.8, roughness: 0.3 })); neck.rotation.set(0, 0.7, Math.PI / 2); neck.position.set((TR + 0.03) * Math.cos(0.7), 0.03, -(TR + 0.03) * Math.sin(0.7)); tawa.add(neck); }
tawa.position.x = TR; // pivot sits on the left rim
const SURF = 0.022; // tawa cooking surface height (local)
// plate
const plate = new THREE.Group(); scene.add(plate); const plateSh = contactShadow();
{ const pts = [new THREE.Vector2(0, 0.0), new THREE.Vector2(0.24, 0.0), new THREE.Vector2(0.26, 0.012), new THREE.Vector2(0.31, 0.045), new THREE.Vector2(0.345, 0.06), new THREE.Vector2(0.34, 0.066), new THREE.Vector2(0.3, 0.052), new THREE.Vector2(0.25, 0.022), new THREE.Vector2(0, 0.02)];
  pts.forEach((v) => (v.x *= 0.9)); const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), mat("#FFFFFF", { roughness: 0.25, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; plate.add(m);
  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.293, 0.008, 8, 96), mat(C3.mint)); rimRing.rotation.x = Math.PI / 2; rimRing.position.y = 0.058; plate.add(rimRing); }
// dosa (procedural texture: batter → golden crisp)
const dosaTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 512; const g = cv.getContext("2d"); const r = g.createRadialGradient(256, 256, 30, 256, 256, 256); r.addColorStop(0, "#D9A14A"); r.addColorStop(0.75, "#C98A33"); r.addColorStop(0.95, "#A9691F"); r.addColorStop(1, "#8F5718"); g.fillStyle = r; g.beginPath(); g.arc(256, 256, 255, 0, 7); g.fill();
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 900; i++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * 240; g.fillStyle = `rgba(${120 + rnd() * 40},${70 + rnd() * 30},${20},${0.25 + rnd() * 0.3})`; g.beginPath(); g.arc(256 + Math.cos(a) * d, 256 + Math.sin(a) * d, 1 + rnd() * 5, 0, 7); g.fill(); }
  for (let k = 0; k < 6; k++) { g.strokeStyle = "rgba(240,200,120,0.25)"; g.lineWidth = 3; g.beginPath(); g.arc(256, 256, 40 + k * 36, 0, 7); g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
function makeDosa() { const g = new THREE.Group(); scene.add(g); const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.012, 72);
  const cooked = new THREE.MeshPhysicalMaterial({ map: dosaTex, roughness: 0.55, clearcoat: 0.2, transparent: true }), batterM = new THREE.MeshPhysicalMaterial({ color: "#F2E4C4", roughness: 0.4, clearcoat: 0.5, transparent: true });
  const a = new THREE.Mesh(geo, batterM), b = new THREE.Mesh(geo, cooked); b.position.y = 0.0005; a.castShadow = b.castShadow = true; g.add(a, b); return { g, batterM, cooked }; }
const dosa1 = makeDosa(), dosa2 = makeDosa();
// steam puffs
const steamTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(255,255,255,0.8)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const steam = Array.from({ length: 8 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
// cardboard mock-up dosa (the fake test): flat disc cut-out on a stand; front = dosa print, back = brown card
const fake = new THREE.Group(); scene.add(fake); const fakeSh = contactShadow();
{ const disc = new THREE.Group(); disc.name = "disc"; fake.add(disc);
  const front = new THREE.Mesh(new THREE.CircleGeometry(0.22, 64), new THREE.MeshStandardMaterial({ map: dosaTex, roughness: 0.8 })); front.position.z = 0.004; disc.add(front);
  const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.008, 64, 1, true), new THREE.MeshStandardMaterial({ color: "#B08A5A", roughness: 0.9 })); edge.rotation.x = Math.PI / 2; disc.add(edge);
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.22, 64), new THREE.MeshStandardMaterial({ color: "#B4895A", roughness: 0.95 })); back.rotation.y = Math.PI; back.position.z = -0.004; disc.add(back);
  for (const m of [front, edge, back]) m.castShadow = true;
  disc.position.y = 0.22; }
// CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped) on a slab in the logo's mint
const tile = new THREE.Group(); scene.add(tile); const tileSh = contactShadow();
const LW = 0.94, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.04, LH + 0.04, 0.12, 5, 0.03), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.04) / 2; slab.castShadow = true; tile.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.04) / 2, 0.0605); tile.add(face); }
const dustTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(200,222,220,0.9)"); r.addColorStop(1, "rgba(200,222,220,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const dust = Array.from({ length: 21 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });

// ------------------------------------------------------------------ motion helpers
function dropY(t, t0, t1, y0, y1 = 0) { const u = clamp((t - t0) / (t1 - t0)); const h = y1;
  if (u < 0.62) return lerp(y0, h + 0.16, E.out(u / 0.62)); if (u < 0.9) return lerp(h + 0.16, h + 0.06, (u - 0.62) / 0.28); return lerp(h + 0.06, h, ((u - 0.9) / 0.1) ** 2); }
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const WIDE = [[0, 1.3, 7.0], [0, 0.42, 0]];
const CAMS = [
  [0.0, [0.2, 1.05, 5.0], [0.2, 0.42, 0]], [3.2, [0.2, 1.1, 5.3], [0.2, 0.42, 0]], [6.8, [0.2, 1.15, 5.5], [0.2, 0.42, 0]],
  [9.4, [-0.18, 1.42, 5.3], [-0.18, 0.18, 0]], [14.3, [-0.18, 1.38, 5.1], [-0.18, 0.18, 0]], [15.5, [-0.45, 1.1, 3.9], [-0.45, 0.12, 0]], [17.5, [-0.42, 1.08, 3.8], [-0.42, 0.12, 0]],
  [18.4, [-0.15, 1.45, 5.4], [-0.15, 0.2, 0]], [22.9, [-0.15, 1.42, 5.3], [-0.15, 0.2, 0]], [25.3, [-0.12, 1.4, 5.5], [-0.12, 0.25, 0]], [26.3, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
];
function cameraAt(t) { let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ captions (accepted word-timed groups; Devanagari tokens)
const tok = (s) => s.replace(/[‘’“”"']/g, "").split(/\s+/).filter(Boolean);
const bare = (s) => s.replace(/[,।?!:;.—]/g, "");
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
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 96 + hw, 984 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; }

// dosa pose on the tilted tawa → off the rim → onto the plate. s: 0 = centre of the pan, 1 = landed on the plate
const tawaTop = ringH + 0.0; // pan bottom rests on the ring
function tawaAngle(t) { return 0.3 * ramp(t, ...T.tilt, E.inOut) * (1 - ramp(t, ...T.untilt, E.inOut)) + 0.3 * ramp(t, ...T.replayTilt, E.inOut) * (1 - ramp(t, ...T.replayUntilt, E.inOut)); }
function dosaPose(t, slideW, dropW, stackY) {
  const th = tawaAngle(t), sl = ramp(t, ...slideW, E.in), dr = ramp(t, ...dropW, E.lin);
  const px = POS.tawa - TR, py = tawaTop; // pivot (left rim) in world
  if (dr <= 0) { const xl = lerp(TR, -0.12, sl); const p = v3(px + Math.cos(th) * xl - Math.sin(th) * (SURF + 0.006), py + Math.sin(th) * xl + Math.cos(th) * (SURF + 0.006), 0); return { p, rz: th }; }
  const rel = v3(px + Math.cos(th) * -0.12 - Math.sin(th) * 0.03, py + Math.sin(th) * -0.12 + Math.cos(th) * 0.03, 0), land = v3(POS.plate, 0.03 + stackY, 0.02);
  const p = v3(lerp(rel.x, land.x, E.out(dr)), lerp(rel.y, land.y, dr * dr) + Math.sin(Math.PI * dr) * 0.06, lerp(rel.z, land.z, dr)); return { p, rz: lerp(th, 0, E.out(dr)) };
}

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in), off = -2.8 * cl; // CTA: everything slides off to the left

  // --- adjective wall: tiles drop in front of the hood and stack; wobble on doubt; topple aside on "अब"; sink in memory
  const tp = ramp(t, ...T.topple, E.inOut), fg = 0; // toppled words slide out of frame (the stage is cleared for the demo)
  tiles.forEach((tl, i) => {
    const [d0, d1] = T.adjDrop[i], base = i * TH, vis = t >= d0 && tp < 1;
    let y = base, x = POS.hood, z = 0.62, rx = 0, rz = 0;
    if (i === 0) y = dropY(t, d0, d1, 3.2, 0);
    else { const u = ramp(t, d0, d1, E.out), side = i === 1 ? -1 : 1; x = lerp(POS.hood + side * 2.3, POS.hood, u); y = base + Math.sin(Math.PI * Math.min(1, u * 1.1)) * 0.22 * (1 - u); rz = side * 0.5 * (1 - u); }
    const wob = (i === 0 ? wobble(t, T.doubt, 0.06, 5, 5) : 0) + wobble(t, T.wallWobble, 0.035 * (i + 1), 5, 5);
    rz += wob;
    if (tp > 0) { const dir = [-1, 1, -1][i]; x = POS.hood + dir * 2.6 * E.in(tp); z = 0.62 + 0.3 * tp; y = lerp(base, 0, Math.min(1, tp * 1.6)) + Math.sin(Math.PI * Math.min(1, tp * 1.6)) * 0.18; rx = -Math.PI / 2 * E.out(Math.min(1, tp * 1.6)); rz = dir * 0.25 * tp; }
    if (fg > 0) { y -= 0.2 * fg; }
    tl.g.visible = vis; tl.g.position.set(x, y + TH / 2 * (tp > 0 ? lerp(1, 0.2, tp) : 1), z); tl.g.rotation.set(rx, 0, rz);
    const sq = squash(t, d1, -0.1); tl.g.scale.set(1 - sq * 0.4, 1 + sq, 1);
    tl.face.material.opacity = 1 - fg; tl.box.material.transparent = fg > 0; tl.box.material.opacity = 1 - fg;
    placeShadow(tl.sh, x, z, Math.max(0, y - base * (1 - tp)), TW * 0.5, 0.12, vis && (i === 0 || tp > 0.5) ? 1 : 0);
  });
  // --- hood tips back and slides off; the tawa + stove are revealed
  const ho = ramp(t, ...T.hoodOff, E.inOut);
  hood.visible = ho < 0.999; hood.position.set(POS.hood, 0, -1.1 * ho); hood.rotation.x = -1.1 * E.in(ho); hood.scale.setScalar(1 - 0.85 * ramp(t, T.hoodOff[0] + 0.3, T.hoodOff[1], E.in));
  placeShadow(hoodSh, POS.hood, -1.1 * ho, 0, 0.62, 0.5, hood.visible ? 1 - ho : 0);
  stove.position.set(POS.tawa + off, 0, 0); placeShadow(stoveSh, POS.tawa + off, 0, 0, 0.42, 0.42, t > T.hoodOff[0] ? 1 : 0);
  tawaPivot.position.set(POS.tawa - TR + off, tawaTop, 0); tawaPivot.rotation.z = tawaAngle(t);
  const showStage = t >= T.hoodOff[0]; stove.visible = tawaPivot.visible = showStage && cl < 1;
  // --- plate pops in on the left
  const pu = pop(t, T.plateIn[0], 0.4); plate.visible = t >= T.plateIn[0] && cl < 1; plate.position.set(POS.plate + off, 0, 0.02); plate.scale.setScalar(Math.max(0.001, Math.min(1.08, pu))); placeShadow(plateSh, POS.plate + off, 0.02, 0, 0.36, 0.36, plate.visible ? 1 : 0);
  // --- dosa 1: batter spreads + cooks on the tawa, slides and drops onto the plate
  const b1 = ramp(t, ...T.batter, E.out), ck = ramp(t, ...T.cook, E.inOut);
  dosa1.g.visible = t >= T.batter[0] && cl < 1;
  const P1 = dosaPose(t, T.slide, T.drop, 0); dosa1.g.position.copy(P1.p).add(v3(off, 0, 0)); dosa1.g.rotation.set(0, 0, P1.rz);
  const dsq = squash(t, T.drop[1], -0.25); dosa1.g.scale.set(Math.max(0.001, b1) * (1 - dsq * 0.3), 1 + dsq * 2, Math.max(0.001, b1) * (1 - dsq * 0.3));
  dosa1.batterM.opacity = 1; dosa1.cooked.opacity = ck;
  // --- dosa 2 (replay inside the viewfinder) lands on top of dosa 1
  const b2 = ramp(t, ...T.replayBatter, E.out); dosa2.g.visible = t >= T.replayBatter[0] && cl < 1;
  const P2 = dosaPose(t, T.replaySlide, T.replayDrop, 0.014); dosa2.g.position.copy(P2.p).add(v3(off, 0, 0)); dosa2.g.rotation.set(0, 0, P2.rz);
  const dsq2 = squash(t, T.replayDrop[1], -0.25); dosa2.g.scale.set(Math.max(0.001, b2) * (1 - dsq2 * 0.3), 1 + dsq2 * 2, Math.max(0.001, b2) * (1 - dsq2 * 0.3)); dosa2.cooked.opacity = ramp(t, T.replayBatter[0] + 0.1, T.replayBatter[1] + 0.05);
  // --- steam while cooking
  steam.forEach((s, i) => { const t0 = T.cook[0] + i * 0.13, d = t - t0; s.visible = d > 0 && d < 1.1 && t < T.tilt[0] + 0.3; if (!s.visible) return; const a = i * 2.4; s.position.set(POS.tawa + Math.cos(a) * 0.18, tawaTop + 0.05 + d * 0.55, Math.sin(a) * 0.15); s.scale.setScalar(0.12 + d * 0.25); s.material.opacity = 0.55 * Math.sin(Math.PI * d / 1.1); });
  // --- cardboard mock-up: pops up, then falls flat backwards (it is fake)
  const fu = pop(t, T.fakeUp[0], 0.35), ff = ramp(t, ...T.fakeFall, E.in);
  fake.visible = t >= T.fakeUp[0] && cl < 1; fake.position.set(-0.05 + off, 0, 0.62); fake.scale.setScalar(Math.max(0.001, Math.min(1.08, fu)));
  const disc = fake.getObjectByName("disc"); disc.rotation.x = -Math.PI / 2 * ff + (t > T.fakeFall[1] ? Math.abs(wobble(t, T.fakeFall[1], 0.12, 6, 7)) * -1 : 0); disc.position.y = lerp(0.22, 0.012, ff); disc.position.z = lerp(0, -0.22, ff);
  placeShadow(fakeSh, -0.05 + off, 0.62 - 0.12 * ff, 0, 0.25, 0.05 + 0.2 * ff, fake.visible ? 1 : 0);
  // --- dust on landings
  const bursts = [[T.adjDrop[0][1], POS.hood, 0.62, 0.45], [T.drop[1], POS.plate, 0.02, 0.32], [T.fakeFall[1], -0.05, 0.4, 0.25], [T.tile[1], 0, 0.3, 0.45]];
  dust.forEach((s) => (s.visible = false)); let di = 0;
  for (const [tb, x0, z0, r] of bursts) { const d = t - tb; if (d < 0 || d > 0.5) continue; for (let i = 0; i < 7 && di < dust.length; i++, di++) { const a = (i / 7) * Math.PI * 2 + 0.4, s = dust[di]; s.visible = true; s.position.set(x0 + Math.cos(a) * r * (1 + d * 1.6), 0.04 + d * 0.1, z0 + Math.sin(a) * r * 0.6 * (1 + d * 1.6)); s.scale.setScalar(0.12 + d * 0.35); s.material.opacity = 0.7 * (1 - d / 0.5); } }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("chip"), [540, 584], win(t, ...T.chip, 0.25, 0.3));
  hudAt($("nQ"), (() => { const p = toScreen(v3(POS.hood + 0.78, 0.62, 0.62)); return [p[0], Math.max(640, p[1])]; })(), win(t, ...T.q, 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  const tagO = Math.min(1, pop(t, T.tagTawa, 0.3)) * (1 - ramp(t, T.push[0], T.push[0] + 0.3)) + (t > T.wide[0] ? ramp(t, T.wide[0] + 0.3, T.wide[1]) * (1 - ramp(t, T.fakeUp[0] - 0.3, T.fakeUp[0])) : 0);
  const tg = $("tagTawa"), tp2 = toScreen(v3(POS.tawa + 0.1 + off, 0, 0.55));
  hudAt(tg, [tp2[0], tp2[1] + 40], clamp(tagO) * (t < T.push[0] || t > T.wide[0] ? 1 : 0));
  tg.style.background = t > T.adjHi && t < T.frame[1] ? C.mint : "#FFFFFF"; tg.style.transform += ` scale(${1 + 0.08 * pulse(t, T.adjHi, 0.35)})`;
  hudAt($("nOil"), (() => { const p = toScreen(v3(POS.tawa + 0.1, 0.62, 0)); return [p[0], p[1]]; })(), win(t, ...T.oil, 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.oil[0], 0.3)));
  hudAt($("nCam"), [tp2[0] - 40, tp2[1] + 128], win(t, T.askNote, T.frame[1], 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.askNote, 0.3)));
  let svg = "";
  const fr = win(t, ...T.frame, 0.2, 0.25);
  if (fr > 0) { const a = toScreen(v3(POS.plate - 0.42, 0.7, 0)), b = toScreen(v3(POS.tawa + TR + 0.3, -0.05, 0.3)); const x0 = Math.max(100, a[0]), x1 = Math.min(980, b[0]), y0 = Math.max(620, a[1]), y1 = b[1]; const L = 70, s = 1 + 0.06 * (1 - E.out(ramp(t, T.frame[0], T.frame[0] + 0.3)));
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, X0 = cx + (x0 - cx) * s, X1 = cx + (x1 - cx) * s, Y0 = cy + (y0 - cy) * s, Y1 = cy + (y1 - cy) * s;
    svg += `<g stroke="${C.ink}" stroke-width="8" fill="none" stroke-linecap="round" opacity="${fr}"><path d="M${X0} ${Y0 + L} V${Y0} H${X0 + L}"/><path d="M${X1 - L} ${Y0} H${X1} V${Y0 + L}"/><path d="M${X0} ${Y1 - L} V${Y1} H${X0 + L}"/><path d="M${X1 - L} ${Y1} H${X1} V${Y1 - L}"/></g>`;
    const rec = $("rec"); rec.style.display = ""; rec.style.left = X0 + 26 + "px"; rec.style.top = Y0 + 18 + "px"; rec.style.opacity = String(fr); rec.querySelector("i").style.opacity = String(Math.floor(t * 3) % 2 ? 1 : 0.25); }
  else $("rec").style.display = "none";
  const gl = pulse(t, T.glow - 0.1, 0.8);
  if (gl > 0) { const p = toScreen(v3(POS.plate, 0.05, 0.02)), q = toScreen(v3(POS.plate + 0.36, 0.05, 0.02)); const r = Math.abs(q[0] - p[0]); svg += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${r * (1 + 0.25 * gl)}" ry="${r * 0.36 * (1 + 0.25 * gl)}" fill="none" stroke="${C.teal2}" stroke-width="7" opacity="${gl * 0.9}"/>`; }
  $("ov").innerHTML = svg;
  hudAt($("nFake"), (() => { const p = toScreen(v3(-0.05, 0.55, 0.62)); return [p[0], p[1]]; })(), win(t, T.fakeNote, T.ctaClear[0], 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.fakeNote, 0.3)));
  hudAt($("nReal"), (() => { const p = toScreen(v3(POS.plate, 0.42, 0.02)); return [p[0], p[1]]; })(), win(t, T.realNote, T.ctaClear[0] + 0.1, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.realNote, 0.3)));
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".tag, .note, #chip, #lockup, #tagline, #rec")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
window.__glyphs = () => { const probe = document.createElement("canvas").getContext("2d"); return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family + " " + f.weight); };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
