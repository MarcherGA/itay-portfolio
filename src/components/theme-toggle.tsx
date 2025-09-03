import React from 'react';
import { useThemeStore } from '../hooks/useThemeStore';

export function ThemeToggle() {
  const { mode, isSystemTheme, toggleMode, setSystemTheme } = useThemeStore();
  const isDark = mode === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && !isSystemTheme) {
      // Shift+click to reset to system theme
      setSystemTheme(true);
    } else {
      // Normal click to toggle theme
      toggleMode();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleClick}
        className={`
          relative w-16 h-8 rounded-full transition-all duration-300 ease-in-out
          ${isDark 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-blue-200 border-blue-300'
          }
          border-2 shadow-lg backdrop-blur-sm
          hover:shadow-xl transform hover:scale-105
          cursor-interactive
        `}
        title={
          isSystemTheme 
            ? `Using system theme (${mode}). Click to override.`
            : `Manual ${mode} mode. Click to toggle, Shift+click to use system theme.`
        }
      >
        {/* Toggle Handle */}
        <div
          className={`
            absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 ease-in-out
            flex items-center justify-center text-xs
            ${isDark 
              ? 'translate-x-8 bg-gray-700 text-yellow-400 shadow-yellow-400/20' 
              : 'translate-x-0.5 bg-white text-orange-500 shadow-orange-500/20'
            }
            shadow-lg
          `}
        >
          {isDark ? (
            // Moon icon for dark mode
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            // Sun icon for bright mode
            <svg width="18" height="18" viewBox="0 0 30 30" fill="currentColor">
    <path d="M 14.984375 0.98632812 A 1.0001 1.0001 0 0 0 14 2 L 14 5 A 1.0001 1.0001 0 1 0 16 5 L 16 2 A 1.0001 1.0001 0 0 0 14.984375 0.98632812 z M 5.796875 4.7988281 A 1.0001 1.0001 0 0 0 5.1015625 6.515625 L 7.2226562 8.6367188 A 1.0001 1.0001 0 1 0 8.6367188 7.2226562 L 6.515625 5.1015625 A 1.0001 1.0001 0 0 0 5.796875 4.7988281 z M 24.171875 4.7988281 A 1.0001 1.0001 0 0 0 23.484375 5.1015625 L 21.363281 7.2226562 A 1.0001 1.0001 0 1 0 22.777344 8.6367188 L 24.898438 6.515625 A 1.0001 1.0001 0 0 0 24.171875 4.7988281 z M 15 8 A 7 7 0 0 0 8 15 A 7 7 0 0 0 15 22 A 7 7 0 0 0 22 15 A 7 7 0 0 0 15 8 z M 2 14 A 1.0001 1.0001 0 1 0 2 16 L 5 16 A 1.0001 1.0001 0 1 0 5 14 L 2 14 z M 25 14 A 1.0001 1.0001 0 1 0 25 16 L 28 16 A 1.0001 1.0001 0 1 0 28 14 L 25 14 z M 7.9101562 21.060547 A 1.0001 1.0001 0 0 0 7.2226562 21.363281 L 5.1015625 23.484375 A 1.0001 1.0001 0 1 0 6.515625 24.898438 L 8.6367188 22.777344 A 1.0001 1.0001 0 0 0 7.9101562 21.060547 z M 22.060547 21.060547 A 1.0001 1.0001 0 0 0 21.363281 22.777344 L 23.484375 24.898438 A 1.0001 1.0001 0 1 0 24.898438 23.484375 L 22.777344 21.363281 A 1.0001 1.0001 0 0 0 22.060547 21.060547 z M 14.984375 23.986328 A 1.0001 1.0001 0 0 0 14 25 L 14 28 A 1.0001 1.0001 0 1 0 16 28 L 16 25 A 1.0001 1.0001 0 0 0 14.984375 23.986328 z"></path>
            </svg>
          )}
        </div>
        
        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          {/* Sun background icon */}
          <div className={`transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-0'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-300">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
            </svg>
          </div>
          
          {/* Moon background icon */}
          <div className={`transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30'}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gray-600">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </div>
        </div>

      </button>
    </div>
  );
}
