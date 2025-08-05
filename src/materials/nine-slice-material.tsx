import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { JSX } from 'react'
import * as THREE from 'three'

export const NineSliceMaterial = shaderMaterial(
  {
    uTexture: null,
    uNineSliceEnabled: true,
    uCornerLeft: 0.2,
    uCornerRight: 0.2,
    uCornerTop: 0.2,
    uCornerBottom: 0.2,
    uScale: new THREE.Vector2(1, 1)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec2 vScale;

    void main() {
      vUv = uv;
      
      // Extract scale from the model matrix
      vScale = vec2(
        length(vec3(modelMatrix[0].x, modelMatrix[0].y, modelMatrix[0].z)),
        length(vec3(modelMatrix[1].x, modelMatrix[1].y, modelMatrix[1].z))
      );

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
uniform sampler2D uTexture;
uniform float uCornerLeft;
uniform float uCornerRight;
uniform float uCornerTop;
uniform float uCornerBottom;
uniform bool uNineSliceEnabled;
uniform vec2 uScale;

varying vec2 vUv;
varying vec2 vScale;

void main() {
  vec2 uv = vUv;

  if (uNineSliceEnabled) {
    // Use the scale from vertex shader or uniform
    vec2 currentScale = vScale;
    
    // Calculate corner sizes in UV space based on scale
    // The corners should remain fixed size regardless of scale
    float leftUV = uCornerLeft / currentScale.x;
    float rightUV = uCornerRight / currentScale.x;
    float bottomUV = uCornerBottom / currentScale.y;
    float topUV = uCornerTop / currentScale.y;
    
    // Clamp corner sizes to prevent overlap
    leftUV = min(leftUV, 0.5);
    rightUV = min(rightUV, 0.5);
    bottomUV = min(bottomUV, 0.5);
    topUV = min(topUV, 0.5);
    
    // Ensure corners don't overlap
    if (leftUV + rightUV > 1.0) {
      float total = leftUV + rightUV;
      leftUV = leftUV / total;
      rightUV = rightUV / total;
    }
    if (bottomUV + topUV > 1.0) {
      float total = bottomUV + topUV;
      bottomUV = bottomUV / total;
      topUV = topUV / total;
    }

    vec2 texUV;

    // Horizontal mapping
    if (uv.x < leftUV) {
      // Left edge
      texUV.x = uv.x / leftUV * uCornerLeft;
    } else if (uv.x > (1.0 - rightUV)) {
      // Right edge
      texUV.x = (1.0 - uCornerRight) + ((uv.x - (1.0 - rightUV)) / rightUV) * uCornerRight;
    } else {
      // Center stretch
      float centerStart = leftUV;
      float centerEnd = 1.0 - rightUV;
      float centerProgress = (uv.x - centerStart) / (centerEnd - centerStart);
      texUV.x = uCornerLeft + centerProgress * (1.0 - uCornerLeft - uCornerRight);
    }

    // Vertical mapping
    if (uv.y < bottomUV) {
      // Bottom edge
      texUV.y = uv.y / bottomUV * uCornerBottom;
    } else if (uv.y > (1.0 - topUV)) {
      // Top edge
      texUV.y = (1.0 - uCornerTop) + ((uv.y - (1.0 - topUV)) / topUV) * uCornerTop;
    } else {
      // Center stretch
      float centerStart = bottomUV;
      float centerEnd = 1.0 - topUV;
      float centerProgress = (uv.y - centerStart) / (centerEnd - centerStart);
      texUV.y = uCornerBottom + centerProgress * (1.0 - uCornerBottom - uCornerTop);
    }

    gl_FragColor = texture2D(uTexture, texUV);
  } else {
    gl_FragColor = texture2D(uTexture, uv);
  }
}
  `
)

extend({ NineSliceMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    nineSliceMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
      uTexture?: THREE.Texture
      uNineSliceEnabled?: boolean
      uCornerLeft?: number
      uCornerRight?: number
      uCornerTop?: number
      uCornerBottom?: number
      uScale?: THREE.Vector2
    }
  }
}