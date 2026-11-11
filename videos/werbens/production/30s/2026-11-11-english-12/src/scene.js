// Werbens · 30 s English-12 — "Same product. New perception." (why a brand can make an ordinary product feel expensive:
// positioning by name + a verified brand example + a brand-knowledge study), in the accepted 'Satisfying Product Theatre'
// style (same renderer, motion grammar, caption treatment and CTA tile as english-06…11). Colour theme = the live
// app.werbens.com rendered palette (dark-navy hero, mint/teal accents; context/17 re-checked 2026-11-11, context/27 rules).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "Häagen-Dazs BRAND ? 1960 SIGNAL IT DELIVER IT SAME PRODUCT. NEW PERCEPTION. Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-11); C3 = lit 3D bases (pre-compensated for ACES
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
scene.add(new THREE.HemisphereLight("#BFEDE7", "#0B1120", 0.38));
const key_ = new THREE.SpotLight("#FFFFFF", 11, 0, 0.62, 0.9, 2); key_.castShadow = true; key_.shadow.mapSize.set(2048, 2048); key_.shadow.radius = 5; key_.shadow.bias = -0.0004; key_.shadow.normalBias = 0.02; key_.shadow.camera.near = 0.5; key_.shadow.camera.far = 8; scene.add(key_, key_.target);
const hero = new THREE.SpotLight("#F4FFFD", 0, 0, 0.24, 0.85, 2); hero.castShadow = true; hero.shadow.mapSize.set(1024, 1024); hero.shadow.radius = 4; hero.shadow.bias = -0.0004; hero.shadow.camera.near = 0.3; hero.shadow.camera.far = 5; scene.add(hero, hero.target);
const heroC = new THREE.SpotLight("#F4FFFD", 0, 0, 0.26, 0.8, 2); scene.add(heroC, heroC.target);
const rim = new THREE.DirectionalLight(C.mint, 2.2); rim.position.set(0.5, 1.3, -2.2); scene.add(rim);

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
const SHADOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(2,6,14,0.95)"); grd.addColorStop(0.45, "rgba(2,6,14,0.5)"); grd.addColorStop(1, "rgba(2,6,14,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); })();
function contactShadow() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; m.renderOrder = 1; scene.add(m); return m; }
function placeShadow(sh, x, z, h, rx, rz = rx, op = 1) { const s = 1 + h * 0.9; sh.position.set(x, 0.002, z); sh.scale.set(rx * 2.7 * s, rz * 2.7 * s, 1); sh.material.opacity = (op * 0.7) / (1 + h * 2.4); sh.visible = op > 0.01; }
function canvasTex(w, h, draw) { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv.getContext("2d"), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const fitText = (k, txt, font, maxW, px) => { let s = px; k.font = `${s}px ${font}`; while (k.measureText(txt).width > maxW && s > 10) { s -= 2; k.font = `${s}px ${font}`; } };
const GLOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(127,231,220,0.85)"); grd.addColorStop(0.35, "rgba(92,224,210,0.35)"); grd.addColorStop(1, "rgba(92,224,210,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ ice-cream tubs (identical silhouettes) + sleeve + name + lid
const TUB_H = 0.152, rAt = (y) => 0.071 + (0.084 - 0.071) * clamp((y - 0.004) / 0.144);
const tubGeo = new THREE.LatheGeometry([[0, 0], [0.068, 0], [0.071, 0.004], [0.084, 0.148], [0.086, 0.152], [0.082, 0.152], [0.08, 0.146], [0.0, 0.146]].map(([a, b]) => new THREE.Vector2(a, b)), 64);
const lidGeo = new THREE.LatheGeometry([[0, 0], [0.089, 0], [0.092, 0.004], [0.092, 0.019], [0.087, 0.024], [0, 0.024]].map(([a, b]) => new THREE.Vector2(a, b)), 64);
const SL0 = 0.024, SL1 = 0.136, SLH = SL1 - SL0;
const sleeveGeo = new THREE.CylinderGeometry(rAt(SL1) + 0.0016, rAt(SL0) + 0.0016, SLH, 96, 1, true), nameGeo = new THREE.CylinderGeometry(rAt(SL1) + 0.0024, rAt(SL0) + 0.0024, SLH, 96, 1, true);
const sleeveTex = canvasTex(2304, 512, (k, w, h) => { k.fillStyle = C.teal; k.fillRect(0, 0, w, h); k.fillStyle = C.mint; k.fillRect(0, 26, w, 22); k.fillRect(0, h - 48, w, 22); });
function nameTex(txt, spanU = 0.34, font = "IDBK") { return canvasTex(2304, 512, (k, w, h) => { k.clearRect(0, 0, w, h); k.fillStyle = C.mintw; fitText(k, txt, font, w * spanU, 170); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.53); }); }
function makeTub() {
  const g = new THREE.Group(); scene.add(g);
  const bodyM = mat(C3.mintw, { roughness: 0.36, clearcoat: 0.6, side: THREE.DoubleSide }); const body = new THREE.Mesh(tubGeo, bodyM); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cream = new THREE.Mesh(new THREE.CircleGeometry(0.0795, 48), mat("#F3FBF9", { roughness: 0.6, clearcoat: 0.2 })); cream.rotation.x = -Math.PI / 2; cream.position.y = 0.141; g.add(cream);
  const clipS = new THREE.Plane(v3(0, -1, 0), 0), clipN = new THREE.Plane(v3(-1, 0, 0), 0);
  const sleeve = new THREE.Mesh(sleeveGeo, mat("#D6D6D6", { map: sleeveTex, roughness: 0.28, clearcoat: 1, clippingPlanes: [clipS] })); sleeve.position.y = SL0 + SLH / 2; sleeve.rotation.y = Math.PI; sleeve.castShadow = true; g.add(sleeve);
  const nameM = new THREE.MeshPhysicalMaterial({ map: nameTex("Häagen-Dazs"), transparent: true, roughness: 0.3, clearcoat: 1, clippingPlanes: [clipN, clipS], polygonOffset: true, polygonOffsetFactor: -2 });
  const name = new THREE.Mesh(nameGeo, nameM); name.position.y = SL0 + SLH / 2; name.rotation.y = Math.PI; g.add(name);
  const lidM = mat(C3.mintw, { roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.3 }); const lid = new THREE.Mesh(lidGeo, lidM); lid.castShadow = true; lid.position.y = TUB_H - 0.004; scene.add(lid);
  return { g, body, sleeve, name, lid, lidM, clipS, clipN, sh: contactShadow(), lidSh: contactShadow() };
}
const tubA = makeTub(), tubB = makeTub(); tubB.name.visible = false;
const LID_W = new THREE.Color(C3.mintw), LID_M = new THREE.Color("#2AAEA1"); // lid top faces the spotlight: darker lit base so it renders ≈ mint #7FE7DC
// plinths (the site's ink panels), rising out of the floor
function makePlinth() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.124, 0.07, 72), mat(C3.ink, { roughness: 0.25, clearcoat: 1 })); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; }
const PL_H = 0.07, plA = makePlinth(), plB = makePlinth();
// "=" between the identical tubs
const eqG = new THREE.Group(); scene.add(eqG);
{ const m = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.25 }); for (const y of [-0.011, 0.011]) { const b = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.011, 0.011, 2, 0.005), m); b.position.y = y; b.castShadow = true; eqG.add(b); } }
// scoop (dense, ridged) + spoon + aura
const scoopGeo = (() => { const g = new THREE.SphereGeometry(0.074, 72, 48), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), r = 1 + 0.03 * Math.sin(9 * a + y * 40) * Math.max(0, 1 - Math.abs(y) / 0.09) + 0.014 * Math.sin(5 * a - y * 70); p.setXYZ(i, x * r, y * 0.82, z * r); }
  g.computeVertexNormals(); return g; })();
const scoop = new THREE.Mesh(scoopGeo, mat("#F3FBF9", { roughness: 0.55, clearcoat: 0.35, clearcoatRoughness: 0.4 })); scoop.castShadow = true; scene.add(scoop);
const spoon = new THREE.Group(); scene.add(spoon);
{ const m = mat("#DCE8EA", { metalness: 0.85, roughness: 0.2, clearcoat: 0.5 });
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.024, 32, 16), m); bowl.scale.set(1, 0.32, 1.35); bowl.castShadow = true; spoon.add(bowl);
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.0055, 0.15, 4, 12), m); handle.rotation.x = Math.PI / 2; handle.position.set(0, 0.012, 0.105); handle.rotation.z = 0; handle.castShadow = true; spoon.add(handle);
  const bite = new THREE.Mesh(new THREE.SphereGeometry(0.019, 24, 16), mat("#F3FBF9", { roughness: 0.55, clearcoat: 0.3 })); bite.scale.y = 0.75; bite.position.y = 0.009; spoon.add(bite); spoon.userData.bite = bite; }
const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(aura);

// ------------------------------------------------------------------ the proof set: two identical cups, "≈", preference columns
const X2 = 0.5, CUPX = [X2 - 0.115, X2 + 0.115];
const cupGeo = new THREE.LatheGeometry([[0, 0], [0.052, 0], [0.055, 0.003], [0.068, 0.19], [0.071, 0.193], [0.066, 0.193], [0.064, 0.186], [0, 0.186]].map(([a, b]) => new THREE.Vector2(a, b)), 64);
const cRAt = (y) => 0.055 + (0.068 - 0.055) * clamp((y - 0.003) / 0.187);
const cupSleeveGeo = new THREE.CylinderGeometry(cRAt(0.15) + 0.0016, cRAt(0.045) + 0.0016, 0.105, 96, 1, true);
const brandTex = canvasTex(2304, 512, (k, w, h) => { k.fillStyle = C.teal; k.fillRect(0, 0, w, h); k.fillStyle = C.mint; k.fillRect(0, 26, w, 22); k.fillRect(0, h - 48, w, 22); k.fillStyle = C.mintw; fitText(k, "BRAND", "IDBK", w * 0.3, 230); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("BRAND", w / 2, h * 0.54); });
const cups = CUPX.map((x, i) => { const g = new THREE.Group(); g.position.x = x; scene.add(g);
  const body = new THREE.Mesh(cupGeo, mat(C3.mintw, { roughness: 0.42, clearcoat: 0.5, side: THREE.DoubleSide })); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const liq = new THREE.Mesh(new THREE.CircleGeometry(0.0635, 48), mat(C3.navyLiquid, { roughness: 0.08, clearcoat: 1 })); liq.rotation.x = -Math.PI / 2; liq.position.y = 0.176; g.add(liq);
  const clip = new THREE.Plane(v3(0, -1, 0), 0); let sleeve = null;
  if (i === 1) { sleeve = new THREE.Mesh(cupSleeveGeo, mat("#D6D6D6", { map: brandTex, roughness: 0.28, clearcoat: 1, clippingPlanes: [clip] })); sleeve.position.y = 0.0975; sleeve.rotation.y = Math.PI; g.add(sleeve); }
  return { g, clip, sleeve, sh: contactShadow() }; });
const approx = new THREE.Group(); scene.add(approx);
{ const m = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.25 });
  for (const y of [-0.012, 0.012]) { const pts = Array.from({ length: 33 }, (_, i) => { const u = i / 32; return v3(lerp(-0.026, 0.026, u), y + 0.0065 * Math.sin(u * Math.PI * 2), 0); });
    const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.0058, 10, false), m); t.castShadow = true; approx.add(t);
    for (const e of [pts[0], pts[32]]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.0058, 12, 8), m); cap.position.copy(e); approx.add(cap); } } }
// on "shifted preferences" the branded cup is the one people chose: it rises on a plinth into the light (the hook's grammar)
const plC = new THREE.Mesh(new THREE.CylinderGeometry(0.092, 0.097, 0.06, 64), mat(C3.ink, { roughness: 0.25, clearcoat: 1 })); plC.castShadow = true; plC.receiveShadow = true; scene.add(plC);

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

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const HOOKA = [[0, 0.29, 1.36], [0, 0.11, 0]], HOOKB = [[0, 0.31, 1.27], [0, 0.115, 0]], SUPER = [[0.12, 0.35, 0.95], [0.12, 0.185, 0]];
const STORY = [[0, 0.32, 1.0], [0, 0.135, 0]], STORY2 = [[0, 0.35, 0.95], [0, 0.17, 0]], NAMEV = [[0, 0.335, 0.84], [0, 0.165, 0]], SCOOPV = [[0, 0.4, 0.94], [0, 0.205, 0]];
const CUPV = [[X2, 0.34, 1.12], [X2, 0.15, 0]], CUPV2 = [[X2, 0.36, 1.03], [X2, 0.17, -0.03]], PAY = [[0.02, 0.42, 0.98], [0.02, 0.246, 0]], PAY2 = [[0.02, 0.41, 0.9], [0.02, 0.246, 0]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...HOOKA], [2.3, ...HOOKB], [2.45, ...HOOKB], [4.1, ...SUPER], [4.3, ...SUPER], [5.05, ...STORY], [7.1, ...STORY], [7.85, ...STORY2], [8.6, ...STORY2], [10.3, ...NAMEV],
  [10.7, ...NAMEV], [11.6, ...SCOOPV], [12.55, ...SCOOPV], [13.75, ...CUPV], [20.8, ...CUPV2], [20.95, ...CUPV2], [21.6, ...PAY], [26.4, ...PAY2], [27.0, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(0.02, 0.27, 1.34), tgt: v3(0.02, 0.165, 0) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
const scr = (p) => { const v = p.clone().project(camera); return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H]; };

// ------------------------------------------------------------------ captions (accepted word-timed groups; English script words aligned to Whisper tokens)
const nrm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9%]/g, "");
function align(line) { const sw = line.script.split(" "), tok = line.words, out = []; let j = 0; for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); } return out; }
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
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

// ------------------------------------------------------------------ per-tub state
function setTub(tb, t, { x, y, z = 0, dress, name = 0, lidOff = 0, sq = 0, visible = true, sc = 1 }) {
  tb.g.visible = visible; tb.g.position.set(x, y, z); tb.g.scale.set(sc * (1 - sq * 0.4), sc * (1 + sq), sc * (1 - sq * 0.4));
  tb.sleeve.visible = visible && dress > 0.001; tb.clipS.constant = y + (SL0 + SLH * dress) * sc * (1 + sq);
  tb.name.visible = visible && name > 0.001 && tb !== tubB; tb.clipN.constant = x + lerp(-0.075, 0.075, name);
  tb.lidM.color.copy(LID_W).lerp(LID_M, dress);
  // lid: sits on the tub; on "backed" it pops up, tips back and hops off stage left
  const lu = lidOff, lx = x + lerp(0, -0.3, E.inOut(lu)), ly = y + (TUB_H - 0.004) * sc * (1 + sq) + 0.13 * Math.sin(Math.PI * Math.min(1, lu * 1.1)) - (lu > 0.85 ? (lu - 0.85) * 0.9 : 0);
  tb.lid.visible = visible && lu < 1; tb.lid.position.set(lx, Math.max(ly, 0), z + lerp(0, 0.03, lu)); tb.lid.rotation.set(-0.5 * Math.sin(Math.PI * lu), 0, 1.4 * E.inOut(lu)); tb.lid.scale.set(sc * (1 - sq * 0.4), sc * (1 + sq), sc * (1 - sq * 0.4));
  placeShadow(tb.sh, x, z, Math.max(0, y - 0.07), 0.1, 0.1, visible ? 1 : 0); placeShadow(tb.lidSh, lx, z, Math.max(0, ly - y - TUB_H), 0.09, 0.09, visible && lu > 0.02 && lu < 1 ? 0.6 : 0);
}

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  // --- hook: tub B (right) dressed on "New perception"; it rides its plinth off stage right at the swap
  const sw = ramp(t, ...T.swap, E.inOut), liftB = ramp(t, ...T.lift, E.out), dressB = ramp(t, ...T.dress, E.inOut);
  const bx = 0.12 + 0.95 * sw, by = PL_H * liftB + drop(t, T.dropR, 0.35), plBy = -PL_H + PL_H * liftB;
  const sqB = squash(t, T.dropR[1], -0.2) + squash(t, T.lift[1], -0.08) + 0.06 * pulse(t, T.one, 0.32);
  setTub(tubB, t, { x: bx, y: by, dress: dressB, sq: sqB, visible: t > T.dropR[0] && sw < 1 });
  plB.visible = liftB > 0 && sw < 1; plB.position.set(bx, plBy + PL_H / 2, 0);
  // --- tub A (left → centre): plain through the hook; dressed + plinth + name in the build-up; scoop; payoff; sinks for the CTA
  const ax = lerp(-0.12, 0, sw), liftA = ramp(t, ...T.lift2, E.out), dressA = ramp(t, ...T.dress2, E.inOut), nameA = ramp(t, ...T.name, E.inOut);
  const ay = PL_H * liftA + drop(t, T.dropL, 0.35) - 0.0 * cl, sqA = squash(t, T.dropL[1], -0.2) + squash(t, T.lift2[1], -0.08) + 0.05 * pulse(t, T.band, 0.3);
  const lidU = ramp(t, ...T.lidOff, E.lin), aVis = t > T.dropL[0] && cl < 1;
  setTub(tubA, t, { x: ax - 0.7 * cl, y: ay, dress: dressA, name: nameA, lidOff: lidU, sq: sqA, visible: aVis });
  plA.visible = liftA > 0 && cl < 1; plA.position.set(ax - 0.7 * cl, -PL_H + PL_H * liftA + PL_H / 2, 0);
  // "=" between the identical tubs
  const eqS = pop(t, T.eq, 0.3) * (1 - ramp(t, ...T.eqOut, E.in)); eqG.visible = eqS > 0.01; eqG.scale.setScalar(Math.max(0.001, eqS)); eqG.position.set(0, 0.085, 0.03);
  // scoop rises out of the open tub on "rich", settles; takes the bite
  { const su = ramp(t, ...T.scoop, E.out), top = ay + TUB_H, bit = t >= T.bite ? 0.93 : 1, sq = squash(t, T.scoop[1], -0.16) + squash(t, T.bite, -0.1);
    scoop.visible = aVis && t > T.scoop[0]; scoop.position.set(ax - 0.7 * cl, top - 0.075 + 0.105 * su, 0); scoop.scale.set(bit * (1 - sq * 0.4), bit * (1 + sq), bit * (1 - sq * 0.4)); scoop.rotation.y = 0.4; }
  // aura behind the dressed tub on "shapes expectations"
  { const a = ramp(t, ...T.aura, E.out) * (1 - cl), s = 0.5 * E.outBack(clamp((t - T.aura[0]) / 0.7)); aura.visible = a > 0.01; aura.material.opacity = 0.75 * a * (0.92 + 0.08 * Math.sin(t * 2.2)); aura.scale.set(s, s, 1); aura.position.set(ax - 0.7 * cl, ay + 0.13, -0.09); }
  // spoon: arrives before the bite, dips on "bite", lifts the bite, presents it on "then deliver it"
  { const top = ay + TUB_H + 0.06, A0 = [0.42, 0.34, 0.32], A1 = [ax + 0.012, top + 0.006, 0.02], A2 = [ax + 0.115, top - 0.035, 0.11];
    const ui = ramp(t, ...T.spoonIn, E.out), dip = 0.012 * pulse(t, T.bite - 0.08, 0.22), uu = ramp(t, ...T.spoonUp, E.inOut), pr = pulse(t, T.present[0], T.present[1] - T.present[0]), out = ramp(t, ...T.ctaClear, E.in);
    let p = A0.map((v, k) => lerp(v, A1[k], ui)); p = p.map((v, k) => lerp(v, A2[k], uu)); p[1] -= dip; p[0] -= 0.7 * out; p[2] += 0.02 * pr;
    spoon.visible = t > T.spoonIn[0] && out < 1; spoon.position.set(...p); spoon.rotation.set(-0.35 + 0.25 * uu - 0.2 * pr, -0.75 + 0.2 * uu, 0.1); spoon.scale.setScalar(1 + 0.12 * pr);
    spoon.userData.bite.visible = t >= T.bite; }
  // --- the proof set: cups hop on their names; "≈"; equal columns; brand sleeve on one cup; columns shift
  const liftC = ramp(t, ...T.shift, E.out); plC.visible = liftC > 0.001 && t < 22.5; plC.position.set(CUPX[1], -0.06 + 0.06 * liftC + 0.03, 0);
  cups.forEach((c, i) => { const h = i ? T.hopPepsi : T.hopCoke, hu = clamp((t - h) / 0.34), hy = 0.05 * Math.sin(Math.PI * hu) + (i ? 0.06 * liftC : 0), sq = squash(t, h + 0.34, -0.12) + (i ? squash(t, T.wrap[1], -0.06) + squash(t, T.shift[1], -0.08) : 0);
    c.g.position.y = hy; c.g.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4); c.g.visible = t > 11.5 && t < 22.5; placeShadow(c.sh, CUPX[i], 0, hy, 0.075, 0.075, c.g.visible ? 1 : 0);
    if (c.sleeve) { const w = ramp(t, ...T.wrap, E.inOut); c.sleeve.visible = w > 0.001; c.clip.constant = hy + (0.045 + 0.105 * w) * (1 + sq); } });
  { const s = pop(t, T.approx[0], 0.3) * (1 - ramp(t, T.approx[1] - 0.2, T.approx[1], E.in)); approx.visible = s > 0.01; approx.scale.setScalar(Math.max(0.001, s)); approx.position.set(X2, 0.095, 0.04); }
  // --- lights: hero spot on the dressed tub (B in the hook, A from "luxury"), cup spot on the branded cup
  { const onB = ramp(t, ...T.spot, E.out) * (1 - ramp(t, T.swap[0], T.swap[0] + 0.4, E.in)), onA = ramp(t, ...T.spot2, E.out) * (1 - cl), tx = onB > 0.001 && t < T.swap[1] ? bx : ax, ty = onB > 0.001 && t < T.swap[1] ? by : ay;
    hero.intensity = 12 * Math.max(onB, onA) + 4 * ramp(t, ...T.aura, E.out) * (1 - cl); hero.position.set(tx + 0.15, ty + 1.25, 0.55); hero.target.position.set(tx, ty + 0.05, 0); hero.target.updateMatrixWorld();
    heroC.intensity = 14 * ramp(t, T.shift[0], T.shift[1] + 0.2, E.inOut); heroC.position.set(CUPX[1] + 0.12, 1.3, 0.55); heroC.target.position.set(CUPX[1], 0.1, 0); heroC.target.updateMatrixWorld();
    // the plain tub stays in flat light: the key dims a touch on it as the spotlight takes the dressed one (hook only)
    key_.intensity = 11 - 2 * ramp(t, ...T.spot, E.out) * (1 - sw); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.14, 0, tu * tu) : 0; // short drop: the tile never crosses the caption band
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: one big brief label at a time
  const qa = scr(v3(bx, by + 0.36, 0)); hudAt($("lQ"), [qa[0], Math.max(640, qa[1])], THUMB ? 0 : win(t, ...T.q, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  hudAt($("l1960"), [540, 660], THUMB ? 0 : win(t, ...T.y1960, 0.2, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.y1960[0], 0.3)));
  hudAt($("lSig"), [540, 632], THUMB ? 0 : win(t, ...T.signal, 0.18, 0.12), 0.85 + 0.15 * Math.min(1, pop(t, T.signal[0], 0.3)));
  hudAt($("lDel"), [540, 632], THUMB ? 0 : win(t, ...T.deliver, 0.18, 0.2), 0.85 + 0.15 * Math.min(1, pop(t, T.deliver[0], 0.3)));
  const wd = THUMB ? 0 : ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = THUMB ? 0 : ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

if (THUMB) { $("thumb").style.display = "block"; // both headline lines share one size that fits inside x 100–980
  const ls = [...document.querySelectorAll("#thumb .t")]; let fs = 150; const wide = () => Math.max(...ls.map((e) => e.getBoundingClientRect().width));
  while (wide() > 880 && fs > 60) { fs -= 2; for (const e of ls) { e.style.fontSize = fs + "px"; e.style.lineHeight = fs + "px"; } }
  $("th2").style.top = 300 + fs * 1.12 + "px"; }
window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".big, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
frame(+(Q.get("t") || 0));
window.__ready = true;
