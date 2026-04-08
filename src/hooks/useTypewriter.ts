// src/hooks/useTypewriter.ts
// Typewriter text animation effect.
import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (strings: string[], speed = 80) => {
  const [displayText, setDisplayText] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (strings.length === 0) return;

    const currentString = strings[stringIndex] ?? '';

    timeoutRef.current = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentString.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);

          if (charIndex + 1 === currentString.length) {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), 1500);
          }
        } else {
          setDisplayText(currentString.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);

          if (charIndex <= 1) {
            setIsDeleting(false);
            setStringIndex((prev) => (prev + 1) % strings.length);
            setCharIndex(0);
          }
        }
      },
      isDeleting ? speed / 2 : speed,
    );

    return () => clearTimeout(timeoutRef.current);
  }, [strings, stringIndex, charIndex, isDeleting, speed]);

  return displayText;
};
