import { readFileSync } from 'node:fs';

import { Cursor, NBT_NETWORK_VARIANT_FORMAT_READER, readRootSync } from '@carolina/binary';

import blocks from '../../../tools/data/vanilla-block-types.json' with { type: 'json' };
import { InternalAccess } from '../abstraction/types';
import { BlockRegistry } from './block-registry';
import { __BLOCK_STATE__ } from './block-state';
import { __BLOCK_TYPE__, BlockType } from './block-type';

export const BlockTypes = new BlockRegistry();

//#region BlockTypes
{
   for (const block_type of blocks) {
      const blockState = new __BLOCK_TYPE__(block_type.uid);

      (blockState as InternalAccess<BlockType>).states = block_type.sta.map(
         _ => new __BLOCK_STATE__(_.name, typeof _.valid_values[0] as 'string', _.valid_values as string[])
      );
      //
      BlockTypes.register(blockState);
   }
   BlockTypes.finalize();
}
//#endregion

// Check correctness of permutation palette by loading canonical blocks nbt file from the project root
// and compare one by one until it breaks or success
{
   console.time('Parsing Canonicals');
   const nbtBuffer = readFileSync('P:\\Programming\\carolina\\canonical_block_states.nbt');
   //Ok
   const cursor = Cursor.create(nbtBuffer);
   const missingBlocks = new Set<string>();
   let i = 0;
   const lastNBT = [];
   while (!cursor.isEndOfStream) {
      const nbt = readRootSync<{ name: string; states: Record<string, unknown>; version: number }>(
         cursor,
         NBT_NETWORK_VARIANT_FORMAT_READER
      );
      lastNBT.push(nbt);

      if (BlockTypes.palette[i].type.id !== nbt.name) {
         console.log(BlockTypes.palette.slice(i - 5, i + 1));
         console.log(lastNBT.slice(-5));

         throw new ReferenceError(
            `Order miss_match for blocks ${BlockTypes.palette[i].type.id} != ${nbt.name} index:${i}`
         );
      }
      if (!BlockTypes.has(nbt.name)) {
         missingBlocks.add(nbt.name);
      }
      i++;
   }

   if (missingBlocks.size > 0) {
      console.log('Missing blocks from registry:', Array.from(missingBlocks).sort());
   } else {
      console.log('All blocks from NBT are present in registry!');
   }
   console.log(`Processed ${i} NBT entries.`);
   console.timeEnd('Parsing Canonicals');
}
