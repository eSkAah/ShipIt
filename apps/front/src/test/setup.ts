import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
const locationMock = {
  href: '',
  pathname: '/',
};
Object.defineProperty(window, 'location', {
  value: locationMock,
  writable: true,
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  // Suppress React Query mutation errors (handled by onError)
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (args[0].includes('mutateAsync') || args[0].includes('Unhandled'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Handle unhandled promise rejections from mutateAsync in tests
// This prevents "Unhandled Rejection" errors when testing error cases
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Prevent the default handling (which logs to console)
    event.preventDefault();
  });
}
