// Tactile tabletop set: ink backdrop, clay table, Kip's step, glass tank with water, toy-ship diorama, lights.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PAL, clayMat, steelMat } from './clay.js';
import { TANK, HULL, taperAt } from './physics.js';

const rbox = (w, h, d, r = 0.02, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);

export function buildSet(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  // backdrop: unlit radial pool of light on ink
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(256, 470, 30, 256, 520, 620);
  gr.addColorStop(0, '#3D4734'); gr.addColorStop(0.45, '#262D20'); gr.addColorStop(1, '#14180F');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  const bgTex = new THREE.CanvasTexture(c); bgTex.colorSpace = THREE.SRGBColorSpace;
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(9, 18), new THREE.MeshBasicMaterial({ map: bgTex }));
  bg.position.set(0, 2.2, -3.2); scene.add(bg);

  // table
  const table = new THREE.Mesh(rbox(4.2, 0.5, 2.8, 0.06), clayMat(PAL.table, { bump: 1.6, repeat: 5, rough: 0.85 }));
  table.position.set(0, -0.25, 0.5); table.receiveShadow = true; scene.add(table);

  // Kip's step (behind tank)
  const step = new THREE.Mesh(rbox(0.74, 0.62, 0.38, 0.05), clayMat(PAL.inkClay, { bump: 1.4, repeat: 2 }));
  step.position.set(0.12, 0.31, -0.46); step.castShadow = step.receiveShadow = true; scene.add(step);

  // tank frame
  const inkM = clayMat(PAL.ink, { bump: 0.9, repeat: 3, rough: 0.55 });
  const tank = new THREE.Group(); scene.add(tank);
  const W = TANK.x1 - TANK.x0, Dp = TANK.z1 - TANK.z0, Ht = TANK.top;
  const base = new THREE.Mesh(rbox(W + 0.1, 0.05, Dp + 0.1, 0.02), inkM); base.position.y = 0.012;
  base.castShadow = base.receiveShadow = true; tank.add(base);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const post = new THREE.Mesh(rbox(0.04, Ht, 0.04, 0.012), inkM);
    post.position.set(sx * (W / 2 + 0.015), Ht / 2, sz * (Dp / 2 + 0.015)); post.castShadow = true; tank.add(post);
  }
  for (const sz of [-1, 1]) {
    const bar = new THREE.Mesh(rbox(W + 0.07, 0.03, 0.035, 0.01), inkM); bar.position.set(0, Ht, sz * (Dp / 2 + 0.015)); bar.castShadow = true; tank.add(bar);
  }
  for (const sx of [-1, 1]) {
    const bar = new THREE.Mesh(rbox(0.035, 0.03, Dp + 0.07, 0.01), inkM); bar.position.set(sx * (W / 2 + 0.015), Ht, 0); bar.castShadow = true; tank.add(bar);
  }
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#F4FFFB', transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
  const panes = [
    [W, Ht - 0.03, [0, Ht / 2 + 0.01, TANK.z1 + 0.006], 0, 9],
    [Dp, Ht - 0.03, [TANK.x0 - 0.006, Ht / 2 + 0.01, 0], Math.PI / 2, 1],
    [Dp, Ht - 0.03, [TANK.x1 + 0.006, Ht / 2 + 0.01, 0], Math.PI / 2, 1],
  ];
  // opaque backing card: hides Kip's step and gives the water a dark, readable ground
  const backing = new THREE.Mesh(rbox(W + 0.02, Ht - 0.02, 0.014, 0.006), clayMat('#23352F', { bump: 1.0, repeat: 3, rough: 0.8 }));
  backing.position.set(0, Ht / 2 + 0.01, TANK.z0 - 0.012); backing.receiveShadow = true; tank.add(backing);
  for (const [w, h, p, ry, ro] of panes) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassM); m.position.set(...p); m.rotation.y = ry; m.renderOrder = ro; tank.add(m);
  }

  // water: volume without top face + rippling surface that excludes the hull footprint
  const waterSide = new THREE.MeshStandardMaterial({ color: PAL.water, transparent: true, opacity: 0.42, roughness: 0.12, metalness: 0, depthWrite: false, envMapIntensity: 0.8 });
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const vol = new THREE.Mesh(new THREE.BoxGeometry(W - 0.002, 1, Dp - 0.002), [waterSide, waterSide, hidden, waterSide, waterSide, waterSide]);
  vol.renderOrder = 2; scene.add(vol);
  const surfGeo = new THREE.PlaneGeometry(W - 0.004, Dp - 0.004, 160, 50); surfGeo.rotateX(-Math.PI / 2);
  const surfBase = surfGeo.attributes.position.array.slice();
  const surfMat = new THREE.MeshStandardMaterial({ color: '#B5EBDD', transparent: true, opacity: 0.6, roughness: 0.06, metalness: 0, envMapIntensity: 1.5, depthWrite: false, side: THREE.DoubleSide });
  const hullU = { uHull: { value: new THREE.Vector4(0, 0, 0, 0) }, uHullP: { value: new THREE.Vector3(HULL.a, HULL.b, HULL.n) }, uTaper: { value: HULL.taper } };
  surfMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, hullU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
varying vec3 vWP; uniform vec4 uHull; uniform vec3 uHullP; uniform float uTaper;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
if (uHull.w > 0.5) {
  float xn = (vWP.x - uHull.x) / uHullP.x;
  float tz = 1.0 - uTaper * pow(max(0.0, xn), 2.4);
  float zn = (vWP.z - uHull.z) / (uHullP.y * tz);
  float q = pow(pow(abs(xn), uHullP.z) + pow(abs(zn), uHullP.z), 1.0 / uHullP.z);
  if (q < 1.0 + uHull.y) discard;
}`);
  };
  const surf = new THREE.Mesh(surfGeo, surfMat); surf.renderOrder = 4; scene.add(surf);

  const water = {
    vol, surf, surfMat, hullU,
    set(level, ripples, time, hull) {
      vol.scale.y = level - TANK.floor; vol.position.set(0, (level + TANK.floor) / 2, 0);
      surf.position.set(0, level, 0);
      const p = surfGeo.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = surfBase[i], z = surfBase[i + 2];
        let y = 0.0016 * Math.sin(7 * x + 1.7 * time) + 0.0012 * Math.sin(11 * z - 2.3 * time + 1.3 * x);
        for (const r of ripples) {
          if (r.age < 0) continue;
          const d = Math.hypot(x - r.x, (z - r.z) * 1.0);
          const front = r.age * 0.9;
          const env = Math.exp(-3.2 * r.age) * Math.exp(-Math.pow((d - front) / 0.09, 2));
          y += r.amp * env * Math.cos(38 * (d - front));
        }
        p[i + 1] = y;
      }
      surfGeo.attributes.position.needsUpdate = true; surfGeo.computeVertexNormals();
      if (hull) hullU.uHull.value.set(hull.x, -0.004, hull.z, 1); else hullU.uHull.value.set(0, 0, 0, 0);
    },
  };

  // toy-ship diorama on a shelf, back left (the "steel ships float" puzzle)
  const dio = new THREE.Group(); dio.position.set(-0.42, 1.06, -1.4); scene.add(dio);
  const shelf = new THREE.Mesh(rbox(1.05, 0.07, 0.42, 0.025), clayMat(PAL.inkClay, { bump: 1.2 })); shelf.receiveShadow = true; dio.add(shelf);
  const waves = [];
  const seaCols = ['#2B5A50', PAL.sea, '#529A88'];
  for (let k = 0; k < 3; k++) {
    const s = new THREE.Shape();
    const w = 1.0, h = 0.06 + 0.02 * k;
    s.moveTo(-w / 2, 0);
    for (let i = 0; i <= 40; i++) { const x = -w / 2 + w * i / 40; s.lineTo(x, h + 0.016 * Math.sin(i / 40 * Math.PI * 6 + k)); }
    s.lineTo(w / 2, 0); s.lineTo(-w / 2, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3 });
    const m = new THREE.Mesh(geo, clayMat(seaCols[k], { bump: 1.0, repeat: 3, rough: 0.6 }));
    m.position.set(0, 0.035, -0.15 + k * 0.12); m.castShadow = true; m.receiveShadow = true;
    dio.add(m); waves.push(m);
  }
  const ship = new THREE.Group();
  const sh = new THREE.Mesh(rbox(0.46, 0.09, 0.12, 0.03), steelMat()); sh.castShadow = true;
  const stripe = new THREE.Mesh(rbox(0.465, 0.02, 0.125, 0.008), clayMat(PAL.ink, { bump: 0.4 })); stripe.position.y = -0.03;
  const cabin = new THREE.Mesh(rbox(0.13, 0.08, 0.09, 0.015), clayMat(PAL.paper, { bump: 0.7 })); cabin.position.set(-0.08, 0.08, 0); cabin.castShadow = true;
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.09, 16), clayMat(PAL.ink, { bump: 0.4 })); funnel.position.set(0.04, 0.09, 0);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0235, 0.0235, 0.022, 16), clayMat(PAL.lime, { bump: 0.4 })); band.position.set(0.04, 0.115, 0);
  ship.add(sh, stripe, cabin, funnel, band);
  ship.position.set(0.05, 0.13, -0.04);
  dio.add(ship);
  const puff = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), new THREE.MeshBasicMaterial({ color: '#F8FAF3', transparent: true, opacity: 0, depthWrite: false }));
  dio.add(puff);
  const diorama = {
    group: dio, ship, waves, puff,
    update(t, toot) {
      ship.position.y = 0.13 + 0.012 * Math.sin(2 * Math.PI * 0.55 * t);
      ship.rotation.z = 0.06 * Math.sin(2 * Math.PI * 0.45 * t + 1.1);
      ship.position.x = 0.05 + 0.03 * Math.sin(2 * Math.PI * 0.12 * t);
      waves.forEach((w, k) => { w.position.x = 0.02 * Math.sin(2 * Math.PI * 0.3 * t + k * 1.7); });
      // steam puff on the toot
      const a = toot;
      puff.material.opacity = a > 0 && a < 1 ? 0.8 * (1 - a) : 0;
      puff.position.set(ship.position.x + 0.04, 0.27 + 0.12 * a, -0.04);
      puff.scale.setScalar(0.6 + 1.6 * a);
    },
  };

  // lights
  const hemi = new THREE.HemisphereLight('#F3F7EA', '#3A3F33', 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight('#FFF6E6', 2.6);
  key.position.set(-1.6, 3.2, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  Object.assign(key.shadow.camera, { left: -1.8, right: 1.8, top: 2.2, bottom: -1.2, near: 0.5, far: 8 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E8FFD0', 1.1); rim.position.set(1.8, 2.0, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#DDEBFF', 0.35); fill.position.set(2.5, 1.0, 3); scene.add(fill);

  return { water, diorama, tank, step };
}

export { taperAt };
