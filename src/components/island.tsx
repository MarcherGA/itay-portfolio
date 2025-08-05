import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useState } from "react";
import * as THREE from "three";
import { MeshStandardMaterial, MeshToonMaterial } from "three";
import { InteractableCrystal } from "./crystal/crystal";
import { Sign } from "./sign/sign";
import Avatar from "./avatar/avatar";
import { FloatingCrystals } from "./crystal/floating-crystals";

type FloatingIslandProps = {
  onLoad?: (nodes: Record<string, THREE.Object3D>) => void;
} & JSX.IntrinsicElements['group'];

export function FloatingIsland({ onLoad, ...groupProps }: FloatingIslandProps) {
  const { scene, nodes } = useGLTF("models/floating_island.glb") as unknown as {
    scene: THREE.Group;
    nodes: Record<string, THREE.Mesh>;
  };
  const [isSignFocused, setIsSignFocused] = useState(false);
  const [isCrystalFocused, setIsCrystalFocused] = useState(false);
  const [isAvatarFocused, setIsAvatarFocused] = useState(false);

  const island = nodes["island"];
  const crystal = nodes["crystal"];
  const sign = nodes["sign"] || nodes["Sign"];

  useEffect(() => {
    if (isAvatarFocused) {
      if (isSignFocused) setIsSignFocused(false);
      if (isCrystalFocused) setIsCrystalFocused(false);
    }
  }, [isAvatarFocused]);
  
  useEffect(() => {
    if (isCrystalFocused) {
      if (isAvatarFocused) setIsAvatarFocused(false);
      if (isSignFocused) setIsSignFocused(false);
    }
  }, [isCrystalFocused]);
  
  useEffect(() => {
    if (isSignFocused) {
      if (isCrystalFocused) setIsCrystalFocused(false);
      if (isAvatarFocused) setIsAvatarFocused(false);
    }
  }, [isSignFocused]);

  // Replace island material with toon
  useEffect(() => {
    if (island?.material) {
      const mat = island.material as MeshStandardMaterial;
      const toonMat = new MeshToonMaterial().copy(mat);
      island.material = toonMat;
    }
    onLoad?.(nodes);
  }, [island, onLoad]);

  return (
    <group raycast={()=>null} {...groupProps}>
      <primitive object={scene} />
      {crystal &&<><InteractableCrystal mesh={crystal} isFocused={isCrystalFocused} setIsFocused={setIsCrystalFocused}    />
        <FloatingCrystals rotation={[0, 0.5, 0]} parent={island} visible={isCrystalFocused} /> </> 
      }
      {sign && <Sign setIsFocused={setIsSignFocused} isFocused={isSignFocused}  mesh={sign} />}
      <Avatar isFocused={isAvatarFocused} setIsFocused={setIsAvatarFocused} parent={island} scale={1.3} rotation={[0, Math.PI * 0.36, 0]} position={new THREE.Vector3(-1, -0.12, 2.1)}/>
    </group>
  );
}
