import { DisposableMode, Installation } from '@bedrock-apis/bds-utils';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, rm, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { platform } from 'node:process';
import { fileURLToPath } from 'node:url';

import { header } from '../addon/manifest.json' with { type: 'json' };
import { CLOSE_COMMAND, LOCAL_TOOL_PORT, WRITE_FILE } from './constants';

{
   // Initialize installation, be sure we are using the development version
   await using installation = new Installation({
      directory: './__installation__',
      disposableMode: DisposableMode.StopRunningServes,
   });

   // Check platform we are running on
   if (platform !== 'win32' && platform !== 'linux') throw new Error("This platform can't run BDS dumper");

   // Make sure any executable is installed
   await installation.ensureExecutable({ platform: platform, preview: true });

   // Ensure addon
   const ADDON_LINK = join(installation.directory, 'development_behavior_packs', header.uuid);
   if (!existsSync(ADDON_LINK)) {
      await mkdir(dirname(ADDON_LINK), { recursive: true }).catch(_ => null);
      await symlink(fileURLToPath(new URL('../addon', import.meta.url)), ADDON_LINK, 'junction');
   }

   // We need this one for communication
   installation.config.allowModule('@minecraft/server-net');

   installation.properties.set('enable-script', true);
   installation.properties.set('content-log-console-output-enabled', true);
   installation.properties.set('online-mode', false);

   const PREFERRED_WORLD_NAME = randomUUID();
   installation.properties.set('level-name', PREFERRED_WORLD_NAME);

   // Running BDS for vanilla docs
   let process = await installation.runWithTestConfig(
      { generate_all: true, generate_api_metadata: true },
      null
   );
   process.enabledOutputRedirection();
   await process.wait();
   await copyFile(join(installation.directory, 'worlds', PREFERRED_WORLD_NAME, 'level.dat'), 'level.dat');
   await rm(join(installation.directory, 'worlds'), { recursive: true });

   // Create world, manually with the ADDON
   const world = await installation.worlds.create(PREFERRED_WORLD_NAME, {
      behavior_packs: [header],
      resource_packs: [],
      experiments: ['gametest'],
   });
   installation.worlds.setWorldActiveInProperties(world);
   await copyFile('level.dat', join(installation.directory, 'worlds', PREFERRED_WORLD_NAME, 'level.dat'));
   await rm('level.dat');

   // Running Addon
   process = await installation.run([]);
   process.enabledOutputRedirection();

   // Server listener
   Bun.serve({
      async fetch(req, _): Promise<Response> {
         const url = new URL(req.url);
         if (url.pathname === CLOSE_COMMAND) {
            console.log('CLOSE_COMMAND: RECEIVED');
            await process.stop(false);
         } else if (url.pathname === WRITE_FILE) {
            console.log('WRITE_FILE: ' + url.searchParams.get('name'));

            await Bun.file(url.searchParams.get('name') ?? 'null.txt').write(req);
         } else return new Response(null, { status: 500 });
         return Response.json({ successfully: true });
      },
      port: LOCAL_TOOL_PORT,
   }).unref();

   // Clean up
   await process.wait();
   console.log('PROCESS ENDED -> CLEANING UP WORLDS');
   await rm(join(installation.directory, 'worlds'), { recursive: true });
}
/*
// Regenerate all the vanilla data
const process = await installation.runWithTestConfig({ generate_all: true }, null);
await process.wait();
*/
