import { BlockVolume, CommandError, CompoundBlockVolume, system, world } from '@minecraft/server';
import { exit, report } from './net-helper';
import { generateBlockObject } from './blocks';

system.beforeEvents.startup.subscribe(() => system.run(main));

async function main(): Promise<void> {
   const dimension = world.getDimension('minecraft:overworld');
   try {
      {
         const result = dimension.runCommand('tickingarea add circle 0 0 0 4 lamo true');
         console.log(result.successCount);

         const compoud = new CompoundBlockVolume({ x: 0, y: 0, z: 0 });
         compoud.pushVolume({
            volume: new BlockVolume({ x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 }),
         });
         await system.waitTicks(5);
         mainWhile: while (true) {
            console.log('Looping');
            for (const loc of compoud.getBlockLocationIterator()) {
               await system.waitTicks(1);
               if (!dimension.isChunkLoaded(loc)) continue mainWhile;
            }
            break;
         }
         await dimension.fillBlocks(compoud, 'bedrock');

         const blocks = await runThread(generateBlockObject(dimension));
         await report('block_maps.json', blocks);
      }

      await report('hello_world.json', { hello: true });
   } catch (e) {
      console.error('main failure', e);
   } finally {
      await exit();
   }
}

async function runThread<T>(iterator: Iterable<void, T>): Promise<T> {
   return new Promise<T>((r, j) => system.runJob(localExecutor<T>(iterator, r, j)));

   function* localExecutor<T>(
      iterator: Iterable<void, T>,
      resolve: (any: T) => void,
      reject: (er: unknown) => void,
   ): Generator<void> {
      try {
         const results = yield* iterator;
         resolve(results);
      } catch (error) {
         reject(error);
      }
   }
}
