// hooks/useCustomLoadingManager.ts
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useCustomLoadingManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const managerSetupRef = useRef(false);
  const loadingStateRef = useRef({ itemsLoaded: 0, itemsTotal: 0 });
  const hasInitiallyLoadedRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Prevent double setup in StrictMode
    if (managerSetupRef.current) return;
    managerSetupRef.current = true;

    const originalOnStart = THREE.DefaultLoadingManager.onStart;
    const originalOnProgress = THREE.DefaultLoadingManager.onProgress;
    const originalOnLoad = THREE.DefaultLoadingManager.onLoad;
    const originalOnError = THREE.DefaultLoadingManager.onError;

    // Use requestAnimationFrame to defer state updates
    THREE.DefaultLoadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      // Clear any pending hide timer to prevent flickering
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      // Only show loading screen if this is the initial load
      // or if we're loading a significant number of items
      if (!hasInitiallyLoadedRef.current || itemsTotal > 5) {
        requestAnimationFrame(() => {
          setIsLoading(true);
          loadingStateRef.current = { itemsLoaded, itemsTotal };
        });
      }
    };
    
    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      requestAnimationFrame(() => {
        loadingStateRef.current = { itemsLoaded, itemsTotal };
        const progressPercent = itemsTotal > 0 ? (itemsLoaded / itemsTotal) * 100 : 0;
        setProgress(progressPercent);
      });
    };
    
    THREE.DefaultLoadingManager.onLoad = () => {
      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the loading completion to prevent rapid show/hide cycles
      debounceTimerRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          setProgress(100);
          
          // Mark as initially loaded
          hasInitiallyLoadedRef.current = true;
          
          // Hide loading screen with a delay for smooth transition
          hideTimerRef.current = setTimeout(() => {
            setIsLoading(false);
          }, 500);
        });
      }, 100); // Small debounce to handle rapid load events
    };
    
    THREE.DefaultLoadingManager.onError = (url) => {
      console.error('Loading error:', url);
      requestAnimationFrame(() => {
        // Still hide loading screen on error, but mark as loaded
        hasInitiallyLoadedRef.current = true;
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
    };

    // Cleanup function
    return () => {
      if (managerSetupRef.current) {
        THREE.DefaultLoadingManager.onStart = originalOnStart;
        THREE.DefaultLoadingManager.onProgress = originalOnProgress;
        THREE.DefaultLoadingManager.onLoad = originalOnLoad;
        THREE.DefaultLoadingManager.onError = originalOnError;
        managerSetupRef.current = false;
        
        // Clear any pending timers
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
      }
    };
  }, []);

  // Fallback timer in case loading manager doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log('Fallback: Loading screen timeout after 30 seconds');
        setProgress(100);
        hasInitiallyLoadedRef.current = true;
        setIsLoading(false);
      }
    }, 30000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  return { isLoading, progress };
}
