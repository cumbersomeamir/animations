// Werbens · 30 s English-10 — "Learn more... about what?" (make the next action specific: a button label that says what
// happens next), in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment/CTA as
// feedback-05 and english-06…09). Procedural 3D hero objects on a clean light sweep, soft contact shadows, tactile timed
// changes. Colours/logo from app.werbens.com (context/17).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "Learn more See the 3 plans FICTIONAL MEAL KIT · Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked for this batch); C3 = lit 3D bases pre-compensated (ACES)
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
const fitText = (k, txt, font, maxW, px) => { let s = px; k.font = `${s}px ${font}`; while (k.measureText(txt).width > maxW && s > 10) { s -= 2; k.font = `${s}px ${font}`; } };
// a flat label face (plane) with centred text
function labelPlane(w, h, txt, bg, fg, font = "IDBK", scale = 0.5, radius = 0.25) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(Math.round(w * 2400), Math.round(h * 2400), (k, cw, ch) => {
  k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, Math.min(cw, ch) * radius); k.fill(); k.fillStyle = fg; fitText(k, txt, font, cw * 0.86, Math.round(ch * scale)); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.54); }) })); }

// ------------------------------------------------------------------ two doors under a fictional sign
const DW = 0.36, DH = 0.7, FB = 0.035, DX = 0.25;
const set = new THREE.Group(); scene.add(set); const setSh = contactShadow();
function makeDoor(x, interior) {
  const g = new THREE.Group(); g.position.x = x; set.add(g);
  const fm = mat(C3.teal, { roughness: 0.3 });
  for (const [px, py, w, h] of [[-(DW + FB) / 2, DH / 2, FB, DH + FB], [(DW + FB) / 2, DH / 2, FB, DH + FB], [0, DH + FB / 2, DW + 2 * FB, FB]]) { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.07, 2, 0.01), fm); b.position.set(px, py, 0); b.castShadow = true; b.receiveShadow = true; g.add(b); }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), interior); wall.position.set(0, DH / 2, -0.12); g.add(wall);
  for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(0.12, DH), new THREE.MeshStandardMaterial({ color: "#DDE8E6", roughness: 0.9 })); side.rotation.y = sx * Math.PI / 2; side.position.set(sx * DW / 2, DH / 2, -0.06); g.add(side); }
  const hinge = new THREE.Group(); hinge.position.set(-DW / 2, 0, 0.012); g.add(hinge);
  const leaf = new THREE.Mesh(new RoundedBoxGeometry(DW - 0.006, DH - 0.006, 0.03, 3, 0.01), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.3 })); leaf.position.set(DW / 2, DH / 2, 0); leaf.castShadow = true; leaf.receiveShadow = true; hinge.add(leaf);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), mat(C3.navy, { roughness: 0.3 })); knob.position.set(DW - 0.05, DH * 0.45, 0.025); hinge.add(knob);
  for (const py of [0.26, 0.6]) { const panel = new THREE.Mesh(new RoundedBoxGeometry(DW - 0.09, 0.22, 0.008, 2, 0.006), mat("#F3F8F7", { roughness: 0.5 })); panel.position.set(DW / 2, py, 0.017); hinge.add(panel); }
  return { g, hinge, x };
}
const fogTex = canvasTex(360, 800, (k, w, h) => { const g = k.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, h * 0.6); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#C9D6D4"); k.fillStyle = g; k.fillRect(0, 0, w, h);
  k.fillStyle = "rgba(100,116,139,0.85)"; k.font = "300px IDXB"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("?", w / 2, h * 0.48); });
const doorA = makeDoor(-DX, new THREE.MeshBasicMaterial({ map: fogTex, toneMapped: false })), doorB = makeDoor(DX, new THREE.MeshStandardMaterial({ color: "#E3F7F3", roughness: 0.8 }));
const sign = new THREE.Group(); set.add(sign);
{ const b = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.12, 0.03, 2, 0.012), mat(C3.navy, { roughness: 0.4 })); b.castShadow = true; sign.add(b); const f = labelPlane(0.95, 0.105, "FICTIONAL MEAL KIT", C.ink, C.mint, "IDBK", 0.55, 0.3); f.position.z = 0.016; sign.add(f); }
const SIGN_Y = DH + 0.105;
// the three plan cards (behind door B; they slide out when it opens)
const PLANS = ["2 PEOPLE", "4 PEOPLE", "FAMILY"];
function planCard(txt, s = 1) { const g = new THREE.Group(); const b = new THREE.Mesh(new RoundedBoxGeometry(0.1 * s, 0.14 * s, 0.008, 2, 0.004), mat("#FFFFFF", { roughness: 0.45 })); b.castShadow = true; g.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.096 * s, 0.136 * s), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(240, 340, (k, w, h) => { k.fillStyle = "#FFFFFF"; k.beginPath(); k.roundRect(0, 0, w, h, 24); k.fill(); k.fillStyle = C.mint; k.beginPath(); k.roundRect(0, 0, w, h * 0.32, [24, 24, 0, 0]); k.fill();
    k.fillStyle = C.ink; fitText(k, "PLAN", "IDBK", w * 0.8, 52); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("PLAN", w / 2, h * 0.17); fitText(k, txt, "IDBK", w * 0.86, 44); k.fillText(txt, w / 2, h * 0.52);
    k.fillStyle = "rgba(15,23,42,0.18)"; for (let i = 0; i < 3; i++) { k.beginPath(); k.roundRect(w * 0.18, h * (0.68 + i * 0.09), w * (0.64 - i * 0.12), h * 0.04, 6); k.fill(); } }) })); f.position.z = 0.0045; g.add(f); return g; }
const plans = PLANS.map((p) => { const c = planCard(p, 1.15); scene.add(c); return c; });
const previews = PLANS.map((p) => { const c = planCard(p, 0.85); scene.add(c); return c; });

// ------------------------------------------------------------------ the two buttons on pedestals
function makeButton(x, txt, w) { const g = new THREE.Group(); scene.add(g);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.3, 32), mat("#FFFFFF", { roughness: 0.45 })); post.position.y = 0.15; post.castShadow = true; post.receiveShadow = true; g.add(post);
  const top = new THREE.Group(); top.position.y = 0.31; top.rotation.x = 0.65; g.add(top);
  const base = new THREE.Mesh(new RoundedBoxGeometry(w + 0.04, 0.018, 0.13, 2, 0.008), mat(C3.navy, { roughness: 0.4 })); base.castShadow = true; top.add(base);
  const cap = new THREE.Group(); top.add(cap);
  const capM = mat(C3.teal, { roughness: 0.28, emissive: new THREE.Color(C.mint), emissiveIntensity: 0 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, 0.03, 0.1, 3, 0.012), capM); body.position.y = 0.02; body.castShadow = true; cap.add(body);
  const face = labelPlane(w - 0.012, 0.088, txt, C.teal, "#FFFFFF", "IDBK", 0.42, 0.3); face.rotation.x = -Math.PI / 2; face.position.y = 0.0355; cap.add(face);
  const sh = contactShadow(); return { g, cap, capM, face, x, sh };
}
const BZ = 0.45;
const btnA = makeButton(-DX, "Learn more", 0.3), btnB = makeButton(DX, "See the 3 plans", 0.3);
const faceFix = labelPlane(0.288, 0.088, "Compare 3 plans", C.teal, "#FFFFFF", "IDBK", 0.42, 0.3); faceFix.rotation.x = -Math.PI / 2; faceFix.position.y = 0.0356; btnA.cap.add(faceFix);
// the "?" cloud over door A
const cloud = new THREE.Group(); scene.add(cloud);
{ const m = mat("#FFFFFF", { roughness: 0.6, clearcoat: 0.2 }); for (const [x, y, r] of [[-0.07, 0, 0.055], [0, 0.025, 0.07], [0.075, 0, 0.055], [-0.03, -0.03, 0.05], [0.04, -0.03, 0.05]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); s.position.set(x, y, 0); s.castShadow = true; cloud.add(s); }
  const q = labelPlane(0.08, 0.1, "?", "rgba(0,0,0,0)", C.slate, "IDXB", 0.9, 0); q.position.set(0.004, 0.004, 0.072); cloud.add(q); }
const CLOUD_POS = [-DX, 0.52, 0.24];

// ------------------------------------------------------------------ "Links on this page" list (accessibility link list)
const list = new THREE.Group(); scene.add(list); const listSh = contactShadow();
const LIST_W = 0.62, LIST_H = 0.46;
{ const b = new THREE.Mesh(new RoundedBoxGeometry(LIST_W, LIST_H, 0.02, 3, 0.012), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.4 })); b.castShadow = true; list.add(b);
  const head = labelPlane(LIST_W - 0.02, 0.09, "LINKS ON THIS PAGE", C.ink, C.mint, "IDBK", 0.42, 0.2); head.position.set(0, LIST_H / 2 - 0.06, 0.011); list.add(head);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.36, 20), mat(C3.navy, { roughness: 0.4 })); st.position.y = -LIST_H / 2 - 0.12; list.add(st); st.scale.y = 0.7; }
const ROW_TXT = ["See the 3 plans", "Book a 15-minute call", "Read the delivery FAQ"];
const rowsL = ROW_TXT.map((txt, i) => { const g = new THREE.Group(); list.add(g); const y = LIST_H / 2 - 0.165 - i * 0.105;
  const front = labelPlane(LIST_W - 0.08, 0.08, "Learn more", "#EEF4F3", C.slate, "IB", 0.48, 0.25); front.position.z = 0.002; g.add(front);
  const back = labelPlane(LIST_W - 0.08, 0.08, txt, C.mint, C.ink, "IDBK", 0.46, 0.25); back.rotation.x = Math.PI; back.position.z = -0.002; g.add(back);
  g.userData.y = y; return g; });
const LIST_Z = 0.72, LIST_Y = 0.47;

// ------------------------------------------------------------------ formula tiles: VERB + WHAT THEY'LL GET, and two examples
function tile(txt, w, bg, fg) { const g = new THREE.Group(); scene.add(g); const b = new THREE.Mesh(new RoundedBoxGeometry(w, 0.1, 0.05, 3, 0.016), mat(bg === C.mint ? C3.mint : "#FFFFFF", { roughness: 0.35 })); b.castShadow = true; g.add(b);
  const f = labelPlane(w - 0.012, 0.088, txt, bg, fg, "IDBK", 0.44, 0.28); f.position.z = 0.0255; g.add(f); g.userData.w = w; return g; }
const FORM = [
  [tile("VERB", 0.2, C.mint, C.ink), tile("WHAT THEY'LL GET", 0.42, "#FFFFFF", C.ink), T.f1, 0.62],
  [tile("Compare", 0.24, C.mint, C.ink), tile("3 plans", 0.24, "#FFFFFF", C.ink), T.f2, 0.46],
  [tile("Book", 0.2, C.mint, C.ink), tile("a 15-minute call", 0.38, "#FFFFFF", C.ink), T.f3, 0.3],
];
const plus = labelPlane(0.06, 0.06, "+", "rgba(0,0,0,0)", C.teal, "IDXB", 0.9, 0); scene.add(plus);
const FORM_Z = 0.72;

// ------------------------------------------------------------------ CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped)
const tileCTA = new THREE.Group(); scene.add(tileCTA); const tileSh = contactShadow();
const LW = 0.94, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.04, LH + 0.04, 0.12, 5, 0.03), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.04) / 2; slab.castShadow = true; tileCTA.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.04) / 2, 0.0605); tileCTA.add(face); }

// ------------------------------------------------------------------ motion helpers
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
const press = (t, t0) => (t < t0 - 0.12 ? 0 : t < t0 ? ramp(t, t0 - 0.12, t0, E.in) : 1 - ramp(t, t0 + 0.05, t0 + 0.3, E.out));

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0, 0.72, 2.85], [0, 0.48, 0.15]], NEAR = [[0, 0.62, 2.62], [0, 0.45, 0.65]];
const CAMS = [
  [0.0, [-DX, 0.58, 1.85], [-DX, 0.42, 0.15]], [1.75, [-DX, 0.56, 1.75], [-DX, 0.42, 0.15]], [2.9, ...FRONT], [9.9, ...FRONT], [10.6, ...NEAR], [22.6, ...NEAR],
  [23.3, ...FRONT], [25.0, ...FRONT], [26.0, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in), bk = -1.3 * (ramp(t, 10.0, 10.6, E.inOut) - ramp(t, 22.7, 23.3, E.inOut));
  // --- doors + sign (the whole doors set steps back while the link list and the formula are in front)
  set.position.set(-2.9 * cl, 0, bk); set.visible = cl < 1; placeShadow(setSh, -2.9 * cl, bk, 0, 0.6, 0.15, set.visible ? 0.6 : 0);
  doorA.hinge.rotation.y = -1.25 * ramp(t, ...T.openA, E.out) * (1 - ramp(t, ...T.closeA, E.inOut)) + 0.04 * wobble(t, T.closeA[1], 1, 8, 7);
  doorB.hinge.rotation.y = -1.35 * ramp(t, ...T.openB, E.out);
  slam(sign, t, T.sign, 0, SIGN_Y, 0.04);
  { const away = ramp(t, 10.0, 10.35, E.in) * (1 - ramp(t, 22.95, 23.3, E.out)); sign.scale.multiplyScalar(Math.max(0.001, 1 - away)); sign.visible = sign.visible && away < 0.999; }
  // --- buttons: press + pulses; A's label flips to the specific one on "No guessing"
  for (const [b, tp, pl, say] of [[btnA, T.pressA, T.pulseA, T.sayA], [btnB, T.pressB, T.pulseB, T.sayB]]) {
    const x = b.x + (b === btnA ? -1 : 1) * 2.6 * cl; b.g.position.set(x, 0, BZ + bk); b.g.visible = cl < 1; placeShadow(b.sh, x, BZ + bk, 0, 0.09, 0.09, b.g.visible ? 1 : 0);
    b.cap.position.y = -0.016 * press(t, tp); b.capM.emissiveIntensity = 0.4 * pulse(t, pl, 0.4) + 0.5 * pulse(t, say, 0.5) + (b === btnB ? 0.5 * pulse(t, T.preview, 0.5) : 0.5 * pulse(t, T.fixA + 0.2, 0.5));
    b.cap.scale.setScalar(1 + 0.05 * pulse(t, pl, 0.35) + 0.04 * pulse(t, say, 0.4)); }
  { const fl = ramp(t, T.fixA, T.fixA + 0.35, E.inOut); btnA.face.rotation.set(-Math.PI / 2 + Math.PI * fl, 0, 0); faceFix.rotation.set(-Math.PI / 2 - Math.PI * (1 - fl), 0, 0); btnA.face.visible = fl < 0.5; faceFix.visible = fl >= 0.5; }
  // --- the "?" cloud over door A: pops in on "hides", pops away on "what comes next"
  { const ci = pop(t, T.cloud, 0.35), po = ramp(t, T.pop, T.pop + 0.25, E.in); cloud.visible = t >= T.cloud && po < 1 && cl < 1;
    cloud.position.set(CLOUD_POS[0] - 2.9 * cl, CLOUD_POS[1] + 0.01 * Math.sin(Math.PI * clamp((t - T.cloud) / 6)), CLOUD_POS[2] + bk); cloud.scale.setScalar(Math.max(0.001, ci) * (1 + 0.6 * po) * (1 + 0.1 * pulse(t, T.sayA + 0.4, 0.5))); cloud.children.forEach((c) => { if (c.material) { c.material.transparent = true; c.material.opacity = 1 - po; } }); }
  // --- plan cards: small previews pop over B on "says it"; on "tap" door B opens and the full cards slide out
  previews.forEach((c, i) => { const s = pop(t, T.preview + i * 0.08, 0.3) * (1 - ramp(t, T.cardsOut[0], T.cardsOut[0] + 0.3, E.in)); c.visible = s > 0.01 && cl < 1; c.position.set(DX + (i - 1) * 0.1, 0.52 + (i === 1 ? 0.025 : 0), 0.24); c.rotation.z = (1 - i) * 0.12; c.scale.setScalar(Math.max(0.001, s)); });
  plans.forEach((c, i) => { const u = ramp(t, T.cardsOut[0] + i * 0.08, T.cardsOut[1] + i * 0.08, E.outBack);
    c.visible = t >= T.openB[0] && cl < 1; const x = DX + (i - 1) * 0.12 * u + 2.6 * cl, y = 0.3 + 0.05 * u + (i === 1 ? 0.02 * u : 0), z = lerp(-0.08, 0.2, u);
    c.position.set(x, y, z + bk); c.rotation.set(0, -0.15 * (i - 1) * u, (1 - i) * 0.1 * u); });
  // --- link list: slides in; three identical "Learn more" rows; rows flip to specific text; slides out
  { const li = ramp(t, ...T.list, E.out), lo = ramp(t, ...T.listOut, E.in); list.visible = t >= T.list[0] && lo < 1; list.position.set(lerp(-1.6, 0, li) - 1.6 * lo, LIST_Y, LIST_Z); list.rotation.y = 0.25 * (1 - li);
    placeShadow(listSh, list.position.x, LIST_Z, LIST_Y - 0.4, 0.3, 0.1, list.visible ? 0.7 : 0);
    rowsL.forEach((g, i) => { const s = pop(t, T.rows[i], 0.25), f = ramp(t, T.flips[i], T.flips[i] + 0.35, E.inOut); g.visible = t >= T.rows[i]; g.position.set(0, g.userData.y, 0.012); g.scale.setScalar(Math.max(0.001, s) * (1 + 0.06 * pulse(t, T.flips[i] + 0.3, 0.3))); g.rotation.x = Math.PI * f; }); }
  // --- formula tiles: each pair slides together and snaps
  { const fo = ramp(t, ...T.formOut, E.in); let plusVis = false;
    FORM.forEach(([a, b, [ta, tb], y]) => { const gap = 0.07, wa = a.userData.w, wb = b.userData.w, tot = wa + wb + gap, xa = -tot / 2 + wa / 2, xb = tot / 2 - wb / 2;
      const ua = ramp(t, ta, ta + 0.25, E.out), ub = ramp(t, tb, tb + 0.25, E.out), sq = squash(t, tb + 0.25, -0.1);
      a.visible = t >= ta && fo < 1; b.visible = t >= tb && fo < 1; a.position.set(lerp(-1.4, xa, ua) - 1.6 * fo, y, FORM_Z); b.position.set(lerp(1.4, xb, ub) + 1.6 * fo, y, FORM_Z);
      a.scale.set(1 + sq, 1 - sq, 1); b.scale.set(1 + sq, 1 - sq, 1); if (y === FORM[0][3]) { plusVis = t >= tb + 0.1 && fo < 1; plus.position.set((xa + wa / 2 + xb - wb / 2) / 2, y, FORM_Z + 0.03); plus.scale.setScalar(Math.max(0.001, pop(t, tb + 0.1, 0.25))); } });
    plus.visible = plusVis; }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tileCTA.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("nQ"), [540, 900], 0);
  hudAt($("cite"), [540, 562], win(t, ...T.cite, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite[0], 0.3)));
  $("ov").innerHTML = "";
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}
function slam(g, t, t0, x, y, z, rz = 0, s0 = 1.3, dz = 0.3) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); g.visible = t >= t0; const sc = lerp(s0, 1, u) * (1 + sq); g.scale.set(sc, sc, 1); g.position.set(x, y, z + lerp(dz, 0, u)); g.rotation.set(0, 0, rz); }

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".note, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
