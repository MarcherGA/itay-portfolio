// materials/magic-spark-material.ts
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { JSX } from 'react';
import * as THREE from 'three';

export const MagicSparkMaterial = shaderMaterial(
  { 
    uProgress: 0, 
    uColor: new THREE.Color('#00ffcc'),
    uTexture: null,
    uTime: 0,
    uSparkSize: 0.08,
    uGlowWidth: 0.25,
    uHasTexture: 0.0  // Add flag to indicate if texture is available
  },
  ` // vertex shader
    uniform float uProgress;
    uniform float uTime;
    uniform float uSparkSize;
    uniform float uGlowWidth;
    
    attribute float angle;
    
    varying vec2 vUv;
    varying float vAlpha;
    varying float vIntensity;

    void main() {
      vUv = uv;
      
      // Calculate if this particle should be visible based on progress
      float movingEdge = uProgress;
      float distance = abs(angle - movingEdge);
      
      // Handle wrap-around (0 to 1 boundary)
      float wrapDistance = min(distance, abs(distance - 1.0));
      
      // Create a glow effect around the moving edge
      float glow = smoothstep(uGlowWidth, 0.0, wrapDistance);
      
      // Add some sparkle and twinkling
      float sparkle = sin(uTime * 4.0 + angle * 15.0) * 0.3 + 0.7;
      float twinkle = sin(uTime * 6.0 + angle * 25.0) * 0.2 + 0.8;
      
      vAlpha = glow * sparkle * twinkle;
      vIntensity = glow;
      
      // Size variation
      float sizeVariation = 0.7 + sin(angle * 30.0 + uTime) * 0.3;
      float finalSize = uSparkSize * (0.5 + vIntensity * 1.5) * sizeVariation * 100.0;
      
      gl_PointSize = finalSize;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  ` // fragment shader
    uniform vec3 uColor;
    uniform sampler2D uTexture;
    uniform float uHasTexture;
    
    varying vec2 vUv;
    varying float vAlpha;
    varying float vIntensity;

    void main() {
      // Create particle shape
      vec4 textureColor;
      if (uHasTexture > 0.5) {
        textureColor = texture2D(uTexture, gl_PointCoord);
      } else {
        // Fallback: create a glowing circle
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        float circle = 1.0 - smoothstep(0.0, 0.4, dist);
        float glow = 1.0 - smoothstep(0.0, 0.5, dist);
        textureColor = vec4(1.0, 1.0, 1.0, circle + glow * 0.3);
      }
      
      // Apply color and effects
      vec3 finalColor = uColor * (1.0 + vIntensity);
      float finalAlpha = textureColor.a * vAlpha;
      
      // Add center brightness
      vec2 center = gl_PointCoord - 0.5;
      float centerDist = length(center);
      float centerGlow = 1.0 - smoothstep(0.0, 0.2, centerDist);
      finalColor += centerGlow * uColor * vIntensity * 0.5;
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `
);

extend({ MagicSparkMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    magicSparkMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uProgress?: number;
      uColor?: THREE.Color;
      uTexture?: THREE.Texture;
      uTime?: number;
      uSparkSize?: number;
      uGlowWidth?: number;
      uHasTexture?: number;
    }
  }
}