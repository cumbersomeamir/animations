// Entry: the low-poly café + performer + lime phone from feedback round 01 (the performer wears knit gloves, later
// touchscreen gloves), real-scale fingers tapping the phone, and the giant touch set; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildFinger, buildGiantTouch, CAP, RES, KNIT, PAL, flat } from './lowpoly.js';
import { makeChoreo, GIANT, PHONE_POS, RES_A, RES_B } from './choreo.js';
import { drawHome } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 36px Fredoka', '600 64px Fredoka'].map(f => document.fonts.load(f)));
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
  // the performer wears knit gloves (a runtime material swap on the hand meshes only); lime tips appear for touchscreen gloves
  const knitM = flat(KNIT, { roughness: 1 });
  S.tips = S.person.arms.map(a => {
    a.hand.children.forEach(m => { m.material = knitM; });
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.022, 0.03), flat(PAL.lime)); tip.position.y = -0.07; a.hand.add(tip); return tip;
  });
  S.phone.group.children.forEach(m => { if (m.material && m.material.color && m.material.color.getHexString() === 'a8714e') m.visible = false; });
  S.fKnit = buildFinger(scene, 'knit'); S.fBare = buildFinger(scene, 'bare'); S.fTouch = buildFinger(scene, 'touch');
  S.G = buildGiantTouch(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), TINY = V(1e-4, 1e-4, 1e-4);
const frac = x => x - Math.floor(x);

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant'), insert = shot.id === 'hook_pov' || shot.id === 'ok_cu';
  // ---------------- performer + phone lying on the counter
  const q = ch.person(t); S.person.apply(q);
  S.tips.forEach(tp => { tp.visible = t >= 24.7; });
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  S.phone.group.position.set(...PHONE_POS); S.phone.group.rotation.set(-Math.PI / 2, 0, 0); S.phone.group.updateMatrixWorld(true);
  drawHome(S.phone.ctx, 540, 1140, ch.screen(t)); S.phone.tex.needsUpdate = true;
  // real fingers tapping the icon (insert shots only)
  const tp = ch.tapPoint(), T = ch.taps(t);
  const place = (F, st, dx, rz) => { F.group.visible = insert && st.vis > 0; F.group.position.copy(tp).add(V(dx, st.h, 0)); F.group.rotation.set(-0.62, 0, rz); };
  place(S.fKnit, T.knit, 0.002, -0.22); place(S.fBare, T.bare, -0.003, 0.25); place(S.fTouch, T.touch, 0.002, -0.22);
  // ---------------- giant set
  const G = S.G, gs = ch.giant(t, shot.id), org = V(...GIANT), P = {};
  G.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, S.phone.group]) o.visible = !giantShot;
  if (!giantShot) S.person.root.visible = !insert;
  if (giantShot) {
    const fb = { bare: G.fingerBare, knit: G.fingerKnit, touch: G.fingerTouch };
    for (const k in fb) fb[k].group.visible = k === gs.kind;
    const tx = CAP.x + 0.15, tz = 0.45, top = G.glassTop;
    // finger: above the capacitive glass, or pressing the resistive sheet
    let depthA = 0, depthB = 0;
    if (gs.station === 'cap') { G.finger.position.set(tx, top + gs.fingerDrop, tz); G.finger.visible = true; }
    else {
      depthA = RES.gap * clamp(gs.resA) ; depthB = RES.gap * clamp(gs.resB);
      G.finger.position.set(RES.x + RES_A[0], RES.base + 0.3 + RES.gap - depthA + 1.4 * (1 - gs.resA) + 0.004, RES_A[1]);
      G.finger.visible = t < C.stylusPress - 0.3;
    }
    G.finger.rotation.set(-0.15, 0, -0.12);
    // charge dots
    const R0 = gs.kind === 'knit' ? G.fingerKnit.R : G.fingerBare.R;
    for (let i = 0; i < G.dots.count; i++) {
      if (gs.flow < 0.01) { M4.compose(V(0, 0, 0), Q.identity(), TINY); G.dots.setMatrixAt(i, M4); continue; }
      const p = frac(t * 0.85 + i / G.dots.count), a = i * 2.39996;
      const start = V(tx + 0.13 * Math.sin(a), top + R0 + 0.15 + 0.1 * Math.cos(a * 1.3), tz + 0.1 * Math.cos(a));
      const end = V(tx + 0.05 * Math.sin(a * 3), CAP.base + 0.27, tz + 0.05 * Math.cos(a * 2));
      let pos;
      if (gs.kind === 'touch') { const mid = V(tx + 0.3 * Math.cos(a) * 0.45, top + 0.03, tz + 0.3 * Math.sin(a) * 0.45); pos = p < 0.5 ? start.clone().lerp(mid, p * 2) : mid.clone().lerp(end, (p - 0.5) * 2); }
      else pos = start.clone().lerp(end, p);
      const s = gs.flow * (1 - 0.35 * p);
      M4.compose(pos, Q.identity(), V(s, s, s)); G.dots.setMatrixAt(i, M4);
    }
    G.dots.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < G.blocked.count; i++) {
      if (gs.blocked < 0.01) { M4.compose(V(0, 0, 0), Q.identity(), TINY); G.blocked.setMatrixAt(i, M4); continue; }
      const p = frac(t * 0.9 + i / G.blocked.count), a = i * 2.39996, tri = p < 0.5 ? p * 2 : 2 - p * 2;
      const pos = V(tx + 0.13 * Math.sin(a), top + G.fingerKnit.R + 0.5 - (0.5 - 0.02) * tri, tz + 0.1 * Math.cos(a));
      M4.compose(pos, Q.identity(), V(gs.blocked, gs.blocked, gs.blocked)); G.blocked.setMatrixAt(i, M4);
    }
    G.blocked.instanceMatrix.needsUpdate = true;
    // field arcs and the sensing electrode under the touch, signal meter
    G.arcs.forEach((m, i) => { m.position.x = tx - CAP.x; m.scale.set(1, 1 + 0.7 * gs.signal, 1); m.material.opacity = 0.35 + 0.55 * gs.signal * (0.7 + 0.3 * Math.sin(t * 8 + i)) + 0.15; });
    G.rows.forEach(e => { const near = Math.abs(e.position.x - (tx - CAP.x)) < 0.2; e.material.emissiveIntensity = 0.25 + (near ? 1.4 * gs.signal : 0); });
    const fh = Math.max(0.01, 1.8 * gs.signal); G.mFill.scale.y = fh; G.mFill.position.y = 0.05 + fh / 2;
    // resistive sheet dents under the press points (never below the lower layer)
    const pos = G.sheetGeo.attributes.position.array, base = G.sheetBase;
    for (let i = 0; i < pos.length; i += 3) {
      const x = base[i], z = base[i + 2];
      const dA = (x - RES_A[0]) ** 2 + (z - RES_A[1]) ** 2, dB = (x - RES_B[0]) ** 2 + (z - RES_B[1]) ** 2;
      pos[i + 1] = -Math.min(RES.gap - 0.012, depthA * Math.exp(-dA / 0.05) + depthB * Math.exp(-dB / 0.012));
    }
    G.sheetGeo.attributes.position.needsUpdate = true; G.sheetGeo.computeVertexNormals();
    const cA = gs.resA > 0.92, cB = gs.resB > 0.92;
    G.flash.visible = cA || cB; G.flash.position.set(cA ? RES_A[0] : RES_B[0], 0.335, cA ? RES_A[1] : RES_B[1]); G.flash.material.opacity = 0.9; G.flash.scale.setScalar(1 + 0.4 * Math.sin(t * 14) ** 2);
    G.lamp.material.color.set(cA || cB ? PAL.lime : '#3A4232');
    G.stylus.visible = gs.station === 'res' && t > C.stylusPress - 1.0;
    G.stylus.position.set(RES.x + RES_B[0], RES.base + 0.3 + RES.gap - depthB + 1.5 * (1 - gs.resB) + 0.004, RES_B[1]); G.stylus.rotation.set(0.12, 0, 0.18);
  }
  // ---------------- camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  if (giantShot) {
    const tx = CAP.x + 0.15;
    P.glass = project(org.clone().add(V(CAP.x - 0.9, G.glassTop - 0.12, CAP.d / 2)));
    P.grid = project(org.clone().add(V(CAP.x - 0.5, CAP.base + 0.26, CAP.d / 2)));
    P.charge = project(org.clone().add(V(tx, G.glassTop + 0.2, 0.45)));
    P.meter = project(G.meter.localToWorld(V(0, 1.9, 0)));
    P.finger = project(G.finger.localToWorld(V(0, 0.3, 0)));
    P.sheet = project(G.res.localToWorld(V(-0.6, 0.44, RES.d / 2)));
    P.contact = project(G.res.localToWorld(V(RES_A[0], 0.34, RES_A[1])));
    P.stylus = project(G.stylus.localToWorld(V(0, 0.9, 0)));
  }
  const focus = giantShot ? org.clone().add(V(0, 1.0, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-3.0, 6.0, 3.6) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.6 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 2.6; S.scene.fog.far = giantShot ? 30 : 8;
  const safe = { shot: shot.id };
  if (!giantShot && !insert) safe.head = project(head).y;
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t), P, S.d.timeline, S.icon, S.capCache, shot.id);
  // two animation frames: lets the compositor pick up both canvases before the screenshot (one frame was not always enough
  // under load: a stale overlay was captured once in the first render of this episode)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  return { boxes, safe, shot: shot.id };
};
window.__sheetPoses = () => [];
/** Final frame composed explicitly (3D canvas, then the overlay canvas) and returned as PNG data, so the written frame never
 *  depends on when the browser's compositor picks up each canvas (a page screenshot once paired a new 3D image with an
 *  overlay from two frames earlier at a scene cut). */
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
