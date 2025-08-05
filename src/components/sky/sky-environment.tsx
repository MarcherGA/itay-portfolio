import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Clouds } from "./cloud";
import SkyBackground from "./sky-background";

export function SkyEnvironment() {
  const cloudGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (cloudGroupRef.current) {
      cloudGroupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <>
      <SkyBackground />
      <group ref={cloudGroupRef}>
        <Clouds />
      </group>
    </>
  );
}
