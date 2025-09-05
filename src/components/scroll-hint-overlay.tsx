import { useEffect, useRef } from 'react';
import { useScrollHint } from '../hooks/useScrollHint';
import { useThemeStore } from '../hooks/useThemeStore';
import { useCustomLoadingManager } from '../hooks/useCustomLoadingManager';

export function ScrollHintOverlay() {
  const { isLoading} = useCustomLoadingManager();
  const isFirstLoaded = useRef(false);
  const { showHint } = useScrollHint();
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  
  useEffect(() => {
    if(!isLoading && !isFirstLoaded.current) isFirstLoaded.current = true;
  }, [isLoading]);

  // Don't render anything if hint is not showing
  if (!showHint || !isFirstLoaded.current) return null;

  return (
    <div 
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center animate-bounce"
      style={{ 
        pointerEvents: 'none',
        userSelect: 'none',
        position: 'fixed',
        bottom: '3rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}
    >
      <div 
        className={`text-md font-bold mb-4 px-4 py-2 rounded-lg ${isDark ? 'text-white' : 'text-black'} bg-gray-500/30`}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        Scroll Down
      </div>
      <div 
        className={`w-10 h-10 border-r-4 border-b-4 rotate-45 ${isDark ? 'border-white' : 'border-black'} opacity-70`}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      />
    </div>
  );
}
