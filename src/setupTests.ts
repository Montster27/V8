// jest-dom adds custom jest matchers for asserting on DOM nodes
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia which is not implemented in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver with proper TypeScript interface
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
  root: Document | Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
