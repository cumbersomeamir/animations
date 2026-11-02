// props.js: stage, balance, mango (whole + clip-plane pieces), flesh cubes, nutrient column, measuring cup.
// All geometry is procedural (no imported models). Food keeps natural colours; the stage uses the
// icon palette (near-black + leaf greens).
import { RoundedBoxGeometry } from '/node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { COL, rng, clamp } from './util.js';

// ------------------------------------------------------------------ stage
export function createStage(THREE) {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#0B110D', roughness: 0.62, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);
  // backdrop cyclorama with a slow fbm haze (shader-glsl skill: noise + fbm + palette)
  const backU = { u_time: { value: 0 } };
  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(11, 11, 16, 64, 1, true, Math.PI - 1.25, 2.5),
    new THREE.ShaderMaterial({
      uniforms: backU, side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `
        precision highp float; varying vec3 vP; uniform float u_time;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
        float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
        void main(){
          float h = (vP.y + 8.0) / 16.0;
          vec2 uv = vec2(atan(vP.x, -vP.z) * 2.0, h * 6.0);
          float n = fbm(uv * 1.3 + vec2(u_time * 0.04, -u_time * 0.02));
          vec3 ink = vec3(0.0824, 0.1176, 0.0863), leaf = vec3(0.3529, 0.7137, 0.1490);
          vec3 col = mix(vec3(0.012,0.018,0.014), ink * 0.9, smoothstep(0.0, 0.55, h));
          col += leaf * 0.10 * smoothstep(0.35, 0.8, n) * smoothstep(0.15, 0.5, h) * (1.0 - smoothstep(0.75, 1.0, h));
          float spot = exp(-pow(atan(vP.x, -vP.z) / 0.55, 2.0)) * exp(-pow((h - 0.42) / 0.22, 2.0));
          col += vec3(0.10, 0.13, 0.10) * spot;
          gl_FragColor = vec4(col, 1.0);
        }`,
    }));
  back.position.set(0, 8 - 0.01, 0.5);
  g.add(back);
  // soft light pool on the floor
  const poolTex = radialTexture(THREE, 'rgba(210,240,190,0.55)', 'rgba(210,240,190,0)');
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0.2, 0.005, 0.3);
  g.add(pool);
  return { group: g, backU, floor };
}

function radialTexture(THREE, c0, c1) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, c0);
  gr.addColorStop(1, c1);
  x.fillStyle = gr;
  x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ------------------------------------------------------------------ balance (Roberval top-pan)
export const BAL = { pivotY: 1.12, arm: 0.98, post: 0.36, panR: 0.56 };
export function createBalance(THREE) {
  const g = new THREE.Group();
  const metal = new THREE.MeshPhysicalMaterial({ color: '#1C2520', metalness: 0.65, roughness: 0.3, clearcoat: 0.4 });
  const trim = new THREE.MeshStandardMaterial({ color: COL.leaf, emissive: COL.leaf, emissiveIntensity: 0.35, roughness: 0.4 });
  const add = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  add(new RoundedBoxGeometry(2.5, 0.22, 0.9, 3, 0.08), metal, 0, 0.11, 0);
  add(new THREE.BoxGeometry(2.2, 0.03, 0.02), trim, 0, 0.12, 0.455);
  add(new THREE.CylinderGeometry(0.1, 0.13, BAL.pivotY - 0.22, 24), metal, 0, 0.22 + (BAL.pivotY - 0.22) / 2, 0);
  const beam = new THREE.Group();
  beam.position.set(0, BAL.pivotY, 0);
  g.add(beam);
  add(new RoundedBoxGeometry(BAL.arm * 2 + 0.2, 0.11, 0.14, 2, 0.04), metal, 0, 0, 0, beam);
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 20), trim, 0, 0, 0, beam).rotation.x = Math.PI / 2;
  // pointer + level dial on the pillar front
  const dial = add(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 32, 1, false, -0.7, 1.4), new THREE.MeshStandardMaterial({ color: '#0E1511', roughness: 0.5 }), 0, BAL.pivotY - 0.34, 0.1);
  dial.rotation.x = Math.PI / 2;
  const mark = add(new THREE.BoxGeometry(0.015, 0.06, 0.01), trim, 0, BAL.pivotY - 0.17, 0.115);
  const needle = new THREE.Group();
  needle.position.set(0, BAL.pivotY, 0.125);
  g.add(needle);
  add(new THREE.BoxGeometry(0.018, 0.34, 0.012), new THREE.MeshStandardMaterial({ color: COL.lime, emissive: COL.lime, emissiveIntensity: 0.5 }), 0, -0.17, 0, needle);
  // posts + pans (pans stay horizontal: Roberval parallelogram)
  const pans = [-1, 1].map((s) => {
    const pg = new THREE.Group();
    g.add(pg);
    add(new THREE.CylinderGeometry(0.04, 0.04, BAL.post, 12), metal, 0, -BAL.post / 2, 0, pg);
    const dish = add(new THREE.LatheGeometry([[0, 0], [BAL.panR - 0.05, 0], [BAL.panR, 0.05], [BAL.panR + 0.01, 0.07], [BAL.panR - 0.02, 0.075], [0, 0.03]].map(([r, y]) => new THREE.Vector2(r, y)), 64), metal, 0, 0, 0, pg);
    add(new THREE.TorusGeometry(BAL.panR + 0.005, 0.012, 8, 64), trim, 0, 0.07, 0, pg).rotation.x = Math.PI / 2;
    return pg;
  });
  // tilt > 0 = right pan down (degrees)
  function setTilt(deg) {
    const a = (deg * Math.PI) / 180;
    beam.rotation.z = -a;
    needle.rotation.z = -a;
    pans[0].position.set(-BAL.arm * Math.cos(a), BAL.pivotY + BAL.arm * Math.sin(a) + BAL.post, 0);
    pans[1].position.set(BAL.arm * Math.cos(a), BAL.pivotY - BAL.arm * Math.sin(a) + BAL.post, 0);
  }
  setTilt(0);
  const panTop = (i) => new THREE.Vector3(pans[i].position.x, pans[i].position.y + 0.045, 0);
  return { group: g, setTilt, panTop, pans, mark, needle, trim };
}

// ------------------------------------------------------------------ mango
const MA = 0.72, MB = 0.46, MC = 0.40; // half length, half height, half thickness
function deform(x, y, z) {
  // x: -1 beak .. +1 stem (unit sphere coords)
  let X = x * MA, Y = y * MB * (y > 0 ? 1.05 : 0.9), Z = z * MC;
  Y += 0.11 * (1 - x * x);                        // kidney arch
  Y -= 0.07 * Math.max(0, -x - 0.35) * 1.6;       // drooping beak
  const fat = 1 + 0.08 * x;                       // stem shoulder slightly fuller
  return [X, Y * fat, Z * fat];
}
function skinColor(x, y, z, n) {
  // natural ripe mango (sRGB): golden-orange body, green shoulder at the stem, red blush on the sun side
  const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * clamp(t));
  let c = [0.97, 0.66, 0.10];                                           // golden
  c = lerp3(c, [0.96, 0.46, 0.06], clamp(0.55 - y * 0.7));              // deeper orange belly
  c = lerp3(c, [0.38, 0.55, 0.10], clamp((x - 0.25) * 1.4) * clamp(0.75 + y) * 0.9); // green shoulder
  const blush = clamp((y + 0.05) * 1.7) * clamp((x + 0.75) * 0.8) * (0.7 + 0.3 * n) * clamp(0.6 + z * 0.6);
  c = lerp3(c, [0.74, 0.09, 0.07], blush * 0.92);
  c = lerp3(c, [0.55, 0.05, 0.06], clamp(blush - 0.75) * 1.2);          // deep red core of the blush
  return c;
}
export function createMango(THREE) {
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const pos = geo.attributes.position;
  const cols = [];
  const r = rng(11);
  const noise = (x, y) => 0.5 + 0.5 * Math.sin(x * 7.1 + 1.3) * Math.cos(y * 5.3 - 0.4) * 0.6 + 0.2 * Math.sin(x * 13 + y * 9);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const [X, Y, Z] = deform(x, y, z);
    pos.setXYZ(i, X, Y, Z);
    const sc = skinColor(x, y, z, clamp(noise(x, z)));
    const lin = new THREE.Color().setRGB(sc[0], sc[1], sc[2], THREE.SRGBColorSpace);   // vertex colours are linear
    cols.push(lin.r, lin.g, lin.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  geo.computeVertexNormals();
  // lenticel speckles as a faint emissive map
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(255,236,170,${0.25 + r() * 0.5})`; x.beginPath(); x.arc(r() * 1024, r() * 512, 0.8 + r() * 1.6, 0, Math.PI * 2); x.fill(); }
  const speck = new THREE.CanvasTexture(c);
  speck.colorSpace = THREE.SRGBColorSpace;
  const skin = () => new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.36, clearcoat: 0.75, clearcoatRoughness: 0.28, emissive: '#ffffff', emissiveMap: speck, emissiveIntensity: 0.10 });
  const innerSkin = () => new THREE.MeshStandardMaterial({ color: '#F6C15A', roughness: 0.5, side: THREE.BackSide });
  const flesh = fleshMaterial(THREE);

  const group = new THREE.Group();          // whole-fruit transform
  const whole = new THREE.Mesh(geo, skin());
  whole.castShadow = true;
  group.add(whole);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.08, 10), new THREE.MeshStandardMaterial({ color: '#4A3A1A', roughness: 0.8 }));
  const sp = deform(0.98, 0.18, 0);
  stem.position.set(sp[0] - 0.02, sp[1] + 0.03, 0);
  stem.rotation.z = -0.5;
  whole.add(stem);

  // pieces: front cheek (z > zc), back cheek (z < -zc), middle slab with the seed
  const zc = 0.12;
  function capShape(zLocal) {
    const s = Math.sqrt(Math.max(0, 1 - Math.pow(zLocal / MC, 2)));
    const pts = [];
    for (let k = 0; k < 96; k++) {
      const t = (k / 96) * Math.PI * 2;
      const d = deform(s * Math.cos(t), s * Math.sin(t), zLocal / MC);
      pts.push(new THREE.Vector2(d[0] / (1 + 0.08 * s * Math.cos(t)), d[1] / (1 + 0.08 * s * Math.cos(t))));
    }
    return new THREE.Shape(pts);
  }
  function piece(sign) {
    const pg = new THREE.Group();
    const planes = [];
    const m = skin();
    const mi = innerSkin();
    const local = [];
    if (sign === 0) { local.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), zc), new THREE.Plane(new THREE.Vector3(0, 0, 1), zc)); }
    else local.push(new THREE.Plane(new THREE.Vector3(0, 0, sign), -zc));
    m.clippingPlanes = local.map((p) => p.clone());
    mi.clippingPlanes = m.clippingPlanes;
    const outer = new THREE.Mesh(geo, m);
    outer.castShadow = true;
    const inner = new THREE.Mesh(geo, mi);
    pg.add(outer, inner);
    const caps = [];
    for (const s of sign === 0 ? [-1, 1] : [sign]) {
      const cap = new THREE.Mesh(new THREE.ShapeGeometry(capShape(s * zc), 64), sign === 0 ? seedCapMaterial(THREE) : flesh);
      cap.position.z = s * zc;
      if (s > 0) cap.rotation.y = Math.PI;   // face toward the cut (−z for the front cheek)
      cap.castShadow = true;
      pg.add(cap);
      caps.push(cap);
    }
    if (sign === 0) {
      const seed = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), new THREE.MeshStandardMaterial({ color: '#EBD9A6', roughness: 0.85 }));
      seed.scale.set(0.5, 0.33, 0.11);
      seed.position.y = 0.06;
      pg.add(seed);
    }
    return { group: pg, outer, inner, caps, local, mat: m };
  }
  const pieces = { front: piece(1), back: piece(-1), mid: piece(0) };
  for (const p of Object.values(pieces)) { p.group.visible = false; group.add(p.group); }
  // keep clipping planes in world space every frame
  function updateClip() {
    for (const p of Object.values(pieces)) {
      if (!p.group.visible) continue;
      p.group.updateWorldMatrix(true, false);
      p.mat.clippingPlanes.forEach((pl, i) => pl.copy(p.local[i]).applyMatrix4(p.group.matrixWorld));
    }
  }
  return { group, whole, pieces, updateClip, flesh, zc };
}

function fleshTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  const r = rng(5);
  const gr = x.createRadialGradient(256, 256, 20, 256, 256, 300);
  gr.addColorStop(0, '#FFC23A');
  gr.addColorStop(0.7, '#FFA51F');
  gr.addColorStop(1, '#F7901A');
  x.fillStyle = gr;
  x.fillRect(0, 0, 512, 512);
  // juicy fibre streaks
  for (let i = 0; i < 220; i++) {
    const a = r() * Math.PI * 2, r0 = r() * 60, r1 = r0 + 80 + r() * 200;
    x.strokeStyle = `rgba(${r() > 0.5 ? '255,214,120' : '230,120,10'},${0.10 + r() * 0.12})`;
    x.lineWidth = 1 + r() * 2.5;
    x.beginPath(); x.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); x.lineTo(256 + Math.cos(a + 0.1) * r1, 256 + Math.sin(a + 0.1) * r1); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
let FLESH = null;
export function fleshMaterial(THREE) {
  if (!FLESH) FLESH = new THREE.MeshPhysicalMaterial({ map: fleshTexture(THREE), color: '#FFC46B', roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.18, emissive: '#C25A00', emissiveIntensity: 0.22, side: THREE.DoubleSide });
  return FLESH;
}
function seedCapMaterial(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  x.fillStyle = '#FFA51F'; x.fillRect(0, 0, 256, 256);
  x.fillStyle = '#EBD9A6'; x.beginPath(); x.ellipse(128, 128, 70, 22, 0, 0, Math.PI * 2); x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: t, roughness: 0.4, emissive: '#7A3A00', emissiveIntensity: 0.25 });
}

// ------------------------------------------------------------------ flesh cubes (instanced)
export function createCubes(THREE, n) {
  const geo = new RoundedBoxGeometry(0.19, 0.19, 0.19, 2, 0.045);
  const mesh = new THREE.InstancedMesh(geo, fleshMaterial(THREE), n);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;   // instances move far from the mesh origin
  const r = rng(21);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) { c.setRGB(0.93 + r() * 0.1, 0.9 + r() * 0.12, 0.85 + r() * 0.15); mesh.setColorAt(i, c); }
  const dummy = new THREE.Object3D();
  function set(i, x, y, z, s, rx = 0, ry = 0, rz = 0) {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.setScalar(Math.max(s, 1e-4));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  return { mesh, set, n };
}
// pile slots on a pan centre (local offsets): 3x3 + 2x2 + 1 + 3 spill = 17
export function pileSlots() {
  const s = [];
  const d = 0.205;
  for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) s.push([i * d, 0.095, k * d * 0.95]);
  for (const [i, k] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) s.push([i * d, 0.285, k * d]);
  s.push([0, 0.475, 0]);
  s.push([0.42, 0.095, 0.18], [-0.40, 0.095, 0.22], [0.1, 0.095, 0.42]);
  return s;
}

// ------------------------------------------------------------------ nutrient column (true proportions of 100 g)
export const COLUMN = { r: 0.40, h: 2.5 };
export function createColumn(THREE) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(COLUMN.r + 0.03, COLUMN.r + 0.03, COLUMN.h + 0.06, 48, 1, true),
    new THREE.MeshPhysicalMaterial({ color: '#DDEFE2', transparent: true, opacity: 0.16, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = (COLUMN.h + 0.06) / 2;
  g.add(glass);
  const rimMat = new THREE.MeshStandardMaterial({ color: COL.lime, emissive: COL.lime, emissiveIntensity: 0.4 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(COLUMN.r + 0.03, 0.012, 8, 48), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = COLUMN.h + 0.06;
  g.add(rim);
  // water: clear, slightly luminous, animated caustic lines (shader-glsl: noise ridges)
  const waterU = { u_time: { value: 0 }, u_glow: { value: 0 } };
  const water = new THREE.Mesh(new THREE.CylinderGeometry(COLUMN.r, COLUMN.r, 1, 48, 1),
    new THREE.ShaderMaterial({
      uniforms: waterU, transparent: true, depthWrite: false,
      vertexShader: 'varying vec3 vN; varying vec3 vP; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }',
      fragmentShader: `precision highp float; varying vec3 vN; varying vec3 vP; varying vec3 vV; uniform float u_time; uniform float u_glow;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
        void main(){
          float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
          float a = atan(vP.x, vP.z);
          float c = noise(vec2(a * 3.0, vP.y * 6.0 - u_time * 0.8)) * 0.6 + noise(vec2(a * 7.0 + 3.0, vP.y * 13.0 + u_time * 0.5)) * 0.4;
          float caus = pow(1.0 - abs(c - 0.5) * 2.0, 6.0);
          vec3 col = vec3(0.78, 0.90, 0.86) * (0.22 + 0.5 * fres) + vec3(0.65, 0.91, 0.33) * caus * 0.25 + vec3(0.9, 1.0, 0.9) * u_glow * 0.15;
          gl_FragColor = vec4(col, 0.30 + 0.45 * fres + caus * 0.15);
        }`,
    }));
  g.add(water);
  const carbMat = new THREE.MeshPhysicalMaterial({ color: COL.amber, roughness: 0.25, clearcoat: 1, transparent: true, opacity: 0.94, emissive: '#B86A00', emissiveIntensity: 0.25 });
  const carbs = new THREE.Mesh(new THREE.CylinderGeometry(COLUMN.r, COLUMN.r, 1, 48, 1), carbMat);
  g.add(carbs);
  const topMat = new THREE.MeshStandardMaterial({ color: '#F1E6CC', roughness: 0.5, emissive: '#3A3426', emissiveIntensity: 0.3 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(COLUMN.r, COLUMN.r, 1, 48, 1), topMat);
  g.add(top);
  // fibre threads (leaf green) living inside the carb layer
  const fibreMat = new THREE.MeshStandardMaterial({ color: COL.leaf, emissive: COL.leaf, emissiveIntensity: 0.45, roughness: 0.5 });
  const fibres = new THREE.Group();
  const r = rng(77);
  for (let i = 0; i < 7; i++) {
    const pts = [];
    const a0 = r() * Math.PI * 2, rad = 0.12 + r() * 0.22, y0 = (r() - 0.5) * 0.5;
    for (let k = 0; k < 8; k++) pts.push(new THREE.Vector3(Math.cos(a0 + k * 0.5) * rad, y0 + (r() - 0.5) * 0.35, Math.sin(a0 + k * 0.5) * rad));
    fibres.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.012, 6), fibreMat));
  }
  g.add(fibres);
  // fill: 0..1 per layer (water 83.5 %, carbs 15.0 %, protein+fat+minerals 1.6 %)
  const FR = { water: 0.835, carbs: 0.150, top: 0.016 };
  function setFill(w, c, t, fibre) {
    const hw = COLUMN.h * FR.water * clamp(w), hc = COLUMN.h * FR.carbs * clamp(c), ht = COLUMN.h * FR.top * clamp(t);
    water.visible = hw > 0.002; water.scale.y = Math.max(hw, 1e-3); water.position.y = hw / 2;
    // carbs drop in from above as a block, then settle on the water
    carbs.visible = c > 0.001; carbs.scale.y = COLUMN.h * FR.carbs; carbs.position.y = COLUMN.h * FR.water + COLUMN.h * FR.carbs / 2 + (1 - clamp(c)) * 1.4;
    top.visible = t > 0.001; top.scale.y = COLUMN.h * FR.top; top.position.y = COLUMN.h * (FR.water + FR.carbs) + COLUMN.h * FR.top / 2 + (1 - clamp(t)) * 0.9;
    carbMat.opacity = 0.94 * clamp(c * 3);
    topMat.transparent = true; topMat.opacity = clamp(t * 3);
    fibres.visible = fibre > 0.001;
    fibres.position.y = carbs.position.y;
    fibres.scale.setScalar(Math.max(1e-3, clamp(fibre)));
    return { hw, hc, ht };
  }
  const anchor = (k) => {
    if (k === 'water') return new THREE.Vector3(0, COLUMN.h * FR.water * 0.5, COLUMN.r);
    if (k === 'carbs') return new THREE.Vector3(0, COLUMN.h * (FR.water + FR.carbs / 2), COLUMN.r);
    if (k === 'top') return new THREE.Vector3(COLUMN.r * 0.7, COLUMN.h * (FR.water + FR.carbs + FR.top / 2), COLUMN.r * 0.7);
    if (k === 'rim') return new THREE.Vector3(0, COLUMN.h + 0.06, 0);
    return new THREE.Vector3();
  };
  return { group: g, setFill, waterU, carbMat, anchor, glass, rim };
}

// ------------------------------------------------------------------ measuring cup (1 cup = 1.0 world unit tall)
export const CUP = { r: 0.42, h: 1.0 };
export function createCup(THREE) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(232,243,234,0.55)';
  x.fillRect(0, 0, 1024, 512);
  x.strokeStyle = 'rgba(237,246,229,0.95)';
  x.fillStyle = 'rgba(237,246,229,0.95)';
  x.lineWidth = 10;
  x.font = '800 84px NText, sans-serif';
  x.textAlign = 'left';
  const marks = [[0.25, '¼'], [0.5, '½ cup'], [0.75, '¾'], [1.0, '1 cup']];
  for (const [v, label] of marks) {
    const y = 512 - v * 512 * 0.94;
    x.beginPath(); x.moveTo(560, y); x.lineTo(660, y); x.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(CUP.r + 0.02, CUP.r - 0.02, CUP.h / 0.94, 48, 1, true, -Math.PI, Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ color: '#E8F3EA', map: t, transparent: true, opacity: 0.32, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false, emissive: '#2A3A2C', emissiveIntensity: 0.4 }));
  shell.position.y = CUP.h / 0.94 / 2;
  g.add(shell);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(CUP.r - 0.02, CUP.r - 0.02, 0.03, 48), new THREE.MeshPhysicalMaterial({ color: '#E8F3EA', transparent: true, opacity: 0.35, roughness: 0.05 }));
  base.position.y = 0.015;
  g.add(base);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 32, Math.PI), new THREE.MeshPhysicalMaterial({ color: '#E8F3EA', transparent: true, opacity: 0.5, roughness: 0.05 }));
  handle.position.set(CUP.r + 0.01, CUP.h * 0.6, 0);
  handle.rotation.z = -Math.PI / 2;
  g.add(handle);
  for (const yy of [CUP.h / 0.94, 0.02]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(CUP.r + (yy > 0.5 ? 0.02 : -0.02), 0.016, 8, 48), new THREE.MeshStandardMaterial({ color: COL.mist, emissive: COL.mist, emissiveIntensity: 0.25, roughness: 0.3 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = yy;
    g.add(ring);
  }
  const fillLine = new THREE.Mesh(new THREE.TorusGeometry(CUP.r + 0.025, 0.01, 6, 48), new THREE.MeshStandardMaterial({ color: COL.lime, emissive: COL.lime, emissiveIntensity: 0.8 }));
  fillLine.rotation.x = Math.PI / 2;
  g.add(fillLine);
  return { group: g, fillLine };
}
