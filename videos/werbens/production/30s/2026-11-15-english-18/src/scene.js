// Werbens · 30 s English-18 — "SAME DRINK. DIFFERENT FIZZ?" (sound cues and perceived carbonation: the same sparkling water
// seemed more carbonated when its fizz sounded louder/brighter or was held closer to the ear, but not in the mouth; Zampini &
// Spence 2005), in the accepted 'Satisfying Product Theatre' style on the live app.werbens.com dark-navy theme (context/17
// re-checked 2026-11-15; rules context/27 incl. §5 first frame). Unbranded glasses, no prices. Deterministic: everything is a function of t.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT, LEVEL, BUBBLES, KNOB, track } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "SAME DRINK. DIFFERENT FIZZ? SAME WATER SEEMS FIZZIER CLOSER, FIZZIER NO CHANGE BEFORE THE SIP THEN DELIVER Werbens")));
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


// ------------------------------------------------------------------ the stage (illustration): one low ink plinth; two identical,
// unbranded glasses of sparkling water on speaker coasters; a five-bar sound meter behind each glass; rating sliders in front.
const HALF = Math.PI / 2, GX = [-0.05, 0.05], PLT = 0.02, CH = 0.008, YC = PLT + CH, GH = 0.13, WH = 0.105;
const stage = new THREE.Group(); scene.add(stage); const stageSh = contactShadow();
{ const g = new THREE.LatheGeometry([[0, 0], [0.126, 0], [0.13, 0.004], [0.13, 0.016], [0.126, PLT], [0, PLT]].map(([r, y]) => new THREE.Vector2(r, y)), 96);
  const m = new THREE.Mesh(g, mat(C3.ink, { roughness: 0.55, clearcoat: 0.25 })); m.castShadow = true; m.receiveShadow = true; stage.add(m); }
const coasterGeo = new THREE.LatheGeometry([[0, 0], [0.031, 0], [0.033, 0.002], [0.033, 0.006], [0.031, CH], [0, CH]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
const glassGeo = new THREE.LatheGeometry([[0, 0], [0.0225, 0], [0.0232, 0.003], [0.027, GH], [0.0254, GH], [0.0212, 0.0062], [0, 0.0062]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
const waterGeo = new THREE.LatheGeometry([[0, 0.0064], [0.021, 0.0064], [0.0244, WH], [0, WH]].map(([r, y]) => new THREE.Vector2(r, y)), 64);
const bubGeo = new THREE.SphereGeometry(1, 10, 8), NB = 70;
const barGeo = new RoundedBoxGeometry(0.0072, 1, 0.0072, 2, 0.002); barGeo.translate(0, 0.5, 0);
const STAR_TEX = canvasTex(128, 128, (k, w) => { const c = w / 2; const g = k.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(200,255,248,0.6)"); g.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = g;
  k.beginPath(); for (let a = 0; a < 8; a++) { const r = a % 2 ? 0.1 * c : c, an = (a * Math.PI) / 4; k.lineTo(c + r * Math.cos(an), c + r * Math.sin(an)); } k.closePath(); k.fill(); });
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const BUB = Array.from({ length: NB }, (_, i) => ({ r: Math.sqrt(hash(i)) * 0.0165, a: hash(i + 100) * Math.PI * 2, v: 0.32 + 0.3 * hash(i + 200), p: hash(i + 300), s: 0.00105 + 0.0011 * hash(i + 400), w: hash(i + 500) * 6.28 }));
const glasses = GX.map((x, k) => {
  const coaster = new THREE.Mesh(coasterGeo, mat("#15223A", { roughness: 0.4, clearcoat: 0.6 })); coaster.position.set(x, PLT, 0); coaster.receiveShadow = true; stage.add(coaster);
  const ringM = mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.2 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.0016, 10, 64), ringM); ring.rotation.x = -HALF; ring.position.set(x, PLT + CH + 0.0004, 0); stage.add(ring);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false })); glow.rotation.x = -HALF; glow.renderOrder = 2; stage.add(glow);
  const g = new THREE.Group(); stage.add(g);
  const water = new THREE.Mesh(waterGeo, new THREE.MeshPhysicalMaterial({ color: "#2E8C88", roughness: 0.12, transparent: true, opacity: 0.4, depthWrite: false, emissive: C.teal, emissiveIntensity: 0.12 })); water.renderOrder = 3; g.add(water);
  const bub = new THREE.InstancedMesh(bubGeo, new THREE.MeshBasicMaterial({ color: "#F4FFFD", transparent: true, opacity: 0.9, toneMapped: false }), NB); bub.renderOrder = 4; bub.frustumCulled = false; g.add(bub);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshPhysicalMaterial({ color: "#E8FFFB", roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide })); glass.renderOrder = 5; g.add(glass);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.02625, 0.0009, 8, 64), new THREE.MeshPhysicalMaterial({ color: "#F0FDFA", roughness: 0.1, transparent: true, opacity: 0.75 })); rim.rotation.x = -HALF; rim.position.y = GH; rim.renderOrder = 6; g.add(rim);
  const barM = mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.2 });
  // the sound meter stands beside the glass, on its outer side (never seen through the glass)
  const side = k ? 1 : -1, bars = [0, 1, 2, 3].map((j) => { const b = new THREE.Mesh(barGeo, barM); b.position.set(x + side * (0.0385 + j * 0.0098), PLT, -0.004); b.castShadow = true; stage.add(b); return b; });
  const barBase = new THREE.Mesh(new RoundedBoxGeometry(0.042, 0.003, 0.013, 2, 0.001), mat("#15223A", { roughness: 0.4 })); barBase.position.set(x + side * 0.0532, PLT + 0.0015, -0.004); stage.add(barBase);
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.0024, 0.0024, 0.125, 16), mat(C3.teal, { roughness: 0.35, transparent: true })); straw.castShadow = true; stage.add(straw);
  const sparks = [0, 1].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: STAR_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 7; stage.add(s); return s; });
  return { x, k, g, water, bub, glass, ringM, glow, bars, barM, straw, sparks };
});
// perceived-fizz rating sliders (illustration of the study's visual analogue scale): track, filled part, knob; a flat disc at the
// "flat" end and three tiny bubbles at the "fizzy" end (no text)
const SZ = 0.1, SW = 0.058;
const sliders = GX.map((x) => { const grp = new THREE.Group(); grp.position.set(x, PLT + 0.003, SZ); stage.add(grp);
  const track_ = new THREE.Mesh(new RoundedBoxGeometry(SW, 0.005, 0.011, 2, 0.0022), mat("#24586A", { roughness: 0.4 })); grp.add(track_);
  const fillG = new RoundedBoxGeometry(1, 0.0056, 0.0114, 2, 0.0022); fillG.translate(0.5, 0, 0);
  const fill = new THREE.Mesh(fillG, mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.25 })); fill.position.x = -SW / 2; grp.add(fill);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 24, 16), mat(C3.mintw, { roughness: 0.2, emissive: C.mint, emissiveIntensity: 0.25 })); knob.castShadow = true; grp.add(knob);
  const flat = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.0012, 24), mat("#3A8195", { roughness: 0.4 })); flat.position.set(-SW / 2 - 0.009, 0.0004, 0); grp.add(flat);
  [[0, 0, 0.0021], [0.004, 0.0035, 0.0016], [-0.0012, 0.0062, 0.0013]].forEach(([dx, dy, r]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), mat(C3.mintw, { roughness: 0.2, emissive: C.mint, emissiveIntensity: 0.3 })); b.position.set(SW / 2 + 0.008 + dx, 0.002 + dy, 0); grp.add(b); });
  return { grp, fill, knob }; });
const osc = (t, j, k) => clamp(0.5 + 0.32 * Math.sin(2 * Math.PI * (3.1 + j * 0.73 + k * 0.41) * t + j * 1.7 + k) + 0.2 * Math.sin(2 * Math.PI * (6.3 + j * 0.57) * t + j * 2.3 + k * 0.7));
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3();

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
const F0 = [[0.0, 0.16, 0.68], [0.0, 0.109, 0.0]], F1 = [[0.0, 0.16, 0.65], [0.0, 0.112, 0.0]];
const FS = [[0.0, 0.24, 0.72], [0.0, 0.113, 0.03]], FE = [[0.008, 0.222, 0.76], [0.012, 0.118, 0.05]], FM = [[0.0, 0.255, 0.68], [0.0, 0.122, 0.0]];
const FP = [[0.0, 0.232, 0.7], [0.0, 0.113, 0.02]], FP2 = [[0.0, 0.228, 0.67], [0.0, 0.112, 0.02]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.3, ...F1], [6.9, ...F1], [7.8, ...FS], [11.3, ...FS], [12.4, ...FE], [14.45, ...FE], [15.3, ...FM], [18.55, ...FM], [19.4, ...FP], [26.1, ...FP2], [27.1, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ frame
const cTeal = new THREE.Color("#3A8195"), cMint = new THREE.Color(C3.mint);
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  stage.position.y = -0.26 * cl; stage.visible = cl < 0.999; placeShadow(stageSh, 0, 0, 0, 0.13, 0.13, 0.8 * (1 - cl));
  const bb = track(BUBBLES, t), sp = Math.sqrt(Math.max(0.2, bb)), nAct = Math.round(42 * Math.max(bb, 0.0001));
  const lift = ramp(t, ...T.lift, E.inOut) * (1 - ramp(t, ...T.back, E.inOut)), ting = win(t, ...T.tingle, 0.25, 0.4);
  const strIn = (k) => ramp(t, T.straws[0] + k * 0.1, T.straws[1] + k * 0.1, E.out), strOut = ramp(t, ...T.strawsOut, E.inOut);
  glasses.forEach((G, k) => {
    const lv = track(LEVEL[k ? "R" : "L"], t);
    // glass position: the right one lifts toward the viewer ("closer to the ear") and returns
    const gx = G.x - (k ? 0.01 * lift : 0), gy = YC + (k ? 0.026 * lift : 0), gz = k ? 0.1 * lift : 0;
    G.g.position.set(gx, gy, gz);
    // bubbles: identical seeds in both glasses (same water); only BUBBLES (real fizz) changes their number and speed
    for (let i = 0; i < NB; i++) { const b = BUB[i], on = i < nAct;
      const f = ((t * b.v * sp + b.p) % 1 + 1) % 1, y = 0.009 + f * (WH - 0.013), r = on ? b.s * (0.75 + 0.5 * f) * (1 + 0.6 * ting) : 0.000001;
      tmpP.set(b.r * Math.cos(b.a) + 0.0007 * Math.sin(9 * t + b.w), y, b.r * Math.sin(b.a)); tmpS.setScalar(r); tmpM.compose(tmpP, tmpQ, tmpS); G.bub.setMatrixAt(i, tmpM); }
    G.bub.instanceMatrix.needsUpdate = true; G.bub.material.opacity = 0.85 + 0.15 * ting;
    G.water.material.emissiveIntensity = 0.1 + 0.12 * ting;
    // sound: coaster ring + glow and the five bars follow the glass's sound level
    G.ringM.emissiveIntensity = 0.1 + 0.9 * lv; G.glow.visible = lv > 0.02; G.glow.material.opacity = 0.55 * lv; G.glow.position.set(G.x, PLT + CH + 0.0006, 0); G.glow.scale.setScalar(0.07 + 0.07 * lv);
    G.bars.forEach((m, j) => { m.scale.set(1, 0.004 + 0.072 * lv * (0.3 + 0.7 * osc(t, j, k)), 1); });
    G.barM.color.lerpColors(cTeal, cMint, clamp(lv * 1.2)); G.barM.emissiveIntensity = 0.06 + 0.4 * lv;
    // straws: drop into both glasses (mouth test), lift out after
    const si = strIn(k); G.straw.visible = si > 0.001 && strOut < 0.999; G.straw.material.opacity = Math.min(1, si * 3) * (1 - strOut);
    G.straw.position.set(G.x + (k ? 0.01 : -0.01), YC + 0.012 + 0.0625 + 0.05 * (1 - si) + 0.015 * strOut, 0.004); G.straw.rotation.z = k ? -0.16 : 0.16;
    G.sparks.forEach((s, j) => { const p = pulse(t, T.tingle[0] + 0.15 + j * 0.35 + k * 0.12, 0.5); s.visible = p > 0.01; s.material.opacity = p; const sc = 0.016 + 0.012 * p; s.scale.set(sc, sc, 1); s.position.set(G.x + (j ? 0.012 : -0.01), YC + WH + 0.004, 0.006); });
  });
  // rating sliders (direction only): appear in the lab beat; knob positions from KNOB
  const sv = ramp(t, ...T.sliders, E.out);
  sliders.forEach((S, k) => { const u = track(KNOB[k ? "R" : "L"], t); S.grp.visible = sv > 0.001; S.grp.scale.setScalar(Math.max(0.001, E.outBack(sv)));
    S.knob.position.set(-SW / 2 + SW * u, 0.0045, 0); S.fill.scale.set(Math.max(0.0005, SW * u), 1, 1); });

  // --- lights: hero spot on the loud (right) glass; on both during the mouth test and the payoff's "deliver"
  { const both = win(t, T.straws[0], T.strawsOut[1], 0.3, 0.4) + ramp(t, T.hear[0], T.deliver[1]), tx = lerp(GX[1], 0, clamp(both));
    hero.intensity = (2.4 + 1.2 * win(t, ...T.rate, 0.2, 0.6)) * (1 - cl); hero.position.set(tx + 0.1, 1.1, 0.55); hero.target.position.set(tx, YC + 0.05, 0); hero.target.updateMatrixWorld();
    heroC.intensity = 0; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lSame", T.sameLab); lab("lFizz", T.fizzLab); lab("lClose", T.closeLab); lab("lNo", T.noLab); lab("lSip", T.sipLab); lab("lDel", T.delLab);
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
