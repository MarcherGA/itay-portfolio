precision mediump float;

uniform float uTime;
uniform float uTimeFactor2;
uniform float rotation;
uniform vec2  center;

attribute vec4 instanceSeed;

varying vec2  vUv;
varying vec4  vSeed;
varying float vNoiseSmall;

// Better noise function for mobile - more variation
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(hash(i + vec2(0.0,0.0)), 
                   hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), 
                   hash(i + vec2(1.0,1.0)), u.x), u.y);
}

void main() {
  vUv   = uv;
  vSeed = instanceSeed;

  // Better noise with instance variation for mobile
  vec2 noiseCoord = vUv * vSeed.y + uTime * uTimeFactor2;
  vNoiseSmall = (noise(noiseCoord) - 0.5) * 2.0;

  // Billboard math (unchanged for consistency)
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
