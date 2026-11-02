// Paper cup dissection prop: two paperboard half-shells (with visible cut
// edges and rolled rim) around a thin translucent plastic film lining, coffee,
// a paint-on stain for the "paper soaks" demo and a stretchable film tent for
// the "bonded layers" tug. Thicknesses are exaggerated for legibility.
import * as THREE from 'three';
import { rng } from '../lib/anim.js';

export const CUP = { H: 1.6, rb: 0.5, rt: 0.7, paper: 0.035, film: 0.014 };
export const rAt = (y) => CUP.rb + (CUP.rt - CUP.rb) * (y / CUP.H);

function profile(off, y0 = 0.0, y1 = CUP.H, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const y = y0 + (y1 - y0) * (i / n); pts.push(new THREE.Vector2(rAt(y) + off, y)); }
  return pts;
}

function paperCanvas(seed, w = 512, h = 512, band = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = '#f3e5cc'; g.fillRect(0, 0, w, h);
  const r = rng(seed);
  for (let i = 0; i < 2600; i++) {
    g.strokeStyle = `rgba(150,110,70,${0.025 + r() * 0.05})`; g.lineWidth = 1;
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 3 + r() * 10;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  if (band) {
    // canvas y=0 is the top of the texture; lathe uv.y=1 at the rim (flipY)
    g.fillStyle = '#e8741c'; g.fillRect(0, h * 0.12, w, h * 0.035);
    g.fillStyle = 'rgba(31,107,58,0.9)'; g.fillRect(0, h * 0.175, w, h * 0.012);
  }
  return c;
}

function filmMaterial(opacity = 0.26) {
  const m = new THREE.MeshPhysicalMaterial({
    color: 0xe2f4fa, roughness: 0.08, metalness: 0, transparent: true, opacity,
    clearcoat: 1, clearcoatRoughness: 0.04, side: THREE.DoubleSide, depthWrite: false,
  });
  m.userData.glint = { value: 0 };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uGlint = m.userData.glint;
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uGlint;')
      .replace('#include <dithering_fragment>', `
        float fr = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);
        gl_FragColor.rgb += vec3(0.75, 0.92, 1.0) * fr * 0.55 + vec3(uGlint) * 0.35;
        gl_FragColor.a = clamp(gl_FragColor.a + fr * 0.62 + uGlint * 0.25, 0.0, 0.95);
        #include <dithering_fragment>`);
  };
  return m;
}

function seamStrip(phi, rIn, rOut, mat) {
  const ys = [0.0, CUP.H];
  const pos = [];
  for (const y of ys) {
    pos.push((rAt(y) + rIn) * Math.sin(phi), y, (rAt(y) + rIn) * Math.cos(phi));
    pos.push((rAt(y) + rOut) * Math.sin(phi), y, (rAt(y) + rOut) * Math.cos(phi));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
  g.setIndex([0, 1, 2, 2, 1, 3]);
  g.computeVertexNormals();
  return new THREE.Mesh(g, mat);
}

function rimArc(phi0, len, radius, tube, mat) {
  const grp = new THREE.Group();
  const t = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 48, len), mat);
  t.rotation.x = Math.PI / 2; t.castShadow = true;
  grp.add(t); grp.rotation.y = phi0 + len - Math.PI / 2;
  return grp;
}

export function createCup() {
  const group = new THREE.Group(); group.name = 'cup';
  const tilt = new THREE.Group(); group.add(tilt);
  const { H, rb, rt, paper } = CUP;

  const outerTex = new THREE.CanvasTexture(paperCanvas(3, 1024, 512, true)); outerTex.colorSpace = THREE.SRGBColorSpace;
  const outerMat = new THREE.MeshStandardMaterial({ map: outerTex, roughness: 0.82 });
  const edgeTex = new THREE.CanvasTexture((() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#e9d8b8'; g.fillRect(0, 0, 64, 256);
    g.fillStyle = '#cdb38a'; g.fillRect(18, 0, 28, 256);
    return c;
  })()); edgeTex.colorSpace = THREE.SRGBColorSpace;
  const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.9, side: THREE.DoubleSide });

  // stain canvas for the right half's inner face
  const stainBase = paperCanvas(9, 512, 512, false);
  const stainCanvas = document.createElement('canvas'); stainCanvas.width = stainCanvas.height = 512;
  const stainTex = new THREE.CanvasTexture(stainCanvas); stainTex.colorSpace = THREE.SRGBColorSpace;
  const innerPlain = new THREE.CanvasTexture(paperCanvas(9, 512, 512, false)); innerPlain.colorSpace = THREE.SRGBColorSpace;

  const halves = [];
  for (const side of ['L', 'R']) {
    const phi0 = side === 'R' ? 0 : Math.PI, len = Math.PI;
    const pivot = new THREE.Group(); tilt.add(pivot);
    const outer = new THREE.Mesh(new THREE.LatheGeometry(profile(paper), 48, phi0, len), outerMat);
    outer.castShadow = true; outer.receiveShadow = true;
    const innerMat = new THREE.MeshStandardMaterial({ map: side === 'R' ? stainTex : innerPlain, roughness: 0.88, side: THREE.BackSide });
    const inner = new THREE.Mesh(new THREE.LatheGeometry(profile(0), 48, phi0, len), innerMat);
    inner.receiveShadow = true;
    pivot.add(outer, inner);
    pivot.add(seamStrip(phi0, 0, paper, edgeMat), seamStrip(phi0 + len, 0, paper, edgeMat));
    pivot.add(rimArc(phi0, len, rt + paper * 0.5, 0.032, outerMat));
    // bottom (half disc) + base ring
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(rAt(0.06), 32, phi0 - Math.PI / 2, len), new THREE.MeshStandardMaterial({ map: innerPlain, roughness: 0.9, side: THREE.DoubleSide }));
    bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.06; pivot.add(bottom);
    halves.push({ pivot, side, innerMat });
  }

  // film lining (full revolution) + rim bead + bottom
  const lining = new THREE.Group(); tilt.add(lining);
  const filmMat = filmMaterial(0.26);
  const film = new THREE.Mesh(new THREE.LatheGeometry(profile(-CUP.film, 0.06, H, 16), 64), filmMat);
  film.renderOrder = 5; lining.add(film);
  const filmBottom = new THREE.Mesh(new THREE.CircleGeometry(rAt(0.06) - CUP.film, 48), filmMat);
  filmBottom.rotation.x = -Math.PI / 2; filmBottom.position.y = 0.062; filmBottom.renderOrder = 5; lining.add(filmBottom);
  const beadMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf7fb, roughness: 0.06, clearcoat: 1, transparent: true, opacity: 0.75 });
  const filmRim = new THREE.Mesh(new THREE.TorusGeometry(rt - CUP.film, 0.009, 8, 96), beadMat);
  filmRim.rotation.x = Math.PI / 2; filmRim.position.y = H; filmRim.renderOrder = 6; lining.add(filmRim);

  // coffee
  const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x5b3420, roughness: 0.18, metalness: 0.0 });
  const cremaMat = new THREE.MeshStandardMaterial({ color: 0x8a5532, roughness: 0.25 });
  const liquid = new THREE.Group(); lining.add(liquid);
  let liquidBody = null, liquidTop = null;

  // stretch tent + fibres (bonded-layer tug)
  const tentMat = filmMaterial(0.58);
  let tent = null;
  const fibreMat = new THREE.MeshStandardMaterial({ color: 0xa97f52, roughness: 0.9 });
  const fibres = new THREE.Group(); tilt.add(fibres);
  const fibreMeshes = [];
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 1, 5), fibreMat);
    fibres.add(m); fibreMeshes.push(m);
  }

  const api = {
    group, tilt, halves, lining, filmMat, tentMat,
    // k: 0 closed .. 1 exploded. Halves slide out and turn their inner faces to camera.
    setOpen(k, spread = 1.02, turn = 0.92, back = 0.32) {
      for (const h of halves) {
        const s = h.side === 'R' ? 1 : -1;
        h.pivot.position.set(s * spread * k, 0, -back * k);
        h.pivot.rotation.y = s * turn * k;
      }
    },
    setLevel(level, wob = 0) {
      if (liquidBody) { liquidBody.geometry.dispose(); liquid.remove(liquidBody); liquidBody = null; }
      if (liquidTop) { liquidTop.geometry.dispose(); liquid.remove(liquidTop); liquidTop = null; }
      if (level <= 0.07) return;
      liquidBody = new THREE.Mesh(new THREE.LatheGeometry(profile(-CUP.film - 0.012, 0.066, level, 8), 48), coffeeMat);
      liquid.add(liquidBody);
      liquidTop = new THREE.Mesh(new THREE.CircleGeometry(rAt(level) - CUP.film - 0.012, 48), cremaMat);
      liquidTop.rotation.x = -Math.PI / 2 + wob * 0.06; liquidTop.rotation.y = wob * 0.4; liquidTop.position.y = level;
      liquid.add(liquidTop);
    },
    // stain on the right half's inner face; amount 0..1 grows a soaked blot
    setStain(amount, u = 0.5, v = 0.55) {
      const g = stainCanvas.getContext('2d');
      g.drawImage(stainBase, 0, 0);
      if (amount > 0.001) {
        const r = rng(21);
        const R = 30 + amount * 120;
        for (let i = 0; i < 26; i++) {
          const a = r() * Math.PI * 2, d = r() * R * 0.45, rr = R * (0.45 + r() * 0.4);
          const x = u * 512 + Math.cos(a) * d, y = (1 - v) * 512 + Math.sin(a) * d * 1.25;
          const gr = g.createRadialGradient(x, y, 0, x, y, rr);
          gr.addColorStop(0, `rgba(96,58,32,${0.22 * Math.min(1, amount * 2)})`);
          gr.addColorStop(0.8, `rgba(110,68,38,${0.16 * Math.min(1, amount * 2)})`);
          gr.addColorStop(1, 'rgba(110,68,38,0)');
          g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
        }
        // darker tide-line ring characteristic of wicking
        g.strokeStyle = `rgba(80,46,24,${0.35 * Math.min(1, amount * 1.6)})`; g.lineWidth = 5;
        g.beginPath(); g.ellipse(u * 512, (1 - v) * 512, R * 0.82, R * 1.0, 0, 0, 7); g.stroke();
      }
      stainTex.needsUpdate = true;
    },
    // film peel: s 0..1 stretches a tent of film from the rim toward `hand` (cup-local)
    setTent(s, hand, phiC = -Math.PI / 2, width = 0.55) {
      if (tent) { tent.geometry.dispose(); tilt.remove(tent); tent = null; }
      fibres.visible = s > 0.02;
      if (s <= 0.02) return;
      const N = 18, M = 10, y = H - 0.005;
      const pos = [], idx = [];
      const rimR = rt - CUP.film;
      const hp = new THREE.Vector3().fromArray(hand);
      for (let j = 0; j <= M; j++) {
        const kj = j / M;
        for (let i = 0; i <= N; i++) {
          const phi = phiC + (i / N - 0.5) * width;
          const base = new THREE.Vector3(rimR * Math.sin(phi), y, rimR * Math.cos(phi));
          const tip = hp.clone().add(base.clone().sub(new THREE.Vector3(rimR * Math.sin(phiC), y, rimR * Math.cos(phiC))).multiplyScalar(0.12));
          const k = Math.pow(kj, 0.85) * s;
          const p = base.clone().lerp(tip, k);
          p.y -= Math.sin(kj * Math.PI) * 0.05 * s; // sag
          pos.push(p.x, p.y, p.z);
        }
      }
      for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) {
        const a = j * (N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      tent = new THREE.Mesh(g, tentMat); tent.renderOrder = 7; tilt.add(tent);
      // fibres: paperboard rim -> lower tent edge, show the bond resisting
      const up = new THREE.Vector3(0, 1, 0);
      fibreMeshes.forEach((m, n) => {
        const i = Math.round((n + 0.5) / fibreMeshes.length * N);
        const phi = phiC + (i / N - 0.5) * width;
        const a = new THREE.Vector3((rt + CUP.paper * 0.5) * Math.sin(phi), H + 0.02, (rt + CUP.paper * 0.5) * Math.cos(phi));
        const row = Math.min(M, 2 + (n % 3));
        const b = new THREE.Vector3(pos[(row * (N + 1) + i) * 3], pos[(row * (N + 1) + i) * 3 + 1], pos[(row * (N + 1) + i) * 3 + 2]);
        const len = a.distanceTo(b);
        m.position.copy(a).lerp(b, 0.5);
        m.scale.set(1, Math.max(0.001, len), 1);
        m.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
      });
    },
    setGlint(v) { filmMat.userData.glint.value = v; },
  };
  api.setOpen(0); api.setLevel(0); api.setStain(0); api.setTent(0, [0, 0, 0]);
  return api;
}

// Small glass beaker with coffee, held by Tinku for the pour.
export function createBeaker() {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd8ecf0, roughness: 0.06, transparent: true, opacity: 0.3, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
  const pts = [new THREE.Vector2(0.0, 0), new THREE.Vector2(0.16, 0), new THREE.Vector2(0.17, 0.02), new THREE.Vector2(0.17, 0.36), new THREE.Vector2(0.19, 0.39)];
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), glass); body.renderOrder = 8; g.add(body);
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0x5b3420, roughness: 0.2 }));
  fill.position.y = 0.12; g.add(fill);
  const marks = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.008), marks); m.position.set(0.06, 0.12 + i * 0.07, 0.172); g.add(m); }
  return { group: g, fill };
}
