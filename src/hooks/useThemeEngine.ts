// src/hooks/useThemeEngine.ts
// Directly manipulates CSS custom properties on the DOM for instant theme updates.
// Bypasses the React re-render cycle entirely.
import { useCallback } from 'react';

export const useThemeEngine = () => {
  /**
   * Applies theme colors to the canvas element's CSS custom properties.
   * Scoped to #live-canvas to prevent system UI color leaking.
   */
  const applyTheme = useCallback((primary: string, secondary: string) => {
    const canvas = document.getElementById('live-canvas');
    if (canvas) {
      canvas.style.setProperty('--color-primary', primary);
      canvas.style.setProperty('--color-secondary', secondary);
    }
  }, []);

  /**
   * Applies a font pairing to the canvas.
   */
  const applyFont = useCallback((primaryFont: string, secondaryFont: string) => {
    const canvas = document.getElementById('live-canvas');
    if (canvas) {
      canvas.style.setProperty('--font-primary', primaryFont);
      canvas.style.setProperty('--font-secondary', secondaryFont);
    }
  }, []);

  /**
   * Sets the canvas theme mode (light/dark) via the data-theme attribute.
   * Only affects the portfolio preview canvas, not the system UI.
   */
  const setThemeMode = useCallback((mode: 'light' | 'dark') => {
    const canvas = document.getElementById('live-canvas');
    if (canvas) {
      canvas.setAttribute('data-theme', mode);
    }
  }, []);

  /**
   * Toggles the system-level UI mode (light/dark) via data-mode on <html>.
   * Affects the entire application chrome (navbars, sidebar, cards, etc.).
   */
  const setSystemMode = useCallback((mode: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-mode', mode);
    try {
      localStorage.setItem('mekeshbuilds-mode', mode);
    } catch {
      // Storage unavailable — no-op
    }
  }, []);

  /**
   * Reads the persisted system mode from localStorage, or falls back to 'dark'.
   */
  const getPersistedMode = useCallback((): 'light' | 'dark' => {
    try {
      const stored = localStorage.getItem('mekeshbuilds-mode');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Storage unavailable
    }
    return 'dark';
  }, []);

  /**
   * Resets all theme properties back to CSS defaults.
   */
  const resetTheme = useCallback(() => {
    const canvas = document.getElementById('live-canvas');
    if (canvas) {
      canvas.style.removeProperty('--color-primary');
      canvas.style.removeProperty('--color-secondary');
      canvas.style.removeProperty('--font-primary');
      canvas.style.removeProperty('--font-secondary');
      canvas.removeAttribute('data-theme');
    }
  }, []);

  return { applyTheme, applyFont, setThemeMode, setSystemMode, getPersistedMode, resetTheme };
};
