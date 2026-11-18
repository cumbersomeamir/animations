// Entry: the low-poly café + performer from feedback round 01 with a small frying pan on a hotplate, and a giant pan cross-section
// where a water drop either spreads and sizzles away (warm pan) or hovers on a steam cushion with vapour streaming out from under it
// (very hot pan), the cushion holding it up and slowing the heat, and the drop skating. Frame 0 = the thumbnail composition (the
// hovering drop + title). Renders any frame deterministically, plus the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall
// pill). Frames are written from an explicit composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildGiantPan, buildCafePan, PAN, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, PAN_POS } from './choreo.js';
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
  S.rim = new THREE.PointLight('#FFF1D6', 1.0, 1.0, 1.5); S.rim.position.set(PAN_POS[0] - 0.12, PAN_POS[1] + 0.3, PAN_POS[2] + 0.1); scene.add(S.rim);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.Cp = buildCafePan(scene); S.Cp.group.position.set(...PAN_POS);
  S.Gp = buildGiantPan(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

const GIANT_SHOTS = ['hook_drop', 'giant_warm', 'giant_hot', 'cushion_lift', 'cushion_heat', 'giant_skate'];
const CLOSE = ['proof_pan', 'test_sizzle', 'test_skate'];
const rnd = (i, k) => { const x = Math.sin(i * 91.7 + k * 47.3) * 24634.6345; return x - Math.floor(x); };

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = GIANT_SHOTS.includes(id) ? 'giant' : 'cafe', close = CLOSE.includes(id);
  const cam = ch.camera(t), P = {};
  // ---------------- café: performer, hotplate pan, drops
  const q = ch.person(t); q.pos = ROOT; q.handR = ch.handR(t); q.handL = V(-0.22, 1.0, -0.34);
  S.person.apply(q);
  S.cafe.group.visible = S.Cp.group.visible = S.person.root.visible = set === 'cafe';
  S.Gp.group.visible = set === 'giant';
  if (set === 'cafe') {
    const hot = id !== 'test_sizzle';
    S.Cp.ringM.color.copy(col('#5A2A1A').lerp(col('#FF5A2A'), hot ? 1 : 0.45));
    const pp = V(...PAN_POS); let np = 0;
    for (let i = 0; i < 10; i++) {
      const d = i < 8 ? ch.cafeDrop(i, t) : null;
      if (!d) { S.Cp.drops.setMatrixAt(i, ZERO); continue; }
      m4.compose(d.pos.clone().sub(pp), q4.identity(), s4.set(...d.s)); S.Cp.drops.setMatrixAt(i, m4);
      for (let k = 0; k < 2 && d.puff > 0.01 && np < 20; k++) {
        const u = frac(t * 1.3 + k * 0.5 + i * 0.17), sc = (0.02 + 0.05 * u) * d.puff * (1 - u);
        m4.compose(d.pos.clone().sub(pp).add(V(0.004 * Math.sin(i + 6 * u), 0.01 + u * 0.07, 0)), q4.identity(), s4.setScalar(sc)); S.Cp.puffs.setMatrixAt(np++, m4);
      }
    }
    for (; np < 20; np++) S.Cp.puffs.setMatrixAt(np, ZERO);
    S.Cp.drops.instanceMatrix.needsUpdate = true; S.Cp.puffs.instanceMatrix.needsUpdate = true;
  }
  // ---------------- giant pan section
  if (set === 'giant') {
    const Gp = S.Gp, st = ch.giant(t, id), top = PAN.top, R = PAN.R;
    Gp.drop.visible = st.s[1] > 0.01; Gp.drop.position.copy(st.pos); Gp.drop.scale.set(...st.s.map(v => Math.max(v, 0.001)));
    Gp.coilM.color.copy(col('#5A2A1A').lerp(col('#FF5A2A'), st.heat));
    Gp.glowM.opacity = 0.08 + 0.72 * st.heat;
    const fr = R * 0.62 * st.s[0];
    Gp.vapor.visible = st.vapor > 0.01; Gp.vapor.scale.set(fr, Math.max(0.001, st.gap), fr); Gp.vapor.position.set(st.pos.x, top + st.gap / 2, 0); Gp.vaporM.opacity = 0.18 * st.vapor;
    for (let i = 0; i < 72; i++) {   // vapour streams out from under the drop, then curls up past its rim
      if (st.vapor < 0.05) { Gp.flow.setMatrixAt(i, ZERO); continue; }
      const a = i * 2.39996, u = frac(t * 0.75 + rnd(i, 1)), r = u * (fr + 0.6);
      let y = top + st.gap * (0.3 + 0.4 * rnd(i, 2)), sc = 1;
      if (r > fr) { const k = r - fr; y += k * 1.1; sc = Math.max(0, 1 - k / 0.6); }
      const lag = st.vel ? -0.25 * st.vel * u : 0;
      m4.compose(V(st.pos.x + r * Math.cos(a) + lag, y, r * Math.sin(a)), q4.identity(), s4.setScalar(sc * st.vapor * (id.startsWith('cushion') ? 0.8 : 1))); Gp.flow.setMatrixAt(i, m4);
    }
    const pr = R * st.s[0] * 0.85;
    for (let i = 0; i < 28; i++) {   // boiling: bubbles inside the flattened drop
      const u = frac(t * 1.6 + rnd(i, 3)), sc = st.boil * (0.5 + 0.8 * rnd(i, 4)) * (u < 0.85 ? 1 : 0);
      if (sc < 0.01) { Gp.bubbles.setMatrixAt(i, ZERO); continue; }
      m4.compose(V(st.pos.x + (rnd(i, 5) - 0.5) * 1.7 * pr, top + 0.03 + u * R * st.s[1] * 1.6, (rnd(i, 6) - 0.5) * 1.2 * pr), q4.identity(), s4.setScalar(sc)); Gp.bubbles.setMatrixAt(i, m4);
    }
    for (let i = 0; i < 26; i++) {   // steam puffs while it sizzles
      const u = frac(t * 0.8 + i / 26), sc = st.boil * (0.12 + 0.4 * u) * (1 - u);
      if (sc < 0.005) { Gp.puffs.setMatrixAt(i, ZERO); continue; }
      m4.compose(V(st.pos.x + (rnd(i, 7) - 0.5) * 2 * pr, top + R * st.s[1] + u * 1.8, 0.2 + (rnd(i, 8) - 0.5) * 0.6), q4.identity(), s4.setScalar(sc)); Gp.puffs.setMatrixAt(i, m4);
    }
    Gp.flow.instanceMatrix.needsUpdate = Gp.bubbles.instanceMatrix.needsUpdate = Gp.puffs.instanceMatrix.needsUpdate = true;
    const lift = id === 'cushion_lift' ? seg(t, C.liftTag - 0.5, C.liftTag + 0.1) : 0;
    Gp.liftArrows.forEach((a, k) => { a.visible = lift > 0.01; a.position.set(st.pos.x + (k - 1) * 0.24, top + 0.005, 0.32); a.userData.setLength(st.gap * 0.92 * lift * (0.9 + 0.1 * Math.sin(t * 8 + k))); });
    const heat = id === 'cushion_heat' ? seg(t, C.heatTag - 0.6, C.heatTag + 0.2) : 0;
    Gp.heatArrows.forEach((a, k) => { a.visible = heat > 0.01; a.position.set(st.pos.x + (k - 2) * 0.16, top + 0.005, 0.3); a.userData.setLength(st.gap * 0.55 * heat * (0.85 + 0.15 * Math.sin(t * 6 + k * 1.3))); });
  }
  // ---------------- camera + lights
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const G = V(...GIANT), pp = V(...PAN_POS);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : G.clone().add(V(0, 1.2, 0));
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : V(-2.5, 6.0, 5.0)));
  const ext = set === 'cafe' ? 2.2 : 6;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 30 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' && !close ? 3.2 : 30; S.scene.fog.far = set === 'cafe' && !close ? 9 : 90;
  S.faceLight.intensity = set === 'cafe' && !close ? 0.9 : 0; S.rim.intensity = close ? 1.0 : 0;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  const top = PAN.top;
  if (set === 'giant') {
    const st = ch.giant(t, id), dp = G.clone().add(st.pos);
    if (id === 'giant_warm') { pin('warm', G.clone().add(V(1.6, top, 0.6)), G.clone().add(V(1.5, top + 1.3, 0.6))); pin('sizzle', G.clone().add(V(0.15, top + 0.2, 0.6)), G.clone().add(V(0.8, top + 1.5, 0.6))); }
    if (id === 'giant_hot') { pin('hot', G.clone().add(V(1.6, top, 0.6)), G.clone().add(V(1.4, top + 1.3, 0.6))); pin('steam', G.clone().add(V(st.pos.x + 0.2, top + 0.065, 0.45)), G.clone().add(V(0.9, top - 0.55, 0.6))); }
    if (id === 'cushion_lift') pin('lift', G.clone().add(V(st.pos.x + 0.24, top + st.gap * 0.6, 0.32)), G.clone().add(V(0.55, top - 0.18, 0.5)));
    if (id === 'cushion_heat') pin('heat', G.clone().add(V(st.pos.x - 0.16, top + st.gap * 0.45, 0.3)), G.clone().add(V(-0.45, top - 0.18, 0.5)));
    if (id === 'giant_skate') pin('skate', dp, dp.clone().add(V(0, 1.2, 0)));
  } else {
    const d0 = ch.cafeDrop(0, t);
    if (id === 'proof_pan' && d0) pin('proof', d0.pos, pp.clone().add(V(0.0, 0.11, 0.0)));
    if (id === 'test_sizzle') pin('notYet', pp.clone().add(V(0, 0.045, 0)), pp.clone().add(V(0.0, 0.045, 0.09)));
    if (id === 'test_skate') pin('ready', pp.clone().add(V(0, 0.045, 0)), pp.clone().add(V(0.0, 0.045, 0.09)));
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
// The thumbnail is frame 0 itself (the drop hovering on its steam cushion + the title words) with the Recall pill added.
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
