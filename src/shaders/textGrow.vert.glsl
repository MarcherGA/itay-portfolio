uniform float uReveal;   // 0 → 1
uniform float uMinY;     // lowest Y of geometry (model space)
uniform float uMaxY;     // highest Y of geometry

varying vec2 vUv;

void main() {
  vUv = uv;

  // Normalise current vertex Y to [0 … 1]
  float yNorm = clamp((position.y - uMinY) / (uMaxY - uMinY), 0.0, 1.0);

  // Smooth growing edge
  float grow = smoothstep(uReveal - 0.05, uReveal + 0.05, yNorm);

  vec3 transformed = position * grow;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
