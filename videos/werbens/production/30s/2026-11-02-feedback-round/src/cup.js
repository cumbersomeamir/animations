// Procedural hero objects for "Satisfying Product Theatre": a takeaway cup (body, sleeve, lid, glass shell, liquid),
// geometrically similar across sizes so the size difference is physically honest (scale = (ml/300)^(1/3)).
import * as THREE from "three";

export const BASE = { h: 1.0, rb: 0.255, rt: 0.36 }; // the 300 ml cup
export const radiusAt = (c, y) => c.rb + (c.rt - c.rb) * (y / c.h);
// volume of the frustum from 0..y (arbitrary units) and its inverse → fill heights for given ml
function vol(c, y) { const r0 = c.rb, r1 = radiusAt(c, y); return (Math.PI * y / 3) * (r0 * r0 + r0 * r1 + r1 * r1); }
export function levelFor(c, ml) { // nominal ml = volume to 0.92 h
  const full = vol(c, c.h * 0.92), target = (ml / c.ml) * full; let lo = 0, hi = c.h;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (vol(c, m) < target) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

function sleeveTexture(letter) {
  const cv = document.createElement("canvas"); cv.width = 1024; cv.height = 256; const g = cv.getContext("2d");
  g.fillStyle = "#F7F5FB"; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = "#6234FB"; g.font = "170px IDBlack"; g.textAlign = "center"; g.textBaseline = "middle";
  for (const x of [0, 512, 1024]) g.fillText(letter, x, 136);
  g.fillStyle = "#CCC0F7"; g.fillRect(0, 18, 1024, 8); g.fillRect(0, 230, 1024, 8);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function makeCup(ml, letter) {
  const k = Math.cbrt(ml / 300), c = { h: BASE.h * k, rb: BASE.rb * k, rt: BASE.rt * k, ml, k };
  const g = new THREE.Group();
  // outer profile (closed bottom), slight rounded heel and rolled rim
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(c.rb - 0.02 * k, 0), new THREE.Vector2(c.rb, 0.02 * k)];
  for (let i = 1; i <= 12; i++) { const y = (i / 12) * c.h; pts.push(new THREE.Vector2(radiusAt(c, y), y)); }
  pts.push(new THREE.Vector2(c.rt + 0.018 * k, c.h + 0.004), new THREE.Vector2(c.rt + 0.012 * k, c.h + 0.02 * k), new THREE.Vector2(c.rt - 0.01 * k, c.h + 0.012 * k));
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: "#6234FB", roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12, transparent: true });
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), bodyMat); body.castShadow = true; body.receiveShadow = true; g.add(body);
  // printed sleeve band with the size letter (front + back)
  const sp = []; for (let i = 0; i <= 6; i++) { const y = c.h * (0.36 + 0.3 * (i / 6)); sp.push(new THREE.Vector2(radiusAt(c, y) + 0.006, y)); }
  const sleeveMat = new THREE.MeshPhysicalMaterial({ map: sleeveTexture(letter), roughness: 0.55, clearcoat: 0.3, transparent: true });
  const sleeve = new THREE.Mesh(new THREE.LatheGeometry(sp, 96), sleeveMat); sleeve.castShadow = true; g.add(sleeve);
  // lid: lavender dome on a pivot at the back of the rim (it flips open)
  const lp = [new THREE.Vector2(0, 0.085 * k), new THREE.Vector2(c.rt * 0.55, 0.075 * k), new THREE.Vector2(c.rt * 0.86, 0.05 * k), new THREE.Vector2(c.rt + 0.03 * k, 0.03 * k), new THREE.Vector2(c.rt + 0.03 * k, 0), new THREE.Vector2(c.rt - 0.01 * k, 0)];
  const lidMat = new THREE.MeshPhysicalMaterial({ color: "#CCC0F7", roughness: 0.4, clearcoat: 0.6, transparent: true });
  const lidPivot = new THREE.Group(); lidPivot.position.set(0, c.h + 0.01, -c.rt); g.add(lidPivot);
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lp, 72), lidMat); lid.position.set(0, 0, c.rt); lid.castShadow = true; lidPivot.add(lid);
  // glass shell (for the measuring transform) and liquid
  const glassMat = new THREE.MeshPhysicalMaterial({ color: "#FFFFFF", roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.LatheGeometry(pts.slice(1), 96), glassMat); g.add(glass);
  const liqMat = new THREE.MeshPhysicalMaterial({ color: "#D9BE9F", roughness: 0.3, clearcoat: 0.5, transparent: true, opacity: 0 });
  const liquid = new THREE.Mesh(new THREE.BufferGeometry(), liqMat); liquid.castShadow = false; g.add(liquid);
  const extraMat = new THREE.MeshPhysicalMaterial({ color: "#5B2FF0", emissive: "#4A1FD6", emissiveIntensity: 0.3, roughness: 0.55, clearcoat: 0, transparent: true, opacity: 0 });
  const extra = new THREE.Mesh(new THREE.BufferGeometry(), extraMat); g.add(extra);
  // liquid band geometry between two heights (rebuilt only when heights change)
  const band = (y0, y1) => { const p = [new THREE.Vector2(0, y0), new THREE.Vector2(radiusAt(c, y0) * 0.93, y0), new THREE.Vector2(radiusAt(c, y1) * 0.93, y1), new THREE.Vector2(0, y1)]; return new THREE.LatheGeometry(p, 72); };
  let lk = "", ek = "";
  function setLiquid(y0, y1, op) { const key = `${y0.toFixed(4)}-${y1.toFixed(4)}`; if (key !== lk) { liquid.geometry.dispose(); liquid.geometry = band(y0, Math.max(y0 + 1e-4, y1)); lk = key; } liqMat.opacity = op; liquid.visible = op > 0.01 && y1 > y0 + 1e-3; }
  function setExtra(y0, y1, op) { const key = `${y0.toFixed(4)}-${y1.toFixed(4)}`; if (key !== ek) { extra.geometry.dispose(); extra.geometry = band(y0, Math.max(y0 + 1e-4, y1)); ek = key; } extraMat.opacity = op; extra.visible = op > 0.01 && y1 > y0 + 1e-3; }
  function setGlass(u) { // 0 = solid violet cup, 1 = clear measuring glass
    bodyMat.opacity = 1 - 0.88 * u; sleeveMat.opacity = 1 - u; glassMat.opacity = 0.22 * u; bodyMat.depthWrite = u < 0.05; sleeveMat.depthWrite = u < 0.05;
    body.castShadow = u < 0.5;
  }
  return { group: g, c, body, sleeve, lidPivot, lid, setLiquid, setExtra, setGlass, bodyMat, lidMat, sleeveMat, extra };
}

// soft radial contact-shadow decal (tightens and darkens as the object approaches the ground)
let SHADOW_TEX = null;
export function contactShadow(r) {
  if (!SHADOW_TEX) {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const g = cv.getContext("2d");
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128); grd.addColorStop(0, "rgba(27,20,51,0.95)"); grd.addColorStop(0.45, "rgba(27,20,51,0.5)"); grd.addColorStop(1, "rgba(27,20,51,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256); SHADOW_TEX = new THREE.CanvasTexture(cv);
  }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, opacity: 0.6 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.003; m.userData.r = r; m.renderOrder = 1; return m;
}
