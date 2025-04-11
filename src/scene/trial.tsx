import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import HolographicMaterial from '../HolographicMaterial';
  // Create an instance of the HolographicMaterial
  const hologramMaterial = new HolographicMaterial({
    hologramColor: new THREE.Color(0x00ffff),
    fresnelOpacity: 1.0,
    fresnelAmount: 1.0,
    scanlineSize: 15.0,
    hologramBrightness: 1.0,
    signalSpeed: 1.0,
    hologramOpacity: 1.0,
    enableBlinking: true,
    blinkFresnelOnly: false,
    blendMode: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

function Avatar() {
  const { scene } = useGLTF('/assets/Player.glb'); // Load the 3D avatar model
  const modelRef = useRef<THREE.Group>(null);

  // Apply the hologram material to the avatar's mesh
  scene.traverse((child: any) => {
    if (child.isMesh) {
      child.material = hologramMaterial;
    }
  });

  // Animate the shader's time uniform
  useFrame(({ clock }) => {
    if (modelRef.current) {
      hologramMaterial.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return <primitive object={scene} ref={modelRef} scale={1.5} />;
}

export default function HologramPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <Avatar />
        </Suspense>

        <OrbitControls />
      </Canvas>

      <div className="absolute top-10 left-10 text-4xl text-white">
        Full-Stack & Game Developer
      </div>
    </div>
  );
}
