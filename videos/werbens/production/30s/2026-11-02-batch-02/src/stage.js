// Original vector drawings for production 30 s #02 (no photos, no logos, nothing traced from the 1959 ad).
// smallCar: a generic compact rounded car silhouette used in the analytical reconstruction.
export function smallCarSVG(w = 110, h = 52) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 110 52" preserveAspectRatio="none" style="overflow:visible">
    <path d="M10 38 Q8 20 30 14 Q46 4 64 6 Q84 8 94 24 Q104 28 102 38 Z" fill="#26213A"/>
    <path d="M38 14 Q50 8 62 9 L64 22 L36 22 Z" fill="#8E88A6"/><path d="M66 10 Q80 12 86 23 L67 23 Z" fill="#8E88A6"/>
    <rect x="8" y="34" width="96" height="6" rx="3" fill="#3A3452"/>
    <circle cx="30" cy="42" r="9" fill="#141022"/><circle cx="30" cy="42" r="3.5" fill="#B9B3CC"/>
    <circle cx="84" cy="42" r="9" fill="#141022"/><circle cx="84" cy="42" r="3.5" fill="#B9B3CC"/>
  </svg>`;
}
// loudCar: a long, low generic 1950s-style sedan with fins (illustrative "louder" comparison)
export function loudCarSVG() {
  return `<svg width="528" height="150" viewBox="0 0 528 150">
    <path d="M8 104 L30 70 Q120 54 200 52 L262 26 Q330 18 380 40 L470 50 L520 30 L516 98 Z" fill="#F0EAFC"/>
    <path d="M14 106 L516 100 L510 118 Q300 128 20 122 Z" fill="#CCC0F7"/>
    <path d="M40 90 L500 80" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round"/>
    <path d="M272 32 Q330 26 370 44 L276 50 Z" fill="#6234FB" opacity="0.55"/><path d="M210 54 L262 32 L268 52 Z" fill="#6234FB" opacity="0.55"/>
    <circle cx="112" cy="120" r="24" fill="#1B1433"/><circle cx="112" cy="120" r="10" fill="#FFFFFF"/>
    <circle cx="418" cy="118" r="24" fill="#1B1433"/><circle cx="418" cy="118" r="10" fill="#FFFFFF"/>
  </svg>`;
}
export function burstSVG(text, r = 70, fill = "#FFFFFF", ink = "#4A1FD6") {
  let d = ""; const n = 16;
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.72 : r; d += `${i ? "L" : "M"}${r + Math.cos(a) * rr} ${r + Math.sin(a) * rr} `; }
  return `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}"><path d="${d}Z" fill="${fill}"/><text x="${r}" y="${r + r * 0.17}" text-anchor="middle" font-family="IDBlack" font-size="${r * 0.46}" fill="${ink}">${text}</text></svg>`;
}
// tool: fictional pocket screwdriver ("Mini Driver") slipping into a pocket outline
export function toolSVG(pocket = 1) {
  return `<svg width="300" height="230" viewBox="0 0 300 230">
    <g opacity="${pocket}"><path d="M40 70 L260 70 L250 210 Q150 226 50 210 Z" fill="#E9E3FB" stroke="#CFC4F5" stroke-width="3"/>
    <path d="M40 70 L260 70 L256 96 Q150 106 44 96 Z" fill="#DCD3FA"/><path d="M60 120 Q150 132 240 120" stroke="#CFC4F5" stroke-width="3" fill="none" stroke-dasharray="7 7"/></g>
    <g transform="rotate(-18 150 120)">
      <rect x="118" y="20" width="64" height="120" rx="26" fill="#6234FB"/><rect x="132" y="34" width="12" height="92" rx="6" fill="#8C6CFB"/>
      <rect x="140" y="140" width="20" height="44" rx="5" fill="#9C96AE"/><path d="M142 184 L158 184 L154 204 L146 204 Z" fill="#6E6886"/>
      <circle cx="150" cy="40" r="7" fill="#F0EAFC"/>
    </g>
  </svg>`;
}
