// Home stage (reused from production 30s-01): sunburst backdrop, clay table, lights + environment.
// The challenge prop for this episode (the kilogram balance) lives in balance.js.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clayMat } from './clay.js';

export const rbox = (w, h, d, r = 0.02, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);

export function buildSet(scene, renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

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

  const table = new THREE.Mesh(rbox(4.6, 0.5, 2.8, 0.06), clayMat('#E7E4D3', { bump: 1.6, repeat: 5, rough: 0.85 }));
  table.position.set(0, -0.25, 0.5); table.receiveShadow = true; scene.add(table);

  scene.add(new THREE.HemisphereLight('#F3F7EA', '#3A3F33', 0.9));
  const key = new THREE.DirectionalLight('#FFF6E6', 2.6);
  key.position.set(-1.6, 3.2, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 3; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.012;
  Object.assign(key.shadow.camera, { left: -1.4, right: 1.4, top: 1.8, bottom: -0.6, near: 0.5, far: 8 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E8FFD0', 1.1); rim.position.set(1.8, 2.0, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#DDEBFF', 0.35); fill.position.set(2.5, 1.0, 3); scene.add(fill);
  return { sun, sunMat };
}
