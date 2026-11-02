// common.glsl: shared GLSL for the NutriAI shader test.
// Noise, fbm, domain warp, SDF library and cosine palette follow the shader-glsl skill
// (iart-ai/webgl-animation-skills, SKILL.md + references/glsl-cookbook.md); simplex noise is the
// public-domain Ashima/Gustavson version quoted there. Colours are re-tuned to the NutriAI icon.
precision highp float;
#define PI 3.14159265359
#define TAU 6.28318530718

// Brand palette sampled from videos/nutriai/assets/icon.png (median per cluster).
const vec3 INK  = vec3(0.0824, 0.1176, 0.0863); // #151E16
const vec3 LEAF = vec3(0.3529, 0.7137, 0.1490); // #5AB626
const vec3 GRN  = vec3(0.5255, 0.8549, 0.2471); // #86DA3F
const vec3 LIME = vec3(0.6510, 0.9137, 0.3333); // #A6E955
const vec3 VOID = vec3(0.020, 0.030, 0.022);    // INK pushed toward black (background)
const vec3 MIST = vec3(0.930, 0.965, 0.900);    // near-white tinted to the leaf hue (text, glass)

// Layout (p-space: y in [-1,1], x in [-0.5625,0.5625], origin at frame centre).
const vec2  IMPACT = vec2(0.0, 0.05);
const vec2  RING_C = vec2(0.0, -0.02);
const float RING_R = 0.40;
const float RING_T = 0.026;
const vec2  GLASS_C = vec2(0.0, -0.17);
const float GLASS_HH = 0.45;   // half height  -> top y = 0.28, bottom y = -0.62
const float GLASS_TOP = 0.255; // top half width
const float GLASS_BOT = 0.19;  // bottom half width
const vec2  LOGO_C = vec2(0.0, 0.326);
const float LOGO_R = 0.150;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
vec2 hash22(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
float valueNoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x  + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++){ v += a * snoise(p); p = r * p * 2.0; a *= 0.5; }
  return v;
}
float fbm3(vec2 p){
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 3; i++){ v += a * snoise(p); p = r * p * 2.0; a *= 0.5; }
  return v;
}
// Domain warping (noise into noise), cookbook "warped()" with time on the second layer.
float warped(vec2 p, float t, out vec2 qOut){
  vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + 0.05 * t), fbm(p + vec2(5.2, 1.3) - 0.04 * t));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.12 * t));
  qOut = q;
  return fbm(p + 4.0 * r);
}

// IQ cosine palette; coefficients fitted so t:0..1 runs void -> ink -> leaf -> lime.
vec3 cosPal(float t, vec3 a, vec3 b, vec3 c, vec3 d){ return a + b * cos(TAU * (c * t + d)); }
vec3 brand(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 col = mix(VOID, INK * 1.35, smoothstep(0.0, 0.32, t));
  col = mix(col, LEAF, smoothstep(0.32, 0.66, t));
  col = mix(col, GRN, smoothstep(0.66, 0.84, t));
  col = mix(col, LIME, smoothstep(0.84, 0.98, t));
  // subtle iridescent drift from a cosine palette locked to the green hue band
  vec3 iri = cosPal(t, vec3(0.30, 0.55, 0.20), vec3(0.18, 0.20, 0.10), vec3(1.0, 1.0, 1.0), vec3(0.10, 0.05, 0.25));
  return mix(col, col * (0.85 + 0.3 * iri), 0.35 * smoothstep(0.3, 0.8, t));
}

// ---- SDF library (negative inside)
float sdCircle(vec2 p, float r){ return length(p) - r; }
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdRoundBox(vec2 p, vec2 b, float r){ return sdBox(p, b - r) - r; }
float sdSegment(vec2 p, vec2 a, vec2 b){
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}
float opSmoothUnion(float a, float b, float k){
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float sdTrapezoid(vec2 p, float r1, float r2, float he){
  vec2 k1 = vec2(r2, he);
  vec2 k2 = vec2(r2 - r1, 2.0 * he);
  p.x = abs(p.x);
  vec2 ca = vec2(p.x - min(p.x, (p.y < 0.0) ? r1 : r2), abs(p.y) - he);
  vec2 cb = p - k1 + k2 * clamp(dot(k1 - p, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
// Vesica (two-circle lens) used for the leaf.
float sdVesica(vec2 p, float r, float d){
  p = abs(p);
  float b = sqrt(r * r - d * d);
  return ((p.y - b) * d > p.x * b) ? length(p - vec2(0.0, b)) : length(p - vec2(-d, 0.0)) - r;
}
float fill(float d){ float w = fwidth(d) * 1.2; return smoothstep(w, -w, d); }
// angle in degrees, 0 = +x, counter-clockwise, range (-180,180]
float angDeg(vec2 v){ return degrees(atan(v.y, v.x)); }

// ---- scene shapes shared by both passes
float sdRingShape(vec2 p){ return abs(length(p - RING_C) - RING_R) - RING_T; }
// Fork glyph standing inside the plate (left half), tines up.
float sdFork(vec2 p){
  vec2 q = p - (RING_C + vec2(-0.135, 0.0));
  float th = 0.0145;
  float d = sdSegment(q, vec2(0.0, -0.20), vec2(0.0, 0.02)) - th * 1.25;           // handle
  d = min(d, sdSegment(q, vec2(-0.046, 0.075), vec2(-0.046, 0.19)) - th);
  d = min(d, sdSegment(q, vec2(0.0, 0.075), vec2(0.0, 0.20)) - th);
  d = min(d, sdSegment(q, vec2(0.046, 0.075), vec2(0.046, 0.19)) - th);
  vec2 b = q - vec2(0.0, 0.075);
  float cup = abs(length(b * vec2(1.0, 1.25)) - 0.046) - th;                      // bowl joining the tines
  cup = max(cup, b.y);
  d = min(d, cup);
  return d;
}
float sdGlass(vec2 p){ return sdTrapezoid(p - GLASS_C, GLASS_BOT, GLASS_TOP, GLASS_HH); }
float glassHalfWidthAt(float y){ return mix(GLASS_BOT, GLASS_TOP, clamp((y - (GLASS_C.y - GLASS_HH)) / (2.0 * GLASS_HH), 0.0, 1.0)); }
// Icon-like mark: ring with gap segments + leaf (approximation of the app icon, used for the morph).
float sdLogoRing(vec2 p){ return abs(length(p - LOGO_C) - LOGO_R) - 0.019; }
float sdLeaf(vec2 p){
  vec2 q = rot(radians(-38.0)) * (p - LOGO_C - vec2(0.012, 0.0));
  return sdVesica(q, 0.105, 0.072);
}
