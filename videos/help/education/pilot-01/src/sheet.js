// Character / model sheet for Tally, rendered from the SAME rig used in the film.
import * as THREE from 'three';
import { createFigure } from './rig/figure.js';
import { PAL, buildClipFrame, buildDateTag, textCanvas } from './world.js';

const SW = 2400, SH = 1500;
for (const f of ['600 1em Inter', '800 1em Inter']) await document.fonts.load(f);

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(SW, SH, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setScissorTest(true);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight('#FFF4E0', '#20242E', 1.3));
const key = new THREE.DirectionalLight('#FFE6BF', 2.4); key.position.set(-3, 6, 5); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2 }); scene.add(key);
const rim = new THREE.DirectionalLight('#FFF2CC', 1.0); rim.position.set(2, 4, -5); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.95 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const TALLY_OPTS = { skin: '#8E5A3E', hair: '#22160F', coat: PAL.green, coatDark: PAL.greenDark, trousers: '#2B3140', shoe: '#14171D',
  accent: PAL.yellow, hat: 'bucket', hatColor: PAL.yellow, hatBand: PAL.greenDark, glasses: true, satchel: true, hairStyle: 'curls' };
const tally = createFigure(TALLY_OPTS);
scene.add(tally.root, tally.limbsGroup);
const courier = createFigure({ skin: '#6E4330', hair: '#1C1410', coat: '#E2D2B0', coatDark: '#C9B590', trousers: '#3A4152', hat: 'cap', hatColor: PAL.greenDark, hatBand: PAL.yellow, hairStyle: 'short', accent: PAL.greenDark, cheeks: '#9A5B45' });
const recipient = createFigure({ skin: '#A26B4C', hair: '#2A1B14', coat: '#C77C5A', coatDark: '#A9613F', trousers: '#4A3B36', hairStyle: 'bun', accent: PAL.cream, collar: PAL.yellow });
scene.add(courier.root, courier.limbsGroup, recipient.root, recipient.limbsGroup);
const rec = textCanvas(256, 96, (c, w, h) => { c.fillStyle = PAL.cream; c.font = '800 64px Inter'; c.textBaseline = 'middle'; c.fillText('REC', 6, h / 2); });
const endClip = textCanvas(64, 64, (c) => { c.fillStyle = '#151922'; c.fillRect(0, 0, 64, 64); });
const frame = buildClipFrame({ rec, endClip }); frame.scale.setScalar(0.55); scene.add(frame);
const dq = textCanvas(384, 300, (c, w, h) => { c.fillStyle = PAL.cream; c.fillRect(0, 0, w, h); c.fillStyle = PAL.ink; c.textAlign = 'center'; c.font = '800 92px Inter'; c.fillText('WHEN', w / 2, h * 0.45); });
const tag = buildDateTag({ dateQ: dq }); scene.add(tag);

const cam = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
function cell(x, y, w, h, setup) {
  // x,y from top-left in sheet pixels
  for (const o of [tally, courier, recipient]) { o.root.visible = false; o.limbsGroup.visible = false; }
  frame.visible = false; tag.visible = false;
  setup();
  cam.aspect = w / h; cam.updateProjectionMatrix();
  const vy = SH - y - h;
  renderer.setViewport(x, vy, w, h); renderer.setScissor(x, vy, w, h);
  renderer.setClearColor('#EFE8DA');
  renderer.clear();
  renderer.render(scene, cam);
}
function show(f) { f.root.visible = true; f.limbsGroup.visible = true; }
function look(pos, tgt, fov = 30) { cam.position.set(...pos); cam.fov = fov; cam.lookAt(...tgt); cam.updateProjectionMatrix(); }

const base = { handL: [-0.26, 0.1, 0.1], handR: [0.26, 0.1, 0.1], smile: 0.45 };
// Row 1: turnaround (full body)
const turn = [['Front', 0], ['3/4', -0.75], ['Side', -Math.PI / 2], ['Back', Math.PI]];
turn.forEach(([name, yaw], i) => cell(40 + i * 300, 150, 280, 560, () => { show(tally); tally.apply({ ...base, yaw }); look([0, 0.85, 4.6], [0, 0.72, 0], 22); }));
// Row 1 right: expressions (head close-ups)
const EX = [
  ['Neutral', { smile: 0.35 }],
  ['Curious', { browL: 0.9, browR: 0.2, headRoll: 0.14, lookX: -0.6, smile: 0.2 }],
  ['Asking', { browL: 1, browR: 1, mouthOpen: 0.6, smile: 0.1 }],
  ['Puzzled', { browTiltL: 0.45, browTiltR: 0.45, smile: -0.4, lookY: 0.8, headPitch: -0.2 }],
  ['Pleased', { smile: 0.8, browL: 0.4, browR: 0.4 }],
  ['Knowing', { smile: 0.6, browL: 0.15, browR: 0.55, headRoll: -0.1, lookX: 0.4 }],
];
EX.forEach(([name, p], i) => cell(1270 + (i % 3) * 370, 150 + Math.floor(i / 3) * 290, 350, 270, () => { show(tally); tally.apply({ ...base, ...p }); look([0.0, 1.17, 1.55], [0, 1.15, 0], 26); }));
// Row 2: action poses
const POSES = [
  ['Presents the frame', () => { frame.visible = true; frame.position.set(-0.55, 0.85, 0.15); frame.rotation.set(0, 0.25, 0); frame.updateMatrixWorld(true);
    const g = frame.localToWorld(new THREE.Vector3(0.43, -0.08, 0)); tally.apply({ ...base, yaw: -0.2, headYaw: -0.4, lookX: -0.8, browL: 0.7, handLWorld: [g.x, g.y, g.z], handR: [0.34, 0.38, 0.3], elbowPoleL: [-0.5, -0.6, 0.1] }); }],
  ['Points', () => tally.apply({ ...base, handL: [-0.5, 0.42, 0.34], headYaw: -0.7, lookX: -1, browL: 1, browR: 0.8, smile: 0.55, lean: 0.05 })],
  ['Tosses the tag', () => { tag.visible = true; tag.position.set(0.25, 1.45, 0.25); tag.rotation.set(0, 0, 0.8); tally.apply({ ...base, handR: [0.05, 0.75, 0.25], headPitch: -0.25, lookY: 0.6, browL: 0.9, squash: 0.03 }); }],
  ['Wonders', () => tally.apply({ ...base, handR: [0.11, 0.93, 0.03], headPitch: -0.6, headRoll: 0.12, browTiltL: 0.4, browTiltR: 0.4, smile: -0.35, lookY: 1 })],
  ['Opens arms', () => tally.apply({ ...base, handL: [-0.55, 0.78, 0.25], handR: [0.55, 0.78, 0.25], browL: 0.85, browR: 0.85, smile: 0.6 })],
];
POSES.forEach(([name, fn], i) => cell(40 + i * 330, 790, 310, 560, () => { show(tally); fn(); look([0.0, 0.95, 4.9], [-0.05, 0.78, 0], 23); }));
// Row 2 right: illustrative extras
cell(1720, 790, 300, 560, () => { show(courier); courier.apply({ ...base, yaw: 0.3, handL: [-0.13, 0.22, 0.36], handR: [0.13, 0.22, 0.36], smile: 0.5 }); look([0, 0.85, 4.6], [0, 0.72, 0], 22); });
cell(2060, 790, 300, 560, () => { show(recipient); recipient.apply({ ...base, yaw: -0.3, smile: 0.6 }); look([0, 0.85, 4.6], [0, 0.72, 0], 22); });

// labels
const L = (x, y, text, cls = '') => { const d = document.createElement('div'); d.className = 'lab ' + cls; d.style.left = x + 'px'; d.style.top = y + 'px'; d.textContent = text; document.getElementById('labels').appendChild(d); };
turn.forEach(([n], i) => L(40 + i * 300, 714, n));
EX.forEach(([n], i) => L(1270 + (i % 3) * 370, 150 + Math.floor(i / 3) * 290 + 272 - 34, n, 'in'));
POSES.forEach(([n], i) => L(40 + i * 330, 1354, n));
L(1720, 1354, 'Extra: courier (illustrative)'); L(2060, 1354, 'Extra: recipient (illustrative)');
window.__ready = true;
