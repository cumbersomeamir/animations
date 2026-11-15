// Werbens · 30 s English-17 — "LESS SELLS MORE?" (the space-to-product ratio effect: more space devoted to a display makes
// products seem more valuable, more attractive and the store more prestigious; Sevilla & Townsend 2016), in the accepted
// 'Satisfying Product Theatre' style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-15; rules context/27
// incl. §5 first frame). Unbranded made-up bottle, no prices. Deterministic: every object, camera and HUD value is a pure function of t.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "LESS SELLS MORE? MORE VALUABLE MORE PRESTIGE SPACE ITSELF GIVE IT ROOM PACKED Werbens")));
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


// ------------------------------------------------------------------ one unbranded made-up bottle (illustration): mint-white body,
// teal cap, plain mint band (no text, no brand). Lathe-turned, so every copy is identical ("same bottle").
const HALF = Math.PI / 2, BR = 0.0155, BH = 0.079;
const bodyGeo = new THREE.LatheGeometry([[0, 0], [0.0142, 0], [BR, 0.0022], [BR, 0.046], [0.0149, 0.0515], [0.0125, 0.0572], [0.0082, 0.0612], [0.0064, 0.0636], [0.0064, 0.0685]].map(([r, y]) => new THREE.Vector2(r, y)), 40);
const capCyl = new THREE.CylinderGeometry(0.0079, 0.0079, 0.0135, 32);
const bandGeo = new THREE.CylinderGeometry(BR + 0.0003, BR + 0.0003, 0.012, 40, 1, true);
const clipAt = (y) => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -y)];
function bottleMats(clip, glow = 0, body = C3.mintw) {
  const o = clip ? { clippingPlanes: clip, clipShadows: true } : {};
  return { body: mat(body, { roughness: 0.16, clearcoat: 1, emissive: C.mint, emissiveIntensity: glow, ...o }), cap: mat(C3.teal, { roughness: 0.3, ...o }),
    band: mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.12, side: THREE.DoubleSide, ...o }) };
}
function bottle(m) { const g = new THREE.Group();
  const b = new THREE.Mesh(bodyGeo, m.body); b.castShadow = true; b.receiveShadow = true; g.add(b);
  const c = new THREE.Mesh(capCyl, m.cap); c.position.y = 0.0685 + 0.0062; c.castShadow = true; g.add(c);
  const s = new THREE.Mesh(bandGeo, m.band); s.position.y = 0.027; g.add(s);
  scene.add(g); return g; }
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ------------------------------------------------------------------ set A: a two-shelf display unit at x = 0 (illustration).
// Bottom shelf top YB, top shelf top YT. Frame 0: both shelves crammed (front row 9, back row 8); the bottom-front centre bottle
// is the lit "hero". Crowd bottles sink into their shelf (clipped at the shelf top), so the empty space is real, not a fade.
const YB = 0.04, YT = 0.157, UW = 0.33, UD = 0.085, UZ = -0.004;
const unit = new THREE.Group(); scene.add(unit);
{ const inkM = mat(C3.ink, { roughness: 0.38, clearcoat: 0.6 }), panelM = mat("#24586A", { roughness: 0.42, clearcoat: 0.4 });
  const panel = new THREE.Mesh(new RoundedBoxGeometry(UW + 0.018, 0.272, 0.012, 3, 0.004), panelM); panel.position.set(0, 0.136, UZ - UD / 2 - 0.006); panel.receiveShadow = true; unit.add(panel);
  const base = new THREE.Mesh(new RoundedBoxGeometry(UW + 0.018, YB, UD + 0.004, 3, 0.004), inkM); base.position.set(0, YB / 2, UZ); base.castShadow = true; base.receiveShadow = true; unit.add(base);
  const board = new THREE.Mesh(new RoundedBoxGeometry(UW, 0.009, UD, 2, 0.003), inkM); board.position.set(0, YT - 0.0045, UZ); board.castShadow = true; board.receiveShadow = true; unit.add(board);
  for (const s of [-1, 1]) { const side = new THREE.Mesh(new RoundedBoxGeometry(0.009, 0.272, UD + 0.004, 2, 0.003), inkM); side.position.set(s * (UW / 2 + 0.0045), 0.136, UZ); side.castShadow = true; side.receiveShadow = true; unit.add(side); } }
const unitSh = contactShadow();
// the crowd sits in the unit's shade (slightly greyer body); the hero is the one in the light
const matsB = bottleMats(clipAt(YB), 0, "#CFDEDC"), matsT = bottleMats(clipAt(YT), 0, "#CFDEDC"), heroM = bottleMats(null, 0.06);
const ROWF = Array.from({ length: 9 }, (_, i) => (i - 4) * 0.0325), ROWB = Array.from({ length: 8 }, (_, i) => (i - 3.5) * 0.0325);
const ZF = 0.016, ZB = -0.019;
// crowd: { g, shelf (0 bottom / 1 top), x, z, jitter, tilt, delay }
const crowd = [];
for (const [s, Y, M] of [[0, YB, matsB], [1, YT, matsT]]) for (const [row, xs, z] of [[0, ROWF, ZF], [1, ROWB, ZB]]) xs.forEach((x, i) => {
  if (s === 0 && row === 0 && i === 4) return; // the hero
  const n = crowd.length, u = 1 - Math.abs(x) / 0.135;
  crowd.push({ g: bottle(M), s, Y, row, i, x, z, jx: (hash(n) - 0.5) * 0.005, tilt: (hash(n + 50) - 0.5) * 0.1, delay: T.collapse[0] + 1.45 * u - row * 0.08 + s * 0.04 }); });
const heroB = bottle(heroM);
// top-shelf front row returns in the payoff; three of them (x −0.065, 0, +0.065) stay and spread out on "space around each"
const KEEP = [2, 4, 6], SPREAD_X = { 2: -0.1, 4: 0, 6: 0.1 };
const heroGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(heroGlow);
const poolMat = () => new THREE.MeshBasicMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, toneMapped: false });
const heroPool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), poolMat()); heroPool.rotation.x = -HALF; heroPool.renderOrder = 2; scene.add(heroPool);
const topPools = KEEP.map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), poolMat()); m.rotation.x = -HALF; m.renderOrder = 2; scene.add(m); return m; });

// ------------------------------------------------------------------ set B (X2): two display plinths, same bottle, same count (3 vs 3).
// Left = packed tight on a small plinth; right = given room on a wide plinth. Value columns (direction only), glints, store arch.
const X2 = 0.5, LX = X2 - 0.085, RX = X2 + 0.085, R0 = 0.048, R1 = 0.072, PLH = 0.03;
const plateTex = (txt) => canvasTex(720, 200, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 50); k.fill(); k.fillStyle = C.ink; fitText(k, txt, "IDBK", w * 0.86, 140); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.55); });
const plinthGeo = new THREE.LatheGeometry([[0, 0], [0.96, 0], [1, 0.12], [1, 0.88], [0.96, 1], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y * PLH)), 64);
const plinths = [[LX, R0, "PACKED"], [RX, R1, "ROOM"]].map(([x, r, txt]) => { const m = new THREE.Mesh(plinthGeo, mat(C3.ink, { roughness: 0.36, clearcoat: 0.7 })); m.position.set(x, 0, 0); m.scale.set(r, 1, r); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.0161), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: plateTex(txt) })); scene.add(chip);
  return { m, chip, x, sh: contactShadow() }; });
const matsS = bottleMats(null);
const BOFF = [[-0.0312, 0, 0.0312], [-0.05, 0, 0.05]], ORDER = [1, 0, 2]; // centre bottle first ("same bottle"), then the outer two
const dispB = [0, 1].map((d) => [0, 1, 2].map((k) => ({ g: bottle(matsS), d, k, tilt: d === 0 ? [0.11, -0.07, 0.09][k] : 0, dz: d === 0 ? [0.007, -0.006, 0.004][k] : 0 })));
const colGeo = new THREE.CylinderGeometry(0.024, 0.024, 1, 40); colGeo.translate(0, 0.5, 0);
const cols = [LX, RX].map((x, i) => { const m = new THREE.Mesh(colGeo, mat(i ? C3.mint : "#3A8195", { roughness: 0.25, emissive: i ? C.mint : C.teal, emissiveIntensity: i ? 0.32 : 0.16 })); m.position.set(x, 0, -0.085); m.castShadow = true; scene.add(m); return m; });
const STAR_TEX = canvasTex(128, 128, (k, w) => { const c = w / 2; const g = k.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(200,255,248,0.6)"); g.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = g;
  k.beginPath(); for (let a = 0; a < 8; a++) { const r = a % 2 ? 0.1 * c : c, an = (a * Math.PI) / 4; k.lineTo(c + r * Math.cos(an), c + r * Math.sin(an)); } k.closePath(); k.fill(); });
const glints = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: STAR_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(s); return s; });
// store arch (prestige): a rounded-top shop-window frame that rises behind the roomy display, with a soft backlight
const arch = new THREE.Group(); scene.add(arch);
{ const AW = 0.21, AS = 0.115, ri = 0.084; const ro = AW / 2;
  const sh = new THREE.Shape(); sh.moveTo(-ro, 0); sh.lineTo(-ro, AS); sh.absarc(0, AS, ro, Math.PI, 0, true); sh.lineTo(ro, 0); sh.lineTo(-ro, 0);
  const hole = new THREE.Path(); hole.moveTo(-ri, 0); hole.lineTo(ri, 0); hole.lineTo(ri, AS); hole.absarc(0, AS, ri, 0, Math.PI, false); hole.lineTo(-ri, 0); sh.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3, curveSegments: 48 });
  const frameM = new THREE.Mesh(g, mat(C3.mintw, { roughness: 0.22, clearcoat: 1, emissive: C.mint, emissiveIntensity: 0.06 })); frameM.castShadow = true; frameM.receiveShadow = true; arch.add(frameM);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2 * ri, AS + ri), new THREE.MeshBasicMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.0, toneMapped: false })); back.position.set(0, (AS + ri) / 2, -0.002); arch.add(back); arch.userData.back = back; }
arch.position.set(RX, -0.4, -0.13);
const archSh = contactShadow();

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
const F0 = [[0.0, 0.29, 1.12], [0.0, 0.2, 0.0]], F1 = [[0.0, 0.27, 1.03], [0.0, 0.186, 0.0]];
const BC = [[X2 + 0.008, 0.19, 0.96], [X2 + 0.008, 0.1, 0.0]], BC2 = [[X2 + 0.008, 0.188, 0.93], [X2 + 0.008, 0.1, 0.0]], BW = [[X2, 0.25, 1.04], [X2, 0.158, 0.0]], BW2 = [[X2, 0.246, 1.0], [X2, 0.155, 0.0]], BL = [[X2 + 0.004, 0.242, 1.0], [X2 + 0.004, 0.152, 0.0]];
const A2 = [[0.0, 0.285, 1.1], [0.0, 0.197, 0.0]], A3 = [[0.0, 0.275, 1.03], [0.0, 0.19, 0.0]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.35, ...F1], [4.25, ...BC], [10.2, ...BC2], [11.0, ...BW], [15.0, ...BW2], [15.6, ...BL], [T.toA[0], ...BL], [T.toA[1], ...A2], [26.1, ...A3], [27.1, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ frame
const cTeal = new THREE.Color("#3A8195"), cMint = new THREE.Color(C3.mint), eTeal = new THREE.Color(C.teal), eMint = new THREE.Color(C.mint);
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut), bs = 1 - ramp(t, T.ctaClear[0] - 0.05, T.ctaClear[0] + 0.15, E.in); // bottles clear first
  const setB = t > 3.0 && t < 19.8;

  // --- set A: the crowd sinks into the shelves (hook); the top-front row returns (payoff); six sink, three spread ("fewer items")
  unit.position.y = -0.34 * cl; unit.visible = cl < 0.999; placeShadow(unitSh, 0, UZ, 0, 0.17, 0.05, 0.9 * (1 - cl));
  const back = ramp(t, ...T.crowdBack, E.out), spT = ramp(t, ...T.spreadTop, E.inOut);
  crowd.forEach((c) => {
    let s = ramp(t, c.delay, c.delay + 0.34, E.in), x = c.x + c.jx, tilt = c.tilt;
    if (c.s === 1 && c.row === 0) {
      s = s * (1 - back);
      if (KEEP.includes(c.i)) { x = lerp(c.x + c.jx, SPREAD_X[c.i], spT); tilt = c.tilt * (1 - spT); }
      else { const o = [0, 1, null, 2, null, 2, null, 1, 0][c.i]; s = Math.max(s, ramp(t, T.fewer[0] + o * 0.1, T.fewer[0] + o * 0.1 + 0.32, E.in)); }
    }
    c.g.visible = s < 0.995 && bs > 0.001; c.g.position.set(x, c.Y - (BH + 0.004) * s + unit.position.y, c.z); c.g.rotation.z = tilt; c.g.scale.setScalar(Math.max(0.001, bs)); });
  heroB.position.set(0, YB + unit.position.y, ZF + 0.01); heroB.scale.setScalar(Math.max(0.001, bs)); heroB.visible = bs > 0.001;
  const up = ramp(t, ...T.heroUp, E.inOut), lg = ramp(t, ...T.lessGlow, E.inOut), st = ramp(t, ...T.settle, E.inOut), rm = pulse(t, T.heroRoom[0], 0.55);
  heroM.body.emissiveIntensity = 0.07 + (0.3 + 0.04 * up) * (1 - ramp(t, 3.4, 4.2)) + 0.08 * lg - 0.03 * st;
  { const a = (0.6 + 0.2 * up) * (1 - ramp(t, 3.5, 4.2)) + ((0.5 + 0.25 * lg - 0.1 * st) * ramp(t, T.toA[0] + 0.3, T.toA[1])) * (1 - cl); heroGlow.visible = a > 0.01; heroGlow.material.opacity = a; const s = 0.15 + 0.05 * up + 0.07 * lg - 0.03 * st; heroGlow.scale.set(s, s * 1.1, 1); heroGlow.position.set(0, YB + 0.045, -0.035); }
  { const r = 0.045 + 0.015 * up + 0.075 * lg - 0.035 * st + 0.015 * rm, a = (0.6 + 0.25 * lg - 0.1 * st) * (t < 4 ? 1 - ramp(t, 3.5, 4.0) : ramp(t, T.toA[0] + 0.3, T.toA[1])) * (1 - cl);
    heroPool.visible = a > 0.01; heroPool.material.opacity = a; heroPool.position.set(0, YB + 0.0008 + unit.position.y, ZF - 0.004); heroPool.scale.set(r * 3.2, Math.min(r * 3.2, 0.12), 1); }
  topPools.forEach((m, j) => { const i = KEEP[j], a = 0.55 * ramp(t, T.pools[0] + j * 0.12, T.pools[0] + j * 0.12 + 0.4) * (1 - cl); m.visible = a > 0.01; m.material.opacity = a; m.position.set(lerp(ROWF[i], SPREAD_X[i], spT), YT + 0.0008 + unit.position.y, ZF - 0.004); m.scale.set(0.15, 0.11, 1); });

  // --- set B: same bottle on two plinths; values rise; glints; store arch; then the packed display gets the same space
  const spB = ramp(t, ...T.spread, E.inOut), td = E.outBack(ramp(t, ...T.tidy, E.lin)), rL = lerp(R0, R1, spB);
  plinths.forEach((p, d) => { const r = d ? R1 : rL; p.m.visible = setB; p.m.scale.set(r, 1, r); placeShadow(p.sh, p.x, 0, 0, r * 0.75, r * 0.75, setB ? 1 : 0);
    const a0 = d ? T.room[0] : T.packed[0], op = (setB ? 1 : 0) * ramp(t, a0, a0 + 0.2, E.out2) * (d ? 1 : 1 - ramp(t, T.spread[0], T.spread[0] + 0.35));
    p.chip.visible = op > 0.01; p.chip.material.opacity = op; p.chip.position.set(p.x, PLH * 0.5, r + 0.0018); p.chip.scale.setScalar(0.85 + 0.15 * Math.min(1, pop(t, a0, 0.3))); });
  dispB.forEach((row, d) => row.forEach((b) => {
    const j = ORDER.indexOf(b.k), a = j === 0 ? T.same[0] + d * 0.05 : (d ? T.room[0] + 0.1 + (j - 1) * 0.12 : T.packed[0] + 0.05 + (j - 1) * 0.09);
    const u = ramp(t, a, a + 0.3, E.out), x = d ? RX + BOFF[1][b.k] : LX + lerp(BOFF[0][b.k], BOFF[1][b.k], spB), hop = 0.016 * pulse(t, T.count[0] + b.k * 0.16, 0.2);
    b.g.visible = setB && t >= a; b.g.position.set(x, PLH + 0.05 * (1 - u) * (1 - u) + hop, b.dz * (1 - td)); b.g.rotation.z = b.tilt * (1 - td); b.g.scale.setScalar(Math.max(0.001, Math.min(1, (t - a) / 0.09))); }));
  { const cu = ramp(t, ...T.cols, E.out), cm = ramp(t, T.spread[0] + 0.13, T.spread[1] + 0.15, E.inOut);
    cols[0].scale.set(1, Math.max(0.001, 0.13 * cu + 0.05 * cm), 1); cols[1].scale.set(1, Math.max(0.001, 0.18 * cu), 1);
    cols.forEach((m) => { m.visible = setB && cu > 0.005; });
    cols[0].material.color.lerpColors(cTeal, cMint, cm); cols[0].material.emissive.lerpColors(eTeal, eMint, cm); cols[0].material.emissiveIntensity = lerp(0.16, 0.32, cm); }
  glints.forEach((g, k) => { const p = pulse(t, T.glint[0] + k * 0.18, 0.42); g.visible = setB && p > 0.01; g.material.opacity = p; const s = 0.03 + 0.02 * p; g.scale.set(s, s, 1); g.position.set(RX + BOFF[1][k] + 0.007, PLH + 0.057, 0.013); });
  { const au = ramp(t, ...T.arch, E.lin), ay = -0.4 * (1 - E.outBack(au)); arch.visible = setB && au > 0; arch.position.y = ay; arch.userData.back.material.opacity = 0.32 * ramp(t, T.arch[1] - 0.1, T.arch[1] + 0.45);
    placeShadow(archSh, RX, -0.12, 0, 0.11, 0.03, setB ? ramp(t, T.arch[1] - 0.2, T.arch[1]) : 0); }

  // --- lights: hero spot on the lone bottle (hook, payoff), on the roomy display (proof); second spot on the widened display
  { const onA1 = t < 4.0, onA2 = t >= T.toA[0] + 0.3;
    const tgt = onA1 || onA2 ? [0, YB + 0.03, ZF] : [RX, PLH + 0.03, 0];
    hero.intensity = (onA1 ? (6.5 + 0.5 * up) * (1 - ramp(t, 3.4, 4.0)) : onA2 ? (3.0 + 0.8 * lg - 0.4 * st) * ramp(t, T.toA[0] + 0.3, T.toA[1]) : 2.6 * ramp(t, T.room[0], T.room[1] + 0.3) * (1 - ramp(t, T.toA[0], T.toA[0] + 0.3))) * (1 - cl);
    hero.position.set(tgt[0] + 0.1, 1.2, 0.6); hero.target.position.set(...tgt); hero.target.updateMatrixWorld();
    heroC.intensity = setB ? 2.6 * ramp(t, T.spread[0], T.spread[1]) * (1 - ramp(t, T.toA[0], T.toA[0] + 0.3)) : 0; heroC.position.set(LX + 0.1, 1.2, 0.6); heroC.target.position.set(LX, PLH + 0.03, 0); heroC.target.updateMatrixWorld(); }

  // --- CTA tile (app.werbens.com logo): pops up as the shelf unit sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lVal", T.valLab); lab("lPres", T.presLab); lab("lSpace", T.spaceLab); lab("lRoom", T.roomLab);
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
