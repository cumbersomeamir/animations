// Werbens · 30 s English-11 — "24 jams? Or just 6?" (choice overload — and why it depends: make choosing easy), in the
// accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment/CTA as feedback-05 and english-06…10).
// Procedural 3D hero objects on a clean light sweep, soft contact shadows, tactile timed changes. Colours/logo from
// app.werbens.com (context/17). Deterministic: every object, camera and HUD value is a pure function of t
// (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, wobble } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "FOR KIDS FOR CHEESE BOARDS FOR BAKING 24 6 · Werbens")));
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
function labelPlane(w, h, txt, bg, fg, font = "IDBK", scale = 0.5, radius = 0.25) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(Math.round(w * 2400), Math.round(h * 2400), (k, cw, ch) => {
  k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, Math.min(cw, ch) * radius); k.fill(); k.fillStyle = fg; fitText(k, txt, font, cw * 0.86, Math.round(ch * scale)); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.54); }) })); }
function pillTag(txt, bg, fg, w, h) { const g = new THREE.Group(); const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.008, 2, 0.004), new THREE.MeshStandardMaterial({ color: bg, roughness: 0.5 })); b.castShadow = true; g.add(b); const f = labelPlane(w - 0.004, h - 0.004, txt, bg, fg, "IDBK", 0.6, 0.5); f.position.z = 0.0045; g.add(f); return g; }
let seed = 20261111; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const perm = (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ------------------------------------------------------------------ the two tasting stands (stepped white tiers)
const TIER_H = 0.125, TIER_D = 0.1, PITCH = 0.08, BX = -0.2, SX = 0.4;
const tierTop = (k) => TIER_H * (k + 1), tierZ = (k) => 0.1 - k * TIER_D;
function makeStand(x, w, tiers) { const g = new THREE.Group(); g.position.x = x; scene.add(g);
  for (let k = 0; k < tiers; k++) { const b = new THREE.Mesh(new RoundedBoxGeometry(w, tierTop(k), TIER_D, 3, 0.012), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.3 })); b.position.set(0, tierTop(k) / 2, tierZ(k)); b.castShadow = true; b.receiveShadow = true; g.add(b); }
  const sh = contactShadow(); return { g, sh, x, w }; }
const big = makeStand(BX, 0.7, 3), small = makeStand(SX, 0.3, 2);
// jam pots: three colour families (one per group) with matching lids
const FAM = [["#C2283C", "#D8465A", "#B3203F", "#E05570"], ["#5B2C5E", "#4A2340", "#6E3B2A", "#7A3550"], ["#E0922F", "#E8B23A", "#D9772A", "#EDA640"]], LID = [C3.mint, C3.teal, "#FFFFFF"];
const bodyGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 28), lidGeo = new THREE.CylinderGeometry(0.033, 0.033, 0.013, 28), bandGeo = new THREE.CylinderGeometry(0.0305, 0.0305, 0.018, 28, 1, true);
const bandMat = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.6, side: THREE.DoubleSide }), lidMats = LID.map((c) => mat(c, { roughness: 0.35 }));
function pot(g, v) { const p = new THREE.Group(); scene.add(p); const b = new THREE.Mesh(bodyGeo, mat(FAM[g][v % 4], { roughness: 0.18, clearcoat: 1, transmission: 0 })); b.position.y = 0.025; b.castShadow = true; p.add(b);
  const band = new THREE.Mesh(bandGeo, bandMat); band.position.y = 0.024; p.add(band); const l = new THREE.Mesh(lidGeo, lidMats[g]); l.position.y = 0.0565; l.castShadow = true; p.add(l); return p; }
// big stand: 24 pots, 8 per group; slots: tier k, column j
const SLOTS = []; for (let k = 0; k < 3; k++) for (let j = 0; j < 8; j++) SLOTS.push([BX + (j - 3.5) * PITCH, tierTop(k), tierZ(k)]);
const bigPots = Array.from({ length: 24 }, (_, i) => ({ g: Math.floor(i / 8), p: pot(Math.floor(i / 8), i) }));
const P0 = perm(24), P1 = perm(24);
// final grouped slots: group 0 (kids) → top tier 2, group 1 (cheese boards) → tier 1, group 2 (baking) → tier 0
const FINAL = bigPots.map((b, i) => (2 - b.g) * 8 + (i % 8));
const SMALL_SLOTS = []; for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) SMALL_SLOTS.push([SX + (j - 1) * PITCH, tierTop(k), tierZ(k)]);
const smallPots = Array.from({ length: 6 }, (_, i) => ({ g: i % 3, p: pot(i % 3, i + 1) }));
// count tags on the stand fronts, and the three group signs on the big stand's tier fronts
const tag24 = pillTag("24", C.ink, C.mint, 0.11, 0.05), tag6 = pillTag("6", C.ink, C.mint, 0.08, 0.05); scene.add(tag24, tag6);
const SIGN_TXT = ["FOR BAKING", "FOR CHEESE BOARDS", "FOR KIDS"], SIGN_COL = [["#FFFFFF", C.ink], [C.teal, "#FFFFFF"], [C.mint, C.ink]];
const signs = SIGN_TXT.map((txt, k) => { const g = new THREE.Group(); scene.add(g); const blank = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.056, 0.008, 2, 0.004), mat(SIGN_COL[k][0], { roughness: 0.45 })); blank.castShadow = true; g.add(blank);
  const f = labelPlane(0.452, 0.05, txt, SIGN_COL[k][0], SIGN_COL[k][1], "IDBK", 0.62, 0.3); f.position.z = 0.0045; g.add(f); g.userData.f = f; return g; });

// ------------------------------------------------------------------ the shopping basket
const basket = new THREE.Group(); scene.add(basket); const basketSh = contactShadow();
{ const pp = [[0, 0], [0.05, 0], [0.06, 0.004], [0.072, 0.06], [0.066, 0.062], [0.055, 0.008], [0, 0.008]].map(([a, b]) => new THREE.Vector2(a, b));
  const b = new THREE.Mesh(new THREE.LatheGeometry(pp, 40), mat(C3.mint, { roughness: 0.35, side: THREE.DoubleSide })); b.castShadow = true; basket.add(b);
  const h = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 8, 30, Math.PI), mat(C3.teal, { roughness: 0.3 })); h.position.y = 0.06; basket.add(h); }
const BASKET_Z = 0.42;

// ------------------------------------------------------------------ balance scale (pans: "24" left, "6" right)
const scale = new THREE.Group(); scene.add(scale); const scaleSh = contactShadow();
const beam = new THREE.Group(), pans = [];
{ const navy = mat(C3.navy, { roughness: 0.4 }), tealM = mat(C3.teal, { roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.025, 36), navy); base.position.y = 0.0125; base.castShadow = true; scale.add(base);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.4, 14), tealM); post.position.y = 0.22; post.castShadow = true; scale.add(post);
  beam.position.y = 0.42; scale.add(beam); const bm = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.02, 0.026, 2, 0.008), tealM); bm.castShadow = true; beam.add(bm);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), navy); beam.add(hub);
  for (const [sx, txt] of [[-1, "24"], [1, "6"]]) { const pg = new THREE.Group(); scale.add(pg);
    const rodL = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.15, 6), navy); rodL.position.y = -0.075; pg.add(rodL);
    const pp = [[0, 0], [0.07, 0.004], [0.085, 0.02], [0.08, 0.022], [0.066, 0.008], [0, 0.006]].map(([a, b]) => new THREE.Vector2(a, b));
    const pan = new THREE.Mesh(new THREE.LatheGeometry(pp, 36), mat("#FFFFFF", { roughness: 0.35, side: THREE.DoubleSide })); pan.position.y = -0.16; pan.castShadow = true; pg.add(pan);
    const tg = pillTag(txt, C.ink, C.mint, txt.length > 1 ? 0.1 : 0.07, 0.05); tg.position.set(0, -0.12, 0.0); pg.add(tg); pans.push({ pg, sx }); } }
const SCALE_X = 0.08, SCALE_Z = 0.72;

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
function slam(g, t, t0, x, y, z, rz = 0, s0 = 1.35, dz = 0.25) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); g.visible = t >= t0; const sc = lerp(s0, 1, u) * (1 + sq); g.scale.set(sc, sc, 1); g.position.set(x, y, z + lerp(dz, 0, u)); g.rotation.set(0, 0, rz); }
const hopTo = (a, b, u, h = 0.12) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0.0, 0.66, 3.15], [0.0, 0.36, 0.1]], SCALEV = [[0.02, 0.64, 2.95], [0.02, 0.36, 0.4]], SORT = [[BX, 0.58, 1.8], [BX, 0.27, 0.0]];
const CAMS = [
  [0.0, [BX, 0.56, 1.7], [BX, 0.24, 0.0]], [1.2, [BX, 0.56, 1.65], [BX, 0.24, 0.0]], [2.4, ...FRONT], [9.4, ...FRONT], [10.1, ...SCALEV], [17.9, ...SCALEV], [18.9, ...SORT],
  [25.0, ...SORT], [26.0, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// beam angle: arrives tipped toward 6 (right side down), levels on "nearly zero", tips again on "overload grows"
const beamAngle = (t) => -0.3 * (1 - ramp(t, ...T.level, E.inOut)) - 0.24 * ramp(t, ...T.tipAgain, E.inOut) + 0.035 * Math.sin(t * 5) * Math.exp(-Math.max(0, t - T.level[1]) * 3) * ramp(t, ...T.level, E.lin);

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in), offB = -2.6 * cl, offS = 2.6 * cl;
  big.g.position.x = BX + offB; small.g.position.x = SX + offS; placeShadow(big.sh, BX + offB, 0.0, 0, 0.4, 0.18, cl < 1 ? 0.7 : 0); placeShadow(small.sh, SX + offS, 0.05, 0, 0.18, 0.12, cl < 1 ? 0.7 : 0);
  big.g.visible = small.g.visible = cl < 1;
  // --- big-stand pots: rain into a random mix; jumble on "hard to compare"; sort into groups on "Group your options"
  const dimS = 1 - 0.03 * pulse(t, T.dim24, 0.5);
  bigPots.forEach((b, i) => { const d0 = T.rain24[0] + (i * (T.rain24[1] - T.rain24[0])) / 23, u = clamp((t - d0) / 0.22), s0 = SLOTS[P0[i]], s1 = SLOTS[P1[i]], s2 = SLOTS[FINAL[i]];
    let p = [s0[0], s0[1] + (t < d0 + 0.22 ? lerp(0.8, 0, u * u) : 0), s0[2]];
    const j0 = T.jumble[0] + (i % 8) * 0.03, ju = ramp(t, j0, j0 + 0.32, E.inOut); if (ju > 0) p = hopTo(s0, s1, ju, 0.09);
    const g0 = T.group[0] + (FINAL[i] % 8) * 0.04 + (2 - b.g) * 0.06, gu = ramp(t, g0, g0 + 0.42, E.inOut); if (gu > 0) p = hopTo(s1, s2, gu, 0.14);
    const sq = squash(t, d0 + 0.22, -0.2) + squash(t, j0 + 0.32, -0.12) + squash(t, g0 + 0.42, -0.12), rz = ju > 0 && ju < 1 ? 0.6 * Math.sin(Math.PI * ju) * (i % 2 ? 1 : -1) : 0;
    b.p.visible = t >= d0 - 0.15 && cl < 1; b.p.position.set(p[0] + offB, p[1], p[2]); b.p.scale.set((1 - sq * 0.4) * dimS, (1 + sq) * dimS, (1 - sq * 0.4) * dimS); b.p.rotation.set(0, i * 0.7, rz);
    const glow = pulse(t, T.words[b.g], 0.5); b.p.scale.multiplyScalar(1 + 0.12 * glow); });
  // --- small-stand pots; one hops into the basket on "six"
  smallPots.forEach((s, i) => { const d0 = T.rain6[0] + i * 0.09, u = clamp((t - d0) / 0.22), sl = SMALL_SLOTS[i]; let p = [sl[0], sl[1] + (t < d0 + 0.22 ? lerp(0.7, 0, u * u) : 0), sl[2]];
    if (i === 1) { const hu = ramp(t, T.hop, T.hop + 0.3, E.inOut); if (hu > 0) p = hopTo(sl, [basketX(t) - offS, 0.02, BASKET_Z], hu, 0.12); if (t >= T.hop + 0.3) p = [basketX(t) - offS, 0.02, BASKET_Z]; }
    const sq = squash(t, d0 + 0.22, -0.2); s.p.visible = t >= d0 - 0.15 && cl < 1 && !(i === 1 && t >= T.basketOut[1]); s.p.position.set(p[0] + offS, p[1], p[2]); s.p.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4); s.p.rotation.y = i * 0.9; });
  // --- count tags (hidden when the group signs arrive), group signs
  slam(tag24, t, T.tag24, BX + offB, TIER_H / 2, tierZ(0) + TIER_D / 2 + 0.006); tag24.visible = t >= T.tag24 && t < T.signs && cl < 1;
  slam(tag6, t, T.tag6, SX + offS, TIER_H / 2, tierZ(0) + TIER_D / 2 + 0.006); tag6.visible = t >= T.tag6 && cl < 1;
  signs.forEach((g, k) => { const s = pop(t, T.signs + (2 - k) * 0.08, 0.3); g.visible = t >= T.signs && cl < 1; g.position.set(BX + offB, tierTop(k) - 0.034, tierZ(k) + TIER_D / 2 + 0.006); g.scale.setScalar(Math.max(0.001, s) * (1 + 0.08 * pulse(t, T.words[2 - k], 0.45)));
    g.userData.f.material.opacity = ramp(t, T.words[2 - k] - 0.05, T.words[2 - k] + 0.15); });
  // --- basket: slides in on "shoppers", moves to the six-jam table, exits
  { const vis = t >= T.basket[0] && t < T.basketOut[1]; basket.visible = vis; const x = basketX(t); basket.position.set(x, 0, BASKET_Z); basket.rotation.y = 0.3; basket.scale.setScalar(1 + 0.12 * squash(t, T.hop + 0.3, 1)); placeShadow(basketSh, x, BASKET_Z, 0, 0.09, 0.09, vis ? 1 : 0); }
  // --- balance scale: drops in tipped toward 6; levels on "nearly zero"; tips again on "overload grows"; sinks out
  { const u = clamp((t - T.scaleIn[0]) / (T.scaleIn[1] - T.scaleIn[0])), y = t < T.scaleIn[1] ? lerp(0.25, 0, u * u) : 0, out = ramp(t, ...T.scaleOut, E.in), sq = squash(t, T.scaleIn[1], -0.1);
    scale.visible = t >= T.scaleIn[0] && out < 1; scale.position.set(SCALE_X, y - 0.6 * out, SCALE_Z); scale.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3);
    const a = beamAngle(t); beam.rotation.z = a; pans.forEach(({ pg, sx }) => pg.position.set(sx * 0.23 * Math.cos(a), 0.42 + sx * 0.23 * Math.sin(a), 0));
    placeShadow(scaleSh, SCALE_X, SCALE_Z, y, 0.2, 0.12, scale.visible ? 1 - out : 0); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tileCTA.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  hudAt($("nQ"), [540, 900], 0);
  hudAt($("cite1"), [540, 562], win(t, ...T.cite1, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite1[0], 0.3)));
  hudAt($("cite2"), [540, 562], win(t, ...T.cite2, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite2[0], 0.3)));
  hudAt($("cite3"), [540, 562], win(t, ...T.cite3, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite3[0], 0.3)));
  $("ov").innerHTML = "";
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}
function basketX(t) { return lerp(1.2, 0.08, ramp(t, ...T.basket, E.out)) + (SX - 0.08) * ramp(t, ...T.toSix, E.inOut) + 1.4 * ramp(t, ...T.basketOut, E.in); }

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".note, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
