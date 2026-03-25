import { Cursor } from '@carolina/binary';
import { PacketIds, PacketType } from '@carolina/protocol';

import { NetworkPipeline } from './pipeline';

export interface NetworkPipelineSocket<S = unknown> {
   source: S;
   pipeline: NetworkPipeline<S>;
}
export class NetworkPipelineStack {
   protected readonly stack: NetworkPipelineSocket[] = [];
   public bound<S>(pipeline: NetworkPipeline<S>, source: S): void {
      this.stack.push({ pipeline: pipeline, source: source });
   }
   public release(pipeline: NetworkPipeline<unknown>): void {
      if (this.stack.length <= 0) return;
      const last = this.stack[this.stack.length - 1];
      if (last.pipeline !== pipeline)
         throw new ReferenceError(`Failed to release current pipeline stack as the pipelines doesn't equal.`);

      this.stack.pop();
   }
   public distribute(packetId: number, raw: Cursor): boolean {
      let packet: PacketType | null = null,
         handled = false,
         wasCanceled = false;

      // Walk trough pipelines
      // We want to call world first and then being more specific when needed
      for (let i = 0; i < this.stack.length && wasCanceled === false; i++) {
         const { pipeline, source } = this.stack[i];
         if (pipeline.canHandle(source, packetId)) {
            // If the packet wasn't deserialized yet, then run the deserialization and check for codec availability
            if (!(packet ??= pipeline.getPacketFromRaw(source, packetId, raw))) {
               pipeline.logger.error(
                  new ReferenceError(`No codec for packet ${PacketIds[packetId] ?? packetId}`)
               );
               return handled;
            }

            // Handle packet via this pipeline
            handled = true;
            const value = pipeline.handle(source, packetId, packet);
            if (value === true) wasCanceled = true;
         }
      }
      return handled;
   }
}
