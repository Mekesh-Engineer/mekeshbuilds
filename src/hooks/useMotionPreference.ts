// src/hooks/useMotionPreference.ts
// Detects user's reduced motion preference via prefers-reduced-motion media query.
import { useState, useEffect, useCallback } from 'react';
import type { Variants } from 'framer-motion';

export const useMotionPreference = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setShouldReduceMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  /**
   * Creates Framer Motion variants that respect the user's motion preference.
   * Returns static variants (no animation) when reduced motion is preferred.
   */
  const makeVariants = useCallback(
    (animated: Variants): Variants => {
      if (shouldReduceMotion) {
        return {
          initial: {},
          animate: {},
          exit: {},
        };
      }
      return animated;
    },
    [shouldReduceMotion],
  );

  return { shouldReduceMotion, makeVariants };
};
