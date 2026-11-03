// Werbens · 30 s round-02 #01 — "One shape, everywhere" (distinctive brand assets) in the accepted
// 'Satisfying Product Theatre' style: procedural 3D hero objects on a clean light studio sweep, soft contact shadows,
// tactile timed shape/scale changes. Brand colours corrected from official sources (context/15).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { ITEMS, NAME, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "50px IDBlack", "30px ISB", "30px IB", "700 76px Fahkwang"].map((f) => document.fonts.load(f)));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens (measured; context/15). Fictional-brand shapes in the contrast scene use neutral brand greys/ink.
const C = { primary: "#573EEC", light: "#AEA2F4", bg: "#F7F8FA", line: "#E4E7EB", ink: "#101114", grey: "#8C93A1", icon: "#6435FC" };
// 3D base colours pre-compensated so lit, camera-facing surfaces render at the brand tokens under the accepted ACES renderer
// (calibrated from stills: plain #573EEC rendered as #8758EB). Flat HUD/CSS colours use C directly.
const C3 = { primary: "#362AEC", light: "#8E80F0", floor: "#FDFDFE", grey: "#6E7584", ink: "#101114" };

// ------------------------------------------------------------------ renderer + studio (accepted setup)
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 80);
{ // seamless sweep: flat floor curving into a backdrop (app background neutral)
  const g = new THREE.PlaneGeometry(40, 30, 1, 120); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < -2.5) { const d = -2.5 - z; p.setY(i, d * d * 0.32); p.setZ(i, -2.5 - d * 0.75); } }
  g.computeVertexNormals();
  const floor = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: C3.floor, roughness: 0.88, metalness: 0 }));
  floor.receiveShadow = true; scene.add(floor);
}
scene.add(new THREE.HemisphereLight("#FFFFFF", "#D8DCE3", 1.15));
const key_ = new THREE.DirectionalLight("#FFFFFF", 2.4); key_.position.set(-3.2, 7.5, 5.2); key_.castShadow = true;
Object.assign(key_.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 20 });
key_.shadow.mapSize.set(2048, 2048); key_.shadow.radius = 6; key_.shadow.bias = -0.0004; key_.shadow.normalBias = 0.02; scene.add(key_);
const rim = new THREE.DirectionalLight("#E8EAF6", 0.9); rim.position.set(2.5, 4, -6); scene.add(rim);

// ------------------------------------------------------------------ shapes (origin = bottom centre, height ≈ 0.57)
function archShape() { const r = 0.25, hs = 0.32, s = new THREE.Shape(); s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, hs); s.absarc(0, hs, r, 0, Math.PI, false); s.lineTo(-r, 0); return s; }
function starShape() { const s = new THREE.Shape(), cy = 0.29; for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.13 : 0.3; const x = Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? s.lineTo(x, y) : s.moveTo(x, y); } return s; }
function circleShape() { const s = new THREE.Shape(); s.absarc(0, 0.285, 0.27, 0, Math.PI * 2, false); return s; }
function triShape() { const s = new THREE.Shape(); s.moveTo(-0.29, 0.02); s.lineTo(0.29, 0.02); s.lineTo(0, 0.56); s.lineTo(-0.29, 0.02); return s; }
const SHAPES = { arch: archShape(), star: starShape(), circle: circleShape(), tri: triShape() };
const extrude = (sh, depth, bevel) => { const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: 4, curveSegments: 48 }); g.translate(0, 0, -depth / 2); return g; };
const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, ...o });
const PRINT_G = Object.fromEntries(Object.entries(SHAPES).map(([k, s]) => [k, extrude(s, 0.014, 0.004)]));
const PRINT_M = { arch: mat(C3.primary, { roughness: 0.45, clearcoat: 0.4 }), star: mat(C3.light, { roughness: 0.45, clearcoat: 0.4 }), circle: mat(C3.grey, { roughness: 0.45, clearcoat: 0.4 }), tri: mat(C3.ink, { roughness: 0.45, clearcoat: 0.4 }) };
const HERO_G = extrude(SHAPES.arch, 0.12, 0.022);

// soft radial contact-shadow decal (tightens and darkens as the object approaches the ground)
const SHADOW_TEX = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(16,17,20,0.95)"); grd.addColorStop(0.45, "rgba(16,17,20,0.5)"); grd.addColorStop(1, "rgba(16,17,20,0)"); g.fillStyle = grd; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(cv); })();
function contactShadow() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0.6 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.renderOrder = 1; scene.add(m); return m; }
function placeShadow(sh, x, z, h, rx, rz = rx, op = 1) { const s = 1 + h * 0.9; sh.position.set(x, 0.003, z); sh.scale.set(rx * 2.7 * s, rz * 2.7 * s, 1); sh.material.opacity = (op * 0.62) / (1 + h * 2.4); sh.visible = op > 0.01; }

// name label texture (fictional brand word, ink on white)
const nameTex = (() => { const cv = document.createElement("canvas"); cv.width = 512; cv.height = 128; const g = cv.getContext("2d"); g.fillStyle = "#FFFFFF"; g.fillRect(0, 0, 512, 128); g.fillStyle = C.ink; g.font = "92px IDBlack"; g.textAlign = "center"; g.textBaseline = "middle"; g.letterSpacing = "10px"; g.fillText(NAME, 262, 70); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
const nameMat = new THREE.MeshStandardMaterial({ map: nameTex, roughness: 0.8 });
const white = (r = 0.75) => new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", roughness: r, clearcoat: 0.15 });
const coverMat = new THREE.MeshPhysicalMaterial({ color: C.grey, roughness: 0.55, clearcoat: 0.3 });

// ------------------------------------------------------------------ touchpoints (fictional bakery): logo tile, bag, sign
// each item: group (drops), face anchor (print position), print group (swap/flip), name plane, cover
function makeItem(kind) {
  const g = new THREE.Group(); scene.add(g); const it = { kind, g, sh: contactShadow() };
  let face; // { x, y, z, scale, nameX, nameY, nameW, nameH }
  if (kind === "logo") {
    const base = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.1, 0.24, 3, 0.03), new THREE.MeshPhysicalMaterial({ color: C.line, roughness: 0.6 })); base.position.y = 0.05; base.castShadow = true; g.add(base);
    const tile = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.08, 4, 0.06), white(0.5)); tile.position.y = 0.41; tile.castShadow = true; tile.receiveShadow = true; g.add(tile);
    face = { x: 0, y: 0.26, z: 0.041, scale: 0.6, nameX: 0, nameY: 0.18, nameW: 0.5, nameH: 0.125 };
    it.rx = 0.33; it.rz = 0.16; it.h = 0.72;
  } else if (kind === "bag") {
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.74, 0.32, 3, 0.015), white(0.85)); body.position.y = 0.37; body.castShadow = true; body.receiveShadow = true; g.add(body);
    const fold = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.05, 0.322, 2, 0.01), new THREE.MeshPhysicalMaterial({ color: "#EEF0F3", roughness: 0.85 })); fold.position.y = 0.69; g.add(fold);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 10, 40, Math.PI), new THREE.MeshPhysicalMaterial({ color: C.ink, roughness: 0.5 })); handle.position.set(0, 0.74, 0); handle.castShadow = true; g.add(handle);
    face = { x: 0, y: 0.28, z: 0.161, scale: 0.68, nameX: 0, nameY: 0.15, nameW: 0.5, nameH: 0.125 };
    it.rx = 0.32; it.rz = 0.19; it.h = 0.74;
  } else {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.035, 40), new THREE.MeshPhysicalMaterial({ color: C.line, roughness: 0.6 })); base.position.y = 0.0175; base.castShadow = true; g.add(base);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.8, 16), new THREE.MeshPhysicalMaterial({ color: C.ink, roughness: 0.45 })); post.position.y = 0.4; post.castShadow = true; g.add(post);
    const board = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.46, 0.05, 4, 0.04), white(0.5)); board.position.y = 1.0; board.castShadow = true; board.receiveShadow = true; g.add(board);
    face = { x: -0.18, y: 0.84, z: 0.026, scale: 0.52, nameX: 0.15, nameY: 1.0, nameW: 0.32, nameH: 0.08 };
    it.rx = 0.17; it.rz = 0.17; it.h = 1.23;
  }
  it.face = face;
  const print = new THREE.Group(); print.position.set(face.x, face.y, face.z + 0.008); g.add(print); it.print = print;
  it.prints = {}; for (const k of Object.keys(SHAPES)) { const m = new THREE.Mesh(PRINT_G[k], PRINT_M[k]); m.scale.setScalar(face.scale); m.visible = false; print.add(m); it.prints[k] = m; }
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(face.nameW, face.nameH), nameMat); nm.position.set(face.nameX, face.nameY, face.z + 0.002); g.add(nm);
  const cover = new THREE.Mesh(new RoundedBoxGeometry(face.nameW + 0.05, face.nameH + 0.04, 0.012, 2, 0.006), coverMat); cover.castShadow = true; g.add(cover); it.cover = cover;
  return it;
}
const items = { logo: makeItem("logo"), bag: makeItem("bag"), sign: makeItem("sign") };
const printTarget = (k, xs) => { const f = items[k].face; return new THREE.Vector3(xs + f.x, f.y + 0.285 * f.scale, f.z); }; // centre of the printed arch (world, item at y 0)

// hero arch (the asset) + hook copies
const heroMat = mat(C3.primary);
const hero = new THREE.Mesh(HERO_G, heroMat); hero.castShadow = true; scene.add(hero); const heroSh = contactShadow();
const copies = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(HERO_G, heroMat); m.castShadow = true; scene.add(m); return { m, sh: contactShadow() }; });
// CTA tile: official Play icon (unchanged image, rounded-rect face, not tone-mapped) on a slab in the measured icon colour
const tile = new THREE.Group(); scene.add(tile); const tileSh = contactShadow();
{
  const slab = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.12, 6, 0.1), new THREE.MeshPhysicalMaterial({ color: C.icon, roughness: 0.3, clearcoat: 1 })); slab.position.y = 0.31; slab.castShadow = true; tile.add(slab);
  const s = new THREE.Shape(), r = 0.095, w = 0.61; s.moveTo(-w / 2 + r, -w / 2); s.lineTo(w / 2 - r, -w / 2); s.quadraticCurveTo(w / 2, -w / 2, w / 2, -w / 2 + r); s.lineTo(w / 2, w / 2 - r); s.quadraticCurveTo(w / 2, w / 2, w / 2 - r, w / 2); s.lineTo(-w / 2 + r, w / 2); s.quadraticCurveTo(-w / 2, w / 2, -w / 2, w / 2 - r); s.lineTo(-w / 2, -w / 2 + r); s.quadraticCurveTo(-w / 2, -w / 2, -w / 2 + r, -w / 2);
  const fg = new THREE.ShapeGeometry(s, 24), uv = fg.attributes.uv, pos = fg.attributes.position;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / w + 0.5);
  const tex = new THREE.TextureLoader().load("/assets/icon.png"); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const face = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.set(0, 0.31, 0.0605); tile.add(face);
}
// dust ring sprites (impacts)
const dustTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(206,210,220,0.9)"); r.addColorStop(1, "rgba(206,210,220,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const dust = Array.from({ length: 21 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });

// ------------------------------------------------------------------ motion helpers
function dropY(t, t0, t1, y0) { // fast fall → hover-slow just above the floor → snap (near-impact slow motion)
  const u = clamp((t - t0) / (t1 - t0));
  if (u < 0.62) return lerp(y0, 0.16, E.out(u / 0.62));
  if (u < 0.9) return lerp(0.16, 0.06, (u - 0.62) / 0.28);
  return lerp(0.06, 0, ((u - 0.9) / 0.1) ** 2);
}
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };
const lerpV = (a, b, u) => v3(lerp(a.x, b.x, u), lerp(a.y, b.y, u), lerp(a.z, b.z, u));

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const WIDE = [[0, 1.3, 7.2], [0, 0.55, 0]];
const CAMS = [
  [0.0, [0, 1.15, 6.0], [0, 0.42, 0]], [2.6, [0, 1.2, 6.3], [0, 0.45, 0]], [3.4, ...WIDE], [10.9, [0, 1.28, 7.0], [0, 0.55, 0]],
  [11.6, [0, 0.95, 3.75], [0, 0.48, 0]], [15.35, [0, 0.95, 3.6], [0, 0.48, 0]], [16.0, ...WIDE], [19.6, [0, 1.3, 7.1], [0, 0.55, 0]],
  [22.5, [0, 1.3, 7.1], [0, 0.55, 0]], [24.6, [0, 1.25, 6.8], [0, 0.55, 0]], [25.7, [0, 1.25, 6.8], [0, 0.5, 0]], [26.9, [0, 1.1, 5.2], [0, 0.42, 0]], [30, [0, 1.08, 5.0], [0, 0.42, 0]],
];
function cameraAt(t) {
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) };
}

// ------------------------------------------------------------------ captions (accepted word-timed groups)
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9%]/g, "");
function align(line) { const sw = line.script.split(" "), tok = line.words, out = []; let j = 0; for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); } return out; }
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
  if (i !== capShown) {
    cap.innerHTML = "";
    if (i >= 0) { const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill"; const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words]; for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(nrm(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); } cap.appendChild(pill); }
    capShown = i;
  }
  if (i < 0) return;
  const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.4 + 0.6 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 96 + hw, 984 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; }

// ------------------------------------------------------------------ state helpers
const KEYS = ["logo", "bag", "sign"];
// which shape is printed on item k at time t (null = blank), and the flip angle of its print
function printState(k, t) {
  const st = T.stamp[k], sw = T.swap[k], rs = T.restamp[k], ODD = { logo: "star", bag: "circle", sign: "tri" }[k];
  if (t < st) return { shape: null };
  if (k === "bag" && t >= T.lift[0] && t < T.back[1]) return { shape: null }; // lifted off as the 3D asset
  if (t < sw) return { shape: "arch", flip: 0 };
  if (t < sw + T.swapDur) { const u = (t - sw) / T.swapDur; return { shape: u < 0.5 ? "arch" : ODD, flip: Math.PI * E.inOut(u) }; }
  if (t < T.oddOut[0] + KEYS.indexOf(k) * 0.08) return { shape: ODD, flip: Math.PI };
  if (t < rs) { const u = ramp(t, T.oddOut[0] + KEYS.indexOf(k) * 0.08, T.oddOut[0] + KEYS.indexOf(k) * 0.08 + 0.3, E.in); return u < 1 ? { shape: ODD, flip: Math.PI, pop: u } : { shape: null }; }
  return { shape: "arch", flip: 0 };
}
// cover progress for item k (0 = off, 1 = over the name)
function coverAt(k, t) {
  const on1 = ramp(t, T.cover[k], T.cover[k] + T.coverDur, E.out), off1 = k === "bag" ? ramp(t, ...T.peel, E.inOut) : ramp(t, T.back[0], T.back[0] + 0.35, E.inOut);
  const on2 = ramp(t, T.cover2[k], T.cover2[k] + T.coverDur, E.out), off2 = ramp(t, T.reveal[0] + KEYS.indexOf(k) * 0.06, T.reveal[1] + KEYS.indexOf(k) * 0.06, E.inOut);
  return { on: Math.max(on1 * (1 - off1), on2 * (1 - off2)), peeling: (t >= T.peel[0] && k === "bag" && t < T.peel[1] + 0.1) || (t >= T.reveal[0] && t < T.reveal[1] + 0.3) || (t >= T.back[0] && t < T.back[0] + 0.45 && k !== "bag") };
}

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();

  // --- items: drop in, CTA slide-off
  const cl = ramp(t, ...T.ctaClear, E.in);
  const xs = { logo: ITEMS.logo.x - 2.6 * cl, bag: ITEMS.bag.x - 2.6 * ramp(t, T.ctaClear[0] + 0.08, T.ctaClear[1] + 0.08, E.in), sign: ITEMS.sign.x + 2.6 * cl };
  for (const k of KEYS) {
    const it = items[k], [d0, d1] = T.itemDrop[k], y = dropY(t, d0, d1, 3.6), vis = t >= d0 && Math.abs(xs[k]) < 3.2;
    const sq = squash(t, d1, -0.08) + 0.035 * pulse(t, T.stamp[k] - 0.02, 0.22) + 0.03 * pulse(t, T.restamp[k] - 0.02, 0.22);
    it.g.visible = vis; it.g.position.set(xs[k], y, 0); it.g.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
    for (const m of it.g.children) if (m.castShadow !== undefined && m !== it.cover) m.castShadow = y < 0.35;
    placeShadow(it.sh, xs[k], 0, y, it.rx, it.rz, vis ? 1 : 0);
    // print
    const ps = printState(k, t);
    for (const [sk, m] of Object.entries(it.prints)) m.visible = ps.shape === sk;
    const stampPop = Math.max(pop(t, T.stamp[k], 0.28), t >= T.restamp[k] ? pop(t, T.restamp[k], 0.28) : 0);
    const arch = k === "bag" && t >= T.back[1] - 0.02 && t < T.back[1] + 0.3 ? pop(t, T.back[1] - 0.02, 0.3) : 1;
    let ps_sc = (ps.shape === "arch" ? Math.min(1, stampPop) * arch : 1) * (ps.pop !== undefined ? 1 - ps.pop : 1);
    const pulseA = 0.12 * pulse(t, T.archPulse, 0.4) + 0.1 * pulse(t, T.testLines[0], 0.4);
    if (ps.shape === "arch") ps_sc *= 1 + pulseA;
    it.print.scale.setScalar(Math.max(0.001, ps_sc)); it.print.rotation.y = ps.flip || 0;
    if (ps.pop !== undefined) { it.print.position.z = it.face.z + 0.008 + 0.25 * ps.pop; it.print.position.y = it.face.y + 0.2 * ps.pop; } else it.print.position.set(it.face.x, it.face.y, it.face.z + 0.008);
    // cover over the name (slides in from the right; peels up and away)
    const cv = coverAt(k, t), f = it.face;
    it.cover.visible = cv.on > 0.01;
    it.cover.position.set(f.nameX + (1 - cv.on) * 0.55 * (cv.peeling ? 0 : 1), f.nameY + (cv.peeling ? (1 - cv.on) * 0.25 : 0), f.z + 0.012 + (cv.peeling ? (1 - cv.on) * 0.12 : 0));
    it.cover.rotation.set(cv.peeling ? -(1 - cv.on) * 0.9 : 0, 0, cv.peeling ? 0 : -(1 - cv.on) * 0.25);
    const csq = squash(t, T.cover[k] + T.coverDur, -0.15) + squash(t, T.cover2[k] + T.coverDur, -0.15);
    it.cover.scale.set(1 - csq * 0.4, 1 + csq, 1);
  }

  // --- hero arch: hook drop → repeat row → rises to hover → stamps logo/bag/sign → parks; lifts from bag (asset); pick + restamp
  let hp = v3(0, -5, 0), hs = 1, hrotY = 0, hVis = false, hShadowOp = 0;
  const hover = v3(0, 1.2, 0.42), HS = items.bag.face.scale; // stamp size = printed size
  const stampPath = (t, seq, park) => { // move between print targets, contacting each at its time
    const ks = KEYS, times = ks.map((k) => seq[k]);
    const pts = ks.map((k) => printTarget(k, xs[k]).add(v3(0, 0, 0.072)));
    if (t < times[0]) { const u = ramp(t, times[0] - 0.55, times[0], E.inOut); const p = lerpV(hover, pts[0], u); p.z += Math.sin(Math.PI * u) * 0.25; return p; }
    for (let i = 0; i < 2; i++) if (t < times[i + 1]) { const u = ramp(t, times[i] + 0.08, times[i + 1], E.inOut), p = lerpV(pts[i], pts[i + 1], u); p.z += Math.sin(Math.PI * u) * 0.32; p.y += Math.sin(Math.PI * u) * 0.12; if (t < times[i] + 0.08) p.z -= 0.025 * Math.sin(Math.PI * (t - times[i]) / 0.08); return p; }
    const u = ramp(t, ...park, E.in), p = lerpV(pts[2], v3(xs.sign + 0.6, 2.6, 0.6), u); if (t < times[2] + 0.08) p.z -= 0.025 * Math.sin(Math.PI * (t - times[2]) / 0.08); return p;
  };
  if (t < T.heroUp[0]) { // hook
    hVis = true; const y = dropY(t, ...T.heroDrop, 3.4); hs = lerp(1.0, 0.7, ramp(t, T.repeat1 - 0.12, T.repeat1 + 0.12)) * (1 + squash(t, T.heroDrop[1], -0.1)); hp = v3(0, y + 0.285 * hs, 0.25); hShadowOp = 1;
  } else if (t < T.stamp.logo - 0.55) {
    hVis = true; const u = ramp(t, ...T.heroUp, E.inOut); hp = lerpV(v3(0, 0.285 * 0.7, 0.25), hover, u); hp.y += Math.sin(Math.PI * u) * 0.15; hs = lerp(0.7, HS, u); hShadowOp = 1; hrotY = u * Math.PI * 2;
    if (t > T.heroUp[1]) hp.y += Math.sin((t - T.heroUp[1]) * 4) * 0.02;
  } else if (t < T.stampPark[1]) {
    hVis = true; hp = stampPath(t, T.stamp, T.stampPark); hs = HS * (1 - 0.7 * ramp(t, ...T.stampPark, E.in)); hShadowOp = 1 - ramp(t, ...T.stampPark);
  } else if (t >= T.lift[0] && t < T.back[1]) { // asset: the bag's arch lifts off, turns, waits, returns
    hVis = true; const base = printTarget("bag", xs.bag).add(v3(0, 0, 0.072)), up = v3(0, 0.62, 0.55);
    const u = ramp(t, ...T.lift, E.outBack), b = ramp(t, ...T.back, E.inOut);
    hp = lerpV(lerpV(base, up, u), base, b); hp.y += Math.sin((t - T.lift[1]) * 2.2) * 0.012 * (1 - b);
    hs = lerp(HS, 0.86, u) * (1 - b) + HS * b; hrotY = (t < T.back[0] ? E.inOut(ramp(t, T.lift[0], T.peel[0], E.lin)) * Math.PI * 2 : Math.PI * 2); hShadowOp = 0.6 * u * (1 - b);
  } else if (t >= T.pick[0] && t < T.restampPark[1]) { // takeaway: pick one asset, stamp it on every item
    hVis = true;
    if (t < T.restamp.logo - 0.55) { const u = ramp(t, ...T.pick, E.outBack); hp = v3(0, lerp(-0.25, hover.y, u), hover.z); hs = HS * (1 + squash(t, T.pick[1], -0.12)); hShadowOp = 0.7 * clamp(u * 2); if (t > T.pick[1]) hp.y += Math.sin((t - T.pick[1]) * 4) * 0.02; }
    else { hp = stampPath(t, T.restamp, T.restampPark); hs = HS * (1 - 0.7 * ramp(t, ...T.restampPark, E.in)); hShadowOp = 1 - ramp(t, ...T.restampPark); }
  }
  hero.visible = hVis && hs > 0.02; hero.position.copy(hp); hero.position.y -= 0.285 * hs; /* hp = centre → mesh origin (bottom) */ hero.scale.setScalar(hs); hero.rotation.set(0, hrotY, 0);
  if (t >= T.stamp.logo - 0.55 && t < T.stampPark[1]) { const near = KEYS.some((k) => Math.abs(t - T.stamp[k]) < 0.06); if (near) hero.scale.z = hs * 0.82; }
  if (t >= T.restamp.logo - 0.55 && t < T.restampPark[1]) { const near = KEYS.some((k) => Math.abs(t - T.restamp[k]) < 0.06); if (near) hero.scale.z = hs * 0.82; }
  placeShadow(heroSh, hero.position.x, hero.position.z, Math.max(0, hero.position.y), 0.25 * hs, 0.08 * hs + 0.04, hero.visible ? hShadowOp : 0);
  hero.castShadow = hero.position.y < 0.35;
  // hook copies: slide out of the hero in rhythm, then sink into the floor
  const CX = [-0.42, 0.42, -0.84, 0.84], CT = [T.repeat1, T.repeat2, T.repeat3 - 0.04, T.repeat3 + 0.06];
  copies.forEach((c, i) => {
    const on = t >= CT[i] - 0.02 && t < T.rowOut[1]; c.m.visible = on;
    const u = ramp(t, CT[i] - 0.02, CT[i] + 0.28, E.outBack), sk = ramp(t, T.rowOut[0] + i * 0.04, T.rowOut[1], E.in);
    c.m.position.set(lerp(0, CX[i], u), -0.57 * 0.7 * sk, 0.25); c.m.scale.set(0.7, 0.7 * (1 - 0.3 * sk) * (1 + squash(t, CT[i] + 0.28, -0.08)), 0.7);
    placeShadow(c.sh, c.m.position.x, 0.25, 0, 0.19, 0.07, on ? 1 - sk : 0);
  });

  // --- dust on landings / stamps
  const bursts = [[T.heroDrop[1], 0, 0.25, 0.25], ...KEYS.map((k) => [T.itemDrop[k][1], ITEMS[k].x, 0, 0.36]), [T.pick[1], 0, 0.42, 0.0], [T.tile[1], 0, 0.3, 0.4]];
  dust.forEach((s) => (s.visible = false)); let di = 0;
  for (const [tb, x0, z0, r] of bursts) { const d = t - tb; if (r <= 0 || d < 0 || d > 0.5) continue; for (let i = 0; i < 7 && di < dust.length; i++, di++) { const a = (i / 7) * Math.PI * 2 + 0.4, s = dust[di]; s.visible = true; s.position.set(x0 + Math.cos(a) * r * (1 + d * 1.6), 0.04 + d * 0.1, z0 + Math.sin(a) * r * 0.6 * (1 + d * 1.6)); s.scale.setScalar(0.12 + d * 0.35); s.material.opacity = 0.7 * (1 - d / 0.5); } }

  // --- CTA tile (official icon)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1.25 * (1 - tsq * 0.5), 1.25 * (1 + tsq), 1.25 * (1 - tsq * 0.5));
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.41, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD (anchored to the objects)
  $("chip").style.opacity = String(win(t, ...T.chip, 0.25, 0.3));
  for (const k of KEYS) {
    const el = $("tag_" + k), p = toScreen(v3(xs[k], 0, 0.42));
    let o = Math.min(1, pop(t, T.itemDrop[k][1] + 0.05, 0.3)) * (1 - ramp(t, T.push[0], T.push[0] + 0.25)) + (t > T.back[0] ? ramp(t, 15.85, 16.15) : 0);
    o = clamp(o) * (1 - ramp(t, T.ctaClear[0], T.ctaClear[0] + 0.2));
    if (t < T.push[0]) o = Math.min(1, pop(t, T.itemDrop[k][1] + 0.05, 0.3));
    el.style.left = p[0] + "px"; el.style.top = p[1] + 18 + "px"; el.style.opacity = String(clamp(o)); el.style.transform = `translateX(-50%) scale(${Math.max(0.001, Math.min(1.05, t < T.push[0] ? pop(t, T.itemDrop[k][1] + 0.05, 0.3) : 1))})`; el.style.display = o > 0.01 ? "" : "none";
  }
  let svg = "";
  const printScreen = (k) => toScreen(printTarget(k, xs[k]).add(v3(0, 0, 0.02)));
  const lines = (dst, u, color, broken = 0) => { // dashed recall lines from each print to a note
    for (const k of KEYS) { const a = printScreen(k), b = dst, mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 60; const len = 900;
      if (!broken) svg += `<path d="M${a[0]} ${a[1] - 30} Q${mx} ${my} ${b[0]} ${b[1] + 34}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${len * u} ${len}"/>`;
      else { const sp = broken, drop = sp * 60; svg += `<path d="M${a[0]} ${a[1] - 30} Q${lerp(a[0], mx, 0.5)} ${lerp(a[1] - 30, my, 0.5) + drop} ${lerp(a[0], mx, 0.85)} ${lerp(a[1], my, 0.85) + drop * 1.6}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 12" opacity="${1 - sp}"/>`; }
    }
  };
  // recall (cover scene): arches point to the bakery
  const rc = win(t, ...T.recall, 0.3, 0.3), rq = [540, 640];
  if (rc > 0) lines(rq, ramp(t, T.recall[0], T.recall[0] + 0.5, E.out), C.primary);
  hudAt($("nRecall"), rq, rc, 0.85 + 0.15 * Math.min(1, pop(t, T.recall[0] + 0.25, 0.3)));
  // asset note + link line (close-up)
  const an = win(t, T.assetNote, T.back[0] + 0.1, 0.25, 0.3);
  hudAt($("nAsset"), [540, 1452], an, 0.85 + 0.15 * Math.min(1, pop(t, T.assetNote, 0.3)));
  const lk = win(t, T.link[0], T.back[0] + 0.05, 0.1, 0.25);
  if (lk > 0 && hero.visible) { const a = toScreen(hero.position.clone().add(v3(0, 0.02, 0.06))), f = items.bag.face, b = toScreen(v3(xs.bag + f.nameX, f.nameY, f.z)); const u = ramp(t, ...T.link, E.out); const ex = lerp(a[0], b[0], u), ey = lerp(a[1] + 6, b[1] - 26, u);
    svg += `<line x1="${a[0]}" y1="${a[1] + 6}" x2="${ex}" y2="${ey}" stroke="${C.primary}" stroke-width="9" stroke-linecap="round" opacity="${lk}"/><circle cx="${a[0]}" cy="${a[1] + 6}" r="11" fill="${C.primary}" opacity="${lk}"/><circle cx="${ex}" cy="${ey}" r="${11 * u}" fill="${C.primary}" opacity="${lk}"/>`; }
  // contrast: inconsistent note + broken link attempts
  hudAt($("nInc"), [540, 1452], win(t, T.inconsistent, T.oddOut[0], 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.inconsistent, 0.3)));
  const qv = Math.max(win(t, T.tryLink[0] - 0.1, T.oddOut[0], 0.25, 0.3), win(t, T.testLines[0] - 0.1, T.reveal[1], 0.25, 0.3));
  hudAt($("nQ"), rq, qv, 0.85 + 0.15 * Math.min(1, Math.max(pop(t, T.tryLink[0] - 0.1, 0.3), pop(t, T.testLines[0] - 0.1, 0.3))));
  if (t >= T.tryLink[0] && t < T.snap) lines(rq, 0.55 * ramp(t, ...T.tryLink, E.out), C.grey);
  else if (t >= T.snap && t < T.snap + 0.45) lines(rq, 0, C.grey, ramp(t, T.snap, T.snap + 0.45, E.in) + 0.001);
  // takeaway: test with the name hidden
  hudAt($("nTest"), [540, 1452], win(t, T.testNote, T.reveal[1] + 0.2, 0.25, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.testNote, 0.3)));
  const tl = win(t, ...T.testLines, 0.3, 0.3);
  if (tl > 0) lines(rq, ramp(t, T.testLines[0], T.testLines[0] + 0.5, E.out), C.primary);
  $("ov").innerHTML = svg;
  // CTA lockup (official) + series tagline
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tg = ramp(t, T.lockup, T.lockup + 0.4); $("tagline").style.opacity = String(tg); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tg)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".tag, .note, #chip, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
