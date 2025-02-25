import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      include: ['./**/*.test.ts'],
      testTimeout: 25_000,
      coverage: {
         provider: 'istanbul',
         reporter: ['html', 'json'],
         include: ['src'],
      },
      globals: true, // Ensure globals are enabled for performance stats
      setupFiles: './scripts/vitest.setup.ts', // Setup file to initialize performance hooks
   },
});
