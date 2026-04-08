// src/hooks/useThemeEngine.test.ts
// Tests direct DOM mutation behavior of the theme engine hook.
// Verifies CSS custom properties and data attributes are set correctly.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeEngine } from '@/hooks/useThemeEngine';

describe('useThemeEngine', () => {
  let canvas: HTMLDivElement;

  beforeEach(() => {
    // Create a fake #live-canvas element in jsdom
    canvas = document.createElement('div');
    canvas.id = 'live-canvas';
    document.body.appendChild(canvas);

    // Reset localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    document.body.removeChild(canvas);
  });

  // ── applyTheme ─────────────────────────────────────────────────────────────

  it('applyTheme sets --color-primary and --color-secondary on #live-canvas', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.applyTheme('#ff6b2c', '#ff8a57');
    });

    expect(canvas.style.getPropertyValue('--color-primary')).toBe('#ff6b2c');
    expect(canvas.style.getPropertyValue('--color-secondary')).toBe('#ff8a57');
  });

  it('applyTheme does nothing when #live-canvas is absent', () => {
    document.body.removeChild(canvas);

    const { result } = renderHook(() => useThemeEngine());

    // Should not throw when canvas is missing
    expect(() => {
      act(() => {
        result.current.applyTheme('#ff6b2c', '#ff8a57');
      });
    }).not.toThrow();

    document.body.appendChild(canvas); // Restore for afterEach cleanup
  });

  // ── applyFont ──────────────────────────────────────────────────────────────

  it('applyFont sets --font-primary and --font-secondary on #live-canvas', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.applyFont('Inter', 'Outfit');
    });

    expect(canvas.style.getPropertyValue('--font-primary')).toBe('Inter');
    expect(canvas.style.getPropertyValue('--font-secondary')).toBe('Outfit');
  });

  // ── setThemeMode ───────────────────────────────────────────────────────────

  it('setThemeMode sets data-theme attribute on #live-canvas', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.setThemeMode('light');
    });

    expect(canvas.getAttribute('data-theme')).toBe('light');
  });

  it('setThemeMode can switch from light to dark', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.setThemeMode('light');
      result.current.setThemeMode('dark');
    });

    expect(canvas.getAttribute('data-theme')).toBe('dark');
  });

  // ── setSystemMode ──────────────────────────────────────────────────────────

  it('setSystemMode sets data-mode on <html> element', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.setSystemMode('dark');
    });

    expect(document.documentElement.getAttribute('data-mode')).toBe('dark');
  });

  it('setSystemMode persists mode to localStorage', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.setSystemMode('light');
    });

    expect(localStorage.getItem('mekeshbuilds-mode')).toBe('light');
  });

  // ── getPersistedMode ───────────────────────────────────────────────────────

  it('getPersistedMode returns "dark" by default when nothing is stored', () => {
    const { result } = renderHook(() => useThemeEngine());

    const mode = result.current.getPersistedMode();

    expect(mode).toBe('dark');
  });

  it('getPersistedMode returns stored "light" value from localStorage', () => {
    localStorage.setItem('mekeshbuilds-mode', 'light');

    const { result } = renderHook(() => useThemeEngine());

    const mode = result.current.getPersistedMode();

    expect(mode).toBe('light');
  });

  it('getPersistedMode ignores invalid stored values and falls back to "dark"', () => {
    localStorage.setItem('mekeshbuilds-mode', 'system'); // invalid value

    const { result } = renderHook(() => useThemeEngine());

    const mode = result.current.getPersistedMode();

    expect(mode).toBe('dark');
  });

  // ── resetTheme ─────────────────────────────────────────────────────────────

  it('resetTheme removes all CSS custom properties and data-theme from canvas', () => {
    const { result } = renderHook(() => useThemeEngine());

    act(() => {
      result.current.applyTheme('#ff6b2c', '#ff8a57');
      result.current.applyFont('Inter', 'Outfit');
      result.current.setThemeMode('light');
    });

    act(() => {
      result.current.resetTheme();
    });

    expect(canvas.style.getPropertyValue('--color-primary')).toBe('');
    expect(canvas.style.getPropertyValue('--color-secondary')).toBe('');
    expect(canvas.style.getPropertyValue('--font-primary')).toBe('');
    expect(canvas.style.getPropertyValue('--font-secondary')).toBe('');
    expect(canvas.getAttribute('data-theme')).toBeNull();
  });
});
