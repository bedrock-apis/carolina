import { RolldownOptions } from 'rolldown';

import options from '../../rolldown.common.config';

export default [
   options,
   {
      input: { main: './src/addon/main.ts' },
      external: /^@minecraft/,
      output: { cleanDir: true, dir: './addon/scripts' },
   } satisfies RolldownOptions,
];
