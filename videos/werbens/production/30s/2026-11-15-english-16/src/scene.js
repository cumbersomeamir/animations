// Werbens · 30 s English-16 — "THE OPTION YOU WON'T BUY" (the compromise effect / extremeness aversion: adding a pricier
// option makes the middle one the "sensible" choice; Simonson & Tversky 1992), in the accepted 'Satisfying Product Theatre'
// style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-15; rules context/27 incl. §5 first frame).
// Made-up plans only: no currency, no prices. Deterministic: every object, camera and HUD value is a pure function of t.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "THE OPTION YOU WON'T BUY MADE-UP PLANS MIDDLE GAINS EXTREMES LOSE REAL CUSTOMERS BASIC PLUS PREMIUM EXTREME Werbens")));
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

// ------------------------------------------------------------------ three made-up plans (illustration): pedestal height = tier;
// coin stacks = price level (no currency, no numbers); generic names. Shopper pawns show how choices spread (illustrative counts).
const HALF = Math.PI / 2, PX = [-0.115, 0, 0.115], PH = [0.07, 0.105, 0.16], PW = 0.088, NAMES = ["BASIC", "PLUS", "PREMIUM"], COINS = [1, 2, 4];
const plateTex = (txt) => canvasTex(720, 200, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 50); k.fill(); k.fillStyle = C.ink; fitText(k, txt, "IDBK", w * 0.86, 140); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.55); });
const coinGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.005, 32), coinMat = mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.15, metalness: 0.2 });
const plans = PX.map((x, k) => { const g = new THREE.Group(); scene.add(g); g.position.x = x;
  const m = k === 2 ? mat("#E4F4F1", { roughness: 0.18, clearcoat: 1, emissive: C.mint, emissiveIntensity: 0.12 }) : mat(k === 0 ? C3.ink : "#3A8195", { roughness: 0.3, clearcoat: 0.8 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(PW, PH[k], PW, 3, 0.01), m); body.position.y = PH[k] / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.0217), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: plateTex(NAMES[k]) })); plate.position.set(0, PH[k] - 0.021, PW / 2 + 0.0015) /* above the shoppers' heads */; g.add(plate);
  const coins = Array.from({ length: COINS[k] }, (_, i) => { const c = new THREE.Mesh(coinGeo, coinMat); c.position.set(0, PH[k] + 0.0025 + i * 0.0055, 0); c.rotation.y = i * 0.6; c.castShadow = true; g.add(c); return c; });
  return { g, body, m, plate, coins, sh: contactShadow() }; });
// shoppers: 12 pawns; slots in front of each plan (3 per row)
const pawnGeoB = new THREE.CylinderGeometry(0.0075, 0.0095, 0.02, 20), pawnGeoH = new THREE.SphereGeometry(0.0075, 20, 14), pawnMat = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4 });
const pawns = Array.from({ length: 12 }, () => { const g = new THREE.Group(); scene.add(g); const b = new THREE.Mesh(pawnGeoB, pawnMat); b.position.y = 0.01; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnGeoH, pawnMat); h.position.y = 0.026; h.castShadow = true; g.add(h); return g; });
const slotPos = (k, j) => [PX[k] + ((j % 3) - 1) * 0.023, 0, 0.078 + Math.floor(j / 3) * 0.025];
// states: plan per pawn (S0 = with Premium; S1 = Basic vs Plus only). Slot order inside each plan follows pawn index.
const S0 = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2], S1 = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0];
const slotsFor = (S) => { const cnt = [0, 0, 0]; return S.map((k) => slotPos(k, cnt[k]++)); };
const P0 = slotsFor(S0), P1 = slotsFor(S1);
const pawnGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(pawnGlow);
// ------------------------------------------------------------------ proof set (X2): appeal of extreme / middle / extreme options (direction only)
// bars/chips kept narrow and the camera further back so the right chip stays clear of the platform's right-hand icon rail (x ≤ 900)
const X2 = 0.46, BS = 0.068, barGeo = new RoundedBoxGeometry(0.044, 1, 0.044, 2, 0.01); barGeo.translate(0, 0.5, 0);
const apBars = [-BS, 0, BS].map((dx, i) => { const m = new THREE.Mesh(barGeo, mat(i === 1 ? C3.mint : "#3A8195", { roughness: 0.25, emissive: i === 1 ? C.mint : C.teal, emissiveIntensity: i === 1 ? 0.3 : 0.15 })); m.position.set(X2 + dx, 0, 0); m.castShadow = true; scene.add(m); return m; });
const apChips = ["EXTREME", "MIDDLE", "EXTREME"].map((txt, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.062, 0.0172), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: plateTex(txt) })); m.position.set(X2 + (i - 1) * BS, 0.004, 0.045); m.rotation.x = -HALF + 0.45; scene.add(m); return m; });
const apBase = new THREE.Mesh(new RoundedBoxGeometry(0.215, 0.01, 0.09, 2, 0.004), mat(C3.ink, { roughness: 0.3 })); apBase.position.set(X2, -0.003, 0.01); apBase.receiveShadow = true; scene.add(apBase);
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
const F0 = [[0.0, 0.21, 0.95], [0.0, 0.112, 0.03]], F1 = [[0.0, 0.205, 0.9], [0.0, 0.11, 0.03]], NB = [[0.0, 0.2, 0.82], [0.0, 0.105, 0.03]];
const BARS = [[X2, 0.185, 0.88], [X2, 0.1, 0.0]], BARS2 = [[X2, 0.185, 0.84], [X2, 0.1, 0.0]], PAY = [[0.0, 0.225, 0.93], [0.0, 0.132, 0.03]], PAY2 = [[0.0, 0.22, 0.88], [0.0, 0.13, 0.03]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.5, ...F1], [10.6, ...F1], [11.6, ...NB], [13.3, ...NB], [14.2, ...BARS], [18.5, ...BARS2], [19.6, ...PAY], [26.3, ...PAY2], [27.1, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

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

// ------------------------------------------------------------------ frame
const hopTo = (a, b, u, h = 0.03) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + h * Math.sin(Math.PI * u), lerp(a[2], b[2], u)];
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut), off = 0.8 * cl, pk = ramp(t, T.ctaClear[0] - 0.15, T.ctaClear[0] + 0.1, E.in); // Plus sinks before the tile is up
  // --- plans: Premium sinks away and returns; neighbours lean in; ripple on "reshapes"; the stage parts for the CTA
  const pOut = ramp(t, ...T.premiumOut, E.in) * (1 - ramp(t, ...T.premiumIn, E.out)), lean = win(t, T.lean[0], T.lean[1] + 0.5, 0.25, 0.3);
  plans.forEach((p, k) => { const side = k - 1, rip = 0.06 * pulse(t, T.reshape[0] + k * 0.12, 0.35) + 0.05 * pulse(t, T.alone, 0.4) * (k === 1 ? 1 : 0);
    const sq = (k === 2 ? squash(t, T.premiumIn[1], -0.12) : 0);
    p.g.position.set(PX[k] + side * off - side * 0.012 * lean, (k === 2 ? -(PH[2] + 0.06) * pOut : 0) - (k === 1 ? (PH[1] + 0.06) * pk : 0), 0); p.g.rotation.z = -side * 0.06 * lean;
    p.g.scale.set(1 - sq * 0.4, (1 + sq) * (1 + rip), 1 - sq * 0.4); p.g.visible = cl < 1 && !(k === 2 && pOut > 0.995);
    if (k === 2) p.m.emissiveIntensity = 0.12 + 0.35 * win(t, ...T.premiumGlow, 0.4, 0.5) * (THUMB ? 1 : 1);
    placeShadow(p.sh, PX[k] + side * off, 0, 0, 0.06, 0.06, p.g.visible ? 0.9 * (k === 2 ? 1 - pOut : 1) : 0); });
  // --- pawns: S0 → S1 (split) → S0 (to the middle); real customers step up onto each tier at the payoff
  const sp = ramp(t, ...T.split, E.inOut), tm = ramp(t, ...T.toMiddle, E.inOut), CUST = [0, 5, 11];
  pawns.forEach((g, i) => { const st = 0.04 * (i % 6);
    let p = P0[i];
    const u1 = ramp(t, T.split[0] + st, T.split[0] + st + 0.45, E.inOut); if (u1 > 0) p = hopTo(P0[i], P1[i], u1);
    const u2 = ramp(t, T.toMiddle[0] + st * 1.4, T.toMiddle[0] + st * 1.4 + 0.5, E.inOut); if (u2 > 0) p = hopTo(P1[i], P0[i], u2);
    const ci = CUST.indexOf(i); if (ci >= 0) { const k = S0[i], top = [PX[k], PH[k] + 0.0035 + COINS[k] * 0.0055, 0], u3 = ramp(t, T.realCust[0] + ci * 0.2, T.realCust[0] + ci * 0.2 + 0.45, E.inOut); if (u3 > 0) p = hopTo(P0[i], top, u3, 0.06); if (k === 1 && u3 > 0) p = [p[0], p[1] - (PH[1] + 0.06) * pk, p[2]]; }
    const side = Math.sign(p[0] + 1e-6) * (Math.abs(p[0]) > 0.05 ? 1 : 0), rip = 0.012 * pulse(t, T.reshape[0] + (S0[i]) * 0.12, 0.35);
    const pc = ramp(t, T.ctaClear[0] - 0.15, T.ctaClear[0] + 0.05, E.in); // shoppers clear before the tile is up (no specks under it)
    g.position.set(p[0] + side * off, p[1] + rip, p[2]); g.visible = pc < 0.98; g.scale.setScalar(Math.max(0.001, 1 - pc)); });
  { const a = ramp(t, T.realCust[0] + 0.4, T.realCust[0] + 1.0, E.out) * (1 - cl); pawnGlow.visible = a > 0.01; pawnGlow.material.opacity = 0.5 * a; pawnGlow.scale.set(0.42, 0.18, 1); pawnGlow.position.set(0, 0.16, -0.03); }
  // --- proof diagram: middle gains appeal, extremes lose it (direction only)
  { const vis = t > 12.9 && t < 19.9, mu = ramp(t, ...T.middleUp, E.out), ed = ramp(t, ...T.extremesDown, E.inOut), base = 0.094;
    apBars.forEach((m, i) => { const h = i === 1 ? base + 0.066 * mu : base - 0.038 * ed; m.scale.set(1, h, 1); m.visible = vis; });
    apChips.forEach((m) => { m.visible = vis; }); apBase.visible = vis;
    aura.visible = vis && mu > 0.01; aura.material.opacity = 0.5 * mu; aura.scale.set(0.2, 0.2, 1); aura.position.set(X2, 0.12, -0.05); }
  // --- lights: hero spot on Premium in the hook ("the option you won't buy"), on Plus as the middle choice, on the middle bar
  { const tgt = t < 6.5 ? [PX[2], 0.1, 0] : t < 13.5 ? [PX[1], 0.08, 0] : t < 19.2 ? [X2, 0.08, 0] : [0, 0.08, 0];
    hero.intensity = (t < 6.5 ? 3.2 * (1 - ramp(t, 3.4, 4.3)) : t < 13.5 ? 3 * ramp(t, T.toMiddle[0], T.toMiddle[1]) : t < 19.2 ? 3 * ramp(t, ...T.middleUp) : 2.2 * ramp(t, T.realCust[0], T.realCust[1])) * (1 - cl);
    hero.position.set(tgt[0] + 0.12, 1.2, 0.55); hero.target.position.set(...tgt); hero.target.updateMatrixWorld(); }
  // --- CTA tile (app.werbens.com logo): pops up as the stage parts
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lMade", T.madeUp); lab("lGains", T.gainsLab); lab("lLose", T.loseLab); lab("lReal", T.realLab);
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
