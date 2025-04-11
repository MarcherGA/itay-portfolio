import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';


const NightSky: React.FC = () => {
    const { scene, camera } = useThree();
  
    useEffect(() => {
      // Define the gradient effect for the night sky
      const geometry = new THREE.SphereGeometry(500, 32, 32);
      
      // Shader material for the night sky
      const material = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: {
          topColor: { value: new THREE.Color(0x1e2a47) }, // Dark blue top
          bottomColor: { value: new THREE.Color(0x1e2a47) }, // Black near the horizon
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vNormal;
          void main() {
            vec3 color = mix(bottomColor, topColor, vNormal.y * 0.5 + 0.5);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });
      

      // Sky sphere (background)
      const sky = new THREE.Mesh(geometry, material);
      scene.add(sky);
  
      // Adjust the camera position

  
      return () => {
        scene.remove(sky); // Clean up when component unmounts
      };
    }, [scene, camera]);
  
    return null;
  };
  

export default NightSky
  