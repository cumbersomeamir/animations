// Werbens · 30 s English-25 — "FIND YOUR NAME?" (Share a Coke swapped the logo for popular first names — 150 in Australia at
// the start — so every cooler became a search for your name, and a friend's name became a gift; Coca-Cola Company history page and
// 2014/2015/2025 releases; Shapiro, Caldwell & Sorensen 1997), in the accepted 'Satisfying Product Theatre' style on the live
// app.werbens.com dark-navy theme (context/17 re-checked 2026-11-27). Original generic bottles; no Coca-Cola branding; no figures.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "FIND YOUR NAME? 150 NAMES THE SEARCH YOUR NAME POPS A GIFT FIND + GIVE ABCDEFGHIJKLMNOPQRSTUVWXYZ Werbens")));
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

// ------------------------------------------------------------------ props (illustration): an ORIGINAL cooler of generic bottles
// with first-name labels (no Coca-Cola logo, red, contour bottle or typeface; illustrative common first names), a plain logo
// mark on the reverse of each label, a search light, a stream of name cards, two shopper pawns (SAM, MIA), a ribbon and bow.
// Palette from app.werbens.com.
const HALF = Math.PI / 2;
const stage = new THREE.Group(); scene.add(stage);
const COLS = 5, ROWS = 5, SPX = 0.07, SHELF0 = 0.085, SHELF_DY = 0.115, CW = 0.4, CD = 0.13, CH = SHELF0 + ROWS * SHELF_DY + 0.02;
const COOLER_X = [-0.92, -0.46, 0, 0.46, 0.92, 1.38], HERO = 2;
const HERO_NAMES = ["LEO", "AVA", "NOAH", "ZOE", "MAX", "ELLA", "JACK", "RUBY", "OWEN", "LILY", "ALEX", "SAM", "NINA", "EVAN", "ROSE", "ADAM", "IRIS", "OMAR", "MIA", "JADE", "TOM", "AMY", "BEN", "LUCY", "KAI"]; // row-major from the bottom shelf
const SAM_I = 11, MIA_I = 18;
const OTHER_NAMES = ("LIAM EMMA OLIVIA ETHAN GRACE HENRY CHLOE LUCAS SOFIA JAMES ISLA FINN HANNA LEAH LUKE NORA ELI MAYA JOEL TARA ZANE ANNA COLE ERIN DEAN " +
  "HOLLY IVAN JUNE KYLE LANA MILES NADIA OSCAR PIA QUINN RHYS SARA THEO UMA VERA WADE YARA ZARA ARLO BELLA CARL DAISY EDEN FELIX GIA HUGO INES JUDE KIRA " +
  "LOLA MARCO NIA OTTO PAIGE RAJ SKYE TESS VICTOR WREN YUSUF ZEKE ALMA BRUNO CLARA DARIO ELENA FAYE GABE HAZEL IGOR JONAH KEIRA LEON MOLLY NICO OLGA PERCY " +
  "REX STELLA TOBY ULLA VINCE WILLA AIDEN BRYN CORA DREW EVIE FRED GINA HARRY ILSE JASON KATE LIZ MIKE NOEL OLLIE PETRA RENEE SEAN TINA VIOLA WALT AMIR " +
  "BETH CHRIS DORA EZRA FLORA GREG HEIDI ISAAC JESS").split(" ");
const ALL_NAMES = [...HERO_NAMES, ...OTHER_NAMES].slice(0, 150);
// label atlas: 4 × 38 cells of 512 × 64; name centred at u = 0.5 (bottle front), plain logo mark split across u = 0/1 (back)
const AT_C = 4, AT_R = 38, CELL_W = 512, CELL_H = 64;
const ATLAS = (() => { const cv = document.createElement("canvas"); cv.width = AT_C * CELL_W; cv.height = AT_R * CELL_H; const k = cv.getContext("2d");
  ALL_NAMES.forEach((nm, i) => { const x0 = (i % AT_C) * CELL_W, y0 = Math.floor(i / AT_C) * CELL_H; k.save(); k.beginPath(); k.rect(x0, y0, CELL_W, CELL_H); k.clip();
    k.fillStyle = "#F0FDFA"; k.fillRect(x0, y0, CELL_W, CELL_H); k.fillStyle = "#7FE7DC"; k.fillRect(x0, y0 + 4, CELL_W, 5); k.fillRect(x0, y0 + CELL_H - 9, CELL_W, 5);
    k.fillStyle = "#0F172A"; k.font = "700 40px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, x0 + CELL_W / 2, y0 + CELL_H / 2 + 2);
    for (const cx of [x0, x0 + CELL_W]) { k.strokeStyle = "#316879"; k.lineWidth = 7; k.beginPath(); k.arc(cx, y0 + CELL_H / 2, 17, 0, Math.PI * 2); k.stroke(); k.fillStyle = "#316879"; k.beginPath(); k.arc(cx, y0 + CELL_H / 2, 6, 0, Math.PI * 2); k.fill(); }
    k.restore(); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
const labelTex = (i) => { const t = ATLAS.clone(); t.repeat.set(1 / AT_C, 1 / AT_R); t.offset.set((i % AT_C) / AT_C, 1 - (Math.floor(i / AT_C) + 1) / AT_R); t.needsUpdate = true; return t; };
// bottle: generic lathe profile (straight body, round shoulder, neck), dark teal glass look; mint cap
const BOTTLE_GEO = new THREE.LatheGeometry([[0, 0], [0.0132, 0], [0.0145, 0.004], [0.0145, 0.055], [0.0128, 0.062], [0.0072, 0.071], [0.006, 0.081], [0.0064, 0.0835], [0, 0.0835]].map(([x, y]) => new THREE.Vector2(x, y)), 36);
const CAP_GEO = new THREE.CylinderGeometry(0.0068, 0.0068, 0.008, 24), LABEL_GEO = new THREE.CylinderGeometry(0.0152, 0.0152, 0.026, 48, 1, true, Math.PI, Math.PI * 2);
const M = { glass: mat("#1D5560", { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), cap: mat(C3.mint, { roughness: 0.35 }), frame: mat(C3.ink, { roughness: 0.45, clearcoat: 0.6 }),
  back: new THREE.MeshStandardMaterial({ color: "#0E2630", emissive: "#7FE7DC", emissiveIntensity: 0.16, roughness: 0.8 }), shelf: mat("#64748B", { roughness: 0.45, clearcoat: 0.4 }),
  strip: new THREE.MeshBasicMaterial({ color: "#7FE7DC", toneMapped: false }), header: mat(C3.teal, { roughness: 0.5 }), pawn: mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 }),
  pawn2: mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 }), ribbon: mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.25 }) };
const box = (w, h, d, m, x = 0, y = 0, z = 0, r = 0.002) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
// coolers: open-front cabinet, lit back panel, five shelves with a light strip, header
const COOLERS = COOLER_X.map((cx, ci) => { const g = new THREE.Group(); g.position.set(cx, 0, 0); stage.add(g);
  g.add(box(CW, CH, 0.012, M.back, 0, CH / 2, -CD / 2, 0.003), box(0.014, CH + 0.04, CD, M.frame, -CW / 2, (CH + 0.04) / 2, 0, 0.004), box(0.014, CH + 0.04, CD, M.frame, CW / 2, (CH + 0.04) / 2, 0, 0.004),
    box(CW + 0.014, 0.05, CD + 0.01, M.header, 0, CH + 0.025, 0.003, 0.006), box(CW + 0.014, SHELF0 - 0.004, CD, M.frame, 0, (SHELF0 - 0.004) / 2, 0, 0.004));
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(CW * 0.82, 0.008), M.strip); hs.position.set(0, CH + 0.025, CD / 2 + 0.009); g.add(hs);
  for (let r = 1; r < ROWS; r++) { g.add(box(CW - 0.014, 0.004, CD - 0.01, M.shelf, 0, SHELF0 + r * SHELF_DY - 0.002, 0, 0.001)); const st = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.02, 0.0025), M.strip); st.position.set(0, SHELF0 + r * SHELF_DY - 0.002, CD / 2 - 0.004); g.add(st); }
  g.userData.bottles = []; return g; });
// 150 bottles (6 coolers × 25), each with its own label (atlas cell); hero cooler bottles are individually animated
const BOTTLES = [];
COOLERS.forEach((g, ci) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const local = r * COLS + c, idx = ci === HERO ? local : 25 + (ci < HERO ? ci : ci - 1) * 25 + local;
  const b = new THREE.Group(); b.position.set((c - 2) * SPX, SHELF0 + r * SHELF_DY, 0.012); g.add(b);
  const body = new THREE.Mesh(BOTTLE_GEO, M.glass); body.castShadow = true; b.add(body); const cap = new THREE.Mesh(CAP_GEO, M.cap); cap.position.y = 0.0875; b.add(cap);
  const lm = new THREE.MeshStandardMaterial({ map: labelTex(idx), roughness: 0.55, emissive: "#7FE7DC", emissiveMap: null, emissiveIntensity: 0 }); const lab = new THREE.Mesh(LABEL_GEO, lm); lab.position.y = 0.031; b.add(lab);
  b.userData = { ci, r, c, local, idx, lab, lm, home: b.position.clone() }; g.userData.bottles.push(b); BOTTLES.push(b); } });
const HERO_B = COOLERS[HERO].userData.bottles, SAM_B = HERO_B[SAM_I], MIA_B = HERO_B[MIA_I];
const bottleWorld = (b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; };
// search light: soft additive glow + the hero spot follow it
const scanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scanGlow.renderOrder = 8; scanGlow.scale.setScalar(0.11); stage.add(scanGlow);
const ringTex = canvasTex(256, 256, (k, w) => { const c = w / 2; k.strokeStyle = "rgba(127,231,220,1)"; k.lineWidth = 12; k.beginPath(); k.arc(c, c, c * 0.8, 0, Math.PI * 2); k.stroke(); });
const scanRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })); scanRing.renderOrder = 9; scanRing.scale.setScalar(0.06); stage.add(scanRing);
// name-card stream (proof 2): cards rush past in front of the cooler; SAM's card stops and pops
const cardTex = (nm, hi) => canvasTex(320, 96, (k, w, h) => { k.fillStyle = hi ? "#F0FDFA" : "#E2F2EF"; k.beginPath(); k.roundRect(3, 3, w - 6, h - 6, 18); k.fill(); k.fillStyle = "#7FE7DC"; k.fillRect(20, 10, w - 40, 6); k.fillRect(20, h - 16, w - 40, 6);
  k.fillStyle = "#0F172A"; k.font = "700 50px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, w / 2, h / 2 + 2); });
const STREAM_NAMES = ["LIAM", "EMMA", "NOAH", "ZOE", "OSCAR", "RUBY", "SAM", "LILY", "JACK", "NORA", "MAX", "ELLA", "OWEN", "AVA", "FINN", "ROSE"];
const STREAM = STREAM_NAMES.map((nm, i) => { const sam = nm === "SAM"; const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.036), new THREE.MeshBasicMaterial({ map: cardTex(nm, sam), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  m.renderOrder = sam ? 12 : 11; stage.add(m); m.userData = { i, sam }; return m; });
const samCardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); samCardGlow.renderOrder = 10; stage.add(samCardGlow);
// shoppers: SAM (finder) and MIA (friend); pawns at shopper scale (taller than the bottles)
function makePawn(m) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.12, 28), m); b.position.y = 0.06; b.castShadow = true; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.034, 28, 20), m); hd.position.y = 0.155; hd.castShadow = true; g.add(hd); return g; }
const badgeTex = (nm) => canvasTex(192, 72, (k, w, h) => { k.fillStyle = "#316879"; k.beginPath(); k.roundRect(2, 2, w - 4, h - 4, 14); k.fill(); k.fillStyle = "#F0FDFA"; k.font = "700 44px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, w / 2, h / 2 + 2); });
const shopper = makePawn(M.pawn), friend = makePawn(M.pawn2); stage.add(shopper, friend);
for (const [p, nm] of [[shopper, "SAM"], [friend, "MIA"]]) { const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.019), new THREE.MeshBasicMaterial({ map: badgeTex(nm), transparent: true, toneMapped: false })); bd.position.set(0, 0.085, 0.0355); bd.rotation.x = -0.12; p.add(bd); }
// gift: ribbon ring round the body + a vertical band + bow at the neck (on MIA's bottle)
const giftG = new THREE.Group(); MIA_B.add(giftG);
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0152, 0.0022, 10, 40), M.ribbon); ring.rotation.x = HALF; ring.position.y = 0.045; giftG.add(ring);
  for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0024, 10, 24), M.ribbon); loop.position.set(s * 0.008, 0.075, 0.008); loop.rotation.set(0, s * 0.5, s * 0.6); giftG.add(loop); } }
const findRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })); findRing.renderOrder = 9; stage.add(findRing);

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

// ------------------------------------------------------------------ camera: the eye's search (this episode's choreography): wide
// on the cooler with a darting light → push to the labels → diagonal pull-back along the wall of coolers → shelf-by-shelf scan →
// static stream of names in front of the lens → close on the friend's bottle → two-shot hand-over → CTA
const K = (p, t) => [p, t];
const F0 = K([0.13, 0.44, 0.78], [0.0, 0.675, 0]), H1 = K([0.09, 0.45, 0.74], [0.0, 0.66, 0]); // frame 0: upper shelves big, dark space above the cooler for the headline
const C1 = K([0.05, 0.4, 0.62], [0, 0.38, 0]), C1b = K([0.04, 0.4, 0.58], [0, 0.38, 0]);
const W1 = K([-3.2, 1.0, 1.2], [-0.15, 0.6, 0]), W1b = K([-3.26, 1.02, 1.24], [-0.15, 0.6, 0]); // solved by projection: all six coolers in x 48–942, y 756–1769 (below the label)
const S1 = K([0.0, 0.45, 1.12], [0, 0.42, 0]), S1b = K([0.0, 0.44, 1.06], [0, 0.42, 0]);
const ST = K([0.0, 0.38, 0.95], [0, 0.36, 0.1]), STb = K([0.0, 0.38, 0.9], [0, 0.36, 0.1]);
const G1 = K([0.08, 0.46, 0.8], [0.02, 0.4, 0.05]), G1b = K([0.07, 0.46, 0.75], [0.02, 0.4, 0.05]);
const P1 = K([0.01, 0.32, 1.42], [0.01, 0.21, 0.32]), P1b = K([0.01, 0.32, 1.37], [0.01, 0.21, 0.32]);
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const CAMS = [[0, ...F0], [2.9, ...H1], [3.9, ...C1], [5.9, ...C1b], [7.4, ...W1], [9.75, ...W1b], [10.8, ...S1], [12.95, ...S1b], [13.7, ...ST], [17.2, ...STb],
  [18.2, ...G1], [20.6, ...G1b], [21.8, ...P1], [25.6, ...P1b], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
// search-light paths (hero cooler indices, row-major from the bottom shelf)
const HOOK_PATH = [22, 18, 24, 15, 21, 17], SEARCH_PATH = [20, 21, 22, 23, 24, 19, 18, 17, 16, 15, 10];
const labelFront = (i) => { const b = HERO_B[i]; return v3(b.userData.home.x, b.userData.home.y + 0.031, 0.04); };
function pathAt(path, t, [t0, t1]) { const n = path.length, u = clamp((t - t0) / (t1 - t0)) * (n - 1), k = Math.min(n - 2, Math.floor(u)), f = E.inOut(u - k); return labelFront(path[k]).lerp(labelFront(path[k + 1]), f); }
const checkedAt = (t) => { const u = clamp((t - T.search[0]) / (T.search[1] - T.search[0])) * (SEARCH_PATH.length - 1); return new Set(SEARCH_PATH.slice(0, Math.floor(u) + 1)); };
const S_POS = [-0.13, 0, 0.45], F_POS = [0.155, 0, 0.45], SAM_OUT = v3(-0.07, SHELF0 + 2 * SHELF_DY + 0.01, 0.105), MIA_OUT = v3(0.07, SHELF0 + 3 * SHELF_DY + 0.01, 0.105);
const SAM_HAND = v3(-0.075, 0.05, 0.47), GIFT_START = v3(-0.035, 0.05, 0.47), GIFT_END = v3(0.105, 0.05, 0.47);

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, c.tgt.z + 1.75); key_.target.position.set(c.tgt.x, 0.2, c.tgt.z); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut); stage.position.y = -0.9 * cl; stage.visible = cl < 0.999;
  const streamDim = win(t, T.stream[0] - 0.2, T.stream[1], 0.4, 0.4); key_.intensity = 11 * (1 - 0.35 * streamDim);
  M.back.emissiveIntensity = 0.16 * (1 - 0.5 * streamDim);

  // --- coolers: the five extra coolers rise on "150"; hero cooler always present
  COOLERS.forEach((g, ci) => { if (ci === HERO) return; const d = Math.abs(ci - HERO) * 0.1, u = E.outBack(ramp(t, T.coolers[0] + d, T.coolers[0] + d + 0.45)), gone = ramp(t, T.search[0] - 0.4, T.search[0]);
    g.visible = u > 0.01 && gone < 0.99; g.position.y = -CH * (1 - Math.min(1, u)) - 0.9 * gone; });

  // --- hero labels: names at frame 0; spin to the plain logo on "Share a Coke"; spin back to names in a wave on "swapped … names"
  const checked = t >= T.search[0] && t < T.search[1] + 0.6 ? checkedAt(t) : null;
  HERO_B.forEach((b, i) => { const { r, c: col, lab, lm } = b.userData;
    const lp = E.inOut(ramp(t, T.toLogo[0] + col * 0.05 + (4 - r) * 0.02, T.toLogo[0] + col * 0.05 + (4 - r) * 0.02 + 0.3)), sw = E.outBack(ramp(t, T.swap[0] + (col + (4 - r)) * 0.13, T.swap[0] + (col + (4 - r)) * 0.13 + 0.45));
    lab.rotation.y = Math.PI * lp + Math.PI * sw;
    const dim = checked && checked.has(i) && i !== SAM_I ? 0.55 : 1; lm.color.setScalar(dim * (1 - 0.3 * streamDim)); });
  // --- the search light: darting in the hook, zigzag shelf by shelf in proof 1
  { let p = null, o = 0; if (t >= T.scanHook[0] - 0.2 && t < T.scanHook[1] + 0.3) { p = pathAt(HOOK_PATH, t, T.scanHook); o = win(t, T.scanHook[0] - 0.4, T.scanHook[1] + 0.3, 0.2, 0.3); } // lit from frame 0
    if (t >= T.search[0] - 0.2 && t < T.search[1] + 0.4) { p = pathAt(SEARCH_PATH, t, T.search); o = win(t, T.search[0] - 0.2, T.search[1] + 0.4, 0.2, 0.3); }
    if (THUMB) { p = labelFront(HOOK_PATH[0]); o = 1; }
    scanGlow.visible = scanRing.visible = o > 0.01; if (p) { scanGlow.position.copy(p); scanRing.position.copy(p).setZ(p.z + 0.005); }
    scanGlow.material.opacity = 0.55 * o; scanRing.material.opacity = 0.9 * o; scanRing.scale.setScalar(0.05 + 0.006 * Math.sin(t * 9));
    hero.intensity = 1.6 * o; if (p) { hero.position.set(p.x + 0.25, p.y + 0.7, p.z + 0.9); hero.target.position.copy(p); hero.target.updateMatrixWorld(); } heroC.intensity = 0; }

  // --- name-card stream: cards rush past; SAM's card decelerates, stops centre and pops on "grabs attention"; others slip by dimmed
  STREAM.forEach((m) => { const { i, sam } = m.userData; const mt = m.material;
    if (sam) { const t0 = T.samPop - 0.34, u = E.out(ramp(t, t0, T.samPop)), pop = E.outBack(ramp(t, T.samPop, T.samPop + 0.3)), fly = ramp(t, ...T.foundSam, E.inOut);
      const home = v3(0.3 * (1 - u), 0.36, 0.4); m.position.copy(home.lerp(SAM_OUT.clone().add(v3(0, 0.031, 0.02)), fly)); const sc = (1 + 0.45 * pop) * (1 - 0.75 * fly); m.scale.set(sc, sc, 1);
      mt.opacity = t < t0 ? 0 : Math.min(ramp(t, t0, t0 + 0.12), 1 - ramp(t, T.foundSam[1] - 0.15, T.foundSam[1])); m.visible = mt.opacity > 0.01;
      samCardGlow.position.copy(m.position).setZ(m.position.z - 0.005); samCardGlow.scale.set(0.24 * sc, 0.1 * sc, 1); samCardGlow.material.opacity = 0.7 * pop * mt.opacity; samCardGlow.visible = samCardGlow.material.opacity > 0.01; return; }
    const t0 = T.stream[0] + i * 0.26, u = (t - t0) / 0.85, x = lerp(0.32, -0.32, u), after = ramp(t, T.samPop, T.samPop + 0.3);
    m.position.set(x, 0.36 + 0.03 * ((i % 3) - 1), 0.37 - 0.012 * (i % 2)); m.scale.set(1 + 0.25 * after, 1, 1);
    mt.opacity = u <= 0 || u >= 1 || t > T.stream[1] ? 0 : Math.min(clamp(u * 6), clamp((1 - u) * 6)) * (1 - 0.6 * after); m.visible = mt.opacity > 0.01; });

  // --- found: SAM's bottle glows and slides out; the friend's (MIA) glows, slides out, gets a ribbon; payoff: both go to SAM's
  // hands, a find ring pulses round SAM's bottle, the gift arcs to MIA
  { const so = E.outBack(ramp(t, ...T.foundSam)), pay = ramp(t, T.payCam[0], T.payCam[1] - 0.1, E.inOut);
    const sOut = SAM_B.userData.home.clone().lerp(SAM_OUT, Math.min(1, so)); SAM_B.position.copy(sOut.lerp(SAM_HAND, pay)); SAM_B.userData.lm.emissiveIntensity = 0;
    SAM_B.userData.lab.material.emissive.set("#7FE7DC"); SAM_B.userData.lm.emissiveIntensity = 0.35 * win(t, T.foundSam[0], T.payCam[0] + 0.5, 0.2, 0.5) + 0.4 * pulse(t, T.findMark, 0.6);
    const mo = E.outBack(ramp(t, ...T.pullMia)), hand = ramp(t, ...T.handOver, E.inOut), mStart = MIA_B.userData.home.clone().lerp(MIA_OUT, Math.min(1, mo)).lerp(GIFT_START, pay);
    const arc = GIFT_START.clone().lerp(GIFT_END, hand); arc.y += 0.08 * Math.sin(Math.PI * hand); MIA_B.position.copy(hand > 0 ? arc : mStart);
    MIA_B.userData.lm.emissiveIntensity = 0.45 * win(t, T.friend, T.giftLab[1], 0.15, 0.5) + 0.3 * pulse(t, T.handOver[1], 0.6);
    const gs = E.outBack(ramp(t, T.gift - 0.15, T.gift + 0.2)); giftG.scale.setScalar(Math.max(0.001, gs)); giftG.visible = gs > 0.01;
    M.ribbon.emissiveIntensity = 0.25 + 0.5 * pulse(t, T.gift, 0.5) + 0.4 * pulse(t, T.handOver[1], 0.6);
    findRing.position.copy(SAM_B.position).add(v3(0, 0.042, 0.02)); const fr = pulse(t, T.findMark - 0.05, 0.9); findRing.material.opacity = 0.9 * fr; findRing.visible = fr > 0.01; findRing.scale.setScalar(0.07 + 0.05 * ramp(t, T.findMark - 0.05, T.findMark + 0.85)); }
  // --- shoppers: SAM and MIA arrive for the payoff two-shot
  { const sv = THUMB ? 0 : E.outBack(ramp(t, T.payCam[0] + 0.2, T.payCam[0] + 0.6)); // SAM appears for the payoff only (out of frame in the search shot)
    shopper.visible = sv > 0.01; shopper.scale.setScalar(Math.max(0.001, Math.min(1.1, sv))); shopper.position.set(...S_POS); shopper.rotation.y = 0.25;
    const fv = THUMB ? 0 : E.outBack(ramp(t, T.payCam[0] + 0.4, T.payCam[0] + 0.8)); friend.visible = fv > 0.01; friend.scale.setScalar(Math.max(0.001, fv)); friend.position.set(...F_POS); friend.rotation.y = -0.25;
    M.pawn2.emissiveIntensity = 0.35 * pulse(t, T.handOver[1], 0.8); M.pawn.emissiveIntensity = 0.25 * pulse(t, T.findMark, 0.7); }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("l150", T.lab150); lab("lSearch", T.searchLab); lab("lPop", T.popLab); lab("lGift", T.giftLab); lab("lGive", T.giveLab);
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
