import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

export function useCameraTransition() {
  const { camera } = useThree();

  return (
    toPosition: THREE.Vector3,
    lookAtTarget: THREE.Vector3,
    duration = 1.5,
    ease = 'power2.inOut',
  ) => {
    const fromPos = camera.position.clone();
    const fromLook = new THREE.Vector3();
    camera.getWorldDirection(fromLook);
    fromLook.add(camera.position);

    const tweenState = {
      x: fromPos.x,
      y: fromPos.y,
      z: fromPos.z,
      lx: fromLook.x,
      ly: fromLook.y,
      lz: fromLook.z
    };

    gsap.to(tweenState, {
      x: toPosition.x,
      y: toPosition.y,
      z: toPosition.z,
      lx: lookAtTarget.x,
      ly: lookAtTarget.y,
      lz: lookAtTarget.z,
      duration,
      ease,
      onUpdate: () => {
        camera.position.set(tweenState.x, tweenState.y, tweenState.z);
        camera.lookAt(tweenState.lx, tweenState.ly, tweenState.lz);
      }
    });
  };
}
