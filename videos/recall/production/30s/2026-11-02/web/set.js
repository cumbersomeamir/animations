// Knowledge-challenge set: sunburst home stage (ink + lime), clay table, two-chamber challenge tank with a lime
// cabinet frame (the frame-within-the-frame), podium labels, two water bodies, lights.
// Water/glass/lighting code adapted from education/pilot-01/web/set.js.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PAL, clayMat } from './clay.js';
import { TANK, CH, HULL } from './physics.js';

const rbox = (w, h, d, r = 0.02, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);
export const TABLE_Y = -0.06;

function labelTexture(text, w = 512, h = 128) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = PAL.ink; g.fillRect(0, 0, w, h);
  g.font = `400 ${Math.round(h * 0.62)}px "Titan One"`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = PAL.lime; g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function buildSet(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  // --- sunburst backdrop (home stage), ink rays with a soft lime glow; rotates and pulses on the beat
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#1C2116'; g.fillRect(0, 0, 1024, 1024);
  const rays = 22;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2, a1 = a0 + Math.PI / rays;
    g.beginPath(); g.moveTo(512, 512); g.arc(512, 512, 760, a0, a1); g.closePath();
    g.fillStyle = i % 2 ? '#262E1E' : '#2C3623'; g.fill();
  }
  const glow = g.createRadialGradient(512, 512, 10, 512, 512, 520);
  glow.addColorStop(0, 'rgba(199,243,107,0.30)'); glow.addColorStop(0.35, 'rgba(199,243,107,0.08)'); glow.addColorStop(1, 'rgba(10,12,8,0.55)');
  g.fillStyle = glow; g.fillRect(0, 0, 1024, 1024);
  const sunTex = new THREE.CanvasTexture(c); sunTex.colorSpace = THREE.SRGBColorSpace;
  const sunMat = new THREE.MeshBasicMaterial({ map: sunTex, color: '#FFFFFF' });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(7.5, 96), sunMat);
  sun.position.set(0, 1.05, -3.4); scene.add(sun);

  // --- table
  const table = new THREE.Mesh(rbox(4.6, 0.5, 2.8, 0.06), clayMat('#E7E4D3', { bump: 1.6, repeat: 5, rough: 0.85 }));
  table.position.set(0, TABLE_Y - 0.25, 0.5); table.receiveShadow = true; scene.add(table);

  // Kip's step (hidden behind the backing card)
  const step = new THREE.Mesh(rbox(0.6, 0.3, 0.32, 0.04), clayMat(PAL.inkClay, { bump: 1.2 }));
  step.position.set(0, TABLE_Y + 0.15, -0.44); scene.add(step);

  // --- challenge tank
  const lime = clayMat(PAL.lime, { bump: 0.9, repeat: 3, rough: 0.6 });
  const inkM = clayMat(PAL.ink, { bump: 0.9, repeat: 3, rough: 0.55 });
  const tank = new THREE.Group(); scene.add(tank);
  const W = TANK.x1 - TANK.x0, Dp = TANK.z1 - TANK.z0, Ht = TANK.top - TANK.floor;
  // podium base with labels
  const baseH = TANK.floor - TABLE_Y;
  const base = new THREE.Mesh(rbox(W + 0.12, baseH, Dp + 0.12, 0.025), inkM);
  base.position.set(0, TABLE_Y + baseH / 2, 0); base.castShadow = base.receiveShadow = true; tank.add(base);
  for (const ch of CH) {
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.075), new THREE.MeshBasicMaterial({ map: labelTexture(ch.name.toUpperCase()), toneMapped: false }));
    pl.position.set(ch.cx, TABLE_Y + baseH / 2, TANK.z1 + 0.061); tank.add(pl);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const post = new THREE.Mesh(rbox(0.045, Ht + 0.02, 0.045, 0.014), lime);
    post.position.set(sx * (W / 2 + 0.018), TANK.floor + Ht / 2, sz * (Dp / 2 + 0.018)); post.castShadow = true; tank.add(post);
  }
  for (const sz of [-1, 1]) {
    const bar = new THREE.Mesh(rbox(W + 0.08, 0.035, 0.04, 0.012), lime); bar.position.set(0, TANK.top, sz * (Dp / 2 + 0.018)); bar.castShadow = true; tank.add(bar);
  }
  for (const sx of [-1, 0, 1]) {
    const bar = new THREE.Mesh(rbox(0.04, 0.035, Dp + 0.08, 0.012), lime); bar.position.set(sx * (W / 2 + 0.018), TANK.top, 0); bar.castShadow = true; tank.add(bar);
  }
  const backing = new THREE.Mesh(rbox(W + 0.03, Ht, 0.014, 0.006), clayMat('#23352F', { bump: 1.0, repeat: 3, rough: 0.8 }));
  backing.position.set(0, TANK.floor + Ht / 2, TANK.z0 - 0.012); backing.receiveShadow = true; tank.add(backing);
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#F4FFFB', transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
  const panes = [
    [W, Ht, [0, TANK.floor + Ht / 2, TANK.z1 + 0.006], 0, 9],
    [Dp, Ht, [TANK.x0 - 0.006, TANK.floor + Ht / 2, 0], Math.PI / 2, 1],
    [Dp, Ht, [TANK.x1 + 0.006, TANK.floor + Ht / 2, 0], Math.PI / 2, 1],
    [Dp, Ht, [0, TANK.floor + Ht / 2, 0], Math.PI / 2, 1],   // divider
  ];
  for (const [w, h, p, ry, ro] of panes) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassM); m.position.set(...p); m.rotation.y = ry; m.renderOrder = ro; tank.add(m);
  }

  // --- water bodies (one per chamber); the ship chamber's surface excludes the hull footprint while afloat
  const waters = CH.map((ch, idx) => makeWater(scene, ch, idx === 1));

  // --- lights
  scene.add(new THREE.HemisphereLight('#F3F7EA', '#3A3F33', 0.9));
  const key = new THREE.DirectionalLight('#FFF6E6', 2.6);
  key.position.set(-1.6, 3.2, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 3; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.012;
  Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 1.8, bottom: -0.6, near: 0.5, far: 8 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E8FFD0', 1.1); rim.position.set(1.8, 2.0, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#DDEBFF', 0.35); fill.position.set(2.5, 1.0, 3); scene.add(fill);

  return { waters, tank, step, sun, sunMat };
}

function makeWater(scene, ch, withHole) {
  const W = ch.x1 - ch.x0 - 0.002, Dp = TANK.z1 - TANK.z0 - 0.002;
  const side = new THREE.MeshStandardMaterial({ color: PAL.water, transparent: true, opacity: 0.42, roughness: 0.12, metalness: 0, depthWrite: false, envMapIntensity: 0.8 });
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  const vol = new THREE.Mesh(new THREE.BoxGeometry(W, 1, Dp), [side, side, hidden, side, side, side]);
  vol.renderOrder = 2; scene.add(vol);
  const geo = new THREE.PlaneGeometry(W - 0.002, Dp - 0.002, 90, 34); geo.rotateX(-Math.PI / 2);
  const basePos = geo.attributes.position.array.slice();
  const mat = new THREE.MeshStandardMaterial({ color: '#B5EBDD', transparent: true, opacity: 0.6, roughness: 0.06, metalness: 0, envMapIntensity: 1.5, depthWrite: false, side: THREE.DoubleSide });
  const U = { uHull: { value: new THREE.Vector4(0, 0, 0, 0) }, uHullP: { value: new THREE.Vector3(HULL.a, HULL.b, HULL.n) }, uTaper: { value: HULL.taper } };
  if (withHole) {
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
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
  }
  const surf = new THREE.Mesh(geo, mat); surf.renderOrder = 4; scene.add(surf);
  return {
    vol, surf,
    set(level, ripples, time, hull) {
      vol.scale.y = level - TANK.floor; vol.position.set(ch.cx, (level + TANK.floor) / 2, 0);
      surf.position.set(ch.cx, level, 0);
      const p = geo.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        const x = basePos[i] + ch.cx, z = basePos[i + 2];
        let y = 0.0014 * Math.sin(9 * x + 1.7 * time) + 0.001 * Math.sin(13 * z - 2.3 * time + 1.3 * x);
        for (const r of ripples) {
          if (r.age < 0 || r.age > 2.5) continue;
          const d = Math.hypot(x - r.x, z - r.z), front = r.age * 0.8;
          y += r.amp * Math.exp(-3.4 * r.age) * Math.exp(-Math.pow((d - front) / 0.07, 2)) * Math.cos(44 * (d - front));
        }
        p[i + 1] = y;
      }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
      if (hull) U.uHull.value.set(hull.x, -0.004, hull.z, 1); else U.uHull.value.set(0, 0, 0, 0);
    },
  };
}
