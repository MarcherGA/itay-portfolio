import { useGLTF } from "@react-three/drei";
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MeshStandardMaterial, MeshToonMaterial } from "three";
import { InteractableCrystal } from "./crystal/crystal";
import { Sign } from "./sign/sign";
import Avatar from "./avatar/avatar";
import {  useFocusScrollManager } from "../hooks/useFocusScrollManager";
import { FocusTarget, FocusTargetData } from "../types/focusTarget";
import { useFocusStore } from "../hooks/useFocusStore";
import { useCameraTransition } from "../hooks/useCameraTransition";
import { invalidate } from "@react-three/fiber";



type FloatingIslandProps = {
  onLoad?: (nodes: Record<string, THREE.Object3D>) => void;
} & JSX.IntrinsicElements["group"];

const CRYSTAL_CAMERA_POSITION_OFFSET = new THREE.Vector3(2.1, 1.5, 2);
const CRYSTAL_LOOK_AT_OFFSET = new THREE.Vector3(0.3, 1.4, 0);

const SIGN_CAMERA_POSITION_OFFSET = new THREE.Vector3(-0.55, 0.61, 1.5);
const SIGN_LOOK_AT_OFFSET = new THREE.Vector3(0, 0.15, 0);

const AVATAR_CAMERA_POSITION_OFFSET = new THREE.Vector3(0, 2.32, 4);
const AVATAR_LOOK_AT_OFFSET = new THREE.Vector3(-1.1, 2.17, 1.6);

const ISLAND_CAMERA_POS = new THREE.Vector3(0, 3.5, 10);
const ISLAND_LOOK_AT = new THREE.Vector3(0.2, 0.5, 0);

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
        id: "island",
        mesh: null,
        cameraOffset: ISLAND_CAMERA_POS,
        lookAtOffset: ISLAND_LOOK_AT,
      },
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
      obj.frustumCulled = false; // keep rendered even offscreen
      obj.matrixAutoUpdate = false;
    });
  
    // warm up: render a few hidden frames so GPU compiles shaders
    let i = 0;
    const id = setInterval(() => {
      // invalidate forces one render pass
      // import { invalidate } from '@react-three/fiber'
      invalidate();
      if (++i > 8) clearInterval(id);
    }, 60);
  
    onLoad?.(nodes);
  }, [island, scene, nodes, onLoad]);
  

  const { getTargetPosition } = useFocusScrollManager({
    cameraPos: new THREE.Vector3(0, 50, 14),
    lookAt: new THREE.Vector3(0, 50, 0),
  }, 0.2);
  const { transition } = useCameraTransition();

  const handleFocusTarget = useCallback((targetId: FocusTarget) => {
    const targetPosition = getTargetPosition(targetId);
    if (!targetPosition) return;

    transition(
      targetPosition.cameraPos,
      targetPosition.lookAt,
      1.5,
      'power2.inOut',
      () => {
        if (targetId !== -1) {
          setCurrentIndex(targetId);
        }
      }
    );
  }, [getTargetPosition, transition, focusTargets, setCurrentIndex]);



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
          onClick={() => handleFocusTarget(FocusTarget.crystal)}
        />
      )}
      {sign && (
        <Sign
          onClick={() => handleFocusTarget(FocusTarget.sign)}
          isFocused={currentIndex === FocusTarget.sign}
          mesh={sign}
        />
      )}
      <Avatar
        ref={avatarRef}
        isFocused={currentIndex === FocusTarget.avatar}
        onClick={() => handleFocusTarget(FocusTarget.avatar)}
        parent={island}
        scale={1.3}
        rotation={[0, Math.PI * 0.36, 0]}
        position={new THREE.Vector3(-1, -0.12, 2.1)}
      />
      {/* You can add a button or UI somewhere here that calls returnHome */}
    </group>
  );
}
useGLTF.preload("models/floating_island.glb");