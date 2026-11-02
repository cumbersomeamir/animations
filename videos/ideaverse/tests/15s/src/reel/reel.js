// reel.js — Ideaverse 15 s kinetic reel (portrait 1080x1920). Every frame is a pure function of t.
// Original implementation of the kinetic-reel grammar: three.js generative layers + Canvas 2D type + HUD +
// shape-continuity transitions. Palette overridden with values sampled from the Ideaverse icon.
import * as THREE from 'three';
import C from './cues.js';

const W = 1080, H = 1920, FPS = 30;
const K = {
  navy: '#1B2333', deep: '#121826', card: '#232D42', mint: '#6CDA7E', mintHi: '#A6F2B3',
  mist: '#EEF4F0', white: '#F4F7FB', grey: '#8B93A6',
};
const F = { cond: 'Anton', wide: '"Archivo Black"', serif: '"Instrument Serif"', mono: '"JetBrains Mono"' };
const S = C.S, Hh = C.hits;

// ---------------------------------------------------------------- math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const expoOut = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));
const expoIn = (k) => (k <= 0 ? 0 : Math.pow(2, 10 * k - 10));
const expoInOut = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2);
const backOut = (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
const cubicInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const pulse = (t, t0, rate = 10) => (t < t0 ? 0 : Math.exp(-(t - t0) * rate));
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- canvases
const out = document.getElementById('out');
const octx = out.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const bufA = mk(), bufB = mk(), tmp = mk();

// ---------------------------------------------------------------- GL
const glCanvas = mk();
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.autoClear = false;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
cam.position.set(0, 0, 10); cam.lookAt(0, 0, 0);
const U = (2 * 10 * Math.tan((17.5 * Math.PI) / 180)) / H; // world units per px on the z=0 plane
const wx = (sx) => (sx - W / 2) * U, wy = (sy) => -(sy - H / 2) * U;

// environment for chrome: navy room, white key, mint side panels
const pmrem = new THREE.PMREMGenerator(renderer);
const env = new THREE.Scene();
env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color('#3A4766').multiplyScalar(1.1), side: THREE.BackSide })));
const panel = (w, h, col, k, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
panel(12, 5, '#ffffff', 8, [0, 8, 3]);
panel(6, 6, '#ffffff', 3, [0, 2, 9]);
panel(5, 10, K.mint, 6, [-8, 0, 3]);
panel(2.5, 9, '#ffffff', 3, [8, 1, 2]);
panel(14, 5, K.mint, 3, [0, -8, 2]);
panel(4, 4, '#ffffff', 1.2, [0, 0, -9]);
const envTex = pmrem.fromScene(env, 0.035).texture;
const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.13, envMap: envTex, envMapIntensity: 1.25 });
const outlineMat = (w, col = K.navy) => new THREE.ShaderMaterial({
  uniforms: { uW: { value: w }, uC: { value: new THREE.Color(col) } },
  vertexShader: 'uniform float uW; void main(){ vec3 p = position + normal * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
  fragmentShader: 'uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, 1.0); }',
  side: THREE.BackSide,
});

// chrome knot (02 ONE APP)
const gKnot = new THREE.Group(); scene.add(gKnot);
{
  const g = new THREE.TorusKnotGeometry(0.82, 0.27, 320, 48, 2, 3);
  gKnot.add(new THREE.Mesh(g, outlineMat(0.035)), new THREE.Mesh(g, chrome));
}
// chrome planet ring (icon motif)
function makeRing(R, tube) {
  const g = new THREE.Group();
  const geo = new THREE.TorusGeometry(R, tube, 32, 260);
  g.add(new THREE.Mesh(geo, outlineMat(0.018)), new THREE.Mesh(geo, chrome));
  scene.add(g); return g;
}
const gRing = makeRing(1.5, 0.07);
const gRingEnd = makeRing(1.02, 0.05);

// ---------------------------------------------------------------- picture (original illustrative output)
function makePicture(n = 512) {
  const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'); const s = n / 512;
  const sky = g.createLinearGradient(0, 0, 0, n);
  sky.addColorStop(0, '#1E1A4A'); sky.addColorStop(0.42, '#4E3A8C'); sky.addColorStop(0.68, '#C46A97'); sky.addColorStop(0.82, '#FFB08A');
  g.fillStyle = sky; g.fillRect(0, 0, n, n);
  const R = rng(3);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${0.4 + R() * 0.6})`; g.beginPath(); g.arc(R() * n, R() * n * 0.5, (1 + R() * 2.2) * s, 0, 7); g.fill(); }
  // mint ringed planet
  const px = 300 * s, py = 200 * s, pr = 96 * s;
  g.save(); g.translate(px, py); g.rotate(-0.35);
  g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 12 * s;
  g.beginPath(); g.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, Math.PI, Math.PI * 2); g.stroke();
  g.restore();
  const pg = g.createRadialGradient(px - pr * 0.4, py - pr * 0.4, pr * 0.1, px, py, pr);
  pg.addColorStop(0, '#B8F7C2'); pg.addColorStop(0.6, '#6CDA7E'); pg.addColorStop(1, '#2F8F57');
  g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
  g.save(); g.translate(px, py); g.rotate(-0.35);
  g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineWidth = 12 * s;
  g.beginPath(); g.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, 0, Math.PI); g.stroke();
  g.restore();
  // mountains
  const ridge = (col, base, amp, seed, rough) => {
    const r = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, n);
    let y = base; for (let x = 0; x <= n; x += 16 * s) { y = base - amp * Math.abs(Math.sin(x / (90 * s) + seed)) - r() * rough * s; g.lineTo(x, y); }
    g.lineTo(n, n); g.closePath(); g.fill();
  };
  ridge('#5A3F86', 360 * s, 70 * s, 1, 18);
  ridge('#2B2F5A', 405 * s, 60 * s, 4, 14);
  ridge('#1B2333', 450 * s, 40 * s, 7, 10);
  g.strokeStyle = 'rgba(108,218,126,0.7)'; g.lineWidth = 3 * s; // mint rim light on the near ridge
  // lake reflection band
  const lk = g.createLinearGradient(0, 470 * s, 0, n);
  lk.addColorStop(0, 'rgba(255,176,138,0.55)'); lk.addColorStop(1, 'rgba(30,26,74,0.2)');
  g.fillStyle = lk; g.fillRect(0, 472 * s, n, n - 472 * s);
  g.fillStyle = 'rgba(108,218,126,0.55)'; g.fillRect(px - 50 * s, 480 * s, 100 * s, 5 * s); g.fillRect(px - 30 * s, 494 * s, 60 * s, 4 * s);
  return c;
}
const PIC = makePicture(512);
const framed = (() => { // picture with white card border (for the helix)
  const c = document.createElement('canvas'); c.width = 560; c.height = 640; const g = c.getContext('2d');
  g.fillStyle = '#FFFFFF'; rr(g, 0, 0, 560, 640, 36); g.fill();
  g.save(); rr(g, 24, 24, 512, 512, 20); g.clip(); g.drawImage(PIC, 24, 24); g.restore();
  g.fillStyle = K.navy; rr(g, 24, 566, 200, 22, 11); g.fill(); g.fillStyle = K.mint; rr(g, 24, 600, 120, 18, 9); g.fill();
  return c;
})();
const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };

// card plane (03 IMAGE)
const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex(PIC), transparent: true, toneMapped: false, side: THREE.DoubleSide }));
scene.add(card);
// helix of framed cards (04 MOTION)
const gHelix = new THREE.Group(); scene.add(gHelix);
const helixCards = [];
{
  const m = new THREE.MeshBasicMaterial({ map: tex(framed), toneMapped: false, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.875, 1.0), m); gHelix.add(p); helixCards.push(p); }
}
// icon plane (END) — the real app icon asset, rounded
const iconPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }));
scene.add(iconPlane);

// ---------------------------------------------------------------- particle cloud: shell -> bulb -> pixel image
const GN = 95, NP = GN * GN;
const cloudMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: {
    uK1: { value: 0 }, uK2: { value: 0 }, uT: { value: 0 }, uScan: { value: 0 }, uSpread: { value: 1 },
    uBulbScale: { value: 1 }, uSize: { value: 3.4 }, uGridSize: { value: 8.3 }, uAlpha: { value: 1 }, uBright: { value: 1 },
  },
  vertexShader: `
    attribute vec3 aShell; attribute vec3 aBulb; attribute vec3 aGrid; attribute vec3 aCol; attribute float aRnd;
    uniform float uK1, uK2, uT, uScan, uSpread, uBulbScale, uSize, uGridSize, uBright;
    varying vec3 vCol; varying float vSq;
    float hash(float n){ return fract(sin(n) * 43758.5453); }
    void main(){
      float r = aRnd;
      float k1 = clamp(uK1 * 1.45 - r * 0.45, 0., 1.); k1 = 1. - pow(1. - k1, 3.);
      float k2 = clamp(uK2 * 1.6 - r * 0.6, 0., 1.); k2 = k2 * k2 * (3. - 2. * k2);
      vec3 p = mix(aShell * uSpread, aBulb, k1) * uBulbScale;
      p += (1. - k2) * 0.035 * vec3(sin(uT * 2.1 + r * 40.), cos(uT * 1.7 + r * 31.), sin(uT * 1.3 + r * 17.));
      // stream: arc out of the bulb before landing on the grid
      vec3 g = aGrid; p = mix(p, g, k2) + vec3(0., 0., sin(3.14159 * k2) * (0.6 + r));
      vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
      gl_PointSize = mix(uSize * (0.7 + 0.6 * hash(r * 91.)), uGridSize, k2) * (10. / -mv.z);
      vec3 mint = vec3(0.424, 0.855, 0.494);
      vec3 cloudCol = mix(mint, vec3(1.), step(0.92, r) * 0.85) * uBright;
      float row = (1. - aGrid.y / ${(380 * U).toFixed(5)}) * 0.5;     // 0 top .. 1 bottom
      float revealed = step(row, uScan);
      float fl = hash(r * 13. + floor(uT * 14.));
      vec3 noiseCol = fl < 0.55 ? vec3(0.106, 0.137, 0.2) + fl * 0.25 : (fl < 0.85 ? mint * (0.5 + fl * 0.5) : vec3(0.95));
      vCol = mix(cloudCol, mix(noiseCol, aCol, revealed), k2);
      vSq = k2;
    }`,
  fragmentShader: `
    uniform float uAlpha; varying vec3 vCol; varying float vSq;
    void main(){
      vec2 c = gl_PointCoord - 0.5; float d = length(c);
      float a = mix(1. - smoothstep(0.32, 0.5, d), 1., vSq);
      gl_FragColor = vec4(vCol, a * uAlpha);
    }`,
});
const gCloud = new THREE.Group(); scene.add(gCloud);
{
  const R = rng(11);
  const shell = new Float32Array(NP * 3), bulb = new Float32Array(NP * 3), grid = new Float32Array(NP * 3), col = new Float32Array(NP * 3), rnd = new Float32Array(NP);
  // bulb silhouette in normalised units (height ~1.9): glass circle + neck + 3 screw bands
  const inside = (x, y) => {
    if (Math.hypot(x, y - 0.3) < 0.62) return true;
    if (y < -0.18 && y > -0.52) { const hw = lerp(0.33, 0.27, inv(-0.18, -0.52, y)); return Math.abs(x) < hw; }
    if (y <= -0.56 && y > -0.92) { const band = Math.floor((-0.56 - y) / 0.12); const f = ((-0.56 - y) / 0.12) % 1; return Math.abs(x) < 0.26 - band * 0.02 && f < 0.78; }
    return false;
  };
  const SB = (600 * U) / 1.9, SR = 300 * U, GH = 380 * U;
  const pic = PIC.getContext('2d').getImageData(0, 0, 512, 512).data;
  for (let i = 0; i < NP; i++) {
    const u = R() * 2 - 1, th = R() * Math.PI * 2, rr2 = Math.sqrt(1 - u * u);
    shell.set([Math.cos(th) * rr2 * SR, u * SR, Math.sin(th) * rr2 * SR], i * 3);
    let x, y; do { x = R() * 1.4 - 0.7; y = R() * 1.9 - 0.95; } while (!inside(x, y));
    const depth = (R() * 2 - 1) * 0.28 * Math.sqrt(Math.max(0, 1 - (x * x) / 0.4));
    bulb.set([x * SB, y * SB, depth * SB], i * 3);
    const gx = i % GN, gy = Math.floor(i / GN);
    grid.set([((gx + 0.5) / GN * 2 - 1) * GH, (1 - (gy + 0.5) / GN * 2) * GH, 0], i * 3);
    const px = Math.floor((gx + 0.5) / GN * 512), py = Math.floor((gy + 0.5) / GN * 512), o = (py * 512 + px) * 4;
    col.set([pic[o] / 255, pic[o + 1] / 255, pic[o + 2] / 255], i * 3);
    rnd[i] = R();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(grid.slice(), 3));
  geo.setAttribute('aShell', new THREE.BufferAttribute(shell, 3)); geo.setAttribute('aBulb', new THREE.BufferAttribute(bulb, 3));
  geo.setAttribute('aGrid', new THREE.BufferAttribute(grid, 3)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));
  const pts = new THREE.Points(geo, cloudMat); pts.frustumCulled = false; gCloud.add(pts);
}

// ---------------------------------------------------------------- particle terrain (separate camera)
const tScene = new THREE.Scene();
const tCam = new THREE.PerspectiveCamera(48, W / H, 0.1, 100); tCam.position.set(0, 2.4, 6); tCam.lookAt(0, -0.6, -8);
const terrainMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uT: { value: 0 }, uAmp: { value: 0.7 }, uFade: { value: 1 }, uSpeed: { value: 3 } },
  vertexShader: `
    uniform float uT, uAmp, uSpeed; varying float vA;
    void main(){
      vec3 p = position; float z = p.z - uT * uSpeed;
      p.y = uAmp * (0.55 * sin(p.x * 0.55 + z * 0.33) + 0.7 * sin(p.x * 0.21 - z * 0.47 + 1.3) + 0.22 * sin((p.x + z) * 0.95));
      vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(22.0 / -mv.z, 1.6, 6.0);
      vA = smoothstep(-34., -14., p.z) * (1. - smoothstep(1.5, 4.5, p.z)) * (0.45 + 0.55 * smoothstep(-0.5, 1.0, p.y / max(uAmp, 0.01)));
    }`,
  fragmentShader: `
    uniform float uFade; varying float vA;
    void main(){ vec2 c = gl_PointCoord - 0.5; float a = 1. - smoothstep(0.25, 0.5, length(c)); gl_FragColor = vec4(0.424, 0.855, 0.494, a * vA * uFade); }`,
});
{
  const nx = 170, nz = 120, pos = new Float32Array(nx * nz * 3);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) pos.set([lerp(-11, 11, i / (nx - 1)), 0, lerp(-34, 4, j / (nz - 1))], (i * nz + j) * 3);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, terrainMat); p.frustumCulled = false; tScene.add(p);
}

function hideAll() { for (const o of [gKnot, gRing, gRingEnd, card, gHelix, iconPlane, gCloud]) o.visible = false; scene.fog = null; }
function gl(c, { terrain = null } = {}) {
  renderer.setClearColor(0x000000, 0); renderer.clear();
  if (terrain) {
    terrainMat.uniforms.uT.value = terrain.t; terrainMat.uniforms.uAmp.value = terrain.amp; terrainMat.uniforms.uFade.value = terrain.fade; terrainMat.uniforms.uSpeed.value = terrain.speed;
    renderer.render(tScene, tCam); renderer.clearDepth();
  }
  renderer.render(scene, cam);
  c.drawImage(glCanvas, 0, 0);
}

// ---------------------------------------------------------------- 2D helpers
function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const font = (f, size, weight = '') => `${weight} ${size}px ${f}`.trim();
function setFont(c, f, ls = 0) { c.font = f; c.letterSpacing = `${ls}px`; }
// letters fall in with expo-out and a stagger; o.fill(i) colours a letter; o.out = exit time (letters lift away)
function dropWord(c, s, x, y, fnt, t0, t, o = {}) {
  setFont(c, fnt, o.ls || 0);
  const total = c.measureText(s).width;
  const x0 = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const stag = o.stag ?? 0.045, fall = o.fall ?? 170, dur = o.dur ?? 0.5;
  for (let i = 0; i < s.length; i++) {
    const k = clamp((t - t0 - i * stag) / dur); if (k <= 0) continue;
    let dy = -fall * (1 - expoOut(k)), a = Math.min(1, k * 4);
    if (o.out !== undefined) { const ko = clamp((t - o.out - i * 0.02) / 0.3); dy -= 260 * expoIn(ko); a *= 1 - ko; }
    const xi = x0 + c.measureText(s.slice(0, i)).width;
    c.save(); c.globalAlpha *= a; c.fillStyle = (o.fill && o.fill(i)) || o.col || K.white;
    c.fillText(s[i], xi, y + dy);
    if (o.stroke) { c.lineWidth = o.stroke; c.strokeStyle = o.strokeCol; c.strokeText(s[i], xi, y + dy); }
    c.restore();
  }
  setFont(c, fnt, 0);
  return total;
}
function chip(c, s, x, y, k, { bg = K.mint, fg = K.navy, size = 26 } = {}) {
  if (k <= 0) return 0;
  setFont(c, font(F.mono, size, 700), 4);
  const pad = 20, w = c.measureText(s).width + pad * 2 - 4, h = size + 26;
  const ww = w * expoOut(k);
  c.save(); rr(c, x, y - h / 2, ww, h, 8); c.fillStyle = bg; c.fill(); c.clip();
  c.fillStyle = fg; c.textBaseline = 'middle'; c.fillText(s, x + pad, y + 2); c.restore();
  setFont(c, font(F.mono, size, 700), 0);
  return w;
}
function arrow(c, x0, y0, x1, y1, k, col, w = 10) {
  if (k <= 0) return;
  const xe = lerp(x0, x1, expoOut(k)), ye = lerp(y0, y1, expoOut(k)), a = Math.atan2(y1 - y0, x1 - x0);
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(xe, ye); c.stroke();
  const hl = w * 3.4; c.beginPath(); c.moveTo(xe - Math.cos(a - 0.6) * hl, ye - Math.sin(a - 0.6) * hl); c.lineTo(xe, ye); c.lineTo(xe - Math.cos(a + 0.6) * hl, ye - Math.sin(a + 0.6) * hl); c.stroke();
  c.restore();
}
function sparkle(c, x, y, r, col) {
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r);
  c.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y); c.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  c.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y); c.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r); c.fill();
}
function glow(c, x, y, r, col, a) {
  if (a <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
const MINTA = 'rgba(108,218,126,A)';

// ---------------------------------------------------------------- scenes
const POS = { bulb: [540, 1170], knot: [540, 1200], frame: [540, 1060], icon: [540, 640] };
const FRAME = 760;

function sIdea(c, t) {
  c.fillStyle = K.deep; c.fillRect(0, 0, W, H);
  const lit = pulse(t, Hh.bulbLit, 3) * (t >= Hh.bulbLit ? 1 : 0);
  glow(c, POS.bulb[0], POS.bulb[1] - 90, 520, MINTA, 0.10 + 0.25 * inv(0.3, 1.5, t) + 0.35 * lit);
  hideAll(); gCloud.visible = true;
  gCloud.position.set(wx(POS.bulb[0]), wy(POS.bulb[1]), 0);
  gCloud.rotation.set(0.08, 0.7 * t - 0.5, 0);
  const u = cloudMat.uniforms;
  u.uT.value = t; u.uK1.value = expoOut(inv(Hh.cloudForm[0], Hh.cloudForm[1], t)); u.uK2.value = 0; u.uScan.value = 0;
  u.uSpread.value = lerp(0.12, 1, expoOut(inv(-0.1, 0.45, t))); u.uBulbScale.value = 1; u.uAlpha.value = 1; u.uBright.value = 1 + 0.5 * lit;
  gl(c, { terrain: { t, amp: 0.85, fade: 1, speed: 4.2 - 2.2 * inv(0, 1.5, t) } });
  // the dot (mark) at frame 0 that bursts into the cloud
  const dk = 1 - inv(0.0, 0.4, t);
  if (dk > 0) {
    c.fillStyle = K.mint; c.globalAlpha = dk; c.beginPath(); c.arc(POS.bulb[0], POS.bulb[1] - 80, 26 * dk + 6, 0, 7); c.fill();
    c.strokeStyle = K.mint; c.lineWidth = 6 * dk; c.beginPath(); c.arc(POS.bulb[0], POS.bulb[1] - 80, 40 + 520 * expoOut(inv(0, 0.4, t)), 0, 7); c.stroke(); c.globalAlpha = 1;
  }
  if (lit > 0.02) sparkle(c, POS.bulb[0] + 18, POS.bulb[1] - 190, 70 * lit, `rgba(255,255,255,${lit})`);
  dropWord(c, 'ONE', 80, 430, font(F.cond, 300), Hh.wordOne, t, { col: K.white });
  dropWord(c, 'IDEA.', 80, 730, font(F.cond, 300), Hh.wordIdea, t, { fill: (i) => (i < 4 ? K.mint : K.white) });
  chip(c, 'INPUT: ONE IDEA', 80, 1640, inv(Hh.chipInput, Hh.chipInput + 0.35, t));
}

function sOne(c, t) {
  c.fillStyle = K.mint; c.fillRect(0, 0, W, H);
  const lt = t - S.one;
  // outlined echoes behind the knot
  setFont(c, font(F.wide, 250));
  const slamK = inv(Hh.slam, Hh.slam + 0.3, t);
  for (let e = 1; e <= 3; e++) {
    const a = 0.22 * expoOut(clamp(slamK * 1.6 - e * 0.15)) / e;
    if (a <= 0) continue;
    c.save(); c.globalAlpha = a; c.lineWidth = 3; c.strokeStyle = K.navy; c.strokeText('ONE', 80, 640 + e * 230); c.restore();
  }
  // soft oval shadow
  const sh = c.createRadialGradient(POS.knot[0], 1560, 10, POS.knot[0], 1560, 340);
  sh.addColorStop(0, 'rgba(27,35,51,0.32)'); sh.addColorStop(1, 'rgba(27,35,51,0)');
  c.save(); c.translate(0, 1560); c.scale(1, 0.14); c.translate(0, -1560); c.fillStyle = sh; c.fillRect(0, 1200, W, 720); c.restore();
  hideAll(); gKnot.visible = true;
  let pul = 0; for (const h of Hh.absorb) pul += 0.07 * pulse(t, h, 9) * (t >= h ? 1 : 0);
  const s = 0.95 * (1 + pul) * (0.6 + 0.4 * expoOut(inv(S.one - 0.3, S.one + 0.4, t)));
  gKnot.position.set(wx(POS.knot[0]), wy(POS.knot[1]), 0); gKnot.scale.setScalar(s);
  gKnot.rotation.set(0.35 + 0.15 * Math.sin(t * 1.3), t * 1.25, 0.1 * Math.sin(t));
  gl(c);
  // app chips fly in, then get absorbed into the knot
  Hh.apps.forEach((ta, i) => {
    const tb = Hh.absorb[i];
    if (t < ta) return;
    const left = i % 2 === 0, y0 = 760 + i * 150;
    const hx = left ? 90 : 760, sx = left ? -300 : W + 60;
    let x = lerp(sx, hx, expoOut(inv(ta, ta + 0.25, t))), y = y0, sc = 1, rot = 0, a = 1;
    if (t > tb - 0.15) { const k = expoIn(inv(tb - 0.15, tb, t)); x = lerp(hx, POS.knot[0] - 110, k); y = lerp(y0, POS.knot[1], k); sc = 1 - k; rot = k * (left ? 2 : -2); a = 1 - k * 0.3; }
    if (sc <= 0.02) return;
    c.save(); c.globalAlpha = a; c.translate(x + 110, y); c.rotate(rot); c.scale(sc, sc); c.translate(-110, 0);
    rr(c, 0, -34, 220, 68, 10); c.fillStyle = K.navy; c.fill();
    setFont(c, font(F.mono, 26, 700), 4); c.fillStyle = K.white; c.textBaseline = 'middle'; c.fillText(`APP 0${i + 1}`, 22, 2);
    c.fillStyle = 'rgba(244,247,251,0.25)'; rr(c, 160, -10, 40, 20, 6); c.fill();
    setFont(c, font(F.mono, 26, 700), 0);
    c.restore();
  });
  // slam
  c.textBaseline = 'alphabetic';
  dropWord(c, 'ALL IN', 80, 380, font(F.wide, 170), Hh.slam, t, { col: K.navy, stag: 0.03, fall: 120, dur: 0.35 });
  dropWord(c, 'ONE', 80, 640, font(F.wide, 250), Hh.slam + 0.1, t, { col: K.white, stag: 0.04, fall: 140, dur: 0.35, stroke: 6, strokeCol: K.navy });
  chip(c, 'AI APP', 80, 1660, inv(Hh.chipAI, Hh.chipAI + 0.3, t), { bg: K.navy, fg: K.mint, size: 30 });
  if (t >= Hh.chipAI) chip(c, 'ALL IN ONE', 290, 1660, inv(Hh.chipAI + 0.125, Hh.chipAI + 0.45, t), { bg: K.white, fg: K.navy, size: 30 });
}

function frameRect() { return [POS.frame[0] - FRAME / 2, POS.frame[1] - FRAME / 2, FRAME, FRAME]; }
function scanProgress(t) { let s = 0; for (const h of Hh.scan) s += expoOut(inv(h, h + 0.3, t)) / Hh.scan.length; return s; }

function sImage(c, t) {
  c.fillStyle = K.deep; c.fillRect(0, 0, W, H);
  // faint matrix grid
  c.save(); c.strokeStyle = 'rgba(108,218,126,0.06)'; c.lineWidth = 1;
  for (let x = 60; x < W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 60; y < H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.restore();
  const [fx, fy, fw] = frameRect();
  const done = inv(Hh.done, Hh.done + 0.35, t);
  glow(c, POS.frame[0], POS.frame[1], 700, MINTA, 0.12 + 0.25 * pulse(t, Hh.done, 4) * (t >= Hh.done ? 1 : 0));
  hideAll();
  const u = cloudMat.uniforms;
  const k2 = inv(Hh.stream[0], Hh.stream[1], t);
  if (done < 1) {
    gCloud.visible = true;
    gCloud.position.set(wx(POS.frame[0]), wy(POS.frame[1]), 0);
    gCloud.rotation.set(0, (1 - cubicInOut(k2)) * (0.6 * Math.sin(t * 1.1) + 0.4), 0);
    u.uT.value = t; u.uK1.value = 1; u.uK2.value = k2; u.uSpread.value = 1; u.uBulbScale.value = lerp(0.62, 1, k2);
    u.uScan.value = scanProgress(t); u.uAlpha.value = 1 - done; u.uBright.value = 1;
  }
  // the resolved image becomes a real textured card that lifts into 3D, a chrome planet ring orbits it
  if (t >= Hh.done) {
    card.visible = true; card.material.opacity = done;
    const lift = cubicInOut(inv(Hh.done + 0.2, Hh.done + 1.3, t));
    const s = fw * U * (1 - 0.16 * lift);
    card.scale.set(s, s, 1);
    card.position.set(wx(POS.frame[0]), wy(POS.frame[1]) + lift * 0.1, lift * 0.3);
    card.rotation.set(-0.16 * lift, 0.42 * lift * Math.sin(1.2 + (t - Hh.done) * 0.9), 0.04 * lift);
    const rk = inv(Hh.ringIn, Hh.ringIn + 0.6, t);
    if (rk > 0) {
      gRing.visible = true; gRing.position.copy(card.position);
      gRing.scale.setScalar(Math.max(0.001, backOut(rk, 1.4)));
      gRing.rotation.set(1.22, -0.18, 0.38 + (t - Hh.ringIn) * 0.9);
    }
  }
  gl(c);
  // frame brackets + scan line
  const bk = expoOut(inv(Hh.stream[0], Hh.stream[0] + 0.4, t)) * (1 - done);
  if (bk > 0) {
    c.save(); c.strokeStyle = K.mint; c.lineWidth = 5; c.globalAlpha = bk; const L = 54, m = 18;
    for (const [x, y, dx, dy] of [[fx - m, fy - m, 1, 1], [fx + fw + m, fy - m, -1, 1], [fx - m, fy + fw + m, 1, -1], [fx + fw + m, fy + fw + m, -1, -1]]) {
      c.beginPath(); c.moveTo(x, y + dy * L); c.lineTo(x, y); c.lineTo(x + dx * L, y); c.stroke();
    }
    c.restore();
  }
  for (let i = 0; i < Hh.scan.length; i++) {
    const h = Hh.scan[i], k = inv(h, h + 0.3, t);
    if (k <= 0 || k >= 1) continue;
    const y = fy + fw * ((i + expoOut(k)) / Hh.scan.length);
    c.save(); c.fillStyle = K.mint; c.shadowColor = K.mint; c.shadowBlur = 24; c.fillRect(fx - 30, y - 3, fw + 60, 6); c.restore();
  }
  // labels
  const lab = inv(Hh.scan[0], Hh.scan[0] + 0.2, t) * (1 - done);
  if (lab > 0) {
    setFont(c, font(F.mono, 24, 700), 4); c.fillStyle = `rgba(108,218,126,${lab})`; c.textBaseline = 'alphabetic';
    const n = Math.min(6, Hh.scan.filter((h) => t >= h).length);
    c.fillText(`SCAN 0${n}/06`, fx, fy + fw + 70);
    c.textAlign = 'right'; c.fillStyle = `rgba(244,247,251,${0.7 * lab})`; c.fillText('SCHEMATIC', fx + fw, fy + fw + 70); c.textAlign = 'left';
    setFont(c, font(F.mono, 24, 700), 0);
  }
  // headline
  c.textBaseline = 'alphabetic';
  dropWord(c, 'IDEA', 80, 330, font(F.cond, 230), Hh.wordIdea2, t, { col: K.white });
  setFont(c, font(F.cond, 230)); const iw = c.measureText('IDEA').width;
  arrow(c, 80 + iw + 36, 250, 80 + iw + 250, 250, inv(Hh.arrow, Hh.arrow + 0.35, t), K.mint, 16);
  dropWord(c, 'IMAGE.', 80, 560, font(F.cond, 230), Hh.wordImage, t, { fill: (i) => (i < 5 ? K.mint : K.white) });
  // chip row after the image resolves
  const ck = inv(Hh.done + 0.5, Hh.done + 0.8, t);
  if (ck > 0) {
    const w1 = chip(c, '01 IDEA', 80, 1650, ck, { bg: K.white, fg: K.navy });
    arrow(c, 80 + w1 + 18, 1650, 80 + w1 + 88, 1650, inv(Hh.done + 0.62, Hh.done + 0.9, t), K.mint, 6);
    chip(c, '02 IMAGE', 80 + w1 + 112, 1650, inv(Hh.done + 0.75, Hh.done + 1.05, t), { bg: K.mint, fg: K.navy });
    setFont(c, font(F.mono, 22, 700), 3); c.fillStyle = `rgba(244,247,251,${0.6 * ck})`;
    c.fillText('ILLUSTRATIVE IMAGE', 80, 1730); setFont(c, font(F.mono, 22, 700), 0);
  }
}

function tape(c, y, rot, bg, fg, words, speed, t, k) {
  if (k <= 0) return;
  c.save(); c.translate(W / 2, y); c.rotate(rot);
  const h = 96, wv = 1500 * expoOut(k);
  c.fillStyle = bg; c.fillRect(-wv, -h / 2, wv * 2, h);
  setFont(c, font(F.mono, 34, 700), 6); c.fillStyle = fg; c.textBaseline = 'middle';
  let unit = 0; const parts = []; for (const w of words) { const ww = c.measureText(w).width; parts.push([w, unit]); unit += ww + 90; }
  const off = ((t * speed) % unit + unit) % unit;
  for (let rep = -3; rep <= 3; rep++) for (const [w, x0] of parts) {
    const x = x0 + rep * unit + off - unit;
    if (x < -1300 || x > 1300) continue;
    c.fillText(w, x, 2); sparkle(c, x - 45, 0, 14, fg);
  }
  setFont(c, font(F.mono, 34, 700), 0);
  c.restore();
}

function sMotion(c, t) {
  c.fillStyle = K.mist; c.fillRect(0, 0, W, H);
  const lt = t - S.motion;
  hideAll(); gHelix.visible = true;
  scene.fog = new THREE.Fog(K.mist, 8.2, 13.5);
  gHelix.position.set(wx(540), wy(1000), 0);
  gHelix.rotation.set(0.32, 0, -0.24);
  const spin = lt * 1.5 + 0.6, enter = expoOut(inv(S.motion - 0.1, S.motion + 0.6, t));
  helixCards.forEach((p, i) => {
    const a = spin + i * (Math.PI * 2 / 7), yy = (i - 6.5) * 0.36;
    const R = 2.25 * enter;
    p.position.set(Math.sin(a) * R, yy * enter, Math.cos(a) * R);
    p.rotation.set(0, a, 0);
    p.scale.setScalar(0.9 + 0.1 * enter);
  });
  gl(c);
  tape(c, 300, -0.12, K.navy, K.mint, ['CREATE IMAGES', 'IDEAVERSE', 'ALL IN ONE AI APP'], 260, t, inv(Hh.tapes, Hh.tapes + 0.4, t));
  tape(c, 1690, 0.09, K.mint, K.navy, ['IDEA', 'IMAGE', 'MOTION', 'IDEAVERSE'], -320, t, inv(Hh.tapes + 0.125, Hh.tapes + 0.55, t));
  // voice line, word by word on beats
  const words = [['made', 0], ['for', 0], ['your', 1], ['feed.', 1]];
  setFont(c, `italic 170px ${F.serif}`);
  const lines = [[], []]; words.forEach(([w, l], i) => lines[l].push([w, i]));
  lines.forEach((ln, li) => {
    const full = ln.map((x) => x[0]).join(' ');
    let x = W / 2 - c.measureText(full).width / 2; const y = 960 + li * 170;
    ln.forEach(([w, i]) => {
      const k = inv(Hh.voice[i], Hh.voice[i] + 0.3, t), ww = c.measureText(w).width;
      if (k > 0) {
        c.save(); c.globalAlpha = Math.min(1, k * 3); c.translate(x, y + 60 * (1 - expoOut(k)));
        c.lineJoin = 'round'; c.lineWidth = 26; c.strokeStyle = K.mist; c.strokeText(w, 0, 0);
        c.fillStyle = i === 3 ? '#2F8F57' : K.navy; c.fillText(w, 0, 0); c.restore();
      }
      x += ww + c.measureText(' ').width;
    });
  });
}

let ICON_TEX = null;
function sEnd(c, t) {
  c.fillStyle = K.navy; c.fillRect(0, 0, W, H);
  glow(c, POS.icon[0], POS.icon[1], 520, MINTA, 0.22 + 0.3 * pulse(t, S.end, 3));
  hideAll(); iconPlane.visible = true; gRingEnd.visible = true;
  const ik = inv(S.end, S.end + 0.45, t);
  const s = 330 * U * Math.max(0.001, backOut(ik, 1.6));
  iconPlane.scale.set(s, s, 1);
  iconPlane.position.set(wx(POS.icon[0]), wy(POS.icon[1]), 0);
  iconPlane.rotation.set(0.0, 0.5 * (1 - expoOut(ik)) + 0.08 * Math.sin(t * 1.4), 0);
  gRingEnd.position.copy(iconPlane.position);
  gRingEnd.scale.setScalar(Math.max(0.001, backOut(inv(S.end + 0.1, S.end + 0.6, t), 1.4)) * 1.15);
  gRingEnd.rotation.set(1.18, -0.2, -0.45 + (t - S.end) * 1.1);
  gl(c, { terrain: { t, amp: 0.35, fade: 0.55, speed: 1.2 } });
  c.textBaseline = 'alphabetic';
  dropWord(c, 'IDEAVERSE', W / 2, 1110, font(F.cond, 210), Hh.name, t, { align: 'center', stag: 0.035, col: K.white });
  const sk = inv(Hh.sub, Hh.sub + 0.35, t);
  if (sk > 0) {
    setFont(c, font(F.mono, 32, 700), 9); c.textAlign = 'center'; c.fillStyle = K.mint; c.globalAlpha = sk;
    c.fillText('ALL IN ONE AI APP', W / 2 + 4, 1190 + 20 * (1 - expoOut(sk))); c.globalAlpha = 1; c.textAlign = 'left'; setFont(c, font(F.mono, 32, 700), 0);
  }
  const ck = inv(Hh.cta, Hh.cta + 0.4, t);
  if (ck > 0) {
    let sc = backOut(ck, 2.2); for (const p of Hh.ctaPulse) sc *= 1 + 0.06 * pulse(t, p, 7) * (t >= p ? 1 : 0);
    const pw = 820, ph = 128, cy = 1370;
    c.save(); c.translate(W / 2, cy); c.scale(sc, sc);
    c.shadowColor = 'rgba(108,218,126,0.5)'; c.shadowBlur = 40;
    rr(c, -pw / 2, -ph / 2, pw, ph, ph / 2); c.fillStyle = K.mint; c.fill(); c.shadowBlur = 0;
    const shp = ((t - Hh.cta - 0.5) % 2) / 0.7;
    if (t > Hh.cta + 0.5 && shp < 1) {
      c.save(); rr(c, -pw / 2, -ph / 2, pw, ph, ph / 2); c.clip();
      const sx = -pw / 2 - 200 + shp * (pw + 400); const g = c.createLinearGradient(sx, 0, sx + 160, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; c.fillRect(-pw / 2, -ph / 2, pw, ph); c.restore();
    }
    setFont(c, font(F.wide, 40), 1); c.fillStyle = K.navy; c.textBaseline = 'middle'; c.textAlign = 'center';
    c.fillText('EXPLORE ON GOOGLE PLAY', -18, 3); c.textAlign = 'left'; setFont(c, font(F.wide, 40), 0);
    // north-east arrow mark
    c.strokeStyle = K.navy; c.lineWidth = 7; c.lineCap = 'round'; const ax = pw / 2 - 70;
    c.beginPath(); c.moveTo(ax - 14, 14); c.lineTo(ax + 14, -14); c.moveTo(ax - 8, -14); c.lineTo(ax + 14, -14); c.lineTo(ax + 14, 8); c.stroke();
    c.restore();
  }
}

const PAINT = { idea: sIdea, one: sOne, image: sImage, motion: sMotion, end: sEnd };
const ORDER = ['idea', 'one', 'image', 'motion', 'end'];
const sceneAt = (t) => { let k = 'idea'; for (const key of ORDER) if (t >= S[key]) k = key; return k; };
const RECT = { one: () => [POS.bulb[0], POS.bulb[1] - 60], image: () => [POS.knot[0] - 110, POS.knot[1] - 110, 220, 220] };

// ---------------------------------------------------------------- transitions
function paintTo(buf, key, t) { const c = buf.getContext('2d'); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; PAINT[key](c, t); c.restore(); }
function composite(kind, p, key) {
  const c = octx;
  if (kind === 'iris') {
    const [cx, cy] = RECT.one(); const R = Math.hypot(W, H) * expoInOut(p) + 1;
    c.drawImage(bufA, 0, 0);
    c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 7); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    c.save(); c.strokeStyle = K.white; c.globalAlpha = 1 - p; c.lineWidth = 14; c.beginPath(); c.arc(cx, cy, R + 7, 0, 7); c.stroke(); c.restore();
  } else if (kind === 'zoom') {
    const [rx, ry, rw, rh] = RECT.image(); const e = expoInOut(p);
    const cx = lerp(rx, 0, e), cy = lerp(ry, 0, e), cw = lerp(rw, W, e), ch = lerp(rh, H, e);
    const sA = cw / rw;
    c.save(); c.translate(cx + cw / 2, cy + ch / 2); c.scale(sA, sA); c.translate(-(rx + rw / 2), -(ry + rh / 2)); c.drawImage(bufA, 0, 0); c.restore();
    const sB = Math.max(cw / W, ch / H);
    c.save(); rr(c, cx, cy, cw, ch, 40 * (1 - e)); c.clip();
    c.translate(cx + cw / 2, cy + ch / 2); c.scale(sB, sB); c.translate(-W / 2, -H / 2); c.drawImage(bufB, 0, 0); c.restore();
  } else if (kind === 'slats') {
    c.drawImage(bufA, 0, 0); const n = 6, sw = W / n;
    for (let i = 0; i < n; i++) {
      const k = expoOut(clamp(p * 1.7 - (i / n) * 0.7)); if (k <= 0) continue;
      const down = i % 2 === 0, h = H * k;
      c.save(); c.beginPath(); c.rect(i * sw - 0.5, down ? 0 : H - h, sw + 1, h); c.clip(); c.drawImage(bufB, 0, 0); c.restore();
    }
  } else c.drawImage(bufB, 0, 0);
}

// ---------------------------------------------------------------- HUD + post
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d'); const d = x.createImageData(256, 256); const R = rng(5); for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); return g; })();
function hud(t) {
  const key = sceneAt(t), light = key === 'one' || key === 'motion';
  const col = light ? 'rgba(27,35,51,0.85)' : 'rgba(244,247,251,0.75)', acc = light ? K.navy : K.mint;
  const c = octx;
  c.save(); c.strokeStyle = col; c.lineWidth = 3; const m = 40, L = 34;
  for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) { c.beginPath(); c.moveTo(x, y + dy * L); c.lineTo(x, y); c.lineTo(x + dx * L, y); c.stroke(); }
  setFont(c, font(F.mono, 20, 700), 4); c.fillStyle = col; c.textBaseline = 'alphabetic';
  c.fillText('IDEAVERSE — REEL 15S', 64, 92);
  const ch = C.CH.find(([, a, b]) => t >= a && t < b) || C.CH[C.CH.length - 1];
  c.textAlign = 'right'; c.fillStyle = acc; c.fillText(ch[0], W - 64, 92);
  c.fillStyle = col; const fr = Math.floor(t * FPS + 1e-6), ss = Math.floor(fr / FPS), ff = fr % FPS;
  c.fillText(`00:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, W - 64, H - 74);
  c.textAlign = 'left'; c.fillText('COM.IDEAVERSEAI', 64, H - 74);
  // segmented progress bar
  const x0 = 64, x1 = W - 64, y = H - 52, gap = 8, total = C.dur;
  let x = x0;
  for (const [, a, b] of C.CH) {
    const w = ((b - a) / total) * (x1 - x0 - gap * (C.CH.length - 1));
    c.fillStyle = light ? 'rgba(27,35,51,0.2)' : 'rgba(244,247,251,0.18)'; c.fillRect(x, y, w, 5);
    c.fillStyle = acc; c.fillRect(x, y, w * inv(a, b, t), 5);
    x += w + gap;
  }
  setFont(c, font(F.mono, 20, 700), 0);
  c.restore();
}
function post(t) {
  const c = octx;
  // hard-cut glitch into the end card
  const gk = 1 - inv(S.end, S.end + C.TR.end[0], t);
  if (t >= S.end && gk > 0) {
    tmp.getContext('2d').drawImage(out, 0, 0);
    const R = rng(Math.floor(t * FPS));
    for (let i = 0; i < 14; i++) { const y = R() * H, h = 20 + R() * 120, dx = (R() - 0.5) * 120 * gk; c.drawImage(tmp, 0, y, W, h, dx, y, W, h); }
    c.fillStyle = `rgba(108,218,126,${0.35 * gk})`; c.fillRect(0, 0, W, H);
  }
  // impact flash on the bulb lighting
  const fl = 0.25 * pulse(t, Hh.bulbLit, 14) * (t >= Hh.bulbLit && t < S.one ? 1 : 0);
  if (fl > 0.01) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, W, H); }
  // vignette + grain
  const v = c.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.28)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.045; c.globalCompositeOperation = 'overlay';
  const R = rng(Math.floor(t * FPS) + 99); c.translate(-R() * 256, -R() * 256);
  c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.fillRect(0, 0, W + 256, H + 256); c.restore();
}

window.renderAt = (t) => {
  const key = sceneAt(t), tr = C.TR[key], T0 = S[key];
  octx.setTransform(1, 0, 0, 1, 0, 0);
  if (tr && key !== 'idea' && tr[1] !== 'cut' && t < T0 + tr[0]) {
    const prev = ORDER[ORDER.indexOf(key) - 1];
    paintTo(bufA, prev, T0 - 1 / FPS); paintTo(bufB, key, t);
    composite(tr[1], (t - T0) / tr[0], key);
  } else { paintTo(bufB, key, t); octx.drawImage(bufB, 0, 0); }
  hud(t); post(t);
  return true;
};

// ---------------------------------------------------------------- ready
window.READY = (async () => {
  await Promise.all([
    document.fonts.load(font(F.cond, 100)), document.fonts.load(font(F.wide, 100)),
    document.fonts.load(`italic 100px ${F.serif}`), document.fonts.load(font(F.mono, 20, 700)),
  ]);
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode();
  const ic = document.createElement('canvas'); ic.width = ic.height = 512; const g = ic.getContext('2d');
  rr(g, 0, 0, 512, 512, 112); g.clip(); g.drawImage(img, 0, 0, 512, 512);
  ICON_TEX = tex(ic); iconPlane.material.map = ICON_TEX; iconPlane.material.needsUpdate = true;
  window.renderAt(0);
  return document.fonts.check(font(F.cond, 100)) && document.fonts.check(font(F.mono, 20, 700));
})();
