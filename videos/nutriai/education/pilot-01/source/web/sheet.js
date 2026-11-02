// sheet.js: renders Gram's model sheet (turnaround, expressions, poses, palette, specs) from the
// production rig in gram.js, so the sheet always matches the animated character.
import * as THREE from 'three';
import { createGram } from './gram.js';
import { COL } from './util.js';

const W = 2400, H = 1560;
for (const [fam, url, weight] of [['NDisplay', '../fonts/InterDisplay-Black.otf', '900'], ['NText', '../fonts/Inter-SemiBold.otf', '600'], ['NText', '../fonts/Inter-Bold.otf', '700']]) {
  const ff = new FontFace(fam, `url(${url})`, { weight });
  await ff.load();
  document.fonts.add(ff);
}
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setScissorTest(true);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const key = new THREE.DirectionalLight('#FFF1DE', 2.6);
key.position.set(2.5, 5, 6);
const rim = new THREE.DirectionalLight('#86DA3F', 1.4);
rim.position.set(-4, 4, -5);
scene.add(key, rim, new THREE.HemisphereLight('#3A4A3C', '#050806', 1.2));
const gram = createGram(THREE);
scene.add(gram.root);
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);

const cells = [];
const row = (y, h, items) => { const w = (W - 80) / items.length; items.forEach((it, i) => cells.push({ x: 40 + i * w, y, w, h, ...it })); };
const HANDS = { idle: [[-0.62, 0.24, 0.06], [0.62, 0.24, 0.06]] };
row(170, 430, [
  { label: 'Front', rotY: 0 }, { label: '3/4', rotY: 0.75 }, { label: 'Side', rotY: Math.PI / 2 }, { label: 'Back', rotY: Math.PI },
]);
const faceCam = { pos: [0, 0.78, 2.15], look: [0, 0.78, 0] };
row(640, 400, [
  { label: 'Neutral', face: { eyes: 'open', mouth: 'smile' }, cam: faceCam },
  { label: 'Curious', face: { eyes: 'open', brows: 'curious', mouth: 'smirk', look: [0.6, 0.2] }, cam: faceCam },
  { label: 'Surprised', face: { eyes: 'wide', brows: 'up', mouth: 'o', open: 0.9, look: [0, 0.5] }, cam: faceCam },
  { label: 'Delighted', face: { eyes: 'happy', mouth: 'grin', open: 0.7, blush: 0.8 }, cam: faceCam },
  { label: 'Determined', face: { eyes: 'squint', brows: 'determined', mouth: 'flat' }, cam: faceCam },
  { label: 'Wink', face: { eyes: 'wink', mouth: 'grin', open: 0.6, blush: 0.6 }, cam: faceCam },
]);
row(1080, 440, [
  { label: 'Point', rotY: 0.35, hands: [[-0.62, 0.3, 0.1], [0.95, 0.72, 0.3]], face: { eyes: 'open', look: [0.9, 0.4], mouth: 'smile' } },
  { label: 'Chop (anticipation)', rotY: 0.5, lean: -10, crouch: 0.2, hands: [[-0.62, 0.55, 0.1], [0.32, 1.3, 0.1]], face: { eyes: 'squint', brows: 'determined', mouth: 'flat' } },
  { label: 'Launched', py: 0.25, hands: [[-0.6, 1.1, 0.2], [0.6, 1.0, 0.2]], feet: [[0, 0.1, 0.12], [0, -0.1, 0.18]], face: { eyes: 'wide', brows: 'up', mouth: 'o', open: 1 } },
  { label: 'Stomp', crouch: 0.0, squash: 0.25, hands: [[-0.58, 0.35, 0.2], [0.58, 0.35, 0.2]], face: { eyes: 'happy', mouth: 'grin', open: 0.8 } },
  { label: 'Inspect', rotY: 0.55, hands: [[-0.6, 0.28, 0.1], [0.42, 0.86, 0.5]], face: { eyes: 'squint', brows: 'curious', mouth: 'flat', look: [0.9, 0.7] } },
  { label: 'Thumbs-up', rotY: 0.2, hands: [[-0.62, 0.3, 0.1], [0.66, 0.82, 0.4]], face: { eyes: 'wink', mouth: 'grin', open: 0.6, blush: 0.6 } },
]);

for (const c of cells) {
  gram.pose({ rotY: c.rotY ?? 0, y: c.py ?? 0, lean: c.lean ?? 0, crouch: c.crouch ?? 0, squash: c.squash ?? 0, hands: c.hands || HANDS.idle, feet: c.feet });
  gram.face(c.face || { eyes: 'open', mouth: 'smile' });
  const cp = c.cam || { pos: [0, 0.95, 5.0], look: [0, 0.82, 0] };
  cam.aspect = c.w / c.h;
  cam.fov = c.cam ? 30 : 30;
  cam.position.set(...cp.pos);
  cam.lookAt(...cp.look);
  cam.updateProjectionMatrix();
  const vy = H - c.y - c.h;
  renderer.setViewport(c.x + 6, vy, c.w - 12, c.h);
  renderer.setScissor(c.x + 6, vy, c.w - 12, c.h);
  renderer.setClearColor('#0E1511');
  renderer.clear();
  renderer.render(scene, cam);
}

// compose labels in 2D
const out = document.createElement('canvas');
out.width = W; out.height = H;
const g = out.getContext('2d');
g.fillStyle = '#050806'; g.fillRect(0, 0, W, H);
g.drawImage(renderer.domElement, 0, 0);
g.fillStyle = COL.mist; g.font = '900 64px NDisplay'; g.fillText('GRAM', 40, 92);
g.fillStyle = COL.lime; g.font = '700 30px NText'; g.fillText('NutriAI education performer · model sheet v1 · a living 100 g calibration weight', 270, 90);
g.fillStyle = 'rgba(237,246,229,0.8)'; g.font = '600 24px NText';
g.fillText('Height ≈ 1.51 u (body + knob 1.21, legs 0.30) · lathe-turned body, clearcoat leaf green', 40, 128);
g.fillText('"100 g" engraved on the belly · ink limbs, mist gloves, leaf-dark shoes', 40, 156);
const sw = [['ink', COL.ink], ['leaf', COL.leaf], ['green', COL.green], ['lime', COL.lime], ['leaf-dark', COL.leafDark], ['mist', COL.mist]];
sw.forEach(([n, c], i) => { const x = W - 760 + i * 122; g.fillStyle = c; g.fillRect(x, 40, 54, 54); g.strokeStyle = '#2A332C'; g.strokeRect(x, 40, 54, 54); g.fillStyle = 'rgba(237,246,229,0.85)'; g.font = '600 18px NText'; g.fillText(n, x, 118); g.fillText(c.toUpperCase(), x, 140); });
for (const c of cells) { g.fillStyle = COL.lime; g.font = '700 26px NText'; g.fillText(c.label, c.x + 18, c.y + 36); }
g.fillStyle = 'rgba(237,246,229,0.75)'; g.font = '600 22px NText';
g.fillText('Voice: Piper TTS en_US-ljspeech-high (LJ Speech, public domain) pitch ×1.14 with preserved formants: original synthetic voice, no imitation of any actor or character. Palette sampled from the NutriAI icon.', 40, H - 20);
window.__sheet = out.toDataURL('image/png');
window.__ready = true;
