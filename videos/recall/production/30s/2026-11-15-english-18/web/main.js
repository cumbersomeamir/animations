// Entry: the low-poly café + performer from feedback round 01 with a vacuum flask, and a giant half-section of the flask
// (frame 0 = the thumbnail composition: mirror walls bouncing infrared arrows) that is assembled step by step: the inner bottle
// loses heat three ways, the outer wall arrives and the gap's air is pumped out, conduction stops at the empty gap, infrared still
// crosses it until the walls turn into mirrors, and the top stays the weak spot until the lid goes on. Renders any frame
// deterministically, plus the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall pill). Frames are written from an explicit
// composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildGiantFlask, buildSquiggles, buildCafeFlask, buildDots, buildPuffs, buildArrow, FL, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, FLASK_POS, LID_POS } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);
const sm = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const HEAT = '#FF8A3D';

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
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 80);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01) + a soft face light
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.9, 1.6, 1.5); S.faceLight.position.set(0.3, 1.75, 0.0); scene.add(S.faceLight);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.flask = buildCafeFlask(scene); S.flask.group.position.set(...FLASK_POS);
  S.steam = buildPuffs(scene, 6, '#FFFFFF', 0.32);
  // giant flask section + heat visuals
  S.F = buildGiantFlask(scene, GIANT);
  S.sq = buildSquiggles(S.F.group, 12);
  const arrow = (r) => { const a = buildArrow(scene, HEAT, r); S.F.group.add(a); return a; };
  S.down = arrow(0.05); S.down.rotation.z = Math.PI;
  S.side = [1.25, 2.05].map(() => { const a = arrow(0.045); a.rotation.z = -Math.PI / 2; return a; });
  S.conv = buildDots(scene, 32, 0.05, 0); S.F.group.add(S.conv);
  S.gap = buildDots(scene, 24, 0.045, 0); S.F.group.add(S.gap);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const placeSq = (sq, x, y, ang, op, sc = 1) => { sq.visible = op > 0.01; sq.position.set(x, y, 0.08); sq.rotation.set(0, 0, ang); sq.scale.setScalar(sc); sq.userData.m.opacity = clamp(op); };

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const giantShot = id.startsWith('giant') || id === 'hook_mirror';
  const cam = ch.camera(t);
  // ---------------- café: performer, flask (open in the peek, closed at the end), steam
  const q = ch.person(t); q.pos = ROOT;
  q.handR = V(0.24, 1.0, -0.36); q.handL = V(-0.22, 1.0, -0.34);
  S.person.apply(q);
  const open = id !== 'cafe_cta';
  if (open) S.flask.lid.position.set(LID_POS[0] - FLASK_POS[0], 0, LID_POS[2] - FLASK_POS[2]); else S.flask.lid.position.set(0, 0.216, 0);
  const mouth = V(...FLASK_POS).add(V(0, 0.23, 0)), camQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam.pos, cam.target, V(0, 1, 0)));
  for (let i = 0; i < 6; i++) {
    if (!open || giantShot) { S.steam.setMatrixAt(i, ZERO); continue; }
    const u = frac(t * 0.35 + i / 6), p = mouth.clone().add(V(0.012 * Math.sin(i * 2.1 + t), 0.17 * u, 0.008 * Math.cos(i * 1.3)));
    m4.compose(p, camQ, s4.setScalar(0.022 + 0.05 * u)); S.steam.setMatrixAt(i, m4);
  }
  S.steam.instanceMatrix.needsUpdate = true; S.steam.material.opacity = 0.32;
  // ---------------- giant flask
  const F = S.F, st = ch.flask(t, id), P = {}, org = V(...GIANT);
  F.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, S.flask.group, S.steam]) o.visible = !giantShot;
  if (giantShot) {
    F.outerG.visible = st.outerIn > 0.001; F.outerG.position.y = (1 - st.outerIn) * 4.6;
    for (const m of F.steel) m.material = st.mirror > 0.5 ? F.chrome : F.plainM;
    const lipY = FL.lipY + 0.02;
    F.lid.visible = id === 'giant_top';   // (frame 0: lid off, so the title sits on clean background)
    F.lid.position.set(0, id === 'hook_mirror' ? lipY + 0.55 : lipY + 0.95 * (1 - st.lidOn), 0);
    // infrared squiggles
    const mode = id === 'giant_ways' ? 'escape' : id === 'giant_ir' ? 'cross' : (id === 'hook_mirror' || (id === 'giant_mirror' && st.mirror > 0.5)) ? 'bounce' : id === 'giant_mirror' ? 'cross' : id === 'giant_top' ? 'up' : 'none';
    const irOn = id === 'giant_ways' ? seg(t, C.irWays - 0.3, C.irWays + 0.2) : 1;
    S.sq.forEach((sq, i) => {
      const s = i % 2 ? 1 : -1, y = 0.75 + ((i * 0.618) % 1) * 1.6, ph = (i * 0.37) % 1, base = s > 0 ? 0 : Math.PI;
      if (mode === 'none') { sq.visible = false; return; }
      if (mode === 'escape' || mode === 'cross') {   // from the inner wall straight out (across the gap and the outer wall)
        const u = frac(t * 0.42 + ph), r = FL.wallOut - 0.05 + (mode === 'cross' ? 1.5 : 1.25) * u;
        placeSq(sq, s * r, y, base, irOn * (1 - sm(0.78, 1, u)) * sm(0, 0.06, u), 0.72);
      } else if (mode === 'bounce') {   // trapped in the gap: zig-zag between the two mirror surfaces while drifting along it
        const sc = 0.5, Ls = 0.5 * sc, r0 = FL.wallOut + 0.03, r1 = FL.gapOut - 0.03, span = r1 - r0;
        const u = frac(t * 0.16 + ph), w = (u * 6 + ph * 2) % 2, out = w < 1, r = r0 + span * (out ? w : 2 - w);
        const yy = 0.7 + 1.9 * u, ang = Math.atan2(0.9, out ? 1 : -1);
        const dir = V(Math.cos(ang), Math.sin(ang), 0), tail = V(r, yy, 0).sub(dir.clone().multiplyScalar(Ls * 0.5));
        placeSq(sq, s * tail.x, tail.y, s > 0 ? ang : Math.PI - ang, sm(0, 0.06, u) * (1 - sm(0.9, 1, u)), sc);
      } else if (mode === 'up') {
        const lid = st.lidOn, x = ((i % 4) - 1.5) * 0.13;
        if (i >= (lid > 0.5 ? 3 : 8)) { sq.visible = false; return; }
        const u = frac(t * (lid > 0.5 ? 0.22 : 0.45) + ph), yy = 2.45 + (lid > 0.5 ? 1.5 : 2.0) * u;
        placeSq(sq, x, yy, Math.PI / 2, (lid > 0.5 ? 0.4 : 1) * sm(0, 0.08, u) * (1 - sm(0.8, 1, u)), lid > 0.5 ? 0.6 : 0.85);
      }
    });
    // conduction: down into the counter (three ways); sideways, stopping at the empty gap (no air)
    S.down.visible = id === 'giant_ways'; S.down.position.set(0.3, 0.5, 0.08); S.down.userData.setLength(0.72 * E.out(seg(t, C.solids - 0.25, C.solids + 0.35)));
    S.side.forEach((a, k) => {
      a.visible = id === 'giant_noair'; a.position.set(0.28, [1.25, 2.05][k], 0.08);
      const grow = seg(t, C.noAir + 0.1 * k, C.noAir + 0.7 + 0.1 * k, E.out); a.userData.setLength(0.39 * grow * (1 - 0.12 * st.block * Math.abs(Math.sin(t * 9))));
      a.userData.mat.opacity = 1 - 0.45 * st.block; a.userData.mat.transparent = true;
    });
    // convection: warm air looping up beside the bare inner bottle
    for (let k = 0; k < 32; k++) {
      if (id !== 'giant_ways') { S.conv.setMatrixAt(k, ZERO); continue; }
      const s = k % 2 ? 1 : -1, a = -frac(t * 0.22 + Math.floor(k / 2) / 16) * Math.PI * 2, on = seg(t, C.air - 0.3, C.air + 0.2);
      m4.compose(V(s * (1.08 + 0.3 * Math.cos(a)), 1.6 + 0.95 * Math.sin(a), 0.07), q4.identity(), s4.setScalar(on)); S.conv.setMatrixAt(k, m4); S.conv.setColorAt(k, col('#FFC9A0'));
    }
    S.conv.instanceMatrix.needsUpdate = true; S.conv.instanceColor.needsUpdate = true;
    // air in the gap (walls arrive), then pumped out
    for (let k = 0; k < 24; k++) {
      if (id !== 'giant_walls' || st.outerIn < 0.95) { S.gap.setMatrixAt(k, ZERO); continue; }
      const s = k % 2 ? 1 : -1, y0 = 0.55 + ((k * 0.381) % 1) * 2.1, x = s * (0.825 + 0.1 * Math.sin(t * 3 + k)), y = y0 + 0.05 * Math.sin(t * 2.3 + k * 1.7);
      m4.compose(V(x, y, 0.07), q4.identity(), s4.setScalar(st.gapAir)); S.gap.setMatrixAt(k, m4); S.gap.setColorAt(k, col('#DCEBF5'));
    }
    S.gap.instanceMatrix.needsUpdate = true; S.gap.instanceColor.needsUpdate = true;
  }
  // ---------------- camera + key light
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = giantShot ? org.clone().add(V(0, 1.9, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-2.5, 5.0, 6.0) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.5 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 14 : 3.2; S.scene.fog.far = giantShot ? 34 : 9;
  S.faceLight.intensity = giantShot ? 0 : 0.9;
  // ---------------- overlay anchors
  const W = (x, y, z = 0.05) => org.clone().add(V(x, y, z));
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  // the 'solids' tag sits at y 0.7 (at 0.25 it was clamped to y 1463, past the 1460 label limit)
  if (id === 'giant_ways') { pin('solids', W(0.3, 0.0), W(1.0, 0.7)); pin('air', W(1.08, 2.5), W(1.25, 2.85)); pin('irWays', W(-1.2, 2.2), W(-1.0, 2.75)); }
  if (id === 'giant_walls') pin('vac', W(0.825, 2.0), W(1.25, 2.95));
  if (id === 'giant_noair') pin('noAir', W(0.825, 1.65), W(1.0, 2.55));
  if (id === 'giant_ir') pin('ir', W(1.3, 2.0), W(1.3, 2.55));
  if (id === 'giant_mirror') pin('mirror', W(0.98, 2.2), W(1.15, 2.65));
  if (id === 'giant_top') pin('weak', W(0.38, 3.35), W(0.85, 4.0));
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
// The thumbnail is frame 0 itself (the mirror-walled flask section + the title words) with the Recall pill added.
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
