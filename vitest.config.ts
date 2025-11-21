import { defineConfig } from 'vitest/config';

export default defineConfig({
   test: {
      include: ['**/*.test.ts', '**/*.bench.ts'],
      exclude: ['node_modules'],
      coverage: { provider: 'istanbul', reporter: ['html', 'json'], include: ['src'] },
   },
});
