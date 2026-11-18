// Werbens · 30 s English-21 — "FREE BEATS BETTER?" (the zero-price effect: with the price gap held constant, making the cheaper
// option free sharply shifted choice to it and away from the better one, as if free added value; the bounce is strongest for
// hedonic treats; Shampanier, Mazar & Ariely 2007; Hossain & Saini 2015), in the accepted 'Satisfying Product Theatre' style on
// the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-18). Unbranded props; coins are price units, no currency.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "FREE BEATS BETTER? ONE COIN APART SAME GAP FREE WINS ADDS VALUE BEST ON TREATS FREE FOR TREATS Werbens")));
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

// ------------------------------------------------------------------ props (illustration): unbranded ice-cream cups, bumpy scoops,
// coin price stacks on small tag blocks (coins = price units, no currency), FREE chips, shopper pawns. Palette from app.werbens.com.
const HALF = Math.PI / 2, PLT = 0.02, COIN_H = 0.0052;
const plateTex = (txt) => canvasTex(720, 260, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 70); k.fill(); k.fillStyle = C.ink; fitText(k, txt, "IDBK", w * 0.8, 190); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.56); });
const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const scoopGeo = (() => { const g = new THREE.SphereGeometry(1, 48, 32); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
  const n = 1 + 0.045 * Math.sin(7 * x + 3 * z) * Math.cos(6 * y + 2 * x) + 0.03 * Math.sin(13 * z + 5 * y) - (y < -0.35 ? 0.18 * (-0.35 - y) : 0); p.setXYZ(i, x * n, y * n * 0.9, z * n); } g.computeVertexNormals(); return g; })();
const cupGeo = (h, r0, r1) => lathe([[0, 0], [r0, 0], [r0 + 0.002, 0.003], [r1, h], [r1 - 0.0025, h], [r0 - 0.001, 0.005], [0, 0.005]]);
const cupMat = () => mat(C3.mintw, { roughness: 0.2, clearcoat: 1, emissive: C.mint, emissiveIntensity: 0 });
const bandMat = mat(C3.teal, { roughness: 0.3 });
function makeCup(parent, { h, r0, r1, scoops }) { const g = new THREE.Group(); parent.add(g);
  const cm = cupMat(), cup = new THREE.Mesh(cupGeo(h, r0, r1), cm); cup.castShadow = true; cup.receiveShadow = true; g.add(cup);
  const band = new THREE.Mesh(lathe([[r0 + 0.0012 + (r1 - r0) * 0.45, h * 0.45], [r0 + 0.0012 + (r1 - r0) * 0.62, h * 0.62]]), bandMat); g.add(band);
  const sc = scoops.map(([col, r, dx, dy, dz]) => { const m = new THREE.Mesh(scoopGeo, mat(col, { roughness: 0.55, clearcoat: 0.25, emissive: col, emissiveIntensity: 0.06 })); m.scale.setScalar(r); m.position.set(dx, h + dy, dz); m.castShadow = true; g.add(m); return m; });
  return { g, cup, cm, sc }; }
// tag block + coin stack + FREE chip
const coinGeo = new THREE.CylinderGeometry(0.0125, 0.0125, COIN_H, 40).rotateX(HALF), coinMat = () => mat(C3.mint, { roughness: 0.28, emissive: C.mint, emissiveIntensity: 0.15, metalness: 0.2 });
function makeTag(parent, x, z) { const g = new THREE.Group(); g.position.set(x, PLT, z); parent.add(g);
  const block = new THREE.Mesh(new RoundedBoxGeometry(0.064, 0.012, 0.024, 2, 0.003), mat(C3.ink, { roughness: 0.4, clearcoat: 0.6 })); block.position.y = 0.006; block.castShadow = true; block.receiveShadow = true; g.add(block);
  const coins = [0, 1].map((i) => { const c = new THREE.Mesh(coinGeo, coinMat()); c.castShadow = true; g.add(c); return c; });
  const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.021), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: plateTex("FREE") })); chip.renderOrder = 5; g.add(chip);
  return { g, coins, chip }; }
const pawnGeoB = new THREE.CylinderGeometry(0.0072, 0.0092, 0.019, 20), pawnGeoH = new THREE.SphereGeometry(0.0072, 20, 14), pawnMat = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4 });
function makePawn(parent) { const g = new THREE.Group(); const b = new THREE.Mesh(pawnGeoB, pawnMat); b.position.y = 0.0095; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnGeoH, pawnMat); h.position.y = 0.0248; h.castShadow = true; g.add(h); parent.add(g); return g; }
const slot = (cx, j, dir = 1) => [cx + ((j % 3) - 1) * 0.019, 0.05 + Math.floor(j / 3) * 0.019];

// ------------------------------------------------------------------ set A (x = 0): the better sundae (left) vs the small scoop (right)
const SX = [-0.06, 0.06];
const stageA = new THREE.Group(); scene.add(stageA); const stageASh = contactShadow();
{ const base = new THREE.Mesh(new RoundedBoxGeometry(0.3, PLT, 0.2, 3, 0.006), mat(C3.ink, { roughness: 0.5, clearcoat: 0.3 })); base.position.set(0, PLT / 2, 0.05); base.castShadow = true; base.receiveShadow = true; stageA.add(base); }
const sundae = makeCup(stageA, { h: 0.046, r0: 0.016, r1: 0.027, scoops: [[C3.mint, 0.021, -0.008, 0.012, 0], [C3.mintw, 0.02, 0.009, 0.013, -0.003], [C3.teal, 0.019, 0, 0.035, 0]] });
sundae.g.position.set(SX[0], PLT, 0);
{ const w = new THREE.Mesh(new RoundedBoxGeometry(0.008, 0.034, 0.004, 2, 0.0015), mat("#3A8195", { roughness: 0.45 })); w.position.set(0.012, 0.046 + 0.05, 0.004); w.rotation.z = -0.35; w.castShadow = true; sundae.g.add(w);
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 24, 16), mat(C.teal2, { roughness: 0.25, clearcoat: 1, emissive: C.teal2, emissiveIntensity: 0.12 })); cherry.position.set(-0.002, 0.046 + 0.057, 0); cherry.castShadow = true; sundae.g.add(cherry); }
const small = makeCup(stageA, { h: 0.03, r0: 0.014, r1: 0.021, scoops: [[C3.mint, 0.019, 0, 0.011, 0]] });
small.g.position.set(SX[1], PLT, 0);
const tagA = [makeTag(stageA, SX[0], 0.13), makeTag(stageA, SX[1], 0.13)];
const pawnsA = Array.from({ length: 10 }, () => makePawn(stageA));
// pawn states: FREE = 3 / 7 (frame 0 and after the hop); PAID = 7 / 3 (before the cut). Pawns 3–6 switch sides.
const sideOf = (i, free) => (free ? (i < 3 ? 0 : 1) : (i < 7 ? 0 : 1));
const slotsFor = (free) => { const cnt = [0, 0]; return Array.from({ length: 10 }, (_, i) => { const s = sideOf(i, free); return slot(SX[s], cnt[s]++); }); };
const PA_FREE = slotsFor(true), PA_PAID = slotsFor(false);
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); stageA.add(halo);
const STAR_TEX = canvasTex(128, 128, (k, w) => { const c = w / 2; const g = k.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(200,255,248,0.6)"); g.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = g;
  k.beginPath(); for (let a = 0; a < 8; a++) { const r = a % 2 ? 0.1 * c : c, an = (a * Math.PI) / 4; k.lineTo(c + r * Math.cos(an), c + r * Math.sin(an)); } k.closePath(); k.fill(); });
const sparks = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: STAR_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 7; stageA.add(s); return s; });

// ------------------------------------------------------------------ set B (X2): the limit — a FREE scoop (treat) vs a FREE battery (practical)
const X2 = 0.4, stageB = new THREE.Group(); stageB.position.x = X2; scene.add(stageB); const stageBSh = contactShadow();
{ const base = new THREE.Mesh(new RoundedBoxGeometry(0.3, PLT, 0.2, 3, 0.006), mat(C3.ink, { roughness: 0.5, clearcoat: 0.3 })); base.position.set(0, PLT / 2, 0.05); base.castShadow = true; base.receiveShadow = true; stageB.add(base); }
const treatB = makeCup(stageB, { h: 0.03, r0: 0.014, r1: 0.021, scoops: [[C3.mint, 0.019, 0, 0.011, 0]] }); treatB.g.position.set(SX[0], PLT, 0);
const battery = new THREE.Group(); battery.position.set(SX[1], PLT, 0); stageB.add(battery);
{ const body = new THREE.Mesh(lathe([[0, 0], [0.0125, 0], [0.0135, 0.002], [0.0135, 0.05], [0.0125, 0.052], [0, 0.052]]), mat(C3.ink, { roughness: 0.35, clearcoat: 0.8 })); body.castShadow = true; battery.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0137, 0.0137, 0.018, 40, 1, true), mat(C3.teal, { roughness: 0.3 })); band.position.y = 0.04; battery.add(band);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 24), mat("#B9C7CF", { roughness: 0.25, metalness: 0.6 })); nub.position.y = 0.054; battery.add(nub);
  const plus = new THREE.Mesh(new RoundedBoxGeometry(0.006, 0.0016, 0.0016, 1, 0.0005), mat(C3.mintw)); plus.position.set(0, 0.04, 0.0139); battery.add(plus);
  const plus2 = plus.clone(); plus2.rotation.z = HALF; battery.add(plus2); }
const tagB = [makeTag(stageB, SX[0], 0.13), makeTag(stageB, SX[1], 0.13)];
// pawns: 1 at each item, 5 undecided in the middle; 4 hop to the treat, 1 to the battery
const pawnsB = Array.from({ length: 7 }, () => makePawn(stageB));
const PB0 = [slot(SX[0], 0), slot(SX[1], 0), [-0.026, 0.085], [-0.009, 0.095], [0.008, 0.085], [0.025, 0.095], [0, 0.07]];
const PB1 = [slot(SX[0], 0), slot(SX[1], 0), slot(SX[0], 1), slot(SX[0], 2), slot(SX[0], 3), slot(SX[1], 1), slot(SX[0], 4)];
const hopB = [null, null, [T.treatHop[0], 0], [T.treatHop[0] + 0.12, 0], [T.treatHop[0] + 0.24, 0], [T.practHop[0], 1], [T.treatHop[0] + 0.36, 0]];
const haloB = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); stageB.add(haloB);
const hopTo = (a, b, u, h = 0.03) => [lerp(a[0], b[0], u), h * Math.sin(Math.PI * u), lerp(a[1], b[1], u)];

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
const F0 = [[0.0, 0.235, 0.6], [0.0, 0.105, 0.065]], F1 = [[0.0, 0.232, 0.6], [0.0, 0.104, 0.065]], FT = [[0.0, 0.212, 0.6], [0.0, 0.098, 0.07]];
const FP = [[0.0, 0.24, 0.6], [0.0, 0.102, 0.07]], FV = [[0.048, 0.2, 0.47], [0.054, 0.088, 0.06]];
const FB = [[X2, 0.235, 0.6], [X2, 0.102, 0.07]], FB2 = [[X2, 0.232, 0.6], [X2, 0.101, 0.07]];
const CTAV = [[X2, 0.28, 1.3], [X2, 0.098, 0]], CTAV2 = [[X2, 0.28, 1.26], [X2, 0.098, 0]];
const CAMS = [[0, ...F0], [3.45, ...F0], [4.3, ...F1], [7.6, ...F1], [8.3, ...FT], [10.6, ...FT], [11.5, ...FP], [15.2, ...FP], [16.2, ...FV], [18.15, ...FV], [19.0, ...FB], [22.3, ...FB], [23.2, ...FB2], [25.5, ...FB2], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ helpers
// coin presence per stack: [inStart, outStart] pairs (out = pops up and fades)
const COINS = {
  A0: [[[-1, 1e9]], [[T.rewind[0] + 0.2, T.cutA]]],
  A1: [[[T.rewind[0] + 0.35, T.cutB]]],
  B0: [],
  B1: [[[T.repriced[0] + 0.15, 1e9]]],
};
function coinState(spans, t) { let p = 0, up = 0; for (const [a, b] of spans) { const pin = a < 0 ? 1 : ramp(t, a, a + 0.35, E.out), pout = ramp(t, b, b + 0.35, E.in); if (t >= a || a < 0) { p = pin * (1 - pout); up = pout; } } return { p, up }; }
function drawTag(tag, key, t, glowTop) { const spans = COINS[key];
  tag.coins.forEach((c, i) => { const st = spans[i] ? coinState(spans[i], t) : { p: 0, up: 0 }, drop = 0.025 * (1 - Math.min(1, st.p + st.up));
    const p1 = spans[1] ? coinState(spans[1], t).p : 0, off = 0.0145 * Math.min(1, p1 * 1.4);
    c.visible = st.p > 0.005; c.scale.setScalar(Math.max(0.001, st.p)); c.position.set(i === 0 ? -off : off, 0.012 + 0.0125 + drop + 0.03 * st.up, 0); c.rotation.z = 0.25 * st.up;
    const top = spans.filter((s, j) => coinState(s, t).p > 0.5).length - 1; c.material.emissiveIntensity = 0.15 + (i === top ? 0.75 * glowTop : 0); }); }
function drawChip(chip, vis, glow) { chip.visible = vis > 0.005; chip.material.opacity = Math.min(1, vis); chip.scale.setScalar(Math.max(0.001, 0.85 + 0.15 * Math.min(1, vis)) * (1 + 0.12 * glow)); chip.position.set(0, 0.012 + 0.011, 0.004); }

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut), showA = t < 19.1, showB = t > 17.9;
  // --- set A
  stageA.visible = showA; placeShadow(stageASh, 0, 0.04, 0, 0.15, 0.1, showA ? 0.8 : 0);
  const gapGlow = win(t, ...T.apartLab, 0.15, 0.3) + win(t, ...T.sameLab, 0.15, 0.3);
  drawTag(tagA[0], "A0", t, clamp(gapGlow)); drawTag(tagA[1], "A1", t, 0);
  const chipA = (1 - ramp(t, T.rewind[0], T.rewind[0] + 0.3)) + E.outBack(ramp(t, T.freeFlip, T.freeFlip + 0.3, E.lin));
  drawChip(tagA[1].chip, chipA, pulse(t, T.nowFree, 0.45)); drawChip(tagA[0].chip, 0, 0);
  sundae.cm.emissiveIntensity = 0.3 * win(t, ...T.better, 0.2, 0.4); sundae.sc.forEach((m) => { m.material.emissiveIntensity = 0.06 * (1 - 0.6 * ramp(t, ...T.fewer)); });
  small.cm.emissiveIntensity = 0.25 * ramp(t, ...T.value);
  pawnsA.forEach((g, i) => { const st = 0.05 * (i % 5);
    const u1 = ramp(t, T.rewind[0] + st, T.rewind[0] + st + 0.45, E.inOut), u2 = ramp(t, T.hop[0] + st * 1.3, T.hop[0] + st * 1.3 + 0.45, E.inOut);
    let p = [PA_FREE[i][0], 0, PA_FREE[i][1]]; if (u1 > 0) p = hopTo(PA_FREE[i], PA_PAID[i], u1); if (u2 > 0) p = hopTo(PA_PAID[i], PA_FREE[i], u2);
    g.position.set(p[0], PLT + p[1], p[2]); g.visible = showA; });
  { const v = ramp(t, ...T.value, E.out); halo.visible = showA && v > 0.01; halo.material.opacity = 0.55 * v; halo.position.set(SX[1], PLT + 0.045, -0.02); halo.scale.set(0.08 + 0.06 * v, 0.08 + 0.06 * v, 1);
    sparks.forEach((s, j) => { const p = pulse(t, T.value[0] + 0.2 + j * 0.28, 0.5); s.visible = showA && p > 0.01; s.material.opacity = p; s.scale.setScalar(0.014 + 0.01 * p); s.position.set(SX[1] + [-0.024, 0.026, 0.004][j], PLT + [0.06, 0.05, 0.078][j], 0.01); }); }
  // --- set B (limit + payoff); sinks for the CTA
  stageB.visible = showB && cl < 0.999; stageB.position.y = -0.27 * cl; placeShadow(stageBSh, X2, 0.04, 0, 0.15, 0.1, showB ? 0.8 * (1 - cl) : 0);
  drawTag(tagB[0], "B0", t, 0); drawTag(tagB[1], "B1", t, 0);
  drawChip(tagB[0].chip, 1, win(t, ...T.payLab, 0.2, 0.3) * (0.5 + 0.5 * Math.sin(t * 6)) * 0.5 + pulse(t, T.hardest, 0.5));
  drawChip(tagB[1].chip, 1 - ramp(t, T.repriced[0], T.repriced[0] + 0.2), 0);
  { const ft = Math.min(1, ramp(t, T.repriced[0], T.repriced[0] + 0.2)); tagB[1].chip.rotation.x = HALF * ft; }
  pawnsB.forEach((g, i) => { let p = [PB0[i][0], 0, PB0[i][1]]; const h = hopB[i]; if (h) { const u = ramp(t, h[0], h[0] + 0.45, E.inOut); if (u > 0) p = hopTo(PB0[i], PB1[i], u, 0.035); }
    const b = PB1[i][0] < 0 && (h === null ? i === 0 : h[1] === 0) ? 0.012 * pulse(t, T.hardest + 0.05 * i, 0.3) : 0;
    g.position.set(p[0], PLT + p[1] + b, p[2]); g.visible = showB; g.scale.setScalar(Math.max(0.001, 1 - ramp(t, T.ctaClear[0] - 0.2, T.ctaClear[0] + 0.05, E.in))); });
  { const v = ramp(t, T.payLab[0], T.payLab[0] + 0.5) * (1 - cl); haloB.visible = showB && v > 0.01; haloB.material.opacity = 0.5 * v; haloB.position.set(SX[0], PLT + 0.045, -0.02); haloB.scale.set(0.13, 0.13, 1); }

  // --- lights: hero spot on the sundae in the hook, on the small/free scoop from the cut on; on the treat in set B
  { const onB = t > 18.6, tx = onB ? X2 + SX[0] : t < 4.3 ? SX[0] : SX[1];
    const k = t < 4.3 ? 1 : ramp(t, T.cutA - 0.4, T.cutA + 0.2);
    hero.intensity = 2.5 * (1 - cl) * (t < 4.3 || onB ? 1 : k); hero.position.set(tx + 0.1, 1.1, 0.55); hero.target.position.set(tx, PLT + 0.05, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(X2, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, X2, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lApart", T.apartLab); lab("lGap", T.sameLab); lab("lWin", T.winLab); lab("lValue", T.valueLab); lab("lTreats", T.limLab); lab("lPay", T.payLab);
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
