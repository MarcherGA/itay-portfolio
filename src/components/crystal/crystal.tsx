import { Mesh, MeshStandardMaterial, MeshToonMaterial, Vector3 } from "three";
import { useCameraTransition } from "../../hooks/useCameraTransition";
import { JSX, useEffect, useRef } from "react";
import { useSpring, useSpringValue } from "@react-spring/three";
import { HitboxMesh } from "../hitbox-mesh";

type InteractableCrystalProps = {
  mesh: Mesh | null;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
} & JSX.IntrinsicElements["group"];

const position = new Vector3(-5.1, 0.83, 0.53);
const lookAt = new Vector3(-5.3, 0.87, -0.45);

export function InteractableCrystal({ mesh, isFocused, setIsFocused, ...props }: InteractableCrystalProps) {
  const cameraTransition = useCameraTransition();
  const clonedMaterialRef = useRef<MeshToonMaterial | null>(null);

  // Spring values
  const { emissiveIntensity } = useSpring({ emissiveIntensity: 1, onChange: () => { if (clonedMaterialRef.current) clonedMaterialRef.current.emissiveIntensity = emissiveIntensity.get()} , config: { mass: 1, tension: 120, friction: 20 } });
  const { color } = useSpring({ color: "#00aaff", onChange: () => clonedMaterialRef.current?.emissive.set(color.get()) , config: { mass: 1, tension: 120, friction: 20 } });

  useEffect(() => {
    if (!clonedMaterialRef.current && mesh?.material) {
      const mat = new MeshToonMaterial().copy(mesh.material as MeshStandardMaterial);
      mat.emissiveIntensity = 1.2;
      mat.emissive.set("#00aaff");
      mesh.material = mat;
      clonedMaterialRef.current = mat;
    }
  }, [mesh]);


  const handleClick = () => {
    cameraTransition(position, lookAt);
    handlePointerLeave();
    setIsFocused(true);
  };

  const handlePointerEnter = () => {
    if (!isFocused) {
      emissiveIntensity.start(2.2);
      color.start("#00ffff"); // Cyan
    }
  };

  const handlePointerLeave = () => {
    if (!isFocused) {
      emissiveIntensity.start(1.2);
      color.start("#00aaff"); // Original
    }
  };

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      <primitive object={mesh} {...props} />
      <HitboxMesh
        enabled={!isFocused}
        position={[0.35,1.35, -0.07]}
        rotation={[0, 0, 0]}
        scale={[0.9, 2.5, 0.95]}
        onClick={!isFocused ? handleClick : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      />
    </group>
  );
}
