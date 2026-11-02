// The recurring cast of the Werbens education series. Original designs; palette sampled from the Werbens icon
// (violet #6234FB, lavender #CCC0F7, pale lavender #F0EAFC, white #FEFEFD) + derived ink #1B1433.
import * as THREE from "three";
import { buildCharacter } from "./character.js";
import { clamp } from "../lib/anim.js";

export const PALETTE = {
  violet: "#6234FB", violetDeep: "#4A1FD6", lavender: "#CCC0F7", pale: "#F0EAFC", white: "#FEFEFD", ink: "#1B1433",
  stage: "#140B33", stage2: "#22125A",
};

// PIP — the ad director / host. Silhouette: violet capsule, tilted lavender beret with stalk, headset boom mic.
export const PIP = {
  name: "Pip", shape: "capsule", radius: 0.36, length: 0.5, legLen: 0.4, legR: 0.062, legGap: 0.13,
  color: PALETTE.violet, limbColor: "#5328EA", handColor: PALETTE.white, shoeColor: PALETTE.ink,
  eye: { y: 0.93, sep: 0.175, rx: 0.088, ry: 0.112, rz: 0.06, pupil: 0.044 },
  brow: { r: 0.02, len: 0.085, gap: 0.03, lift: 0.05 },
  mouth: { y: 0.76, w: 0.16 },
  shoulder: { x: 0.33, y: 0.56, z: 0.02 }, upper: 0.34, fore: 0.33, armR: 0.042, handR: 0.074,
  accessories({ THREE, torso, surfZ, mat, inkMat, S }) {
    const yh = S.radius + S.length;
    const beret = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.27, 40, 20), mat(PALETTE.lavender, { roughness: 0.75, clearcoat: 0.1, sheen: 1, sheenColor: new THREE.Color("#ffffff"), sheenRoughness: 0.6 }));
    cap.scale.set(1, 0.34, 1); beret.add(cap);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.022, 10, 40), mat("#B6A6F2", { roughness: 0.7 }));
    band.rotation.x = Math.PI / 2; band.position.y = -0.03; beret.add(band);
    const stalk = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.05, 4, 8), inkMat); stalk.position.y = 0.1; beret.add(stalk);
    beret.position.set(-0.05, yh + 0.28, -0.02); beret.rotation.set(-0.12, 0, 0.32);
    beret.children.forEach((m) => (m.castShadow = true));
    torso.add(beret);
    // headset: ear cup + boom to the mouth corner
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 24), inkMat);
    ear.rotation.z = Math.PI / 2; ear.position.set(S.radius - 0.005, S.eye.y - 0.02, 0); torso.add(ear);
    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.014, 8, 20), mat(PALETTE.lavender)); pad.rotation.y = Math.PI / 2; pad.position.set(S.radius + 0.025, S.eye.y - 0.02, 0); torso.add(pad);
    const mx = 0.1, my = S.mouth.y + 0.005;
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(S.radius + 0.02, S.eye.y - 0.04, 0.02), new THREE.Vector3(S.radius - 0.02, my - 0.03, 0.3), new THREE.Vector3(mx + 0.05, my - 0.01, surfZ(mx, my) + 0.03));
    const boom = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.009, 8), inkMat); torso.add(boom);
    const mic = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), mat("#2A2050", { roughness: 0.8 })); mic.position.copy(curve.getPoint(1)); torso.add(mic);
    [ear, boom, mic].forEach((m) => (m.castShadow = true));
    return { beret, update(p) { beret.rotation.z = 0.32 + (p.beretTilt || 0); beret.position.y = yh + 0.28 + (p.beretLift || 0); } };
  },
};

// QUIBBLE — the sceptical customer. Silhouette: tall pale rounded block, round ink glasses, single top curl, heavy brows.
export const QUIBBLE = {
  name: "Quibble", shape: "box", box: { w: 0.6, h: 1.3, d: 0.46, round: 0.18 }, legLen: 0.36, legR: 0.066, legGap: 0.15,
  color: "#EEE9FB", limbColor: "#C9BDF4", handColor: PALETTE.white, shoeColor: PALETTE.ink, lidColor: "#E2DAFA",
  bodyMat: { roughness: 0.55, clearcoat: 0.35 },
  eye: { y: 1.02, sep: 0.21, rx: 0.068, ry: 0.082, rz: 0.05, pupil: 0.036 },
  brow: { r: 0.027, len: 0.105, gap: 0.05, lift: 0.055 },
  mouth: { y: 0.8, w: 0.15 },
  shoulder: { x: 0.31, y: 0.62, z: 0.0 }, upper: 0.38, fore: 0.37, armR: 0.045, handR: 0.074,
  accessories({ THREE, torso, surfZ, inkMat, S }) {
    const glasses = new THREE.Group(); torso.add(glasses);
    const z = surfZ(0, S.eye.y) + 0.06;
    const lensMat = new THREE.MeshPhysicalMaterial({ color: "#ffffff", transparent: true, opacity: 0.16, roughness: 0.05, clearcoat: 1, depthWrite: false });
    for (const side of [-1, 1]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.014, 10, 40), inkMat); rim.position.set(side * S.eye.sep / 2, 0, 0); glasses.add(rim);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.094, 32), lensMat); lens.position.set(side * S.eye.sep / 2, 0, -0.002); glasses.add(lens);
      const temple = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), inkMat);
      temple.rotation.x = Math.PI / 2; temple.position.set(side * (S.eye.sep / 2 + 0.1), 0.02, -0.15); glasses.add(temple);
      rim.castShadow = true;
    }
    const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.01, 6, 16, Math.PI), inkMat); bridge.position.y = 0.005; glasses.add(bridge);
    glasses.position.set(0, S.eye.y, z);
    // top curl
    const curl = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 10, 30, Math.PI * 1.55), inkMat);
    curl.position.set(0.05, S.box.h + 0.045, 0); curl.rotation.set(0, 0.3, 0.6); curl.castShadow = true; torso.add(curl);
    return {
      glasses, curl,
      update(p) {
        const s = clamp(p.glassesSlip || 0, 0, 1.2);
        glasses.position.y = S.eye.y - s * 0.085; glasses.rotation.x = s * 0.18; glasses.position.z = z + s * 0.012;
        curl.rotation.z = 0.6 + (p.curlBounce || 0);
      },
    };
  },
};

export const makePip = () => buildCharacter(PIP);
export const makeQuibble = () => buildCharacter(QUIBBLE);
