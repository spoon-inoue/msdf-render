#version 300 es
precision highp float;

uniform sampler2D msdf;
uniform vec2 resolution;
uniform float progress;
uniform float randomSeed;

#define R resolution
#define minmax(x, min, max) ((x) * (max - min) + min) 

in vec2 vUv;
out vec4 O;

const float DETAIL = 8.;

const float PX_RANGE = 4.; // msdf生成時に指定したレンジ
#include 'module/msdf.glsl'

vec3 hash(vec3 v) {
  uvec3 x = floatBitsToUint(v + vec3(.1, .2, .3));
  x = (x >> 8 ^ x.yzx) * 0x456789ABu;
  x = (x >> 8 ^ x.yzx) * 0x6789AB45u;
  x = (x >> 8 ^ x.yzx) * 0x89AB4567u;
  return vec3(x) / vec3(-1u);
}

float ease(float x) {
 return x * x * x;
}

void main() {
  float asp = R.x / R.y;
  vec2 suv = (vUv - vec2(0.5, 0)) * vec2(asp, 1);

  vec2 fuv, iuv, quv = suv;
  float i;
  for(; i < DETAIL; i++) {
    if (ease(progress) * DETAIL < i) break;

    fuv = fract(quv);
    iuv = floor(quv);
    if (hash(vec3(iuv, randomSeed)).x < (0.2 + (1. - (i / DETAIL)) * 0.1)) break;
    quv *= 2.;
  }

  // msdf
  float opacity = msdfMap(msdf, fuv, PX_RANGE);  
  vec3 bgColor = vec3(0.95);
  vec3 fgColor = vec3(0);
  vec3 color = mix(bgColor, fgColor, opacity);

  // outline
  if (i == DETAIL) i--;
  vec2 px = (1. / R) * vec2(asp, 1);
  vec2 auv = abs(fuv * 2. - 1.);
  vec2 th = 1. - px * pow(2., float(i));
  float line = min(step(th.x, auv.x) + step(th.y, auv.y), 1.0);
  color = mix(color, vec3(0.8), line);

  O = vec4(color, 1);
}