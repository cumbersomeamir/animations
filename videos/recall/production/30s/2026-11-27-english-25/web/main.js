// Entry: the low-poly café + performer from feedback round 01 (E13 legs) zipping a pencil case on the counter (english-25), plus the
// giant zipper cut-away (staggered teeth with bumps and hollows, the slider's Y channel with slanted walls and a wedge, the lifting
// cover with the lime pull tab and lock catch) and an exploded nest demo. Frame 0 = the thumbnail composition (the giant slider with
// separate rows above and joined teeth below + title). Renders any frame deterministically, plus the thumbnail ("sheet" pose = frame 0
// + Recall pill). Frames are written from an explicit composite of the 3D and overlay canvases (english-09 renderer note).
import * as THREE from 'three';
import { buildCafe, buildPerson, flat } from './lowpoly.js';
import { buildGiantZip, buildNestDemo, buildPencilCase, Z } from './zip.js';
import { makeChoreo, ROOT, GIANT, NEST, CASE_POS, CASE_ROT } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.005, 120);
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
  S.cafe.coffee.visible = true;
  S.case = buildPencilCase(scene, CASE_POS, CASE_ROT);
  S.Zp = buildGiantZip(scene, GIANT); S.Nest = buildNestDemo(scene, NEST);
  S.giantLight = new THREE.PointLight('#FFE2B8', 0, 30, 1.0); scene.add(S.giantLight);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const GIANT_SHOTS = ['hook_giant', 'giant_y', 'giant_close', 'pull_test', 'giant_open', 'lock_catch'];
const NEST_SHOTS = ['tooth_parts', 'tooth_nest'];

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = GIANT_SHOTS.includes(id) ? 'giant' : NEST_SHOTS.includes(id) ? 'nest' : 'cafe';
  const P = {}, G = V(...GIANT), Nn = V(...NEST);
  // ---------------- café
  const q = ch.person(t); q.pos = ROOT; S.person.apply(q);
  const zc = ch.zipCase(t); S.case.set(zc.u, zc.lift);
  S.cafe.group.visible = S.person.root.visible = S.case.group.visible = set === 'cafe';
  // ---------------- giant zipper + nest demo
  S.Zp.group.visible = set === 'giant'; S.Nest.group.visible = set === 'nest';
  const zs = ch.zip(t, id);
  if (set === 'giant') {
    S.Zp.set(zs);
    S.Zp.wallM.emissiveIntensity = zs.glowWalls; S.Zp.wedgeM.emissiveIntensity = zs.glowWedge;
  }
  if (set === 'nest') S.Nest.set(zs.gap);
  // ---------------- camera + lights
  const cam = ch.camera(t, {});
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : set === 'giant' ? G.clone() : Nn.clone();
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : V(-3.5, 6.0, 7.0)));
  S.key.intensity = set === 'cafe' ? 3.2 : 2.2;
  const ext = set === 'cafe' ? 2.2 : 8;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 40 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' ? 3.2 : 30; S.scene.fog.far = set === 'cafe' ? 9 : 90;
  S.scene.background = col(set === 'cafe' ? '#2A1E15' : '#141A1F');
  S.hemi.intensity = set === 'cafe' ? 0.75 : 0.6;
  S.giantLight.intensity = set === 'cafe' ? 0 : 1.6; S.giantLight.position.copy(focus.clone().add(set === 'nest' ? V(2.0, -3.5, 4.5) : V(2.5, 2.0, 5.0)));
  S.faceLight.intensity = set === 'cafe' ? 0.9 : 0;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  const g = (x, y, z) => G.clone().add(V(x, y, z)), n = (x, y, z) => Nn.clone().add(V(x, y, z));
  if (id === 'giant_y') pin('y', g(0, 0.9, 0.3), g(-1.0, 2.6, 0.5));
  if (id === 'giant_close') pin('walls', g(-(Z.W + 0.6), 0.9, 0.3), g(-1.6, 2.4, 0.4));
  if (id === 'tooth_parts') { pin('bump', n(-0.18 * 2, -1.2 + 0.35 + 0.15, 0.2), n(-1.6, -0.3, 0.3)); pin('hollow', n(0.18 * 2, -1.2 + 1.4 - 0.36, 0.2), n(1.5, 0.9, 0.2)); }
  if (id === 'tooth_nest') pin('nest', n(0, 0.2, 0.4), n(-1.2, 1.4, 0.4));
  if (id === 'pull_test') pin('holds', g(0, -4.4, 0.2), g(0.2, -2.6, 0.3));
  if (id === 'giant_open') pin('wedge', g(0, 1.0, 0.3), g(0.9, 2.6, 0.4));
  if (id === 'lock_catch') pin('lock', g(0, -1.05, 0.15), g(-1.1, 0.2, 0.3));
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
// The thumbnail is frame 0 itself (the giant slider + the title words) with the Recall pill added.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  const { t, shot, P } = applyFrame(0);
  S.R.render(S.scene, S.cam);
  drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  drawThumbnail(S.octx, S.W, S.H, S.icon);
  S.octx.getImageData(0, 0, 1, 1);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
};
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
