// Werbens · 30 s Hindi episode 04 — "एक ईमानदार पहले/बाद का शॉट" (a fair before/after beats "premium quality"), in the
// accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment as hindi-03): procedural 3D hero objects
// on a clean light sweep, soft contact shadows, tactile timed changes. Colours/logo from app.werbens.com (context/17, re-checked).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { ADJ, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

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
const textTex = (txt, w = 1024, h = 320, fg = C.ink, bg = "#FFFFFF", px = 160) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d"); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `800 ${px}px NSD`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, h * 0.53); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
let seed = 20261104; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ------------------------------------------------------------------ sweater (flat on the floor; neck at the back, hem at the front)
const OUTLINE = [[-0.45, -0.5], [0.45, -0.5], [0.45, 0.18], [0.66, -0.06], [0.79, 0.05], [0.47, 0.4], [0.13, 0.46], [0.07, 0.4], [0, 0.385], [-0.07, 0.4], [-0.13, 0.46], [-0.47, 0.4], [-0.79, 0.05], [-0.66, -0.06], [-0.45, 0.18]];
const SW_T = 0.035; // fabric thickness (top surface height)
const sweater = new THREE.Group(); scene.add(sweater);
{ const s = new THREE.Shape(OUTLINE.map(([u, v]) => new THREE.Vector2(u, v)));
  const g = new THREE.ExtrudeGeometry(s, { depth: SW_T, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.012, bevelSegments: 3, curveSegments: 8 }); g.rotateX(-Math.PI / 2); // shape v → −z, depth → +y
  const cv = document.createElement("canvas"); cv.width = cv.height = 512; const k = cv.getContext("2d"); k.fillStyle = "#1A212B"; k.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 8) { k.fillStyle = x % 16 ? "#141A23" : "#212935"; k.fillRect(x, 0, 4, 512); } for (let y = 0; y < 512; y += 6) { k.fillStyle = "rgba(255,255,255,0.025)"; k.fillRect(0, y, 512, 2); }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2.2, 2.2);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.97 })); m.castShadow = true; m.receiveShadow = true; sweater.add(m);
  const rib = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.02, 0.07, 2, 0.008), new THREE.MeshStandardMaterial({ color: "#111720", roughness: 0.95 })); rib.position.set(0, SW_T + 0.004, 0.465); sweater.add(rib); }
const sweaterSh = contactShadow();
const inside = (u, v) => { let c = false; for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) { const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j]; if (yi > v !== yj > v && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi) c = !c; } return c; };
// lint specks (instanced): random fibres/fluff on the top surface; deterministic
const N = 520, CLEAN_X0 = 0.03, CLEAN_X1 = 0.75; // the single pass cleans x ∈ [0.03, 0.75]
const specks = [];
while (specks.length < N) { const u = (rnd() * 2 - 1) * 0.8, v = rnd() * 0.98 - 0.5; if (!inside(u * 1.04, v * 1.04) || !inside(u, v)) continue; const shade = rnd(); specks.push({ x: u, z: -v, rot: rnd() * Math.PI, len: 0.012 + rnd() * 0.03, wid: 0.004 + rnd() * 0.008, ph: rnd() * 6.28, col: shade < 0.55 ? "#EEF1F4" : shade < 0.85 ? "#C4CAD3" : "#D8C9AE" }); }
const lint = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.9 }), N);
specks.forEach((s, i) => lint.setColorAt(i, new THREE.Color(s.col))); scene.add(lint);
const dummy = new THREE.Object3D();

// ------------------------------------------------------------------ lint roller (fictional): sticky roll on a teal handle; roll axis = x
const RR = 0.085, RL = 0.72;
const roller = new THREE.Group(); scene.add(roller); const rollerSh = contactShadow();
const roll = new THREE.Group(); roller.add(roll);
const lintSkinTex = (() => { const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 512; const g = cv.getContext("2d"); g.clearRect(0, 0, 1024, 512);
  for (let i = 0; i < 2600; i++) { const x = rnd() * 1024, y = rnd() * 512, l = 4 + rnd() * 16, a = rnd() * Math.PI; const sh = rnd(); g.strokeStyle = sh < 0.55 ? "rgba(70,78,92,0.85)" : sh < 0.85 ? "rgba(120,128,140,0.8)" : "rgba(150,130,100,0.8)"; g.lineWidth = 1.5 + rnd() * 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
{ const sheet = new THREE.Mesh(new THREE.CylinderGeometry(RR, RR, RL, 64, 1, true), mat("#FBFBF7", { roughness: 0.18, clearcoat: 1 })); sheet.rotation.z = Math.PI / 2; sheet.castShadow = true; roll.add(sheet);
  const skin = new THREE.Mesh(new THREE.CylinderGeometry(RR + 0.0015, RR + 0.0015, RL - 0.01, 64, 1, true), new THREE.MeshStandardMaterial({ map: lintSkinTex, transparent: true, opacity: 0, roughness: 0.8, depthWrite: false })); skin.rotation.z = Math.PI / 2; skin.name = "skin"; roll.add(skin);
  for (const sx of [-1, 1]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(RR + 0.008, RR + 0.008, 0.02, 48), mat(C3.teal, { roughness: 0.35 })); cap.rotation.z = Math.PI / 2; cap.position.x = sx * (RL / 2 + 0.01); roll.add(cap); } }
{ const metal = mat("#9AA9AE", { metalness: 0.8, roughness: 0.3 });
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, RL + 0.08, 10), metal); arm.rotation.z = Math.PI / 2; arm.position.set(0, 0, 0); roller.add(arm); // axle
  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 10), metal); fork.position.set(RL / 2 + 0.04, 0.07, 0.06); fork.rotation.x = 0.7; roller.add(fork);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.06, 0.34, 3, 0.025), mat(C3.teal, { roughness: 0.35 })); handle.position.set(RL / 2 + 0.04, 0.2, 0.27); handle.rotation.x = -0.75; handle.castShadow = true; roller.add(handle); }
// adjective tiles (white faces, ink Devanagari words, mint edges)
const TW = 0.98, TH = 0.3, TD = 0.12;
const tiles = ADJ.map((w) => { const g = new THREE.Group(); scene.add(g);
  const box = new THREE.Mesh(new RoundedBoxGeometry(TW, TD, TH, 4, 0.04), mat(C3.mint, { roughness: 0.4 })); box.castShadow = true; box.receiveShadow = true; g.add(box);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.06, TH - 0.05), new THREE.MeshStandardMaterial({ map: textTex(w), roughness: 0.6 })); face.rotation.x = -Math.PI / 2; face.position.y = TD / 2 + 0.002; g.add(face);
  return { g, sh: contactShadow() }; });
// "beauty filter" pane (the thing NOT to use): a glossy mint sheet that brightens the after-half
const pane = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.012, 1.05, 3, 0.006), new THREE.MeshBasicMaterial({ color: "#BFF5EE", transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(pane);
// CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped) on a slab in the logo's mint
const tile = new THREE.Group(); scene.add(tile); const tileSh = contactShadow();
const LW = 0.94, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.04, LH + 0.04, 0.12, 5, 0.03), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.04) / 2; slab.castShadow = true; tile.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.04) / 2, 0.0605); tile.add(face); }
const dustTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(220,226,232,0.9)"); r.addColorStop(1, "rgba(220,226,232,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const dust = Array.from({ length: 14 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });

// ------------------------------------------------------------------ motion helpers
function dropY(t, t0, t1, y0, y1 = 0) { const u = clamp((t - t0) / (t1 - t0)); if (u < 0.62) return lerp(y0, y1 + 0.16, E.out(u / 0.62)); if (u < 0.9) return lerp(y1 + 0.16, y1 + 0.06, (u - 0.62) / 0.28); return lerp(y1 + 0.06, y1, ((u - 0.9) / 0.1) ** 2); }
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };
const lerpV = (a, b, u) => v3(lerp(a.x, b.x, u), lerp(a.y, b.y, u), lerp(a.z, b.z, u));

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const TOP = [[0, 3.2, 3.95], [0.02, 0, 0.12]];
const CAMS = [
  [0.0, [0, 2.85, 3.5], [0, 0, 0.08]], [3.6, [0, 2.95, 3.65], [0, 0, 0.1]], [4.6, ...TOP], [12.8, ...TOP], [13.4, [0, 3.0, 3.7], [0.02, 0, 0.1]], [15.5, [0, 3.0, 3.65], [0.02, 0, 0.1]],
  [16.6, [0.38, 1.3, 2.85], [0.38, 0.48, 0.58]], [19.1, [0.37, 1.3, 2.8], [0.38, 0.48, 0.58]], [20.0, ...TOP], [25.35, ...TOP], [26.35, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// roller pose: idle (front, on the floor) → lifted to the neck → one pass to the hem → parked → lifted to camera → parked
const IDLE = v3(0.39, RR, 0.92), PASS_Z0 = -0.6, PASS_Z1 = 0.62, TOPY = SW_T + 0.008 + RR;
function rollerPose(t) {
  let p = v3(IDLE.x, IDLE.y, IDLE.z), spin = 0, tilt = 0, yaw = 0;
  if (t < T.rollerIn[1]) { const u = ramp(t, ...T.rollerIn, E.out); p = v3(IDLE.x, RR, lerp(2.3, IDLE.z, u)); spin = (lerp(2.3, IDLE.z, u) - 2.3) / RR; }
  else if (t < T.rollerOn[1]) { const u = ramp(t, ...T.rollerOn, E.inOut); p = lerpV(IDLE, v3(IDLE.x, TOPY, PASS_Z0), u); p.y += Math.sin(Math.PI * u) * 0.32; spin = (IDLE.z - 2.3) / RR; }
  else if (t < T.pass[1]) { const u = ramp(t, ...T.pass, E.inOut); p = v3(IDLE.x, TOPY, lerp(PASS_Z0, PASS_Z1, u)); spin = (IDLE.z - 2.3) / RR + (lerp(PASS_Z0, PASS_Z1, u) - PASS_Z0) / RR; }
  else { const s0 = (IDLE.z - 2.3) / RR + (PASS_Z1 - PASS_Z0) / RR; const u = ramp(t, ...T.rollerOff, E.inOut); p = lerpV(v3(IDLE.x, TOPY, PASS_Z1), IDLE, u); p.y += Math.sin(Math.PI * u) * 0.15; spin = s0;
    const lu = ramp(t, ...T.lift, E.inOut) * (1 - ramp(t, ...T.lower, E.inOut)); p = lerpV(p, v3(IDLE.x, 0.5, 0.62), lu); spin = s0 + lu * 2.2 + (t > T.lift[1] && t < T.lower[0] ? (t - T.lift[1]) * 0.5 : t >= T.lower[0] ? (T.lower[0] - T.lift[1]) * 0.5 : 0); tilt = -0.2 * lu; yaw = 0.55 * lu; }
  return { p, spin, tilt, yaw };
}
const rollerZ = (t) => (t < T.pass[0] ? -9 : t >= T.pass[1] ? 9 : lerp(PASS_Z0, PASS_Z1, ramp(t, ...T.pass, E.inOut)));

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in), off = -2.9 * cl;
  sweater.position.x = off; sweater.visible = cl < 1; placeShadow(sweaterSh, off, 0, 0, 0.85, 0.55, cl < 1 ? 0.7 : 0);
  // --- lint: puff on the hook; picked up under the roller's single pass (right half only)
  const zr = rollerZ(t);
  specks.forEach((s, i) => {
    const cleanable = s.x > CLEAN_X0 && s.x < CLEAN_X1; let y = SW_T + 0.009, sc = 1, x = s.x, z = s.z;
    const pu = pulse(t, T.puff + 0.02 * Math.sin(s.ph), 0.45); y += pu * (0.03 + 0.04 * ((i * 37) % 10) / 10);
    const ad = Math.max(pulse(t, T.adjDrop[0][1], 0.35), pulse(t, T.adjDrop[1][1], 0.3)); y += ad * 0.015 * ((i * 13) % 7) / 7;
    if (cleanable) { const d = zr - (z - 0.02); if (d > 0) { const u = clamp(d / 0.08); y += u * (RR * 1.4); z = lerp(z, zr - RR * 0.4, u); sc = 1 - u; } }
    dummy.position.set(x + off, y, z); dummy.rotation.set(0, s.rot, 0); dummy.scale.set(s.len * Math.max(0.0001, sc), 1, s.wid * Math.max(0.0001, sc)); dummy.updateMatrix(); lint.setMatrixAt(i, dummy.matrix);
  });
  lint.instanceMatrix.needsUpdate = true; lint.visible = cl < 1;
  // --- adjective tiles: drop / slide in, sit on the sweater (lint stays), slide off on "एक"
  const wo = ramp(t, ...T.wordsOff, E.in);
  tiles.forEach((tl, i) => {
    const [d0, d1] = T.adjDrop[i]; const vis = t >= d0 && wo < 1; const restZ = i === 0 ? -0.12 : 0.22, restX = i === 0 ? -0.05 : 0.12;
    let x = restX, y = SW_T + TD / 2, z = restZ, rz = 0, ry = i === 0 ? 0.08 : -0.1;
    if (i === 0) y = dropY(t, d0, d1, 3.0, SW_T) + TD / 2; else { const u = ramp(t, d0, d1, E.out); x = lerp(2.3, restX, u); ry += (1 - u) * 0.6; }
    rz = wobble(t, T.puff, 0.05 * (i ? -1 : 1), 5, 5);
    if (wo > 0) { x = restX - 2.8 * wo; ry += wo * 0.8; }
    tl.g.visible = vis; tl.g.position.set(x, y, z); tl.g.rotation.set(0, ry, rz); const sq = squash(t, d1, -0.1); tl.g.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4);
    placeShadow(tl.sh, x, z, Math.max(0, y - SW_T - TD / 2), TW * 0.5, 0.16, vis ? 0.8 : 0);
  });
  // --- roller
  const rp = rollerPose(t); roller.visible = t >= T.rollerIn[0] && cl < 1; roller.position.copy(rp.p).add(v3(off, 0, 0)); roller.rotation.set(rp.tilt, rp.yaw, 0); roll.rotation.x = rp.spin;
  roll.getObjectByName("skin").material.opacity = ramp(t, T.pass[0] + 0.1, T.pass[1], E.lin);
  placeShadow(rollerSh, rp.p.x + off, rp.p.z, Math.max(0, rp.p.y - RR), 0.4, 0.1, roller.visible ? 0.8 : 0);
  // --- filter pane: slides over the after-half, then is pulled away
  const fi = ramp(t, ...T.filterIn, E.out), fo = ramp(t, ...T.filterOut, E.in);
  pane.visible = fi > 0 && fo < 1; pane.position.set(0.39 + 1.6 * fo, SW_T + 0.09 + 0.25 * fo, lerp(-1.2, 0.02, fi) - 0.3 * fo); pane.rotation.set(0, 0, -0.35 * fo); pane.material.opacity = 0.55 * fi * (1 - fo);
  // --- dust on landings
  const bursts = [[T.adjDrop[0][1], -0.05, -0.12, 0.42], [T.tile[1], 0, 0.3, 0.45]];
  dust.forEach((s) => (s.visible = false)); let di = 0;
  for (const [tb, x0, z0, r] of bursts) { const d = t - tb; if (d < 0 || d > 0.5) continue; for (let i = 0; i < 7 && di < dust.length; i++, di++) { const a = (i / 7) * Math.PI * 2 + 0.4, s = dust[di]; s.visible = true; s.position.set(x0 + Math.cos(a) * r * (1 + d * 1.6), 0.06 + d * 0.1, z0 + Math.sin(a) * r * 0.6 * (1 + d * 1.6)); s.scale.setScalar(0.12 + d * 0.35); s.material.opacity = 0.7 * (1 - d / 0.5); } }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("chip"), [540, 584], win(t, ...T.chip, 0.25, 0.3));
  let svg = "";
  const fr = win(t, ...T.frame, 0.2, 0.25) * (1 - win(t, T.lift[0] - 0.1, T.lower[1], 0.2, 0.25));
  if (fr > 0) { const pts = [v3(-0.86, 0, -0.62), v3(0.86, 0, -0.62), v3(-0.86, 0, 0.62), v3(0.86, 0, 0.62)].map(toScreen);
    const x0 = Math.max(100, Math.min(...pts.map((p) => p[0]))), x1 = Math.min(980, Math.max(...pts.map((p) => p[0]))), y0 = Math.max(620, Math.min(...pts.map((p) => p[1]))), y1 = Math.min(1540, Math.max(...pts.map((p) => p[1])));
    const s = 1 + 0.05 * (1 - E.out(ramp(t, T.frame[0], T.frame[0] + 0.3))) + 0.03 * pulse(t, T.pulseFrame, 0.35) + 0.03 * pulse(t, T.pulseLight, 0.35), L = 70;
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, X0 = cx + (x0 - cx) * s, X1 = cx + (x1 - cx) * s, Y0 = cy + (y0 - cy) * s, Y1 = cy + (y1 - cy) * s;
    svg += `<g stroke="${C.ink}" stroke-width="8" fill="none" stroke-linecap="round" opacity="${fr}"><path d="M${X0} ${Y0 + L} V${Y0} H${X0 + L}"/><path d="M${X1 - L} ${Y0} H${X1} V${Y0 + L}"/><path d="M${X0} ${Y1 - L} V${Y1} H${X0 + L}"/><path d="M${X1 - L} ${Y1} H${X1} V${Y1 - L}"/></g>`; }
  // divider between the halves (split scene and rules)
  const dv = win(t, T.divider, T.ctaClear[0], 0.3, 0.2) * (1 - win(t, T.lift[0] - 0.1, T.lower[1], 0.2, 0.25));
  if (dv > 0) { const a = toScreen(v3(CLEAN_X0 + off, SW_T, -0.52)), b = toScreen(v3(CLEAN_X0 + off, SW_T, 0.52)); const u = ramp(t, T.divider, T.divider + 0.4, E.out); svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${lerp(a[0], b[0], u)}" y2="${lerp(a[1], b[1], u)}" stroke="${C.mint}" stroke-width="7" stroke-dasharray="16 12" opacity="${dv}"/>`; }
  // shutter flashes (soft)
  const fl = Math.max(pulse(t, T.shot1, 0.18), pulse(t, T.shot2, 0.18)); if (fl > 0) svg += `<rect x="0" y="0" width="1080" height="1920" fill="#FFFFFF" opacity="${0.35 * fl}"/>`;
  // filter rejected: cross over the leaving pane
  const xo = win(t, T.filterOut[0], T.filterOut[1] + 0.35, 0.08, 0.3); if (xo > 0) { const p = toScreen(v3(0.39 + 0.4, SW_T + 0.2, -0.1)); const r = 46; svg += `<g stroke="${C.ink}" stroke-width="10" stroke-linecap="round" opacity="${xo}"><line x1="${p[0] - r}" y1="${p[1] - r}" x2="${p[0] + r}" y2="${p[1] + r}"/><line x1="${p[0] + r}" y1="${p[1] - r}" x2="${p[0] - r}" y2="${p[1] + r}"/></g>`; }
  $("ov").innerHTML = svg;
  const half = (x) => toScreen(v3(x + off, SW_T, -0.05));
  const hide = 1 - win(t, T.lift[0] - 0.1, T.lower[1], 0.2, 0.25);
  hudAt($("nBefore"), half(-0.4), Math.max(win(t, T.before, T.pass[0], 0.25, 0.3), win(t, T.labelBefore, T.ctaClear[0], 0.25, 0.2)) * hide, 0.85 + 0.15 * Math.min(1, Math.max(pop(t, T.before, 0.3), pop(t, T.labelBefore, 0.3))));
  hudAt($("nAfter"), half(0.4), win(t, T.labelAfter, T.ctaClear[0], 0.25, 0.2) * hide, 0.85 + 0.15 * Math.min(1, pop(t, T.labelAfter, 0.3)));
  hudAt($("nProof"), (() => { const p = toScreen(v3(0.39, 0.5 + 0.2, 0.62)); return [p[0], Math.max(640, p[1])]; })(), win(t, T.proofNote, T.lower[0], 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.proofNote, 0.3)));
  [["r1", T.rule1, 0], ["r2", T.rule2, 1], ["r3", T.rule3, 2]].forEach(([id, t0, k]) => hudAt($(id), [540, 1340 + k * 80], win(t, t0, T.ctaClear[0], 0.25, 0.2), 0.85 + 0.15 * Math.min(1, pop(t, t0, 0.3))));
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".tag, .note, #chip, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
