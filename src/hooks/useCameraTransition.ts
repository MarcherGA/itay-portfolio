import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useRef } from "react";
import * as THREE from "three";

export function useCameraTransition() {
  const { camera, invalidate } = useThree();
  const isTransitioningRef = useRef(false);

  function createControlledTransition(
    fromPosition: THREE.Vector3,
    fromLookAt: THREE.Vector3,
    toPosition: THREE.Vector3,
    toLookAt: THREE.Vector3,
    duration = 1.5,
    ease = "power2.inOut"
  ) {
    const tweenState = {
      x: fromPosition.x,
      y: fromPosition.y,
      z: fromPosition.z,
      lx: fromLookAt.x,
      ly: fromLookAt.y,
      lz: fromLookAt.z,
    };

    // Create a paused tween that animates tweenState from 0 to 1
    const timeline = gsap.timeline({ paused: true });

    timeline.to(tweenState, {
      x: toPosition.x,
      y: toPosition.y,
      z: toPosition.z,
      lx: toLookAt.x,
      ly: toLookAt.y,
      lz: toLookAt.z,
      duration,
      ease,
      onUpdate: () => {
        camera.position.set(tweenState.x, tweenState.y, tweenState.z);
        camera.lookAt(tweenState.lx, tweenState.ly, tweenState.lz);
        camera.updateMatrixWorld();
        invalidate();
      },
      onComplete: () => {
        isTransitioningRef.current = false;
      },
      onInterrupt: () => {
        isTransitioningRef.current = false;
      },
    });

    //timeline.invalidate();

    timeline.play(0);
    timeline.pause(0);
    isTransitioningRef.current = false;


    // Expose tweenState so you can control progress manually
    return {
      timeline,
      tweenState,
    };
  }

  function transition (
    toPosition: THREE.Vector3,
    lookAtTarget: THREE.Vector3,
    duration = 1.5,
    ease = 'power2.inOut',
    onComplete?: () => void
  ) {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
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
      lz: fromLook.z,
    };

    gsap.killTweensOf(tweenState);

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
      },
      onComplete: () => {
        isTransitioningRef.current = false;
        if (onComplete) onComplete();
      },
      onInterrupt: () => {
        isTransitioningRef.current = false;
      }
    });
  };

  return {
    createControlledTransition, transition, isTransitioningRef
  };
}
