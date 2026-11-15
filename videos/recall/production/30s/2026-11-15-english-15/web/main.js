// Entry: the low-poly café + performer from feedback round 01 with an iced glass of orange drink beaded with condensation
// (frame 0 = the thumbnail composition; labels show the drink is orange but the drops are clear), a giant cutaway of the glass
// wall where water-vapor molecules slow in the cold layer and stick to grow drops, and an insulated tumbler that stays dry;
// renders any frame deterministically, plus the thumbnail ("sheet" pose "thumbnail" = frame 0 + Recall pill).
// Frames are written from an explicit composite of the 3D and overlay canvases (english-09 fix).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildGlass, placeDrop, buildTumbler, buildGiantGlass, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GLASS_POS, CUP_POS, GIANT } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);
const tri = x => 1 - Math.abs(((x % 2) + 2) % 2 - 1);

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
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01) + a soft rim light on the glass
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.rim = new THREE.PointLight('#FFF1D6', 1.2, 1.2, 1.5); S.rim.position.set(GLASS_POS[0] - 0.15, GLASS_POS[1] + 0.25, GLASS_POS[2] - 0.12); scene.add(S.rim);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.glass = buildGlass(scene); S.glass.group.position.set(...GLASS_POS);
  S.cup = buildTumbler(scene);
  S.tip = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 12, 8), new THREE.MeshStandardMaterial({ color: '#F4FBFF', transparent: true, opacity: 0.85, roughness: 0.02, emissive: '#9CC9E0', emissiveIntensity: 0.3 })); scene.add(S.tip);
  S.G = buildGiantGlass(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3();

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant');
  const gl = S.glass, gp = V(...GLASS_POS);
  // ---------------- condensation drops: static beads plus a few running drips (the finger wipe was dropped in review)
  gl.data.forEach((d, i) => {
    let y = d.y, r = d.r;
    if (i % 37 === 0) { const ph = frac(t * 0.09 + i * 0.13); y = d.y - ph * 0.06; if (y < 0.02) r = 0; r *= 1.5; }   // a few drips slide down
    placeDrop(gl, i, d.a, y, r);
  });
  gl.drops.instanceMatrix.needsUpdate = true;
  // ---------------- performer: hands at rest by the glass; tumbler on the counter (payoff, CTA); S.tip stays hidden
  const q = ch.person(t, shot.id); q.pos = ROOT;
  const restR = V(0.24, 1.0, -0.36), restL = V(-0.22, 1.0, -0.34);
  q.handR = restR; q.handL = restL;
  S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  S.tip.visible = false;
  S.cup.group.visible = shot.id === 'payoff_cup' || shot.id === 'cafe_wide';
  S.cup.group.position.set(...CUP_POS);
  // ---------------- giant: vapor molecules, cold layer, sticking, growing drops
  const G = S.G, gs = ch.giant(t), org = V(...GIANT), P = {};
  G.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, gl.group, S.cup.group, S.tip]) if (giantShot) o.visible = false; else if (o !== S.cup.group && o !== S.tip) o.visible = true;
  if (giantShot) {
    G.cold.children.forEach((p, i) => { p.material.opacity = gs.cool * (0.3 - i * 0.065); });
    const active = Math.round(60 + 70 * gs.humid), lo = [0.25, 0.7, -2.4], hi = [3.6, 4.9, 2.4], span = hi.map((h, k) => h - lo[k]);
    G.mols.forEach((m, i) => {
      if (i >= active) { m4.makeScale(0, 0, 0); G.molO.setMatrixAt(i, m4); G.molH.setMatrixAt(i * 2, m4); G.molH.setMatrixAt(i * 2 + 1, m4); return; }
      const sp = 0.55;
      const p = [0, 1, 2].map(k => lo[k] + tri((m.p[k] - lo[k] + m.v[k] * sp * t) / span[k]) * span[k]);
      let pos = V(...p), spin = m.a + m.spin * 6 * t;
      const near = clamp(1 - (pos.x - 0.25) / 1.1);                                            // inside the cold layer
      if (gs.cool > 0) { pos.x = 0.25 + (pos.x - 0.25) * (1 - 0.35 * gs.cool * near); spin = m.a + m.spin * 6 * t * (1 - 0.7 * gs.cool * near); }
      const site = G.sites[m.site];
      if (gs.stick > 0 && i % 3 === 0) {                                                       // captured: travels to its drop and joins it
        const ph = frac(t * 0.32 + m.ph), target = V(G.X + 0.05, site.y, site.z);
        pos = pos.lerp(target, E.in(ph) * gs.stick);
        if (ph > 0.94) { m4.makeScale(0, 0, 0); G.molO.setMatrixAt(i, m4); G.molH.setMatrixAt(i * 2, m4); G.molH.setMatrixAt(i * 2 + 1, m4); return; }
      }
      if (gs.stick > 0 && i % 17 === 1) {                                                      // a few leave a drop again (but fewer than arrive)
        const ph = frac(t * 0.25 + m.ph); pos = V(G.X + 0.08, site.y, site.z).lerp(V(1.4, site.y + 0.4, site.z + 0.3), E.out(ph));
      }
      const o = pos;   // local to the giant group
      m4.makeTranslation(o.x, o.y, o.z); G.molO.setMatrixAt(i, m4);
      for (const [j, sx] of [[0, -1], [1, 1]]) { const a = spin + sx * 0.91; m4.makeTranslation(o.x + 0.11 * Math.sin(a), o.y + 0.11 * Math.cos(a), o.z + 0.012); G.molH.setMatrixAt(i * 2 + j, m4); }
    });
    G.molO.instanceMatrix.needsUpdate = true; G.molH.instanceMatrix.needsUpdate = true;
    G.sites.forEach((s, i) => {
      let r = s.max * clamp(gs.grow * 1.25 - s.ph * 0.3) * (1 + 0.45 * gs.humid), y = s.y;
      if (gs.humid > 0.6 && i % 4 === 0) y = s.y - 1.2 * frac((t - C.humid) * 0.25 + s.ph) * gs.humid;   // big drops start to run
      m4.compose(V(G.X + r * 0.3, y, s.z), q4.identity(), s4.set(r * 0.4, r * 1.1, r)); G.drops.setMatrixAt(i, m4);   // local: beads hugging the glass
    });
    G.drops.instanceMatrix.needsUpdate = true;
  }
  // ---------------- camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = giantShot ? org.clone().add(V(0.6, 2.6, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(3.0, 6.0, 4.0) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 5 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 10 : 3.2; S.scene.fog.far = giantShot ? 30 : 9;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (shot.id === 'hook_glass') {
    pin('orange', gp.clone().add(V(-0.012, 0.06, 0.03)), gp.clone().add(V(-0.05, 0.02, 0.06)));
    pin('clear', gp.clone().add(V(0.03, 0.085, 0.03)), gp.clone().add(V(0.06, 0.03, 0.07)));
  }
  if (shot.id === 'giant_air') pin('vapor', org.clone().add(V(1.8, 3.0, 0.4)), org.clone().add(V(2.2, 1.3, 1.2)));
  if (shot.id === 'giant_cool') { pin('dew', org.clone().add(V(0.55, 2.0, 0.9)), org.clone().add(V(1.3, 1.15, 1.4))); pin('glass', org.clone().add(V(0.14, 3.9, 1.6)), org.clone().add(V(0.7, 4.4, 2.0))); }
  if (shot.id === 'giant_stick') pin('stick', org.clone().add(V(G.X + 0.1, G.sites[3].y, G.sites[3].z)), org.clone().add(V(0.9, 1.4, 1.0)));
  if (shot.id === 'giant_humid') pin('humid', org.clone().add(V(2.0, 3.6, 0.4)), org.clone().add(V(2.4, 1.2, 1.4)));
  if (shot.id === 'payoff_cup') pin('dry', V(...CUP_POS).add(V(0, 0.09, 0.04)), V(...CUP_POS).add(V(0.05, 0.0, 0.08)));
  const safe = { shot: shot.id };
  if (shot.id === 'cafe_wide') safe.head = project(head).y;
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
// The thumbnail is frame 0 itself (the glass + the title words) with the Recall pill added.
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
