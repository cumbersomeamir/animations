// Scene runtime for pilot 01. window.renderAt(t) renders the frame at time t.
import * as THREE from 'three';
import { createLab, createFacility } from './rig/lab.js';
import { createCup, createBeaker, CUP, rAt } from './rig/cup.js';
import { createTinku, DEFAULT_POSE } from './rig/tinku.js';
import { track, ease, prog, wobble, blink, clamp, lerp, pulse } from './lib/anim.js';
import * as C from './choreo.js';

const W = 1080, H = 1920;
const Q = new URLSearchParams(location.search);
const mode = Q.get('mode') || 'video';
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: Q.get('aa') !== '0', preserveDrawingBuffer: true });
renderer.setPixelRatio(parseFloat(Q.get('pr') || '1')); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = Q.get('noshadow') !== '1'; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const lab = createLab(renderer, parseInt(Q.get('shadow') || '2048', 10));
const scene = lab.scene;
const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 60);

const cup = createCup(); scene.add(cup.group);
const tinku = createTinku(); scene.add(tinku.root);
const beaker = createBeaker(); scene.add(beaker.group);
const facilities = [createFacility('yes'), createFacility('no'), createFacility('yes')];
const FAC_POS = [[-1.38, -1.95, 0.3], [0.0, -2.75, 0.0], [1.38, -1.95, -0.3]];
facilities.forEach((f, i) => { f.position.set(FAC_POS[i][0], 0, FAC_POS[i][1]); f.rotation.y = FAC_POS[i][2]; scene.add(f); });
lab.applyEnv(scene);
// dashed routes on the mat from the cup to each facility
const dashMat = new THREE.MeshBasicMaterial({ color: 0xffa04a, transparent: true, opacity: 0.85 });
const routes = FAC_POS.map(([fx, fz]) => {
  const g = new THREE.Group(); g.name = 'route'; scene.add(g);
  const a = new THREE.Vector3(0, 0.004, 0), b = new THREE.Vector3(fx, 0.004, fz + 0.12);
  const dir = b.clone().sub(a); const len = dir.length(); dir.normalize();
  const n = Math.floor((len - 0.75) / 0.14);
  for (let i = 0; i < n; i++) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.08), dashMat);
    d.rotation.x = -Math.PI / 2; d.rotation.z = Math.atan2(dir.x, dir.z) * -1 + 0;
    d.rotation.order = 'XYZ';
    const p = a.clone().addScaledVector(dir, 0.75 + i * 0.14);
    d.position.copy(p); d.lookAt(p.clone().add(new THREE.Vector3(0, 1, 0))); d.rotateZ(-Math.atan2(dir.x, -dir.z));
    g.add(d);
  }
  return g;
});

// coffee stream, drops, cut line
const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x5b3420, roughness: 0.15 });
let stream = null;
const dropA = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 14), coffeeMat); scene.add(dropA);
const dropB = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 14), coffeeMat); scene.add(dropB);
const cutMat = new THREE.MeshBasicMaterial({ color: 0xffa04a });
let cutLine = null;

// ---------- choreography evaluation ----------
const timing = await (await fetch('/audio/narration/timing.json')).json();
const LINES = timing.lines;

const rootAt = (t) => track(C.ROOT.map(([tt, x, z, yaw, e]) => [tt, [x, z, yaw], e]), t);
function worldToRig(w, t) {
  const [x, z, yaw] = rootAt(t);
  const dx = w[0] - x, dz = w[2] - z;
  const c = Math.cos(-yaw), s = Math.sin(-yaw);
  return [dx * c + dz * s, w[1], -dx * s + dz * c];
}
// Build per-parameter tracks
const keys = [...C.POSE_KEYS].sort((a, b) => a.t - b.t);
const tracks = {};
function addKey(name, t, v, e) { (tracks[name] = tracks[name] || []).push([t, v, e]); }
for (const k of keys) {
  for (const [name, v] of Object.entries(k)) {
    if (name === 't' || name === 'e') continue;
    if (name === 'handLW' || name === 'handRW') {
      const n = name === 'handLW' ? 'handL' : 'handR';
      addKey(n, k.t, worldToRig(v, k.t), k.e); addKey(n === 'handL' ? 'gripL' : 'gripR', k.t, 1, k.e);
    } else {
      addKey(name, k.t, v, k.e);
      if (name === 'handL') addKey('gripL', k.t, 0, k.e);
      if (name === 'handR') addKey('gripR', k.t, 0, k.e);
    }
  }
}
for (const n in tracks) tracks[n].sort((a, b) => a[0] - b[0]);
function poseAt(t) {
  const p = { ...DEFAULT_POSE };
  for (const n in tracks) p[n] = track(tracks[n], t);
  // idle breathing and hands that follow the body when not gripping
  const breath = Math.sin(t * 2 * Math.PI * 0.9) * 0.012;
  p.squash = (p.squash || 1) + breath;
  const follow = (g) => (1 - (g || 0)) * (p.hop || 0);
  p.handL = [p.handL[0], p.handL[1] + follow(p.gripL) + breath * 0.6, p.handL[2]];
  p.handR = [p.handR[0], p.handR[1] + follow(p.gripR) + breath * 0.6, p.handR[2]];
  return p;
}

// ---------- overlay ----------
const capEl = document.getElementById('cap');
const chipsEl = document.getElementById('chips');
const svg = document.getElementById('lines');
function markup(s) {
  const out = []; let hl = false;
  for (const tok of s.split(/(\[hl\]|\[\/hl\])/)) {
    if (tok === '[hl]') { hl = true; continue; }
    if (tok === '[/hl]') { hl = false; continue; }
    for (const w of tok.split(/(\s+)/)) if (w.length) out.push({ w, hl, space: /^\s+$/.test(w) });
  }
  return out;
}
let capKey = null, capWords = [];
function setCaption(key, html) {
  if (capKey === key) return;
  capKey = key; capEl.innerHTML = html; capWords = [...capEl.querySelectorAll('.w')];
}
function wordsHTML(s) {
  return markup(s).map((x) => x.space ? ' ' : `<span class="w${x.hl ? ' hl' : ''}">${x.w}</span>`).join('');
}
function updateCaption(t) {
  let active = null;
  for (let i = 0; i < LINES.length; i++) {
    const L = LINES[i], next = LINES[i + 1];
    const from = L.start - 0.12, to = next ? next.start - 0.12 : C.END_CARD.t;
    if (t >= from && t < to) active = { L, from, to };
  }
  if (t >= C.END_CARD.t) {
    setCaption('END', `<div class="line">${wordsHTML(C.END_CARD.main)}<span class="sub">${C.END_CARD.sub}</span></div>`);
    const lt = t - C.END_CARD.t;
    capWords.forEach((w, j) => styleWord(w, lt - j * 0.05));
    const sub = capEl.querySelector('.sub');
    const k = prog(lt, 0.35, 0.7, ease.outCubic);
    sub.style.opacity = k; sub.style.transform = `translateY(${(1 - k) * 18}px)`;
    capEl.style.opacity = 1;
    return;
  }
  if (!active) { capEl.style.opacity = 0; return; }
  const { L, to } = active;
  setCaption(L.id, `<div class="line">${wordsHTML(C.CAPTIONS[L.id])}</div>`);
  // words appear in step with the narration (proportional to character count)
  const total = capWords.reduce((a, w) => a + w.textContent.length + 1, 0);
  let acc = 0;
  capWords.forEach((w) => {
    const at = L.start - 0.08 + (acc / total) * L.duration * 0.85;
    acc += w.textContent.length + 1;
    styleWord(w, t - at);
  });
  capEl.style.opacity = 1 - prog(t, to - 0.12, to, ease.linear);
}
function styleWord(w, lt) {
  const k = clamp(lt / 0.2);
  const e = ease.outBack(k, 2.2);
  w.style.opacity = clamp(lt / 0.12);
  w.style.transform = `translateY(${(1 - e) * 26}px) scale(${0.85 + 0.15 * e})`;
}

const chipEls = {}, lineEls = {}, dotEls = {};
for (const [id, label, cls] of C.CHIPS) {
  const d = document.createElement('div'); d.className = `chip ${cls}`; d.textContent = label; chipsEl.appendChild(d); chipEls[id] = d;
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('stroke', cls === 'film' ? '#dff1f6' : cls === 'bond' ? '#ff9a3c' : '#fff3e0'); l.setAttribute('stroke-width', '4'); l.setAttribute('stroke-linecap', 'round');
  svg.appendChild(l); lineEls[id] = l;
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('r', '9'); c.setAttribute('fill', cls === 'film' ? '#dff1f6' : cls === 'bond' ? '#ff9a3c' : '#fff3e0');
  svg.appendChild(c); dotEls[id] = c;
}
const noteEls = C.NOTES.map(([text]) => { const d = document.createElement('div'); d.className = 'note'; d.textContent = text; document.getElementById('overlay').appendChild(d); return d; });

const tmpV = new THREE.Vector3();
function project(v) { tmpV.copy(v).project(camera); return [(tmpV.x * 0.5 + 0.5) * W, (-tmpV.y * 0.5 + 0.5) * H]; }

const anchors = {};
function updateChips(t) {
  for (const [id, , , tIn, tOut, anchor, dx, dy] of C.CHIPS) {
    const a = anchors[anchor];
    const kin = ease.outBack(clamp((t - tIn) / 0.28), 2.0), kout = clamp((t - (tOut - 0.2)) / 0.2);
    const vis = t >= tIn && t < tOut && a;
    const el = chipEls[id], ln = lineEls[id], dot = dotEls[id];
    if (!vis) { el.style.opacity = 0; ln.setAttribute('opacity', 0); dot.setAttribute('opacity', 0); continue; }
    const [ax, ay] = project(a);
    const cx = ax + dx, cy = ay + dy;
    const op = clamp((t - tIn) / 0.15) * (1 - kout);
    el.style.opacity = op; el.style.left = `${cx}px`; el.style.top = `${cy}px`;
    el.style.transform = `translate(-50%,-50%) scale(${0.6 + 0.4 * kin})`;
    const lk = clamp((t - tIn - 0.05) / 0.25);
    ln.setAttribute('x1', ax); ln.setAttribute('y1', ay);
    ln.setAttribute('x2', lerp(ax, cx, lk)); ln.setAttribute('y2', lerp(ay, cy, lk)); ln.setAttribute('opacity', op);
    dot.setAttribute('cx', ax); dot.setAttribute('cy', ay); dot.setAttribute('opacity', op);
  }
  C.NOTES.forEach(([, tIn, tOut, x, y], i) => {
    const el = noteEls[i];
    const op = clamp((t - tIn) / 0.25) * (1 - clamp((t - (tOut - 0.25)) / 0.25));
    el.style.opacity = t >= tIn && t < tOut ? op : 0; el.style.left = `${x}px`; el.style.top = `${y}px`;
  });
}

// ---------- per-frame update ----------
function setTiltAbout(group, px, a) {
  // rotate about z through point (px, 0, 0)
  group.rotation.z = a;
  group.position.set(px - px * Math.cos(a), -px * Math.sin(a), 0);
}

function update(t) {
  const E = C.CUP_EVENTS;
  // camera
  const ck = C.CAMERA.map(([tt, p, tg, fov, e]) => [tt, [...p, ...tg, fov], e]);
  const cv = track(ck, t);
  camera.position.set(cv[0], cv[1], cv[2]);
  camera.fov = cv[6]; camera.updateProjectionMatrix();
  camera.lookAt(cv[3], cv[4], cv[5]);
  camera.updateMatrixWorld(true); // chips project with this frame's camera

  // cup slide-in with settle wobble, tug tilt, close impact
  cup.group.position.x = track([[0, -0.85], [E.slideIn[1], 0, ease.outCubic]], t);
  const settle = wobble(t, [[E.slideIn[1], 0.05], [E.close[1], 0.025], [E.snap[0], 0.04]], 3.2, 6);
  const tug = prog(t, E.tug[0], E.tug[1], ease.inOut) * (t < E.snap[0] ? 1 : 0);
  const tiltA = settle - tug * 0.07;
  setTiltAbout(cup.tilt, tiltA >= 0 ? -(CUP.rb + CUP.paper) : (CUP.rb + CUP.paper), tiltA);

  // open/close
  let k = 0;
  if (t >= E.open[0] && t < E.close[0]) k = ease.outBack(clamp((t - E.open[0]) / (E.open[1] - E.open[0])), 1.6);
  else if (t >= E.close[0] && t < E.close[1]) k = 1 - ease.inQuad(clamp((t - E.close[0]) / (E.close[1] - E.close[0])));
  cup.setOpen(k, 0.74, 0.8, 0.3);
  cup.setGlint(pulse(t, (E.glint[0] + E.glint[1]) / 2, (E.glint[1] - E.glint[0]) / 2) * 0.9);

  // cut line along the front seam during the "dissection" stroke
  if (cutLine) { cutLine.geometry.dispose(); scene.remove(cutLine); cutLine = null; }
  const cutK = prog(t, 2.28, 2.47, ease.linear);
  if (t > 2.28 && t < E.open[0] + 0.06) {
    const y0 = 1.45, y1 = lerp(1.45, 0.3, cutK);
    const pts = [];
    for (let i = 0; i <= 8; i++) { const y = lerp(y0, y1, i / 8); pts.push(new THREE.Vector3(0, y, rAt(y) + CUP.paper + 0.012)); }
    cutLine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.012, 6), cutMat);
    cutLine.position.x = cup.group.position.x; scene.add(cutLine);
  }

  // liquid
  const level = t < E.pour[0] + 0.05 ? 0 : track([[E.pour[0] + 0.05, 0.07], [E.pour[1], 1.05, ease.outQuad]], t);
  cup.setLevel(level, wobble(t, [[E.pour[0] + 0.3, 0.5], [E.close[1], 0.4]], 2.4, 3));

  // Tinku
  const [rx, rz, ryaw] = rootAt(t);
  tinku.root.position.set(rx, 0, rz); tinku.root.rotation.y = ryaw;
  const pose = poseAt(t);
  tinku.apply(pose, { blink: blink(t, C.BLINKS), antenna: wobble(t, C.ANTENNA, 3.4, 4.5), earWobble: wobble(t, C.ANTENNA, 2.6, 5) * 0.15 });
  tinku.root.updateMatrixWorld(true);

  // beaker: on the table, picked up 4.85 (left hand), pour, returned 6.4..6.7
  const handR = tinku.root.localToWorld(new THREE.Vector3().fromArray(pose.handR));
  const handL = tinku.root.localToWorld(new THREE.Vector3().fromArray(pose.handL));
  const held = t >= 4.85 && t < 6.62;
  if (held) {
    beaker.group.position.copy(handL).add(new THREE.Vector3(-0.12, -0.2, 0.02));
    const tip = prog(t, 5.05, 5.25, ease.outCubic) * (1 - prog(t, 6.0, 6.2, ease.inOut));
    beaker.group.rotation.set(0, 0, 1.95 * tip);
  } else {
    beaker.group.position.set(1.78, 0, 1.72); beaker.group.rotation.set(0, 0, 0);
  }
  beaker.fill.scale.y = 1 - 0.75 * prog(t, 5.2, 6.05, ease.linear);
  beaker.fill.position.y = 0.12 * beaker.fill.scale.y;
  beaker.group.updateMatrixWorld(true);
  const lip = beaker.group.localToWorld(new THREE.Vector3(-0.19, 0.39, 0));

  // pour stream
  if (stream) { stream.geometry.dispose(); scene.remove(stream); stream = null; }
  if (t > E.pour[0] && t < E.pour[1]) {
    const surf = new THREE.Vector3(0.02, Math.max(level, 0.1), 0.02);
    const thin = 1 - prog(t, E.pour[1] - 0.2, E.pour[1], ease.linear);
    const mid = lip.clone().lerp(surf, 0.5); mid.x -= 0.08;
    stream = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([lip.clone(), mid, surf]), 20, 0.03 * thin + 0.004, 8), coffeeMat);
    scene.add(stream);
  }

  // drop onto bare paper (right half inner face) -> stain
  const halfR = cup.halves.find((h) => h.side === 'R').pivot;
  halfR.updateMatrixWorld(true);
  const stainPt = halfR.localToWorld(new THREE.Vector3(rAt(0.95) - 0.005, 0.95, 0));
  anchors.stain = stainPt;
  dropA.visible = t >= E.dropPaper[0] && t < E.dropPaper[1];
  if (dropA.visible) {
    const q = clamp((t - E.dropPaper[0]) / (E.dropPaper[1] - E.dropPaper[0]));
    dropA.position.copy(lip).lerp(stainPt, q); dropA.position.y += Math.sin(q * Math.PI) * 0.35;
  }
  cup.setStain(t < E.stain[0] ? 0 : ease.outCubic(clamp((t - E.stain[0]) / (E.stain[1] - E.stain[0]))), 0.5, 0.59);

  // drop onto the film outer surface -> beads and runs down
  const phiB = 0.32;
  const filmPt = (y) => new THREE.Vector3((rAt(y) - CUP.film + 0.03) * Math.sin(phiB), y, (rAt(y) - CUP.film + 0.03) * Math.cos(phiB));
  dropB.visible = t >= E.dropFilm[0] && t < E.bead[1] + 0.2 && t < E.close[0];
  if (t >= E.dropFilm[0] && t < E.dropFilm[1]) {
    const q = clamp((t - E.dropFilm[0]) / (E.dropFilm[1] - E.dropFilm[0]));
    dropB.position.copy(lip).lerp(filmPt(1.25), q); dropB.position.y += Math.sin(q * Math.PI) * 0.3;
    dropB.scale.set(1, 1, 1);
  } else if (t >= E.dropFilm[1]) {
    const q = ease.inQuad(clamp((t - E.bead[0]) / (E.bead[1] - E.bead[0])));
    dropB.position.copy(filmPt(lerp(1.25, 0.35, q)));
    const squish = wobble(t, [[E.dropFilm[1], 0.35]], 7, 9);
    dropB.scale.set(1 + squish, 0.8 - squish * 0.6 + q * 0.15, 1 + squish);
  }
  anchors.bead = dropB.position.clone();

  // anchors for chips
  const halfL = cup.halves.find((h) => h.side === 'L').pivot;
  halfL.updateMatrixWorld(true);
  anchors.paperL = halfL.localToWorld(new THREE.Vector3(Math.sin(Math.PI + 0.75) * (rAt(1.3) - 0.005), 1.3, Math.cos(Math.PI + 0.75) * (rAt(1.3) - 0.005)));
  anchors.filmTop = new THREE.Vector3(Math.sin(0.15) * rAt(1.3), 1.3, Math.cos(0.15) * rAt(1.3));
  anchors.seam = new THREE.Vector3(Math.sin(-0.9) * (rAt(1.0) + CUP.paper), 1.0, Math.cos(-0.9) * (rAt(1.0) + CUP.paper));

  // film tent (bonded tug): hands pull the film lip at the left rim
  let s = 0;
  if (t >= E.tug[0] - 0.05 && t < E.snap[0]) s = clamp(prog(t, E.tug[0], E.tug[1], ease.inOut) * 1.0 + 0.04);
  else if (t >= E.snap[0] && t < E.snap[1]) s = Math.max(0, (1 - ease.outCubic(clamp((t - E.snap[0]) / 0.18))) + wobble(t, [[E.snap[0] + 0.18, 0.12]], 5, 9));
  const handC = cup.tilt.worldToLocal(handL.clone().lerp(handR, 0.5));
  const PHI_BOND = 1.25;
  cup.setTent(s, [handC.x, handC.y, handC.z], PHI_BOND, 0.85);
  anchors.rimBond = cup.tilt.localToWorld(new THREE.Vector3(Math.sin(PHI_BOND) * (CUP.rt + 0.02), CUP.H + 0.03, Math.cos(PHI_BOND) * (CUP.rt + 0.02)));

  // facilities pop up in the takeaway beat
  facilities.forEach((f, i) => {
    const t0 = E.facilities[i];
    const kk = t < t0 ? 0 : ease.outBack(clamp((t - t0) / 0.35), 2.2);
    f.visible = kk > 0.001;
    f.scale.set(1.15 * (0.9 + 0.1 * kk), 1.15 * Math.max(0.001, kk), 1.15);
    const r = routes[i];
    r.children.forEach((d, j) => { d.visible = t > t0 - 0.25 + j * 0.035; });
  });

  updateCaption(t);
  updateChips(t);
}

// QA: rectangles of every visible overlay text element (captions, chips, notes)
window.overlayRects = () => {
  const out = [];
  const els = [...document.querySelectorAll('#cap .w, #cap .sub, .chip, .note, #sig, #series')];
  for (const el of els) {
    const cs = getComputedStyle(el);
    let op = parseFloat(cs.opacity); let p = el.parentElement;
    while (p && p.id !== 'overlay') { op *= parseFloat(getComputedStyle(p).opacity); p = p.parentElement; }
    if (op < 0.05) continue;
    const r = el.getBoundingClientRect();
    out.push({ cls: el.className || el.id, text: el.textContent.trim().slice(0, 40), x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom), op: +op.toFixed(2) });
  }
  return out;
};
window.renderInfo = () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, programs: renderer.info.programs.length, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures });
window.renderAt = async (t) => {
  update(t);
  renderer.render(scene, camera);
  await new Promise((r) => requestAnimationFrame(() => r()));
};

if (mode === 'sheet') {
  const { setupSheet } = await import('./sheet.js');
  setupSheet({ THREE, renderer, scene, camera, tinku, cup, beaker, facilities, lab });
}

await document.fonts.load('800 78px "Baloo 2"');
await document.fonts.load('700 40px "Baloo 2"');
await document.fonts.load('600 28px "Inter"');
await document.fonts.ready;
await new Promise((r) => { const img = document.querySelector('#sig img'); if (img.complete) r(); else img.onload = r; });
window.__ready = true;
