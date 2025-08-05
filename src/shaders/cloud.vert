precision mediump float;

uniform float uTime;
uniform float uTimeFactor2;
uniform float rotation;
uniform vec2  center;

attribute vec4 instanceSeed;

varying vec2  vUv;
varying vec4  vSeed;
varying float vNoiseSmall;   // → passed to frag

void main() {
  vUv   = uv;
  vSeed = instanceSeed;

  /* per‑vertex small‑scale noise */
  vNoiseSmall = snoise(vec3(vUv * vSeed.y, uTime * uTimeFactor2));

  /* billboard math (unchanged) */
  vec4 worldPos  = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec4 mvPosition = modelViewMatrix * worldPos;

  vec2 aligned = position.xy - (center - vec2(0.5));
  float c = cos(rotation);
  float s = sin(rotation);

  vec2 rotated;
  rotated.x = c * aligned.x - s * aligned.y;
  rotated.y = s * aligned.x + c * aligned.y;

  vec2 scale;
  scale.x = length(instanceMatrix[0].xyz);
  scale.y = length(instanceMatrix[1].xyz);

  rotated *= scale;
  mvPosition.xy += rotated;

  gl_Position = projectionMatrix * mvPosition;
}
