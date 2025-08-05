uniform sampler2D uTexture;
uniform bool      uUseTexture;
uniform vec3      uColor;

varying vec2 vUv;

void main() {
  vec3 base = uColor;

  if (uUseTexture) {
    base *= texture2D(uTexture, vUv).rgb;
  }

  gl_FragColor = vec4(base, 1.0);
}
