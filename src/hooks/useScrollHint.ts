import { useState, useEffect } from 'react';
import { useFocusStore } from './useFocusStore';

export function useScrollHint() {
  const [showHint, setShowHint] = useState(false);
  const { currentIndex } = useFocusStore();

  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;
    let resetTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setTimeout>;

    console.log('useScrollHint effect - currentIndex:', currentIndex);

    // Only track inactivity when on home target (currentIndex === -1)
    if (currentIndex === -1) {
      console.log('Setting up scroll hint for home target');
      const startHintCycle = () => {
        setShowHint(true);
        
        // Auto-hide hint after 5 seconds and restart cycle
        resetTimer = setTimeout(() => {
          setShowHint(false);
          
          // Restart the cycle after 6 seconds
          cycleTimer = setTimeout(() => {
            if (currentIndex === -1) {
              startHintCycle();
            }
          }, 6000);
        }, 5000);
      };

      // Reset hint on any interaction
      const resetHint = () => {
        clearTimeout(inactivityTimer);
        clearTimeout(resetTimer);
        clearTimeout(cycleTimer);
        setShowHint(false);
        
        // Start new cycle after interaction (6 seconds instead of 3)
        inactivityTimer = setTimeout(() => {
          if (currentIndex === -1) {
            startHintCycle();
          }
        }, 6000);
      };

      // Add event listeners for user interactions
      const events = ['wheel', 'keydown', 'touchstart'];
      events.forEach(event => window.addEventListener(event, resetHint));

      // Start initial cycle after 6 seconds
      inactivityTimer = setTimeout(() => {
        startHintCycle();
      }, 6000);

      // Cleanup
      return () => {
        events.forEach(event => window.removeEventListener(event, resetHint));
        clearTimeout(inactivityTimer);
        clearTimeout(resetTimer);
        clearTimeout(cycleTimer);
      };
    } else {
      console.log('Not on home target, hiding hint');
      setShowHint(false);
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up scroll hint timers');
      clearTimeout(inactivityTimer);
      clearTimeout(resetTimer);
      clearTimeout(cycleTimer);
      setShowHint(false);
    };
  }, [currentIndex]);

  return { showHint };
}
