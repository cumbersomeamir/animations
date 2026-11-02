// Werbens · Production 30 s #01 — "A feature is not yet a benefit"
// Living Screencast grammar (read-only skill: lemomo-ai/lemo-opuscar styles/living-screencast/STYLE.md), original code.
// A redrawn 2D campaign-board window (HTML/SVG) on wallpaper; a square-pixel art director lives on the top edges of
// real laid-out UI elements (measured from the live DOM every frame); the cursor is the user. Everything = f(t).
import { E, clamp, lerp, key, ramp, window as win, wobble, rng } from "./lib/anim.js";
import { T, CAM, CURSOR, CLICKS, CAPTIONS, HIGHLIGHT, OVERCLAIM, HONEST, BENEFIT_WORDS } from "./timeline.js";
import { photoSVG, packFront, walkBob } from "./stage.js";
import { drawMascot, drawProp, SW, SH } from "./pixel.js";

const $ = (id) => document.getElementById(id);
await Promise.all(["40px IDXB", "30px IDBlack", "20px ISB", "20px IB"].map((f) => document.fonts.load(f)));
const WJ = await (await fetch("/src/words.json")).json();
const LINES = Object.fromEntries(WJ.lines.map((l) => [l.id, l]));

// ------------------------------------------------------------------ narration words aligned to the script
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9%]/g, "");
function align(line) {
  const sw = line.script.split(" "), tok = line.words, out = []; let j = 0;
  for (const w of sw) {
    const target = nrm(w); let acc = "", t0 = null, t1 = null;
    while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; }
    out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end });
  }
  return out;
}
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c, i) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => {
  c.t0 = c.words[0].t0 - 0.1;
  const nxt = CAPS[i + 1] ? CAPTIONS[i + 1] : null;
  const end = c.words.at(-1).t1 + 0.45;
  c.t1 = nxt ? Math.min(end + 10, AW[nxt.line][nxt.from].t0 - 0.12) : end + 0.4;
  if (nxt && nxt.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6));
});

// ------------------------------------------------------------------ static build
$("prodIcon").innerHTML = `<svg width="92" height="104" viewBox="0 0 92 104">${packFront(46, 56, 0.55)}</svg>`;
const wipe = $("wipe"); for (let i = 0; i < 132; i++) wipe.appendChild(document.createElement("i"));
const wipeCells = [...wipe.children];
const mascot = $("mascot"), mctx = mascot.getContext("2d");
const PX = 5; // world px per sprite pixel
mascot.style.width = SW * PX + "px"; mascot.style.height = SH * PX + "px";
const propPool = Array.from({ length: 28 }, () => { const c = document.createElement("canvas"); c.width = 8; c.height = 8; $("props").appendChild(c); return c; });
const rainCtx = $("rainAll").getContext("2d");

// ------------------------------------------------------------------ camera (recording-software camera, zoom ≥ 1)
const VP = { x: 80, y: 510, w: 920, h: 960 }; // safe band: below the caption zone, above the bottom overlay region
function camRect(t) {
  if (t <= CAM[0][0]) return CAM[0][1];
  for (let i = 1; i < CAM.length; i++) {
    const [t1, r1] = CAM[i];
    if (t <= t1) { const [t0, r0] = CAM[i - 1]; const u = E.inOut(clamp((t - t0) / (t1 - t0))); return r0.map((v, k) => lerp(v, r1[k], u)); }
  }
  return CAM.at(-1)[1];
}
function camAt(t) {
  const [x, y, w, h] = camRect(t);
  const s = Math.max(1, Math.min(VP.w / w, VP.h / h));
  const tx = clamp(VP.x + VP.w / 2 - s * (x + w / 2), 1080 - 1080 * s, 0), ty = clamp(VP.y + VP.h / 2 - s * (y + h / 2), 1920 - 1920 * s, 0);
  return { s, tx, ty };
}
// ------------------------------------------------------------------ cursor (user): spring-eased, slight arc, never teleports
function cursorAt(t) {
  if (t <= CURSOR[0][0]) return CURSOR[0][1];
  for (let i = 1; i < CURSOR.length; i++) {
    const [t1, p1] = CURSOR[i];
    if (t <= t1) {
      const [t0, p0] = CURSOR[i - 1], u = clamp((t - t0) / (t1 - t0)), e = E.inOut(u) + 0.04 * Math.sin(Math.PI * u) * (1 - u);
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], arc = Math.sin(Math.PI * u) * 0.06 * Math.hypot(dx, dy);
      return [p0[0] + dx * e - dy / Math.max(1, Math.hypot(dx, dy)) * arc, p0[1] + dy * e + dx / Math.max(1, Math.hypot(dx, dy)) * arc];
    }
  }
  return CURSOR.at(-1)[1];
}

// ------------------------------------------------------------------ DOM measurement → world coordinates
let CAMNOW = { s: 1, tx: 0, ty: 0 };
const rectW = (el) => { const r = el.getBoundingClientRect(), { s, tx, ty } = CAMNOW; return { x: (r.left - tx) / s, y: (r.top - ty) / s, w: r.width / s, h: r.height / s }; };
const A = {
  el: (id, fx, dy = 0) => () => { const r = rectW($(id)); return [r.x + r.w * fx, r.y + dy]; },
  photo: (px, py) => () => { const r = rectW($("photo")); return [r.x + px, r.y + py - 5]; },
  pack: () => () => { const r = rectW($("photo")); const walking = curT >= T.walk[0] && curT < T.walk[1]; return [r.x + 224, r.y + 184 - walkBob(curT, walking) - 5]; },
  // karaoke hops ride the field's TOP edge at each word's x, so the sprite never covers a line of text (skill pitfall)
  word: (i) => () => { const ws = $("headText").querySelectorAll(".w"); const el = ws[Math.min(i, ws.length - 1)]; const hr = rectW($("head")); if (!el) return [hr.x + hr.w * 0.5, hr.y]; const r = rectW(el); return [clamp(r.x + r.w * 0.5, hr.x + 40, hr.x + hr.w - 40), hr.y]; },
};

// ------------------------------------------------------------------ mascot choreography (segments)
const SEG = [];
const stand = (t0, t1, at, o = {}) => SEG.push({ t0, t1, type: "stand", at, ...o });
const jump = (t0, t1, from, to, h, o = {}) => SEG.push({ t0, t1, type: "jump", from, to, h, ...o });
const walk = (t0, t1, from, to, o = {}) => SEG.push({ t0, t1, type: "walk", from, to, ...o });
stand(-1, 1.0, A.el("cFeature", 0.3), { eyes: (t) => (t < 0.55 ? "r" : "l") });
jump(1.0, 1.38, A.el("cFeature", 0.3), A.el("head", 0.56), 70);
stand(1.38, 2.95, A.el("head", 0.56), { eyes: (t) => (t < 2.05 ? "d" : "n"), mouth: (t) => (t > 2.1 ? "flat" : "smile") });
jump(2.95, 3.42, A.el("head", 0.56), A.el("cBenefit", 0.24), 45);
stand(3.42, 5.85, A.el("cBenefit", 0.24), { eyes: (t) => (t > T.quest[0] && t < T.quest[1] ? "u" : "n"), mouth: (t) => (t > T.quest[0] && t < T.quest[1] ? "o" : "smile") });
jump(5.85, 6.3, A.el("cBenefit", 0.24), A.photo(222, 104), 150);
stand(6.3, 7.3, A.photo(222, 104), { eyes: (t) => (t < 6.9 ? "happy" : "n"), arms: (t) => (t < 6.9 ? "up" : "down") });
jump(7.3, 7.65, A.photo(222, 104), A.el("head", 0.5), 90);
stand(7.65, 9.8, A.el("head", 0.5), { eyes: (t) => (t < T.grabFeature ? "d" : "u"), arms: (t) => (t >= T.grabFeature ? "carry" : "down"), mouth: (t) => (t >= T.grabFeature ? "grin" : "smile") });
jump(9.8, 10.25, A.el("head", 0.5), A.photo(150, 330), 35, { arms: "carry" });
walk(10.25, 10.4, A.photo(150, 330), A.photo(176, 330), { arms: "carry" });
stand(10.4, 11.9, A.photo(176, 330), { arms: (t) => (t < T.stick[1] ? "carry" : t < 10.95 ? "up" : "down"), eyes: (t) => (t < T.stick[1] ? "u" : t < 11.3 ? "happy" : "u") });
jump(11.9, 12.25, A.photo(176, 330), A.pack(), 70);
stand(12.25, 16.6, A.pack(), { eyes: (t) => (t < 13.6 ? "r" : t < 16.2 ? "n" : "u"), mouth: (t) => (t > 15.5 && t < 16.2 ? "grin" : "smile") });
jump(16.6, T.headWords[0], A.pack(), A.word(0), 110);
for (let i = 1; i < T.headWords.length; i++) {
  stand(T.headWords[i - 1], T.headWords[i] - 0.13, A.word(i - 1), { eyes: "r", mouth: "o" });
  jump(T.headWords[i] - 0.13, T.headWords[i], A.word(i - 1), A.word(i), 26, { note: true });
}
stand(T.headWords.at(-1), 19.78, A.word(BENEFIT_WORDS.length - 1), { arms: (t) => (t > 19.2 && t < 19.75 ? "up" : "down"), eyes: (t) => (t > 19.2 && t < 19.75 ? "happy" : t > 19.9 ? "d" : "n") });
jump(19.78, 20.08, A.word(BENEFIT_WORDS.length - 1), A.el("badge", 0.3), 40);
stand(20.08, 27.45, A.el("badge", 0.3), {
  stomps: T.stomps,
  eyes: (t) => (t < 20.9 ? "d" : t < 22.5 ? "wide" : t < 24.3 ? "d" : t < 25.3 ? "n" : "happy"),
  mouth: (t) => (t < 20.9 ? "smile" : t < 22.5 ? "o" : t < 24.3 ? "flat" : "grin"),
  arms: (t) => (t < 20.95 ? "down" : t < 22.5 ? "up" : t > 25.35 && t < 26.3 ? "up" : "down"),
});
jump(27.45, 27.85, A.el("badge", 0.3), A.el("brand", 0.78), 90);
stand(27.85, T.sleep, A.el("brand", 0.78), { arms: (t) => (t >= T.cheer ? "up" : "down"), eyes: (t) => (t >= T.cheer ? "happy" : "n"), mouth: (t) => (t >= T.cheer ? "grin" : "smile") });
SEG.push({ t0: T.sleep, t1: 99, type: "sit", at: A.el("brand", 0.78) });
const LANDINGS = SEG.filter((s) => s.type === "jump").map((s) => s.t1);
const BLINKS = [1.9, 4.45, 6.95, 9.35, 12.9, 15.05, 19.0, 22.95, 26.45];
const BEAT = 0.6; // 100 BPM score

const val = (v, t, d) => (typeof v === "function" ? v(t) : v ?? d);
function mascotAt(t) {
  const sg = SEG.find((s) => t >= s.t0 && t < s.t1) || SEG.at(-1);
  let p, pose = { legs: "stand", arms: val(sg.arms, t, "down"), eyes: val(sg.eyes, t, "n"), mouth: val(sg.mouth, t, "smile"), flip: false };
  if (sg.type === "jump") {
    const a = sg.from(), b = sg.to(), u = clamp((t - sg.t0) / (sg.t1 - sg.t0));
    p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(Math.PI * u) * sg.h];
    pose.legs = u < 0.12 ? "crouch" : u < 0.3 ? "stretch" : u > 0.92 ? "stretch" : "tuck";
    pose.flip = b[0] < a[0]; pose.eyes = b[1] < a[1] - 30 ? "u" : u > 0.6 ? "d" : "n"; pose.mouth = "o";
    if (sg.arms) pose.arms = val(sg.arms, t); else pose.arms = u < 0.3 ? "down" : "up";
  } else if (sg.type === "walk") {
    const a = sg.from(), b = sg.to(), u = clamp((t - sg.t0) / (sg.t1 - sg.t0));
    p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    pose.legs = Math.floor(t / 0.07) % 2 ? "walkA" : "walkB"; pose.flip = b[0] < a[0];
  } else {
    p = sg.at();
    if (sg.type === "sit") { pose.legs = "sit"; pose.eyes = "shut"; pose.arms = "down"; pose.mouth = "flat"; }
    // landing squash (just after a jump ends) and idle breathing on the beat
    const sinceLand = Math.min(...LANDINGS.map((l) => (t >= l ? t - l : 99)));
    if (sinceLand < 0.1) pose.legs = "crouch";
    else if (sg.type !== "sit" && (t % BEAT) < 0.09) p = [p[0], p[1] + 2.5];
    for (const st of sg.stomps || []) {
      const d = t - st;
      if (d > -0.16 && d < -0.08) pose.legs = "crouch";
      else if (d >= -0.08 && d < 0.06) { pose.legs = "tuck"; p = [p[0], p[1] - 16 * Math.sin(Math.PI * (d + 0.08) / 0.14)]; pose.arms = "up"; }
      else if (d >= 0.06 && d < 0.14) pose.legs = "crouch";
    }
  }
  if (BLINKS.some((b) => t >= b && t < b + 0.1) && !["happy", "shut"].includes(pose.eyes)) pose.eyes = "shut";
  return { p: [Math.round(p[0] / 2.5) * 2.5, Math.round(p[1] / 2.5) * 2.5], pose, sg };
}

// ------------------------------------------------------------------ props (pixel): ? ! sparkles dust Zzz
function propsAt(t, m) {
  const out = [];
  const head = [m.p[0], m.p[1] - SH * PX];
  if (t >= T.quest[0] && t < T.quest[1]) out.push({ n: "quest", x: head[0] + 22, y: head[1] - 4 - Math.round(Math.sin((t - T.quest[0]) * 6)) * 2.5 });
  if (t >= T.bang && t < 22.4) out.push({ n: "bang", x: head[0] + 26, y: head[1] - 6 });
  for (const [ts, n] of [[6.35, 6], [10.62, 6], [19.22, 5], [25.4, 7], [T.cheer, 8]]) {
    const d = t - ts; if (d < 0 || d > 0.55) continue;
    const r = rng(Math.round(ts * 100));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = 30 + r() * 30; if (Math.floor((d + i * 0.05) / 0.1) % 2 === 0) out.push({ n: "spark", x: head[0] + Math.cos(a) * rr * (0.5 + d), y: head[1] + 40 + Math.sin(a) * rr * (0.5 + d) }); }
  }
  for (const l of LANDINGS) {
    const d = t - l; if (d < 0 || d > 0.28) continue;
    for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); out.push({ n: "dust", x: m.p[0] + side * (20 + k * 8 + d * 90), y: m.p[1] - 5 - k * 5 - d * 20, s: 1 }); }
  }
  if (t >= T.sleep) for (let i = 0; i < 3; i++) { const d = ((t - T.sleep) * 0.9 + i * 0.33) % 1; out.push({ n: "z", x: m.p[0] + 30 + d * 30, y: m.p[1] - 80 - d * 70, a: Math.sin(Math.PI * d) }); }
  return out;
}

// ------------------------------------------------------------------ captions + keys HUD
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1);
  const cap = $("cap");
  if (i !== capShown) {
    cap.innerHTML = "";
    if (i >= 0) {
      const c = CAPS[i], pill = document.createElement("div"); pill.className = "pill";
      const lines = c.br ? [c.words.slice(0, c.br - c.from), c.words.slice(c.br - c.from)] : [c.words];
      for (const L of lines) { const ln = document.createElement("span"); ln.className = "ln"; for (const w of L) { const s = document.createElement("span"); s.className = "w" + (HIGHLIGHT.includes(nrm(w.w)) ? " hi" : ""); s.textContent = w.w; s.dataset.t0 = w.t0; ln.appendChild(s); } pill.appendChild(ln); }
      cap.appendChild(pill);
    }
    capShown = i;
  }
  if (i < 0) return;
  const c = CAPS[i], pill = cap.firstChild;
  pill.style.opacity = String(Math.min(ramp(t, c.t0, c.t0 + 0.12, E.out2), 1 - ramp(t, c.t1 - 0.1, c.t1)));
  for (const s of pill.querySelectorAll(".w")) s.style.opacity = String(0.35 + 0.65 * ramp(t, +s.dataset.t0 - 0.05, +s.dataset.t0 + 0.1));
}
function typed(str, t0, t1, t) { return str.slice(0, Math.floor(clamp((t - t0) / (t1 - t0)) * str.length + 1e-6)); }
function keysHud(t) {
  const k = $("keys"); let html = "";
  if (t >= 16.2 && t < 16.9) html = `<span class="k">⌘</span><span class="k">A</span>`;
  else if (t >= T.typeOver[0] && t < 21.0) { const s = typed(OVERCLAIM, ...T.typeOver, t); html = `<span class="txt">${s || "&nbsp;"}</span>${s ? `<span class="k">${s.at(-1) === " " ? "␣" : s.at(-1)}</span>` : ""}`; }
  else if (t >= T.erase[0] && t < 23.42) html = `<span class="k">⌫</span>`;
  else if (t >= T.typeHonest[0] && t < 24.6) { const s = typed(HONEST, ...T.typeHonest, t); html = `<span class="txt">${s.slice(-22) || "&nbsp;"}</span>${s ? `<span class="k">${s.at(-1) === " " ? "␣" : s.at(-1)}</span>` : ""}`; }
  k.innerHTML = html; k.style.display = html ? "flex" : "none";
}

// ------------------------------------------------------------------ frame
let curT = 0, lastHeadKey = "", lastPhotoKey = "";
function placeCard(el, ox, oy, dx, dy, sc, op) { el.style.transform = `translate(${dx}px, ${dy}px) scale(${sc})`; el.style.transformOrigin = "0 0"; el.style.opacity = String(op); }

function frame(t) {
  curT = t;
  // --- camera (+ anisotropic motion blur from camera speed, only on whips, on the untransformed wrapper)
  const cam = camAt(t), prev = camAt(Math.max(0, t - 1 / 30));
  CAMNOW = cam;
  $("world").style.transform = `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`;
  // blur only inside the designated whip pans, oriented along the pan (anisotropic), peak at mid-whip
  const whip = [T.whipBenefit, T.whipBenefit2, T.whipBack].find(([a, b]) => t > a && t < b);
  let bx = 0, by = 0;
  if (whip) { const k = Math.sin(Math.PI * (t - whip[0]) / (whip[1] - whip[0])), dx = Math.abs(cam.tx - prev.tx), dy = Math.abs(cam.ty - prev.ty), n = Math.max(1, Math.hypot(dx, dy)); bx = 9 * k * dx / n; by = 9 * k * dy / n; }
  const fast = bx + by > 0.4;
  $("mbBlur").setAttribute("stdDeviation", `${bx.toFixed(1)} ${by.toFixed(1)}`);
  $("film").style.filter = fast ? "url(#mb)" : "none";

  // --- stepper / checklist / status
  const step = t < 2.95 ? 1 : t < 14.05 ? 2 : t < 19.6 ? 3 : t < T.allDone ? 4 : 5;
  for (let i = 1; i <= 4; i++) { const e = $("st" + i); e.className = "step" + (i === step ? " on" : i < step ? " done" : ""); }
  [[1, T.situation], [2, T.outcome], [3, T.supportCheck], [4, T.noOverclaim]].forEach(([i, tk]) => ($("k" + i).className = "chk" + (t >= tk ? " ok" : "")));
  $("saved").textContent = t >= T.allDone ? "Saved · ready for review" : "Draft";

  // --- cards (cursor drags the actual laid-out cards)
  const cur = cursorAt(t);
  const fc = $("cFeature");
  if (t < T.dragEnd + 0.12) {
    const gx = 350, gy = 66, ox = 580, oy = 794, c = t < T.dragEnd ? cur : cursorAt(T.dragEnd);
    const u = ramp(t, T.dragEnd, T.dragEnd + 0.12);
    placeCard(fc, ox, oy, c[0] - gx - ox, c[1] - gy - oy + u * 10, lerp(1, 0.9, ramp(t, 0, T.dragEnd)) * (1 - 0.15 * u), 1 - u);
  } else fc.style.opacity = "0";
  $("slotFeature").style.opacity = "1";
  const sc = $("cSupport");
  if (t < T.supportDrag[0]) { placeCard(sc, 0, 0, 0, 0, 1, 1); $("slotSupport").style.opacity = "0"; }
  else if (t < T.supportDrop + 0.1) {
    const gx = 200, gy = 54, ox = 580, oy = 1058, c = t < T.supportDrag[1] ? cur : cursorAt(T.supportDrag[1]), u = ramp(t, T.supportDrop - 0.05, T.supportDrop + 0.1);
    placeCard(sc, ox, oy, c[0] - gx - ox, c[1] - gy - oy, lerp(1, 0.92, ramp(t, T.supportDrag[0], T.supportDrag[1])) * (1 - 0.12 * u), 1 - u);
    $("slotSupport").style.opacity = "1";
  } else { sc.style.opacity = "0"; $("slotSupport").style.opacity = "1"; }
  const bc = $("cBenefit"), filled = t >= T.benefitFill;
  bc.className = "card" + (filled ? "" : " empty");
  $("benT").textContent = filled ? "Notebook stays dry on drizzly commutes" : "Why does it matter?";
  $("benS").textContent = filled ? "Why it matters" : "—";
  const bp = (t >= T.clickBenefit && t < T.clickBenefit + 0.35 ? 0.03 * Math.sin(Math.PI * (t - T.clickBenefit) / 0.35) : 0) + (filled ? 0.04 * Math.max(0, 1 - (t - T.benefitFill) / 0.3) : 0);
  bc.style.transform = `scale(${1 + bp})`; bc.style.borderColor = filled ? "#6234FB" : ""; bc.style.borderWidth = filled ? "2px" : "";
  $("benT").style.color = !filled && t >= 4.1 && t < 5.0 ? "#6234FB" : "";
  $("cProduct").style.transform = `scale(${1 + (t >= T.clickProduct && t < T.clickProduct + 0.3 ? 0.03 * Math.sin(Math.PI * (t - T.clickProduct) / 0.3) : 0)})`;
  $("brand").querySelector(".fic").style.color = t >= T.fictional && t < 6.6 ? "#6234FB" : "";

  // --- headline field
  const ht = $("headText"), head = $("head");
  let hk, hh;
  if (t < T.headFill) { hk = "ph"; hh = `<span class="ph">Headline…</span>`; }
  else if (t < T.grabFeature) { hk = "feat"; hh = `<span class="w">Water-resistant</span> <span class="w">fabric.</span>`; }
  else if (t < 16.6) { hk = t >= T.selectHead ? "phsel" : "ph2"; hh = `<span class="ph${t >= T.selectHead ? " hl" : ""}">Headline…</span>`; }
  else { const n = T.headWords.filter((w) => t >= w).length; hk = "ben" + n + (t < 18.3 ? "c" : ""); hh = BENEFIT_WORDS.map((w, i) => `<span class="w" style="opacity:${i < n ? 1 : 0}">${w}</span>`).join(" ") + (t < 18.3 ? `<span id="caret"></span>` : ""); }
  if (hk !== lastHeadKey) { ht.innerHTML = hh; ht.className = t >= 16.6 ? "ben" : ""; lastHeadKey = hk; }
  head.className = t >= T.selectHead && t < 18.3 ? "sel" : "";
  const caret = $("caret"); if (caret) caret.style.opacity = Math.floor(t / 0.45) % 2 ? "0.15" : "1";
  ht.style.opacity = t >= T.grabFeature && t < T.grabFeature + 0.12 ? String(ramp(t, T.grabFeature, T.grabFeature + 0.12)) : "1";

  // --- photo frame: empty → product photo → (pixel wipe) → rain-commute stage
  const mode = t < T.clickProduct ? "empty" : t < 9.97 ? "product" : "stage";
  const walking = t >= T.walk[0] && t < T.walk[1];
  const pp = { mode, t, scroll: walking ? (t - T.walk[0]) * 70 : t >= T.walk[1] ? (T.walk[1] - T.walk[0]) * 70 : 0, rain: 0.35 + 0.65 * win(t, T.rainAll[0], T.rainAll[1], 0.3, 0.5), notebook: ramp(t, T.notebook, T.notebook + 0.3, E.outBack), dry: ramp(t, T.dry, T.dry + 0.2), badge: ramp(t, T.stick[1] - 0.05, T.stick[1] + 0.1), walking, popIn: ramp(t, ...T.productPop, E.outBack) };
  const pk = mode === "empty" ? "e" : mode === "product" ? "p" + pp.popIn.toFixed(3) : "s" + t.toFixed(3);
  if (pk !== lastPhotoKey) { $("photoSvg").innerHTML = photoSVG(pp); lastPhotoKey = pk; }
  const wu = ramp(t, ...T.wipe, E.lin);
  wipeCells.forEach((c, i) => { const col = i % 12, row = Math.floor(i / 12), d = (col + row) / 22; c.style.opacity = wu > d * 0.5 && wu < d * 0.5 + 0.5 ? "1" : "0"; });
  $("sitchip").style.opacity = String(ramp(t, T.situation, T.situation + 0.15)); $("sitchip").style.transform = `scale(${0.8 + 0.2 * ramp(t, T.situation, T.situation + 0.2, E.outBack)})`;
  // badge (claim sticker on the ad image)
  const bd = $("badge"), bt = $("badgeText");
  if (t < T.badgeClick) bd.style.display = "none";
  else {
    bd.style.display = "block";
    let s = "";
    if (t < T.erase[0]) s = typed(OVERCLAIM, ...T.typeOver, t);
    else if (t < T.erase[1]) s = OVERCLAIM.slice(0, Math.round(OVERCLAIM.length * (1 - ramp(t, ...T.erase, E.lin))));
    else s = typed(HONEST, ...T.typeHonest, t);
    bt.textContent = s || "​";
    const shake = T.stomps.reduce((a, st) => a + wobble(t, st + 0.04, 7, 14, 14), 0);
    bd.style.transform = `translateX(${shake}px) scale(${0.85 + 0.15 * ramp(t, T.badgeClick, T.badgeClick + 0.12, E.outBack)})`;
    bd.querySelector(".strike").style.transform = `scaleX(${ramp(t, ...T.strike, E.out)})`;
    bd.querySelector(".strike").style.opacity = String(1 - ramp(t, 22.95, 23.05));
    const honest = t >= T.typeHonest[1];
    bd.style.boxShadow = honest ? `0 0 0 3px #6234FB, 0 10px 30px rgba(98,52,251,${0.35 + 0.25 * win(t, ...T.spotlight, 0.3, 0.5)})` : "";
    $("bcaret").innerHTML = t > T.badgeClick && t < T.typeHonest[1] + 0.1 && Math.floor(t / 0.45) % 2 === 0 ? `<span style="display:inline-block;width:2px;height:24px;background:#6234FB;vertical-align:-4px;margin-left:2px"></span>` : "";
  }
  // support line
  const sp = $("support");
  if (t < T.supportDrop) { sp.className = ""; sp.textContent = "＋ Add support for the claim"; }
  else { sp.className = "filled"; sp.innerHTML = `<span class="k">SUPPORT</span> Fabric spec sheet: water-resistant fabric (fictional demo)`; }
  sp.style.transform = t >= T.supportDrop && t < T.supportDrop + 0.3 ? `scale(${1 + 0.03 * Math.sin(Math.PI * (t - T.supportDrop) / 0.3)})` : "";

  // --- mascot (measured AFTER all layout-affecting updates above)
  const m = mascotAt(t);
  drawMascot(mctx, m.pose);
  mascot.style.left = m.p[0] - (SW * PX) / 2 + "px"; mascot.style.top = m.p[1] - SH * PX + "px";
  // carried feature chip
  const chip = $("chip");
  if (t >= T.grabFeature && t < T.stick[1]) {
    chip.style.display = "block";
    const cw = chip.offsetWidth, hands = [m.p[0], m.p[1] - (SH - 6) * PX - (m.pose.legs === "crouch" ? -PX : 0)];
    let x = hands[0] - cw / 2, y = hands[1] - 40, sc = 1, op = 1;
    if (t < T.grabFeature + 0.2) { const hr = rectW($("head")), u = ramp(t, T.grabFeature, T.grabFeature + 0.2, E.out); x = lerp(hr.x + 20, x, u); y = lerp(hr.y + 50, y, u); sc = lerp(1.2, 1, u); }
    if (t >= T.stick[0]) { const pr = rectW($("photo")), u = ramp(t, ...T.stick, E.inOut); x = lerp(x, pr.x + 224 - cw * 0.25, u); y = lerp(y, pr.y + 232, u); sc = lerp(1, 0.5, u); op = 1 - ramp(t, T.stick[1] - 0.06, T.stick[1]); }
    chip.style.left = x + "px"; chip.style.top = y + "px"; chip.style.transform = `scale(${sc}) rotate(${Math.sin(t * 9) * 1.5}deg)`; chip.style.opacity = String(op);
  } else chip.style.display = "none";
  // props
  const props = propsAt(t, m);
  propPool.forEach((c, i) => {
    const p = props[i]; if (!p) { c.style.display = "none"; return; }
    const [w, h] = drawProp(c.getContext("2d"), p.n); c.style.display = "block";
    c.style.width = w * PX + "px"; c.style.height = h * PX + "px"; c.style.left = Math.round(p.x / 2.5) * 2.5 + "px"; c.style.top = Math.round((p.y - h * PX) / 2.5) * 2.5 + "px"; c.style.opacity = String(p.a ?? 1);
  });

  // --- connector: feature (on the pack) → outcome (headline)
  const lk = $("link"), la = $("linkA"), lb = $("linkB");
  const lu = ramp(t, ...T.link, E.out), lo = 1 - ramp(t, 19.5, 19.8);
  if (t >= T.link[0] && lo > 0) {
    const pr = rectW($("photo")), hr = rectW($("head"));
    const a = [pr.x + 224, pr.y + 232], b = [hr.x + 90, hr.y + hr.h - 6], c = [a[0] - 120, (a[1] + b[1]) / 2];
    let d = `M${a[0]} ${a[1]}`; const N = 30;
    for (let i = 1; i <= Math.round(N * lu); i++) { const u = i / N, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]; d += ` L${x} ${y}`; }
    lk.setAttribute("d", d); lk.setAttribute("stroke-dashoffset", String(-t * 40)); lk.style.opacity = lo;
    la.setAttribute("cx", a[0]); la.setAttribute("cy", a[1]); la.style.opacity = lo; lb.setAttribute("cx", b[0]); lb.setAttribute("cy", b[1]); lb.style.opacity = lu >= 1 ? lo : 0;
  } else { lk.setAttribute("d", ""); la.style.opacity = 0; lb.style.opacity = 0; }

  // --- rain escaping the ad and taking over the film (state change), then returning
  rainCtx.clearRect(0, 0, 1080, 1920);
  const ra = win(t, T.rainAll[0], T.rainAll[1], 0.35, 0.6);
  if (ra > 0) {
    rainCtx.strokeStyle = `rgba(240,234,252,${0.55 * ra})`; rainCtx.lineWidth = 2.2; rainCtx.lineCap = "round"; rainCtx.beginPath();
    for (let i = 0; i < 220; i++) { const x0 = (i * 211.7) % 1180 - 50, sp = 900 + (i % 7) * 90, y = ((t * sp + i * 97) % 2000) - 40; rainCtx.moveTo(x0 + y * 0.15, y); rainCtx.lineTo(x0 + y * 0.15 + 5, y + 26); }
    rainCtx.stroke();
  }

  // --- cursor
  const cu = $("cursor"), clickD = Math.min(...CLICKS.map((c) => (t >= c ? t - c : 9)));
  cu.style.left = cur[0] - 3 + "px"; cu.style.top = cur[1] - 3 + "px";
  cu.style.transform = `scale(${1 - (clickD < 0.16 ? 0.16 * Math.sin(Math.PI * clickD / 0.16) : 0)})`;
  const rp = $("ripple"); rp.style.left = cur[0] + "px"; rp.style.top = cur[1] + "px";
  rp.style.opacity = clickD < 0.35 ? String(0.9 * (1 - clickD / 0.35)) : "0"; rp.style.transform = `scale(${0.4 + clickD * 2.2})`;

  // --- screen-space layers
  $("vign").style.opacity = String(win(t, ...T.spotlight, 0.35, 0.45));
  $("dim").style.opacity = String(0.26 * ramp(t, ...T.dim));
  captions(t); keysHud(t);
}

window.__frame = (t) => frame(t);
window.__debug = (t) => { frame(t); const m = mascotAt(t); const ws = [...$("headText").querySelectorAll(".w")].map((e) => { const r = rectW(e); return [e.textContent, Math.round(r.x), Math.round(r.y), Math.round(r.w)]; }); return { seg: [m.sg.t0, m.sg.t1, m.sg.type], p: m.p, ws, cam: CAMNOW }; };
window.__bounds = (t) => { // QA: caption line boxes + mascot screen box at time t
  frame(t);
  const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; });
  const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null, mr = $("mascot").getBoundingClientRect();
  return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, mascot: [mr.left, mr.top, mr.right, mr.bottom] };
};
window.__info = () => ({ nodes: document.getElementsByTagName("*").length, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
if (Q.has("play")) { const t0 = performance.now(); const loop = () => { frame(((performance.now() - t0) / 1000) % 30); requestAnimationFrame(loop); }; loop(); }
window.__ready = true;
