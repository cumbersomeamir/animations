// Entry: the low-poly café + performer from feedback round 01 (E13 legs) with the english-11 counter microwave, now with a real
// perforated door screen, a mug on the turntable and a power strip (english-24); plus the giant door cut-away (perforated sheet at
// true hole-to-wavelength scale, the microwave and its reflection, rulers, the "solid metal" overlay, light rays, the bent-door gap).
// Frame 0 = the thumbnail composition (the door's metal net in front of the lit mug + title). Renders any frame deterministically,
// plus the thumbnail ("sheet" pose = frame 0 + Recall pill). Frames are written from an explicit composite of the 3D and overlay
// canvases (english-09 renderer note).
import * as THREE from 'three';
import { buildCafe, buildPerson, setRibbon, flat } from './lowpoly.js';
import { buildMicrowave, buildPlug, buildGiantDoor, GD } from './door.js';
import { makeChoreo, ROOT, GIANT, MW_POS, MW_ROT, PLUG_POS, PLUG_ROT } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 110px Fredoka', '700 150px Fredoka'].map(f => document.fonts.load(f)));
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
  S.cafe.coffee.visible = false;                              // the mug is in the microwave now
  S.mw = buildMicrowave(scene); S.mw.group.position.set(...MW_POS); S.mw.group.rotation.y = MW_ROT; S.mw.group.updateMatrixWorld(true);
  S.plug = buildPlug(scene, PLUG_POS, PLUG_ROT);
  S.Gd = buildGiantDoor(scene, GIANT);
  S.giantLight = new THREE.PointLight('#FFD9A0', 0, 30, 1.0); S.giantLight.position.set(GIANT[0] - 2, 6, GIANT[2] - 6); scene.add(S.giantLight);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const GIANT_SHOTS = ['giant_wave', 'giant_holes', 'giant_solid', 'giant_bounce', 'light_rays', 'door_gap'];
const UPY = V(0, 1, 0), UPX = V(1, 0, 0);

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = GIANT_SHOTS.includes(id) ? 'giant' : 'cafe';
  const P = {}, G = V(...GIANT);
  // ---------------- café
  const q = ch.person(t, id); q.pos = ROOT; S.person.apply(q);
  S.mw.set(ch.microwave(t)); S.plug.set(ch.plugOut(t));
  S.cafe.group.visible = S.mw.group.visible = S.plug.group.visible = set === 'cafe';
  S.person.root.visible = set === 'cafe' && id !== 'hook_mesh' && id !== 'peer_pov';
  // ---------------- giant door cut-away
  S.Gd.group.visible = set === 'giant';
  if (set === 'giant') {
    const s = ch.door(t, id), D = S.Gd, y0 = GD.waveY, A = GD.A, w = id === 'giant_holes' ? 0.035 : 0.13;
    const wave = (rib, y, z0, z1, amp, ph) => {   // the wave oscillates sideways (x) as it travels along z, so it reads from above
      rib.visible = Math.abs(z1 - z0) > 0.01;
      if (rib.visible) setRibbon(rib, V(0, y, z0), V(0, y, z1), UPX, u => amp * Math.sin(ph(z0 + (z1 - z0) * u)), w);
    };
    if (s.inc) wave(D.inc, y0, s.inc.z0, s.inc.z1, A, s.inc.phase); else D.inc.visible = false;
    if (s.ref) wave(D.ref, y0 + 0.18, s.ref.z0, s.ref.z1, A * 0.9, z => (2 * Math.PI) * (-z - 4.5 * t) / GD.lambda + Math.PI); else D.ref.visible = false;
    D.solidM.opacity = s.solid;
    D.setRays(s.rays, t);
    D.pivot.rotation.y = -0.11 * s.gap;
    if (s.gap > 0.01) {   // a wave squeezing out through the opened gap at the right edge (illustrative)
      D.leak.visible = true;
      setRibbon(D.leak, V(GD.sheetW / 2 - 0.1, y0, -2.8), V(GD.sheetW / 2 + 0.7, y0, 3.6), UPX, u => 0.35 * (1 - 0.5 * u) * s.gap * Math.sin(2 * Math.PI * (u * 6.4 - 4.5 * t) / GD.lambda * 2.0), 0.2);
    } else D.leak.visible = false;
    D.lamRuler.visible = s.lam > 0.01; D.lamRuler.scale.setScalar(Math.max(0.001, s.lam));
    D.lamRuler.position.set(A + 0.75, y0, -6.5);
    D.holeRuler.visible = s.hole > 0.01; const h0 = D.holes[0]; D.holeRuler.position.set(h0.x, h0.y - GD.hole / 2 - 0.012, -0.004); D.holeRuler.scale.set(1, Math.max(0.001, s.hole), 1);
  }
  // ---------------- camera + lights
  const cam = ch.camera(t);
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : G.clone().add(V(0, 3, -2));
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : V(-4.0, 7.0, 5.0)));
  S.key.intensity = set === 'cafe' ? 3.2 : 1.8;
  const ext = set === 'cafe' ? 2.2 : 9;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 40 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' ? 3.2 : 30; S.scene.fog.far = set === 'cafe' ? 9 : 90;
  S.scene.background = col(set === 'giant' ? '#141A1F' : '#2A1E15');
  S.hemi.intensity = set === 'cafe' ? 0.75 : 0.5; S.giantLight.intensity = set === 'giant' ? 2.0 : 0;
  S.faceLight.intensity = set === 'cafe' && id !== 'hook_mesh' && id !== 'peer_pov' ? 0.9 : 0;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (set === 'giant') {
    const w = v => G.clone().add(v), h0 = S.Gd.holes[0];
    if (id === 'giant_wave') pin('wave', w(V(GD.A + 0.75, GD.waveY, -6.5)), w(V(GD.A + 1.6, GD.waveY + 1.2, -8.5)));
    if (id === 'giant_holes') pin('mm', w(V(h0.x, h0.y - GD.hole / 2 - 0.015, 0)), w(V(h0.x + 0.05, h0.y - 0.16, -0.05)));
    if (id === 'giant_solid') pin('solid', w(V(-1.2, GD.waveY + 1.2, 0)), w(V(-1.6, GD.waveY + 2.6, -0.5)));
    if (id === 'giant_bounce') pin('bounce', w(V(0.0, GD.waveY + 0.18, -3.2)), w(V(-1.2, GD.waveY + 1.6, -4.5)));
    if (id === 'light_rays') pin('light', w(V(h0.x, h0.y, 0.6)), w(V(-0.25, GD.waveY + 0.35, 0.3)));
    if (id === 'door_gap') pin('gap', w(V(GD.sheetW / 2 + 0.3, GD.waveY + 1.2, 0.4)), w(V(GD.sheetW / 2 - 0.6, GD.waveY + 3.0, 0.8)));
  }
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
// The thumbnail is frame 0 itself (the door's metal net in front of the lit mug + the title words) with the Recall pill added.
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
