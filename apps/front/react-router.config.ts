import type { Config } from '@react-router/dev/config';

export default {
  // SPA mode - no server-side rendering
  ssr: false,

  // Use app directory for routes
  appDirectory: 'app',

  // Build output directory
  buildDirectory: 'dist',
} satisfies Config;
