// components/GlowLineMaterial.ts
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { JSX } from 'react';
import * as THREE from 'three';

export const GlowLineMaterial = shaderMaterial(
  { uProgress: 0, uColor: new THREE.Color('#00ffcc') },
  ` // vertex shader
    varying vec3 vPos;
    void main() {
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  ` // fragment shader
    uniform float uProgress;
    uniform vec3 uColor;
    varying vec3 vPos;

    void main() {
      float angle = atan(vPos.x, vPos.y);
      float normalizedAngle = (angle + 3.14159) / (2.0 * 3.14159);

      float movingEdge = uProgress; // Now based on controlled animation
      float distance = abs(normalizedAngle - movingEdge);
      float glow = smoothstep(0.05, 0.0, distance);

      vec3 color = uColor * glow;
      gl_FragColor = vec4(color, glow);
    }
  `
);

extend({ GlowLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    glowLineMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uProgress?: number;
      uColor?: THREE.Color;
    }
  }
}