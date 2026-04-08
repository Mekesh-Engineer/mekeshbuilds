// src/hooks/useClipboard.ts
// Copy text to clipboard with a brief "copied" feedback state.
import { useState, useCallback, useRef } from 'react';

export const useClipboard = (resetDelay = 2000) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsCopied(false), resetDelay);
      } catch (error) {
        console.error('Failed to copy:', error);
        setIsCopied(false);
      }
    },
    [resetDelay],
  );

  return { copy, isCopied };
};
