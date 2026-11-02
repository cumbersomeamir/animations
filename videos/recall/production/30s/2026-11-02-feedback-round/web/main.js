// Entry: builds the low-poly café, person, phone, card and giant QR; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildCard, buildGiantQR, PAL } from './lowpoly.js';
import { drawCard, drawScreen, CARD } from './screen.js';
import { makeChoreo, CARD_POS, GIANT } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp, rng } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const C_INK = col('#2A2622'), C_PAPER = col('#F2EEE3'), C_ECD = col('#5E8E2A'), C_ECL = col('#D7F49A'), C_FD = col('#7FB33A'), C_FL = col('#E6F9BE'),
  C_SOCK = col('#4A3A2C'), C_GLOW = col(PAL.lime), C_STICK = col('#C9673F');

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height; S.qr = d.qr;
  await Promise.all(['600 54px Fredoka', '700 38px Fredoka'].map(f => document.fonts.load(f)));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.02, 60);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene); S.phone = buildPhone(scene);
  S.cards = { small: drawCard(S.qr, S.icon, 'small'), big: drawCard(S.qr, S.icon, 'big'), thumb: drawCard(S.qr, S.icon, 'thumb') };
  S.card = buildCard(scene, S.cards.small); S.card.group.position.set(...CARD_POS); S.card.group.rotation.y = 0.12;
  // big-logo sticker: 15x15 modules square on the person-side face
  const st = S.card.sticker; st.geometry.dispose(); st.geometry = new THREE.PlaneGeometry(15 * CARD.mod / CARD.w * S.card.W, 15 * CARD.mod / CARD.w * S.card.W);
  const sg = S.card.stickerCanvas.getContext('2d'); sg.fillStyle = '#FFFFFF'; sg.fillRect(0, 0, 256, 256);
  if (S.icon) { sg.save(); sg.beginPath(); sg.roundRect(12, 12, 232, 232, 40); sg.clip(); sg.drawImage(S.icon, 12, 12, 232, 232); sg.restore(); }
  st.material.map.needsUpdate = true; S.card.group.remove(st); scene.add(st);
  S.G = buildGiantQR(scene, S.qr, GIANT);
  for (const p of [S.G.plateSmall, S.G.plateBig]) { const tx = new THREE.CanvasTexture(S.icon); tx.colorSpace = THREE.SRGBColorSpace; p.top.material.map = tx; p.top.material.needsUpdate = true; }
  // particles (error-correction "repair" light) and lock ribbons
  const pg = new THREE.BoxGeometry(0.035, 0.035, 0.035);
  S.parts = new THREE.InstancedMesh(pg, new THREE.MeshBasicMaterial({ color: PAL.lime }), 60); S.parts.frustumCulled = false; S.G.group.add(S.parts);
  const R2 = rng(5), ecCells = S.G.cells.filter(c => c.role === 'ec'), hidden = S.G.cells.filter(c => Math.abs(c.r - 12) <= 3 && Math.abs(c.c - 12) <= 3);
  S.hidden = new Set(hidden.map(c => c.r * 25 + c.c));
  S.bigHidden = new Set(S.G.cells.filter(c => Math.abs(c.r - 12) <= 7 && Math.abs(c.c - 12) <= 7).map(c => c.r * 25 + c.c));
  S.pdef = Array.from({ length: 60 }, (_, i) => ({ from: ecCells[Math.floor(R2() * ecCells.length)], to: hidden[i % hidden.length], d: R2() * 0.5, h: 0.4 + R2() * 0.5 }));
  hidden.forEach((c, i) => { c.k = (Math.abs(c.r - 12) + Math.abs(c.c - 12)) / 6 * 0.7 + R2() * 0.3; });
  const ribbon = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 0.05), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0 })); S.G.group.add(m); return m; };
  S.ribbons = [ribbon(), ribbon()];
  S.coverSlab = new THREE.Mesh(new THREE.BoxGeometry(8.4 * S.G.cell, 0.1, 8.4 * S.G.cell), new THREE.MeshStandardMaterial({ color: C_STICK, flatShading: true, roughness: 0.7 }));
  S.coverSlab.castShadow = true; S.G.group.add(S.coverSlab);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const cellPos = (c, y = 0.06) => V(GIANT[0] + c.x, y, GIANT[2] + c.z);

function cardPoint(px, py, out = 0) {
  const face = S.card.group.children[1];
  S.card.group.updateMatrixWorld(true);
  const local = V((px / CARD.w - 0.5) * S.card.W, (0.5 - py / CARD.h) * S.card.H, 0);
  const p = face.localToWorld(local), n = face.getWorldDirection(V(0, 0, 0));
  return p.add(n.multiplyScalar(out));
}

function updateGiant(gs) {
  const G = S.G, m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), c3 = new THREE.Color();
  for (let i = 0; i < G.cells.length; i++) {
    const c = G.cells[i], idx = c.r * 25 + c.c;
    let h = c.dark ? 0.07 : 0.014, color = c.dark ? C_INK : C_PAPER, show = 1;
    if (c.role === 'ec' && gs.ec > 0) {
      const order = (c.cw - 16) / 28, on = clamp((gs.ecWave - order * 0.85) / 0.15) * gs.ec;
      c3.copy(color).lerp(c.dark ? C_ECD : C_ECL, on); color = c3.clone(); h += 0.02 * on;
    }
    if (c.role === 'finder') {
      const k = c.r < 8 && c.c < 8 ? 0 : c.r < 8 ? 1 : 2, f = gs.finder[k];
      if (f > 0) { const pul = 0.75 + 0.25 * Math.sin(gs.t * 9 + k); c3.copy(color).lerp(c.dark ? C_FD : C_FL, f * pul); color = c3.clone(); h += 0.03 * f; }
    }
    if (S.hidden.has(idx) && gs.lift > 0) {          // revealed sockets, then rebuilt tiles
      const k = clamp((gs.rebuild - c.k * 0.85) / 0.15);
      if (k <= 0) { color = C_SOCK; h = 0.004; }
      else { c3.copy(C_GLOW).lerp(c.dark ? C_INK : C_PAPER, clamp((k - 0.4) / 0.6)); color = c3.clone(); h = (c.dark ? 0.07 : 0.014) * E.back(k) + 0.03 * (1 - k); }
    }
    if (gs.covered && c.r < 8 && c.c > 16) show = 0;   // top-right marker hidden
    p.set(c.x, 0.05, c.z); sc.set(1, Math.max(0.002, h) * show + 0.0001, 1); m.compose(p, q, sc);
    G.inst.setMatrixAt(i, m); G.inst.setColorAt(i, color);
  }
  G.inst.instanceMatrix.needsUpdate = true; G.inst.instanceColor.needsUpdate = true;
  // logo plates
  const ps = G.plateSmall, pb = G.plateBig;
  ps.group.visible = !gs.big; ps.group.position.set(0, 0.07 + 0.55 * gs.lift, 0); ps.group.rotation.x = -0.25 * gs.lift;
  ps.slab.material.transparent = true; ps.slab.material.opacity = 1 - 0.55 * gs.lift; ps.top.material.transparent = true; ps.top.material.opacity = 1 - 0.45 * gs.lift;
  pb.group.visible = !!gs.big; pb.group.position.set(0, 0.07 + 1.2 * (1 - gs.bigSlam), 0);
  // particles: EC tiles -> hidden tiles (repair); in the big-logo case they bounce off and fizzle
  const pm = new THREE.Matrix4(); let n = 0;
  for (const pd of S.pdef) {
    let pos = null, s = 1;
    if (gs.particles >= 0) {
      const u = clamp((gs.particles - pd.d * 0.5) / 0.55); if (u > 0 && u < 1) {
        const a = cellPos(pd.from, 0.12).sub(V(...GIANT)), b = cellPos(pd.to, 0.12).sub(V(...GIANT));
        pos = a.lerp(b, E.io(u)); pos.y += Math.sin(Math.PI * u) * pd.h; s = 1 - 0.5 * u;
      }
    } else if (gs.bigTry >= 0) {
      const u = clamp((gs.bigTry - pd.d * 0.4) / 0.6); if (u > 0 && u < 1) {
        const a = cellPos(pd.from, 0.12).sub(V(...GIANT)), mid = a.clone().multiplyScalar(0.55);
        pos = a.lerp(mid, E.out(Math.min(1, u * 1.6))); pos.y += Math.sin(Math.PI * Math.min(1, u * 1.6)) * pd.h * 0.6 + (u > 0.62 ? -(u - 0.62) * 0.8 : 0); s = 1 - u;
      }
    }
    if (pos) { pm.compose(pos, new THREE.Quaternion(), new THREE.Vector3(s, s, s)); S.parts.setMatrixAt(n++, pm); }
  }
  for (let i = n; i < 60; i++) { pm.makeScale(0, 0, 0); S.parts.setMatrixAt(i, pm); }
  S.parts.instanceMatrix.needsUpdate = true;
  // lock ribbons TL-TR and TL-BL
  const fc = k => { const [r, c] = [[3, 3], [3, 21], [21, 3]][k]; return V((c - 12) * G.cell, 0.16, (r - 12) * G.cell); };
  const setRib = (m, a, b, op) => { const mid = a.clone().add(b).multiplyScalar(0.5); m.position.copy(mid); m.scale.set(a.distanceTo(b), 1, 1); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); m.material.opacity = op; };
  const blink = gs.covered ? 0.25 + 0.35 * Math.abs(Math.sin(gs.t * 7)) : 1;
  setRib(S.ribbons[0], fc(0), fc(1), (gs.lockLines + gs.covered) * 0.9 * blink); setRib(S.ribbons[1], fc(0), fc(2), (gs.lockLines + gs.covered) * 0.9 * blink);
  S.coverSlab.visible = !!gs.covered; S.coverSlab.position.set((21 - 12) * G.cell, 0.1, (3 - 12) * G.cell);
}

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t);
  const W = { cardPoint };
  // person + phone
  const q = ch.person(t, W);
  S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  const scr = ch.screen(t);
  // the phone rests on the palm and faces the eyes, so the hand sits behind the screen
  const arm = S.person.arms[1], wrist = arm.hand.getWorldPosition(V(0, 0, 0)), elbow = arm.el.getWorldPosition(V(0, 0, 0));
  const fdir = wrist.clone().sub(elbow).normalize(), palmC = wrist.clone().add(fdir.clone().multiplyScalar(0.04));
  const toHead = head.clone().sub(palmC).normalize();
  const phonePos = palmC.clone().add(toHead.multiplyScalar(0.03)).add(fdir.multiplyScalar(0.035));
  S.phone.group.position.copy(phonePos); S.phone.group.lookAt(head); S.phone.group.rotateZ(scr.rot);
  S.phone.group.rotateX(0.18 * (1 - q.phoneUp));
  const phoneN = V(0, 0, 1).applyQuaternion(S.phone.group.quaternion);
  // insert shots: the forearm would sit between the eye-line camera and the screen, so the phone arm is hidden
  // (the phone has its own gripping fingers); everywhere else the full arm is visible
  const insert = shot.id.startsWith('phone_');
  S.person.root.visible = !insert;   // POV insert: the camera is at the person's eye line
  drawScreen(S.phone, S.qr, { ...scr, card: S.cards[scr.variant], rot: -scr.rot, text: S.qr.text });
  // coffee cup in hand during the sip
  if (q.cupInHand) { S.cafe.coffee.position.copy(S.person.arms[0].hand.localToWorld(V(0, -0.06, 0.03))).add(V(0, -0.05, 0)); }
  else S.cafe.coffee.position.set(-0.45, 0.95, -0.05);
  // sticker: flies in with the slap, comes off with the peel
  const C = ch.cues, st = S.card.sticker;
  const onCard = cardPoint(300, 515, 0.002), handL = S.person.arms[0].hand.localToWorld(V(0, -0.05, 0.02));
  st.visible = t > C.slap - 0.3 && t < C.peel + 0.5;
  if (st.visible) {
    const face = S.card.group.children[1];
    st.quaternion.copy(face.getWorldQuaternion(new THREE.Quaternion()));
    if (t < C.slap) st.position.copy(handL.clone().lerp(onCard, seg(t, C.slap - 0.3, C.slap, E.in)));
    else if (t < C.peel) st.position.copy(onCard);
    else { st.position.copy(onCard.clone().lerp(handL, seg(t, C.peel, C.peel + 0.25, E.out))); st.rotateX(-0.6 * seg(t, C.peel, C.peel + 0.4)); }
    st.scale.setScalar(t > C.peel + 0.25 ? 1 - seg(t, C.peel + 0.25, C.peel + 0.5) : 1);
  }
  // giant QR
  const gs = ch.giant(t); updateGiant(gs);
  // camera + key light follow the shot
  const cam = ch.camera(t, { head, phone: phonePos, phoneNormal: phoneN, cardCenter: cardPoint(300, 507, 0) });
  S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const giantShot = shot.id.startsWith('giant');
  const focus = giantShot ? V(...GIANT) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = giantShot ? 3.5 : 2.6; S.scene.fog.far = giantShot ? 11 : 8;
  // overlay anchors
  const P = {};
  if (giantShot) {
    const avg = role => { const cs = S.G.cells.filter(c => c.role === role); const v = cs.reduce((a, c) => a.add(cellPos(c)), V(0, 0, 0)).multiplyScalar(1 / cs.length); return v; };
    const ecC = avg('ec'), dataC = avg('data');
    P.ecPt = project(ecC); P.ec = project(ecC.clone().add(V(-0.25, 0.55, 0)));
    P.dataPt = project(dataC); P.data = project(dataC.clone().add(V(0.15, 0.5, 0.2)));
    P.plate = project(V(GIANT[0], 0.25, GIANT[2]));
    P.tr = project(V(GIANT[0] + 9 * S.G.cell, 0.1, GIANT[2] - 9 * S.G.cell));
    P.finderLabel = project(V(GIANT[0] - 9 * S.G.cell, 0.45, GIANT[2] - 6 * S.G.cell));
  }
  const safe = { shot: shot.id };
  if (!giantShot) safe.head = project(head).y;
  safe.phone = project(phonePos);
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t), P, S.d.timeline, S.icon, S.capCache, shot.id);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes, safe, shot: shot.id };
};
window.__cards = () => Object.fromEntries(Object.entries(S.cards).map(([k, c]) => [k, c.toDataURL('image/png')]));
window.__sheetPoses = () => [];
