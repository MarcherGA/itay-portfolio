// useHoverClass.ts
import { useCallback } from 'react';

const HOVER_CLASS = 'hovering-interactive';

export function useHoverPointer() {
  const showHoverPointer = useCallback(() => {
    document.body.classList.add(HOVER_CLASS);
  }, []);

  const hideHoverPointer = useCallback(() => {
    document.body.classList.remove(HOVER_CLASS);
  }, []);

  return { showHoverPointer, hideHoverPointer };
}
