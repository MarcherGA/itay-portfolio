precision mediump float;

/* fbm3d, levels are expected to be prepended via JS/TS */
uniform sampler2D uTxtShape;
uniform sampler2D uTxtCloudNoise;
uniform float     uTime;
uniform float     uTimeFactor1;

varying vec2 vUv;
varying vec4 vSeed;         // (uFac1, uFac2, disp1, disp2)
varying float vNoiseSmall; // ⬅️ from vertex shader

void main() {
  vec2 newUv = vUv;

  /* two scrolling noise textures */
  vec4 txtNoise1 = texture2D(uTxtCloudNoise,
                     vec2(vUv.x + uTime*0.0001, vUv.y - uTime*0.00014));
  vec4 txtNoise2 = texture2D(uTxtCloudNoise,
                     vec2(vUv.x - uTime*0.00002, vUv.y + uTime*0.000017 + 0.2));

  /* --- large‑scale distortion --- */
  float noiseBig = fbm3d(vec3(vUv * vSeed.x, uTime * uTimeFactor1), 2) + 0.5;
  newUv += noiseBig * vSeed.z;

  /* --- small‑scale distortion from vertex shader --- */
  newUv += vNoiseSmall * vSeed.w;

  /* cloud shape mask */
  vec4 txtShape = texture2D(uTxtShape, newUv);

  /* alpha composition */
  float alpha = levels((txtNoise1 + txtNoise2) * 0.6, 0.2, 0.4, 0.7).r;
  alpha *= txtShape.r;
  

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(vec3(0.95), alpha);
}
