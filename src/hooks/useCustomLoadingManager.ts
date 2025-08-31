// hooks/useCustomLoadingManager.ts
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useCustomLoadingManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const managerSetupRef = useRef(false);
  const loadingStateRef = useRef({ itemsLoaded: 0, itemsTotal: 0 });

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
      requestAnimationFrame(() => {
        setIsLoading(true);
        loadingStateRef.current = { itemsLoaded, itemsTotal };
      });
    };
    
    THREE.DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      requestAnimationFrame(() => {
        loadingStateRef.current = { itemsLoaded, itemsTotal };
        const progressPercent = itemsTotal > 0 ? (itemsLoaded / itemsTotal) * 100 : 0;
        setProgress(progressPercent);
      });
    };
    
    THREE.DefaultLoadingManager.onLoad = () => {
      requestAnimationFrame(() => {
        setProgress(100);
        // Add a delay to let everything settle
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
    };
    
    THREE.DefaultLoadingManager.onError = (url) => {
      console.error('Loading error:', url);
      requestAnimationFrame(() => {
        // Still hide loading screen on error
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
      }
    };
  }, []);

  // Fallback timer in case loading manager doesn't trigger
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log('Fallback: Loading screen timeout after 8 seconds');
        setProgress(100);
        setIsLoading(false);
      }
    }, 8000);

    return () => clearTimeout(fallbackTimer);
  }, [isLoading]);

  return { isLoading, progress };
}