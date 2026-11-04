// Entry: the low-poly café + performer from feedback round 01, plus a portable induction plate, a steel chai pot, an
// aluminium pan, a fridge magnet, steam and the giant induction cutaway; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildInduction, buildPot, buildMagnet, buildSteam, buildGiantInduction, PAL } from './lowpoly.js';
import { makeChoreo, STOVE_POS, GIANT } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp, rng } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  const sample = 'इंडक्शन आग बर्तन तांबे कुंडली चुंबक-क्षेत्र भंवर धाराएं एल्युमिनियम शीशे चिपक जाए रिकॉल डाउनलोड करें एआई';
  await Promise.all(['600 56px "Baloo 2"', '700 38px "Baloo 2"'].map(f => document.fonts.load(f, sample)));
  await Promise.all(['600 54px Fredoka', '700 36px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')))
    .concat(['तांबे की कुंडली', 'बदलता चुंबक-क्षेत्र', 'भंवर धाराएं', 'तला गर्म', 'शीशा कम गर्म', 'एल्युमिनियम: असर कमज़ोर']);
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
  S.stove = buildInduction(scene); S.stove.group.position.set(...STOVE_POS);
  S.pot = buildPot(scene, 'steel'); S.pan = buildPot(scene, 'alu'); S.magnet = buildMagnet(scene);
  S.steam = buildSteam(scene, 60);
  const R1 = rng(17); S.steamDef = Array.from({ length: 60 }, () => ({ a: R1() * Math.PI * 2, u: R1(), ph: R1(), sp: 0.7 + 0.6 * R1(), sz: 0.6 + 0.8 * R1(), sw: R1() * 6 }));
  S.G = buildGiantInduction(scene, GIANT);
  S.bdef = Array.from({ length: 40 }, () => ({ r: Math.sqrt(R1()) * 0.8, a: R1() * Math.PI * 2, ph: R1(), sp: 0.5 + 0.6 * R1(), s: 0.03 + 0.04 * R1() }));
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const GV = v => v.clone().add(V(...GIANT));

function updateSteam(t, base, R, amount) {
  const m = new THREE.Matrix4(), sc = V(1, 1, 1), pos = V(0, 0, 0);
  S.steamDef.forEach((sd, i) => {
    const show = i / S.steamDef.length < amount;
    const age = ((t * sd.sp / 1.7 + sd.ph) % 1), r = R * Math.sqrt(sd.u) * 0.9, a = sd.a + 0.3 * age;
    pos.set(r * Math.cos(a) + 0.008 * Math.sin(sd.sw + t * 3), age * 0.16 * sd.sp, r * Math.sin(a)).add(base);
    const w = show ? (0.008 + 0.02 * age) * sd.sz * Math.sin(Math.PI * age) : 0;
    sc.set(w, w * 1.3, w); m.compose(pos, S.cam.quaternion, sc); S.steam.setMatrixAt(i, m);
  });
  S.steam.instanceMatrix.needsUpdate = true;
}

function updateGiant(t, gs) {
  const G = S.G, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1);
  G.coil.material.emissiveIntensity = 0.25 + 1.2 * gs.coilGlow + 0.25 * gs.loops * gs.pulse;
  G.loops.forEach((L, k) => {
    L.m.material.opacity = gs.loops * (0.35 + 0.55 * gs.pulse) * (1 - 0.6 * Math.max(gs.eddy, t >= 15.25 ? 0.3 : 0));
    const ar = G.arrows[k], u = 0.32, p = L.curve.getPointAt(u), tan = L.curve.getTangentAt(u).multiplyScalar(gs.flip);
    ar.position.copy(p); ar.quaternion.setFromUnitVectors(V(0, 1, 0), tan); ar.material.opacity = gs.loops * 0.95;
  });
  // vessels
  const pot = G.pot, pan = G.pan;
  pot.group.position.set(gs.potX, G.TOP + gs.potY, 0); pot.group.visible = gs.potY < 2.9 && gs.potX > -3.1;
  pan.group.position.set(gs.panX, G.TOP, 0); pan.group.visible = gs.panX < 3.9;
  const spin = t * 2.4 * gs.flip;
  pot.rings.forEach((r, i) => { r.material.opacity = gs.eddy * (0.55 + 0.4 * gs.pulse); r.rotation.z = spin * (1 + 0.3 * i); r.scale.setScalar(1 + 0.04 * Math.sin(t * 6 + i)); });
  pan.rings.forEach((r, i) => { r.material.opacity = gs.eddyAlu; r.rotation.z = spin; });
  pot.base.material.emissiveIntensity = 1.3 * gs.heat;
  pot.base.material.color.set('#B4B9BA').lerp(col('#C46A3A'), 0.5 * gs.heat);
  if (pot.liquid) pot.liquid.material.color.set('#B98250').lerp(col('#D08A4A'), 0.4 * gs.heat);
  let n = 0;
  S.bdef.forEach(b => {
    const age = (t * b.sp + b.ph) % 1, show = gs.bubbles > 0.01 && pot.group.visible;
    const p = V(gs.potX + b.r * pot.R * Math.cos(b.a), G.TOP + 0.1 + age * pot.H * 0.52, b.r * pot.R * Math.sin(b.a));
    const s = show ? b.s * gs.bubbles * (0.6 + 0.4 * age) : 0;
    m.compose(p, q, sc.set(s, s, s)); G.bubbles.setMatrixAt(n++, m);
  });
  G.bubbles.instanceMatrix.needsUpdate = true;
}

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), p = ch.props(t);
  // stove + vessels + magnet
  S.stove.leds.forEach((l, i) => l.material.color.set(i < p.leds ? PAL.lime : '#3A3A36'));
  S.pot.group.position.copy(p.pot); S.pan.group.position.copy(p.pan);
  S.magnet.position.copy(p.magnet); S.magnet.rotation.set(-p.magnetTilt, 0, 0);
  updateSteam(t, p.pot.clone().add(V(0, S.pot.H * 0.64, 0)), S.pot.R, p.potSteam);
  // performer (+ chai cup sip at the end)
  const cupTarget = tt => {
    const k = seg(tt, S.choreo.cues.sip - 0.4, S.choreo.cues.sip, E.io) * (1 - seg(tt, S.choreo.cues.sip + 1.0, S.choreo.cues.sip + 1.4, E.io));
    return V(-0.24, 1.0, -0.14).lerp(V(-0.03, 1.5, -0.38), k);
  };
  const q = ch.person(t, { cupTarget });
  S.person.apply(q);
  if (p.cupInHand) S.cafe.coffee.position.copy(S.person.arms[0].hand.localToWorld(V(0, -0.06, 0.03))).add(V(0, -0.05, 0));
  else S.cafe.coffee.position.set(-0.26, 0.95, -0.12);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // giant
  const gs = ch.giant(t); updateGiant(t, gs);
  // camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const giantShot = shot.id.startsWith('giant');
  const focus = giantShot ? V(...GIANT) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = giantShot ? 7 : 2.6; S.scene.fog.far = giantShot ? 20 : 8;
  // overlay anchors
  const P = {};
  if (giantShot) {
    const G = S.G;
    P.coilPt = project(GV(V(0.95, 0.64, 0.25))); P.coil = project(GV(V(1.35, 0.25, 1.0)));
    const lp = G.loops[2].curve.getPointAt(0.5); P.fieldPt = project(GV(lp)); P.field = project(GV(lp.clone().add(V(0.4, 0.5, 0.3))));
    P.eddyPt = project(GV(V(0.55 * G.pot.R, G.TOP + 0.1, 0.2))); P.eddy = project(GV(V(-0.9, G.TOP + 0.9, 0.6)));
    P.basePt = project(GV(V(-0.6, G.TOP + 0.05, 0.6))); P.base = project(GV(V(-1.1, G.TOP + 0.75, 0.9)));
    P.glassPt = project(GV(V(1.3, G.TOP, 1.05))); P.glass = project(GV(V(1.1, G.TOP - 0.45, 1.4)));
    P.aluPt = project(GV(V(gs.panX + 0.5, G.TOP + 0.1, 0.4))); P.alu = project(GV(V(gs.panX, G.TOP + 1.1, 0.6)));
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
