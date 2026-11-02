// composite.frag: full-resolution pass. Samples the half-res fluid, applies ripple displacement
// and chromatic aberration, draws crisp SDF story shapes, liquid-revealed captions, icon + CTA.
@@COMMON@@

uniform sampler2D u_fluid;
uniform sampler2D u_capA;
uniform sampler2D u_capB;
uniform sampler2D u_capC;
uniform sampler2D u_labels;
uniform sampler2D u_end;
uniform sampler2D u_icon;
uniform vec4  u_capP;      // caption progress A,B,C (0..1 in, 1..2 out); w = labels out
uniform vec3  u_labP;      // meal labels in
uniform vec4  u_endP;      // end rows: word, sub, features, button text
uniform vec4  u_rip[6];    // ripple: x, y, age (s), amplitude
uniform float u_time;
uniform float u_frame;
uniform vec2  u_res;
uniform vec4  u_drop;      // A droplet: x, y, r, visible
uniform float u_ringVis;
uniform float u_ringCrisp;
uniform float u_forkVis;
uniform vec3  u_seg;       // meal segment fill
uniform vec4  u_blob0;
uniform vec4  u_blob1;
uniform vec4  u_blob2;
uniform float u_melt;
uniform float u_glassVis;
uniform float u_level;
uniform float u_wave;
uniform vec4  u_wd0;       // falling water droplets: x, y, r, visible
uniform vec4  u_wd1;
uniform float u_ticks;
uniform float u_logoVis;
uniform float u_logoCrisp;
uniform float u_iconMix;
uniform float u_btn;
uniform float u_press;
uniform float u_ca;
uniform float u_dim;
uniform float u_flash;
uniform float u_antic;     // A: anticipation ring before impact
uniform float u_scrim;     // caption legibility scrim

vec2 toUV(vec2 p){ return vec2(p.x * 0.5 * u_res.y / u_res.x + 0.5, p.y * 0.5 + 0.5); }

vec2 rippleDisp(vec2 p, out float energy){
  vec2 d = vec2(0.0);
  energy = 0.0;
  for (int i = 0; i < 6; i++){
    vec4 r = u_rip[i];
    if (r.w <= 0.0) continue;
    vec2 v = p - r.xy;
    float dist = length(v) + 1e-4;
    float front = r.z * 1.35;
    float w = 0.07 + r.z * 0.10;
    float env = exp(-pow((dist - front) / w, 2.0)) * exp(-r.z * 1.7) * r.w;
    d += (v / dist) * sin((dist - front) * 42.0) * env * 0.030;
    energy += env;
  }
  return d;
}

// Liquid text reveal: a in 0..1 dissolves in through noise with a wobble; 1..2 dissolves out.
vec4 liquidText(sampler2D tex, vec2 uv, float a, float seed){
  if (a <= 0.0 || a >= 2.0) return vec4(0.0);
  float inP = clamp(a, 0.0, 1.0), outP = clamp(a - 1.0, 0.0, 1.0);
  float wob = (1.0 - inP) + outP;
  vec2 duv = vec2(snoise(vec2(uv.y * 16.0 + seed, u_time * 1.9)) * 0.010,
                  snoise(vec2(uv.x * 7.0 - seed, u_time * 1.4)) * 0.016) * wob;
  vec4 c = texture2D(tex, uv + duv);
  float n = valueNoise(uv * vec2(14.0, 25.0) + seed) * 0.65 + valueNoise(uv * vec2(70.0, 124.0) + seed) * 0.35;
  float mIn = smoothstep(0.0, 0.06, inP * 1.14 - n);
  float mOut = 1.0 - smoothstep(0.0, 0.06, outP * 1.14 - n);
  float edge = (1.0 - smoothstep(0.0, 0.07, abs(inP * 1.14 - n - 0.03))) * (1.0 - inP)
             + (1.0 - smoothstep(0.0, 0.07, abs(outP * 1.14 - n - 0.03))) * outP;
  vec3 rgb = mix(c.rgb, LIME, clamp(edge, 0.0, 1.0) * 0.8);
  return vec4(rgb, c.a * mIn * mOut);
}

float dropShape(vec2 p, vec4 d){
  vec2 q = p - d.xy;
  float c = length(q) - d.z;
  float tail = sdSegment(q, vec2(0.0), vec2(0.0, d.z * 2.4)) - d.z * 0.22;
  return opSmoothUnion(c, tail, d.z * 0.7);
}

// Lens-like refractive droplet over the fluid.
vec3 shadeDrop(vec3 col, vec2 p, vec2 uv, vec4 d, vec3 tint, float glow){
  if (d.w <= 0.0) return col;
  float dd = dropShape(p, d);
  float m = fill(dd) * d.w;
  vec2 q = (p - d.xy) / d.z;
  vec3 refr = texture2D(u_fluid, uv - q * 0.035).rgb;
  vec3 body = refr * 1.6 + tint * 0.55;
  float rim = 1.0 - smoothstep(0.0, 0.010, abs(dd + 0.004));
  body += MIST * rim * 0.7;
  float spec = 1.0 - smoothstep(0.0, 0.35, length(q - vec2(-0.35, 0.35)));
  body += MIST * spec * 0.8;
  col += tint * exp(-max(dd, 0.0) * 30.0) * 0.35 * glow * d.w;
  return mix(col, body, m);
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 p0 = (fc - 0.5 * u_res) / u_res.y * 2.0;
  float energy;
  vec2 disp = rippleDisp(p0, energy);
  vec2 p = p0 + disp;
  vec2 uv = toUV(p);
  float t = u_time;

  // ---- background fluid with chromatic aberration driven by ripple energy
  float ca = (u_ca + energy * 0.5) * 0.0026;   // kept subtle so fringes stay near the green palette
  vec2 cdir = normalize(p0 - IMPACT + 1e-4);
  vec3 col;
  col.r = texture2D(u_fluid, uv + cdir * ca).r;
  col.g = texture2D(u_fluid, uv).g;
  col.b = texture2D(u_fluid, uv - cdir * ca).b;
  col *= mix(1.0, 0.34, u_dim);
  col += LIME * u_flash * exp(-length(p0 - IMPACT) * 2.6) * 0.55;

  // ---- A: anticipation (surface ring under the falling drop), light trail, the droplet itself
  if (u_antic > 0.0){
    vec2 a = (p0 - IMPACT) * vec2(1.0, 3.2);
    for (int i = 0; i < 3; i++){
      float r = 0.05 + float(i) * 0.06 + 0.02 * sin(u_time * 9.0 - float(i));
      col += LIME * (1.0 - smoothstep(0.0, 0.010, abs(length(a) - r))) * 0.45 * u_antic * (1.0 - float(i) * 0.28);
    }
  }
  if (u_drop.w > 0.0){
    float tr = exp(-pow((p0.x - u_drop.x) / 0.007, 2.0)) * step(u_drop.y, p0.y) * exp(-(p0.y - u_drop.y) * 3.0);
    col += mix(LEAF, LIME, 0.5) * tr * 0.75;
  }
  col = shadeDrop(col, p, uv, u_drop, LEAF, 1.6);

  // ---- B: plate ring + fork + meal blobs (metaballs), melting in C
  if (u_ringVis > 0.0){
    vec2 pm = p;
    float drip = u_melt * u_melt * (0.30 + 0.70 * valueNoise(vec2(p.x * 13.0, 3.1)));
    pm.y += drip * 0.95;
    float wAmp = (1.0 - u_ringCrisp) * 0.055 + u_melt * 0.035;
    float wn = snoise(pm * 6.5 + vec2(0.0, t * 0.9));
    float dR = sdRingShape(pm) + wn * wAmp;
    float dF = sdFork(pm) + wn * wAmp + (1.0 - u_forkVis) * 0.08;
    float dS = min(dR, dF);
    float dB = 10.0;
    vec4 bl[3];
    bl[0] = u_blob0; bl[1] = u_blob1; bl[2] = u_blob2;
    for (int i = 0; i < 3; i++){
      if (bl[i].w <= 0.0) continue;
      float db = sdCircle(pm - bl[i].xy, bl[i].z) + snoise(pm * 14.0 + float(i) * 7.0 + t * 2.0) * 0.006;
      dB = min(dB, db);
      dS = opSmoothUnion(dS, db, 0.075);
    }
    float vis = u_ringVis * (1.0 - smoothstep(0.55, 1.0, u_melt));
    float m = fill(dS) * vis;
    vec2 g = vec2(dFdx(dS), dFdy(dS));
    g = g / (length(g) + 1e-6);
    vec3 refr = texture2D(u_fluid, uv - g * 0.02).rgb;
    vec3 body = INK * 1.9 + refr * 0.35 + MIST * 0.10;
    float rim = 1.0 - smoothstep(0.0, 0.010, abs(dS + 0.006));
    body += mix(MIST, LIME, 0.6) * rim * 0.55;
    // meal segments sweep clockwise on the right half of the ring
    float a = angDeg(pm - RING_C);
    float onRing = fill(dR + 0.002);
    float segM = 0.0;
    float s0 = 86.0, e0 = 34.0, s1 = 26.0, e1 = -26.0, s2 = -34.0, e2 = -86.0;
    segM += step(a, s0) * step(s0 - (s0 - e0) * u_seg.x, a);
    segM += step(a, s1) * step(s1 - (s1 - e1) * u_seg.y, a);
    segM += step(a, s2) * step(s2 - (s2 - e2) * u_seg.z, a);
    segM = clamp(segM, 0.0, 1.0) * onRing;
    vec3 segCol = mix(LEAF, GRN, 0.5 + 0.5 * sin(a * 0.08 + t * 3.0)) + LIME * rim * 0.6;
    body = mix(body, segCol, segM);
    // blobs are glowing liquid food
    float blobM = fill(dB + 0.004);
    vec3 blobCol = brand(0.78 + 0.2 * snoise(pm * 9.0 + t)) + LIME * rim * 0.4;
    body = mix(body, blobCol, blobM * (1.0 - onRing));
    col += LEAF * exp(-max(dS, 0.0) * 22.0) * 0.18 * vis;
    col += LIME * segM * 0.0;
    col = mix(col, body, m);
    // the fork glyph is solid and bright so it reads as cutlery
    float fm = fill(dF) * vis;
    vec3 forkCol = mix(MIST, LIME, 0.25 * (1.0 - smoothstep(-0.012, 0.0, dF)));
    col += LEAF * exp(-max(dF, 0.0) * 35.0) * 0.25 * vis * u_forkVis;
    col = mix(col, forkCol, fm);
    // segment glow
    col += GRN * exp(-max(dR, 0.0) * 40.0) * 0.25 * vis * clamp(u_seg.x + u_seg.y + u_seg.z, 0.0, 1.0) * step(-90.0, a) * step(a, 90.0);
  }

  // ---- C: glass + water + droplets + tally ticks
  if (u_glassVis > 0.0){
    float bottomY = GLASS_C.y - GLASS_HH, topY = GLASS_C.y + GLASS_HH;
    vec2 BL = vec2(-GLASS_BOT, bottomY), BR = vec2(GLASS_BOT, bottomY);
    vec2 TL = vec2(-GLASS_TOP, topY), TR = vec2(GLASS_TOP, topY);
    float gn = valueNoise(p * 26.0) * 0.7 + valueNoise(p * 90.0) * 0.3;
    float reveal = smoothstep(0.0, 0.07, u_glassVis * 1.12 - gn);
    float dG = sdGlass(p);
    float dWall = min(min(sdSegment(p, BL, TL), sdSegment(p, BR, TR)), sdSegment(p, BL, BR)) - 0.0105;
    // water
    float lvlY = bottomY + 2.0 * GLASS_HH * u_level;
    float surf = lvlY + (0.004 + 0.018 * u_wave) * sin(p.x * 21.0 + t * 6.0) + 0.004 * sin(p.x * 47.0 - t * 9.0);
    float inGlass = fill(dG + 0.0105);
    float inWater = fill(p.y - surf) * inGlass * step(0.002, u_level) * reveal;
    vec3 refrW = texture2D(u_fluid, uv + vec2(0.0, -0.025) + disp * 2.0).rgb;
    float caus = pow(1.0 - abs(snoise(p * vec2(9.0, 6.0) + vec2(0.0, t * 0.9) + 0.3 * snoise(p * 3.0 - t * 0.4))), 7.0);
    vec3 water = INK * 0.8 + refrW * 0.75 + GRN * 0.20 + LIME * caus * 0.45;
    water *= mix(1.0, 0.62, smoothstep(surf, bottomY, p.y));
    col = mix(col, col * 0.75 + MIST * 0.03, inGlass * reveal * 0.6);
    col = mix(col, water, inWater);
    float men = (1.0 - smoothstep(0.0, 0.0065, abs(p.y - surf))) * inGlass * step(0.002, u_level) * reveal;
    col += LIME * men * 0.85;
    float wm = fill(dWall) * reveal * u_glassVis;
    vec3 wallCol = mix(MIST * 0.85, LIME, 0.25 * (1.0 - smoothstep(-0.006, 0.0, dWall)));
    col += LEAF * exp(-max(dWall, 0.0) * 50.0) * 0.12 * reveal;
    col = mix(col, wallCol, wm * 0.92);
    // tally ticks (one per logged glass), outside the right wall
    for (int i = 0; i < 8; i++){
      float fi = float(i);
      float ty = bottomY + 0.08 + fi * 0.098;
      float tx = glassHalfWidthAt(ty) + 0.04;
      float dt = sdSegment(p, vec2(tx, ty), vec2(tx + 0.05, ty)) - 0.0075;
      float lit = clamp(u_ticks - fi, 0.0, 1.0);
      vec3 tc = mix(MIST * 0.22, LIME, lit);
      col += LIME * exp(-max(dt, 0.0) * 60.0) * 0.3 * lit * reveal;
      col = mix(col, tc, fill(dt) * reveal);
    }
    col = shadeDrop(col, p, uv, u_wd0, GRN, 1.0);
    col = shadeDrop(col, p, uv, u_wd1, GRN, 1.0);
  }

  // ---- D: logo morph (ring + leaf like the icon), then noise-dissolve into the real icon tile
  float tileReveal = 0.0;
  if (u_iconMix > 0.0){
    float tn = valueNoise(p * 28.0 + 4.0) * 0.7 + valueNoise(p * 95.0) * 0.3;
    tileReveal = smoothstep(0.0, 0.07, u_iconMix * 1.14 - tn);
  }
  if (u_logoVis > 0.0){
    float wL = (1.0 - u_logoCrisp) * 0.05;
    float nl = snoise(p * 8.0 + t);
    float a = angDeg(p - LOGO_C);
    float dRing = sdLogoRing(p) + nl * wL;
    float leftArc = step(94.0, a) + step(a, -78.0);
    float arcA = step(a, 82.0) * step(12.0, a);
    float arcB = step(a, 2.0) * step(-34.0, a);
    vec2 dotC = LOGO_C + LOGO_R * vec2(cos(radians(-56.0)), sin(radians(-56.0)));
    float dDot = sdCircle(p - dotC, 0.024) + nl * wL;
    float dLeaf = sdLeaf(p) + nl * wL;
    float vis = u_logoVis * (1.0 - tileReveal);
    float mRingDark = fill(dRing) * clamp(leftArc, 0.0, 1.0);
    float mRingGreen = fill(dRing) * clamp(arcA + arcB, 0.0, 1.0);
    float mDot = fill(dDot);
    float mLeaf = fill(dLeaf);
    float dAll = min(min(dRing, dDot), dLeaf);
    col += LEAF * exp(-max(dAll, 0.0) * 26.0) * 0.30 * vis;
    vec3 darkGlass = INK * 1.6 + MIST * 0.10 + LIME * (1.0 - smoothstep(0.0, 0.008, abs(dRing + 0.006))) * 0.5;
    col = mix(col, darkGlass, mRingDark * vis);
    col = mix(col, mix(LEAF, LIME, clamp(0.5 + 0.5 * sin(a * 0.05 + t * 2.0), 0.0, 1.0)), mRingGreen * vis);
    col = mix(col, LIME, mDot * vis);
    vec2 lq = rot(radians(-38.0)) * (p - LOGO_C);
    vec3 leafCol = mix(LEAF, GRN, smoothstep(-0.06, 0.06, lq.x)) + MIST * (1.0 - smoothstep(0.0, 0.004, abs(lq.x + 0.004))) * 0.4;
    col = mix(col, leafCol, mLeaf * vis);
  }
  if (tileReveal > 0.0){
    vec2 tq = p - LOGO_C;
    float tileD = sdRoundBox(tq, vec2(0.205), 0.056);
    float tm = fill(tileD) * tileReveal;
    vec2 iuv = tq / 0.41 + 0.5;
    vec4 ic = texture2D(u_icon, iuv);
    vec3 tileCol = vec3(1.0) * (1.0 - ic.a) + ic.rgb;   // icon texture is premultiplied
    col += LIME * exp(-max(tileD, 0.0) * 18.0) * 0.20 * tileReveal;
    float front = (1.0 - smoothstep(0.0, 0.05, abs(u_iconMix * 1.14 - (valueNoise(p * 28.0 + 4.0) * 0.7 + valueNoise(p * 95.0) * 0.3) - 0.035))) * (1.0 - u_iconMix);
    col = mix(col, tileCol, tm);
    col += LIME * front * fill(tileD) * 0.9;
  }

  // ---- end card button (SDF pill) with press
  if (u_btn > 0.0){
    vec2 bc = vec2(0.0, -0.35625);
    float sc = u_btn * (1.0 - 0.06 * u_press);
    vec2 bq = (p - bc) / max(sc, 0.001);
    float bd = sdRoundBox(bq, vec2(0.36, 0.066), 0.066) * sc;
    float bm = fill(bd);
    vec3 bcol = mix(LEAF, LIME, smoothstep(-0.07, 0.05, bq.y));
    float sweep = 1.0 - smoothstep(0.0, 0.04, abs(bq.x - (mix(-0.6, 0.6, fract(t * 0.45)))));
    bcol += MIST * sweep * 0.18;
    col += LIME * exp(-max(bd, 0.0) * 30.0) * 0.25 * u_btn;
    col = mix(col, bcol, bm);
  }

  // ---- caption scrim: darken the top band while a caption is on screen
  col = mix(col, col * 0.28, u_scrim * smoothstep(0.26, 0.56, p0.y));

  // ---- text layers (captions, labels, end card)
  vec2 tuv = toUV(p0 + disp * 0.6);
  vec4 tx;
  tx = liquidText(u_capA, tuv, u_capP.x, 1.3); col = mix(col, tx.rgb, tx.a);
  tx = liquidText(u_capB, tuv, u_capP.y, 4.1); col = mix(col, tx.rgb, tx.a);
  tx = liquidText(u_capC, tuv, u_capP.z, 7.7); col = mix(col, tx.rgb, tx.a);
  // meal labels: one row band each, melt out with the ring
  float yPx = (1.0 - tuv.y) * u_res.y;
  float labA = yPx < 860.0 ? u_labP.x : (yPx < 1120.0 ? u_labP.y : u_labP.z);
  labA = labA >= 1.0 ? 1.0 + u_capP.w : labA;
  tx = liquidText(u_labels, tuv, labA, 2.2); col = mix(col, tx.rgb, tx.a);
  float endA = yPx < 1030.0 ? u_endP.x : (yPx < 1102.0 ? u_endP.y : (yPx < 1210.0 ? u_endP.z : u_endP.w));
  tx = liquidText(u_end, tuv, endA, 5.5); col = mix(col, tx.rgb, tx.a);

  // ---- grain + vignette
  float gr = hash21(fc + fract(u_frame * 0.1371) * vec2(91.7, 37.3)) - 0.5;
  col += gr * 0.03;
  col *= mix(1.0, 0.55, smoothstep(0.55, 1.35, length(p0 * vec2(1.25, 0.82))));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
