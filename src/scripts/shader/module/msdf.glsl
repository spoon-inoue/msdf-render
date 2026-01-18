#version 300 es

float screenPxRange(vec2 texCoord, float pxRange) {
  vec2 unitRange = vec2(pxRange) / vec2(textureSize(msdf, 0));
  vec2 screenTexSize = vec2(1.0) / fwidth(texCoord);
  return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float screenPxDistance(sampler2D msdf, vec2 texCoord, float pxRange) {
  vec3 msd = texture(msdf, texCoord).rgb;
  float sd = median(msd.r, msd.g, msd.b);
  return screenPxRange(texCoord, pxRange) * (sd - 0.5);
}

float msdfMap(sampler2D msdf, vec2 texCoord, float pxRange) {
  float screenPxDistance = screenPxDistance(msdf, texCoord, pxRange);
  return clamp(screenPxDistance + 0.5, 0.0, 1.0);
}