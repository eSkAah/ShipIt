/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react()],

  build: {
    outDir: 'dist',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    sourcemap: true, // Enable source maps for Sentry error tracking
  },

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
