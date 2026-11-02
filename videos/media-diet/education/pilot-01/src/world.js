// Stage, devices and network props for pilot 01 (all original, built from three.js primitives + canvas textures).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PAL } from './palette.js';
import { canvasTexture, roundRect, radialGlowTexture } from './util.js';

const noOutline = (m) => { m.userData.outlineParameters = { visible: false }; return m; };
const basic = (color, extra = {}) => noOutline(new THREE.MeshBasicMaterial({ color, ...extra }));

// ---------- environment ----------
export function makeEnvironment(scene) {
  const bg = canvasTexture(8, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#05082a'); gr.addColorStop(0.42, '#140f4a'); gr.addColorStop(0.62, '#1d1458'); gr.addColorStop(1, '#03051c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  scene.background = bg;
  scene.fog = new THREE.Fog('#100c40', 22, 70);

  const gridTex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#060a2c'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(42,221,250,0.20)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
    g.strokeStyle = 'rgba(124,63,218,0.22)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  });
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(60, 60);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), basic('#ffffff', { map: gridTex }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -20); scene.add(floor);

  // floating dust motes (deterministic placement)
  const N = 500, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = (k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
    pos[i * 3] = (r(1) - 0.5) * 40; pos[i * 3 + 1] = 0.5 + r(2) * 14; pos[i * 3 + 2] = 8 - r(3) * 62;
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#8f7bff', size: 0.06, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);
  return { floor, dust };
}

// ---------- labels ----------
export function makeLabel(text, opts = {}) {
  const fs = opts.fontSize || 64, padX = 34;
  const meas = document.createElement('canvas').getContext('2d');
  meas.font = `700 ${fs}px "Space Grotesk"`;
  const tw = Math.ceil(meas.measureText(text).width);
  const W = tw + padX * 2, H = Math.round(fs * 1.6);
  const tex = canvasTexture(W, H, (g) => {
    roundRect(g, 3, 3, W - 6, H - 6, H / 2 - 3);
    g.fillStyle = opts.bg || 'rgba(7,9,42,0.92)'; g.fill();
    g.lineWidth = 5; g.strokeStyle = opts.border || PAL.cyan; g.stroke();
    g.font = `700 ${fs}px "Space Grotesk"`; g.fillStyle = opts.color || '#f4f6ff'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.fillText(text, W / 2, H / 2 + 2);
  });
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: opts.depthTest ?? true, fog: false });
  const s = new THREE.Sprite(mat);
  const h = opts.height || 0.42; s.scale.set(h * W / H, h, 1);
  s.renderOrder = 10;
  return s;
}

export function makeBadge(n) {
  const tex = canvasTexture(128, 128, (g) => {
    g.beginPath(); g.arc(64, 64, 58, 0, Math.PI * 2); g.fillStyle = '#07092a'; g.fill();
    g.lineWidth = 8; g.strokeStyle = PAL.cyan; g.stroke();
    g.font = '700 70px "Space Grotesk"'; g.fillStyle = '#f4f6ff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 68);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, fog: false }));
  s.scale.set(0.62, 0.62, 1); s.renderOrder = 11;
  return s;
}

// ---------- phone ----------
function drawChat(g, W, H, state) {
  // Generic illustrative chat screen (NOT Media Diet UI, not any real app).
  g.fillStyle = '#0a0d36'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#151a55'; g.fillRect(0, 0, W, 190);
  g.beginPath(); g.arc(110, 108, 52, 0, Math.PI * 2); g.fillStyle = state.avatar || PAL.violetLight; g.fill();
  g.font = '700 58px "Space Grotesk"'; g.fillStyle = '#f4f6ff'; g.textBaseline = 'middle'; g.fillText(state.name, 190, 108);
  const bubble = (x, y, text, mine) => {
    g.font = '600 52px Inter'; const tw = g.measureText(text).width; const bw = tw + 70, bh = 104;
    const bx = mine ? W - 50 - bw : 50;
    roundRect(g, bx, y, bw, bh, 40); g.fillStyle = mine ? PAL.violet : '#2a2f72'; g.fill();
    g.fillStyle = '#f4f6ff'; g.fillText(text, bx + 35, y + bh / 2 + 2);
  };
  let y = 260;
  for (const b of state.bubbles) { bubble(0, y, b.text, b.mine); y += 140; }
  // input bar
  roundRect(g, 40, H - 190, W - 80, 130, 65); g.fillStyle = '#1b2066'; g.fill();
  if (state.input) { g.font = '600 52px Inter'; g.fillStyle = '#f4f6ff'; g.fillText(state.input, 90, H - 125); }
  else { g.font = '500 48px Inter'; g.fillStyle = 'rgba(244,246,255,0.35)'; g.fillText('Message', 90, H - 125); }
}

export function makePhone(toon, opts) {
  const grp = new THREE.Group();
  const W = 3.0, D = 5.6, T = 0.32;
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, T, D, 4, 0.22), toon('#1b1f5e'));
  body.position.y = T / 2; grp.add(body);
  const rim = new THREE.Mesh(new RoundedBoxGeometry(W + 0.06, 0.08, D + 0.06, 3, 0.04), toon(PAL.violet));
  rim.position.y = T - 0.03; grp.add(rim);
  const states = opts.states.map((st) => canvasTexture(1024, 2048, (g, w, h) => drawChat(g, w, h, st)));
  const screenMat = basic('#ffffff', { map: states[0], fog: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.28, D - 0.3), screenMat);
  screen.rotation.x = -Math.PI / 2; screen.position.y = T + 0.012; grp.add(screen);
  // screen glow halo (visible from far away)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialGlowTexture('#6a5cff'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  halo.scale.set(9, 9, 1); halo.position.y = 0.5; grp.add(halo);
  // 3D send button at the right end of the input bar (local coords: +z is the phone's bottom edge)
  const send = new THREE.Group();
  const sendX = W / 2 - 0.62, sendZ = D / 2 - 0.62;
  send.position.set(sendX, T, sendZ);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.12, 32), toon(PAL.cyan));
  btn.position.y = 0.06; send.add(btn);
  const arrowTex = canvasTexture(128, 128, (g) => {
    g.fillStyle = '#07092a'; g.beginPath(); g.moveTo(40, 30); g.lineTo(100, 64); g.lineTo(40, 98); g.lineTo(52, 64); g.closePath(); g.fill();
  });
  const arrow = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), basic('#ffffff', { map: arrowTex, transparent: true }));
  arrow.rotation.x = -Math.PI / 2; arrow.rotation.z = Math.PI / 2; arrow.position.y = 0.125; send.add(arrow);
  grp.add(send);
  if (opts.flip) grp.rotation.y = Math.PI;
  return { grp, screen, screenMat, states, send, btn, halo, sendLocal: new THREE.Vector3(sendX, T, sendZ), inputLocal: new THREE.Vector3(-0.35, T + 0.05, sendZ) };
}

// ---------- Wi-Fi router ----------
export function makeWifiRouter(toon) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.5, 1.1, 4, 0.14), toon('#1b1f5e')); body.position.y = 0.25; grp.add(body);
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.08, 1.0, 3, 0.03), toon(PAL.violet)); top.position.y = 0.5; grp.add(top);
  const leds = [];
  for (let i = 0; i < 4; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), basic(PAL.cyan)); l.position.set(-0.45 + i * 0.3, 0.27, 0.56); grp.add(l); leds.push(l);
  }
  for (const [x, rz] of [[-0.65, 0.25], [0, 0], [0.65, -0.25]]) {
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.75, 6, 10), toon(PAL.navyMid)); a.position.set(x, 0.85, -0.38); a.rotation.z = rz; grp.add(a);
  }
  // Wi-Fi waves
  const waves = [];
  for (let i = 0; i < 3; i++) {
    const m = basic(PAL.cyan, { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const w = new THREE.Mesh(new THREE.TorusGeometry(0.35 + i * 0.28, 0.035, 6, 30, Math.PI * 0.5), m);
    w.position.set(0, 1.35, -0.38); w.rotation.z = Math.PI * 0.25; grp.add(w); waves.push(w);
  }
  return { grp, leds, waves, nodeLocal: new THREE.Vector3(0, 0.88, 0.1) };
}

// ---------- internet router node ----------
export function makeRouter(toon) {
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.24, 32), toon('#141a52')); base.position.y = 0.12; grp.add(base);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.35, 24), toon(PAL.deepBlue)); col.position.y = 0.9; grp.add(col);
  for (const y of [0.55, 1.05]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.04, 8, 30), toon(PAL.violet)); band.rotation.x = Math.PI / 2; band.position.y = y; grp.add(band);
  }
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.62, 0.16, 32), toon(PAL.violetLight)); pad.position.y = 1.65; grp.add(pad);
  const ringMat = basic(PAL.cyan, { transparent: true, opacity: 0.9 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.05, 8, 40), ringMat); ring.rotation.x = Math.PI / 2; ring.position.y = 1.74; grp.add(ring);
  // address-reading scan column (lights up as a packet passes)
  const scanMat = basic(PAL.magenta, { transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const scan = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 8, 36), scanMat); scan.rotation.x = Math.PI / 2; scan.position.y = 1.75; grp.add(scan);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialGlowTexture(PAL.cyan), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(3, 3, 1); glow.position.y = 1.9; grp.add(glow);
  return { grp, ring, ringMat, scan, scanMat, glow, nodeLocal: new THREE.Vector3(0, 2.05, 0) };
}

// ---------- app server tower (cutaway on +x side) ----------
export function makeServer(toon) {
  const grp = new THREE.Group();
  const Wd = 2.8, Ht = 6.0, Dp = 3.0, th = 0.18;
  const wallMat = toon('#1b1f5e'), trim = toon(PAL.violet), cut = toon(PAL.magenta);
  const box = (w, h, d, x, y, z, m = wallMat) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); grp.add(b); return b; };
  box(Wd, Ht, th, 0, Ht / 2, -Dp / 2);                 // back wall
  box(th, Ht, Dp, -Wd / 2, Ht / 2, 0);                 // left wall (-x)
  // front wall with a slot opening at y 1.05..1.75
  const slotY0 = 1.0, slotY1 = 1.8, slotW = 0.95;
  box(Wd, slotY0, th, 0, slotY0 / 2, Dp / 2);
  box(Wd, Ht - slotY1, th, 0, slotY1 + (Ht - slotY1) / 2, Dp / 2);
  box((Wd - slotW) / 2, slotY1 - slotY0, th, -(Wd + slotW) / 4, (slotY0 + slotY1) / 2, Dp / 2);
  box((Wd - slotW) / 2, slotY1 - slotY0, th, (Wd + slotW) / 4, (slotY0 + slotY1) / 2, Dp / 2);
  box(Wd + 0.1, 0.22, Dp + 0.1, 0, Ht + 0.11, 0, trim);   // roof
  box(Wd, 0.1, Dp, 0, 0.05, 0, toon('#10143f'));           // floor
  // cutaway edge highlights (+x side) — magenta "cut" faces
  box(0.06, Ht, 0.22, Wd / 2, Ht / 2, Dp / 2 - 0.02, cut);
  box(0.06, Ht, 0.22, Wd / 2, Ht / 2, -Dp / 2 + 0.02, cut);
  box(0.06, 0.24, Dp, Wd / 2, Ht + 0.11, 0, cut);
  // racks inside along the left wall with blinking LEDs
  const leds = [];
  for (const y of [2.15, 3.4, 4.65]) {
    const rack = new THREE.Mesh(new RoundedBoxGeometry(0.7, 1.1, 2.5, 2, 0.05), toon('#0d1138')); rack.position.set(-0.85, y, 0); grp.add(rack);
  }
  for (let i = 0; i < 36; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.14), basic(i % 3 ? PAL.cyan : PAL.magenta));
    l.position.set(-0.49, 1.75 + (i % 9) * 0.36, -1.0 + Math.floor(i / 9) * 0.62); grp.add(l); leds.push(l);
  }
  // conveyor through the middle (front slot -> stamp -> back shaft)
  const belt = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.12, Dp - 0.2, 2, 0.04), toon('#3d44a8')); belt.position.set(0.15, 0.98, 0); grp.add(belt);
  for (let i = 0; i < 6; i++) { const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.02, 12), toon(PAL.violet)); roller.rotation.z = Math.PI / 2; roller.position.set(0.15, 0.98, -1.15 + i * 0.46); grp.add(roller); }
  // stamp arm above the belt
  const stamp = new THREE.Group(); stamp.position.set(0.15, 2.6, 0.1); grp.add(stamp);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 12), toon('#c9c4ff')); piston.position.y = 0.0; stamp.add(piston);
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.18, 0.45, 2, 0.05), toon(PAL.magenta)); head.position.y = -0.55; stamp.add(head);
  box(1.0, 0.18, 0.7, 0.15, 3.15, 0.1, toon('#2a2f72'));
  // lift shaft (glass) at the back to the roof chimney
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, Ht - 0.9, 24, 1, true), noOutline(new THREE.MeshBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false })));
  shaft.position.set(0.25, 0.9 + (Ht - 0.9) / 2, -0.95); grp.add(shaft);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.6, 24, 1, true), toon(PAL.violetLight, { mat: { side: THREE.DoubleSide } })); chimney.position.set(0.25, Ht + 0.4, -0.95); grp.add(chimney);
  const inner = new THREE.PointLight('#bfefff', 14, 9, 1.2); inner.position.set(1.0, 2.4, 0.2); grp.add(inner);
  return { grp, leds, stamp, stampHead: head, Ht, Dp, Wd,
    slotLocal: new THREE.Vector3(0.15, 1.38, Dp / 2 + 0.25), stampLocal: new THREE.Vector3(0.15, 1.38, 0.1),
    shaftBottomLocal: new THREE.Vector3(0.25, 1.38, -0.95), roofLocal: new THREE.Vector3(0.25, Ht + 0.95, -0.95) };
}

// ---------- packet ----------
export function makePacket(toon, idx) {
  const grp = new THREE.Group();
  const dataTex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = PAL.cyan; g.fillRect(0, 0, w, h);
    g.font = '700 34px "Space Grotesk"'; g.fillStyle = 'rgba(7,9,42,0.28)';
    const rows = ['0110 1001', '1011 0010', '0100 1110', '1101 0111', '0011 1010', '1000 1101'];
    rows.forEach((r, i) => g.fillText(r, 26, 44 + i * 38));
  });
  const mat = new THREE.MeshToonMaterial({ color: '#ffffff', map: dataTex, emissive: new THREE.Color(PAL.cyan), emissiveIntensity: 0.25, gradientMap: toon(PAL.cyan).gradientMap });
  const cube = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.62, 0.62, 3, 0.09), mat); grp.add(cube);
  const tagTex = (addr) => canvasTexture(512, 200, (g, w, h) => {
    roundRect(g, 4, 4, w - 8, h - 8, 30); g.fillStyle = PAL.magenta; g.fill();
    g.beginPath(); g.arc(40, h / 2, 16, 0, Math.PI * 2); g.fillStyle = '#07092a'; g.fill();
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('TO', 76, h / 2 - 34);
    g.font = '700 62px "Space Grotesk"'; g.fillText(addr, 76, h / 2 + 30);
  });
  const tags = { a: tagTex('203.0.113.7'), b: tagTex('198.51.100.24') };
  const tagMat = basic('#ffffff', { map: tags.a, transparent: true });
  for (const side of [1, -1]) {
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.227), tagMat);
    tag.position.set(0, 0.06, side * 0.318); if (side < 0) tag.rotation.y = Math.PI; grp.add(tag);
  }
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialGlowTexture(PAL.cyan), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.set(1.9, 1.9, 1); grp.add(glow);
  const trail = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialGlowTexture(PAL.cyan), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.scale.setScalar(0.9 - i * 0.08); trail.push(s);
  }
  return { grp, cube, tagMat, tags, glow, trail, idx };
}

// ---------- message bubble (3D) ----------
export function makeBubble(toon, text) {
  const grp = new THREE.Group();
  const tex = canvasTexture(640, 220, (g, w, h) => {
    roundRect(g, 6, 6, w - 12, h - 12, 80); g.fillStyle = PAL.violet; g.fill();
    g.lineWidth = 8; g.strokeStyle = '#c9b8ff'; g.stroke();
    g.font = '700 84px "Space Grotesk"'; g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
  });
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.6, 0.16, 3, 0.07), toon(PAL.violet));
  grp.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 0.59), basic('#ffffff', { map: tex, transparent: true }));
  face.position.z = 0.085; grp.add(face);
  const back = face.clone(); back.rotation.y = Math.PI; back.position.z = -0.085; grp.add(back);
  return { grp };
}

// ---------- dashed "straight line" beam ----------
export function makeDashBeam(p0, p1, height, n = 46) {
  const grp = new THREE.Group();
  const mat = basic('#ffd1ec', { transparent: true, opacity: 1, depthWrite: false });
  const dashes = [];
  const geo = new THREE.CapsuleGeometry(0.06, 0.32, 4, 8);
  const ctrl = new THREE.Vector3((p0.x + p1.x) / 2, Math.max(p0.y, p1.y) + height * 2, (p0.z + p1.z) / 2);
  const curve = new THREE.QuadraticBezierCurve3(p0.clone(), ctrl, p1.clone());
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n; const p = curve.getPointAt(u); const tgt = curve.getTangentAt(u);
    const d = new THREE.Mesh(geo, mat.clone()); d.position.copy(p);
    d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tgt);
    d.userData = { u, base: p.clone(), q: d.quaternion.clone() };
    grp.add(d); dashes.push(d);
  }
  return { grp, dashes, curve };
}
