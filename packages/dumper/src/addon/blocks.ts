import { BlockComponentTypes, BlockPermutation, BlockTypes, Dimension, LiquidType } from '@minecraft/server';

const componentTypes = Object.values(BlockComponentTypes);
export function* generateBlockObject(dimension: Dimension): Generator<void, object, void> {
   const general: any = {};
   for (const blockType of BlockTypes.getAll()) {
      const defaultPermutation = BlockPermutation.resolve(blockType.id);
      const obj: any = {
         id: blockType.id,
         isLiquidBlocking: defaultPermutation.isLiquidBlocking(LiquidType.Water),
         canBeDestroyedByLiquidSpread: defaultPermutation.canBeDestroyedByLiquidSpread(LiquidType.Water),
         canContainLiquid: defaultPermutation.canContainLiquid(LiquidType.Water),
         liquidDestroyCausesDrop: defaultPermutation.liquidSpreadCausesSpawn(LiquidType.Water),
         tags: defaultPermutation.getTags().map(e => (e.startsWith('minecraft:') ? e : 'minecraft:' + e)),
      };
      dimension.setBlockPermutation({ x: 0, y: 0, z: 0 }, defaultPermutation);
      const block = dimension.getBlock({ x: 0, y: 0, z: 0 });
      obj.isSolid = block?.isSolid;
      obj.isLiquid = block?.isLiquid;
      obj.isAir = block?.isAir;
      obj.redstonePower = block?.getRedstonePower();
      obj.color = block?.getMapColor();
      obj.components = componentTypes.map(e => (block?.getComponent(e) ? e : null)).filter(_ => _);
      // Add components later on
      general[blockType.id] = obj;
      yield;
   }
   return general;
}
