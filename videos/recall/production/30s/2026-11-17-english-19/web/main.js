// Entry: the low-poly café + performer from feedback round 01 with a hissing pressure cooker, and a giant half-section of the
// cooker (frame 0 = the thumbnail composition: locked lid, thermometer at 120 °C, gauge at 2× pressure): an open pot boils at
// 100 °C when the vapor in a bubble pushes as hard as the air above; the lid locks, trapped steam doubles the pressure and the
// bubbles stop until the water reaches about 120 °C; food cooks faster; on a mountain the same pot boils at about 90 °C. Renders
// any frame deterministically, plus the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall pill). Frames are written from
// an explicit composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildGiantCooker, buildMountains, buildCafeCooker, buildDots, buildPuffs, buildArrow, PC, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, COOKER_POS } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);
const tri = x => 1 - Math.abs(((x % 2) + 2) % 2 - 1);
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 62px Fredoka', '700 44px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });   // software 2D canvas (see __renderFrame)
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 120);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  S.hemi = new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75); scene.add(S.hemi);
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.9, 1.6, 1.5); S.faceLight.position.set(0.3, 1.75, 0.0); scene.add(S.faceLight);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.cc = buildCafeCooker(scene); S.cc.group.position.set(...COOKER_POS);
  S.steam = buildPuffs(scene, 8, '#FFFFFF', 0.45);
  // giant cooker + mountains (same origin; the kitchen backdrop or the mountains are shown per shot)
  S.K = buildGiantCooker(scene, GIANT);
  S.kitchen = S.K.group.children.slice(0, 3).concat([S.K.group.children[3]]);   // back wall, counter, hob, ring
  S.M = buildMountains(scene, GIANT);
  S.bub = buildDots(scene, 18, 0.07, 1); S.K.group.add(S.bub); S.bub.material = new THREE.MeshStandardMaterial({ color: '#EAF6FF', transparent: true, opacity: 0.75, roughness: 0.1 });
  S.big = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color: '#EAF6FF', transparent: true, opacity: 0.6, roughness: 0.05 })); S.K.group.add(S.big);
  S.vap = buildDots(scene, 44, 0.045, 0); S.K.group.add(S.vap);
  S.gsteam = buildPuffs(scene, 8, '#FFFFFF', 0.5); S.K.group.add(S.gsteam);
  const arrow = (c, r) => { const a = buildArrow(scene, c, r); S.K.group.add(a); return a; };
  S.vArr = [-0.7, 0, 0.7].map(a => { const ar = arrow(PAL.lime, 0.05); ar.rotation.z = a; return ar; });
  S.aArr = [-0.55, 0, 0.55].map(() => { const ar = arrow('#2F6FD6', 0.05); ar.rotation.z = Math.PI; return ar; });
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const giantShot = id.startsWith('giant') || id.startsWith('payoff') || id === 'hook_cooker';
  const cam = ch.camera(t);
  const camQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam.pos, cam.target, V(0, 1, 0)));
  // ---------------- café: performer, cooker, steam from the valve
  const q = ch.person(t); q.pos = ROOT; q.handR = V(0.24, 1.0, -0.36); q.handL = V(-0.22, 1.0, -0.34);
  S.person.apply(q);
  const valve = S.cc.valve.clone().add(V(...COOKER_POS));
  for (let i = 0; i < 8; i++) {
    if (giantShot) { S.steam.setMatrixAt(i, ZERO); continue; }
    const u = frac(t * 0.6 + i / 8), p = valve.clone().add(V(0.05 * u + 0.006 * Math.sin(i * 2 + t * 3), 0.16 * u, 0.006 * Math.cos(i)));
    m4.compose(p, camQ, s4.setScalar(0.012 + 0.045 * u)); S.steam.setMatrixAt(i, m4);
  }
  S.steam.instanceMatrix.needsUpdate = true;
  // ---------------- giant cooker
  const K = S.K, st = ch.cooker(t, id), P = {}, org = V(...GIANT);
  let bigY = 0.32, bigR = 0.06;
  K.group.visible = giantShot; S.M.group.visible = giantShot && st.mountain;
  for (const o of S.kitchen) o.visible = !st.mountain;
  K.ring.visible = true; K.glowM.color.set(st.mountain ? '#5AA8FF' : '#FF5A2A');
  for (const o of [S.cafe.group, S.person.root, S.cc.group, S.steam]) o.visible = !giantShot;
  if (giantShot) {
    K.lid.visible = st.lidOn > 0.001; K.lid.position.y = PC.rim + 0.06 + (1 - st.lidOn) * 2.2;
    K.thermo.set(st.temp, st.temp > 101 ? { from: 100, to: Math.min(130, st.temp), color: '#F6B37A' } : null);
    K.gauge.set(st.pressure);
    // boiling bubbles: rise from the base to the surface
    for (let i = 0; i < 18; i++) {
      const u = frac(t * 0.55 + i / 18), x = -0.75 + ((i * 0.53) % 1) * 1.5, z = -0.2 - ((i * 0.31) % 1) * 0.5, on = st.boil * sm(0, 0.1, u) * (1 - sm(0.92, 1, u));
      if (on < 0.02) { S.bub.setMatrixAt(i, ZERO); continue; }
      m4.compose(V(x + 0.05 * Math.sin(t * 4 + i), 0.3 + (PC.waterTop - 0.35) * u, z), q4.identity(), s4.setScalar(on * (0.6 + 0.8 * u))); S.bub.setMatrixAt(i, m4);
    }
    S.bub.instanceMatrix.needsUpdate = true;
    // the explained bubble (open pot): grows at the base, then breaks away when the vapor push matches the air push
    const showBig = id === 'giant_open';
    S.big.visible = showBig;
    bigY = 0.32; bigR = 0.06;
    if (showBig) { const g = seg(t, shot.t0, C.bubble, E.out), rise = seg(t, C.bubble, C.bubble + 0.8, E.in); bigR = 0.06 + 0.14 * g; bigY = 0.26 + bigR + rise * (PC.waterTop - 0.3); S.big.position.set(0, bigY, 0.02); S.big.scale.setScalar(bigR * (1 - 0.8 * sm(0.85, 1, rise))); }
    const vOn = showBig ? seg(t, C.vaporTag - 0.3, C.vaporTag + 0.2) * (1 - seg(t, C.bubble + 0.2, C.bubble + 0.5)) : 0;
    S.vArr.forEach(a => { a.visible = vOn > 0.01; a.position.set(0, bigY, 0.25); a.userData.setLength((bigR + 0.36) * vOn); });
    const aOn = showBig ? seg(t, C.airTag - 0.3, C.airTag + 0.2) * (1 - seg(t, C.bubble + 0.2, C.bubble + 0.5)) : 0;
    S.aArr.forEach((a, k) => { a.visible = aOn > 0.01; a.position.set([-0.55, 0, 0.55][k], PC.waterTop + 0.55, 0.25); a.userData.setLength(0.5 * aOn); });
    // steam above the water: escapes from an open pot, bounces trapped under a locked lid
    const nV = st.trapped ? Math.round(22 + 22 * (st.pressure - 1)) : 26;
    for (let i = 0; i < 44; i++) {
      if (i >= nV) { S.vap.setMatrixAt(i, ZERO); continue; }
      const px = ((i * 0.618) % 1), pz = ((i * 0.377) % 1), ph = (i * 0.29) % 1;
      let p;
      if (st.trapped) p = V(-0.9 + 1.8 * tri(px * 2 + t * 0.35 * (0.6 + px)), PC.waterTop + 0.08 + (PC.rim - PC.waterTop - 0.05) * tri(ph * 2 + t * 0.5 * (0.7 + pz)), -0.75 + 0.85 * tri(pz * 2 + t * 0.3));
      else { const u = frac(t * 0.35 + ph); p = V(-0.8 + 1.6 * px + 0.15 * Math.sin(t + i), PC.waterTop + 0.1 + 3.0 * u, -0.6 + 0.7 * pz); if (u > 0.85) { S.vap.setMatrixAt(i, ZERO); continue; } }
      m4.compose(p, q4.identity(), s4.setScalar(1)); S.vap.setMatrixAt(i, m4); S.vap.setColorAt(i, col('#F4FBFF'));
    }
    S.vap.instanceMatrix.needsUpdate = true; S.vap.instanceColor.needsUpdate = true;
    // jet of steam from the valve weight once the pressure is up
    const jet = st.trapped && st.pressure > 1.9;
    const wTop = V(0.32, K.lid.position.y + 0.52, 0.15);
    for (let i = 0; i < 8; i++) {
      if (!jet) { S.gsteam.setMatrixAt(i, ZERO); continue; }
      const u = frac(t * 0.9 + i / 8);
      m4.compose(wTop.clone().add(V(0.25 * u, 0.9 * u, 0.05 * Math.sin(i))), camQ, s4.setScalar(0.08 + 0.28 * u)); S.gsteam.setMatrixAt(i, m4);
    }
    S.gsteam.instanceMatrix.needsUpdate = true;
    // food: cooks (warms in colour, softens) in the hot water
    K.food.visible = id === 'giant_food' || id === 'hook_cooker' ? id === 'giant_food' : false;
    K.food.children.forEach((m, i) => { m.material.emissiveIntensity = 0.25 + 0.45 * st.cook; m.scale.setScalar(1 - 0.12 * st.cook + 0.03 * Math.sin(t * 6 + i) * st.cook); });
  }
  // ---------------- camera + key light
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = giantShot ? org.clone().add(V(0, 1.5, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-2.5, 5.0, 6.0) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? (st.mountain ? 6 : 4.5) : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 30 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? (st.mountain ? 30 : 14) : 3.2; S.scene.fog.far = giantShot ? (st.mountain ? 80 : 34) : 9;
  S.key.color.set(st.mountain ? '#FFF2DC' : '#FFD3A0'); S.hemi.color.set(st.mountain ? '#DDEBFA' : '#FFE9CC');
  S.faceLight.intensity = giantShot ? 0 : 0.9;
  // ---------------- overlay anchors
  const W = (x, y, z = 0.25) => org.clone().add(V(x, y, z));
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (id === 'giant_open') { pin('vapor', W(0, bigY), W(0.55, 0.75)); pin('air', W(0, PC.waterTop + 0.3), W(-0.35, 2.05)); }
  if (id === 'giant_100') pin('sea', W(0.66, 2.75, 0.4), W(0.66, 2.2, 0.4));
  if (id === 'giant_lid') pin('pressure', W(-0.45, K.lid.position.y + 0.42, 0.3), W(-0.45, K.lid.position.y + 1.05, 0.3));
  if (id === 'giant_hot') pin('hot', W(0.66, 2.75, 0.4), W(0.75, 2.0, 0.4));
  if (id === 'giant_food') pin('faster', W(0, 0.6), W(0.25, 1.15));
  if (id === 'payoff_cool') { pin('cooler', W(0.66, 2.75, 0.4), W(0.75, 2.05, 0.4)); pin('slower', W(0.66, 2.75, 0.4), W(0.75, 2.05, 0.4)); }
  const safe = { shot: id };
  if (id === 'cafe_cta') safe.head = project(S.person.head.localToWorld(V(0, 0.11, 0.02))).y;
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
// The thumbnail is frame 0 itself (the locked cooker at 120 °C + the title words) with the Recall pill added.
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
