import { spawn } from 'node:child_process';
export { default } from '../../rolldown.common.config';
spawn(
   'bun',
   [process.argv.includes('-w') ? '--watch' : null, './gen/main.ts'].filter(_ => _ !== null),
   { stdio: 'inherit', shell: false }
);
