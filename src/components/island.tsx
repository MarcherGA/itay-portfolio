import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshStandardMaterial, MeshToonMaterial } from "three";
import { InteractableCrystal } from "./crystal/crystal";
import { Sign } from "./sign/sign";
import Avatar from "./avatar/avatar";
import {  useFocusScrollManager } from "../hooks/useFocusScrollManager";
import { FocusTarget, FocusTargetData } from "../types/focusTarget";
import { useFocusStore } from "../hooks/useFocusStore";



type FloatingIslandProps = {
  onLoad?: (nodes: Record<string, THREE.Object3D>) => void;
} & JSX.IntrinsicElements["group"];

const CRYSTAL_CAMERA_POSITION_OFFSET = new THREE.Vector3(0.9, 1.33, 2.53);
const CRYSTAL_LOOK_AT_OFFSET = new THREE.Vector3(0.7, 1.37, 1.55);

const SIGN_CAMERA_POSITION_OFFSET = new THREE.Vector3(-1.04, 0.61, 0.93);
const SIGN_LOOK_AT_OFFSET = new THREE.Vector3(-0.34, 0.3, 0.29);

const AVATAR_CAMERA_POSITION_OFFSET = new THREE.Vector3(1.844, 2.32, 2.14);
const AVATAR_LOOK_AT_OFFSET = new THREE.Vector3(1.008, 2.17, 1.6);

const HOME_CAMERA_POS = new THREE.Vector3(0, 3, 14);
const HOME_LOOK_AT = new THREE.Vector3(0, 0, 0);

export function FloatingIsland({ onLoad, ...groupProps }: FloatingIslandProps) {
  const { scene, nodes } = useGLTF("models/floating_island.glb") as unknown as {
    scene: THREE.Group;
    nodes: Record<string, THREE.Mesh>;
  };
  //const [focus, setFocus] = useState<FocusTarget>(FocusTarget.home);
  const {currentIndex, setCurrentIndex, setTargets} = useFocusStore();

  const avatarRef = useRef<{ group: THREE.Group | null }>(null);
  const [avatarMesh, setAvatarMesh] = useState<THREE.Group | null>(null);

  const { island, crystal, sign } = useMemo(() => {
    return {
      island: nodes["island"],
      crystal: nodes["crystal"],
      sign: nodes["sign"] || nodes["Sign"],
    };
  }, [nodes]);
  
useEffect(() => {
  if (avatarRef.current?.group) {
    setAvatarMesh(avatarRef.current.group);
  }
}, [avatarRef.current?.group]);

  // Build the targets array, safely handle avatarRef group not ready yet
  const focusTargets: FocusTargetData[] = useMemo(
    () => [
      {
        id: "avatar",
        mesh: avatarMesh ?? null,
        cameraOffset: AVATAR_CAMERA_POSITION_OFFSET,
        lookAtOffset: AVATAR_LOOK_AT_OFFSET,
      },
      {
        id: "sign",
        mesh: sign ?? null,
        cameraOffset: SIGN_CAMERA_POSITION_OFFSET,
        lookAtOffset: SIGN_LOOK_AT_OFFSET,
      },
      {
        id: "crystal",
        mesh: crystal ?? null,
        cameraOffset: CRYSTAL_CAMERA_POSITION_OFFSET,
        lookAtOffset: CRYSTAL_LOOK_AT_OFFSET,
      },
    ],
    [crystal, sign, avatarMesh]
  );

  useEffect(() => {
    setTargets(focusTargets);
  }, [focusTargets]);

  // Replace island material with toon and optimize
  useEffect(() => {
    if (island?.material && !(island.material instanceof MeshToonMaterial)) {
      const toonMat = new MeshToonMaterial().copy(island.material as MeshStandardMaterial);
      island.material = toonMat;
    }
    scene.traverse((obj) => {
      obj.frustumCulled = true;
      obj.matrixAutoUpdate = false;
    });
    onLoad?.(nodes);
  }, [island, scene, nodes, onLoad]);

  const { } = useFocusScrollManager({
    cameraPos: HOME_CAMERA_POS,
    lookAt: HOME_LOOK_AT,
  }, 0.2);

  function onFocusTarget(index: FocusTarget) {
    setCurrentIndex(index);
  }


  function returnHome() {
    setCurrentIndex(-1);
  }

  return (
    <group raycast={() => null} {...groupProps}>
      <primitive object={scene} dispose={null} />
      {crystal && (
        <InteractableCrystal
          mesh={crystal}
          isFocused={currentIndex === FocusTarget.crystal}
          setIsFocused={() => onFocusTarget(FocusTarget.crystal)}
        />
      )}
      {sign && (
        <Sign
          setIsFocused={() => onFocusTarget(FocusTarget.sign)}
          isFocused={currentIndex === FocusTarget.sign}
          mesh={sign}
        />
      )}
      <Avatar
        ref={avatarRef}
        isFocused={currentIndex === FocusTarget.avatar}
        setIsFocused={() => onFocusTarget(FocusTarget.avatar)}
        parent={island}
        scale={1.3}
        rotation={[0, Math.PI * 0.36, 0]}
        position={new THREE.Vector3(-1, -0.12, 2.1)}
      />
      {/* You can add a button or UI somewhere here that calls returnHome */}
    </group>
  );
}
