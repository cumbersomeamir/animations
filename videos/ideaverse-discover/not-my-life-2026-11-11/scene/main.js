// Not My Life - deterministic frame renderer (Three.js, WebGL2).
// window.NML.renderFrame(f) draws film frame f (0..749) into #gl; the driver reads it back.
// All footage comes from manifest slots / UI plates; everything else here is editorial
// environment (lighting, particles, phone body, typography). No UI is drawn here.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const FPS = 30, W = 1080, H = 1920, TOTAL = 750, ASPECT = W / H;
const FOV = 32;
const ROOT = '..';

// ------------------------------------------------------------------ math helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (u) => u * u * (3 - 2 * u);
const eio = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u) => 1 - Math.pow(1 - u, 3);
const ein = (u) => u * u * u;
const TAU = Math.PI * 2;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// Fritsch-Carlson monotone cubic: C1, no overshoot.
function monotone(xs, ys) {
  const n = xs.length, d = [], m = new Array(n);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else { const h0 = xs[i] - xs[i - 1], h1 = xs[i + 1] - xs[i], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]); }
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], s = (x - xs[i]) / h, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * ys[i] + (s3 - 2 * s2 + s) * h * m[i] + (-2 * s3 + 3 * s2) * ys[i + 1] + (s3 - s2) * h * m[i + 1];
  };
}
const visH = (dist, fov = FOV) => 2 * dist * Math.tan((fov * Math.PI) / 360);

// ------------------------------------------------------------------ renderer + targets
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.autoClear = true;
const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: true, colorSpace: THREE.NoColorSpace };
const rtSampleMS = new THREE.WebGLRenderTarget(W, H, { ...rtOpts, samples: 4 });   // N <= 2
const rtSampleSS = new THREE.WebGLRenderTarget(W, H, { ...rtOpts });                // N >= 3: jittered supersampling instead of MSAA
const HALTON = [[0.5, 0.333], [0.25, 0.667], [0.75, 0.111], [0.125, 0.444], [0.625, 0.778], [0.375, 0.222], [0.875, 0.556], [0.0625, 0.889]];
const rtAccum = new THREE.WebGLRenderTarget(W, H, { ...rtOpts, depthBuffer: false });
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadGeo = new THREE.PlaneGeometry(2, 2);
const VS_QUAD = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
function quadScene(material) { const s = new THREE.Scene(); s.add(new THREE.Mesh(quadGeo, material)); return s; }

const accumMat = new THREE.ShaderMaterial({
  uniforms: { map: { value: null }, w: { value: 1 } },
  vertexShader: VS_QUAD,
  fragmentShader: 'uniform sampler2D map; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(map, vUv).rgb * w, 1.0); }',
  blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendEquation: THREE.AddEquation,
  depthTest: false, depthWrite: false,
});
const accumScene = quadScene(accumMat);

const textCanvas = document.getElementById('text');
const tctx = textCanvas.getContext('2d');
const textTex = new THREE.CanvasTexture(textCanvas);
textTex.colorSpace = THREE.NoColorSpace; textTex.minFilter = THREE.LinearFilter; textTex.generateMipmaps = false;

const finalMat = new THREE.ShaderMaterial({
  uniforms: { tScene: { value: rtAccum.texture }, tText: { value: textTex }, seed: { value: 0 }, grain: { value: 0.028 }, vignette: { value: 0.22 }, lift: { value: 0.0 }, textOn: { value: 0 } },
  vertexShader: VS_QUAD,
  fragmentShader: `
    uniform sampler2D tScene; uniform sampler2D tText; uniform float seed; uniform float grain; uniform float vignette; uniform float lift; uniform float textOn;
    varying vec2 vUv;
    vec3 toSRGB(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c)); }
    float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
    void main(){
      vec3 c = texture2D(tScene, vUv).rgb;
      vec2 q = (vUv - 0.5) * vec2(0.5625, 1.0) * 1.6;
      c *= 1.0 - vignette * smoothstep(0.25, 1.0, dot(q, q) * 1.6);
      // gentle filmic shoulder to keep highlights from clipping
      c = c / (1.0 + 0.06 * c);
      vec3 s = toSRGB(c) + lift;
      float n = hash(vUv * vec2(1080.0, 1920.0) + seed) + hash(vUv * vec2(1080.0, 1920.0) * 1.37 + seed * 1.7) - 1.0;
      s += n * grain * (1.0 - 0.55 * dot(s, vec3(0.333)));
      if (textOn > 0.5) { vec4 tx = texture2D(tText, vUv); s = mix(s, tx.rgb, tx.a); }
      gl_FragColor = vec4(clamp(s, 0.0, 1.0), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const finalScene = quadScene(finalMat);

// ------------------------------------------------------------------ textures
const texCache = new Map();
async function loadImage(url) { const img = new Image(); img.decoding = 'async'; img.src = url; await img.decode(); return img; }
function makeTex(img, srgb = true) {
  const t = new THREE.Texture(img);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.needsUpdate = true;
  return t;
}
async function stillTex(url) { if (!texCache.has(url)) texCache.set(url, makeTex(await loadImage(url))); return texCache.get(url); }
class Seq { // one texture whose image is swapped per film frame
  constructor(dir) { this.dir = dir; this.cur = -1; this.tex = null; }
  async set(i) {
    if (i === this.cur) return this.tex;
    const img = await loadImage(`${ROOT}/cache/frames/${this.dir}/${String(i).padStart(5, '0')}.jpg`);
    if (!this.tex) this.tex = makeTex(img); else { this.tex.image = img; this.tex.needsUpdate = true; }
    this.cur = i; return this.tex;
  }
}

// ------------------------------------------------------------------ shared materials
function cardMaterial(w, h, opts = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: opts.map || null }, size: { value: new THREE.Vector2(w, h) }, radius: { value: opts.radius ?? 0.022 },
      opacity: { value: 1 }, gain: { value: opts.gain ?? 1 }, bias: { value: 0 }, border: { value: opts.border ?? 0.0 },
      feather: { value: opts.feather ?? 0 }, uvRect: { value: new THREE.Vector4(0, 0, 1, 1) }, fadeY: { value: 0 },
    },
    vertexShader: VS,
    fragmentShader: `
      uniform sampler2D map; uniform vec2 size; uniform float radius; uniform float opacity; uniform float gain; uniform float bias;
      uniform float border; uniform float feather; uniform vec4 uvRect; uniform float fadeY;
      varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * size;
        vec2 q = abs(p) - (size * 0.5 - radius);
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
        float aa = max(fwidth(d), 1e-5);
        float mask = feather > 0.0 ? 1.0 - smoothstep(-feather, 0.0, d) : 1.0 - smoothstep(-aa, aa, d);
        vec2 uv = mix(uvRect.xy, uvRect.zw, vUv);
        vec3 c = texture2D(map, uv, bias).rgb * gain;
        if (border > 0.0) { float b = 1.0 - smoothstep(border - aa, border + aa, -d); c = mix(c, vec3(0.92), b * 0.85); }
        float fy = fadeY > 0.0 ? 1.0 - smoothstep(0.0, fadeY, vUv.y) : 1.0;
        gl_FragColor = vec4(c, mask * opacity * fy);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
  });
}
function shadowMesh(w, h, soft = 0.12, alpha = 0.55) {
  const m = new THREE.ShaderMaterial({
    uniforms: { size: { value: new THREE.Vector2(w + soft * 2, h + soft * 2) }, inner: { value: new THREE.Vector2(w, h) }, soft: { value: soft }, opacity: { value: alpha } },
    vertexShader: VS,
    fragmentShader: `uniform vec2 size; uniform vec2 inner; uniform float soft; uniform float opacity; varying vec2 vUv;
      void main(){ vec2 p = (vUv - 0.5) * size; vec2 q = abs(p) - inner * 0.5 + soft * 0.3; float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
        float a = 1.0 - smoothstep(-soft * 0.3, soft, d); gl_FragColor = vec4(0.0, 0.0, 0.0, a * opacity); }`,
    transparent: true, depthWrite: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w + soft * 2, h + soft * 2), m);
}
// Soft sprite particles. kind: 0 dot, 1 bubble ring, 2 bokeh disc, 3 ember
function particleMaterial(kind, additive = true) {
  return new THREE.ShaderMaterial({
    uniforms: { kind: { value: kind }, scale: { value: H / (2 * Math.tan((FOV * Math.PI) / 360)) }, gopacity: { value: 1 } },
    vertexShader: `
      attribute float psize; attribute vec4 pcolor; uniform float scale; varying vec4 vColor;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(psize * scale / max(-mv.z, 0.05), 1.0, 220.0); vColor = pcolor; }`,
    fragmentShader: `
      uniform int kind; uniform float gopacity; varying vec4 vColor;
      void main(){ vec2 p = gl_PointCoord * 2.0 - 1.0; float r = length(p); if (r > 1.0) discard;
        float a;
        if (kind == 1) a = smoothstep(1.0, 0.82, r) * (0.25 + 0.75 * smoothstep(0.55, 0.9, r)) + 0.25 * smoothstep(0.5, 0.0, length(p - vec2(-0.35, 0.35)));
        else if (kind == 2) a = smoothstep(1.0, 0.86, r) * (0.75 + 0.25 * smoothstep(0.5, 0.95, r));
        else if (kind == 3) a = exp(-r * r * 5.0);
        else a = exp(-r * r * 3.2);
        gl_FragColor = vec4(vColor.rgb, vColor.a * a * gopacity); }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}
class Particles {
  constructor(n, kind, additive = true) {
    this.n = n; const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(n * 3); this.size = new Float32Array(n); this.col = new Float32Array(n * 4);
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('psize', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('pcolor', new THREE.BufferAttribute(this.col, 4));
    this.geo = g; this.mat = particleMaterial(kind, additive);
    this.points = new THREE.Points(g, this.mat); this.points.frustumCulled = false;
  }
  commit() { for (const k of ['position', 'psize', 'pcolor']) this.geo.attributes[k].needsUpdate = true; }
}
function shaderPlane(w, h, frag, uniforms = {}, opts = {}) {
  const m = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, bright: { value: 1 }, ...uniforms }, vertexShader: VS, fragmentShader: frag, depthWrite: false, ...opts });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}
const NOISE = `
  float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }`;

// ------------------------------------------------------------------ globals filled in init()
let MAN; const T = {}; const SEQ = {}; const S = {};
const slotFrame = {
  'opening-character': (f) => (f >= 0 && f <= 89 ? f : null),
  'superhook-motion': (f) => (f >= 105 && f <= 191 ? (f < 120 ? 12 : 12 + (f - 120)) : null),
  'reveal-01-underwater': (f) => (f >= 160 && f <= 247 ? 12 + (f - 160) : null),
  'reveal-02-tokyo': (f) => (f >= 285 && f <= 374 ? 12 + (f - 285) : null),
  'reveal-03-space': (f) => (f >= 375 && f <= 479 ? 12 + (f - 375) : null),
  'payoff-spaceship': (f) => (f >= 480 ? 12 + (f - 480) : f <= 53 ? 282 + f : null),
};

// ================================================================== PHONE WORLD (S1, S8, S9)
const PH = { sw: 0.72, sh: 1.6, bw: 0.758, bh: 1.64, depth: 0.07, r: 0.09 };
const px2local = (x, y) => new THREE.Vector2(x / 1000 - PH.sw / 2, PH.sh / 2 - y / 1000);
// Opening-character overlay covers the slot crop region (image x100-620, y100-990) inside grid tile r4c1.
const OC = (() => { const k = 238 / 720, x0 = 0 + 100 * k, x1 = 0 + 620 * k, y0 = 762 + 100 * k - 20, y1 = 762 + 990 * k - 20; return { x0, x1, y0, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 }; })();
const OC_C = px2local(OC.cx, OC.cy);

function buildPhoneWorld() {
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x05060a);
  const pmrem = new THREE.PMREMGenerator(renderer);
  sc.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  const cam = new THREE.PerspectiveCamera(FOV, ASPECT, 0.01, 200);

  // world layer (payoff-spaceship slot): camera-locked backdrop, parallax from camera azimuth/elevation, depth blur
  const BD = 60, bdH = visH(BD) * 1.08, bdW = bdH * ASPECT * 1.0 / 0.5625 * 0.5625;
  const plateMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, gain: { value: 0.97 }, center: { value: new THREE.Vector2(0.5, 0.5) }, zoom: { value: 1.2 } }, vertexShader: VS,
    fragmentShader: `uniform sampler2D map; uniform float gain; uniform vec2 center; uniform float zoom; varying vec2 vUv;
      void main(){ vec2 uv = center + (vUv - 0.5) / zoom; vec3 c = texture2D(map, clamp(uv, 0.001, 0.999)).rgb * gain;
        vec2 q = (vUv - 0.5) * vec2(0.5625, 1.0); c *= 1.0 - 0.45 * exp(-dot(q, q) / 0.06); gl_FragColor = vec4(c, 1.0); }`,
    depthWrite: false, depthTest: false,
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(bdH * ASPECT * 1.08, bdH), plateMat);
  plate.position.set(0, 0, -BD); plate.renderOrder = -10; plate.frustumCulled = false; cam.add(plate); sc.add(cam);

  // phone
  const phone = new THREE.Group(); sc.add(phone);
  const shape = new THREE.Shape(); const { bw, bh, r } = PH; const x = -bw / 2, y = -bh / 2;
  shape.moveTo(x + r, y); shape.lineTo(x + bw - r, y); shape.quadraticCurveTo(x + bw, y, x + bw, y + r);
  shape.lineTo(x + bw, y + bh - r); shape.quadraticCurveTo(x + bw, y + bh, x + bw - r, y + bh);
  shape.lineTo(x + r, y + bh); shape.quadraticCurveTo(x, y + bh, x, y + bh - r); shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: PH.depth, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 6, curveSegments: 24 });
  bodyGeo.translate(0, 0, -PH.depth / 2);
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: 0x1b1d22, metalness: 0.9, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.9 }));
  phone.add(body);
  const frontZ = PH.depth / 2 + 0.012;
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), new THREE.MeshPhysicalMaterial({ color: 0x020304, metalness: 0.0, roughness: 0.06, clearcoat: 1, envMapIntensity: 0.6 }));
  glass.scale.set(0.985, 0.992, 1); glass.position.z = frontZ + 0.0004; phone.add(glass);
  const btnMat = new THREE.MeshPhysicalMaterial({ color: 0x24262b, metalness: 0.9, roughness: 0.35 });
  for (const [yy, hh] of [[0.36, 0.16], [0.12, 0.09]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.012, hh, 0.03), btnMat); b.position.set(bw / 2 + 0.012, yy, 0); phone.add(b); }

  const screenMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, size: { value: new THREE.Vector2(PH.sw, PH.sh) }, radius: { value: 0.055 }, focus: { value: new THREE.Vector2(0.5, 0.5) }, dof: { value: 0 }, sheen: { value: 0 }, gain: { value: 1.0 } },
    vertexShader: VS,
    fragmentShader: `
      uniform sampler2D map; uniform vec2 size; uniform float radius; uniform vec2 focus; uniform float dof; uniform float sheen; uniform float gain; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * size; vec2 q = abs(p) - (size * 0.5 - radius);
        float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius; float aa = max(fwidth(d), 1e-5);
        float inside = 1.0 - smoothstep(-aa, aa, d);
        float fd = length((vUv - focus) * size);
        float b = dof * smoothstep(0.05, 0.55, fd);
        vec3 c = texture2D(map, vUv, b).rgb * gain;
        float band = smoothstep(0.0, 0.35, 1.0 - abs((vUv.x * 0.45 + vUv.y) - 0.55 - sheen) * 3.0);
        c += vec3(0.035) * band;
        gl_FragColor = vec4(mix(vec3(0.004), c, inside), 1.0);
      }`,
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(PH.sw, PH.sh), screenMat);
  screen.position.z = frontZ + 0.0012; phone.add(screen);

  const ocMat = cardMaterial(OC.w / 1000, OC.h / 1000, { radius: 0.0001, feather: 0.008 });
  const oc = new THREE.Mesh(new THREE.PlaneGeometry(OC.w / 1000, OC.h / 1000), ocMat);
  oc.position.set(OC_C.x, OC_C.y, frontZ + 0.0022); oc.renderOrder = 3; phone.add(oc);

  // lights (env provides most of it)
  const key = new THREE.DirectionalLight(0xffe2c4, 2.2); key.position.set(-2.5, 3, 4); sc.add(key);
  const rim = new THREE.DirectionalLight(0xb9d4ff, 1.4); rim.position.set(3, 1, -2); sc.add(rim);

  // floating editorial cards (real result pixels)
  const cards = [];
  const cardDefs = [
    { key: 'reveal-01-underwater', p: [-0.62, 0.80, -1.3], h: 0.78, ry: 0.32, k: 1, ph: 0.3, bias: 0 },
    { key: 'reveal-03-space', p: [0.52, -0.88, 0.6], h: 0.62, ry: -0.25, k: 2, ph: 2.6, bias: 1.6 },
    { key: 'reveal-02-tokyo', p: [0.68, 0.64, -2.0], h: 0.85, ry: -0.30, k: 1, ph: 1.7, bias: 0.4 },
    { key: 'card-couple', p: [-0.60, -0.74, -1.6], h: 0.72, ry: 0.28, k: 2, ph: 4.1, bias: 0.2 },
  ];
  for (const d of cardDefs) {
    const w = d.h * 0.75; const g = new THREE.Group();
    const sh = shadowMesh(w, d.h, 0.1, 0.45); sh.position.z = -0.03; g.add(sh);
    const mat = cardMaterial(w, d.h, { radius: 0.018, border: 0.006 });
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, d.h), mat));
    g.position.set(...d.p); g.rotation.y = d.ry; sc.add(g); cards.push({ ...d, g, mat, sh });
  }

  // warm dust motes, exactly periodic over the 25 s loop
  const dust = new Particles(260, 0, true); sc.add(dust.points);
  const R = rng(7); const dd = [];
  for (let i = 0; i < dust.n; i++) dd.push({ x: (R() - 0.5) * 6, y: (R() - 0.5) * 8, z: -6.5 + R() * 9, a: 0.05 + R() * 0.25, k: 1 + Math.floor(R() * 3), ph: R() * TAU, s: 0.006 + R() * 0.018 * (R() < 0.15 ? 3 : 1), b: 0.25 + R() * 0.6 });

  // world blur targets
  const rtA = new THREE.WebGLRenderTarget(720, 1280, { type: THREE.HalfFloatType, depthBuffer: false });
  const rtB = new THREE.WebGLRenderTarget(720, 1280, { type: THREE.HalfFloatType, depthBuffer: false });
  const blurMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, dir: { value: new THREE.Vector2() }, sigma: { value: 3 } }, vertexShader: VS_QUAD,
    fragmentShader: `uniform sampler2D map; uniform vec2 dir; uniform float sigma; varying vec2 vUv;
      void main(){ vec3 s = vec3(0.0); float ws = 0.0; for (int i = -12; i <= 12; i++){ float x = float(i) * sigma / 4.0; float w = exp(-0.5 * x * x / (sigma * sigma));
        s += texture2D(map, vUv + dir * x).rgb * w; ws += w; } gl_FragColor = vec4(s / ws, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const blurScene = quadScene(blurMat);
  let blurredFor = null;
  function blurWorld(tex, sigmaPlate) {
    const key = tex.image.src + '|' + sigmaPlate.toFixed(2);
    if (blurredFor === key) return;
    const sigma = Math.max(0.3, sigmaPlate * 720 / 1440);
    blurMat.uniforms.map.value = tex; blurMat.uniforms.dir.value.set(1 / 720, 0); blurMat.uniforms.sigma.value = sigma;
    renderer.setRenderTarget(rtA); renderer.render(blurScene, quadCam);
    blurMat.uniforms.map.value = rtA.texture; blurMat.uniforms.dir.value.set(0, 1 / 1280);
    renderer.setRenderTarget(rtB); renderer.render(blurScene, quadCam);
    renderer.setRenderTarget(null); blurredFor = key;
    plateMat.uniforms.map.value = rtB.texture;
  }

  // ---- loop camera path, keyed on loop-time s (s = t for t >= 16, s = t + 25 for t < 3.2)
  const K = [16.0, 19.0, 22.0, 25.0, 26.8, 28.2];
  const P = {
    logD: monotone(K, [Math.log(2.02), Math.log(4.5), Math.log(4.15), Math.log(2.15), Math.log(0.462), Math.log(0.432)]),
    tx: monotone(K, [0, 0.0, 0.0, -0.09, OC_C.x, OC_C.x]),
    ty: monotone(K, [0, -0.02, 0.02, -0.06, OC_C.y, OC_C.y]),
    yaw: monotone(K, [0.0, -0.30, 0.14, 0.44, 0.0, 0.0]),
    pitch: monotone(K, [0.0, 0.09, 0.04, 0.12, 0.0, 0.0]),
    roll: monotone(K, [0.0, 0.02, -0.01, -0.04, 0.0, 0.0]),
    pry: monotone(K, [0.0, 0.20, 0.10, 0.08, 0.08, 0.08]),
  };
  let worldTex = null;

  async function prepare(f) {
    const s = f >= 480 ? f / FPS : f / FPS + 25;
    const screenTex = f >= 480 ? await SEQ.phone.set(f - 480) : T.gridScrolled;
    screenMat.uniforms.map.value = screenTex;
    const wf = slotFrame['payoff-spaceship'](f);
    worldTex = wf !== null ? await SEQ['payoff-spaceship'].set(wf) : null;
    const of = slotFrame['opening-character'](f);
    ocMat.uniforms.map.value = of !== null ? await SEQ['opening-character'].set(of) : (SEQ['opening-character'].tex || null);
    for (const c of cards) c.mat.uniforms.map.value = c.key.startsWith('card-') ? T[c.key] : T['poster:' + c.key];
    return s;
  }

  function update(s) {
    const tl = s - 16; // seconds since payoff start
    // phone pose: gentle, exactly 25 s periodic float
    phone.rotation.set(0.02 * Math.sin(TAU * s / 12.5 + 0.4), P.pry(s), 0.012 * Math.sin(TAU * s / 25));
    phone.position.set(0, 0.035 * Math.sin(TAU * s / 12.5), 0);
    phone.updateMatrixWorld(true);
    const D = Math.exp(P.logD(s)), yaw = P.yaw(s), pitch = P.pitch(s);
    const tgt = new THREE.Vector3(P.tx(s), P.ty(s), frontZ);
    const lp = tgt.clone().add(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(D));
    cam.position.copy(phone.localToWorld(lp.clone()));
    cam.up.set(0, 1, 0).applyQuaternion(phone.quaternion);
    cam.lookAt(phone.localToWorld(tgt.clone()));
    const roll = P.roll(s);
    cam.rotateZ(roll);
    cam.updateMatrixWorld(true);
    // world backdrop: parallax from camera azimuth/elevation around the phone, depth blur by distance
    const cp = cam.position; const az = Math.atan2(cp.x, cp.z), el = Math.atan2(cp.y, Math.hypot(cp.x, cp.z));
    const close = clamp((4.3 - D) / (4.3 - 1.6));
    const wc = MAN.render.payoffWorldCenter || [0.5, 0.5], wz = MAN.render.payoffWorldZoom || [1.2, 1.3];
    plateMat.uniforms.center.value.set(wc[0] - az * 0.06, wc[1] - el * 0.06);
    plateMat.uniforms.zoom.value = lerp(wz[0], wz[1], close);
    plate.rotation.z = -roll;
    const bl = MAN.render.payoffWorldBlurPx; const sig = Array.isArray(bl) ? lerp(bl[0], bl[1], close) : bl;
    if (worldTex) blurWorld(worldTex, sig);
    // screen look: lens focus toward tile r4c1 when close
    screenMat.uniforms.focus.value.set((OC.cx) / 720, 1 - OC.cy / 1600);
    screenMat.uniforms.dof.value = 2.6 * clamp((2.6 - D) / 1.6) * clamp((D - 0.55) / 0.4);
    screenMat.uniforms.sheen.value = yaw * 0.6 + pitch * 0.4;
    // opening-character overlay: invisible until the camera is close (loop-safe: 0 at s=25)
    ocMat.uniforms.opacity.value = sstep(clamp((1.28 - D) / (1.28 - 0.93)));
    // cards: present during payoff, drift, fade before the loop seam
    const cardA = 1 - sstep(seg(s, 23.4, 24.4));
    for (const c of cards) {
      c.g.visible = cardA > 0.001 && s < 25;
      c.mat.uniforms.opacity.value = cardA; c.mat.uniforms.bias.value = c.bias; c.sh.material.uniforms.opacity.value = 0.45 * cardA;
      c.g.position.set(c.p[0] + 0.05 * Math.sin(TAU * s * c.k / 25 + c.ph), c.p[1] + 0.07 * Math.sin(TAU * s * c.k / 12.5 + c.ph), c.p[2]);
      c.g.rotation.set(0.05 * Math.sin(TAU * s / 25 + c.ph), c.ry + 0.08 * Math.sin(TAU * s * c.k / 25 + c.ph * 2), 0);
    }
    // dust
    for (let i = 0; i < dust.n; i++) {
      const d = dd[i], ph = TAU * s * d.k / 25 + d.ph;
      dust.pos[i * 3] = d.x + d.a * Math.sin(ph); dust.pos[i * 3 + 1] = d.y + d.a * 1.6 * Math.sin(ph * 0.5 + d.ph) ; dust.pos[i * 3 + 2] = d.z + d.a * Math.cos(ph);
      dust.size[i] = d.s; const fl = 0.75 + 0.25 * Math.sin(ph * 3.0);
      dust.col[i * 4] = 1.0; dust.col[i * 4 + 1] = 0.82; dust.col[i * 4 + 2] = 0.6; dust.col[i * 4 + 3] = 0.32 * d.b * fl;
    }
    dust.commit();
    void tl;
    return { D };
  }
  return { scene: sc, cam, prepare, update, phone };
}

// ================================================================== R1 SPACE (S3 superhook + S4 reveal-01)
function buildR1() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x000000);
  const cam = new THREE.PerspectiveCamera(FOV, ASPECT, 0.01, 100);
  const back = shaderPlane(11, 19, `
    uniform float time; uniform float bright; varying vec2 vUv;
    float caustic(vec2 uv, float t){
      vec2 p = mod(uv * 6.2831853, 6.2831853) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
      for (int n = 0; n < 5; n++){ float tt = t * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); }
      c /= 5.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0); }
    void main(){
      float g = smoothstep(0.0, 1.0, vUv.y);
      float c = caustic(vUv * vec2(2.0, 3.5), time * 0.45 + 23.0);
      vec3 col = mix(vec3(0.0, 0.006, 0.014), vec3(0.0, 0.10, 0.12), pow(g, 1.3));
      col += vec3(0.05, 0.55, 0.52) * min(c, 2.5) * 1.3 * (0.2 + 0.8 * g);
      gl_FragColor = vec4(col * bright, 1.0);
    }`);
  back.position.set(0, 0.3, -3.6); sc.add(back);
  const shafts = shaderPlane(8, 13, `
    uniform float time; uniform float bright; varying vec2 vUv;
    void main(){ float x = vUv.x + (1.0 - vUv.y) * 0.22; float s = 0.0;
      for (int i = 0; i < 6; i++){ float fi = float(i); float c = fract(0.13 + fi * 0.173 + sin(time * 0.21 + fi) * 0.012); s += exp(-pow((x - c) * (18.0 + fi * 6.0), 2.0)) * (0.5 + 0.5 * sin(time * 0.7 + fi * 2.0)); }
      float a = s * smoothstep(0.0, 1.0, vUv.y) * 0.17 * bright; gl_FragColor = vec4(vec3(0.45, 0.95, 0.95) * a, 1.0); }`, {}, { blending: THREE.AdditiveBlending, transparent: true });
  shafts.position.set(0, 0.8, -1.4); sc.add(shafts);

  const bubbles = new Particles(240, 1, true); sc.add(bubbles.points);
  const R = rng(11); const bd = [];
  for (let i = 0; i < bubbles.n; i++) { const fg = R() < 0.12; bd.push({ x: (R() - 0.5) * (fg ? 1.6 : 3.4), y0: R() * 6, z: fg ? 0.9 + R() * 0.9 : -3 + R() * 3.4, v: 0.18 + R() * 0.5, s: fg ? 0.04 + R() * 0.06 : 0.01 + R() * 0.03, w: R() * TAU, a: fg ? 0.22 : 0.5 + R() * 0.45 }); }

  // superhook footage plane (fills frame at distance 2.75)
  const SH_D = 2.75; const shH = visH(SH_D) * 1.012, shW = shH * (500 / 890) * 1.0;
  const shMat = cardMaterial(shW, shH, { radius: 0.0001 });
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(shW, shH), shMat); sh.renderOrder = 5; sc.add(sh);
  // reveal-01 card
  const cw = 0.75, ch = 1.0; const card = new THREE.Group();
  const cs = shadowMesh(cw, ch, 0.16, 0.6); cs.position.z = -0.05; card.add(cs);
  const cMat = cardMaterial(cw, ch, { radius: 0.02 }); card.add(new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), cMat)); sc.add(card);

  async function prepare(f) {
    const a = slotFrame['superhook-motion'](f); if (a !== null) shMat.uniforms.map.value = await SEQ['superhook-motion'].set(a);
    const b = slotFrame['reveal-01-underwater'](f); if (b !== null) cMat.uniforms.map.value = await SEQ['reveal-01-underwater'].set(b);
  }
  const R1_END_D = 2.32;
  function update(t) {
    const env = sstep(seg(t, 5.45, 6.05));
    back.material.uniforms.time.value = t; back.material.uniforms.bright.value = env;
    shafts.material.uniforms.time.value = t; shafts.material.uniforms.bright.value = env;
    // superhook plane: slow push (3.5-5.5) then exits up/back into depth (5.5-6.25)
    const push = eio(seg(t, 3.5, 5.6));
    const ex = ein(seg(t, 5.5, 6.25));
    sh.visible = t < 6.3;
    sh.position.set(0, ex * 2.9, push * 0.13 - ex * 1.6);
    sh.rotation.set(-ex * 0.42, 0, 0);
    shMat.uniforms.radius.value = 0.0001 + 0.03 * sstep(seg(t, 5.5, 5.8));
    // card rises into place, lands on the 6.000 s beat
    const ri = eout(seg(t, 5.55, 6.0));
    card.visible = t >= 5.5;
    card.position.set(0, lerp(-2.5, 0, ri), lerp(0.5, 0, ri));
    const settle = eio(seg(t, 6.0, 8.27));
    card.rotation.set(lerp(0.55, 0, ri) + 0.035 * settle, -0.07 * settle, 0);
    // camera: still during superhook, slow crane-down push during reveal
    const u = eio(seg(t, 6.0, 8.27));
    cam.position.set(0, t < 6 ? 0 : lerp(0.12, 0.0, u), t < 6 ? SH_D : lerp(2.78, R1_END_D, u));
    cam.lookAt(0, t < 6 ? 0 : lerp(0.04, 0, u), 0);
    // bubbles
    for (let i = 0; i < bubbles.n; i++) {
      const d = bd[i]; const yy = ((d.y0 + d.v * t) % 6) - 3;
      bubbles.pos[i * 3] = d.x + 0.04 * Math.sin(t * 2.1 + d.w); bubbles.pos[i * 3 + 1] = yy; bubbles.pos[i * 3 + 2] = d.z;
      bubbles.size[i] = d.s; bubbles.col[i * 4] = 0.7; bubbles.col[i * 4 + 1] = 0.95; bubbles.col[i * 4 + 2] = 1.0; bubbles.col[i * 4 + 3] = d.a * env;
    }
    bubbles.commit();
  }
  return { scene: sc, cam, prepare, update, endCardWidthPx: () => (0.75 / (visH(R1_END_D) * ASPECT)) * W };
}

// ================================================================== FEED PROOF (S5) - real UI, 2D
function buildFeed(r1EndPx, r2StartPx) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, z: { value: 1 }, T: { value: new THREE.Vector2() }, Y0: { value: 110 } },
    vertexShader: VS_QUAD,
    fragmentShader: `uniform sampler2D map; uniform float z; uniform vec2 T; uniform float Y0; varying vec2 vUv;
      void main(){ vec2 fp = vec2(vUv.x * 1080.0, (1.0 - vUv.y) * 1920.0);
        vec2 base = (fp - T) / z; vec2 src = base / 1.5 + vec2(0.0, Y0);
        vec2 uv = vec2(src.x / 720.0, 1.0 - src.y / 1600.0);
        vec3 c = (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) ? vec3(0.002, 0.003, 0.005) : texture2D(map, uv).rgb;
        gl_FragColor = vec4(c, 1.0); }`,
    depthTest: false, depthWrite: false,
  });
  const sc = quadScene(mat);
  const offs = MAN._feedOffsets;
  const baseOf = (sx, sy) => new THREE.Vector2(sx * 1.5, (sy - 110) * 1.5);
  // card centre of reveal-01 corresponds to image y 575 -> tile r2c1 y 795 + (575*238/720 - 20)
  const A0 = baseOf(119, 795 + (575 * 238 / 720 - 20));
  const zs = r1EndPx / (238 * 1.5);
  const ze = r2StartPx / (238 * 1.5);
  async function prepare(f) { mat.uniforms.map.value = await SEQ.feed.set(f - 248); }
  function update(t, f) {
    const k = clamp(f - 248, 0, 36);
    const center = new THREE.Vector2(540, 960);
    let z = 1, Tv = new THREE.Vector2(0, 0);
    const uo = eout(seg(t, 248 / 30, 260 / 30));
    if (t < 260 / 30) { z = lerp(zs, 1, uo); const T0 = center.clone().sub(A0.clone().multiplyScalar(zs)); Tv = T0.multiplyScalar(1 - uo); }
    const ui = ein(seg(t, 271 / 30, 285 / 30));
    if (t >= 271 / 30) {
      const dy = offs[k].dy; const A1 = baseOf(359, 920.5 + dy);
      z = lerp(1, ze, ui); const T1 = center.clone().sub(A1.clone().multiplyScalar(ze)); Tv = T1.multiplyScalar(ui);
    }
    mat.uniforms.z.value = z; mat.uniforms.T.value.copy(Tv);
  }
  return { scene: sc, cam: quadCam, prepare, update };
}

// ================================================================== R2 NIGHT (S6)
function buildR2() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x020208);
  const cam = new THREE.PerspectiveCamera(FOV, ASPECT, 0.01, 100);
  const back = shaderPlane(16, 22, `
    uniform float time; varying vec2 vUv; ${NOISE}
    void main(){ float wx = (vUv.x - 0.5) * 16.0, wy = (vUv.y - 0.5) * 22.0;
      vec3 c = mix(vec3(0.008, 0.003, 0.012), vec3(0.0015, 0.002, 0.008), smoothstep(-1.0, 4.0, wy));
      float s1 = exp(-pow((wx + 2.6) * 1.6, 2.0)) * smoothstep(-0.3, 0.4, wy) * smoothstep(2.6, 1.6, wy);
      float s2 = exp(-pow((wx - 2.9) * 1.3, 2.0)) * smoothstep(0.0, 0.8, wy) * smoothstep(3.4, 2.2, wy);
      float s3 = exp(-pow((wx - 0.4) * 2.6, 2.0)) * smoothstep(0.2, 0.6, wy) * smoothstep(1.4, 0.9, wy);
      float s4 = exp(-pow((wx + 5.0) * 1.2, 2.0)) * smoothstep(0.5, 1.2, wy) * smoothstep(4.0, 2.8, wy);
      c += vec3(0.32, 0.02, 0.17) * s1 * 0.28 + vec3(0.0, 0.17, 0.30) * s2 * 0.26 + vec3(0.30, 0.15, 0.02) * s3 * 0.22 + vec3(0.12, 0.05, 0.3) * s4 * 0.2;
      c += vec3(0.025, 0.006, 0.022) * exp(-pow((wy + 0.3) * 0.9, 2.0)) * (0.55 + 0.45 * fbm(vUv * vec2(5.0, 2.0) + time * 0.03));
      gl_FragColor = vec4(c, 1.0); }`);
  back.position.set(0, 0, -6); back.material.depthWrite = true; sc.add(back);
  const FLOOR_Y = -0.58;
  const floor = shaderPlane(14, 12, `
    uniform float time; varying vec2 vUv; ${NOISE}
    void main(){ float x = vUv.x; float s = 0.0;
      s += exp(-pow((x - 0.30) * 14.0, 2.0)) * vec3(1.0).x;
      vec3 c = vec3(0.004, 0.005, 0.012);
      c = vec3(0.0015, 0.0018, 0.004);
      c += vec3(0.30, 0.02, 0.18) * exp(-pow((x - 0.31) * 45.0, 2.0)) * smoothstep(0.3, 1.0, vUv.y) * 0.22;
      c += vec3(0.0, 0.18, 0.30) * exp(-pow((x - 0.70) * 38.0, 2.0)) * smoothstep(0.3, 1.0, vUv.y) * 0.2;
      c += vec3(0.30, 0.15, 0.02) * exp(-pow((x - 0.53) * 60.0, 2.0)) * smoothstep(0.45, 1.0, vUv.y) * 0.18;
      c *= 0.6 + 0.8 * vnoise(vec2(x * 90.0, vUv.y * 10.0 + time * 0.2));
      gl_FragColor = vec4(c, 1.0); }`);
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, FLOOR_Y, -2.5); floor.material.depthWrite = true; sc.add(floor);

  const cw = 0.75, ch = 1.0; const card = new THREE.Group(); sc.add(card);
  const cMat = cardMaterial(cw, ch, { radius: 0.02 }); const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), cMat); card.add(cMesh);
  const glow = shaderPlane(1.9, 2.3, `varying vec2 vUv; void main(){ vec2 p = (vUv - 0.5) * vec2(1.9, 2.3); float d = length(max(abs(p) - vec2(0.32, 0.45), 0.0)); float a = exp(-d * d * 18.0) * 0.12;
      gl_FragColor = vec4(vec3(0.55, 0.12, 0.6) * a, 1.0); }`, {}, { blending: THREE.AdditiveBlending, transparent: true });
  glow.position.z = -0.08; glow.visible = false; // removed: floor clipped its lower edge into a hard purple band
  // reflection: mirrored copy below the floor line, faded and softened
  const rMat = cardMaterial(cw, ch, { radius: 0.02 }); const refl = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), rMat);
  refl.scale.y = -1; rMat.depthTest = false; refl.renderOrder = 2; sc.add(refl);

  const bokeh = new Particles(190, 2, true); sc.add(bokeh.points);
  const R = rng(23); const bk = [];
  const pal = [[1.0, 0.24, 0.62], [0.24, 0.85, 1.0], [1.0, 0.68, 0.28], [0.6, 0.35, 1.0]];
  for (let i = 0; i < bokeh.n; i++) { const fg = i < 10; bk.push({ x: (R() - 0.5) * (fg ? 2.2 : 7.5), y: fg ? -0.8 + R() * 2.2 : -0.45 + R() * 3.2, z: fg ? 0.9 + R() * 0.8 : -5.2 + R() * 3.8, s: fg ? 0.12 + R() * 0.14 : 0.025 + R() * 0.1, c: pal[Math.floor(R() * pal.length)], a: fg ? 0.06 : 0.25 + R() * 0.45, ph: R() * TAU }); }
  const rainN = 950; const rainPos = new Float32Array(rainN * 6); const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xa9c0ff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); rain.frustumCulled = false; sc.add(rain);
  const rd = []; for (let i = 0; i < rainN; i++) rd.push({ x: (R() - 0.5) * 5.5, y0: R() * 4.5, z: -3.5 + R() * 5.2, v: 5 + R() * 3, l: 0.06 + R() * 0.14 });

  async function prepare(f) { const a = slotFrame['reveal-02-tokyo'](f); if (a !== null) { const tx = await SEQ['reveal-02-tokyo'].set(a); cMat.uniforms.map.value = tx; rMat.uniforms.map.value = tx; } }
  let D0 = 2.37;
  function setStart(px) { D0 = (cw / (px / W)) / (2 * Math.tan((FOV * Math.PI) / 360) * ASPECT); }
  function update(t) {
    back.material.uniforms.time.value = t; floor.material.uniforms.time.value = t;
    const lt = t - 9.5;
    const pin = eout(seg(lt, 0, 0.33));          // continue the push for 10 frames
    const tr = eio(seg(lt, 0.25, 2.55));         // truck + pull back
    const whip = ein(seg(lt, 2.42, 3.0));        // whip-pan out
    const D = lerp(D0, D0 * 0.93, pin) + (3.25 - D0 * 0.93) * tr;
    const cx = 0.62 * tr + 0.45 * whip, cy = 0.07 * tr;
    cam.position.set(cx, cy, D);
    cam.lookAt(0.2 * tr + 3.6 * whip, 0.0, 0);
    card.rotation.set(0, -0.3 * tr, 0); card.position.set(0, 0, 0);
    refl.position.set(0, 2 * FLOOR_Y, 0); refl.rotation.set(0, -0.3 * tr, 0);
    refl.scale.set(1, -1, 1);
    rMat.uniforms.opacity.value = 0.34; rMat.uniforms.bias.value = 2.2; rMat.uniforms.fadeY.value = 0.75;
    rMat.uniforms.gain.value = 0.55;
    for (let i = 0; i < bokeh.n; i++) { const b = bk[i]; bokeh.pos[i * 3] = b.x; bokeh.pos[i * 3 + 1] = b.y; bokeh.pos[i * 3 + 2] = b.z; bokeh.size[i] = b.s;
      const pulse = 0.8 + 0.2 * Math.sin(t * 1.3 + b.ph); bokeh.col[i * 4] = b.c[0]; bokeh.col[i * 4 + 1] = b.c[1]; bokeh.col[i * 4 + 2] = b.c[2]; bokeh.col[i * 4 + 3] = b.a * pulse; }
    bokeh.commit();
    for (let i = 0; i < rainN; i++) { const d = rd[i]; const y = 2.6 - ((d.y0 + d.v * t) % 4.5); const o = i * 6;
      rainPos[o] = d.x; rainPos[o + 1] = y; rainPos[o + 2] = d.z; rainPos[o + 3] = d.x - 0.012; rainPos[o + 4] = y - d.l; rainPos[o + 5] = d.z; }
    rainGeo.attributes.position.needsUpdate = true;
  }
  return { scene: sc, cam, prepare, update, setStart };
}

// ================================================================== R3 SPACE (S7)
function buildR3() {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(0x010103);
  const cam = new THREE.PerspectiveCamera(40, ASPECT, 0.01, 400);
  const neb = shaderPlane(140, 240, `
    uniform float time; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p = vUv * vec2(4.0, 7.0);
      float n = fbm(p + vec2(0.0, time * 0.02)); float m = fbm(p * 2.1 - 3.0);
      vec3 c = vec3(0.003, 0.004, 0.012);
      c += vec3(0.16, 0.05, 0.012) * pow(n, 2.6) * smoothstep(0.8, 0.2, vUv.y) * 1.8;
      c += vec3(0.012, 0.035, 0.075) * pow(m, 2.2) * 1.6;
      gl_FragColor = vec4(c, 1.0); }`);
  neb.position.set(0, 0, -120); sc.add(neb);
  const stars = new Particles(1600, 0, true); sc.add(stars.points);
  const R = rng(31); const st = [];
  for (let i = 0; i < stars.n; i++) { const th = R() * TAU, ph = Math.acos(2 * R() - 1), r = 25 + R() * 70; st.push({ x: r * Math.sin(ph) * Math.cos(th), y: r * Math.sin(ph) * Math.sin(th), z: -Math.abs(r * Math.cos(ph)) - 6, s: 0.06 + R() * 0.16 * (R() < 0.06 ? 3 : 1), a: 0.35 + R() * 0.65, tw: R() * TAU, warm: R() < 0.2 }); }
  for (let i = 0; i < stars.n; i++) { const s = st[i]; stars.pos[i * 3] = s.x; stars.pos[i * 3 + 1] = s.y; stars.pos[i * 3 + 2] = s.z; stars.size[i] = s.s; }
  const embers = new Particles(320, 3, true); sc.add(embers.points);
  const em = []; for (let i = 0; i < embers.n; i++) em.push({ x: (R() - 0.5) * 3.2, y0: R() * 4.5, z: -2.2 + R() * 3.4, v: 0.15 + R() * 0.45, s: 0.006 + R() * 0.02, ph: R() * TAU, w: 0.3 + R() * 0.8 });
  const cw = 0.75, ch = 1.0; const card = new THREE.Group(); sc.add(card);
  const halo = shaderPlane(3.2, 3.6, `uniform float bright; varying vec2 vUv; void main(){ vec2 p = (vUv - 0.5) * vec2(3.2, 3.6); float d = length(p * vec2(1.0, 0.8)); float a = (exp(-d * d * 1.6) * 0.16 + exp(-d * d * 7.0) * 0.08) * bright;
      gl_FragColor = vec4(vec3(1.0, 0.45, 0.14) * a, 1.0); }`, {}, { blending: THREE.AdditiveBlending, transparent: true });
  halo.position.z = -0.12; card.add(halo);
  const cMat = cardMaterial(cw, ch, { radius: 0.02 }); card.add(new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), cMat));
  async function prepare(f) { const a = slotFrame['reveal-03-space'](f); if (a !== null) cMat.uniforms.map.value = await SEQ['reveal-03-space'].set(a); }
  function update(t) {
    const lt = t - 12.5;
    const arrive = eout(seg(lt, 0, 0.38));
    const spin = eio(seg(lt, 0.0, 1.95));
    const dz = eio(seg(lt, 0.3, 2.95));
    const thru = ein(seg(lt, 2.95, 3.5));
    const D = lerp(9.2, 2.5, dz) - 0.95 * thru;
    cam.fov = lerp(42, 28, dz) - 2 * thru; cam.updateProjectionMatrix();
    cam.position.set(lerp(-0.6, 0, arrive) * (1 - dz), lerp(0.25, 0.04, dz), D);
    cam.lookAt(lerp(-2.2, 0, arrive), 0.0, 0);
    card.rotation.set(0.06 * (1 - spin), lerp(1.02, 0, spin), lerp(-0.14, 0, spin));
    halo.material.uniforms.bright.value = 0.4 + 0.6 * spin;
    stars.mat.uniforms.scale.value = H / (2 * Math.tan((cam.fov * Math.PI) / 360));
    embers.mat.uniforms.scale.value = stars.mat.uniforms.scale.value;
    for (let i = 0; i < stars.n; i++) { const s = st[i]; const tw = 0.75 + 0.25 * Math.sin(t * 3.0 + s.tw);
      stars.col[i * 4] = s.warm ? 1.0 : 0.8; stars.col[i * 4 + 1] = s.warm ? 0.8 : 0.88; stars.col[i * 4 + 2] = s.warm ? 0.6 : 1.0; stars.col[i * 4 + 3] = s.a * tw; }
    for (let i = 0; i < embers.n; i++) { const e = em[i]; const y = ((e.y0 + e.v * t) % 4.5) - 2.2; const fl = 0.55 + 0.45 * Math.sin(t * 9.0 * e.w + e.ph);
      embers.pos[i * 3] = e.x + 0.1 * Math.sin(t * e.w + e.ph); embers.pos[i * 3 + 1] = y; embers.pos[i * 3 + 2] = e.z; embers.size[i] = e.s;
      embers.col[i * 4] = 1.0; embers.col[i * 4 + 1] = 0.5 + 0.2 * fl; embers.col[i * 4 + 2] = 0.12; embers.col[i * 4 + 3] = 0.75 * fl * smoothstepJS(-2.2, -1.2, y) * (1 - smoothstepJS(1.6, 2.3, y)); }
    stars.commit(); embers.commit();
  }
  return { scene: sc, cam, prepare, update };
}
function smoothstepJS(a, b, x) { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); }

// ================================================================== TYPOGRAPHY (2D overlay, sRGB)
const FONT = 'NMLDisplay';
const TEXT_CX = 500; // centre of the requested typography safe area x 100..900
let TEXT_BOXES = [];
function fitSize(lines, weight, maxW, start) { let s = start; for (;;) { tctx.font = `${weight} ${s}px ${FONT}`; const w = Math.max(...lines.map((l) => tctx.measureText(l).width)); if (w <= maxW || s < 20) return s; s -= 2; } }
function drawLines(lines, { weight = 700, size, cy, alpha = 1, shadow = 0.5, tracking = -0.02, scale = 1, lineGap = 0.98 }) {
  tctx.save(); tctx.globalAlpha = alpha; tctx.textAlign = 'center'; tctx.textBaseline = 'middle'; tctx.fillStyle = '#ffffff';
  tctx.font = `${weight} ${size}px ${FONT}`; tctx.letterSpacing = `${tracking * size}px`;
  tctx.translate(TEXT_CX, cy); tctx.scale(scale, scale);
  const lh = size * lineGap; const y0 = -((lines.length - 1) * lh) / 2;
  if (shadow > 0) { tctx.shadowColor = `rgba(0,0,0,${shadow})`; tctx.shadowBlur = size * 0.35; tctx.shadowOffsetY = size * 0.04; }
  lines.forEach((l, i) => {
    tctx.fillText(l, 0, y0 + i * lh);
    const m = tctx.measureText(l), yc = cy + (y0 + i * lh) * scale;
    TEXT_BOXES.push({ text: l, x0: TEXT_CX - (m.width * scale) / 2, x1: TEXT_CX + (m.width * scale) / 2, y0: yc - m.actualBoundingBoxAscent * scale, y1: yc + m.actualBoundingBoxDescent * scale, alpha });
  });
  tctx.restore();
}
function drawText(t) {
  tctx.clearRect(0, 0, W, H); TEXT_BOXES = [];
  let on = false;
  // NEVER HAPPENED.  f78-104 (over image, then on the 0.5 s black card)
  if (t >= 78 / 30 && t < 105 / 30) {
    const a = sstep(seg(t, 78 / 30, 82 / 30)); const lines = ['NEVER', 'HAPPENED.'];
    const size = fitSize(lines, 700, 770, 190);
    drawLines(lines, { size, cy: 960, alpha: a, shadow: t < 3.0 ? 0.55 : 0, scale: lerp(1.035, 1.0, eout(seg(t, 78 / 30, 92 / 30))) * (t >= 3.0 ? lerp(1.0, 0.982, seg(t, 3.0, 3.5)) : 1), tracking: -0.025, lineGap: 0.96 });
    on = true;
  }
  // THEN ONE MOVED.  f121-152, lower third (safe y <= 1500)
  if (t >= 121 / 30 && t < 153 / 30) {
    const a = sstep(seg(t, 121 / 30, 125 / 30)) * (1 - sstep(seg(t, 148 / 30, 153 / 30))); const lines = ['THEN ONE', 'MOVED.'];
    const size = fitSize(lines, 700, 760, 150);
    drawLines(lines, { size, cy: 1345, alpha: a, shadow: 0.6, scale: lerp(1.03, 1.0, eout(seg(t, 121 / 30, 140 / 30))), tracking: -0.022, lineGap: 0.98 });
    on = true;
  }
  // Which life would you pick?  f668-728, top safe band
  if (t >= 668 / 30 && t < 729 / 30) {
    const a = sstep(seg(t, 668 / 30, 676 / 30)) * (1 - sstep(seg(t, 720 / 30, 729 / 30))); const lines = ['Which life', 'would you pick?'];
    const size = fitSize(lines, 600, 770, 96);
    drawLines(lines, { weight: 600, size, cy: 395 - 8 * eout(seg(t, 668 / 30, 690 / 30)), alpha: a, shadow: 0.65, tracking: -0.018, lineGap: 1.08 });
    on = true;
  }
  if (on) textTex.needsUpdate = true;
  return on;
}

// ================================================================== FRAME DISPATCH
let PW, R1, FEED, R2, R3;
const blackScene = new THREE.Scene(); blackScene.background = new THREE.Color(0x000000);
function shotOf(f) {
  if (f <= 89) return 'hook'; if (f <= 104) return 'card'; if (f <= 179) return 'r1'; if (f <= 247) return 'r1';
  if (f <= 284) return 'feed'; if (f <= 374) return 'r2'; if (f <= 479) return 'r3'; return 'hook';
}
const SHOT_RANGE = { hookA: [0, 89], card: [90, 104], r1: [105, 247], feed: [248, 284], r2: [285, 374], r3: [375, 479], hookB: [480, 749] };
function samplesFor(f) {
  if (f <= 53) return 4; if (f <= 89) return 2; if (f <= 104) return 1;
  if (f >= 160 && f <= 192) return 6; if (f <= 247) return 2;
  if (f <= 260) return 6; if (f >= 268 && f <= 290) return 6; if (f <= 354) return 2; if (f <= 374) return 8;
  if (f <= 390) return 6; if (f >= 452 && f <= 479) return 6; if (f <= 479) return 2;
  if (f <= 510) return 4; if (f <= 655) return 2; return 3;
}

async function renderFrame(f, opts = {}) {
  const shot = shotOf(f);
  const N = opts.samples ?? samplesFor(f);
  const shutter = MAN.render.motionBlurShutter ?? 0.5;
  // keep sub-samples inside the shot (never straddle a cut)
  const range = Object.values(SHOT_RANGE).find(([a, b]) => f >= a && f <= b);
  let mod;
  if (shot === 'hook') { await PW.prepare(f); mod = PW; }
  else if (shot === 'r1') { await R1.prepare(f); mod = R1; }
  else if (shot === 'feed') { await FEED.prepare(f); mod = FEED; }
  else if (shot === 'r2') { await R2.prepare(f); mod = R2; }
  else if (shot === 'r3') { await R3.prepare(f); mod = R3; }
  for (let i = 0; i < N; i++) {
    let tf = N === 1 ? f : f + ((i + 0.5) / N - 0.5) * shutter;
    tf = clamp(tf, range[0] - 0.49, range[1] + 0.49);
    const t = tf / FPS;
    let sc, cam;
    if (shot === 'card') { sc = blackScene; cam = quadCam; }
    else if (shot === 'hook') { const s = f >= 480 ? t : t + 25; mod.update(s); sc = mod.scene; cam = mod.cam; }
    else if (shot === 'feed') { mod.update(t, f); sc = mod.scene; cam = mod.cam; }
    else { mod.update(t); sc = mod.scene; cam = mod.cam; }
    const rtS = N >= 3 ? rtSampleSS : rtSampleMS;
    const jit = N >= 2 && cam.isPerspectiveCamera;
    if (jit) { const [jx, jy] = HALTON[i % HALTON.length]; cam.setViewOffset(W, H, jx - 0.5, jy - 0.5, W, H); }
    renderer.setRenderTarget(N === 1 ? rtAccum : rtS);
    renderer.render(sc, cam);
    if (jit) cam.clearViewOffset();
    if (N > 1) {
      accumMat.uniforms.map.value = rtS.texture; accumMat.uniforms.w.value = 1 / N;
      renderer.setRenderTarget(rtAccum); renderer.autoClear = i === 0; if (i === 0) renderer.clear(); renderer.render(accumScene, quadCam); renderer.autoClear = true;
    }
  }
  const textOn = drawText(f / FPS);
  finalMat.uniforms.textOn.value = textOn ? 1 : 0;
  finalMat.uniforms.seed.value = (f * 7.13) % 97.0;
  renderer.setRenderTarget(null);
  renderer.render(finalScene, quadCam);
  return { shot, samples: N };
}

function readPixels() {
  const gl = renderer.getContext(); const px = new Uint8Array(W * H * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px); return px;
}

async function init() {
  MAN = await (await fetch(`${ROOT}/manifest.json`)).json();
  MAN._feedOffsets = (await (await fetch(`${ROOT}/${MAN.uiPlates['feed-proof'].offsets}`)).json()).frames;
  await document.fonts.load(`700 100px ${FONT}`); await document.fonts.load(`600 100px ${FONT}`);
  T.gridScrolled = await stillTex(`${ROOT}/${MAN.uiPlates['grid-scrolled'].file}`);
  for (const k of ['card-couple']) T[k] = await stillTex(`${ROOT}/${MAN.editorialPlates[k].file}`);
  for (const k of Object.keys(MAN.slots)) { SEQ[k] = new Seq(k); T['poster:' + k] = await stillTex(`${ROOT}/${MAN.slots[k].poster}`); }
  SEQ.phone = new Seq('phone-screen-payoff'); SEQ.feed = new Seq('feed-proof');
  PW = buildPhoneWorld(); R1 = buildR1(); R2 = buildR2(); R3 = buildR3();
  const r2StartPx = 1058;
  R2.setStart(r2StartPx);
  FEED = buildFeed(R1.endCardWidthPx(), r2StartPx);
  // warm up shader compilation
  for (const f of [0, 120, 200, 260, 300, 400, 500]) await renderFrame(f, { samples: 1 });
  return true;
}

function textBoxes(f) { drawText(f / FPS); return TEXT_BOXES.map((b) => ({ ...b, x0: Math.round(b.x0), x1: Math.round(b.x1), y0: Math.round(b.y0), y1: Math.round(b.y1) })); }
window.NML = { ready: init(), renderFrame, readPixels, textBoxes, FPS, TOTAL };
