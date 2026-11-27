// ------------------------------------------------------------------ props (illustration): an ORIGINAL cooler of generic bottles
// with first-name labels (no Coca-Cola logo, red, contour bottle or typeface; illustrative common first names), a plain logo
// mark on the reverse of each label, a search light, a stream of name cards, two shopper pawns (SAM, MIA), a ribbon and bow.
// Palette from app.werbens.com.
const HALF = Math.PI / 2;
const stage = new THREE.Group(); scene.add(stage);
const COLS = 5, ROWS = 5, SPX = 0.07, SHELF0 = 0.085, SHELF_DY = 0.115, CW = 0.4, CD = 0.13, CH = SHELF0 + ROWS * SHELF_DY + 0.02;
const COOLER_X = [-0.92, -0.46, 0, 0.46, 0.92, 1.38], HERO = 2;
const HERO_NAMES = ["LEO", "AVA", "NOAH", "ZOE", "MAX", "ELLA", "JACK", "RUBY", "OWEN", "LILY", "ALEX", "SAM", "NINA", "EVAN", "ROSE", "ADAM", "IRIS", "OMAR", "MIA", "JADE", "TOM", "AMY", "BEN", "LUCY", "KAI"]; // row-major from the bottom shelf
const SAM_I = 11, MIA_I = 18;
const OTHER_NAMES = ("LIAM EMMA OLIVIA ETHAN GRACE HENRY CHLOE LUCAS SOFIA JAMES ISLA FINN HANNA LEAH LUKE NORA ELI MAYA JOEL TARA ZANE ANNA COLE ERIN DEAN " +
  "HOLLY IVAN JUNE KYLE LANA MILES NADIA OSCAR PIA QUINN RHYS SARA THEO UMA VERA WADE YARA ZARA ARLO BELLA CARL DAISY EDEN FELIX GIA HUGO INES JUDE KIRA " +
  "LOLA MARCO NIA OTTO PAIGE RAJ SKYE TESS VICTOR WREN YUSUF ZEKE ALMA BRUNO CLARA DARIO ELENA FAYE GABE HAZEL IGOR JONAH KEIRA LEON MOLLY NICO OLGA PERCY " +
  "REX STELLA TOBY ULLA VINCE WILLA AIDEN BRYN CORA DREW EVIE FRED GINA HARRY ILSE JASON KATE LIZ MIKE NOEL OLLIE PETRA RENEE SEAN TINA VIOLA WALT AMIR " +
  "BETH CHRIS DORA EZRA FLORA GREG HEIDI ISAAC JESS").split(" ");
const ALL_NAMES = [...HERO_NAMES, ...OTHER_NAMES].slice(0, 150);
// label atlas: 4 × 38 cells of 512 × 64; name centred at u = 0.5 (bottle front), plain logo mark split across u = 0/1 (back)
const AT_C = 4, AT_R = 38, CELL_W = 512, CELL_H = 64;
const ATLAS = (() => { const cv = document.createElement("canvas"); cv.width = AT_C * CELL_W; cv.height = AT_R * CELL_H; const k = cv.getContext("2d");
  ALL_NAMES.forEach((nm, i) => { const x0 = (i % AT_C) * CELL_W, y0 = Math.floor(i / AT_C) * CELL_H; k.save(); k.beginPath(); k.rect(x0, y0, CELL_W, CELL_H); k.clip();
    k.fillStyle = "#F0FDFA"; k.fillRect(x0, y0, CELL_W, CELL_H); k.fillStyle = "#7FE7DC"; k.fillRect(x0, y0 + 4, CELL_W, 5); k.fillRect(x0, y0 + CELL_H - 9, CELL_W, 5);
    k.fillStyle = "#0F172A"; k.font = "700 40px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, x0 + CELL_W / 2, y0 + CELL_H / 2 + 2);
    for (const cx of [x0, x0 + CELL_W]) { k.strokeStyle = "#316879"; k.lineWidth = 7; k.beginPath(); k.arc(cx, y0 + CELL_H / 2, 17, 0, Math.PI * 2); k.stroke(); k.fillStyle = "#316879"; k.beginPath(); k.arc(cx, y0 + CELL_H / 2, 6, 0, Math.PI * 2); k.fill(); }
    k.restore(); });
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
const labelTex = (i) => { const t = ATLAS.clone(); t.repeat.set(1 / AT_C, 1 / AT_R); t.offset.set((i % AT_C) / AT_C, 1 - (Math.floor(i / AT_C) + 1) / AT_R); t.needsUpdate = true; return t; };
// bottle: generic lathe profile (straight body, round shoulder, neck), dark teal glass look; mint cap
const BOTTLE_GEO = new THREE.LatheGeometry([[0, 0], [0.0132, 0], [0.0145, 0.004], [0.0145, 0.055], [0.0128, 0.062], [0.0072, 0.071], [0.006, 0.081], [0.0064, 0.0835], [0, 0.0835]].map(([x, y]) => new THREE.Vector2(x, y)), 36);
const CAP_GEO = new THREE.CylinderGeometry(0.0068, 0.0068, 0.008, 24), LABEL_GEO = new THREE.CylinderGeometry(0.0152, 0.0152, 0.026, 48, 1, true, Math.PI, Math.PI * 2);
const M = { glass: mat("#1D5560", { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), cap: mat(C3.mint, { roughness: 0.35 }), frame: mat(C3.ink, { roughness: 0.45, clearcoat: 0.6 }),
  back: new THREE.MeshStandardMaterial({ color: "#0E2630", emissive: "#7FE7DC", emissiveIntensity: 0.16, roughness: 0.8 }), shelf: mat("#64748B", { roughness: 0.45, clearcoat: 0.4 }),
  strip: new THREE.MeshBasicMaterial({ color: "#7FE7DC", toneMapped: false }), header: mat(C3.teal, { roughness: 0.5 }), pawn: mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 }),
  pawn2: mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 }), ribbon: mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.25 }) };
const box = (w, h, d, m, x = 0, y = 0, z = 0, r = 0.002) => { const o = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o; };
// coolers: open-front cabinet, lit back panel, five shelves with a light strip, header
const COOLERS = COOLER_X.map((cx, ci) => { const g = new THREE.Group(); g.position.set(cx, 0, 0); stage.add(g);
  g.add(box(CW, CH, 0.012, M.back, 0, CH / 2, -CD / 2, 0.003), box(0.014, CH + 0.04, CD, M.frame, -CW / 2, (CH + 0.04) / 2, 0, 0.004), box(0.014, CH + 0.04, CD, M.frame, CW / 2, (CH + 0.04) / 2, 0, 0.004),
    box(CW + 0.014, 0.05, CD + 0.01, M.header, 0, CH + 0.025, 0.003, 0.006), box(CW + 0.014, SHELF0 - 0.004, CD, M.frame, 0, (SHELF0 - 0.004) / 2, 0, 0.004));
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(CW * 0.82, 0.008), M.strip); hs.position.set(0, CH + 0.025, CD / 2 + 0.009); g.add(hs);
  for (let r = 1; r < ROWS; r++) { g.add(box(CW - 0.014, 0.004, CD - 0.01, M.shelf, 0, SHELF0 + r * SHELF_DY - 0.002, 0, 0.001)); const st = new THREE.Mesh(new THREE.PlaneGeometry(CW - 0.02, 0.0025), M.strip); st.position.set(0, SHELF0 + r * SHELF_DY - 0.002, CD / 2 - 0.004); g.add(st); }
  g.userData.bottles = []; return g; });
// 150 bottles (6 coolers × 25), each with its own label (atlas cell); hero cooler bottles are individually animated
const BOTTLES = [];
COOLERS.forEach((g, ci) => { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const local = r * COLS + c, idx = ci === HERO ? local : 25 + (ci < HERO ? ci : ci - 1) * 25 + local;
  const b = new THREE.Group(); b.position.set((c - 2) * SPX, SHELF0 + r * SHELF_DY, 0.012); g.add(b);
  const body = new THREE.Mesh(BOTTLE_GEO, M.glass); body.castShadow = true; b.add(body); const cap = new THREE.Mesh(CAP_GEO, M.cap); cap.position.y = 0.0875; b.add(cap);
  const lm = new THREE.MeshStandardMaterial({ map: labelTex(idx), roughness: 0.55, emissive: "#7FE7DC", emissiveMap: null, emissiveIntensity: 0 }); const lab = new THREE.Mesh(LABEL_GEO, lm); lab.position.y = 0.031; b.add(lab);
  b.userData = { ci, r, c, local, idx, lab, lm, home: b.position.clone() }; g.userData.bottles.push(b); BOTTLES.push(b); } });
const HERO_B = COOLERS[HERO].userData.bottles, SAM_B = HERO_B[SAM_I], MIA_B = HERO_B[MIA_I];
const bottleWorld = (b) => { const v = new THREE.Vector3(); b.getWorldPosition(v); return v; };
// search light: soft additive glow + the hero spot follow it
const scanGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scanGlow.renderOrder = 8; scanGlow.scale.setScalar(0.11); stage.add(scanGlow);
const ringTex = canvasTex(256, 256, (k, w) => { const c = w / 2; k.strokeStyle = "rgba(127,231,220,1)"; k.lineWidth = 12; k.beginPath(); k.arc(c, c, c * 0.8, 0, Math.PI * 2); k.stroke(); });
const scanRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })); scanRing.renderOrder = 9; scanRing.scale.setScalar(0.06); stage.add(scanRing);
// name-card stream (proof 2): cards rush past in front of the cooler; SAM's card stops and pops
const cardTex = (nm, hi) => canvasTex(320, 96, (k, w, h) => { k.fillStyle = hi ? "#F0FDFA" : "#E2F2EF"; k.beginPath(); k.roundRect(3, 3, w - 6, h - 6, 18); k.fill(); k.fillStyle = "#7FE7DC"; k.fillRect(20, 10, w - 40, 6); k.fillRect(20, h - 16, w - 40, 6);
  k.fillStyle = "#0F172A"; k.font = "700 50px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, w / 2, h / 2 + 2); });
const STREAM_NAMES = ["LIAM", "EMMA", "NOAH", "ZOE", "OSCAR", "RUBY", "SAM", "LILY", "JACK", "NORA", "MAX", "ELLA", "OWEN", "AVA", "FINN", "ROSE"];
const STREAM = STREAM_NAMES.map((nm, i) => { const sam = nm === "SAM"; const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.036), new THREE.MeshBasicMaterial({ map: cardTex(nm, sam), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
  m.renderOrder = sam ? 12 : 11; stage.add(m); m.userData = { i, sam }; return m; });
const samCardGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); samCardGlow.renderOrder = 10; stage.add(samCardGlow);
// shoppers: SAM (finder) and MIA (friend); pawns at shopper scale (taller than the bottles)
function makePawn(m) { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.038, 0.12, 28), m); b.position.y = 0.06; b.castShadow = true; g.add(b); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.034, 28, 20), m); hd.position.y = 0.155; hd.castShadow = true; g.add(hd); return g; }
const badgeTex = (nm) => canvasTex(192, 72, (k, w, h) => { k.fillStyle = "#316879"; k.beginPath(); k.roundRect(2, 2, w - 4, h - 4, 14); k.fill(); k.fillStyle = "#F0FDFA"; k.font = "700 44px SG"; k.textAlign = "center"; k.textBaseline = "middle"; k.fillText(nm, w / 2, h / 2 + 2); });
const shopper = makePawn(M.pawn), friend = makePawn(M.pawn2); stage.add(shopper, friend);
for (const [p, nm] of [[shopper, "SAM"], [friend, "MIA"]]) { const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.019), new THREE.MeshBasicMaterial({ map: badgeTex(nm), transparent: true, toneMapped: false })); bd.position.set(0, 0.085, 0.0355); bd.rotation.x = -0.12; p.add(bd); }
// gift: ribbon ring round the body + a vertical band + bow at the neck (on MIA's bottle)
const giftG = new THREE.Group(); MIA_B.add(giftG);
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0152, 0.0022, 10, 40), M.ribbon); ring.rotation.x = HALF; ring.position.y = 0.045; giftG.add(ring);
  for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0024, 10, 24), M.ribbon); loop.position.set(s * 0.008, 0.075, 0.008); loop.rotation.set(0, s * 0.5, s * 0.6); giftG.add(loop); } }
const findRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthWrite: false, opacity: 0, toneMapped: false })); findRing.renderOrder = 9; stage.add(findRing);
