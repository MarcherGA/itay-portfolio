import { Mesh, MeshStandardMaterial, MeshToonMaterial, Vector3 } from "three";
import { JSX, useEffect, useRef } from "react";
import { HitboxMesh } from "../hitbox-mesh";
import { useEmissiveSpring } from "../../hooks/useEmmisiveSpring";
import { FloatingCrystals } from "./floating-crystals";

type InteractableCrystalProps = {
  onClick?: () => void;
  mesh: Mesh | null;
  isFocused: boolean;
} & JSX.IntrinsicElements["group"];


export function InteractableCrystal({ mesh, isFocused, onClick, ...props }: InteractableCrystalProps) {
  const clonedMaterialRef = useRef<MeshToonMaterial | null>(null);
  

  // Spring values
  const { emissiveIntensity, color } = useEmissiveSpring(clonedMaterialRef, "#00aaff");

  useEffect(() => {
    if (!mesh?.material) return;
  
    const isToon = mesh.material instanceof MeshToonMaterial;
    if (!isToon) {
      const mat = new MeshToonMaterial().copy(mesh.material as MeshStandardMaterial);
      mat.emissiveIntensity = 1.2;
      mat.emissive.set("#00aaff");
      mesh.material = mat;
      clonedMaterialRef.current = mat;
    } else {
      clonedMaterialRef.current = mesh.material as MeshToonMaterial;
    }
  }, [mesh]);


  const handleClick = () => {
    onClick?.();
    handlePointerLeave();
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
      <primitive object={mesh} />
      <HitboxMesh
        enabled={!isFocused}
        position={[0.35,1.35, -0.07]}
        rotation={[0, 0, 0]}
        scale={[0.9, 2.5, 0.95]}
        onClick={!isFocused ? handleClick : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      />
      <FloatingCrystals rotation={[0, 0.5, 0]} parent={mesh} visible={isFocused} /> 
    </group>
  );
}
