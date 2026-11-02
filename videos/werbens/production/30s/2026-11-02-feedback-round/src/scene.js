// Werbens · 30 s feedback-round #01 — "The decoy effect" in the 'Satisfying Product Theatre' style:
// uncluttered procedural 3D hero objects on a clean light studio sweep, soft contact shadows, tactile timed shape/scale changes.
// Deterministic: every object, camera and HUD value is a pure function of t (scene.html?t=N; window.__frame(t)).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { E, clamp, lerp, key, ramp, window as win, wobble } from "./lib/anim.js";
import { makeCup, contactShadow, levelFor, radiusAt } from "./cup.js";
import { MENU, T, CAPTIONS, HIGHLIGHT } from "./timeline.js";

const W = 1080, H = 1920, $ = (id) => document.getElementById(id);
await Promise.all(["54px IDXB", "50px IDBlack", "30px ISB", "30px IB"].map((f) => document.fonts.load(f)));
const WJ = await (await fetch("/src/words.json")).json();

// ------------------------------------------------------------------ renderer + studio
const canvas = $("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.localClippingEnabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color("#F1EFF6");
const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 80);
// seamless sweep: flat floor that curves up into a backdrop (white / light lavender-grey negative space)
{
  const g = new THREE.PlaneGeometry(40, 30, 1, 120); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < -2.5) { const d = -2.5 - z; p.setY(i, d * d * 0.32); p.setZ(i, -2.5 - d * 0.75); } }
  g.computeVertexNormals();
  const floor = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#F4F2F8", roughness: 0.88, metalness: 0 }));
  floor.receiveShadow = true; scene.add(floor);
}
scene.add(new THREE.HemisphereLight("#FFFFFF", "#D9D3EA", 1.15));
const key_ = new THREE.DirectionalLight("#FFFFFF", 2.4); key_.position.set(-3.2, 7.5, 5.2); key_.castShadow = true;
Object.assign(key_.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -3.5, near: 1, far: 20 });
key_.shadow.mapSize.set(2048, 2048); key_.shadow.radius = 6; key_.shadow.bias = -0.0004; key_.shadow.normalBias = 0.02; scene.add(key_);
const rim = new THREE.DirectionalLight("#E9E2FF", 0.9); rim.position.set(2.5, 4, -6); scene.add(rim);

// ------------------------------------------------------------------ hero objects
const cups = {};
for (const k of ["small", "large", "medium"]) {
  const m = MENU[k], cup = makeCup(m.ml, m.letter), sh = contactShadow(cup.c.rb);
  scene.add(cup.group, sh); cups[k] = { ...cup, sh, m };
}
// clipping plane for the slice (only the large cup is cut)
const clipLarge = new THREE.Plane(new THREE.Vector3(0, -1, 0), 99);
for (const m of [cups.large.bodyMat, cups.large.sleeveMat]) m.clippingPlanes = [clipLarge];
cups.large.group.children.forEach((o) => { if (o.material && (o === cups.large.group.children[3] || o === cups.large.group.children[4])) o.material.clippingPlanes = [clipLarge]; });
// slice: upper glass band + violet liquid (the extra 150 ml), lifted off and set down beside the large cup
const LC = cups.large.c, L150 = levelFor(LC, 150), L280 = levelFor(LC, 280), L300 = levelFor(LC, 300);
const slice = new THREE.Group(); scene.add(slice);
{
  const gp = []; for (let i = 0; i <= 8; i++) { const y = L150 + (LC.h - L150) * (i / 8); gp.push(new THREE.Vector2(radiusAt(LC, y), y - L150)); }
  slice.add(new THREE.Mesh(new THREE.LatheGeometry(gp, 96), new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide })));
  const lp = [new THREE.Vector2(0, 0), new THREE.Vector2(radiusAt(LC, L150) * 0.93, 0), new THREE.Vector2(radiusAt(LC, L300) * 0.93, L300 - L150), new THREE.Vector2(0, L300 - L150)];
  const liq = new THREE.Mesh(new THREE.LatheGeometry(lp, 96), new THREE.MeshPhysicalMaterial({ color: "#5B2FF0", emissive: "#4A1FD6", emissiveIntensity: 0.25, roughness: 0.55, clearcoat: 0 }));
  liq.castShadow = true; slice.add(liq);
}
const sliceSh = contactShadow(0.36); scene.add(sliceSh);
// cutting ring: a glowing violet hoop that drops and tightens onto the 150 ml line, then snaps (the cut)
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.024, 12, 128), new THREE.MeshBasicMaterial({ color: "#7B55FF", transparent: true, depthWrite: false }));
ring.rotation.x = Math.PI / 2; scene.add(ring);
// coin (+Rs5): standing disc, face toward camera (CircleGeometry keeps the printed face upright)
const coinR = 0.17;
const coinTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d"); g.fillStyle = "#E4DDFB"; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.strokeStyle = "#8C7FD0"; g.lineWidth = 9; g.beginPath(); g.arc(128, 128, 106, 0, 7); g.stroke(); g.fillStyle = "#2A1678"; g.font = "92px IDBlack"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("Rs5", 128, 136); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
const coin = new THREE.Group(); scene.add(coin);
{
  const rimM = new THREE.Mesh(new THREE.CylinderGeometry(coinR, coinR, 0.036, 64), new THREE.MeshPhysicalMaterial({ color: "#B9ADEB", metalness: 0.6, roughness: 0.25, clearcoat: 1 }));
  rimM.rotation.x = Math.PI / 2; rimM.castShadow = true; coin.add(rimM);
  const faceMat = new THREE.MeshPhysicalMaterial({ map: coinTex, metalness: 0.35, roughness: 0.3, clearcoat: 0.8 });
  const f1 = new THREE.Mesh(new THREE.CircleGeometry(coinR * 0.985, 64), faceMat); f1.position.z = 0.0185; coin.add(f1);
  const f2 = f1.clone(); f2.rotation.y = Math.PI; f2.position.z = -0.0185; coin.add(f2);
}
const coinSh = contactShadow(coinR * 0.7); scene.add(coinSh);
const COIN_X = (MENU.large.x + MENU.medium.x) / 2, COIN_Z = 0.42;
// suspended ball + cable (drops on the decoy)
const ball = new THREE.Mesh(new THREE.SphereGeometry(0.34, 64, 40), new THREE.MeshPhysicalMaterial({ color: "#4A1FD6", roughness: 0.22, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08 }));
ball.castShadow = true; scene.add(ball);
const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 8), new THREE.MeshStandardMaterial({ color: "#1B1433", roughness: 0.5 })); scene.add(cable);
const ballSh = contactShadow(0.34); scene.add(ballSh);
// dust ring sprites (impacts)
const dustTex = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 64; const g = cv.getContext("2d"); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(205,196,236,0.9)"); r.addColorStop(1, "rgba(205,196,236,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const dust = Array.from({ length: 14 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
// CTA tile (Werbens icon on a violet slab)
const tile = new THREE.Group(); scene.add(tile);
{
  const slab = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.12, 6, 0.1), new THREE.MeshPhysicalMaterial({ color: "#6234FB", roughness: 0.3, clearcoat: 1 }));
  slab.position.y = 0.31; slab.castShadow = true; tile.add(slab);
  const tex = new THREE.TextureLoader().load("/assets/icon.png"); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  face.position.set(0, 0.31, 0.062); tile.add(face);
}
const tileSh = contactShadow(0.36); scene.add(tileSh);
const TILE_X = 0.42;

// ------------------------------------------------------------------ motion helpers
// drop with near-impact slow motion: fast fall → hover-slow just above the floor → snap to contact
function dropY(t, t0, t1, y0) {
  const u = clamp((t - t0) / (t1 - t0));
  if (u < 0.62) return lerp(y0, 0.16, E.out(u / 0.62));
  if (u < 0.9) return lerp(0.16, 0.07, (u - 0.62) / 0.28);
  return lerp(0.07, 0, ((u - 0.9) / 0.1) ** 2);
}
const squash = (t, tl, amt = 0.12) => (t < tl ? 0 : amt * Math.exp(-(t - tl) * 9) * Math.cos((t - tl) * 26));
function placeShadow(sh, x, z, h, r, op = 1) { const s = r * 2.7 * (1 + h * 0.9); sh.position.set(x, 0.003, z); sh.scale.set(s, s, 1); sh.material.opacity = op * 0.62 / (1 + h * 2.4); sh.visible = op > 0.01; }
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H]; };

// ------------------------------------------------------------------ camera (slow dolly between hero framings)
const CAMS = [
  [0.0, [-0.06, 1.8, 8.6], [-0.06, 0.55, 0]], [3.8, [-0.06, 1.7, 8.2], [-0.06, 0.55, 0]],
  [4.7, [0.385, 1.3, 5.7], [0.385, 0.55, 0]], [8.2, [0.385, 1.3, 5.6], [0.385, 0.6, 0]], [12.5, [0.385, 1.35, 5.5], [0.385, 0.6, 0]],
  [13.2, [-0.06, 1.75, 8.4], [-0.06, 0.6, 0]], [17.2, [-0.06, 1.68, 8.1], [-0.06, 0.64, 0]], [20.1, [-0.06, 1.7, 8.2], [-0.06, 0.65, 0]],
  [20.8, [0.0, 1.55, 8.0], [0.0, 0.55, 0]], [25.9, [0.0, 1.5, 7.8], [0.0, 0.55, 0]], [27.0, [0.0, 1.3, 6.6], [0.0, 0.5, 0]], [30, [0.0, 1.25, 6.3], [0.0, 0.5, 0]],
];
function cameraAt(t) {
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) };
}

// ------------------------------------------------------------------ captions (word-timed groups)
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9%]/g, "");
function align(line) { const sw = line.script.split(" "), tok = line.words, out = []; let j = 0; for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); } return out; }
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => { c.t0 = c.words[0].t0 - 0.1; const nx = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45; c.t1 = nx ? AW[nx.line][nx.from].t0 - 0.12 : end + 0.4; if (nx && nx.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6)); });
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
  if (i !== capShown) {
    cap.innerHTML = "";
    if (i >= 0) { const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill"; const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words]; for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(nrm(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); } cap.appendChild(pill); }
    capShown = i;
  }
  if (i < 0) return;
  const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.4 + 0.6 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
function hudAt(el, xy, o, sc = 1) { el.style.display = o > 0.01 ? "" : "none"; const hw = el.offsetWidth / 2; if (hw > 0) xy = [clamp(xy[0], 96 + hw, 984 - hw), xy[1]]; el.style.left = xy[0] + "px"; el.style.top = xy[1] + "px"; el.style.opacity = String(o); el.style.transform = `translate(-50%, -50%) scale(${sc})`; el.style.display = o > 0.01 ? "" : "none"; }

// ------------------------------------------------------------------ frame
function frame(t) {
  const cam = cameraAt(t); camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.updateMatrixWorld();

  // --- positions: regroup after the decoy is gone; CTA: the cut large + its slice slide off, the small (what you need) stays
  const rg = ramp(t, ...T.regroup, E.inOut), cs = ramp(t, ...T.ctaSplit, E.inOut), gone = ramp(t, T.ctaSplit[0], T.ctaSplit[1] + 0.3, E.in);
  const xs = { small: lerp(lerp(MENU.small.x, -0.9, rg), -0.5, cs), large: lerp(MENU.large.x, 0.05, rg) + 3.2 * gone, medium: MENU.medium.x };
  // --- drops
  const yS = dropY(t, ...T.smallDrop, 3.2), yL = dropY(t, ...T.largeDrop, 3.4), yM = t < T.mediumDrop[0] ? 4.5 : t < 2.98 ? lerp(4.5, 0.7, E.out(ramp(t, T.mediumDrop[0], 2.98, E.lin))) : t < 3.32 ? lerp(0.7, 0.36, ramp(t, 2.98, 3.32, E.lin)) : lerp(0.36, 0, ramp(t, 3.32, T.mediumDrop[1], E.in));
  const hop = 0.17 * Math.sin(Math.PI * ramp(t, T.better[0] - 0.05, T.better[1] - 0.05, E.lin)); // the large "looks better": it hops
  const Y = { small: yS, large: yL + hop, medium: yM }, LAND = { small: T.smallDrop[1], large: T.largeDrop[1], medium: T.mediumDrop[1] };
  // --- glass transforms (measuring: medium + large; takeaway: small + large; CTA: the small turns back into a cup)
  const g1 = ramp(t, ...T.glassOn) * (1 - ramp(t, ...T.glassOff)), g2 = ramp(t, ...T.glass2) * (1 - ramp(t, ...T.ctaSplit));
  // lids pop up and fade (off), and drop back on (on)
  const lid1 = ramp(t, ...T.lidsOpen, E.out) * (1 - ramp(t, ...T.lidsClose, E.inOut));
  const lid2 = ramp(t, T.glass2[0] - 0.15, T.glass2[0] + 0.3, E.out) * (1 - ramp(t, T.ctaSplit[0] + 0.05, T.ctaSplit[1] + 0.1, E.inOut));
  // --- decoy ghost + ball impact squash
  const ghost = ramp(t, ...T.ghost), crushed = t >= T.ballImpact;
  // the extra 20 ml lifts out of the large cup (large drops to the medium's 280 ml), then sinks back on "upgrade"
  const lift = 0.36 * E.outBack(ramp(t, ...T.extraGlow, E.lin)) * (1 - ramp(t, T.upgrade[0], T.upgrade[0] + 0.38, E.in));
  for (const k of ["small", "large", "medium"]) {
    const C = cups[k], gr = C.group; let sy = 1 + squash(t, LAND[k], -0.1) + (k === "large" ? squash(t, T.better[1] - 0.05, -0.07) + squash(t, T.upgrade[0] + 0.38, -0.05) : 0), sxz = 1 - (sy - 1) * 0.5;
    let x = xs[k], y = Y[k], z = 0, op = 1;
    if (k === "medium") {
      if (crushed) { const d = t - T.ballImpact; sy = Math.max(0.1, 1 - d / 0.06 * 0.9); sxz = 1 + (1 - sy) * 0.45; if (t > T.flatOut[0]) { const u = ramp(t, ...T.flatOut, E.in); x += u * 1.6; op = 1 - u; } }
      gr.visible = t >= T.mediumDrop[0] && op > 0.01;
      C.bodyMat.color.set("#6234FB").lerp(new THREE.Color("#B7B0CC"), ghost); C.lidMat.color.set("#CCC0F7").lerp(new THREE.Color("#DCD8E6"), ghost);
      C.bodyMat.opacity = (1 - 0.45 * ghost) * op; C.sleeveMat.opacity = (1 - 0.4 * ghost) * op;
    }
    if (k === "large") { const glow = win(t, T.upgrade[0], T.upgrade[1] + 0.3, 0.15, 0.4) + win(t, ...T.better, 0.12, 0.3); const up = win(t, T.upgrade[0] + 0.3, T.upgrade[1] + 0.4, 0.12, 0.35) * 0.05; sy *= 1 + up; sxz *= 1 + up; C.bodyMat.emissive = new THREE.Color("#3A1BB5"); C.bodyMat.emissiveIntensity = 0.5 * glow; }
    gr.position.set(x, y, z); gr.scale.set(sxz, sy, sxz);
    if (k === "small") gr.visible = !(t > 4.65 && t < 12.55); // fully outside the close two-cup comparison framing
    const air = y > 0.35; // in the air only the soft contact decal shadows the floor (no stray far-off shadow-map blobs)
    const gU = k === "small" ? g2 : k === "large" ? Math.max(g1, ramp(t, ...T.glass2)) : g1 * (1 - ghost);
    if (k !== "medium" || !crushed) C.setGlass(gU);
    C.body.castShadow = !air && gU < 0.5; C.sleeve.castShadow = !air && gU < 0.5;
    if (k === "medium" && ghost > 0) { C.bodyMat.opacity = (1 - 0.45 * ghost) * op; C.sleeveMat.opacity = (1 - 0.4 * ghost) * op; }
    const lidU = clamp(k === "small" ? lid2 : k === "large" ? Math.max(lid1, ramp(t, T.glass2[0] - 0.15, T.glass2[0] + 0.3, E.out)) : lid1);
    C.lidPivot.position.y = C.c.h + 0.01 + 0.62 * lidU; C.lidPivot.rotation.x = -0.5 * lidU;
    C.lidMat.opacity = (1 - clamp(lidU * 1.25)) * op; C.lid.visible = C.lidMat.opacity > 0.01; C.lid.castShadow = lidU < 0.3 && !air;
    // liquid: medium & large in the measuring scene, small & large in the takeaway
    const c = C.c, lvl = (ml) => levelFor(c, ml);
    C.extra.position.set(0, 0, 0); C.extra.rotation.x = 0;
    if (k === "medium") { C.setLiquid(0.02, lvl(280), gU); C.setExtra(0, 0, 0); }
    if (k === "small") { C.setLiquid(0.02, lvl(150), gU); C.setExtra(0, 0, 0); }
    if (k === "large") {
      if (g1 > 0.01 && t < T.glassOff[1]) { C.setLiquid(0.02, L280, g1); C.setExtra(L280, L300, g1); const th = 0.38 * clamp(lift / 0.36), yc = (L280 + L300) / 2; C.extra.rotation.x = th; C.extra.position.set(0, yc + lift - yc * Math.cos(th), -yc * Math.sin(th)); C.extra.material.emissiveIntensity = 0.18 + 0.22 * clamp(lift / 0.3); }
      else { C.setLiquid(0.02, gU > 0.01 ? L150 : 0.03, gU); C.setExtra(L150, L300, gU * ramp(t, ...T.extra2)); C.extra.material.emissiveIntensity = 0.18 + 0.2 * win(t, T.extra2[0], T.blade[0], 0.2, 0.3); }
      C.extra.visible = C.extra.visible && t < T.blade[1]; // after the cut the extra travels with the slice
    }
    placeShadow(C.sh, x, z, y, c.rb * sxz * (k === "medium" && crushed ? 1.4 : 1), k === "medium" ? (t >= T.mediumShadow[0] ? op * ramp(t, T.mediumShadow[0], T.mediumShadow[0] + 0.5, E.lin) : 0) : 1);
  }
  // --- slice (takeaway): the ring tightens on the 150 ml line, snaps, and the extra 150 ml is lifted off and set down beside
  const Lx = xs.large, cutY = L150 + 0.002, bl = ramp(t, ...T.blade, E.out), sl = ramp(t, ...T.slice, E.inOut), cut = t >= T.blade[1];
  const rOn = t >= T.blade[0] - 0.02 && t < T.blade[1] + 0.35;
  ring.visible = rOn; ring.position.set(Lx, lerp(cutY + 0.55, cutY, bl), 0); const rr = radiusAt(LC, L150) * lerp(1.9, 1.04, bl); ring.scale.set(rr, rr, 1);
  ring.material.opacity = Math.min(ramp(t, T.blade[0] - 0.02, T.blade[0] + 0.1, E.lin), 1 - ramp(t, T.blade[1] + 0.05, T.blade[1] + 0.35, E.lin)); ring.material.color.set(t >= T.blade[1] && t < T.blade[1] + 0.12 ? "#FFFFFF" : "#7B55FF");
  clipLarge.constant = cut ? cutY : 99;
  for (const o of [cups.large.group.children[3], cups.large.group.children[4]]) o.material.clippingPlanes = [clipLarge];
  slice.visible = cut;
  const sx = lerp(Lx, Lx + 0.84, sl), sy0 = lerp(cutY, 0, E.inOut(sl)) + Math.sin(Math.PI * sl) * 0.42, sz = lerp(0, 0.16, sl);
  slice.position.set(sx, sy0, sz); slice.rotation.z = -Math.sin(Math.PI * sl) * 0.35; const ssq = squash(t, T.slice[1], -0.08); slice.scale.set(1 - ssq * 0.5, 1 + ssq, 1 - ssq * 0.5);
  placeShadow(sliceSh, sx, sz, sy0, 0.36, cut ? 1 : 0);
  // --- coin (+Rs5): drops spinning into the gap between the cups, rocks to rest, then hops into the large cup on "upgrade"
  const cu = clamp((t - T.coin[0]) / (T.coin[1] - T.coin[0])), hu = ramp(t, T.upgrade[0], T.upgrade[0] + 0.34, E.inOut), coinOn = t >= T.coin[0] && hu < 1;
  coin.visible = coinOn;
  let cx = COIN_X, cz = COIN_Z, cy = cu < 1 ? lerp(1.0, coinR, cu * cu) : coinR + Math.abs(wobble(t, T.coin[1], 0.05, 4, 8));
  if (hu > 0) { cx = lerp(COIN_X, MENU.large.x, hu); cz = lerp(COIN_Z, 0, hu); cy = lerp(coinR, LC.h + 0.02, hu) + Math.sin(Math.PI * hu) * 0.55; }
  coin.position.set(cx, cy, cz); coin.rotation.set(0, (1 - cu) * 7 + hu * 3.2, wobble(t, T.coin[1], 0.12, 3, 6)); coin.scale.setScalar(E.out(clamp(cu / 0.18)) * (1 - 0.5 * clamp((hu - 0.75) / 0.25)));
  placeShadow(coinSh, cx, cz, cy - coinR, coinR * 0.7, coinOn ? 1 - hu : 0);
  // --- ball (strip the distraction away): hover with suspense, drop, crush, bounce out of frame
  const bx = MENU.medium.x, mTop = cups.medium.c.h + 0.09;
  let by = 9, bVis = false;
  if (t >= T.ballHover[0] - 0.4 && t < T.ballOut[1]) {
    bVis = true;
    if (t < T.ballHover[1]) by = lerp(3.4, mTop + 0.34 + 0.28, E.out(ramp(t, T.ballHover[0] - 0.4, T.ballHover[1], E.lin))) + Math.sin(t * 5) * 0.015;
    else if (t < T.ballImpact) by = lerp(mTop + 0.62, cups.medium.c.h * 0.3 + 0.34, ((t - T.ballHover[1]) / (T.ballImpact - T.ballHover[1])) ** 2);
    else { const d = t - T.ballImpact; by = 0.1 * cups.medium.c.h + 0.34 + 7.5 * d - 4 * d * d * 9.8 / 4 + 0; by = Math.max(0.34, 0.34 + 0.1 + 8 * d - 9 * d * d); }
  }
  ball.visible = bVis; ball.position.set(bx, by, 0); ball.rotation.z = t > T.ballImpact ? -(t - T.ballImpact) * 6 : 0;
  cable.visible = bVis && t < T.ballImpact + 0.05; cable.position.set(bx, by + 0.34 + 4, 0); cable.scale.y = 8;
  placeShadow(ballSh, bx, 0, by - 0.34, 0.34, bVis ? 0.8 : 0);
  // dust on landings and on the impact
  const bursts = [[LAND.small, xs.small, 0.29], [LAND.large, MENU.large.x, 0.36], [LAND.medium, MENU.medium.x, 0.35], [T.ballImpact, MENU.medium.x, 0.55], [T.slice[1], Lx + 0.84, 0.4], [T.tile[1], TILE_X, 0.4]];
  dust.forEach((s) => (s.visible = false)); let di = 0;
  for (const [tb, x0, r] of bursts) { const d = t - tb; if (d < 0 || d > 0.5) continue; for (let i = 0; i < 7 && di < dust.length; i++, di++) { const a = (i / 7) * Math.PI * 2 + 0.4, s = dust[di]; s.visible = true; s.position.set(x0 + Math.cos(a) * r * (1 + d * 1.6), 0.04 + d * 0.1, Math.sin(a) * r * 0.6 * (1 + d * 1.6)); s.scale.setScalar(0.12 + d * 0.35); s.material.opacity = 0.7 * (1 - d / 0.5); } }
  // --- CTA tile
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(2.4, 0, tu * tu) : 0;
  tile.visible = t >= T.tile[0]; tile.position.set(TILE_X, ty, 0.35); const tsq = squash(t, T.tile[1], -0.14); tile.scale.set(1 - tsq * 0.5, 1 + tsq, 1 - tsq * 0.5);
  placeShadow(tileSh, TILE_X, 0.35, ty, 0.4, tile.visible ? 1 : 0);
  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD (anchored to the objects)
  $("chip").style.opacity = String(win(t, ...T.menuChip, 0.25, 0.3));
  const tagPos = (k, dz = 0.52) => toScreen(v3(cups[k].group.position.x, 0, dz));
  [["tagS", "small"], ["tagL", "large"], ["tagM", "medium"]].forEach(([id, k]) => {
    const el = $(id), p = tagPos(k); let o = Math.min(1, pop(t, LAND[k] + 0.04, 0.3)), sc = Math.max(0.001, pop(t, LAND[k] + 0.04, 0.3));
    if (k === "medium" && crushed) o *= 1 - ramp(t, T.ballImpact, T.ballImpact + 0.25);
    if (t >= T.tile[0]) o *= 1 - ramp(t, T.tile[0], T.tile[0] + 0.3);
    if (k === "small") o *= 1 - Math.min(ramp(t, 3.85, 4.15, E.lin), 1 - ramp(t, 13.15, 13.4, E.lin)); // its cup is out of the close comparison shot
    const pr = k !== "small" && t >= T.priceCompare[0] && t < T.priceCompare[1] ? 1 + 0.08 * Math.sin(Math.PI * ramp(t, T.priceCompare[0], T.priceCompare[0] + 0.5)) : 1;
    el.style.left = p[0] + "px"; el.style.top = p[1] + 14 + "px"; el.style.opacity = String(o); el.style.transform = `scale(${sc * pr})`; el.style.display = o > 0.01 ? "" : "none";
    if (k === "small" && t >= T.decoyTag[0] && t < T.regroup[0]) el.style.opacity = String(o * 0.55);
  });
  const isDecoy = t >= T.decoyTag[0]; $("tagM").className = "tag" + (isDecoy ? " decoy" : ""); $("dc").style.display = isDecoy ? "" : "none";
  $("tagM").style.transform += ` rotateX(${(1 - ramp(t, ...T.decoyTag, E.out)) * (t >= T.decoyTag[0] ? 80 : 0)}deg)`;
  // overlays: size lines (setup), +Rs5 bracket, decoy → large comparison beam
  let svg = "";
  const sl1 = win(t, ...T.sizeLines, 0.2, 0.3);
  if (sl1 > 0) { // one guide at the large's rim across both cups; the medium's rim sits just below it
    const Lg = cups.large.group.position.x, Mg = cups.medium.group.position.x, yl = toScreen(v3(Lg, LC.h, 0))[1], ym = toScreen(v3(Mg, cups.medium.c.h, 0))[1];
    const a = toScreen(v3(Lg - LC.rt - 0.08, LC.h, 0))[0], b = toScreen(v3(Mg + cups.medium.c.rt + 0.08, LC.h, 0))[0], m0 = toScreen(v3(Mg - cups.medium.c.rt - 0.04, 0, 0))[0];
    svg += `<line x1="${a}" y1="${yl}" x2="${b}" y2="${yl}" stroke="#2A1678" stroke-width="4" stroke-dasharray="10 8" opacity="${sl1}"/><line x1="${m0}" y1="${ym}" x2="${b}" y2="${ym}" stroke="#6234FB" stroke-width="4" opacity="${sl1}"/>`;
  }
  const pc = win(t, T.priceCompare[0] + 0.3, T.priceCompare[1], 0.2, 0.25);
  if (pc > 0) { const a = tagPos("large"), b = tagPos("medium"), y = a[1] + 14 + 112, xa = a[0] + 118, xb = b[0] - 118, xm = (xa + xb) / 2; svg += `<path d="M${xa} ${y} L${xm - 70} ${y} M${xm + 70} ${y} L${xb} ${y}" fill="none" stroke="#6234FB" stroke-width="5" stroke-linecap="round" opacity="${pc}"/>`; hudAt($("nRs5"), [xm, y], pc, 0.85 + 0.15 * pc); }
  else hudAt($("nRs5"), [0, 0], 0);
  const bm = win(t, T.beam[0], T.regroup[0] - 0.6, 0.35, 0.3);
  if (bm > 0) { const a = toScreen(v3(MENU.medium.x - 0.1, cups.medium.c.h + 0.25, 0)), b = toScreen(v3(MENU.large.x + 0.1, cups.large.c.h + 0.25, 0)), c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 70]; svg += `<path d="M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}" fill="none" stroke="#6234FB" stroke-width="6" stroke-linecap="round" stroke-dasharray="${900 * bm} 900"/><circle cx="${b[0]}" cy="${b[1]}" r="${11 * bm}" fill="#6234FB"/>`; }
  // notes: +20 ml (measuring), need line, sliced extra
  const ex = win(t, T.extraGlow[0] + 0.12, T.upgrade[0] + 0.3, 0.2, 0.25);
  hudAt($("nExtra"), (() => { const p = toScreen(v3(xs.large + LC.rt + 0.04, L290() + lift, 0)); return [p[0] + 78, Math.max(600, p[1])]; })(), ex, 0.8 + 0.2 * Math.min(1, pop(t, T.extraGlow[0] + 0.12, 0.3)));
  if (lift > 0.04) { const a = toScreen(v3(xs.large - LC.rt - 0.06, L280, 0)), b = toScreen(v3(MENU.medium.x + cups.medium.c.rt + 0.06, L280, 0)); svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${a[1]}" stroke="#2A1678" stroke-width="4" stroke-dasharray="10 8" opacity="${clamp(lift / 0.2)}"/>`; }
  if (t >= T.coin[1] - 0.05 && t < T.upgrade[0] + 0.15) { const p = toScreen(v3(COIN_X, 2 * coinR + 0.16, COIN_Z)); hudAt($("nRs5"), p, Math.min(1, pop(t, T.coin[1] - 0.05, 0.25)) * (1 - ramp(t, T.upgrade[0], T.upgrade[0] + 0.15))); }
  $("ov").innerHTML = svg;
  const nd = win(t, T.needRing[0], T.ctaSplit[0], 0.2, 0.3);
  hudAt($("nNeed"), (() => { const p = toScreen(v3(xs.small, levelFor(cups.small.c, 150) + 0.32, 0)); return [p[0], p[1] - 30]; })(), nd, 0.8 + 0.2 * Math.min(1, pop(t, T.needRing[0], 0.3)));
  const ns = win(t, T.slice[1] - 0.2, T.ctaSplit[0] + 0.1, 0.2, 0.3);
  hudAt($("nSlice"), (() => { const p = toScreen(v3(slice.position.x, 0.52, slice.position.z)); return [p[0] - 20, p[1] - 44]; })(), ns, 0.8 + 0.2 * Math.min(1, pop(t, T.slice[1] - 0.2, 0.3)));
  if (nd > 0 && t < T.blade[0]) { const C = cups.large, y = toScreen(v3(xs.large, L150, 0))[1], a = toScreen(v3(xs.large - LC.rt - 0.1, L150, 0)), b = toScreen(v3(xs.large + LC.rt + 0.1, L150, 0)), ys = toScreen(v3(xs.small, levelFor(cups.small.c, 150), 0)); $("ov").innerHTML += `<line x1="${a[0]}" y1="${y}" x2="${b[0]}" y2="${y}" stroke="#6234FB" stroke-width="5" stroke-dasharray="12 8" opacity="${nd}"/>`; }
  // CTA wordmark
  const wd = ramp(t, T.wordmark - 0.4, T.wordmark + 0.1); $("word").style.opacity = String(wd); $("word").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  captions(t);
}
function L290() { return (L280 + L300) / 2; }

window.__frame = (t) => frame(t);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
window.__dispose = () => { renderer.dispose(); };
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null; const hud = [...document.querySelectorAll(".tag, .note, #chip, #word")].filter((e) => e.style.display !== "none" && +getComputedStyle(e).opacity > 0.05).map((e) => { const r = e.getBoundingClientRect(); return [e.id, Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, hud }; };
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
