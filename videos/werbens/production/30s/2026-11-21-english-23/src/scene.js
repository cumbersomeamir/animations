// Werbens · 30 s English-23 — "THE CUSTOMER BECAME THE CHANNEL" (Spotify Wrapped as an established format: a yearly personal
// listening recap on a ready-to-share card; people share to shape how others see them, so each shared card carries the brand to
// the sharer's friends; Spotify Newsroom 2018/2025, Berger 2014, Toubia & Stephen 2013), in the accepted 'Satisfying Product Theatre'
// style on the live app.werbens.com dark-navy theme (context/17 re-checked 2026-11-21). Original illustrative card; no real users.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win } from "./lib/anim.js";
import { T, CAPTIONS, HIGHLIGHT, GROW } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search), THUMB = Q.get("thumb") === "1";
await Promise.all(["52px IDXB", "130px IDBK", "34px ISB", "40px IB", "700 120px SG", "700 104px SG"].map((f) => document.fonts.load(f, "THE CUSTOMER BECAME THE CHANNEL IT'S YOU HOW WE LOOK BRAND TRAVELS THEIR STORY Werbens")));
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

// ------------------------------------------------------------------ props (illustration): an ORIGINAL music-year card (no Spotify logo,
// colours or UI; no real user data; abstract bars, discs and an avatar; no text), a share tree of little paths on the floor, friend
// pawns, listening discs, a generic ad board, a brand tab. Palette from app.werbens.com.
const HALF = Math.PI / 2, STAND_H = 0.014, CW = 0.09, CH = 0.15, CT = 0.004, CARD_Y = STAND_H + CH / 2, FY = 0.0018;
const stage = new THREE.Group(); scene.add(stage); const stageSh = contactShadow();
// card face background: 135° app.werbens.com gradient (#7FE7DC → #316879); back: teal with the brand tab
const FACE_TEX = canvasTex(360, 600, (k, w, h) => { const g = k.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#7FE7DC"); g.addColorStop(1, "#316879"); k.fillStyle = g; k.beginPath(); k.roundRect(0, 0, w, h, 34); k.fill();
  k.fillStyle = "rgba(15,23,42,0.18)"; k.beginPath(); k.roundRect(18, 300, w - 36, 262, 22); k.fill(); });
const BACK_TEX = canvasTex(360, 600, (k, w, h) => { k.fillStyle = "#316879"; k.beginPath(); k.roundRect(0, 0, w, h, 34); k.fill(); k.fillStyle = "rgba(127,231,220,0.16)"; for (let i = 0; i < 7; i++) { k.beginPath(); k.arc(w / 2, h * 0.55, 30 + i * 26, 0, Math.PI * 2); k.lineWidth = 6; k.strokeStyle = "rgba(127,231,220,0.10)"; k.stroke(); } });
const AVATAR_TEX = canvasTex(256, 256, (k, w) => { const c = w / 2; k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(c, c, c * 0.96, 0, Math.PI * 2); k.fill(); k.fillStyle = "#0F172A"; k.beginPath(); k.arc(c, c * 0.8, c * 0.3, 0, Math.PI * 2); k.fill(); k.beginPath(); k.ellipse(c, c * 1.62, c * 0.56, c * 0.42, 0, Math.PI, 0); k.fill(); k.save(); k.globalCompositeOperation = "destination-in"; k.beginPath(); k.arc(c, c, c * 0.96, 0, Math.PI * 2); k.fill(); k.restore(); });
const discTex = (ring, core) => canvasTex(128, 128, (k, w) => { const c = w / 2; k.fillStyle = core; k.beginPath(); k.arc(c, c, c * 0.95, 0, Math.PI * 2); k.fill(); k.strokeStyle = ring; k.lineWidth = w * 0.09; k.beginPath(); k.arc(c, c, c * 0.62, 0, Math.PI * 2); k.stroke(); k.fillStyle = ring; k.beginPath(); k.arc(c, c, c * 0.14, 0, Math.PI * 2); k.fill(); });
const ARTIST_TEX = [discTex("#7FE7DC", "#0F172A"), discTex("#0F172A", "#F0FDFA"), discTex("#F0FDFA", "#316879")];
const ARROW_TEX = canvasTex(128, 128, (k, w) => { const c = w / 2; k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(c, c, c * 0.95, 0, Math.PI * 2); k.fill(); k.strokeStyle = "#0F172A"; k.lineWidth = w * 0.09; k.lineCap = "round"; k.lineJoin = "round";
  k.beginPath(); k.moveTo(c, w * 0.66); k.lineTo(c, w * 0.26); k.moveTo(w * 0.36, w * 0.4); k.lineTo(c, w * 0.26); k.lineTo(w * 0.64, w * 0.4); k.stroke(); k.beginPath(); k.moveTo(w * 0.3, w * 0.58); k.lineTo(w * 0.3, w * 0.74); k.lineTo(w * 0.7, w * 0.74); k.lineTo(w * 0.7, w * 0.58); k.stroke(); });
const MINI_TEX = canvasTex(128, 128, (k, w) => { const x0 = 33, y0 = 8, cw = 62, ch = 112; const g = k.createLinearGradient(x0, y0, x0 + cw, y0 + ch); g.addColorStop(0, "#7FE7DC"); g.addColorStop(1, "#316879"); k.fillStyle = g; k.beginPath(); k.roundRect(x0, y0, cw, ch, 9); k.fill();
  k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(64, 34, 11, 0, Math.PI * 2); k.fill(); for (let i = 0; i < 3; i++) { k.fillRect(42, 58 + i * 12, 44 - i * 9, 6); } k.fillStyle = "#7FE7DC"; k.strokeStyle = "#0F172A"; k.lineWidth = 2; k.beginPath(); k.roundRect(78, 12, 14, 10, 3); k.fill(); k.stroke(); });
const AD_TEX = canvasTex(400, 260, (k, w, h) => { k.fillStyle = "#0F172A"; k.beginPath(); k.roundRect(0, 0, w, h, 24); k.fill(); k.fillStyle = "#64748B"; k.beginPath(); k.moveTo(120, 110); k.lineTo(250, 50); k.lineTo(250, 210); k.lineTo(120, 150); k.closePath(); k.fill(); k.fillRect(80, 106, 44, 48); k.fillRect(150, 150, 26, 60); k.strokeStyle = "#64748B"; k.lineWidth = 12; k.lineCap = "round"; for (const [a, r] of [[0, 40], [0, 70]]) { k.beginPath(); k.arc(262, 130, r, -0.6, 0.6); k.stroke(); } });

// the hero card (group pivots at its base so it can turn and lift)
const cardG = new THREE.Group(); stage.add(cardG);
const stand = new THREE.Mesh(new RoundedBoxGeometry(0.07, STAND_H, 0.036, 3, 0.005), mat(C3.ink, { roughness: 0.4, clearcoat: 0.6 })); stand.position.y = STAND_H / 2; stand.castShadow = true; stand.receiveShadow = true; stage.add(stand);
const cardBody = new THREE.Mesh(new RoundedBoxGeometry(CW, CH, CT, 3, 0.006), mat("#24586A", { roughness: 0.35, clearcoat: 0.9 })); cardBody.position.y = CARD_Y; cardBody.castShadow = true; cardG.add(cardBody);
const facePlane = (tex, w, h, z, ro = 4) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.z = z; m.renderOrder = ro; return m; };
const front = facePlane(FACE_TEX, CW * 0.985, CH * 0.985, CT / 2 + 0.0004); front.position.y = CARD_Y; cardG.add(front);
const back = facePlane(BACK_TEX, CW * 0.985, CH * 0.985, -(CT / 2 + 0.0004)); back.rotation.y = Math.PI; back.position.y = CARD_Y; cardG.add(back);
const FZ = CT / 2 + 0.0012, el = (o, x, y) => { o.position.set(x, CARD_Y + y, FZ); cardG.add(o); return o; };
const avatar = el(facePlane(AVATAR_TEX, 0.034, 0.034, 0, 5), 0, 0.046);
const avatarGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); avatarGlow.position.set(0, CARD_Y + 0.046, FZ + 0.002); cardG.add(avatarGlow);
const artists = ARTIST_TEX.map((tx, i) => el(facePlane(tx, 0.016, 0.016, 0, 5), (i - 1) * 0.021, 0.017));
const barM = mat(C3.mintw, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.1 }), barGeo = new RoundedBoxGeometry(1, 0.0058, 0.0024, 1, 0.0012); barGeo.translate(0.5, 0, 0);
const BARW = [0.06, 0.05, 0.042, 0.034, 0.026], bars = BARW.map((w, i) => { const b = new THREE.Mesh(barGeo, barM); b.position.set(-0.031, CARD_Y - 0.004 - i * 0.0098, FZ + 0.001); b.userData.w = w; cardG.add(b); return b; });
const ringSegs = Array.from({ length: 20 }, (_, i) => { const a = HALF - (i / 20) * Math.PI * 2, s = new THREE.Mesh(new RoundedBoxGeometry(0.0032, 0.0019, 0.0016, 1, 0.0006), mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.3 })); s.position.set(-0.022 + 0.0092 * Math.cos(a), CARD_Y - 0.058 + 0.0092 * Math.sin(a), FZ + 0.001); s.rotation.z = a + HALF; cardG.add(s); return s; });
const arrow = el(facePlane(ARROW_TEX, 0.019, 0.019, 0, 5), 0.024, -0.058);
const tabM = mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.2 });
for (const z of [1, -1]) { const tab = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.011, 0.0026, 1, 0.002), tabM); tab.position.set(z * 0.032, CARD_Y + 0.064, z * (CT / 2 + 0.0014)); cardG.add(tab); }
const sparks = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (k, w) => { const c = w / 2; const g = k.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.2, "rgba(200,255,248,0.6)"); g.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = g; k.beginPath(); for (let a = 0; a < 8; a++) { const r = a % 2 ? 0.1 * c : c, an = (a * Math.PI) / 4; k.lineTo(c + r * Math.cos(an), c + r * Math.sin(an)); } k.closePath(); k.fill(); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 8; cardG.add(s); return s; });

// ------------------------------------------------------------------ the share tree: 6 levels, 3 children per node (3, 9, 27, 81, 243, 729 =
// 1,092 little paths; illustrative, not reach data)
const RADII = [0, 0.075, 0.15, 0.24, 0.345, 0.47, 0.61];
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const NODES = [{ L: 0, x: 0, z: 0, th: 0, span: Math.PI * 2, parent: -1 }];
for (let L = 1; L <= 6; L++) { const prev = NODES.filter((n) => n.L === L - 1);
  prev.forEach((p) => { const span = L === 1 ? (Math.PI * 2) / 3 : p.span / 3; for (let j = 0; j < 3; j++) { const th = L === 1 ? Math.PI + j * span : p.th + (j - 1) * span, id = NODES.length, r = RADII[L] * (1 + 0.1 * (hash(id) - 0.5)), thj = th + 0.18 * span * (hash(id + 7) - 0.5);
    NODES.push({ L, x: r * Math.sin(thj), z: r * Math.cos(thj), th, span, parent: NODES.indexOf(p) }); } }); }
// dotted segments (parent → node, slightly bowed outward); each dot remembers its level and fraction along the segment
const DOTS = []; NODES.forEach((n, id) => { if (n.parent < 0) return; const p = NODES[n.parent], len = Math.hypot(n.x - p.x, n.z - p.z), cnt = Math.max(4, Math.ceil(len / 0.0058));
  const mx = (p.x + n.x) / 2, mz = (p.z + n.z) / 2, bow = 0.12 * len, nr = Math.hypot(mx, mz) || 1, cx = mx + (mx / nr) * bow, cz = mz + (mz / nr) * bow;
  for (let i = 1; i <= cnt; i++) { const u = i / cnt, x = (1 - u) * (1 - u) * p.x + 2 * u * (1 - u) * cx + u * u * n.x, z = (1 - u) * (1 - u) * p.z + 2 * u * (1 - u) * cz + u * u * n.z; DOTS.push({ L: n.L, u, x, z, d: n.L - 1 + u }); } });
const dotGeo = new THREE.BufferGeometry(); dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(DOTS.length * 3), 3)); dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(DOTS.length * 3), 3));
const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ size: 0.0085, map: GLOW_TEX, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); dots.frustumCulled = false; dots.renderOrder = 3; stage.add(dots);
const miniGeo = new THREE.BufferGeometry(); miniGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(NODES.length * 3), 3));
const minis = new THREE.Points(miniGeo, new THREE.PointsMaterial({ size: 0.026, map: MINI_TEX, transparent: true, alphaTest: 0.35, depthWrite: true, toneMapped: false })); minis.frustumCulled = false; minis.renderOrder = 4; stage.add(minis);
// friends: pawns at level-1 and level-2 nodes (12)
const pawnGeoB = new THREE.CylinderGeometry(0.0072, 0.0092, 0.019, 20), pawnGeoH = new THREE.SphereGeometry(0.0072, 20, 14), pawnMat = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 });
const FRIENDS = NODES.map((n, i) => [n, i]).filter(([n]) => n.L === 1 || n.L === 2).map(([n, i]) => { const g = new THREE.Group(); const b = new THREE.Mesh(pawnGeoB, pawnMat); b.position.y = 0.0095; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnGeoH, pawnMat); h.position.y = 0.0248; h.castShadow = true; g.add(h); stage.add(g); g.userData = { n, i }; return g; });
// listening discs (super hook): 8 small records (groove ring + off-centre label dot so the spin reads) spiral into the card
const discGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.0018, 48), labelGeo = new THREE.CylinderGeometry(0.0058, 0.0058, 0.002, 32);
const grooveGeo = new THREE.TorusGeometry(0.011, 0.00045, 6, 48); grooveGeo.rotateX(HALF); const dotGeoS = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0022, 12);
const discMat = mat(C3.ink, { roughness: 0.22, clearcoat: 1 }), grooveMat = mat("#64748B", { roughness: 0.4 });
const discs = Array.from({ length: 8 }, (_, i) => { const g = new THREE.Group(), sp = new THREE.Group(); g.add(sp);
  const d = new THREE.Mesh(discGeo, discMat); d.castShadow = true; sp.add(d); const gr = new THREE.Mesh(grooveGeo, grooveMat); gr.position.y = 0.0009; sp.add(gr);
  const lb = new THREE.Mesh(labelGeo, mat(i % 2 ? C3.mint : C3.mintw, { roughness: 0.3 })); sp.add(lb); const dt = new THREE.Mesh(dotGeoS, mat(C3.ink, { roughness: 0.4 })); dt.position.set(0.0034, 0.0001, 0); sp.add(dt);
  stage.add(g); g.userData = { a0: (i / 8) * Math.PI * 2 + 0.3 + (i % 2) * 2.4, z0: 0.07 + 0.03 * Math.sin(i * 1.9) }; return g; });
// a generic ad board (proof 1): ink panel with a grey megaphone, on a post
const adG = new THREE.Group(); stage.add(adG);
{ const panel = new THREE.Mesh(new RoundedBoxGeometry(0.104, 0.068, 0.005, 2, 0.004), mat(C3.ink, { roughness: 0.45 })); panel.position.y = 0.1; panel.castShadow = true; adG.add(panel);
  const face = facePlane(AD_TEX, 0.1, 0.065, 0.0029); face.position.y = 0.1; adG.add(face);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 12), mat("#64748B", { roughness: 0.5 })); post.position.y = 0.035; adG.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.004, 24), mat(C3.ink, { roughness: 0.4 })); foot.position.y = 0.002; adG.add(foot); }
const adSh = contactShadow();

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

// ------------------------------------------------------------------ camera: push-in, orbit, crane to top-down, descend (this episode's
// choreography; no lateral plinth slides)
const K = (p, t) => [p, t];
const F0 = K([0, 0.4, 0.6], [0, 0.07, 0]), F0b = K([0, 0.44, 0.57], [0, 0.066, 0]);
const C1 = K([0, 0.12, 0.37], [0, 0.104, 0]), C2 = K([0.09, 0.118, 0.35], [0.004, 0.103, 0]), C2b = K([0.1, 0.118, 0.34], [0.004, 0.103, 0]);
const C3w = K([0.03, 0.155, 0.5], [0, 0.127, 0]);
const O1 = K([-0.26, 0.275, 0.4], [0, 0.131, 0]), O2 = K([-0.38, 0.275, 0.17], [0, 0.131, 0]);
const TOP = K([0, 1.45, 0.24], [0, 0, -0.06]);
const P1 = K([0, 0.16, 0.52], [0, 0.123, 0]), P1b = K([0, 0.158, 0.49], [0, 0.123, 0]);
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const CAMS = [[0, ...F0], [2.6, ...F0b], [3.3, ...F0b], [4.3, ...C1], [7.0, ...C1], [7.7, ...C2], [10.9, ...C2b], [11.4, ...C3w], [14.1, ...C3w], [15.0, ...O1], [17.6, ...O2], [18.4, ...O2], [19.4, ...TOP], [21.25, ...TOP], [22.2, ...P1], [25.4, ...P1b], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
const keysAt = (ks, t) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return va + (vb - va) * E.inOut((t - a) / (b - a)); } return ks[ks.length - 1][1]; };
// face element presence: full at frame 0 → out at faceOut → back on their words → out at reset → back at refill
function facePres(t, tin, tin2) { const out1 = 1 - ramp(t, ...T.faceOut, E.in), in1 = ramp(t, tin, tin + 0.3, E.outBack), out2 = 1 - ramp(t, ...T.reset, E.in), in2 = ramp(t, tin2, tin2 + 0.3, E.outBack);
  if (t < T.faceOut[1]) return out1; if (t < T.reset[0]) return in1; if (t < T.reset[1]) return out2 * in1; return in2; }
const tmpQ = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3();

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(c.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  stage.position.y = -0.3 * cl; stage.visible = cl < 0.999; placeShadow(stageSh, 0, 0, 0, 0.05, 0.03, 0.8 * (1 - cl));

  // --- card: face elements, turn/lift/spin
  const pa = facePres(t, T.avatar, T.self), pb = (i) => facePres(t, T.bars + i * 0.08, T.refill[0] + i * 0.05), pr = facePres(t, T.ring[0], T.refill[0] + 0.25), par = facePres(t, T.artists, T.refill[0] + 0.15), pw = facePres(t, T.arrow, T.worth);
  avatar.scale.setScalar(Math.max(0.001, pa)); avatar.visible = pa > 0.003;
  const glowA = 0.6 * win(t, T.you, T.youLab[1], 0.15, 0.4) + 0.5 * win(t, T.self, T.storyLab[1], 0.15, 0.4) + 0.35 * pulse(t, T.avatar, 0.5);
  avatarGlow.visible = glowA > 0.01; avatarGlow.material.opacity = glowA; avatarGlow.scale.setScalar(0.07);
  artists.forEach((a, i) => { const p = par > 0 ? clamp(par * 3 - i * 0.6) : 0; a.scale.setScalar(Math.max(0.001, Math.min(1.1, p))); a.visible = p > 0.003; });
  bars.forEach((b, i) => { const p = pb(i); b.scale.set(Math.max(0.0005, b.userData.w * clamp(p)), 1, 1); b.visible = p > 0.003; });
  { const sweep = t < T.faceOut[1] ? 1 - ramp(t, ...T.faceOut) : t < T.reset[0] ? ramp(t, ...T.ring, E.lin) : t < T.reset[1] ? 1 - ramp(t, ...T.reset) : ramp(t, T.refill[0] + 0.2, T.refill[1] + 0.2, E.lin);
    ringSegs.forEach((s, i) => { s.visible = i / 20 < sweep - 0.001; }); }
  arrow.scale.setScalar(Math.max(0.001, pw * (1 + 0.25 * pulse(t, T.worth, 0.5) + 0.2 * pulse(t, T.arrow, 0.4)))); arrow.visible = pw > 0.003;
  const turn = win(t, T.turn[0], T.adIn[0] + 0.2, 0.3, 0.4), spin = ramp(t, ...T.spin, E.inOut), lift = 0.008 * win(t, T.you, T.youLab[1], 0.2, 0.4);
  cardG.rotation.y = 0.35 * turn + (Math.PI * 2 - 1.0) * spin + 1.0 * ramp(t, T.reset[0], T.reset[0] + 0.9, E.inOut); // spin ends facing the orbit camera, turns back on the descend cardG.position.y = lift;
  tabM.emissiveIntensity = 0.2 + 0.6 * win(t, T.brand, T.travelLab[1], 0.15, 0.3);
  sparks.forEach((s, j) => { const p = pulse(t, T.you + 0.1 + j * 0.22, 0.5) + pulse(t, T.self + 0.1 + j * 0.2, 0.5); s.visible = p > 0.01; s.material.opacity = Math.min(1, p); const sc = 0.012 + 0.01 * p; s.scale.set(sc, sc, 1); s.position.set([-0.05, 0.05, 0.035][j], CARD_Y + [0.05, 0.03, 0.075][j], 0.01); });

  // --- share tree: dots + mini cards follow the growth level g; a brightness wave flows outward
  { const g = keysAt(GROW, t), pos = dotGeo.attributes.position.array, col = dotGeo.attributes.color.array;
    for (let i = 0; i < DOTS.length; i++) { const d = DOTS[i], on = d.d <= g; pos[3 * i] = d.x; pos[3 * i + 1] = on ? FY : -5; pos[3 * i + 2] = d.z;
      const w = 0.45 + 0.55 * Math.max(0, Math.sin((d.d - t * 1.8) * 2.4)), fade = clamp((g - d.d) * 3 + 0.3); col[3 * i] = 0.5 * w * fade; col[3 * i + 1] = 0.9 * w * fade; col[3 * i + 2] = 0.86 * w * fade; }
    dotGeo.attributes.position.needsUpdate = true; dotGeo.attributes.color.needsUpdate = true;
    const mp = miniGeo.attributes.position.array;
    NODES.forEach((n, i) => { if (n.L === 0) { mp[3 * i + 1] = -5; return; } const p = NODES[n.parent], u = clamp(g - (n.L - 1)); const show = u > 0.02;
      mp[3 * i] = lerp(p.x, n.x, u); mp[3 * i + 1] = show ? 0.016 + (n.L <= 2 ? 0.024 : 0) + 0.01 * Math.sin(Math.PI * u) : -5; mp[3 * i + 2] = lerp(p.z, n.z, u); });
    miniGeo.attributes.position.needsUpdate = true;
    const topness = clamp((camera.position.y - 0.45) / 0.9); minis.material.size = 0.026 * (1 + 0.6 * topness) * (1 + 0.25 * win(t, T.brand, T.travelLab[1], 0.15, 0.3)); dots.material.size = 0.0085 * (1 + 0.5 * topness); }

  // --- friends: visible at frame 0 (hook), hidden during the close-ups, back for proof 2 → CTA; lean in on "how others see us"
  { const vis = (1 - ramp(t, 3.3, 3.6, E.in)) + ramp(t, ...T.friends, E.outBack), ln = 0.28 * win(t, T.lean[0], T.spin[1] + 0.6, 0.3, 0.4);
    pawnMat.emissiveIntensity = 0.25 * win(t, T.lean[0], T.spin[1] + 0.6, 0.3, 0.4) + 0.3 * win(t, T.brand, T.travelLab[1], 0.2, 0.3);
    FRIENDS.forEach((f, k) => { const n = f.userData.n, v = clamp(vis - k * 0.02); f.visible = v > 0.01; f.scale.setScalar(Math.max(0.001, Math.min(1.1, v))); f.position.set(n.x, 0, n.z);
      const r = Math.hypot(n.x, n.z) || 1; AX.set(-n.z / r, 0, n.x / r); f.quaternion.setFromAxisAngle(AX.normalize(), ln); }); }

  // --- listening discs spiral into the card (super hook); the card face brightens a touch as each one lands
  discs.forEach((d, i) => { const t0 = T.discs[0] + i * 0.18, u = ramp(t, t0, t0 + 0.55, E.in), vis = t > t0 - 0.35 && u < 1; d.visible = vis; if (!vis) return;
    const a = ramp(t, t0 - 0.35, t0, E.out), { a0, z0 } = d.userData, ang = a0 + 1.6 * u, R = 0.115 * (1 - u);
    d.position.set(R * Math.cos(ang), CARD_Y - 0.018 + 0.45 * R * Math.sin(ang), lerp(z0, 0.006, u)); d.rotation.set(HALF - 0.45 * (1 - u), 0, 0.25 * (1 - u)); // spiral kept below the caption band
    d.children[0].rotation.y = t * 9 + i; d.scale.setScalar(Math.max(0.001, a * (1 - 0.65 * u))); });
  { let fl = 0; for (let i = 0; i < discs.length; i++) fl += pulse(t, T.discs[0] + i * 0.18 + 0.5, 0.3); front.material.color.setScalar(1 + 0.12 * Math.min(1, fl)); }

  // --- ad board (proof 1): slides in, dims and sinks on "an ad"
  { const ain = ramp(t, ...T.adIn, E.out), aout = ramp(t, ...T.adOut, E.in); adG.visible = ain > 0.01 && aout < 0.99; const ax = 0.22 * (1 - ain); adG.position.set(ax, -0.125 * aout, 0.055); adG.rotation.y = -0.5 * (1 - ain);
    placeShadow(adSh, ax, 0.055, 0, 0.05, 0.02, adG.visible ? 0.8 * (1 - aout) : 0); }

  // --- lights: hero spot on the card
  hero.intensity = 2.4 * (1 - cl); hero.position.set(0.1, 1.1, 0.55); hero.target.position.set(0, CARD_Y, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0;

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lYou", T.youLab); lab("lLook", T.lookLab); lab("lTravel", T.travelLab); lab("lStory", T.storyLab);
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
