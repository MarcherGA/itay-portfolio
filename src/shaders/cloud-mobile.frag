precision mediump float;

uniform sampler2D uTxtShape;
uniform sampler2D uTxtCloudNoise;
uniform float     uTime;
uniform float     uTimeFactor1;

varying vec2 vUv;
varying vec4 vSeed;
varying float vNoiseSmall;

// Better noise function for mobile - matches vertex shader
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

// Simple fbm approximation for mobile
float fbmMobile(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    // 2 octaves instead of full fbm
    for (int i = 0; i < 2; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

// Simple levels function
vec4 levels(vec4 color, float minInput, float gamma, float maxInput) {
  vec4 levelRange = clamp((color - vec4(minInput)) / (vec4(maxInput) - vec4(minInput)), 0.0, 1.0);
  return pow(levelRange, vec4(1.0 / gamma));
}

void main() {
  vec2 newUv = vUv;

  // Two scrolling noise textures but with slower animation to reduce flickering
  vec4 txtNoise1 = texture2D(uTxtCloudNoise,
                     vec2(vUv.x + uTime*0.00005, vUv.y - uTime*0.00007));
  vec4 txtNoise2 = texture2D(uTxtCloudNoise,
                     vec2(vUv.x - uTime*0.00001, vUv.y + uTime*0.000008 + 0.2));

  // Large-scale distortion using mobile fbm
  float noiseBig = fbmMobile(vUv * vSeed.x + uTime * uTimeFactor1) + 0.5;
  newUv += noiseBig * vSeed.z;

  // Small-scale distortion from vertex shader
  newUv += vNoiseSmall * vSeed.w;

  // Cloud shape mask
  vec4 txtShape = texture2D(uTxtShape, newUv);

  // Alpha composition with proper levels
  float alpha = levels((txtNoise1 + txtNoise2) * 0.6, 0.2, 0.4, 0.7).r;
  alpha *= txtShape.r;

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(vec3(0.95), alpha);
}
