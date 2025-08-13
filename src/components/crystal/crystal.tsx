import { Mesh, MeshStandardMaterial, MeshToonMaterial, Vector3 } from "three";
import { useCameraTransition } from "../../hooks/useCameraTransition";
import { JSX, useEffect, useRef } from "react";
import { HitboxMesh } from "../hitbox-mesh";
import { useEmissiveSpring } from "../../hooks/useEmmisiveSpring";
import { FloatingCrystals } from "./floating-crystals";

type InteractableCrystalProps = {
  mesh: Mesh | null;
  isFocused: boolean;
  setIsFocused: (v: boolean) => void;
} & JSX.IntrinsicElements["group"];

const CRYSTAL_CAMERA_POSITION_OFFSET = new Vector3(0.9, 1.33, 2.53);
const CRYSTAL_LOOK_AT_OFFSET = new Vector3(0.7, 1.37, 1.55);

export function InteractableCrystal({ mesh, isFocused, setIsFocused, ...props }: InteractableCrystalProps) {
  const cameraTransition = useCameraTransition();
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
    const finalCamPos = mesh!.getWorldPosition(new Vector3()).add(CRYSTAL_CAMERA_POSITION_OFFSET)
    const finalLookAt = mesh!.getWorldPosition(new Vector3()).add(CRYSTAL_LOOK_AT_OFFSET)
    cameraTransition.transition(finalCamPos, finalLookAt, undefined, undefined, ()=> setIsFocused(true));
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
