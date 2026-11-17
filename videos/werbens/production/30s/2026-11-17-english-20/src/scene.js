// Werbens · 30 s English-20 — "WHY 99, NOT 100?" (the left-digit effect: a nine-ending price feels smaller than a price one
// cent higher only when the leftmost digit changes; nine endings lifted demand in field tests, most for new items; round prices
// can feel right for feelings-driven buys; Thomas & Morwitz 2005, Anderson & Simester 2003, Wadhwa & Zhang 2015), in the accepted
// 'Satisfying Product Theatre' style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-17). No currency.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT, FLAPS, DROP } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "WHY 99, NOT 100? FIRST DIGIT FELT SMALLER NO EFFECT MOST FOR NEW ONLY IF IT FLIPS FEELS RIGHT 0123456789 Werbens")));
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

// ------------------------------------------------------------------ set A (x = 0): a price rail on a low ink base. Two price signs
// hang from spring scales; how far a spring stretches = how big the price FEELS (illustrative). Each sign spins on its hanger:
// front face = "99" / "100" (hook), back face = four split-flap slots [d0][.][d1][d2] (the studies' example prices). No currency.
const HALF = Math.PI / 2, SXS = [-0.08, 0.08], RAIL_Y = 0.25, PLT = 0.02, SPR = 0.03;
const stageA = new THREE.Group(); scene.add(stageA); const stageASh = contactShadow();
{ const inkM = mat(C3.ink, { roughness: 0.5, clearcoat: 0.3 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.4, PLT, 0.13, 3, 0.006), inkM); base.position.y = PLT / 2; base.castShadow = true; base.receiveShadow = true; stageA.add(base);
  for (const s of [-1, 1]) { const post = new RoundedBoxGeometry(0.009, RAIL_Y - PLT, 0.009, 2, 0.003); const p = new THREE.Mesh(post, inkM); p.position.set(s * 0.185, PLT + (RAIL_Y - PLT) / 2, -0.03); p.castShadow = true; stageA.add(p); }
  const rail = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.009, 0.012, 2, 0.003), mat(C3.teal, { roughness: 0.35 })); rail.position.set(0, RAIL_Y, -0.03); rail.castShadow = true; stageA.add(rail); }
// digit textures (Space Grotesk 700 as on app.werbens.com; ink digits on mint-white tiles)
const DIGIT_TEX = Array.from({ length: 10 }, (_, d) => canvasTex(160, 240, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.fillRect(0, 0, w, h); k.fillStyle = C.ink; k.font = "700 200px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(String(d), w / 2, h * 0.56); }));
const tileGeo = new RoundedBoxGeometry(0.03, 0.044, 0.008, 2, 0.003), faceGeo = new THREE.PlaneGeometry(0.0255, 0.0384);
function makeTile(parent, x, z, ry) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  const t = new THREE.Mesh(tileGeo, mat(C3.mintw, { roughness: 0.25, clearcoat: 0.8, emissive: C.mint, emissiveIntensity: 0 })); t.castShadow = true; g.add(t);
  const f = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: DIGIT_TEX[0], toneMapped: false })); f.position.z = 0.0042; g.add(f);
  return { g, t, f }; }
// spring: a helix tube built for unit length (scaled in y per frame)
const springGeo = (() => { const pts = []; for (let i = 0; i <= 240; i++) { const u = i / 240, a = u * Math.PI * 2 * 9; pts.push(new THREE.Vector3(0.0055 * Math.cos(a), -u, 0.0055 * Math.sin(a))); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 480, 0.0011, 8, false); })();
const FRONT = { L: [9, 9], R: [1, 0, 0] };
const signs = ["L", "R"].map((side, k) => {
  const hang = new THREE.Group(); hang.position.set(SXS[k], RAIL_Y, -0.03); stageA.add(hang);
  const spring = new THREE.Mesh(springGeo, mat("#B9C7CF", { roughness: 0.25, metalness: 0.6 })); spring.castShadow = true; hang.add(spring);
  const sign = new THREE.Group(); hang.add(sign);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.0012, 8, 24), mat("#B9C7CF", { roughness: 0.25, metalness: 0.6 })); hook.position.y = 0.002; sign.add(hook);
  const plate = new THREE.Mesh(new RoundedBoxGeometry(0.128, 0.06, 0.01, 3, 0.005), mat(C3.ink, { roughness: 0.4, clearcoat: 0.6, emissive: C.mint, emissiveIntensity: 0 })); plate.position.y = -0.034; plate.castShadow = true; sign.add(plate);
  const rimM = mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.15 });
  const rim = new THREE.Mesh(new RoundedBoxGeometry(0.132, 0.064, 0.006, 3, 0.006), rimM); rim.position.set(0, -0.034, 0); sign.add(rim);
  // front face: "99" / "100" (static digits)
  const fd = FRONT[side], front = fd.map((d, i) => { const tl = makeTile(sign, (i - (fd.length - 1) / 2) * 0.034, 0.0075, 0); tl.g.position.y = -0.034; tl.f.material.map = DIGIT_TEX[d]; return tl; });
  // back face (seen after a half spin): slots [d0][.][d1][d2]
  const XS = [-0.044, -0.0205, 0.0035, 0.0375];
  const back = [0, 1, 2, 3].map((i) => { if (i === 1) { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0035, 16, 12), mat(C3.mintw, { roughness: 0.3 })); dot.position.set(-XS[i], -0.034 - 0.017, -0.0075); sign.add(dot); return null; }
    const tl = makeTile(sign, -XS[i] - (i === 0 ? 0 : 0), -0.0075, Math.PI); tl.g.position.y = -0.034; return tl; });
  const check = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.022), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c, w) => { c.fillStyle = "#7FE7DC"; c.beginPath(); c.arc(w / 2, w / 2, w * 0.47, 0, Math.PI * 2); c.fill(); c.strokeStyle = "#0F172A"; c.lineWidth = w * 0.11; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(w * 0.29, w * 0.52); c.lineTo(w * 0.44, w * 0.67); c.lineTo(w * 0.72, w * 0.36); c.stroke(); }), transparent: true, toneMapped: false })); check.renderOrder = 5; hang.add(check);
  return { side, k, hang, spring, sign, plate, rimM, front, back, check };
});
// gift box (feel-good purchase) under the right sign, for the round-price boundary
const gift = new THREE.Group(); stageA.add(gift);
{ const box = new THREE.Mesh(new RoundedBoxGeometry(0.075, 0.05, 0.06, 3, 0.006), mat(C3.mintw, { roughness: 0.25, clearcoat: 0.8 })); box.position.y = 0.025; box.castShadow = true; gift.add(box);
  const rib = mat(C3.teal, { roughness: 0.3 });
  const b1 = new THREE.Mesh(new RoundedBoxGeometry(0.012, 0.052, 0.062, 2, 0.002), rib); b1.position.y = 0.025; gift.add(b1);
  const b2 = new THREE.Mesh(new RoundedBoxGeometry(0.077, 0.052, 0.012, 2, 0.002), rib); b2.position.y = 0.025; gift.add(b2);
  for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.0035, 10, 24), rib); loop.position.set(s * 0.01, 0.056, 0); loop.rotation.set(0, HALF, s * 0.5); gift.add(loop); } }
const giftGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(giftGlow);

// ------------------------------------------------------------------ set B (X2): field test — two products on a shelf base (left a
// returning item, right a new one with a ribbon); small price tags in front flip to nine endings; queues of shoppers grow
const X2 = 0.42, stageB = new THREE.Group(); stageB.position.x = X2; scene.add(stageB); const stageBSh = contactShadow();
{ const base = new THREE.Mesh(new RoundedBoxGeometry(0.3, PLT, 0.3, 3, 0.006), mat(C3.ink, { roughness: 0.5, clearcoat: 0.3 })); base.position.set(0, PLT / 2, 0.02); base.receiveShadow = true; base.castShadow = true; stageB.add(base); }
const products = [-0.065, 0.065].map((x, k) => { const g = new THREE.Group(); g.position.set(x, PLT, -0.04); stageB.add(g);
  const box = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.075, 0.05, 3, 0.006), mat(C3.mintw, { roughness: 0.25, clearcoat: 0.8 })); box.position.y = 0.0375; box.castShadow = true; g.add(box);
  const band = new THREE.Mesh(new RoundedBoxGeometry(0.0615, 0.016, 0.0515, 2, 0.002), mat(k ? C3.mint : C3.teal, { roughness: 0.3, emissive: k ? C.mint : C.teal, emissiveIntensity: k ? 0.25 : 0.05 })); band.position.y = 0.03; g.add(band);
  const tag = new THREE.Group(); tag.position.set(0, 0.055, 0.0275); g.add(tag);
  const tp = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.022, 0.004, 2, 0.002), mat(C3.ink, { roughness: 0.4 })); tag.add(tp);
  const XS = [-0.018, -0.008, 0.003, 0.016], tt = [0, 1, 2, 3].map((i) => { if (i === 1) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.0016, 10, 8), mat(C3.mintw)); d.position.set(XS[i], -0.006, 0.003); tag.add(d); return null; }
    const tl = makeTile(tag, XS[i], 0.0028, 0); tl.g.scale.setScalar(0.36); return tl; });
  return { g, tt }; });
const sparkle = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); stageB.add(sparkle);
const pawnB = new THREE.CylinderGeometry(0.0095, 0.012, 0.025, 24), pawnH = new THREE.SphereGeometry(0.0095, 24, 16), pawnM = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4 });
const queues = [0, 1].map((k) => Array.from({ length: 5 }, (_, j) => { const g = new THREE.Group(); const b = new THREE.Mesh(pawnB, pawnM); b.position.y = 0.0125; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnH, pawnM); h.position.y = 0.0328; h.castShadow = true; g.add(h); stageB.add(g); return g; }));
// queue lengths over time (direction only): before tags flip 2 each; after "lifted demand" 3 each; "most for new items" → right 5
const queueLen = (k, t) => 2 + ramp(t, T.lift[0] + k * 0.12, T.lift[0] + k * 0.12 + 0.3, E.outBack) + (k ? 2 * ramp(t, T.newMore[0], T.newMore[1], E.out) : 0);

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
const F0 = [[0.0, 0.22, 1.0], [0.0, 0.185, 0.0]], F1 = [[0.0, 0.22, 0.95], [0.0, 0.185, 0.0]], FL = [[0.0, 0.22, 0.92], [0.0, 0.183, 0.0]];
const FB = [[X2 + 0.014, 0.175, 0.8], [X2 + 0.014, 0.075, 0.035]], FB2 = [[X2 + 0.014, 0.17, 0.77], [X2 + 0.014, 0.074, 0.035]];
const FR = [[0.0, 0.22, 0.95], [0.0, 0.185, 0.0]], FG = [[0.03, 0.215, 0.93], [0.025, 0.17, 0.0]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.4, ...F0], [4.2, ...F1], [9.7, ...FL], [14.75, ...FL], [15.6, ...FB], [19.35, ...FB2], [20.1, ...FR], [22.5, ...FR], [23.4, ...FG], [26.1, ...FG], [27.1, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }

// ------------------------------------------------------------------ helpers
const FLIP = 0.11; // half a split-flap turn (s)
function flapState(ks, t) { // → { digit, angle } for a slot's change list
  let i = 0; for (let j = 1; j < ks.length; j++) if (t >= ks[j][0]) i = j;
  const tc = ks[i][0], d = ks[i][1], prev = i > 0 ? ks[i - 1][1] : d, dt = t - tc;
  if (i > 0 && dt < FLIP) return { digit: prev, angle: (dt / FLIP) * HALF };
  if (i > 0 && dt < 2 * FLIP) return { digit: d, angle: (1 - (dt - FLIP) / FLIP) * HALF };
  return { digit: d, angle: 0 }; }
function dropAt(ks, t) { // eased target + damped bounce after each change
  let v = ks[0][1]; for (let j = 1; j < ks.length; j++) { const [a, va] = ks[j - 1], [b, vb] = ks[j]; if (t >= b) v = vb; else if (t > a) { v = va + (vb - va) * E.inOut((t - a) / (b - a)); break; } }
  let bounce = 0; for (let j = 1; j < ks.length; j++) { const [b, vb] = ks[j], va = ks[j - 1][1]; if (t > b && Math.abs(vb - va) > 0.004) bounce += (va - vb) * 0.35 * Math.exp(-(t - b) * 6) * Math.sin((t - b) * 22); }
  return v + bounce; }

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut), showA = t < 15.9 || t > 19.1, showB = t > 14.5 && t < 20.4;
  stageA.position.y = -0.3 * cl; stageA.visible = showA && cl < 0.999; placeShadow(stageASh, 0, 0, 0, 0.19, 0.07, showA ? 0.8 * (1 - cl) : 0);
  // --- set A: price signs on springs
  const sameGlow = win(t, ...T.same, 0.15, 0.35);
  signs.forEach((S) => { const side = S.side, k = S.k;
    const d = dropAt(DROP[side], t); S.spring.scale.set(1, SPR + d, 1); S.sign.position.y = -(SPR + d);
    // spin: both to the back face at T.spin; the right one back to its round front at T.roundSpin
    let ry = Math.PI * ramp(t, ...T.spin, E.inOut); if (side === "R") ry += Math.PI * ramp(t, ...T.roundSpin, E.inOut);
    S.sign.rotation.y = ry + 0.05 * Math.sin(t * 1.3 + k) * (1 - cl);
    const pulse_ = side === "L" ? pulse(t, T.pulse99, 0.45) : pulse(t, T.pulse100, 0.45); S.rimM.emissiveIntensity = 0.15 + 0.6 * pulse_;
    FLAPS[side].forEach((ks, i) => { if (!ks) return; const tl = S.back[i], st = flapState(ks, t); tl.f.material.map = DIGIT_TEX[st.digit]; tl.g.rotation.x = st.angle;
      const firstGlow = i === 0 ? Math.max(sameGlow, side === "L" ? win(t, T.drop, T.drop + 1.1, 0.1, 0.4) + win(t, T.flips + 0.16, T.flips + 1.3, 0.1, 0.4) : 0) : 0;
      tl.t.material.emissiveIntensity = 0.45 * clamp(firstGlow); });
    // dim the right sign's plate while only its last digits change in the rule beat; dim the left during the round-price beat
    S.plate.material.emissiveIntensity = 0;
    const ck = side === "L" ? E.outBack(ramp(t, T.flips + 0.3, T.flips + 0.6, E.lin)) * (1 - ramp(t, T.roundSpin[0], T.roundSpin[1])) : 0;
    S.check.visible = ck > 0.01; S.check.scale.setScalar(Math.max(0.001, ck)); S.check.position.set(0.078, -(SPR + d) - 0.034, 0.01);
  });
  { const g = ramp(t, ...T.gift, E.outBack); gift.visible = g > 0.001; gift.position.set(SXS[1], PLT - 0.05 * (1 - Math.min(1, g)), 0.02); gift.scale.setScalar(Math.max(0.001, g));
    giftGlow.visible = g > 0.01 && cl < 0.99; giftGlow.material.opacity = 0.45 * ramp(t, T.gift[1] - 0.2, T.gift[1] + 0.5) * (1 - cl); giftGlow.position.set(SXS[1], 0.11 - 0.3 * cl, -0.04); giftGlow.scale.set(0.2, 0.2, 1); }
  // --- set B: field test
  stageB.visible = showB; placeShadow(stageBSh, X2, 0, 0, 0.15, 0.1, showB ? 0.8 : 0);
  products.forEach((P, k) => { P.tt.forEach((tl, i) => { if (!tl) return; const ks = i === 0 ? [[0, 3], [T.tags9 + k * 0.1, 2]] : [[0, 0], [T.tags9 + k * 0.1 + i * 0.015, 9]]; const st = flapState(ks, t); tl.f.material.map = DIGIT_TEX[st.digit]; tl.g.rotation.x = st.angle; }); });
  { const sp = win(t, T.newMore[0] - 0.1, T.newLab[1], 0.25, 0.4) + 0.4 * win(t, T.tags9 - 0.5, T.newMore[0], 0.3, 0.2); sparkle.visible = showB && sp > 0.01; sparkle.material.opacity = 0.5 * clamp(sp); sparkle.position.set(0.065, 0.09, -0.06); sparkle.scale.set(0.14, 0.14, 1); }
  queues.forEach((Q, k) => { const n = queueLen(k, t); Q.forEach((g, j) => { const v = clamp(n - j); g.visible = showB && v > 0.01; g.scale.setScalar(Math.max(0.001, v));
    g.position.set(products[k].g.position.x + (k ? 1 : -1) * (0.01 + j * 0.0125), PLT + 0.02 * (1 - v), 0.045 + j * 0.019); }); });

  // --- lights: hero spot on the left sign (the nine-ending one); on the right one for the round-price beat; on the new item in B
  { const onB = t > 15.2 && t < 19.8, onR = t > T.roundSpin[0], tx = onB ? X2 + 0.065 : onR ? SXS[1] : SXS[0];
    hero.intensity = 2.4 * (1 - cl); hero.position.set(tx + 0.1, 1.1, 0.55); hero.target.position.set(tx, onB ? PLT + 0.05 : RAIL_Y - 0.09, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lFirst", T.firstLab); lab("lFelt", T.feltLab); lab("lNo", T.noLab); lab("lNew", T.newLab); lab("lRule", T.ruleLab); lab("lRight", T.rightLab);
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
