// DOCKET — original robot reporter for the Ideaverse AI-literacy series. Reusable Three.js rig.
// Silhouette: rounded screen-face head with a mic antenna, filing-cabinet torso with two drawers ("NOTES", "SOURCES"),
// tube arms with white mitten hands, short legs with navy boots. Palette from the Ideaverse icon.
//   const d = createDocket(THREE, RoundedBoxGeometry);  scene.add(d.root);  d.pose({...}); d.face('skeptic', {talk, t});
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const DOCKET_PALETTE = { navy: '#1B2333', mint: '#6CDA7E', white: '#F4F7FB', shell: '#E9EFF2', ink: '#0E1424', steel: '#2A3550' };
export const DIM = { hip: 0.42, thigh: 0.18, shin: 0.17, ankle: 0.07, torsoW: 0.46, torsoH: 0.56, torsoD: 0.36, upper: 0.25, fore: 0.23 };

export const BASE_POSE = {
  x: 0, z: 0, rotY: 0, hop: 0, crouch: 0,            // root
  lean: 0, tilt: 0, twist: 0,                          // torso
  headYaw: 0, headPitch: 0, headRoll: 0,
  aFwd: 6, aOut: 10, aBend: 12, aTwist: 0,             // arm A (screen-left when facing camera)
  bFwd: 6, bOut: 10, bBend: 12, bTwist: 0,             // arm B (screen-right)
  drawer: 0, notes: 0, antenna: 0,
};

const D2R = Math.PI / 180;

export function createDocket(THREE) {
  const P = DOCKET_PALETTE;
  const mat = {
    shell: new THREE.MeshStandardMaterial({ color: P.shell, roughness: 0.38, metalness: 0.1 }),
    navy: new THREE.MeshStandardMaterial({ color: P.navy, roughness: 0.45, metalness: 0.25 }),
    steel: new THREE.MeshStandardMaterial({ color: P.steel, roughness: 0.35, metalness: 0.5 }),
    mint: new THREE.MeshStandardMaterial({ color: P.mint, roughness: 0.3, metalness: 0.15, emissive: new THREE.Color(P.mint), emissiveIntensity: 0.25 }),
    white: new THREE.MeshStandardMaterial({ color: P.white, roughness: 0.5 }),
    visor: new THREE.MeshStandardMaterial({ color: P.ink, roughness: 0.12, metalness: 0.4 }),
  };
  const shadow = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const box = (w, h, d, r, m) => shadow(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m));
  const cyl = (r0, r1, h, m, seg = 20) => shadow(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m));
  const sph = (r, m) => shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m));

  const root = new THREE.Group(); root.name = 'docket';
  // ---- legs (planted IK)
  const legs = [-1, 1].map((s) => {
    const hip = new THREE.Group(); hip.position.set(0.11 * s, DIM.hip, 0); root.add(hip);
    const thigh = cyl(0.042, 0.038, DIM.thigh, mat.navy); thigh.position.y = -DIM.thigh / 2; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -DIM.thigh; hip.add(knee);
    knee.add(Object.assign(sph(0.046, mat.steel), {}));
    const shin = cyl(0.038, 0.034, DIM.shin, mat.navy); shin.position.y = -DIM.shin / 2; knee.add(shin);
    const ankle = new THREE.Group(); ankle.position.y = -DIM.shin; knee.add(ankle);
    const boot = box(0.15, 0.08, 0.22, 0.035, mat.navy); boot.position.set(0, -0.03, 0.035); ankle.add(boot);
    const toe = box(0.13, 0.025, 0.05, 0.012, mat.mint); toe.position.set(0, -0.06, 0.13); ankle.add(toe);
    return { hip, knee, ankle };
  });
  // ---- torso (pivot at hips)
  const torso = new THREE.Group(); torso.position.y = DIM.hip; root.add(torso);
  const cab = box(DIM.torsoW, DIM.torsoH, DIM.torsoD, 0.06, mat.shell); cab.position.y = DIM.torsoH / 2; torso.add(cab);
  const plate = box(DIM.torsoW * 0.86, 0.04, DIM.torsoD * 0.9, 0.015, mat.navy); plate.position.y = 0.01; torso.add(plate);
  // two drawers on the chest
  function makeDrawer(y, label) {
    const g = new THREE.Group(); g.position.set(0, y, DIM.torsoD / 2 - 0.02); torso.add(g);
    const face = box(DIM.torsoW * 0.82, 0.2, 0.05, 0.02, mat.shell); face.position.z = 0.03; g.add(face);
    const handle = box(0.16, 0.03, 0.03, 0.012, mat.mint); handle.position.set(0, 0.03, 0.065); g.add(handle);
    const lab = labelPlane(THREE, label, 0.16, 0.045, '#1B2333', '#E9EFF2'); lab.position.set(0, -0.045, 0.056); g.add(lab);
    const body = box(DIM.torsoW * 0.78, 0.17, 0.3, 0.015, mat.steel); body.position.z = -0.12; g.add(body);
    return g;
  }
  const notes = makeDrawer(0.40, 'NOTES');
  const sources = makeDrawer(0.17, 'SOURCES');
  // press tag
  const tag = labelPlane(THREE, 'PRESS', 0.12, 0.05, '#1B2333', P.mint); tag.position.set(-0.13, 0.53, DIM.torsoD / 2 + 0.004); torso.add(tag);
  // ---- arms
  const arms = [-1, 1].map((s) => {
    const sh = new THREE.Group(); sh.position.set((DIM.torsoW / 2 + 0.03) * s, 0.47, 0); sh.rotation.order = 'ZXY'; torso.add(sh);
    sh.add(sph(0.055, mat.steel));
    const up = cyl(0.035, 0.032, DIM.upper, mat.navy); up.position.y = -DIM.upper / 2; sh.add(up);
    const el = new THREE.Group(); el.position.y = -DIM.upper; sh.add(el);
    el.add(sph(0.04, mat.steel));
    const fo = cyl(0.032, 0.03, DIM.fore, mat.navy); fo.position.y = -DIM.fore / 2; el.add(fo);
    const hand = new THREE.Group(); hand.position.y = -DIM.fore - 0.035; el.add(hand);
    const mit = sph(0.06, mat.white); mit.scale.set(1, 1.15, 0.8); hand.add(mit);
    const thumb = sph(0.025, mat.white); thumb.position.set(-0.045 * s, 0.015, 0.03); hand.add(thumb);
    const cuff = cyl(0.045, 0.045, 0.03, mat.mint); cuff.position.y = 0.05; hand.add(cuff);
    return { sh, el, hand };
  });
  // ---- head
  const neck = new THREE.Group(); neck.position.y = DIM.torsoH; torso.add(neck);
  const neckRod = cyl(0.05, 0.06, 0.07, mat.steel); neckRod.position.y = 0.035; neck.add(neckRod);
  const head = new THREE.Group(); head.position.y = 0.07; neck.add(head);
  const skull = box(0.46, 0.34, 0.34, 0.09, mat.shell); skull.position.y = 0.17; head.add(skull);
  const visor = box(0.38, 0.25, 0.04, 0.05, mat.visor); visor.position.set(0, 0.17, 0.16); head.add(visor);
  for (const s of [-1, 1]) { const ear = cyl(0.05, 0.05, 0.05, mat.mint); ear.rotation.z = Math.PI / 2; ear.position.set(0.24 * s, 0.17, 0); head.add(ear); }
  const brim = box(0.48, 0.03, 0.12, 0.012, mat.navy); brim.position.set(0, 0.34, 0.12); head.add(brim);   // visor cap ridge
  // face screen (canvas texture, unlit so it glows)
  const faceCanvas = document.createElement('canvas'); faceCanvas.width = 320; faceCanvas.height = 210;
  const faceTex = new THREE.CanvasTexture(faceCanvas); faceTex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.223), new THREE.MeshBasicMaterial({ map: faceTex, toneMapped: false }));
  face.position.set(0, 0.17, 0.181); head.add(face);
  // antenna microphone (springy)
  const ant = new THREE.Group(); ant.position.set(0.13, 0.33, -0.04); head.add(ant);
  const rod = cyl(0.009, 0.009, 0.2, mat.steel, 8); rod.position.y = 0.1; ant.add(rod);
  const mic = sph(0.035, mat.mint); mic.position.y = 0.21; mic.scale.set(1, 1.25, 1); ant.add(mic);
  const grille = cyl(0.037, 0.037, 0.012, mat.navy); grille.position.y = 0.19; ant.add(grille);

  const api = { root, torso, head, neck, arms, legs, notes, sources, ant, faceMesh: face, faceCanvas, faceTex, mat };

  // arm control for IK: side 0 = A, 1 = B ; angles in degrees (same meaning as the pose fields)
  api.setArm = (side, fwd, out, bend) => {
    const a = arms[side]; a.sh.rotation.set(-fwd * D2R, a.sh.rotation.y, (side ? out : -out) * D2R); a.el.rotation.x = -bend * D2R;
    a.sh.updateMatrixWorld(true);
  };
  api.handWorld = (side, v) => arms[side].hand.getWorldPosition(v);
  api.pose = (pin) => {
    const p = { ...BASE_POSE, ...pin };
    root.position.set(p.x, p.hop, p.z); root.rotation.y = p.rotY * D2R;
    // planted legs: hip height from crouch
    const D = Math.max(0.2, DIM.thigh + DIM.shin - 0.004 - p.crouch * 0.16);
    const L1 = DIM.thigh, L2 = DIM.shin;
    const a = Math.acos(Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)));
    const b = Math.acos(Math.min(1, (L2 * L2 + D * D - L1 * L1) / (2 * L2 * D)));
    const hipY = D + DIM.ankle - 0.004;
    for (const lg of legs) { lg.hip.position.y = hipY; lg.hip.rotation.x = -a; lg.knee.rotation.x = a + b; lg.ankle.rotation.x = -b; }
    torso.position.y = hipY;
    torso.rotation.set(p.lean * D2R, p.twist * D2R, p.tilt * D2R);
    head.rotation.set(p.headPitch * D2R, p.headYaw * D2R, p.headRoll * D2R);
    const [A, B] = arms;
    A.sh.rotation.set(-p.aFwd * D2R, p.aTwist * D2R, -p.aOut * D2R); A.el.rotation.x = -p.aBend * D2R;
    B.sh.rotation.set(-p.bFwd * D2R, p.bTwist * D2R, p.bOut * D2R); B.el.rotation.x = -p.bBend * D2R;
    sources.position.z = DIM.torsoD / 2 - 0.02 + p.drawer * 0.24;
    notes.position.z = DIM.torsoD / 2 - 0.02 + p.notes * 0.2;
    ant.rotation.z = p.antenna * D2R; ant.rotation.x = p.antenna * 0.4 * D2R;
  };

  // expressions: neutral happy wow skeptic puzzled focus determined proud ; talk 0..1 opens the mouth bar
  api.face = (expr = 'neutral', o = {}) => {
    const c = faceCanvas.getContext('2d'), W = faceCanvas.width, H = faceCanvas.height;
    const mint = P.mint, talk = o.talk || 0, blink = o.blink || 0, t = o.t || 0;
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16203A'); g.addColorStop(1, '#0B1020');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(108,218,126,0.05)'; for (let y = 0; y < H; y += 6) c.fillRect(0, y, W, 2);   // scanlines
    c.save(); c.shadowColor = mint; c.shadowBlur = 18; c.fillStyle = mint; c.strokeStyle = mint; c.lineCap = 'round'; c.lineJoin = 'round';
    const ex = [W / 2 - 62, W / 2 + 62], ey = 88;
    const rrect = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, Math.max(2, h), Math.min(r, h / 2)); c.fill(); };
    const open = Math.max(0.08, 1 - blink);
    const lx = (o.look || 0) * 10;
    switch (expr) {
      case 'happy': case 'proud':
        c.lineWidth = 12; for (const x of ex) { c.beginPath(); c.arc(x + lx, ey + 14, 26, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); } break;
      case 'wow':
        for (const x of ex) { c.beginPath(); c.arc(x + lx, ey, 34 * Math.max(0.15, open), 0, 7); c.fill(); }
        c.shadowBlur = 0; c.fillStyle = '#E8FFF0'; for (const x of ex) { c.beginPath(); c.arc(x + lx + 10, ey - 12, 8, 0, 7); c.fill(); } c.fillStyle = mint; break;
      case 'skeptic':
        rrect(ex[0] + lx, ey + 8, 50, 22 * open, 10); rrect(ex[1] + lx, ey, 46, 58 * open, 18);
        c.lineWidth = 9; c.beginPath(); c.moveTo(ex[0] - 30, ey - 22); c.lineTo(ex[0] + 28, ey - 10); c.stroke();
        c.beginPath(); c.moveTo(ex[1] - 26, ey - 46); c.lineTo(ex[1] + 28, ey - 52); c.stroke(); break;
      case 'puzzled':
        rrect(ex[0] + lx, ey + 4, 30, 30 * open, 15); rrect(ex[1] + lx, ey - 2, 50, 64 * open, 20);
        c.font = 'bold 64px "Space Grotesk"'; c.textAlign = 'center'; c.fillText('?', W / 2 + 4 + 6 * Math.sin(t * 6), 62); break;
      case 'focus':
        rrect(ex[0] + lx, ey, 58, 16, 8); rrect(ex[1] + lx, ey, 58, 16, 8);
        c.globalAlpha = 0.5; c.fillRect(0, (t * 300) % H, W, 4); c.globalAlpha = 1; break;
      case 'determined':
        for (const [i, x] of ex.entries()) {
          c.beginPath(); const s = i ? -1 : 1;
          c.moveTo(x - 26, ey - 22 + 10 * s); c.lineTo(x + 26, ey - 22 - 10 * s); c.lineTo(x + 26, ey + 26); c.lineTo(x - 26, ey + 26); c.closePath(); c.fill();
        } break;
      default:
        for (const x of ex) rrect(x + lx, ey, 46, 62 * open, 20);
    }
    // mouth bar (talk = lip-sync amplitude)
    const mw = expr === 'happy' || expr === 'proud' ? 70 : 46, mh = 6 + talk * 30;
    if (expr === 'proud' || (expr === 'happy' && talk < 0.1)) { c.lineWidth = 9; c.beginPath(); c.arc(W / 2, 150, 34, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); }
    else if (expr === 'skeptic' && talk < 0.1) { c.lineWidth = 8; c.beginPath(); c.moveTo(W / 2 - 26, 166); c.lineTo(W / 2 + 26, 158); c.stroke(); }
    else rrect(W / 2, 162, mw - talk * 10, mh, 6);
    c.restore();
    faceTex.needsUpdate = true;
  };
  api.face('neutral');
  api.pose({});
  return api;
}

export function labelPlane(THREE, text, w, h, fg, bg, font = '700 {S}px "JetBrains Mono"') {
  const c = document.createElement('canvas'); const px = 512; c.width = px; c.height = Math.round((px * h) / w);
  const g = c.getContext('2d'); g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, c.width, c.height, c.height * 0.18); g.fill();
  let S = Math.round(c.height * 0.62); g.font = font.replace('{S}', S); g.letterSpacing = `${Math.round(S * 0.08)}px`;
  while (g.measureText(text).width > c.width * 0.88 && S > 8) { S -= 2; g.font = font.replace('{S}', S); g.letterSpacing = `${Math.round(S * 0.08)}px`; }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + S * 0.05);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
  m.userData.canvas = c; return m;
}
