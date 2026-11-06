// Entry: the low-poly café + performer + lime phone from feedback round 01, the phone charging on the counter (charger,
// cable, window-light patch), a glass and carafe for the pouring analogy, and the giant battery cutaway; renders any
// frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildCharger, buildCable, buildSunPatch, buildGlass, buildCarafe, buildStream, buildGiantBattery, CELL, PAL } from './lowpoly.js';
import { makeChoreo, GIANT, GLASS_POS, CARAFE_REST, CHARGER_POS, SUN_AT } from './choreo.js';
import { drawCharge } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 36px Fredoka', '600 150px Fredoka', '600 64px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 80);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01)
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene); S.phone = buildPhone(scene);
  S.phone.group.children.forEach(m => { if (m.material && m.material.color && m.material.color.getHexString() === 'a8714e') m.visible = false; });   // lying on the counter: no gripping fingertips
  S.charger = buildCharger(scene); S.charger.position.set(...CHARGER_POS);
  S.cable = buildCable(scene);
  S.sun = buildSunPatch(scene); S.sun.group.position.set(...SUN_AT);
  S.glass = buildGlass(scene); S.glass.position.set(...GLASS_POS);
  S.carafe = buildCarafe(scene); S.stream = buildStream(scene);
  S.G = buildGiantBattery(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), ZERO3 = V(1e-4, 1e-4, 1e-4), Z = V(0, 0, 1);
const dialAngle = v => Math.PI * (1.15 - 1.3 * clamp(v)) - Math.PI / 2;

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant');
  // ---------------- phone lying on the counter, screen up, top edge away from the camera
  const pp = ch.phonePos(t);
  S.phone.group.position.copy(pp); S.phone.group.rotation.set(-Math.PI / 2, 0, 0); S.phone.group.updateMatrixWorld(true);
  const scr = ch.screen(t); drawCharge(S.phone.ctx, 540, 1140, scr); S.phone.tex.needsUpdate = true;
  const port = S.phone.group.localToWorld(V(0, -0.077, 0)), sock = V(CHARGER_POS[0], 0.9585, CHARGER_POS[2] + 0.03);
  S.cable.update([sock, sock.clone().add(V(0, 0, 0.05)), V((sock.x + port.x) / 2 + 0.1, 0.9585, (sock.z + port.z) / 2 + 0.16), port.clone().setY(0.9585).add(V(0, 0, 0.06)), port.clone().setY(0.9585)]);
  // ---------------- carafe: rests on the counter, or pours into the glass (spout held above the glass rim)
  const tilt = ch.tiltAt(t), L = clamp((t - 12.9) / 0.25) * (1 - clamp((t - 15.5) / 0.25));
  const rot = new THREE.Quaternion().setFromAxisAngle(Z, tilt);
  const spoutTarget = V(GLASS_POS[0] + 0.012, GLASS_POS[1] + S.glass.H + 0.05, GLASS_POS[2]);
  const pourOrigin = spoutTarget.clone().sub(S.carafe.spout.clone().applyQuaternion(rot)).add(V(0, 0.04 * (1 - clamp(tilt)), 0));
  S.carafe.position.copy(V(...CARAFE_REST).lerp(pourOrigin, E.io(L))); S.carafe.quaternion.copy(rot); S.carafe.updateMatrixWorld(true);
  const carafeHandle = S.carafe.localToWorld(V(0.083, 0.1, 0));
  S.glass.setLevel(ch.glassLevel(t));
  const rate = ch.pourRate(t);
  S.stream.visible = rate > 0 && tilt > 0.85;
  if (S.stream.visible) {
    const sp = S.carafe.localToWorld(S.carafe.spout.clone()), lvl = GLASS_POS[1] + 0.006 + ch.glassLevel(t) * (S.glass.H - 0.01);
    S.stream.set(sp, V(sp.x + 0.004, lvl, sp.z), 0.0011 + 0.0042 * rate);
  }
  // ---------------- performer
  const q = ch.person(t, { phone: pp, carafeHandle }); S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // sun patch + heat shimmer over the phone while it lies in the window light
  const shim = seg(t, 18.9, 19.6) * (1 - seg(t, C.slide, C.slideDone));
  S.sun.shim.forEach((s, i) => { s.material.opacity = 0.55 * shim * (0.6 + 0.4 * Math.sin(t * 5 + i)); s.position.y = 0.006 + ((t * 0.04 + i * 0.013) % 0.03); });
  // ---------------- giant battery
  const G = S.G, gs = ch.giant(t), P = {};
  G.group.visible = giantShot;
  S.cafe.group.visible = S.person.root.visible = S.phone.group.visible = S.charger.visible = S.cable.visible = S.sun.group.visible = S.glass.visible = S.carafe.visible = !giantShot;
  if (giantShot) {
    const n = G.slots.length, filledF = gs.level * n, filled = Math.floor(filledF);
    for (let i = 0; i < n; i++) {
      const s = i < filled ? 1 : i === filled ? clamp(filledF - filled) : 0;
      M4.compose(G.slots[i], Q.identity(), s > 0.01 ? V(s, s, s) : ZERO3); G.beads.setMatrixAt(i, M4);
    }
    G.beads.instanceMatrix.needsUpdate = true;
    const topY = CELL.h - 0.06, rowH = (CELL.h - 0.3) / CELL.rows;
    const fillTop = 0.12 + Math.min(CELL.rows, Math.ceil(filledF / (CELL.cols * CELL.deep))) * rowH;
    const active = gs.I > 0.01 ? Math.max(1, Math.round(40 * Math.min(1, gs.I))) : 0;
    for (let i = 0; i < 40; i++) {
      if (i >= active) { M4.compose(V(0, 0, 0), Q.identity(), ZERO3); G.fallers.setMatrixAt(i, M4); continue; }
      const u = ((t * 1.15 + i * 0.6180339) % 1 + 1) % 1, tgt = G.slots[Math.min(n - 1, filled + (i % 8))];
      const start = V(0.28 * Math.sin(i * 2.3) * Math.min(1, gs.I + 0.15), topY, 0.2 * Math.cos(i * 1.7) * Math.min(1, gs.I + 0.15));
      const p = start.clone().lerp(tgt, u ** 1.3), s = 1 - 0.35 * u;
      M4.compose(p, Q.identity(), V(s, s, s)); G.fallers.setMatrixAt(i, M4);
    }
    G.fallers.instanceMatrix.needsUpdate = true;
    const gh = Math.max(0.01, topY - fillTop), gr = 0.06 + 0.32 * gs.I;
    G.glowStream.visible = gs.I > 0.01; G.glowStream.position.set(0, fillTop + gh / 2, 0); G.glowStream.scale.set(gr, gh, gr * 0.6); G.glowStream.material.opacity = 0.12 + 0.3 * gs.I;
    G.dials[0].needle.rotation.z = dialAngle(gs.I * 0.95); G.dials[1].needle.rotation.z = dialAngle(gs.V);
    G.shellM.emissiveIntensity = 0.55 * gs.warm; G.shellM.opacity = 0.16 + 0.12 * gs.warm;
    G.heat.forEach((s, i) => { s.material.opacity = 0.75 * gs.warm * (0.6 + 0.4 * Math.sin(t * 4 + i)); s.position.y = CELL.base + CELL.h + 0.2 + ((t * 0.5 + i * 0.17) % 0.5); });
    const colH = 0.5 + 0.95 * (gs.warm > 0 ? 0.3 + 0.7 * gs.warm : 0.3);
    G.column.scale.set(1, colH, 1); G.column.position.y = 0.25 + colH / 2;
    G.pause.visible = gs.paused > 0.01; G.pause.scale.setScalar(Math.max(0.001, gs.paused));
  }
  // ---------------- camera + key light
  const cam = ch.camera(t, { head, phone: pp });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const org = V(...GIANT);
  if (giantShot) {
    const G = S.G;
    P.cur = project(G.dials[0].g.getWorldPosition(V(0, 0, 0))); P.volt = project(G.dials[1].g.getWorldPosition(V(0, 0, 0)));
    P.ring = project(org.clone().add(V(CELL.w / 2 + 0.04, CELL.base + G.ring.position.y, CELL.d / 2)));
    P.stream = project(org.clone().add(V(0, CELL.base + CELL.h - 0.4, 0.3)));
    P.thermo = project(G.thermo.getWorldPosition(V(0, 0, 0)).add(V(0, 1.6, 0)));
    P.pause = project(G.pause.getWorldPosition(V(0, 0, 0)));
  } else {
    P.phone = project(pp); P.glass = project(V(GLASS_POS[0], GLASS_POS[1] + S.glass.H, GLASS_POS[2]));
  }
  const focus = giantShot ? org.clone().add(V(0, 1.5, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-3.6, 6.0, 3.2) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.6 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 2.6; S.scene.fog.far = giantShot ? 30 : 8;
  const safe = { shot: shot.id };
  if (!giantShot) safe.head = project(head).y;
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t), P, S.d.timeline, S.icon, S.capCache, shot.id);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes, safe, shot: shot.id };
};
window.__sheetPoses = () => [];
