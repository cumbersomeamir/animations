// Entry: the low-poly café + performer from feedback round 01, the round-02 counter microwave, a plate of food, a test
// dish and a glass measuring cup, a "thermal camera" view (second, scissored render pass with false-colour materials) and
// the giant heat set; renders any frame deterministically. Frames are written from an explicit composite of the 3D and
// overlay canvases (english-09 fix).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildMicrowave, buildSteam, buildPlate, buildCup, buildRibbon, setRibbon, buildGiantHeat, GS, PAL } from './lowpoly.js';
import { makeChoreo, GIANT, PLATE_POS, MW_POS, MW_ROT, RIM_R, RIM_L } from './choreo.js';
import { drawDisplay } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

// thermal palette: T 0 (cold) … 1 (hot)
const TSTOPS = [[0, '#0B0F3A'], [0.2, '#2433A8'], [0.4, '#8E2BB0'], [0.6, '#E2463C'], [0.8, '#FFA62B'], [1.0, '#FFF6C8']];
export function tcol(T) {
  T = clamp(T); for (let i = 1; i < TSTOPS.length; i++) if (T <= TSTOPS[i][0]) {
    const [a, ca] = TSTOPS[i - 1], [b, cb] = TSTOPS[i]; return col(ca).lerp(col(cb), (T - a) / (b - a));
  }
  return col(TSTOPS[TSTOPS.length - 1][1]);
}
const tmat = (T, extra = {}) => new THREE.MeshBasicMaterial({ color: tcol(T), toneMapped: false, ...extra });

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
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  S.mw = buildMicrowave(scene); S.mw.group.position.set(...MW_POS); S.mw.group.rotation.y = MW_ROT; S.mw.group.updateMatrixWorld(true);
  S.plate = buildPlate(scene, { food: true });
  S.dish = buildPlate(scene, { food: false, R: 0.092 }); S.cup = buildCup(scene);
  S.steam = buildSteam(scene, 40);
  S.G = buildGiantHeat(scene, GIANT);
  S.rib = { food: [0, 1, 2, 3].map(() => buildRibbon(scene, PAL.lime, 140)), pass: [0, 1].map(() => buildRibbon(scene, PAL.lime, 140)), pot: [0, 1, 2, 3].map(() => buildRibbon(scene, PAL.lime, 140)) };
  S.arrows = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), new THREE.MeshBasicMaterial({ color: '#F07828', toneMapped: false, transparent: true, depthTest: false })); m.rotation.x = Math.PI; m.renderOrder = 8; scene.add(m); return m; });
  setupThermal(scene);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

// ---------------------------------------------------------------- thermal materials (assigned once; swapped in per pass)
function setupThermal(scene) {
  const personSet = new Set(); S.person.root.traverse(o => o.isMesh && personSet.add(o));
  const plateSet = new Set(); S.plate.group.traverse(o => o.isMesh && plateSet.add(o));
  // food plate: warm under the food (heat conducted from it), cool toward the rim (lathe v: 0 centre → ~0.55 rim → 1 centre)
  const pc = document.createElement('canvas'); pc.width = 4; pc.height = 256; const px = pc.getContext('2d');
  const gr = px.createLinearGradient(0, 0, 0, 256);
  for (const [v, T] of [[0, 0.5], [0.2, 0.42], [0.38, 0.22], [0.5, 0.12], [0.62, 0.12], [0.78, 0.3], [0.9, 0.46], [1, 0.52]]) gr.addColorStop(v, '#' + tcol(T).getHexString());
  px.fillStyle = gr; px.fillRect(0, 0, 4, 256);
  const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; ptex.flipY = false;
  const steamT = new THREE.MeshBasicMaterial({ map: S.steam.material.map, color: tcol(0.72), transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  scene.traverse(o => {
    if (!o.isMesh) return;
    const m = o.material, c = m.color ? m.color.clone() : col('#888888'), lum = 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
    let T = 0.07 + 0.12 * lum, extra = {};
    if (personSet.has(o)) {
      const h = '#' + c.getHexString();
      T = h === '#a8714e' ? 0.64 : (h === '#d8c3a0' ? 0.4 : (h === '#2a1e17' || h === '#1d1a17' ? 0.5 : 0.56));
    }
    if (m.transparent) extra = { transparent: true, opacity: Math.min(0.9, m.opacity + 0.1), depthWrite: false };
    if (m.blending === THREE.AdditiveBlending) extra = { transparent: true, opacity: 0 };
    o.userData.thermal = tmat(T, extra);
  });
  S.plate.plate.userData.thermal = new THREE.MeshBasicMaterial({ map: ptex, toneMapped: false });
  S.plate.band.userData.thermal = tmat(0.13);
  S.plate.food.forEach((f, i) => { f.userData.thermal = tmat(i === 0 ? 0.97 : 0.84 + 0.1 * (i % 3) / 2); });
  S.dish.plate.userData.thermal = tmat(0.24); S.dish.band.userData.thermal = tmat(0.2);
  S.mw.group.traverse(o => { if (o.isMesh && o !== S.mw.plate) o.userData.thermal = tmat(0.05); });
  S.cup.water.userData.thermal = tmat(0.9); S.cup.glass.userData.thermal = tmat(0.62, { transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide });
  S.steam.userData.thermal = steamT;
}
function swapThermal(on) {
  S.scene.traverse(o => {
    if (!o.isMesh || !o.userData.thermal) return;
    if (on) { o.userData.mat = o.material; o.material = o.userData.thermal; } else if (o.userData.mat) { o.material = o.userData.mat; o.userData.mat = null; }
  });
}

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const wave = (amp, k, sp, t, env = () => 1) => s => amp * env(s) * Math.sin(2 * Math.PI * (s * k - t * sp));
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), zAxis = V(0, 0, 1);

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant'), testShot = shot.id.startsWith('test');
  // ---------------- plate of food, then the performer's hands on its rim
  const pl = ch.plate(t);
  S.plate.group.position.copy(pl.pos); S.plate.group.rotation.set(pl.tilt, 0, 0); S.plate.group.updateMatrixWorld(true);
  const q = ch.person(t);
  const restR = V(0.3, 1.0, -0.44), restL = V(-0.3, 1.0, -0.44);   // resting at the sides, out of the hook's close-up
  const rimR = S.plate.group.localToWorld(V(...RIM_R)).add(V(0, 0.012, 0)), rimL = S.plate.group.localToWorld(V(...RIM_L)).add(V(0, 0.012, 0));
  q.handR = restR.clone().lerp(rimR, q.grab); q.handL = restL.clone().lerp(rimL, q.grab);
  S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // ---------------- microwave + the test dish and cup inside it
  const mw = S.mw, mi = ch.micro(t);
  mw.door.rotation.y = -1.75 * mi.door; mw.lamp.material.color.set(mi.lamp ? '#FFE3A8' : '#7A7468'); mw.plate.rotation.y = mi.turn;
  drawDisplay(mw, { text: mi.text });
  const turn = new THREE.Matrix4().makeRotationY(mi.turn);
  const inMw = (x, z) => mw.group.localToWorld(mw.cav.clone().add(V(x, 0, z).applyMatrix4(turn)));
  S.dish.group.position.copy(inMw(-0.06, 0.03)); S.dish.group.rotation.set(0, MW_ROT + mi.turn, 0);
  S.cup.group.position.copy(inMw(0.085, -0.06)); S.cup.group.rotation.set(0, MW_ROT + mi.turn + 2.4, 0);
  // ---------------- giant set
  const G = S.G, gs = ch.giant(t), org = V(...GIANT), P = {};
  G.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, S.plate.group, mw.group, S.dish.group, S.cup.group]) o.visible = !giantShot;
  for (const k in S.rib) S.rib[k].forEach(r => { r.visible = false; });
  S.arrows.forEach(a => { a.visible = false; });
  if (giantShot) {
    const F = org.clone().add(V(...GS.F)), M = org.clone().add(V(...GS.M));
    G.F.visible = shot.id !== 'giant_pottery'; G.M.visible = shot.id === 'giant_pottery';
    // water molecules: random orientations, then tugged back and forth by the field (slowed down enormously)
    const amp = 0.95 * gs.tug;
    G.mols.forEach((mo, k) => {
      const th = mo.a0 + amp * Math.sin(2 * Math.PI * 1.7 * t + mo.ph) + (gs.tug > 0 ? 0 : 0.15 * Math.sin(0.7 * t + k));
      const jit = 0.012 * gs.heat * Math.sin(17 * t + k * 3.1);
      const o = V(mo.x + jit, mo.y + jit * 0.7, G.faceZ);
      m4.makeTranslation(o.x, o.y, o.z); G.molO.setMatrixAt(k, m4);
      for (const [j, sx] of [[0, -1], [1, 1]]) {
        const a = th + sx * 0.91, h = V(o.x + 0.085 * Math.sin(a), o.y + 0.085 * Math.cos(a), o.z + 0.01);
        m4.makeTranslation(h.x, h.y, h.z); G.molH.setMatrixAt(k * 2 + j, m4);
      }
    });
    G.molO.instanceMatrix.needsUpdate = true; G.molH.instanceMatrix.needsUpdate = true;
    G.molO.material.emissive.set('#FF6A1A'); G.molO.material.emissiveIntensity = 0.5 * gs.heat;
    G.foodM.emissiveIntensity = 0.55 * gs.heat;
    G.toppings.forEach(m => { m.position.y += 0; });
    // conduction: heat glow spreads from under the food into the plate; arrows point from the food into the plate
    G.plateHeat.children.forEach(b => { b.material.opacity = 0.32 * gs.conduct; }); G.plateHeat.scale.x = 1.0 + 1.9 * gs.conduct;
    if (shot.id === 'giant_plate' && gs.conduct > 0.01) S.arrows.forEach((a, k) => {
      a.visible = true; const ph = (t * 0.8 + k / 3) % 1;
      a.position.copy(F.clone().add(V(-0.6 + 0.6 * k, G.PY + G.PH + 0.32 - 0.3 * ph, G.faceZ + 0.08))); a.material.opacity = gs.conduct * Math.sin(Math.PI * ph);
    });
    // microwaves: into the food (absorbed: the wave fades inside), and through the plate's rim (passes)
    if (shot.id !== 'giant_pottery') {
      S.rib.food.forEach((r, k) => {
        const x = -0.75 + 0.5 * k, top = F.clone().add(V(x + 0.25, 3.5, 0.45)), end = F.clone().add(V(x, G.PY + G.PH + 0.3, 0.45));
        r.visible = gs.waves > 0.01; if (r.visible) setRibbon(r, top, top.clone().lerp(end, gs.waves), V(1, 0, 0), wave(0.09, 5.0 * gs.waves + 0.01, 1.4, t + k * 0.2, s => 1 - 0.85 * clamp((s - 0.72) / 0.28)), 0.045);
      });
      S.rib.pass.forEach((r, k) => {
        const x = 1.62 + 0.22 * k, top = F.clone().add(V(x - 0.2, 3.5, 0.2)), end = F.clone().add(V(x + 0.12, G.PY - 0.05, 0.2));
        r.visible = gs.pass > 0.01; if (r.visible) setRibbon(r, top, top.clone().lerp(end, gs.pass), V(1, 0, 0), wave(0.09, 5.5 * gs.pass + 0.01, 1.4, t + k * 0.3), 0.045);
      });
    } else {
      // pottery: water soaks into the pores, then the waves make it jostle and the clay and glaze glow
      const wd = G.waterDots, cHot = col('#FF8A2A'), cWater = col('#5FA8D8');
      G.pores.forEach(([x, y], k) => {
        const d = clamp((gs.soak * 1.4 - (k / G.pores.length) * 0.4) / 1.0);
        const inner = y > G.MY + 0.36 ? V(Math.sign(x) * 0.76, y, 0.02) : V(x, G.MY + 0.0, 0.02);   // through the crazed inner glaze, or up through the bare foot ring
        const p = inner.lerp(V(x, y, 0.02), E.out(d));
        const j = 0.012 * gs.potWaves * Math.sin(19 * t + k * 2.7);
        const sc = d > 0.02 ? 0.4 + 0.6 * E.out(d) : 0.0001;
        m4.compose(p.add(V(j, j * 0.6, 0)), q4.identity(), s4.set(sc, sc, sc)); wd.setMatrixAt(k, m4);   // local to the mug group
        wd.setColorAt(k, cWater.clone().lerp(cHot, gs.potGlow));
      });
      wd.instanceMatrix.needsUpdate = true; wd.instanceColor.needsUpdate = true;
      G.puddle.material.opacity = 0.75 * (1 - 0.6 * gs.soak);
      G.clayM.emissiveIntensity = 0.3 * gs.potGlow; G.glazeM.emissiveIntensity = 0.45 * gs.potGlow;
      S.rib.pot.forEach((r, k) => {
        const x = [-0.95, -0.8, 0.8, 0.95][k], top = M.clone().add(V(x * 1.25, 3.6, 0.25)), end = M.clone().add(V(x, G.MY + 1.0 - 0.3 * (k % 2), 0.25));
        r.visible = gs.potWaves > 0.01; if (r.visible) setRibbon(r, top, top.clone().lerp(end, gs.potWaves), V(1, 0, 0), wave(0.08, 5.0 * gs.potWaves + 0.01, 1.4, t + k * 0.25, s => 1 - 0.8 * clamp((s - 0.8) / 0.2)), 0.04);
      });
    }
  }
  // ---------------- camera + key light
  const mwLocal = (x, y, z) => mw.group.localToWorld(V(x, y, z));
  const cam = ch.camera(t, { head, mwLocal });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  // steam above the food (real shots)
  const cupSteam = shot.id === 'test_out' && t > C.doorOpen;   // the water is hot after its minute: it steams
  const steamOn = (!giantShot && !testShot) || cupSteam;
  S.steam.visible = steamOn;
  if (steamOn) {
    for (let i = 0; i < S.steam.count; i++) {
      const ph = (t * 0.45 + i * 0.137) % 1, a = i * 2.4, r = 0.035 * ((i * 0.618) % 1);
      const base = cupSteam ? S.cup.group.localToWorld(V(0.7 * r * Math.cos(a), 0.085, 0.7 * r * Math.sin(a))) : S.plate.group.localToWorld(V(r * Math.cos(a), 0.04, r * Math.sin(a)));
      const pos = base.add(V(0.012 * Math.sin(t * 1.3 + i), 0.02 + ph * 0.16, 0.01 * Math.cos(t + i)));
      const w = 0.012 + 0.02 * ph, op = Math.sin(Math.PI * ph);
      s4.set(w * op, w * 1.3 * op, w); m4.compose(pos, S.cam.quaternion, s4); S.steam.setMatrixAt(i, m4);
    }
    S.steam.instanceMatrix.needsUpdate = true;
  }
  // ---------------- overlay anchors
  const at = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (shot.id === 'hook_thermal') {
    at('hot', S.plate.group.localToWorld(V(-0.02, 0.04, 0.02)), S.plate.group.localToWorld(V(-0.07, 0.0, 0.17)));
    at('cool', S.plate.group.localToWorld(V(0.06, 0.024, 0.1)), S.plate.group.localToWorld(V(0.09, 0.0, 0.26)));
  } else if (giantShot) {
    const F = org.clone().add(V(...GS.F)), M = org.clone().add(V(...GS.M));
    if (shot.id === 'giant_food') {
      at('wave', F.clone().add(V(0.5, 2.6, 0.45)), F.clone().add(V(1.2, 3.0, 0.5)));
      at('mol', F.clone().add(V(G.mols[3].x, G.mols[3].y, G.faceZ)), F.clone().add(V(-0.6, 0.35, 1.4)));
      at('diel', F.clone().add(V(0.3, 1.5, G.faceZ)), F.clone().add(V(0.6, 0.15, 1.6)));
    } else if (shot.id === 'giant_plate') {
      at('pass', F.clone().add(V(1.78, G.PY + 0.35, 0.3)), F.clone().add(V(1.45, 2.4, 0.6)));
      at('cond', F.clone().add(V(0.0, G.PY + G.PH * 0.5, G.faceZ)), F.clone().add(V(-0.5, 0.0, 1.9)));
      at('rim', F.clone().add(V(1.85, G.PY + 0.42, 0.5)), F.clone().add(V(1.6, 0.35, 1.7)));
    } else {
      at('soak', M.clone().add(V(0.86, G.MY + 0.9, 0.02)), M.clone().add(V(0.4, 3.1, 0.5)));
      at('iron', M.clone().add(V(-0.99, G.MY + 1.2, 0.0)), M.clone().add(V(-0.6, 0.2, 1.6)));
      at('self', M.clone().add(V(0.0, G.MY + 0.2, 0.02)), M.clone().add(V(0.5, -0.4, 1.6)));
    }
  } else if (testShot) {
    at('dish', S.dish.group.localToWorld(V(0, 0.015, 0)), S.dish.group.localToWorld(V(-0.05, -0.12, 0.25)));
    at('cup', S.cup.group.localToWorld(V(0, 0.1, 0)), S.cup.group.localToWorld(V(0.05, 0.3, 0.1)));
    at('min', mw.disp.getWorldPosition(V(0, 0, 0)), mw.group.localToWorld(V(0.15, 0.42, 0.3)));
  }
  const focus = giantShot ? org.clone().add(V(0, 1.0, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-3.0, 6.0, 3.6) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.6 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 2.6; S.scene.fog.far = giantShot ? 30 : 8;
  const safe = { shot: shot.id };
  if (shot.id === 'react' || shot.id === 'cafe_wide') safe.head = project(head).y;
  return { t, shot, P, safe, therm: ch.thermal(t, shot.id) };
}

function renderThermal(w) {
  const R = S.R, h = Math.round(S.H * w);
  if (h <= 0) return;
  const bg = S.scene.background, fog = S.scene.fog;
  swapThermal(true); S.scene.background = tcol(0.04); S.scene.fog = null; R.shadowMap.autoUpdate = false;
  R.setScissorTest(true); R.setScissor(0, S.H - h, S.W, h); R.setViewport(0, 0, S.W, S.H);
  R.render(S.scene, S.cam);
  R.setScissorTest(false); R.shadowMap.autoUpdate = true;
  S.scene.background = bg; S.scene.fog = fog; swapThermal(false);
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe, therm } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  if (therm > 0) renderThermal(therm);
  const o = S.choreo.overlay(t, shot.id); o.thermal = therm;
  const boxes = drawOverlay(S.octx, S.W, S.H, t, o, P, S.d.timeline, S.icon, S.capCache, shot.id);
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
