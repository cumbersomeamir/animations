// Physical props for pilot 01 (all procedural, original). Two FICTIONAL cookie boxes with deliberately different packaging
// cues (weight, shape, finish) holding the SAME cookie geometry/material — identical contents by construction.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { PALETTE } from "./rig/cast.js";
import { mat } from "./rig/character.js";
import { rng } from "./lib/anim.js";

export const TABLE_Y = 0.9;

function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ------------------------------------------------------------------ stage
export function buildStage(scene) {
  const g = new THREE.Group(); scene.add(g);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: "#1C1046", roughness: 0.62, metalness: 0.0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  // cyclorama: curved back wall with a soft lavender pool (self-lit so it reads in any shot)
  const wallTex = canvasTex(1024, 1024, (c, w, h) => {
    const grd = c.createRadialGradient(w * 0.45, h * 0.62, 20, w * 0.45, h * 0.62, w * 0.62);
    grd.addColorStop(0, "#5B3FC9"); grd.addColorStop(0.35, "#3A2394"); grd.addColorStop(0.75, "#1E1052"); grd.addColorStop(1, "#130A33");
    c.fillStyle = grd; c.fillRect(0, 0, w, h);
  });
  const cyc = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 9, 64, 1, true, Math.PI * 0.72, Math.PI * 0.56), new THREE.MeshBasicMaterial({ map: wallTex, side: THREE.BackSide, fog: false }));
  cyc.position.set(0, 4.2, 2.6); g.add(cyc);
  // floor tape marks (lavender X + T)
  const tapeMat = new THREE.MeshStandardMaterial({ color: PALETTE.lavender, roughness: 0.8 });
  const tape = (x, z, r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.004, 0.05), tapeMat); m.position.set(x, 0.002, z); m.rotation.y = r; m.receiveShadow = true; g.add(m); };
  tape(1.35, 0.9, 0.785); tape(1.35, 0.9, -0.785); tape(-0.4, 1.25, 0); tape(-0.4, 1.4, Math.PI / 2);
  // painted flat seen from behind (backstage): timber frame + braces
  const wood = new THREE.MeshStandardMaterial({ color: "#3B2A78", roughness: 0.85 });
  const flat = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.2, 0.04), new THREE.MeshStandardMaterial({ color: "#2A1A66", roughness: 0.9 })); panel.position.y = 1.6; flat.add(panel);
  for (const [x, y, w, h, r] of [[0, 0.05, 1.4, 0.08, 0], [0, 3.15, 1.4, 0.08, 0], [-0.66, 1.6, 0.08, 3.2, 0], [0.66, 1.6, 0.08, 3.2, 0], [0, 1.6, 0.08, 3.3, 0.42]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), wood); b.position.set(x, y, 0.05); b.rotation.z = r; flat.add(b);
  }
  flat.position.set(2.3, 0, -2.2); flat.rotation.y = -0.5; flat.traverse((m) => (m.castShadow = m.receiveShadow = true)); g.add(flat);
  // ladder at the back right
  const ladder = new THREE.Group();
  for (const x of [-0.22, 0.22]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.6, 0.05), wood); rail.position.set(x, 1.3, 0); ladder.add(rail); }
  for (let i = 0; i < 8; i++) { const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 8), wood); rung.rotation.z = Math.PI / 2; rung.position.y = 0.3 + i * 0.3; ladder.add(rung); }
  ladder.position.set(1.4, 0, -2.6); ladder.rotation.set(-0.12, -0.3, 0); ladder.traverse((m) => (m.castShadow = true)); g.add(ladder);
  // string of practical bulbs across the top (bokeh)
  const bulbMat = new THREE.MeshBasicMaterial({ color: "#F4EEFF", fog: false });
  const glowTex = canvasTex(64, 64, (c, w) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(240,234,252,0.9)"); r.addColorStop(0.3, "rgba(204,192,247,0.35)"); r.addColorStop(1, "rgba(204,192,247,0)"); c.fillStyle = r; c.fillRect(0, 0, w, w); });
  const bulbs = [];
  for (let i = 0; i < 15; i++) {
    const u = i / 14, x = -3.2 + u * 6.4, y = 3.35 - Math.sin(u * Math.PI) * 0.55, z = -2.9 + Math.sin(u * 5) * 0.15;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), bulbMat); b.position.set(x, y, z); g.add(b);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    s.scale.setScalar(0.42); s.position.copy(b.position); g.add(s); bulbs.push(s);
  }
  // cable coil on the floor
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.018, 8, 40), new THREE.MeshStandardMaterial({ color: "#0E0824", roughness: 0.6 }));
  coil.rotation.x = Math.PI / 2; coil.position.set(-1.7, 0.02, 0.5); g.add(coil);
  return { group: g, bulbs };
}

// ------------------------------------------------------------------ table
export function buildTable(scene) {
  const g = new THREE.Group(); scene.add(g);
  const top = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.07, 0.72, 4, 0.025), mat(PALETTE.lavender, { roughness: 0.55, clearcoat: 0.25 }));
  top.position.y = TABLE_Y - 0.035; top.receiveShadow = true; top.castShadow = true; g.add(top);
  const skirt = new THREE.Mesh(new THREE.BoxGeometry(1.48, TABLE_Y - 0.07, 0.04), new THREE.MeshStandardMaterial({ color: "#2B1878", roughness: 0.7 }));
  skirt.position.set(0, (TABLE_Y - 0.07) / 2, 0.32); skirt.castShadow = skirt.receiveShadow = true; g.add(skirt);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.018, 0.045), new THREE.MeshStandardMaterial({ color: PALETTE.lavender, roughness: 0.6 }));
  stripe.position.set(0, TABLE_Y - 0.13, 0.322); g.add(stripe);
  const back = skirt.clone(); back.position.z = -0.32; g.add(back);
  for (const x of [-0.72, 0.72]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.04, TABLE_Y - 0.07, 0.64), skirt.material); side.position.set(x, (TABLE_Y - 0.07) / 2, 0); side.castShadow = true; g.add(side); }
  return g;
}

// ------------------------------------------------------------------ cookies (one shared geometry → identical by construction)
const COOKIE_R = 0.068;
function cookieOutline(bites = []) {
  const pts = [], N = 96, rand = rng(7);
  const wob = Array.from({ length: 9 }, () => rand() * 0.06 - 0.03);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, ux = Math.cos(a), uy = Math.sin(a);
    let r = COOKIE_R * (1 + wob[i % 9] * 0.35 + Math.sin(a * 3 + 1) * 0.012);
    // bite notch: clip the ray from the centre at its first intersection with each bite circle
    for (const [bx, by, br] of bites) {
      const ub = ux * bx + uy * by, disc = ub * ub - (bx * bx + by * by) + br * br;
      if (disc > 0) { const t0 = ub - Math.sqrt(disc); if (t0 < r && ub + Math.sqrt(disc) > 0) r = Math.max(COOKIE_R * 0.25, t0); }
    }
    pts.push(new THREE.Vector2(ux * r, uy * r));
  }
  return new THREE.Shape(pts);
}
const BITE = [[0.062, 0.03, 0.034], [0.052, -0.016, 0.03]];
let COOKIE_GEO = null, COOKIE_BITTEN = null, CHIP_GEO = null, COOKIE_MAT = null, CHIP_MAT = null;
const CHIPS = [[0.02, 0.025], [-0.03, 0.02], [-0.012, -0.034], [0.035, -0.022], [-0.042, -0.012], [0.004, 0.0], [0.028, 0.045]];
function cookieGeos() {
  if (COOKIE_GEO) return;
  const ex = { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3, curveSegments: 1 };
  COOKIE_GEO = new THREE.ExtrudeGeometry(cookieOutline(), ex); COOKIE_GEO.rotateX(-Math.PI / 2); COOKIE_GEO.translate(0, 0.006, 0);
  COOKIE_BITTEN = new THREE.ExtrudeGeometry(cookieOutline(BITE), ex); COOKIE_BITTEN.rotateX(-Math.PI / 2); COOKIE_BITTEN.translate(0, 0.006, 0);
  CHIP_GEO = new THREE.SphereGeometry(0.011, 10, 6); CHIP_GEO.scale(1.2, 0.55, 1);
  COOKIE_MAT = new THREE.MeshPhysicalMaterial({ color: "#C98E52", roughness: 0.82, clearcoat: 0.05, sheen: 0.4, sheenColor: new THREE.Color("#F2C48A") });
  CHIP_MAT = new THREE.MeshStandardMaterial({ color: "#3A1F14", roughness: 0.45 });
}
export function makeCookie() {
  cookieGeos();
  const g = new THREE.Group();
  const body = new THREE.Mesh(COOKIE_GEO, COOKIE_MAT); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const chips = CHIPS.map(([x, z]) => { const c = new THREE.Mesh(CHIP_GEO, CHIP_MAT); c.position.set(x, 0.0245, -z); g.add(c); return c; });
  g.userData.setBitten = (b) => {
    body.geometry = b ? COOKIE_BITTEN : COOKIE_GEO;
    chips.forEach((c, i) => { const [x, z] = CHIPS[i]; c.visible = !b || !BITE.some(([bx, by, br]) => Math.hypot(x - bx, z - by) < br + 0.006); });
  };
  return g;
}

// ------------------------------------------------------------------ boxes
// PLAIN: light, squat, soft-cornered, matte grey carton with a plain stamped label.
// LUXE: heavy, tall, angular hexagonal prism, glossy deep violet with a white foil band and lavender lid.
export function buildBoxes(scene) {
  const plainLabel = canvasTex(512, 160, (c, w, h) => {
    c.fillStyle = "#E7E3EE"; c.fillRect(0, 0, w, h);
    c.strokeStyle = "#5C566C"; c.lineWidth = 6; c.strokeRect(10, 10, w - 20, h - 20);
    c.fillStyle = "#4A4458"; c.font = "92px InterB"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("COOKIES", w / 2, h / 2 + 6);
  });
  const luxeLabel = canvasTex(512, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = "rgba(240,234,252,0.95)";
    // four-point star emblem
    c.save(); c.translate(w / 2, h * 0.36); c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2, r = i % 2 ? 26 : 92; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill(); c.restore();
    c.font = "56px InterSB"; c.textAlign = "center"; c.textBaseline = "middle";
    const txt = "C O O K I E S"; c.fillText(txt, w / 2, h * 0.72);
    c.fillRect(w * 0.3, h * 0.82, w * 0.4, 4);
  });

  const mkLid = (geo, material, w, d) => { const pivot = new THREE.Group(); const m = new THREE.Mesh(geo, material); pivot.add(m); m.castShadow = true; return { pivot, m }; };

  // plain
  const plain = new THREE.Group(); plain.name = "plain";
  const pw = 0.38, ph = 0.24, pd = 0.3;
  const pMat = new THREE.MeshPhysicalMaterial({ color: "#B6AFC6", roughness: 0.92, transparent: true });
  const pBody = new THREE.Mesh(new RoundedBoxGeometry(pw, ph, pd, 4, 0.045), pMat); pBody.position.y = ph / 2; pBody.castShadow = pBody.receiveShadow = true; plain.add(pBody);
  const pLabelM = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.0875), new THREE.MeshStandardMaterial({ map: plainLabel, roughness: 0.9, transparent: true })); pLabelM.position.set(-0.01, ph * 0.5, pd / 2 + 0.002); pLabelM.rotation.z = 0.035; plain.add(pLabelM);
  const pLid = mkLid(new RoundedBoxGeometry(pw + 0.01, 0.04, pd + 0.01, 3, 0.018), pMat);
  pLid.pivot.position.set(pw / 2, ph, 0); pLid.m.position.set(-pw / 2, 0.012, 0); plain.add(pLid.pivot); // hinge on the right edge
  const pEdges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(pw, ph, pd)), new THREE.LineBasicMaterial({ color: PALETTE.lavender, transparent: true, opacity: 0 }));
  pEdges.position.y = ph / 2; plain.add(pEdges);

  // luxe (hexagonal prism, flat face toward +z)
  const luxe = new THREE.Group(); luxe.name = "luxe";
  const lr = 0.19, lh = 0.36;
  const lMat = new THREE.MeshPhysicalMaterial({ color: "#3A1BB5", roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06, transparent: true, flatShading: true });
  const lBody = new THREE.Mesh(new THREE.CylinderGeometry(lr, lr, lh, 6, 1), lMat); lBody.rotation.y = Math.PI / 6; lBody.position.y = lh / 2; lBody.castShadow = lBody.receiveShadow = true; luxe.add(lBody);
  const foil = new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", roughness: 0.18, metalness: 0.65, clearcoat: 1, transparent: true });
  const band = new THREE.Mesh(new THREE.CylinderGeometry(lr + 0.004, lr + 0.004, 0.035, 6, 1, true), foil); band.rotation.y = Math.PI / 6; band.position.y = lh * 0.22; luxe.add(band);
  const lLabelM = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), new THREE.MeshBasicMaterial({ map: luxeLabel, transparent: true })); lLabelM.position.set(0, lh * 0.6, lr * Math.cos(Math.PI / 6) + 0.003); luxe.add(lLabelM);
  const lidMat = new THREE.MeshPhysicalMaterial({ color: PALETTE.lavender, roughness: 0.25, metalness: 0.35, clearcoat: 1, transparent: true, flatShading: true });
  const lLidGeo = new THREE.CylinderGeometry(lr + 0.012, lr + 0.012, 0.05, 6, 1); lLidGeo.rotateY(Math.PI / 6);
  const lLid = mkLid(lLidGeo, lidMat);
  lLid.m.position.set(0, 0.022, 0); scene.add(lLid.pivot); // not parented: the lid pops off and lands on the table
  const knob = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), foil); knob.position.set(0, 0.06, 0); lLid.pivot.add(knob);
  const lEdgeGeo = new THREE.EdgesGeometry(new THREE.CylinderGeometry(lr, lr, lh, 6, 1)); lEdgeGeo.rotateY(Math.PI / 6);
  const lEdges = new THREE.LineSegments(lEdgeGeo, new THREE.LineBasicMaterial({ color: PALETTE.lavender, transparent: true, opacity: 0 })); lEdges.position.y = lh / 2; luxe.add(lEdges);

  // identical stacks of 3 cookies inside each box
  const stacks = {};
  for (const [box, y0] of [[plain, 0.03], [luxe, 0.03]]) {
    const st = [];
    for (let i = 0; i < 3; i++) { const c = makeCookie(); c.position.set(0, y0 + i * 0.031, 0); c.rotation.y = i * 0.9; c.scale.setScalar(1.0); box.add(c); st.push(c); }
    stacks[box.name] = st;
  }
  scene.add(plain, luxe);
  return {
    plain: { group: plain, lid: pLid.pivot, mats: [pMat, pLabelM.material], edges: pEdges, h: ph, top: ph, label: pLabelM, stack: stacks.plain },
    luxe: { group: luxe, lid: lLid.pivot, mats: [lMat, foil, lidMat, lLabelM.material], edges: lEdges, h: lh, top: lh, label: lLabelM, stack: stacks.luxe, knob },
  };
}

// ------------------------------------------------------------------ thought bubble ("expectation")
export function buildBubble(scene) {
  const g = new THREE.Group(); scene.add(g);
  const cloudMat = new THREE.MeshPhysicalMaterial({ color: "#F6F2FF", roughness: 0.55, clearcoat: 0.3, sheen: 0.6, sheenColor: new THREE.Color(PALETTE.lavender), emissive: "#2A1A70", emissiveIntensity: 0.15 });
  const cloud = new THREE.Group(); g.add(cloud);
  for (const [x, y, r] of [[0, 0, 0.26], [-0.22, -0.04, 0.18], [0.23, -0.03, 0.19], [-0.1, 0.13, 0.17], [0.12, 0.14, 0.18], [0.0, -0.12, 0.19]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), cloudMat); s.position.set(x, y, 0); s.scale.z = 0.45; cloud.add(s);
  }
  const trail = [0.075, 0.05].map((r) => { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), cloudMat); g.add(s); return s; });
  const glowTex = canvasTex(128, 128, (c, w) => { const r = c.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(255,248,230,1)"); r.addColorStop(0.35, "rgba(214,196,255,0.55)"); r.addColorStop(1, "rgba(160,130,255,0)"); c.fillStyle = r; c.fillRect(0, 0, w, w); });
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
  cloud.add(glow);
  const expectLuxe = makeCookie(); cloud.add(expectLuxe);
  const expectPlain = makeCookie(); cloud.add(expectPlain);
  // the plain expectation is shown dull (same cookie, greyed) — it is an imagined expectation, not the product
  expectPlain.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color("#8F8A99"), 0.75); } });
  return { group: g, cloud, trail, glow, expectLuxe, expectPlain, cloudMat };
}

// ------------------------------------------------------------------ overhead boom inspection lamp with a pull cord ("X-ray")
export const LAMP = { base: [-0.95, -1.0], poleH: 2.5, head: [-0.08, 2.42, -0.14], aim: [0.0, 0.98, -0.18], cordU: 0.3, beadY: 1.36 };
export function buildLamp(scene) {
  const g = new THREE.Group(); scene.add(g);
  const metal = new THREE.MeshStandardMaterial({ color: "#110B28", roughness: 0.35, metalness: 0.6 });
  const [bx, bz] = LAMP.base;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 24), metal); foot.position.set(bx, 0.025, bz); g.add(foot);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, LAMP.poleH, 10), metal); pole.position.set(bx, LAMP.poleH / 2, bz); g.add(pole);
  const top = new THREE.Vector3(bx, LAMP.poleH, bz), head = new THREE.Vector3(...LAMP.head);
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 8), metal);
  boom.position.copy(top).lerp(head, 0.5); boom.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), head.clone().sub(top).normalize()); boom.scale.y = head.distanceTo(top); g.add(boom);
  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), metal); knuckle.position.copy(top); g.add(knuckle);
  // head: points from `head` to `aim`
  const headG = new THREE.Group(); headG.position.copy(head); g.add(headG);
  headG.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...LAMP.aim).sub(head).normalize());
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.24, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: "#2B1E66", roughness: 0.3, metalness: 0.55, clearcoat: 0.8, side: THREE.DoubleSide }));
  shell.rotation.x = Math.PI / 2; headG.add(shell);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), shell.material); cap.rotation.x = -Math.PI / 2; cap.position.z = -0.12; headG.add(cap);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 8, 32), new THREE.MeshStandardMaterial({ color: PALETTE.lavender, roughness: 0.4, metalness: 0.3 })); rim.position.z = 0.12; headG.add(rim);
  const lensMat = new THREE.MeshBasicMaterial({ color: "#3C2F6E" });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), lensMat); lens.position.z = 0.1; headG.add(lens);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  // beam: open cone along +z of the head
  const L = head.distanceTo(new THREE.Vector3(...LAMP.aim)) * 1.12;
  const beamGeo = new THREE.CylinderGeometry(0.13, 0.56, L, 48, 1, true); beamGeo.translate(0, -L / 2, 0); beamGeo.rotateX(-Math.PI / 2);
  const beamTex = canvasTex(8, 256, (c, w, h) => { const l = c.createLinearGradient(0, 0, 0, h); l.addColorStop(0, "rgba(255,255,255,0.05)"); l.addColorStop(0.15, "rgba(255,255,255,0.7)"); l.addColorStop(1, "rgba(255,255,255,0.12)"); c.fillStyle = l; c.fillRect(0, 0, w, h); });
  const beamMat = new THREE.MeshBasicMaterial({ color: "#D8CBFF", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, alphaMap: beamTex });
  const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.z = 0.11; beam.scale.y = 0.55; headG.add(beam); // elliptical: wide across both boxes, shallow towards Quibble
  const light = new THREE.SpotLight("#E6DCFF", 0, 5, 0.42, 0.5, 1.0); light.position.set(0, 0, 0.1); headG.add(light);
  const target = new THREE.Object3D(); target.position.set(...LAMP.aim); scene.add(target); light.target = target;
  // pull cord from the boom down to a bead
  const cordTop = top.clone().lerp(head, LAMP.cordU);
  const cordMat = new THREE.MeshStandardMaterial({ color: "#CFC4F5", roughness: 0.6 });
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), cordMat); g.add(cord);
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), mat(PALETTE.lavender, { roughness: 0.3 })); bead.castShadow = true; g.add(bead);
  function setCord(pull = 0, sway = 0) {
    const b = new THREE.Vector3(cordTop.x + sway * 0.05, LAMP.beadY - pull, cordTop.z);
    bead.position.copy(b);
    cord.position.copy(cordTop).lerp(b, 0.5); cord.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cordTop.clone().sub(b).normalize()); cord.scale.y = cordTop.distanceTo(b);
    return b;
  }
  setCord(0);
  return { group: g, headG, beam, beamMat, light, lens, lensMat, setCord, bead };
}

// ------------------------------------------------------------------ particles
export function buildParticles(scene) {
  const g = new THREE.Group(); scene.add(g);
  const soft = canvasTex(64, 64, (c, w) => { const r = c.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, "rgba(230,222,250,0.85)"); r.addColorStop(1, "rgba(230,222,250,0)"); c.fillStyle = r; c.fillRect(0, 0, w, w); });
  const star = canvasTex(128, 128, (c, w) => {
    const r = c.createRadialGradient(64, 64, 0, 64, 64, 30); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(204,192,247,0)");
    c.fillStyle = r; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? 9 : 62; c.lineTo(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr); }
    c.closePath(); c.fill();
  });
  const pool = (n, tex, color, additive = true) => Array.from({ length: n }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
    s.visible = false; g.add(s); return s;
  });
  const crumbMat = new THREE.MeshStandardMaterial({ color: "#B97E45", roughness: 0.9 });
  const crumbs = Array.from({ length: 22 }, (_, i) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.007 + (i % 4) * 0.0025), crumbMat); m.visible = false; m.castShadow = true; g.add(m); return m; });
  return { group: g, dust: pool(16, soft, "#CFC4F2", false), sparks: pool(28, star, "#FFFFFF"), puffs: pool(6, soft, "#9C96AE", false), crumbs };
}
