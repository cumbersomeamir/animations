// Help — Educational Pilot 01: "What a delivery video proves — and what it doesn't"
// Deterministic frame renderer: window.__renderFrame(frameIndex) draws exactly
// that moment; nothing depends on wall-clock time.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createFigure } from './rig/figure.js';
import { PAL, buildWorld, buildParcel, buildClipFrame, buildDateTag, buildPin, buildQuestion, buildPanel, textCanvas, rr, tick } from './world.js';

const W = 1080, H = 1920;
const params = new URLSearchParams(location.search);
const MODE = params.get('mode') || 'film';

const TL = await (await fetch('./timeline.json')).json();
const SCRIPT = await (await fetch('./script.json')).json();
let LIP = [];
try { const r = await fetch('./generated/lipsync.json'); if (r.ok) LIP = await r.json(); } catch (e) { /* silent: mouth stays procedural */ }
const LINE_META = await (async () => { try { const r = await fetch('./generated/lines.json'); return r.ok ? await r.json() : null; } catch { return null; } })();

for (const f of ['600 1em Inter', '800 1em Inter', '700 1em "Inter Display"']) await document.fonts.load(f);
await document.fonts.ready;

const C = TL.cues, LN = TL.lines, FPS = TL.fps, DUR = TL.duration;
const S = Object.values(TL.shots); // [[a,b],...] in order A..E

// ---------- easing / tracks ----------
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;
const E = {
  lin: (u) => u,
  inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  out: (u) => 1 - Math.pow(1 - u, 3),
  in: (u) => u * u * u,
  outBack: (u) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  outElastic: (u) => (u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
  sine: (u) => 0.5 - 0.5 * Math.cos(Math.PI * u),
};
function track(keys, t, ease = E.inOut) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0, e0] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const u = (e0 || ease)(seg(t, t0, t1));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], u)) : lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}
function compilePose(keys) {
  const fields = {};
  for (const [kt, p, e] of keys) for (const k in p) (fields[k] ||= []).push([kt, p[k], e]);
  return (t) => { const o = {}; for (const k in fields) o[k] = track(fields[k], t); return o; };
}
const V3 = (a) => new THREE.Vector3(...a);

// ---------- renderer ----------
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(PAL.ink);
scene.fog = new THREE.Fog(PAL.ink, 10, 24);
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 80);

// Lights: warm key with soft shadows, cream sky fill, green-tinted bounce, rim
const hemi = new THREE.HemisphereLight('#FFF4E0', '#20242E', 1.25);
scene.add(hemi);
const key = new THREE.DirectionalLight('#FFE6BF', 2.5);
key.position.set(-4.5, 7.5, 5.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -5.5, right: 5.5, top: 5.5, bottom: -5.5, near: 1, far: 22 });
key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
scene.add(key);
const bounce = new THREE.DirectionalLight('#CDEEDD', 0.55); bounce.position.set(5, 2.5, 3); scene.add(bounce);
const rim = new THREE.DirectionalLight('#FFF2CC', 1.1); rim.position.set(1.5, 4.5, -7); scene.add(rim);

// ---------- textures ----------
const FONT = (w, px) => `${w} ${px}px Inter`;
const TX = {
  rec: textCanvas(256, 96, (c, w, h) => { c.fillStyle = PAL.cream; c.font = FONT(800, 64); c.textBaseline = 'middle'; c.fillText('REC', 6, h / 2 + 2); }),
  endClip: textCanvas(512, 704, (c, w, h) => {
    c.fillStyle = '#151922'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(247,245,239,0.10)'; c.lineWidth = 3;
    for (let i = -h; i < w; i += 46) { c.beginPath(); c.moveTo(i, h); c.lineTo(i + h, 0); c.stroke(); }
    c.fillStyle = PAL.cream; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillRect(w / 2 - 34, h / 2 - 120, 68, 68);
    c.font = FONT(800, 66); c.fillText('CLIP', w / 2, h / 2 + 22);
    c.fillText('ENDS', w / 2, h / 2 + 96);
  }),
  dateQ: textCanvas(384, 300, (c, w, h) => {
    c.fillStyle = PAL.cream; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = FONT(800, 92); c.fillText('WHEN', w / 2, h * 0.38);
    c.fillStyle = PAL.green; c.font = FONT(800, 110); c.fillText('?', w / 2, h * 0.78);
  }),
  dateOK: textCanvas(384, 300, (c, w, h) => {
    c.fillStyle = PAL.cream; c.fillRect(0, 0, w, h);
    c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = FONT(800, 92); c.fillText('WHEN', w / 2, h * 0.36);
    c.fillStyle = PAL.green; rr(c, w / 2 - 60, h * 0.58, 120, 100, 26); c.fill();
    tick(c, w / 2, h * 0.58 + 50, 70, PAL.yellow, 18);
  }),
  where: textCanvas(512, 200, (c, w, h) => {
    c.fillStyle = PAL.cream; rr(c, 6, 6, w - 12, h - 12, 40); c.fill();
    c.fillStyle = PAL.ink; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = FONT(800, 96); c.fillText('WHERE', 34, h / 2 + 4);
    c.fillStyle = PAL.green; rr(c, w - 150, 40, 112, 120, 28); c.fill();
    tick(c, w - 94, h / 2 + 4, 66, PAL.yellow, 17);
  }),
  card: (label) => textCanvas(420, 300, (c, w, h) => {
    c.fillStyle = PAL.cream; rr(c, 4, 4, w - 8, h - 8, 30); c.fill();
    c.fillStyle = PAL.green; rr(c, 4, 4, w - 8, 70, 30); c.fill(); c.fillRect(4, 40, w - 8, 34);
    c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = FONT(800, 76); c.fillText(label, w / 2, 168);
    c.fillStyle = PAL.yellowDeep; c.font = FONT(800, 64); c.fillText('?', w / 2, 248);
  }),
  qPanel: (label) => textCanvas(380, 520, (c, w, h) => {
    c.fillStyle = '#EFE8DA'; c.fillRect(0, 0, w, h);
    c.setLineDash([22, 16]); c.strokeStyle = 'rgba(11,13,18,0.45)'; c.lineWidth = 8; rr(c, 22, 22, w - 44, h - 44, 24); c.stroke(); c.setLineDash([]);
    c.fillStyle = PAL.ink; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = FONT(800, 220); c.fillText('?', w / 2, h * 0.43);
    c.font = FONT(800, 64); c.fillText(label, w / 2, h * 0.8);
  }),
};

// ---------- world & cast ----------
const world = buildWorld(scene);

const tally = createFigure({
  skin: '#8E5A3E', hair: '#22160F', coat: PAL.green, coatDark: PAL.greenDark, trousers: '#2B3140', shoe: '#14171D',
  accent: PAL.yellow, hat: 'bucket', hatColor: PAL.yellow, hatBand: PAL.greenDark, glasses: true, satchel: true, hairStyle: 'curls',
});
const courier = createFigure({
  skin: '#6E4330', hair: '#1C1410', coat: '#E2D2B0', coatDark: '#C9B590', trousers: '#3A4152', hat: 'cap', hatColor: PAL.greenDark,
  hatBand: PAL.yellow, hairStyle: 'short', accent: PAL.greenDark, cheeks: '#9A5B45',
});
const recipient = createFigure({
  skin: '#A26B4C', hair: '#2A1B14', coat: '#C77C5A', coatDark: '#A9613F', trousers: '#4A3B36', hairStyle: 'bun', accent: PAL.cream, collar: PAL.yellow,
});
for (const f of [tally, courier, recipient]) { scene.add(f.root); scene.add(f.limbsGroup); }

const parcel = buildParcel(); scene.add(parcel);
const clip = buildClipFrame(TX); scene.add(clip);
const dateTag = buildDateTag(TX); scene.add(dateTag);
const pin = buildPin(); scene.add(pin); scene.add(pin.userData.shadowDisc);
const whereCard = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.336), new THREE.MeshBasicMaterial({ map: TX.where, transparent: true }));
scene.add(whereCard);
const question = buildQuestion(); scene.add(question);
const cards = [
  new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshStandardMaterial({ map: TX.card('next week'), transparent: true, roughness: 0.9, side: THREE.DoubleSide })),
  new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshStandardMaterial({ map: TX.card('next month'), transparent: true, roughness: 0.9, side: THREE.DoubleSide })),
];
cards.forEach((c) => { c.castShadow = true; scene.add(c); });

// ---------- staging geometry ----------
const HAND = V3([-0.36, 0.62, -0.6]);           // handoff point
const FR = V3([0.5, 1.12, 1.25]);               // clip-frame centre (shots A/B)
const U = FR.clone().sub(HAND).normalize();     // from handoff toward viewer
const RIGHT = new THREE.Vector3().crossVectors(U.clone().negate(), new THREE.Vector3(0, 1, 0)).normalize();
const TALLY_POS = FR.clone().add(RIGHT.clone().multiplyScalar(0.76)).setY(0);
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
// Tally presents the frame to the viewer: body faces the audience camera, turned a little toward the frame
const CAM_B = FR.clone().add(U.clone().multiplyScalar(4.45)).add(RIGHT.clone().multiplyScalar(0.42));
const TGT_B = FR.clone().add(RIGHT.clone().multiplyScalar(0.42)).add(new THREE.Vector3(0, -0.3, 0));
const TALLY_YAW = yawTo(TALLY_POS, CAM_B) - 0.32;
const TALLY_YAW_FRAME = TALLY_YAW, TALLY_YAW_CAM = TALLY_YAW + 0.12;
const CAM_C = FR.clone().add(U.clone().multiplyScalar(3.1)).add(RIGHT.clone().multiplyScalar(1.05)).add(new THREE.Vector3(0, -0.42, 0));
const TGT_C = FR.clone().add(RIGHT.clone().multiplyScalar(0.3)).add(new THREE.Vector3(0, -0.12, 0));
const PIN_POS = V3([-1.12, 0, -0.28]);
const STRIP_C = TALLY_POS.clone().add(new THREE.Vector3(-0.12, 2.06, -0.3));

// ---------- snapshot texture of the clip content for the story strip ----------
let clipSnapTex = null;

// ---------- story strip (shot E) ----------
const strip = new THREE.Group(); scene.add(strip);
const filmBack = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.78, 0.03), new THREE.MeshStandardMaterial({ color: '#151922', roughness: 0.8 }));
filmBack.castShadow = true; strip.add(filmBack);
const holes = new THREE.Group(); strip.add(holes);
for (let i = 0; i < 12; i++) for (const y of [-0.355, 0.355]) {
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.035), new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.8 }));
  h.position.set(-0.69 + i * 0.1255, y, 0.0); holes.add(h);
}
const panels = [];
const panelLabels = ['before', null, 'after'];
for (let i = 0; i < 3; i++) {
  const p = buildPanel(panelLabels[i] ? TX.qPanel(panelLabels[i]) : TX.qPanel(''), 0.4, 0.55);
  p.position.set(-0.47 + i * 0.47, 0, 0.03);
  strip.add(p); panels.push(p);
}
const slotGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.65), new THREE.MeshBasicMaterial({ color: PAL.yellow }));
slotGlow.position.set(0, 0, 0.018); strip.add(slotGlow);

// ---------- post: tilt-shift with in-focus band + grade ----------
const TiltShader = (dir) => ({
  uniforms: { tDiffuse: { value: null }, amt: { value: 0 }, r: { value: 0.5 }, band: { value: 0.18 }, dir: { value: dir } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amt; uniform float r; uniform float band; uniform vec2 dir; varying vec2 vUv;
    void main(){ float d = max(0.0, abs(r - vUv.y) - band); vec2 o = dir * amt * d;
      vec4 s = texture2D(tDiffuse, vUv) * 0.1633;
      s += texture2D(tDiffuse, vUv + o*1.0)*0.1531; s += texture2D(tDiffuse, vUv - o*1.0)*0.1531;
      s += texture2D(tDiffuse, vUv + o*2.0)*0.12245; s += texture2D(tDiffuse, vUv - o*2.0)*0.12245;
      s += texture2D(tDiffuse, vUv + o*3.0)*0.0918; s += texture2D(tDiffuse, vUv - o*3.0)*0.0918;
      s += texture2D(tDiffuse, vUv + o*4.0)*0.051; s += texture2D(tDiffuse, vUv - o*4.0)*0.051;
      gl_FragColor = s; }`,
});
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, frame: { value: 0 }, vig: { value: 0.32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float frame; uniform float vig; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + frame*0.731) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5; q.x *= 0.5625; float v = smoothstep(0.85, 0.18, length(q)*1.35);
      c.rgb *= mix(1.0 - vig, 1.0, v);
      c.rgb += (h(vUv*vec2(1080.0,1920.0)) - 0.5) * 0.018;
      gl_FragColor = c; }`,
};
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const tiltH = new ShaderPass(TiltShader(new THREE.Vector2(1 / W, 0)));
const tiltV = new ShaderPass(TiltShader(new THREE.Vector2(0, 1 / H)));
composer.addPass(tiltH); composer.addPass(tiltV);
composer.addPass(new OutputPass());
const grade = new ShaderPass(GradeShader); composer.addPass(grade);

// ---------- overlay (2D) ----------
const ov = document.getElementById('ov');
const octx = ov.getContext('2d', { willReadFrequently: true });
let ovDrawn = false;
const capEl = document.getElementById('cap');
const sigEl = document.getElementById('sig');
const chipEl = document.getElementById('chip');

// ============ TIMELINE ============
const [A, B, Cs, D, Es] = S;

// --- clip frame transform ---
function clipState(t) {
  const st = { pos: FR.clone(), look: CAM_B.clone(), scale: 1, visible: true, shutter: 0, rec: true };
  // gentle hand-held bob while carried
  const carried = t < C.release;
  if (carried) {
    st.pos.y += Math.sin(t * 2.1) * 0.012;
    st.pos.x += Math.sin(t * 1.3) * 0.006;
  } else {
    // released: hovers with damped bounce
    const u = t - C.release;
    st.pos.y += 0.05 * Math.exp(-u * 3) * Math.sin(u * 14) + 0.012 * Math.sin(t * 2.2);
  }
  st.rec = t < C.recOff;
  st.shutter = E.out(seg(t, C.shutterDown, C.shutterDown + 0.35));
  // shot E: frame flies into the strip's middle slot
  if (t >= C.stripWhoosh + 0.25) {
    const u = E.inOut(seg(t, C.stripWhoosh + 0.25, C.clipSlot));
    const slot = STRIP_C.clone();
    st.pos.lerpVectors(st.pos, slot, u);
    st.scale = lerp(1, 0.42, u);
    st.look = CAM_E_POS.clone();
    if (t >= C.clipSlot) st.visible = false;
  }
  return st;
}

// --- camera keys per shot ---
const tallyHead = () => TALLY_POS.clone().add(new THREE.Vector3(0, 1.12, 0));
const CAM_A0 = FR.clone().add(U.clone().multiplyScalar(2.05));
const CAM_D1 = V3([2.05, 3.85, 7.1]);
const TGT_D1 = V3([0.0, 1.95, -0.7]);
const CAM_E_POS = TALLY_POS.clone().add(new THREE.Vector3(-0.08, 1.32, 4.35));
const CAM_E_TGT = TALLY_POS.clone().add(new THREE.Vector3(-0.08, 1.2, 0));

function cameraState(t) {
  let pos, tgt, fov = 40, focus = 0.5, blur = 0, band = 0.2;
  if (t < B[1]) {
    // A: open looking straight through the clip frame; dolly back to reveal Tally holding it.
    // B: continues as a slow push toward the frame while everything outside it dims.
    const u = E.inOut(seg(t, 0.5, 2.75));
    const v = E.inOut(seg(t, B[0], B[1]));
    const p0 = CAM_A0.clone(), p1 = CAM_B.clone();
    pos = p0.lerp(p1, u).add(new THREE.Vector3(0, 0.12 * Math.sin(u * Math.PI), 0));
    pos.add(U.clone().multiplyScalar(-0.45 * v)).add(RIGHT.clone().multiplyScalar(-0.06 * v));
    tgt = FR.clone().lerp(TGT_B, u);
    focus = lerp(0.55, 0.52, u); blur = lerp(4, 7, u); band = lerp(0.3, 0.24, u);
  } else if (t < Cs[1]) {
    const u = E.inOut(seg(t, Cs[0], Cs[1]));
    pos = CAM_C.clone().add(U.clone().multiplyScalar(lerp(0.12, -0.18, u)));
    tgt = TGT_C.clone();
    focus = 0.5; blur = 7; band = 0.24;
  } else if (t < D[1]) {
    // crane up and back: the clip has ended, the story continues beyond it
    const u = E.inOut(seg(t, D[0], D[0] + 1.4));
    const u2 = E.sine(seg(t, D[0] + 1.4, D[1]));
    const startPos = CAM_C.clone().add(U.clone().multiplyScalar(-0.18));
    pos = startPos.lerp(CAM_D1, u).add(new THREE.Vector3(-0.2 * u2, 0.05 * u2, -0.3 * u2));
    tgt = TGT_C.clone().lerp(TGT_D1, u);
    focus = lerp(0.5, 0.55, u); blur = 6; band = 0.26;
  } else {
    const u = E.out(seg(t, Es[0], Es[0] + 0.9));
    const v = E.inOut(seg(t, Es[0] + 0.9, DUR));
    pos = CAM_E_POS.clone().add(new THREE.Vector3(0.3 * (1 - u), 0.4 * (1 - u), 0.7 * (1 - u))).add(new THREE.Vector3(0, 0, -0.3 * v));
    tgt = CAM_E_TGT.clone();
    focus = 0.55; blur = 6; band = 0.28;
  }
  return { pos, tgt, fov, focus, blur, band };
}

// --- Tally performance ---
const HOLD_R = 'gripR';
const tallyKeys = compilePose([
  // A: presents the clip frame (held in L hand), glances at it, then asks the viewer
  [0.0, { yaw: TALLY_YAW, gripL: 1, handR: [0.26, 0.12, 0.12], headYaw: -0.75, headPitch: 0.05, headRoll: 0.08, lookX: -1, lookY: 0, browL: 0.5, browR: 0.2, smile: 0.25, lean: 0.03, twist: 0 }],
  [1.0, { headYaw: -0.6, browL: 0.7 }],
  [1.45, { headYaw: 0.05, headRoll: 0.0, lookX: 0.1, lookY: 0.1, browL: 1, browR: 1, smile: 0.2, handR: [0.34, 0.38, 0.3] }],
  [2.3, { headRoll: 0.14, headYaw: 0.1, handR: [0.36, 0.42, 0.28], smile: 0.35 }],
  [2.75, { handR: [0.3, 0.3, 0.25] }],
  // B: points into the frame at the handoff, then back to the viewer
  [3.0, { headYaw: -0.6, headRoll: 0.0, lookX: -1, browL: 0.6, browR: 0.5 }],
  [3.55, { handR: [-0.02, 0.48, 0.42], lean: 0.06, twist: -0.22 }],
  [4.15, { handR: [-0.06, 0.52, 0.46], squash: 0.03 }],
  [4.55, { headYaw: 0.05, lookX: 0, browL: 0.9, browR: 0.9, smile: 0.55, squash: 0, twist: 0, lean: 0.03, handR: [0.33, 0.36, 0.28] }],
  [5.4, { headRoll: -0.06 }],
  // C: lets go (frame hovers), hops, tosses the date tag onto the frame, points at the place pin
  [5.68, { gripL: 1, squash: 0, handL: [-0.28, 0.2, 0.14] }],
  [5.8, { gripL: 0, squash: 0.07, headRoll: 0 }],
  [5.95, { squash: -0.04 }],
  [6.05, { squash: 0, handR: [0.3, 0.04, 0.12], headYaw: 0.35, headPitch: 0.25, lookX: 0.6, lookY: -0.7 }],
  [6.2, { handR: [0.25, 0.55, 0.25], headYaw: -0.2, headPitch: -0.25, lookX: -0.4, lookY: 0.6, browL: 0.9 }],
  [6.32, { handR: [0.05, 0.75, 0.25] }],
  [6.6, { handR: [0.27, 0.12, 0.12], headYaw: -0.45, headPitch: -0.2, lookX: -0.8, lookY: 0.5 }],
  [6.9, { handL: [-0.5, 0.42, 0.34], headYaw: -0.75, headPitch: 0.05, lookX: -1, lookY: 0, browL: 1, browR: 0.8, smile: 0.55, lean: 0.05 }],
  [7.5, { handL: [-0.52, 0.46, 0.34] }],
  [7.85, { headYaw: 0.05, lookX: 0, lookY: 0.1, handL: [-0.26, 0.15, 0.14], smile: 0.6, browL: 0.5, browR: 0.5, lean: 0 }],
  // D: the clip ends; looks up at the unknown, scratches head under the hat
  [8.15, { headYaw: 0.0, headPitch: 0.0 }],
  [8.6, { headYaw: -0.35, headPitch: -0.55, lookX: -0.5, lookY: 1, browL: 0.7, browR: 0.3, smile: 0.0 }],
  [9.25, { headPitch: -0.7, browTiltL: 0.4, browTiltR: 0.4, smile: -0.35, handR: [0.13, 0.86, 0.06] }],
  [9.6, { handR: [0.11, 0.93, 0.03], headRoll: 0.12 }],
  [10.6, { handR: [0.12, 0.9, 0.04], headRoll: -0.08 }],
  [10.9, { handR: [0.27, 0.1, 0.1], headPitch: -0.2, browTiltL: 0.1, browTiltR: 0.1 }],
  // E: story strip; reaches up to the one filled panel, opens arms across the gaps, knowing nod
  [11.0, { headPitch: -0.5, lookY: 1, lookX: -0.2, smile: 0.3, browL: 0.7, browR: 0.7, browTiltL: 0, browTiltR: 0, headYaw: -0.1, headRoll: 0 }],
  [11.45, { handL: [-0.46, 0.95, 0.22] }],
  [12.0, { handL: [-0.42, 1.02, 0.26], squash: 0.04 }],
  [12.3, { squash: 0, headPitch: -0.05, headYaw: 0, lookX: 0, lookY: 0.15, smile: 0.5, handL: [-0.2, 0.6, 0.3] }],
  [12.85, { handL: [-0.55, 0.78, 0.25], handR: [0.55, 0.78, 0.25], browL: 0.85, browR: 0.85, headRoll: 0.08 }],
  [13.4, { handL: [-0.42, 0.42, 0.28], handR: [0.42, 0.42, 0.28], headRoll: -0.05 }],
  [13.85, { headPitch: 0.18, handL: [-0.25, 0.12, 0.12], handR: [0.25, 0.12, 0.12], smile: 0.75, browL: 0.3, browR: 0.3, headRoll: 0.06 }],
  [14.2, { headPitch: -0.04 }],
  [15.0, { headPitch: 0.0 }],
]);

// courier: steps in, offers the parcel, hands over, nods, steps back
const courierKeys = compilePose([
  [0.0, { x: 0.38, z: -0.6, yaw: -Math.PI / 2, handL: [-0.12, 0.2, 0.3], handR: [0.12, 0.2, 0.3], headPitch: 0.05, smile: 0.5, lookX: 0 }],
  [0.9, { x: 0.06 }],
  [2.95, { handL: [-0.13, 0.25, 0.36], handR: [0.13, 0.25, 0.36] }],
  [3.5, { handL: [-0.13, 0.2, 0.42], handR: [0.13, 0.2, 0.42] }],
  [3.95, { handL: [-0.2, 0.1, 0.15], handR: [0.2, 0.1, 0.15], headPitch: 0.2 }],
  [4.4, { headPitch: -0.05, smile: 0.7 }],
  [8.3, { x: 0.06, yaw: -Math.PI / 2 }],
  [8.6, { yaw: Math.PI / 2 }],
  [10.2, { x: 1.8 }],
]);
const recipientKeys = compilePose([
  [0.0, { x: -0.8, z: -0.6, yaw: Math.PI / 2, handL: [-0.2, 0.1, 0.12], handR: [0.2, 0.1, 0.12], smile: 0.4, headPitch: 0.05 }],
  [2.7, { handL: [-0.2, 0.1, 0.12], handR: [0.2, 0.1, 0.12] }],
  [3.3, { handL: [-0.13, 0.22, 0.36], handR: [0.13, 0.22, 0.36] }],
  [3.95, { handL: [-0.14, 0.2, 0.26], handR: [0.14, 0.2, 0.26], smile: 0.7, headPitch: 0.15 }],
  [4.4, { headPitch: -0.05 }],
  [8.25, { yaw: Math.PI / 2, x: -0.8, z: -0.6 }],
  [8.5, { yaw: Math.PI }],
  [8.85, { x: -0.48, z: -1.05 }],
  [9.05, { z: -1.75 }],
]);

function walkCycle(t, a, b, speed = 9) {
  if (t < a || t > b) return { footLiftL: 0, footLiftR: 0, bob: 0, fl: 0, fr: 0 };
  const ph = (t - a) * speed;
  return { footLiftL: Math.max(0, Math.sin(ph)) * 0.06, footLiftR: Math.max(0, -Math.sin(ph)) * 0.06, bob: Math.abs(Math.sin(ph)) * 0.02, fl: Math.sin(ph) * 0.06, fr: -Math.sin(ph) * 0.06 };
}

const BLINKS = [0.95, 2.35, 4.8, 7.95, 10.15, 12.55, 14.35];
function blinkAt(t) { let b = 0; for (const bt of BLINKS) { const u = (t - bt) / 0.16; if (u >= 0 && u <= 1) b = Math.sin(u * Math.PI); } return b; }

function lipAt(f) { return LIP.length ? (LIP[Math.min(LIP.length - 1, f)] || 0) : 0; }

// ============ STATE ============
function applyState(t, f) {
  // ---- clip frame ----
  const cs = clipState(t);
  clip.position.copy(cs.pos);
  clip.lookAt(cs.look);
  clip.scale.setScalar(cs.scale);
  clip.visible = cs.visible;
  const ud = clip.userData;
  ud.recDot.visible = cs.rec && (Math.floor(t * 2.2) % 2 === 0 || t < 0.4);
  ud.shutter.visible = cs.shutter > 0.001;
  ud.shutterPivot.scale.y = 1; ud.shutter.scale.y = Math.max(0.0001, cs.shutter);
  ud.shutter.position.y = -((ud.H - 0.02) * cs.shutter) / 2;
  clip.updateMatrixWorld(true);
  const gripNear = clip.localToWorld(new THREE.Vector3(ud.W / 2 + 0.0, -0.08, 0.0));

  // ---- Tally ----
  const tp = tallyKeys(t);
  const breathe = Math.sin(t * 2.4) * 0.006;
  const walk = walkCycle(t, 5.8, 5.95, 22);
  const pose = {
    x: TALLY_POS.x, z: TALLY_POS.z, bob: breathe + walk.bob, ...tp,
    footLiftL: walk.footLiftL, footLiftR: walk.footLiftR,
    blink: blinkAt(t),
    mouthOpen: lipAt(f) * 0.95,
  };
  // hold the frame's near grip with the L hand while carried
  if ((tp.gripL ?? 0) > 0.001) {
    tally.root.position.set(pose.x, 0, pose.z); tally.root.rotation.set(0, pose.yaw, 0); tally.root.updateMatrixWorld(true);
    const local = tally.torso.worldToLocal(gripNear.clone());
    const free = tp.handL || [-0.27, 0.1, 0.1];
    const g = tp.gripL;
    pose.handL = [lerp(free[0], local.x, g), lerp(free[1], local.y, g), lerp(free[2], local.z, g)];
    pose.elbowPoleL = [-0.5, -0.6, 0.1];
  }
  // scratch-head micro motion
  if (t > C.headScratch && t < C.headScratch + 1.0 && tp.handR) {
    const s = Math.sin((t - C.headScratch) * 30) * 0.025;
    pose.handR = [tp.handR[0] + s, tp.handR[1], tp.handR[2]];
  }
  if (t > C.nod && t < C.nod + 0.5) pose.headPitch = (pose.headPitch || 0) + Math.sin(seg(t, C.nod, C.nod + 0.5) * Math.PI * 2) * 0.12;
  tally.apply(pose);
  tally.satchel && (tally.satchel.visible = true);

  // ---- courier & recipient ----
  const cp = courierKeys(t);
  const cw = walkCycle(t, 0.0, 0.9, 10);
  const cw2 = walkCycle(t, 8.6, 10.2, 10);
  courier.apply({ ...cp, bob: cw.bob + cw2.bob, footLiftL: cw.footLiftL + cw2.footLiftL, footLiftR: cw.footLiftR + cw2.footLiftR, blink: blinkAt(t + 0.5) });
  const rp = recipientKeys(t);
  const rw = walkCycle(t, 8.5, 9.05, 11);
  recipient.apply({ ...rp, bob: rw.bob, footLiftL: rw.footLiftL, footLiftR: rw.footLiftR, blink: blinkAt(t + 1.3) });
  const recipInside = t > 9.0;
  recipient.root.visible = !recipInside; recipient.limbsGroup.visible = !recipInside;
  courier.root.visible = t < 10.15; courier.limbsGroup.visible = t < 10.15;

  // door: open until recipient is inside, then closes with a small bounce
  const dc = seg(t, C.doorClose - 0.3, C.doorClose);
  world.doorHinge.rotation.y = lerp(-1.75, 0, E.in(dc)) + (t > C.doorClose ? Math.exp(-(t - C.doorClose) * 9) * Math.sin((t - C.doorClose) * 40) * -0.06 : 0);

  // ---- parcel: in courier's hands -> transfer -> recipient's hands -> inside ----
  const ch = courier.arms.map((a) => a.handWorld);
  const rh = recipient.arms.map((a) => a.handWorld);
  const cMid = ch[0].clone().add(ch[1]).multiplyScalar(0.5);
  const rMid = rh[0].clone().add(rh[1]).multiplyScalar(0.5);
  const tu = E.inOut(seg(t, C.transferStart, C.transferEnd));
  const pp = cMid.clone().lerp(rMid, tu);
  pp.y += Math.sin(tu * Math.PI) * 0.06 + 0.02;
  parcel.position.copy(pp);
  parcel.rotation.set(0, (t < C.transferEnd ? -Math.PI / 2 : recipient.root.rotation.y) + 0.0, Math.sin(tu * Math.PI) * 0.08);
  parcel.visible = !recipInside;

  // ---- date tag: from satchel, tossed in an arc, snaps onto the frame corner ----
  const TOSS = C.tagSnap - 0.18;
  const inHand = t >= C.satchel && t < TOSS;
  const flying = t >= TOSS && t < C.tagSnap;
  const onFrame = t >= C.tagSnap;
  dateTag.visible = inHand || flying || onFrame;
  const corner = clip.localToWorld(new THREE.Vector3(ud.W / 2 - 0.06, ud.H / 2 + 0.06, 0.05));
  if (inHand) {
    const hw = tally.arms[1].handWorld.clone();
    dateTag.position.copy(hw).add(new THREE.Vector3(0, 0.1, 0.03));
    dateTag.quaternion.copy(clip.quaternion);
    dateTag.rotateZ(0.3);
    dateTag.scale.setScalar(E.outBack(seg(t, C.satchel, C.satchel + 0.15)) * 0.9 + 0.0001);
  } else if (flying) {
    const u = seg(t, TOSS, C.tagSnap);
    const from = tally.torso.localToWorld(new THREE.Vector3(0.12, 0.72, 0.28));
    const p = from.clone().lerp(corner, E.out(u));
    p.y += Math.sin(u * Math.PI) * 0.35;
    dateTag.position.copy(p);
    dateTag.quaternion.copy(clip.quaternion);
    dateTag.rotateZ(0.3 + u * Math.PI * 1.6);
    dateTag.scale.setScalar(0.9 + 0.1 * u);
  } else if (onFrame) {
    dateTag.position.copy(corner);
    dateTag.quaternion.copy(clip.quaternion);
    const pop = seg(t, C.tagSnap, C.tagSnap + 0.2);
    dateTag.scale.setScalar(clip.scale.x * (1 + Math.sin(pop * Math.PI) * 0.18));
    dateTag.rotateZ(-0.12 + Math.exp(-(t - C.tagSnap) * 6) * Math.sin((t - C.tagSnap) * 25) * 0.15);
    if (!clip.visible) dateTag.visible = false;
  }
  // page flips: sheet rotates up, face switches to verified
  const flipU = seg(t, C.tagFlip, C.tagTick);
  const dt = dateTag.userData;
  const flips = 2;
  const fp = flipU * flips;
  const k = Math.floor(fp), fr = fp - k;
  dt.flip.visible = flipU > 0 && flipU < 1;
  dt.flip.rotation.x = -fr * Math.PI * 0.95;
  dt.face.material.map = t >= C.tagTick ? TX.dateOK : TX.dateQ;

  // ---- pin + where card ----
  const pinU = seg(t, C.pinDrop, C.pinLand);
  pin.visible = t >= C.pinDrop && t < D[0] + 0.6;
  const yDrop = lerp(2.4, 0, E.in(pinU));
  const landBounce = t > C.pinLand ? Math.abs(Math.sin((t - C.pinLand) * 14)) * Math.exp(-(t - C.pinLand) * 7) * 0.12 : 0;
  pin.position.set(PIN_POS.x, yDrop + landBounce, PIN_POS.z);
  const sq = t > C.pinLand ? Math.exp(-(t - C.pinLand) * 10) * 0.25 : 0;
  pin.scale.set(1 + sq, 1 - sq, 1 + sq);
  pin.rotation.y = 0.5;
  pin.userData.shadowDisc.visible = pin.visible;
  pin.userData.shadowDisc.position.set(PIN_POS.x, 0.02, PIN_POS.z);
  pin.userData.shadowDisc.scale.setScalar(0.5 + pinU * 0.8);
  whereCard.visible = t >= C.pinTick - 0.05 && t < D[0] + 0.6;
  const wc = E.outBack(seg(t, C.pinTick - 0.05, C.pinTick + 0.2));
  whereCard.position.set(PIN_POS.x + 0.3, 1.52 + 0.02 * Math.sin(t * 3), PIN_POS.z + 0.05);
  whereCard.lookAt(camera.position);
  whereCard.scale.setScalar(Math.max(0.0001, wc));

  // ---- question mark + floating date cards (shot D) ----
  const qU = seg(t, C.questionPop - 0.25, C.questionPop + 0.35);
  question.visible = t >= C.questionPop - 0.25 && t < Es[0];
  const qy = lerp(1.9, 3.2, E.outBack(qU));
  question.position.set(-0.45, qy + Math.sin(t * 2.5) * 0.03, -1.3);
  question.rotation.set(0, Math.sin(t * 1.4) * 0.35, Math.sin(t * 2.0) * 0.06);
  const qs = 1 + (t > C.questionPop ? Math.exp(-(t - C.questionPop) * 6) * Math.sin((t - C.questionPop) * 20) * 0.12 : 0);
  question.scale.set(qs * 0.85, (2 - qs) * 0.85, 0.85);
  cards.forEach((c, i) => {
    const st = C.cardsFloat + i * 0.25;
    const u = seg(t, st, st + 0.6);
    c.visible = t >= st && t < Es[0];
    const side = i === 0 ? -1 : 1;
    c.position.set(-0.32 + side * 0.82, lerp(2.0, 2.8 + i * 0.12, E.out(u)) + Math.sin(t * 2 + i) * 0.04, -0.85);
    c.lookAt(CAM_D1);
    c.rotateZ(side * -0.12 + Math.sin(t * 1.7 + i) * 0.05);
    c.scale.setScalar(Math.max(0.0001, E.outBack(u)));
  });

  // ---- story strip (shot E) ----
  const sU = seg(t, C.stripWhoosh, C.stripWhoosh + 0.55);
  strip.visible = t >= C.stripWhoosh;
  strip.position.copy(STRIP_C).add(new THREE.Vector3(0, 0.05 * Math.sin(t * 2), 0));
  strip.lookAt(CAM_E_POS);
  strip.scale.set(Math.max(0.0001, E.outBack(sU)), Math.max(0.0001, E.out(sU)), 1);
  // middle panel shows the clip snapshot once the frame lands
  const midIn = t >= C.clipSlot;
  panels[1].visible = true;
  panels[1].userData.face.material.map = midIn && clipSnapTex ? clipSnapTex : TX.qPanel('');
  const pop = seg(t, C.clipSlot, C.clipSlot + 0.25);
  panels[1].scale.setScalar(1 + Math.sin(pop * Math.PI) * 0.12);
  slotGlow.visible = midIn;
  slotGlow.scale.setScalar(1 + Math.sin(pop * Math.PI) * 0.12);
  for (const i of [0, 2]) {
    const w = t > C.wobble ? Math.exp(-(t - C.wobble) * 2.5) * Math.sin((t - C.wobble) * 16 + i) * 0.12 : 0;
    panels[i].rotation.z = w;
  }
  // tap highlight
  const tapPulse = seg(t, C.tapClip, C.tapClip + 0.3);
  if (t > C.tapClip) panels[1].scale.multiplyScalar(1 + Math.sin(tapPulse * Math.PI) * 0.06);

  // ---- lighting drift in shot D: time passes beyond the clip ----
  const dayU = seg(t, D[0] + 0.6, D[1]);
  key.position.set(lerp(-4.5, 3.5, E.inOut(dayU) * 0.6), 7.5, 5.5);
  key.intensity = 2.5 - 0.35 * Math.sin(dayU * Math.PI);
}

// ============ OVERLAY ============
const capLines = SCRIPT.lines.map((l) => ({ ...l, start: LN[l.id] }));
function lineDur(id) {
  const m = LINE_META && LINE_META.find((x) => x.id === id);
  return m ? m.dur : 2.4;
}
const EMPH = {
  L1: ['prove'], L2: ['one handoff,', 'one frame.'], L3: ['when', 'where'], L4: ['After', "can't"], L5: ['One piece', 'whole story.'],
};
function captionHTML(l) {
  let html = l.caption.replace(/&/g, '&amp;');
  for (const w of EMPH[l.id] || []) html = html.replace(w, `<em>${w}</em>`);
  return html;
}
let lastCapId = null;

function project(v) {
  const p = v.clone().project(camera);
  return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H, p.z];
}

function drawOverlay(t) {
  octx.clearRect(0, 0, W, H);
  ovDrawn = false;
  // Shot B dim: everything outside the clip frame recedes
  const dimIn = E.inOut(seg(t, C.dimOn, C.dimOn + 0.45));
  const dimOut = 1 - E.inOut(seg(t, B[1] - 0.32, B[1] - 0.04));
  const dim = t >= B[0] && t < B[1] ? dimIn * dimOut : 0;
  if (dim > 0.001 && clip.visible) {
    const ud = clip.userData;
    const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => project(clip.localToWorld(new THREE.Vector3(sx * (ud.W / 2 - 0.03), sy * (ud.H / 2 - 0.03), 0))));
    octx.save();
    octx.fillStyle = `rgba(11,13,18,${0.56 * dim})`;
    octx.beginPath(); octx.rect(0, 0, W, H);
    octx.moveTo(cs[0][0], cs[0][1]); for (let i = 1; i < 4; i++) octx.lineTo(cs[i][0], cs[i][1]); octx.closePath();
    octx.fill('evenodd'); ovDrawn = true;
    // label in the dimmed zone, pointing at the frame edge
    const la = E.out(seg(t, C.dimOn + 0.35, C.dimOn + 0.75)) * dim;
    if (la > 0.01) {
      octx.globalAlpha = la;
      const topY = Math.min(cs[2][1], cs[3][1]);
      const y = Math.max(296, topY - 58);
      octx.font = '800 46px Inter'; octx.textAlign = 'center'; octx.textBaseline = 'middle';
      const txt = 'Outside the frame: not shown';
      const tw = octx.measureText(txt).width + 56;
      const cx = Math.min(W - 48 - tw / 2, Math.max(48 + tw / 2, (cs[2][0] + cs[3][0]) / 2));
      octx.fillStyle = 'rgba(247,245,239,0.95)';
      rr(octx, cx - tw / 2, y - 38, tw, 76, 38); octx.fill();
      octx.fillStyle = PAL.ink; octx.fillText(txt, cx, y + 2);
    }
    octx.restore();
  }
  // in-frame tick badge (shot B)
  const tb = t >= C.inFrameTick && t < B[1] ? E.outBack(seg(t, C.inFrameTick, C.inFrameTick + 0.3)) * (1 - E.inOut(seg(t, B[1] - 0.32, B[1] - 0.04))) : 0;
  if (tb > 0.01) {
    const ud = clip.userData;
    const [x, y] = project(clip.localToWorld(new THREE.Vector3(ud.W / 2 - 0.02, -ud.H / 2 + 0.02, 0.02)));
    ovDrawn = true;
    octx.save(); octx.translate(x - 60, y - 60); octx.scale(tb, tb);
    octx.fillStyle = PAL.green; octx.beginPath(); octx.arc(0, 0, 52, 0, Math.PI * 2); octx.fill();
    tick(octx, 0, 2, 52, PAL.yellow, 15);
    octx.restore();
    octx.save(); octx.globalAlpha = clamp01(tb);
    octx.font = '800 40px Inter'; octx.textAlign = 'right'; octx.textBaseline = 'middle';
    const label = 'one handoff';
    const tw = octx.measureText(label).width + 40;
    octx.fillStyle = PAL.yellow; rr(octx, x - 128 - tw, y - 92, tw, 64, 32); octx.fill();
    octx.fillStyle = PAL.ink; octx.fillText(label, x - 148, y - 58);
    octx.restore();
  }
}

function updateDOM(t) {
  // captions
  let active = null;
  for (const l of capLines) {
    const a = l.start - 0.12, b = l.start + lineDur(l.id) + (l.id === 'L5' ? 99 : 0.32);
    if (t >= a && t < b) active = l;
  }
  if (active) {
    if (lastCapId !== active.id) { capEl.innerHTML = `<span>${captionHTML(active)}</span>`; lastCapId = active.id; }
    const a = seg(t, active.start - 0.12, active.start + 0.08);
    const end = active.start + lineDur(active.id) + 0.32;
    const b = active.id === 'L5' ? 1 : 1 - seg(t, end - 0.12, end);
    capEl.style.opacity = String(Math.min(a, b));
    capEl.style.transform = `translate(-50%, ${(1 - E.out(a)) * 18}px)`;
  } else { capEl.style.opacity = '0'; lastCapId = null; }
  // signature
  const s = E.out(seg(t, C.signature, C.signature + 0.4));
  sigEl.style.opacity = String(s);
  sigEl.style.transform = `translate(-50%, ${(1 - s) * 14}px)`;
  chipEl.style.opacity = String(E.out(seg(t, 0.0, 0.2)) || 1);
}

// ============ render API ============
function setCamera(t) {
  const cs = cameraState(t);
  camera.position.copy(cs.pos);
  camera.fov = cs.fov; camera.updateProjectionMatrix();
  camera.lookAt(cs.tgt);
  camera.updateMatrixWorld(true);
  for (const p of [tiltH, tiltV]) { p.uniforms.amt.value = cs.blur; p.uniforms.r.value = cs.focus; p.uniforms.band.value = cs.band; }
}

function makeSnapshot() {
  // Render the handoff as seen through the frame (t = mid-transfer) into a canvas.
  const tSnap = 3.55;
  applyState(tSnap, Math.round(tSnap * FPS));
  const ud = clip.userData;
  clip.visible = false;
  const snapCam = new THREE.PerspectiveCamera(40, W / H, 0.05, 80);
  snapCam.position.copy(CAM_B);
  snapCam.lookAt(FR);
  // narrow FOV so the frame's interior fills the view
  const dist = CAM_B.distanceTo(FR);
  snapCam.fov = THREE.MathUtils.radToDeg(2 * Math.atan((ud.H * 0.5) / dist));
  snapCam.aspect = (ud.W) / (ud.H);
  snapCam.updateProjectionMatrix();
  const sw = 380, sh = Math.round(380 * ud.H / ud.W);
  renderer.setSize(sw, sh, false);
  renderer.setRenderTarget(null);
  renderer.render(scene, snapCam);
  const c = document.createElement('canvas'); c.width = 380; c.height = 520;
  const x = c.getContext('2d');
  x.fillStyle = PAL.cream; x.fillRect(0, 0, 380, 520);
  x.drawImage(renderer.domElement, 0, 0, sw, sh, 0, (520 - sh) / 2 - 30, 380, sh);
  x.fillStyle = PAL.yellow; rr(x, 70, 430, 240, 70, 35); x.fill();
  x.fillStyle = PAL.ink; x.font = '800 44px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('the clip', 190, 467);
  clipSnapTex = new THREE.CanvasTexture(c); clipSnapTex.colorSpace = THREE.SRGBColorSpace;
  renderer.setSize(W, H, false);
  clip.visible = true;
}

function renderFrame(f) {
  const t = Math.min(DUR - 1e-6, f / FPS);
  setCamera(t);
  applyState(t, f);
  setCamera(t); // whereCard etc. use camera
  grade.uniforms.frame.value = f;
  composer.render();
  drawOverlay(t);
  ov.style.visibility = ovDrawn ? 'visible' : 'hidden';
  updateDOM(t);
  return t;
}

// warm-up: compile shaders, build snapshot
makeSnapshot();
renderFrame(0);

window.__renderFrame = (f) => renderFrame(f);
window.__meta = { fps: FPS, duration: DUR, frames: Math.round(DUR * FPS) };
window.__ready = true;
export { tally, createFigure };
