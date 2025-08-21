import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      include: ['app/src/**/*.test.ts', 'packages/*/src/**/*.test.ts'],
      coverage: {
         provider: 'istanbul',
         reporter: ['html', 'json'],
         include: ['src'],
      },
   },
});
