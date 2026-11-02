import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { PAL } from './palette.js';

export function makeRenderer(w, h) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.getElementById('stage').appendChild(renderer.domElement);
  const overlay = document.getElementById('overlay');
  overlay.style.width = w + 'px'; overlay.style.height = h + 'px';
  const effect = new OutlineEffect(renderer, { defaultThickness: 0.0042, defaultColor: [0.02, 0.025, 0.12], defaultAlpha: 1 });
  return { renderer, effect, overlay };
}

// Three-band toon ramp shared by all materials.
const ramp = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  t.minFilter = THREE.NearestFilter; t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const cache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!opts.unique && cache.has(key)) return cache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...opts.mat });
  if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.emissiveIntensity ?? 0.5; }
  if (!opts.unique) cache.set(key, m);
  return m;
}

export function addLights(scene) {
  const hemi = new THREE.HemisphereLight('#b9a6ff', '#0a0c35', 1.35); scene.add(hemi);
  const key = new THREE.DirectionalLight('#ffffff', 2.1); key.position.set(4, 7, 6); scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(PAL.cyan, 1.6); rim.position.set(-5, 3, -6); scene.add(rim); scene.add(rim.target);
  return { hemi, key, rim };
}
