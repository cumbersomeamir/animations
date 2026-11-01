// Werbens 15 s style test — deterministic Three.js scene (threejs-animation skill workflow).
// Rules applied from the skill: one source of truth for time (frame(t) is pure), seeded randomness, ?t=N freeze harness,
// InstancedMesh for the many tiles (DynamicDrawUsage + per-instance colour), Catmull-Rom camera paths, emissive motion +
// UnrealBloom via EffectComposer -> OutputPass, capped pixel ratio, explicit GPU disposal on teardown.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { T, CAPTIONS, DURATION } from "./timeline.js";

const W = 1080, H = 1920;
// Palette sampled from assets/icon.png (overrides the skill's default colours)
const PAL = { violet: "#6234FB", lav: "#CCC0F7", lavDeep: "#C6BAF6", pale: "#F0EAFC", white: "#FEFEFD", ink: "#1B1433" };

// ---------------------------------------------------------------- math helpers (pure)
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const sstep = (a, b, v) => { const x = inv(a, b, v); return x * x * (3 - 2 * x); };
const E = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  outBack: (t) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
};
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const decay = (t, t0, freq = 3, damp = 6) => (t < t0 ? 0 : Math.exp(-damp * (t - t0)) * Math.sin(2 * Math.PI * freq * (t - t0)));

/** Time-parameterised Catmull-Rom (Hermite, non-uniform knots) → C1-continuous camera motion. */
function timeSpline(keys) {
  // keys: [[t, x, y, z], ...]
  const n = keys.length;
  const tang = keys.map((k, i) => {
    if (i === 0) return keys[1].slice(1).map((v, j) => ((v - k[j + 1]) / (keys[1][0] - k[0])) * (k[4] ?? 1));
    if (i === n - 1) return [0, 0, 0];
    const a = keys[i - 1], b = keys[i + 1];
    return [1, 2, 3].map((j) => (b[j] - a[j]) / (b[0] - a[0]));
  });
  return (t) => {
    if (t <= keys[0][0]) return new THREE.Vector3(keys[0][1], keys[0][2], keys[0][3]);
    if (t >= keys[n - 1][0]) return new THREE.Vector3(keys[n - 1][1], keys[n - 1][2], keys[n - 1][3]);
    let i = 0; while (keys[i + 1][0] < t) i++;
    const a = keys[i], b = keys[i + 1], h = b[0] - a[0], s = (t - a[0]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    const v = [1, 2, 3].map((j, q) => h00 * a[j] + h10 * h * tang[i][q] + h01 * b[j] + h11 * h * tang[i + 1][q]);
    return new THREE.Vector3(v[0], v[1], v[2]);
  };
}

// ---------------------------------------------------------------- renderer (offline: exact 1080x1920, DPR capped to 1)
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.toneMapping = THREE.NeutralToneMapping; // keeps brand violet closer than ACES
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(new THREE.Color("#3A1AA8"), 14, 46);
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);

const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;
scene.environmentIntensity = 0.5;

// lights: studio key + lavender rim + soft hemisphere (no shadow-casting lights: skill perf guidance)
const key = new THREE.DirectionalLight(0xffffff, 1.45); key.position.set(4, 6, 8); scene.add(key);
const rim = new THREE.DirectionalLight(new THREE.Color(PAL.lav), 2.2); rim.position.set(-5, 3, -6); scene.add(rim);
scene.add(new THREE.HemisphereLight(new THREE.Color(PAL.pale), new THREE.Color("#3B1AB0"), 0.3));

// sky gradient dome (deep violet → brand violet glow near the horizon)
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(90, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color("#1E0B6E") }, mid: { value: new THREE.Color("#4C25D9") }, low: { value: new THREE.Color("#7A55FF") } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 low; varying vec3 vP; void main(){ float y = vP.y; vec3 c = y > 0.0 ? mix(mid, top, smoothstep(0.0, 0.55, y)) : mix(mid, low, smoothstep(0.0, -0.5, y)); gl_FragColor = vec4(c, 1.0); }",
  })
);
scene.add(sky);

// ---------------------------------------------------------------- geometry helpers
function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slabGeo(w, h, d, r, bevel = 0.025, seg = 6) {
  const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * bevel, h - 2 * bevel, Math.max(0.01, r - bevel)), {
    depth: Math.max(0.001, d - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: seg,
  });
  g.translate(0, 0, -(d - 2 * bevel) / 2);
  g.computeVertexNormals();
  return g;
}
function faceGeo(w, h, r, z, seg = 6) {
  const g = new THREE.ShapeGeometry(rrShape(w, h, r), seg);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);
  g.translate(0, 0, z);
  return g;
}
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.userData.ctx = ctx; t.userData.canvas = c;
  return t;
}
function rr2(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// ---------------------------------------------------------------- 2D illustration helpers (stylized UI, not real screens)
function avatar(ctx, cx, cy, r, variant = 0, bg = PAL.lav) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
  ctx.clip();
  ctx.fillStyle = PAL.violet;
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.95, r * 0.72, Math.PI, 0); ctx.fill();          // shoulders
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.12, r * 0.38, 0, Math.PI * 2); ctx.fill();       // head
  ctx.fillStyle = "#3B1AB0";
  if (variant === 1) { ctx.beginPath(); ctx.arc(cx, cy - r * 0.3, r * 0.4, Math.PI, 0); ctx.fill(); }                       // cap
  if (variant === 2) { ctx.beginPath(); ctx.arc(cx - r * 0.42, cy - r * 0.38, r * 0.17, 0, Math.PI * 2); ctx.fill(); }      // bun
  if (variant === 3) { ctx.lineWidth = r * 0.12; ctx.strokeStyle = "#3B1AB0"; ctx.beginPath(); ctx.arc(cx, cy - r * 0.12, r * 0.5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } // headphones
  ctx.restore();
}
function bars(ctx, x, y, widths, h, color, gap) {
  ctx.fillStyle = color;
  widths.forEach((w, i) => { rr2(ctx, x, y + i * gap, w, h, h / 2); ctx.fill(); });
}
function check(ctx, cx, cy, r, color = "#fff", lw = r * 0.28) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(cx - r * 0.5, cy); ctx.lineTo(cx - r * 0.12, cy + r * 0.4); ctx.lineTo(cx + r * 0.55, cy - r * 0.42); ctx.stroke(); ctx.restore();
}

function profileCardTex(variant, big = true) {
  const w = big ? 460 : 248, h = big ? 600 : 320;
  return canvasTex(w, h, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, PAL.pale);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PAL.lav; ctx.fillRect(0, 0, w, h * 0.3);
    avatar(ctx, w / 2, h * 0.3, w * 0.2, variant, "#E4DCFB");
    ctx.lineWidth = w * 0.018; ctx.strokeStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(w / 2, h * 0.3, w * 0.2, 0, Math.PI * 2); ctx.stroke();
    bars(ctx, w * 0.2, h * 0.57, [w * 0.6, w * 0.42], h * 0.04, "#C9C0E6", h * 0.085);
    // stat chips (abstract, no numbers)
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 1 ? PAL.lav : "#E7E1F8"; rr2(ctx, w * (0.12 + i * 0.27), h * 0.76, w * 0.22, h * 0.07, h * 0.035); ctx.fill(); }
    ctx.fillStyle = PAL.violet; rr2(ctx, w * 0.25, h * 0.87, w * 0.5, h * 0.075, h * 0.0375); ctx.fill();
    if (big) { ctx.fillStyle = "#fff"; ctx.font = `${Math.round(h * 0.045)}px InterB`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Creator", w / 2, h * 0.909); }
  });
}
function briefTex() {
  const w = 500, h = 640;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = PAL.violet; ctx.fillRect(0, 0, w, 120);
    ctx.fillStyle = "#fff"; ctx.font = "62px InterDisplayXB"; ctx.textBaseline = "middle"; ctx.fillText("BRIEF", 40, 64);
    ctx.fillStyle = PAL.lav; rr2(ctx, 372, 38, 90, 50, 25); ctx.fill();
    bars(ctx, 40, 170, [380, 300, 400, 260], 22, "#D9D1F2", 58);
    for (let i = 0; i < 3; i++) {
      const y = 430 + i * 64;
      ctx.lineWidth = 6; ctx.strokeStyle = PAL.violet; rr2(ctx, 40, y, 40, 40, 10); ctx.stroke();
      check(ctx, 60, y + 20, 22, PAL.violet, 7);
      ctx.fillStyle = "#E3DCF7"; rr2(ctx, 100, y + 10, 220 + (i % 2) * 70, 20, 10); ctx.fill();
    }
  });
}
function chatTex(kind) {
  const w = 520, h = 216;
  return canvasTex(w, h, (ctx) => {
    ctx.fillStyle = kind === 0 ? PAL.violet : "#FFFFFF"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = kind === 0 ? "#FFFFFF" : PAL.ink;
    ctx.font = "74px InterB"; ctx.textBaseline = "middle"; ctx.textAlign = "center";
    if (kind === 0) ctx.fillText("Love it!", w / 2, h / 2 + 4);
    else { ctx.fillText("Draft", w / 2 - 40, h / 2 + 4); ctx.fillStyle = PAL.violet; ctx.beginPath(); ctx.arc(w / 2 + 130, h / 2, 40, 0, Math.PI * 2); ctx.fill(); check(ctx, w / 2 + 130, h / 2 + 2, 40, "#fff", 10); }
  });
}

// ---------------------------------------------------------------- assets (fonts + icon) then build
const icon = new Image();
icon.src = "/assets/icon.png";
await Promise.all([icon.decode(), document.fonts.load("80px InterDisplayXB"), document.fonts.load("40px InterSB"), document.fonts.load("40px InterB")]);

// ---------------------------------------------------------------- tile field (InstancedMesh ×2: body + face)
const N_TILES = 420;
const TW = 0.62, TH = 0.8, TD = 0.06;
const tileBody = new THREE.InstancedMesh(slabGeo(TW, TH, TD, 0.1, 0.018, 4), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.25 }), N_TILES);
const tileFaceTex = profileCardTex(0, false);
const tileFace = new THREE.InstancedMesh(faceGeo(TW - 0.06, TH - 0.06, 0.08, TD / 2 + 0.003, 4), new THREE.MeshStandardMaterial({ map: tileFaceTex, roughness: 0.55, emissive: 0xffffff, emissiveMap: tileFaceTex, emissiveIntensity: 0.08 }), N_TILES);
for (const m of [tileBody, tileFace]) { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); }
const tileTints = [new THREE.Color("#FFFFFF"), new THREE.Color(PAL.pale), new THREE.Color(PAL.lav), new THREE.Color("#E4DCFB")];
const rnd = mulberry32(1337);
const tiles = [];
while (tiles.length < N_TILES) {
  const th = rnd() * Math.PI * 2, r = 1.7 + Math.pow(rnd(), 0.8) * 5.2;
  const x = Math.cos(th) * r * 0.85, y = Math.sin(th) * r * 1.45, z = -9 + rnd() * 42;
  if (Math.abs(z) < 3.5 && Math.hypot(x, y * 0.6) < 3.2) continue; // keep the stage around the phone clear
  tiles.push({ x, y, z, th, rx: (rnd() - 0.5) * 0.5, ry: (rnd() - 0.5) * 0.7, rz: (rnd() - 0.5) * 0.5, ph: rnd() * 6.28, tint: tileTints[Math.floor(rnd() * 4)], side: Math.cos(th) >= 0 ? 1 : -1 });
}
// grid floor slots (chaos -> order), assigned by x-order to minimise crossings
const COLS = 21, ROWS = 20, GX = 0.74, GZ = 0.92, FLOOR_Y = -3.0;
const slots = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) slots.push({ x: (c - (COLS - 1) / 2) * GX, z: (r - (ROWS - 1) / 2) * GZ });
const order = tiles.map((t, i) => i).sort((a, b) => tiles[a].x - tiles[b].x);
const slotOrder = slots.map((s, i) => i).sort((a, b) => slots[a].x - slots[b].x || slots[a].z - slots[b].z);
order.forEach((ti, k) => { const s = slots[slotOrder[k]]; tiles[ti].gx = s.x; tiles[ti].gz = s.z; tiles[ti].gd = Math.hypot(s.x, s.z); });
tiles.forEach((t, i) => { tileBody.setColorAt(i, t.tint); tileFace.setColorAt(i, t.tint); });

// ---------------------------------------------------------------- phone (hero) + icon tile
const PW = 1.9, PH = 3.9, PD = 0.2;
const phone = new THREE.Group(); scene.add(phone);
const phoneBodyMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color("#1C1240"), metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
const phoneBody = new THREE.Mesh(slabGeo(PW, PH, PD, 0.3, 0.05, 10), phoneBodyMat); phone.add(phoneBody);
const SCR_W = 540, SCR_H = 1160;
const screenTex = canvasTex(SCR_W, SCR_H, () => {});
const screen = new THREE.Mesh(faceGeo(PW - 0.14, PH - 0.14, 0.23, PD / 2 + 0.004, 10), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
phone.add(screen);
// halo sprite behind the phone
function radialTex(inner, outer) {
  return canvasTex(256, 256, (ctx) => { const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, inner); g.addColorStop(1, outer); ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256); });
}
const haloMat = new THREE.SpriteMaterial({ map: radialTex("rgba(204,192,247,0.9)", "rgba(98,52,251,0)"), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
const halo = new THREE.Sprite(haloMat); halo.scale.set(7, 9, 1); halo.position.set(0, 0, -0.6); scene.add(halo);
// pulse rings (campaign pulse / docks)
const ringGeo = new THREE.RingGeometry(0.96, 1.0, 96);
const rings = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL.lav).multiplyScalar(2.2), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); scene.add(m); return m; });
// icon tile (the approved Play icon, as a dimensional tile)
const IS = 2.0;
const iconTex = canvasTex(1024, 1024, (ctx) => ctx.drawImage(icon, 0, 0, 1024, 1024));
const iconGroup = new THREE.Group(); scene.add(iconGroup);
iconGroup.add(new THREE.Mesh(slabGeo(IS, IS, 0.22, 0.46, 0.05, 12), new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.violet), roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 })));
iconGroup.add(new THREE.Mesh(faceGeo(IS - 0.04, IS - 0.04, 0.44, 0.112, 12), new THREE.MeshBasicMaterial({ map: iconTex, toneMapped: false })));
iconGroup.visible = false;
// soft floor glow under the stage
const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: radialTex("rgba(204,192,247,0.55)", "rgba(98,52,251,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = FLOOR_Y + 0.02; scene.add(floorGlow);

// ---------------------------------------------------------------- pieces: 3 creators, brief, 2 chats
const pieceBodyMat = (glowColor) => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(PAL.pale), roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.15, emissive: new THREE.Color(glowColor), emissiveIntensity: 0 });
function makePiece(w, h, d, r, tex) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(slabGeo(w, h, d, r, 0.03, 8), pieceBodyMat(PAL.lav));
  const face = new THREE.Mesh(faceGeo(w - 0.07, h - 0.07, Math.max(0.02, r - 0.035), d / 2 + 0.004, 8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.22 }));
  g.add(body, face); g.userData = { body, face };
  scene.add(g);
  return g;
}
const CW = 1.15, CH = 1.5;
const creators = [1, 2, 3].map((v) => makePiece(CW, CH, 0.09, 0.14, profileCardTex(v, true)));
const brief = makePiece(1.22, 1.56, 0.09, 0.12, briefTex());
const chats = [0, 1].map((k) => makePiece(1.25, 0.52, 0.16, 0.26, chatTex(k)));
const pieces = [...creators, brief, ...chats];
// where creators start: inside the tunnel, ahead of the decelerating camera
const CREATOR_START = [new THREE.Vector3(-1.5, 1.6, 6.5), new THREE.Vector3(1.6, -0.6, 8.0), new THREE.Vector3(-1.2, -2.0, 9.5)];
const DOCK = [
  { p: [-1.52, 1.72, 0.55], ry: 0.38 }, { p: [-1.72, 0.0, 0.8], ry: 0.32 }, { p: [-1.48, -1.72, 0.55], ry: 0.38 },
  { p: [1.38, 1.2, 0.55], ry: -0.42 }, { p: [1.45, -0.42, 0.85], ry: -0.36 }, { p: [1.3, -1.32, 0.7], ry: -0.36 },
].map((d) => ({ p: new THREE.Vector3(...d.p), ry: d.ry }));
const DOCK_T = [...T.creatorDock, T.briefDock, ...T.chatDock];

// ---------------------------------------------------------------- light streams (instanced emissive particles)
const N_P = 160;
const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(PAL.lav).multiplyScalar(3.2), fog: false }), N_P);
sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); sparks.frustumCulled = false; scene.add(sparks);

// ---------------------------------------------------------------- post-processing (MSAA target + bloom + output)
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.38, 0.5, 0.97);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------------------------------------------------------------- camera paths (one continuous take)
const camPos = timeSpline([
  [0.0, 0.3, -0.5, 34, 1.25], [1.3, 0.1, 0.0, 19.5], [2.5, 0.25, 0.3, 13.2], [4.2, 2.3, 1.0, 11.0], [6.3, 3.5, 1.4, 9.8],
  [8.2, 1.6, 4.8, 9.6], [10.0, -1.7, 6.4, 8.9], [11.2, -0.7, 3.0, 9.8], [12.4, 0.0, 0.7, 10.2], [15.0, 0.0, 0.55, 9.3],
]);
const camLook = timeSpline([
  [0.0, 0, 0, 0], [2.5, 0, 0.1, 0], [4.2, 0.3, 0.15, 0], [6.3, 0.35, 0.1, 0], [8.2, 0, -0.7, 0], [10.0, 0, -0.9, 0],
  [11.2, 0, 0.6, 0], [12.4, 0, 0.55, 0], [15.0, 0, 0.55, 0],
]);
const camFov = (t) => lerp(56, 40, E.out(inv(0, 2.6, t)));

// ---------------------------------------------------------------- phone screen UI (stylized illustration)
function drawScreen(t) {
  const ctx = screenTex.userData.ctx, w = SCR_W, h = SCR_H;
  ctx.clearRect(0, 0, w, h);
  const ui = sstep(2.2, 2.7, t);          // splash -> app UI
  const toIcon = sstep(10.6, 11.1, t);    // UI -> brand flash
  // base
  ctx.fillStyle = "#F7F4FF"; ctx.fillRect(0, 0, w, h);
  if (ui > 0) {
    ctx.globalAlpha = ui;
    // section title
    ctx.fillStyle = PAL.ink; ctx.font = "50px InterDisplayXB"; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillText("Campaign", 36, 238);
    const pulse = Math.max(0, decay(t, T.campaignPulse, 2, 5));
    ctx.fillStyle = PAL.lav; rr2(ctx, 36, 258, 160 + pulse * 120, 10, 5); ctx.fill();
    const rows = [
      { label: "Creators", n: T.creatorDock.filter((d) => t >= d).length, kind: "avatars" },
      { label: "Brief", n: t >= T.briefDock ? 1 : 0, kind: "doc" },
      { label: "Chats", n: T.chatDock.filter((d) => t >= d).length, kind: "chat" },
    ];
    rows.forEach((row, i) => {
      const y = 300 + i * 214;
      const done = t >= T.rowChecks[i];
      ctx.fillStyle = done ? "#EDE6FF" : "#FFFFFF"; rr2(ctx, 28, y, w - 56, 186, 34); ctx.fill();
      ctx.lineWidth = done ? 6 : 3; ctx.strokeStyle = done ? PAL.violet : "#E2DCF3"; ctx.stroke();
      ctx.fillStyle = PAL.ink; ctx.font = "40px InterB"; ctx.fillText(row.label, 60, y + 64);
      // content chips arrive as pieces dock
      for (let k = 0; k < (row.kind === "avatars" ? 3 : row.kind === "doc" ? 1 : 2); k++) {
        const on = k < row.n;
        const pop = on ? 1 + Math.max(0, decay(t, (row.kind === "avatars" ? T.creatorDock : row.kind === "doc" ? [T.briefDock] : T.chatDock)[k], 3, 7)) * 0.4 : 1;
        const cx = 92 + k * 86, cy = y + 126;
        ctx.save(); ctx.translate(cx, cy); ctx.scale(pop, pop);
        if (!on) { ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.strokeStyle = "#CFC6EC"; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
        else if (row.kind === "avatars") { avatar(ctx, 0, 0, 34, k + 1, "#E4DCFB"); }
        else if (row.kind === "doc") { ctx.fillStyle = PAL.violet; rr2(ctx, -26, -34, 52, 68, 10); ctx.fill(); ctx.fillStyle = "#fff"; rr2(ctx, -16, -12, 32, 6, 3); ctx.fill(); rr2(ctx, -16, 2, 24, 6, 3); ctx.fill(); }
        else { ctx.fillStyle = k ? "#FFFFFF" : PAL.violet; ctx.strokeStyle = PAL.violet; ctx.lineWidth = 4; rr2(ctx, -38, -24, 76, 48, 24); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      // check ring
      const ck = E.outBack(inv(T.rowChecks[i], T.rowChecks[i] + 0.25, t));
      ctx.lineWidth = 4; ctx.strokeStyle = "#D8D0F0"; ctx.beginPath(); ctx.arc(w - 88, y + 93, 34, 0, Math.PI * 2); ctx.stroke();
      if (ck > 0) { ctx.save(); ctx.translate(w - 88, y + 93); ctx.scale(ck, ck); ctx.fillStyle = PAL.violet; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill(); check(ctx, 0, 2, 34, "#fff", 8); ctx.restore(); }
    });
    // tab bar
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, h - 120, w, 120);
    for (let k = 0; k < 4; k++) { ctx.fillStyle = k === 3 ? PAL.violet : "#CFC6EC"; rr2(ctx, 58 + k * 120, h - 78, 66, 36, 18); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // header (full-screen splash collapses into the header bar)
  const headH = lerp(h, 150, ui);
  const g = ctx.createLinearGradient(0, 0, 0, headH); g.addColorStop(0, "#7246FF"); g.addColorStop(1, PAL.violet);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, headH);
  const isz = lerp(250, 64, ui), ix = lerp(w / 2 - 125, 32, ui), iy = lerp(h * 0.4 - 125, 58, ui);
  ctx.save(); rr2(ctx, ix, iy, isz, isz, isz * 0.23); ctx.clip(); ctx.drawImage(icon, ix, iy, isz, isz); ctx.restore();
  ctx.fillStyle = "#FFFFFF"; ctx.font = `${Math.round(lerp(64, 42, ui))}px InterDisplayXB`; ctx.textAlign = ui > 0.5 ? "left" : "center";
  ctx.fillText("Werbens", lerp(w / 2, 112, ui), lerp(h * 0.4 + 200, 106, ui));
  if (toIcon > 0) { ctx.fillStyle = `rgba(255,255,255,${toIcon})`; ctx.fillRect(0, 0, w, h); }
  screenTex.needsUpdate = true;
}

// ---------------------------------------------------------------- HUD (captions + CTA), deterministic DOM
const capsEl = document.getElementById("caps");
const capEls = CAPTIONS.map((c) => {
  if (c.chips) {
    return c.chips.map((ch) => { const el = document.createElement("div"); el.className = "chip"; el.textContent = ch.text; capsEl.appendChild(el); return el; });
  }
  const el = document.createElement("div"); el.className = "cap";
  el.innerHTML = c.lines.map((ln) => `<span class="ln">${ln.split(" ").map((w) => `<span class="w${c.hi.includes(w) ? " hi" : ""}">${w}</span>`).join(" ")}</span>`).join("");
  capsEl.appendChild(el); return el;
});
const tagEl = document.getElementById("tagline");
const TAGLINE = "Discover creators and manage brand campaigns, briefs and conversations."; // verbatim from listing.json
tagEl.innerHTML = TAGLINE.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
const wordmarkEl = document.getElementById("wordmark"), pillEl = document.getElementById("pill"), shineEl = pillEl.querySelector(".shine"), ctaEl = document.getElementById("cta");

function updateHUD(t) {
  CAPTIONS.forEach((c, i) => {
    const out = inv(c.t1 - 0.25, c.t1, t);
    if (c.chips) {
      // one chip per spoken word: pops in on the word, glows violet ("on") for 0.5 s, then settles
      c.chips.forEach((ch, k) => {
        const el = capEls[i][k];
        const a = inv(ch.t - 0.08, ch.t + 0.3, t);
        const vis = a > 0 && out < 1;
        el.style.display = vis ? "block" : "none";
        if (!vis) return;
        const p = E.outBack(a);
        el.classList.toggle("on", t >= ch.t && t < ch.t + 0.55);
        el.style.left = `${ch.x}px`; el.style.top = `${ch.y}px`;
        el.style.opacity = String(Math.min(1, a * 1.6) * (1 - out));
        el.style.transform = `translate(-50%, ${(1 - p) * 50 - out * 30}px) scale(${lerp(0.7, 1, p) * lerp(1, 0.94, out)}) rotate(${(1 - p) * (k % 2 ? 6 : -6)}deg)`;
      });
      return;
    }
    const el = capEls[i];
    const a = inv(c.t0, c.t0 + 0.3, t);
    const vis = a > 0 && out < 1;
    el.style.display = vis ? "block" : "none";
    if (!vis) return;
    const s = lerp(0.86, 1, E.outBack(a)) * lerp(1, 0.94, out);
    el.style.opacity = String(Math.min(1, a * 1.5) * (1 - out));
    el.style.transform = `translate(-50%, ${(1 - E.out(a)) * 40 - out * 30}px) scale(${s})`;
    el.querySelectorAll(".w").forEach((w, k) => {
      const wt = c.t0 + k * 0.12;
      const p = E.outBack(inv(wt, wt + 0.28, t));
      w.style.opacity = String(clamp(p * 1.4));
      w.style.transform = `translateY(${(1 - p) * 34}px)`;
    });
  });
  const ctaOn = t >= T.wordmark - 0.05;
  ctaEl.style.display = ctaOn ? "block" : "none";
  if (ctaOn) {
    const wm = E.outBack(inv(T.wordmark, T.wordmark + 0.45, t));
    wordmarkEl.style.opacity = String(clamp(wm * 1.3));
    wordmarkEl.style.transform = `translateY(${(1 - wm) * 60}px) scale(${lerp(0.9, 1, wm)})`;
    tagEl.querySelectorAll(".w").forEach((w, k) => {
      const p = E.out(inv(T.tagline + k * 0.045, T.tagline + k * 0.045 + 0.3, t));
      w.style.opacity = String(p * 0.95); w.style.transform = `translateY(${(1 - p) * 18}px)`;
    });
    const pl = E.outBack(inv(T.pill, T.pill + 0.4, t));
    pillEl.style.opacity = String(clamp(pl * 1.5));
    pillEl.style.transform = `scale(${pl * (1 + Math.sin((t - T.pill) * 5) * 0.012 * inv(T.pill + 0.4, T.pill + 0.7, t))})`;
    shineEl.style.left = `${lerp(-160, 760, inv(T.shine, T.shine + 0.6, t))}px`;
  }
}

// ---------------------------------------------------------------- pure frame(t)
const dummy = new THREE.Object3D();
const tmpV = new THREE.Vector3(), tmpC = new THREE.Color();
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), eu = new THREE.Euler();

function phoneState(t) {
  // phone: idle float; one full spin while it morphs into the icon tile. Swap happens edge-on (spin = 1.5π),
  // so the icon arrives front-facing (icon rotation = spin - 2π, i.e. -π/2 → 0).
  const m = E.inOut(inv(T.morph[0], T.morph[1], t));
  const spin = m * Math.PI * 2;
  const y = lerp(0, 1.32, E.inOut(inv(T.morph[0] - 0.2, T.morph[1], t))) + Math.sin(t * 1.3) * 0.05 * (1 - m);
  const swap = spin >= Math.PI * 1.5;
  const sy = lerp(1, IS / PH, sstep(0.2, 0.7, m));
  const sx = lerp(1, IS / PW, sstep(0.2, 0.7, m));
  const pop = 1 + Math.max(0, decay(t, T.campaignPulse, 2.5, 6)) * 0.04 + Math.max(0, decay(t, T.morph[1], 2.2, 5)) * 0.08;
  return { spin, y, swap, sx, sy, pop, m };
}

function pieceTransform(i, t, out) {
  const g = pieces[i];
  const d = DOCK[i], td = DOCK_T[i];
  const isCreator = i < 3;
  const fly = isCreator ? 0.75 : i === 3 ? 0.7 : 0.45;
  const t0 = td - fly;
  let pos = new THREE.Vector3(), ry = 0, rx = 0, rz = 0, s = 1, glow = 0, vis = true;
  // start positions
  let start;
  if (isCreator) {
    start = CREATOR_START[i].clone();
    start.y += Math.sin(t * 1.4 + i) * 0.08;
    const ign = inv(T.ignite[i], T.ignite[i] + 0.25, t);
    glow = E.out(ign) * 2.6 * (1 - inv(td, td + 0.6, t)) + Math.max(0, decay(t, td, 2.5, 5)) * 1.5;
    s = lerp(TW / CW, TW / CW * 1.25, E.outBack(ign));
  } else if (i === 3) start = new THREE.Vector3(2.4, -6.5, 1.2);
  else start = new THREE.Vector3(d.p.x + 0.6, d.p.y - 0.4, d.p.z + 1.8);
  if (t < t0) {
    if (!isCreator) vis = false;
    pos.copy(start); ry = isCreator ? Math.sin(t * 0.8 + i) * 0.3 : 0; rx = 0;
  } else if (t < td) {
    const k = inv(t0, td, t), e = E.inOut(k);
    const ctrl = start.clone().lerp(d.p, 0.5); ctrl.y += isCreator ? 1.2 : 0.4; ctrl.z += 1.4;
    // quadratic bezier flight
    pos.copy(start).multiplyScalar((1 - e) * (1 - e)).add(ctrl.clone().multiplyScalar(2 * (1 - e) * e)).add(d.p.clone().multiplyScalar(e * e));
    ry = lerp(isCreator ? Math.sin(t0 * 0.8 + i) * 0.3 : 0.8, d.ry, e) + Math.sin(k * Math.PI) * (isCreator ? 1.6 : 0.6);
    rx = Math.sin(k * Math.PI) * 0.35;
    if (isCreator) s = lerp(TW / CW * 1.25, 1, E.out(k));
    else s = i === 3 ? 1 : E.outBack(inv(t0, t0 + 0.25, t));
  } else {
    pos.copy(d.p); ry = d.ry; s = 1 + Math.max(0, decay(t, td, 3, 7)) * 0.08;
    pos.y += Math.sin(t * 1.2 + i * 1.3) * 0.05;
  }
  // shot 3: lift into an orbit ring around the phone
  const lift = E.inOut(inv(T.ringLift[0] + i * 0.08, T.ringLift[1] + i * 0.08, t));
  if (lift > 0) {
    const ang = (i / 6) * Math.PI * 2 + 0.5 + Math.max(0, t - T.ringLift[0]) * 0.55;
    const R = 2.75, oy = [1.3, 0.2, -0.9, 1.0, -0.2, -1.2][i];
    const op = new THREE.Vector3(Math.sin(ang) * R, oy + Math.sin(t * 1.1 + i) * 0.12, Math.cos(ang) * R);
    pos.lerp(op, lift);
    ry = lerp(ry, ang, lift); rx = lerp(rx, 0, lift);
  }
  // shot 4: spiral into the phone screen
  const sp = E.in(inv(T.spiralIn[0] + i * 0.05, T.spiralIn[1] + i * 0.05, t));
  if (sp > 0) {
    const ang = Math.atan2(pos.x, pos.z) + sp * 2.5;
    const r = Math.hypot(pos.x, pos.z) * (1 - sp);
    pos.set(Math.sin(ang) * r, lerp(pos.y, 0, sp), lerp(Math.cos(ang) * r, 0.3, sp));
    s *= lerp(1, 0.08, sp);
    glow = Math.max(glow, sp * 3);
    if (sp >= 1) vis = false;
  }
  g.visible = vis;
  g.position.copy(pos); g.rotation.set(rx, ry, rz); g.scale.setScalar(s);
  g.userData.body.material.emissiveIntensity = glow;
  out.push({ pos, glow, dockT: td, sp });
}

function frame(t) {
  // camera (single continuous take)
  camera.position.copy(camPos(t));
  camera.fov = camFov(t); camera.updateProjectionMatrix();
  camera.lookAt(camLook(t));

  // phone / icon
  const ps = phoneState(t);
  phone.visible = !ps.swap;
  phone.position.set(0, ps.y, 0);
  phone.rotation.set(0, ps.spin + Math.sin(t * 0.7) * 0.06 * (1 - ps.m), 0);
  phone.scale.set(ps.sx * ps.pop, ps.sy * ps.pop, ps.pop);
  iconGroup.visible = ps.swap;
  iconGroup.position.set(0, ps.y, 0);
  iconGroup.rotation.set(0, ps.spin - Math.PI * 2 + Math.sin(Math.max(0, t - T.morph[1]) * 1.1) * 0.12 * inv(T.morph[1], T.morph[1] + 0.6, t), 0);
  iconGroup.scale.setScalar(ps.pop);
  halo.position.set(0, ps.y, -0.6);
  haloMat.opacity = 0.55 + 0.25 * Math.sin(t * 2.0) * 0.5 + Math.max(0, decay(t, T.campaignPulse, 2, 4)) * 0.4 + sstep(T.morph[0], T.morph[1], t) * 0.3;
  drawScreen(t);

  // pulse rings: campaign pulse, morph hit, grid wave start
  [T.campaignPulse, T.gridWave[0], T.morph[1]].forEach((t0, k) => {
    const r = rings[k], p = inv(t0, t0 + 1.1, t);
    r.visible = p > 0 && p < 1;
    if (!r.visible) return;
    const sc = lerp(1.2, k === 1 ? 9 : 5, E.out(p));
    r.position.set(0, k === 1 ? FLOOR_Y + 0.05 : ps.y, k === 1 ? 0 : -0.15);
    r.rotation.set(k === 1 ? -Math.PI / 2 : 0, 0, 0);
    r.scale.setScalar(sc); r.material.opacity = (1 - p) * 0.9;
  });

  // pieces
  const info = [];
  for (let i = 0; i < pieces.length; i++) pieceTransform(i, t, info);

  // tile field
  const camZ = camera.position.z;
  for (let i = 0; i < N_TILES; i++) {
    const tl = tiles[i];
    // floating chaos state
    let x = tl.x + Math.sin(t * 0.6 + tl.ph) * 0.12, y = tl.y + Math.cos(t * 0.5 + tl.ph) * 0.15, z = tl.z;
    let rx = tl.rx + Math.sin(t * 0.7 + tl.ph) * 0.15, ry = tl.ry + Math.cos(t * 0.6 + tl.ph) * 0.2, rz = tl.rz;
    // shot 1: tiles flip + part as the camera rushes past
    const dz = (t < 3 ? camZ : 13.2) - z;
    const part = 1 - sstep(0.4, 5.5, dz);
    if (part > 0) {
      const push = 1 + part * 0.55;
      x *= push; y *= push;
      ry += part * Math.PI * tl.side;
      rx += part * 0.6;
    }
    // shot 3: snap into the grid floor (wave from the phone outward)
    const w0 = T.gridWave[0] + (tl.gd / 10) * (T.gridWave[1] - T.gridWave[0] - 0.8);
    const g = E.inOut(inv(w0, w0 + 0.8, t));
    let sc = 1;
    if (g > 0) {
      const arc = Math.sin(g * Math.PI) * 1.4;
      x = lerp(x, tl.gx, g); z = lerp(z, tl.gz, g); y = lerp(y, FLOOR_Y, g) + arc;
      rx = lerp(rx, -Math.PI / 2, g); ry = lerp(ry, 0, g); rz = lerp(rz, 0, g);
      // shot 4: ripple from the phone when it becomes the icon
      const rp = t - T.morph[1];
      if (rp > 0) y += Math.sin(tl.gd * 1.6 - rp * 9) * 0.22 * Math.exp(-rp * 1.2) * sstep(0, 0.2, rp) * (tl.gd < rp * 6 ? 1 : 0);
    }
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.setScalar(sc);
    dummy.updateMatrix();
    tileBody.setMatrixAt(i, dummy.matrix);
    tileFace.setMatrixAt(i, dummy.matrix);
    // brighten in the ripple
    const rp = t - T.morph[1];
    const lum = rp > 0 ? Math.max(0, 1 - Math.abs(tl.gd - rp * 6) / 1.2) * Math.exp(-rp * 0.8) : 0;
    tmpC.copy(tl.tint).lerp(new THREE.Color(PAL.lav), 0).offsetHSL(0, 0, lum * 0.08);
    tileFace.setColorAt(i, tmpC);
  }
  tileBody.instanceMatrix.needsUpdate = true;
  tileFace.instanceMatrix.needsUpdate = true;
  tileFace.instanceColor.needsUpdate = true;

  // light streams: from each piece into the phone around its dock, and on the final spiral
  let k = 0;
  dummy.rotation.set(0, 0, 0);
  for (let i = 0; i < pieces.length; i++) {
    const inf = info[i];
    const p = inv(inf.dockT - 0.05, inf.dockT + 0.55, t);
    for (let j = 0; j < 22; j++) {
      const idx = k++;
      if (idx >= N_P) break;
      let active = p > 0 && p < 1;
      const u = clamp(p * 1.6 - j * 0.03);
      if (active && u > 0 && u < 1) {
        const from = inf.pos, to = new THREE.Vector3(0, ps.y, 0.2);
        const mid = from.clone().lerp(to, 0.5); mid.z += 0.9;
        const e = E.inOut(u);
        tmpV.copy(from).multiplyScalar((1 - e) * (1 - e)).add(mid.multiplyScalar(2 * (1 - e) * e)).add(to.clone().multiplyScalar(e * e));
        dummy.position.copy(tmpV);
        dummy.scale.setScalar((1 - j / 22) * (1 - u * 0.5) * 1.2);
      } else { dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.0001); }
      dummy.updateMatrix(); sparks.setMatrixAt(idx, dummy.matrix);
    }
  }
  for (; k < N_P; k++) { dummy.position.set(0, -999, 0); dummy.scale.setScalar(0.0001); dummy.updateMatrix(); sparks.setMatrixAt(k, dummy.matrix); }
  sparks.instanceMatrix.needsUpdate = true;

  floorGlow.material.opacity = sstep(T.gridWave[0], T.gridWave[1], t) * 0.9;

  composer.render();
  updateHUD(t);
}

// ---------------------------------------------------------------- harness (skill: ?t=N freeze; render API for offline capture)
function disposeAll() {
  // skill: GPU resources must be disposed explicitly
  renderer.setAnimationLoop(null);
  scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) for (const m of [].concat(o.material)) { for (const key in m) { const v = m[key]; if (v && v.isTexture) v.dispose(); } m.dispose(); }
  });
  envTex.dispose(); pmrem.dispose(); rt.dispose(); composer.dispose?.(); renderer.dispose();
}
window.__frame = (t) => { frame(t); return renderer.info.render.calls; };
window.__info = () => ({ memory: { ...renderer.info.memory }, programs: renderer.info.programs?.length ?? 0, gl: renderer.capabilities.isWebGL2 ? "webgl2" : "webgl1", samples: rt.samples });
window.__dispose = disposeAll;
const qs = new URLSearchParams(location.search);
if (qs.get("t") !== null) { frame(parseFloat(qs.get("t"))); window.__ready = true; }
else if (qs.get("play") !== null) {
  const clock = new THREE.Clock();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setAnimationLoop(() => frame(reduce ? 12.8 : clock.getElapsedTime() % DURATION));
  window.__ready = true;
} else { frame(0); window.__ready = true; }
