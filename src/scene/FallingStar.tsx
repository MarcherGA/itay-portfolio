import { shaderMaterial } from '@react-three/drei';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Mesh } from 'three';
import * as THREE from 'three';

const FallingStar = () => {
  const starRef = useRef<Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  const [emissiveIntensity, setEmissiveIntensity] = useState(2);
  const speed = useRef(Math.random() * 0.05 + 0.01); // Random speed for each star

  let scale: number = 0.1,
    speedX = 0,
    speedY = -1;
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (starRef.current) {
      // Move the star downwards with X drift
      starRef.current.position.y += speedY * speed.current;
      starRef.current.position.x += speedX * speed.current;

      setEmissiveIntensity(Math.random() * 2);

      // Reset position when it falls out of view
      if (
        starRef.current.position.y < -30 ||
        starRef.current.position.x > 30 ||
        starRef.current.position.x < -30
      ) {
        starRef.current.position.y = 10; // Reset to a higher position
        starRef.current.position.x = (Math.random() * 40 - 20) * (window.innerWidth /1920 ); // Randomize X position
        starRef.current.position.z = -30; // Reset Z position
        scale = Math.random() * 0.8 + 0.2;
        starRef.current.scale.set(scale, scale, scale);
        speedX = (Math.random() - 0.5) * 2;
        speedY = Math.random() - 1;
        speed.current = Math.random() * 0.05 + 0.01;
      }

      if (trailRef.current && trailRef.current.material instanceof THREE.ShaderMaterial) {
        // Update the shader's time uniform to animate the trail
        trailRef.current.material.uniforms.uTime.value = elapsed;
        trailRef.current.material.uniforms.uSpeed.value = speed.current * 5.0;
      }
    }
  });

  return (
    <mesh ref={starRef} position={[0, 0.5, -2]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial emissive="white" emissiveIntensity={emissiveIntensity} color="white" />
      <mesh ref={trailRef} position={[0, 0.75, 0]}>
        <coneGeometry args={[0.1, 1.5, 32]} />
        <trailMaterial transparent uLength={5.0} />
      </mesh>
    </mesh>
  );
};

export default FallingStar;

// ShaderMaterial for the trail
const TrailMaterial = shaderMaterial(
  { uColor: new THREE.Color(0xffffff), uTime: 0, uSpeed: 1.0, uLength: 1.5 },
  // Vertex Shader
  `
  uniform float uLength;

  varying float vOpacity;

  void main() {
    vec3 pos = position;
    
    // Calculate opacity based on y-position of the vertex (fading from top to bottom)
    vOpacity = clamp(1.0 - (pos.y / (uLength * 0.01) ), 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform vec3 uColor;

  varying float vOpacity;

  void main() {
    // Set color and fade the trail
    vec4 color = vec4(uColor, vOpacity);
    gl_FragColor = color;
  }
  `
);

// Register shader material
extend({ TrailMaterial });

// Extend the JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      trailMaterial: any;
    }
  }
}
