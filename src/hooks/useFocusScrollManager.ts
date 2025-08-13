import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useCameraTransition } from "./useCameraTransition";
import { useFocusStore } from "./useFocusStore";

export function useFocusScrollManager(
  //targets: FocusTargetData[],
  homePosition: { cameraPos: THREE.Vector3; lookAt: THREE.Vector3 },
  threshold?: number
) {
  const { createControlledTransition, isTransitioningRef } = useCameraTransition();

  
  const { currentIndex, setCurrentIndex, targets } = useFocusStore();
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

  // Cache positions
  useEffect(() => {
    cachedPositions.current = targets.map(({ mesh, cameraOffset, lookAtOffset }) => {
      if (!mesh) {
        return {
          cameraPos: homePosition.cameraPos.clone(),
          lookAt: homePosition.lookAt.clone(),
        };
      }
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      return {
        cameraPos: worldPos.clone().add(cameraOffset),
        lookAt: worldPos.clone().add(lookAtOffset),
      };
    });
    console.log('Cached positions:', cachedPositions.current);
  }, [targets, homePosition]);

  const setupTimelines = useCallback(
    (index: number) => {
      forwardTimelineRef.current?.kill();
      backwardTimelineRef.current?.kill();
      forwardTimelineRef.current = null;
      backwardTimelineRef.current = null;

      const currentTarget = index === -1 ? homePosition : cachedPositions.current[index];

      if (index < targets.length - 1) {
        const nextTarget = cachedPositions.current[index + 1];
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
        const prevTarget = index === 0 ? homePosition : cachedPositions.current[index - 1];
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
    [createControlledTransition, targets.length, homePosition]
  );

  useEffect(() => {
    const SCROLL_SPEED = 0.00007;
    const TOUCH_SPEED = 0.0002; // sensitivity for touch
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
      const deltaY = touchStartY - currentY; // positive = swipe up
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
  }, [threshold, setupTimelines, targets.length]);

  useEffect(() => {
    setupTimelines(currentIndex);
  }, [targets, setupTimelines]);

  return {
    forwardTimeline: forwardTimelineRef.current,
    backwardTimeline: backwardTimelineRef.current,
  };
}
