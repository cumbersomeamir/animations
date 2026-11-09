// Entry: the low-poly café + performer + lime phone from feedback round 01 (the performer wears sunglasses), the phone's
// reading screen dimmed by the lens (POV shots), a sunglasses test over the phone, and the giant polarization set; renders
// any frame deterministically. Frames are written from an explicit composite of the 3D and overlay canvases (english-09 fix).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildSunglasses, buildRibbon, setRibbon, buildGiantPolar, GS, PAL } from './lowpoly.js';
import { makeChoreo, GIANT, PHONE_FLAT } from './choreo.js';
import { drawReader } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const CORAL = '#F08A5D', PAPER = '#F8FAF3', GOLD = '#FFB830';   // gold = ordinary (unpolarized) light

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 36px Fredoka', '600 52px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });   // software 2D canvas (see __renderFrame)
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
  S.worn = buildSunglasses(); S.worn.group.position.set(0, 0.112, 0.112); S.person.head.add(S.worn.group);
  S.held = buildSunglasses(); scene.add(S.held.group);
  S.heldLensM = S.held.lensM.clone(); S.held.lenses[0].material = S.heldLensM; S.held.lensM.opacity = 0.4;
  S.held.group.children.filter(m => m.geometry?.parameters?.depth === 0.1).forEach(m => {   // folded away: the temples are not shown in the top-down test
    m.visible = false;
  });
  S.G = buildGiantPolar(scene, GIANT);
  S.rib = {
    before: [0, 1, 2, 3, 4, 5].map(() => buildRibbon(scene, GOLD, 140)), after: [0, 1, 2].map(() => buildRibbon(scene, PAL.lime, 140)),
    sunIn: [0, 1].map(() => buildRibbon(scene, GOLD, 120)), glare: [0, 1, 2].map(() => buildRibbon(scene, CORAL, 120)),
    phoneIn: [0, 1, 2].map(() => buildRibbon(scene, PAL.lime, 120)), passOut: [0, 1, 2].map(() => buildRibbon(scene, PAL.lime, 120)),
  };
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const wave = (amp, k, sp, t) => s => amp * Math.sin(2 * Math.PI * (s * k - t * sp));

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant'), pov = shot.id.endsWith('_pov'), testShot = shot.id === 'test_cu';
  // ---------------- performer + phone in the hand (rotates in its own plane), or lying flat for the test
  const q = ch.person(t); S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  const arm = S.person.arms[1], wrist = arm.hand.getWorldPosition(V(0, 0, 0)), elbow = arm.el.getWorldPosition(V(0, 0, 0));
  const fdir = wrist.clone().sub(elbow).normalize(), palmC = wrist.clone().add(fdir.clone().multiplyScalar(0.04));
  const phonePos = palmC.clone().add(head.clone().sub(palmC).normalize().multiplyScalar(0.03)).add(fdir.clone().multiplyScalar(0.035));
  const sc = ch.screen(t);
  S.phone.tips = S.phone.tips || S.phone.group.children.filter(m => m.geometry?.parameters?.width === 0.009);
  S.phone.tips.forEach(m => { m.visible = !testShot; });   // the in-hand fingertips are not shown while the phone lies flat
  if (testShot) { S.phone.group.position.set(...PHONE_FLAT); S.phone.group.rotation.set(-Math.PI / 2, 0, 0); }
  else { S.phone.group.position.copy(phonePos); S.phone.group.lookAt(head); S.phone.group.rotateZ(sc.rot); }
  S.phone.group.updateMatrixWorld(true);
  drawReader(S.phone.ctx, 540, 1140, { bright: pov ? sc.bright : 1 }); S.phone.tex.needsUpdate = true;
  // sunglasses: worn (all real shots except the test), held over the flat phone in the test (rotated aligned -> crossed)
  S.worn.group.visible = !testShot;
  const ts = ch.test(t);
  S.held.group.visible = testShot;
  if (testShot) {
    S.held.group.rotation.set(-Math.PI / 2, 0, ts.yaw, 'XYZ'); S.held.group.position.copy(ts.group);
    S.heldLensM.opacity = 0.4 + 0.56 * ts.dark;        // the lens over the screen: tint + the blocked screen light
  }
  // ---------------- giant set
  const G = S.G, gs = ch.giant(t), org = V(...GIANT), P = {};
  G.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, S.phone.group]) o.visible = !giantShot;
  if (!giantShot) S.person.root.visible = !pov;
  for (const k in S.rib) S.rib[k].forEach(r => { r.visible = false; });
  if (giantShot) {
    const sS = org.clone().add(V(...GS.S)), sL = org.clone().add(V(...GS.L));
    G.S.visible = shot.id === 'giant_screen'; G.L.visible = !G.S.visible;
    G.panel.material.emissiveIntensity = 0.25 + 0.6 * gs.panel;
    if (shot.id === 'giant_screen') {
      // unpolarized light from the panel: ribbons vibrating in every direction, from the panel to the filter
      S.rib.before.forEach((r, k) => {
        const a = k * 1.047 + 0.3, c = sS.clone().add(V(0.5 * Math.cos(a), 1.4 + 0.45 * Math.sin(a), 0)), ang = k * 0.52 + 0.3, up = V(Math.cos(ang), Math.sin(ang), 0);
        r.visible = gs.before > 0.01; if (r.visible) setRibbon(r, c.clone().add(V(0, 0, -1.03)), c.clone().add(V(0, 0, -1.03 + 0.99 * gs.before)), up, wave(0.1, 3.2, 1.6, t + k * 0.13), 0.045);
      });
      // after the filter: one direction only (horizontal), toward the viewer
      S.rib.after.forEach((r, k) => {
        const c = sS.clone().add(V(0, 1.0 + 0.4 * k, 0.05));
        r.visible = gs.after > 0.01; if (r.visible) setRibbon(r, c, c.clone().add(V(0, 0, 1.25 * gs.after)), V(1, 0, 0), wave(0.13, 2.3 * gs.after + 0.01, 1.6, t), 0.05);
      });
    }
    const glareShot = shot.id === 'giant_glare';
    G.sun.visible = glareShot; G.water.visible = glareShot; G.phone.visible = shot.id === 'giant_cross';
    G.lens.rotation.x = glareShot ? 0.3 : 0;
    if (glareShot) {
      const sun = G.sun.getWorldPosition(V(0, 0, 0));
      const hits = [0, 1, 2].map(k => sL.clone().add(V(0.38 + 0.22 * k, 0.535, 1.02 + 0.08 * k)));
      S.rib.sunIn.forEach((r, k) => {
        const hit = hits[k * 2];
        r.visible = gs.incoming > 0.01; if (r.visible) setRibbon(r, sun, sun.clone().lerp(hit, gs.incoming), (k ? V(0.2, 0.3, -0.9) : V(0.8, 0.0, -0.6)).normalize(), wave(0.07, 7, 1.4, t + k), 0.035);
      });
      // glare: vibrates sideways (parallel to the water, across the plane of incidence) and stops at the lens
      S.rib.glare.forEach((r, k) => {
        const from = hits[k], to = sL.clone().add(V(-0.3 + 0.3 * k, 1.38 + 0.12 * k, 0.42));
        const side = V(0.8, 0, -0.6).normalize();
        r.visible = gs.glare > 0.01; if (r.visible) setRibbon(r, from, from.clone().lerp(to, gs.glare), side, wave(0.09, 3.2 * gs.glare + 0.01, 1.5, t + k * 0.2), 0.05);
      });
    }
    if (shot.id === 'giant_cross') {
      const ang = gs.turn * Math.PI / 2;
      G.phone.rotation.z = ang;
      const up = V(Math.cos(ang), Math.sin(ang), 0);       // the phone filter's direction = the light's vibration direction
      S.rib.phoneIn.forEach((r, k) => {
        const o = V(0, -0.4 + 0.4 * k, 0).applyAxisAngle(V(0, 0, 1), ang);
        const from = sL.clone().add(V(0, 1.55, -1.55)).add(o), to = sL.clone().add(V(0, 1.55, 0.26)).add(o);
        r.visible = gs.phoneLight > 0.01; if (r.visible) setRibbon(r, from, from.clone().lerp(to, gs.phoneLight), up, wave(0.11, 4.3 * gs.phoneLight + 0.01, 1.5, t + k * 0.2), 0.05);
      });
      S.rib.passOut.forEach((r, k) => {
        const o = V(0, -0.4 + 0.4 * k, 0).applyAxisAngle(V(0, 0, 1), ang);
        const from = sL.clone().add(V(0, 1.55, 0.34)).add(o);
        r.visible = gs.pass > 0.01; if (r.visible) setRibbon(r, from, from.clone().add(V(0, 0, 1.1 * gs.pass)), up, wave(0.11, 2.6 * gs.pass + 0.01, 1.5, t + k * 0.2), 0.05);
      });
    }
  }
  // ---------------- camera + key light
  const cam = ch.camera(t, { head, phone: phonePos });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  if (giantShot) {
    const sS = org.clone().add(V(...GS.S)), sL = org.clone().add(V(...GS.L)), at = (k, p, q) => { P[k] = project(p); P[k + 'T'] = project(q); };
    if (shot.id === 'giant_screen') {
      at('before', sS.clone().add(V(0.55, 1.5, -0.6)), sS.clone().add(V(1.0, 2.5, -0.9)));
      at('filter', sS.clone().add(V(0.72, 0.85, 0.02)), sS.clone().add(V(1.1, 0.75, 0.5)));
      at('after', sS.clone().add(V(0.05, 1.8, 0.95)), sS.clone().add(V(-0.2, 2.3, 1.4)));
    } else if (shot.id === 'giant_glare') {
      at('lens', sL.clone().add(V(-0.45, 1.95, 0.35)), sL.clone().add(V(-0.3, 2.55, 0.2)));
      at('glare', sL.clone().add(V(0.55, 0.85, 0.85)), sL.clone().add(V(1.2, 0.5, 1.6)));
      at('block', sL.clone().add(V(0.0, 1.4, 0.45)), sL.clone().add(V(-0.7, 1.05, 0.9)));
    } else {
      at('lens', sL.clone().add(V(-0.55, 1.55, 0.35)), sL.clone().add(V(-0.4, 0.95, 1.2)));
    }
  } else if (testShot) { P.glasses = project(ts.lens.clone().add(V(-0.012, 0, 0.012))); P.glassesT = project(ts.lens.clone().add(V(0, -0.07, 0.085))); }
  const focus = giantShot ? org.clone().add(V(0, 1.0, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-3.0, 6.0, 3.6) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.6 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 2.6; S.scene.fog.far = giantShot ? 30 : 8;
  const safe = { shot: shot.id };
  if (!giantShot && !pov && !testShot) safe.head = project(head).y;
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  S.octx.getImageData(0, 0, 1, 1);   // flush the overlay's draws before the frame is captured (english-09 fix)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  return { boxes, safe, shot: shot.id };
};
window.__sheetPoses = () => [];
/** Final frame composed explicitly (3D canvas, then the overlay canvas) and returned as PNG data. */
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
