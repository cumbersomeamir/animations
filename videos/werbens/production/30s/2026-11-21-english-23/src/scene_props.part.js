// ------------------------------------------------------------------ props (illustration): an ORIGINAL music-year card (no Spotify logo,
// colours or UI; no real user data; abstract bars, discs and an avatar; no text), a share tree of little paths on the floor, friend
// pawns, listening discs, a generic ad board, a brand tab. Palette from app.werbens.com.
const HALF = Math.PI / 2, STAND_H = 0.014, CW = 0.09, CH = 0.15, CT = 0.004, CARD_Y = STAND_H + CH / 2, FY = 0.0018;
const stage = new THREE.Group(); scene.add(stage); const stageSh = contactShadow();
// card face background: 135° app.werbens.com gradient (#7FE7DC → #316879); back: teal with the brand tab
const FACE_TEX = canvasTex(360, 600, (k, w, h) => { const g = k.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#7FE7DC"); g.addColorStop(1, "#316879"); k.fillStyle = g; k.beginPath(); k.roundRect(0, 0, w, h, 34); k.fill();
  k.fillStyle = "rgba(15,23,42,0.18)"; k.beginPath(); k.roundRect(18, 300, w - 36, 262, 22); k.fill(); });
const BACK_TEX = canvasTex(360, 600, (k, w, h) => { k.fillStyle = "#316879"; k.beginPath(); k.roundRect(0, 0, w, h, 34); k.fill(); k.fillStyle = "rgba(127,231,220,0.16)"; for (let i = 0; i < 7; i++) { k.beginPath(); k.arc(w / 2, h * 0.55, 30 + i * 26, 0, Math.PI * 2); k.lineWidth = 6; k.strokeStyle = "rgba(127,231,220,0.10)"; k.stroke(); } });
const AVATAR_TEX = canvasTex(256, 256, (k, w) => { const c = w / 2; k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(c, c, c * 0.96, 0, Math.PI * 2); k.fill(); k.fillStyle = "#0F172A"; k.beginPath(); k.arc(c, c * 0.8, c * 0.3, 0, Math.PI * 2); k.fill(); k.beginPath(); k.ellipse(c, c * 1.62, c * 0.56, c * 0.42, 0, Math.PI, 0); k.fill(); k.save(); k.globalCompositeOperation = "destination-in"; k.beginPath(); k.arc(c, c, c * 0.96, 0, Math.PI * 2); k.fill(); k.restore(); });
const discTex = (ring, core) => canvasTex(128, 128, (k, w) => { const c = w / 2; k.fillStyle = core; k.beginPath(); k.arc(c, c, c * 0.95, 0, Math.PI * 2); k.fill(); k.strokeStyle = ring; k.lineWidth = w * 0.09; k.beginPath(); k.arc(c, c, c * 0.62, 0, Math.PI * 2); k.stroke(); k.fillStyle = ring; k.beginPath(); k.arc(c, c, c * 0.14, 0, Math.PI * 2); k.fill(); });
const ARTIST_TEX = [discTex("#7FE7DC", "#0F172A"), discTex("#0F172A", "#F0FDFA"), discTex("#F0FDFA", "#316879")];
const ARROW_TEX = canvasTex(128, 128, (k, w) => { const c = w / 2; k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(c, c, c * 0.95, 0, Math.PI * 2); k.fill(); k.strokeStyle = "#0F172A"; k.lineWidth = w * 0.09; k.lineCap = "round"; k.lineJoin = "round";
  k.beginPath(); k.moveTo(c, w * 0.66); k.lineTo(c, w * 0.26); k.moveTo(w * 0.36, w * 0.4); k.lineTo(c, w * 0.26); k.lineTo(w * 0.64, w * 0.4); k.stroke(); k.beginPath(); k.moveTo(w * 0.3, w * 0.58); k.lineTo(w * 0.3, w * 0.74); k.lineTo(w * 0.7, w * 0.74); k.lineTo(w * 0.7, w * 0.58); k.stroke(); });
const MINI_TEX = canvasTex(128, 128, (k, w) => { const x0 = 33, y0 = 8, cw = 62, ch = 112; const g = k.createLinearGradient(x0, y0, x0 + cw, y0 + ch); g.addColorStop(0, "#7FE7DC"); g.addColorStop(1, "#316879"); k.fillStyle = g; k.beginPath(); k.roundRect(x0, y0, cw, ch, 9); k.fill();
  k.fillStyle = "#F0FDFA"; k.beginPath(); k.arc(64, 34, 11, 0, Math.PI * 2); k.fill(); for (let i = 0; i < 3; i++) { k.fillRect(42, 58 + i * 12, 44 - i * 9, 6); } k.fillStyle = "#7FE7DC"; k.strokeStyle = "#0F172A"; k.lineWidth = 2; k.beginPath(); k.roundRect(78, 12, 14, 10, 3); k.fill(); k.stroke(); });
const AD_TEX = canvasTex(400, 260, (k, w, h) => { k.fillStyle = "#0F172A"; k.beginPath(); k.roundRect(0, 0, w, h, 24); k.fill(); k.fillStyle = "#64748B"; k.beginPath(); k.moveTo(120, 110); k.lineTo(250, 50); k.lineTo(250, 210); k.lineTo(120, 150); k.closePath(); k.fill(); k.fillRect(80, 106, 44, 48); k.fillRect(150, 150, 26, 60); k.strokeStyle = "#64748B"; k.lineWidth = 12; k.lineCap = "round"; for (const [a, r] of [[0, 40], [0, 70]]) { k.beginPath(); k.arc(262, 130, r, -0.6, 0.6); k.stroke(); } });

// the hero card (group pivots at its base so it can turn and lift)
const cardG = new THREE.Group(); stage.add(cardG);
const stand = new THREE.Mesh(new RoundedBoxGeometry(0.07, STAND_H, 0.036, 3, 0.005), mat(C3.ink, { roughness: 0.4, clearcoat: 0.6 })); stand.position.y = STAND_H / 2; stand.castShadow = true; stand.receiveShadow = true; stage.add(stand);
const cardBody = new THREE.Mesh(new RoundedBoxGeometry(CW, CH, CT, 3, 0.006), mat("#24586A", { roughness: 0.35, clearcoat: 0.9 })); cardBody.position.y = CARD_Y; cardBody.castShadow = true; cardG.add(cardBody);
const facePlane = (tex, w, h, z, ro = 4) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); m.position.z = z; m.renderOrder = ro; return m; };
const front = facePlane(FACE_TEX, CW * 0.985, CH * 0.985, CT / 2 + 0.0004); front.position.y = CARD_Y; cardG.add(front);
const back = facePlane(BACK_TEX, CW * 0.985, CH * 0.985, -(CT / 2 + 0.0004)); back.rotation.y = Math.PI; back.position.y = CARD_Y; cardG.add(back);
const FZ = CT / 2 + 0.0012, el = (o, x, y) => { o.position.set(x, CARD_Y + y, FZ); cardG.add(o); return o; };
const avatar = el(facePlane(AVATAR_TEX, 0.034, 0.034, 0, 5), 0, 0.046);
const avatarGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); avatarGlow.position.set(0, CARD_Y + 0.046, FZ + 0.002); cardG.add(avatarGlow);
const artists = ARTIST_TEX.map((tx, i) => el(facePlane(tx, 0.016, 0.016, 0, 5), (i - 1) * 0.021, 0.017));
const barM = mat(C3.mintw, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.1 }), barGeo = new RoundedBoxGeometry(1, 0.0058, 0.0024, 1, 0.0012); barGeo.translate(0.5, 0, 0);
const BARW = [0.06, 0.05, 0.042, 0.034, 0.026], bars = BARW.map((w, i) => { const b = new THREE.Mesh(barGeo, barM); b.position.set(-0.031, CARD_Y - 0.004 - i * 0.0098, FZ + 0.001); b.userData.w = w; cardG.add(b); return b; });
const ringSegs = Array.from({ length: 20 }, (_, i) => { const a = HALF - (i / 20) * Math.PI * 2, s = new THREE.Mesh(new RoundedBoxGeometry(0.0032, 0.0019, 0.0016, 1, 0.0006), mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.3 })); s.position.set(-0.022 + 0.0092 * Math.cos(a), CARD_Y - 0.058 + 0.0092 * Math.sin(a), FZ + 0.001); s.rotation.z = a + HALF; cardG.add(s); return s; });
const arrow = el(facePlane(ARROW_TEX, 0.019, 0.019, 0, 5), 0.024, -0.058);
const tabM = mat(C3.mint, { roughness: 0.3, emissive: C.mint, emissiveIntensity: 0.2 });
for (const z of [1, -1]) { const tab = new THREE.Mesh(new RoundedBoxGeometry(0.016, 0.011, 0.0026, 1, 0.002), tabM); tab.position.set(z * 0.032, CARD_Y + 0.064, z * (CT / 2 + 0.0014)); cardG.add(tab); }
const sparks = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (k, w) => { const c = w / 2; const g = k.createRadialGradient(c, c, 0, c, c, c); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.2, "rgba(200,255,248,0.6)"); g.addColorStop(1, "rgba(127,231,220,0)"); k.fillStyle = g; k.beginPath(); for (let a = 0; a < 8; a++) { const r = a % 2 ? 0.1 * c : c, an = (a * Math.PI) / 4; k.lineTo(c + r * Math.cos(an), c + r * Math.sin(an)); } k.closePath(); k.fill(); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 8; cardG.add(s); return s; });

// ------------------------------------------------------------------ the share tree: 6 levels, 3 children per node (3, 9, 27, 81, 243, 729 =
// 1,092 little paths; illustrative, not reach data)
const RADII = [0, 0.075, 0.15, 0.24, 0.345, 0.47, 0.61];
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const NODES = [{ L: 0, x: 0, z: 0, th: 0, span: Math.PI * 2, parent: -1 }];
for (let L = 1; L <= 6; L++) { const prev = NODES.filter((n) => n.L === L - 1);
  prev.forEach((p) => { const span = L === 1 ? (Math.PI * 2) / 3 : p.span / 3; for (let j = 0; j < 3; j++) { const th = L === 1 ? Math.PI + j * span : p.th + (j - 1) * span, id = NODES.length, r = RADII[L] * (1 + 0.1 * (hash(id) - 0.5)), thj = th + 0.18 * span * (hash(id + 7) - 0.5);
    NODES.push({ L, x: r * Math.sin(thj), z: r * Math.cos(thj), th, span, parent: NODES.indexOf(p) }); } }); }
// dotted segments (parent → node, slightly bowed outward); each dot remembers its level and fraction along the segment
const DOTS = []; NODES.forEach((n, id) => { if (n.parent < 0) return; const p = NODES[n.parent], len = Math.hypot(n.x - p.x, n.z - p.z), cnt = Math.max(4, Math.ceil(len / 0.0058));
  const mx = (p.x + n.x) / 2, mz = (p.z + n.z) / 2, bow = 0.12 * len, nr = Math.hypot(mx, mz) || 1, cx = mx + (mx / nr) * bow, cz = mz + (mz / nr) * bow;
  for (let i = 1; i <= cnt; i++) { const u = i / cnt, x = (1 - u) * (1 - u) * p.x + 2 * u * (1 - u) * cx + u * u * n.x, z = (1 - u) * (1 - u) * p.z + 2 * u * (1 - u) * cz + u * u * n.z; DOTS.push({ L: n.L, u, x, z, d: n.L - 1 + u }); } });
const dotGeo = new THREE.BufferGeometry(); dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(DOTS.length * 3), 3)); dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(DOTS.length * 3), 3));
const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ size: 0.0085, map: GLOW_TEX, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); dots.frustumCulled = false; dots.renderOrder = 3; stage.add(dots);
const miniGeo = new THREE.BufferGeometry(); miniGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(NODES.length * 3), 3));
const minis = new THREE.Points(miniGeo, new THREE.PointsMaterial({ size: 0.026, map: MINI_TEX, transparent: true, alphaTest: 0.35, depthWrite: true, toneMapped: false })); minis.frustumCulled = false; minis.renderOrder = 4; stage.add(minis);
// friends: pawns at level-1 and level-2 nodes (12)
const pawnGeoB = new THREE.CylinderGeometry(0.0072, 0.0092, 0.019, 20), pawnGeoH = new THREE.SphereGeometry(0.0072, 20, 14), pawnMat = mat("#EEF7F1", { roughness: 0.4, clearcoat: 0.4, emissive: C.mint, emissiveIntensity: 0 });
const FRIENDS = NODES.map((n, i) => [n, i]).filter(([n]) => n.L === 1 || n.L === 2).map(([n, i]) => { const g = new THREE.Group(); const b = new THREE.Mesh(pawnGeoB, pawnMat); b.position.y = 0.0095; b.castShadow = true; g.add(b); const h = new THREE.Mesh(pawnGeoH, pawnMat); h.position.y = 0.0248; h.castShadow = true; g.add(h); stage.add(g); g.userData = { n, i }; return g; });
// listening discs (super hook): 8 small records (groove ring + off-centre label dot so the spin reads) spiral into the card
const discGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.0018, 48), labelGeo = new THREE.CylinderGeometry(0.0058, 0.0058, 0.002, 32);
const grooveGeo = new THREE.TorusGeometry(0.011, 0.00045, 6, 48); grooveGeo.rotateX(HALF); const dotGeoS = new THREE.CylinderGeometry(0.0011, 0.0011, 0.0022, 12);
const discMat = mat(C3.ink, { roughness: 0.22, clearcoat: 1 }), grooveMat = mat("#64748B", { roughness: 0.4 });
const discs = Array.from({ length: 8 }, (_, i) => { const g = new THREE.Group(), sp = new THREE.Group(); g.add(sp);
  const d = new THREE.Mesh(discGeo, discMat); d.castShadow = true; sp.add(d); const gr = new THREE.Mesh(grooveGeo, grooveMat); gr.position.y = 0.0009; sp.add(gr);
  const lb = new THREE.Mesh(labelGeo, mat(i % 2 ? C3.mint : C3.mintw, { roughness: 0.3 })); sp.add(lb); const dt = new THREE.Mesh(dotGeoS, mat(C3.ink, { roughness: 0.4 })); dt.position.set(0.0034, 0.0001, 0); sp.add(dt);
  stage.add(g); g.userData = { a0: (i / 8) * Math.PI * 2 + 0.3 + (i % 2) * 2.4, z0: 0.07 + 0.03 * Math.sin(i * 1.9) }; return g; });
// a generic ad board (proof 1): ink panel with a grey megaphone, on a post
const adG = new THREE.Group(); stage.add(adG);
{ const panel = new THREE.Mesh(new RoundedBoxGeometry(0.104, 0.068, 0.005, 2, 0.004), mat(C3.ink, { roughness: 0.45 })); panel.position.y = 0.1; panel.castShadow = true; adG.add(panel);
  const face = facePlane(AD_TEX, 0.1, 0.065, 0.0029); face.position.y = 0.1; adG.add(face);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 12), mat("#64748B", { roughness: 0.5 })); post.position.y = 0.035; adG.add(post);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.004, 24), mat(C3.ink, { roughness: 0.4 })); foot.position.y = 0.002; adG.add(foot); }
const adSh = contactShadow();
