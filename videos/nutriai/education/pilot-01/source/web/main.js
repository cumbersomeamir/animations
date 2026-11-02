// main.js: boots the pilot scene, applies director state per frame, composites the 2D overlay,
// and exposes deterministic render/capture hooks (seek harness: ?t=seconds, as in the shader-glsl skill).
import * as THREE from 'three';
import { createStage, createBalance, createMango, createCubes, createColumn, createCup, COLUMN, CUP, BAL } from './props.js';
import { createGram } from './gram.js';
import { createOverlay, TEXT_LOG } from './overlay.js';
import { makeDirector } from './director.js';
import { COL, clamp, ease, seg, lerp } from './util.js';

const W = 1080, H = 1920;
const getJSON = async (u) => { const r = await fetch(u); return r.ok ? r.json() : null; };
const TL = await getJSON('../timeline.json');
const mouth = await getJSON('../build/audio/mouth.json');
for (const [fam, url, weight] of [['NDisplay', '../fonts/InterDisplay-Black.otf', '900'], ['NText', '../fonts/Inter-SemiBold.otf', '600'], ['NText', '../fonts/Inter-Bold.otf', '700'], ['NText', '../fonts/Inter-Bold.otf', '800']]) {
  const ff = new FontFace(fam, `url(${url})`, { weight });
  await ff.load();
  document.fonts.add(ff);
}
const iconImg = await new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = '../assets/icon.png'; });

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.localClippingEnabled = true;
renderer.autoClear = false;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050806');
const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);

// lights: warm key spot, leaf-green rim, low fill, a small warm kicker for the fruit
const key = new THREE.SpotLight('#FFF1DE', 140, 30, 0.52, 0.65, 1.6);
key.position.set(2.6, 8.5, 6.5);
key.target.position.set(0.2, 1.8, 0);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.bias = -0.0004;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight('#86DA3F', 1.6);
rim.position.set(-4, 5, -6);
scene.add(rim);
const rim2 = new THREE.DirectionalLight('#A6E955', 0.7);
rim2.position.set(5, 3, -4);
scene.add(rim2);
scene.add(new THREE.HemisphereLight('#2A3A2C', '#050806', 0.9));
const warm = new THREE.PointLight('#FFC680', 6, 6, 1.8);
warm.position.set(1.8, 3.2, 2.6);
scene.add(warm);

const stage = createStage(THREE);
scene.add(stage.group);
const balance = createBalance(THREE);
scene.add(balance.group);
const mango = createMango(THREE);
scene.add(mango.group);
const cubes = createCubes(THREE, 13);
scene.add(cubes.mesh);
const column = createColumn(THREE);
scene.add(column.group);
const cup = createCup(THREE);
scene.add(cup.group);
const gram = createGram(THREE);
scene.add(gram.root);
gram.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });

// magnifier prop + thumb
const magnifier = new THREE.Group();
const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 12, 40), new THREE.MeshPhysicalMaterial({ color: COL.lime, metalness: 0.5, roughness: 0.3, emissive: COL.leaf, emissiveIntensity: 0.3 }));
const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), new THREE.MeshPhysicalMaterial({ color: '#E9F6E4', transparent: true, opacity: 0.25, roughness: 0.02, clearcoat: 1, side: THREE.DoubleSide }));
const lensHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.26, 12), new THREE.MeshStandardMaterial({ color: COL.ink, roughness: 0.5 }));
lensHandle.position.set(0, -0.3, 0);
magnifier.add(lensRing, lensGlass, lensHandle);
scene.add(magnifier);
const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.07, 4, 8), new THREE.MeshStandardMaterial({ color: COL.mist, roughness: 0.5 }));
scene.add(thumb);

const overlay = createOverlay(W, H);
const overlayTex = new THREE.CanvasTexture(overlay.canvas);
overlayTex.colorSpace = THREE.SRGBColorSpace;
const oScene = new THREE.Scene();
const oCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
oScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: overlayTex, transparent: true, toneMapped: false, depthTest: false, depthWrite: false })));

const D = makeDirector(THREE, null, TL, mouth);
const E = TL.events;
const v3 = new THREE.Vector3();
function proj(x, y, z) { v3.set(x, y, z).project(camera); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H]; }
const cap = (f, i0, o0) => (f < i0 ? 0 : f < o0 ? seg(f, i0, i0 + 12) : 1 + seg(f, o0, o0 + 10));

function update(f) {
  const t = f / TL.fps;
  stage.backU.u_time.value = t;
  balance.setTilt(D.tilt(f));
  const pulse = f >= E.stamp - 1 ? Math.exp(-(f - E.stamp + 1) / 5) : 0;
  balance.trim.emissiveIntensity = 0.35 + 3 * pulse;

  // camera
  const c = D.camera(f);
  camera.position.set(...c.pos);
  camera.lookAt(...c.look);
  camera.updateMatrixWorld();

  // mango
  const m = D.mango(f);
  mango.whole.visible = !!m.whole;
  if (m.whole) {
    mango.group.position.set(...m.pos);
    mango.group.rotation.set(...m.rot);
    mango.group.scale.set(...m.scale);
  } else {
    mango.group.position.set(0, 0, 0);
    mango.group.rotation.set(0, 0, 0);
    mango.group.scale.set(1, 1, 1);
  }
  for (const k of ['front', 'back', 'mid']) {
    const pc = mango.pieces[k];
    const s = m.pieces ? m[k] : null;
    pc.group.visible = !!(s && s.vis);
    if (!pc.group.visible) continue;
    pc.group.rotation.order = 'YXZ';
    pc.group.position.set(...s.pos);
    pc.group.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
    if (s.cap !== undefined) for (const cp of pc.caps) { cp.scale.set(Math.max(0.001, s.cap), Math.max(0.001, s.cap), 1); }
  }
  mango.updateClip();

  // cubes
  const cs = D.cubes(f);
  cs.forEach((q, i) => (q ? cubes.set(i, q[0], q[1], q[2], q[3], q[4], q[5], q[6]) : cubes.set(i, 0, -5, 0, 0)));
  cubes.mesh.instanceMatrix.needsUpdate = true;

  // column
  const col = D.column(f);
  column.group.visible = col.on;
  if (col.on) {
    column.group.position.set(...col.pos);
    column.group.scale.set(col.scaleOut, col.scaleOut, col.scaleOut);
    column.setFill(col.water, col.carbs, col.top, col.fibre);
    column.glass.material.opacity = 0.16 * col.glass;
    column.rim.visible = col.glass > 0.05;
    column.rim.scale.setScalar(Math.max(0.001, col.glass));
    column.waterU.u_time.value = t;
    column.waterU.u_glow.value = col.glow;
    column.carbMat.emissiveIntensity = 0.25 + 1.6 * col.glow;
  }
  // cup
  const cu = D.cup(f);
  cup.group.visible = cu.on;
  if (cu.on) {
    cup.group.position.set(...cu.pos);
    cup.group.scale.setScalar(Math.max(cu.s, 0.001));
    cup.fillLine.visible = cu.line > 0;
    cup.fillLine.position.y = 0.606 * CUP.h;
    cup.fillLine.material.emissiveIntensity = 0.4 + 1.2 * (1 - cu.line) + 0.4;
  }

  // Gram
  const gs = D.gram(f);
  gram.pose(gs.P);
  gram.face(gs.F);
  gram.root.updateMatrixWorld(true);
  const hand = gram.handWorld(1);
  magnifier.visible = gs.prop?.kind === 'magnifier';
  if (magnifier.visible) {
    magnifier.position.set(hand.x + 0.02, hand.y + 0.3, hand.z + 0.02);
    magnifier.rotation.set(0.12 * Math.sin(f * 0.17), 1.0 + 0.15 * Math.sin(f * 0.11), 0.1 * Math.sin(f * 0.23));
    magnifier.scale.setScalar(Math.max(0.001, gs.prop.amount));
  }
  thumb.visible = gs.prop?.kind === 'thumb';
  if (thumb.visible) { thumb.position.set(hand.x, hand.y + 0.1, hand.z + 0.02); thumb.scale.setScalar(Math.max(0.001, gs.prop.amount)); }

  // ---------------- overlay
  const o = overlay;
  o.begin(f);
  const mist = COL.mist, lime = COL.lime, mangoC = COL.mango;
  o.caption(cap(f, E.capQ_in, E.capQ_out), 'INGREDIENT 101 · MANGO', [[['What’s inside', mist]], [['100 g', lime], [' of mango?', mist]]]);
  o.caption(cap(f, E.capM_in, E.capM_out), 'MEASURE THE EDIBLE PART', [[['Just the ', mist], ['flesh', mangoC]], [['no skin · no seed', mist]]]);
  if (m.pieces && m.tags) {
    const mid = m.mid, fr = m.front;
    o.tag(m.tags.seed * 1.0, proj(Math.min(mid.pos[0], 2.0), mid.pos[1] + 0.55, mid.pos[2]), 'seed: not counted');
    o.tag(m.tags.skin, proj(Math.min(fr.pos[0], 2.0), fr.pos[1] + 0.6, fr.pos[2]), 'skin: not counted');
  }
  // level badge at the balance pivot
  const lv = f >= E.level ? seg(f, E.level, E.level + 8) * (1 - seg(f, E.melt + 30, E.melt + 40)) : 0;
  if (lv > 0) { const pp = proj(0, BAL_PIVOT + 0.65, 0.2); o.badge(lv, [pp[0], pp[1] - 40], '= 100 g'); }

  // B3 labels
  const base = col.pos;
  const B3cap = cap(f, E.melt + 2, E.cup - 4);
  o.caption(f < E.vitc - 4 ? B3cap : Math.max(B3cap, 1 + seg(f, E.vitc - 4, E.vitc + 4)) , 'WHAT 100 g OF FLESH IS MADE OF', [[['Mostly ', mist], ['water', lime]]]);
  o.caption(f >= E.vitc ? (f < E.cup - 4 ? seg(f, E.vitc, E.vitc + 12) : 1 + seg(f, E.cup - 4, E.cup + 6)) : 0, 'TOO SMALL TO STACK: 0.036 g', [[['Vitamin C ', mist], ['36 mg', COL.vitc]]]);
  if (col.on && col.fade > 0.02) {
    const fr = { water: 0.835, carbs: 0.15, top: 0.016 };
    const hW = COLUMN.h * fr.water;
    const wC = proj(base[0], base[1] + hW * 0.5, COLUMN.r * 0.9);
    o.inLayer(seg(f, E.waterLabel, E.waterLabel + 12) * col.fade, wC, '83.5 g', 'WATER');
    const cY = base[1] + COLUMN.h * (fr.water + fr.carbs / 2);
    const cA = proj(base[0] - COLUMN.r, cY, 0.2);
    o.label(seg(f, E.carbsLand, E.carbsLand + 10) * col.fade, [cA[0] - 60, cA[1]], cA, f >= E.fibreLabel ? ['Carbs 15.0 g', 'incl. fibre 1.6 g'] : ['Carbs 15.0 g'], { align: 'right', edge: COL.amber });
    const tY = base[1] + COLUMN.h * (fr.water + fr.carbs + fr.top / 2);
    const tA = proj(base[0] - COLUMN.r * 0.6, tY, 0.25);
    o.label(seg(f, E.topLand, E.topLand + 10) * col.fade * (1 - seg(f, E.glow - 6, E.glow + 2)), [tA[0] - 60, tA[1] - 120], tA, ['Other 1.6 g', 'protein · fat · minerals'], { align: 'right', edge: '#F1E6CC', subCol: mist });
    // 60 kcal stamp on the carb layer, fed by sparks
    const sp = f >= E.stamp ? seg(f, E.stamp, E.stamp + 6) : 0;
    const cR = proj(base[0], cY, COLUMN.r);
    const cL = proj(base[0] - COLUMN.r, cY, 0.2);
    if (f >= E.glow) o.sparks(f, E.glow, cL, [cL[0] - 230, cL[1] - 170]);
    o.stamp(sp, [cL[0] - 230, cL[1] - 170], '60 kcal', 'per 100 g · mostly from carbs', col.fade);
    // vitamin C: too small to see as a layer, found with the magnifier
    const vp = seg(f, E.vitc, E.vitc + 10) * col.fade;
    if (vp > 0) {
      const at = proj(base[0], base[1] + COLUMN.h * 0.72, COLUMN.r);
      o.g.save();
      o.g.globalAlpha = clamp(vp * 2);
      o.g.strokeStyle = COL.lime; o.g.lineWidth = 6;
      o.g.fillStyle = 'rgba(5,8,6,0.75)';
      const R = 92 * ease.outBack(vp);
      o.g.beginPath(); o.g.arc(at[0], at[1], R, 0, Math.PI * 2); o.g.fill(); o.g.stroke();
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4 + f * 0.12, rr = (i % 3) * 22 + 10 + 6 * Math.sin(f * 0.2 + i);
        o.g.fillStyle = `rgba(255,184,48,${0.6 + 0.4 * Math.sin(f * 0.3 + i)})`;
        o.g.beginPath(); o.g.arc(at[0] + Math.cos(a) * rr * vp, at[1] + Math.sin(a) * rr * vp, 4.5, 0, Math.PI * 2); o.g.fill();
      }
      o.g.restore();
    }
  }
  // B4 takeaway
  o.caption(f >= E.takeaway ? seg(f, E.takeaway, E.takeaway + 12) : 0, 'TAKEAWAY', [[['100 g', lime], [' ≈ just over', mist]], [['½ cup', lime], [' of pieces', mist]]]);
  if (cu.on && cu.s > 0.2 && f >= E.cup + 6) {
    // measuring-cup graduations drawn crisp in the overlay, anchored to the cup's right edge
    o.g.save();
    o.g.globalAlpha = seg(f, E.cup + 6, E.cup + 14);
    for (const [v, s] of [[0.25, '¼'], [0.5, '½ cup'], [0.75, '¾'], [1.0, '1 cup']]) {
      const p0 = proj(cu.pos[0] - CUP.r * 0.94, cu.pos[1] + v * CUP.h, 0.12);
      const hi = v === 0.5;
      o.g.strokeStyle = hi ? COL.lime : 'rgba(237,246,229,0.85)';
      o.g.lineWidth = hi ? 5 : 3;
      o.g.beginPath(); o.g.moveTo(p0[0] + 26, p0[1]); o.g.lineTo(p0[0] - 18, p0[1]); o.g.stroke();
      o.text(s, p0[0] - 26, p0[1] + 11, hi ? '800 34px NText' : '700 28px NText', hi ? COL.lime : 'rgba(237,246,229,0.9)', 'right', 'cupmark');
    }
    o.g.restore();
  }
  if (cu.on && cu.line > 0) {
    const la = proj(cu.pos[0] + CUP.r, cu.pos[1] + 0.606 * CUP.h, 0.1);
    const lb = proj(cu.pos[0], cu.pos[1] - 0.05, 0.3);
    o.label(cu.line, [lb[0] - 360, lb[1] + 150], null, ['≈ 60 kcal', '100 g of flesh ≈ 0.6 cup'], { align: 'left' });
  }
  o.source(seg(f, E.melt - 4, E.melt + 8));
  o.signature(seg(f, E.sign, E.sign + 12), iconImg);
  overlayTex.needsUpdate = true;
}
const BAL_PIVOT = BAL.pivotY;

window.renderFrame = (f) => {
  update(f);
  renderer.setRenderTarget(null);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.render(oScene, oCam);
};
const px = new Uint8Array(W * H * 4);
window.grab = () => {
  const gl = renderer.getContext();
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let s = '';
  for (let i = 0; i < px.length; i += 0x8000) s += String.fromCharCode.apply(null, px.subarray(i, i + 0x8000));
  return btoa(s);
};
window.renderAndGrab = (f) => { window.renderFrame(f); return window.grab(); };
window.TL = TL;
window.textLog = () => TEXT_LOG;
window.hasMouth = !!mouth;
window.gramRig = gram;
window.__three = { THREE, renderer, scene, camera, gram, update };

const q = new URLSearchParams(location.search);
if (q.get('t') !== null) window.renderFrame(Math.round(parseFloat(q.get('t')) * TL.fps));
window.__ready = true;
