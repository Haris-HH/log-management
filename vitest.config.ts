import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import pkg from './package.json';

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],

  // Mirrors vite.config.ts so modules reading __APP_VERSION__ (e.g. Login) load.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },

  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,

    // API modules read these at import time.
    env: {
      VITE_API_BASE_URL: 'https://api.test/api/v0',
      VITE_API_SERVICE_CHANNEL: 'log-management',
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/mocks/**',
        'src/types/**',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],

      // Per-area floors rather than one global number: the page/pdf layer is
      // still untested, so a project-wide threshold would either be meaningless
      // or block the build. These lock in what is covered today.
      thresholds: {
        'src/api/**': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95,
        },
        'src/utils/**': {
          statements: 90,
          branches: 60,
          functions: 85,
          lines: 90,
        },
        // Aggregated over the whole directory, so the still-untested
        // useOpenStreetMap pulls this down. Raise as that lands.
        'src/hooks/**': {
          statements: 40,
          branches: 28,
          functions: 65,
          lines: 40,
        },
      },
    },
  },
});
