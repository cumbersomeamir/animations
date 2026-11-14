// Werbens · 30 s English-14 — "£2.30 or £2.80: which mayo is the better buy?" (unit pricing and the unit effect: the same
// prices per item vs per 100 g, CMA grocery unit-pricing analysis (snapshot 9 May 2023); Pandelaere, Briers & Lembregts 2011),
// in the accepted 'Satisfying Product Theatre' style (same renderer, motion grammar, caption treatment and CTA tile as
// english-06…13) on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-14; rules context/27).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "£2.30 £2.80 107p 52p per 100 g 215 g 540 g ABOUT 2× SAME UNIT kcal kJ CHEAPER? CHECK THE UNIT. Werbens")));
const WJ = await (await fetch("/src/words.json")).json();
// brand tokens measured on app.werbens.com (context/17, re-checked 2026-11-14); C3 = lit 3D bases (pre-compensated for ACES
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

// ------------------------------------------------------------------ the two bottles (same brand, same shop; 215 g and 540 g —
// geometrically honest: linear size ∝ ∛weight, 540/215 → ×1.36). Generic squeeze bottles in Werbens colours (no brand shown).
const HALF = Math.PI / 2, XS = -0.08, XB = 0.08;
function bottleGeo(H, R) { const pts = [[0, 0], [0.86 * R, 0], [R, 0.05 * H], [R, 0.74 * H], [0.9 * R, 0.84 * H], [0.6 * R, 0.91 * H], [0.42 * R, 0.94 * H], [0.42 * R, 0.96 * H], [0, 0.96 * H]];
  return new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 64); }
function weightTex(txt) { return canvasTex(1536, 384, (k, w, h) => { k.fillStyle = C.teal; k.fillRect(0, 0, w, h); k.fillStyle = C.mint; k.fillRect(0, 18, w, 14); k.fillRect(0, h - 32, w, 14);
  k.fillStyle = C.mintw; fitText(k, txt, "IDBK", w * 0.2, 190); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.54); }); }
function makeBottle(H, R, wtxt) { const g = new THREE.Group(); scene.add(g);
  const body = new THREE.Mesh(bottleGeo(H, R), mat("#EEF7F1", { roughness: 0.3, clearcoat: 1 })); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.0012, R + 0.0012, 0.36 * H, 72, 1, true), mat("#D6D6D6", { map: weightTex(wtxt), roughness: 0.3, clearcoat: 1 })); band.position.y = 0.42 * H; band.rotation.y = Math.PI; g.add(band);
  const capM = mat(C3.teal, { roughness: 0.3 }); const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.47 * R, 0.5 * R, 0.1 * H, 40), capM); cap.position.y = 1.01 * H; cap.castShadow = true; g.add(cap);
  return { g, H, R, capM, sh: contactShadow() }; }
const btS = makeBottle(0.15, 0.033, "215 g"), btB = makeBottle(0.15 * 1.36, 0.033 * 1.36, "540 g");
// price tags on price columns: face A = pack price, face B = price per 100 g; at the payoff face A becomes a clear shelf label
function tagTex(big, small, shelf = false) { return canvasTex(1024, 680, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 70); k.fill();
  k.textAlign = "center"; k.textBaseline = "middle";
  if (!shelf) { k.fillStyle = C.ink; fitText(k, big, "IDBK", w * 0.84, 330); k.fillText(big, w / 2, h * 0.42); k.fillStyle = C.teal; fitText(k, small, "IB", w * 0.8, 140); k.fillText(small, w / 2, h * 0.8); }
  else { k.fillStyle = C.ink; fitText(k, big, "IDBK", w * 0.8, 270); k.fillText(big, w / 2, h * 0.34); k.fillStyle = C.teal; k.beginPath(); k.roundRect(40, h * 0.6, w - 80, h * 0.32, 40); k.fill(); k.fillStyle = C.mintw; fitText(k, small, "IDBK", w * 0.78, 150); k.fillText(small, w / 2, h * 0.765); } }); }
const TAG_W = 0.1, TAG_H = TAG_W * 680 / 1024, TAG_Z = 0.1;
function makeTag(a, b, shelf) { const g = new THREE.Group(); scene.add(g); const card = new THREE.Group(); g.add(card);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(TAG_W, TAG_H, 0.005, 2, 0.002), mat("#E7F2F0", { roughness: 0.4 })); slab.castShadow = true; card.add(slab);
  const fa = new THREE.Mesh(new THREE.PlaneGeometry(TAG_W - 0.002, TAG_H - 0.002), new THREE.MeshBasicMaterial({ map: tagTex(...a), toneMapped: false, transparent: true })); fa.position.z = 0.0027; card.add(fa);
  const fb = new THREE.Mesh(new THREE.PlaneGeometry(TAG_W - 0.002, TAG_H - 0.002), new THREE.MeshBasicMaterial({ map: tagTex(...b), toneMapped: false, transparent: true })); fb.position.z = -0.0027; fb.rotation.y = Math.PI; card.add(fb);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 1, 24), mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.3 })); col.castShadow = true; g.add(col);
  return { g, card, fa, fb, col, shelfTex: tagTex(...shelf, true), sh: contactShadow() }; }
const tagS = makeTag(["£2.30", "215 g"], ["107p", "per 100 g"], ["£2.30", "107p per 100 g"]), tagB = makeTag(["£2.80", "540 g"], ["52p", "per 100 g"], ["£2.80", "52p per 100 g"]);
const KP = 0.03, KU = 0.0011; // column height per £ of pack price, per penny of price per 100 g (two different units)
function setTag(tg, t, x, { show, hPack, hUnit, readT }) {
  const s = Math.max(0.001, pop(t, show, 0.3)), rise = ramp(t, show, show + 0.35, E.out), resc = ramp(t, ...T.rescale, E.inOut);
  const h = lerp(hPack, hUnit, resc) * rise + 0.001, pr = 0.07 * pulse(t, readT, 0.4);
  tg.g.visible = t >= show; tg.g.position.set(x, 0, TAG_Z);
  tg.col.scale.set(1, h, 1); tg.col.position.y = h / 2;
  tg.card.position.y = h + TAG_H / 2 + 0.004; tg.card.scale.setScalar(s * (1 + pr));
  const fl = ramp(t, ...T.flip, E.inOut), sf = ramp(t, ...T.shelf, E.inOut); tg.card.rotation.y = Math.PI * fl + Math.PI * sf;
  if (t >= 20 && tg.fa.material.map !== tg.shelfTex) { tg.fa.material.map = tg.shelfTex; tg.fa.material.needsUpdate = true; }
  if (t < 20 && tg.fa.material.map === tg.shelfTex) { tg.fa.material.map = tg.faTexA; tg.fa.material.needsUpdate = true; }
  placeShadow(tg.sh, x, TAG_Z, 0, 0.025, 0.025, tg.g.visible ? 0.8 : 0); }
tagS.faTexA = tagS.fa.material.map; tagB.faTexA = tagB.fa.material.map;
// ------------------------------------------------------------------ proof set (X2): the price card (number vs unit), then two snack bars with energy gauges
const X2 = 0.5;
const priceCard = new THREE.Group(); scene.add(priceCard);
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.12, 0.008, 2, 0.004), mat("#E7F2F0", { roughness: 0.4 })); slab.castShadow = true; priceCard.add(slab); }
const numPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.075), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(800, 600, (k, w, h) => { k.fillStyle = C.ink; fitText(k, "52p", "IDBK", w * 0.95, 460); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("52p", w / 2, h * 0.55); }) }));
numPlane.position.set(-0.045, 0.008, 0.0045); priceCard.add(numPlane);
const unitPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.045), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(750, 450, (k, w, h) => { k.fillStyle = C.teal; fitText(k, "per", "IB", w * 0.9, 170); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("per", w / 2, h * 0.3); fitText(k, "100 g", "IDBK", w * 0.9, 190); k.fillText("100 g", w / 2, h * 0.72); }) }));
unitPlane.position.set(0.068, 0.0, 0.0045); priceCard.add(unitPlane); const cardSh = contactShadow();
function makeSnack(wrap, band) { const g = new THREE.Group(); scene.add(g);
  const bar = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.026, 0.045, 3, 0.008), mat(wrap, { roughness: 0.3 })); bar.position.y = 0.013; bar.castShadow = true; g.add(bar);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.0272, 0.0462), mat(band, { roughness: 0.35 })); b2.position.y = 0.013; g.add(b2); return { g, sh: contactShadow() }; }
const snackH = makeSnack(C3.mint, C3.mintw), snackO = makeSnack(C3.ink, C3.teal); // healthy (lower energy) / other — illustration
const SX = [X2 - 0.075, X2 + 0.075], KCAL = [0.026, 0.04], KJ = 4.184; // gauge heights ∝ energy in the displayed unit (illustrative values)
const gaugeMat = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.25, transparent: true, opacity: 0.9 });
const gauges = SX.map((x) => { const m = new THREE.Mesh(new RoundedBoxGeometry(0.03, 1, 0.03, 2, 0.008), gaugeMat); m.castShadow = true; scene.add(m); return m; });
const unitChip = (txt) => canvasTex(512, 256, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 60); k.fill(); k.fillStyle = C.ink; fitText(k, txt, "IDBK", w * 0.8, 170); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.55); });
const TX_KCAL = unitChip("kcal"), TX_KJ = unitChip("kJ");
const chips = SX.map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.025), new THREE.MeshBasicMaterial({ map: TX_KCAL, toneMapped: false, transparent: true })); scene.add(m); return m; });
const plH = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.074, 0.035, 48), mat(C3.ink, { roughness: 0.25, clearcoat: 1 })); plH.castShadow = true; plH.receiveShadow = true; scene.add(plH);
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
const HOOKA = [[0, 0.2, 0.95], [0, 0.11, 0.05]], HOOKB = [[0, 0.2, 0.9], [0, 0.11, 0.05]], REV = [[0, 0.21, 0.86], [0, 0.115, 0.05]];
const CARD = [[X2, 0.16, 0.8], [X2, 0.105, 0.0]], SNACK = [[X2, 0.24, 0.86], [X2, 0.115, 0.0]], SNACK2 = [[X2, 0.24, 0.84], [X2, 0.115, 0.0]];
const PAY = [[0, 0.2, 0.9], [0, 0.132, 0.05]], PAY2 = [[0, 0.2, 0.86], [0, 0.132, 0.05]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...HOOKA], [3.5, ...HOOKB], [6.1, ...REV], [11.35, ...REV], [12.15, ...CARD], [14.7, ...CARD], [15.4, ...SNACK], [19.5, ...SNACK2], [20.5, ...PAY], [25.75, ...PAY2], [26.6, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(0, 0.19, 0.98), tgt: v3(0, 0.125, 0.05) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

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
  const cl = ramp(t, ...T.ctaClear, E.inOut), off = 0.7 * cl;
  // --- bottles (land on frame 0; caps glint on "Same brand")
  for (const [b, x, d, side] of [[btS, XS, T.dropS, -1], [btB, XB, T.dropL, 1]]) {
    const y = drop(t, d, 0.3), sq = squash(t, d[1], -0.18) + 0.05 * pulse(t, b === btS ? T.read107 : T.read52, 0.35);
    b.g.visible = t > d[0] && cl < 1; b.g.position.set(x + side * off, y, 0); b.g.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4);
    b.capM.emissive.set(C.mint); b.capM.emissiveIntensity = 0.5 * pulse(t, T.same, 0.45);
    placeShadow(b.sh, x + side * off, 0, y, b.R * 1.4, b.R * 1.4, b.g.visible ? 1 : 0); }
  // --- price tags on price columns (pack price → price per 100 g → clear shelf label)
  setTag(tagS, t, XS - off, { show: T.tagS, hPack: 2.3 * KP, hUnit: 107 * KU, readT: T.read107 });
  setTag(tagB, t, XB + off, { show: T.tagL, hPack: 2.8 * KP, hUnit: 52 * KU, readT: T.read52 });
  tagS.g.visible = tagS.g.visible && cl < 1; tagB.g.visible = tagB.g.visible && cl < 1;
  // --- the price card: the number grows, the unit fades ("we focus on the number, not the unit")
  { const vis = t > T.toCard[0] - 0.3 && t < T.cardOut[1], up = ramp(t, ...T.numUp, E.outBack), dim = ramp(t, ...T.unitDim, E.inOut), out = ramp(t, ...T.cardOut, E.in);
    priceCard.visible = vis; priceCard.position.set(X2 + 0.45 * out, 0.1, -0.1 * out); // exits sideways (never through the caption band) priceCard.rotation.x = -0.12;
    numPlane.scale.setScalar(1 + 0.28 * up); numPlane.position.x = -0.045 - 0.008 * up;
    unitPlane.scale.setScalar(1 - 0.3 * dim); unitPlane.material.opacity = 1 - 0.75 * dim; unitPlane.position.x = 0.068 + 0.008 * up;
    placeShadow(cardSh, X2 + 0.45 * out, -0.1 * out, 0.06, 0.12, 0.03, vis ? 0.5 : 0); }
  // --- snack bars + energy gauges: kcal → kJ (×4.184, the gap widens); the healthy bar is chosen (plinth + light)
  { const ins = ramp(t, ...T.snacks, E.out), vis = t > T.snacks[0] && t < 21.2, kj = ramp(t, ...T.kj, E.inOut), ch = ramp(t, ...T.chosen, E.out);
    [snackH, snackO].forEach((s, i) => { const x = SX[i] - 0.45 * (1 - ins), y = (i === 0 ? 0.035 * ch : 0) /* slide in from the left as the price card slides out right */, sq = squash(t, T.snacks[1], -0.12) + (i === 0 ? squash(t, T.chosen[1], -0.1) : 0);
      s.g.visible = vis; s.g.position.set(x, y, 0.04); s.g.scale.set(1 - sq * 0.3, 1 + sq, 1 - sq * 0.3); s.g.rotation.y = -0.25;
      placeShadow(s.sh, x, 0.04, y, 0.07, 0.04, vis ? 1 : 0);
      const h = KCAL[i] * lerp(1, KJ, kj) * ins + 0.001, gy = i === 0 ? 0.035 * ch : 0; gauges[i].visible = vis; gauges[i].scale.set(1, h, 1); gauges[i].position.set(x, gy + h / 2, -0.04);
      chips[i].visible = vis && ins > 0.5; chips[i].position.set(x, gy + h + 0.022, -0.04); const sw = Math.abs(Math.cos(Math.PI * kj)); chips[i].scale.set(Math.max(0.02, sw), 1, 1);
      const want = kj > 0.5 ? TX_KJ : TX_KCAL; if (chips[i].material.map !== want) { chips[i].material.map = want; chips[i].material.needsUpdate = true; } });
    plH.visible = vis && ch > 0.001; plH.position.set(SX[0], -0.0175 + 0.035 * ch, 0.04);
    aura.visible = vis && ch > 0.01; aura.material.opacity = 0.6 * ch * (1 - ramp(t, 20.4, 21.1)); aura.scale.set(0.3, 0.3, 1); aura.position.set(SX[0], 0.07, -0.08); }
  // --- lights: hero spot on the chosen healthy snack
  { const on = ramp(t, ...T.chosen, E.out) * (1 - ramp(t, 20.4, 21.1)); hero.intensity = 2.5 * on; hero.position.set(SX[0] + 0.15, 1.25, 0.6); hero.target.position.set(SX[0], 0.04, 0); hero.target.updateMatrixWorld(); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu)); // pops up between the parting bottles; never reaches the caption band
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: one big brief label at a time
  const lab = (id, w, y = 640) => hudAt($(id), [540, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lDouble", T.double); lab("lSame", T.sameUnit, 632);
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
