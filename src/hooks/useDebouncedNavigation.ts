// hooks/useDebouncedNavigation.ts
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDebouncedNavigation(delay = 100) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isNavigatingRef = useRef(false);

  const debouncedNavigate = useCallback((to: string) => {
    // If already navigating, ignore subsequent clicks
    if (isNavigatingRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set navigating state
    isNavigatingRef.current = true;

    // Navigate after delay
    timeoutRef.current = setTimeout(() => {
      navigate(to);
      // Reset navigating state after navigation is complete
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 100);
    }, delay);
  }, [navigate, delay]);

  return debouncedNavigate;
}