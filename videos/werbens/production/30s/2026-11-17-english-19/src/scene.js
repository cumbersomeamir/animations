// Werbens · 30 s English-19 — "SAME OPTIONS. BIGGER ORDER?" (subtractive vs additive option framing: shoppers who trim down
// from a fully loaded product kept more options at a higher total option price than shoppers who build up from a base model,
// but starting full put off low-commitment shoppers; Park, Jun & MacInnis 2000), in the accepted 'Satisfying Product Theatre'
// style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-17; rules context/27 incl. §5). Made-up products.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "SAME OPTIONS. BIGGER ORDER? MORE KEPT HIGHER TOTAL EVERY TYPE PUT OFF START STEERS THEIR OWN YES Werbens")));
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
// unbranded products. Each has five option slots: a ghost disc per slot (the same menu on both sides) and a solid module when the
// option is chosen. Left = additive start (bare base); right = subtractive start (fully loaded). No text, no prices.
const HALF = Math.PI / 2, SX = [-0.06, 0.06], PLT = 0.02, CORE_H = 0.05, MH = 0.0155, MG = 0.0022, NM = 5;
const MOD_COL = ["#2A6273", "#45C9BC", "#3A8195", "#5CE0D2", "#7FE7DC"], PRICE = [1, 2, 1, 2, 1];
const stage = new THREE.Group(); scene.add(stage); const stageSh = contactShadow();
{ const g = new THREE.LatheGeometry([[0, 0], [0.126, 0], [0.13, 0.004], [0.13, 0.016], [0.126, PLT], [0, PLT]].map(([r, y]) => new THREE.Vector2(r, y)), 96);
  const m = new THREE.Mesh(g, mat(C3.ink, { roughness: 0.55, clearcoat: 0.25 })); m.castShadow = true; m.receiveShadow = true; stage.add(m); }
const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const coreCyl = lathe([[0, 0], [0.031, 0], [0.034, 0.003], [0.034, CORE_H - 0.004], [0.03, CORE_H], [0, CORE_H]]);
const coreBox = new RoundedBoxGeometry(0.062, CORE_H, 0.062, 4, 0.009); coreBox.translate(0, CORE_H / 2, 0);
const modGeo = lathe([[0, 0], [0.033, 0], [0.0362, 0.0025], [0.0362, MH - 0.0025], [0.033, MH], [0, MH]]);
const ghostGeo = lathe([[0, 0], [0.0372, 0], [0.0372, MH], [0, MH]]);
const ghostMat = new THREE.MeshPhysicalMaterial({ color: "#F0FDFA", roughness: 0.2, transparent: true, opacity: 0.1, depthWrite: false, emissive: C.mint, emissiveIntensity: 0.08 });
const ghostRingMat = new THREE.MeshBasicMaterial({ color: "#7FE7DC", transparent: true, opacity: 0.35, toneMapped: false });
const CHECK_TEX = canvasTex(128, 128, (k, w) => { k.fillStyle = "#7FE7DC"; k.beginPath(); k.arc(w / 2, w / 2, w * 0.47, 0, Math.PI * 2); k.fill(); k.strokeStyle = "#0F172A"; k.lineWidth = w * 0.11; k.lineCap = "round"; k.lineJoin = "round"; k.beginPath(); k.moveTo(w * 0.29, w * 0.52); k.lineTo(w * 0.44, w * 0.67); k.lineTo(w * 0.72, w * 0.36); k.stroke(); });
const stations = SX.map((x, s) => {
  const grp = new THREE.Group(); grp.position.x = x; stage.add(grp);
  const coreM = mat(C3.mintw, { roughness: 0.18, clearcoat: 1 });
  const cyl = new THREE.Mesh(coreCyl, coreM); cyl.position.y = PLT; cyl.castShadow = true; cyl.receiveShadow = true; grp.add(cyl);
  const box = new THREE.Mesh(coreBox, coreM); box.position.y = PLT; box.castShadow = true; box.receiveShadow = true; grp.add(box);
  const mods = MOD_COL.map((c, i) => { const m = new THREE.Mesh(modGeo, mat(c, { roughness: 0.28, clearcoat: 0.9, transparent: true, emissive: c, emissiveIntensity: 0.12 })); m.castShadow = true; m.receiveShadow = true; grp.add(m); return m; });
  const ghosts = MOD_COL.map((c, i) => { const g = new THREE.Mesh(ghostGeo, ghostMat); g.renderOrder = 3; grp.add(g);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0372, 0.0006, 6, 64), ghostRingMat); ring.rotation.x = -HALF; ring.renderOrder = 4; grp.add(ring); return { g, ring }; });
  const checks = MOD_COL.map(() => { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.016, 0.016), new THREE.MeshBasicMaterial({ map: CHECK_TEX, transparent: true, toneMapped: false })); c.renderOrder = 5; grp.add(c); return c; });
  const coins = Array.from({ length: 12 }, (_, i) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0165, 0.0058, 32), mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.15, metalness: 0.2 })); c.castShadow = true; stage.add(c); return c; });
  return { x, s, grp, cyl, box, mods, ghosts, checks, coins };
});
// shopper pawns (accepted english-16 shape, scaled): a dim "barely interested" one and a bright committed one
const pawnB = new THREE.CylinderGeometry(0.012, 0.0152, 0.032, 24), pawnH = new THREE.SphereGeometry(0.012, 24, 16);
const makePawn = (color) => { const g = new THREE.Group(); const m = mat(color, { roughness: 0.4, clearcoat: 0.4, transparent: true }); const b = new THREE.Mesh(pawnB, m); b.position.y = 0.016; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnH, m); h.position.y = 0.0416; h.castShadow = true; g.add(h); g.userData.m = m; stage.add(g); return g; };
const pawnLow = makePawn("#64748B"), pawnHi = makePawn("#EEF7F1");
const modY = (i) => PLT + CORE_H + 0.002 + i * (MH + MG);

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
const F0 = [[0.0, 0.17, 0.66], [0.0, 0.116, 0.0]], F1 = [[0.0, 0.168, 0.63], [0.0, 0.116, 0.0]];
const FW = [[0.0, 0.25, 0.8], [0.0, 0.125, 0.02]], FT = [[0.03, 0.235, 0.76], [0.004, 0.122, 0.0]];
const FR = [[0.075, 0.205, 0.63], [0.052, 0.112, 0.04]], FW2 = [[0.0, 0.24, 0.76], [0.0, 0.122, 0.02]], FR2 = [[0.058, 0.2, 0.6], [0.048, 0.116, 0.02]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.3, ...F1], [6.8, ...F1], [7.7, ...FW], [11.9, ...FW], [12.6, ...FT], [14.3, ...FT], [15.1, ...FR], [18.3, ...FR], [18.9, ...FW2], [20.6, ...FW2], [21.3, ...FR2], [26.1, ...FR2], [27.1, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ option state (presence 0..1 per module; opacity for "pending")
function presence(s, i, t) {
  if (s === 0) { let v = i < 2 ? ramp(t, ...T.addL[i], E.inOut) : 0; v *= 1 - ramp(t, ...T.reset, E.inOut);
    if (i < 2) v = Math.max(v, ramp(t, T.ends[0] + i * 0.18, T.ends[0] + i * 0.18 + 0.35, E.inOut)); return v; }
  if (i < 4) return 1;
  let v = 1 - ramp(t, ...T.trimR, E.inOut); v = Math.max(v, ramp(t, ...T.refull, E.inOut)); if (t > T.ends[0]) v = Math.min(v, 1 - ramp(t, T.ends[0] + 0.15, T.ends[1] + 0.15, E.inOut));
  v = Math.max(v, ramp(t, ...T.pending, E.inOut)); return v * (1 - ramp(t, ...T.decline, E.inOut)); }
const solidity = (s, i, t) => { if (s === 0) return 1; const pend = ramp(t, ...T.pending, E.inOut), yes = i < 4 ? ramp(t, T.yes[i], T.yes[i] + 0.2, E.out) : 0; return lerp(1, 0.32, pend * (1 - yes)); };

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  stage.position.y = -0.27 * cl; stage.visible = cl < 0.999; placeShadow(stageSh, 0, 0, 0, 0.13, 0.13, 0.8 * (1 - cl));
  const mo = ramp(t, ...T.morph, E.inOut) * (1 - ramp(t, ...T.unmorph, E.inOut));
  const glow = win(t, ...T.glowFull, 0.3, 0.5);
  stations.forEach((S) => { const side = S.s ? 1 : -1;
    S.cyl.scale.setScalar(Math.max(0.001, 1 - mo)); S.box.scale.setScalar(Math.max(0.001, mo)); S.cyl.visible = mo < 0.999; S.box.visible = mo > 0.001;
    S.mods.forEach((m, i) => { const p = presence(S.s, i, t), so = solidity(S.s, i, t);
      m.visible = p > 0.002; m.position.set(side * 0.075 * (1 - p), modY(i) + 0.012 * (1 - p), 0); m.material.opacity = Math.min(1, p * 1.4) * so; m.material.depthWrite = so > 0.9;
      m.material.emissiveIntensity = 0.12 + (S.s ? 0.25 * glow : 0); S.ghosts[i].g.position.y = modY(i); S.ghosts[i].ring.position.y = modY(i) + MH;
      const ck = S.s && i < 4 ? E.outBack(ramp(t, T.yes[i], T.yes[i] + 0.25, E.lin)) * (1 - ramp(t, T.ctaClear[0] - 0.2, T.ctaClear[0])) : 0;
      S.checks[i].visible = ck > 0.01; S.checks[i].scale.setScalar(Math.max(0.001, ck)); S.checks[i].position.set(0.05, modY(i) + MH / 2, 0.022); });
    // coins (no currency): chosen options' price units; "price levels" doubles both stacks; cleared before the limitation beat
    const base = S.s ? 6 : 3, n2 = base * 2, out = 1 - ramp(t, ...T.coinsOut, E.in);
    S.coins.forEach((c, k) => { const t0 = k < base ? T.coinsUp[0] + k * 0.07 : T.priceUp[0] + (k - base) * 0.04, u = k < n2 ? ramp(t, t0, t0 + 0.2, E.out) : 0;
      c.visible = u > 0.002 && out > 0.002; c.position.set(side * 0.095, PLT + 0.003 + k * 0.0062 * out + 0.03 * (1 - u), 0.065); c.scale.setScalar(Math.max(0.001, out)); c.rotation.y = k * 0.7; });
  });
  // shoppers: a dim, barely interested one walks up to the full product and backs away; a bright committed one stays
  { const pin = ramp(t, ...T.pawnIn, E.inOut), pout = ramp(t, ...T.pawnOut, E.inOut), vis = Math.min(ramp(t, T.pawnIn[0], T.pawnIn[0] + 0.25), 1 - pout);
    pawnLow.visible = vis > 0.01; pawnLow.userData.m.opacity = vis; pawnLow.position.set(SX[1] + 0.008, PLT, lerp(0.128, 0.088, pin) + 0.04 * pout); pawnLow.rotation.x = -0.25 * win(t, T.pawnOut[0] - 0.1, T.pawnOut[1], 0.15, 0.4);
    const ch = ramp(t, ...T.committed, E.out) * (1 - ramp(t, T.ctaClear[0] - 0.25, T.ctaClear[0])), bob = T.yes.reduce((a, y) => a + 0.004 * pulse(t, y, 0.25), 0);
    pawnHi.visible = ch > 0.01; pawnHi.userData.m.opacity = 1; pawnHi.scale.setScalar(Math.max(0.001, E.outBack(ch))); pawnHi.position.set(SX[1] + 0.008, PLT + bob, 0.09); }

  // --- lights: hero spot on the loaded (right) product; centred when both are compared
  { const both = win(t, T.toW[0], T.coinsOut[1], 0.4, 0.4) + win(t, T.reset[0] - 0.1, T.ends[1] + 0.4, 0.3, 0.4), tx = lerp(SX[1], 0, clamp(both));
    hero.intensity = 2.6 * (1 - cl); hero.position.set(tx + 0.1, 1.1, 0.55); hero.target.position.set(tx, PLT + 0.07, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lKept", T.keptLab); lab("lTotal", T.totalLab); lab("lType", T.typeLab); lab("lOff", T.offLab); lab("lStart", T.startLab); lab("lYes", T.yesLab);
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
