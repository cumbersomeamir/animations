// Werbens · 30 s English-13 — "Identical boxes. Why pay more for one?" (the IKEA effect: effort raises valuation when it ends
// in successful completion; IKEA's "we do our part, you do yours" positioning; Norton, Mochon & Ariely 2012), in the accepted
// 'Satisfying Product Theatre' style (same renderer, motion grammar, caption treatment and CTA tile as english-06…12) on the live
// app.werbens.com dark-navy theme (context/17 re-checked 2026-11-13; rules context/27).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "WE YOU A REAL STEP NOT BUSYWORK SAME BOX. PAY MORE? IKEA 2012 Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-13); C3 = lit 3D bases (pre-compensated for ACES
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

// ------------------------------------------------------------------ fold-up storage boxes (identical; illustration of the study's
// plain storage box — base + four hinged sides; a = 0 lies flat as a net, a = π/2 stands up)
const BW = 0.16, BD = 0.14, BH = 0.13, BT = 0.006, HALF = Math.PI / 2;
const boxOut = mat("#3A8195", { roughness: 0.34, clearcoat: 0.8 }) /* lit base: renders ≈ #316879 under the key (measured) */, boxIn = mat(C3.mintw, { roughness: 0.5, clearcoat: 0.3 });
const PMATS = [boxOut, boxOut, boxIn, boxOut, boxOut, boxOut]; // +x −x +y(inside) −y(outside) +z −z
const SIDES = [ // [pivot x, pivot z, rotY, width] — order: left, right, back, front
  [-BW / 2, 0, -HALF, BD - 2 * BT], [BW / 2, 0, HALF, BD - 2 * BT], [0, -BD / 2, Math.PI, BW], [0, BD / 2, 0, BW]];
function makeBox() {
  const g = new THREE.Group(); scene.add(g);
  const base = new THREE.Mesh(new THREE.BoxGeometry(BW, BT, BD), PMATS); base.position.y = BT / 2; base.castShadow = true; base.receiveShadow = true; g.add(base);
  const hinges = SIDES.map(([px, pz, ry, w]) => { const o = new THREE.Group(); o.position.set(px, 0, pz); o.rotation.y = ry; g.add(o);
    const h = new THREE.Group(); o.add(h); const m = new THREE.Mesh(new THREE.BoxGeometry(w, BT, BH), PMATS); m.position.set(0, BT / 2, BH / 2); m.castShadow = true; m.receiveShadow = true; h.add(m); return h; });
  return { g, hinges, sh: contactShadow() };
}
function setBox(b, { x, y = 0, z = 0, a, sq = 0, visible = true, ry = 0 }) {
  b.g.visible = visible; b.g.position.set(x, y, z); b.g.rotation.y = ry; b.g.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4);
  b.hinges.forEach((h, i) => { h.rotation.x = -a[i]; });
  const open = 1 - Math.min(...a) / HALF; placeShadow(b.sh, x, z, Math.max(0, y), 0.13 + 0.1 * open, 0.1 + 0.1 * open, visible ? 1 : 0);
}
const boxL = makeBox(), boxR = makeBox(), boxI = makeBox();
const XL = -0.12, XR = 0.12, XR2 = 0.2, XI = 0.75; // XR2: where the ready-made box is handed in (clear of the left box's flat net)
// sequential fold helper: sides fold up (dir +1) or down (dir −1) one after another within [t0, t1]
function seqFold(t, t0, t1, order, from, to) { const n = order.length, step = (t1 - t0) / (n + 1); const a = [...from];
  order.forEach((s, k) => { const u = ramp(t, t0 + k * step, t0 + (k + 2) * step, E.inOut); a[s] = lerp(from[s], to[s], u); }); return a; }
const UP = [HALF, HALF, HALF, HALF], FLAT = [0, 0, 0, 0];
function anglesL(t) {
  let a = [...UP];
  if (t >= T.replay[0] && t < T.replay[1]) { const m = (T.replay[0] + T.replay[1]) / 2; const HALFOPEN = [0, HALF, 0, 0]; a = t < m ? seqFold(t, T.replay[0], m, [0, 2, 3], UP, HALFOPEN) : seqFold(t, m, T.replay[1], [2, 3, 0], HALFOPEN, UP); } // the side facing the other box stays up
  if (t >= T.reset[0]) a = seqFold(t, ...T.reset, [3, 0, 1, 2], UP, FLAT);
  if (t >= T.build[0]) a = seqFold(t, ...T.build, [0, 1, 2, 3], FLAT, UP);
  if (t >= T.unfinish[0]) a = seqFold(t, ...T.unfinish, [3, 1], UP, [HALF, 0, HALF, 0]);
  if (t >= T.apart[0]) a = seqFold(t, ...T.apart, [0, 2], [HALF, 0, HALF, 0], FLAT);
  if (t >= T.refold[0]) a = seqFold(t, ...T.refold, [0, 1, 2], FLAT, [HALF, HALF, HALF, 0]);
  if (t >= T.success - 0.3) a[3] = HALF * ramp(t, T.success - 0.3, T.success, E.in);
  if (t >= T.step[0]) a[3] = HALF * (1 - ramp(t, ...T.step, E.inOut));
  if (t >= T.finish[0]) a[3] = HALF * ramp(t, ...T.finish, E.in);
  return a;
}
// the flat pack (IKEA set): mint-white parcel with a teal band
const pack = new THREE.Group(); scene.add(pack); const packSh = contactShadow();
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.032, 0.22, 3, 0.006), mat(C3.mintw, { roughness: 0.5, clearcoat: 0.3, transparent: true })); slab.position.y = 0.016; slab.castShadow = true; pack.add(slab);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.034, 0.222), mat(C3.teal, { roughness: 0.35, transparent: true })); band.position.y = 0.016; pack.add(band); }
// bid coins (direction only — no amounts)
const coinGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.011, 40), coinMat = mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.15, metalness: 0.2 });
const COIN_H = 0.0125, CZ = 0.29, CXL = XL, CXR = XR;
const mkCoins = (n) => Array.from({ length: n }, () => { const m = new THREE.Mesh(coinGeo, coinMat); m.castShadow = true; scene.add(m); return m; });
const coinsL = mkCoins(5), coinsR = mkCoins(3) /* 5 : 3 ≈ the measured mean bids $0.78 : $0.48 (Exp. 1A); illustration of direction, no values shown */, coinShL = contactShadow(), coinShR = contactShadow();
// on/off intervals per coin: [appear, disappear, mode] (mode "sink" | "vanish")
const L_IV = (i) => [[T.coinsL0 + i * 0.09, T.coinsOut + i * 0.03, "sink"], [T.coinsL1 + i * 0.08, i >= 3 ? T.vanish + (i - 3) * 0.06 : 99, "vanish"], ...(i >= 3 ? [[T.success + 0.08 + (i - 3) * 0.08, 99, "sink"]] : [])];
const R_IV = (i) => [[T.coinsR0 + i * 0.09, T.coinsOut + i * 0.03, "sink"], [T.coinsR1 + i * 0.08, 99, "sink"]];
function coinState(t, iv) { for (const [a, d, mode] of iv) { if (t >= a - 0.001 && t < d + 0.3) { const up = clamp((t - a) / 0.12), drp = 0.028 * (1 - up * up), sq = squash(t, a + 0.12, -0.25);
  if (t < d) return { s: 1, dy: drp, sq, o: 1 }; const u = clamp((t - d) / 0.3); return mode === "vanish" ? { s: 1 + 0.4 * u, dy: 0.05 * u, sq: 0, o: 1 - u } : { s: 1 - u, dy: 0, sq: 0, o: 1 }; } } return null; }
function setCoins(arr, ivf, t, x, dx) { let top = 0;
  arr.forEach((m, i) => { const st = coinState(t, ivf(i)); m.visible = !!st && st.o > 0.02 && st.s > 0.02; if (!st) return; const y = COIN_H * i + 0.0055 + st.dy;
    m.position.set(x + dx, y, CZ); m.scale.set(st.s * (1 - st.sq * 0.3), st.s * (1 + st.sq), st.s * (1 - st.sq * 0.3)); m.material.opacity = 1; top = Math.max(top, i + 1);
    m.rotation.y = i * 0.7; if (st.o < 1) { m.scale.multiplyScalar(st.o); } }); return top; }
// "=" between the identical boxes; check mark on success; hex key; aura
const eqG = new THREE.Group(); scene.add(eqG);
{ const m = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.25 }); for (const y of [-0.011, 0.011]) { const b = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.011, 0.011, 2, 0.005), m); b.position.y = y; b.castShadow = true; eqG.add(b); } }
const check = new THREE.Group(); scene.add(check);
{ const m = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.35 });
  const s1 = new THREE.Mesh(new RoundedBoxGeometry(0.034, 0.012, 0.012, 2, 0.005), m); s1.position.set(-0.016, -0.006, 0); s1.rotation.z = -0.8; check.add(s1);
  const s2 = new THREE.Mesh(new RoundedBoxGeometry(0.064, 0.012, 0.012, 2, 0.005), m); s2.position.set(0.017, 0.008, 0); s2.rotation.z = 0.85; check.add(s2); }
const hexKey = new THREE.Group(); scene.add(hexKey);
{ const m = mat("#DCE8EA", { metalness: 0.85, roughness: 0.22, clearcoat: 0.5 });
  const long = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.085, 6), m); long.rotation.z = HALF; long.castShadow = true; hexKey.add(long);
  const short = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.03, 6), m); short.position.set(0.0425, 0.013, 0); short.castShadow = true; hexKey.add(short); }
const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(aura);

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
const HOOKA = [[0, 0.32, 1.38], [0, 0.07, 0.08]], HOOKB = [[0, 0.33, 1.3], [0, 0.075, 0.08]], SUPER = [[XL + 0.02, 0.36, 0.95], [XL, 0.07, 0.05]];
const IKEA = [[XI, 0.5, 0.95], [XI, 0.03, 0.02]], IKEA2 = [[XI, 0.46, 0.88], [XI, 0.04, 0.02]];
const PROOF = [[0.035, 0.36, 1.56], [0.035, 0.07, 0.08]], PROOF2 = [[0.035, 0.36, 1.48], [0.035, 0.07, 0.08]], PAY = [[XL + 0.03, 0.38, 1.02], [XL, 0.085, 0.05]], PAY2 = [[XL + 0.03, 0.37, 0.95], [XL, 0.085, 0.05]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...HOOKA], [2.9, ...HOOKB], [3.15, ...HOOKB], [4.1, ...SUPER], [4.95, ...SUPER], [5.7, ...IKEA], [7.95, ...IKEA2], [8.1, ...IKEA2], [9.2, ...PROOF],
  [18.4, ...PROOF2], [19.3, ...PAY], [26.15, ...PAY2], [26.85, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(0, 0.3, 1.4), tgt: v3(0, 0.115, 0.08) };
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

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  // --- left box (the one "you" build): hook landing, replay, flat → built → unfinished → apart → refold → success → step → finish
  const yL = drop(t, T.dropL, 0.35), sqL = squash(t, T.dropL[1], -0.2) + squash(t, T.replay[1], -0.08) + squash(t, T.build[1], -0.08) + squash(t, T.success, -0.1) + squash(t, T.finish[1], -0.1) + 0.05 * pulse(t, 1.14, 0.3);
  const xL = XL - 0.8 * cl; setBox(boxL, { x: xL, y: yL, a: anglesL(t), sq: sqL, visible: t > T.dropL[0] && cl < 1 });
  // --- right box (ready-made): lands in the hook; slides out at the reset; is handed back in on "handed"; leaves for the CTA
  const outR = ramp(t, T.reset[0], T.reset[1], E.in) * (1 - ramp(t, ...T.hand, E.out)), xR = (t < T.hand[0] ? XR : XR2) + 0.75 * outR + 0.8 * cl, yR = drop(t, T.dropR, 0.35);
  const sqR = squash(t, T.dropR[1], -0.2) + squash(t, T.hand[1], -0.08) + 0.05 * pulse(t, 1.14, 0.3);
  setBox(boxR, { x: xR, y: yR, a: UP, sq: sqR, visible: t > T.dropR[0] && cl < 1 && (outR < 0.999) });
  // --- IKEA set: the flat pack lands on "IKEA's"; it opens on "you do yours" into a flat net that folds up into a box
  { const vis = t > T.pack[0] - 0.05 && t < 12.5, op = 1 - ramp(t, ...T.open, E.in), py = drop(t, T.pack, 0.3) + 0.06 * ramp(t, ...T.open, E.out), sq = squash(t, T.pack[1], -0.15) + 0.06 * pulse(t, T.we[0], 0.35);
    pack.visible = vis && op > 0.01; pack.position.set(XI, py, 0); pack.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3); pack.children.forEach((m) => { m.material.opacity = op; });
    placeShadow(packSh, XI, 0, py, 0.17, 0.13, pack.visible ? op : 0);
    const fa = t < T.fold[0] ? FLAT : seqFold(t, ...T.fold, [0, 1, 2, 3], FLAT, UP);
    setBox(boxI, { x: XI, a: fa, sq: squash(t, T.fold[1], -0.08), visible: vis && t > T.open[0] + 0.05 }); }
  // --- bid coins
  setCoins(coinsL, L_IV, t, xL, 0); setCoins(coinsR, R_IV, t, xR, 0);
  placeShadow(coinShL, xL, CZ, 0, 0.035, 0.035, coinsL[0].visible ? 0.8 : 0); placeShadow(coinShR, xR, CZ, 0, 0.035, 0.035, coinsR[0].visible ? 0.8 : 0);
  // --- "=", check mark, hex key, aura
  { const s = pop(t, T.eq, 0.3) * (1 - ramp(t, ...T.eqOut, E.in)); eqG.visible = s > 0.01; eqG.scale.setScalar(Math.max(0.001, s)); eqG.position.set(0, 0.07, 0.03); }
  { const s = pop(t, T.success, 0.32) * (1 - ramp(t, T.step[0] - 0.25, T.step[0], E.in)); check.visible = s > 0.01; check.scale.setScalar(Math.max(0.001, s)); check.position.set(xL, BH + 0.08, 0.02); check.rotation.y = 0.15 * Math.sin(t * 2); }
  { const w1 = win(t, ...T.key1, 0.2, 0.2), w2 = win(t, ...T.key2, 0.2, 0.2), w = THUMB ? 1 : Math.max(w1, w2); // thumbnail: the hex key marks the box "you built" hexKey.visible = w > 0.01;
    hexKey.position.set(xL + BW / 2 + 0.035, 0.06 + 0.04 * (1 - w), BD / 2 + 0.02); hexKey.rotation.set(t * 7, 0.5, 0.35); hexKey.scale.setScalar(Math.max(0.001, w));
    if (THUMB) { hexKey.position.set(xL + 0.075, 0.0046, 0.21); hexKey.rotation.set(HALF, 0, -0.5); } }
  { const a = (ramp(t, T.success, T.success + 0.5, E.out) * (1 - ramp(t, T.step[0], T.step[1], E.inOut)) + ramp(t, ...T.finish, E.out)) * (1 - cl);
    aura.visible = a > 0.01; aura.material.opacity = 0.7 * Math.min(1, a); aura.scale.set(0.45, 0.45, 1); aura.position.set(xL, 0.09, -0.12); }
  // --- lights: hero spot on the left box in the super hook and the payoff
  { const on = THUMB ? 1.6 : Math.max(win(t, 3.1, T.toIkea[0] + 0.2, 0.4, 0.4), ramp(t, T.refold[0], T.refold[0] + 0.6, E.out)) * (1 - cl);
    hero.intensity = 2 * on + 1 * Math.max(ramp(t, T.success, T.success + 0.4, E.out), ramp(t, ...T.finish, E.out)) * (1 - cl); hero.position.set(xL + 0.15, 1.25, 0.6); hero.target.position.set(xL, 0.04, 0); hero.target.updateMatrixWorld(); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.14, 0, tu * tu) : 0; // short drop: never crosses the caption band
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: one big brief label at a time
  const lab = (id, w, y = 640) => hudAt($(id), [540, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lWe", T.we); lab("lYou", T.you); lab("lReal", T.real); lab("lBusy", T.busy);
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
