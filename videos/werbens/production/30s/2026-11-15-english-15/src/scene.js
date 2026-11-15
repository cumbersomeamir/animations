// Werbens · 30 s English-15 — "TRY BEATS TELL?" (why a free sample can sell what a perfect ad can't: trial-based opinions
// predict buying better than ad-based ones, Smith & Swinyard 1983; free-sample field experiments, Bawa & Shoemaker 2004), in the
// accepted 'Satisfying Product Theatre' style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-15;
// rules context/27 + the first-frame rule: frame 0 is a composed booth with the curiosity headline and works as the thumbnail).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "TRY BEATS TELL? BELIEVE? CHECK 12 MONTHS VARIES LET THEM TRY PROVE THE CLAIM TRIED AD LIKE BUY ! Werbens")));
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

// ------------------------------------------------------------------ the booth (illustration): a tasting counter with a tray of sample cups
// and, behind it, a polished ad on an easel. Generic product ("bites") in Werbens colours — no brand, no claim text.
const HALF = Math.PI / 2;
const booth = new THREE.Group(); scene.add(booth);
const counter = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.075, 0.18, 3, 0.012), mat(C3.ink, { roughness: 0.28, clearcoat: 1 })); counter.position.set(0.02, 0.0375, 0.06); counter.castShadow = true; counter.receiveShadow = true; booth.add(counter);
const counterTop = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.008, 0.19, 2, 0.003), mat(C3.teal, { roughness: 0.3 })); counterTop.position.set(0.02, 0.079, 0.06); counterTop.receiveShadow = true; booth.add(counterTop);
const tray = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.008, 0.1, 2, 0.004), mat(C3.mintw, { roughness: 0.4, clearcoat: 0.4 })); tray.position.set(0.04, 0.087, 0.09); tray.castShadow = true; tray.receiveShadow = true; booth.add(tray);
const cupGeo = new THREE.LatheGeometry([[0, 0], [0.0125, 0], [0.0135, 0.002], [0.017, 0.022], [0.0175, 0.023], [0.016, 0.023], [0.0125, 0.004], [0, 0.004]].map(([a, b]) => new THREE.Vector2(a, b)), 32);
const cupMat = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.3, side: THREE.DoubleSide, transparent: true }), biteMat = mat(C3.mint, { roughness: 0.45, clearcoat: 0.4, transparent: true });
const CUP_POS = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) CUP_POS.push([0.04 + (c - 1.5) * 0.037 + (r === 0 ? 0.0185 : 0), 0.091, 0.09 + (r - 0.5) * 0.042]); // back row staggered half a pitch so both rows read
const cups = CUP_POS.map(([x, y, z]) => { const g = new THREE.Group(); booth.add(g); const c = new THREE.Mesh(cupGeo, cupMat.clone()); c.castShadow = true; g.add(c);
  const b = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.014, 0.016, 2, 0.005), biteMat.clone()); b.position.y = 0.026; b.rotation.y = 0.5; b.castShadow = true; g.add(b); g.position.set(x, y, z); g.userData.home = [x, y, z]; return g; });
// order in which samples are taken (front-right first), and refilled at the payoff
const TAKE = [5, 2, 7];
// the ad: an easel with a glossy poster (product hero + a claim bubble), deliberately untouched
const ad = new THREE.Group(); booth.add(ad); ad.position.set(-0.07, 0, -0.04); ad.rotation.y = 0.18;
{ const legM = mat(C3.ink, { roughness: 0.3 }); for (const [x, rz] of [[-0.06, 0.06], [0.06, -0.06]]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.3, 10), legM); leg.position.set(x * 0.85, 0.14, 0.0); leg.rotation.z = rz; leg.castShadow = true; ad.add(leg); }
  const frameM = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.195, 0.008, 2, 0.004), mat(C3.ink, { roughness: 0.3 })); frameM.position.set(0, 0.2, 0.006); frameM.castShadow = true; ad.add(frameM);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.139, 0.184), new THREE.MeshBasicMaterial({ toneMapped: false, map: canvasTex(632, 832, (k, w, h) => {
    const g = k.createLinearGradient(0, 0, w, h); g.addColorStop(0, C.teal); g.addColorStop(1, "#1C4351"); k.fillStyle = g; k.fillRect(0, 0, w, h);
    const rg = k.createRadialGradient(w * 0.5, h * 0.62, 10, w * 0.5, h * 0.62, w * 0.5); rg.addColorStop(0, "rgba(127,231,220,0.55)"); rg.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = rg; k.fillRect(0, 0, w, h);
    k.fillStyle = C.mintw; k.beginPath(); k.roundRect(w * 0.22, h * 0.42, w * 0.56, w * 0.48, 56); k.fill(); k.fillStyle = C.mint; k.beginPath(); k.roundRect(w * 0.22, h * 0.42, w * 0.56, w * 0.14, [56, 56, 0, 0]); k.fill();
  }) }));
  poster.position.set(0, 0.2, 0.0105); ad.add(poster); ad.userData.poster = poster; }
const sheenMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, map: canvasTex(256, 64, (k, w, h) => { const g = k.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,0.8)"); g.addColorStop(1, "rgba(255,255,255,0)"); k.fillStyle = g; k.fillRect(0, 0, w, h); }) });
const sheen = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.3), sheenMat); sheen.rotation.z = -0.5; sheen.position.set(0, 0.2, 0.012); sheen.scale.set(0.9, 0.62, 1); ad.add(sheen);
// the ad's claim bubble as a separate 3D token (it swells on "believe" and flies to the sample on "prove your main claim")
const claim = new THREE.Group(); scene.add(claim);
{ const b = new THREE.Mesh(new THREE.SphereGeometry(0.021, 32, 20), mat("#F4FBFA", { roughness: 0.35 })); b.scale.set(1.5, 1, 0.45); b.castShadow = true; claim.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.022, 0.022), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(256, 256, (k, w, h) => { k.fillStyle = C.ink; fitText(k, "!", "IDBK", w * 0.6, 220); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("!", w / 2, h * 0.55); }) })); f.position.z = 0.0102; claim.add(f); }
const check = new THREE.Group(); scene.add(check);
{ const m = mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.35 });
  const s1 = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.01, 0.01, 2, 0.004), m); s1.position.set(-0.014, -0.005, 0); s1.rotation.z = -0.8; check.add(s1);
  const s2 = new THREE.Mesh(new RoundedBoxGeometry(0.056, 0.01, 0.01, 2, 0.004), m); s2.position.set(0.015, 0.007, 0); s2.rotation.z = 0.85; check.add(s2); }
const boothSh = contactShadow(); const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(aura);

// ------------------------------------------------------------------ proof 1 set (XB): TRIED vs AD — opinion (mint) and purchase (teal) columns
const XB = 0.55, colGeo = new RoundedBoxGeometry(0.034, 1, 0.034, 2, 0.008); colGeo.translate(0, 0.5, 0);
const chipTex = (txt) => canvasTex(640, 220, (k, w, h) => { k.fillStyle = "#F4FBFA"; k.beginPath(); k.roundRect(0, 0, w, h, 60); k.fill(); k.fillStyle = C.ink; fitText(k, txt, "IDBK", w * 0.84, 150); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.55); });
const pairs = [["TRIED", -0.075], ["AD", 0.075]].map(([txt, dx]) => { const g = new THREE.Group(); scene.add(g); g.position.set(XB + dx, 0, 0);
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.014, 0.07, 2, 0.005), mat(C3.ink, { roughness: 0.3 })); base.position.y = 0.007; base.receiveShadow = true; base.castShadow = true; g.add(base);
  const op = new THREE.Mesh(colGeo, mat(C3.mint, { roughness: 0.25, emissive: C.mint, emissiveIntensity: 0.25 })); op.position.set(-0.022, 0.014, 0); op.castShadow = true; g.add(op);
  const buy = new THREE.Mesh(colGeo, mat(C3.teal, { roughness: 0.3, emissive: C.teal, emissiveIntensity: 0.15 })); buy.position.set(0.022, 0.014, 0); buy.castShadow = true; g.add(buy);
  const chip = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.026), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: chipTex(txt) })); chip.position.set(0, 0.008, 0.045); chip.rotation.x = -0.35; g.add(chip);
  return { g, op, buy, sh: contactShadow(), x: XB + dx }; });
const keyTex = (txt) => canvasTex(512, 160, (k, w, h) => { k.fillStyle = "rgba(9,16,30,0)"; k.fillRect(0, 0, w, h); k.fillStyle = C.mintw; fitText(k, txt, "IDBK", w * 0.9, 110); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, w / 2, h * 0.55); });
// small legend chips at the column feet: "LIKE" (opinion) and "BUY" (purchase)
const legends = pairs.map((p) => [["LIKE", -0.022], ["BUY", 0.022]].map(([txt, dx]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.042, 0.016), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: chipTex(txt) })); m.position.set(dx, 0.03, 0.0); p.g.add(m); return m; }));

// ------------------------------------------------------------------ proof 2 set (XM): new buyers + 12 month tiles; two brands vary widely
const XM = 1.1, tileGeo = new RoundedBoxGeometry(0.02, 0.012, 0.032, 2, 0.004);
const rows = [0, 1].map((r) => Array.from({ length: 12 }, (_, i) => { const m = new THREE.Mesh(tileGeo, mat(C3.ink, { roughness: 0.35, emissive: C.mint, emissiveIntensity: 0 })); m.position.set(XM - 0.145 + i * 0.024, 0.006, -0.03 + r * 0.055); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; }));
const buyers = Array.from({ length: 5 }, (_, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.022, 24), mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.2 })); m.castShadow = true; scene.add(m); m.userData.home = [XM - 0.06 + i * 0.032, 0.011, 0.1]; return m; });
const sampleCupM = new THREE.Group(); scene.add(sampleCupM); { const c = new THREE.Mesh(cupGeo, mat("#EEF7F1", { roughness: 0.4, side: THREE.DoubleSide })); c.scale.setScalar(1.6); c.castShadow = true; sampleCupM.add(c); const b = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.014, 0.016, 2, 0.005), mat(C3.mint, { roughness: 0.45 })); b.scale.setScalar(1.6); b.position.y = 0.042; sampleCupM.add(b); }
sampleCupM.position.set(XM - 0.115, 0, 0.1);
const brandChips = ["A", "B"].map((txt, r) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.028, 0.02), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: chipTex(txt) })); m.position.set(XM + 0.143, 0.012, -0.03 + r * 0.055); m.rotation.x = -HALF + 0.5; scene.add(m); return m; });

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
const F0 = [[-0.01, 0.27, 0.92], [-0.012, 0.212, 0.0]], F1 = [[-0.01, 0.272, 0.88], [-0.012, 0.222, 0.0]], BOOTH = [[-0.01, 0.272, 0.88], [-0.012, 0.222, 0.0]];
const BARS = [[XB, 0.2, 0.86], [XB, 0.13, 0.0]], BARS2 = [[XB, 0.2, 0.8], [XB, 0.13, 0.0]], MON = [[XM, 0.36, 0.78], [XM, 0.1, 0.0]], MON2 = [[XM, 0.35, 0.74], [XM, 0.1, 0.0]];
const PAY = [[-0.01, 0.272, 0.9], [-0.012, 0.224, 0.0]], PAY2 = [[-0.01, 0.272, 0.86], [-0.012, 0.224, 0.0]];
const CTAV = [[0, 0.28, 1.3], [0, 0.098, 0]], CTAV2 = [[0, 0.28, 1.26], [0, 0.098, 0]];
const CAMS = [[0, ...F0], [3.1, ...F1], [6.9, ...BOOTH], [7.8, ...BARS], [12.5, ...BARS2], [13.5, ...MON], [20.1, ...MON2], [21.0, ...PAY], [25.5, ...PAY2], [26.45, ...CTAV], [30, ...CTAV2]];
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
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  key_.position.set(cam.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(cam.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  // --- booth (parts left/right for the CTA)
  booth.position.x = -0.9 * cl; booth.visible = cl < 1; placeShadow(boothSh, 0.02 - 0.9 * cl, 0.06, 0, 0.17, 0.11, cl < 1 ? 0.8 : 0);
  // samples: three are taken (lift, drift up-right, dissolve); all refill on "let people try"
  cups.forEach((g, i) => { const [x, y, z] = g.userData.home; const k = TAKE.indexOf(i); let lift = 0, op = 1;
    if (k >= 0) { const [a, b] = T.take[k], u = clamp((t - a) / (b - a)); lift = E.out(u); op = 1 - ramp(t, a + (b - a) * 0.55, b, E.in); const back = ramp(t, T.refill[0] + k * 0.12, T.refill[0] + k * 0.12 + 0.35, E.out); if (t >= T.refill[0] + k * 0.12) { lift = 0; op = back; } }
    const sq = squash(t, T.refill[0] + Math.max(0, k) * 0.12 + 0.35, -0.15) * (k >= 0 ? 1 : 0);
    g.position.set(x + 0.03 * lift, y + 0.07 * lift, z + 0.03 * lift); g.rotation.set(0.25 * lift, 0, -0.35 * lift); g.scale.set((1 - sq * 0.3) * (0.4 + 0.6 * op), (1 + sq) * (0.4 + 0.6 * op), (1 - sq * 0.3) * (0.4 + 0.6 * op));
    g.children.forEach((m) => { m.material.opacity = op; }); g.visible = op > 0.02; });
  // the ad: sheen on "perfect ad"; dims a little at the payoff
  { const s = ramp(t, ...T.sheen, E.inOut); sheenMat.opacity = 0.55 * Math.sin(Math.PI * s); sheen.position.x = lerp(-0.1, 0.1, s); }
  // the claim bubble: lives on the poster; swells on "believe"; flies to the tray and becomes a check on "prove your main claim"
  { const p0 = new THREE.Vector3(-0.025 - 0.9 * cl, 0.255, -0.02), p1 = new THREE.Vector3(0.04 - 0.9 * cl, 0.15, 0.09), f = ramp(t, ...T.claimFly, E.inOut);
    const p = p0.clone().lerp(p1, f); p.y += 0.06 * Math.sin(Math.PI * f); claim.position.copy(p); claim.rotation.y = 0.28 * (1 - f);
    const sw = 1 + 0.35 * pulse(t, T.believe[0], 0.7); claim.scale.setScalar(sw * (1 - ramp(t, T.claimFly[1] - 0.12, T.claimFly[1], E.in)) + 0.001); claim.visible = cl < 1 && t < T.claimFly[1]; }
  { const c1 = pop(t, T.check[0], 0.3) * (1 - ramp(t, T.check[1] - 0.2, T.check[1], E.in)), c2 = pop(t, T.claimFly[1] - 0.05, 0.3) * (1 - cl);
    const s = Math.max(c1, c2); check.visible = s > 0.01; check.scale.setScalar(Math.max(0.001, s)); check.position.set(0.04 - 0.9 * cl, 0.155, 0.1); check.rotation.y = 0.12 * Math.sin(t * 2); }
  { const a = Math.max(win(t, ...T.check, 0.2, 0.25), ramp(t, T.claimFly[1], T.claimFly[1] + 0.4, E.out) * (1 - cl), win(t, -1, T.take[0][1] + 0.4, 0.01, 0.4));
    aura.visible = a > 0.01; aura.material.opacity = 0.55 * a; aura.scale.set(0.24, 0.24, 1); aura.position.set(0.04 - 0.9 * cl, 0.12, 0.0); }
  // --- proof 1: TRIED vs AD (opinion columns equal; TRIED's purchase matches; AD's stops short)
  { const vis = t > 6.0 && t < 13.8, H = 0.13, op = ramp(t, ...T.opinions, E.out), bt = ramp(t, ...T.buyTried, E.out), ba = ramp(t, ...T.buyAd, E.out);
    pairs.forEach((p, i) => { p.g.visible = vis; p.op.scale.set(1, H * op + 0.001, 1); p.buy.scale.set(1, (i === 0 ? H * bt : 0.55 * H * ba) + 0.001, 1); p.op.visible = op > 0.005; p.buy.visible = (i === 0 ? bt : ba) > 0.005;
      const hb = i === 0 ? H * bt : 0.55 * H * ba; legends[i][0].position.y = 0.014 + H * op + 0.012; legends[i][0].visible = op > 0.05; legends[i][1].position.y = 0.014 + hb + 0.012; legends[i][1].visible = (i === 0 ? bt : ba) > 0.05;
      placeShadow(p.sh, p.x, 0, 0, 0.07, 0.05, vis ? 0.8 : 0); }); }
  // --- proof 2: new buyers, then the effect travels across 12 months; the second brand's row stays faint ("varied widely")
  { const vis = t > 12.3 && t < 21.2;
    rows.forEach((row, r) => row.forEach((m, i) => { m.visible = vis; const on = ramp(t, T.months[0] + i * 0.085, T.months[0] + i * 0.085 + 0.25, E.out), decay = 1 - i / 15;
      const lvl = r === 0 ? on * decay : on * decay * (1 - 0.8 * ramp(t, ...T.varies, E.inOut)) * ramp(t, T.varies[0] - 0.6, T.varies[0], E.out);
      m.material.emissiveIntensity = 0.9 * lvl; m.position.y = 0.006 + 0.012 * lvl; }));
    buyers.forEach((m, i) => { const [x, y, z] = m.userData.home, u = ramp(t, T.buyers[0] + i * 0.08, T.buyers[0] + i * 0.08 + 0.3, E.outBack); m.visible = vis && u > 0.01; m.position.set(lerp(XM - 0.115, x, Math.min(1, u)), y + 0.05 * Math.sin(Math.PI * Math.min(1, u)), z); m.scale.setScalar(Math.max(0.001, u)); });
    sampleCupM.visible = vis; brandChips.forEach((c) => { c.visible = vis && t > T.months[0]; }); }
  // --- lights: hero spot on the tray (frame 0 + payoff), on the proof sets
  { const tgt = t < 6.5 || t > 20.4 ? [0.03 - 0.9 * cl, 0.1, 0.05] : t < 12.8 ? [XB, 0.05, 0] : [XM, 0.02, 0];
    hero.intensity = 3.2 * (1 - cl); hero.position.set(tgt[0] + 0.12, 1.2, 0.55); hero.target.position.set(...tgt); hero.target.updateMatrixWorld(); }
  // --- CTA tile (app.werbens.com logo): pops up as the booth parts
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lBelieve", T.believe); lab("lCheck", T.check); lab("lMonths", T.monthsLab); lab("lVaries", T.variesLab); lab("lTry", T.tryLab); lab("lProve", T.proveLab);
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
