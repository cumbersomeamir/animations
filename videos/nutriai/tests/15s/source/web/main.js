// main.js: Three.js harness. Two ShaderMaterials on a full-screen quad:
//   1. fluid.frag  -> half-resolution WebGLRenderTarget (heavy domain-warped fbm)
//   2. composite.frag -> full-resolution canvas (SDF shapes, ripples, text, icon)
// Seek/freeze harness from the shader-glsl skill: ?t=N renders one deterministic frame at N seconds.
import * as THREE from 'three';
import { makeState } from './state.js';

const W = 1080, H = 1920;
const get = async (u) => (await fetch(u)).text();
const TL = JSON.parse(await get('../timeline.json'));
const common = await get('shaders/common.glsl');
const fluidSrc = (await get('shaders/fluid.frag')).replace('@@COMMON@@', common);
const compSrc = (await get('shaders/composite.frag')).replace('@@COMMON@@', common);
const VERT = 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }';

// Fonts (vendored Inter, OFL) under private family names.
const fonts = [
  ['NDisplay', '../fonts/InterDisplay-Black.otf', '900'],
  ['NText', '../fonts/Inter-SemiBold.otf', '600'],
  ['NText', '../fonts/Inter-Bold.otf', '700'],
];
for (const [fam, url, weight] of fonts) {
  const ff = new FontFace(fam, `url(${url})`, { weight });
  await ff.load();
  document.fonts.add(ff);
}

const MIST = '#EDF6E5', LIME = '#A6E955', GRN = '#86DA3F', INK = '#151E16';
function textCanvas(draw) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.textBaseline = 'alphabetic';
  draw(g);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.premultiplyAlpha = false;
  return { tex, canvas: c };
}
// draw a centred line made of [text, colour] runs
function runs(g, parts, y, font) {
  g.font = font;
  const total = parts.reduce((a, [s]) => a + g.measureText(s).width, 0);
  let x = W / 2 - total / 2;
  g.textAlign = 'left';
  for (const [s, col] of parts) {
    g.fillStyle = col;
    g.fillText(s, x, y);
    x += g.measureText(s).width;
  }
  return { x0: W / 2 - total / 2, x1: W / 2 + total / 2 };
}
const BOXES = {};
const capFont = '900 118px NDisplay';
const capA = textCanvas((g) => {
  BOXES.capA = [runs(g, [['Every ', MIST], ['bite.', LIME]], 330, capFont), runs(g, [['Every ', MIST], ['sip.', LIME]], 462, capFont)];
});
const capB = textCanvas((g) => {
  BOXES.capB = [runs(g, [['Track every', MIST]], 330, capFont), runs(g, [['meal.', LIME]], 462, capFont)];
});
const capC = textCanvas((g) => {
  BOXES.capC = [runs(g, [['Log every ', MIST], ['glass', LIME]], 330, capFont), runs(g, [['of ', MIST], ['water.', LIME]], 462, capFont)];
});
const labels = textCanvas((g) => {
  g.font = '600 46px NText';
  g.textAlign = 'right';
  const L = [['Breakfast', 690, 760], ['Lunch', 862, 995], ['Dinner', 690, 1240]];
  BOXES.labels = [];
  for (const [s, x, y] of L) {
    g.fillStyle = MIST;
    g.fillText(s, x, y);
    const w = g.measureText(s).width;
    g.fillStyle = LIME;
    g.beginPath();
    g.arc(x - w - 22, y - 15, 9, 0, Math.PI * 2);
    g.fill();
    BOXES.labels.push({ x0: x - w - 31, x1: x, y });
  }
});
const endCard = textCanvas((g) => {
  BOXES.end = [];
  BOXES.end.push(runs(g, [['NutriAI', MIST]], 995, '900 164px NDisplay'));
  BOXES.end.push(runs(g, [['Calorie Tracker', GRN]], 1080, '600 58px NText'));
  BOXES.end.push(runs(g, [['Meals · Water · Weight · Fasting', 'rgba(237,246,229,0.86)']], 1165, '600 40px NText'));
  g.textBaseline = 'middle';
  BOXES.end.push(runs(g, [['Explore on Google Play', INK]], 1302, '700 52px NText'));
});

const icon = await new Promise((res, rej) => new THREE.TextureLoader().load('../assets/icon.png', res, undefined, rej));
icon.premultiplyAlpha = true;
icon.needsUpdate = true;

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: false });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
document.body.appendChild(renderer.domElement);
const rt = new THREE.WebGLRenderTarget(W / 2, H / 2, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false });
const cam = new THREE.Camera();
const quad = () => new THREE.PlaneGeometry(2, 2);

const fluidU = {
  u_time: { value: 0 }, u_res: { value: new THREE.Vector2(W / 2, H / 2) }, u_front: { value: 0 }, u_w: { value: new THREE.Vector4() },
  u_ring: { value: 0 }, u_melt: { value: 0 }, u_level: { value: 0 }, u_vortex: { value: 0 }, u_logo: { value: 0 }, u_base: { value: 0.1 }, u_energy: { value: 1 },
};
const fluidMat = new THREE.ShaderMaterial({ uniforms: fluidU, vertexShader: VERT, fragmentShader: fluidSrc, depthTest: false, depthWrite: false });
const fluidScene = new THREE.Scene();
fluidScene.add(new THREE.Mesh(quad(), fluidMat));

const v4 = () => ({ value: new THREE.Vector4() });
const compU = {
  u_fluid: { value: rt.texture }, u_capA: { value: capA.tex }, u_capB: { value: capB.tex }, u_capC: { value: capC.tex }, u_labels: { value: labels.tex }, u_end: { value: endCard.tex }, u_icon: { value: icon },
  u_capP: v4(), u_labP: { value: new THREE.Vector3() }, u_endP: v4(), u_rip: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) },
  u_time: { value: 0 }, u_frame: { value: 0 }, u_res: { value: new THREE.Vector2(W, H) }, u_drop: v4(),
  u_ringVis: { value: 0 }, u_ringCrisp: { value: 0 }, u_forkVis: { value: 0 }, u_seg: { value: new THREE.Vector3() }, u_blob0: v4(), u_blob1: v4(), u_blob2: v4(),
  u_melt: { value: 0 }, u_glassVis: { value: 0 }, u_level: { value: 0 }, u_wave: { value: 0 }, u_wd0: v4(), u_wd1: v4(), u_ticks: { value: 0 },
  u_logoVis: { value: 0 }, u_logoCrisp: { value: 0 }, u_iconMix: { value: 0 }, u_btn: { value: 0 }, u_press: { value: 0 }, u_ca: { value: 0 }, u_dim: { value: 0 }, u_flash: { value: 0 }, u_antic: { value: 0 }, u_scrim: { value: 0 },
};
const compMat = new THREE.ShaderMaterial({ uniforms: compU, vertexShader: VERT, fragmentShader: compSrc, depthTest: false, depthWrite: false });
const compScene = new THREE.Scene();
compScene.add(new THREE.Mesh(quad(), compMat));

const stateAt = makeState(TL);
function setU(U, S) {
  for (const [k, v] of Object.entries(S)) {
    if (!U[k]) continue;
    const cur = U[k].value;
    if (Array.isArray(v) && Array.isArray(cur)) v.forEach((x, i) => cur[i].set(...x));
    else if (Array.isArray(v)) cur.set(...v);
    else U[k].value = v;
  }
}

window.renderFrame = (f) => {
  const S = stateAt(f);
  setU(fluidU, S);
  setU(compU, S);
  renderer.setRenderTarget(rt);
  renderer.render(fluidScene, cam);
  renderer.setRenderTarget(null);
  renderer.render(compScene, cam);
  return S;
};
// Raw RGBA readback (bottom-up rows), base64 for transfer to Node.
const px = new Uint8Array(W * H * 4);
window.grab = () => {
  const gl = renderer.getContext();
  gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let s = '';
  const CH = 0x8000;
  for (let i = 0; i < px.length; i += CH) s += String.fromCharCode.apply(null, px.subarray(i, i + CH));
  return btoa(s);
};
window.renderAndGrab = (f) => { window.renderFrame(f); return window.grab(); };
window.TEXT_BOXES = BOXES;
window.TL = TL;

// Seek/freeze harness (skill): ?t=seconds renders exactly one frame; ?play loops for preview.
const q = new URLSearchParams(location.search);
if (q.get('t') !== null) window.renderFrame(Math.round(parseFloat(q.get('t')) * TL.fps));
else if (q.get('play') !== null) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let f = 0;
  renderer.setAnimationLoop(() => { window.renderFrame(reduce ? 400 : f); f = (f + 1) % TL.frames; });
}
window.__ready = true;
