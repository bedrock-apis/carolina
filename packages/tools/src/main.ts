import { DisposableMode, Installation } from '@bedrock-apis/bds-utils';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, rm, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { platform } from 'node:process';
import { fileURLToPath } from 'node:url';

import { header } from '../addon/manifest.json' with { type: 'json' };

await using installation = new Installation({
   directory: './__installation__',
   disposableMode: DisposableMode.StopRunningServes,
});
if (platform !== 'win32' && platform !== 'linux') throw new Error("This platform can't run BDS dumper");

await installation.ensureExecutable({ platform: platform, preview: true });

// Ensure addon
const ADDON_LINK = join(installation.directory, 'development_behavior_packs', header.uuid);
if (!existsSync(ADDON_LINK)) {
   await mkdir(dirname(ADDON_LINK), { recursive: true }).catch(_ => null);
   await symlink(fileURLToPath(new URL('../addon', import.meta.url)), ADDON_LINK, 'junction');
}
installation.config.allowModule('@minecraft/server-net');

installation.properties.set('enable-script', true);
installation.properties.set('content-log-console-output-enabled', true);
installation.properties.set('online-mode', false);

const PREFERRED_WORLD_NAME = randomUUID();
installation.properties.set('level-name', PREFERRED_WORLD_NAME);

// Create world, manually
const world = await installation.worlds.create(randomUUID(), {
   behavior_packs: [header],
   resource_packs: [],
   experiments: ['gametest'],
});
installation.worlds.setWorldActiveInProperties(world);
const process = await installation.run(null);
process.enabledOutputRedirection();

// CLean up
installation.events.add('dispose', async () => {
   await rm(join(installation.directory, 'worlds'), { recursive: true });
});

/*
// Regenerate all the vanilla data
const process = await installation.runWithTestConfig({ generate_all: true }, null);
await process.wait();
*/
