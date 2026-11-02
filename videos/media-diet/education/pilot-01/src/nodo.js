// Nodo — original recurring technician character (name: network 'node') for the Media Diet educational series.
// Built only from three.js primitives (no external models). Palette sampled from the app icon.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PAL } from './palette.js';

export const NODO_DEFAULT = {
  // whole body
  squash: 0, pitch: 0, roll: 0,
  bob: 0, lean: 0, twist: 0, sway: 0,
  // head
  headX: 0, headY: 0, headZ: 0, antenna: 0,
  // arms (shoulder x: negative = forward/up; z: + raises left arm sideways, - raises right arm)
  shLx: 0.05, shLy: 0, shLz: 0.14, elL: -0.25, wrL: 0, ptL: 0, thL: 0,
  shRx: 0.05, shRy: 0, shRz: -0.14, elR: -0.25, wrR: 0, ptR: 0, thR: 0,
  // legs (hip x: negative = forward; knee x: positive bends)
  hipLx: 0, hipLz: 0.04, knL: 0.05, ftL: 0,
  hipRx: 0, hipRz: -0.04, knR: 0.05, ftR: 0,
  // face
  browL: 0, browR: 0, browAngL: 0, browAngR: 0,
  eyeL: 1, eyeR: 1, lookX: 0, lookY: 0,
  mouth: 0, smile: 0.55, mouthW: 1,
  lamp: 0,
};

export function createNodo(toon) {
  const M = {
    skin: toon(PAL.cyanSkin),
    suit: toon(PAL.violet),
    suitDark: toon(PAL.violetDeep),
    helmet: toon(PAL.violetLight),
    crest: toon(PAL.magenta),
    navy: toon(PAL.navyMid),
    glove: toon(PAL.glove),
    white: toon('#f6f7ff'),
    pupil: new THREE.MeshBasicMaterial({ color: PAL.ink }),
    mouth: new THREE.MeshBasicMaterial({ color: '#2a0b3a' }),
    tongue: new THREE.MeshBasicMaterial({ color: '#ff6fa8' }),
    lens: new THREE.MeshBasicMaterial({ color: '#c9fbff' }),
    coil: new THREE.MeshBasicMaterial({ color: PAL.cyan }),
    hook: toon(PAL.magenta),
  };
  M.pupil.userData.outlineParameters = { visible: false };
  M.mouth.userData.outlineParameters = { thickness: 0.002 };
  M.tongue.userData.outlineParameters = { visible: false };
  M.lens.userData.outlineParameters = { visible: false };

  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const cap = (r, len, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 16), mat);
  const G = () => new THREE.Group();

  const root = G();            // feet on y=0, faces +z
  const body = G(); root.add(body);   // squash / pitch / roll pivot (at hips height)
  body.position.y = 0.78;
  const hips = G(); body.add(hips);
  const spine = G(); hips.add(spine);

  // Pelvis + torso (overalls)
  hips.add(mesh(new THREE.SphereGeometry(0.25, 24, 16), M.suit, 0, 0.04, 0));
  const torso = cap(0.28, 0.3, M.suit); torso.position.y = 0.36; spine.add(torso);
  const pocket = mesh(new RoundedBoxGeometry(0.26, 0.19, 0.06, 3, 0.025), M.suitDark, 0, 0.47, 0.255);
  pocket.rotation.x = -0.12; spine.add(pocket);
  const badge = mesh(new THREE.OctahedronGeometry(0.05, 0), M.coil, 0, 0.48, 0.295); badge.scale.set(1, 1, 0.4); spine.add(badge);
  const belt = mesh(new THREE.TorusGeometry(0.283, 0.036, 10, 40), M.navy, 0, 0.16, 0); belt.rotation.x = Math.PI / 2; spine.add(belt);
  spine.add(mesh(new RoundedBoxGeometry(0.11, 0.08, 0.05, 2, 0.015), M.crest, 0, 0.16, 0.3));
  // straps
  for (const s of [-1, 1]) {
    const strap = mesh(new RoundedBoxGeometry(0.06, 0.42, 0.05, 2, 0.02), M.navy, s * 0.17, 0.5, 0.2);
    strap.rotation.x = -0.25; spine.add(strap);
  }
  // Cable-reel backpack (signature prop)
  const reel = G(); reel.position.set(0, 0.42, -0.3); spine.add(reel);
  const drum = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.2, 28), M.navy); drum.rotation.z = Math.PI / 2; reel.add(drum);
  const coil = mesh(new THREE.TorusGeometry(0.165, 0.045, 10, 30), M.coil); coil.rotation.y = Math.PI / 2; reel.add(coil);
  const hub = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.26, 16), M.crest); hub.rotation.z = Math.PI / 2; reel.add(hub);
  const hookAnchor = G(); hookAnchor.position.set(0.16, -0.12, -0.05); reel.add(hookAnchor);

  // Neck + head
  const neck = G(); neck.position.y = 0.76; spine.add(neck);
  const head = G(); neck.add(head);
  const headC = G(); headC.position.y = 0.37; head.add(headC);
  const skull = mesh(new THREE.SphereGeometry(0.4, 40, 28), M.skin); skull.scale.set(1.04, 0.96, 0.96); headC.add(skull);
  // headset ear pucks + mic boom
  for (const s of [-1, 1]) {
    const puck = mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.08, 24), M.suitDark, s * 0.405, -0.02, -0.01);
    puck.rotation.z = Math.PI / 2; headC.add(puck);
  }

  // Helmet shell, crest, brim, headlamp, antenna
  const helmet = G(); helmet.rotation.x = -0.2; headC.add(helmet);
  helmet.add(mesh(new THREE.SphereGeometry(0.432, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.36), M.helmet));
  const crest = mesh(new THREE.TorusGeometry(0.43, 0.035, 8, 40, Math.PI * 0.62), M.crest);
  crest.rotation.set(0, Math.PI / 2, Math.PI * 0.19); helmet.add(crest);
  const brim = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 32, 1, false, -Math.PI / 2, Math.PI), M.helmet, 0, 0.19, 0.3);
  brim.scale.set(1.05, 1, 0.55); helmet.add(brim);
  const lampG = G(); lampG.position.set(0, 0.3, 0.33); lampG.rotation.x = 0.12; helmet.add(lampG);
  const housing = mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.08, 20), M.navy); housing.rotation.x = Math.PI / 2; lampG.add(housing);
  const lens = mesh(new THREE.CircleGeometry(0.06, 20), M.lens, 0, 0, 0.042); lampG.add(lens);
  const antennaG = G(); antennaG.position.set(0, 0.4, -0.12); helmet.add(antennaG);
  const stalk = mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.24, 8), M.navy, 0, 0.12, 0); antennaG.add(stalk);
  antennaG.add(mesh(new THREE.SphereGeometry(0.055, 16, 12), M.crest, 0, 0.26, 0));

  // Eyes
  const eyes = [];
  for (const s of [1, -1]) {      // s=+1 is Nodo's left (+x)
    const eg = G(); eg.position.set(s * 0.15, 0.03, 0.335); headC.add(eg);
    const lid = G(); eg.add(lid);
    const white = mesh(new THREE.SphereGeometry(0.108, 24, 18), M.white); white.scale.set(1, 1.18, 0.55); lid.add(white);
    const pup = G(); lid.add(pup);
    const p = mesh(new THREE.SphereGeometry(0.058, 18, 14), M.pupil, 0, 0, 0.045); p.scale.set(1, 1.12, 0.5); pup.add(p);
    pup.add(mesh(new THREE.SphereGeometry(0.019, 10, 8), M.lens, 0.022, 0.03, 0.07));
    eyes.push({ eg, lid, pup, s });
  }
  // Brows
  const brows = [];
  for (const s of [1, -1]) {
    const b = cap(0.024, 0.085, M.navy); b.rotation.z = Math.PI / 2; const bg = G(); bg.add(b);
    bg.position.set(s * 0.155, 0.2, 0.36); headC.add(bg); brows.push({ bg, s });
  }
  // Mouth: open ellipse + tongue, and a closed smile arc
  const mouthG = G(); mouthG.position.set(0, -0.165, 0.355); mouthG.rotation.x = -0.42; headC.add(mouthG);
  const mOpen = G(); mouthG.add(mOpen);
  const mo = mesh(new THREE.SphereGeometry(0.075, 20, 14), M.mouth); mo.scale.set(1, 1, 0.35); mOpen.add(mo);
  const tongue = mesh(new THREE.SphereGeometry(0.04, 14, 10), M.tongue, 0, -0.035, 0.012); tongue.scale.set(1.2, 0.6, 0.4); mOpen.add(tongue);
  const smileArc = mesh(new THREE.TorusGeometry(0.06, 0.014, 8, 20, Math.PI), M.mouth); mouthG.add(smileArc);

  // Arms
  function arm(s) {
    const sh = G(); sh.position.set(s * 0.31, 0.6, 0); spine.add(sh);
    sh.add(mesh(new THREE.SphereGeometry(0.1, 16, 12), M.suit));
    const up = cap(0.077, 0.17, M.suit); up.position.y = -0.155; sh.add(up);
    const el = G(); el.position.y = -0.3; sh.add(el);
    const fo = cap(0.07, 0.15, M.skin); fo.position.y = -0.14; el.add(fo);
    const cuff = mesh(new THREE.TorusGeometry(0.075, 0.025, 8, 20), M.glove, 0, -0.22, 0); cuff.rotation.x = Math.PI / 2; el.add(cuff);
    const wr = G(); wr.position.y = -0.28; el.add(wr);
    const palm = mesh(new THREE.SphereGeometry(0.105, 18, 14), M.glove, 0, -0.07, 0); palm.scale.set(1, 0.92, 0.82); wr.add(palm);
    const idx = G(); idx.position.set(-s * 0.03, -0.14, 0.03); wr.add(idx);
    const finger = cap(0.038, 0.12, M.glove); finger.position.y = -0.07; idx.add(finger);
    const th = G(); th.position.set(-s * 0.05, -0.07, 0.06); wr.add(th);
    const thumb = cap(0.042, 0.09, M.glove); thumb.position.y = 0.075; th.add(thumb);
    return { sh, el, wr, idx, th };
  }
  const armL = arm(1), armR = arm(-1);

  // Legs
  function leg(s) {
    const hp = G(); hp.position.set(s * 0.13, -0.02, 0); hips.add(hp);
    const th = cap(0.088, 0.2, M.suit); th.position.y = -0.18; hp.add(th);
    const kn = G(); kn.position.y = -0.36; hp.add(kn);
    const sh = cap(0.08, 0.17, M.suitDark); sh.position.y = -0.16; kn.add(sh);
    const an = G(); an.position.y = -0.31; kn.add(an);
    const boot = mesh(new RoundedBoxGeometry(0.2, 0.15, 0.32, 3, 0.06), M.navy, 0, -0.01, 0.05); an.add(boot);
    const sole = mesh(new RoundedBoxGeometry(0.21, 0.035, 0.33, 2, 0.015), M.crest, 0, -0.075, 0.05); an.add(sole);
    return { hp, kn, an };
  }
  const legL = leg(1), legR = leg(-1);

  // Headlamp beam (additive cone) + glow
  const beamMat = new THREE.MeshBasicMaterial({ color: PAL.cyan, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  beamMat.userData.outlineParameters = { visible: false };
  const beam = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.5, 24, 1, true), beamMat);
  beam.rotation.x = -Math.PI / 2; beam.position.z = 0.8; lampG.add(beam);

  // Tether cable (updated externally): a tube rebuilt per frame when visible.
  const all = { root, body, hips, spine, neck, head, helmet, antennaG, eyes, brows, mOpen, smileArc, mouthG, armL, armR, legL, legR, beamMat, lens, hookAnchor, reel };

  all.apply = (pose) => {
    const p = { ...NODO_DEFAULT, ...pose };
    const sq = p.squash;
    body.scale.set(1 + sq * 0.07, 1 - sq * 0.14, 1 + sq * 0.07);
    body.rotation.set(p.pitch, 0, p.roll);
    hips.position.y = p.bob;
    spine.rotation.set(p.lean, p.twist, p.sway);
    head.rotation.set(p.headX, p.headY, p.headZ);
    antennaG.rotation.set(p.antenna * 0.6, 0, p.antenna);
    armL.sh.rotation.set(p.shLx, p.shLy, p.shLz); armL.el.rotation.x = p.elL; armL.wr.rotation.z = p.wrL;
    armR.sh.rotation.set(p.shRx, p.shRy, p.shRz); armR.el.rotation.x = p.elR; armR.wr.rotation.z = p.wrR;
    for (const [a, pt, th, s] of [[armL, p.ptL, p.thL, 1], [armR, p.ptR, p.thR, -1]]) {
      a.idx.scale.setScalar(0.25 + 0.75 * pt); a.idx.visible = pt > 0.02;
      // thumb: tucked against palm (0) -> sticking up along hand +z (1)
      a.th.rotation.set(2.4 - 0.83 * th, 0, s * 0.35 * (1 - th));
      a.th.scale.setScalar(0.8 + 0.5 * th);
    }
    legL.hp.rotation.set(p.hipLx, 0, p.hipLz); legL.kn.rotation.x = p.knL; legL.an.rotation.x = p.ftL - p.knL * 0.35 - p.hipLx * 0.3;
    legR.hp.rotation.set(p.hipRx, 0, p.hipRz); legR.kn.rotation.x = p.knR; legR.an.rotation.x = p.ftR - p.knR * 0.35 - p.hipRx * 0.3;
    // face
    for (const e of eyes) {
      const open = Math.max(0.07, e.s > 0 ? p.eyeL : p.eyeR);
      e.lid.scale.set(1, open, 1);
      e.pup.position.set(p.lookX * 0.04, p.lookY * 0.04, 0);
    }
    for (const b of brows) {
      const raise = b.s > 0 ? p.browL : p.browR; const ang = b.s > 0 ? p.browAngL : p.browAngR;
      b.bg.position.y = 0.2 + raise * 0.045;
      b.bg.rotation.z = b.s * ang * 0.45;   // + => inner end up (worried/curious)
    }
    const open = Math.max(0, p.mouth);
    all.mOpen.visible = open > 0.06;
    all.mOpen.scale.set(p.mouthW * (0.75 + 0.35 * open), 0.25 + 0.95 * open, 1);
    all.smileArc.visible = open <= 0.14;
    all.smileArc.rotation.z = p.smile >= 0 ? Math.PI : 0;
    all.smileArc.scale.set(p.mouthW * (0.8 + 0.25 * Math.abs(p.smile)), Math.max(0.12, Math.abs(p.smile)), 1);
    all.smileArc.position.y = p.smile >= 0 ? 0.012 : -0.03;
    beamMat.opacity = 0.07 * p.lamp;
    beam.visible = p.lamp > 0.01;
    all.lens.material.color.set(p.lamp > 0.5 ? '#ffffff' : '#9fdcef');
  };
  all.apply({});
  return all;
}

// Named pose library (partial overrides of NODO_DEFAULT).
export const POSES = {
  idle: {},
  puzzled: { headX: -0.28, headZ: 0.16, headY: -0.12, shRx: -0.75, shRz: -0.1, shRy: 0.5, elR: -2.25, browL: 1, browR: 0.25, browAngL: 0.3, browAngR: -0.3,
    shLx: 0.25, shLz: 0.55, elL: -1.35, lookY: 0.7, lookX: -0.2, smile: -0.25, lean: -0.05 },
  nope: { shRx: -1.2, shRz: -0.2, elR: -1.35, ptR: 1, smile: 0.45, browL: -0.2, browR: -0.2, browAngL: -0.4, browAngR: -0.4, lean: 0.02 },
  crouch: { bob: -0.14, knL: 0.55, knR: 0.55, hipLx: -0.35, hipRx: -0.35, lean: 0.18, shLz: 0.55, shRz: -0.55, shLx: 0.35, shRx: 0.35, elL: -0.6, elR: -0.6, browL: 0.4, browR: 0.4, smile: 0.2 },
  stompUp: { bob: -0.05, hipRx: -1.1, knR: 1.25, hipLx: 0.05, knL: 0.25, shLz: 0.95, shRz: -0.95, shLx: -0.2, shRx: 0.3, elL: -0.4, elR: -0.4, lean: -0.08, browL: 0.7, browR: 0.7, smile: 0.9, mouth: 0.25 },
  stompDown: { bob: -0.16, hipRx: -0.25, knR: 0.35, hipLx: 0.1, knL: 0.55, shLz: 0.75, shRz: -0.75, shLx: 0.2, shRx: 0.2, elL: -0.7, elR: -0.7, lean: 0.12, squash: 0.35, browL: 0.3, browR: 0.3, smile: 0.9 },
  reach: { shLx: -1.45, shRx: -1.45, shLz: 0.25, shRz: -0.25, elL: -0.35, elR: -0.35, lean: 0.2, headX: -0.25, browL: 0.9, browR: 0.9, eyeL: 1.15, eyeR: 1.15, mouth: 0.35, smile: 0.4 },
  hold: { shLx: -1.0, shRx: -1.0, shLz: 0.38, shRz: -0.38, shLy: -0.45, shRy: 0.45, elL: -1.2, elR: -1.2, headX: 0.12, lean: 0.06, smile: 0.4, browL: 0.25, browR: 0.25 },
  inspect: { shLx: -1.05, shRx: -1.05, shLz: 0.38, shRz: -0.38, shLy: -0.45, shRy: 0.45, elL: -1.3, elR: -1.3, headX: 0.22, headZ: -0.1, lean: 0.1, browL: 0.5, browR: -0.15, browAngL: 0.35, browAngR: -0.25, eyeR: 0.75, lookY: -0.5, smile: 0.1, lamp: 1 },
  windup: { shLx: 0.6, shRx: 0.6, shLz: 0.3, shRz: -0.3, elL: -1.4, elR: -1.4, lean: -0.15, bob: -0.12, knL: 0.5, knR: 0.5, hipLx: -0.3, hipRx: -0.3, browL: 0.8, browR: 0.8, smile: 0.8 },
  toss: { shLx: -2.7, shRx: -2.7, shLz: 0.25, shRz: -0.25, elL: -0.15, elR: -0.15, lean: 0.15, bob: 0.05, hipLx: 0.2, hipRx: -0.4, knR: 0.4, browL: 1, browR: 1, mouth: 0.6, smile: 1 },
  surf: { bob: -0.13, hipLx: -0.1, hipRx: 0.1, hipLz: 0.38, hipRz: -0.38, knL: 0.55, knR: 0.55, shLz: 1.35, shRz: -1.35, shLx: -0.1, shRx: 0.1, elL: -0.35, elR: -0.35, lean: 0.12,
    browL: 0.9, browR: 0.9, eyeL: 1.1, eyeR: 1.1, mouth: 0.55, smile: 1, antenna: -0.3 },
  land: { bob: -0.24, knL: 1.0, knR: 1.0, hipLx: -0.7, hipRx: -0.7, hipLz: 0.2, hipRz: -0.2, lean: 0.35, shLz: 1.0, shRz: -1.0, shLx: -0.5, shRx: -0.5, elL: -0.5, elR: -0.5, squash: 0.45, eyeL: 0.6, eyeR: 0.6, smile: 0.3, browL: -0.2, browR: -0.2 },
  pointUp: { shRx: -2.45, shRz: -0.35, elR: -0.08, ptR: 1, headX: -0.42, headY: 0.18, shLz: 0.5, shLx: 0.2, elL: -1.2, browL: 0.8, browR: 0.8, lookY: 0.8, smile: 0.7, mouth: 0.1 },
  peek: { lean: 0.32, headX: 0.08, headY: 0.55, headZ: -0.1, shLx: -0.5, shLz: 0.3, elL: -1.4, shRx: 0.2, shRz: -0.3, elR: -0.6, lookX: 0.8, browL: 0.6, browR: 0.1, browAngL: 0.3, eyeL: 1.1, eyeR: 0.85, smile: 0, mouth: 0.15, lamp: 1 },
  fire: { shLx: -2.85, shLz: 0.15, elL: -0.05, ptL: 0, headX: -0.55, lean: -0.12, shRz: -0.9, shRx: 0.3, elR: -0.6, bob: -0.08, knL: 0.35, knR: 0.35, browL: 1, browR: 1, eyeL: 1.15, eyeR: 1.15, mouth: 0.5, smile: 0.6, lookY: 0.9 },
  yanked: { shLx: -3.0, shRx: -2.9, shLz: 0.12, shRz: -0.12, elL: 0, elR: -0.1, headX: -0.35, hipLx: 0.3, hipRx: -0.25, knL: 0.6, knR: 0.2, bob: 0.08, browL: 1.2, browR: 1.2, eyeL: 1.25, eyeR: 1.25, mouth: 0.95, mouthW: 0.8, smile: 0.2, antenna: 0.5 },
  flying: { pitch: 1.05, shLx: -2.95, shRx: -2.95, shLz: 0.18, shRz: -0.18, elL: -0.05, elR: -0.05, headX: -0.9, hipLx: 0.25, hipRx: -0.15, knL: 0.7, knR: 0.35, browL: 1, browR: 1, mouth: 0.75, smile: 1, eyeL: 1.15, eyeR: 1.15, antenna: 0.6 },
  sit: { bob: -0.43, hipLx: -1.35, hipRx: -1.25, hipLz: 0.2, hipRz: -0.2, knL: 0.25, knR: 0.35, lean: -0.15, shLx: 0.55, shRx: 0.55, shLz: 0.35, shRz: -0.35, elL: -0.15, elR: -0.15,
    headZ: 0.22, headX: 0.05, eyeL: 0.55, eyeR: 0.85, browL: 0.4, browR: -0.1, browAngL: 0.4, smile: 0.2, mouth: 0.1 },
  present: { shLx: -0.55, shLz: 1.25, shLy: -0.4, elL: -0.2, ptL: 0, shRz: -0.35, shRx: 0.1, elR: -0.9, headY: 0.55, headX: -0.1, twist: 0.25, lean: -0.04, browL: 0.8, browR: 0.8, smile: 0.9, mouth: 0.1, lookX: 0.7 },
  thumbsUp: { shRx: -0.35, shRz: -0.28, shRy: 0.35, elR: -1.75, thR: 1, ptR: 0, shLx: 0.25, shLz: 0.55, elL: -1.35, headZ: -0.12, headX: -0.05, browL: 0.7, browR: 0.9, eyeL: 0.12, smile: 1, mouth: 0, mouthW: 1.15, sway: 0.06 },
};
