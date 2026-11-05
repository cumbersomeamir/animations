// Entry: the low-poly café + performer from feedback round 01, plus over-ear headphones, a wall AC unit, wave ribbons
// and the giant headphone cutaway with its three-lane wave panel; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildHeadphones, buildAC, buildRibbon, setRibbon, buildGiantANC, PAL } from './lowpoly.js';
import { makeChoreo, noise, waveTime, SLOW_PH, LANE, AC_POS, GIANT } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp, smooth } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const CORAL = '#F08A5D', PAPER = '#F8FAF3';

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  const sample = 'हेडफ़ोन एसी गूंज दोस्त आवाज़ माइक स्पीकर उल्टी लहर देर धीमी प्लेन ट्रेन रिकॉल डाउनलोड एआई अरे सुनो';
  await Promise.all(['600 56px "Baloo 2"', '700 38px "Baloo 2"', '700 50px "Baloo 2"'].map(f => document.fonts.load(f, sample)));
  await Promise.all(['600 54px Fredoka', '700 36px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')))
    .concat(['अरे, सुनो!', 'शोर', 'माइक', 'स्पीकर', 'उल्टी लहर', 'कान तक', 'देर', 'धीमी गूंज', 'लगभग शांत', 'आवाज़', 'आवाज़ बची', 'प्लेन', 'ट्रेन', 'एसी']);
  const fontCheck = texts.every(s => document.fonts.check('600 56px "Baloo 2"', s) && document.fonts.check('700 38px "Baloo 2"', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 60);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01)
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  S.hp = buildHeadphones(); S.person.head.add(S.hp.group);
  S.ac = buildAC(scene); S.ac.position.set(...AC_POS);
  S.humRib = buildRibbon(scene, CORAL, 160, 0.95); S.voiceRib = buildRibbon(scene, PAPER, 160, 0.95);
  S.G = buildGiantANC(scene, GIANT);
  S.lanes = [buildRibbon(scene, CORAL), buildRibbon(scene, PAL.lime), buildRibbon(scene, PAPER)];
  S.srcRibs = [0, 1, 2].map(() => buildRibbon(scene, CORAL, 160, 0.9));
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const UP = V(0, 1, 0);

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  // performer + headphones
  const q = ch.person(t); S.person.apply(q);
  const h = ch.hook(t);
  S.hp.cups.forEach(c => c.led.material.color.set(h.ledOn ? PAL.lime : '#3A3A36'));
  const cupL = S.hp.cups[0].c.getWorldPosition(V(0, 0, 0)), head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // real-world ribbons: steady AC hum flattens near the ear once ANC is on; the sudden voice passes through
  const acFront = V(AC_POS[0] + 0.1, AC_POS[1] - 0.1, AC_POS[2] + 0.12);
  S.humRib.visible = !!h.humVis && !shot.id.startsWith('giant');
  if (S.humRib.visible) setRibbon(S.humRib, acFront, cupL.clone().add(V(-0.02, 0, 0.02)), UP, s => 0.045 * Math.sin(2 * Math.PI * (s * 2.2 - t * 1.1)) * (1 - h.anc * smooth(0.45, 0.85, s)), 0.012);
  S.voiceRib.visible = h.voiceVis > 0.01 && shot.id === 'hook_cu';
  if (S.voiceRib.visible) {
    const v0 = V(-1.15, 1.62, 0.05), k = h.voiceVis;
    setRibbon(S.voiceRib, v0, v0.clone().lerp(cupL, k), UP, s => 0.035 * Math.sin(2 * Math.PI * (s * 9 - t * 6)) * (0.5 + 0.5 * Math.sin(s * 23 + 1)) , 0.01);
  }
  // giant
  const G = S.G, gs = ch.giant(t), P = {};
  G.micM.emissiveIntensity = 1.4 * gs.mic;
  G.driver.scale.setScalar(1 + 0.04 * gs.driver);
  const pl = (x, y) => G.panel.localToWorld(V(x, y, 0.07));
  const kind = gs.kind, D = LANE.DELAY;
  const xs = s => LANE.x0 + (LANE.x1 - LANE.x0) * s;
  const tw = waveTime(t), A = x => noise(x, tw, kind) * gs.humIn, B = x => -noise(x - D, tw, kind) * gs.anti;
  G.panel.updateMatrixWorld(true);
  setRibbon(S.lanes[0], pl(LANE.x0, G.lanesY[0]), pl(LANE.x1, G.lanesY[0]), UP, s => A(xs(s)), 0.04);
  setRibbon(S.lanes[1], pl(LANE.x0, G.lanesY[1]), pl(LANE.x1, G.lanesY[1]), UP, s => B(xs(s)), 0.04);
  setRibbon(S.lanes[2], pl(LANE.x0, G.lanesY[2]), pl(LANE.x1, G.lanesY[2]), UP, s => (gs.sum > 0 ? (A(xs(s)) + B(xs(s))) * gs.sum : 0), 0.04);
  const laneShot = shot.id !== 'giant_sources';
  S.lanes[1].visible = laneShot && gs.anti > 0.01; S.lanes[2].visible = laneShot && gs.sum > 0.01; S.lanes[0].visible = laneShot && gs.humIn > 0.01;
  // delay bracket at a crest of the noise wave (same width D in both cases)
  const lam = kind === 'slow' ? LANE.slowL : LANE.fastL, sp = kind === 'slow' ? LANE.speed : LANE.speed * 1.6;
  let xc = lam / 4 - sp * tw - (kind === 'slow' ? SLOW_PH : 0); xc = xc - lam * Math.round((xc - (kind === 'slow' ? -0.15 : 0.0)) / lam);
  G.bracket.visible = gs.bracket > 0.01; G.bracket.position.set(xc, 0.35, 0); G.bracket.scale.set(D, gs.bracket, 1);   // crest of noise -> trough of the late anti-wave
  // takeaway sources emit slow hum into the cup; ANC flattens it near the ear
  const cupMic = G.mic.getWorldPosition(V(0, 0, 0));
  G.sources.forEach((o, i) => {
    o.visible = gs.sources[i] > 0.01; o.scale.setScalar(Math.max(0.001, gs.sources[i]));
    const r = S.srcRibs[i]; r.visible = o.visible && shot.id === 'giant_sources';
    if (r.visible) setRibbon(r, o.getWorldPosition(V(0, 0, 0)).add(V(-0.5, 0, 0.3)), cupMic.clone().add(V(0.15, -0.3 + 0.3 * i, 0.5)), UP,
      s => 0.12 * Math.sin(2 * Math.PI * (s * 2.4 - t * 0.9 + i * 0.3)) * Math.min(1, s * 6) * (1 - gs.quiet * smooth(0.55, 0.92, s)), 0.035);
  });
  // camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const giantShot = shot.id.startsWith('giant');
  const focus = giantShot ? V(...GIANT) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = giantShot ? 7 : 2.6; S.scene.fog.far = giantShot ? 20 : 8;
  // overlay anchors
  if (giantShot) {
    P.noise = project(pl(LANE.x0 + 0.55, G.lanesY[0] + 0.42)); P.anti = project(pl(LANE.x0 + 0.75, G.lanesY[1] + 0.42)); P.ear = project(pl(LANE.x0 + 0.6, G.lanesY[2] + 0.42));
    P.delay = project(pl(xc + D / 2, 0.62)); P.delayPt = project(pl(xc + D / 2, 0.45));
    P.mic = project(cupMic.clone().add(V(0.5, 0.55, 0.3))); P.micPt = project(cupMic);
    const drv = G.driver.getWorldPosition(V(0, 0, 0)); P.spk = project(drv.clone().add(V(0.2, -0.9, 0.6))); P.spkPt = project(drv);
    P.lane0 = project(pl(0.55, G.lanesY[0] + 0.42)); P.lane2 = project(pl(0.55, G.lanesY[2] - 0.38));
    ['plane', 'train', 'ac'].forEach((k, i) => { const o = G.sources[i].getWorldPosition(V(0, 0, 0)); P[k] = project(o.clone().add(V(0.85, 0.05, 0.2))); });
  }
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
