// Werbens · 30 s English-06 — "75% lean or 25% fat?" (attribute framing: same product, same numbers, different frame),
// in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment/CTA as feedback-05): procedural
// 3D hero objects on a clean light sweep, soft contact shadows, tactile timed changes. Colours/logo from app.werbens.com
// (context/17). Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "75% LEAN 25% FAT Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-06); C3 = lit 3D bases pre-compensated (ACES)
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
// deterministic RNG + value noise (no Math.random)
let seed = 20261106; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
const vnoise = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash(ix, iy), hash(ix + 1, iy), sx), lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx), sy); };
function rod(a, b, r, m) { const d = new THREE.Vector3().subVectors(b, a), c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 10), m); c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); c.castShadow = true; return c; }

// ------------------------------------------------------------------ the two identical trays (fictional, unbranded mince packs on display stands)
const TW = 0.72, TH = 0.86, TD = 0.07, TX = 0.44, TILT = 0.5, LY = TH * 0.24, LZ = TD / 2 + 0.064;
const minceTex = canvasTex(640, 800, (k, w, h) => {
  k.fillStyle = "#A83E46"; k.fillRect(0, 0, w, h);
  const cols = ["#7E2830", "#93323A", "#B44A50", "#C65E61", "#8A2C35", "#D47A79"];
  for (let i = 0; i < 6200; i++) { const x = rnd() * w, y = rnd() * h, r = 4 + rnd() * 6, a = rnd() * 6.28; k.strokeStyle = cols[Math.floor(rnd() * cols.length)]; k.lineWidth = 3.5 + rnd() * 3.5; k.lineCap = "round"; k.beginPath(); k.arc(x, y, r, a, a + 1.6 + rnd() * 2.2); k.stroke(); }
  for (let i = 0; i < 260; i++) { k.fillStyle = rnd() < 0.5 ? "#EFCFC6" : "#E3B5AA"; k.beginPath(); k.arc(rnd() * w, rnd() * h, 1.5 + rnd() * 2, 0, 6.28); k.fill(); }
});
function minceMesh() {
  const g = new THREE.PlaneGeometry(TW - 0.1, TH - 0.1, 60, 72), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), u = x / ((TW - 0.1) / 2), v = y / ((TH - 0.1) / 2);
    const dome = Math.max(0, (1 - u ** 4) * (1 - v ** 4)), n1 = vnoise(x * 7 + 3, y * 7 + 1), n2 = vnoise(x * 46, y * 46);
    p.setZ(i, dome * (0.024 + 0.014 * n1) + 0.007 * n2 * Math.sqrt(dome)); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ map: minceTex, bumpMap: minceTex, bumpScale: 3, roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.35 })); m.position.z = TD / 2 + 0.001; m.receiveShadow = true; return m;
}
function labelCard(txt, bg, w = 0.58, h = 0.18) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.006, 2, 0.003), new THREE.MeshStandardMaterial({ color: bg, roughness: 0.5 })); base.castShadow = true; g.add(base);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.006, h - 0.006), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(Math.round(w * 1400), Math.round(h * 1400), (k, cw, ch) => {
    k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, 20); k.fill(); k.fillStyle = C.ink; k.font = `${Math.round(ch * 0.58)}px IDBK`; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.54); }) }));
  face.position.z = 0.0035; g.add(face); return g;
}
function frameBars() { // picture frame around the label
  const g = new THREE.Group(), fw = 0.7, fh = 0.31, b = 0.046, m = mat(C3.teal, { roughness: 0.3, emissive: new THREE.Color(C.mint), emissiveIntensity: 0 });
  for (const [x, y, w, h] of [[0, (fh - b) / 2, fw, b], [0, -(fh - b) / 2, fw, b], [-(fw - b) / 2, 0, b, fh - 2 * b], [(fw - b) / 2, 0, b, fh - 2 * b]]) { const s = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.034, 2, 0.008), m); s.position.set(x, y, 0); s.castShadow = true; g.add(s); }
  g.userData.m = m; return g;
}
function makeTray(sx) {
  const G = new THREE.Group(); scene.add(G);
  const white = mat("#FFFFFF", { roughness: 0.55, clearcoat: 0.2 }), navy = mat(C3.navy, { roughness: 0.4 });
  const ledge = new THREE.Mesh(new RoundedBoxGeometry(TW + 0.06, 0.075, 0.17, 3, 0.02), white); ledge.position.set(0, 0.0375, 0.065); ledge.castShadow = true; ledge.receiveShadow = true; G.add(ledge);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(TW + 0.06, 0.035, 0.025, 2, 0.01), white); lip.position.set(0, 0.09, 0.138); lip.castShadow = true; G.add(lip);
  const P = new THREE.Group(); P.position.set(0, 0.075, 0.07); P.rotation.x = -TILT; G.add(P);
  const tray = new THREE.Group(); tray.position.y = TH / 2; P.add(tray);
  const body = new THREE.Mesh(new RoundedBoxGeometry(TW, TH, TD, 4, 0.025), white); body.castShadow = true; body.receiveShadow = true; tray.add(body);
  const rb = 0.038; for (const [x, y, w, h] of [[0, (TH - rb) / 2, TW, rb], [0, -(TH - rb) / 2, TW, rb], [-(TW - rb) / 2, 0, rb, TH], [(TW - rb) / 2, 0, rb, TH]]) { const s = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.03, 2, 0.01), white); s.position.set(x, y, TD / 2 + 0.012); s.castShadow = true; tray.add(s); }
  tray.add(minceMesh());
  const film = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.02, TH - 0.02), new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.16, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false }));
  film.position.z = TD / 2 + 0.056; tray.add(film);
  // back support rods (easel-style), from the tray back at 75 % height down to the floor
  { const ty = TH * 0.75, z = -TD / 2, cy = 0.075 + ty * Math.cos(TILT) + z * Math.sin(TILT), cz = 0.07 - ty * Math.sin(TILT) + z * Math.cos(TILT);
    for (const bx of [-0.24, 0.24]) G.add(rod(new THREE.Vector3(bx, cy, cz), new THREE.Vector3(bx, 0.0, cz - 0.3), 0.014, navy)); }
  const sh = contactShadow();
  return { G, P, tray, sh, sx };
}
const trays = [makeTray(-1), makeTray(1)];
const labels = [labelCard("75% LEAN", C.mint), labelCard("25% FAT", C.amber)], swapCard = labelCard("75% LEAN", C.mint);
labels.forEach((l, i) => trays[i].tray.add(l)); trays[1].tray.add(swapCard);
const frames = [frameBars(), frameBars()]; frames.forEach((f, i) => trays[i].tray.add(f));

// ------------------------------------------------------------------ 3+1 blocks in front of each tray (the same numbers: 75 / 25)
const BS = 0.15, BG = 0.022, BZ = 0.52;
const blocks = trays.map((tr, i) => [0, 1, 2, 3].map((k) => { const lean = k < 3, m = mat(lean ? C3.mint : C3.amber, { roughness: 0.3, emissive: new THREE.Color(lean ? C.mint : C.amber), emissiveIntensity: 0 });
  const b = new THREE.Mesh(new RoundedBoxGeometry(BS, BS, BS, 3, 0.025), m); b.castShadow = true; b.receiveShadow = true; scene.add(b); return { b, m, lean, k, i }; }));
const blockX = (i, k) => (i ? TX : -TX) + (k - 1.5) * (BS + BG);

// ------------------------------------------------------------------ rating tubes behind the trays (illustrative only)
const TUBEH = 1.45, TZ = -0.88;
const tubes = trays.map((tr, i) => { const g = new THREE.Group(); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.05, 40), mat(C3.navy, { roughness: 0.4 })); base.position.y = 0.025; base.castShadow = true; g.add(base);
  const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 32), mat(C3.teal, { roughness: 0.25 })); g.add(fluid);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, TUBEH, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide })); glass.position.y = 0.05 + TUBEH / 2; g.add(glass);
  const cap = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.012, 10, 40), mat(C3.navy, { roughness: 0.4 })); cap.rotation.x = Math.PI / 2; cap.position.y = 0.05 + TUBEH; g.add(cap);
  const sh = contactShadow(); return { g, fluid, sh }; });

// ------------------------------------------------------------------ one shared tasting plate (cooked sample of the same mince) + fork
const plate = new THREE.Group(); scene.add(plate); const plateSh = contactShadow(), PZ = 0.98, PZ2 = 0.9;
const pattyTex = canvasTex(512, 512, (k, w, h) => { k.fillStyle = "#6E4128"; k.fillRect(0, 0, w, h); const cols = ["#5A321E", "#86532F", "#7A4A2B", "#4A2816", "#9A6438"];
  for (let i = 0; i < 2600; i++) { const x = rnd() * w, y = rnd() * h, r = 2 + rnd() * 5, a = rnd() * 6.28; k.strokeStyle = cols[Math.floor(rnd() * cols.length)]; k.lineWidth = 2 + rnd() * 3; k.beginPath(); k.arc(x, y, r, a, a + 1.5 + rnd() * 2); k.stroke(); } });
const pattyMat = new THREE.MeshPhysicalMaterial({ map: pattyTex, roughness: 0.7, clearcoat: 0.25, clearcoatRoughness: 0.5 });
{ const pp = [new THREE.Vector2(0, 0), new THREE.Vector2(0.21, 0), new THREE.Vector2(0.25, 0.026), new THREE.Vector2(0.262, 0.034), new THREE.Vector2(0.245, 0.034), new THREE.Vector2(0.2, 0.011), new THREE.Vector2(0, 0.011)];
  const p = new THREE.Mesh(new THREE.LatheGeometry(pp, 72), mat("#FFFFFF", { roughness: 0.3 })); p.castShadow = true; p.receiveShadow = true; plate.add(p);
  const g = new THREE.CylinderGeometry(0.15, 0.158, 0.05, 56, 2), q = g.attributes.position;
  for (let i = 0; i < q.count; i++) { const x = q.getX(i), z = q.getZ(i), y = q.getY(i); if (y > 0.02) q.setY(i, y + 0.007 * vnoise(x * 40 + 5, z * 40) * (1 - (x * x + z * z) / 0.0256)); }
  g.computeVertexNormals(); const patty = new THREE.Mesh(g, pattyMat); patty.position.y = 0.011 + 0.025; patty.castShadow = true; patty.receiveShadow = true; plate.add(patty); }
const chunk = new THREE.Mesh(new RoundedBoxGeometry(0.065, 0.036, 0.058, 2, 0.014), pattyMat); chunk.castShadow = true; scene.add(chunk);
const CHUNK0 = new THREE.Vector3(0.045, 0.088, PZ + 0.03);
const fork = new THREE.Group(); scene.add(fork);
{ const steel = mat("#C9D2D6", { metalness: 0.85, roughness: 0.22 });
  for (let k = 0; k < 4; k++) { const tn = new THREE.Mesh(new RoundedBoxGeometry(0.007, 0.085, 0.008, 1, 0.003), steel); tn.position.set(-0.0165 + k * 0.011, 0.0425, 0); fork.add(tn); }
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.04, 0.009, 2, 0.004), steel); head.position.y = 0.1; fork.add(head);
  const neck = new THREE.Mesh(new RoundedBoxGeometry(0.018, 0.06, 0.009, 2, 0.004), steel); neck.position.y = 0.145; fork.add(neck);
  const handle = new THREE.Mesh(new RoundedBoxGeometry(0.034, 0.3, 0.012, 2, 0.006), steel); handle.position.y = 0.32; fork.add(handle);
  fork.children.forEach((c) => (c.castShadow = true)); }

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
// slam a card onto the tray face: flies in from the camera side, lands at +0.17 s, squash
function slam(card, t, t0, z0) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); card.visible = t >= t0; const sc = lerp(1.7, 1, u) * (1 + sq); card.scale.set(sc, sc, 1); card.position.set(0, LY, z0 + lerp(0.85, 0, u)); }

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0, 1.15, 4.95], [0, 0.5, 0]], STUDY = [[0, 1.45, 6.3], [0, 0.82, -0.3]], RIGHT = [[0.06, 1.1, 4.62], [0.06, 0.52, 0]];
const CAMS = [
  [0.0, [0, 1.3, 5.45], [0, 0.52, 0]], [3.85, ...FRONT], [7.3, ...FRONT], [8.3, ...STUDY], [15.8, ...STUDY], [16.85, ...RIGHT], [19.35, ...RIGHT], [19.95, ...FRONT],
  [21.4, ...FRONT], [25.75, [0, 1.12, 4.75], [0, 0.48, 0.1]], [26.6, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// rating levels (fraction of the tube): equal fill → left rises on "more favorably" → the gap narrows after tasting (not to zero)
function levels(t) { const f = ramp(t, ...T.fill, E.inOut), fv = ramp(t, ...T.favor, E.inOut), sk = ramp(t, ...T.shrink, E.inOut);
  return [0.62 * f + 0.28 * fv - 0.06 * sk, 0.62 * f + 0.01 * fv + 0.07 * sk]; }

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in);
  // --- trays: drop in (already falling on frame 0), hop together on "Same tray", slide off for the CTA
  trays.forEach((tr, i) => { const [d0, d1] = T.drop[i], u = clamp((t - d0) / (d1 - d0)), y = t < d1 ? lerp(1.6, 0, u * u) : 0;
    const hop = 0.07 * pulse(t, T.same, 0.28), sq = squash(t, d1, -0.1) + squash(t, T.same + 0.28, -0.05);
    const x = tr.sx * TX + tr.sx * 2.9 * cl; tr.G.position.set(x, y + hop, 0); tr.G.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4); tr.G.visible = cl < 1;
    placeShadow(tr.sh, x, -0.05, y + hop, 0.48, 0.26, tr.G.visible ? 1 : 0); });
  // --- labels slam on "75%" / "25%"; left pulses on "labeled lean"; the positive card covers the right label on "positive"
  slam(labels[0], t, T.lab[0], LZ); labels[0].scale.multiplyScalar(1 + 0.08 * pulse(t, T.leanSay, 0.4) + 0.05 * pulse(t, T.trueSay, 0.4));
  slam(labels[1], t, T.lab[1], LZ);
  { const o = ramp(t, ...T.oldOut, E.in), fall = clamp((o - 0.6) / 0.4); if (t >= T.oldOut[0]) { labels[1].position.set(0.8 * o, LY - 0.5 * fall * fall, LZ - 0.0015 + 0.25 * fall); labels[1].rotation.set(-0.8 * fall, 0, -0.35 * o); labels[1].visible = o < 1; } else labels[1].rotation.set(0, 0, 0); }
  slam(swapCard, t, T.swap, LZ + 0.004); swapCard.scale.multiplyScalar(1 + 0.05 * pulse(t, T.trueSay, 0.4));
  // --- picture frames drop around the labels on "frame"; glow on "The frame"; lift away on "product"
  frames.forEach((f, i) => { const u = ramp(t, T.frames, T.frames + 0.18, E.in), sq = squash(t, T.frames + 0.18, -0.12), off = ramp(t, ...T.framesOff, E.in);
    f.visible = t >= T.frames && off < 1; const sc = lerp(1.15, 1, u) * (1 + sq) * (1 + 0.06 * pulse(t, T.glow, 0.5) + 0.04 * pulse(t, T.impress, 0.4));
    f.scale.set(sc, sc, 1); f.position.set(0, LY + 1.6 * off * off, LZ + 0.012 + lerp(0.42, 0, u) + 0.5 * off); f.rotation.z = (i ? 0.3 : -0.3) * off;
    f.userData.m.emissiveIntensity = 0.55 * pulse(t, T.glow, 0.6) + 0.3 * pulse(t, T.impress, 0.45); });
  // --- 3+1 blocks: drop in on "Same numbers"; split highlight on "changed"; sink for the study; return on "Keep every number true"
  const split = ramp(t, T.split, T.split + 0.25, E.out) * (1 - ramp(t, ...T.barsDown, E.in));
  blocks.flat().forEach(({ b, m, lean, k, i }) => {
    const a0 = T.bars + k * 0.08, a1 = T.barsUp + k * 0.08, inA = t < T.barsUp - 0.1;
    const s = inA ? a0 : a1, u = clamp((t - s) / 0.12), drop = t < s + 0.12 ? lerp(1.1, 0, u * u) : 0;
    const sink = inA ? ramp(t, ...T.barsDown, E.in) : ramp(t, ...T.barsDown2, E.in), hi = (i === 0 ? lean : !lean) ? split : 0;
    b.visible = t >= s && sink < 1 && cl < 1;
    const sq = squash(t, s + 0.12, -0.18), pu = 0.06 * pulse(t, T.trueSay + k * 0.06, 0.35);
    b.position.set(blockX(i, k) + (i ? 1 : -1) * 2.9 * cl, BS / 2 + drop - BS * 1.05 * sink + 0.06 * hi + pu, BZ); b.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4);
    m.emissiveIntensity = 0.35 * hi + 0.25 * pulse(t, T.trueSay + k * 0.06, 0.35); });
  // --- rating tubes (illustrative): rise on "people rated", fill, separate, narrow; sink before the lesson
  const lv = levels(t);
  tubes.forEach((tb, i) => { const r = ramp(t, ...T.tubes, E.out) * (1 - ramp(t, ...T.tubesOut, E.in)), x = i ? TX : -TX;
    tb.g.visible = r > 0.001; tb.g.position.set(x, 0, TZ); tb.g.scale.set(1, Math.max(0.001, r), 1);
    const h = Math.max(0.001, lv[i] * TUBEH); tb.fluid.scale.set(1, h, 1); tb.fluid.position.y = 0.05 + h / 2; tb.fluid.visible = lv[i] > 0.002;
    placeShadow(tb.sh, x, TZ, 0, 0.13, 0.13, r); });
  // --- tasting plate + fork: slide in, a fork lifts a bite on "tasting", slide out; the plate returns on "product"
  const pin = ramp(t, ...T.plate, E.out), pout = ramp(t, ...T.plateOut, E.in), pin2 = ramp(t, ...T.plateIn2, E.out);
  const second = t >= T.plateIn2[0], px = second ? lerp(2.3, 0, pin2) - 2.9 * cl : lerp(2.3, 0, pin) + 2.3 * pout, psq = squash(t, T.plateIn2[1], -0.08), pz = second ? PZ2 : PZ;
  plate.visible = (t >= T.plate[0] && pout < 1) || (second && cl < 1); plate.position.set(px, 0, pz); plate.scale.set(1 - psq * 0.3, 1 + psq, 1 - psq * 0.3); placeShadow(plateSh, px, pz, 0, 0.29, 0.29, plate.visible ? 1 : 0);
  const fd = ramp(t, ...T.forkDown, E.inOut), fu = ramp(t, ...T.forkUp, E.in), tip = v3(lerp(0.9, CHUNK0.x, fd), lerp(1.45, CHUNK0.y + 0.012, fd), lerp(1.7, CHUNK0.z, fd)).add(v3(0.6 * fu, 1.4 * fu, 0.35 * fu));
  fork.visible = t >= T.forkDown[0] && fu < 1; fork.position.copy(tip); fork.scale.setScalar(1.3); fork.rotation.set(0.35, 0, -0.55 - 0.25 * fu);
  const held = t >= T.forkDown[1] + 0.05; chunk.visible = plate.visible && !second && (!held || fu < 1); if (held) chunk.position.copy(tip).add(v3(-0.004, -0.014, 0.0)); else chunk.position.set(px + CHUNK0.x, CHUNK0.y, CHUNK0.z);
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("nQ"), (() => { const p = toScreen(v3(0, 1.0, -0.3)); return [p[0], p[1]]; })(), win(t, ...T.q, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  hudAt($("eq"), (() => { const p = toScreen(v3(0, 1.0, -0.3)); return [p[0], p[1]]; })(), win(t, ...T.eq, 0.2, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.eq[0], 0.3)));
  hudAt($("cite"), [540, 612], win(t, ...T.cite, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite[0], 0.3)));
  hudAt($("illus"), [540, 1515], win(t, ...T.illus, 0.25, 0.3));
  hudAt($("trueN"), [540, 1430], win(t, ...T.trueNote, 0.2, 0.3), 0.85 + 0.15 * Math.min(1, pop(t, T.trueNote[0], 0.3)));
  let svg = "";
  // gap bracket between the two levels (illustrative)
  const gp = win(t, ...T.gap, 0.3, 0.3) * (1 - ramp(t, T.tubesOut[0] - 0.2, T.tubesOut[0]));
  if (gp > 0.01) { const a = toScreen(v3(-TX, 0.05 + lv[0] * TUBEH, TZ)), b = toScreen(v3(TX, 0.05 + lv[1] * TUBEH, TZ)), mx = 540, sw = 6 + 3 * pulse(t, T.gapSay, 0.4);
    svg += `<g opacity="${gp}" stroke="${C.teal}" stroke-width="${sw}" stroke-linecap="round" fill="none"><line x1="${a[0] + 26}" y1="${a[1]}" x2="${mx + 26}" y2="${a[1]}" stroke-dasharray="12 10"/><line x1="${b[0] - 26}" y1="${b[1]}" x2="${mx - 26}" y2="${b[1]}" stroke-dasharray="12 10"/>`;
    if (b[1] - a[1] > 24) svg += `<line x1="${mx}" y1="${a[1] + 10}" x2="${mx}" y2="${b[1] - 10}"/><path d="M${mx - 14} ${a[1] + 24} L${mx} ${a[1] + 8} L${mx + 14} ${a[1] + 24}"/><path d="M${mx - 14} ${b[1] - 24} L${mx} ${b[1] - 8} L${mx + 14} ${b[1] - 24}"/>`;
    svg += `</g>`; }
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
