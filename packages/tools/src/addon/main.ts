import { BlockPermutation, BlockStates, BlockTypes, LiquidType, system, world } from '@minecraft/server';
import { HttpRequest, HttpRequestMethod, http } from '@minecraft/server-net';

import { VANILLA_BLOCK_TYPES_FILE_NAME, CLOSE_COMMAND, LOCAL_DOMAIN, WRITE_FILE } from '../common/constants';
import { BlockMetadata } from '../common/types';

world.afterEvents.worldLoad.subscribe(async () => {
   console.log(
      JSON.stringify(
         BlockPermutation.resolve('minecraft:warped_door' as string, {
            ['direction']: 1,
            'minecraft:cardinal_direction': 'east',
         }).getAllStates()
      )
   );
   const manager = world.getLootTableManager();
   // Pre-setup
   console.log('Clean up');
   world.tickingAreaManager.removeAllTickingAreas();
   await system.waitTicks(5);
   console.log('Ticking setup');
   const dimension = world.getDimension('overworld');
   /*await world.tickingAreaManager.createTickingArea('test', {
      dimension,
      from: { x: 0, y: 0, z: 0 },
      to: { x: 1, y: 1, z: 1 },
   });*/
   dimension.runCommand('tickingarea add circle 0 0 0 1 test');

   while (true) {
      const block = dimension.getBlock({ x: 0, y: 0, z: 0 });
      if (block) break;
      // oxlint-disable-next-line no-await-in-loop
      await system.waitTicks(10);
      console.log('Checking for blocks');
   }

   console.log('Running JOB');
   system.runJob(
      (function* (): Generator<void> {
         //#region Blocks
         {
            const blocks: BlockMetadata[] = [];
            // oxlint-disable-next-line typescript/no-non-null-assertion
            const block = dimension.getBlock({ x: 0, y: 0, z: 0 })!;
            for (const type of BlockTypes.getAll()) {
               const bp = BlockPermutation.resolve(type.id);
               block.setPermutation(bp);
               const states = bp.getAllStates();
               const statesNames = Object.keys(states);
               const states_record: BlockMetadata['sta'] = [];
               for (const p of statesNames) {
                  // oxlint-disable-next-line typescript/no-non-null-assertion
                  const state = BlockStates.get(p)!;
                  const indexes = [];
                  const validValues = state.validValues;
                  const valuesToTest =
                     typeof validValues[0] === 'number'
                        ? Math.max(16, state.validValues.length)
                        : state.validValues.length;
                  for (let i = 0; i < valuesToTest; i++) {
                     const value = typeof validValues[0] === 'number' ? i : validValues[i];
                     states[state.id] = value;
                     let permutation;
                     try {
                        permutation = bp.withState(state.id as 'color', value as string);
                     } catch (error) {
                        if (bp.type.id === 'minecraft:waxed_weathered_copper_chest') console.log(error);
                        continue;
                     }
                     /*
                     if (permutation.type.id === '...')
                        console.log(
                           validValues,
                           permutation.type.id !== bp.type.id,
                           permutation.getState(state.id as 'color') !== value,
                           JSON.stringify(bp.getAllStates()),
                           value,
                           validValues.length
                        );*/
                     if (permutation.getState(state.id as 'color') !== value) continue;
                     if (permutation.type.id !== bp.type.id) continue;
                     indexes.push(value);
                  }
                  if (indexes.length === 0) continue;
                  states_record.push({ name: state.id, valid_values: indexes as string[] });
                  yield;
               }

               const color = block.getMapColor();
               yield void blocks.push({
                  uid: type.id,
                  tgs: bp.getTags(),
                  com: block.getComponents().map(_ => _.typeId),
                  lid: type.localizationKey.length ? type.localizationKey : null,
                  sta: states_record,
                  mac:
                     (Number(color.alpha > 0.5) << 24) |
                     ((color.red * 255) << 16) |
                     ((color.green * 255) << 8) |
                     (color.blue * 255),
                  flg: [
                     block.isAir,
                     block.isLiquid,
                     block.isSolid,
                     bp.isLiquidBlocking(LiquidType.Water),
                     bp.canContainLiquid(LiquidType.Water),
                     bp.canBeDestroyedByLiquidSpread(LiquidType.Water),
                     bp.liquidSpreadCausesSpawn(LiquidType.Water),
                  ]
                     .map(_ => Number(_))
                     .reduce((_, _1, i) => _ | (_ << i)),
                  //lts: manager.generateLootFromBlock(block)?.map(_ => _.typeId),
               } as BlockMetadata);
            }

            // Post blocks
            yield void http.request(
               new HttpRequest(LOCAL_DOMAIN + WRITE_FILE + `?name=${VANILLA_BLOCK_TYPES_FILE_NAME}`)
                  .setMethod(HttpRequestMethod.Post)
                  .setBody(
                     JSON.stringify(
                        blocks.sort((a, b) => a.uid.localeCompare(b.uid)),
                        null,
                        2
                     )
                  )
            );
         }
         //#endregion

         // Clean-up
         yield void http.request(
            new HttpRequest(LOCAL_DOMAIN + CLOSE_COMMAND).setMethod(HttpRequestMethod.Head)
         );
      })()
   );
});
