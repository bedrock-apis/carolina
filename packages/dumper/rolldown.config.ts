import { defineConfig } from '../../rolldown.config';
import { devDependencies } from './package.json' with { type: 'json' };

export default defineConfig({ main: './src/main.ts' }, devDependencies);
