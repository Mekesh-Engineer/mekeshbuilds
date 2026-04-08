// src/test/setup.ts
// Global test environment setup for Vitest + jsdom.
// Mocks browser APIs that are not available in jsdom.

import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// ─── Cleanup after each test ─────────────────────────────────────────────────
afterEach(() => {
  cleanup();
});

// ─── window.matchMedia ───────────────────────────────────────────────────────
// Required for theme/responsive hooks and components.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ─── IntersectionObserver ────────────────────────────────────────────────────
// Required for scroll-driven Framer Motion animations and lazy loading.
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

// ─── ResizeObserver ──────────────────────────────────────────────────────────
const ResizeObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// ─── HTMLCanvasElement.getContext ─────────────────────────────────────────────
// Prevents Three.js / WebGL from crashing in jsdom.
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

// ─── navigator.serviceWorker ──────────────────────────────────────────────────
// Mocks PWA service worker API for offline caching logic tests.
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: vi.fn().mockResolvedValue(undefined),
    ready: Promise.resolve({ update: vi.fn() }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    controller: null,
    getRegistrations: vi.fn().mockResolvedValue([]),
  },
});

// ─── Firebase client mock ────────────────────────────────────────────────────
// Prevents real Firebase SDK initialization during tests.
vi.mock('@/lib/firebaseClient', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
  storage: {},
  firebaseApp: {},
  initFirebaseAnalytics: vi.fn().mockResolvedValue(null),
}));
// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});
