import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";


type StarrySkyboxProps = {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  rotationSpeed?: number;
};

export function StarrySkybox({
  count = 2000,
  radius = 500,
  color = "white",
  size = 0.5,
  rotationSpeed = 0.0001,
}: StarrySkyboxProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const starsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions.push(x, y, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    return geometry;
  }, [count, radius]);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color,
        size,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
      }),
    [color, size]
  );

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <points ref={pointsRef} geometry={starsGeometry} material={material} />
  );
}
