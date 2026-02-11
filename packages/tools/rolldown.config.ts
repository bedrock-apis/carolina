import options from '../../rolldown.common.config';

export default [
   options,
   { input: { main: './src/addon/main.ts' }, output: { cleanDir: true, dir: './addon/scripts' } },
];
