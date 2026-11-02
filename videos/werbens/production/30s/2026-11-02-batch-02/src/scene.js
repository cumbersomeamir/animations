// Werbens · Production 30 s #02 — "The ad that admits a weakness"
// Living Screencast grammar (read-only: lemomo-ai/lemo-opuscar styles/living-screencast/STYLE.md); original code.
// Redrawn 2D campaign-board window on wallpaper; Pixel Pip stands only on top edges of real laid-out elements (live DOM);
// the cursor is the user. Analytical reconstruction of the 1959 layout (labelled), generic loud comparison, original example.
import { E, clamp, lerp, key, ramp, window as win, wobble, rng } from "./lib/anim.js";
import { T, CAM, CURSOR, CLICKS, CAPTIONS, HIGHLIGHT, HEAD_A, HEAD_C } from "./timeline.js";
import { smallCarSVG, loudCarSVG, burstSVG, toolSVG } from "./stage.js";
import { drawMascot, drawProp, SW, SH } from "./pixel.js";

const $ = (id) => document.getElementById(id);
await Promise.all(["40px IDXB", "40px IDBlack", "20px ISB", "20px IB"].map((f) => document.fonts.load(f)));
const WJ = await (await fetch("/src/words.json")).json();

// ------------------------------------------------------------------ narration words aligned to the script → caption groups
const nrm = (s) => s.toLowerCase().replace(/[^a-z0-9%]/g, "");
function align(line) {
  const sw = line.script.split(" "), tok = line.words, out = []; let j = 0;
  for (const w of sw) { const target = nrm(w); let acc = "", t0 = null, t1 = null; while (j < tok.length && acc.length < target.length) { if (t0 === null) t0 = tok[j].t0; acc += nrm(tok[j].w); t1 = tok[j].t1; j++; } out.push({ w, t0: t0 ?? line.end, t1: t1 ?? line.end }); }
  return out;
}
const AW = Object.fromEntries(WJ.lines.map((l) => [l.id, align(l)]));
const CAPS = CAPTIONS.map((c) => ({ ...c, words: AW[c.line].slice(c.from, c.to) }));
CAPS.forEach((c, i) => {
  c.t0 = c.words[0].t0 - 0.1;
  const nxt = CAPTIONS[i + 1], end = c.words.at(-1).t1 + 0.45;
  c.t1 = nxt ? AW[nxt.line][nxt.from].t0 - 0.12 : end + 0.4;
  if (nxt && nxt.line !== c.line) c.t1 = Math.min(c.t1, Math.max(end, c.words.at(-1).t1 + 0.6));
});

// ------------------------------------------------------------------ static build
$("car").innerHTML = smallCarSVG(); $("assetCarSvg").innerHTML = smallCarSVG(70, 33);
$("loudCar").innerHTML = loudCarSVG(); $("b1").innerHTML = burstSVG("NEW!", 66); $("b2").innerHTML = burstSVG("WOW!", 58, "#1B1433", "#FFFFFF");
$("tool").innerHTML = toolSVG(); $("assetToolSvg").innerHTML = `<div style="width:70px;height:54px;overflow:hidden"><div style="transform:scale(0.24);transform-origin:0 0">${toolSVG()}</div></div>`;
for (const c of document.querySelectorAll(".copyA")) for (let i = 0; i < 9; i++) { const b = document.createElement("i"); b.style.width = (i === 8 ? 55 : 100 - ((i * 37) % 22)) + "%"; c.appendChild(b); }
const mascot = $("mascot"), mctx = mascot.getContext("2d"); const PX = 5;
mascot.style.width = SW * PX + "px"; mascot.style.height = SH * PX + "px";
const propPool = Array.from({ length: 28 }, () => { const c = document.createElement("canvas"); c.width = 8; c.height = 8; $("props").appendChild(c); return c; });

// ------------------------------------------------------------------ camera + cursor (same grammar as production #01)
const VP = { x: 80, y: 510, w: 920, h: 960 };
function camRect(t) {
  if (t <= CAM[0][0]) return CAM[0][1];
  for (let i = 1; i < CAM.length; i++) { const [t1, r1] = CAM[i]; if (t <= t1) { const [t0, r0] = CAM[i - 1]; const u = E.inOut(clamp((t - t0) / (t1 - t0))); return r0.map((v, k) => lerp(v, r1[k], u)); } }
  return CAM.at(-1)[1];
}
function camAt(t) {
  const [x, y, w, h] = camRect(t), s = Math.max(1, Math.min(VP.w / w, VP.h / h));
  return { s, tx: clamp(VP.x + VP.w / 2 - s * (x + w / 2), 1080 - 1080 * s, 0), ty: clamp(VP.y + VP.h / 2 - s * (y + h / 2), 1920 - 1920 * s, 0) };
}
function cursorAt(t) {
  if (t <= CURSOR[0][0]) return CURSOR[0][1];
  for (let i = 1; i < CURSOR.length; i++) {
    const [t1, p1] = CURSOR[i];
    if (t <= t1) { const [t0, p0] = CURSOR[i - 1], u = clamp((t - t0) / (t1 - t0)), e = E.inOut(u), dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.max(1, Math.hypot(dx, dy)), arc = Math.sin(Math.PI * u) * 0.06 * L; return [p0[0] + dx * e - (dy / L) * arc, p0[1] + dy * e + (dx / L) * arc]; }
  }
  return CURSOR.at(-1)[1];
}
let CAMNOW = { s: 1, tx: 0, ty: 0 }, curT = 0;
const rectW = (el) => { const r = el.getBoundingClientRect(), { s, tx, ty } = CAMNOW; return { x: (r.left - tx) / s, y: (r.top - ty) / s, w: r.width / s, h: r.height / s }; };
// lay(): anchor from the element's untransformed layout position inside its page (scaled by the page's measured size) —
// independent of pop-in scale / flip rotation, and valid while the element is still invisible (opacity 0, kept in layout)
const A = {
  el: (id, fx, dy = 0) => () => { const r = rectW($(id)); return [r.x + r.w * fx, r.y + dy]; },
  lay: (id, fx, dy = 0) => () => { const e = $(id), pg = e.closest(".page"), pr = rectW(pg), k = pr.w / 568; return [pr.x + (e.offsetLeft + e.offsetWidth * fx) * k, pr.y + (e.offsetTop + dy) * k]; },
};

// ------------------------------------------------------------------ mascot choreography (segments on DOM top edges)
const SEG = [];
const stand = (t0, t1, at, o = {}) => SEG.push({ t0, t1, type: "stand", at, ...o });
const jump = (t0, t1, from, to, h, o = {}) => SEG.push({ t0, t1, type: "jump", from, to, h, ...o });
stand(-1, -0.1, A.el("tabA", 0.5));
jump(-0.1, 0.38, A.el("tabA", 0.5), A.el("pageA", 0.62), 40);
stand(0.38, 2.85, A.el("pageA", 0.62), { eyes: (t) => (t < 0.9 ? "d" : t < 1.6 ? "r" : "d"), mouth: (t) => (t > 1.6 && t < 2.6 ? "o" : "smile") });
jump(2.85, 3.2, A.el("pageA", 0.62), A.el("car", 0.5, 4), 50);
stand(3.2, 10.3, A.el("car", 0.5, 4), {
  stomps: [T.stomp],
  eyes: (t) => (t < 4.25 ? "n" : t < 5.6 ? "d" : t < 7.0 ? "r" : t < 8.85 ? "wide" : t < 9.75 ? "n" : "happy"),
  mouth: (t) => (t > 7.1 && t < 8.85 ? "o" : t >= 9.75 ? "grin" : "smile"),
  arms: (t) => (t > 7.1 && t < 8.85 ? "up" : t >= 9.8 && t < 10.4 ? "up" : "down"),
});
jump(10.3, 10.6, A.el("car", 0.5, 4), A.lay("tWS", 0.5), 60);
stand(10.6, 11.35, A.lay("tWS", 0.5), { eyes: "l" });
jump(11.35, 11.58, A.lay("tWS", 0.5), A.lay("tPW", 0.5), 40);
stand(11.58, 12.3, A.lay("tPW", 0.5), { eyes: "d" });
jump(12.3, 12.55, A.lay("tPW", 0.5), A.lay("tMP", 0.3), 70);
stand(12.55, 14.3, A.lay("tMP", 0.3), { eyes: (t) => (t < 13.3 ? "l" : "r") });
jump(14.3, 14.7, A.lay("tMP", 0.3), A.el("loudHead", 0.62), 60);
stand(14.7, 16.15, A.el("loudHead", 0.62), {
  stomps: [], eyes: (t) => (t < 15.45 ? "wide" : "shut"), mouth: (t) => (t < 15.45 ? "o" : "flat"), arms: (t) => (t > 15.45 ? "up" : "down"),
  bump: [T.loud1, T.loud3],
});
jump(16.15, 16.5, A.el("loudHead", 0.62), A.el("car", 0.5, 4), 50);
stand(16.5, 16.75, A.el("car", 0.5, 4), { eyes: "happy" });
jump(16.75, 17.1, A.el("car", 0.5, 4), A.el("pageC", 0.42), 70);
stand(17.1, 19.9, A.el("pageC", 0.42), { stomps: [18.2], eyes: (t) => (t < 17.6 ? "n" : t < 18.6 ? "l" : "n"), arms: (t) => (t > 17.95 && t < 18.6 ? "up" : "down"), mouth: (t) => (t > 17.95 && t < 18.6 ? "flat" : "smile") });
jump(19.9, 20.3, A.el("pageC", 0.42), A.lay("tool", 0.48, 30), 60);
stand(20.3, 23.4, A.lay("tool", 0.48, 30), { eyes: (t) => (t < 20.05 ? "n" : t < 21.2 ? "r" : t < 22.5 ? "n" : "r"), arms: (t) => (t > 22.7 && t < 23.3 ? "wave" : "down") });
jump(23.4, 23.7, A.lay("tool", 0.48, 30), A.el("headC", 0.78), 40);
stand(23.7, 25.8, A.el("headC", 0.78), { eyes: (t) => (t < 24.9 ? "d" : "n") });
jump(25.8, 26.05, A.el("headC", 0.78), A.lay("tagLim", 0.5), 40);
stand(26.05, 27.25, A.lay("tagLim", 0.5), { eyes: (t) => (t < 26.8 ? "d" : "u") });
jump(27.25, 27.55, A.lay("tagLim", 0.5), A.lay("tagLim", 0.5), 50);
stand(27.55, 28.2, A.lay("tagLim", 0.5), { arms: (t) => (t >= T.cheer ? "up" : "down"), eyes: (t) => (t >= T.cheer ? "happy" : "n"), mouth: (t) => (t >= T.cheer ? "grin" : "smile") });
jump(28.2, 28.6, A.lay("tagLim", 0.5), A.el("brandC", 0.82), 50);
stand(28.6, T.sleep, A.el("brandC", 0.82), { eyes: "happy" });
SEG.push({ t0: T.sleep, t1: 99, type: "sit", at: A.el("brandC", 0.82) });
const LANDINGS = SEG.filter((s) => s.type === "jump").map((s) => s.t1);
const BLINKS = [1.7, 4.9, 6.2, 11.2, 13.6, 17.4, 21.3, 24.2, 26.5];
const BEAT = 0.6;
const val = (v, t, d) => (typeof v === "function" ? v(t) : v ?? d);
function mascotAt(t) {
  const sg = SEG.find((s) => t >= s.t0 && t < s.t1) || SEG.at(-1);
  let p, pose = { legs: "stand", arms: val(sg.arms, t, "down"), eyes: val(sg.eyes, t, "n"), mouth: val(sg.mouth, t, "smile"), flip: false };
  if (sg.type === "jump") {
    const a = sg.from(), b = sg.to(), u = clamp((t - sg.t0) / (sg.t1 - sg.t0));
    p = [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(Math.PI * u) * sg.h];
    pose.legs = u < 0.12 ? "crouch" : u < 0.3 ? "stretch" : u > 0.92 ? "stretch" : "tuck";
    pose.flip = b[0] < a[0] - 2; pose.eyes = b[1] < a[1] - 30 ? "u" : u > 0.6 ? "d" : "n"; pose.mouth = "o"; pose.arms = u < 0.3 ? "down" : "up";
  } else {
    p = sg.at();
    if (sg.type === "sit") { pose.legs = "sit"; pose.eyes = "shut"; pose.arms = "down"; pose.mouth = "flat"; }
    const sinceLand = Math.min(...LANDINGS.map((l) => (t >= l ? t - l : 99)));
    if (sinceLand < 0.1) pose.legs = "crouch";
    else if (sg.type !== "sit" && t % BEAT < 0.09) p = [p[0], p[1] + 2.5];
    for (const st of sg.stomps || []) {
      const d = t - st;
      if (d > -0.16 && d < -0.08) pose.legs = "crouch";
      else if (d >= -0.08 && d < 0.06) { pose.legs = "tuck"; p = [p[0], p[1] - 16 * Math.sin((Math.PI * (d + 0.08)) / 0.14)]; pose.arms = "up"; }
      else if (d >= 0.06 && d < 0.14) pose.legs = "crouch";
    }
    for (const bt of sg.bump || []) { const d = t - bt; if (d >= 0 && d < 0.22) { p = [p[0] - 10 * Math.sin((Math.PI * d) / 0.22), p[1] - 14 * Math.sin((Math.PI * d) / 0.22)]; pose.legs = "tuck"; pose.eyes = "wide"; } }
  }
  if (BLINKS.some((b) => t >= b && t < b + 0.1) && !["happy", "shut", "wide"].includes(pose.eyes)) pose.eyes = "shut";
  return { p: [Math.round(p[0] / 2.5) * 2.5, Math.round(p[1] / 2.5) * 2.5], pose, sg };
}
function propsAt(t, m) {
  const out = [], head = [m.p[0], m.p[1] - SH * PX];
  if (t >= T.cross[0] && t < T.cross[1]) out.push({ n: "x", x: head[0] + 26, y: head[1] - 4 });
  if (t >= 15.5 && t < 16.1) out.push({ n: "bang", x: head[0] + 28, y: head[1] - 6 });
  for (const [ts, n] of [[9.8, 6], [16.5, 5], [27.92, 8]]) {
    const d = t - ts; if (d < 0 || d > 0.55) continue; const r = rng(Math.round(ts * 100));
    for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, rr = 30 + r() * 30; if (Math.floor((d + i * 0.05) / 0.1) % 2 === 0) out.push({ n: "spark", x: head[0] + Math.cos(a) * rr * (0.5 + d), y: head[1] + 40 + Math.sin(a) * rr * (0.5 + d) }); }
  }
  for (const l of LANDINGS) { const d = t - l; if (d < 0 || d > 0.28) continue; for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1, k = Math.floor(i / 2); out.push({ n: "dust", x: m.p[0] + side * (20 + k * 8 + d * 90), y: m.p[1] - 5 - k * 5 - d * 20 }); } }
  if (t >= T.sleep) for (let i = 0; i < 3; i++) { const d = ((t - T.sleep) * 0.9 + i * 0.33) % 1; out.push({ n: "z", x: m.p[0] + 30 + d * 30, y: m.p[1] - 80 - d * 70, a: Math.sin(Math.PI * d) }); }
  return out;
}

// ------------------------------------------------------------------ captions + keys HUD
let capShown = -1;
function captions(t) {
  const i = CAPS.findIndex((c) => t >= c.t0 && t < c.t1), cap = $("cap");
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
const typed = (str, t0, t1, t) => str.slice(0, Math.floor(clamp((t - t0) / (t1 - t0)) * str.length + 1e-6));
function keysHud(t) {
  const k = $("keys"); let html = "";
  const show = (s) => `<span class="txt">${s.slice(-22) || "&nbsp;"}</span>${s ? `<span class="k">${s.at(-1) === " " ? "␣" : s.at(-1)}</span>` : ""}`;
  if (t >= T.typeA[0] && t < T.typeA[1] + 0.3) html = show(typed(HEAD_A, ...T.typeA, t));
  else if (t >= T.typeC[0] && t < T.typeC[1] + 0.3) html = show(typed(HEAD_C, ...T.typeC, t));
  k.innerHTML = html; k.style.display = html ? "flex" : "none";
}
const pop = (t, t0, d = 0.25) => (t < t0 ? 0 : E.outBack(clamp((t - t0) / d)));
const show = (el, o, sc = 1, extra = "") => { el.style.opacity = String(o); el.style.transform = `scale(${sc})${extra}`; el.style.display = o > 0.001 ? "" : "none"; };

// ------------------------------------------------------------------ frame
let lastHeadA = "", lastHeadC = "", lastTag = "";
function frame(t) {
  curT = t;
  const cam = camAt(t), prev = camAt(Math.max(0, t - 1 / 30)); CAMNOW = cam;
  $("world").style.transform = `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`;
  $("mbBlur").setAttribute("stdDeviation", "0 0"); $("film").style.filter = "none"; // no whips in this episode: moves stay sharp

  // stepper / toolbar / tabs / status
  const step = t < 10.6 ? 1 : t < 13.25 ? 2 : t < T.expand[0] ? 3 : t < T.allDone ? 4 : 5;
  for (let i = 1; i <= 4; i++) $("st" + i).className = "step" + (i === step ? " on" : i < step ? " done" : "");
  $("cmp").className = t >= T.compare && t < T.swapPage[0] ? "on" : "";
  $("tabA").className = "tab" + (t < T.expand[0] ? " on" : ""); $("tabA").style.display = t < T.expand[1] ? "" : "none";
  $("tabB").style.display = t >= T.split[0] && t < T.swapPage[0] + 0.1 ? "" : "none"; $("tabB").className = "tab" + (t >= T.split[0] && t < T.swapPage[0] ? " on" : "");
  $("tabC").style.display = t >= T.swapPage[0] ? "" : "none"; $("tabC").className = "tab" + (t >= T.swapPage[0] ? " on" : "");
  $("tabC").textContent = t >= T.expand[0] ? "Compact tool · original example" : "Your product";
  $("saved").textContent = t >= T.allDone ? "Saved · ready for review" : "Draft";

  // pages: reconstruction (A), generic loud (B), your product / compact tool (C)
  const sp = ramp(t, ...T.split, E.inOut), ex = ramp(t, ...T.expand, E.inOut);
  const sA = lerp(1, 0.78, sp);
  $("pageA").style.transform = `translate(${-560 * ex}px, 0) scale(${sA})`; $("pageA").style.opacity = String(1 - ex);
  const slot = 469;
  const bIn = ramp(t, T.split[0] + 0.05, T.split[1] + 0.05, E.out), bOut = ramp(t, ...T.swapPage, E.inOut);
  const pB = $("pageB"); pB.style.display = t >= T.split[0] && t < T.swapPage[1] ? "" : "none";
  pB.style.transform = `translate(${lerp(940, slot, bIn) + 470 * bOut}px, 0) scale(0.78)`;
  const rk = ramp(t, ...T.rack, E.inOut); pB.style.filter = rk > 0.01 ? `blur(${(3 * rk).toFixed(2)}px) saturate(${1 - 0.4 * rk})` : "none"; pB.style.opacity = String(1 - 0.45 * rk);
  const pC = $("pageC"), cIn = ramp(t, T.swapPage[0] + 0.05, T.swapPage[1] + 0.05, E.out);
  pC.style.display = t >= T.swapPage[0] ? "" : "none";
  pC.style.transform = `translate(${lerp(lerp(940, slot, cIn), 0, ex)}px, 0) scale(${lerp(0.78, 1, ex)})`;
  // inspector panels
  const iA = $("inspA"), iC = $("inspC");
  iA.style.display = t < T.split[1] ? "" : "none"; iA.style.transform = `translateX(${360 * sp}px)`; iA.style.opacity = String(1 - sp);
  iC.style.display = t >= T.expand[0] ? "" : "none"; const ic = ramp(t, T.expand[0] + 0.15, T.expand[1] + 0.05, E.out); iC.style.transform = `translateX(${360 * (1 - ic)}px)`; iC.style.opacity = String(ic);

  // --- page A content
  const cur = cursorAt(t);
  const car = $("car"), dc = $("dragCar");
  let carScale = 1;
  // the cursor drags the resize handle (pretending it is bigger); the mascot's stomp springs it back to small
  if (t >= T.resize[0]) { const c = cursorAt(Math.min(t, T.resize[1])); carScale = clamp((c[0] - 234) / 110, 1, 2.8); }
  if (t >= T.shrink[0]) { const d = t - T.shrink[0]; carScale = 1 + (carScale - 1) * Math.exp(-12 * d) * Math.cos(18 * d); }
  car.style.display = t >= T.carDrag[1] ? "" : "none";
  car.style.transform = `scale(${carScale * (t < T.carDrag[1] + 0.2 ? 0.85 + 0.15 * E.outBack(ramp(t, T.carDrag[1], T.carDrag[1] + 0.2)) : 1)})`;
  // drag ghosts (car asset, tool asset) follow the cursor
  if (t >= T.carDrag[0] && t < T.carDrag[1]) { dc.style.display = ""; dc.innerHTML = smallCarSVG(); dc.style.left = cur[0] - 58 + "px"; dc.style.top = cur[1] - 28 + "px"; dc.style.opacity = "0.85"; }
  else if (t >= T.toolDrag[0] && t < T.toolDrag[1]) { dc.style.display = ""; if (!dc.dataset.tool) { dc.innerHTML = `<div style="transform:scale(0.5);transform-origin:0 0">${toolSVG()}</div>`; dc.dataset.tool = 1; } dc.style.left = cur[0] - 75 + "px"; dc.style.top = cur[1] - 57 + "px"; dc.style.opacity = "0.85"; }
  else { dc.style.display = "none"; if (dc.dataset.tool && t < T.toolDrag[0]) delete dc.dataset.tool; }
  // selection box + resize handle while the cursor works on the car
  const selOn = t >= 6.9 && t < T.shrink[0] + 0.1;
  const cw = 110 * carScale, ch = 52 * carScale;
  $("selbox").style.display = selOn ? "" : "none"; $("handle").style.display = selOn ? "" : "none";
  Object.assign($("selbox").style, { left: 146 + "px", top: 146 + "px", width: cw + 8 + "px", height: ch + 8 + "px" });
  Object.assign($("handle").style, { left: 150 + cw - 6 + "px", top: 150 + ch - 6 + "px" });
  const rg = Math.max(win(t, ...T.ring, 0.2, 0.25), 0.8 * win(t, ...T.carPulse, 0.15, 0.25)); $("ring").style.display = rg > 0 ? "" : "none";
  Object.assign($("ring").style, { left: 150 - 36 + "px", top: 150 - 58 + "px", width: 182 + "px", height: 168 + "px", opacity: String(rg), transform: `scale(${0.8 + 0.2 * rg})` });
  // headline A typed
  const hA = t < T.typeA[0] ? "" : typed(HEAD_A, ...T.typeA, t);
  if (hA !== lastHeadA) { $("headA").textContent = hA; lastHeadA = hA; }
  for (const c of document.querySelectorAll(".copyA")) c.style.opacity = String(ramp(t, 5.3, 5.7));
  $("logoA").style.opacity = String(ramp(t, 5.5, 5.8));
  // anatomy annotations (white space / plain words / modest photo)
  const annOut = 1 - ramp(t, ...T.annOut);
  [["anWS", "tWS", "ly1", T.annWS], ["anPW", "tPW", "ly2", T.annPW], ["anMP", "tMP", "ly3", T.annMP]].forEach(([a, tg, ly, t0]) => {
    const u = pop(t, t0 - 0.05) * annOut; show($(a), Math.min(1, u) * (t < 13.4 ? 1 : 1 - ramp(t, 13.4, 13.7)), 0.96 + 0.04 * Math.min(1, u)); $(tg).style.opacity = String(Math.min(1, u)); $(tg).style.transform = `scale(${Math.max(0.001, u)})`;
    $(ly).className = "layer" + (t >= t0 ? " ok" : "");
  });

  // --- page B (generic loud layout) builds on the spoken words
  const lc = pop(t, T.loudCar, 0.3); $("loudCar").style.transform = `scale(${Math.max(0.001, lc)}) rotate(${Math.sin(t * 7) * 1.2}deg)`; $("loudCar").style.opacity = String(Math.min(1, lc));
  [...$("loudHead").children].forEach((s, i) => { const u = pop(t, [T.loud1, T.loud2, T.loud3][i], 0.2); s.style.opacity = String(Math.min(1, u)); s.style.transform = `scale(${Math.max(0.001, u)}) translateX(${Math.sin(t * 9 + i) * 3}px)`; });
  [["b1", T.loud1], ["b2", T.loud3]].forEach(([id, t0]) => { const u = pop(t, t0 + 0.04, 0.22); $(id).style.opacity = String(Math.min(1, u)); $(id).style.transform = `scale(${Math.max(0.001, u)}) rotate(${(t - t0) * 40}deg)`; });
  [...$("loudBadges").children].forEach((b, i) => { const u = pop(t, 15.55 + i * 0.08, 0.18); b.style.opacity = String(Math.min(1, u)); b.style.scale = String(Math.max(0.001, u)); });

  // --- page C: blank "your product" → original compact-tool example
  $("pcBlank").style.opacity = String(1 - ramp(t, 19.4, 19.7));
  $("pcLabel").textContent = t >= 19.5 ? "ORIGINAL EXAMPLE · FICTIONAL PRODUCT · ILLUSTRATIVE" : "YOUR PRODUCT";
  $("tool").style.opacity = t >= T.toolDrag[1] ? "1" : "0"; $("tool").style.transform = `scale(${0.85 + 0.15 * pop(t, T.toolDrag[1], 0.25)})`;
  $("subC").style.opacity = String(ramp(t, 19.9, 20.3)); $("brandC").style.opacity = String(ramp(t, 19.9, 20.3));
  const hC = t < T.typeC[0] ? "" : typed(HEAD_C, ...T.typeC, t);
  const hCk = hC + (t >= T.headClick && t < T.typeC[1] + 0.3 ? "|" : "");
  if (hCk !== lastHeadC) { $("headC").innerHTML = hC.replace("Fewer bits. ", "Fewer bits.<br>") + (t >= T.headClick && t < T.typeC[1] + 0.3 ? `<span style="display:inline-block;width:3px;height:40px;background:#6234FB;vertical-align:-6px;margin-left:2px"></span>` : ""); lastHeadC = hCk; }
  $("headC").className = t >= T.headClick && t < T.typeC[1] + 0.3 ? "sel" : "";
  $("headC").style.display = t >= 19.5 ? "" : "none";
  // limitation → reason-to-choose tag (cursor flips it)
  const tg = $("tagLim"), fl = ramp(t, ...T.flip, E.inOut), flipped = fl >= 0.5;
  const tk = flipped ? "r" : "l";
  if (tk !== lastTag) { tg.innerHTML = flipped ? "REASON TO CHOOSE · fits your pocket ✓" : "LIMITATION · fewer bits"; lastTag = tk; }
  Object.assign(tg.style, { background: flipped ? "#6234FB" : "#FFFFFF", color: flipped ? "#FFFFFF" : "#1B1433", border: flipped ? "2px solid #6234FB" : "2px solid #1B1433" });
  const tgo = pop(t, T.tag - 0.07, 0.25); tg.style.opacity = String(Math.min(1, tgo));
  tg.style.transform = `scale(${Math.max(0.001, tgo)}) rotateX(${(flipped ? 1 - fl : fl) * 90}deg)`;
  // inspector cards (compact)
  show($("cTrade"), t >= T.trade ? 1 : 0, 0.9 + 0.1 * pop(t, T.trade)); show($("cCust"), t >= T.cust ? 1 : 0, 0.9 + 0.1 * pop(t, T.cust));
  const rs = t >= 27.3; $("cReason").className = "icard" + (rs ? "" : " empty"); $("reasonT").textContent = rs ? "Small enough to carry" : "—";
  $("cReason").style.borderColor = rs ? "#6234FB" : ""; $("cReason").style.borderWidth = rs ? "2px" : "";
  [["ck1", T.tick1], ["ck2", T.tick2], ["ck3", T.tick3]].forEach(([id, tt]) => ($(id).className = "layer" + (t >= tt ? " ok" : "")));
  $("assetTool").style.opacity = t >= T.toolDrag[0] && t < T.toolDrag[1] ? "0.45" : "1";
  $("assetCar").style.opacity = t >= T.carDrag[0] && t < T.carDrag[1] ? "0.45" : "1";

  // --- template ghost: "don't copy that layout" (dragged, rejected, bounces back)
  const gh = $("ghost");
  if (t >= T.ghost[0] && t < T.ghostBack[1]) {
    gh.style.display = "";
    let p = cur, o = 1, rot = 0;
    if (t >= T.ghost[1]) { const c1 = cursorAt(T.ghost[1]); p = [c1[0] + wobble(t, T.ghost[1], 14, 9, 7), c1[1]]; rot = wobble(t, T.ghost[1], 4, 9, 7); }
    if (t >= T.ghostBack[0]) { const u = ramp(t, ...T.ghostBack, E.inOut), c1 = cursorAt(T.ghost[1]), back = [300, 900]; p = [lerp(c1[0], back[0], u), lerp(c1[1], back[1], u) - Math.sin(Math.PI * u) * 60]; o = 1 - u; rot = -20 * u; }
    gh.style.left = p[0] - 90 + "px"; gh.style.top = p[1] - 118 + "px"; gh.style.opacity = String(o * ramp(t, T.ghost[0], T.ghost[0] + 0.12)); gh.style.transform = `rotate(${rot}deg) scale(${t < T.ghost[0] + 0.15 ? 0.8 + 0.2 * ramp(t, T.ghost[0], T.ghost[0] + 0.15) : 1})`;
    gh.style.borderColor = t >= T.cross[0] ? "#1B1433" : "";
  } else gh.style.display = "none";

  // --- connector: right customer → ad headline
  const lk = $("link"), lu = ramp(t, ...T.link, E.out), lo = 1 - ramp(t, 24.9, 25.2);
  if (t >= T.link[0] && lo > 0) {
    const a0 = rectW($("cCust")), b0 = rectW($("headC")), a = [a0.x + 8, a0.y + a0.h / 2], b = [b0.x + b0.w - 10, b0.y + 20], c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 60];
    let d = `M${a[0]} ${a[1]}`; for (let i = 1; i <= Math.round(30 * lu); i++) { const u = i / 30; d += ` L${(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0]} ${(1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]}`; }
    lk.setAttribute("d", d); lk.setAttribute("stroke-dashoffset", String(-t * 40)); lk.style.opacity = lo;
  } else lk.setAttribute("d", "");

  // --- mascot (measured after all layout updates)
  const m = mascotAt(t); drawMascot(mctx, m.pose);
  mascot.style.left = m.p[0] - (SW * PX) / 2 + "px"; mascot.style.top = m.p[1] - SH * PX + "px";
  const props = propsAt(t, m);
  propPool.forEach((c, i) => { const p = props[i]; if (!p) { c.style.display = "none"; return; } const [w, h] = drawProp(c.getContext("2d"), p.n); c.style.display = "block"; c.style.width = w * PX + "px"; c.style.height = h * PX + "px"; c.style.left = Math.round(p.x / 2.5) * 2.5 + "px"; c.style.top = Math.round((p.y - h * PX) / 2.5) * 2.5 + "px"; c.style.opacity = String(p.a ?? 1); });

  // --- cursor
  const cu = $("cursor"), clickD = Math.min(...CLICKS.map((c) => (t >= c ? t - c : 9)));
  cu.style.left = cur[0] - 3 + "px"; cu.style.top = cur[1] - 3 + "px"; cu.style.transform = `scale(${1 - (clickD < 0.16 ? 0.16 * Math.sin((Math.PI * clickD) / 0.16) : 0)})`;
  const rp = $("ripple"); rp.style.left = cur[0] + "px"; rp.style.top = cur[1] + "px"; rp.style.opacity = clickD < 0.35 ? String(0.9 * (1 - clickD / 0.35)) : "0"; rp.style.transform = `scale(${0.4 + clickD * 2.2})`;

  // --- screen-space layers
  $("vign").style.opacity = String(win(t, 25.45, 27.9, 0.35, 0.45));
  $("dim").style.opacity = String(0.26 * ramp(t, ...T.dim));
  captions(t); keysHud(t);
}

window.__frame = (t) => frame(t);
window.__bounds = (t) => { frame(t); const lines = [...document.querySelectorAll("#cap .ln")].map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; }); const pill = document.querySelector("#cap .pill"), pr = pill ? pill.getBoundingClientRect() : null, mr = $("mascot").getBoundingClientRect(); return { lines, pill: pr ? [pr.left, pr.top, pr.right, pr.bottom] : null, mascot: [mr.left, mr.top, mr.right, mr.bottom] }; };
window.__info = () => ({ nodes: document.getElementsByTagName("*").length, caps: CAPS.map((c) => [c.line, +c.t0.toFixed(2), +c.t1.toFixed(2)]) });
const Q = new URLSearchParams(location.search);
frame(+(Q.get("t") || 0));
window.__ready = true;
