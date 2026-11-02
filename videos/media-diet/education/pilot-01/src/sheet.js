// Character/model sheet for Nodo, rendered from the same rig used in the film.
import * as THREE from 'three';
import { makeRenderer, toon, addLights } from './common.js';
import { createNodo, POSES } from './nodo.js';
import { PAL } from './palette.js';

const W = 1920, H = 1240;
const { renderer, effect, overlay } = makeRenderer(W, H);
const scene = new THREE.Scene();
scene.background = null;
addLights(scene);

const cells = [];
const TOP = 96;
const rowA = { y: TOP, h: 500 }, rowB = { y: TOP + 500, h: 310 }, rowC = { y: TOP + 810, h: H - TOP - 810 };
const colW = W / 5;
let slot = 0;
function cell(row, col, label, poseName, rotY, camCfg, extra = {}) {
  const x0 = slot++ * 12;
  const n = createNodo(toon);
  n.root.position.set(x0, 0, 0);
  n.root.rotation.y = rotY;
  n.apply({ ...POSES[poseName], ...extra });
  scene.add(n.root);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: PAL.deepBlue }));
  disc.material.userData.outlineParameters = { visible: false };
  disc.rotation.x = -Math.PI / 2; disc.position.set(x0, 0.002, 0); scene.add(disc);
  const cam = new THREE.PerspectiveCamera(camCfg.fov, colW / row.h, 0.1, 100);
  cam.position.set(x0 + camCfg.pos[0], camCfg.pos[1], camCfg.pos[2]);
  cam.lookAt(x0 + camCfg.look[0], camCfg.look[1], camCfg.look[2]);
  cells.push({ cam, x: col * colW, y: row.y, w: colW, h: row.h });
  const lab = document.createElement('div');
  lab.innerHTML = `<span style="background:rgba(3,6,34,0.85);padding:4px 14px;border-radius:10px">${label}</span>`;
  Object.assign(lab.style, { position: 'absolute', left: col * colW + 'px', top: (row.y + row.h - 42) + 'px', width: colW + 'px', textAlign: 'center',
    font: '600 22px Inter', color: '#cfd3ff', letterSpacing: '0.04em' });
  overlay.appendChild(lab);
}

const full = { fov: 30, pos: [0, 1.45, 6.6], look: [0, 1.25, 0] };
const head = { fov: 22, pos: [0, 2.0, 3.1], look: [0, 1.95, 0] };
const act = { fov: 30, pos: [1.2, 1.5, 6.4], look: [0, 1.15, 0] };
cell(rowA, 0, 'FRONT', 'idle', 0, full);
cell(rowA, 1, '3/4', 'idle', 0.65, full);
cell(rowA, 2, 'SIDE', 'idle', Math.PI / 2, full);
cell(rowA, 3, '3/4 BACK', 'idle', Math.PI * 0.8, full);
cell(rowA, 4, 'BACK · cable reel', 'idle', Math.PI, full);
cell(rowB, 0, 'neutral', 'idle', 0, head, { mouth: 0, smile: 0.55 });
cell(rowB, 1, 'curious', 'puzzled', 0, head, { headX: -0.1, shRx: 0.05, elR: -0.25, shLz: 0.14, elL: -0.25 });
cell(rowB, 2, 'nope', 'nope', 0, head, { shRx: 0.05, elR: -0.25 });
cell(rowB, 3, 'whoa!', 'yanked', 0, head, { headX: 0, shLx: 0.05, shRx: 0.05 });
cell(rowB, 4, 'got it', 'thumbsUp', 0, head, { headZ: -0.08 });
cell(rowC, 0, 'stomp (send)', 'stompUp', 0.5, act);
cell(rowC, 1, 'inspect (headlamp)', 'inspect', 0.4, act);
cell(rowC, 2, 'packet surf', 'surf', 0.9, act);
cell(rowC, 3, 'point', 'pointUp', 0.5, act);
cell(rowC, 4, 'thumbs up', 'thumbsUp', 0.3, act);

const title = document.createElement('div');
title.innerHTML = '<span style="color:#2addfa">NODO</span> &nbsp;·&nbsp; model sheet &nbsp;<span style="font:500 22px Inter;color:#9aa0d8">Media Diet educational series · original character · three.js primitives · palette sampled from app icon</span>';
Object.assign(title.style, { position: 'absolute', left: '40px', top: '26px', font: '700 44px "Space Grotesk"', color: '#f4f6ff' });
overlay.appendChild(title);

renderer.setScissorTest(true);
for (const c of cells) {
  const y = H - c.y - c.h;
  renderer.setViewport(c.x, y, c.w, c.h); renderer.setScissor(c.x, y, c.w, c.h);
  renderer.setClearColor(c.y === TOP ? '#070b33' : '#050828'); renderer.clear();
  effect.render(scene, c.cam);
}
window.__ready = true;
