import { Cursor } from '@carolina/binary';
import { Logger, Pipeline } from '@carolina/common';
import {
   PROTOCOL,
   InternalPacketPipelineMethods,
   LoginPacket,
   PacketCodecType,
   PacketType,
} from '@carolina/protocol';

export interface NetworkPipelineResolution<T = unknown> {
   pipeline: NetworkPipeline<T>;
   source: T;
}
// oxlint-disable-next-line typescript/no-unsafe-declaration-merging no-unused-vars
export abstract class NetworkPipeline<S> extends Pipeline {
   public readonly logger: Logger;
   protected constructor(logger: Logger) {
      super();
      this.logger = logger;
   }
   public getPacketCodec(source: S, packetId: number): PacketCodecType | null {
      return PROTOCOL[packetId as unknown as 1] ?? null;
   }
   public getPacketFromRaw(source: S, packetId: number, raw: Cursor): PacketType | null {
      const codec = this.getPacketCodec(source, packetId);
      if (!codec) return null;
      return codec.deserialize(raw);
   }
   public canHandle(source: S, packetId: number): boolean {
      return packetId in this;
   }
   public handle(source: S, packetId: number, packet: PacketType): boolean {
      return this[packetId as 1]?.(source, packet as LoginPacket) ?? false;
   }
}

export interface NetworkPipeline<S> extends InternalPacketPipelineMethods<S, boolean | void> {}
