// fluid.frag: half-resolution pass. Domain-warped organic fluid whose density envelope is
// pulled toward the current story shape (bloom -> ring -> glass -> logo). Output: rgb colour,
// a = density. Pure function of uniforms (u_time is the only clock).
@@COMMON@@

uniform float u_time;
uniform vec2  u_res;
uniform float u_front;   // A: radius of the bloom front
uniform vec4  u_w;       // envelope weights: x bloom, y ring, z glass, w logo
uniform float u_ring;    // B: how tightly the fluid hugs the ring (0 loose, 1 tight)
uniform float u_melt;    // C: downward drip of the ring
uniform float u_level;   // C: water level 0..1 inside the glass
uniform float u_vortex;  // D: swirl strength
uniform float u_logo;    // D: tightness around the logo
uniform float u_base;    // ambient mist
uniform float u_energy;  // turbulence

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y * 2.0;
  float t = u_time;
  vec2 q = p;

  // D: vortex twist (strongest near the centre of the drain), centre slides from glass to logo
  vec2 vc = mix(GLASS_C + vec2(0.0, 0.1), LOGO_C, smoothstep(0.35, 1.0, u_logo));
  vec2 dv = q - vc;
  float rv = length(dv);
  q = vc + rot(u_vortex * 6.0 / (rv * 4.0 + 0.35)) * dv;

  // B: tangential flow around the plate ring
  vec2 dr = q - RING_C;
  float band = exp(-pow((length(dr) - RING_R) / 0.22, 2.0));
  q = RING_C + rot(u_w.y * band * (0.6 + 0.9 * t * 0.25)) * dr;

  // C: gravity drip
  q.y += u_melt * u_melt * (0.35 + 0.5 * fbm3(vec2(q.x * 3.0, t * 0.7)));

  vec2 qq;
  float n = warped(q * 0.62 + vec2(0.0, -0.05 * t), t * u_energy, qq);
  float v = clamp(0.5 + 0.7 * n, 0.0, 1.0);
  float lum = smoothstep(0.28, 0.98, v);   // mostly black, luminous green ribbons

  // envelopes for each story shape
  float eA = smoothstep(u_front, u_front - 0.42, length(p - IMPACT));
  float dRing = abs(length(p - RING_C) - RING_R);
  float eB = exp(-pow(dRing / mix(0.85, 0.075, u_ring), 2.0)) + 0.6 * exp(-pow(sdFork(p) / mix(0.6, 0.05, u_ring), 2.0)) * u_ring;
  float lvl = (GLASS_C.y - GLASS_HH) + 2.0 * GLASS_HH * u_level + 0.02 * sin(p.x * 18.0 + t * 5.0);
  float eC = smoothstep(0.02, -0.03, sdGlass(p)) * smoothstep(0.03, -0.03, p.y - lvl);
  float eD = exp(-pow(min(sdLogoRing(p), sdLeaf(p)) / mix(0.7, 0.04, u_logo), 2.0));
  float env = clamp(eA * u_w.x + eB * u_w.y + eC * u_w.z + eD * u_w.w + u_base, 0.0, 1.0);

  // filaments: thin bright veins where the warped field crosses iso-levels
  float iso = abs(fract(v * 5.0 + 0.1 * t) - 0.5);
  float vein = (1.0 - smoothstep(0.0, 0.06, iso)) * smoothstep(0.5, 0.9, v);
  vec3 col = brand(lum * (0.25 + 0.8 * env));
  col += LIME * vein * 0.28 * env;
  col *= mix(0.10, 1.0, env);
  gl_FragColor = vec4(col, env);
}
