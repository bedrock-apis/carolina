import { ChildProcess, spawn } from 'node:child_process';
import { chmod, cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { CACHE_BDS, CACHE_BDS_EXE_PATH, CACHE_DUMP_OUTPUT, removeBdsTestConfig, writeBdsTestConfig } from './constants';
import { prepareBdsAndCacheFolders } from './make-ready';
import { HTTPServer } from './serve';
import { setupScriptAPI } from './setup-script-api';

export async function dump(): Promise<number> {
   await dumpIt();
   return 0;
}

async function dumpIt(): Promise<void> {
   const start = Date.now();

   await prepareBdsAndCacheFolders();
   await setupScriptAPI();

   await writeBdsTestConfig();
   await executeBds().promise;
   await removeBdsTestConfig();

   // This part should be also moved to separated method to avoid additional main.ts complexity, basically be more deterministic
   const server = new HTTPServer(() => {
      if (child.exitCode === null) child.stdin?.write('stop\n');
      setTimeout(() => child.kill(), 5_000).unref();
      server.server.close();
   });
   server.server.unref();

   if (process.platform !== 'win32') await chmod(CACHE_BDS_EXE_PATH, 0o755);

   const { child, promise } = executeBds();

   await promise;

   await rm(join(CACHE_DUMP_OUTPUT, 'docs'), { recursive: true, force: true });
   await cp(join(CACHE_BDS, 'docs'), join(CACHE_DUMP_OUTPUT, 'docs'), { recursive: true });

   console.log(`✅\tBDS dump finished in ${((Date.now() - start) / 1000).toFixed(2)}s`);
}

function executeBds(): { promise: Promise<void>; child: ChildProcess } {
   const start = Date.now();

   const child = spawn(CACHE_BDS_EXE_PATH, [], {
      // 'Editor=true'
      timeout: 60_000 * 3, //3mins in total
      detached: false,
      cwd: dirname(CACHE_BDS_EXE_PATH),
   });

   setTimeout(() => {
      if (!child.killed) {
         console.error('Fatal Timeout: process keep running, leak');
         process.exit(-1);
      }
   }, 60_000 * 5).unref(); //hard limit - 5mins

   return {
      child,
      promise: new Promise<void>((resolve, reject) => {
         let exited = false;
         const exit = (): void => {
            if (exited) return;
            exited = true;
            if (!child.killed) child.kill();
            child.unref();
            console.log(`🎉\tBDS run done in ${((Date.now() - start) / 1000).toFixed(2)}s`);
            resolve();
         };
         child.stdout.pipe(process.stdout);
         child.stderr.pipe(process.stderr);
         child.stdout.on('data', chunk => {
            if (chunk.toString().trim() === 'Quit correctly') exit();
         });
         child.on('error', reject);
         child.on('exit', code => {
            if (code !== 0) return reject(new Error('BDS exited with exit code ' + code));
            exit();
         });
      }),
   };
}
