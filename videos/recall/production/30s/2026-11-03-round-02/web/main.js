// Entry: builds the low-poly café (same set + performer as feedback round 01), the counter microwave, a bowl of
// leftovers, spoon, steam and the giant cutaway microwave; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildMicrowave, buildBowl, buildSpoon, buildSteam, buildGiantOven, setPolar, PAL } from './lowpoly.js';
import { drawDisplay } from './screen.js';
import { makeChoreo, BOWL_POS, MW_POS, MW_ROT, GIANT } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { CAV, BOWL, rIn, rOut, foodTop, field, antinodes, topHeat, sectionT, heatRGB, NR, NS } from './heat.js';
import { E, clamp, rng } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const STEW = [col('#9A5A34'), col('#B06A3B'), col('#8A4E2C')].map(c => [c.r, c.g, c.b]);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 54px Fredoka', '700 38px Fredoka'].map(f => document.fonts.load(f)));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; R.localClippingEnabled = true; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.02, 60);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01)
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  S.cafe.coffee.position.set(0.62, 0.95, -0.08);
  S.mw = buildMicrowave(scene); S.mw.group.position.set(...MW_POS); S.mw.group.rotation.y = MW_ROT; S.mw.group.updateMatrixWorld(true);
  S.bowl = buildBowl(scene); S.spoon = buildSpoon(scene); S.steam = buildSteam(scene, 80);
  const R1 = rng(11); S.steamDef = Array.from({ length: 80 }, () => ({ a: R1() * Math.PI * 2, u: R1(), ph: R1(), sp: 0.7 + 0.6 * R1(), sz: 0.6 + 0.8 * R1(), sw: R1() * 6 }));
  S.clip = new THREE.Plane(V(0, 0, -1), 1e3);
  S.G = buildGiantOven(scene, GIANT, S.clip);
  // standing-wave strong spots: food-level layer + a fainter upper layer
  S.anti = antinodes();
  const c3 = new THREE.Color();
  S.anti.forEach((a, i) => { S.G.blobs.setColorAt(i, c3.set(PAL.lime)); S.G.blobs.setColorAt(i + 16, c3.set('#A6CC58')); });
  S.G.blobs.instanceColor.needsUpdate = true;
  // travelling wave paths: from the inlet, specular bounces off the metal walls
  S.rays = Array.from({ length: 8 }, (_, k) => tracePath(V(CAV.W / 2 - 0.02, 1.55, -0.35), V(-1, -0.08 - 0.06 * k, (k - 3.5) * 0.36).normalize(), 9));
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true };
};

function tracePath(p0, d0, L) {
  const pts = [p0.clone()], lo = V(-CAV.W / 2, 0.15, -CAV.D / 2), hi = V(CAV.W / 2, CAV.H - 0.05, CAV.D / 2);
  let p = p0.clone(), d = d0.clone(), left = L;
  for (let n = 0; n < 12 && left > 0; n++) {
    let tm = Infinity, ax = -1;
    for (const k of ['x', 'y', 'z']) {
      if (Math.abs(d[k]) < 1e-6) continue;
      const tt = ((d[k] > 0 ? hi[k] : lo[k]) - p[k]) / d[k];
      if (tt > 1e-6 && tt < tm) { tm = tt; ax = k; }
    }
    const step = Math.min(tm, left); p = p.clone().add(d.clone().multiplyScalar(step)); pts.push(p.clone()); left -= step;
    if (ax) d[ax] = -d[ax];
  }
  const seglen = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = pts[i].distanceTo(pts[i - 1]); seglen.push(l); tot += l; }
  return { pts, seglen, tot };
}
function pathAt(path, s) {
  if (s <= 0) return path.pts[0].clone();
  for (let i = 0; i < path.seglen.length; i++) { if (s <= path.seglen[i]) return path.pts[i].clone().lerp(path.pts[i + 1], s / path.seglen[i]); s -= path.seglen[i]; }
  return path.pts[path.pts.length - 1].clone();
}

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const GV = (x, y, z) => V(GIANT[0] + x, GIANT[1] + y, GIANT[2] + z);

function updateRealBowl(t, p) {
  const B = S.bowl, s = B.s, mw = S.mw;
  if (p.bowlIn) { B.group.position.copy(mw.group.localToWorld(mw.cav.clone())); B.group.rotation.y = MW_ROT + p.plateRot; }
  else { B.group.position.set(...BOWL_POS); B.group.rotation.y = 0; }
  const rFood = rIn(BOWL.food) * s, NRb = B.fg.userData.NR;
  const h = (r, a) => foodTop(r / s, p.mound) * s + 0.0018 * Math.sin(a * 5 + r * 300) * (0.4 + 0.6 * p.mound);
  setPolar(B.fg, i => (i + 1) / NRb * rFood, h, (i, j) => STEW[(Math.max(0, i) * 7 + j * 3) % 3]);
  B.lumps.forEach((L, i) => {
    const r = Math.min(0.92, L.r * (1 + 0.15 * p.spreadOut)) * rFood, a = L.a + p.stirAng * (1 - 0.4 * L.r);
    L.m.position.set(r * Math.cos(a), h(r, a) + 0.002, r * Math.sin(a)); L.m.rotation.set(i, a, 0);
  });
  // steam: only off the hot rim before stirring; from the whole surface after standing
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1), pos = V(0, 0, 0);
  S.bowl.group.updateMatrixWorld(true);
  S.steamDef.forEach((sd, i) => {
    const show = i / S.steamDef.length < p.steam;
    const age = ((t * sd.sp / 1.6 + sd.ph) % 1);
    const rEdge = rFood * (0.76 + 0.24 * sd.u), rAll = rFood * Math.sqrt(sd.u) * 0.95, r = rEdge + (rAll - rEdge) * p.steamAll;
    const a = sd.a + 0.3 * age;
    pos.set((r + 0.012 * age) * Math.cos(a) + 0.006 * Math.sin(sd.sw + t * 3), h(r, a) + 0.004 + age * 0.12 * sd.sp, (r + 0.012 * age) * Math.sin(a));
    const w = show ? (0.006 + 0.016 * age) * sd.sz * Math.sin(Math.PI * age) : 0;
    sc.set(w, w * 1.3, w); m.compose(S.bowl.group.localToWorld(pos.clone()), S.cam.quaternion, sc); S.steam.setMatrixAt(i, m);
  });
  S.steam.instanceMatrix.needsUpdate = true;
  return { rFood, foodCentre: S.bowl.group.localToWorld(V(0, foodTop(0, p.mound) * s, 0)) };
}

function updateGiant(t, gs) {
  const G = S.G, R = G.R, rFood = rIn(BOWL.food) * R;
  G.portGlow.material.opacity = 0.85 * gs.port;
  // travelling waves
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(1, 1, 1);
  let n = 0;
  S.rays.forEach((path, k) => {
    for (let j = 0; j < 40; j++) {
      const sd = gs.raysS[k] - j * 0.08;
      let w = 0, p = V(0, 0, 0);
      if (gs.rays > 0 && sd > 0 && sd < path.tot) { p = pathAt(path, sd); p.y += 0.09 * Math.sin(2 * Math.PI * sd / 0.42); w = 0.12 * (1 - 0.7 * j / 40) * gs.rays; }
      sc.set(w, w, w); m.compose(p, q, sc); G.trails.setMatrixAt(n++, m);
    }
  });
  G.trails.instanceMatrix.needsUpdate = true;
  // strong spots
  const y0 = 0.12 + foodTop(0, 1) * R + 0.06;
  S.anti.forEach((a, i) => {
    const s = Math.sqrt(a.s) * (0.92 + 0.08 * Math.sin(t * 6 + i)) * gs.pattern;
    m.compose(V(a.x, y0, a.z), q, V(0.21 * s, 0.035 * s, 0.21 * s)); G.blobs.setMatrixAt(i, m);
    m.compose(V(a.x, 1.45, a.z), q, V(0.16 * s, 0.03 * s, 0.16 * s)); G.blobs.setMatrixAt(i + 16, m);
  });
  G.blobs.instanceMatrix.needsUpdate = true; G.blobs.material.opacity = 0.62 - 0.42 * clamp((t - S.choreo.cues.turn - 0.3) / 0.6);
  // turntable + food heat map
  G.turn.rotation.y = -gs.theta;
  const st = gs.st, T = gs.top ? topHeat(t, S.choreo.cues.turn, 1.8, R) : null;
  const h = (r) => foodTop(r / R, st.mound) * R;
  setPolar(G.fg, i => (i + 1) / NR * rFood, (r, a) => h(r) + 0.006 * (r / rFood) * Math.sin(a * 7 + r * 20), (i, j) => {
    if (gs.section) { const r = Math.max(0, i) / NR * rFood / R; return heatRGB(sectionT(r, foodTop(r, st.mound) - 0.002, st)); }
    if (T) return heatRGB(T[Math.max(0, Math.min(NR - 1, i)) * NS + j]);
    return heatRGB(0);
  });
  // cross-section
  S.clip.constant = gs.section ? GIANT[2] : 1e3;
  G.cap.visible = gs.section;
  if (gs.section) drawCap(st);
  G.arrows.forEach((ar, k) => {
    const starts = [[-0.62, 0.42], [0.62, 0.42], [-0.35, 0.58], [0.35, 0.58], [-0.18, 0.2], [0.18, 0.2]], core = [0, 0.36];
    const [sx, sy] = starts[k], u = 0.12 + 0.38 * gs.arrowU, px = sx + (core[0] - sx) * u, py = sy + (core[1] - sy) * u;
    ar.visible = gs.arrows > 0.01 && gs.section;
    ar.position.copy(GV(px * R, 0.12 + py * R, 0.03));
    ar.quaternion.setFromUnitVectors(V(0, 1, 0), V(core[0] - sx, core[1] - sy, 0).normalize());
    ar.material.opacity = 0.9 * gs.arrows;
  });
}

function drawCap(st) {
  const g = S.G.capCtx, Wc = S.G.capCanvas.width, Hc = S.G.capCanvas.height, img = g.createImageData(Wc, Hc), dd = img.data;
  const band = [0.78, 0.95, 0.42];
  for (let py = 0; py < Hc; py++) {
    const y = 0.96 - (py + 0.5) / Hc * 1.0;
    for (let px = 0; px < Wc; px++) {
      const rho = -1.05 + (px + 0.5) / Wc * 2.1, r = Math.abs(rho), k = (py * Wc + px) * 4;
      let rgb = null;
      if (y >= 0 && y <= BOWL.h + 0.02 && r <= rOut(Math.min(y, BOWL.h))) {
        if (y >= BOWL.base && r <= rIn(Math.min(y, BOWL.h))) { if (y <= foodTop(r, st.mound)) rgb = heatRGB(sectionT(rho, y, st)); }
        else rgb = Math.abs(y - BOWL.h * 0.82) < 0.025 && r > rIn(y) + 0.02 ? band : [0.95, 0.93, 0.89];
      }
      if (rgb) { dd[k] = rgb[0] * 255; dd[k + 1] = rgb[1] * 255; dd[k + 2] = rgb[2] * 255; dd[k + 3] = 255; } else dd[k + 3] = 0;
    }
  }
  g.putImageData(img, 0, 0); S.G.capTex.needsUpdate = true;
}

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), p = ch.props(t);
  // microwave
  const mw = S.mw;
  mw.door.rotation.y = -1.75 * p.door; mw.lamp.material.color.set(p.lamp ? '#FFE3A8' : '#7A7468'); mw.plate.rotation.y = p.plateRot;
  drawDisplay(mw, p.display);
  const rb = updateRealBowl(t, p);
  // performer: pose, then put the spoon tip where the story needs it and reach the handle with the right hand
  const q = ch.person(t); q.handR = V(0.2, 1.1, -0.3); S.person.apply(q);
  const mouth = S.person.head.localToWorld(V(0, 0.045, 0.11));
  const sp = ch.spoon(t, { food: rb.foodCentre, mouth, R: rb.rFood });
  q.handR = sp.tip.clone().add(sp.dir.clone().multiplyScalar(0.15)); S.person.apply(q);
  S.spoon.position.copy(sp.tip); S.spoon.lookAt(sp.tip.clone().add(sp.dir));
  S.spoon.visible = !['mw_open', 'panel_pause'].includes(shot.id);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // giant cavity
  const gs = ch.giant(t); updateGiant(t, gs);
  // camera + key light follow the shot
  const mwFront = mw.group.localToWorld(V(0, mw.H / 2, mw.D / 2)), mwN = V(Math.sin(MW_ROT), 0, Math.cos(MW_ROT));
  const disp = mw.disp.getWorldPosition(V(0, 0, 0));
  const mwLocal = (x, y, z) => mw.group.localToWorld(V(x, y, z));
  const cam = ch.camera(t, { head, bowl: V(...BOWL_POS), mwFront, mwN, disp, mwLocal });
  S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const giantShot = shot.id.startsWith('giant');
  const focus = giantShot ? V(...GIANT) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = giantShot ? 7 : 2.6; S.scene.fog.far = giantShot ? 20 : 8;
  // overlay anchors
  const P = {};
  if (giantShot) {
    const R = S.G.R, y0 = 0.12 + foodTop(0, 1) * R + 0.06, a = S.anti[9];
    P.wallPt = project(GV(CAV.W / 2 - 0.02, 1.15, 0.45)); P.wall = project(GV(CAV.W / 2 - 0.75, 1.8, 0.55));
    P.strongPt = project(GV(a.x, y0, a.z)); P.strong = project(GV(a.x + 0.35, y0 + 0.55, a.z));
    P.weakPt = project(GV(0, y0, 0)); P.weak = project(GV(-0.55, y0 + 0.6, 0.1));
    P.turnPt = project(GV(0.2, 0.12, 1.07)); P.turn = project(GV(0.55, 0.0, 1.35));
    P.outerPt = project(GV(0.7 * R, 0.12 + 0.42 * R, 0.01)); P.outer = project(GV(0.7 * R + 0.2, 0.12 + 0.9 * R, 0.01));
    P.midPt = project(GV(0, 0.12 + 0.34 * R, 0.01)); P.mid = project(GV(-0.35, 0.12 + 0.95 * R, 0.01));
    P.evenPt = project(GV(0.1, 0.12 + 0.4 * R, 0.01)); P.even = project(GV(0.3, 0.12 + 1.0 * R, 0.01));
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
