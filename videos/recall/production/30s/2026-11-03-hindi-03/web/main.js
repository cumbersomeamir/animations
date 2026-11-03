// Entry: the low-poly café + performer + lime phone from feedback round 01, plus an iced glass, napkin, screen drops,
// a real-scale index finger and the giant touchscreen cross-section; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildGlass, buildNapkin, buildDrops, buildFinger, buildGiantScreen, PAL } from './lowpoly.js';
import { drawScreen, SCREEN_DROPS, SW, SH } from './screen.js';
import { makeChoreo, PHONE_POS, GLASS_POS, NAPKIN_POS, GIANT } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  const sample = 'गीली उंगलियों से स्क्रीन क्षेत्र स्पर्श फ़ोन रिकॉल डाउनलोड करें एआई सूखी विद्युत इलेक्ट्रोड';
  await Promise.all(['600 56px "Baloo 2"', '700 38px "Baloo 2"', '700 46px "Baloo 2"'].map(f => document.fonts.load(f, sample)));
  await Promise.all(['600 54px Fredoka', '700 36px Fredoka'].map(f => document.fonts.load(f)));
  // every caption/label string must be covered by the loaded Devanagari face (no tofu squares)
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')))
    .concat(['शीशा', 'इलेक्ट्रोड का जाल', 'विद्युत क्षेत्र', 'क्षेत्र बदला', 'यहां टच', 'नकली टच', 'असली टच गुम', 'एक साफ़ टच', 'स्केच']);
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
  S.cafe = buildCafe(scene); S.person = buildPerson(scene); S.phone = buildPhone(scene);
  S.cafe.coffee.position.set(0.62, 0.95, -0.1);
  // phone lies flat on the counter, screen up, top edge away from the performer; its gripping fingertips are not used
  S.phone.group.children.forEach(m => { if (m.material && m.material.color && m.material.color.getHexString() === 'a8714e') m.visible = false; });
  S.phone.group.position.set(...PHONE_POS);
  S.phone.group.quaternion.setFromAxisAngle(V(0, 1, 1).normalize(), Math.PI);
  S.phone.group.position.y += 0.0045; S.phone.group.updateMatrixWorld(true);
  S.glass = buildGlass(scene); S.glass.group.position.set(...GLASS_POS);
  S.napkin = buildNapkin(scene); S.napkin.position.set(...NAPKIN_POS);
  S.sdrops = buildDrops(scene, SCREEN_DROPS.length);
  S.finger = buildFinger(scene);
  S.G = buildGiantScreen(scene, GIANT);
  const c3 = new THREE.Color(PAL.lime);
  for (let i = 0; i < S.G.NX * S.G.NZ; i++) S.G.sig.setColorAt(i, c3);
  S.G.sig.instanceColor.needsUpdate = true;
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const GV = v => v.clone().add(V(...GIANT));
/** Phone screen UV -> world point on the glass. */
function uvToWorld(u, v, lift = 0.0006) {
  return S.phone.group.localToWorld(V((u - 0.5) * 0.066, (0.5 - v) * 0.1393, 0.0058 + lift));
}

function updateGiant(t, gs) {
  const G = S.G, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1);
  const PF = G.cross(5, 3), DROPS = [G.cross(1, 1), G.cross(2, 4), G.cross(6, 0)], FILMC = PF.clone().lerp(G.cross(3, 4), 0.45);
  // electrodes glow while introduced; the touched row/column light up when the location is found
  G.rows.forEach((r, j) => { r.material.emissiveIntensity = 0.25 + 0.9 * gs.gridGlow + (j === 3 ? 1.4 * gs.locate : 0); });
  G.cols.forEach((c, i) => { c.material.emissiveIntensity = 0.25 + 0.9 * gs.gridGlow + (i === 5 ? 1.4 * gs.locate : 0); });
  // per-crossing influence of finger, drops and film
  const clothX = gs.cloth >= 0 ? -2.6 + 5.4 * gs.cloth + 0.65 : (t >= 21.2 ? 99 : -99);   // leading edge of the cloth
  const gone = X => (t >= 21.2 && X.x < clothX ? 1 : 0);
  const filmR = 1.05 * gs.film * (1 - gone(FILMC));
  const dropK = [0, 1, 2].map(k => gs.drops * (1 - gone(DROPS[k])) * clamp(gs.dropT[k] / 0.35));
  let n = 0;
  for (let j = 0; j < G.NZ; j++) for (let i = 0; i < G.NX; i++) {
    const X = G.cross(i, j), k = j * G.NX + i;
    const fI = gs.press * Math.exp(-((X.distanceTo(PF) / 0.3) ** 2));
    let dI = 0; DROPS.forEach((D, a) => { dI = Math.max(dI, 0.7 * dropK[a] * gs.dropChange * Math.exp(-((X.distanceTo(D) / 0.24) ** 2))); });
    const filmI = X.distanceTo(FILMC) < filmR ? 0.6 : 0;
    const infl = clamp(fI + dI + filmI);
    const s = gs.arcs * (1 - 0.72 * infl);
    m.compose(X.clone().add(V(0, -0.075, 0)), q.setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)), sc.set(s, s * (1 - 0.3 * infl), s)); G.arcs.setMatrixAt(n++, m);
    // signal disc under the glass: the change the controller measures
    const sig = clamp(gs.signal * fI * (filmI > 0 ? 0.5 : 1) + dI * (gs.dropChange) + filmI * gs.film);
    const r = sig > 0.03 ? 0.05 + 0.1 * sig : 0;
    m.compose(X.clone().add(V(0, -0.115, 0)), new THREE.Quaternion(), sc.set(r, 0.012, r)); G.sig.setMatrixAt(k, m);
  }
  for (; n < G.NX * G.NZ * 2; n++) { m.makeScale(0, 0, 0); G.arcs.setMatrixAt(n, m); }
  G.arcs.instanceMatrix.needsUpdate = true; G.sig.instanceMatrix.needsUpdate = true;
  // location ring (lime) and fake-touch rings (coral)
  G.ring.position.copy(PF).add(V(0, 0.012, 0)); G.ring.material.opacity = gs.locate; const rs = 0.8 + 0.4 * gs.locate; G.ring.scale.set(rs, rs, rs);
  G.ghosts.forEach((gr, a) => { gr.position.copy(DROPS[a]).add(V(0, 0.012, 0)); gr.material.opacity = gs.fake * (1 - gone(DROPS[a])) * (0.6 + 0.4 * Math.abs(Math.sin(t * 9 + a))); });
  // drops: fall, splat, then wiped away
  DROPS.forEach((D, a) => {
    const tt = gs.dropT[a], vis = gs.drops * (1 - gone(D)) > 0.01 && tt > -0.6;
    let p = D.clone(), sx = 0.17, sy = 0.15;
    if (tt < 0) { p.y = G.TOP + 0.03 + (-tt) * (-tt) * 4.2; sx = 0.12; sy = 0.17; }
    else { const k = clamp(tt / 0.25); sy = 0.16 - 0.06 * E.out(k); sx = 0.17 + 0.05 * E.out(k); p.y = G.TOP; }
    m.compose(p, new THREE.Quaternion(), vis ? sc.set(sx, sy, sx) : sc.set(0, 0, 0)); G.drops.setMatrixAt(a, m);
  });
  G.drops.instanceMatrix.needsUpdate = true;
  G.film.visible = filmR > 0.02; G.film.position.copy(FILMC).add(V(0, 0.004, 0)); G.film.scale.set(filmR, filmR, 1);
  // cloth sweep (takeaway)
  G.cloth.visible = gs.cloth >= 0; if (gs.cloth >= 0) { G.cloth.position.set(-2.6 + 5.4 * gs.cloth, G.TOP + 0.05 + 0.06 * Math.sin(gs.cloth * Math.PI), 0.1); G.cloth.rotation.set(0.04, 0.15 * Math.sin(gs.cloth * 6), 0); }
  // giant finger: tip at PF (+ lift), leaning back toward the viewer's upper right
  G.finger.visible = !!gs.finger;
  G.finger.position.copy(PF).add(V(0, gs.fingerY, 0)); G.finger.quaternion.setFromUnitVectors(V(0, 1, 0), V(0.32, 1, -0.3).normalize());
  return { PF, DROPS };
}

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), p = ch.props(t);
  drawScreen(S.phone, { ...p.screen });
  // screen drops (wiped away by the napkin)
  const m = new THREE.Matrix4(), sc = V(1, 1, 1), qUp = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(0, 1, 0));
  SCREEN_DROPS.forEach(([u, v, s], i) => {
    const w = p.dropVis[i] ? 0.0034 * s : 0;
    m.compose(uvToWorld(u, v, 0), qUp, sc.set(w, w * 0.75, w)); S.sdrops.setMatrixAt(i, m);
  });
  S.sdrops.instanceMatrix.needsUpdate = true;
  // finger: on the screen when drawing/tapping, otherwise follows the hand
  const FD = V(0.15, 0.42, -0.9).normalize();
  let tip = null;
  if (p.finger) tip = uvToWorld(p.finger.uv[0], p.finger.uv[1], 0.0002 + 0.012 * (1 - p.finger.down));
  // napkin: wipes across the screen, then the fingertip is dabbed on it
  const nap = S.napkin;
  const beside = uvToWorld(-0.85, 0.55, -0.0045 - 0.0058);
  if (p.napkinOnScreen > 0.01 && t < S.choreo.cues.wipe + 0.65) {
    const pos = uvToWorld(0.12 + 0.76 * p.wipeU, 0.5 + 0.12 * Math.sin(p.wipeU * Math.PI * 3), 0.004);
    nap.position.copy(V(...NAPKIN_POS).lerp(pos, E.io(p.napkinOnScreen))); nap.rotation.set(0, 0.3 * Math.sin(p.wipeU * 5), 0);
  } else if (t >= S.choreo.cues.wipe + 0.65 && t < 25.8) {
    const k = seg(t, S.choreo.cues.wipe + 0.65, S.choreo.cues.dryFingers - 0.05);
    nap.position.copy(uvToWorld(0.88, 0.5, 0.004).lerp(beside, E.io(k))); nap.rotation.set(0, 0.2, 0);
  } else nap.position.set(...NAPKIN_POS);
  if (p.dab > 0.01) tip = nap.position.clone().add(V(0.01, 0.004 + 0.02 * (1 - p.dab), 0));
  // performer
  const q = ch.person(t);
  const gl = S.glass;
  gl.group.position.set(GLASS_POS[0], GLASS_POS[1] + p.glassLift, GLASS_POS[2]);
  if (tip) q.handR = tip.clone().add(FD.clone().multiplyScalar(0.14));
  else if (t < 0.95) q.handR = gl.group.position.clone().add(V(0.01, 0.085, -0.075));
  else if (p.napkinOnScreen > 0.01) q.handR = nap.position.clone().add(V(0.02, 0.05, -0.04));
  else q.handR = V(0.2, 1.02, -0.3);
  q.handL = t >= 0.95 && t < 25.8 ? uvToWorld(-0.15, 0.75, 0.01).add(V(-0.02, 0.03, -0.02)) : V(-0.22, 0.985, -0.32);
  S.person.apply(q);
  // real finger mesh from the palm toward the tip
  const wrist = S.person.arms[1].hand.getWorldPosition(V(0, 0, 0));
  const ftip = tip || wrist.clone().add(FD.clone().multiplyScalar(-0.14));
  S.finger.position.copy(ftip); S.finger.quaternion.setFromUnitVectors(V(0, 1, 0), wrist.clone().sub(ftip).normalize());
  S.finger.visible = t >= 0.95;
  // condensation drops slide down the glass
  gl.dd.forEach((dd, i) => {
    const y = ((dd.y0 - dd.sp * t) % 0.09 + 0.09) % 0.09 + 0.012, r = gl.R * (0.86 + 0.14 * (y / gl.H)) + 0.0004;
    m.compose(V(r * Math.cos(dd.a), y, r * Math.sin(dd.a)), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(Math.cos(dd.a), 0, Math.sin(dd.a))), sc.set(dd.s, dd.s * 0.7, dd.s));
    gl.drops.setMatrixAt(i, m);
  });
  gl.drops.instanceMatrix.needsUpdate = true;
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // giant
  const gs = ch.giant(t), GG = updateGiant(t, gs);
  // camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.copy(cam.up); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const giantShot = shot.id.startsWith('giant');
  const focus = giantShot ? V(...GIANT) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = giantShot ? 7 : 2.6; S.scene.fog.far = giantShot ? 20 : 8;
  // overlay anchors
  const P = {};
  if (giantShot) {
    const G = S.G, PF = GV(GG.PF), D1 = GV(GG.DROPS[0]);
    P.glassPt = project(GV(V(-1.2, G.TOP, 1.2))); P.glass = project(GV(V(-1.0, G.TOP + 0.65, 1.3)));
    P.gridPt = project(GV(V(0.2, 0.8, 1.15))); P.grid = project(GV(V(0.7, 0.3, 1.6)));
    const A = GV(G.cross(2, 3)).add(V(0, 0.05, 0)); P.fieldPt = project(A); P.field = project(A.clone().add(V(0.3, 0.65, 0.1)));
    P.changePt = project(PF.clone().add(V(0, 0.04, 0))); P.change = project(PF.clone().add(V(-0.75, 0.55, 0.25)));
    P.locPt = project(PF); P.loc = project(PF.clone().add(V(0.55, 0.35, 0.35)));
    P.ghostPt = project(D1); P.ghost = project(D1.clone().add(V(-0.15, 0.55, 0.35)));
    P.lostPt = project(PF); P.lost = project(PF.clone().add(V(0.35, 0.65, 0.45)));
    P.cleanPt = project(PF); P.clean = project(PF.clone().add(V(0.5, 0.5, 0.35)));
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
