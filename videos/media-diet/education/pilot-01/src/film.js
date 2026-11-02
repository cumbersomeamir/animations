// Pilot 01 — "What happens when you send a message across the internet" (15.000 s, 1080x1920, 30 fps).
// Every frame is a pure function of time t = frame / fps (deterministic, renderable out of order).
import * as THREE from 'three';
import { makeRenderer, toon, addLights } from './common.js';
import { createNodo, POSES, NODO_DEFAULT } from './nodo.js';
import { makeEnvironment, makeLabel, makeBadge, makePhone, makeWifiRouter, makeRouter, makeServer, makePacket, makeBubble, makeDashBeam } from './world.js';
import { PAL } from './palette.js';
import { clamp, lerp, ease, prog, pulse, wobble, noise1, track, arc, radialGlowTexture } from './util.js';

const TL = await (await fetch('./timeline.json')).json();
let MOUTH = null;
try { MOUTH = await (await fetch('./data/mouth.json')).json(); } catch { MOUTH = null; }
const W = TL.width, H = TL.height, FPS = TL.fps;

const { renderer, effect, overlay } = makeRenderer(W, H);
const scene = new THREE.Scene();
const lights = addLights(scene);
makeEnvironment(scene);
const camera = new THREE.PerspectiveCamera(48, W / H, 0.05, 200);

// ------------------------------------------------------------------ world
const phoneA = makePhone(toon, { states: [
  { name: 'Alex', avatar: PAL.blue, bubbles: [{ text: 'you nearby?', mine: false }], input: 'On my way!' },
  { name: 'Alex', avatar: PAL.blue, bubbles: [{ text: 'you nearby?', mine: false }, { text: 'On my way!', mine: true }], input: '' },
] });
scene.add(phoneA.grp);
const PB_Z = -37.4;
const phoneB = makePhone(toon, { flip: true, states: [
  { name: 'Sam', avatar: PAL.magenta, bubbles: [{ text: 'you nearby?', mine: true }], input: '' },
  { name: 'Sam', avatar: PAL.magenta, bubbles: [{ text: 'you nearby?', mine: true }, { text: 'On my way!', mine: false }], input: '' },
] });
phoneB.grp.position.set(0, 0, PB_Z); scene.add(phoneB.grp);

const wifi = makeWifiRouter(toon); wifi.grp.position.set(2.7, 0, -6.2); wifi.grp.rotation.y = -0.35; scene.add(wifi.grp);
const routerPos = [new THREE.Vector3(-2.3, 0, -11.2), new THREE.Vector3(2.3, 0, -15.6), new THREE.Vector3(-1.7, 0, -20.0), new THREE.Vector3(-1.6, 0, -31.6)];
const routers = routerPos.map((p) => { const r = makeRouter(toon); r.grp.position.copy(p); scene.add(r.grp); return r; });
const server = makeServer(toon); server.grp.position.set(2.0, 0, -26.0); scene.add(server.grp);
const toWorld = (obj, v) => { obj.grp.updateMatrixWorld(true); return v.clone().applyMatrix4(obj.grp.matrixWorld); };

const N = {
  wifi: toWorld(wifi, wifi.nodeLocal),
  r1: toWorld(routers[0], routers[0].nodeLocal), r2: toWorld(routers[1], routers[1].nodeLocal), r3: toWorld(routers[2], routers[2].nodeLocal),
  slot: toWorld(server, server.slotLocal), stamp: toWorld(server, server.stampLocal), shaft: toWorld(server, server.shaftBottomLocal), roof: toWorld(server, server.roofLocal),
  r4: toWorld(routers[3], routers[3].nodeLocal),
  land: new THREE.Vector3(0.55, 0.68, PB_Z + 0.9),
};
// orient router scanner arches to face the incoming direction
const archFace = [[N.wifi, N.r1], [N.r1, N.r2], [N.r2, N.r3], [N.roof, N.r4]];


// packets
const packets = [0, 1, 2].map((i) => { const p = makePacket(toon, i); scene.add(p.grp); p.trail.forEach((s) => scene.add(s)); return p; });
// message bubbles
const bubbleA = makeBubble(toon, 'On my way!'); scene.add(bubbleA.grp);
const bubbleB = makeBubble(toon, 'On my way!'); scene.add(bubbleB.grp);
// "straight line" beam (the misconception)
const beam = makeDashBeam(new THREE.Vector3(0.2, 0.9, 0.6), new THREE.Vector3(0.2, 0.9, PB_Z + 1.2), 4.8);
scene.add(beam.grp);
const crossTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fillStyle = '#07092a'; g.fill(); g.lineWidth = 7; g.strokeStyle = PAL.magenta; g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 40); g.lineTo(88, 88); g.moveTo(88, 40); g.lineTo(40, 88); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const cross = new THREE.Sprite(new THREE.SpriteMaterial({ map: crossTex, transparent: true, fog: false, sizeAttenuation: false, depthTest: false }));
cross.renderOrder = 20; scene.add(cross);

// labels (constant on-screen size)
const L = (text, pos, h0, extra = {}) => { const s = makeLabel(text, { ...extra }); s.material.sizeAttenuation = false; const a = s.scale.x / s.scale.y; s.userData.aspect = a; s.userData.h = h0 * 0.72; s.position.copy(pos); scene.add(s); return s; };
const labels = {
  you: L('YOUR PHONE', new THREE.Vector3(2.0, 0.6, 2.4), 0.05),
  friend: L("FRIEND'S PHONE", new THREE.Vector3(0.2, 2.2, PB_Z), 0.05),
  wifi: L('Wi-Fi ROUTER', N.wifi.clone().add(new THREE.Vector3(-1.35, -0.6, 1.2)), 0.05),
  routers: L('ROUTERS', new THREE.Vector3(0.4, 4.9, -15.0), 0.05),
  server: L("APP'S SERVERS", new THREE.Vector3(3.0, 4.3, -24.0), 0.055, { border: PAL.magenta, depthTest: false }),
  friend2: L("FRIEND'S PHONE", new THREE.Vector3(0.2, 0.6, PB_Z - 2.3), 0.045),
};
const badgeNodes = [N.wifi, N.r1, N.r2, N.r3, N.r4];
const badges = badgeNodes.map((n, i) => { const b = makeBadge(i + 1); b.material.sizeAttenuation = false; b.position.copy(n).add(new THREE.Vector3(0, 1.05, 0)); scene.add(b); return b; });

// the hidden middle of the network rises out of the floor on "Nope"
const RISERS = [[wifi.grp, 1.4], ...routers.map((r) => [r.grp, 2.4]), [server.grp, 6.3]];
function riseNetwork(t) {
  RISERS.forEach(([g, h], k) => {
    const r = ease.outBack(clamp((t - 2.86 - k * 0.07) / 0.5));
    g.position.y = (r - 1) * h; g.scale.y = Math.max(0.001, 0.15 + 0.85 * r); g.visible = r > 0.001;
  });
}

// route trail tube (built from the lead packet path)
let routeTube = null, routeCount = 0;

// Nodo + tether cable + blob shadow
const nodo = createNodo(toon); scene.add(nodo.root);
const cableMat = new THREE.MeshBasicMaterial({ color: PAL.cyan }); cableMat.userData.outlineParameters = { visible: false };
let cableMesh = null;
const shadowTex = radialGlowTexture('#000000');
const blob = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false }));
blob.material.userData.outlineParameters = { visible: false }; blob.rotation.x = -Math.PI / 2; scene.add(blob);

// ------------------------------------------------------------------ packet choreography
const DELAY = [0, 0.12, 0.24];
// lead-packet network schedule: [node, arrive, depart, arcHeight]
const ROUTE = [
  ['wifi', 6.85, 6.95, 1.5], ['r1', 7.35, 7.45, 1.3], ['r2', 7.85, 7.95, 1.2], ['r3', 8.35, 8.45, 1.2],
  ['slot', 8.95, 8.95, 0.7], ['stamp', 9.5, 9.5, 0], ['shaft', 9.9, 9.9, 0], ['roof', 10.2, 10.2, 0],
  ['r4', 10.75, 10.83, 1.6], ['land', 11.15, 99, 0.9],
];
const HOVER = [null, new THREE.Vector3(-1.6, 2.45, 1.0), new THREE.Vector3(-0.75, 3.3, 0.45)];
const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

function bubbleAPos(t) {
  // lifts out of the input bar at 3.62, floats up, pops into packets at 4.15
  const start = phoneA.inputLocal.clone().applyMatrix4(phoneA.grp.matrixWorld);
  const end = new THREE.Vector3(-0.6, 3.3, 1.3);
  const u = prog(t, 3.62, 4.12, ease.out);
  return new THREE.Vector3().lerpVectors(start, end, u).add(new THREE.Vector3(0, 0.25 * Math.sin(u * Math.PI), 0));
}

function holdPos(t, out) {
  // in front of Nodo's chest/face while held (computed from Nodo's root transform; clamped to the toss moment)
  const st = nodoState(Math.min(t, 6.3));
  const off = new THREE.Vector3(0, 1.2, 0.58).applyAxisAngle(new THREE.Vector3(0, 1, 0), st.rotY);
  return out.copy(st.pos).add(off);
}

function packetState(i, t) {
  const s = { pos: new THREE.Vector3(), visible: true, scale: 1, spin: 0, tag: 'a', moving: false };
  const d = DELAY[i];
  if (t < 4.15) { s.visible = false; return s; }
  const split = bubbleAPos(4.15);
  const spawn = split.clone().add([new THREE.Vector3(0.8, 0, 0), new THREE.Vector3(-0.8, 0, 0), new THREE.Vector3(0, 0.5, 0)][i]);
  if (t < 6.32) {
    s.scale = ease.outBack(clamp((t - 4.15) / 0.22));
    if (i === 0) {
      if (t < 4.6) { const u = prog(t, 4.15, 4.6, ease.inOut); s.pos.lerpVectors(spawn, holdPos(4.6, tmp), u); s.spin = (1 - u) * 1.2; }
      else { holdPos(t, s.pos); s.spin = -0.25 * prog(t, 4.6, 4.95); s.pos.y += 0.05 * wobble(t, 4.6, 3, 7); }
    } else {
      const u = prog(t, 4.15, 4.55, ease.out);
      s.pos.lerpVectors(spawn, HOVER[i], u); s.pos.y += 0.07 * Math.sin((t - 4.15) * 3.2 + i * 2);
      s.spin = 0.25 * Math.sin(t * 1.3 + i);
    }
    return s;
  }
  // network journey
  const tt = t - d;
  let prevPos = i === 0 ? holdPos(6.32, new THREE.Vector3()) : HOVER[i].clone();
  let prevDepart = 6.32;
  for (const [node, arr, dep, h] of ROUTE) {
    const target = N[node];
    if (tt < arr) {
      const u = clamp((tt - prevDepart) / (arr - prevDepart));
      if (tt < prevDepart) { s.pos.copy(prevPos); return s; }
      const e = node === 'stamp' || node === 'shaft' ? ease.inOut : node === 'roof' ? ease.in : ease.inOut;
      arc(prevPos, target, h, e(u), s.pos); s.moving = true; s.spin = u * Math.PI * 0.5;
      if (['shaft', 'roof', 'r4', 'land'].includes(node)) s.tag = 'b';
      if (node === 'stamp' && u > 0.92) s.tag = 'b';
      return s;
    }
    if (tt <= dep) {
      s.pos.copy(target); s.tag = ['shaft', 'roof', 'r4', 'land'].includes(node) ? 'b' : 'a';
      if (node === 'land') { // settle, then merge into the bubble at 11.55
        s.tag = 'b';
        const m = prog(t, 11.45, 11.62, ease.in);
        s.scale = 1 - m; s.visible = m < 0.999;
        s.pos.x += (i - 1) * 0.55 * (1 - m); s.pos.y += 0.05 * wobble(tt, arr, 4, 9);
      }
      return s;
    }
    prevPos = target; prevDepart = dep;
  }
  return s;
}

// ------------------------------------------------------------------ Nodo choreography
const POSE_KEYS = [
  [0.0, { ...POSES.idle, headX: -0.45, headY: -0.5, twist: -0.25, lookY: 0.9, lookX: -0.4, browL: 0.6, browR: 0.6, smile: 0.2 }],
  [0.9, { ...POSES.idle, headX: -0.45, headY: -0.45, twist: -0.25, lookY: 0.9, lookX: -0.4, browL: 0.7, browR: 0.7, smile: 0.2 }],
  [1.25, mirror({ ...POSES.pointUp, shRx: -2.35, shRz: -0.75, shRy: 0.2, headY: 0.25, headX: -0.2, lookY: 0.35, lookX: 0.5 }), 'outBack'],
  [1.75, mirror({ ...POSES.pointUp, shRx: -2.4, shRz: -0.7, shRy: 0.2, headY: 0.1, headX: -0.1, lookY: 0.1, lookX: 0.1 })],
  [2.1, POSES.puzzled],
  [2.7, POSES.puzzled],
  [2.82, POSES.nope, 'out'],
  [3.25, POSES.nope],
  [3.38, POSES.stompUp, 'out'],
  [3.55, POSES.stompDown, 'in'],
  [3.7, POSES.stompDown],
  [3.95, { ...POSES.idle, headX: -0.55, lookY: 0.9, browL: 1, browR: 1, eyeL: 1.15, eyeR: 1.15, mouth: 0.3, smile: 0.5 }],
  [4.3, { ...POSES.reach, headX: -0.3 }],
  [4.6, POSES.reach],
  [4.85, POSES.hold],
  [5.05, POSES.inspect],
  [5.95, POSES.inspect],
  [6.17, POSES.windup],
  [6.32, POSES.toss, 'out'],
  [6.5, POSES.surf],
  [8.45, POSES.surf],
  [8.62, { ...POSES.crouch, shLz: 1.2, shRz: -1.2 }],
  [8.85, { ...POSES.yanked, pitch: 0, shLx: -2.6, shRx: -2.6 }],
  [9.02, POSES.land, 'in'],
  [9.25, POSES.idle, 'out'],
  [9.42, POSES.pointUp, 'outBack'],
  [9.82, POSES.pointUp],
  [10.02, POSES.peek],
  [10.22, POSES.peek],
  [10.3, POSES.fire, 'out'],
  [10.48, POSES.fire],
  [10.6, POSES.yanked, 'in'],
  [10.85, POSES.flying],
  [11.4, POSES.flying],
  [11.55, { ...POSES.yanked, pitch: 0 }],
  [11.7, { ...POSES.land, eyeL: 0.45, eyeR: 0.85, headZ: 0.2, browAngL: 0.5, smile: 0.1, mouth: 0.15 }, 'out'],
  [12.1, { ...POSES.land, squash: 0.1, bob: -0.12, eyeL: 0.6, eyeR: 0.9, headZ: 0.12, smile: 0.3 }],
  [12.4, POSES.idle, 'out'],
  [12.6, POSES.present, 'outBack'],
  [13.35, { ...POSES.present, headY: -0.05, lookX: 0 }],
  [13.6, POSES.thumbsUp, 'outBack'],
  [15.0, POSES.thumbsUp],
];
function mirror(p) {
  const q = { ...p }; const sw = (a, b, neg) => { const va = p[a], vb = p[b]; delete q[a]; delete q[b]; if (vb !== undefined) q[a] = neg ? -vb : vb; if (va !== undefined) q[b] = neg ? -va : va; };
  sw('shLx', 'shRx'); sw('shLz', 'shRz', true); sw('shLy', 'shRy', true); sw('elL', 'elR'); sw('ptL', 'ptR'); sw('thL', 'thR'); sw('wrL', 'wrR', true);
  sw('hipLx', 'hipRx'); sw('hipLz', 'hipRz', true); sw('knL', 'knR'); sw('ftL', 'ftR'); sw('browL', 'browR'); sw('browAngL', 'browAngR'); sw('eyeL', 'eyeR');
  for (const k of ['headY', 'headZ', 'twist', 'sway', 'roll', 'lookX']) if (p[k] !== undefined) q[k] = -p[k];
  return q;
}
function poseAt(t) {
  let a = POSE_KEYS[0], b = POSE_KEYS[POSE_KEYS.length - 1];
  for (let i = 0; i < POSE_KEYS.length - 1; i++) if (t >= POSE_KEYS[i][0] && t <= POSE_KEYS[i + 1][0]) { a = POSE_KEYS[i]; b = POSE_KEYS[i + 1]; break; }
  if (t >= b[0]) a = b;
  const u = a === b ? 1 : (ease[b[2] || 'inOut'])(clamp((t - a[0]) / (b[0] - a[0])));
  const out = {};
  for (const k of Object.keys(NODO_DEFAULT)) {
    const va = a[1][k] ?? NODO_DEFAULT[k], vb = b[1][k] ?? NODO_DEFAULT[k];
    out[k] = k === 'ptL' || k === 'ptR' || k === 'thL' || k === 'thR' ? lerp(va, vb, clamp(u * 1.6)) : lerp(va, vb, u);
  }
  return out;
}

const START = new THREE.Vector3(0.5, 0.33, 1.78);
function nodoState(t) {
  const st = { pos: new THREE.Vector3(), rotY: 0, airborne: false, extra: {} };
  if (t < 6.32) {
    st.pos.copy(START);
    st.rotY = track([[0, -0.15], [0.9, -0.15], [1.25, 0.25], [3.25, 0.25], [3.36, 1.0], [3.7, 1.0], [3.95, 0.35], [4.3, 0.5], [6.32, 0.45]], t);
    // small step toward the send button during the stomp (right foot lands on the button)
    st.pos.x += 0.12 * prog(t, 3.38, 3.55) * (1 - prog(t, 3.75, 4.0)); st.pos.z += 0.1 * prog(t, 3.38, 3.55) * (1 - prog(t, 3.75, 4.0));
    if (t > 6.17) { st.pos.y += 0.25 * ease.out(clamp((t - 6.25) / 0.07)); st.airborne = t > 6.25; }
    return st;
  }
  if (t < 8.55) {
    // riding the lead packet (surf stance, sideways to travel)
    const p = packetState(0, t).pos; const p2 = packetState(0, t + 0.04).pos;
    const dx = p2.x - p.x, dz = p2.z - p.z; const heading = Math.hypot(dx, dz) > 1e-4 ? Math.atan2(dx, dz) : -2.6;
    st.pos.copy(p); st.pos.y += 0.31;
    st.rotY = heading + Math.PI / 2;
    if (t < 6.5) { const u = prog(t, 6.32, 6.5, ease.out); st.pos.lerpVectors(START.clone().setY(0.6), st.pos, u); }
    st.airborne = true;
    return st;
  }
  if (t < 9.02) {
    // jump off toward the server forecourt
    const from = packetState(0, 8.55).pos.clone().setY(packetState(0, 8.55).pos.y + 0.31);
    const to = new THREE.Vector3(4.2, 0.0, -23.1);
    arc(from, to, 1.2, prog(t, 8.55, 9.02, ease.linear), st.pos); st.rotY = track([[8.55, -1.2], [9.02, -0.55]], t); st.airborne = true;
    return st;
  }
  if (t < 10.5) {
    st.pos.set(4.2, 0, -23.1);
    // two small steps toward the cutaway window (walk) 9.8 -> 10.1
    const w = prog(t, 9.82, 10.1, ease.inOut); st.pos.x += -0.15 * w; st.pos.z += -0.55 * w;
    st.rotY = track([[9.02, -0.55], [9.42, -0.3], [9.82, -0.3], [10.05, -1.1], [10.25, -1.0], [10.4, -0.6]], t);
    st.extra.walk = w > 0 && w < 1 ? Math.sin(w * Math.PI * 2) : 0;
    return st;
  }
  if (t < 11.45) {
    // yanked up by the tether, then flying behind packet 3
    const lag = packetState(2, t - 0.16).pos.clone();
    const pk = packetState(2, t).pos;
    const dir = pk.clone().sub(lag); const heading = Math.atan2(dir.x, dir.z);
    const behind = lag.clone().add(new THREE.Vector3(0, -1.25, 0));
    if (t < 10.75) { const u = prog(t, 10.5, 10.75, ease.in); st.pos.lerpVectors(new THREE.Vector3(4.05, 0, -23.65), behind, u); }
    else st.pos.copy(behind);
    st.rotY = heading; st.airborne = true;
    return st;
  }
  // release, tumble, land on the friend's phone
  const rel = (() => { const lag = packetState(2, 11.45 - 0.16).pos.clone(); return lag.add(new THREE.Vector3(0, -1.25, 0)); })();
  const landAt = new THREE.Vector3(-0.85, 0.33, PB_Z - 1.25);
  if (t < 11.68) {
    arc(rel, landAt, 0.7, prog(t, 11.45, 11.68, ease.linear), st.pos); st.rotY = Math.PI; st.airborne = true;
    st.extra.tumble = prog(t, 11.45, 11.68, ease.out) * Math.PI * 2;
    return st;
  }
  st.pos.copy(landAt); st.rotY = track([[11.68, Math.PI], [12.4, Math.PI - 0.15], [12.6, Math.PI + 0.35], [13.35, Math.PI + 0.1], [13.6, Math.PI - 0.12]], t);
  return st;
}

// ------------------------------------------------------------------ camera
function camAt(t) {
  const c = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 48, shot: 0 };
  if (t < 2.65) {
    c.shot = 1; const u = prog(t, 0, 2.65, ease.out);
    c.pos.set(lerp(2.9, 2.5, u), lerp(2.9, 2.75, u), lerp(9.6, 8.7, u)); c.look.set(lerp(-0.2, -0.1, u), lerp(1.2, 1.25, u), -14); c.fov = 54;
  } else if (t < 6.32) {
    c.shot = 2;
    const zin = prog(t, 4.75, 5.35, ease.inOut) * (1 - prog(t, 5.95, 6.32, ease.inOut));
    c.pos.set(lerp(2.7, 1.95, zin), lerp(2.35, 2.25, zin), lerp(7.6, 5.1, zin));
    c.look.set(lerp(0.0, 0.5, zin), lerp(2.0, 2.0, zin), lerp(0.6, 1.9, zin));
    c.look.y += 0.45 * prog(t, 3.65, 4.0) * (1 - prog(t, 4.25, 4.6));
    c.fov = 46;
  } else if (t < 8.75) {
    c.shot = 3;
    // follow the averaged lead-packet position (pure function of t)
    // follows the packets' progress in depth (z, y) but keeps x steady so the left/right hops read as a zigzag
    const avg = new THREE.Vector3(); let n = 0;
    for (let k = 0; k <= 8; k++) { avg.add(packetState(0, Math.max(6.32, t - 0.24 + k * 0.03)).pos); n++; }
    avg.multiplyScalar(1 / n);
    c.pos.set(1.2, avg.y + 6.3, avg.z + 12.2); c.look.set(0.1, avg.y + 0.5, avg.z - 4.0); c.fov = 52;
  } else if (t < 10.7) {
    c.shot = 4;
    const u = prog(t, 8.75, 10.3, ease.out); const up = prog(t, 10.3, 10.7, ease.inOut);
    c.pos.set(lerp(9.6, 9.0, u), lerp(2.6, 2.9, u) + 0.8 * up, lerp(-18.2, -18.9, u));
    const follow = prog(t, 8.75, 9.25, ease.inOut);   // short pan that follows Nodo's jump into the shot
    c.look.set(lerp(-0.2, 2.4, follow), lerp(2.7, 2.9, u) + 1.6 * up, lerp(-23.6, -25.6, follow)); c.fov = 52;
  } else {
    c.shot = 5;
    const u = prog(t, 12.2, 14.4, ease.inOut);
    c.pos.set(lerp(-1.2, -5.0, u), lerp(2.7, 13.0, u), lerp(PB_Z - 7.6, PB_Z - 13.0, u));
    c.look.set(lerp(0.6, 0.4, u), lerp(2.0, 0.0, u), lerp(PB_Z + 3.5, -20.5, u)); c.fov = lerp(50, 56, u);
    c.pos.x += 0.15 * Math.sin((t - 14.3) * 0.8) * prog(t, 14.0, 15);
  }
  // subtle deterministic handheld drift
  c.pos.x += 0.03 * noise1(t * 0.9, c.shot); c.pos.y += 0.025 * noise1(t * 0.8, c.shot + 9);
  return c;
}

// ------------------------------------------------------------------ captions / overlay
const css = (el, s) => Object.assign(el.style, s);
const capBox = document.createElement('div'); overlay.appendChild(capBox);
css(capBox, { position: 'absolute', left: '70px', width: '940px', top: '250px', display: 'flex', justifyContent: 'center' });
const capCard = document.createElement('div'); capBox.appendChild(capCard);
css(capCard, { background: 'rgba(5,7,38,0.80)', borderRadius: '30px', padding: '26px 38px 30px', boxShadow: '0 10px 40px rgba(0,0,0,0.35)', border: '3px solid rgba(124,63,218,0.55)',
  font: '700 64px "Space Grotesk"', lineHeight: '1.13', color: '#f4f6ff', textAlign: 'center', letterSpacing: '-0.01em' });
const styleTag = document.createElement('style');
styleTag.textContent = `#overlay b{color:${PAL.cyan};font-weight:700} #overlay i{color:#ff6fa8;font-style:normal}`;
document.head.appendChild(styleTag);
const series = document.createElement('div'); overlay.appendChild(series);
css(series, { position: 'absolute', left: '70px', top: '176px', font: '700 30px "Space Grotesk"', letterSpacing: '0.12em', color: '#07092a', background: PAL.cyan, padding: '8px 18px 8px', borderRadius: '14px' });
series.textContent = TL.series.text;
const foot = document.createElement('div'); overlay.appendChild(foot);
css(foot, { position: 'absolute', left: '0px', width: W + 'px', top: '480px', display: 'flex', justifyContent: 'center' });
const footPill = document.createElement('div'); foot.appendChild(footPill);
css(footPill, { font: '500 29px Inter', lineHeight: '1.25', color: 'rgba(236,238,255,0.95)', textAlign: 'center', background: 'rgba(5,7,38,0.72)', borderRadius: '16px', padding: '9px 20px 10px', maxWidth: '900px' });
footPill.innerHTML = '<span style="color:#ff6fa8;font-weight:700">Simplified diagram.</span> ' + TL.footnote.text.replace('Simplified diagram. ', '');
const sig = document.createElement('div'); overlay.appendChild(sig);
css(sig, { position: 'absolute', right: '70px', top: '1512px', display: 'flex', alignItems: 'center', gap: '12px', font: '700 30px "Space Grotesk"', color: 'rgba(244,246,255,0.92)' });
sig.innerHTML = `<img src="../../../assets/icon.png" style="width:44px;height:44px;border-radius:11px"> ${TL.signature.text}`;
const tagCallout = document.createElement('div'); overlay.appendChild(tagCallout);
css(tagCallout, { position: 'absolute', font: '700 46px "Space Grotesk"', color: '#07092a', background: '#ff6fa8', padding: '10px 22px', borderRadius: '18px', whiteSpace: 'nowrap' });
tagCallout.textContent = 'address label ↘';
const flash = document.createElement('div'); overlay.appendChild(flash);
css(flash, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', background: '#2addfa', opacity: 0 });

function fadeInOut(t, a, b, fi = 0.18, fo = 0.14) { return clamp((t - a) / fi) * clamp((b - t) / fo); }
let lastCap = -1;
function updateOverlay(t) {
  let ci = -1; for (let i = 0; i < TL.captions.length; i++) if (t >= TL.captions[i].in && t < TL.captions[i].out) ci = i;
  if (ci !== lastCap) { lastCap = ci; if (ci >= 0) { capCard.innerHTML = TL.captions[ci].html; capCard.style.fontSize = TL.captions[ci].big ? '82px' : '64px'; } }
  if (ci >= 0) {
    const c = TL.captions[ci]; const o = fadeInOut(t, c.in, c.out, 0.16, 0.1);
    capBox.style.opacity = o; capBox.style.transform = `translateY(${(1 - ease.out(clamp((t - c.in) / 0.2))) * 26}px) scale(${c.big ? 1 + 0.04 * ease.outBack(clamp((t - c.in) / 0.35)) - 0.04 : 1})`;
  } else capBox.style.opacity = 0;
  capBox.style.top = t >= 12.15 ? '230px' : '250px';
  series.style.opacity = fadeInOut(t, TL.series.in, TL.series.out, 0.01, 0.2);
  foot.style.opacity = fadeInOut(t, TL.footnote.in, TL.footnote.out, 0.3, 0.01);
  foot.style.top = (parseFloat(capBox.style.top) + capCard.offsetHeight + 16) + 'px';
  sig.style.opacity = 0.9 * fadeInOut(t, TL.signature.in, TL.signature.out, 0.4, 0.01);
  // address-label callout during the inspection close-up, anchored to the packet tag
  const co = fadeInOut(t, 5.05, 6.1, 0.15, 0.12);
  tagCallout.style.opacity = co;
  if (co > 0) {
    const p = packets[0].grp.position.clone().add(new THREE.Vector3(-0.36, 0.3, 0)).project(camera);
    const px = clamp((p.x * 0.5 + 0.5) * W - 330, 50, W - 420), py = clamp((-p.y * 0.5 + 0.5) * H - 140, 560, 1380);
    tagCallout.style.left = `${px}px`; tagCallout.style.top = `${py}px`;
    tagCallout.style.transform = `scale(${0.85 + 0.15 * ease.outBack(clamp((t - 5.05) / 0.25))})`;
  }
  // brief cyan flash on hard cuts
  let f = 0; for (const c of [2.65, 6.32, 8.75, 10.7]) if (t >= c && t < c + 0.1) f = Math.max(f, 1 - (t - c) / 0.1);
  flash.style.opacity = 0.18 * f;
}

// ------------------------------------------------------------------ per-frame update
const BLINKS = [0.62, 2.05, 4.95, 7.2, 9.3, 12.15, 14.2];
function narrationActive(t) { return TL.narration.some((l) => t >= l.start - 0.05 && t <= l.start + (l.dur || 3)); }

function buildRoute() {
  const pts = []; for (let k = 0; k <= 480; k++) { const t = 6.32 + (11.15 - 6.32) * k / 480; pts.push(packetState(0, t).pos.clone()); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 900, 0.035, 6, false);
  const mat = new THREE.MeshBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0.75, depthWrite: false });
  mat.userData.outlineParameters = { visible: false };
  routeTube = new THREE.Mesh(geo, mat); routeCount = geo.index.count; scene.add(routeTube);
}
buildRoute();

function update(t) {
  riseNetwork(t);
  // phones
  phoneA.screenMat.map = t < 3.62 ? phoneA.states[0] : phoneA.states[1];
  phoneB.screenMat.map = t < 11.55 ? phoneB.states[0] : phoneB.states[1];
  const press = pulse(t, 3.5, 3.78);
  phoneA.btn.scale.set(1 + 0.1 * press, 1 - 0.55 * press, 1 + 0.1 * press); phoneA.btn.position.y = 0.06 - 0.03 * press;

  // bubble A (sent message lifting off)
  const bA = t >= 3.62 && t < 4.17; bubbleA.grp.visible = bA;
  if (bA) { bubbleA.grp.position.copy(bubbleAPos(t)); const s = ease.outBack(clamp((t - 3.62) / 0.2)) * (1 - prog(t, 4.1, 4.17, ease.in) * 0.8); bubbleA.grp.scale.setScalar(Math.max(0.01, s));
    bubbleA.grp.rotation.set(-0.15, 0.25 + 0.15 * Math.sin(t * 9), 0.08 * wobble(t, 3.62, 3, 4)); }

  // packets
  for (const p of packets) {
    const s = packetState(p.idx, t);
    p.grp.visible = s.visible; p.grp.position.copy(s.pos);
    p.grp.scale.setScalar(Math.max(0.001, s.scale));
    p.grp.rotation.set(0.12 * Math.sin(t * 2 + p.idx), (p.idx === 0 && t < 6.32 ? nodoState(t).rotY : -0.5) + s.spin, 0.1 * Math.sin(t * 1.7 + p.idx));
    p.tagMat.map = s.tag === 'b' ? p.tags.b : p.tags.a;
    p.glow.material.opacity = (t > 4.4 && t < 6.32 ? 0.22 : 0.45) + 0.2 * Math.sin(t * 8 + p.idx);
    p.trail.forEach((tr, k) => { const ps = packetState(p.idx, t - 0.025 * (k + 1)); tr.position.copy(ps.pos); tr.visible = s.visible && ps.moving && t > 6.32; tr.material.opacity = 0.5 * (1 - k / p.trail.length); });
  }

  // route trail reveal (grows with the lead packet; stays for the final reveal)
  const lead = clamp((t - 6.32) / (11.15 - 6.32));
  routeTube.geometry.setDrawRange(0, Math.floor(routeCount * lead / 3) * 3);
  routeTube.material.opacity = t > 12.2 ? 0.75 + 0.25 * Math.sin((t - 12.2) * 5) * 0.5 : 0.7;

  // routers / wifi activity
  const hits = [['wifi', 6.85], ['r1', 7.35], ['r2', 7.85], ['r3', 8.35], ['r4', 10.75]];
  hits.forEach(([k, at], i) => {
    let a = 0; for (const d of DELAY) a = Math.max(a, pulse(t, at + d - 0.06, at + d + 0.22));
    const fin = pulse(t, 12.45 + i * 0.2 - 0.05, 12.45 + i * 0.2 + 0.35);
    if (k === 'wifi') { wifi.waves.forEach((w, j) => { w.material.opacity = 0.9 * pulse(t, at - 0.15 + j * 0.06, at + 0.35 + j * 0.06) + 0.25 * Math.max(0, Math.sin(t * 4 - j)) * (t < 6.0 ? 1 : 0.3); }); wifi.leds.forEach((l, j) => { l.visible = Math.sin(t * 13 + j * 2.1) > -0.2 || a > 0; }); }
    else { const r = routers[i - 1]; let ph = 0; for (const d of DELAY) { const x = (t - (at + d - 0.08)) / 0.32; if (x >= 0 && x <= 1) ph = x; } r.scan.position.y = 1.75 + 1.0 * ph; r.scan.scale.setScalar(1 - 0.25 * ph); r.scanMat.opacity = 0.95 * a; r.glow.material.opacity = 0.7 * Math.max(a, fin); r.ring.scale.setScalar(1 + 0.15 * Math.max(a, fin)); }
    const b = badges[i]; const shown = clamp((t - at) / 0.2);
    b.material.opacity = t < at ? 0 : 1; const pop = ease.outBack(shown) * (1 + 0.35 * fin);
    b.scale.set(0.032 * pop, 0.032 * pop, 1);
  });
  // server activity
  server.leds.forEach((l, j) => { l.visible = Math.sin(t * (9 + (j % 5)) + j * 1.7) > (t > 9 && t < 10.4 ? -0.5 : 0.2); });
  let stampDown = 0; for (const d of DELAY) stampDown = Math.max(stampDown, pulse(t, 9.42 + d, 9.6 + d));
  server.stamp.position.y = 2.6 - 0.62 * stampDown;

  // straight-line beam: draws on, shatters on "Nope", returns as a ghost in the final reveal
  const draw = prog(t, 0.25, 1.35, ease.out);
  beam.dashes.forEach((d, k) => {
    const u = d.userData.u; const r = (n) => { const s = Math.sin(k * 91.7 + n * 13.1) * 43758.5; return s - Math.floor(s); };
    if (t < 2.95) { d.visible = u <= draw; d.position.copy(d.userData.base); d.quaternion.copy(d.userData.q); d.material.opacity = 0.95; d.material.color.set('#ffd1ec'); d.scale.setScalar(1); }
    else if (t < 12.3) {
      const x = t - 2.95 - u * 0.25; d.visible = x < 0.9;
      if (x < 0) { d.position.copy(d.userData.base); d.material.opacity = 0.95; }
      else { d.position.copy(d.userData.base); d.position.y -= 9 * x * x; d.position.x += (r(1) - 0.5) * 2 * x; d.rotation.set(r(2) * 9 * x, r(3) * 9 * x, 0); d.material.opacity = 1 - x / 0.9; }
    } else { d.visible = true; d.position.copy(d.userData.base); d.quaternion.copy(d.userData.q); d.material.color.set('#ff6fa8'); d.material.opacity = 0.45 * prog(t, 12.3, 12.7) * (u <= prog(t, 12.3, 12.9) ? 1 : 0); d.scale.setScalar(0.85); }
  });
  const apex = beam.curve.getPointAt(0.74);
  cross.position.copy(apex); cross.visible = t > 12.55; const cs = ease.outBack(prog(t, 12.55, 12.8, ease.linear)); cross.scale.set(0.062 * cs, 0.062 * cs, 1);

  // labels visibility per shot
  const lab = (s, on) => { s.material.opacity = on; s.visible = on > 0.01; s.scale.set(s.userData.h * s.userData.aspect, s.userData.h, 1); };
  lab(labels.you, fadeInOut(t, 0.5, 2.62, 0.25, 0.01));
  lab(labels.friend, fadeInOut(t, 0.9, 2.62, 0.25, 0.01));
  lab(labels.wifi, fadeInOut(t, 6.55, 7.2, 0.15, 0.15));
  lab(labels.routers, fadeInOut(t, 7.2, 8.1, 0.15, 0.15));
  lab(labels.server, fadeInOut(t, 9.2, 10.7, 0.2, 0.01) + fadeInOut(t, 14.0, 15, 0.3, 0.01) * 0.95);
  if (t > 12) labels.server.position.set(2.0, 7.6, -26.0); else labels.server.position.set(3.0, 4.3, -24.0);
  lab(labels.friend2, fadeInOut(t, 11.0, 12.3, 0.2, 0.2));

  // bubble B: the received message pops up above the friend's phone and stays readable
  const bB = t >= 11.5; bubbleB.grp.visible = bB;
  if (bB) {
    const s = ease.outBack(clamp((t - 11.5) / 0.3));
    bubbleB.grp.position.set(0.95, 2.05 + 0.3 * s + 0.05 * Math.sin(t * 2.4), PB_Z + 0.5);
    bubbleB.grp.scale.setScalar(Math.max(0.01, s) * 1.15);
    const c = camAt(t); bubbleB.grp.lookAt(c.pos.x, bubbleB.grp.position.y + (c.pos.y - bubbleB.grp.position.y) * 0.6, c.pos.z);
  }

  // Nodo
  const st = nodoState(t); const pose = poseAt(t);
  const env = MOUTH ? (MOUTH[Math.min(MOUTH.length - 1, Math.round(t * FPS))] || 0) : 0;
  pose.mouth = Math.max(pose.mouth * (env > 0.05 ? 0.4 : 1), env * 0.95);
  pose.headX += env * 0.06;
  for (const bt of BLINKS) { const b = pulse(t, bt, bt + 0.14); pose.eyeL *= 1 - 0.95 * b; pose.eyeR *= 1 - 0.95 * b; }
  if (!st.airborne) pose.bob += 0.012 * Math.sin(t * 2 * Math.PI * 0.75);
  // "Nope" head shake + finger wag
  if (t > 2.75 && t < 3.35) { const x = t - 2.78; const e = Math.exp(-3 * Math.max(0, x)); pose.headY += 0.32 * Math.sin(2 * Math.PI * 4.2 * x) * e * (x > 0 ? 1 : 0); pose.wrR += 0.5 * Math.sin(2 * Math.PI * 4.2 * x + 1) * e; pose.shRy += 0.2 * Math.sin(2 * Math.PI * 4.2 * x + 1) * e; }
  // surfing dynamics: crouch on each landing, arm windmill
  if (t > 6.5 && t < 8.55) {
    let land = 0; for (const [, arr] of ROUTE.slice(0, 4)) land = Math.max(land, pulse(t, arr - 0.02, arr + 0.2));
    pose.bob -= 0.1 * land; pose.knL += 0.4 * land; pose.knR += 0.4 * land; pose.squash += 0.25 * land;
    pose.shLz += 0.25 * Math.sin(t * 9); pose.shRz += 0.25 * Math.sin(t * 9 + 1.5); pose.antenna += 0.4 * Math.sin(t * 11);
  }
  // walk steps toward the cutaway
  if (st.extra.walk) { pose.hipLx += 0.45 * st.extra.walk; pose.hipRx -= 0.45 * st.extra.walk; pose.knL += 0.3 * Math.max(0, -st.extra.walk); pose.knR += 0.3 * Math.max(0, st.extra.walk); pose.shLx -= 0.3 * st.extra.walk; pose.shRx += 0.3 * st.extra.walk; }
  if (st.extra.tumble) pose.pitch += st.extra.tumble;
  // dazed head wobble after landing
  if (t > 11.68 && t < 12.2) { pose.headZ += 0.18 * Math.sin((t - 11.68) * 14) * Math.exp(-(t - 11.68) * 3); pose.squash += 0.5 * pulse(t, 11.66, 11.82); }
  // landing squash at the server forecourt
  pose.squash += 0.4 * pulse(t, 9.0, 9.18);
  pose.antenna += 0.5 * wobble(t, 9.02, 3, 5) + 0.4 * wobble(t, 3.55, 3, 6) + 0.5 * wobble(t, 11.68, 3, 5) + 0.3 * wobble(t, 13.6, 2.5, 5);
  nodo.apply(pose);
  nodo.root.position.copy(st.pos); nodo.root.rotation.y = st.rotY;
  // shadow
  const onPhone = (Math.abs(st.pos.x) < 1.5 && Math.abs(st.pos.z - 0) < 2.8) || (Math.abs(st.pos.x) < 1.5 && Math.abs(st.pos.z - PB_Z) < 2.8);
  const ground = onPhone ? 0.335 : 0.012;
  blob.visible = st.pos.y - ground < 1.2 && !(t > 6.32 && t < 8.55);
  blob.position.set(st.pos.x, ground + 0.004, st.pos.z); const hgt = clamp((st.pos.y - ground) / 1.2); blob.material.opacity = 0.5 * (1 - hgt); blob.scale.setScalar(1 - 0.4 * hgt);

  // tether cable from Nodo's hand to packet 3 (10.32 -> 11.45)
  if (cableMesh) { scene.remove(cableMesh); cableMesh.geometry.dispose(); cableMesh = null; }
  if (t > 10.32 && t < 11.47) {
    nodo.root.updateMatrixWorld(true);
    const hand = new THREE.Vector3(); nodo.armL.wr.getWorldPosition(hand);
    const tgt = packetState(2, t).pos.clone();
    const shoot = prog(t, 10.32, 10.44, ease.out);
    const end = new THREE.Vector3().lerpVectors(hand, tgt, shoot);
    const mid = hand.clone().lerp(end, 0.5); mid.y -= 0.25 * (1 - prog(t, 10.44, 10.6));
    const curve = new THREE.QuadraticBezierCurve3(hand, mid, end);
    cableMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.028, 6, false), cableMat); scene.add(cableMesh);
  }
  // camera
  const c = camAt(t);
  camera.position.copy(c.pos); camera.fov = c.fov; camera.updateProjectionMatrix(); camera.lookAt(c.look);
  scene.fog.near = c.shot === 5 ? 30 : 22; scene.fog.far = c.shot === 5 ? 95 : 70;
  updateOverlay(t);
}

TL.narration.forEach((l) => { l.dur = l.dur || 3; });
try { const lines = await (await fetch('./data/lines.json')).json(); TL.narration.forEach((l) => { const m = lines.find((x) => x.id === l.id); if (m) l.dur = m.duration; }); } catch {}

// QA hook: on-screen bounds of every visible text element (DOM overlay + constant-size 3D label sprites)
window.__textBounds = () => {
  const out = [];
  const dom = { caption: capCard, footnote: footPill, series, signature: sig, callout: tagCallout };
  for (const [name, el] of Object.entries(dom)) {
    let o = 1, e = el; while (e && e !== overlay) { o *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
    if (o > 0.02) { const r = el.getBoundingClientRect(); out.push({ name, x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom), opacity: +o.toFixed(2) }); }
  }
  const pxPerUnit = H / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  for (const [name, sp] of Object.entries(labels)) {
    if (!sp.visible || sp.material.opacity < 0.02) continue;
    const p = sp.position.clone().project(camera); if (p.z > 1) continue;
    const cx = (p.x * 0.5 + 0.5) * W, cy = (-p.y * 0.5 + 0.5) * H, hw = sp.scale.x * pxPerUnit / 2, hh = sp.scale.y * pxPerUnit / 2;
    out.push({ name: 'label:' + name, x0: Math.round(cx - hw), y0: Math.round(cy - hh), x1: Math.round(cx + hw), y1: Math.round(cy + hh), opacity: +sp.material.opacity.toFixed(2) });
  }
  return out;
};
window.renderFrame = (f) => { const t = f / FPS; update(t); effect.render(scene, camera); return t; };
window.__ready = true;
