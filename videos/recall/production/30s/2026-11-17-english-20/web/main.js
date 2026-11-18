// Entry: the low-poly café + performer from feedback round 01 with a glass of water whose lime straw looks broken (frame 0 = the
// thumbnail composition), a giant water section where a Snell's-law light path runs from the straw to an eye (slower pulses in
// water, faster in air, a bend at the surface), a lawn mower crossing from grass to pavement, the straight-back line the brain
// assumes with the straw's apparent (ghost) position, and a pool whose floor appears at about 3/4 of its real depth. Renders any
// frame deterministically, plus the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall pill). Frames are written from an
// explicit composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildCafeGlass, buildRaySection, buildMowerSet, buildPool, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, MOWER, POOL, GLASS_POS } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);

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
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 120);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  S.hemi = new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75); scene.add(S.hemi);
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.9, 1.6, 1.5); S.faceLight.position.set(0.3, 1.75, 0.0); scene.add(S.faceLight);
  S.rim = new THREE.PointLight('#FFF1D6', 1.0, 1.0, 1.5); S.rim.position.set(GLASS_POS[0] - 0.15, GLASS_POS[1] + 0.25, GLASS_POS[2] - 0.12); scene.add(S.rim);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.glass = buildCafeGlass(scene); S.glass.group.position.set(...GLASS_POS);
  S.R0 = buildRaySection(scene, GIANT);
  S.Mo = buildMowerSet(scene, MOWER);
  S.Po = buildPool(scene, POOL);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = id.startsWith('giant') ? 'ray' : id === 'mower' ? 'mower' : id.startsWith('pool') ? 'pool' : 'cafe';
  const glassOnly = id === 'hook_glass' || id === 'proof_glass';
  const cam = ch.camera(t);
  // ---------------- café
  const q = ch.person(t); q.pos = ROOT; q.handR = V(0.24, 1.0, -0.36); q.handL = V(-0.22, 1.0, -0.34);
  S.person.apply(q);
  S.glass.setBreak(id === 'proof_glass' ? 0.019 - 0.007 * seg(t, C.proofRise, C.proofRise + 1.2) : 0.019, id === 'proof_glass' ? 0.25 + 0.15 * seg(t, C.proofRise, C.proofRise + 1.2) : 0.25);
  for (const o of [S.cafe.group, S.glass.group]) o.visible = set === 'cafe';
  S.person.root.visible = set === 'cafe' && !glassOnly;
  S.R0.group.visible = set === 'ray'; S.Mo.group.visible = set === 'mower'; S.Po.group.visible = set === 'pool';
  const P = {};
  // ---------------- ray section
  if (set === 'ray') {
    const R0 = S.R0, draw1 = id === 'giant_rays' ? seg(t, C.rays, C.rays + 1.2) : 1, draw2 = id === 'giant_rays' ? seg(t, C.rays + 1.0, C.rays + 2.0) : 1;
    const setLen = (m, a, b, u) => { const d = b.clone().sub(a); m.visible = u > 0.01; m.scale.set(1, Math.max(0.001, u), 1); m.position.copy(a).addScaledVector(d, 0.5 * u); };
    setLen(R0.ray1, R0.P, R0.S, draw1); setLen(R0.ray2, R0.S, R0.E, draw2);
    R0.rayM.opacity = id === 'giant_trace' ? 0.55 : 0.9;
    const back = id === 'giant_trace' ? seg(t, C.trace, C.trace + 1.3) : 0; R0.backL.visible = back > 0.01; R0.backL.children.forEach((d, i, arr) => { d.visible = i / arr.length < back; });
    R0.ghost.visible = id === 'giant_trace' && t > C.ghost; R0.ghostM.opacity = 0.5 * seg(t, C.ghost, C.ghost + 0.6);
    // light pulses: slower (closer together) in water, faster (spread out) in air
    const l1 = R0.P.distanceTo(R0.S), l2 = R0.S.distanceTo(R0.E), v1 = 1.0, v2 = 1.333, T = l1 / v1 + l2 / v2;
    for (let i = 0; i < 24; i++) {
      if (i >= 10 || id !== 'giant_rays' || t < C.rays + 0.4) { R0.dots.setMatrixAt(i, ZERO); continue; }
      const tau = frac((t - C.rays) / T * 0.5 + i / 10) * T;
      const p = tau < l1 / v1 ? R0.P.clone().lerp(R0.S, tau * v1 / l1) : R0.S.clone().lerp(R0.E, Math.min(1, (tau - l1 / v1) * v2 / l2));
      m4.compose(p.setZ(0.15), q4.identity(), s4.setScalar(1)); R0.dots.setMatrixAt(i, m4);
    }
    R0.dots.instanceMatrix.needsUpdate = true;
  }
  // ---------------- mower
  if (set === 'mower') {
    const m = ch.mower(t); S.Mo.mower.position.copy(m.pos); S.Mo.mower.rotation.y = m.ang;
    S.Mo.wheels.forEach(w => { w.rotation.y = -t * m.speed * 7; });
  }
  // ---------------- pool: the floor appears at about 3/4 depth from above
  if (set === 'pool') {
    const Po = S.Po, r = id === 'pool_depth' ? seg(t, C.rise, C.rise + 1.0) : id === 'pool_wide' ? seg(t, C.shallowTag - 0.2, C.shallowTag + 0.8) : 0;
    Po.ghostM.opacity = 0.6 * r; Po.ghost.position.y = -Po.D + 0.02 + (Po.D * 0.25) * r;
    Po.barApp.visible = id === 'pool_depth'; const hA = Po.D * (1 - 0.25 * r); Po.barApp.scale.y = Math.max(0.001, hA); Po.barApp.position.y = -hA / 2;
  }
  // ---------------- camera + lights
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const outdoor = set === 'mower' || set === 'pool';
  const origin = set === 'ray' ? V(...GIANT) : set === 'mower' ? S.Mo.mower.getWorldPosition(V(0, 0, 0)) : set === 'pool' ? V(...POOL) : V(0, 1.0, -0.3);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : origin.clone().add(V(0, set === 'ray' ? 1.8 : 0, 0));
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : V(-2.5, 6.0, 5.0)));
  const ext = set === 'cafe' ? 2.2 : 6;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 30 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' ? 3.2 : 30; S.scene.fog.far = set === 'cafe' ? 9 : 90;
  S.key.color.set(outdoor ? '#FFF2DC' : '#FFD3A0'); S.hemi.color.set(outdoor ? '#DDEBFA' : '#FFE9CC'); S.scene.background = col(outdoor ? '#A9D2EE' : '#2A1E15');
  S.faceLight.intensity = set === 'cafe' && !glassOnly ? 0.9 : 0; S.rim.intensity = glassOnly ? 1.0 : 0;
  // ---------------- overlay anchors
  const G = V(...GIANT), PO = V(...POOL);
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (id === 'giant_rays') { pin('faster', G.clone().add(S.R0.S).add(V(0.6, 0.6, 0.2)), G.clone().add(V(1.3, 2.75, 0.2))); pin('bend', G.clone().add(S.R0.S), G.clone().add(V(1.0, 2.6, 0.2))); }
  if (id === 'mower') { const mp = S.Mo.mower.getWorldPosition(V(0, 0, 0)); pin('side', mp, mp.clone().add(V(0.4, 1.4, 0))); }
  if (id === 'giant_trace') { pin('straight', G.clone().add(S.R0.S), G.clone().add(V(-0.2, 2.75, 0.2))); pin('higher', G.clone().add(S.R0.Q), G.clone().add(S.R0.Q).add(V(1.05, 0.0, 0.2))); }
  if (id === 'pool_wide') pin('shallow', PO.clone().add(V(0, -1.6, -1.5)), PO.clone().add(V(0.3, -0.6, -1.0)));
  if (id === 'pool_depth') pin('quarter', PO.clone().add(V(-2.25, -0.9, 0.2)), PO.clone().add(V(-1.4, -0.5, 0.2)));
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
// The thumbnail is frame 0 itself (the glass with the "broken" straw + the title words) with the Recall pill added.
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
