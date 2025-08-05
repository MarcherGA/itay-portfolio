// FadingMaterial.ts
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { JSX } from 'react';

export const FadingMaterial = shaderMaterial(
  {
    uTexture: null,
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      gl_FragColor = texColor;
    }
  `
);

extend({ FadingMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    fadingMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uTexture?: THREE.Texture
      uWallX?: number,
      uDirection?: number,
      uFadeDistance?: number
    }
  }
}
