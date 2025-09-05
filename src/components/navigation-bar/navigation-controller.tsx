import { useEffect } from 'react';
import * as THREE from 'three';
import { useCameraTransition } from '../../hooks/useCameraTransition';
import { useFocusScrollManager } from '../../hooks/useFocusScrollManager';
import { useFocusStore } from '../../hooks/useFocusStore';
import { FocusTarget } from '../../types/focusTarget';

export function NavigationController() {
  const { setCurrentIndex } = useFocusStore();
  const { getTargetPosition } = useFocusScrollManager({
    cameraPos: new THREE.Vector3(0, 50, 14),
    lookAt: new THREE.Vector3(0, 50, 0),
  }, 0.2);
  const { transition } = useCameraTransition();

  useEffect(() => {
    // Listen for navigation events from the NavigationBar
    const handleNavigateToTarget = (event: CustomEvent<{ targetId: FocusTarget }>) => {
      const { targetId } = event.detail;
      const targetPosition = getTargetPosition(targetId);
      if (!targetPosition) return;

      // Perform camera transition and update focus store only when transition completes
      transition(
        targetPosition.cameraPos,
        targetPosition.lookAt,
        1.5,
        'power2.inOut',
        () => {
          // Set the focus index only after the camera transition is complete
          setCurrentIndex(targetId);
        }
      );
    };

    // Add event listener
    window.addEventListener('navigate-to-target', handleNavigateToTarget as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('navigate-to-target', handleNavigateToTarget as EventListener);
    };
  }, [getTargetPosition, transition, setCurrentIndex]);

  // This component doesn't render anything visible
  return null;
}
