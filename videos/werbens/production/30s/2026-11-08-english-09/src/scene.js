// Werbens · 30 s English-09 — "Same reward, same eight washes. Which card gets finished?" (the endowed progress effect: a real
// head start), in the accepted 'Satisfying Product Theatre' style (same renderer/studio/caption treatment/CTA as feedback-05
// and english-06/07/08; the display board is the accepted easel board). Procedural 3D hero objects on a clean light sweep,
// soft contact shadows, tactile timed changes. Colours/logo from app.werbens.com (context/17).
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, ramp, window as win, key } from "./lib/anim.js";
import { T, RACE, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "130px IDBK", "40px IB", "32px ISB", "700 104px SG"].map((f) => document.fonts.load(f, "FICTIONAL CAR WASH 8 WASHES → 1 FREE Drèze Werbens")));
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

// ------------------------------------------------------------------ the display board (accepted easel board, no header)
const BW = 1.0, BH = 1.12, BD = 0.05, BY = 0.2, FACE = BD / 2 + 0.001;
const board = new THREE.Group(); scene.add(board); const boardSh = contactShadow();
{ const b = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 4, 0.03), mat("#FFFFFF", { roughness: 0.5, clearcoat: 0.3 })); b.position.y = BH / 2; b.castShadow = true; b.receiveShadow = true; board.add(b);
  for (const sx of [-1, 1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, BY + 0.5, 10), mat(C3.navy, { roughness: 0.4 })); leg.position.set(sx * 0.36, (BY + 0.5) / 2 - BY, -0.06); leg.rotation.x = 0.08; leg.castShadow = true; board.add(leg); }
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.1, 10), mat(C3.navy, { roughness: 0.4 })); back.position.set(0, 0.42 - BY, -0.3); back.rotation.x = -0.42; board.add(back); }

// ------------------------------------------------------------------ loyalty cards (fictional car wash)
const CW = 0.88, CH = 0.44;
function cardTex(sub, cols, w = CW, h = CH) { return canvasTex(Math.round(w * 1000), Math.round(h * 1000), (k, cw, ch) => {
  k.fillStyle = "#FFFFFF"; k.beginPath(); k.roundRect(0, 0, cw, ch, 30); k.fill();
  k.fillStyle = C.ink; k.beginPath(); k.roundRect(0, 0, cw, ch * 0.23, [30, 30, 0, 0]); k.fill();
  k.fillStyle = C.mint; fitText(k, "FICTIONAL CAR WASH", "IDBK", cw * 0.9, Math.round(ch * 0.13)); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("FICTIONAL CAR WASH", cw / 2, ch * 0.12);
  k.fillStyle = C.ink; fitText(k, sub, "IB", cw * 0.52, Math.round(ch * 0.1)); k.textAlign = "left"; k.fillText(sub, cw * 0.045, ch * 0.37);
  k.strokeStyle = "rgba(15,23,42,0.55)"; k.lineWidth = Math.max(4, cw * 0.007); k.setLineDash([cw * 0.014, cw * 0.01]);
  for (const [x, y, r] of cols) { k.beginPath(); k.arc((x + w / 2) * (cw / w), (h / 2 - y) * (ch / h), r * (cw / w), 0, Math.PI * 2); k.stroke(); } }); }
const circles = (n, w, rowY = [-0.045, -0.155], r = 0.046) => { const per = n / 2, step = n === 8 ? 0.18 : 0.16, x0 = -((per - 1) * step) / 2; return Array.from({ length: n }, (_, i) => [x0 + (i % per) * step, rowY[Math.floor(i / per)], r]); };
function makeCard(sub, n, parent, scale = 1) {
  const g = new THREE.Group(); parent.add(g); const cs = circles(n, CW);
  const base = new THREE.Mesh(new RoundedBoxGeometry(CW, CH, 0.012, 2, 0.006), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.4, emissive: new THREE.Color("#FFFFFF"), emissiveIntensity: 0 })); base.castShadow = true; base.receiveShadow = true; g.add(base);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.006, CH - 0.006), new THREE.MeshBasicMaterial({ map: cardTex(sub, cs), toneMapped: false, transparent: true })); face.position.z = 0.0065; g.add(face);
  g.scale.setScalar(scale); return { g, cs, base, face, stamps: [] };
}
const STAMP_TEX = canvasTex(256, 256, (k, w, h) => { k.fillStyle = C.mint; k.beginPath(); k.arc(w / 2, h / 2, w * 0.47, 0, 6.28); k.fill(); k.strokeStyle = C.teal; k.lineWidth = 10; k.stroke();
  k.fillStyle = C.ink; k.beginPath(); k.moveTo(w / 2, h * 0.2); k.bezierCurveTo(w * 0.62, h * 0.38, w * 0.72, h * 0.5, w * 0.72, h * 0.6); k.arc(w / 2, h * 0.6, w * 0.22, 0, Math.PI); k.bezierCurveTo(w * 0.28, h * 0.5, w * 0.38, h * 0.38, w / 2, h * 0.2); k.fill(); });
function addStamp(card, i) { const [x, y, r] = card.cs[i]; const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2.15, r * 2.15), new THREE.MeshBasicMaterial({ map: STAMP_TEX, transparent: true, toneMapped: false })); m.position.set(x, y, 0.0085); card.g.add(m); card.stamps[i] = m; return m; }
const cardA = makeCard("8 WASHES → 1 FREE", 8, board), cardB = makeCard("10 WASHES → 1 FREE", 10, board);
const CARD_Y = { A: 0.83, B: 0.33 }, CARD_Z = FACE + 0.008;
cardA.g.position.set(0, CARD_Y.A, CARD_Z); cardB.g.position.set(0, CARD_Y.B, CARD_Z);
for (let i = 0; i < 8; i++) addStamp(cardA, i); for (let i = 0; i < 10; i++) addStamp(cardB, i);
// pill tags on the cards ("8 to go", then "FREE WASH!")
function pillTag(txt, bg, fg, w = 0.24, h = 0.065) { const g = new THREE.Group(); const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.008, 2, 0.004), new THREE.MeshStandardMaterial({ color: bg, roughness: 0.5 })); b.castShadow = true; g.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.004, h - 0.004), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(Math.round(w * 3000), Math.round(h * 3000), (k, cw, ch) => { k.fillStyle = bg; k.beginPath(); k.roundRect(0, 0, cw, ch, ch / 2); k.fill(); k.fillStyle = fg; fitText(k, txt, "IDBK", cw * 0.84, Math.round(ch * 0.56)); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(txt, cw / 2, ch * 0.55); }) }));
  f.position.z = 0.0045; g.add(f); return g; }
const togoA = pillTag("8 TO GO", C.ink, C.mint), togoB = pillTag("8 TO GO", C.ink, C.mint), freeA = pillTag("FREE WASH!", C.mint, C.ink), freeB = pillTag("FREE WASH!", C.mint, C.ink);
for (const [tg, cd] of [[togoA, cardA], [togoB, cardB], [freeA, cardA], [freeB, cardB]]) cd.g.add(tg);
const TAG_POS = [0.29, 0.065, 0.014];

// ------------------------------------------------------------------ the rubber stamp
const stamp = new THREE.Group(); scene.add(stamp);
{ const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 32), mat(C3.mint, { roughness: 0.6, clearcoat: 0.2 })); pad.rotation.x = Math.PI / 2; pad.position.z = 0.007; stamp.add(pad);
  const block = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.13, 0.045, 3, 0.012), mat("#FFFFFF", { roughness: 0.35 })); block.position.z = 0.036; stamp.add(block);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.022, 0.085, 16), mat(C3.navy, { roughness: 0.35 })); neck.rotation.x = Math.PI / 2; neck.position.z = 0.1; stamp.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.042, 24, 18), mat(C3.teal, { roughness: 0.28 })); knob.scale.set(1, 1, 0.8); knob.position.z = 0.16; stamp.add(knob);
  stamp.children.forEach((c) => (c.castShadow = true)); }

// ------------------------------------------------------------------ segmented progress rows (A: 8 blocks; B: 10 blocks, first 2 filled), right-aligned
const BS = 0.06, PITCH = 0.07, ROW_X1 = 0.315, ROW_Z = { A: 0.42, B: 0.86 };
const rows = { A: [], B: [] };
for (const [id, n] of [["A", 8], ["B", 10]]) for (let k = 0; k < n; k++) { const filled = id === "B" && k < 2, m = mat(filled ? C3.mint : "#FFFFFF", { roughness: 0.35, emissive: new THREE.Color(C.mint), emissiveIntensity: 0 });
  const b = new THREE.Mesh(new RoundedBoxGeometry(BS, BS, BS, 3, 0.016), m); b.castShadow = true; b.receiveShadow = true; scene.add(b); rows[id].push({ b, m, x: ROW_X1 - (n - 1 - k) * PITCH, filled }); }

// ------------------------------------------------------------------ lesson props: a new card (welcome stamp) + an onboarding checklist, on small stands
function standFor(w) { const g = new THREE.Group(); scene.add(g); const s = new THREE.Mesh(new RoundedBoxGeometry(w * 0.82, 0.05, 0.16, 3, 0.02), mat("#FFFFFF", { roughness: 0.45 })); s.position.y = 0.025; s.castShadow = true; s.receiveShadow = true; g.add(s);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(w * 0.82, 0.03, 0.02, 2, 0.008), mat(C3.navy, { roughness: 0.4 })); lip.position.set(0, 0.06, 0.045); g.add(lip); return g; }
const CS = 0.85;
const standC = standFor(CW * CS), cardC = makeCard("10 WASHES → 1 FREE", 10, standC, CS); cardC.g.position.set(0, 0.05 + (CH * CS) / 2, 0.03);
const stampC = addStamp(cardC, 0); const welcome = pillTag("WELCOME", C.mint, C.ink, 0.26, 0.07); cardC.g.add(welcome);
const LW_ = 0.46, LH_ = 0.42, LS = 1.35;
const standD = standFor(LW_ * LS), list = new THREE.Group(); standD.add(list); list.scale.setScalar(LS); list.position.set(0, 0.05 + (LH_ * LS) / 2, 0.03);
const STEPS = ["Create account", "Add your car", "Book a wash"];
{ const b = new THREE.Mesh(new RoundedBoxGeometry(LW_, LH_, 0.012, 2, 0.006), mat("#FFFFFF", { roughness: 0.45, clearcoat: 0.4 })); b.castShadow = true; list.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(LW_ - 0.006, LH_ - 0.006), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, map: canvasTex(920, 840, (k, cw, ch) => {
    k.fillStyle = "#FFFFFF"; k.beginPath(); k.roundRect(0, 0, cw, ch, 40); k.fill(); k.fillStyle = C.ink; k.beginPath(); k.roundRect(0, 0, cw, ch * 0.2, [40, 40, 0, 0]); k.fill();
    k.fillStyle = C.mint; fitText(k, "GET STARTED", "IDBK", cw * 0.86, 92); k.textAlign = "center"; k.textBaseline = "middle"; k.fillText("GET STARTED", cw / 2, ch * 0.105);
    STEPS.forEach((s, i) => { const y = ch * (0.36 + i * 0.22); k.strokeStyle = "rgba(15,23,42,0.6)"; k.lineWidth = 8; k.beginPath(); k.roundRect(cw * 0.07, y - 42, 84, 84, 16); k.stroke(); k.fillStyle = C.ink; fitText(k, s, "IB", cw * 0.68, 70); k.textAlign = "left"; k.fillText(s, cw * 0.21, y + 4); }); }) }));
  f.position.z = 0.0065; list.add(f); }
const tickTex = canvasTex(128, 128, (k, w, h) => { k.fillStyle = C.mint; k.beginPath(); k.roundRect(4, 4, w - 8, h - 8, 18); k.fill(); k.strokeStyle = C.ink; k.lineWidth = 14; k.lineCap = "round"; k.lineJoin = "round"; k.beginPath(); k.moveTo(w * 0.25, h * 0.52); k.lineTo(w * 0.43, h * 0.7); k.lineTo(w * 0.76, h * 0.32); k.stroke(); });
const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshBasicMaterial({ map: tickTex, transparent: true, toneMapped: false })); list.add(tick);
const TICK_POS = [-LW_ / 2 + 0.07 * LW_ + (42 / 920) * LW_, LH_ / 2 - 0.36 * LH_, 0.0085];
const C_X = 0, D_X = 0, PROP_Z = 0.72;
const shC = contactShadow(), shD = contactShadow();

// ------------------------------------------------------------------ CTA tile: app.werbens.com logo (SVG unchanged, drawn to a canvas, not tone-mapped)
const tile = new THREE.Group(); scene.add(tile); const tileSh = contactShadow();
const LW = 0.94, LH = LW * (406 / 694);
const logoTex = await new Promise((res) => { const img = new Image(); img.onload = () => { const cv = document.createElement("canvas"); cv.width = 1388; cv.height = 812; cv.getContext("2d").drawImage(img, 0, 0, 1388, 812); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }; img.src = "/assets/brand/app-werbens-logo.svg"; });
{ const slab = new THREE.Mesh(new RoundedBoxGeometry(LW + 0.04, LH + 0.04, 0.12, 5, 0.03), mat(C3.mint, { roughness: 0.3 })); slab.position.y = (LH + 0.04) / 2; slab.castShadow = true; tile.add(slab);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(LW, LH), new THREE.MeshBasicMaterial({ map: logoTex, toneMapped: false })); face.position.set(0, (LH + 0.04) / 2, 0.0605); tile.add(face); }

// ------------------------------------------------------------------ motion helpers
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
const pulse = (t, t0, d = 0.35) => (t < t0 || t > t0 + d ? 0 : Math.sin(Math.PI * ((t - t0) / d)));
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
function slam(g, t, t0, x, y, z, rz = 0, s0 = 1.4, dz = 0.35) { const u = ramp(t, t0, t0 + 0.17, E.in), sq = squash(t, t0 + 0.17, -0.22); g.visible = t >= t0; const sc = lerp(s0, 1, u) * (1 + sq); g.scale.set(sc, sc, 1); g.position.set(x, y, z + lerp(dz, 0, u)); g.rotation.set(0, 0, rz); }
function inkPop(m, t, t0) { m.visible = t >= t0; const s = t < t0 ? 0.001 : (1 + 0.35 * Math.exp(-(t - t0) * 14)) * Math.min(1, 0.6 + (t - t0) * 8); m.scale.set(s, s, 1); }

// ------------------------------------------------------------------ camera (slow dolly between hero framings; no bobbing)
const FRONT = [[0, 1.0, 3.4], [0, 0.8, 0]], EFFECT = [[0, 1.2, 2.4], [0, 0.05, 0.65]], LESSON = [[0, 0.62, 3.0], [0, 0.34, 0.72]];
const CAMS = [
  [0.0, [0, 0.6, 2.55], [0, 0.53 + 0.0, 0]], [1.05, [0, 0.6, 2.45], [0, 0.53, 0]], [2.3, ...FRONT], [13.2, ...FRONT], [14.0, ...EFFECT], [18.3, ...EFFECT], [19.1, ...LESSON],
  [25.0, ...LESSON], [26.0, [0, 1.05, 4.9], [0, 0.34, 0]], [30, [0, 1.03, 4.7], [0, 0.34, 0]],
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

// stamp-time for each circle: B's first two in the hook; the race for the rest
const stampTimeB = (i) => (i < 2 ? T.press[i] : RACE.B[i - 2]), stampTimeA = (i) => RACE.A[i];
// rubber stamp path (board-local targets → world): two presses on B, exit; later one press on the new card
board.position.set(0, BY, 0); board.updateMatrixWorld(true);
const onB = (i) => { const [x, y] = cardB.cs[i]; return board.localToWorld(v3(x, CARD_Y.B + y, CARD_Z + 0.0085)); };
const B1 = onB(0), B2 = onB(1);
function stampPose(t) {
  if (t < 1.5) { const p = key(t, [[-0.3, [B1.x - 0.05, B1.y + 0.04, B1.z + 0.3]], [T.press[0], [B1.x, B1.y, B1.z], E.in], [0.32, [B1.x + 0.02, B1.y + 0.02, B1.z + 0.16], E.out], [0.5, [B2.x, B2.y, B2.z + 0.16]], [T.press[1], [B2.x, B2.y, B2.z], E.in], [0.85, [B2.x, B2.y, B2.z + 0.18], E.out], [T.stampOut[1], [B2.x + 0.9, B2.y + 0.6, B2.z + 0.7], E.in]]); return { p, vis: t <= T.stampOut[1] }; }
  standC.updateMatrixWorld(true); const c0 = cardC.g.localToWorld(v3(cardC.cs[0][0], cardC.cs[0][1], 0.0085));
  const p = key(t, [[T.welcome - 0.55, [c0.x - 0.5, c0.y + 0.45, c0.z + 0.6]], [T.welcome - 0.2, [c0.x, c0.y, c0.z + 0.16]], [T.welcome, [c0.x, c0.y, c0.z], E.in], [T.welcome + 0.2, [c0.x, c0.y, c0.z + 0.16], E.out], [T.welcome + 0.6, [c0.x - 0.6, c0.y + 0.5, c0.z + 0.7], E.in]]);
  return { p, vis: t >= T.welcome - 0.55 && t <= T.welcome + 0.6 };
}

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.in);
  // --- board + cards (card A slams on during the pull-back; B is there from frame 0)
  const bo_ = ramp(t, 13.3, 13.9, E.in), bx = -2.9 * Math.max(cl, bo_); board.position.set(bx, BY, 0); board.visible = cl < 1 && bo_ < 1; placeShadow(boardSh, bx, -0.1, 0, 0.55, 0.25, board.visible ? 0.6 : 0);
  slam(cardA.g, t, 1.25, 0, CARD_Y.A, CARD_Z, 0, 1.1, 0.1); cardB.g.position.set(0, CARD_Y.B, CARD_Z); cardB.g.scale.setScalar(1 + 0.02 * pulse(t, T.badgeB, 0.4));
  cardA.base.material.emissiveIntensity = 0;
  // ink stamps: B's two in the hook, then the race; glow on "two free stamps"
  cardB.stamps.forEach((m, i) => { inkPop(m, t, stampTimeB(i) + 0.01); if (i < 2) m.scale.multiplyScalar(1 + 0.25 * pulse(t, T.freeGlow + i * 0.12, 0.45) + 0.2 * pulse(t, T.headStart, 0.45)); });
  cardA.stamps.forEach((m, i) => inkPop(m, t, stampTimeA(i)));
  // empty circles ripple on "both cards needed eight washes" (subtle board-side ring flash drawn in the HUD)
  // tags: "8 TO GO" on "eight washes", replaced by "FREE WASH!" when each card is full
  const doneA = RACE.A[7] + 0.15;
  slam(togoA, t, T.toGo, ...TAG_POS); togoA.visible = t >= T.toGo && t < doneA; slam(togoB, t, T.toGo + 0.12, ...TAG_POS); togoB.visible = t >= T.toGo + 0.12 && t < T.badgeB;
  slam(freeB, t, T.badgeB, ...TAG_POS, 0.04); slam(freeA, t, doneA, ...TAG_POS, -0.04);
  // --- progress rows (drop in on "endowed progress effect"; B's filled pair glows on "head start"; sink before the lesson)
  const ro = ramp(t, ...T.rowsOut, E.in);
  for (const id of ["A", "B"]) rows[id].forEach((r, k) => { const s = (id === "A" ? T.rowsA + k * 0.08 : T.rowsB + k * 0.07), u = clamp((t - s) / 0.12), drop = t < s + 0.12 ? lerp(0.9, 0, u * u) : 0, sq = squash(t, s + 0.12, -0.18);
    r.b.visible = t >= s && ro < 1; const glow = r.filled ? pulse(t, T.headStart + k * 0.08, 0.5) : 0;
    r.b.position.set(r.x, BS / 2 + drop - BS * 1.1 * ro + 0.05 * glow, ROW_Z[id]); r.b.scale.set(1 - sq * 0.4, 1 + sq, 1 - sq * 0.4); r.m.emissiveIntensity = 0.45 * glow; });
  // --- lesson props: new card on its stand (welcome stamp), checklist on its stand (first step ticked)
  { const ci = ramp(t, ...T.cardC, E.out), co = ramp(t, T.listIn[0] - 0.05, T.listIn[1] - 0.05, E.in), li = ramp(t, ...T.listIn, E.out), xc = lerp(-1.9, C_X, ci) - 1.9 * co, xd = lerp(1.9, D_X, li) + 2.6 * cl;
    standC.visible = t >= T.cardC[0] && co < 1; standC.position.set(xc, 0, PROP_Z); standD.visible = t >= T.listIn[0] && cl < 1; standD.position.set(xd, 0, PROP_Z);
    placeShadow(shC, xc, PROP_Z, 0, 0.3, 0.12, standC.visible ? 1 : 0); placeShadow(shD, xd, PROP_Z, 0, 0.24, 0.12, standD.visible ? 1 : 0);
    inkPop(stampC, t, T.welcome + 0.01); slam(welcome, t, T.welcome + 0.08, ...TAG_POS, 0.03);
    tick.position.set(...TICK_POS); inkPop(tick, t, T.tick); }
  // --- the rubber stamp (after the lesson props are placed: its second target is on the new card)
  { const { p, vis } = stampPose(t); stamp.visible = vis && cl < 1; stamp.position.set(...p); stamp.rotation.set(-0.5, 0.25, 0.12); stamp.scale.setScalar(1.25); }
  // --- CTA tile (app.werbens.com logo)
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.6, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(0, ty, 0.3); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  for (const m of tile.children) m.castShadow = ty < 0.35; placeShadow(tileSh, 0, 0.3, ty, 0.52, 0.12, tile.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD
  board.updateMatrixWorld(true);
  hudAt($("nQ"), (() => { const p = toScreen(board.localToWorld(v3(0.3, (CARD_Y.A + CARD_Y.B) / 2, CARD_Z + 0.05))); return [p[0], p[1]]; })(), win(t, ...T.q, 0.2, 0.25), 0.85 + 0.15 * Math.min(1, pop(t, T.q[0], 0.3)));
  hudAt($("cite"), [540, 562], win(t, ...T.cite, 0.25, 0.3), 0.9 + 0.1 * Math.min(1, pop(t, T.cite[0], 0.3)));
  let svg = "";
  // ripple: rings flash around the eight empty circles on both cards ("both cards needed eight washes")
  for (const [cd, cy, from] of [[cardA, CARD_Y.A, 0], [cardB, CARD_Y.B, 2]]) for (let i = from; i < cd.cs.length; i++) { const k = i - from, o = pulse(t, T.ripple + k * 0.09, 0.45); if (o < 0.02) continue;
    const [x, y, r] = cd.cs[i], c = toScreen(board.localToWorld(v3(x, cy + y, CARD_Z + 0.01))), e = toScreen(board.localToWorld(v3(x + r, cy + y, CARD_Z + 0.01)));
    svg += `<circle cx="${c[0]}" cy="${c[1]}" r="${Math.abs(e[0] - c[0]) * (1.15 + 0.25 * o)}" fill="none" stroke="${C.teal}" stroke-width="7" opacity="${o}"/>`; }
  // brackets over the eight remaining blocks of each row ("already begun"): equal length
  const bo = win(t, ...T.brackets, 0.25, 0.25);
  if (bo > 0.01) for (const id of ["A", "B"]) { const rr = rows[id], first = rr[rr.length - 8], last = rr[rr.length - 1], y = BS + 0.04, a = toScreen(v3(first.x - BS / 2, y, ROW_Z[id])), b = toScreen(v3(last.x + BS / 2, y, ROW_Z[id])), u = ramp(t, T.brackets[0], T.brackets[0] + 0.3, E.out), bx2 = lerp(a[0], b[0], u);
    svg += `<path d="M${a[0]} ${a[1] + 14} L${a[0]} ${a[1]} L${bx2} ${b[1]} L${bx2} ${b[1] + 14}" fill="none" stroke="${C.teal}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="${bo}"/>`; }
  $("ov").innerHTML = svg;
  const wd = ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".note, #lockup, #tagline")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
