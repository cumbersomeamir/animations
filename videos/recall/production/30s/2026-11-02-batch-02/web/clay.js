// Procedural clay surface: lumpy bump + fingerprint arcs + mottled albedo, all generated in code (no image assets).
import * as THREE from 'three';
import { rng } from './anim.js';

export const PAL = {
  lime: '#C7F36B',   // sampled from assets/icon.png
  paper: '#F8FAF3',  // sampled from assets/icon.png
  ink: '#20251B',    // sampled from assets/icon.png
  clayBody: '#F1F1E6',  // paper, warmed slightly so it reads as clay under light
  table: '#E3DFCD',
  inkClay: '#2A3023',
  steel: '#AEB5BA',     // functional material colour: steel
  water: '#8ED6C4',     // functional material colour: water (aqua leaning toward the lime family)
  sea: '#3C7A6C',
};

let cache = null;
export function clayTextures() {
  if (cache) return cache;
  const S = 512, R = rng(20261102);
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 320; i++) {
    const x = R() * S, y = R() * S, r = 6 + R() * 36, v = R() < 0.5 ? 255 : 0, a = 0.05 + R() * 0.09;
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
      const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r);
      gr.addColorStop(0, `rgba(${v},${v},${v},${a})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
      g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r);
    }
  }
  // fingerprint / tool arcs
  for (let k = 0; k < 9; k++) {
    const cx = R() * S, cy = R() * S, rot = R() * Math.PI * 2;
    for (let j = 0; j < 12; j++) {
      const rr = 5 + j * 3.1, v = j % 2 ? 255 : 0;
      g.strokeStyle = `rgba(${v},${v},${v},0.11)`; g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(cx, cy, rr * 1.45, rr, rot, 0.3, 2.7); g.stroke();
    }
  }
  const id = g.getImageData(0, 0, S, S);
  for (let i = 0; i < id.data.length; i += 4) {
    const n = (R() - 0.5) * 16; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n;
  }
  g.putImageData(id, 0, 0);
  const bump = new THREE.CanvasTexture(c);
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.colorSpace = THREE.NoColorSpace;

  // mottled albedo: same pattern squeezed to a narrow near-white range
  const c2 = document.createElement('canvas'); c2.width = c2.height = S;
  const g2 = c2.getContext('2d');
  const id2 = g2.createImageData(S, S);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = 236 + (id.data[i] - 128) * 0.16;
    id2.data[i] = id2.data[i + 1] = id2.data[i + 2] = v; id2.data[i + 3] = 255;
  }
  g2.putImageData(id2, 0, 0);
  const albedo = new THREE.CanvasTexture(c2);
  albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping; albedo.colorSpace = THREE.SRGBColorSpace;
  cache = { bump, albedo };
  return cache;
}

export function clayMat(color, { bump = 1.2, repeat = 2, rough = 0.78, env = 0.35 } = {}) {
  const { bump: b, albedo } = clayTextures();
  const bt = b.clone(); bt.repeat.set(repeat, repeat); bt.needsUpdate = true;
  const at = albedo.clone(); at.repeat.set(repeat, repeat); at.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, bumpMap: bt, bumpScale: bump, map: at, envMapIntensity: env });
}

export function steelMat() {
  const { bump } = clayTextures();
  const bt = bump.clone(); bt.repeat.set(3, 3); bt.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ color: PAL.steel, metalness: 0.88, roughness: 0.3, bumpMap: bt, bumpScale: 0.35, envMapIntensity: 1.25 });
}
