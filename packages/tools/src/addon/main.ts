import { BlockPermutation, BlockTypes, LiquidType, system, world } from '@minecraft/server';
import { HttpRequest, HttpRequestMethod, http } from '@minecraft/server-net';

import { CLOSE_COMMAND, LOCAL_DOMAIN, WRITE_FILE } from '../constants';

world.afterEvents.worldLoad.subscribe(async () => {
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
            const blocks = [];
            // oxlint-disable-next-line typescript/no-non-null-assertion
            const block = dimension.getBlock({ x: 0, y: 0, z: 0 })!;
            for (const type of BlockTypes.getAll()) {
               const bp = BlockPermutation.resolve(type.id);
               block.setPermutation(bp);
               const color = block.getMapColor();
               yield void blocks.push({
                  id: type.id,
                  tags: bp.getTags(),
                  components: block.getComponents().map(_ => _.typeId),
                  map_color:
                     (Number(color.alpha > 0.5) << 24) |
                     ((color.red * 255) << 16) |
                     ((color.green * 255) << 8) |
                     (color.blue * 255),
                  flags: [
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
               });
               console.log(bp.type.id);
            }

            // Post blocks
            yield void http.request(
               new HttpRequest(LOCAL_DOMAIN + WRITE_FILE + `?name=data/block-type-info.json`)
                  .setMethod(HttpRequestMethod.Post)
                  .setBody(JSON.stringify(blocks, null, 3))
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
