import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useCameraTransition } from "./useCameraTransition";
import { useFocusStore } from "./useFocusStore";
import { FocusTarget } from "../types/focusTarget";

export function useFocusScrollManager(
  homePosition: { cameraPos: THREE.Vector3; lookAt: THREE.Vector3 },
  threshold?: number
) {
  const { createControlledTransition, isTransitioningRef } = useCameraTransition();

  const { currentIndex } = useFocusStore(); // Remove targets from here
  const cachedPositions = useRef<{ cameraPos: THREE.Vector3; lookAt: THREE.Vector3 }[]>([]);
  const forwardTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const backwardTimelineRef = useRef<gsap.core.Timeline | null>(null);
  
  const storeRef = useRef(useFocusStore.getState());

  useEffect(() => {
    const unsub = useFocusStore.subscribe((state) => {
      storeRef.current = state;
    });
    return () => unsub();
  }, []);

  const progressRef = useRef(0);
  const velocityRef = useRef(0);

  // Helper function to calculate rotated camera positions
  const calculateRotatedPositions = useCallback((mesh: THREE.Object3D, cameraOffset: THREE.Vector3, lookAtOffset: THREE.Vector3) => {
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    
    // Get the world rotation matrix
    const worldMatrix = new THREE.Matrix4();
    mesh.updateMatrixWorld(true);
    worldMatrix.copy(mesh.matrixWorld);
    
    // Extract just the rotation part (remove translation and scale)
    const rotationMatrix = new THREE.Matrix4();
    const meshWorldQuaternion = new THREE.Quaternion();
    const meshWorldScale = new THREE.Vector3();
    worldMatrix.decompose(new THREE.Vector3(), meshWorldQuaternion, meshWorldScale);
    rotationMatrix.makeRotationFromQuaternion(meshWorldQuaternion);
    
    // Transform the offsets by the rotation matrix
    const rotatedCameraOffset = cameraOffset.clone().applyMatrix4(rotationMatrix);
    const rotatedLookAtOffset = lookAtOffset.clone().applyMatrix4(rotationMatrix);
    
    return {
      cameraPos: worldPos.clone().add(rotatedCameraOffset),
      lookAt: worldPos.clone().add(rotatedLookAtOffset),
    };
  }, []);

  // Cache positions with rotation support
  useEffect(() => {
    const targets = storeRef.current.targets; // Use storeRef instead
    cachedPositions.current = targets.map(({ mesh, cameraOffset, lookAtOffset }) => {
      if (!mesh) {
        return {
          cameraPos: cameraOffset.clone(),
          lookAt: lookAtOffset.clone(),
        };
      }
      
      return calculateRotatedPositions(mesh, cameraOffset, lookAtOffset);
    });
  }, [storeRef.current.targets, homePosition, calculateRotatedPositions]); // Watch storeRef.current.targets

  const setupTimelines = useCallback(
    (index: number) => {
      const targets = storeRef.current.targets; // Use storeRef instead
      
      forwardTimelineRef.current?.kill();
      backwardTimelineRef.current?.kill();
      forwardTimelineRef.current = null;
      backwardTimelineRef.current = null;

      // Recalculate current position in case mesh has rotated
      let currentTarget;
      if (index === -1) {
        currentTarget = homePosition;
      } else {
        const target = targets[index];
        if (target?.mesh) {
          currentTarget = calculateRotatedPositions(target.mesh, target.cameraOffset, target.lookAtOffset);
        } else {
          currentTarget = cachedPositions.current[index];
        }
      }

      if (index < targets.length - 1) {
        // Recalculate next position
        const nextTargetData = targets[index + 1];
        let nextTarget;
        if (nextTargetData.mesh) {
          nextTarget = calculateRotatedPositions(nextTargetData.mesh, nextTargetData.cameraOffset, nextTargetData.lookAtOffset);
        } else {
          nextTarget = cachedPositions.current[index + 1];
        }
        
        const { timeline } = createControlledTransition(
          currentTarget.cameraPos,
          currentTarget.lookAt,
          nextTarget.cameraPos,
          nextTarget.lookAt,
          1.5,
          "power2.inOut"
        );
        forwardTimelineRef.current = timeline;
      }

      if (index > -1) {
        // Recalculate previous position
        let prevTarget;
        if (index === 0) {
          prevTarget = homePosition;
        } else {
          const prevTargetData = targets[index - 1];
          if (prevTargetData.mesh) {
            prevTarget = calculateRotatedPositions(prevTargetData.mesh, prevTargetData.cameraOffset, prevTargetData.lookAtOffset);
          } else {
            prevTarget = cachedPositions.current[index - 1];
          }
        }
        
        const { timeline } = createControlledTransition(
          currentTarget.cameraPos,
          currentTarget.lookAt,
          prevTarget.cameraPos,
          prevTarget.lookAt,
          1.5,
          "power2.inOut"
        );
        backwardTimelineRef.current = timeline;
      }

      progressRef.current = 0;
      velocityRef.current = 0;
      isTransitioningRef.current = false;
    },
    [createControlledTransition, homePosition, calculateRotatedPositions] // Remove targets from dependencies
  );

  useEffect(() => {
    const SCROLL_SPEED = 0.00007;
    const TOUCH_SPEED = 0.0002;
    const DAMPING = 0.5;

    let touchStartY = 0;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isTransitioningRef.current) return;
      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= window.innerHeight;
      velocityRef.current += delta * SCROLL_SPEED;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;
      velocityRef.current += deltaY * TOUCH_SPEED;
      e.preventDefault();
    };

    const update = () => {
      const { currentIndex, targets, setCurrentIndex } = storeRef.current;
      if (isTransitioningRef.current) return;
      
      if (Math.abs(velocityRef.current) > 0.0001) {
        let newProgress = progressRef.current + velocityRef.current;

        const upper = currentIndex === targets.length - 1 ? 0 : 1;
        const lower = currentIndex === -1 ? 0 : -1;
        newProgress = Math.min(Math.max(newProgress, lower), upper);

        if (newProgress > 0 && forwardTimelineRef.current) {
          forwardTimelineRef.current.progress(newProgress);
        } else if (newProgress < 0 && backwardTimelineRef.current) {
          backwardTimelineRef.current.progress(Math.abs(newProgress));
        }

        progressRef.current = newProgress;

        if (threshold) {
          if (newProgress >= threshold && forwardTimelineRef.current) {
            isTransitioningRef.current = true;
            velocityRef.current = 0;
            forwardTimelineRef.current.play();
            forwardTimelineRef.current.eventCallback("onComplete", () => {
              setCurrentIndex(currentIndex + 1);
              setupTimelines(currentIndex + 1);
            });
          } else if (newProgress <= -threshold && backwardTimelineRef.current) {
            isTransitioningRef.current = true;
            velocityRef.current = 0;
            backwardTimelineRef.current.play();
            backwardTimelineRef.current.eventCallback("onComplete", () => {
              setCurrentIndex(currentIndex - 1);
              setupTimelines(currentIndex - 1);
            });
          }
        }

        velocityRef.current *= DAMPING;
      }

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [threshold, setupTimelines]); // Remove targets.length from dependencies

  useEffect(() => {
    setupTimelines(currentIndex);
  }, [storeRef.current.targets, setupTimelines]); // Watch storeRef.current.targets

  // Method to manually refresh positions (useful if you know a mesh has rotated)
  const refreshPositions = useCallback(() => {
    setupTimelines(currentIndex);
  }, [setupTimelines, currentIndex]);

  // Helper to get position for any target by ID or index
  const getTargetPosition = useCallback((targetIndex: FocusTarget | number) => {
    const targets = storeRef.current.targets; // Use storeRef instead!
    
    if (targetIndex === -1) {
      return homePosition;
    }

    const target = targets[targetIndex];
    if (!target) return null;

    if (target.mesh) {
      return calculateRotatedPositions(target.mesh, target.cameraOffset, target.lookAtOffset);
    } else {
      return {
        cameraPos: target.cameraOffset.clone(),
        lookAt: target.lookAtOffset.clone(),
      };
    }
  }, [homePosition, calculateRotatedPositions]); // Remove targets from dependencies

  return {
    forwardTimeline: forwardTimelineRef.current,
    backwardTimeline: backwardTimelineRef.current,
    refreshPositions, // Expose this for manual refresh when needed
    getTargetPosition, // Expose this for components to get positions
  };
}