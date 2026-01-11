import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react()] as any,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reportsDirectory: 'coverage',
      provider: 'v8',
    },
    env: {
      VITE_STRIPE_PRICE_PREMIUM: 'price_test_123',
    },
  },
});
