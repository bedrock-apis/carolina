import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { platform } from 'node:process';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { DisposableMode, Installation } from '@bedrock-apis/bds-utils';
import { FNVHasher } from '@carolina/common';

import { header } from '../addon/manifest.json' with { type: 'json' };
import {
   CLOSE_COMMAND,
   LOCAL_TOOL_PORT,
   VANILLA_BLOCK_TYPES_FILE_NAME,
   WRITE_FILE,
} from './common/constants';
import { BlockMetadata } from './common/types';

/**
 * Checks if the current platform is supported for running BDS.
 */
function ensurePlatformSupported(): 'win32' | 'linux' {
   if (platform !== 'win32' && platform !== 'linux') {
      throw new Error("This platform can't run BDS dumper");
   }
   return platform;
}

/**
 * Ensures the addon is symlinked in the installation directory.
 */
async function setupAddonLink(installation: Installation): Promise<void> {
   const addonLink = join(installation.directory, 'development_behavior_packs', header.uuid);
   if (!existsSync(addonLink)) {
      await mkdir(dirname(addonLink), { recursive: true }).catch(() => null);
      await symlink(fileURLToPath(new URL('../addon', import.meta.url)), addonLink, 'junction');
   }
}

/**
 * Runs BDS once to generate vanilla documentation and metadata.
 */
async function generateVanillaData(installation: Installation): Promise<void> {
   const process = await installation.runWithTestConfig(
      { generate_all: true, generate_api_metadata: true },
      null
   );
   process.enabledOutputRedirection();
   await process.wait();
}

/**
 * Sets up the world with the specific addon and configurations.
 */
async function setupWorld(installation: Installation, worldName: string): Promise<void> {
   // Copy level.dat from previous run
   const worldPath = join(installation.directory, 'worlds', worldName);
   await copyFile(join(worldPath, 'level.dat'), 'level.dat');
   await rm(join(installation.directory, 'worlds'), { recursive: true });

   // Create the world with behavior/resource packs
   const world = await installation.worlds.create(worldName, {
      behavior_packs: [header],
      resource_packs: [],
      experiments: ['gametest'],
   });

   installation.worlds.setWorldActiveInProperties(world);

   // Restore level.dat
   await copyFile('level.dat', join(installation.directory, 'worlds', worldName, 'level.dat'));
   await rm('level.dat');
}

/**
 * Processes block metadata: sorting by FNV hash and filtering states based on vanilla documentation.
 */
async function processBlockMetadata(data: BlockMetadata[], installationDir: string): Promise<void> {
   const encoder = new TextEncoder();

   // Sort by FNV1_64_HASH
   data.sort((a, b) => {
      const aHash = FNVHasher.FNV1_64_HASH(encoder.encode(a.uid));
      const bHash = FNVHasher.FNV1_64_HASH(encoder.encode(b.uid));
      if (aHash > bHash) return 1;
      if (aHash < bHash) return -1;
      return a.uid.localeCompare(b.uid);
   });

   // Load vanilla block data for state filtering
   const vanillaBlocksPath = join(installationDir, 'docs/vanilladata_modules/mojang-blocks.json');
   const vanillaBlocks = JSON.parse(await readFile(vanillaBlocksPath, 'utf-8'));

   const vanillaBlocksToValidStates = new Map<string, string[]>();
   for (const block of vanillaBlocks.data_items) {
      vanillaBlocksToValidStates.set(
         block.name,
         block.properties.map((prop: { name: string }) => prop.name)
      );
   }

   const QUICK_STATE_MAP: Record<string, string> = { 'minecraft:deprecated_anvil': 'minecraft:anvil' };

   for (const block of data) {
      const id = QUICK_STATE_MAP[block.uid] ?? block.uid;
      const validStates = vanillaBlocksToValidStates.get(id);
      if (validStates) {
         block.sta = block.sta.filter(s => validStates.includes(s.name));
      }
   }
}

/**
 * Starts an HTTP server to communicate with the BDS process.
 */
function startCommunicationServer(installation: Installation, bdsProcess: any): void {
   const server = createServer(async (req, res) => {
      const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'localhost'}`);

      try {
         if (url.pathname === CLOSE_COMMAND) {
            console.log('CLOSE_COMMAND: RECEIVED');
            await bdsProcess.stop(false);
         } else if (url.pathname === WRITE_FILE) {
            const name = url.searchParams.get('name');
            if (!name) throw new ReferenceError('Undefined filename: ' + url);
            console.log('WRITE_FILE: ' + name);

            const body = Readable.toWeb(req) as unknown as ReadableStream<Uint8Array>;
            const data = await new Response(body).json();

            if (name === VANILLA_BLOCK_TYPES_FILE_NAME) {
               await processBlockMetadata(data, installation.directory);
            }

            await writeFile(name, JSON.stringify(data, null, 2));
         } else {
            res.writeHead(404);
            res.end();
            return;
         }

         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ successfully: true }));
      } catch (err) {
         console.error('Server error:', err);
         res.writeHead(500);
         res.end(JSON.stringify({ successfully: false, error: String(err) }));
      }
   });

   server.listen(LOCAL_TOOL_PORT);
   server.unref();
}

/**
 * Main execution flow.
 */
async function main(): Promise<void> {
   await using installation = new Installation({
      directory: './__installation__',
      disposableMode: DisposableMode.StopRunningServes,
   });

   console.log('Installation initialized');
   await installation.ensureExecutable({ platform: ensurePlatformSupported(), preview: true });

   await setupAddonLink(installation);

   // Configure server settings
   installation.config.allowModule('@minecraft/server-net');
   installation.properties.set('enable-script', true);
   installation.properties.set('content-log-console-output-enabled', true);
   installation.properties.set('online-mode', false);

   const worldName = randomUUID();
   installation.properties.set('level-name', worldName);

   console.log('Generating vanilla docs...');
   await generateVanillaData(installation);

   console.log('Setting up world with addon...');
   await setupWorld(installation, worldName);

   console.log('Running BDS with addon...');
   const bdsProcess = await installation.run([]);
   bdsProcess.enabledOutputRedirection();

   startCommunicationServer(installation, bdsProcess);

   // Wait for process to end and clean up
   await bdsProcess.wait();
   console.log('BDS process ended, cleaning up...');
   await rm(join(installation.directory, 'worlds'), { recursive: true }).catch(() => null);
}

main().catch(console.error);
/*
// Regenerate all the vanilla data
const process = await installation.runWithTestConfig({ generate_all: true }, null);
await process.wait();
*/
