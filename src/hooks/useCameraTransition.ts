import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useRef } from "react";
import * as THREE from "three";

export function useCameraTransition() {
  const threeState = useThree(); // Get the whole state instead of destructuring
  const isTransitioningRef = useRef(false);

  function createControlledTransition(
    fromPosition: THREE.Vector3,
    fromLookAt: THREE.Vector3,
    toPosition: THREE.Vector3,
    toLookAt: THREE.Vector3,
    duration = 1.5,
    ease = "power2.inOut"
  ) {
    // Always get fresh camera reference
    const { camera, invalidate } = threeState.get();
    
    const tweenState = {
      x: fromPosition.x,
      y: fromPosition.y,
      z: fromPosition.z,
      lx: fromLookAt.x,
      ly: fromLookAt.y,
      lz: fromLookAt.z,
    };

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

    timeline.play(0);
    timeline.pause(0);
    isTransitioningRef.current = false;

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
    // ALWAYS get fresh camera reference here instead of using closure
    const { camera, invalidate } = threeState.get();
    
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
        // Use the fresh camera reference
        camera.position.set(tweenState.x, tweenState.y, tweenState.z);
        camera.lookAt(tweenState.lx, tweenState.ly, tweenState.lz);
        camera.updateMatrixWorld();
        invalidate();
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
    createControlledTransition, 
    transition, 
    isTransitioningRef
  };
}