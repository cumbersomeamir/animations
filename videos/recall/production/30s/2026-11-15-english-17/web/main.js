// Entry: an airliner window seat in the Low-poly Everyday Discovery style (frame 0 = the window with its small hole glowing:
// the thumbnail composition), the same everyday performer from feedback round 01 in the window seat, a giant section through
// the window's three layers with air "pressure" dots (dense cabin air, thin outside air, the gap behind the middle layer
// connected to the cabin through the hole), and fog spreading between the layers; renders any frame deterministically, plus
// the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall pill). Frames are written from an explicit composite of the 3D
// and overlay canvases.
import * as THREE from 'three';
import { buildPerson, buildCabin, buildHoleMarker, buildFog, buildWindowSection, buildDots, buildArrow, polyPath, SEC, WIN, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, HOLE } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);
const tri = x => 1 - Math.abs(((x % 2) + 2) % 2 - 1);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });   // software 2D canvas (see __renderFrame)
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A2622'); scene.fog = new THREE.Fog('#3A332B', 4, 12); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.005, 80);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: low warm sun through the windows (key), cabin fill, hemisphere bounce, a soft face light
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.0); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFF0DC', '#4A4038', 0.85));
  S.fill = new THREE.DirectionalLight('#B9C8DE', 0.55); S.fill.position.set(-3, 2.5, 3); scene.add(S.fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.8, 1.8, 1.5); S.faceLight.position.set(-0.2, 1.45, 0.5); scene.add(S.faceLight);
  S.cabin = buildCabin(scene); S.person = buildPerson(scene);
  S.fingers = S.person.arms.map(a => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.055, 0.017), flat('#A8714E')); f.position.set(0, -0.088, 0.004); f.castShadow = true; a.hand.add(f); return f; });
  S.hole = buildHoleMarker(scene); S.fog = buildFog(scene);
  S.moist = buildDots(scene, 8, 0.0013, 0);
  // giant section
  S.G = buildWindowSection(scene, GIANT);
  const R0 = [...SEC.cabin, ...SEC.gap, ...SEC.out], area = r => (r[1] - r[0]) * (r[3] - r[2]), D = 15;
  S.regions = R0.map((r, i) => ({ r, n: Math.round(area(r) * D), out: i === R0.length - 1 }));
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  S.dotData = []; for (const reg of S.regions) for (let k = 0; k < reg.n; k++) S.dotData.push({ reg, p: [rnd(), rnd(), rnd()], v: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], k });
  S.flowPath = polyPath([[-0.56, 1.49, -0.07], [-0.36, 1.49, -0.07], [-0.2, 1.49, -0.07], [-0.02, 1.64, -0.1]]);
  const arrow = (c, r) => { const a = buildArrow(scene, c, r); S.G.group.add(a); return a; };
  S.push = [1.65, 2.2, 2.75].map(y => { const a = arrow(PAL.lime, 0.035); a.rotation.z = -Math.PI / 2; a.position.set(-0.08, y, 0.12); return a; });
  S.bal = [1.9, 2.6].flatMap(y => [[-0.66, -Math.PI / 2], [-0.0, Math.PI / 2]].map(([x, rz]) => { const a = arrow(PAL.paper, 0.03); a.rotation.z = rz; a.position.set(x, y, 0.12); return a; }));
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const giantShot = id.startsWith('giant'), payoff = id === 'payoff_fog' || id === 'payoff_moist', povShot = id === 'hook_window' || payoff;
  // ---------------- performer (window seat)
  const q = ch.person(t, id); q.pos = ROOT;
  const restR = V(0.24, 0.62, 0.17), restL = V(0.0, 0.62, 0.17);
  S.person.apply({ ...q, handR: undefined, handL: undefined });
  const hole = V(...HOLE);
  q.handR = q.point > 0 ? restR.clone().lerp(V(0.41, 1.02, 0.06), q.point) : restR; q.handL = restL;
  q.pole = [[-0.8, -0.4, -0.5], [0.9, -0.6, 0.3]];
  S.person.apply(q);
  const armR = S.person.arms.find(a => a.s > 0);
  if (q.point > 0) {   // aim the right hand and its index finger at the hole
    const w = armR.hand.getWorldPosition(V(0, 0, 0)), dirW = hole.clone().sub(w).normalize(), pq = armR.hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    armR.hand.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), dirW.applyQuaternion(pq)), q.point);
  }
  S.fingers.forEach((fm, i) => { fm.visible = S.person.arms[i].s > 0 && q.point > 0.05; });
  // ---------------- cabin: hole glow, fog, moist air
  S.hole.glow.material.opacity = 0.65 + 0.25 * Math.sin(2 * Math.PI * 1.1 * t);
  const fogU = payoff ? seg(t, C.fog, C.fog + 4.2, E.out) : 0;
  if (fogU !== S.lastFog) { S.fog.draw(fogU); S.lastFog = fogU; }
  for (let i = 0; i < 8; i++) {
    if (!payoff) { S.moist.setMatrixAt(i, ZERO); continue; }
    const u = frac(t * 0.45 + i / 8), y = HOLE[1] + 0.004 * Math.sin(i * 2.3), z = 0.006 * Math.cos(i * 1.7) * (1 - u);
    const p = u < 0.7 ? V(WIN.x + 0.02 + (HOLE[0] - WIN.x - 0.02) * u / 0.7, y + 0.03 * (1 - u / 0.7), z + 0.02 * (1 - u / 0.7)) : V(HOLE[0] + 0.012 * (u - 0.7) / 0.3, y + 0.01 * (u - 0.7), z);
    m4.compose(p, q4.identity(), s4.setScalar(1)); S.moist.setMatrixAt(i, m4); S.moist.setColorAt(i, col('#9FD8F0'));
  }
  S.moist.instanceMatrix.needsUpdate = true; if (S.moist.instanceColor) S.moist.instanceColor.needsUpdate = true;
  // ---------------- visibility
  S.G.group.visible = giantShot;
  S.cabin.group.visible = !giantShot; S.hole.group.visible = !giantShot; S.fog.mesh.visible = payoff; S.moist.visible = payoff;
  S.person.root.visible = !giantShot && !povShot;
  // ---------------- giant section: pressure dots, flow through the hole, arrows, pane highlights
  const G = S.G, st = ch.section(t), P = {}, org = V(...GIANT);
  if (giantShot) {
    let i = 0;
    for (const dd of S.dotData) {
      const { reg, p, v, k } = dd, r = reg.r;
      const visible = reg.out ? k < Math.round(reg.n * (1 - 0.7 * st.climb)) : true;
      if (!visible) { G.dots.setMatrixAt(i++, ZERO); continue; }
      const sp = 0.22, x = r[0] + tri(p[0] * 2 + v[0] * sp * t / (r[1] - r[0])) * (r[1] - r[0]), y = r[2] + tri(p[1] * 2 + v[1] * sp * t / (r[3] - r[2])) * (r[3] - r[2]);
      const z = -0.95 + tri(p[2] * 2 + v[2] * sp * t) * 1.1;
      m4.makeTranslation(x, y, z); G.dots.setMatrixAt(i++, m4);
    }
    for (let k = 0; k < 8; k++, i++) {   // air passing both ways through the hole
      if (!(st.flow > 0)) { G.dots.setMatrixAt(i, ZERO); continue; }
      const u = frac(t * 0.33 + k / 8), s = k % 2 ? u : 1 - u, p = S.flowPath.at(Math.min(0.999, s));
      m4.makeTranslation(p.x, p.y, p.z); G.dots.setMatrixAt(i, m4);
    }
    for (; i < G.dots.count; i++) G.dots.setMatrixAt(i, ZERO);
    G.dots.instanceMatrix.needsUpdate = true;
    G.outerM.emissiveIntensity = 0.32 * st.load * (0.8 + 0.2 * Math.sin(2 * Math.PI * 1.5 * t));
    G.middleM.emissiveIntensity = 0.28 * st.backup;
    G.holeGlow.material.opacity = 0.5 * st.flow; G.holeRing.material.opacity = st.flow;
    const pushOn = id === 'giant_outer' || id === 'giant_backup';
    S.push.forEach((a, j) => { a.visible = pushOn && st.load > 0; a.userData.setLength(0.27 * E.out(clamp(st.load * 1.2 - j * 0.1))); });
    S.bal.forEach((a, j) => { a.visible = id === 'giant_equal' && st.equal > 0; a.userData.setLength((j % 2 ? 0.17 : 0.27) * E.out(st.equal)); });
  } else { S.push.forEach(a => { a.visible = false; }); S.bal.forEach(a => { a.visible = false; }); }
  // ---------------- camera + lights
  const cam = ch.camera(t);
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = giantShot ? org.clone().add(V(0, 2.3, 0)) : V(0.3, 1.0, 0);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(2.5, 5.0, 6.0) : V(3.2, 1.1, -1.4)));
  const ext = giantShot ? 4.5 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 14 : 4; S.scene.fog.far = giantShot ? 34 : 12;
  S.faceLight.intensity = giantShot ? 0 : povShot ? 0.7 : 0.8;
  if (povShot) S.faceLight.position.copy(cam.pos).add(V(0.15, 0.15, 0.1)); else S.faceLight.position.set(-0.2, 1.45, 0.5);
  // ---------------- overlay anchors
  const W = (x, y, z) => org.clone().add(V(x, y, z));
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (id === 'giant_climb') pin('thin', W(1.6, 3.0, 0), W(1.4, 3.3, 0));
  if (id === 'giant_outer') pin('outer', W(0.34, 2.6, 0), W(0.55, 3.3, 0));
  if (id === 'giant_hole') pin('hole', W(-0.28, 1.49, 0), W(-0.28, 1.95, 0));
  if (id === 'giant_equal') pin('noLoad', W(-0.28, 2.9, 0), W(-0.28, 3.15, 0));
  if (id === 'giant_backup') pin('backup', W(-0.28, 2.9, 0), W(-0.4, 3.25, 0));
  if (id === 'payoff_fog') pin('fog', V(HOLE[0] + 0.005, HOLE[1] + 0.06, 0), V(HOLE[0], HOLE[1] + 0.11, -0.04));
  if (id === 'payoff_moist') pin('moist', hole, V(HOLE[0], HOLE[1] + 0.022, -0.02));   // above the hole (below it, the camera push drove the label past y 1460)
  const safe = { shot: id };
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
// The thumbnail is frame 0 itself (the window with its glowing hole + the title words) with the Recall pill added.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  const { t, shot, P } = applyFrame(0);
  S.R.render(S.scene, S.cam);
  drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  drawThumbnail(S.octx, S.W, S.H, S.icon);
  S.octx.getImageData(0, 0, 1, 1);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
};
/** Final frame composed explicitly (3D canvas, then the overlay canvas) and returned as PNG data. */
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
