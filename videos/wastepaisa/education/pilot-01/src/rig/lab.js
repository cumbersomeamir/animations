// Material dissection lab: reusable stage for the "Hidden materials" series.
// Dark roasted-brown backdrop, cutting-mat table, warm key light, cool rim
// light, background shelf of jars with sorted materials, facility cut-outs.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { rng } from '../lib/anim.js';

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export function createLab(renderer, shadowSize = 2048) {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // Image-based reflections only where they matter (metal, film, glass): see applyEnv()
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // backdrop gradient
  scene.background = canvasTex(64, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#120c09'); gr.addColorStop(0.55, '#2a1c14'); gr.addColorStop(1, '#1a120d');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });

  // back wall with soft pool of light + faint pegboard dots
  const wallTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#2a1c13'; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(w * 0.5, h * 0.62, 20, w * 0.5, h * 0.62, w * 0.55);
    gr.addColorStop(0, 'rgba(140,92,52,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (let y = 16; y < h; y += 32) for (let x = 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
  });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), new THREE.MeshLambertMaterial({ map: wallTex }));
  wall.position.set(0, 4.5, -5.5); scene.add(wall);

  // cutting-mat table
  const matTex = canvasTex(2048, 2048, (g, w, h) => {
    g.fillStyle = '#2b2019'; g.fillRect(0, 0, w, h);
    const r = rng(11);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.08})`; g.fillRect(r() * w, r() * h, 2, 2); }
    for (let i = 0; i <= w; i += 64) {
      const major = i % 256 === 0;
      g.strokeStyle = major ? 'rgba(246,231,206,0.16)' : 'rgba(246,231,206,0.07)';
      g.lineWidth = major ? 3 : 1.5;
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke();
    }
    g.strokeStyle = 'rgba(238,122,30,0.30)'; g.lineWidth = 4;
    g.beginPath(); g.arc(w / 2, h / 2, 300, 0, Math.PI * 2); g.stroke();
    g.setLineDash([18, 14]); g.beginPath(); g.moveTo(w / 2 - 460, h / 2); g.lineTo(w / 2 + 460, h / 2); g.stroke(); g.setLineDash([]);
  });
  matTex.wrapS = matTex.wrapT = THREE.RepeatWrapping;
  const table = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshLambertMaterial({ map: matTex }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);

  // background shelf with jars of sorted materials (series set dressing)
  const shelf = new THREE.Group(); shelf.position.set(0, -0.55, -4.4); scene.add(shelf);
  const plank = new THREE.Mesh(new THREE.BoxGeometry(9, 0.12, 0.8), new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 0.8 }));
  plank.position.y = 2.15; plank.receiveShadow = true; shelf.add(plank);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe3e6, roughness: 0.1, transparent: true, opacity: 0.22, clearcoat: 1, depthWrite: false });
  const contents = [0xf2e3c8, 0xee7a1e, 0xb8bec5, 0x2c8a4e, 0xa8743f, 0xd9d2c4, 0xc47a42];
  const r = rng(5);
  for (let i = 0; i < 7; i++) {
    const x = -3.6 + i * 1.2 + (r() - 0.5) * 0.2;
    const hgt = 0.6 + r() * 0.35, rad = 0.26 + r() * 0.06;
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, hgt, 32, 1, true), glass);
    jar.position.set(x, 2.21 + hgt / 2, 0); shelf.add(jar);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(rad * 1.04, rad * 1.04, 0.07, 32), new THREE.MeshStandardMaterial({ color: 0x8e959d, metalness: 0.8, roughness: 0.35 }));
    lid.position.set(x, 2.21 + hgt + 0.035, 0); shelf.add(lid);
    const fill = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.92, rad * 0.92, hgt * (0.45 + r() * 0.35), 24), new THREE.MeshStandardMaterial({ color: contents[i], roughness: 0.7, metalness: i === 2 || i === 6 ? 0.7 : 0 }));
    fill.position.set(x, 2.21 + fill.geometry.parameters.height / 2, 0); shelf.add(fill);
  }
  // lower bench items: a spool of copper wire and a stack of card
  const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.36, 32), new THREE.MeshStandardMaterial({ color: 0xc47a42, metalness: 0.85, roughness: 0.35 }));
  spool.position.set(2.7, 0.18, -2.4); spool.castShadow = true; scene.add(spool);
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.7), new THREE.MeshStandardMaterial({ color: 0xa8743f, roughness: 0.9 }));
  card.position.set(-2.8, 0.09, -2.2); card.rotation.y = 0.3; card.castShadow = true; card.receiveShadow = true; scene.add(card);

  // lights
  const hemi = new THREE.HemisphereLight(0xfff1de, 0x2a1a10, 1.25); scene.add(hemi);
  const amb = new THREE.AmbientLight(0xfff4e6, 0.45); scene.add(amb);
  const key = new THREE.SpotLight(0xffe2b8, 95, 22, 0.55, 0.65, 1.6);
  key.position.set(-2.6, 7.2, 4.4); key.target.position.set(0, 0.6, 0);
  key.castShadow = true; key.shadow.mapSize.set(shadowSize, shadowSize); key.shadow.bias = -0.0004; key.shadow.radius = 6;
  key.shadow.camera.near = 2; key.shadow.camera.far = 18;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xbfe4ff, 1.5); rim.position.set(4, 3.5, -4); scene.add(rim);
  const fill = new THREE.PointLight(0xff9a50, 6, 9, 1.6); fill.position.set(3, 1.4, 3); scene.add(fill);

  function applyEnv(root) {
    root.traverse((o) => {
      const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
      for (const m of mats) {
        if (m.isMeshPhysicalMaterial || (m.isMeshStandardMaterial && m.metalness > 0.5)) { m.envMap = envTex; m.envMapIntensity = 0.55; m.needsUpdate = true; }
      }
    });
  }
  applyEnv(scene);
  return { scene, key, rim, fill, table, applyEnv };
}

// Cardboard facility cut-out with a status sign (used in the takeaway beat).
export function createFacility(kind) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0.5, 0.42); s.lineTo(0.3, 0.56); s.lineTo(0.3, 0.42);
  s.lineTo(0.1, 0.56); s.lineTo(0.1, 0.42); s.lineTo(-0.1, 0.56); s.lineTo(-0.1, 0.42);
  s.lineTo(-0.3, 0.42); s.lineTo(-0.3, 0.86); s.lineTo(-0.42, 0.86); s.lineTo(-0.42, 0.42); s.lineTo(-0.5, 0.42); s.lineTo(-0.5, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 });
  const bld = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({ color: 0xa8743f, roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: 0x7a5129, roughness: 0.9 })]);
  bld.castShadow = true; g.add(bld);
  // door + windows
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.9 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), dark); door.position.set(0.05, 0.11, 0.062); g.add(door);
  for (const x of [-0.3, 0.3]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.1), dark); w.position.set(x, 0.25, 0.062); g.add(w); }
  // sign
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = kind === 'yes' ? '#2c8a4e' : '#e8741c';
    x.beginPath(); x.arc(128, 128, 122, 0, 7); x.fill();
    x.strokeStyle = '#fff3e0'; x.lineWidth = 30; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath();
    if (kind === 'yes') { x.moveTo(72, 132); x.lineTo(112, 172); x.lineTo(186, 90); }
    else { x.moveTo(84, 84); x.lineTo(172, 172); x.moveTo(172, 84); x.lineTo(84, 172); }
    x.stroke();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const sign = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  sign.position.set(0.12, 1.02, 0.03); g.add(sign);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x8e959d, metalness: 0.8, roughness: 0.4 }));
  post.position.set(0.12, 0.72, 0.0); g.add(post);
  return g;
}
