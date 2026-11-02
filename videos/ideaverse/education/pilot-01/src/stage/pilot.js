// pilot.js — Ideaverse AI Literacy · Pilot 01 "Why an AI can sound certain and still be wrong".
// Every frame is a pure function of t (window.renderAt). Original code; Three.js from npm.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import C from './cues.js';
import { createDocket, labelPlane, DOCKET_PALETTE as P, BASE_POSE } from '../character/docket.js';

const W = 1080, H = 1920, FPS = 30, Hh = C.hits;
const AMBER = '#FFC24B';
// ------------------------------------------------------------------ math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  linear: (k) => k, inQuad: (k) => k * k, outQuad: (k) => 1 - (1 - k) * (1 - k), inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outCubic: (k) => 1 - Math.pow(1 - k, 3), outQuart: (k) => 1 - Math.pow(1 - k, 4), inQuart: (k) => k * k * k * k,
  outBack: (k) => { const s = 1.9; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); },
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
};
const kick = (t, t0, amp, dec = 0.12, freq = 28) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) / dec) * Math.cos((t - t0) * freq));
function track(keys, t) { // [[t, v, ease], ...]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i]; return lerp(v0, v1, E[e || 'inOutCubic'](inv(t0, t1, t))); }
  return keys[keys.length - 1][1];
}
function poseKeys(list) { let acc = { ...BASE_POSE }; return list.map((k) => { acc = { ...acc, ...k.p }; return { t: k.t, e: k.e, p: { ...acc } }; }); }
function poseAt(keys, t) {
  if (t <= keys[0].t) return { ...keys[0].p };
  for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) { const a = keys[i - 1], b = keys[i], k = E[b.e || 'inOutCubic'](inv(a.t, b.t, t)); const o = {}; for (const key in b.p) o[key] = lerp(a.p[key], b.p[key], k); return o; }
  return { ...keys[keys.length - 1].p };
}

// ------------------------------------------------------------------ renderer + stage
const out = document.getElementById('out'); const octx = out.getContext('2d');
const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#0E1424'); scene.fog = new THREE.Fog('#0E1424', 4.5, 9);
const cam = new THREE.PerspectiveCamera(44, W / H, 0.05, 40);

// environment reflections: navy room + soft white key + mint side
{
  const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color('#2A3550'), side: THREE.BackSide })));
  const pnl = (w, h, col, k, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  pnl(10, 4, '#ffffff', 4, [2, 8, 4]); pnl(4, 8, P.mint, 2.5, [-8, 2, -2]); pnl(6, 3, '#ffffff', 1.5, [0, 2, 9]);
  scene.environment = pm.fromScene(env, 0.04).texture; scene.environmentIntensity = 0.55;
}
scene.add(new THREE.HemisphereLight('#9FB4D9', '#0E1424', 0.55));
const key = new THREE.SpotLight('#FFF4E6', 38, 12, 0.6, 0.55, 1.6); key.position.set(1.8, 3.6, 2.6); key.target.position.set(0.1, 0.6, 0.1);
key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.camera.near = 1; key.shadow.camera.far = 9;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(P.mint, 1.4); rim.position.set(-2.5, 2.5, -2.5); scene.add(rim);
const fill = new THREE.PointLight('#6C8FD9', 3, 6, 1.5); fill.position.set(-1.6, 1.4, 2); scene.add(fill);

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1, ...o });
const mats = { navy: M(P.navy, { roughness: 0.45, metalness: 0.3 }), deep: M('#121826', { roughness: 0.7 }), shell: M(P.shell, { roughness: 0.38 }), mint: M(P.mint, { emissive: new THREE.Color(P.mint), emissiveIntensity: 0.3, roughness: 0.3 }), steel: M(P.steel, { roughness: 0.3, metalness: 0.6 }), white: M('#FFFFFF', { roughness: 0.6 }), amber: M(AMBER, { emissive: new THREE.Color(AMBER), emissiveIntensity: 0.25 }) };
const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const rbox = (w, h, d, r, m) => sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m));
const cvTex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

let docket, ansBox, gaugeNeedle, ansFront, ansFrontDraw, drawer, chainLinks = [], ghost, claimTag, sourceTag, ribbon, ribbonTex, book, bookCover, bookPages, bookPagesDraw, beam, stamp, stampMark, terminal, termScreenDraw, termScreen, plinth, signCanvas;

function buildStage() {
  // floor + back wall
  const fc = canvas(1024, 1024), fg = fc.getContext('2d');
  fg.fillStyle = '#141B2B'; fg.fillRect(0, 0, 1024, 1024); fg.strokeStyle = 'rgba(108,218,126,0.10)'; fg.lineWidth = 3;
  for (let i = 0; i <= 1024; i += 64) { fg.beginPath(); fg.moveTo(i, 0); fg.lineTo(i, 1024); fg.stroke(); fg.beginPath(); fg.moveTo(0, i); fg.lineTo(1024, i); fg.stroke(); }
  const ft = cvTex(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(4, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.55, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), M('#1B2333', { roughness: 0.9 })); wall.position.set(0, 3, -2.4); wall.receiveShadow = true; scene.add(wall);
  // wall panels + neon sign
  for (const [x, y, w, h] of [[-1.3, 2.1, 0.9, 1.4], [1.35, 2.25, 0.8, 1.1], [0.05, 3.0, 1.6, 0.5]]) { const p = rbox(w, h, 0.05, 0.03, mats.deep); p.position.set(x, y, -2.35); scene.add(p); }
  signCanvas = canvas(1024, 256); const sgc = signCanvas.getContext('2d');
  sgc.font = '700 120px "Space Grotesk"'; sgc.textAlign = 'center'; sgc.textBaseline = 'middle'; sgc.letterSpacing = '18px';
  sgc.shadowColor = P.mint; sgc.shadowBlur = 30; sgc.fillStyle = P.mint; sgc.fillText('NEWSROOM', 512, 132);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: cvTex(signCanvas), transparent: true, toneMapped: false }));
  sign.position.set(-0.8, 0.98, -2.32); sign.scale.setScalar(0.62); scene.add(sign);
  // ticker strip on the wall
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) { const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon); const scr = labelPlane(THREE, x < 0 ? 'FACT CHECK' : 'SOURCES', 0.54, 0.32, P.mint, '#0E1424'); scr.position.set(x, y, -2.265); scene.add(scr); }
  // plinth for the answer box
  plinth = rbox(0.46, 0.78, 0.4, 0.04, mats.navy); plinth.position.set(0.42, 0.39, 0.32); scene.add(plinth);
  const pl = rbox(0.48, 0.03, 0.42, 0.01, mats.mint); pl.position.set(0.42, 0.775, 0.32); plinth.add(pl); pl.position.set(0, 0.385, 0);
  // the AI terminal (fires the answer box)
  terminal = new THREE.Group(); terminal.position.set(0.85, 0, -1.25); terminal.rotation.y = -0.45; scene.add(terminal);
  const tb = rbox(0.62, 1.15, 0.5, 0.06, mats.shell); tb.position.y = 0.575; terminal.add(tb);
  const tScr = canvas(512, 384); termScreenDraw = tScr;
  termScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.375), new THREE.MeshBasicMaterial({ map: cvTex(tScr), toneMapped: false }));
  termScreen.position.set(0, 0.86, 0.252); terminal.add(termScreen);
  const slot = rbox(0.4, 0.06, 0.06, 0.02, mats.navy); slot.position.set(0, 0.52, 0.25); terminal.add(slot);
  const tl = labelPlane(THREE, 'AI MODEL', 0.3, 0.06, P.navy, P.mint); tl.position.set(0, 0.36, 0.252); terminal.add(tl);
  // DOCKET
  docket = createDocket(THREE); scene.add(docket.root);
  // ----- the answer box
  ansBox = new THREE.Group(); scene.add(ansBox);
  const body = rbox(0.4, 0.34, 0.34, 0.03, mats.shell); body.position.y = 0.17; ansBox.add(body);
  ansFrontDraw = canvas(640, 320);
  ansFront = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.18), new THREE.MeshBasicMaterial({ map: cvTex(ansFrontDraw), toneMapped: false }));
  ansFront.position.set(0, 0.235, 0.171); ansBox.add(ansFront);
  // tone gauge on top
  const gauge = new THREE.Group(); gauge.position.set(0, 0.34, 0.04); ansBox.add(gauge);
  const gplate = rbox(0.27, 0.17, 0.03, 0.02, mats.navy); gplate.position.y = 0.085; gauge.add(gplate);
  const gd = canvas(512, 320), gg = gd.getContext('2d');
  gg.fillStyle = '#0E1424'; gg.fillRect(0, 0, 512, 320);
  gg.lineWidth = 18; gg.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.12 + i * 0.095); gg.strokeStyle = i < 3 ? AMBER : i < 6 ? '#8B93A6' : P.mint; gg.beginPath(); gg.arc(256, 270, 190, a, a + 0.07); gg.stroke(); }
  gg.font = '700 46px "JetBrains Mono"'; gg.textAlign = 'center'; gg.fillStyle = AMBER; gg.fillText('?', 70, 215); gg.fillStyle = P.mint; gg.fillText('SURE', 440, 215);
  gg.fillStyle = '#E9EFF2'; gg.font = '700 34px "JetBrains Mono"'; gg.letterSpacing = '6px'; gg.fillText('TONE', 256, 140);
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.156), new THREE.MeshBasicMaterial({ map: cvTex(gd), toneMapped: false })); dial.position.set(0, 0.085, 0.016); gauge.add(dial);
  gaugeNeedle = new THREE.Group(); gaugeNeedle.position.set(0, 0.085 - 0.078 + 0.024, 0.02); gauge.add(gaugeNeedle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.078, 0.004), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); nd.position.y = 0.039; gaugeNeedle.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), new THREE.MeshBasicMaterial({ color: P.mint })); hub.position.z = 0.003; gaugeNeedle.add(hub);
  // fluent-text ribbon slot
  const rslot = rbox(0.22, 0.02, 0.05, 0.008, mats.navy); rslot.position.set(0, 0.342, -0.1); ansBox.add(rslot);
  // SUPPORT drawer (front bottom)
  drawer = new THREE.Group(); drawer.position.set(0, 0.075, 0.0); ansBox.add(drawer);
  const dface = rbox(0.36, 0.11, 0.03, 0.012, mats.shell); dface.position.z = 0.175; drawer.add(dface);
  const dh = rbox(0.12, 0.022, 0.025, 0.008, mats.mint); dh.position.set(0, 0.018, 0.2); drawer.add(dh);
  const dl = labelPlane(THREE, 'SUPPORT', 0.14, 0.032, P.navy, '#E9EFF2'); dl.position.set(0, -0.028, 0.1915); drawer.add(dl);
  const tray = new THREE.Group(); drawer.add(tray);
  for (const [w, h, d, x, y, z] of [[0.34, 0.01, 0.3, 0, -0.045, 0.02], [0.01, 0.08, 0.3, -0.165, -0.005, 0.02], [0.01, 0.08, 0.3, 0.165, -0.005, 0.02], [0.34, 0.08, 0.01, 0, -0.005, -0.13]]) {
    const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.steel)); m.position.set(x, y, z); tray.add(m);
  }
  // chain CLAIM -> SOURCE with one missing link (index 3)
  const linkGeo = new THREE.TorusGeometry(0.026, 0.0085, 10, 24);
  for (let i = 0; i < 7; i++) { const l = sh(new THREE.Mesh(linkGeo, mats.mint)); l.visible = i !== 3; drawer.add(l); chainLinks.push(l); }
  claimTag = labelPlane(THREE, 'CLAIM', 0.09, 0.036, P.navy, '#FFFFFF'); drawer.add(claimTag);
  sourceTag = labelPlane(THREE, 'SOURCE', 0.09, 0.036, P.navy, P.mint); drawer.add(sourceTag);
  const gc = canvas(128, 128), ggc = gc.getContext('2d'); ggc.strokeStyle = AMBER; ggc.lineWidth = 9; ggc.setLineDash([14, 10]); ggc.beginPath(); ggc.ellipse(64, 64, 52, 52, 0, 0, 7); ggc.stroke();
  ghost = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.08), new THREE.MeshBasicMaterial({ map: cvTex(gc), transparent: true, depthWrite: false, toneMapped: false })); drawer.add(ghost);
  // stamp mark decal on the box front
  const smc = canvas(640, 220), smg = smc.getContext('2d');
  smg.fillStyle = AMBER; smg.beginPath(); smg.roundRect(8, 8, 624, 204, 26); smg.fill();
  smg.strokeStyle = '#1B2333'; smg.lineWidth = 8; smg.setLineDash([22, 14]); smg.beginPath(); smg.roundRect(26, 26, 588, 168, 18); smg.stroke(); smg.setLineDash([]);
  smg.fillStyle = '#1B2333'; smg.font = '700 80px "Space Grotesk"'; smg.textAlign = 'center'; smg.textBaseline = 'middle'; smg.fillText('UNCONFIRMED ?', 320, 114);
  stampMark = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.113), new THREE.MeshBasicMaterial({ map: cvTex(smc), transparent: true, toneMapped: false, depthWrite: false }));
  stampMark.position.set(0, 0.235, 0.175); stampMark.rotation.z = 0.12; ansBox.add(stampMark);
  // ribbon of fluent text
  const rc = canvas(2048, 64), rg = rc.getContext('2d');
  rg.fillStyle = '#F4F7FB'; rg.fillRect(0, 0, 2048, 64); rg.fillStyle = '#1B2333'; rg.font = 'italic 500 38px "Space Grotesk"'; rg.textBaseline = 'middle';
  rg.fillText('…which clearly and certainly shows, without any doubt, that it is definitely true, as is widely known, and therefore… ', 10, 34);
  ribbonTex = cvTex(rc); ribbonTex.wrapS = THREE.RepeatWrapping;
  ribbon = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.075, 80, 1), new THREE.MeshStandardMaterial({ map: ribbonTex, side: THREE.DoubleSide, roughness: 0.6 }));
  ribbon.castShadow = true; scene.add(ribbon); ribbon.userData.base = ribbon.geometry.attributes.position.array.slice();
  // reference book
  book = new THREE.Group(); scene.add(book);
  const back = rbox(0.24, 0.018, 0.31, 0.006, mats.navy); back.position.set(0.12, 0, 0); book.add(back);
  const pagesBlock = rbox(0.225, 0.022, 0.29, 0.004, mats.white); pagesBlock.position.set(0.118, 0.019, 0); book.add(pagesBlock);
  bookPagesDraw = canvas(512, 640);
  bookPages = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), new THREE.MeshBasicMaterial({ map: cvTex(bookPagesDraw), toneMapped: false }));
  bookPages.rotation.x = -Math.PI / 2; bookPages.position.set(0.118, 0.0315, 0); book.add(bookPages);
  bookCover = new THREE.Group(); book.add(bookCover);   // hinge at x=0
  const cov = rbox(0.24, 0.016, 0.31, 0.006, mats.navy); cov.position.set(0.12, 0.04, 0); bookCover.add(cov);
  const cl = labelPlane(THREE, 'RELIABLE SOURCE', 0.2, 0.05, P.navy, P.mint); cl.rotation.x = -Math.PI / 2; cl.position.set(0.12, 0.049, -0.05); bookCover.add(cl);
  // scan beam
  beam = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  scene.add(beam);
  // stamp
  stamp = new THREE.Group(); scene.add(stamp);
  const knob = sh(new THREE.Mesh(new THREE.SphereGeometry(0.035, 20, 14), mats.mint)); knob.position.y = 0.16; stamp.add(knob);
  const shaft = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.11, 14), mats.navy)); shaft.position.y = 0.095; stamp.add(shaft);
  const base = rbox(0.13, 0.04, 0.07, 0.01, mats.navy); base.position.y = 0.02; stamp.add(base);
  const pad = rbox(0.12, 0.012, 0.06, 0.004, mats.amber); pad.position.y = -0.004; stamp.add(pad);
}

// ------------------------------------------------------------------ dynamic textures
let frontState = '', pageState = '', termState = '';
function drawFront(glow, dim) {
  const s = `${glow.toFixed(2)}|${dim.toFixed(2)}`; if (s === frontState) return; frontState = s;
  const c = ansFrontDraw, g = c.getContext('2d'); g.clearRect(0, 0, 640, 320);
  g.fillStyle = '#1B2333'; g.beginPath(); g.roundRect(0, 0, 640, 320, 26); g.fill();
  g.font = '700 30px "JetBrains Mono"'; g.letterSpacing = '4px'; g.fillStyle = '#8B93A6'; g.textBaseline = 'top'; g.fillText('AI ANSWER', 30, 26);
  g.fillStyle = AMBER; g.textAlign = 'right'; g.fillText('ILLUSTRATIVE', 610, 26); g.textAlign = 'left';
  g.save(); g.shadowColor = P.mint; g.shadowBlur = 40 * glow; g.globalAlpha = 1 - 0.55 * dim;
  g.fillStyle = glow > 0.5 ? '#FFFFFF' : '#C9D2E3'; g.font = '700 118px "Space Grotesk"'; g.letterSpacing = '0px'; g.textBaseline = 'middle';
  g.fillText('DEFINITELY.', 30, 196); g.restore();
  ansFront.material.map.needsUpdate = true;
}
function drawPages(scanK, noMatch) {
  const s = `${scanK.toFixed(2)}|${noMatch.toFixed(2)}`; if (s === pageState) return; pageState = s;
  const c = bookPagesDraw, g = c.getContext('2d');
  g.fillStyle = '#F7F5EF'; g.fillRect(0, 0, 512, 640); g.fillStyle = '#E2DED3'; g.fillRect(250, 0, 12, 640);
  for (let col = 0; col < 2; col++) for (let i = 0; i < 13; i++) {
    const x = 28 + col * 256, y = 70 + i * 40, w = 190 - ((i * 37 + col * 13) % 60);
    g.fillStyle = '#9AA3B5'; g.fillRect(x, y, w, 12);
    const lit = scanK * 26 > col * 13 + i;
    if (lit) { g.fillStyle = 'rgba(108,218,126,0.35)'; g.fillRect(x - 6, y - 8, w + 12, 28); }
  }
  g.font = '700 30px "JetBrains Mono"'; g.fillStyle = '#1B2333'; g.fillText('REFERENCE', 28, 40);
  if (noMatch > 0) {
    g.save(); g.globalAlpha = noMatch; g.translate(256, 340); g.rotate(-0.12); g.strokeStyle = AMBER; g.lineWidth = 10;
    g.beginPath(); g.roundRect(-190, -50, 380, 100, 20); g.stroke(); g.fillStyle = AMBER; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NO MATCH', 0, 4); g.restore();
  }
  bookPages.material.map.needsUpdate = true;
}
function drawTerminal(t) {
  const fire = clamp(1 - Math.abs(t - Hh.launch) / 0.35);
  const s = (Math.floor(t * 8) % 2) + '|' + fire.toFixed(2); if (s === termState) return; termState = s;
  const g = termScreenDraw.getContext('2d');
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, 512, 384);
  g.fillStyle = 'rgba(108,218,126,0.06)'; for (let y = 0; y < 384; y += 8) g.fillRect(0, y, 512, 3);
  g.fillStyle = P.mint; g.beginPath(); g.roundRect(70, 90, 300, 150, 30); g.fill(); g.beginPath(); g.moveTo(120, 230); g.lineTo(100, 300); g.lineTo(180, 235); g.fill();
  g.fillStyle = '#0B1020'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(160 + i * 60, 165, 16, 0, 7); g.fill(); }
  g.fillStyle = `rgba(255,255,255,${0.15 + 0.6 * fire})`; g.fillRect(0, 0, 512, 384);
  termScreen.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
// DOCKET's keyed body performance (FK). Hands that must touch something are then solved with IK (weights below).
const STAGE_B = { x: 0.06, z: 0.68, rotY: 60 };         // beside the box, face visible to the right-hand camera
const DK = poseKeys([
  { t: -1, p: { x: -0.28, z: 0.05, rotY: 22, crouch: 0.32, lean: 6, aFwd: 66, aOut: 14, aBend: 30, bFwd: 66, bOut: 14, bBend: 30, headYaw: 14, headPitch: -16 } },
  { t: 0.42, p: {} },
  { t: 0.56, e: 'outQuad', p: { crouch: 0.6, lean: 12, headPitch: 2 } },
  { t: 0.9, e: 'outBack', p: { crouch: 0.12, lean: -3, headPitch: -4, headYaw: 0 } },
  { t: 1.08, e: 'outQuad', p: { lean: -11, headPitch: -12, crouch: 0.04 } },
  { t: 1.6, p: { lean: -2, headPitch: -5 } },
  { t: 1.85, p: { headRoll: -11, headYaw: -10 } },
  { t: 2.05, p: {} },
  { t: 2.5, e: 'inOutCubic', p: { ...STAGE_B, crouch: 0.1, headRoll: 0, headYaw: 0, headPitch: 4, aFwd: 18, aBend: 22, aOut: 10, bFwd: 30, bBend: 30, bOut: 12 } },
  { t: 2.72, p: { crouch: 0.04 } },
  { t: 3.3, p: { headYaw: 18, headPitch: -16 } },
  { t: 4.3, p: {} },
  { t: 4.62, p: { headYaw: 12, headPitch: 14 } },
  { t: 4.98, e: 'inOutCubic', p: { crouch: 0.4, lean: 14, headPitch: 22 } },
  { t: 5.22, p: { lean: 3 } },
  { t: 5.36, e: 'outQuart', p: { lean: -14, x: 0.03, z: 0.76, hop: 0.02 } },
  { t: 5.62, e: 'outBack', p: { lean: 6, hop: 0, crouch: 0.36, headPitch: 26 } },
  { t: 5.85, p: { bFwd: 20, bBend: 30, bOut: 24 } },
  { t: 6.3, p: {} },
  { t: 6.8, e: 'inOutCubic', p: { crouch: 0.16, lean: 3, headPitch: 4, headYaw: 14 } },
  { t: 7.05, p: { headRoll: 13 } },
  { t: 7.5, p: {} },
  { t: 7.95, e: 'inOutCubic', p: { x: -0.2, z: 0.05, rotY: 12, lean: 0, crouch: 0.08, headRoll: 0, headPitch: 0, headYaw: 0, bFwd: 24, bBend: 24, aFwd: 30, aBend: 28 } },
  { t: 8.08, p: { drawer: 1 } },
  { t: 8.62, p: { drawer: 0, headPitch: 22 } },
  { t: 10.05, p: { headPitch: 18 } },
  { t: 10.3, e: 'inOutCubic', p: { notes: 1, headPitch: 6, aFwd: 16, aBend: 20, bFwd: 40, bBend: 60, bOut: 14 } },
  { t: 10.55, p: { notes: 0 } },
  { t: 10.95, e: 'inOutCubic', p: { ...STAGE_B, headYaw: 14, headPitch: 2 } },
  { t: 11.28, e: 'outCubic', p: { bFwd: 168, bBend: 34, bOut: 8, lean: -12, crouch: 0.04, headPitch: -8 } },
  { t: 11.5, e: 'inQuart', p: { bFwd: 72, bBend: 12, lean: 14, crouch: 0.3, headPitch: 10 } },
  { t: 11.85, p: {} },
  { t: 12.2, p: { bFwd: 28, bBend: 30, lean: 2, crouch: 0.08, headPitch: 0 } },
  { t: 12.62, e: 'inOutCubic', p: { x: -0.14, z: 0.12, rotY: 8, headYaw: 0, headPitch: -2 } },
  { t: 12.98, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6, aFwd: 18, aBend: 28 } },
  { t: 15.5, p: {} },
]);
// IK weights per arm (A = screen-left hand, B = the hand nearest the box)
const IKW = {
  0: [[0.3, 0], [0.47, 1], [2.22, 1], [2.4, 0], [7.95, 0], [8.02, 1], [10.28, 1], [10.42, 0]],
  1: [[0.3, 0], [0.47, 1], [2.52, 1], [2.66, 0], [3.42, 0], [3.56, 1], [4.22, 1], [4.4, 0], [4.86, 0], [5.0, 1], [5.62, 1], [5.82, 0], [6.18, 0], [6.36, 1], [7.48, 1], [7.62, 0], [8.25, 0], [8.36, 1], [10.28, 1], [10.42, 0], [11.36, 0], [11.48, 1], [12.0, 1], [12.25, 0]],
};
const EXPR = [[-9, 'wow'], [1.0, 'happy'], [1.75, 'skeptic'], [2.45, 'neutral'], [3.3, 'skeptic'], [4.75, 'focus'], [5.56, 'wow'], [6.0, 'puzzled'], [7.75, 'neutral'], [8.85, 'focus'], [9.98, 'puzzled'], [10.6, 'determined'], [11.6, 'skeptic'], [12.45, 'proud']];
const BLINKS = [2.2, 4.35, 7.7, 8.7, 12.4, 14.3];
let VOICE = null;   // per-frame narration amplitude (injected by render.mjs as /voice.json)

function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  if (t > 2.05 && t < 2.5) p.hop += 0.035 * Math.abs(Math.sin(((t - 2.05) / 0.45) * Math.PI * 2));      // two hop-steps to the plinth
  if (t > 10.55 && t < 10.95) p.hop += 0.03 * Math.abs(Math.sin(((t - 10.55) / 0.4) * Math.PI * 2));
  if (t > 7.5 && t < 7.95) p.hop += 0.03 * Math.abs(Math.sin(((t - 7.5) / 0.45) * Math.PI * 2));
  p.antenna = kick(t, Hh.catch, 22) + kick(t, Hh.yank, 18) + kick(t, Hh.slam, 28) + kick(t, Hh.setDown, 10) + 6 * Math.sin(t * 3.1);
  if (t > 12.98) { p.headPitch += 3 * Math.sin((t - 12.98) * 5) * Math.exp(-(t - 12.98) * 1.2); p.bFwd += 6 * Math.sin((t - 12.98) * 6.2) * Math.exp(-(t - 12.98)); }
  return p;
}
function exprAt(t) { let e = 'neutral'; for (const [t0, x] of EXPR) if (t >= t0) e = x; return e; }
function talkAt(t) { if (!VOICE) return 0; return VOICE[Math.round(t * FPS)] || 0; }
const BOX_ON_PLINTH = new THREE.Vector3(0.42, 0.78, 0.32);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const local = (p, v) => v.clone().applyAxisAngle(V(0, 1, 0), p.rotY * Math.PI / 180).add(V(p.x, p.hop, p.z));   // DOCKET-local -> world

// numeric IK (coordinate descent on the 3 arm angles), blended with the keyed pose by weight w
function solveArm(side, p, target, w) {
  if (w <= 0 || !target) return;
  const tmp = new THREE.Vector3(); const keys = side ? ['bFwd', 'bOut', 'bBend'] : ['aFwd', 'aOut', 'aBend'];
  let x = keys.map((k) => p[k]);
  const lim = [[-60, 200], [-40, 95], [0, 150]];
  const cost = (v) => { docket.setArm(side, v[0], v[1], v[2]); docket.handWorld(side, tmp); return tmp.distanceToSquared(target); };
  let best = cost(x), step = 24;
  for (let it = 0; it < 40 && step > 0.3; it++) {
    let improved = false;
    for (let j = 0; j < 3; j++) for (const s of [1, -1]) {
      const y = x.slice(); y[j] = clamp(y[j] + s * step, lim[j][0], lim[j][1]); const c = cost(y);
      if (c < best) { best = c; x = y; improved = true; }
    }
    if (!improved) step *= 0.5;
  }
  keys.forEach((k, j) => { p[k] = lerp(p[k], x[j], w); });
  docket.setArm(side, p[keys[0]], p[keys[1]], p[keys[2]]);
}

// ---- prop paths (world)
function boxHeldAt(t, p) { return local(p, V(0, 0.42 - p.crouch * 0.12, 0.36)); }
function boxAt(t, p) {
  if (t < Hh.catch) {
    const pc = docketAt(Hh.catch), to = boxHeldAt(Hh.catch, pc), from = V(0.72, 0.55, -1.0), k = inv(Hh.launch, Hh.catch, t);
    const pos = from.clone().lerp(to, k); pos.y += Math.sin(Math.PI * k) * 0.55;
    return { pos, rot: [0.6 * (1 - k), (pc.rotY * Math.PI / 180) * k + 2.2 * (1 - k), -0.4 * (1 - k)] };
  }
  if (t < Hh.carry) return { pos: boxHeldAt(t, p), rot: [0, p.rotY * Math.PI / 180, 0] };
  if (t < Hh.setDown) {
    const pc = docketAt(Hh.carry), from = boxHeldAt(Hh.carry, pc), k = E.inOutCubic(inv(Hh.carry, Hh.setDown, t));
    const pos = from.clone().lerp(BOX_ON_PLINTH, k); pos.y += Math.sin(Math.PI * k) * 0.14;
    return { pos, rot: [0, lerp(pc.rotY * Math.PI / 180, 0, k), 0] };
  }
  return { pos: BOX_ON_PLINTH.clone(), rot: [0, 0, 0] };
}
const boxPoint = (lx, ly, lz) => ansBox.localToWorld(V(lx, ly, lz));
const LIFT_TOP = V(0.41, 1.25, 0.72);
function liftPointAt(t) {
  const grab = drawer.localToWorld(V(-0.135, 0.02, 0.03));               // the CLAIM end of the chain
  return grab.lerp(LIFT_TOP, E.inOutCubic(inv(Hh.lift[0] + 0.1, Hh.lift[1], t))).add(V(0.015 * Math.sin(t * 7), 0, 0));
}
function bookHeldAt(p) { return local(p, V(0.0, 0.8, 0.36)); }
const STAMP_CONTACT = V(0.42, 0.78 + 0.235, 0.32 + 0.17 + 0.026);

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  // props that hands must follow
  const B = boxAt(t, p);
  ansBox.position.copy(B.pos); ansBox.rotation.set(...B.rot);
  const sq = t < Hh.carry ? kick(t, Hh.catch, 0.12, 0.08, 30) : kick(t, Hh.setDown, 0.08, 0.07, 32) + kick(t, Hh.slam, 0.1, 0.07, 34);
  ansBox.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.5);
  const open = t < Hh.yank ? 0 : E.outBack(inv(Hh.yank, Hh.drawerStop, t)) * 0.25;
  drawer.position.z = open;
  scene.updateMatrixWorld(true);
  // ---- IK targets
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = null, tB = null;
  if (t < 2.6) { tA = boxPoint(-0.215, 0.16, 0.0); tB = boxPoint(0.215, 0.16, 0.0); }
  else if (t < 4.5) { let tap = 0; for (const tp of Hh.taps) tap += t >= tp ? Math.exp(-(t - tp) / 0.07) : 0; tB = boxPoint(0, 0.43, 0.1 - 0.04 * tap + 0.03); }
  else if (t < Hh.lift[0]) tB = boxPoint(0, 0.093, 0.235 + open);
  else if (t < 7.7) tB = liftPointAt(t);
  if (t >= 7.9 && t < 8.32) { const v = V(); docket.sources.getWorldPosition(v); tA = v.add(V(0, 0.03, 0.07)); }
  if (t >= 8.25 && t < 10.45) { const b = bookHeldAt(p); const side = V(Math.cos(p.rotY * Math.PI / 180), 0, -Math.sin(p.rotY * Math.PI / 180)); if (t >= 8.32) tA = b.clone().addScaledVector(side, -0.15); tB = b.clone().addScaledVector(side, 0.15); }
  if (t >= 11.3 && t < 12.3) { const k = t < Hh.slam ? E.inQuart(inv(11.32, Hh.slam, t)) : t < Hh.stampLift ? 1 : 1 - E.outCubic(inv(Hh.stampLift, 12.25, t)); tB = STAMP_CONTACT.clone().add(V(0, 0, 0.165)); tB.lerp(STAMP_CONTACT.clone().add(V(-0.12, 0.3, 0.32)), 1 - k); }
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  docket.face(exprAt(t), { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: exprAt(t) === 'focus' ? Math.sin(t * 4) : 0 });
  drawTerminal(t);
  const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB);
  // ---- gauge needle (radians, 0 = up; + = towards SURE)
  let ang = -1.15;
  if (t >= Hh.meterMax) ang = lerp(-1.15, 1.12, E.outBack(inv(Hh.meterMax, Hh.meterMax + 0.25, t)));
  for (const tp of Hh.taps) if (t >= tp) ang += -0.22 * Math.exp(-(t - tp) / 0.1) * Math.cos((t - tp) * 40);
  if (t >= Hh.droop) ang = lerp(1.12, -0.42, E.outBack(inv(Hh.droop, Hh.droop + 0.45, t))) + 0.05 * Math.sin((t - Hh.droop) * 9) * Math.exp(-(t - Hh.droop) * 2);
  gaugeNeedle.rotation.z = -ang;
  drawFront(t >= Hh.meterMax ? (t < Hh.slam ? 0.85 + 0.15 * Math.sin(t * 9) : 0.2) : 0, inv(Hh.slam, Hh.slam + 0.2, t));
  stampMark.visible = t >= Hh.slam;
  stampMark.scale.setScalar(Math.max(0.001, lerp(1.4, 1, E.outBack(inv(Hh.slam, Hh.slam + 0.18, t)))));
  layoutChain(t, open);
  layoutRibbon(t);
  layoutBook(t, p, hA, hB);
  layoutStamp(t, hB);
}

function layoutChain(t, open) {
  const xs = [-0.135, -0.09, -0.045, 0, 0.045, 0.09, 0.135], y0 = -0.028, z0 = 0.03;
  const lifting = t >= Hh.lift[0] && t < Hh.dropChain;
  const dropK = t >= Hh.dropChain ? E.inQuad(inv(Hh.dropChain, Hh.chainLand, t)) : 0;
  let top = null;
  if (t >= Hh.lift[0] && t < Hh.chainLand) { top = drawer.worldToLocal(liftPointAt(Math.min(t, Hh.dropChain))); }
  chainLinks.forEach((l, i) => {
    let x = xs[i], y = y0, z = z0, rx = Math.PI / 2, ry = i % 2 ? Math.PI / 2 : 0;
    if (top && i < 3) {
      const hang = V(top.x, top.y - 0.05 - (2 - i) * 0.047, top.z);       // CLAIM half hangs from the hand
      const rest = V(xs[i], y0, z0);
      const k = lifting ? Math.min(1, inv(Hh.lift[0], Hh.lift[0] + 0.25, t) * 1.0) : 1 - dropK;
      const q = rest.lerp(hang, k); x = q.x; y = q.y; z = q.z; rx = lerp(Math.PI / 2, 0, k);
    }
    if (t >= Hh.chainLand && t < Hh.chainLand + 0.25 && i < 3) y += Math.abs(kick(t, Hh.chainLand, 0.012, 0.05, 40));
    l.position.set(x, y, z); l.rotation.set(rx, ry, 0);
  });
  const c0 = chainLinks[0].position, lifted = top && chainLinks[0].position.y > y0 + 0.02;
  claimTag.position.set(lifted ? c0.x : c0.x + 0.005, lifted ? c0.y - 0.045 : y0 + 0.012, lifted ? c0.z + 0.01 : c0.z + 0.06); claimTag.rotation.set(lifted ? 0 : -Math.PI / 2, 0, 0);
  sourceTag.position.set(xs[6] - 0.005, y0 + 0.012, z0 + 0.06); sourceTag.rotation.set(-Math.PI / 2, 0, 0);
  ghost.position.set(0, y0 + 0.003, z0); ghost.rotation.set(-Math.PI / 2, 0, 0);
  ghost.material.opacity = t < Hh.gapGlow ? 0 : 0.6 + 0.4 * Math.sin((t - Hh.gapGlow) * 9);
  ghost.scale.setScalar(1 + 0.15 * Math.sin((t - Hh.gapGlow) * 9)); ghost.visible = t >= Hh.gapGlow;
}
function layoutRibbon(t) {
  const on = t >= Hh.ribbon[0] && t < Hh.ribbon[1] + 0.35;
  ribbon.visible = on; if (!on) return;
  const grow = t < Hh.ribbon[1] ? E.outCubic(inv(Hh.ribbon[0], Hh.ribbon[0] + 1.2, t)) : 1 - E.inQuad(inv(Hh.ribbon[1], Hh.ribbon[1] + 0.35, t));
  const pos = ribbon.geometry.attributes.position, base = ribbon.userData.base, n = pos.count;
  const o = V(0.42, 1.125, 0.22);
  for (let i = 0; i < n; i++) {
    const u = (base[i * 3] + 0.5) * grow, v = base[i * 3 + 1], ang = u * 6 + t * 1.6;
    const x = o.x + u * 0.42 + 0.05 * Math.sin(ang), y = o.y + u * 0.5 + 0.04 * Math.sin(ang * 0.8), z = o.z + u * 0.35 + 0.07 * Math.sin(u * 4 + t);
    pos.setXYZ(i, x, y + v * Math.cos(ang * 0.5), z + v * Math.sin(ang * 0.5));
  }
  pos.needsUpdate = true; ribbon.geometry.computeVertexNormals();
  ribbonTex.offset.x = -t * 0.35; ribbonTex.repeat.x = 0.6 * Math.max(0.05, grow);
}
function layoutBook(t, p, hA, hB) {
  const vis = t >= Hh.bookOut - 0.1 && t < 10.75;
  book.visible = vis; beam.visible = false; if (!vis) return;
  const yaw = p.rotY * Math.PI / 180, drawerPos = V(); docket.sources.getWorldPosition(drawerPos);
  const held = bookHeldAt(p);
  let pos;
  if (t < Hh.bookOut + 0.15) pos = drawerPos.clone().lerp(held, E.outCubic(inv(Hh.bookOut - 0.1, Hh.bookOut + 0.15, t)));
  else if (t < 10.35) pos = held;
  else pos = held.clone().lerp(drawerPos, E.inQuad(inv(10.35, 10.7, t)));
  book.position.copy(pos).add(V(-Math.cos(yaw) * 0.12, 0, Math.sin(yaw) * 0.12));
  book.rotation.set(0.62, yaw, 0, 'YXZ');
  const open = t < Hh.bookOpen ? 0 : t < Hh.bookClose ? E.outBack(inv(Hh.bookOpen, Hh.bookOpen + 0.3, t)) : 1 - E.inOutCubic(inv(Hh.bookClose, Hh.bookClose + 0.2, t));
  bookCover.rotation.z = open * Math.PI * 0.98;
  drawPages(inv(Hh.scan[0], Hh.scan[1], t), clamp((t - Hh.noMatch) / 0.12));
  if (t >= Hh.scan[0] && t < Hh.scan[1] + 0.05) {
    beam.visible = true; scene.updateMatrixWorld(true);
    const f = V(), pg = V(); docket.faceMesh.getWorldPosition(f); bookPages.getWorldPosition(pg);
    pg.x += 0.05 * Math.sin((t - Hh.scan[0]) * 9);
    const d = pg.clone().sub(f), L = d.length();
    beam.scale.set(0.8, L, 0.8); beam.position.copy(f).addScaledVector(d, 0.5);
    beam.quaternion.setFromUnitVectors(V(0, -1, 0), d.normalize());
    beam.material.opacity = 0.16 + 0.07 * Math.sin(t * 30);
  }
}
function layoutStamp(t, hB) {
  const vis = t >= Hh.notesOpen && t < 12.6;
  stamp.visible = vis; if (!vis) return;
  const notesPos = V(); docket.notes.getWorldPosition(notesPos);
  const k = t < 11.32 ? 0 : t < Hh.slam ? E.inQuart(inv(11.32, Hh.slam, t)) : t < Hh.stampLift ? 1 : 1 - E.outCubic(inv(Hh.stampLift, 12.25, t));
  const rx = lerp(0, -Math.PI / 2, Math.min(1, k * 1.4) * (t >= 11.2 ? 1 : 0));
  stamp.rotation.set(rx, 0, 0.25 * Math.sin(t * 2) * (1 - k));
  stamp.updateMatrixWorld(true);
  const up = V(0, 1, 0).applyEuler(stamp.rotation);
  let pos = hB.clone().addScaledVector(up, -0.16);                    // knob in the hand
  if (t < Hh.stampInHand) pos = notesPos.clone().lerp(pos, E.outCubic(inv(Hh.notesOpen, Hh.stampInHand, t)));
  stamp.position.copy(pos);
}

// ------------------------------------------------------------------ camera
const CAM = [
  [0.0, [0.2, 1.35, 3.3], [0.12, 0.92, -0.3]], [0.62, [0.04, 1.24, 2.85], [-0.1, 0.9, 0.0]], [2.15, [0.06, 1.25, 2.8], [-0.04, 0.92, 0.05]],
  [2.75, [1.25, 1.38, 2.6], [0.22, 0.98, 0.45]], [4.5, [1.2, 1.36, 2.5], [0.24, 0.98, 0.47]],
  [5.05, [0.62, 1.52, 1.42], [0.42, 0.86, 0.64]], [6.32, [0.64, 1.5, 1.44], [0.42, 0.86, 0.64]], [6.8, [1.2, 1.46, 2.3], [0.26, 0.98, 0.55]], [7.45, [1.16, 1.44, 2.25], [0.27, 0.98, 0.55]],
  [8.1, [-0.1, 1.3, 2.35], [-0.18, 0.98, 0.1]], [10.25, [-0.06, 1.28, 2.25], [-0.14, 0.98, 0.1]],
  [10.9, [1.25, 1.38, 2.6], [0.24, 0.98, 0.45]], [12.3, [1.2, 1.36, 2.52], [0.25, 0.98, 0.45]],
  [13.1, [0.25, 1.18, 3.1], [0.14, 0.9, 0.15]], [15.0, [0.22, 1.16, 2.9], [0.14, 0.9, 0.15]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.catch, 0.012, 0.1, 40) + kick(t, Hh.slam, 0.022, 0.1, 44) + kick(t, Hh.yank, 0.01, 0.1, 40) + kick(t, Hh.setDown, 0.006, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}

// ------------------------------------------------------------------ overlay (captions, signature, label)
let ICON = null;
function overlay(t) {
  const c = octx;
  // signature (small, unobtrusive)
  c.save(); c.globalAlpha = 0.85;
  if (ICON) { c.save(); c.beginPath(); c.roundRect(60, 86, 46, 46, 11); c.clip(); c.drawImage(ICON, 60, 86, 46, 46); c.restore(); }
  c.font = '700 22px "JetBrains Mono"'; c.letterSpacing = '4px'; c.fillStyle = '#F4F7FB'; c.textBaseline = 'middle';
  c.fillText('IDEAVERSE', 120, 101); c.fillStyle = P.mint; c.fillText('AI LITERACY · 01', 120, 124); c.restore();
  // captions
  for (const cap of C.captions) {
    if (t < cap.t0 || t >= cap.t1) continue;
    const kin = E.outBack(inv(cap.t0, cap.t0 + 0.28, t)), kout = 1 - E.inQuad(inv(cap.t1 - 0.16, cap.t1, t));
    const size = cap.big ? 82 : 66, y = cap.big ? 300 : 268;
    c.save(); c.font = `700 ${size}px "Space Grotesk"`; c.letterSpacing = '0px'; c.textBaseline = 'middle';
    const widths = cap.parts.map(([s]) => c.measureText(s).width), total = widths.reduce((a, b) => a + b, 0);
    let lines = [cap.parts]; let maxW = 920;
    if (total > maxW) { // split into two lines at the part boundary
      lines = [cap.parts.slice(0, 1), cap.parts.slice(1)];
    }
    const lh = size * 1.18, bh = lines.length * lh + 44;
    const lw = Math.min(980, Math.max(...lines.map((ln) => ln.reduce((a, [s]) => a + c.measureText(s).width, 0))) + 72);
    c.globalAlpha = kout; c.translate(W / 2, y + (bh / 2 - 34)); c.scale(0.85 + 0.15 * kin, 0.85 + 0.15 * kin); c.translate(-W / 2, -(y + (bh / 2 - 34)));
    c.fillStyle = 'rgba(11,16,32,0.72)'; c.beginPath(); c.roundRect(W / 2 - lw / 2, y - 34 - 6, lw, bh, 28); c.fill();
    c.strokeStyle = 'rgba(108,218,126,0.35)'; c.lineWidth = 2; c.stroke();
    lines.forEach((ln, li) => {
      const lwid = ln.reduce((a, [s]) => a + c.measureText(s).width, 0); let x = W / 2 - lwid / 2; const yy = y + 16 + li * lh;
      for (const [s, col] of ln) { c.fillStyle = col === 1 ? P.mint : col === 2 ? AMBER : '#F4F7FB'; c.fillText(s, x, yy); x += c.measureText(s).width; }
    });
    if (cap.sub) {
      const ks = inv(C.hits.sub, C.hits.sub + 0.3, t);
      c.globalAlpha = kout * ks; c.font = '500 44px "Space Grotesk"'; c.fillStyle = '#F4F7FB'; c.textAlign = 'center';
      c.fillText(cap.sub, W / 2, y + bh + 6 + 10 * (1 - ks));
    }
    c.restore();
  }
  // illustration label
  c.save(); c.font = '700 20px "JetBrains Mono"'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(244,247,251,0.6)'; c.textAlign = 'right';
  c.fillText('ILLUSTRATIVE EXAMPLE · NOT A REAL CHAT', W - 60, 1700); c.restore();
  // vignette
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}

window.renderAt = (t) => {
  stageAt(t); cameraAt(t);
  renderer.render(scene, cam);
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(glCanvas, 0, 0);
  overlay(t);
  return true;
};

// ------------------------------------------------------------------ character / model sheet
window.renderSheet = () => {
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#0E1424'; c.fillRect(0, 0, W, H);
  c.font = '700 64px "Space Grotesk"'; c.fillStyle = '#F4F7FB'; c.textBaseline = 'alphabetic'; c.fillText('DOCKET', 60, 110);
  c.font = '700 22px "JetBrains Mono"'; c.letterSpacing = '4px'; c.fillStyle = P.mint; c.fillText('ROBOT REPORTER · IDEAVERSE AI LITERACY · MODEL SHEET v1', 60, 150); c.letterSpacing = '0px';
  // hide props for clean turnarounds
  for (const o of [ansBox, ribbon, book, beam, stamp, plinth, terminal]) o.visible = false;
  const shots = (list, y, h, label) => {
    const w = (W - 120 - (list.length - 1) * 16) / list.length;
    c.font = '700 20px "JetBrains Mono"'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(244,247,251,0.7)'; c.fillText(label, 60, y - 14); c.letterSpacing = '0px';
    list.forEach(([name, pose, expr, camPos], i) => {
      docket.pose({ ...pose }); docket.face(expr, { t: 1 }); docket.root.position.set(0, pose.hop || 0, 0);
      cam.aspect = w / h; cam.updateProjectionMatrix(); cam.position.set(...camPos); cam.lookAt(0, 0.75, 0);
      renderer.setSize(Math.round(w), Math.round(h), false); renderer.render(scene, cam);
      const x = 60 + i * (w + 16); c.drawImage(glCanvas, 0, 0, Math.round(w), Math.round(h), x, y, w, h);
      c.strokeStyle = 'rgba(108,218,126,0.3)'; c.strokeRect(x, y, w, h);
      c.font = '700 18px "JetBrains Mono"'; c.fillStyle = '#F4F7FB'; c.fillText(name, x + 10, y + h - 14);
    });
  };
  const R = 3.0;
  const view = (a) => [Math.sin(a) * R, 0.9, Math.cos(a) * R];
  shots([['FRONT', {}, 'neutral', view(0)], ['3/4', {}, 'happy', view(0.7)], ['SIDE', {}, 'neutral', view(Math.PI / 2)], ['BACK', {}, 'neutral', view(Math.PI)]], 200, 520, 'TURNAROUND (h ≈ 1.55 u, mic antenna incl.)');
  shots([
    ['CATCH', { crouch: 0.6, lean: 14, aFwd: 54, bFwd: 54, aBend: 58, bBend: 58, aOut: 18, bOut: 18 }, 'wow', view(0.35)],
    ['PULL', { crouch: 0.36, lean: -12, aFwd: 66, aOut: 52, aBend: 22, rotY: 0 }, 'focus', view(0.35)],
    ['STAMP', { aFwd: 168, aBend: 26, aOut: 22, lean: -12 }, 'determined', view(0.35)],
    ['LESSON', { bFwd: 128, bOut: 16, bBend: 6, aFwd: 18, aBend: 28 }, 'proud', view(0.2)],
  ], 790, 520, 'KEY POSES');
  // expressions
  const ex = ['neutral', 'happy', 'wow', 'skeptic', 'puzzled', 'focus', 'determined', 'proud'];
  c.font = '700 20px "JetBrains Mono"'; c.letterSpacing = '3px'; c.fillStyle = 'rgba(244,247,251,0.7)'; c.fillText('FACE SCREEN EXPRESSIONS (talk = mouth bar from voice amplitude)', 60, 1372); c.letterSpacing = '0px';
  ex.forEach((e, i) => {
    docket.face(e, { t: 1.2 }); const x = 60 + (i % 4) * 245, y = 1390 + Math.floor(i / 4) * 180;
    c.drawImage(docket.faceCanvas, x, y, 230, 151); c.font = '700 18px "JetBrains Mono"'; c.fillStyle = '#F4F7FB'; c.fillText(e.toUpperCase(), x + 6, y + 172);
  });
  // palette
  const pal = [['NAVY #1B2333', P.navy], ['MINT #6CDA7E', P.mint], ['SHELL #E9EFF2', P.shell], ['WHITE #F4F7FB', '#F4F7FB'], ['AMBER #FFC24B*', AMBER]];
  pal.forEach(([n, col], i) => { const x = 60 + i * 196; c.fillStyle = col; c.fillRect(x, 1770, 60, 60); c.font = '700 15px "JetBrains Mono"'; c.fillStyle = '#F4F7FB'; c.fillText(n, x, 1855); });
  c.font = '500 18px "Space Grotesk"'; c.fillStyle = 'rgba(244,247,251,0.6)'; c.fillText('Navy/mint/white sampled from the Ideaverse icon. *Amber = provisional "unverified" accent.', 60, 1890);
  renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
  return true;
};

window.READY = (async () => {
  await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', 'italic 500 40px "Space Grotesk"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"');
})();
