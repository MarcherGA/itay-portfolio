import { Mesh, MeshStandardMaterial, MeshToonMaterial, Vector3 } from "three";
import { JSX, useEffect, useRef, useCallback, useMemo } from "react";
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
      mat.emissiveIntensity = 1.1;
      mat.emissive.set("#00aaff");
      mesh.material = mat;
      clonedMaterialRef.current = mat;
    } else {
      clonedMaterialRef.current = mesh.material as MeshToonMaterial;
      clonedMaterialRef.current.emissiveIntensity = 1.1;
      clonedMaterialRef.current.emissive.set("#00aaff");
    }
  }, [mesh]);

  const handleClick = useCallback(() => {
    handlePointerLeave();
    onClick?.();
  }, [onClick]);

  const handlePointerEnter = useCallback(() => {
    if (!isFocused) {
      emissiveIntensity.start(2.1);
      color.start("#00ffff"); // Cyan
    }
  }, [isFocused, emissiveIntensity, color]);

  const handlePointerLeave = useCallback(() => {
    if (!isFocused) {
      emissiveIntensity.start(1.1);
      color.start("#00aaff"); // Original
    }
  }, [isFocused, emissiveIntensity, color]);

  // Memoize hitbox props to prevent recreation
  const hitboxProps = useMemo(() => ({
    enabled: !isFocused,
    position: [0.35, 1.35, -0.07] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [0.9, 2.5, 0.95] as [number, number, number],
    onClick: !isFocused ? handleClick : undefined,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
  }), [isFocused, handleClick, handlePointerEnter, handlePointerLeave]);

  if (!mesh) return null;

  return (
    <group {...props} dispose={null}>
      {/* DON'T re-render the mesh - it's already part of the island scene */}
      {/* <primitive object={mesh} /> */}
      
      {/* Just handle interactions and effects */}
      <HitboxMesh {...hitboxProps} />
      
      {/* Only render floating crystals when focused */}
        <FloatingCrystals rotation={[0, 0.5, 0]} parent={mesh} visible={isFocused} />

    </group>
  );
}