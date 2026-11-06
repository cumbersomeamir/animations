// Werbens · 30 s English-08 — "Same cookies. Why do the last two look more tempting?" (scarcity: real limits help, fake
// low-stock claims are a dark pattern), in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption
// treatment/CTA as feedback-05, english-06 and english-07). Procedural 3D hero objects on a clean light sweep, soft contact
// shadows, tactile timed changes. Colours/logo from app.werbens.com (context/17).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "ONLY 2 LEFT! 2 IN STOCK ENDS SUNDAY Werbens")));
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
let seed = 20261108; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// ------------------------------------------------------------------ cookies (fictional, unbranded chocolate-chip cookies)
const cookieTop = canvasTex(256, 256, (k, w, h) => { const g = k.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); g.addColorStop(0, "#D9A45E"); g.addColorStop(0.8, "#C88B45"); g.addColorStop(1, "#A86B2E"); k.fillStyle = g; k.fillRect(0, 0, w, h);
  for (let i = 0; i < 220; i++) { k.fillStyle = rnd() < 0.5 ? "rgba(120,72,30,0.35)" : "rgba(240,200,140,0.35)"; k.beginPath(); k.arc(rnd() * w, rnd() * h, 2 + rnd() * 5, 0, 6.28); k.fill(); } });
const cookieGeo = new THREE.CylinderGeometry(0.056, 0.058, 0.018, 30, 1);
const cookieMat = [new THREE.MeshPhysicalMaterial({ color: "#B97A3A", roughness: 0.8 }), new THREE.MeshPhysicalMaterial({ map: cookieTop, roughness: 0.75 }), new THREE.MeshPhysicalMaterial({ color: "#A86B2E", roughness: 0.8 })];
const chipGeo = new THREE.SphereGeometry(0.0085, 8, 6), chipMat = mat("#3A2314", { roughness: 0.5, clearcoat: 0.3 });
function makeCookie() { const g = new THREE.Group(); const c = new THREE.Mesh(cookieGeo, cookieMat); c.castShadow = true; c.receiveShadow = true; g.add(c);
  for (let i = 0; i < 6; i++) { const a = rnd() * 6.28, r = 0.012 + rnd() * 0.034, ch = new THREE.Mesh(chipGeo, chipMat); ch.position.set(Math.cos(a) * r, 0.0095, Math.sin(a) * r); ch.scale.set(1, 0.55, 1); g.add(ch); } return g; }

// ------------------------------------------------------------------ glass jars on white stands (podiums that rise)
const JR = 0.15, JH = 0.44, glassMat = new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", transparent: true, opacity: 0.2, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03, depthWrite: false, side: THREE.DoubleSide });
function makeJar(x, z, n, fullPile) {
  const root = new THREE.Group(); scene.add(root);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.175, 1, 48), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.3 })); stand.castShadow = true; stand.receiveShadow = true; root.add(stand);
  const jar = new THREE.Group(); root.add(jar);
  const pp = [[0, 0], [JR - 0.01, 0], [JR, 0.012], [JR, JH * 0.8], [JR - 0.02, JH * 0.89], [0.108, JH * 0.93], [0.108, JH * 0.97], [0.116, JH * 0.985], [0.116, JH], [0.108, JH]].map(([a, b]) => new THREE.Vector2(a, b));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(pp, 56), glassMat); glass.renderOrder = 2; jar.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(JR - 0.006, JR - 0.006, 0.01, 40), new THREE.MeshPhysicalMaterial({ color: "#E6F4F1", roughness: 0.2, transparent: true, opacity: 0.5 })); base.position.y = 0.005; jar.add(base);
  const cookies = []; for (let i = 0; i < n; i++) { const c = makeCookie(); jar.add(c); const a = rnd() * 6.28, r = fullPile ? 0.02 + rnd() * 0.04 : 0.015 + rnd() * 0.02;
    cookies.push({ c, x: Math.cos(a) * r, z: Math.sin(a) * r, y: 0.02 + i * (fullPile ? 0.024 : 0.021), rx: (rnd() - 0.5) * 0.5, rz: (rnd() - 0.5) * 0.5, ry: rnd() * 6.28 }); }
  const sh = contactShadow(); return { root, stand, jar, cookies, x, z, sh };
}
const A = makeJar(-0.35, 0, 10, true), B = makeJar(0.35, 0, 2, false), Cj = makeJar(0, 0.5, 13, true);
// rosette (the "more desirable" mark) — moves from B to A on "higher still"
const rosette = new THREE.Group(); scene.add(rosette);
{ const d = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.012, 32), mat(C3.mint, { roughness: 0.3 })); d.rotation.x = Math.PI / 2; d.castShadow = true; rosette.add(d);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.009, 10, 36), mat(C3.teal, { roughness: 0.3 })); ring.position.z = 0.006; rosette.add(ring);
  const star = new THREE.Mesh(new THREE.CircleGeometry(0.026, 5), new THREE.MeshBasicMaterial({ color: "#FFFFFF", toneMapped: false })); star.position.z = 0.0075; star.rotation.z = Math.PI / 2; rosette.add(star);
  for (const sx of [-1, 1]) { const tail = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.075, 0.006, 1, 0.003), mat(C3.teal, { roughness: 0.4 })); tail.position.set(sx * 0.02, -0.06, -0.004); tail.rotation.z = sx * 0.3; tail.castShadow = true; rosette.add(tail); } }
// glass tags (cards on the jar fronts)
function tagCard(txt, bg, fg, w = 0.24, h = 0.075) { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: bg, roughness: 0.5 });
  const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.006, 2, 0.003), m); b.castShadow = true; g.add(b);
  const fm = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(Math.round(w * 3000), Math.round(h * 3000), (k, cw, ch) => { k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, 36); k.fill(); k.fillStyle = fg; let fs = Math.round(ch * 0.5); k.font = `${fs}px IDBK`; while (k.measureText(txt).width > cw * 0.86 && fs > 20) { fs -= 2; k.font = `${fs}px IDBK`; } k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.55); }) });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.004, h - 0.004), fm); f.position.z = 0.0035; g.add(f); g.userData = { m, fm }; return g; }
const stockTag = tagCard("2 IN STOCK", C.mint, C.ink, 0.22), endTag = tagCard("ENDS SUNDAY", C.mint, C.ink, 0.22), fakeTag = tagCard("ONLY 2 LEFT!", C.amber, C.ink, 0.27, 0.08);
const darkFace = new THREE.Mesh(new THREE.PlaneGeometry(0.266, 0.076), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0, map: canvasTex(810, 240, (k, cw, ch) => { k.fillStyle = C.ink; k.beginPath(); k.roundRect(0, 0, cw, ch, 36); k.fill(); k.fillStyle = C.slate; k.font = `${Math.round(ch * 0.5)}px IDBK`; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("ONLY 2 LEFT!", cw / 2, ch * 0.55); }) }));
darkFace.position.z = 0.0045; fakeTag.add(darkFace);
B.jar.add(stockTag); A.jar.add(endTag); Cj.jar.add(fakeTag);
const TAG_Y = 0.33, TAG_Z = JR + 0.012;

// ------------------------------------------------------------------ hourglass (drops in on "scarcity"; sand runs on "running out")
const hourglass = new THREE.Group(); scene.add(hourglass); const hgSh = contactShadow();
const sandTop = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 36), mat("#E2B865", { roughness: 0.85, clearcoat: 0, emissive: new THREE.Color("#E2B865"), emissiveIntensity: 0 }));
const sandBot = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 36), sandTop.material), stream = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 6), sandTop.material);
{ const capM = mat(C3.teal, { roughness: 0.3 });
  for (const y of [0.012, 0.358]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.024, 40), capM); cap.position.y = y; cap.castShadow = true; hourglass.add(cap); }
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5, rr = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.334, 10), capM); rr.position.set(Math.cos(a) * 0.098, 0.185, Math.sin(a) * 0.098); rr.castShadow = true; hourglass.add(rr); }
  const pp = [[0.012, 0.024], [0.075, 0.034], [0.085, 0.08], [0.06, 0.14], [0.011, 0.185], [0.06, 0.23], [0.085, 0.29], [0.075, 0.336], [0.012, 0.346]].map(([a, b]) => new THREE.Vector2(a, b));
  const gl = new THREE.Mesh(new THREE.LatheGeometry(pp, 48), glassMat); gl.renderOrder = 2; hourglass.add(gl);
  sandTop.rotation.x = Math.PI; hourglass.add(sandTop, sandBot, stream); }
const HG_Z = 0.42, HG_S = 1.25;

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
function slam(g, t, t0, x, y, z, rz = 0, s0 = 1.5, dz = 0.5) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); g.visible = t >= t0; const sc = lerp(s0, 1, u) * (1 + sq); g.scale.set(sc, sc, 1); g.position.set(x, y, z + lerp(dz, 0, u)); g.rotation.set(0, 0, rz); }

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const STUDY = [[0, 0.9, 3.05], [0, 0.52, 0]], GLASS = [[0, 0.74, 2.62], [0, 0.42, 0.2]], REAL = [[0, 0.9, 3.35], [0, 0.5, 0]], FAKE = [[0, 0.8, 3.2], [0, 0.44, 0.25]];
const CAMS = [
  [0.0, [0, 0.76, 2.78], [0, 0.44, 0]], [3.3, [0, 0.74, 2.66], [0, 0.44, 0]], [4.3, ...STUDY], [13.9, ...STUDY], [14.7, ...GLASS], [17.2, ...GLASS], [17.9, ...REAL],
  [21.4, ...REAL], [22.1, ...FAKE], [25.1, ...FAKE], [26.1, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// podium heights: B rises on "rated more desirable"; A (emptied by demand) rises higher on "higher still"
const standH = (t, j) => (j === Cj ? 0.06 : 0.16) + (j === B ? 0.14 * ramp(t, ...T.riseB, E.outBack) : j === A ? 0.26 * ramp(t, ...T.riseA, E.outBack) : 0);

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in);
  // --- jars + podiums
  for (const j of [A, B, Cj]) {
    let x = j.x, z = j.z, vis = cl < 1;
    if (j === A) x -= 2.6 * cl; if (j === B) x += 2.6 * cl;
    if (j === Cj) { const ci = ramp(t, ...T.jarC, E.out); vis = t >= T.jarC[0] && cl < 1; x = lerp(1.9, 0, ci) + 2.6 * cl; }
    const h = standH(t, j); j.root.position.set(x, 0, z); j.root.visible = vis; j.stand.scale.set(1, h, 1); j.stand.position.y = h / 2;
    const pj = j === B ? 0.05 * pulse(t, T.empty, 0.4) + 0.04 * pulse(t, T.lastTwo, 0.35) : j === Cj ? 0.04 * squash(t, T.jarC[1], 1) : 0;
    j.jar.position.y = h; j.jar.scale.set(1 + pj, 1 + pj, 1 + pj);
    placeShadow(j.sh, x, z, 0, 0.2, 0.2, vis ? 1 : 0);
  }
  // --- cookies: A's ten and B's two rain in on frame 0; A's top eight are taken one by one ("because others wanted them")
  A.cookies.forEach((k, i) => { const d0 = T.dropA + i * T.dropStep, u = clamp((t - d0) / 0.28), fall = t < d0 + 0.28 ? lerp(0.75, 0, u * u) : 0, sq = squash(t, d0 + 0.28, -0.25);
    let y = k.y + fall, x = k.x, z = k.z, rx = k.rx, rz = k.rz, vis = t >= d0 - 0.1;
    if (i >= 2) { const n = 9 - i, s0 = T.take[0] + (n * (T.take[1] - T.take[0])) / 8, v = ramp(t, s0, s0 + 0.45, E.in); if (v > 0) { y += 0.55 * Math.sin(Math.PI * 0.5 * Math.min(1, v * 1.6)) + 0.2 * v; x -= 0.9 * v * v; rz += 2.5 * v; } vis = vis && v < 1; }
    k.c.visible = vis; k.c.position.set(x, y, z); k.c.rotation.set(rx, k.ry, rz); k.c.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3); });
  B.cookies.forEach((k, i) => { const d0 = T.dropB[i], u = clamp((t - d0) / 0.28), fall = t < d0 + 0.28 ? lerp(0.75, 0, u * u) : 0, sq = squash(t, d0 + 0.28, -0.25), hop = 0.05 * pulse(t, T.lastTwo + i * 0.06, 0.3);
    k.c.visible = t >= d0 - 0.1; k.c.position.set(k.x, k.y + fall + hop, k.z); k.c.rotation.set(k.rx, k.ry, k.rz); k.c.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3); });
  Cj.cookies.forEach((k) => { k.c.position.set(k.x, k.y, k.z); k.c.rotation.set(k.rx, k.ry, k.rz); });
  // --- rosette: pops onto B's glass on "desirable", hops to A on "higher still"
  { const mv = ramp(t, T.rosetteMove, T.rosetteMove + 0.5, E.inOut), pa = A.jar.getWorldPosition(v3(0, 0, 0)), pb = B.jar.getWorldPosition(v3(0, 0, 0));
    const p = new THREE.Vector3().lerpVectors(pb, pa, mv); p.y += 0.2 + 0.25 * Math.sin(Math.PI * mv); p.z += JR + 0.02;
    const s = Math.max(0.001, pop(t, T.rosette, 0.3)) * (1 - cl); rosette.visible = t >= T.rosette && cl < 1; rosette.position.copy(p); rosette.scale.setScalar(s * (1 + 0.15 * squash(t, T.rosetteMove + 0.5, 1))); rosette.rotation.z = 0.15 * wobble(t, T.rosetteMove + 0.5, 1, 6, 5); }
  // --- hourglass: drops in on "scarcity", sand runs on "running out", glows on "more valuable", sinks before the fake jar
  { const [g0, g1] = T.glass, u = clamp((t - g0) / (g1 - g0)), y = t < g1 ? lerp(0.8, 0, u * u) : 0, sq = squash(t, g1, -0.12), go = ramp(t, ...T.glassOut, E.in);
    hourglass.visible = t >= g0 && go < 1; hourglass.position.set(0, y - 0.55 * go, HG_Z); hourglass.scale.set(HG_S * (1 - sq * 0.4), HG_S * (1 + sq) * (1 - 0.3 * go), HG_S * (1 - sq * 0.4));
    const f = ramp(t, ...T.sand, E.inOut), top = 1 - f, bot = 0.15 + 0.85 * f;
    sandTop.scale.set(0.068 * Math.sqrt(top) + 0.001, 0.07 * top + 0.001, 0.068 * Math.sqrt(top) + 0.001); sandTop.position.y = 0.19 + 0.035 * top;
    sandBot.scale.set(0.072 * Math.sqrt(bot), 0.06 * bot, 0.072 * Math.sqrt(bot)); sandBot.position.y = 0.034 + 0.03 * bot;
    stream.visible = f > 0.01 && f < 0.99; stream.position.y = 0.11; sandTop.material.emissiveIntensity = 0.35 * pulse(t, T.valuable, 0.6);
    placeShadow(hgSh, 0, HG_Z, y, 0.16, 0.16, hourglass.visible ? 1 - go : 0); }
  // --- honest tags slap onto the jars; the fake tag slaps on, turns dark on "dark", falls on "pattern"
  slam(stockTag, t, T.stockTag, 0, TAG_Y, TAG_Z, 0.04); slam(endTag, t, T.endTag, 0, TAG_Y, TAG_Z, -0.04);
  slam(fakeTag, t, T.fake, 0, TAG_Y - 0.02, TAG_Z, -0.06);
  { const dk = ramp(t, T.dark, T.dark + 0.3, E.inOut), fo = ramp(t, ...T.fakeOut, E.in); darkFace.material.opacity = dk; fakeTag.scale.multiplyScalar(1 + 0.08 * pulse(t, T.dark, 0.35));
    if (t >= T.fakeOut[0]) { fakeTag.position.set(0.15 * fo, TAG_Y - 0.02 - 0.6 * fo * fo, TAG_Z + 0.25 * fo); fakeTag.rotation.set(-1.0 * fo, 0, -0.06 - 0.8 * fo); fakeTag.visible = fo < 1; } }

  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("nQ"), (() => { const p = toScreen(v3(0, 0.62, 0)); return [p[0], p[1]]; })(), win(t, ...T.q, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  hudAt($("cite1"), [540, 562], win(t, ...T.cite1, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite1[0], 0.3)));
  hudAt($("cite2"), [540, 562], win(t, ...T.cite2, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite2[0], 0.3)));
  $("ov").innerHTML = "";
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".note, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
