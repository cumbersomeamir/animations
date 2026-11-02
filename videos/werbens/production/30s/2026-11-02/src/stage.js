// The ad's image frame (444×410): a studio product shot of the FICTIONAL "Demo Pack", which becomes a rain-commute
// miniature ("the screen becomes a stage"). Pure function of its parameters → SVG markup.
const W = 444, H = 410;
const PACK = { body: "#B9A7F6", flap: "#9C86EE", pocket: "#CBBEF9", strap: "#4A1FD6", zip: "#6234FB" };

// Backpack, front view, centred at (cx, cy), scale s
export function packFront(cx, cy, s = 1) {
  const g = (x, y) => `${cx + x * s},${cy + y * s}`;
  return `<g>
    <path d="M${g(-34, -78)} C${g(-34, -104)} ${g(34, -104)} ${g(34, -78)}" fill="none" stroke="${PACK.strap}" stroke-width="${7 * s}" stroke-linecap="round"/>
    <rect x="${cx - 62 * s}" y="${cy - 82 * s}" width="${124 * s}" height="${164 * s}" rx="${34 * s}" fill="${PACK.body}"/>
    <path d="M${g(-62, -40)} Q${g(-62, -82)} ${g(-20, -82)} L${g(20, -82)} Q${g(62, -82)} ${g(62, -40)} L${g(62, -14)} Q${g(0, 6)} ${g(-62, -14)} Z" fill="${PACK.flap}"/>
    <rect x="${cx - 40 * s}" y="${cy + 14 * s}" width="${80 * s}" height="${54 * s}" rx="${14 * s}" fill="${PACK.pocket}"/>
    <line x1="${cx - 28 * s}" y1="${cy + 26 * s}" x2="${cx + 28 * s}" y2="${cy + 26 * s}" stroke="${PACK.zip}" stroke-width="${3 * s}" stroke-linecap="round"/>
    <rect x="${cx - 9 * s}" y="${cy - 18 * s}" width="${18 * s}" height="${10 * s}" rx="${3 * s}" fill="${PACK.strap}"/>
  </g>`;
}

function city(scroll) {
  let out = "";
  const cols = ["#9C8DE0", "#8A78D8", "#A99BE6"];
  for (let i = -1; i < 9; i++) {
    const x = ((i * 74 - scroll * 0.35) % 666 + 666) % 666 - 80, h = 120 + ((i * 53) % 70), w = 62;
    out += `<rect x="${x}" y="${310 - h}" width="${w}" height="${h}" fill="${cols[(i + 9) % 3]}"/>`;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) if ((i + r + c) % 3) out += `<rect x="${x + 9 + c * 17}" y="${310 - h + 14 + r * 26}" width="9" height="12" rx="2" fill="#D7CEF7" opacity="0.65"/>`;
  }
  return out;
}

export const walkBob = (t, walking) => (walking ? Math.abs(Math.cos(t * 2 * Math.PI * 1.8)) * 3 : 0);
function commuter(t, walking) {
  // stylised walker facing right, pack on the back; walk cycle only while walking
  const ph = walking ? Math.sin(t * 2 * Math.PI * 1.8) : 0, bob = walkBob(t, walking);
  const x = 262, y = 330 - bob;
  const leg = (a, col) => `<line x1="${x}" y1="${y - 64}" x2="${x + Math.sin(a) * 26}" y2="${y - 64 + Math.cos(a) * 62}" stroke="${col}" stroke-width="12" stroke-linecap="round"/>`;
  return `<g>
    ${leg(ph * 0.45, "#2A1E6B")}${leg(-ph * 0.45, "#1B1433")}
    <rect x="${x - 26}" y="${y - 150}" width="52" height="94" rx="22" fill="#3B2C8F"/>
    <line x1="${x + 6}" y1="${y - 128}" x2="${x + 6 + Math.sin(-ph * 0.5) * 30}" y2="${y - 128 + Math.cos(ph * 0.5) * 50}" stroke="#2F2378" stroke-width="12" stroke-linecap="round"/>
    <circle cx="${x + 4}" cy="${y - 172}" r="22" fill="#EDE5FF"/>
    <path d="M${x - 18} ${y - 176} Q${x - 4} ${y - 202} ${x + 26} ${y - 180} L${x + 24} ${y - 170} Q${x + 2} ${y - 186} ${x - 18} ${y - 168} Z" fill="#2A1E6B"/>
    <circle cx="${x + 15}" cy="${y - 172}" r="2.6" fill="#1B1433"/>
    <rect x="${x - 58}" y="${y - 146}" width="40" height="82" rx="14" fill="${PACK.body}"/>
    <rect x="${x - 58}" y="${y - 146}" width="40" height="26" rx="12" fill="${PACK.flap}"/>
    <line x1="${x - 20}" y1="${y - 140}" x2="${x - 4}" y2="${y - 138}" stroke="${PACK.strap}" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

// p: { mode: 'product'|'stage', t, scroll, rain, notebook, dry, badge, walking, popIn }
export function photoSVG(p) {
  if (p.mode === "empty") return `<svg width="444" height="400" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="#F6F2FF"/><rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="12" fill="none" stroke="#D6CDF6" stroke-width="3" stroke-dasharray="10 9"/><text x="222" y="212" font-family="ISB" font-size="20" text-anchor="middle" fill="#ADA4D3">＋ Add product image</text></svg>`;
  if (p.mode === "product") {
    const s = 1.25 * (0.6 + 0.4 * p.popIn);
    return `<svg width="444" height="400" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
      <defs><radialGradient id="pg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#FBF8FF"/><stop offset="1" stop-color="#E4DBFC"/></radialGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#pg)"/>
      <ellipse cx="222" cy="${318}" rx="${92 * p.popIn}" ry="${14 * p.popIn}" fill="#6234FB" opacity="0.12"/>
      <g opacity="${p.popIn}">${packFront(222, 206, s)}</g>
      <text x="16" y="${H - 18}" font-family="ISB" font-size="14" fill="#9A92BD">Product photo · fictional</text>
    </svg>`;
  }
  const t = p.t, sc = p.scroll;
  let rain = "";
  const n = Math.round(40 + 40 * p.rain);
  for (let i = 0; i < n; i++) {
    const x0 = (i * 97.3) % (W + 60) - 30, sp = 380 + (i % 5) * 40, y = ((t * sp + i * 53) % (H + 40)) - 30;
    rain += `<line x1="${x0 + y * 0.18}" y1="${y}" x2="${x0 + y * 0.18 + 4}" y2="${y + 16}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="${0.35 + 0.35 * p.rain}"/>`;
  }
  // puddle ripples
  let rip = "";
  for (let i = 0; i < 5; i++) { const ph = ((t * 0.9 + i * 0.37) % 1), cx = 40 + ((i * 89 - sc * 0.9) % 420 + 420) % 420; rip += `<ellipse cx="${cx}" cy="${372 + (i % 2) * 14}" rx="${4 + ph * 22}" ry="${1.5 + ph * 5}" fill="none" stroke="#D7CEF7" stroke-width="2" opacity="${0.8 * (1 - ph)}"/>`; }
  // water beading on the fabric and rolling off (the feature at work)
  let drops = "";
  if (p.badge > 0.5) for (let i = 0; i < 5; i++) {
    const ph = ((t * 0.8 + i * 0.21) % 1), x = 211 + (i % 3) * 10 - 3, y = 186 + ph * 92, r = 3.6 - ph * 0.8;
    drops += `<circle cx="${x + Math.sin(i + ph * 3) * 2}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="${0.95 * Math.min(1, ph * 6) * (1 - ph * 0.3)}"/><circle cx="${x - 1}" cy="${y - 1}" r="1.2" fill="#E8E1FF"/>`;
  }
  const busX = ((380 - sc * 0.9) % 560 + 560) % 560 - 40;
  const nb = p.notebook, dry = p.dry;
  return `<svg width="444" height="400" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC6EE"/><stop offset="1" stop-color="#B3A7E2"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${city(sc)}
    <g><rect x="${busX}" y="190" width="8" height="140" fill="#4A3A9C"/><rect x="${busX - 26}" y="168" width="60" height="38" rx="8" fill="#F0EAFC"/><text x="${busX + 4}" y="194" font-family="IB" font-size="18" text-anchor="middle" fill="#4A1FD6">BUS</text></g>
    <rect id="pavement" x="0" y="330" width="${W}" height="${H - 330}" fill="#6B5AC4"/>
    <rect x="0" y="330" width="${W}" height="6" fill="#8E7FDB"/>
    ${rip}
    ${commuter(t, p.walking)}
    ${drops}
    <g opacity="${p.badge}"><rect id="packBadge" x="164" y="${232}" width="120" height="24" rx="12" fill="#FFFFFF" stroke="#6234FB" stroke-width="2"/><text x="224" y="249" font-family="IB" font-size="12" text-anchor="middle" fill="#1B1433">water-resistant</text></g>
    <g opacity="${nb}" transform="translate(378 146) scale(${0.6 + 0.4 * nb})">
      <circle r="58" fill="#FFFFFF" stroke="#6234FB" stroke-width="3"/>
      <rect x="-30" y="-36" width="54" height="68" rx="6" fill="#F0EAFC" stroke="#4A1FD6" stroke-width="2.5"/>
      <rect x="-30" y="-36" width="9" height="68" rx="3" fill="#CCC0F7"/>
      <line x1="-14" y1="-18" x2="16" y2="-18" stroke="#9A8FD0" stroke-width="2.5"/><line x1="-14" y1="-6" x2="16" y2="-6" stroke="#9A8FD0" stroke-width="2.5"/><line x1="-14" y1="6" x2="10" y2="6" stroke="#9A8FD0" stroke-width="2.5"/>
      <g opacity="${dry}"><rect x="-6" y="30" width="62" height="26" rx="13" fill="#6234FB"/><text x="25" y="48" font-family="IB" font-size="15" text-anchor="middle" fill="#FFFFFF">dry ✓</text></g>
    </g>
    <line x1="244" y1="196" x2="318" y2="164" stroke="#FFFFFF" stroke-width="3" opacity="${nb * 0.8}" stroke-dasharray="3 6"/>
    ${rain}
    <text x="16" y="${H - 18}" font-family="ISB" font-size="14" fill="#E8E1FF">Illustration · fictional product</text>
  </svg>`;
}
