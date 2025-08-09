import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { MeshStandardMaterial, MeshToonMaterial } from "three";
import { InteractableCrystal } from "./crystal/crystal";
import { Sign } from "./sign/sign";
import Avatar from "./avatar/avatar";

type FocusTarget = "crystal" | "sign" | "avatar" | null;

type FloatingIslandProps = {
  onLoad?: (nodes: Record<string, THREE.Object3D>) => void;
} & JSX.IntrinsicElements['group'];

export function FloatingIsland({ onLoad, ...groupProps }: FloatingIslandProps) {
  const { scene, nodes } = useGLTF("models/floating_island.glb") as unknown as {
    scene: THREE.Group;
    nodes: Record<string, THREE.Mesh>;
  };
  const [focus, setFocus] = useState<FocusTarget>(null);

  const { island, crystal, sign } = useMemo(() => {
    return {
      island: nodes["island"],
      crystal: nodes["crystal"],
      sign: nodes["sign"] || nodes["Sign"],
    };
  }, [nodes]);

  // Replace island material with toon
  useEffect(() => {
    if (island?.material && !(island.material instanceof MeshToonMaterial)) {
      const toonMat = new MeshToonMaterial().copy(island.material as MeshStandardMaterial);
      island.material = toonMat;
    }
    scene.traverse(obj => {
      obj.frustumCulled = true;
      obj.matrixAutoUpdate = false;
    });
    onLoad?.(nodes);
  }, []);

  return (
    <group raycast={()=>null} {...groupProps}>
      <primitive object={scene} dispose={null} />
      {crystal &&<InteractableCrystal mesh={crystal} isFocused={focus === "crystal"} setIsFocused={()=> setFocus("crystal")}    />
      }
      {sign && <Sign setIsFocused={()=> setFocus("sign")} isFocused={focus === "sign"}  mesh={sign} />}
      <Avatar isFocused={focus === "avatar"} setIsFocused={()=>setFocus("avatar")} parent={island} scale={1.3} rotation={[0, Math.PI * 0.36, 0]} position={new THREE.Vector3(-1, -0.12, 2.1)}/>
    </group>
  );
}
